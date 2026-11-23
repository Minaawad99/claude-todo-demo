"""Assemble an episode from episode.json: voice track, pictures, colour grade, music bed, effects, watermark, end card.
  python3 build.py <episode dir> <out.mp4>
Also writes <out>-voice.wav (the voice alone) for QA.

Episode dir layout (all made by the earlier steps):
  final/NN-host.wav, final/NN-guest.wav   finished voice lines (voices.py)
  clips/<ID>.mp4                          raw Veo clips (silent shots: C.., R..)
  synced/<ID>.mp4 + synced/<ID>.wav       talking clips with our voice (sync.py)
  inserts/out/<ID>.mp4                    motion graphics, PIN_*, END; inserts/out/watermark.png

episode.json "blocks", in order, one per spoken line or part of a line:
  {"talk": "H01"}                                      line spoken on camera: audio + picture from synced/H01
  {"talk": "K10", "cover_at": 2.4, "cover": [["M10", 0, null]]}
                                                       after 2.4 s the picture switches to other shots (audio stays)
  {"talk": "K21", "cover_at": 0, "cover": [["R21", 0, 2.4], ["@talk", null, null]]}
                                                       "@talk" continues the talking clip where the cover ended
  {"over": "04", "from": 5.75, "to": null, "pieces": [["R04", 0.5, 4.2, "warm"], ["R05", 0, null]]}
                                                       line 04 from 5.75 s to the end, spoken over these shots
  any block may add "fx": [[seconds from block start, "whoosh"|"pop"|"drop"|"clink"|"wind_in"], ...]
A piece is [ID, in-point s, duration s or null = "until the block ends", optional grade "warm"].
IDs are looked up in inserts/out, then clips, then synced. Graphics (inserts/out) get no watermark."""
import sys, os, re, json, subprocess, tempfile
import numpy as np
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H); import sfx
EP = os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2])
cfg = json.load(open(f"{EP}/episode.json"))
SR, FPS, GAP, END = 48000, 30, cfg.get("gap", 0.18), cfg.get("end_card_seconds", 3.5)
INS, CL, SY = f"{EP}/inserts/out", f"{EP}/clips", f"{EP}/synced"
TMP = tempfile.mkdtemp()
GRADES = {"warm": "colorbalance=rs=.06:gs=.01:bs=-.08:rm=.05:bm=-.06,eq=saturation=.85:brightness=-.03"}   # pull cool Veo shots toward amber

def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
def pcm(f, a=0, b=None):
    args = ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-i", f] + (["-t", f"{b - a:.3f}"] if b else []) + ["-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).copy()
def speech_span(f):
    log = subprocess.run(["ffmpeg", "-i", f, "-af", "silencedetect=noise=-45dB:d=0.1", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    return (en[0] if st and st[0] < 0.05 else 0.0), (st[-1] if len(st) > len(en) else dur(f))
def line(n): return next(f"{EP}/final/{x}" for x in sorted(os.listdir(f"{EP}/final")) if x.startswith(n + "-"))
def src(k):
    for d in (INS, CL, SY):
        if os.path.exists(f"{d}/{k}.mp4"): return f"{d}/{k}.mp4"
    sys.exit(f"missing shot {k} (looked in inserts/out, clips, synced)")

blocks = []
for b in cfg["blocks"]:
    fx = [tuple(x) for x in b.get("fx", [])]
    if "talk" in b:
        k = b["talk"]; w = f"{SY}/{k}.wav"
        s, e = speech_span(w); a0, a1 = max(0, s - 0.25), min(dur(w), e + 0.3)
        aud = pcm(w, a0, a1)
        vid = [(f"{SY}/{k}.mp4", a0, b.get("cover_at"), "")]
        for p in b.get("cover", []):
            vid.append((f"{SY}/{k}.mp4", None, p[2], "") if p[0] == "@talk" else (src(p[0]), p[1], p[2], p[3] if len(p) > 3 else ""))
    else:
        aud = pcm(line(b["over"]), b.get("from", 0.0), b.get("to"))
        vid = [(src(p[0]), p[1], p[2], p[3] if len(p) > 3 else "") for p in b["pieces"]]
    blocks.append((aud, vid, fx))

# ── timeline ──
voice, pieces, cues, t = [], [], [], 0.0
for aud, vid, fx in blocks:
    L = len(aud) / SR + GAP
    voice.append(np.concatenate([aud, np.zeros(int(GAP * SR), np.float32)]))
    left, used = L, 0.0
    for i, (s_, a, d, g) in enumerate(vid):
        if a is None: a = vid[0][1] + used                    # "@talk": continue the talking clip
        d = left if (d is None or i == len(vid) - 1) else min(d, left)
        if d <= 0.01: continue
        pieces.append((s_, a, d, g)); left -= d; used += d
    cues += [(t + ft, name) for ft, name in fx]
    t += L
total = t + END
voice = np.concatenate(voice)
print(f"episode {total:.1f}s, {len(blocks)} blocks, {len(pieces)} shots")

# ── picture ──
with open(f"{TMP}/v.txt", "w") as lst:
    for i, (s_, a, d, g) in enumerate(pieces + [(f"{INS}/END.mp4", 0, END, "")]):
        p = f"{TMP}/p{i:03d}.mp4"
        vf = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},tpad=stop_mode=clone:stop_duration=10" + (f",{GRADES.get(g, g)}" if g else "") + f",trim=duration={d:.4f},setpts=PTS-STARTPTS"
        if s_.startswith(INS) or not os.path.exists(f"{INS}/watermark.png"):
            run("ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", s_, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", p)
        else:
            run("ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", s_, "-i", f"{INS}/watermark.png", "-an", "-filter_complex", f"[0]{vf}[b];[1]scale=1080:1920,format=rgba[w];[b][w]overlay=0:0", "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", p)
        lst.write(f"file '{p}'\n")
run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{TMP}/v.txt", "-c", "copy", f"{TMP}/pic.mp4")

# ── sound: original dark ambient bed (synthesized here, no rights issues) + effects + voice ──
n = int(total * SR); tt = np.arange(n) / SR
chords = cfg.get("bed_chords", [[55.0, 65.4, 82.4], [49.0, 61.7, 73.4], [43.65, 55.0, 65.4], [49.0, 58.3, 73.4]])   # Am → G → F → Gm, 8 s each
bed = np.zeros(n, np.float32)
for k, ch in enumerate(chords * int(total // (8 * len(chords)) + 1)):
    s0 = int(k * 8 * SR); s1 = min(n, s0 + int(9 * SR))
    if s0 >= n: break
    w = np.sin(np.pi * np.clip(np.arange(s1 - s0) / (9 * SR), 0, 1)) ** 1.5
    for j, f in enumerate(ch):
        for o in (1, 2): bed[s0:s1] += (w * 0.5 / o / (j + 1) * np.sin(2 * np.pi * f * o * tt[s0:s1] + j)).astype(np.float32)
air = sfx.lp_fast(sfx.noise(n), 900) * (0.25 + 0.15 * np.sin(2 * np.pi * 0.05 * tt))
bed = sfx.lp_fast(bed, 1200) + air.astype(np.float32) * 0.6
bed *= np.minimum(1, np.minimum(tt / 2.0, (total - tt) / 2.5)).astype(np.float32)
# even out the voice: TTS lets the last syllables of a sentence drop ~20 dB, which sounds cut off under music
sfx.write_wav(f"{TMP}/vraw.wav", voice)
run("ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/vraw.wav", "-af", "acompressor=threshold=0.03:ratio=5:attack=3:release=150:knee=6:makeup=3,alimiter=limit=0.9", "-ar", str(SR), "-ac", "1", f"{TMP}/vcomp.wav")
voice = pcm(f"{TMP}/vcomp.wav")
v = np.zeros(n, np.float32); v[:len(voice)] = voice[:n]
def db(x): return 20 * np.log10(np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2)) + 1e-9)
vr = db(v)
env_v = sfx.lp_fast(np.abs(v), 4); duck = 1 - 0.55 * np.clip(env_v / (np.max(env_v) * 0.15), 0, 1)
bed *= 10 ** ((vr - cfg.get("bed_below_voice_db", 23) - db(bed)) / 20); bed *= duck.astype(np.float32)
fxmap = {"wind_in": lambda: sfx.fx_wind(3.0), "whoosh": sfx.fx_whoosh, "pop": sfx.fx_pop, "drop": sfx.fx_drop, "clink": lambda: sfx.fx_clink(0.5, 900), "tick": sfx.fx_tick, "thud": sfx.fx_thud, "splash": sfx.fx_splash}
fxt = np.zeros(n, np.float32)
for ct, name in cues:
    x = fxmap[name](); s0 = int(ct * SR); x = x[: max(0, n - s0)]
    fxt[s0:s0 + len(x)] += x * 10 ** ((vr - 16 - db(x)) / 20)
mix = v + bed + fxt; mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
sfx.write_wav(f"{TMP}/mix.wav", mix); sfx.write_wav(OUT[:-4] + "-voice.wav", v)

run("ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/pic.mp4", "-i", f"{TMP}/mix.wav",
    "-vf", f"fade=t=out:st={total - 0.6:.2f}:d=0.6", "-map", "0:v", "-map", "1:a", "-t", f"{total:.3f}",
    "-c:v", "libx264", "-profile:v", "high", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", str(FPS),
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT)
print(OUT, f"{dur(OUT):.1f}s")
