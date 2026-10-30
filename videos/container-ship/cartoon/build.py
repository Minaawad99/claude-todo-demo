"""Builds the cartoon-panel version of «إزاي سفينة الحاويات بتعوم؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مسمار", "هيغرق"], 1: ["حديد،", "ميتين", "ألف", "طن،", "بتعوم"], 2: ["خرم", "تغرق"], 4: ["تمن", "مرات،", "مصمتة"], 5: ["فاضية،", "هوا."],
     6: ["بتزق", "مكانها."], 7: ["قوة", "الطفو."], 8: ["بتساوي", "وزن"], 9: ["وزنها", "قد"], 10: ["ميتين", "ألف", "طن"], 11: ["تمانين", "حمام", "سباحة"],
     12: ["عريض،", "كتير."], 13: ["هتغرق،", "مركب", "هتعوم."], 14: ["أرشميدس،", "ألفين"], 15: ["البانيو", "فاضت"], 16: ["يوريكا!", "لقيتها!"], 17: ["خط", "الحمولة."],
     18: ["غطّت", "أكتر"], 19: ["النيل", "البحر."], 20: ["ملح،", "أتقل"], 21: ["خزانات", "تتزن"], 22: ["إيفر", "جيفن", "أربعمية", "عشرين", "حاوية."],
     23: ["ماغرقتش،", "محشورة", "ست", "أيام."], 24: ["الهوا", "فتتقل", "وتغرق."], 25: ["خفيفة،", "قد", "وزنها."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
