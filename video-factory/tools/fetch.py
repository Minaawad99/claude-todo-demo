import json,sys,time,urllib.request,os
P=sys.argv[1]; picks=json.loads(sys.argv[2]); UA="AwadFactsResearch/1.0 (https://claude.ai/code; educational)"
cr=json.load(open(P+"/img/credits.json")) if os.path.exists(P+"/img/credits.json") else {}
for k,(cand,s) in picks.items():
    if os.path.exists(f"{P}/img/{k}.jpg"): continue
    c=[o for o in json.load(open(f"{P}/cands/{cand}.json")) if s in o["title"]][0]
    t=c["thumb"].replace("thumb.wikimedia.org","upload.wikimedia.org").split("?")[0]
    urls=[t.replace("/1280px-","/960px-"), t] if "/thumb/" in t else [t]
    ok=False
    for attempt in range(3):
        for u in urls:
            try:
                d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":UA}),timeout=90).read()
                if d[:3]==b"\xff\xd8\xff" or d[:4]==b"\x89PNG":
                    open(f"{P}/img/{k}.jpg","wb").write(d); cr[k]=c; ok=True; print(k,"ok",len(d)); break
            except Exception as e: print(k,u[-40:],e)
            time.sleep(6)
        if ok: break
        time.sleep(40)
    json.dump(cr,open(P+"/img/credits.json","w"),ensure_ascii=False,indent=1)
