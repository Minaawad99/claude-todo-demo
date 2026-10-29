"""Writes remotion/src/rainbow/data.json for the Remotion build of «إزاي قوس قزح بيتكوّن؟»:
line timings (from timing.js), caption words and which of them are keywords (yellow)."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
tj = open(os.path.join(HERE, "timing.js"), encoding="utf-8").read()
T = json.loads(tj[tj.index("{"):tj.rindex("}") + 1])
K = {0: ["قوس", "ألوان"], 1: ["الألوان", "مالوش", "لون!"], 2: ["ولا", "لون؟"], 4: ["أبيض", "الألوان"], 5: ["نقطة", "مية،", "ويتكسر،"],
     6: ["بزاوية", "الأحمر", "والبنفسجي"], 7: ["بيتفرد", "المنشور"], 8: ["ضهر", "المراية،"], 9: ["اتنين", "وأربعين", "درجة."], 10: ["وملايين", "لون", "واحد"],
     11: ["أحمر،", "بنفسجي."], 12: ["ضل", "راسك،", "قوس."], 13: ["ورا", "ضهرك،", "قدامك."], 14: ["اتنين", "وأربعين", "تحت", "الأرض."], 15: ["الصبح", "المغرب."],
     16: ["دايرة", "كاملة،"], 17: ["الطيارة", "دايرة"], 18: ["قوس", "تاني", "بالمقلوب."], 19: ["مرتين", "واحد", "وخمسين"], 20: ["بتاعه", "هو،"],
     21: ["عمرك", "بيتحرك"], 22: ["ونيوتن", "سبع", "نغمات"], 23: ["نور", "الشمس،", "ملايين"]}
data = {"duration": T["duration"], "lines": []}
for i, l in enumerate(lines):
    ws = l.split(" ")
    for w in K.get(i, []):
        if w not in ws: print("keyword not found", i, w)
    data["lines"].append({"start": T["lines"][i]["start"], "end": T["lines"][i]["end"], "words": [{"w": w, "k": w in K.get(i, [])} for w in ws]})
out = os.path.join(HERE, "../../remotion/src/rainbow/data.json")
json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote", out, len(lines), "lines,", T["duration"], "s")
