"""Builds the cartoon-panel version of «أوعى تغسل الفرخة!»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["استنى!", "الحنفية", "وتغسلها،"], 1: ["اتربينا", "يعيّي", "البيت", "كله."], 3: ["بكتيريا", "باينة،", "السالمونيلا", "والكامبيلوباكتر."],
     4: ["أمعاء", "بتتدبح"], 5: ["بريطانيا،", "أكتر", "نص"], 6: ["مش", "بتموّت", "بتنقلها"], 7: ["نقط", "صغيرة", "جدًا"], 8: ["أبعد", "تتخيل،", "هتشوفها"],
     9: ["للرخامة،", "وللأطباق،", "وللخضار", "لهدومك."], 10: ["أمريكا", "تجربة", "ألفين", "وتسعتاشر"], 11: ["ستين", "المية", "الحوض"], 12: ["نضفوا", "أربعتاشر", "لسه"],
     13: ["ربعهم", "للسلطة"], 14: ["النار،", "بطنك"], 15: ["بكام", "مية", "بس."], 16: ["إسهال", "وترجيع", "وسخونية،", "الأطفال", "والحوامل"],
     17: ["والخل", "والليمون", "والدقيق", "الريحة،", "كلها."], 18: ["النار."], 19: ["أربعة", "وسبعين", "درجة."], 20: ["بيموتوا،", "تغسل", "نقطة."],
     21: ["بالسكينة،", "بمنديل", "وارميه."], 22: ["لوح", "لوحدها،", "الخضار"], 23: ["والصابون", "عشرين", "ثانية"], 24: ["بمية", "سخنة", "وصابون"],
     25: ["إيدك", "ومطبخك."], 26: ["شارك", "يحمي", "تسمم."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
