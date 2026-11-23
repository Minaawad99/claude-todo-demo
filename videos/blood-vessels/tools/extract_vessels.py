"""Pulls the real vessel map out of Wikimedia Commons «Circulatory System en.svg» (LadyofHats / Mariana Ruiz, public
domain) and writes sketch/vessels.js: each layer as an SVG string in the source's 550×830 box, colours swapped for
class names (art / vein / sil / heart) so shots.js can restyle them in the sketch palette.
usage: python3 extract_vessels.py <Circulatory_System_en.svg> <out vessels.js>"""
import sys, re, json, xml.etree.ElementTree as ET
SVG = '{http://www.w3.org/2000/svg}'; IL = '{http://www.inkscape.org/namespaces/inkscape}label'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
root = ET.parse(sys.argv[1]).getroot()
KEEP = {'Silhouette': 'sil', 'Saphenous minor, venous sinuses': 'veins', 'Arteries': 'arts', 'Bridge arteries': 'arts',
        'Veins': 'veins', 'Bridge veins': 'veins', 'Heart and hepatic silhouette': 'heart', 'Arteries 2': 'arts',
        'Veins 2': 'veins', 'Arteries 1b': 'arts'}
COL = {'#ff0000': 'art', '#b62717': 'art', '#de8787': 'heart', '#0000ff': 'vein', '#0060b6': 'vein', '#f2f2f2': 'sil',
       '#ffffff': 'w', '#800080': 'vein', '#000000': 'ink', '#999999': 'ink', '#a9b5bf': 'ink',
       '#ffbf00': 'art', '#00a0c6': 'vein', '#00d8c6': 'vein'}
def num(m): return ('%.1f' % float(m.group(0))).rstrip('0').rstrip('.')
def clean(e):
    out = []
    for p in e:
        tag = p.tag.replace(SVG, '')
        if tag == 'g':
            if 'display:none' in p.get('style', ''): continue
            inner = ''.join(cl if tg == 'RAW' else '<%s class="%s" %s%s/>' % (tg, cl, a, (' stroke-width="%.2f"' % w) if w else '') for tg, cl, a, w in clean(p))
            if p.get('transform'): inner = '<g transform="%s">%s</g>' % (p.get('transform'), inner)
            out.append(('RAW', inner, '', 0)); continue
        if tag not in ('path', 'ellipse', 'circle', 'rect'): continue
        st = p.get('style', '') + ';fill:' + (p.get('fill') or '') + ';stroke:' + (p.get('stroke') or '')
        if 'display:none' in st or '#00b900' in st.lower(): continue
        fill = re.search(r'fill:(#[0-9a-fA-F]{6}|none)', st); stroke = re.search(r'stroke:(#[0-9a-fA-F]{6}|none)', st)
        sw = re.search(r'stroke-width:([\d.]+)', st)
        fc = COL.get(fill.group(1).lower(), 'x') if fill and fill.group(1) != 'none' else ''
        sc = COL.get(stroke.group(1).lower(), 'x') if stroke and stroke.group(1) != 'none' else ''
        attrs = {k: v for k, v in p.attrib.items() if k in ('d', 'cx', 'cy', 'rx', 'ry', 'r', 'x', 'y', 'width', 'height', 'transform')}
        if 'd' in attrs: attrs['d'] = re.sub(r'-?\d+\.\d+', num, attrs['d'])
        cls = ('f-' + fc if fc else 'nf') + (' s-' + sc if sc else '')
        a = ' '.join('%s="%s"' % kv for kv in attrs.items())
        out.append((tag, cls, a, float(sw.group(1)) if sw and sc else 0))
    return out
def mat(e):   # transforms of the ancestors are only translate() in this file
    return e.get('transform') or ''
layers = {}
def walk(e, tr):
    for c in e:
        lab = c.get(IL); t2 = tr + ([c.get('transform')] if c.get('transform') else [])
        if lab in KEEP and 'display:none' not in c.get('style', ''):
            s = ''.join(cl if tg == 'RAW' else '<%s class="%s" %s%s/>' % (tg, cl, a, (' stroke-width="%.2f"' % w) if w else '') for tg, cl, a, w in clean(c))
            g = s
            for t in reversed(t2): g = '<g transform="%s">%s</g>' % (t, g)
            layers.setdefault(KEEP[lab], []).append(g)
        elif c.tag == SVG + 'g' and not lab: walk(c, t2)
walk(root, [])
js = '// Real vessel map, traced from Wikimedia Commons «Circulatory System en.svg» (LadyofHats, public domain). 550×830 box.\n'
js += 'var VESSELS = ' + json.dumps({k: ''.join(v) for k, v in layers.items()}, ensure_ascii=False) + ';\n'
open(sys.argv[2], 'w').write(js)
print({k: len(''.join(v)) for k, v in layers.items()})
