"""Builds the cartoon-panel version of «لو شربت شاي بعد الأكل على طول؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["الغدا،", "الشاي؟"], 1: ["بيهضم"], 2: ["حاجة", "مهمة"], 4: ["المعدة،", "الحامض"], 5: ["الحديد."], 6: ["الهيموجلوبين،", "الأكسجين"],
     7: ["أول", "جزء", "المصران،"], 8: ["التانينات،", "القابض"], 9: ["بتمسك", "جامد."], 10: ["مركّب", "كبير"], 11: ["ويطلع", "برة،"],
     12: ["تسعين", "المية!"], 13: ["الفول", "والعدس", "والعيش", "والسبانخ."], 14: ["بالعافية،"], 15: ["اللحمة", "والفراخ،", "أقل"],
     16: ["بيدبغوا", "الجلد"], 17: ["أسود", "غامق."], 18: ["الحبر", "ألف", "سنة!"], 19: ["معدتك،", "دواية", "الحبر."], 20: ["ربع", "أنيميا."],
     21: ["الحوامل", "والأطفال،"], 22: ["استنى", "ساعة", "للنص."], 23: ["ليمون", "فيتامين", "سي"], 24: ["بيخطف", "الحديد؛", "بالاتنين."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
