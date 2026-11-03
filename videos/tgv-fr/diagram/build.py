"""Builds a «الرسم الهندسي» video page in French (left-to-right, Noto Sans, brand «Comment ça marche ?»): scenes.js = the shared diagram helpers + this episode's shots, index.html = the
template with the title, the opening card, the summary card and the captions (key words coloured: o orange, b blue, g olive).
Copy this file next to the episode's shots.js and fill in CFG and K."""
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
data = [{"w": l.split(" "), "k": [K.get(i, {}).get(w, "") for w in l.split(" ")]} for i, l in enumerate(lines)]
GEO = os.path.join(HERE, "geo.js")   # optional: projected map data (refs/geo-make.mjs), placed before the shots
geo = open(GEO, encoding="utf-8").read() if os.path.exists(GEO) else ""
helpers = open(os.path.join(TPL, "_helpers.js"), encoding="utf-8").read().replace("Noto Sans Arabic", "Noto Sans").replace('left ? "start" : "end"', 'left ? "end" : "start"')   # LTR page
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(helpers + geo + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template-fr.html"), encoding="utf-8").read()
for k, v in [("/*TITLE*/", CFG["title"]), ("/*CATEGORY*/", CFG["category"]), ("/*HOOK*/", CFG["hook"]), ("/*OUTRO*/", CFG["outro"]),
             ("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")]:
    html = html.replace(k, v)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
