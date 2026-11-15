"""Builds the cartoon-panel version of «تعمل ونش برجي إزاي؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["عصاية", "حبل،", "شنطة", "طوب", "ونش؟"], 1: ["هتتني،", "هتتعب"], 2: ["عمود", "حديد", "بكرة"], 3: ["درام", "بموتور."], 4: ["أقصر"],
     5: ["مشبّكة", "برج", "طويل."], 6: ["هيتقلب."], 7: ["خرسانة", "عشرة", "مية", "وتمانين", "طن."], 8: ["تحته"], 9: ["دراع", "طويل،", "عربية", "صغيرة", "الخطاف."],
     10: ["لقدام."], 11: ["دراع", "قصير", "بلوكات", "خرسانة"], 12: ["كل", "ناحية،", "واحدة"], 13: ["ترس", "ضخم", "وموتور،", "دورة", "كاملة."], 14: ["كابينة", "السواق"],
     15: ["يقل."], 16: ["تمانية", "طن", "طن", "وتمنمية", "كيلو"], 17: ["كمبيوتر", "الوزن", "والمسافة،"], 18: ["أطول", "الونش"],
     19: ["بيطوّل", "نفسه،", "هيدروليك", "قطعة", "برج", "جديدة."], 20: ["الريح", "بتزقه"], 21: ["بكانات", "حديد."], 22: ["لوحده", "عطلان."],
     23: ["الفرامل", "مفتوحة", "دوارة", "الهوا"], 24: ["مروحة", "اتنين", "وسبعين", "كيلو"], 25: ["ومبروك،", "ونش", "برجي."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
