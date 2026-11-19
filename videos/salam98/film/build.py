"""Builds «عبّارة السلام 98» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {23: "احنا نزلنا 20 درجة دلوقتي يا جماعة… المركب هتقلب!"}
K = {0: ["بتغرق"], 1: ["حقيقي…", "الأسود"], 2: ["اتنين", "فبراير"], 3: ["ألف", "وأربعمية"], 4: ["مصريين…", "وحجاج"], 5: ["المية", "النار؟"], 6: ["استغاثة"], 7: ["ساعة", "بساعة."],
     8: ["ضبا", "ميتين", "وعشرين"], 9: ["إيطاليا", "وتلاتين"], 10: ["أعلى"], 11: ["سفاجا."], 12: ["نار."], 13: ["وترجع"], 14: ["صرف"], 15: ["مسدودة."], 16: ["افتكروا"],
     17: ["تتجمع", "مفتوحة،"], 18: ["صينية", "واحدة."], 19: ["قريبة…", "كملت"], 20: ["اليمين"], 21: ["هدّوا", "الناس."], 22: ["بساعة،"], 23: ["20", "هتقلب!"], 24: ["شمال!"],
     25: ["تخيّل", "بتميل"], 26: ["خايفين"], 27: ["البايو."], 29: ["واحدة", "ونص،", "ونزلت."], 30: ["غرقت"], 31: ["آخر"], 32: ["استغاثة."], 33: ["أوتوماتيك،"],
     34: ["اسكتلندا.", "لفرنسا،", "لمصر."], 35: ["الضلمة"], 36: ["وماراحتش"], 37: ["ساعات", "طويلة."], 38: ["تلتمية", "تمانية", "وتمانين"], 39: ["ألف"],
     40: ["سفاجا،", "كشف."], 41: ["الأسود"], 42: ["مية", "النار."], 43: ["براءة", "بسبع", "سنين"], 44: ["بست", "شهور،"], 45: ["ألف", "بيت"], 46: ["حكاية", "إيه"]}
data = []
for i, l in enumerate(lines):
    ws = CAPTEXT.get(i, l).split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    k = [w in K.get(i, []) for w in ws]
    if T["lines"][i].get("clip"): ws = ["«" + ws[0]] + ws[1:]; ws[-1] += "»"
    data.append({"w": ws, "k": k})
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
