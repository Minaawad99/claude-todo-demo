"""Builds the cartoon-panel version of «إزاي الأسانسير مابيقعش؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["عشرين", "دور."], 1: ["اتقطع؟", "هيقع؟"], 2: ["لأ!", "أربع", "حاجات"], 4: ["مش", "حبل", "واحد."], 5: ["أربعة", "لتمانية."], 6: ["لوحده،", "مليان"], 7: ["مع", "بعض،", "مستحيلة."],
     8: ["بكرة", "تقل", "حديد"], 9: ["الفرق", "بس."], 10: ["فرامل،", "لوحدها"], 11: ["يقف", "مكانه،"], 12: ["بسرعة؟"], 13: ["منظّم", "السرعة."], 14: ["بكرة", "بحبل", "لوحدها."],
     15: ["أتقال", "تتفتح"], 16: ["قفل،", "وتوقّف"], 17: ["ذراع"], 18: ["فكوك", "حديد،", "القضبان"], 19: ["متر", "اتنين"], 20: ["ألف", "تمنمية", "أربعة", "وخمسين!"], 21: ["يقطع", "الحبل…", "وقفت!"],
     22: ["سوست", "كبيرة،"], 23: ["أربع", "طبقات", "أمان،", "لوحدها."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
