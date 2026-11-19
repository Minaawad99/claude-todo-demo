"""Builds the cartoon-panel version of «تعمل قبو سري إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["قبو", "سري؟"], 1: ["هيقع", "عليك"], 2: ["بتسند", "بألواح", "طن", "ونص،", "عربية."], 3: ["بيزق", "أعمق"], 4: ["الخرسانة", "المسلحة،", "عشرين", "سنتي."],
     5: ["المية", "الجوفية", "شق"], 6: ["بطبقة", "عازلة،", "لطلمبة."], 7: ["تتشفط", "لبرة"], 8: ["مقفولة،", "هيتقل"], 9: ["ماسورة", "هوا", "عمود", "نور"],
     10: ["الرطوبة", "هتعفن."], 11: ["سحب", "رطوبة،", "تلاتين", "وخمسين"], 12: ["السجادة", "أول"], 13: ["مكتبة،", "مفصلة", "كتاب", "معين."], 14: ["الكلام", "والخبط", "ويفضحك."],
     15: ["بصوف", "صخري"], 16: ["قفل", "المكتبة", "محبوس."], 17: ["فتحة", "طوارئ"], 18: ["أخطر", "يكتشفه."], 19: ["غاز", "الأرض،", "الرادون."],
     20: ["ومنظمة", "الصحة", "العالمية", "سرطان", "الرئة", "السجاير."], 21: ["شقوق", "المروحة"], 22: ["مهندس", "إنشائي،", "فوقك."], 23: ["ليد،", "وكنبة،", "وكاميرا"], 24: ["ومبروك،", "قبو", "سري."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
