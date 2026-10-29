"""Carry line timings measured on the raw narration over to the tightened + sped-up voice.
Usage: python map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.25 --tempo 1.06
(--max and --tempo must match what tighten.py and atempo used.)"""
import re, subprocess, json, argparse
ap = argparse.ArgumentParser(); ap.add_argument("raw"); ap.add_argument("timing"); ap.add_argument("voice"); ap.add_argument("out")
ap.add_argument("--max", type=float, default=0.25); ap.add_argument("--tempo", type=float, default=1.08); ap.add_argument("--db", type=float, default=-38)
a = ap.parse_args()
log = subprocess.run(["ffmpeg", "-i", a.raw, "-af", f"silencedetect=noise={a.db}dB:d={a.max}", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
half = a.max / 2; keep = []; cur = 0.0
for s, e in zip(st, en): keep.append((cur, s + half)); cur = max(s + half, e - half)
keep.append((cur, 1e9))
def m(t):
    out = 0.0
    for x0, x1 in keep:
        if t <= x0: return out / a.tempo
        if t <= x1: return (out + t - x0) / a.tempo
        out += x1 - x0
    return out / a.tempo
d = json.load(open(a.timing))
for l in d["lines"]: l["start"] = round(m(l["start"]), 2); l["end"] = round(m(l["end"]), 2); l.pop("heard", None)
d["duration"] = round(float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.voice], capture_output=True, text=True).stdout), 2)
open(a.out, "w").write("window.TIMING = " + json.dumps(d, ensure_ascii=False, indent=1) + ";\n")
print(" ".join(f"{l['i']}:{l['start']}" for l in d["lines"]))
