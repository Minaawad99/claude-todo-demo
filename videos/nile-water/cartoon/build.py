"""Builds the cartoon-panel version of «المية من النيل لحنفيتك».: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الحنفية", "منين."], 1: ["نهر", "بعيد"], 2: ["عكرة", "صافية؟"], 3: ["الحكاية؟"], 4: ["ستة", "وخمسين"], 5: ["الأبيض", "فيكتوريا،"], 6: ["الأزرق", "ستين"],
     7: ["الفيضان", "لتمانين"], 8: ["طين", "ميكروبات"], 9: ["شبك", "الحاجات"], 10: ["الشبة،", "يلزق"], 11: ["الترسيب."], 12: ["أصفى", "بيتشال."],
     13: ["رمل", "وزلط،"], 14: ["الطحالب", "الفلاتر"], 15: ["الكلور", "الميكروبات"], 16: ["تفضل", "سليمة"], 17: ["خزانات", "تحت"], 18: ["طلمبات", "مواسير"],
     19: ["تطول،", "تقوية"], 20: ["ليل", "ونهار،"], 21: ["عينات", "نضيفة."], 22: ["الحنفية", "فاتحها،"], 23: ["هضبة", "إثيوبيا."], 24: ["قولولنا،", "المرة"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
