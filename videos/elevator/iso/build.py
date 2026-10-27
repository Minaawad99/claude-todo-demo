"""Builds index.html for «إزاي الأسانسير مابيقعش؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي الأسانسير مابيقعش؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("20 دور.", "heat")], 1: [("اتقطع؟", "heat")], 2: [("لأ!", "heat"), ("4 حاجات", "water")], 4: [("مش متعلّق", "part")], 5: [("كذا حبل حديد،", "part")], 6: [("لوحده،", "water")], 7: [("شبه مستحيلة.", "water")],
     8: [("تقل حديد كبير.", "part")], 9: [("الفرق بس.", "water")], 10: [("فرامل،", "heat")], 11: [("يقف مكانه،", "water")], 12: [("بسرعة؟", "heat")], 13: [("منظّم السرعة.", "heat")], 14: [("بحبل لوحدها.", "heat")],
     15: [("أتقال صغيرة،", "part")], 16: [("قفل،", "heat")], 17: [("ذراع", "part")], 18: [("فكوك حديد،", "heat"), ("القضبان", "part")], 19: [("متر أو اتنين", "water")], 20: [("1854!", "heat")], 21: [("وقفت!", "water")],
     22: [("سوست كبيرة،", "water")], 23: [("أربع طبقات أمان،", "water")]}
NUM = {"عشرين دور": "20 دور", "أربع حاجات": "4 حاجات", "ألف تمنمية أربعة وخمسين": "1854"}
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
PL = [7, 9, 15, 16, 20, 21, 23]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 24)))
body = body.replace("<!--CAPS_OUT-->", caps(range(24, 25), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
