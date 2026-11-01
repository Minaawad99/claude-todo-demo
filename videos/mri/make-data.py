"""Writes remotion/src/mri/data.json for the Remotion + three.js build of «ليه جهاز الرنين صوته عالي؟»:
line timings (from timing.js), caption words and which of them are keywords (yellow)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
tj = open(os.path.join(HERE, "timing.js"), encoding="utf-8").read()
T = json.loads(tj[tj.index("{"):tj.rindex("}") + 1])
K = {0: ["بالتفصيل،", "أشعة"], 1: ["خبط", "عالي"], 2: ["حديد،", "الدبوس", "والكارت."], 4: ["مغناطيس", "عملاق،", "تلاتين", "ألف"],
     5: ["شغال", "طول،"], 6: ["حديد", "بتتشد"], 7: ["كراسي", "وأنابيب", "أكسجين", "واتلزقت"], 8: ["الكارت", "بيتمسح."], 9: ["المية"],
     10: ["مغناطيس", "صغير."], 11: ["ملايين", "اتجاه", "واحد."], 12: ["يزقّهم،", "إشارة."], 13: ["العضم", "للعضلة", "للمخ،", "صورة."],
     14: ["والدوشة؟", "منين"], 15: ["ملفات", "بسرعة"], 16: ["بيتهز", "ويخبط،", "سماعة", "عملاقة."], 17: ["حفلة", "روك،", "سدادات"],
     18: ["خبطة", "بيرسم"], 19: ["أشعة،", "يفتحك."]}
data = {"duration": T["duration"], "lines": []}
for i, l in enumerate(lines):
    ws = l.split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    data["lines"].append({"start": T["lines"][i]["start"], "end": T["lines"][i]["end"], "words": [{"w": w, "k": w in K.get(i, [])} for w in ws]})
out = os.path.join(HERE, "../../remotion/src/mri/data.json")
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote", out, len(lines), "lines,", T["duration"], "s")
