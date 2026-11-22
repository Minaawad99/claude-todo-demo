window.CHUNKS = [[0.0, 0.36, 0.72], [0.0, 0.3582, 0.4776], [0.0], [0.0, 0.3889], [0.0, 0.5256, 0.8205], [0.0, 0.358, 0.5556], [0.0], [0.0, 0.3426, 0.6667], [0.0, 0.3789, 0.7895], [0.0, 0.5], [0.0, 0.4086, 0.7527], [0.0, 0.3085, 0.4894, 0.7553], [0.0, 0.3333, 0.6818], [0.0], [0.0, 0.2979], [0.0, 0.3333, 0.8205], [0.0, 0.3725, 0.7451], [0.0, 0.4035], [0.0, 0.45], [0.0, 0.4667], [0.0, 0.5303], [0.0, 0.3298, 0.6064, 0.8404], [0.0, 0.1239, 0.3186, 0.4602, 0.7257], [0.0, 0.2342, 0.4955, 0.7748], [0.0, 0.5636], [0.0, 0.5556], [0.0, 0.5]];
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

// ── "How your body gets donated blood back" — Here's the Deal (English) version of videos/blood-donation.
// The same sketch engine in a lighter, cleaner, friendlier look (lighter paper, softer ink, rounded Nunito type, LTR labels).
// Shapes are redrawn from real references (refs/SOURCES.md): the kidney from the Blausen kidney-anatomy plate (cortex rim,
// 7 pyramids, calyces and pelvis, artery and vein at the hilum, the ureter), red cells as biconcave discs, the femur cut
// open with red marrow in the spongy head and yellow marrow in the shaft (adults), a real blood bag (hanger slot, ports,
// label). The donation arm is the person kit's close-up (PERSON.forearm), after the user's source video.

// ── the Here's the Deal look ──
INK = "#2f2b27"; PAPER = "#f7f2e8"; ORANGE = "#e0613f"; BLUE = "#3f82b8"; OLIVE = "#5f9447"; MUTE = "#948b80";
PERSON.setInk(INK);
function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + sz + 'px Nunito;fill:' + (col || INK) + '">' + text + '</text>'; }
function N(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:900 ' + sz + 'px Nunito;fill:' + (col || INK) + '">' + text + '</text>'; }
// leader-line label, left to right: the name sits past the end of the line, on the side the line goes
function label(px, py, lx, ly, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 22;
  var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tx = lx + (left ? -8 : 8), ty = ly + sz * 0.35;
  var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="4" fill="' + INK + '"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 800, left ? "end" : "start") + '</g>';
  return s;
}
// a rounded word tag (friendlier than the square one)
function tag(text, x, y, k, sz, col) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 30; var w = text.length * sz * .56 + 36; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * 1.05) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" rx="' + f(sz * .8) + '" fill="#fffaf0" stroke="' + INK + '" stroke-width="2.2"/>' + T(text, 0, sz * .32, sz, col || INK, 900)); }

var PS = PERSON.colors, BLOOD = "#c62f3e", BLOOD_D = "#8f1f2c", PLASMA = "#f2dc8e", CELL = "#fbefe4", CELLN = "#e5cdb6", VEINW = "#e39a9a",
    BONE = "#f3ead2", BONE_D = "#dccfa9", RED_M = "#d9574f", YEL_M = "#f1d27a", KID = "#cf6a55", KID_C = "#e0907a", PYR = "#a8473c", PELV = "#efd59c";

// a red blood cell: a biconcave disc (Blausen 0761): the rim full red, the thin middle paler, a shade along the dimple's upper edge
function rbc(x, y, r, rot, col) { col = col || "#d23a45"; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')"><ellipse rx="' + f(r) + '" ry="' + f(r * .68) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.3"/><ellipse cy="' + f(r * .03) + '" rx="' + f(r * .56) + '" ry="' + f(r * .34) + '" fill="#ee8a8a"/><path d="M' + f(-r * .5) + ' ' + f(-r * .05) + ' Q0 ' + f(-r * .42) + ' ' + f(r * .5) + ' ' + f(-r * .05) + '" stroke="#a52a35" stroke-width="' + f(Math.max(1, r * .14)) + '" fill="none" opacity=".55" stroke-linecap="round"/></g>'; }

// ── the donation arm: the person kit's close-up forearm and hand, the cut window over the vein, the needle, the tube, the bag ──
function donorArm(o) {
  var t = o.t || 0, wx = 300, wy = 330, s = "", k = clamp(o.k == null ? 1 : o.k);
  s += R(-120, wy + 52, 520, 20, "#e4dccb", 2, 10) + R(20, wy + 72, 24, 170, "#ddd4c0", 2, 4);
  s += PERSON.forearm({ x: wx, y: wy, s: 1.3, len: 440, curl: .06 + .04 * Math.sin(t * 1.3), spread: .5, sw: 2.2 });
  var tube = "M256 " + (wy - 6) + " C340 " + (wy - 8) + " 320 " + (wy + 150) + " 400 " + (wy + 170) + " S470 " + (wy + 150) + " 480 " + (wy + 186);
  s += '<path d="' + tube + '" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="' + tube + '" stroke="#f4efe6" stroke-width="6" fill="none" stroke-linecap="round"/>';
  if (o.flow !== false && k > 0) s += '<path d="' + tube + '" stroke="' + BLOOD + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 6" stroke-dashoffset="' + f(-t * 40) + '"/>';
  // the needle hub and a round plaster over it
  s += R(206, wy - 18, 52, 22, "#ffffff", 2, 6) + '<rect x="190" y="' + (wy - 30) + '" width="36" height="42" rx="10" fill="#f1e2c4" stroke="' + INK + '" stroke-width="1.8"/>' + '<circle cx="200" cy="' + (wy - 18) + '" r="1.6" fill="#d8c398"/><circle cx="214" cy="' + (wy - 18) + '" r="1.6" fill="#d8c398"/><circle cx="200" cy="' + (wy - 2) + '" r="1.6" fill="#d8c398"/><circle cx="214" cy="' + (wy - 2) + '" r="1.6" fill="#d8c398"/>';
  if (o.win !== false) {
    var X0 = 10, X1 = 184, Y0 = wy - 40, Y1 = wy + 30, id = "aw" + (++CLIPN);
    s += '<clipPath id="' + id + '"><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" rx="10"/></clipPath><g clip-path="url(#' + id + ')">';
    s += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="#f7e4b0"/><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="9" fill="' + PS.skin + '"/>';
    for (var i = 0; i < 9; i++) s += '<circle cx="' + f(X0 + 10 + i * 21) + '" cy="' + f(Y0 + 15 + (i % 2) * 44) + '" r="6" fill="none" stroke="#e6cf8e" stroke-width="1.2"/>';
    s += R(X0 - 4, wy - 22, X1 - X0 + 8, 34, VEINW, 1.6) + '<rect x="' + (X0 - 4) + '" y="' + (wy - 17) + '" width="' + (X1 - X0 + 8) + '" height="24" fill="' + BLOOD_D + '"/>';
    for (i = 0; i < 9; i++) { var cx = X1 + 10 - ((i * 23 + t * 34) % (X1 - X0 + 20)); s += rbc(cx, wy - 5 + (i % 3 - 1) * 5, 6.5, 10 + i * 30); }
    s += '<path d="M202 ' + (wy - 7) + ' L82 ' + (wy - 4) + ' L72 ' + (wy - 1) + ' L82 ' + (wy - 1) + ' L202 ' + (wy - 3) + ' Z" fill="#dfe4e8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '</g><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" rx="10" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  }
  if (o.bag !== false) s += bloodBag(480, 500, k, t);
  return s;
}
// a real blood bag: a pillowy PVC pouch with a hanger slot, two capped ports on top, a printed label; the level rises with k
function bloodBag(cx, top, k, t, sc) {
  sc = sc || 1; var w = 140 * sc, h = 190 * sc, x = cx - w / 2, y = top + 14 * sc, lv = y + h - 10 * sc - (h - 30 * sc) * clamp(k), s = "", id = "bg" + (++CLIPN);
  var body = 'M' + f(x + 10 * sc) + ' ' + f(y) + ' H' + f(x + w - 10 * sc) + ' Q' + f(x + w + 4 * sc) + ' ' + f(y + h * .5) + ' ' + f(x + w - 8 * sc) + ' ' + f(y + h) + ' H' + f(x + 8 * sc) + ' Q' + f(x - 4 * sc) + ' ' + f(y + h * .5) + ' ' + f(x + 10 * sc) + ' ' + f(y) + ' Z';
  s += R(cx - 34 * sc, top, 12 * sc, 18 * sc, "#e8e4dc", 1.6, 3) + R(cx + 22 * sc, top, 12 * sc, 18 * sc, "#e8e4dc", 1.6, 3) + R(cx - 34 * sc, top - 4 * sc, 12 * sc, 6 * sc, "#9ab7cf", 1.2, 2) + R(cx + 22 * sc, top - 4 * sc, 12 * sc, 6 * sc, "#9ab7cf", 1.2, 2);
  s += '<path d="' + body + '" fill="#fbf8f2"/><clipPath id="' + id + '"><path d="' + body + '"/></clipPath>';
  if (k > 0) s += '<g clip-path="url(#' + id + ')"><path d="M' + f(x - 5) + ' ' + f(lv) + ' Q' + f(cx - w / 4) + ' ' + f(lv - 3 * Math.sin(t * 3)) + ' ' + f(cx) + ' ' + f(lv) + ' T' + f(x + w + 5) + ' ' + f(lv) + ' V' + f(y + h + 5) + ' H' + f(x - 5) + ' Z" fill="' + BLOOD + '"/><rect x="' + f(x) + '" y="' + f(lv) + '" width="' + f(w) + '" height="' + f(5 * sc) + '" fill="#e0606a"/></g>';
  s += '<path d="' + body + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.4 * sc) + '"/>';
  s += '<rect x="' + f(cx - 12 * sc) + '" y="' + f(y + 8 * sc) + '" width="' + f(24 * sc) + '" height="' + f(9 * sc) + '" rx="' + f(4.5 * sc) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + f(1.6 * sc) + '"/>';
  // the label: white, a coloured band and the blood type
  s += '<rect x="' + f(x + 24 * sc) + '" y="' + f(y + 56 * sc) + '" width="' + f(w - 48 * sc) + '" height="' + f(74 * sc) + '" rx="' + f(5 * sc) + '" fill="#ffffff" stroke="' + INK + '" stroke-width="' + f(1.4 * sc) + '"/><rect x="' + f(x + 24 * sc) + '" y="' + f(y + 56 * sc) + '" width="' + f(w - 48 * sc) + '" height="' + f(16 * sc) + '" rx="' + f(5 * sc) + '" fill="' + BLUE + '"/>' +
       T("O+", cx, y + 112 * sc, 34 * sc, BLOOD, 900) + '<path d="M' + f(x + 34 * sc) + ' ' + f(y + 120 * sc) + ' h' + f(w - 68 * sc) + '" stroke="#c9c2b6" stroke-width="' + f(2 * sc) + '"/>';
  for (var i = 1; i <= 4; i++) { var gy = y + h - 10 * sc - (h - 30 * sc) * i / 4; s += '<path d="M' + f(x + w - 8 * sc) + ' ' + f(gy) + ' h' + f(-(i % 2 ? 10 : 16) * sc) + '" stroke="' + INK + '" stroke-width="' + f(1.5 * sc) + '"/>'; }
  return s;
}
// a pint counter in a dark pill and the minutes under it
function pintBox(x, y, k, kc) { k = clamp(k); return numBox((ease(k)).toFixed(1) + " pint", x, y, kc == null ? 1 : kc, 36, true) + T(Math.floor(10 * ease(k)) + " of 10 min", x, y + 48, 20, MUTE, 800); }

// a blood vessel in cross-section: wall ring, lumen with cells; sq 0..1 = how much it narrows
function vesselX(cx, cy, r, sq, t) {
  var rr = r * (1 - .22 * sq), s = C(cx, cy, rr + 16, VEINW, 2.2) + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(rr + 7) + '" fill="#f0b8b0"/>' + C(cx, cy, rr, "#9e2633", 2);
  for (var i = 0; i < 7; i++) { var a = i * 2.4 + t * .6, d = rr * (.25 + .45 * hash(i)); s += rbc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr * .18, i * 40 + t * 30); }
  return s;
}
// the heart: ventricles, the aorta arch and the big veins; beat 0..1
function heart(cx, cy, sc, beat) {
  var b = 1 + .06 * beat; return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc * b) + ')',
    '<path d="M-8 -52 C-8 -78 30 -80 32 -58 L30 -40" fill="none" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M-8 -52 C-8 -78 30 -80 32 -58 L30 -40" fill="none" stroke="#dc5b4d" stroke-width="11" stroke-linecap="round"/>' +
    '<path d="M-30 -46 V-70" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M-30 -46 V-70" stroke="#6f8fc4" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M-6 -46 C-40 -60 -62 -30 -54 0 C-46 30 -12 50 6 66 C18 44 52 22 54 -8 C56 -40 30 -56 -6 -46 Z" fill="#dc5b4d" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M-2 -40 C10 -10 4 30 6 64" stroke="#a83c34" stroke-width="2.4" fill="none"/><path d="M-40 -30 C-30 -36 -16 -36 -8 -30" stroke="#f3a596" stroke-width="4" fill="none" stroke-linecap="round"/>');
}
function gauge(cx, cy, r, a, lab) {
  var s = '<path d="M' + f(cx - r) + ' ' + f(cy) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(cx + r) + ' ' + f(cy) + ' Z" fill="#fffaf0" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i <= 10; i++) { var b = Math.PI + i / 10 * Math.PI; s += '<path d="M' + f(cx + Math.cos(b) * r * .82) + ' ' + f(cy + Math.sin(b) * r * .82) + ' L' + f(cx + Math.cos(b) * r * .95) + ' ' + f(cy + Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 1.4 : 3) + '"/>'; }
  s += '<path d="M' + f(cx - r * .7) + ' ' + f(cy) + ' A' + f(r * .7) + ' ' + f(r * .7) + ' 0 0 1 ' + f(cx - r * .7 * Math.cos(.6 * Math.PI)) + ' ' + f(cy - r * .7 * Math.sin(.6 * Math.PI)) + '" stroke="#9fd18a" stroke-width="6" fill="none" opacity=".0"/>';
  var g = Math.PI + a * Math.PI; s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(g) * r * .78) + ' ' + f(cy + Math.sin(g) * r * .78) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + C(cx, cy, 6, INK, 0);
  return s + (lab ? T(lab, cx, cy + 32, 22, INK, 800) : "");
}
// tissue cut: cells above and below a capillary; water drops drifting into the vessel (k 0..1)
function tissue(t, k, cells) {
  var s = R(30, 120, 580, 560, "#fbeee4", 2.4, 18), i, j, x, y;
  for (j = 0; j < 2; j++) for (i = 0; i < 6; i++) { x = 80 + i * 96 + (j % 2) * 30; y = j ? 590 : 210; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="40" ry="34" fill="' + CELL + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x + 6) + '" cy="' + (y - 4) + '" r="9" fill="' + CELLN + '" stroke="' + INK + '" stroke-width="1"/>'; }
  for (j = 0; j < 2; j++) for (i = 0; i < 5; i++) { x = 130 + i * 96 + (j % 2) * 30; y = j ? 505 : 295; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="36" ry="28" fill="' + CELL + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x - 6) + '" cy="' + (y + 2) + '" r="8" fill="' + CELLN + '" stroke="' + INK + '" stroke-width="1"/>'; }
  s += '<rect x="30" y="360" width="580" height="80" fill="#f3b3ad"/><path d="M30 360 H610 M30 440 H610" stroke="' + INK + '" stroke-width="2" stroke-dasharray="10 6"/>';
  var nc = cells == null ? 12 : cells; for (i = 0; i < nc; i++) s += rbc(640 - ((i * 53 + t * 46) % 660), 380 + (i * 37 % 44), 9, i * 50);
  for (i = 0; i < 14; i++) {
    var sx = 60 + hash(i) * 520, sy = i % 2 ? 250 + hash(i + 3) * 60 : 480 + hash(i + 5) * 70, ty = 375 + hash(i + 9) * 50, p = clamp(k * 1.6 - hash(i + 7) * .6), loop = (t * .5 + hash(i + 2)) % 1;
    var yy = lerp(sy, ty, clamp(p + loop * .3 * (p > 0 && p < 1 ? 1 : 0))), xx = sx - p * 40;
    s += drop(xx, yy, 7, "#8cc0e6");
  }
  return s;
}
// a measuring tube of blood: level lv pints out of 10, a dark pill with the reading
function bloodTube(cx, top, h, lv, t, tagK) {
  var w = 70, y1 = top + h, ly = y1 - h * .92 * lv / 10, s = '<path d="M' + (cx - w / 2) + ' ' + top + ' V' + f(y1 - 30) + ' A35 35 0 0 0 ' + (cx + w / 2) + ' ' + f(y1 - 30) + ' V' + top + '" fill="#fbf8f2" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + (cx - w / 2 + 3) + ' ' + f(ly) + ' Q' + cx + ' ' + f(ly - 4 * Math.sin(t * 2.5)) + ' ' + (cx + w / 2 - 3) + ' ' + f(ly) + ' V' + f(y1 - 30) + ' A32 32 0 0 1 ' + (cx - w / 2 + 3) + ' ' + f(y1 - 30) + ' Z" fill="' + BLOOD + '"/>';
  for (var i = 1; i <= 10; i++) { var gy = y1 - h * .92 * i / 10; s += '<path d="M' + (cx - w / 2) + ' ' + f(gy) + ' h' + (i % 2 ? 12 : 22) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return s + numBox(lv.toFixed(1) + " pt", cx + 104, f(ly + 10), tagK == null ? 1 : tagK, 26, true);
}
// a blood sample magnified: plasma with n cells
function sample(cx, cy, r, n, t) { var s = "", i; for (i = 0; i < n; i++) { var a = hash(i) * 6.283 + t * .15, d = r * .82 * Math.sqrt(hash(i + 20)); s += rbc(Math.cos(a) * d, Math.sin(a) * d, r * .13, hash(i + 4) * 180 + t * 20); } return inset(cx, cy, r, '<circle r="' + r + '" fill="' + PLASMA + '"/>' + s); }
// the kidney cut lengthwise (Blausen 0592): capsule, cortex, 7 pyramids pointing to the hilum, calyces, pelvis, ureter, artery, vein
function kidney(cx, cy, sc) {
  var s = '<path d="M30 -10 C70 -14 96 -6 120 -2" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M30 -10 C70 -14 96 -6 120 -2" stroke="#d94a3f" stroke-width="8" fill="none"/>' +
    '<path d="M30 14 C70 14 96 22 120 26" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M30 14 C70 14 96 22 120 26" stroke="#5f80c4" stroke-width="8" fill="none"/>' +
    '<path d="M24 30 C44 60 32 120 38 180" stroke="' + INK + '" stroke-width="11" fill="none"/><path d="M24 30 C44 60 32 120 38 180" stroke="' + PELV + '" stroke-width="7" fill="none"/>' +
    '<path d="M0 -92 C-50 -96 -76 -50 -74 2 C-72 56 -46 96 2 92 C30 90 40 66 28 40 C18 22 18 -20 28 -40 C40 -64 30 -90 0 -92 Z" fill="' + KID + '" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M-2 -80 C-44 -82 -62 -44 -62 2 C-62 48 -40 82 0 80 C16 74 16 52 10 36 C4 14 4 -16 12 -34 C18 -54 16 -76 -2 -80 Z" fill="' + KID_C + '"/>';
  var c = [8, 0], i;
  for (i = 0; i < 7; i++) { var a = (115 + i * 21.7) * Math.PI / 180, bx = c[0] + Math.cos(a) * 64, by = c[1] + Math.sin(a) * 74, ax = c[0] + Math.cos(a) * 30, ay = c[1] + Math.sin(a) * 34, nx = -Math.sin(a) * 13, ny = Math.cos(a) * 13;
    s += '<path d="M' + f(bx + nx) + ' ' + f(by + ny) + ' Q' + f(bx + Math.cos(a) * 6) + ' ' + f(by + Math.sin(a) * 6) + ' ' + f(bx - nx) + ' ' + f(by - ny) + ' L' + f(ax) + ' ' + f(ay) + ' Z" fill="' + PYR + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M' + f(lerp(bx, ax, .2)) + ' ' + f(lerp(by, ay, .2)) + ' L' + f(lerp(bx, ax, .75)) + ' ' + f(lerp(by, ay, .75)) + '" stroke="#c96b5e" stroke-width="1" opacity=".8"/>';
    s += '<path d="M' + f(ax) + ' ' + f(ay) + ' L' + f(c[0] + Math.cos(a) * 14 + 8) + ' ' + f(c[1] + Math.sin(a) * 18) + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M' + f(ax) + ' ' + f(ay) + ' L' + f(c[0] + Math.cos(a) * 14 + 8) + ' ' + f(c[1] + Math.sin(a) * 18) + '" stroke="' + PELV + '" stroke-width="5" stroke-linecap="round"/>'; }
  s += '<path d="M2 -26 C14 -22 24 -10 30 -4 L32 14 C24 22 14 30 2 30 C10 14 10 -12 2 -26 Z" fill="' + PELV + '" stroke="' + INK + '" stroke-width="1.6"/>';
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')', s);
}
// the femur cut lengthwise (adult): compact bone round the outside, red marrow in the spongy head, neck, trochanter and the
// knee end, yellow marrow down the shaft. Cells leave the head through a vessel when out > 0.
function femurShapes() { return [
  'M-90 -238 A46 46 0 1 1 -34 -282 L18 -222 L-6 -188 Z',
  'M-34 -200 C-36 -238 6 -284 42 -288 C74 -284 74 -244 54 -216 L34 -170 L-30 -170 Z',
  'M-30 -200 C-26 -60 -28 80 -32 210 L32 210 C28 80 26 -60 34 -200 Z',
  'M-32 196 C-62 214 -80 258 -68 298 C-52 320 -22 312 0 298 C22 312 52 320 68 298 C80 258 62 214 32 196 Z']; }
function boneCut(cx, cy, sc, t, out) {
  var sh = femurShapes(), s = "", i, id = "fm" + (++CLIPN);
  sh.forEach(function (d) { s += '<path d="' + d + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'; });
  sh.forEach(function (d) { s += '<path d="' + d + '" fill="' + BONE + '"/>'; });
  // spongy ends with red marrow: head, neck, trochanter, the knee end
  var sp = '<circle cx="-62" cy="-262" r="34"/><path d="M-40 -246 L12 -216 L-8 -192 L-24 -200 Z"/><path d="M-20 -196 C-20 -230 10 -268 40 -272 C62 -268 60 -240 44 -218 L22 -176 L-18 -176 Z"/><path d="M-20 200 C-48 216 -62 252 -54 284 C-40 298 -18 292 0 282 C18 292 40 298 54 284 C62 252 48 216 20 200 Z"/>';
  s += '<clipPath id="' + id + '">' + sp + '</clipPath><g clip-path="url(#' + id + ')"><rect x="-120" y="-320" width="240" height="640" fill="' + RED_M + '"/>';
  for (i = 0; i < 60; i++) { var x = -100 + (i % 10) * 22 + (Math.floor(i / 10) % 2) * 11, y = -300 + Math.floor(i / 10) * 18; s += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="none" stroke="#f6dcc4" stroke-width="2.4"/>'; }
  for (i = 0; i < 24; i++) { var x2 = -60 + (i % 6) * 22 + (Math.floor(i / 6) % 2) * 11, y2 = 210 + Math.floor(i / 6) * 22; s += '<circle cx="' + x2 + '" cy="' + y2 + '" r="7" fill="none" stroke="#f6dcc4" stroke-width="2.4"/>'; }
  for (i = 0; i < 6; i++) s += rbc(-64 + (i % 3) * 16 - 8, -270 + Math.floor(i / 3) * 18 + 3 * Math.sin(t * 2 + i), 5, i * 33);
  s += '</g>' + sp.replace(/<(circle|path) /g, '<$1 fill="none" stroke="' + BONE_D + '" stroke-width="1.6" ');
  // the shaft's marrow cavity: yellow (fatty) marrow in adults
  s += '<path d="M-16 -168 C-14 -60 -16 80 -18 196 L18 196 C16 80 14 -60 18 -168 Z" fill="' + YEL_M + '" stroke="' + BONE_D + '" stroke-width="1.6"/>';
  for (i = 0; i < 10; i++) s += '<circle cx="' + ((i % 2) * 14 - 7) + '" cy="' + (-150 + i * 34) + '" r="5" fill="#f7e2a6"/>';
  s = G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')', s);
  if (out) { var hx = cx - 40 * sc, hy = cy - 262 * sc, p1 = [hx + 120, hy - 20], p2 = [hx + 170, hy - 140], p3 = [hx + 290, hy - 170], vp = "M" + f(hx) + " " + f(hy) + " C" + f(p1[0]) + " " + f(p1[1]) + " " + f(p2[0]) + " " + f(p2[1]) + " " + f(p3[0]) + " " + f(p3[1]);
    s += '<path d="' + vp + '" stroke="' + INK + '" stroke-width="30" fill="none" stroke-linecap="round"/><path d="' + vp + '" stroke="#f3b3ad" stroke-width="25" fill="none" stroke-linecap="round"/>';
    for (i = 0; i < 10; i++) { var u = ((i / 10 + t * .35 * out) % 1), q = 1 - u, bx = q * q * q * hx + 3 * q * q * u * p1[0] + 3 * q * u * u * p2[0] + u * u * u * p3[0], by = q * q * q * hy + 3 * q * q * u * p1[1] + 3 * q * u * u * p2[1] + u * u * u * p3[1]; s += rbc(bx, by, 8, i * 40); } }
  return s;
}
function bar(x, y, w, k, col, name) { return T(name, x, y - 14, 24, INK, 800, "start") + R(x, y, w, 30, "#fbf8f2", 2.2, 15) + (k > .02 ? '<rect x="' + f(x + 3) + '" y="' + (y + 3) + '" width="' + f((w - 6) * clamp(k)) + '" height="24" rx="12" fill="' + col + '"/>' : ""); }
function calPage(x, y, w, word, k) { return appear(k, R(x - w / 2, y - w * .45, w, w * .9, "#fffaf0", 2.4, 14) + '<path d="M' + f(x - w / 2) + ' ' + f(y - w * .23) + ' V' + f(y - w * .31) + ' Q' + f(x - w / 2) + ' ' + f(y - w * .45) + ' ' + f(x - w / 2 + 14) + ' ' + f(y - w * .45) + ' H' + f(x + w / 2 - 14) + ' Q' + f(x + w / 2) + ' ' + f(y - w * .45) + ' ' + f(x + w / 2) + ' ' + f(y - w * .31) + ' V' + f(y - w * .23) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' + [-.25, 0, .25].map(function (p) { return R(x + p * w - 4, y - w * .52, 8, 18, INK, 0, 4); }).join("") + T(word, x, y + w * .18, w * .17, INK, 900)); }
function drop(x, y, r, col) { return '<path d="M' + f(x) + ' ' + f(y - r * 1.6) + ' C' + f(x + r * .7) + ' ' + f(y - r * .6) + ' ' + f(x + r) + ' ' + f(y) + ' ' + f(x + r) + ' ' + f(y + r * .25) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x - r) + ' ' + f(y + r * .25) + ' C' + f(x - r) + ' ' + f(y) + ' ' + f(x - r * .7) + ' ' + f(y - r * .6) + ' ' + f(x) + ' ' + f(y - r * 1.6) + ' Z" fill="' + (col || "#8cc0e6") + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(x - r * .35) + '" cy="' + f(y - r * .1) + '" rx="' + f(r * .18) + '" ry="' + f(r * .3) + '" fill="#fff" opacity=".7"/>'; }
function donor(x, y, s, t, face, arms) { return PERSON.front({ x: x, y: y, s: s, outfit: { base: "casual", colors: { shirt: "#7fb2d9", shirtD: "#5f93bd" } }, breath: (Math.sin(t * 2) + 1) / 2, head: { tilt: 2 * Math.sin(t * .9) }, face: Object.assign({ eyes: (t % 3.7) < .12 ? .05 : 1, mouth: "smile" }, face || {}), arms: arms }).svg; }
// a chocolate-chip cookie and a juice box (the snack after donating)
function cookie(x, y, r) { var s = C(x, y, r, "#d9a35b", 2.2); for (var i = 0; i < 6; i++) s += '<circle cx="' + f(x + Math.cos(i * 1.9) * r * .55) + '" cy="' + f(y + Math.sin(i * 1.9) * r * .5) + '" r="' + f(r * .12) + '" fill="#5a3a22"/>'; return s; }
function juice(x, y, sc) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')', R(-26, -40, 52, 80, "#f2a33a", 2.2, 6) + R(-26, -40, 52, 16, "#e0613f", 2.2, 6) + '<circle cy="8" r="13" fill="#ffd34d" stroke="' + INK + '" stroke-width="1.6"/><path d="M14 -40 L22 -66" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M14 -40 L22 -66" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>'); }

// ── stage chip (HUD) ──
function stageChip(n, word) { return function (u, t) { return '<rect x="400" y="26" width="216" height="52" rx="26" fill="' + INK + '"/>' + T("STEP " + n, 420, 60, 20, "#fff", 900, "start") + T(word, 600, 60, 20, "#ffd27a", 800, "end"); }; }
hud(7, 9, stageChip("1", "minutes"));
hud(10, 13, stageChip("2", "1–2 days"));
hud(14, 20, stageChip("3", "weeks"));

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · about ten pints in the body; the bag is a tenth of it
shot(4, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.6, 1.2);
  return paper() + donor(170, 520, 1.05, t) + bloodTube(430, 150, 440, 10 - k, t, at(u, .5, .3)) +
    G("", bloodBag(430, 600, k, t, .55), at(u, 1.4, .3)) + G("", N("1/10", 560, 700, 44, ORANGE), at(u, 2.2, .4));
});
// 5 · a three-step emergency plan
shot(5, push(320, 400, 1.06, 0.98), function (u, d, t) {
  var s = paper() + draw("M70 400 H570", at(u, .1, .8), INK, 3);
  [["minutes", heart(0, 0, .7, Math.max(0, Math.sin(t * 7)))], ["a day or two", drop(0, 6, 30)], ["weeks", G("rotate(-90) scale(.2)", boneCut(0, 0, 1, t, 0))]].forEach(function (p, i) {
    var x = 120 + i * 200, k = at(u, .5 + i * .5, .35);
    s += callout(String(i + 1), x, 400, k, 22) + appear(k, G("translate(" + x + " 260)", p[1])) + G("", T(p[0], x, 484, 26, i === 2 ? ORANGE : INK, 900), k);
  });
  return s + tag("emergency plan", 320, 640, at(u, 2.2, .3), 34, ORANGE);
});
// 6 · the arm with a full bag
shot(6, push(300, 400, 0.92, 1.0), function (u, d, t) { return paper() + donorArm({ k: 1, t: t }) + pintBox(460, 110, 1) + T("?", 120, 210, 120, ORANGE, 900); });
// 7 · vessels squeeze, the heart beats a bit faster, the pressure stays steady
shot(7, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var sq = at(u, .4, 1.2), bpm = Math.round(lerp(72, 85, at(u, 1.6, 1.2))), beat = Math.max(0, Math.sin(t * lerp(7.5, 9, sq)));
  return paper() + vesselX(170, 300, 110, sq, t) + arrow(170, 120, 170, 165, BLUE, 4, sq) + arrow(170, 480, 170, 435, BLUE, 4, sq) + arrow(-10, 300, 35, 300, BLUE, 4, sq) + arrow(350, 300, 305, 300, BLUE, 4, sq) +
    label(230, 210, 330, 140, "blood vessel", OLIVE, at(u, .3, .4), 24) + heart(470, 300, 1.2, beat) + numBox(String(bpm), 470, 440, at(u, 1.2, .3), 34, true) + T("beats/min", 470, 482, 20, MUTE, 800) +
    gauge(320, 650, 110, .5 + .02 * Math.sin(t * 3), "pressure: steady");
});
// 8 · a thumb over a garden hose
shot(8, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .6, 1), reach = lerp(180, 380, k), s = paper();
  s += R(0, 600, 640, 200, "#b9d58f", 2) + '<path d="M0 600 Q160 590 320 600 T640 600" stroke="#8fb866" stroke-width="3" fill="none"/>';
  s += '<path d="M-40 520 C40 540 60 380 140 380" stroke="' + INK + '" stroke-width="30" fill="none"/><path d="M-40 520 C40 540 60 380 140 380" stroke="#5aa56a" stroke-width="24" fill="none"/>';
  s += R(140, 366, 30, 28, "#e0b54a", 2, 4) + '<path d="M170 ' + f(372 + 6 * k) + ' L170 ' + f(388 - 6 * k) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 26; i++) { var p = ((i / 26) + t * .9) % 1, x = 172 + p * reach, y = 380 - Math.sin(p * Math.PI) * (110 * (1 - .3 * k)) + p * p * 260 * (1 - k * .35); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(4.5 - 2 * p) + '" fill="#8cc0e6"/>'; }
  s += PERSON.hand([110, 410], -0.25, "fist", -1, 2.2, null, false);
  s += G("", '<path d="M' + f(172 + reach) + ' 600 v-40" stroke="' + ORANGE + '" stroke-width="4"/>' + T("end of the yard", 172 + reach + 10, 548, 24, ORANGE, 900, "end"), at(u, 1.4, .4));
  return s + iconBox(540, 140, 140, vesselX(0, 0, 40, .3 + .3 * Math.sin(t * 2), t), at(u, .3, .3));
});
// 9 · "when does the actual amount come back?": 9 pints, a question mark
shot(9, push(320, 400, 1.06, 1.0), function (u, d, t) { return paper() + bloodTube(250, 140, 470, 9, t, 1) + T("?", 480, 340, 150, ORANGE, 900); });
// 10 · water between the cells is pulled into the vessels, like a sponge dripping
shot(10, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + tissue(t, at(u, .4, d - .6)) + label(430, 210, 470, 92, "your cells", OLIVE, at(u, .3, .4), 24) + label(300, 440, 340, 720, "blood vessel", OLIVE, at(u, .8, .4), 24) +
    iconBox(90, 70, 110, '<rect x="-36" y="-30" width="72" height="34" rx="8" fill="#f3d55b" stroke="' + INK + '" stroke-width="2"/><circle cx="-14" cy="-14" r="5" fill="#d9b93e"/><circle cx="12" cy="-18" r="4" fill="#d9b93e"/><circle cx="20" cy="-6" r="3" fill="#d9b93e"/>' + drop(0, 18 + ((t * 30) % 22), 6), at(u, 1.6, .3));
}, { tr: "in" });
// 11 · the volume is back in a day or two; drink lots of water
shot(11, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.6), gl = at(u, 1.6, 1.2);
  return paper() + bloodTube(200, 140, 470, 9 + k, t, 1) + calPage(470, 230, 170, "1–2 days", at(u, .3, .3)) +
    '<path d="M420 430 L436 600 H504 L520 430 Z" fill="#fbf8f2" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(lerp(434, 422, gl)) + ' ' + f(lerp(598, 450, gl)) + ' H' + f(lerp(506, 518, gl)) + ' L504 598 H436 Z" fill="#a9d2ef"/>' + T("drink water", 470, 652, 26, BLUE, 900);
});
// 12 · watered down: fewer red cells in the same plasma
shot(12, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + sample(170, 360, 130, 34, t) + G("", sample(470, 360, 130, 20, t), at(u, .5, .3)) + T("before", 170, 540, 28, INK, 900) + G("", T("now", 470, 540, 28, BLUE, 900) + tag("watered down", 470, 640, at(u, 1, .3), 28, BLUE), at(u, .5, .3));
});
// 13 · who notices?
shot(13, push(320, 400, 1.0, 1.08), function (u, d, t) { return paper() + sample(260, 400, 170, 20, t) + T("?", 510, 450, 170, ORANGE, 900); });
// 14 · the kidneys sense less oxygen
shot(14, push(300, 400, 0.98, 1.06), function (u, d, t) {
  var k = at(u, .8, 1.2);
  return paper() + appear(at(u, 0, .4), kidney(250, 410, 2.0)) + label(140, 300, 70, 150, "kidney", OLIVE, at(u, .3, .5), 30) +
    T("oxygen O₂", 520, 150, 24, INK, 900) + R(440, 170, 160, 30, "#fbf8f2", 2.2, 15) + '<rect x="443" y="173" width="' + f(154 * lerp(.9, .55, k)) + '" height="24" rx="12" fill="' + BLUE + '"/>' + arrow(520, 230, 520, 290, ORANGE, 5, k);
});
// 15 · a hormone (EPO) to the bone marrow: "work overtime"
shot(15, push(320, 420, 1.0, 0.95), function (u, d, t) {
  var s = paper() + kidney(130, 230, 1.1) + boneCut(470, 470, .86, t, 0), vp = "M200 230 C320 200 330 280 400 250";
  s += '<path d="' + vp + '" stroke="' + INK + '" stroke-width="20" fill="none" stroke-linecap="round"/><path d="' + vp + '" stroke="#f3b3ad" stroke-width="15" fill="none" stroke-linecap="round"/>';
  for (var i = 0; i < 6; i++) { var p = ((i / 6) + u * .45) % 1, q = 1 - p, x = q * q * q * 200 + 3 * q * q * p * 320 + 3 * q * p * p * 330 + p * p * p * 400, y = q * q * q * 230 + 3 * q * q * p * 200 + 3 * q * p * p * 280 + p * p * p * 250; if (u > .4) s += C(x, y, 7, ORANGE, 1.4); }
  return s + label(300, 222, 250, 110, "hormone (EPO)", ORANGE, at(u, .6, .4), 26) + label(440, 245, 280, 420, "red marrow", OLIVE, at(u, 1.2, .5), 26) +
    G("", '<rect x="420" y="80" width="200" height="66" rx="18" fill="#fffaf0" stroke="' + INK + '" stroke-width="2"/><path d="M460 146 L450 172 L486 146" fill="#fffaf0" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><rect x="456" y="140" width="34" height="8" fill="#fffaf0"/>' + T("work overtime!", 520, 122, 24, ORANGE, 900), at(u, 2, .3));
});
// 16 · about two million red cells every second
shot(16, push(300, 420, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .6, 2.2); return paper() + boneCut(170, 480, .95, t, .6 + 1.2 * k) + numBox(count(2000000, k), 440, 620, at(u, .3, .3), 36, true) + T("red cells every second", 440, 672, 24, INK, 800);
});
// 17 · four to six weeks
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + bar(80, 200, 480, lerp(.55, 1, at(u, .5, d - 1)), "#d23a45", "red cells") + calPage(320, 480, 220, "weeks", at(u, .2, .3)) + G("", N("4–6", 320, 690, 60, ORANGE), at(u, .6, .3)) + rbc(560 + 4 * Math.sin(t * 2), 140, 18, t * 20);
});
// 18 · iron takes longer
shot(18, push(320, 400, 1.05, 1.0), function (u, d, t) {
  return paper() + bar(80, 200, 480, 1, "#d23a45", "red cells") + bar(80, 320, 480, lerp(.12, .5, at(u, .6, d - .8)), "#9a6440", "iron (Fe)") + calPage(380, 560, 200, "longer", at(u, 1, .3)) +
    G("translate(130 560)", '<rect x="-48" y="-32" width="96" height="64" rx="12" fill="#9a6440" stroke="' + INK + '" stroke-width="2"/>' + N("Fe", 0, 13, 34, "#fffaf0"), at(u, .3, .3));
});
// 19 · wait eight weeks before donating again
shot(19, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), i; for (i = 0; i < 8; i++) { var x = 110 + (i % 4) * 140, y = 230 + Math.floor(i / 4) * 130; s += calPage(x, y, 110, "wk " + (i + 1), at(u, .1 + i * .15, .25)); }
  return s + bloodBag(320, 470, .9, t, .8) + cross(320, 560, 1.5, at(u, 1.6, .5)) + numBox("8 weeks", 320, 720, at(u, 1.4, .3), 40);
});
// 20 · the myth: "weak for good" — crossed out
shot(20, push(320, 400, 1.02, 1.1), function (u, d, t) {
  return paper() + donor(320, 560, 1.1, t, { brows: "worried", mouth: "frown", eyes: .8 }) + sample(140, 200, 90, 10, t) + T("for good?", 140, 340, 30, INK, 900) + cross(320, 320, 2.4, at(u, d * .6, .5));
});
// 21 · volume in two days, cells in a few weeks, all on its own
shot(21, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(); [["volume", "2 days", BLUE], ["red cells", "a few weeks", ORANGE]].forEach(function (r, i) { var y = 220 + i * 170, k = at(u, .3 + i * 1.1, .4);
    s += G("", R(70, y - 60, 500, 120, "#fffaf0", 2.2, 22) + T(r[0], 110, y + 12, 36, INK, 900, "start") + T(r[1], 380, y + 12, 32, r[2], 900), k) + check(530, y, 1.2, at(u, .8 + i * 1.1, .4), OLIVE); });
  return s + donor(320, 640, .55, t, { mouth: "grin" });
});
// 22 · "so basically": the four steps in a chain
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var s = paper(), items = [[160, 210, vesselX(0, 0, 55, .4 + .2 * Math.sin(t * 3), t)], [460, 210, drop(0, 10, 44)], [160, 540, kidney(0, 0, .8)], [460, 540, G("scale(.34)", boneCut(0, 40, 1, t, 0))]];
  items.forEach(function (p, i) { var k = at(u, .3 + i * .9, .4); s += appear(k, G("translate(" + p[0] + " " + f(p[1] + 8 * Math.sin(t * 2.4 + i)) + ")", p[2])) + callout(String(i + 1), p[0] - 90, p[1] - 90, k, 20); });
  return s + arrow(240, 210, 380, 210, INK, 3, at(u, 1, .3)) + arrow(420, 290, 210, 460, INK, 3, at(u, 1.9, .3)) + arrow(240, 540, 380, 540, INK, 3, at(u, 2.8, .3));
});
// 23 · the wild part: about 1% of the blood swapped every day (a red cell lives about 120 days)
shot(23, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var s = paper(), n = Math.floor(t * 1.5) % 100;
  for (var i = 0; i < 100; i++) { var x = 120 + (i % 10) * 44, y = 180 + Math.floor(i / 10) * 44; s += i === n ? '<circle cx="' + x + '" cy="' + y + '" r="22" fill="none" stroke="' + ORANGE + '" stroke-width="2.6"/>' + rbc(x, y, 15 * (.6 + .4 * ((t * 1.5) % 1)), i * 17, "#f0a24a") : rbc(x, y, 15, i * 17); }
  return s + bigNum("1%", "", 320, 700, at(u, .5, .4), ORANGE, 76) + G("", T("every day", 320, 742, 28, INK, 900), at(u, .7, .3));
});
// 24 · one pint, up to three lives: red cells, plasma, platelets
shot(24, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + bloodBag(320, 90, 1, t, .8), parts = [["red cells", BLOOD], ["plasma", PLASMA], ["platelets", "#f0b96c"]];
  parts.forEach(function (p, i) { var x = 120 + i * 200, k = at(u, .4 + i * .4, .4);
    s += arrow(320, 300, x, 360, INK, 3, k) + appear(k, '<rect x="' + (x - 28) + '" y="370" width="56" height="70" rx="10" fill="' + p[1] + '" stroke="' + INK + '" stroke-width="2"/>') + G("", T(p[0], x, 474, 22, INK, 800), k) +
      appear(at(u, 1.6 + i * .3, .4), donor(x, 720, .55, t + i, { mouth: "smile" })); });
  return s + numBox("3 lives", 520, 140, at(u, 2.6, .3), 36);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: the arm, the bag fills, the counter runs to a pint in "10 minutes". line 1: a cookie and juice, he walks out. line 2: the bag and "?"
  if (li === 0) { var l0 = LN[0], k = clamp((t - l0.start) / Math.max(1, l0.end - l0.start)); return G("translate(-30 -40) scale(.95)", donorArm({ k: k, t: t })) + pintBox(440, 60, k); }
  if (li === 1) { var u = Math.max(0, t - LN[1].start), x = 60 + u * 70, ph = u * Math.PI * 2 * .9, o = Object.assign({ x: x, s: 1.15, dir: 1, outfit: { base: "casual", colors: { shirt: "#7fb2d9", shirtD: "#5f93bd" } }, lean: 3, breath: (Math.sin(t * 2) + 1) / 2, face: { mouth: "smile" } }, PERSON.walkPose(ph, 1));
    o.y = PERSON.sideHipY(o, 610); return R(-10, 610, 640, 10, "#e4dccb", 2) + cookie(470, 200, 40) + juice(560, 210, 1.1) + PERSON.side(o).svg + G("", tag("like nothing happened", 330, 90, 1, 24, BLUE), 1); }
  return G("rotate(" + f(5 * Math.sin(t * 1.8)) + " 300 120)", bloodBag(300, 120, 1, t, 1.4)) + T("?", 300 + 10 * Math.sin(t * 2.2), 530 + 14 * Math.sin(t * 3), 130, ORANGE, 900);
};
SCENE.bumper = function (u, t) { return bloodBag(90, 40, .5 + .4 * ((Math.sin(t * 1.4) + 1) / 2), t, .62) + drop(150 + 3 * Math.sin(t * 2), 70, 12, BLOOD); };
SCENE.outro = function (svg, u, t) {
  return G("translate(80 140)", vesselX(0, 0, 40, .4, t)) + G("translate(220 150)", drop(0, 6, 36)) + G("translate(360 150)", kidney(0, 0, .55)) + G("translate(510 160) scale(.36)", boneCut(0, 0, 1, t, 0)) +
    callout("1", 40, 70, ease(u / .3)) + callout("2", 190, 80, ease(u / .3 - .5)) + callout("3", 320, 70, ease(u / .3 - 1)) + callout("4", 460, 50, ease(u / .3 - 1.5));
};
