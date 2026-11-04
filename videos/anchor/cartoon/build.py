"""Builds the cartoon-panel version of «إزاي المرساية الصغيرة بتمسك سفينة عملاقة؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["تلتمية", "ألف", "عشرين", "طن"], 1: ["خمستاشر", "ألف"], 2: ["حديد", "الجبل"], 4: ["مش", "بتشيل", "الهوا", "والتيار."], 5: ["المحراث:", "مخلبين،", "يغرزوا"],
     6: ["تغرز", "أكتر", "نايم"], 7: ["السلسلة:", "تلتمية", "مية", "طن."], 8: ["القاع،", "نايم،", "غارزة."], 9: ["فوقها", "بالظبط،", "بسهولة."], 10: ["العاصفة", "تتجر"],
     11: ["خط", "غاز", "فنلندا", "وإستونيا."], 12: ["غارزة،", "تقيلة", "نايمة"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
