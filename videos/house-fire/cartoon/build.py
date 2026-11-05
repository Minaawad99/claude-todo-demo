"""Builds the cartoon-panel version of «تهرب من حريقة إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["بيتحرق،", "تفتح"], 1: ["النار", "نفسها."], 2: ["ضهر", "إيدك", "الأوكرة"], 3: ["سخنين،", "مخرج", "تاني."], 4: ["دخان،"], 5: ["الأرض", "وتزحف."],
     6: ["لفوق،", "الأنضف", "الأرض."], 7: ["الدخان،"], 8: ["بارد،"], 9: ["بتقفل", "كل", "باب"], 10: ["مقفول", "الأربعين", "مفتوح", "خمسمية!"], 11: ["والأسانسير"],
     12: ["السلم،", "يقف"], 13: ["سخن،", "محبوس"], 14: ["فوطة", "مبلولة"], 15: ["الشباك،", "مية", "وتمانين."], 16: ["نايم،"], 17: ["كاشف", "دخان"],
     18: ["ريحة", "صوت", "الكاشف"], 19: ["الموبايل", "والفلوس", "والدهب."], 20: ["دقيقتين", "بس،"], 21: ["متفكرش", "ترجع"], 22: ["طفاية", "تتقابلوا", "وخطة"],
     23: ["خطة", "هروب"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
