"""Turn the real clips the user sent into sprite sheets the page can draw frame by frame (render.js screenshots
synchronously, so one already-decoded image per clip is safer than a video element or one file per frame).
python3 tools/clips.py <uploads dir>  ->  clips/<name>.jpg + clips/clips.js (window.CLIPS = {name: {w,h,cols,n,fps}})"""
import json, os, subprocess, sys, glob, math, tempfile
U = sys.argv[1]; HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "clips")
def src(prefix): return glob.glob(os.path.join(U, prefix + "*"))[0]
# name: source, crop (w:h:x:y or None), out size, fps, segments [(start, length, speed)]
SPEC = {
  "viral":  ("1b030634", None,              (216, 384), 10, [(0, 15.2, 1)]),
  "gifts":  ("9fa12093", None,              (216, 384), 10, [(3.5, 9, 1.5), (23.6, 2.2, 1)]),
  "sweden": ("fcc4e072", "1190:892:250:40", (320, 240), 10, [(1.0, 3.8, 1), (9.0, 5.5, 1)]),
  "japan":  ("b8c31e2e", None,              (320, 240), 10, [(54, 4.5, 1), (102, 4, 1), (24, 4, 1)]),
  "faces":  ("cce174ca", "495:880:40:20",   (216, 384), 10, [(21, 11, 1), (49, 8, 1)]),
  "water":  ("fa7ff0bf", None,              (240, 322), 10, [(0.5, 17.5, 1)]),
  "betty":  ("40989aa4", None,              (320, 240), 10, [(0, 2, 1), (2, 19, 4), (23, 13, 3), (36, 12, 2)]),
  "puzzle": ("d8c5c82a", None,              (384, 216), 10, [(40.5, 3, 1), (64, 36, 4)]),
}
meta = {}
for name, (pre, crop, (w, h), fps, segs) in SPEC.items():
    f = src(pre); tmp = tempfile.mkdtemp()
    parts = []
    for i, (ss, ln, sp) in enumerate(segs):
        p = os.path.join(tmp, "s%d.mp4" % i)
        vf = ("crop=%s," % crop if crop else "") + "setpts=PTS/%g,scale=%d:%d,fps=%d" % (sp, w, h, fps)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(ln), "-i", f, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "12", p], check=True)
        parts.append(p)
    lst = os.path.join(tmp, "l.txt"); open(lst, "w").write("".join("file '%s'\n" % p for p in parts))
    cat = os.path.join(tmp, "cat.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", cat], check=True)
    n = int(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", cat], capture_output=True, text=True).stdout.strip())
    cols = math.ceil(math.sqrt(n * h / w)); rows = math.ceil(n / cols)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", cat, "-vf", "tile=%dx%d" % (cols, rows), "-frames:v", "1", "-q:v", "3", os.path.join(OUT, name + ".jpg")], check=True)
    meta[name] = {"w": w, "h": h, "cols": cols, "n": n, "fps": fps}
    print(name, n, "frames", cols, "x", rows, os.path.getsize(os.path.join(OUT, name + ".jpg")) // 1024, "KB")
open(os.path.join(OUT, "clips.js"), "w").write("window.CLIPS = " + json.dumps(meta) + ";\n")
