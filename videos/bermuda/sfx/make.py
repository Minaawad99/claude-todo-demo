"""Synthesized effects for «مثلث برمودا» (no recordings): python3 sfx/make.py → sfx/*.wav, 48 kHz mono."""
import numpy as np, wave, os
SR = 48000; D = os.path.dirname(os.path.abspath(__file__)); rng = np.random.default_rng(7)
def w(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    with wave.open(os.path.join(D, name), "wb") as f: f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def brown(n): return np.cumsum(rng.standard_normal(n)) * 0.02
def t(sec): return np.arange(int(sec * SR)) / SR
# thunder: a sharp crack, then a long rolling rumble with a few swells
tt = t(5.0); n = len(tt)
crack = rng.standard_normal(n) * np.exp(-tt * 18) ; crack = crack - lp(crack, .08)
rum = lp(brown(n), .02); rum = rum - np.mean(rum)
swell = np.exp(-tt * .7) * (1 + .6 * np.sin(tt * 3.1) ** 2) * np.minimum(1, tt * 6)
w("thunder.wav", crack * 1.2 + rum / (np.max(np.abs(rum)) + 1e-9) * swell)
tt = t(4.0); n = len(tt); rum = lp(brown(n), .015); rum -= np.mean(rum)
w("rumble.wav", rum / np.max(np.abs(rum)) * np.minimum(1, tt * 1.5) * np.exp(-tt * .5))
# rain: hiss with random droplets
tt = t(8.0); n = len(tt); x = rng.standard_normal(n); x = x - lp(x, .3); x = lp(x, .5) * .4
for k in range(900): i = rng.integers(0, n - 400); x[i:i + 400] += rng.standard_normal(400) * np.exp(-np.arange(400) / 60) * rng.uniform(.1, .5)
w("rain.wav", x)
# radio static: band-limited noise with crackles and a slow wobble
tt = t(6.0); n = len(tt); x = rng.standard_normal(n); x = lp(x, .35) - lp(x, .04); x *= .5 + .3 * np.sin(tt * 2.3) ** 2
for k in range(160): i = rng.integers(0, n - 200); x[i:i + 200] += rng.standard_normal(200) * 2.4 * np.exp(-np.arange(200) / 30)
w("static.wav", x)
# radial engine: low firing pulses (9 cylinders) + exhaust noise, steady
tt = t(8.0); n = len(tt); f0 = 38.0
x = sum(np.sin(2 * np.pi * f0 * h * tt + h) / h for h in range(1, 9)) * (1 + .3 * np.sin(2 * np.pi * f0 / 9 * tt))
x = x * .6 + lp(rng.standard_normal(n), .08) * 1.5
w("engine.wav", x)
# fire: low roar plus crackles
tt = t(6.0); n = len(tt); x = lp(brown(n), .05); x -= np.mean(x); x = x / np.max(np.abs(x)) * .6
for k in range(300): i = rng.integers(0, n - 300); x[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 25) * rng.uniform(.2, .9)
w("fire.wav", x)
# morse beeps at 700 Hz
tt = t(4.0); n = len(tt); gate = np.zeros(n); pos = 0.1
for sym in "-.-. --.- -.. . ..-. - .---- ----.":
    if sym == " ": pos += .25; continue
    L = .07 if sym == "." else .21; i0 = int(pos * SR); gate[i0:i0 + int(L * SR)] = 1; pos += L + .07
    if pos > 3.8: break
gate = lp(gate, .01); w("morse.wav", np.sin(2 * np.pi * 700 * tt) * gate)
print("ok")
