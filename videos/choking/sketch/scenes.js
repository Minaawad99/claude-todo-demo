window.CHUNKS = [[0.0, 0.4773], [0.0, 0.3, 0.55], [0.0, 0.381], [0.0, 0.3095, 0.5714], [0.0], [0.0, 0.3636, 0.5606], [0.0, 0.1935, 0.5645], [0.0, 0.4783, 0.7536], [0.0, 0.4], [0.0, 0.2923, 0.5385], [0.0, 0.4688, 0.8125], [0.0, 0.3286, 0.7], [0.0, 0.3, 0.4667], [0.0, 0.4151, 0.8679], [0.0, 0.2048, 0.5663], [0.0, 0.72], [0.0, 0.2292, 0.6042], [0.0, 0.4909], [0.0, 0.2198, 0.6813], [0.0, 0.2174, 0.6232], [0.0, 0.5106], [0.0, 0.2742, 0.6613], [0.0, 0.2206, 0.3971, 0.5294, 0.7206], [0.0, 0.4583], [0.0, 0.54], [0.0]];
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

// ── «لو حد شرق قدامك» — drawings. Shapes follow the «طب إزاي؟» reference (v04 head cut and «الزور» inset, v20 flat
// salmon bodies) and real references (refs/SOURCES.md): the throat is a mid-line cut of the head and neck with the windpipe
// in front, the gullet behind it and the spine at the back; the epiglottis hinges at the front of the voice box and folds
// back over it. People are flat side-view figures; the rescuer stands at the side for back blows and behind for thrusts.

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the throat: mid-line cut of head and neck, face to the left ──
// o: {ep: 0 open … 1 closed, food: [x,y] | null, air: 0..1 (air running in the windpipe), hl: "food" | "air" | "ep", water, finger}
var MOUTH = [118, 330], FOOD_OK = [[150, 318], [250, 300], [318, 318], [345, 380], [352, 470], [350, 560], [350, 700], [350, 820]],
    FOOD_BAD = [[150, 318], [250, 300], [318, 318], [330, 380], [300, 470], [290, 520]];
function throat(t, o) {
  o = o || {}; var s = "";
  var head = "M250 40 C380 30 482 92 490 200 C496 282 470 332 452 380 L452 800 L250 800 L250 560 C250 522 232 492 202 472 C172 456 142 452 122 442 C102 432 96 406 110 392 C100 382 96 366 106 356 C94 350 92 336 102 326 C96 312 92 302 86 292 C60 287 50 270 70 255 C86 222 110 182 116 150 C122 110 162 52 250 40 Z";
  s += P(head, SKIN, 2.6);
  s += '<path d="' + head + '" fill="url(#hatch)" opacity=".18"/>';
  // spine at the back of the neck
  for (var y = 300; y < 800; y += 46) s += R(398, y, 50, 36, BONE, 1.8, 5) + R(402, y + 36, 42, 10, "#d7a48a", 1.2);
  // air spaces: nose, mouth roof, throat; the windpipe and the gullet below
  s += P("M120 205 C175 178 262 184 334 212 L334 246 C262 238 182 246 126 254 Z", CAV, 2);
  s += P("M108 322 C170 290 262 280 334 250 L334 214 C364 208 386 228 386 262 L386 482 L262 482 L262 462 L300 420 L312 332 Z", CAV, 2);
  // windpipe (front) with cartilage rings
  s += R(262, 478, 56, 330, o.hl === "air" ? AIRC : "#e9e4d8", 2.4);
  for (y = 500; y < 800; y += 28) s += P("M262 " + y + " Q290 " + (y + 9) + " 318 " + y, "none", 5, ' stroke="' + BONE + '"') + P("M262 " + (y - 3) + " Q290 " + (y + 6) + " 318 " + (y - 3), "none", 1.2);
  // gullet (behind): a soft, closed tube that opens where the food is
  var fy = o.food && o.food[0] > 322 && o.food[1] > 478 ? o.food[1] : -999;
  s += R(330, 478, 44, 330, o.hl === "food" ? "#c7b06a" : "#d79b85", 2.4);
  var slit = "M352 482"; for (y = 492; y <= 800; y += 10) { var w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 - w) + " " + y; } s += P(slit, "none", 1.6);
  slit = "M352 482"; for (y = 492; y <= 800; y += 10) { w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 + w) + " " + y; } s += P(slit, "none", 1.6);
  // air running up and down the windpipe and out of the nose
  if (o.air) s += G("", '<path d="M290 800 L290 470 L340 330 L345 240 L250 225 L120 230" fill="none" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 16" stroke-dashoffset="' + f(-t * 46) + '"/>', o.air);
  // hard palate (bone) and soft palate
  s += P("M104 300 C170 288 250 280 312 272", "none", 9, ' stroke="' + INK + '"') + P("M104 300 C170 288 250 280 312 272", "none", 5, ' stroke="' + BONE + '"');
  s += P("M310 268 C330 270 346 290 348 322 C340 330 330 322 322 300 Z", "#d78f7b", 1.8);
  // lower jaw bone
  s += P("M112 410 C150 440 205 466 246 476", "none", 12, ' stroke="' + INK + '" stroke-linecap="round"') + P("M112 410 C150 440 205 466 246 476", "none", 7, ' stroke="' + BONE + '" stroke-linecap="round"');
  // tongue
  s += P("M112 336 C150 300 250 286 296 300 C322 316 316 382 302 420 C292 450 276 464 262 468 C230 468 190 446 150 413 C128 396 114 370 112 336 Z", TONGUE, 2.4);
  s += '<path d="M150 340 C200 318 250 312 285 320" stroke="#a9584b" stroke-width="1.6" fill="none"/><path d="M160 372 C210 352 255 350 290 360" stroke="#a9584b" stroke-width="1.4" fill="none" opacity=".7"/>';
  // the epiglottis: hinged at the front of the voice box, upright when breathing, folded back over the windpipe when swallowing
  var a = lerp(-78, 14, clamp(o.ep || 0)) * Math.PI / 180, px = 266, py = 466, L = 66, nx = Math.cos(a), ny = Math.sin(a), qx = -ny, qy = nx;
  s += P("M" + f(px) + " " + f(py) + " Q" + f(px + nx * L * .5 + qx * 13) + " " + f(py + ny * L * .5 + qy * 13) + " " + f(px + nx * L) + " " + f(py + ny * L) + " Q" + f(px + nx * L * .5 - qx * 6) + " " + f(py + ny * L * .5 - qy * 6) + " " + f(px) + " " + f(py) + " Z", o.hl === "ep" ? OLIVE : "#a3a26a", 2.2);
  // food, water, finger
  if (o.water) s += o.water;
  if (o.food) s += C(o.food[0], o.food[1], 17, FOOD, 2.2) + '<circle cx="' + f(o.food[0] - 5) + '" cy="' + f(o.food[1] - 6) + '" r="4" fill="#fff" opacity=".35"/>';
  if (o.finger) s += o.finger;
  return s;
}

// ── people: flat side-view figures facing left. Joints by angle (deg from straight down, + toward the front) or hands by IK.
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {   // elbow for a two-bone arm reaching tg; bend +1 / -1 picks the side
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
// o: {x, y (hip), s, lean, shirt, hair, legs: [[thigh, shin], [thigh, shin]], hands: [[x,y] | null, …], bend: [±1, ±1], belly, kneel}
// returns {far, body, near}: draw far, then whatever goes between, then body, then near
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], sh = [hip[0] + up[0] * 128 * s, hip[1] + up[1] * 128 * s], hd = [hip[0] + up[0] * 178 * s, hip[1] + up[1] * 178 * s];
  var fw = [up[1], -up[0]];   // perpendicular to the torso, pointing to the front (left)
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function leg(i) { var k = hip.slice(), a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [k[0] + a[0] * 88 * s, k[1] + a[1] * 88 * s], ft = [kn[0] + b[0] * 86 * s, kn[1] + b[1] * 86 * s];
    return limb([k, kn, ft], 30 * s, PANTS) + '<path d="M' + f(ft[0] + 8 * s) + ' ' + f(ft[1] - 6 * s) + ' l-34 ' + f(0) + ' q-6 12 4 14 l30 0 z" fill="' + INK + '" transform="rotate(' + f(o.kneel && i === 0 ? 0 : 0) + ')"/>'; }
  function arm(i) { var sp = [sh[0] + (i ? 4 : -4) * s, sh[1] + 6 * s], tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 10 * s, sp[1] + 130 * s], el = ik(sp, tg, 72 * s, 68 * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, hd2 = [el[0] + dx / dl * Math.min(dl, 68 * s), el[1] + dy / dl * Math.min(dl, 68 * s)];
    return limb([sp, el, hd2], 22 * s, o.shirt || SHIRT_V) + C(hd2[0], hd2[1], 11 * s, SKIN, 2); }
  out.far = arm(1) + leg(1);
  var tor = limb([hip, sh], 62 * s, o.shirt || SHIRT_V);
  if (o.belly) { var bc = [hip[0] + up[0] * 52 * s + fw[0] * 30 * s, hip[1] + up[1] * 52 * s + fw[1] * 30 * s]; tor += '<ellipse cx="' + f(bc[0]) + '" cy="' + f(bc[1]) + '" rx="' + f(36 * s) + '" ry="' + f(42 * s) + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  var neck = limb([sh, [hd[0] - up[0] * 20 * s, hd[1] - up[1] * 20 * s]], 22 * s, SKIN);
  var r = 33 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<circle r="' + f(r) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-r * .05) + ' ' + f(-r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(r * .98) + ' ' + f(r * .2) + ' L' + f(r * .55) + ' ' + f(r * .1) + ' Q' + f(r * .2) + ' ' + f(-r * .55) + ' ' + f(-r * .62) + ' ' + f(-r * .55) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-r * .96) + ' ' + f(-r * .08) + ' l' + f(-r * .22) + ' ' + f(r * .26) + ' l' + f(r * .24) + ' ' + f(r * .04) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<circle cx="' + f(r * .22) + '" cy="' + f(r * .12) + '" r="' + f(r * .15) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.mouth ? '<ellipse cx="' + f(-r * .84) + '" cy="' + f(r * .45) + '" rx="' + f(r * .12) + '" ry="' + f(r * .1 + r * .1 * o.mouth) + '" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up;
  out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(150, 20), rel(144, 24)];
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 10 + 26 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
// a beat 0..1 repeating n times over dur seconds starting at u0: 0 rest, peaks at mid-beat
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }
function chips(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 44) + '" cy="' + y + '" r="17" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 44, y + 7, 18, c ? "#fff" : INK); } return s; }
// victim leaning forward and the rescuer at his side (back blows); hit 0..1 = the hand coming down
function backBlows(t, hit, opt) {
  opt = opt || {}; var v = fig({ x: 300, y: 520, lean: 52, shirt: SHIRT_V, hands: THROAT, bend: [-1, -1], tilt: -10, legs: [[14, -6], [-6, 6]] });
  var back = v.at(112, -30), lift = (1 - hit) * 80, hand = [back[0] + 14 + lift * .5, back[1] - 18 - lift];
  var r = fig({ x: 470, y: 520, lean: 14, shirt: SHIRT_R, hair: "#5a4636", hands: [hand, v.at(105, 34)], bend: [-1, 1], legs: [[10, -4], [-8, 4]] });
  return (opt.noFloor ? "" : floor(700)) + r.far + whole(v) + r.body + r.near;
}
// the rescuer behind, arms round the victim's waist; th 0..1 = the thrust (in and up)
function thrustPair(t, th, opt) {
  opt = opt || {}; var v = fig({ x: 290, y: 520, lean: 14, shirt: opt.shirt || SHIRT_V, hands: THROAT, bend: [-1, -1], belly: opt.belly, tilt: -8, mouth: opt.mouth });
  var spot = opt.chest ? v.at(112, 34) : v.at(62, 34), fist = [spot[0] + 10 + th * 8, spot[1] + 6 - th * 10];
  var r = fig({ x: 400, y: 525, lean: 18, shirt: SHIRT_R, hair: opt.oldHair || "#5a4636", hands: [fist, [fist[0] + 6, fist[1] + 4]], bend: [1, 1], legs: [[16, -8], [-6, 4]] });
  var fistD = '<rect x="' + f(fist[0] - 15) + '" y="' + f(fist[1] - 14) + '" width="30" height="28" rx="9" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  return (opt.noFloor ? "" : floor(700)) + r.far + r.body + whole(v) + r.near + fistD;
}
// a plastic bottle with a cork; sq 0..1 = squeezed, pop 0..1 = cork flight
function bottle(x, y, sq, pop, t) {
  var w = 70 - 26 * sq, s = "";
  s += P("M" + (x - 26) + " " + (y - 190) + " L" + (x - 26) + " " + (y - 160) + " C" + (x - 70) + " " + (y - 140) + " " + (x - 70) + " " + (y - 110) + " " + (x - 70) + " " + (y - 90) + " C" + (x - w) + " " + (y - 40) + " " + (x - w) + " " + (y + 20) + " " + (x - 70) + " " + (y + 80) + " L" + (x - 70) + " " + (y + 140) + " Q" + x + " " + (y + 156) + " " + (x + 70) + " " + (y + 140) + " L" + (x + 70) + " " + (y + 80) + " C" + (x + w) + " " + (y + 20) + " " + (x + w) + " " + (y - 40) + " " + (x + 70) + " " + (y - 90) + " C" + (x + 70) + " " + (y - 110) + " " + (x + 70) + " " + (y - 140) + " " + (x + 26) + " " + (y - 160) + " L" + (x + 26) + " " + (y - 190) + " Z", "#d9e4e4", 2.6);
  s += '<path d="M' + (x - 40) + ' ' + (y - 120) + ' Q' + (x - 50) + ' ' + (y - 40) + ' ' + (x - 44) + ' ' + (y + 100) + '" stroke="#fff" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>';
  s += R(x - 72, y - 30, 144, 60, "#c9b98f", 2) + T("هوا", x, y + 10, 26, BLUE, 800);
  var cy = y - 196 - pop * 230, rot = pop * 200;
  s += G("translate(" + x + " " + f(cy) + ") rotate(" + f(rot) + ")", '<path d="M-22 -26 L22 -26 L18 14 L-18 14 Z" fill="#b8865a" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-8" cy="-10" r="2.5" fill="' + WOOD_D + '"/><circle cx="7" cy="0" r="2" fill="' + WOOD_D + '"/>');
  if (pop > .05 && pop < 1) for (var i = 0; i < 3; i++) s += '<path d="M' + (x - 30 + i * 30) + ' ' + f(cy + 50) + ' v40" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - pop) + '"/>';
  return s;
}
// a hand squeezing from the side (a mitten shape)
function mitt(x, y, dir, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + dir + " 1)", '<path d="M0 -40 C-30 -40 -40 -10 -40 0 C-40 20 -30 40 0 40 L60 34 L60 -34 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-36 -14 h26 M-38 4 h26 M-34 20 h24" stroke="' + INK + '" stroke-width="1.6"/>' + R(60, -36, 50, 72, col || SHIRT_R, 2)); }
// a side cut of the chest: lungs over the diaphragm dome, the windpipe up to the throat; up 0..1 pushes the dome up
function chestCut(t, up, fly) {
  var s = "", dy = -46 * up;
  s += P("M120 120 C120 60 180 40 240 40 L400 40 C470 40 520 80 520 140 L520 760 L120 760 Z", SKIN, 2.6) + '<path d="M120 120 C120 60 180 40 240 40 L400 40 C470 40 520 80 520 140 L520 760 L120 760 Z" fill="url(#hatch)" opacity=".15"/>';
  // windpipe up to the top
  s += R(300, -60, 40, 230, AIRC, 2.4); for (var y = -40; y < 160; y += 26) s += P("M300 " + y + " Q320 " + (y + 8) + " 340 " + y, "none", 4, ' stroke="' + BONE + '"');
  // lungs (squeezed a little by the dome)
  var lh = 260 - 30 * up;
  s += P("M296 170 C240 160 180 200 168 300 C160 " + f(360 + lh * .3) + " 170 " + f(170 + lh + 40) + " 210 " + f(170 + lh + 50 + dy * .3) + " C250 " + f(170 + lh + 40 + dy) + " 290 " + f(170 + lh + 30 + dy) + " 300 " + f(170 + lh + 10 + dy) + " Z", "#d98c84", 2.4);
  s += P("M344 170 C400 160 460 200 472 300 C480 " + f(360 + lh * .3) + " 470 " + f(170 + lh + 40) + " 430 " + f(170 + lh + 50 + dy * .3) + " C390 " + f(170 + lh + 40 + dy) + " 350 " + f(170 + lh + 30 + dy) + " 340 " + f(170 + lh + 10 + dy) + " Z", "#d98c84", 2.4);
  s += '<path d="M320 170 L320 200 M320 200 L270 250 M320 200 L370 250 M270 250 L240 300 M370 250 L400 300" stroke="#9c5a52" stroke-width="3" fill="none" stroke-linecap="round"/>';
  // diaphragm dome
  s += P("M120 " + f(500 + dy * .4) + " C200 " + f(420 + dy) + " 440 " + f(420 + dy) + " 520 " + f(500 + dy * .4), "none", 10, ' stroke="' + OLIVE + '" stroke-linecap="round"') + P("M120 " + f(500 + dy * .4) + " C200 " + f(420 + dy) + " 440 " + f(420 + dy) + " 520 " + f(500 + dy * .4), "none", 1.4);
  // the stomach area under it
  s += P("M220 560 C260 540 380 540 420 580 C430 640 380 680 300 670 C240 664 210 620 220 560 Z", "#d3a98d", 2);
  // the food pushed up and out of the windpipe
  var fy = lerp(20, -260, fly);
  if (fly < 1) s += C(320, fy, 18, FOOD, 2.2);
  return s;
}
function phone(x, y, typed, k) {
  var s = R(x - 80, y - 150, 160, 300, "#3a342c", 2.6, 22) + R(x - 66, y - 128, 132, 230, "#e9ecea", 1.6, 6);
  s += N(typed, x, y - 70, 46, INK);
  var keys = ["1", "2", "3"]; keys.forEach(function (q, i) { s += '<circle cx="' + (x - 40 + i * 40) + '" cy="' + (y + 10) + '" r="15" fill="' + (typed.length > i ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(q, x - 40 + i * 40, y + 16, 16, typed.length > i ? "#fff" : INK); });
  s += '<circle cx="' + x + '" cy="' + (y + 64) + '" r="18" fill="#6a8a4a" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 8) + ' ' + (y + 58) + ' q2 12 14 14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return s;
}
function glass(x, y, tilt, lvl) {
  return G("rotate(" + f(tilt) + " " + x + " " + y + ")", P("M" + (x - 50) + " " + (y - 120) + " L" + (x - 40) + " " + (y + 40) + " L" + (x + 40) + " " + (y + 40) + " L" + (x + 50) + " " + (y - 120) + " Z", "#eef2f0", 2.4) +
    P("M" + (x - 46) + " " + f(y - 120 + 160 * (1 - lvl)) + " L" + (x - 40) + " " + (y + 40) + " L" + (x + 40) + " " + (y + 40) + " L" + (x + 46) + " " + f(y - 120 + 160 * (1 - lvl)) + " Z", "#9fbccb", 1.6));
}
// a stopwatch face counting down from 4:00 (k 0..1 = time used)
function stopwatch(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 14, y - r - 26, 28, 18, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 10, "none", 1.2);
  for (var i = 0; i < 4; i++) { var b = -Math.PI / 2 + i * Math.PI / 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 22)) + ' ' + f(y + Math.sin(b) * (r - 22)) + ' L' + f(x + Math.cos(b) * (r - 10)) + ' ' + f(y + Math.sin(b) * (r - 10)) + '" stroke="' + INK + '" stroke-width="4"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 12) + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}
function brainIcon(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#9aa86e") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «طب ليه الأكل بيقف في الزور؟»: the throat cut, the bite stuck, a question mark
shot(4, push(300, 420, 1.08, 1.0), function (u, d, t) {
  return paper() + throat(t, { food: [292 + 2 * Math.sin(t * 9), 506], ep: .1 }) + G("", T("؟", 520, 560, 150, ORANGE, 800), at(u, .3, .3)) + label(300, 520, 150, 640, "اللقمة", ORANGE, at(u, .4, .4), 24);
});
// 5 · two pipes: food behind (olive), air in front to the lungs (blue)
shot(5, push(320, 470, 0.98, 1.08), function (u, d, t) {
  var k1 = at(u, .9, .5), k2 = at(u, 2.2, .5), fk = ((u * .32) % 1);
  return paper() + throat(t, { hl: k2 > 0 ? (u % 2 < 2 ? "air" : "food") : "food", air: k2, food: k1 > 0 ? along(FOOD_OK, fk) : null, ep: k1 > 0 ? clamp(Math.sin(fk * Math.PI) * 2.2 - .4) : 0 }) +
    label(360, 640, 540, 600, "الأكل", OLIVE, k1, 28) + label(290, 660, 120, 700, "الهوا", BLUE, k2, 28) + arrow(290, 700, 290, 770, BLUE, 5, at(u, 2.6, .4)) + G("", T("للرئة", 200, 770, 22, BLUE, 700), at(u, 2.8, .3));
});
// 6 · swallowing: the epiglottis folds back over the windpipe while the bite goes by, then stands up again
shot(6, push(310, 420, 1.15, 1.25), function (u, d, t) {
  var cyc = (u * .42) % 1, fk = clamp(cyc * 1.25), ep = clamp(Math.sin(clamp((fk - .2) / .6) * Math.PI) * 1.6);
  return paper() + throat(t, { hl: "ep", food: along(FOOD_OK, fk), ep: ep, air: 1 - ep }) + label(300, 440, 240, 600, "لسان المزمار", OLIVE, at(u, .6, .5), 26) +
    G("", tag(ep > .5 ? "مقفول" : "مفتوح", 470, 300, 1, 26, ep > .5 ? OLIVE : BLUE), at(u, 1.4, .3));
}, { tr: "in" });
// 7 · laughing while swallowing: the flap stays up, the bite drops into the windpipe
shot(7, push(300, 440, 1.2, 1.1), function (u, d, t) {
  var fk = at(u, 1.6, 1.8), stuck = fk >= 1;
  return paper() + throat(t, { food: along(FOOD_BAD, fk), ep: 0, air: stuck ? 0 : .8 }) + iconBox(520, 110, 130, '<circle r="40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-22 6 Q0 34 22 6 Z" fill="' + INK + '"/><path d="M-20 -12 q8 -8 16 0 M4 -12 q8 -8 16 0" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("ها ها", 0, -48, 18, ORANGE, 800), at(u, .2, .3)) +
    cross(290, 560, .9, at(u, 3.5, .4)) + tag("غلط", 150, 620, at(u, 3.8, .3), 30, ORANGE);
}, { tr: "out" });
// 8 · coughing or not? two people side by side
shot(8, push(320, 440, 1.1, 1.16), function (u, d, t) {
  var a = fig({ x: 170, y: 520, lean: 12 + 6 * Math.abs(Math.sin(t * 6)), shirt: SHIRT_V, hands: [rel(150, 26), null], bend: [-1, -1], s: .82, mouth: 1 });
  var b = fig({ x: 470, y: 520, lean: 4, shirt: "#8f7f9a", hands: THROAT, bend: [-1, -1], s: .82 });
  var cough = ""; for (var i = 0; i < 3; i++) { var p = (t * 1.6 + i / 3) % 1; cough += '<path d="M' + f(a.hd[0] - 40 - p * 60) + ' ' + f(a.hd[1] + 10 - 20 + i * 20) + ' h-' + f(18 * (1 - p)) + '" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; }
  return paper() + floor(670) + whole(a) + cough + whole(b) + '<path d="M320 120 V680" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>' + G("", T("كح… كح", 140, 180, 30, BLUE, 800), at(u, .3, .3)) + G("", T("؟", 470, 180, 90, ORANGE, 800), at(u, .6, .3));
});
// 9 · if he coughs: let him. The cough pushes the bite back up
shot(9, push(340, 430, 1.12, 1.04), function (u, d, t) {
  var a = fig({ x: 300, y: 540, lean: 22 + 8 * Math.abs(Math.sin(t * 5)), shirt: SHIRT_V, hands: [rel(150, 30), null], bend: [-1, -1], mouth: 1 });
  var cough = ""; for (var i = 0; i < 4; i++) { var p = (t * 1.4 + i / 4) % 1; cough += '<path d="M' + f(a.hd[0] - 46 - p * 90) + ' ' + f(a.hd[1] + 12 - 30 + i * 20) + ' h-' + f(24 * (1 - p)) + '" stroke="' + BLUE + '" stroke-width="6" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; }
  var bk = (u * .5) % 1;
  return paper() + floor(720) + whole(a) + cough + inset(500, 190, 130, G("translate(-300 -500) scale(1)", throat(t, { food: along([[290, 560], [292, 480], [320, 380], [250, 320], [140, 330]], bk), ep: 0, air: 1, hl: "air" })), at(u, .6, .3)) +
    check(150, 160, 1.4, at(u, 1.4, .5), BLUE) + tag("سيبه يكح", 170, 260, at(u, 1.8, .3), 28, BLUE);
});
// 10 · can't cough or speak: call 123 and start now
shot(10, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var k = at(u, 2.0, 1.4), typed = "123".slice(0, Math.floor(k * 3.99)), ring = Math.sin(t * 20) * (k >= 1 ? 3 : 0);
  return paper() + G("rotate(" + f(-6 + ring) + " 420 420)", phone(420, 420, typed, k)) + G("translate(-40 0)", whole(fig({ x: 200, y: 560, lean: 6, shirt: "#8f7f9a", hands: THROAT, bend: [-1, -1], s: .78 }))) +
    tag("الإسعاف", 420, 150, at(u, 1.6, .3), 30, ORANGE) + G("", cross(160, 150, .9, at(u, .5, .4)) + T("مفيش كحة", 160, 230, 24, ORANGE, 800), at(u, .3, .3));
});
// 11 · five hard blows between the shoulder blades, the victim leaning forward
hud(11, 12, function (u, t) { var b = beat(u, 1.2, LN[11].end - LN[11].start - 1.2, 5); return chips(5, b.i, 320, 60); });
shot(11, push(370, 450, 1.3, 1.4), function (u, d, t) {
  var b = beat(u, 1.2, LN[11].end - LN[11].start - 1.2, 5), hk = b.k, v = fig({ x: 300, y: 520, lean: 52 });
  var bk = v.at(112, -30);
  return paper() + backBlows(t, hk) + impact(bk[0] + 6, bk[1] - 14, b.p > .5 && b.p < 1 ? (b.p - .5) * 2 : 0) + label(bk[0] + 4, bk[1] + 4, 420, 300, "بين لوحين الكتف", OLIVE, at(u, .6, .5), 20);
});
// 12 · thrusts set-up: a front view of the belly, the fist above the navel and below the ribs
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, 1.6, .6), br = 1 + .012 * Math.sin(t * 2.4);
  s += G("translate(320 400) scale(" + f(br) + ") translate(-320 -400)", P("M150 40 C150 20 490 20 490 40 L520 300 C540 420 520 560 500 800 L140 800 C120 560 100 420 120 300 Z", SKIN, 2.6) +
    P("M180 60 C230 200 300 260 320 280 C340 260 410 200 460 60", "none", 3, ' stroke-dasharray="none"') + '<path d="M320 40 V280" stroke="' + SKIN2 + '" stroke-width="3"/>' +
    [0, 1, 2, 3].map(function (i) { return '<path d="M' + (200 + i * 10) + ' ' + (80 + i * 40) + ' Q260 ' + (110 + i * 40) + ' 310 ' + (100 + i * 40) + ' M' + (440 - i * 10) + ' ' + (80 + i * 40) + ' Q380 ' + (110 + i * 40) + ' 330 ' + (100 + i * 40) + '" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none"/>'; }).join("") +
    '<ellipse cx="320" cy="520" rx="9" ry="12" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="2"/>');
  s += label(250, 220, 120, 160, "الضلوع", OLIVE, at(u, .4, .5), 24) + label(330, 520, 480, 620, "السرة", OLIVE, at(u, .9, .5), 24);
  var fy = lerp(700, 410, k);
  s += G("translate(320 " + f(fy) + ")", '<rect x="-56" y="-44" width="112" height="88" rx="30" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M-30 -44 V-10 M0 -44 V-8 M30 -44 V-10" stroke="' + INK + '" stroke-width="1.8"/><path d="M-56 10 C-30 0 0 10 20 26" stroke="' + INK + '" stroke-width="2" fill="none"/>' + R(-40, 44, 80, 200, SHIRT_R, 2.4), clamp(k * 3));
  s += measure(560, 300, 560, 520, at(u, 2.3, .6), "") + G("", T("هنا", 600, 418, 26, ORANGE, 800), at(u, 2.6, .3));
  return s;
});
// 13 · grab the fist and pull in and up, fast, five times
hud(13, 14, function (u, t) { var b = beat(u, .8, LN[13].end - LN[13].start - .8, 5); return chips(5, b.i, 320, 60); });
shot(13, push(340, 460, 1.42, 1.32), function (u, d, t) {
  var b = beat(u, .8, LN[13].end - LN[13].start - .8, 5);
  return paper() + thrustPair(t, b.k) + arrow(260, 480, 220, 440, ORANGE, 6, at(u, .6, .3)) + G("", T("لجوه ولفوق", 200, 560, 26, ORANGE, 800), at(u, .9, .3));
}, { tr: "out" });
// 14 · why it works: the dome is pushed up, the lungs squeeze, the air shoots the bite out
shot(14, push(320, 380, 0.95, 1.02), function (u, d, t) {
  var k = at(u, 1.6, .4) * (1 - at(u, 2.6, .8)), fly = at(u, 2.0, 1.0);
  return paper() + chestCut(t, k, fly) + arrow(320, 640, 320, 520, ORANGE, 8, at(u, 1.4, .3)) + G("", T("قبضتك", 400, 700, 24, ORANGE, 800), at(u, 1.4, .3)) +
    label(470, 470 - 30 * k, 580, 560, "الحجاب الحاجز", OLIVE, at(u, .4, .5), 22) + G("", '<path d="M320 160 V-100" stroke="' + BLUE + '" stroke-width="6" stroke-dasharray="4 14" stroke-dashoffset="' + f(t * 80) + '" stroke-linecap="round"/>', fly);
});
// 15 · like a corked bottle: squeeze it and the cork flies
shot(15, push(320, 360, 1.0, 0.94), function (u, d, t) {
  var sq = at(u, .6, .5), pop = at(u, 1.1, 1.2);
  return paper() + bottle(320, 460, sq, pop, t) + mitt(320 - 70 + 26 * sq - 40, 470, 1) + mitt(320 + 70 - 26 * sq + 40, 470, -1) + label(330, 260 - pop * 230, 470, 140, "الفلينة", OLIVE, at(u, .3, .4), 24) +
    iconBox(110, 110, 150, G("scale(.3) translate(-320 -380)", chestCut(t, sq, pop)), at(u, .2, .3));
});
// 16 · keep alternating: five and five round a loop
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var on = Math.floor(u * 1.2) % 2, s = paper();
  s += '<circle cx="320" cy="400" r="210" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="10 9"/>';
  s += arrow(470, 250, 530, 330, ORANGE, 6, 1) + arrow(170, 550, 110, 470, ORANGE, 6, 1);
  s += G("translate(320 200) scale(.55) translate(-380 -460)", backBlows(t, on === 0 ? Math.abs(Math.sin(t * 6)) : 0, { noFloor: 1 }), on === 0 ? 1 : .35);
  s += G("translate(320 610) scale(.55) translate(-345 -470)", thrustPair(t, on === 1 ? Math.abs(Math.sin(t * 6)) : 0, { noFloor: 1 }), on === 1 ? 1 : .35);
  s += numBox("×5", 120, 190, at(u, .3, .3), 30, true) + numBox("×5", 520, 610, at(u, .6, .3), 30, true) + T("ضهر", 120, 250, 24, INK, 800) + T("بطن", 520, 670, 24, INK, 800);
  return s;
});
// 17 · pregnant or heavy: press on the middle of the chest instead
shot(17, push(330, 460, 1.4, 1.3), function (u, d, t) {
  var b = beat(u, 1.4, 2, 2);
  return paper() + thrustPair(t, b.k, { belly: true, chest: true, shirt: "#a38aa0" }) + label(250, 400, 310, 250, "نص الصدر", ORANGE, at(u, 1.0, .5), 26) + cross(205, 470, .7, at(u, 1.8, .4));
});
// 18 · a baby under one: face down along your forearm, head lower than the body, blows between the shoulders; then two fingers on the chest
shot(18, push(380, 470, 1.25, 1.33), function (u, d, t) {
  var half = (LN[18].end - LN[18].start) * .55, s = paper(), b = beat(u, .8, half - .8, 5), lift = (1 - b.k) * 70;
  s += R(330, 560, 420, 80, PANTS, 2.4, 30);   // your thigh under the arm
  s += limb([[760, 470], [560, 520]], 50, SHIRT_R) + limb([[560, 520], [250, 572]], 40, SKIN);   // sleeve, forearm toward the head
  s += '<path d="M262 556 q-40 -10 -52 14 q10 18 50 12 z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>';   // hand cupping the jaw
  // the baby on top: a onesie body, legs either side of the arm, head lower and face down
  s += limb([[470, 520], [500, 560], [486, 600]], 22, "#a9c0cc") + limb([[310, 540], [300, 590]], 16, SKIN);
  s += G("rotate(9 380 520)", '<ellipse cx="390" cy="512" rx="98" ry="44" fill="#a9c0cc" stroke="' + INK + '" stroke-width="2.4"/><path d="M330 480 Q390 470 450 486" stroke="#8aa3b1" stroke-width="2" fill="none"/>');
  s += C(262, 540, 42, SKIN, 2.4) + '<path d="M232 512 A42 42 0 0 1 300 530 Q270 514 238 526 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M236 572 q6 6 14 4" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  s += limb([[480, 512], [520, 540]], 22, "#a9c0cc");
  // your other hand: the heel of it comes down between the shoulder blades
  if (u < half + .3) s += G("", limb([[560, 220], [372, 452 - lift]], 34, SKIN) + '<ellipse cx="' + 360 + '" cy="' + f(462 - lift) + '" rx="34" ry="20" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' + limb([[640, 160], [560, 220]], 46, SHIRT_R), 1 - at(u, half, .3)) + impact(350, 478, b.p > .5 ? (b.p - .5) * 2 : 0);
  s += label(420, 562, 470, 680, "دراعك", OLIVE, at(u, .4, .5), 24) + label(250, 560, 300, 680, "الراس لتحت", INK, at(u, .9, .5), 22);
  var c = at(u, half, .4); if (c > 0) s += inset(420, 290, 115, '<path d="M-140 10 Q0 -10 140 10 V140 H-140 Z" fill="#a9c0cc" stroke="' + INK + '" stroke-width="2"/><path d="M-30 30 v40 M30 30 v40" stroke="' + INK + '" stroke-width="1.4" opacity=".5"/>' + G("translate(0 " + f(-8 - 12 * Math.abs(Math.sin(t * 6))) + ")", '<path d="M-24 -120 v104 a12 12 0 0 0 24 0 v-104 M2 -120 v110 a12 12 0 0 0 24 0 v-110" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>') + arrow(60, -60, 60, -10, ORANGE, 5, 1) + T("صباعين", 0, 100, 26, ORANGE, 800), c);
  return s;
});
// 19 · unconscious: on the floor, face up, chest compressions until the ambulance arrives
shot(19, push(380, 520, 1.25, 1.18), function (u, d, t) {
  var pump = Math.abs(Math.sin(t * 5.6)), s = paper() + floor(640);
  var r = fig({ x: 420, y: 556 - 8 * pump, lean: 40 + 4 * pump, shirt: SHIRT_R, hair: "#5a4636", hands: [[318, 592 - 10 * pump], [326, 590 - 10 * pump]], bend: [1, 1], legs: [[0, -90], [-4, -86]] });
  s += r.far + r.body;
  s += G("translate(440 609) scale(-1 1) rotate(90)", whole(fig({ x: 0, y: 0, lean: 0, shirt: SHIRT_V, legs: [[0, 0], [0, 0]], hands: [rel(40, -6), rel(40, -6)] })));
  s += r.near + '<rect x="300" y="' + f(574 - 10 * pump) + '" width="40" height="24" rx="8" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += label(318, 600, 340, 420, "إنعاش القلب", ORANGE, at(u, .6, .5), 24) + iconBox(540, 260, 120, '<rect x="-50" y="-20" width="100" height="50" rx="6" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -6 h12 v8 h8 v12 h-8 v8 h-12 v-8 h-8 v-12 h8 z" fill="' + ORANGE + '"/><circle cx="-28" cy="32" r="9" fill="' + INK + '"/><circle cx="28" cy="32" r="9" fill="' + INK + '"/>' + T("123", 0, -34, 20, ORANGE, 800), at(u, 1.4, .3));
  return s;
}, { tr: "out" });
// 20 · the myth: a glass of water to wash it down — no
shot(20, push(320, 400, 1.08, 0.98), function (u, d, t) {
  var tilt = -20 * at(u, .4, .8) + 3 * Math.sin(t * 2);
  return paper() + glass(330, 420, tilt, .72) + wave(260, 330, 400, 330, t, BLUE, 4, 30, at(u, .4, .4), 2.4) + cross(330, 380, 2.2, at(u, d - 1.2, .5)) + tag("مية؟", 330, 160, at(u, .2, .3), 34, BLUE);
});
// 21 · water won't pass and may fill the gap; a finger pushes the bite deeper
shot(21, push(300, 420, 1.12, 1.06), function (u, d, t) {
  var half = (LN[21].end - LN[21].start) * .42, fk = at(u, half + .3, 1.0), food = [292 + 0 * fk, lerp(496, 560, fk)];
  var wk = clamp(u / 1.2), water = '<path d="M150 318 C220 300 300 300 312 340 C320 380 300 430 292 470" stroke="#7fa7bd" stroke-width="' + f(10 * wk) + '" fill="none" stroke-linecap="round" opacity=".8"/>' + (wk > .8 ? '<ellipse cx="292" cy="472" rx="22" ry="8" fill="#7fa7bd" stroke="' + INK + '" stroke-width="1.4"/>' : "");
  var fx = lerp(-60, 210, at(u, half, .8)), finger = u > half - .2 ? '<path d="M-200 300 L' + f(fx) + ' 320 a14 14 0 0 1 0 28 L-200 352 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' : "";
  return paper() + throat(t, { food: food, ep: 0, water: u < half + .4 ? water : "", finger: finger }) + cross(190, 560, .9, at(u, 1.1, .4)) + (u > half ? arrow(330, 520, 330, 600, ORANGE, 5, fk) + cross(80, 250, 1, at(u, half + 1.4, .4)) : "");
});
// 22 · «يعني من الآخر»: the decision in one picture
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var s = paper(), c = window.CHUNKS[22], D = LN[22].end - LN[22].start, k2 = at(u, D * (c[1] || .3), .4), k3 = at(u, D * (c[2] || .55), .4), k4 = at(u, D * (c[3] || .75), .4);
  s += G("", tag("بيكح؟", 320, 120, 1, 40, INK), at(u, .2, .3));
  s += draw("M320 150 L170 260", at(u, .5, .4), INK, 3) + draw("M320 150 L470 260", k2, INK, 3);
  s += G("", T("آه", 220, 210, 24, BLUE, 800) + tag("سيبه", 160, 300, 1, 32, BLUE) + check(160, 380, 1.2, at(u, .9, .4), BLUE), at(u, .7, .3));
  s += G("", T("لأ", 420, 210, 24, ORANGE, 800), k2);
  s += G("translate(480 360) scale(.32) translate(-330 -420)", backBlows(t, Math.abs(Math.sin(t * 6)), { noFloor: 1 }), k3) + numBox("×5", 600, 330, k3, 24, true);
  s += G("translate(480 600) scale(.32) translate(-330 -420)", thrustPair(t, Math.abs(Math.sin(t * 6 + 1)), { noFloor: 1 }), k4) + numBox("×5", 600, 570, k4, 24, true);
  s += draw("M380 400 C330 450 330 520 380 560", k4, ORANGE, 4) + arrow(372, 552, 386, 566, ORANGE, 4, k4);
  return s;
}, { tr: "out" });
// 23 · the odd fact: Heimlich used his own move for the first time at 96 (2016)
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var b = beat(u, 2.0, 2.2, 3);
  return paper() + G("translate(-60 40)", thrustPair(t, b.k, { oldHair: "#d8d4cc", shirt: "#9a8a7a" })) + bigNum(count(96, at(u, .8, 1.4)), "سنة", 510, 230, at(u, .6, .3), ORANGE, 96) + tag("2016", 510, 380, at(u, 1.8, .3), 28) +
    label(380, 270, 470, 470, "هايمليك نفسه", OLIVE, at(u, 1.2, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: at a table, a man grabs his throat with both hands. line 1: no voice, no cough, no breath. line 2: the stopwatch from 4:00
  var s = '<path d="M-20 600 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 600, 660, 80, "#e3d7bd", 0);
  s += R(20, 400, 240, 18, "#a9784d", 2.2) + R(40, 418, 14, 182, WOOD_D, 2) + R(226, 418, 14, 182, WOOD_D, 2);
  s += '<ellipse cx="140" cy="394" rx="70" ry="10" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><ellipse cx="140" cy="390" rx="34" ry="6" fill="#c38a54" stroke="' + INK + '" stroke-width="1.4"/>';
  var shake = 3 * Math.sin(t * 14), m = fig({ x: 370 + shake, y: 420, lean: 6, shirt: SHIRT_V, hands: THROAT, bend: [-1, -1], legs: [[80, -80], [76, -76]], tilt: -14 });
  s += m.far + m.body + m.near + R(330, 420, 110, 14, "#a9784d", 2) + R(420, 434, 12, 166, WOOD_D, 2);
  if (li >= 1) { var u = t - LN[1].start;
    s += G("", '<path d="M220 150 h120 a18 18 0 0 1 18 18 v50 a18 18 0 0 1 -18 18 h-70 l-24 22 v-22 h-26 a18 18 0 0 1 -18 -18 v-50 a18 18 0 0 1 18 -18 z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/>' + T("…", 280, 210, 40, INK, 800), ease(u / .3)) + cross(280, 192, .9, ease((u - .6) / .4));
  }
  if (li >= 2) { var v = t - LN[2].start; s += iconBox(520, 160, 170, stopwatch(0, 6, 58, v / 240), ease(v / .4)) + G("", N(Math.floor((240 - Math.ceil(v)) / 60) + ":" + ("0" + (240 - Math.ceil(v)) % 60).slice(-2), 520, 290, 40, ORANGE), ease((v - .2) / .3)) + G("", brainIcon(520, 380, .9) + T("O₂", 580, 350, 26, BLUE, 800), ease((v - 1.2) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  // a tiny throat: the bite bobbing at the top of the windpipe
  return G("translate(10 0) scale(.36) translate(0 -20)", throat(t, { food: [292 + 3 * Math.sin(t * 6), 500 + 6 * Math.sin(t * 3)], ep: 0 }));
};
SCENE.outro = function (svg, u, t) {
  var b = Math.abs(Math.sin(t * 4));
  return G("translate(10 0) scale(.38)", thrustPair(t, b, { noFloor: 1 })) + G("translate(250 0) scale(.38)", backBlows(t, Math.abs(Math.sin(t * 4 + 1)), { noFloor: 1 })) + G("translate(520 140) scale(.4)", phone(0, 0, "123", 1)) +
    callout("1", 92, 70, ease(u / .3)) + callout("2", 380, 120, ease(u / .3 - .5)) + callout("3", 110, 190, ease(u / .3 - 1)) + callout("4", 560, 50, ease(u / .3 - 1.5));
};
