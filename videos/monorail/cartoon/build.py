"""Builds the cartoon-panel version of «إزاي المونوريل بيمشي على قضيب واحد؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["قضيب", "واحد"], 1: ["كمرة", "متر؟"], 2: ["مبيقعش", "ملف؟"], 4: ["المونوريل،", "واحد."], 5: ["قضيبين", "حديد"], 6: ["الحصان."],
     7: ["وحاضن", "الكمرة"], 8: ["كاوتش", "وزن"], 9: ["اليمين", "والشمال."], 10: ["تميل،", "الريح"], 11: ["تالت،", "متتقلبش"], 12: ["والكهربا", "قضبان"],
     13: ["أهدى"], 14: ["طلعات", "أشد"], 15: ["يغيّر", "خط،"], 16: ["بتتحرك", "لجنب،"], 17: ["سواق،", "الكمبيوتر"], 18: ["العمدان،", "يكسّر"],
     19: ["العاصمة", "الإدارية", "أكتوبر."], 20: ["مية", "كيلو،"], 21: ["ألمانيا،", "وواحد."], 22: ["متعلق", "تحت"], 23: ["فيلة", "توفي."], 24: ["النهر،", "بخدوش"],
     25: ["حاضن", "الكمرة", "ناحية."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
