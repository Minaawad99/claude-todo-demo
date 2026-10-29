"""Builds the cartoon-panel version of «إزاي العربية بتشتغل وتتحرك؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["انفجارات", "صغيرة", "لمية", "انفجار"], 1: ["بتحرّك"], 2: ["انفجار", "العجل", "يلف؟"], 4: ["المفتاح،", "المارش"], 5: ["أسطوانات،", "مكبس"],
     6: ["أربع", "خطوات"], 7: ["الأولى:", "هوا،", "بنزين"], 8: ["التانية:", "ويضغط"], 9: ["التالتة:", "البوجيه", "شرارة،", "ينفجر،"], 10: ["الوحيدة", "قوة،"],
     11: ["الرابعة:", "الشكمان."], 12: ["تلات", "آلاف", "مية", "مرة"], 13: ["بيطلع", "وينزل،", "بيلف،"], 14: ["الكرنك،", "بدّال", "العجلة."], 15: ["الفتيس،", "تروس"],
     16: ["قوة", "سرعة"], 17: ["عمود"], 18: ["الدفرنس،", "أسرع"], 19: ["أول", "رحلة", "بيرتا", "بنز،"], 20: ["كارل", "مية", "كيلو."], 21: ["صيدلية،", "بدبوس", "البرنيطة"],
     22: ["انفجار", "عمود،", "العجل."], 23: ["انفجارات", "أكتر"]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
