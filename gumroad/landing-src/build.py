"""يبني صفحة Gumroad المخصصة (../landing.html) من template.html: الصور جوه الملف، والشخصيات من دوال الحزمة، والخط العربي مقصوص على الحروف المستخدمة.
python3 build.py   (محتاج: pip install fonttools brotli، و node لرسم الشخصيات)"""
import base64, io, json, os, re, subprocess
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

H = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(H, "..", "kit", "eh-elhekaya-animation", "engine", "fonts")
tpl = open(os.path.join(H, "template.html"), encoding="utf-8").read()

subprocess.run(["node", os.path.join(H, "chars.js")], cwd=H, check=True)
chars = json.load(open(os.path.join(H, "chars.json"), encoding="utf-8"))
tpl = re.sub(r"\{\{CHAR:(\w+)\}\}", lambda m: chars[m.group(1)], tpl)
tpl = re.sub(r"\{\{IMG:(\w+)\}\}", lambda m: "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(H, "img", m.group(1) + ".jpg"), "rb").read()).decode(), tpl)

text = set(re.sub(r"data:image/[^\"]+", "", tpl))
def face(src, codepoints):
    f = TTFont(os.path.join(FONTS, src), lazy=False)
    o = Options(); o.layout_features = ["*"]; o.name_IDs = ["*"]; o.notdef_outline = True
    s = Subsetter(o); s.populate(unicodes=codepoints); s.subset(f)
    f = instancer.instantiateVariableFont(f, {"wght": (500, 900)})
    b = io.BytesIO(); f.flavor = "woff2"; f.save(b); return b.getvalue()
arabic = {ord(c) for c in text if 0x0600 <= ord(c) <= 0x06FF or 0xFB50 <= ord(c) <= 0xFEFF} | {0x0640, 0x060C, 0x061F, 0x066B, 0x066C, 0x200C, 0x200D}
latin = {ord(c) for c in text if 0x20 <= ord(c) <= 0x7E} | {0xD7, 0xB7, 0x2013, 0x2014, 0x2190, 0xAB, 0xBB, 0x2026}
ar, la = face("noto-sans-arabic-3.woff2", arabic), face("noto-sans-arabic-1.woff2", latin)
css = ""
for data, rng in ((la, "U+0000-00FF, U+00D7, U+2013-2026, U+2190"), (ar, "U+0600-06FF, U+200C-200D, U+FB50-FEFF")):
    css += "@font-face{font-family:'Kit Arabic';font-weight:500 900;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}\n" % (base64.b64encode(data).decode(), rng)
html = tpl.replace("{{FONT}}", "/* Noto Sans Arabic, SIL Open Font License 1.1 (subset) */\n" + css)
open(os.path.join(H, "..", "landing.html"), "w", encoding="utf-8").write(html)
print(f"landing.html: {len(html):,} حرف (الحد 500,000) — خط عربي {len(ar)//1024}KB، لاتيني {len(la)//1024}KB")
