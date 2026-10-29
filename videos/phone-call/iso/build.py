"""Builds index.html for «صوتك بيروح فين؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>صوتك بيروح فين؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("مش بيطير في الهوا", "heat")], 1: [("لأرقام", "part"), ("تحت الأرض!", "heat")], 2: [("ربع ثانية.", "water")], 4: [("هوا بيتهز.", "water")], 5: [("ميكروفون", "part")],
     6: [("لكهربا", "heat")], 7: [("آلاف المرات في الثانية", "heat"), ("لأرقام.", "part")], 8: [("أقل مساحة", "part")], 9: [("إزاي؟", "heat")], 10: [("أنتينا", "part"), ("موجات راديو.", "heat")],
     11: [("عيلة النور", "heat"), ("مبتشوفهاش.", "part")], 12: [("سرعة النور", "heat")], 13: [("أقرب برج", "heat")], 14: [("مش بيرمي", "heat")], 15: [("تحت الأرض", "heat"), ("زي الشعرة.", "part")],
     16: [("ومضات نور", "heat"), ("مليارات", "heat")], 17: [("أنهي برج", "part")], 18: [("أنا هنا.", "heat")], 19: [("موجات راديو", "heat")], 20: [("يفك الأرقام", "part"), ("كهربا.", "heat")],
     21: [("سماعة صغيرة", "part")], 22: [("الهوا", "water"), ("شكل صوتك", "heat")], 23: [("البرج بعد عنك؟", "heat")], 24: [("بتسلّمك", "water"), ("تقطع.", "heat")],
     25: [("هوا،", "water"), ("كهربا،", "heat"), ("أرقام،", "part"), ("نور،", "heat"), ("هوا تاني.", "water")]}
NUM = {"تلاتمية ألف": "300 ألف"}
def brk(t):
    if len(t) < 34: return t
    best = None
    for m in re.finditer("،", t):
        if m.start() > len(t) * 0.3 and (best is None or abs(m.start() - len(t) / 2) < abs(best - len(t) / 2)): best = m.start()
    return t if best is None else t[:best + 1] + "<br>" + t[best + 1:].lstrip()
def cap_text(i):
    t = lines[i]
    for a, b in NUM.items(): t = t.replace(a, b)
    for w, c in K.get(i, []):
        if w in t: t = t.replace(w, f'<span class="tz-k tz-k--{c}">{w}</span>', 1)
    return brk(t)
def caps(rng, style=""):
    return "\n".join(f'      <div class="cap" data-cap="{i}"{style}><p data-words="{i}">{cap_text(i)}</p></div>' for i in rng)
body = open(os.path.join(HERE, "template.html"), encoding="utf-8").read().replace("<!--MARK-->", mark)
PL = [5, 6, 7, 8, 11, 12, 16, 20, 21, 25]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 26)))
body = body.replace("<!--CAPS_OUT-->", caps(range(26, 27), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
