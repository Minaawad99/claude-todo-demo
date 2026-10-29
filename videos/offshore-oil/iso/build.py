"""Builds index.html for «إزاي بيطلّعوا النفط من المحيط؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي بيطلّعوا النفط من المحيط؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("البنزين", "heat"), ("قاع المحيط.", "water")], 1: [("كيلو،", "water"), ("كيلوهات تانية!", "part")], 2: [("مكانه؟", "part"), ("بيطلّعوه", "heat")],
     4: [("ملايين السنين،", "part"), ("كائنات بحرية صغيرة", "part")], 5: [("الحرارة والضغط", "heat"), ("لنفط.", "heat")], 6: [("مش بحيرة،", "heat"), ("مليان مسام،", "part"), ("زي الإسفنجة.", "part")],
     7: [("صخر ناشفة،", "part"), ("زي الغطا.", "part")], 8: [("كابلات", "water"), ("كيلومترات.", "water")], 9: [("هوا مضغوط،", "part"), ("صوت قوي", "heat")], 10: [("ويرجع صداه", "water")],
     11: [("تلاتية الأبعاد", "part")], 12: [("قبة،", "heat"), ("محبوس تحتها.", "heat")], 13: [("سفينة حفر", "part"), ("منصة عايمة.", "part")], 14: [("مواسير حديد،", "part")],
     15: [("بريمة،", "part"), ("تروس مسننة", "part"), ("ألماظ صناعي،", "part")], 16: [("طين تقيل", "part")], 17: [("بيبرّد", "water"), ("فتافيت الصخر", "part"), ("ضغط البير.", "heat")],
     18: [("مانع الانفجار،", "heat"), ("في ثواني", "heat")], 19: [("لوحده.", "heat")], 20: [("بيضخوا مية", "water")], 21: [("سفينة إنتاج،", "part"), ("المية والغاز،", "water")],
     22: [("ناقلات عملاقة", "part"), ("معامل التكرير.", "heat")], 23: [("ملايين السنين!", "heat")]}
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
PL = [5, 6, 11, 15, 17, 18, 23]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 24)))
body = body.replace("<!--CAPS_OUT-->", caps(range(24, 25), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
