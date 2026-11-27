window.CHUNKS = [[0.0, 0.2264, 0.5472, 0.7925], [0.0], [0.0, 0.1803, 0.4098, 0.6557], [0.0, 0.4194], [0.0, 0.25, 0.7692], [0.0, 0.2143, 0.3571, 0.6571, 0.7857], [0.0], [0.0, 0.2857, 0.5238, 0.8413], [0.0, 0.3617, 0.6383], [0.0, 0.35, 0.725], [0.0, 0.25, 0.5962, 0.8654], [0.0, 0.35, 0.625], [0.0, 0.1935, 0.5484, 0.8065], [0.0, 0.2727, 0.4909, 0.7455], [0.0, 0.2973], [0.0, 0.5227], [0.0, 0.6], [0.0, 0.2069, 0.3966, 0.7414], [0.0, 0.2632, 0.6316], [0.0, 0.1667, 0.4394, 0.7576], [0.0, 0.3958, 0.8125], [0.0, 0.1733, 0.3867, 0.6267, 0.8133], [0.0, 0.2329, 0.411, 0.6301, 0.7945], [0.0, 0.1765, 0.4235, 0.6118, 0.7529], [0.0, 0.1507, 0.4247, 0.6164, 0.7945], [0.0], [0.0, 0.6304]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the frame never shakes (user's rule after viewers complained): the camera holds still and moves only in eased ~1.8 s flies in or out (fly / still); motion comes from the drawing (pulses, flows, things appearing);
   - a thing appears grey and faint first, then takes its colour (appear); the part being talked about takes the accent
     colour, often swept along its length (sweep), while the rest dims (dim). */
var LN = window.TIMING.lines;
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, k) { return a + (b - a) * k; }
function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.1 * ease(u / 0.22); if (u < 0.36) return lerp(1.1, 1, (u - 0.22) / 0.14); return 1; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function f(n) { return (+n).toFixed(1); }
// k ramps 0→1 over dur seconds starting at u0 (u = seconds into the shot)
function at(u, u0, dur) { return ease((u - u0) / (dur || 0.4)); }

// palette measured from the reference videos
var INK = "#2a2016", PAPER = "#eee5d0", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a",
    SKIN = "#d9a186", SKIN2 = "#b77a5c", BROWN = "#8f4f34", BEIGE = "#d8ccae", GREY = "#c6c6c0", KHAKI = "#c0b49c", TAN = "#ddd2b8", MUTE = "#8f8576";

// ── primitives ──
function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
function C(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
function N(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:800 ' + sz + 'px Noto Serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
function paper() { return '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + PAPER + '"/><rect x="-2000" y="-2000" width="4640" height="4800" fill="url(#grid)"/>'; }
function hatch(d) { return '<path d="' + d + '" fill="url(#hatch)" stroke="none"/>'; }
function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + op.toFixed(3) + '"' : "") + '>' + inner + '</g>'; }

// ── the motion vocabulary ──
// appear: grey and faint first, then full colour (reference: every new thing). k 0..1
function appear(k, inner) { k = clamp(k); if (k <= 0) return ""; return '<g opacity="' + (0.3 + 0.7 * k).toFixed(3) + '" style="filter:saturate(' + k.toFixed(3) + ')">' + inner + '</g>'; }
// dim: the parts not being talked about fade back to a ghost. k 0..1 (1 = dimmed)
function dim(k, inner) { k = clamp(k); return '<g opacity="' + (1 - 0.65 * k).toFixed(3) + '" style="filter:saturate(' + (1 - 0.8 * k).toFixed(3) + ')">' + inner + '</g>'; }
// sweep: show `inner` only inside a box that grows from one side (a colour running along a shaft, a fill rising). dir: "r" "l" "u" "d"
var CLIPN = 0;
function sweep(x, y, w, h, k, dir, inner) {
  k = clamp(k); if (k <= 0) return ""; var id = "sw" + (++CLIPN), cx = x, cy = y, cw = w, ch = h;
  if (dir === "l") { cx = x + w * (1 - k); cw = w * k; } else if (dir === "u") { cy = y + h * (1 - k); ch = h * k; } else if (dir === "d") ch = h * k; else cw = w * k;
  return '<clipPath id="' + id + '"><rect x="' + f(cx) + '" y="' + f(cy) + '" width="' + f(cw) + '" height="' + f(ch) + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>';
}
// draw: a line drawing itself along its path. k 0..1
function draw(d, k, col, w, ex) { k = clamp(k); if (k <= 0) return ""; return '<path d="' + d + '" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + (1 - k).toFixed(4) + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
// leader-line label: dot on the part, the line draws out, then the name fades in. Name coloured like the caption key word.
function label(px, py, lx, ly, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 20;
  var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tx = lx + (left ? -7 : 7), ty = ly + sz * 0.35;
  var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="3.5" fill="' + INK + '"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.3"/>';
  if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, left ? "start" : "end") + '</g>';   // RTL: "start" is the right-hand end
  return s;
}
function callout(n, x, y, k, r) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; r = r || 15; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<circle r="' + r + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(n, 0, r * 0.38, r * 1.05, INK)); }
// ✗ for the wrong idea, ✓ for the right one: both write themselves in
function cross(x, y, s, k) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; s = s || 1; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', draw("M-26 -26 L26 26", k * 2, ORANGE, 9) + draw("M26 -26 L-26 26", k * 2 - 1, ORANGE, 9)); }
function check(x, y, s, k, col) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; s = s || 1; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', draw("M-24 2 L-8 18 L26 -20", k, col || INK, 7)); }
// a number counting up, formatted with thousands commas: count(24000000000, k)
function count(to, k, dec) { var v = to * ease(k); return v.toFixed(dec || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
// a big serif number with its unit under it (reference: «100 / كيلو في الساعة», «0 / موجة زيادة في الثانية»)
function bigNum(text, unit, x, y, k, col, sz) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 56; return appear(k, N(text, x, y, sz, col || INK) + (unit ? T(unit, x, y + sz * 0.5, sz * 0.32, INK, 600) : "")); }
// a number in a framed box (reference: «0 / موجة في الثانية» in a thin box, «100,000 V» dark tag when dark=true)
function numBox(text, x, y, k, sz, dark) {
  k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 26; var w = text.length * sz * 0.6 + 28;
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" fill="' + (dark ? INK : PAPER) + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(text, 0, sz * 0.36, sz, dark ? "#fff" : INK));
}
// a small framed thumbnail in a top corner for the analogy (reference: the iron, the water heater, the bottle)
function iconBox(x, y, s, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-s / 2) + '" y="' + f(-s / 2) + '" width="' + s + '" height="' + s + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + inner); }
// a magnified inset circle showing `inner` (drawn around 0,0)
function inset(cx, cy, r, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var id = "in" + (++CLIPN); return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(k) + ')', '<clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="' + PAPER + '"/><g clip-path="url(#' + id + ')">' + inner + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>'); }
function arrow(x1, y1, x2, y2, col, w, p) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = (w || 3) * 3.2;
  return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.6) + ' ' + f(ye - Math.sin(a) * h * 0.6) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe) + ' ' + f(ye) + ' L' + f(xe - Math.cos(a - 0.45) * h) + ' ' + f(ye - Math.sin(a - 0.45) * h) + ' L' + f(xe - Math.cos(a + 0.45) * h) + ' ' + f(ye - Math.sin(a + 0.45) * h) + ' Z" fill="' + (col || INK) + '" stroke="' + INK + '" stroke-width="1"/>';
}
// a wave travelling from (x1,y1) to (x2,y2); phase moves with t; p = how far it has got
function wave(x1, y1, x2, y2, t, col, a, wl, p, sw) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, d = "";
  for (var s = 0; s <= len * p; s += 4) { var o = Math.sin(s / (wl || 22) * Math.PI * 2 - t * 9) * (a || 7); d += (s ? " L" : "M") + f(x1 + ux * s - uy * o) + " " + f(y1 + uy * s + ux * o); }
  return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 3) + '" fill="none" stroke-linecap="round"/>';
}

// ── shots ──
// shot(start, cam, draw, opt): start = a script line index, or [line, chunk] to start on a caption chunk inside a line.
// cam(u, d) → [cx, cy, zoom]; draw(u, d, t) → SVG. u = seconds into the shot, d = its length.
// opt.tr = "fade" (default) | "in" (fly into the old shot's centre while crossfading) | "out" (the new shot starts tight and pulls back).
var SH = [], HUD = [];
function startOf(s) { if (typeof s === "number") return s >= LN.length ? window.TIMING.duration + 2 : LN[s].start; var l = LN[s[0]], c = window.CHUNKS[s[0]]; return l.start + (l.end - l.start) * (c[s[1]] || 0); }
function shot(start, cam, draw, opt) { SH.push({ a: startOf(start), cam: cam, draw: draw, tr: (opt && opt.tr) || "fade" }); SH.sort(function (p, q) { return p.a - q.a; }); }
// hud(from, to, draw): something that stays put on top of the panel across shots (rule chips, status pills, a checklist).
// draw(u, t) in panel units, not moved by the camera. from / to like shot starts; to is exclusive.
function hud(from, to, draw) { HUD.push({ a: startOf(from), b: startOf(to), draw: draw }); }
// camera helpers: push from zoom z1 to z2 around (x,y); pan from (x1,y1) to (x2,y2) at zoom z
function push(x, y, z1, z2) { return function (u, d) { var k = ease(u / d); return [x, y, lerp(z1, z2, k)]; }; }
function pan(x1, y1, x2, y2, z) { return function (u, d) { var k = ease(u / d); return [lerp(x1, x2, k), lerp(y1, y2, k), z || 1]; }; }
// fly(from, to, dur): the «طب إزاي؟» camera move, measured frame by frame in the bypass video: the frame holds dead still,
// then flies in one eased (slow-fast-slow) move of about 1.8 s to a new [cx, cy, zoom] (×1.2–2.4 in onto the part being
// talked about, or back out ×0.4–0.8), then holds still again. No drift, no wobble. from / to are [cx, cy, zoom].
function fly(a, b, dur) { dur = dur || 1.8; return function (u) { var k = ease(u / dur); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), a[2] * Math.pow(b[2] / a[2], k)]; }; }
function still(x, y, z) { return function () { return [x, y, z || 1]; }; }
var XF = 0.45;   // crossfade length (s)
window.SCENE = window.SCENE || {};
window.__t = 0;
window.SCENE.panel = function (A, B, t) {
  window.__t = t; CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0], cy = c[1], z = c[2] * extraZ;   // dead-still frame between moves, as measured in «طب إزاي؟» (the user's rule: no shake, it tired viewers' eyes). The life qa.py needs comes from the drawing itself
    return '<g opacity="' + op.toFixed(3) + '"><g transform="translate(320 393) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g></g>';
  }
  var cur = SH[i], u = t - cur.a, x = i > 0 && u < XF ? ease(u / XF) : 1;
  if (x < 1) {   // crossfade: the old shot under, the new one fading in on top
    var zo = cur.tr === "in" ? 1 + 0.9 * x : cur.tr === "out" ? 1 - 0.3 * x : 1, zi = cur.tr === "in" ? lerp(0.7, 1, x) : cur.tr === "out" ? lerp(1.6, 1, x) : 1;
    A.innerHTML = render(i - 1, zo, 1); B.innerHTML = render(i, zi, x);
  } else { A.innerHTML = render(i, 1, 1); B.innerHTML = ""; }
  var h = ""; HUD.forEach(function (q) { if (t >= q.a && t < q.b) { var k = Math.min(ease((t - q.a) / 0.35), ease((q.b - t) / 0.35)); h += '<g opacity="' + k.toFixed(3) + '">' + q.draw(t - q.a, t) + '</g>'; } });
  B.innerHTML += h + '<rect x="0" y="0" width="640" height="786" filter="url(#paperN)" pointer-events="none"/>';
};

// ── shared drawings from the reference episode «المد والجزر» (videos/tides/sketch) ──
// materials: sand bed, timber, sea (side + top), globe ocean / land, moon
var SAND_TOP = "#e6d3a3", SAND_SIDE = "#d2b77e", STRATA = "#bfa168", WET = "#cbb58a", WOOD = "#a9784d", WOOD_D = "#7c5434",
    SEA_TOP = "#9fb7c3", SEA_SIDE = "#6f8ea2", OCEAN = "#b9c9cc", LAND = "#a7ad6c", MOONC = "#d3cdbf";
// a globe with REAL coastlines (Natural Earth via ../../lib/geo.min.js, loaded by default): globe(cx, cy, r, lon, lat, {dot: [lon, lat], land}).
// Ocean + graticule + olive land + hatched night side + a thin atmosphere ring, like the reference. lat 72 ≈ seen from above the North Pole.
function globe(cx, cy, r, lon, lat, op) {
  op = op || {}; var g = GEO.globe(cx, cy, r, lon, lat), id = "gc" + (++CLIPN);
  var s = '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r + 6) + '" fill="#cdd8d6" stroke="' + INK + '" stroke-width="1.2"/>';
  s += '<path d="' + g.sphere + '" fill="' + OCEAN + '"/><path d="' + g.grat + '" fill="none" stroke="#eef2ec" stroke-width="1.3" opacity=".85"/>';
  s += '<path d="' + g.land + '" fill="' + (op.land || LAND) + '" stroke="' + INK + '" stroke-width="1.7" stroke-linejoin="round"/>';
  // shade: hatching on the night side (lower right), like the reference
  s += '<g clip-path="url(#' + id + ')"><path fill-rule="evenodd" d="M' + f(cx - r - 10) + ' ' + f(cy - r - 10) + ' h' + f(2 * r + 20) + ' v' + f(2 * r + 20) + ' h' + f(-2 * r - 20) + ' Z M' + f(cx - r * .28 + r * 1.06) + ' ' + f(cy - r * .2) + ' a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(-2 * r * 1.06) + ' 0 a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(2 * r * 1.06) + ' 0 Z" fill="url(#hatch)"/>' +
       '<path fill-rule="evenodd" d="M' + f(cx - r - 10) + ' ' + f(cy - r - 10) + ' h' + f(2 * r + 20) + ' v' + f(2 * r + 20) + ' h' + f(-2 * r - 20) + ' Z M' + f(cx - r * .28 + r * 1.06) + ' ' + f(cy - r * .2) + ' a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(-2 * r * 1.06) + ' 0 a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(2 * r * 1.06) + ' 0 Z" fill="' + INK + '" opacity=".07"/></g>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  if (op.dot) { var p = g.project(op.dot); var vis = GEO_visible(op.dot, lon, lat); if (p && vis) s += C(p[0], p[1], 8, INK, 2) + C(p[0], p[1], 3, "#fff", 0); }
  return s;
}
function GEO_visible(ll, lon, lat) {   // is (lon,lat) on the near side of a globe centred on (lon0,lat0)?
  var r = Math.PI / 180, a = ll[0] * r, b = ll[1] * r, a0 = lon * r, b0 = lat * r;
  return Math.sin(b0) * Math.sin(b) + Math.cos(b0) * Math.cos(b) * Math.cos(a - a0) > 0.05;
}
// the Moon: grey disc, craters, hatched shadow side
function moon(x, y, r) {
  var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + MOONC + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1.4, r * .06)) + '"/>';
  [[-.35, -.3, .2], [.25, -.1, .14], [-.05, .35, .17], [.4, .38, .1], [-.45, .2, .09]].forEach(function (c) { s += '<circle cx="' + f(x + c[0] * r) + '" cy="' + f(y + c[1] * r) + '" r="' + f(c[2] * r) + '" fill="#bfb8a8" stroke="' + INK + '" stroke-width="' + f(Math.max(.8, r * .03)) + '"/>'; });
  return s + '<path d="M' + f(x + r * .2) + ' ' + f(y - r * .98) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * .2) + ' ' + f(y + r * .98) + ' A' + f(r * .8) + ' ' + f(r) + ' 0 0 0 ' + f(x + r * .2) + ' ' + f(y - r * .98) + ' Z" fill="url(#hatch)"/>';
}
// the Sun (the reference shows it partly off-panel): rays turn slowly with t
function sun(x, y, r, t) {
  var s = "", k; for (k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2 + t * .15, r1 = r * 1.12, r2 = r * (k % 2 ? 1.3 : 1.45); s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>'; }
  return s + C(x, y, r, "#d98a4a", 2.4) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .78) + '" fill="#e2a062"/>';
}
// a water bulge round a globe: an ellipse stretched along angle ang (deg); k 0..1 how much; it breathes a little with the panel time
function bulge(cx, cy, r, k, ang, col) { k = k * (1 + .04 * Math.sin(window.__t * 2.2)); return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * (1.04 + .42 * k)) + '" ry="' + f(r * (1.04 + .03 * k)) + '" transform="rotate(' + f(ang || 0) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + (col || "#5f7f97") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
// a dimension line with end ticks that draws itself, and its value in serif under it
function measure(x1, y1, x2, y2, k, text, sz) {
  k = clamp(k); if (k <= 0) return ""; var a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 9, ny = Math.cos(a) * 9;
  var s = draw("M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2), k, INK, 2.2) + '<path d="M' + f(x1 - nx) + ' ' + f(y1 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  if (k > .95) s += '<path d="M' + f(x2 - nx) + ' ' + f(y2 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  return s + (text ? '<g opacity="' + f(clamp(k * 2 - 1)) + '">' + N(text, (x1 + x2) / 2, (y1 + y2) / 2 + (sz || 40) * 1.2, sz || 40) + '</g>' : "");
}
// an Arabic word in a framed box (numBox is for digits in serif; tag is for words like «أعلى مد»)
function tag(text, x, y, k, sz, col) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 30; var w = text.length * sz * .55 + 34; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * 1.05) + '" width="' + f(w) + '" height="' + f(sz * 1.65) + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(text, 0, sz * .3, sz, col || INK, 800)); }

// ── «حقن التخسيس» — shots. Drawings in draw.js (GW.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: dead still on a drawing for several chunks, then one eased fly (~1.8 s) in onto the part
// being talked about, and later back out. Life comes from the drawing: blood runs, the message rides, the centres glow,
// chyme drips, the man breathes and blinks.
var FULL = [320, 393, 1];
function blink(t) { return (t % 3.7) < .12 ? .05 : 1; }
function br(t) { return (Math.sin(t * 1.7) + 1) / 2; }
// the man standing (casual clothes: an ordinary person at home), feet on floor y
function man(x, fl, s, t, o) {
  o = o || {}; var y = fl - 208 * s;
  var P = PERSON.front({ x: x, y: y, s: s, legs: "stand", outfit: "casual", breath: br(t), head: { tilt: (o.tilt || 0) + 1.5 * Math.sin(t * .9), turn: o.turn || 0 },
    face: Object.assign({ eyes: blink(t), brows: "neutral", mouth: "neutral" }, o.face || {}),
    arms: o.arms ? o.arms(y) : [{ to: [x - 50 * s, y + 16 * s], hand: "relaxed", bend: 1 }, { to: [x + 50 * s, y + 16 * s], hand: "relaxed", bend: -1 }] });
  return P;
}
// the man sitting at a table, a plate in front of him: k = food left; o.face, o.belly (a hand on the belly)
function diner(x, fl, s, t, k, o) {
  o = o || {}; var y = fl - 114 * s, top = fl - 172 * s;
  var arms = [{ to: [x - 70 * s, top - 4 * s], hand: "relaxed", bend: 1, rot: 80 }, o.belly ? { to: [x + 8 * s, y - 40 * s], hand: "flat", bend: -1, front: true, rot: 170 } : { to: [x + 70 * s, top - 4 * s], hand: "relaxed", bend: -1, rot: 100 }];
  var P = PERSON.front({ x: x, y: y, s: s, legs: "sit", outfit: "casual", breath: br(t), head: { tilt: 2 * Math.sin(t * .8), nod: o.nod || 0 },
    face: Object.assign({ eyes: blink(t), brows: "neutral", mouth: "neutral" }, o.face || {}), arms: arms });
  var tb = '<rect x="' + f(x - 230 * s) + '" y="' + f(top) + '" width="' + f(460 * s) + '" height="' + f(18 * s) + '" fill="#b98a5c" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<rect x="' + f(x - 220 * s) + '" y="' + f(top + 18 * s) + '" width="' + f(440 * s) + '" height="' + f(fl - top - 18 * s) + '" fill="#a77a4f" stroke="' + INK + '" stroke-width="2.2"/>';
  return glowP(x, top - 40 * s, 200, '#e9b949', t) + P.svg + tb + GW.plate(x, top - 8 * s, s * .9, k);
}
// the man with the cut-away window over his belly and the stations numbered
function stations(t, o) {
  o = o || {}; var s = 1.35, x = 320, fl = 900, P = man(x, fl, s, t, { face: o.face }), J = P.joints, hy = J.hip ? J.hip[0][1] || J.hip[1] : fl - 208 * s;
  return { svg: P.svg + GW.bellyWindow(x, fl - 300 * s, s * .62, {}), head: J.head, belly: [x + 18 * s * .62 * 1.2, fl - 300 * s] };
}
function watch(x, y, r, frac, col) {
  var a = -Math.PI / 2 + 2 * Math.PI * frac, g = C(x, y, r, PAPER, 2.4) + '<rect x="' + f(x - 7) + '" y="' + f(y - r - 12) + '" width="14" height="10" fill="' + INK + '"/>';
  g += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r + 6) + ' A' + f(r - 6) + ' ' + f(r - 6) + ' 0 ' + (frac > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 6)) + ' ' + f(y + Math.sin(a) * (r - 6)) + ' Z" fill="' + (col || ORANGE) + '" opacity=".35"/>';
  return g + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 8)) + ' ' + f(y + Math.sin(a) * (r - 8)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
function cal(x, y, txt2, k) { return iconBox(x, y, 130, '<rect x="-40" y="-34" width="80" height="70" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="-34" width="80" height="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' +
  '<path d="M-24 -42 V-28 M24 -42 V-28" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + T(txt2, 0, 22, 19, INK, 800), k); }
function chip(txt2, x, y, col, k, sz) { k = pop(k); if (k <= 0) return ""; sz = sz || 22; var w = txt2.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .9) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '"/>' + T(txt2, 0, sz * .4, sz, "#fbf8f1", 800)); }
function bubble(x, y, txt2, k, sz) { k = pop(k); if (k <= 0) return ""; sz = sz || 24; var w = txt2.length * sz * .58 + 36;
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<path d="M' + f(-w / 2) + ' -30 H' + f(w / 2) + ' V22 H24 L4 44 L6 22 H' + f(-w / 2) + ' Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' + T(txt2, 0, 4, sz, INK, 800)); }
function face(x, y, sz, fc, k) {   // the man's face in a framed box
  return iconBox(x, y, sz, '<clipPath id="fc' + (++CLIPN) + '"><rect x="' + f(-sz / 2 + 3) + '" y="' + f(-sz / 2 + 3) + '" width="' + f(sz - 6) + '" height="' + f(sz - 6) + '"/></clipPath><g clip-path="url(#fc' + CLIPN + ')">' +
    PERSON.head([0, sz * .1 + 2 * Math.sin(window.__t * 1.6)], sz / 80, 3 * Math.sin(window.__t * 1.1), { face: Object.assign({ eyes: blink(window.__t) }, fc) }, PERSON.colors) + '</g>', k);
}
function glowP(x, y, r, col, t) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + (col || '#e9b949') + '" opacity="' + (.16 + .12 * Math.sin(t * 3)).toFixed(3) + '"/>'; }
function lineT(i, c) { var l = LN[i], cs = window.CHUNKS[i]; return l.start + (l.end - l.start) * (cs[c] || 0); }

// 4 · before we explain, a small rule… remember it
shot(4, still(FULL[0], FULL[1], 1), function (u, d, t) {
  var P = man(320, 760, 1.5, t, { face: { brows: "raised", mouth: "smile" }, arms: function (y) { return [{ to: [320 - 75, y + 24], hand: "relaxed", bend: 1 }, { to: [320 + 150, y - 300], hand: "point", bend: -1, rot: -80 }]; } });
  return paper() + P.svg + tag("قاعدة صغيرة", 170, 160, at(u, .3, .3), 28, ORANGE);
});
shot([4, 2], still(FULL[0], FULL[1], 1), function (u, d, t) {
  var P = man(320, 760, 1.5, t, { face: { brows: "raised", mouth: "smile" }, arms: function (y) { return [{ to: [320 - 75, y + 24], hand: "relaxed", bend: 1 }, { to: [P0h[0] + 30, P0h[1] - 40], hand: "point", bend: -1, rot: -120 }]; } });
  return paper() + P.svg + tag("قاعدة صغيرة", 170, 160, 1, 28, ORANGE) + T("خليك فاكرها", 170, 230, 26, INK, 800);
});
var P0h = [320, 300];   // the head point for «remember it» (set once below from the kit)
(function () { var P = PERSON.front({ x: 320, y: 760 - 208 * 1.5, s: 1.5, legs: "stand", outfit: "casual" }); P0h = P.joints.head; })();

// 5 · the body only draws on its fat when the food in is less than what it spends
var BAL = [320, 300];
function bal(tilt, kFood, extra) { return glowP(490, 330, 150, '#e9874a', window.__t) + GW.balance(BAL[0], BAL[1], 1, tilt, GW.plate(0, -20, .62, kFood), GW.flame(1, window.__t)) + (extra || ""); }
function balTags(k) { return G("", T("الأكل الداخل", 150, 560, 22, INK, 800) + T("اللي بيصرفه", 490, 560, 22, INK, 800), k); }
shot(5, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + bal(0, 1) + balTags(at(u, .3, .4)); });
shot([5, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { var k = at(u, .1, 1.2); return paper() + bal(-.0 + .0, 1 - .55 * k) + balTags(1); });
shot([5, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { var k = at(u, 0, .9); return paper() + bal(.8 * k, .45) + balTags(1) + T("أقل", 150, 600, 30, ORANGE, 800); });
shot([5, 4], fly(FULL, [320, 470, 1.15], 1.4), function (u, d, t) {
  var k = at(u, .2, .5);
  return paper() + bal(.8, .45) + balTags(1) + T("أقل", 150, 600, 30, ORANGE, 800) +
    G("", '<g transform="translate(480 680) scale(.32)">' + GW.fat(0, 0, 1, { shrink: .2, out: 1 }) + '</g>', k) + arrow(490, 610, 490, 520, ORANGE, 4, at(u, .6, .5)) + label(400, 690, 300, 720, "الدهون", OLIVE, at(u, .4, .5), 22);
});

// 6 · so what does the injection do? — he injects the pen in the skin of his belly
shot(6, still(FULL[0], FULL[1], 1), function (u, d, t) {
  var s = 1.5, x = 300, y = 760 - 208 * s, P = man(x, 760, s, t, { face: { brows: "raised", mouth: "o", look: [.3, .5] }, turn: .1,
    arms: function (y2) { return [{ to: [x - 75, y2 + 24], hand: "relaxed", bend: 1 }, { to: [x + 50, y2 - 70], hand: "fist", bend: -1, rot: 200 }]; } });
  return paper() + P.svg + GW.pen(x + 34, y - 74, 205, .62, {}) + G("", T("؟", 520, 260, 150, ORANGE, 800), at(u, .2, .3));
});

// 7 · food reaches the small intestine; its cells release a hormone called GLP-1
var VI = [320, 420, 1], LC = [212, 386, 2.1];
shot(7, still(VI[0], VI[1], 1), function (u, d, t) { return paper() + GW.villi(320, 420, 1, { food: at(u, 0, 1) }); }, { tr: "in" });
shot([7, 1], still(VI[0], VI[1], 1), function (u, d, t) { return paper() + GW.villi(320, 420, 1, { food: 1 }) + tag("المصران الرفيع", 320, 120, at(u, .1, .3), 26, OLIVE); });
shot([7, 2], fly(VI, LC, 1.6), function (u, d, t) { return paper() + GW.villi(320, 420, 1, { food: 1, lcell: at(u, .8, .6) }) + label(210, 380, 262, 330, "خلية بتحس بالأكل", ORANGE, at(u, 1.2, .5), 11); });
shot([7, 3], still(LC[0], LC[1], LC[2]), function (u, d, t) { return paper() + GW.villi(320, 420, 1, { food: 1, lcell: 1, release: at(u, 0, .6) }) + label(210, 380, 262, 330, "خلية بتحس بالأكل", ORANGE, 1, 11) + numBox("GLP-1", 200, 300, at(u, .2, .3), 14, true); });

// 8 · the hormone is a message to the body: enough, the food has arrived
function blood(t, extra) { return GW.vessel(-40, 680, 400, 260, t, { speed: 40 }) + (extra || ""); }
function msgX(t, t0, v) { return 120 + ((t - t0) * (v || 26)); }
shot(8, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + blood(t, GW.glp(msgX(t, LN[8].start), 400, 3, {})) + label(170, 380, 120, 230, "GLP-1", ORANGE, at(u, .3, .5), 26); });
shot([8, 2], still(FULL[0], FULL[1], 1), function (u, d, t) {
  var x = msgX(t, LN[8].start); return paper() + blood(t, GW.glp(x, 400, 3, { glow: .5 + .5 * Math.sin(t * 4) })) + bubble(x + 60, 250, "كفاية، الأكل وصل!", at(u, 0, .35), 24);
});

// 9 · but that message is wiped from the blood in two minutes (DPP-4 snips it)
shot(9, still(FULL[0], FULL[1], 1), function (u, d, t) {
  var x = msgX(t, LN[8].start), k = at(u, .1, 1.1);
  return paper() + blood(t, GW.glp(x, 400, 3, { cut: at(u, .9, .6) })) + GW.dpp4(lerp(700, x - 150, k), 330, 1.1, 1) + label(lerp(700, x - 150, k) - 20, 300, 80, 200, "إنزيم بيقصّها", OLIVE, at(u, 1.2, .5), 22);
});
shot([9, 2], still(FULL[0], FULL[1], 1), function (u, d, t) {
  var x = msgX(t, LN[8].start); return paper() + G("", blood(t, GW.glp(x, 400, 3, { cut: 1 })), 1) + GW.dpp4(x - 150, 330, 1.1, 1) + iconBox(520, 150, 160, watch(0, 6, 52, Math.min(1, (t - LN[9].start) / 2)) , at(u, 0, .3)) + bigNum("2", "دقيقة", 520, 700, at(u, .2, .4), ORANGE, 70);
});

// 10 · the injection holds a changed copy that stays in the blood a whole week
shot(10, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + blood(t, GW.glp(300, 430, 3, { kind: "sema", alb: at(u, .6, .4) > .5 })) + iconBox(110, 130, 160, GW.pen(-60, 0, 180, .4, {}), at(u, 0, .3)); });
shot([10, 1], still(FULL[0], FULL[1], 1), function (u, d, t) {
  return paper() + blood(t, GW.glp(300, 430, 3, { kind: "sema" })) + iconBox(110, 130, 160, GW.pen(-60, 0, 180, .4, {}), 1) + label(160, 432, 100, 560, "حتة متغيّرة", BLUE, at(u, .1, .5), 22) + label(370, 330, 470, 230, "ديل بيمسك في الدم", OLIVE, at(u, .4, .5), 22);
});
shot([10, 2], still(FULL[0], FULL[1], 1), function (u, d, t) {
  var k = at(u, 0, .8), bx = lerp(700, 210, k) + (u > .8 ? 30 * at(u, .8, .4) : 0);
  return paper() + blood(t, GW.glp(300, 430, 3, { kind: "sema" })) + GW.dpp4(bx, 340, 1.1, 1) + cross(bx - 10, 250, .7, at(u, .9, .5));
});
shot([10, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + blood(t, GW.glp(300, 430, 3, { kind: "sema" })) + cal(500, 150, "7 أيام", at(u, 0, .3)) + check(500, 260, .9, at(u, .3, .5), "#5e8a4a"); });

// 11 · where does the message go? first stop: the brain
var MAN11 = function (t, k, face2) {
  var s = 1.85, x = 300, fl = 880, y = fl - 208 * s, P = man(x, fl, s, t, { face: face2 || { brows: "raised" } }), J = P.joints, by = y - 52 * s;
  return { svg: P.svg + GW.bellyWindow(x, by, s * .58, {}), head: J.head, bx: x, by: by, s: s };
};
shot(11, still(FULL[0], FULL[1], 1), function (u, d, t) {
  var M = MAN11(t), h = M.head;
  return paper() + M.svg + callout("1", h[0] + 130, h[1] - 30, at(u, .6, .3), 22) + callout("2", M.bx + 170, M.by - 30, at(u, .9, .3), 22) + callout("3", M.bx + 170, M.by + 40, at(u, 1.2, .3), 22) +
    draw("M" + f(M.bx - 20) + " " + f(M.by) + " C" + f(M.bx - 60) + " " + f(M.by - 140) + " " + f(h[0] - 50) + " " + f(h[1] + 120) + " " + f(h[0]) + " " + f(h[1]), at(u, .2, 1.2), ORANGE, 4, ' stroke-dasharray="10 8"');
});
shot([11, 2], fly(FULL, [300, 170, 2.2], 1.6), function (u, d, t) {
  var M = MAN11(t), h = M.head;
  return paper() + M.svg + callout("1", h[0] + 130, h[1] - 30, 1, 22) + callout("2", M.bx + 170, M.by - 30, 1, 22) + callout("3", M.bx + 170, M.by + 40, 1, 22) +
    draw("M" + f(M.bx - 20) + " " + f(M.by) + " C" + f(M.bx - 60) + " " + f(M.by - 140) + " " + f(h[0] - 50) + " " + f(h[1] + 120) + " " + f(h[0]) + " " + f(h[1]), 1, ORANGE, 4, ' stroke-dasharray="10 8"');
});

// 12 · deep in the brain, a spot called the hypothalamus: a hunger centre and a fullness centre
var BR = [300, 400, 1.9], HY = [356, 398, 3.4];
function brain(o) { return GW.brainHead(BR[0], BR[1], BR[2], o); }
shot(12, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + brain({}) + label(250, 260, 120, 150, "المخ", INK, at(u, .2, .5), 24); }, { tr: "in" });
shot([12, 1], fly(FULL, HY, 1.6), function (u, d, t) { return paper() + brain({ hypo: at(u, .2, .6) }) + label(358, 404, 410, 440, "تحت المهاد", OLIVE, at(u, 1.4, .5), 7); });
shot([12, 2], still(HY[0], HY[1], HY[2]), function (u, d, t) { return paper() + brain({ hypo: .6, hunger: .5 + .3 * Math.sin(t * 3), full: 0, zoomed: true }) + label(342, 402, 316, 430, "مركز الجوع", ORANGE, at(u, .1, .5), 7); });
shot([12, 3], still(HY[0], HY[1], HY[2]), function (u, d, t) { return paper() + brain({ hypo: .6, hunger: .6, full: .15 + .1 * Math.sin(t * 3), zoomed: true }) + label(342, 402, 316, 430, "مركز الجوع", ORANGE, 1, 7) + label(367, 402, 396, 372, "مركز الشبع", "#5e8a4a", at(u, .1, .5), 7); });

// 13 · the hormone wakes the fullness centre: you eat half your plate and feel full
shot(13, still(HY[0], HY[1], HY[2]), function (u, d, t) {
  var k = at(u, .3, 1.2); return paper() + brain({ hypo: .6, hunger: .6 * (1 - k), full: .15 + .85 * k, zoomed: true, hits: 1 }) + label(342, 402, 316, 430, "مركز الجوع", ORANGE, 1, 7) + label(367, 402, 396, 372, "مركز الشبع", "#5e8a4a", 1, 7);
});
shot([13, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + diner(320, 800, 1.45, t, 1 - .5 * at(u, .2, 1.4), {}) + tag("نص الطبق", 320, 120, at(u, .9, .3), 26, ORANGE); });
shot([13, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + diner(320, 800, 1.45, t, .5, { belly: true, face: { mouth: "smile", brows: "raised" } }) + tag("نص الطبق", 320, 120, 1, 26, ORANGE) + check(520, 210, .9, at(u, .3, .5), "#5e8a4a"); });

// 14 · second stop: the stomach, it empties the food more slowly
var STO = [380, 430, 1.05], PY = [258, 482, 2.3];
function sto(o) { return GW.stomach(STO[0], STO[1], STO[2], o); }
shot(14, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + sto({ fill: .55, flow: 1, labels: true }) + callout("2", 560, 100, 1, 24); });
shot([14, 1], fly(FULL, PY, 1.5), function (u, d, t) { var k = at(u, .6, 1); return paper() + sto({ fill: .55 + .15 * k, flow: 1, pyl: .85 * k, slow: k > .5 }) + label(222, 472, 200, 420, "البوّابة بتضيق", ORANGE, at(u, 1.5, .5), 9); });

// 15 · so the food stays longer and you keep feeling full
shot(15, fly(PY, FULL, 1.5), function (u, d, t) { return paper() + sto({ fill: .75, flow: 1, pyl: .85, slow: true, pylCol: "#a84a3a" }) + iconBox(520, 650, 150, watch(0, 6, 48, (t * .08) % 1, BLUE), at(u, 1.3, .3)) + T("أطول", 520, 750, 26, BLUE, 800); });
shot([15, 1], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + sto({ fill: .75, flow: 1, pyl: .85, slow: true }) + face(520, 140, 170, { mouth: "smile", brows: "raised" }, at(u, 0, .3)) + tag("مليان", 520, 270, at(u, .3, .3), 24, ORANGE); });

// 16 · like a sink with a narrow drain: it empties slowly
shot(16, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + GW.sink(320, 330, 1.5, { level: .75 - .03 * Math.sin(t), narrow: 1 }) + label(330, 500, 470, 560, "بلّاعة ضيقة", BLUE, at(u, .5, .5), 24); });
shot([16, 1], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + GW.sink(320, 330, 1.5, { level: .75, narrow: 1 }) + label(330, 500, 470, 560, "بلّاعة ضيقة", BLUE, 1, 24) + iconBox(110, 120, 150, '<g transform="scale(.15) translate(0 -20)">' + GW.stomach(0, 0, 1, { fill: .75, pyl: .9, flow: 1, slow: true }) + '</g>', at(u, .1, .3)); });

// 17 · third stop: the pancreas, more insulin when the sugar rises
var PA = [330, 500, 1.15];
function panc(o) { return glowP(330, 470, 240, '#e9b949', window.__t) + GW.pancreas(PA[0], PA[1], PA[2], o); }
shot(17, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + panc({ labels: 1, sugar: .6 }) + callout("3", 560, 100, 1, 24); });
shot([17, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + panc({ labels: 2, islets: at(u, .2, .8), insulin: at(u, .6, .8), sugar: .6 }) + label(560, 282, 520, 180, "إنسولين", "#b8862a", at(u, .9, .5), 22); });
shot([17, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + panc({ labels: 2, islets: 1, insulin: 1, sugar: 1 }) + label(560, 282, 520, 180, "إنسولين", "#b8862a", 1, 22) + label(140, 282, 120, 170, "سكر", INK, at(u, .1, .5), 22); });

// 18 · so you eat much less, without feeling deprived
shot(18, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + diner(320, 800, 1.45, t, .45, { face: { mouth: "smile" } }) + tag("أقل بكتير", 320, 120, at(u, .3, .3), 26, ORANGE); });
shot([18, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + diner(320, 800, 1.45, t, .45, { face: { mouth: "grin", brows: "raised" } }) + tag("أقل بكتير", 320, 120, 1, 26, ORANGE) + tag("ومش جعان", 320, 200, at(u, .2, .3), 24, "#5e8a4a"); });

// 19 · when the food coming in drops, the body draws on its fat store… and that is what slims you
shot(19, still(FULL[0], FULL[1], 1), function (u, d, t) { var k = at(u, .2, 1); return paper() + bal(.8 * k, 1 - .55 * k) + balTags(1); });
shot([19, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + GW.fat(320, 420, 1.2, { shrink: at(u, .2, 2.4) * .8, out: 1 }) + tag("مخزن الدهون", 320, 110, at(u, 0, .3), 26, OLIVE); }, { tr: "in" });
shot([19, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + GW.fat(320, 420, 1.2, { shrink: .8, out: 1 }) + G("", '<rect x="120" y="560" width="400" height="160" fill="' + PAPER + '"/>', 1) + GW.scale(320, 640, 1.4, (98 - 20 * at(u, .1, 1)).toFixed(0)) + tag("مخزن الدهون", 320, 110, 1, 26, OLIVE); });

// 20 · many think all the weight lost is fat. No.
function pie(x, y, r, part, k) {   // fat vs muscle share of the weight lost
  var a = 2 * Math.PI * part * clamp(k), g = C(x, y, r, GW.C.FATC, 2.4);
  if (a > .01) g += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(x + Math.sin(a) * r) + ' ' + f(y - Math.cos(a) * r) + ' Z" fill="' + GW.C.MUSC + '" stroke="' + INK + '" stroke-width="2.4"/>';
  return g;
}
shot(20, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + pie(320, 400, 190 + 12 * Math.sin(t * 2.2), 0, 0) + T("كله دهون؟", 320, 410 + 14 * Math.sin(t * 2.2), 40, INK, 800) + GW.scale(320, 700, 1, "78"); });
shot([20, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + pie(320, 400, 190, 0, 0) + T("كله دهون؟", 320, 410 + 6 * Math.sin(t * 2.2), 40, INK, 800) + GW.scale(320, 700, 1, "78") + cross(320, 400, 2.2 + .15 * Math.sin(t * 3), at(u, 0, .5)); });

// 21 · in studies a quarter to a third of the weight lost was muscle; so protein and exercise
shot(21, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + pie(320, 380, 190, .3, at(u, .2, 1.4)) + G("", T("دهون", 250, 470, 30, INK, 800), at(u, .3, .4)) + G("", T("عضل", 400, 290, 30, "#fbf8f1", 800), at(u, 1.2, .4)); });
shot([21, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + pie(320, 380, 190, .3, 1) + T("دهون", 250, 470, 30, INK, 800) + T("عضل", 400, 290, 30, "#fbf8f1", 800) + numBox("¼ – ⅓", 320, 680, at(u, .1, .3), 40, true); });
function egg(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="34" ry="44" fill="#fbf6ea" stroke="' + INK + '" stroke-width="2.4"/>'; }
function dumbbell(x, y) { return '<rect x="' + (x - 60) + '" y="' + (y - 6) + '" width="120" height="12" fill="#9aa9b4" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x - 76) + '" y="' + (y - 30) + '" width="22" height="60" rx="4" fill="#4d5a64" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x + 54) + '" y="' + (y - 30) + '" width="22" height="60" rx="4" fill="#4d5a64" stroke="' + INK + '" stroke-width="2"/>'; }
shot([21, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + GW.muscle(320, 280, 1.2) + iconBox(180, 560, 180, egg(0, 0), at(u, .1, .3)) + iconBox(460, 560, 180, dumbbell(0, 0), at(u, .5, .3)) + T("بروتين", 180, 690, 26, OLIVE, 800) + T("رياضة", 460, 690, 26, OLIVE, 800); });

// 22 · stop the injection and the hunger comes back; in a big study people regained two-thirds in a year
var GR = [70, 280, 520, 300];
function gr(o) { return glowP(380, 420, 230, '#e9b949', window.__t) + GW.graph(GR[0], GR[1], GR[2], GR[3], o) + T("الوزن", 70, 250, 20, INK, 800) + T("أسابيع", 560, 620, 18, INK, 700); }
shot(22, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + gr({ k1: 1, stop: at(u, .2, .4) > .5 }) + G("", T("على الحقنة", 230, 680, 22, "#5e8a4a", 800), at(u, 0, .4)); });
shot([22, 1], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + gr({ k1: 1, stop: true, k2: clamp((t - lineT(22, 1)) / (lineT(22, 3) - lineT(22, 1))) * .45 }) + T("على الحقنة", 230, 680, 22, "#5e8a4a", 800) + chip("الجوع بيرجع", 470, 150, ORANGE, at(u, 0, .3)); });
shot([22, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + gr({ k1: 1, stop: true, k2: .45 + .55 * clamp(u / 1.8) }) + T("على الحقنة", 230, 680, 22, "#5e8a4a", 800) + chip("الجوع بيرجع", 470, 150, ORANGE, 1) + bigNum("⅔", "رجع في سنة", 500, 520, at(u, .8, .4), ORANGE, 76); });

// 23 · bottom line: calms hunger, slows the stomach, you eat less, the body does the burning
shot(23, still(FULL[0], FULL[1], 1), function (u, d, t) {
  var M = MAN11(t, 1, { mouth: "smile" }), h = M.head, c = window.CHUNKS[23], l = LN[23];
  var ks = c.map(function (q) { return at(t - (l.start + (l.end - l.start) * q), 0, .3); }), cur = 0; for (var j = 0; j < c.length; j++) if (t >= l.start + (l.end - l.start) * c[j]) cur = j;
  var RP = [[h[0] + 130, h[1] - 30], [h[0] + 130, h[1] - 30], [M.bx + 170, M.by - 30], [520, 500], [450, 700]], rp = RP[cur], ring = cur ? C(rp[0], rp[1], 30 + 10 * Math.sin(t * 4), 'none', 3).replace('stroke="' + INK, 'stroke="' + ORANGE) : '';
  return paper() + M.svg + callout("1", h[0] + 130, h[1] - 30, ks[1], 22) + G("", T("الجوع", h[0] + 130, h[1] + 14, 22, OLIVE, 800), ks[1]) +
    callout("2", M.bx + 170, M.by - 30, ks[2], 22) + G("", T("المعدة", M.bx + 170, M.by + 14, 22, OLIVE, 800), ks[2]) +
    G("", '<g transform="translate(520 560)">' + GW.plate(0, 0, .62, .45) + '</g>' + callout("3", 520, 500, 1, 22) + T("أقل", 520, 620, 22, ORANGE, 800), ks[3]) +
    G("", '<g transform="translate(520 760)">' + GW.flame(1.1, t) + '</g>' + callout("4", 450, 700, 1, 22), ks[4]) + ring;
});

// 24 · the oddest: the first drug of this kind came from the spit of a venomous lizard, the Gila monster
shot(24, still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + iconBox(320, 300, 220, GW.pen(-90, 0, 180, .6, {}), at(u, 0, .3)) + T("أول دوا", 320, 470, 30, INK, 800); });
function sand() { return glowP(360, 470, 260, '#e9b949', window.__t) + '<rect x="-60" y="600" width="760" height="300" fill="#e6d3a3" stroke="' + INK + '" stroke-width="2"/><path d="M-60 640 Q100 625 260 640 T640 636" fill="none" stroke="#d2b77e" stroke-width="3"/>'; }
shot([24, 2], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + sand() + G("", GW.gila(370, 470, 1.0, {}), at(u, 0, .4)) + G("", '<path d="M88 494 q8 18 0 26 q-8 -8 0 -26 Z" fill="#cfe3ea" stroke="' + INK + '" stroke-width="2"/>', at(u, .6, .4)) + label(92, 512, 70, 660, "لعاب", BLUE, at(u, .7, .5), 24); });
shot([24, 3], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + sand() + GW.gila(370, 470, 1.0, {}) + label(92, 512, 70, 660, "لعاب", BLUE, 1, 24) + chip("سامّة", 470, 230, ORANGE, at(u, 0, .3)); });
shot([24, 4], still(FULL[0], FULL[1], 1), function (u, d, t) { return paper() + sand() + GW.gila(370, 470, 1.0, {}) + label(92, 512, 70, 660, "لعاب", BLUE, 1, 24) + chip("سامّة", 470, 230, ORANGE, 1) + tag("وحش جيلا", 320, 130, at(u, 0, .3), 34, INK); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: he stands on the scale, the reading drops from 98 to 78. line 1: the fat «melting»? line 2: the fat cell with a crossed flame
  var s = "";
  if (li === 0) {
    var k = clamp((t - .3) / 3.4), P = PERSON.front({ x: 304, y: 600 - 208 * 1.25, s: 1.25, legs: "stand", outfit: "casual", breath: br(t), face: { eyes: blink(t), brows: "raised", mouth: k > .6 ? "smile" : "neutral", look: [0, .7] },
      arms: [{ to: [304 - 62, 600 - 260 + 20], hand: "relaxed", bend: 1 }, { to: [304 + 62, 600 - 260 + 20], hand: "relaxed", bend: -1 }] });
    s += glowP(470, 160, 150, '#9be08a', t) + GW.scale(304, 612, 1.3, "") + P.svg + '<g transform="translate(470 130)">' + GW.scale(0, 0, 1.1, (98 - 20 * ease(k)).toFixed(0)) + '</g>' + arrow(470, 200 + 22 * Math.sin(t * 3), 470, 280 + 22 * Math.sin(t * 3), ORANGE, 8, 1) + iconBox(110, 130, 150, GW.pen(-60, 0, 180, .4, {}), 1);
  } else {
    var drop = li === 1 ? clamp((t - LN[1].start) / 1.6) : 1;
    s += glowP(304, 520, 200, '#e9874a', t) + '<g transform="translate(304 330) scale(1.05)">' + GW.fat(0, 0, 1, { shrink: li === 1 ? .25 * drop : .25 }) + '</g>';
    if (li === 1) s += T("بتدوّب؟", 304, 640, 44, ORANGE, 800);
    if (li >= 2) { var k2 = clamp((t - LN[2].start - .3) / .5); s += G("", '<g transform="translate(304 600)">' + GW.flame(1.4 * (1 + .18 * Math.sin(t * 5)), t) + '</g>', k2) + cross(304, 560, 1.4, clamp((t - LN[2].start - .9) / .6)); }
  }
  return s;
};
SCENE.bumper = function (u, t) { return GW.pen(150, 100, 205, .42, {}) + '<g transform="translate(40 150) scale(.25)">' + GW.fat(0, 0, 1, { shrink: .1 }) + '</g>'; };
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(70 130) scale(.22)">' + GW.villi(0, 0, 1, { lcell: 1 }) + '</g>' + '<g transform="translate(150 -20) scale(.5)">' + GW.brainHead(140, 260, 1, { hypo: 1 }) + '</g>' +
    '<g transform="translate(380 150) scale(.32)">' + GW.stomach(0, 0, 1, { fill: .6, pyl: .8 }) + '</g>' + '<g transform="translate(520 200) scale(.26)">' + GW.pancreas(0, 0, 1, { islets: 1 }).replace(/<rect[^>]*>/, "") + '</g>' +
    callout("1", 70, 50, ease(u / .3)) + callout("2", 230, 40, ease(u / .3 - .5)) + callout("3", 400, 40, ease(u / .3 - 1)) + callout("4", 540, 60, ease(u / .3 - 1.5));
};
