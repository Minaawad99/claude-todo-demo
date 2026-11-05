"""Builds the cartoon-panel version of «ليه بنعطس؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["ثانية،"], 1: ["أسرع", "وأعقد"], 2: ["كده؟", "بالظبط؟"], 3: ["الحكاية؟", "دقيقة."], 4: ["الأنف."], 5: ["بطانة", "شعيرات"],
     6: ["جزيء", "أعصاب"], 7: ["ثلاثي", "التوائم."], 8: ["إنذار", "للمخ."], 9: ["جذع", "المخ."], 10: ["مركز", "للعطس."], 11: ["مزعجة", "تتطرد"],
     12: ["لعضلات", "والبطن."], 13: ["شهيق", "هوا"], 14: ["المزمار", "جامد."], 15: ["بتقبض", "فجأة."], 16: ["مية", "وستين"], 17: ["أسرع", "السريع."],
     18: ["المخاط", "والجراثيم"], 19: ["العين", "أوتوماتيك"], 20: ["منعكس", "الضوء"], 21: ["بتتخلط", "المخ."], 22: ["غلط،", "عطسة."], 23: ["تمانية", "متر."],
     24: ["بنغطي", "إيدينا"], 25: ["بيحمي", "مزعجة،"], 26: ["عايزين", "الجاية؟"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
