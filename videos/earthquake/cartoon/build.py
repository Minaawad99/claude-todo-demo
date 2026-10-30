"""Builds the cartoon-panel version of «إزاي الزلزال بيحصل؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["بتتحرك", "مش", "حاسس!"], 1: ["فجأة", "بتتهز؟"], 2: ["مصر", "تركيا؟"], 4: ["رفيعة", "التفاحة"], 5: ["خمستاشر", "لوح"], 6: ["سخن", "ببطء"],
     7: ["سنتي", "ضافرك"], 8: ["لوحين", "احتكاك."], 9: ["بيعلق", "سنين."], 10: ["مسطرة", "تتكسر."], 11: ["يزحلق،", "الطاقة"], 12: ["موجات،", "حجر"],
     13: ["سريعة", "بتزق"], 14: ["خبطة", "الكلاب"], 15: ["أبطأ", "يمين", "وشمال."], 16: ["السطح،", "بتوقّع"], 17: ["والفرق", "بعيد"], 18: ["الموبايل", "ينبهك"],
     19: ["بمقياس،", "اتنين", "وتلاتين"], 20: ["سبعة", "ستة", "اتنين", "وتلاتين"], 21: ["شيلي", "تسعة", "ونص."], 22: ["مصر،", "اتنين", "وتسعين"], 23: ["العالية", "بتتمرجح"],
     24: ["ضغط", "ثواني."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
