"""Builds the cartoon-panel version of «اوعى تشحن الموبايل تحت المخدة» (flat look): scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["اوعى", "المخدة"], 1: ["كل", "يوم"], 2: ["المخدة"], 3: ["إيه", "الحكاية؟"], 4: ["بطارية", "ليثيوم،", "طبقات"], 5: ["موجبة،", "سالبة،", "الفاصل."],
     6: ["بيولّع", "بسهولة."], 7: ["الليثيوم", "حرارة."], 8: ["للهوا"], 9: ["البطانية،", "بتحبس", "الحرارة"], 10: ["خمسة", "وتلاتين", "درجة"], 11: ["تنتفخ"],
     12: ["يسيح", "مية", "وتلاتين", "درجة."], 13: ["ماس"], 14: ["حرارة", "أكتر،", "ماس", "تاني."], 15: ["الانفلات", "الحراري،"], 16: ["أكسجين", "تتطفي."], 17: ["ثواني،", "راسك،"],
     18: ["اتنين", "مليون", "ونص", "نوت", "سبعة،"], 19: ["المطافي", "حرايق"], 20: ["المضروب"], 21: ["الصح"], 22: ["سطح", "ناشف", "ومكشوف."], 23: ["الجراب"], 24: ["منفوخة", "وغيّرها."],
     25: ["لراسك", "بس."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
