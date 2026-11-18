window.CHUNKS = [[0.0, 0.775], [0.0, 0.54], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.6522], [0.0, 0.3056], [0.0, 0.3333], [0.0, 0.5672, 0.8358], [0.0, 0.2688, 0.7849], [0.0, 0.5738], [0.0], [0.0, 0.3243, 0.7027], [0.0, 0.6512], [0.0, 0.4561], [0.0, 0.5405], [0.0, 0.64], [0.0, 0.3214, 0.8214], [0.0, 0.2222, 0.5, 0.75], [0.0, 0.5957, 0.7872], [0.0, 0.5], [0.0, 0.5172], [0.0, 0.2394, 0.4085, 0.7042], [0.0, 0.1899, 0.3671, 0.4937, 0.7975], [0.0, 0.3519, 0.6389, 0.9074], [0.0], [0.0]];
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

// ── «أرقام البنزين: 80 و92 و95» — drawings in the «اسكتش» hand. The engine is a side cut through one cylinder like reference v18
// (head with spark plug and two valves, piston, rod, crank), drawn to real proportions (refs/SOURCES.md). The car and the
// real-proportion people are copied from videos/car-water/sketch/shots.js (itself from videos/choking).
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", BONE = "#e6dcc4";
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
// ── the car: a compact sedan in profile, front to the left, drawn to real size (1 m = 120 units):
// length 4.5 m (540), height 1.45 m (174), wheelbase 2.7 m (324), wheels 0.63 m (r 38), window sill 0.98 m (118).
// Local coordinates: x 0 (front bumper) … 540 (rear), y 0 = the ground under the tyres, up is negative.
// Like reference v18 the body is a cut-away: the cabin, the seats and the people show through the side.
var BODY = "#d8ccae", BODY_D = "#b9ab8a", GLASS = "#cfdde3", WATER = "#5f8aa3", WATER_T = "#8fb0c2", MUD = "#8a7656", SEAT = "#8a8173";
var CAR_P = "M0 -42 L0 -80 Q4 -97 30 -101 L150 -114 L226 -170 Q240 -175 262 -175 L378 -173 L452 -124 L520 -119 Q540 -117 540 -96 L540 -44 L470 -42 A46 46 0 0 0 378 -42 L146 -42 A46 46 0 0 0 54 -42 Z";
var CABIN = "M150 -46 L156 -116 L230 -166 L374 -166 L442 -124 L442 -46 Z";
var WIN_F = "M164 -120 L232 -162 L296 -162 L296 -120 Z", WIN_R = "M306 -120 L306 -162 L372 -162 L436 -124 L436 -120 Z";
function wheel(x, t, spin) { var a = (spin || 0) * t * 200, s = C(x, -38, 38, "#3a352e", 2.4) + C(x, -38, 24, "#a9a59c", 2) + C(x, -38, 7, INK, 0);
  for (var i = 0; i < 5; i++) { var b = (a + i * 72) * Math.PI / 180; s += '<path d="M' + f(x + Math.cos(b) * 8) + ' ' + f(-38 + Math.sin(b) * 8) + ' L' + f(x + Math.cos(b) * 21) + ' ' + f(-38 + Math.sin(b) * 21) + '" stroke="' + INK + '" stroke-width="3"/>'; } return s; }
// a seated person (real proportions, H = 1.75 m = 210 units → s = .525); facing the front (left)
function seated(hx, hy, s, o) {
  o = o || {}; return fig({ x: hx, y: hy, s: s, lean: o.lean == null ? -14 : o.lean, shirt: o.shirt || SHIRT_V, hair: o.hair, legs: o.legs || [[78, -70], [74, -66]], hands: o.hands || [[192, -106], [196, -104]], bend: o.bend || [1, 1], tilt: o.tilt || 0, mouth: o.mouth });
}
// the whole car scene. o: {x, y (car centre in the world), pitch (deg, − = nose down), t, sea (world y of the water surface),
//   inside (local y of the water inside), win (0 closed … 1 down, front window), winR, broken (0..1 the front window shatters),
//   people (fn → local SVG), belt (0 on … 1 off), hlDoor, spin, dark}
function car(o) {
  var t = o.t || 0, s = "", g = "";
  g += '<ellipse cx="270" cy="2" rx="260" ry="8" fill="' + INK + '" opacity="' + (o.sea == null ? .14 : 0) + '"/>';
  g += P(CAR_P, BODY, 2.6);
  g += '<path d="' + CAR_P + '" fill="url(#hatch)" opacity=".35"/>';
  // the cut-away cabin: lighter, with the seats, the dashboard and the people
  g += P(CABIN, "#efe6d2", 1.6);
  var id = "cab" + (++CLIPN); g += '<clipPath id="' + id + '"><path d="' + CABIN + '"/></clipPath><g clip-path="url(#' + id + ')">';
  g += P("M150 -96 L198 -100 L200 -84 L152 -70 Z", "#7c7468", 1.6);   // dashboard
  g += P("M212 -66 L276 -66 L280 -52 L214 -50 Z", SEAT, 1.6) + P("M272 -66 L292 -146 Q300 -150 304 -142 L292 -58 Z", SEAT, 1.6) + R(290, -160, 16, 18, SEAT, 1.4, 4);   // front seat
  g += P("M350 -64 L420 -64 L424 -50 L352 -48 Z", SEAT, 1.6) + P("M414 -64 L428 -140 Q436 -144 440 -136 L432 -56 Z", SEAT, 1.6);   // rear seat
  if (o.people) g += o.people(t);
  if (o.inside != null) { var lv = o.inside; g += '<g transform="rotate(' + f(-(o.pitch || 0)) + ' 300 ' + f(lv) + ')"><rect x="-200" y="' + f(lv) + '" width="900" height="400" fill="' + WATER + '" opacity=".72"/><path d="M-200 ' + f(lv) + ' H700" stroke="#e8eef0" stroke-width="2.4"/></g>'; }
  g += '</g>';
  // steering wheel over the driver's hands
  g += '<ellipse cx="194" cy="-104" rx="6" ry="22" transform="rotate(-24 194 -104)" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M194 -104 L176 -92" stroke="' + INK + '" stroke-width="4"/>';
  // windows: glass over the cabin; the front glass slides down, or shatters
  var w = clamp(o.win || 0), wr = clamp(o.winR || 0), br = o.broken || 0;
  var idf = "wf" + (++CLIPN); g += '<clipPath id="' + idf + '"><path d="' + WIN_F + '"/></clipPath>';
  if (br < 1) g += '<g clip-path="url(#' + idf + ')"><rect x="150" y="' + f(-166 + 48 * w) + '" width="160" height="48" fill="' + GLASS + '" opacity=".55"/>' + (w < .9 ? '<path d="M180 ' + f(-150 + 48 * w) + ' l26 -14 M200 ' + f(-140 + 48 * w) + ' l20 -11" stroke="#fff" stroke-width="3" opacity=".8"/>' : "") + (br > 0 ? crackS(286, -126, br) : "") + '</g>';
  var idr = "wr" + (++CLIPN); g += '<clipPath id="' + idr + '"><path d="' + WIN_R + '"/></clipPath><g clip-path="url(#' + idr + ')"><rect x="300" y="' + f(-166 + 48 * wr) + '" width="140" height="48" fill="' + GLASS + '" opacity=".55"/></g>';
  g += P(WIN_F, "none", 2.2) + P(WIN_R, "none", 2.2) + R(296, -164, 10, 120, BODY, 2);   // frames and the B-pillar
  // doors, handles, wheels, lights
  g += '<path d="M156 -118 L152 -48 M296 -118 L296 -46 M444 -122 L440 -60 Q420 -50 392 -50" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' + R(254, -100, 22, 6, INK, 0, 3) + R(398, -100, 22, 6, INK, 0, 3);
  if (o.hlDoor) g += P("M156 -118 L296 -118 L296 -46 L152 -48 Z", ORANGE, 0, ' opacity="' + f(.35 * o.hlDoor) + '"');
  g += P("M4 -86 L24 -94 L26 -84 L6 -80 Z", "#f4efe3", 1.4) + R(528, -110, 12, 16, ORANGE, 1.4);
  g += wheel(100, t, o.spin) + wheel(424, t, o.spin);
  s += G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.pitch || 0) + ") translate(-270 90)", g);
  if (o.sea != null) s += sea(o.sea, t, o.dark);
  return s;
}
function sea() { return ""; }
function crackS(x, y, k) { var s = ""; for (var i = 0; i < 9; i++) { var a = i * 0.7 + .3, l = 70 * clamp(k * 1.4) * (.6 + hash(i) * .6); s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * l * .5 + 4) + ' ' + f(y + Math.sin(a) * l * .5) + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>'; } return s; }
// the driver in the car (car-local), with the seat belt across the chest; belt: 0 on … 1 off
function driver(belt, o) { o = o || {}; var d = seated(262, -66, .525, o), sh = d.at(110, -18), hp = d.at(6, 18), k = clamp(belt || 0);
  var end = [lerp(hp[0], 296, k), lerp(hp[1], -148, k)];
  return d.far + d.body + '<path d="M298 -150 L' + f(sh[0]) + ' ' + f(sh[1]) + ' L' + f(end[0]) + ' ' + f(end[1]) + '" stroke="#3a352e" stroke-width="7" fill="none" stroke-linejoin="round" opacity="' + (k >= 1 ? 0 : 1) + '"/>' + R(hp[0] - 6, hp[1] - 6, 14, 12, "#9aa2ac", 1.4, 2) + d.near; }

// ── the engine: one cylinder cut through the middle, side view. Real proportions of a 1.6 L four-cylinder
// (bore 80 mm, stroke 85 mm, rod 145 mm, compression height 30 mm, compression 10:1) at 2.4 units per mm.
var E = { cx: 320, cy: 640, r: 102, L: 348, ch: 72, x0: 224, x1: 416, deck: 112, roof: 84 };
var METAL = "#b9b7ae", METAL_D = "#8f8d85", IRON = "#d3cbb6", GAS0 = "#ebe4d2", JACKET = "#7f9fb3";
function pinY(th) { var a = th * Math.PI / 180, x = E.r * Math.sin(a); return E.cy - E.r * Math.cos(a) - Math.sqrt(E.L * E.L - x * x); }
function pistonTop(th) { return pinY(th) - E.ch; }
function gasPath(top) { return "M" + E.x0 + " " + f(top) + " L" + E.x0 + " " + E.deck + " L254 " + E.deck + " L290 " + E.roof + " L350 " + E.roof + " L386 " + E.deck + " L" + E.x1 + " " + E.deck + " L" + E.x1 + " " + f(top) + " Z"; }
function heatCol(h) { h = clamp(h); var a = [235, 228, 210], b = [231, 170, 125], c = a.map(function (v, i) { return Math.round(lerp(v, b[i], h)); }); return "rgb(" + c.join(",") + ")"; }
// a flame ball: orange body, a lighter core, a ragged front that flickers with t
function flameBall(x, y, r, t, col) {
  if (r <= 1) return ""; var d = "", n = 22;
  for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * (1 + .07 * Math.sin(a * 5 + t * 14) + .04 * Math.sin(a * 9 - t * 9)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  return '<path d="' + d + ' Z" fill="' + (col || "#e0874a") + '" stroke="' + ORANGE + '" stroke-width="2.4" opacity=".92"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .55) + '" fill="#f1c27a" opacity=".85"/>';
}
// o: {th (crank deg, 0 = top), t, mix (0..1 the dots of fuel and air), heat (0..1), spark (0..1), flame (0..1), knock (0..1), clash (0..1),
//     shake (px), hl: "piston" | "plug" | "gas" | "far" | "sensor", sensor (0..1 show the knock sensor), ear (0..1 its waves), dimHead}
function engine(o) {
  var dr = o.drop || 0, th = o.th || 0, t = o.t || 0, top = pistonTop(th) + dr, py = pinY(th) + dr, a = th * Math.PI / 180, ccy = E.cy + dr, cp = [E.cx + E.r * Math.sin(a), ccy - E.r * Math.cos(a)], sx = o.shake || 0, s = "";
  // crankcase: a rounded sump under the cylinder (reference v18)
  s += P("M150 420 L490 420 L490 560 Q490 820 320 820 Q150 820 150 560 Z", "#e2d9c3", 2.4) + '<path d="M150 420 L490 420 L490 560 Q490 820 320 820 Q150 820 150 560 Z" fill="url(#hatch)" opacity=".25"/>';
  // cylinder walls (block) with the water jacket, hatched like a cut
  [[150, E.x0], [E.x1, 490]].forEach(function (w) { s += R(w[0], E.deck, w[1] - w[0], 420 - E.deck, IRON, 2.2) + '<rect x="' + w[0] + '" y="' + E.deck + '" width="' + (w[1] - w[0]) + '" height="' + (420 - E.deck) + '" fill="url(#hatch)"/>' + R(w[0] + 22, E.deck + 20, 26, 230, JACKET, 1.6, 6); });
  // head: hatched block, two ports (exhaust left, intake right)
  s += R(130, 2, 380, E.deck - 2, IRON, 2.4) + '<rect x="130" y="2" width="380" height="' + (E.deck - 2) + '" fill="url(#hatch)"/>';
  s += P("M130 40 Q200 38 236 70 L268 100 L252 110 L226 84 Q196 64 130 70 Z", "#cfc5ad", 1.8) + P("M510 40 Q440 38 404 70 L372 100 L388 110 L414 84 Q444 64 510 70 Z", "#cfc5ad", 1.8);
  // the gas in the cylinder: tint by heat, fuel and air dots squeezed between roof and piston
  var gp = gasPath(top), id = "gas" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + gp + '"/></clipPath>' + '<path d="' + gp + '" fill="' + heatCol(o.heat || 0) + '" stroke="' + INK + '" stroke-width="2"/>';
  var g = "";
  if (o.mix) { for (var i = 0; i < 46; i++) { var u = hash(i), v = hash(i + 50), x = lerp(E.x0 + 10, E.x1 - 10, u) + 4 * Math.sin(t * 3 + i), y = lerp(E.roof + 8, top - 8, v) + 4 * Math.cos(t * 2.6 + i * 1.7);
      g += i % 3 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4.5" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>' : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="5" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/>'; }
    g = G("", g, clamp(o.mix)); }
  if (o.flame) g += flameBall(320, 92, o.flame * 330, t);
  if (o.knock) g += flameBall(E.x0 + 18, top - 14, o.knock * 120, t + 1, "#c9643a");
  if (o.hl === "far") g += '<circle cx="' + (E.x0 + 26) + '" cy="' + f(top - 22) + '" r="' + f(34 + 4 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="7 5"/>';
  s += '<g clip-path="url(#' + id + ')">' + g + '</g>';
  if (o.clash) s += impact(lerp(E.x0 + 60, 300, .3), top - 26, o.clash, ORANGE);
  // piston: crown, three ring grooves, skirt, wrist pin
  var pk = G("translate(" + f(sx) + " 0)", R(E.x0 + 4, top, E.x1 - E.x0 - 8, 132, o.hl === "piston" ? "#c8a184" : METAL, 2.4, 3) +
    [12, 24, 36].map(function (d) { return '<path d="M' + (E.x0 + 4) + ' ' + f(top + d) + ' H' + (E.x1 - 4) + '" stroke="' + INK + '" stroke-width="2"/>'; }).join("") +
    (o.crack ? '<path d="M300 ' + f(top) + ' l10 18 l-8 12 l12 16" stroke="' + INK + '" stroke-width="3" fill="none"/>' + P("M282 " + f(top - 1) + " q16 14 34 0 Z", "#3a352e", 1.6) : "") +
    C(320, py, 20, METAL_D, 2.2) + C(320, py, 8, INK, 0));
  // rod: from the wrist pin to the crank pin
  var dx = cp[0] - 320, dy = cp[1] - py, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  var rod = "M" + f(320 + nx * 14) + " " + f(py + ny * 14) + " L" + f(cp[0] + nx * 22) + " " + f(cp[1] + ny * 22) + " L" + f(cp[0] - nx * 22) + " " + f(cp[1] - ny * 22) + " L" + f(320 - nx * 14) + " " + f(py - ny * 14) + " Z";
  // crank: counterweight sector opposite the pin, the pin, the main journal
  var cw = "M" + f(E.cx) + " " + f(ccy) + " L" + f(E.cx + 128 * Math.sin(a + 2.3)) + " " + f(ccy - 128 * Math.cos(a + 2.3)) + " A128 128 0 0 1 " + f(E.cx + 128 * Math.sin(a + 3.98)) + " " + f(ccy - 128 * Math.cos(a + 3.98)) + " Z";
  s += P(cw, "#a9a59c", 2.4) + '<path d="' + cw + '" fill="url(#hatch)" opacity=".5"/>' + C(E.cx, ccy, 34, METAL, 2.4) + pk + P(rod, METAL, 2.4) + C(cp[0], cp[1], 26, METAL_D, 2.4) + C(cp[0], cp[1], 9, INK, 0) + C(E.cx, ccy, 10, INK, 0);
  // valves: stems through the head, discs on the two roof slopes
  [[270, 97, -1], [370, 97, 1]].forEach(function (v) { var ux = .6 * v[2], uy = -.8; s += '<path d="M' + f(v[0] + ux * 8) + ' ' + f(v[1] + uy * 8) + ' L' + f(v[0] + ux * 120) + ' ' + f(v[1] + uy * 120) + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M' + f(v[0] + ux * 8) + ' ' + f(v[1] + uy * 8) + ' L' + f(v[0] + ux * 120) + ' ' + f(v[1] + uy * 120) + '" stroke="' + METAL + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M' + f(v[0] - .8 * 20 * v[2]) + ' ' + f(v[1] - .6 * 20) + ' L' + f(v[0] + .8 * 20 * v[2]) + ' ' + f(v[1] + .6 * 20) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/>'; });
  // spark plug: terminal, white insulator, hex, thread into the roof, electrode
  var hp = o.hl === "plug";
  s += R(312, -60, 16, 18, INK, 0, 3) + R(306, -44, 28, 64, hp ? "#f2d3b8" : "#f4efe3", 2.2, 8) + R(296, 18, 48, 24, METAL_D, 2.2) + R(302, 42, 36, 40, METAL, 2) + '<path d="M302 52 h36 M302 62 h36 M302 72 h36" stroke="' + INK + '" stroke-width="1.4"/>' + '<path d="M320 82 v10 M312 96 h14 v-6" stroke="' + INK + '" stroke-width="4" fill="none"/>';
  if (o.spark) { var k = clamp(o.spark); for (var j = 0; j < 8; j++) { var b = j * Math.PI / 4 + t * 3; s += '<path d="M' + f(320 + Math.cos(b) * 6) + ' ' + f(98 + Math.sin(b) * 6) + ' L' + f(320 + Math.cos(b) * (10 + 26 * k)) + ' ' + f(98 + Math.sin(b) * (10 + 26 * k)) + '" stroke="#f0b33c" stroke-width="4" stroke-linecap="round" opacity="' + f(k) + '"/>'; } }
  // knock sensor: a puck bolted to the side of the block with its plug, and the sound it hears
  if (o.sensor) { var sk = clamp(o.sensor); s += appear(sk, R(490, 300, 34, 60, "#3a352e", 2.2, 6) + R(524, 316, 26, 28, "#5b5145", 2, 4) + C(507, 330, 7, METAL, 1.6));
    if (o.ear) for (var w = 0; w < 3; w++) { var p = (t * 1.6 + w / 3) % 1; s += '<path d="M' + f(560 + p * 70) + ' ' + f(300 - p * 30) + ' q' + f(16 + p * 10) + ' ' + f(30 + p * 30) + ' 0 ' + f(60 + p * 60) + '" stroke="' + ORANGE + '" stroke-width="3.4" fill="none" opacity="' + f((1 - p) * clamp(o.ear)) + '"/>'; } }
  return s;
}
// a fuel pump as seen at an Egyptian station: a tall cabinet, a price/litre display, three grades with their nozzles.
// hl: index of a grade to light; big: index of a grade drawn bigger («أقوى؟»)
var GRADES = ["80", "92", "95"], GCOL = ["#9aa86e", "#d9a86a", "#c96a4a"];
function fuelPump(x, y, sc, t, o) {
  o = o || {}; var s = R(-110, -360, 220, 360, "#e3dccb", 2.6, 8) + R(-110, -400, 220, 50, "#5b5145", 2.4, 6) + T("بنزين", 0, -366, 24, "#f4efe3", 800) + R(-80, -330, 160, 70, "#3a352e", 2.2, 4);
  s += N((t * .9 % 40).toFixed(2), 0, -284, 26, "#e8b45a") + T("لتر", 60, -276, 14, "#e8b45a", 700);
  GRADES.forEach(function (g, i) { var gx = -70 + i * 70, on = o.k == null ? 1 : clamp(o.k * 3 - i), big = o.big === i ? 1 + .18 * clamp(o.bigK || 0) : 1;
    s += appear(on, G("translate(" + gx + " -200) scale(" + f(big) + ")", R(-28, -22, 56, 44, GCOL[i], 2, 4) + N(g, 0, 10, 26, INK)) +
      R(gx - 12, -150, 24, 50, "#3a352e", 1.8, 3) + '<path d="M' + gx + ' -100 q-12 70 ' + (-30 + i * 6) + ' 96" stroke="#3a352e" stroke-width="7" fill="none"/>' + P("M" + (gx - 14) + " -160 l28 0 l-6 -26 l-16 0 Z", "#7c7468", 1.6)); });
  s += R(-130, -6, 260, 12, "#a9a59c", 2);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// a bicycle pump: barrel, T-handle pushed down by p (0..1), the air dots squeezed under the plunger, a warm barrel
function bikePump(x, y, p, t, heat) {
  var top = lerp(-300, -120, p), s = "";
  s += R(-46, -320, 92, 320, "#e9e1cc", 2.6, 6);
  s += '<rect x="-40" y="' + f(top + 14) + '" width="80" height="' + f(-6 - top - 14) + '" fill="' + heatCol(heat) + '"/>';
  for (var i = 0; i < 26; i++) { var yy = lerp(top + 22, -14, hash(i + 3)) + 3 * Math.sin(t * 4 + i), xx = -30 + 60 * hash(i) + 3 * Math.cos(t * 3 + i); s += '<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="4" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>'; }
  s += R(-42, top, 84, 14, "#3a352e", 2) + R(-6, top - 190, 12, 190, METAL, 2) + R(-90, top - 214, 180, 28, "#3a352e", 2.4, 12);
  s += P("M46 -40 q90 0 90 80 q0 40 40 40", "none", 7) + R(-80, -6, 160, 14, "#5b5145", 2, 4);
  if (heat > .2) for (var j = 0; j < 3; j++) s += '<path d="M' + (66 + j * 18) + ' ' + f(-90 - 8 * Math.sin(t * 4 + j)) + ' q-10 -16 0 -32 q10 -16 0 -32" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(clamp(heat)) + '"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", s);
}
// a gauge (needle 0..1) with a label under it
function gauge(x, y, r, v, lab, col) {
  var a = Math.PI * (1 + clamp(v)), s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i <= 6; i++) { var b = Math.PI * (1 + i / 6); s += '<path d="M' + f(x + Math.cos(b) * r * .78) + ' ' + f(y + Math.sin(b) * r * .78) + ' L' + f(x + Math.cos(b) * r * .92) + ' ' + f(y + Math.sin(b) * r * .92) + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y + Math.sin(a) * r * .8) + '" stroke="' + (col || ORANGE) + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0) + T(lab, x, y + 30, 22, INK, 700);
}
// a tolerance bar: how much squeeze a grade takes before it lights by itself
function tolBar(x, y, w, k, g, col) { return R(x, y - 22, 120, 44, col, 2, 4) + N(g, x + 60, y + 10, 28, INK) + R(x + 134, y - 16, Math.max(1, w * clamp(k)), 32, ORANGE, 2) + '<rect x="' + (x + 134) + '" y="' + (y - 16) + '" width="' + f(Math.max(1, w * clamp(k))) + '" height="32" fill="url(#hatch)" opacity=".5"/>'; }
// a road on a slope (deg), the car climbing it
function hill(ang) { return G("rotate(" + ang + " 320 470)", R(-400, 470, 1440, 30, "#6a665e", 2.4) + R(-400, 500, 1440, 500, "#d9cfb6", 2) + '<rect x="-400" y="500" width="1440" height="500" fill="url(#hatch)" opacity=".4"/>' + '<path d="M-380 485 h60 M-260 485 h60 M-140 485 h60 M-20 485 h60 M100 485 h60 M220 485 h60 M340 485 h60 M460 485 h60 M580 485 h60 M700 485 h60" stroke="#e8e1cf" stroke-width="3"/>'); }
// a manual book and a filler flap with its sticker
function manual(x, y, sc) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", R(-80, -110, 160, 220, "#5b6f7c", 2.6, 6) + R(-62, -96, 124, 34, "#f4efe3", 1.6) + T("كتالوج", 0, -72, 22, INK, 800) + P("M-40 0 q40 -40 80 0 l-12 14 h-56 Z", "#d8ccae", 2) + C(-22, 22, 12, "#3a352e", 1.6) + C(22, 22, 12, "#3a352e", 1.6) + R(-80, 100, 160, 10, "#e9e1cc", 1.6)); }
function flap(x, y, sc, k, g) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", R(-110, -110, 220, 220, BODY, 2.6, 12) + C(0, 0, 70, "#3a352e", 2.4) + C(0, 0, 40, "#5b5145", 2) + R(-14, -50, 28, 100, "#7c7468", 1.6, 6) +
  G("translate(-150 0) rotate(" + f(-60 * clamp(k)) + " 40 0)", R(-90, -100, 130, 200, BODY, 2.4, 12) + R(-70, -40, 90, 80, "#f4efe3", 1.8, 4) + T("بنزين", -25, -12, 18, INK, 800) + N(g, -25, 28, 30, ORANGE))); }
// a coin
function coin(x, y, r) { return C(x, y, r, "#d8b25c", 2) + C(x, y, r * .7, "none", 1.2); }
// a generic WWII-era single-engine fighter in profile, nose to the left
function plane(x, y, sc, t) { var s = P("M-170 0 Q-160 -24 -110 -26 L120 -16 L176 -60 L196 -60 L186 -10 L200 4 L120 10 L-110 24 Q-160 22 -170 0 Z", "#8a8f74", 2.4) + P("M-60 -26 Q-30 -56 20 -50 L40 -22 Z", GLASS, 2) + P("M-80 8 L60 8 L40 34 L-60 34 Z", "#6f745c", 2) + R(-184, -14, 16, 28, "#3a352e", 1.6, 4);
  var a = t * 40; s += '<ellipse cx="-188" cy="0" rx="6" ry="' + f(64 * Math.abs(Math.cos(a))) + '" fill="#3a352e" opacity=".75"/>' + C(-100, 0, 0, INK, 0) + '<circle cx="60" cy="0" r="14" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><circle cx="60" cy="0" r="6" fill="' + ORANGE + '"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }
// two liters side by side: the bars of energy match
function litre(x, y, g, col, k) { return R(x - 50, y - 160, 100, 160, "#f4efe3", 2.4, 8) + '<rect x="' + (x - 48) + '" y="' + f(y - 150 * clamp(k)) + '" width="96" height="' + f(150 * clamp(k)) + '" fill="' + col + '" opacity=".75"/>' + R(x - 20, y - 186, 40, 26, "#3a352e", 2, 3) + N(g, x, y - 60, 34, INK) + T("1 لتر", x, y + 30, 20, INK, 700); }

// ── shots (one per idea; line numbers from script.txt) ──
var ENG = function (z1, z2, cy) { return push(320, cy || 380, z1, z2); };
// 4 · «قاعدة صغيرة»: a pinned rule card over a faint pump
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(.8, bikePump(320, 700, .3, t, 0)) + G("", '<rect x="130" y="180" width="380" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 265)"/>' +
    T("تضغطه بسرعة", 320, 246, 38, INK, 800) + T("يسخن", 320, 306, 44, ORANGE, 800) + C(320, 188, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · a bicycle pump: the plunger goes down, the air under it squeezes and the barrel warms
shot(5, push(320, 470, 1.1, 1.0), function (u, d, t) {
  var p = .5 - .5 * Math.cos(u * 2.6), h = clamp(u / d * 1.3) * (.4 + .6 * p);
  return paper() + bikePump(300, 720, p, t, h) + label(346, 600, 470, 640, "الهوا اتضغط", BLUE, at(u, .6, .5), 24) + label(300, 400, 470, 360, "سخن", ORANGE, at(u, 1.6, .5), 26);
}, { tr: "in" });
// 6 · the engine: the piston rises from the bottom and squeezes fuel and air to about a tenth
shot(6, ENG(.86, .92, 360), function (u, d, t) {
  var k = clamp((u - .6) / (d - 1.2)), th = 180 + 180 * ease(k);
  return paper() + appear(at(u, 0, .5), engine({ th: th, t: t, mix: 1, heat: k * .5, hl: "piston" })) +
    label(410, pistonTop(th) + 60, 500, pistonTop(th) + 150, "المكبس", OLIVE, at(u, .3, .5), 26) + G("", numBox("1/10", 560, 200, 1, 34), at(u, d - 1.4, .4));
});
// 7 · the mixture is hot; the spark plug fires at the right moment
shot(7, ENG(1.2, 1.3, 200), function (u, d, t) {
  var sp = u > d * .45 ? Math.abs(Math.sin((u - d * .45) * 9)) : 0;
  return paper() + engine({ th: 4 * Math.sin(t * 1.2), t: t, mix: 1, heat: .55 + .1 * Math.sin(t * 2), spark: sp, hl: u > d * .4 ? "plug" : "gas" }) +
    label(334, -10, 420, -60, "البوجيه", OLIVE, at(u, d * .4, .5), 26) + label(380, 104, 430, 190, "سخن جامد", ORANGE, at(u, .3, .5), 22);
});
// 8 · normal burning: one flame spreads from the plug and pushes the piston down
shot(8, ENG(.95, .88, 360), function (u, d, t) {
  var k = clamp(u / (d * .7)), th = 150 * ease(clamp((u - .4) / (d - .8)));
  return paper() + engine({ th: th, t: t, mix: 1 - k, heat: .7, flame: lerp(.05, 1, k) }) + arrow(320, pistonTop(th) + 40, 320, pistonTop(th) + 120, ORANGE, 8, at(u, 1, .4)) + check(540, 160, 1.4, at(u, d - 1, .5));
}, { tr: "out" });
// 9 · weak fuel: the far corner, squeezed and hot, lights by itself before the flame gets there
shot(9, ENG(1.0, 1.1, 300), function (u, d, t) {
  var kf = clamp(u / d) * .35, kn = clamp((u - d * .55) / (d * .35));
  return paper() + engine({ th: 6, t: t, mix: 1 - kn * .5, heat: .8, flame: .05 + kf, knock: kn * .8, hl: kn < .1 && u > 1 ? "far" : "" }) +
    label(E.x0 + 26, pistonTop(6) - 22, 200, 250, "الحتة البعيدة", ORANGE, at(u, 1, .5), 22) + G("", tag("ولّعت لوحدها", 440, 230, 1, 24, ORANGE), at(u, d * .65, .4));
});
// 10 · two flame fronts crash into each other: a hammer blow on the piston
shot(10, ENG(1.2, 1.08, 300), function (u, d, t) {
  var b = (u * 3) % 1, sh = u > .4 ? 5 * Math.sin(u * 60) * (1 - b) : 0;
  return paper() + engine({ th: 6, t: t, heat: .9, flame: .55, knock: .9, clash: u > .3 ? b : 0, shake: sh, hl: "piston" }) +
    iconBox(470, 520, 130, G("rotate(" + f(-30 + 30 * Math.abs(Math.sin(u * 6))) + " 20 40)", R(-8, -10, 16, 80, WOOD, 2) + R(-40, -36, 80, 30, "#5b5145", 2, 4)), at(u, .8, .3));
}, { tr: "in" });
// 11 · the sound you hear going uphill: «تك تك»
shot(11, push(320, 400, .82, .9), function (u, d, t) {
  var s = paper() + hill(8) + car({ x: 330, y: 382, pitch: 8, t: t, spin: 1, people: function () { return driver(0); } });
  for (var i = 0; i < 3; i++) { var k = at(u, .3 + i * .45, .25); if (k > 0) s += G("translate(" + (150 + i * 70) + " " + (250 - i * 40 + 4 * Math.sin(t * 8 + i)) + ")", tag("تك", 0, 0, k, 30, ORANGE)); }
  return s;
});
// 12 · the octane number: how much squeeze the fuel takes before it lights by itself
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = .5 - .5 * Math.cos(u * 2.2);
  return paper() + G("translate(80 120) scale(.75)", bikePump(0, 560, k, t, k)) + tag("الأوكتان", 400, 210, at(u, .3, .4), 40, BLUE) + T("= قد إيه يستحمل", 400, 300, 32, INK, 800) + T("من غير ما يولّع لوحده", 400, 350, 26, MUTE, 700) +
    G("", gauge(400, 520, 90, .25 + .6 * k, "ضغط"), at(u, 1, .4));
});
// 13 · 80 < 92 < 95: three tolerance bars
shot(13, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + T("بيستحمل قد إيه؟", 320, 170, 34, INK, 800) + tolBar(60, 300, 260, at(u, .2, .8) * .55, "80", GCOL[0]) + tolBar(60, 420, 260, at(u, .9, .8) * .78, "92", GCOL[1]) + tolBar(60, 540, 260, at(u, 1.8, .8) * (.92 + .02 * Math.sin(t * 3)), "95", GCOL[2]);
});
// 14 · every engine squeezes by a different amount: two cylinders side by side
shot(14, push(320, 400, .98, 1.04), function (u, d, t) {
  var th = 180 + 180 * (.5 - .5 * Math.cos(u * 1.8));
  return paper() + G("translate(10 170) scale(.48)", engine({ th: th, t: t, mix: 1, heat: .3, drop: 26 })) + G("translate(320 170) scale(.48)", engine({ th: th, t: t + 1, mix: 1, heat: .7 })) +
    G("", numBox("8:1", 165, 140, 1, 28) + numBox("11:1", 475, 140, 1, 28), at(u, .5, .4)) + T("ضغط قليل", 165, 620, 26, OLIVE, 800) + T("ضغط عالي", 475, 620, 26, ORANGE, 800);
});
// 15 · old engine → 80 is fine; modern and turbo → a higher number
shot(15, push(320, 400, 1.04, .98), function (u, d, t) {
  var th = 180 + 180 * (.5 - .5 * Math.cos(u * 1.8)), k = at(u, d * .45, .5);
  return paper() + G("translate(10 170) scale(.48)", engine({ th: th, t: t, mix: 1, heat: .3, drop: 26 })) + G("translate(320 170) scale(.48)", engine({ th: th, t: t + 1, mix: 1, heat: .7 })) +
    tag("قديم", 165, 120, 1, 26) + tag("حديث · تيربو", 475, 120, 1, 26) + numBox("80", 165, 660, at(u, .4, .3), 34) + check(240, 650, .8, at(u, .8, .4)) +
    G("", numBox("92", 430, 660, 1, 34) + numBox("95", 530, 660, 1, 34), k);
});
// 16 · your number: in the manual, and on the filler flap
shot(16, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + manual(170, 380, 1.1 + .02 * Math.sin(t * 2)) + flap(470, 400, 1, at(u, .8, .8), "95") + label(380, 410, 420, 600, "غطا التانك", OLIVE, at(u, 1.4, .4), 22);
});
// 17 · lower than asked: the knock sensor hears it and moves the spark later
shot(17, ENG(.86, .92, 380), function (u, d, t) {
  var late = at(u, d * .55, .8), sp = Math.abs(Math.sin(u * 5)) * late;
  return paper() + engine({ th: lerp(4, 20, late), t: t, mix: .6, heat: .7, flame: .2 + .1 * Math.sin(t * 4) * (1 - late), knock: (1 - late) * .5, sensor: at(u, .4, .5), ear: 1 - late, spark: sp }) +
    label(507, 360, 440, 520, "حساس التكتكة", OLIVE, at(u, .8, .5), 22) + G("", tag("الشرارة تتأخر", 470, 140, 1, 24, ORANGE), late);
});
// 18 · safe, but weaker and thirstier; keep knocking and the piston crown can crack
shot(18, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, 1.4), cr = at(u, d * .55, .5);
  return paper() + G("", gauge(170, 300, 110, lerp(.8, .45, k), "العزم") + gauge(470, 300, 110, lerp(.4, .8, k), "الصرف"), 1 - cr * .7) +
    inset(320, 600, 150, G("translate(-320 -150) scale(1)", engine({ th: 0, t: t, crack: cr > 0, heat: .6 })), cr);
});
// 19 · higher than asked: no harm… and no benefit
shot(19, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + fuelPump(320, 720, 1.0, t, { big: 2, bigK: 1, k: 1 }) + G("", tag("ضرر", 160, 150, 1, 32) + cross(160, 230, .9, at(u, d * .4, .4)), at(u, d * .3, .3)) + G("", tag("فايدة", 480, 150, 1, 32) + cross(480, 230, .9, at(u, d * .75, .4)), at(u, d * .65, .3));
});
// 20 · the myth: «more energy» — crossed out
shot(20, push(320, 400, 1.06, .98), function (u, d, t) {
  return paper() + litre(320, 520, "95", GCOL[2], 1) + G("", tag("طاقة أكتر؟", 320, 220, 1, 40, ORANGE), at(u, .2, .4)) + arrow(320, 330, 320, 290 - 8 * Math.sin(t * 4), ORANGE, 6, 1) + cross(320, 240, 1.8, at(u, d * .7, .5));
});
// 21 · a litre of each holds about the same energy; the extra money buys nothing
shot(21, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, 1.2), s = paper() + litre(200, 480, "92", GCOL[1], k) + litre(440, 480, "95", GCOL[2], k) + T("≈", 320, 420, 70, ORANGE, 800);
  for (var i = 0; i < 4; i++) { var p = clamp((u - d * .55 - i * .2) / 1); if (p > 0) s += coin(440 + 60 * p + i * 10, 240 - 140 * p + 10 * Math.sin(t * 5 + i), 22); }
  return s;
});
// 22 · 98 abroad: same idea, for engines that squeeze harder (sports cars)
shot(22, push(320, 420, .92, 1.0), function (u, d, t) {
  return paper() + R(-400, 470, 1440, 30, "#6a665e", 2.4) + R(-400, 500, 1440, 400, "#d9cfb6", 0) + car({ x: 330 - 30 * u, y: 430, pitch: 0, t: t, spin: 1 }) + numBox("98", 320, 200, at(u, .3, .3), 54) + T("في دول برا", 320, 270, 26, MUTE, 700) + G("", numBox("12:1", 530, 330, 1, 26), at(u, d * .55, .4));
});
// 23 · «يعني من الآخر»: not strength, tolerance — the number in the manual, no less, no more
shot(23, push(320, 400, .98, 1.04), function (u, d, t) {
  return paper() + G("", T("قوة", 190, 215, 44, INK, 800) + cross(190, 185, 1, at(u, .5, .4)), at(u, .1, .3)) + G("", tag("تحمّل", 450, 200, 1, 44, BLUE), at(u, 1, .3)) +
    manual(320, 470, .9) + G("", T("لا أقل", 150, 470, 30, INK, 800) + T("ولا أكتر", 490, 470, 30, INK, 800), at(u, d * .55, .4));
});
// 24 · the odd fact: 100-octane fuel let the RAF raise the boost of its fighters
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, d * .45, 1.5);
  return paper() + plane(330 - 120 * k, 380 + 8 * Math.sin(t * 2), 1.2, t) + numBox("100", 320, 170, at(u, .6, .3), 50) + T("1940", 320, 640, 30, MUTE, 800) +
    G("", wave(460 - 120 * k, 360, 640, 360, t, MUTE, 4, 30, 1, 2) + wave(460 - 120 * k, 400, 640, 400, t, MUTE, 4, 30, 1, 2), k);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the pump with its three grades lighting one by one. line 1: 95 grows — «أقوى؟». line 2: «قوة» crossed out
  var u0 = t - LN[0].start, s = fuelPump(220, 640, 1.25, t, { k: li === 0 ? clamp((u0 - .8) / 2.4) : 1, big: li >= 1 ? 2 : -1, bigK: li >= 1 ? ease((t - LN[1].start) / .6) : 0 });
  if (li >= 1) { var u1 = t - LN[1].start; s += tag("أقوى؟", 480, 170, ease(u1 / .4), 40, ORANGE) + arrow(470, 230, 470, 160 - 6 * Math.sin(t * 4), ORANGE, 6, ease((u1 - .3) / .4)); }
  if (li >= 2) { var u2 = t - LN[2].start; s += cross(480, 170, 1.6, ease((u2 - .5) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 196) scale(.3)", fuelPump(0, 0, 1, t, { big: 2, bigK: .5 + .5 * Math.sin(t * 3) })); };
SCENE.outro = function (svg, u, t) {
  return G("translate(170 30) scale(.27)", engine({ th: 6, t: t, heat: .6, flame: .3, knock: .5, sensor: 1 })) +
    callout("1", 300, 30, ease(u / .3)) + callout("2", 330, 170, ease(u / .3 - .5)) + callout("3", 200, 100, ease(u / .3 - 1)) + callout("4", 340, 110, ease(u / .3 - 1.5)) +
    numBox("80", 440, 70, 1, 22) + numBox("92", 440, 140, 1, 22) + numBox("95", 440, 210, 1, 22) + '<path d="M500 60 V220" stroke="' + ORANGE + '" stroke-width="4"/>' + arrow(520, 220, 520, 70, ORANGE, 4, 1);
};
