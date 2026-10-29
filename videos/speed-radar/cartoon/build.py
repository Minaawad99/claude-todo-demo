"""Builds the cartoon-panel version of «إزاي الرادار بيلقطك؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["مخالفة", "سرعة."], 1: ["مية", "وعشرين؟"], 4: ["موجات", "راديو،"], 5: ["بسرعة", "النور،"], 6: ["الكورة"], 8: ["بتتزنق،", "بتعلى."],
     9: ["أسرع،"], 10: ["دوبلر،"], 11: ["صفارة", "الإسعاف."], 12: ["رفيع،", "يتخن"], 14: ["الفرق."], 15: ["خمسة", "وأربعين"],
     16: ["أربعة", "آلاف", "ونص"], 17: ["أقل", "من", "ثانية."], 18: ["الحد،"], 19: ["اللوحة،", "بفلاش"], 20: ["ليزر،"], 21: ["كاميرتين"],
     22: ["أمريكا،", "سبعة", "وأربعين."], 23: ["ترمش."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
