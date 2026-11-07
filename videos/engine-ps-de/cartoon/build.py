"""Builds the cartoon-panel version of «150 PS gegen 400 PS» (German): scenes.js = shared helpers + car pieces + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["hundertfünfzig", "PS,", "vierhundert."], 1: ["Zahl"], 2: ["dreimal"], 4: ["Pferdestärke:", "fünfundsiebzig", "Kilo", "Sekunde", "Meter"],
     5: ["Pferd", "fünfzehn", "PS."], 6: ["Ansaugen,", "Verdichten,", "Zünden,", "Ausstoßen."], 7: ["Kolben", "presst"], 8: ["Zündkerze,", "Explosion"],
     9: ["Kurbelwelle", "Drehung."], 10: ["vier", "Zylinder", "anderthalb", "Liter"], 11: ["V8", "vier", "Litern."], 12: ["Hubraum", "Luft", "Benzin"],
     13: ["Zylinder", "Explosionen"], 14: ["sechstausend", "zweihundertmal"], 15: ["vierhundertmal."], 16: ["Turbo."], 17: ["Abgase", "Turbinenrad", "zweihunderttausend"],
     18: ["Verdichter,", "Luft"], 19: ["Sauerstoff,", "Benzin"], 20: ["zwei", "Turbos"], 21: ["vierhundert", "fünf", "Zylindern,", "Ladedruck."],
     22: ["Drehmoment."], 23: ["kräftig", "Drehmoment", "Drehzahl."], 24: ["achteinhalb", "Sekunden", "vier."], 25: ["Benzin", "heißer."],
     26: ["größer,", "öfter", "Luft."], 27: ["Nächstes"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "pieces.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots-main.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
