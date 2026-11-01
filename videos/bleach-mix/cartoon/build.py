"""Builds the cartoon-panel version of «أوعى تخلط الكلور!»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["استنى!", "أوعى", "منظف", "تاني."], 1: ["بتخلط", "أقوى،", "غاز", "سام"], 3: ["هيبوكلوريت", "الصوديوم،"], 4: ["ماسكة", "الجراثيم."],
     5: ["حمضية،", "الأملاح", "التواليت", "الخل؟"], 6: ["بيفك", "حر", "كغاز."], 7: ["أصفر", "مخضر،", "أخضر", "فاتح."], 8: ["نشادر،", "كلورامين."],
     9: ["العين", "والزور", "والصدر."], 10: ["رئتك", "وعينك", "أحماض."], 11: ["بيحرق", "الرئة", "بيستغيث."], 12: ["والأخطر", "ساعة", "يتقل."],
     13: ["أتقل", "مرتين", "ونص،", "الأرض."], 14: ["صغيرة،", "بسرعة."], 15: ["والأطفال", "والقطط", "أول"], 16: ["كسلاح", "الحرب", "العالمية"],
     17: ["خمستاشر،", "مية", "وخمسين", "طن", "بلجيكا."], 18: ["مش", "بتنضف", "أحسن،", "يضعف."], 19: ["منظف", "واحد،", "وتشطف"], 20: ["الشباك", "الشفاط،", "سخنة."],
     21: ["ريحة", "دمعت،", "اطلع", "برا", "مفتوح."], 22: ["بمية", "كتير،", "الإسعاف", "تلاتة", "وعشرين."], 23: ["أخطر", "أوضة", "إزازتين"], 24: ["شارك", "ينقذ", "بيت."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
