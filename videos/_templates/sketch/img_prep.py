"""«اسكتش» illustrations → panel-ready pictures. The channel makes each drawing in Google AI Studio (Nano Banana Pro) from the
series prompts (.claude/skills/sketch/prompts.md) and sends it; put them as <episode>/sketch/img/src/NN.jpg (or .png), then:

  python3 img_prep.py <episode>/sketch/img [--text N:x0,y0,x1,y1 ...]

For each NN it keys the cream paper background out to alpha (only paper connected to the border, so paper-coloured parts
inside the drawing stay), trims, and writes img/NN.webp, then prints the sizes to paste into shots.js as pics({...}).
--text removes stray words the model wrote: dark pixels inside the box (picture pixels) are inpainted.
Needs: pip install opencv-python-headless numpy"""
import argparse, glob, os, re
import cv2, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("--text", nargs="*", default=[]); a = ap.parse_args()
boxes = {}
for spec in a.text:
    n, b = spec.split(":"); boxes.setdefault(int(n), []).append(tuple(int(v) for v in b.split(",")))
sizes = {}
for src in sorted(glob.glob(os.path.join(a.dir, "src", "*.*"))):
    m = re.match(r"(\d+)\.(jpe?g|png|webp)$", os.path.basename(src), re.I)
    if not m: continue
    n = int(m.group(1)); im = cv2.imread(src)
    if n in boxes:
        g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); mk = np.zeros(g.shape, np.uint8)
        for x0, y0, x1, y1 in boxes[n]:
            bx = g[y0:y1, x0:x1]; mk[y0:y1, x0:x1] = (bx < np.median(bx) - 35).astype(np.uint8) * 255
        mk = cv2.dilate(mk, np.ones((5, 5), np.uint8), 2); im = cv2.inpaint(im, mk, 9, cv2.INPAINT_TELEA)
    lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32); h, w = lab.shape[:2]
    border = np.concatenate([lab[:12].reshape(-1, 3), lab[-12:].reshape(-1, 3), lab[:, :12].reshape(-1, 3), lab[:, -12:].reshape(-1, 3)])
    refs = np.unique((border / 4).round() * 4, axis=0)
    if len(refs) > 40: refs = refs[np.random.default_rng(0).choice(len(refs), 40, replace=False)]
    dist = np.full((h, w), 1e9, np.float32)
    for r in refs: dist = np.minimum(dist, np.linalg.norm(lab - r, axis=2))
    k = np.clip((dist - 6) / 10, 0, 1)
    ff = (k < .5).astype(np.uint8)
    for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
        if ff[p[1], p[0]] == 1: cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), p, 2)
    out = cv2.GaussianBlur((ff == 2).astype(np.float32), (0, 0), 1.2); alpha = 1 - out * (1 - k)
    rgba = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA); rgba[..., 3] = (alpha * 255).astype(np.uint8)
    ys, xs = np.where(alpha > .05); y0, y1, x0, x1 = max(0, ys.min() - 6), min(h, ys.max() + 6), max(0, xs.min() - 6), min(w, xs.max() + 6)
    rgba = rgba[y0:y1, x0:x1]; cv2.imwrite(os.path.join(a.dir, "%02d.webp" % n), rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
    sizes[n] = [rgba.shape[1], rgba.shape[0]]
print("pics({ " + ", ".join("%d: [%d, %d]" % (n, s[0], s[1]) for n, s in sorted(sizes.items())) + " });")
