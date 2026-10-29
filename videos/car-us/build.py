"""Builds index.html for "How a car engine works" (Here's the Deal).
Captions come from script.txt with keywords coloured by meaning:
heat = fire/heat/power, water = air/coolant, part = mechanical parts, fuel = gas."""
import html, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "script.txt"), encoding="utf-8") if l.strip()]

KEYS = {
    0: [("tiny explosions", "heat")], 1: [("a hundred", "heat")], 2: [("moving your car", "part")],
    4: [("the pump", "fuel")], 5: [("fuel pump", "part"), ("the gas", "fuel")], 6: [("cylinders", "part")],
    7: [("four, six, or eight", "part")], 8: [("piston", "part")], 9: [("four-step routine", "heat")],
    10: [("suck.", "water")], 11: [("air rushes in", "water")], 12: [("injector", "part"), ("mist of gas", "fuel")],
    13: [("squeeze.", "fuel")], 14: [("ten times smaller", "fuel")], 15: [("burns way harder", "heat")],
    16: [("bang.", "heat")], 17: [("spark plug", "part"), ("twenty thousand volts", "heat")],
    18: [("Boom.", "heat"), ("four thousand degrees", "heat")], 19: [("makes power", "heat")],
    20: [("blow.", "ink")], 21: [("exhaust", "ink")], 22: [("Suck,", "water"), ("squeeze,", "fuel"), ("bang,", "heat"), ("blow.", "ink")],
    23: [("up and down", "part"), ("wheels spin", "part")], 24: [("cool part", "heat")], 25: [("crankshaft", "part"), ("pedals on a bike", "part")],
    26: [("go round", "part")], 27: [("take turns firing", "heat")], 28: [("camshaft", "part")], 29: [("transmission", "part")],
    30: [("axles", "part"), ("wheels turn", "part")], 31: [("crazy heat", "heat")], 32: [("coolant", "water"), ("radiator", "water")],
    33: [("less than a third", "part")], 34: [("heat", "heat")], 35: [("a hundred tiny explosions", "heat")],
}
NUM = {"twenty thousand": "20,000", "four thousand": "4,000", "a hundred": "100", "ten times": "10×"}

def cap_text(i):
    t = lines[i]
    for k, v in NUM.items(): t = t.replace(k, v)
    out = html.escape(t)
    for phrase, cls in KEYS.get(i, []):
        for k, v in NUM.items(): phrase = phrase.replace(k, v)
        p = html.escape(phrase)
        out = out.replace(p, f'<span class="tz-k tz-k--{cls}">{p}</span>', 1)
    return out

def caps(rng, style=""):
    return "\n".join(f'      <div class="cap" data-cap="{i}"{style}><p data-words="{i}">{cap_text(i)}</p></div>' for i in rng)

def counter(l, o, l_out, o_out, num, unit, cls="", count=None, left=10, top=10):
    cnt = f' data-v="count" data-l="{l}" data-o="{o}" data-d="1.4" data-from="{count[0]}" data-to="{count[1]}" data-fmt="comma"' if count else ""
    return (f'      <div class="counter" style="left:{left}px;top:{top}px;opacity:0" data-v="fade" data-l="{l}" data-o="{o}" data-d="0.3">'
            f'<div data-v="out" data-l="{l_out}" data-o="{o_out}" data-d="0.3" style="display:flex;gap:6px;align-items:center">'
            f'<span class="num {cls}" style="font-size:36px"{cnt}>{num}</span><span class="unit">{unit}</span></div></div>')

STEPS = '''      <div class="steps" data-v="fade" data-l="9" data-o="0.3" data-d="0.4"><div data-v="out" data-l="23" data-o="0" data-d="0.4" class="steps__row">
        <div class="step c-air"><b>1</b>SUCK<i data-v="fade" data-l="10" data-o="0" data-d="0.25"><i data-v="out" data-l="13" data-o="-0.1" data-d="0.25"></i></i><i data-v="fade" data-l="22" data-o="0" data-d="0.15"><i data-v="out" data-l="22" data-o="0.5" data-d="0.15"></i></i></div>
        <div class="step c-fuel"><b>2</b>SQUEEZE<i data-v="fade" data-l="13" data-o="0" data-d="0.25"><i data-v="out" data-l="16" data-o="-0.1" data-d="0.25"></i></i><i data-v="fade" data-l="22" data-o="0.45" data-d="0.15"><i data-v="out" data-l="22" data-o="0.95" data-d="0.15"></i></i></div>
        <div class="step c-heat"><b>3</b>BANG<i data-v="fade" data-l="16" data-o="0" data-d="0.25"><i data-v="out" data-l="20" data-o="-0.1" data-d="0.25"></i></i><i data-v="fade" data-l="22" data-o="0.9" data-d="0.15"><i data-v="out" data-l="22" data-o="1.4" data-d="0.15"></i></i></div>
        <div class="step c-ink"><b>4</b>BLOW<i data-v="fade" data-l="20" data-o="0" data-d="0.25"><i data-v="out" data-l="22" data-o="-0.1" data-d="0.25"></i></i><i data-v="fade" data-l="22" data-o="1.35" data-d="0.15"><i data-v="out" data-l="23" data-o="-0.2" data-d="0.25"></i></i></div>
      </div></div>'''

page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
page = page.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.45 var(--font-sans);padding:12px 4px"'))
page = page.replace("<!--CAPS_A1-->", caps(range(4, 8)))
page = page.replace("<!--CAPS_B-->", caps(range(8, 27)))
page = page.replace("<!--CAPS_A2-->", caps(range(27, 36)))
page = page.replace("<!--CAPS_OUT-->", caps(range(36, 37), ' style="font-size:15px;padding:4px 0 0"'))
page = page.replace("<!--STEPS-->", STEPS)
page = page.replace("<!--COUNTERS_A1-->", "\n".join([
    counter(7, 0.2, 8, -0.2, "4·6·8", "cylinders"),
]))
page = page.replace("<!--COUNTERS_B-->", "\n".join([
    counter(14, 1.2, 16, -0.2, "10×", "smaller", "amber", top=60),
    counter(17, 0.6, 18, 0.1, "20,000", "volts", "", (0, 20000), top=60),
    counter(18, 0.6, 20, -0.2, "4,000", "°F", "", (0, 4000), top=60),
]))
page = page.replace("<!--COUNTERS_A2-->", "\n".join([
    counter(35, 0.6, 36, 0, "100", "explosions<br>a second", "", (0, 100)),
]))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("index.html built,", len(lines), "lines")
