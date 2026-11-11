"""Prepare the channel's illustrations for the panel: remove stray text (07), key out the cream paper background to
alpha (so the drawings sit on the template's own graph paper), trim, and save as webp. python3 prep.py"""
import cv2, numpy as np, os
H = os.path.dirname(os.path.abspath(__file__))
for n in range(1, 15):
    im = cv2.imread(f"{H}/src/{n:02d}.jpg")
    if n == 7:   # the English words on the two red cells
        g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); m = np.zeros(g.shape, np.uint8)
        for x0, y0, x1, y1 in [(110, 665, 210, 725), (475, 665, 575, 725)]:
            box = g[y0:y1, x0:x1]; m[y0:y1, x0:x1] = (box < np.median(box) - 35).astype(np.uint8) * 255
        m = cv2.dilate(m, np.ones((5, 5), np.uint8), 2); im = cv2.inpaint(im, m, 9, cv2.INPAINT_TELEA)
    lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    h, w = lab.shape[:2]
    # background = the paper colours along the border (some images have two tones)
    border = np.concatenate([lab[:12].reshape(-1, 3), lab[-12:].reshape(-1, 3), lab[:, :12].reshape(-1, 3), lab[:, -12:].reshape(-1, 3)])
    refs = np.unique((border / 4).round() * 4, axis=0)
    if len(refs) > 40: refs = refs[np.random.default_rng(0).choice(len(refs), 40, replace=False)]
    dist = np.full((h, w), 1e9, np.float32)
    for r in refs: dist = np.minimum(dist, np.linalg.norm(lab - r, axis=2))
    a = np.clip((dist - 6) / 10, 0, 1)                      # feathered key
    # only key regions connected to the border (keep paper-coloured areas inside the drawing)
    bgmask = (a < .5).astype(np.uint8); ff = bgmask.copy(); cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 2)
    for p in [(w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
        if ff[p[1], p[0]] == 1: cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), p, 2)
    outside = (ff == 2).astype(np.float32); outside = cv2.GaussianBlur(outside, (0, 0), 1.2)
    alpha = 1 - outside * (1 - a)
    rgba = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA); rgba[..., 3] = (alpha * 255).astype(np.uint8)
    ys, xs = np.where(alpha > .05); y0, y1, x0, x1 = max(0, ys.min() - 6), min(h, ys.max() + 6), max(0, xs.min() - 6), min(w, xs.max() + 6)
    rgba = rgba[y0:y1, x0:x1]
    cv2.imwrite(f"{H}/{n:02d}.webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
    print(n, rgba.shape[1], rgba.shape[0])
