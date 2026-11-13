"""Builds the cartoon-panel version of «المضاد الحيوي من غير دكتور»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مضاد", "حيوي", "دكتور…"], 1: ["خفّيت،"], 2: ["ماعملّكش", "أذاك."], 4: ["قاعدة"], 5: ["البكتيريا", "بالفيروسات."],
     6: ["فيروس،", "أسبوع."], 7: ["إزاي؟"], 8: ["جدار،", "البنسلين", "تفرقع،"], 9: ["مابيلمسهاش."], 10: ["شبه", "بعض."],
     11: ["تغيير", "تستحمل"], 12: ["والقوية", "فاضي."], 13: ["عشرين", "ستاشر", "مليون"], 14: ["مبيد", "القوي"], 15: ["بدري", "غلط؟"],
     16: ["أحسن", "وأقوى."], 17: ["بالجرعة", "والمدة", "الدكتور"], 18: ["الكويسة", "للمقاومة."], 19: ["السلاح", "جينات"],
     20: ["بيتعوّد", "لأ."], 21: ["بتتعلم،", "لغيرك."], 22: ["للبكتيريا", "القوي،", "غلط"], 23: ["فليمنج،", "تمانين"],
     24: ["جرعة", "قليلة", "يقاومها."], 25: ["المضاد", "الحيوي"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
