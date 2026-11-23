window.CHUNKS = [[0.0, 0.5], [0.0, 0.2727, 0.5455], [0.0, 0.7317], [0.0, 0.4194], [0.0, 0.6111], [0.0, 0.6207], [0.0, 0.322], [0.0, 0.5625], [0.0], [0.0, 0.7647], [0.0, 0.4091, 0.625], [0.0, 0.7], [0.0, 0.3725], [0.0, 0.4211], [0.0, 0.378, 0.7439], [0.0, 0.4444, 0.7302], [0.0, 0.5323], [0.0, 0.7222], [0.0, 0.5532, 0.7979], [0.0, 0.4412], [0.0, 0.6667], [0.0, 0.1944, 0.5185, 0.8056], [0.0, 0.3235, 0.6078, 0.8922], [0.0, 0.1807, 0.3976, 0.7229], [0.0, 0.4, 0.7667], [0.0], [0.0]];
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

// ── «إزاي بيتبرعوا بالبلازما؟» — drawings. Reference: «طب إزاي؟» v17 (red cells as biconcave discs, body close-ups),
// real photos of apheresis machines, blood-collection tubes and blood bags (refs/SOURCES.md). People: the shared person kit.

var RBC = "#c9483a", RBC_D = "#962c24", PLASMA = "#e8c260", PLASMA_D = "#c79f3f", PLASMA_L = "#f3dc94", BUFFY = "#f5f0e2",
    SALINE = "#dfe9ee", STEEL = "#cfd3d2", STEEL_D = "#9aa1a2", CHAIR = "#5f7584", CHAIR_D = "#465a68", MACH = "#e9e6dc", MACH_D = "#c9c4b4";
function rgba(c, a) { return '<g opacity="' + a.toFixed(3) + '">' + c + '</g>'; }

// a red cell seen at an angle: a disc with a paler dimple (biconcave), r = radius, sq = how edge-on (0.35 … 1)
function rbc(x, y, r, ang, sq) {
  sq = sq == null ? 1 : sq;
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ")",
    '<ellipse rx="' + f(r) + '" ry="' + f(r * sq) + '" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.8"/>' +
    '<ellipse cx="' + f(-r * .06) + '" cy="' + f(-r * .05 * sq) + '" rx="' + f(r * .5) + '" ry="' + f(r * .5 * sq) + '" fill="' + RBC_D + '" opacity=".55"/>' +
    '<path d="M' + f(-r * .7) + ' ' + f(-r * .45 * sq) + ' Q0 ' + f(-r * .95 * sq) + ' ' + f(r * .7) + ' ' + f(-r * .45 * sq) + '" stroke="#e98a78" stroke-width="' + f(r * .12) + '" fill="none" stroke-linecap="round" opacity=".7"/>');
}
// a field of red cells drifting in plasma (inside a circle or a box the caller clips)
function cellField(cx, cy, w, h, n, t, r, drift) {
  var s = "";
  for (var i = 0; i < n; i++) {
    var x = cx - w / 2 + hash(i) * w + 14 * Math.sin(t * .7 + i), y = cy - h / 2 + hash(i + 50) * h + (drift || 0) * hash(i + 9) + 10 * Math.cos(t * .6 + i * 1.7);
    s += rbc(x, y, r * (.8 + .4 * hash(i + 3)), hash(i + 7) * 180 + t * 12 * (hash(i) - .5), .45 + .55 * hash(i + 11));
  }
  return s;
}

// a blood-collection tube, upright: x centre, y top of the cap, w width, h length. k: 0 mixed (all red) … 1 settled
// (red at the bottom 45%, a thin white band, yellow plasma above). opt.spin tilts it (centrifuge), opt.noCap
var TUBEN = 0;
function tube(x, y, w, h, k, t, opt) {
  opt = opt || {}; var id = "tb" + (++TUBEN) + "_" + CLIPN++, r = w / 2, top = y + (opt.noCap ? 0 : h * .12), bot = y + h, L = top + 10, liq = bot - L;
  var shape = "M" + f(x - r) + " " + f(top) + " V" + f(bot - r) + " A" + f(r) + " " + f(r) + " 0 0 0 " + f(x + r) + " " + f(bot - r) + " V" + f(top) + " Z";
  var red = bot - liq * .45, sep = lerp(L, red, ease(k)), s = "";
  s += '<clipPath id="' + id + '"><path d="' + shape + '"/></clipPath>';
  s += '<path d="' + shape + '" fill="#f7f4ec"/>';
  var inner = R(x - r - 2, L, w + 4, sep - L, PLASMA, 0) + R(x - r - 2, sep, w + 4, bot - sep + 2, RBC, 0) +
    R(x - r - 2, sep - 1, w + 4, 6 * clamp((k - .55) / .3), BUFFY, 0) +
    '<path d="M' + f(x - r) + ' ' + f(L) + ' Q' + f(x) + ' ' + f(L + 5) + ' ' + f(x + r) + ' ' + f(L) + '" stroke="' + PLASMA_D + '" stroke-width="1.4" fill="none"/>' +
    R(x - r * .55, L + 6, w * .16, bot - L - r - 10, "#fff", 0, 0, ' opacity=".35"');
  if (k < 1) for (var i = 0; i < 14; i++) { var yy = lerp(sep + 8, bot - 8, hash(i + 21)) + 3 * Math.sin(t * 2 + i); if (yy < bot - 6) inner += '<ellipse cx="' + f(x - r + 6 + hash(i) * (w - 12)) + '" cy="' + f(yy) + '" rx="3.4" ry="1.6" fill="' + RBC_D + '" opacity=".6"/>'; }
  s += '<g clip-path="url(#' + id + ')">' + inner + '</g>' + '<path d="' + shape + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  if (!opt.noCap) s += R(x - r - 4, y, w + 8, top - y + 4, opt.cap || "#7a5aa0", 2, 4) + R(x - r - 4, y, w + 8, (top - y) * .35, "#00000022", 0);
  return opt.rot ? G("rotate(" + f(opt.rot) + " " + f(x) + " " + f(y + h / 2) + ")", s) : s;
}

// a soft bag on a hook: x centre, y top of the bag, w, h. k = fill (0..1), col = liquid. opt.text label on the bag
function bag(x, y, w, h, k, col, opt) {
  opt = opt || {}; var id = "bg" + (CLIPN++), d = "M" + f(x - w / 2 + 8) + " " + f(y) + " H" + f(x + w / 2 - 8) + " Q" + f(x + w / 2) + " " + f(y) + " " + f(x + w / 2) + " " + f(y + 10) +
    " V" + f(y + h - 14) + " Q" + f(x + w / 2) + " " + f(y + h) + " " + f(x + w / 2 - 14) + " " + f(y + h) + " H" + f(x - w / 2 + 14) + " Q" + f(x - w / 2) + " " + f(y + h) + " " + f(x - w / 2) + " " + f(y + h - 14) + " V" + f(y + 10) + " Q" + f(x - w / 2) + " " + f(y) + " " + f(x - w / 2 + 8) + " " + f(y) + " Z";
  var lv = y + h - (h - 12) * clamp(k), wob = 2.5 * Math.sin(window.__t * 2.4 + x);
  var s = '<path d="M' + f(x - 6) + ' ' + f(y) + ' V' + f(y - 14) + ' M' + f(x + 6) + ' ' + f(y) + ' V' + f(y - 14) + '" stroke="' + INK + '" stroke-width="2"/>' + R(x - w * .18, y + 4, w * .36, 7, "none", 1.4, 3);
  s += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="#f4f1ea" opacity=".9"/>';
  if (k > 0) s += '<g clip-path="url(#' + id + ')"><path d="M' + f(x - w) + ' ' + f(lv + wob) + ' Q' + f(x) + ' ' + f(lv - wob) + ' ' + f(x + w) + ' ' + f(lv + wob) + ' V' + f(y + h + 4) + ' H' + f(x - w) + ' Z" fill="' + col + '"/></g>';
  s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + R(x - w / 2 + 7, y + 22, w * .22, h * .55, "#fff", 0, 4, ' opacity=".35"');
  if (opt.text) s += R(x - w * .32, y + h * .42, w * .64, 22, "#fbf8ef", 1.4) + T(opt.text, x, y + h * .42 + 16, 13, INK, 700);
  return s;
}
// a tube (line) with liquid moving along it: pts path, col, t, dir (+1 forward), dashes show the flow
function line(d, col, t, dir, w) {
  w = w || 7; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="#ffffff" stroke-width="' + (w * .35) + '" fill="none" stroke-dasharray="4 18" stroke-dashoffset="' + f(-(dir || 1) * t * 40) + '" stroke-linecap="round" opacity=".55"/>';
}

// a peristaltic pump head: a round housing with three rollers that turn
function pump(x, y, r, t) {
  var s = C(x, y, r, STEEL, 2) + C(x, y, r * .7, "#eef0ee", 1.4);
  for (var i = 0; i < 3; i++) { var a = t * 3 + i * 2.094; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + r * .5 * Math.cos(a)) + ' ' + f(y + r * .5 * Math.sin(a)) + '" stroke="' + INK + '" stroke-width="2"/>' + C(x + r * .5 * Math.cos(a), y + r * .5 * Math.sin(a), r * .16, STEEL_D, 1.4); }
  return s + C(x, y, r * .12, INK, 0);
}
// the centrifuge bowl seen from above through the lid window: a spinning rotor
function bowlTop(x, y, r, t, sp) {
  var a = t * (sp || 9), s = C(x, y, r, "#3a3f44", 2.2) + C(x, y, r * .86, "#596066", 1.4);
  for (var i = 0; i < 6; i++) { var b = a + i * 1.047; s += '<path d="M' + f(x + r * .2 * Math.cos(b)) + ' ' + f(y + r * .2 * Math.sin(b)) + ' L' + f(x + r * .78 * Math.cos(b + .25)) + ' ' + f(y + r * .78 * Math.sin(b + .25)) + '" stroke="#9aa3a8" stroke-width="2.4" opacity=".7"/>'; }
  return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .55) + '" fill="none" stroke="' + RBC + '" stroke-width="' + f(r * .22) + '" opacity=".85"/>' + C(x, y, r * .3, PLASMA, 1.4) + C(x, y, r * .1, STEEL, 1.2);
}
// the plasma machine (apheresis), front view on castors: x centre of the cabinet base, y floor. k = plasma bag fill.
// Returns {svg, out: [x,y] of the line port, bag: [x,y] bottom of the plasma bag}. A pole carries the plasma bag,
// a saline bag and a citrate (anticoagulant) bag.
function machine(x, y, s, t, k, opt) {
  opt = opt || {}; var W = 190 * s, H = 250 * s, x0 = x - W / 2, top = y - 22 * s - H, o = "";
  // pole with three bags on the left
  var px = x0 - 26 * s; o += R(px - 3 * s, top - 170 * s, 6 * s, 170 * s + H, STEEL, 1.6) + '<path d="M' + f(px - 70 * s) + ' ' + f(top - 166 * s) + ' H' + f(px + 20 * s) + '" stroke="' + INK + '" stroke-width="' + f(4 * s) + '" stroke-linecap="round"/>';
  o += bag(px - 52 * s, top - 150 * s, 44 * s, 70 * s, .8, SALINE, { text: opt.labels ? "ملح" : "" }) + bag(px + 4 * s, top - 150 * s, 36 * s, 56 * s, .7, "#eef0e2", { text: opt.labels ? "سترات" : "" });
  // cabinet
  o += R(x0, top, W, H, MACH, 2.4, 10 * s) + R(x0, top + H - 26 * s, W, 26 * s, MACH_D, 2, 0);
  o += C(x0 + 22 * s, y - 10 * s, 11 * s, "#3a3a3a", 2) + C(x0 + W - 22 * s, y - 10 * s, 11 * s, "#3a3a3a", 2);
  // screen on top
  o += '<path d="M' + f(x - 52 * s) + ' ' + f(top) + ' L' + f(x - 44 * s) + ' ' + f(top - 70 * s) + ' H' + f(x + 60 * s) + ' L' + f(x + 52 * s) + ' ' + f(top) + ' Z" fill="#4c5560" stroke="' + INK + '" stroke-width="2.2"/>' +
       R(x - 36 * s, top - 60 * s, 86 * s, 46 * s, "#bcd6c9", 1.4) + R(x - 30 * s, top - 30 * s, 74 * s * (.15 + .85 * clamp(k)), 8 * s, PLASMA, 1, 2) + T(Math.round(clamp(k) * 100) + "%", x + 6 * s, top - 38 * s, 14 * s, INK, 800);
  // centrifuge lid with a window onto the spinning bowl
  o += R(x0 + 14 * s, top + 16 * s, W - 28 * s, 92 * s, "#dcd8cb", 2, 8 * s) + bowlTop(x, top + 62 * s, 38 * s, t, opt.spin == null ? 9 : opt.spin);
  // pumps and clamps
  o += pump(x0 + 46 * s, top + 150 * s, 24 * s, t) + pump(x0 + W - 46 * s, top + 150 * s, 24 * s, t * .8);
  o += R(x - 10 * s, top + 132 * s, 20 * s, 40 * s, STEEL, 1.6, 4) + C(x, top + 200 * s, 7 * s, ORANGE, 1.6);
  // plasma bag hanging on the right side
  var bx = x0 + W + 34 * s, by = top + 40 * s;
  o += '<path d="M' + f(x0 + W) + ' ' + f(by - 18 * s) + ' H' + f(bx) + ' V' + f(by - 6 * s) + '" stroke="' + INK + '" stroke-width="' + f(3.2 * s) + '" fill="none"/>' + bag(bx, by, 54 * s, 96 * s, k, PLASMA, { text: opt.labels ? "بلازما" : "" });
  return { svg: o, out: [x0 + 46 * s, top + 150 * s], bowl: [x, top + 62 * s], bag: [bx, by + 96 * s], bagTop: [bx, by], top: top, x0: x0, W: W };
}

// the donor: a reclining donation chair and a man lying back on it (shared person kit, side view, facing right),
// his near arm stretched out on the arm rest toward the machine. Returns {svg, arm: [x,y] the inner elbow, head}
function donor(x, y, s, t, opt) {
  opt = opt || {}; var o = "", br = (Math.sin(t * 1.5) + 1) / 2;
  // chair: base, column, reclined seat and back, leg rest, arm rest
  o += R(x - 70 * s, y - 14 * s, 190 * s, 14 * s, "#4a4a4a", 2, 6) + R(x + 10 * s, y - 70 * s, 22 * s, 58 * s, STEEL_D, 2);
  o += '<path d="M' + f(x - 170 * s) + ' ' + f(y - 250 * s) + ' L' + f(x - 40 * s) + ' ' + f(y - 92 * s) + ' L' + f(x + 120 * s) + ' ' + f(y - 92 * s) + ' L' + f(x + 220 * s) + ' ' + f(y - 60 * s) +
       ' L' + f(x + 214 * s) + ' ' + f(y - 40 * s) + ' L' + f(x + 116 * s) + ' ' + f(y - 70 * s) + ' L' + f(x - 50 * s) + ' ' + f(y - 70 * s) + ' L' + f(x - 192 * s) + ' ' + f(y - 240 * s) + ' Z" fill="' + CHAIR + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  o += '<path d="M' + f(x - 178 * s) + ' ' + f(y - 258 * s) + ' q-14 18 -8 34" stroke="' + CHAIR_D + '" stroke-width="' + f(16 * s) + '" stroke-linecap="round" fill="none"/>';
  var P = PERSON.side({ x: x - 34 * s, y: y - 118 * s, s: s * .92, dir: 1, rot: -52, breath: br, outfit: opt.outfit || "casual",
    legs: [{ hip: 44, knee: 34, ankle: -6 }, { hip: 40, knee: 30, ankle: -8 }],
    arms: [{ sh: 14, el: 6, hand: opt.fist ? "fist" : "relaxed" }, { sh: -10, el: 40, hand: "relaxed" }],
    head: { tilt: 10 + (opt.tilt || 0) }, face: opt.face || { eyes: (t * 1000) % 4100 < 140 ? .05 : 1, brows: "neutral", mouth: "smile" } });
  // arm rest under the stretched arm
  var el = P.joints.elbow, wr = P.joints.wrist;
  o += P.svg;
  return { svg: o, arm: el, wrist: wr, head: P.joints.head, J: P.joints };
}

// the scene used by the hook and several shots: donor on the left, machine on the right, lines between them
function donationScene(t, k, opt) {
  opt = opt || {}; var o = "";
  var M = machine(455, 640, .82, t, k, opt), D = donor(205, 640, .82, t, opt);
  if (!opt.noFloor) o += R(-400, 640, 1500, 300, "#e6dcc5", 0, 0, ' opacity=".6"');
  o += '<path d="M' + (opt.noFloor ? 20 : -400) + ' 640 H' + (opt.noFloor ? 640 : 1100) + '" stroke="' + INK + '" stroke-width="2.4"/>';
  o += M.svg + D.svg;
  var a = D.arm, mo = M.out;
  if (opt.lines !== false) {
    o += line("M" + f(a[0] + 6) + " " + f(a[1] + 4) + " C" + f(a[0] + 80) + " " + f(a[1] + 60) + " " + f(mo[0] - 80) + " " + f(mo[1] + 60) + " " + f(mo[0]) + " " + f(mo[1]), RBC, t, 1);
    if (opt.ret) o += line("M" + f(mo[0] + 10) + " " + f(mo[1] + 18) + " C" + f(mo[0] - 60) + " " + f(mo[1] + 110) + " " + f(a[0] + 60) + " " + f(a[1] + 90) + " " + f(a[0] + 14) + " " + f(a[1] + 10), "#a8392e", t, 1, 5);
    if (opt.plasma) o += line("M" + f(M.bowl[0] + 30) + " " + f(M.bowl[1]) + " C" + f(M.bowl[0] + 70) + " " + f(M.bowl[1] - 30) + " " + f(M.bagTop[0]) + " " + f(M.bagTop[1] - 40) + " " + f(M.bagTop[0]) + " " + f(M.bagTop[1] - 14), PLASMA, t, 1, 5);
    o += R(a[0] - 4, a[1] - 8, 18, 14, "#f4f1ea", 1.6, 3);   // the needle tape at the inner elbow
  }
  return { svg: o, M: M, D: D };
}

// small icons for the analogy box (drawn around 0,0, about 90 wide)
function iconSoup() { return '<path d="M-40 -4 H40 Q38 34 0 36 Q-38 34 -40 -4 Z" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-4" rx="40" ry="9" fill="' + PLASMA + '" stroke="' + INK + '" stroke-width="2"/>' + C(-14, -5, 5, ORANGE, 1.2) + C(8, -3, 4, OLIVE, 1.2) + C(22, -6, 4, ORANGE, 1.2) + '<path d="M-8 -26 q6 -8 0 -16 M8 -24 q6 -8 0 -16" stroke="' + GREY + '" stroke-width="2" fill="none"/>'; }
function iconJuice(k) { var lv = lerp(-20, 26, 0); return '<path d="M-24 -36 L24 -36 L18 40 L-18 40 Z" fill="#f7f1e2" stroke="' + INK + '" stroke-width="2"/><path d="M-23 -24 L23 -24 L18 40 L-18 40 Z" fill="#f2a649"/><path d="M-21 ' + f(lerp(-20, 22, k)) + ' L21 ' + f(lerp(-20, 22, k)) + ' L18 40 L-18 40 Z" fill="#d77a26"/>' + '<path d="M-24 -36 L24 -36 L18 40 L-18 40 Z" fill="none" stroke="' + INK + '" stroke-width="2"/>'; }
function iconWasher(t) { return R(-38, -40, 76, 82, "#eeeeea", 2, 6) + R(-38, -40, 76, 16, "#d8d6cf", 2, 0) + C(0, 8, 26, "#9fb7c6", 2) + G("rotate(" + f(t * 400) + " 0 8)", '<path d="M-16 8 h32 M0 -8 v32" stroke="' + INK + '" stroke-width="3"/>') + C(0, 8, 26, "none", 3); }
function iconCal(n, unit, col) { return R(-40, -36, 80, 76, "#fbf8ef", 2, 4) + R(-40, -36, 80, 18, col, 2, 0) + '<path d="M-22 -44 v14 M22 -44 v14" stroke="' + INK + '" stroke-width="3"/>' + N(n, 0, 18, 30, INK) + T(unit, 0, 34, 11, INK, 700); }
function clock(x, y, r, t, sp) { var a = t * (sp || 1); return C(x, y, r, "#fbf8ef", 2.4) + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + r * .5 * Math.sin(a / 12)) + ' ' + f(y - r * .5 * Math.cos(a / 12)) + ' M' + f(x) + ' ' + f(y) + ' L' + f(x + r * .78 * Math.sin(a)) + ' ' + f(y - r * .78 * Math.cos(a)) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' + C(x, y, 4, ORANGE, 0); }

// ── shots (line numbers from script.txt) ──
// 4 · «اسمها البلازما … 55%»: a big settled tube with its layers measured
shot(4, push(320, 400, 1.08, 0.98), function (u, d, t) {
  var k = at(u, .2, 1.6);
  return paper() + tube(250, 120, 110, 560, 1, t) + label(300, 300, 470, 250, "البلازما", BLUE, at(u, .5, .5), 28) +
    measure(330, 190, 330, 405, at(u, 1, .8), "", 0) + G("", N(count(55, at(u, 1, .8)) + "%", 470, 340, 52, ORANGE), at(u, 1.2, .3)) +
    label(300, 560, 470, 560, "كرات حمرا", OLIVE, at(u, 1.6, .5), 22) + N("45%", 470, 610, 30, INK);
});
// 5 · the blood you always saw red is more than half yellow: a blood drop that splits
shot(5, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.2), id = "dr" + CLIPN++, dp = "M320 120 C320 120 160 330 160 450 C160 560 240 640 320 640 C400 640 480 560 480 450 C480 330 320 120 320 120 Z";
  return paper() + '<clipPath id="' + id + '"><path d="' + dp + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(100, 100, 440, 560, RBC, 0) +
    R(100, 100, 440, lerp(0, 300, k), PLASMA, 0) + cellField(320, lerp(400, 560, k), 320, lerp(500, 160, k), 18, t, 13) + '</g>' +
    P(dp, "none", 3) + '<path d="M210 250 Q200 300 205 340" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".35"/>' +
    tag("أصفر", 320, 300, at(u, 1.2, .3), 34, BLUE);
});
// 6 · 92% water, the rest proteins, salts, sugar: a beaker and a stacked bar
shot(6, push(320, 400, 1.02, 0.96), function (u, d, t) {
  var k = at(u, .2, 1.2), s = paper();
  s += '<path d="M150 200 V590 Q150 620 180 620 H380 Q410 620 410 590 V200" fill="#f7f4ec" stroke="' + INK + '" stroke-width="2.6"/>' + R(152, 260, 256, 358, PLASMA_L, 0) + '<path d="M150 200 V590 Q150 620 180 620 H380 Q410 620 410 590 V200" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  for (var i = 0; i < 16; i++) { var x = 175 + hash(i) * 210, y = 290 + hash(i + 30) * 300 + 8 * Math.sin(t * 1.4 + i); s += appear(at(u, .9 + i * .05, .3), i % 3 === 0 ? '<path d="M' + f(x - 6) + ' ' + f(y) + ' q6 -10 12 0 t12 0" stroke="' + OLIVE + '" stroke-width="3" fill="none"/>' : i % 3 === 1 ? R(x - 4, y - 4, 8, 8, "#fff", 1.4) : C(x, y, 4, ORANGE, 1.2)); }
  s += R(470, 200, 60, 420, "#fbf8ef", 2) + R(470, 200 + 420 * .08, 60, 420 * .92 * k, BLUE, 2) + R(470, 200, 60, 420 * .08, ORANGE, 2);
  s += G("", N(count(92, k) + "%", 500, 450, 30, "#fff"), at(u, .6, .3)) + T("مية", 500, 480, 18, "#fff", 800) + label(500, 216, 360, 150, "بروتينات وأملاح وسكر", OLIVE, at(u, 1.2, .5), 18);
  return s;
});
// 7 · red cells floating in it, like vegetables in soup: a zoom into the plasma
shot(7, push(320, 400, 1.12, 1.0), function (u, d, t) {
  return paper() + inset(320, 420, 260, R(-300, -300, 600, 600, PLASMA_L, 0) + cellField(0, 0, 520, 520, 22, t, 30), 1) + iconBox(540, 120, 120, iconSoup(), at(u, .8, .3)) +
    label(380, 380, 520, 640, "كرة حمرا", OLIVE, at(u, .5, .5), 24);
}, { tr: "in" });
// 8 · how does the machine separate them while you sit there? the whole scene, the machine lid glowing
shot(8, push(320, 450, 1.14, 1.22), function (u, d, t) {
  var S = donationScene(t, .25, { ret: true, plasma: true });
  return paper() + S.svg + G("", T("؟", 130, 360, 90, ORANGE, 900), at(u, .6, .3));
}, { tr: "out" });
// 9 · the rule card
shot(9, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(1, tube(320, 200, 90, 460, 0, t)) + G("", '<rect x="140" y="250" width="360" height="160" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 330)"/>' +
    T("التقيل", 320, 318, 44, ORANGE, 800) + T("بينزل تحت", 320, 372, 34, INK, 700) + C(320, 258, 9, ORANGE, 2), at(u, .3, .4));
});
// 10 · the cells sink, the yellow comes up (a tube settling, a clock running)
shot(10, push(320, 410, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .3, d - .6);
  return paper() + tube(260, 110, 110, 560, k, t) + arrow(400, 420, 400, 560, ORANGE, 6, at(u, .6, .4)) + arrow(440, 420, 440, 280, BLUE, 6, at(u, 1.4, .4)) +
    label(300, 230, 480, 200, "أصفر فوق", BLUE, at(u, 1.6, .5), 22) + label(300, 600, 480, 640, "أحمر تحت", ORANGE, at(u, .8, .5), 22);
});
// 11 · like fresh orange juice: the glass big, the tube small beside it
shot(11, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, d - .5);
  return paper() + G("translate(280 420) scale(4)", iconJuice(k)) + label(300, 540, 470, 610, "التفل", OLIVE, at(u, 1, .5), 26) + G("", tube(560, 200, 50, 260, 1, t), at(u, .5, .4));
});
// 12 · it takes hours — you won't sit on the chair for hours
shot(12, push(320, 450, 1.12, 1.18), function (u, d, t) {
  var S = donationScene(t, .1, { face: { eyes: 1, brows: "worried", mouth: "frown" } });
  return paper() + S.svg + G("translate(170 250)", clock(0, 0, 70, t, 9) + T("ساعات؟", 0, 112, 28, ORANGE, 800), at(u, .2, .4)) + cross(170, 250, 1.6, at(u, 1.6, .5));
}, { tr: "out" });
// 13 · the machine has a centrifuge: zoom into the lid, the rotor spinning, rpm counting
shot(13, push(320, 400, 1.0, 1.1), function (u, d, t) {
  var sp = lerp(1, 26, at(u, .2, 1.4));
  return paper() + R(70, 150, 500, 500, "#dcd8cb", 3, 24) + bowlTop(320, 400, 210, t, sp) + arrowArc(320, 400, 250, t) + G("", N("3,000+", 320, 720, 46, ORANGE) + T("لفة في الدقيقة", 320, 754, 22, INK, 700), at(u, 1, .4));
}, { tr: "in" });
function arrowArc(x, y, r, t) { var a = t * 2, s = ""; for (var i = 0; i < 2; i++) { var b = a + i * Math.PI; s += '<path d="M' + f(x + r * Math.cos(b)) + ' ' + f(y + r * Math.sin(b)) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + r * Math.cos(b + .9)) + ' ' + f(y + r * Math.sin(b + .9)) + '" stroke="' + ORANGE + '" stroke-width="6" fill="none" stroke-linecap="round"/>' + G("translate(" + f(x + r * Math.cos(b + .9)) + " " + f(y + r * Math.sin(b + .9)) + ") rotate(" + f((b + .9) * 180 / Math.PI + 90) + ")", '<path d="M-10 -12 L8 0 L-10 12 Z" fill="' + ORANGE + '"/>'); } return s; }
// 14 · the spin pushes the heavy stuff outward, thousands of g; like the washing machine spin
shot(14, push(320, 420, 1.02, 0.96), function (u, d, t) {
  var a = t * 3, s = paper() + C(320, 420, 40, STEEL, 2.4) + arrowArc(320, 420, 120, t);
  for (var i = 0; i < 4; i++) { var b = a + i * 1.5708, x = 320 + 170 * Math.cos(b), y = 420 + 170 * Math.sin(b); s += '<path d="M320 420 L' + f(x) + ' ' + f(y) + '" stroke="' + STEEL_D + '" stroke-width="10"/>' + G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(b * 180 / Math.PI - 90) + ")", tube(0, -40, 40, 170, at(u, .5, d - 1), t)); }
  s += arrow(320, 420, 320, 140, ORANGE, 6, 0) + iconBox(540, 120, 120, iconWasher(t), at(u, .9, .3));
  return s + tag("أقوى من الجاذبية آلاف المرات", 320, 720, at(u, .4, .3), 24, ORANGE);
});
// 15 · in minutes: red pushed out, yellow stays inside and goes to the bag — the bowl cut in half (side view)
shot(15, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, 1.4), s = paper(), id = "bw" + CLIPN++, bp = "M180 220 H460 L440 600 Q320 660 200 600 Z";
  s += '<clipPath id="' + id + '"><path d="' + bp + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(100, 200, 440, 460, lerp(0, 1, k) > .5 ? PLASMA : "#b54a38", 0) +
    '<path d="M180 220 H' + f(lerp(460, 250, k)) + ' L' + f(lerp(440, 230, k)) + ' 640 H180 Z" fill="' + RBC + '" opacity="' + f(k) + '"/>' + '<path d="M460 220 H' + f(lerp(460, 390, k)) + ' L' + f(lerp(440, 410, k)) + ' 640 H460 Z" fill="' + RBC + '" opacity="' + f(k) + '"/>' + '</g>';
  s += P(bp, "none", 3) + R(300, 140, 40, 300, "#f4f1ea", 2.2) + R(306, 140, 28, 296, k > .6 ? PLASMA : "#f4f1ea", 0) + arrow(320, 200, 320, 90, BLUE, 6, at(u, 1.5, .4));
  s += arrow(250, 420, 200, 420, ORANGE, 5, at(u, .4, .3)) + arrow(390, 420, 440, 420, ORANGE, 5, at(u, .4, .3)) + G("translate(" + f(470) + " 150)", bag(0, -60, 80, 120, at(u, 1.8, d - 2), PLASMA, { text: "بلازما" }), at(u, 1.4, .3));
  return s + label(205, 520, 120, 700, "أحمر لبرة", ORANGE, at(u, 1, .5), 22) + label(320, 520, 360, 720, "أصفر جوه", BLUE, at(u, 1.2, .5), 22);
}, { tr: "in" });
// 16 · citrate so it doesn't clot in the lines: the citrate bag dripping into the line
shot(16, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var s = paper() + bag(220, 140, 150, 230, .75, "#eef0e2", { text: "سترات" }) + line("M220 370 V540 Q220 600 300 600 H700", "#eef0e2", t, 1, 8) + line("M-60 640 Q200 640 320 600", RBC, t, 1, 10);
  for (var i = 0; i < 3; i++) { var y = 420 + ((t * 80 + i * 40) % 120); s += '<ellipse cx="220" cy="' + f(y) + '" rx="5" ry="7" fill="#c9d0a2" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return s + label(300, 260, 470, 220, "سترات", OLIVE, at(u, .4, .5), 30) + G("", T("ضد التجلط", 470, 260, 20, MUTE, 700), at(u, .8, .3)) + cross(560, 640, .8, at(u, 1.2, .4)) + G("translate(560 560)", '<path d="M-30 0 q15 -30 30 0 t30 0" stroke="' + RBC_D + '" stroke-width="8" fill="none"/>' + T("جلطة", 0, 30, 16, INK, 700), at(u, 1, .3));
});
// 17 · tingling lips: a close-up of the donor's face, little zigzags at the lips
shot(17, push(320, 360, 1.0, 1.1), function (u, d, t) {
  var o = { face: { eyes: 1, brows: "raised", mouth: "o" }, tilt: 6 }, h0 = donor(0, 0, 3.6, t, o).head, D = donor(250 - h0[0], 330 - h0[1], 3.6, t, o), h = D.head, s = paper() + D.svg;
  for (var i = 0; i < 4; i++) { var a = -1.6 + i * .7, x = h[0] + 100 + 60 * Math.cos(a), y = h[1] + 10 + 60 * Math.sin(a); s += G("", '<path d="M' + f(x) + ' ' + f(y) + ' l8 -6 l6 8 l8 -6" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>', clamp(.5 + .5 * Math.sin(t * 8 + i))); }
  return s + tag("تنميل", 470, 150, at(u, .5, .3), 32, ORANGE);
}, { tr: "in" });
// 18 · the red cells come back with saline, cycle after cycle
shot(18, push(320, 450, 1.12, 1.18), function (u, d, t) {
  var S = donationScene(t, lerp(.3, .8, at(u, 0, d)), { ret: true, plasma: true, labels: true });
  return paper() + S.svg + callout("1", 330, 380, at(u, .6, .3), 18) + callout("2", 330, 520, at(u, 1.2, .3), 18) + callout("3", 330, 660, at(u, 1.8, .3), 18) +
    tag("الكرات الحمرا راجعة + ملح", 320, 720, at(u, .4, .3), 24, ORANGE);
}, { tr: "out" });
// 19 · about an hour; the body refills the plasma in a day or two (a drop filling back up)
shot(19, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, 1.2, d - 1.6), id = "rf" + CLIPN++, dp = "M0 -120 C0 -120 -110 10 -110 70 C-110 130 -60 160 0 160 C60 160 110 130 110 70 C110 10 0 -120 0 -120 Z", lv = 160 - 280 * lerp(.45, 1, k);
  return paper() + clock(170, 300, 110, t, 2.4) + T("حوالي ساعة", 170, 460, 30, INK, 800) + G("translate(470 280)", '<clipPath id="' + id + '"><path d="' + dp + '"/></clipPath><path d="' + dp + '" fill="#f7f4ec"/><g clip-path="url(#' + id + ')"><path d="M-130 ' + f(lv + 4 * Math.sin(t * 3)) + ' Q0 ' + f(lv - 6 * Math.sin(t * 3)) + ' 130 ' + f(lv + 4 * Math.sin(t * 3)) + ' V170 H-130 Z" fill="' + PLASMA + '"/></g>' + P(dp, "none", 2.6) + arrow(0, 120, 0, 10, BLUE, 6, at(u, 1, .4)), at(u, .6, .3)) + T("يوم أو اتنين", 470, 500, 28, BLUE, 800);
});
// 20 · every two weeks, not every three months
shot(20, push(320, 420, 1.0, 1.05), function (u, d, t) {
  return paper() + G("translate(190 360) scale(2.4)", iconCal("2", "أسابيع", BLUE), at(u, .2, .3)) + check(190, 560, 1.6, at(u, .8, .5), OLIVE) + T("بلازما", 190, 640, 30, BLUE, 800) +
    G("translate(450 360) scale(2.4)", iconCal("3", "شهور", ORANGE), at(u, .5, .3)) + T("دم كامل", 450, 640, 30, ORANGE, 800);
});
// 21 · what it's used for: albumin (burns), clotting factors (haemophilia), antibodies — one after the other
shot(21, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper(), ks = [at(u, .3, .4), at(u, d * .35, .4), at(u, d * .65, .4)];
  s += appear(ks[0], R(70, 180, 120, 200, "#f4f1ea", 2.4, 10) + R(90, 150, 80, 34, STEEL, 2) + R(76, 250, 108, 120, PLASMA_L, 0) + T("ألبيومين", 130, 420, 22, OLIVE, 800) + T("حروق", 130, 452, 18, ORANGE, 700));
  s += appear(ks[1], R(270, 220, 100, 160, "#f4f1ea", 2.4, 8) + R(282, 196, 76, 28, ORANGE, 2) + R(276, 300, 88, 76, "#f6e9cc", 0) + T("عوامل تجلط", 320, 420, 22, OLIVE, 800) + T("هيموفيليا", 320, 452, 18, ORANGE, 700));
  var ab = ""; for (var i = 0; i < 5; i++) { var x = 470 + (i % 3) * 50, y = 230 + Math.floor(i / 3) * 70 + 6 * Math.sin(t * 2 + i); ab += G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(20 * Math.sin(t + i)) + ")", '<path d="M0 30 V0 L-18 -22 M0 0 L18 -22" stroke="' + BLUE + '" stroke-width="7" fill="none" stroke-linecap="round"/>'); }
  s += appear(ks[2], ab + T("أجسام مضادة", 520, 420, 22, OLIVE, 800) + T("مناعة", 520, 452, 18, ORANGE, 700));
  return s + G("translate(320 620)", bag(0, -80, 110, 150, .9, PLASMA, { text: "بلازما" }), 1);
});
// 22 · the myth: plasma donation takes iron — no, the iron is in the red cells and they came back
shot(22, push(320, 420, 1.02, 0.98), function (u, d, t) {
  var s = paper() + rbc(320, 380, 150, 0, .9) + G("", N("Fe", 320, 400, 70, "#fff"), 1);
  s += arrow(320, 580, 320, 690, OLIVE, 6, at(u, 1.2, .4)) + G("", T("رجعتلك", 320, 740, 30, OLIVE, 800), at(u, 1.3, .3));
  return s + tag("حديد ↓", 320, 150, at(u, .2, .3), 34, ORANGE) + cross(320, 140, 1.4, at(u, .8, .5));
});
// 23 · recap: the whole loop, labelled
shot(23, push(320, 450, 1.1, 1.16), function (u, d, t) {
  var S = donationScene(t, .9, { ret: true, plasma: true });
  return paper() + S.svg + label(S.M.bagTop[0], S.M.bagTop[1] + 40, 520, 220, "الأصفر الخفيف", BLUE, at(u, .6, .5), 22) + tag("الأحمر التقيل راجع", 320, 720, at(u, 1.4, .3), 26, ORANGE);
}, { tr: "out" });
// 24 · the odd fact: one haemophilia patient, more than a thousand donors in a year
shot(24, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 4), n = Math.round(400 * k), s = paper();
  for (var i = 0; i < n; i++) { var x = 40 + (i % 20) * 29, y = 140 + Math.floor(i / 20) * 26; s += R(x, y, 16, 20, PLASMA, 1, 3); }
  return s + G("", R(150, 660, 340, 110, "#fbf8ef", 2.4) + N(count(1000, k) + "+", 320, 730, 56, ORANGE) + T("متبرع · سنة واحدة", 320, 760, 18, INK, 700), at(u, .2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: whole-blood donation, one red bag. line 1: the machine, blood out and back in the same arm. line 2: the bag of yellow
  var s = "";
  if (li === 0) {
    var D = donor(220, 600, .95, t, {}), a = D.arm;
    s += R(-300, 600, 1200, 200, "#e2d6bc", 0) + '<path d="M-300 600 H900" stroke="' + INK + '" stroke-width="2.4"/>' + D.svg + line("M" + f(a[0] + 6) + " " + f(a[1] + 4) + " C" + f(a[0] + 80) + " " + f(a[1] + 40) + " 470 470 490 430", RBC, t, 1);
    s += bag(490, 300, 90, 130, .2 + .6 * clamp((t - LN[0].start) / 3), RBC, {});
  } else {
    var S = donationScene(t, li === 2 ? clamp(.3 + (t - LN[2].start) / 3) : .15, { ret: true, plasma: li === 2 });
    s += G("translate(-10 -40) scale(.95)", S.svg);
    if (li === 2) s += inset(500, 130, 95, G("translate(" + f(-S.M.bagTop[0]) + " " + f(-S.M.bagTop[1] - 50) + ")", bag(S.M.bagTop[0], S.M.bagTop[1], 50, 90, .9, PLASMA, {})) , ease((t - LN[2].start) / .4)) + '<circle cx="500" cy="130" r="95" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>';
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return tube(90, 30, 46, 160, clamp(u * 1.2), t);
};
SCENE.outro = function (svg, u, t) {
  var S = donationScene(t, .9, { ret: true, plasma: true, noFloor: true }), z = .6, ox = 300 - 325 * z, oy = 140 - 440 * z;
  function at2(p, dx, dy) { return [ox + p[0] * z + (dx || 0), oy + p[1] * z + (dy || 0)]; }
  var a = at2(S.D.arm, -10, -26), b = at2(S.M.bowl), c = at2(S.M.bagTop, 26, 30), e = at2(S.D.arm, 50, 40);
  return G("translate(" + f(ox) + " " + f(oy) + ") scale(" + z + ")", S.svg) + callout("1", a[0], a[1], ease(u / .3)) + callout("2", b[0], b[1], ease(u / .3 - .5)) + callout("3", c[0], c[1], ease(u / .3 - 1)) + callout("4", e[0], e[1], ease(u / .3 - 1.5));
};
