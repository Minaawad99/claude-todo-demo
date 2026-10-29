"""Builds the cartoon-panel version of «إزاي الطيارة بتطير؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الجناح", "أربعمية", "طن."], 1: ["حداشر", "كيلو."], 2: ["رافعها؟"], 4: ["أربع", "اتجاهات."], 5: ["وزنها", "بيرفعها"],
     6: ["المحرك", "بيعاندها"], 7: ["مروحة", "عملاقة،"], 8: ["الجناح."], 9: ["مقوّس،", "مرفوعة"], 10: ["لتحت"], 11: ["لفوق،", "بيقل."],
     12: ["إيدك", "بتترفع"], 13: ["سرعة،", "أربع", "مرات."], 14: ["تلاتة", "كيلو."], 15: ["الفلابس،"], 16: ["تلتمية", "يغلب", "الأرض."],
     17: ["سبعمية", "عشر", "بني", "آدمين."], 18: ["خمسة", "وخمسين", "الصفر."], 19: ["خفيف،", "تسعمية"], 20: ["بالظبط،"],
     21: ["اتناشر", "ثانية", "بس."], 22: ["أقصر", "الجامبو"], 23: ["شايلك."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
