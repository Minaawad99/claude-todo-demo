"""Effects made here for «معجزة هدسون» (no recordings): python3 make.py → spooldown, crc, honk, horn, cabin, radar (48 kHz WAV)."""
import numpy as np, soundfile as sf, os
SR = 48000; R = np.random.default_rng(3); H = os.path.dirname(os.path.abspath(__file__))
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, a): y = np.zeros_like(x); s = 0.0
def lpf(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = a * s + (1 - a) * v; y[i] = s
    return y
def env(n, a, r): e = np.ones(n); ka, kr = int(a * SR), int(r * SR); e[:ka] = np.linspace(0, 1, ka); e[n - kr:] = np.linspace(1, 0, kr); return e
def save(n, x): x = x / (np.abs(x).max() + 1e-9) * .9; sf.write(os.path.join(H, n + ".wav"), x.astype(np.float32), SR)
# both engines winding down after the bird strike: the fan whine falls, the roar fades, a few rattles
d = 5.0; t = t_(d); k = np.exp(-t / 1.3)
f = 300 + 3300 * k; wh = .35 * np.sin(2 * np.pi * np.cumsum(f) / SR) + .15 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
roar = lpf(R.standard_normal(len(t)), 500) * 5 * k
rat = np.zeros(len(t))
for c in R.uniform(.1, 2.5, 14): i = int(c * SR); n = int(.05 * SR); rat[i:i + n] += R.standard_normal(n) * np.exp(-np.arange(n) / 600) * .5
save("spooldown", (wh * k + roar + rat) * env(len(t), .01, .4))
# the Airbus master-warning continuous repetitive chime
d = 3.0; t = t_(d); x = np.zeros(len(t))
for s0 in np.arange(0, d, .5):
    m = t >= s0; tt = t[m] - s0; x[m] += (np.sin(2 * np.pi * 1300 * tt) + .4 * np.sin(2 * np.pi * 2600 * tt)) * np.exp(-tt * 9)
save("crc", x * env(len(t), .005, .1))
# a flock of Canada geese honking: short nasal two-part honks, many voices
d = 3.0; t = t_(d); x = np.zeros(len(t))
for c in R.uniform(0, 2.7, 22):
    n = int(R.uniform(.12, .22) * SR); tt = np.arange(n) / SR; f0 = R.uniform(380, 520) * (1 + .35 * (tt / tt[-1] < .35))
    v = sum(np.sin(2 * np.pi * np.cumsum(f0 * h) / SR) / h ** .7 for h in range(1, 8)); v *= np.clip(np.sin(np.pi * tt / tt[-1]), 0, 1) ** .5
    i = int(c * SR); x[i:i + n] += v * R.uniform(.4, 1)
save("honk", lpf(x, 2600) + .02 * R.standard_normal(len(t)))
# a ferry horn: low, rich, a slow swell
d = 2.2; t = t_(d); x = sum(np.sin(2 * np.pi * 146 * h * t) / h for h in range(1, 9)); save("horn", lpf(x, 1200) * env(len(t), .15, .5))
# the cabin of an airliner in the climb: a broadband roar
d = 8.0; t = t_(d); save("cabin", lpf(R.standard_normal(len(t)), 380) * (1 + .1 * np.sin(2 * np.pi * .2 * t)) * env(len(t), .5, .5))
# the approach-control room: air conditioning, a faint tone, soft clicks
d = 8.0; t = t_(d); x = lpf(R.standard_normal(len(t)), 900) * .4 + .05 * np.sin(2 * np.pi * 120 * t)
for c in R.uniform(0, 7.8, 10): i = int(c * SR); x[i:i + 200] += np.sin(2 * np.pi * 1800 * np.arange(200) / SR) * .2
save("radar", x * env(len(t), .4, .4))
print("ok")
