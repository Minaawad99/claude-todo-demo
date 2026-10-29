"""Builds index.html for «إزاي الهليكوبتر بتطير؟» (إيه الحكاية؟) in the cartoon-panel reference look:
black frame, hand-lettered title, a 16:9 animated panel (scenes.js), captions revealed word by word."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
# words shown in yellow, per line
K = {0: ["كيلو", "على", "الأرض"], 1: ["من", "مكانها", "وتقف", "في", "الهوا"], 2: ["الموتور", "وقف،", "بالسلامة!"], 4: ["أجنحة."], 5: ["جناح", "الطيارة"],
     6: ["الجناح", "هو", "اللي", "بيلف."], 7: ["لتحت،", "لفوق."], 8: ["أكبر", "من", "وزن"], 9: ["يطلع", "وينزل؟"], 10: ["بيغيّر", "ميلتها"], 11: ["ميلة", "أكبر،", "أقل،"],
     12: ["قد", "الوزن"], 13: ["لقدام؟"], 14: ["بيميّل", "دايرة", "الريش"], 15: ["لقدام."], 16: ["الديل"], 17: ["العكسي."], 18: ["زي", "النحلة."], 19: ["مروحة", "صغيرة", "في", "الديل،"],
     20: ["الدواسات،", "يمين", "شمال."], 21: ["الموتور", "وقف"], 22: ["بيقلل", "ميلة"], 23: ["زي", "الطاحونة."], 24: ["تفرمل", "بهدوء."], 25: ["جناح", "بيلف،", "وميلة", "مظبوطة."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("index.html built,", len(lines), "lines")
