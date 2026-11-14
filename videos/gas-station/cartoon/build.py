"""Builds the cartoon-panel version of «تعمل بنزينة إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["برميل", "بنزين", "بنزينة؟"], 1: ["أربع", "عربيات،", "وشرارة"], 2: ["خزان", "حديد", "أربعين", "ألف", "لتر."], 3: ["بيصدّي", "يسرّب"],
     4: ["ولتر", "مليون", "لتر", "الجوفية."], 5: ["جدارين،", "حساس"], 6: ["البخار"], 7: ["ماسورة", "تهوية،", "أربعة", "متر،"], 8: ["تحت", "فوق."],
     9: ["طلمبة", "غاطسة", "المكنة."], 10: ["أربعين", "لتر", "الدقيقة."], 11: ["يتملي", "ويدلق"], 12: ["المسدس", "خرم", "صغير"], 13: ["يفصل", "لوحده،"],
     15: ["يمشي", "والمسدس"], 16: ["وصلة", "بتتفك", "وتقفل"], 17: ["خبطت", "صمام"], 18: ["المطر", "للمجاري."], 19: ["خرسانة", "مايلة", "بيفصل"],
     20: ["الموبايل"], 21: ["ولا", "حريقة", "موبايل."], 22: ["الكهربا", "الاستاتيكية،", "ميه", "وخمسين"], 23: ["مظلة", "وطفايات", "وزرار", "طوارئ"],
     24: ["ومبروك،", "بنزينة."], 14: ["فيديوهات", "البايو."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
