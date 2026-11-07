"""Builds index.html for the isometric version of «150 PS gegen 400 PS» (German).
Captions come from ../script.txt; numbers spoken as words are shown as digits; keywords coloured by meaning:
heat = fire/power, water = air, part = mechanical parts, fuel = petrol."""
import html, os
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
NUM = [("Hundertfünfzig-PS-Motor", "150-PS-Motor"), ("Vierhundert-PS-Motor", "400-PS-Motor"), ("zweihunderttausend", "200.000"),
       ("vierhundertmal", "400-mal"), ("zweihundertmal", "200-mal"), ("hundertfünfzig", "150"), ("vierhundert", "400"),
       ("fünfundsiebzig", "75"), ("fünfzehn", "15"), ("anderthalb", "1,5"), ("sechstausend", "6.000"), ("achteinhalb", "8,5")]
KEYS = {
    0: [("150 PS", "water"), ("400.", "heat")], 1: [("diese Zahl", "fuel")], 2: [("fast dreimal", "heat")],
    4: [("Pferdestärke", "fuel"), ("75 Kilo", "part"), ("einer Sekunde", "heat"), ("einen Meter", "heat")], 5: [("15 PS", "fuel")],
    6: [("Ansaugen", "water"), ("Verdichten", "fuel"), ("Zünden", "heat"), ("Ausstoßen", "ink")], 7: [("Kolben", "part"), ("Luft", "water"), ("Benzin", "fuel")],
    8: [("Zündkerze", "part"), ("Explosion", "heat")], 9: [("Kurbelwelle", "part"), ("Drehung", "part")],
    10: [("vier Zylinder", "part"), ("1,5 Liter Hubraum", "water")], 11: [("V8", "heat"), ("vier Litern", "heat")],
    12: [("Mehr Hubraum", "part"), ("Luft", "water"), ("Benzin", "fuel")], 13: [("mehr Zylinder", "part"), ("mehr Explosionen", "heat")],
    14: [("6.000 Umdrehungen", "part"), ("200-mal pro Sekunde", "water")], 15: [("400-mal", "heat")], 16: [("Turbo", "heat")],
    17: [("heißen Abgase", "heat"), ("Turbinenrad", "part"), ("200.000 Umdrehungen", "heat")], 18: [("Verdichter", "part"), ("frische Luft", "water")],
    19: [("mehr Sauerstoff", "water"), ("mehr Benzin", "fuel")], 20: [("zwei Turbos", "heat")], 21: [("400 PS", "heat"), ("fünf Zylindern", "part"), ("Ladedruck", "water")],
    22: [("Drehmoment", "part")], 23: [("wie kräftig", "part"), ("Drehmoment mal Drehzahl", "heat")], 24: [("8,5 Sekunden", "water"), ("um die vier", "heat")],
    25: [("mehr Benzin", "fuel"), ("viel heißer", "heat")], 26: [("größer", "heat"), ("öfter", "fuel"), ("mehr Luft", "water")], 27: [("Nächstes", "heat")],
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
STEPS = '      <div class="steps" data-v="fade" data-l="6" data-o="0.2" data-d="0.4"><div data-v="out" data-l="10" data-o="-0.3" data-d="0.3" class="steps__row">\n' + "\n".join(
    f'        <div class="step {c}" style="font-size:8.5px"><b>{k + 1}</b>{w}<i id="st{k}" style="opacity:0"><i></i></i></div>'
    for k, (w, c) in enumerate([("ANSAUGEN", "c-air"), ("VERDICHTEN", "c-fuel"), ("ZÜNDEN", "c-heat"), ("AUSSTOSSEN", "c-ink")])) + "\n      </div></div>"
page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
page = page.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 19px/1.45 var(--font-sans);padding:10px 4px"'))
for key, rng in [("P", range(4, 6)), ("B", range(6, 10)), ("E", range(10, 16)), ("T", range(16, 22)), ("D", range(22, 27))]:
    page = page.replace(f"<!--CAPS_{key}-->", caps(rng))
page = page.replace("<!--CAPS_OUT-->", caps(range(27, 28), ' style="font-size:15px;padding:4px 0 0"'))
page = page.replace("<!--STEPS-->", STEPS)
page = page.replace("<!--COUNTERS_P-->", "\n".join([counter(4, 1.0, 5, 0, "75", "kg", "olive", (0, 75)), counter(4, 2.0, 5, 0, "1", "Sekunde", "", None, top=62),
                                                     counter(5, 0.3, 6, 0, "15", "PS<br>kurzzeitig", "amber", (0, 15))]))
page = page.replace("<!--COUNTERS_B-->", "")
page = page.replace("<!--COUNTERS_E-->", "\n".join([counter(14, 0.4, 15, 0, "200", "pro<br>Sekunde", "blue", (0, 200)), counter(15, 0.2, 16, 0, "400", "pro<br>Sekunde", "", (0, 400))]))
page = page.replace("<!--COUNTERS_T-->", "\n".join([counter(17, 0.8, 18, 0, "200.000", "U/min", "", None)]))
page = page.replace("<!--COUNTERS_D-->", "")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("index.html built,", len(lines), "lines")
