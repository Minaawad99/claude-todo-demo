window.CHUNKS = [[0.0], [0.0, 0.36, 0.64], [0.0, 0.4194], [0.0], [0.0, 0.5217], [0.0, 0.3966, 0.6552], [0.0, 0.4333], [0.0, 0.2, 0.6615], [0.0], [0.0, 0.0964, 0.6145], [0.0, 0.6167], [0.0, 0.1324, 0.7206], [0.0, 0.2093], [0.0, 0.4048, 0.7976], [0.0, 0.5778], [0.0, 0.5667], [0.0, 0.5873], [0.0, 0.6757], [0.0, 0.338, 0.7183], [0.0, 0.5], [0.0, 0.2692, 0.5256], [0.0, 0.4902], [0.0, 0.3846, 0.7308], [0.0, 0.1765, 0.4353, 0.6471], [0.0, 0.4839, 0.8065], [0.0], [0.0]];
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

// Helpers shared with «الكلب بتاعك بيشوفك إزاي؟» (copied from videos/dog-vision/sketch/shots.js, its drawing part):
// the room, the owner, the dog/cat-eye filter, the split view, scent, the eye cut, cone curves, brains, pools…
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
    P("M-156 -64 C-158 -122 -70 -140 0 -140 C70 -140 158 -122 156 -64 C156 -14 130 18 86 26 C54 32 30 50 0 84 C-30 50 -54 32 -86 26 C-130 18 -156 -14 -156 -64 Z", DNOSE, 3) +
    '<path d="M0 0 V84" stroke="#0d0a08" stroke-width="5"/><path d="M-120 20 C-90 8 -40 10 -14 30 M120 20 C90 8 40 10 14 30" stroke="#4a4038" stroke-width="3" fill="none"/>' +
    [-1, 1].map(function (sd) { var fl = 1 + .12 * Math.sin(t * 14) * (o.sniff || 0);
      return G("translate(" + (sd * 84) + " -52) scale(" + f(sd * fl) + " " + f(fl) + ")", '<path d="M-30 -8 C-34 -36 0 -46 18 -32 C32 -20 30 0 22 10 C34 14 50 18 66 30 C46 30 28 26 12 22 C-10 22 -28 10 -30 -8 Z" fill="#0d0a08" stroke="#6b6158" stroke-width="2"/>'); }).join("") +
    '<path d="M-110 -100 C-70 -116 -40 -118 -20 -116" stroke="#6b6158" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>');
  // the leather's pebbled texture
  for (var i = 0; i < 90; i++) { var a = hash(i) * 6.28, r = 10 + hash(i + 7) * 130; s += '<circle cx="' + f(x + Math.cos(a) * r * sc) + '" cy="' + f(y - 60 * sc + Math.sin(a) * r * .55 * sc) + '" r="' + f(3 * sc) + '" fill="none" stroke="#4a4038" stroke-width="' + f(1.4 * sc) + '" opacity=".6"/>'; }
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


// ── the cat: a short-haired brown tabby («قطة بلدي») from real proportions and photos (refs/SOURCES.md) ──
// Front view sitting (catFront) and profile sitting (catSide). Units: the sitting height to the top of the head ≈ 250 at s = 1.
// Head about as wide as the shoulders, wide cheeks, big upright ears set wide, large almond eyes with a vertical slit pupil
// (o.pupil: 0 = a thin slit, 1 = round and wide open), a small triangular nose, a split upper lip, whisker pads and long
// whiskers, the tabby «M» on the forehead, stripes on the cheeks, legs and tail.
var TAB = "#a8957a", TAB_D = "#5e4e3c", TAB_L = "#e6dccb", TAB_M = "#8a7860", CNOSE = "#c98a7e", CEAR = "#d9a18f", IRIS = "#c4b23e", IRIS_D = "#8f8a2c", GLOW = "#d9f59a";
function cpath(pts, close) { return smooth(pts, close); }
// one cat eye in the front view: almond outline, iris, a pupil from slit to round, a highlight; glow makes it shine (eyeshine)
function catEye(x, y, rx, ry, pupil, open, glow, look) {
  open = open == null ? 1 : open; var s = "", h = ry * open, lk = look || [0, 0];
  if (open < .08) return '<path d="M' + f(x - rx) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + ry * .35) + ' ' + f(x + rx) + ' ' + f(y) + '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  var id = "ce" + (++CLIPN), eye = 'M' + f(x - rx) + ' ' + f(y) + ' Q' + f(x - rx * .7) + ' ' + f(y - h * 1.25) + ' ' + f(x) + ' ' + f(y - h) + ' Q' + f(x + rx * .8) + ' ' + f(y - h * 1.1) + ' ' + f(x + rx) + ' ' + f(y - h * .1) + ' Q' + f(x + rx * .75) + ' ' + f(y + h * 1.1) + ' ' + f(x) + ' ' + f(y + h) + ' Q' + f(x - rx * .8) + ' ' + f(y + h * 1.05) + ' ' + f(x - rx) + ' ' + f(y) + ' Z';
  s += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath>';
  s += '<path d="' + eye + '" fill="' + (glow ? GLOW : IRIS) + '"/>';
  s += '<g clip-path="url(#' + id + ')">';
  if (!glow) s += '<ellipse cx="' + f(x) + '" cy="' + f(y + ry * .55) + '" rx="' + f(rx * 1.1) + '" ry="' + f(ry * .7) + '" fill="' + IRIS_D + '" opacity=".35"/>';
  var pw = lerp(.1, .86, clamp(pupil)) * rx, px = x + lk[0] * rx * .2, py = y + lk[1] * ry * .2;
  s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(pw) + '" ry="' + f(ry * .98) + '" fill="' + (glow ? "#7fbf5a" : "#14110d") + '"/>';
  if (!glow) s += '<circle cx="' + f(px + rx * .28) + '" cy="' + f(py - ry * .38) + '" r="' + f(rx * .16) + '" fill="#fff"/>';
  s += '</g><path d="' + eye + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  if (glow) s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx * 1.9) + '" ry="' + f(ry * 1.9) + '" fill="' + GLOW + '" opacity="' + f(.22 * glow) + '"/>';
  return s;
}
// o: {x, y (ground), s, pupil, eyes (open 0..1), glow (0..1), look [dx,dy], tilt (deg), ears (deg, + turns them out/back),
//     whisk (0..1 whiskers swept forward), tail (deg), breath}
function catFront(o) {
  o = o || {}; var s = o.s || 1, t = window.__t || 0, br = 1 + .012 * Math.sin(t * 2.1) * (o.breath == null ? 1 : o.breath);
  function W(p) { return [o.x + p[0] * s, o.y + p[1] * s]; }
  function Wl(a) { return a.map(W); }
  var g = "";
  // tail curling round the front paws
  var tw = (o.tail || 0) + 6 * Math.sin(t * 1.3);
  var tp = [[58, -14], [92, -6], [100, -22], [86, -34]].map(function (p) { return rotP(p, [58, -14], -tw * .3); });
  var tb = tube(Wl(tp.concat([[66, -30]])), [16, 15, 13, 11, 7].map(function (v) { return v * s; }));
  // body: a pear from the neck to the haunches, sitting
  var body = [[-30, -150], [-46, -118], [-58, -80], [-66, -44], [-62, -12], [-46, 0], [46, 0], [62, -12], [66, -44], [58, -80], [46, -118], [30, -150]];
  var bp = Wl(body.map(function (p) { return [p[0] * br, p[1]]; }));
  g += '<path d="' + cpath(bp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '" stroke-linejoin="round"/>';
  var bid = "cb" + (++CLIPN); g += '<clipPath id="' + bid + '"><path d="' + cpath(bp, true) + '"/></clipPath><g clip-path="url(#' + bid + ')">';
  [[-60, -100], [-64, -70], [-66, -40], [60, -100], [64, -70], [66, -40]].forEach(function (p, i) { var sd = p[0] < 0 ? -1 : 1; g += '<path d="' + cpath(Wl([[p[0] - sd * 6, p[1]], [p[0] + sd * -22, p[1] + 6], [p[0] + sd * -34, p[1] + 16]]), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(5 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '<path d="' + cpath(Wl([[-26, -150], [-34, -110], [-28, -70], [0, -56], [28, -70], [34, -110], [26, -150]]), true) + '" fill="' + TAB_L + '"/>';   // pale chest
  g += '<path d="' + cpath(Wl([[-64, -48], [-52, -70], [-40, -40], [-44, 0]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/><path d="' + cpath(Wl([[64, -48], [52, -70], [40, -40], [44, 0]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/></g>';
  // front legs and paws
  [-1, 1].forEach(function (sd) {
    var lg = tube(Wl([[sd * 15, -104], [sd * 17, -60], [sd * 18, -12]]), [24, 19, 17].map(function (v) { return v * s; }));
    g += '<path d="' + lg.fill + '" fill="' + TAB_L + '"/><path d="' + lg.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
    for (var k = 0; k < 3; k++) { var y = -76 + k * 18; g += '<path d="' + cpath(Wl([[sd * 7, y], [sd * 17, y + 3], [sd * 27, y]]), false) + '" stroke="' + TAB_M + '" stroke-width="' + f(3.4 * s) + '" fill="none" stroke-linecap="round"/>'; }
    var pw = W([sd * 18, -5]);
    g += '<ellipse cx="' + f(pw[0]) + '" cy="' + f(pw[1]) + '" rx="' + f(14 * s) + '" ry="' + f(8 * s) + '" fill="' + TAB_L + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/><path d="M' + f(pw[0] - 4 * s) + ' ' + f(pw[1] + 2 * s) + ' v' + f(5 * s) + ' M' + f(pw[0] + 4 * s) + ' ' + f(pw[1] + 2 * s) + ' v' + f(5 * s) + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  });
  g += '<path d="' + tb.fill + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var k = 0; k < 3; k++) { var q = W(tp[Math.min(3, k + 1)]); g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(4 * s) + '" fill="' + TAB_D + '" opacity=".75"/>'; }
  // head, turning a little; ears; face
  var hc = [0, -186], tl = (o.tilt || 0) + 2 * Math.sin(t * .8), H = function (p) { return W(rotP([p[0] * 1.14, p[1] * 1.14 + hc[1] + 4], [0, hc[1] + 30], tl)); };
  var ear = function (sd) {
    var e = (o.ears || 0) * sd, base0 = [sd * 14, -36], base1 = [sd * 50, -14], tip = [sd * 44, -70];
    var pts = [base0, [sd * 22, -52], tip, [sd * 52, -40], base1].map(function (p) { return rotP(p, [sd * 32, -24], e); });
    var inn = [[sd * 22, -34], [sd * 28, -48], [sd * 42, -60], [sd * 46, -38], [sd * 44, -22]].map(function (p) { return rotP(p, [sd * 32, -24], e); });
    return '<path d="' + cpath(pts.map(H), true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '" stroke-linejoin="round"/>' +
      (Math.abs(e) < 50 ? '<path d="' + cpath(inn.map(H), true) + '" fill="' + CEAR + '" opacity="' + f(1 - Math.abs(e) / 60) + '"/>' : "");
  };
  g += ear(-1) + ear(1);
  var head = [[0, -40], [24, -37], [44, -24], [54, 0], [56, 16], [48, 28], [30, 38], [0, 42], [-30, 38], [-48, 28], [-56, 16], [-54, 0], [-44, -24], [-24, -37]];
  var hp = head.map(H), hid = "ch" + (++CLIPN);
  g += '<path d="' + cpath(hp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.6 * s) + '"/>';
  g += '<clipPath id="' + hid + '"><path d="' + cpath(hp, true) + '"/></clipPath><g clip-path="url(#' + hid + ')">';
  g += '<path d="' + cpath([[-30, 14], [-18, 6], [0, 8], [18, 6], [30, 14], [30, 34], [0, 46], [-30, 34]].map(H), true) + '" fill="' + TAB_L + '"/>';   // pale muzzle
  // the tabby M on the forehead and the cheek stripes
  g += '<path d="' + cpath([[-16, -14], [-14, -32], [-6, -20], [0, -34], [6, -20], [14, -32], [16, -14]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3.2 * s) + '" fill="none" stroke-linejoin="round"/>';
  [[-1], [1]].forEach(function (q) { var sd = q[0]; g += '<path d="' + cpath([[sd * 30, 4], [sd * 42, 8], [sd * 56, 6]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" fill="none" stroke-linecap="round"/><path d="' + cpath([[sd * 32, 14], [sd * 44, 20], [sd * 56, 20]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" fill="none" stroke-linecap="round"/>';
    g += '<path d="' + cpath([[sd * 30, -6], [sd * 38, -14], [sd * 44, -24]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(2.4 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '</g>';
  // eyes
  var eo = o.eyes == null ? 1 : o.eyes, er = H([-21, -4]), el = H([21, -4]);
  g += catEye(er[0], er[1], 14 * s, 11 * s, o.pupil == null ? .35 : o.pupil, eo, o.glow, o.look) + catEye(el[0], el[1], 14 * s, 11 * s, o.pupil == null ? .35 : o.pupil, eo, o.glow, o.look);
  // nose, mouth, whisker pads, whiskers
  var n = [[-6, 12], [6, 12], [0, 19]].map(H);
  g += '<path d="M' + n.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + CNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" stroke-linejoin="round"/>';
  g += '<path d="' + cpath([[0, 19], [0, 25]].map(H), false) + ' M' + cpath([[-10, 28], [-5, 27], [0, 25]].map(H), false).slice(1) + ' M' + cpath([[0, 25], [5, 27], [10, 28]].map(H), false).slice(1) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none" stroke-linecap="round"/>';
  [[-1], [1]].forEach(function (q) { var sd = q[0];
    [[-10, 20], [-6, 23], [-12, 26]].forEach(function (p) { var c = H([sd * -p[0], p[1]]); g += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(1.2 * s) + '" fill="' + TAB_D + '"/>'; });
    var wk = o.whisk || 0;
    [[18, -10], [22, 0], [20, 10]].forEach(function (a, i) { var r0 = H([sd * 14, 20 + i * 3]), ang = (sd > 0 ? 0 : 180) + sd * (a[1] - wk * 40), L = (78 - i * 6) * s, rad = (ang + tl) * Math.PI / 180;
      var e1 = [r0[0] + Math.cos(rad) * L, r0[1] + Math.sin(rad) * L], m = [r0[0] + Math.cos(rad) * L * .5, r0[1] + Math.sin(rad) * L * .5 - 4 * s];
      g += '<path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e1[0]) + ' ' + f(e1[1]) + '" stroke="' + (o.whiskCol || "#f6f1e6") + '" stroke-width="' + f(2.6 * s) + '" fill="none" stroke-linecap="round"/><path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e1[0]) + ' ' + f(e1[1]) + '" stroke="' + INK + '" stroke-width="' + f(.8 * s) + '" fill="none" opacity=".5"/>'; });
  });
  return { svg: g, eyes: [er, el], nose: H([0, 15]), head: H([0, 0]) };
}
// the cat sitting in profile, facing right in its own coordinates (dir -1 mirrors it). o.ears: deg the near ear turns back
// (toward the viewer's left when facing right); o.head: deg (+ down); o.look; o.rub (0..1 head pushed forward and down)
function catSide(o) {
  o = o || {}; var s = o.s || 1, dir = o.dir || 1, t = window.__t || 0;
  function W(p) { return [o.x + dir * p[0] * s, o.y + p[1] * s]; }
  function Wl(a) { return a.map(W); }
  var g = "", tw = (o.tail || 0) + 8 * Math.sin(t * 1.4);
  // tail along the ground behind, tip lifting and twitching
  var tp = [[-50, -10], [-80, -4], [-110, -6], [-130, -16], [-136, -32]].map(function (p) { return rotP(p, [-50, -10], -tw * .25); });
  var tb = tube(Wl(tp), [16, 14, 13, 11, 8].map(function (v) { return v * s; }));
  g += '<path d="' + tb.fill + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var k = 1; k < 5; k++) { var q = W(tp[k]); g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(4.5 * s) + '" fill="' + TAB_D + '" opacity=".7"/>'; }
  // body: haunch round at the back, chest upright in front
  var body = [[30, -150], [10, -146], [-20, -130], [-46, -100], [-62, -60], [-62, -24], [-50, 0], [40, 0], [44, -40], [40, -90], [44, -130]];
  var bp = Wl(body), bid = "cs" + (++CLIPN);
  g += '<path d="' + cpath(bp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  g += '<clipPath id="' + bid + '"><path d="' + cpath(bp, true) + '"/></clipPath><g clip-path="url(#' + bid + ')">';
  [[-10, -138], [-30, -118], [-46, -92], [-56, -64]].forEach(function (p) { g += '<path d="' + cpath(Wl([[p[0], p[1]], [p[0] + 14, p[1] + 18], [p[0] + 20, p[1] + 38]]), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(5 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '<path d="' + cpath(Wl([[30, -140], [46, -120], [44, -80], [40, -50], [26, -70], [24, -120]]), true) + '" fill="' + TAB_L + '"/>';
  g += '<path d="' + cpath(Wl([[-60, -40], [-40, -70], [-10, -46], [-6, -4]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/></g>';
  // front legs
  [[22, TAB_M], [34, TAB_L]].forEach(function (L, i) { var lg = tube(Wl([[L[0], -100], [L[0] + 2, -50], [L[0] + 3, -8]]), [20, 15, 13].map(function (v) { return v * s; }));
    g += '<path d="' + lg.fill + '" fill="' + (i ? TAB_L : TAB) + '"/><path d="' + lg.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>'; var pw = W([L[0] + 8, -5]);
    g += '<ellipse cx="' + f(pw[0]) + '" cy="' + f(pw[1]) + '" rx="' + f(14 * s) + '" ry="' + f(6.5 * s) + '" fill="' + (i ? TAB_L : TAB) + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>'; });
  // head on top, facing right; turns about the neck
  var rub = o.rub || 0, hd = (o.head || 0) + rub * 30, piv = [30, -146], H = function (p) { return W(rotP([piv[0] + (p[0] - piv[0]) * 1.32 - 6 + rub * 14, piv[1] + (p[1] - piv[1]) * 1.32 + 16 + rub * 6], piv, hd)); };
  var head = [[6, -150], [10, -176], [26, -192], [48, -194], [66, -182], [74, -168], [80, -160], [78, -152], [70, -146], [64, -140], [44, -132], [22, -134]];
  var ear = function (back, far) { var e = far ? 0 : (o.ears || 0), c = [32, -188];
    var pts = [[22, -186], [24, -212], [44, -196]].map(function (p) { return rotP(p, c, -e); });
    if (far) pts = [[34, -190], [44, -214], [54, -192]];
    return '<path d="M' + pts.map(H).map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + (far ? TAB_D : TAB) + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>' +
      (!far && e < 50 ? '<path d="M' + [[27, -188], [28, -206], [40, -194]].map(function (p) { return rotP(p, c, -e); }).map(H).map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + CEAR + '" opacity="' + f(1 - e / 60) + '"/>' : ""); };
  g += ear(0, 1);
  var hp = head.map(H);
  g += '<path d="' + cpath(hp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  g += '<path d="' + cpath([[58, -150], [70, -146], [78, -152], [70, -140], [58, -138]].map(H), true) + '" fill="' + TAB_L + '"/>';
  [[20, -180, 30, -168], [16, -168, 28, -160], [36, -192, 40, -180]].forEach(function (a) { g += '<path d="' + cpath([[a[0], a[1]], [a[2], a[3]]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" stroke-linecap="round"/>'; });
  g += ear(0, 0);
  // eye (profile: a wedge), nose, mouth, whiskers
  var ec = H([60, -170]), eo = o.eyes == null ? 1 : o.eyes, ang = dir * hd;
  g += G("translate(" + f(ec[0]) + " " + f(ec[1]) + ") rotate(" + f(ang) + ") scale(" + dir + " 1)", eo > .1 ?
    '<path d="M-8 0 Q0 ' + f(-7 * s * eo) + ' 8 -1 Q2 ' + f(6 * s * eo) + ' -8 0 Z" fill="' + IRIS + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '"/><ellipse cx="2" cy="-1" rx="' + f(1.4 * s) + '" ry="' + f(4 * s * eo) + '" fill="#14110d"/>' :
    '<path d="M-8 0 Q0 3 8 -1" stroke="' + INK + '" stroke-width="2" fill="none"/>');
  var np = H([79, -158]);
  g += '<circle cx="' + f(np[0]) + '" cy="' + f(np[1]) + '" r="' + f(3.2 * s) + '" fill="' + CNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  g += '<path d="' + cpath([[76, -150], [70, -146], [64, -147]].map(H), false) + '" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>';
  var wk = o.whisk || 0;
  [-14, -4, 6].forEach(function (a) { var r0 = H([68, -152]), rad = (dir > 0 ? 0 : 180) * Math.PI / 180 + dir * (a - wk * 30 + hd) * Math.PI / 180, L = 64 * s;
    g += '<path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' l' + f(Math.cos(rad) * L) + ' ' + f(Math.sin(rad) * L) + '" stroke="#f6f1e6" stroke-width="' + f(2.4 * s) + '" stroke-linecap="round"/><path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' l' + f(Math.cos(rad) * L) + ' ' + f(Math.sin(rad) * L) + '" stroke="' + INK + '" stroke-width="' + f(.7 * s) + '" opacity=".5"/>'; });
  return { svg: g, ear: H([34, -200]), head: H([46, -164]), cheek: H([56, -148]), nose: np };
}

// ── «قطتك بتشوفك إزاي؟» — drawings. The cat in cat.js (a brown tabby, from photos, refs/SOURCES.md); the room, the owner,
// the eye cut, the split view and the eye filter come from common.js (shared with the dog episode). Shapes from real
// references: the slit pupil from a thin vertical line to a full circle (Banks et al. 2015: ~135× in area for the domestic cat,
// ~15× for us); the retina packed with rods; the tapetum lucidum, a mirror layer behind the retina that sends the light back
// for a second pass and makes the eyeshine; whiskers about as wide as the body, swept forward when something is close.

var NIGHT = "#1c1f26", NIGHT2 = "#262a33", BULB = "#f2d36b";
// the cat's view: blur and the dichromat matrix (cats, like dogs, see blue and yellow-green; red goes dull)
function catView(inner, b) { return dogView(inner, b || 6); }
// darkness over a scene: k 0..1
function dark(k, x, y, w, h) { return '<rect x="' + (x || -400) + '" y="' + (y || -400) + '" width="' + (w || 1440) + '" height="' + (h || 1600) + '" fill="#0b0c10" opacity="' + f(clamp(k) * .94) + '"/>'; }
// a big cat eye seen from the front, with the fur round it: the pupil from a slit (0) to round (1), shine
function bigCatEye(x, y, r, pupil, glow) {
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 1.7) + '" ry="' + f(r * 1.45) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="3"/>';
  for (var i = 0; i < 6; i++) { var a = -2.6 + i * .32; s += '<path d="M' + f(x + Math.cos(a) * r * 1.2) + ' ' + f(y + Math.sin(a) * r * 1.1) + ' L' + f(x + Math.cos(a) * r * 1.6) + ' ' + f(y + Math.sin(a) * r * 1.4) + '" stroke="' + TAB_D + '" stroke-width="6" stroke-linecap="round"/>'; }
  return s + catEye(x, y, r, r * .82, pupil, 1, glow);
}
// a human eye from the front: white, iris, a round pupil (p 0..1 small to big), lids and lashes
function humanEye(x, y, r, p) {
  var id = "he" + (++CLIPN), eye = 'M' + f(x - r * 1.5) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y - r * 1.25) + ' ' + f(x + r * 1.5) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + r * 1.1) + ' ' + f(x - r * 1.5) + ' ' + f(y) + ' Z';
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 2) + '" ry="' + f(r * 1.5) + '" fill="#e0a98a" stroke="' + INK + '" stroke-width="3"/>';
  s += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath><path d="' + eye + '" fill="#fbf8f1"/><g clip-path="url(#' + id + ')">' + C(x, y, r * .62, "#6b4a32", 1.6) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * lerp(.12, .44, clamp(p))) + '" fill="#14110d"/><circle cx="' + f(x + r * .2) + '" cy="' + f(y - r * .22) + '" r="' + f(r * .09) + '" fill="#fff"/></g>';
  return s + '<path d="' + eye + '" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(x - r * 1.3) + ' ' + f(y - r * .9) + ' Q' + f(x) + ' ' + f(y - r * 1.6) + ' ' + f(x + r * 1.3) + ' ' + f(y - r * .9) + '" stroke="#3a2c22" stroke-width="7" fill="none" stroke-linecap="round"/>';
}
// sun and moon chips
function sunIcon(x, y, r, t) { return sun(x, y, r, t); }
// a strip of retina seen from the side: rods (tall thin, blue) and cones (short, olive), a few light dots falling in
function retinaStrip(x, y, w, nRods, nCones, t, k) {
  var s = R(x, y, w, 120, "#f1e2d2", 2) + R(x, y + 120, w, 22, TAPETUM, 0);
  var n = nRods + nCones, i, kk = clamp(k == null ? 1 : k);
  for (i = 0; i < n; i++) { var cx = x + 10 + (i + .5) * (w - 20) / n, cone = nCones && (i % Math.round(n / nCones) === 0);
    s += cone ? P("M" + f(cx - 5) + " " + (y + 118) + " L" + f(cx - 5) + " " + (y + 70) + " L" + f(cx) + " " + (y + 52) + " L" + f(cx + 5) + " " + (y + 70) + " L" + f(cx + 5) + " " + (y + 118) + " Z", OLIVE, 1.4)
              : R(cx - 3, y + 16, 6, 102, BLUE, 1.2, 3); }
  for (i = 0; i < 8; i++) { var p = ((t * .6 + hash(i)) % 1), lx = x + 20 + hash(i + 4) * (w - 40); s += '<circle cx="' + f(lx) + '" cy="' + f(y - 60 + p * 170) + '" r="5" fill="' + BULB + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(kk * Math.sin(p * Math.PI)) + '"/>'; }
  return s;
}
// a light bulb, lit (k 0..1)
function bulb(x, y, sc, k) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", (k > 0 ? '<circle r="46" fill="' + BULB + '" opacity="' + f(.3 * k) + '"/>' : "") +
    '<path d="M-22 10 C-36 -6 -30 -36 0 -38 C30 -36 36 -6 22 10 L16 24 L-16 24 Z" fill="' + (k > 0 ? BULB : "#e8e2d2") + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(-15, 24, 30, 16, "#9a9a92", 2) + '<path d="M-8 6 L-4 -10 L0 4 L4 -10 L8 6" stroke="' + INK + '" stroke-width="1.6" fill="none"/>');
}
// a desk lamp in profile with a mirror behind the bulb (the analogy): rays out, and rays bounced back by the mirror
function lampMirror(x, y, t, k) {
  var s = R(x - 60, y + 120, 120, 16, "#8a7a62", 2) + P("M" + (x - 6) + " " + (y + 120) + " L" + (x - 6) + " " + (y + 20) + " L" + (x + 6) + " " + (y + 20) + " L" + (x + 6) + " " + (y + 120) + " Z", "#8a7a62", 2);
  s += P("M" + (x - 70) + " " + (y - 60) + " Q" + (x - 110) + " " + y + " " + (x - 70) + " " + (y + 60), "none", 9, ' stroke="#c9d6dc" stroke-linecap="round"') + P("M" + (x - 70) + " " + (y - 60) + " Q" + (x - 110) + " " + y + " " + (x - 70) + " " + (y + 60), "none", 2);
  s += bulb(x - 20, y, 1, 1);
  for (var i = 0; i < 5; i++) { var a = (-40 + i * 20) * Math.PI / 180, ph = (t * .8 + i * .2) % 1;
    s += '<path d="M' + f(x + 10 + Math.cos(a) * 40) + ' ' + f(y + Math.sin(a) * 40) + ' l' + f(Math.cos(a) * 160) + ' ' + f(Math.sin(a) * 160) + '" stroke="' + BULB + '" stroke-width="5" stroke-dasharray="14 12" stroke-dashoffset="' + f(-t * 50) + '" stroke-linecap="round"/>';
    if (k > 0) s += '<path d="M' + f(x - 50) + ' ' + f(y + (i - 2) * 22) + ' L' + f(x + 220) + ' ' + f(y + (i - 2) * 50) + '" stroke="#e8a63a" stroke-width="4" stroke-dasharray="10 14" stroke-dashoffset="' + f(-t * 50) + '" opacity="' + f(k * .8) + '"/>'; }
  return s;
}
// a torch in a hand, beam to the right
function torch(x, y, ang, k) {
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ")", (k > 0 ? '<path d="M40 -14 L560 -120 L560 120 L40 14 Z" fill="#fff6c8" opacity="' + f(.22 * k) + '"/>' : "") +
    R(-60, -14, 100, 28, "#3a3a40", 2, 6) + R(36, -20, 14, 40, "#5a5a62", 2, 3) + '<ellipse cx="-50" cy="0" rx="22" ry="20" fill="#e0a98a" stroke="' + INK + '" stroke-width="2"/>');
}
// sound rings travelling from a point
function rings(x, y, t, col, k, n) { var s = ""; for (var i = 0; i < (n || 3); i++) { var p = (t * .7 + i / (n || 3)) % 1; s += '<path d="M' + f(x + 14 + p * 70) + ' ' + f(y - 18 - p * 26) + ' Q' + f(x + 26 + p * 82) + ' ' + f(y) + ' ' + f(x + 14 + p * 70) + ' ' + f(y + 18 + p * 26) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f((1 - p) * clamp(k == null ? 1 : k)) + '"/>'; } return s; }
// a little toy mouse on the floor
function toyMouse(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-30 0 C-30 -26 20 -30 34 -4 L40 0 Z" fill="#9a9aa2" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-4" cy="-24" r="9" fill="#c8a0a0" stroke="' + INK + '" stroke-width="2"/><circle cx="24" cy="-10" r="2.5" fill="' + INK + '"/><path d="M-30 -2 C-60 -2 -60 20 -80 10" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'); }

// ══ shots (line numbers from script.txt) ══
var FL = 640;
// 3 · «ليه شايفاك مغبّش؟»: the cat looking up at a blurred owner
shot(3, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .3] }), c = catFront({ x: 170, y: FL + 6, s: 1.1, pupil: .3, look: [.6, -.8], tilt: -8 });
  return paper() + room(FL, { plantX: 600 }) + catView(o.svg, 6) + shadow(170, FL + 4, 90) + c.svg + G("", T("؟", 260, 200, 120, ORANGE, 800), at(u, .5, .3));
});
// 4 · an eye made for hunting, not for detail: about five times weaker than yours
shot(4, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k2 = at(u, d * .4, .8);
  var s = paper() + T("عينك", 320, 70, 30, INK, 800) + eyeCut(290, 220, 120, "human", t, { rays: at(u, .3, .8) }) + label(398, 220, 470, 330, "النقطة دي", ORANGE, at(u, 1.2, .5), 24);
  s += G("", T("عينها", 320, 420, 30, INK, 800) + eyeCut(290, 570, 120, "dog", t, { rays: k2 }) + label(300, 470, 470, 440, "معمولة للصيد", OLIVE, at(u, d * .5, .5), 22), k2 > 0 ? 1 : 0);
  return s + numBox("÷5", 120, 420, at(u, d * .75, .3), 30, true);
});
// 5 · anything closer than a quarter metre is a blur: the toy under her nose, out of focus
shot(5, push(320, 420, 1.05, 1.12), function (u, d, t) {
  var c = catFront({ x: 320, y: 920, s: 2.6, pupil: .4, look: [0, 1], tilt: 0 }), k = at(u, .5, .6);
  var toy = toyMouse(330 + 14 * Math.sin(t * 1.5), 650, 1.6);
  return paper() + c.svg + '<defs><filter id="nearb"><feGaussianBlur stdDeviation="' + f(lerp(0, 5, k)) + '"/></filter></defs><g filter="url(#nearb)">' + toy + '</g>' +
    measure(560, 230, 560, 640, at(u, 1.0, .7), "") + G("", T("25 سم", 560, 212, 26, ORANGE, 800), at(u, 1.6, .3)) + G("", T("؟", 420, 640, 60, ORANGE, 800), at(u, 2.0, .3));
});
// 6 · so she uses her whiskers: they sweep forward and touch what she can't see
shot(6, push(320, 470, 1.1, 1.04), function (u, d, t) {
  var w = at(u, .4, .8) * (.85 + .15 * Math.sin(t * 3)), c = catFront({ x: 320, y: 920, s: 2.6, pupil: .4, look: [0, 1], whisk: w, whiskCol: w > .3 ? "#f2c98a" : null });
  return paper() + c.svg + '<g filter="url(#nearb)">' + toyMouse(330, 650, 1.6) + '</g><defs><filter id="nearb"><feGaussianBlur stdDeviation="5"/></filter></defs>' +
    label(160, 470, 150, 610, "الشنبات", OLIVE, at(u, 1.0, .5), 26) + G("", cloud(330, 620, 40, t, "#f2c98a", 1, 2), w);
});
// 7 · colours: blue and yellow-green stay, red goes dull
shot(7, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var toys = [["#3e64b5", "أزرق"], ["#e2c23a", "أصفر"], ["#7fae3a", "أخضر"], [SHIRT, "أحمر"]], s = paper();
  s += T("إنت", 560, 150, 28, INK, 800, "end") + T("هي", 560, 450, 28, INK, 800, "end");
  for (var i = 0; i < 30; i++) { s += R(60 + i * 17, 330, 17.6, 26, spec(400 + i * 10), 0) + G("", R(60 + i * 17, 630, 17.6, 26, specDog(400 + i * 10), 0), at(u, .8 + i * .03, .2)); }
  s += R(60, 330, 510, 26, "none", 1.6) + R(60, 630, 510, 26, "none", 1.6);
  toys.forEach(function (q, i) { var x = 120 + i * 125, bob = 4 * Math.sin(t * 3 + i), k = at(u, .2 + i * .25, .3), kd = at(u, 1.2 + i * .3, .4);
    s += G("", C(x, 240 + bob, 42, q[0], 2.4) + '<path d="M' + (x - 26) + ' ' + f(226 + bob) + ' q12 -14 26 -12" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>' + T(q[1], x, 310, 20, INK, 700), k);
    s += G("", C(x, 540 - bob, 42, dvHex(q[0]), 2.4) + (i === 3 ? tag("باهت", x, 470, at(u, 2.6, .3), 22, ORANGE) : check(x, 470, .6, at(u, 2 + i * .3, .4), BLUE)), kd);
  });
  return s;
});
// 8 · «طب إزاي بتشوف في الضلمة؟»: the room goes dark, two eyes shine
shot(8, push(320, 420, 1.12, 1.0), function (u, d, t) {
  var c = catFront({ x: 320, y: FL + 6, s: 1.4, pupil: 1, glow: at(u, .25, .4) });
  return paper() + room(FL, { rugX: 320 }) + shadow(320, FL + 4, 110) + c.svg.replace(/x/, "x") + dark(at(u, 0, .4) * .9) + (at(u, .25, .4) > 0 ? catEye(c.eyes[0][0], c.eyes[0][1], 22, 17, 1, 1, at(u, .25, .4)) + catEye(c.eyes[1][0], c.eyes[1][1], 22, 17, 1, 1, at(u, .25, .4)) : "") +
    G("", T("؟", 470, 230, 120, ORANGE, 800), at(u, .8, .3));
}, { tr: "out" });
// 9 · secret one, the pupil: a thin line by day, a full circle by night
shot(9, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = clamp((Math.sin((u - 1.2) * 1.1) + 1) / 2), night = u > 1.2 ? k : 0, s = paper();
  s += G("", R(-400, -400, 1440, 1600, NIGHT, 0), night * .85);
  s += bigCatEye(320, 360, 120, night, 0);
  s += G("", sun(110, 120, 34, t), 1 - night) + G("", moon(530, 120, 34), night);
  s += G("", tag("بالنهار: خط", 160, 640, 1, 26, ORANGE), (1 - night) * at(u, .4, .3)) + G("", tag("بالليل: دايرة", 480, 640, 1, 26, BLUE), night);
  return s;
});
// 10 · her pupil grows about 135 times in area, yours about 15
shot(10, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var p = (Math.sin(t * 1.6) + 1) / 2, s = paper();
  s += bigCatEye(180, 280, 80, p, 0) + humanEye(470, 280, 62, p);
  s += G("", N(count(135, at(u, .5, 1.6)) + "×", 180, 520, 66, ORANGE), at(u, .4, .3)) + T("القطة", 180, 570, 24, INK, 700);
  s += G("", N("15×", 470, 520, 66, INK) + T("إنت", 470, 570, 24, INK, 700), at(u, d * .55, .3));
  return s;
});
// 11 · secret two: the retina is packed with cells that feel the faintest light — far more than yours
shot(11, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + T("عينك", 320, 90, 26, INK, 800) + retinaStrip(60, 120, 520, 14, 6, t, 1);
  s += G("", T("عينها", 320, 420, 26, INK, 800) + retinaStrip(60, 450, 520, 38, 3, t, 1), at(u, d * .35, .4));
  return s + label(84, 220, 40, 330, "خلايا الضلمة", BLUE, at(u, d * .55, .5), 24);
});
// 12 · secret three: a mirror behind the retina, the tapetum
shot(12, push(320, 380, 1.0, 1.1), function (u, d, t) {
  var s = paper() + eyeCut(300, 380, 210, "dog", t, { rays: at(u, .3, .8) });
  return s + label(470, 220, 400, 100, "التابيتوم", TAPETUM, at(u, .9, .6), 30) + label(452, 300, 560, 600, "الشبكية", ORANGE, at(u, 1.6, .5), 24) + G("", tag("مراية", 140, 120, 1, 30, BLUE), at(u, d * .6, .3));
}, { tr: "in" });
// 13 · the light the cells missed bounces back off the mirror for a second chance
shot(13, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + R(40, 140, 560, 180, "#f1e2d2", 2) + R(40, 320, 560, 40, TAPETUM, 2) + T("الشبكية", 320, 130, 22, ORANGE, 800) + T("المراية", 320, 400, 22, TAPETUM, 800);
  for (var i = 0; i < 10; i++) s += R(70 + i * 54, 170, 10, 140, BLUE, 1.2, 4);
  var cyc = (u * .5) % 1, x = 300, yIn = lerp(-20, 320, clamp(cyc * 2)), yBack = lerp(320, 200, clamp(cyc * 2 - 1));
  s += '<path d="M' + x + ' -20 L' + x + ' ' + f(cyc < .5 ? yIn : 320) + '" stroke="' + BULB + '" stroke-width="7" stroke-linecap="round"/>';
  if (cyc >= .5) s += '<path d="M' + x + ' 320 L' + f(x + 40) + ' ' + f(yBack) + '" stroke="#e8a63a" stroke-width="7" stroke-linecap="round"/>';
  if (cyc > .9) s += '<circle cx="' + (x + 40) + '" cy="200" r="22" fill="' + BULB + '" opacity=".7"/>';
  s += G("", tag("فرصة تانية", 470, 560, 1, 28, ORANGE), at(u, d * .5, .3)) + G("", N("1", 250, 260, 40, INK), cyc < .5 ? 1 : 0) + G("", N("2", 380, 250, 40, ORANGE), cyc >= .5 ? 1 : 0);
  return s;
});
// 14 · like a mirror behind a lamp: the room gets brighter
shot(14, push(300, 380, 1.25, 1.0), function (u, d, t) {
  return paper() + R(-400, -400, 1440, 1600, "#d9cfb8", 0) + G("", R(-400, -400, 1440, 1600, "#f6ecc8", 0), at(u, .3, 1.2) * .8) + lampMirror(260, 360, t, at(u, 1.0, .8)) + label(196, 310, 120, 160, "مراية", BLUE, at(u, .4, .5), 28);
});
// 15 · that is exactly why her eyes shine when you light them up in the dark
shot(15, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, .4), c = catFront({ x: 430, y: FL, s: 1.2, pupil: 1 });
  var s = R(-400, -400, 1440, 1600, NIGHT, 0) + R(-400, FL, 1440, 400, NIGHT2, 0) + '<g opacity="' + f(.15 + .25 * k) + '">' + c.svg + '</g>';
  s += catEye(c.eyes[0][0], c.eyes[0][1], 15.8, 12.4, 1, 1, k) + catEye(c.eyes[1][0], c.eyes[1][1], 15.8, 12.4, 1, 1, k);
  return s + torch(60, 330, 4 + 2 * Math.sin(t), k) + G("", tag("عينيها بتلمع", 300, 120, 1, 28, ORANGE), at(u, 1.4, .3));
});
// 16 · so she needs about a sixth of the light you need
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + T("إنت محتاج", 470, 120, 26, INK, 800) + T("هي محتاجة", 150, 120, 26, INK, 800);
  for (var i = 0; i < 6; i++) s += bulb(400 + (i % 3) * 70, 220 + Math.floor(i / 3) * 110, .9, at(u, .3 + i * .15, .2));
  s += G("", bulb(150, 270, 1.2, 1), at(u, 1.5, .3)) + G("", N("1/6", 150, 520, 80, ORANGE), at(u, d * .5, .3));
  return s;
});
// 17 · «طب بتعرفك إزاي؟»: the cat in front of the owner, a question mark
shot(17, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var o = owner(410, FL, 1.25, t, { mouth: "smile", look: [-.6, .5], tilt: -6 }), c = catFront({ x: 170, y: FL + 6, s: 1.15, pupil: .35, look: [.7, -.8], tilt: -10 });
  return paper() + room(FL) + o.svg + shadow(170, FL + 4, 90) + c.svg + G("", T("؟", 230, 170, 130, ORANGE, 800), at(u, .4, .3));
});
// 18 · the Japan study: strangers' voices, then the owner's — her ears turn to it
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var turn = at(u, d * .55, .5), c = catSide({ x: 420, y: 640, s: 1.4, dir: 1, ears: 70 * turn, head: -4 * turn }), s = paper() + R(-400, 640, 1440, 400, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  ["#b9b3a6", "#b9b3a6", ORANGE].forEach(function (col, i) { var y = 160 + i * 130, on = i < 2 ? at(u, .3 + i * .6, .3) * (1 - at(u, d * .5, .3)) : at(u, d * .5, .3);
    s += G("", backHead(70, y, .85).replace(/#2f2620/g, i < 2 ? "#6f6a62" : "#2f2620") + rings(110, y + 10, t, col, 1), .35 + .65 * on); });
  s += c.svg + G("", tag("صوت صاحبها", 150, 600, 1, 24, ORANGE), at(u, d * .55, .3)) + G("", tag("اليابان 2013", 470, 120, 1, 22), at(u, .3, .3));
  return s;
});
// 19 · she moves her ears and head toward you… but usually doesn't get up
shot(19, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var turn = clamp((Math.sin(t * 1.6) + 1) / 2), w = walker(120, FL, 1.05, 0, true, { still: true, mouth: "open" }), c = catSide({ x: 470, y: FL, s: 1.15, dir: 1, ears: 75 * turn, head: -6 * turn, eyes: blink(t, 2) });
  var s = paper() + room(FL, { plant: false, frameX: 300 }) + w.svg + rings(190, FL - 360, t, ORANGE, 1) + c.svg;
  return s + G("", tag("مبتقومش", 470, 260, 1, 30, ORANGE), at(u, d * .55, .3)) + label(c.ear[0], c.ear[1], c.ear[0] + 40, c.ear[1] - 90, "ودانها", OLIVE, at(u, .6, .5), 22);
});
// 20 · and by your smell: rubbing her head on you puts her scent on you
shot(20, push(330, 440, 1.0, 1.08), function (u, d, t) {
  var r = (Math.sin(t * 2.2) + 1) / 2, o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .6], tilt: -6 }), c = catSide({ x: 230, y: FL, s: 1.15, dir: 1, rub: r, eyes: .2 + .3 * r, tail: 30 });
  return paper() + room(FL) + o.svg + c.svg + cloud(c.cheek[0] + 30, c.cheek[1] + 10, 30, t, ORANGE, at(u, .6, .5)) + cloud(400, FL - 140, 40, t, ORANGE, at(u, d * .5, .6), 7) +
    G("", tag("إنت تبعها", 330, 150, 1, 30, ORANGE), at(u, d * .6, .3));
});
// 21 · the myth: cats see in pitch dark. No.
shot(21, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return R(-400, -400, 1440, 1600, "#07080a", 0) + G("", tag("ضلمة كحل", 320, 200, 1, 34), at(u, .3, .3)) + G("", N("0", 320, 420, 120, "#f6f1e6") + T("نور", 320, 480, 26, "#f6f1e6", 700), at(u, .6, .3)) + cross(320, 380, 3, at(u, d * .75, .5));
});
// 22 · with no light at all, she's just like you
shot(22, pan(260, 420, 380, 400, 1.1), function (u, d, t) {
  var c = catFront({ x: 200, y: FL + 6, s: 1.2, pupil: 1, eyes: blink(t) }), o = owner(450, FL, 1.2, t, { mouth: "neutral", look: [0, 0] });
  var bob = 18 * Math.sin(t * 2.4);
  return R(-400, -400, 1440, 1600, "#07080a", 0) + '<g opacity="' + f(.05 + .05 * Math.sin(t * 1.8)) + '">' + room(FL) + c.svg + o.svg + '</g>' + G("", tag("زيك بالظبط", 320, 150, 1, 30, ORANGE), at(u, d * .4, .3)) +
    G("", T("؟", 200, 380 + bob, 80, "#f6f1e6", 800) + T("؟", 450, 280 - bob, 80, "#f6f1e6", 800), at(u, .3, .3));
});
// 23 · the recap: a pupil that opens wide, lots of dark cells, a mirror behind the eye
shot(23, push(320, 400, 1.12, .98), function (u, d, t) {
  var s = paper(), ks = [at(u, .2, .4), at(u, d * .3, .4), at(u, d * .55, .4)];
  s += G("translate(" + f(8 * Math.sin(t * 1.7)) + " " + f(10 * Math.sin(t * 2.2)) + ")", G("", R(40, 60, 260, 220, "#f4ecdb", 2) + bigCatEye(170, 160, 42, (Math.sin(t * 2) + 1) / 2, 0) + T("البؤبؤ", 170, 320, 26, INK, 800), ks[0]));
  s += G("", R(340, 60, 260, 220, "#f4ecdb", 2) + G("translate(350 80) scale(.46)", retinaStrip(0, 120, 520, 30, 3, t, 1)) + T("خلايا الضلمة", 470, 320, 26, INK, 800), ks[1]);
  s += G("", R(140, 370, 360, 300, "#f4ecdb", 2) + G("translate(320 510) scale(.48) translate(-300 -380)", eyeCut(300, 380, 210, "dog", t, {})) + T("المراية", 320, 700, 28, TAPETUM, 800), ks[2]);
  return s;
});
// 24 · the oddest: blink slowly at her and she'll often blink back — the cat smile
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var cyc = (u * .32) % 1, you = cyc < .45 ? Math.max(.04, 1 - Math.sin(clamp(cyc / .45) * Math.PI)) : 1, her = cyc > .5 ? Math.max(.04, 1 - Math.sin(clamp((cyc - .5) / .45) * Math.PI)) : 1;
  var o = owner(170, 900, 1.7, t, { mouth: "smile", eyes: you, look: [.6, .3] });
  var c = catFront({ x: 470, y: 760, s: 1.6, pupil: .4, eyes: her, tilt: 6 });
  return paper() + '<clipPath id="oh"><rect x="-100" y="0" width="360" height="560"/></clipPath><g clip-path="url(#oh)">' + o.svg + '</g>' + c.svg +
    G("", tag("ابتسامة القطط", 320, 640, 1, 34, ORANGE), at(u, d * .6, .3)) + G("", T("ببطء…", 170, 100, 28, BLUE, 800), at(u, .4, .3));
});

// ══ the hook card art (608 × 660): line 0 the owner split between your eye and hers; line 1 the light goes out —
// you see nothing, she still sees you, her eyes shining ══
SCENE.intro = function (svg, t, li) {
  var fl = 600, u0 = t - LN[0].start, o = owner(304, fl, 1.18, t, { mouth: "smile" }), c = catFront({ x: 130, y: fl + 6, s: .95, pupil: li >= 1 ? 1 : .3, look: [.7, -.7], tilt: -8 });
  var base = room(fl, { plantX: 520, frameX: 150, rugX: 304 }) + o.svg, s;
  if (li === 0) { var w = lerp(620, 304, ease((u0 - .5) / 1.1)); s = split(w, base, catView(base, 6), 0, 660) + (u0 > .8 ? T("إنت", 150, 60, 30, INK, 800) + T("هي", 460, 60, 30, INK, 800) : "") + c.svg; }
  else {
    var u1 = t - LN[1].start, k = ease(u1 / .5);
    s = split(304, base + dark(k) + T("إنت", 150, 60, 30, "#f6f1e6", 800), '<g filter="url(#grey)">' + catView(base, 4) + '</g>' + dark(k * .55) + T("هي", 460, 60, 30, "#f6f1e6", 800), 0, 660) + dvDefs(4) + '<g opacity="' + f(1 - .85 * k) + '">' + c.svg + '</g>';
    if (k > .3) s += catEye(c.eyes[0][0], c.eyes[0][1], 13.3, 10.4, 1, 1, k) + catEye(c.eyes[1][0], c.eyes[1][1], 13.3, 10.4, 1, 1, k);
    s += G("translate(70 120)", R(-24, -36, 48, 72, "#efe6d0", 2, 6) + R(-8, -20, 16, 28, k > .5 ? "#6f6a62" : "#efe6d0", 1.6, 3) + '<circle cx="0" cy="' + (k > .5 ? 4 : -10) + '" r="7" fill="' + INK + '"/>', 1 - .5 * k);
  }
  return s;
};
// the bumper (180 × 200): a cat's face, the pupil opening and closing
SCENE.bumper = function (u, t) {
  var c = catFront({ x: 90, y: 262, s: .66, pupil: (Math.sin(t * 2.4) + 1) / 2 });
  return c.svg;
};
// the summary card art (600 × 280): the cat at night, eyes shining, with the three secrets numbered
SCENE.outro = function (svg, u, t) {
  var c = catFront({ x: 300, y: 290, s: 1.0, pupil: 1 });
  return '<rect width="600" height="280" fill="' + NIGHT + '"/><g opacity=".45">' + c.svg + '</g>' + catEye(c.eyes[0][0], c.eyes[0][1], 16, 12.5, 1, 1, 1) + catEye(c.eyes[1][0], c.eyes[1][1], 16, 12.5, 1, 1, 1) + moon(520, 60, 26) +
    callout("1", c.eyes[0][0] - 50, c.eyes[0][1] - 30, ease(u / .3)) + callout("2", c.eyes[1][0] + 50, c.eyes[1][1] - 30, ease(u / .3 - .5)) + callout("3", c.eyes[1][0] + 60, c.eyes[1][1] + 30, ease(u / .3 - 1)) + callout("4", 150, 200, ease(u / .3 - 1.5));
};

