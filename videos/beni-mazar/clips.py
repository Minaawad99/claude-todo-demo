"""The real Al Arabiya 2005 news clips play in gaps in the narration: one before the narrator starts (the cold open) and two inside the
story. This script opens those gaps: it cuts voice-narr.wav between lines, puts silence in, writes voice.wav, rebuilds
script.txt (the narrator's lines from voice-script.txt plus one line per clip, the words heard in it) and timing.js.
cues.js mixes the clips themselves in at the times in TIMING.clips. Run: python3 clips.py"""
import json, numpy as np, soundfile as sf
# after = the narrator line (index in voice-script.txt) the clip follows, -1 = before the first line.
# slot = seconds of gap; say = how long the clip line's words stay as the timed line; text = the words heard.
CLIPS = [
    {"after": -1, "file": "news-hook", "slot": 8.2, "say": 7.4, "text": "«جريمة بشعة وغير مسبوقة… لم تشهد مصر مثلها من قبل.»"},
    {"after": 17, "file": "news-ten", "slot": 10.7, "say": 9.9, "text": "«راح ضحيتها عشرة أفراد، من ثلاث أسر مختلفة لا تجمعهم صلة القرابة… في منازل متجاورة.»"},
    {"after": 44, "file": "news-zero", "slot": 7.8, "say": 7.0, "text": "«الكل يحاول أن يدلي بدلوه… لينتهي الجميع من حيث بدأوا… من نقطة الصفر.»"},
]
T = json.loads(open("narr-timing.js", encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
NL = T["lines"]; x, sr = sf.read("voice-narr.wav", dtype="float32")
out, lines, clips, pos, shift = [], [], [], 0, 0.0
def add_clip(c):
    global shift
    t0 = pos / sr + shift
    lines.append({"i": len(lines), "start": round(t0 + 0.3, 2), "end": round(t0 + 0.3 + c["say"], 2), "text": c["text"], "clip": c["file"]})
    clips.append({"file": c["file"], "t": round(t0 + 0.25, 2), "line": len(lines) - 1})
    out.append(np.zeros(int(c["slot"] * sr), dtype="float32")); shift += c["slot"]
for c in CLIPS:
    if c["after"] == -1: add_clip(c)
for k, l in enumerate(NL):
    lines.append({"i": len(lines), "start": round(l["start"] + shift, 2), "end": round(l["end"] + shift, 2), "text": l["text"]})
    cut = len(x) if k == len(NL) - 1 else int((l["end"] + NL[k + 1]["start"]) / 2 * sr)
    out.append(x[pos:cut]); pos = cut
    for c in CLIPS:
        if c["after"] == k: add_clip(c)
y = np.concatenate(out); sf.write("voice.wav", y, sr, subtype="PCM_16")
open("script.txt", "w", encoding="utf-8").write("\n".join(l["text"] for l in lines) + "\n")
open("timing.js", "w", encoding="utf-8").write("window.TIMING = " + json.dumps({"duration": round(len(y) / sr, 2), "clips": clips, "lines": lines}, ensure_ascii=False, indent=1) + ";\n")
print("duration", round(len(y) / sr, 2), "· clips", [(c["file"], c["t"], c["line"]) for c in clips])
