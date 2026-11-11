"""Turn a real anatomy SVG (Wikimedia Commons) into sketch-style art for shots.js.
Keeps every shape exactly as drawn; drops text and the named layers; resolves gradients to one flat colour;
mutes every colour into the «اسكتش» palette (hue kept, saturation down, warmed toward the paper), dark strokes → ink.
usage: restyle.py src.svg NAME out.js [--drop id,id] [--keep id,id]  → ART.NAME = {vb, layers: {id: svg}}"""
import sys, re, json, colorsys, argparse
import xml.etree.ElementTree as ET
ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("name"); ap.add_argument("out")
ap.add_argument("--drop", default=""); ap.add_argument("--keep", default=""); ap.add_argument("--sat", type=float, default=.6)
a = ap.parse_args()
NS = {"svg": "http://www.w3.org/2000/svg", "xlink": "http://www.w3.org/1999/xlink"}
ET.register_namespace("", NS["svg"]); ET.register_namespace("xlink", NS["xlink"])
root = ET.parse(a.src).getroot()
def tag(e): return e.tag.split("}")[-1]
INK = (0x2a, 0x20, 0x16); PAPER = (0xee, 0xe5, 0xd0)
NAMED = {"white": "#ffffff", "black": "#000000", "red": "#ff0000", "blue": "#0000ff", "none": None}
def hx(c):
    c = c.strip().lower()
    if c in NAMED: return NAMED[c]
    if re.fullmatch(r"#[0-9a-f]{3}", c): c = "#" + "".join(ch * 2 for ch in c[1:])
    return c if re.fullmatch(r"#[0-9a-f]{6}", c) else None
def rgb(c): return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
def mute(c, stroke=False):
    r, g, b = [x / 255 for x in rgb(c)]; h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < .22 or (stroke and l < .45 and s < .5): return "#2a2016"
    s *= a.sat; l = .3 + .58 * l
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    m = [int(255 * (x * .8) + p * .2) for x, p in zip((r, g, b), PAPER)]
    return "#%02x%02x%02x" % tuple(max(0, min(255, v)) for v in m)
# gradients → one colour (the middle stop), following xlink:href chains
grads = {}
for e in root.iter():
    if tag(e) in ("linearGradient", "radialGradient"):
        grads[e.get("id")] = e
def gcol(i, depth=0):
    e = grads.get(i)
    if e is None or depth > 5: return None
    stops = [s for s in e if tag(s) == "stop"]
    if not stops:
        h = e.get("{%s}href" % NS["xlink"]) or e.get("href")
        return gcol(h[1:], depth + 1) if h else None
    cols = []
    for s in stops:
        st = dict(kv.split(":", 1) for kv in (s.get("style") or "").split(";") if ":" in kv)
        c = hx(st.get("stop-color", s.get("stop-color", "#000")) or "#000"); 
        if c: cols.append(rgb(c))
    if not cols: return None
    m = [sum(c[k] for c in cols) // len(cols) for k in range(3)]
    return "#%02x%02x%02x" % tuple(m)
drop = set(x for x in a.drop.split(",") if x); keep = set(x for x in a.keep.split(",") if x)
def paint(v, stroke):
    if v is None: return None
    v = v.strip()
    m = re.match(r"url\(#([^)]+)\)", v)
    if m: c = gcol(m.group(1)); return mute(c, stroke) if c else "none"
    c = hx(v); return mute(c, stroke) if c else v
SKIP = {"text", "flowRoot", "title", "desc", "metadata", "defs", "linearGradient", "radialGradient", "pattern", "filter", "mask", "clipPath", "namedview", "script", "style"}
def ser(e):
    t = tag(e)
    if t in SKIP or t == "sodipodi:namedview" or "sodipodi" in e.tag or "inkscape" in e.tag: return ""
    if e.get("id") in drop: return ""
    st = dict(kv.split(":", 1) for kv in (e.get("style") or "").split(";") if ":" in kv)
    if st.get("display") == "none" or e.get("display") == "none": return ""
    attrs = {}
    for k in ("d", "transform", "x", "y", "width", "height", "cx", "cy", "r", "rx", "ry", "points", "x1", "y1", "x2", "y2"):
        if e.get(k) is not None: attrs[k] = e.get(k)
    fill = st.get("fill", e.get("fill")); stroke = st.get("stroke", e.get("stroke"))
    for k in ("stroke-width", "opacity", "fill-opacity", "stroke-opacity", "fill-rule", "stroke-linejoin", "stroke-linecap", "stroke-dasharray"):
        v = st.get(k, e.get(k))
        if v is not None and v != "none" or (k == "stroke-dasharray" and v): attrs[k] = v
    if t not in ("g", "svg"):
        f = paint(fill, False) if fill is not None else "#000000"
        if f == "#000000": f = "#2a2016"
        attrs["fill"] = f or "none"
        if stroke and stroke != "none": attrs["stroke"] = paint(stroke, True) or "none"
    else:
        if fill is not None: attrs["fill"] = paint(fill, False) or "none"
        if stroke is not None: attrs["stroke"] = paint(stroke, True) or "none"
    if t == "use": return ""
    inner = "".join(ser(c) for c in e)
    if t in ("g", "svg"):
        if not inner: return ""
        return "<g" + "".join(' %s="%s"' % kv for kv in attrs.items()) + ">" + inner + "</g>"
    return "<" + t + "".join(' %s="%s"' % kv for kv in attrs.items()) + "/>"
layers = {}
for c in root:
    i = c.get("id") or "x%d" % len(layers)
    if keep and i not in keep: continue
    s = ser(c)
    if s: layers[i] = s
vb = [float(v) for v in (root.get("viewBox") or "0 0 %s %s" % (root.get("width"), root.get("height"))).replace(",", " ").split()]
open(a.out, "w").write("window.ART = window.ART || {};\nART[%s] = %s;\n" % (json.dumps(a.name), json.dumps({"vb": vb, "layers": layers}, ensure_ascii=False)))
print(a.name, vb, {k: len(v) for k, v in layers.items()})
