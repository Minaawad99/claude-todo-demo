"""Builds index.html for «إزاي المايكروويف بيسخن الأكل؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي المايكروويف بيسخن الأكل؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("سخن نار.", "heat")], 1: [("من غير نار ولا سخان؟", "part")], 2: [("شرار؟", "heat")], 4: [("الجزيئات.", "water")], 5: [("تتهز أسرع", "heat"), ("بتسخن.", "heat")],
     6: [("مليانين مية.", "water")], 7: [("موجب", "water"), ("سالب،", "heat"), ("مغناطيس صغير.", "part")], 8: [("إبرة البوصلة:", "part"), ("ناحية الكهربا.", "water")],
     9: [("ألفين وأربعمية وخمسين مليون مرة", "heat")], 10: [("يلف معاها رايح جاي،", "water")], 11: [("أكل أسخن.", "heat")], 12: [("المغنطرون،", "heat"), ("ماسورة معدن", "part")],
     13: [("تخبط في الحيطان،", "part"), ("الأكل يشربها.", "water")], 14: [("سخنة", "heat"), ("باردة.", "water")], 15: [("بتلف", "part")], 16: [("بيعكس الموجات،", "part"), ("شرار.", "heat")],
     17: [("سنتيمتر أو اتنين", "heat")], 18: [("استنى دقيقة", "heat")], 19: [("بالصدفة،", "heat")], 20: [("بيرسي سبنسر", "part"), ("الشوكولاتة ساحت", "heat")],
     21: [("حبات فشار،", "part")], 22: [("قد الراجل،", "part"), ("تلتمية وأربعين كيلو!", "heat")], 23: [("المغنطرون", "heat"), ("الحيطان", "part"), ("تتهز وتسخن.", "water")]}
NUM = {}
def brk(t):
    if len(t) < 34: return t
    best = None
    for m in re.finditer("،", t):
        if m.start() > len(t) * 0.3 and (best is None or abs(m.start() - len(t) / 2) < abs(best - len(t) / 2)): best = m.start()
    return t if best is None else t[:best + 1] + "<br>" + t[best + 1:].lstrip()
def cap_text(i):
    t = lines[i]
    for a, b in NUM.items(): t = t.replace(a, b)
    for w, c in K.get(i, []):
        if w in t: t = t.replace(w, f'<span class="tz-k tz-k--{c}">{w}</span>', 1)
    return brk(t)
def caps(rng, style=""):
    return "\n".join(f'      <div class="cap" data-cap="{i}"{style}><p data-words="{i}">{cap_text(i)}</p></div>' for i in rng)
body = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("<!--MARK-->", mark)
PL = [4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21, 22]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 24)))
body = body.replace("<!--CAPS_OUT-->", caps(range(24, 25), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
