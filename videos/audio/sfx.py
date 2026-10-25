"""طب إزاي؟ — sound design: an original music bed + machine sound effects, mixed under the narrator.

Usage: python sfx.py voice.wav cues.json out.wav [--start S --dur D]
cues.json: {"bed": true, "cues": [{"t": 3.2, "fx": "laser", "gain": 1.0, "dur": 0.4}, ...]}
Everything is synthesized here, so the result is free of third-party rights.
"""
import sys, json, wave, argparse
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

def read_wav(p):
    with wave.open(p) as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        x = np.frombuffer(w.readframes(n), dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
        x /= 32768.0 if sw == 2 else 2147483648.0
    if ch > 1: x = x.reshape(-1, ch).mean(1)
    if sr != SR:  # linear resample is fine for speech at these rates
        t = np.arange(int(len(x) * SR / sr)) * sr / SR
        x = np.interp(t, np.arange(len(x)), x).astype(np.float32)
    return x

def write_wav(p, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(p, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def env(n, a=0.01, r=0.1):
    e = np.ones(n, np.float32); A, R = int(a * SR), int(r * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R)
    return e

def lp_fast(x, fc, k=2):
    # cascaded moving-average low-pass: cheap and good enough for shaping noise
    w = max(1, int(SR / fc / 2)); ker = np.ones(w) / w
    for _ in range(k): x = np.convolve(x, ker, "same")
    return x.astype(np.float32)

def hp_fast(x, fc): return (x - lp_fast(x, fc, 1)).astype(np.float32)

def noise(n): return rng.standard_normal(n).astype(np.float32)
def t_(d): return np.arange(int(d * SR)) / SR

# ── effects ───────────────────────────────────────────────
def fx_motor(d=1.5):          # rhythmic mechanical hum
    t = t_(d); x = 0.5 * np.sin(2 * np.pi * 110 * t) + 0.3 * np.sign(np.sin(2 * np.pi * 55 * t)) * 0.4
    x *= 0.6 + 0.4 * (np.sin(2 * np.pi * 6 * t) > 0)
    return lp_fast(x + 0.15 * noise(len(t)), 900) * env(len(t), .08, .25)
def fx_charge(d=0.9):         # rising electric buzz
    t = t_(d); f = 80 + 220 * (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * 0.4 + 0.25 * hp_fast(noise(len(t)), 2000) * (np.sin(2 * np.pi * 50 * t) > .3)
    return lp_fast(x, 3500, 1) * env(len(t), .05, .2) * np.linspace(.3, 1, len(t))
def fx_laser(d=0.35):         # "pew": fast downward sine sweep
    t = t_(d); f = 2400 * np.exp(-t * 9) + 300; ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 7)).astype(np.float32) * env(len(t), .003, .05)
def fx_spin(d=1.6):           # polygon mirror whir, rising pitch
    t = t_(d); f = 600 + 1400 * np.minimum(1, t / (d * .6)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = 0.3 * np.sin(ph) + 0.2 * np.sin(2 * ph) + 0.25 * hp_fast(noise(len(t)), 3000)
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 30 * t)
    return x * env(len(t), .2, .35)
def fx_toner(d=1.2):          # fine sand shimmer
    n = int(d * SR); x = hp_fast(noise(n), 4000) * (rng.random(n) < 0.08)
    return lp_fast(x, 9000, 1) * env(n, .15, .4) * 1.6
def fx_paper(d=0.9):          # roller pull + ticks
    t = t_(d); x = lp_fast(noise(len(t)), 1800) * 0.6 * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t))
    for k in np.arange(0.05, d, 0.12): i = int(k * SR); x[i:i + 300] += np.hanning(300) * 0.5
    return x * env(len(t), .05, .2)
def fx_zap(d=0.25):           # transfer pop
    t = t_(d); x = np.sin(2 * np.pi * (900 - 2800 * t) * t) * np.exp(-t * 22) + 0.4 * hp_fast(noise(len(t)), 3000) * np.exp(-t * 40)
    return x.astype(np.float32)
def fx_sizzle(d=1.4):         # fuser heat
    n = int(d * SR); t = t_(d); x = hp_fast(noise(n), 2500) * (0.5 + 0.5 * rng.random(n) ** 3)
    x += 0.25 * np.sin(2 * np.pi * 90 * t)
    return x * env(n, .15, .4) * 0.8
def fx_wipe(d=0.4):           # blade swish
    t = t_(d); x = hp_fast(noise(len(t)), 1500) * np.sin(np.pi * t / d) ** 2
    return lp_fast(x, 6000, 1) * 1.2
def fx_whoosh(d=0.7):         # paper out / scene change
    t = t_(d); nz = noise(len(t)); sh = np.sin(np.pi * t / d)
    x = (lp_fast(nz, 700, 1) * (1 - sh) + lp_fast(nz, 3500, 1) * sh) * sh ** 2
    return x * 1.4
def fx_pop(d=0.18):           # UI pop for numbers / icons
    t = t_(d); return (np.sin(2 * np.pi * (520 + 900 * t) * t) * np.exp(-t * 28)).astype(np.float32)
def fx_tick(d=0.05):
    t = t_(d); return (np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120)).astype(np.float32)
def fx_splash(d=0.8):
    n = int(d * SR); t = t_(d); x = lp_fast(noise(n), 2500) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * (300 - 200 * t) * t) * np.exp(-t * 8)
    return x
FX = {k[3:]: v for k, v in globals().items() if k.startswith("fx_")}

# ── music bed: soft chords + plucks, 84 bpm, voice band carved out ──
def bed(total):
    bpm = 84; beat = 60 / bpm; n = int(total * SR); x = np.zeros(n, np.float32)
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    bar = 4 * beat; t = np.arange(int(bar * SR)) / SR
    for b in range(int(total / bar) + 1):
        ch = chords[b % 4]; s = int(b * bar * SR)
        pad = sum(np.sin(2 * np.pi * hz(m - 12) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * t) for m in ch) / 4
        pad *= np.minimum(1, t / 0.6) * np.minimum(1, (bar - t) / 0.6)
        seg = pad[: max(0, min(len(pad), n - s))]; x[s:s + len(seg)] += 0.5 * seg
        for k in range(8):  # eighth-note plucks, arpeggiated
            m = ch[k % 3] + (12 if k % 4 == 3 else 0); st = s + int(k * beat / 2 * SR); L = int(0.5 * SR)
            if st + L > n: break
            tt = np.arange(L) / SR; x[st:st + L] += 0.18 * np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 7)
        for k in range(4):  # soft kick on beats
            st = s + int(k * beat * SR); L = int(0.25 * SR)
            if st + L > n: break
            tt = np.arange(L) / SR; x[st:st + L] += 0.35 * np.sin(2 * np.pi * (90 * np.exp(-tt * 18) + 45) * tt) * np.exp(-tt * 14)
    # carve 500 Hz–3 kHz (speech band) by ~9 dB
    band = hp_fast(lp_fast(x, 3000, 1), 500)
    return (x - 0.65 * band).astype(np.float32)

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)

def mix(voice, cues, use_bed=True, bed_db=-18.0, fx_db=-10.0, duck_db=-8.0, tail=2.5):
    n = len(voice) + int(tail * SR)
    v = np.zeros(n, np.float32); v[:len(voice)] = voice
    v_peak = np.max(np.abs(v)) + 1e-9; v *= 0.89 / v_peak          # voice peaks ~ -1 dBFS
    # voice activity envelope (attack 20 ms, release 300 ms)
    a = np.abs(v); hop = 480; frames = a[: len(a) // hop * hop].reshape(-1, hop).max(1)
    act = (frames > 0.04).astype(np.float32)
    sm = np.zeros_like(act)
    for i in range(len(act)):
        prev = sm[i - 1] if i else 0; k = 0.5 if act[i] > prev else 0.05
        sm[i] = prev + k * (act[i] - prev)
    duck = np.repeat(sm, hop); duck = np.pad(duck, (0, n - len(duck)), constant_values=0)
    gain = 10 ** (duck * duck_db / 20)
    speech_rms = rms_db(v[np.repeat(act, hop)[: len(v)] > 0]) if act.any() else -20
    out = v.copy()
    if use_bed:
        b = bed(n / SR)[:n]; b *= 10 ** ((speech_rms + bed_db - rms_db(b)) / 20); out += b * gain
    for c in cues:
        f = FX[c["fx"]](c.get("dur", None) or FX[c["fx"]].__defaults__[0]); s = int(c["t"] * SR)
        f = f / (np.max(np.abs(f)) + 1e-9) * 10 ** ((speech_rms + 3 + fx_db) / 20) * c.get("gain", 1.0)
        e = min(n, s + len(f)); out[s:e] += f[: e - s] * gain[s:e]
    peak = np.max(np.abs(out))
    if peak > 0.97: out *= 0.97 / peak
    return out, v, speech_rms

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("voice"); ap.add_argument("cues"); ap.add_argument("out")
    ap.add_argument("--start", type=float, default=0); ap.add_argument("--dur", type=float, default=0)
    a = ap.parse_args()
    voice = read_wav(a.voice)
    if a.dur: voice = voice[int(a.start * SR): int((a.start + a.dur) * SR)]
    spec = json.load(open(a.cues)); cues = [dict(c, t=c["t"] - a.start) for c in spec["cues"] if c["t"] >= a.start and (not a.dur or c["t"] < a.start + a.dur)]
    out, v, srms = mix(voice, cues, spec.get("bed", True))
    write_wav(a.out, out)
    # report: how far below the voice the rest of the mix sits while the narrator speaks
    rest = out[: len(v)] - v[: len(out)]
    act = np.abs(v) > 0.04; win = SR // 2; gaps = []
    for i in range(0, len(v) - win, win):
        m = act[i:i + win]
        if m.mean() > 0.3: gaps.append(rms_db(v[i:i + win][m]) - rms_db(rest[i:i + win]))
    print(f"voice speech RMS {srms:.1f} dBFS; voice-over-background while speaking: median {np.median(gaps):.1f} dB, worst {np.min(gaps):.1f} dB")
