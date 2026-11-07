"""Builds the cartoon-panel version of «إيه اللي بيحصل في الحمل؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["خلية", "واحدة", "نقطة", "القلم."], 1: ["طفل", "كامل", "تسع", "شهور"], 2: ["بتتعب", "وترجّع", "الفل؟"], 4: ["تلات", "مراحل،"],
     5: ["أسبوع،", "الرحم", "جداره."], 6: ["السادس،", "قلبه", "يدق،", "العدس."], 7: ["العاشر،", "أعضائه", "صوابع"], 8: ["ست", "سنتي،", "ليمونة."],
     9: ["الغثيان", "والترجيع،", "هرمونات"], 10: ["ألفين", "وتلاتة", "وعشرين،", "GDF15", "الجنين"], 11: ["والتعب", "والنوم", "البروجسترون،"],
     12: ["التانية،", "بيهدى،", "المشيمة"], 13: ["الرابع،", "بصمات", "عمره."], 14: ["يسمع،", "ركلة", "الخامس."], 15: ["كيلو،", "عينيه."],
     16: ["حموضة،", "صمام", "المعدة."], 17: ["وضهرها", "لقدام،", "الريلاكسين"], 18: ["التالتة،", "دهون", "يدفّي"], 19: ["ومخه", "تلات", "مرات."],
     20: ["ورئته", "حضّانة."], 21: ["بتنهج", "الحجاب", "الحاجز،", "بتورم"], 22: ["نزيف", "صداع", "ورم", "فورًا."],
     23: ["أربعين", "لتحت،", "نص", "متر", "تلاتة", "كيلو."], 24: ["نقطة", "القلم،", "بيبي"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
