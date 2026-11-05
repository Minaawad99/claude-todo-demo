"""Assemble the crow episode: voice track, picture, music bed, sound effects, watermark, end card.
python3 build.py <clips dir> <synced dir> <out.mp4>
<clips dir>: the raw Veo clips (C05, C06, R04, R05, R11, R21). <synced dir>: H*/K* clips after sync_all.sh.
Every line is a block: its audio (from a synced clip, or from final/NN-*.wav) and the pictures that cover it."""
import sys, os, re, json, subprocess, tempfile
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); INS = f"{HERE}/inserts/out"
CL, SY, OUT = sys.argv[1:4]
SR, FPS, GAP = 48000, 30, 0.18
TMP = tempfile.mkdtemp()

def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
def pcm(f, a=0, b=None):
    args = ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-i", f] + (["-t", f"{b - a:.3f}"] if b else []) + ["-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).copy()
def speech_span(f):  # first/last moment of our voice in a synced clip (its silence is digital)
    log = subprocess.run(["ffmpeg", "-i", f, "-af", "silencedetect=noise=-45dB:d=0.1", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    s = en[0] if st and st[0] < 0.05 else 0.0
    e = st[-1] if len(st) > len(en) else dur(f)
    return s, e
def line(n): return next(f"{HERE}/final/{x}" for x in sorted(os.listdir(f"{HERE}/final")) if x.startswith(n + "-"))

C = lambda k: f"{CL}/{k}.mp4"; S = lambda k: f"{SY}/{k}.mp4"; I = lambda k: f"{INS}/{k}.mp4"
WARM = "colorbalance=rs=.06:gs=.01:bs=-.08:rm=.05:bm=-.06,eq=saturation=.85:brightness=-.03"   # pull cool Veo shots toward the amber look
blocks = []   # (audio array, [(src, in, dur|None, grade)], fx cues relative to block start)

def talk(k, cover=None, fx=()):
    """A line spoken on camera: audio and picture both from the synced clip. cover=[(src,in,dur,grade)] replaces the picture after `at` seconds."""
    s, e = speech_span(S(k)); a0, a1 = max(0, s - 0.25), min(dur(S(k)), e + 0.2)
    aud = pcm(S(k), a0, a1); L = len(aud) / SR + GAP
    if cover:
        at, pieces = cover; vid = [(S(k), a0, at, "")] + pieces
    else: vid = [(S(k), a0, None, "")]
    blocks.append((aud, vid, list(fx)))
def over(n, pieces, a=0.0, b=None, fx=()):
    """A line (or part of it, seconds a..b of final/NN) spoken over other pictures."""
    blocks.append((pcm(line(n), a, b), pieces, list(fx)))

talk("H01", fx=[(0, "wind_in")])
talk("K02")
talk("H03")
talk("K04")
over("04", [(C("R04"), 0.5, 4.2, WARM), (C("R05"), 0, None, "")], a=5.85)
talk("K05")
talk("H06")
talk("K07")
over("07", [(I("PIN_WA"), 0, 2.6, ""), (I("M07"), 0, None, "")], a=1.50, fx=[(0, "whoosh"), (1.4, "pop")])
over("08", [(I("M07"), 6.6, 1.4, ""), (C("C05"), 0, None, "")])
talk("H09")
talk("K10", cover=(2.4, [(I("M10"), 0, None, "")]))
over("11", [(C("R11"), 0, 6.0, WARM), (I("M11"), 2.2, None, "")])
talk("H12")
over("13", [(I("PIN_NC"), 0, 2.6, ""), (I("M13"), 0, None, "")], fx=[(0, "whoosh"), (1.4, "pop")])
over("14", [(I("M14"), 0, 8.0, ""), (C("C06"), 0.3, None, "")], fx=[(0.9 + i * .78 + .35, "drop") for i in range(7)])
over("15", [(I("PIN_JP"), 0.8, 1.8, ""), (I("M15"), 0.6, None, "")], fx=[(0, "whoosh"), (0.6, "pop"), (4.55, "clink")])
talk("H16")
talk("K17")
talk("K18")
over("18", [(I("M18"), 1.0, None, "")], a=6.15)
over("19", [(I("PIN_SE"), 0, 2.6, ""), (I("M19"), 0, 8.0, ""), (C("C05"), 3.0, None, "")], fx=[(0, "whoosh"), (1.4, "pop")])
over("20", [(I("PIN_DE"), 0, 2.6, ""), (I("M20"), 0.4, None, "")], fx=[(0, "whoosh"), (1.4, "pop")])
talk("K21", cover=(0.0, [(C("R21"), 0, 2.4, ""), (S("K21"), None, None, "")]))
talk("H22")
talk("H23")
talk("K24")

# ── timeline ──
voice, pieces, cues, t = [], [], [], 0.0
for aud, vid, fx in blocks:
    L = len(aud) / SR + GAP
    voice.append(np.concatenate([aud, np.zeros(int(GAP * SR), np.float32)]))
    left, used = L, 0.0
    for i, (src, a, d, g) in enumerate(vid):
        if a is None: a = vid[0][1] + used           # continue the block's first clip where the cover ended
        d = left if (d is None or i == len(vid) - 1) else min(d, left)
        if d <= 0.01: continue
        pieces.append((src, a, d, g)); left -= d; used += d
    cues += [(t + ft, name) for ft, name in fx]
    t += L
END = 3.5; total = t + END
voice = np.concatenate(voice)
print(f"episode {total:.1f}s, {len(blocks)} blocks, {len(pieces)} pieces")

# ── picture ──
lst = open(f"{TMP}/v.txt", "w")
for i, (src, a, d, g) in enumerate(pieces + [(I("END"), 0, END, "")]):
    p = f"{TMP}/p{i:03d}.mp4"
    vf = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},tpad=stop_mode=clone:stop_duration=10" + (f",{g}" if g else "") + f",trim=duration={d:.4f},setpts=PTS-STARTPTS"
    if src.startswith(INS):   # graphics carry their own text: no watermark on them
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", src, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", p)
    else:
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", src, "-i", f"{INS}/watermark.png", "-an", "-filter_complex", f"[0]{vf}[b];[1]scale=1080:1920,format=rgba[w];[b][w]overlay=0:0", "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", p)
    lst.write(f"file '{p}'\n")
lst.close()
run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{TMP}/v.txt", "-c", "copy", f"{TMP}/pic.mp4")

# ── sound: dark ambient bed (original, synthesized) + effects + voice ──
sys.path.insert(0, f"{HERE}/../audio"); import sfx
n = int(total * SR); tt = np.arange(n) / SR
def tone(f, amp): return amp * np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * 0.07 * tt))
chords = [(55.0, 65.4, 82.4), (49.0, 61.7, 73.4), (43.65, 55.0, 65.4), (49.0, 58.3, 73.4)]   # A minor → G → F → Gm, 8 s each
bed = np.zeros(n, np.float32)
for k, ch in enumerate(chords * int(total // 32 + 1)):
    s0 = int(k * 8 * SR); s1 = min(n, s0 + int(9 * SR))
    if s0 >= n: break
    w = np.sin(np.pi * np.clip((np.arange(s1 - s0)) / (9 * SR), 0, 1)) ** 1.5
    for j, f in enumerate(ch):
        for o in (1, 2):
            bed[s0:s1] += (w * 0.5 / o / (j + 1) * np.sin(2 * np.pi * f * o * tt[s0:s1] + j)).astype(np.float32)
air = sfx.lp_fast(sfx.noise(n), 900) * (0.25 + 0.15 * np.sin(2 * np.pi * 0.05 * tt))
bed = sfx.lp_fast(bed, 1200) + air.astype(np.float32) * 0.6
fade = np.minimum(1, np.minimum(tt / 2.0, (total - tt) / 2.5)).astype(np.float32); bed *= fade
v = np.zeros(n, np.float32); v[:len(voice)] = voice[:n]
def db(x): return 20 * np.log10(np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2)) + 1e-9)
vr = db(v)
env_v = sfx.lp_fast(np.abs(v), 4) ; duck = 1 - 0.55 * np.clip(env_v / (np.max(env_v) * 0.15), 0, 1)
bed *= 10 ** ((vr - 21 - db(bed)) / 20); bed *= duck.astype(np.float32)
fxmap = {"wind_in": lambda: sfx.fx_wind(3.0), "whoosh": sfx.fx_whoosh, "pop": sfx.fx_pop, "drop": sfx.fx_drop, "clink": lambda: sfx.fx_clink(0.5, 900)}
fx = np.zeros(n, np.float32)
for ct, name in cues:
    x = fxmap[name](); s0 = int(ct * SR); x = x[: max(0, n - s0)]
    fx[s0:s0 + len(x)] += x * 10 ** ((vr - 16 - db(x)) / 20)
mix = v + bed + fx
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
sfx.write_wav(f"{TMP}/mix.wav", mix)

# ── final: picture + sound ──
run("ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/pic.mp4", "-i", f"{TMP}/mix.wav",
    "-vf", f"fade=t=out:st={total - 0.6:.2f}:d=0.6", "-map", "0:v", "-map", "1:a", "-t", f"{total:.3f}",
    "-c:v", "libx264", "-profile:v", "high", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", str(FPS),
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT)
print(OUT, f"{dur(OUT):.1f}s")
