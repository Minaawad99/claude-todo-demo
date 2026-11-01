"""Builds the cartoon-panel version of «إزاي السونار بيشوف البيبي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["البيبي", "بيتحرك."], 1: ["يفتح", "أشعة؟"], 2: ["الجل", "الساقع"], 4: ["صوت،", "مستحيل", "ودنك", "تسمعه."], 5: ["مية", "مرة."],
     6: ["بيرجع،", "الصدى"], 7: ["يسكت", "ويسمع", "آلاف"], 8: ["بسرعة،", "قريبة."], 9: ["اتأخر،", "أبعد."], 10: ["العضم", "قوي،", "أبيض."],
     11: ["والمية", "سودا."], 12: ["يرسم", "سطر"], 13: ["عشرات", "بيتحرك", "الهوا."], 14: ["والجل؟", "بيكره", "الهوا."], 15: ["هوا", "يرتد"],
     16: ["بيطرد", "يعدّي"], 17: ["الخفاش", "الضلمة."], 18: ["صوت", "أشعة،", "قلق."], 19: ["أول", "صورة", "صدى"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
