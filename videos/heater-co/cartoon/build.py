"""Builds the cartoon-panel version of «أوعى تقفل باب الحمام والسخان شغال»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["أوعى", "باب", "الحمام", "وسخان", "الغاز"], 1: ["المشكلة؟", "ريحة", "دخان."], 2: ["شتا", "مغمى"], 4: ["أكسجين"],
     5: ["عشرين", "متر", "مكعب", "مرتين!"], 6: ["زرقا،", "ثاني", "أكسيد", "كربون"], 7: ["والمدخنة", "برا"], 8: ["الباب", "والشباك", "الأكسجين", "بيقل"],
     9: ["مسدودة", "بيرجع", "جوه"], 10: ["أصفر."], 11: ["أول", "أكسيد", "الكربون."], 12: ["القاتل", "الصامت:", "لون", "ريحة،"],
     13: ["كرات", "حمرا،", "الأكسجين"], 14: ["مِتين", "مرة!"], 15: ["والمخ", "والقلب", "يتخنقوا"], 16: ["صداع", "ودوخة،", "البخار"],
     17: ["نعاس", "وتقل", "للباب."], 18: ["اتنين", "الألف،", "ساعة."], 19: ["والأطفال", "أسرع،", "أسرع."], 20: ["برا", "الحمام،", "ومدخنته"],
     21: ["شباك", "شفاط", "ومتطوّلش"], 22: ["أصفر،", "سواد", "صيانة", "فورًا."], 23: ["اقفل", "السخان،", "للهوا،", "مية", "تلاتة", "وعشرين."],
     24: ["متقفلش", "السخان."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "_shared.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
