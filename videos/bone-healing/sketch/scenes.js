window.CHUNKS = [[0.0, 0.3208, 0.717], [0.0, 0.3556], [0.0, 0.4789], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.3115, 0.4918], [0.0, 0.2917, 0.6528], [0.0, 0.3269], [0.0, 0.5], [0.0, 0.2468, 0.4286], [0.0, 0.3333, 0.75], [0.0, 0.3729, 0.5763], [0.0, 0.209, 0.4328], [0.0, 0.3768, 0.7536], [0.0, 0.625], [0.0], [0.0, 0.4844], [0.0, 0.2679, 0.6429], [0.0, 0.1375, 0.3875, 0.6625], [0.0, 0.5], [0.0, 0.4032], [0.0], [0.0, 0.1875, 0.3375, 0.55, 0.7625], [0.0, 0.3289, 0.5921], [0.0, 0.5], [0.0], [0.0]];
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

// ── pictures: the «اسكتش» illustrations (ink-and-wash technical cutaways made in Google AI Studio from the series prompts,
// keyed to alpha by img_prep.py → <episode>/sketch/img/NN.webp). pics({n: [w, h]}) registers them once in the page's
// <defs>; the panel, rebuilt every frame, only points at them with <use>, so they never reload or flicker.
var SZ = {};
function pics(sizes) {
  Object.keys(sizes).forEach(function (n) { SZ[n] = sizes[n]; });
  var defs = document.querySelector("svg defs"), NS = "http://www.w3.org/2000/svg";
  Object.keys(SZ).forEach(function (n) {
    var id = "pic" + n; if (document.getElementById(id)) return;
    var im = document.createElementNS(NS, "image"); im.setAttribute("id", id); im.setAttribute("href", "img/" + (n < 10 ? "0" : "") + n + ".webp");
    im.setAttribute("width", SZ[n][0]); im.setAttribute("height", SZ[n][1]); defs.appendChild(im);
  });
}
function PL(n, cx, cy, w) { var k = w / SZ[n][0], h = SZ[n][1] * k, x = cx - w / 2, y = cy - h / 2; return { n: n, x: x, y: y, w: w, h: h, k: k, p: function (px, py) { return [x + px * k, y + py * k]; } }; }
function pic(L, op) { return '<use href="#pic' + L.n + '" transform="translate(' + f(L.x) + ' ' + f(L.y) + ') scale(' + L.k.toFixed(4) + ')"' + (op != null && op < 1 ? ' opacity="' + f(op) + '"' : "") + '/>'; }
// a boxed callout with a curved arrow to the part, like the reference's engine labels. (px,py) the part, (bx,by) the box centre
function box(pt, bx, by, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 24; var w = text.length * sz * .56 + 28, h = sz * 1.7, px = pt[0], py = pt[1];
  var ex = bx + (px > bx ? w / 2 : px < bx - w / 2 ? -w / 2 : 0), ey = by + (Math.abs(px - bx) < w / 2 ? (py > by ? h / 2 : -h / 2) : 0);
  var mx = (ex + px) / 2 + (py - ey) * .25, my = (ey + py) / 2 - (px - ex) * .25, d = "M" + f(ex) + " " + f(ey) + " Q" + f(mx) + " " + f(my) + " " + f(px) + " " + f(py);
  var a = Math.atan2(py - my, px - mx), hs = 11, s = draw(d, clamp(k * 1.7 - .2), INK, 2);
  if (k > .6) s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(px - Math.cos(a - .45) * hs) + ' ' + f(py - Math.sin(a - .45) * hs) + ' L' + f(px - Math.cos(a + .45) * hs) + ' ' + f(py - Math.sin(a + .45) * hs) + ' Z" fill="' + INK + '"/>';
  return G("", '<rect x="' + f(bx - w / 2) + '" y="' + f(by - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="6" fill="#f6efdf" stroke="' + INK + '" stroke-width="2"/>' + T(text, bx, by + sz * .36, sz, col || INK, 800), Math.min(1, k * 2.5)) + s;
}
// dots running along a polyline of world points (blood or gas moving)
function runDots(pts, t, col, r, n, speed) {
  var L = [0], i, s = ""; for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  var tot = L[L.length - 1]; n = n || 8;
  for (var j = 0; j < n; j++) { var d = ((j / n) * tot + t * (speed || 60)) % tot, q = 1; while (q < L.length - 1 && L[q] < d) q++; var u = (d - L[q - 1]) / Math.max(1e-6, L[q] - L[q - 1]), x = lerp(pts[q - 1][0], pts[q][0], u), y = lerp(pts[q - 1][1], pts[q][1], u);
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (r || 6) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  return s;
}
function mapPts(L, a) { return a.map(function (q) { return L.p(q[0], q[1]); }); }

// ── living pictures: parts of an illustration cut out (clip paths in the picture's own pixels) and moved on their own:
// lungs breathe, the heart beats, the baby sways in its fluid, blood runs in the vessels, the nail is pulled, the flag flies.
function ell(cx, cy, rx, ry) { return "M" + (cx - rx) + " " + cy + " a" + rx + " " + ry + " 0 1 0 " + 2 * rx + " 0 a" + rx + " " + ry + " 0 1 0 " + -2 * rx + " 0 Z"; }
function poly(a) { return "M" + a.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + " Z"; }
function about(L, px, py, sc, rot, dx, dy) { var c = L.p(px, py); return "translate(" + f(c[0] + (dx || 0)) + " " + f(c[1] + (dy || 0)) + ") rotate(" + f(rot || 0) + ") scale(" + (sc || 1).toFixed(4) + ") translate(" + f(-c[0]) + " " + f(-c[1]) + ")"; }
function clipOf(L, d, inv) { var id = "pt" + (++CLIPN); return { id: id, def: '<clipPath id="' + id + '"><path ' + (inv ? 'clip-rule="evenodd" ' : "") + 'd="' + (inv ? "M-4000 -4000 H6000 V6000 H-4000 Z " : "") + d + '" transform="translate(' + f(L.x) + ' ' + f(L.y) + ') scale(' + L.k.toFixed(4) + ')"/></clipPath>' }; }
// part: the region d of picture L, moved by transform tr. fixed = the cut stays put and only the content inside moves
function part(L, d, tr, fixed) { var c = clipOf(L, d); return fixed ? c.def + '<g clip-path="url(#' + c.id + ')"><g transform="' + tr + '">' + pic(L) + '</g></g>' : '<g transform="' + tr + '">' + c.def + '<g clip-path="url(#' + c.id + ')">' + pic(L) + '</g></g>'; }
// partSoft: the region inside ellipse (cx, cy, rx, ry) of picture L moved by tr, its edge fading into the still picture
// (a soft mask), so a bigger movement shows no seam
function partSoft(L, cx, cy, rx, ry, tr) {
  var id = "ps" + (++CLIPN), c = L.p(cx, cy);
  return '<radialGradient id="' + id + 'g"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(rx * L.k) + '" ry="' + f(ry * L.k) + '" fill="url(#' + id + 'g)"/></mask>' +
    '<g mask="url(#' + id + ')"><g transform="' + tr + '">' + pic(L) + '</g></g>';
}
function picBut(L, d) { var c = clipOf(L, d, true); return c.def + '<g clip-path="url(#' + c.id + ')">' + pic(L) + '</g>'; }   // the picture without region d
function ip(L, a) { return L.p(a[0], a[1]); }
function breath(t) { return .5 + .5 * Math.sin(t * 1.7); }
function beat(t) { return Math.pow(Math.max(0, Math.sin(t * 7.2)), 3); }
function cellSprite(x, y, r, col, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", '<ellipse rx="' + f(r) + '" ry="' + f(r * .78) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.1"/><ellipse rx="' + f(r * .5) + '" ry="' + f(r * .36) + '" fill="#000" opacity=".16"/>'); }

// ── the narrator's voice as motion: VOX(t) is 0 in silence … 1 on loud syllables (env.js from tools/envelope.py, listed
// in the episode's CFG libs as "../env.js"). Use it for a jaw that talks, vocal folds that buzz, rings that swell.
function VOX(t) { var E = window.VOXENV; if (!E) return .5 + .5 * Math.sin(t * 6); var i = t * E.fps, a = Math.floor(i); if (a < 0 || a >= E.v.length - 1) return 0; return lerp(E.v[a], E.v[a + 1], i - a); }
// inkIn: a picture drawn in by a soft wipe from right to left (the way Arabic reads) as a shot opens (k 0 → 1)
function inkIn(k, inner, x0, x1) {
  k = clamp(k); if (k >= 1) return inner; x0 = x0 == null ? -60 : x0; x1 = x1 == null ? 700 : x1;
  var id = "ink" + (++CLIPN), e = lerp(x1 - 120, x0 - 240, ease(.15 + .85 * k));
  return '<linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="' + f(e) + '" y1="120" x2="' + f(e + 240) + '" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
    '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#' + id + 'g)"/></mask><g mask="url(#' + id + ')">' + inner + '</g>';
}

// ── light: glow(x, y, r, colour, strength) adds light on top of a picture (screen blend), for a flame, a hot weld, a
// pulse of blood, calcium setting. sparks(x, y, t, n, len, ang, spread) throws short bright streaks from a point.
function glow(x, y, r, col, a) {
  a = clamp(a == null ? 1 : a); if (a <= 0) return ""; var id = "gl" + (++CLIPN);
  return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + (col || "#ffcf7a") + '" stop-opacity="' + f(a) + '"/><stop offset=".35" stop-color="' + (col || "#ffcf7a") + '" stop-opacity="' + f(a * .45) + '"/><stop offset="1" stop-color="' + (col || "#ffcf7a") + '" stop-opacity="0"/></radialGradient>' +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#' + id + ')" style="mix-blend-mode:screen"/>';
}
function sparks(x, y, t, n, len, ang, spread, col) {
  var s = "", i; n = n || 14; len = len || 70; ang = ang == null ? -90 : ang; spread = spread || 160;
  for (i = 0; i < n; i++) {
    var ph = (t * 2.2 + hash(i * 3.1)) % 1, a = (ang + (hash(i + 7) - .5) * spread) * Math.PI / 180, d = ph * len * (.6 + .8 * hash(i + 2)), g = ph * ph * 40,
        x1 = x + Math.cos(a) * d, y1 = y + Math.sin(a) * d + g, x0 = x + Math.cos(a) * Math.max(0, d - 10), y0 = y + Math.sin(a) * Math.max(0, d - 10) + g * .8;
    s += '<path d="M' + f(x0) + ' ' + f(y0) + ' L' + f(x1) + ' ' + f(y1) + '" stroke="' + (col || "#ffd27a") + '" stroke-width="' + f(2.4 * (1 - ph) + .6) + '" stroke-linecap="round" opacity="' + f(1 - ph) + '" style="mix-blend-mode:screen"/>';
  }
  return s;
}
// rotate-and-move a point of picture L the same way about(L, px, py, sc, rot, dx, dy) moves a part (world coords out)
function movedPt(L, x, y, px, py, sc, rot, dx, dy) {
  var c = L.p(px, py), q = L.p(x, y), a = (rot || 0) * Math.PI / 180, vx = (q[0] - c[0]) * (sc || 1), vy = (q[1] - c[1]) * (sc || 1);
  return [c[0] + (dx || 0) + vx * Math.cos(a) - vy * Math.sin(a), c[1] + (dy || 0) + vx * Math.sin(a) + vy * Math.cos(a)];
}
function stopwatch(x, y, r, k, t) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = '<rect x="' + f(x - 10) + '" y="' + f(y - r - 22) + '" width="20" height="14" fill="' + INK + '"/>' + C(x, y, r, "#f4ecdb", 3);
  if (k > 0) s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r + 8) + ' A' + f(r - 8) + ' ' + f(r - 8) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 8)) + ' ' + f(y + Math.sin(a) * (r - 8)) + ' Z" fill="' + ORANGE + '" opacity=".35"/>';
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 4)) + ' ' + f(y + Math.sin(b) * (r - 4)) + ' L' + f(x + Math.cos(b) * (r - 14)) + ' ' + f(y + Math.sin(b) * (r - 14)) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  return s + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 14)) + ' ' + f(y + Math.sin(a) * (r - 14)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
}
function stopwatchIso(o, k, t) {
  return slabL(o, 0, 0, 0, 34, "M-120 0 A120 120 0 1 0 120 0 A120 120 0 1 0 -120 0 Z M-12 -122 L-12 -146 L12 -146 L12 -122 Z", "#f4ecdb", KHAKI, stopwatch(0, 0, 112, k, t));
}

// ── «إزاي العضمة المكسورة بتلحم نفسها؟» — the channel's ink-and-wash cutaways (img/NN.webp), and every picture moves:
// the welder's arm and head and the torch's light, the blood in the vessels, the clot that throbs, the cells that eat and
// build, the soft bridge pulled tight, the concrete flowing, calcium lighting the new bone, the bulge shrinking back.
pics({ 1: [700, 729], 2: [479, 1336], 3: [559, 1067], 4: [639, 962], 5: [706, 883], 6: [733, 1135], 7: [749, 1301], 8: [709, 1182], 9: [768, 635], 10: [705, 1204], 11: [611, 1213], 12: [768, 1359] });
var HOT = "#ffb45a", BLOODC = "#c0392b", CAL = "#fff1c9";

// ── the living pictures ──
var WELD = { shoulder: [200, 200], tip: [362, 378], neck: [300, 200], bead: [[255, 470], [300, 440], [362, 385]] };
function welder(L, t, o) {
  o = o || {}; var s = "", sweep = Math.sin(t * 1.6), rot = 3.2 * sweep, dx = 7 * sweep * L.k, dy = -4 * sweep * L.k, nod = 2.2 * Math.sin(t * .9 + 1);
  var fl = .7 + .3 * Math.abs(Math.sin(t * 23)) * (.6 + .4 * Math.sin(t * 7)), tip = movedPt(L, WELD.tip[0], WELD.tip[1], WELD.shoulder[0], WELD.shoulder[1], 1, rot, dx, dy);
  s += pic(L);
  s += partSoft(L, 330, 105, 105, 100, about(L, WELD.neck[0], WELD.neck[1], 1, nod));                                   // the helmet nods
  s += partSoft(L, 265, 320, 150, 95, about(L, WELD.shoulder[0], WELD.shoulder[1], 1, rot, dx, dy));                    // the arm and torch move along the seam
  // the light: a flickering bloom at the tip, the whole scene warmed, the fresh bead glowing behind the torch
  s += glow(tip[0], tip[1], 150 * L.k / .8 * fl, "#ffd9a0", .55 * fl) + glow(tip[0], tip[1], 40 * L.k / .8, "#fffbe8", .95 * fl);
  WELD.bead.forEach(function (b, i) { var p = L.p(b[0], b[1]); s += glow(p[0], p[1], 34 * L.k / .8, HOT, (.35 + .25 * i) * (.8 + .2 * Math.sin(t * 9 + i))); });
  s += sparks(tip[0], tip[1], t, 22, 110 * L.k / .8, -35, 150) + sparks(tip[0], tip[1], t + .37, 10, 70 * L.k / .8, 150, 80);
  s += '<rect x="-2000" y="-2000" width="5000" height="5000" fill="#ffb060" opacity="' + f(.05 * fl * (o.room == null ? 1 : o.room)) + '" style="mix-blend-mode:screen"/>';
  return s;
}
var BONE3 = { vessels: [[[120, 870], [130, 700], [150, 520], [140, 320], [120, 150]], [[440, 880], [430, 700], [420, 520], [440, 330], [430, 120]], [[260, 980], [240, 820], [250, 680]]], marrow: [270, 520] };
var CLOT = { c: [300, 480], vin: [[[20, 740], [120, 650], [210, 560], [260, 520]], [[600, 450], [480, 500], [370, 500]], [[520, 720], [430, 620], [350, 540]]] };
var MACRO = [[130, 220, 1], [420, 400, 2], [180, 560, 3], [480, 700, 4]];
var CUBES = [[395, 205], [430, 165], [470, 145], [510, 140], [400, 245], [420, 285], [450, 310], [485, 320], [520, 330]];
function live(L, t, o) {
  o = o || {}; var n = L.n, s = "", i, k = L.k, b = beat(t), v;
  if (n === 1) return welder(L, t, o);
  if (n === 2) {   // the leg: a gentle sway; the broken end shifts on the crack and the blood pulses (or the healed glow)
    s = G(about(L, 240, 1300, 1, .9 * Math.sin(t * .8)), pic(L) + (o.healed ? "" : partSoft(L, 300, 820, 80, 120, "translate(" + f(2.5 * Math.sin(t * 1.4) * k) + " " + f(2 * Math.abs(Math.sin(t * 1.4)) * k) + ")")));
    var cr = L.p(260, 680);
    s += o.healed ? glow(cr[0], cr[1], 120 * k, "#ffe6a8", .6 + .2 * Math.sin(t * 2)) : glow(cr[0], cr[1], 110 * k, "#ff5a3c", .25 + .45 * b);
    return s;
  }
  if (n === 3) {   // the living bone: blood runs in its vessels, the marrow glows with each beat
    s = G(about(L, 280, 1000, 1, .8 * Math.sin(t * .7)), pic(L));
    BONE3.vessels.forEach(function (vp, j) { s += runDots(mapPts(L, vp), t + j * .4, "#d9412e", 3.2, 9, 55); });
    var m = L.p(BONE3.marrow[0], BONE3.marrow[1]); s += glow(m[0], m[1], 150 * k, "#ffb347", .25 + .4 * b);
    return s;
  }
  if (n === 4) {   // the clot throbs, blood seeps in from the torn vessels
    s = pic(L) + partSoft(L, CLOT.c[0], CLOT.c[1], 150, 140, about(L, CLOT.c[0], CLOT.c[1], 1 + .05 * b, 2 * Math.sin(t)));
    CLOT.vin.forEach(function (vp, j) { s += G("", runDots(mapPts(L, vp), t + j * .3, "#a8231a", 4.2, 6, 40), o.bleed == null ? 1 : o.bleed); });
    var c = L.p(CLOT.c[0], CLOT.c[1]); s += glow(c[0], c[1], 160 * k, "#ff4a30", .15 + .3 * b * (o.bleed == null ? 1 : o.bleed));
    return s;
  }
  if (n === 5) {   // the clean-up cells swell and creep onto the bone fragments; red cells drift through the net
    s = pic(L);
    MACRO.forEach(function (m) { var ph = t * 1.3 + m[2] * 1.7, sw = .5 + .5 * Math.sin(ph); s += partSoft(L, m[0], m[1], 120, 115, about(L, m[0], m[1], 1 + .06 * sw, 4 * Math.sin(ph * .7), 6 * Math.cos(ph * .6) * k, 6 * Math.sin(ph * .5) * k)); });
    for (i = 0; i < 9; i++) { var a = t * .25 + i * .7, x = 340 + 300 * Math.cos(a + hash(i) * 6), y = 440 + 360 * Math.sin(a * .8 + hash(i + 3) * 6), p = L.p(x, y); s += cellSprite(p[0], p[1], 15 * k, "#c9483a", a * 40); }
    return s;
  }
  if (n === 6) {   // the soft bridge breathes, and pulls the two ends a little closer
    var pull = .5 + .5 * Math.sin(t * 1.5);
    s = pic(L) + partSoft(L, 420, 300, 150, 150, "translate(" + f(-4 * pull * k) + " " + f(6 * pull * k) + ")") + partSoft(L, 300, 820, 140, 160, "translate(" + f(4 * pull * k) + " " + f(-6 * pull * k) + ")");
    s += partSoft(L, 370, 560, 170, 200, about(L, 370, 560, 1 + .03 * pull, 0));
    var c6 = L.p(370, 560); s += glow(c6[0], c6[1], 210 * k, "#cfe6ff", .25 + .25 * pull);
    return s;
  }
  if (n === 7) {   // the concrete flows down the chute and spreads in rings
    var stream = poly([[130, 150], [270, 150], [330, 330], [320, 520], [180, 520], [210, 330]]), sh = (t * 70) % 90, cc = clipOf(L, stream);
    s = pic(L) + cc.def + '<g clip-path="url(#' + cc.id + ')">' + G("translate(" + f(sh * .45 * k) + " " + f(sh * k) + ")", pic(L)) + G("translate(" + f((sh - 90) * .45 * k) + " " + f((sh - 90) * k) + ")", pic(L)) + '</g>';
    var c7 = L.p(270, 560);
    for (i = 0; i < 3; i++) { var ph7 = (t * .6 + i / 3) % 1; s += '<ellipse cx="' + f(c7[0]) + '" cy="' + f(c7[1]) + '" rx="' + f((20 + ph7 * 160) * k) + '" ry="' + f((10 + ph7 * 70) * k) + '" fill="none" stroke="#f2f2ee" stroke-width="2.4" opacity="' + f((1 - ph7) * .85) + '"/>'; }
    return s;
  }
  if (n === 8) {   // calcium sets the new bone: light creeps round the collar, white grains settle in
    var kc = o.cal == null ? .5 + .5 * Math.sin(t) : o.cal;
    s = pic(L) + partSoft(L, 360, 560, 290, 360, about(L, 360, 560, 1 + .015 * Math.sin(t * 1.2), .8 * Math.sin(t * .7)));
    var c8 = L.p(360, 560); s += glow(c8[0], c8[1], 300 * k, "#ffd98a", .15 + .45 * kc);
    for (i = 0; i < 16; i++) { var ph8 = (t * .5 + hash(i)) % 1, ang = hash(i + 4) * 6.28, r0 = 320 - ph8 * 200, p8 = L.p(360 + Math.cos(ang) * r0, 560 + Math.sin(ang) * r0 * 1.2); s += '<circle cx="' + f(p8[0]) + '" cy="' + f(p8[1]) + '" r="' + f(3.5 * k / .5) + '" fill="' + CAL + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(Math.sin(ph8 * Math.PI)) + '"/>'; }
    return s;
  }
  if (n === 9) {   // the eater crawls and gnaws (dust flies), the builders bob in a wave, the new bone glows
    var cr9 = Math.sin(t * 1.4);
    s = pic(L) + partSoft(L, 220, 215, 100, 90, about(L, 220, 215, 1 + .05 * Math.abs(cr9), 6 * cr9, 8 * cr9 * k, 2 * Math.cos(t * 2.8) * k));
    for (i = 0; i < 8; i++) { var ph9 = (t * 1.1 + hash(i)) % 1, p9 = L.p(150 + hash(i + 2) * 60, 180 + hash(i + 3) * 80); s += '<circle cx="' + f(p9[0] - ph9 * 30) + '" cy="' + f(p9[1] - ph9 * 40) + '" r="' + f(2.5 + hash(i) * 2) + '" fill="#efe3c8" stroke="' + INK + '" stroke-width=".6" opacity="' + f(1 - ph9) + '"/>'; }
    CUBES.forEach(function (c, j) { s += partSoft(L, c[0], c[1], 26, 26, "translate(0 " + f(-5 * Math.max(0, Math.sin(t * 3 - j * .7)) * k) + ")"); });
    var c9 = L.p(470, 260); s += glow(c9[0], c9[1], 150 * k, "#ffb35c", .2 + .25 * (.5 + .5 * Math.sin(t * 2)));
    return s;
  }
  if (n === 10) {  // the arm in its cast: a little movement, but the bone inside stays put; the break glows as it knits
    s = G(about(L, 300, 1150, 1, 1.2 * Math.sin(t * .9)), pic(L));
    var c10 = L.p(370, 620); s += glow(c10[0], c10[1], 90 * k, o.hot ? "#ff6a40" : "#ffe1a0", .3 + .25 * Math.sin(t * 2.4));
    return s;
  }
  if (n === 11) {  // remodelling: the bulge on the left bone shrinks back (o.shrink 0 → 1); both bones sway a little
    var sh11 = o.shrink || 0;
    s = G(about(L, 300, 1200, 1, .6 * Math.sin(t * .8)), pic(L) + partSoft(L, 130, 590, 120, 210, about(L, 130, 590, 1, 0)) + (sh11 > 0 ? partSoft(L, 130, 590, 115, 200, "translate(" + f(L.p(130, 590)[0]) + " " + f(L.p(130, 590)[1]) + ") scale(" + f(1 - .18 * sh11) + " 1) translate(" + f(-L.p(130, 590)[0]) + " " + f(-L.p(130, 590)[1]) + ")") : ""));
    if (sh11 > 0) { var cb = L.p(130, 590); for (i = 0; i < 10; i++) { var ph11 = (t * .7 + hash(i)) % 1; s += '<circle cx="' + f(cb[0] + (hash(i + 1) > .5 ? 1 : -1) * (50 + ph11 * 60) * k) + '" cy="' + f(cb[1] + (hash(i + 2) - .5) * 300 * k) + '" r="2.5" fill="#efe3c8" opacity="' + f((1 - ph11) * sh11) + '"/>'; } }
    return s;
  }
  if (n === 12) {  // the skeleton breathes and sways; arms swing; a band of light renews it from head to toe (o.renew)
    s = G(about(L, 400, 1300, 1, .9 * Math.sin(t * .8)), pic(L) + partSoft(L, 210, 470, 80, 230, about(L, 220, 290, 1, 3 * Math.sin(t * 1.3))) + partSoft(L, 560, 470, 80, 230, about(L, 545, 290, 1, -3 * Math.sin(t * 1.3 + .6))) + partSoft(L, 400, 110, 70, 80, about(L, 400, 180, 1, 2.5 * Math.sin(t * 1.1))));
    if (o.renew != null) { var y12 = L.p(0, 60 + 1250 * ((o.renew) % 1))[1]; s += '<rect x="' + f(L.x) + '" y="' + f(y12 - 40) + '" width="' + f(L.w) + '" height="80" fill="#ffc46b" opacity=".35" style="mix-blend-mode:screen"/>'; }
    return s;
  }
  return pic(L);
}

// layouts (world 640 × 786)
var WLD = PL(1, 320, 380, 640), LEG = PL(2, 320, 400, 330), BON = PL(3, 320, 400, 400), CLT = PL(4, 320, 400, 500), MAC = PL(5, 320, 400, 560),
    SOF = PL(6, 320, 400, 480), CON = PL(7, 320, 400, 450), HRD = PL(8, 320, 400, 480), RMD = PL(9, 320, 380, 640), CST = PL(10, 320, 400, 450),
    TWO = PL(11, 320, 400, 380), SKL = PL(12, 320, 395, 420);

// ════ shots ════
// 2 · and no nail in most breaks… the healed bone comes back as strong (the smooth bone; the bulgy one dimmed)
shot(2, push(320, 400, 1.0, 1.06), function (u, d, t) { return paper() + live(TWO, t) + check(500, 200, 1.3, at(u, 1.6, .5), OLIVE); });
// 4 · the rule card over the living bone
shot(4, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + G("", live(BON, t), .55) + G("", '<rect x="150" y="190" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 265)"/>' +
    T("العضم", 320, 252, 40, OLIVE, 800) + T("عضو حي", 320, 304, 36, ORANGE, 800) + C(320, 198, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · bone is alive: blood and cells working all the time
shot(5, push(320, 420, 1.0, 1.1), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(BON, t)) + box(BON.p(130, 600), 110, 120, "دم", ORANGE, at(u, 1.2, .5), 26) + box(BON.p(270, 300), 520, 120, "خلايا", OLIVE, at(u, 2.2, .5), 24);
});
// 6 · it breaks: the vessels tear, blood gathers round the break
shot(6, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CLT, t, { bleed: at(u, .3, 1) })) + box(CLT.p(560, 470), 520, 120, "العروق", ORANGE, at(u, 1, .5), 24);
}, { tr: "in" });
// 7 · the blood clots into a plug between the two ends
shot(7, push(CLT.p(300, 480)[0], CLT.p(300, 480)[1], 1.25, 1.4), function (u, d, t) {
  return paper() + live(CLT, t, { bleed: .4 }) + box(CLT.p(300, 470), 470, 170, "جلطة", ORANGE, at(u, .6, .5), 22);
});
// 8 · a small army of cells cleans up the debris and dead bone
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(MAC, t)) + box(MAC.p(130, 220), 120, 90, "خلايا بتنضّف", OLIVE, at(u, .8, .5), 22) + box(MAC.p(310, 380), 520, 90, "عضم ميت", INK, at(u, 1.8, .5), 20);
}, { tr: "in" });
// 9 · who builds? special cells make a soft bridge between the ends
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(SOF, t)) + box(SOF.p(370, 560), 520, 150, "جسر طري", BLUE, at(u, 1.6, .5), 26);
}, { tr: "out" });
// 10 · the bridge is cartilage, like in your nose (thumbnail)
shot(10, push(SOF.p(370, 560)[0], SOF.p(370, 560)[1], 1.25, 1.35), function (u, d, t) {
  return paper() + live(SOF, t) + box(SOF.p(370, 560), 470, 130, "غضروف", BLUE, at(u, .3, .5), 24) +
    iconBox(SOF.p(370, 560)[0] - 170, SOF.p(370, 560)[1] - 190, 120, '<path d="M-10 -55 C-12 -20 -30 10 -40 30 C-30 46 -6 48 0 40 C6 48 30 46 40 30 C30 10 12 -20 10 -55 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -30 L0 30" stroke="#a9c6dd" stroke-width="7" stroke-linecap="round"/>', at(u, 1.2, .3));
});
// 11 · like concrete: soft when poured, it needs time to set
shot(11, push(320, 400, 1.04, .97), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CON, t)) + tag("طرية", 520, 650, at(u, 1.6, .3), 30, BLUE);
}, { tr: "out" });
// 12 · when does it set? bone-building cells lay calcium on the bridge
shot(12, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(HRD, t, { cal: at(u, .6, 2.5) })) + box(HRD.p(150, 420), 120, 110, "كالسيوم", ORANGE, at(u, 1.4, .5), 26);
}, { tr: "in" });
// 13 · the cartilage turns to new bone, a thick collar round the break, just like a weld (thumbnail: the weld)
shot(13, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var th = PL(1, 0, 0, 170);
  return paper() + live(HRD, t, { cal: 1 }) + box(HRD.p(600, 560), 520, 690, "عضم جديد", OLIVE, at(u, .6, .5), 24) +
    iconBox(110, 120, 170, '<clipPath id="ib13"><rect x="-85" y="-85" width="170" height="170"/></clipPath><g clip-path="url(#ib13)">' + welder(th, t, { room: 0 }) + '</g>', at(u, 2.6, .3));
});
// 14 · and the doctor says: it has knitted (the leg, the break glowing healed, ✓)
shot(14, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(LEG, t, { healed: true })) + check(500, 300, 1.4, at(u, 1.2, .5), OLIVE) + tag("لحمت", 500, 420, at(u, 1.5, .3), 30, OLIVE);
}, { tr: "out" });
// 15 · but the work isn't done: the bulge
shot(15, push(TWO.p(130, 590)[0] + 30, TWO.p(130, 590)[1], 1.35, 1.45), function (u, d, t) {
  return paper() + live(TWO, t) + box(TWO.p(60, 560), 110, 160, "زيادة", ORANGE, at(u, .4, .5), 24);
}, { tr: "in" });
// 16–17 · cells that eat the extra bone and cells that build it back to measure (like a finishing crew)
shot(16, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(RMD, t)) + box(RMD.p(220, 215), 140, 560, "بتاكل", ORANGE, at(u, .6, .5), 26) + box(RMD.p(470, 230), 500, 560, "بتبني", OLIVE, at(u, 1.6, .5), 26);
});
shot(17, push(RMD.p(330, 240)[0], RMD.p(330, 240)[1], 1.3, 1.4), function (u, d, t) {
  return paper() + live(RMD, t) + iconBox(320, 120, 150, '<path d="M-40 30 L-10 -30 M-18 -36 L2 -24" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><rect x="10" y="-10" width="40" height="22" fill="#cdb79a" stroke="' + INK + '" stroke-width="2" transform="rotate(' + f(-10 + 20 * Math.sin(t * 6)) + ' 30 0)"/>', at(u, .5, .3));
});
// 18 · months later the bone takes back its shape (the bulge shrinks)
shot(18, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + live(TWO, t, { shrink: at(u, .4, d - 1) }) + tag("شهور", 320, 70, at(u, .3, .3), 28, ORANGE);
}, { tr: "out" });
// 19 · many think the cast heals the bone. No.
shot(19, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CST, t)) + box(CST.p(600, 200), 520, 110, "الجبس", BLUE, at(u, .5, .5), 26) + cross(320, 400, 1.8, at(u, d - 1.1, .5));
});
// 20 · it only holds the two ends still so the soft bridge doesn't break
shot(20, push(CST.p(370, 620)[0], CST.p(370, 620)[1], 1.25, 1.35), function (u, d, t) {
  var c = CST.p(370, 620);
  return paper() + live(CST, t) + arrow(c[0] - 150, c[1], c[0] - 40, c[1], BLUE, 6, at(u, .3, .4)) + arrow(c[0] + 150, c[1], c[0] + 40, c[1], BLUE, 6, at(u, .3, .4)) + tag("بيثبّت", c[0], c[1] - 170, at(u, .8, .3), 28, BLUE);
});
// 21 · what really heals it is your body (the new bone glowing)
shot(21, push(320, 400, .98, 1.05), function (u, d, t) {
  return paper() + live(HRD, t, { cal: .6 + .4 * Math.sin(t * 2) }) + tag("جسمك", 320, 110, at(u, .4, .3), 34, ORANGE);
}, { tr: "out" });
// 22 · in short: clot → soft bridge → calcium → reshaped (four stages, each still moving)
shot(22, push(320, 400, .98, 1.02), function (u, d, t) {
  var cells = [[4, 170, 200], [6, 470, 200], [8, 170, 560], [11, 470, 560]], s = paper();
  cells.forEach(function (c, i) {
    var L = PL(c[0], c[1], c[2], c[0] === 11 ? 180 : 220), id = "rc" + i, k = at(u, i * .8, .4);
    s += G("", '<clipPath id="' + id + '"><rect x="' + (c[1] - 145) + '" y="' + (c[2] - 170) + '" width="290" height="340" rx="8"/></clipPath><rect x="' + (c[1] - 145) + '" y="' + (c[2] - 170) + '" width="290" height="340" rx="8" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><g clip-path="url(#' + id + ')">' + live(L, t, { cal: 1, shrink: .5 + .5 * Math.sin(t) }) + '</g>' + callout(String(i + 1), c[1] - 120, c[2] - 145, k, 18), k);
  });
  return s;
});
// 23 · the odd fact: your body breaks down and builds bone every day
shot(23, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + live(RMD, t) + tag("كل يوم", 320, 610, at(u, 1.2, .3), 32, ORANGE);
}, { tr: "in" });
// 24 · so much that your whole skeleton renews about every ten years (a band of light runs over it; the years count)
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, d - .8);
  return paper() + inkIn(at(u, 0, .75), live(SKL, t, { renew: k })) + G("", N(count(10, k), 520, 380, 80, ORANGE) + T("سنين", 520, 430, 30, INK, 800), at(u, .4, .4));
}, { tr: "out" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
var IN_WLD = PL(1, 304, 330, 600), IN_LEG = PL(2, 304, 340, 300);
SCENE.intro = function (svg, t, li) {
  if (li === 0) return welder(IN_WLD, t);
  var s = live(IN_LEG, t, { healed: li >= 1 && t - LN[1].start > 1.2 });
  if (li >= 1) s += G("translate(500 90) scale(.6)", stopwatch(0, 0, 112, clamp((t - LN[1].start) / 2.5), t)) + tag("6 أسابيع", 500, 210, ease((t - LN[1].start - .6) / .3), 26, ORANGE);
  if (li >= 2) s += cross(110, 520, 1, ease((t - LN[2].start - .6) / .4));
  return s;
};
SCENE.bumper = function (u, t) { return live(PL(3, 90, 100, 110), t); };
SCENE.outro = function (svg, u, t) {
  var cells = [[4, 75], [6, 225], [8, 375], [11, 525]], s = "";
  cells.forEach(function (c, i) { var L = PL(c[0], c[1], 140, c[0] === 11 ? 90 : 120); s += live(L, t, { cal: 1, shrink: .5 + .5 * Math.sin(t) }) + callout(String(i + 1), c[1] - 50, 40, ease(u / .3 - i * .5)); });
  return s;
};
