"""Builds index.html for the real-3D (three.js) fridge episode. Captions and keyword colours come from ../fridge/build.py."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "../fridge/build.py"), encoding="utf-8").read()
ns = {"__file__": os.path.join(HERE, "../fridge/build.py")}
exec(src[:src.index("body = open")], ns)            # lines, K, NUM, brk, cap_text
caps = "\n".join((f'    <div class="cap" data-cap="{i}"></div>' if i in (3, 37) else f'    <div class="cap" data-cap="{i}"><p data-words="{i}">{ns["cap_text"](i)}</p></div>') for i in range(len(ns["lines"])))
page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("<!--CAPS-->", caps)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("built", len(ns["lines"]), "lines")
