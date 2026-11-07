"""Download chosen thumbnails (960 px) from a commons_search.py result, one at a time with pauses.
python3 commons_fetch.py <search.json> <out dir> "File:A.jpg" "File:B.jpg" ...   → <out dir>/00.jpg, 01.jpg, ..."""
import json, sys, time, urllib.request, os
UA = "EhElhekayaRefBot/1.0 (https://github.com/minaawad99/claude-todo-demo) python-urllib"
d = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
idx = {t: u for v in d.values() for t, u in v}
for i, t in enumerate(sys.argv[3:]):
    u = idx.get(t)
    if not u: print("missing", t); continue
    u = u.replace("thumb.wikimedia.org", "upload.wikimedia.org")
    for attempt in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=60).read()
            open(os.path.join(outdir, "%02d.jpg" % i), "wb").write(data); print("ok", i, t, len(data), flush=True); break
        except urllib.error.HTTPError as e: print("HTTP", e.code, t, flush=True); time.sleep(30 * (attempt + 1))
    time.sleep(8)
