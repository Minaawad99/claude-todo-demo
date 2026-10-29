"""Builds index.html for «إزاي الـ GPS بيعرف إن فيه زحمة؟» (paper version) (إيه الحكاية؟). Base page styles come from the
dishwasher episode; captions from script.txt with keywords coloured by meaning."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
dw = open(os.path.join(HERE, "../../dishwasher/index.html"), encoding="utf-8").read()
head = dw[:dw.index("  /* 3D model */")].replace("../../design-system/", "../../../design-system/").replace("<title>إزاي غسالة الأطباق بتغسل بجردل مية؟ — إيه الحكاية؟</title>", "<title>إزاي الـ GPS بيعرف إن فيه زحمة؟ — إيه الحكاية؟</title>")
mark = dw[dw.index("    <!-- mark: speech bubble"):dw.index("    <!-- dishwasher, closed")]
K = {0: [("الخط الأحمر", "heat")], 1: [("مفيش كاميرا", "part")], 2: [("زحمة", "heat")], 4: [("مابيعرفش زحمة", "heat")], 5: [("إنت فين،", "part"), ("أقمار صناعية", "part")],
     6: [("أربع أقمار", "part"), ("بُعدك", "water")], 7: [("مكانك بالظبط", "heat")], 8: [("بتبعت.", "water")], 9: [("مكانه وسرعته", "water"), ("من غير اسمك.", "part")],
     10: [("آلاف الموبايلات", "water")], 11: [("ستين،", "water"), ("عشرة،", "heat")], 12: [("زحمة،", "heat"), ("أحمر.", "heat")], 13: [("أخضر.", "water")], 14: [("بتفتكر كل يوم:", "part")],
     15: [("تتوقع الزحمة", "heat"), ("هتوصل إمتى.", "part")], 16: [("طريق تاني أسرع،", "water")], 17: [("الناس نفسها", "part"), ("حادثة", "heat")], 18: [("تسعة وتسعين موبايل،", "heat"), ("شارع فاضي.", "part")],
     19: [("أحمر!", "heat")], 20: [("بتشوف الموبايلات!", "heat")], 21: [("نفس اللحظة.", "part")], 22: [("أدق.", "water")], 23: [("بتساعد غيرك", "water")]}
NUM = {}
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
PL = [6, 9, 14, 18, 19]
panels = "\n".join(f'      <div class="panel" data-v="fade" data-l="{i}" data-o="0.15" data-d="0.35"><div class="panel tz-paper inset" data-v="out" data-l="{i + 1}" data-o="-0.25" data-d="0.3" style="opacity:1"><svg id="pp{i}" viewBox="0 0 360 488"></svg></div></div>' for i in PL)
body = body.replace("<!--PANELS-->", panels)
body = body.replace("<!--CAPS_INTRO-->", caps(range(0, 3), ' style="font:700 21px/1.55 var(--font-sans);padding:12px 4px;text-align:right"'))
body = body.replace("<!--CAPS_MAIN-->", caps(range(4, 24)))
body = body.replace("<!--CAPS_OUT-->", caps(range(24, 25), ' style="font-size:15px;padding:4px 0 0"'))
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(head + body)
print("index.html built,", len(lines), "lines")
