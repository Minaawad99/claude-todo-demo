"""Search Wikimedia Commons for reference photos, one query at a time with long pauses (Commons answers 429 when hurried).
python3 commons_search.py <out.json> "query one" "query two" ...   → prints "query | File:..." and saves {query: [[title, thumb url]]}"""
import json, sys, time, urllib.request, urllib.parse
UA = "EhElhekayaRefBot/1.0 (https://github.com/minaawad99/claude-todo-demo) python-urllib"
out = sys.argv[1]; res = {}
for q in sys.argv[2:]:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrlimit": 8, "gsrsearch": q, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 960})
    d = {}
    for attempt in range(4):
        try: d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30)); break
        except urllib.error.HTTPError as e: print(q, "HTTP", e.code, "waiting", flush=True); time.sleep(30 * (attempt + 1))
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    res[q] = [(p["title"], p["imageinfo"][0].get("thumburl", "")) for p in pages]
    for t, u in res[q]: print(q, "|", t[:90], flush=True)
    time.sleep(10)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
