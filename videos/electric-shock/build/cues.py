"""Sound effects only (no music, the user's rule). Writes ../cues.json for videos/audio/sfx.py.
Synthesized fx from sfx.py plus the sketch kit's water clip."""
import json, os
from plan import SHOTS, S, at, EP, CROSSES, CHIPS, RECAP_ICONS
KIT = os.path.join(EP, "../_templates/sketch/sfx")
c = []
def fx(t, name, gain=1.0, dur=None, **k):
    d = {"t": round(t, 3), "fx": name, "gain": gain}; d.update(k)
    if dur: d["dur"] = dur
    c.append(d)
# a soft whoosh on every picture change
for t, m, o in SHOTS[1:]: fx(t - 0.15, "whoosh", 0.35)
# the hook: the live wire buzzes and cracks
fx(0.0, "hum", 0.55, 6.4); fx(0.4, "spark", 0.7); fx(2.2, "spark", 0.6); fx(4.3, "spark", 0.7)
fx(S[1], "thud", 0.9); fx(S[1] + 0.05, "zap", 0.8)               # «اوعى تمد إيدك!»
fx(S[3] + 0.2, "charge", 0.6, 1.2); fx(S[4] + 0.3, "spark", 0.6)  # current up the arm, the fist locks
fx(S[5] + 0.3, "thud", 0.5); fx(S[5] + 1.1, "thud", 0.5); fx(S[5] + 2.0, "charge", 0.5, 1.4)   # two beats, then the quiver
fx(S[6] + 0.6, "zap", 0.7); fx(S[6] + 0.9, "hum", 0.4, 2.0)       # current runs into the helper
fx(S[7] + 1.6, "clank", 0.6)                                       # main switch down
fx(at(7, "أو شيل") + 0.8, "snip", 0.7)                            # plug out
fx(S[9] + 2.0, "bump", 0.6)                                        # broom pushes the cable
fx(S[10] + 0.2, "hum", 0.5, 6.0); fx(S[10] + 1.0, "spark", 0.6); fx(S[10] + 3.5, "spark", 0.5)   # downed line
fx(S[11] + 0.6, "notify", 0.6)                                     # the call
for k in range(12): fx(S[13] + 0.4 + k * 0.5, "thud", 0.28)        # compressions, two a second
fx(S[15] + 0.1, None, 1.0) if False else None
c.append({"t": round(S[15] + 0.1, 3), "file": os.path.join(KIT, "px-water-rush.mp3"), "from": 3.0, "dur": 2.6, "gain": 0.45})
fx(S[16] + 0.4, "sizzle", 0.45)                                    # the damage inside
fx(S[17] + 0.3, "splash", 0.6)
for i, w in CROSSES: fx(at(i, w), "thud", 0.8)                     # each ✗
for i, w, _ in CHIPS: fx(at(i, w), "pop", 0.6)                    # each number tag
for k in range(8): fx(S[21] + 0.5 + k * 1.0, "ping", 0.25)         # heart monitor
for _, _, w in RECAP_ICONS: fx(at(22, w), "pop", 0.7)
fx(S[23] + 0.3, "notify", 0.6)
json.dump({"bed": False, "cues": [x for x in c if x]}, open(os.path.join(EP, "cues.json"), "w"), indent=1)
print(len(c), "cues")
