"""Put our voice on every talking Veo clip listed in episode.json "sync".
  python3 sync.py <episode dir>
Reads clips/<ID>.mp4, writes synced/<ID>.mp4 and synced/<ID>.wav (lossless voice; build.py uses the wav).
Each "sync" entry: [clip ID, line NN, extra lipfit options...], e.g. ["H03","03","--skip","1"] or ["K07","07","--part","0:3.62"].
Guest lines get "--max" from voices.guest.max_stretch (deeper voices stay clear when sped up more)."""
import sys, os, json, subprocess
EP = os.path.abspath(sys.argv[1]); H = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(f"{EP}/episode.json"))
os.makedirs(f"{EP}/synced", exist_ok=True)
spk = {l.split("\t")[0]: l.split("\t")[1] for l in open(f"{EP}/lines.tsv", encoding="utf-8") if l.strip()}
for k, n, *opt in cfg["sync"]:
    clip = f"{EP}/clips/{k}.mp4"
    if not os.path.exists(clip): print(k, "missing clip, skipped"); continue
    s = spk[n]; mx = ["--max", str(cfg["voices"][s].get("max_stretch", 1.2))]
    r = subprocess.run(["python3", f"{H}/lipfit.py", clip, f"{EP}/final/{n}-{s}.wav", f"{EP}/synced/{k}.mp4", *opt, *mx], capture_output=True, text=True)
    print(k, "ok" if r.returncode == 0 else "FAILED\n" + r.stderr[-400:]); print("   " + r.stdout.strip().replace("\n", "\n   "))
