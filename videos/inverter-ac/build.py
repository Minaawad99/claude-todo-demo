"""Builds index.html for «إزاي التكييف الإنفرتر بيوفر كهربا؟» (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي التكييف الإنفرتر بيوفر كهربا؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("الإنفرتر", "water")], 1: [("لحد التلت!", "water")], 2: [("موتور واحد", "part")], 4: [("رحلة التلاجة", "water")], 5: [("غاز التبريد", "water")],
     6: [("بيسحب الحرارة", "heat")], 7: [("بيرميها في الشارع", "heat")], 8: [("الكمبروسر", "part")], 9: [("معظم كهربا التكييف", "heat")],
     10: [("على آخره", "heat"), ("واقف خالص", "part")], 11: [("24", "water"), ("يفصل", "part")], 12: [("على آخره", "heat")], 13: [("تلات أربع أضعاف", "heat")],
     14: [("النور بيرعش", "heat")], 15: [("بوردة إلكترونية ذكية", "part")], 16: [("بتغيّر الكهربا", "part")], 17: [("أسرع", "heat"), ("أبطأ", "water")],
     18: [("بسرعة", "heat")], 19: [("يهدّي", "water")], 20: [("على مهله", "water")], 21: [("من غير ما يقف", "water")], 22: [("بنزين كتير", "heat")],
     23: [("سرعة ثابتة", "water"), ("تصرف أقل", "water")], 24: [("درجة ثابتة", "water")], 25: [("1981", "part")], 26: [("ساعات طويلة", "part")],
     27: [("الفرق هيبقى صغير", "part")], 28: [("بيبطّل يقوم ويقعد", "water")]}
NUM = {"أربعة وعشرين": "24", "ألف تسعمية واحد وتمانين": "1981"}
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
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 29)))
body = body.replace("<!--CAPS_OUT-->", caps(range(29, 30), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
