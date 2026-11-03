"""Builds caps.js for the «أوعى» real-3D page: the script lines as words, with the coloured key words
(b blue = water/the safe action, o orange = fire/danger, g green = the fix). Run after editing K."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: {"المخدة": "o", "أوعى": "o", "موبايلك": "b"}, 1: {"يولّع": "o", "السرير": "o"}, 2: {"الحكاية؟": "o"}, 3: {"بطارية": "b", "ليثيوم،": "b", "طبقات": "b"},
     4: {"موجبة،": "o", "سالبة،": "b", "الفاصل.": "b"}, 5: {"بيولّع": "o"}, 6: {"الليثيوم": "b", "حرارة.": "o"}, 7: {"للهوا": "b"},
     8: {"البطانية،": "o", "بتحبس": "o", "الحرارة": "o"}, 9: {"خمسة": "b", "وتلاتين": "b", "درجة": "b"}, 10: {"تنتفخ": "o"}, 11: {"مية": "o", "وتلاتين": "o", "يسيح.": "o"},
     12: {"ماس": "o"}, 13: {"الانفلات": "o", "الحراري.": "o"}, 14: {"أكسجين": "o", "تتطفي.": "o"}, 15: {"راسك،": "o", "نار": "o"},
     16: {"اتنين": "o", "مليون": "o", "ونص": "o"}, 17: {"الكومودينو": "g", "سطح": "g", "ناشف": "g", "ومكشوف.": "g"}, 18: {"شيل": "g", "الجراب": "g"},
     19: {"منفوخة": "o", "وغيّر": "g", "البطارية.": "g"}, 20: {"المضروب،": "o"}, 21: {"دخان،": "o", "اشده": "g", "الفيشة": "g", "بالمطافي": "g"},
     22: {"بعيد": "g", "السرير": "g"}, 23: {"شارك": "b"}}
for i, ws in K.items():
    for w in ws:
        if w not in lines[i].split(" "): print("keyword not found", i, w)
data = [{"w": l.split(" "), "k": [K.get(i, {}).get(w, "") for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "caps.js"), "w", encoding="utf-8").write("window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("caps:", len(lines), "lines")
