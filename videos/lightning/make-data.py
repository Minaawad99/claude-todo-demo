"""Writes remotion/src/lightning/data.json for the Remotion build of «إزاي الرعد والبرق بيحصلوا؟»:
line timings (from timing.js), caption words and which of them are keywords (yellow)."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
tj = open(os.path.join(HERE, "timing.js"), encoding="utf-8").read()
T = json.loads(tj[tj.index("{"):tj.rindex("}") + 1])
K = {0: ["تنوّر", "الشبابيك."], 1: ["البرق", "والرعد"], 2: ["الأول،", "الرعد؟"], 4: ["الركامية،", "عشرة", "كيلو."], 5: ["سخن", "بتتجمد."],
     6: ["بتخبط", "ملايين"], 7: ["شحنات", "كهربا"], 8: ["موجبة", "سالبة"], 9: ["بطارية", "عملاقة،"], 10: ["والأرض", "موجب،"], 11: ["مبيقدرش", "يعزلها"],
     12: ["خطوات،", "خمسين", "متر."], 13: ["خيط", "صغير"], 14: ["الوميض"], 15: ["أقل", "ثانية!"], 16: ["تلاتين", "ألف", "درجة،", "خمس", "مرات!"],
     17: ["بيتمدد", "الرعد."], 18: ["مليون", "مرة،"], 19: ["الثواني", "تلاتة،", "كيلو."], 20: ["أربعة", "وأربعين"], 21: ["الإمباير", "ستيت", "عشرين"],
     22: ["مانعة", "الصواعق،", "بأمان."], 23: ["بيفرقع", "سخونية"]}
data = {"duration": T["duration"], "lines": []}
for i, l in enumerate(lines):
    ws = l.split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    data["lines"].append({"start": T["lines"][i]["start"], "end": T["lines"][i]["end"], "words": [{"w": w, "k": w in K.get(i, [])} for w in ws]})
out = os.path.join(HERE, "../../remotion/src/lightning/data.json")
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote", out, len(lines), "lines,", T["duration"], "s")
