"""Builds the picture track: every shot as a 1080×1920 30 fps clip, then joined with short crossfades.
python3 base.py <workdir>   →  <workdir>/base.mp4"""
import os, sys, subprocess
from plan import SHOTS, END, XF, EP, RECAP_CROP, RECAP_SCALE, RECAP_Y
W, H, FPS = 1080, 1920, 30
work = sys.argv[1]; os.makedirs(work, exist_ok=True)
M = os.path.join(EP, "media")
SPEED = {"08-breaker.mp4": 2.0, "08b-plug.mp4": 2.0, "03-door.mp4": 2.0}
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]

def run(a): subprocess.run(["ffmpeg", "-v", "error", "-y"] + a, check=True)

clips = []
for i, (t, m, o) in enumerate(SHOTS):
    nx = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else END
    d = nx - t + (XF if i + 1 < len(SHOTS) else 0)
    out = os.path.join(work, f"s{i:02d}.mp4"); clips.append((out, d))
    if m == "RECAP":
        x, y, w, h = RECAP_CROP
        run(["-loop", "1", "-i", os.path.join(M, "06-22-heart-icons.jpg"), "-t", f"{d:.3f}", "-vf",
             f"crop={w}:{h}:{x}:{y},scale={W}:{round(h * RECAP_SCALE)}:flags=lanczos,pad={W}:{H}:0:{round(RECAP_Y)}:color=0x161c26,fps={FPS}"] + ENC + [out])
    elif m.endswith(".jpg"):
        z0, z1 = o.get("zoom", (1.0, 1.06)); fy = o.get("fy", 0.5)
        # cover-fit, then a slow eased zoom: scale up 2× first so the per-frame crop moves smoothly
        N = round(d * FPS)
        z = f"{z0}+({z1}-{z0})*(0.5-0.5*cos(PI*min(1,on/{N})))"
        run(["-loop", "1", "-framerate", str(FPS), "-i", os.path.join(M, m), "-t", f"{d:.3f}", "-vf",
             f"scale={W * 3}:{H * 3}:force_original_aspect_ratio=increase:flags=lanczos,crop={W * 3}:{H * 3},"
             f"zoompan=z='{z}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*{fy}':d=1:s={W}x{H}:fps={FPS}"] + ENC + [out])
    else:
        src = os.path.join(M, m); sp = SPEED.get(m, 1.0)
        n = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
        if d * sp > n - 0.1: sp = (n - 0.1) / d          # too long: play it slower so it fills the shot
        run(["-i", src, "-t", f"{d:.3f}", "-vf",
             f"setpts=PTS/{sp:.4f},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS}"] + ENC + [out])
    print(i, m, round(d, 2), flush=True)

# crossfades
args, fl, off, last = [], [], 0.0, "[0:v]"
for i, (c, d) in enumerate(clips): args += ["-i", c]
for i in range(1, len(clips)):
    off += clips[i - 1][1] - XF
    lab = f"[v{i}]"
    fl.append(f"{last}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}{lab}"); last = lab
run(args + ["-filter_complex", ";".join(fl), "-map", last] + ENC + [os.path.join(work, "base.mp4")])
print("base", subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(work, "base.mp4")], capture_output=True, text=True).stdout.strip())
