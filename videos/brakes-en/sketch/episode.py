# «Here's the Thing» — How Brakes Stop a Car. English edition of brakes-ar (same drawings, see make.sh).
CFG = {
    "lang": "en",
    "title": "How Do Brakes Stop a Car?",
    "category": "CARS",
    "outro": '<div class="q">How does a tap of your foot stop a ton and a half of car?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Pedal and booster</span><span><b>2</b>Fluid and pistons</span><span><b>3</b>Pads and disc</span><span><b>4</b>Tires on the road</span></div>'
             '<div class="stat"><div class="n">1+</div><div class="t">ton of clamping force,<br>from a push of about 70 pounds</div></div>'
             '<div class="pts">1. The pedal is a lever; the booster and pistons multiply your push dozens of times.<br>'
             '2. Pads squeeze the disc, and friction turns motion energy into heat.<br>'
             '3. The tires stop the car, and ABS keeps the wheels from locking and sliding.'
             '<div class="more">Bonus fact: electric cars brake with the motor and send part of that energy back to the battery.</div></div>',
}
CAPTEXT = {1: "It's doing 60 miles an hour, and it stops in about 130 feet.", 7: "Step one: the pedal itself is a lever. It multiplies your foot's push about 4 times.",
           12: "So your foot pushed with about 70 pounds, and the brakes clamped with more than a ton.",
           15: "That friction turns motion into heat, and in hard braking the disc can pass 900°F.",
           20: "That's why there's ABS. It releases and grabs the brakes up to 15 times a second."}
K = {
    0: {"ton": "o", "half?": "o"}, 1: {"60": "o", "130": "o"}, 2: {"pedal.": "u"}, 4: {"rule.": "g"}, 5: {"disappears.": "o", "motion": "b"},
    6: {"heat.": "o"}, 7: {"lever.": "g", "4": "o"}, 8: {"booster.": "g", "vacuum": "b"}, 9: {"piston,": "g", "fluid": "o"}, 10: {"squashed,": "o", "four": "u"},
    11: {"bigger": "g", "jack": "u"}, 12: {"70": "o", "ton.": "o"}, 13: {"disc": "g"}, 14: {"pads": "g", "squeeze": "o"}, 15: {"heat,": "o", "900°F.": "o"},
    16: {"hollow": "g", "cools": "b"}, 17: {"grip": "o"}, 18: {"lock": "u", "Nope.": "o"}, 19: {"slides,": "o"}, 20: {"ABS.": "o", "15": "o"},
    21: {"gripping": "g"}, 22: {"pushes,": "u", "force,": "o", "disc,": "g", "heat.": "o"}, 23: {"Electric": "b", "battery": "g"},
}
