# «How does your dog see you?» — the American English version of videos/dog-vision («اسكتش» style, channel name
# «Here's the Deal»). Same shots (loaded from ../../dog-vision/sketch), English words from en.js, English template here.
CFG = {
    "title": "How does your dog see you?",
    "category": "Animals · The senses",
    "libs": [],
    "promise": 3, "summary": 24, "cta": 25, "intro_lines": 3,
    "outro": '<div class="q">How does your dog see you? And how does it know it\'s you?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Blurry eyes: 4× weaker</span><span><b>2</b>Just 2 colors: blue &amp; yellow</span><span><b>3</b>300 million scent cells</span><span><b>4</b>Your smell = your ID</span></div>'
             '<div class="stat"><div class="n">300M</div><div class="t">scent cells in its nose.<br>You have about 6 million.</div></div>'
             '<div class="pts">1. No sharp-detail spot in its eye, so you look blurry, and reds and greens turn a muddy yellow-gray.<br>'
             '2. Its brain barely tells your face from the back of your head, so it knows you by smell.<br>'
             '3. The nose splits the air, breathes out the side slits, and each nostril smells on its own.'
             '<div class="more">Bonus: in an MRI, the owner\'s smell lit up the dog\'s reward center more than any other smell.</div></div>',
}
CAPTEXT = {
    5: "Your eye has a tiny spot packed with detail cells. Your dog's eye doesn't, so its vision is about 4× weaker.",
    6: "What you can read clearly from 60 feet away, your dog has to walk up to about 15 feet to see the same.",
    13: "Its nose has up to 300 million scent cells. You've got about 6 million.",
    14: "That's enough to smell 1 teaspoon of sugar dissolved in 2 Olympic swimming pools.",
}
K = {
    0: {"sees": "o", "you.": "o"}, 1: {"Blurry.": "u", "reds,": "o", "greens.": "g"}, 2: {"never": "b", "Ever.": "b"},
    4: {"blurry?": "u"}, 5: {"tiny": "o", "spot": "o", "4×": "o", "weaker.": "o"}, 6: {"60": "o", "15": "b"},
    7: {"two": "o", "three.": "b"}, 8: {"blues": "b", "yellows": "o", "yellow-gray.": "u"}, 9: {"frosted": "b", "bathroom": "b"},
    10: {"face,": "u", "you?": "o"}, 11: {"Hungary": "g", "face": "o", "head.": "o"}, 12: {"smell.": "o"},
    13: {"300": "o", "million": "o", "6": "b"}, 14: {"teaspoon": "o", "sugar": "o", "Olympic": "b"}, 15: {"nose": "g"},
    16: {"lungs,": "b", "smell.": "o"}, 17: {"side": "g", "slits,": "g"}, 18: {"own,": "o", "where": "o", "ears": "g"},
    19: {"MRI,": "g", "owner's": "o", "reward": "o", "center": "o"}, 20: {"black": "u", "white.": "u", "Nope.": "o"},
    21: {"motion": "o", "dark.": "b"}, 22: {"blurry": "u", "fewer": "u", "fingerprint.": "o"},
    23: {"identical": "o", "twins": "o", "house,": "g", "food.": "g"},
}
