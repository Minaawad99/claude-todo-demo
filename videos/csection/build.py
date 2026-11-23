"""الولادة القيصرية — render the picture track (1080x1920, 30 fps, no audio) from the Gemini images/clips.
python3 build.py [--from S --to E]   → out/picture.mp4   (also writes out/chunks.json for the captions)
Shots follow timing.json (script lines aligned to voice.wav). Captions: one short phrase at a time, top of frame."""
import json, re, subprocess, sys, os, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

H = os.path.dirname(os.path.abspath(__file__))
W, HH, FPS = 1080, 1920, 30
BG = (20, 25, 28)
ap = argparse.ArgumentParser(); ap.add_argument("--from", dest="t0", type=float, default=0); ap.add_argument("--to", dest="t1", type=float)
ap.add_argument("--out", default=os.path.join(H, "out", "picture.mp4")); a = ap.parse_args()
os.makedirs(os.path.join(H, "out"), exist_ok=True)
T = json.load(open(os.path.join(H, "timing.json"), encoding="utf-8"))
L = T["lines"]; VEND = L[-1]["end"]; TOTAL = VEND + 1.6
F_B = os.path.join(H, "fonts", "Cairo-800.ttf"); F_M = os.path.join(H, "fonts", "Cairo-600.ttf")
def font(p, s): return ImageFont.truetype(p, s)

# ── caption chunks: short phrases, timed by character share inside each aligned line ──
def chunks_of(text):
    parts = [p.strip() for p in re.findall(r"[^،.:؟!…]+[،.:؟!…]*", text) if p.strip()]
    m = []
    for i, p in enumerate(parts):   # a one-word piece joins the next piece (or the last one)
        if m and m[-1].endswith("+"): m[-1] = m[-1][:-1] + " " + p
        else: m.append(p)
        if len(p.split()) <= 1:
            if len(m) > 1 and m[-2].rstrip().endswith(":"): m[-2:] = [m[-2] + " " + m[-1]]   # «أول حاجة: البنج»
            else: m[-1] += "+"
    if m[-1].endswith("+"):
        last = m.pop()[:-1]; m[-1:] = [m[-1] + " " + last] if m else [last]
    out = []
    for p in m:
        w = p.split()
        while len(w) > 10:
            stop = {"على", "في", "عن", "من", "لحد", "مش", "اللي", "و", "إن", "ما"}
            k = min((j for j in range(3, len(w) - 2) if w[j - 1] not in stop), key=lambda j: abs(j - len(w) / 2))
            out.append(" ".join(w[:k])); w = w[k:]
        out.append(" ".join(w))
    return out
CH = []
for ln in L:
    cs = chunks_of(ln["text"]); n = [len(re.sub(r"\W", "", c)) or 1 for c in cs]; tot = sum(n)
    t = ln["start"]; d = ln["end"] - ln["start"]
    for c, k in zip(cs, n):
        CH.append({"line": ln["i"], "text": re.sub(r"[،.:…]+$", "", c).replace("،", "").replace(". ", " ").strip(), "start": round(t, 2), "end": round(t + d * k / tot, 2)}); t += d * k / tot
for i in range(len(CH) - 1): CH[i]["show_end"] = min(CH[i + 1]["start"], CH[i]["end"] + 0.6)
CH[-1]["show_end"] = VEND + 1.2
json.dump(CH, open(os.path.join(H, "out", "chunks.json"), "w"), ensure_ascii=False, indent=1)
def ls(i): return L[i]["start"]
def chunk_start(line, k): return [c for c in CH if c["line"] == line][k]["start"]

def wrap(text, f, maxw):
    if f.getlength(text) <= maxw: return [text]
    w = text.split(); best = min(range(1, len(w)), key=lambda k: abs(f.getlength(" ".join(w[:k])) - f.getlength(" ".join(w[k:]))))
    return [" ".join(w[:best]), " ".join(w[best:])]

_capc = {}
def caption_img(text):
    if text in _capc: return _capc[text]
    f = font(F_B, 68); rows = wrap(text, f, 940); lh = 104
    im = Image.new("RGBA", (W, lh * len(rows) + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for r, s in enumerate(rows):
        d.text((W // 2, 30 + lh * r + lh // 2), s, font=f, fill=(0, 0, 0, 200), anchor="mm", direction="rtl")
    im = im.filter(ImageFilter.GaussianBlur(9)); d = ImageDraw.Draw(im)
    for r, s in enumerate(rows):
        d.text((W // 2, 30 + lh * r + lh // 2), s, font=f, fill=(255, 255, 255, 255), anchor="mm", direction="rtl")
    _capc[text] = im; return im

# top shade so captions read over busy frames
SHADE = Image.new("RGBA", (W, 640)); _g = np.zeros((640, W, 4), np.uint8); _g[..., :3] = BG
_g[..., 3] = (np.clip(1 - np.linspace(0, 1, 640), 0, 1) ** 1.3 * 190).astype(np.uint8)[:, None]; SHADE = Image.fromarray(_g, "RGBA")

# ── sources ──
IMG = {}
def img(name):
    if name not in IMG: IMG[name] = Image.open(os.path.join(H, "img", name + ".jpg")).convert("RGB")
    return IMG[name]
def ease(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)

def kb(name, z0, z1, c0, c1):
    """Ken Burns: zoom z0→z1, centre c0→c1 (fractions of the source)."""
    src = img(name); sw, sh = src.size
    def f(p):
        e = ease(p); z = z0 + (z1 - z0) * e; cx = c0[0] + (c1[0] - c0[0]) * e; cy = c0[1] + (c1[1] - c0[1]) * e
        cw = min(sw, sh * W / HH) / z; chh = cw * HH / W
        x0 = min(max(cx * sw - cw / 2, 0), sw - cw); y0 = min(max(cy * sh - chh / 2, 0), sh - chh)
        return src.resize((W, HH), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + chh))
    return f

def panel(name, box, z0=1.0, z1=1.08):
    """A cropped part of the image as a rounded panel on the dark background (drops a stray inset)."""
    src = img(name).crop(box); pw = 1000; ph = int(pw * src.size[1] / src.size[0])
    mask = Image.new("L", (pw, ph), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw, ph), 36, fill=255)
    def f(p):
        e = ease(p); z = z0 + (z1 - z0) * e; cw, chh = src.size[0] / z, src.size[1] / z
        x0 = (src.size[0] - cw) / 2; y0 = (src.size[1] - chh) / 2
        tile = src.resize((pw, ph), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + chh))
        fr = Image.new("RGB", (W, HH), BG); fr.paste(tile, ((W - pw) // 2, 1010 - ph // 2), mask); return fr
    return f

class Clip:
    """Frames of a Veo clip slice [s, s+n], stretched/compressed to the shot length, optionally reversed."""
    def __init__(self, name, s, n, rev=False): self.name, self.s, self.n, self.rev = name, s, n, rev; self.fr = None
    def load(self, dur):
        k = int(round(dur * FPS)) + 12; spd = self.n / (k / FPS)
        vf = f"trim=start={self.s}:duration={self.n},setpts=(PTS-STARTPTS)/{spd:.5f},fps={FPS},scale={W}:{HH}:flags=bicubic" + (",reverse" if self.rev else "")
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(H, "clips", self.name + ".mp4"), "-vf", vf, "-an",
                              "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
        self.fr = np.frombuffer(raw, np.uint8).reshape(-1, HH, W, 3)
    def __call__(self, p, dur):
        if self.fr is None: self.load(dur)
        i = min(int(p * dur * FPS), len(self.fr) - 1); return Image.fromarray(self.fr[i])

# ── drawn shots ──
def timeline(t, t_line24, t_line25, t_num):
    fr = Image.new("RGB", (W, HH), BG); d = ImageDraw.Draw(fr, "RGBA")
    fT = font(F_M, 46); fN = font(F_B, 150); fS = font(F_M, 40)
    d.text((W // 2, 640), "العملية كلها", font=fT, fill=(170, 185, 190), anchor="mm", direction="rtl")
    a = ease((t - t_num) / 0.6)
    if a > 0:
        d.text((W // 2, 770), "40 – 60", font=fN, fill=(255, 255, 255, int(255 * a)), anchor="mm", direction="ltr")
        d.text((W // 2, 900), "دقيقة", font=font(F_B, 64), fill=(255, 255, 255, int(255 * a)), anchor="mm", direction="rtl")
    x1, x0, y = 960, 120, 1080   # right = minute 0 (reads right to left), left = minute 60
    d.rounded_rectangle((x0, y - 22, x1, y + 22), 22, fill=(40, 50, 54))
    baby = ease((t - t_line24) / 1.6) * 0.1
    close = ease((t - t_line25) / 5.0) * 0.9
    xb = x1 - (x1 - x0) * baby
    if baby > 0: d.rounded_rectangle((xb, y - 22, x1, y + 22), 22, fill=(240, 160, 80))
    if close > 0: d.rounded_rectangle((xb - (x1 - x0) * close, y - 22, xb + 10, y + 22), 22, fill=(90, 200, 140))
    d.text((x1, y + 60), "0", font=fS, fill=(150, 160, 165), anchor="mm"); d.text((x0 + 10, y + 60), "60 د", font=fS, fill=(150, 160, 165), anchor="mm", direction="rtl")
    if baby > 0.02:
        ab = ease((t - t_line24 - 0.4) / 0.5)
        d.line((xb + 30, y - 30, xb + 30, y - 120), fill=(240, 160, 80, int(255 * ab)), width=4)
        d.text((xb + 30, y - 160), "البيبي برّه", font=fS, fill=(240, 160, 80, int(255 * ab)), anchor="mm", direction="rtl")
    if close > 0.05:
        ac = ease((t - t_line25 - 0.8) / 0.6)
        d.text(((x0 + xb) / 2, y + 150), "التقفيل… طبقة طبقة", font=fS, fill=(90, 200, 140, int(255 * ac)), anchor="mm", direction="rtl")
    # stopwatch minutes
    m = int(60 * (baby + close)); cx, cy, r = W // 2, 1420, 120
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(70, 85, 90), width=10)
    d.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * (baby + close), fill=(255, 255, 255), width=10)
    d.text((cx, cy - 8), str(m), font=font(F_B, 90), fill=(255, 255, 255), anchor="mm"); d.text((cx, cy + 62), "دقيقة", font=fS, fill=(150, 160, 165), anchor="mm", direction="rtl")
    return fr

def summary(t, marks):
    fr = Image.new("RGB", (W, HH), BG); d = ImageDraw.Draw(fr, "RGBA"); fL = font(F_B, 50)
    tiles = [("S05", (0.62, 0.42), "بنج"), ("S08", (0.5, 0.45), "طبقات أنسجة"), ("S22", (0.5, 0.42), "خياطة دقيقة"), ("S04", (0.5, 0.45), "فريق طبي كامل")]
    sz = 470; pos = [(560, 560), (50, 560), (560, 1160), (50, 1160)]   # RTL order: first tile top-right
    for (nm, c, lab), (x, y), tm in zip(tiles, pos, marks):
        src = img(nm); s = min(src.size) * 0.62; cx, cy = c[0] * src.size[0], c[1] * src.size[1]
        tile = src.resize((sz, sz), Image.BICUBIC, box=(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2))
        on = ease((t - tm) / 0.5); dim = 0.28 + 0.72 * on
        tile = Image.fromarray((np.asarray(tile) * dim).astype(np.uint8))
        m = Image.new("L", (sz, sz), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, sz, sz), 28, fill=255); fr.paste(tile, (x, y), m)
        d.rounded_rectangle((x, y, x + sz, y + sz), 28, outline=(255, 255, 255, int(200 * on)), width=5)
        d.text((x + sz // 2, y + sz + 8 + 0), lab, font=fL, fill=(255, 255, 255, int(80 + 175 * on)), anchor="ma", direction="rtl")
    return fr

# ── the shot list (start time, maker) — each runs until the next starts ──
B = lambda i: max(0, ls(i) - 0.15)
S = [
 (0.0, lambda: Clip("V8-S01", 2.5, 4.5)),
 (B(1), lambda: Clip("V1-S02", 0.0, 7.4)),
 (chunk_start(2, 0) - 0.15, lambda: kb("S03", 1.0, 1.12, (0.5, 0.5), (0.5, 0.55))),
 (chunk_start(2, 1) - 0.1, lambda: Clip("V2-S04", 0.0, 3.0)),
 (B(3), lambda: kb("S05", 1.15, 1.55, (0.55, 0.48), (0.62, 0.46))),
 (B(4), lambda: kb("S06", 1.12, 1.25, (0.5, 0.6), (0.5, 0.57))),
 (B(6), lambda: kb("S07", 1.0, 1.25, (0.6, 0.58), (0.45, 0.6))),
 (B(7), lambda: kb("S08", 1.0, 1.08, (0.5, 0.5), (0.5, 0.48))),
 (B(8), lambda: kb("S09", 1.0, 1.15, (0.5, 0.5), (0.5, 0.45))),
 (B(9), lambda: kb("S10", 1.0, 1.18, (0.5, 0.5), (0.5, 0.47))),
 (B(10), lambda: kb("S11", 1.05, 1.3, (0.5, 0.55), (0.62, 0.5))),
 (B(11), lambda: kb("S03", 1.15, 1.3, (0.55, 0.55), (0.55, 0.6))),
 (B(12), lambda: kb("S13", 1.0, 1.2, (0.5, 0.5), (0.5, 0.5))),
 (B(13), lambda: Clip("V3-S14", 0.0, 6.5)),
 (B(14), lambda: Clip("V4-S15", 0.0, 5.0)),
 (B(15), lambda: kb("S16", 1.05, 1.2, (0.5, 0.52), (0.4, 0.5))),
 (B(16), lambda: Clip("V4-S15", 5.0, 3.0)),
 (B(17), lambda: Clip("V5-S18", 0.0, 4.2)),
 (B(18) + 2.4, lambda: kb("S19", 1.0, 1.15, (0.5, 0.55), (0.45, 0.6))),
 (B(19), lambda: Clip("V6-S20", 1.0, 6.5)),
 (B(20), lambda: kb("S21", 1.0, 1.35, (0.5, 0.55), (0.42, 0.48))),
 (B(21), lambda: Clip("V7-S22", 0.0, 6.0)),
 (B(22), lambda: Clip("V8-S01", 0.0, 9.0, rev=True)),
 (B(23), lambda: kb("S24", 1.0, 1.15, (0.5, 0.5), (0.5, 0.48))),
 (B(24), "timeline"),
 (B(26), lambda: panel("S27", (40, 430, 740, 995))),
 (B(27), "summary"),
 (B(28), lambda: panel("S29", (40, 430, 740, 995), 1.0, 1.1)),
]
ENDS = [s[0] for s in S[1:]] + [TOTAL]
XF = 8   # crossfade frames
L27 = [c["start"] for c in CH if c["line"] == 27]

def shot_frame(k, maker, t):
    t0, t1 = S[k][0], ENDS[k]; dur = t1 - t0 + XF / FPS; p = (t - t0) / dur
    if maker == "timeline": return timeline(t, ls(24), ls(25), chunk_start(25, 1) + 1.0)
    if maker == "summary":
        txt = L[27]["text"]; marks = []
        for w in ["بنج", "وطبقات", "وتقنيات", "وفريق"]:
            q = txt.find(w) / len(txt); marks.append(L[27]["start"] + q * (L[27]["end"] - L[27]["start"]) - 0.1)
        return summary(t, marks)
    if isinstance(maker, Clip): return maker(p, dur)
    return maker(p)

def main():
    t1 = a.t1 if a.t1 is not None else TOTAL
    n0, n1 = int(a.t0 * FPS), int(t1 * FPS)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{HH}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    made = {}
    for n in range(n0, n1):
        t = n / FPS
        k = max(i for i in range(len(S)) if S[i][0] <= t + 1e-6)
        for j in list(made):
            if j < k - 1: del made[j]
        def get(j):
            if j not in made: m = S[j][1]; made[j] = m() if callable(m) else m
            return shot_frame(j, made[j], t)
        fr = get(k)
        if k > 0 and t < S[k][0] + XF / FPS:   # still blending out of the previous shot
            w = (t - S[k][0]) / (XF / FPS); fr = Image.blend(get(k - 1), fr, ease(w))
        # fade from black at the start, to black at the end
        fade = min(1, t / 0.25, max(0, (TOTAL - t) / 0.8))
        if fade < 1: fr = Image.fromarray((np.asarray(fr) * fade).astype(np.uint8))
        fr = fr.convert("RGBA"); fr.alpha_composite(SHADE)
        for c in CH:
            if c["start"] - 0.05 <= t < c["show_end"]:
                ci = caption_img(c["text"]); al = ease((t - c["start"] + 0.05) / 0.18) * ease((c["show_end"] - t) / 0.15)
                if al < 1: ci = ci.copy(); ci.putalpha(Image.fromarray((np.asarray(ci)[..., 3] * al).astype(np.uint8)))
                fr.alpha_composite(ci, (0, 250 - ci.size[1] // 2 + 52))
        enc.stdin.write(fr.convert("RGB").tobytes())
        if n % 300 == 0: print(f"{t:6.1f}s / {t1:.1f}", flush=True)
    enc.stdin.close(); enc.wait(); print("wrote", a.out)

if __name__ == "__main__": main()
