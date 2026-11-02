"""Builds caps.js for the «أوعى» real-3D page: the script lines as words, with the coloured key words
(b blue = water/the safe action, o orange = fire/danger, g green = the fix). Run after editing K."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: {"مية.": "b", "أوعى": "o"}, 1: {"وكوباية": "b", "مية": "b", "تولّع": "o"}, 2: {"الحكاية؟": "o"}, 3: {"مية": "o", "وتمانين": "o"},
     4: {"دخان،": "o", "يولّع": "o"}, 5: {"والمية": "b", "أتقل": "b", "بتغطس": "b"}, 6: {"فبتغلي": "b"}, 7: {"بخار،": "b", "ألف": "o", "وسبعمية": "o"},
     8: {"كوباية": "b", "أربعين": "o", "جردل.": "o"}, 9: {"المولّع": "o"}, 10: {"كورة": "o", "نار": "o"}, 11: {"الدولاب،": "o", "والستاير،": "o"},
     12: {"اقفل": "g", "النار،": "g"}, 13: {"غطّي": "g", "الطاسة": "g"}, 14: {"أكسجين،": "b", "فتطفى": "g"}, 15: {"نص": "b", "ساعة،": "b"},
     16: {"بيكربونات": "g", "صودا": "g"}, 17: {"الدقيق،": "o", "انفجار": "o"}, 18: {"تشيل": "o", "وتجري": "o"}, 19: {"مية": "o", "وتمانين.": "o", "واقفل": "g", "باب": "g"},
     20: {"وتمشي.": "o"}, 21: {"دخان،": "o", "اقفل": "g", "النار،": "g"}, 22: {"غطا": "g", "جنبك": "g"}, 23: {"شارك": "b"}}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [K.get(i, {}).get(w, "") for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "caps.js"), "w", encoding="utf-8").write("window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("caps:", len(lines), "lines")
