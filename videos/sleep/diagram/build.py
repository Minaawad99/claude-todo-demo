"""Builds «ليه بنحتاج ننام؟» as a «الرسم الهندسي» video with isometric drawings: scenes.js = the shared diagram helpers +
the episode's isometric kit (../isolib.js) + this version's shots; index.html = the diagram template with the opening card,
the summary card and the captions (key words coloured: o orange, b blue, g olive)."""
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
src = lambda p: open(p, encoding="utf-8").read()
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(src(os.path.join(TPL, "_helpers.js")) + src(os.path.join(HERE, "../isolib.js")) + src(os.path.join(HERE, "shots.js")))
EXTRA = ('  <linearGradient id="cylSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>\n'
         '  <radialGradient id="ballSh" cx=".36" cy=".32" r=".72"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>\n')
html = src(os.path.join(TPL, "template.html")).replace("</defs></svg>", EXTRA + "</defs></svg>", 1)
for k, v in [("/*TITLE*/", CFG["title"]), ("/*CATEGORY*/", CFG["category"]), ("/*HOOK*/", CFG["hook"]), ("/*OUTRO*/", CFG["outro"]),
             ("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")]:
    html = html.replace(k, v)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
