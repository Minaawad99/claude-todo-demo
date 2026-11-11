"""Align script lines to a narration by *what is said*, not just by length.

1. Split the voice at short pauses into speech chunks.
2. Transcribe every chunk with Gemini (for when the whisper model can't be downloaded).
3. Assign consecutive chunks to script lines with dynamic programming, scoring
   by character-trigram overlap between the chunk text and the line text.

Usage: python align_gemini.py voice.wav script.txt out.json [--model gemini-3.8-flash]
Prints each line with its time and the heard text so mistakes are easy to spot.
"""
import sys, re, json, argparse, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("voice"); ap.add_argument("script"); ap.add_argument("out")
ap.add_argument("--model", default="gemini-3.8-flash"); ap.add_argument("--lang", default="ar"); ap.add_argument("--db", type=float, default=-38); ap.add_argument("--gap", type=float, default=0.14)
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

# transcribe every chunk with Gemini (one request, numbered audio parts); the key is added by the network proxy
import base64, io, urllib.request
def wav_b64(c):
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(c, -1, 1) * 32767).astype("<i2").tobytes()); w.close(); return base64.b64encode(b.getvalue()).decode()
def one(n):
    s, e = segs[n]
    parts = [{"text": "Transcribe this short Egyptian Arabic audio clip exactly as spoken, in Arabic script, numbers as words. Reply with the words only."},
             {"inlineData": {"mimeType": "audio/wav", "data": wav_b64(x[int(max(0, s - 0.05) * SR): int(min(dur, e + 0.05) * SR)])}}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"temperature": 0}}
    import time
    for attempt in range(8):
        try:
            req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % a.model, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=120))
            return "".join(q.get("text", "") for q in r["candidates"][0]["content"]["parts"]).strip()
        except Exception as ex: err = ex; time.sleep(4 * (attempt + 1))
    raise SystemExit("clip %d: %s" % (n, err))
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(2) as ex: texts = list(ex.map(one, range(len(segs))))
print(len(segs), "clips transcribed")

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
