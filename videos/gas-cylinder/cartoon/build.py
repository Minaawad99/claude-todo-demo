"""Builds the cartoon-panel version of «أوعى تقلب الأنبوبة!»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["استنى!", "أوعى", "تقلبها", "جنبها."], 1: ["آخر", "شوية", "يولّع", "المطبخ."], 3: ["لسايل", "ضغط."], 4: ["السايل", "طبقة", "غاز"],
     5: ["بيغلي", "البلف"], 6: ["والمنظم", "للغاز", "للسايل."], 7: ["عدل،", "هادية", "وزرقا."], 8: ["قلبتها", "جنبها؟", "البلف"], 9: ["سايل", "المنظم", "والخرطوم."],
     10: ["بميتين", "مرة", "وأكتر."], 11: ["نقطة", "صغيرة", "سحابة", "ثانية."], 12: ["تعلى", "فجأة", "صفرا"], 13: ["بيبرد", "جامد", "تلج"],
     14: ["جلدة", "المنظم", "ويشققهم."], 15: ["شق", "بيهرب"], 16: ["أتقل", "الهوا،", "الأرض."], 17: ["شرارة", "واحدة", "المصيبة."],
     18: ["بتضعف"], 19: ["ببطء،", "فالضغط", "يقل"], 20: ["تغيّرها،", "تقلبها", "ترجّها", "سخنة."], 21: ["ريحة", "اقفل", "البلف", "الشبابيك."],
     22: ["نور،", "شرارة", "خطر."], 23: ["مية", "بصابون،", "كبريت", "ولاعة"], 24: ["عدل،", "تهوية،", "النار."], 25: ["شارك", "ينقذ", "بيت."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
