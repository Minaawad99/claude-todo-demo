"""Builds the cartoon-panel version of «كهربا تحت البحر الأحمر!»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مصر", "السعودية", "كهربا،", "كهربا؟"], 1: ["البحر", "الأحمر", "كابل"], 3: ["تلات", "آلاف", "ميجاوات."], 4: ["ناخد", "ياخدوا"],
     5: ["وقت", "الذروة"], 6: ["الضهر،", "والتكييفات"], 7: ["بالليل،", "وتنور."], 8: ["تلات", "لست", "ساعات،", "تسلّف"], 9: ["خمسين", "هيرتز،", "ستين،"],
     10: ["لتيار", "مستمر،", "تردد"], 11: ["إتش", "في", "دي", "سي،", "خمسمية", "كيلوفولت."], 12: ["محطة", "بدر،", "القاهرة."], 13: ["محطة", "تحويل", "ضخمة"],
     14: ["أبراج", "سينا", "خليج", "العقبة."], 15: ["أصعب", "البحر."], 16: ["اتنين", "وعشرين", "كيلومتر،"], 17: ["عازلة", "وتسليح", "حديد،"],
     18: ["مستمر", "بيضيع"], 19: ["تبوك،", "المدينة", "المنورة."], 20: ["متردد", "بستين", "هيرتز."], 21: ["ألف", "وتلتمية", "وخمسين", "كيلومتر،"],
     22: ["مليار", "وتمنمية", "مليون", "دولار،", "ألفين", "واتناشر."], 23: ["مرحلتين،", "ألف", "وخمسمية"], 24: ["الاختبارات", "نص", "نوفمبر."], 25: ["لسوق", "كهربا", "عربية"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
