"""Align script lines to a narration by *what is said*, not just by length.

1. Split the voice at short pauses into speech chunks.
2. Transcribe every chunk with Whisper (sherpa-onnx, model from GitHub releases).
3. Assign consecutive chunks to script lines with dynamic programming, scoring
   by character-trigram overlap between the chunk text and the line text.

Usage: python align_asr.py voice.wav script.txt out.json --model <dir with small-*.onnx>
Prints each line with its time and the heard text so mistakes are easy to spot.
"""
import sys, re, json, argparse, subprocess, wave
import numpy as np
import sherpa_onnx

ap = argparse.ArgumentParser()
ap.add_argument("voice"); ap.add_argument("script"); ap.add_argument("out")
ap.add_argument("--model", required=True); ap.add_argument("--lang", default="ar"); ap.add_argument("--db", type=float, default=-38); ap.add_argument("--gap", type=float, default=0.14)
a = ap.parse_args()

# speech chunks between pauses
log = subprocess.run(["ffmpeg", "-i", a.voice, "-af", f"silencedetect=noise={a.db}dB:d={a.gap}", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.voice, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32); SR = 16000; dur = len(x) / SR
segs, cur = [], 0.0
for s, e in zip(st, en):
    if s - cur > 0.12: segs.append((cur, s))
    cur = e
if dur - cur > 0.12: segs.append((cur, dur))

m = a.model.rstrip("/"); pre = "small" if "small" in m else ("base" if "base" in m else "tiny")
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{m}/{pre}-encoder.int8.onnx", decoder=f"{m}/{pre}-decoder.int8.onnx",
                                                tokens=f"{m}/{pre}-tokens.txt", language=a.lang, task="transcribe", num_threads=4)
texts = []
for s, e in segs:
    chunk = x[int(max(0, s - 0.05) * SR): int(min(dur, e + 0.05) * SR)]
    stream = rec.create_stream(); stream.accept_waveform(SR, np.pad(chunk, (0, int(0.3 * SR))))
    rec.decode_stream(stream); texts.append(stream.result.text.strip())

def norm(t):
    if a.lang != "ar": return re.sub(r"[^a-z0-9]", "", t.lower())
    t = re.sub(r"[ً-ْـ]", "", t)                       # tashkeel, tatweel
    t = t.translate(str.maketrans("أإآىةؤئ", "اااهةوي")).replace("ة", "ه")
    return re.sub(r"[^ء-ي0-9]", "", t)
def grams(t): t = norm(t); return {t[i:i + 3] for i in range(max(1, len(t) - 2))}
lines = [l.strip() for l in open(a.script, encoding="utf-8") if l.strip()]
LG = [grams(l) for l in lines]; SG = [grams(t) for t in texts]
N, M = len(lines), len(segs)
def score(i, j, k):  # line i covers chunks j..k-1
    g = set().union(*SG[j:k]); inter = len(g & LG[i]); u = len(g | LG[i]) or 1
    d = segs[k - 1][1] - segs[j][0]; L = len(norm(lines[i])) / (14.0 if a.lang == "ar" else 15.0)  # chars/s
    return inter / u - 0.15 * abs(d - L) / max(L, 1)
INF = -1e9; dp = [[INF] * (M + 1) for _ in range(N + 1)]; bk = [[0] * (M + 1) for _ in range(N + 1)]; dp[0][0] = 0
for i in range(1, N + 1):
    for k in range(1, M + 1):
        for j in range(max(0, k - 8), k):
            if dp[i - 1][j] <= INF: continue
            v = dp[i - 1][j] + score(i - 1, j, k)
            if v > dp[i][k]: dp[i][k], bk[i][k] = v, j
res, k = [], M
for i in range(N, 0, -1):
    j = bk[i][k]; res.append((i - 1, j, k)); k = j
res.reverse()
out = []
for i, j, k in res:
    out.append({"i": i, "start": round(segs[j][0], 2), "end": round(segs[k - 1][1], 2), "text": lines[i], "heard": " ".join(texts[j:k])})
    print(f"{i:2d} {segs[j][0]:6.2f}-{segs[k-1][1]:6.2f} | {lines[i][:34]:34s} | {' '.join(texts[j:k])[:44]}")
json.dump({"duration": dur, "lines": out}, open(a.out, "w"), ensure_ascii=False, indent=1)
