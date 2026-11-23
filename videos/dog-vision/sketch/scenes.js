window.CHUNKS = [[0.0], [0.0], [0.0, 0.3103], [0.0, 0.4194], [0.0], [0.0, 0.3373, 0.6145], [0.0, 0.4933, 0.7467], [0.0, 0.2167, 0.8], [0.0, 0.3594], [0.0, 0.4667], [0.0, 0.6667], [0.0, 0.431], [0.0, 0.451], [0.0, 0.5714], [0.0, 0.5424], [0.0], [0.0, 0.1235, 0.4444, 0.5802], [0.0, 0.5833], [0.0, 0.3438, 0.7188], [0.0, 0.2404, 0.4231, 0.7404], [0.0, 0.5435], [0.0, 0.3425, 0.6849], [0.0, 0.1948, 0.3636, 0.5584], [0.0, 0.3021, 0.5938], [0.0], [0.0]];
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

// ── the dog: a medium short-coated mixed-breed («بلدي») dog drawn from real proportions (refs/SOURCES.md) ──
// Side view, facing right in its own coordinates (dir: -1 mirrors it). Units: the height at the withers = 100 at s = 1,
// body length (point of shoulder → point of buttock) ≈ 1.1 × that, head ≈ 0.42 × withers (skull ≈ muzzle, a clear stop),
// chest down to the elbow (≈ half the height), a tucked-up loin, the hind leg angled at the stifle and the hock, pricked
// ears and a tail carried up. Legs are one flowing outline each (no joint circles), like the person kit.
var FAWN = "#c99a62", FAWN_D = "#a8794a", FAWN_L = "#dcb784", CREAM = "#efe0c0", DNOSE = "#2b231c", EAR_IN = "#d9a186";
// a smooth outline through pts (quadratic through the midpoints)
function smooth(pts, close) {
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  var Lp = pts[pts.length - 1]; return d + (close ? " Q" + f(Lp[0]) + " " + f(Lp[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(Lp[0]) + " " + f(Lp[1]));
}
// a tapered limb through pts with a width at each point: {fill: closed, line: open at the top so it melts into the body}
function tube(pts, ws) {
  var Lf = [], Rt = [], n = pts.length;
  for (var i = 0; i < n; i++) {
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = ws[i] / 2;
    Lf.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Rt.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  var e = pts[n - 1], pe = pts[n - 2], dx2 = e[0] - pe[0], dy2 = e[1] - pe[1], dl = Math.hypot(dx2, dy2) || 1, tip = [e[0] + dx2 / dl * ws[n - 1] * .45, e[1] + dy2 / dl * ws[n - 1] * .45];
  var ring = Lf.concat([tip]).concat(Rt.slice().reverse());
  return { fill: smooth(ring, true), line: smooth(ring, false) };
}
function rotP(p, c, deg) { var a = deg * Math.PI / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; }
// a paw seen from the side: a rounded pad block with two toe creases; x,y = the ground point under it
function paw(w, col) { return '<path d="M' + f(-w * .45) + ' 0 C' + f(-w * .55) + ' ' + f(-w * .55) + ' ' + f(-w * .1) + ' ' + f(-w * .72) + ' ' + f(w * .3) + ' ' + f(-w * .6) + ' C' + f(w * .62) + ' ' + f(-w * .5) + ' ' + f(w * .72) + ' ' + f(-w * .2) + ' ' + f(w * .66) + ' 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M' + f(w * .22) + ' 0 q' + f(w * .02) + ' ' + f(-w * .2) + ' ' + f(-w * .02) + ' ' + f(-w * .34) + ' M' + f(w * .46) + ' 0 q' + f(w * .02) + ' ' + f(-w * .16) + ' ' + f(-w * .04) + ' ' + f(-w * .28) + '" stroke="' + INK + '" stroke-width="1.1" fill="none"/>'; }
// leg chains in dog units (facing right). Front: shoulder → elbow → wrist (carpus) → paw. Hind: hip → stifle → hock → paw.
function frontLeg(sw, lift) {
  var top = [38, -76], el = rotP([27, -50], top, sw), wr = rotP([29, -17], top, sw), pw = rotP([32, -6], top, sw);
  if (lift) { wr = [wr[0] - 5 * lift, wr[1] - 6 * lift]; pw = [wr[0] + 6 - 3 * lift, wr[1] + 10 - 3 * lift]; }
  return { pts: [top, el, wr, pw], ws: [22, 13, 9, 8.5], paw: pw };
}
function hindLeg(sw, lift) {
  var top = [-42, -74], st = rotP([-31, -46], top, sw), hk = rotP([-50, -22], top, sw), pw = rotP([-47, -6], top, sw);
  if (lift) { hk = [hk[0] - 3 * lift, hk[1] - 7 * lift]; pw = [hk[0] + 5 + 2 * lift, hk[1] + 15 - 5 * lift]; }
  return { pts: [top, st, hk, pw], ws: [32, 17, 8.5, 8.5], paw: pw };
}
// o: {x, y (ground under the middle of the body), s, dir, ph (walk phase, radians), walk (0..1), head (deg, + nose down),
//     tail (deg, wag), sniff (0..1 nostril twitch), mouth (0..1 open, panting), eyes (0..1), legsUp: lift all paws (sitting not used)}
// returns {svg, nose: [x,y] world point of the nose tip, eye: [x,y], head: [x,y] world centre of the skull}
function dog(o) {
  o = o || {}; var s = o.s || 1, dir = o.dir || 1, ph = o.ph || 0, wk = o.walk || 0, hd = o.head || 0, tl = o.tail || 0;
  var bob = wk ? -1.5 * Math.abs(Math.sin(ph)) : 0;
  function W(p) { return [o.x + dir * p[0] * s, o.y + (p[1] + bob) * s]; }
  function Wl(pts) { return pts.map(W); }
  function leg(L, col, colD) {
    var tb = tube(Wl(L.pts), L.ws.map(function (v) { return v * s; })), pw = W(L.paw);
    return '<path d="' + tb.fill + '" fill="' + col + '"/>' + '<path d="' + tb.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' +
      G("translate(" + f(pw[0] + dir * 3 * s) + " " + f(pw[1] + 6 * s) + ") scale(" + dir + " 1)", paw(15 * s, colD || col));
  }
  var swF = wk * 20 * Math.sin(ph), swH = -wk * 20 * Math.sin(ph), lfF = wk * clamp(Math.cos(ph)) * .9, lfH = wk * clamp(-Math.cos(ph)) * .9;
  var swF2 = wk * 20 * Math.sin(ph + Math.PI), swH2 = -wk * 20 * Math.sin(ph + Math.PI), lfF2 = wk * clamp(Math.cos(ph + Math.PI)) * .9, lfH2 = wk * clamp(-Math.cos(ph + Math.PI)) * .9;
  var svg = "";
  // far legs (darker, a step behind)
  svg += leg(frontLeg(swF2 - 4, lfF2), FAWN_D, FAWN_D) + leg(hindLeg(swH2 + 3, lfH2), FAWN_D, FAWN_D);
  // tail: set at the croup, carried up in a loose curve, wagging about its root
  var tr = [-50, -94], tp = [[-50, -94], [-64, -106], [-71, -122], [-68, -137], [-58, -143]].map(function (p) { return rotP(p, tr, -tl); });
  var tb = tube(Wl(tp), [11, 10, 8.5, 6.5, 3.5].map(function (v) { return v * s; }));
  svg += '<path d="' + tb.fill + '" fill="' + FAWN + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>';
  // torso: withers → back → croup → buttock → thigh → tucked belly → brisket → chest front
  var torso = [[22, -101], [0, -98], [-24, -97], [-42, -97], [-54, -92], [-61, -80], [-62, -66], [-56, -54], [-44, -50], [-34, -58], [-20, -63], [0, -57], [18, -48], [32, -45], [44, -50], [52, -62], [55, -76], [48, -92]];
  var tp2 = Wl(torso), td = smooth(tp2, true);
  svg += '<path d="' + td + '" fill="' + FAWN + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>';
  // shade under the belly and at the back of the thigh, light hatching on the far side, a few hair strokes
  var cid = "dg" + (++CLIPN);
  svg += '<clipPath id="' + cid + '"><path d="' + td + '"/></clipPath><g clip-path="url(#' + cid + ')">' +
    '<path d="' + smooth(Wl([[-60, -58], [-36, -54], [-16, -58], [8, -48], [36, -46], [36, -36], [-60, -36]]), true) + '" fill="' + FAWN_D + '" opacity=".5"/>' +
    '<path d="' + smooth(Wl([[-24, -72], [-8, -67], [12, -61], [28, -62]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.8 * s) + '" fill="none" opacity=".7"/>' +
    '<path d="' + smooth(Wl([[-40, -94], [-32, -82], [-34, -66]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +
    '<path d="' + smooth(Wl([[26, -97], [31, -84], [32, -70]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +
    '<path d="' + smooth(tp2.slice(0, 9), false) + '" fill="none" stroke="' + FAWN_L + '" stroke-width="' + f(5 * s) + '" opacity=".6" transform="translate(0 ' + f(4 * s) + ')"/></g>';
  // near legs, over the body: the outline is open at the top so the leg melts into the shoulder / thigh
  svg += leg(hindLeg(swH + 3, lfH), FAWN, FAWN) + leg(frontLeg(swF - 2, lfF), FAWN, FAWN);
  // neck + head, turning about the base of the neck (head > 0 = nose down to sniff the floor)
  var piv = [40, -90], H = function (p) { return W(rotP(p, piv, hd)); }, HF = function (p) { return H([58 + (p[0] - 60) * .72, -131 + (p[1] + 146) * .7]); };
  var sn = o.sniff ? Math.sin(window.__t * 26) * o.sniff : 0, mo = clamp(o.mouth || 0);
  var nh = [[20, -100], [32, -110], [44, -121], [53, -129], [60, -133], [69, -137.5], [78, -136], [84, -130], [94, -126.5], [100, -125], [104, -122], [104.6, -118],
            [103, -115], [98, -113 + 3 * mo], [90, -109 + 6 * mo], [84, -106 + 3 * mo], [76, -105], [66, -101], [60, -90], [56, -78], [50, -68]];
  // far ear, then the head, then the near ear
  var ear = function (dx, col, inner) { var tip = [60 + dx - 1.5 * sn, -163];
    var p = [[55 + dx, -131], [54 + dx, -145], tip, [66 + dx, -150], [71 + dx, -134]].map(H);
    var q = [[58.5 + dx, -134], [58 + dx, -146], [60.5 + dx - 1.2 * sn, -157], [64.5 + dx, -147], [67 + dx, -135]].map(H);
    return '<path d="' + smooth(p, true) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' + (inner ? '<path d="' + smooth(q, true) + '" fill="' + EAR_IN + '" opacity=".9"/><path d="' + smooth([[60 + dx, -137], [61 + dx, -148]].map(H), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.2 * s) + '" fill="none"/>' : ""); };
  svg += ear(-7, FAWN_D, false);
  var hp = nh.map(H), hdP = smooth(hp, false), hdF = smooth(hp, true);
  if (mo > .05) svg += '<path d="' + smooth([[116, -122], [106, -116], [100, -114], [106, -112 + 7 * mo], [118, -121 + 4 * mo]].map(HF), true) + '" fill="#8a3e34" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>' +
    '<path d="' + smooth([[104, -116], [112, -118 + 4 * mo], [117, -118 + 5 * mo]].map(HF), false) + '" stroke="#d9837a" stroke-width="' + f(4 * s * mo) + '" fill="none" stroke-linecap="round"/>';
  svg += '<path d="' + hdF + '" fill="' + FAWN + '"/>';
  var hid = "dh" + (++CLIPN);
  svg += '<clipPath id="' + hid + '"><path d="' + hdF + '"/></clipPath><g clip-path="url(#' + hid + ')">' +
    '<path d="' + smooth([[56, -76], [62, -96], [72, -104], [84, -106], [98, -112], [106, -112], [106, -100], [60, -60]].map(H), true) + '" fill="' + CREAM + '"/>' +   // pale throat and lower jaw
    '<path d="' + smooth([[96, -142], [110, -138], [122, -134]].map(HF), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(3 * s) + '" fill="none" opacity=".7"/>' +   // muzzle ridge
    '<path d="' + smooth([[64, -110], [72, -122], [70, -136]].map(HF), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +   // cheek line
    '<path d="' + smooth([[20, -100], [34, -112], [46, -123], [56, -131]].map(H), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(6 * s) + '" fill="none" opacity=".45"/></g>';
  svg += '<path d="' + hdP + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>';
  // the nose leather: a dark rounded block at the tip with the nostril and its side slit (the slit is what the dog breathes out of)
  var np = [[116, -138], [122, -137.5], [125.5, -134], [126, -129], [123.5, -126], [118, -126.5], [116.5, -131]].map(HF);
  svg += '<path d="' + smooth(np, true) + '" fill="' + DNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  var nn = HF([121.5 + .6 * sn, -131]);
  svg += '<ellipse cx="' + f(nn[0]) + '" cy="' + f(nn[1]) + '" rx="' + f(2.1 * s) + '" ry="' + f(1.5 * s + .4 * Math.abs(sn) * s) + '" fill="#0d0a08"/>' +
    '<path d="' + smooth([[121, -130], [119, -128.5], [117.6, -127.4]].map(HF), false) + '" stroke="#0d0a08" stroke-width="' + f(1.1 * s) + '" fill="none"/>' +
    '<path d="' + smooth([[118.5, -136], [122, -135.4]].map(HF), false) + '" stroke="#6b6158" stroke-width="' + f(1.2 * s) + '" fill="none" stroke-linecap="round"/>';
  // mouth line and whisker spots
  svg += '<path d="' + smooth([[122, -125.5], [118, -123], [110, -119.5 + 3 * mo], [102, -117 + 2 * mo], [99, -118 + mo]].map(HF), false) + '" stroke="' + INK + '" stroke-width="' + f(1.5 * s) + '" fill="none" stroke-linecap="round"/>';
  [[96, -120.5], [92.5, -119], [94.5, -123], [90.5, -121.5]].forEach(function (p) { var q = H(p); svg += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(.75 * s) + '" fill="' + FAWN_D + '"/>'; });
  // the eye: almond, dark brown iris filling it, a highlight, a lid line; o.eyes closes it
  var ec = HF([89, -141]), eo = o.eyes == null ? 1 : o.eyes, er = 3.7 * s, eh = 2.6 * s * eo, ang = (hd * dir) + (dir < 0 ? 0 : 0);
  svg += G("translate(" + f(ec[0]) + " " + f(ec[1]) + ") rotate(" + f(ang + dir * -8) + ")",
    (eo > .08 ? '<ellipse rx="' + f(er) + '" ry="' + f(Math.max(.4, eh)) + '" fill="#3a2414" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/><circle cx="' + f(dir * .9 * s) + '" cy="' + f(-.3 * s) + '" r="' + f(1.9 * s * Math.min(1, eo + .2)) + '" fill="#0d0a08"/><circle cx="' + f(dir * 2 * s) + '" cy="' + f(-1.2 * s) + '" r="' + f(.9 * s) + '" fill="#fff"/>' : '<path d="M' + f(-er) + ' 0 Q0 ' + f(1.6 * s) + ' ' + f(er) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>') +
    '<path d="M' + f(-er * 1.3) + ' ' + f(-eh - 1.6 * s) + ' Q0 ' + f(-eh - 3.8 * s) + ' ' + f(er * 1.25) + ' ' + f(-eh - 1.2 * s) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none" stroke-linecap="round"/>');
  svg += ear(0, FAWN, true);
  // collar
  var c1 = H([35, -110]), c2 = H([55, -96]);
  svg += '<path d="M' + f(c1[0]) + ' ' + f(c1[1]) + ' L' + f(c2[0]) + ' ' + f(c2[1]) + '" stroke="' + INK + '" stroke-width="' + f(8 * s) + '" stroke-linecap="round"/><path d="M' + f(c1[0]) + ' ' + f(c1[1]) + ' L' + f(c2[0]) + ' ' + f(c2[1]) + '" stroke="' + BLUE + '" stroke-width="' + f(5 * s) + '" stroke-linecap="round"/>';
  var tagp = H([53, -93]); svg += '<circle cx="' + f(tagp[0]) + '" cy="' + f(tagp[1] + 5 * s) + '" r="' + f(3.4 * s) + '" fill="#d9b44a" stroke="' + INK + '" stroke-width="' + f(1.2 * s) + '"/>';
  return { svg: svg, nose: HF([126, -130]), eye: ec, head: HF([84, -134]), tailTip: W(tp[4]) };
}
// a shadow on the floor under a dog or a person
function shadow(x, y, rx) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * .09) + '" fill="' + INK + '" opacity=".12"/>'; }

// ── «الكلب بتاعك بيشوفك إزاي؟» — drawings. Shapes from real references (refs/SOURCES.md): the dog in dog.js; eye cuts
// after the human fovea vs the dog's area centralis with the tapetum behind the retina; cone curves after Neitz 1989
// (dog peaks ≈ 429 and 555 nm) and the human S/M/L curves (≈ 420/530/560); the snout cut after Craven et al. 2010
// (maxilloturbinates at the front, the lamina transversa shelf, the ethmoturbinates in the olfactory recess at the back,
// the olfactory bulb behind them); the nostril with its side slit; the brain cuts after the dog and human brain atlases.
// People: the shared person kit (videos/_templates/people/person.js), the owner in a red T-shirt so the colour point shows.

var WALL = "#e7dcc3", FLOOR = "#cdb48c", FLOOR_D = "#b39a72", RUG = "#a9b8a0", PLANT = "#6f8a45", PLANT_D = "#4f6a33", POT = "#b56a45",
    SHIRT = "#b8473a", SHIRT_D = "#93362b", JEANS = "#4b5f7e", JEANS_D = "#394a66", RETINA = "#c97a68", TAPETUM = "#5fa39a", BRAIN = "#d9a8a0", BRAIN_D = "#b9857c";
var OWNER = { base: "casual", colors: { shirt: SHIRT, shirtD: SHIRT_D, pants: JEANS, pantsD: JEANS_D } };
function breath(t, k) { return (Math.sin(t * 1.7 + (k || 0)) + 1) / 2; }
function blink(t, k) { return ((t + (k || 0)) * 1000) % 3700 < 130 ? .05 : 1; }

// ── the dog's eye as a filter: blur (≈ 20/75 acuity) and a dichromat colour matrix (red and green fold into yellow-grey,
// blue stays). Machado / Viénot deuteranope matrix, the usual stand-in for dog vision.
var DOGM = [.625, .375, 0, 0, 0, .7, .3, 0, 0, 0, 0, .3, .7, 0, 0, 0, 0, 0, 1, 0];
function dvDefs(b) { return '<defs><filter id="dogv' + b + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="' + b + '"/><feColorMatrix type="matrix" values="' + DOGM.join(" ") + '"/></filter>' +
  '<filter id="grey" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs>'; }
function dogView(inner, b) { b = b || 5; return dvDefs(b) + '<g filter="url(#dogv' + b + ')">' + inner + '</g>'; }
// the same colour through the dog's eye, for flat swatches
function dvHex(h) { var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16);
  var R2 = DOGM[0] * r + DOGM[1] * g + DOGM[2] * b, G2 = DOGM[5] * r + DOGM[6] * g + DOGM[7] * b, B2 = DOGM[10] * r + DOGM[11] * g + DOGM[12] * b;
  return "#" + [R2, G2, B2].map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(""); }
// a split view: left of x shows `a`, right shows `b`, with a divider line and a knob
function split(x, a, b, y0, y1) {
  var id1 = "sp" + (++CLIPN), id2 = "sp" + (++CLIPN);
  return '<clipPath id="' + id1 + '"><rect x="-2000" y="-2000" width="' + f(x + 2000) + '" height="4800"/></clipPath><clipPath id="' + id2 + '"><rect x="' + f(x) + '" y="-2000" width="4000" height="4800"/></clipPath>' +
    '<g clip-path="url(#' + id1 + ')">' + a + '</g><g clip-path="url(#' + id2 + ')">' + b + '</g>' +
    '<path d="M' + f(x) + ' ' + (y0 || -100) + ' V' + (y1 || 900) + '" stroke="' + INK + '" stroke-width="3"/>' + C(x, ((y0 || -100) + (y1 || 900)) / 2, 11, PAPER, 2.4);
}

// ── the living room (side view, eye level) ──
function room(fl, opt) {
  opt = opt || {}; var s = '<rect x="-400" y="-400" width="1440" height="' + (fl + 400) + '" fill="' + WALL + '"/>';
  s += '<path d="M-400 ' + (fl - 22) + ' H1040" stroke="' + INK + '" stroke-width="1.6"/>' + R(-400, fl - 22, 1440, 22, "#ddd0b4", 0);
  s += R(-400, fl, 1440, 500, FLOOR, 0) + '<path d="M-400 ' + fl + ' H1040" stroke="' + INK + '" stroke-width="2.6"/>';
  for (var k = 0; k < 6; k++) s += '<path d="M-400 ' + (fl + 26 + k * 34 + k * k * 4) + ' H1040" stroke="' + FLOOR_D + '" stroke-width="1.4"/>';
  if (opt.rug !== false) s += '<ellipse cx="' + (opt.rugX || 320) + '" cy="' + (fl + 34) + '" rx="300" ry="30" fill="' + RUG + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + (opt.rugX || 320) + '" cy="' + (fl + 34) + '" rx="270" ry="22" fill="none" stroke="#c97a55" stroke-width="3"/>';
  if (opt.frame !== false) s += R((opt.frameX || 430) - 60, fl - 420, 120, 90, "#efe6d0", 2.4) + '<path d="M' + ((opt.frameX || 430) - 48) + ' ' + (fl - 345) + ' L' + ((opt.frameX || 430) - 10) + ' ' + (fl - 390) + ' L' + ((opt.frameX || 430) + 14) + ' ' + (fl - 362) + ' L' + ((opt.frameX || 430) + 48) + ' ' + (fl - 398) + ' V' + (fl - 342) + ' H' + ((opt.frameX || 430) - 48) + ' Z" fill="#9db3c0" stroke="' + INK + '" stroke-width="1.4"/>';
  if (opt.plant !== false) s += plant(opt.plantX || 560, fl, window.__t);
  return s;
}
function plant(x, fl, t) {
  var s = "", sw = Math.sin(t * 1.3) * 2;
  [[-40, -170], [-10, -205], [22, -180], [44, -140], [-58, -120], [8, -150]].forEach(function (l, i) {
    var bx = x + (i % 2 ? 4 : -4), by = fl - 70, tx = x + l[0] + sw, ty = fl - 70 + l[1] * .9, mx = (bx + tx) / 2 + (l[0] > 0 ? 18 : -18), my = (by + ty) / 2;
    s += '<path d="M' + f(bx) + ' ' + f(by) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(tx) + ' ' + f(ty) + ' Q' + f(mx - (l[0] > 0 ? 36 : -36)) + ' ' + f(my + 10) + ' ' + f(bx) + ' ' + f(by) + ' Z" fill="' + (i % 2 ? PLANT_D : PLANT) + '" stroke="' + INK + '" stroke-width="1.8"/>';
  });
  return s + P("M" + (x - 34) + " " + (fl - 74) + " L" + (x + 34) + " " + (fl - 74) + " L" + (x + 26) + " " + fl + " L" + (x - 26) + " " + fl + " Z", POT, 2.2) + R(x - 38, fl - 82, 76, 12, "#c97d55", 2);
}
// the owner standing, front view: hip at fl - 210·s
function owner(x, fl, s, t, opt) {
  opt = opt || {}; var y = fl - 210 * s;
  var o = { x: x, y: y, s: s, legs: "stand", outfit: opt.outfit || OWNER, breath: breath(t, x), head: { tilt: opt.tilt != null ? opt.tilt : 2 * Math.sin(t * .9), turn: opt.turn || 0, nod: opt.nod || 0 },
    face: { eyes: opt.eyes != null ? opt.eyes : blink(t, x), look: opt.look || [0, 0], brows: opt.brows || "neutral", mouth: opt.mouth || "smile" } };
  if (opt.arms) o.arms = opt.arms;
  return PERSON.front(o);
}
// the owner walking in profile, the lower foot on fl
function walker(x, fl, s, ph, right, opt) {
  opt = opt || {};
  var o = Object.assign({ x: x, s: s, dir: right ? 1 : -1, lean: 3, outfit: opt.outfit || OWNER, breath: breath(ph, x), head: { tilt: opt.tilt || 0 },
    face: { eyes: 1, brows: opt.brows || "neutral", mouth: opt.mouth || "smile" } }, PERSON.walkPose(ph, opt.still ? 0 : 1));
  o.y = PERSON.sideHipY(o, fl);
  return PERSON.side(o);
}
// a wagging, breathing dog standing or trotting
function pup(x, fl, s, t, opt) {
  opt = opt || {};
  return dog(Object.assign({ x: x, y: fl, s: s, dir: opt.dir || 1, ph: opt.ph || 0, walk: opt.walk || 0, head: opt.head || 0, tail: opt.tail != null ? opt.tail : 14 * Math.sin(t * (opt.wag || 7)),
    sniff: opt.sniff || 0, mouth: opt.mouth != null ? opt.mouth : .55 + .25 * Math.sin(t * 6), eyes: blink(t, x * .01) }, opt));
}

// ── scent: wavy orange ribbons drifting from a source to a nose, dashes running along them ──
function scent(x1, y1, x2, y2, t, k, col, n) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = ""; n = n || 3;
  for (var i = 0; i < n; i++) {
    var off = (i - (n - 1) / 2) * 16, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, d = "";
    for (var q = 0; q <= L * k; q += 6) { var w = Math.sin(q / 38 - t * 3.2 + i * 1.7) * 9 + off * (1 - q / L * .8); d += (q ? " L" : "M") + f(x1 + dx * q / L + nx * w) + " " + f(y1 + dy * q / L + ny * w); }
    s += '<path d="' + d + '" stroke="' + (col || ORANGE) + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 40) + '" opacity=".8"/>';
  }
  return s;
}
// a scent cloud of small dots round a point (the owner's smell, a twin's smell)
function cloud(x, y, r, t, col, k, seed) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = "";
  for (var i = 0; i < 26; i++) { var a = hash(i + (seed || 0)) * 6.283 + t * (.3 + hash(i + 9) * .4), rr = r * Math.sqrt(hash(i + 3 + (seed || 0))) * k, y2 = y + Math.sin(a) * rr * .8 - ((t * 14 + i * 7) % 30);
    s += '<circle cx="' + f(x + Math.cos(a) * rr) + '" cy="' + f(y2) + '" r="' + f(2.4 + hash(i + 5) * 2.6) + '" fill="' + (col || ORANGE) + '" opacity="' + f(.35 + .45 * hash(i + 2)) + '"/>'; }
  return s;
}

// ── the eye, cut through the middle (light comes in from the left) ──
// kind "human": a pit (the fovea) at the back where the cones crowd; "dog": no pit, fewer cones, the tapetum behind the retina
function eyeCut(cx, cy, r, kind, t, o) {
  o = o || {}; var s = "", dog_ = kind === "dog";
  s += C(cx, cy, r, "#f6f1e6", 3);
  s += '<path d="M' + f(cx - r * .82) + ' ' + f(cy - r * .56) + ' A' + f(r * .62) + ' ' + f(r * .62) + ' 0 0 0 ' + f(cx - r * .82) + ' ' + f(cy + r * .56) + '" fill="#e6eef0" stroke="' + INK + '" stroke-width="2.4"/>';   // cornea
  s += R(cx - r * .74, cy - r * .62, r * .07, r * .36, dog_ ? "#7a4a24" : "#5a7a8a", 1.4) + R(cx - r * .74, cy + r * .26, r * .07, r * .36, dog_ ? "#7a4a24" : "#5a7a8a", 1.4);   // iris
  s += '<ellipse cx="' + f(cx - r * .6) + '" cy="' + f(cy) + '" rx="' + f(r * .13) + '" ry="' + f(r * .3) + '" fill="#dbe8ec" stroke="' + INK + '" stroke-width="2"/>';   // lens
  // light rays converging on the back
  var fx = cx + r * .93, fy = cy, k = clamp(o.rays == null ? 1 : o.rays);
  if (k > 0) [-.22, 0, .22].forEach(function (dy) { var a = [cx - r * 1.6, cy + dy * r * 1.6], b = [cx - r * .6, cy + dy * r * .9];
    s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(lerp(b[0], fx, k)) + ' ' + f(lerp(b[1], fy + (dog_ ? dy * r * .28 : 0), k)) + '" stroke="#e0a43a" stroke-width="3" fill="none" stroke-dasharray="7 6" stroke-dashoffset="' + f(-t * 30) + '"/>'; });
  // tapetum (dog): a shining band behind the retina in the upper back
  if (dog_) s += '<path d="M' + f(cx + Math.cos(-1.45) * r * .97) + ' ' + f(cy + Math.sin(-1.45) * r * .97) + ' A' + f(r * .97) + ' ' + f(r * .97) + ' 0 0 1 ' + f(cx + Math.cos(.15) * r * .97) + ' ' + f(cy + Math.sin(.15) * r * .97) + '" stroke="' + TAPETUM + '" stroke-width="' + f(r * .07) + '" fill="none" opacity="' + f(.75 + .25 * Math.sin(t * 3)) + '"/>';
  // retina: a thick lining on the back half; the human one dips into the fovea at the axis
  var d = "";
  for (var a = -1.75; a <= 1.751; a += .05) { var dip = !dog_ ? Math.exp(-a * a / .006) * r * .07 : 0, rr = r * .9 - (-dip); d += (a > -1.75 ? " L" : "M") + f(cx + Math.cos(a) * (r * .88 - dip)) + " " + f(cy + Math.sin(a) * (r * .88 - dip)); }
  s += '<path d="' + d + '" stroke="' + RETINA + '" stroke-width="' + f(r * .08) + '" fill="none" stroke-linecap="round"/>';
  // cones: dots along the retina, crowded at the human fovea, thin and even in the dog
  var n = dog_ ? 15 : 22;
  for (var i = 0; i < n; i++) { var u = (i + .5) / n, aa = dog_ ? -1.6 + 3.2 * u : (u < .5 ? -1.6 + 1.5 * Math.pow(u * 2, 1.8) : 1.6 - 1.5 * Math.pow((1 - u) * 2, 1.8)) * 1;
    s += '<circle cx="' + f(cx + Math.cos(aa) * r * .8) + '" cy="' + f(cy + Math.sin(aa) * r * .8) + '" r="' + f(r * .028) + '" fill="' + (o.coneCol ? o.coneCol(i) : INK) + '"/>'; }
  if (!dog_) for (i = 0; i < 9; i++) { var a2 = (i - 4) * .035; s += '<circle cx="' + f(cx + Math.cos(a2) * r * .76) + '" cy="' + f(cy + Math.sin(a2) * r * .76) + '" r="' + f(r * .026) + '" fill="' + INK + '"/>'; }
  // optic nerve out of the back
  s += P("M" + f(cx + r * .86) + " " + f(cy + r * .3) + " C" + f(cx + r * 1.1) + " " + f(cy + r * .34) + " " + f(cx + r * 1.24) + " " + f(cy + r * .42) + " " + f(cx + r * 1.4) + " " + f(cy + r * .5) + " L" + f(cx + r * 1.4) + " " + f(cy + r * .76) + " C" + f(cx + r * 1.2) + " " + f(cy + r * .66) + " " + f(cx + r * 1.0) + " " + f(cy + r * .62) + " " + f(cx + r * .78) + " " + f(cy + r * .52) + " Z", "#e8cf9f", 2.2);
  // where the light lands: a sharp point (human) or a smeared spot (dog)
  if (k >= 1) s += dog_ ? '<ellipse cx="' + f(fx - r * .04) + '" cy="' + f(fy) + '" rx="' + f(r * .05) + '" ry="' + f(r * .22) + '" fill="#e0a43a" opacity=".55"/>' : C(fx - r * .02, fy, r * .035, "#e0a43a", 1.2);
  return s;
}

// ── the cone curves: sensitivity over wavelength 400–700 nm, in a framed graph ──
function gauss(x, m, w) { return Math.exp(-Math.pow((x - m) / w, 2)); }
function cones(x, y, w, h, peaks, k, t) {
  var s = R(x, y, w, h, "#f4ecdb", 2.2), id = "cg" + (++CLIPN), bar = "";
  for (var i = 0; i < 30; i++) { var nm = 400 + i * 10, col = spec(nm); bar += R(x + i * w / 30, y + h + 8, w / 30 + .6, 18, col, 0); }
  s += bar + R(x, y + h + 8, w, 18, "none", 1.6) + N("400", x + 4, y + h + 46, 14, INK, "start") + N("700", x + w - 4, y + h + 46, 14, INK, "end");
  peaks.forEach(function (p, j) { var kk = clamp(k * peaks.length - j), d = "";
    if (kk <= 0) return;
    for (var q = 0; q <= 60 * kk; q++) { var nm = 400 + q * 5; d += (q ? " L" : "M") + f(x + (nm - 400) / 300 * w) + " " + f(y + h - 8 - gauss(nm, p[0], p[1]) * (h - 26)); }
    s += '<path d="' + d + '" stroke="' + p[2] + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if (kk >= 1) s += C(x + (p[0] - 400) / 300 * w, y + h - 8 - (h - 26), 6, p[2], 1.6);
  });
  return s;
}
function spec(nm) {   // an approximate spectrum colour for the strip under the graph
  var st = [[400, [118, 64, 160]], [450, [55, 90, 190]], [490, [40, 160, 190]], [520, [60, 170, 80]], [570, [220, 210, 60]], [600, [235, 150, 50]], [650, [215, 60, 45]], [700, [160, 40, 40]]];
  for (var i = 1; i < st.length; i++) if (nm <= st[i][0]) { var k = (nm - st[i - 1][0]) / (st[i][0] - st[i - 1][0]), a = st[i - 1][1], b = st[i][1]; return "rgb(" + [0, 1, 2].map(function (j) { return Math.round(lerp(a[j], b[j], k)); }).join(",") + ")"; }
  return "rgb(160,40,40)";
}
function specDog(nm) { var m = spec(nm).match(/\d+/g).map(Number), h = "#" + m.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); return dvHex(h); }

// ── brains in profile (front to the left): the human one with the face area under the temporal lobe; the dog one long,
// with a big olfactory bulb at the front and the caudate deep inside ──
function humanBrain(x, y, sc, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-90 10 C-100 -40 -60 -86 0 -88 C60 -90 104 -56 100 -6 C98 22 80 36 60 40 C50 58 20 60 8 48 C-10 52 -40 48 -56 36 C-76 34 -88 26 -90 10 Z", BRAIN, 2.6) +
    P("M40 44 C56 50 80 50 92 40 C96 52 88 66 70 68 C54 68 44 60 40 44 Z", "#c99790", 2) +   // cerebellum
    '<path d="M-40 -60 q14 18 0 30 q-14 14 4 30 M0 -80 q-10 24 8 40 q14 16 -2 34 M40 -70 q-12 22 6 36 q12 14 0 30 M-70 -10 q24 -6 40 6 q18 10 40 0" stroke="' + BRAIN_D + '" stroke-width="2.4" fill="none"/>' +
    '<path d="M-56 4 C-30 -6 0 -2 30 14" stroke="' + INK + '" stroke-width="2" fill="none"/>' +   // lateral fissure
    P("M24 60 C26 76 30 90 34 104 L48 104 C44 88 42 74 44 62 Z", "#d7b0a3", 2));   // brain stem
  if (o.face) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="18" cy="38" rx="20" ry="9" fill="' + ORANGE + '" opacity="' + f(.5 + .4 * o.face) + '" stroke="' + INK + '" stroke-width="1.6"/>');
  return s;
}
function dogBrain(x, y, sc, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-70 6 C-74 -30 -40 -56 10 -56 C60 -56 92 -30 92 4 C92 26 74 36 56 38 C40 50 10 50 -10 40 C-40 40 -66 30 -70 6 Z", BRAIN, 2.6) +
    P("M56 38 C70 34 92 30 100 14 C108 30 100 50 82 54 C70 56 60 50 56 38 Z", "#c99790", 2) +
    '<path d="M-40 -36 q20 10 10 28 M0 -50 q-8 22 10 34 M40 -46 q-10 20 6 34 M-50 0 q40 -10 90 4" stroke="' + BRAIN_D + '" stroke-width="2.4" fill="none"/>' +
    P("M-70 2 C-84 -6 -104 -4 -110 8 C-114 20 -100 28 -84 24 C-76 22 -70 14 -70 2 Z", o.bulb ? OLIVE : "#c7a07a", 2.2) +   // olfactory bulb
    P("M40 50 C44 64 46 76 48 88 L62 88 C60 74 58 62 58 50 Z", "#d7b0a3", 2));
  if (o.caudate) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="-4" cy="-8" rx="18" ry="10" fill="' + ORANGE + '" opacity="' + f(.25 + .7 * o.caudate) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    (o.caudate > .3 ? '<ellipse cx="-4" cy="-8" rx="' + f(18 + 14 * ((window.__t * 1.2) % 1)) + '" ry="' + f(10 + 8 * ((window.__t * 1.2) % 1)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2" opacity="' + f(1 - (window.__t * 1.2) % 1) + '"/>' : ""));
  if (o.face != null) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="40" cy="26" rx="16" ry="7" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-dasharray="4 4"/>');
  return s;
}
// the back of a head (hair, ears, neck) to set beside a face
function backHead(x, y, s) {
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-14, 22, 28, 30, "#e0a98a", 2) + '<path d="M-36 60 C-30 46 30 46 36 60 L40 90 L-40 90 Z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<ellipse cx="-27" cy="2" rx="6" ry="10" fill="#e0a98a" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="27" cy="2" rx="6" ry="10" fill="#e0a98a" stroke="' + INK + '" stroke-width="1.8"/>' +
    '<path d="M-27 6 C-30 -30 -14 -40 0 -40 C14 -40 30 -30 27 6 C26 22 14 34 0 34 C-14 34 -26 22 -27 6 Z" fill="#2f2620" stroke="' + INK + '" stroke-width="2.2"/><path d="M-10 -30 q6 8 14 0 M-16 -12 q10 6 20 -2 M2 4 q8 6 14 -2" stroke="#4d3f34" stroke-width="1.6" fill="none"/>');
}

// ── the snout, cut down the middle (Craven et al. 2010): nostril → the front maze (maxilloturbinates, warms the air)
// → a shelf (lamina transversa) splits the flow: under it the breath goes on to the throat, over it a share goes up to
// the olfactory recess at the back, packed with scrolls (ethmoturbinates) → the olfactory bulb of the brain behind them
function snoutCut(t, o) {
  o = o || {}; var s = "";
  var head = "M80 300 C80 220 150 150 250 136 C330 126 380 150 420 196 C460 220 540 232 600 250 C640 262 660 296 650 330 C640 360 610 372 580 372 L440 380 C380 420 300 440 220 430 C140 420 80 380 80 300 Z";
  s += P(head, FAWN, 2.8) + '<path d="' + head + '" fill="url(#hatch)" opacity=".12"/>';
  // skull bone and brain case
  s += P("M120 300 C116 230 170 180 250 170 C320 162 370 190 396 232 C380 260 340 270 300 272 C240 276 170 300 120 300 Z", "#efe4cc", 2.2);
  s += P("M140 290 C140 240 180 204 248 196 C310 190 350 210 370 240 C340 256 300 258 260 262 C210 268 170 282 140 290 Z", BRAIN, 2) + '<path d="M180 240 q20 10 40 0 q20 -10 40 4 q20 10 40 -2" stroke="' + BRAIN_D + '" stroke-width="2" fill="none"/>';
  // olfactory bulb: the front of the brain, right behind the recess
  s += P("M366 238 C384 230 404 236 406 250 C406 262 390 268 374 264 C362 260 358 246 366 238 Z", o.bulb ? OLIVE : "#c7a07a", 2.2);
  // nasal cavity
  var cav = "M400 236 C460 236 540 250 600 262 C622 268 630 290 622 312 L560 330 L420 336 C404 320 396 280 400 236 Z";
  s += P(cav, "#f3e3d2", 2.2);
  // the shelf: lamina transversa
  s += P("M420 300 C470 296 520 300 560 306", "none", 5, ' stroke="' + INK + '" stroke-linecap="round"') + P("M420 300 C470 296 520 300 560 306", "none", 2.5, ' stroke="#efe4cc" stroke-linecap="round"');
  // olfactory recess: scrolls (ethmoturbinates) above the shelf at the back
  for (var i = 0; i < 9; i++) { var cx = 412 + (i % 3) * 22, cy = 252 + Math.floor(i / 3) * 16, rr = 8;
    s += '<path d="M' + f(cx) + ' ' + f(cy) + ' m' + f(-rr) + ' 0 a' + rr + ' ' + rr + ' 0 1 1 ' + f(rr * 1.6) + ' ' + f(rr * .4) + ' a' + f(rr * .6) + ' ' + f(rr * .6) + ' 0 1 1 ' + f(-rr * .8) + ' ' + f(-rr * .5) + '" stroke="' + (o.hl === "recess" ? OLIVE : "#a98a6a") + '" stroke-width="2.4" fill="none"/>'; }
  // front maze: maxilloturbinates
  for (i = 0; i < 6; i++) s += '<path d="M' + (500 + i * 16) + ' 274 c6 10 -6 16 2 26 c6 8 -4 14 2 22" stroke="#b08a70" stroke-width="2.2" fill="none"/>';
  // nostril at the front, the side slit
  s += P("M600 252 C628 252 652 270 652 300 C652 322 636 332 620 330 L612 312 C622 304 622 284 606 278 Z", DNOSE, 2);
  s += '<ellipse cx="630" cy="296" rx="8" ry="11" fill="#0d0a08"/>';
  // throat: where the breath goes
  s += P("M420 336 C400 350 380 372 372 410 L330 418 C340 384 360 352 380 336 Z", "#e7c8b6", 2);
  // air: in through the nostril, along the floor to the throat (blue), and a share up over the shelf to the recess (orange)
  if (o.air) {
    var lo = "M640 300 L560 318 L470 322 L400 340 L360 412", hi = "M640 300 L580 288 L520 282 L460 272 L428 262";
    s += G("", '<path d="' + lo + '" stroke="' + BLUE + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="4 14" stroke-dashoffset="' + f(t * 40) + '"/>', o.air);
    s += G("", '<path d="' + hi + '" stroke="' + ORANGE + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="4 14" stroke-dashoffset="' + f(t * 40) + '"/>', clamp(o.air * 2 - 1));
  }
  // eye, ear
  s += '<ellipse cx="380" cy="190" rx="16" ry="11" fill="#3a2414" stroke="' + INK + '" stroke-width="2"/><circle cx="384" cy="187" r="4" fill="#fff"/>';
  s += P("M190 150 C180 100 200 50 220 30 C250 60 270 110 268 140 Z", FAWN, 2.6) + P("M206 140 C202 106 212 70 222 52 C240 80 250 112 250 136 Z", EAR_IN, 0);
  return s;
}
// the nose leather seen from the front: two comma-shaped nostrils, each opening into a slit that runs down and out
function noseFront(x, y, sc, t, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-150 -60 C-150 -110 -60 -130 0 -130 C60 -130 150 -110 150 -60 C150 0 110 40 60 60 C30 72 14 90 0 110 C-14 90 -30 72 -60 60 C-110 40 -150 0 -150 -60 Z", DNOSE, 3) +
    '<path d="M0 -10 V110" stroke="#0d0a08" stroke-width="5"/>' +
    [-1, 1].map(function (sd) { var fl = 1 + .12 * Math.sin(t * 14) * (o.sniff || 0);
      return G("translate(" + (sd * 62) + " -40) scale(" + f(sd * fl) + " " + f(fl) + ")", '<path d="M-34 -14 C-36 -38 -4 -46 14 -30 C30 -16 24 6 8 14 C20 26 40 34 60 56 C40 50 18 40 0 28 C-20 18 -32 4 -34 -14 Z" fill="#0d0a08" stroke="#6b6158" stroke-width="2"/>'); }).join("") +
    '<path d="M-110 -100 C-70 -116 -40 -118 -20 -116" stroke="#6b6158" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>');
  // the leather's pebbled texture
  for (var i = 0; i < 40; i++) { var a = hash(i) * 6.28, r = 40 + hash(i + 7) * 90; s += '<circle cx="' + f(x + Math.cos(a) * r * sc) + '" cy="' + f(y - 40 * sc + Math.sin(a) * r * .5 * sc) + '" r="' + f(3 * sc) + '" fill="none" stroke="#4a4038" stroke-width="' + f(1.4 * sc) + '" opacity=".6"/>'; }
  return s;
}
// a muzzle around the front nose (fur, a little of the mouth)
function muzzleFront(x, y, sc) {
  return G("translate(" + x + " " + y + ") scale(" + sc + ")", P("M-260 -120 C-240 -220 240 -220 260 -120 C280 40 200 200 0 230 C-200 200 -280 40 -260 -120 Z", FAWN, 3) +
    P("M-150 60 C-100 140 100 140 150 60 C120 170 -120 170 -150 60 Z", CREAM, 2) + '<path d="M0 110 V170 M0 170 C-30 190 -70 186 -100 168 M0 170 C30 190 70 186 100 168" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    [[-170, 0], [-190, 30], [-160, 50], [170, 0], [190, 30], [160, 50]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + FAWN_D + '"/>'; }).join(""));
}

// ── an MRI scanner in profile: a ring with the bore, the dog lying in it chin on a rest ──
function mri(x, y, t) {
  var s = R(x - 170, y - 230, 300, 300, "#e4e6e2", 2.6, 26) + '<ellipse cx="' + (x - 20) + '" cy="' + (y - 80) + '" rx="60" ry="104" fill="#c9ccc6" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(x - 170, y + 70, 300, 24, "#b9bcb6", 2) + R(x - 520, y - 12, 520, 22, "#d8d0bb", 2.2, 6) + R(x - 500, y + 10, 18, 84, "#9a9a92", 2) + R(x - 230, y + 10, 18, 84, "#9a9a92", 2);
  s += T("MRI", x + 60, y - 180, 22, INK, 800);
  return s;
}

// ── a pool cut through its side: water, tiles, a lane line; w × h ──
function pool(x, y, w, h, t) {
  var s = R(x - 10, y - 10, w + 20, h + 20, "#d9d4c6", 2.4) + R(x, y, w, h, "#86a9bd", 2);
  for (var k = 0; k < 5; k++) s += '<path d="M' + f(x + 10 + ((k * 90 + t * 30) % (w - 30))) + ' ' + (y + 10) + ' q10 -6 20 0 t20 0" stroke="#e8eef0" stroke-width="2.4" fill="none"/>';
  return s + '<path d="M' + x + ' ' + (y + h * .6) + ' H' + (x + w) + '" stroke="#6f8ea2" stroke-width="2" stroke-dasharray="10 8"/>';
}
// a teaspoon tipping sugar grains
function spoon(x, y, tilt, k, t) {
  var s = G("rotate(" + f(tilt) + " " + x + " " + y + ")", '<ellipse cx="' + x + '" cy="' + y + '" rx="26" ry="14" fill="#d9dcdc" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + (x + 24) + ' ' + (y - 4) + ' L' + (x + 110) + ' ' + (y - 30) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + (x + 24) + ' ' + (y - 4) + ' L' + (x + 110) + ' ' + (y - 30) + '" stroke="#d9dcdc" stroke-width="5" stroke-linecap="round"/>' +
    (k < .5 ? '<ellipse cx="' + x + '" cy="' + (y - 6) + '" rx="20" ry="8" fill="#fbf8f1" stroke="' + INK + '" stroke-width="1.2"/>' : ""));
  if (k > 0 && k < 1) for (var i = 0; i < 14; i++) { var p = (k * 2 + hash(i) * .6) % 1; s += '<rect x="' + f(x - 20 + hash(i + 3) * 18) + '" y="' + f(y + 10 + p * 130) + '" width="4" height="4" fill="#fbf8f1" stroke="' + INK + '" stroke-width=".8"/>'; }
  return s;
}

// ── a Snellen-style chart on a stand: rows of letters getting smaller ──
function chart(x, fl, sc) {
  var s = R(x - 6, fl - 170 * sc, 12, 170 * sc, WOOD, 2) + R(x - 50 * sc, fl - 300 * sc, 100 * sc, 140 * sc, "#fbf8f1", 2.2);
  [[34, 0], [22, 1], [16, 2], [11, 3], [8, 4]].forEach(function (r, i) { var y = fl - 270 * sc + i * 26 * sc; for (var j = 0; j <= i; j++) s += T("E", x + (j - i / 2) * r[0] * .9 * sc, y + r[0] * .4 * sc, r[0] * sc, INK, 900); });
  return s;
}

// ══ shots (one per idea; line numbers from script.txt) ══
var FL = 640;
// 4 · «ليه بيشوفك مغبّش؟»: the dog looking up at a blurred owner
shot(4, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .3] }), p = pup(150, FL, 2.0, t, { head: -12 });
  return paper() + room(FL, { plantX: 600 }) + dogView(o.svg, 4) + shadow(150, FL, 140) + p.svg + G("", T("؟", 250, 200, 120, ORANGE, 800), at(u, .5, .3));
});
// 5 · the eye, cut through: yours has the pit where the detail gathers; his doesn't. «4 مرات»
shot(5, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k1 = at(u, .3, .8), k2 = at(u, (LN[5].end - LN[5].start) * .45, .8);
  var s = paper() + T("عينك", 320, 70, 30, INK, 800) + eyeCut(290, 220, 120, "human", t, { rays: k1 }) +
    label(398, 220, 520, 120, "النقطة دي", ORANGE, at(u, 1.4, .5), 24) + G("", C(398, 220, 18, "none", 3).replace(INK, ORANGE), at(u, 1.4, .4));
  s += G("", T("عينه", 320, 420, 30, INK, 800) + eyeCut(290, 570, 120, "dog", t, { rays: k2 }) + cross(470, 520, .7, at(u, (LN[5].end - LN[5].start) * .55, .4)) + T("مفيش", 470, 590, 24, ORANGE, 800), k2 > 0 ? 1 : 0);
  return s + numBox("÷4", 120, 420, at(u, (LN[5].end - LN[5].start) * .8, .3), 30, true);
});
// 6 · the chart test: what you read sharp from 20 m, he must come to 5 m to see as well
shot(6, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var g = 560, s = paper() + R(-400, g, 1440, 400, "#e3d7bd", 0) + '<path d="M-400 ' + g + ' H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  var cx = 590, man = walker(50, g, .5, 0, true, { still: true }).svg, k = at(u, d * .4, d * .35), x5 = cx - 140;
  s += chart(cx, g, .8) + man + measure(50, g + 50, cx, g + 50, at(u, .5, 1.2), "") + G("", T("20 متر", 320, g + 92, 28, INK, 800), at(u, 1.4, .3));
  s += G("", '<path d="M90 ' + (g - 170) + ' L' + (cx - 40) + ' ' + (g - 200) + '" stroke="#e0a43a" stroke-width="2.4" stroke-dasharray="6 6"/>', at(u, .3, .4));
  var dx = lerp(120, x5 - 80, k), dg = pup(dx, g, .75, t, { walk: k > 0 && k < 1 ? 1 : 0, ph: t * 9, head: -10 });
  s += dg.svg + G("", measure(x5, g + 140, cx, g + 140, at(u, d * .8, .5), "") + G("", T("5 متر", (x5 + cx) / 2, g + 182, 28, BLUE, 800), at(u, d * .8 + .4, .3)), k >= 1 ? 1 : 0);
  return s + G("", tag("زيك بالظبط", 320, 140, 1, 26, OLIVE), at(u, d * .88, .3));
});
// 7 · colour cells: you have three kinds, he has two (cone curves)
shot(7, push(320, 390, 1.0, 1.04), function (u, d, t) {
  var k1 = at(u, .3, 1.6), k2 = at(u, d * .5, 1.2);
  return paper() + T("إنت: 3 أنواع", 320, 70, 30, INK, 800) + cones(80, 90, 480, 200, [[420, 40, "#4a63b8"], [530, 55, "#4f9a4a"], [560, 60, ORANGE]], k1, t) +
    G("", T("هو: نوعين بس", 320, 430, 30, INK, 800) + cones(80, 450, 480, 200, [[429, 42, "#4a63b8"], [555, 65, "#d9b44a"]], k2, t), k2 > 0 ? 1 : 0);
});
// 8 · blue and yellow stay; red and green go grey-yellow: four toys through your eye and his
shot(8, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var toys = [["#3e64b5", "أزرق"], ["#e2c23a", "أصفر"], [SHIRT, "أحمر"], ["#4f9a4a", "أخضر"]], s = paper();
  s += T("إنت", 560, 150, 28, INK, 800, "end") + T("هو", 560, 450, 28, INK, 800, "end");
  for (var i = 0; i < 30; i++) { s += R(60 + i * 17, 330, 17.6, 26, spec(400 + i * 10), 0) + G("", R(60 + i * 17, 630, 17.6, 26, specDog(400 + i * 10), 0), at(u, .8 + i * .03, .2)); }
  s += R(60, 330, 510, 26, "none", 1.6) + R(60, 630, 510, 26, "none", 1.6);
  toys.forEach(function (q, i) { var x = 120 + i * 125, bob = 4 * Math.sin(t * 3 + i), k = at(u, .2 + i * .25, .3), kd = at(u, 1.2 + i * .3, .4), red = i >= 2;
    s += G("", C(x, 240 + bob, 42, q[0], 2.4) + '<path d="M' + (x - 26) + ' ' + f(226 + bob) + ' q12 -14 26 -12" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>' + T(q[1], x, 310, 20, INK, 700), k);
    s += G("", C(x, 540 - bob, 42, dvHex(q[0]), 2.4) + (red ? cross(x, 540 - bob, .5, at(u, 2.6 + (i - 2) * .4, .4)) : check(x, 470, .6, at(u, 2 + i * .3, .4), BLUE)), kd);
  });
  return s;
});
// 9 · like the world behind frosted bathroom glass
shot(9, push(330, 400, 1.06, 1.0), function (u, d, t) {
  var o = owner(330, FL, 1.25, t, { mouth: "smile" }), s = paper() + room(FL);
  var glass = '<rect x="-60" y="-60" width="120" height="120" fill="#cfdde0"/>' + G("", '<ellipse cx="0" cy="-12" rx="16" ry="20" fill="#d9a186"/><rect x="-26" y="10" width="52" height="56" rx="16" fill="' + SHIRT + '"/>', .8);
  for (var i = 0; i < 8; i++) glass += '<path d="M' + (-60 + i * 16) + ' -60 l12 120" stroke="#eef3f3" stroke-width="5" opacity=".7"/>';
  return s + dogView(o.svg, 6) + iconBox(520, 110, 150, '<clipPath id="fg"><rect x="-75" y="-75" width="150" height="150"/></clipPath><g clip-path="url(#fg)" filter="url(#dogv6)">' + glass + '</g>', at(u, .3, .3)) + tag("إزاز مشجّر", 520, 220, at(u, .7, .3), 22, BLUE);
});
// 10 · «طب بيعرفك إزاي؟»: the dog at the owner's feet, looking up, a question mark
shot(10, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var o = owner(400, FL, 1.25, t, { mouth: "smile", look: [-.6, .5], tilt: -6 }), p = pup(170, FL, 2.1, t, { head: -18, mouth: .7 });
  return paper() + room(FL) + o.svg + shadow(170, FL, 150) + p.svg + G("", T("؟", 230, 170, 130, ORANGE, 800), at(u, .4, .3));
}, { tr: "out" });
// 11 · the Budapest scans: your brain answers a face far more than the back of a head; his barely tells them apart
shot(11, push(320, 400, 1.02, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, .4, .5), k2 = at(u, d * .45, .5);
  var face = PERSON.head ? "" : "";
  var P1 = owner(150, 330, .78, t, { mouth: "smile" });
  s += '<clipPath id="hc1"><rect x="60" y="20" width="180" height="140"/></clipPath><g clip-path="url(#hc1)">' + P1.svg + '</g>' + R(60, 20, 180, 140, "none", 2) + T("وش", 150, 186, 22, INK, 800);
  s += R(400, 20, 180, 140, "#efe6d0", 2) + backHead(490, 80, 1.1) + T("قفا", 490, 186, 22, INK, 800);
  // your brain
  s += G("", T("مخك", 160, 250, 26, INK, 800) + humanBrain(160, 340, .9, { face: k }) + R(80, 430, 50, 120, "none", 0) + R(80, lerp(560, 440, k), 40, lerp(0, 120, k), ORANGE, 2) + R(140, lerp(560, 530, k), 40, lerp(0, 30, k), GREY, 2) + T("وش", 100, 590, 18, INK, 700) + T("قفا", 160, 590, 18, INK, 700), k);
  s += G("", T("مخ الكلب", 480, 250, 26, INK, 800) + dogBrain(490, 340, .9, {}) + R(400, lerp(560, 490, k2), 40, lerp(0, 70, k2), "#d9b44a", 2) + R(460, lerp(560, 494, k2), 40, lerp(0, 66, k2), "#d9b44a", 2) + T("وش", 420, 590, 18, INK, 700) + T("قفا", 480, 590, 18, INK, 700) + T("≈", 450, 470, 40, ORANGE, 800), k2);
  return s + '<path d="M320 230 V620" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>' + G("", tag("المجر 2020", 320, 690, 1, 22), at(u, .8, .3));
});
// 12 · it's your smell: the owner walks in, a scent trail drifts to the dog's lifted nose
shot(12, pan(300, 400, 340, 400, 1.0), function (u, d, t) {
  var wx = lerp(620, 470, at(u, 0, d * .8)), w = walker(wx, FL, 1.2, t * 6, false, { mouth: "smile" }), p = pup(140, FL, 1.9, t, { head: -26, sniff: 1, mouth: .2 });
  var s = paper() + room(FL, { plant: false, frameX: 300 }) + w.svg + shadow(140, FL, 130) + p.svg + cloud(wx, FL - 260, 60, t, ORANGE, at(u, .6, .6));
  s += scent(wx - 30, FL - 260, p.nose[0] + 6, p.nose[1], t, at(u, 1.0, 1.4));
  return s + G("", tag("ريحتك", 330, 150, 1, 34, ORANGE), at(u, d * .6, .3));
});
// 13 · 300 million smell cells against your 6 million
shot(13, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .3, d * .45), k2 = at(u, d * .5, .6), p = pup(170, 330, 1.35, t, { head: -10, sniff: 1, mouth: 0 }), o = owner(470, 330 + 40, .62, t, { mouth: "neutral" });
  var s = paper() + p.svg + '<clipPath id="oc"><rect x="380" y="70" width="180" height="270"/></clipPath><g clip-path="url(#oc)">' + o.svg + '</g>';
  s += R(80, 420, 200, 0, "none", 0) + N(count(300, k), 170, 470, 60, ORANGE) + T("مليون خلية شم", 170, 510, 22, INK, 700);
  s += G("", N("6", 470, 470, 60, INK) + T("مليون بس", 470, 510, 22, INK, 700), k2);
  s += R(70, 560, Math.max(1, 490 * k), 40, ORANGE, 2) + G("", R(70, 620, 500 * 6 / 300 + 4, 40, GREY, 2), k2);
  return s + T("كلبك", 70, 548, 20, INK, 700, "start") + G("", T("إنت", 70, 608, 20, INK, 700, "start"), k2);
});
// 14 · a spoon of sugar in two Olympic pools — and he'd smell it
shot(14, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .5, 1.4), s = paper();
  s += pool(40, 420, 270, 140, t) + pool(340, 420, 270, 140, t) + measure(40, 600, 310, 600, at(u, .3, .6), "") + measure(340, 600, 610, 600, at(u, .5, .6), "") + G("", T("50 متر", 175, 640, 24, INK, 800) + T("50 متر", 475, 640, 24, INK, 800), at(u, .9, .3));
  s += spoon(160, 260, -18 + 30 * k, k, t);
  if (k >= 1) s += cloud(175, 470, 50, t, "#fbf8f1", 1, 3);
  return s + iconBox(530, 150, 160, G("scale(.42) translate(-120 110)", pup(60, 40, 1.3, t, { head: -14, sniff: 1, mouth: 0 }).svg) + T("حاسس!", 0, 64, 18, ORANGE, 800), at(u, d * .55, .3)) + tag("معلقة سكر", 160, 140, at(u, .3, .3), 26, ORANGE);
});
// 15 · «طب مناخيره بتعمل كده إزاي؟»: in close on the head, the nose twitching
shot(15, push(470, 320, 2.2, 2.6), function (u, d, t) {
  var p = pup(300, 560, 2.2, t, { head: -6, sniff: 1, mouth: 0 });
  return paper() + p.svg + G("", T("؟", p.nose[0] + 50, p.nose[1] - 30, 60, ORANGE, 800), at(u, .4, .3)) + scent(p.nose[0] + 200, p.nose[1] - 20, p.nose[0] + 6, p.nose[1], t, at(u, .2, .8), ORANGE, 2);
}, { tr: "in" });
// 16 · the snout cut: one path along the floor to the throat (breathing), a share up over the shelf to the smell room
shot(16, push(330, 330, .98, 1.08), function (u, d, t) {
  var ka = at(u, .4, 1.6), kl = at(u, d * .45, .5), kh = at(u, d * .62, .5);
  return paper() + G("translate(-60 60)", snoutCut(t, { air: ka, hl: kh > 0 ? "recess" : "", bulb: kh >= 1 }) +
    label(520, 330, 470, 420, "للنفس", BLUE, kl, 26) + label(440, 262, 470, 150, "أوضة الريحة", ORANGE, kh, 26) + label(386, 250, 300, 120, "المخ", OLIVE, at(u, d * .8, .5), 22));
}, { tr: "in" });
// 17 · breathing out through the side slits, so the sniffing never stops
shot(17, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var s = paper() + muzzleFront(320, 420, 1.0) + noseFront(320, 340, 1.0, t, { sniff: 1 }), cyc = (t * .9) % 1, inh = cyc < .5;
  [-1, 1].forEach(function (sd) {
    s += G("", arrow(320 + sd * 70, 120, 320 + sd * 62, 270, BLUE, 6, clamp(cyc * 2.4)), inh ? 1 : 0);
    for (var i = 0; i < 4; i++) { var p = clamp((cyc - .5) * 2 - i * .08); if (p > 0 && p < 1) s += '<path d="M' + f(320 + sd * (120 + p * 140)) + ' ' + f(340 + 30 + p * 60 + i * 12) + ' q' + f(sd * 14) + ' -10 ' + f(sd * 28) + ' 0" stroke="#9fbccb" stroke-width="6" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; }
  });
  return s + label(262, 330, 120, 600, "فتحة على الجنب", OLIVE, at(u, .8, .5), 24) + G("", tag(inh ? "شهيق" : "زفير", 320, 70, 1, 28, BLUE), at(u, .3, .3));
});
// 18 · each nostril smells on its own, so he knows where it comes from (like your two ears)
shot(18, push(330, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + muzzleFront(380, 470, .9) + noseFront(380, 400, .9, t, { sniff: 1 }), src = [70, 260];
  s += cloud(src[0], src[1], 50, t, ORANGE, at(u, .2, .4)) + scent(src[0] + 30, src[1] + 10, 316, 368, t, at(u, .5, .8), ORANGE, 3) + scent(src[0] + 30, src[1] + 10, 444, 368, t, at(u, .5, .8) * .5, ORANGE, 1);
  s += G("", numBox("+", 316, 300, 1, 22) + numBox("−", 444, 300, 1, 22), at(u, 1.6, .3)) + arrow(250, 620, 90, 620, ORANGE, 6, at(u, d * .55, .5)) + G("", T("من هنا", 170, 670, 24, ORANGE, 800), at(u, d * .6, .3));
  var ear = '<ellipse cx="0" cy="0" rx="22" ry="34" fill="#e0a98a" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -16 q14 4 8 18 q-6 10 4 16" stroke="' + INK + '" stroke-width="2" fill="none"/>' + wave(-60, 0, -26, 0, t, BLUE, 5, 10, 1, 2.4);
  return s + iconBox(540, 110, 130, ear, at(u, d * .7, .3));
});
// 19 · in the scanner, the owner's smell lights the reward centre more than any other smell
shot(19, push(330, 380, 1.0, 1.06), function (u, d, t) {
  var s = paper() + R(-400, 520, 1440, 400, "#e3d7bd", 0) + mri(520, 480, t);
  var p = dog({ x: 395, y: 468, s: 1.05, dir: 1, head: 6, tail: 6 * Math.sin(t * 3), eyes: blink(t, 1), mouth: 0, sniff: .6 });
  s += p.svg + '<path d="M' + 500 + ' ' + 376 + ' A60 104 0 0 1 ' + 500 + ' ' + 584 + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + R(530, 250, 100, 300, "#e4e6e2", 0) + R(270, 400, 90, 60, "#f4ecdb", 2, 6) + T("ريحة صاحبه", 315, 435, 13, ORANGE, 800);
  var kc = at(u, d * .4, 1);
  return s + inset(180, 210, 130, dogBrain(10, 10, 1.1, { caudate: kc }), at(u, .5, .4)) + label(176, 202, 330, 90, "مركز الفرحة", ORANGE, at(u, d * .5, .5), 24) + cloud(315, 400, 30, t, ORANGE, kc);
});
// 20 · the myth: he sees in black and white. No.
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var o = owner(320, FL, 1.25, t, { mouth: "neutral" });
  return paper() + dvDefs(4) + '<g filter="url(#grey)">' + room(FL) + o.svg + '</g>' + G("", cross(320, 330, 3, at(u, d * .7, .5)), 1) + G("", tag("أبيض وإسود", 320, 120, 1, 32), at(u, .3, .3));
});
// 21 · fewer colours, but better at movement and in the dark: the dog's eye shine at night, a ball rolling
shot(21, pan(300, 400, 360, 400, 1.0), function (u, d, t) {
  var s = paper() + R(-400, -400, 1440, 1200, "#20242c", 0) + R(-400, FL, 1440, 400, "#2c2f36", 0) + '<path d="M-400 ' + FL + ' H1040" stroke="#555a62" stroke-width="2"/>' + moon(520, 110, 34);
  var bx = 600 - ((u * 220) % 900), p = pup(200, FL, 1.8, t, { head: -4, mouth: 0, tail: 20 * Math.sin(t * 10) });
  s += '<g opacity=".55">' + p.svg + '</g>' + C(p.eye[0], p.eye[1], 9, "#bfe6c4", 0) + '<circle cx="' + f(p.eye[0]) + '" cy="' + f(p.eye[1]) + '" r="' + f(16 + 3 * Math.sin(t * 6)) + '" fill="#bfe6c4" opacity=".25"/>';
  s += C(bx, FL - 22, 22, "#d9b44a", 2) + '<path d="M' + f(bx + 30) + ' ' + (FL - 30) + ' h50 M' + f(bx + 30) + ' ' + (FL - 16) + ' h36" stroke="#d9b44a" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
  return s + G("", tag("الحركة", 480, 520, 1, 26, ORANGE), at(u, d * .35, .3)) + G("", tag("الضلمة", 140, 180, 1, 26, BLUE), at(u, d * .6, .3));
});
// 22 · the recap: blurry eye, few colours, a nose that reads your smell like a fingerprint
shot(22, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), ks = [at(u, .2, .4), at(u, d * .3, .4), at(u, d * .55, .4)];
  s += G("", R(40, 60, 260, 200, "#f4ecdb", 2) + G("translate(170 160) scale(.42) translate(-290 -220)", eyeCut(290, 220, 120, "dog", t, {})) + T("مغبّشة", 170, 300, 26, INK, 800), ks[0]);
  s += G("", R(340, 60, 260, 200, "#f4ecdb", 2) + C(420, 160, 46, "#4a63b8", 2.4) + C(520, 160, 46, "#d9b44a", 2.4) + T("ألوان قليلة", 470, 300, 26, INK, 800), ks[1]);
  var fp = ""; for (var i = 0; i < 9; i++) fp += '<ellipse cx="0" cy="' + f(i * 1.2) + '" rx="' + f(16 + i * 11) + '" ry="' + f(22 + i * 13) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="' + (i % 2 ? "30 6" : "60 8") + '" stroke-dashoffset="' + f(t * 20 * (i % 2 ? 1 : -1)) + '"/>';
  s += G("", R(140, 340, 360, 320, "#f4ecdb", 2) + G("translate(320 470)", fp) + noseFront(320, 560, .32, t, { sniff: 1 }) + T("ريحتك = بصمة", 320, 700, 28, ORANGE, 800), ks[2]);
  return s;
});
// 23 · identical twins, same house, same food — trained dogs still tell their smells apart
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var a = owner(170, FL, 1.0, t, { mouth: "smile" }), b = owner(470, FL, 1.0, t + .7, { mouth: "smile" }), k = at(u, d * .4, d * .4);
  var p = pup(lerp(320, 250, k), FL, 1.3, t, { dir: -1, head: -14, sniff: 1, walk: k > 0 && k < 1 ? 1 : 0, ph: t * 8, mouth: .6 });
  var s = paper() + room(FL, { plant: false, frame: false }) + a.svg + b.svg + cloud(170, FL - 300, 70, t, ORANGE, at(u, .6, .5), 1) + cloud(470, FL - 300, 70, t, "#c8892f", at(u, .6, .5), 40);
  s += p.svg + G("", tag("توأم متطابق", 320, 110, 1, 30), at(u, .2, .3)) + check(170, 200, 1.1, at(u, d * .85, .4), OLIVE);
  return s;
});

// ══ the hook card art (608 × 660): line 0 the owner, wiped into what the dog sees; line 1 the colours that go;
// line 2 the dog running to him all the same ══
SCENE.intro = function (svg, t, li) {
  var fl = 600, u0 = t - LN[0].start, o = owner(304, fl, 1.18, t, { mouth: "smile" }), base = room(fl, { plantX: 520, frameX: 150, rugX: 304 }) + o.svg, s;
  var w = li === 0 ? lerp(620, 304, ease((u0 - .6) / 1.2)) : 304;
  if (li === 0) s = split(w, base, dogView(base, 5), 0, 660) + (u0 > .9 ? T("إنت", 150, 60, 30, INK, 800) + T("هو", 460, 60, 30, INK, 800) : "");
  else s = dogView(base, 5);
  if (li >= 1) { var u1 = t - LN[1].start;
    s += G("", R(40, 30, 528, 100, PAPER, 2) + C(120, 80, 30, SHIRT, 2) + C(230, 80, 30, "#4f9a4a", 2) + C(380, 80, 30, dvHex(SHIRT), 2) + C(490, 80, 30, dvHex("#4f9a4a"), 2) + arrow(268, 80, 340, 80, INK, 4, 1), ease(u1 / .3)) +
      cross(305, 80, .8, ease((u1 - .6) / .4)); }
  if (li >= 2) { var u2 = t - LN[2].start, k = ease(u2 / 1.2), p = pup(lerp(-60, 170, k), fl, 1.35, t, { walk: k < 1 ? 1 : 0, ph: t * 10, head: -16, tail: 24 * Math.sin(t * 12), mouth: .8 });
    s += p.svg + check(470, 220, 1.3, ease((u2 - 1) / .4), OLIVE); }
  return s;
};
// the bumper (180 × 200): a dog's head sniffing a scent trail
SCENE.bumper = function (u, t) {
  var p = dog({ x: 30, y: 210, s: 1.1, dir: 1, head: -6, sniff: 1, tail: 10 * Math.sin(t * 8), mouth: 0 });
  return p.svg + scent(190, 70, p.nose[0] + 2, p.nose[1], t, 1, ORANGE, 2);
};
// the summary card art (600 × 280): the eye, the two colours, the nose with its smell cell count, the owner's smell
SCENE.outro = function (svg, u, t) {
  var p = dog({ x: 150, y: 270, s: 1.35, dir: 1, head: -8, sniff: 1, tail: 14 * Math.sin(t * 7), mouth: .3 });
  return p.svg + scent(560, 120, p.nose[0] + 4, p.nose[1], t, 1, ORANGE, 3) + cloud(560, 120, 30, t, ORANGE, 1) +
    callout("1", p.eye[0] - 6, p.eye[1] - 28, ease(u / .3)) + callout("2", p.eye[0] + 26, p.eye[1] - 40, ease(u / .3 - .5)) + callout("3", p.nose[0] + 10, p.nose[1] + 30, ease(u / .3 - 1)) + callout("4", 560, 70, ease(u / .3 - 1.5));
};

