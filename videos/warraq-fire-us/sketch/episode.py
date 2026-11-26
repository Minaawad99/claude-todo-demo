# «The Cairo Ring Road fire» — the American-English twin of videos/warraq-fire (same drawings, same shots, same pace).
# No promise line / bumper, no ask box: the end card carries the condolences and the four steps.
CFG = {
    "title": "The Cairo Ring Road Fire",
    "category": "Accidents & Safety",
    "libs": ["draw.js"],
    "chunk": 3.5,
    "intro_lines": 2,
    "promise": -1,
    "summary": 24,
    "cta": 99,
    "outro": '<div class="q">The Cairo Ring Road fire</div><div class="art"><svg id="outroArt" viewBox="0 0 600 280"></svg></div>'
             '<div class="leg"><span><b>1</b>Get away, upwind</span><span><b>2</b>Call 911</span><span><b>3</b>Cover the flames</span><span><b>4</b>Cool the burn with water</span></div>'
             '<div class="stat"><div class="n">30</div><div class="t">lives lost.<br>Rest in peace. Strength to their families, and a full recovery to the injured.</div></div>'
             '<div class="pts">1. Leave the car and get far away, upwind.<br>'
             '2. Call 911 (or your local number) and give the exact location.<br>'
             '3. Clothes on fire: stop, drop and roll, then cover with cotton or a blanket.<br>'
             '4. Burns: cool running water for 20 minutes. No toothpaste, no ice.'
             '<div class="more">Send this to someone you love. One day, it might save a life.</div></div>',
}
CAPTEXT = {
    0: "Wednesday, November 25th… at night.",
    4: "Fuel poured across the asphalt… and in under 30 seconds, the whole road was on fire.",
    5: "The fire jumped from car to car, one after another… more than 20 cars.",
    7: "In the end… 30 lives were lost, and dozens were injured.",
    14: "Second: call 911, or your local emergency number… and give the exact location.",
    17: "For the burn… cool running water, for 20 minutes.",
}
K = {
    0: {"Wednesday,": "o"}, 1: {"Ring": "b", "Road": "b", "Ashara": "u"},
    2: {"fuel,": "o"}, 3: {"flipped": "o", "over.": "o"}, 4: {"fire.": "o", "30": "u"},
    5: {"20": "o"}, 7: {"30": "o"},
    9: {"vapor": "b"}, 10: {"heavier": "o", "under": "b"}, 11: {"spark…": "o", "hot": "o", "wiring…": "o"},
    13: {"upwind,": "b", "away,": "g", "explode.": "o"}, 14: {"911,": "o", "exact": "u"},
    15: {"stop,": "o", "drop": "o", "roll.": "o"}, 16: {"cotton": "g", "blanket…": "g"},
    17: {"running": "b", "20": "o"}, 18: {"nope,": "o"}, 19: {"clean": "g"},
    20: {"smoke": "gr", "low,": "o", "clean": "b"}, 21: {"help.": "g"}, 22: {"filming…": "o", "fire": "o", "truck": "o"},
    23: {"away,": "g", "call,": "g", "cover,": "g", "cool": "b"},
}
SPLIT = {
    2: "Then suddenly… | a truck loaded with fuel, | and the driver lost control.",
    3: "It slammed into the concrete barrier… | and flipped over.",
    4: "Fuel poured across the asphalt… | and in under 30 seconds, | the whole road was on fire.",
    5: "The fire jumped from car to car, | one after another… | more than 20 cars.",
    6: "People inside their cars… | didn't make it out.",
    7: "In the end… | 30 lives were lost, | and dozens were injured.",
    8: "So how did the fire | spread that fast?",
    9: "Because it's not | the liquid fuel that burns… | it's the vapor | coming off it.",
    10: "And that vapor | is heavier than air… | it creeps along the ground, | and slips under the cars.",
    11: "And the first spark… | from a hot engine, | or a car's wiring… | lights up everything at once.",
    12: "So if you're ever | in that situation… | what do you do?",
    13: "First: leave the car, | and get away, upwind, | far away… | because the tank can explode.",
    14: "Second: | call 911, | or your local emergency number… | and give the exact location.",
    15: "If someone's | clothes catch fire… | they need to stop, | drop to the ground, | and roll.",
    16: "Cover them with a cotton jacket, | or a blanket… | to smother the flames.",
    17: "For the burn… | cool running water, | for 20 minutes.",
    18: "A lot of people think | toothpaste or ice | helps a burn… | nope, they make it worse.",
    19: "Don't pull off clothes | stuck to the skin… | cover it with a clean cloth, | until help arrives.",
    20: "If there's smoke around you… | get low, | the clean air is near the floor.",
    21: "And your phone, | in a moment like this… | has one job: | to call for help.",
    22: "Not to stand there filming… | and block the way | for a fire truck | that could save someone.",
    23: "So, bottom line… | get away, call, | cover, and cool it with water.",
}
