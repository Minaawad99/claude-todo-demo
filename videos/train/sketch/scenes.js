window.CHUNKS = [[0.0], [0.0, 0.3562, 0.6575], [0.0, 0.1818, 0.5455], [0.0, 0.4194], [0.0, 0.5667], [0.0, 0.4667], [0.0, 0.5849], [0.0, 0.2551, 0.6837], [0.0, 0.4884], [0.0, 0.4583], [0.0, 0.2069, 0.5517], [0.0, 0.3418, 0.6329], [0.0], [0.0, 0.5417], [0.0, 0.5079, 0.7619], [0.0, 0.7083], [0.0], [0.0, 0.5636], [0.0, 0.6591], [0.0, 0.3804, 0.7065], [0.0, 0.5075], [0.0, 0.4902], [0.0, 0.5667], [0.0, 0.1613, 0.3763, 0.5914, 0.8065], [0.0, 0.4138, 0.7356], [0.0], [0.0]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the camera never parks (a slow push / pan per shot plus a small drift added here);
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
var XF = 0.45;   // crossfade length (s)
window.SCENE = window.SCENE || {};
window.__t = 0;
window.SCENE.panel = function (A, B, t) {
  window.__t = t; CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 15 * Math.sin(t * 2.3), cy = c[1] + 12 * Math.cos(t * 1.9), z = c[2] * (1 + 0.035 * Math.sin(t * 1.5)) * extraZ;   // drift strong enough that qa.py never sees a parked frame
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

// ── «إزاي القطر بيجر العربيات وبيقف؟» — drawings. Shapes follow real references (refs/SOURCES.md): the ENR GE ES30ACi
// diesel-electric (cab at the front, long hood, radiator block at the back, two three-axle bogies, fuel tank between them),
// a passenger coach on two-axle bogies, the Janney knuckle coupler seen from above, and a tread brake (shoe, cylinder,
// auxiliary reservoir, brake pipe) in side view. Vehicles are drawn in local metres-ish units (≈19 px per metre, rail top at
// y = 0, front to the right) and placed with place(x, y, scale, fn) so line weights stay ~2 px on screen.

var STEEL = "#a7a59d", STEEL_D = "#77736a", BODY = "#d8cba8", BODY_D = "#b9ab86", BAND = "#7f8a78", GLASS = "#a9bcc4",
    COACH = "#ddd4bc", COACH_D = "#c0b498", FRAME = "#5d564a", BALLAST = "#cbc1aa", SLEEPER = "#8a7a62", TANK = "#8a8274",
    ENG = "#a29d90", ENG_D = "#7f7a6e", WAGON = "#a78a6c", WAGON_D = "#8a6f55", CUTP = "#efe6d2", TIRE = "#47433b";
var W = 1;   // line-weight factor of the drawing being placed (1 / its scale)
function sw(x) { return x * W; }
function Rw(x, y, w, h, fill, s, rx) { return R(x, y, w, h, fill, sw(s == null ? 2 : s), rx); }
function Cw(x, y, r, fill, s) { return C(x, y, r, fill, sw(s == null ? 2 : s)); }
function Pw(d, fill, s, ex) { return P(d, fill, sw(s == null ? 2 : s), ex); }
function Lw(d, col, s, ex) { return '<path d="' + d + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + f(sw(s == null ? 1 : s)) + '" stroke-linecap="round"' + (ex || "") + '/>'; }
function place(x, y, s, fn) { var w0 = W; W = 1 / s; var r = G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", fn()); W = w0; return r; }
// seconds from a line's start to one of its caption chunks
function cs(l, c) { var ch = window.CHUNKS[l] || [0]; c = Math.min(c, ch.length - 1); return (LN[l].end - LN[l].start) * (ch[c] || 0); }
function lastChunk(l) { return (window.CHUNKS[l] || [0]).length - 1; }

// ── track, side view: rail on sleepers on ballast. off scrolls the sleepers (the train moving while the camera follows) ──
function trackSide(x1, x2, off, ballast) {
  var s = "", x, sp = 12;
  if (ballast !== false) s += Pw("M" + f(x1) + " 5 H" + f(x2) + " L" + f(x2 + 10) + " 26 H" + f(x1 - 10) + " Z", BALLAST, 1.4) + '<path d="M' + f(x1) + ' 5 H' + f(x2) + ' L' + f(x2 + 10) + ' 26 H' + f(x1 - 10) + ' Z" fill="url(#hatch)" opacity=".6"/>';
  var o = ((off || 0) % sp + sp) % sp;
  for (x = x1 - o; x < x2; x += sp) s += Rw(x, 4, 6, 4.5, SLEEPER, .8);
  return s + Rw(x1, 0, x2 - x1, 4.2, STEEL, 1.2);
}
// a wheel in side view: flange behind, tread disc, hub and four holes that show it turning
function wheel(x, y, r, rot, fill) {
  var s = Cw(x, y, r * 1.1, STEEL_D, 1.4) + Cw(x, y, r, fill || STEEL, 1.6) + Cw(x, y, r * .74, "none", .8) + Cw(x, y, r * .28, STEEL_D, 1.2);
  for (var k = 0; k < 4; k++) { var a = rot + k * Math.PI / 2; s += Cw(x + Math.cos(a) * r * .52, y + Math.sin(a) * r * .52, r * .1, PAPER, .8); }
  return s;
}
function puffs(x, y, t, n, sc) {   // exhaust rising and drifting back
  var s = ""; sc = sc || 1;
  for (var j = 0; j < (n || 4); j++) { var ph = (t * .7 + j / (n || 4)) % 1; s += '<circle cx="' + f(x - ph * 34 * sc) + '" cy="' + f(y - ph * 40 * sc) + '" r="' + f((3 + ph * 11) * sc) + '" fill="#cfc9bd" stroke="' + INK + '" stroke-width="' + f(sw(.8)) + '" opacity="' + f(.9 * (1 - ph)) + '"/>'; }
  return s;
}

// ── the locomotive (ENR GE ES30ACi-like), 420 long, front at x = 420 ──
// o: rot (wheel angle), cut (0..1 cut-away of the hood), gen / motors / cur / grid / pipe / brake (0..1 highlights), t, puff
var AX = [40, 72, 104, 316, 348, 380];
function loco(o) {
  o = o || {}; var s = "", k, rot = o.rot || 0;
  [72, 348].forEach(function (cx) { s += Rw(cx - 60, -27, 120, 10, FRAME, 1.4); });
  AX.forEach(function (x) { s += wheel(x, -10, 10, rot, o.wheelFill); });
  if (o.brake) AX.forEach(function (x) { s += G("", Rw(x + 10.5, -17, 3.4, 12, ORANGE, .8), clamp(o.brake)); });
  [72, 348].forEach(function (cx) { s += Rw(cx - 56, -25, 112, 6, FRAME, 1.2) + Lw("M" + (cx - 20) + " -25 l3 -3 l-6 -2 l6 -2 l-3 -2 M" + (cx + 20) + " -25 l3 -3 l-6 -2 l6 -2 l-3 -2", INK, .9); });
  s += Rw(150, -32, 130, 18, TANK, 1.5, 5);   // fuel tank
  if (o.pipe) s += Lw("M-12 -33 H432", BLUE, 2.4 * clamp(o.pipe) + .01);
  s += Rw(-2, -40, 424, 9, FRAME, 1.6);       // underframe
  // body: radiator block at the back, long hood, cab at the front
  s += Rw(92, -82, 250, 42, BODY, 1.8) + Rw(2, -88, 92, 48, BODY_D, 1.8);
  for (k = 10; k < 90; k += 7) s += Lw("M" + k + " -82 V-48", INK, .7);
  for (k = 118; k < 336; k += 27) s += Lw("M" + k + " -80 V-44", INK, .7);
  s += Pw("M340 -40 V-90 Q340 -95 345 -95 H401 L412 -76 L421 -71 V-40 Z", BODY, 1.8);
  s += Rw(351, -87, 24, 16, GLASS, 1.1) + Pw("M383 -89 H399 L408 -75 H383 Z", GLASS, 1.1) + Rw(345, -70, 10, 28, BODY_D, 1);
  s += Rw(2, -55, 420, 5, BAND, 0) + Lw("M2 -55 H421 M2 -50 H421", INK, .8);
  s += Cw(417, -62, 3, "#f4ecdb", 1) + Rw(196, -88, 14, 6, FRAME, 1.2);
  if (o.driver) s += Cw(366, -79, 4.5, SKIN, 1) + Pw("M359 -71 Q366 -76 373 -71", SKIN2, 1);
  s += Rw(421, -24, 12, 7, FRAME, 1.1) + Rw(-12, -24, 12, 7, FRAME, 1.1);
  if (o.puff) s += puffs(203, -92, o.t || 0, 4, o.puffScale);
  // the cut-away: diesel engine → generator → cabinet
  var cut = clamp(o.cut || 0);
  if (cut > 0) {
    var e = Rw(96, -79, 242, 38, CUTP, 1.2) + '<rect x="96" y="-79" width="242" height="38" fill="url(#hatch)" opacity=".25"/>';
    var dz = o.diesel || 0, ec = dz ? ORANGE : ENG;
    e += Rw(118, -64, 128, 22, ec, 1.6, 2) + Rw(122, -42, 120, 3, FRAME, 1);
    for (k = 0; k < 8; k++) e += Rw(122 + k * 15, -72, 11, 8, dz ? "#cf7a55" : ENG_D, 1);
    if (dz) for (k = 0; k < 8; k++) { var bob = Math.sin((o.t || 0) * 14 + k * 1.7) * 1.4; e += Lw("M" + (127.5 + k * 15) + " " + f(-73 + bob) + " v-4", INK, 1); }
    e += Rw(246, -57, 8, 6, FRAME, 1);   // shaft
    var gc = o.gen ? OLIVE : "#b3ac94";
    e += Rw(254, -71, 44, 30, gc, 1.6, 6) + Cw(276, -56, 10, o.gen ? "#7b8350" : "#c4bea9", 1.2);
    var ga = (o.genRot != null ? o.genRot : rot) * 2.2;
    for (k = 0; k < 3; k++) { var a = ga + k * 2.094; e += Lw("M276 -56 L" + f(276 + Math.cos(a) * 9) + " " + f(-56 + Math.sin(a) * 9), INK, 1.2); }
    e += Rw(304, -78, 32, 36, "#c4beae", 1.3);
    for (k = 0; k < 4; k++) e += Lw("M309 " + (-72 + k * 8) + " h22", INK, .7);
    s += appear(cut, e);
  }
  if (o.motors) AX.forEach(function (x, i) { var kk = clamp(o.motors * 7 - i); if (kk > 0) s += G("", Cw(x + 14, -15, 6, OLIVE, 1.1) + Cw(x + 14, -15, 2, INK, 0), kk); });
  if (o.cur) AX.forEach(function (x, i) { s += draw("M276 -42 V-35 H" + (x + 14) + " V-21", clamp(o.cur * 1.2 - i * .04), ORANGE, sw(2.2)); });
  if (o.grid) {   // dynamic-brake resistor grid on the roof, heat rising
    s += G("", Rw(232, -94, 70, 9, "#c4beae", 1.2) + Lw("M238 -94 v9 M248 -94 v9 M258 -94 v9 M268 -94 v9 M278 -94 v9 M288 -94 v9", INK, .7), clamp(o.grid * 3));
    for (k = 0; k < 4; k++) { var ph = ((o.t || 0) * .8 + k / 4) % 1; s += G("", Lw("M" + (242 + k * 16) + " " + f(-98 - ph * 30) + " q4 -5 0 -10 q-4 -5 0 -10", ORANGE, 2), clamp(o.grid) * (1 - ph)); }
  }
  return s;
}
// ── a passenger coach, 420 long, two-axle bogies ──
var CA = [46, 94, 326, 374];
function coach(o) {
  o = o || {}; var s = "", k, rot = o.rot || 0;
  [70, 350].forEach(function (cx) { s += Rw(cx - 46, -25, 92, 9, FRAME, 1.3); });
  CA.forEach(function (x) { s += wheel(x, -9, 9, rot); });
  if (o.brake) CA.forEach(function (x) { s += G("", Rw(x + 9.5, -16, 3.2, 11, ORANGE, .8), clamp(o.brake)); });
  [70, 350].forEach(function (cx) { s += Rw(cx - 42, -23, 84, 5, FRAME, 1.1); });
  if (o.pipe) s += Lw("M-12 -31 H432", BLUE, 2.4 * clamp(o.pipe) + .01);
  s += Rw(0, -34, 420, 8, FRAME, 1.5);
  var body = o.wagon ? WAGON : COACH;
  s += Pw("M0 -34 V-78 Q0 -86 10 -86 H410 Q420 -86 420 -78 V-34 Z", o.hi ? ORANGE : body, 1.8);
  if (o.wagon) { for (k = 30; k < 420; k += 30) s += Lw("M" + k + " -84 V-36", WAGON_D, 1.4); s += Rw(170, -76, 80, 38, WAGON_D, 1.2); }
  else {
    s += Rw(0, -48, 420, 4, BAND, 0);
    for (k = 44; k < 380; k += 34) s += Rw(k, -73, 24, 16, GLASS, 1);
    s += Rw(10, -77, 18, 42, COACH_D, 1.1) + Rw(392, -77, 18, 42, COACH_D, 1.1);
    if (o.noDriver) s += G("", cross(210, -105, .45 * W * 1.4, o.noDriver), 1);
  }
  return s + Rw(421, -24, 12, 7, FRAME, 1.1) + Rw(-12, -24, 12, 7, FRAME, 1.1);
}
// ── a whole train, front at x = 0 (loco spans -420…0), vehicles 444 apart (couplers touching) ──
// o.n coaches; o.dx(i) extra shift of vehicle i (slack); o.lo / o.co options for loco / coaches; o.pipe; o.hose(i) → hose state
function train(o) {
  var s = "", n = o.n == null ? 3 : o.n, i, xs = [];
  for (i = 0; i <= n; i++) xs.push(-420 - i * 444 + (o.dx ? o.dx(i) : 0));
  if (o.pipe) for (i = 0; i < n; i++) {   // hoses between vehicles: droop from one to the next
    var a = xs[i] - 12, b = xs[i + 1] + 432, m = (a + b) / 2;
    if (o.broken === i) s += Lw("M" + f(b) + " -31 q8 10 " + f(Math.min(24, (a - b) / 3)) + " 14 M" + f(a) + " -31 q-8 10 " + f(-Math.min(24, (a - b) / 3)) + " 14", BLUE, 2.4);
    else s += Lw("M" + f(b) + " -31 Q" + f(m) + " -14 " + f(a) + " -31", BLUE, 2.4 * clamp(o.pipe) + .01);
  }
  for (i = 0; i <= n; i++) {
    var v = i === 0 ? loco(Object.assign({ pipe: o.pipe }, o.lo || {})) : coach(Object.assign({ pipe: o.pipe }, o.co || {}, o.coI ? o.coI(i) : {}));
    s += G("translate(" + f(xs[i]) + " 0)", v);
  }
  return s;
}

// ── 4 · «الجرّار»: the locomotive, side view; the hood opens on the diesel engine; thumbnail: a room ──
var ROOM = '<path d="M-38 30 V-22 L0 -40 L38 -22 V30 Z" fill="#e4d9bf" stroke="' + INK + '" stroke-width="2"/><rect x="-12" y="0" width="22" height="30" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="16" y="-10" width="14" height="12" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1.4"/>';
shot(4, push(300, 440, 1.3, 1.42), function (u, d, t) {
  var cut = at(u, cs(4, 1) + .1, .6);
  return paper() + place(-10, 520, 1.5, function () { return trackSide(-60, 520, -t * 6) + loco({ rot: t * .6, cut: cut, diesel: cut > .5 ? 1 : 0, t: t, puff: true }); }) +
    label(190, 440, 120, 610, "الجرّار", OLIVE, at(u, .4, .5), 26) +
    label(260, 410, 300, 290, "موتور ديزل", ORANGE, at(u, cs(4, 1) + .5, .5), 26) +
    iconBox(450, 230, 120, ROOM + T("قد أوضة", 0, 56, 16, INK, 700), at(u, cs(4, 1) + .9, .3));
});
// 5 · the diesel does NOT turn the wheels (✗); it turns a big generator → electricity
shot(5, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var k2 = at(u, cs(5, 1), .5), spin = t * (k2 > 0 ? 3 : .2);
  var s = paper() + place(-190, 560, 2.6, function () { return loco({ cut: 1, diesel: 1, gen: k2, genRot: spin, rot: 0, t: t }); });
  s += arrow(300, 410, 140, 520, INK, 4, at(u, .2, .5)) + cross(220, 470, 1.1, at(u, .8, .4));
  s += arrow(470, 350, 520, 350, OLIVE, 5, k2);
  for (var j = 0; j < 3; j++) { var ph = (t * 1.3 + j / 3) % 1; s += G("", '<path d="M' + f(560 + j * 20) + ' ' + f(250 - ph * 30) + ' l-10 18 h10 l-8 18" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-linejoin="round"/>', k2 * (1 - ph * .6)); }
  return s + label(530, 370, 470, 560, "مولّد", OLIVE, at(u, cs(5, 1) + .3, .5), 28) + tag("كهربا", 560, 170, at(u, cs(5, 1) + .8, .3), 30, ORANGE);
}, { tr: "in" });
// 6 · the electricity runs to six traction motors, one on every axle
shot(6, push(300, 470, 1.3, 1.22), function (u, d, t) {
  var kc = at(u, .2, 1.4), km = at(u, .6, 1.4), go = at(u, d - 1.2, 1);
  return paper() + place(-10, 540, 1.5, function () { return trackSide(-60, 520, -t * 6 * go) + loco({ cut: 1, gen: 1, genRot: t * 3, cur: kc, motors: km, rot: t * 4 * go, t: t, puff: true }); }) +
    label(124, 516, 330, 640, "موتور على كل محور", OLIVE, at(u, cs(6, 1), .5), 24) +
    AX.map(function (x, i) { return callout(String(i + 1), -10 + (x + 14) * 1.5, 540 + 16, at(u, cs(6, 1) + .2 + i * .15, .3), 12); }).join("");
}, { tr: "out" });
// 7 · why the detour? «؟» over the chain diesel → generator → motor, then the pull curve: the electric motor pulls hardest at zero speed
shot(7, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper(), ic = [["ديزل", ENG, 140], ["مولّد", OLIVE, 320], ["موتور", OLIVE, 500]];
  ic.forEach(function (q, i) { s += G("", Rw(q[2] - 70, 330, 140, 90, q[1], 2.2, 8) + T(q[0], q[2], 388, 28, i ? "#fff" : INK, 800), at(u, .1 + i * .2, .3)); if (i) s += arrow(q[2] - 106, 375, q[2] - 76, 375, INK, 4, at(u, .3 + i * .2, .3)); });
  s += draw("M140 440 C140 560 500 560 500 440", at(u, .8, .6), ORANGE, 4, ' stroke-dasharray="10 8"') + T("؟", 320, 290, 110 + 6 * Math.sin(t * 4), ORANGE, 800);
  return s;
});
shot([7, 1], push(330, 400, 1.02, 0.98), function (u, d, t) {
  var s = paper(), k = at(u, .2, 1.2), ox = 110, oy = 560, gw = 440, gh = 340;
  s += Lw("M" + ox + " " + (oy - gh - 20) + " V" + oy + " H" + (ox + gw + 20), INK, 3) + arrow(ox, oy - gh, ox, oy - gh - 30, INK, 3) + arrow(ox + gw, oy, ox + gw + 30, oy, INK, 3);
  s += T("الشد", ox + 40, oy - gh - 24, 24, INK, 800) + T("السرعة", ox + gw - 10, oy + 40, 24, INK, 800);
  var e = "", g = "", i;
  for (i = 0; i <= 40; i++) { var x = i / 40; e += (i ? " L" : "M") + f(ox + x * gw) + " " + f(oy - gh * (x < .22 ? .95 : .95 * .22 / x * .98 + .02)); g += (i ? " L" : "M") + f(ox + x * gw) + " " + f(oy - gh * .55 * Math.sin(Math.min(1, x * 1.6) * Math.PI / 2) * (x < .04 ? x / .04 * .3 : 1)); }
  s += draw(g, at(u, .4, 1), MUTE, 4) + draw(e, k, ORANGE, 5);
  s += G("", T("ديزل لوحده", ox + gw * .62, oy - gh * .62, 22, MUTE, 800), at(u, 1.2, .4)) + G("", T("موتور كهربا", ox + gw * .55, oy - gh * .2 - 70, 24, ORANGE, 800), at(u, 1.2, .4));
  var pr = 1 + .25 * Math.sin(t * 6);
  s += G("", '<circle cx="' + ox + '" cy="' + f(oy - gh * .95) + '" r="' + f(11 * pr) + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>', at(u, 1, .3)) + tag("أقوى شد وهو واقف", ox + 230, oy - gh - 80, at(u, 1.3, .3), 24, ORANGE);
  return s + place(150 + 300 * clamp((u - 1.5) / (d - 1.5)) * clamp((u - 1.5) / (d - 1.5)), 700, .45, function () { return trackSide(-500, 600, 0) + loco({ rot: u * 3 }); });
});
// 8 · a steel wheel on a steel rail: why doesn't it slip? (close-up, the wheel turning)
function bigWheel(cx, cy, r, rot, op) {
  op = op || {}; var s = "";
  s += Pw("M-200 " + f(cy + r + 20) + " H840 L860 " + f(cy + r + 160) + " H-220 Z", BALLAST, 2) + '<path d="M-200 ' + f(cy + r + 20) + ' H840 L860 ' + f(cy + r + 160) + ' H-220 Z" fill="url(#hatch)" opacity=".6"/>';
  for (var x = -200 - ((op.off || 0) % 120 + 120) % 120; x < 840; x += 120) s += R(x, cy + r + 44, 60, 40, SLEEPER, 1.8);
  s += C(cx, cy, r * 1.09, STEEL_D, 2.4) + C(cx, cy, r, op.fill || STEEL, 2.6) + C(cx, cy, r * .74, "none", 1.6) + C(cx, cy, r * .3, STEEL_D, 2.2) + C(cx, cy, r * .12, INK, 0);
  for (var k = 0; k < 4; k++) { var a = rot + k * Math.PI / 2; s += C(cx + Math.cos(a) * r * .52, cy + Math.sin(a) * r * .52, r * .09, PAPER, 1.8); }
  s += R(-200, cy + r - 2, 1040, 44, STEEL, 2.4) + '<path d="M-200 ' + f(cy + r + 14) + ' H840" stroke="' + INK + '" stroke-width="1.4"/>';
  return s;
}
shot(8, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var slip = .5 + .5 * Math.sin(t * 2.4);
  var s = paper() + bigWheel(330, 380, 170, t * 2.6);
  s += G("", Lw("M120 570 h-60 M140 590 h-80 M120 610 h-50", INK, 3), slip * at(u, .8, .4));
  return s + label(250, 300, 120, 160, "حديد", MUTE, at(u, .3, .5), 30) + label(540, 568, 560, 700, "حديد", MUTE, at(u, .7, .5), 30) + T("؟", 500, 220, 130, ORANGE, 800);
}, { tr: "in" });
// 9 · the weight holds it: more than 100 tonnes pressing the wheels on the rail
shot(9, push(330, 420, 1.06, 0.98), function (u, d, t) {
  var k = at(u, cs(9, 1), 1.2), s = paper() + bigWheel(330, 420, 150, t * 1.6);
  s += place(170, 170, .75, function () { return Pw("M-120 40 L-90 -60 H90 L120 40 Z", FRAME, 2) + T("طن", 0, 20, 44, "#fff", 800); });
  for (var i = -1; i <= 1; i++) s += arrow(330 + i * 70, 220, 330 + i * 40, 300 + 6 * Math.sin(t * 5 + i), ORANGE, 7, at(u, .5 + Math.abs(i) * .15, .4));
  s += '<ellipse cx="330" cy="572" rx="' + f(26 + 6 * Math.sin(t * 6)) + '" ry="8" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(k) + '"/>';
  return s + bigNum("+" + count(100, k), "طن", 520, 120, at(u, cs(9, 1) - .1, .3), ORANGE, 70);
});
// 10 · wet rail: the loco sprays sand in front of the wheel; thumbnail: sand under a stuck tyre
var TYRE = '<path d="M-50 22 H50" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="-4" r="24" fill="' + TIRE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="-4" r="10" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="1.6"/>' +
  [[-30, 20], [-20, 24], [-8, 22], [6, 25], [18, 21], [30, 24], [-14, 18], [12, 18]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + SAND_SIDE + '" stroke="' + INK + '" stroke-width=".8"/>'; }).join("");
shot(10, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var s = paper() + bigWheel(260, 420, 140, t * 2.2);
  for (var i = 0; i < 9; i++) { var x = -150 + ((i * 117 + t * 20) % 1000); s += '<ellipse cx="' + f(x) + '" cy="560" rx="14" ry="4" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.2" opacity=".85"/>'; }
  var ks = at(u, cs(10, 1), .4);
  s += G("", R(420, 150, 120, 110, KHAKI, 2.4) + T("رملة", 480, 214, 26, INK, 800) + P("M450 260 L430 520 L452 524 L476 260", "#b9ad92", 2.2), ks);
  if (ks > 0) for (i = 0; i < 26; i++) { var ph = (t * 1.6 + hash(i)) % 1; s += C(440 + hash(i + 7) * 14 - ph * 6, 520 + ph * 38, 3.4, SAND_SIDE, 1); }
  s += G("", '<path d="M380 556 H520" stroke="' + SAND_SIDE + '" stroke-width="7" stroke-linecap="round"/>', ks);
  return s + label(160, 560, 100, 690, "مبلول", BLUE, at(u, .3, .5), 26) + label(480, 205, 600, 380, "", INK, 0) + iconBox(130, 140, 150, TYRE, at(u, cs(10, 2), .3));
});
// 11 · steel on steel rolls easily: the resistance bar of a tyre on asphalt is about five times longer
shot(11, push(320, 400, 1.02, 0.98), function (u, d, t) {
  var s = paper(), k = at(u, .5, 1.2);
  s += place(150, 300, 1, function () { return Rw(-110, 40, 220, 14, STEEL, 2) + wheel(0, -10, 50, t * 3); });
  s += place(150, 560, 1, function () { return Rw(-110, 40, 220, 16, "#8d8a84", 2) + '<circle cx="0" cy="-10" r="52" fill="' + TIRE + '" stroke="' + INK + '" stroke-width="2"/>' + wheel(0, -10, 28, t * 3); });
  s += R(260, 270, 50 * k, 34, BLUE, 2) + R(260, 530, 250 * k, 34, ORANGE, 2);
  s += T("حديد على حديد", 400, 250, 24, INK, 800) + T("كاوتش على أسفلت", 400, 510, 24, INK, 800);
  return s + numBox("×5", 460, 650, at(u, 1.6, .3), 46) + G("", T("أسهل", 260, 360, 24, BLUE, 800, "end"), at(u, 1.2, .3));
});
// 12 · how does it pull them all? the whole train, far
shot(12, push(330, 430, 1.25, 1.12), function (u, d, t) {
  return paper() + place(620, 470, .5, function () { return trackSide(-1900, 60, -t * 30) + train({ n: 3, lo: { rot: t * 3, puff: true, t: t, puffScale: 1.6 }, co: { rot: t * 3 } }); }) + T("؟", 320, 330, 120, ORANGE, 800);
}, { tr: "out" });
// 13 · between every two cars, a knuckle coupler (seen from above) with a little free play
function knuckle(x, y, flip, fill) {
  var tr = "translate(" + f(x) + " " + f(y) + ")" + (flip ? " rotate(180)" : "");
  return G(tr, R(-240, -16, 170, 32, STEEL_D, 2.2) + P("M-70 -50 H60 V10 H40 V-20 H0 V50 H-70 Z", fill || STEEL, 2.6) + C(-36, 0, 9, PAPER, 2));
}
shot(13, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var slack = 70 + 10 * Math.sin(t * 2.2) * at(u, .4, .6) + 10 * at(u, cs(13, 1), .6), cx = 300;
  var s = paper() + R(-200, 200, 250, 400, COACH, 2.4) + R(cx * 2 - 50 + 20, 200, 300, 400, COACH, 2.4);
  s += knuckle(cx - 40, 400, false, appear ? STEEL : STEEL) + knuckle(cx - 40 + slack, 400, true);
  s += label(cx - 120, 384, 160, 250, "شبك", OLIVE, at(u, .3, .5), 28);
  var kk = at(u, cs(13, 1), .5);
  s += G("", '<path d="M' + f(cx - 40 + slack - 40) + ' 400 H' + f(cx) + '" stroke="' + ORANGE + '" stroke-width="4"/>' + '<path d="M' + f(cx - 40 + slack - 40) + ' 388 v24 M' + f(cx) + ' 388 v24" stroke="' + ORANGE + '" stroke-width="4"/>', kk);
  return s + tag("مسافة سايبة", 330, 620, kk, 30, ORANGE) + T("من فوق", 560, 150, 18, MUTE, 700);
}, { tr: "in" });
// 14 · the loco takes up the slack one coupler at a time: car 1 moves, then 2, then 3
shot(14, pan(600, 460, 180, 460, 1.4), function (u, d, t) {
  var S = 46, sp = 34, d0 = Math.max(0, (u - .3) * sp + .5 * 6 * Math.max(0, u - .3) * Math.max(0, u - .3));
  var dx = function (i) { return Math.max(0, d0 - i * S); };
  var SC = .62, X0 = 900;
  var s = paper() + place(X0, 500, SC, function () { return trackSide(-2000, 1200, 0) + train({ n: 3, dx: dx, lo: { rot: dx(0) / 10, puff: d0 > 0, t: t }, coI: function (i) { return { rot: dx(i) / 9, hi: false }; } }); });
  for (var i = 1; i <= 3; i++) { var on = dx(i) > 0, x = X0 + (-420 - i * 444 + 210 + dx(i)) * SC; s += callout(String(i), x, 400, on ? 1 : 0, 20) + G("", arrow(x - 30, 370, x + 30, 370, ORANGE, 4), on ? 1 : 0); }
  return s;
});
// 15 · like pulling a chain lying slack on the floor: link after link goes taut
shot(15, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper() + R(-200, 520, 1040, 300, BEIGE, 2), N = 14, pull = Math.max(0, (u - .3) * 5.5), i;
  s += '<path d="M-200 520 H840" stroke="' + INK + '" stroke-width="2.4"/>';
  var pts = [];
  for (i = 0; i < N; i++) {   // link 0 is the far end (left); the pull comes from the right
    var taut = clamp(pull - (N - 1 - i)), lx = 40 + i * 38 + pull * 6, ly = lerp(500 - 46 * Math.abs(Math.sin(i * 1.1)) * (i % 3 === 1 ? 1 : .4), 420, taut);
    pts.push([lx, ly, taut]);
  }
  pts.forEach(function (p, i) { var col = p[2] >= 1 ? ORANGE : STEEL; s += i % 2 ? '<rect x="' + f(p[0] - 20) + '" y="' + f(p[1] - 5) + '" width="40" height="10" rx="5" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2"/>' : '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="22" ry="12" fill="none" stroke="' + INK + '" stroke-width="7"/><ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="22" ry="12" fill="none" stroke="' + col + '" stroke-width="4"/>'; });
  var e = pts[N - 1]; s += arrow(e[0] + 24, e[1], e[0] + 110, e[1], INK, 6);
  return s + label(pts[3][0], pts[3][1], 140, 280, "حلقة ورا حلقة", ORANGE, at(u, cs(15, 1), .5), 26);
}, { tr: "out" });
// 16 · and how does it stop? the train running fast
shot(16, push(420, 470, 1.22, 1.3), function (u, d, t) {
  return paper() + place(640, 520, .95, function () { return trackSide(-1300, 200, -t * 140) + train({ n: 2, lo: { rot: t * 14, puff: true, t: t * 3, puffScale: 1.3 }, co: { rot: t * 14 } }); }) +
    Lw("M560 380 h60 M580 410 h50 M560 440 h70", INK, 3) + T("؟", 300, 300, 120, ORANGE, 800);
});
// 17 · a compressed-air pipe runs under the whole train, front to back (air flowing in it)
shot(17, push(360, 470, 1.28, 1.36), function (u, d, t) {
  var k = at(u, .3, 1.6);
  var s = paper() + place(700, 540, .95, function () {
    var r = trackSide(-1400, 100, 0) + train({ n: 2, pipe: 1, lo: { rot: 0 }, co: {} });
    r = r.replace(/stroke="#4a6f8a" stroke-width="[0-9.]+"/g, 'stroke="' + BLUE + '" stroke-width="' + f(sw(1.2)) + '" opacity=".35"');   // pipe ghost first
    r += sweep(-1400, -60, 1500, 80, k, "l", train({ n: 2, pipe: 1, lo: {}, co: {} }).match(/<path d="[^"]*" fill="none" stroke="#4a6f8a"[^>]*\/>/g).join(""));
    for (var i = 0; i < 26; i++) { var x = -(((i * 52 + t * 120) % 1330)); if (-x < k * 1330) r += Cw(x, -32, 3.2, "#cfe0ea", .8); }
    return r;
  });
  return s + label(330, 510, 330, 650, "ماسورة هوا مضغوط", BLUE, at(u, .8, .5), 26);
});
// 18–19 · one car's brake gear (side view): brake pipe, valve, auxiliary reservoir, brake cylinder, shoe on the wheel
function brakeRig(t, pipeP, apply, spin) {
  var s = "", cx = 210, cy = 470, r = 130, gap = 16 * (1 - apply);
  s += bigWheel(cx, cy, r, spin);
  // brake pipe along the top, the valve, the reservoir, the cylinder
  s += R(-200, 250, 1040, 22, lerp(PAPER, 0, 0) || PAPER, 2.2) + '<rect x="-200" y="252" width="1040" height="18" fill="' + BLUE + '" opacity="' + f(.15 + .85 * pipeP) + '"/>';
  s += R(540, 272, 16, 80, PAPER, 2) + '<rect x="542" y="274" width="12" height="76" fill="' + BLUE + '" opacity="' + f(.15 + .85 * pipeP) + '"/>';
  s += R(500, 350, 100, 60, "#c4beae", 2.4, 6) + T("صمام", 550, 388, 20, INK, 800);
  s += '<rect x="410" y="140" width="210" height="80" rx="38" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.6"/><rect x="414" y="144" width="202" height="72" rx="34" fill="' + BLUE + '" opacity="' + f(.95 - .45 * apply) + '"/>';
  s += R(430, 220, 14, 130, PAPER, 2) + '<rect x="432" y="222" width="10" height="126" fill="' + BLUE + '" opacity="' + f(.9 - .4 * apply) + '"/>';
  s += R(380, 430, 120, 80, PAPER, 2.6, 6) + '<rect x="' + f(384) + '" y="434" width="' + f(30 + 80 * apply) + '" height="72" fill="' + BLUE + '" opacity="' + f(.15 + .85 * apply) + '"/>';
  s += R(470, 410, 30, 40, PAPER, 2) + '<path d="M500 420 H520 V410" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  var px = 414 + 80 * apply;   // piston face (moves left as air fills the right side)… drawn as a rod to the shoe
  var sx = cx + r + 6 + gap;
  s += R(sx + 20, 462, (384 + 4) - (sx + 20), 16, STEEL_D, 2);
  s += '<path d="M' + f(sx) + ' ' + f(cy - 70) + ' A' + (r + 6 + gap) + ' ' + (r + 6 + gap) + ' 0 0 1 ' + f(sx) + ' ' + f(cy + 70) + '" fill="none" stroke="' + INK + '" stroke-width="30"/>' +
       '<path d="M' + f(sx) + ' ' + f(cy - 68) + ' A' + (r + 6 + gap) + ' ' + (r + 6 + gap) + ' 0 0 1 ' + f(sx) + ' ' + f(cy + 68) + '" fill="none" stroke="' + (apply > .9 ? ORANGE : WOOD) + '" stroke-width="25"/>';
  return s;
}
function gauge(x, y, p, label_) {
  var a = Math.PI * (1.15 - 1.3 * p), s = C(x, y, 46, "#f4ecdb", 2.4);
  for (var i = 0; i <= 6; i++) { var b = Math.PI * (1.15 - 1.3 * i / 6); s += '<path d="M' + f(x + Math.cos(b) * 34) + ' ' + f(y - Math.sin(b) * 34) + ' L' + f(x + Math.cos(b) * 42) + ' ' + f(y - Math.sin(b) * 42) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * 34) + ' ' + f(y - Math.sin(a) * 34) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0) + (label_ ? T(label_, x, y + 70, 20, INK, 700) : "");
}
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + brakeRig(t, 1, 0, t * 2.6);
  for (var i = 0; i < 8; i++) { var x = -200 + ((i * 130 + t * 90) % 1040); s += C(x, 261, 4, "#cfe0ea", 1); }
  return s + gauge(110, 120, .85 + .03 * Math.sin(t * 3), "ضغط الماسورة") + label(130, 261, 330, 318, "مليانة هوا", BLUE, at(u, .3, .5), 24) + tag("الفرامل مفتوحة", 330, 700, at(u, cs(18, 1), .3), 30, OLIVE) + G("", measure(353, 470, 369, 470, 1, ""), at(u, cs(18, 1), .3));
}, { tr: "in" });
shot(19, push(320, 420, 1.05, 1.0), function (u, d, t) {
  var c1 = cs(19, 1), c2 = cs(19, 2), p = 1 - .6 * at(u, .2, 1.0), ap = at(u, c2, .6), spin = t * 2.6 * (1 - ap) + (ap > 0 ? 0 : 0);
  var s = paper() + brakeRig(t, p, ap, LN[19].start * 2.6 + Math.min(u, c2) * 2.6 + (u > c2 ? (1 - Math.exp(-(u - c2) * 3)) * .9 : 0));
  // air escaping from the pipe end (the driver's valve)
  for (var i = 0; i < 4; i++) { var ph = (t * 1.5 + i / 4) % 1; s += G("", '<path d="M' + f(20 - ph * 120) + ' ' + f(250 - 20 + i * 12) + ' h-30" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round"/>', (1 - ph) * (1 - at(u, c1 + .6, .5))); }
  // air from the reservoir through the valve into the cylinder
  var fl = at(u, c1, .4) * (1 - at(u, c2 + 1.2, .5));
  for (i = 0; i < 6; i++) { var q = (t * 1.2 + i / 6) % 1, pt = q < .5 ? [437, 225 + q * 2 * 120] : [437 - (q - .5) * 2 * 0, 345 + (q - .5) * 2 * 90]; s += G("", C(pt[0], pt[1], 6, "#cfe0ea", 1.4), fl); }
  s += gauge(110, 120, .85 * p) + label(450, 160, 380, 90, "خزان هوا", BLUE, at(u, c1, .5), 26) + label(355, 420, 220, 250 + 30, "", INK, 0);
  if (ap > .9) for (i = 0; i < 6; i++) { var a = -0.5 + i * .2; s += '<path d="M' + f(210 + Math.cos(a) * 150) + ' ' + f(470 + Math.sin(a) * 150) + ' l' + f(Math.cos(a) * 18) + ' ' + f(Math.sin(a) * 18) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(.5 + .5 * Math.sin(t * 9 + i)) + '"/>'; }
  return s + label(352, 560, 420, 660, "تيل الفرامل", ORANGE, at(u, c2 + .3, .5), 26);
});
// 20 · the traction motors turn into generators: they brake the train and their power becomes heat on the roof
shot(20, push(300, 450, 1.25, 1.32), function (u, d, t) {
  var k = at(u, .3, 1.2), slow = Math.max(.25, 1 - u / d);
  return paper() + place(-10, 540, 1.5, function () { return trackSide(-60, 520, -t * 6 * slow) + loco({ cut: 1, motors: 1, rot: t * 4 * slow, t: t, grid: at(u, cs(20, 1), .6) }) + G("", AX.map(function (x) { return draw("M" + (x + 14) + " -21 V-35 H266 V-90", k, ORANGE, sw(2.2)); }).join(""), 1); }) +
    label(-10 + 118 * 1.5, 540 - 15 * 1.5, 300, 660, "مولدات", OLIVE, at(u, .4, .5), 28) + label(-10 + 266 * 1.5, 540 - 98 * 1.5, 420, 260, "حرارة", ORANGE, at(u, cs(20, 1) + .3, .5), 28);
}, { tr: "out" });
// 21 · the myth: a train stopping as short as a car — crossed out
var CAR = function (x, y) { return place(x, y, 1, function () { return Pw("M-60 -10 V-30 Q-56 -38 -40 -40 L-26 -58 H22 L40 -40 Q58 -38 60 -28 V-10 Z", "#b9c4b4", 2) + '<circle cx="-34" cy="-8" r="13" fill="' + TIRE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="34" cy="-8" r="13" fill="' + TIRE + '" stroke="' + INK + '" stroke-width="2"/>' + Rw(-20, -54, 18, 12, GLASS, 1.2) + Rw(4, -54, 16, 12, GLASS, 1.2); }); };
shot(21, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, 1.2), s = paper();
  s += '<path d="M-200 300 H840" stroke="' + INK + '" stroke-width="3"/>' + CAR(lerp(120, 330, k), 300) + G("", '<path d="M400 230 V310" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 6"/>', k);
  s += place(lerp(260, 400, k), 580, .5, function () { return trackSide(-1000, 200, 0) + train({ n: 1, lo: { rot: k * 9, brake: k }, co: { rot: k * 9, brake: k } }); }) + G("", '<path d="M410 480 V600" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 6"/>', k);
  return s + check(500, 250, 1, at(u, .9, .4), OLIVE) + cross(500, 520, 1.5, at(u, cs(21, lastChunk(21)), .5));
});
// 22 · a freight train at 80 km/h may need more than 1.5 km to stop
shot(22, push(320, 420, 1.02, 0.98), function (u, d, t) {
  var k = at(u, .4, d - 1.2), x = lerp(150, 590, 1 - Math.pow(1 - k, 2)), s = paper();
  s += place(0, 470, .2, function () { return trackSide(-500, 3600, 0, false); });
  s += place(x, 470, .2, function () { return train({ n: 5, lo: { rot: k * 40, brake: k > 0 ? 1 : 0 }, co: { wagon: true, rot: k * 40, brake: k > 0 ? 1 : 0 } }); });
  s += numBox("80", 130, 330, at(u, .1, .3), 40) + T("كيلو في الساعة", 130, 390, 20, INK, 700);
  s += measure(150, 540, 590, 540, k, "") + G("", N(count(1.5, k, 1), 370, 640, 70, ORANGE) + T("كيلو", 370, 690, 30, INK, 800), at(u, .5, .4));
  return s;
});
// 23 · «يعني من الآخر»: the four parts, labelled in turn
shot(23, push(300, 450, 1.22, 1.3), function (u, d, t) {
  var c = function (n) { return cs(23, Math.min(n, lastChunk(23))) + .1; };
  return paper() + place(-10, 520, 1.5, function () { return trackSide(-60, 520, -t * 6) + loco({ cut: 1, diesel: 1, gen: 1, genRot: t * 3, motors: 1, cur: 1, rot: t * 4, t: t, pipe: at(u, c(4), .5), puff: true }); }) +
    label(260, 430, 340, 260, "ديزل ← كهربا", ORANGE, at(u, c(1), .5), 26) + label(124, 516, 300, 650, "الكهربا تلف العجل", OLIVE, at(u, c(2), .5), 24) +
    G("", arrow(500, 290, 500, 400, ORANGE, 7) + T("الوزن", 500, 275, 24, ORANGE, 800), at(u, c(3), .4)) + label(560, 470, 520, 640, "الهوا يفرمل", BLUE, at(u, c(4) + .2, .5), 24);
}, { tr: "out" });
// 24 · the odd fact: a car comes loose, the hose tears, the air rushes out, both halves brake on their own ✓
shot(24, push(420, 480, 1.3, 1.38), function (u, d, t) {
  var sp = at(u, .3, .8), stop = at(u, cs(24, 2), 1.5), gapX = 120 * sp, s = paper();
  var dx = function (i) { return i >= 1 ? -gapX : 0; };
  s += place(860, 520, .9, function () {
    var r = trackSide(-1200, 120, -t * 60 * (1 - stop)) + train({ n: 1, pipe: 1, broken: sp > .05 ? 0 : -1, dx: dx, lo: { rot: t * 6 * (1 - stop), brake: stop }, co: { rot: t * 6 * (1 - stop), brake: stop } });
    if (sp > .05) for (var i = 0; i < 5; i++) { var ph = (t * 2 + i / 5) % 1; r += G("", Lw("M" + f(-432 - gapX / 2 - 10 - ph * 40) + " " + f(-20 + i * 6) + " h-30 M" + f(-432 - gapX / 2 + 10 + ph * 40) + " " + f(-20 + i * 6) + " h30", BLUE, 3), (1 - ph) * (1 - stop * .7)); }
    return r;
  });
  return s + tag("اتفكت", 420, 330, at(u, .5, .3), 30, ORANGE) + check(420, 600, 1.2, at(u, cs(24, lastChunk(24)) + .2, .5), OLIVE);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // 0: the train coming into the station; 1: one loco pulling the cars (scale icon); 2: all brake together, one driver
  var l2 = LN[2], stopK = li >= 2 ? clamp((t - l2.start) / 1.6) : 0, v = 90 * (1 - stopK * stopK * (3 - 2 * stopK));
  var off = li >= 2 ? 90 * l2.start + 90 * 1.6 * (stopK - stopK * stopK * stopK / 3 * 0 - stopK * stopK * .5 + stopK * stopK * stopK * .17) : 90 * t;
  var s = R(-20, 520, 660, 160, BEIGE, 2) + '<path d="M-20 520 H640" stroke="' + INK + '" stroke-width="2.4"/>';
  s += place(610, 500, .78, function () { return trackSide(-1400, 100, -off) + train({ n: 2, lo: { rot: off / 10, puff: true, t: t, driver: li >= 2, brake: stopK }, co: { rot: off / 9, brake: stopK }, coI: function () { return li >= 2 ? { noDriver: clamp((t - l2.start - .8) / .5) } : {}; } }); });
  if (li >= 1) {
    var u = t - LN[1].start;
    s += iconBox(500, 150, 150, '<path d="M-60 6 L60 -14" stroke="' + INK + '" stroke-width="4"/><path d="M0 -4 L-10 30 H10 Z" fill="' + INK + '"/>' + R(-58, -12, 30, 18, OLIVE, 1.6) + R(18, -54, 44, 42, BLUE, 1.6) + N("1", -43, -20, 18) + N("10", 40, -60, 18), ease(u / .4));
    s += G("", T("1", 500, 340, 36, OLIVE, 800), ease((u - .6) / .3));
  }
  if (li >= 2) s += check(530, 300, .7, clamp((t - l2.start - .4) / .4), OLIVE);
  return s;
};
SCENE.bumper = function (u, t) {
  return place(170, 160, .36, function () { return trackSide(-440, 20, -t * 40) + loco({ rot: t * 4, puff: true, t: t }); });
};
SCENE.outro = function (svg, u, t) {
  var X = 30, Y = 230, S = 1.28;
  return place(X, Y, S, function () { return trackSide(-20, 440, 0) + loco({ cut: 1, gen: 1, genRot: t * 3, motors: 1, rot: t * 2, t: t, pipe: 1 }); }) +
    callout("1", X + 180 * S, Y - 100 * S, ease(u / .3)) + callout("2", X + 276 * S, Y - 100 * S, ease(u / .3 - .5)) + callout("3", X + 54 * S, Y + 22 * S, ease(u / .3 - 1)) + callout("4", X + 330 * S, Y + 10 * S, ease(u / .3 - 1.5));
};
