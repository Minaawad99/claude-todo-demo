"""Builds the cartoon-panel version of «Wie erkennt der Pfandautomat deine Flasche?» (German): scenes.js = shared helpers + pieces + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["Flasche", "Sekunde", "fünfundzwanzig", "Cent."], 1: ["Pfandflasche"], 2: ["spuckt"], 4: ["zweitausenddrei", "Pfand", "Einwegflaschen", "Dosen."],
     5: ["fünfundzwanzig", "Cent"], 6: ["Rollen"], 7: ["Kameras"], 8: ["Strichcode"], 9: ["Einweg", "Mehrweg"], 10: ["Pfandlogo", "Pfeil", "Flasche."],
     11: ["Spezialfarbe", "Infrarot"], 12: ["kopieren."], 13: ["Form,", "wiegen"], 14: ["zerdrückt", "Etikett,", "zurück."], 15: ["Computer", "Sekundenbruchteilen,"],
     16: ["Presse", "platt"], 17: ["geschreddert", "neuen", "Flaschen"], 18: ["Mehrwegflaschen", "heil", "Kasten."], 19: ["Abfüller,", "gewaschen", "befüllt."],
     20: ["fünfzig"], 21: ["acht", "Glas,", "fünfzehn", "Plastik."], 22: ["Pfandbon."], 23: ["Brüder", "Norwegen,", "neunzehnhundertzweiundsiebzig."], 24: ["Tomra"],
     25: ["achtundneunzig", "Prozent"], 26: ["gedreht,", "fotografiert,", "geprüft", "sortiert."], 27: ["Nächstes"]}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "pieces.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots-main.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
