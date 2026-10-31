import json, sys, time, urllib.request, urllib.parse
UA = "AwadFactsResearch/1.0 (educational short-video research)"
def get(url):
    for i in range(8):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=30).read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(max(int(e.headers.get("retry-after", "30") or 30), 30) + 10*i); continue
            raise
    raise RuntimeError("rate limited")
key, query = sys.argv[1], sys.argv[2]
q = urllib.parse.urlencode({"action":"query","format":"json","generator":"search","gsrnamespace":6,
    "gsrsearch":query+" filetype:bitmap","gsrlimit":8,"prop":"imageinfo","iiprop":"url|size|extmetadata","iiurlwidth":1080})
d = json.loads(get("https://commons.wikimedia.org/w/api.php?"+q))
pages = sorted(d.get("query",{}).get("pages",{}).values(), key=lambda p:p.get("index",99))
out=[]
for p in pages:
    ii=p["imageinfo"][0]
    if ii["width"]<500: continue
    m=ii.get("extmetadata",{})
    out.append({"title":p["title"],"thumb":ii.get("thumburl",ii["url"]),"w":ii["width"],"h":ii["height"],
      "license":m.get("LicenseShortName",{}).get("value"),"artist":m.get("Artist",{}).get("value","")[:120]})
json.dump(out, open(sys.argv[3],"w"), ensure_ascii=False, indent=1)
for o in out: print(key, o["title"], o["w"],"x",o["h"], o["license"])
