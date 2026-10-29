"""Builds index.html for «إزاي المكنسة الذكية بتشتغل؟» (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي المكنسة الذكية بتشتغل؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("حافظاها أحسن منك!", "water")], 1: [("حرف السلم", "heat"), ("السجادة", "part")], 2: [("للشاحن لوحدها", "water")], 4: [("بيلف على طول", "heat")], 5: [("ليزر", "heat")],
     6: [("آلاف المرات في الثانية!", "heat")], 7: [("خريطة لشقتك", "water")], 8: [("بيعد اللفات", "part")], 9: [("الشفاط", "water")], 10: [("الليزر مشافهاش؟", "heat")],
     11: [("إكصدام", "part")], 12: [("تلف من جنبها", "water")], 13: [("ليه مبتقعش؟", "heat")], 14: [("حساسات", "part")], 15: [("سلم", "heat")],
     16: [("اتحشرت", "heat")], 17: [("الحقني!", "heat")], 18: [("حكاية تانية", "part")], 19: [("صوت إحنا مبنسمعوش", "water")],
     20: [("قوي", "water"), ("ضعيف", "heat")], 21: [("من غير ما تشوفها", "water")], 22: [("شراشيب", "part"), ("تحبسها", "heat")], 23: [("على الخريطة", "water")],
     24: [("والشاحن؟", "water")], 25: [("20٪", "heat")], 26: [("الأشعة تحت الحمرا", "heat"), ("فنار صغير", "water")], 27: [("بالظبط", "water")],
     28: [("نفس النقطة", "water")], 29: [("ومبتنساش حاجة", "water")]}
NUM = {"عشرين في المية": "20٪"}
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
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 30)))
body = body.replace("<!--CAPS_OUT-->", caps(range(30, 31), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
