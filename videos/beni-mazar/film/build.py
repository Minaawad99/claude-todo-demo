"""Builds «جريمة بني مزار» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {}
K = {0: ["بشعة"], 1: ["حقيقي…"], 2: ["تمانية", "وعشرين", "ديسمبر،", "شمس", "الدين."], 3: ["برد"], 4: ["تلات", "عائلات."], 5: ["عشرة"], 6: ["أطفال…", "حداشر"], 7: ["مين", "النهارده؟"], 8: ["بريء؟"], 9: ["الفجر."], 10: ["الفجر…"], 11: ["مش", "مصدقة."], 12: ["محدش"], 13: ["ماكتفاش", "اتمثّل"], 14: ["الأطفال."], 15: ["لوحده."], 16: ["الطب", "الشرعي"], 17: ["مصر."], 18: ["والتلفزيون"], 19: ["عشرة"], 20: ["اتقلبت."], 21: ["الحكايات."], 22: ["تار…", "سحر…", "كنز"], 23: ["اتثبتت."], 24: ["افتكروا"], 25: ["مسكت", "المتهم."], 26: ["سبعة", "وعشرين"], 27: ["اعترف…"], 28: ["فاكرين."], 29: ["جنايات", "المنيا."], 30: ["ورقة"], 31: ["متوقعها."], 32: ["البايو."], 34: ["الجلابية", "نقطة", "دم."], 35: ["والجزمة…", "دم"], 36: ["تخيّل…", "عشرة،", "واحدة"], 37: ["واحد…", "يتصدق."], 38: ["مش", "ماشية"], 39: ["ضغط…", "وإكراه."], 40: ["سبتمبر"], 41: ["براءة."], 42: ["طعنت…", "طعنوا."], 43: ["النقض", "البراءة."], 44: ["بريء…", "نهائي."], 45: ["مين"], 46: ["…محدش", "يعرف."], 47: ["الصفر.»"], 48: ["اتثبتت،"], 49: ["ضد", "مجهول."], 50: ["تلات", "بيوت"], 51: ["مستنيين", "إجابة…"], 52: ["حكاية", "إيه"]}
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
