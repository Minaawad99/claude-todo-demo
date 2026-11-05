"""Builds the cartoon-panel version of «ليه برج بيزا مابيقعش؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["بيزا", "المايل"], 1: ["حجر", "ستمية"], 2: ["ماوقعش"], 4: ["الأجراس", "إيطاليا."], 5: ["ألف", "ومية", "تلاتة", "وسبعين،", "ستة", "وخمسين"], 6: ["أربعتاشر", "ألف", "ونص", "طن"],
     7: ["طين", "ورمل", "ومية،", "الإسفنجة."], 8: ["تلاتة", "متر", "بس."], 9: ["التاني،", "يغطس"], 10: ["الحروب", "مية", "سنة."], 11: ["اتضغط", "أقوى."], 12: ["وقع"],
     13: ["أطول", "الميل."], 14: ["معووج", "الموزة."], 15: ["متين", "سنة،", "بسبع", "أدوار"], 16: ["مركز", "تقله", "قاعدته."], 17: ["خط", "البرج", "نفسه."],
     18: ["خمسة", "ونص", "درجة"], 19: ["تسعمية", "طن", "رصاص"], 20: ["سحبوا", "طين"], 21: ["خمسة", "وأربعين", "سنتي،", "ثابت"], 22: ["الطين", "الطري", "أربع", "زلازل"], 23: ["واقف", "لوحده."]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
