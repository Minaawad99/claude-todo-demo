"""Builds a «الرسم الهندسي» episode page. Copy this file to videos/<episode>/diagram/ next to episode.py and shots.js, then
run `python3 build.py`. It writes scenes.js (shared helpers + this episode's shots) and index.html (the shared template
with this episode's title, category, summary card and caption data). The page loads ../timing.js and the shared engine.

episode.py sets:
  CFG = {"title": …, "category": …, "outro": <summary-card HTML>, "watermark": "" or "إيه الحكاية؟ | @handle"}
        optional: "libs": extra scripts loaded before scenes.js (default ["../../lib/geo.min.js"], which globe() needs)
        optional: "intro_lines" (how many hook lines before the promise), "promise", "summary", "cta" (line indexes)
  K   = {line: {word: "o" | "b" | "g" | "u" | "gr" | "o u"}}   key words in the caption / hook:
        o orange (action, danger, heat, numbers) · b blue (water, air, cold, the technical term) · g olive (the named part)
        u underline · gr grey (a line that carries on in the next shot). Words must match the caption text exactly.
  CAPTEXT = {line: "text"}    what the caption shows when it differs from the spoken line (digits: «100,000 فولت»)
  SPLIT   = {line: "part one | part two"}   where to break a line into caption chunks (default: at ، … . ؟ and every ~6 words)
"""
import os, re, json, html
HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "../../_templates/sketch")
CFG, K, CAPTEXT, SPLIT = {}, {}, {}, {}
exec(open(os.path.join(HERE, "episode.py"), encoding="utf-8").read())
lines = [l.strip() for l in open(os.path.join(HERE, "../script.txt"), encoding="utf-8") if l.strip()]
n = len(lines)

def find(pred, default):
    for i, l in enumerate(lines):
        if pred(l): return i
    return default
EN = CFG.get("lang") == "en"   # English edition («Here's the Thing»): same drawings, LTR captions and cards
promise = CFG.get("promise", find(lambda l: ("إيه الحكاية" in l and "هشرح" in l) or ("here's the thing" in l.lower() and "explain" in l.lower()), -1))
intro_lines = CFG.get("intro_lines", promise if promise > 0 else 1)
summary = CFG.get("summary", find(lambda l: l.startswith("ودي كانت") or l.startswith("وده كان") or l.startswith("And that's"), n - 2))
cta = CFG.get("cta", find(lambda l: "قولولنا" in l or l.startswith("Tell us"), n - 1))

def words_html(ws, keys):
    out = []
    for w in ws:
        c = " ".join("k-" + x for x in keys.get(w, "").split())
        out.append('<span class="%s">%s</span>' % (c, html.escape(w)) if c else html.escape(w))
    return " ".join(out)

BREAK = ("،", ",", "…", ".", "؟", "!", ":", "؛")
def chunks_of(i):
    text = CAPTEXT.get(i, lines[i])
    if i in SPLIT: parts = [p.strip().split() for p in SPLIT[i].split("|") if p.strip()]
    else:
        ws, parts, cur = text.split(), [], []
        for j, w in enumerate(ws):
            cur.append(w)
            if w.endswith(BREAK) and len(cur) >= 2 and len(ws) - j - 1 >= 2: parts.append(cur); cur = []
        if cur: parts.append(cur)
        out = []
        for p in parts:   # long chunks: split into pieces of about 5 words
            k = max(1, round(len(p) / 5.5))
            size = -(-len(p) // k)
            out += [p[s:s + size] for s in range(0, len(p), size)]
        parts = out
    total = sum(len(" ".join(p)) for p in parts) + len(parts) - 1
    res, pos = [], 0
    for p in parts:
        res.append({"f": round(pos / max(1, total), 4), "h": words_html(p, K.get(i, {}))})
        pos += len(" ".join(p)) + 1
    return res

for i, ks in K.items():
    shown = CAPTEXT.get(i, lines[i]).split()
    for w in ks:
        if w not in shown: print("keyword not found in line", i, repr(w))

caps = [chunks_of(i) for i in range(n)]
hook = []
for i in range(intro_lines):
    ws, pos, row = lines[i].split(), 0, []
    total = len(lines[i])
    for w in ws:
        c = " ".join("k-" + x for x in K.get(i, {}).get(w, "").split())
        row.append({"w": html.escape(w), "c": c, "f": round(pos / max(1, total), 4)}); pos += len(w) + 1
    hook.append(row)
data = {"caps": caps, "hook": hook, "introLines": intro_lines, "promise": promise, "summary": summary, "cta": cta, "watermark": CFG.get("watermark", "")}
chunks = [[c["f"] for c in cs] for cs in caps]

open(os.path.join(HERE, "scenes.js"), "w", encoding="utf-8").write(
    "window.CHUNKS = " + json.dumps(chunks) + ";\n" + open(os.path.join(TPL, "_helpers.js"), encoding="utf-8").read() + "\n" +
    open(os.path.join(HERE, "shots.js"), encoding="utf-8").read())
page = open(os.path.join(TPL, "template.html"), encoding="utf-8").read()
for k, v in [("/*TITLE*/", CFG.get("title", "")), ("/*CATEGORY*/", CFG.get("category", "")), ("/*OUTRO*/", CFG.get("outro", "")),
             ("/*WATERMARK*/", html.escape(CFG.get("watermark", ""))),
             ("/*LIBS*/", "".join('<script src="%s"></script>' % src for src in CFG.get("libs", ["../../lib/geo.min.js"]))), ("/*DATA*/", "window.DATA = " + json.dumps(data, ensure_ascii=False) + ";")]:
    page = page.replace(k, v)
if EN:   # the fixed lines in English, Latin font, left-to-right text (the drawings keep their RTL anchors)
    for k, v in [("family=Noto+Sans+Arabic:", "family=Noto+Sans:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:"),
                 ('"Noto Sans Arabic"', '"Noto Sans", "Noto Sans Arabic"'), ("'Noto Sans Arabic'", "'Noto Sans', 'Noto Sans Arabic'"),
                 ('<html lang="ar"', '<html lang="en"'), ("إيه الحكاية؟", "Here's the Thing"),
                 ('هشرحهالك في <span class="k-o">دقيقة.</span>', 'I\'ll explain it in a <span class="k-o">minute.</span>'),
                 ('<div class="l1">قولولنا…</div><div class="l2">عايزين تعرفوا</div><div class="l3">حكاية', '<div class="l1">Tell us…</div><div class="l2">what should we explain</div><div class="l3">next'),
                 ('<span class="caret" id="caret"></span></span>؟', '<span class="caret" id="caret"></span></span>?'),
                 (">؟</text></g>", ">?</text></g>"), ("</style>", "  #cap, #intro .hook, #intro .cat, #bumper .name, #bumper .sub, #outro .q, #outro .leg, #outro .stat, #outro .pts, #outro .ask, .logo { direction: ltr; }\n</style>", )]:
        page = page.replace(k, v, 1 if k == "</style>" else -1)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("built: %d lines, %d caption chunks · hook lines 0-%d · promise %d · summary %d · ask %d"
      % (n, sum(len(c) for c in caps), intro_lines - 1, promise, summary, cta))
