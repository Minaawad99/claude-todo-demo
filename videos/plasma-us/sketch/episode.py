# «How plasma donation works» — American English «اسكتش» episode (see .claude/skills/sketch/SKILL.md; lang "en")
CFG = {
    "lang": "en",
    "title": "How does plasma donation work?",
    "category": "BODY & HEALTH",
    "libs": ["draw.js", "../../lib/geo.min.js"],
    "chunk": 3.5,
    "outro": '<div class="q">How does plasma donation work?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>One needle</span><span><b>2</b>The spinning bowl</span><span><b>3</b>Plasma in the bottle</span><span><b>4</b>Red cells back to you</span></div>'
             '<div class="stat"><div class="n">2×</div><div class="t">a week is allowed,<br>because plasma refills in a day or two</div></div>'
             '<div class="pts">1. Blood is more than half plasma, a yellow liquid.<br>'
             '2. A spinning bowl flings the heavy red cells out and lets the plasma off.<br>'
             '3. The red cells go back in through the same needle, with salt water.'
             '<div class="more">Bonus fact: one immune disorder patient needs about 130 donations a year.</div></div>',
}
CAPTEXT = {
    19: "That's how America ends up collecting about 70% of the world's plasma.",
    20: "Centers pay around $50 a visit, because companies turn it into medicine for hemophilia, immune disorders and burns.",
    24: "And the wild part? One immune disorder patient needs about 130 donations for just one year of treatment.",
}
K = {
    0: {"America,": "u", "tube": "o"}, 1: {"blood…": "o", "paid": "o u"}, 2: {"back.": "b"},
    5: {"plasma,": "o", "yellow": "o", "red": "gr", "cells.": "gr"},
    7: {"weigh": "g", "pressure,": "g", "iron.": "o"}, 8: {"needle": "o", "vein": "b"},
    10: {"bowl": "g", "spins": "o", "thousands": "o"}, 11: {"pulp": "o", "sinks,": "o", "floats.": "b", "seconds.": "o"},
    12: {"heavy": "u", "red": "o", "cells": "o", "yellow": "o", "plasma": "o", "bottle.": "g"},
    14: {"back": "o", "same": "u", "needle,": "u", "salt": "b", "water.": "b"}, 15: {"Draw,": "o", "spin,": "o", "return.": "o", "hour.": "g"},
    16: {"liter": "o"}, 17: {"twice": "o", "week,": "o", "two": "b", "months?": "b"}, 18: {"day": "o", "two.": "o", "weeks.": "b"},
    19: {"70%": "o"}, 20: {"$50": "o", "medicine": "g", "hemophilia,": "u", "burns.": "u"},
    21: {"losing": "u", "Nope.": "o"}, 22: {"water": "b", "protein,": "o"},
    23: {"needle,": "o", "spin,": "o", "bottle,": "o", "back": "b"}, 24: {"130": "o", "one": "u", "year": "u"},
}
SPLIT = {
    0: "All over America, | people sit in big chairs | with a tube in their arm.",
    5: "Your blood is | more than half plasma, | a yellow liquid. | The rest is | mostly red cells.",
    7: "They weigh you, | check your blood pressure, | and prick your finger | to test your iron.",
    10: "Into a machine | with a bowl | that spins thousands | of times a minute.",
    11: "Like fresh juice | left on the counter: | the pulp sinks, | the clear part floats. | Except this takes seconds.",
    12: "The heavy red cells | get flung outward, | and the yellow plasma | flows into a plastic bottle.",
    14: "They get pumped | back into you, | through the same needle, | with some salt water.",
    17: "So why can you do this | twice a week, | but give regular blood | only every two months?",
    18: "Because your body | replaces plasma | in a day or two. | Red cells take weeks.",
    19: "That's how America | ends up collecting | about 70% | of the world's plasma.",
    20: "Centers pay | around $50 a visit, | because companies | turn it into medicine | for hemophilia, | immune disorders and burns.",
    22: "They lose mostly water | and some protein, | and food and drinks | put it back.",
    23: "So basically: | needle, spin, | plasma in the bottle, | red cells back in you.",
    24: "And the wild part? | One immune disorder patient | needs about 130 donations | for just one year | of treatment.",
}
