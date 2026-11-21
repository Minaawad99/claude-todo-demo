window.CHUNKS = [[0.0], [0.0, 0.5143], [0.0, 0.2826, 0.413], [0.0, 0.4194], [0.0, 0.8125], [0.0, 0.2083], [0.0, 0.3276, 0.5345], [0.0], [0.0, 0.62], [0.0], [0.0, 0.2321, 0.6786], [0.0, 0.254, 0.7143], [0.0, 0.4697, 0.7273], [0.0, 0.4909, 0.8364], [0.0, 0.5091], [0.0, 0.6607], [0.0, 0.1447, 0.5921], [0.0, 0.6338], [0.0, 0.5], [0.0, 0.5246], [0.0, 0.4675, 0.6753], [0.0, 0.4762], [0.0, 0.5273], [0.0, 0.1786, 0.4405, 0.6429], [0.0, 0.3919, 0.8108], [0.0], [0.0]];
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

// ── «ليه حروف الكيبورد مش بالترتيب؟» — people kit copied from videos/choking/sketch/shots.js (real body proportions) ──
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
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
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 10 + 26 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
// a beat 0..1 repeating n times over dur seconds starting at u0: 0 rest, peaks at mid-beat
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }
function chips(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 44) + '" cy="' + y + '" r="17" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 44, y + 7, 18, c ? "#fff" : INK); } return s; }
function mitt(x, y, dir, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + dir + " 1)", '<path d="M0 -40 C-30 -40 -40 -10 -40 0 C-40 20 -30 40 0 40 L60 34 L60 -34 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-36 -14 h26 M-38 4 h26 M-34 20 h24" stroke="' + INK + '" stroke-width="1.6"/>' + R(60, -36, 50, 72, col || SHIRT_R, 2)); }

// ── the machines. Real shapes (refs/SOURCES.md): the 1868 patent model is a wooden box with two rows of long piano-like
// keys in alphabetical order; the typebars hang in a ring (the "basket") under the platen and swing UP to one printing
// point under it (side cut from the Sholes & Glidden patent, Fig. 2); the 1874 Sholes & Glidden is black japanned metal
// with painted flowers and gold scrollwork, a platen carriage on top, a hand wheel on the right and four rows of round
// white keys in black rims over a wooden space bar (photo, Deutsches Museum). Its keyboard is copied from the photo.

var KC = "#f4eee0", KS = "#cbbfa3", ALU = "#d4d0c6", ALU_D = "#a9a499", STEEL = "#9aa0a2", STEEL_D = "#6f7578", JAP = "#2b2724", GOLD = "#c9a24a",
    PAPERW = "#fbf8f0", WOODL = "#c99a66", IVORY = "#f2ead6";
function LT(text, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans, DejaVu Sans, sans-serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
function SR(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }

// a modern keycap seen a little from the front: skirt + top face; o.hl colours the top, o.press pushes it down
function key(x, y, w, ch, o) {
  o = o || {}; var h = w * .92, p = (o.press || 0) * 5, s = "";
  s += '<rect x="' + f(x) + '" y="' + f(y + p) + '" width="' + f(w) + '" height="' + f(h + 8 - p) + '" rx="6" fill="' + KS + '" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<rect x="' + f(x + 3) + '" y="' + f(y + p + 1) + '" width="' + f(w - 6) + '" height="' + f(h - 5) + '" rx="5" fill="' + (o.hl || KC) + '" stroke="' + INK + '" stroke-width="1.2"/>';
  if (ch) s += LT(ch, x + w / 2, y + p + h * .62, w * .46, o.hl && o.hl !== KC ? "#fff" : INK);
  return s;
}
var QW = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"], ABC = ["ABCDEFGHIJ", "KLMNOPQRS", "TUVWXYZ"], OFFS = [0, .3, .8];
function keyPos(layout, ch) { for (var r = 0; r < 3; r++) { var i = layout[r].indexOf(ch); if (i >= 0) return [i + OFFS[r], r]; } return null; }
// a laptop-style keyboard; mix 0 = QWERTY, 1 = ABC (keys slide between the two); o.hl(ch) → colour, o.press(ch) → 0..1
function keyboard(x, y, u, mix, o) {
  o = o || {}; var s = R(x - u * .5, y - u * .5, u * 11.2, u * 3.7, ALU, 2.4, 14), gap = u * 1.08;
  s += '<rect x="' + f(x - u * .5) + '" y="' + f(y + u * 3.2 - 1) + '" width="' + f(u * 11.2) + '" height="10" fill="' + ALU_D + '" stroke="' + INK + '" stroke-width="2"/>';
  var all = "QWERTYUIOPASDFGHJKLZXCVBNM", items = [];
  for (var i = 0; i < all.length; i++) {
    var ch = all[i], a = keyPos(QW, ch), b = keyPos(ABC, ch), m = clamp(typeof mix === "function" ? mix(ch) : mix);
    var arc = Math.sin(m * Math.PI) * u * .6 * (i % 2 ? 1 : -1);
    items.push({ ch: ch, x: x + lerp(a[0], b[0], m) * gap, y: y + lerp(a[1], b[1], m) * gap + arc, z: m > 0 && m < 1 ? 1 : 0 });
  }
  items.sort(function (p, q) { return p.z - q.z; });
  items.forEach(function (it) { s += key(it.x, it.y, u, it.ch, { hl: o.hl ? o.hl(it.ch) : null, press: o.press ? o.press(it.ch) : 0 }); });
  return s;
}
// the 1868 patent model: a wooden box, two rows of long piano-like keys. Lower row (white, long), upper row (dark, shorter,
// set between them), letters in alphabetical order as in the patent: "- 3 5 7 9 N O P Q R S T U V W X Y Z" over "2 4 6 8 . A … M"
var P68_UP = ["-", "3", "5", "7", "9", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], P68_LO = ["2", "4", "6", "8", ".", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
function piano68(x, y, w, o) {
  o = o || {}; var n = 18, kw = w / n, s = "";
  // box: top board behind the keys, front rail, wood grain
  s += R(x - 20, y - 150, w + 40, 150, WOOD, 2.4) + '<path d="M' + f(x) + ' ' + f(y - 120) + ' H' + f(x + w * .4) + ' M' + f(x + w * .55) + ' ' + f(y - 96) + ' H' + f(x + w) + ' M' + f(x + 30) + ' ' + f(y - 60) + ' H' + f(x + w * .7) + '" stroke="' + WOOD_D + '" stroke-width="1.4" opacity=".6"/>';
  s += R(x - 20, y + 210, w + 40, 40, WOOD_D, 2.4);
  for (var i = 0; i < n; i++) {   // lower (white) keys: long levers
    var hl = o.hl ? o.hl(P68_LO[i]) : null, p = o.press ? o.press(P68_LO[i]) * 6 : 0;
    s += R(x + i * kw + 1, y + p, kw - 2, 205, hl || IVORY, 1.8, 3) + SR(P68_LO[i], x + i * kw + kw / 2, y + 186 + p, kw * .56, hl ? "#fff" : INK);
  }
  for (i = 0; i < n; i++) {   // upper (dark) keys, set back between the white ones
    var hl2 = o.hl ? o.hl(P68_UP[i]) : null, p2 = o.press ? o.press(P68_UP[i]) * 6 : 0, xx = x + i * kw + kw * .5 + 2;
    s += R(xx, y - 6 + p2, kw - 4, 118, hl2 || "#3a302a", 1.8, 3) + SR(P68_UP[i], xx + (kw - 4) / 2, y + 96 + p2, kw * .5, hl2 ? "#fff" : "#f2ead6");
  }
  return s;
}

// ── the typebar basket, seen from the front and a little above. 36 bars on a ring of radius RB; each swings in its own
// radial plane from rest (lying out, a little down) up to the printing point PP under the platen centre.
var BAS = { cx: 320, y0: 380, R: 190, H: 125, tilt: .28, n: 36 }, A_REST = -78, A_HIT = -180 - Math.atan2(BAS.H, BAS.R) * 180 / Math.PI;   // swings in under the ring and up
// letters on the ring, in the order of the 1868 keys (alphabetical), front-centre first
var RING = "MLKJIHGFEDCBA.8642-3579NOPQRSTUVWXYZ".split("");
function bar3(th, k) {   // screen points pivot, tip for swing k (0 hanging at rest, 1 at the platen); swings in under the ring and up
  var a = lerp(A_REST, A_HIT, k) * Math.PI / 180, L = Math.hypot(BAS.R, BAS.H);
  var px = BAS.R * Math.cos(th), pz = BAS.R * Math.sin(th);
  var dx = Math.cos(th) * Math.cos(a), dy = Math.sin(a), dz = Math.sin(th) * Math.cos(a);
  var tx = px + dx * L, ty = dy * L, tz = pz + dz * L;
  return { p: [BAS.cx + px, BAS.y0 + pz * BAS.tilt], tip: [BAS.cx + tx, BAS.y0 - ty + tz * BAS.tilt], z: (pz + tz) / 2 };
}
function ringTheta(i) { return Math.PI / 2 + (i / BAS.n) * Math.PI * 2; }   // i = 0 at the front centre
var PP = [BAS.cx, BAS.y0 - BAS.H];
function platen(t, typed, o) {
  o = o || {}; var y = PP[1], s = "";
  s += R(BAS.cx - 140, y - 330, 280, 290, PAPERW, 2.2) + '<path d="M' + (BAS.cx - 110) + ' ' + f(y - 290) + ' H' + (BAS.cx + 110) + ' M' + (BAS.cx - 110) + ' ' + f(y - 262) + ' H' + (BAS.cx + 50) + '" stroke="#d9d0bd" stroke-width="2"/>';
  if (typed) s += '<text x="' + (BAS.cx - 110) + '" y="' + f(y - 110) + '" style="font:800 30px Noto Serif;fill:' + INK + ';direction:ltr">' + typed + '</text>';
  s += R(BAS.cx - 250, y - 64, 500, 58, "#3b3631", 2.6, 28) + '<rect x="' + (BAS.cx - 240) + '" y="' + f(y - 56) + '" width="480" height="10" rx="5" fill="#fff" opacity=".18"/>';
  s += C(BAS.cx - 262, y - 35, 22, "#5a524a", 2.2) + C(BAS.cx + 262, y - 35, 22, "#5a524a", 2.2);
  s += R(BAS.cx - 46, y - 8, 92, 9, o.ribbon || "#7a3b2a", 1.6);   // ink ribbon under the printing point
  return s;
}
// o: {swing: fn(i) → 0..1, col: fn(i) → colour|null, theta: fn(i) → angle override, letters: true|fn(i), typed}
function basket(t, o) {
  o = o || {}; var bars = [], s = "";
  for (var i = 0; i < BAS.n; i++) { var th = o.theta ? o.theta(i) : ringTheta(i), k = o.swing ? clamp(o.swing(i)) : 0, b = bar3(th, k); b.i = i; b.k = k; b.th = th; bars.push(b); }
  var ring = function (half) { var rx = BAS.R, ry = BAS.R * BAS.tilt; return '<path d="M' + (BAS.cx - rx) + ' ' + BAS.y0 + ' A' + rx + ' ' + f(ry) + ' 0 0 ' + (half ? 0 : 1) + ' ' + (BAS.cx + rx) + ' ' + BAS.y0 + '" fill="none" stroke="' + INK + '" stroke-width="14"/><path d="M' + (BAS.cx - rx) + ' ' + BAS.y0 + ' A' + rx + ' ' + f(ry) + ' 0 0 ' + (half ? 0 : 1) + ' ' + (BAS.cx + rx) + ' ' + BAS.y0 + '" fill="none" stroke="' + STEEL_D + '" stroke-width="9"/>'; };
  bars.sort(function (p, q) { return p.z - q.z; });
  var back = "", front = "", lab = "";
  bars.forEach(function (b) {
    var col = o.col ? o.col(b.i) : null, w = col ? 5.5 : 3.6, d = "M" + f(b.p[0]) + " " + f(b.p[1]) + " L" + f(b.tip[0]) + " " + f(b.tip[1]);
    var g = '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 2.8) + '" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#c9ccc8") + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
      '<rect x="' + f(b.tip[0] - 6) + '" y="' + f(b.tip[1] - 6) + '" width="12" height="12" fill="' + (col || STEEL) + '" stroke="' + INK + '" stroke-width="1.2"/>' + C(b.p[0], b.p[1], 3.5, PAPER, 1.2);
    if (o.letters && (o.letters === true || o.letters(b.i))) { var lx = b.tip[0], ly = b.tip[1] + (b.k > .5 ? -34 : 34); lab += C(lx, ly - 7, 16, col || PAPER, 1.6) + SR(RING[b.i], lx, ly - 0, 18, col ? "#fff" : INK); }
    if (b.z < 0) back += g; else front += g;
  });
  return s + platen(t, o.typed, o) + back + ring(1) + front + ring(0) + lab;
}

// ── side cut of the machine (Fig. 2 of the patent): platen on top, the ring edge-on under it, one typebar hanging from its
// pivot; the key lever at the bottom pulls a rod and the bar swings in under the ring and up to the printing point. k 0..1
function sideCut(t, k, o) {
  o = o || {}; var s = "", PL = [320, 205], P0 = [320, 252], piv = [182, 340], L = Math.hypot(P0[0] - piv[0], P0[1] - piv[1]);
  var aHit = Math.atan2(P0[1] - piv[1], P0[0] - piv[0]), aRest = Math.PI * .56, a = lerp(aRest, aHit, k);
  var tip = [piv[0] + Math.cos(a) * L, piv[1] + Math.sin(a) * L], heel = [piv[0] - Math.cos(a) * 30, piv[1] - Math.sin(a) * 30];
  // the case, cut open
  s += '<path d="M40 110 H600 V690 H40 Z" fill="#f3ebd8" stroke="' + INK + '" stroke-width="2.6"/><path d="M40 110 H600 V690 H40 Z M56 126 V674 H584 V126 Z" fill="url(#hatch)" fill-rule="evenodd"/><path d="M56 126 H584 V674 H56 Z" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  // paper wrapped round the platen
  s += '<path d="M268 40 L268 205 A52 52 0 0 0 372 205 L372 150" fill="none" stroke="' + INK + '" stroke-width="8"/><path d="M268 40 L268 205 A52 52 0 0 0 372 205 L372 150" fill="none" stroke="' + PAPERW + '" stroke-width="5"/>';
  s += C(PL[0], PL[1], 46, "#3b3631", 2.6) + C(PL[0], PL[1], 10, STEEL, 1.6) + R(296, 254, 48, 8, "#7a3b2a", 1.4);
  if (o.printed) s += o.printed;
  // the ring edge-on, with the bar on the far side hanging still
  var piv2 = [458, 340];
  s += '<path d="M' + f(piv2[0]) + ' ' + f(piv2[1]) + ' l' + f(-Math.cos(aRest) * L) + ' ' + f(Math.sin(aRest) * L) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round" opacity=".5"/><path d="M' + f(piv2[0]) + ' ' + f(piv2[1]) + ' l' + f(-Math.cos(aRest) * L) + ' ' + f(Math.sin(aRest) * L) + '" stroke="' + STEEL + '" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
  s += R(160, 332, 320, 16, STEEL_D, 2, 6);
  // key lever (seesaw): key at the front (left) goes down, the back end goes up, the rod pulls the heel of the bar
  var kd = o.key == null ? k : o.key, lp = [330, 606], ka = .05 - kd * .09;
  var kEnd = [lp[0] - Math.cos(ka) * 230, lp[1] - Math.sin(ka) * 230], bEnd = [lp[0] + Math.cos(ka) * 120, lp[1] + Math.sin(ka) * 120];
  s += '<path d="M' + f(kEnd[0]) + ' ' + f(kEnd[1]) + ' L' + f(bEnd[0]) + ' ' + f(bEnd[1]) + '" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="M' + f(kEnd[0]) + ' ' + f(kEnd[1]) + ' L' + f(bEnd[0]) + ' ' + f(bEnd[1]) + '" stroke="' + WOOD + '" stroke-width="8" stroke-linecap="round"/>' + P("M" + (lp[0] - 14) + " " + (lp[1] + 26) + " L" + lp[0] + " " + (lp[1] + 4) + " L" + (lp[0] + 14) + " " + (lp[1] + 26) + " Z", STEEL_D, 1.6);
  s += C(kEnd[0], kEnd[1] - 20, 22, "#1c1916", 2) + C(kEnd[0], kEnd[1] - 20, 17, IVORY, 1.2) + SR(o.ch || "S", kEnd[0], kEnd[1] - 13, 20) + '<path d="M' + f(kEnd[0]) + ' ' + f(kEnd[1] - 2) + ' V' + f(kEnd[1] + 6) + '" stroke="' + INK + '" stroke-width="4"/>';
  s += '<path d="M' + f(bEnd[0]) + ' ' + f(bEnd[1]) + ' L' + f(heel[0]) + ' ' + f(heel[1]) + '" stroke="' + INK + '" stroke-width="2.4"/>';
  // the typebar
  var hl = o.hl || ORANGE, bar = "M" + f(heel[0]) + " " + f(heel[1]) + " L" + f(tip[0]) + " " + f(tip[1]);
  s += '<path d="' + bar + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="' + bar + '" stroke="' + hl + '" stroke-width="6" stroke-linecap="round"/>';
  s += G("translate(" + f(tip[0]) + " " + f(tip[1]) + ") rotate(" + f(a * 180 / Math.PI) + ")", R(-8, -12, 20, 24, STEEL, 1.6) + G("rotate(90)", SR(o.ch || "S", 0, 2, 15)));
  s += C(piv[0], piv[1], 7, PAPER, 2);
  if (o.finger) s += o.finger([kEnd[0], kEnd[1] - 40]);
  return { svg: s, tip: tip, key: [kEnd[0], kEnd[1] - 20], piv: piv };
}

// ── the 1874 Sholes & Glidden, front view (photo): black body, flowers, gold, platen on top, wheel on the right
var SG_ROWS = ["23456789-,", "QWERTYUIOP", "^ASDFGHJKLM", ":ZCXVBN?;."];
function flower(x, y, s, t) {
  var g = "", cols = ["#c95b4e", "#e9c9b8", "#d98a7a", "#f1e7d6", "#8fa2b8"];
  [[-30, 10], [30, 8], [-8, -24], [16, 22]].forEach(function (p, i) { g += '<path d="M' + f(x + p[0] * s) + ' ' + f(y + p[1] * s) + ' q' + f(-26 * s) + ' ' + f(-14 * s) + ' ' + f(-40 * s) + ' ' + f(6 * s) + ' q' + f(20 * s) + ' ' + f(10 * s) + ' ' + f(40 * s) + ' ' + f(-6 * s) + 'z" fill="#5e7a4a" stroke="' + INK + '" stroke-width="1"/>'; });
  [[0, 0, 15], [-20, 6, 10], [20, 4, 11], [-6, -16, 8], [12, -12, 7]].forEach(function (p, i) { g += C(x + p[0] * s, y + p[1] * s, p[2] * s, cols[i], 1.2) + C(x + p[0] * s, y + p[1] * s, p[2] * s * .35, "#f4e1a8", 0); });
  return g;
}
function scroll(x, y, w, s) { return '<path d="M' + f(x) + ' ' + f(y) + ' q' + f(w * .12) + ' ' + f(-14 * s) + ' ' + f(w * .25) + ' 0 t' + f(w * .25) + ' 0 t' + f(w * .25) + ' 0 t' + f(w * .25) + ' 0" stroke="' + GOLD + '" stroke-width="' + f(2 * s) + '" fill="none"/>'; }
function sg1874(t, o) {
  o = o || {}; var s = "";
  // carriage on top: rails, platen, paper
  s += R(150, 120, 340, 16, "#4a433c", 2) + R(170, 66, 300, 56, "#3b3631", 2.6, 24) + '<rect x="178" y="72" width="284" height="10" rx="5" fill="#fff" opacity=".16"/>' + C(150, 94, 18, "#5a524a", 2) + C(490, 94, 18, "#5a524a", 2);
  s += R(250, 0, 140, 74, PAPERW, 2) + (o.typed ? SR(o.typed, 320, 40, 22) : "");
  // deck with a gold edge, curved like the photo
  s += P("M70 170 C110 140 530 140 570 170 L560 196 L80 196 Z", JAP, 2.6) + '<path d="M86 180 C130 160 510 160 554 180" stroke="' + GOLD + '" stroke-width="2.4" fill="none"/>';
  // body
  s += P("M100 196 H540 L550 520 H90 Z", JAP, 2.6);
  s += '<path d="M116 212 H524 L532 504 H108 Z" fill="none" stroke="' + GOLD + '" stroke-width="2"/>' + scroll(130, 236, 380, 1) + scroll(130, 480, 380, 1);
  s += flower(320, 300, 1.25) + flower(200, 410, .9) + flower(440, 400, .95);
  // hand wheel on the right side
  s += C(585, 300, 46, JAP, 2.6) + '<circle cx="585" cy="300" r="38" fill="none" stroke="' + GOLD + '" stroke-width="3"/>' + C(585, 300, 9, GOLD, 1.4);
  for (var a = 0; a < 6; a++) { var r = a * Math.PI / 3 + t * .6; s += '<path d="M' + f(585 + Math.cos(r) * 10) + ' ' + f(300 + Math.sin(r) * 10) + ' L' + f(585 + Math.cos(r) * 36) + ' ' + f(300 + Math.sin(r) * 36) + '" stroke="' + GOLD + '" stroke-width="2.4"/>'; }
  // keyboard shelf, keys on stalks, wooden space bar
  s += P("M80 520 H560 L600 740 H40 Z", JAP, 2.6) + '<path d="M58 726 H582" stroke="' + GOLD + '" stroke-width="2"/>';
  for (var row = 0; row < 4; row++) {
    var keys = SG_ROWS[row], y = 556 + row * 40, x0 = 128 + (row === 1 ? 14 : row === 2 ? -4 : row === 3 ? 4 : 18), gap = 41;
    for (var i = 0; i < keys.length; i++) {
      var ch = keys[i], x = x0 + i * gap, hl = o.hl ? o.hl(ch, row) : null;
      s += '<path d="M' + f(x) + ' ' + f(y + 10) + ' V' + f(y + 30) + '" stroke="#5a524a" stroke-width="4"/>';
      s += C(x, y, 16, "#1c1916", 2) + C(x, y, 12.5, hl || IVORY, 1.2) + SR(ch === "^" ? "&#8593;" : ch, x, y + 5, 14, hl ? "#fff" : INK);
    }
  }
  s += R(120, 712, 400, 18, WOODL, 2.2, 3);
  return s;
}

// ── modern devices
function laptop(x, y, w, o) {
  o = o || {}; var h = w * .62, s = "";
  s += P("M" + f(x + w * .06) + " " + f(y - h) + " H" + f(x + w * .94) + " L" + f(x + w * .9) + " " + f(y) + " H" + f(x + w * .1) + " Z", "#4b4b4f", 2.4);
  s += R(x + w * .12, y - h + 14, w * .76, h - 30, o.screen || "#dfe6e6", 1.6);
  s += P("M" + f(x - w * .04) + " " + f(y) + " H" + f(x + w * 1.04) + " L" + f(x + w * 1.1) + " " + f(y + 26) + " H" + f(x - w * .1) + " Z", ALU, 2.4);
  return s;
}
// a laptop: the lid with its screen above, the keyboard deck under it; o passes to keyboard(); o.screen(x, y, w, h) draws on screen
function laptopKB(x, y, u, o) {
  o = o || {}; var lx = x - u * .3, lw = u * 10.6, lh = u * 6.2, ly = y - u * .7 - lh, g = "";
  g += R(lx, ly, lw, lh, "#3f3f44", 2.6, 12) + R(lx + u * .35, ly + u * .35, lw - u * .7, lh - u * .7, "#e4eae7", 1.6, 4);
  if (o.screen) g += o.screen(lx + u * .35, ly + u * .35, lw - u * .7, lh - u * .7);
  g += R(lx + lw * .3, y - u * .78, lw * .4, u * .3, "#2c2c30", 1.6, 3);
  return g + keyboard(x, y, u, o.mix || 0, o);
}
function phoneKB(x, y, s, o) {   // a phone, its on-screen keyboard (QWERTY)
  o = o || {}; var w = 200 * s, h = 400 * s, g = "";
  g += R(x - w / 2, y - h / 2, w, h, "#2f2f33", 2.6, 26 * s) + R(x - w / 2 + 9 * s, y - h / 2 + 10 * s, w - 18 * s, h - 20 * s, "#eef1ef", 1.4, 18 * s);
  g += R(x - w / 2 + 9 * s, y + 10 * s, w - 18 * s, h / 2 - 20 * s, "#d4d8d6", 0, 0);
  var u = (w - 30 * s) / 10;
  QW.forEach(function (row, r) { for (var i = 0; i < row.length; i++) { var kx = x - w / 2 + 15 * s + (i + OFFS[r] * .6) * u, ky = y + 26 * s + r * u * 1.35; g += '<rect x="' + f(kx + 1) + '" y="' + f(ky) + '" width="' + f(u - 2) + '" height="' + f(u * 1.15) + '" rx="3" fill="' + (o.hl && o.hl(row[i]) ? ORANGE : "#fff") + '" stroke="' + INK + '" stroke-width=".8"/>' + LT(row[i], kx + u / 2, ky + u * .82, u * .6, o.hl && o.hl(row[i]) ? "#fff" : INK); } });
  return g;
}
function snail(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", '<path d="M-70 30 C-60 10 40 10 70 24 C80 30 90 26 92 14 L100 -10 M92 14 L84 -14" fill="#c9a98a" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="-12" r="4" fill="' + INK + '"/><circle cx="84" cy="-16" r="4" fill="' + INK + '"/><circle cx="0" cy="-10" r="36" fill="#b88a5a" stroke="' + INK + '" stroke-width="3"/><path d="M0 -10 m-22 0 a22 22 0 1 0 22 -22 a14 14 0 1 0 14 14" fill="none" stroke="' + INK + '" stroke-width="2.4"/>'); }
function jamX(x, y, k) { return impact(x, y, k) + G("", tag("زنقة!", x + 150, y - 40, 1, 34, ORANGE), clamp(k * 3)); }
// alphabet strip: 26 letters, o.hl(ch) colour
function alpha(x, y, cw, o) { o = o || {}; var s = ""; for (var i = 0; i < 26; i++) { var ch = String.fromCharCode(65 + i), hl = o.hl ? o.hl(ch) : null; s += R(x + i * cw, y, cw - 3, cw * 1.25, hl || KC, 1.4, 3) + LT(ch, x + i * cw + (cw - 3) / 2, y + cw * .88, cw * .62, hl ? "#fff" : INK); } return s; }
// a keyboard drawn from rows of characters (historic layouts), key size u
function rowsKB(x, y, u, rows, o) {
  o = o || {}; var s = "";
  rows.forEach(function (row, r) { var ks = row.split(" "); for (var i = 0; i < ks.length; i++) { var kx = x + (i + (o.off ? o.off[r] : r * .3)) * u * 1.08, ky = y + r * u * 1.12, hl = o.hl ? o.hl(ks[i], r) : null; s += C(kx + u / 2, ky + u / 2, u * .48, "#1c1916", 1.8) + C(kx + u / 2, ky + u / 2, u * .38, hl || IVORY, 1) + SR(ks[i], kx + u / 2, ky + u * .66, u * .4, hl ? "#fff" : INK); } });
  return s;
}
var L1868 = ["- 3 5 7 9 N O P Q R S T U V W X Y Z", "2 4 6 8 . A B C D E F G H I J K L M"],
    L1870 = ["2 3 4 5 6 7 8 9 -", "A E I . ? Y U O ,", "B C D F G H J K L M", "Z X W V T S R Q P N"],
    L1873 = ["2 3 4 5 6 7 8 9 - ,", "Q W E . T Y I U O P", "Z S D F G H J K L M", "A X & C V B N ? ; R"];
function sholes(x, floorY, o) {   // Sholes seated, side view, facing left, hands forward on the machine; full beard
  o = o || {}; var hip = floorY - 114, m = fig({ x: x, y: hip, lean: 8, shirt: "#5b5f6a", hair: "#8a8278", hands: o.hands || [[x - 150, floorY - 196], [x - 140, floorY - 192]], bend: [1, 1], legs: [[88, -86], [84, -82]] });
  var hd = m.hd, beard = '<path d="M' + f(hd[0] - 22) + ' ' + f(hd[1] + 4) + ' C' + f(hd[0] - 30) + ' ' + f(hd[1] + 40) + ' ' + f(hd[0] - 6) + ' ' + f(hd[1] + 62) + ' ' + f(hd[0] + 10) + ' ' + f(hd[1] + 50) + ' C' + f(hd[0] + 18) + ' ' + f(hd[1] + 30) + ' ' + f(hd[0] + 14) + ' ' + f(hd[1] + 12) + ' ' + f(hd[0] + 8) + ' ' + f(hd[1] + 8) + ' Z" fill="#a39b90" stroke="' + INK + '" stroke-width="1.8"/>';
  var chair = R(x - 30, floorY - 104, 96, 12, WOOD, 2) + R(x + 52, floorY - 260, 12, 168, WOOD_D, 2) + R(x - 24, floorY - 92, 10, 92, WOOD_D, 2) + R(x + 48, floorY - 92, 10, 92, WOOD_D, 2);
  return chair + m.far + m.body + beard + m.near;
}

// ── shots (one per idea; line numbers from script.txt) ──
var iS = RING.indexOf("S"), iT = RING.indexOf("T");
function fingerOn(p, down) { return G("translate(" + f(p[0]) + " " + f(p[1] - 34 - (1 - down) * 40) + ")", '<path d="M-14 -120 L-14 -10 C-14 6 14 6 14 -10 L14 -120" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-8 -16 q8 -6 16 0" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>'); }
function stWord(w, x, y, sz) {   // an English word with "ST" in orange
  var i = w.indexOf("ST"), a = w.slice(0, i), b = w.slice(i + 2);
  return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Serif;direction:ltr"><tspan fill="' + INK + '">' + a + '</tspan><tspan fill="' + ORANGE + '">ST</tspan><tspan fill="' + INK + '">' + b + '</tspan></text>';
}

// 4 · «كانت بالترتيب فعلًا… في الأول»: the keys fly from QWERTY back into A B C
shot(4, push(320, 400, 1.05, 1.12), function (u, d, t) {
  var m = function (ch) { return at(u, .7 + (ch.charCodeAt(0) - 65) * .04, 1.1); };
  return paper() + keyboard(75, 380, 48, m, { hl: function (ch) { return m(ch) >= 1 && "ABC".indexOf(ch) >= 0 ? OLIVE : null; } }) +
    G("", tag("في الأول", 320, 240, 1, 40, OLIVE), at(u, 2.4, .3));
}, { tr: "fade" });
// 5 · 1868: Sholes at his table with the wooden patent model
shot(5, push(330, 430, 1.0, 1.1), function (u, d, t) {
  var fl = 660, s = paper() + floor(fl);
  s += R(110, fl - 172, 250, 14, WOOD, 2.2) + R(126, fl - 158, 12, 158, WOOD_D, 2) + R(332, fl - 158, 12, 158, WOOD_D, 2);
  // the patent model on the table, side view: wooden box, long keys sloping to the front, platen on top
  s += R(170, fl - 250, 150, 78, WOOD, 2.2) + '<path d="M176 ' + (fl - 236) + ' H312" stroke="' + WOOD_D + '" stroke-width="1.4"/>' + P("M170 " + (fl - 186) + " L132 " + (fl - 178) + " L132 " + (fl - 172) + " L170 " + (fl - 176) + " Z", IVORY, 1.8);
  s += R(200, fl - 272, 110, 18, "#4a433c", 2, 8) + R(236, fl - 320, 50, 50, PAPERW, 1.6);
  var tap = Math.abs(Math.sin(t * 7)) * 5;
  s += sholes(470, fl, { hands: [[150, fl - 190 + tap], [168, fl - 194 + (5 - tap)]] });
  return s + numBox("1868", 150, 140, at(u, .3, .4), 44) + label(505, fl - 190, 600, 330, "شولز", OLIVE, at(u, 2.6, .5), 30) + label(250, fl - 230, 330, 300, "آلة كاتبة", ORANGE, at(u, 3.6, .5), 26);
});
// 6 · like a piano: two rows of keys, A → M on the lower row, N → Z on the upper
shot(6, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var lit = function (ch) { var c = ch.charCodeAt(0) - 65; if (c < 0 || c > 25) return null; return u > 2.0 + c * .1 ? OLIVE : null; };
  return paper() + piano68(30, 330, 580, { hl: lit, press: function (ch) { var c = ch.charCodeAt(0) - 65; return c >= 0 && c < 26 ? clamp(1 - Math.abs(u - 2.0 - c * .1) * 8) : 0; } }) +
    iconBox(530, 110, 140, '<rect x="-56" y="-40" width="112" height="80" fill="' + IVORY + '" stroke="' + INK + '" stroke-width="2"/>' + [-42, -14, 14, 42].map(function (x) { return '<path d="M' + x + ' -40 V40" stroke="' + INK + '" stroke-width="1.5"/>'; }).join("") + [-28, 0, 28].map(function (x) { return R(x - 7, -40, 14, 46, INK, 0); }).join(""), at(u, .4, .4)) +
    G("", T("بيانو", 530, 210, 22, INK, 700), at(u, .6, .3)) + label(300, 600, 160, 690, "صفين زراير", INK, at(u, 1.0, .5), 26) + G("", LT("A → M", 200, 160, 40, OLIVE, 800) + LT("N → Z", 200, 220, 40, OLIVE, 800), at(u, 3.6, .4));
});
// 7 · «طب الآلة دي كانت بتكتب إزاي؟»: the side cut, everything grey, a question mark
shot(7, push(330, 400, .92, .98), function (u, d, t) {
  return paper() + dim(.6, sideCut(t, .08 * Math.sin(t * 3) + .08, {}).svg) + G("", T("؟", 520, 330, 170, ORANGE, 800), at(u, .2, .3));
});
// 8 · each key → a thin steel arm with the letter raised on its end
shot(8, push(300, 420, 1.0, 1.12), function (u, d, t) {
  var c = sideCut(t, .04 + .03 * Math.sin(t * 2.5), { hl: u > .6 ? ORANGE : STEEL });
  return paper() + c.svg + label(c.key[0] + 20, c.key[1], 220, 520, "زرار", INK, at(u, .3, .4), 26) + label(166, 420, 420, 380, "دراع حديد", ORANGE, at(u, .9, .5), 28) +
    inset(480, 520, 84, G("scale(2.6)", R(-14, -16, 28, 32, STEEL, 1.4) + SR("S", 0, 9, 22) + '<path d="M-14 -16 L14 -16" stroke="#fff" stroke-width="1" opacity=".5"/>'), at(u, 2.2, .4)) +
    draw("M" + f(c.tip[0]) + " " + f(c.tip[1]) + " L396 520", at(u, 2.0, .3), INK, 1.4) + G("", T("الحرف بارز", 470, 670, 26, ORANGE, 800), at(u, 2.6, .3));
}, { tr: "in" });
// 9 · all the arms hang in a ring under the paper
shot(9, push(320, 400, 1.0, .94), function (u, d, t) {
  return paper() + basket(t, { swing: function (i) { return .03 * Math.sin(t * 3 + i); }, col: function (i) { return u > .4 && Math.abs(((u - .4) * 14) % BAS.n - i) < 1.5 ? OLIVE : null; } }) +
    label(453, 417, 520, 560, "الدايرة", OLIVE, at(u, .5, .4), 28) + label(400, 60, 560, 40, "الورقة", INK, at(u, 1.4, .4), 26);
}, { tr: "out" });
// 10 · press the key, the arm swings up, hits ribbon and paper, falls back
shot(10, push(330, 380, 1.0, 1.06), function (u, d, t) {
  var cyc = Math.max(0, u - .4) % 1.3, k = cyc < .35 ? ease(cyc / .35) : cyc < .55 ? 1 : 1 - ease((cyc - .55) / .5), n = Math.floor(Math.max(0, u - .4) / 1.3) + (cyc > .35 ? 1 : 0);
  var typed = "THE".slice(0, Math.min(3, n)), chs = "THE", ch = chs[Math.min(2, Math.floor(Math.max(0, u - .4) / 1.3))];
  var c = sideCut(t, k, { ch: ch, finger: function (p) { return fingerOn(p, k); } });
  return paper() + c.svg + impact(320, 262, cyc > .3 && cyc < .7 ? (cyc - .3) / .4 : 0) + G("", tag(typed || "…", 520, 110, 1, 34, INK), at(u, 1.0, .3));
});
// 11 · the problem: two neighbours on the ring, typed fast
shot(11, push(320, 380, 1.08, 1.18), function (u, d, t) {
  var sw = function (i) { if (i === iS) return u < 2.6 ? at(u, 1.6, .35) : 1 - at(u, 2.6, 1.6) * .3; if (i === iT) return u > 3.4 ? at(u, 3.4, .8) * .5 : 0; return 0; };
  return paper() + basket(t, { swing: sw, col: function (i) { return i === iS ? ORANGE : i === iT && u > 3.0 ? BLUE : null; }, letters: function (i) { return (i === iS || i === iT) && u > .5; } }) +
    G("", tag("جنب بعض", 320, 700, 1, 30, ORANGE), at(u, 1.0, .3));
}, { tr: "in" });
// 12 · the second comes up before the first is down: they jam; you stop and free them by hand
shot(12, push(320, 300, 1.2, 1.35), function (u, d, t) {
  var kS = lerp(.95, .78, at(u, 0, .6)), kT = at(u, .1, .6) * .8, jam = at(u, .5, .1);
  var s = paper() + basket(t, { swing: function (i) { return i === iS ? kS : i === iT ? kT : 0; }, col: function (i) { return i === iS ? ORANGE : i === iT ? BLUE : null; }, letters: function (i) { return i === iS || i === iT; } });
  var b = bar3(ringTheta(iS), kS).tip;
  s += jamX(b[0], b[1], at(u, .6, .6)) + cross(b[0] - 120, b[1] - 60, 1, at(u, 1.6, .5));
  var hk = at(u, 2.6, .9), hx = lerp(700, b[0] + 70, hk), hy = lerp(560, b[1] + 50, hk);
  return s + G("rotate(-30 " + f(hx) + " " + f(hy) + ")", mitt(hx, hy, 1, "#5b5f6a"));
});
// 13 · in English, letters next to each other in the alphabet come together a lot: S and T
shot(13, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), row = "PQRSTUV";
  for (var i = 0; i < row.length; i++) { var hl = u > .5 && (row[i] === "S" || row[i] === "T") ? ORANGE : null; s += key(56 + i * 76, 140, 68, row[i], { hl: hl, press: hl ? clamp(1 - Math.abs(u - .6 - (row[i] === "T") * .25) * 6) : 0 }); }
  s += G("", '<path d="M284 236 v14 h144 v-14" fill="none" stroke="' + ORANGE + '" stroke-width="2.6"/>' + T("جنب بعض", 356, 290, 24, ORANGE, 700), at(u, .8, .3));
  ["FIRST", "BEST", "STOP", "MOST"].forEach(function (w, i) { s += G("", stWord(w, 180 + (i % 2) * 280, 420 + Math.floor(i / 2) * 120, 62), at(u, 1.6 + i * .45, .35)); });
  return s + G("", T("بيتكتبوا ورا بعض كتير", 320, 700, 28, INK, 700), at(u, 3.2, .3));
});
// 14 · five years of trying: 1868 → 1870 → 1873 (the real layouts)
shot(14, push(320, 390, 1.0, 1.04), function (u, d, t) {
  var w = d / 3, k1 = 1 - at(u, w - .3, .3), k2 = Math.min(at(u, w - .3, .3), 1 - at(u, 2 * w - .3, .3)), k3 = at(u, 2 * w - .3, .3);
  var yr = u < w ? "1868" : u < 2 * w ? "1870" : "1873", s = paper();
  s += G("", rowsKB(8, 330, 32, L1868, { off: [0, .5] }), k1) + G("", rowsKB(14, 270, 52, L1870, { hl: function (c, r) { return r === 1 && "AEIYUO".indexOf(c) >= 0 ? OLIVE : null; } }), k2) +
       G("", rowsKB(20, 270, 52, L1873, { hl: function (c, r) { return r === 1 && "QWE.TY".indexOf(c) >= 0 && c !== "." ? ORANGE : null; } }), k3);
  return s + numBox(yr, 320, 160, 1, 46) + bigNum("5", "سنين تجارب", 320, 640, at(u, .4, .4), ORANGE, 70);
});
// 15 · he moved the pairs apart on the ring so their arms never meet
shot(15, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var mv = at(u, .5, 1.6), thS = ringTheta(iS) + mv * Math.PI * .9;
  return paper() + basket(t, { theta: function (i) { return i === iS ? thS : ringTheta(i); }, col: function (i) { return i === iS ? ORANGE : i === iT ? BLUE : null; }, letters: function (i) { return i === iS || i === iT; }, swing: function (i) { return i === iT ? .05 * Math.sin(t * 4) : 0; } }) +
    check(540, 140, 1.2, at(u, 2.4, .4), OLIVE) + G("", tag("بعيد عن بعض", 300, 720, 1, 30, OLIVE), at(u, 2.6, .3));
});
// 16 · 1874: the Sholes & Glidden, then its keyboard: Q W E R T Y
shot(16, function (u, d) { var k = ease((u - d * .5) / (d * .25)); return [lerp(320, 330, k), lerp(380, 620, k), lerp(.92, 1.45, k)]; }, function (u, d, t) {
  var q = function (ch, row) { var j = "QWERTY".indexOf(ch); return row === 1 && j >= 0 && u > d * .7 + j * .32 ? ORANGE : null; };
  return paper() + G("translate(0 40)", sg1874(t, { hl: q, typed: "" })) + numBox("1874", 110, 80, at(u, .4, .4), 44) +
    G("", T("أول آلة", 520, 60, 26, OLIVE, 800) + T("تنجح في السوق", 520, 96, 26, OLIVE, 800), at(u, 1.6, .4) * (1 - at(u, d * .5, .3)));
}, { tr: "fade" });
// 17 · almost the same as yours today: a few letters moved later (M, and C ↔ X)
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var diff = function (c) { return "MCX".indexOf(c) >= 0; };
  var s = paper() + T("1874", 320, 120, 26, MUTE, 700) + rowsKB(60, 150, 44, ["Q W E R T Y U I O P", "A S D F G H J K L M", "Z C X V B N"], { off: [0, .3, .6], hl: function (c) { return u > 1.6 && diff(c) ? ORANGE : null; } });
  s += T("دلوقتي", 320, 450, 26, MUTE, 700) + keyboard(60, 480, 44, 0, { hl: function (c) { return u > 1.6 && diff(c) ? ORANGE : null; } });
  return s + check(560, 230, .8, at(u, .5, .4), OLIVE) + check(560, 560, .8, at(u, .8, .4), OLIVE);
});
// 18 · computers and phones: no arms to jam at all
shot(18, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + laptopKB(50, 500, 34, {}) + phoneKB(530, 470, .95, {}) +
    iconBox(140, 150, 150, G("scale(.19) translate(-320 -290)", basket(t, {})), at(u, 1.0, .3)) + cross(140, 150, 1.3, at(u, 1.8, .5));
}, { tr: "out" });
// 19 · everyone had learned it: 150 years and counting
shot(19, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + draw("M70 520 H580", at(u, .2, 1), INK, 3);
  [["1874", 90, function () { return G("translate(100 420) scale(.3) translate(-320 -380)", sg1874(t, {})); }], ["1980", 330, function () { return G("translate(262 440) scale(.32)", laptopKB(0, 160, 20, {})); }], ["2026", 560, function () { return G("translate(560 410)", phoneKB(0, 0, .45, {})); }]].forEach(function (p, i) {
    var k = at(u, .3 + i * .5, .4); s += appear(k, p[2]()) + G("", N(p[0], p[1], 570, 26, INK), k) + G("", C(p[1], 520, 7, INK, 0), k);
  });
  return s + bigNum(count(150, at(u, 1.0, 1.3)) + "+", "سنة", 320, 230, at(u, .9, .3), ORANGE, 110);
});
// 20 · 1936: the Dvorak layout, said to be faster; almost nobody learned it
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var dv = ["' , . P Y F G C R L", "A O E U I D H T N S", "; Q J K X B M W V Z"], k2 = at(u, d * .62, .5);
  var s = paper() + numBox("1936", 320, 120, at(u, .2, .4), 44) + dim(k2, rowsKB(40, 220, 48, dv, { off: [.4, .2, .6], hl: function (c, r) { return r === 1 && u > 1.6 && "AOEUI".indexOf(c) >= 0 ? BLUE : null; } }));
  s += label(320, 240, 470, 180, "ديفوراك", BLUE, at(u, 1.0, .4) * (1 - k2), 28);
  // who uses what: QWERTY almost all, Dvorak a sliver
  s += G("", T("QWERTY", 560, 560, 26, INK, 800).replace("Noto Sans Arabic", "Noto Serif") + R(60, 530, 420 * at(u, d * .64, .8), 40, ORANGE, 2) +
    T("Dvorak", 560, 640, 26, INK, 800).replace("Noto Sans Arabic", "Noto Serif") + R(60, 610, 8 * at(u, d * .7, .4) + 1, 40, BLUE, 2), k2);
  return s;
});
// 21 · the myth: «made to slow you down» — no
shot(21, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + keyboard(40, 470, 48, 0) + snail(320 + 10 * Math.sin(t * 2), 380, 1.3) + G("", tag("يبطّأك؟", 320, 200, 1, 40, INK), at(u, .5, .3)) + cross(320, 360, 2.6, at(u, d - 1.0, .4));
});
// 22 · it was made so the machine doesn't jam, so you can type fast without stopping
shot(22, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var order = [0, 18, 9, 27, 4, 22, 13, 31], per = .28;
  var sw = function (i) { var j = order.indexOf(i); if (j < 0) return 0; var p = ((u - .3) / per - j) % order.length; return p >= 0 && p < 1.6 ? Math.sin(Math.min(1, p / 1.6) * Math.PI) : 0; };
  var n = Math.max(0, Math.floor((u - .3) / per)), typed = "TYPE FAST".slice(0, Math.min(9, n));
  return paper() + basket(t, { swing: sw, col: function (i) { return sw(i) > .05 ? OLIVE : null; }, typed: typed }) + check(560, 600, 1.3, at(u, 2.6, .4), OLIVE);
});
// 23 · recap: in order → jam → spread apart → we got used to it
shot(23, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper(), cells = [[30, 60], [330, 60], [30, 420], [330, 420]], w = 280, h = 320;
  var art = [
    function () { return G("translate(16 120) scale(.5)", rowsKB(0, 0, 44, ["A B C D E F G H I J", "K L M N O P Q R S"], { off: [0, .3] })); },
    function () { return G("translate(140 170) scale(.38) translate(-320 -280)", basket(t, { swing: function (i) { return i === iS ? .78 : i === iT ? .8 : 0; }, col: function (i) { return i === iS ? ORANGE : i === iT ? BLUE : null; } })) + cross(140, 120, .8, 1); },
    function () { return G("translate(140 170) scale(.38) translate(-320 -280)", basket(t, { theta: function (i) { return i === iS ? ringTheta(iS) + Math.PI * .9 : ringTheta(i); }, col: function (i) { return i === iS ? ORANGE : i === iT ? BLUE : null; } })); },
    function () { return G("translate(10 140)", keyboard(14, 0, 22, 0, { hl: function (c) { return "QWERTY".indexOf(c) >= 0 ? ORANGE : null; } })); }];
  var nm = ["بالترتيب", "زنقة", "اتفرّقت", "اتعودنا"], when = [.2, 1.3, 2.6, 3.8];
  cells.forEach(function (c, i) { var k = at(u, when[i], .4); if (k <= 0) return; s += G("translate(" + c[0] + " " + c[1] + ")", appear(k, R(0, 0, w, h, "#f4ecdb", 2) + art[i]() + callout(String(i + 1), 26, 26, k) + T(nm[i], w / 2, h - 20, 26, i === 1 ? ORANGE : INK, 800))); });
  return s;
});
// 24 · the odd fact: the middle row still holds D F G H J K L in order (E and I went to the top row with the vowels)
shot(24, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var l = LN[24], st = (l.end - l.start) * .5, lit = function (c) { var j = "DFGHJKL".indexOf(c); return j >= 0 && u > st + j * .3 ? OLIVE : null; };
  var s = paper() + keyboard(75, 300, 48, 0, { hl: lit, press: function (c) { var j = "DFGHJKL".indexOf(c); return j >= 0 ? clamp(1 - Math.abs(u - st - j * .3) * 6) : 0; } });
  var abc = "DEFGHIJKL";
  for (var i = 0; i < abc.length; i++) { var gap = abc[i] === "E" || abc[i] === "I", k = at(u, .6 + i * .1, .3); if (k > 0) s += G("", gap ? '<rect x="' + (34 + i * 64) + '" y="560" width="58" height="62" rx="6" fill="none" stroke="' + MUTE + '" stroke-width="2" stroke-dasharray="6 5"/>' + LT(abc[i], 63 + i * 64, 604, 26, MUTE) : key(34 + i * 64, 560, 58, abc[i], { hl: OLIVE }), k); }
  s += G("", T("من أيام البيانو", 320, 120, 34, OLIVE, 800), at(u, st + 2.2, .4));
  return s;
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  var l1 = LN[1], fr = [.24, .38, .52, .66, .79, .92], s = "";
  var lit = function (ch) { var j = "QWERTY".indexOf(ch); if (j < 0 || li < 1) return null; return t > l1.start + (l1.end - l1.start) * fr[j] ? ORANGE : null; };
  var tap = function (ch) { var j = "QWERTY".indexOf(ch); if (li < 1 || j < 0) return li === 0 ? clamp(Math.sin(t * 9 + ch.charCodeAt(0)) * 2 - 1.4) : 0; return clamp(1 - Math.abs(t - l1.start - (l1.end - l1.start) * fr[j]) * 5); };
  var typed = "QWERTY".split("").filter(function (c) { return lit(c); }).join("");
  s += laptopKB(62, 430, 44, { hl: lit, press: tap, screen: function (x, y, w, h) {
    var g = '<text x="' + f(x + 24) + '" y="' + f(y + 70) + '" style="font:800 56px Noto Serif;fill:' + ORANGE + ';direction:ltr">' + typed + (Math.floor(t * 2.5) % 2 ? "|" : "") + '</text>';
    if (li >= 2) g += G("", LT("A B C ?", x + w / 2, y + h - 34, 58, OLIVE, 800), ease((t - LN[2].start) / .4));
    return g; } });
  return s;
};
SCENE.bumper = function (u, t) {
  var k = Math.abs(Math.sin(t * 2.6));
  return G("translate(90 104) scale(.29) translate(-320 -390)", sideCut(t, k, { ch: "Q", key: k }).svg);
};
SCENE.outro = function (svg, u, t) {
  var c = sideCut(t, Math.abs(Math.sin(t * 2)), { ch: "Q" });
  return G("translate(10 -6) scale(.42)", c.svg) + G("translate(290 60)", keyboard(0, 0, 26, 0, { hl: function (ch) { return "QWERTY".indexOf(ch) >= 0 ? ORANGE : null; } })) +
    callout("1", 30, 226, ease(u / .3)) + callout("2", 98, 176, ease(u / .3 - .5)) + callout("3", 200, 130, ease(u / .3 - 1)) + callout("4", 470, 40, ease(u / .3 - 1.5));
};
