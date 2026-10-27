"""Builds index.html for «إزاي الغواصة بتنزل وتطلع؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي الغواصة بتنزل وتطلع؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("آلاف الأطنان.", "heat")], 1: [("بتعوم", "water"), ("وتطلع تاني!", "water")], 2: [("مية،", "water"), ("وهوا.", "part")], 4: [("بتزقها لفوق.", "water")], 5: [("وزن المية", "water")],
     6: [("تعوم،", "water"), ("تغطس.", "heat")], 7: [("خزانات الاتزان.", "water")], 8: [("مليانة هوا،", "part")], 9: [("فتحات صغيرة", "part"), ("الهوا يطلع.", "water")], 10: [("من تحت،", "water")],
     11: [("تتقل،", "heat"), ("تغطس.", "heat")], 12: [("أجنحة صغيرة", "part")], 13: [("نص المية،", "water")], 14: [("شوية بشوية.", "water")], 15: [("بالظبط،", "water"), ("واقفة مكانها.", "water")],
     16: [("الضغط", "heat")], 17: [("10 متر", "heat")], 18: [("30 مرة!", "heat")], 19: [("حديد تخين", "part"), ("مدوّر", "part")], 20: [("بتطلع", "water")], 21: [("هوا مضغوط", "part")],
     22: [("لبرة", "water")], 23: [("فتطلع", "water")], 24: [("مية تدخل تنزل،", "heat"), ("هوا يدخل تطلع.", "water")]}
NUM = {"عشرة متر": "10 متر", "تلاتمية متر": "300 متر", "تلاتين مرة": "30 مرة"}
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
PL = [4, 5, 6, 17, 18, 19, 21, 24]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 25)))
body = body.replace("<!--CAPS_OUT-->", caps(range(25, 26), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
