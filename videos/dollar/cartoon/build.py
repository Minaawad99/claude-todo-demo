"""Builds the cartoon-panel version of «ليه الدولار بيغلى؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الدولار", "غِلي"], 1: ["بالجنيه", "بالدولار؟"], 2: ["بيغلى،", "بيرخص؟"], 4: ["طماطم", "قليلة،", "كتير"], 5: ["هيرفع", "السعر،"],
     6: ["الطماطم", "معروض", "مطلوب."], 7: ["الزباين"], 8: ["تلاتاشر", "مليون", "قمح", "بالدولار."], 9: ["وقود", "وأدوية،"], 10: ["رغيف", "العيش", "دولار،"],
     11: ["منين؟"], 12: ["برة،", "أربعين", "مليار"], 13: ["السياحة،", "والصادرات،", "السويس."], 14: ["تسعة", "مليار", "بنص"], 15: ["الزباين", "كتير،", "قليلة."],
     16: ["البحر", "الأحمر،", "عشرة", "أربعة."], 17: ["بيختفي", "سودا"], 18: ["المركزي", "التعويم."], 19: ["ألفين", "وستاشر،", "تسعة", "تمنتاشر."],
     20: ["مارس", "واحد", "وتلاتين", "الخمسين."], 21: ["رأس", "الحكمة", "بخمسة", "وتلاتين"], 22: ["تزرع", "تصدّر", "سياح"], 23: ["سوق", "الخضار:"], 24: ["الجاية؟"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
