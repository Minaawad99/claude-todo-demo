#!/usr/bin/env python3
"""Measured quality gate for a rendered video. Run it before sending anything.

  python3 videos/qa.py out.mp4 [--sheet sheet.jpg]

Checks (taken from PLAYBOOK §7):
  - frozen screen: no still stretch > 0.5s, at most ~1s frozen per 30s
  - frame one is a finished picture (has detail, isn't mid-fade from blank)
  - loudness about -14 LUFS, true peak under -0.5 dBTP
  - writes a contact sheet (one frame every 0.2s near the start, then every 2s)
Exit code 1 if any check fails.
"""
import argparse, json, re, subprocess, sys
import numpy as np


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path]).stdout
    return float(json.loads(out)["format"]["duration"])


def gray_frames(path, fps=30, w=135, h=240):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def frozen_stretches(frames, fps, thresh=0.25, min_len=0.5):
    # mean abs pixel change per frame (0..255); below thresh counts as "nothing moved"
    d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
    still = d < thresh
    out, start = [], None
    for i, s in enumerate(np.append(still, False)):
        if s and start is None:
            start = i
        elif not s and start is not None:
            if (i - start) / fps >= min_len:
                out.append((start / fps, i / fps))
            start = None
    return out


def loudness(path):
    err = run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summ = err[err.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", summ)
    p = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", summ)
    return (float(i.group(1)) if i else None), (float(p.group(1)) if p and p.group(1) != "-inf" else None)


def contact_sheet(path, dur, out):
    # dense 0.2s strip for the first 4s (hook), then every 2s
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-filter_complex",
         "[0:v]split=2[a][b];"
         "[a]trim=0:4,fps=5,scale=180:-1,tile=10x2[s1];"
         f"[b]fps=0.5,scale=180:-1,tile=10x{max(1, int(np.ceil(dur / 2 / 10)))}[s2];"
         "[s1][s2]vstack=inputs=2", "-frames:v", "1", out])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--sheet", help="contact sheet path (default: next to the video)")
    a = ap.parse_args()

    fps = 30
    dur = probe(a.video)
    fr = gray_frames(a.video, fps)
    fails = []

    st = frozen_stretches(fr, fps)
    frozen_total = sum(e - s for s, e in st)
    budget = dur / 30 * 1.0
    longest = max([e - s for s, e in st], default=0)
    print(f"duration        {dur:6.2f}s")
    print(f"frozen total    {frozen_total:6.2f}s  (budget {budget:.2f}s)")
    for s, e in st:
        print(f"  still {s:6.2f}–{e:6.2f}  ({e - s:.2f}s)")
    # the outro tail (last 1.5s, TAIL in render.js) is allowed to hold
    body = [(s, e) for s, e in st if e < dur - 1.6]
    if any(e - s > 0.75 for s, e in body):
        fails.append(f"still stretch longer than 0.75s ({max(e - s for s, e in body):.2f}s)")
    if sum(e - s for s, e in body) > budget:
        fails.append("too much frozen screen")

    f0 = fr[0]
    detail = np.abs(np.diff(f0, axis=1)).mean() + np.abs(np.diff(f0, axis=0)).mean()
    change = np.abs(fr[min(len(fr) - 1, fps // 2)] - f0).mean()
    print(f"frame one       detail {detail:.2f}, change by 0.5s {change:.2f}")
    if detail < 1.5:
        fails.append("frame one is nearly empty")
    if change > 25:
        fails.append("frame one is mid-transition (big change in first 0.5s)")

    lufs, peak = loudness(a.video)
    print(f"loudness        {lufs} LUFS, peak {peak} dBFS")
    if lufs is None or abs(lufs + 14) > 1.5:
        fails.append("integrated loudness not about -14 LUFS")
    if peak is not None and peak > -0.5:
        fails.append("peak above -0.5 dBFS")

    sheet = a.sheet or re.sub(r"\.\w+$", "", a.video) + "-sheet.jpg"
    contact_sheet(a.video, dur, sheet)
    print(f"contact sheet   {sheet}")

    print("\n" + ("PASS" if not fails else "FAIL:\n  - " + "\n  - ".join(fails)))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
