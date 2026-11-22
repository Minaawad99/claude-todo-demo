"""Armored cash truck, US English version of the «لو» look: index.html = template + one-word captions timed from ../timing.js."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
T = json.loads(re.search(r"=\s*(\{.*\})", open(os.path.join(HERE, "../timing.js"), encoding="utf-8").read(), re.S).group(1))
K = set("pickup padlock steel box glass plastic three inches hardened twenty-five thousand pounds six run-flat bumper fireproof pipes ports safe gps ink tracker cameras radio congrats".split())
words = []
for i, l in enumerate(lines):
    a, b = T["lines"][i]["start"], T["lines"][i]["end"]
    ws = l.split(" "); wt = [len(w.strip(",.?!:")) + 2 for w in ws]; tot = sum(wt); t = a
    for w, n in zip(ws, wt):
        d = (b - a) * n / tot; clean = w.strip(",.?!:")
        words.append({"w": clean, "a": round(t, 3), "b": round(t + d + (0.25 if w is ws[-1] else 0), 3), "k": clean.lower() in K}); t += d
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.WORDS = " + json.dumps(words, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines,", len(words), "words")
