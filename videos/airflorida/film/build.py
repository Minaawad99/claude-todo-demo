"""Builds «إير فلوريدا 90» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {}
K = {0: ["بالهليكوبتر"], 1: ["حقيقي…", "قاع", "النهر."], 2: ["تلاتاشر", "يناير"], 3: ["عاصفة", "متجمد."], 4: ["فلوريدا…", "تسعة", "وسبعين"], 5: ["دقيقة"], 6: ["زرار", "واحد"], 7: ["مش", "مظبوط…"], 8: ["دقيقة", "بدقيقة."],
     9: ["مقفول"], 10: ["متأخرة،"], 11: ["جو", "ستايلي…", "ميلاد"], 12: ["افتكروا", "جو."], 13: ["لاري", "روجر"], 14: ["تسعين."], 15: ["التلج."], 16: ["تسعة", "وأربعين"], 17: ["الجناحات"], 18: ["تدفئة", "المحركات؟"],
     19: ["مقفولة."], 20: ["افتكروا"], 21: ["حساسات"], 22: ["بقوة"], 23: ["الآخر.", "أضعف"], 24: ["أربعة", "دقيقة."], 25: ["مش", "مظبوط."], 26: ["مظبوط."], 27: ["مش", "مظبوط."], 28: ["وطلعت."], 29: ["ماعلتش.", "بتقع."],
     30: ["تخيّل", "الكوبري"], 31: ["آخر", "جملتين."], 32: ["البايو."], 34: ["بنقع", "عارف.»"], 35: ["كوبري", "النهر"], 36: ["الوعي."], 37: ["ابني…", "ميلاده."], 38: ["جو", "نفسه…"], 39: ["فاق…"], 40: ["خمسة", "أربعة"],
     41: ["عشرين", "حبل"], 42: ["آرلاند", "ويليامز."], 43: ["ادّاه"], 44: ["موجود."], 45: ["مكسورين،", "ستّين."], 46: ["سابت", "ضيّعتها."], 47: ["بريسيلا،", "اتجمدت."], 48: ["ليني", "سكوتنيك…", "ونط"], 49: ["أول", "سبب."],
     50: ["التلج", "ماسمعش"], 51: ["يتكلم…", "يسمع."], 52: ["آرلاند", "جد."], 53: ["عايشين."], 54: ["حكاية", "إيه"]}
data = []
for i, l in enumerate(lines):
    ws = CAPTEXT.get(i, l).split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    k = [w in K.get(i, []) for w in ws]
    if T["lines"][i].get("clip"): ws = ["«" + ws[0]] + ws[1:]; ws[-1] += "»"
    data.append({"w": ws, "k": k})
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + "".join(open(os.path.join(HERE, n), encoding="utf-8").read() for n in ["_base.js", "_af.js", "_tail.js"]))
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
