# «Here's the Thing» — How a Body Decomposes. English edition of decomp-ar (same drawings, see make.sh). «اسكتش» style.
CFG = {
    "lang": "en",
    "summary": 24,
    "title": "What Happens to a Body After Death?",
    "category": "FORENSIC SCIENCE",
    "outro": '<div class="q">What happens to the human body after death?</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Self-digestion</span><span><b>2</b>Bloat</span><span><b>3</b>Active decay</span><span><b>4</b>Skeleton</span></div>'
             '<div class="stat"><div class="n">8×</div><div class="t">faster in open air<br>than buried in soil</div></div>'
             '<div class="pts">1. Without oxygen, a cell\'s own enzymes digest it; the body cools, blood settles, muscles stiffen.<br>'
             '2. Gut bacteria make gases that bloat the body, and the smell brings insects.<br>'
             '3. Soft tissue breaks down and the bones remain; temperature and place set the pace.'
             '<div class="more">Bonus fact: hair and nails don\'t grow after death. The skin shrinks back.</div></div>',
}
CAPTEXT = {9: "Meanwhile, the body cools by about 1.5°F an hour."}
K = {
    0: {"dies?": "o"}, 1: {"heart": "o", "eating": "o", "itself": "o"}, 2: {"first": "u"}, 4: {"rule.": "g"}, 5: {"oxygen.": "b", "apart.": "o"},
    6: {"autolysis,": "o", "self-digestion.": "o"}, 7: {"enzymes": "o", "burst.": "o"}, 8: {"digest": "o", "stomach": "u"}, 9: {"cools": "b", "1.5°F": "o"},
    10: {"gravity": "u", "purple": "o"}, 11: {"stiffen": "o", "loosen": "g"}, 12: {"Bloat.": "o"}, 13: {"trillions": "o", "bacteria,": "g", "immune": "u"},
    14: {"gas,": "o", "balloon": "u"}, 15: {"flies": "u"}, 16: {"active": "o", "decay.": "o", "mass.": "u"}, 17: {"skeleton": "g", "centuries.": "o"},
    18: {"Temperature": "o", "Warmth": "o", "cold": "b"}, 19: {"twice": "o", "eight": "o"}, 20: {"hair": "u", "nails": "u", "Nope.": "o"},
    21: {"dries": "o", "shrinks": "o"}, 22: {"digest": "o", "bloat": "g", "insects": "u", "bones": "o"}, 23: {"Tennessee": "o", "time": "u", "death": "u"},
}
