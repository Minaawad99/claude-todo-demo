window.CHUNKS = [[0.0, 0.766], [0.0, 0.26, 0.7], [0.0], [0.0, 0.3559], [0.0, 0.4194], [0.0, 0.3117, 0.5065, 0.8701], [0.0], [0.0], [0.0, 0.3684, 0.5789], [0.0, 0.5172], [0.0], [0.0, 0.15, 0.35, 0.75], [0.0, 0.4471, 0.8], [0.0, 0.1707, 0.4146, 0.7195], [0.0], [0.0, 0.3962, 0.6321, 0.8491], [0.0, 0.1707, 0.4756], [0.0, 0.1212, 0.4343, 0.8485], [0.0, 0.596, 0.798], [0.0, 0.1566, 0.6145, 0.7711], [0.0, 0.3521, 0.7606], [0.0, 0.7143], [0.0, 0.25, 0.6667], [0.0, 0.375, 0.6667], [0.0], [0.0]];
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

var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", BONE = "#e6dcc4";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
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
function stopwatch(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 14, y - r - 26, 28, 18, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 10, "none", 1.2);
  for (var i = 0; i < 4; i++) { var b = -Math.PI / 2 + i * Math.PI / 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 22)) + ' ' + f(y + Math.sin(b) * (r - 22)) + ' L' + f(x + Math.cos(b) * (r - 10)) + ' ' + f(y + Math.sin(b) * (r - 10)) + '" stroke="' + INK + '" stroke-width="4"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 12) + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}


// ── «الموبايل اللي بيبات في الشاحن» — drawings in the «اسكتش» hand, to real sizes:
// phone 147 × 71.5 × 7.8 mm (a typical 6.1" phone), corner radius 9 mm, USB-C port 8.4 × 2.6 mm;
// pouch cell inside about 92 × 60 × 4.5 mm; 20 W USB-C wall charger, EU plug: body 44 × 38 × 28 mm, pins Ø4.8 × 19 mm, 19 mm apart;
// cell layers: aluminium foil + LiCoO2 cathode | separator | graphite anode + copper foil, in electrolyte.
// Bedroom: bed 2.0 m long, mattress top 0.55 m, nightstand 0.55 m; people with real proportions (H = 1.75 m).
var GLASSD = "#2f3a42", SCREEN = "#dfe6e4", FRAME = "#9aa2ac", POUCH = "#c9c2b0", BOARD = "#5e653a", CU = "#c07a4a", AL = "#b8bec4",
    GRAPH = "#4d4a44", CATH = "#7f97a6", ION = ORANGE, SHEET = "#e9e0c9", WOODN = "#a9784d", WOODN_D = "#7c5434", PILLOW = "#f1ebdc", BLANKET = "#9fb2a2";

// the phone from the front, centre (x, y), s units per mm. o: {pct, charging, dark, time, screen (svg in screen coords), tilt}
function phoneFront(x, y, s, o) {
  o = o || {}; var w = 71.5 * s, h = 147 * s, r = 9 * s, b = 2.2 * s, g = "";
  g += R(-w / 2, -h / 2, w, h, FRAME, 2.4, r) + R(-w / 2 + 1.2 * s, -h / 2 + 1.2 * s, w - 2.4 * s, h - 2.4 * s, GLASSD, 0, r - s);
  var sx = -w / 2 + b, sy = -h / 2 + b, sw = w - 2 * b, shh = h - 2 * b, id = "scr" + (++CLIPN);
  g += '<clipPath id="' + id + '"><rect x="' + f(sx) + '" y="' + f(sy) + '" width="' + f(sw) + '" height="' + f(shh) + '" rx="' + f(r - b) + '"/></clipPath>';
  g += '<g clip-path="url(#' + id + ')">' + R(sx, sy, sw, shh, o.dark ? "#26303a" : SCREEN, 0);
  if (o.pct != null) g += battIcon(0, -h * .05, s * 1.25, o.pct, o.charging, o.dark) + N(Math.round(o.pct) + "%", 0, h * .2, 15 * s, o.dark ? "#e9ecea" : INK);
  if (o.time) g += N(o.time, 0, -h * .3, 13 * s, o.dark ? "#e9ecea" : INK);
  if (o.screen) g += o.screen;
  g += '</g>' + C(0, -h / 2 + 9 * s, 2.6 * s, "#111", 0);   // front camera hole
  g += R(-w / 2 - 1.4 * s, -h * .22, 1.6 * s, 18 * s, FRAME, 1.2, 1) + R(w / 2 - .2 * s, -h * .26, 1.6 * s, 26 * s, FRAME, 1.2, 1);   // buttons
  return G("translate(" + f(x) + " " + f(y) + ")" + (o.tilt ? " rotate(" + o.tilt + ")" : ""), g);
}
// battery icon with a fill level, bolt when charging
function battIcon(x, y, s, pct, charging, dark) {
  var w = 30 * s, h = 14 * s, k = clamp(pct / 100), col = pct <= 20 ? ORANGE : pct > 80 ? ORANGE : OLIVE;
  if (pct > 20 && pct <= 80) col = OLIVE; if (pct > 80) col = BLUE;
  var g = R(-w / 2, -h / 2, w, h, "none", 1.6 * Math.min(1.5, s), 2.5 * s) + R(w / 2, -h * .2, 2.4 * s, h * .4, dark ? "#e9ecea" : INK, 0, 1) + R(-w / 2 + 2 * s, -h / 2 + 2 * s, (w - 4 * s) * k, h - 4 * s, col, 0, 1.5 * s);
  if (charging) g += '<path d="M' + f(2 * s) + ' ' + f(-h * .62) + ' L' + f(-5 * s) + ' ' + f(h * .08) + ' L' + f(0) + ' ' + f(h * .08) + ' L' + f(-2 * s) + ' ' + f(h * .62) + ' L' + f(5 * s) + ' ' + f(-h * .08) + ' L0 ' + f(-h * .08) + ' Z" fill="#f4d06a" stroke="' + INK + '" stroke-width="1.2"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", g.replace(/stroke="#2a2016"/g, dark ? 'stroke="#e9ecea"' : 'stroke="#2a2016"'));
}
// USB-C cable from the bottom of the phone at (x, y) along path d (already absolute); plug drawn at the phone end
function cable(d, col) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#f2efe8") + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
function plugC(x, y, s) { return R(x - 4.5 * s, y, 9 * s, 14 * s, "#f2efe8", 1.6, 2 * s) + R(x - 3 * s, y - 4 * s, 6 * s, 4.5 * s, FRAME, 1.2, 1); }
// 20 W wall charger in profile, pins to the left (into the wall at x), s units per mm
function charger(x, y, s, o) {
  o = o || {}; var g = R(0, -19 * s, 28 * s, 38 * s, o.cheap ? "#e4e0d6" : "#f6f3ec", 2.2, 4 * s) + R(-19 * s, -11.5 * s, 19 * s, 4.8 * s, AL, 1.4, 2) + R(-19 * s, 6.7 * s, 19 * s, 4.8 * s, AL, 1.4, 2);
  if (!o.cheap) g += T("20W", 14 * s, 3 * s, 6 * s, MUTE, 700);
  return G("translate(" + f(x) + " " + f(y) + ")", g);
}
// charger cut open: o.cheap → bare board, no fuse, no isolation; else transformer, fuse, protection chip
function chargerInside(x, y, s, cheap, k) {
  var g = R(0, 0, 120 * s, 90 * s, "#f6f3ec", 2.4, 8 * s) + R(10 * s, 60 * s, 100 * s, 10 * s, BOARD, 1.6, 2);
  if (!cheap) g += R(18 * s, 26 * s, 30 * s, 34 * s, "#d9b86a", 1.8, 3) + '<path d="M22 ' + 30 * s + ' h' + 22 * s + ' M22 ' + 36 * s + ' h' + 22 * s + ' M22 ' + 42 * s + ' h' + 22 * s + ' M22 ' + 48 * s + ' h' + 22 * s + '" stroke="' + CU + '" stroke-width="2" transform="translate(' + f(-22 + 18 * s) + ' 0)"/>' +
    R(56 * s, 44 * s, 14 * s, 16 * s, INK, 0, 2) + R(76 * s, 34 * s, 10 * s, 26 * s, "#4a6f8a", 1.6, 4 * s) + R(92 * s, 48 * s, 18 * s, 8 * s, "#d8ccae", 1.4, 3);
  else g += R(30 * s, 46 * s, 12 * s, 14 * s, "#3a352e", 1.4, 2) + R(60 * s, 40 * s, 8 * s, 20 * s, "#b9ab8a", 1.4, 3);
  return G("translate(" + f(x) + " " + f(y) + ")", g);
}
// Egyptian wall socket (Schuko, round recess) at (x, y) seen from the side as a plate on the wall
function socketSide(x, y, s) { return R(x - 10 * s, y - 40 * s, 10 * s, 80 * s, "#efe9dc", 2, 3); }

// ── the cell, cut open: cathode (left) | separator | anode graphite layers (right). k = state of charge 0..1.
// Ions sit in the cathode at k = 0 and between the graphite sheets at k = 1. o: {t, flow (show moving ions), sei (0..1 crust), trapped, voltage}
var CELL = { x: 70, y: 210, w: 500, h: 360 };
function cellCut(k, o) {
  o = o || {}; var X = CELL.x, Y = CELL.y, W = CELL.w, H = CELL.h, t = o.t || 0, s = "";
  s += R(X - 10, Y - 10, W + 20, H + 20, "#e6efe9", 2.4, 6);                         // electrolyte bath
  s += R(X, Y, 22, H, AL, 2) + R(X + W - 22, Y, 22, H, CU, 2);                         // current collectors
  s += R(X + 22, Y, 170, H, "#d7dde0", 1.6);                                            // cathode coating
  for (var i = 0; i < 40; i++) { var cx = X + 40 + (i % 5) * 34 + (Math.floor(i / 5) % 2) * 14, cy = Y + 22 + Math.floor(i / 5) * 44; s += C(cx, cy, 15, CATH, 1.4); }
  s += '<path d="M' + (X + W / 2) + ' ' + Y + ' V' + (Y + H) + '" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 7"/>';   // separator
  var ax = X + W - 22 - 170; s += R(ax, Y, 170, H, "#ece6d6", 1.6);                  // anode coating: graphite sheets
  var NS = 9; for (var j = 0; j <= NS; j++) { var gy = Y + 18 + j * (H - 36) / NS; s += '<path d="M' + (ax + 8) + ' ' + f(gy) + ' H' + (ax + 162) + '" stroke="' + GRAPH + '" stroke-width="5" stroke-linecap="round"/>'; }
  if (o.sei) { var sk = clamp(o.sei); s += R(ax - 4, Y + 4, 10 + 14 * sk, H - 8, "#8f8576", 1.2, 3) + '<rect x="' + (ax - 4) + '" y="' + (Y + 4) + '" width="' + f(10 + 14 * sk) + '" height="' + (H - 8) + '" fill="url(#hatch)" opacity=".6"/>'; }
  // ions: 54 of them; the first k·54 sit in the anode gaps, the rest in the cathode
  var n = 54, inA = Math.round(n * clamp(k)), trapped = o.trapped || 0;
  for (var q = 0; q < n; q++) {
    var ia = q < inA, row = q % NS, col = Math.floor(q / NS), px, py;
    if (ia) { px = ax + 20 + col * 26 + 3 * Math.sin(t * 3 + q); py = Y + 18 + (row + .5) * (H - 36) / NS; }
    else { var cq = q - inA; px = X + 50 + (cq % 5) * 30 + 2 * Math.sin(t * 2 + q); py = Y + 40 + Math.floor(cq / 5) * 32; if (py > Y + H - 20) py = Y + H - 20 - (cq % 3) * 10; }
    var dead = q >= n - trapped;
    if (dead) { px = ax + 4 + (q % 2) * 8; py = Y + 20 + (q % 13) * 25; }
    s += C(px, py, 7, dead ? "#8f8576" : ION, 1.4);
  }
  if (o.flow) for (var m = 0; m < 4; m++) { var p = ((t * .45 + m / 4) % 1), fy = Y + 70 + m * 70; s += C(lerp(X + 200, ax - 10, p), fy + 6 * Math.sin(p * 9), 7, ION, 1.4) + arrow(X + 205, fy - 22, ax - 18, fy - 22, ORANGE, 2.5, 1); }
  return s;
}
// voltage dial 3.0 … 4.2 V
function vdial(x, y, r, v, k) {
  var a0 = Math.PI * 1.15, a1 = Math.PI * 1.85, a = lerp(a0, a1, clamp((v - 3) / 1.2)), s = "";
  s += '<path d="M' + f(x + Math.cos(a0) * r) + ' ' + f(y + Math.sin(a0) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.cos(a1) * r) + ' ' + f(y + Math.sin(a1) * r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  var ar = lerp(a0, a1, .82); s += '<path d="M' + f(x + Math.cos(ar) * r) + ' ' + f(y + Math.sin(ar) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.cos(a1) * r) + ' ' + f(y + Math.sin(a1) * r) + '" fill="none" stroke="' + ORANGE + '" stroke-width="9"/>';
  s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
  s += N(v.toFixed(1) + " V", x, y + 42, 26, v > 4.1 ? ORANGE : INK);
  return G("", s, k);
}
// a suitcase, side view, lid bulging by b (0..1)
function suitcase(x, y, b) { var w = 130, h = 50, s = R(x, y - h, w, h, "#8a6a4a", 2.6, 10) + '<path d="M' + x + ' ' + (y - h) + ' Q' + (x + w / 2) + ' ' + f(y - h - 40 * b) + ' ' + (x + w) + ' ' + (y - h) + '" fill="#9b7a58" stroke="' + INK + '" stroke-width="2.6"/>' + R(x + 45, y - h - 12 - 14 * b, 40, 8, INK, 0, 4);
  s += '<path d="M' + (x + 6) + ' ' + (y - h + 4) + ' q8 -12 16 0 q8 -12 16 0" stroke="#c98a5a" stroke-width="4" fill="none"/>' + C(x + 18, y + 4, 5, INK, 0) + C(x + w - 18, y + 4, 5, INK, 0); return s; }

// ── bedroom, side view, eye level. Floor at y = 700. 1 m = 140 units.
var FL = 700, MM = 0.14;   // units per mm in the room
function bed(x) { var s = R(x, FL - 77, 280, 20, WOODN, 2.2) + R(x + 6, FL - 57, 10, 57, WOODN_D, 2) + R(x + 264, FL - 57, 10, 57, WOODN_D, 2) + R(x - 10, FL - 150, 20, 150, WOODN, 2.4, 4);
  return s + R(x, FL - 98, 280, 22, "#efe8d8", 2.2, 8); }
function nightstand(x) { return R(x, FL - 77, 66, 77, WOODN, 2.4) + R(x + 6, FL - 64, 54, 24, WOODN_D, 1.6) + C(x + 33, FL - 52, 3, INK, 0); }
// a person lying on the back, head to the left, hip at (hx, hy); s figure scale (H = 1.75 m = 245 units → s = .6125)
function sleeper(hx, hy, s, t) {
  var br = 1 + .02 * Math.sin(t * 1.4);
  return G("translate(" + f(hx) + " " + f(hy) + ") rotate(-90) scale(1 " + f(br) + ")", whole(fig({ x: 0, y: 0, s: s, lean: 0, hands: [rel(40, 30), rel(30, 26)], bend: [1, 1], legs: [[0, 0], [2, -2]], shirt: SHIRT_V })));
}
function blanket(x, y, w, t) { var d = "M" + x + " " + y + " Q" + (x + w * .3) + " " + f(y - 26 - 2 * Math.sin(t * 1.4)) + " " + (x + w * .55) + " " + f(y - 18) + " T" + (x + w) + " " + (y - 6) + " L" + (x + w) + " " + (y + 26) + " L" + x + " " + (y + 26) + " Z"; return P(d, BLANKET, 2.2) + '<path d="' + d + '" fill="url(#hatch)" opacity=".35"/>'; }
function pillowAt(x, y, w) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w / 2) + '" ry="' + f(w * .2) + '" fill="' + PILLOW + '" stroke="' + INK + '" stroke-width="2.2"/>'; }
function room(t, o) {
  o = o || {}; var s = R(-400, 0, 1440, FL, o.night ? "#cfcabd" : "#e8dfc9", 0) + floor(FL);
  s += R(170, 140, 150, 170, o.night ? "#3a4654" : "#cdd9df", 2.4) + '<path d="M245 140 V310 M170 225 H320" stroke="' + INK + '" stroke-width="2"/>';   // window
  if (o.night) s += C(285, 175, 14, "#f1e9c8", 1.4) + C(291, 171, 13, "#3a4654", 0);
  s += bed(220) + nightstand(90);
  s += socketSide(-8 + 0, FL - 200, 1) + R(-18, FL - 240, 10, 80, "#efe9dc", 2, 3);
  return s;
}

// heat chevrons rising from (x, y)
function heat(x, y, t, n, h, k) { var s = ""; for (var i = 0; i < (n || 3); i++) { var p = ((t * .6 + i / (n || 3)) % 1), yy = y - p * (h || 60), xx = x + (i - 1) * 16; s += '<path d="M' + f(xx - 8) + ' ' + f(yy + 6) + ' L' + f(xx) + ' ' + f(yy) + ' L' + f(xx + 8) + ' ' + f(yy + 6) + '" stroke="' + ORANGE + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f((1 - p) * (k == null ? 1 : k)) + '"/>'; } return s; }
function thermo(x, y, h, k, txt) { var s = R(x - 10, y - h, 20, h, "#f4ecdb", 2, 10) + C(x, y + 6, 17, ORANGE, 2) + R(x - 5, y - h * clamp(k) + 8, 10, h * clamp(k), ORANGE, 0, 5); for (var i = 1; i < 5; i++) s += '<path d="M' + (x + 10) + ' ' + f(y - h * i / 5) + ' h8" stroke="' + INK + '" stroke-width="1.6"/>'; return s + (txt ? N(txt, x + 54, y - h * clamp(k) + 14, 26, ORANGE) : ""); }
// flame
function flame(x, y, sc, t) { var w = 1 + .08 * Math.sin(t * 9), d = "M0 0 C-30 -10 -34 -50 -14 -80 C-10 -60 -2 -58 0 -66 C4 -90 18 -100 22 -120 C40 -80 44 -30 26 -6 C18 0 8 2 0 0 Z";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc * w) + " " + f(sc * (2 - w)) + ")", P(d, ORANGE, 2.4) + '<path d="M2 -6 C-12 -14 -12 -36 0 -50 C6 -36 16 -30 12 -10 Z" fill="#f4d06a" stroke="' + INK + '" stroke-width="1.6"/>'); }
// overnight charge graph: 23:00 → 07:00 on x, 0..100 % on y. upto: hours drawn (0..8). mode: "full" (rise then 100 with dips) | "smart" (to 80, hold, to 100 before 7)
function nightGraph(x, y, w, h, upto, mode, k) {
  var s = '<path d="M' + x + ' ' + (y - h) + ' V' + y + ' H' + (x + w) + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  var hrs = ["11", "12", "1", "2", "3", "4", "5", "6", "7"];
  for (var i = 0; i < 9; i++) s += '<path d="M' + f(x + i * w / 8) + ' ' + y + ' v8" stroke="' + INK + '" stroke-width="2"/>' + N(hrs[i], x + i * w / 8, y + 30, 16, MUTE);
  [20, 80, 100].forEach(function (p) { s += '<path d="M' + x + ' ' + f(y - h * p / 100) + ' H' + (x + w) + '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>' + N(p + "%", x - 8, y - h * p / 100 + 6, 15, INK, "end"); });
  function pct(hh) { if (mode === "smart") { if (hh < 1.2) return 30 + 50 * hh / 1.2; if (hh < 6.6) return 80 - (hh - 1.2) * .6 + .6 * ((hh * 3) % 1); return Math.min(100, 80 + (hh - 6.6) * 30); }
    if (hh < 2) return 30 + 70 * hh / 2; var c = ((hh - 2) * 1.2) % 1; return 100 - 4 * c; }
  var d = ""; for (var hh = 0; hh <= Math.min(8, upto); hh += .05) d += (d ? " L" : "M") + f(x + hh * w / 8) + " " + f(y - h * pct(hh) / 100);
  if (d) s += '<path d="' + d + '" stroke="' + (mode === "smart" ? OLIVE : ORANGE) + '" stroke-width="4.5" fill="none" stroke-linejoin="round"/>';
  if (upto > 0) { var e = Math.min(8, upto); s += C(x + e * w / 8, y - h * pct(e) / 100, 7, mode === "smart" ? OLIVE : ORANGE, 2); }
  return G("", s, k);
}
// a battery bar (big, upright) with a % fill
function bigBatt(x, y, w, h, pct, col, k) { var s = R(x, y - h, w, h, PAPER, 3, 10) + R(x + w * .3, y - h - 14, w * .4, 14, INK, 0, 3) + R(x + 8, y - 8 - (h - 16) * pct / 100, w - 16, (h - 16) * pct / 100, col || OLIVE, 0, 5); return G("", s, k == null ? 1 : k); }
// phone in profile (side cut), length 147 mm along x from x0, s units/mm; swell 0..1 lifts the screen up to 4 mm
function phoneSide(x0, y, s, swell, t) {
  var L = 147 * s, sw = clamp(swell), bul = 4 * s * sw, g = "";
  g += R(x0, y, L, 8 * s, FRAME, 2.2, 3 * s);                                                    // frame + back
  var bx0 = x0 + 30 * s, bx1 = x0 + 122 * s;                                                     // battery under the middle
  g += P("M" + f(bx0) + " " + f(y + 6.6 * s) + " L" + f(bx0) + " " + f(y + 2.2 * s) + " Q" + f((bx0 + bx1) / 2) + " " + f(y + 2.2 * s - bul * 2) + " " + f(bx1) + " " + f(y + 2.2 * s) + " L" + f(bx1) + " " + f(y + 6.6 * s) + " Z", POUCH, 1.8);
  // the screen: hinged at the left end, its right end lifted by the bulge
  var lift = bul * 2.1, ang = Math.atan2(lift, L * .85) * 180 / Math.PI;
  g += G("rotate(" + f(-ang) + " " + f(x0 + 6 * s) + " " + f(y) + ")", R(x0 + 2 * s, y - 1.6 * s, L - 4 * s, 2.2 * s, GLASSD, 1.8, 1));
  if (sw > .2) for (var i = 0; i < 6; i++) { var p = ((t * .5 + i / 6) % 1); g += C(lerp(bx0 + 10 * s, bx1 - 10 * s, hash(i)), y + 3 * s - p * 3 * s * sw, 1.6 * s * (.6 + hash(i + 3)), "none", 1.4); }
  return g;
}

// a pouch cell with the phone glass on it: k 0 flat … 1 puffed like a pillow, the glass tilting off
function swollen(x, y, k, t) {
  var w = 170, h = 18 + 40 * k, b = 26 * k, g = "";
  g += R(-w / 2 - 14, 30, w + 28, 14, FRAME, 2, 4);
  g += P("M" + (-w / 2) + " 30 C" + (-w / 2) + " " + f(30 - h) + " " + (w / 2) + " " + f(30 - h) + " " + (w / 2) + " 30 Z", POUCH, 2.2);
  g += P("M" + (-w / 2 + 10) + " 26 Q0 " + f(26 - h * .7 - b * .2) + " " + (w / 2 - 10) + " 26", "none", 1.2);
  g += G("rotate(" + f(-16 * k) + " " + (-w / 2 - 14) + " 24)", R(-w / 2 - 14, f(24 - 6 - h * .62 * k), w + 28, 8, GLASSD, 2, 3));
  return G("translate(" + x + " " + y + ")", g);
}
// ── shots (line numbers from script.txt). Lines 0–3 are the hook card, 4 the bumper, 24 the summary card, 25 the ask box.
// 5 · the rule: a lithium cell hates two things: full to the top, and heat
shot(5, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + appear(at(u, 0, .5), phoneFront(320, 330, 2.4, { pct: 100, charging: 1 })), c = window.CHUNKS[5], D = LN[5].end - LN[5].start;
  s += label(372, 250, 520, 160, "ليثيوم", BLUE, at(u, .4, .5), 30);
  var a = D * (c[1] || .45), b = D * (c[2] || .75);
  s += G("", bigBatt(70, 680, 90, 170, 100, BLUE, 1) + T("مليانة", 115, 735, 26, ORANGE, 800), at(u, a, .35)) + G("", cross(115, 590, 1, at(u, a + .3, .35)), 1);
  s += G("", thermo(520, 660, 150, .85 + .05 * Math.sin(t * 3), "") + T("سخونية", 520, 735, 26, ORANGE, 800), at(u, b, .35)) + cross(520, 600, 1, at(u, b + .3, .35));
  return s;
});
// 6 · what happens inside while charging? fly into the phone: the pouch cell under the back
shot(6, push(320, 400, 1.0, 1.25), function (u, d, t) {
  var s = paper(), k = at(u, .2, .8), w = 71.5 * 3.4, h = 147 * 3.4;
  s += R(320 - w / 2, 400 - h / 2, w, h, FRAME, 2.6, 30) + R(320 - w / 2 + 6, 400 - h / 2 + 6, w - 12, h - 12, "#e9e3d4", 1.6, 26);
  s += R(320 - w / 2 + 20, 400 - h / 2 + 20, w - 40, 110, BOARD, 2, 8) + C(320 - w / 2 + 60, 400 - h / 2 + 60, 22, "#3a352e", 2) + R(320 - 30, 400 + h / 2 - 40, 60, 16, FRAME, 1.6, 4);
  s += appear(k, R(320 - 30 * 3.4, 400 - h / 2 + 150, 60 * 3.4, 92 * 3.4, POUCH, 2.4, 8) + T("بطارية", 320, 400 + 40, 30, INK, 800));
  return s + G("", T("؟", 520, 200, 120, ORANGE, 800), at(u, .2, .3)) + label(390, 360, 560, 300, "جوه", BLUE, at(u, 1, .4), 26);
}, { tr: "in" });
// 7 · charging pushes lithium ions across and packs them between the graphite sheets
shot(7, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, d - .4) * .7;
  return paper() + cellCut(k, { t: t, flow: 1 }) + label(150, 230, 150, 150, "أيونات الليثيوم", ORANGE, at(u, .3, .5), 24) + label(470, 300, 520, 150, "الجرافيت", OLIVE, at(u, 1.4, .5), 24) +
    T("+", 81, 620, 30, INK, 800) + T("−", 559, 620, 30, INK, 800);
}, { tr: "in" });
// 8 · near 100 % the packing gets hard and the voltage climbs to its top
shot(8, push(320, 360, 1.0, 1.04), function (u, d, t) {
  var k = .7 + .3 * at(u, .2, d - .6), jit = k > .95 ? 2 * Math.sin(t * 30) : 0;
  return paper() + G("translate(" + f(jit) + " 0)", cellCut(k, { t: t * 3 })) + G("", R(160, 40, 320, 150, PAPER, 2, 10) + vdial(320, 150, 90, 3.7 + .5 * k, 1), 1) + numBox(Math.round(k * 100) + "%", 520, 630, 1, 30);
});
// 9 · like an overstuffed suitcase you sit on to close
shot(9, push(320, 470, 1.45, 1.55), function (u, d, t) {
  var b = .75 + .2 * Math.sin(t * 2.4), hy = 640 - 50 - 40 * b * .5 - 10, p = fig({ x: 340, y: hy, s: .7, lean: -4 + 4 * Math.sin(t * 2.4), legs: [[86, -84], [82, -80]], hands: [[300, hy + 6], [372, hy + 4]], bend: [1, -1], shirt: SHIRT_R });
  return paper() + floor(640) + suitcase(270, 640, b) + whole(p) + '<path d="M266 600 l-14 -12 M404 600 l14 -12 M262 620 h-18 M408 620 h18" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' +
    iconBox(215, 320, 120, G("translate(-83 -101) scale(.26)", cellCut(1, { t: t })), at(u, .3, .3));
}, { tr: "out" });
// 10 · doesn't the phone cut off by itself when it's done?
shot(10, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + phoneFront(260, 400, 2.6, { pct: 100, charging: 1 }) + cable("M260 591 C260 680 420 700 480 760", "#f2efe8") + plugC(260, 591, 2.6) + G("", T("؟", 470, 330, 130, ORANGE, 800), at(u, .2, .3));
});
// 11 · yes it stops, but stays full; when it dips a little it tops up again, seven, eight hours a night
shot(11, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var hrs = 8 * at(u, .3, d - .8);
  return paper() + nightGraph(100, 520, 470, 330, hrs, "full", 1) + label(280, 190, 330, 110, "مليان طول الليل", ORANGE, at(u, d * .35, .5), 26) + check(130, 120, .9, at(u, .1, .4)) + T("بيفصل", 200, 128, 24, INK, 800);
});
// 12 · the stress makes the electrolyte react; a crust grows on the graphite and eats lithium
shot(12, push(360, 390, 1.1, 1.22), function (u, d, t) {
  var k = at(u, .5, d - .8);
  return paper() + cellCut(.9, { t: t, sei: k, trapped: Math.round(10 * k) }) + label(390, 260, 470, 150, "طبقة", INK, at(u, .6, .5), 28) + label(395, 470, 300, 650, "ليثيوم محبوس", ORANGE, at(u, 1.6, .5), 26);
});
// 13 · and heat? charging warms the phone; under the pillow the heat has nowhere to go
shot(13, push(370, 520, 1.25, 1.32), function (u, d, t) {
  var s = paper() + room(t, { night: 1 }) + sleeper(360, FL - 120, .6125 * .9, t) + pillowAt(270, FL - 112, 90) + blanket(330, FL - 118, 180, t);
  var ph = '<rect x="252" y="' + (FL - 104) + '" width="34" height="5" fill="' + GLASSD + '" stroke="' + INK + '" stroke-width="1.2"/>';
  s += ph + cable("M252 " + (FL - 101) + " C200 " + (FL - 100) + " 120 " + (FL - 90) + " 10 " + (FL - 210), "#f2efe8") + heat(270, FL - 120, t, 3, 50, 1);
  var ins = pillowAt(0, -10, 200) + R(-60, 22, 120, 14, GLASSD, 2, 4) + heat(0, 10, t, 3, 40, 1) + '<path d="M-90 -40 q20 -20 40 0 M50 -40 q20 -20 40 0" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>' + R(-140, 36, 280, 60, "#efe8d8", 2);
  return s + inset(470, 330, 120, ins, at(u, .4, .35)) + label(270, FL - 101, 470, 470, "تحت المخدة", ORANGE, at(u, .8, .5), 24);
}, { tr: "in" });
// 14 · heat speeds that reaction up many times
shot(14, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, d - .5);
  return paper() + thermo(130, 560, 360, .3 + .55 * k, Math.round(25 + 15 * k) + "°") + G("translate(260 0) scale(.62)", cellCut(.9, { t: t * (1 + 4 * k), sei: .3 + .6 * k, trapped: Math.round(4 + 10 * k) })) + heat(470, 220, t, 3, 60, k) + numBox("× " + (1 + Math.round(2 * k)), 470, 640, at(u, .5, .3), 34);
});
// 15 · a full battery kept a year: about 80 % left at room temperature, about 65 % at 40 °C
shot(15, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[15], D = LN[15].end - LN[15].start, a = at(u, .3, 1.6), b = at(u, D * (c[2] || .55), 1.6);
  return paper() + bigBatt(110, 600, 150, 340, 100 - 20 * a, OLIVE, 1) + N(count(100 - 20 * a < 80.5 ? 80 : 100 - 20 * a, 1) + "%", 185, 660, 40, INK) + T("25° · سنة", 185, 712, 22, INK, 800) +
    G("", bigBatt(380, 600, 150, 340, 100 - 35 * b, ORANGE, 1) + N(Math.round(100 - 35 * b) + "%", 455, 660, 40, ORANGE) + T("40° · سنة", 455, 712, 22, ORANGE, 800) + heat(455, 220, t, 3, 50, 1), at(u, D * (c[2] || .55) - .3, .3));
});
// 16 · why does it swell? gas from the reaction, no way out of the sealed pouch; the screen lifts
shot(16, push(320, 380, 1.0, 1.1), function (u, d, t) {
  var k = at(u, .3, d - .6);
  return paper() + phoneSide(60, 360, 3.55, k, t) + label(320, 386, 380, 520, "غازات", BLUE, at(u, .8, .5), 26) + label(540, 350 - 26 * k, 470, 220, "الشاشة بتترفع", ORANGE, at(u, d * .5, .5), 26) +
    inset(170, 590, 110, swollen(0, 10, .4 + .6 * k, t), at(u, d * .4, .35));
});
// 17 · fire: a fake charger without protection; the heat can run away
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[17], D = LN[17].end - LN[17].start, k2 = at(u, D * (c[1] || .45), .6);
  var s = paper() + chargerInside(110, 160, 1.9, 1, 1) + T("شاحن مضروب", 224, 140, 26, ORANGE, 800) + label(220, 260, 470, 220, "مفيش حماية", ORANGE, at(u, .5, .5), 22);
  s += G("", phoneFront(320, 560, 1.2, { pct: 100, charging: 1 }) + flame(320, 470, .9 + .2 * k2, t) + heat(320, 400, t, 3, 50, 1), k2);
  return s + G("", T("نادر… بس بيحصل", 320, 760, 26, INK, 800), at(u, D * .8, .3));
});
// 18 · the myth: «it overcharges» — no: a chip cuts the current at 100 %; it just sleeps full and warm
shot(18, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[18], D = LN[18].end - LN[18].start, k = at(u, D * (c[1] || .45), .5), sw = k;
  var s = paper() + phoneFront(170, 330, 1.7, { pct: 100 }) + T("بيتشحن زيادة؟", 170, 120, 26, INK, 800) + cross(170, 330, 1.6, k);
  s += G("", R(330, 260, 260, 150, BOARD, 2, 8) + R(420, 300, 70, 70, INK, 0, 4) + T("شريحة الشحن", 460, 450, 22, OLIVE, 800) + '<path d="M300 335 H360" stroke="' + ORANGE + '" stroke-width="5"/>' +
    '<path d="M360 335 L' + f(360 + 40 * Math.cos(-sw * .7)) + ' ' + f(335 + 40 * Math.sin(-sw * .7)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(360, 335, 6, INK, 0) + C(402, 335, 6, INK, 0), at(u, D * (c[1] || .45), .3));
  return s + G("", T("مليان + سخن", 320, 640, 34, ORANGE, 800), at(u, D * .8, .3));
});
// 19 · what to do: smart charging in the battery settings: stop at 80, finish before you wake
shot(19, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[19], D = LN[19].end - LN[19].start, on = at(u, D * (c[1] || .3), .4);
  var scr = T("البطارية", 0, -100, 18, INK, 800) + R(-62, -80, 124, 40, "#f4f1ea", 1.4, 8) + T("الشحن الذكي", 54, -54, 12, INK, 800, "start") + R(-56, -70, 34, 20, on > .5 ? OLIVE : GREY, 1.2, 10) + C(lerp(-46, -32, on), -60, 8, "#fff", 1.2) +
    R(-62, -32, 124, 40, "#f4f1ea", 1.4, 8) + T("حد الشحن", 54, -6, 12, INK, 800, "start") + N("80%", -36, -5, 15, ORANGE) + battIcon(0, 50, 1.6, 80, 0) + N("80%", 0, 90, 22, OLIVE);
  return paper() + phoneFront(170, 400, 2.0, { screen: scr }) + nightGraph(320, 560, 280, 280, 8 * at(u, D * .5, D * .5), "smart", at(u, D * .45, .3));
});
// 20 · the 20–80 rule
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var p = 50 + 28 * Math.sin(t * 1.2), x = 120, w = 400, y = 380;
  var s = paper() + R(x, y, w, 70, PAPER, 3, 12) + R(x + w * .2, y, w * .6, 70, OLIVE, 0) + '<rect x="' + x + '" y="' + y + '" width="' + (w * .2) + '" height="70" fill="' + ORANGE + '" opacity=".5"/><rect x="' + (x + w * .8) + '" y="' + y + '" width="' + (w * .2) + '" height="70" fill="' + ORANGE + '" opacity=".5"/>' + R(x, y, w, 70, "none", 3, 12) + R(x + w, y + 22, 14, 26, INK, 0, 3);
  s += N("20%", x + w * .2, y + 116, 30, INK) + N("80%", x + w * .8, y + 116, 30, INK) + '<path d="M' + (x + w * .2) + ' ' + (y - 14) + ' V' + (y + 84) + ' M' + (x + w * .8) + ' ' + (y - 14) + ' V' + (y + 84) + '" stroke="' + INK + '" stroke-width="3"/>';
  s += '<path d="M' + f(x + w * p / 100) + ' ' + (y - 34) + ' l-12 -20 h24 Z" fill="' + INK + '"/>' + check(320, 260, 1.2, at(u, .5, .4)) + G("", cross(x + w * .1, y + 200, .7, 1) + cross(x + w * .9, y + 200, .7, 1), at(u, 1.5, .3));
  return s;
});
// 21 · on something dry and open, with an original charger
shot(21, push(90, 590, 2.5, 2.65), function (u, d, t) {
  var s = paper() + room(t, {}) + R(132, FL - 82, 34, 5, GLASSD, 1.4) + cable("M166 " + (FL - 80) + " C190 " + (FL - 80) + " 60 " + (FL - 100) + " 2 " + (FL - 200), "#f2efe8") + charger(2, FL - 200, .9, {});
  return s + heat(150, FL - 90, t, 3, 30, .35) + check(110, FL - 140, .5, at(u, .4, .4)) + label(14, FL - 205, 70, FL - 235, "شاحن أصلي", OLIVE, at(u, 1.2, .5), 12) + label(150, FL - 80, 95, FL - 180, "مكشوف", BLUE, at(u, .6, .5), 12);
}, { tr: "in" });
// 22 · bottom line: every night on the charger takes a bite of the battery's life
shot(22, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var n = Math.min(6, Math.floor(at(u, .2, d - .5) * 7)), s = paper();
  for (var i = 0; i < 6; i++) { var x = 70 + i * 86, op = i < n ? 1 : .25; s += G("", bigBatt(x, 520, 64, 200, 100 - i * 6, i > 3 ? ORANGE : OLIVE, 1) + C(x + 32, 580, 14, "#3a4654", 1.4) + C(x + 37, 576, 13, PAPER, 0), op); }
  return s + arrow(80, 650, 560, 650, INK, 3, at(u, .3, d - .6)) + T("كل ليلة", 320, 700, 26, INK, 800);
}, { tr: "out" });
// 23 · the odd fact: the same battery kept a year at 40 % loses only about 4 %
shot(23, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var a = at(u, .4, 1.6);
  return paper() + bigBatt(110, 600, 150, 340, 100 - 20 * a, ORANGE, .45) + N(Math.round(100 - 20 * a) + "%", 185, 660, 40, MUTE) + T("مليانة", 185, 712, 22, MUTE, 800) +
    bigBatt(380, 600, 150, 340, 100 - 4 * a, OLIVE, 1) + N(Math.round(100 - 4 * a) + "%", 455, 660, 40, OLIVE) + T("على 40%", 455, 712, 22, OLIVE, 800) + numBox("−4%", 455, 180, at(u, 1.8, .3), 34);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // 0: the bedroom at night, the phone charging on the nightstand; 1: it ages; 2: it swells; 3: it heats up
  var s = G("translate(30 -275) scale(1.25)", room(t, { night: 1 }) + sleeper(360, FL - 120, .6125 * .9, t) + pillowAt(270, FL - 112, 90) + blanket(330, FL - 118, 180, t) +
    R(108, FL - 82, 34, 5, GLASSD, 1.4) + cable("M142 " + (FL - 80) + " C170 " + (FL - 80) + " 60 " + (FL - 100) + " 2 " + (FL - 200), "#f2efe8") + charger(2, FL - 200, .9, {}));
  var v = li >= 1 ? t - LN[li].start : t - LN[0].start;
  if (li === 0) s += inset(150, 175, 115, phoneFront(0, 0, 1.2, { pct: 100, charging: 1, dark: 1, time: "2:14" }), ease(v / .5));
  if (li === 1) s += inset(150, 175, 115, bigBatt(-40, 80, 80, 160, 100 - 30 * ease(v / 2), OLIVE, 1), ease(v / .4)) + T("بتعجّز", 150, 330, 30, ORANGE, 800);
  if (li === 2) s += inset(150, 175, 115, swollen(0, 0, ease(v / 1.2), t), ease(v / .4)) + T("بتنفخ", 150, 330, 30, ORANGE, 800);
  if (li === 3) s += inset(150, 175, 115, phoneFront(0, 40, .9, { pct: 100, dark: 1 }) + flame(0, -20, .7 + .1 * Math.sin(t * 4), t), ease(v / .4)) + T("بتولّع", 150, 330, 30, ORANGE, 800);
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 108)", phoneFront(0, 0, .62, { pct: 100, charging: 1 }) + cable("M0 46 C0 70 30 80 40 96", "#f2efe8")); };
SCENE.outro = function (svg, u, t) {
  return G("translate(300 140)", phoneFront(-170, 0, .95, { pct: 80 }) + bigBatt(-30, 80, 70, 150, 80, OLIVE, 1) + thermo(110, 70, 120, .3, "") + charger(170, -20, 1.4, {})) +
    callout("1", 130, 40, ease(u / .3)) + callout("2", 270, 40, ease(u / .3 - .5)) + callout("3", 410, 40, ease(u / .3 - 1)) + callout("4", 520, 40, ease(u / .3 - 1.5));
};
