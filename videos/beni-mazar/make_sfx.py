"""Horror sound kit for «جريمة بني مزار», all synthesized here (no recordings, no music): python3 make_sfx.py → sfx/hz-*.wav
heartbeat (slow, fast), hit (sub drop + crack + tail), riser (into a cut), drone (low, uneasy), crickets (night in the village),
flicker (a failing bulb), suck (reverse swell before a hit), knock (a wooden gavel / door knock), breath (a cold exhale)."""
import numpy as np, wave
SR = 48000; rng = np.random.default_rng(11)
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, fc):   # one-pole low-pass, run twice
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for k in range(2):
        out = np.empty_like(x); p = 0.0
        for i in range(len(x)): p = (1 - a) * x[i] + a * p; out[i] = p
        x = out
    return x
def lpf(x, fc):  # fast FFT low-pass
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (fr / fc) ** 4); return np.fft.irfft(X, len(x))
def hpf(x, fc):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (fr / max(fc, 1)) ** 4); return np.fft.irfft(X, len(x))
def bpf(x, lo, hi): return hpf(lpf(x, hi), lo)
def noise(n): return rng.standard_normal(n)
def verb(x, d=2.5, mix=.35):
    ir = noise(int(d * SR)) * np.exp(-t_(d) * 3.2); ir = lpf(ir, 3500)
    y = np.fft.irfft(np.fft.rfft(x, len(x) + len(ir)) * np.fft.rfft(ir, len(x) + len(ir)))[: len(x) + len(ir)]
    y /= np.max(np.abs(y)) + 1e-9; xx = np.pad(x, (0, len(ir))); xx /= np.max(np.abs(xx)) + 1e-9
    return (1 - mix) * xx + mix * y
def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    with wave.open(f"sfx/hz-{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def beat(bpm, d):
    t = t_(d); x = np.zeros_like(t); per = 60 / bpm
    for k in np.arange(0, d, per):
        for off, g in ((0, 1.0), (0.24, 0.7)):
            s = int((k + off) * SR); L = int(.18 * SR)
            if s + L > len(x): break
            tt = t_(.18); x[s:s + L] += g * np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 22) * (1 - np.exp(-tt * 400))
    return lpf(x, 160) * np.minimum(1, t / .4)
save("heart-slow", beat(58, 9)); save("heart-fast", beat(112, 7))
# hit: sub drop + a crack of noise + a long dark tail
t = t_(3.5); sub = np.sin(2 * np.pi * (34 + 60 * np.exp(-t * 6)) * t) * np.exp(-t * 1.4)
crack = bpf(noise(len(t)), 300, 6000) * np.exp(-t * 18)
save("hit", verb(sub * 1.0 + crack * .5, 3, .4))
# riser: filtered noise and a rising tone, ends hard (the cut to black lands on its end)
d = 4.0; t = t_(d); k = (t / d) ** 2.2
tone = np.sin(2 * np.pi * np.cumsum(110 + 520 * k) / SR) * .25 + np.sin(2 * np.pi * np.cumsum(113 + 530 * k) / SR) * .2
nz = hpf(noise(len(t)), 400) * k * .6
save("riser", (tone + nz) * k * np.minimum(1, (d - t) / .02))
# suck: a reverse swell (reversed reverb of a crack), 1.6 s, peaks at its end
x = verb(bpf(noise(int(.1 * SR)), 200, 5000) * np.exp(-t_(.1) * 30), 1.5, .9)[::-1]; save("suck", x[-int(1.6 * SR):])
# drone: low beating tones + a slow airy noise, uneasy; 24 s
d = 24; t = t_(d); dr = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in ((41, 1, 0), (41.7, .8, 1), (61.5, .35, 2), (82.6, .2, .5), (123, .08, 1.7)))
air = lpf(noise(len(t)), 500) * (0.5 + .5 * np.sin(2 * np.pi * t / 7)) * .9
save("drone", (dr * .7 + air) * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2))
# crickets: pulsed chirps, two insects, far away; 20 s
d = 20; t = t_(d); x = np.zeros_like(t)
for f0, rate, ph, a in ((4300, 3.1, 0, 1), (3900, 2.6, .4, .7), (4700, 3.7, .9, .4)):
    gate = ((t * rate + ph) % 1 < .32) * (np.sin(2 * np.pi * 34 * t) > 0)
    x += a * np.sin(2 * np.pi * f0 * t) * lpf(gate.astype(float), 300)
save("crickets", x * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5))
# flicker: a failing bulb, mains buzz with drop-outs and clicks; 3 s
d = 3; t = t_(d); on = np.ones_like(t)
for s, e in ((.4, .52), (.9, .95), (1.3, 1.62), (2.1, 2.16), (2.5, 2.9)): on[int(s * SR):int(e * SR)] = 0
buzz = sum(np.sin(2 * np.pi * 100 * h * t) / h for h in range(1, 12)) * .3
clk = np.zeros_like(t)
for s in (.4, .52, .9, .95, 1.3, 1.62, 2.1, 2.16, 2.5, 2.9): i = int(s * SR); clk[i:i + 300] += noise(300) * np.exp(-np.arange(300) / 40)
save("flicker", hpf(buzz * on, 80) * .5 + clk)
# knock: a dry wooden knock (gavel / door)
t = t_(.9); kn = (np.sin(2 * np.pi * 180 * t) * .6 + np.sin(2 * np.pi * 420 * t) * .3) * np.exp(-t * 28) + bpf(noise(len(t)), 800, 4000) * np.exp(-t * 60) * .6
save("knock", verb(kn, 1.0, .25))
# breath: a long cold exhale of wind
d = 3; t = t_(d); save("breath", bpf(noise(len(t)), 300, 2200) * np.sin(np.pi * t / d) ** 2)
# siren: a distant police wail, two slow sweeps, heavy low-pass (far away)
d = 5; t = t_(d); fr = 650 + 250 * np.sin(2 * np.pi * t / 2.5 - 1.57); sr_ = np.sin(2 * np.pi * np.cumsum(fr) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(fr) / SR)
save("siren", lpf(sr_, 1600) * np.minimum(1, t / .8) * np.minimum(1, (d - t) / 1.2))
print("ok")
