"""Original upbeat electronic music bed for «ابنيها بنفسك», synthesised from scratch (no samples, no licence).
python3 music.py <preset> <out.wav> [--seconds 125]
Presets: calm (100 BPM, C, marimba) and light (106 BPM, G, soft pluck) are the gentle ones;
sunny (120), bounce (128) and groove (112) are punchier (the user found them tense).
Steady four-on-the-floor from the first beat to the last, 8-bar loop with a lead that comes and goes every 8 bars."""
import argparse, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
ap = argparse.ArgumentParser(); ap.add_argument("preset"); ap.add_argument("out"); ap.add_argument("--seconds", type=float, default=125)
a = ap.parse_args()
P = {
 "sunny":  dict(bpm=120, root=48, prog=[(0,"M"),(7,"M"),(9,"m"),(5,"M")], lead="pluck", arp=[0,1,2,1,3,2,1,2], seed=1),
 "bounce": dict(bpm=128, root=53, prog=[(0,"M"),(9,"m"),(5,"M"),(7,"M")], lead="square", arp=[0,2,1,2,3,2,1,0], seed=2),
 "groove": dict(bpm=112, root=45, prog=[(0,"m"),(8,"M"),(3,"M"),(10,"M")], lead="marimba", arp=[0,1,2,3,2,1,2,0], seed=3),
  # calmer beds (the user found the first three tense): softer kick, no open hat, gentle pump, warm pad, slow lead
 "calm":   dict(bpm=100, root=48, prog=[(0,"M"),(9,"m"),(5,"M"),(7,"M")], lead="marimba", arp=[0,2,1,2,3,2,1,2], seed=4,
               kick=0.45, ohat=0.0, hat=0.05, side=0.25, padc=1600, pad=0.08, bass=0.18, leadg=0.14, lead8=True),
 "light":  dict(bpm=106, root=55, prog=[(0,"M"),(5,"M"),(9,"m"),(7,"M")], lead="pluck", arp=[0,1,2,3,2,1,2,1], seed=5,
               kick=0.5, ohat=0.0, hat=0.06, side=0.3, padc=1800, pad=0.08, bass=0.2, leadg=0.13, lead8=True),
}[a.preset]
D = dict(kick=0.7, ohat=0.11, hat=0.10, side=0.55, padc=2600, pad=0.10, bass=0.28, leadg=0.18, lead8=False); D.update(P); P = D
rng = np.random.default_rng(P["seed"])
beat = 60 / P["bpm"]; N = int(a.seconds * SR); L = np.zeros(N); R = np.zeros(N)
f = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, "high", fs=SR, output="sos"), x)
def add(sig, t0, gl=1.0, gr=None):
    i = int(t0 * SR); 
    if i >= N: return
    gr = gl if gr is None else gr; n = min(len(sig), N - i); L[i:i+n] += sig[:n] * gl; R[i:i+n] += sig[:n] * gr
def env(n, a_, d):
    t = np.arange(n) / SR; e = np.exp(-t / d); k = int(a_ * SR)
    if k: e[:k] *= np.linspace(0, 1, k)
    return e
def saw(fr, n, ph=0): t = np.arange(n) / SR; return 2 * ((t * fr + ph) % 1) - 1
def sq(fr, n): t = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * fr * t))
chord = lambda r, q: [r, r + (4 if q == "M" else 3), r + 7, r + 12]
# drums
kn = int(0.35 * SR); t = np.arange(kn) / SR
kick = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12); kick += 0.3 * np.exp(-t / 0.004) * rng.standard_normal(kn) * (t < 0.01)
cn = int(0.25 * SR); clap = hp(lp(rng.standard_normal(cn), 6000), 900) * env(cn, 0.001, 0.07)
hn = int(0.05 * SR); hat = hp(rng.standard_normal(hn), 8000, 4) * env(hn, 0, 0.012)
on = int(0.25 * SR); ohat = hp(rng.standard_normal(on), 7000, 4) * env(on, 0, 0.08)
nbeats = int(a.seconds / beat) + 1
for b in range(nbeats):
    tb = b * beat; add(kick, tb, P["kick"])
    if b % 2 == 1: add(clap, tb, 0.35, 0.33)
    h = P["hat"]; add(hat, tb + beat / 2, h, h * 0.8)
    if P["ohat"]: add(hat, tb + beat / 4, h, h * 0.7); add(ohat, tb + beat / 2, P["ohat"], P["ohat"] * 1.3); add(hat, tb + 3 * beat / 4, h * 0.7, h)
# sidechain gain for the tonal parts
tt = np.arange(N) / SR; ph = (tt % beat) / beat; side = 1 - P["side"] * np.exp(-ph * beat / 0.09)
TL = np.zeros(N); TR = np.zeros(N)
def addT(sig, t0, gl, gr=None):
    i = int(t0 * SR)
    if i >= N: return
    gr = gl if gr is None else gr; n = min(len(sig), N - i); TL[i:i+n] += sig[:n] * gl; TR[i:i+n] += sig[:n] * gr
bar = 4 * beat; nbars = int(a.seconds / bar) + 1
for B in range(nbars):
    r, q = P["prog"][B % 4]; ch = chord(P["root"] + r, q); t0 = B * bar
    # pad: detuned saws, held for the bar
    n = int(bar * SR); padL = np.zeros(n); padR = np.zeros(n)
    for m in ch[1:]:
        for d, side_ in ((-0.12, 0), (0.12, 1), (0, 2)):
            s = saw(f(m + 12 + d * 0.1) * (1 + d * 0.004), n, rng.random())
            if side_ == 0: padL += s
            elif side_ == 1: padR += s
            else: padL += 0.5 * s; padR += 0.5 * s
    e = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.05 * SR))
    addT(lp(padL, P["padc"]) * e, t0, P["pad"], 0); addT(lp(padR, P["padc"]) * e, t0, 0, P["pad"])
    # bass: offbeat-octave eighths on the root
    for k in range(8):
        m = P["root"] - 12 + r + (12 if k % 2 else 0); n = int(beat / 2 * SR)
        s = lp(saw(f(m), n), 900) * env(n, 0.003, 0.18); addT(s, t0 + k * beat / 2, P["bass"])
    # lead: arp of chord tones in 16ths, on for 8 bars, off for 4 (keeps it alive, never stops the beat)
    if (B // 4) % 3 != 2:
        steps, dur = (8, beat / 2) if P["lead8"] else (16, beat / 4)
        for k in range(steps):
            m = ch[P["arp"][k % 8]] + 24; n = int(dur * SR * 1.6)
            if P["lead"] == "pluck": s = lp(saw(f(m), n), 3500) * env(n, 0.002, 0.09)
            elif P["lead"] == "square": s = lp(sq(f(m), n), 3000) * env(n, 0.002, 0.07) * 0.7
            else:
                tm = np.arange(n) / SR; s = (np.sin(2*np.pi*f(m)*tm) + 0.4*np.sin(2*np.pi*4*f(m)*tm)*np.exp(-tm/0.02)) * env(n, 0.001, 0.12)
            tk = t0 + k * dur; pan = 0.5 + 0.25 * np.sin(k)
            addT(s * P["leadg"], tk, 1 - pan, pan)
            for j, g in ((1, 0.35), (2, 0.15)):   # dotted-eighth ping-pong delay
                addT(s * P["leadg"] * g, tk + j * 0.75 * beat, pan, 1 - pan)
L += TL * side; R += TR * side
x = np.stack([L, R], 1); x = np.tanh(1.2 * x) / np.tanh(1.2); x /= np.abs(x).max() / 0.89
fo = int(1.5 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
wavfile.write(a.out, SR, (x * 32767).astype(np.int16)); print(a.out, P["bpm"], "BPM", a.seconds, "s")
