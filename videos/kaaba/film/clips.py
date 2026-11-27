"""Cuts the real clips into JPEG frames for the cards (30 fps, 900 px wide) and copies the photos. Writes cards.js with each card's
start/end in seconds (from timing.js) and its frame count. Frames live in ./frames (a link to the scratchpad, not committed).
Run from videos/kaaba/film: python3 clips.py"""
import json, os, subprocess, shutil
H = os.path.dirname(os.path.abspath(__file__)); REAL = os.path.join(H, "../real"); FR = os.path.join(H, "frames")
T = json.loads(open(os.path.join(H, "../timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))["lines"]
cards = json.load(open(os.path.join(H, "cards.json"), encoding="utf-8")); out = []
for c in cards:
    L = T[c["line"]]; nxt = T[c["line"] + 1]["start"] if c["line"] + 1 < len(T) else L["end"] + 1
    span = nxt - L["start"]; a = L["start"] + c["from"] * span - .15; b = L["start"] + c["to"] * span - .1
    d = os.path.join(FR, c["id"]); os.makedirs(d, exist_ok=True)
    if "photo" in c:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(REAL, c["photo"]), "-vf", "scale=900:-2", os.path.join(d, "0001.jpg")], check=True); n = 1
    else:
        vf = (f"crop={c['crop']}," if c.get("crop") else "") + "fps=30,scale=900:-2"
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(c["ss"]), "-t", str(b - a + .3), "-i", os.path.join(REAL, c["src"] + ".mp4"), "-vf", vf, "-q:v", "3", os.path.join(d, "%04d.jpg")], check=True)
        n = len(os.listdir(d))
    out.append({"id": c["id"], "a": round(a, 2), "b": round(b, 2), "n": n, "tag": c["tag"], "photo": "photo" in c})
    print(c["id"], round(a, 2), round(b, 2), n)
open(os.path.join(H, "cards.js"), "w", encoding="utf-8").write("window.CARDS = " + json.dumps(out, ensure_ascii=False) + ";\n")
