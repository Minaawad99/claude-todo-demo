"""Builds index.html for "How does a plane fly?" (Here's the Deal): captions with keywords coloured by meaning."""
import html, os
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]
KEYS = {0: [("almost a million pounds", "ink")], 1: [("floats on air", "water")], 2: [("really smart wing", "water")],
  4: [("four forces", "heat")], 5: [("Weight", "ink"), ("Lift", "water")], 6: [("Thrust", "heat"), ("Drag", "grey")],
  7: [("lift has to beat weight", "water"), ("thrust has to beat drag", "heat")], 8: [("thrust", "heat"), ("jet engines", "part")],
  9: [("same routine", "heat")], 10: [("Suck,", "water"), ("squeeze,", "fuel"), ("bang,", "heat"), ("blow.", "grey")],
  11: [("giant fan", "part"), ("tons of air", "water")], 12: [("Compressor blades", "part"), ("fuel sprays in", "fuel"), ("explodes", "heat")],
  13: [("blast", "heat"), ("turbine", "part")], 14: [("most of the push", "heat"), ("big fan", "part")], 15: [("180 miles an hour", "heat")],
  16: [("the wing", "water")], 17: [("curved on top", "water"), ("tilted up", "water")], 18: [("shoves that air down", "water")],
  19: [("That's lift.", "water")], 20: [("speeds up", "water"), ("pressure drops", "water")], 21: [("high pressure", "water"), ("low pressure", "water")],
  22: [("sucked upward", "water")], 23: [("hand out a car window", "part")], 24: [("boom", "heat"), ("your hand flies", "water")],
  25: [("flaps", "part")], 26: [("more lift", "water")], 27: [("nose tips up", "part")], 28: [("steer", "part")],
  29: [("Ailerons", "part"), ("left or right", "part")], 30: [("elevator", "part"), ("up or down", "part")], 31: [("rudder", "part"), ("side to side", "part")],
  32: [("35,000 feet", "water"), ("way less drag", "heat")], 33: [("787's wings can flex up about 25 feet", "part")], 34: [("surfing on air", "water")]}
NUM = {"thirty-five thousand": "35,000", "twenty-five": "25", "a hundred and eighty": "180"}
def cap_text(i):
    t = lines[i]
    for k, v in NUM.items(): t = t.replace(k, v)
    out = html.escape(t)
    for phrase, cls in KEYS.get(i, []):
        p = html.escape(phrase); out = out.replace(p, f'<span class="tz-k tz-k--{cls}">{p}</span>', 1)
    return out
caps = "\n".join((f'    <div class="cap" data-cap="{i}"></div>' if i in (3, 35) else f'    <div class="cap" data-cap="{i}"><p data-words="{i}">{cap_text(i)}</p></div>') for i in range(len(lines)))
page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("<!--CAPS-->", caps)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("built", len(lines), "lines")
