"""Builds the cartoon-panel version of «إزاي المترو بيعدي تحت النيل؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["المترو", "تحت", "النيل"], 1: ["تلاتمية", "وسبعين", "متر،"], 2: ["نفق", "تغرّقه؟"], 4: ["الخط", "التاني", "التسعينات."], 5: ["أول", "مرة"],
     6: ["الأوبرا", "فرعين"], 7: ["TBM،", "تسعة", "متر", "ونص."], 8: ["بتلف،", "سكاكين"], 9: ["رملة", "مية،", "هتنط"], 10: ["بنتونايت."],
     11: ["بنفس", "قوة", "متقدرش"], 12: ["مواسير،", "بره."], 13: ["حلقات", "خرسانة"], 14: ["أربعين", "سنتي،", "ولا", "نقطة."], 15: ["بمكابس،", "آخر", "حلقة"],
     16: ["تمانية", "وتلت،", "تلات", "أدوار."], 17: ["التالت", "مرتين،", "للزمالك", "للكيت", "كات."], 18: ["تلاتة", "وعشرين", "متر"], 19: ["نيل", "كامل،", "الخرسانة"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
