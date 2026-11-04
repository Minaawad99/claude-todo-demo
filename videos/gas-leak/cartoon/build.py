"""Builds the cartoon-panel version of «لو شميت ريحة غاز… أوعى تولّع النور!»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["ريحة", "غاز", "أوعى", "تولّع", "النور!"], 1: ["زرار", "النور"], 2: ["الصح"], 4: ["حتتين", "معدن،"], 5: ["شرارة", "صغيرة،"],
     6: ["خمسة", "لخمستاشر", "المية"], 7: ["كفاية", "تولّعها", "كلها."], 8: ["التطفية", "التولعة", "شرارة."], 9: ["فيشة", "الموبايل", "الريموت"],
     10: ["جرس", "الباب", "شرارة،"], 11: ["تقفل", "محبس", "الغاز،"], 12: ["الشبابيك", "زرار."], 13: ["طوارئ", "بره."], 14: ["أخف", "السقف."],
     15: ["أتقل", "الأرض."], 16: ["ملوش", "ريحة", "خالص!"], 17: ["سبعة", "وتلاتين،", "تكساس"], 18: ["فجّرتها،", "تلتمية"],
     19: ["القانون", "ريحة", "وحشة."], 20: ["جرس", "الإنذار", "فاطلع", "بره"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
