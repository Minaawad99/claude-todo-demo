window.CHUNKS = [[0.0], [0.0, 0.5918], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.5395], [0.0, 0.25, 0.75], [0.0, 0.2958, 0.5634], [0.0, 0.3276, 0.6379], [0.0, 0.4648, 0.6901], [0.0, 0.4478, 0.8657], [0.0, 0.5469], [0.0, 0.6812], [0.0, 0.549], [0.0, 0.175, 0.7125], [0.0, 0.25, 0.5476, 0.8333], [0.0, 0.1831, 0.7042], [0.0, 0.6462], [0.0, 0.25, 0.4688, 0.7031], [0.0, 0.3088, 0.4853], [0.0, 0.4783], [0.0, 0.4727], [0.0, 0.5224], [0.0, 0.2381, 0.4127, 0.7143], [0.0, 0.3971, 0.7206], [0.0], [0.0]];
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

// ── «عملية الليزك بتتعمل إزاي؟» — drawings. Real shapes (refs/SOURCES.md):
// - the eye cut is drawn to scale in millimetres (16 units = 1 mm) after the Wikimedia schematic of the human eye:
//   axial length 24 mm, sclera Ø 23 mm, cornea Ø 11.7 mm with a 7.8 mm front radius and 0.55 mm thick at the centre,
//   anterior chamber 3 mm, lens 4 mm thick and 9 mm across (front radius 10 mm, back 6 mm), optic nerve leaving
//   nasal to the fovea, recti muscles on top and bottom; layers sclera → choroid → retina;
// - the cornea close-up keeps the real layer order and ratios (epithelium ~50 µm, Bowman ~12 µm, stroma ~480 µm,
//   Descemet + endothelium), a LASIK flap ~110 µm, a 6 mm optical zone;
// - the eye from the front: palpebral fissure ~30 × 10 mm, iris Ø 11.7 mm, pupil ~3.7 mm; a wire lid speculum and a
//   suction ring on the limbus; people with real body proportions (fig() from «لو حد شرق قدامك»).
var SCL = "#f3eee2", CHOR = "#a8453a", RET = "#e2c35c", VIT = "#f2e2d2", LENS = "#dfe7e4", IRIS = "#7a5636", CIL = "#9b4b3c",
    AQ = "#e4edee", CORN = "#cfe0e6", CORN_HL = "#a9c6d6", MUSC = "#b5654f", NERVE = "#e3c25a", METAL = "#b4babd",
    EPI = "#d9c4ad", BOW = "#bfa98c", STRO = "#dce6e6", DESC = "#b9a98a", SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function polar2(c, r, a) { a = a * Math.PI / 180; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
// a ring segment between radii r1 (outer) and r2 from angle a1 to a2 (deg, increasing)
function ring(c, r1, r2, a1, a2, fill, sw) {
  var p1 = polar2(c, r1, a1), p2 = polar2(c, r1, a2), q2 = polar2(c, r2, a2), q1 = polar2(c, r2, a1), lg = a2 - a1 > 180 ? 1 : 0;
  return '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + f(p2[0]) + ' ' + f(p2[1]) + ' L' + f(q2[0]) + ' ' + f(q2[1]) + ' A' + r2 + ' ' + r2 + ' 0 ' + lg + ' 0 ' + f(q1[0]) + ' ' + f(q1[1]) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.8 : sw) + '" stroke-linejoin="round"/>';
}

// ── the eye, cut through the middle, light coming from the left ──
var EC = [390, 400], AXY = 400, RETX = 548;
function cornX(y) { return 315 - Math.sqrt(125 * 125 - y * y); }          // corneal front surface, 7.8 mm radius
function lensFX(y) { return 410 - Math.sqrt(160 * 160 - y * y); }        // lens front, 10 mm radius
// what the laser takes off the front of the cornea (units), for short sight (flatter middle) or long sight (a ring, steeper middle)
function abl(y, D, mode) { var q; if (mode === "hyp") { q = Math.abs(y) / 84; return q < 1 ? D * Math.pow(Math.sin(Math.PI * q), 2) : 0; } q = Math.abs(y) / 52; return q < 1 ? D * (1 - q * q) * (1 - q * q) : 0; }
// o: {D, mode, hl: "cornea" | "lens" | "retina", rays: {xf, k}, dimBack}
function eyeCut(t, o) {
  o = o || {}; var s = "", y, D = o.D || 0, mode = o.mode;
  // recti muscles (top, bottom) running back along the globe, under the sclera
  [[-1, -124, -58], [1, 58, 124]].forEach(function (m) {
    var a = polar2(EC, 196, m[1]), b = polar2(EC, 196, m[2]), end = m[0] < 0 ? [760, 120] : [760, 680];
    var d = m[0] < 0 ? "M" + f(a[0]) + " " + f(a[1]) + " A196 196 0 0 1 " + f(b[0]) + " " + f(b[1]) + " L" + end[0] + " " + end[1] : "M" + f(end[0]) + " " + end[1] + " L" + f(a[0]) + " " + f(a[1]) + " A196 196 0 0 1 " + f(b[0]) + " " + f(b[1]);
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="26" fill="none"/><path d="' + d + '" stroke="' + MUSC + '" stroke-width="22" fill="none"/><path d="' + d + '" stroke="#9a4f3c" stroke-width="22" fill="none" stroke-dasharray="2 9" opacity=".5"/>';
  });
  // optic nerve, leaving the back of the eye a little below the axis (nasal to the fovea)
  var n1 = polar2(EC, 168, 10), n2 = polar2(EC, 168, 25), dir = [Math.cos(17 * Math.PI / 180), Math.sin(17 * Math.PI / 180)];
  s += P("M" + f(n1[0]) + " " + f(n1[1]) + " L" + f(n1[0] + dir[0] * 220) + " " + f(n1[1] + dir[1] * 220) + " L" + f(n2[0] + dir[0] * 220) + " " + f(n2[1] + dir[1] * 220) + " L" + f(n2[0]) + " " + f(n2[1]) + " Z", NERVE, 2.2);
  s += '<path d="M' + f((n1[0] + n2[0]) / 2) + ' ' + f((n1[1] + n2[1]) / 2) + ' l' + f(dir[0] * 220) + ' ' + f(dir[1] * 220) + '" stroke="' + CHOR + '" stroke-width="3"/>';
  // vitreous body, then sclera → choroid → retina
  s += C(EC[0], EC[1], 172, VIT, 0) + '<circle cx="' + EC[0] + '" cy="' + EC[1] + '" r="172" fill="url(#hatch)" opacity=".12"/>';
  s += ring(EC, 184, 172, -149.3, 149.3, SCL, 2.4) + ring(EC, 172, 166, -138, 138, CHOR, 1.4) + ring(EC, 166, 160, -128, 128, o.hl === "retina" ? "#e9a93b" : RET, 1.4);
  // fovea: a small dip on the axis
  s += '<path d="M' + (RETX + 4) + ' 388 Q' + (RETX + 10) + ' 400 ' + (RETX + 4) + ' 412" stroke="' + INK + '" stroke-width="1.6" fill="' + RET + '"/>';
  // aqueous in front, between the cornea and the iris / lens
  var back = [], front = [];
  for (y = -92; y <= 92; y += 4) { front.push([cornX(y) + abl(y, D, mode), AXY + y]); back.push([cornX(y) + 9 + 2.5 * (y / 94) * (y / 94), AXY + y]); }
  s += '<path d="' + pathPts(back) + ' L264 492 L264 308 Z" fill="' + AQ + '"/>';
  // ciliary body, zonules and iris (top and bottom)
  [-1, 1].forEach(function (g) {
    function Y(v) { return AXY + g * v; }
    s += P("M254 " + f(Y(94)) + " L276 " + f(Y(116)) + " L304 " + f(Y(98)) + " L296 " + f(Y(84)) + " L264 " + f(Y(86)) + " Z", CIL, 1.8);
    s += '<path d="M296 ' + f(Y(88)) + ' L274 ' + f(Y(70)) + ' M300 ' + f(Y(92)) + ' L286 ' + f(Y(70)) + ' M292 ' + f(Y(84)) + ' L268 ' + f(Y(64)) + '" stroke="' + INK + '" stroke-width="1" opacity=".7"/>';
    s += P("M250 " + f(Y(33)) + " L254 " + f(Y(92)) + " L264 " + f(Y(92)) + " L258 " + f(Y(33)) + " Z", IRIS, 1.8);
  });
  // the crystalline lens
  var lt = Math.sqrt(160 * 160 - 72 * 72), lb = Math.sqrt(96 * 96 - 72 * 72);
  s += P("M" + f(410 - lt) + " 328 A160 160 0 0 0 " + f(410 - lt) + " 472 L" + f(218 + lb) + " 472 A96 96 0 0 0 " + f(218 + lb) + " 328 Z", o.hl === "lens" ? "#bcd0c4" : LENS, 2);
  s += '<path d="M' + f(410 - lt + 6) + ' 352 Q282 400 ' + f(410 - lt + 6) + ' 448" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>';
  // the cornea (front surface follows the laser's reshaping)
  s += '<path d="' + pathPts(front.concat(back.slice().reverse())) + ' Z" fill="' + (o.hl === "cornea" ? CORN_HL : CORN) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  if (D > 0) { var orig = []; for (y = -60; y <= 60; y += 4) orig.push([cornX(y), AXY + y]); s += '<path d="' + pathPts(orig) + '" stroke="' + ORANGE + '" stroke-width="1.6" stroke-dasharray="4 4" fill="none"/>'; }
  if (o.rays) s += rays(o.rays.xf, o.rays.k, D, mode);
  return s;
}
// parallel light from the left, bent by the cornea and the lens to a focus at xf; drawn up to the retina
function rays(xf, k, D, mode) {
  var s = "", ends = [];
  [-62, -34, 34, 62].forEach(function (h) {
    var p1 = [cornX(h) + abl(h, D || 0, mode), AXY + h], p2 = [lensFX(h * .8), AXY + h * .8], F = [xf, AXY];
    var e = [RETX, p2[1] + (F[1] - p2[1]) * (RETX - p2[0]) / (F[0] - p2[0])];
    ends.push(e[1]);
    s += draw("M-120 " + f(AXY + h) + " L" + f(p1[0]) + " " + f(p1[1]) + " L" + f(p2[0]) + " " + f(p2[1]) + " L" + f(e[0]) + " " + f(e[1]), k, ORANGE, 2.6);
  });
  var lo = Math.min.apply(null, ends), hi = Math.max.apply(null, ends);
  if (k > .97) s += hi - lo > 6 ? '<path d="M' + (RETX - 3) + ' ' + f(lo) + ' V' + f(hi) + '" stroke="' + ORANGE + '" stroke-width="7" stroke-linecap="round" opacity=".55"/>' : C(RETX - 3, AXY, 6, ORANGE, 1.6);
  if (k > .97 && xf < RETX - 4) s += C(xf, AXY, 4, ORANGE, 0);
  return s;
}

// ── the cornea up close (a slice, convex side up): epithelium, Bowman, stroma, Descemet, endothelium ──
var CE = 26, CB = 6, FD = 58, CS = 300, FX0 = 130, FX1 = 470;
function y0(x) { return 210 + (x - 320) * (x - 320) / 1800; }
function bedAbl(x, D, mode) { var q; if (mode === "hyp") { q = Math.abs(x - 320) / 230; return q < 1 ? D * Math.pow(Math.sin(Math.PI * q), 2) : 0; } q = Math.abs(x - 320) / 190; return q < 1 ? D * (1 - q * q) : 0; }
// a band between depths d1(x) and d2(x) over the x runs where vis(x) is true
function band(xa, xb, d1, d2, fill, vis, sw) {
  var s = "", run = [];
  function flush() { if (run.length > 1) { var top = run.map(function (x) { return [x, y0(x) + d1(x)]; }), bot = run.slice().reverse().map(function (x) { return [x, y0(x) + d2(x)]; }); s += '<path d="' + pathPts(top.concat(bot)) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.6 : sw) + '" stroke-linejoin="round"/>'; } run = []; }
  for (var x = xa; x <= xb + .01; x += 6) { if (!vis || vis(x)) run.push(Math.min(x, xb)); else flush(); }
  flush(); return s;
}
function K(v) { return function () { return v; }; }
// o: {open 0..1 flap angle, cut 0..1, blade, bubbles 0..1, D, mode, beam (x or null), epiGone(x) → bool, len, inc, out, noFlap}
function corneaClose(t, o) {
  o = o || {}; var s = "", D = o.D || 0, mode = o.mode, open = o.open || 0, flapRange = function (x) { return x >= FX0 && x <= FX1; };
  var bed = function (x) { return (o.noFlap ? CE + CB : FD) + (flapRange(x) || o.noFlap ? bedAbl(x, D, mode) : 0); };
  // aqueous under the cornea
  s += band(-300, 940, K(CS + 14), K(CS + 260), AQ, null, 0);
  // stroma (with its lamellae), Descemet, endothelium
  var stTop = o.noFlap ? function (x) { return bed(x); } : function (x) { return flapRange(x) ? bed(x) : FD; };
  s += band(-300, 940, stTop, K(CS), STRO, null, 1.8);
  for (var d = 92; d < CS; d += 26) { var lam = []; for (var x = -300; x <= 940; x += 10) lam.push([x, y0(x) + d]); s += '<path d="' + pathPts(lam) + '" stroke="#a9bcc0" stroke-width="1.2" fill="none" stroke-dasharray="26 8"/>'; }
  if (o.len) s += lenticule(t, o);
  s += band(-300, 940, K(CS), K(CS + 6), DESC, null, 1.4) + band(-300, 940, K(CS + 6), K(CS + 14), "#c9b49a", null, 1.4);
  for (x = -300; x <= 940; x += 14) s += '<path d="M' + x + ' ' + f(y0(x) + CS + 6) + ' v8" stroke="' + INK + '" stroke-width="1"/>';
  // the top layers outside the flap (and everywhere when there is no flap)
  var outside = o.noFlap ? null : function (x) { return !flapRange(x) || x < FX0 + 1 || x > FX1 - 1; };
  var epiVis = function (x) { return (!outside || outside(x)) && !(o.epiGone && o.epiGone(x)); };
  var bowVis = function (x) { return (!outside || outside(x)) && !(o.noFlap && D > 0 && bedAbl(x, D, mode) > 0.5); };
  if (o.noFlap) { s += band(-300, 940, K(CE), K(CE + CB), BOW, bowVis, 1.2); s += epiLayer(-300, 940, epiVis, 0); }
  else {
    s += band(-300, FX0, K(0), K(FD), STRO, null, 1.8) + band(FX1, 940, K(0), K(FD), STRO, null, 1.8);
    s += band(-300, FX0, K(CE), K(CE + CB), BOW, null, 1.2) + band(FX1, 940, K(CE), K(CE + CB), BOW, null, 1.2);
    s += epiLayer(-300, FX0, null, 0) + epiLayer(FX1, 940, null, 0);
    // the flap: the same three layers, draped into the reshaped bed when it lies down, turned on its hinge when open
    var drape = function (x) { return bedAbl(x, D, mode) * (1 - open); };
    var flap = band(FX0, FX1, function (x) { return CE + CB + drape(x); }, function (x) { return FD + drape(x); }, STRO, null, 1.8) +
      band(FX0, FX1, function (x) { return CE + drape(x); }, function (x) { return CE + CB + drape(x); }, BOW, null, 1.2) + epiLayer(FX0, FX1, null, 0, drape);
    if (D > 0 && open > 0) s += '<path d="' + pathPts(range(FX0, FX1, 8).map(function (x) { return [x, y0(x) + FD]; })) + '" stroke="' + ORANGE + '" stroke-width="1.8" stroke-dasharray="5 5" fill="none"/>';
    var hx = FX1, hy = y0(FX1) + 4;
    s += G("rotate(" + f(-138 * open) + " " + hx + " " + f(hy) + ")", flap);
    // the cut: a side cut at the free edge and the plane at flap depth, as far as it has gone
    if (o.cut) { var cx = FX0 + (FX1 - FX0) * clamp(o.cut); s += '<path d="M' + FX0 + ' ' + f(y0(FX0)) + ' L' + FX0 + ' ' + f(y0(FX0) + FD) + ' ' + pathPts(range(FX0, cx, 8).map(function (x) { return [x, y0(x) + FD]; })).replace("M", "L") + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
      if (o.blade) s += blade(cx, y0(cx) + FD, t, o.cut < 1 ? 1 : 0); }
    if (o.bubbles) { var bx = FX0 + (FX1 - FX0) * clamp(o.bubbles); for (x = FX0; x <= bx; x += 9) s += '<circle cx="' + x + '" cy="' + f(y0(x) + FD) + '" r="3" fill="' + BLUE + '"/>'; for (d = 4; d < FD * clamp(o.bubbles * 4); d += 9) s += '<circle cx="' + FX0 + '" cy="' + f(y0(FX0) + d) + '" r="3" fill="' + BLUE + '"/>'; }
  }
  if (o.beam != null) s += beam(o.beam, y0(o.beam) + bed(o.beam), t);
  if (o.inc) s += incision(o.inc);
  return s;
}
function range(a, b, st) { var r = []; for (var x = a; x < b; x += st) r.push(x); r.push(b); return r; }
// epithelium: 5–7 cell layers, drawn as a band of small cobbles
function epiLayer(xa, xb, vis, gone, drape) {
  drape = drape || K(0); var s = band(xa, xb, drape, function (x) { return CE + drape(x); }, EPI, vis, 1.6);
  for (var x = xa + 7; x < xb - 3; x += 13) if (!vis || vis(x)) { var yy = y0(x) + drape(x); s += '<path d="M' + x + ' ' + f(yy + 2) + ' v' + (CE / 2 - 2) + ' M' + (x + 6) + ' ' + f(yy + CE / 2) + ' v' + (CE / 2 - 2) + '" stroke="' + INK + '" stroke-width="1" opacity=".55"/>'; }
  return s;
}
// microkeratome blade: an oscillating steel edge at the head of the cut
function blade(x, y, t, on) {
  var j = on ? 3 * Math.sin(t * 60) : 0;
  return G("translate(" + f(x) + " " + f(y + j) + ")", '<path d="M0 0 L-120 -26 L-120 8 Z" fill="' + METAL + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 L-120 -6" stroke="#fff" stroke-width="1.6" opacity=".7"/>' + R(-210, -120, 110, 90, "#8c9396", 2, 8) + R(-130, -40, 26, 20, "#8c9396", 2));
}
// excimer beam: a narrow UV spot hitting the stroma bed, with a little plume of vaporised tissue
function beam(x, yb, t) {
  var s = '<path d="M' + f(x - 16) + ' -400 L' + f(x + 16) + ' -400 L' + f(x + 5) + ' ' + f(yb) + ' L' + f(x - 5) + ' ' + f(yb) + ' Z" fill="' + ORANGE + '" opacity=".28"/><path d="M' + f(x) + ' -400 V' + f(yb) + '" stroke="' + ORANGE + '" stroke-width="2.4"/>';
  for (var i = 0; i < 4; i++) { var p = (t * 2.2 + i / 4) % 1; s += '<circle cx="' + f(x + (i % 2 ? 10 : -10) * p) + '" cy="' + f(yb - 8 - 40 * p) + '" r="' + f(3 + 4 * p) + '" fill="' + MUTE + '" opacity="' + f(.6 * (1 - p)) + '"/>'; }
  return s + C(x, yb, 6, "#f4d0b0", 1.4);
}
// SMILE: the lens-shaped piece cut inside the stroma, the small side incision, and the piece pulled out through it
function lenticule(t, o) {
  var cap = 66, th = function (x) { var q = (x - 320) / 170; return Math.abs(q) < 1 ? 64 * (1 - q * q) : 0; };
  var s = "", out = clamp(o.out || 0), xs = range(150, 490, 8);
  var shape = '<path d="' + pathPts(xs.map(function (x) { return [x, y0(x) + cap]; }).concat(xs.slice().reverse().map(function (x) { return [x, y0(x) + cap + th(x)]; }))) + ' Z" fill="#b9c08a" stroke="' + INK + '" stroke-width="2"/>';
  // the empty pocket it leaves, closing as the cornea settles
  if (out > 0) s += G("", '<path d="' + pathPts(xs.map(function (x) { return [x, y0(x) + cap]; }).concat(xs.slice().reverse().map(function (x) { return [x, y0(x) + cap + th(x) * (1 - out)]; }))) + ' Z" fill="#eef3f1" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="4 4"/>', 1);
  if (out < 1) s += G("translate(" + f(out * 300) + " " + f(-out * 120) + ") rotate(" + f(-out * 18) + " 320 290)", shape, clamp(o.len) * (1 - out * .4));
  if (o.len < 1 || out === 0) for (var x = 150; x <= 490; x += 10) s += '<circle cx="' + x + '" cy="' + f(y0(x) + cap) + '" r="2.4" fill="' + BLUE + '" opacity="' + f(clamp(o.len)) + '"/>';
  return s;
}
function incision(k) { var x = 500; return draw("M" + (x + 30) + " " + f(y0(x + 30)) + " L" + x + " " + f(y0(x) + 66), k, ORANGE, 4); }

// ── the eye from the front (patient's right eye: nose on the left) ──
// o: {spec 0..1 speculum, ring 0..1, drop 0..1, look [dx,dy], track 0..1, stop}
function eyeFront(t, o) {
  o = o || {}; var s = "", cx = 320 + (o.look ? o.look[0] : 0), cy = 400 + (o.look ? o.look[1] : 0), sp = clamp(o.spec || 0), h1 = lerp(92, 150, sp), h2 = lerp(66, 128, sp), id = "op" + (++CLIPN);
  var open = "M100 412 C170 " + f(400 - h1 * 1.28) + " 450 " + f(400 - h1 * 1.34) + " 548 398 C452 " + f(400 + h2 * 1.3) + " 188 " + f(400 + h2 * 1.26) + " 100 412 Z";
  s += R(-300, -300, 1240, 1400, SKIN, 0) + '<rect x="-300" y="-300" width="1240" height="1400" fill="url(#hatch)" opacity=".1"/>';
  s += '<path d="M120 ' + f(400 - h1 * 1.05 - 40) + ' C220 ' + f(400 - h1 * 1.5 - 40) + ' 440 ' + f(400 - h1 * 1.5 - 40) + ' 540 ' + f(400 - h1 * .9 - 40) + '" stroke="' + SKIN2 + '" stroke-width="3" fill="none"/>';   // lid crease
  s += '<path d="M60 120 C200 60 420 50 600 110" stroke="' + HAIR + '" stroke-width="30" fill="none" stroke-linecap="round" opacity=".85"/>';   // brow
  s += '<clipPath id="' + id + '"><path d="' + open + '"/></clipPath><g clip-path="url(#' + id + ')">';
  s += R(60, 200, 520, 400, "#f6f2ea", 0) + '<ellipse cx="116" cy="408" rx="22" ry="18" fill="#e3a49a" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<path d="M150 380 q30 6 52 -4 q14 -6 24 4 M500 420 q-26 -8 -46 4 M490 370 q-20 2 -40 -6" stroke="#c97d72" stroke-width="1.6" fill="none"/>';
  // iris with radial fibres and collarette, the limbus ring, the pupil and a highlight
  s += C(cx, cy, 84, IRIS, 0);
  for (var i = 0; i < 40; i++) { var a = i / 40 * Math.PI * 2, r1 = 34 + 6 * hash(i), r2 = 78 - 6 * hash(i + 9); s += '<path d="M' + f(cx + Math.cos(a) * r1) + ' ' + f(cy + Math.sin(a) * r1) + ' L' + f(cx + Math.cos(a + .05) * r2) + ' ' + f(cy + Math.sin(a + .05) * r2) + '" stroke="' + (i % 2 ? "#5c3f27" : "#9a7650") + '" stroke-width="2"/>'; }
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="46" fill="none" stroke="#5c3f27" stroke-width="3" stroke-dasharray="6 4"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="84" fill="none" stroke="#3a2a1c" stroke-width="5"/>';
  s += C(cx, cy, 28, "#17120d", 1.6) + '<ellipse cx="' + f(cx - 26) + '" cy="' + f(cy - 30) + '" rx="13" ry="9" fill="#fff" opacity=".85"/>';
  if (o.ring) s += G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(lerp(1.4, 1, o.ring)) + ")", '<circle r="106" fill="none" stroke="' + INK + '" stroke-width="30"/><circle r="106" fill="none" stroke="' + METAL + '" stroke-width="25"/><circle r="94" fill="none" stroke="' + INK + '" stroke-width="1.4"/><circle r="106" fill="none" stroke="#e6eaeb" stroke-width="3" stroke-dasharray="14 22"/>', clamp(o.ring * 2));
  s += '</g>';
  // lid margins and lashes
  s += '<path d="' + open + '" fill="none" stroke="' + INK + '" stroke-width="3.2"/>';
  for (i = 0; i <= 16; i++) { var u = i / 16, x = lerp(150, 520, u), yU = cubicY(u, 412, 400 - h1 * 1.28, 400 - h1 * 1.34, 398, 100, 170, 450, 548, x), yL = cubicY(u, 398, 400 + h2 * 1.3, 400 + h2 * 1.26, 412, 548, 452, 188, 100, x);
    s += '<path d="M' + f(x) + ' ' + f(yU - 2) + ' q' + f(6 + 10 * u) + ' -16 ' + f(16 + 8 * u) + ' -22" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (i % 2) s += '<path d="M' + f(x) + ' ' + f(yL + 2) + ' q6 10 12 13" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; }
  if (o.ring) s += G("", '<path d="M' + f(cx + 90) + ' ' + f(cy - 90) + ' L' + f(cx + 340) + ' ' + f(cy - 340) + '" stroke="' + INK + '" stroke-width="36" stroke-linecap="round"/><path d="M' + f(cx + 90) + ' ' + f(cy - 90) + ' L' + f(cx + 340) + ' ' + f(cy - 340) + '" stroke="' + METAL + '" stroke-width="31" stroke-linecap="round"/><path d="M' + f(cx + 170) + ' ' + f(cy - 200) + ' l40 40" stroke="' + INK + '" stroke-width="2"/>', clamp(o.ring * 2));
  if (sp > 0) s += speculum(h1, h2, sp);
  if (o.drop) s += dropper(cx, cy, o.drop, t);
  if (o.track) s += tracker(cx, cy, o.track, o.stop, t);
  return s;
}
// a point on a cubic bezier (for the lashes): returns y at parameter u (x ignored, kept for readability)
function cubicY(u, y0_, y1, y2, y3) { var v = 1 - u; return v * v * v * y0_ + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3; }
// the wire lid speculum: two curved blades under the lid margins joined by a wire with a spring loop at the outer corner
function speculum(h1, h2, k) {
  var top = "M190 " + f(400 - h1 * .98) + " C260 " + f(400 - h1 * 1.12) + " 400 " + f(400 - h1 * 1.12) + " 470 " + f(400 - h1 * .9);
  var bot = "M200 " + f(400 + h2 * .94) + " C270 " + f(400 + h2 * 1.06) + " 400 " + f(400 + h2 * 1.06) + " 470 " + f(400 + h2 * .86);
  var wire = "M470 " + f(400 - h1 * .9) + " C560 " + f(400 - h1 * .8) + " 640 " + f(400 - 60) + " 640 400 C640 " + f(400 + 60) + " 560 " + f(400 + h2 * .8) + " 470 " + f(400 + h2 * .86);
  var g = function (d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + METAL + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>'; };
  return G("", g(top, 9) + g(bot, 9) + g(wire, 6) + '<circle cx="640" cy="400" r="22" fill="none" stroke="' + INK + '" stroke-width="10"/><circle cx="640" cy="400" r="22" fill="none" stroke="' + METAL + '" stroke-width="6"/>', clamp(k * 2));
}
function dropper(cx, cy, k, t) {
  var s = G("translate(" + f(cx) + " 40)", '<path d="M-16 -200 H16 V-40 L6 0 H-6 L-16 -40 Z" fill="#e9ecea" stroke="' + INK + '" stroke-width="2.2"/><rect x="-30" y="-260" width="60" height="70" rx="8" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.2"/>');
  var p = (k * 1.6) % 1, dy = lerp(56, cy - 20, ease(p));
  s += '<path d="M' + f(cx) + ' ' + f(dy - 14) + ' C' + f(cx + 10) + ' ' + f(dy) + ' ' + f(cx + 10) + ' ' + f(dy + 10) + ' ' + f(cx) + ' ' + f(dy + 10) + ' C' + f(cx - 10) + ' ' + f(dy + 10) + ' ' + f(cx - 10) + ' ' + f(dy) + ' ' + f(cx) + ' ' + f(dy - 14) + ' Z" fill="#9fc0d0" stroke="' + INK + '" stroke-width="1.6"/>';
  if (p > .9) s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy - 14) + '" rx="' + f(30 * (p - .9) * 10) + '" ry="8" fill="none" stroke="#9fc0d0" stroke-width="3"/>';
  return s;
}
// the eye tracker's lock on the pupil
function tracker(cx, cy, k, stop, t) {
  var col = stop ? MUTE : ORANGE, r = 108, c = 34, s = "";
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (v) { s += '<path d="M' + f(cx + v[0] * r) + ' ' + f(cy + v[1] * (r - c)) + ' V' + f(cy + v[1] * r) + ' H' + f(cx + v[0] * (r - c)) + '" stroke="' + col + '" stroke-width="7" fill="none" stroke-linecap="round"/>'; });
  s += '<path d="M' + f(cx - 18) + ' ' + f(cy) + ' h36 M' + f(cx) + ' ' + f(cy - 18) + ' v36" stroke="' + (stop ? MUTE : "#fff") + '" stroke-width="4"/>';
  return G("", s, clamp(k));
}
// ── people: flat side-view figures facing left, real body proportions (copied from «لو حد شرق قدامك») ──
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]], toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1]], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    if (o.socks) shoe = '<ellipse cx="' + f(an[0] - 14 * s) + '" cy="' + f(an[1] + 4 * s) + '" rx="' + f(26 * s) + '" ry="' + f(10 * s) + '" fill="#e8e2d4" stroke="' + INK + '" stroke-width="2"/>';
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, o.pants || PANTS, o.pants || PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + (o.pants || PANTS) + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.eye ? '<path d="M' + f(-rx * .78) + ' ' + f(-ry * .26) + ' q' + f(rx * .12) + ' ' + f(o.eye === "shut" ? ry * .08 : -ry * .08) + ' ' + f(rx * .24) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * Math.max(1, s * .7)) + '" fill="none"/>' : "") +
    (o.glasses ? '<rect x="' + f(-rx * 1.14) + '" y="' + f(-ry * .44) + '" width="' + f(rx * .12) + '" height="' + f(ry * .44) + '" rx="' + f(rx * .05) + '" fill="#d5e2e6" stroke="' + INK + '" stroke-width="' + f(2 * Math.max(1, s * .6)) + '"/><path d="M' + f(-rx * 1.02) + ' ' + f(-ry * .3) + ' L' + f(rx * .22) + ' ' + f(-ry * .14) + ' q' + f(rx * .1) + ' ' + f(ry * .02) + ' ' + f(rx * .1) + ' ' + f(ry * .18) + '" stroke="' + INK + '" stroke-width="' + f(2.4 * Math.max(1, s * .6)) + '" fill="none"/>' : "") +
    (o.shield ? '<path d="M' + f(-rx * 1.12) + ' ' + f(-ry * .58) + ' Q' + f(-rx * 1.34) + ' ' + f(-ry * .22) + ' ' + f(-rx * 1.06) + ' ' + f(ry * .14) + ' L' + f(-rx * .4) + ' ' + f(ry * .02) + ' L' + f(-rx * .44) + ' ' + f(-ry * .5) + ' Z" fill="#e6eef0" opacity=".85" stroke="' + INK + '" stroke-width="1.8"/><circle cx="' + f(-rx * .9) + '" cy="' + f(-ry * .3) + '" r="1.6" fill="' + INK + '"/><circle cx="' + f(-rx * .9) + '" cy="' + f(-ry * .1) + '" r="1.6" fill="' + INK + '"/><circle cx="' + f(-rx * .7) + '" cy="' + f(-ry * .2) + '" r="1.6" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
// a patient lying face up on the laser bed, head to the left, under the laser head; o.eye "shut", o.shield
function patientBed(t, o) {
  o = o || {}; var s = "";
  s += R(60, 560, 560, 34, "#d9d3c4", 2.4, 10) + R(110, 594, 26, 140, "#8c9396", 2) + R(540, 594, 26, 140, "#8c9396", 2) + R(80, 520, 120, 44, "#e8e2d4", 2.2, 20);   // bed, legs, pillow
  s += G("translate(350 546) scale(-1 1) rotate(90)", whole(fig({ x: 0, y: 0, lean: 0, shirt: o.shirt || "#a3b4bd", pants: "#8b9aa3", socks: 1, legs: [[0, 0], [0, 0]], hands: [rel(40, 10), rel(40, 10)], eye: o.eye || "open", shield: o.shield })));
  if (o.laser) {   // the laser: a column at the back, an arm over the bed, the optics head right over the eye
    var hx = 172, hy = 300;
    s += R(-60, 110, 120, 640, "#e3e6e4", 2.4, 8) + R(-20, 150, 60, 40, "#4a6f8a", 1.6, 4) + R(-60, 110, 340, 70, "#e3e6e4", 2.4, 8) + R(hx - 46, 180, 92, 110, "#d6dad8", 2.4, 6) + R(hx - 22, 290, 44, 26, "#8c9396", 2);
    if (o.beamOn) s += '<path d="M' + (hx - 6) + ' 316 L' + (hx + 6) + ' 316 L' + (hx + 2) + ' 508 L' + (hx - 2) + ' 508 Z" fill="' + ORANGE + '" opacity="' + f(.35 + .25 * Math.sin(t * 20)) + '"/>';
  }
  return s;
}

// ── shots (line numbers from script.txt) ──
function CH(i, c) { var l = LN[i], ch = window.CHUNKS[i]; return (l.end - l.start) * (ch[c] || 0); }   // seconds into line i where chunk c starts
// 4 · the rule: the eye cut lays itself down, «قاعدة» pinned on top
shot(4, push(330, 400, 0.9, 0.98), function (u, d, t) {
  return paper() + appear(at(u, .1, 1.2), eyeCut(t, {})) + tag("قاعدة", 320, 110, at(u, .6, .3), 40, ORANGE) + G("", T("؟", 120, 420, 120, ORANGE, 800), .3 + .3 * Math.abs(Math.sin(t * 2)));
});
// 5 · the cornea does about two thirds of the focusing; the lens the rest
shot(5, push(300, 400, 1.0, 1.1), function (u, d, t) {
  var k1 = at(u, CH(5, 1), .5);
  return paper() + eyeCut(t, { hl: k1 > 0 ? "cornea" : null, rays: { xf: RETX, k: at(u, .3, 1.6) } }) + label(212, 330, 120, 200, "القرنية", BLUE, at(u, .4, .5), 30) +
    numBox("⅔", 150, 560, at(u, CH(5, 2), .3), 44) + label(300, 360, 360, 220, "العدسة", OLIVE, at(u, CH(5, 2) + .5, .5), 24) + G("", N("⅓", 420, 250, 28, OLIVE), at(u, CH(5, 2) + .8, .3)) + label(RETX, 300, 470, 160, "الشبكية", OLIVE, at(u, 1.6, .5), 24);
});
// 6 · blurred: short sight focuses in front of the retina, long sight behind it; like a camera out of focus
shot(6, push(380, 400, 1.06, 1.12), function (u, d, t) {
  var half = CH(6, 2) || d * .5, hyp = u > half, k = hyp ? at(u, half, 1.2) : at(u, .2, 1.2), xf = hyp ? 640 : 470;
  return paper() + eyeCut(t, { rays: { xf: xf, k: k } }) + tag(hyp ? "بعدها" : "قبلها", 470, 600, at(u, hyp ? half + 1 : 1.2, .3), 30, ORANGE) +
    iconBox(530, 120, 150, '<rect x="-52" y="-30" width="104" height="66" rx="8" fill="#5b5145" stroke="' + INK + '" stroke-width="2"/><circle cy="3" r="24" fill="#d6dad8" stroke="' + INK + '" stroke-width="2"/><circle cy="3" r="13" fill="#7f97a6" stroke="' + INK + '" stroke-width="1.4" style="filter:blur(2px)"/><rect x="-36" y="-42" width="26" height="12" fill="#5b5145" stroke="' + INK + '" stroke-width="1.6"/>' + T("مش متظبطة", 0, 60, 16, ORANGE, 800), at(u, CH(6, 3) || d * .7, .3));
});
// 7 · LASIK reshapes the cornea: the front flattens and the focus lands on the retina
shot(7, push(320, 400, 1.12, 1.24), function (u, d, t) {
  var k = at(u, CH(7, 1) || 1.6, 1.4), xf = lerp(470, RETX, k);
  return paper() + eyeCut(t, { D: 9 * k, hl: "cornea", rays: { xf: xf, k: 1 } }) + label(200, 360, 250, 230, "نحت", ORANGE, at(u, CH(7, 1) + .2, .5), 30) + check(560, 230, 1.3, at(u, CH(7, 1) + 1.6, .5), OLIVE) + label(RETX, 410, 470, 600, "على الشبكية", OLIVE, at(u, CH(7, 1) + 1.8, .5), 24);
}, { tr: "in" });
// 8 · numbing drop, the lid speculum, the suction ring
shot(8, push(330, 380, 0.92, 0.98), function (u, d, t) {
  var c1 = CH(8, 1) || d * .33, c2 = CH(8, 2) || d * .66, sp = at(u, c1, .8), rg = at(u, c2, .7), lk = 6 * Math.sin(t * 1.3) * (1 - rg);
  return paper() + eyeFront(t, { drop: u < c1 + .4 ? clamp(u / Math.max(1, c1)) : 0, spec: sp, ring: rg, look: [lk, 0] }) +
    tag("بنج", 120, 90, at(u, .3, .3), 30, BLUE) + G("", tag("ماسك", 560, 560, 1, 26, OLIVE), sp) + G("", tag("حلقة شفط", 470, 110, 1, 26, ORANGE), rg);
});
// 9 · the flap: a thin cut about a tenth of a millimetre deep, then folded back on its hinge like a book cover
shot(9, push(320, 340, 0.95, 1.0), function (u, d, t) {
  var cut = at(u, .2, 2.2), open = at(u, CH(9, 2) || d * .7, 1.2), D = 0;
  return paper() + corneaClose(t, { cut: cut, blade: cut < 1, open: open }) + label(60, 236, 90, 120, "القرنية", BLUE, at(u, .2, .4), 26) +
    G("", '<path d="M' + (FX0 - 40) + ' ' + f(y0(FX0 - 40)) + ' v' + FD + '" stroke="' + ORANGE + '" stroke-width="3"/>' + N("0.1", FX0 - 90, y0(FX0) + 36, 30, ORANGE) + T("مللي", FX0 - 90, y0(FX0) + 64, 18, ORANGE, 700), at(u, CH(9, 1) || 1.6, .4)) +
    iconBox(540, 590, 140, '<path d="M0 30 L-50 18 V-36 L0 -24 Z" fill="#c9b98f" stroke="' + INK + '" stroke-width="2"/><path d="M0 30 L' + f(50 * Math.cos(open * 2.4)) + ' ' + f(18 - 30 * Math.sin(open * 2.4)) + ' V' + f(-36 - 30 * Math.sin(open * 2.4)) + ' L0 -24 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>', at(u, CH(9, 2) || d * .7, .3)) + G("", tag("غطا", 330, 120, 1, 30, ORANGE), open);
});
// 10 · the cold excimer laser takes off layers thinner than a hair, in seconds
shot(10, push(320, 330, 0.95, 1.0), function (u, d, t) {
  var k = at(u, .4, d - 1.2), bx = 320 + 190 * Math.sin(t * 7.3) * Math.cos(t * 1.7);
  return paper() + corneaClose(t, { open: 1, D: 34 * k, beam: k > 0 && k < 1 ? bx : null }) + tag("الإكسيمر", 160, 70, at(u, CH(10, 0) + .8, .3), 30, ORANGE) +
    G("", '<path d="M70 120 v40 M50 130 l40 20 M50 150 l40 -20" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round"/>' + T("بارد", 70, 196, 22, BLUE, 800), at(u, 1.2, .3)) +
    iconBox(540, 620, 150, '<circle cx="-14" cy="0" r="44" fill="#5b4636" stroke="' + INK + '" stroke-width="2"/><path d="M38 -44 V44" stroke="' + ORANGE + '" stroke-width="1.4"/>' + T("شعرة", -14, 64, 16, INK, 800) + T("طبقة", 40, 64, 16, ORANGE, 800), at(u, CH(10, 1) || d * .5, .3));
}, { tr: "in" });
// 11 · short sight: flatten the middle; long sight: take a ring off so the middle bulges more
shot(11, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var half = CH(11, 1) || d * .5, k1 = at(u, .3, 1.2), k2 = at(u, half + .2, 1.2), s = paper();
  s += G("translate(122 -40) scale(.62)", corneaClose(t, { open: 1, D: 34 * k1, mode: "myo" })) + tag("قصر نظر", 320, 40, at(u, .2, .3), 26, BLUE);
  s += G("translate(122 320) scale(.62)", corneaClose(t, { open: 1, D: 30 * k2, mode: "hyp" }), clamp(.25 + k2)) + G("", tag("طول نظر", 320, 400, 1, 26, OLIVE), at(u, half, .3));
  return s;
});
// 12 · the eye tracker follows the pupil hundreds of times a second; a big jump and the laser stops
shot(12, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var jump = CH(12, 2) || d * .66, big = u > jump && u < jump + 1.2, look = big ? [70, -30] : [10 * Math.sin(t * 9) + 6 * Math.sin(t * 23), 6 * Math.cos(t * 13)];
  return paper() + eyeFront(t, { spec: 1, look: look, track: at(u, .3, .3), stop: big }) + tag("مئات المرات في الثانية", 320, 690, at(u, CH(12, 1) || 1.6, .3), 22, ORANGE) + G("", tag("وقف", 320, 110, 1, 36, ORANGE), big ? 1 : 0) + label(330, 352, 140, 160, "جهاز تتبع", OLIVE, at(u, .4, .5), 24);
});
// 13 · the flap goes back and sticks on its own, no stitches
shot(13, push(320, 300, 1.0, 1.06), function (u, d, t) {
  var open = 1 - at(u, .2, 1.6);
  return paper() + corneaClose(t, { open: open, D: 34 }) + check(320, 100, 1.2, at(u, 2.0, .4), OLIVE) +
    iconBox(540, 600, 140, '<path d="M-40 30 L40 -30" stroke="' + METAL + '" stroke-width="6" stroke-linecap="round"/><path d="M-40 30 L40 -30" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="34" cy="-25" rx="6" ry="3" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M40 -30 C70 -60 60 10 20 20" stroke="' + INK + '" stroke-width="2" fill="none"/>' + cross(0, 0, 1, at(u, 2.6, .4)), at(u, 2.2, .3));
}, { tr: "out" });
// 14 · types: LASIK (blade) and Femto-LASIK (a second laser makes the flap)
shot(14, push(320, 360, 1.0, 1.04), function (u, d, t) {
  var c1 = CH(14, 2) || d * .4, c2 = CH(14, 3) || d * .7, s = paper();
  s += tag("أنواع؟", 320, 30, at(u, .2, .3), 40, INK);
  s += G("translate(122 -10) scale(.62)", corneaClose(t, { cut: at(u, c1, 1.6), blade: 1 }), clamp(.3 + at(u, c1 - .3, .3))) + G("", tag("ليزك", 540, 70, 1, 28, OLIVE) + T("شفرة", 110, 300, 24, OLIVE, 800), at(u, c1, .3));
  s += G("translate(122 350) scale(.62)", corneaClose(t, { bubbles: at(u, c2, 1.4) }) + (at(u, c2, 1.4) > 0 && at(u, c2, 1.4) < 1 ? beam(FX0 + (FX1 - FX0) * at(u, c2, 1.4), y0(FX0 + (FX1 - FX0) * at(u, c2, 1.4)) + FD, t) : ""), clamp(.3 + at(u, c2 - .3, .3))) + G("", tag("فيمتو", 540, 430, 1, 28, BLUE) + T("ليزر", 110, 660, 24, BLUE, 800), at(u, c2, .3));
  return s;
});
// 15 · PRK: no flap; the outer skin of cells is brushed off, the laser works on the surface, the cells grow back in a few days
shot(15, push(320, 320, 1.0, 1.05), function (u, d, t) {
  var c1 = CH(15, 1) || d * .3, c2 = CH(15, 2) || d * .6, c3 = CH(15, 3) || d * .8, rm = at(u, c1, 1.2), rg = at(u, c2, 1.4);
  var gone = function (x) { return x > 130 && x < 130 + 380 * rm && Math.abs(x - 320) < 190 * (1 - rg); };
  var sx = 130 + 380 * rm, spat = rm > 0 && rm < 1 ? G("translate(" + f(sx) + " " + f(y0(sx) + 2) + ") rotate(-35)", '<path d="M0 0 L-16 -8 L-10 -22 L6 -12 Z" fill="' + METAL + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -16 L-150 -90" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M-12 -16 L-150 -90" stroke="' + METAL + '" stroke-width="6" stroke-linecap="round"/>') : "";
  return paper() + corneaClose(t, { noFlap: 1, epiGone: gone, D: 18 * at(u, c1 + 1, .8) }) + spat + label(60, y0(60) + 12, -20, 110, "القشرة", OLIVE, at(u, c1, .5), 26) + tag("PRK", 520, 80, at(u, .2, .3), 34, ORANGE) +
    G("", tag("كام يوم", 320, 560, 1, 28, BLUE), at(u, c2 + .4, .3)) + G("", '<path d="M490 560 l14 -20 l10 14 l14 -22 l10 16" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-linejoin="round"/>' + T("بتوجع", 520, 600, 22, ORANGE, 800), at(u, c3, .3));
});
// 16 · SMILE: a small lens cut inside the cornea, pulled out through a small side opening
shot(16, push(320, 320, 1.0, 1.06), function (u, d, t) {
  var c1 = CH(16, 1) || d * .3, c2 = CH(16, 2) || d * .6, ln = at(u, .4, 1.4), inc = at(u, c2 - .4, .5), out = at(u, c2 + .4, 1.6);
  return paper() + corneaClose(t, { noFlap: 1, len: ln, inc: inc, out: out }) + tag("سمايل", 320, 60, at(u, .2, .3), 34, ORANGE) + label(260, y0(260) + 100, 150, 560, "عدسة صغيرة", BLUE, at(u, c1, .5), 24) + label(512, y0(512) + 40, 600, 140, "فتحة", ORANGE, at(u, c2, .5), 24);
});
// 17 · the check-up: corneal thickness measured, and the glasses number stable for a year
shot(17, push(320, 330, 1.0, 1.05), function (u, d, t) {
  var c1 = CH(17, 2) || d * .6, sx = 600;
  return paper() + corneaClose(t, {}) + G("", measure(sx, y0(sx), sx, y0(sx) + CS + 14, at(u, .6, .8), ""), 1) + G("", T("سُمك", sx - 60, y0(sx) + 170, 26, ORANGE, 800), at(u, 1.2, .3)) +
    iconBox(170, 600, 220, '<rect x="-90" y="-70" width="180" height="140" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M-90 -40 H90" stroke="' + INK + '" stroke-width="2"/>' + T("سنة", 0, -48, 20, INK, 800) + N("-3.00", -40, 10, 24, INK) + N("-3.00", 44, 10, 24, INK) + check(0, 46, .6, at(u, c1 + .8, .4), BLUE), at(u, c1, .3)) + G("", tag("ثابت", 470, 600, 1, 30, BLUE), at(u, c1 + .4, .3));
});
// 18 · afterwards: sleep a few hours with the clear shields on; never rub the eye (the flap could slip)
shot(18, push(340, 440, 1.16, 1.22), function (u, d, t) {
  var c1 = CH(18, 2) || d * .55, k = at(u, c1, .4), s = paper() + patientBed(t, { eye: "shut", shield: 1 });
  s += G("", T("z", 130 + 10 * Math.sin(t * 2), 420 - (t * 30 % 60), 28, BLUE, 800) + T("z", 160, 380 - (t * 30 % 60), 36, BLUE, 800), at(u, .4, .3));
  s += G("", inset(440, 270, 120, G("scale(.7) translate(-320 -400)", eyeFront(t, {}) + G("translate(" + f(320 + 30 * Math.sin(t * 9)) + " 360)", '<path d="M-140 260 L-30 40 C-20 0 40 -10 60 30 L80 80 L-40 300 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/><path d="M-30 40 C-10 20 20 30 30 60 M-10 10 C10 -10 40 0 50 40" stroke="' + INK + '" stroke-width="2.4" fill="none"/>')) + cross(0, 0, 1.6, at(u, c1 + .6, .4)), 1), k);
  return s + G("", tag("ماتفركش", 440, 430, 1, 30, ORANGE), at(u, c1 + .9, .3)) + G("", tag("كام ساعة", 440, 200, 1, 28, BLUE), at(u, .8, .3) * (1 - k));
});
// 19 · drops on time, sunglasses, a plastic shield at night for about a week
shot(19, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = [0, CH(19, 1) || d * .33, CH(19, 2) || d * .55], s = paper();
  s += G("", G("translate(160 210)", '<path d="M-16 -110 H16 V-30 L6 0 H-6 L-16 -30 Z" fill="#e9ecea" stroke="' + INK + '" stroke-width="2.2"/><rect x="-36" y="-180" width="72" height="80" rx="10" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 ' + f(10 + 40 * ((t * .8) % 1)) + ' c8 10 8 16 0 16 c-8 0 -8 -6 0 -16z" fill="#9fc0d0" stroke="' + INK + '" stroke-width="1.4"/>') +
    G("translate(450 170)", C(0, 0, 70, "#f4ecdb", 3) + '<path d="M0 0 V-48 M0 0 L' + f(40 * Math.cos(t * .8)) + ' ' + f(40 * Math.sin(t * .8)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>') + T("القطرة في مواعيدها", 320, 330, 26, BLUE, 800), at(u, .2, .4));
  s += G("translate(320 470)", '<path d="M-180 -20 H180 M-170 -20 C-170 50 -40 50 -30 -10 M170 -20 C170 50 40 50 30 -10 M-30 -10 Q0 -26 30 -10" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M-166 -14 C-160 40 -48 40 -36 -6 Z M166 -14 C160 40 48 40 36 -6 Z" fill="#3a3530" stroke="' + INK + '" stroke-width="2"/>' + T("نضارة شمس", 0, 80, 24, OLIVE, 800), at(u, c[1], .4));
  s += G("translate(320 680)", '<path d="M-60 -50 Q-90 0 -60 50 L50 40 Q70 0 50 -40 Z" fill="#e6eef0" stroke="' + INK + '" stroke-width="2.4"/>' + [[-40, -20], [-40, 10], [-14, -6], [-14, 24], [12, -12], [12, 18]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + INK + '"/>'; }).join("") + '<path d="M120 -40 a36 36 0 1 0 30 50 a28 28 0 1 1 -30 -50 z" fill="#d8ccae" stroke="' + INK + '" stroke-width="2"/>' + numBox("7", -170, 10, 1, 34, true) + T("ليالي", -170, 60, 18, INK, 800), at(u, c[2], .4));
  return s;
});
// 20 · no water in the eye, no make-up, no swimming pool for about two weeks
shot(20, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), ks = [at(u, .2, .3), at(u, d * .25, .3), at(u, d * .45, .3)];
  s += G("translate(320 150)", '<path d="M-60 -40 H40 V-10 H10 V10" stroke="' + INK + '" stroke-width="16" fill="none"/><path d="M-60 -40 H40 V-10 H10 V10" stroke="' + METAL + '" stroke-width="11" fill="none"/>' + [0, 1, 2].map(function (i) { var p = (t * 1.5 + i / 3) % 1; return '<path d="M10 ' + f(30 + 60 * p) + ' c6 8 6 13 0 13 c-6 0 -6 -5 0 -13z" fill="#9fc0d0" stroke="' + INK + '" stroke-width="1.4"/>'; }).join("") + cross(0, 30, 1.2, at(u, .5, .4)), ks[0]);
  s += G("translate(320 390)", '<rect x="-100" y="-12" width="140" height="24" rx="10" fill="#3a3530" stroke="' + INK + '" stroke-width="2"/><rect x="40" y="-16" width="80" height="32" rx="6" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M' + (-96 + i * 7) + ' -12 v-12 M' + (-96 + i * 7) + ' 12 v12" stroke="' + INK + '" stroke-width="2"/>'; }).join("") + cross(0, 0, 1.2, at(u, d * .25 + .3, .4)), ks[1]);
  s += G("translate(320 610)", R(-160, -10, 320, 90, "#9fbccb", 2.4) + wave(-150, 10, 150, 10, t, BLUE, 6, 40, 1, 3) + R(-170, -30, 20, 120, "#e8e2d4", 2) + cross(0, 30, 1.2, at(u, d * .45 + .3, .4)), ks[2]);
  return s + numBox("14", 560, 380, at(u, d * .6, .3), 44, true) + T("يوم", 560, 440, 24, INK, 800);
});
// 21 · the myth: no more glasses for life — no
shot(21, push(320, 400, 1.08, 0.98), function (u, d, t) {
  var g = '<g transform="translate(320 360)"><path d="M-200 -20 H200 M-180 -20 C-180 70 -40 70 -36 -6 M180 -20 C180 70 40 70 36 -6 M-36 -6 Q0 -30 36 -6" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="M-176 -14 C-170 56 -48 56 -40 -2 Z M176 -14 C170 56 48 56 40 -2 Z" fill="#d5e2e6" stroke="' + INK + '" stroke-width="2"/></g>';
  return paper() + G("", g, 1 - .5 * at(u, .4, .6)) + G("", T("∞", 320, 590, 110, BLUE, 800), at(u, .6, .4)) + T("للأبد؟", 320, 180, 40, INK, 800) + cross(320, 400, 2.6, at(u, d - 1.3, .5));
});
// 22 · after forty the lens itself stiffens: reading glasses, nothing to do with the cornea
shot(22, push(330, 400, 1.06, 1.14), function (u, d, t) {
  var c2 = CH(22, 2) || d * .6;
  return paper() + eyeCut(t, { hl: "lens" }) + bigNum("40+", "سنة", 140, 620, at(u, .2, .4), ORANGE, 72) + label(300, 420, 360, 640, "عدسة العين", BLUE, at(u, c2, .5), 28) + G("", cross(210, 470, .8, 1), at(u, c2 + .8, .4)) +
    iconBox(130, 150, 170, '<rect x="-60" y="10" width="120" height="44" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M-50 22 h100 M-50 32 h100 M-50 42 h70" stroke="' + MUTE + '" stroke-width="2"/><path d="M-70 -20 H70 M-60 -20 C-60 14 -14 14 -10 -16 M60 -20 C60 14 14 14 10 -16" stroke="' + INK + '" stroke-width="4" fill="none"/>' + T("قراية", 0, 80, 18, OLIVE, 800), at(u, CH(22, 1) || 1.2, .3));
}, { tr: "out" });
// 23 · recap: flap opens, the laser shapes the cornea, the flap goes back
shot(23, push(320, 390, 0.62, 0.66), function (u, d, t) {
  var c = [0, CH(23, 1) || d * .3, CH(23, 2) || d * .6, CH(23, 3) || d * .8], s = paper();
  s += G("translate(0 -160)", corneaClose(t, { open: at(u, c[1], .8) }), clamp(.3 + at(u, c[1], .3))) + callout("1", -120, 90, at(u, c[1], .3), 26);
  s += G("translate(0 240)", corneaClose(t, { open: 1, D: 34 * at(u, c[2], 1.2), beam: at(u, c[2], 1.2) < 1 ? 320 + 180 * Math.sin(t * 7) : null }), clamp(.3 + at(u, c[2], .3))) + callout("2", -120, 490, at(u, c[2], .3), 26);
  s += G("translate(0 640)", corneaClose(t, { open: 1 - at(u, c[3], .8), D: 34 }), clamp(.3 + at(u, c[3], .3))) + callout("3", -120, 890, at(u, c[3], .3), 26);
  return s;
}, { tr: "out" });
// 24 · the odd fact: in 1981 the excimer laser was first tried on cartilage from a leftover turkey
shot(24, push(330, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.0, 1.6), bx = lerp(250, 420, (Math.sin(t * 5) + 1) / 2), s = paper();
  s += R(60, 560, 520, 30, "#e3e6e4", 2.4, 6) + '<ellipse cx="320" cy="555" rx="230" ry="20" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/>';
  // a drumstick: meat, the bone, and the white cartilage cap at the knuckle
  s += P("M120 520 C100 440 180 380 260 400 C300 410 330 440 350 470 L330 520 Z", "#b07a4a", 2.4) + '<path d="M150 470 q30 -30 70 -30 M170 500 q40 -20 90 -10" stroke="#8a5a34" stroke-width="2" fill="none"/>';
  s += P("M330 470 L470 440 L478 470 L340 510 Z", "#efe6d2", 2.2) + P("M462 420 C500 400 540 420 530 456 C540 488 500 506 470 488 C452 470 448 440 462 420 Z", "#f8f4ea", 2.4);
  s += '<path d="M' + f(250 + 0 * k) + ' 0 L' + f(250 + 0 * k) + ' 0" />';
  if (k > 0) s += draw("M492 430 Q500 456 494 482", k, ORANGE, 4) + beam(lerp(494, 494, 1), 430 + 50 * ((t * .7) % 1), t);
  s += label(500, 470, 420, 640, "غضروف", ORANGE, at(u, .6, .5), 26) + tag("1981", 160, 160, at(u, 1.4, .3), 34) + iconBox(500, 140, 150, '<ellipse cx="0" cy="12" rx="52" ry="34" fill="#b07a4a" stroke="' + INK + '" stroke-width="2"/><path d="M-44 0 C-60 -30 -40 -40 -30 -20 M44 0 C60 -30 40 -40 30 -20" stroke="' + INK + '" stroke-width="2" fill="#efe6d2"/><ellipse cx="0" cy="46" rx="66" ry="8" fill="#f4efe3" stroke="' + INK + '" stroke-width="1.6"/>' + T("ديك رومي", 0, -44, 16, ORANGE, 800), at(u, .3, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a young man in glasses (side view). line 1: on the laser bed, a 15-minute clock. line 2: no stitches
  var s = "";
  if (li === 0) {
    var m = fig({ x: 380, y: 900, s: 3.1, lean: 2 * Math.sin(t * 1.7), tilt: 4 * Math.sin(t * 2.3), shirt: SHIRT_V, glasses: 1, eye: "open", hands: [rel(122 + 4 * Math.sin(t * 3), 30), null], bend: [-1, -1] });
    var bl = (1 + Math.sin(t * 2.6)) * 1.6, rows = ["E", "F P", "T O Z", "L P E D"], ch = "";
    rows.forEach(function (r, i) { ch += N(r, 0, -70 + i * 40, 34 - i * 6, INK); });
    s += iconBox(120, 170, 190, '<g style="filter:blur(' + bl.toFixed(2) + 'px)">' + ch + '</g>', ease(t / .4)) + m.far + m.body + m.near;
  } else {
    var u1 = t - LN[1].start;
    s += G("translate(10 30) scale(.95)", patientBed(t, { laser: 1, beamOn: u1 > 1.2 && li === 1 }));
    s += iconBox(500, 80, 120, stopwatchIcon(0, 4, 44, clamp(u1 / 4)) + N("15", 0, 64, 20, ORANGE), ease(u1 / .4));
  }
  if (li >= 2) { var v = t - LN[2].start; s += iconBox(130, 90, 130, '<path d="M-40 30 L40 -30" stroke="' + METAL + '" stroke-width="6" stroke-linecap="round"/><path d="M-40 30 L40 -30" stroke="' + INK + '" stroke-width="1.4"/><path d="M40 -30 C70 -60 60 10 20 20" stroke="' + INK + '" stroke-width="2" fill="none"/>' + cross(0, 0, 1, ease((v - .3) / .4)), ease(v / .3)); }
  return s;
};
function stopwatchIcon(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2;
  return R(x - 9, y - r - 14, 18, 10, INK, 0, 2) + C(x, y, r, "#f4ecdb", 2.4) + (k > 0 ? '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 6) + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 6)) + ' ' + f(y + Math.sin(a) * (r - 6)) + ' Z" fill="' + ORANGE + '" opacity=".35"/>' : "") +
    '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 10)) + ' ' + f(y + Math.sin(a) * (r - 10)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
}
SCENE.bumper = function (u, t) {
  return G("translate(90 100) scale(.3) translate(-320 -400)", eyeFront(t, { look: [14 * Math.sin(t * 1.4), 6 * Math.sin(t * 2.1)] }));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(-10 20) scale(.42) translate(0 -120)", eyeCut(t, { D: 9, hl: "cornea", rays: { xf: RETX, k: 1 } })) + G("translate(300 10) scale(.36) translate(150 0)", corneaClose(t, { open: .6 + .3 * Math.sin(t * 1.2), D: 34 })) +
    callout("1", 520, 60, ease(u / .3)) + callout("2", 440, 150, ease(u / .3 - .5)) + callout("3", 360, 70, ease(u / .3 - 1)) + callout("4", 230, 150, ease(u / .3 - 1.5));
};
