"""Builds the cartoon-panel version of «إزاي المرساية الصغيرة بتمسك سفينة عملاقة؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["تلتمية", "ألف", "عشرين", "طن"], 1: ["خمستاشر", "ألف"], 2: ["حديد", "الجبل"], 4: ["مش", "بتشيل"], 5: ["الهوا", "والتيار."], 6: ["عشرات", "الأطنان"],
     7: ["المحراث."], 8: ["مخلبين،", "يغرزوا"], 9: ["تغرز", "أكتر", "وتمسك"], 10: ["نايم", "لفوق."], 11: ["السلسلة."], 12: ["تلتمية", "متر،", "مية", "طن."],
     13: ["أربع", "لست", "أضعاف"], 14: ["مش", "عميقة،", "مية", "متر."], 15: ["ممدودة", "قوس", "تقيل."], 16: ["نايم،", "غارزة"], 17: ["بتحتك", "بالطين،"],
     18: ["السوستة."], 19: ["فوقها", "بالظبط."], 20: ["لفوق،", "بسهولة"], 21: ["العاصفة،", "تتجر"], 22: ["خط", "غاز", "فنلندا", "وإستونيا."],
     23: ["العشرين", "التلتمية", "غارزة", "نايمة"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
