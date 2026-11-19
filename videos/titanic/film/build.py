"""Builds «تيتانيك» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["أربعتاشر", "أبريل"], 2: ["وأكبر", "سفينة"], 3: ["ما", "بتغرقش."], 4: ["ساعتين", "وأربعين"], 5: ["اتحركتش؟"], 6: ["ساعة", "بساعة."],
     7: ["اتلغى."], 8: ["تحذير"], 9: ["برقيات"], 10: ["تقّالة", "ورق…"], 11: ["كاليفورنيان"], 12: ["اسكت!"], 13: ["ونام."], 14: ["السفينة"],
     15: ["نضارة"], 16: ["ومفتاحه"], 17: ["حداشر", "وأربعين"], 18: ["جبل", "جليد"], 19: ["متأخر."], 20: ["كوتشينة."], 21: ["خمس", "أربعة"],
     22: ["ساعتين"], 23: ["نص"], 24: ["فاضي."], 27: ["شتراوس"], 28: ["أروح."], 29: ["والفرقة", "تعزف"], 30: ["مصري", "حمد", "حسب."],
     31: ["تلاتة،", "ونجي."], 32: ["وصواريخ"], 33: ["كاليفورنيان؟"], 34: ["نام."], 36: ["كارباثيا."], 38: ["تخيّل"], 40: ["اتنين", "وتلت،"],
     41: ["الصفر."], 42: ["ألف", "وخمسمية"], 43: ["الخبازين،"], 44: ["سبعمية", "ناجي"], 46: ["القانون"], 47: ["ناجي", "من", "تيتانيك."], 48: ["حكاية", "إيه"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
