"""Builds index.html for the isometric version of «Wie erkennt der Pfandautomat deine Flasche?» (German).
Captions from ../script.txt with numbers shown as digits; keywords coloured by meaning."""
import html, os
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
NUM = [("fünfundzwanzig", "25"), ("zweitausenddrei", "2003"), ("neunzehnhundertzweiundsiebzig", "1972"), ("achtundneunzig Prozent", "98 %"),
       ("fünfzig", "50"), ("fünfzehn", "15"), ("acht Cent", "8 Cent")]
KEYS = {
    0: [("25 Cent", "heat")], 1: [("Pfandflasche", "fuel")], 2: [("spuckt", "heat")], 4: [("2003", "part"), ("Einwegflaschen und Dosen", "water")], 5: [("25 Cent", "heat")],
    6: [("Rollen", "part")], 7: [("Kameras", "water")], 8: [("Strichcode", "ink")], 9: [("Einweg oder Mehrweg", "part")], 10: [("Pfandlogo", "heat")],
    11: [("Spezialfarbe", "heat"), ("Infrarot", "heat")], 12: [("kopieren", "heat")], 13: [("Form", "fuel"), ("wiegen", "fuel")], 14: [("zerdrückt", "heat"), ("zurück", "heat")],
    15: [("Computer", "part"), ("Sekundenbruchteilen", "part")], 16: [("Presse", "heat"), ("platt gedrückt", "heat")], 17: [("geschreddert", "part"), ("neuen Flaschen", "water")],
    18: [("Mehrwegflaschen", "water"), ("Kasten", "water")], 19: [("gewaschen", "water"), ("neu befüllt", "fuel")], 20: [("bis zu 50 Mal", "heat")],
    21: [("8 Cent", "fuel"), ("15", "water")], 22: [("Pfandbon", "heat")], 23: [("zwei Brüder", "part"), ("1972", "heat")], 24: [("Tomra", "heat")],
    25: [("98 %", "heat")], 26: [("gedreht", "part"), ("fotografiert", "water"), ("geprüft", "fuel"), ("sortiert", "heat")], 27: [("Nächstes", "heat")],
}
def shown(t):
    for k, v in NUM: t = t.replace(k, v)
    return t
def cap_text(i):
    out = html.escape(shown(lines[i]))
    for phrase, cls in KEYS.get(i, []):
        p = html.escape(phrase)
        if p not in out: print("key not found", i, phrase)
        out = out.replace(p, f'<span class="tz-k tz-k--{cls}">{p}</span>', 1)
    return out
def caps(rng, style=""):
    return "\n".join(f'      <div class="cap" data-cap="{i}"{style}><p data-words="{i}">{cap_text(i)}</p></div>' for i in rng)
def counter(l, o, l_out, o_out, num, unit, cls="", count=None, left=10, top=10):
    cnt = f' data-v="count" data-l="{l}" data-o="{o}" data-d="1.2" data-from="{count[0]}" data-to="{count[1]}"' if count else ""
    return (f'      <div class="counter" style="left:{left}px;top:{top}px;opacity:0" data-v="fade" data-l="{l}" data-o="{o}" data-d="0.3">'
            f'<div data-v="out" data-l="{l_out}" data-o="{o_out}" data-d="0.3" style="display:flex;gap:6px;align-items:center">'
            f'<span class="num {cls}" style="font-size:34px"{cnt}>{num}</span><span class="unit">{unit}</span></div></div>')
page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
page = page.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 18px/1.45 var(--font-sans);padding:10px 4px"'))
for key, rng in [("A", range(4, 6)), ("M", range(6, 16)), ("S", range(16, 19)), ("W", range(19, 23)), ("H", range(23, 27))]:
    page = page.replace(f"<!--CAPS_{key}-->", caps(rng))
page = page.replace("<!--CAPS_OUT-->", caps(range(27, 28), ' style="font-size:15px;padding:4px 0 0"'))
page = page.replace("<!--COUNTERS_A-->", "\n".join([counter(4, 0.3, 5, 0, "2003", "seit", "", None), counter(5, 0.3, 6, 0, "25", "Cent", "", (0, 25), top=62)]))
page = page.replace("<!--COUNTERS_M-->", "")
page = page.replace("<!--COUNTERS_S-->", "")
page = page.replace("<!--COUNTERS_W-->", "\n".join([counter(20, 0.3, 21, 0, "50", "× befüllt", "amber", (0, 50)), counter(21, 0.3, 22, 0, "8", "Cent Glas", "amber", None), counter(21, 0.9, 22, 0, "15", "Cent Plastik", "blue", None, top=62)]))
page = page.replace("<!--COUNTERS_H-->", "\n".join([counter(23, 0.3, 24, 0, "1972", "Norwegen", "", None), counter(25, 0.3, 26, 0, "98", "% zurück", "olive", (0, 98))]))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("index.html built,", len(lines), "lines")
