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
# ── people and place (made for the user's ask: every moment heard) ──
def glottal(f0, d, vib=5.0, vd=.03):   # a voice source: a saw-like pulse train with vibrato and jitter
    t = t_(d); f = f0 * (1 + vd * np.sin(2 * np.pi * vib * t) + .01 * lpf(noise(len(t)), 8))
    ph = np.cumsum(f) / SR; return (2 * (ph % 1) - 1) * (1 - np.exp(-t * 20))
def formant(x, fs, bws=(90, 110, 160)):
    y = np.zeros_like(x)
    for fc, a in zip(fs, (1, .6, .3)): y += a * bpf(x, fc - 80, fc + 80)
    return y
def babble(d, n, loud=1.0, seed=0):   # a crowd: n voices, each a run of syllables (vowel formants) with pauses
    r = np.random.default_rng(seed); t = t_(d); out = np.zeros_like(t)
    V = [(700, 1200, 2600), (400, 2000, 2700), (350, 900, 2400), (500, 1500, 2500), (600, 1000, 2500)]
    for v in range(n):
        f0 = r.uniform(110, 240); src = glottal(f0, d, vib=r.uniform(3, 6), vd=.06)
        env_ = np.zeros_like(t); p = r.uniform(0, 1)
        while p < d - .2:
            L = r.uniform(.08, .22); s = int(p * SR); e = min(len(t), int((p + L) * SR)); env_[s:e] += np.hanning(e - s) if e > s else 0
            p += L + (r.uniform(.02, .1) if r.random() < .8 else r.uniform(.4, 1.2))
        fs = V[v % len(V)]; out += formant(src, fs) * lpf(env_, 30) * r.uniform(.4, 1)
    out = verb(out / (np.max(np.abs(out)) + 1e-9), 1.2, .35)[:len(t)] * loud
    return lpf(out, 3500) * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1)
save("crowd", babble(14, 26, seed=1))
save("crowd-agitated", babble(10, 40, seed=2) + .3 * babble(10, 12, seed=5))
save("court-murmur", lpf(babble(10, 18, seed=3), 1800))
def wail(d, n, seed=0):   # distant women's keening («صويت»): long falling-rising cries with wide vibrato, open /a/ and /i/ vowels
    r = np.random.default_rng(seed); t = t_(d); out = np.zeros_like(t)
    for v in range(n):
        st = r.uniform(0, d * .5); L = r.uniform(1.6, 3.2); s = int(st * SR); N = int(L * SR); tt = np.arange(N) / SR
        f0 = r.uniform(380, 520) * (1 + .18 * np.sin(np.pi * tt / L) - .25 * (tt / L) ** 2)
        ph = np.cumsum(f0 * (1 + .05 * np.sin(2 * np.pi * r.uniform(5, 7) * tt))) / SR; src = 2 * (ph % 1) - 1
        y = formant(src, (900, 1300, 2800) if v % 2 else (400, 2300, 3000)) * np.sin(np.pi * tt / L) ** .6
        e = min(len(t), s + N); out[s:e] += y[: e - s] * r.uniform(.5, 1)
    return verb(lpf(out, 3200), 2.2, .5)[:len(t)] * np.minimum(1, (d - t) / .8)
save("wail", wail(7, 6, seed=4))
def scream(d=2.2):   # one far-off woman's scream at dawn, very reverberant
    t = t_(d); f0 = 620 + 260 * np.exp(-t * 2) - 120 * t; ph = np.cumsum(f0 * (1 + .04 * np.sin(2 * np.pi * 9 * t))) / SR
    y = formant(2 * (ph % 1) - 1, (1000, 1500, 3000)) * np.minimum(1, t / .05) * np.exp(-t * .9) + bpf(noise(len(t)), 1500, 4000) * .15 * np.exp(-t * 2)
    return verb(lpf(y, 4000), 2.8, .6)
save("scream", scream())
def steps(d, rate, run=False, seed=0):   # footsteps on a dirt road
    r = np.random.default_rng(seed); t = t_(d); out = np.zeros_like(t); p = .1
    while p < d - .2:
        s = int(p * SR); L = int(.12 * SR); g = bpf(r.standard_normal(L), 200, 2500) * np.exp(-np.arange(L) / SR * (40 if run else 28)) + np.sin(2 * np.pi * 70 * np.arange(L) / SR) * np.exp(-np.arange(L) / SR * 50) * .6
        out[s:s + L] += g * r.uniform(.6, 1); p += 1 / rate * r.uniform(.9, 1.1)
    return out
save("steps", steps(6, 1.9)); save("run", steps(4, 4.2, True, 1) + .6 * steps(4, 3.8, True, 2))
def bark(seed):
    r = np.random.default_rng(seed); d = .35; t = t_(d); f0 = r.uniform(380, 520) * np.exp(-t * 3)
    ph = np.cumsum(f0) / SR; src = 2 * (ph % 1) - 1
    return (formant(src, (700, 1300, 2600)) * np.exp(-t * 9) * (1 - np.exp(-t * 200)) + bpf(noise(len(t)), 500, 3000) * np.exp(-t * 20) * .5)
d = 9; out = np.zeros(int(d * SR)); r = np.random.default_rng(3)
for k, p in enumerate([.3, .8, 1.25, 3.0, 3.4, 5.6, 6.0, 6.4, 7.8]): b = bark(k); s = int(p * SR); out[s:s + len(b)] += b * r.uniform(.5, 1)
save("dogs", verb(lpf(out, 2500), 2.5, .55))
def rooster():
    segs = [(.18, 520, 560), (.16, 640, 700), (.18, 760, 820), (.9, 900, 640)]; out = []
    for L, a, b in segs:
        t = t_(L); f0 = np.linspace(a, b, len(t)); ph = np.cumsum(f0 * (1 + .03 * np.sin(2 * np.pi * 30 * t))) / SR
        out.append(formant(2 * (ph % 1) - 1, (1200, 2200, 3400)) * np.sin(np.pi * t / L) ** .4); out.append(np.zeros(int(.04 * SR)))
    return verb(lpf(np.concatenate(out), 4000), 2.0, .55)
save("rooster", rooster())
# camera shutters, police radio, a typewriter, a door bang
def click(L=.05, f=3000): t = t_(L); return bpf(noise(len(t)), f * .5, f * 1.5) * np.exp(-t * 120)
d = 3; out = np.zeros(int(d * SR))
for p in (.1, .5, .62, 1.3, 1.9, 2.05, 2.6): s = int(p * SR); c = np.concatenate([click(.03, 4000), np.zeros(int(.05 * SR)), click(.05, 2500)]); out[s:s + len(c)] += c
save("shutters", out)
d = 3; t = t_(d); sq = bpf(noise(len(t)), 800, 3000) * .5; on = (t > .15) & (t < 2.6); talk = bpf(babble(d, 1, seed=9), 500, 2500)
save("radio", np.where(on, talk * 1.6 + sq * .15, sq * (np.abs(t - .1) < .1) + sq * (np.abs(t - 2.7) < .12)))
d = 4; out = np.zeros(int(d * SR)); r = np.random.default_rng(6); p = .1
while p < d - .5: s = int(p * SR); c = click(.04, 2200) + .5 * np.pad(click(.02, 5000), (0, 960)); out[s:s + len(c)] += c * r.uniform(.6, 1); p += r.uniform(.08, .2)
t = t_(.6); out[int(3.4 * SR):int(3.4 * SR) + len(t)] += np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 6) * .4
save("typewriter", out)
t = t_(1.2); save("door-bang", verb(np.sin(2 * np.pi * (60 + 40 * np.exp(-t * 20)) * t) * np.exp(-t * 10) + bpf(noise(len(t)), 300, 3000) * np.exp(-t * 30) * .7, 1.2, .3))

print("ok")
