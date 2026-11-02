"""Builds the cartoon-panel version of «تعمل آلة آيس كريم إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["لبن", "وكريمة", "وسكر", "الفريزر،", "آيس", "كريم؟"], 1: ["بلورات", "تلج", "ناشفة."], 2: ["جردل", "تلج", "وملح،", "سالب", "عشرين."], 3: ["ريشة", "تكشط"], 4: ["الداشر."],
     5: ["نص", "ساعة"], 6: ["موتور", "ماسورة", "تبريد."], 7: ["وكمبروسر", "الفريون،", "أسطوانة", "التجميد."], 8: ["تفضى،", "هتستنى"], 9: ["خزان", "الهوبر،"], 10: ["تقيل", "الطوبة."],
     11: ["هوا", "تلت"], 12: ["منين", "جهز؟"], 13: ["بالموتور،", "كهربا", "أكتر."], 14: ["التبريد", "لوحده."], 15: ["الغريبة؟", "سالب", "ست", "درجات"], 16: ["أدفى", "بتلاتاشر", "طري."],
     17: ["مقبض،", "صمام،", "نجمة."], 18: ["جنة", "للجراثيم."], 19: ["لستة", "وستين", "نص", "ساعة،"], 20: ["بايظة."], 21: ["بتطبخ", "نفسها،", "أربع", "ساعات."], 22: ["أربعتاشر", "يوم،", "بتقفل"],
     23: ["صينية", "وكونز،", "شوكولاتة."], 24: ["ومبروك،", "آيس", "كريم", "سوفت."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
