"""«تبني كوبري فوق الشارع إزاي؟» in the «لو» look: index.html = template + one-word captions timed from ../timing.js."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(re.search(r"=\s*(\{.*\})", open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read(), re.S).group(1))
K = set("تل كوبري عمدان خرسانة طين النيل تلاتين متر خوازيق شهور كمرات ونش الضغط الشد عُشره أسلاك سابقة الإجهاد مستوية لفوق سنتيمتر بلاطة الحر مطاط كراسي الارتكاز خمسة ونص بركة اتنين بلاعات الحاجز الخرساني ومبروك".split())
words = []
for i, l in enumerate(lines):
    a, b = T["lines"][i]["start"], T["lines"][i]["end"]
    ws = l.split(" "); wt = [len(w.strip("،.؟!")) + 2 for w in ws]; tot = sum(wt); t = a
    for w, n in zip(ws, wt):
        d = (b - a) * n / tot; clean = w.strip("،.؟!")
        words.append({"w": clean, "a": round(t, 3), "b": round(t + d + (0.25 if w is ws[-1] else 0), 3), "k": clean.lstrip("و") in K or clean in K}); t += d
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.WORDS = " + json.dumps(words, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines,", len(words), "words")
