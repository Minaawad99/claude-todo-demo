# fetch_top.py <projectDir> <key> <n>: download the first n candidates of cands/<key>.json as img/<key>_<i>.jpg
import json,sys,time,urllib.request,os
P,k,n=sys.argv[1],sys.argv[2],int(sys.argv[3]); UA="AwadFactsResearch/1.0 (https://claude.ai/code; educational)"
cr=json.load(open(P+"/img/credits.json")) if os.path.exists(P+"/img/credits.json") else {}
cands=[c for c in json.load(open(f"{P}/cands/{k}.json")) if c["w"]>=600]
got=0
for c in cands:
    if got>=n: break
    t=c["thumb"].replace("thumb.wikimedia.org","upload.wikimedia.org").split("?")[0]
    urls=[t.replace("/1280px-","/960px-"),t] if "/thumb/" in t else [t]
    for attempt in range(4):
        ok=False
        for u in urls:
            try:
                d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":UA}),timeout=90).read()
                if d[:3]==b"\xff\xd8\xff" or d[:4]==b"\x89PNG":
                    got+=1; open(f"{P}/img/{k}_{got}.jpg","wb").write(d); cr[f"{k}_{got}"]=c; ok=True; print(k,got,c["title"]); break
            except Exception as e: pass
            time.sleep(8)
        if ok: break
        time.sleep(45)
json.dump(cr,open(P+"/img/credits.json","w"),ensure_ascii=False,indent=1)
