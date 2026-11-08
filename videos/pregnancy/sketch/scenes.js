window.CHUNKS = [[0.0, 0.3276], [0.0, 0.3148], [0.0], [0.0, 0.4194], [0.0, 0.45], [0.0, 0.6557], [0.0, 0.4359, 0.7308], [0.0], [0.0, 0.5156], [0.0], [0.0], [0.0, 0.64], [0.0, 0.4651], [0.0, 0.253, 0.6867], [0.0], [0.0, 0.5238], [0.0, 0.3774, 0.8113], [0.0, 0.6757], [0.0, 0.1644, 0.8219], [0.0, 0.425], [0.0, 0.1157, 0.3471, 0.6529], [0.0, 0.5167], [0.0, 0.5556], [0.0, 0.4667, 0.8], [0.0, 0.1705, 0.4205, 0.7045], [0.0, 0.6667], [0.0], [0.0]];
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

// ── «الحمل من جوه» — drawings, after real references (refs/SOURCES.md) and the «طب إزاي؟» hand (sheets v17, v11).
var WALL = "#c9573c", LINING = "#eab7a4", CAVITY = "#f3e2d4", TUBE = "#d98b74", OVARY = "#e8c6a8", FLESH = "#e8a58e", FLESH_D = "#c98470",
    PLAC = "#6b7a42", CORD = "#a7b07a", BLOOD = "#c0452f", DRESS = "#8fa6ae", HAIR = "#4b3426", BRAIN = "#e6b2a0", BRAIN_D = "#cf917d", STEM = "#e9c7ad";

// bezier helper
function bz(p, u) { var a = 1 - u; return [a * a * a * p[0][0] + 3 * a * a * u * p[1][0] + 3 * a * u * u * p[2][0] + u * u * u * p[3][0], a * a * a * p[0][1] + 3 * a * a * u * p[1][1] + 3 * a * u * u * p[2][1] + u * u * u * p[3][1]]; }
// ── the womb from the front (a coronal cut): thick muscle wall, lining, cavity, cervix; tubes with fimbriae; ovaries
var TUBE_R = [[282, -40], [312, -100], [250, -168], [148, -128]];   // right tube, from the ovary end (u=0) into the womb (u=1)
function tubePt(u) { return bz(TUBE_R, u); }
function uterus(op) {
  op = op || {}; var s = "";
  [[1, TUBE_R], [-1, TUBE_R]].forEach(function (q) {
    var m = q[0], p = q[1].map(function (v) { return [v[0] * m, v[1]]; }), d = "M" + p[0] + " C" + p[1] + " " + p[2] + " " + p[3];
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="22" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + (op.tubeHi && m > 0 ? "#e7a58f" : TUBE) + '" stroke-width="17" fill="none" stroke-linecap="round"/>';
    s += '<path d="' + d + '" stroke="' + FLESH_D + '" stroke-width="3" fill="none" stroke-dasharray="2 9" opacity=".7"/>';
    for (var k = -3; k <= 3; k++) { var a = Math.atan2(-60, 30 * m) + k * .28; s += '<path d="M' + f(282 * m) + ' -40 l' + f(Math.cos(a) * 26 * m * (m > 0 ? 1 : -1)) + ' ' + f(Math.abs(Math.sin(a)) * 26 + 6) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M' + f(282 * m) + ' -40 l' + f(Math.cos(a) * 26 * m * (m > 0 ? 1 : -1)) + ' ' + f(Math.abs(Math.sin(a)) * 26 + 6) + '" stroke="' + TUBE + '" stroke-width="3" stroke-linecap="round"/>'; }
    s += '<ellipse cx="' + (238 * m) + '" cy="-10" rx="40" ry="26" fill="' + OVARY + '" stroke="' + INK + '" stroke-width="2.2"/><circle cx="' + (226 * m) + '" cy="-14" r="7" fill="#f6e3cf" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + (250 * m) + '" cy="-4" r="5" fill="#f6e3cf" stroke="' + INK + '" stroke-width="1.2"/>';
  });
  var outer = "M-150 -120 C-150 -205 150 -205 150 -120 C150 -10 74 80 42 140 L42 225 L-42 225 L-42 140 C-74 80 -150 -10 -150 -120 Z";
  var inner = "M-98 -118 C-40 -134 40 -134 98 -118 C64 -42 22 38 9 112 L9 205 L-9 205 L-9 112 C-22 38 -64 -42 -98 -118 Z";
  s += '<path d="' + outer + '" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.6"/><path d="' + outer + '" fill="url(#hatch)"/>';
  s += '<path d="' + inner + '" fill="' + LINING + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M-78 -112 C-34 -124 34 -124 78 -112 C50 -48 16 26 4 100 L-4 100 C-16 26 -50 -48 -78 -112 Z" fill="' + CAVITY + '" stroke="' + FLESH_D + '" stroke-width="1.4"/>';
  return s;
}
// ── cells: the fertilised egg dividing (n = 1, 2, 4, 8, 16+) inside its clear shell
function cells(x, y, r, n, t) {
  var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.12) + '" fill="#f7efe2" stroke="' + INK + '" stroke-width="1.6" opacity=".9"/>', pts = [];
  if (n <= 1) pts = [[0, 0, 1]]; else if (n === 2) pts = [[-.48, 0, .52], [.48, 0, .52]];
  else if (n === 4) pts = [[-.45, -.42, .46], [.45, -.42, .46], [-.45, .42, .46], [.45, .42, .46]];
  else if (n === 8) pts = [[0, 0, .3]].concat([0, 1, 2, 3, 4, 5, 6].map(function (k) { var a = k / 7 * 6.283; return [Math.cos(a) * .62, Math.sin(a) * .62, .36]; }));
  else for (var k = 0; k < 22; k++) { var rr = Math.sqrt(k / 22) * .78, a = k * 2.4; pts.push([Math.cos(a) * rr, Math.sin(a) * rr, .24]); }
  pts.forEach(function (p, i) { var w = 1 + .03 * Math.sin(t * 3 + i); s += '<circle cx="' + f(x + p[0] * r) + '" cy="' + f(y + p[1] * r) + '" r="' + f(p[2] * r * w) + '" fill="#f1d3bf" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(x + p[0] * r) + '" cy="' + f(y + p[1] * r) + '" r="' + f(p[2] * r * .28) + '" fill="' + FLESH_D + '"/>'; });
  return s;
}
// the blastocyst: an outer ring of cells, the inner cell mass (the future baby), a fluid cavity
function blastocyst(x, y, r, t) {
  var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#f6ead9" stroke="' + INK + '" stroke-width="2"/>';
  for (var k = 0; k < 20; k++) { var a = k / 20 * 6.283; s += '<ellipse cx="' + f(x + Math.cos(a) * r * .9) + '" cy="' + f(y + Math.sin(a) * r * .9) + '" rx="' + f(r * .16) + '" ry="' + f(r * .09) + '" transform="rotate(' + f(a * 57.3 + 90) + ' ' + f(x + Math.cos(a) * r * .9) + ' ' + f(y + Math.sin(a) * r * .9) + ')" fill="#cfd3a8" stroke="' + INK + '" stroke-width="1.2"/>'; }
  [[-.42, -.42], [-.2, -.55], [-.55, -.18], [-.3, -.28], [-.05, -.4], [-.45, 0]].forEach(function (p, i) { s += '<circle cx="' + f(x + p[0] * r) + '" cy="' + f(y + p[1] * r) + '" r="' + f(r * (.17 + .01 * Math.sin(t * 3 + i))) + '" fill="#e9a88f" stroke="' + INK + '" stroke-width="1.3"/>'; });
  return s;
}
// the egg with its ring of follicle cells, and a sperm swimming in (k: 0 far → 1 touching)
function egg(x, y, r, t) {
  var s = ""; for (var k = 0; k < 26; k++) { var a = k / 26 * 6.283 + .1; s += '<circle cx="' + f(x + Math.cos(a) * r * 1.22) + '" cy="' + f(y + Math.sin(a) * r * 1.22) + '" r="' + f(r * .16) + '" fill="#e9cfa8" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.06) + '" fill="#f8eedd" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#f3d9c2" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x - r * .15) + '" cy="' + f(y - r * .1) + '" r="' + f(r * .28) + '" fill="' + FLESH_D + '" stroke="' + INK + '" stroke-width="1.4"/>';
}
function sperm(x, y, ang, t, sc) {
  sc = sc || 1; var d = "M0 0"; for (var k = 1; k <= 20; k++) d += " L" + f(-k * 6) + " " + f(Math.sin(k * .7 - t * 14) * k * .35);
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + sc + ")", '<path d="' + d + '" stroke="' + INK + '" stroke-width="2" fill="none"/><ellipse cx="6" cy="0" rx="11" ry="7" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.8"/>');
}
// ── the embryo at 6 weeks: curled C shape, big head, heart bulge that beats, limb buds
function embryo6(x, y, sc, t) {
  var beat = 1 + .16 * Math.max(0, Math.sin(t * 9));
  var b = '<path d="M-44 -44 C-86 4 -60 78 2 80 C44 82 66 56 56 30 C48 10 34 -2 26 -20 Z" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<circle cx="-6" cy="-48" r="40" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 -60 C-20 -82 10 -86 22 -66" stroke="' + FLESH_D + '" stroke-width="2" fill="none"/>' +
    '<circle cx="-20" cy="-52" r="5" fill="' + INK + '" opacity=".75"/>' +
    '<ellipse cx="-34" cy="20" rx="9" ry="14" transform="rotate(-30 -34 20)" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="18" cy="62" rx="9" ry="13" transform="rotate(20 18 62)" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="1.8"/>' +
    '<path d="M50 34 C70 40 72 62 58 68" stroke="' + INK + '" stroke-width="2" fill="none"/>' +
    G("translate(30 6) scale(" + f(beat) + ")", '<circle r="15" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -4 Q0 -10 6 -4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>');
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", b);
}
// ── the fetus at about 10 weeks (after the 9-week photo): big head, eye, arm with a hand by the face, folded leg, cord
function fetus10(x, y, sc, t) {
  var b = '<path d="M-20 -6 C-60 20 -58 96 4 108 C54 116 82 84 72 46 C66 22 40 4 20 -2 Z" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<circle cx="-4" cy="-48" r="54" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 -84 C-20 -104 20 -104 40 -80" stroke="' + FLESH_D + '" stroke-width="2" fill="none"/>' +
    '<ellipse cx="-30" cy="-48" rx="7" ry="5" fill="' + INK + '" opacity=".8"/><path d="M-50 -24 q8 6 16 2" stroke="' + INK + '" stroke-width="1.6" fill="none"/><path d="M8 -46 q8 -8 12 2 q-4 8 -12 4" stroke="' + FLESH_D + '" stroke-width="2" fill="none"/>' +
    '<path d="M6 10 C-20 20 -34 0 -44 -12" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M6 10 C-20 20 -34 0 -44 -12" stroke="' + FLESH + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
    [0, 1, 2, 3].map(function (k) { return '<path d="M-44 -12 l' + f(-10 - k * 2) + ' ' + f(-10 + k * 6) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M-44 -12 l' + f(-10 - k * 2) + ' ' + f(-10 + k * 6) + '" stroke="' + FLESH + '" stroke-width="3" stroke-linecap="round"/>'; }).join("") +
    '<path d="M40 80 C10 96 -10 84 -24 70" stroke="' + INK + '" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M40 80 C10 96 -10 84 -24 70" stroke="' + FLESH + '" stroke-width="16" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="-30" cy="64" rx="14" ry="8" transform="rotate(-30 -30 64)" fill="' + FLESH + '" stroke="' + INK + '" stroke-width="1.8"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ") rotate(" + f(2 * Math.sin(t * 1.2)) + ")", b);
}
// ── the placenta on the womb wall and the twisted cord (red artery stripes, blue vein)
function placenta(x, y, sc, ang) {
  var d = "M-90 0 C-96 -30 -60 -44 -30 -40 C-10 -54 20 -52 34 -40 C64 -46 96 -26 90 0 C96 24 62 40 30 36 C10 48 -20 46 -36 36 C-66 42 -96 24 -90 0 Z";
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + (ang || 0) + ") scale(" + sc + ")", '<path d="' + d + '" fill="' + PLAC + '" stroke="' + INK + '" stroke-width="2.4"/><path d="' + d + '" fill="url(#hatch)"/>' +
    '<path d="M-60 -6 C-30 -16 -10 10 20 -4 C40 -14 60 0 70 -8 M-50 18 C-20 10 0 26 30 16" stroke="#4b5a2e" stroke-width="2" fill="none"/>');
}
function cord(x1, y1, cx, cy, x2, y2, t, k) {
  k = k == null ? 1 : clamp(k); if (k <= 0) return ""; var d = "M" + f(x1) + " " + f(y1) + " Q" + f(cx) + " " + f(cy) + " " + f(x2) + " " + f(y2);
  return '<path d="' + d + '" pathLength="1" stroke-dasharray="' + k + ' 1" stroke="' + INK + '" stroke-width="20" fill="none" stroke-linecap="round"/><path d="' + d + '" pathLength="1" stroke-dasharray="' + k + ' 1" stroke="' + CORD + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
    '<path d="' + d + '" pathLength="100" stroke-dasharray="4 6" stroke-dashoffset="' + f(-t * 6) + '" stroke="' + BLOOD + '" stroke-width="5" fill="none" opacity="' + f(k) + '"/><path d="' + d + '" pathLength="100" stroke-dasharray="4 6" stroke-dashoffset="' + f(-t * 6 + 5) + '" stroke="' + BLUE + '" stroke-width="4" fill="none" opacity="' + f(k) + '"/>';
}
// the embryo's sac inside the womb, placenta on the upper wall, cord to the baby (used from line 10 on)
function wombScene(t, op) {
  op = op || {}; var s = G("translate(320 420) scale(1.2)", uterus(op));
  s += '<ellipse cx="320" cy="355" rx="76" ry="62" fill="#e9f0ef" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(op.sac == null ? 1 : op.sac) + '"/>';
  if (op.plac) s += appear(op.plac, placenta(320, 300, .62, 0));
  if (op.cord) s += cord(320, 312, 350, 340, 322, 352, t, op.cord);
  s += op.big ? fetus10(320, 372, .42, t) : embryo6(318, 362, .48, t);
  return s;
}
// ── the brain cut down the middle; the vomiting centre (area postrema) at the back of the brainstem, glowing with k
function brain(x, y, sc, k, t) {
  var s = '<path d="M-160 0 C-172 -100 -72 -162 20 -156 C122 -150 176 -86 166 -12 C160 30 132 50 96 46 L40 38 C20 58 4 60 -10 50 C-60 60 -122 52 -160 0 Z" fill="' + BRAIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  ["M-130 -30 C-110 -70 -80 -60 -90 -100", "M-90 -120 C-60 -100 -40 -140 -10 -130", "M10 -140 C30 -110 60 -140 90 -120", "M110 -110 C120 -80 150 -80 150 -50", "M-140 10 C-110 0 -100 30 -70 20", "M120 -30 C110 0 140 10 150 -10"].forEach(function (d) { s += '<path d="' + d + '" stroke="' + BRAIN_D + '" stroke-width="2.4" fill="none"/>'; });
  s += '<path d="M-70 -40 C-40 -86 60 -86 92 -40 C60 -62 -40 -62 -70 -40 Z" fill="#f2d6c8" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="M8 22 C0 82 10 142 22 206 L58 206 C52 142 56 82 52 22 Z" fill="' + STEM + '" stroke="' + INK + '" stroke-width="2.2"/>';
  s += '<ellipse cx="104" cy="74" rx="56" ry="40" fill="' + BRAIN_D + '" stroke="' + INK + '" stroke-width="2.2"/>';
  for (var j = 0; j < 4; j++) s += '<path d="M' + (62 + j * 4) + ' ' + (60 + j * 8) + ' C' + (90) + ' ' + (40 + j * 10) + ' ' + (130) + ' ' + (44 + j * 10) + ' ' + (154 - j * 4) + ' ' + (70 + j * 4) + '" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".55"/>';
  if (k > 0) s += '<circle cx="56" cy="104" r="' + f(16 + 8 * Math.sin(t * 6)) + '" fill="' + ORANGE + '" opacity="' + f(.25 * k) + '"/><circle cx="56" cy="104" r="7" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(k) + '"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// ── the mother in profile (no face, as in the reference): hair bun, dress, a small bump; op.sick / op.dizzy / op.thought
function woman(x, y, sc, t, op) {
  op = op || {}; var sw = 2 * Math.sin(t * 1.4), s = "";
  s += '<rect x="-10" y="40" width="14" height="96" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><rect x="8" y="40" width="14" height="96" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M-14 132 h22 v10 h-26 Z M6 132 h24 v10 h-24 Z" fill="' + INK + '"/>';
  s += '<path d="M-24 -116 C-40 -80 -38 -10 -46 50 L44 50 C42 10 52 -30 40 -60 C34 -84 26 -104 22 -116 Z" fill="' + DRESS + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 -116 C-40 -80 -38 -10 -46 50" fill="none" stroke="#6f8790" stroke-width="5" opacity=".6"/>';
  s += '<rect x="-6" y="-132" width="14" height="18" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += G("rotate(" + f(sw) + " 0 -150)", '<circle cx="2" cy="-156" r="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 -150 C-34 -184 16 -196 28 -168 C10 -176 -6 -170 -10 -156 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2"/><circle cx="-28" cy="-166" r="13" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2"/>' +
    (op.sick ? '<circle cx="2" cy="-156" r="27" fill="#9fb27a" opacity=".35"/><path d="M34 -146 q10 -6 18 2 q8 8 16 0" stroke="' + OLIVE + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' : ""));
  s += '<path d="M14 -104 C24 -70 30 -50 22 -26" stroke="' + INK + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M14 -104 C24 -70 30 -50 22 -26" stroke="' + DRESS + '" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="22" cy="-22" r="7" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8"/>';
  if (op.dizzy) for (var k = 0; k < 4; k++) { var a = t * 3 + k * 1.57; s += T("✦", f(2 + Math.cos(a) * 40), f(-206 + Math.sin(a) * 10), 18, ORANGE, 800); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// small things: coffee, egg, meat, ice, clay, pregnancy test, a nose with smell waves, a gauge
function coffee(x, y, sc, t) { var st = ""; for (var k = 0; k < 3; k++) st += '<path d="M' + (-12 + k * 12) + ' -34 q-8 -12 0 -24 q8 -12 0 -24" stroke="' + MUTE + '" stroke-width="3" fill="none" opacity="' + f(.5 + .3 * Math.sin(t * 3 + k)) + '" transform="translate(0 ' + f(-4 * Math.sin(t * 2 + k)) + ')"/>'; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", st + '<path d="M-30 -30 L30 -30 L24 30 L-24 30 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M30 -16 q22 0 18 18 q-4 14 -22 10" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M-28 -24 L28 -24" stroke="#6b4a32" stroke-width="7"/>'); }
function eggF(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-34 0 C-40 -26 -10 -34 4 -26 C26 -36 44 -12 34 6 C40 26 8 34 -6 28 C-26 34 -42 18 -34 0 Z" fill="#fbf6ec" stroke="' + INK + '" stroke-width="2.2"/><circle cx="2" cy="0" r="12" fill="#f2b33a" stroke="' + INK + '" stroke-width="1.8"/>'); }
function meat(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-40 -6 C-40 -30 0 -36 30 -24 C48 -16 46 14 26 22 C0 32 -40 22 -40 -6 Z" fill="#b5463a" stroke="' + INK + '" stroke-width="2.2"/><path d="M-30 -10 C-20 -24 10 -26 26 -16" stroke="#f1d9c8" stroke-width="4" fill="none"/><circle cx="12" cy="4" r="6" fill="#f1d9c8"/>'); }
function ice(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", [[-22, 0, -8], [16, -6, 10], [-2, -30, 4]].map(function (c) { return '<rect x="' + (c[0] - 16) + '" y="' + (c[1] - 16) + '" width="32" height="32" rx="5" transform="rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')" fill="#dbe8ee" stroke="' + INK + '" stroke-width="2"/><path d="M' + (c[0] - 9) + ' ' + (c[1] - 8) + ' l8 -3" stroke="#fff" stroke-width="3"/>'; }).join("")); }
function clay(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-40 -10 C-40 30 40 30 40 -10 Z" fill="#a8693f" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="0" cy="-10" rx="40" ry="10" fill="#8a5433" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -14 q10 -10 22 -4 q10 -8 16 2" fill="#b98055" stroke="' + INK + '" stroke-width="1.6"/>'); }
function pregTest(x, y, sc, two, k) { var l2 = clamp(k == null ? 1 : k); return G("translate(" + f(x) + " " + f(y) + ") rotate(-20) scale(" + sc + ")", '<rect x="-24" y="-110" width="48" height="220" rx="22" fill="#f6f3ec" stroke="' + INK + '" stroke-width="2.4"/><rect x="-24" y="60" width="48" height="50" rx="20" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-12" y="-60" width="24" height="64" rx="4" fill="#e9e2d4" stroke="' + INK + '" stroke-width="1.6"/><rect x="-10" y="-48" width="20" height="5" fill="' + BLOOD + '"/>' + (two ? '<rect x="-10" y="-24" width="20" height="5" fill="' + BLOOD + '" opacity="' + f(l2) + '"/>' : "") + T("C", 22, -42, 12, INK, 700, "start") + T("T", 22, -18, 12, INK, 700, "start")); }
function noseWaves(x, y, sc, t) { var s = '<path d="M0 -40 C10 -10 30 10 26 22 C22 30 6 28 0 24" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>'; for (var k = 0; k < 3; k++) { var o = ((t * 30 + k * 26) % 78); s += '<path d="M' + f(110 - o) + ' ' + f(-20 + k * 14) + ' q-8 -8 -16 0 t-16 0" stroke="' + OLIVE + '" stroke-width="3" fill="none" opacity="' + f(1 - o / 78) + '"/>'; } return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }
function gauge(x, y, r, v, lab, col) { var a = Math.PI * (1 - clamp(v)); return '<path d="M' + f(x - r) + ' ' + f(y) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + r) + ' ' + f(y) + '" stroke="' + INK + '" stroke-width="3" fill="#f4ecdb"/><path d="M' + f(x - r * .8) + ' ' + f(y - r * .1) + ' A' + f(r * .8) + ' ' + f(r * .8) + ' 0 0 1 ' + f(x - r * .4) + ' ' + f(y - r * .7) + '" stroke="' + ORANGE + '" stroke-width="6" fill="none"/><path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * r * .82) + ' ' + f(y - Math.sin(a) * r * .82) + '" stroke="' + (col || INK) + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0) + T(lab, x, y + 34, 22, INK, 700); }
// a blood vessel cut across, its wall relaxing (k 0 tight → 1 relaxed)
function vessel(x, y, k, t) { var r = lerp(56, 92, ease(k)), w = lerp(26, 14, ease(k)), s = '<circle cx="' + x + '" cy="' + y + '" r="' + f(r + w) + '" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r + w) + '" fill="url(#hatch)"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r) + '" fill="#f1c9bd" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < 9; i++) { var a = i * 2.4 + t * .8, rr = (i % 3 + 1) / 4 * r * .8; s += '<ellipse cx="' + f(x + Math.cos(a) * rr) + '" cy="' + f(y + Math.sin(a) * rr) + '" rx="13" ry="8" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.4"/>'; } return s; }
// a little line graph that draws itself
function graph(x, y, w, h, pts, k, col, xl) { var d = pts.map(function (p, i) { return (i ? "L" : "M") + f(x + p[0] * w) + " " + f(y - p[1] * h); }).join(" "); return '<path d="M' + x + ' ' + (y - h - 10) + ' V' + y + ' H' + (x + w + 10) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + draw(d, k, col || ORANGE, 5) + (xl || []).map(function (q) { return T(q[1], x + q[0] * w, y + 30, 20, INK, 700); }).join(""); }
function hormoneDots(x1, y1, x2, y2, t, col, n, k) { var s = ""; n = n || 10; for (var i = 0; i < n; i++) { var u = ((t * .35 + i / n) % 1); if (u > (k == null ? 1 : k)) continue; var bx = lerp(x1, x2, u), by = lerp(y1, y2, u) + Math.sin(u * 12 + i) * 10; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="6" fill="' + (col || BLUE) + '" stroke="' + INK + '" stroke-width="1.2"/>'; } return s; }

// ── shots
// 4 · the egg meets the sperm in the tube
shot(4, push(330, 400, 1.0, 1.12), function (u, d, t) {
  var k = at(u, .2, d - .6), s = paper() + egg(360, 400, 110, t);
  [[60, 180, 30], [40, 400, 0], [70, 610, -30]].forEach(function (p, i) { var kk = k * (i === 1 ? 1 : .75); s += sperm(lerp(p[0], 228, kk), lerp(p[1], 400 + (i - 1) * 90 * (1 - kk), kk), p[2] * (1 - kk), t + i, 1.8); });
  return s + label(360, 290, 460, 170, "البويضة", OLIVE, at(u, .5, .5), 24);
});
// 5 · it divides while it travels along the tube: 1, 2, 4, 8 …
shot(5, push(520, 330, 1.45, 1.3), function (u, d, t) {
  var k = at(u, .2, d - .4), n = k < .25 ? 1 : k < .5 ? 2 : k < .75 ? 4 : 8, p = tubePt(.12 + .7 * k);
  return paper() + G("translate(320 420)", uterus({ tubeHi: true }) + cells(p[0], p[1], 34, n, t)) + G("", N(String(n), 420, 200, 64, ORANGE), at(u, .2, .2)) + label(570, 270, 520, 450, "الأنبوبة", OLIVE, at(u, .3, .5), 22);
});
// 6 · a week later: a ball of 100+ cells reaches the womb and plants itself in the lining
shot(6, push(320, 360, 0.95, 1.18), function (u, d, t) {
  var k = at(u, .2, 1.6), q = tubePt(lerp(.85, 1, k)), y = lerp(q[1], -60, at(u, 1.6, 1.4)), x = lerp(q[0], 50, at(u, 1.6, 1.4));
  return paper() + G("translate(320 420)", uterus() + blastocyst(x, y, 30, t)) + numBox("100+", 160, 200, at(u, .6, .3), 34) + label(370, 360, 450, 560, "بتزرع نفسها", ORANGE, at(u, 3.2, .5), 22) +
    iconBox(520, 130, 150, blastocyst(0, 0, 54, t), at(u, .8, .3));
});
// 7 · how does she know? a question over the planted ball
shot(7, push(320, 390, 1.15, 1.25), function (u, d, t) { return paper() + G("translate(320 420)", uterus() + blastocyst(50, -60, 30, t)) + T("؟", 500, 250, 150, ORANGE, 800); });
// 8 · it sends out hCG, the hormone the pregnancy test reads
shot(8, push(330, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("translate(200 330) scale(.6)", uterus() + blastocyst(50, -60, 30, t)) + hormoneDots(240, 300, 470, 380, t, BLUE, 9, at(u, .2, 1)) + pregTest(500, 470, 1.15, true, at(u, 1.6, .5)) +
    label(250, 300, 160, 560, "hCG", BLUE, at(u, .6, .5), 28);
});
// 9 · at first it doubles every two or three days
shot(9, push(320, 420, 1.05, 0.98), function (u, d, t) {
  var s = paper() + '<path d="M90 600 H560" stroke="' + INK + '" stroke-width="2.4"/>';
  [1, 2, 4, 8, 16].forEach(function (v, i) { var k = at(u, .1 + i * .3, .3), h = v * 22 * k; s += R(110 + i * 90, 600 - h, 60, h, i === 4 ? BLUE : "#9fb7c3", 2) + G("", N("×" + v, 140 + i * 90, 585 - h - 10, 28, INK), k); });
  return s + T("يومين تلاتة", 330, 650, 26, INK, 700) + arrow(110, 680, 560, 680, INK, 3, at(u, .2, 1.4));
});
// 10 · a new organ is built: the placenta
shot(10, push(320, 360, 1.0, 1.15), function (u, d, t) { return paper() + wombScene(t, { plac: at(u, .3, .8) }) + label(260, 290, 140, 160, "المشيمة", OLIVE, at(u, 1, .5), 26); }, { tr: "in" });
// 11 · it carries food and oxygen from the mother's blood to the baby (along the cord)
shot(11, push(320, 335, 1.9, 2.15), function (u, d, t) { return paper() + wombScene(t, { plac: 1, cord: at(u, .1, .8) }) + hormoneDots(300, 300, 322, 352, t * 2, BLOOD, 6, 1) + label(345, 336, 270, 280, "الحبل السري", OLIVE, at(u, .9, .5), 12); });
// 12 · week 6: the little heart starts beating
shot(12, push(320, 380, 1.0, 1.1), function (u, d, t) { return paper() + embryo6(300, 400, 2.2, t) + label(370, 413, 500, 560, "القلب", ORANGE, at(u, .5, .5), 28) + numBox("6", 140, 170, at(u, .2, .3), 44) + T("أسبوع", 140, 230, 24, INK, 700); }, { tr: "in" });
// 13 · week 10: every main organ formed, the size of a strawberry
shot(13, push(300, 400, 1.05, 0.98), function (u, d, t) {
  var straw = '<path d="M0 -30 C30 -30 40 0 26 26 C14 46 -14 46 -26 26 C-40 0 -30 -30 0 -30 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-18 -30 L0 -44 L18 -30 L6 -24 L0 -34 L-6 -24 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.6"/>' + [[-10, -6], [10, -4], [0, 14], [-14, 14], [14, 16]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="2" ry="3" fill="#f2d16a"/>'; }).join("");
  return paper() + fetus10(260, 380, 1.6, t) + appear(at(u, 1.2, .4), G("translate(520 520) scale(2)", straw)) + T("≈", 450, 530, 56, INK, 700) + numBox("10", 140, 170, at(u, .2, .3), 44) + T("أسبوع", 140, 230, 24, INK, 700);
});
// 14 · why does she vomit?
shot(14, push(320, 420, 1.1, 1.0), function (u, d, t) { return paper() + woman(300, 470, 1.7, t, { sick: true }) + T("؟", 500, 250, 140, ORANGE, 800); }, { tr: "out" });
// 15 · the placenta releases GDF15; it reaches the vomiting centre in the brainstem
shot(15, push(320, 400, 0.95, 1.05), function (u, d, t) {
  var k = at(u, .5, 1.8);
  return paper() + G("translate(140 600) scale(.75)", placenta(0, 0, 1, 0)) + brain(370, 260, 1.05, at(u, 2.2, .5), t) + hormoneDots(160, 560, 425, 370, t, BLUE, 12, k) +
    label(140, 560, 80, 470, "GDF15", BLUE, at(u, .3, .5), 26) + label(429, 369, 530, 520, "مركز القيء", ORANGE, at(u, 2.6, .5), 24);
});
// 16 · the less used to it before pregnancy, the sicker she gets
shot(16, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + woman(190, 430, 1.1, t) + woman(450, 430, 1.1, t + 1, { sick: true }) + tag("متعودة", 190, 640, at(u, .3, .3), 26, OLIVE) + tag("مش متعودة", 450, 640, at(u, .6, .3), 26, ORANGE) +
    G("", gauge(190, 170, 70, .25 * at(u, .8, .6), "قيء") + gauge(450, 170, 70, .9 * at(u, 1.1, .8), "قيء"), at(u, .7, .3));
});
// 17 · nausea peaks around week 9 and eases after the first three months
shot(17, push(320, 420, 1.0, 0.96), function (u, d, t) {
  var pts = []; for (var w = 4; w <= 20; w++) { var v = w < 9 ? (w - 4) / 5 : Math.max(.08, 1 - (w - 9) / 6); pts.push([(w - 4) / 16, v]); }
  var px = 90 + (5 / 16) * 460;
  return paper() + graph(90, 560, 460, 300, pts, at(u, .2, 2), ORANGE, [[0, "4"], [5 / 16, "9"], [8 / 16, "12"], [1, "20"]]) + G("", '<circle cx="' + f(px) + '" cy="260" r="12" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>', at(u, 1.3, .3)) + T("أسبوع", 330, 640, 24, INK, 700) +
    G("", '<rect x="' + f(90 + 8 / 16 * 460) + '" y="250" width="' + f(8 / 16 * 460) + '" height="310" fill="' + BLUE + '" opacity=".12"/>', at(u, 2.2, .4));
});
// 18 · dizziness: progesterone relaxes the vessel walls, the pressure drops
shot(18, push(320, 400, 1.05, 0.98), function (u, d, t) { var k = at(u, .8, 1.6); return paper() + vessel(240, 400, k, t) + gauge(500, 300, 80, lerp(.62, .3, k), "الضغط", BLUE) + hormoneDots(60, 200, 200, 330, t, "#d9c06a", 6, 1) + label(120, 240, 230, 150, "بروجسترون", BLUE, at(u, .3, .5), 22); });
// 19 · stand up fast and the blood can't climb to the brain in time
shot(19, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .2, .8);
  return paper() + R(110, 470, 120, 20, WOOD, 2) + R(116, 490, 12, 110, WOOD_D, 1.6) + R(212, 490, 12, 110, WOOD_D, 1.6) + R(110, 360, 18, 110, WOOD, 2) +
    woman(lerp(200, 330, k), 430, 1.3, t, { dizzy: at(u, 1, .3) > .5 }) + arrow(420, 230, 420, 520, BLOOD, 6, at(u, .9, .6)) + T("الدم", 470, 380, 26, BLOOD, 800, "end");
});
// 20 · aversions: meat, eggs, coffee — while the organs are forming
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + noseWaves(150, 220, 2, t) + meat(380, 160, 1.2) + eggF(510, 270, 1.2) + coffee(380, 380, 1.1, t) + cross(380, 160, .9, at(u, .8, .3)) + cross(510, 270, .9, at(u, 1.2, .3)) + cross(380, 380, .9, at(u, 1.6, .3)) +
    G("", embryo6(170, 560, .9, t) + tag("الأعضاء بتتكوّن", 400, 600, 1, 28, OLIVE), at(u, d * .6, .4));
});
// 21 · the myth: the baby "wants" that food — crossed out
shot(21, push(320, 400, 1.05, 1.0), function (u, d, t) {
  return paper() + embryo6(200, 430, 1.6, t) + '<path d="M320 300 C320 220 520 220 520 300 C520 370 400 370 380 360 L340 400 L350 355 C330 340 320 320 320 300 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + eggF(420, 300, 1) + cross(420, 300, 1.6, at(u, d * .62, .5));
});
// 22 · hormones change taste and smell, so the same food seems different
shot(22, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .6, 1); return paper() + noseWaves(170, 300, 2.2, t) + coffee(450, 330, 1.6, t) + G("", '<rect x="330" y="200" width="240" height="260" rx="20" fill="' + OLIVE + '" opacity=".15"/>', k) + hormoneDots(60, 520, 300, 360, t, BLUE, 7, 1) + tag("نفس الأكلة… طعم تاني", 320, 620, at(u, 1.2, .3), 28, BLUE);
});
// 23 · but craving ice or clay can mean low iron: see a doctor
shot(23, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + ice(200, 260, 1.8) + clay(450, 270, 1.6) + G("", '<circle cx="320" cy="500" r="70" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2.4"/>' + N("Fe", 320, 520, 56, "#fff"), at(u, 1, .4)) + G("", gauge(320, 680, 60, .15, "حديد", ORANGE), at(u, 1.3, .4)) + iconBox(540, 120, 110, '<path d="M-26 -30 V0 C-26 26 26 26 26 0 V-30" stroke="' + INK + '" stroke-width="5" fill="none"/><circle cx="26" cy="-34" r="7" fill="' + INK + '"/><circle cx="0" cy="26" r="12" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/>', at(u, d * .7, .3));
});
// 24 · recap: embryo → placenta → hormones → the mother's whole body
shot(24, push(320, 400, 0.94, 1.0), function (u, d, t) {
  return paper() + G("translate(140 520) scale(.85)", placenta(0, -90, .7, 0) + embryo6(0, 40, .9, t)) + hormoneDots(200, 450, 400, 330, t, BLUE, 10, at(u, .8, 1)) + woman(470, 430, 1.25, t, { sick: at(u, 2.6, .2) > .5, dizzy: at(u, 3.2, .2) > .5 }) +
    label(150, 445, 250, 300, "المشيمة", OLIVE, at(u, .4, .4), 22);
}, { tr: "out" });
// 25 · the odd fact: women who vomit early have a lower risk of miscarriage
shot(25, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, 1); return paper() + '<path d="M120 580 H520" stroke="' + INK + '" stroke-width="2.4"/>' + R(170, 580 - 260 * k, 110, 260 * k, GREY, 2) + R(360, 580 - 120 * k, 110, 120 * k, OLIVE, 2) +
    T("من غير قيء", 225, 630, 22, INK, 700) + T("بيرجّعوا", 415, 630, 22, OLIVE, 800) + T("خطر الإجهاض", 320, 200, 28, INK, 800) + arrow(500, 300, 500, 440, OLIVE, 6, at(u, 1.5, .4));
});

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = woman(200, 400, 1.55, t, { sick: li === 0, dizzy: li >= 1 });
  if (li === 0) s += coffee(450, 330, 1.5, t) + '<path d="M400 290 C360 270 330 280 300 250" stroke="' + OLIVE + '" stroke-width="4" fill="none" stroke-dasharray="8 8"/>';
  if (li === 1) s += '<path d="M380 120 C380 60 560 60 560 120 C560 180 450 180 430 170 L400 200 L410 165 C390 150 380 140 380 120 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + ice(470, 120, .9);
  if (li >= 2) { var k = ease((t - LN[2].start) / .5); s += appear(k, iconBox(470, 200, 220, '<ellipse cx="-30" cy="10" rx="54" ry="20" fill="#f6f1e2" stroke="' + INK + '" stroke-width="2.2" transform="rotate(-20 -30 10)"/>' + embryo6(55, 10, .32, t) + T("رز", -30, 80, 22, INK, 700), 1)); }
  return s;
};
SCENE.bumper = function (u, t) { return '<circle cx="90" cy="112" r="68" fill="#f3e2d4"/>' + embryo6(90, 116, .7, t); };
SCENE.outro = function (svg, u, t) {
  return G("translate(110 150) scale(.42)", uterus() + placenta(0, -70, .6, 0)) + embryo6(110, 160, .32, t) + hormoneDots(170, 150, 380, 130, t, BLUE, 7, 1) + brain(470, 120, .5, 1, t) +
    callout("1", 70, 200, ease(u / .3)) + callout("2", 150, 90, ease(u / .3 - .5)) + callout("3", 280, 100, ease(u / .3 - 1)) + callout("4", 520, 200, ease(u / .3 - 1.5));
};
