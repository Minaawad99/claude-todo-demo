"""Builds «كوستا كونكورديا» in the «القصة 2D» look: scenes.js = helpers + shots, index.html = template + captions.
Lines that are the real recording (TIMING lines with "clip") are shown in «…»."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
CAPTEXT = {}
K = {0: ["ارجع", "السفينة!"], 1: ["حقيقي…", "خفر", "السواحل"], 2: ["تلاتاشر", "يناير"], 3: ["أربع", "تلاف"], 5: ["تتقلب"], 6: ["برا", "السفينة…"], 7: ["ساعة", "بساعة."],
     8: ["سبعة", "وتلت"], 9: ["ستمية", "الطوارئ."], 10: ["سكيتينو."], 11: ["«التحية»:"], 12: ["الجزيرة"], 13: ["إنذار", "بعينه،"], 14: ["نضارته…"],
     15: ["متأخر."], 16: ["صخرة", "شق"], 17: ["والكهربا"], 18: ["تيتانيك."], 19: ["مية", "سنة"], 20: ["الكهربا."], 21: ["وكله", "تمام."], 22: ["افتكروا"],
     23: ["سترات", "النجاة"], 24: ["كباينكم", "السيطرة.»"], 25: ["مية."], 26: ["أربعين", "دقيقة"], 27: ["حداشر", "إلا", "عشرة…"], 28: ["مش", "عارفة", "تنزل."],
     29: ["تخيّل"], 30: ["يصدقه."], 31: ["البايو."], 33: ["الشط."], 34: ["ناشفة."], 35: ["مية"], 36: ["اتنين", "إلا", "ربع", "دي", "فالكو"], 37: ["سلم", "بسجّل"],
     38: ["ضلمة…"], 39: ["جثث", "تروّح؟"], 40: ["مارجعش."], 41: ["جيليو"], 42: ["خمسة", "ونص"], 43: ["ناموا"], 44: ["اتنين", "وتلاتين"], 45: ["بستاشر", "سنة"],
     46: ["سنتين", "ونص،"], 47: ["رمز"], 48: ["حكاية", "إيه"]}
data = []
for i, l in enumerate(lines):
    ws = CAPTEXT.get(i, l).split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    k = [w in K.get(i, []) for w in ws]
    if T["lines"][i].get("clip") and not ws[0].startswith("«"): ws = ["«" + ws[0]] + ws[1:]; ws[-1] += "»"
    data.append({"w": ws, "k": k})
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
