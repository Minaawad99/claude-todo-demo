"""Builds the cartoon-panel version of «كيف بُني جسر الشيخ جابر؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["ستةً", "وثلاثين", "كيلومترًا", "البحر،"], 1: ["جسر", "الشيخ", "جابر"], 2: ["وسط", "البحر؟"], 4: ["جون", "الكويت،"], 5: ["ساعة،", "نصف"],
     6: ["ألفين", "وثلاثة", "عشر،", "هيونداي"], 7: ["تقف", "قاع"], 8: ["مدفونة", "الخوازيق."], 9: ["حفرةً", "بالحديد", "والخرسانة."], 10: ["ستين", "مترًا،", "رمل"],
     11: ["ألف", "وخمسمئة", "خازوق!"], 12: ["قاعدة", "الماء،"], 13: ["قوالب", "الماء", "جافًّا."], 14: ["الجفاف،", "مستوى"], 15: ["الأعمدة", "صفًّا"],
     16: ["اليابسة."], 17: ["مصنع", "قطعةً", "واحدة،", "ستين"], 18: ["ألف", "وثمانمئة", "طن،", "سيارة!"], 19: ["رافعة", "عائمة", "دفعةً", "واحدة."],
     20: ["برجٌ", "شراع،", "مئةٌ", "وواحد", "وخمسون"], 21: ["كابلاته", "مئة", "وعشرون"], 22: ["جزيرتان", "صناعيتان"], 23: ["مايو", "ألفين", "وتسعة", "عشر،", "مليارات"],
     24: ["قطع", "عملاقة", "خوازيق"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
