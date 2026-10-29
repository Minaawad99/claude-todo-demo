"""Builds the cartoon-panel version of «إزاي السد العالي بيولّد الكهربا وبتوصل لبيتك؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["زرار", "النور،", "أسوان."], 1: ["بتتحول", "لكهربا؟"], 2: ["مئات", "الكيلومترات", "البريزة"], 4: ["أربعة", "كيلو،", "مية", "وحداشر"],
     5: ["بحيرة", "ناصر،", "خمسمية"], 6: ["سبعين", "سر", "الحكاية."], 7: ["أنفاق", "سرعتها"], 8: ["التوربينة،", "ريش،"], 9: ["بعمود", "المولّد."],
     10: ["مغناطيسات", "نحاس."], 11: ["الإلكترونات", "تيار", "كهربا."], 12: ["فاراداي", "ميتين", "سنة،"], 13: ["اتناشر", "مية", "خمسة", "وسبعين", "ميجاوات."],
     14: ["ألفين", "ومية", "نص", "كهربا", "مصر."], 15: ["تسعمية", "بيضيّع"], 16: ["لخمسمية", "ألف", "فولت."], 17: ["يقل،", "أقل."], 18: ["أبراج", "شبكة", "واحدة"],
     19: ["خطوة", "خطوة."], 20: ["لميتين", "وعشرين", "فولت."], 21: ["العداد،", "للبريزة،", "للمبة"], 22: ["مبتتخزنش", "نفس", "اللحظة"], 23: ["علشانك."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
