"""Builds the cartoon-panel version of «تعمل بريمة حفر إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مسمار", "بريمة", "حفر؟"], 1: ["بيزق", "الجنب", "هيتحشر."], 2: ["شريط", "حديد", "حلزونة،"], 3: ["التراب", "الحلزونة", "ويطلع"],
     4: ["المفكوك،", "هيفكه"], 5: ["سنان", "متقسّي،"], 6: ["بتتزحلق"], 7: ["سن", "مدبب،"], 8: ["هيلفها؟"], 9: ["دراع", "بالعرض،"],
     10: ["وصلات،", "عشرة", "متر."], 11: ["فيديوهات", "البايو."], 12: ["هتتعب،", "الواسعة"], 13: ["موتور،", "وعلبة", "تروس"], 14: ["حجر،", "هيلف", "بيك"],
     15: ["ياي", "حفّار"], 16: ["الرمل", "بتقع"], 17: ["ماسورة", "مفتوحة."], 18: ["خرسانة"], 19: ["خوازيق", "لتلاتين", "متر."],
     20: ["اختراع", "جديد."], 21: ["الطنبور،", "ألفين", "سنة."], 22: ["وصلات", "وسنان", "وشحم"], 23: ["ومبروك،", "بريمة", "حفر."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
