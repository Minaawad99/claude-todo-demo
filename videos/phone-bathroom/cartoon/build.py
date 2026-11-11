"""Builds the cartoon-panel version of «إزاي المونوريل بيمشي على قضيب واحد؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الموبايل"], 1: ["بتعمل", "فيك"], 2: ["بيطلع"], 4: ["بيسرق", "وقتك"], 5: ["ربع", "ساعة."], 6: ["سبعة", "وتلاتين", "خمس", "دقايق."],
     7: ["سبعة"], 9: ["مفتوح"], 10: ["والدم", "بيتجمّع"], 11: ["البواسير."], 12: ["بستة", "وأربعين"], 13: ["منمّلة."], 14: ["الأقرف."],
     15: ["السيفون", "نافورة"], 16: ["بالليزر،", "الصاروخ."], 17: ["لمتر", "ونص", "تمن", "ثواني"], 18: ["الرذاذ"], 19: ["واحد", "ستة", "البراز."],
     20: ["السفرة،", "الإيد."], 21: ["لبُقّك", "خطوتين."], 22: ["برّه،", "الغطا", "وامسح"], 23: ["خمس", "دقايق"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
