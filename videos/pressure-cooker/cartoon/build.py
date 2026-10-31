"""Builds the cartoon-panel version of «حلة الضغط بتسوي الأكل أسرع ليه؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الصفارة"], 1: ["نص", "ساعة،", "ساعتين"], 2: ["تنفجر؟"], 4: ["مية", "درجة."], 5: ["الغليان", "بخار."], 6: ["محبوس"], 7: ["محكم،", "كاوتش"],
     8: ["البخار", "والضغط", "بيعلى."], 9: ["حرارة", "أكتر"], 10: ["مية", "وعشرين"], 11: ["عشرين", "تلت", "الوقت."], 12: ["إيفرست", "سبعين"], 13: ["والصفارة؟", "تقل", "حديد"],
     14: ["التقل،", "ويصفّر."], 15: ["الضغط", "لآخره."], 16: ["أربعمية", "كيلو"], 17: ["الخطر:", "اتسدت", "عدس"], 18: ["صمام", "أمان"], 19: ["الكاوتش", "بتتزق"],
     20: ["مضغوطة،", "وشك"], 21: ["دوني", "بابان،", "ألف", "ستمية"], 22: ["بتنفجر،", "صمام", "أمان"], 23: ["مية", "وعشرين", "والأمان", "شغال."], 24: ["الجاية؟"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
