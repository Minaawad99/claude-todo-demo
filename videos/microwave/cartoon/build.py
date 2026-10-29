"""Builds the cartoon-panel version of «إزاي المايكروويف بيسخن الأكل؟»: scenes.js = shared helpers + this episode's shots,
index.html = template + captions (words in yellow per line)."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
K = {0: ["دقيقتين،", "سخن", "نار."], 1: ["نار", "سخان؟"], 2: ["شوكة", "شرار؟"], 4: ["الجزيئات."], 5: ["بتتهز", "أسرع", "بتسخن."], 6: ["مية."],
     7: ["موجب", "سالب،", "مغناطيس"], 8: ["البوصلة:", "المغناطيس،", "الكهربا."], 9: ["ألفين", "وأربعمية", "وخمسين", "مليون"], 10: ["يلف", "رايح", "جاي،"],
     11: ["أسرع،", "أسخن."], 12: ["المغنطرون،", "ماسورة", "معدن"], 13: ["الحيطان،", "يشربها."], 14: ["الصينية", "سخنة", "باردة."], 15: ["بتلف", "السخن."],
     16: ["بيعكس", "المدببة", "شرار."], 17: ["سنتيمتر", "اتنين"], 18: ["جامد،", "تزحف", "دقيقة"], 19: ["بالصدفة،", "خمسة", "وأربعين."],
     20: ["بيرسي", "سبنسر", "رادار،", "الشوكولاتة", "ساحت"], 21: ["فشار،", "فاتفرقعت"], 22: ["قد", "الراجل،", "تلتمية", "وأربعين", "كيلو!"],
     23: ["المغنطرون", "والحيطان", "تتهز", "وتسخن."]}
data = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(open(os.path.join(HERE, "_helpers.js"), encoding="utf-8").read() + open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
html = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("/*CAPS*/", "window.CAPS = " + json.dumps(data, ensure_ascii=False) + ";")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(html)
print("built,", len(lines), "lines")
