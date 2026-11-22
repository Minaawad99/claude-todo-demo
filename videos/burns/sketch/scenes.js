window.CHUNKS = [[0.0, 0.413], [0.0, 0.3276], [0.0, 0.6071], [0.0, 0.4194], [0.0, 0.25, 0.7692], [0.0], [0.0, 0.1169, 0.3117, 0.4675, 0.8182], [0.0, 0.4118], [0.0, 0.6833], [0.0, 0.3226], [0.0, 0.2658, 0.6203], [0.0, 0.7045], [0.0, 0.3019, 0.5849], [0.0, 0.6444], [0.0, 0.1833, 0.75], [0.0, 0.1358, 0.5802], [0.0, 0.5686], [0.0, 0.1719, 0.6719], [0.0, 0.2464], [0.0, 0.3333, 0.5287, 0.8391], [0.0, 0.5814], [0.0, 0.4746, 0.7119], [0.0, 0.7619], [0.0, 0.1807, 0.3253, 0.5663, 0.7831], [0.0, 0.3333, 0.6267], [0.0, 0.5714], [0.0]];
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

// ── «لو حد اتحرق قدامك» — drawings. The skin cut follows the real anatomy picture «Skin layers.png» (Wikimedia Commons,
// Madhero88, CC BY-SA 3.0; refs/SOURCES.md): a thin epidermis with a wavy lower edge (the rete ridges), a thick dermis with
// a shallow vessel network looping up into the papillae and a deep artery/vein pair, a hair follicle and a coiled sweat
// gland with its duct up to the surface, and yellow fat lobules under it all. Drawn as a 2.5D cut block in the «طب إزاي؟»
// hand (reference sheet v20). The forearm close-up, the tap and the sink are flat side views; people are the shared kit.

var SK = (window.PERSON && PERSON.colors) || {}, SKC = SK.skin || "#e0a98a", SKD = SK.skinD || "#c07f62", SKL = SK.skinL || "#efc3a8";
var EPI = "#efcdb8", EPI_D = "#d9a58c", DERM = "#e3a594", DERM_L = "#eab7a6", FAT = "#efdc9c", FAT_D = "#c9b36a", ART = "#b8443a", VEIN = "#4a6f8a",
    SWEAT = "#e6cf74", HEAT = "#c8412e", BURN = "#d06a58", BURN_D = "#a9483b", METAL = "#cfd2cd", METAL_D = "#9da29c", TILE = "#e7e0c8",
    COUNTER = "#c3bb8f", WATER = "#a9c6d6", PASTE = "#e4eee2", ICE = "#e3eef2", CLOTH = "#7f97a6", CLOTH_W = "#5d7686";

function pts2d(a) { return a.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function smooth(pts, close) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1])); }

// ── the skin cut (2.5D block). Front face x 40..600; surface y 230; epidermis to ~262, dermis to 470, fat to 650.
// o: {heat: depth 0..1 of the block, hot: 0..1 strength, rise: 0..1 cooling (top first, deep last), water: 0..1 running water
//     on top, ice: 0..1 (cubes on top, vessels clamp, tissue greys), paste: 0..1 (a layer on top that traps the heat),
//     blister: 0..1, newSkin: 0..1, film: 0..1 (cling film laid on top), hl: "epi" | "derm" | "fat" | "vessels"}
var SX0 = 40, SX1 = 600, STOP = 230, SEPI = 262, SDER = 470, SBOT = 650, SDX = 48, SDY = -46;
function ridge(x0, x1, y, a, ph) { var p = []; for (var x = x0; x <= x1; x += 7) p.push([x, y + a * Math.sin((x + (ph || 0)) / 28 * Math.PI * 2) + a * .35 * Math.sin(x / 11)]); return p; }
function skinCut(t, o) {
  o = o || {}; var s = "", bl = clamp(o.blister || 0), ice = clamp(o.ice || 0), flow = o.ice ? 1 - ice : 1;
  // top face (the skin surface seen from above) and right side face
  s += P("M" + SX0 + " " + STOP + " L" + SX1 + " " + STOP + " L" + (SX1 + SDX) + " " + (STOP + SDY) + " L" + (SX0 + SDX) + " " + (STOP + SDY) + " Z", "#e9b9a2", 2.2);
  for (var i = 0; i < 9; i++) { var lx = SX0 + 30 + i * 62; s += '<path d="M' + f(lx) + ' ' + (STOP - 6) + ' l' + f(SDX * .6) + ' ' + f(SDY * .6) + '" stroke="' + SKD + '" stroke-width="1" opacity=".45"/>'; }
  s += P("M" + SX1 + " " + STOP + " L" + (SX1 + SDX) + " " + (STOP + SDY) + " L" + (SX1 + SDX) + " " + (SBOT + SDY) + " L" + SX1 + " " + SBOT + " Z", "#d9b28e", 2.2);
  s += '<path d="M' + SX1 + ' ' + SEPI + ' l' + SDX + ' ' + SDY + ' M' + SX1 + ' ' + SDER + ' l' + SDX + ' ' + SDY + '" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<path d="M' + SX1 + ' ' + STOP + ' L' + (SX1 + SDX) + ' ' + (STOP + SDY) + ' L' + (SX1 + SDX) + ' ' + (SEPI + SDY) + ' L' + SX1 + ' ' + SEPI + ' Z" fill="' + EPI + '" opacity=".8"/><path d="M' + SX1 + ' ' + SEPI + ' L' + (SX1 + SDX) + ' ' + (SEPI + SDY) + ' L' + (SX1 + SDX) + ' ' + (SDER + SDY) + ' L' + SX1 + ' ' + SDER + ' Z" fill="' + DERM + '" opacity=".75"/><path d="M' + SX1 + ' ' + SDER + ' L' + (SX1 + SDX) + ' ' + (SDER + SDY) + ' L' + (SX1 + SDX) + ' ' + (SBOT + SDY) + ' L' + SX1 + ' ' + SBOT + ' Z" fill="' + FAT + '" opacity=".8"/>';
  // fat (hypodermis): yellow lobules in a honeycomb
  s += R(SX0, SDER, SX1 - SX0, SBOT - SDER, FAT, 2.2);
  var id = "fc" + (++CLIPN); s += '<clipPath id="' + id + '"><rect x="' + SX0 + '" y="' + SDER + '" width="' + (SX1 - SX0) + '" height="' + (SBOT - SDER) + '"/></clipPath><g clip-path="url(#' + id + ')">';
  for (var r = 0; r < 4; r++) for (var c = 0; c < 10; c++) { var cx = SX0 + 10 + c * 62 + (r % 2) * 31, cy = SDER + 30 + r * 46; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="28" ry="20" fill="#f4e6b4" stroke="' + FAT_D + '" stroke-width="1.6"/>'; }
  s += '</g>';
  // dermis
  s += R(SX0, SEPI - 10, SX1 - SX0, SDER - SEPI + 10, DERM, 2.2);
  s += '<rect x="' + SX0 + '" y="' + (SEPI - 10) + '" width="' + (SX1 - SX0) + '" height="40" fill="' + DERM_L + '" opacity=".7"/>';
  // collagen strokes
  for (i = 0; i < 26; i++) { var hx = SX0 + 20 + hash(i) * 520, hy = 300 + hash(i + 40) * 150; s += '<path d="M' + f(hx) + ' ' + f(hy) + ' q12 -5 26 0" stroke="#c98778" stroke-width="1.2" fill="none" opacity=".55"/>'; }
  // the sweat gland (coiled, deep in the dermis) and its duct to the surface
  var gx = 170, gy = 448, coil = "M" + gx + " " + gy; for (i = 0; i <= 24; i++) { var a = i / 24 * Math.PI * 6; coil += " L" + f(gx + Math.cos(a) * (14 - i * .2) + i * .6) + " " + f(gy + Math.sin(a) * 9); }
  s += '<path d="' + coil + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="' + coil + '" stroke="' + SWEAT + '" stroke-width="4" fill="none" stroke-linejoin="round"/>';
  s += '<path d="M' + (gx + 6) + ' ' + (gy - 8) + ' C' + (gx - 8) + ' 400 ' + (gx + 12) + ' 330 ' + gx + ' ' + STOP + '" stroke="' + INK + '" stroke-width="6" fill="none"/><path d="M' + (gx + 6) + ' ' + (gy - 8) + ' C' + (gx - 8) + ' 400 ' + (gx + 12) + ' 330 ' + gx + ' ' + STOP + '" stroke="' + SWEAT + '" stroke-width="3" fill="none"/>';
  // the hair follicle: a sheath down to the bulb, the shaft out through the surface
  s += P("M470 " + STOP + " C462 320 452 380 444 430 C440 452 470 462 478 446 C486 400 488 320 490 " + STOP + " Z", "#d9b8c8", 2) + '<path d="M480 450 C474 380 478 300 480 160" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M480 450 C474 380 478 300 480 160" stroke="#5a3a2a" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
  // a nerve fibre (olive), branching up
  s += '<path d="M340 470 C336 420 350 380 330 330 M336 380 C356 350 372 330 384 300" stroke="' + OLIVE + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  // vessels: the deep pair (artery red, vein blue), candelabra branches up to the shallow network that loops into the papillae
  var vw = 1 - .7 * ice, dash = f(-t * 40 * flow);
  function vessel(d, col, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w * vw + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w * vw) + '" fill="none" stroke-linecap="round"/>' + (flow > .05 ? '<path d="' + d + '" stroke="#fff" stroke-width="' + f(Math.max(1, w * vw * .35)) + '" fill="none" stroke-dasharray="3 14" stroke-dashoffset="' + dash + '" opacity="' + f(.6 * flow) + '"/>' : ""); }
  var deepA = "M" + SX0 + " 452 C200 446 360 458 " + SX1 + " 448", deepV = "M" + SX0 + " 462 C200 458 360 468 " + SX1 + " 460";
  s += vessel(deepV, VEIN, 9) + vessel(deepA, ART, 9);
  [100, 250, 400, 550].forEach(function (x, k) { s += vessel("M" + x + " 450 C" + (x + 8) + " 400 " + (x - 6) + " 340 " + (x + 4) + " 292", k % 2 ? VEIN : ART, 4.5); });
  var shallow = "M" + SX0 + " 292"; for (var x = SX0; x <= SX1; x += 28) shallow += " L" + (x + 4) + " 292 L" + (x + 10) + " 276 L" + (x + 18) + " 276 L" + (x + 24) + " 292";
  s += '<path d="' + shallow + '" stroke="' + INK + '" stroke-width="' + f(3 * vw + 2.4) + '" fill="none" stroke-linejoin="round"/><path d="' + shallow + '" stroke="' + ART + '" stroke-width="' + f(3 * vw) + '" fill="none" stroke-linejoin="round"/>';
  // epidermis: thin, with the wavy lower edge that fits the papillae
  var bottom = ridge(SX0, SX1, SEPI, 7, 0), lift = function (x) { var k = clamp(1 - Math.abs(x - 320) / 110); return -bl * 58 * Math.sin(k * Math.PI / 2) * Math.sin(k * Math.PI / 2); };
  if (bl > 0) {   // the blister: clear fluid under the lifted epidermis, the new skin forming on the floor of it
    var dome = "M210 " + STOP; for (x = 210; x <= 430; x += 6) dome += " L" + x + " " + f(STOP + lift(x)); for (x = 430; x >= 210; x -= 6) dome += " L" + x + " " + f(SEPI + 2 + lift(x) * .1);
    s += P(dome + " Z", "#f2e8c0", 1.6) + '<path d="' + dome + ' Z" fill="url(#hatch)" opacity=".25"/>';
    if (o.newSkin) s += draw("M222 " + (SEPI + 2) + " C280 " + (SEPI - 4) + " 360 " + (SEPI - 4) + " 418 " + (SEPI + 2), o.newSkin, OLIVE, 6);
  }
  var epiTop = [], epiBot = [];
  for (x = SX0; x <= SX1; x += 6) epiTop.push([x, STOP + lift(x)]);
  bottom.forEach(function (p) { epiBot.push([p[0], bl > 0 && p[0] > 214 && p[0] < 426 ? STOP + lift(p[0]) + 16 : p[1]]); });
  var epi = pts2d(epiTop) + " L" + epiBot.slice().reverse().map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  s += P(epi, EPI, 2.2) + '<path d="' + pts2d(epiTop.map(function (p) { return [p[0], p[1] + 7]; })) + '" stroke="' + EPI_D + '" stroke-width="1.6" fill="none" opacity=".8"/>';
  // highlight one layer: the others step back
  if (o.hl) { var band = o.hl === "epi" ? [STOP - 4, SEPI + 8] : o.hl === "derm" ? [SEPI, SDER] : o.hl === "fat" ? [SDER, SBOT] : null;
    if (band) s += '<path fill-rule="evenodd" d="M' + (SX0 - 2) + ' ' + (STOP - 2) + ' H' + (SX1 + 2) + ' V' + (SBOT + 2) + ' H' + (SX0 - 2) + ' Z M' + SX0 + ' ' + band[0] + ' H' + SX1 + ' V' + band[1] + ' H' + SX0 + ' Z" fill="' + PAPER + '" opacity="' + f(.55 * (o.hlk == null ? 1 : o.hlk)) + '"/>'; }
  // ice greys the tissue that has lost its blood
  if (ice > 0) s += '<rect x="' + SX0 + '" y="' + STOP + '" width="' + (SX1 - SX0) + '" height="' + (SDER - STOP) + '" fill="#9a9e9c" opacity="' + f(.38 * ice) + '"/>';
  // trapped heat: a red tint down to the heat depth, and hot dots that leave from the top when cooled
  var hd = clamp(o.heat || 0), hot = o.hot == null ? 1 : o.hot, rise = clamp(o.rise || 0), cap = o.paste ? clamp(o.paste) : 0;
  if (hd > 0 && hot > 0) {
    var dep = STOP + hd * (SBOT - STOP), cool = rise * (dep - STOP), y0 = STOP + cool * (cap ? 0 : 1);
    for (var b = 0; b < 6; b++) { var ya = Math.max(STOP, y0 + (dep - y0) * b / 6), yb = y0 + (dep - y0) * (b + 1) / 6; if (yb > ya) s += '<rect x="' + SX0 + '" y="' + f(ya) + '" width="' + (SX1 - SX0) + '" height="' + f(yb - ya) + '" fill="' + HEAT + '" opacity="' + f(hot * .32 * (1 - b / 6)) + '"/>'; }
    for (i = 0; i < 54; i++) {
      var base = hash(i + 7), dx0 = SX0 + 14 + hash(i + 90) * 530, dy0 = STOP + 10 + base * hd * (SBOT - STOP - 20);
      var mine = clamp(rise * 1.7 - base * .7), yy = dy0, op = hot;
      if (cap) { yy = Math.max(STOP + 12, dy0 - mine * (dy0 - STOP)); yy += 3 * Math.sin(t * 7 + i); }   // under the paste: pushed up, stuck
      else { yy = lerp(dy0, STOP - 70 - hash(i + 3) * 60, mine); op = hot * (1 - clamp((STOP - yy) / 110)); }
      yy += 2.5 * Math.sin(t * 3 + i * 1.7); var xx = dx0 + 3 * Math.cos(t * 2.4 + i);
      if (op > .02) s += '<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="6" fill="' + HEAT + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(op) + '"/>';
    }
  }
  // cut-line edges
  s += '<path d="M' + SX0 + ' ' + STOP + ' V' + SBOT + ' H' + SX1 + ' V' + STOP + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  // things lying on the surface
  if (o.water) { var wk = clamp(o.water); s += G("", P("M" + SX0 + " " + (STOP - 40) + " C200 " + f(STOP - 46 + 4 * Math.sin(t * 3)) + " 420 " + f(STOP - 36 + 4 * Math.sin(t * 3 + 1)) + " " + SX1 + " " + (STOP - 40) + " L" + SX1 + " " + STOP + " L" + SX0 + " " + STOP + " Z", WATER, 1.8) +
      wave(SX0 + 20, STOP - 22, SX1 - 20, STOP - 22, t * .8, "#ffffff", 4, 40, 1, 2.4) + arrow(160, STOP - 64, 460, STOP - 64, BLUE, 5, 1), wk); }
  if (ice > 0) { for (i = 0; i < 4; i++) { var ix = 140 + i * 110, iy = STOP - 34 + 4 * Math.sin(t * 2 + i); s += G("translate(0 " + f(-60 * (1 - ice)) + ")", R(ix - 34, iy - 30, 68, 64, ICE, 2.2, 8) + '<path d="M' + (ix - 24) + ' ' + (iy - 18) + ' l20 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/>', ice); } }
  if (cap > 0) { s += G("", P("M" + SX0 + " " + (STOP - 22) + " C140 " + (STOP - 30) + " 260 " + (STOP - 16) + " 360 " + (STOP - 26) + " C460 " + (STOP - 34) + " 540 " + (STOP - 20) + " " + SX1 + " " + (STOP - 24) + " L" + SX1 + " " + STOP + " L" + SX0 + " " + STOP + " Z", PASTE, 2) +
      '<path d="M80 ' + (STOP - 12) + ' h60 M240 ' + (STOP - 10) + ' h80 M420 ' + (STOP - 12) + ' h70" stroke="#9fc0a0" stroke-width="3" stroke-linecap="round"/>', cap);
    if (o.germs) for (i = 0; i < 9; i++) { var gk = clamp(o.germs * 9 - i), mx = 70 + hash(i + 50) * 480, my = STOP - 14 + 6 * Math.sin(t * 4 + i); if (gk > 0) s += G("translate(" + f(mx) + " " + f(my) + ") rotate(" + f(30 * Math.sin(t * 2 + i)) + ") scale(" + f(pop(gk)) + ")", '<rect x="-11" y="-5" width="22" height="10" rx="5" fill="#7d8a3e" stroke="' + INK + '" stroke-width="1.4"/><path d="M11 0 q6 -4 10 2" stroke="' + INK + '" stroke-width="1.2" fill="none"/>'); } }
  if (o.film) s += G("", '<path d="M' + (SX0 - 20) + ' ' + f(STOP - 8 - 3 * Math.sin(t * 2)) + ' C200 ' + f(STOP - 14) + ' 420 ' + f(STOP - 4) + ' ' + (SX1 + 20) + ' ' + f(STOP - 10 + 3 * Math.sin(t * 2 + 1)) + '" stroke="#9fb7c3" stroke-width="5" fill="none" opacity=".8"/><path d="M' + (SX0 - 20) + ' ' + f(STOP - 8) + ' C200 ' + f(STOP - 14) + ' 420 ' + f(STOP - 4) + ' ' + (SX1 + 20) + ' ' + f(STOP - 10) + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".9"/>', clamp(o.film));
  return s;
}
// layer labels on the cut
function skinLabels(k1, k2, k3, sz) { return label(560, 246, 610, 140, "البشرة", OLIVE, k1, sz || 26) + label(560, 360, 620, 330, "الأدمة", OLIVE, k2, sz || 26) + label(560, 560, 620, 600, "الدهون", OLIVE, k3, sz || 26); }

// ── the forearm close-up, seen from the side, hand to the right (wrist at x 470). o: {y, burn 0..1, sleeve 0..1 (on), wet,
//    film 0..1, water 0..1 (running over it), stuck 0..1 (a patch of cloth left on the burn), hand: pose, blister}
function forearm(t, o) {
  o = o || {}; var y = o.y || 470, br = .6 * Math.sin(t * 1.3), s = "";
  var top = [[-120, y - 50 + br], [60, y - 48], [220, y - 42], [360, y - 34], [470, y - 27]], bot = [[470, y + 27], [360, y + 33], [220, y + 44], [60, y + 52], [-120, y + 56 + br]];
  var d = smooth(top) + " L" + bot.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  s += PERSON.hand([462, y + 2], .04 + .02 * Math.sin(t * .9), o.hand || "relaxed", 1, 2.55, null, false);
  s += P(d, SKC, 2.4) + '<path d="' + smooth([[-120, y + 34], [100, y + 34], [300, y + 22], [450, y + 16]]) + '" stroke="' + SKD + '" stroke-width="12" fill="none" opacity=".35" stroke-linecap="round"/>';
  s += '<path d="M60 ' + (y - 30) + ' q40 -6 80 0" stroke="' + SKD + '" stroke-width="1.4" fill="none" opacity=".6"/>';
  // the burn on the upper side of the forearm
  var bk = clamp(o.burn == null ? 1 : o.burn);
  if (bk > 0) { var bx = 270, by = y - 18, bp = []; for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI * 2, rr = (1 + .18 * Math.sin(i * 2.3) + .12 * Math.cos(i * 3.7)); bp.push([bx + Math.cos(a) * 92 * rr * (.6 + .4 * bk), by + Math.sin(a) * 22 * rr * (.6 + .4 * bk)]); }
    s += G("", '<path d="' + smooth(bp, true) + '" fill="' + BURN + '" stroke="' + BURN_D + '" stroke-width="2"/><path d="' + smooth(bp.map(function (p) { return [bx + (p[0] - bx) * .55, by + (p[1] - by) * .55 - 2]; }), true) + '" fill="#bf5546" opacity=".8"/><path d="M' + (bx - 40) + ' ' + (by - 8) + ' q30 -6 60 -2" stroke="#f3b8a8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>', bk); }
  if (o.blister) s += G("", '<ellipse cx="300" cy="' + (y - 30) + '" rx="20" ry="12" fill="#f2e8c0" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="294" cy="' + (y - 35) + '" rx="6" ry="3" fill="#fff" opacity=".8"/><ellipse cx="240" cy="' + (y - 24) + '" rx="12" ry="8" fill="#f2e8c0" stroke="' + INK + '" stroke-width="1.6"/>', clamp(o.blister));
  if (o.stuck) s += G("", '<path d="M250 ' + (y - 34) + ' l40 -4 l8 18 l-34 10 z" fill="' + CLOTH + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M256 ' + (y - 28) + ' l30 -3 M258 ' + (y - 22) + ' l30 -3" stroke="' + CLOTH_W + '" stroke-width="1.2"/>', clamp(o.stuck));
  // the sleeve: a cuff over the forearm that can be pulled off to the left
  if (o.sleeve) { var sl = clamp(o.sleeve), end = lerp(-160, 420, sl), sd = smooth([[-200, y - 58], [end - 20, y - 46], [end, y - 40]]) + " L" + f(end + 4) + " " + (y + 38) + " L" + f(end - 20) + " " + (y + 46) + " L-200 " + (y + 64) + " Z";
    s += P(sd, o.wet ? CLOTH_W : CLOTH, 2.4) + '<path d="M' + f(end - 22) + ' ' + (y - 44) + ' L' + f(end - 18) + ' ' + (y + 44) + '" stroke="' + INK + '" stroke-width="1.6"/>';
    for (i = 0; i < 5; i++) s += '<path d="M' + f(end - 60 - i * 70) + ' ' + (y - 40) + ' q-14 30 4 70" stroke="#5f788a" stroke-width="1.6" fill="none" opacity=".7"/>';
    if (o.wet) for (i = 0; i < 6; i++) { var dp = (t * 1.1 + i / 6) % 1, dx = end - 40 - i * 60; s += '<circle cx="' + f(dx) + '" cy="' + f(y - 10 + (i % 3) * 16) + '" r="6" fill="' + HEAT + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(.6 + .4 * Math.sin(t * 4 + i)) + '"/>' + '<path d="M' + f(dx + 6) + ' ' + f(y + 50 + dp * 40) + ' v8" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - dp) + '"/>'; } }
  if (o.film) { var fk = clamp(o.film); s += G("", '<path d="' + smooth([[150, y - 46 - 30 * (1 - fk)], [270, y - 52 - 30 * (1 - fk)], [400, y - 42 - 30 * (1 - fk)]]) + ' L410 ' + (y + 10) + ' L150 ' + (y + 14) + ' Z" fill="#dfeef4" stroke="#8fb0c0" stroke-width="2" opacity=".55"/><path d="M180 ' + f(y - 40 - 30 * (1 - fk)) + ' l40 -4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>', fk); }
  if (o.water) { var wk = clamp(o.water); s += G("", '<path d="' + smooth([[150, y - 34], [270, y - 42], [400, y - 32]]) + ' L400 ' + (y + 30) + ' L150 ' + (y + 40) + ' Z" fill="' + WATER + '" opacity=".55"/>' + wave(160, y - 24, 400, y - 18, t * .9, "#ffffff", 3, 34, 1, 2.2) + wave(160, y + 4, 400, y + 6, t * .9 + 1, "#ffffff", 3, 34, 1, 2), wk); }
  return s;
}
// the tap and the sink around the forearm: wall tiles, the counter and the basin; mouth = where the water leaves the tap
function kitchenSink(t, o) {
  o = o || {}; var y = o.y || 470, s = "", mx = o.mx || 290, my = y - 190;
  s += R(-400, -600, 1440, y + 600 + 70, TILE, 0); for (var i = -8; i < 24; i++) s += '<path d="M' + (i * 64) + ' -600 V' + (y + 70) + '" stroke="#d8cfb2" stroke-width="1.4"/>'; for (var j = -10; j < 20; j++) if (j * 64 < y + 70) s += '<path d="M-400 ' + (j * 64) + ' H1040" stroke="#d8cfb2" stroke-width="1.4"/>';
  s += R(-400, y + 70, 1440, 40, COUNTER, 2.4) + R(-400, y + 110, 1440, 600, "#d9d0ad", 2) + '<rect x="-400" y="' + (y + 110) + '" width="1440" height="600" fill="url(#hatch)" opacity=".5"/>';
  s += P("M20 " + (y + 70) + " L50 " + (y + 200) + " Q60 " + (y + 214) + " 80 " + (y + 214) + " L520 " + (y + 214) + " Q540 " + (y + 214) + " 550 " + (y + 200) + " L580 " + (y + 70) + " Z", "#f0ece0", 2.4);
  // the tap: base on the counter behind, gooseneck over to the mouth
  var bx = mx + 150; s += R(bx - 24, y + 40, 48, 34, METAL_D, 2) ;
  var neck = "M" + bx + " " + (y + 44) + " L" + bx + " " + (my - 60) + " C" + bx + " " + (my - 140) + " " + mx + " " + (my - 140) + " " + mx + " " + (my - 50) + " L" + mx + " " + my;
  s += '<path d="' + neck + '" stroke="' + INK + '" stroke-width="30" fill="none" stroke-linecap="butt"/><path d="' + neck + '" stroke="' + METAL + '" stroke-width="24" fill="none"/><path d="' + neck + '" stroke="#fff" stroke-width="5" fill="none" opacity=".6" transform="translate(-5 0)"/>';
  s += R(mx - 16, my - 6, 32, 12, METAL_D, 2) + R(bx + 14, y - 20, 40, 14, METAL_D, 2, 4);
  if (o.run) { var rk = clamp(o.run); s += G("", R(mx - 12, my + 6, 24, y - 36 - my - 6, WATER, 0) + '<path d="M' + (mx - 6) + ' ' + (my + 6) + ' V' + (y - 34) + ' M' + (mx + 5) + ' ' + (my + 6) + ' V' + (y - 34) + '" stroke="#fff" stroke-width="2.4" stroke-dasharray="10 12" stroke-dashoffset="' + f(-t * 140) + '"/>', rk);
    s += G("", [160, 240, 330, 410].map(function (x, k) { return '<path d="M' + x + ' ' + (y + 40) + ' V' + (y + 200) + '" stroke="' + WATER + '" stroke-width="6" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 120 - k * 7) + '" stroke-linecap="round"/>'; }).join("") + '<path d="M60 ' + (y + 206) + ' H540" stroke="' + WATER + '" stroke-width="10" opacity=".7"/>', rk); }
  return s;
}
function armScene(t, o) { o = o || {}; return kitchenSink(t, o) + forearm(t, o); }
// a magnified circle on the burn that shows the skin cut (like a lens on the arm)
function lens(t, o, cx, cy, r, k, tx, ty) { return draw("M" + tx + " " + ty + " L" + f(cx - r * .5) + " " + f(cy + r * .85), k, INK, 1.6) + draw("M" + tx + " " + ty + " L" + f(cx + r * .5) + " " + f(cy + r * .85), k, INK, 1.6) + '<circle cx="' + tx + '" cy="' + ty + '" r="' + f(14 * clamp(k * 2)) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + inset(cx, cy, r, G("scale(" + f(r / 190) + ") translate(-320 -330)", skinCut(t, o)), k); }

// a stopwatch counting minutes (k 0..1 of the 20 minutes)
function watch(x, y, r, k, txt) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 12, y - r - 22, 24, 16, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 9, "none", 1.2);
  for (var i = 0; i < 12; i++) { var b = -Math.PI / 2 + i * Math.PI / 6; s += '<path d="M' + f(x + Math.cos(b) * (r - 18)) + ' ' + f(y + Math.sin(b) * (r - 18)) + ' L' + f(x + Math.cos(b) * (r - 9)) + ' ' + f(y + Math.sin(b) * (r - 9)) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3.4) + '"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 10) + ' A' + (r - 10) + ' ' + (r - 10) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 10)) + ' ' + f(y + Math.sin(a) * (r - 10)) + ' Z" fill="' + BLUE + '" opacity=".3"/>';
  s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 16)) + ' ' + f(y + Math.sin(a) * (r - 16)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
  return s + (txt ? N(txt, x, y + r + 34, r * .5, ORANGE) : "");
}
function mmss(sec) { sec = Math.max(0, Math.round(sec)); return ("0" + Math.floor(sec / 60)).slice(-2) + ":" + ("0" + sec % 60).slice(-2); }
// small props
function pasteTube(x, y, sc, rot) { return G("translate(" + x + " " + y + ") rotate(" + (rot || 0) + ") scale(" + (sc || 1) + ")", P("M-70 -26 L50 -22 L50 22 L-70 26 Q-80 0 -70 -26 Z", "#f4f2ec", 2.2) + R(-40, -18, 60, 36, "#5f9a8a", 0) + T("معجون", -10, 8, 15, "#fff", 800) + R(50, -14, 22, 28, "#4a7f72", 2, 3) + '<path d="M-70 -26 L-78 -30 M-70 26 L-78 30" stroke="' + INK + '" stroke-width="2"/>'); }
function iceCubes(x, y, sc) { var s = ""; [[-30, 10], [20, 0], [0, -34]].forEach(function (p, i) { s += G("translate(" + (x + p[0] * sc) + " " + (y + p[1] * sc) + ") rotate(" + (i * 14 - 10) + ") scale(" + sc + ")", R(-24, -22, 48, 46, ICE, 2.2, 7) + '<path d="M-14 -12 l16 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-24 10 l48 0" stroke="#b8cfd8" stroke-width="2"/>'); }); return s; }
function flame(x, y, sz, t, seed) { var w = Math.sin(t * 9 + (seed || 0)) * .12 + 1, h = sz * w; return '<path d="M' + f(x) + ' ' + f(y) + ' C' + f(x - sz * .6) + ' ' + f(y - h * .3) + ' ' + f(x - sz * .2) + ' ' + f(y - h * .7) + ' ' + f(x + sz * .05 * Math.sin(t * 7 + (seed || 0))) + ' ' + f(y - h) + ' C' + f(x + sz * .25) + ' ' + f(y - h * .6) + ' ' + f(x + sz * .6) + ' ' + f(y - h * .35) + ' ' + f(x) + ' ' + f(y) + ' Z" fill="#e08a3a" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x) + ' ' + f(y - 2) + ' C' + f(x - sz * .25) + ' ' + f(y - h * .25) + ' ' + f(x) + ' ' + f(y - h * .5) + ' ' + f(x + sz * .05) + ' ' + f(y - h * .6) + ' C' + f(x + sz * .2) + ' ' + f(y - h * .35) + ' ' + f(x + sz * .2) + ' ' + f(y - h * .2) + ' ' + f(x) + ' ' + f(y - 2) + ' Z" fill="#f4cf5a"/>'; }
function steam(x, y, t, n, h) { var s = ""; for (var i = 0; i < (n || 3); i++) { var p = (t * .5 + i / (n || 3)) % 1, xx = x + (i - 1) * 22; s += '<path d="M' + f(xx) + ' ' + f(y - p * (h || 60)) + ' q-10 -12 0 -24 q10 -12 0 -24" stroke="' + MUTE + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(p * Math.PI) * .9) + '"/>'; } return s; }
function pot(x, y, sc, tilt) { return G("translate(" + x + " " + y + ") rotate(" + (tilt || 0) + ") scale(" + (sc || 1) + ")", P("M-80 -50 L80 -50 L72 40 Q70 54 56 54 L-56 54 Q-70 54 -72 40 Z", "#9a9e9c", 2.4) + R(-90, -60, 180, 14, "#b8bcb8", 2.2, 4) + R(-128, -50, 48, 12, INK, 0, 5) + R(80, -50, 48, 12, INK, 0, 5) + '<path d="M-60 -30 V30" stroke="#fff" stroke-width="5" opacity=".5" stroke-linecap="round"/>'); }
function hospital(x, y, sc) { return G("translate(" + x + " " + y + ") scale(" + (sc || 1) + ")", R(-70, -60, 140, 110, "#f4efe3", 2.4) + R(-80, -74, 160, 18, "#c9c2ad", 2) + R(-16, 10, 32, 40, "#9fb7c3", 2) + '<path d="M-12 -40 h24 v14 h14 v24 h-14 v14 h-24 v-14 h-14 v-24 h14 z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.8" transform="translate(0 4) scale(.8)"/>' + R(-58, -6, 24, 20, "#9fb7c3", 1.6) + R(34, -6, 24, 20, "#9fb7c3", 1.6)); }
// a steak on a board, cut through: brown crust, pink middle; the grey band of cooked meat creeps inward (cook 0..1)
function steak(x, y, sc, t, cook) {
  var s = '<ellipse cx="0" cy="54" rx="210" ry="30" fill="#b48a5a" stroke="' + INK + '" stroke-width="2.4"/><rect x="-210" y="40" width="420" height="16" fill="#b48a5a"/>';
  s += P("M-170 -10 C-170 -70 170 -70 170 -10 L170 40 C170 60 -170 60 -170 40 Z", "#7a4a32", 2.6);
  s += '<path d="M-160 -4 C-160 -48 160 -48 160 -4 L160 36 C160 50 -160 50 -160 36 Z" fill="#a07060"/>';
  var g = 20 + 40 * cook; s += '<path d="M' + f(-160 + g) + ' ' + f(-4 + g * .3) + ' C' + f(-160 + g) + ' ' + f(-48 + g * .6) + ' ' + f(160 - g) + ' ' + f(-48 + g * .6) + ' ' + f(160 - g) + ' ' + f(-4 + g * .3) + ' L' + f(160 - g) + ' ' + f(36 - g * .4) + ' C' + f(160 - g) + ' ' + f(46 - g * .4) + ' ' + f(-160 + g) + ' ' + f(46 - g * .4) + ' ' + f(-160 + g) + ' ' + f(36 - g * .4) + ' Z" fill="#d98a86"/>';
  for (var i = 0; i < 10; i++) { var p = (t * .35 + i / 10) % 1, a = i / 10 * Math.PI * 2; s += '<circle cx="' + f(Math.cos(a) * 150 * (1 - p * .6)) + '" cy="' + f(4 + Math.sin(a) * 38 * (1 - p * .6)) + '" r="5" fill="' + HEAT + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(Math.sin(p * Math.PI)) + '"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + sc + ")", s + steam(0, -60, t, 3, 70));
}
// a person (the shared kit), front view, in a T-shirt so the forearm shows. o passes through; returns {svg, joints}
function man(o) { return PERSON.front(Object.assign({ s: 1, legs: "stand", outfit: "casual", breath: .5 }, o)); }
function floorLine(y) { return '<path d="M-400 ' + y + ' H1040" stroke="' + INK + '" stroke-width="2.4"/>' + R(-400, y, 1440, 400, "#e3d7bd", 0) + '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#hatch)" opacity=".35"/>'; }
function box(x, y, w, h, inner) { var id = "bx" + (++CLIPN); return '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/></clipPath>' + R(x, y, w, h, PAPER, 0) + '<g clip-path="url(#' + id + ')">' + inner + '</g>' + R(x, y, w, h, "none", 2); }
function chips(on, x, y) { var s = ""; for (var i = 0; i < 3; i++) { var c = i < on, cx = x + (i - 1) * 46; s += (i ? '<path d="M' + (cx - 30) + ' ' + y + ' h14" stroke="' + INK + '" stroke-width="1.6"/>' : "") + '<circle cx="' + cx + '" cy="' + y + '" r="17" fill="' + (c ? BLUE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), cx, y + 7, 18, c ? "#fff" : INK); } return s; }

// ── shots (one per idea; line numbers from script.txt) ──
var LENS = [430, 200, 150];
// 4 · the rule card: «a burn doesn't stop when the fire goes away» — pinned as a card over the arm
shot(4, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + dim(.5, armScene(t, { burn: 1 })) + G("rotate(" + f(-3 + Math.sin(t) ) + " 320 300)", R(110, 200, 420, 190, "#f6efdc", 2.6) + R(300, 186, 40, 26, ORANGE, 2) + T("قاعدة", 320, 270, 40, INK, 800) + G("", T("خليك فاكرها", 320, 330, 26, MUTE, 700), at(u, 1.0, .4)), at(u, .1, .3));
});
// 5 · the pot is gone, but the red patch keeps spreading and the heat keeps going down in the lens
shot(5, push(330, 400, 1.04, 1.12), function (u, d, t) {
  var gone = at(u, .2, .6), grow = at(u, .6, d - .6);
  return paper() + armScene(t, { burn: .6 + .4 * grow }) + G("translate(" + f(300 - 400 * gone) + " " + f(240 - 120 * gone) + ")", pot(0, 0, .8, -20) + steam(0, -40, t), 1 - gone) +
    lens(t, { heat: .12 + .3 * grow }, LENS[0], LENS[1], LENS[2], at(u, .8, .5), 270, 450) + G("", T("لسه بيحرق", 170, 640, 32, ORANGE, 800), at(u, 1.2, .3));
});
// 6 · the skin: three layers named as they are said (epidermis, dermis with its vessels, fat)
shot(6, push(380, 400, 0.84, 0.8), function (u, d, t) {
  var c = window.CHUNKS[6], D = LN[6].end - LN[6].start, k1 = at(u, D * (c[1] || .25), .5), k2 = at(u, D * (c[2] || .5), .5), k3 = at(u, D * (c[3] || .78), .5);
  var hl = u < D * (c[1] || .25) ? null : u < D * (c[2] || .5) ? "epi" : u < D * (c[3] || .78) ? "derm" : "fat";
  return paper() + appear(at(u, 0, .6), skinCut(t, { hl: hl, hlk: at(u, D * (c[1] || .25), .4) })) + G("translate(0 0)", skinLabels(k1, k2, k3)) + label(250, 450, 150, 720, "العروق", ORANGE, at(u, D * (c[2] || .5) + .6, .5), 24);
}, { tr: "in" });
// 7 · the heat is trapped and goes on down, layer by layer, for minutes
shot(7, push(360, 420, 0.84, 0.88), function (u, d, t) {
  var hd = lerp(.08, .62, at(u, .4, d - .6));
  return paper() + skinCut(t, { heat: hd }) + arrow(70, 260, 70, 260 + hd * 390, ORANGE, 6, at(u, .3, .4)) + iconBox(130, 70, 120, watch(0, 4, 42, at(u, .4, d) * .12), at(u, .5, .3)) + G("", T("دقايق", 260, 84, 30, ORANGE, 800), at(u, .8, .3));
});
// 8 · like meat off the heat: it keeps cooking inside
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var cook = at(u, .3, d);
  return paper() + R(-200, 520, 1040, 400, "#e3d7bd", 2.4) + G("translate(" + f(-260 + 140 * at(u, 0, .7)) + " 300) rotate(-12)", '<ellipse cx="0" cy="0" rx="110" ry="30" fill="#3a3530" stroke="' + INK + '" stroke-width="2.4"/>' + flame(-30, 50, 30, t, 1) + flame(20, 50, 26, t, 2), 1 - at(u, .2, .6)) +
    steak(320, 450, 1.15, t, cook) + arrow(140, 250, 40, 250, INK, 4, at(u, .3, .5)) + G("", T("بعيد عن النار", 210, 220, 22, MUTE, 700), at(u, .6, .3)) + label(320, 450, 420, 680, "بتستوي من جوه", ORANGE, at(u, 1.3, .5), 24) +
    iconBox(530, 110, 140, G("scale(.2) translate(-330 -440)", skinCut(t, { heat: .5 })), at(u, 2.0, .3));
});
// 9–19 · the three steps: chips 1-2-3 stay on top
hud(9, 14, function (u) { return chips(1, 320, 50); });
hud(14, 17, function (u) { return chips(2, 320, 50); });
hud(17, 20, function (u) { return chips(3, 320, 50); });
// 9 · step one: get him away from what burns him (he steps back from the stove, the pot is set aside)
shot(9, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.4), x = lerp(300, 170, k), s = paper() + floorLine(700);
  s += R(380, 470, 280, 230, "#d9d0ad", 2.4) + R(370, 456, 300, 18, COUNTER, 2.2) + R(420, 480, 200, 120, "#3a3530", 2);
  s += pot(500, 410, .7, 0) + steam(500, 360, t);
  var w = PERSON.side(Object.assign({ x: x, s: .95, dir: -1, outfit: "casual", lean: 6, face: { eyes: 1.2, brows: "worried", mouth: "o" } }, PERSON.walkPose(t * 7, k > 0 && k < 1 ? 1 : 0)));
  w = PERSON.side(Object.assign({ x: x, s: .95, dir: -1, outfit: "casual", lean: 6, face: { eyes: 1.2, brows: "worried", mouth: "o" } }, PERSON.walkPose(t * 7, k > 0 && k < 1 ? 1 : 0), { y: PERSON.sideHipY(Object.assign({ x: x, s: .95, dir: -1, outfit: "casual", lean: 6 }, PERSON.walkPose(t * 7, k > 0 && k < 1 ? 1 : 0)), 700) }));
  s += w.svg + arrow(280, 300, 150, 300, BLUE, 6, at(u, .3, .6)) + check(160, 220, 1.2, at(u, 1.4, .4), BLUE) + G("", T("ابعده", 230, 260, 30, BLUE, 800), at(u, .6, .3));
  return s;
});
// 10 · boiling water or oil on the sleeve: the wet cloth holds the heat on the skin — take it off fast
shot(10, push(300, 430, 1.1, 1.04), function (u, d, t) {
  var half = (LN[10].end - LN[10].start) * .45, off = at(u, half, .9);
  return paper() + armScene(t, { burn: off, sleeve: 1 - off, wet: 1 }) + label(160, 480, 240, 620, "هدوم مبلولة", BLUE, at(u, .4, .5), 26) + G("", arrow(300, 360, 80, 360, ORANGE, 6, at(u, half, .6)) + T("اقلع", 200, 340, 30, ORANGE, 800), at(u, half - .2, .3)) +
    lens(t, { heat: .3 + .2 * Math.sin(t), hot: 1 - off * .5 }, 470, 210, 120, at(u, 1.0, .4) * (1 - off), 270, 450);
});
// 11 · but a piece of cloth stuck to the skin stays where it is
shot(11, push(280, 440, 1.35, 1.45), function (u, d, t) {
  return paper() + armScene(t, { burn: 1, stuck: 1 }) + label(276, 444, 240, 620, "قماش لازق", OLIVE, at(u, .3, .5), 26) + cross(120, 260, .9, at(u, .9, .4)) + G("", T("متشدّوش", 120, 340, 24, ORANGE, 800), at(u, 1.0, .3)) + check(470, 330, 1.1, at(u, 1.6, .4), OLIVE);
}, { tr: "in" });
// 12 · clothes on fire: running fans the flames with air — no
shot(12, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var x = 470 - u * 60, o = Object.assign({ s: .95, dir: -1, outfit: "casual", lean: 14, face: { eyes: 1.2, brows: "worried", mouth: "open" } }, PERSON.walkPose(t * 10, 1.2));
  o.x = x; o.y = PERSON.sideHipY(o, 700); var p = PERSON.side(o), J = p.joints, s = paper() + floorLine(700);
  var fl = 1 + .6 * at(u, 1.0, 1.4);
  s += p.svg; for (var i = 0; i < 4; i++) s += flame(x + 22 + i * 6, o.y - 30 - i * 40, 40 * fl, t, i);
  for (i = 0; i < 4; i++) { var q = (t * 1.4 + i / 4) % 1; s += '<path d="M' + f(x - 160 + q * 120) + ' ' + f(o.y - 180 + i * 50) + ' h50" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(Math.sin(q * Math.PI)) + '"/>'; }
  s += G("", T("هوا", 120, 180, 30, BLUE, 800), at(u, 1.4, .3)) + cross(520, 190, 1.2, at(u, d - 1.2, .4));
  return s;
});
// 13 · down on the floor, roll, or cover him with a blanket
shot(13, push(320, 470, 1.04, 1.12), function (u, d, t) {
  var roll = Math.sin(t * 3.4) * 24, cov = at(u, d * .55, .8), s = paper() + floorLine(640);
  var o = { x: 320 + roll, s: .9, dir: 1, rot: -90, outfit: "casual", legs: [{ hip: 0, knee: 4 }, { hip: 2, knee: 6 }], arms: [{ sh: 10, el: 30 }, { sh: -6, el: 20 }], face: { eyes: .6, brows: "worried", mouth: "frown" } };
  o.y = 640 - 26; var p = PERSON.side(o); s += p.svg;
  var fk = 1 - at(u, .4, d * .5); for (var i = 0; i < 4; i++) s += G("", flame(180 + i * 70 + roll, 600, 30 * fk, t, i), fk);
  s += G("", draw("M380 520 C420 470 480 480 470 540", 1, ORANGE, 5) + arrow(474, 530, 470, 548, ORANGE, 5, 1), at(u, .3, .4) * (1 - cov));
  s += G("translate(" + f(roll * .8) + " " + f(-200 * (1 - cov)) + ")", P("M80 640 C90 560 200 540 330 545 C460 540 560 560 572 640 Z", "#a97a5a", 2.6) + '<path d="M120 600 C220 580 420 580 540 600" stroke="#8a5f44" stroke-width="3" fill="none" stroke-dasharray="10 8"/>', cov) + G("", T("بطانية", 330, 500, 28, OLIVE, 800), cov);
  return s;
});
// 14 · step two: the burn under the plain tap water, a full twenty minutes on the stopwatch
shot(14, push(310, 380, 1.0, 1.06), function (u, d, t) {
  var run = at(u, .3, .5), tm = at(u, 1.6, d - 1.6) * 1200;
  return paper() + armScene(t, { burn: 1 - .25 * run, water: run, run: run }) + iconBox(530, 120, 150, watch(0, 0, 54, tm / 1200), at(u, 1.2, .3)) + G("", N(mmss(1200 - tm), 530, 240, 34, ORANGE), at(u, 1.4, .3)) +
    label(290, 330, 200, 200, "مية الحنفية", BLUE, at(u, .8, .5), 26);
});
// 15 · why twenty: running water pulls heat off the top, then the deeper heat comes up after it, a little at a time
shot(15, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var r = at(u, .6, d - .8);
  return paper() + skinCut(t, { heat: .55, rise: r, water: 1 }) + arrow(80, 560, 80, 250, ORANGE, 6, at(u, .8, .6)) + G("", T("لفوق", 100, 600, 24, ORANGE, 800), at(u, 1.0, .3)) + label(300, 196, 400, 130, "مية جارية", BLUE, at(u, .3, .5), 26) +
    iconBox(110, 100, 120, watch(0, 0, 42, r), at(u, .4, .3));
});
// 16 · like a hot pot under the tap: it doesn't cool in the first second
shot(16, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var cool = at(u, .4, d), s = paper() + kitchenSink(t, { y: 470, mx: 300, run: 1 });
  s += pot(300, 470, 1, 0) + steam(300, 400, t, 3, 60 * (1 - cool * .7));
  var th = 1 - cool * .55; s += G("translate(540 200)", R(-14, -110, 28, 200, "#f4efe3", 2.2, 14) + C(0, 104, 24, "#f4efe3", 2.2) + R(-6, -100 + 190 * (1 - th), 12, 190 * th, HEAT, 0, 6) + C(0, 104, 17, HEAT, 0));
  return s + G("", T("مش من أول ثانية", 380, 150, 28, INK, 800), at(u, .8, .3)) + iconBox(100, 100, 130, G("scale(.18) translate(-330 -420)", skinCut(t, { heat: .5, rise: cool, water: 1 })), at(u, 1.2, .3));
});
// 17 · step three: lay clean cling film over it, loose, not wrapped tight round the arm
shot(17, push(300, 420, 1.06, 1.14), function (u, d, t) {
  var lay = at(u, .6, 1.2), half = (LN[17].end - LN[17].start) * .55;
  var s = paper() + armScene(t, { burn: .75, film: lay });
  s += G("translate(" + f(lerp(560, 430, lay)) + " " + f(lerp(140, 300, lay)) + ")", R(-60, -24, 120, 48, "#e8e2d2", 2.2, 22) + R(-40, -20, 80, 40, "#9fb7c3", 0) + T("نايلون", 0, 8, 18, "#fff", 800), 1 - at(u, 1.6, .5));
  s += label(250, 440, 330, 610, "نايلون الأكل", BLUE, at(u, 1.2, .5), 26);
  s += G("", inset(150, 230, 100, G("translate(-80 -20)", '<path d="M-20 -50 C40 -90 120 -90 180 -50 L180 50 C120 90 40 90 -20 50 Z" fill="' + SKC + '" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3].map(function (i) { return '<path d="M' + (10 + i * 40) + ' -70 l-30 140" stroke="#8fb0c0" stroke-width="6" opacity=".8"/>'; }).join("")) + cross(0, 0, 1.4, at(u, half + .5, .4))), at(u, half, .3));
  return s;
});
// 18 · a blister: don't pop it, it's a ready dressing with new skin growing under it
shot(18, push(320, 360, 1.0, 1.06), function (u, d, t) {
  var b = at(u, .2, .8), ns = at(u, 1.8, 1.4);
  return paper() + skinCut(t, { blister: b, newSkin: ns }) + label(320, 200, 470, 110, "فقاعة", OLIVE, at(u, .6, .5), 26) + label(330, 258, 160, 120, "جلد جديد", OLIVE, at(u, 2.2, .5), 26) +
    G("translate(" + f(lerp(560, 400, at(u, .7, .6))) + " 150) rotate(-40)", R(-4, -90, 8, 90, METAL_D, 1.6) + R(-16, -170, 32, 80, "#f4efe3", 2), 1) + cross(420, 120, 1, at(u, 1.3, .4));
}, { tr: "in" });
// 19 · to hospital: bigger than his palm, white or black skin, or a child
shot(19, function (u, d) { return [320 + 30 * Math.sin(u * 1.2), 400, lerp(0.94, 1.08, u / d)]; }, function (u, d, t) {
  var c = window.CHUNKS[19], D = LN[19].end - LN[19].start, k1 = at(u, D * (c[1] || .3), .4), k2 = at(u, D * (c[2] || .6), .4), k3 = at(u, D * (c[3] || .85), .4);
  var s = paper() + '<circle cx="320" cy="150" r="' + f(90 + 14 * Math.sin(t * 5)) + '" fill="' + ORANGE + '" opacity=".12"/>' + hospital(320, 170 - 6 * Math.abs(Math.sin(t * 3)), 1.0) + G("", T("المستشفى", 320, 262, 28, ORANGE, 800), at(u, .3, .3));
  // the palm against a big burn
  s += G("translate(0 " + f(40 * (1 - k1)) + ")", R(40, 320, 260, 180, PAPER, 2) + G("translate(170 410)", '<ellipse rx="110" ry="60" fill="' + BURN + '" stroke="' + BURN_D + '" stroke-width="2"/>' + G("rotate(-90)", PERSON.hand([28, -6], 0, "flat", 1, 2.2, null, true)) ) + T("أكبر من الكف", 170, 530, 22, INK, 800), k1);
  // skin turned white or charred
  s += G("", R(340, 320, 260, 180, PAPER, 2) + '<ellipse cx="420" cy="410" rx="60" ry="44" fill="#f3efe6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="530" cy="410" rx="56" ry="42" fill="#3a3028" stroke="' + INK + '" stroke-width="2"/>' + T("أبيض", 420, 530, 22, INK, 800) + T("إسود", 530, 530, 22, INK, 800), k2);
  // a child
  var kid = PERSON.front({ x: 320, y: 660, s: .42, legs: "stand", outfit: "casual", colors: { shirt: "#e0b15a", shirtD: "#bb9040" }, breath: (Math.sin(t * 2) + 1) / 2, face: { eyes: 1, brows: "worried", mouth: "frown" }, arms: [{ rel: [-10, 60], hand: "relaxed" }, { rel: [10, 60], hand: "relaxed" }] });
  s += G("", kid.svg + T("طفل", 420, 600, 26, INK, 800), k3);
  return s;
});
// 20 · the myth: ice is better than water — no
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + G("translate(180 400)", iceCubes(0, 0, 1.6 + .04 * Math.sin(t * 3))) + G("translate(470 400)", R(-60, -90, 120, 180, "#f4efe3", 0) + '<path d="M-10 -120 V100" stroke="' + WATER + '" stroke-width="22" stroke-dasharray="20 8" stroke-dashoffset="' + f(-t * 90) + '"/>');
  s += T("تلج", 180, 560, 34, BLUE, 800) + T("مية", 470, 560, 34, BLUE, 800) + G("", T("أحسن؟", 330, 420, 34, INK, 800), at(u, .4, .3) * (1 - at(u, d - 1.3, .3)));
  return s + cross(180, 390, 2.2, at(u, d - 1.2, .5)) + G("", T("لأ", 330, 210, 60, ORANGE, 800), at(u, d - 1.0, .3));
});
// 21 · ice clamps the small vessels, no blood gets through, and the tissue dies off
shot(21, push(320, 380, 1.04, 1.12), function (u, d, t) {
  var ice = at(u, .3, d - .6);
  return paper() + skinCut(t, { ice: ice, heat: .35, hot: 1 - ice * .5 }) + label(250, 292, 330, 110, "العروق بتقفل", ORANGE, at(u, .8, .5), 26) + G("", T("مفيش دم", 470, 720, 28, ORANGE, 800), at(u, 2.0, .3));
});
// 22 · toothpaste or butter: a lid that keeps the heat in, and germs on top
shot(22, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var pk = at(u, .3, .6), half = (LN[22].end - LN[22].start) * .6;
  return paper() + skinCut(t, { heat: .5, paste: pk, rise: at(u, .6, 2), germs: at(u, half, 1.2) }) + G("translate(" + f(lerp(520, 470, pk)) + " 110)", pasteTube(0, 0, 1, -20), 1) + label(200, 210, 130, 110, "معجون", MUTE, at(u, .6, .5), 26) +
    label(300, 250, 300, 700, "السخونة محبوسة", ORANGE, at(u, 1.4, .5), 24) + G("", T("ميكروبات", 520, 260, 22, OLIVE, 800), at(u, half + .4, .3));
});
// 23 · «يعني من الآخر»: four steps in a row, then the two crosses
shot(23, function (u, d) { return [320 - 30 * Math.sin(u * 1.1), 400, lerp(0.92, 1.06, u / d)]; }, function (u, d, t) {
  var c = window.CHUNKS[23], D = LN[23].end - LN[23].start, k = [0, c[1] || .25, c[2] || .5, c[3] || .75].map(function (q) { return at(u, D * q, .4); }), s = paper(); [[40, 80], [340, 80], [40, 380], [340, 380]].forEach(function (q) { s += R(q[0], q[1], 260, 260, "none", 1.4, 0, ' stroke-dasharray="6 6" opacity=".5"'); }); s = '<g transform="rotate(' + f(1.2 * Math.sin(t * 1.8)) + ' 320 360)">' + s;
  s += G("", box(40, 80, 260, 260, pot(220 - 90 * ((u * .7) % 1), 210, .7, 0) + steam(220 - 90 * ((u * .7) % 1), 160, t) + arrow(260, 290, 80, 290, BLUE, 5, (u * .7) % 1)) + callout("1", 60, 100, 1), k[0]);
  s += G("", box(340, 80, 260, 260, G("translate(470 190) scale(.42) translate(-300 -420)", kitchenSink(t, { y: 470, mx: 300, run: 1 }) + forearm(t, { y: 470, burn: .7, water: 1 })) + N("20:00", 470, 324, 30, ORANGE)) + callout("2", 360, 100, 1), k[1]);
  s += G("", box(40, 380, 260, 260, G("translate(170 510) scale(.42) translate(-280 -470)", forearm(t, { y: 470, burn: .7, film: 1 }))) + callout("3", 60, 400, 1), k[2]);
  s += G("", box(340, 380, 260, 260, G("translate(420 500)", iceCubes(0, 0, .8)) + pasteTube(520, 540, .6, -20)) + cross(470, 510, 1.8, at(u, D * (c[3] || .75) + .4, .4)), k[3]);
  return s + "</g>";
}, { tr: "out" });
// 24 · the odd fact: his palm with the fingers is about 1% of all his skin
shot(24, push(300, 420, 1.0, 1.06), function (u, d, t) {
  var o = { x: 240, y: 470, s: .9, legs: "stand", outfit: "casual", breath: (Math.sin(t * 1.7) + 1) / 2, face: { eyes: 1, brows: "raised", mouth: "smile" }, head: { tilt: 2 * Math.sin(t) },
    arms: [{ rel: [-70, -30], hand: "open", palm: true, rot: -90, straight: true }, { rel: [12, 70], hand: "relaxed" }] };
  var p = PERSON.front(o), w = p.joints.wr ? p.joints.wr[0] : [120, 330], s = paper() + floorLine(720) + p.svg;
  s += G("", '<circle cx="' + f(w[0]) + '" cy="' + f(w[1] - 40) + '" r="' + f(56 + 4 * Math.sin(t * 3)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 8"/>', at(u, .6, .4));
  s += bigNum(count(1, at(u, 1.2, .8)) + "%", "من جلده كله", 490, 300, at(u, 1.0, .3), ORANGE, 110) + label(w[0], w[1] - 40, 420, 480, "الكف بصوابعه", OLIVE, at(u, 2.2, .5), 24);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a man at the stove, the pot tipped, boiling water on his forearm; line 1: toothpaste and ice come in; line 2: both crossed, the burn goes deeper
  var s = R(-20, 520, 660, 140, "#d9d0ad", 2.4) + R(-20, 506, 660, 18, COUNTER, 2.2) + R(360, 520, 230, 110, "#3a3530", 2);
  var sh = 2 * Math.sin(t * 13) * clamp(1 - t / 3), o = { x: 170 + sh, y: 500, s: .95, legs: "stand", outfit: "casual", breath: (Math.sin(t * 2.2) + 1) / 2, head: { tilt: -6, turn: .25 }, face: { eyes: 1.25, brows: "worried", mouth: "open", look: [.6, .2] } };
  var hd = PERSON.front(o).joints;
  o.arms = [{ rel: [-40, 70], hand: "open" }, { to: [hd.sh[1][0] + 140, hd.sh[1][1] + 34], hand: "open", bend: 1 }];
  var p = PERSON.front(o), el = p.joints.el[1], wr = p.joints.wr[1], bx = lerp(el[0], wr[0], .5), by = lerp(el[1], wr[1], .5);
  s += pot(470, 440, .8, 28) + '<path d="M410 420 C380 430 370 460 360 ' + f(470 + 6 * Math.sin(t * 8)) + '" stroke="' + WATER + '" stroke-width="12" fill="none" stroke-linecap="round"/>';
  s += p.svg + '<ellipse cx="' + f(bx) + '" cy="' + f(by - 3) + '" rx="22" ry="9" fill="' + BURN + '" stroke="' + BURN_D + '" stroke-width="1.6" transform="rotate(' + f(Math.atan2(wr[1] - el[1], wr[0] - el[0]) * 180 / Math.PI) + ' ' + f(bx) + ' ' + f(by) + ')"/>' + steam(bx, by - 20, t, 3, 50);
  if (li >= 1) { var u = t - LN[1].start, left = Math.max(0, 1200 - Math.max(0, u - .6) * 60);
    s += iconBox(470, 150, 170, watch(0, 4, 60, 1 - left / 1200), ease(u / .4)) + G("", N(mmss(left), 470, 280, 40, ORANGE), ease((u - .3) / .3));
    s += G("", inset(160, 150, 100, G("scale(.46) translate(-320 -430)", skinCut(t, { heat: lerp(.12, .6, ease((u - .8) / 3.5)) }))) + G("", T("قبل ما ينزل لجوه", 160, 286, 24, ORANGE, 800), ease((u - 2.2) / .3)), ease((u - .7) / .4)); }
  if (li >= 2) { var v = t - LN[2].start; s += G("", chips(3, 310, 30), ease(v / .4)); }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 96) scale(.3) translate(-300 -440)", kitchenSink(t, { y: 470, mx: 290, run: 1 }) + forearm(t, { y: 470, burn: .8, water: 1 })); };
SCENE.outro = function (svg, u, t) {
  return G("translate(170 150) scale(.42) translate(-300 -420)", kitchenSink(t, { y: 470, mx: 290, run: 1 }) + forearm(t, { y: 470, burn: .8, water: 1 })) + inset(450, 140, 120, G("scale(.6) translate(-320 -380)", skinCut(t, { heat: .5, rise: .5 + .3 * Math.sin(t), water: 1 })), 1) +
    callout("1", 420, 150, ease(u / .3)) + callout("2", 520, 200, ease(u / .3 - .5)) + callout("3", 410, 70, ease(u / .3 - 1)) + callout("4", 140, 140, ease(u / .3 - 1.5));
};
