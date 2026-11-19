"""Builds «جريمة بني مزار» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {}
K = {0: ["بشعة"], 1: ["حقيقي…"], 2: ["تمانية", "وعشرين", "ديسمبر،", "شمس", "الدين."], 3: ["برد"], 4: ["تلات", "عائلات."], 5: ["عشرة"], 6: ["أطفال…", "حداشر"],
     7: ["مين", "النهارده؟"], 8: ["بريء؟"], 9: ["الفجر."], 10: ["الفجر…"], 11: ["مش", "مصدقة."], 12: ["محدش"], 13: ["احترامًا"], 14: ["الطب", "الشرعي"],
     15: ["مصر."], 16: ["والتلفزيون"], 17: ["عشرة"], 18: ["اتقلبت."], 19: ["الحكايات."], 20: ["تار…", "سحر…", "كنز"], 21: ["اتثبتت."], 22: ["افتكروا"],
     23: ["مسكت", "المتهم."], 24: ["سبعة", "وعشرين"], 25: ["اعترف…"], 26: ["فاكرين."], 27: ["جنايات", "المنيا."], 28: ["ورقة"], 29: ["متوقعها."],
     30: ["البايو."], 32: ["الجلابية", "نقطة", "دم."], 33: ["والجزمة…", "دم"], 34: ["تخيّل…", "عشرة،", "واحدة"], 35: ["واحد…", "يتصدق."], 36: ["مش", "ماشية"],
     37: ["ضغط…", "وإكراه."], 38: ["سبتمبر"], 39: ["براءة."], 40: ["طعنت…", "طعنوا."], 41: ["النقض", "البراءة."], 42: ["بريء…", "نهائي."], 43: ["مين"],
     44: ["…محدش", "يعرف."], 45: ["الصفر.»"], 46: ["اتثبتت،"], 47: ["ضد", "مجهول."], 48: ["تلات", "بيوت"], 49: ["مستنيين", "إجابة…"], 50: ["حكاية", "إيه"]}
data = []
for i, l in enumerate(lines):
    ws = CAPTEXT.get(i, l).split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    k = [w in K.get(i, []) for w in ws]
    pass
    data.append({"w": ws, "k": k})
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
