import json, glob, sys, time, urllib.request, os
UA = {'User-Agent': 'EduAnimationScript/1.0 (https://claude.ai; educational use)'}
allc = {}
for f in glob.glob('cands-*.json'):
    for lst in json.load(open(f)).values():
        for c in lst: allc[c['title']] = c
os.makedirs('img', exist_ok=True)
meta = json.load(open('meta.json')) if os.path.exists('meta.json') else {}
for kt in sys.argv[1:]:
    key, title = kt.split('=', 1)
    if os.path.exists(f'img/{key}.jpg') and os.path.getsize(f'img/{key}.jpg') > 10000: continue
    c = allc[title]
    url = c['thumb'].split('?')[0].replace('thumb.wikimedia.org', 'upload.wikimedia.org').replace('/1920px-', '/1280px-')
    if c['w'] <= 1280: url = url.replace('/commons/thumb/', '/commons/').rsplit('/', 1)[0]
    data = None
    for i in range(5):
        try:
            import subprocess
            data = subprocess.run(['curl', '-sS', '-f', '--max-time', '60', '-A', UA['User-Agent'], url], capture_output=True, check=True).stdout; break
        except Exception as e:
            print('retry', key, getattr(e, 'stderr', e), flush=True); time.sleep(120 * (i + 1))
    if not data: print('FAILED', key); continue
    open(f'img/{key}.jpg', 'wb').write(data)
    meta[key] = c
    json.dump(meta, open('meta.json', 'w'), ensure_ascii=False, indent=1)
    print(key, len(data), flush=True)
    time.sleep(90)
