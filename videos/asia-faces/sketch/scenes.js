window.CHUNKS = [[0.0, 0.4318], [0.0, 0.375, 0.6094], [0.0, 0.4839], [0.0, 0.4194], [0.0, 0.4754], [0.0, 0.7647], [0.0, 0.5217], [0.0, 0.3, 0.6286], [0.0], [0.0, 0.6875], [0.0, 0.6029], [0.0, 0.4694], [0.0], [0.0, 0.5128], [0.0, 0.35, 0.5625], [0.0, 0.5652], [0.0], [0.0, 0.2762, 0.4857, 0.7429], [0.0, 0.2048, 0.5181], [0.0, 0.5714], [0.0, 0.5789], [0.0, 0.3478, 0.7283], [0.0, 0.2113, 0.4085, 0.6056, 0.7746], [0.0, 0.5733], [0.0, 0.575], [0.0]];
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

// ── people with real body proportions: fig(), limb(), ik(), rel(), HB copied from videos/choking/sketch/shots.js ──
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", BLACKH = "#1e1a17";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the throat: mid-line cut of head and neck, face to the left ──
// o: {ep: 0 open … 1 closed, food: [x,y] | null, air: 0..1 (air running in the windpipe), hl: "food" | "air" | "ep", water, finger}
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

// ── «ليه ناس شرق آسيا شبه بعض؟» — drawings. Globes are real coastlines (Natural Earth via geo.min.js); people are the
// flat side-view figures with Drillis & Contini proportions; the hair, sweat-gland, tooth and eyelid close-ups follow
// real references (refs/SOURCES.md).
var CROWD = ["#8f4f34", "#5e653a", "#4a6f8a", "#bd552f", "#c0b49c", "#7c5434", "#a7ad6c", "#6b5a7a"];
var FEW = ["#8f4f34", "#4a6f8a", "#c0b49c"];
function cnt(to, k) { return k > .985 ? count(to, 1) : count(to, k); }
function gp(cx, cy, r, lon, lat, ll) { return GEO.globe(cx, cy, r, lon, lat).project(ll); }
// the route out of Africa (lon, lat)
var ROUTE = [[37, 6], [43, 12.6], [50, 19], [57, 25], [64, 27], [72, 25], [80, 24], [90, 23], [98, 22], [106, 25], [112, 31], [116, 38]];
function routePath(cx, cy, r, lon, lat, pts) { return pts.map(function (ll, i) { var p = gp(cx, cy, r, lon, lat, ll); return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function walkers(cx, cy, r, lon, lat, k, t, n) {   // a few dots walking along the route
  var s = "", pts = ROUTE.map(function (ll) { return gp(cx, cy, r, lon, lat, ll); });
  for (var i = 0; i < (n || 3); i++) { var q = along(pts, clamp(k - i * .03)); s += C(q[0] + 3 * Math.sin(t * 5 + i), q[1], 6, FEW[i % 3], 1.6); }
  return s;
}
// mountains: little inked peaks along a ridge (screen points)
function peaks(pts, h, k) {
  var s = ""; pts.forEach(function (p, i) { var kk = clamp(k * pts.length - i); if (kk <= 0) return; var hh = h * (0.7 + 0.5 * hash(i)) * kk;
    s += P("M" + f(p[0] - hh * .8) + " " + f(p[1]) + " L" + f(p[0]) + " " + f(p[1] - hh) + " L" + f(p[0] + hh * .8) + " " + f(p[1]) + " Z", "#b9a98a", 1.6) +
         P("M" + f(p[0] - hh * .25) + " " + f(p[1] - hh * .7) + " L" + f(p[0]) + " " + f(p[1] - hh) + " L" + f(p[0] + hh * .25) + " " + f(p[1] - hh * .7) + " Z", "#f4efe3", 1.2); });
  return s;
}
// a crowd of coloured dots in a ring, deterministic
function crowd(cx, cy, r, n, cols, k, t) {
  var s = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2" stroke-dasharray="7 6"/>';
  for (var i = 0; i < n; i++) { if (clamp(k * n - i) <= 0) continue; var a = i * 2.39996, rr = r * .86 * Math.sqrt((i + .5) / n);
    s += C(cx + rr * Math.cos(a) + 1.5 * Math.sin(t * 3 + i), cy + rr * Math.sin(a) + 1.5 * Math.cos(t * 2.6 + i), 9, cols[Math.floor(hash(i + 7) * cols.length)], 1.6); }
  return s;
}
// DNA double helix, vertical. hl: index of the rung in orange
function helix(x, y, h, t, hl, k) {
  var s = "", n = 14, a1 = "", a2 = "";
  for (var i = 0; i <= 60; i++) { var yy = y + h * i / 60, ph = i / 60 * Math.PI * 4 + t * 1.2; a1 += (i ? "L" : "M") + f(x + 60 * Math.sin(ph)) + " " + f(yy); a2 += (i ? "L" : "M") + f(x - 60 * Math.sin(ph)) + " " + f(yy); }
  for (i = 0; i < n; i++) { var yy2 = y + h * (i + .5) / n, ph2 = (i + .5) / n * Math.PI * 4 + t * 1.2, w = 60 * Math.sin(ph2), on = i === hl;
    s += '<path d="M' + f(x - w) + ' ' + f(yy2) + ' L' + f(x + w) + ' ' + f(yy2) + '" stroke="' + (on ? ORANGE : i % 2 ? BLUE : OLIVE) + '" stroke-width="' + (on ? 9 : 5) + '" opacity="' + (on ? 1 : .75) + '"/>'; }
  return G("", s + '<path d="' + a1 + '" fill="none" stroke="' + INK + '" stroke-width="4"/><path d="' + a2 + '" fill="none" stroke="' + INK + '" stroke-width="4"/>', k);
}
// hair: cross-section of a strand. r, squash (1 round), k appear
function hairCut(x, y, r, sq, label1) {
  return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * sq) + '" fill="#2e2620" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * .78) + '" ry="' + f(r * sq * .78) + '" fill="#4a3c31" stroke="#6d5a49" stroke-width="1.4"/>' +
    '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * .18) + '" ry="' + f(r * sq * .18) + '" fill="#6d5a49"/>' + (label1 ? T(label1, x, y + r + 46, 24, INK, 700) : "");
}
// a skin block cut away: top layer, dermis with coiled sweat glands and their ducts. n glands, x0..x0+w
function skinCut(x0, y0, w, n, k, t) {
  var s = R(x0, y0, w, 40, "#e3b59c", 2) + R(x0, y0 + 40, w, 260, "#f0d2bf", 2) + '<rect x="' + x0 + '" y="' + (y0 + 40) + '" width="' + w + '" height="260" fill="url(#hatch)" opacity=".18"/>';
  for (var i = 0; i < n; i++) { var kk = clamp(k * n - i); if (kk <= 0) continue; var gx = x0 + w * (i + .5) / n, gy = y0 + 230;
    var coil = "M" + f(gx) + " " + f(y0) + " C" + f(gx + 8) + " " + f(y0 + 60) + " " + f(gx - 8) + " " + f(y0 + 120) + " " + f(gx) + " " + f(gy - 30);
    s += G("", '<path d="' + coil + '" fill="none" stroke="' + BLUE + '" stroke-width="4"/>' + '<path d="M' + f(gx - 18) + ' ' + f(gy) + ' c0 -26 36 -26 36 0 c0 22 -30 22 -30 4 c0 -16 24 -16 24 0 c0 12 -18 12 -18 2" fill="#cfe0e8" stroke="' + BLUE + '" stroke-width="3.4"/>' +
      C(gx + 2 * Math.sin(t * 2 + i), y0 - 10 - 8 * ((t * .8 + i * .3) % 1), 5, "#cfe0e8", 1.4), kk);
  }
  return s;
}
// an upper front tooth seen from the tongue side; shovel: 0 flat … 1 raised side ridges
function incisor(x, y, sc, shovel) {
  var s = P("M-50 -110 C-56 -40 -46 40 -34 90 C-20 120 20 120 34 90 C46 40 56 -40 50 -110 Z", "#f4efe3", 3);
  s += P("M-50 -110 C-30 -122 30 -122 50 -110", "none", 2);
  if (shovel > 0) s += G("", '<path d="M-40 -100 C-44 -40 -36 30 -22 80" fill="none" stroke="#c9bfa6" stroke-width="14" stroke-linecap="round"/><path d="M40 -100 C44 -40 36 30 22 80" fill="none" stroke="#c9bfa6" stroke-width="14" stroke-linecap="round"/>' +
    '<path d="M-28 -95 C-30 -30 -20 40 0 70 C20 40 30 -30 28 -95 Z" fill="#e2d8c0" stroke="none"/>' + P("M-40 -100 C-44 -40 -36 30 -22 80 M40 -100 C44 -40 36 30 22 80", "none", 2), shovel);
  s += P("M-34 90 C-30 140 -18 200 0 230 C18 200 30 140 34 90", "#e6dcc4", 2.4);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// an eye seen from the front. fold: 0 a crease above the lid, 1 a fold of skin over the inner corner. open: 0..1 (blink)
function eyeFront(x, y, sc, fold, t) {
  var bl = Math.max(0, 1 - Math.pow(Math.abs(Math.sin(t * .9)), 40) * 1), op = (.55 + .45 * bl) * (fold > .5 ? .78 : 1), s = "";
  var up = "M-110 0 C-70 " + f(-62 * op) + " 60 " + f(-70 * op) + " 110 -6", lo = "C70 40 -60 44 -110 0 Z", id = "ey" + (++CLIPN);
  s += '<path d="M-150 -120 H150 V80 H-150 Z" fill="' + SKIN + '" stroke="none"/>';
  s += '<clipPath id="' + id + '"><path d="' + up + " " + lo + '"/></clipPath><path d="' + up + " " + lo + '" fill="#f6f2ea" stroke="none"/>';
  s += '<g clip-path="url(#' + id + ')"><circle cx="6" cy="-6" r="40" fill="#5a4231" stroke="' + INK + '" stroke-width="2"/><circle cx="6" cy="-6" r="17" fill="#15110e"/><circle cx="18" cy="-18" r="7" fill="#fff" opacity=".8"/></g>';
  s += '<path d="' + up + '" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M110 -6 ' + lo.replace(" Z", "") + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  // lashes
  for (var i = 1; i < 8; i++) { var k = i / 8, lx = lerp(-100, 100, k), ly = -48 * op * Math.sin(k * Math.PI) - 4; s += '<path d="M' + f(lx) + ' ' + f(ly) + ' l' + f(6 + k * 6) + ' -12" stroke="' + INK + '" stroke-width="2"/>'; }
  if (fold < .5) s += '<path d="M-100 -26 C-60 -86 60 -94 112 -30" fill="none" stroke="' + SKIN2 + '" stroke-width="3.2"/>';   // the crease
  else s += '<path d="M-150 -70 C-90 -66 -40 -64 0 ' + f(-50 * op - 10) + ' C50 -66 90 -50 116 -12 C70 ' + f(-56 * op) + ' -60 ' + f(-50 * op) + ' -112 -4 C-124 -14 -138 -40 -150 -70 Z" fill="' + SKIN + '" stroke="' + SKIN2 + '" stroke-width="3"/>' +
    '<path d="M-150 -60 C-132 -30 -118 -6 -104 6 C-120 18 -136 26 -150 30" fill="' + SKIN + '" stroke="' + SKIN2 + '" stroke-width="3.6" stroke-linejoin="round"/>';   // the lid skin comes down with no crease and folds over the inner corner
  s += '<path d="M-130 -110 C-60 -150 70 -150 140 -100" fill="none" stroke="#2e2620" stroke-width="14" stroke-linecap="round"/>';   // the brow
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// a house mouse in profile, facing left. fur 0..1 (thicker coat strokes)
function mouse(x, y, sc, fur, t) {
  var s = "", br = 1 + .02 * Math.sin(t * 6);
  s += '<path d="M150 20 C230 30 290 -10 330 -70 C340 -86 352 -84 346 -66 C320 0 250 60 150 46" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';   // tail
  s += '<path d="M150 20 C230 30 290 -10 330 -70" fill="none" stroke="#d9a7a0" stroke-width="2.5"/>';
  s += G("scale(1 " + f(br) + ")", P("M-150 10 C-140 -30 -100 -60 -60 -70 C0 -100 110 -90 160 -30 C182 -2 178 40 150 52 C80 70 -40 64 -100 46 C-130 40 -156 30 -150 10 Z", "#a39886", 2.6));
  for (var i = 0; i < 22; i++) { var fx = lerp(-90, 150, i / 22), fy = -60 + 40 * Math.abs(i / 22 - .45) + 6 * hash(i); s += '<path d="M' + f(fx) + ' ' + f(fy) + ' l10 ' + f(10 + 8 * fur) + '" stroke="' + INK + '" stroke-width="' + f(1.2 + 2.4 * fur) + '" opacity=".6"/>'; }
  s += P("M-150 10 C-170 6 -196 12 -208 18 C-196 28 -170 30 -146 28 Z", "#a39886", 2.2) + C(-206, 18, 5, "#d9a7a0", 1.4);   // snout, nose
  s += '<ellipse cx="-96" cy="-58" rx="30" ry="36" fill="#d9a7a0" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="-96" cy="-58" rx="18" ry="24" fill="#c98a85" opacity=".6"/>';   // ear
  s += C(-140, -14, 6, INK, 0) + C(-142, -16, 2, "#fff", 0);
  for (i = 0; i < 3; i++) s += '<path d="M-190 16 l-46 ' + f(-12 + i * 12) + '" stroke="' + INK + '" stroke-width="1.2"/>';
  s += P("M-80 56 l-6 24 l-14 4 M100 54 l4 24 l-16 4", "none", 3.4);   // feet
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// a person, standing; side view, facing left. Height 400·s, hip at floor − 212·s
function person(x, floorY, s, o) { o = o || {}; var fg = fig({ x: x, y: floorY - 212 * s, s: s, shirt: o.shirt || SHIRT_V, hair: o.hair || BLACKH, legs: [[3, -2], [-4, 3]], hands: o.hands }); return whole(fg); }
// a head-and-shoulders outline (no face), for thought bubbles
function headIcon(x, y, sc, hair) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-40 60 C-40 30 -20 22 0 22 C20 22 40 30 40 60 Z" fill="' + SHIRT_R + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-6" rx="22" ry="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-22 -8 C-24 -36 24 -38 22 -8 C14 -24 -14 -24 -22 -8 Z" fill="' + (hair || BLACKH) + '" stroke="' + INK + '" stroke-width="1.4"/>');
}
function bubble(x, y, w, h, tail) { return '<path d="M' + (x - w / 2) + ' ' + (y - h / 2) + ' h' + w + ' a20 20 0 0 1 20 20 v' + (h - 40) + ' a20 20 0 0 1 -20 20 h' + (-w / 2 + 20) + ' l' + (tail || -24) + ' 30 v-30 h' + (-w / 2 + 20 - (tail || -24) * 0) + ' a20 20 0 0 1 -20 -20 v' + (-(h - 40)) + ' a20 20 0 0 1 20 -20 z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/>'; }
function snowflake(x, y, r) { var s = ""; for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; s += '<path d="M' + x + ' ' + y + ' l' + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r) + '" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round"/>'; } return s; }

// ── 4 · out of Africa, about 60,000 years ago ──
shot(4, push(320, 410, 1.0, 1.08), function (u, d, t) {
  var cx = 320, cy = 400, r = 260, lo = 55 + u * 1.6, la = 18, k = at(u, .4, d - .6);
  return paper() + globe(cx, cy, r, lo, la) + draw(routePath(cx, cy, r, lo, la, ROUTE.slice(0, 6)), k, ORANGE, 6, ' stroke-dasharray="14 10"') + walkers(cx, cy, r, lo, la, k * .45, t) +
    label.apply(null, [].concat(gp(cx, cy, r, lo, la, [30, 2]), [170, 690, "أفريقيا", OLIVE, at(u, .3, .5), 26])) +
    numBox(cnt(60000, at(u, 1.6, 1.6)), 470, 110, at(u, 1.4, .3), 44) + G("", T("سنة", 470, 175, 26, INK, 800), at(u, 1.6, .3));
});
// ── 5 · the rule card ──
shot(5, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + crowd(320, 420, 210, 46, CROWD, at(u, .1, 1.4), t) + tag("قاعدة", 320, 140, at(u, .3, .3), 40, ORANGE);
});
// ── 6 · a small group leaves; its children inherit only its colours ──
shot(6, push(330, 420, 0.92, 1.0), function (u, d, t) {
  var k = at(u, .4, 1.6), s = paper() + dim(k, crowd(200, 260, 150, 40, CROWD, 1, t));
  var g = [[150, 230], [175, 270], [205, 240], [230, 285], [195, 300]];
  g.forEach(function (p, i) { var x = lerp(p[0], 430 + (i % 3) * 30, k), y = lerp(p[1], 540 + Math.floor(i / 3) * 30 + (i % 2) * 10, k); s += C(x, y, 10, FEW[i % 3], 2); });
  s += arrow(300, 340, 400, 470, ORANGE, 6, at(u, .5, .6));
  s += G("", crowd(470, 590, 150, 34, FEW, at(u, 2.2, 2), t), at(u, 2, .4)) + label(420, 520, 200, 720, "ولادها", BLUE, at(u, 2.6, .5), 26);
  return s;
});
// ── 7 · like scooping a cup from a sack of coloured sugared peanuts ──
function sack(x, y, sc, t) {
  var s = P("M-150 160 C-170 60 -150 -60 -120 -110 L120 -110 C150 -60 170 60 150 160 C80 180 -80 180 -150 160 Z", "#c8a96e", 3) +
    '<path d="M-150 160 C-170 60 -150 -60 -120 -110 L120 -110 C150 -60 170 60 150 160 C80 180 -80 180 -150 160 Z" fill="url(#hatch)" opacity=".35"/>' +
    '<ellipse cx="0" cy="-110" rx="120" ry="26" fill="#e9dcc0" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i < 36; i++) { var a = i * 2.39996, rr = 104 * Math.sqrt((i + .5) / 36); s += '<ellipse cx="' + f(rr * Math.cos(a)) + '" cy="' + f(-110 + rr * Math.sin(a) * .22) + '" rx="9" ry="6" transform="rotate(' + f(a * 57) + ' ' + f(rr * Math.cos(a)) + ' ' + f(-110 + rr * Math.sin(a) * .22) + ')" fill="' + CROWD[i % CROWD.length] + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + sc + ")", s);
}
function cup(x, y, cols, n, t) {
  var s = P("M-60 -70 L60 -70 L46 70 L-46 70 Z", "#e8eef0", 2.6);
  for (var i = 0; i < n; i++) { var px = -44 + (i % 6) * 17 + (Math.floor(i / 6) % 2) * 8, py = 58 - Math.floor(i / 6) * 13; s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="8" ry="5.5" fill="' + cols[Math.floor(hash(i + 3) * cols.length)] + '" stroke="' + INK + '" stroke-width="1.1"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ")", s + P("M-60 -70 L60 -70", "none", 3));
}
shot(7, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .6, 1.4), cx = lerp(250, 470, k), cy = lerp(300, 520, k) - 120 * Math.sin(k * Math.PI);
  return paper() + sack(220, 470, 1.1, t) + cup(cx, cy, k > .5 ? FEW : FEW, Math.round(30 * clamp(u / .8)), t) +
    label(cx - 30, cy + 60, 340, 720, "لونين تلاتة", ORANGE, at(u, 2.2, .5), 26) + iconBox(520, 120, 140, T("زي", 0, 14, 44, INK, 800), at(u, .1, .3));
});
// ── 8 · why East Asia? ──
shot(8, push(320, 400, 1.1, 1.0), function (u, d, t) {
  return paper() + globe(320, 420, 250, 105 + u * 2, 30) + T("؟", 330, 330, 150, ORANGE, 800) + label.apply(null, [].concat(gp(320, 420, 250, 105 + u * 2, 30, [115, 33]), [220, 160, "شرق آسيا", ORANGE, at(u, .2, .5), 28]));
}, { tr: "in" });
// ── 9 · the first small groups arrive, about 45,000 years ago ──
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var cx = 320, cy = 420, r = 250, lo = 82 + u * 1.2, la = 22, k = at(u, .2, d - .6);
  return paper() + globe(cx, cy, r, lo, la) + draw(routePath(cx, cy, r, lo, la, ROUTE.slice(3)), k, ORANGE, 6, ' stroke-dasharray="14 10"') +
    walkers(cx, cy, r, lo, la, .25 + k * .75, t, 3) + numBox(cnt(45000, at(u, 1.6, 1.6)), 470, 110, at(u, 1.4, .3), 44) + G("", T("سنة", 470, 175, 26, INK, 800), at(u, 1.6, .3));
});
// ── 10 · the Himalaya and the Gobi cut them off ──
shot(10, push(320, 420, 1.0, 1.1), function (u, d, t) {
  var cx = 320, cy = 470, r = 560, lo = 93 + u * 2.4, la = 34 + .6 * Math.sin(t * 1.3), s = paper() + globe(cx, cy, r, lo, la);
  var ridge = [[74, 35], [77, 33], [80, 31], [83, 29.5], [86, 28.5], [89, 28], [92, 28], [95, 28.5], [97, 28.5]].map(function (ll) { return gp(cx, cy, r, lo, la, ll); });
  s += peaks(ridge, 60, at(u, .3, 1.4));
  var gb = gp(cx, cy, r, lo, la, [105, 43]);
  s += G("", '<ellipse cx="' + f(gb[0]) + '" cy="' + f(gb[1]) + '" rx="120" ry="52" fill="#e6d3a3" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="8 6"/>' + (function () { var q = ""; for (var i = 0; i < 26; i++) q += C(gb[0] + (hash(i) - .5) * 200, gb[1] + (hash(i + 40) - .5) * 70, 2, INK, 0); return q; })(), at(u, 2, .5));
  s += label(ridge[4][0], ridge[4][1] - 30, 240, 150, "الهيمالايا", OLIVE, at(u, 1.2, .5), 28) + label(gb[0], gb[1] - 40, 520, 120, "صحرا جوبي", ORANGE, at(u, 2.4, .5), 28);
  return s;
});
// ── 11 · generation after generation, the same few colours ──
shot(11, pan(320, 300, 320, 500, 1.04), function (u, d, t) {
  var s = paper(), rows = 5;
  for (var j = 0; j < rows; j++) { var kk = at(u, .1 + j * .7, .7), n = 2 + j * 2, y = 130 + j * 135;
    for (var i = 0; i < n; i++) { var x = 320 + (i - (n - 1) / 2) * 56; if (j) s += G("", '<path d="M' + f(320 + (Math.floor(i / 2) - (n - 3) / 2) * 56) + ' ' + (y - 115) + ' L' + f(x) + ' ' + (y - 20) + '" stroke="' + MUTE + '" stroke-width="1.6"/>', kk);
      s += G("", C(x + 3 * Math.cos(t * 2.4 + i), y + 7 * Math.sin(t * 3.2 + i + j), 18, FEW[Math.floor(hash(i * 3 + j) * 3)], 2), kk); }
    s += G("", T("جيل " + (j + 1), 590, y + 10, 22, MUTE, 700), kk); }
  return s + '<path d="M50 110 V700" stroke="' + ORANGE + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 26" stroke-dashoffset="' + f(-t * 70) + '"/>' + arrow(50, 690, 50, 740, ORANGE, 8, 1);
});
// ── 12 · where did the thick straight hair come from? a strand under the magnifier ──
shot(12, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper(), sw = 4 * Math.sin(t * 2);
  for (var i = 0; i < 9; i++) s += '<path d="M' + (150 + i * 40) + ' 60 C' + f(150 + i * 40 + sw) + ' 300 ' + f(140 + i * 40 - sw) + ' 500 ' + (150 + i * 40) + ' 760" stroke="#1e1a17" stroke-width="' + (i === 4 ? 14 : 9) + '" fill="none"/>';
  return s + inset(320, 400, 140, hairCut(0, 0, 90, 1), at(u, .3, .4)) + T("؟", 520, 230, 120, ORANGE, 800);
}, { tr: "in" });
// ── 13 · one small change in a gene called EDAR, in northern China about 30,000 years ago ──
shot(13, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + helix(170, 90, 620, t, 7, at(u, .1, .4));
  s += label(230, 90 + 620 * 7.5 / 14, 360, 300, "EDAR", ORANGE, at(u, 1.2, .5), 40);
  s += G("", globe(470, 520, 140, 108 + u * 1.6, 32, { dot: [113, 38] }), at(u, 3.2, .5)) + label(470, 470, 380, 360, "شمال الصين", OLIVE, at(u, 3.8, .5), 24);
  s += numBox(cnt(30000, at(u, 4.6, 1.4)), 470, 690, at(u, 4.4, .3), 40);
  return s;
});
// ── 14 · what the gene does: thicker hair · more sweat glands · shovel-shaped front teeth ──
shot([14, 0], push(320, 400, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .3, 1);
  return paper() + hairCut(190, 380, 70, .72, "من غير الجين") + G("", hairCut(450, 380, lerp(70, 96, k), lerp(.72, 1, k), "بالجين"), 1) + arrow(280, 380, 330, 380, ORANGE, 6, at(u, .2, .4)) + tag("أتخن", 450, 160, at(u, 1, .3), 36, ORANGE);
});
shot([14, 1], push(320, 420, 1.06, 1.0), function (u, d, t) {
  return paper() + skinCut(60, 280, 520, 6, at(u, .1, 1.4), t) + label(60 + 520 / 12 + 18, 510, 260, 680, "غدة عرق", BLUE, at(u, .6, .5), 26) + T("+", 560, 200, 80, ORANGE, 800);
});
shot([14, 2], push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + incisor(320, 380, 1.5, at(u, .3, .8)) + label(256, 330, 220, 160, "حروف بارزة", ORANGE, at(u, .9, .5), 26) +
    iconBox(520, 130, 150, '<path d="M-14 -60 h28 v56 h-28 z" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2"/><path d="M-40 0 h80 c0 40 -20 62 -40 62 c-20 0 -40 -22 -40 -62 z" fill="#b9bdb6" stroke="' + INK + '" stroke-width="2.4"/>', at(u, .6, .3));
});
// ── 15 · today about 9 in 10 people in China carry it ──
shot(15, push(320, 420, 0.98, 1.04), function (u, d, t) {
  var s = paper() + floor(470, -200, 840) + floor(740, -200, 840);
  for (var i = 0; i < 10; i++) { var row = Math.floor(i / 5), x = 100 + (i % 5) * 112, kk = at(u, .2 + i * .15, .3); s += G("", person(x + 20, row ? 740 : 470, .55, { shirt: i === 7 ? GREY : SHIRT_V }), .3 + .7 * kk);
    if (i !== 7) s += G("", C(x + 10, (row ? 740 : 470) - 250, 12, ORANGE, 2), at(u, 1.2 + i * .08, .3)); }
  return s + numBox("9 / 10", 320, 70, at(u, 1.8, .3), 44);
});
// ── 16 · and the eye? ──
shot(16, push(320, 400, 1.1, 1.18), function (u, d, t) { return paper() + eyeFront(320, 400, 1.6, 1, t) + T("؟", 540, 220, 120, ORANGE, 800); }, { tr: "in" });
// ── 17 · an extra fold of skin over the eyelid; one idea: it shielded the eye from cold and snow glare ──
shot(17, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + G("", eyeFront(320, 200, .95, 0, t) + T("جفن بثنية", 320, 300, 22, MUTE, 700), .9) + eyeFront(320, 470, .95, 1, t + 1);
  s += label(320 - 118, 470 - 4, 230, 640, "طية جلد", ORANGE, at(u, .6, .5), 28);
  s += iconBox(510, 650, 170, snowflake(-40, -10, 28) + '<circle cx="34" cy="-14" r="18" fill="#f2c94c" stroke="' + INK + '" stroke-width="2"/>' + (function () { var q = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + t; q += '<path d="M' + f(34 + Math.cos(a) * 24) + ' ' + f(-14 + Math.sin(a) * 24) + ' l' + f(Math.cos(a) * 10) + ' ' + f(Math.sin(a) * 10) + '" stroke="#d2a52b" stroke-width="3"/>'; } return q; })() + T("برد ولمعة تلج", 0, 50, 18, INK, 700), at(u, 3.4, .4));
  return s + G("", T("رأي من الآراء", 160, 760, 22, MUTE, 700), at(u, 3.8, .4));
});
// ── 18 · lighter skin: weaker sun in the north, the body still has to make vitamin D ──
shot(18, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var cx = 360, cy = 420, r = 230, lo = 100 + u * 1.2, la = 20, s = paper() + sun(-120, 420, 150, t) + globe(cx, cy, r, lo, la);
  var eq = gp(cx, cy, r, lo, la, [100, 2]), nn = gp(cx, cy, r, lo, la, [105, 48]);
  s += arrow(90, eq[1], eq[0] - 10, eq[1], ORANGE, 9, at(u, .3, .5)) + arrow(90, nn[1] + 40, nn[0] - 14, nn[1] + 4, ORANGE, 4, at(u, .6, .5));
  s += label(eq[0], eq[1], 470, 700, "شمس قوية", ORANGE, at(u, .9, .5), 24) + label(nn[0], nn[1], 420, 110, "شمس أضعف", BLUE, at(u, 1.3, .5), 24);
  ["#8a5a3c", "#a8704e", "#c58a68", "#d9a186", "#e8c2a8"].forEach(function (c, i) { s += G("", R(555, 600 - i * 95, 46, 70, c, 2, 6), at(u, 1.8 + i * .15, .3)); });
  return s + tag("فيتامين د", 300, 700, at(u, 3, .3), 30, OLIVE);
});
// ── 19 · the myth: all of Asia looks the same — no ──
shot(19, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + globe(320, 420, 260, 85 + u * 1.6, 35) + tag("آسيا كلها شكل واحد؟", 320, 110, at(u, .2, .3), 34, INK) + cross(320, 420, 2.4, at(u, d - .9, .5));
});
// ── 20 · Asia holds India, the Arabs and Siberia; these features are only in the east ──
shot(20, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var cx = 320, cy = 430, r = 270, lo = 82 + u * 1.2, la = 38, s = paper() + globe(cx, cy, r, lo, la);
  function pin(ll, tx, ty, w, col, k) { var p = gp(cx, cy, r, lo, la, ll); return p ? label(p[0], p[1], tx, ty, w, col, k, 26) : ""; }
  s += pin([78, 22], 200, 760, "الهند", OLIVE, at(u, .2, .5)) + pin([45, 24], 170, 560, "العرب", OLIVE, at(u, .9, .5)) + pin([100, 63], 160, 110, "سيبيريا", OLIVE, at(u, 1.6, .5));
  var e = gp(cx, cy, r, lo, la, [118, 35]); if (e) s += G("", '<circle cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" r="' + f(70 + 4 * Math.sin(t * 3)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>', at(u, 2.6, .4)) + label(e[0], e[1] + 70, 480, 760, "الشرق بس", ORANGE, at(u, 2.8, .5), 26);
  return s;
});
// ── 21 · the brain is tuned to the faces it grew up with — and they see us as alike, too ──
shot(21, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + floor(760, -200, 840), k2 = at(u, d * .62, .4);
  s += G("translate(640 0) scale(-1 1)", person(500, 760, .62, { shirt: SHIRT_R, hair: HAIR })) + person(470, 760, .62, { shirt: SHIRT_V, hair: BLACKH });
  s += G("", bubble(170, 240, 270, 150, 40) + headIcon(95, 240, .9, BLACKH) + T("=", 133, 252, 34, ORANGE, 800) + headIcon(170, 240, .9, BLACKH) + T("=", 208, 252, 34, ORANGE, 800) + headIcon(245, 240, .9, BLACKH), at(u, .5, .4));
  s += G("", bubble(470, 140, 270, 150, -40) + headIcon(395, 140, .9, HAIR) + T("=", 433, 152, 34, ORANGE, 800) + headIcon(470, 140, .9, HAIR) + T("=", 508, 152, 34, ORANGE, 800) + headIcon(545, 140, .9, HAIR), k2);
  return s;
});
// ── 22 · recap: small group → mountains → gene → the features repeat ──
shot(22, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var s = paper(), ys = [110, 290, 470, 650];
  s += G("", crowd(200, ys[0], 70, 12, FEW, 1, t), at(u, .2, .3)) + G("", peaks([[150, ys[1] + 40], [200, ys[1] + 40], [250, ys[1] + 40]], 90, 1), at(u, 1.3, .3));
  s += G("", G("translate(200 " + (ys[2] - 70) + ") scale(.6)", helix(0, 0, 230, t, 4, 1)), at(u, 2.4, .3)) + G("", headIcon(140, ys[3], 1.1) + headIcon(200, ys[3], 1.1) + headIcon(260, ys[3], 1.1), at(u, 3.5, .3));
  ["مجموعة صغيرة", "جبال عزلتها", "جين انتشر", "ملامح اتكررت"].forEach(function (w, i) { s += callout(String(i + 1), 330, ys[i], at(u, .2 + i * 1.1, .3)) + G("", T(w, 610, ys[i] + 10, 32, i === 3 ? ORANGE : INK, 800, "start"), at(u, .3 + i * 1.1, .3)); });
  return s;
});
// ── 23 · the odd fact: scientists put the gene into mice — thicker hair and more sweat glands ──
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.6, 1.2);
  return paper() + floor(560, -200, 840) + mouse(300, 470, 1.15, k, t) + G("", helix(560, 120, 220, t, 7, 1), at(u, .3, .3)) + arrow(520, 290, 440, 360, ORANGE, 5, at(u, .8, .4)) +
    label(330, 400, 220, 220, "شعر أتخن", ORANGE, at(u, 2.4, .5), 26) + inset(180, 680, 90, G("scale(.4) translate(-250 -150)", skinCut(0, 0, 500, 6, k, t)), at(u, 3.2, .4)) + label(270, 680, 330, 760, "غدد عرق أكتر", BLUE, at(u, 3.6, .5), 24);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: three people side by side (China, Japan, Korea). line 1: same eye shape, same black straight hair.
  // line 2: thousands of km, seas and three unrelated languages between them
  var s = '<path d="M-20 610 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 610, 660, 80, "#e3d7bd", 0), sp = li >= 2 ? ease((t - LN[2].start) / .8) * 30 : 0;
  var xs = [130 - sp, 320, 510 + sp], names = ["الصين", "اليابان", "كوريا"], shirts = [SHIRT_V, SHIRT_R, "#9aa27a"];
  xs.forEach(function (x, i) { s += person(x + 20, 610, .95, { shirt: shirts[i] }) + T(names[i], x, 650, 26, INK, 800); });
  if (li >= 1) { var u = t - LN[1].start; s += label(328, 610 - .95 * 372, 230, 150, "نفس شكل العين", ORANGE, ease(u / .5), 26) + label(345, 610 - .95 * 404, 420, 110, "نفس الشعر", ORANGE, ease((u - 2) / .5), 26); }
  if (li >= 2) { var v = t - LN[2].start; s += measure(xs[0] + 40, 200, xs[1] - 40, 180, ease(v / .6), "") + measure(xs[1] + 40, 200, xs[2] - 40, 180, ease(v / .6), "") +
    ["صيني", "ياباني", "كوري"].map(function (w, i) { return tag(w, xs[i], 60, ease((v - 2 - i * .3) / .3), 22, BLUE); }).join(""); }
  return s;
};
SCENE.bumper = function (u, t) { return globe(90, 100, 72, 95 + u * 25, 28, { dot: [113, 35] }); };
SCENE.outro = function (svg, u, t) {
  var cx = 150, cy = 140, r = 120, lo = 75, la = 22;
  return globe(cx, cy, r, lo, la) + draw(routePath(cx, cy, r, lo, la, ROUTE), 1, ORANGE, 4, ' stroke-dasharray="8 6"') + G("translate(380 20) scale(.4)", helix(0, 0, 600, t, 7, 1)) + headIcon(520, 120, 1.2) +
    callout("1", gp(cx, cy, r, lo, la, [37, 6])[0], gp(cx, cy, r, lo, la, [37, 6])[1], ease(u / .3)) + callout("2", gp(cx, cy, r, lo, la, [88, 28])[0], gp(cx, cy, r, lo, la, [88, 28])[1] - 16, ease(u / .3 - .5)) +
    callout("3", 380, 150, ease(u / .3 - 1)) + callout("4", 560, 70, ease(u / .3 - 1.5));
};
