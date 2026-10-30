"""Builds the cartoon-panel version of «فين الـ10 لتر؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["عشرة", "لتر،", "فين"], 1: ["خزان،"], 3: ["حجم،", "سرعة:", "الدقيقة."], 4: ["بيخزن", "معدية."], 5: ["الحنفية،"], 6: ["جلدة", "ضغط"],
     7: ["بلف", "الغاز،"], 8: ["شرارة", "البطاريات"], 9: ["ماسورة", "نحاس", "زعانف"], 10: ["الماسورة", "والنار", "برة."], 11: ["النحاس", "ثواني."],
     12: ["تقفل", "تطفي"], 13: ["سخنة"], 14: ["خمسة", "وعشرين", "درجة."], 15: ["عشرين", "وأربعين."], 16: ["أسخن؟", "أبطأ."], 17: ["خمسين", "خمسة", "لتر"],
     18: ["الشتا", "ساقعة،"], 19: ["أضعف", "نفس"], 20: ["حنفية", "بتتقسم"], 21: ["أكبر."], 22: ["مدخنة", "العادم"], 23: ["تهوية"], 24: ["مش", "خزان،", "الدقيقة."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
