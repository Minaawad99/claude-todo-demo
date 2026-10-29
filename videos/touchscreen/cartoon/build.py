"""Builds the cartoon-panel version of «إزاي شاشة الموبايل بتحس بصباعك؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مئات", "بالمللي."], 1: ["إزاي؟", "بالجوانتي؟"], 2: ["كوريا", "بالسجق؟"], 4: ["شبكة", "شفافة،"], 5: ["بتوصّل", "الكهربا،", "شفافة"],
     6: ["طبقتين:", "بالعرض،", "بالطول."], 7: ["بيتقاطعوا", "مجال", "كهربا"], 8: ["آلاف", "النقط،", "شحنة"], 9: ["مية", "وأملاح،", "بيوصّل"],
     10: ["بيشد", "شحنتها."], 11: ["الكنترولر"], 12: ["واحدة", "واحدة."], 13: ["ميتين", "وأربعين", "مرة"], 14: ["مكان", "صباعك", "بالظبط."],
     15: ["بصباعين", "فتكبّر"], 16: ["عازل،", "مبيشدش"], 17: ["خيوط", "بتوصّل."], 18: ["السجق!", "ألفين", "وعشرة", "كوريا،"], 19: ["مية", "وملح،", "أربعين"],
     20: ["جونسون،", "ألف", "تسعمية", "خمسة", "وستين."], 21: ["الطيارة", "الرادار"], 22: ["نقطة", "مية", "لمسة"], 23: ["شوية", "كهربا", "بيحس"]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
