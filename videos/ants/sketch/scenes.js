window.CHUNKS = [[0.0], [0.0, 0.5306], [0.0, 0.4464], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.5], [0.0, 0.2537, 0.597], [0.0], [0.0, 0.5455], [0.0, 0.5957], [0.0, 0.5556], [0.0, 0.717], [0.0, 0.5789, 0.8246], [0.0, 0.5306], [0.0, 0.2245, 0.7551], [0.0, 0.5102], [0.0, 0.4677, 0.8226], [0.0, 0.619], [0.0, 0.6038], [0.0, 0.5122], [0.0, 0.375], [0.0, 0.1923, 0.5256], [0.0, 0.3409, 0.6136], [0.0, 0.2931, 0.6207], [0.0], [0.0, 0.5082], [0.0, 0.7458], [0.0, 0.3421], [0.0], [0.0, 0.3898], [0.0, 0.4483], [0.0, 0.2, 0.3867, 0.5733, 0.76], [0.0, 0.4, 0.6286, 0.8], [0.0], [0.0]];
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

// ── people helpers copied from videos/choking/sketch/shots.js (real body proportions, Drillis & Contini) ──
var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

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
// ── «النمل بيعرف مكان الأكل إزاي؟» — drawings. The ant is a worker of the black garden ant (Lasius niger, a common
// house ant) in side view, after the worker-anatomy scheme on Wikimedia Commons (refs/SOURCES.md): head with elbowed
// antennae (long scape, 11-segment funiculus), mandibles, a humped mesosoma, one petiole node, a four-segment gaster.
// Six legs from the three coxae; tripod gait (front and hind of one side with the middle of the other).
// The house is a top-down floor plan on the graph paper, the way an engineer draws it.

var BENDX = -1;
var ANT = "#4a2f22", ANT_L = "#6e4733", ANT_F = "#33221a", SUGARC = "#fbf8f0", TILE = "#e8dfcc", MARBLE = "#ece8de",
    SCENT = "#4a6f8a";

// ── the ant, side view, facing left. Feet on y = 0, body ≈ 260 long at s = 1.
// op: {walk (gait speed, 0 = still), dab 0..1 (gaster tip down to the floor), crystal, hl: "gaster" | "antenna" | "head",
//      sniff (antennae pointing down at the floor), flip (face right), dim}
function ant(x, y, s, t, op) {
  op = op || {}; var ph = t * (op.walk || 0) * 9, s2 = "", i;
  var ga = lerp(-4, 30, clamp(op.dab || 0)), gcol = op.hl === "gaster" ? ORANGE : ANT, hcol = op.hl === "head" ? ORANGE : ANT;
  var C3 = [[-56, -42], [-32, -38], [-8, -40]], FX = [-112, -34, 52], KN = [-86, -24, 30];
  function leg(j, far) {
    var p = ph + (j === 1 ? Math.PI : 0) + (far ? Math.PI : 0), fx = FX[j] + 16 * Math.sin(p) + (far ? 10 : 0), lift = Math.max(0, Math.cos(p)) * 9 * (op.walk ? 1 : 0);
    var c = [C3[j][0] + (far ? 6 : 0), C3[j][1]], kn = [KN[j] + 10 * Math.sin(p) * .6 + (far ? 8 : 0), -30 - lift * .5 + (j === 0 ? -14 : 0)], an = [fx, -8 - lift], ta = [fx + (j === 0 ? -20 : 20), -lift * .4];
    var col = far ? ANT_F : ANT, w1 = far ? 6 : 7.5, w2 = far ? 4.5 : 5.5;
    var d = "M" + f(c[0]) + " " + f(c[1]) + " L" + f(kn[0]) + " " + f(kn[1]) + " L" + f(an[0]) + " " + f(an[1]) + " L" + f(ta[0]) + " " + f(ta[1]);
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w1 + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M' + f(c[0]) + ' ' + f(c[1]) + ' L' + f(kn[0]) + ' ' + f(kn[1]) + '" stroke="' + col + '" stroke-width="' + w1 + '" stroke-linecap="round"/>' +
      '<path d="M' + f(kn[0]) + ' ' + f(kn[1]) + ' L' + f(an[0]) + ' ' + f(an[1]) + ' L' + f(ta[0]) + ' ' + f(ta[1]) + '" stroke="' + col + '" stroke-width="' + w2 + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function antenna(far) {
    var base = [-104 + (far ? 6 : 0), -86], el = [-124 + (far ? 8 : 0), -122], a, tip;
    a = op.sniff ? lerp(118, 132, (Math.sin(t * 7 + (far ? 1.4 : 0)) + 1) / 2) : 168 + 14 * Math.sin(t * 5.5 + (far ? 1.7 : 0));
    a = a * Math.PI / 180; var L = op.sniff ? 118 : 70; tip = [el[0] + Math.cos(a) * L, el[1] + Math.sin(a) * L];
    var mid = [(el[0] + tip[0]) / 2 + Math.sin(a) * 6, (el[1] + tip[1]) / 2 - Math.cos(a) * 6];
    var col = op.hl === "antenna" ? ORANGE : far ? ANT_F : ANT, d = "M" + f(base[0]) + " " + f(base[1]) + " L" + f(el[0]) + " " + f(el[1]) + " Q" + f(mid[0]) + " " + f(mid[1]) + " " + f(tip[0]) + " " + f(tip[1]);
    var r = '<path d="' + d + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    for (var k = 7; k <= 10; k++) { var q = k / 11, px = lerp(lerp(el[0], mid[0], q), lerp(mid[0], tip[0], q), q), py = lerp(lerp(el[1], mid[1], q), lerp(mid[1], tip[1], q), q); r += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2.4 + q * 1.2) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1"/>'; }
    return { svg: r, tip: tip };
  }
  // far side: legs and antenna behind the body
  s2 += antenna(true).svg; for (i = 0; i < 3; i++) s2 += leg(i, true);
  // gaster (rotates about the petiole joint when it dabs the floor)
  s2 += G("rotate(" + f(ga) + " 34 -54)", '<ellipse cx="84" cy="-58" rx="52" ry="38" fill="' + gcol + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M62 -94 Q52 -58 62 -22 M90 -95 Q80 -58 90 -21 M114 -86 Q106 -58 114 -30" stroke="' + INK + '" stroke-width="1.5" fill="none" opacity=".7"/>' +
    '<path d="M60 -84 Q86 -96 112 -80" stroke="#fff" stroke-width="4" fill="none" opacity=".18" stroke-linecap="round"/>' +
    '<path d="M134 -60 L142 -54 L134 -50 Z" fill="' + (op.hl === "gaster" ? ORANGE : ANT) + '" stroke="' + INK + '" stroke-width="1.6"/>');
  // petiole: one upright scale
  s2 += '<path d="M18 -48 L26 -76 C28 -82 36 -82 37 -75 L36 -46 Z" fill="' + ANT + '" stroke="' + INK + '" stroke-width="2"/>';
  // mesosoma: pronotum hump, mesonotum, propodeum
  s2 += '<path d="M-70 -66 C-66 -94 -40 -96 -30 -80 C-24 -72 -12 -74 -2 -76 C10 -78 20 -70 22 -56 L18 -42 C-10 -36 -42 -38 -66 -48 Z" fill="' + ANT + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M-58 -82 C-50 -90 -40 -90 -34 -84" stroke="#fff" stroke-width="3.5" fill="none" opacity=".2" stroke-linecap="round"/><path d="M-30 -80 L-26 -44 M-2 -76 L-4 -42" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/>';
  // head: long oval, compound eye, mandibles
  s2 += G("rotate(-14 -100 -72)", '<ellipse cx="-100" cy="-72" rx="34" ry="27" fill="' + hcol + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<ellipse cx="-104" cy="-80" rx="8" ry="10" fill="#1e140e" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-106" cy="-84" r="2.4" fill="#fff" opacity=".6"/>' +
    '<path d="M-90 -96 C-80 -98 -72 -92 -70 -86" stroke="#fff" stroke-width="3" fill="none" opacity=".2" stroke-linecap="round"/>') +
    '<path d="M-128 -58 Q-150 -56 -146 -40 Q-140 -46 -126 -48 Z" fill="' + ANT_L + '" stroke="' + INK + '" stroke-width="2"/>';
  // near side
  var an = antenna(false); s2 += an.svg; for (i = 0; i < 3; i++) s2 += leg(i, false);
  if (op.crystal) s2 += G("translate(-156 -42) rotate(" + f(8 + 4 * Math.sin(t * 3)) + ")", '<rect x="-15" y="-15" width="30" height="30" fill="' + SUGARC + '" stroke="' + INK + '" stroke-width="2"/><path d="M-15 -15 L-6 -22 L22 -22 L15 -15 M15 15 L22 8 L22 -22" fill="#ddd6c8" stroke="' + INK + '" stroke-width="1.6"/>');
  var tr = "translate(" + f(x) + " " + f(y) + ") scale(" + f((op.flip ? -1 : 1) * s) + " " + f(s) + ")";
  return G(tr, s2, op.op);
}
// the antenna tip (near side) in world coordinates, for leader lines: same numbers as ant()
function antTip(x, y, s) { return [x + (-100 - 70) * s, y + (-128 + 4) * s]; }

// ── a tiny ant from above (on the floor plan). a = heading in degrees (0 = +x), s ≈ 1 → 18 px long
function antTop(x, y, a, s, t, op) {
  op = op || {}; s = s || 1; var w = Math.sin((t || 0) * 22 + x * .3), col = op.col || ANT, b = "", k;
  // legs from the mesosoma: front pair forward, middle out, hind back; each bent at the knee; tripod swing
  var L = [[3, 9, -5, 15, 3], [0, 0, -8, 3, -12], [-3, -9, -6, -15, -4]];
  for (k = 0; k < 3; k++) { var sw = (k === 1 ? -w : w) * 2.2;
    b += '<path d="M' + L[k][0] + ' -1.5 L' + f(L[k][1] + sw) + ' -6 L' + f(L[k][3] + sw) + ' ' + f(L[k][2] - 4) + ' M' + L[k][0] + ' 1.5 L' + f(L[k][1] - sw) + ' 6 L' + f(L[k][3] - sw) + ' ' + f(-L[k][2] + 4) + '" stroke="' + col + '" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  b += '<path d="M12 -1.5 L15 -5 L21 -3 M12 1.5 L15 5 L21 3" stroke="' + col + '" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  b += '<ellipse cx="-11" cy="0" rx="7" ry="5.4" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/><circle cx="-3.6" cy="0" r="1.6" fill="' + col + '"/><ellipse cx="2" cy="0" rx="5.2" ry="2.6" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/><ellipse cx="10.5" cy="0" rx="3.8" ry="3.4" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/>';
  b += '<path d="M-14 -3 Q-11 -4.4 -8 -3" stroke="#fff" stroke-width="1" fill="none" opacity=".3"/>';
  if (op.crystal) b += '<rect x="14" y="-3.2" width="6.4" height="6.4" fill="' + SUGARC + '" stroke="' + INK + '" stroke-width="1"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + f(s) + ")", b, op.op);
}

// ── the floor plan: room walls, floor tiles, the kitchen counter with the spoon of sugar (top right) and the nest
// in a crack at the foot of the bottom-left wall
var NEST = [96, 676], SUGAR = [508, 176];
function plan(t, op) {
  op = op || {}; var s = "", k;
  s += R(40, 60, 560, 690, TILE, 0);
  for (k = 100; k < 600; k += 60) s += '<path d="M' + k + ' 60 V750" stroke="#d6cbb4" stroke-width="1.2"/>';
  for (k = 120; k < 750; k += 60) s += '<path d="M40 ' + k + ' H600" stroke="#d6cbb4" stroke-width="1.2"/>';
  // walls (hatched, as on a plan) with a door gap on the left
  s += '<path d="M28 48 H612 V762 H28 V470 M28 380 V48" stroke="' + INK + '" stroke-width="3" fill="none"/>' +
       '<path d="M40 60 H600 V750 H40 V470 M40 380 V60" stroke="' + INK + '" stroke-width="2" fill="none"/>' +
       '<path d="M28 48 H612 V60 H28 Z M600 48 H612 V762 H600 Z M28 750 H612 V762 H28 Z M28 48 H40 V380 H28 Z M28 470 H40 V762 H28 Z" fill="url(#hatch)" stroke="none"/>' +
       '<path d="M40 380 A90 90 0 0 1 130 470" stroke="' + INK + '" stroke-width="1.2" fill="none" stroke-dasharray="5 4"/><path d="M40 380 L40 470" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  // kitchen counter (L-shape along the top and right walls), marble top, a sink
  s += '<path d="M300 60 H600 V420 H520 V140 H300 Z" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="2.4"/>' +
       '<path d="M310 72 Q360 90 420 76 M530 200 Q560 260 540 330" stroke="#cfc8b8" stroke-width="2" fill="none"/>' +
       R(330, 76, 80, 50, "#cdd8d6", 2, 8) + C(370, 101, 4, INK, 0);
  // the spoon of sugar on the counter
  s += G("translate(" + SUGAR[0] + " " + SUGAR[1] + ") rotate(-30)", '<path d="M14 -4 L70 -6 L70 6 L14 4 Z" fill="#c9cdcd" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="0" rx="22" ry="15" fill="#c9cdcd" stroke="' + INK + '" stroke-width="2.2"/>' +
    (op.empty ? "" : '<ellipse cx="0" cy="0" rx="17" ry="11" fill="' + SUGARC + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M-8 -3 h3 M2 -6 h3 M-3 4 h3 M7 2 h3 M-12 2 h2" stroke="#b8b0a0" stroke-width="2"/>'));
  if (!op.empty) for (k = 0; k < 7; k++) s += R(SUGAR[0] - 34 + hash(k + 3) * 30, SUGAR[1] + 14 + hash(k + 8) * 20, 4, 4, SUGARC, 1);
  // the nest: a crack at the foot of the wall, dark entrance and a little spoil heap
  s += '<path d="M40 650 L58 662 L50 676 L64 690 L40 706" fill="' + INK + '" stroke="' + INK + '" stroke-width="2"/>' +
       '<ellipse cx="' + (NEST[0] - 22) + '" cy="' + NEST[1] + '" rx="16" ry="24" fill="#2a2016"/>';
  for (k = 0; k < 14; k++) s += C(NEST[0] - 10 + hash(k) * 30, NEST[1] - 22 + hash(k + 20) * 44, 2 + hash(k + 5) * 1.5, "#a08a64", .8);
  return s;
}
// a winding scout path from the nest to the sugar (loops and zigzags), 160 points
var SCOUT = (function () {
  var pts = [], n = 160, dx = SUGAR[0] - NEST[0], dy = SUGAR[1] - NEST[1], L = Math.hypot(dx, dy), px = -dy / L, py = dx / L;
  for (var i = 0; i <= n; i++) { var p = i / n, w = Math.sin(Math.PI * p), o = (150 * Math.sin(p * 7.5 + .4) + 50 * Math.sin(p * 21)) * w, lo = (14 + 22 * hash(Math.floor(p * 9))) * w;
    pts.push([NEST[0] + dx * p + px * o + lo * Math.cos(p * 46), NEST[1] + dy * p + py * o + lo * Math.sin(p * 46)]); }
  return pts;
})();
// other scouts: random walks out of the nest that turn back with nothing
function randWalk(seed, n) {
  var pts = [[NEST[0], NEST[1]]], a = -0.6 + hash(seed) * 0.9, x = NEST[0], y = NEST[1];
  for (var i = 0; i < n; i++) { a += (hash(seed * 31 + i) - .5) * 1.3; x += Math.cos(a) * 9; y += Math.sin(a) * 9;
    if (x < 70) { x = 70; a = Math.PI - a; } if (x > 580) { x = 580; a = Math.PI - a; } if (y < 300) { y = 300; a = -a; } if (y > 730) { y = 730; a = -a; } pts.push([x, y]); }
  return pts.concat(pts.slice(0, -1).reverse().filter(function (_, j) { return j % 2 === 0; }));
}
var WALKS = [2, 5, 9, 13, 17].map(function (s) { return randWalk(s, 56); });
function polyD(pts, k) { var n = Math.max(1, Math.floor((pts.length - 1) * clamp(k))), d = ""; for (var i = 0; i <= n; i++) d += (i ? " L" : "M") + f(pts[i][0]) + " " + f(pts[i][1]); return d; }
function headingAt(pts, k) { var i = Math.min(pts.length - 2, Math.max(0, Math.floor((pts.length - 1) * clamp(k)))); return Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI; }
function ptAt(pts, k) { return along(pts, k); }
// the scent trail: dots along the straight line nest → sugar. k = how much is laid (from the sugar end), str = strength 0..1
function trailLine(k, str, t, fade) {
  var s = "", n = 34, i; str = str == null ? .5 : str; fade = fade == null ? 1 : fade;
  if (str > .35) s += '<path d="' + 'M' + f(lerp(SUGAR[0], NEST[0], 0)) + ' ' + f(SUGAR[1]) + ' L' + f(lerp(SUGAR[0], NEST[0], k)) + ' ' + f(lerp(SUGAR[1], NEST[1], k)) + '" stroke="' + SCENT + '" stroke-width="' + f(6 + 22 * str) + '" opacity="' + f(.16 * str * fade) + '" stroke-linecap="round"/>';
  for (i = 0; i < n; i++) { var q = (i + .5) / n; if (q > k) break; var x = lerp(SUGAR[0], NEST[0], q) + 5 * Math.sin(i * 2.1), y = lerp(SUGAR[1], NEST[1], q) + 5 * Math.cos(i * 1.7);
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f((2.2 + 3.6 * str) * (.8 + .2 * Math.sin(t * 3 + i))) + '" fill="' + SCENT + '" opacity="' + f((.45 + .5 * str) * fade) + '"/>'; }
  return s;
}
function onTrail(q) { return [lerp(NEST[0], SUGAR[0], q), lerp(NEST[1], SUGAR[1], q)]; }
var TRAIL_A = Math.atan2(SUGAR[1] - NEST[1], SUGAR[0] - NEST[0]) * 180 / Math.PI;
// n ants going along the trail; half outbound, half coming back with a crystal
function marchers(n, t, v, k, op) {
  op = op || {}; var s = "";
  for (var i = 0; i < n; i++) { var back = i % 2, q = (i / n + t * v + hash(i) * .05) % 1; q = back ? 1 - q : q; if (q > k) continue;
    var p = onTrail(q), wob = 6 * Math.sin(t * 4 + i * 1.3), nx = -Math.sin(TRAIL_A * Math.PI / 180), ny = Math.cos(TRAIL_A * Math.PI / 180);
    s += antTop(p[0] + nx * wob, p[1] + ny * wob, back ? TRAIL_A + 180 : TRAIL_A, op.s || .8, t + i, { crystal: back }); }
  return s;
}
// scent puffs rising from a point (blue dots drifting up)
function puffs(x, y, t, n, h, k) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .6 + i / n) % 1; s += '<circle cx="' + f(x + 18 * Math.sin(p * 6 + i)) + '" cy="' + f(y - p * h) + '" r="' + f(3 + 4 * p) + '" fill="' + SCENT + '" opacity="' + f((1 - p) * .7 * (k == null ? 1 : k)) + '"/>'; } return s; }
// a floor line for side views (a cut through the tiles)
function ground(y) { return R(-600, y, 1840, 700, "#ddd2b8", 0) + '<rect x="-600" y="' + y + '" width="1840" height="700" fill="url(#hatch)" opacity=".4"/><path d="M-600 ' + y + ' H1240" stroke="' + INK + '" stroke-width="2.6"/>'; }
// the dabs the gaster leaves: blue spots on the floor behind a side-view ant
function dabs(x0, x1, y, n, k) { var s = ""; for (var i = 0; i < n; i++) { var q = i / Math.max(1, n - 1); if (q > k) break; s += '<ellipse cx="' + f(lerp(x0, x1, q)) + '" cy="' + f(y + 2) + '" rx="10" ry="4" fill="' + SCENT + '" opacity=".75"/>'; } return s; }

// ── shots (line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a rule card pinned over an ant
shot(4, push(320, 410, 1.0, 1.08), function (u, d, t) {
  return paper() + ground(560) + dim(.6, ant(330, 560, 1.15, t, { walk: .25 })) + G("", '<rect x="150" y="150" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 225)"/>' +
    T("قاعدة", 320, 222, 44, ORANGE, 800) + T("صغيرة", 320, 270, 32, INK, 700) + C(320, 158, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · ants don't talk with sound, they talk with scent: two ants antenna to antenna; a sound wave crossed out, scent dots between
shot(5, push(320, 420, 1.06, 0.98), function (u, d, t) {
  var k = at(u, 1.6, .5);
  return paper() + ground(540) + ant(140, 540, 1.1, t, { flip: true }) + ant(500, 540, 1.1, t + 1, {}) +
    G("", wave(260, 300, 380, 300, t, INK, 8, 18, at(u, .2, .4), 3) + cross(320, 300, 1.2, at(u, .9, .4)), 1 - .6 * k) +
    puffs(320, 440, t, 10, 120, k) + tag("ريحة", 320, 200, at(u, 1.9, .3), 40, BLUE);
});
// 6 · to an ant, 10 m from the nest to the kitchen …
shot(6, push(320, 400, 0.92, 1.0), function (u, d, t) {
  var k = at(u, .4, 1.2);
  return paper() + plan(t) + draw("M" + NEST[0] + " " + NEST[1] + " L" + SUGAR[0] + " " + SUGAR[1], k, ORANGE, 3, ' stroke-dasharray="10 8"') +
    G("", numBox("10 m", 300, 430, 1, 34), clamp(k * 2 - 1)) + antTop(NEST[0] + 20, NEST[1] - 20, -40, 1.1, t) +
    inset(470, 600, 90, G("scale(.48) translate(40 60)", ground(0) + ant(0, 0, 1, t, { walk: .4 })) + measure(-56, 32, 66, 32, 1, "") + N("3 mm", 5, 62, 20), at(u, 1.2, .4)) +
    label(NEST[0] - 20, NEST[1], 150, 580, "العش", OLIVE, at(u, .2, .5), 24) + label(SUGAR[0], SUGAR[1], 420, 280, "السكر", OLIVE, at(u, .6, .5), 24);
});
// 6 · … like you walking 6 km: a man in real proportions on a road that runs to the horizon
shot([6, 2], push(320, 420, 1.0, 1.06), function (u, d, t) {
  var ph = t * 5.2, sw = 22 * Math.sin(ph), man = fig({ x: 470, y: 560 - 212 * .9 + 4 * Math.abs(Math.cos(ph)), s: .9, lean: 4, legs: [[sw, -6 - 10 * Math.max(0, Math.sin(ph))], [-sw, -6 - 10 * Math.max(0, -Math.sin(ph))]], hands: [null, null] });
  var s = paper() + ground(560) + R(-600, 560, 1840, 30, "#8f877a", 2.2);
  for (var i = 0; i < 9; i++) { var x = ((i * 110 + t * 90) % 990) - 200; s += R(x, 572, 50, 6, "#f4efe3", 0); }
  return s + whole(man) + measure(110, 640, 560, 640, at(u, .2, 1), "") + G("", N(count(6, at(u, .2, 1)) + " km", 335, 712, 50, ORANGE), at(u, .4, .4)) + iconBox(110, 120, 120, G("scale(.36) translate(0 40)", ant(0, 0, 1, t, { walk: .5 })), at(u, .3, .3));
}, { tr: "out" });
// 7 · scouts: the first ants out of the nest
shot(7, push(260, 520, 1.25, 1.15), function (u, d, t) {
  var s = paper() + plan(t);
  WALKS.slice(0, 3).forEach(function (w, i) { var ww = w.slice(0, 57), k = clamp((u - i * .3) / 3.2); s += draw(polyD(ww, 1), k, INK, 2, ' stroke-dasharray="4 5"'); var p = ptAt(ww, k); s += antTop(p[0], p[1], headingAt(ww, k), 1.1, t + i); });
  return s + tag("الكشّافين", 250, 420, at(u, 1.4, .3), 30, ORANGE);
}, { tr: "in" });
// 8 · they loop and zigzag … most come back with nothing
shot(8, push(320, 520, 1.15, 1.05), function (u, d, t) {
  var s = paper() + plan(t), T0 = 3.0;
  WALKS.forEach(function (w, i) { var k = clamp((u + 1.2 - i * .25) / T0); s += G("", draw(polyD(w, 1), k, INK, 1.8, ' stroke-dasharray="4 5"'), .55); var p = ptAt(w, k); s += antTop(p[0], p[1], headingAt(w, k), 1.0, t + i); });
  return s + cross(470, 520, 1, at(u, d - 1.3, .5));
});
// 9 · one bumps into the sugar, tastes it and picks up a crystal (side view on the counter)
shot(9, push(320, 420, 1.02, 1.12), function (u, d, t) {
  var g = at(u, 1.9, .5), x = lerp(440, 400, at(u, 0, 1.4)), s = paper() + R(-600, 540, 1840, 400, MARBLE, 0) + '<path d="M-600 540 H1240" stroke="' + INK + '" stroke-width="2.6"/><path d="M-100 600 Q100 580 300 620 T700 600" stroke="#cfc8b8" stroke-width="3" fill="none"/>';
  // the sugar heap: cubic crystals
  for (var i = 0; i < 26; i++) { var cx = 80 + (i % 9) * 22 + hash(i) * 8, cy = 540 - 14 - Math.floor(i / 9) * 22 - (i % 9 > 2 && i % 9 < 7 ? 8 : 0); if (i === 4 && g > 0) continue; s += G("translate(" + f(cx) + " " + f(cy) + ") rotate(" + f(hash(i + 2) * 30 - 15) + ")", R(-10, -10, 20, 20, SUGARC, 1.6)); }
  return s + ant(x + 60, 540, 1.05, t, { walk: u < 1.4 ? .5 : 0, crystal: g > 0, sniff: u > .9 && u < 2.0 }) + label(170, 470, 140, 300, "سكر", OLIVE, at(u, .3, .5), 26) + (g > 0 ? label(x + 60 - 156 * 1.05, 540 - 42 * 1.05, 330, 330, "حباية", ORANGE, at(u, 2.3, .4), 24) : "");
}, { tr: "in" });
// 10 · it got there by wandering: how does it get back?
shot(10, push(300, 430, 1.0, 0.94), function (u, d, t) {
  return paper() + plan(t) + draw(polyD(SCOUT, 1), at(u, 0, 1.2), INK, 2, ' stroke-dasharray="4 5"') + antTop(SUGAR[0] - 30, SUGAR[1] + 28, 130 + 20 * Math.sin(t * 2), 1.2, t, { crystal: true }) +
    T("؟", 300 + 10 * Math.sin(t * 2), 360, 140, ORANGE, 800) + C(NEST[0] - 22, NEST[1], 30 + 4 * Math.sin(t * 4), "none", 3);
}, { tr: "out" });
// 11 · the whole way it counts how far it walked and which way: the scout runs the path, a home vector follows it
hud(11, 12, function (u, t) {
  var k = clamp(u / 2.6), n = Math.floor(k * 1460);
  return R(440, 30, 180, 86, "#f4ecdb", 2) + T("خطوات", 530, 62, 22, INK, 700) + N(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","), 530, 102, 32, ORANGE) +
    C(76, 76, 48, "#f4ecdb", 2) + T("ش", 76, 44, 14, INK, 800) + G("rotate(" + f(headingAt(SCOUT, k) + 90) + " 76 76)", '<path d="M76 40 L84 76 L76 112 L68 76 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.4"/>');
});
shot(11, push(300, 420, 0.94, 1.0), function (u, d, t) {
  var k = clamp(u / 2.6), p = ptAt(SCOUT, k);
  return paper() + plan(t) + draw(polyD(SCOUT, k), 1, INK, 2, ' stroke-dasharray="4 5"') +
    '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + NEST[0] + ' ' + NEST[1] + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-dasharray="10 7"/>' + C(NEST[0], NEST[1], 7, ORANGE, 2) +
    antTop(p[0], p[1], headingAt(SCOUT, k), 1.2, t);
});
// 12 · like walking in the dark and counting: 20 steps right, 10 forward; footprints on the plan, a man in the dark in the corner
shot(12, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var s = paper() + R(30, 150, 580, 580, "#3a3530", 2.4) + '<rect x="30" y="150" width="580" height="580" fill="url(#grid)" opacity=".25"/>', start = [520, 640], k1 = at(u, .1, 1.3), k2 = at(u, 1.5, 1.0), i;
  for (i = 0; i < 20; i++) { if (i / 20 > k1) break; var x = start[0] - i * 20; s += '<ellipse cx="' + f(x) + '" cy="' + f(start[1] + (i % 2 ? 9 : -9)) + '" rx="7" ry="4.5" fill="#e9e1cc" opacity=".85"/>'; }
  for (i = 0; i < 10; i++) { if (i / 10 > k2) break; var y = start[1] - 40 - i * 32; s += '<ellipse cx="' + f(start[0] - 400 + (i % 2 ? 9 : -9)) + '" cy="' + f(y) + '" rx="4.5" ry="7" fill="#e9e1cc" opacity=".85"/>'; }
  s += G("", N(String(Math.round(20 * k1)), 320, 700, 40, ORANGE), clamp(k1 * 3)) + G("", N(String(Math.round(10 * k2)), 70, 460, 40, ORANGE), clamp(k2 * 3));
  s += draw("M" + (start[0] - 400) + " " + (start[1] - 360) + " L" + start[0] + " " + start[1], at(u, 2.5, .5), ORANGE, 3, ' stroke-dasharray="10 7"') + C(start[0], start[1], 9, ORANGE, 2);
  var ph = t * 3.4, sw = 16 * Math.sin(ph), man = fig({ x: 10, y: 72 - 212 * .4 + 2 * Math.abs(Math.cos(ph)), s: .4, legs: [[sw, -4], [-sw, -4]], hands: [[-48, -38], [-44, -34]], bend: [BENDX, BENDX] });
  return s + iconBox(470, 300, 200, '<rect x="-85" y="-85" width="170" height="170" fill="#2e2a26"/><circle cx="-50" cy="-50" r="60" fill="#fff" opacity=".05"/>' + whole(man) + '<path d="M-85 72 H85" stroke="#8f8576" stroke-width="2"/>' + T("؟", 50, -50, 40, "#e9e1cc", 800), at(u, .2, .3));
});
// 13 · so it knows roughly where the nest is and goes straight back
shot(13, push(300, 420, 1.0, 0.95), function (u, d, t) {
  var k = at(u, .5, d - 1.2), p = L2(SUGAR, NEST, k);
  return paper() + plan(t) + G("", draw(polyD(SCOUT, 1), 1, INK, 2, ' stroke-dasharray="4 5"'), .35) + draw("M" + SUGAR[0] + " " + SUGAR[1] + " L" + NEST[0] + " " + NEST[1], at(u, 0, .8), ORANGE, 3.4, ' stroke-dasharray="10 7"') +
    antTop(p[0], p[1], TRAIL_A + 180, 1.2, t, { crystal: true }) + check(NEST[0] + 60, NEST[1] - 70, 1.3, at(u, d - .8, .4));
});
// 14 · on the way back it presses the tip of its gaster to the floor, again and again
shot(14, push(330, 420, 1.06, 1.0), function (u, d, t) {
  var x = 420 - u * 30, dab = Math.pow(Math.max(0, Math.sin(u * 4.2)), 3), n = Math.floor(u * 4.2 / Math.PI);
  var s = paper() + ground(560) + dabs(x + 170, x + 170 + 34 * Math.min(8, n + 1), 560, Math.min(9, n + 2), 1);
  return s + ant(x, 560, 1.15, t, { walk: .35, dab: dab, crystal: true, hl: "gaster" }) + label(x + 150, 545, x + 90, 380, "طرف البطن", ORANGE, at(u, .6, .5), 24);
}, { tr: "in" });
// 15 · each touch leaves a dab of scent; dab after dab, a line (back to the plan: the line grows from the sugar)
shot(15, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .2, d - .6), p = L2(SUGAR, NEST, k);
  return paper() + plan(t) + trailLine(k, .35, t) + antTop(p[0], p[1], TRAIL_A + 180, 1.2, t, { crystal: true }) + inset(170, 230, 92, G("scale(.42) translate(60 60)", ground(0) + dabs(-260, 60, 0, 7, 1) + ant(-60, 0, 1, t, { walk: .3, dab: Math.pow(Math.max(0, Math.sin(t * 4.2)), 3), crystal: true })), at(u, .3, .3));
}, { tr: "out" });
// 16 · like breadcrumbs you drop to find the way home, only it's scent
shot(16, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var crumbs = ""; for (var i = 0; i < 8; i++) { var q = i / 7; crumbs += G("translate(" + f(-60 + q * 120) + " " + f(30 - q * 70 + 8 * Math.sin(i * 2)) + ") scale(2)", '<path d="M-5 -3 l6 -4 l5 3 l-2 6 l-7 1 Z" fill="#d6a865" stroke="' + INK + '" stroke-width=".8"/>'); }
  return paper() + plan(t) + trailLine(1, .4, t) + iconBox(180, 230, 170, crumbs + '<path d="M-48 46 h96" stroke="' + INK + '" stroke-width="1.2" opacity=".4"/>', at(u, .2, .3)) + G("", tag("ريحة", 180, 360, 1, 30, BLUE), at(u, d - 1.2, .3)) + marchers(2, t, .05, 1);
});
// 17 · how do the others know? the antennae: a close-up of the head, scent drifting up into the antenna
shot(17, push(290, 420, 1.3, 1.42), function (u, d, t) {
  return paper() + ground(560) + dabs(-200, 700, 560, 14, 1) + puffs(150, 560, t, 9, 160, 1) + puffs(60, 560, t + .4, 9, 160, 1) + ant(380, 560, 1.4, t, { sniff: true, hl: "antenna" }) +
    label(380 - 150 * 1.4, 560 - 100 * 1.4, 220, 240, "قرون الاستشعار", ORANGE, at(u, .3, .5), 26);
}, { tr: "in" });
// 18 · ants at the nest smell the line and follow it out to the sugar
shot(18, push(300, 440, 0.98, 1.06), function (u, d, t) {
  return paper() + plan(t) + trailLine(1, .45, t) + marchers(10, t, .06, at(u, 0, d)) ;
}, { tr: "out" });
// 19 · every ant that reaches it and comes back lays its own scent too
hud(19, 21, function (u, t) {
  var lv = clamp(.35 + u / 9);
  return R(70, 90, 40, 220, "#f4ecdb", 2) + R(76, 96 + 208 * (1 - lv), 28, 208 * lv, BLUE, 0) + T("ريحة", 90, 340, 20, BLUE, 800);
});
shot(19, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var x = 560 - u * 50, dab = Math.pow(Math.max(0, Math.sin(u * 4.2)), 3), s = paper() + ground(560);
  for (var i = 0; i < 18; i++) s += '<ellipse cx="' + f(-200 + i * 50) + '" cy="562" rx="' + f(14 + 6 * at(u, .5 + i * .05, .8)) + '" ry="5" fill="' + SCENT + '" opacity="' + f(.45 + .4 * at(u, .5, 1.5)) + '"/>';
  return s + ant(x, 560, .8, t, { walk: .35, dab: dab, crystal: true }) + ant(x - 300, 560, .8, t + .7, { walk: .35, dab: Math.pow(Math.max(0, Math.sin(u * 4.2 + 1.5)), 3), crystal: true });
});
// 20 · so the line gets stronger and pulls more and more ants
shot(20, push(300, 440, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 0, d); return paper() + plan(t) + trailLine(1, lerp(.5, 1, k), t) + marchers(Math.round(lerp(12, 34, k)), t, .06, 1);
});
// 21 · two routes: the short one fills with scent faster, so the whole colony takes it with no one deciding
function bridge(t, k) {
  var A = [320, 700], B = [320, 120], sh = "M320 700 C250 560 250 260 320 120", lg = "M320 700 C620 640 620 180 320 120", s = "";
  s += '<path d="' + sh + '" stroke="' + KHAKI + '" stroke-width="40" fill="none" stroke-linecap="round"/><path d="' + lg + '" stroke="' + KHAKI + '" stroke-width="40" fill="none" stroke-linecap="round"/>';
  s += '<path d="' + sh + '" stroke="' + SCENT + '" stroke-width="' + f(4 + 26 * k) + '" fill="none" opacity="' + f(.25 + .5 * k) + '" stroke-linecap="round"/>';
  s += '<path d="' + lg + '" stroke="' + SCENT + '" stroke-width="' + f(10 * (1 - k) + 2) + '" fill="none" opacity="' + f(.4 * (1 - k) + .1) + '" stroke-linecap="round"/>';
  s += C(A[0], A[1], 34, "#2a2016", 2) + T("العش", A[0], A[1] + 70, 24, OLIVE, 800) + G("translate(" + B[0] + " " + B[1] + ")", '<ellipse rx="40" ry="26" fill="' + SUGARC + '" stroke="' + INK + '" stroke-width="2"/>') + T("السكر", B[0], B[1] - 40, 24, OLIVE, 800);
  var nS = Math.round(4 + 16 * k), nL = Math.round(10 - 8 * k), i, p;
  function pathPt(c, q) { var a = c[0], b = c[1], c2 = c[2], d2 = c[3], m = 1 - q; return [m * m * m * a[0] + 3 * m * m * q * b[0] + 3 * m * q * q * c2[0] + q * q * q * d2[0], m * m * m * a[1] + 3 * m * m * q * b[1] + 3 * m * q * q * c2[1] + q * q * q * d2[1]]; }
  var CS = [[320, 700], [250, 560], [250, 260], [320, 120]], CL = [[320, 700], [620, 640], [620, 180], [320, 120]];
  for (i = 0; i < nS; i++) { var q = (i / nS + t * .07) % 1, back = i % 2; q = back ? 1 - q : q; p = pathPt(CS, q); var p2 = pathPt(CS, clamp(q + .01)); s += antTop(p[0], p[1], Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180 / Math.PI + (back ? 180 : 0), .9, t + i, { crystal: back }); }
  for (i = 0; i < nL; i++) { var q2 = (i / nL + t * .04) % 1; p = pathPt(CL, q2); var p3 = pathPt(CL, clamp(q2 + .01)); s += antTop(p[0], p[1], Math.atan2(p3[1] - p[1], p3[0] - p[0]) * 180 / Math.PI, .9, t + i * 3); }
  return s;
}
shot(21, push(320, 410, 0.98, 1.04), function (u, d, t) {
  var k = at(u, 1.2, d - 2); return paper() + bridge(t, k) + label(262, 400, 180, 330, "القصيرة", ORANGE, at(u, .8, .5), 26) + label(548, 470, 470, 600, "الطويلة", MUTE, at(u, .8, .5), 22);
}, { tr: "out" });
// 22 · the myth: ants see or smell the food from far away — no. Sight lines from the ant to the sugar, crossed out
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, .8), k2 = at(u, d * .62, .6), s = paper() + plan(t), myth = "";
  myth += G("", '<path d="M' + (NEST[0] + 30) + ' ' + (NEST[1] - 20) + ' L' + (SUGAR[0] - 10) + ' ' + (SUGAR[1] - 30) + ' L' + (SUGAR[0] + 30) + ' ' + (SUGAR[1] + 20) + ' Z" fill="' + ORANGE + '" opacity=".14"/>', k) +
       draw("M" + (NEST[0] + 30) + " " + (NEST[1] - 20) + " L" + SUGAR[0] + " " + SUGAR[1], k, ORANGE, 2, ' stroke-dasharray="3 6"') + cross(300, 420, 1.6, at(u, 2.0, .5));
  s += G("", myth, 1 - .75 * k2) + antTop(NEST[0] + 30, NEST[1] - 20, TRAIL_A, 1.3, t); s += G("", trailLine(1, .5, t) + marchers(8, t, .06, 1) + check(300, 280, 1.4, at(u, d * .62 + .4, .4)), k2);
  return s;
});
// 23 · when the sugar is gone nobody tops up the scent: it evaporates and the line melts away
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.2, d - 1.6), s = paper() + plan(t, { empty: true }) + trailLine(1, lerp(.6, .1, k), t, 1 - k);
  for (var i = 0; i < 12; i++) { var q = (i + .5) / 12, p = onTrail(q), a = hash(i) * 360, r = 120 * k * hash(i + 4); s += antTop(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, a + 30 * Math.sin(t * 2 + i), .9, t + i); }
  for (i = 0; i < 8; i++) { var pp = (t * .5 + i / 8) % 1, q2 = hash(i + 30); var p2 = onTrail(q2); s += '<circle cx="' + f(p2[0] + 10 * Math.sin(pp * 6)) + '" cy="' + f(p2[1] - pp * 80) + '" r="' + f(4 + 4 * pp) + '" fill="' + SCENT + '" opacity="' + f((1 - pp) * .5 * k) + '"/>'; }
  return s + tag("السكر خلص", 230, 250, at(u, .3, .3), 30, ORANGE);
});
// ── 24–30 · wiping the trail. A close-up of the marble from above: the trail runs right (sugar) → left (nest) at y = 400.
// Ants at s = 1.1 are ~40 units long (a 3 mm ant), so a fingertip (~16 mm) is ~210 units wide: true to scale.
var WY = 400;
function marbleTop() { return R(-600, -600, 1840, 2000, MARBLE, 0) + '<path d="M-200 180 Q100 140 320 220 T840 160 M-200 620 Q120 560 360 660 T900 600" stroke="#d8d1c2" stroke-width="3" fill="none"/>'; }
// the trail dots; gone(x) → 0..1 how much of the scent is wiped there (1 = all gone)
function wTrail(t, gone, str) {
  var s = '', i; str = str == null ? .8 : str;
  for (i = 0; i < 40; i++) { var x = -120 + i * 22 + 4 * Math.sin(i * 2.3), y = WY + 6 * Math.cos(i * 1.7), g = gone ? clamp(gone(x)) : 0; if (g >= .99) continue;
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f((4 + 3 * str) * (.85 + .15 * Math.sin(t * 3 + i))) + '" fill="' + SCENT + '" opacity="' + f((.5 + .45 * str) * (1 - g)) + '"/>'; }
  return s;
}
// ants marching along the close-up trail (both ways); skip(x) → true to leave an ant out (in the gap)
function wAnts(t, n, v, skip) {
  var s = ''; for (var i = 0; i < n; i++) { var back = i % 2, q = (i / n + t * v + hash(i) * .04) % 1, x = back ? lerp(-140, 780, q) : lerp(780, -140, q);
    if (skip && skip(x, back)) continue; s += antTop(x, WY + (back ? -16 : 16) + 4 * Math.sin(t * 5 + i), back ? 0 : 180, 1.1, t + i, { crystal: !back }); }
  return s;
}
// a hand from above with the index finger out: fingertip at (x, y), coming in from the top; width to scale (~210 units)
function fingerTop(x, y) {
  return '<path d="M' + f(x - 105) + ' ' + f(y - 40) + ' L' + f(x - 105) + ' ' + f(y - 520) + ' L' + f(x + 105) + ' ' + f(y - 520) + ' L' + f(x + 105) + ' ' + f(y - 40) + ' A105 105 0 0 1 ' + f(x - 105) + ' ' + f(y - 40) + ' Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M' + f(x - 52) + ' ' + f(y - 60) + ' Q' + f(x) + ' ' + f(y - 140) + ' ' + f(x + 52) + ' ' + f(y - 60) + ' L' + f(x + 46) + ' ' + f(y - 10) + ' Q' + f(x) + ' ' + f(y + 22) + ' ' + f(x - 46) + ' ' + f(y - 10) + ' Z" fill="#e8c0aa" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + f(x - 70) + ' ' + f(y - 250) + ' q70 -18 140 0 M' + f(x - 64) + ' ' + f(y - 270) + ' q64 -12 128 0" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none"/>' +
    R(x - 160, y - 900, 320, 400, SHIRT_V, 3);
}
var GAP0 = 215, GAP1 = 425;   // the wiped strip (one finger wide)
function inGap(x) { return x > GAP0 - 6 && x < GAP1 + 6; }
// 24 · «طب ولو مسحت حتة من الخط بصباعك؟»: the fingertip sweeps down across the trail and wipes a strip
shot(24, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, d - .5), fy = lerp(-160, 920, k), s = paper() + marbleTop();
  s += wTrail(t, function (x) { return x > GAP0 && x < GAP1 && fy > WY ? 1 : 0; }) + wAnts(t, 14, .05, function (x) { return inGap(x) && fy > WY - 40 && fy < WY + 800; });
  if (k > 0 && k < 1) s += fingerTop(320, fy);
  return s + label(GAP1 + 40, WY - 30, 520, 200, "الخط", BLUE, at(u, 0, .4), 26);
}, { tr: "in" });
// 25 · ants reach the wiped strip, get lost and circle round and round
function lostAnts(t, k) {
  var s = '', c = [[GAP0 + 10, WY - 50, 46, 1], [GAP0 + 30, WY + 60, 38, -1], [GAP1 - 20, WY - 40, 42, -1], [GAP1 - 10, WY + 56, 50, 1], [320, WY + 10, 34, 1]];
  c.forEach(function (q, i) { var a = t * 2.6 * q[3] + i * 1.7, x = q[0] + Math.cos(a) * q[2], y = q[1] + Math.sin(a) * q[2] * .8;
    s += G("", draw("M" + f(q[0] + q[2]) + " " + f(q[1]) + " A" + q[2] + " " + f(q[2] * .8) + " 0 1 1 " + f(q[0] - q[2]) + " " + f(q[1]) + " A" + q[2] + " " + f(q[2] * .8) + " 0 1 1 " + f(q[0] + q[2]) + " " + f(q[1]), k, INK, 1.4, ' stroke-dasharray="3 5"'), .5) +
         antTop(x, y, a * 180 / Math.PI + 90 * q[3], 1.1, t + i); });
  return s;
}
shot(25, push(320, 400, 1.06, 1.12), function (u, d, t) {
  var s = paper() + marbleTop() + wTrail(t, function (x) { return x > GAP0 && x < GAP1 ? 1 : 0; });
  s += wAnts(t, 14, .05, function (x) { return x > GAP0 - 30 && x < GAP1 + 30; }) + lostAnts(t, at(u, .6, 1.2));
  return s + G("", T("؟", 250 + 8 * Math.sin(t * 3), 300, 70, ORANGE, 800) + T("؟", 400 - 8 * Math.sin(t * 3), 520, 60, ORANGE, 800), at(u, 1.2, .4));
});
// 26 · one finds the line on the other side and the queue carries on: it crosses, laying fresh dots behind it
shot(26, push(320, 400, 1.1, 1.0), function (u, d, t) {
  var k = at(u, .2, d - .8), x = lerp(GAP1 + 20, GAP0 - 30, k), s = paper() + marbleTop();
  s += wTrail(t, function (xx) { return xx > GAP0 && xx < GAP1 && xx < x ? 1 : 0; });
  s += wAnts(t, 14, .05, function (xx) { return xx > GAP0 - 30 && xx < GAP1 + 30 && (k < .95); });
  s += antTop(x, WY + 6 * Math.sin(t * 6), 180, 1.3, t, { crystal: true }) + check(320, 260, 1.2, at(u, d - .9, .4));
  return s;
});
// 27 · the scent is oily: a dry tissue or plain water only take part of it. Three marble tiles, wiped three ways
function tile(x, y, t, wipeK, left, tool) {
  var s = R(x - 90, y - 150, 180, 300, MARBLE, 2.4);
  for (var i = 0; i < 9; i++) { var yy = y - 130 + i * 32, g = wipeK > (i + .5) / 9 ? 1 - left : 0; if (left === 0 && g >= .99) continue;
    s += '<circle cx="' + f(x + 5 * Math.sin(i * 2)) + '" cy="' + f(yy) + '" r="' + f(7 + Math.sin(t * 3 + i)) + '" fill="' + SCENT + '" opacity="' + f(.9 * (1 - g)) + '"/>'; }
  if (wipeK > 0 && wipeK < 1) s += G("translate(" + f(x) + " " + f(lerp(y - 150, y + 150, wipeK)) + ")", tool);
  return s;
}
var TISSUE = '<rect x="-60" y="-34" width="120" height="68" rx="6" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.2" transform="rotate(-8)"/><path d="M-40 -10 q20 8 40 0 t40 0" stroke="#d8d1c2" stroke-width="2" fill="none"/>';
var WATER = '<path d="M0 -40 C18 -12 26 2 26 14 A26 26 0 0 1 -26 14 C-26 2 -18 -12 0 -40 Z" fill="#a9c6d8" stroke="' + INK + '" stroke-width="2.2"/><path d="M-12 12 q0 12 12 14" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>';
function SOAP(t) { var b = '<rect x="-58" y="-30" width="116" height="60" rx="14" fill="#e3c35a" stroke="' + INK + '" stroke-width="2.2"/><path d="M-50 -6 h100" stroke="#b9962e" stroke-width="2"/>'; for (var i = 0; i < 7; i++) { var a = i * .9 + t * 2; b += '<circle cx="' + f(Math.cos(a) * 66) + '" cy="' + f(Math.sin(a) * 40 - 10) + '" r="' + f(7 + 4 * hash(i)) + '" fill="#f4f8fb" stroke="' + INK + '" stroke-width="1.2" opacity=".9"/>'; } return b; }
function tiles(u, t, k1, k2, k3) {
  return tile(110, 470, t, k1, .45, TISSUE) + tile(320, 470, t, k2, .3, WATER) + tile(530, 470, t, k3, 0, SOAP(t)) +
    G("", T("منديل ناشف", 110, 680, 22, INK, 800), at(u, .2, .3)) + G("", T("مية بس", 320, 680, 22, INK, 800), at(u, .2, .3)) + G("", T("مية وصابون", 530, 680, 22, BLUE, 800), k3 > 0 ? 1 : .3);
}
shot(27, push(320, 440, 1.0, 1.05), function (u, d, t) {
  var oil = '<path d="M0 -38 C16 -12 24 2 24 14 A24 24 0 0 1 -24 14 C-24 2 -16 -12 0 -38 Z" fill="#d9b34a" stroke="' + INK + '" stroke-width="2.2"/><path d="M-10 12 q0 10 10 12" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>';
  return paper() + tiles(u, t, at(u, 1.6, 1.4), at(u, 3.0, 1.4), 0) + iconBox(320, 170, 130, oil + T("زي الزيت", 0, 52, 17, INK, 800), at(u, .1, .3)) +
    G("", T("حتة بس", 110, 300, 22, ORANGE, 800), at(u, 3.0, .3)) + G("", T("حتة بس", 320, 300, 22, ORANGE, 800), at(u, d - .5, .3));
});
// 28 · water and soap (or any cleaner) take it all
shot(28, push(330, 440, 1.04, 1.1), function (u, d, t) {
  return paper() + tiles(u, t, 1, 1, at(u, .2, 1.6)) + G("", T("حتة بس", 110, 300, 22, ORANGE, 800) + T("حتة بس", 320, 300, 22, ORANGE, 800), 1) + check(530, 300, 1.2, at(u, 1.9, .4), BLUE);
});
// 29 · but while the sugar is still there, a scout finds it and draws the line again
shot(29, push(300, 420, 1.0, 0.96), function (u, d, t) {
  var k = at(u, 0, 1.6), k2 = at(u, 1.6, d - 1.8), p = k < 1 ? ptAt(SCOUT, k) : L2(SUGAR, NEST, k2);
  return paper() + plan(t) + draw(polyD(SCOUT, k), 1, INK, 2, ' stroke-dasharray="4 5"') + trailLine(k2, .45, t) + antTop(p[0], p[1], k < 1 ? headingAt(SCOUT, k) : TRAIL_A + 180, 1.2, t, { crystal: k >= 1 }) +
    tag("من تاني", 260, 300, at(u, 1.8, .3), 44, ORANGE);
}, { tr: "out" });
// 30 · so lift the food first, then wipe the counter with water and soap: the kitchen from the side
shot(30, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k1 = at(u, .1, 1.0), k2 = at(u, 1.3, d - 1.6), sx = lerp(600, 160, k2), s = paper() + G("translate(16 70)", kitchenSide(t, 0, 0, { spoon: [lerp(0, 60, k1), lerp(0, -150, k1)], clean: k2 > 0 ? sx : null }));
  // the hand lifting the spoon (comes in from the top right)
  var hx = 16 + 480 + 60 * k1, hy = 70 + 250 - 150 * k1 - 30 * (1 - at(u, 0, .3));
  s += G("translate(" + f(hx) + " " + f(hy) + ")", R(4, -340, 64, 330, SHIRT_V, 2.4) + '<path d="M-6 -16 C-10 -40 40 -46 52 -24 L58 8 C50 22 6 22 -2 10 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M4 2 q10 6 22 2 M8 10 q10 5 22 0" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>');
  // the sponge wiping right to left along the marble top, with suds behind it
  if (k2 > 0) { for (var i = 0; i < 8; i++) { var bx = sx + 30 + i * 30; if (bx > 630) break; s += '<circle cx="' + f(16 + bx) + '" cy="' + f(70 + 262 - 6 * hash(i)) + '" r="' + f(5 + 4 * hash(i + 3)) + '" fill="#f4f8fb" stroke="' + INK + '" stroke-width="1" opacity="' + f(.8 * (1 - i / 9)) + '"/>'; }
    if (k2 < 1) s += G("translate(" + f(16 + sx) + " " + f(70 + 250) + ")", '<rect x="-40" y="-26" width="80" height="34" rx="6" fill="#e3c35a" stroke="' + INK + '" stroke-width="2"/><rect x="-40" y="0" width="80" height="12" rx="3" fill="#5e8a4a" stroke="' + INK + '" stroke-width="2"/>'); }
  return s + callout("1", 70, 120, at(u, .2, .3), 24) + G("", T("شيل الأكل", 100, 130, 30, INK, 800, "end"), at(u, .3, .3)) +
    callout("2", 70, 190, at(u, 1.3, .3), 24) + G("", T("امسح بمية وصابون", 100, 200, 30, BLUE, 800, "end"), at(u, 1.4, .3)) + check(520, 290, 1.2, at(u, d - .7, .4));
});

// 31 · the recap: the plan with numbered steps
shot(31, push(310, 420, 0.94, 1.0), function (u, d, t) {
  var s = paper() + plan(t) + G("", draw(polyD(SCOUT, 1), 1, INK, 1.8, ' stroke-dasharray="4 5"'), .4) + trailLine(1, .7, t) + marchers(16, t, .06, 1);
  return s + callout("1", SUGAR[0] - 50, SUGAR[1] + 40, at(u, .2, .3), 20) + callout("2", ptAt(SCOUT, .45)[0], ptAt(SCOUT, .45)[1] - 30, at(u, 1.2, .3), 20) + callout("3", onTrail(.62)[0] + 34, onTrail(.62)[1] + 20, at(u, 2.4, .3), 20) + callout("4", onTrail(.22)[0] + 36, onTrail(.22)[1] + 20, at(u, 3.5, .3), 20);
}, { tr: "out" });
// 32 · the odd fact: a trail that closes on itself, ants circling until they die — the death spiral (army ants)
shot(32, push(320, 410, 1.08, 0.94), function (u, d, t) {
  var s = paper() + R(-600, -600, 1840, 2000, "#e3d7bd", 0) + '<rect x="-600" y="-600" width="1840" height="2000" fill="url(#hatch)" opacity=".3"/>', k = at(u, .3, 1.5), i;
  for (var ring = 0; ring < 4; ring++) { var r = 90 + ring * 52, n = Math.round(r / 9.5), sp = (ring % 2 ? .22 : .2) * (1 - .25 * at(u, d - 2.5, 2));
    s += '<circle cx="320" cy="400" r="' + r + '" fill="none" stroke="' + SCENT + '" stroke-width="16" opacity="' + f(.22 * k) + '"/>';
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + t * sp * (220 / r); if ((i / n) > k) continue; s += antTop(320 + Math.cos(a) * r, 400 + Math.sin(a) * r, a * 180 / Math.PI + 90, .8, t + i); } }
  return s + draw("M200 230 A200 200 0 0 1 440 230", at(u, 1, .6), ORANGE, 4) + arrow(430, 222, 452, 246, ORANGE, 4, at(u, 1.5, .2)) + tag("دوامة الموت", 320, 720, at(u, d - 2.6, .3), 34, ORANGE) + iconBox(540, 110, 130, G("scale(.36) translate(30 70)", ant(0, 0, 1, t, { walk: .4 })) + T("نمل الجيش", 0, 52, 15, INK, 700), at(u, 2.2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
// the kitchen cut from the side at eye level: cabinet, marble top, the spoon of sugar; 608 × 660
function kitchenSide(t, nAnts, kAnts, op) {
  op = op || {};
  var s = R(0, 70, 608, 470, "#ddd2b8", 0) + '<rect x="0" y="70" width="608" height="470" fill="url(#grid)" opacity=".5"/>';
  s += R(170, 300, 438, 250, "#b9a482", 2.4) + R(200, 330, 170, 190, "#c7b493", 2) + R(400, 330, 180, 190, "#c7b493", 2) + R(345, 410, 10, 34, INK, 0) + R(415, 410, 10, 34, INK, 0);
  s += R(150, 270, 470, 30, MARBLE, 2.6) + '<path d="M180 286 Q260 278 330 290 T520 284" stroke="#cfc8b8" stroke-width="2" fill="none"/>';
  s += R(0, 540, 608, 120, "#c9b998", 2.4) + '<rect x="0" y="540" width="608" height="120" fill="url(#hatch)" opacity=".4"/>';
  // spoon with sugar, side view (op.spoon = [dx, dy] lifts it away)
  var sp = op.spoon || [0, 0]; s += '<g transform="translate(' + f(sp[0]) + ' ' + f(sp[1]) + ')">' + '<path d="M420 262 L520 248 L522 256 L424 268 Z" fill="#c9cdcd" stroke="' + INK + '" stroke-width="2"/><path d="M370 262 Q372 272 400 272 Q428 272 430 262 Z" fill="#c9cdcd" stroke="' + INK + '" stroke-width="2"/>' +
       '<path d="M372 262 Q400 244 428 262 Z" fill="' + SUGARC + '" stroke="' + INK + '" stroke-width="1.6"/></g>';
  for (var k = 0; k < 5; k++) if (!op.clean || 340 + k * 9 > op.clean) s += R(340 + k * 9 + hash(k) * 4, 264, 4, 4, SUGARC, 1);
  // ants marching: across the floor, up the cabinet face, along the top to the spoon
  var P = [[-20, 540], [150, 540], [160, 540], [160, 300], [160, 270], [360, 270]];
  for (var i = 0; i < nAnts; i++) { var q = (i / nAnts + t * .04) % 1; if (q > kAnts) continue; var p = along(P, q), pn = along(P, Math.min(1, q + .01)), a = Math.atan2(pn[1] - p[1], pn[0] - p[0]) * 180 / Math.PI;
    s += G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a + 180) + ")", ant(0, 0, .15, t + i * .3, { walk: 1.4, flip: false })); }
  return s;
}
SCENE.intro = function (svg, t, li) {
  // line 0: the kitchen with a spoon of sugar. line 1: a line of ants marches straight to it. line 2: an eye and a nose, both crossed out
  var u1 = t - LN[1].start, s = kitchenSide(t, li >= 1 ? 11 : 0, li >= 1 ? clamp(u1 / 2.4) : 0);
  if (li >= 2) { var u = t - LN[2].start;
    s += iconBox(110, 150, 130, '<path d="M-44 0 Q0 -36 44 0 Q0 36 -44 0 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + C(0, 0, 14, "#4a3a2c", 2) + C(0, 0, 6, INK, 0), ease(u / .3)) + cross(110, 150, 1.0, ease((u - .4) / .4));
    s += iconBox(260, 150, 130, '<path d="M-30 -40 Q0 -50 10 -10 Q16 14 30 22 Q10 34 -14 26" fill="none" stroke="' + INK + '" stroke-width="3"/>' + puffs(0, 40, t, 6, 50, 1), ease((u - 1.2) / .3)) + cross(260, 150, 1.0, ease((u - 1.6) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  var s = ""; for (var i = 0; i < 7; i++) s += '<circle cx="' + f(10 + i * 26) + '" cy="168" r="4.5" fill="' + SCENT + '" opacity=".7"/>';
  return s + '<path d="M0 162 H180" stroke="' + INK + '" stroke-width="2"/>' + ant(104 + 6 * Math.sin(t * 1.4), 162, .34, t, { walk: .6, crystal: true });
};
SCENE.outro = function (svg, u, t) {
  var s = G("translate(160 4) scale(.36)", plan(t) + G("", draw(polyD(SCOUT, 1), 1, INK, 2.4, ' stroke-dasharray="4 5"'), .4) + trailLine(1, .7, t) + marchers(14, t, .06, 1));
  return s + callout("1", 340, 70, ease(u / .3)) + callout("2", 250, 150, ease(u / .3 - .5)) + callout("3", 280, 120, ease(u / .3 - 1)) + callout("4", 210, 230, ease(u / .3 - 1.5));
};
