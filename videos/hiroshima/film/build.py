"""Builds «هيروشيما: الساعة تمانية وربع» (full-bleed cinematic frames): scenes.js = helpers + shots, index.html = template + captions."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["تمانية", "وربع"], 1: ["قنبلة", "واحدة"], 4: ["هيروشيما،"], 5: ["والترام"], 6: ["بنات", "صغيرين،"], 7: ["مدرسة"],
     8: ["صفارة", "الإنذار"], 9: ["الحمد", "لله،"], 11: ["«إينولا", "جاي»."], 12: ["«الولد", "الصغير»."], 13: ["تمانية", "وربع"],
     14: ["تلاتة", "وأربعين", "ثانية"], 15: ["انفجرت."], 16: ["نور", "أبيض", "لآلاف"], 18: ["ضلّه"], 19: ["موجة", "ضغط"], 20: ["ولّعت."],
     21: ["سبعين", "ألف"], 22: ["مطر", "إسود."], 23: ["الإشعاع."], 24: ["مية", "وأربعين", "ألف."], 25: ["ناجازاكي."], 26: ["«ساداكو»،"],
     27: ["سرطان", "الدم"], 28: ["ألف", "كركي"], 29: ["آخر", "يوم"], 30: ["سواقين", "الترام؟"], 31: ["رجع", "يمشي"], 32: ["ولسه", "ماشية"],
     33: ["بتسكت", "دقيقة."], 34: ["حكاية", "إيه"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
