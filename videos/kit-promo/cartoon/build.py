"""Builds the cartoon-panel version of the kit promo «حزمة فيديوهات الأنيميشن»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مليون", "وتلتمية", "ألف"], 1: ["نص", "مليون،"], 3: ["فيسبوك", "وفيسبوك", "دولارات"], 4: ["السكريبت", "والـstoryboard،", "Claude", "دقايق."],
     5: ["حزمة:", "مهارة", "ودليل", "وفيديو", "وبرومبتات."], 6: ["موضوعك،", "السكريبت", "والمشاهد", "والعناوين،"], 7: ["بأربعتاشر", "دولار", "وتسعة", "وتسعين", "سنت،", "البايو."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
