"""Builds the cartoon-panel version of «إزاي المونوريل بيمشي على قضيب واحد؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الراوتر", "سلك"], 1: ["الهوا", "شايفهم."], 2: ["الداتا", "بيفكّها؟"], 3: ["دقيقة."], 4: ["أصفار", "وواحدات"], 5: ["لأرقام،", "بتتسافر."],
     6: ["لموجة", "راديو،", "الـFM."], 7: ["آلاف", "شكلها"], 8: ["شكل", "الموجة"], 9: ["الضوء،", "بسرعة", "الضوء."], 10: ["الهوائي", "وشريحة"],
     11: ["لصورة", "رسالة", "صوت."], 12: ["عشرين", "ميتخانقوش؟"], 13: ["بتسمع", "بتستنى"], 14: ["لمئات", "الصغيرة،"], 15: ["المدرس", "الكراسات"],
     16: ["بتضعف", "الخرسانة"], 17: ["تلات", "بتقطع."], 18: ["الميكروويف", "خناقة"], 19: ["اختصار", "تسويق"], 20: ["أستراليا،", "ثقوب", "سوداء"],
     21: ["مئات", "الدولارات"], 22: ["الفيلم؟", "موجة"], 23: ["ترتيب", "ثانية."], 24: ["المرة", "الجاية؟"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
