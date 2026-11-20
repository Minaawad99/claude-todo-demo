window.CHUNKS = [[0.0, 0.6], [0.0], [0.0, 0.5918], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.5091], [0.0, 0.4386], [0.0, 0.2533, 0.5867], [0.0, 0.36], [0.0], [0.0, 0.2319, 0.7101], [0.0, 0.6857], [0.0, 0.2571, 0.5429, 0.7714], [0.0, 0.5, 0.8333], [0.0, 0.3836, 0.6986], [0.0, 0.5429], [0.0, 0.5938], [0.0, 0.55], [0.0, 0.2683, 0.6341], [0.0, 0.5088], [0.0, 0.1538, 0.5641], [0.0, 0.5082], [0.0, 0.6508], [0.0, 0.3763, 0.7849], [0.0, 0.1765, 0.3765, 0.7529], [0.0, 0.2771, 0.5904], [0.0, 0.4694], [0.0], [0.0]];
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

// ── «السكر بييجي منين؟» — drawings. People (fig, limb, ik, rel, HB) are copied from videos/choking/sketch/shots.js and keep
// real body proportions (Drillis & Contini). The pancreas follows a real anatomy picture (refs/SOURCES.md): it lies across
// the back of the belly behind the stomach, its head inside the C of the duodenum (viewer left), its tail up toward the spleen.

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}


// ── people: flat side-view figures facing left. Joints by angle (deg from straight down, + toward the front) or hands by IK.
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {   // elbow for a two-bone arm reaching tg; bend +1 / -1 picks the side
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
// Proportions from real body measurements (Drillis & Contini segment lengths as fractions of the standing height H,
// side-view depths from adult anthropometry). H = 400 units at s = 1:
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.06H
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
// o: {x, y (hip joint), s, lean, shirt, hair, legs: [[thigh, shin], [thigh, shin]], hands: [[x,y] | rel(), …], bend: [±1, ±1], belly, mouth, tilt}
// returns {far, body, near}: draw far, then whatever goes between, then body, then near. at(h, side): a point h above the hip
// along the trunk and side units to the front (+) or back (−).
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {   // two tapered segments: ink outlines first, then fills, so the joint stays clean
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]];   // the foot points to the front, square to the shank
    var toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1] + b[1] * 0 + 0], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    if (o.kneel) shoe = "";
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  // trunk outline: front then back, measured depths (chest 0.13H, waist 0.115H, seat 0.14H)
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  if (o.belly) fr = [[-6, 18], [14, 34], [34, 46], [56, 40], [76, 30], [92, 28], [110, 22], [120, 10]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var belt = atF(10, 0), tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  // head: 0.115H deep, 0.13H tall, face to the front; nose, ear, hair at the back and top
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.mouth ? '<ellipse cx="' + f(-rx * .82) + '" cy="' + f(ry * .48) + '" rx="' + f(rx * .13) + '" ry="' + f(ry * .08 + ry * .08 * o.mouth) + '" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 10 + 26 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
// a beat 0..1 repeating n times over dur seconds starting at u0: 0 rest, peaks at mid-beat
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }
function chips(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 44) + '" cy="' + y + '" r="17" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 44, y + 7, 18, c ? "#fff" : INK); } return s; }

// ── materials for this episode ──
var PLASMA = "#f0dcc8", VESSEL = "#b8574a", RBC = "#c4544a", RBC2 = "#a8433b", SUGC = "#f2e3b8", CELLC = "#efd3c0", CELLM = "#c98a72",
    NUC = "#b9786a", KEYC = "#8f9a52", RUST = "#9a5a2e", PANC = "#e3c27a", PANC2 = "#c9a45a", STOM = "#d9a08e", LIVER = "#a8574a",
    SPLEEN = "#8e4a52", DUOD = "#d38f86", MUSC = "#c46a5a", MUSC2 = "#a9503f", IMMUNE = "#7f97a6", CAN = "#b84a3a";
var SHIRT_G = "#8b9a72", SHIRT_B = "#7f97a6", SHIRT_T = "#b9a98a";

// a glucose molecule: a small hexagon ring (the real glucose ring is six-sided)
function sugar(x, y, r, op) {
  r = r || 9; var d = "";
  for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; d += (i ? "L" : "M") + f(x + Math.cos(a) * r) + " " + f(y + Math.sin(a) * r); }
  return '<path d="' + d + 'Z" fill="' + SUGC + '" stroke="' + ORANGE + '" stroke-width="' + f(Math.max(1.4, r * .2)) + '" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + f(op) + '"' : "") + '/>';
}
// the insulin key: a bow ring, a shaft and teeth (pointing right at rot 0)
function key(x, y, s, rot, col) {
  s = s || 1; col = col || KEYC;
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s) + ")",
    '<path d="M-6 -5 H40 V5 H-6 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/><path d="M26 5 V14 H32 V5 M36 5 V11 H40 V5" fill="' + col + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="-16" cy="0" r="14" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-16" cy="0" r="5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>');
}
// a blood vessel cut open along its length: wall, plasma, red cells and sugar drifting right. o: {n sugar count, sp speed, x0, x1}
function vessel(y, h, t, o) {
  o = o || {}; var x0 = o.x0 == null ? -260 : o.x0, x1 = o.x1 == null ? 900 : o.x1, W = x1 - x0, sp = o.sp || 46, s = "";
  s += R(x0, y - 14, W, h + 28, VESSEL, 2.4) + R(x0, y, W, h, PLASMA, 2) + '<rect x="' + x0 + '" y="' + f(y - 14) + '" width="' + W + '" height="14" fill="url(#hatch)" opacity=".35"/><rect x="' + x0 + '" y="' + f(y + h) + '" width="' + W + '" height="14" fill="url(#hatch)" opacity=".35"/>';
  for (var i = 0; i < 9; i++) { var x = x0 + ((hash(i + 3) * W + t * sp * (.8 + hash(i) * .3)) % W), yy = y + 18 + hash(i + 11) * (h - 36);
    s += G("translate(" + f(x) + " " + f(yy) + ") rotate(" + f(hash(i + 5) * 60 - 30 + t * 20) + ")", '<ellipse rx="19" ry="9" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.6"/><ellipse rx="9" ry="3.5" fill="' + RBC2 + '"/>'); }
  var n = o.n == null ? 8 : o.n;
  for (i = 0; i < n; i++) { var xs = x0 + ((hash(i + 40) * W + t * sp) % W), ys = y + 14 + hash(i + 70) * (h - 28) + 4 * Math.sin(t * 2 + i); s += sugar(xs, ys, 9); }
  return s;
}
// a body cell seen in cut: membrane, cytoplasm, nucleus, and one locked door on top at (cx, cy - r).
// o: {open 0..1, rust 0..1, inside: number of sugars inside, glow 0..1 (burning sugar), tired}
function cell(cx, cy, r, t, o) {
  o = o || {}; var s = "", br = 1 + .012 * Math.sin(t * 2.1);
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * 1.08 * br) + '" ry="' + f(r * br) + '" fill="' + CELLC + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * 1.08 * br - 9) + '" ry="' + f(r * br - 9) + '" fill="none" stroke="' + CELLM + '" stroke-width="3"/>';
  if (o.glow) s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy + r * .15) + '" rx="' + f(r * .8) + '" ry="' + f(r * .6) + '" fill="' + ORANGE + '" opacity="' + f(.18 * o.glow * (1 + .25 * Math.sin(t * 5))) + '"/>';
  s += '<ellipse cx="' + f(cx + r * .25) + '" cy="' + f(cy + r * .22) + '" rx="' + f(r * .3) + '" ry="' + f(r * .24) + '" fill="' + NUC + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(cx + r * .25) + '" cy="' + f(cy + r * .22) + '" rx="' + f(r * .3) + '" ry="' + f(r * .24) + '" fill="url(#hatch)" opacity=".5"/>';
  [[-.45, .2, 20], [-.2, .55, -25], [.6, -.15, 50]].forEach(function (m) { s += G("translate(" + f(cx + m[0] * r) + " " + f(cy + m[1] * r) + ") rotate(" + m[2] + ")", '<ellipse rx="' + f(r * .14) + '" ry="' + f(r * .06) + '" fill="#d99a7e" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(-r * .1) + ' 0 q' + f(r * .05) + ' -5 ' + f(r * .1) + ' 0 t' + f(r * .1) + ' 0" stroke="' + INK + '" stroke-width="1" fill="none"/>'); });
  for (var i = 0; i < (o.inside || 0); i++) { var a = hash(i + 90) * 6.28 + t * .3, rr = r * (.2 + .45 * hash(i + 91)); s += sugar(cx + Math.cos(a) * rr * 1.05 - r * .2, cy - r * .1 + Math.sin(a) * rr * .7, 8, o.glow ? 1 - .5 * o.glow * hash(i) : 1); }
  if (o.glow) for (i = 0; i < 3; i++) { var p = (t * .9 + i / 3) % 1; s += '<path d="M' + f(cx - r * .3 + i * r * .3) + ' ' + f(cy + r * .1 - p * r * .5) + ' q6 -10 0 -20 q-6 -10 0 -18" stroke="' + ORANGE + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(o.glow * (1 - p)) + '"/>'; }
  s += door(cx, cy - r * br, o.open || 0, o.rust || 0, t);
  return s;
}
// the locked door in the membrane: two halves that slide apart when the key turns, a keyhole, rust spots
function door(x, y, open, rust, t) {
  var g = 14 * open, s = "";
  s += R(x - 30 - g, y - 18, 30, 36, BEIGE, 2.2, 3) + R(x + g, y - 18, 30, 36, BEIGE, 2.2, 3);
  if (open < .2) s += '<circle cx="' + f(x) + '" cy="' + f(y - 4) + '" r="5" fill="' + INK + '"/><path d="M' + f(x - 3) + ' ' + f(y - 2) + ' L' + f(x - 5) + ' ' + f(y + 10) + ' L' + f(x + 5) + ' ' + f(y + 10) + ' L' + f(x + 3) + ' ' + f(y - 2) + ' Z" fill="' + INK + '"/>';
  if (rust > 0) [[-22, -10, 6], [-12, 8, 8], [16, -8, 7], [22, 10, 5], [4, 12, 5], [-4, -12, 4]].forEach(function (p, i) { if (rust > i / 7) s += '<circle cx="' + f(x + p[0] + (p[0] < 0 ? -g : g)) + '" cy="' + f(y + p[1]) + '" r="' + f(p[2] * clamp(rust * 1.4)) + '" fill="' + RUST + '" stroke="' + INK + '" stroke-width="1" opacity=".9"/>'; });
  return s;
}
// the rule picture: blood on top, a cell under it. sugar bumps against the closed door; o.key: 0..1 key arriving and turning,
// o.flow: 0..1 sugar falling through the open door; o.rust; o.jiggle (a rusty key that won't turn)
function rule(t, u, o) {
  o = o || {}; var s = vessel(110, 150, t, { n: o.n == null ? 9 : o.n, x0: o.x0, x1: o.x1 }), cx = 320, cy = 560, r = 190, dy = cy - r;
  var turn = o.key == null ? 0 : clamp(o.key), open = o.rust ? clamp(o.key) * (1 - o.rust) * .35 : turn;
  s += cell(cx, cy, r, t, { open: open, rust: o.rust, inside: o.inside || 0, glow: o.glow });
  // sugars waiting at the door (bobbing against it when closed)
  for (var i = 0; i < 4; i++) { var bx = cx - 70 + i * 46, by = dy - 52 - 10 * Math.abs(Math.sin(t * 3 + i)); if (!o.flow || i > 1) s += sugar(bx, by, 10); }
  if (o.flow) for (i = 0; i < 5; i++) { var p = (t * .55 + i / 5) % 1; s += sugar(cx + 6 * Math.sin(i), lerp(dy - 70, dy + 120, p), 10, clamp(o.flow * 2) * (p < .85 ? 1 : (1 - p) / .15)); }
  if (o.key != null && o.key > 0) {
    var kx = lerp(-60, cx - 62, ease(clamp(o.key * 2))), wig = o.jiggle ? 6 * Math.sin(t * 16) : 0;
    s += key(kx, dy + 2, 1.1, wig, KEYC);
  }
  return s;
}
// the belly, opened from the front: liver, stomach, duodenum C, pancreas behind the stomach, spleen. o.lift 0..1 lifts the
// stomach away to show the pancreas; o.hl highlights the pancreas; o.work 0..1 makes it pulse; o.grey dulls it
function belly(t, o) {
  o = o || {}; var s = "";
  s += P("M60 120 C60 60 140 30 200 30 L440 30 C500 30 580 60 580 120 L600 800 L40 800 Z", SKIN, 2.6) + '<path d="M60 120 C60 60 140 30 200 30 L440 30 C500 30 580 60 580 120 L600 800 L40 800 Z" fill="url(#hatch)" opacity=".15"/>';
  s += P("M110 150 C150 110 490 110 530 150 L540 740 L100 740 Z", "#f1e5d2", 2);
  // ribs at the top edge
  for (var i = 0; i < 3; i++) s += '<path d="M110 ' + (170 + i * 34) + ' Q200 ' + (220 + i * 34) + ' 300 ' + (210 + i * 30) + ' M530 ' + (170 + i * 34) + ' Q440 ' + (220 + i * 34) + ' 340 ' + (210 + i * 30) + '" stroke="' + BONE + '" stroke-width="9" fill="none" stroke-linecap="round" opacity=".55"/>';
  // spleen (far right, patient's left) and the pancreas lying across the back
  s += G("rotate(-28 500 330)", '<ellipse cx="500" cy="330" rx="34" ry="70" fill="' + SPLEEN + '" stroke="' + INK + '" stroke-width="2.2"/>');
  var pk = o.work ? 1 + .04 * Math.sin(t * 7) * o.work : 1;
  s += G("translate(330 470) scale(" + f(pk) + ") translate(-330 -470)", pancreas(o.hl, o.grey, t));
  // duodenum: the C round the pancreas head
  s += limb([[300, 405], [240, 400], [196, 440], [190, 520], [214, 586], [290, 606], [380, 588]], 34, DUOD);
  // liver (viewer left, under the ribs) and gallbladder
  s += P("M100 170 C180 140 330 150 400 190 C380 250 300 300 200 330 C140 340 100 300 100 170 Z", LIVER, 2.4) + '<path d="M100 170 C180 140 330 150 400 190 C380 250 300 300 200 330 C140 340 100 300 100 170 Z" fill="url(#hatch)" opacity=".3"/>';
  s += '<ellipse cx="236" cy="330" rx="22" ry="14" fill="#6b7a3e" stroke="' + INK + '" stroke-width="2"/>';
  // stomach: the J under the left ribs, outlet into the duodenum; lifts away and fades to show what is behind it
  var lf = clamp(o.lift || 0), dy = -150 * lf, op = 1 - .72 * lf;
  s += G("translate(" + f(40 * lf) + " " + f(dy) + ")", P("M380 160 C450 150 520 200 520 290 C520 380 450 440 370 440 C330 440 310 425 296 408 L306 384 C330 394 350 398 380 392 C430 380 450 330 430 280 C415 240 395 220 386 196 Z", STOM, 2.4) +
    '<path d="M400 230 C450 260 470 320 440 370 M420 210 C480 250 500 330 460 400" stroke="#b9786a" stroke-width="2" fill="none"/>' + limb([[384, 180], [380, 110]], 20, STOM), op);
  return s;
}
// the pancreas: a lobulated body from the head (in the duodenum's C) up to the tail by the spleen; hl colours it olive-yellow
function pancreas(hl, grey, t) {
  var c = [[236, 520], [282, 494], [340, 470], [400, 446], [452, 412], [482, 392]], w = [52, 40, 34, 32, 28, 20];
  var top = [], bot = [];
  for (var i = 0; i < c.length; i++) { var a = i < c.length - 1 ? Math.atan2(c[i + 1][1] - c[i][1], c[i + 1][0] - c[i][0]) : Math.atan2(c[i][1] - c[i - 1][1], c[i][0] - c[i - 1][0]), nx = -Math.sin(a), ny = Math.cos(a);
    top.push([c[i][0] - nx * w[i], c[i][1] - ny * w[i]]); bot.push([c[i][0] + nx * w[i], c[i][1] + ny * w[i]]); }
  var d = "M" + f(top[0][0]) + " " + f(top[0][1]);
  for (i = 1; i < top.length; i++) { var m = L2(top[i - 1], top[i], .5); d += " Q" + f(m[0] + 6) + " " + f(m[1] - 10) + " " + f(top[i][0]) + " " + f(top[i][1]); }
  d += " Q" + f(c[5][0] + 30) + " " + f(c[5][1] - 4) + " " + f(bot[5][0]) + " " + f(bot[5][1]);
  for (i = bot.length - 2; i >= 0; i--) { m = L2(bot[i + 1], bot[i], .5); d += " Q" + f(m[0] - 4) + " " + f(m[1] + 10) + " " + f(bot[i][0]) + " " + f(bot[i][1]); }
  d += " Q" + f(c[0][0] - 70) + " " + f(c[0][1] + 10) + " " + f(top[0][0]) + " " + f(top[0][1]) + " Z";
  var col = grey ? "#cfc6b0" : hl ? "#e2b85e" : PANC, s = P(d, col, 2.4);
  for (i = 0; i < 14; i++) { var p = along(c, hash(i + 7)), q = hash(i + 8) * 2 - 1; s += '<circle cx="' + f(p[0] + q * 6) + '" cy="' + f(p[1] + q * 18) + '" r="' + f(6 + hash(i) * 6) + '" fill="none" stroke="' + PANC2 + '" stroke-width="1.6"/>'; }
  s += '<path d="' + pathPts(c.slice(0, 5)) + '" stroke="' + PANC2 + '" stroke-width="3" fill="none" opacity=".8"/>';
  return s;
}
// an islet of Langerhans in the pancreas, magnified: pale gland cells round a cluster of darker insulin cells.
// keys 0..1: insulin keys streaming out; o.attack 0..1 immune cells hitting it; o.dead 0..1 the insulin cells going grey
function islet(t, keys, o) {
  o = o || {}; var s = '<rect x="-200" y="-200" width="400" height="400" fill="#efd9a8"/>';
  for (var i = 0; i < 26; i++) { var a = i * 2.4, rr = 120 + (i % 3) * 34; s += C(Math.cos(a) * rr, Math.sin(a) * rr, 26, "#ecca86", 1.4) + '<circle cx="' + f(Math.cos(a) * rr) + '" cy="' + f(Math.sin(a) * rr) + '" r="7" fill="' + PANC2 + '"/>'; }
  for (i = 0; i < 12; i++) { var b = i * 2.1, q = i < 4 ? 26 : 62; var dead = o.dead && hash(i) < o.dead;
    s += C(Math.cos(b) * q * (i ? 1 : 0), Math.sin(b) * q * (i ? 1 : 0), 24, dead ? "#cfc8b8" : "#d68f6a", 1.8) + '<circle cx="' + f(Math.cos(b) * q * (i ? 1 : 0)) + '" cy="' + f(Math.sin(b) * q * (i ? 1 : 0)) + '" r="7" fill="' + (dead ? "#9a9488" : "#8f4f34") + '"/>'; }
  if (keys > 0) for (i = 0; i < 5; i++) { var p = (t * .5 + i / 5) % 1, ang = i * 1.26 + .4; s += G("", key(Math.cos(ang) * (60 + p * 120), Math.sin(ang) * (60 + p * 120), .7, ang * 57), keys * (1 - p)); }
  if (o.attack) for (i = 0; i < 5; i++) { var ang2 = i * 1.26 + 1, rr2 = 150 - 60 * Math.abs(Math.sin(t * 3 + i)) * o.attack, x = Math.cos(ang2) * rr2, y = Math.sin(ang2) * rr2;
    var spikes = ""; for (var k = 0; k < 8; k++) { var e = k * Math.PI / 4; spikes += '<path d="M' + f(x + Math.cos(e) * 22) + ' ' + f(y + Math.sin(e) * 22) + ' L' + f(x + Math.cos(e) * 32) + ' ' + f(y + Math.sin(e) * 32) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; }
    s += G("", spikes + C(x, y, 24, IMMUNE, 2.2) + '<circle cx="' + f(x - 6) + '" cy="' + f(y - 5) + '" r="8" fill="#5f7889"/>', clamp(o.attack * 2)); }
  return s;
}
// a muscle in cut: striped fibres along x, a capillary on top; o.pull 0..1 sugar dropping out of the blood into the fibres
function muscle(t, o) {
  o = o || {}; var s = vessel(130, 110, t, { n: 7 }), squeeze = 1 + .04 * Math.sin(t * 6) * (o.work || 0);
  s += G("translate(320 470) scale(1 " + f(squeeze) + ") translate(-320 -470)", (function () {
    var g = ""; for (var i = 0; i < 5; i++) { var y = 300 + i * 70; g += R(-260, y, 1160, 62, i % 2 ? MUSC : "#cf7a68", 2.2, 30); for (var x = -240; x < 900; x += 26) g += '<path d="M' + x + ' ' + (y + 8) + ' v46" stroke="' + MUSC2 + '" stroke-width="2" opacity=".55"/>'; }
    return g; })());
  // the muscle's own doors along the top edge: open while it works
  for (var j = 0; j < 4; j++) s += door(80 + j * 160, 296, clamp(o.pull || 0), 0, t);
  if (o.pull) for (j = 0; j < 4; j++) for (var i = 0; i < 2; i++) { var p = (t * .6 + i / 2 + j * .21) % 1; s += sugar(80 + j * 160, lerp(214, 360, p), 9, o.pull * (p < .8 ? 1 : (1 - p) / .2)); }
  return s;
}
// a walking man: legs and arms swing with t (gait about one stride per second)
function walker(x, floorY, t, s, shirt, sp) {
  s = s || 1; var ph = t * (sp || 5.2), a = 22 * Math.sin(ph), kneeA = 18 * Math.max(0, Math.sin(ph + 1.2)), kneeB = 18 * Math.max(0, Math.sin(ph + 1.2 + Math.PI));
  var hip = floorY - 212 * s + 4 * Math.abs(Math.cos(ph)) * s;
  return whole(fig({ x: x, y: hip, s: s, lean: 4, shirt: shirt || SHIRT_G, legs: [[a, -kneeA], [-a, -kneeB]], hands: [rel(6 + 6 * Math.abs(Math.sin(ph)), 8 + 34 * Math.sin(ph)), rel(6 + 6 * Math.abs(Math.sin(ph)), 8 - 34 * Math.sin(ph))], bend: [-1, -1] }));
}
// a clock dial filling to k (of 60 minutes)
function dial(x, y, r, k, t) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = C(x, y, r, "#f4ecdb", 3);
  for (var i = 0; i < 12; i++) { var b = i * Math.PI / 6; s += '<path d="M' + f(x + Math.cos(b) * (r - 14)) + ' ' + f(y + Math.sin(b) * (r - 14)) + ' L' + f(x + Math.cos(b) * (r - 4)) + ' ' + f(y + Math.sin(b) * (r - 4)) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 2 : 4) + '"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 16) + ' A' + (r - 16) + ' ' + (r - 16) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 16)) + ' ' + f(y + Math.sin(a) * (r - 16)) + ' Z" fill="' + ORANGE + '" opacity=".35"/>';
  var m = -Math.PI / 2 + t * .8;
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 22)) + ' ' + f(y + Math.sin(a) * (r - 22)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(m) * (r * .5)) + ' ' + f(y + Math.sin(m) * (r * .5)) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}
// food and drink in the reference's flat hand
function sodaCan(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", P("M-34 -80 L34 -80 L38 -70 L38 74 L32 84 L-32 84 L-38 74 L-38 -70 Z", CAN, 2.4) + R(-38, -30, 76, 50, "#f4ecdb", 2) + '<path d="M-24 -6 q12 -14 24 0 t24 0" stroke="' + CAN + '" stroke-width="4" fill="none"/>' + '<ellipse cx="0" cy="-80" rx="34" ry="7" fill="#c6c6c0" stroke="' + INK + '" stroke-width="2"/><rect x="-10" y="-86" width="20" height="6" rx="3" fill="#9a968c" stroke="' + INK + '" stroke-width="1.2"/><path d="M-30 -60 V60" stroke="#fff" stroke-width="5" opacity=".35"/>'); }
function juiceBox(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", R(-34, -66, 68, 132, "#e0a94a", 2.4, 4) + P("M-34 -66 L-22 -84 L22 -84 L34 -66", "#eac06a", 2.2) + '<circle cx="0" cy="6" r="20" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -14 q8 -10 14 -8" stroke="' + OLIVE + '" stroke-width="4" fill="none"/>' + '<path d="M12 -84 L20 -118" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M12 -84 L20 -118" stroke="#f4ecdb" stroke-width="4" stroke-linecap="round"/>'); }
function loaf(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", P("M-70 30 L-70 -20 C-70 -60 70 -60 70 -20 L70 30 Z", "#e8d3a0", 2.4) + P("M-70 -20 C-70 -60 70 -60 70 -20 C50 -34 -50 -34 -70 -20 Z", "#c99a5a", 2) + '<path d="M-40 -2 v26 M0 -2 v26 M40 -2 v26" stroke="#c9b07a" stroke-width="2"/>'); }
function sweets(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", '<ellipse cx="0" cy="26" rx="78" ry="16" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>' + [[-36, 0], [0, -6], [36, 0], [-18, -30], [18, -30]].map(function (p) { return G("translate(" + p[0] + " " + p[1] + ")", R(-22, -16, 44, 32, "#d6a256", 2, 3) + '<path d="M-22 -6 L22 6 M-22 6 L22 -6" stroke="#b07a34" stroke-width="1.6"/><circle cx="0" cy="0" r="4" fill="#efe6cf" stroke="' + INK + '" stroke-width="1"/>'); }).join("")); }
function cigarette(x, y, s, t) { var sm = ""; for (var i = 0; i < 3; i++) { var p = (t * .5 + i / 3) % 1; sm += '<path d="M' + f(76 + 8 * Math.sin(p * 9)) + ' ' + f(-10 - p * 60) + ' q10 -10 0 -20" stroke="' + GREY + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", R(-80, -10, 120, 20, "#f4efe3", 2) + R(-80, -10, 36, 20, "#d29a5a", 2) + R(40, -10, 30, 20, "#8a8478", 2) + '<rect x="62" y="-10" width="8" height="20" fill="' + ORANGE + '"/>' + sm); }
function spoon(x, y, s, heap) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", P("M20 -6 L170 -14 Q180 0 170 14 L20 6 Z", "#c6c6c0", 2) + '<ellipse cx="-20" cy="0" rx="46" ry="26" fill="#c6c6c0" stroke="' + INK + '" stroke-width="2.4"/>' + (heap ? '<path d="M-58 -4 Q-20 -40 18 -4 Z" fill="#fbf8ef" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-30" cy="-14" r="2" fill="' + GREY + '"/><circle cx="-10" cy="-18" r="2" fill="' + GREY + '"/>' : "")); }
function riceBowl(x, y, s) { var g = ""; for (var i = 0; i < 18; i++) g += '<ellipse cx="' + f(-48 + (i % 6) * 19 + (i > 5 ? 9 : 0)) + '" cy="' + f(-12 - Math.floor(i / 6) * 10) + '" rx="7" ry="3.5" fill="#fbf8ef" stroke="' + INK + '" stroke-width="1"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", '<path d="M-64 -10 Q0 -60 64 -10 Z" fill="#fbf8ef" stroke="' + INK + '" stroke-width="2"/>' + g + P("M-74 -8 L74 -8 C70 40 40 56 0 56 C-40 56 -70 40 -74 -8 Z", BLUE, 2.4) + '<path d="M-70 8 H70" stroke="#f4ecdb" stroke-width="4"/>'); }
function pastaPlate(x, y, s) { var g = ""; for (var i = 0; i < 6; i++) g += '<path d="M' + (-50 + i * 4) + ' ' + (-6 - i * 4) + ' q20 -24 40 0 t40 0" stroke="#d9b55a" stroke-width="6" fill="none" stroke-linecap="round"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", '<ellipse cx="0" cy="10" rx="84" ry="22" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/>' + g + '<circle cx="0" cy="-22" r="12" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>'); }
function glassW(x, y, s, lvl) { lvl = lvl == null ? .7 : lvl; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", P("M-40 -70 L-32 70 L32 70 L40 -70 Z", "#eef2f0", 2.4) + P("M" + f(-40 + 8 * (1 - lvl)) + " " + f(70 - 140 * lvl) + " L-32 70 L32 70 L" + f(40 - 8 * (1 - lvl)) + " " + f(70 - 140 * lvl) + " Z", "#9fbccb", 1.6)); }
function toilet(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", R(-30, -90, 60, 56, "#f4efe3", 2.2, 4) + P("M-46 -30 L46 -30 C46 10 26 30 0 30 C-26 30 -46 10 -46 -30 Z", "#f4efe3", 2.4) + R(-22, 30, 44, 40, "#f4efe3", 2.2) + '<ellipse cx="0" cy="-30" rx="46" ry="8" fill="#e3e6e2" stroke="' + INK + '" stroke-width="2"/>'); }
function meter(x, y, s, txt, t) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", R(-56, -90, 112, 180, "#5b5145", 2.6, 18) + R(-40, -70, 80, 56, "#c9d3c0", 1.8, 4) + N(txt, 0, -30, 30, INK) + '<circle cx="-20" cy="20" r="10" fill="#8a8478" stroke="' + INK + '" stroke-width="1.4"/><circle cx="20" cy="20" r="10" fill="#8a8478" stroke="' + INK + '" stroke-width="1.4"/>' + R(-12, 90, 24, 50, "#f4ecdb", 2) + '<circle cx="0" cy="140" r="7" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.4"/>'); }
// a man sitting on a sofa, side view, real proportions (seat 0.25H): o.belly, a soda in the near hand
function sofaMan(x, floorY, t, o) {
  o = o || {}; var s = "", seat = floorY - 100;
  s += R(x - 150, seat, 260, 50, "#8a7a62", 2.4, 10) + R(x + 70, seat - 170, 50, 220, "#8a7a62", 2.4, 14) + R(x - 150, seat + 50, 20, 50, WOOD_D, 2) + R(x + 90, seat + 50, 20, 50, WOOD_D, 2) + R(x - 170, seat - 50, 40, 100, "#8a7a62", 2.4, 14);
  var hip = [x + 40, seat - 6], m = fig({ x: hip[0], y: hip[1], lean: -14, belly: o.belly, shirt: o.shirt || SHIRT_T, legs: [[86, -84], [90, -88]], hands: [o.cup ? rel(70, 46) : rel(30, 30), rel(30, 24)], bend: [1, 1], tilt: 4 });
  s += m.far + m.body + m.near;
  if (o.cup) { var hp = m.at(70, 46); s += G("translate(" + f(hp[0] - 10) + " " + f(hp[1] - 20) + ")", P("M-16 -30 L16 -30 L12 34 L-12 34 Z", CAN, 2) + R(-16, -8, 32, 16, "#f4ecdb", 1.4) + '<path d="M6 -30 L14 -56" stroke="' + INK + '" stroke-width="3"/>'); }
  return s;
}
function people(n, x, y, gap, s, colorOf) { var g = ""; for (var i = 0; i < n; i++) { var c = colorOf(i); g += G("translate(" + f(x + i * gap) + " " + f(y) + ") scale(" + f(s) + ")", '<circle cx="0" cy="-118" r="22" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-34 0 L-34 -62 Q-34 -90 0 -90 Q34 -90 34 -62 L34 0 Z" fill="' + c[1] + '" stroke="' + INK + '" stroke-width="2.2"/>' + (c[2] || "")); } return g; }
function scaleBox(x, y, kg) { return R(x - 90, y, 180, 30, "#e9e4d8", 2.4, 8) + R(x - 34, y + 6, 68, 18, "#c9d3c0", 1.6, 3) + N(kg, x, y + 22, 16, INK); }
function heart(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M0 30 C-40 0 -50 -30 -26 -42 C-12 -48 -2 -40 0 -30 C2 -40 12 -48 26 -42 C50 -30 40 0 0 30 Z" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="2.4"/>'); }
function chunkAt(i, j) { var c = window.CHUNKS[i] || [0]; return (LN[i].end - LN[i].start) * (c[j] || 0); }   // seconds into line i where chunk j starts

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة… خليك فاكرها»: a rule card pinned over a faint cell
shot(4, push(320, 420, 1.05, 1.0), function (u, d, t) {
  var k = at(u, .3, .5);
  return paper() + dim(.7, rule(t, u, { n: 6 })) + G("translate(320 400) rotate(" + f(-3 + 1.5 * Math.sin(t * 1.4)) + ") scale(" + f(pop(clamp(u / 1.2))) + ")",
    R(-200, -110, 400, 220, "#f4ecdb", 2.6, 4) + '<circle cx="0" cy="-96" r="12" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + T("قاعدة", 0, -20, 54, INK, 800) + '<path d="M-120 10 H120" stroke="' + INK + '" stroke-width="1.6"/>' + G("", T("خليك فاكرها", 0, 70, 32, ORANGE, 800), at(u, 1.4, .4)), k);
});
// 5 · sugar can't get into the cell by itself; it needs a key called insulin
shot(5, push(320, 360, 1.0, 1.08), function (u, d, t) {
  var c1 = chunkAt(5, 1), kk = at(u, c1 + .2, 1.2);
  return paper() + rule(t, u, { key: u > c1 ? kk * .5 : null }) + label(240, 180, 190, 320, "السكر", ORANGE, at(u, .3, .5), 26) + label(400, 300, 520, 330, "الخلية", OLIVE, at(u, .8, .5), 26) +
    cross(470, 400, .8, at(u, 1.4, .4)) + (u > c1 ? label(150, 372, 140, 470, "الإنسولين", OLIVE, at(u, c1 + 1.0, .5), 28) : "");
});
// 6 · who makes the key? the pancreas, a small gland behind the stomach
shot(6, push(320, 420, 1.0, 1.12), function (u, d, t) {
  var c1 = chunkAt(6, 1), lift = at(u, c1 + .2, 1.0);
  return paper() + belly(t, { lift: lift, hl: lift > .5 }) + label(470, 300 - 150 * lift, 420, 90, "المعدة", INK, at(u, .5, .5), 24) +
    label(360, 466, 470, 640, "البنكرياس", OLIVE, at(u, c1 + .9, .5), 30) + G("", key(150, 640, 1.2, 0 + 8 * Math.sin(t * 3)) + T("؟", 150, 590, 60, ORANGE, 800), at(u, .2, .3) * (1 - at(u, c1, .3)));
});
// 7 · sugar rises, the pancreas lets out insulin, the cells open and burn the sugar for energy
shot(7, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c1 = chunkAt(7, 1), c2 = chunkAt(7, 2), kk = at(u, c2, 1.0);
  return paper() + rule(t, u, { n: u < c1 ? 6 + Math.floor(u * 3) : 12, key: u > c2 ? kk : null, flow: at(u, c2 + 1.0, .5), inside: u > c2 + 1.2 ? 6 : 0, glow: at(u, c2 + 1.6, .6) }) +
    iconBox(110, 420, 150, G("scale(.36)", islet(t, at(u, c1, .4))), at(u, c1 - .2, .3)) + (u < c2 + .5 ? arrow(240, 80, 240, 30, ORANGE, 6, at(u, .3, .4)) + G("", T("بيعلى", 300, 70, 26, ORANGE, 800), at(u, .5, .3)) : "") +
    G("", tag("طاقة", 470, 690, 1, 30, ORANGE), at(u, c2 + 1.8, .3));
});
// 8 · like a building's doorman: without him the guests stay out in the street
shot(8, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var c1 = chunkAt(8, 1), gone = at(u, c1, .5), s = paper() + floor(640);
  s += R(330, 60, 300, 580, "#d8ccae", 2.6) + '<rect x="330" y="60" width="300" height="580" fill="url(#hatch)" opacity=".2"/>';
  for (var r = 0; r < 3; r++) for (var c = 0; c < 2; c++) s += R(380 + c * 130, 100 + r * 120, 70, 80, "#b9c9cc", 2) + '<path d="M' + (415 + c * 130) + ' ' + (100 + r * 120) + ' v80" stroke="' + INK + '" stroke-width="1.4"/>';
  var op = 1 - gone, dw = 72 * op;
  s += R(390, 470, 110, 170, "#5b4636", 2.4) + R(390, 470, 110 - dw, 170, "#3a2c22", 0) + R(390 + (110 - dw), 470, dw, 170, WOOD, 2.4);
  // the doorman by the door (fades out on «من غيره»), and guests: walking in while he's there, piled up outside after
  s += G("", whole(fig({ x: 540, y: 640 - 212 * .62, s: .62, shirt: "#4a5a6a", hands: [rel(80, 50), null], bend: [-1, -1], tilt: -4 })), op);
  for (var i = 0; i < 3; i++) { var gx = gone > .5 ? 300 - i * 70 : lerp(100 - i * 80, 430, ((t * .25 + i * .3) % 1)), vis = gone > .5 ? 1 : clamp((430 - gx) / 40);
    s += G("translate(" + f(2 * gx) + " 0) scale(-1 1)", walker(gx, 640, gone > .5 ? .3 * Math.sin(t + i) : t + i, .5, [SHIRT_G, SHIRT_T, "#a38aa0"][i], 6), vis); }
  s += G("", key(445, 420, 1, 0), op) + label(540, 470, 470, 380, "البوّاب", OLIVE, at(u, .4, .5), 24) + cross(445, 560, .9, at(u, c1 + .6, .4)) + iconBox(130, 150, 150, G("scale(.32) translate(-320 -560)", cell(320, 560, 190, t, { open: 1 - gone })), at(u, .6, .3));
  return s;
});
// 9 · so where does the disease come from? sugar piling up in the blood, the door shut
shot(9, push(320, 360, 1.12, 1.0), function (u, d, t) {
  return paper() + rule(t, u, { n: 16 }) + G("", T("؟", 320, 560, 200, ORANGE, 800), at(u, .2, .4)) + G("", tag("مرض السكر", 320, 60, 1, 32, ORANGE), at(u, .4, .3));
});
// 10 · type 1: the immune system attacks the insulin cells by mistake, and insulin stops
shot(10, push(320, 400, 1.0, 1.1), function (u, d, t) {
  var c1 = chunkAt(10, 1), c2 = chunkAt(10, 2), att = at(u, c1, .6), dead = at(u, c1 + .6, d - c1 - 1);
  return paper() + G("translate(320 400) scale(1.25)", islet(t, 1 - at(u, c2, .6), { attack: att, dead: dead })) + tag("النوع الأول", 320, 90, at(u, .2, .3), 34, INK) +
    label(320 + Math.cos(1) * 150 * 1.25 * .8, 400 + Math.sin(1) * 150 * 1.25 * .8, 330, 720, "المناعة", BLUE, at(u, c1 + .4, .5), 28) + G("", key(520, 200, 1.2, 0) + cross(520, 200, .8, at(u, c2 + .3, .4)), at(u, c2, .3));
}, { tr: "in" });
// 11 · nothing to do with food, and nobody's fault
shot(11, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var c1 = chunkAt(11, 1);
  return paper() + pastaPlate(150, 330, 1) + draw("M250 330 L400 330", at(u, .4, .5), INK, 3) + arrow(380, 330, 420, 330, INK, 3, at(u, .8, .2)) + G("translate(320 -60) scale(.6)", pancreas(true, false, t), at(u, .6, .3)) +
    cross(320, 330, .9, at(u, 1.0, .4)) + G("", heart(320, 580, 1.4 * (1 + .05 * Math.sin(t * 4)), ORANGE) + tag("مش ذنب حد", 320, 700, 1, 32, INK), at(u, c1, .4));
});
// 12 · type 2: 90% of cases. the key is there, but the lock has rusted
shot(12, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var c1 = chunkAt(12, 1), c2 = chunkAt(12, 2), c3 = chunkAt(12, 3), rust = at(u, c3, 1.0);
  var s = paper() + rule(t, u, { n: 12, key: u > c2 ? at(u, c2, 1.2) : null, rust: u > c3 ? .2 + .8 * rust : 0, jiggle: u > c3 + .6 });
  s += tag("النوع التاني", 160, 300, at(u, .2, .3), 28, INK) + G("", bigNum(count(90, at(u, c1, 1.0)) + "%", "من الحالات", 500, 330, 1, ORANGE, 60), at(u, c1, .3) * (1 - at(u, c2 + .2, .3)));
  s += label(358, 360, 470, 300, "الكالون", RUST, at(u, c3 + .3, .5), 26);
  return s;
});
// 13 · the cells stop listening, so the pancreas works overtime… until it gets tired
shot(13, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var c1 = chunkAt(13, 1), c2 = chunkAt(13, 2), tired = at(u, c2 - .3, .8), work = u > c1 ? 1 - tired : 0;
  var s = paper() + G("translate(0 120) scale(1)", rule(t, u, { n: 14, key: .6, rust: .9, jiggle: true }));
  for (var i = 0; i < 4; i++) s += key(250 - i * 40 + 6 * Math.sin(t * 7 + i), 330 - (i % 2) * 34, .8, 10 * Math.sin(t * 8 + i), KEYC);
  s += iconBox(150, 140, 200, G("scale(.55) translate(-340 -470)", pancreas(true, tired > .5, t)) + (work ? [0, 1, 2].map(function (j) { var p = (t * 1.2 + j / 3) % 1; return '<path d="M' + (40 + j * 20) + ' ' + f(-60 + p * 70) + ' q6 10 0 14 q-6 -4 0 -14" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - p) + '"/>'; }).join("") : ""), at(u, c1 - .2, .3));
  s += G("", tag("شغال زيادة", 420, 120, 1, 28, ORANGE), at(u, c1, .3) * (1 - tired)) + G("", tag("تعب", 420, 120, 1, 30, INK), tired);
  return s;
});
// 14 · what rusts the lock? the belly fat, sitting all day, sugary food and drink
shot(14, push(330, 450, 1.0, 1.08), function (u, d, t) {
  var c1 = chunkAt(14, 1), c2 = chunkAt(14, 2), c3 = chunkAt(14, 3);
  var s = paper() + floor(700) + sofaMan(300, 700, t, { belly: true, cup: true });
  s += R(500, 380, 120, 90, "#3a342c", 2.4, 6) + R(510, 390, 100, 70, "#7f97a6", 0) + '<rect x="510" y="390" width="100" height="70" fill="#fff" opacity="' + f(.1 + .1 * Math.sin(t * 9)) + '"/>' + R(540, 470, 40, 230, WOOD_D, 2);
  s += label(260, 460, 200, 300, "الكرش", ORANGE, at(u, c1, .5), 28) + label(240, 580, 190, 650, "القعدة", ORANGE, at(u, c2, .5), 28) + label(296, 330, 400, 200, "المسكّر", ORANGE, at(u, c3, .5), 28);
  s += inset(120, 130, 80, G("scale(.9) translate(0 30)", door(0, 0, 0, at(u, .6, d - 1), t)), at(u, .3, .3));
  return s;
});
// 15 · how do I protect myself? first: move
shot(15, push(320, 430, 1.1, 1.0), function (u, d, t) {
  var c1 = chunkAt(15, 1), x = lerp(520, 180, clamp(u / d));
  return paper() + floor(660) + walker(x, 660, t, 1, SHIRT_G) + G("", T("؟", 320, 200, 120, ORANGE, 800), at(u, .2, .3) * (1 - at(u, c1, .3))) + G("", tag("اتحرك", 320, 150, 1, 44, ORANGE), at(u, c1, .3)) + check(500, 150, 1.3, at(u, c1 + .4, .4), OLIVE);
});
// 16 · a working muscle pulls sugar out of the blood without waiting for insulin
shot(16, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var c2 = chunkAt(16, 2);
  return paper() + muscle(t, { pull: at(u, .8, .6), work: 1 }) + label(480, 520, 420, 690, "العضلة", ORANGE, at(u, .3, .5), 28) + label(240, 200, 120, 60, "الدم", INK, at(u, .9, .5), 24) +
    G("", key(470, 60, 1, 0) + cross(470, 60, .7, at(u, c2 + .3, .4)), at(u, c2, .3)) + iconBox(120, 690, 140, G("scale(.36) translate(-320 -560)", walker(320, 760, t, 1, SHIRT_G)), at(u, .4, .3));
}, { tr: "in" });
// 17 · half an hour of walking a day, five days a week
hud(17, 18, function (u, t) { var on = Math.min(5, Math.floor(clamp((u - chunkAt(17, 1)) / 2.2) * 5.99)); return chips(5, on, 320, 64); });
shot(17, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, 1.6) * .5;
  return paper() + floor(700) + walker(200 + 30 * Math.sin(t * .6), 700, t, .9, SHIRT_G) + dial(450, 330, 120, k, t) + bigNum(String(Math.round(k * 60)), "دقيقة", 450, 520, at(u, .4, .3), ORANGE, 56);
});
// 18 · if you're overweight, lose just 7% of it (90 kg → about 84)
shot(18, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var c1 = chunkAt(18, 1), k = at(u, c1 + .2, 1.6), kg = Math.round(90 - 6 * k);
  var s = paper() + floor(700) + scaleBox(300, 700, kg + " كجم");
  s += whole(fig({ x: 300, y: 700 - 212, belly: k < .6, shirt: SHIRT_T, hands: [rel(40, 20), rel(40, 16)], legs: [[4, -2], [-4, 2]] }));
  s += bigNum(String(kg), "كيلو", 500, 300, at(u, .4, .3), INK, 70) + numBox("−7%", 500, 440, at(u, c1, .3), 34, true) + arrow(500, 180, 500, 230, ORANGE, 5, k);
  return s;
});
// 19 · a big trial in America: this plus walking cut the risk by 58%
shot(19, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var c2 = chunkAt(19, 2), k = at(u, c2, 1.0), base = 600, h1 = 380, h2 = 380 * (1 - .58 * k);
  var s = paper() + '<path d="M90 ' + base + ' H560" stroke="' + INK + '" stroke-width="2.4"/>';
  s += sweep(130, base - h1, 140, h1, at(u, .5, .8), "u", R(130, base - h1, 140, h1, GREY, 2.2)) + sweep(370, base - h2, 140, h2, at(u, .9, .8), "u", R(370, base - h2, 140, h2, OLIVE, 2.2));
  s += T("من غير", 200, base + 40, 24, INK, 700) + T("مشي ووزن أقل", 440, base + 40, 24, OLIVE, 800) + measure(560, base - h1, 560, base - h2, at(u, c2 + .6, .5), "", 30);
  s += numBox("−58%", 440, base - h2 - 60, at(u, c2 + .8, .3), 34, true) + tag("تجربة 3,234 واحد", 320, 120, at(u, .2, .3), 26, INK) + people(6, 120, 760, 80, .5, function () { return [SKIN, SHIRT_B]; });
  return s;
});
// 20 · what to avoid: soda, boxed juice, white bread and sweets, and cigarettes (one per caption chunk, each crossed out)
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[20], D = LN[20].end - LN[20].start, k1 = at(u, D * (c[1] || .2), .3), k2 = at(u, D * (c[2] || .5), .3), k3 = at(u, D * (c[3] || .8), .3);
  var s = paper() + tag("تتجنب إيه؟", 320, 90, at(u, .1, .3), 36, INK);
  s += appear(k1, sodaCan(170, 280, 1) + juiceBox(330, 290, 1)) + cross(250, 280, 1.4, at(u, D * (c[1] || .2) + .6, .4));
  s += appear(k2, loaf(170, 520, 1) + sweets(400, 520, 1)) + cross(290, 510, 1.4, at(u, D * (c[2] || .5) + .5, .4));
  s += appear(k3, cigarette(320, 700, 1.2, t)) + cross(320, 690, 1.1, at(u, D * (c[3] || .8) + .4, .4));
  return s;
});
// 21 · the myth: diabetes only comes from the sugar you spoon in — no
shot(21, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var c1 = chunkAt(21, 1);
  return paper() + G("rotate(" + f(-8 + 3 * Math.sin(t * 1.6)) + " 320 400)", spoon(260, 400, 1.6, true)) + G("", sugar(240, 300 + 10 * Math.sin(t * 3), 18) + sugar(300, 280 + 10 * Math.sin(t * 3 + 1), 14), at(u, .4, .3)) +
    cross(260, 400, 2.2, at(u, c1, .5)) + tag("لأ", 320, 640, at(u, c1 + .2, .3), 50, ORANGE);
});
// 22 · rice, bread and pasta all turn into sugar; the amount is what matters
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var c1 = chunkAt(22, 1), c2 = chunkAt(22, 2), s = paper(), items = [riceBowl(130, 200, 1), loaf(320, 190, .9), pastaPlate(510, 210, .9)];
  items.forEach(function (it, i) { s += appear(at(u, .2 + i * .4, .3), it) + arrow(130 + i * 190, 270, 130 + i * 190, 330, ORANGE, 5, at(u, c1 + i * .2, .3));
    for (var j = 0; j < 3; j++) s += G("", sugar(100 + i * 190 + j * 30, 380 + 8 * Math.sin(t * 3 + j + i), 12), at(u, c1 + .3 + i * .2, .3)); });
  s += G("", riceBowl(190, 600, .7) + riceBowl(450, 600, 1.35) + T("شوية", 190, 700, 26, OLIVE, 800) + T("كتير", 450, 720, 26, ORANGE, 800) + tag("الكمية", 320, 480, 1, 30, ORANGE), at(u, c2, .4));
  return s;
});
// 23 · more than half of patients in Egypt don't know (62%); thirsty, running to the toilet: get a fasting sugar test
shot(23, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[23], D = LN[23].end - LN[23].start, k2 = D * (c[2] || .4), k3 = D * (c[3] || .6), k4 = D * (c[c.length - 1] || .8), s = paper();
  var g1 = 1 - at(u, k2 - .3, .4);
  s += G("", people(10, 90, 300, 52, .62, function (i) { return i < 6 ? [GREY, "#d8d4cc", T("؟", 0, -160, 30, ORANGE, 800)] : [SKIN, SHIRT_B]; }) + numBox("62%", 220, 400, at(u, .6, .3), 34, true) + T("ميعرفوش", 220, 470, 26, ORANGE, 800), g1 * at(u, .1, .3));
  s += G("", glassW(170, 400, 1.3, .3 + .2 * Math.sin(t * 2)) + T("عطشان", 170, 540, 28, BLUE, 800), at(u, k2 - .2, .3) * (1 - at(u, k4 - .3, .3)));
  s += G("", toilet(460, 420, 1.3) + T("الحمام كتير", 460, 540, 28, BLUE, 800), at(u, k3 - .2, .3) * (1 - at(u, k4 - .3, .3)));
  s += G("", meter(320, 380, 1.3, count(126, at(u, k4, 1)), t) + tag("تحليل سكر صايم", 320, 650, 1, 30, ORANGE), at(u, k4 - .1, .3));
  return s;
});
// 24 · recap: insulin is the key, belly and sitting rust the lock, moving opens it again (one panel per chunk)
shot(24, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var c = window.CHUNKS[24], D = LN[24].end - LN[24].start, k1 = at(u, D * (c[1] || .25), .4), k2 = at(u, D * (c[2] || .5), .4), k3 = at(u, D * (c[3] || .75), .4), s = paper();
  s += G("", key(320, 160, 2.0, 8 * Math.sin(t * 2)) + T("الإنسولين = مفتاح", 320, 250, 30, OLIVE, 800), Math.max(at(u, .2, .3), k1));
  s += G("translate(170 420) scale(2)", door(0, 0, 0, 1, t), k2) + G("translate(100 560) scale(.4)", sofaMan(0, 0, t, { belly: true }), k2);
  s += G("", T("بيصدّي", 170, 620, 28, RUST, 800), k2) + G("translate(470 420) scale(2)", door(0, 0, k3 * (.5 + .5 * Math.abs(Math.sin(t * 2))), 0, t), k3) + G("", walker(470, 620, t, .4, SHIRT_G) + T("بيفتح", 470, 660, 28, OLIVE, 800), k3);
  return s;
}, { tr: "out" });
// 25 · the odd fact: all your blood holds about one teaspoon of sugar; a can of soda holds nine
shot(25, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[25], D = LN[25].end - LN[25].start, k2 = D * (c[c.length - 1] || .55), s = paper();
  s += R(70, 160, 180, 380, "#f4ecdb", 2.4, 16) + sweep(70, 200, 180, 340, at(u, .3, 1.0), "u", R(70, 200, 180, 340, RBC, 2.4, 16)) + wave(76, 204, 244, 204, t, "#8f3a32", 4, 40, at(u, 1.0, .3), 2.5) + T("دمك كله", 160, 140, 26, INK, 800) + T("5 لتر", 160, 580, 26, INK, 800);
  s += G("", spoon(160, 650, .7, true) + T("1", 260, 660, 40, ORANGE, 800), at(u, D * (c[1] || .3), .4));
  s += G("", sodaCan(440, 300, 1.1) + T("علبة واحدة", 440, 160, 26, INK, 800), at(u, k2 - .2, .3));
  for (var i = 0; i < 9; i++) s += G("", spoon(370 + (i % 3) * 70, 470 + Math.floor(i / 3) * 60, .38, true), at(u, k2 + .3 + i * .15, .2));
  s += G("", N(count(9, at(u, k2 + .3, 1.4)), 590, 560, 70, ORANGE), at(u, k2 + .3, .3));
  return s;
});
// 26 · the prayer: a man with his hands raised, a soft light, a heart for every patient
shot(26, push(320, 430, 1.05, 1.0), function (u, d, t) {
  var c1 = chunkAt(26, 1), s = paper();
  for (var i = 0; i < 9; i++) { var a = -Math.PI / 2 + (i - 4) * .22 + .02 * Math.sin(t + i); s += '<path d="M320 120 L' + f(320 + Math.cos(a) * 700) + ' ' + f(120 - Math.sin(a) * 700) + '" stroke="#e8c98a" stroke-width="14" opacity=".35"/>'; }
  s += floor(700) + whole(fig({ x: 320, y: 700 - 212, lean: 0, shirt: "#efe6cf", hands: [rel(72, 62), rel(68, 54)], bend: [-1, -1], tilt: -6 }));
  s += heart(140, 220, .9 * (1 + .06 * Math.sin(t * 3)), ORANGE) + G("", T("كل مريض سكر", 140, 300, 24, ORANGE, 800), at(u, .6, .3));
  s += G("", people(4, 420, 700, 52, .55, function (i) { return [SKIN, [SHIRT_G, SHIRT_B, "#a38aa0", SHIRT_T][i]]; }) + heart(500, 200, .7 * (1 + .06 * Math.sin(t * 3 + 1)), OLIVE), at(u, c1, .5));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: bread and rice turn into sugar in the blood. line 1: the sugar curve rises and is back down in 2–3 hours.
  // line 2: in 13 million people in Egypt it stays up
  var s = "", u0 = t - LN[0].start;
  s += G("translate(0 -40)", vessel(120, 120, t, { n: li >= 0 ? Math.min(10, Math.floor(u0 * 3)) : 0, x0: -20, x1: 640 }));
  s += loaf(140, 400, .9) + riceBowl(400, 410, .9) + arrow(140, 330, 140, 230, ORANGE, 6, clamp(u0 / 1.2)) + arrow(400, 330, 400, 230, ORANGE, 6, clamp(u0 / 1.2 - .3));
  if (li >= 1) { var u1 = t - LN[1].start, gx = 70, gy = 620, gw = 470, gh = 130, k = clamp(u1 / 1.6);
    s = G("", s, 1 - .7 * clamp(u1 / .4));
    s += '<path d="M' + gx + ' ' + (gy - gh - 20) + ' V' + gy + ' H' + (gx + gw) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    var d = ""; for (var i = 0; i <= 40; i++) { var x = i / 40, y = Math.exp(-Math.pow((x - .3) / .16, 2)); d += (i ? "L" : "M") + f(gx + x * gw) + " " + f(gy - 20 - y * gh * .9); }
    s += draw(d, li >= 2 ? 1 : k, OLIVE, 5) + T("سكر الدم", gx + 60, gy - gh - 30, 20, INK, 700) + T("ساعتين تلاتة", gx + gw * .55, gy + 30, 22, OLIVE, 800);
    if (li >= 2) { var u2 = t - LN[2].start, d2 = ""; for (i = 0; i <= 40; i++) { x = i / 40; y = x < .3 ? Math.exp(-Math.pow((x - .3) / .16, 2)) : 1 - .1 * Math.sin(x * 9 + t); d2 += (i ? "L" : "M") + f(gx + x * gw) + " " + f(gy - 20 - y * gh * .9); }
      s += draw(d2, clamp(u2 / 1.4), ORANGE, 5) + G("", N(count(13000000, clamp((u2 - .3) / 1.4)), 300, 330, 54, ORANGE) + T("واحد في مصر", 300, 380, 26, INK, 800), clamp(u2 / .3)); }
  }
  return s;
};
SCENE.bumper = function (u, t) {
  // a tiny cell with the key turning in its door
  return G("translate(90 120) scale(.32) translate(-320 -560)", cell(320, 560, 190, t, { open: .5 + .5 * Math.sin(t * 2) })) + key(40, 62, .9, 8 * Math.sin(t * 2));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(20 10) scale(.36)", rule(t, u, { key: 1, flow: 1, inside: 4, x0: 0, x1: 640 })) + G("translate(260 0) scale(.36)", rule(t, u, { key: .6, rust: 1, jiggle: true, n: 14, x0: 0, x1: 640 })) + walker(530, 270, t, .45, SHIRT_G) +
    callout("1", 40, 150, ease(u / .3)) + callout("2", 140, 30, ease(u / .3 - .5)) + callout("3", 330, 100, ease(u / .3 - 1)) + callout("4", 560, 40, ease(u / .3 - 1.5));
};
