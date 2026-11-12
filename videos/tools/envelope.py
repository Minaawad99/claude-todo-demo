"""The narrator's loudness over time, for drawings that move with the voice (a jaw that talks, vocal folds that buzz).
python3 envelope.py voice.wav env.js  →  window.VOXENV = {fps: 30, v: [0..1, …]}; read it with VOX(t) (template helper).
0 = silence, 1 = the loud syllables; smoothed with a short attack and a slower release so mouths don't flicker."""
import sys, subprocess, json, numpy as np
src, out = sys.argv[1], sys.argv[2]; SR, FPS = 16000, 30
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
hop = SR // FPS; n = len(x) // hop
db = np.array([20 * np.log10(np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean()) + 1e-9) for i in range(n)])
lo, hi = np.percentile(db, 20), np.percentile(db, 97)
v = np.clip((db - lo) / (hi - lo), 0, 1)
s = np.zeros_like(v); a, r = .6, .25
for i in range(n): p = s[i - 1] if i else 0; s[i] = p + (v[i] - p) * (a if v[i] > p else r)
open(out, "w").write("window.VOXENV = " + json.dumps({"fps": FPS, "v": [round(float(q), 3) for q in s]}) + ";\n")
print(out, n, "frames")
