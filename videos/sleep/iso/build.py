"""Builds the full isometric version of «ليه بنحتاج ننام؟»: scenes.js = the shared diagram helpers + the episode's isometric
kit (../isolib.js) + world.js (one world, a travelling camera); index.html = template + word-by-word captions. The caption
colours come from ../diagram/episode.py (o → r for this page)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
src = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()
CFG = {}; K = {}
exec(src("../diagram/episode.py"))
lines = [l.strip() for l in src("../script.txt").splitlines() if l.strip()]
cls = {"o": "r", "b": "b", "g": "g"}
data = [{"w": l.split(" "), "k": [cls.get(K.get(i, {}).get(w, ""), "") for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(src("../../_templates/diagram/_helpers.js") + src("../isolib.js") + src("world.js"))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(src("template.html").replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";"))
print("built,", len(lines), "lines")
