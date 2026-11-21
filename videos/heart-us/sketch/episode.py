# "Why does a woman's heart beat faster than a man's?" — the American English version of videos/heart, in the «اسكتش»
# style. Same drawings (shots.js of videos/heart), built left to right in English (CFG "lang": "en").
CFG = {
    "title": "Why does her heart beat faster?",
    "category": "THE HUMAN BODY",
    "lang": "en",
    "shots": "../../heart/sketch/shots.js",
    "libs": [],
    "promise": 3, "summary": 25, "cta": 26,
    "outro": '<div class="q">Why does a woman\'s heart beat faster than a man\'s?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>a smaller heart</span><span><b>2</b>the pacemaker</span><span><b>3</b>empties a bigger share</span><span><b>4</b>a faster beat</span></div>'
             '<div class="stat"><div class="n">+3–7</div><div class="t">extra beats a minute<br>for women, on average</div></div>'
             '<div class="pts">1. After puberty his heart is about a quarter heavier, so each of her beats pushes less blood.<br>'
             '2. Her pacemaker fires faster to move the same blood, like a cup scooping faster than a bucket.<br>'
             '3. After ovulation her sleeping pulse sits about 3 beats higher, and it is all normal (60–100).'
             '<div class="more">Bonus: just 5 extra beats a minute = over 7,000 extra beats a day.</div></div>',
}
CAPTEXT = {
    5: "At rest, your body needs about 5 liters of blood every minute, and the heart has to deliver it.",
    13: "So on average, a woman's heart beats about 3 to 7 extra times a minute.",
    16: "After ovulation, your sleeping pulse sits about 3 beats higher than on your period.",
    21: "Normal for adults is 60 to 100 beats a minute, and this gap is totally normal.",
    23: "And here's the wild part: just 5 extra beats a minute adds up to over 7,000 a day.",
    24: "That's about 2.5 million extra beats every year.",
}
K = {
    0: {"woman's": "o", "faster": "o"}, 1: {"stress,": "u", "nerves.": "u"}, 2: {"smaller.": "o"},
    5: {"5": "o", "liters": "o"}, 6: {"puberty,": "b", "size.": "g"}, 7: {"quarter": "o", "heavier.": "b"},
    8: {"less": "o"}, 9: {"cup": "o", "bucket.": "b"}, 10: {"faster": "o"}, 11: {"spark": "o", "pacemaker.": "o"},
    12: {"faster,": "o"}, 13: {"3": "o", "7": "o"}, 14: {"smartwatch.": "g"}, 15: {"cycle": "o"},
    16: {"ovulation,": "o", "3": "o"}, 17: {"progesterone": "g"}, 18: {"Nope.": "o", "bigger": "o"}, 19: {"last": "b", "drop.": "b"},
    20: {"anxiety,": "u", "tired": "u", "Nope.": "o"}, 21: {"60": "o", "100": "o", "normal.": "g"},
    22: {"smaller": "o", "faster": "o"}, 23: {"7,000": "o"}, 24: {"2.5": "o", "million": "o"},
}
