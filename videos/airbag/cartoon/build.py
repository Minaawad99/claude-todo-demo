"""Builds the cartoon-panel version of «الإيرباج بيتفتح إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["تلاتين", "رمشة"], 1: ["كيس", "قماش"], 2: ["ومين", "خبطت؟"], 4: ["حساس", "التسارع."], 5: ["بتهدّي"], 6: ["بالراحة،", "الخبطة"], 7: ["عشرين", "افتح!"],
     8: ["شرارة", "المنفاخ."], 9: ["حبوب", "تولّع"], 10: ["انفجار", "النيتروجين"], 11: ["تلات", "أرباع"], 12: ["سامة", "أأمن."], 13: ["لتلتمية", "كيلو."],
     14: ["خروم"], 15: ["بالراحة،", "ثانية."], 16: ["بودرة", "النشا،"], 17: ["خمسة", "وعشرين", "ورا."], 18: ["تاكاتا", "مية", "مليون"], 19: ["خمسين", "راسك"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
