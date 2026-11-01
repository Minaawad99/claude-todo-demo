"""Set up a «الصور» (photo-list) video folder.

Usage: python make.py <videos/slug/list> <intro clip (any format)> [--music track.mp3] [--intro-start 0] [--intro-dur 5.2]
- cuts the user's opening clip into intro/0001.jpg… (30 fps, 720×1280 cover crop) and writes intro.frames into list.js
  (list.js must already exist with the rest of LIST filled in; see template.html);
- copies template.html to index.html;
- writes music.wav: the given track, or, with no track, the original music bed from videos/audio/sfx.py.
Then render with: TAIL=0 node videos/render.js $PWD/<dir>/index.html <dir>/music.wav <out.mp4>
"""
import sys, os, re, shutil, subprocess, argparse, glob, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("clip")
ap.add_argument("--music"); ap.add_argument("--intro-dur", type=float); ap.add_argument("--intro-start", type=float, default=0)
a = ap.parse_args()
d = os.path.abspath(a.dir); os.makedirs(os.path.join(d, "intro"), exist_ok=True)
for f in glob.glob(os.path.join(d, "intro", "*.jpg")): os.remove(f)
cut = ["-t", str(a.intro_dur)] if a.intro_dur else []
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a.intro_start), "-i", a.clip, *cut, "-vf",
                "fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280", "-q:v", "3",
                os.path.join(d, "intro", "%04d.jpg")], check=True)
n = len(glob.glob(os.path.join(d, "intro", "*.jpg")))
js = os.path.join(d, "list.js"); src = open(js, encoding="utf-8").read()
src, k = re.subn(r"frames:\s*\d+", f"frames: {n}", src, count=1)
if not k: sys.exit("list.js needs intro: {frames: 0, …}")
open(js, "w", encoding="utf-8").write(src)
shutil.copy(os.path.join(HERE, "template.html"), os.path.join(d, "index.html"))

out = os.path.join(d, "music.wav")
if a.music:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.music, "-ac", "2", "-ar", "48000",
                    "-af", "afade=t=in:d=1.5", out], check=True)
else:
    sys.path.insert(0, os.path.join(HERE, "../../audio")); import sfx
    x = sfx.bed(150.0); x = x / (np.abs(x).max() + 1e-9) * 0.5
    x[: 48000 * 2] *= np.linspace(0, 1, 48000 * 2)
    sfx.write_wav(out, x.astype(np.float32))
print(f"intro: {n} frames ({n / 30:.1f} s); index.html and music.wav written in {d}")
