"""Builds index.html for «إزاي التلاجة بتبرّد؟» (إيه الحكاية؟).
Takes the base page styles from the dishwasher episode, adds the fridge's 3D parts, and writes the
captions from script.txt with keywords coloured by meaning (heat red, cold/air blue, parts green)."""
import os, re, html
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")]
head = head.replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي التلاجة بتبرّد؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]

K = {0: [("مفيهاش أي حاجة بتعمل برد", "heat")], 1: [("المطبخ هيسخن أكتر!", "heat")], 2: [("بتشيل الحرارة", "heat"), ("وترميها برة", "heat")],
     4: [("غاز التبريد", "water")], 5: [("سالب اتناشر درجة!", "water")], 6: [("ساقع تلج", "water")], 7: [("بتسحب حرارة", "heat")],
     8: [("كحول", "water"), ("ساقعة", "water")], 9: [("مواسير مقفولة", "part")], 10: [("الكباس", "part")], 11: [("موتور صغير", "part")],
     12: [("يسخن جدًا", "heat")], 13: [("منفاخ العجلة", "part"), ("بيسخن", "heat")], 14: [("المكثف", "heat")], 15: [("دافية", "heat")],
     16: [("بيرمي حرارته", "heat")], 17: [("بيتحول لسائل", "part")], 18: [("ماسورة رفيعة جدًا", "part")], 19: [("الضغط بيقع فجأة", "water")],
     20: [("ساقع جدًا", "water")], 21: [("المبخر", "water")], 22: [("بيسحب الحرارة", "heat")], 23: [("مروحة صغيرة", "part"), ("الهوا البارد", "water")],
     24: [("يرجع للكباس", "part")], 25: [("من جوه", "water"), ("من ورا", "heat")], 26: [("سنين", "part")], 27: [("إمتى تقف؟", "part")],
     28: [("ترموستات", "heat")], 29: [("أربع درجات", "water"), ("يفصل الكباس", "part")], 30: [("سالب تمنتاشر", "water")], 31: [("يشغّله", "part")],
     32: [("كاوتش جواه مغناطيس", "part")], 33: [("المطبخ اللي بيسخن", "heat")], 34: [("حرارة الموتور", "heat")], 35: [("وتزوّد عليها!", "heat")],
     36: [("بتنقل الحر", "heat")]}
NUM = {"سالب اتناشر درجة!": "-12 درجة!", "أربع درجات": "4 درجات", "سالب تمنتاشر": "-18"}

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
        w2 = NUM.get(w, w)
        if w2 in t: t = t.replace(w2, f'<span class="tz-k tz-k--{c}">{w2}</span>', 1)
    return brk(t)

def caps(rng, style=""):
    return "\n".join(f'      <div class="cap" data-cap="{i}"{style}><p data-words="{i}">{cap_text(i)}</p></div>' for i in rng)

body = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
body = body.replace("<!--MARK-->", mark)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 37)))
body = body.replace("<!--CAPS_OUT-->", caps(range(37, 38), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
