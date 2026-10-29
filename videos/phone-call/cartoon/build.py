"""Builds the cartoon-panel version of «صوتك بيروح فين؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مش", "بيطير"], 1: ["لأرقام،", "ولنور", "تحت", "الأرض!"], 2: ["ربع", "ثانية."], 4: ["هوا", "بيتهز."], 5: ["ميكروفون"], 6: ["لكهربا،"], 7: ["آلاف", "المرات", "لأرقام."],
     8: ["ويضغط"], 9: ["إزاي؟"], 10: ["أنتينا،", "لموجات", "راديو."], 11: ["عيلة", "النور،", "مبتشوفهاش."], 12: ["تلاتمية", "ألف", "كيلو"], 13: ["أقرب", "برج"],
     14: ["مش", "بيرمي"], 15: ["تحت", "الأرض،", "زجاج", "الشعرة."], 16: ["ومضات", "نور،", "مليارات"], 17: ["أنهي", "برج"], 18: ["أنا", "هنا."], 19: ["موجات", "راديو"],
     20: ["يفك", "كهربا."], 21: ["سماعة", "صغيرة"], 22: ["الهوا", "شكل", "صوتك"], 23: ["بعد"], 24: ["بتسلّمك", "تقطع."], 25: ["هوا،", "كهربا،", "أرقام،", "نور،", "هوا", "تاني."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
