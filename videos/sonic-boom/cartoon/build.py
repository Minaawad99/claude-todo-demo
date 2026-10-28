"""Builds the cartoon-panel version of «إزاي الطيارة بتكسر حاجز الصوت؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الانفجار،", "بعيدة"], 1: ["أسرع", "الصوت؟"], 2: ["والبوم", "بتكسر"], 4: ["موجات", "ضغط", "ألف", "ومتين"], 5: ["بتسبقها"], 6: ["سرعة", "الصوت،", "فتتكوّم"],
     7: ["حيطة", "حاجز", "الصوت."], 8: ["بتترج", "وتفقد", "التحكم"], 9: ["ألف", "تسعمية", "سبعة", "وأربعين،", "X-1."], 10: ["ضلعين،", "عصاية", "مقشة!"],
     11: ["قاذفة", "صواريخها،"], 12: ["مدبب", "الإبرة،", "السهم."], 13: ["بيشق", "مقاومة."], 14: ["بيشفط", "ويضغطه", "ويحرقه"], 15: ["الحارق", "اللاحق،", "شعلة"],
     16: ["النص،", "أضعاف."], 17: ["موجة", "صدمة", "مخروط"], 18: ["المركب"], 19: ["فجأة،", "البوم."], 20: ["بومتين،", "البوز", "الديل."], 21: ["بتجرّه", "السكة."],
     22: ["الكرباج", "بوم", "صوتي"], 23: ["سابقة", "صوتها."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
