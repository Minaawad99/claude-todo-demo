window.CHUNKS = [[0.0, 0.5102], [0.0, 0.64], [0.0], [0.0, 0.4194], [0.0, 0.7015], [0.0, 0.6735], [0.0, 0.3922], [0.0, 0.451], [0.0, 0.4932], [0.0, 0.2436, 0.4231, 0.8333], [0.0, 0.26, 0.56], [0.0, 0.6296], [0.0, 0.5152], [0.0, 0.3231, 0.6769], [0.0, 0.3509], [0.0, 0.3182, 0.5758, 0.7727], [0.0, 0.5862], [0.0, 0.3134, 0.4925], [0.0, 0.2097, 0.5], [0.0, 0.34], [0.0, 0.1642, 0.3881, 0.6866, 0.8657], [0.0, 0.209, 0.6716], [0.0, 0.1846, 0.7692], [0.0, 0.4026, 0.7273], [0.0, 0.5584], [0.0, 0.1613, 0.3118, 0.4731, 0.6667], [0.0, 0.6415], [0.0], [0.0]];
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

// ── «البواسير» — drawings. The anatomy follows real references (refs/SOURCES.md): a front (coronal) cut of the lower
// rectum and the anal canal, as in BruceBlaus «Hemorrhoids.png» and WikipedianProlific «Hemorrhoid.png»: the rectum
// narrows into the canal; the internal sphincter (the thickened rectal wall) lines it; the external sphincter's three
// bundles sit outside it, with the levator ani sloping in above; the dentate (pectinate) line crosses the canal about a
// third of the way up; the internal cushions (purple bunches of vessels) sit above that line and the external plexus
// under the skin at the edge. Style: the «طب إزاي؟» body cuts (v17, v20): flat salmon tissue, ink lines, light hatching.
// People are the flat side-view figures with real proportions from videos/choking (fig, limb, ik, rel, HB).

var FAT = "#ecd2bb", MUSC = "#c98a72", EXT = "#c4705a", LUMEN = "#e8b4a4", MUCO = "#d98a7c", ANODERM = "#e3bda4",
    CUSH = "#9a80a8", CUSH_D = "#6f5a86", VEIN = "#6c6a9a", EXTV = "#7d90aa", CLOT = "#4b5d8c", DEAD = "#6e5a4c",
    BAND = "#2f3a2a", STEEL = "#b9bec2", STEEL_D = "#8b9298", SKIN_B = "#d9a186", BLOOD = "#b8322a", BLOOD_D = "#5e1f1a",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", PORC = "#f4f2ec";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}
function upTo(pts, k) {   // the polyline cut at k (0..1 by length)
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot, out = [pts[0]]; for (i = 0; i < segs.length; i++) { if (d <= segs[i]) { out.push(L2(pts[i], pts[i + 1], d / segs[i])); return out; } out.push(pts[i + 1]); d -= segs[i]; } return out;
}
function smooth(pts) {   // a closed smooth path through points (quadratic mid-points)
  var n = pts.length, d = "M" + f((pts[0][0] + pts[1][0]) / 2) + " " + f((pts[0][1] + pts[1][1]) / 2);
  for (var i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
  return d + " Z";
}
function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, k) { var p = hx(a), q = hx(b); k = clamp(k); return "rgb(" + p.map(function (v, i) { return Math.round(lerp(v, q[i], k)); }).join(",") + ")"; }

// ── the canal: front cut, the person's left on the viewer's right. Panel units (640 × 786), canal centred on x = 320.
var LEFT = [[176, -80], [182, 170], [210, 296], [258, 388], [288, 448], [294, 540], [296, 640], [300, 704]],
    LOUT = [[132, -80], [138, 172], [168, 312], [222, 410], [246, 462], [250, 540], [254, 640], [272, 706]],
    DENT = 604, VERGE = 712;
function mir(pts) { return pts.map(function (p) { return [640 - p[0], p[1]]; }); }
// one cushion: a bunch of round vessels hanging on the wall. side +1 grows to the right (left wall), −1 to the left.
// c: {sz, y, drop, col, band, fade, dx, shrink, lift, cutK}
function cushion(x0, side, c, t) {
  c = c || {}; if (c.fade >= 1) return "";
  var sz = (c.sz == null ? 40 : c.sz) * (1 - .55 * (c.shrink || 0)), br = 1 + .03 * Math.sin(t * 2.4 + side);
  var y0 = (c.y || (side > 0 ? 505 : 540)) - 70 * (c.lift || 0), drop = clamp(c.drop || 0), cy = y0 + drop * 210, cx = x0 + side * (sz * .42 + 8 * drop) + (c.dx || 0);
  var col = c.col || CUSH, s = "";
  // the stalk when it slides down: lining dragged out of the canal
  if (drop > .02) s += P("M" + f(x0) + " " + f(y0 - 30) + " C" + f(x0 + side * 22) + " " + f(y0 + 20) + " " + f(cx - side * 14) + " " + f(cy - sz * .7) + " " + f(cx) + " " + f(cy - sz * .4) +
    " L" + f(cx + side * 10) + " " + f(cy - sz * .3) + " C" + f(x0 + side * 46) + " " + f(y0 + 40) + " " + f(x0 + side * 30) + " " + f(y0) + " " + f(x0) + " " + f(y0 - 10) + " Z", MUCO, 1.8);
  var B = [[0, -.95, .3], [.32, -.55, .34], [-.05, -.28, .3], [.42, -.05, .36], [.08, .22, .32], [.36, .52, .33], [.04, .82, .3], [.22, 1.0, .24]];
  var g = "";
  B.forEach(function (b, i) {
    var r = b[2] * sz * br, bx = cx + side * (b[0] - .2) * sz * .7, by = cy + b[1] * sz * .8;
    g += C(bx, by, r, col, 1.8) + '<circle cx="' + f(bx - r * .35) + '" cy="' + f(by - r * .35) + '" r="' + f(r * .28) + '" fill="#fff" opacity=".28"/>';
  });
  if (c.cutK) g += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(sz * .62) + '" ry="' + f(sz * 1.12) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="9 7" pathLength="100" opacity="' + f(clamp(c.cutK * 3)) + '"/>';
  s += G("", g, c.fade ? 1 - c.fade : 1);
  if (c.band) {   // the rubber band round its neck
    var bk = clamp(c.band), bw = lerp(sz * .9, sz * .32, bk), by2 = cy - sz * .62;
    s += '<ellipse cx="' + f(cx - side * 2) + '" cy="' + f(by2) + '" rx="' + f(bw) + '" ry="' + f(7) + '" fill="none" stroke="' + INK + '" stroke-width="9"/><ellipse cx="' + f(cx - side * 2) + '" cy="' + f(by2) + '" rx="' + f(bw) + '" ry="7" fill="none" stroke="' + BAND + '" stroke-width="5"/>';
  }
  return s;
}
// o: {L, R (cushion opts), ext 0..1 (external clot), hl: "dent" | "veins" | "nerve", fibers 0 tight … 1 loose, veins 0..1 (blood running in),
//     blood 0..1 (drops), ring 0..1 (stapler ring), staples 0..1, wound 0..1 (excision wound), extSz}
function canal(t, o) {
  o = o || {}; var s = "";
  s += R(-200, -200, 1040, 1100, FAT, 0) + '<rect x="-200" y="-200" width="1040" height="1100" fill="url(#hatch)" opacity=".12"/>';
  // levator ani, sloping into the top of the canal from both sides
  s += P("M-200 250 L-200 316 L214 474 L246 430 Z", EXT, 2) + P("M840 250 L840 316 L426 474 L394 430 Z", EXT, 2);
  for (var i = 0; i < 9; i++) { var k = i / 9; s += '<path d="M' + f(lerp(-190, 220, k)) + ' ' + f(lerp(262, 440, k)) + ' l' + f(10) + ' ' + f(40) + '" stroke="#a65a46" stroke-width="1.4"/><path d="M' + f(640 - lerp(-190, 220, k)) + ' ' + f(lerp(262, 440, k)) + ' l' + f(-10) + ' ' + f(40) + '" stroke="#a65a46" stroke-width="1.4"/>'; }
  // external sphincter: three bundles each side, striated
  [[[246, 470], [120, 486], [112, 548], [250, 552]], [[252, 556], [104, 562], [118, 636], [256, 638]], [[258, 642], [150, 648], [176, 702], [270, 704]]].forEach(function (q, j) {
    [q, q.map(function (p) { return [640 - p[0], p[1]]; })].forEach(function (b) {
      s += P(smooth(b), EXT, 2);
      for (var m = 1; m < 6; m++) { var a = L2(b[0], b[1], m / 6), c = L2(b[3], b[2], m / 6); s += '<path d="M' + f(a[0]) + ' ' + f(a[1] + 4) + ' L' + f(c[0]) + ' ' + f(c[1] - 4) + '" stroke="#a65a46" stroke-width="1.3"/>'; }
    });
  });
  // the rectal wall and the internal sphincter (its thick lower end)
  [[LEFT, LOUT], [mir(LEFT), mir(LOUT)]].forEach(function (w) {
    s += P(pathPts(w[0]) + " " + pathPts(w[1].slice().reverse()).replace("M", "L") + " Z", MUSC, 2.2) + '<path d="' + pathPts(w[0]) + " " + pathPts(w[1].slice().reverse()).replace("M", "L") + ' Z" fill="url(#hatch)" opacity=".25"/>';
  });
  // the skin outside, under the body
  s += '<path d="M-200 ' + VERGE + ' C40 ' + (VERGE - 2) + ' 220 ' + (VERGE + 4) + ' 270 ' + (VERGE + 12) + ' Q296 ' + (VERGE + 14) + ' 300 704 L340 704 Q344 ' + (VERGE + 14) + ' 370 ' + (VERGE + 12) + ' C420 ' + (VERGE + 4) + ' 600 ' + (VERGE - 2) + ' 840 ' + VERGE + ' V1000 H-200 Z" fill="' + PAPER + '" stroke="none"/>';
  s += '<path d="M-200 ' + VERGE + ' C40 ' + (VERGE - 2) + ' 220 ' + (VERGE + 4) + ' 270 ' + (VERGE + 12) + ' Q296 ' + (VERGE + 14) + ' 300 704 L340 704 Q344 ' + (VERGE + 14) + ' 370 ' + (VERGE + 12) + ' C420 ' + (VERGE + 4) + ' 600 ' + (VERGE - 2) + ' 840 ' + VERGE + ' V1000 H-200 Z" fill="url(#grid)" stroke="none"/>';
  s += '<path d="M-200 ' + VERGE + ' C40 ' + (VERGE - 2) + ' 220 ' + (VERGE + 4) + ' 270 ' + (VERGE + 12) + ' Q296 ' + (VERGE + 14) + ' 300 704 M340 704 Q344 ' + (VERGE + 14) + ' 370 ' + (VERGE + 12) + ' C420 ' + (VERGE + 4) + ' 600 ' + (VERGE - 2) + ' 840 ' + VERGE + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M-200 ' + (VERGE - 7) + ' C40 ' + (VERGE - 9) + ' 220 ' + (VERGE - 3) + ' 266 ' + (VERGE + 4) + ' M374 ' + (VERGE + 4) + ' C420 ' + (VERGE - 3) + ' 600 ' + (VERGE - 9) + ' 840 ' + (VERGE - 7) + '" fill="none" stroke="' + SKIN_B + '" stroke-width="10" opacity=".8"/>';
  // the lumen (the back wall of the canal seen through the cut) with soft folds; anoderm under the dentate line
  var lum = pathPts(LEFT) + " " + pathPts(mir(LEFT).slice().reverse()).replace("M", "L") + " Z";
  s += P(lum, LUMEN, 0) + '<clipPath id="lum"><path d="' + lum + '"/></clipPath><g clip-path="url(#lum)">' +
    R(200, DENT, 240, 120, ANODERM, 0) + [120, 220, 330, 420].map(function (y, j) { return '<path d="M150 ' + y + ' Q320 ' + (y + 34 - j * 4) + ' 490 ' + y + '" stroke="#c98f80" stroke-width="2" fill="none"/>'; }).join("") +
    '<path d="M286 470 V600 M300 470 V600 M340 470 V600 M354 470 V600" stroke="#cf9585" stroke-width="2"/>' + '</g>';
  // veins running down the wall into the cushions
  var vk = o.veins || 0, vcol = o.hl === "veins" ? BLUE : VEIN;
  [[[190, -80], [196, 170], [228, 300], [268, 398], [284, 470]], [[204, -80], [208, 190], [240, 304], [276, 408], [290, 480]]].forEach(function (v) {
    [v, mir(v)].forEach(function (w) {
      s += '<path d="' + pathPts(w) + '" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="' + pathPts(w) + '" stroke="' + vcol + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
      if (vk > 0) s += '<path d="' + pathPts(w) + '" stroke="' + BLOOD + '" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-dasharray="4 14" stroke-dashoffset="' + f(-t * 60) + '" opacity="' + f(vk) + '"/>';
    });
  });
  // the mucosa edge
  s += '<path d="' + pathPts(LEFT) + '" stroke="' + MUCO + '" stroke-width="7" fill="none"/><path d="' + pathPts(mir(LEFT)) + '" stroke="' + MUCO + '" stroke-width="7" fill="none"/>';
  s += '<path d="' + pathPts(LEFT) + '" stroke="' + INK + '" stroke-width="2" fill="none"/><path d="' + pathPts(mir(LEFT)) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  // the stapler ring: a band of lining above the cushions, cut out and stapled
  if (o.ring) { var rk = clamp(o.ring), rc = o.staples ? 0 : 1; s += G("", '<path d="M262 392 L288 448 L292 470 M378 392 L352 448 L348 470" stroke="' + ORANGE + '" stroke-width="12" fill="none" opacity=".75"/>', rk * rc); }
  if (o.staples) { var sk = clamp(o.staples); s += G("", [0, 1, 2, 3, 4].map(function (j) { var a = L2([262, 392], [292, 470], j / 4), b = [640 - a[0], a[1]]; return '<path d="M' + f(a[0] - 6) + ' ' + f(a[1] - 5) + ' h12 v10 h-12" stroke="' + STEEL_D + '" stroke-width="2.6" fill="none"/><path d="M' + f(b[0] - 6) + ' ' + f(b[1] - 5) + ' h12 v10 h-12" stroke="' + STEEL_D + '" stroke-width="2.6" fill="none"/>'; }).join(""), sk); }
  // the support fibres holding each cushion to the muscle: tight, or loose and long
  var lo = o.fibers || 0, fib = "";
  [-1, 1].forEach(function (side) {
    var x0 = side < 0 ? 640 - 294 : 294;
    for (var j = 0; j < 3; j++) { var y = 492 + j * 30 + lo * 40, d = "M" + f(x0 - side * 28) + " " + f(492 + j * 30); for (var m = 1; m <= 6; m++) d += " L" + f(x0 - side * (28 - m * 5) + (m % 2 ? 1 : -1) * (2 + lo * 5)) + " " + f(lerp(492 + j * 30, y, m / 6)); fib += '<path d="' + d + '" stroke="' + OLIVE + '" stroke-width="2" fill="none"/>'; }
  });
  s += G("", fib, o.showFibers || 0);
  // the dentate line: a fine zig-zag across the canal
  var dz = "M282 " + DENT; for (var x = 286; x <= 358; x += 6) dz += " L" + x + " " + (DENT + ((x / 6) % 2 ? -5 : 5)); dz += " L358 " + DENT;
  s += '<path d="' + dz + '" stroke="' + (o.hl === "dent" ? OLIVE : "#9b6a5c") + '" stroke-width="' + (o.hl === "dent" ? 4 : 2.2) + '" fill="none"/>';
  if (o.hl === "dent") s += '<path d="M-200 ' + DENT + ' H840" stroke="' + OLIVE + '" stroke-width="2.4" stroke-dasharray="10 8" opacity=".9"/>';
  // the external plexus under the skin at the edge; a clot swells one into a hard blue ball
  var ek = clamp(o.ext || 0);
  [[262, 690, 7], [248, 696, 6], [236, 700, 5], [378, 690, 7], [392, 696, 6], [404, 700, 5]].forEach(function (p) { s += C(p[0], p[1], p[2], EXTV, 1.4); });
  if (ek > 0) { var er = 8 + 30 * ek; s += C(250, VERGE + er * .55, er + 4, SKIN_B, 2.2) + C(250, VERGE + er * .55, er, mix(EXTV, CLOT, ek), 2) + '<circle cx="' + f(250 - er * .35) + '" cy="' + f(VERGE + er * .2) + '" r="' + f(er * .25) + '" fill="#fff" opacity=".25"/>'; }
  // the cushions (internal hemorrhoids), above the dentate line
  s += cushion(294, 1, o.L, t) + cushion(346, -1, o.R, t);
  if (o.wound) { var wk = clamp(o.wound); s += G("", '<path d="M294 470 C302 500 302 560 296 600" stroke="' + BLOOD_D + '" stroke-width="5" fill="none"/>' + [0, 1, 2, 3].map(function (j) { var y = 484 + j * 34; return '<path d="M290 ' + y + ' l14 8 M304 ' + y + ' l-14 8" stroke="' + INK + '" stroke-width="2"/>'; }).join(""), wk); }
  // drops of bright blood from a cushion
  if (o.blood) { for (var j2 = 0; j2 < 3; j2++) { var p = ((t * .55 + j2 / 3) % 1), by = lerp(580, 790, p); s += G("", '<path d="M320 ' + f(by - 14) + ' q8 12 8 18 a8 8 0 0 1 -16 0 q0 -6 8 -18 z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.4"/>', o.blood * (1 - p * .4)); } }
  return s;
}

// ── people (from videos/choking/sketch/shots.js): flat side-view figures facing left, real proportions (Drillis & Contini)
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]], toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1]], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, o.pants || PANTS, o.pants || PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    out.wrist = out.wrist || []; out.wrist[i] = wr;
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  if (o.belly) fr = [[-6, 18], [14, 34], [34, 46 + (o.belly > 1 ? 12 : 0)], [56, 40 + (o.belly > 1 ? 10 : 0)], [76, 30], [92, 28], [110, 22], [120, 10]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + (o.pants || PANTS) + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>');
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { x0 = x0 == null ? -400 : x0; x1 = x1 == null ? 1040 : x1; return '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0, y, x1 - x0, 300, "#e3d7bd", 0) + '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// a toilet in side view, facing left; seat top at y (≈ 0.25H above the floor, as a chair seat)
function toilet(x, y, fl) {
  var s = "";
  s += R(x + 40, y - 170, 70, 150, PORC, 2.4, 6) + R(x + 34, y - 182, 82, 16, PORC, 2.2, 4) + '<path d="M' + (x + 58) + ' ' + (y - 182) + ' v-10 h18 v10" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="1.6"/>';
  s += P("M" + (x - 70) + " " + (y + 8) + " C" + (x - 66) + " " + (y + 70) + " " + (x - 20) + " " + (y + 86) + " " + (x - 6) + " " + (y + 96) + " L" + (x - 14) + " " + fl + " L" + (x + 60) + " " + fl + " L" + (x + 56) + " " + (y + 60) + " C" + (x + 80) + " " + (y + 40) + " " + (x + 86) + " " + (y + 20) + " " + (x + 84) + " " + (y + 8) + " Z", PORC, 2.4);
  s += R(x - 80, y - 4, 170, 14, "#e4e0d6", 2.2, 6);
  return s;
}
function phoneS(x, y, a) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a || 0) + ")", R(-14, -26, 28, 52, "#3a342c", 2, 6) + R(-10, -20, 20, 38, "#9fc0d4", 1, 2)); }
function stopwatch(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 14, y - r - 26, 28, 18, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 10, "none", 1.2);
  for (var i = 0; i < 12; i++) { var b = -Math.PI / 2 + i * Math.PI / 6; s += '<path d="M' + f(x + Math.cos(b) * (r - 18)) + ' ' + f(y + Math.sin(b) * (r - 18)) + ' L' + f(x + Math.cos(b) * (r - 10)) + ' ' + f(y + Math.sin(b) * (r - 10)) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 2 : 4) + '"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 12) + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 ' + (k % 1 > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}
function glass(x, y, lvl) {
  return P("M" + (x - 50) + " " + (y - 120) + " L" + (x - 40) + " " + (y + 40) + " L" + (x + 40) + " " + (y + 40) + " L" + (x + 50) + " " + (y - 120) + " Z", "#eef2f0", 2.4) +
    P("M" + (x - 46) + " " + f(y - 120 + 160 * (1 - lvl)) + " L" + (x - 40) + " " + (y + 40) + " L" + (x + 40) + " " + (y + 40) + " L" + (x + 46) + " " + f(y - 120 + 160 * (1 - lvl)) + " Z", "#9fbccb", 1.6);
}
function drop(x, y, r, col) { return '<path d="M' + f(x) + ' ' + f(y - r * 1.9) + ' Q' + f(x + r * 1.1) + ' ' + f(y - r * .4) + ' ' + f(x + r) + ' ' + f(y + r * .1) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x - r) + ' ' + f(y + r * .1) + ' Q' + f(x - r * 1.1) + ' ' + f(y - r * .4) + ' ' + f(x) + ' ' + f(y - r * 1.9) + ' Z" fill="' + (col || BLOOD) + '" stroke="' + INK + '" stroke-width="2"/>'; }
function pain(x, y, r, t, k) { if (!k) return ""; var s = ""; for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3 + .3, rr = r + 6 * Math.sin(t * 9 + i); s += '<path d="M' + f(x + Math.cos(a) * rr) + ' ' + f(y + Math.sin(a) * rr) + ' l' + f(Math.cos(a + .5) * 12) + ' ' + f(Math.sin(a + .5) * 12) + ' l' + f(Math.cos(a - .5) * 12) + ' ' + f(Math.sin(a - .5) * 12) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; } return G("", s, k); }
function chunkAt(i, j) { var c = window.CHUNKS[i]; return (LN[i].end - LN[i].start) * (c[j] || 0); }
// a faucet washer (the analogy for line 5): the rubber ring seals the seat when the tap is closed
function faucet(k) {
  var s = R(-70, -30, 140, 44, STEEL, 2) + R(-20, -70, 40, 40, STEEL, 2) + R(-36, -86, 72, 18, STEEL_D, 2, 4);
  s += R(-52, 14 + 10 * (1 - k), 104, 12, "#3e3a36", 2, 5) + R(-46, 40, 92, 30, STEEL, 2) + '<path d="M-46 70 h92" stroke="' + INK + '" stroke-width="2"/>';
  if (k < .5) for (var i = 0; i < 3; i++) s += drop(-20 + i * 20, 96 + (window.__t * 80 + i * 30) % 40, 5, "#9fbccb");
  return s;
}
// the large bowel, front view, the person's right on the viewer's left; the scope goes in from below
var COLON = [[320, 760], [324, 640], [390, 590], [470, 560], [494, 470], [496, 300], [490, 190], [400, 170], [260, 180], [150, 186], [140, 300], [142, 470], [150, 560]];
function colon(t, scopeK, polyp) {
  var d = pathPts(COLON), s = '<path d="' + d + '" stroke="' + INK + '" stroke-width="74" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="#d9a08a" stroke-width="68" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  for (var i = 1; i < 26; i++) { var p = along(COLON, i / 26), q = along(COLON, i / 26 + .005), a = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2; s += '<path d="M' + f(p[0] + Math.cos(a) * 30) + ' ' + f(p[1] + Math.sin(a) * 30) + ' Q' + f(p[0] + Math.cos(a) * 6 + (q[0] - p[0]) * 3) + ' ' + f(p[1] + Math.sin(a) * 6 + (q[1] - p[1]) * 3) + ' ' + f(p[0] - Math.cos(a) * 30) + ' ' + f(p[1] - Math.sin(a) * 30) + '" stroke="#b97c68" stroke-width="2" fill="none"/>'; }
  if (polyp) s += G("", P(smooth([[478, 360], [500, 344], [516, 360], [512, 392], [490, 404], [474, 386]]), "#a85a48", 2) + '<circle cx="492" cy="368" r="5" fill="#fff" opacity=".3"/>', polyp);
  if (scopeK > 0) { var path = [[320, 820]].concat(COLON.slice(0, 6)), pts = upTo(path, scopeK * .6), tip = pts[pts.length - 1]; s += '<path d="' + pathPts(pts) + '" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + pathPts(pts) + '" stroke="#3b3b3b" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + '<circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(16 + 3 * Math.sin(t * 6)) + '" fill="#f6e7a8" opacity=".55"/>' + C(tip[0], tip[1], 6, "#f6e7a8", 1.6); }
  return s;
}
function ppl(x, y, sc, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", whole(fig({ x: 0, y: 0, shirt: col, pants: col === GREY ? "#9a948a" : PANTS, hair: col === GREY ? "#9a948a" : HAIR, legs: [[4, -2], [-4, 2]] }))); }

// labels drawn over tissue get a paper halo so they read on the muscle colours
function halo(str) { return str.replace(/<text /g, '<text stroke="' + PAPER + '" stroke-width="6" stroke-linejoin="round" paint-order="stroke" '); }
var _label = label; label = function () { return halo(_label.apply(null, arguments)); };
var _T = T; function TH() { return halo(_T.apply(null, arguments)); }

// ── shots (line numbers from script.txt) ──
// 4 · «مخدات صغيرة مليانة أوعية دم، في آخر حتة من الشرج»: the whole cut, then into the cushions
shot(4, push(320, 430, 0.92, 1.25), function (u, d, t) {
  var k = at(u, 1.2, .6);
  return paper() + canal(t, { veins: at(u, 2.0, .6), hl: u > 2 ? "veins" : "", L: { sz: 40 + 2 * k }, R: { sz: 40 + 2 * k } }) +
    label(300, 520, 470, 330, "المخدات", OLIVE, at(u, 1.0, .5), 30) + label(240, 330, 254, 222, "أوعية دم", BLUE, at(u, 2.2, .5), 26) + label(352, 704, 470, 680, "فتحة الشرج", INK, at(u, 3.4, .5), 22);
});
// 5 · they close the opening tight, like a faucet washer
shot(5, push(320, 560, 1.5, 1.6), function (u, d, t) {
  var cl = .5 + .5 * Math.sin(t * 2.2), sz = 34 + 10 * cl;
  return paper() + canal(t, { L: { sz: sz }, R: { sz: sz } }) + arrow(230, 530, 280, 530, ORANGE, 5, at(u, .5, .3)) + arrow(410, 530, 360, 530, ORANGE, 5, at(u, .5, .3)) +
    iconBox(440, 400, 120, G("scale(.7)", faucet(cl)) , at(u, 1.6, .3)) + tag("جلدة الحنفية", 440, 490, at(u, 1.9, .3), 18, OLIVE) + (cl > .5 ? tag("مقفولة", 210, 400, at(u, .8, .3), 24, ORANGE) : "");
}, { tr: "in" });
// 6 · the problem: they swell and slide down
shot(6, push(320, 560, 1.25, 1.18), function (u, d, t) {
  var c1 = chunkAt(6, 1), sw = at(u, c1, 1.0), dr = at(u, c1 + 1.2, 1.4);
  return paper() + canal(t, { L: { sz: 40 + 34 * sw, drop: dr * .8, col: mix(CUSH, CUSH_D, sw) }, R: { sz: 40 + 22 * sw, col: mix(CUSH, CUSH_D, sw) } }) +
    G("", T("؟", 520, 300, 120, ORANGE, 800), at(u, .2, .3) * (1 - at(u, c1, .3))) + tag("بتنفخ", 180, 420, at(u, c1 + .3, .3), 28, ORANGE) + arrow(170, 560, 170, 700, ORANGE, 6, at(u, c1 + 1.2, .5)) + tag("وتنزل", 150, 760, at(u, c1 + 1.6, .3), 26, ORANGE);
}, { tr: "out" });
// 7 · the first cause: straining on the toilet
shot(7, push(330, 440, 1.0, 1.12), function (u, d, t) {
  var st = at(u, .6, .4), b = .5 + .5 * Math.sin(t * 7), lean = 16 + 14 * st, s = paper() + floor(690);
  var m = fig({ x: 330, y: 562, lean: lean, shirt: SHIRT_V, hands: [rel(40, 64), rel(40, 60)], bend: [1, 1], legs: [[84, -88], [80, -84]], tilt: 6 });
  s += toilet(340, 576, 690) + m.far + m.body + m.near;
  var hd = m.hd; s += G("", '<path d="M' + f(hd[0] - 34) + ' ' + f(hd[1] - 46) + ' l-14 -14 M' + f(hd[0] - 6) + ' ' + f(hd[1] - 56) + ' l0 -18 M' + f(hd[0] + 22) + ' ' + f(hd[1] - 50) + ' l12 -14" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>', st * (.5 + .5 * b));
  s += arrow(360, 470, 360, 540 + 6 * b, ORANGE, 7, st) + G("", T("حزق", 440, 470, 34, ORANGE, 800), at(u, .9, .3));
  s += inset(520, 210, 100, G("translate(-320 -560) scale(1)", canal(t, { L: { sz: 40 + 16 * st * b }, R: { sz: 40 + 12 * st * b } })), at(u, 1.6, .3));
  return s;
});
// 8 · straining traps the blood: the cushions blow up like balloons, the fibres holding them stretch
shot(8, push(320, 520, 1.3, 1.42), function (u, d, t) {
  var c2 = chunkAt(8, 2), sw = at(u, .6, 1.6), lo = at(u, c2, 1.6);
  return paper() + canal(t, { veins: 1, showFibers: at(u, c2 - .3, .4), fibers: lo, L: { sz: 40 + 30 * sw, col: mix(CUSH, CUSH_D, sw), drop: lo * .35 }, R: { sz: 40 + 26 * sw, col: mix(CUSH, CUSH_D, sw), drop: lo * .25 } }) +
    arrow(320, 320, 320, 400, BLUE, 6, at(u, .3, .4)) + G("", T("الدم بيتحبس", 320, 300, 26, BLUE, 800), at(u, .4, .3)) +
    label(372, 590, 380, 700, "الأنسجة الماسكة", OLIVE, at(u, c2, .5), 20) + iconBox(460, 340, 100, '<path d="M0 -40 C30 -40 34 -6 18 14 L4 28 L-4 28 L-18 14 C-34 -6 -30 -40 0 -40 Z" fill="' + CUSH + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 28 q-6 10 4 20" stroke="' + INK + '" stroke-width="2" fill="none"/>', at(u, 1.0, .3));
}, { tr: "in" });
// 9 · the causes: constipation, no fibre, the phone on the toilet
shot(9, push(320, 430, 1.04, 1.0), function (u, d, t) {
  var c1 = chunkAt(9, 1), c2 = chunkAt(9, 2), s = paper() + floor(690);
  var m = fig({ x: 300, y: 562, lean: 18, shirt: SHIRT_V, hands: [rel(64, 52), rel(60, 50)], bend: [1, 1], legs: [[84, -88], [80, -84]], tilt: 22 });
  s += toilet(310, 576, 690) + m.far + m.body + m.near + phoneS(m.at(64, 60)[0] - 6, m.at(64, 60)[1] - 14, -30);
  s += iconBox(110, 120, 130, '<path d="M-36 20 q-6 -30 20 -34 q4 -24 30 -16 q26 -8 28 20 q16 10 4 30 Z" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2"/>' + cross(0, 0, .9, at(u, .9, .4)) + T("إمساك", 0, 52, 18, ORANGE, 800), at(u, .4, .3));
  s += iconBox(320, 120, 130, '<ellipse cx="0" cy="12" rx="48" ry="16" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><circle cx="-16" cy="0" r="12" fill="#6a8a4a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="4" cy="-6" r="13" fill="#7f9c55" stroke="' + INK + '" stroke-width="1.6"/><circle cx="22" cy="2" r="10" fill="#c45a3a" stroke="' + INK + '" stroke-width="1.6"/>' + cross(0, 0, .9, at(u, c1 + .4, .4)) + T("ألياف", 0, 52, 18, OLIVE, 800), at(u, c1, .3));
  var tk = clamp((u - c2) / 3);
  s += iconBox(530, 120, 130, stopwatch(0, -4, 44, tk * 1.5) + T("ربع ساعة", 0, 56, 16, ORANGE, 800), at(u, c2, .3));
  return s;
});
// 10 · more: pregnancy, heavy lifting, extra weight, age
shot(10, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[10], D = LN[10].end - LN[10].start, s = paper(), b = .5 + .5 * Math.sin(t * 3);
  var boxes = [
    [180, 230, fig({ x: 0, y: 0, belly: 2, shirt: "#a38aa0", hands: [rel(40, 52), null], bend: [1, -1], hair: "#5a4636" }), "الحمل"],
    [460, 230, fig({ x: 0, y: 24 * b, lean: 30, shirt: SHIRT_R, hands: [[-80, 70 + 24 * b], [-74, 66 + 24 * b]], bend: [1, 1], legs: [[34, -50], [26, -44]] }), "الشيل التقيل"],
    [180, 560, fig({ x: 0, y: 0, belly: 2, shirt: "#8f9a7a" }), "الوزن الزيادة"],
    [460, 560, fig({ x: 0, y: 0, lean: 14, shirt: "#9a8a7a", hair: "#d8d4cc", hands: [[-70, 210], null], bend: [-1, -1] }), "السن"]];
  boxes.forEach(function (q, i) {
    var k = at(u, D * (c[i] || i * .22) - .1, .3), extra = "";
    if (i === 1) extra = R(-118, 46 + 24 * b, 64, 56, "#c9a46a", 2) + '<path d="M-118 66 h64" stroke="' + INK + '" stroke-width="1.4"/>';
    if (i === 3) extra = '<path d="M-70 200 L-76 212" stroke="' + WOOD_D + '" stroke-width="7" stroke-linecap="round"/><path d="M-66 196 L-80 212" stroke="' + WOOD_D + '" stroke-width="0"/>' + '<path d="M-68 150 L-82 212" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M-68 150 L-82 212" stroke="' + WOOD_D + '" stroke-width="5" stroke-linecap="round"/>';
    if (i === 2) extra = R(-50, 212, 100, 18, "#d9d4c8", 2, 4) + N(String(Math.round(90 + 20 * b)), 0, 226, 13, ORANGE);
    s += iconBox(q[0], q[1], 250, G("scale(.55) translate(10 -10)", '<path d="M-200 ' + (i === 2 ? 230 : 212) + ' H200" stroke="' + INK + '" stroke-width="2"/>' + extra + whole(q[2])) + T(q[3], 0, -100, 26, INK, 800), k);
  });
  return s;
});
// 11 · two kinds, either side of a line
shot(11, push(320, 600, 1.2, 1.32), function (u, d, t) {
  var k = at(u, .3, .6);
  return paper() + canal(t, { hl: k > 0 ? "dent" : "", L: { sz: 50 }, R: { sz: 46 } }) + tag("داخلية", 150, 480, at(u, .9, .3), 28, OLIVE) + arrow(150, 500, 150, 570, OLIVE, 4, at(u, 1.0, .3)) +
    tag("خارجية", 490, 720, at(u, 1.3, .3), 28, OLIVE) + arrow(490, 660, 490, 620, OLIVE, 4, at(u, 1.4, .3)) + G("", T("الخط", 510, DENT - 12, 22, OLIVE, 800), k);
}, { tr: "in" });
// 12 · internal: above the line there are no pain nerves; bright red blood, no pain
shot(12, push(320, 560, 1.3, 1.24), function (u, d, t) {
  var c2 = chunkAt(12, 2), bl = at(u, c2, .4);
  return paper() + canal(t, { hl: "dent", blood: bl, L: { sz: 58, col: CUSH_D }, R: { sz: 48 } }) +
    iconBox(460, 370, 110, '<path d="M-40 0 C-20 -20 0 20 20 0 S50 -10 50 0 M-40 0 l-10 -16 M-40 0 l-12 14 M-10 6 l-6 20 M20 0 l6 -20" stroke="' + BLUE + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + cross(0, 0, 1, at(u, 1.2, .4)) + T("أعصاب ألم", 0, 52, 18, BLUE, 800), at(u, .8, .3)) +
    label(320, 760, 200, 780, "أحمر فاتح", ORANGE, at(u, c2 + .4, .4), 24) + G("", tag("من غير وجع", 440, 470, 1, 24, BLUE), at(u, d - 1.6, .3));
}, { tr: "out" });
// 13 · external: under the skin; a clot makes a hard blue ball that hurts a lot
shot(13, push(280, 660, 1.4, 1.6), function (u, d, t) {
  var c1 = chunkAt(13, 1), ck = at(u, c1, 1.2);
  return paper() + canal(t, { ext: ck, L: { sz: 40 }, R: { sz: 40 } }) + label(262, 690, 340, 630, "تحت الجلد", OLIVE, at(u, .4, .5), 22) +
    tag("جلطة", 160, 830, at(u, c1 + 1.0, .3), 24, BLUE) + pain(250, VERGE + 22, 50, t, at(u, c1 + 1.6, .4));
}, { tr: "in" });
// 14 · the important warning: any blood with stool needs a doctor
shot(14, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var c1 = chunkAt(14, 1), s = paper(), pulse = 1 + .04 * Math.sin(t * 5);
  s += G("translate(320 330) scale(" + f(pulse * pop(at(u, .2, .4))) + ")", '<path d="M0 -150 L140 100 L-140 100 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M0 -118 L112 82 L-112 82 Z" fill="none" stroke="' + ORANGE + '" stroke-width="6" stroke-linejoin="round"/>' + drop(0, 30, 34));
  s += G("", N("!", 0, 0, 1, INK), 0) + tag("أي دم", 320, 560, at(u, c1, .3), 34, ORANGE);
  // the doctor's stethoscope
  s += G("", '<path d="M250 640 C250 720 390 720 390 640" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="M250 640 C250 720 390 720 390 640" stroke="' + STEEL_D + '" stroke-width="5" fill="none"/><path d="M320 712 V740" stroke="' + INK + '" stroke-width="6"/>' + C(320, 756, 18, STEEL, 2.4) + C(250, 636, 6, INK, 0) + C(390, 636, 6, INK, 0) + T("دكتور", 470, 700, 26, INK, 800), at(u, chunkAt(14, 2), .3));
  return s;
});
// 15 · the red flags, ticked in as they are said
shot(15, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[15], D = LN[15].end - LN[15].start, s = paper();
  var rows = [
    ["الدم غامق", drop(0, 6, 16, BLOOD_D)],
    ["الحمام اتغيّر", '<rect x="-20" y="-16" width="40" height="34" rx="4" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -6 h40" stroke="' + INK + '" stroke-width="2"/><path d="M-10 6 l20 0 M0 -2 l0 16" stroke="' + ORANGE + '" stroke-width="3"/>'],
    ["الوزن نزل", R(-24, -2, 48, 18, "#d9d4c8", 2, 4) + arrow(0, -28, 0, -6, ORANGE, 4, 1)],
    ["بعد الـ 45", N("45", 0, 10, 26, ORANGE)]];
  rows.forEach(function (r, i) {
    var k = at(u, D * (c[i] || i * .25), .3), y = 150 + i * 150;
    s += G("", R(90, y - 56, 460, 112, "#f4ecdb", 2) + G("translate(480 " + y + ") scale(1.6)", r[1]) + T(r[0], 330, y + 12, 34, INK, 800) + G("", '<rect x="108" y="' + (y - 22) + '" width="44" height="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>', 1), k) + check(130, y, 1, at(u, D * (c[i] || i * .25) + .3, .4), ORANGE);
  });
  return s;
});
// 16 · because colon tumours bleed too; the scope tells them apart
shot(16, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var c1 = chunkAt(16, 1);
  return paper() + colon(t, at(u, c1, 1.6), at(u, .4, .4)) + label(510, 370, 570, 290, "ورم", ORANGE, at(u, .6, .5), 30) +
    G("", drop(500, 450 + 14 * ((t * .8) % 1), 9), at(u, .9, .3)) + label(330, 700, 470, 720, "المنظار", BLUE, at(u, c1 + .4, .5), 26);
});
// 17 · at first: fibre, water, and no more than five minutes on the toilet
shot(17, push(320, 410, 1.0, 1.05), function (u, d, t) {
  var c1 = chunkAt(17, 1), c2 = chunkAt(17, 2), s = paper(); s += G("", G("translate(0 " + f(10 * Math.sin(t * 3)) + ")", tag("سهل", 320, 400, 1, 44, BLUE)) + check(320, 480, 1.4, at(u, .6, .4), BLUE), at(u, .2, .3) * (1 - at(u, c1 - .3, .3)));
  s += G("translate(0 " + f(18 * Math.sin(t * 3.4)) + ") rotate(" + f(3 * Math.sin(t * 2.2)) + " 170 210)", iconBox(170, 210, 230, '<ellipse cx="0" cy="40" rx="90" ry="26" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/><path d="M-90 40 Q0 120 90 40" fill="#e4d6b8" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-34" cy="20" r="24" fill="#6a8a4a" stroke="' + INK + '" stroke-width="2"/><circle cx="6" cy="10" r="26" fill="#7f9c55" stroke="' + INK + '" stroke-width="2"/><circle cx="44" cy="22" r="20" fill="#c45a3a" stroke="' + INK + '" stroke-width="2"/><path d="M-60 -60 q20 30 6 60" stroke="' + OLIVE + '" stroke-width="6" fill="none"/>' + T("ألياف", 0, -80, 26, OLIVE, 800), at(u, c1 - .1, .3)));
  s += G("translate(0 " + f(18 * Math.sin(t * 3.4 + 1.6)) + ") rotate(" + f(-3 * Math.sin(t * 2.2)) + " 470 210)", iconBox(470, 210, 230, G("translate(0 20) scale(.8)", glass(0, 0, .72 + .08 * Math.sin(t * 3))) + T("مية", 0, -80, 26, BLUE, 800), at(u, c1 + .5, .3)));
  var tk = clamp((u - c2) / Math.max(1, d - c2 - .3));
  s += iconBox(320, 560, 260, G("translate(-70 10)", stopwatch(0, 0, 70, tk)) + N(String(Math.min(5, Math.ceil(tk * 5))), 70, 40, 70, ORANGE) + T("دقايق", 70, 76, 22, INK, 800) + T("أقصى حاجة", 0, -100, 24, INK, 800), at(u, c2, .3));
  return s;
});
// 18 · band ligation: the doctor slips a rubber band round the root of the cushion
shot(18, push(310, 520, 1.3, 1.4), function (u, d, t) {
  var c2 = chunkAt(18, 2), gk = at(u, c2, 1.0), bk = at(u, c2 + 1.0, .6), s = paper();
  s += canal(t, { L: { sz: 64, col: CUSH_D, band: bk }, R: { sz: 44 } });
  // the ligator: a tube on a handle coming up through the opening; it sucks the cushion in and fires the band
  var ty = lerp(820, 540, gk) + 10 * bk;
  s += G("", R(286, ty, 56, 140, STEEL, 2.4, 4) + R(280, ty - 4, 68, 14, STEEL_D, 2) + (bk < .2 ? '<ellipse cx="314" cy="' + f(ty + 4) + '" rx="30" ry="6" fill="none" stroke="' + BAND + '" stroke-width="5"/>' : "") + R(306, ty + 140, 16, 120, STEEL_D, 2), 1 - at(u, c2 + 1.8, .5));
  s += label(326, 452, 390, 400, "أستك", ORANGE, at(u, c2 + 1.2, .5), 30) + G("", T("عند جدرها", 440, 436, 20, INK, 700), at(u, c2 + 1.4, .3));
  s += iconBox(450, 290, 100, '<ellipse cx="0" cy="-10" rx="30" ry="36" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-6 26 L6 26 L0 40 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-10 30 h20" stroke="' + INK + '" stroke-width="5"/>' + T("زي البلونة", 0, 56, 16, INK, 800), at(u, .6, .3));
  return s;
}, { tr: "in" });
// 19 · cut off from blood it dries and drops off in about a week
shot(19, push(300, 560, 1.5, 1.42), function (u, d, t) {
  var D = d, dk = at(u, .4, 2.0), fall = at(u, D - 1.6, 1.0), day = Math.min(7, 1 + Math.floor(clamp(u / (D - 1.0)) * 7));
  return paper() + canal(t, { L: { sz: 64, col: mix(CUSH_D, DEAD, dk), band: 1, shrink: dk * .5, drop: fall, fade: fall }, R: { sz: 44 } }) +
    cross(240, 420, .7, at(u, .2, .4)) + G("", T("الدم", 190, 424, 22, BLUE, 800), at(u, .2, .3)) +
    iconBox(430, 390, 110, R(-50, -44, 100, 96, "#f4efe3", 2, 4) + R(-50, -44, 100, 26, ORANGE, 2, 4) + N(String(day), 0, 38, 44, INK) + T("يوم", 0, -24, 16, "#fff", 800), at(u, .6, .3));
});
// 20 · excision: the surgeon cuts it out. Surest, but the most painful
shot(20, push(300, 540, 1.45, 1.35), function (u, d, t) {
  var c1 = chunkAt(20, 1), c2 = chunkAt(20, 2), ck = at(u, c1, 1.0), out = at(u, c1 + 1.0, .8), s = paper();
  s += canal(t, { L: { sz: 64, col: CUSH_D, cutK: ck, dx: -160 * out, drop: out * .5, fade: at(u, c1 + 1.4, .5) }, R: { sz: 44 }, wound: out });
  // the scalpel tracing the cut
  var sp = along([[340, 440], [352, 520], [340, 600], [300, 610]], ck);
  s += G("translate(" + f(sp[0]) + " " + f(sp[1]) + ") rotate(-35)", '<path d="M0 0 L60 -10 L64 6 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>' + R(62, -8, 120, 16, STEEL_D, 2, 3), 1 - out);
  s += tag("أضمن حل", 190, 330, at(u, c2, .3), 26, BLUE) + check(190, 390, 1, at(u, c2 + .3, .4), BLUE) + tag("أوجع", 430, 330, at(u, c2 + 1.0, .3), 26, ORANGE) + pain(430, 410, 30, t, at(u, c2 + 1.2, .4));
  return s;
}, { tr: "out" });
// 21 · the stapler: cuts a ring of lining above, pulls the cushions back up
shot(21, push(320, 480, 1.25, 1.3), function (u, d, t) {
  var c1 = chunkAt(21, 1), c2 = chunkAt(21, 2), ins = at(u, .3, 1.0), rk = at(u, c1, .6), fire = at(u, c2 - .2, .4), lift = at(u, c2, 1.0), s = paper();
  s += canal(t, { ring: rk, staples: fire, L: { sz: 56, drop: .3 * (1 - lift), lift: lift, shrink: lift * .2, col: CUSH_D }, R: { sz: 52, drop: .2 * (1 - lift), lift: lift, shrink: lift * .2, col: CUSH_D } });
  // the circular stapler: anvil head above the ring, the barrel and handle below
  var hy = lerp(820, 330, ins), outk = at(u, c2 + .6, .6);
  s += G("translate(0 " + f(outk * 520) + ")", R(272, hy, 96, 40, STEEL, 2.4, 14) + R(312, hy + 40, 16, 120, STEEL_D, 2) + R(284, hy + 160, 72, 220, STEEL, 2.4, 6) + '<path d="M290 ' + f(hy + 200) + ' h60 M290 ' + f(hy + 230) + ' h60" stroke="' + STEEL_D + '" stroke-width="2"/>', ins);
  s += label(374, 400, 430, 300, "حلقة الغشا", ORANGE, at(u, c1 + .2, .5), 22) + arrow(200, 560, 200, 470, OLIVE, 6, lift) + G("", T("لمكانها", 150, 600, 24, OLIVE, 800), lift);
  return s;
});
// 22 · laser: a thin fibre goes into the cushion itself and heats it from inside
shot(22, push(300, 560, 1.3, 1.45), function (u, d, t) {
  var c1 = chunkAt(22, 1), c3 = chunkAt(22, 3) || chunkAt(22, 2) + 1, fk = at(u, c1, 1.4), hk = at(u, c3 - .2, .5), s = paper();
  s += canal(t, { L: { sz: 62, col: mix(CUSH_D, "#b0607a", hk * .6) }, R: { sz: 44 } });
  var path = [[150, 860], [230, 750], [300, 600], [312, 530]], pts = upTo(path, fk), tip = pts[pts.length - 1];
  s += '<path d="' + pathPts(pts) + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="' + pathPts(pts) + '" stroke="#e8e2d0" stroke-width="3" fill="none" stroke-linecap="round"/>';
  s += G("translate(" + f(lerp(150, 140, fk)) + " " + f(lerp(860, 850, fk)) + ") rotate(-55)", R(-12, 0, 24, 110, "#4a4a4a", 2, 6) + R(-8, -14, 16, 16, STEEL, 2), 1);
  if (hk > 0) { var g = 18 + 6 * Math.sin(t * 14); s += '<circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(g * 2.2) + '" fill="' + ORANGE + '" opacity="' + f(.22 * hk) + '"/><circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(g) + '" fill="' + ORANGE + '" opacity="' + f(.45 * hk) + '"/>' + C(tip[0], tip[1], 6, "#f6e7a8", 1.6);
    for (var i = 0; i < 3; i++) { var p = (t * 1.2 + i / 3) % 1; s += '<path d="M' + f(tip[0] - 30 + i * 30) + ' ' + f(tip[1] - 50 - p * 50) + ' q8 -10 0 -20 q-8 -10 0 -20" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(hk * (1 - p)) + '"/>'; } }
  s += label(286, 630, 380, 720, "فتلة الليزر", ORANGE, at(u, c1 + .6, .5), 22) + G("", tag("من جوه", 420, 400, 1, 26, ORANGE), hk);
  return s;
}, { tr: "in" });
// 23 · it shrinks and sticks in place with no cut; less pain, quicker back; big ones can come back
shot(23, push(320, 470, 1.2, 1.1), function (u, d, t) {
  var c = window.CHUNKS[23], D = d, sh = at(u, .2, 1.6), s = paper();
  s += canal(t, { L: { sz: 62, shrink: sh * .8, col: mix(CUSH_D, CUSH, sh) }, R: { sz: 44 } });
  s += G("", tag("من غير قص", 430, 420, 1, 24, OLIVE) + check(430, 480, .8, at(u, 1.2, .4), OLIVE), at(u, .9, .3));
  s += G("", R(70, 150, 500, 160, "#f4ecdb", 2) + T("وجع أقل", 440, 204, 26, BLUE, 800) + T("رجوع أسرع", 440, 266, 26, BLUE, 800) + T("الكبيرة ممكن ترجع", 210, 236, 22, ORANGE, 800), at(u, D * (c[1] || .4), .3)) +
    check(535, 196, .6, at(u, D * (c[1] || .4) + .2, .3), BLUE) + check(535, 258, .6, at(u, D * (c[2] || .6) + .2, .3), BLUE) + G("", T("!", 100, 250, 40, ORANGE, 800), at(u, D * (c[3] || .8), .3));
  return s;
}, { tr: "out" });
// 24 · the myth: hemorrhoids don't turn into cancer. But both bleed, so get checked
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c = window.CHUNKS[24], D = d, k2 = at(u, D * (c[2] || .55), .3), k3 = at(u, D * (c[3] || .8), .3), s = paper();
  var cus = '<g transform="translate(-294 -520)">' + cushion(294, 1, { sz: 60, col: CUSH_D }, t) + '</g>';
  s += iconBox(150, 220, 180, G("translate(-14 0)", cus) + T("بواسير", 0, -70, 22, OLIVE, 800), at(u, .2, .3));
  s += iconBox(490, 220, 180, G("scale(.26) translate(-320 -470)", colon(t, 0, 1)) + T("قولون", 0, -70, 22, INK, 800), at(u, .7, .3)) + G("", T("سرطان", 490, 350, 26, ORANGE, 800), at(u, .7, .3));
  s += arrow(250, 220, 390, 220, INK, 5, at(u, .9, .4)) + cross(320, 220, 1.1, at(u, D * (c[1] || .4), .4));
  s += G("", drop(150, 420, 22) + drop(490, 420, 22) + T("الاتنين بينزّلوا دم", 320, 500, 28, ORANGE, 800), k2);
  s += tag("اكشف", 320, 620, k3, 40, BLUE);
  return s;
});
// 25 · «يعني من الآخر»: four cards
shot(25, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var c = window.CHUNKS[25], D = d, s = paper(), b = .5 + .5 * Math.sin(t * 3);
  var cards = [
    [170, 210, G("translate(-294 -520) scale(1)", cushion(294, 1, { sz: 50 }, t) + cushion(346, -1, { sz: 50 }, t)) , "مخدات طبيعية", OLIVE],
    [470, 210, '<g transform="translate(-294 -520)">' + cushion(294, 1, { sz: 50 + 16 * b, col: CUSH_D }, t) + '</g>' + arrow(50, -70, 50, -10, ORANGE, 5, 1), "الحزق بينفخها", ORANGE],
    [170, 530, drop(-30, 10, 26) + '<path d="M0 30 C0 70 80 70 80 30" stroke="' + INK + '" stroke-width="7" fill="none"/>' + C(40, 72, 12, STEEL, 2), "الدم يتكشف عليه", BLUE],
    [470, 530, '<ellipse cx="-50" cy="0" rx="22" ry="10" fill="none" stroke="' + BAND + '" stroke-width="6"/><path d="M0 40 L20 -50" stroke="' + INK + '" stroke-width="5"/>' + C(20, -52, 8, ORANGE, 1.6) + G("translate(40 30) rotate(-40)", '<path d="M0 0 L40 -8 L42 4 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>' + R(40, -6, 50, 12, STEEL_D, 2, 3)), "أستك، ليزر، مشرط", INK]];
  cards.forEach(function (q, i) { s += iconBox(q[0], q[1], 260, G("translate(0 10)", q[2]) + T(q[3], 0, -96, 24, q[4], 800), at(u, D * (c[i] || i * .25) - .1, .3)); });
  return s;
}, { tr: "out" });
// 26 · the odd fact: about half of people by fifty
shot(26, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + floor(500, 40, 600) + floor(740, 40, 600), k = at(u, .8, 1.6), n = Math.round(k * 5);
  for (var i = 0; i < 10; i++) { var x = 110 + (i % 5) * 105, y = i < 5 ? 500 : 740; s += ppl(x, y - 212 * .42, .42, i % 5 < n && i < 5 ? ORANGE : (i >= 5 ? GREY : GREY)); }
  s += bigNum(count(50, at(u, .6, 1.4)) + "%", "من الناس", 320, 170, at(u, .4, .3), ORANGE, 90) + tag("قبل الـ 50", 320, 300, at(u, d - 2.4, .3), 32, INK);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: someone on the sofa watching the video on the phone. line 1: «أنا كويس». line 2: everyone is born with the cushions
  var s = '<path d="M-20 600 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 600, 660, 80, "#e3d7bd", 0);
  s += R(150, 440, 330, 60, "#9a7f62", 2.4, 10) + R(380, 300, 110, 200, "#9a7f62", 2.4, 14) + R(130, 410, 60, 110, "#8a6f52", 2.4, 14) + R(170, 500, 20, 100, WOOD_D, 2) + R(450, 500, 20, 100, WOOD_D, 2);
  var m = fig({ x: 360, y: 442, lean: -8, shirt: SHIRT_V, hands: [rel(80, 64), rel(76, 60)], bend: [1, 1], legs: [[84, -84], [80, -80]], tilt: 14 });
  s += m.far + m.body + m.near + phoneS(m.at(80, 64)[0] - 8, m.at(80, 64)[1] - 18, -20);
  if (li >= 1) { var u = t - LN[1].start;
    s += G("", '<path d="M150 150 h170 a18 18 0 0 1 18 18 v50 a18 18 0 0 1 -18 18 h-40 l10 30 l-40 -30 h-100 a18 18 0 0 1 -18 -18 v-50 a18 18 0 0 1 18 -18 z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/>' + T("أنا كويس", 236, 214, 34, INK, 800), ease(u / .3)) + check(380, 196, .9, ease((u - .4) / .4), BLUE);
  }
  if (li >= 2) { var v = t - LN[2].start;
    s += inset(500, 150, 110, G("translate(-320 -560) scale(1)", canal(t, {})), ease(v / .4)) + G("", T("عند كل الناس", 500, 290, 24, ORANGE, 800), ease((v - .6) / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 100) scale(.36) translate(-320 -560)", canal(t, { L: { sz: 44 + 6 * Math.sin(t * 2) }, R: { sz: 44 + 6 * Math.sin(t * 2) } }));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(300 140) scale(.42) translate(-320 -560)", canal(t, { hl: "dent", ext: .5, L: { sz: 52 }, R: { sz: 48 } })) +
    callout("1", 330, 110, ease(u / .3)) + callout("2", 380, 156, ease(u / .3 - .5)) + callout("3", 240, 190, ease(u / .3 - 1)) + callout("4", 190, 140, ease(u / .3 - 1.5));
};
