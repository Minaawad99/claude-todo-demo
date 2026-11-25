"""Turns the plan into overlay states: for every stretch of time, what the caption layer shows.
python3 events.py <out.json>"""
import json, re, sys
from plan import L, SHOTS, END, at, CAPTEXT, RED, BLUE, GOLD, CHIPS, CROSSES, STAMPS, RECAP_ICONS, recap_xy, S

PUNCT = "«»،,.:؟!"
def bare(w): return w.strip(PUNCT)
def colour(w):
    b = bare(w)
    if w in RED or b in RED: return "r"
    if b.replace("–", "").isdigit() or any(c.isdigit() for c in b) or b in GOLD or w in GOLD: return "g"
    if w in BLUE or b in BLUE: return "b"
    return ""

def tokens(i):
    """display words of line i with the time each is spoken"""
    text = L[i]["text"]; st, en = L[i]["start"], L[i]["end"]
    spans, pos = [], 0
    for w in text.split():
        k = text.index(w, pos); spans.append([w, k]); pos = k + len(w)
    out, j = [], 0
    while j < len(spans):
        hit = None
        for say, show in CAPTEXT.items():
            n = len(say.split())
            seq = " ".join(bare(s[0]) for s in spans[j:j + n])
            if seq == say: hit = (n, show + (spans[j + n - 1][0][len(bare(spans[j + n - 1][0])):] if spans[j + n - 1][0] != bare(spans[j + n - 1][0]) else "")); break
        if hit: out.append((hit[1], spans[j][1])); j += hit[0]
        else: out.append((spans[j][0], spans[j][1])); j += 1
    return [(w, st + (en - st) * k / len(text)) for w, k in out]

def chunks(i):
    tk = tokens(i); res, cur = [], []
    for j, (w, t) in enumerate(tk):
        cur.append((w, t))
        left = len(tk) - j - 1
        if (w[-1] in "،.:؟!" and len(cur) >= 2 and left >= 2) or (len(cur) >= 4 and left >= 2): res.append(cur); cur = []
    if cur: res.append(cur)
    return res

CAP = []   # (t0, t1, [(word, time, colour)])
for i in range(len(L)):
    if any(s[0] == i for s in STAMPS): continue
    cs = chunks(i)
    for k, c in enumerate(cs):
        t0 = c[0][1] - 0.08
        t1 = cs[k + 1][0][1] - 0.08 if k + 1 < len(cs) else (S[i + 1] - 0.08 if i + 1 < len(L) else END)
        CAP.append((t0, t1, [(w, t, colour(w)) for w, t in c]))

def shot_end(t):
    for k, s in enumerate(SHOTS):
        if s[0] > t + 1e-6: return s[0]
    return END
def line_end(i): return S[i + 1] if i + 1 < len(L) else END

CH = [(at(i, w), line_end(i), txt) for i, w, txt in CHIPS]
XS = [(at(i, w), shot_end(at(i, w))) for i, w in CROSSES]
ST = [(S[i] - 0.05, line_end(i), txt) for i, txt in STAMPS]
RC = [(at(22, w), recap_xy(*c), size * 2.3) for c, size, w in RECAP_ICONS]
RC_END = line_end(22)

times = {0.0, END}
for a, b, ws in CAP: times |= {a, b} | {t for _, t, _ in ws}
for a, b, *_ in CH + XS + ST: times |= {a, b}
for a, *_ in RC: times.add(a)
times.add(S[22]); times.add(RC_END)
times = sorted(t for t in times if 0 <= t <= END)

def state(t):
    s = {"cap": None, "chips": [], "x": False, "stamp": None, "recap": None}
    for a, b, ws in CAP:
        if a <= t < b: s["cap"] = [[w, 1 if wt <= t + 0.02 else 0, c] for w, wt, c in ws]
    s["chips"] = [txt for a, b, txt in CH if a <= t < b][-1:]
    s["x"] = any(a <= t < b for a, b in XS)
    for a, b, txt in ST:
        if a <= t < b: s["stamp"] = txt
    if S[22] <= t < RC_END:
        lit = [k for k, (a, *_r) in enumerate(RC) if a <= t + 0.02]
        s["recap"] = [{"x": xy[0], "y": xy[1], "s": sz, "on": k in lit, "cur": bool(lit) and k == lit[-1]} for k, (a, xy, sz) in enumerate(RC)]
    return s

out = []
for a, b in zip(times, times[1:]):
    if b - a < 1 / 60: continue
    st = state((a + b) / 2)
    if out and out[-1]["s"] == st: out[-1]["b"] = b
    else: out.append({"a": a, "b": b, "s": st})
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False)
print(len(out), "states")
