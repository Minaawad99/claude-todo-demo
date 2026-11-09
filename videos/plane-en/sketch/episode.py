# «Here's the Thing» — How Planes Fly. English edition of plane-ar (same drawings, see make.sh). «اسكتش» style.
CFG = {
    "lang": "en",
    "title": "How Do Planes Fly?",
    "category": "SCIENCE",
    "outro": '<div class="q">How does a 70-ton plane stay in the air?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>The wing</span><span><b>2</b>Air bent down</span><span><b>3</b>Lift</span><span><b>4</b>Speed from the engines</span></div>'
             '<div class="stat"><div class="n">180</div><div class="t">mph, roughly the takeoff<br>speed of a big jet</div></div>'
             '<div class="pts">1. A curved, tilted wing pushes air down, and the air pushes the wing up.<br>'
             '2. Air over the top is faster with lower pressure, air below has higher pressure: the same story, another angle.<br>'
             '3. Engines give the speed, and flaps let the plane fly slowly.'
             '<div class="more">Bonus fact: the air over the wing reaches the back before the air underneath, not at the same moment.</div></div>',
}
CAPTEXT = {0: "This plane weighs more than 70 tons…", 16: "That's why a big jet races down the runway at around 180 miles an hour."}
K = {
    0: {"70": "o", "tons…": "o"}, 1: {"rotor": "u"}, 2: {"clouds": "b"}, 4: {"rule.": "g"}, 5: {"down,": "o", "up": "b"},
    6: {"Air.": "b"}, 7: {"curved": "g", "tilted": "o"}, 8: {"curve": "g", "down": "o"}, 9: {"tons": "o", "up.": "b"},
    10: {"window": "u", "lift.": "o"}, 11: {"faster,": "b", "drops.": "o"}, 12: {"higher": "b", "up.": "b"}, 13: {"two": "u", "sides.": "o"},
    14: {"forward.": "o"}, 15: {"speed,": "o"}, 16: {"180": "o", "miles": "o"}, 17: {"flaps.": "g"}, 18: {"slow.": "u"},
    19: {"meet": "u", "Nope.": "o"}, 20: {"first.": "o"}, 21: {"down,": "o", "speed.": "g"}, 22: {"upside": "o", "down,": "o"},
}
