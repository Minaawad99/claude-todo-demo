"""Builds the cartoon-panel version of «تعمل ملجأ نووي إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["حفرة", "ملجأ", "نووي؟"], 1: ["موجة", "الانفجار"], 2: ["ماسورة", "حديد", "تسعين", "سنتي"], 3: ["تراب", "الغراب."], 4: ["مشع،", "الغبار", "النووي."],
     5: ["تسعة", "سنتي", "للنص."], 6: ["تسعة", "وتسعين", "وتسعة"], 7: ["خط", "مستقيم،", "الباب"], 8: ["لفتين."], 9: ["التراب"], 10: ["حر", "وخانق"],
     11: ["ماسورة", "هوا", "فلتر", "ومروحة"], 12: ["ماسورة", "الهوا"], 13: ["صمام", "الانفجار."], 14: ["الباب", "عربية", "نقل."], 15: ["لبرة،", "يزقه", "ويقفله"],
     16: ["الركام", "محبوس"], 17: ["نفق", "طوارئ."], 18: ["بيتشافش،", "أمان؟"], 19: ["عداد", "جايجر،"], 20: ["سنين."], 21: ["عشر", "سبع", "ساعات،", "وميت", "يومين."],
     22: ["أسبوعين", "بس."], 23: ["سراير", "معلّب،", "وراديو"], 24: ["ومبروك،", "ملجأ", "نووي."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
