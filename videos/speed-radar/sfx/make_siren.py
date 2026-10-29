"""Synthesizes the ambulance siren for lines 11–12, with a real Doppler shift: a hi-lo siren on a van doing
90 km/h that passes 8 m from the listener halfway through the clip. Run: python3 make_siren.py"""
import numpy as np, wave, os
SR, C = 48000, 343.0
def siren(dur, v, d0, pass_at, path):
    t = np.arange(int(dur * SR)) / SR
    x = (t - pass_at) * v                                  # van position along the road, 0 = in front of the listener
    r = np.sqrt(x ** 2 + d0 ** 2)
    te = t - r / C                                         # when the sound now arriving was emitted
    xe = (te - pass_at) * v
    vr = -v * xe / np.sqrt(xe ** 2 + d0 ** 2)              # speed towards the listener at emission
    tone = np.where((te * 1.5) % 1 < 0.5, 960.0, 720.0)    # hi-lo, a step every third of a second
    f = tone * C / (C - vr)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = 0.6 * np.sign(np.sin(ph)) * 0.35 + 0.65 * np.sin(ph) + 0.2 * np.sin(2 * ph)
    s *= 1.0 / (1 + (r / 25) ** 2) ** 0.5
    fade = np.minimum(1, np.minimum(t / 0.15, (dur - t) / 0.3))
    s = (s * fade / np.max(np.abs(s)) * 0.8 * 32767).astype(np.int16)
    with wave.open(path, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes())
here = os.path.dirname(os.path.abspath(__file__))
siren(3.4, 25.0, 8.0, 1.68, os.path.join(here, "siren-pass.wav"))
siren(3.2, 25.0, 60.0, 6.0, os.path.join(here, "siren-far.wav"))   # still far away and coming closer
print("ok")
