window.CHUNKS = [[0.0, 0.2537, 0.6269], [0.0, 0.1912, 0.5441], [0.0], [0.0, 0.4194], [0.0], [0.0, 0.4, 0.6125], [0.0, 0.3, 0.6], [0.0], [0.0, 0.5915], [0.0], [0.0, 0.4444], [0.0, 0.4154, 0.6154], [0.0, 0.2432, 0.5811], [0.0, 0.3824], [0.0], [0.0, 0.3617], [0.0, 0.569], [0.0, 0.3111, 0.6, 0.7667], [0.0, 0.35, 0.7375], [0.0, 0.5432, 0.7284], [0.0, 0.2933, 0.56], [0.0, 0.1899, 0.3291, 0.481, 0.7089], [0.0, 0.3023, 0.5698, 0.6744, 0.8488], [0.0, 0.4507, 0.7042], [0.0], [0.0]];
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

// ── «لو الكاوتش ضرب على الطريق السريع» — drawings in the «اسكتش» hand. Views follow the «طب إزاي؟» references
// (sheet v10: the road and the car from above at an angle; sheet v18: the car in profile and a wheel close-up, the
// dashboard with the steering wheel) and real dimensions (refs/SOURCES.md):
//   car: a compact sedan, 4.5 m long, 1.8 m wide, wheelbase 2.7 m, track 1.55 m (top view 1 m = 62 units);
//   tyre: 205/55 R16 — 205 mm wide, sidewall 113 mm (55 %), rim 16" (406 mm), outside diameter 632 mm;
//   the radial tyre cut: tread, two steel belts, a nylon cap ply, the polyester body ply wrapped round the bead wires,
//   the inner liner, sitting on the rim flanges with the air inside.
// People: the shared person kit (videos/_templates/people/person.js), dressed casual (T-shirt, trousers, shoes).

var TYRE = "#34302b", TYRE2 = "#4a453e", RIM = "#b9b6ad", RIM_D = "#8f8b82", BODYC = "#c9b98f", BODY_D = "#a89870", GLASS = "#b9cdd4",
    ASPH = "#9c968a", ASPH_D = "#8a8478", DESERT = "#e2cf9f", STEEL = "#8d939a", PLY = "#d8b25a", LINER = "#5a534a", HOT = "#d9733f", AIR = "#7fa6bd";
function pts2d(p) { return p.map(function (q, i) { return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" "); }
function spark(x, y, k, n, col) {   // burst lines «طاخ»
  k = clamp(k); if (k <= 0 || k >= 1) return ""; var s = "", r = 18 + 60 * k;
  for (var i = 0; i < (n || 10); i++) { var a = i / (n || 10) * Math.PI * 2 + .2; s += '<path d="M' + f(x + Math.cos(a) * r * .45) + ' ' + f(y + Math.sin(a) * r * .45) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="' + f(6 * (1 - k) + 2) + '" stroke-linecap="round"/>'; }
  return s;
}
function chunkT(i, c) { var l = LN[i], ch = window.CHUNKS[i]; return l.start + (l.end - l.start) * (ch[c] || 0); }

// ── the car from above, nose up. Local units: 1 m = 62. o: {blown: "FL"|"FR"|"RL"|"RR", flap (t), steer (deg),
//    hl: wheel keys to highlight, light: wheel keys drawn light (unloaded), haz (0/1 hazard lights on), brake (0..1 lights)}
var WH = { FL: [-48, -84], FR: [48, -84], RL: [-48, 84], RR: [48, 84] };
function topCar(x, y, ang, o) {
  o = o || {}; var s = "", t = window.__t;
  ["FL", "FR", "RL", "RR"].forEach(function (k) {
    var p = WH[k], st = k[0] === "F" ? (o.steer || 0) : 0, bl = o.blown === k, w = bl ? 19 : 14, h = 40, lt = o.light && o.light.indexOf(k) >= 0;
    var g = R(-w / 2, -h / 2, w, h, bl ? "#5a2a1a" : TYRE, 2, 3);
    for (var j = -16; j <= 16; j += 6) g += '<path d="M' + f(-w / 2 + 2) + ' ' + j + ' h' + f(w - 4) + '" stroke="' + (bl ? ORANGE : TYRE2) + '" stroke-width="1.6"/>';
    if (bl) for (var j2 = 0; j2 < 3; j2++) { var ph = Math.sin(t * 22 + j2 * 2); g += '<path d="M' + f(k[1] === "L" ? -w / 2 : w / 2) + ' ' + f(-10 + j2 * 10) + ' q' + f((k[1] === "L" ? -1 : 1) * (10 + 5 * ph)) + ' ' + f(4 + 3 * ph) + ' ' + f((k[1] === "L" ? -1 : 1) * (14 + 6 * ph)) + ' ' + f(14) + '" stroke="' + TYRE + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
    s += G("translate(" + p[0] + " " + p[1] + ") rotate(" + st + ")", g, lt ? .35 : 1);
    if (o.hl && o.hl.indexOf(k) >= 0) s += '<rect x="' + f(p[0] - 14) + '" y="' + f(p[1] - 26) + '" width="28" height="52" rx="6" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="5 4"/>';
  });
  var body = "M-40 -137 Q0 -142 40 -137 Q54 -132 55 -112 L56 -60 L56 110 Q55 134 40 139 L-40 139 Q-55 134 -56 110 L-56 -60 L-55 -112 Q-54 -132 -40 -137 Z";
  s += '<path d="' + body + '" fill="' + INK + '" opacity=".14" transform="translate(6 8)"/>';
  s += P(body, BODYC, 2.4) + '<path d="' + body + '" fill="url(#hatch)" opacity=".25"/>';
  s += P("M-44 -128 Q0 -133 44 -128", "none", 1.3) + P("M-30 -128 L-26 -50 M30 -128 L26 -50", "none", 1.1);   // hood creases
  s += P("M-46 -48 Q0 -58 46 -48 L40 -14 Q0 -20 -40 -14 Z", GLASS, 2) + '<path d="M-30 -44 l18 -4 M10 -46 l22 -2" stroke="#eef4f4" stroke-width="2.4"/>';   // windscreen
  s += R(-41, -16, 82, 86, "#d6c79f", 2, 10) + P("M-40 70 Q0 76 40 70 L45 96 Q0 102 -45 96 Z", GLASS, 2);   // roof, rear window
  s += P("M-56 -40 l-12 4 l2 10 l10 -2 Z", BODYC, 1.6) + P("M56 -40 l12 4 l-2 10 l-10 -2 Z", BODYC, 1.6);   // mirrors
  s += P("M-50 -132 L-30 -138 L-30 -128 L-48 -124 Z", "#f4efe3", 1.4) + P("M50 -132 L30 -138 L30 -128 L48 -124 Z", "#f4efe3", 1.4);   // headlights
  var bk = o.brake ? .4 + .6 * o.brake : .55, hz = o.haz && Math.floor(t * 2.6) % 2 === 0;
  s += P("M-52 128 L-32 134 L-32 140 L-48 138 Z", hz ? "#f0a028" : ORANGE, 1.4, ' opacity="' + bk + '"') + P("M52 128 L32 134 L32 140 L48 138 Z", hz ? "#f0a028" : ORANGE, 1.4, ' opacity="' + bk + '"');
  if (hz) s += C(-50, -128, 5, "#f0a028", 0) + C(50, -128, 5, "#f0a028", 0);
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ")", s);
}
// the highway from above: asphalt, lane dashes scrolling with speed v (px/s), the edge line, the hard shoulder and desert
function road(t, v, opt) {
  opt = opt || {}; var s = R(-400, -400, 1440, 1600, DESERT, 0) + '<rect x="-400" y="-400" width="1440" height="1600" fill="url(#hatch)" opacity=".25"/>';
  s += R(40, -400, 470, 1600, ASPH, 0) + R(510, -400, 110, 1600, "#b3ac9c", 0) + '<rect x="510" y="-400" width="110" height="1600" fill="url(#hatch)" opacity=".5"/>';
  s += '<path d="M40 -400 V1200 M620 -400 V1200" stroke="' + INK + '" stroke-width="2.4"/><path d="M510 -400 V1200" stroke="#f4efe3" stroke-width="5"/><path d="M48 -400 V1200" stroke="#f4efe3" stroke-width="4"/>';
  var off = (t * (v == null ? 300 : v)) % 90;
  [197, 354].forEach(function (lx) { for (var y = -450 + off; y < 1200; y += 90) s += R(lx - 3, y, 6, 46, "#f4efe3", 0); });
  for (var i = 0; i < 14; i++) { var yy = ((i * 133 + t * (v == null ? 300 : v)) % 1600) - 400; s += C(-60 + 40 * hash(i), yy, 7 + 5 * hash(i + 3), "#c9b585", 1.2); s += C(690 + 50 * hash(i + 9), yy + 60, 6 + 6 * hash(i + 5), "#b8a774", 1.2); }
  if (opt.label) s += G("", T("كتف الطريق", 565, 330, 18, INK, 800), opt.label);
  return s;
}
// a curved dotted path (the car's track)
function track(pts, col, k) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length - 1; i += 2) d += " Q" + f(pts[i][0]) + " " + f(pts[i][1]) + " " + f(pts[i + 1][0]) + " " + f(pts[i + 1][1]); return draw(d, k == null ? 1 : k, col || ORANGE, 4, ' stroke-dasharray="2 10" stroke-linecap="round"'); }

// ── one wheel from the side (sheet v18 close-up): tyre with tread blocks, sidewall, a 5-spoke alloy rim.
//    flat 0..1: the bottom flattens and the sidewall bulges; spin: rotation (deg); shred: tread pieces flapping (t)
function wheelSide(cx, cy, r, o) {
  o = o || {}; var fl = clamp(o.flat || 0), yb = cy + r * (1 - .3 * fl), poly = [], s = "", N2 = 72;
  for (var i = 0; i < N2; i++) { var a = i / N2 * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (y > yb) { var sq = (y - yb) / (r * .3 + .01); x = cx + Math.cos(a) * r * (1 + .22 * fl * clamp(sq * 3)); y = yb; }
    else if (Math.sin(a) > .2) { x = cx + Math.cos(a) * r * (1 + .12 * fl * Math.sin(a)); }
    poly.push([x, y]); }
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(yb + 4) + '" rx="' + f(r * (.6 + .4 * fl)) + '" ry="7" fill="' + INK + '" opacity=".18"/>';
  s += '<path d="' + pts2d(poly) + ' Z" fill="' + (o.hot ? lerp(0, 1, 0) && TYRE : TYRE) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  if (o.hot) s += '<path d="' + pts2d(poly) + ' Z" fill="' + HOT + '" opacity="' + f(.55 * o.hot) + '"/>';
  var sp = (o.spin || 0) * Math.PI / 180;
  for (var j = 0; j < 36; j++) { var b = j / 36 * Math.PI * 2 + sp, p1 = [cx + Math.cos(b) * r * .98, cy + Math.sin(b) * r * .98], p2 = [cx + Math.cos(b) * r * .86, cy + Math.sin(b) * r * .86];
    if (p1[1] > yb - 2) continue; s += '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]) + '" stroke="' + TYRE2 + '" stroke-width="' + f(r * .05) + '"/>'; }
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .8) + '" fill="none" stroke="' + TYRE2 + '" stroke-width="1.6"/>';
  var rr = r * .64; s += C(cx, cy, rr, RIM, 2.4) + C(cx, cy, rr * .86, RIM_D, 1.6);
  for (var k = 0; k < 5; k++) { var c = k / 5 * Math.PI * 2 + sp, d = c + .36, e = c - .36;
    s += '<path d="M' + f(cx + Math.cos(c - .12) * rr * .26) + ' ' + f(cy + Math.sin(c - .12) * rr * .26) + ' L' + f(cx + Math.cos(e) * rr * .84) + ' ' + f(cy + Math.sin(e) * rr * .84) + ' A' + f(rr * .84) + ' ' + f(rr * .84) + ' 0 0 1 ' + f(cx + Math.cos(d) * rr * .84) + ' ' + f(cy + Math.sin(d) * rr * .84) + ' L' + f(cx + Math.cos(c + .12) * rr * .26) + ' ' + f(cy + Math.sin(c + .12) * rr * .26) + ' Z" fill="' + RIM + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
  s += C(cx, cy, rr * .28, "#d3d0c8", 2) + C(cx, cy, rr * .1, INK, 0);
  for (var m = 0; m < 5; m++) { var q = m / 5 * Math.PI * 2 + sp + .63; s += C(cx + Math.cos(q) * rr * .18, cy + Math.sin(q) * rr * .18, rr * .035, INK, 0); }
  if (o.shred) for (var n = 0; n < 4; n++) { var ph = Math.sin(o.shred * 18 + n * 1.7), a0 = Math.PI * (.95 + n * .12);
    var x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r; s += '<path d="M' + f(x0) + ' ' + f(y0) + ' q' + f(-30 - 10 * ph) + ' ' + f(-10 + 14 * ph) + ' ' + f(-50 - 14 * ph) + ' ' + f(8 + 10 * ph) + '" stroke="' + TYRE + '" stroke-width="' + f(r * .07) + '" fill="none" stroke-linecap="round"/>'; }
  return s;
}
function ground(y, x0, x1) { return R(x0 == null ? -400 : x0, y, (x1 == null ? 1040 : x1) - (x0 == null ? -400 : x0), 500, ASPH, 0) + '<path d="M' + (x0 == null ? -400 : x0) + ' ' + y + ' H' + (x1 == null ? 1040 : x1) + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<rect x="-400" y="' + (y + 1) + '" width="1440" height="500" fill="url(#hatch)" opacity=".3"/>'; }
function heatLines(x, y, t, n, col) { var s = ""; for (var i = 0; i < (n || 3); i++) { var xx = x + (i - (n || 3) / 2) * 22, p = (t * .8 + i * .33) % 1; s += '<path d="M' + f(xx) + ' ' + f(y - p * 40) + ' q8 -10 0 -20 q-8 -10 0 -20" stroke="' + (col || HOT) + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; } return s; }

// ── the radial tyre cut across, the way tyre makers draw it (tread on top, the beads seated on the rim flanges below):
//    tread with its grooves, nylon cap ply, two steel belts, the polyester body ply running bead to bead and wrapped
//    round the bead wires, the rubber apex, the sidewall and the inner liner; the air fills the space down to the rim.
//    205/55 R16: section 205 mm wide, 113 mm tall (1 mm ≈ 1.55 units). cx, cy = top of the tread. o: {air 0..1, squash 0..1, hl, sc}
var TREAD = "#3a3530", SIDE = "#4a443d", APEX = "#b98552";
function tyreSection(cx, cy, o) {
  o = o || {}; var sc = o.sc || 1, k = clamp(o.squash || 0), air = o.air == null ? 1 : o.air, t = window.__t, hl = o.hl || "";
  function Q(p, sd) { var y = 182 - (182 - p[1]) * (1 - .42 * k), bul = Math.sin(Math.PI * clamp(p[1] / 182)); return [cx + sd * p[0] * (1 + .16 * k * bul) * sc, cy + y * sc]; }
  function both(arr) { return arr.map(function (p) { return Q(p, 1); }).concat(arr.slice().reverse().map(function (p) { return Q(p, -1); })); }
  var OUT = [[0, 0], [100, 0], [128, 4], [146, 20], [154, 48], [158, 90], [154, 128], [144, 156], [134, 174], [128, 184]];
  var INN = [[0, 38], [96, 38], [118, 44], [130, 62], [136, 96], [134, 128], [126, 150], [116, 166], [110, 184]];
  var s = "";
  // the rim: drop centre, bead seats and the J-shaped flanges that hold the beads (does not squash)
  var RIMR = [[0, 238], [64, 238], [76, 214], [100, 200], [106, 188], [138, 188], [146, 176], [150, 162], [160, 156], [166, 162], [160, 172], [156, 194], [118, 202], [110, 214], [94, 252], [0, 252]];
  var rimP = RIMR.map(function (p) { return [cx + p[0] * sc, cy + p[1] * sc]; }).concat(RIMR.slice().reverse().map(function (p) { return [cx - p[0] * sc, cy + p[1] * sc]; }));
  // the air: from the inner liner down to the rim
  var cav = INN.map(function (p) { return Q(p, 1); }).concat([[106, 188], [76, 214], [64, 238], [-64, 238], [-76, 214], [-106, 188]].map(function (p) { return [cx + p[0] * sc, cy + p[1] * sc]; })).concat(INN.slice().reverse().map(function (p) { return Q(p, -1); }));
  if (air > 0) { var id = "cv" + (++CLIPN); s += '<clipPath id="' + id + '"><path d="' + pp(cav) + '"/></clipPath><path d="' + pp(cav) + '" fill="' + AIR + '" opacity="' + f(.35 * air + .05) + '"/>';
    var gg = ""; for (var i = 0; i < 46; i++) { if (hash(i + 2) > air) continue; gg += '<circle cx="' + f(cx + (hash(i) - .5) * 260 * sc + 5 * Math.cos(t * 2.3 + i)) + '" cy="' + f(cy + (40 + hash(i + 7) * 190) * sc + 5 * Math.sin(t * 2.9 + i)) + '" r="' + f(3.2 * sc) + '" fill="#e9f1f4"/>'; }
    s += '<g clip-path="url(#' + id + ')">' + gg + '</g>'; }
  else s += '<path d="' + pp(cav) + '" fill="#e8e1cf"/>';
  s += '<path d="' + pp(rimP) + '" fill="' + (hl === "rim" ? "#d8d2c4" : RIM) + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' + '<path d="' + pp(rimP) + '" fill="url(#hatch)" opacity=".5"/>';
  // the rubber: outer minus inner
  var R1 = function (arr, sd) { return arr.map(function (p) { return Q(p, sd); }); };
  var rub = R1(OUT, 1).concat(R1(INN.slice().reverse(), 1), R1(INN, -1), R1(OUT.slice().reverse(), -1));
  s += '<path d="' + pp(rub) + '" fill="' + SIDE + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  // the tread band on top, darker, with four grooves
  var TR = [[0, 0], [100, 0], [128, 4], [140, 14], [120, 30], [0, 30]];
  s += '<path d="' + pp(both(TR)) + '" fill="' + TREAD + '"/>';
  [-82, -30, 30, 82].forEach(function (gx) { var p0 = Q([Math.abs(gx) - 7, 0], gx < 0 ? -1 : 1), p1 = Q([Math.abs(gx) + 7, 15], gx < 0 ? -1 : 1);
    s += '<rect x="' + f(Math.min(p0[0], p1[0])) + '" y="' + f(p0[1] - 1) + '" width="' + f(Math.abs(p1[0] - p0[0])) + '" height="' + f(p1[1] - p0[1] + 1) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>'; });
  // cap ply and the two steel belts under the tread
  var line = function (y, x0, col, w, dash) { var a = Q([x0, y], -1), b = Q([x0, y], 1); return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + col + '" stroke-width="' + f(w * sc) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + ' stroke-linecap="round"/>'; };
  s += line(31, 122, "#d9d2c0", 1.6, "4 3") + line(26, 116, hl === "steel" ? ORANGE : STEEL, hl === "steel" ? 5 : 4) + line(33, 108, hl === "steel" ? ORANGE : STEEL, hl === "steel" ? 5 : 4);
  // the body ply: inside the casing from bead to bead, turned up round each bead wire
  var PLYP = INN.slice(0, 8).map(function (p, i) { var q = OUT[Math.min(i, OUT.length - 1)]; return [p[0] + (q[0] - p[0]) * .22, p[1] - (i ? 0 : 0) - 4]; });
  var plyR = PLYP.concat([[118, 176], [126, 176], [132, 166], [138, 140]]);
  var plyAll = plyR.slice().reverse().map(function (p) { return Q(p, -1); }).concat(plyR.map(function (p) { return Q(p, 1); }));
  s += '<path d="M' + plyAll.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" fill="none" stroke="' + (hl === "ply" ? ORANGE : PLY) + '" stroke-width="' + f((hl === "ply" ? 5 : 3.4) * sc) + '" stroke-linejoin="round"/>';
  // the apex filler and the bead wire bundles
  [-1, 1].forEach(function (sd) {
    s += '<path d="' + pp([Q([120, 164], sd), Q([132, 120], sd), Q([132, 164], sd)]) + '" fill="' + APEX + '" stroke="' + INK + '" stroke-width="1.2"/>';
    for (var a2 = 0; a2 < 3; a2++) for (var b2 = 0; b2 < 2; b2++) { var p = Q([118 + a2 * 6, 170 + b2 * 6], sd); s += C(p[0], p[1], 3 * sc, hl === "bead" ? ORANGE : STEEL, 1); }
  });
  // the inner liner
  var lin = R1(INN.slice().reverse(), -1).concat(R1(INN, 1));
  s += '<path d="' + pp(lin).replace(" Z", "") + '" fill="none" stroke="' + LINER + '" stroke-width="' + f(3 * sc) + '"/>';
  return s;
}
// ── the driver in profile inside the car (sheet v18: the car cut open from the side, seats and people showing).
//    Local units around the seat point (X, Y), car facing right: roof -285, floor +128, sill +150, front wheel at +430,
//    a compact sedan to the same scale as the person (H 1.75 m = 400 units → 1 m ≈ 229 units, so the 63 cm wheel r ≈ 72).
//    o: {x, y, s, foot: "gas"|"brake"|"up", press 0..1, face, hlPedal}
var CAB = "#efe6d2", SEATC = "#5d5750", SEATD = "#4a453f", DASHC = "#5f5a53", CARPET = "#7a7268";
function pp(pts) { return "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z"; }
function cockpit(o) {
  var t = window.__t, g = "", press = clamp(o.press || 0);
  // ── the car body around the cabin: one side outline, the door taken away so the cabin shows ──
  var body = "M-345 150 L-352 30 Q-352 -80 -330 -118 L-262 -150 L-205 -246 Q-180 -270 -120 -278 L110 -284 Q150 -284 175 -266 L330 -140 L500 -116 Q560 -108 568 -60 L574 40 Q574 120 540 150 L505 150 A78 78 0 0 0 355 150 L-165 150 A78 78 0 0 0 -315 150 Z";
  g += '<path d="' + body + '" fill="' + INK + '" opacity=".12" transform="translate(8 10)"/>' + P(body, BODYC, 2.8) + '<path d="' + body + '" fill="url(#hatch)" opacity=".3"/>';
  var cab = "M-262 128 L-268 -110 L-196 -232 Q-176 -254 -120 -260 L110 -266 Q140 -266 160 -254 L300 -140 L318 128 Z";
  g += P(cab, CAB, 2.2);
  // roof lining and the floor carpet, firewall and footwell
  g += P("M-196 -232 Q-176 -254 -120 -260 L110 -266 Q140 -266 160 -254 L150 -244 L-120 -246 Q-170 -242 -188 -222 Z", "#d9cfbb", 1.4);
  g += P("M118 -92 L306 -124 L318 128 L150 128 Q170 20 118 -92 Z", "#d6cab2", 0) + '<path d="M118 -92 L306 -124 L318 128 L150 128 Q170 20 118 -92 Z" fill="url(#hatch)" opacity=".6"/>';
  g += P("M-268 112 L180 112 Q230 112 262 80 L300 20 L318 128 L-262 128 Z", CARPET, 2);
  g = R(-900, 222, 2200, 400, ASPH, 0) + '<path d="M-900 222 H1300" stroke="' + INK + '" stroke-width="2.6"/>' + g;
  // the rear seat, faint behind
  g += G("", P("M-250 40 L-150 30 L-146 60 L-250 70 Z M-252 40 L-262 -150 Q-252 -164 -238 -152 L-222 36 Z", "#8c857a", 1.6), .6);
  // windscreen (glass edge-on) and the A-pillar, the window line of the cut door
  g += P("M160 -258 L318 -132 L306 -124 L150 -246 Z", GLASS, 1.8) + '<path d="M182 -232 L270 -160" stroke="#f4f8f8" stroke-width="3" stroke-linecap="round"/>';
  g += '<path d="M-262 -108 L300 -128" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="7 5" opacity=".5"/>';
  // the front seat: rails, cushion, reclined backrest with its side bolster, headrest on two posts
  g += P("M-70 120 L70 120 L66 112 L-66 112 Z", "#3e3a34", 1.6) + P("M-40 44 L-34 112 M40 34 L44 112", "none", 6);
  g += P("M-96 40 Q-98 10 -70 6 L52 -6 Q78 -8 80 12 L78 26 Q74 40 48 42 L-60 52 Q-92 54 -96 40 Z", SEATC, 2.2) + '<path d="M-60 6 L40 -4" stroke="' + SEATD + '" stroke-width="2"/>';
  g += P("M-96 40 L-60 10 L-82 -190 Q-90 -206 -110 -204 Q-132 -200 -128 -176 L-112 30 Z", SEATC, 2.2) + '<path d="M-74 0 L-96 -180" stroke="' + SEATD + '" stroke-width="2.2"/>';
  g += P("M-108 -206 L-104 -224 M-94 -206 L-90 -226", "none", 4) + '<rect x="-132" y="-276" width="56" height="54" rx="16" transform="rotate(-10 -104 -249)" fill="' + SEATC + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // the person: seated, leaning back with the seat, both hands forward on the wheel, the right foot on the chosen pedal
  var leg0 = o.foot === "brake" ? { hip: 74, knee: 48 - 6 * press, ankle: -4 + 8 * press } : o.foot === "up" ? { hip: 72, knee: 40, ankle: -14 } : { hip: 76, knee: 44 - 6 * press, ankle: -6 + 14 * press };
  var P1 = PERSON.side({ x: -6, y: -14, s: 1, dir: 1, lean: -12, outfit: "casual", breath: (Math.sin(t * 1.8) + 1) / 2,
    legs: [leg0, { hip: 80, knee: 56, ankle: 4 }], arms: [{ sh: 72, el: 24, wrist: -10 }, { sh: 68, el: 26, wrist: -10 }],
    face: o.face || { eyes: 1, brows: "neutral", mouth: "neutral" }, head: { tilt: 0 } });
  var J1 = P1.joints, ball = [lerp(J1.heel[0], J1.toe[0], .72), lerp(J1.heel[1], J1.toe[1], .72)];
  // pedals hang from the pedal box under the dash; the pressed one sits under the ball of the foot
  var bAt = o.foot === "gas" ? [ball[0] - 16, ball[1] - 36] : ball, gAt = o.foot === "gas" ? ball : [ball[0] + 22, ball[1] + 30];
  var pedal = function (at, kind) { var hl = o.hlPedal === kind, col = hl ? (kind === "brake" ? ORANGE : OLIVE) : "#3e3a34";
    return kind === "brake" ? P("M" + f(at[0] + 34) + " " + f(at[1] - 62) + " Q" + f(at[0] + 14) + " " + f(at[1] - 36) + " " + f(at[0] + 8) + " " + f(at[1] - 4), "none", 6) + R(at[0] + 24, at[1] - 74, 30, 16, "#3e3a34", 1.6, 3) + G("rotate(-26 " + f(at[0]) + " " + f(at[1]) + ")", R(at[0] - 7, at[1] - 17, 14, 34, col, 2, 4))
      : P("M" + f(at[0] + 30) + " " + f(at[1] - 66) + " L" + f(at[0] + 10) + " " + f(at[1] - 30), "none", 4) + G("rotate(-34 " + f(at[0]) + " " + f(at[1]) + ")", R(at[0] - 6, at[1] - 30, 12, 50, col, 2, 4)); };
  g += pedal(bAt, "brake") + pedal(gAt, "gas");
  g += P1.svg;
  // seat belt: from the pillar above the shoulder, across the chest to the buckle at the hip
  var hd = J1.head; g += '<path d="M-150 -214 L' + f(hd[0] - 4) + ' ' + f(hd[1] + 60) + ' L' + f(hd[0] + 22) + ' ' + f(hd[1] + 120) + ' L28 -4" stroke="#3a352e" stroke-width="7" fill="none" stroke-linejoin="round"/>' + R(22, -10, 16, 12, "#9aa2ac", 1.4, 2);
  // the dashboard: a moulded top from the windscreen back over the driver's knees, the instrument hood, the column and the wheel
  var wc = [J1.wrist[0] + 12, J1.wrist[1] - 8];
  g += P("M306 -124 L148 -112 Q120 -110 118 -92 L124 -70 Q150 -62 182 -58 L240 -30 Q290 -10 306 20 L318 20 Z", DASHC, 2.2);
  g += P("M150 -112 Q160 -142 200 -140 L214 -116 Z", "#4a453f", 1.8) + '<circle cx="186" cy="-100" r="9" fill="#e9e1cf" stroke="' + INK + '" stroke-width="1.4"/>';
  g += P("M" + f(wc[0]) + " " + f(wc[1]) + " L214 -74", "none", 12) + '<path d="M' + f(wc[0]) + ' ' + f(wc[1]) + ' L214 -74" stroke="#4a453f" stroke-width="7"/>';
  g += '<ellipse cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" rx="13" ry="58" transform="rotate(-20 ' + f(wc[0]) + ' ' + f(wc[1]) + ')" fill="none" stroke="' + INK + '" stroke-width="13"/>' +
       '<ellipse cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" rx="13" ry="58" transform="rotate(-20 ' + f(wc[0]) + ' ' + f(wc[1]) + ')" fill="none" stroke="#3e3a34" stroke-width="8"/>' +
       '<ellipse cx="' + f(wc[0] + 6) + '" cy="' + f(wc[1]) + '" rx="10" ry="22" transform="rotate(-20 ' + f(wc[0]) + ' ' + f(wc[1]) + ')" fill="#3e3a34" stroke="' + INK + '" stroke-width="2"/>';
  // the hands again over the rim, so they hold it
  // front wheel in its arch, rear wheel
  g += wheelSide(430, 150, 72, { spin: (o.spin || 0) }) + wheelSide(-240, 150, 72, { spin: (o.spin || 0) });
  return { svg: G("translate(" + f(o.x) + " " + f(o.y) + ") scale(" + (o.s || 1) + ")", g), floorY: o.y + 128 * (o.s || 1) };
}

// ── the driver from the front, both hands on the wheel (person kit, front view), seat and the wheel rim before him
function driverFront(cx, cy, s, t, o) {
  o = o || {}; var rot = o.wheelRot || 0, wc = [cx, cy - 12 * s], wr = 68 * s;
  var a1 = (200 + rot) * Math.PI / 180, a2 = (-20 + rot) * Math.PI / 180;   // hands at about 9 and 3 o'clock
  var hL = [wc[0] + Math.cos(a1) * wr, wc[1] + Math.sin(a1) * wr], hR = [wc[0] + Math.cos(a2) * wr, wc[1] + Math.sin(a2) * wr];
  var str = R(cx - 150 * s, cy - 340 * s, 300 * s, 360 * s, "#6e675c", 2.4, 26) + R(cx - 70 * s, cy - 420 * s, 140 * s, 80 * s, "#6e675c", 2.4, 18);
  var Pf = PERSON.front({ x: cx, y: cy + 40 * s, s: s, legs: "sit", outfit: "casual", breath: (Math.sin(t * 2.2) + 1) / 2,
    head: { tilt: o.tilt || 0 }, face: o.face || { eyes: 1.1, brows: "angry", mouth: "neutral", look: [0, 0] },
    arms: [{ to: hL, bend: 1, hand: "fist", rot: 90 }, { to: hR, bend: -1, hand: "fist", rot: 90 }] });
  var wheel = '<circle cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" r="' + f(wr) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(17 * s) + '"/><circle cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" r="' + f(wr) + '" fill="none" stroke="#3e3a34" stroke-width="' + f(12 * s) + '"/>';
  var spokes = G("rotate(" + f(rot) + " " + f(wc[0]) + " " + f(wc[1]) + ")", P("M" + f(wc[0] - wr) + " " + f(wc[1] + 4 * s) + " Q" + f(wc[0]) + " " + f(wc[1] + 30 * s) + " " + f(wc[0] + wr) + " " + f(wc[1] + 4 * s), "none", 12 * s) + P("M" + f(wc[0]) + " " + f(wc[1] + 20 * s) + " L" + f(wc[0]) + " " + f(wc[1] + wr), "none", 12 * s) + '<ellipse cx="' + f(wc[0]) + '" cy="' + f(wc[1] + 10 * s) + '" rx="' + f(30 * s) + '" ry="' + f(24 * s) + '" fill="#3e3a34" stroke="' + INK + '" stroke-width="2"/>');
  // the hands go over the rim: draw wheel, then the person's arms on top — so wheel first, person after, then re-draw a rim segment under the fingers is skipped (fists wrap it)
  // person first, then the wheel over the body, then the fists again on top so they wrap the rim
  var fists = ""; [0, 1].forEach(function (i) { var w = Pf.joints.wr[i], e = Pf.joints.el[i]; fists += PERSON.hand(w, Math.atan2(w[1] - e[1], w[0] - e[0]), "fist", i ? -1 : 1, s); });
  return str + Pf.svg + wheel + spokes + fists;
}

// ── speedometer: 0–200 km/h, the needle at v
function speedo(cx, cy, r, v, hl) {
  var s = C(cx, cy, r + 8, "#3e3a34", 2.4) + C(cx, cy, r, "#f4ecdb", 2);
  for (var k = 0; k <= 20; k++) { var a = (-225 + k * 13.5) * Math.PI / 180, l = k % 2 ? .1 : .18; s += '<path d="M' + f(cx + Math.cos(a) * r * .92) + ' ' + f(cy + Math.sin(a) * r * .92) + ' L' + f(cx + Math.cos(a) * r * (.92 - l)) + ' ' + f(cy + Math.sin(a) * r * (.92 - l)) + '" stroke="' + INK + '" stroke-width="' + (k % 2 ? 1.6 : 3) + '"/>';
    if (k % 4 === 0) s += N(String(k * 10), cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6 + r * .07, r * .17, INK); }
  if (hl != null) { var a0 = (-225 + hl * 1.35) * Math.PI / 180; s += '<path d="M' + f(cx + Math.cos(a0) * r * .95) + ' ' + f(cy + Math.sin(a0) * r * .95) + ' A' + f(r * .95) + ' ' + f(r * .95) + ' 0 0 0 ' + f(cx + Math.cos(-225 * Math.PI / 180) * r * .95) + ' ' + f(cy + Math.sin(-225 * Math.PI / 180) * r * .95) + '" stroke="' + OLIVE + '" stroke-width="6" fill="none" opacity=".7"/>'; }
  var a = (-225 + v * 1.35) * Math.PI / 180;
  s += '<path d="M' + f(cx - Math.cos(a) * r * .12) + ' ' + f(cy - Math.sin(a) * r * .12) + ' L' + f(cx + Math.cos(a) * r * .8) + ' ' + f(cy + Math.sin(a) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="' + f(r * .06) + '" stroke-linecap="round"/>' + C(cx, cy, r * .08, INK, 0);
  return s + T("كم/س", cx, cy + r * .5, r * .14, MUTE, 700);
}
// the hazard-light button: a red triangle on a dark key, blinking when on
function hazard(x, y, sc, on) { var lit = on && Math.floor(window.__t * 2.6) % 2 === 0;
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", R(-40, -32, 80, 64, "#3e3a34", 2.4, 10) + P("M0 -20 L20 14 L-20 14 Z", "none", 0, ' stroke="' + (lit ? "#ff5a3a" : "#c24a33") + '" stroke-width="6"') + P("M0 -8 L9 7 L-9 7 Z", "none", 0, ' stroke="' + (lit ? "#ff5a3a" : "#c24a33") + '" stroke-width="3"') + (lit ? '<rect x="-46" y="-38" width="92" height="76" rx="14" fill="none" stroke="#f0a028" stroke-width="4" opacity=".7"/>' : "")); }
// a supermarket trolley from above at an angle: basket grid, handle, four castor wheels (one stuck, orange)
function trolley(x, y, ang, sc, t) {
  var s = P("M-46 -70 L46 -70 L40 60 L-40 60 Z", "#d9d5cb", 2.4);
  for (var i = -36; i <= 36; i += 12) s += '<path d="M' + i + ' -66 L' + f(i * .87) + ' 56" stroke="' + MUTE + '" stroke-width="1.4"/>';
  for (var j = -56; j <= 50; j += 14) s += '<path d="M' + f(-45 + (j + 70) * .045) + ' ' + j + ' H' + f(45 - (j + 70) * .045) + '" stroke="' + MUTE + '" stroke-width="1.4"/>';
  s += R(-52, 66, 104, 10, ORANGE, 2, 5) + P("M-40 60 L-50 70 M40 60 L50 70", "none", 2.4);
  [[-42, -62, 0], [42, -62, 0], [-36, 52, 1], [36, 52, 0]].forEach(function (w) { s += G("translate(" + w[0] + " " + w[1] + ") rotate(" + (w[2] ? 30 : 8 * Math.sin(t * 6)) + ")", R(-5, -9, 10, 18, w[2] ? ORANGE : TYRE, 1.6, 3)); });
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + sc + ")", s);
}
// the car in profile (front to the right), body pitched by `pitch` (deg, + = nose down) about the middle; wheels stay on the ground.
var SIDE_P = "M540 -42 L540 -80 Q536 -97 510 -101 L390 -114 L314 -170 Q300 -175 278 -175 L162 -173 L88 -124 L20 -119 Q0 -117 0 -96 L0 -44 L70 -42 A46 46 0 0 1 162 -42 L394 -42 A46 46 0 0 1 486 -42 Z";
function sideCar(x, y, o) {
  o = o || {}; var p = o.pitch || 0, g = "";
  g += P(SIDE_P, BODYC, 2.6) + '<path d="' + SIDE_P + '" fill="url(#hatch)" opacity=".3"/>' +
       P("M376 -120 L308 -162 L244 -162 L244 -120 Z", GLASS, 2.2) + P("M234 -120 L234 -162 L168 -162 L104 -124 L104 -120 Z", GLASS, 2.2) + R(234, -164, 10, 120, BODYC, 2) +
       '<path d="M384 -118 L388 -48 M244 -118 L244 -46 M96 -122 L100 -60" stroke="' + INK + '" stroke-width="1.8"/>' + R(266, -100, 22, 6, INK, 0, 3) + R(122, -100, 22, 6, INK, 0, 3) +
       P("M536 -86 L516 -94 L514 -84 L534 -80 Z", "#f4efe3", 1.4) + R(0, -110, 12, 16, ORANGE, 1.4, 0, o.brake ? ' opacity="1"' : ' opacity=".6"');
  var body = G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(p) + " 270 -90) translate(-270 0)", g);
  var w = wheelSide(x + 440 - 270, y - 38, 38, { spin: o.spin || 0, flat: o.flatF || 0 }) + wheelSide(x + 116 - 270, y - 38, 38, { spin: o.spin || 0, flat: o.flatR || 0 });
  return body + w;
}
// the sidewall text: a curved band of the tyre with «DOT … 2321» and the date boxed
function sidewall(cx, cy, r, k, t) {
  var s = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + TYRE + '" stroke="' + INK + '" stroke-width="3"/>' + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .7) + '" fill="' + TYRE2 + '" stroke="' + INK + '" stroke-width="2"/>' + C(cx, cy, r * .52, RIM, 2.4);
  for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2; s += '<path d="M' + f(cx + Math.cos(a) * r * .97) + ' ' + f(cy + Math.sin(a) * r * .97) + ' L' + f(cx + Math.cos(a) * r * .9) + ' ' + f(cy + Math.sin(a) * r * .9) + '" stroke="' + TYRE2 + '" stroke-width="6"/>'; }
  var id = "sw" + (++CLIPN);
  s += '<path id="' + id + '" d="M' + f(cx - r * .82) + ' ' + f(cy) + ' A' + f(r * .82) + ' ' + f(r * .82) + ' 0 0 1 ' + f(cx + r * .82) + ' ' + f(cy) + '" fill="none"/>';
  s += '<text style="font:800 ' + f(r * .085) + 'px Noto Serif;fill:#cfc9bc;letter-spacing:1px;direction:ltr"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">205/55 R16 91V   DOT  U2LL  LMLR  2321</textPath></text>';
  return s;
}

// ── shots (line numbers from script.txt). World 640 × 786.
// ── the side-view road: asphalt, a dashed lane line and roadside posts running past at speed v (px/s)
function roadSide(y, t, v) {
  var s = R(-2000, y, 5000, 600, ASPH, 0) + '<path d="M-2000 ' + y + ' H3000" stroke="' + INK + '" stroke-width="2.6"/>', off = (t * v) % 160;
  for (var x = -2000 - off; x < 3000; x += 160) s += R(x, y + 40, 80, 8, "#f4efe3", 0);
  var off2 = (t * v * .5) % 300; for (var x2 = -2000 - off2; x2 < 3000; x2 += 300) s += R(x2, y - 90, 8, 90, "#d9d2c0", 1.6) + R(x2 - 2, y - 96, 12, 14, ORANGE, 1.2);
  return s;
}
// ── one wheel from the side with a window cut into the sidewall, the way a cut-away tyre is shown at a tyre shop:
//    looking into the tyre from the side you meet, from the outside in, the tread with its grooves, the nylon cap ply,
//    two steel belts, the body ply (fabric cords), the inner liner, then the air down to the rim. o: {open 0..1, air 0..1,
//    flat 0..1, spin, hl: "steel"|"ply"|"air"|"rim"}
function wheelCut(cx, cy, r, o) {
  o = o || {}; var s = wheelSide(cx, cy, r, { flat: o.flat || 0, spin: o.spin || 0 }), op = clamp(o.open || 0), air = o.air == null ? 1 : o.air, t = window.__t, hl = o.hl || "";
  if (op <= 0) return s;
  var a0 = -150 * Math.PI / 180, a1 = a0 + op * 150 * Math.PI / 180, id = "wc" + (++CLIPN);
  function pt(a, rr) { return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; }
  var wedge = "M" + f(pt(a0, r * .6)[0]) + " " + f(pt(a0, r * .6)[1]) + " L" + f(pt(a0, r * 1.02)[0]) + " " + f(pt(a0, r * 1.02)[1]) + " A" + f(r * 1.02) + " " + f(r * 1.02) + " 0 0 1 " + f(pt(a1, r * 1.02)[0]) + " " + f(pt(a1, r * 1.02)[1]) + " L" + f(pt(a1, r * .6)[0]) + " " + f(pt(a1, r * .6)[1]) + " A" + f(r * .6) + " " + f(r * .6) + " 0 0 0 " + f(pt(a0, r * .6)[0]) + " " + f(pt(a0, r * .6)[1]) + " Z";
  var g = "";
  // the air space, from the liner down to the rim
  g += C(cx, cy, r * .79, air > 0 ? "#cfdfe6" : "#e8e1cf", 0);
  if (air > 0) for (var i = 0; i < 60; i++) { if (hash(i + 3) > air) continue; var aa = a0 + hash(i) * 2.2 + .05 * Math.sin(t * 2 + i), rr = r * (.66 + hash(i + 9) * .12); var p = pt(aa, rr + 3 * Math.sin(t * 3 + i)); g += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r * .016) + '" fill="' + AIR + '"/>'; }
  if (hl === "air") g += C(cx, cy, r * .79, "none", 0) + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .72) + '" fill="none" stroke="' + BLUE + '" stroke-width="' + f(r * .12) + '" opacity=".35"/>';
  // the casing rings, outside in
  g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .9) + '" fill="none" stroke="' + TREAD + '" stroke-width="' + f(r * .2) + '"/>';   // tread rubber
  for (var j = 0; j < 40; j++) { var b = j / 40 * Math.PI * 2 + (o.spin || 0) * Math.PI / 180, p1 = pt(b, r), p2 = pt(b, r * .93); g += '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]) + '" stroke="' + PAPER + '" stroke-width="' + f(r * .03) + '"/>'; }   // grooves
  g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .9) + '" fill="none" stroke="#d9d2c0" stroke-width="' + f(r * .008) + '" stroke-dasharray="4 3"/>';   // cap ply
  [.878, .852].forEach(function (k) { g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * k) + '" fill="none" stroke="' + (hl === "steel" ? ORANGE : STEEL) + '" stroke-width="' + f(r * (hl === "steel" ? .024 : .02)) + '"/>'; });   // steel belts
  g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .825) + '" fill="none" stroke="' + (hl === "ply" ? ORANGE : PLY) + '" stroke-width="' + f(r * (hl === "ply" ? .026 : .02)) + '" stroke-dasharray="' + f(r * .03) + ' ' + f(r * .01) + '"/>';   // body ply
  g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .8) + '" fill="none" stroke="' + LINER + '" stroke-width="' + f(r * .012) + '"/>';   // inner liner
  // the rim through the window
  g += C(cx, cy, r * .64, hl === "rim" ? "#d8d2c4" : RIM, 2.4);
  s += '<clipPath id="' + id + '"><path d="' + wedge + '"/></clipPath><g clip-path="url(#' + id + ')">' + g + '</g>';
  // the cut faces: ink edges with hatching, like a section drawing
  s += '<path d="' + wedge + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  [a0, a1].forEach(function (a) { var p1 = pt(a, r * .8), p2 = pt(a, r * 1.01); s += '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]) + '" stroke="' + ORANGE + '" stroke-width="' + f(r * .025) + '"/>'; });
  return s;
}
// 4 · «طب إيه اللي حصل للكاوتش؟»: the car from the side, driving; the camera closes in on the front wheel
var FW = [420, 482];   // the front wheel of sideCar(250, 520)
shot(4, function (u, d) { var k = ease(clamp((u - .3) / (d - .3))); return [lerp(300, FW[0], k), lerp(440, FW[1], k), lerp(1.0, 5.2, k * k)]; }, function (u, d, t) {
  var sp = 1 - .6 * clamp(u / d);
  return paper() + roadSide(520, t, 520 * sp) + sideCar(250, 520, { spin: t * 900 * sp, flatF: .35 + .05 * Math.sin(t * 20) }) + G("", T("؟", FW[0] + 30, FW[1] - 60, 34, ORANGE, 800), at(u, d - .8, .3));
});
// 5 · close on the wheel, a window opens in the sidewall: steel and fabric cords holding compressed air; the air carries the car
shot(5, push(320, 390, 1.2, 1.28), function (u, d, t) {
  var c = window.CHUNKS[5], D = LN[5].end - LN[5].start, c1 = D * (c[1] || .4), c2 = D * (c[2] || .7);
  var hl = u < c1 ? (u < c1 * .5 ? "steel" : "ply") : u < c2 ? "air" : "";
  var s = paper() + roadSide(630, t, 40) + P("M60 260 Q320 150 580 260 L640 250 L640 120 L0 120 L0 250 Z", BODYC, 2.6) + '<path d="M60 260 Q320 150 580 260" fill="none" stroke="' + INK + '" stroke-width="3"/>';   // the wheel arch of the car
  s += wheelCut(320, 430, 200, { open: at(u, .1, .9), hl: hl, spin: t * 8 });
  var W = function (deg, k) { var a = deg * Math.PI / 180; return [320 + Math.cos(a) * 200 * k, 430 + Math.sin(a) * 200 * k]; }, p1 = W(-115, .865), p2 = W(-150, .825), p3 = W(-60, .72), p4 = W(25, .45);
  s += label(p1[0], p1[1], 200, 190, "سلك صلب", OLIVE, at(u, .6, .5), 24) + label(p2[0], p2[1], 160, 300, "قماش", OLIVE, at(u, c1 * .5, .5), 24);
  s += label(p3[0], p3[1], 420, 190, "هوا مضغوط", BLUE, at(u, c1, .5), 24) + label(p4[0], p4[1], 480, 590, "الجنط", INK, at(u, c1 + .6, .5), 24);
  if (u > c2) { s += arrow(320, 60, 320, 200, ORANGE, 9, at(u, c2, .4)) + tag("وزن العربية", 320, 160, at(u, c2, .3), 22, ORANGE);
    for (var i = 0; i < 3; i++) { var a = (-140 + i * 30) * Math.PI / 180; s += arrow(320 + Math.cos(a) * 120, 430 + Math.sin(a) * 120, 320 + Math.cos(a) * (165 + 4 * Math.sin(t * 5 + i)), 430 + Math.sin(a) * (165 + 4 * Math.sin(t * 5 + i)), BLUE, 6, at(u, c2 + .3, .4)); } }
  return s;
});
// 6a · the air rushes out through the window; the tyre sinks onto the rim and flattens on the road
shot(6, push(320, 400, 1.2, 1.24), function (u, d, t) {
  var k = at(u, .2, 1.6), s = paper() + roadSide(630 - 0 * k, t, 30 * (1 - k)) + G("translate(0 " + f(40 * k) + ")", P("M60 260 Q320 150 580 260 L640 250 L640 120 L0 120 L0 250 Z", BODYC, 2.6) + '<path d="M60 260 Q320 150 580 260" fill="none" stroke="' + INK + '" stroke-width="3"/>');
  s += G("translate(0 " + f(40 * k) + ")", wheelCut(320, 430, 200, { open: 1, air: 1 - k, flat: k, spin: 0 }));
  for (var i = 0; i < 6; i++) { var p = ((t * 1.6 + i / 6) % 1); s += G("", '<path d="M' + f(160 - p * 140) + ' ' + f(300 + i * 14) + ' q-14 -8 -28 0" stroke="' + AIR + '" stroke-width="5" fill="none" stroke-linecap="round"/>', (1 - p) * (1 - k * .5)); }
  return s + tag("الهوا بيطلع", 320, 190, at(u, .3, .3), 30, BLUE);
});
// 6b · flattened on the ground: like a brake working on one corner only
shot([6, 1], push(310, 470, 1.2, 1.3), function (u, d, t) {
  var k = at(u, 0, .8);
  return paper() + ground(560) + wheelSide(310, 410, 150, { flat: k, spin: t * 260 * (1 - k * .7) }) + measure(160, 610, 460, 610, at(u, .9, .7), "", 0) + G("", T("بيتفرطح على الأرض", 310, 680, 24, ORANGE, 800), at(u, 1.1, .3));
});
shot([6, 2], push(290, 400, 1.45, 1.55), function (u, d, t) {
  var s = paper() + road(t, 260) + topCar(276, 420, 0, { blown: "FL", hl: ["FL"] });
  s += arrow(228, 300, 228, 380 + 40, ORANGE, 0, 0);
  for (var i = 0; i < 3; i++) s += arrow(228, 360 - i * 14, 228, 420 + 8 * Math.sin(t * 6 + i) - i * 14, ORANGE, 5, at(u, .3, .4));
  return s + tag("فرملة", 170, 260, at(u, .5, .3), 26, ORANGE) + iconBox(420, 230, 90, '<circle r="30" fill="#3e3a34" stroke="' + INK + '" stroke-width="2"/><path d="M-36 34 L36 34" stroke="' + INK + '" stroke-width="3"/>' + R(-10, -6, 20, 30, ORANGE, 2, 2), at(u, .8, .3));
});
// 7 · that is why the car pulls toward the blown side
shot(7, push(290, 420, 1.35, 1.3), function (u, d, t) {
  var k = at(u, .2, d - .3), ang = -16 * k, x = 300 - 70 * k * k, y = 470 - 60 * k;
  return paper() + road(t, 260) + track([[300, 760], [300, 620], [300 - 10 * k, 560], [300 - 40 * k, 500], [x, y + 40]], ORANGE, k) + topCar(x, y, ang, { blown: "FL", flap: t }) +
    arrow(300 - 30, 250, 300 - 120, 250, ORANGE, 6, at(u, .4, .4)) + G("", T("بتشد", 200, 220, 30, ORANGE, 800), at(u, .5, .3));
}, { tr: "out" });
// 8 · like a supermarket trolley with a stuck wheel
shot(8, push(300, 440, 1.3, 1.4), function (u, d, t) {
  var k = at(u, .5, d - .6), x = 340 - 90 * k * k, y = 580 - 200 * k, s = paper();
  for (var i = 0; i < 8; i++) s += '<path d="M-200 ' + (180 + i * 90) + ' H900" stroke="#d6ccb4" stroke-width="2"/>';
  s += track([[360, 700], [360, 620], [350, 500], [330, 420], [x, y]], ORANGE, k) + trolley(x, y, -38 * k, 1.5, t);
  s += label(x - 36 * 1.5, y + 52 * 1.5, x - 24, y + 150, "عجلة عالقة", ORANGE, at(u, .4, .5), 24);
  return s + iconBox(470, 210, 110, G("scale(.38)", topCar(0, 0, -14, { blown: "FL" })), at(u, .2, .3));
});
// 9 · «طب ليه الفرامل غلط؟»: the driver's foot over the brake
shot(9, push(440, 470, 1.5, 1.6), function (u, d, t) {
  var ck = cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: 0, hlPedal: "brake", face: { eyes: 1.2, brows: "worried", mouth: "o" } });
  return paper() + ck.svg + G("", T("؟", 560, 400, 90, ORANGE, 800), at(u, .3, .3));
}, { tr: "in" });
// 10 · brake hard and the weight is thrown forward: the nose dives
shot(10, push(320, 400, 1.2, 1.26), function (u, d, t) {
  var k = at(u, .6, .8), s = paper() + ground(470) + sideCar(320, 470, { pitch: 4 * k, brake: k, spin: t * 300 * (1 - k) });
  var cg = [lerp(300, 380, k), 400 + 8 * k];
  s += C(cg[0], cg[1], 12, ORANGE, 2.4) + arrow(cg[0], cg[1], cg[0] + 10, cg[1] + 90, ORANGE, 5, at(u, .3, .3)) + arrow(250, 300, 450, 300, ORANGE, 7, at(u, .9, .5));
  return s + G("", T("الوزن لقدام", 350, 270, 28, ORANGE, 800), at(u, 1, .3)) + label(470, 450, 540, 560, "قدام", OLIVE, at(u, 1.3, .4), 22);
});
// 11 · front tyre blown: the pull grows, the wheel is torn from your hands
shot(11, push(300, 380, 1.3, 1.36), function (u, d, t) {
  var k = at(u, .4, d - .4), s = paper() + road(t, 200 * (1 - k * .5));
  s += topCar(320 - 40 * k * k, 470 - 30 * k, -28 * k, { blown: "FL", brake: 1, steer: -20 * k, hl: ["FL", "FR"] });
  for (var i = 0; i < 2; i++) s += arrow(270 + i * 100, 300, 270 + i * 100, 340, ORANGE, 6, 1);
  s += arrow(250, 230, 120, 230, ORANGE, 9, at(u, .6, .4)) + G("", T("الشدة بتزيد", 180, 196, 26, ORANGE, 800), at(u, .7, .3));
  var rot = -70 * at(u, 1.6, 1.2) + 6 * Math.sin(t * 20) * at(u, 1.6, .5);
  return s + inset(470, 200, 80, G("scale(.55) translate(0 40)", '<circle r="120" fill="none" stroke="#3e3a34" stroke-width="18"/>' + G("rotate(" + f(rot) + ")", P("M-120 4 Q0 40 120 4 M0 24 L0 120", "none", 16) + '<ellipse cy="10" rx="36" ry="28" fill="#3e3a34"/>')), at(u, 1.3, .3));
});
// 12 · rear tyre blown: the back goes light and the car can spin round
shot(12, push(320, 410, 1.3, 1.3), function (u, d, t) {
  var k = at(u, 1, d - 1.2), s = paper() + road(t, 220 * (1 - k * .6));
  s += topCar(320 + 30 * k, 430, 140 * k * k, { blown: "RL", brake: 1, light: ["RL", "RR"] });
  s += label(372, 520, 520, 650, "الورا خفيف", BLUE, at(u, .3, .5) * (1 - k), 24);
  s += draw("M470 300 A170 170 0 0 1 470 620", at(u, 1.2, .8), ORANGE, 6) + (k > .3 ? arrow(470, 600, 450, 630, ORANGE, 6, 1) : "");
  return s + cross(200, 260, 1.2, at(u, d - 1, .4));
});
// 13 · «طب أعمل إيه؟ أربع حاجات بالترتيب»
function steps4(x, y, on, cur, sc) {
  var names = ["امسك", "دوغري", "البنزين", "فرامل"], s = "";
  names.forEach(function (n, i) { var cx = x + (1.5 - i) * 140 * (sc || 1), lit = i < on, c = i === cur;
    s += G("translate(" + f(cx) + " " + y + ") scale(" + (sc || 1) * (c ? 1.1 : 1) + ")", '<rect x="-62" y="-46" width="124" height="92" rx="10" fill="' + (c ? ORANGE : lit ? "#f4ecdb" : PAPER) + '" stroke="' + INK + '" stroke-width="2.2"/>' + N(String(i + 1), 0, -6, 34, c ? "#fff" : INK) + T(n, 0, 32, 22, c ? "#fff" : INK, 800)); });
  return s;
}
shot(13, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[13], D = LN[13].end - LN[13].start, on = 0;
  for (var i = 0; i < 4; i++) if (u > D * (c[1] || .4) + i * .35) on = i + 1;
  return paper() + road(t, 260) + topCar(320, 520, 0, { blown: "FL" }) + G("", R(-10, 120, 660, 150, PAPER, 0), on ? 1 : 0) + steps4(320, 200, on, on - 1, 1);
});
hud(14, 18, function (u, t) { var li = 14; for (var i = 14; i < 18; i++) if (startOf(i) <= t) li = i; return G("translate(0 0)", R(0, 0, 640, 112, PAPER, 0) + steps4(320, 58, li - 13, li - 14, .7)); });
// 14 · both hands on the wheel, firmly
shot(14, push(320, 560, 1.55, 1.7), function (u, d, t) {
  var g = at(u, .3, .5);
  return paper() + R(-200, 620, 1040, 400, "#7c7468", 2.4) + driverFront(320, 640, 1.0, t, { wheelRot: 3 * Math.sin(t * 7) * (1 - g * .7), face: { eyes: 1.15, brows: "angry", mouth: "neutral" } }) +
    tag("الإيدين الاتنين", 320, 740, at(u, .6, .3), 24, ORANGE) + tag("جامد", 320, 360, at(u, 1.2, .3), 26, ORANGE);
}, { tr: "in" });
// 15 · keep straight, no sharp turns of the wheel
shot(15, push(320, 470, 1.3, 1.36), function (u, d, t) {
  var wob = 4 * Math.sin(t * 2.2), s = paper() + road(t, 240);
  s += track([[276, 780], [276, 680], [278, 600], [280, 540], [276, 520]], OLIVE, at(u, .2, .8)) + topCar(276 + wob * .6, 470, -wob * .5, { blown: "FL", steer: 2 * Math.sin(t * 2.2) });
  s += draw("M430 760 Q560 650 420 560 Q300 470 470 380", at(u, 1.2, .6), ORANGE, 4) + cross(470, 560, .9, at(u, 1.8, .3));
  return s + check(160, 300, 1.4, at(u, .9, .4), OLIVE) + G("", T("دوغري", 160, 380, 28, OLIVE, 800), at(u, .9, .3));
});
// 16 · foot off the gas, slowly; the car slows by itself
shot(16, push(400, 430, 1.2, 1.3), function (u, d, t) {
  var k = at(u, .4, d - .6), v = lerp(120, 70, k);
  var ck = cockpit({ x: 220, y: 420, s: 1, foot: "gas", press: 1 - k, hlPedal: "gas", face: { eyes: 1, brows: "worried", mouth: "neutral" } });
  return paper() + ck.svg + inset(520, 280, 70, speedo(0, 0, 62, v), 1) + tag("بالراحة", 400, 700, at(u, .8, .3), 26, ORANGE);
});
// 17 · at about 50: only then brake gently, hazard lights on, out to the shoulder
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var v = lerp(70, 50, at(u, 0, 1));
  return paper() + speedo(320, 360, 170, v, 50) + G("", numBox("50", 320, 640, 1, 60), at(u, .8, .3));
});
shot([17, 1], push(440, 470, 1.6, 1.7), function (u, d, t) {
  var p = .3 + .1 * Math.sin(t * 3);
  return paper() + cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: p, hlPedal: "brake", face: { eyes: 1, brows: "neutral", mouth: "neutral" } }).svg + tag("خفيف", 330, 600, at(u, .3, .3), 30, ORANGE);
}, { tr: "in" });
shot([17, 2], push(400, 420, 1.15, 1.2), function (u, d, t) {
  var k = at(u, 1.0, d - 1.0), x = lerp(276, 565, k), ang = 22 * Math.sin(k * Math.PI);
  return paper() + road(t, 160 * (1 - k * .8), { label: at(u, .6, .4) }) + track([[276, 780], [276, 640], [300, 560], [420, 520], [x, 470]], OLIVE, k) + topCar(x, 470 - 40 * k, ang, { blown: "FL", haz: 1, brake: .5 }) + inset(300, 260, 66, hazard(0, 0, 1.1, u > .3), at(u, .1, .3)) + tag("الفلاشر", 300, 370, at(u, .4, .3), 24, ORANGE);
});
// 18 · the myth: let air out in summer so the heat won't burst it — no
shot(18, push(330, 400, 1.2, 1.3), function (u, d, t) {
  var press = Math.abs(Math.sin(t * 2.2)) > .35;
  var s = paper() + sun(560, 90, 54, t) + ground(640) + wheelSide(300, 470, 170, { spin: 0 });
  var vx = 300 + 128, vy = 470 - 60;   // the valve stem on the rim
  s += R(vx - 6, vy - 26, 12, 30, INK, 1.6, 3);
  for (var i = 0; i < 3; i++) { var p = (t * 1.4 + i / 3) % 1; s += G("", '<path d="M' + f(vx + 14 + p * 50) + ' ' + f(vy - 30 - p * 30) + ' q10 -6 20 0" stroke="' + AIR + '" stroke-width="4" fill="none" stroke-linecap="round"/>', 1 - p); }
  s += G("translate(" + f(vx + 4) + " " + f(vy - 40 + (press ? 4 : 0)) + ") rotate(200) scale(1.6)", PERSON.hand([0, 0], 0, "point", 1, 1) );
  s += G("translate(120 190)", R(-14, -80, 28, 120, "#f4ecdb", 2, 12) + R(-8, -60, 16, 96, HOT, 0, 6) + C(0, 44, 20, HOT, 2) + T("45°", 0, 92, 24, ORANGE, 800));
  return s + cross(320, 260, 1.6, at(u, d - 1, .4));
});
// 19 · a tyre low on air bends more as it rolls, heats up inside: that is what bursts it
shot(19, push(320, 440, 1.2, 1.26), function (u, d, t) {
  var k = at(u, .5, d - 1), s = paper() + ground(580);
  s += wheelSide(170, 470, 110, { spin: t * 200 }) + wheelSide(470, 470 + 14, 110, { spin: t * 200, flat: .55 + .1 * Math.sin(t * 12), hot: k });
  s += T("هوا مظبوط", 170, 660, 22, OLIVE, 800) + T("هوا ناقص", 470, 660, 22, BLUE, 800) + check(170, 300, 1.1, at(u, .3, .4), OLIVE);
  return s + heatLines(470, 330, t, 3) + label(420, 560, 380, 700, "بيتني", ORANGE, at(u, .8, .4), 24) + G("", T("بيسخن", 470, 250, 30, ORANGE, 800), at(u, 1.6, .3));
});
// 20 · check the pressure cold, in the morning, at the number by the driver's door
shot(20, push(340, 420, 1.15, 1.22), function (u, d, t) {
  var c = window.CHUNKS[20], D = LN[20].end - LN[20].start, second = u > D * (c[2] || .66), s = paper();
  if (!second) {
    s += sun(120, 240 + 30 * (1 - at(u, 0, 2)), 40, t) + ground(640) + wheelSide(360, 470, 170, {});
    s += G("translate(440 330) rotate(-40)", R(-16, -10, 120, 20, "#9aa2ac", 2, 6) + C(130, 0, 34, "#f4ecdb", 2.4) + '<path d="M130 0 L' + f(130 + 22 * Math.cos(-2.2 + at(u, .5, .8) * 1.5)) + ' ' + f(22 * Math.sin(-2.2 + at(u, .5, .8) * 1.5)) + '" stroke="' + ORANGE + '" stroke-width="4"/>');
    s += G("", T("بارد", 140, 340, 30, BLUE, 800), at(u, .6, .3));
  } else {
    s += R(160, 120, 330, 560, BODYC, 2.6, 16) + R(170, 130, 30, 540, "#b3a37a", 1.6) + R(236, 260, 210, 260, "#f4efe3", 2, 6) + T("ضغط الهوا", 341, 306, 24, INK, 800);
    s += N("2.3 bar", 341, 380, 40, ORANGE) + N("33 psi", 341, 440, 30, INK) + '<path d="M260 470 H420" stroke="' + MUTE + '" stroke-width="2"/>' + T("205/55 R16", 341, 500, 18, MUTE, 700);
    s += tag("جنب باب السواق", 330, 630, at(u - D * (c[2] || .66), .3, .3), 24, OLIVE);
  }
  return s;
});
// 21 · «يعني من الآخر»: the four steps light up
shot(21, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[21], D = LN[21].end - LN[21].start, on = 0;
  for (var i = 0; i < 4; i++) if (u > D * (c[i + 1] != null ? c[i + 1] : .2 + i * .2) - .05) on = i + 1;
  return paper() + road(t, 200) + topCar(276, 540, 0, { blown: "FL", haz: on >= 4 ? 1 : 0 }) + R(-10, 120, 660, 150, PAPER, 0) + steps4(320, 200, on, on - 1, 1);
});
// 22 · every tyre carries its birthday on the sidewall: four digits, week then year
shot(22, push(320, 360, 1.0, 1.14), function (u, d, t) {
  var c = window.CHUNKS[22], D = LN[22].end - LN[22].start, s = paper() + sidewall(320, 520, 330, 1, t);
  var bx = 320 + 330 * .82 * Math.cos(-.62), by = 520 + 330 * .82 * Math.sin(-.62);
  s += inset(320, 220, 150, G("scale(1.4)", R(-80, -28, 160, 56, TYRE, 2, 8) + N("2321", 0, 16, 44, "#e8e1cf") + (u > D * (c[2] || .55) ? R(-74, -24, 70, 48, "none", 0, 4, ' stroke="' + OLIVE + '" stroke-width="5"') : "") + (u > D * (c[3] || .78) ? R(4, -24, 70, 48, "none", 0, 4, ' stroke="' + ORANGE + '" stroke-width="5"') : "")), at(u, D * (c[1] || .3), .3));
  s += tag("الأسبوع 23", 230, 430, at(u, D * (c[2] || .55), .3), 24, OLIVE) + tag("سنة 2021", 420, 430, at(u, D * (c[3] || .78), .3), 24, ORANGE);
  return s;
}, { tr: "in" });
// 23 · many carmakers say: change it after about six years, even if it still looks new
shot(23, push(330, 420, 1.2, 1.3), function (u, d, t) {
  var k = at(u, .8, 1.4), s = paper() + ground(640) + wheelSide(300, 470, 170, { spin: 4 * Math.sin(t) });
  for (var i = 0; i < 9; i++) { var a = -2.6 + i * .35, r0 = 170 * .72; s += draw("M" + f(300 + Math.cos(a) * r0) + " " + f(470 + Math.sin(a) * r0) + " l" + f(8 - 16 * hash(i)) + " " + f(-12) + " l" + f(8 * hash(i + 4)) + " -10", k, "#e8e1cf", 2); }
  return s + label(230, 360, 120, 230, "شقوق", ORANGE, at(u, 1.6, .5), 24) + numBox("6", 500, 200, at(u, .3, .3), 64) + G("", T("سنين", 500, 268, 26, INK, 800), at(u, .5, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
// the blowout lands on the narrator's «طاخ» in line 1 (the word starts 0.5 s into the line); cues.js plays the bang there too
window.BANG_DT = 0.5;
function hookRoad(t, s0) {   // the highway shot of the hook: steady at 120 until the bang, then the tyre bursts and the car pulls
  var bt = LN[1].start + BANG_DT, k = clamp((t - bt) / 2.5), on = t > bt, s = "";
  s += G("translate(-16 -40) scale(1)", road(t, 420 * (1 - .2 * k)) + track([[300, 760], [300, 600], [298, 540], [290, 500], [300 - 60 * k * k, 470]], ORANGE, k) + topCar(300 - 60 * k * k + (on ? 0 : 1.5 * Math.sin(t * 9)), 430, -12 * k, on ? { blown: "FL" } : {}) + spark(252 - 60 * k * k, 346, (t - bt) / .5));
  s += G("translate(500 90)", speedo(0, 0, 62, 120 + (on ? 0 : 2 * Math.sin(t * 3))));
  if (on) s += G("translate(480 230) scale(" + f(1 + .4 * (1 - clamp((t - bt) / .2))) + ")", T("طاخ!", 0, 0, 54, ORANGE, 800), clamp((t - bt) / .12));
  // «اوعى تدوس فرامل»: the brake pedal, crossed out, from the first word
  s += iconBox(110, 100, 130, G("rotate(-18)", P("M14 -22 L-2 26", "none", 7) + R(-22, 18, 40, 30, ORANGE, 2.4, 6)) + T("فرامل", 0, -38, 20, INK, 800), clamp((t - s0) / .3)) + cross(110, 104, 1.1, clamp((t - s0 - .5) / .4));
  return s;
}
SCENE.intro = function (svg, t, li) {
  // line 0: the car on the highway at 120, the brake crossed out. line 1: «هتسمع طاخ» — the tyre bursts on the word, the car
  // pulls; then inside the car the foot goes for the brake. line 2: the car slews round, ✗
  var s = "";
  if (li === 0 || (li === 1 && t < LN[1].start + BANG_DT + 1.4)) s += hookRoad(t, LN[0].start);
  else if (li === 1) {
    var u1 = t - LN[1].start, p = clamp((u1 - (LN[1].end - LN[1].start) * .6) / .5);
    s += G("translate(-230 -150) scale(1.35)", cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: p, hlPedal: "brake", face: { eyes: 1.25, brows: "raised", mouth: "o" } }).svg);
  } else {
    var u2 = t - LN[2].start, k2 = clamp(u2 / 2.4);
    s += G("translate(-16 -40)", road(t, 200) + topCar(300 + 40 * k2, 420, 160 * ease(k2), { blown: "FL", brake: 1 }) + draw("M460 260 A170 170 0 0 1 460 580", k2, ORANGE, 6)) + cross(470, 120, 1.3, clamp((u2 - 1.6) / .4));
  }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 100) scale(.3)", wheelSide(0, 0, 200, { spin: t * 120, flat: .5 + .2 * Math.sin(t * 3) })); };
SCENE.outro = function (svg, u, t) {
  return R(0, 0, 600, 280, "#d8ccae", 0) + G("translate(80 -50) scale(.55) rotate(90 320 400)", road(t, 120) + topCar(276, 470, 0, { blown: "FL", haz: 1 })) +
    callout("1", 300, 60, ease(u / .3)) + callout("2", 380, 60, ease(u / .3 - .5)) + callout("3", 460, 60, ease(u / .3 - 1)) + callout("4", 540, 60, ease(u / .3 - 1.5));
};
