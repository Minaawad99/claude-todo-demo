"""Builds the cartoon-panel version of «إزاي النت بيعدّي البحر؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["أمريكا،", "مصر", "ثانية."], 1: ["المحيط", "بالقمر", "الصناعي؟"], 2: ["اتقطع،"], 4: ["تسعين", "كابلات", "البحر."], 5: ["خمسمية", "وسبعين", "كابل"],
     6: ["خرطوم", "الجنينة", "آلاف"], 7: ["شعرات", "إزاز", "ألياف", "ضوئية."], 8: ["لنبضات", "نور،", "مليارات"], 9: ["ويرتد،"], 10: ["ستين", "لمية", "ريبيتر."],
     11: ["كهربا", "الشط،"], 12: ["نحاس", "وبلاستيك،", "حديد"], 13: ["مركب", "مخصوص،"], 14: ["محراث", "بيدفن"], 15: ["محطة", "إنزال،"], 16: ["للسنترال،", "الموبايل", "الراوتر"],
     17: ["ومصر", "أوروبا", "وآسيا."], 18: ["سبعتاشر", "العالم"], 19: ["اتقطع؟", "مية", "وخمسين", "مراسي"], 20: ["مبيقفش،", "كابل", "تاني."], 21: ["إصلاح", "وتلحمه"],
     22: ["القرش", "بتعض", "الكيفلار!"], 23: ["البحر", "نبضة", "نور."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
