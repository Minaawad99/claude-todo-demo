"""Builds the cartoon-panel version of «ليه المية أسقع في القلة؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الحر،", "ساقعة", "التلاجة."], 1: ["كهربا", "موتور؟"], 2: ["المدهونة", "مبتبرّدش"], 4: ["مصمت،", "مسام"], 5: ["بتنش", "المسام"],
     6: ["مبلولة", "عرقانة."], 7: ["بتتبخر"], 8: ["تتبخر،", "حرارة"], 9: ["الجزيئات", "بسرعات"], 10: ["وأسرع", "بتفلت", "بخار."],
     11: ["البطيئة،", "أسقع."], 12: ["جرام", "ألفين", "وأربعمية", "جول"], 13: ["نص", "لتر", "درجة"], 14: ["بخمس", "لعشر", "درجات."],
     15: ["الشباك،", "الهوا"], 16: ["الرطوبة", "شبعان", "بيقل."], 17: ["الدهان", "المسام،", "بخر."], 18: ["جسمك،", "العرق"],
     19: ["آلاف", "السنين،", "وقنا"], 20: ["نيجيري", "محمد", "باه", "أبا", "تلاجة"], 21: ["زير", "رمل", "مبلول،"], 22: ["تلات", "أسابيع،", "يومين"],
     23: ["حرارة", "سرقها", "البخر"]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
