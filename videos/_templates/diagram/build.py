"""Builds a «الرسم الهندسي» video page: scenes.js = the shared diagram helpers + this episode's shots, index.html = the
template with the title, the opening card, the summary card and the captions. Copy this file next to the episode's shots.js
and write episode.py (CFG and K).

K colours caption words per line: o orange-red (action, heat), b slate (air, technical), g olive (a named part); add u to
underline a new term (e.g. "bu"). Each line is shown phrase by phrase: it is split after «،» «.» «؟» «!» «:» and phrases of
one word are merged into a neighbour; each phrase gets a share of the line's time by its length.
CFG["outro_from"] (optional) = the line where the summary card starts; the last line then shows the CTA box on it."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "../../_templates/diagram")
CFG = {"title": "", "category": "", "hook": "", "outro": ""}
K = {}
exec(open(os.path.join(HERE, "episode.py"), encoding="utf-8").read())   # sets CFG and K
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)

def phrases(i, line):
    words, out, cur = line.split(" "), [], []
    for w in words:
        cur.append(w)
        if w[-1] in "،.؟!:": out.append(cur); cur = []
    if cur: out.append(cur)
    merged = []
    for p in out:
        if merged and (len(p) < 2 or len(merged[-1]) < 2): merged[-1] = merged[-1] + p
        else: merged.append(p)
    total, acc, res = sum(len(" ".join(p)) for p in merged), 0, []
    for p in merged:
        res.append({"w": p, "k": [K.get(i, {}).get(w, "") for w in p], "f": round(acc / total, 4)})
        acc += len(" ".join(p)) + 1
    return res

data = [phrases(i, l) for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(TPL, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(TPL, "template.html"), encoding="utf-8").read()
caps = "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";" + ("window.OUTRO_FROM = %d;" % CFG["outro_from"] if "outro_from" in CFG else "")
for k, v in [("/*TITLE*/", CFG["title"]), ("/*CATEGORY*/", CFG["category"]), ("/*HOOK*/", CFG["hook"]), ("/*OUTRO*/", CFG["outro"]), ("/*CAPS*/", caps)]:
    html = html.replace(k, v)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines,", sum(len(d) for d in data), "caption phrases")
