"""Cut every figure out of a Gemini character sheet (cream background) into a transparent PNG.
usage: python3 cutout.py sheet.jpg outdir prefix
Background = flood fill from the border over pixels close to the sheet's cream; long thin guide / ground lines removed;
enclosed cream gaps (between an arm and the body) made transparent too; white clothes are kept (they differ from cream)."""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage as nd
src, out, pre = sys.argv[1], sys.argv[2], sys.argv[3]
im = np.asarray(Image.open(src).convert("RGB")).astype(float); H, W, _ = im.shape
bg = np.median(np.concatenate([im[:8].reshape(-1, 3), im[-8:].reshape(-1, 3), im[:, :8].reshape(-1, 3), im[:, -8:].reshape(-1, 3)]), 0)
d = np.sqrt(((im - bg) ** 2).sum(2))
near = d < 34
# thin horizontal lines (guides, ground lines): rows where a dark-ish run spans most of the width; erase pixels whose vertical run is short
lines = np.zeros_like(near)
for y in range(H):
    row = ~near[y]
    if row.mean() > .45:
        lines[y] = row
v = (~near).astype(int); run = np.zeros_like(v)
for y in range(H): run[y] = (run[y - 1] + 1) * v[y] if y else v[y]
# vertical extent of each non-bg pixel's column segment
up = run.copy(); dn = np.zeros_like(v)
for y in range(H - 1, -1, -1): dn[y] = (dn[y + 1] + 1) * v[y] if y < H - 1 else v[y]
ext = up + dn - 1
near = near | (lines & (ext <= int(os.environ.get("LINEW", "9"))))
lab, n = nd.label(near)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgmask = np.isin(lab, list(border))
# enclosed cream holes: tight colour match and big enough
tight = d < 16; hl, hn = nd.label(tight & ~bgmask)
sizes = nd.sum(np.ones_like(hl), hl, range(1, hn + 1))
for k, s in enumerate(sizes, 1):
    if s > 400: bgmask |= hl == k
fg = ~bgmask
fg = nd.binary_opening(fg, iterations=1)
cl, cn = nd.label(nd.binary_dilation(fg, iterations=6))
objs = nd.find_objects(cl); k = 0
alpha = nd.gaussian_filter(fg.astype(float), .6)
os.makedirs(out, exist_ok=True); boxes = []
for j, sl in enumerate(objs, 1):
    if sl is None: continue
    h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
    if h * w < (H * W) * .004 or h < H * .05: continue
    m = (cl[sl] == j) & fg[sl]
    a = (alpha[sl] * m * 255).clip(0, 255).astype(np.uint8)
    rgba = np.dstack([im[sl].astype(np.uint8), a])
    boxes.append((sl[0].start, sl[1].start, rgba))
boxes.sort(key=lambda b: (round(b[0] / (H * .12)), b[1]))
for k, (y, x, rgba) in enumerate(boxes):
    Image.fromarray(rgba, "RGBA").save(os.path.join(out, "%s-%02d.png" % (pre, k)))
print(src, len(boxes))
