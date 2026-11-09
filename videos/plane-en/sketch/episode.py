# «Here's the Thing» — How Planes Fly. English edition of plane-ar (same drawings, see make.sh). «اسكتش» style.
CFG = {
    "lang": "en",
    "title": "How Do Planes Fly?",
    "category": "SCIENCE",
    "outro": '<div class="q">How does a 70-ton plane stay in the air?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Lift: from the wing</span><span><b>2</b>Weight: from gravity</span><span><b>3</b>Thrust: from the engines</span><span><b>4</b>Drag: from the air</span></div>'
             '<div class="stat"><div class="n">4</div><div class="t">forces on every plane in the air;<br>it flies when lift and thrust win</div></div>'
             '<div class="pts">1. The engine throws air back fast, so it gets shoved forward, while the air drags the plane back.<br>'
             '2. A curved, tilted wing bends the air down, and the air pushes the wing up.<br>'
             '3. When lift beats weight the plane takes off; when all four balance it cruises steady.'
             '<div class="more">Bonus fact: the engines don\'t lift the plane. They give it speed, and the wing turns that speed into lift.</div></div>',
}
CAPTEXT = {0: "This plane weighs more than 70 tons…", 5: "Every plane in the air has 4 forces pulling it 4 different ways.",
           18: "That speed grows the lift until it beats the weight, at around 180 miles an hour.",
           23: "And the weirdest part? If both engines quit up high, the plane glides down gently like a paper plane, sometimes for more than 60 miles."}
K = {
    0: {"70": "o", "tons…": "o"}, 1: {"rotor": "u"}, 2: {"clouds": "b"}, 4: {"rule.": "g"}, 5: {"4": "o", "forces": "o"},
    6: {"weight,": "u", "lift,": "g", "thrust,": "o", "drag.": "b"}, 7: {"weight": "u", "Gravity": "u"}, 8: {"weight": "u"},
    9: {"thrust?": "o", "sucks": "o", "fast.": "o"}, 10: {"forward,": "o", "balloon": "u"}, 11: {"drag?": "b", "rubs": "b"},
    12: {"drag": "b", "smooth": "g", "pointy.": "g"}, 13: {"lift?": "g", "wing's": "g"}, 14: {"curved": "g", "downward.": "o"},
    15: {"up,": "g", "window": "u"}, 16: {"lower": "o", "higher.": "b"}, 17: {"thrust": "o", "drag,": "b"},
    18: {"lift": "g", "weight,": "u", "180": "o"}, 19: {"balance": "o", "steady": "u"}, 20: {"engines": "u", "Nope.": "o"},
    21: {"speed.": "o", "lift.": "g"}, 22: {"down,": "u", "lifts,": "g", "push,": "o", "drags,": "b"}, 23: {"paper": "u", "60": "o"},
}
