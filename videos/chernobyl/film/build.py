"""Builds «تشيرنوبل» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["ستة", "وعشرين", "أبريل"], 1: ["بريبيات،"], 2: ["أربع", "مفاعلات"], 3: ["زرار."], 4: ["بأربع", "ثواني"], 5: ["إيه", "زد", "خمسة…"], 6: ["زرار", "الأمان"], 7: ["يوم", "ونص…"],
     8: ["لحظة", "بلحظة."], 9: ["لتجربة", "أمان."], 10: ["كام", "ثانية؟"], 12: ["كييف"], 13: ["عشر", "ساعات…"], 15: ["أكتر", "من", "اللازم،"], 16: ["غاز"],
     17: ["قضبان", "التحكم"], 18: ["الفرامل…", "فرامل."], 19: ["أكيموف،", "توبتونوف."], 20: ["الليلة", "دي."], 21: ["التجربة", "بدأت."], 22: ["تبطّأ."], 23: ["بخار."],
     24: ["تزيد"], 25: ["إيه", "زد", "خمسة."], 27: ["عيب"], 28: ["ولّعته."], 29: ["عشر", "مرات."], 30: ["انفجار."], 31: ["انفجار", "تاني"], 32: ["ألفين", "طن،"],
     33: ["مفتوح"], 34: ["النور", "الأزرق."], 35: ["فاليري", "خودمشوك،"], 36: ["مدفون"], 37: ["المطافي"], 38: ["نووية…"], 39: ["تخيّل"], 40: ["سنين."], 41: ["بأسابيع."],
     42: ["عادي"], 43: ["فرح،"], 44: ["يوم", "ونص."], 45: ["إخلاء", "مؤقت…"], 46: ["ألف", "أوتوبيس،"], 47: ["تاني."], 48: ["والعالم؟"], 49: ["السويد،"], 50: ["الشرق."],
     51: ["اعترف"], 52: ["فجّره."], 53: ["نص", "مليون"], 54: ["تلاتين", "كيلو،"], 56: ["والطبيعة", "رجعت."], 57: ["الديابة", "والخيول"], 58: ["ألفين", "وستاشر."], 59: ["محمية", "طبيعية…"], 60: ["حكاية", "إيه"]}

for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
