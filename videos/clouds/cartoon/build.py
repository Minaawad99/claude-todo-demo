"""Builds the cartoon-panel version of «السحابة وزنها كام؟ وإزاي مش بتقع؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["السحابة"], 1: ["مية", "فيل."], 2: ["وعايمة", "بتقع."], 4: ["كيلو", "كيلو."], 5: ["نص", "جرام"], 6: ["خمسمية", "طن", "فيل."],
     7: ["الوزن", "بيقع؟"], 8: ["قاعدة"], 9: ["تصغر،", "بيفرملها"], 10: ["متفتتة", "مليارات"], 11: ["عشرين", "ميكرون،", "شعرة"],
     12: ["ببطء", "سنتي", "واحد", "التراب"], 13: ["طالع."], 14: ["الدافي", "أسرع", "ويشيلها"], 15: ["مليون", "طن."], 16: ["واحد", "على", "ألف"],
     17: ["تخبط", "وتكبر."], 18: ["مليون"], 19: ["مطر."], 20: ["بخار", "لأ."], 21: ["شفاف", "سايلة", "تلج."],
     22: ["تقيلة،", "صغيرة،", "الطالع"], 23: ["العاصفة", "مليون", "طن"], 24: ["السحاب."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
