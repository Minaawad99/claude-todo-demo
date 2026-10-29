"""Builds the cartoon-panel version of «إزاي الغواصة بتنزل وتطلع؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["آلاف", "الأطنان."], 1: ["بتعوم", "وتنزل", "وتطلع"], 2: ["مية،", "وهوا."], 4: ["بتزقها", "لفوق."], 5: ["وزن", "المية"], 6: ["أخف", "تعوم،", "أتقل،", "تغطس."], 7: ["خزانات", "الاتزان."],
     8: ["مليانة", "هوا،"], 9: ["فتحات", "الهوا", "يطلع."], 10: ["تدخل", "تحت،"], 11: ["تتقل،", "تغطس."], 12: ["أجنحة", "لتحت،"], 13: ["تقف", "نص"], 14: ["أصغر،", "شوية", "بشوية."],
     15: ["قد", "بالظبط،", "واقفة"], 16: ["الضغط"], 17: ["عشرة", "متر", "الضغط"], 18: ["تلاتمية", "تلاتين", "مرة!"], 19: ["حديد", "تخين", "ومدوّر"], 20: ["بتطلع"], 21: ["هوا", "مضغوط"],
     22: ["بتنفخ", "لبرة"], 23: ["تخف،", "فتطلع"], 24: ["مية", "تدخل", "تنزل،", "هوا", "يدخل", "تطلع."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
