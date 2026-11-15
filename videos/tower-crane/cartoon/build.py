"""Builds the cartoon-panel version of «تعمل ونش برجي إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["دراع", "ونش", "برجي؟"], 1: ["هيتقلب"], 2: ["خرسانة", "عشرة", "مية", "وتمانين", "طن."], 3: ["بمسامير", "ضخمة"], 4: ["مين"],
     5: ["ونش", "عربية"], 6: ["لقدام."], 7: ["دراع", "تاني", "بلوكات", "خرسانة"], 8: ["لعشرين", "طن،", "الميزان."], 9: ["لكل", "حتة"],
     10: ["ترس", "وموتور،", "دورة", "كاملة."], 11: ["تقرّب", "وتبعّده."], 12: ["عربية", "صغيرة", "الخطاف"], 13: ["يبعد", "يتقلب."], 14: ["بسهولة", "يوقعه"],
     15: ["حساسات", "الوزن", "والمسافة،"], 16: ["العمارة", "أعلى"], 17: ["بيطوّل", "نفسه،", "هيدروليك", "ستة", "متر."], 18: ["قطعة", "برج", "جديدة"],
     19: ["الريح", "تهزه."], 20: ["بكانات", "حديد."], 21: ["فاكرة", "بالفرامل"], 22: ["بيفك", "الفرامل", "دوارة", "الهوا"], 23: ["كابينة", "حمرا", "سرعة", "الريح."],
     24: ["ومبروك،", "ونش", "برجي."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
