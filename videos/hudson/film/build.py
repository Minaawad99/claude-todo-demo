"""Builds «معجزة هدسون» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {}
K = {0: ["هدسون."], 1: ["حقيقي…", "هيقع", "المية."], 2: ["خمستاشر", "يناير"], 3: ["سبع", "الصفر،"], 4: ["مية", "خمسة", "وخمسين"], 5: ["متين", "ثانية"], 6: ["المحركين", "طيور؟"], 7: ["رفض"], 8: ["ثانية", "بثانية."],
     9: ["لاجوارديا."], 10: ["سولي."], 11: ["جيف", "سكايلز…"], 12: ["تلاتة", "وعشرين"], 13: ["صافي،"], 14: ["وز", "كندي."], 15: ["سكتوا."], 16: ["معايا."], 17: ["زرار", "صغير،"], 18: ["افتكروا"],
     19: ["البرج:"], 20: ["طيور."], 21: ["باتريك."], 22: ["بتنزل،"], 23: ["نيو", "جيرسي."], 24: ["مش", "هنقدر."], 25: ["ورقة"], 26: ["وملايين"], 27: ["النهر."], 28: ["تخيّل"], 29: ["الميكروفون."],
     30: ["البايو."], 32: ["استعدوا", "للاصطدام."], 33: ["راسك!"], 34: ["جورج", "واشنطن…"], 35: ["مناخير"], 36: ["…ولمست", "المية."], 37: ["الرادار", "فقدكم."], 38: ["متأكد"], 39: ["عايمة…", "كاملة."],
     40: ["الجناحات…"], 41: ["مرتين…", "آخر"], 42: ["أربع", "دقايق…"], 43: ["كلهم", "عايشين."], 44: ["السؤال؟"], 45: ["المحاكي."], 46: ["خمسة", "وتلاتين", "وقعت"], 47: ["الزرار"], 48: ["بتلات", "أسابيع."], 49: ["متحف"], 50: ["حكاية", "إيه"]}
data = []
for i, l in enumerate(lines):
    ws = CAPTEXT.get(i, l).split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    k = [w in K.get(i, []) for w in ws]
    if T["lines"][i].get("clip"): ws = ["«" + ws[0]] + ws[1:]; ws[-1] += "»"
    data.append({"w": ws, "k": k})
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
