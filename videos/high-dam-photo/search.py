import json, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'EduVideoBot/1.0 (educational animation)'}
def search(q, n=8):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', format='json', generator='search',
        gsrnamespace=6, gsrlimit=n, gsrsearch=q + ' filetype:bitmap', prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=1920))
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA)))
        except Exception as e:
            time.sleep(3 * (i + 1))
    return {}
out = {}
for q in sys.argv[1:]:
    d = search(q)
    out[q] = []
    for p in d.get('query', {}).get('pages', {}).values():
        ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
        g = lambda k: (m.get(k) or {}).get('value', '')
        out[q].append(dict(title=p['title'], w=ii['width'], h=ii['height'], thumb=ii.get('thumburl'), page=ii['descriptionurl'],
                           lic=g('LicenseShortName'), artist=g('Artist')))
        print(ii['width'], ii['height'], g('LicenseShortName'), '|', p['title'])
    print('---', q)
    time.sleep(1.5)
json.dump(out, open('cands-%d.json' % int(time.time()), 'w'), ensure_ascii=False, indent=1)
