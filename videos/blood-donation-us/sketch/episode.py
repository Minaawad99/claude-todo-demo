# "How does your body get donated blood back?" — Here's the Deal (English, US) version of videos/blood-donation, sketch engine
CFG = {
    "title": "How does your body get donated blood back?",
    "category": "YOUR BODY",
    "libs": [],
    "intro_lines": 3, "promise": 3, "summary": 25, "cta": 26,
    "outro": '<div class="q">How does your body get donated blood back?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Vessels squeeze</span><span><b>2</b>Water refills the blood</span><span><b>3</b>Kidneys send a hormone</span><span><b>4</b>Marrow makes new cells</span></div>'
             '<div class="stat"><div class="n">2,000,000</div><div class="t">red blood cells your marrow<br>makes every second</div></div>'
             '<div class="pts">1. First minutes: vessels squeeze and your heart speeds up, so your blood pressure holds.<br>'
             '2. A day or two: water from between your cells moves into the blood, so the volume is back.<br>'
             '3. 4 to 6 weeks: your kidneys sense less oxygen and your marrow makes new red cells. Iron takes longer.'
             '<div class="more">Bonus: one pint is split into red cells, plasma and platelets, so it can help save up to 3 lives.</div></div>',
}
CAPTEXT = {
    0: "Every time you give blood, they take about a pint out of you in 10 minutes.",
    4: "Your body holds about 10 pints of blood, so that bag is roughly a tenth of it.",
    16: "And your marrow already makes about 2 million red blood cells every second, so it just cranks that up.",
    17: "In about 4 to 6 weeks, your red cells are back to normal.",
    19: "That's why you have to wait 8 weeks before you donate again.",
    23: "And here's the wild part: your body swaps out about 1% of its blood every single day, even if you never donate.",
    24: "And that one pint you gave can help save up to 3 lives.",
}
K = {
    0: {"blood,": "o", "pint": "o", "10": "u"}, 1: {"cookie,": "b", "nothing": "b", "happened.": "b"}, 2: {"pint": "o", "back?": "o"},
    4: {"10": "o", "pints": "o", "tenth": "o"}, 5: {"three-step": "u", "emergency": "o", "plan.": "o"},
    6: {"drops?": "o"}, 7: {"vessels": "g", "squeeze": "o", "faster,": "o", "steady.": "b"}, 8: {"garden": "b", "hose": "b", "yard.": "u"},
    9: {"amount": "u", "back?": "o"}, 10: {"Water": "b", "cells": "g", "vessels,": "g", "sponge": "u"},
    11: {"day": "o", "two.": "o", "water.": "b"}, 12: {"watered": "b", "down,": "b", "fewer": "o"}, 13: {"notices": "u"},
    14: {"kidneys.": "g", "oxygen": "b"}, 15: {"hormone": "o", "bone": "g", "marrow": "g", "overtime.": "o"},
    16: {"2": "o", "million": "o", "second,": "o"}, 17: {"4": "o", "6": "o", "weeks,": "o"},
    18: {"iron,": "o", "iron": "o", "longer": "u"}, 19: {"8": "o", "weeks": "o"},
    20: {"weak": "u", "Nope.": "o"}, 21: {"two": "b", "days,": "b", "weeks,": "o", "own.": "g"},
    22: {"squeeze,": "g", "water": "b", "kidneys": "g", "new": "o", "cells.": "o"},
    23: {"wild": "u", "1%": "o", "day,": "o"}, 24: {"3": "o", "lives.": "o"},
}
