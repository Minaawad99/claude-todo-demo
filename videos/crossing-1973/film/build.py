"""Builds «العبور» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["ستة", "أكتوبر"], 2: ["جبل", "رملي"], 3: ["قنبلة", "ذرية"], 4: ["بمية", "القناة"], 5: ["اتنين", "الضهر،"], 6: ["ساعة", "بساعة."],
     7: ["تلاتة", "الفجر،"], 10: ["قصب،"], 11: ["مقصود…"], 13: ["ستة", "المغرب."], 14: ["ستة", "المغرب."], 16: ["نفتح"],
     18: ["باقي", "زكي", "يوسف"], 19: ["السد", "العالي،"], 21: ["بالمية."], 23: ["تلتمية", "تجربة،"], 24: ["مضخات", "مية"],
     26: ["ميتين", "طيارة"], 27: ["ألفين", "مدفع"], 28: ["الشمس"], 29: ["بأربع", "ساعات."], 30: ["قوارب", "مطاط"], 31: ["تخيّل"],
     32: ["سبع", "أدوار."], 33: ["الله", "أكبر."], 35: ["يسيح."], 37: ["ستين", "ثغرة"], 38: ["مية", "القناة."], 39: ["فطروا"],
     40: ["الكباري"], 41: ["فكرته"], 43: ["اتفتحت"], 45: ["بعين", "تانية."], 46: ["حكاية", "إيه"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
