"""طب إزاي؟ — sound design: an original music bed + machine sound effects, mixed under the narrator.

Usage: python sfx.py voice.wav cues.json out.wav [--start S --dur D]
cues.json: {"bed": true, "cues": [{"t": 3.2, "fx": "laser", "gain": 1.0, "dur": 0.4}, ...]}
A cue can also play a recorded sound instead of a synthesized one: {"t": 3.2, "file": "sfx/boom.wav", "gain": 1.0,
"from": 0.0, "dur": 2.0} (path relative to cues.json; any format ffmpeg reads; "from"/"dur" cut a slice with short fades).
Everything else is synthesized here; credit any recorded file you use.
"""
import sys, os, json, wave, argparse
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

def rms_lin(x):   # RMS of the loud part, so a clip with a long quiet fade isn't over-boosted
    a = np.abs(x); k = a > np.max(a) * 0.05
    return float(np.sqrt(np.mean(x[k] ** 2))) if k.any() else 1e-9

_clips = {}
def clip(c):   # a slice of a recorded file, decoded once with ffmpeg, faded in/out so loops and cuts don't click
    p = c["file"]
    if p not in _clips:
        import subprocess
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        _clips[p] = np.frombuffer(raw, dtype=np.float32)
    x = _clips[p]; a = int(c.get("from", 0) * SR); b = a + int(c["dur"] * SR) if c.get("dur") else len(x)
    x = x[a:b].copy(); k = min(len(x) // 2, int(0.12 * SR))
    if c.get("from") or c.get("dur"): x[:k] *= np.linspace(0, 1, k); x[len(x) - k:] *= np.linspace(1, 0, k)
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
# ── water & metal foley (physically inspired) ─────────────
def bubble(f0, d=0.12, rise=1.6):
    # a bubble rings at its Minnaert frequency and chirps upward as it nears the surface
    t = t_(d); f = f0 * (1 + rise * t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * (9 / d) * 0.35)).astype(np.float32) * env(len(t), .002, .02)
def bubbles(d=1.0, rate=14, lo=500, hi=1600, decay=True):
    n = int(d * SR); x = np.zeros(n, np.float32)
    for _ in range(int(rate * d)):
        s = int(rng.random() * (n - 0.15 * SR)); f = rng.uniform(lo, hi); b = bubble(f, rng.uniform(.05, .14))
        g = rng.uniform(.3, 1) * ((1 - s / n) if decay else 1); x[s:s + len(b)] += g * b[: n - s]
    return x
def fx_drop(d=0.5):           # small object (nail, drop) enters water: plip + a few bubbles
    t = t_(d); x = 0.9 * bubble(1400, 0.08, 2.5)
    x = np.pad(x, (0, len(t) - len(x))); x += 0.35 * hp_fast(noise(len(t)), 3000) * np.exp(-t * 60)
    x += 0.6 * bubbles(d, rate=10, lo=900, hi=2200)
    return x
def fx_plunk(d=1.1):          # heavy object enters water: thump + splash + bubble cloud
    t = t_(d); thump = np.sin(2 * np.pi * (160 * np.exp(-t * 10) + 60) * t) * np.exp(-t * 12)
    spl = lp_fast(noise(len(t)), 2600, 2) * np.exp(-t * 7) * 1.6
    return (0.9 * thump + spl + 0.7 * bubbles(d, rate=26, lo=300, hi=1100)).astype(np.float32)
def fx_splash(d=1.0):
    t = t_(d); spl = lp_fast(noise(len(t)), 3500, 1) * np.exp(-t * 5) * (1 - np.exp(-t * 80))
    drops = np.zeros(len(t), np.float32)
    for _ in range(18):
        s = int(rng.uniform(.08, .8) * SR); b = bubble(rng.uniform(1200, 3000), .04, 2)
        drops[s:s + len(b)] += .4 * b[: len(t) - s]
    return (spl + drops + 0.4 * bubbles(d, 12, 400, 1200)).astype(np.float32)
def fx_waves(d=6.0):          # gentle lapping water, for long ambience
    t = t_(d); base = lp_fast(noise(len(t)), 500, 3) * 3
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * 0.22 * t + 1) * np.sin(2 * np.pi * 0.13 * t)
    x = base * swell + 0.18 * bubbles(d, rate=3, lo=400, hi=900, decay=False)
    return x * env(len(t), .8, 1.2)
def fx_slosh(d=1.2):          # water moving in a tub
    t = t_(d); x = lp_fast(noise(len(t)), 900, 2) * 2.2 * np.sin(np.pi * t / d) ** 1.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 3.2 * t))
    return (x + 0.5 * bubbles(d, 9, 300, 900)).astype(np.float32)
def fx_fill(d=1.8):           # water rushing in / rising
    t = t_(d); x = lp_fast(noise(len(t)), 1400, 2) * 2 * np.minimum(1, t / .3) * env(len(t), .01, .4)
    return (x + 0.8 * bubbles(d, 30, 250, 800, decay=False)).astype(np.float32)
def fx_clink(d=0.9, f=1700):  # steel ting: inharmonic bar modes
    t = t_(d); x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in [(1, 1, 6), (2.76, .5, 9), (5.40, .3, 14), (8.93, .15, 20)])
    return (x * (1 - np.exp(-t * 900))).astype(np.float32)
def fx_clank(d=0.7):          # heavy steel (container, plate) hitting steel
    t = t_(d); x = sum(a * np.sin(2 * np.pi * 220 * r * t) * np.exp(-t * k) for r, a, k in [(1, 1, 8), (2.4, .7, 11), (3.9, .5, 16), (6.1, .3, 24)])
    x += 0.6 * lp_fast(noise(len(t)), 2500, 1) * np.exp(-t * 40)
    return x.astype(np.float32)
def fx_thud(d=0.5):           # weight lands on something solid
    t = t_(d); x = np.sin(2 * np.pi * (110 * np.exp(-t * 14) + 45) * t) * np.exp(-t * 11) + 0.4 * lp_fast(noise(len(t)), 600, 2) * np.exp(-t * 25)
    return x.astype(np.float32)
def fx_creak(d=1.6):          # a steel hull groaning under load
    t = t_(d); f = 70 + 25 * np.sin(2 * np.pi * 0.9 * t) + 10 * rng.standard_normal(len(t)).cumsum() / SR * 30
    ph = 2 * np.pi * np.cumsum(f) / SR; x = np.sign(np.sin(ph)) * 0.5 + 0.5 * np.sin(2 * ph)
    return lp_fast(x, 700, 2) * env(len(t), .3, .5) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.3 * t))

def fx_spray(d=2.0):          # water jets hissing from the spray arm, with a slow swirl
    t = t_(d); x = hp_fast(noise(len(t)), 1800) * (0.75 + 0.25 * np.sin(2 * np.pi * 1.4 * t))
    x += 0.5 * lp_fast(noise(len(t)), 900, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.8 * t))
    return (x + 0.25 * bubbles(d, 10, 600, 1500, decay=False)) * env(len(t), .25, .5)
def fx_fizz(d=1.4):           # tablet dissolving
    n = int(d * SR); x = np.zeros(n, np.float32)
    for _ in range(int(120 * d)):
        s = int(rng.random() * (n - 200)); L = int(rng.uniform(40, 160)); x[s:s + L] += rng.uniform(.2, 1) * hp_fast(noise(L), 5000) * np.hanning(L)
    return x * env(n, .05, .4) + 0.3 * bubbles(d, 20, 1500, 3500)
def fx_snip(d=0.25):          # small scissors
    t = t_(d); x = hp_fast(noise(len(t)), 3500) * np.exp(-t * 40) + 0.5 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 60)
    return x.astype(np.float32)
def fx_drip(d=0.35):          # a single drop
    return np.pad(bubble(rng.uniform(900, 1400), 0.09, 2.2), (0, int(d * SR)))[: int(d * SR)]
def fx_hum(d=2.0):            # heater / pump electrical hum
    t = t_(d); x = 0.6 * np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 200 * t) + 0.1 * np.sin(2 * np.pi * 300 * t)
    return (x * env(len(t), .3, .4)).astype(np.float32)
def fx_steam(d=1.6):
    n = int(d * SR); t = t_(d); x = hp_fast(noise(n), 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.8 * t))
    return lp_fast(x, 9000, 1) * env(n, .4, .5)

# ── engine foley ──────────────────────────────────────────
def pulses(t, rate, sharp=6.0):  # one pressure pulse per firing, as an amplitude train
    return np.exp(-sharp * ((t * rate) % 1.0))
def fx_idle(d=3.0, rate=14):  # engine rumble: low firing pulses through a muffler
    t = t_(d); p = pulses(t, rate, 5)
    x = (0.7 * np.sin(2 * np.pi * rate * 2 * t) + 0.8 * lp_fast(noise(len(t)), 300, 2) * 6) * p
    return lp_fast(x, 500, 2) * env(len(t), .2, .5)
def fx_rev(d=1.8):            # engine revving up: firing rate climbs
    t = t_(d); rate = 12 + 60 * (t / d) ** 1.5; ph = np.cumsum(rate) / SR
    p = np.exp(-4 * (ph % 1.0)); x = (np.sin(2 * np.pi * 2 * ph) + 4 * lp_fast(noise(len(t)), 600, 2)) * p
    return lp_fast(x, 1400, 1) * env(len(t), .05, .3)
def fx_intake(d=0.9):         # air sucked in: rising filtered hiss
    t = t_(d); nz = noise(len(t)); k = t / d
    x = lp_fast(nz, 900, 1) * (1 - k) + hp_fast(lp_fast(nz, 4000, 1), 800) * k
    return x * np.sin(np.pi * k) ** 1.5 * 1.6
def fx_squeeze(d=1.0):        # compression: pitch rises, pressure builds
    t = t_(d); f = 70 + 160 * (t / d) ** 2; ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * 0.7 + 0.3 * np.sign(np.sin(ph)) + 0.3 * lp_fast(noise(len(t)), 1200, 1)
    return lp_fast(x, 1800, 1) * np.linspace(.2, 1, len(t)) * env(len(t), .05, .08)
def fx_spark(d=0.35):         # spark plug: sharp electric crack + buzz
    t = t_(d); x = hp_fast(noise(len(t)), 3000) * np.exp(-t * 50) * 1.4
    x += 0.4 * np.sign(np.sin(2 * np.pi * 120 * t)) * hp_fast(noise(len(t)), 1500) * np.exp(-t * 14)
    return x.astype(np.float32)
def fx_boom(d=1.4):           # contained explosion: punch + low rumble tail
    t = t_(d); punch = np.sin(2 * np.pi * (180 * np.exp(-t * 16) + 38) * t) * np.exp(-t * 6)
    body = lp_fast(noise(len(t)), 700, 3) * 8 * np.exp(-t * 4) * (1 - np.exp(-t * 300))
    crack = hp_fast(noise(len(t)), 2000) * np.exp(-t * 60) * 0.6
    return (punch + body + crack).astype(np.float32)
def fx_exhaust(d=0.7):        # burnt gas puffed out the pipe
    t = t_(d); x = lp_fast(noise(len(t)), 1200, 2) * 4 * np.exp(-t * 6) * (1 - np.exp(-t * 120))
    return (x + 0.4 * np.sin(2 * np.pi * 60 * t) * np.exp(-t * 9)).astype(np.float32)
def fx_gear(d=0.9):           # gearbox: clunk then a short whine
    t = t_(d); cl = fx_clank(d) * np.exp(-t * 4) * 0.7
    f = 500 + 300 * t / d; wh = 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * (t > .12)
    return (cl + wh).astype(np.float32)
def fx_coolant(d=2.0):        # liquid rushing through hoses
    t = t_(d); x = lp_fast(noise(len(t)), 1100, 2) * 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 2.2 * t))
    return (x + 0.5 * bubbles(d, 14, 300, 900, decay=False)) * env(len(t), .3, .5)

# ── aviation foley ────────────────────────────────────────
def fx_jet(d=3.0):            # turbofan: low roar + fan whine
    t = t_(d); roar = lp_fast(noise(len(t)), 600, 3) * 6
    wh = 0.25 * np.sin(2 * np.pi * np.cumsum(1800 + 200 * np.sin(2 * np.pi * 0.3 * t)) / SR) + 0.12 * np.sin(2 * np.pi * np.cumsum(3600 + 400 * np.sin(2 * np.pi * 0.3 * t)) / SR)
    return (roar + wh) * env(len(t), .4, .6)
def fx_spool(d=2.0):          # engine spooling up: whine rises
    t = t_(d); f = 600 + 2200 * (t / d) ** 1.4; wh = 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (wh + lp_fast(noise(len(t)), 800, 2) * 4 * (t / d)) * env(len(t), .1, .3)
def fx_wind(d=3.0):           # steady airflow over a wing
    t = t_(d); x = lp_fast(noise(len(t)), 1500, 2) * 3 * (0.75 + 0.25 * np.sin(2 * np.pi * 0.4 * t))
    return x * env(len(t), .5, .7)
def fx_servo(d=0.8):          # flap / control-surface actuator
    t = t_(d); f = 380 + 120 * np.sin(np.pi * t / d); x = 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    return lp_fast(x, 2200, 1) * env(len(t), .05, .15) * 0.7

# robot vacuum
def fx_vac(d=3.0):            # vacuum fan: airy hiss + a high motor whine, slow wobble
    t = t_(d); whine = 0.25 * np.sin(2 * np.pi * (1180 + 25 * np.sin(2 * np.pi * 0.7 * t)) * t)
    return (lp_fast(hp_fast(noise(len(t)), 300), 4000, 1) * 0.5 + whine) * env(len(t), .3, .4)
def fx_bump(d=0.3):           # plastic bumper knocks into something
    t = t_(d); x = np.sin(2 * np.pi * (220 * np.exp(-t * 20) + 140) * t) * np.exp(-t * 28) + 0.4 * lp_fast(noise(len(t)), 2500, 1) * np.exp(-t * 60)
    return x.astype(np.float32)
def fx_ping(d=0.5):           # sonar: short high ping with an echo
    t = t_(d); p = lambda t0, a: a * np.sin(2 * np.pi * 2600 * (t - t0)) * np.exp(-np.maximum(0, t - t0) * 40) * (t >= t0)
    return (p(0, 1) + p(0.16, 0.35)).astype(np.float32)
def fx_beep(d=0.7):           # low battery: two falling beeps
    t = t_(d); f = np.where(t < 0.3, 1320, 990); g = ((t % 0.35) < 0.2).astype(np.float32)
    return (0.6 * np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + 0.5 * np.sin(2 * np.pi * f * t)) * g * env(len(t), .005, .05)
def fx_chime(d=1.0):          # docked / charging: rising three-note chime
    t = t_(d); x = np.zeros(len(t), np.float32)
    for k, f in enumerate([784, 988, 1319]):
        t0 = k * 0.13; m = t >= t0; x[m] += (np.sin(2 * np.pi * f * (t[m] - t0)) * np.exp(-(t[m] - t0) * 6)).astype(np.float32)
    return x
def fx_notify(d=0.6):         # phone notification: two soft bubbles
    t = t_(d); x = np.zeros(len(t), np.float32)
    for t0, f in [(0, 880), (0.14, 1175)]:
        m = t >= t0; x[m] += (np.sin(2 * np.pi * f * (t[m] - t0)) * np.exp(-(t[m] - t0) * 12)).astype(np.float32)
    return x

# helicopter
def fx_rotor(d=4.0, rate=6.5):   # main rotor "chop": low thumps per blade pass + turbine whine
    t = t_(d); thump = np.exp(-((t * rate) % 1) * 9) * np.sin(2 * np.pi * 70 * t)
    whine = 0.12 * np.sin(2 * np.pi * (1900 + 30 * np.sin(2 * np.pi * 0.3 * t)) * t)
    return (lp_fast(thump + 0.25 * noise(len(t)) * np.exp(-((t * rate) % 1) * 6), 900, 1) + whine).astype(np.float32) * env(len(t), .4, .5)
def fx_windmill(d=3.0):          # rotor coasting without the engine: slower chop, airy
    return fx_rotor(d, 4.2) * 0.6 + lp_fast(noise(int(d * SR)), 1200, 1) * 0.3 * env(int(d * SR), .5, .5)

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

def mix(voice, cues, use_bed=True, bed_db=-18.0, fx_db=-10.0, duck_db=-8.0, tail=2.5, rec_db=6.0):
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
    mask = np.pad(np.repeat(act, hop), (0, max(0, len(v) - len(act) * hop)))[: len(v)] > 0
    speech_rms = rms_db(v[mask]) if act.any() else -20
    out = v.copy()
    if use_bed:
        b = bed(n / SR)[:n]; b *= 10 ** ((speech_rms + bed_db - rms_db(b)) / 20); out += b * gain
    for c in cues:
        f = clip(c) if "file" in c else FX[c["fx"]](c.get("dur", None) or FX[c["fx"]].__defaults__[0]); s = int(c["t"] * SR)
        # recorded clips are levelled by loudness (RMS) against the voice, rec_db above it at gain 1, so a jet roar can stand up
        # to the narrator; synthesized fx are levelled by peak, well under it. "duck": false keeps a hit (a boom) at full force.
        if "file" in c: f = f / (rms_lin(f) + 1e-9) * 10 ** ((speech_rms + rec_db) / 20) * c.get("gain", 1.0)
        else: f = f / (np.max(np.abs(f)) + 1e-9) * 10 ** ((speech_rms + 3 + fx_db) / 20) * c.get("gain", 1.0)
        e = min(n, s + len(f)); out[s:e] += f[: e - s] * (1.0 if c.get("duck") is False else gain[s:e])
    peak = np.max(np.abs(out))
    if peak > 0.97: out = np.tanh(out / 0.97) * 0.97 if peak < 3 else out * (0.97 / peak)   # soft-clip loud hits instead of turning everything down
    return out, v, speech_rms

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("voice"); ap.add_argument("cues"); ap.add_argument("out")
    ap.add_argument("--start", type=float, default=0); ap.add_argument("--dur", type=float, default=0)
    a = ap.parse_args()
    voice = read_wav(a.voice)
    if a.dur: voice = voice[int(a.start * SR): int((a.start + a.dur) * SR)]
    spec = json.load(open(a.cues)); base = os.path.dirname(os.path.abspath(a.cues))
    for c in spec["cues"]:
        if "file" in c: c["file"] = os.path.join(base, c["file"])
    cues = [dict(c, t=c["t"] - a.start) for c in spec["cues"] if c["t"] >= a.start and (not a.dur or c["t"] < a.start + a.dur)]
    out, v, srms = mix(voice, cues, spec.get("bed", True))
    write_wav(a.out, out)
    # report: how far below the voice the rest of the mix sits while the narrator speaks
    rest = out[: len(v)] - v[: len(out)]
    act = np.abs(v) > 0.04; win = SR // 2; gaps = []
    for i in range(0, len(v) - win, win):
        m = act[i:i + win]
        if m.mean() > 0.3: gaps.append(rms_db(v[i:i + win][m]) - rms_db(rest[i:i + win]))
    print(f"voice speech RMS {srms:.1f} dBFS; voice-over-background while speaking: median {np.median(gaps):.1f} dB, worst {np.min(gaps):.1f} dB")
