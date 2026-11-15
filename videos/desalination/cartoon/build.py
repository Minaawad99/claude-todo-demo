"""Builds the cartoon-panel version of «تعمل محطة تحلية إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["غليت", "البخار", "محطة", "تحلية؟"], 1: ["ألف", "لتر", "سبعمية", "كيلو", "وات"], 2: ["غشاء", "مليون", "مرة."], 3: ["بيعدّي", "ويحجز", "الملح"], 4: ["لوحدها،", "المالح."], 5: ["طلمبة", "ستين", "ضغط", "جوي."],
     6: ["ستمية", "متر", "التناضح", "العكسي."], 7: ["رمل", "وطحالب", "وقناديل،"], 8: ["ماسورة", "مصفاة."], 9: ["فلاتر", "رمل"], 10: ["كهربا", "مصروف"],
     11: ["نص", "بس"], 12: ["مالح", "الضغط", "العالي"], 13: ["استرجاع", "الطاقة،"], 14: ["تسعين", "في", "المية"], 15: ["الضعف", "السمك", "والشعاب."],
     16: ["ماسورة", "طويلة", "فتحات"], 17: ["نقية", "ماسخ", "المواسير."], 18: ["حجر", "جيري", "كلور"], 19: ["كهربا", "خرافية."],
     20: ["ألف", "لتر", "تلاتة", "كيلو", "وات", "ساعتين."], 21: ["ميتين", "مرة،", "بالضغط."], 22: ["خزان", "وطلمبات", "ومعمل"], 23: ["ومبروك،", "محطة", "تحلية."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
