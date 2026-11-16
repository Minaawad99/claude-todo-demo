window.CHUNKS = [[0.0], [0.0, 0.587], [0.0], [0.0, 0.2708, 0.625], [0.0, 0.4737, 0.6491], [0.0, 0.7091], [0.0, 0.5507], [0.0, 0.5932], [0.0, 0.6667], [0.0, 0.4634], [0.0, 0.6667], [0.0, 0.2105, 0.5263], [0.0, 0.4032], [0.0, 0.6522], [0.0, 0.2143, 0.6143], [0.0, 0.5526], [0.0, 0.1642, 0.3582, 0.8209], [0.0, 0.5], [0.0, 0.2687, 0.7463], [0.0, 0.252, 0.6378, 0.7953], [0.0, 0.4464], [0.0], [0.0, 0.5672], [0.0, 0.1765, 0.3059, 0.4235, 0.5647], [0.0, 0.25, 0.5, 0.75], [0.0], [0.0]];
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

// ── «تكميم المعدة» — drawings. Shapes follow the «طب إزاي؟» organ look (v17: flat salmon organs, a darker wall band,
// light hatching) and real anatomy (refs/SOURCES.md): a front view of the stomach as the surgeon sees it, so the patient's
// left is on the viewer's right. The gullet comes down a little left of the middle; the fundus domes up to the right of it;
// the greater curve sweeps round the outside to the antrum and the pylorus, which hands on to the duodenum; the lesser curve
// is the short inner edge. The sleeve: a staple line from the angle of His down the inside, about a finger's width from the
// lesser curve (sized on a bougie), ending about 5 cm before the pylorus, so the antrum stays and the fundus goes.

var WALL = "#e39a82", WALLD = "#b85a44", LUMEN = "#f0c9b6", FOLD = "#c8735c", GUT = "#e8b08f", GHREL = "#bd552f",
    SHIRT = "#7f97a6", SHIRT2 = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", DRAPE = "#9fb7a8", STEEL = "#b9bcb8";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a smooth curve through points (Catmull-Rom → cubic). cont = no leading M (to join onto a path)
function curve(p, cont) {
  var d = cont ? "" : "M" + f(p[0][0]) + " " + f(p[0][1]);
  for (var i = 0; i < p.length - 1; i++) {
    var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += " C" + f(b[0] + (c[0] - a[0]) / 6) + " " + f(b[1] + (c[1] - a[1]) / 6) + " " + f(c[0] - (e[0] - b[0]) / 6) + " " + f(c[1] - (e[1] - b[1]) / 6) + " " + f(c[0]) + " " + f(c[1]);
  }
  return d;
}
function rev(p) { return p.slice().reverse(); }
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the stomach, front view, world units (it fills about 380×560 around 330,380) ──
var GC = [[300, 188], [330, 128], [392, 94], [458, 112], [503, 172], [524, 258], [524, 360], [504, 462], [462, 560], [402, 618], [336, 634], [276, 618], [222, 594], [182, 566], [156, 538]],   // greater curve, His → pylorus (bottom)
    LC = [[152, 494], [196, 497], [233, 470], [251, 420], [259, 350], [257, 270], [255, 190]],   // lesser curve, pylorus (top) → gullet (left edge)
    SL = [[300, 188], [313, 250], [318, 320], [313, 392], [303, 452], [308, 532], [336, 634]],   // the staple line, His → antrum (ends on GC[10])
    OES_L = [[255, 190], [248, 90], [240, -80]], OES_R = [[300, 188], [292, 90], [286, -80]],
    DUO = [[154, 516], [116, 520], [86, 546], [74, 600], [84, 690]];
var P_FULL = curve(GC) + " L152 494" + curve(LC, 1) + " Z",
    P_SLEEVE = curve(SL) + curve(GC.slice(10), 1) + " L152 494" + curve(LC, 1) + " Z",
    P_CUT = curve(GC.slice(0, 11)) + curve(rev(SL), 1) + " Z";
// an organ: flat fill, a darker band just inside the outline (the wall), light hatching, ink outline
function organ(d, fill, band, sw) {
  var id = "og" + (++CLIPN);
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + fill + '"/>' +
    '<g clip-path="url(#' + id + ')"><path d="' + d + '" fill="none" stroke="' + (band || WALLD) + '" stroke-width="16"/><path d="' + d + '" fill="url(#hatch)" opacity=".22"/></g>' +
    '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (sw || 2.6) + '" stroke-linejoin="round"/>';
}
// soft folds (rugae) inside the stomach, clipped to a shape
function rugae(d, op) {
  var id = "rg" + (++CLIPN), s = "";
  for (var i = 0; i < 9; i++) { var y = 150 + i * 52; s += '<path d="M120 ' + (y + 40) + ' C220 ' + (y - 10) + ' 300 ' + (y + 30) + ' 380 ' + (y - 6) + ' S500 ' + (y + 20) + ' 560 ' + (y - 20) + '" stroke="' + FOLD + '" stroke-width="2.4" fill="none" opacity="' + (op || .55) + '"/>'; }
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' + s + '</g>';
}
// a liquid filling a shape from the bottom: lvl 0..1 of the box y0..y1, the surface wobbles with t
function fillIn(d, lvl, t, y0, y1, col) {
  if (lvl <= 0) return ""; var id = "fl" + (++CLIPN), y = lerp(y1, y0, clamp(lvl)), w = "";
  for (var x = 60; x <= 600; x += 20) w += (x === 60 ? "M" : " L") + x + " " + f(y + 4 * Math.sin(x / 40 + t * 3));
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + w + ' L600 900 L60 900 Z" fill="' + (col || "#9fbccb") + '" opacity=".85"/><path d="' + w + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
}
function gullet(hl) { return organ(curve(OES_L) + " L" + OES_R[2].join(" ") + curve(rev(OES_R), 1).replace(/^ C/, " C") + " Z", hl ? "#e7a58f" : GUT, WALLD, 2.4); }
function duodenum() { var d = curve(DUO); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="46" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + GUT + '" stroke-width="41" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + WALLD + '" stroke-width="2" fill="none" opacity=".5"/>'; }
function pylorus() { return '<path d="M150 490 Q140 515 152 540" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M150 490 Q140 515 152 540" stroke="' + WALLD + '" stroke-width="3" fill="none" stroke-linecap="round"/>'; }
// staples along the staple line, drawn up to k
function staples(k, col) {
  k = clamp(k); if (k <= 0) return ""; var s = draw(curve(SL), k, col || INK, 3);
  for (var i = 0; i <= 26; i++) { var q = i / 26; if (q > k) break; var p = along(SL, q), p2 = along(SL, Math.min(1, q + .01)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    s += G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a * 180 / Math.PI) + ")", '<path d="M-4 -7 h8 M-4 7 h8" stroke="' + (col || INK) + '" stroke-width="2.6" stroke-linecap="round"/>'); }
  return s;
}
// o: {cut: 0..1 the removed part drifting away, gone: hide it, sl: staple line 0..1, hlCut: highlight the removed part,
//     fill: liquid level, ghrel: 0..1 hormone dots, folds, dimSleeve, stretch: 0..1 the sleeve widening a little}
function stomach(t, o) {
  o = o || {}; var s = duodenum() + gullet(o.hlGullet);
  var cutK = clamp(o.cut || 0), dx = 150 * ease(cutK), dy = -40 * ease(cutK), rot = 14 * ease(cutK);
  var sleeveD = P_SLEEVE;
  if (o.stretch) { var k = o.stretch, SL2 = SL.map(function (p, i) { return [p[0] + k * 30 * Math.sin(i / (SL.length - 1) * Math.PI), p[1]]; }); sleeveD = curve(SL2) + curve(GC.slice(10), 1) + " L152 494" + curve(LC, 1) + " Z"; }
  if (o.full) { s += organ(P_FULL, WALL) + (o.folds !== 0 ? rugae(P_FULL) : ""); }
  else {
    s += organ(sleeveD, o.hlSleeve ? "#e7a58f" : WALL) + (o.folds !== 0 ? rugae(sleeveD) : "");
    if (!o.gone) { var cp = organ(P_CUT, o.hlCut ? "#e9a07a" : WALL) + (o.folds !== 0 ? rugae(P_CUT) : "") + (o.hlCut ? '<path d="' + P_CUT + '" fill="' + ORANGE + '" opacity="' + f(.28 * o.hlCut) + '"/>' : "");
      s += G("translate(" + f(dx) + " " + f(dy) + ") rotate(" + f(rot) + " 420 380)", cp, 1 - .55 * cutK); }
  }
  if (o.fill) s += fillIn(o.full ? P_FULL : sleeveD, o.fill, t, 100, 640);
  if (o.ghrel) s += ghrelin(t, o.ghrel, o.full || !o.gone ? 1 : 0, dx, dy);
  s += pylorus();
  if (o.sl) s += staples(o.sl, o.slCol);
  return s;
}
// ghrelin: orange dots, most of them in the fundus and the upper body (the part that is removed), a few in the sleeve
var GDOTS = (function () { var a = [], i = 0, n = 0; while (a.length < 46 && n < 4000) { n++; var x = 300 + hash(n) * 230, y = 100 + hash(n + 999) * 420; if (y < 140 + (x - 300) * -.2 || x > 515 - Math.max(0, (y - 300)) * .25 || x < 322) continue; a.push([x, y, hash(n + 7)]); } return a; })(),
    GSLEEVE = [[282, 260], [290, 330], [278, 400], [286, 470], [268, 520]];
function ghrelin(t, k, inCut, dx, dy) {
  var s = ""; GDOTS.forEach(function (p, i) { if (!inCut) return; var r = 5.5 + 1.6 * Math.sin(t * 4 + i); s += G("", '<circle cx="' + f(p[0] + (dx || 0)) + '" cy="' + f(p[1] + (dy || 0)) + '" r="' + f(r) + '" fill="' + GHREL + '" stroke="' + INK + '" stroke-width="1.1"/>', clamp(k * 3 - p[2] * 2)); });
  GSLEEVE.forEach(function (p, i) { s += G("", '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(5 + 1.4 * Math.sin(t * 4 + i)) + '" fill="' + GHREL + '" stroke="' + INK + '" stroke-width="1.1"/>', clamp(k * 2)); });
  return s;
}

// ── people (copied from videos/choking/sketch/shots.js: real body proportions, Drillis & Contini) ──
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

// ══SHOTS══
// seconds from the start of line l to its caption chunk c
function cf(l, c) { return (LN[l].end - LN[l].start) * (window.CHUNKS[l][c] || 0); }
var GHOST = function () { return '<path d="' + P_FULL + '" fill="none" stroke="' + MUTE + '" stroke-width="2" stroke-dasharray="7 7"/>'; };
// a front view of the trunk with the stomach where it really sits: under the left ribs (viewer's right), above the navel
var TRUNK = "M150 40 C150 20 490 20 490 40 L520 300 C540 420 520 560 500 800 L140 800 C120 560 100 420 120 300 Z";
function trunk(t, o) {
  o = o || {}; var s = P(TRUNK, SKIN, 2.6) + '<path d="' + TRUNK + '" fill="url(#hatch)" opacity=".12"/>';
  s += P("M180 60 C230 200 300 260 320 280 C340 260 410 200 460 60", "none", 2.4) + '<path d="M320 40 V280" stroke="' + SKIN2 + '" stroke-width="3"/>';
  for (var i = 0; i < 4; i++) s += '<path d="M' + (200 + i * 10) + ' ' + (80 + i * 40) + ' Q260 ' + (110 + i * 40) + ' 310 ' + (100 + i * 40) + ' M' + (440 - i * 10) + ' ' + (80 + i * 40) + ' Q380 ' + (110 + i * 40) + ' 330 ' + (100 + i * 40) + '" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none"/>';
  s += '<ellipse cx="320" cy="560" rx="9" ry="12" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="2"/>';
  if (o.organ) s += G("", G("translate(262 190) scale(.42)", stomach(t, { full: 1, folds: 0 })), o.organ);
  return s;
}
// the 5 keyhole ports: camera above the navel, two on each side, one under the breastbone (liver retractor)
var PORTS = [[320, 500], [420, 400], [470, 480], [230, 410], [320, 300]];
function port(x, y, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + x + " " + y + ") scale(" + f(k) + ")", '<circle r="13" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.2"/><circle r="6" fill="' + INK + '"/>'); }
function rod(x1, y1, x2, y2, k) { k = clamp(k); if (k <= 0) return ""; var x = lerp(x2, x1, k), y = lerp(y2, y1, k), a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return '<path d="M' + f(x) + ' ' + f(y) + ' L' + x2 + ' ' + y2 + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M' + f(x) + ' ' + f(y) + ' L' + x2 + ' ' + y2 + '" stroke="' + STEEL + '" stroke-width="6" stroke-linecap="round"/>' +
    G("translate(" + x2 + " " + y2 + ") rotate(" + f(a) + ")", '<rect x="-4" y="-12" width="44" height="24" rx="5" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>'); }
// the stapler: two long grey jaws closing on the line at k
function stapler(k, t) {
  var p = along(SL, clamp(k)), p2 = along(SL, clamp(k + .02)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180 / Math.PI, o = 4 + 3 * Math.abs(Math.sin(t * 9));
  return G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a - 180) + ")", '<rect x="-6" y="' + f(-o - 12) + '" width="120" height="12" rx="3" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="' + f(o) + '" width="120" height="12" rx="3" fill="#9ea3a0" stroke="' + INK + '" stroke-width="2"/><rect x="110" y="-14" width="120" height="28" rx="6" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>');
}
function banana() { return '<path d="M-44 -18 C-30 30 30 36 48 -8 C36 4 0 14 -32 -22 Z" fill="#e8c95a" stroke="' + INK + '" stroke-width="2"/><path d="M-44 -18 l-6 -8" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M-30 -6 C-10 14 20 16 40 -2" stroke="#b99a35" stroke-width="1.6" fill="none"/>'; }
// a 1.5 L water bottle and a small tea glass (Egyptian «كوباية شاي»), lvl 0..1
function bottle(x, y, lvl) {
  var b = "M" + (x - 22) + " " + (y - 250) + " L" + (x + 22) + " " + (y - 250) + " L" + (x + 22) + " " + (y - 226) + " C" + (x + 70) + " " + (y - 190) + " " + (x + 72) + " " + (y - 150) + " " + (x + 72) + " " + (y - 120) + " L" + (x + 72) + " " + (y + 100) + " Q" + x + " " + (y + 116) + " " + (x - 72) + " " + (y + 100) + " L" + (x - 72) + " " + (y - 120) + " C" + (x - 72) + " " + (y - 150) + " " + (x - 70) + " " + (y - 190) + " " + (x - 22) + " " + (y - 226) + " Z";
  return P(b, "#e3ebea", 2.6) + fillIn(b, lvl, window.__t, y - 230, y + 108) + R(x - 26, y - 270, 52, 22, BLUE, 2, 4) + R(x - 73, y - 40, 146, 56, "#f4ecdb", 2) + N("1.5 L", x, y - 2, 26, BLUE);
}
function teaGlass(x, y, lvl) {
  var g = "M" + (x - 34) + " " + (y - 90) + " C" + (x - 26) + " " + (y - 50) + " " + (x - 30) + " " + (y - 30) + " " + (x - 24) + " " + (y + 10) + " L" + (x + 24) + " " + (y + 10) + " C" + (x + 30) + " " + (y - 30) + " " + (x + 26) + " " + (y - 50) + " " + (x + 34) + " " + (y - 90) + " Z";
  return '<ellipse cx="' + x + '" cy="' + (y + 16) + '" rx="56" ry="12" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>' + P(g, "#f1ece0", 2.4) + fillIn(g, lvl, window.__t, y - 80, y + 10, "#b5643a");
}
function bell(x, y, s, t, ring) {
  var sw = ring * 14 * Math.sin(t * 16), w = "";
  for (var i = 1; i <= 3; i++) { var r = 40 + i * 16; w += '<path d="M' + f(-r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 0 ' + f(-r * .7) + ' ' + f(r * .5) + ' M' + f(r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(r * .7) + ' ' + f(r * .5) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(clamp(ring * 1.4 - (i - 1) * .3)) + '"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", w + G("rotate(" + f(sw) + " 0 -40)", '<path d="M-34 20 C-34 -10 -30 -36 0 -38 C30 -36 34 -10 34 20 L44 30 L-44 30 Z" fill="#d9a441" stroke="' + INK + '" stroke-width="2.4"/><circle cy="38" r="8" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="-48" width="12" height="12" rx="3" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/>'));
}
function brain(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#d9a0a0") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }
function heart(x, y, sc, beatK) { var b = 1 + .06 * (beatK || 0); return G("translate(" + x + " " + y + ") scale(" + f(sc * b) + ")", '<path d="M0 34 C-60 -4 -50 -46 -18 -44 C-6 -44 0 -34 0 -28 C0 -34 6 -44 18 -44 C50 -46 60 -4 0 34 Z" fill="#c9533f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-8 -40 v-16 M8 -40 c0 -14 10 -18 20 -18" stroke="#4a6f8a" stroke-width="7" fill="none" stroke-linecap="round"/>'); }
function drop(x, y, s, col) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M0 -30 C14 -10 22 2 22 12 A22 22 0 0 1 -22 12 C-22 2 -14 -10 0 -30 Z" fill="' + (col || "#b8402f") + '" stroke="' + INK + '" stroke-width="2"/>'); }
function gauge(x, y, s, v) { var a = (-150 + 120 * v) * Math.PI / 180; return G("translate(" + x + " " + y + ") scale(" + s + ")", '<circle r="34" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 14 A28 28 0 1 1 24 14" stroke="' + ORANGE + '" stroke-width="5" fill="none" opacity=".5"/><path d="M0 0 L' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 26) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/><path d="M34 0 C60 0 60 40 30 46" stroke="' + INK + '" stroke-width="5" fill="none"/>'); }
function sleeper(x, y, s, t) { var z = ""; for (var i = 0; i < 3; i++) { var p = (t * .6 + i / 3) % 1; z += G("", T("z", 36 + p * 40 + i * 6, -20 - p * 50, 16 + 10 * p, BLUE, 800), 1 - p); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<rect x="-60" y="10" width="120" height="22" rx="6" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-6" rx="26" ry="23" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-26 -8 C-26 -36 24 -36 26 -10 C10 -22 -10 -22 -26 -8 Z" fill="' + HAIR + '"/><path d="M-12 -2 q5 4 10 0" stroke="' + INK + '" stroke-width="2" fill="none"/>' + z); }
function scale(x, y, txt, col) { return G("translate(" + x + " " + y + ") scale(1.5)", '<rect x="-74" y="-14" width="148" height="28" rx="8" fill="#e8e3d6" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-10" width="60" height="18" rx="3" fill="#f6f2e8" stroke="' + INK + '" stroke-width="1.4"/>' + N(txt, 0, 5, 13, col || INK)); }
function pills(x, y, s, t) { var p = ""; for (var i = 0; i < 5; i++) { var a = i * 1.3 + Math.sin(t * 1.5 + i) * .2; p += G("translate(" + (i * 34 - 70) + " " + (110 + 6 * Math.sin(t * 2 + i)) + ") rotate(" + f(a * 30) + ")", '<rect x="-20" y="-9" width="40" height="18" rx="9" fill="' + (i % 2 ? "#e2c25b" : "#c96a4a") + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -9 V9" stroke="' + INK + '" stroke-width="1.4"/>'); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-56, -80, 112, 150, "#f4efe3", 2.6, 12) + R(-62, -110, 124, 36, OLIVE, 2.4, 6) + R(-46, -40, 92, 64, "#e9dfc6", 1.6) + T("فيتامين", 0, -8, 18, OLIVE, 800) + T("حديد", 0, 16, 16, INK, 700) + p); }
function head(x, y, s, hair, t) {   // a side-view head (face to the left) with the hair cap; hair 0..1 how much is left
  var hs = "", N0 = 30; for (var i = 0; i < N0; i++) { if (hash(i * 3.1) > hair) continue; var a0 = (-150 + i * 5.2) * Math.PI / 180, a1 = a0 + .42, r = 63 + 3 * hash(i);
    hs += '<path d="M' + f(Math.cos(a0) * r) + ' ' + f(Math.sin(a0) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(Math.cos(a1) * r) + ' ' + f(Math.sin(a1) * r) + '" stroke="' + HAIR + '" stroke-width="9" fill="none" stroke-linecap="round"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M-16 60 L-14 110 L36 110 L36 56 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="60" ry="68" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>' + hs +
    '<path d="M-60 -6 l-16 24 l16 4" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="12" cy="4" rx="9" ry="14" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-40 -16 h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · where it is: the trunk, the stomach under the left ribs; then into the stomach, a slanting bag, filling to 1.5 L
shot(4, push(330, 340, 1.0, 1.12), function (u, d, t) {
  return paper() + trunk(t, { organ: at(u, .2, .5) }) + label(400, 260, 470, 150, "المعدة", OLIVE, at(u, .6, .5), 28) + G("", T("؟", 160, 200, 110, ORANGE, 800), at(u, .2, .3));
});
shot([4, 1], push(330, 380, 1.12, 1.0), function (u, d, t) {
  var lv = at(u, .6, 1.8) * (.84 + .02 * Math.sin(t * 2));
  return paper() + stomach(t, { full: 1, fill: lv }) + label(300, 140, 180, 70, "كيس مايل", OLIVE, at(u, .1, .4), 24) + numBox("1.5 L", 520, 700, at(u, 1.2, .3), 30);
}, { tr: "in" });
// 5 · keyhole surgery: 5 ports in the belly, long instruments in; no big cut
hud(5, 6, function (u, t) { var n = 0; PORTS.forEach(function (p, i) { if (u > .3 + i * .32) n = i + 1; }); var s = ""; for (var i = 0; i < 5; i++) s += '<circle cx="' + (232 + i * 44) + '" cy="60" r="17" fill="' + (i < n ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), 232 + i * 44, 67, 18, i < n ? "#fff" : INK); return s; });
shot(5, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var s = paper() + trunk(t, {}), c2 = cf(5, 1);
  s += G("", G("translate(262 190) scale(.42)", stomach(t, { full: 1, folds: 0 })), .35);
  PORTS.forEach(function (p, i) { s += port(p[0], p[1], at(u, .3 + i * .32, .3)); });
  var ends = [[320, 760], [600, 220], [640, 420], [20, 300], [320, 120]];
  PORTS.forEach(function (p, i) { if (i === 0 || i === 4) return; s += rod(p[0], p[1], ends[i][0], ends[i][1], at(u, 1.2 + i * .1, .5)); });
  s += label(320, 500, 170, 640, "منظار", OLIVE, at(u, 1.0, .4), 26);
  s += G("", draw("M320 120 V560", 1, ORANGE, 4, ' stroke-dasharray="10 9"'), at(u, c2, .3)) + cross(320, 360, 1.3, at(u, c2 + .3, .4));
  return s;
});
// 6 · the stapler cuts the big outer side and closes the rest in one go
shot(6, push(340, 380, 1.12, 1.0), function (u, d, t) {
  var c2 = cf(6, 1), k = at(u, .2, 2.8);
  var s = paper() + stomach(t, { hlCut: at(u, .3, .5), sl: k, slCol: k < 1 ? INK : OLIVE });
  if (k < 1) s += stapler(k, t);
  s += label(440, 300, 420, 50, "الجنب الكبير", ORANGE, at(u, .6, .5), 24) + label(310, 420, 140, 330, "دبابيس", OLIVE, at(u, c2 + .2, .5), 24);
  return s;
});
// 7 · what is left: a thin tube like a banana, about 150 ml
shot(7, push(320, 390, 1.0, 1.1), function (u, d, t) {
  var cut = at(u, 0, 1.2), lv = at(u, 1.8, 1.4) * (.86 + .02 * Math.sin(t * 2));
  return paper() + GHOST() + stomach(t, { cut: cut, gone: cut >= 1, sl: 1, slCol: OLIVE, fill: lv }) + iconBox(510, 140, 130, banana(), at(u, .8, .3)) + G("", T("زي الموزة", 510, 230, 22, OLIVE, 800), at(u, 1.0, .3)) +
    numBox("150 ml", 500, 560, at(u, 2.4, .3), 30, true) + label(300, 420, 140, 300, "الأنبوبة", OLIVE, at(u, 1.2, .5), 24);
}, { tr: "fade" });
// 8 · a big water bottle becomes a tea glass
shot(8, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper() + '<path d="M40 640 H600" stroke="' + INK + '" stroke-width="2.4"/>', k = at(u, 1.4, .5);
  s += G("", bottle(190, 520, .92), 1 - .6 * k) + G("", teaGlass(470, 620, .8), k) + arrow(290, 420, 400, 470, ORANGE, 5, at(u, 1.1, .4));
  s += G("", T("قبل", 190, 180, 28, MUTE, 800), at(u, .2, .3)) + G("", T("بعد", 470, 440, 30, ORANGE, 800), k);
  return s;
});
// 9 · so why less hunger? not only the room
shot(9, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + GHOST() + stomach(t, { gone: 1, sl: 1, slCol: OLIVE }) + G("translate(0 " + f(6 * Math.sin(t * 3)) + ")", T("؟", 470, 360, 170, ORANGE, 800), at(u, .2, .3)) + G("", T("الجوع", 470, 470, 34, INK, 800), at(u, .5, .3));
});
// 10 · the part that goes made ghrelin, the hunger bell
shot(10, push(360, 340, 1.0, 1.12), function (u, d, t) {
  return paper() + stomach(t, { full: 1, ghrel: at(u, .2, 1.4), sl: 1, slCol: "#a89f8c" }) + label(470, 250, 400, 700, "الجريلين", ORANGE, at(u, 1.0, .5), 26) +
    iconBox(150, 140, 150, bell(0, 6, .9, t, 1), at(u, cf(10, 1), .3)) + G("", T("جرس الجوع", 150, 250, 22, ORANGE, 800), at(u, cf(10, 1) + .2, .3));
});
// 11 · it is taken away, the bell goes quiet, and eating is easier to control
shot(11, push(330, 360, 1.08, 1.0), function (u, d, t) {
  var cut = at(u, .1, 1.3), q = 1 - at(u, cf(11, 1), .8);
  return paper() + stomach(t, { cut: cut, gone: cut >= 1, sl: 1, slCol: OLIVE, ghrel: 1 }) + iconBox(150, 140, 150, bell(0, 6, .9, t, .15 + .85 * q), 1) +
    G("", R(90, 240, 120, 10, "#e3d7bd", 1.6, 5) + R(90, 240, f(120 * (.2 + .8 * q)), 10, ORANGE, 1.6, 5), 1) + G("", T("صوته بيوطى", 150, 290, 22, BLUE, 800), at(u, cf(11, 1), .3)) +
    G("", check(500, 640, 1.2, at(u, cf(11, 2) + .2, .4), OLIVE) + T("أسهل", 420, 650, 28, OLIVE, 800), 1);
});
// 12 · in a year or two, about 60% of the extra weight goes
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, .4, 2.4), X0 = 110, X1 = 560, Y0 = 600, top = 230, bot = top + (Y0 - top) * .6;
  s += '<path d="M' + X0 + ' 190 V' + Y0 + ' H' + X1 + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>' + T("الوزن الزيادة", X0 + 10, 170, 22, INK, 800, "end");
  s += T("0", X0, 632, 18, INK, 700) + T("سنة", 335, 632, 18, INK, 700) + T("سنتين", X1, 632, 18, INK, 700);
  var pts = []; for (var i = 0; i <= 40; i++) { var x = i / 40; pts.push([lerp(X0, X1, x), lerp(top, bot, 1 - Math.pow(1 - Math.min(1, x * 1.25), 2.2))]); }
  s += draw(curve(pts), k, ORANGE, 5) + '<path d="M' + X0 + ' ' + top + ' H' + X1 + '" stroke="' + MUTE + '" stroke-width="1.6" stroke-dasharray="6 6"/>';
  if (k > 0) { var p = along(pts, k); s += C(p[0], p[1], 8 + Math.sin(t * 6), ORANGE, 2); }
  s += measure(X1 - 20, top, X1 - 20, bot, at(u, 2.6, .5), "") + bigNum(count(60, at(u, 2.6, 1.0)) + "%", "من الوزن الزيادة", 420, 360, at(u, 2.5, .3), ORANGE, 70);
  return s;
});
// 13 · sugar, blood pressure and snoring get better; sometimes the diabetes goes
shot(13, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), rows = [["السكر", 200], ["الضغط", 380], ["الشخير", 560]];
  s += G("", drop(470, 200, 1.6), at(u, .1, .3)) + G("", gauge(470, 380, 1.3, .8 - .4 * at(u, 1.6, 1)), at(u, .5, .3)) + G("", sleeper(470, 570, 1.1, t), at(u, .9, .3));
  rows.forEach(function (r, i) { s += G("", T(r[0], 240, r[1] + 10, 34, BLUE, 800), at(u, .1 + i * .4, .3)) + check(110, r[1], 1.1, at(u, 1.3 + i * .45, .4), OLIVE); });
  var c2 = cf(13, 1); s += G("", tag("ساعات يختفي", 330, 110, 1, 28, ORANGE), at(u, c2, .3)) + G("", cross(470, 200, 1.4, at(u, c2 + .5, .4)), 1);
  return s;
});
// 14 · who: BMI over 40, or over 35 with diabetes or high blood pressure
shot(14, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var s = paper() + floor(690), p = fig({ x: 190, y: 666 - 212, lean: 0, belly: 1, shirt: SHIRT, hands: [null, null], bend: [-1, -1] });
  var bl = p.at(48, 24), sb = p.at(14, -26); s += scale(190, 678, "BMI") + p.far + '<ellipse cx="' + f(bl[0]) + '" cy="' + f(bl[1]) + '" rx="46" ry="62" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="' + f(sb[0]) + '" cy="' + f(sb[1]) + '" rx="30" ry="40" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2.2"/>' + p.body.replace(/stroke-width="2.2" stroke-linejoin/, 'stroke-width="0" stroke-linejoin') + p.near;
  s += G("", tag("الوزن ÷ الطول²", 450, 160, 1, 24, INK), at(u, cf(14, 1) - .2, .3));
  s += numBox("40+", 450, 300, at(u, cf(14, 1) + .3, .3), 40, true);
  var c3 = cf(14, 2); s += G("", T("أو", 450, 380, 26, MUTE, 800), at(u, c3, .3)) + numBox("35+", 450, 450, at(u, c3 + .2, .3), 34) + G("", T("+", 450, 520, 34, INK, 800) + drop(400, 570, .9) + gauge(500, 570, .8, .9), at(u, c3 + .8, .3));
  return s;
});
// 15 · not for someone after 5 kilos before a wedding
shot(15, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper() + floor(690), p = fig({ x: 300, y: 666 - 212, lean: 0, shirt: "#8f7f9a", hands: [null, null], bend: [-1, -1] });
  s += scale(300, 678, "−5 kg", ORANGE) + whole(p) + iconBox(510, 140, 130, '<circle cx="-14" cy="6" r="26" fill="none" stroke="#d9a441" stroke-width="7"/><circle cx="14" cy="6" r="26" fill="none" stroke="#c0b49c" stroke-width="7"/><path d="M-14 -24 l-8 -10 h16 z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.4"/>', at(u, .3, .3)) +
    G("", T("الفرح", 510, 236, 22, INK, 800), at(u, .5, .3)) + cross(300, 300, 2.2, at(u, 1.3, .5));
  return s;
});
// 16 · the risks: bleeding or a leak from the staples, about 1 in 100
shot(16, push(320, 440, 1.6, 1.75), function (u, d, t) {
  var c3 = cf(16, 2), c4 = cf(16, 3), lk = (u - c3) * .8, s = paper() + stomach(t, { gone: 1, sl: 1, slCol: OLIVE });
  if (u > c3) for (var i = 0; i < 4; i++) { var p = ((lk + i / 4) % 1); s += G("", drop(318 + p * 60, 440 + p * 40 + i * 6, .45 + .1 * i % 2, i % 2 ? "#b8402f" : "#c9a34a"), clamp(lk * 2) * (1 - p)); }
  s += G("", tag("زي أي عملية", 320, 250, 1, 22, INK), at(u, cf(16, 1), .3)) + label(312, 400, 420, 330, "تسريب", ORANGE, at(u, c3 + .3, .5), 20) + numBox("1%", 410, 560, at(u, c4, .3), 30, true);
  return s;
}, { tr: "in" });
// 17 · reflux: the narrow tube is under pressure and pushes the acid up the gullet
shot(17, push(300, 260, 1.15, 1.05), function (u, d, t) {
  var s = paper() + stomach(t, { gone: 1, sl: 1, slCol: OLIVE, hlGullet: at(u, 1.6, .5) }), k = at(u, .8, .6);
  for (var i = 0; i < 4; i++) s += arrow(330, 260 + i * 70, 300, 260 + i * 70, BLUE, 3.5, at(u, .4 + i * .1, .3)) + arrow(220, 290 + i * 70, 250, 290 + i * 70, BLUE, 3.5, at(u, .4 + i * .1, .3));
  if (k > 0) s += '<path d="M276 330 L272 190 L266 40 L262 -60" stroke="' + ORANGE + '" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="4 18" stroke-dashoffset="' + f(t * 50) + '" opacity="' + f(k) + '"/>';
  s += label(270, 80, 420, 40, "ارتجاع", ORANGE, at(u, 1.4, .5), 26) + G("", T("ضغط", 410, 420, 26, BLUE, 800), at(u, .7, .3));
  return s;
});
// 18 · eating little: vitamins and iron for life, or anaemia
shot(18, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c2 = cf(18, 1), c3 = cf(18, 2), s = paper();
  s += G("", '<ellipse cx="320" cy="270" rx="120" ry="24" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="320" cy="262" rx="40" ry="10" fill="#c38a54" stroke="' + INK + '" stroke-width="1.6"/>' + T("أكل قليل", 320, 200, 26, INK, 800), 1 - .6 * at(u, c2, .4));
  s += G("", pills(220, 470, 1.1, t), at(u, c2, .3)) + G("", T("طول العمر", 220, 660, 24, OLIVE, 800), at(u, c2 + .4, .3));
  s += G("", drop(470, 470, 2.2, "#e2b1a8") + T("أنيميا", 470, 600, 28, ORANGE, 800), at(u, c3, .3));
  return s;
});
// 19 · hair falls about 3 months later: the body sends the little food to the heart and brain first; it grows back
shot(19, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), fall = at(u, .4, 1.4), left = 1 - .5 * fall;
  s += head(300, 400, 2.2, left, t);
  for (var i = 0; i < 6; i++) { var p = ((u * .5 + i / 6) % 1); if (u > .4) s += G("translate(" + f(160 + i * 50 + 10 * Math.sin(t * 2 + i)) + " " + f(200 + p * 420) + ") rotate(" + f(40 * Math.sin(t * 3 + i)) + ")", '<path d="M0 0 c6 10 -6 20 0 32" stroke="' + HAIR + '" stroke-width="4" fill="none" stroke-linecap="round"/>', 1 - p); }
  s += G("", tag("بعد 3 شهور", 470, 120, 1, 26, ORANGE), at(u, 1.0, .3));
  return s;
});
shot([19, 1], push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper(), q = [[heart, "القلب"], [brain, "المخ"], [null, "الشعر"]], k3 = at(u, cf(19, 2) - cf(19, 1), .4);
  s += G("", '<ellipse cx="320" cy="140" rx="90" ry="18" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="320" cy="134" rx="28" ry="7" fill="#c38a54" stroke="' + INK + '" stroke-width="1.4"/>' + T("الأكل القليل", 320, 92, 22, INK, 800), 1);
  s += G("", heart(170, 360, 1.5, Math.abs(Math.sin(t * 5))) + T("1", 170, 460, 30, OLIVE, 800), at(u, .2, .3)) + arrow(290, 170, 200, 300, OLIVE, 5, at(u, .3, .4));
  s += G("", brain(320, 380, 1.3, "#d9a0a0") + T("2", 320, 460, 30, OLIVE, 800), at(u, .8, .3)) + arrow(320, 170, 320, 320, OLIVE, 5, at(u, .9, .4));
  s += G("", G("translate(470 380)", head(0, 0, .8, .4, t)) + T("آخر واحد", 470, 480, 24, ORANGE, 800), k3 > 0 ? .4 + .6 * k3 : at(u, 1.4, .3) * .4) + G("", arrow(350, 170, 440, 300, MUTE, 3, 1), k3 * .6);
  s += G("", '<path d="M110 540 H530" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 8"/>' + T("الطابور", 320, 590, 26, MUTE, 800), at(u, 1.6, .3));
  return s;
});
shot([19, 3], push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + head(300, 420, 2.2, .5 + .5 * at(u, .3, 1.4), t) + G("", tag("بيرجع يطلع", 470, 130, 1, 28, BLUE), at(u, .2, .3)) + check(130, 140, 1.3, at(u, .6, .4), BLUE);
});
// 20 · no way back: the removed part cannot be put back
shot(20, push(330, 380, 1.0, 1.1), function (u, d, t) {
  var s = paper() + GHOST() + stomach(t, { cut: .9 + .04 * Math.sin(t * 2), sl: 1, slCol: OLIVE });
  s += '<path d="M560 250 C600 160 480 110 420 170" stroke="' + INK + '" stroke-width="4" fill="none" opacity="' + f(at(u, .5, .3)) + '"/>' + arrow(440, 150, 400, 190, INK, 4, at(u, .6, .3)) + cross(480, 160, 1.1, at(u, 1.0, .4));
  s += G("", tag("مالهاش رجوع", 330, 700, 1, 32, ORANGE), at(u, .3, .3));
  return s;
});
// 21 · the myth: it makes you thin on its own. No.
shot(21, push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + G("", tag("التكميم = تخسيس لوحده؟", 320, 260, 1, 28, INK), at(u, .2, .3)) + G("translate(0 " + f(4 * Math.sin(t * 3)) + ")", G("translate(320 480) scale(.42) translate(-330 -380)", stomach(t, { gone: 1, sl: 1, slCol: OLIVE })), at(u, .4, .3)) +
    cross(320, 260, 2.4, at(u, cf(21, 0) + 1.6, .5)) + G("", T("لأ", 320, 700, 70, ORANGE, 800), at(u, 1.9, .3));
});
// 22 · sugary drinks and sweets all day: the sleeve stretches a bit and the weight comes back
shot(22, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c2 = cf(22, 1), st = at(u, c2, 1.6);
  var can = '<rect x="-30" y="-56" width="60" height="112" rx="8" fill="#c9533f" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-20" width="60" height="34" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.4"/><ellipse cy="-56" rx="30" ry="6" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>';
  var cake = '<path d="M-40 30 L40 30 L40 -6 L-40 -6 Z" fill="#e8d2a6" stroke="' + INK + '" stroke-width="2.2"/><path d="M-40 -6 Q-30 -26 0 -24 Q30 -26 40 -6 Z" fill="#c96a8a" stroke="' + INK + '" stroke-width="2"/><circle cy="-30" r="8" fill="#c9533f" stroke="' + INK + '" stroke-width="1.6"/>';
  return paper() + G("translate(110 200) scale(.85)", can, at(u, .1, .3)) + G("translate(110 360)", cake, at(u, .5, .3)) + G("translate(80 0)", stomach(t, { gone: 1, sl: 1, slCol: OLIVE, stretch: st })) +
    arrow(500, 380, 560, 380, ORANGE, 4, st) + G("", scale(500, 700, "+ kg", ORANGE), at(u, c2 + 1.2, .3));
});
// 23 · from the end: smaller stomach, less hunger, weight down, with a doctor and a new way of eating for life
shot(23, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = [cf(23, 1), cf(23, 2), cf(23, 3), cf(23, 4)], s = paper();
  s += G("translate(320 400) scale(" + f(1 + .05 * Math.sin(t * 4)) + ") translate(-320 -400)", tag("من الآخر", 320, 400, at(u, .05, .3), 44, ORANGE), 1 - at(u, c[0] - .1, .3));
  s += G("translate(70 80) scale(.34)", stomach(t, { gone: 1, sl: 1, slCol: OLIVE }), at(u, c[0], .3)) + G("", T("معدة أصغر", 150, 340, 22, OLIVE, 800), at(u, c[0], .3));
  s += G("", bell(320, 190, .8, t, .15) + T("جوع أقل", 320, 340, 22, BLUE, 800), at(u, c[1], .3));
  s += G("", arrow(490, 120, 490, 260, ORANGE, 7, 1) + T("وزن بينزل", 490, 340, 22, ORANGE, 800), at(u, c[2], .3));
  s += G("", '<path d="M80 420 H560" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 6"/>', at(u, c[3], .3));
  var doc = fig({ x: 220, y: 700 - 212 * .8, s: .8, lean: 0, shirt: "#f2f0ea", hands: [null, null], bend: [-1, -1] });
  s += G("", whole(doc) + '<path d="M' + f(doc.at(110, 6)[0]) + ' ' + f(doc.at(110, 6)[1]) + ' q10 40 -6 60" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("دكتور", 220, 760, 22, INK, 800), at(u, c[3], .3));
  s += G("", '<ellipse cx="450" cy="620" rx="90" ry="20" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/><circle cx="420" cy="612" r="14" fill="#7e9a52" stroke="' + INK + '" stroke-width="1.6"/><circle cx="460" cy="610" r="12" fill="#c96a4a" stroke="' + INK + '" stroke-width="1.6"/><rect x="474" y="600" width="30" height="16" rx="4" fill="#e8d2a6" stroke="' + INK + '" stroke-width="1.6"/>' + T("نظام أكل جديد", 450, 700, 22, INK, 800), at(u, c[3] + .4, .3));
  return s;
});
// 24 · the odd fact: the sleeve was only the first half of a bigger two-step operation
shot(24, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), c2 = cf(24, 1), c3 = cf(24, 2), c4 = cf(24, 3);
  s += G("translate(70 120) scale(.42)", stomach(t, { gone: 1, sl: 1, slCol: OLIVE }), at(u, .2, .3)) + callout("1", 120, 130, at(u, .3, .3), 22);
  var gut = ""; for (var i = 0; i < 5; i++) gut += '<path d="M' + (380 + (i % 2) * 0) + ' ' + (180 + i * 50) + ' h150 a25 25 0 0 1 0 50 h-150 a25 25 0 0 0 0 50" stroke="' + INK + '" stroke-width="22" fill="none" opacity="0"/>';
  var bowel = '<path d="M380 180 H540 A25 25 0 0 1 540 230 H400 A25 25 0 0 0 400 280 H540 A25 25 0 0 1 540 330 H400 A25 25 0 0 0 400 380 H540" stroke="' + INK + '" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M380 180 H540 A25 25 0 0 1 540 230 H400 A25 25 0 0 0 400 280 H540 A25 25 0 0 1 540 330 H400 A25 25 0 0 0 400 380 H540" stroke="' + GUT + '" stroke-width="19" fill="none" stroke-linecap="round"/>';
  s += G("", bowel + callout("2", 600, 130, 1, 22), at(u, c2 - .4, .3) * (1 - .7 * at(u, c3, .5)));
  s += G("", T("+", 330, 300, 50, INK, 800), at(u, c2 - .4, .3)) + cross(470, 280, 1.6, at(u, c3 + .2, .4));
  s += G("", tag("كفاية لوحده", 230, 560, 1, 30, ORANGE) + check(420, 560, 1.1, at(u, c4 + .4, .4), OLIVE), at(u, c4, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the stomach with three quarters hatched in orange; line 1: half a plate, no hunger; line 2: the sleeve, stapled
  var s = "";
  if (li < 2) s += G("translate(10 30) scale(.9)", stomach(t, { hlCut: .5 + .5 * Math.abs(Math.sin(t * 2)), sl: 1, slCol: INK }));
  if (li === 0) s += G("", numBox("3/4", 470, 140, ease((t - LN[0].start - .6) / .3), 38, true), 1);
  if (li === 1) { var u = t - LN[1].start; s += G("", '<rect x="0" y="0" width="608" height="660" fill="' + PAPER + '" opacity=".75"/><ellipse cx="300" cy="380" rx="200" ry="44" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.6"/><path d="M300 380 m-90 -10 a90 22 0 0 1 90 -12 v24 Z" fill="#c38a54" stroke="' + INK + '" stroke-width="1.6"/>' + T("نص طبق", 300, 280, 40, BLUE, 800), ease(u / .4)) + check(470, 210, 1.4, ease((u - 1.4) / .4), OLIVE); }
  if (li >= 2) { var v = t - LN[2].start; s += G("translate(10 30) scale(.9)", stomach(t, { cut: ease(v / 1.2), gone: v > 1.2, sl: 1, slCol: OLIVE })) + G("", tag("التكميم", 470, 120, 1, 36, ORANGE), ease((v - .3) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(18 12) scale(.27)", stomach(t, { cut: .5 + .5 * Math.sin(t * 2), sl: 1, slCol: OLIVE, folds: 0 }));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(10 -10) scale(.45)", GHOST() + stomach(t, { cut: .7, sl: 1, slCol: OLIVE, folds: 0 })) + G("translate(330 30) scale(.42)", stomach(t, { gone: 1, sl: 1, slCol: OLIVE, fill: .8 })) +
    callout("1", 60, 50, ease(u / .3)) + callout("2", 270, 60, ease(u / .3 - .5)) + callout("3", 150, 120, ease(u / .3 - 1)) + callout("4", 470, 150, ease(u / .3 - 1.5));
};
