"""Builds the cartoon-panel version of «تعمل خزان صرف إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["حفرة", "حوش", "خزان", "صرف؟"], 1: ["هتنهار،", "المية", "الجوفية."], 2: ["خرسانة", "مقفول", "أربعة", "متر", "مكعب"], 3: ["مستوية،", "ويسدّها."],
     4: ["بميل،", "اتنين", "سنتي"], 5: ["أوضة", "واحدة،", "التقيل"], 6: ["لأوضتين،", "مرتين."], 7: ["حمأة،", "قشرة."], 8: ["القشرة", "تعدّي"],
     9: ["حرف", "T،", "النص"], 10: ["بكتيريا", "غازات", "البيض", "البايظ."], 11: ["ماسورة", "تهوية", "سطح", "البيت."], 12: ["أقل", "أسبوع."],
     13: ["مواسير", "مخرّمة،", "زلط."], 14: ["فلتر،", "وبكتيريا"], 15: ["طلمبة", "بير،", "تلوّثه."], 16: ["تلاتين", "متر"], 17: ["الحمأة", "سنة", "سنة."],
     18: ["فتحة", "بغطا", "عربية", "الكسح"], 19: ["كل", "شهر،", "الكلور"], 20: ["بيموّت", "البكتيريا", "تلات", "لخمس", "سنين"], 21: ["غطا", "تقيل", "زيت", "مناديل،", "نجيلة"],
     22: ["ومبروك،", "خزان", "صرف."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
