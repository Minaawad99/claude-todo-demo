"""Builds the cartoon-panel version of «إزاي الطيور بتطير؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["إحداشر", "يوم"], 1: ["جناحين", "الريش"], 2: ["رفرفت", "هتطير؟"], 4: ["خفيف"], 5: ["فاضي", "المواسير،"], 6: ["الفرقاط،", "أخف"],
     7: ["مقوّس", "الطيارة."], 8: ["لتحت،", "لفوق."], 9: ["بتقلّد"], 10: ["رايت"], 11: ["العضلات."], 12: ["لربع", "وزنه"], 13: ["لفوق", "وقدام"],
     14: ["الشيش،"], 15: ["أضعف", "أتقل."], 16: ["النفَس."], 17: ["اتجاه", "واحد،", "أكياس"], 18: ["بيشهق،", "بيزفر."], 19: ["عالية،", "بيدوخ."],
     20: ["البقويقة،", "تلاتاشر", "ألف"], 21: ["الشاهين", "تلتمية"], 22: ["V،", "أقل."], 23: ["بتنام", "طايرة،", "مخها"], 24: ["خفيف،", "جامدة،", "مختلف."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
