window.CHUNKS = [[0.0], [0.0, 0.8478], [0.0, 0.2759], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.403, 0.6567, 0.8358], [0.0, 0.3617], [0.0, 0.6481], [0.0, 0.6769], [0.0, 0.3393, 0.6607], [0.0, 0.3396], [0.0, 0.3059, 0.6, 0.8235], [0.0, 0.3962], [0.0], [0.0, 0.5854], [0.0, 0.3433, 0.4925], [0.0, 0.5], [0.0], [0.0, 0.5], [0.0, 0.1507, 0.7808], [0.0, 0.6279], [0.0, 0.3827, 0.7407], [0.0], [0.0, 0.2419, 0.5323, 0.7581], [0.0, 0.2637, 0.5714], [0.0], [0.0]];
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

// ── «إزاي تبعد الناموس عنك؟» — drawings. The mosquito, skin, smell and breath helpers come from the first mosquito
// episode (videos/mosquito); the real-proportion people (fig, limb, ik, rel, HB) come from videos/choking.
var MQ = "#7a6650", MQ_D = "#43372b", MQ_L = "#d9cfba", BLOOD = "#a8362a", HAIR = "#3d3229", SKIN_L = "#e8c2ac", FAT = "#ecd9a8",
    SHIRTS = ["#b9c2b0", "#c9b48f", "#9fb0bd", "#c8a79a"], NIGHT = "#55524b";

// a mosquito, about 140 × 100 units at s = 1, facing left. op: fly (default true), flip, rot, fed 0..1, bite, ph, eye, op
function mosq(x, y, s, t, op) {
  op = op || {}; var fly = op.fly !== false, ph = op.ph || 0, fl = fly ? Math.sin(t * 46 + ph * 7) : 0;
  var bx = fly ? 3 * Math.sin(t * 5 + ph) : 0, by = fly ? 4 * Math.cos(t * 6.3 + ph) : 0;
  var leg = function (d, w) { return '<path d="' + d + '" fill="none" stroke="' + MQ_D + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"/>'; };
  var sw = fly ? 2.5 * Math.sin(t * 7 + ph) : 0, b = "";
  b += G("translate(5 -1)", leg("M-8 9 L" + f(-26 + sw) + " 30 L" + f(-36 + sw) + " 60") + leg("M-1 11 L" + f(2 + sw) + " 38 L" + f(-6 + sw) + " 64") + leg("M6 9 L32 20 L56 " + f(-6 + sw) + " L72 " + f(-30 + sw)), .45);
  b += '<ellipse cx="38" cy="0" rx="42" ry="' + (fly ? 11 : 8) + '" transform="translate(2 -11) rotate(' + f(fly ? -16 + 24 * fl : -13) + ')" fill="#f6f1e6" fill-opacity=".72" stroke="' + INK + '" stroke-width="1.2"/>';
  if (fly) b += '<ellipse cx="38" cy="0" rx="42" ry="10" transform="translate(2 -11) rotate(' + f(-16 - 24 * fl) + ')" fill="#f6f1e6" fill-opacity=".35" stroke="' + INK + '" stroke-width=".8"/>';
  var fed = op.fed || 0, ah = 7 * fed;
  b += '<path d="M10 -8 C30 ' + f(-17 - ah * .6) + ' 58 ' + f(-23 - ah * .5) + ' 76 -17 C62 ' + f(-3 + ah) + ' 30 ' + f(6 + ah * 1.3) + ' 10 8 Z" fill="' + (fed > .05 ? BLOOD : MQ) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  for (var k = 1; k <= 5; k++) b += '<path d="M' + (12 + k * 10) + ' ' + f(-10 - k * 1.7) + ' L' + (9 + k * 10) + ' ' + f(5 - k * 2.6 + ah) + '" stroke="' + (fed > .05 ? "#7d241b" : MQ_L) + '" stroke-width="2.6" fill="none"/>';
  b += '<ellipse cx="0" cy="0" rx="16" ry="13" transform="rotate(-10)" fill="' + MQ_D + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M-9 -6 Q0 -11 9 -8" stroke="' + MQ_L + '" stroke-width="1.6" fill="none"/>';
  b += C(-20, 2, 7.5, MQ, 1.6) + '<ellipse cx="-21.500" cy="1" rx="4.6" ry="5.6" fill="' + (op.eye || "#2d3a2a") + '"/>';
  b += leg(op.bite ? "M-26 5 L-40 64" : "M-26 5 L-58 30", 2.6) + leg("M-26 3 L-40 11", 1.6) + leg("M-25 -3 C-36 -14 -46 -12 -55 -3", 1.5) + leg("M-24 -5 C-32 -21 -44 -21 -51 -14", 1.5);
  b += leg("M-8 9 L" + f(-24 - sw) + " 32 L" + f(-30 - sw) + " 62") + leg("M-1 11 L" + f(6 - sw) + " 40 L" + f(0 - sw) + " 66") + leg("M6 9 L36 22 L60 " + f(-8 - sw) + " L78 " + f(-30 - sw));
  return G("translate(" + f(x + bx * s) + " " + f(y + by * s) + ") rotate(" + f(op.rot || 0) + ") scale(" + f(op.flip ? -s : s) + " " + f(s) + ")", b, op.op);
}
// a front-view bust with no face, 124 × 150 at s = 1 around the head centre. op: shirt, dark, hot, bites, long
function bust(x, y, s, op) {
  op = op || {}; var sk = op.dark ? "#3d3a34" : op.hot ? "#d98658" : SKIN, sh = op.dark ? "#33302b" : op.shirt || SHIRTS[0], hr = op.dark ? "#2a2723" : HAIR, b = "";
  if (op.long) b += '<path d="M-33 -6 C-40 40 -34 56 -26 60 L26 60 C34 56 40 40 33 -6 Z" fill="' + hr + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M-62 112 C-62 64 -34 52 -14 47 L-14 28 L14 28 L14 47 C34 52 62 64 62 112 Z" fill="' + sh + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-14 30 L-14 47 Q0 58 14 47 L14 30 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/>';
  b += '<ellipse cx="-30" cy="2" rx="5" ry="9" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="30" cy="2" rx="5" ry="9" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/>';
  b += '<ellipse cx="0" cy="0" rx="29" ry="36" fill="' + sk + '" stroke="' + INK + '" stroke-width="2"/>';
  b += '<path d="M-29 -4 C-33 -46 33 -46 29 -4 C20 -24 -18 -26 -29 -4 Z" fill="' + hr + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  if (op.bites) [[-12, 8], [10, 16], [-4, 38], [16, -2], [-34, 78], [30, 84]].forEach(function (p, i) { var k = pop(op.bites - i * .25); if (k > 0) b += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(4.2 * k) + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/>'; });
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a head and shoulders in profile, facing left; the mouth is at (-45, 22) and the nose tip at (-54, 8)
function profile(x, y, s, op) {
  op = op || {}; var b = '<path d="M0 -46 C-22 -46 -36 -36 -38 -22 L-42 -8 L-54 8 L-44 12 L-46 20 L-43 25 L-40 38 C-32 44 -22 45 -14 44 L-12 62 C-40 68 -60 76 -64 130 L78 130 C76 90 60 72 30 62 L34 30 C50 10 44 -46 0 -46 Z" fill="' + (op.hot ? "#d98658" : SKIN) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-12 62 C-40 68 -60 76 -64 130 L78 130 C76 90 60 72 30 62 C16 71 0 71 -12 62 Z" fill="' + (op.shirt || SHIRTS[2]) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-36 -28 C-30 -54 32 -58 43 -20 C47 0 41 20 34 30 C31 10 27 -6 14 -14 C0 -24 -20 -22 -36 -28 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  b += '<ellipse cx="12" cy="4" rx="5" ry="8" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.4"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a pregnant woman standing in profile, facing left (head centre at 0,0; the figure runs down to y = 300)
function pregnant(x, y, s) {
  var b = '<path d="M30 -30 C52 0 50 60 44 100 L20 100 L24 20 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M-14 44 L-12 60 C-34 70 -40 96 -38 124 C-76 140 -86 204 -40 234 L-38 300 L46 300 L48 110 C48 84 40 68 30 62 L34 30 Z" fill="#c8a79a" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M0 -46 C-22 -46 -36 -36 -38 -22 L-42 -8 L-54 8 L-44 12 L-46 20 L-43 25 L-40 38 C-32 44 -22 45 -14 44 L-12 62 Q10 72 30 62 L34 30 C50 10 44 -46 0 -46 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-36 -28 C-30 -54 32 -58 43 -20 C47 0 41 20 34 30 C31 10 27 -6 14 -14 C0 -24 -20 -22 -36 -28 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  b += '<path d="M14 84 C6 124 -14 156 -52 168" fill="none" stroke="' + INK + '" stroke-width="18" stroke-linecap="round"/><path d="M14 84 C6 124 -14 156 -52 168" fill="none" stroke="' + SKIN + '" stroke-width="14" stroke-linecap="round"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a bed from the side with someone asleep, 440 wide; the head is at (92, -34) from the mattress top-left corner
function bed(x, y, t) {
  var br = 3 * Math.sin(t * 1.6), b = R(-14, -96, 16, 176, WOOD_D, 2) + R(424, -40, 14, 120, WOOD_D, 2) + R(0, 0, 426, 40, "#e9e1cc", 2) + R(0, 40, 426, 22, WOOD, 2) + R(8, 62, 14, 22, WOOD_D, 1.6) + R(402, 62, 14, 22, WOOD_D, 1.6);
  b += '<path d="M24 0 C24 -30 60 -34 96 -30 C130 -26 140 -10 140 0 Z" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>';
  b += '<ellipse cx="92" cy="-36" rx="30" ry="26" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M62 -38 C60 -70 112 -74 120 -46 C104 -58 80 -56 62 -38 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M118 0 C122 ' + f(-48 - br) + ' 170 ' + f(-62 - br) + ' 230 ' + f(-54 - br) + ' C300 -46 350 -40 410 -22 L420 0 Z" fill="' + SHIRTS[2] + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M150 ' + f(-40 - br) + ' Q250 -30 400 -14" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".5"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", b);
}
// a CO₂ molecule (O–C–O) and a plume of them drifting along path(p) → [x, y, spread]
function co2(x, y, s, op) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", C(-10, 0, 6, "#8fb0c4", 1.4) + C(10, 0, 6, "#8fb0c4", 1.4) + C(0, 0, 7, "#57534a", 1.4), op); }
function plume(path, t, k, n, sp, sz) {
  var s = ""; for (var i = 0; i < n; i++) { var p = (i / n + t * (sp || .07)) % 1; if (p > k) continue; var q = path(p), lat = (hash(i + 3) - .5) * 2 * q[2] + 5 * Math.sin(t * 2 + i);
    s += co2(q[0] + lat * .35, q[1] + lat, (sz || .8) * (.8 + .4 * hash(i)), Math.min(1, p * 8) * (1 - p * .55)); }
  return s;
}
function breath(x, y, len, t, k, n, sz) { return plume(function (p) { return [x - len * p, y + 30 * p * Math.sin(p * 5 + 1), 6 + 46 * p]; }, t, k == null ? 1 : k, n || 14, .09, sz); }
// smell rising off skin: n wavy lines of colour col
function fumes(x, y, w, n, h, t, col, k, amp) {
  var s = ""; for (var i = 0; i < n; i++) { var xi = x - w / 2 + w * (i + .5) / n, hh = h * (.65 + .35 * hash(i + n)); s += wave(xi, y, xi + 14 * (hash(i) - .5), y - hh, t + i * .7, col, amp || 6, 26, k == null ? 1 : k, 3); }
  return s;
}
function drop(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M0 -24 C13 -4 17 6 17 13 A17 17 0 0 1 -17 13 C-17 6 -13 -4 0 -24 Z" fill="' + (col || BLOOD) + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 12 Q-8 20 0 22" stroke="#fff" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>'); }
// a strip of skin seen from the side: surface at y, hairs, epidermis and dermis below; h = depth
function skin(x, y, w, h, t, op) {
  op = op || {}; var d = "M" + f(x) + " " + f(y), k, s = "";
  for (k = 1; k <= 20; k++) d += " L" + f(x + w * k / 20) + " " + f(y + 2.5 * Math.sin(k * 1.3));
  s += '<path d="' + d + " L" + f(x + w) + " " + f(y + h) + " L" + f(x) + " " + f(y + h) + ' Z" fill="' + SKIN_L + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var e = Math.min(h * .3, 46); d = "M" + f(x) + " " + f(y); for (k = 1; k <= 20; k++) d += " L" + f(x + w * k / 20) + " " + f(y + 2.5 * Math.sin(k * 1.3));
  for (k = 20; k >= 0; k--) d += " L" + f(x + w * k / 20) + " " + f(y + e + 7 * Math.sin(k * 1.9));
  s += '<path d="' + d + ' Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.4"/>';
  if (h > 150) { for (k = 0; k < Math.floor(w / 46); k++) s += '<ellipse cx="' + f(x + 26 + k * 46) + '" cy="' + f(y + h - 26 + 6 * hash(k)) + '" rx="22" ry="17" fill="' + FAT + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  for (k = 0; k < Math.floor(w / 58); k++) { var hx = x + 30 + k * 58 + 14 * hash(k + 5), sw = 4 * Math.sin(t * 1.7 + k); s += '<path d="M' + f(hx) + ' ' + f(y + Math.min(h - 8, 60)) + ' Q' + f(hx + 4) + ' ' + f(y - 10) + ' ' + f(hx + 16 + sw) + ' ' + f(y - (op.hair || 34)) + '" stroke="' + HAIR + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
  return s;
}
// where a mosquito is on its way from a to b (k 0..1), with a wobble; returns [x, y]
function fly(a, b, k, t, i) { var w = 1 - Math.abs(2 * k - 1) * .4; return [lerp(a[0], b[0], k) + 14 * w * Math.sin(t * 3.1 + i * 2), lerp(a[1], b[1], k) + 12 * w * Math.cos(t * 3.7 + i)]; }
var ROW = [95, 245, 395, 545];   // four people in a row

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
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

// ── this episode's objects ──
// a pump spray bottle, 0,0 = bottom centre, about 80 × 190 at s = 1; mist 0..1 sprays to the left
function sprayer(x, y, s, t, op) {
  op = op || {}; var b = '<path d="M-34 0 L-34 -118 Q-34 -132 -20 -136 L20 -136 Q34 -132 34 -118 L34 0 Z" fill="' + (op.col || "#d9e3e6") + '" stroke="' + INK + '" stroke-width="2.4"/>';
  b += R(-34, -96, 68, 62, "#f4ecdb", 2) + T(op.label || "طارد", 0, -70, 15, INK, 800) + (op.sub ? N(op.sub, 0, -46, 13, ORANGE) : "");
  b += R(-12, -160, 24, 24, "#8a9aa4", 2) + R(-26, -180, 46, 20, "#5c6b74", 2, 4) + R(-44, -176, 20, 8, "#5c6b74", 1.6);
  var m = op.mist || 0;
  if (m > 0) for (var i = 0; i < 16; i++) { var p = (i / 16 + t * .9) % 1, a = (hash(i) - .5) * .9; b += '<circle cx="' + f(-48 - p * 170 * m) + '" cy="' + f(-172 + Math.sin(a) * p * 120 * m) + '" r="' + f(2 + 5 * p) + '" fill="#9fc0d3" opacity="' + f((1 - p) * .8) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a standing fan seen from the front, 0,0 = the hub; blades turn with t
function fanStand(x, y, s, t) {
  var b = '<path d="M-6 0 L-10 230 M6 0 L10 230" stroke="' + INK + '" stroke-width="3"/>' + '<ellipse cx="0" cy="236" rx="70" ry="16" fill="#8a9aa4" stroke="' + INK + '" stroke-width="2"/>' + R(-8, 40, 16, 190, "#aab6bc", 2);
  b += '<circle r="112" fill="#eef2f1" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i < 3; i++) b += '<path d="M0 0 C26 -30 34 -86 6 -100 C-22 -96 -24 -40 0 0 Z" transform="rotate(' + f(i * 120 + t * 540) + ')" fill="#9fb7c3" stroke="' + INK + '" stroke-width="1.8" opacity=".9"/>';
  for (i = 0; i < 12; i++) b += '<path d="M0 0 L' + f(Math.cos(i * Math.PI / 6) * 112) + ' ' + f(Math.sin(i * Math.PI / 6) * 112) + '" stroke="' + INK + '" stroke-width=".9" opacity=".45"/>';
  for (i = 1; i <= 3; i++) b += '<circle r="' + (i * 34) + '" fill="none" stroke="' + INK + '" stroke-width=".9" opacity=".45"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b + C(0, 0, 14, "#5c6b74", 2));
}
// a bar of soap in three-quarter view, 0,0 = centre
function soap(x, y, s, col, txt, t) {
  var b = '<path d="M-60 -10 L-40 -34 L64 -34 L60 -10 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" filter="brightness(1.1)"/><path d="M-60 -10 L60 -10 L60 22 Q0 30 -60 22 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/><path d="M60 -10 L64 -34 L64 -4 L60 22 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2" opacity=".85"/>';
  b += '<ellipse cx="2" cy="-22" rx="36" ry="7" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>' + (txt ? T(txt, 0, 12, 15, INK, 800) : "");
  for (var i = 0; i < 4; i++) { var p = ((t || 0) * .4 + i * .25) % 1; b += '<circle cx="' + f(-40 + i * 26 + 6 * Math.sin(p * 9)) + '" cy="' + f(-40 - p * 60) + '" r="' + f(4 + 4 * p) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.4" opacity="' + f(1 - p) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
function coconut(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", C(0, 0, 30, "#7a5638", 2.2) + '<path d="M-30 0 A30 30 0 0 0 30 0 Z" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="0" rx="22" ry="5" fill="#efe8d8"/>' + C(-8, -16, 3, INK, 0) + C(6, -18, 3, INK, 0)); }
// a clock face, k 0..1 = how far round the hand has gone
function clockFace(x, y, r, k) {
  var s = C(x, y, r, "#f4ecdb", 2.6), i, a = -Math.PI / 2 + k * Math.PI * 2;
  for (i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * r * .82) + ' ' + f(y + Math.sin(b) * r * .82) + ' L' + f(x + Math.cos(b) * r * .94) + ' ' + f(y + Math.sin(b) * r * .94) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3) + '"/>'; }
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + r * .78 * Math.cos(-Math.PI / 2)) + ' ' + f(y + r * .78 * Math.sin(-Math.PI / 2)) + ' A' + f(r * .78) + ' ' + f(r * .78) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + r * .78 * Math.cos(a)) + ' ' + f(y + r * .78 * Math.sin(a)) + ' Z" fill="' + ORANGE + '" opacity=".22"/>';
  return s + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * r * .72) + ' ' + f(y + Math.sin(a) * r * .72) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
}
// the repellent film over the skin: a blue band that sweeps in from the left (k) and thins as it wears off (w)
function film(x, y, w, k, wear, t) {
  if (k <= 0) return ""; var d = "M" + f(x) + " " + f(y - 4); for (var i = 0; i <= 20; i++) d += " L" + f(x + w * k * i / 20) + " " + f(y - 12 - 3 * Math.sin(i * 1.3 + t * 2));
  d += " L" + f(x + w * k) + " " + f(y + 4) + " L" + f(x) + " " + f(y + 4) + " Z";
  return '<path d="' + d + '" fill="#7fa6bf" opacity="' + f(.55 * (1 - (wear || 0) * .85)) + '" stroke="' + BLUE + '" stroke-width="1.6"/>';
}
var CHIPS = ["تخبّيها", "تقلّلها", "تطيّرها"], CHIPC = [BLUE, OLIVE, ORANGE];
// a person standing in the shower, side view, real proportions; water on (k)
function showerScene(t, k) {
  var g = fig({ x: 330, y: 640 - 212, lean: 2, shirt: SKIN, hands: [rel(120, 34), null], bend: [-1, -1], legs: [[4, -2], [-4, 2]] }), s = R(-200, 640, 1040, 300, "#d9d2c0", 2);
  for (var i = 0; i < 16; i++) s += '<rect x="' + (-200 + i * 66) + '" y="40" width="66" height="600" fill="none" stroke="#cfc6b0" stroke-width="1.4"/>';
  s += '<path d="M470 40 V110 Q470 130 440 132 L400 132" stroke="#8a9aa4" stroke-width="10" fill="none"/>' + '<path d="M360 122 L410 122 L404 146 L366 146 Z" fill="#aab6bc" stroke="' + INK + '" stroke-width="2"/>';
  if (k > 0) for (i = 0; i < 18; i++) { var p = (t * 1.6 + hash(i)) % 1, xx = 360 + 44 * hash(i + 4) + (p * 60 - 30) * (hash(i + 9) - .5); s += '<path d="M' + f(xx) + ' ' + f(150 + p * 470) + ' l-2 18" stroke="' + BLUE + '" stroke-width="2.4" stroke-linecap="round" opacity="' + f(k * .85) + '"/>'; }
  return s + g.far + g.body + g.near;
}

// ── the three ways, pinned over the panel while they are explained (lines 6–18) ──
hud(6, 19, function (u, t) {
  var from = [6, 13, 17], s = "", x = 616;
  CHIPS.forEach(function (n, i) { var on = t >= LN[from[i]].start, w = n.length * 12 + 44, k = on ? pop((t - LN[from[i]].start) / .9 + .01) : 1; x -= w + 8;
    s += G("translate(" + f(x + w / 2) + " 40) scale(" + f(on ? k : 1) + ")", '<rect x="' + f(-w / 2) + '" y="-18" width="' + w + '" height="36" rx="18" fill="' + (on ? "#f4ecdb" : PAPER) + '" stroke="' + (on ? INK : MUTE) + '" stroke-width="' + (on ? 2 : 1.2) + '"/>' + N(String(i + 1), w / 2 - 17, 7, 19, on ? CHIPC[i] : MUTE) + T(n, -8, 7, 19, on ? CHIPC[i] : MUTE, 800)); });
  return s;
});

// 4 · the rule card, pinned over a bust whose skin gives off its smell
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + bust(320, 470, 1.9, { shirt: SHIRTS[1] }) + fumes(320, 360, 230, 7, 230, t, OLIVE, at(u, .2, .8), 7) +
    G("", '<rect x="150" y="120" width="340" height="120" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 180)"/>' + T("قاعدة", 320, 170, 38, ORANGE, 800) + T("ريحتك نفسها ثابتة", 320, 216, 28, INK, 700) + C(320, 128, 9, ORANGE, 2), at(u, .5, .4));
});
// 5 · but you can hide it, reduce it or blow it away: three icons pop round the bust
shot(5, push(320, 410, 1.06, 0.98), function (u, d, t) {
  var k = [at(u, d * .3, .3), at(u, d * .52, .3), at(u, d * .74, .3)];
  return paper() + bust(320, 520, 1.5, { shirt: SHIRTS[1] }) + fumes(320, 440, 180, 6, 180, t, OLIVE, 1, 6) +
    iconBox(120, 200, 150, G("translate(16 70) scale(.62)", sprayer(0, 0, 1, t, { mist: 1 })) , k[0]) + G("", T("تخبّيها", 120, 312, 26, BLUE, 800), k[0]) +
    iconBox(320, 150, 150, G("translate(0 -20)", '<path d="M-30 -40 L30 -40 L22 -24 L-22 -24 Z" fill="#aab6bc" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4].map(function (i) { var p = (t * 1.5 + i * .2) % 1; return '<path d="M' + (-20 + i * 10) + ' ' + f(-16 + p * 70) + ' l-1 10" stroke="' + BLUE + '" stroke-width="2.4" opacity="' + f(1 - p) + '"/>'; }).join("")), k[1]) + G("", T("تقلّلها", 320, 262, 26, OLIVE, 800), k[1]) +
    iconBox(520, 200, 150, G("translate(0 -12) scale(.5)", fanStand(0, 0, 1, t)), k[2]) + G("", T("تطيّرها", 520, 312, 26, ORANGE, 800), k[2]);
}, { tr: "out" });
// 6 · hide it: a repellent rubbed on the skin covers the smell
shot(6, push(320, 430, 1.08, 1.0), function (u, d, t) {
  var k = at(u, .6, d - 1.2), s = paper() + skin(-60, 560, 800, 300, t) + fumes(320, 545, 600, 9, 230 * (1 - .8 * k), t, OLIVE, 1 - .3 * k, 6) + film(-60, 562, 800, k, 0, t);
  return s + sprayer(560, 400, 1.15, t, { mist: at(u, .3, .4) * (1 - at(u, d - .6, .4)) }) + label(260, 552, 170, 680, "طبقة الطارد", BLUE, at(u, d * .6, .5), 24);
}, { tr: "in" });
// 7 · what matters is the active ingredient on the label: DEET or picaridin
shot(7, push(330, 420, 1.0, 1.1), function (u, d, t) {
  var s = paper() + sprayer(230, 640, 2.4, t, { label: "طارد", sub: "" });
  var lab = R(-120, -70, 240, 140, "#f4ecdb", 2.4) + T("المادة الفعالة", 0, -32, 20, INK, 800) + N("DEET", 0, 14, 34, ORANGE) + T("أو", 0, 42, 16, INK, 700) + N("Picaridin", 0, 64, 22, ORANGE);
  return s + draw("M260 450 L420 330", at(u, .4, .4), INK, 1.6) + inset(470, 300, 150, G("scale(1.1)", lab), at(u, .5, .4)) + check(560, 470, 1.2, at(u, d * .7, .4), OLIVE);
}, { tr: "out" });
// 8 · they reach the antennae and scramble her sense of smell: the odour dots get lost in the blue haze
shot(8, push(330, 420, 1.06, 0.98), function (u, d, t) {
  var s = paper(), k = at(u, .6, 1.2), i;
  s += G("translate(470 450) scale(-1 1)", '<path d="M70 460 L-20 640" stroke="' + MQ_D + '" stroke-width="16" stroke-linecap="round" transform="translate(-470 -450) translate(300 0)"/>');
  s += C(560, 420, 118, MQ, 2.6) + G("translate(530 410)", '<ellipse rx="76" ry="90" fill="#6f7d4d" stroke="' + INK + '" stroke-width="2.4"/>');
  for (i = 0; i < 2; i++) { var y0 = 330 + i * 30, d1 = "M470 " + y0 + " C380 " + (y0 - 80) + " 300 " + (y0 - 120) + " 160 " + (y0 - 150 + i * 40); s += '<path d="' + d1 + '" stroke="' + MQ_D + '" stroke-width="5" fill="none"/>';
    for (var j = 1; j < 9; j++) { var q = j / 9, xx = lerp(470, 160, q), yy = lerp(y0, y0 - 150 + i * 40, q) - 50 * Math.sin(q * Math.PI); s += '<path d="M' + f(xx) + ' ' + f(yy) + ' l' + f(-6 + 3 * Math.sin(t * 3 + j)) + ' -20 M' + f(xx) + ' ' + f(yy) + ' l' + f(-4) + ' ' + f(20 + 3 * Math.cos(t * 3 + j)) + '" stroke="' + MQ_D + '" stroke-width="1.6"/>'; } }
  for (i = 0; i < 14; i++) { var p = (t * .18 + i / 14) % 1, ox = 40 + p * 300, oy = 120 + 360 * hash(i) + 20 * Math.sin(t * 2 + i); s += C(ox + (k > .5 ? 30 * Math.sin(t * 5 + i) * p : 0), oy, 6, OLIVE, 1.2); }
  s += '<ellipse cx="290" cy="300" rx="' + f(220 * k) + '" ry="' + f(170 * k) + '" fill="#7fa6bf" opacity="' + f(.35 * k * (1 + .1 * Math.sin(t * 3))) + '"/>';
  for (i = 0; i < 10; i++) { var a = i * .63 + t * .7; s += C(290 + Math.cos(a) * 150 * k, 300 + Math.sin(a * 1.3) * 110 * k, 5, BLUE, 1.2); }
  return s + label(300, 230, 200, 660, "قرون الاستشعار", OLIVE, at(u, .3, .5), 24) + G("", T("؟", 250, 330, 110, ORANGE, 800), at(u, d * .6, .4));
}, { tr: "in" });
// 9 · like strong perfume sprayed beside a plate of mahshi: you can't smell the food
shot(9, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var k = at(u, d * .35, 1), s = paper(), i;
  s += '<ellipse cx="320" cy="560" rx="200" ry="56" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="320" cy="552" rx="150" ry="36" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  for (i = 0; i < 9; i++) { var x = 220 + (i % 5) * 50 + (i > 4 ? 25 : 0), y = 545 - (i > 4 ? 24 : 0); s += '<ellipse cx="' + x + '" cy="' + y + '" rx="26" ry="13" fill="' + (i % 2 ? "#6f8a4a" : "#c99a5a") + '" stroke="' + INK + '" stroke-width="1.6" transform="rotate(-12 ' + x + ' ' + y + ')"/>'; }
  s += fumes(320, 510, 260, 5, 230, t, OLIVE, at(u, .2, .5), 6);
  s += G("translate(560 440) scale(1.1)", R(-30, -70, 60, 90, "#e8c6d4", 2.2, 10) + R(-10, -92, 20, 22, "#c9a04e", 2) + R(-18, -104, 36, 14, "#5c6b74", 2, 4));
  s += '<ellipse cx="380" cy="320" rx="' + f(230 * k) + '" ry="' + f(150 * k) + '" fill="#e8c6d4" opacity="' + f(.6 * k * (1 + .08 * Math.sin(t * 2.5))) + '"/>';
  for (i = 0; i < 12; i++) { var a = i * .52 + t * .5; s += '<circle cx="' + f(380 + Math.cos(a) * 170 * k) + '" cy="' + f(320 + Math.sin(a * 1.4) * 100 * k) + '" r="5" fill="#c97aa0" opacity=".8"/>'; }
  return s + profile(120, 260, 1.1, { shirt: SHIRTS[0] }) + G("", T("؟", 70, 160, 80, ORANGE, 800), at(u, d * .7, .4)) + tag("برفان", 560, 560, at(u, d * .3, .3), 26, "#9a4a70");
});
// 10 · it lasts a few hours; sweat or a shower takes it off, so put it on again
shot(10, push(320, 430, 1.05, 0.98), function (u, d, t) {
  var k = at(u, .3, d * .6), s = paper() + skin(-60, 600, 800, 260, t) + film(-60, 602, 800, 1, k, t);
  for (var i = 0; i < 6; i++) { var p = (t * .5 + i * .17) % 1; s += G("translate(" + f(60 + i * 100) + " " + f(560 + p * 30) + ") scale(.45)", drop(0, 0, 1, "#9fc0d3"), at(u, d * .3, .3) * (1 - p)); }
  return s + clockFace(320, 300, 150, k * .5) + tag("كام ساعة", 320, 520, at(u, .6, .3), 30, ORANGE) + sprayer(570, 520, .8, t, { mist: at(u, d * .78, .3) }) + G("", T("تاني", 470, 380, 28, ORANGE, 800), at(u, d * .8, .3));
});
// 11 · a natural one that works: oil of lemon eucalyptus, the registered repellent, not the raw oil
function leaves(x, y, s, t) { var b = '<path d="M0 0 C-10 -60 -6 -120 10 -200" stroke="#6a5a3a" stroke-width="5" fill="none"/>'; for (var i = 0; i < 7; i++) { var yy = -24 - i * 26, sd = i % 2 ? 1 : -1; b += '<path d="M0 ' + yy + ' q' + (sd * 40) + ' ' + (-20 + 4 * Math.sin(t * 2 + i)) + ' ' + (sd * 74) + ' 6 q' + (sd * -36) + ' 4 ' + (sd * -74) + ' -6 Z" fill="#8a9a6a" stroke="' + INK + '" stroke-width="1.6"/>'; } return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b); }
shot(11, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, d * .55, .4);
  return paper() + leaves(320, 390, 1.0, t) + G("", T("ليمون أوكالبتوس", 320, 430, 28, OLIVE, 800), at(u, .4, .4)) +
    sprayer(180, 690, 1.2, t, { col: "#e9e4c4", label: "طارد", sub: "OLE / PMD" }) + check(180, 420, 1.3, at(u, d * .5, .4), OLIVE) + T("مسجّل كطارد", 180, 740, 22, OLIVE, 800) +
    G("translate(470 690)", '<path d="M-22 0 L-22 -80 L-10 -96 L-10 -116 L10 -116 L10 -96 L22 -80 L22 0 Z" fill="#c9a04e" fill-opacity=".6" stroke="' + INK + '" stroke-width="2.2"/>' + R(-14, -130, 28, 14, INK, 0)) + cross(470, 480, 1.1, k) + T("زيت خام", 470, 740, 22, ORANGE, 800);
}, { tr: "out" });
// 12 · citronella candles: the smell drifts off fast and barely works
shot(12, push(320, 430, 1.06, 0.98), function (u, d, t) {
  var s = paper() + R(-200, 600, 1040, 300, "#d9d2c0", 2) + R(230, 470, 180, 130, "#e8d68a", 2.4, 6) + '<ellipse cx="320" cy="470" rx="90" ry="18" fill="#f0e2a0" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M320 470 V444" stroke="' + INK + '" stroke-width="3"/><path d="M320 ' + f(446 - 0) + ' C306 420 312 ' + f(392 + 4 * Math.sin(t * 9)) + ' 320 ' + f(380 + 4 * Math.sin(t * 7)) + ' C328 392 334 420 320 446 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var i = 0; i < 6; i++) { var p = (t * .35 + i / 6) % 1; s += wave(320 + p * 260, 380 - p * 220, 340 + p * 300, 300 - p * 240, t, OLIVE, 5, 22, 1, 3).replace('<path', '<path opacity="' + f(1 - p) + '"'); }
  s += '<circle cx="320" cy="470" r="150" fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="10 8" opacity="' + f(at(u, d * .5, .4)) + '"/>' + mosq(110 + 20 * Math.sin(t * 1.4), 330, .8, t, { flip: true });
  return s + label(410, 520, 520, 660, "سيترونيلا", OLIVE, at(u, .3, .5), 24) + tag("ضعيف", 160, 200, at(u, d * .6, .3), 32, ORANGE);
});
// 13 · reduce it: a shower
shot(13, push(330, 380, 1.05, 0.95), function (u, d, t) { return paper() + showerScene(t, at(u, .5, .4)); }, { tr: "out" });
// 14 · sweat and skin bacteria make the smell; the shower after effort washes part of it away
shot(14, push(320, 430, 1.0, 1.08), function (u, d, t) {
  var s = paper() + skin(-40, 420, 720, 400, t), i, w = at(u, d * .45, 1.2);
  s += '<path d="M430 660 c-26 -6 -26 -34 0 -34 c26 0 26 30 0 28 c-20 -2 -18 -22 0 -22 M430 632 C440 560 420 500 432 422" fill="none" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round"/>';
  for (i = 0; i < 9; i++) { var bx = 110 + i * 54 + 12 * Math.sin(t * 1.3 + i * 2), a = 30 * Math.sin(t * 2.2 + i * 1.7); if (i % 3 === 1 && w > .5) continue; s += '<rect x="-15" y="-7" width="30" height="14" rx="7" fill="#8a9458" stroke="' + INK + '" stroke-width="1.6" transform="translate(' + f(bx) + ' ' + f(408 - 4 * hash(i)) + ') rotate(' + f(a) + ')"/>'; }
  s += fumes(300, 380, 420, 6, 190 * (1 - .55 * w), t, ORANGE, 1, 7);
  for (i = 0; i < 14; i++) { var p = (t * 1.3 + hash(i)) % 1; s += '<path d="M' + f(60 + 520 * hash(i + 3)) + ' ' + f(80 + p * 300) + ' l-2 18" stroke="' + BLUE + '" stroke-width="2.6" stroke-linecap="round" opacity="' + f(w * (1 - p)) + '"/>'; }
  return s + label(218, 406, 110, 250, "بكتيريا", OLIVE, at(u, .3, .5), 24) + label(436, 540, 560, 580, "عرق", BLUE, at(u, .9, .5), 24) + tag("جزء منها بيروح", 400, 130, at(u, d * .6, .3), 26, BLUE);
}, { tr: "in" });
// 15 · but the soap itself matters: in a test, one soap made some people more attractive (scented cloth, mosquitoes flock to it)
function cage(t, mq) { var s = R(110, 140, 420, 280, "#f4ecdb", 2.4) + '<rect x="110" y="140" width="420" height="280" fill="url(#hatch)" opacity=".3"/>'; for (var i = 0; i < mq.length; i++) s += mosq(mq[i][0], mq[i][1], .3, t, { flip: mq[i][2], ph: i }); return s; }
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .6, d - 1.2), mq = [], i;
  for (i = 0; i < 12; i++) { var m = fly([140 + 360 * hash(i), 170 + 220 * hash(i + 20)], [240 + 60 * hash(i + 7), 380 + 30 * hash(i + 31)], clamp(k * 1.3 - hash(i + 50) * .3), t, i); mq.push([m[0], m[1], false]); }
  return paper() + cage(t, mq) + R(200, 420, 120, 90, SHIRTS[2], 2) + fumes(260, 418, 90, 3, 60, t, ORANGE, 1, 5) + soap(260, 600, 1.1, "#d9e3f0", "صابون", t) + T("تجربة", 480, 452, 24, INK, 800) + tag("أحلى للناموس", 460, 600, at(u, d * .55, .3), 26, ORANGE);
}, { tr: "out" });
// 16 · a coconut-scented soap kept them away; but the result differs from one person to the next
shot(16, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .3, d * .5), mq = [], i;
  for (i = 0; i < 12; i++) { var m = fly([380 + 60 * hash(i + 7), 390 + 20 * hash(i + 31)], [140 + 80 * hash(i), 170 + 200 * hash(i + 20)], k, t, i); mq.push([m[0], m[1], true]); }
  return paper() + cage(t, mq) + R(330, 420, 120, 90, "#f2e9d6", 2) + coconut(500, 480, 1.2) + T("جوز هند", 500, 540, 22, OLIVE, 800) +
    iconBox(320, 650, 200, bust(-60, -24, .42, { shirt: SHIRTS[0] }) + check(-60, 30, .5, 1, OLIVE) + bust(60, -24, .42, { shirt: SHIRTS[3] }) + T("؟", 60, 44, 34, ORANGE, 800), at(u, d * .62, .3));
});
// 17 · blow it away: a fan
shot(17, push(320, 400, 0.96, 1.06), function (u, d, t) { return paper() + R(-200, 640, 1040, 300, "#d9d2c0", 2) + fanStand(320, 380, 1.15, t) + wave(470, 330, 620, 300, t, BLUE, 6, 30, at(u, .4, .5), 3) + wave(470, 400, 620, 410, t + .3, BLUE, 6, 30, at(u, .5, .5), 3); }, { tr: "out" });
// 18 · the wind scatters your breath and skin smell before they reach her, so she gets lost
shot(18, push(330, 410, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.2), s = paper() + profile(500, 320, 1.4, {}) + fumes(510, 250, 90, 3, 110, t, OLIVE, 1, 5);
  s += plume(function (p) { return [420 - 360 * p, 360 + (40 + 330 * k) * p * p - 160 * k * p, 8 + (40 + 160 * k) * p]; }, t, 1, 26, .06, .8);
  s += G("translate(560 640) scale(.42)", fanStand(0, 0, 1, t)) + arrow(500, 600, 380, 520, BLUE, 5, at(u, .2, .4));
  for (var i = 0; i < 4; i++) s += wave(470, 560 - i * 50, 200, 480 - i * 70, t + i * .4, "#9fb7c3", 6, 34, k, 2.4);
  var m = [110 + 60 * Math.sin(t * 1.1), 300 + 80 * Math.cos(t * .8)];
  return s + mosq(m[0], m[1], .85, t, { flip: Math.cos(t * 1.1) > 0 }) + G("", T("؟", m[0] - 10, m[1] - 70, 60, ORANGE, 800), at(u, d * .6, .3));
});
// 19 · a baby under two months: no repellent at all, a mosquito net is safest
shot(19, push(320, 420, 1.04, 0.98), function (u, d, t) {
  var s = paper() + R(-200, 640, 1040, 300, "#d9d2c0", 2), i;
  s += R(150, 470, 340, 130, WOOD, 2.4) + R(166, 486, 308, 80, "#f4efe3", 1.6);
  for (i = 0; i < 10; i++) s += R(150 + i * 34, 400, 8, 70, WOOD_D, 1.4);
  s += '<ellipse cx="260" cy="472" rx="34" ry="30" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M290 470 C320 446 400 446 440 470 L440 486 L290 486 Z" fill="#c9d6e0" stroke="' + INK + '" stroke-width="2"/>';
  var net = '<path d="M320 120 L130 470 L510 470 Z" fill="#eef2f1" fill-opacity=".45" stroke="' + INK + '" stroke-width="2"/>';
  for (i = 0; i < 14; i++) net += '<path d="M320 120 L' + (130 + i * 29) + ' 470" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>';
  for (i = 1; i < 9; i++) { var y = 120 + i * 39, hw = 190 * i / 9; net += '<path d="M' + f(320 - hw) + ' ' + y + ' H' + f(320 + hw) + '" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>'; }
  s += appear(at(u, d * .45, .5), net) + C(320, 116, 8, "#8a9aa4", 2);
  var m = [560 + 30 * Math.sin(t * 1.7), 300 + 40 * Math.cos(t * 1.3)];
  return s + mosq(m[0], m[1], .7, t, {}) + G("", G("translate(110 230) scale(.6)", sprayer(0, 0, 1, t, {})) + cross(110, 160, 1, at(u, .8, .4)), at(u, .3, .3)) + tag("أقل من شهرين", 320, 720, at(u, .4, .3), 30, ORANGE) + label(420, 300, 520, 180, "ناموسية", BLUE, at(u, d * .55, .5), 24);
}, { tr: "out" });
// 20 · and lemon eucalyptus oil is not for children under three
shot(20, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + leaves(470, 360, .8, t) + sprayer(300, 640, 1.6, t, { col: "#e9e4c4", label: "طارد", sub: "OLE / PMD" }) + cross(300, 470, 2.2, at(u, d * .5, .5)) + numBox(count(3, at(u, .3, .6)), 140, 220, at(u, .3, .3), 60) + T("سنين", 140, 290, 28, INK, 800) + T("تحت", 140, 140, 28, INK, 800);
});
// 21 · the myth: vitamin B1 pills and the plug-in gadget that whistles; both crossed out on «لأ»
shot(21, push(320, 420, 1.08, 0.98), function (u, d, t) {
  var s = paper(), i, k = at(u, d - .9, .5);
  s += G("translate(190 330) rotate(-14)", '<rect x="-60" y="-26" width="120" height="52" rx="26" fill="#f2e9d6" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 -26 V26" stroke="' + INK + '" stroke-width="2"/><rect x="0" y="-26" width="60" height="52" rx="0" fill="#e2b85a" opacity=".7"/>') + N("B1", 190, 420, 46, INK);
  s += R(400, 260, 120, 150, "#eef2f1", 2.4, 10) + R(430, 410, 14, 30, "#8a9aa4", 1.6) + R(476, 410, 14, 30, "#8a9aa4", 1.6) + C(460, 310, 22, "#5c6b74", 2) + C(460, 310, 8, ORANGE, 0);
  for (i = 0; i < 3; i++) { var r = 50 + ((t * 70 + i * 40) % 120); s += '<path d="M' + f(460 - r * .7) + ' ' + f(310 - r * .7) + ' A' + f(r) + ' ' + f(r) + ' 0 0 0 ' + f(460 - r * .7) + ' ' + f(310 + r * .7) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f(1 - (r - 50) / 120) + '"/>'; }
  return s + T("فيتامين", 190, 240, 26, INK, 800) + T("جهاز بيصفّر", 460, 500, 24, INK, 800) + mosq(330 + 30 * Math.sin(t * 1.3), 600 + 20 * Math.cos(t * 1.7), .9, t, {}) + cross(190, 340, 2, k) + cross(460, 330, 2, at(u, d - .7, .5));
}, { tr: "out" });
// 22 · tests found mosquitoes bite at the same rate: two equal bars
shot(22, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.2), s = paper() + '<path d="M120 620 H540" stroke="' + INK + '" stroke-width="2.6"/>', h = 300 * k;
  s += R(170, 620 - h, 110, h, GREY, 2) + R(380, 620 - h * (1 + .02 * Math.sin(t * 3)), 110, h * (1 + .02 * Math.sin(t * 3)), ORANGE, 2);
  return s + T("من غير", 225, 660, 24, INK, 800) + T("بيهم", 435, 660, 24, INK, 800) + draw("M150 " + f(610 - h) + " H510", at(u, 1.4, .5), INK, 2, ' stroke-dasharray="8 6"') + tag("نفس المعدل", 320, 220, at(u, 1.5, .3), 32, ORANGE) + mosq(110, 300 + 20 * Math.sin(t * 2), .6, t, {});
});
// 23 · the recap: repellent, shower, fan, each ticked
shot(23, push(320, 410, 0.96, 1.04), function (u, d, t) {
  var s = paper() + bust(320, 560, 1.3, { shirt: SHIRTS[1] }), xs = [130, 320, 510], k = [at(u, .3, .3), at(u, d * .35, .3), at(u, d * .62, .3)];
  s += iconBox(130, 260, 150, G("translate(16 70) scale(.62)", sprayer(0, 0, 1, t, { mist: 1 })), k[0]) + iconBox(320, 230, 150, '<path d="M-30 -40 L30 -40 L22 -24 L-22 -24 Z" fill="#aab6bc" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4].map(function (i) { var p = (t * 1.5 + i * .2) % 1; return '<path d="M' + (-20 + i * 10) + ' ' + f(-16 + p * 70) + ' l-1 10" stroke="' + BLUE + '" stroke-width="2.4" opacity="' + f(1 - p) + '"/>'; }).join(""), k[1]) + iconBox(510, 260, 150, G("translate(0 -12) scale(.5)", fanStand(0, 0, 1, t)), k[2]);
  xs.forEach(function (x, i) { s += check(x + 56, 300, .7, at(u, [0, d * .35, d * .62][i] + .3, .3), CHIPC[i]) + G("", T(CHIPS[i], x, 380, 24, CHIPC[i], 800), k[i]); });
  return s;
}, { tr: "out" });
// 24 · the odd fact: a malaria mosquito (resting tilted, as Anopheles does) drawn to foot smell, and to Limburger cheese that smells the same
shot(24, push(320, 430, 1.04, 0.98), function (u, d, t) {
  var s = paper() + R(-200, 640, 1040, 300, "#d9d2c0", 2), k = at(u, d * .45, .4);
  s += '<path d="M60 640 L70 470 Q72 440 110 440 L150 440 Q170 440 172 470 L176 560 Q178 600 220 610 L300 620 Q330 626 326 640 Z" fill="#e6e0d2" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M70 500 H172" stroke="' + INK + '" stroke-width="1.4" opacity=".5"/>';
  s += fumes(200, 590, 200, 4, 160, t, OLIVE, 1, 6);
  s += G("", '<path d="M400 640 L580 640 L580 560 Z" fill="#f0d27a" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M400 640 L580 560 L560 540 L380 620 Z" fill="#e8c35a" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' + C(520, 610, 7, "#d9b04a", 1.2) + C(470, 626, 5, "#d9b04a", 1.2) + fumes(500, 560, 150, 4, 150, t + 1, OLIVE, 1, 6), k);
  s += mosq(330 + 20 * Math.sin(t * 1.2), 330 + 14 * Math.cos(t * 1.6), 1.3, t, { rot: -24 });
  return s + label(150, 520, 230, 690, "ريحة الرجل", OLIVE, at(u, .6, .5), 24) + label(520, 590, 560, 460, "جبنة ليمبورجر", ORANGE, at(u, d * .5, .5), 24) + tag("ناموس الملاريا", 330, 180, at(u, .3, .3), 28, INK);
}, { tr: "out" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a soap with a sweet smell. line 1: mosquitoes drift toward it. line 2: the viewers' question, in a comment bubble
  var s = R(0, 90, 608, 500, "#e3dccb", 2.4), i;
  for (i = 0; i < 10; i++) s += '<rect x="' + (i * 64 - 10) + '" y="90" width="64" height="500" fill="none" stroke="#d1c8b2" stroke-width="1.4"/>';
  s += R(0, 470, 608, 120, "#cfc6b0", 2) + soap(300, 450, 2.2, "#e8c6d4", "", t) + fumes(300, 380, 220, 6, 230, t, "#c97aa0", 1, 7);
  if (li >= 1) { var u = t - LN[1].start; for (i = 0; i < 5; i++) { var m = fly([i % 2 ? 640 : -40, 120 + i * 60], [230 + i * 35, 200 + 30 * hash(i)], clamp(u / 2.4), t, i); s += mosq(m[0], m[1], .55, t, { flip: !(i % 2), ph: i }); } }
  if (li >= 2) { var u2 = t - LN[2].start; s += iconBox(304, 190, 300, G("translate(0 -10)", '<path d="M-110 -60 H110 Q124 -60 124 -46 V30 Q124 44 110 44 H-40 L-70 76 L-66 44 H-110 Q-124 44 -124 30 V-46 Q-124 -60 -110 -60 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + T("نعمل إيه؟", 0, -4, 34, ORANGE, 800)) + T("سؤال منكم", 0, 118, 22, INK, 700), ease(u2 / .35)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(126 192) scale(.62)", sprayer(0, 0, 1, t, { mist: 1 })) + mosq(40 + 12 * Math.sin(t * 2.1), 70 + 10 * Math.cos(t * 1.7), .7, t, { flip: true });
};
SCENE.outro = function (svg, u, t) {
  return bust(300, 150, .95, { shirt: SHIRTS[1] }) + fumes(300, 110, 100, 3, 70, t, OLIVE, 1, 4) + G("translate(110 250) scale(.6)", sprayer(0, 0, 1, t, { mist: 1 })) +
    G("translate(480 150) scale(.5)", fanStand(0, 0, 1, t)) + '<path d="M180 40 L220 40 L214 54 L186 54 Z" fill="#aab6bc" stroke="' + INK + '" stroke-width="2"/>' + mosq(560, 50 + 8 * Math.sin(t * 2), .45, t, {}) +
    callout("1", 70, 110, ease(u / .3)) + callout("2", 200, 80, ease(u / .3 - .5)) + callout("3", 480, 20, ease(u / .3 - 1)) + callout("4", 560, 100, ease(u / .3 - 1.5));
};
