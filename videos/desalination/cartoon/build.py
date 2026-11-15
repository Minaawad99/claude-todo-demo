"""Builds the cartoon-panel version of «تعمل محطة تحلية إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["جردل", "فلتر", "محطة", "تحلية؟"], 1: ["الملح", "دايب"], 2: ["غشاء", "مليون", "مرة،"], 3: ["لوحدها،", "المالح."], 4: ["طلمبة", "ستين", "ضغط", "جوي."],
     5: ["ستمية", "متر", "التناضح", "العكسي."], 6: ["رمل", "وطحالب", "وقناديل،"], 7: ["ماسورة", "مصفاة."], 8: ["فلاتر", "رمل"], 9: ["كهربا", "مصروف"],
     10: ["نص", "بس"], 11: ["مالح", "الضغط", "العالي"], 12: ["استرجاع", "الطاقة،"], 13: ["تسعين", "في", "المية"], 14: ["الضعف", "السمك", "والشعاب."],
     15: ["ماسورة", "طويلة", "فتحات"], 16: ["نقية", "ماسخ", "المواسير."], 17: ["حجر", "جيري", "كلور"], 18: ["بنغلي"], 19: ["بالضغط", "غلي."],
     20: ["وألف", "لتر", "تلاتة", "كيلو", "وات", "ساعتين."], 21: ["خزان", "وطلمبات", "ومعمل"], 22: ["ومبروك،", "محطة", "تحلية."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
