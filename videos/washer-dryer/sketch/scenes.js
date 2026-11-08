window.CHUNKS = [[0.0, 0.6744], [0.0], [0.0], [0.0, 0.4194], [0.0, 0.5472], [0.0, 0.7045], [0.0], [0.0, 0.4082], [0.0, 0.4255, 0.7447], [0.0, 0.1964, 0.6964], [0.0, 0.378, 0.7317], [0.0, 0.7414], [0.0], [0.0], [0.0, 0.3095, 0.5952], [0.0, 0.5238], [0.0, 0.2063, 0.6667], [0.0, 0.7069], [0.0, 0.4211, 0.7368], [0.0], [0.0, 0.6667], [0.0, 0.5102], [0.0, 0.4219, 0.7969], [0.0, 0.1562, 0.4792, 0.6875], [0.0, 0.5846], [0.0], [0.0]];
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

// ── «الغسالة اللي بتنشّف» — drawings from the standard front-loading washer-dryer layout (refs/SOURCES.md), in the «اسكتش» hand.
var STEEL = "#d9dcd8", STEEL_D = "#aeb3b0", TUBC = "#c9c4b4", CAB = "#efe9dc", CAB_D = "#d8d0bd", WATER = "#9fb7c3", HOT = "#d9653f", FOAM = "#fbf8f0";
var CLOTH = [OLIVE, ORANGE, BLUE, "#b98a5e", "#8f6a8a", "#c9a227"];

// a piece of cloth: a soft crumpled shape, coloured, with a fold line
function cloth(x, y, s, c, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + s + ")", '<path d="M-22 -10 C-14 -24 6 -20 18 -14 C30 -6 26 12 14 18 C0 26 -20 20 -26 8 C-30 0 -28 -4 -22 -10 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -4 C-2 2 8 0 14 -6" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".5"/>'); }

// ── the drum seen straight on (a cut through the tub): perforated drum, three lifters, low water, clothes tumbling.
// op.spin 0..1 (clothes pinned to the wall, water flying out), op.foam 0..1, op.steam, op.level (water height 0..1 of R)
function drumFront(cx, cy, R, t, op) {
  op = op || {}; var spin = op.spin || 0, rot = t * (0.9 + spin * 9), id = "dc" + (++CLIPN), s = "";
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R * 1.14) + '" fill="' + TUBC + '" stroke="' + INK + '" stroke-width="3"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R * 1.14) + '" fill="url(#hatch)"/>';
  s += '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R) + '"/></clipPath><g clip-path="url(#' + id + ')">';
  s += '<rect x="' + f(cx - R) + '" y="' + f(cy - R) + '" width="' + f(2 * R) + '" height="' + f(2 * R) + '" fill="' + STEEL + '"/>';
  for (var k = 0; k < 140; k++) { var a = k * 2.399 + rot, rr = R * (.35 + .62 * ((k * 37) % 100) / 100); s += '<circle cx="' + f(cx + Math.cos(a) * rr) + '" cy="' + f(cy + Math.sin(a) * rr) + '" r="' + f(R * .018) + '" fill="' + STEEL_D + '"/>'; }
  var lvl = op.level == null ? .32 : op.level, wy = cy + R - lvl * 2 * R * (1 - spin);
  if (lvl > 0 && spin < 1) s += '<path d="M' + f(cx - R) + ' ' + f(wy) + ' ' + Array.from({ length: 13 }, function (_, i) { return 'L' + f(cx - R + i * R / 6) + ' ' + f(wy + 5 * Math.sin(i * 1.3 + t * 4)); }).join(" ") + ' L' + f(cx + R) + ' ' + f(cy + R) + ' L' + f(cx - R) + ' ' + f(cy + R) + ' Z" fill="' + WATER + '" opacity=".85"/>';
  if (op.foam) for (k = 0; k < 46; k++) { var fx = cx - R + hash(k) * 2 * R, fy = cy + R * .2 + hash(k + 9) * R * .8; s += '<circle cx="' + f(fx) + '" cy="' + f(fy + 3 * Math.sin(t * 2 + k)) + '" r="' + f((10 + hash(k + 4) * 18) * op.foam) + '" fill="' + FOAM + '" stroke="' + STEEL_D + '" stroke-width="1.2"/>'; }
  // clothes: ride up on the wall, then drop; when spinning, pinned evenly to the wall
  for (k = 0; k < 6; k++) {
    var x, y, r2;
    if (spin > .5) { var aa = rot + k * 1.047; x = cx + Math.cos(aa) * R * .84; y = cy + Math.sin(aa) * R * .84; r2 = aa * 57.3; }
    else {
      var p = (t * .42 + k / 6) % 1;
      if (p < .6) { var ang = Math.PI * (.62 - .9 * (p / .6)); x = cx + Math.cos(ang) * R * .78; y = cy + Math.sin(ang) * R * .78; r2 = ang * 57.3; }
      else { var q = (p - .6) / .4, top = Math.PI * (.62 - .9); x = cx + Math.cos(top) * R * .78 - q * R * .25; y = lerp(cy + Math.sin(top) * R * .78, cy + R * .6, q * q); r2 = q * 200; if (op.foam && q > .55) y = Math.min(y, cy + R * .25); }
    }
    s += cloth(x, y, R / 120, CLOTH[k], r2);
  }
  if (op.steam) for (k = 0; k < 7; k++) { var sx = cx - R * .6 + k * R * .2, u = (t * .6 + k * .17) % 1; s += '<path d="M' + f(sx) + ' ' + f(cy + R * .4 - u * R) + ' q-10 -14 0 -28 q10 -14 0 -28" stroke="#fff" stroke-width="5" fill="none" opacity="' + f(op.steam * (1 - u)) + '"/>'; }
  s += '</g>';
  // the three lifters (paddles)
  for (k = 0; k < 3; k++) { var la = rot + k * 2.094; s += G("translate(" + f(cx + Math.cos(la) * R * .9) + " " + f(cy + Math.sin(la) * R * .9) + ") rotate(" + f(la * 57.3 + 90) + ")", '<path d="M-' + f(R * .14) + ' 0 L0 ' + f(R * .2) + ' L' + f(R * .14) + ' 0 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>'); }
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  // water flying out through the holes when spinning
  if (spin > .3) for (k = 0; k < 18; k++) { var da = k * .349 + rot * .2, u2 = (t * 2.2 + k * .13) % 1, d0 = R * (1.0 + u2 * .3); s += '<path d="M' + f(cx + Math.cos(da) * d0) + ' ' + f(cy + Math.sin(da) * d0) + ' l' + f(Math.cos(da) * 14) + ' ' + f(Math.sin(da) * 14) + '" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round" opacity="' + f((1 - u2) * spin) + '"/>'; }
  return s;
}

// ── the whole machine from the side, cut open. op: water (0..1), heat (0..1), air (0..1, the drying loop), cond (0..1), labels
function machineSide(t, op) {
  op = op || {}; var s = "";
  s += R(110, 140, 420, 520, CAB, 3) + R(110, 140, 420, 46, CAB_D, 2) + R(126, 150, 92, 24, "#f7f3ea", 1.6) + '<circle cx="470" cy="163" r="12" fill="#f7f3ea" stroke="' + INK + '" stroke-width="1.6"/>';
  s += R(118, 640, 404, 20, CAB_D, 2) + R(130, 660, 30, 14, INK, 0) + R(480, 660, 30, 14, INK, 0);
  // springs from the top, dampers from the bottom
  [220, 420].forEach(function (x) { var d = "M" + x + " 186"; for (var k = 1; k <= 10; k++) d += " L" + (x + (k % 2 ? 9 : -9)) + " " + (186 + k * 7.5); s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'; });
  [230, 410].forEach(function (x) { s += R(x - 7, 560, 14, 80, STEEL_D, 1.8) + R(x - 4, 540, 8, 30, "#7d817e", 1.4); });
  // tub (a cylinder from the side) with the drum inside
  s += '<path d="M190 262 H458 A28 128 0 0 1 458 518 H190 Z" fill="' + TUBC + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M190 262 H458 A28 128 0 0 1 458 518 H190 Z" fill="url(#hatch)"/>';
  s += '<ellipse cx="190" cy="390" rx="28" ry="128" fill="#b8b2a0" stroke="' + INK + '" stroke-width="2.6"/>';
  s += R(200, 280, 250, 220, STEEL, 2.2);
  for (var k = 0; k < 9; k++) for (var j = 0; j < 6; j++) s += '<circle cx="' + (220 + k * 27) + '" cy="' + (298 + j * 36) + '" r="3" fill="' + STEEL_D + '"/>';
  if (op.water) s += '<rect x="200" y="' + f(500 - 60 * op.water) + '" width="250" height="' + f(60 * op.water) + '" fill="' + WATER + '" opacity=".85"/><path d="M200 ' + f(500 - 60 * op.water) + ' ' + Array.from({ length: 11 }, function (_, i) { return "L" + (200 + i * 25) + " " + f(500 - 60 * op.water + 3 * Math.sin(i + t * 4)); }).join(" ") + '" stroke="#e8eef0" stroke-width="2" fill="none"/>';
  for (k = 0; k < 4; k++) s += cloth(240 + k * 55, 470 - (k % 2) * 30, .9, CLOTH[k], k * 40 + t * 20);
  // door (porthole bulge) at the front
  s += '<path d="M150 300 C126 330 126 450 150 480 L170 480 L170 300 Z" fill="#c9d6da" stroke="' + INK + '" stroke-width="2.4"/><path d="M146 320 C132 350 132 430 146 460" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>';
  // pulley at the back, belt to the motor below
  s += '<circle cx="478" cy="390" r="36" fill="' + STEEL_D + '" stroke="' + INK + '" stroke-width="2.4"/>' + G("rotate(" + f(t * 200) + " 478 390)", '<path d="M478 360 V420 M448 390 H508" stroke="' + INK + '" stroke-width="3"/>');
  s += '<path d="M500 410 L455 588 M456 368 L410 590" stroke="' + INK + '" stroke-width="3" fill="none"/>' + R(380, 575, 80, 50, "#7d817e", 2.4) + '<circle cx="433" cy="592" r="10" fill="' + STEEL_D + '" stroke="' + INK + '" stroke-width="2"/>';
  // heater element under the tub
  var hc = op.heat ? lerp(0, 1, op.heat) : 0, hd = "M250 535"; for (k = 1; k <= 12; k++) hd += " L" + (250 + k * 13) + " " + (535 + (k % 2 ? 10 : 0));
  s += '<path d="' + hd + '" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="' + hd + '" stroke="' + (hc > 0 ? HOT : STEEL_D) + '" stroke-width="4" fill="none"/>';
  if (hc > 0) for (k = 0; k < 4; k++) s += '<path d="M' + (270 + k * 40) + ' ' + f(526 - ((t * 30 + k * 10) % 30)) + ' q-6 -8 0 -16" stroke="' + HOT + '" stroke-width="3" fill="none" opacity="' + f(hc * .8) + '"/>';
  // drain pump at the bottom front, pipe to the back
  s += R(150, 590, 60, 40, "#7d817e", 2.2) + '<path d="M210 610 H370" stroke="' + INK + '" stroke-width="8" fill="none"/><path d="M210 610 H370" stroke="' + STEEL_D + '" stroke-width="5" fill="none"/>';
  // drying: fan box on top, hot-air duct into the door, condenser duct down the back
  s += R(300, 196, 120, 54, "#e0d8c4", 2.2) + G("rotate(" + f(t * (op.air ? 400 : 20)) + " 334 223)", '<path d="M334 223 l14 -14 M334 223 l14 14 M334 223 l-14 14 M334 223 l-14 -14" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>') + '<circle cx="334" cy="223" r="5" fill="' + INK + '"/>';
  s += '<path d="M300 222 H176 V300" stroke="' + INK + '" stroke-width="18" fill="none" stroke-linejoin="round"/><path d="M300 222 H176 V300" stroke="' + (op.air ? HOT : "#e0d8c4") + '" stroke-width="13" fill="none" stroke-linejoin="round" opacity="' + f(op.air ? .3 + .7 * op.air : 1) + '"/>';
  s += R(484, 250, 26, 300, op.cond ? BLUE : "#cfd8da", 2.2) + '<path d="M420 222 H497 V250" stroke="' + INK + '" stroke-width="14" fill="none"/><path d="M420 222 H497 V250" stroke="#e0d8c4" stroke-width="9" fill="none"/>';
  if (op.cond) for (k = 0; k < 6; k++) { var dy = 260 + ((t * 80 + k * 50) % 280); s += '<path d="M497 ' + f(dy) + ' q-5 8 0 12 q5 -4 0 -12 Z" fill="#fff" stroke="' + INK + '" stroke-width="1" opacity="' + f(op.cond) + '"/>'; }
  // the drying loop as moving arrows: fan → heater duct → drum → condenser → fan
  if (op.air) { var path = [[300, 222], [176, 222], [176, 300], [330, 360], [470, 300], [497, 250], [497, 222], [420, 222]];
    for (k = 0; k < 7; k++) { var u = (t * .25 + k / 7) % 1, seg = u * (path.length - 1), i = Math.floor(seg), fr = seg - i, a0 = path[i], a1 = path[i + 1]; var px = lerp(a0[0], a1[0], fr), py = lerp(a0[1], a1[1], fr);
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="7" fill="' + (i >= 4 ? BLUE : HOT) + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(op.air) + '"/>'; } }
  return s;
}
// ── molecules: a stain on a thread cut by enzymes (k: how far), oil lifted by detergent "tadpoles" (k)
function fibers(y) { var s = ""; for (var k = 0; k < 3; k++) s += '<path d="M40 ' + (y + k * 26) + ' C200 ' + (y - 14 + k * 26) + ' 440 ' + (y + 14 + k * 26) + ' 600 ' + (y + k * 26) + '" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M40 ' + (y + k * 26) + ' C200 ' + (y - 14 + k * 26) + ' 440 ' + (y + 14 + k * 26) + ' 600 ' + (y + k * 26) + '" stroke="#d8cdb4" stroke-width="12" fill="none" stroke-linecap="round"/>'; return s; }
function enzymeScene(t, k) {
  var s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + WATER + '" opacity=".35"/>' + fibers(520);
  for (var i = 0; i < 10; i++) { var bx = 190 + i * 28, by = 470 + Math.sin(i) * 10, br = clamp(k * 2 - i / 10), fly = br > .5 ? (br - .5) * 160 : 0;
    s += '<circle cx="' + f(bx + (i % 2 ? fly * .4 : -fly * .4)) + '" cy="' + f(by - fly) + '" r="13" fill="#8a5a3c" stroke="' + INK + '" stroke-width="1.6"/>'; }
  for (i = 0; i < 4; i++) { var ex = 210 + i * 70, ey = 420 - 10 * Math.sin(t * 3 + i), mouth = .3 + .25 * Math.abs(Math.sin(t * 6 + i));
    s += '<path d="M' + ex + ' ' + ey + ' L' + f(ex + 30 * Math.cos(mouth)) + ' ' + f(ey - 30 * Math.sin(mouth)) + ' A30 30 0 1 0 ' + f(ex + 30 * Math.cos(mouth)) + ' ' + f(ey + 30 * Math.sin(mouth)) + ' Z" transform="rotate(90 ' + ex + ' ' + ey + ')" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>'; }
  return s;
}
function oilScene(t, k) {
  var lift = ease(k), s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + WATER + '" opacity=".35"/>' + fibers(560);
  var ox = 320, oy = lerp(520, 330, lift), r = 70;
  s += '<ellipse cx="' + ox + '" cy="' + f(oy) + '" rx="' + r + '" ry="' + f(r * .75) + '" fill="#e6b84a" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i < 14; i++) { var a = i / 14 * 6.283 + t * .3, hx = ox + Math.cos(a) * (r + 34), hy = oy + Math.sin(a) * (r * .75 + 34), tx = ox + Math.cos(a) * (r - 8), ty = oy + Math.sin(a) * (r * .75 - 8);
    s += '<path d="M' + f(hx) + ' ' + f(hy) + ' L' + f(tx) + ' ' + f(ty) + '" stroke="' + INK + '" stroke-width="3"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="10" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
  return s;
}
function thermo(x, y, v, k) { var h = 200 * clamp(v) * ease(k); return R(x - 14, y - 220, 28, 230, "#f6f1e6", 2.4, 14) + R(x - 7, y - h, 14, h, HOT, 0) + C(x, y + 14, 22, HOT, 2.4) + [20, 30, 40, 60].map(function (d, i) { var yy = y - (d / 60) * 200; return '<path d="M' + (x + 16) + ' ' + f(yy) + ' h14" stroke="' + INK + '" stroke-width="2"/>' + T(d + "°", x + 54, yy + 7, 20, INK, 700); }).join(""); }
function speedo(x, y, r, v, k) { var a = Math.PI * (1 - clamp(v * ease(k) / 140)); var s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i <= 7; i++) { var b = Math.PI * (1 - i / 7); s += '<path d="M' + f(x + Math.cos(b) * r * .82) + ' ' + f(y - Math.sin(b) * r * .82) + ' L' + f(x + Math.cos(b) * r * .95) + ' ' + f(y - Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="3"/>' + T(String(i * 20), x + Math.cos(b) * r * .68, y - Math.sin(b) * r * .68 + 7, 18, INK, 700); } return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y - Math.sin(a) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="6" stroke-linecap="round"/>' + C(x, y, 10, INK, 0); }
function mirror(x, y, w, h, fog, t) { var s = R(x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, WOOD, 3, 12) + R(x - w / 2, y - h / 2, w, h, "#bcd3dc", 2.4, 8) + '<path d="M' + f(x - w / 2 + 30) + ' ' + f(y - h / 2 + 40) + ' l60 -30 M' + f(x - w / 2 + 30) + ' ' + f(y - h / 2 + 80) + ' l110 -55" stroke="#fff" stroke-width="8" opacity=".7"/>' + '<rect x="' + f(x - w / 2) + '" y="' + f(y - h / 2) + '" width="' + w + '" height="' + h + '" rx="8" fill="#f4f6f5" opacity="' + f(.82 * fog) + '"/>'; for (var k = 0; k < 34; k++) { var dx = x - w / 2 + 16 + hash(k) * (w - 32), dy = y - h / 2 + 24 + ((t * 26 * (.4 + hash(k + 3)) + hash(k + 5) * h) % (h - 40)), r = 4 + hash(k + 8) * 6; s += '<path d="M' + f(dx) + ' ' + f(dy - r * 1.6) + ' q' + f(-r) + ' ' + f(r * 1.6) + ' 0 ' + f(r * 2.4) + ' q' + f(r) + ' ' + f(-r * .8) + ' 0 ' + f(-r * 2.4) + ' Z" fill="#9fb7c3" stroke="' + INK + '" stroke-width="1" opacity="' + f(fog) + '"/>'; } for (k = 0; k < 4; k++) { var u = (t * .4 + k * .25) % 1; s += '<path d="M' + f(x - 120 + k * 80) + ' ' + f(y + h / 2 + 90 - u * 160) + ' q-12 -18 0 -36 q12 -18 0 -36" stroke="' + MUTE + '" stroke-width="5" fill="none" opacity="' + f((1 - u) * .7) + '"/>'; } return s; }

// ── shots (line numbers from script.txt)
// 4 · inside: a perforated steel drum, inside a closed tub that doesn't turn
shot(4, push(330, 400, 1.15, 1.05), function (u, d, t) { return paper() + machineSide(t, { water: 0 }) + label(330, 300, 360, 110, "الحلة", OLIVE, at(u, .4, .5), 24) + label(460, 470, 590, 560, "الحوض", OLIVE, at(u, 1.4, .5), 24); });
// 5 · water fills only the bottom of the tub: about 15 litres
shot(5, push(330, 430, 1.05, 1.2), function (u, d, t) { return paper() + machineSide(t, { water: at(u, .2, 1.6) }) + numBox("15", 200, 700, at(u, 1.2, .3), 42) + T("لتر", 200, 758, 24, INK, 700); });
// 6 · how can so little water wash? the drum straight on, a question
shot(6, push(320, 400, 1.0, 1.06), function (u, d, t) { return paper() + drumFront(320, 400, 210, t * .3, {}) + T("؟", 320, 440, 160, ORANGE, 800); }, { tr: "in" });
// 7 · the drum turns slowly; the lifters carry the clothes up …
shot(7, push(320, 400, 1.02, 1.1), function (u, d, t) { return paper() + drumFront(320, 400, 210, t, {}) + label(320 + 189 * Math.cos(t * .9 + 2.094), 400 + 189 * Math.sin(t * .9 + 2.094), 140, 140, "الريش", OLIVE, at(u, .6, .5), 24); });
// 8 · … and drop them into the water, squeezed and beaten, again and again
shot(8, push(330, 470, 1.25, 1.4), function (u, d, t) { return paper() + drumFront(320, 400, 210, t, { level: .38 }); });
// 9 · a heater under the tub warms the water to 30–40 degrees
shot(9, push(310, 440, 1.0, 1.1), function (u, d, t) { return paper() + machineSide(t, { water: 1, heat: at(u, .4, .6) }) + label(330, 540, 300, 720, "السخان", ORANGE, at(u, .6, .5), 24) + G("translate(560 520) scale(.7)", thermo(0, 0, .65, at(u, 1.4, 1.2))); });
// 10 · enzymes break food and sweat stains into small pieces, best in the warm
shot(10, push(320, 450, 1.05, 0.98), function (u, d, t) { return paper() + enzymeScene(t, at(u, .8, d - 1.2)) + label(210, 420, 120, 250, "إنزيمات", OLIVE, at(u, .4, .5), 24) + label(290, 470, 470, 300, "البقعة", "#8a5a3c", at(u, .2, .5), 24); }, { tr: "in" });
// 11 · other molecules hold the oil and pull it into the water
shot(11, push(320, 440, 1.0, 1.06), function (u, d, t) { return paper() + oilScene(t, at(u, .5, d - 1)) + label(320, 340, 470, 200, "الزيت", ORANGE, at(u, .3, .5), 24); });
// 12 · how do the clothes come out nearly dry?
shot(12, push(320, 400, 1.06, 1.0), function (u, d, t) { return paper() + drumFront(320, 400, 210, t * .4, { level: .3 }) + T("؟", 500, 220, 130, ORANGE, 800); }, { tr: "out" });
// 13 · the drum spins up to 1,400 turns a minute
shot(13, push(320, 400, 1.0, 1.04), function (u, d, t) { var k = at(u, .2, 1.6); return paper() + drumFront(320, 400, 200, t, { spin: k, level: .3 * (1 - k) }) + numBox(count(1400, k), 320, 690, at(u, .2, .3), 40) + T("لفة / دقيقة", 320, 750, 22, INK, 700); });
// 14 · clothes pinned to the wall, water flying out of the holes, like mud off a car wheel
shot(14, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var wheel = '<circle r="34" fill="#3d3a34" stroke="' + INK + '" stroke-width="2"/><circle r="14" fill="' + STEEL_D + '" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3].map(function (k) { var a = -1.2 - k * .3; return '<circle cx="' + f(Math.cos(a) * (46 + k * 6)) + '" cy="' + f(Math.sin(a) * (46 + k * 6)) + '" r="' + (6 - k) + '" fill="#8a6a46"/>'; }).join("");
  return paper() + drumFront(320, 420, 200, t, { spin: 1, level: 0 }) + iconBox(520, 120, 140, G("rotate(" + f(t * 300) + ")", wheel), at(u, d * .5, .3));
});
// 15 · that force is more than 500 times the Earth's gravity
shot(15, push(320, 420, 1.02, 0.96), function (u, d, t) { var k = at(u, .3, 1); return paper() + drumFront(240, 430, 150, t, { spin: 1, level: 0 }) + arrow(470, 560, 470, 600, INK, 5, k) + T("الأرض", 470, 640, 22, INK, 700) + arrow(560, 600, 560, 600 - 420 * k, ORANGE, 10, k) + numBox("500×", 560, 140, at(u, 1.2, .3), 40); });
// 16 · drying: a fan blows air over a heater and into the drum
shot(16, push(320, 330, 1.2, 1.35), function (u, d, t) { return paper() + machineSide(t, { air: at(u, .4, .6) }) + label(334, 223, 420, 110, "المروحة", OLIVE, at(u, .3, .5), 22) + label(220, 222, 140, 110, "سخان", ORANGE, at(u, 1, .5), 22); }, { tr: "in" });
// 17 · the hot air turns the water in the clothes to steam
shot(17, push(320, 400, 1.04, 1.12), function (u, d, t) { return paper() + drumFront(320, 400, 210, t * .6, { level: 0, steam: at(u, .3, .8) }); }, { tr: "in" });
// 18 · it passes a cold condenser, turns back to water and drains away
shot(18, push(470, 420, 1.35, 1.5), function (u, d, t) { return paper() + machineSide(t, { air: 1, cond: at(u, .3, .6) }) + label(497, 420, 600, 600, "المكثّف", BLUE, at(u, .6, .5), 22); }, { tr: "out" });
// 19 · like the bathroom mirror misting after a shower
shot(19, push(320, 400, 1.05, 0.98), function (u, d, t) { return paper() + mirror(320, 380, 340, 440, at(u, .2, 1.4), t) + R(150, 610, 340, 30, CAB_D, 2.4); });
// 20 · the dry air goes back to the heater, round and round
shot(20, push(330, 400, 0.98, 1.06), function (u, d, t) { return paper() + machineSide(t, { air: 1, cond: 1 }) + draw("M300 160 C420 110 560 170 540 260", at(u, .3, .8), ORANGE, 4) + arrow(540, 250, 545, 265, ORANGE, 4, at(u, 1, .2)); });
// 21 · the myth: more powder means cleaner clothes — no
shot(21, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var box = R(150, 260, 180, 230, ORANGE, 3, 8) + R(150, 260, 180, 46, "#f4ecdb", 2, 8) + T("مسحوق", 240, 420, 34, "#fff", 800);
  var pile = ""; for (var k = 0; k < 30; k++) pile += '<circle cx="' + f(380 + hash(k) * 140) + '" cy="' + f(560 - hash(k + 5) * 80 * at(u, .2, 1)) + '" r="' + f(8 + hash(k + 2) * 10) + '" fill="#fbf8f0" stroke="' + STEEL_D + '" stroke-width="1.2"/>';
  return paper() + G("rotate(" + f(-25 * at(u, 0, .6)) + " 240 380)", box) + pile + cross(450, 470, 1.4, at(u, d * .72, .5));
});
// 22 · the extra foam is a cushion: the clothes don't beat, and it leaves residue
shot(22, push(320, 420, 1.0, 1.1), function (u, d, t) { return paper() + drumFront(320, 400, 210, t, { foam: at(u, .2, .8), level: .3 }) + label(320, 520, 470, 700, "مخدة رغوة", ORANGE, at(u, 1, .5), 22); });
// 23 · recap: everything at once, labelled
shot(23, push(320, 420, 0.94, 1.0), function (u, d, t) {
  return paper() + machineSide(t, { water: .6, heat: 1, air: at(u, 3, .5), cond: at(u, 3.5, .5) }) + label(330, 300, 350, 100, "خبط", OLIVE, at(u, .3, .4), 22) + label(330, 540, 300, 720, "دفا", ORANGE, at(u, .8, .4), 22) + label(478, 390, 560, 700, "عصر", ORANGE, at(u, 1.8, .4), 22) + label(497, 300, 600, 200, "تنشيف", BLUE, at(u, 3.4, .4), 22);
}, { tr: "out" });
// 24 · the odd fact: the rim of the drum moves faster than 120 km/h
shot(24, push(320, 420, 1.0, 1.06), function (u, d, t) { return paper() + drumFront(220, 470, 150, t, { spin: 1, level: 0 }) + G("translate(470 300)", speedo(0, 0, 130, 126, at(u, .4, 1.8))) + T("كم/س", 470, 340, 24, INK, 700) + G("", N("126", 470, 400, 46, ORANGE), at(u, 2, .3)); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = '<rect x="104" y="40" width="400" height="520" rx="14" fill="' + CAB + '" stroke="' + INK + '" stroke-width="3"/><rect x="104" y="40" width="400" height="80" rx="14" fill="' + CAB_D + '" stroke="' + INK + '" stroke-width="2"/><rect x="126" y="58" width="110" height="40" rx="6" fill="#f7f3ea" stroke="' + INK + '" stroke-width="2"/><circle cx="450" cy="80" r="22" fill="#f7f3ea" stroke="' + INK + '" stroke-width="2"/><rect x="330" y="66" width="70" height="28" rx="4" fill="#3d3a34"/>';
  s += '<circle cx="304" cy="330" r="168" fill="#e6e1d4" stroke="' + INK + '" stroke-width="3"/>' + drumFront(304, 330, 140, t, { level: li === 0 ? .3 : 0, steam: li >= 1 ? .8 : 0 });
  if (li >= 1) { var k = ease((t - LN[1].start) / .4); s += appear(k, G("translate(560 120)", '<circle r="34" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * .785; return '<path d="M' + f(Math.cos(a) * 42) + ' ' + f(Math.sin(a) * 42) + ' l' + f(Math.cos(a) * 12) + ' ' + f(Math.sin(a) * 12) + '" stroke="' + INK + '" stroke-width="4"/>'; }).join("")) + cross(560, 120, .9, ease((t - LN[1].start - .6) / .4))); }
  if (li >= 2) s += '<circle cx="304" cy="330" r="150" fill="none" stroke="' + ORANGE + '" stroke-width="6" stroke-dasharray="14 10" opacity="' + f(ease((t - LN[2].start) / .4)) + '"/>';
  return s;
};
SCENE.bumper = function (u, t) { return drumFront(90, 112, 64, t, { level: .3 }); };
SCENE.outro = function (svg, u, t) { return G("translate(80 -60) scale(.6)", machineSide(t, { water: .5, heat: 1, air: 1, cond: 1 })) + callout("1", 280, 175, ease(u / .3)) + callout("2", 270, 270, ease(u / .3 - .5)) + callout("3", 300, 60, ease(u / .3 - 1)) + callout("4", 395, 200, ease(u / .3 - 1.5)); };
