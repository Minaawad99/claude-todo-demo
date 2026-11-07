"""Tighten a narration: cap every pause at --max seconds (with short fades so cuts are inaudible).
Usage: python tighten.py in.wav out.wav [--max 0.25] [--db -38]
Then speed up without changing pitch: ffmpeg -i out.wav -af atempo=1.08 final.wav
"""
import sys, re, subprocess, argparse, wave
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--max", type=float, default=0.25); ap.add_argument("--db", type=float, default=-38)
a = ap.parse_args()
log = subprocess.run(["ffmpeg", "-i", a.inp, "-af", f"silencedetect=noise={a.db}dB:d={a.max}", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
with wave.open(a.inp) as w:
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
x = x.reshape(-1, ch).astype(np.float32)
keep, cur, fade = [], 0, int(0.01 * sr)
for s, e in zip(st, en):
    s, e = int(s * sr), int(e * sr); half = int(a.max * sr / 2)
    keep.append(x[cur:s + half]); cur = max(s + half, e - half)
keep.append(x[cur:])
for k in keep:  # tiny fades at every cut
    if len(k) > 2 * fade: k[:fade] *= np.linspace(0, 1, fade)[:, None]; k[-fade:] *= np.linspace(1, 0, fade)[:, None]
y = np.concatenate(keep).astype(np.int16)
with wave.open(a.out, "wb") as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())
print(f"{len(x)/sr:.1f}s -> {len(y)/sr:.1f}s ({len(st)} pauses capped at {a.max}s)")
