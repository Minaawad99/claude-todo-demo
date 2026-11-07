"""Builds the cartoon-panel version of «Wie fliegt ein Flugzeug?» (German): scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["A380", "fünfhundertfünfundsiebzig", "Tonnen."], 1: ["vierhundert", "Autos."], 2: ["Koloss", "Luft?"], 4: ["vier", "Kräfte."], 5: ["Gewicht", "Auftrieb"],
     6: ["Schub", "Luftwiderstand"], 7: ["Triebwerke."], 8: ["Fan", "Tonne", "Luft"], 9: ["verdichtet,", "Kerosin", "verbrannt"], 10: ["meisten", "Schub", "Riesenpropeller."],
     11: ["dreihundert", "Sachen"], 12: ["Flügel"], 13: ["gewölbt", "angestellt."], 14: ["nach", "unten"], 15: ["unten,", "oben."], 16: ["schneller,", "Druck."],
     17: ["hoher", "niedriger,", "gesaugt."], 18: ["früher", "Schulbücher"], 19: ["Quadratmeter", "sechshundertachtzig", "Kilo."], 20: ["Hand", "Autofenster:"],
     21: ["Klappen", "größer", "gewölbter."], 22: ["Sidestick,", "hebt", "ab."], 23: ["Querrudern", "Höhen-", "Seitenruder"], 24: ["elf", "Kilometern", "dünn,"],
     25: ["Boeing", "787", "sieben", "Meter"], 26: ["Fünfhundertfünfundsiebzig", "Tonnen", "Luft", "unten"], 27: ["Nächstes"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
