"""Builds the cartoon-panel version of «تعمل طيارة إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["جناحين", "طيارة؟"], 1: ["بسرعة", "كبيرة."], 2: ["الأنبوبة،", "جناحين", "ستة", "وتلاتين", "متر."], 3: ["لتحت،", "لفوق."],
     4: ["سبعين", "طن،", "مِتين", "وسبعين", "كيلو"], 5: ["محركين", "نفاثين،", "اتناشر", "طن."], 6: ["تتقلب", "ريش."], 7: ["ديل", "وزعنفة", "لقدام."],
     8: ["يمين", "وشمال"], 9: ["لوح", "يطلع", "ينزل،", "تميل", "وتلف."], 10: ["وقود", "فين؟"], 11: ["الجناحين", "وقود،", "أربعة", "وعشرين", "ألف", "لتر."],
     12: ["وتقل", "يتني"], 13: ["حداشر", "كيلو،", "خفيف", "دقيقة."], 14: ["هوا", "مضغوط", "اتنين", "كيلو", "ونص"], 15: ["تهدّي", "بطيء"],
     16: ["الفلابس،", "بتكبّره"], 17: ["مِتين", "وخمسين", "كيلو"], 18: ["فرامل", "لقدام"], 19: ["زي", "الحجر."], 20: ["الطيارة", "الورق."],
     21: ["ألفين", "وواحد،", "مية", "وعشرين", "كيلو", "سليمة."], 22: ["كراسي،", "وشبابيك", "مدوّرة،", "وكابينة"], 23: ["ومبروك،", "طيارة."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
