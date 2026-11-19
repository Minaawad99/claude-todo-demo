window.CHUNKS = [[0.0], [0.0, 0.619], [0.0, 0.5455], [0.0, 0.4194], [0.0, 0.1961, 0.5686], [0.0, 0.3333], [0.0, 0.3654], [0.0, 0.1455, 0.4727], [0.0, 0.5952], [0.0], [0.0, 0.3636], [0.0, 0.5806, 0.871], [0.0, 0.3871], [0.0, 0.6667], [0.0, 0.4697], [0.0, 0.4118, 0.6863], [0.0, 0.2222, 0.6296], [0.0], [0.0, 0.2292], [0.0], [0.0, 0.5397], [0.0, 0.4571], [0.0, 0.3], [0.0, 0.449], [0.0, 0.4065, 0.5935, 0.813], [0.0], [0.0]];
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

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the throat: mid-line cut of head and neck, face to the left ──
// o: {ep: 0 open … 1 closed, food: [x,y] | null, air: 0..1 (air running in the windpipe), hl: "food" | "air" | "ep", water, finger}
var MOUTH = [118, 330], FOOD_OK = [[150, 318], [250, 300], [318, 318], [345, 380], [352, 470], [350, 560], [350, 700], [350, 820]],
    FOOD_BAD = [[150, 318], [250, 300], [318, 318], [330, 380], [300, 470], [290, 520]];
function throat(t, o) {
  o = o || {}; var s = "";
  var head = "M250 40 C380 30 482 92 490 200 C496 282 470 332 452 380 L452 800 L250 800 L250 560 C250 522 232 492 202 472 C172 456 142 452 122 442 C102 432 96 406 110 392 C100 382 96 366 106 356 C94 350 92 336 102 326 C96 312 92 302 86 292 C60 287 50 270 70 255 C86 222 110 182 116 150 C122 110 162 52 250 40 Z";
  s += P(head, SKIN, 2.6);
  s += '<path d="' + head + '" fill="url(#hatch)" opacity=".18"/>';
  // spine at the back of the neck
  for (var y = 300; y < 800; y += 46) s += R(398, y, 50, 36, BONE, 1.8, 5) + R(402, y + 36, 42, 10, "#d7a48a", 1.2);
  // air spaces: nose, mouth roof, throat; the windpipe and the gullet below
  s += P("M120 205 C175 178 262 184 334 212 L334 246 C262 238 182 246 126 254 Z", CAV, 2);
  s += P("M108 322 C170 290 262 280 334 250 L334 214 C364 208 386 228 386 262 L386 482 L262 482 L262 462 L300 420 L312 332 Z", CAV, 2);
  // windpipe (front) with cartilage rings
  s += R(262, 478, 56, 330, o.hl === "air" ? AIRC : "#e9e4d8", 2.4);
  for (y = 500; y < 800; y += 28) s += P("M262 " + y + " Q290 " + (y + 9) + " 318 " + y, "none", 5, ' stroke="' + BONE + '"') + P("M262 " + (y - 3) + " Q290 " + (y + 6) + " 318 " + (y - 3), "none", 1.2);
  // gullet (behind): a soft, closed tube that opens where the food is
  var fy = o.food && o.food[0] > 322 && o.food[1] > 478 ? o.food[1] : -999;
  s += R(330, 478, 44, 330, o.hl === "food" ? "#c7b06a" : "#d79b85", 2.4);
  var slit = "M352 482"; for (y = 492; y <= 800; y += 10) { var w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 - w) + " " + y; } s += P(slit, "none", 1.6);
  slit = "M352 482"; for (y = 492; y <= 800; y += 10) { w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 + w) + " " + y; } s += P(slit, "none", 1.6);
  // air running up and down the windpipe and out of the nose
  if (o.air) s += G("", '<path d="M290 800 L290 470 L340 330 L345 240 L250 225 L120 230" fill="none" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 16" stroke-dashoffset="' + f(-t * 46) + '"/>', o.air);
  // hard palate (bone) and soft palate
  s += P("M104 300 C170 288 250 280 312 272", "none", 9, ' stroke="' + INK + '"') + P("M104 300 C170 288 250 280 312 272", "none", 5, ' stroke="' + BONE + '"');
  s += P("M310 268 C330 270 346 290 348 322 C340 330 330 322 322 300 Z", "#d78f7b", 1.8);
  // lower jaw bone
  s += P("M112 410 C150 440 205 466 246 476", "none", 12, ' stroke="' + INK + '" stroke-linecap="round"') + P("M112 410 C150 440 205 466 246 476", "none", 7, ' stroke="' + BONE + '" stroke-linecap="round"');
  // tongue
  s += P("M112 336 C150 300 250 286 296 300 C322 316 316 382 302 420 C292 450 276 464 262 468 C230 468 190 446 150 413 C128 396 114 370 112 336 Z", TONGUE, 2.4);
  s += '<path d="M150 340 C200 318 250 312 285 320" stroke="#a9584b" stroke-width="1.6" fill="none"/><path d="M160 372 C210 352 255 350 290 360" stroke="#a9584b" stroke-width="1.4" fill="none" opacity=".7"/>';
  // the epiglottis: hinged at the front of the voice box, upright when breathing, folded back over the windpipe when swallowing
  var a = lerp(-78, 14, clamp(o.ep || 0)) * Math.PI / 180, px = 266, py = 466, L = 66, nx = Math.cos(a), ny = Math.sin(a), qx = -ny, qy = nx;
  s += P("M" + f(px) + " " + f(py) + " Q" + f(px + nx * L * .5 + qx * 13) + " " + f(py + ny * L * .5 + qy * 13) + " " + f(px + nx * L) + " " + f(py + ny * L) + " Q" + f(px + nx * L * .5 - qx * 6) + " " + f(py + ny * L * .5 - qy * 6) + " " + f(px) + " " + f(py) + " Z", o.hl === "ep" ? OLIVE : "#a3a26a", 2.2);
  // food, water, finger
  if (o.water) s += o.water;
  if (o.food) s += C(o.food[0], o.food[1], 17, FOOD, 2.2) + '<circle cx="' + f(o.food[0] - 5) + '" cy="' + f(o.food[1] - 6) + '" r="4" fill="#fff" opacity=".35"/>';
  if (o.finger) s += o.finger;
  return s;
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
  out.far = arm(1) + (o.noLeg1 ? "" : leg(1));
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
  out.body = (o.noLeg0 ? "" : leg(0)) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// «ليه بتهز رجلك؟» — drawings. Real kinematics of a seated leg bounce:
// the ball of the foot stays on the floor, the calf pulls the heel up (ankle plantar-flexion about the ball),
// the hip stays on the chair, so the knee rises on an arc found by two-bone IK. Anatomy from Gray's-style side views:
// femur, patella, tibia in front, fibula behind it, gastrocnemius over soleus at the back, Achilles to the heel,
// the popliteal artery and vein behind the knee running down as the posterior tibial vessels between bone and calf.
var ART = "#c4503a", VEIN = "#5f8db0", MUSC = "#c9705e", MUSC_D = "#a9564a", INSIDE = "#efcfb9", CHAIR = "#8f7a5c", DESK = "#b08a5e", SOCK = "#e9e2d2";
function rot(p, c, deg) { var a = deg * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k]; }
function nrm(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
function pp(p) { return f(p[0]) + " " + f(p[1]); }
// the seated leg pose: hip on the chair, ball of the foot on the floor; lift 0..1 raises the heel up to 22°
function legPose(hip, ball, s, lift) {
  var th = -22 * lift, ank = rot([ball[0] + 44 * s, ball[1] - 16 * s], ball, th);
  var k1 = ik(hip, ank, HB.thigh * s, HB.shin * s, 1), k2 = ik(hip, ank, HB.thigh * s, HB.shin * s, -1), kn = k1[1] < k2[1] ? k1 : k2;
  return { hip: hip, knee: kn, ank: ank, ball: ball, th: th, s: s };
}
// a shoe in the foot's own frame (origin at the ball, +x toward the heel), turned by the heel lift
function shoe(L, col) {
  var s = L.s, pts = [[-19, 0], [58, 0], [60, -20], [44, -27], [30, -19], [6, -15], [-12, -11]];
  var w = pts.map(function (q) { return rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s], L.ball, L.th); });
  var sole = [[-19, 0], [60, 0], [60, 6], [-17, 6]].map(function (q) { return rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s - 4 * s], L.ball, L.th); });
  return '<path d="M' + w.map(pp).join(" L") + ' Q' + pp(rot([L.ball[0] - 22 * s, L.ball[1] - 6 * s], L.ball, L.th)) + ' ' + pp(w[0]) + ' Z" fill="' + (col || "#3b342d") + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + sole.map(pp).join(" L") + ' Z" fill="#efe9dc" stroke="' + INK + '" stroke-width="1.4"/>' + [[14, -20], [22, -24], [30, -27]].map(function (q) { var a = rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s], L.ball, L.th), b = rot([L.ball[0] + (q[0] - 4) * s, L.ball[1] + (q[1] + 6) * s], L.ball, L.th); return '<path d="M' + pp(a) + ' L' + pp(b) + '" stroke="#efe9dc" stroke-width="' + f(1.6 * s) + '" stroke-linecap="round"/>'; }).join("");
}
// the near leg as two tapered trouser segments plus the shoe (same look as fig())
function legFlat(L, op) {
  var s = L.s, sock = add(L.ank, nrm([L.knee[0] - L.ank[0], L.knee[1] - L.ank[1]]), 10 * s);
  var d1 = "M" + pp(L.hip) + " L" + pp(L.knee), d2 = "M" + pp(L.knee) + " L" + pp(sock);
  var g = '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(40 * s) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(29 * s) + '" stroke-linecap="round"/>' +
    '<path d="M' + pp(sock) + ' L' + pp(L.ank) + '" stroke="' + INK + '" stroke-width="' + f(22 * s) + '" stroke-linecap="round"/><path d="M' + pp(sock) + ' L' + pp(L.ank) + '" stroke="' + SOCK + '" stroke-width="' + f(18 * s) + '" stroke-linecap="round"/>' +
    '<path d="' + d1 + '" stroke="' + PANTS + '" stroke-width="' + f(36 * s) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + PANTS + '" stroke-width="' + f(25 * s) + '" stroke-linecap="butt"/>' + shoe(L);
  return op != null ? G("", g, op) : g;
}
function chair(x, fl, s) { var sy = fl - 100 * s; return R(x - 20 * s, sy, 120 * s, 12 * s, CHAIR, 2) + R(x + 88 * s, sy - 190 * s, 12 * s, 190 * s, CHAIR, 2) + R(x - 14 * s, sy + 12 * s, 9 * s, 88 * s, CHAIR, 1.8) + R(x + 86 * s, sy + 12 * s, 9 * s, 88 * s, CHAIR, 1.8); }
function desk(x0, x1, fl, s) { var ty = fl - 172 * s; return R(x0, ty, x1 - x0, 14 * s, DESK, 2.2) + R(x1 - 24 * s, ty + 14 * s, 14 * s, 158 * s, DESK, 2); }
function mug(x, y) { return R(x - 18, y - 40, 36, 40, "#f4ecdb", 2, 3) + P("M" + (x + 18) + " " + (y - 32) + " c16 0 16 22 0 22", "none", 3) + R(x - 15, y - 37, 30, 6, BROWN, 0); }
// a seated person at a desk, near leg drawn by legPose (lift 0..1)
function seated(lift, o) {
  o = o || {}; var s = o.s || 1.3, fl = o.fl || 720, hx = o.x || 420, hip = [hx, fl - 110 * s], ball = [hx - 145 * s, fl];
  var p = fig({ x: hip[0], y: hip[1], s: s, lean: -4, noLeg0: 1, noLeg1: 1, legs: [[0, 0], [86, -84]], hands: [[hx - 150 * s, fl - 178 * s], [hx - 138 * s, fl - 176 * s]], bend: [1, 1], shirt: o.shirt || SHIRT_V });
  var L = legPose(hip, ball, s, lift), ghost = "", farL = legPose([hip[0] + 6 * s, hip[1] - 2 * s], [ball[0] + 34 * s, fl], s, 0);
  if (o.ghost) ghost = legFlat(legPose(hip, ball, s, 0), .28);
  return { svg: floor(fl) + chair(hx - 30 * s, fl, s) + desk(-200, hx - 120 * s, fl, s) + mug(hx - 210 * s, fl - 172 * s) + p.far + G("", legFlat(farL), .9).replace(/#5b5145/g, '#4a4239') + ghost + legFlat(L) + p.body + p.near, L: L, p: p };
}

// ── the leg cut: a close-up of the seated shank and the knee, skin cut open ──
// o: {lift 0..1, sq 0..1 (calf squeeze), pool 0..1 (blood pooled low), flow (phase for dots), hl: "calf"|"vein"|"art"|"valve"}
function legCut(o) {
  o = o || {}; var s = 3, ball = [110, 700], hip = [ball[0] + 145 * 3, ball[1] - 110 * 3], L = legPose(hip, ball, s, o.lift || 0), K = L.knee, A = L.ank, out = "";
  var u = nrm([A[0] - K[0], A[1] - K[1]]), n = [-u[1], u[0]], len = Math.hypot(A[0] - K[0], A[1] - K[1]);   // n points to the back (right)
  if (n[0] < 0) n = [-n[0], -n[1]];
  function S(t, off) { return add(add(K, u, t * len), n, off); }
  var sq = o.sq || 0;
  // outline of the shank: straight shin in front, calf bulge at the back narrowing to the Achilles
  var fr = [[0, -64], [.25, -54], [.6, -44], [.88, -36], [1.02, -34]], bk = [[1.02, 46], [.86, 42], [.7, 62], [.5, 100 + 8 * sq], [.3, 118 + 10 * sq], [.14, 108], [0, 84]];
  var shank = "M" + fr.map(function (q) { return pp(S(q[0], q[1])); }).join(" L");
  bk.forEach(function (q) { shank += " L" + pp(S(q[0], q[1])); });
  // thigh: from the knee to the hip, with the pants on
  var v = nrm([hip[0] - K[0], hip[1] - K[1]]), m = [v[1], -v[0]]; if (m[1] > 0) m = [-m[0], -m[1]];
  function Tg(t, off) { return add(add(K, v, t * 500), m, off); }
  var sil = [Tg(1.2, 104), Tg(.45, 86), Tg(.08, 72), Tg(-.08, 54), Tg(-.15, 14), S(.06, -62)].concat(fr.slice(1).map(function (q) { return S(q[0], q[1]); }))
    .concat(bk.map(function (q) { return S(q[0], q[1]); })).concat([Tg(.14, -84), Tg(.45, -96), Tg(1.2, -104)]);
  var sd = smooth("M" + sil.map(pp).join(" L")) + " Z";
  out += '<path d="' + sd + '" fill="' + INSIDE + '" stroke="' + INK + '" stroke-width="2.6"/><path d="' + sd + '" fill="url(#hatch)" opacity=".6"/>';
  // the skin edge, drawn as a band just inside the outline
  var cid = "lc" + (++CLIPN); out += '<clipPath id="' + cid + '"><path d="' + sd + '"/></clipPath><path d="' + sd + '" fill="none" stroke="' + SKIN + '" stroke-width="22" clip-path="url(#' + cid + ')"/><path d="' + sd + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  // the femur end and the patella (knee cap) in front
  out += P("M" + pp(Tg(1, 26)) + " L" + pp(Tg(.08, 26)) + " Q" + pp(Tg(-.08, 34)) + " " + pp(Tg(-.08, 0)) + " Q" + pp(Tg(-.08, -40)) + " " + pp(Tg(.06, -36)) + " L" + pp(Tg(1, -26)) + " Z", BONE, 2);
  var pat = Tg(-.09, 2); out += '<ellipse cx="' + f(pat[0]) + '" cy="' + f(pat[1]) + '" rx="16" ry="27" transform="rotate(' + f(Math.atan2(u[1], u[0]) * 180 / Math.PI - 90) + ' ' + pp(pat) + ')" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  // tibia (front, thick) and fibula (behind, thin)
  out += P("M" + pp(S(.02, -52)) + " Q" + pp(S(-.02, -14)) + " " + pp(S(.03, 16)) + " L" + pp(S(.15, 2)) + " L" + pp(S(.9, -10)) + " L" + pp(S(.99, -4)) + " L" + pp(S(1.0, -36)) + " L" + pp(S(.9, -34)) + " L" + pp(S(.15, -44)) + " Z", BONE, 2);
  out += P("M" + pp(S(.1, 10)) + " L" + pp(S(.95, 6)) + " L" + pp(S(.95, 16)) + " L" + pp(S(.1, 22)) + " Z", BONE, 1.6);
  // calf muscles: soleus (deep) then gastrocnemius (the bulge) over the vessels' back edge, Achilles to the heel
  var bul = 10 * sq, mcol = o.hl === "calf" ? (sq > .3 ? ORANGE : "#d07a52") : MUSC;
  out += P(smooth("M" + [S(.2, 34), S(.4, 84 + bul * .6), S(.62, 76 + bul * .5), S(.82, 44), S(.78, 34), S(.5, 30), S(.3, 30)].map(pp).join(" L")) + " Z", MUSC_D, 2, ' fill-opacity=".92"');
  out += P(smooth("M" + [S(.0, 62), S(.12, 98), S(.3, 112 + bul), S(.46, 96 + bul * .8), S(.62, 64), S(.7, 50), S(.55, 54), S(.34, 60), S(.14, 56)].map(pp).join(" L")) + " Z", mcol, 2.2);
  for (var j = 0; j < 5; j++) out += '<path d="M' + pp(S(.06 + j * .02, 66 + j * 8)) + ' Q' + pp(S(.3, 74 + j * 8 + bul * .6)) + ' ' + pp(S(.6 - j * .02, 58 + j * 4)) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none" opacity=".8"/>';
  out += P("M" + [S(.6, 46), S(.98, 30), S(1.0, 22), S(.62, 36)].map(pp).join(" L") + " Z", "#e8d9bd", 1.8);
  // vessels behind the bones: artery (red) and the deep vein (blue, wider), down the back of the shank
  var vp = [Tg(.9, -66), Tg(.25, -66), S(-.02, 52), S(.18, 46), S(.5, 42), S(.82, 32), S(.95, 22)];
  var ap = [Tg(.9, -52), Tg(.25, -52), S(-.02, 36), S(.18, 30), S(.5, 28), S(.82, 22), S(.95, 12)];
  var pool = o.pool || 0, veinW = 20 + 6 * pool, vd = "M" + vp.map(pp).join(" L");
  out += P(smooth(vd), "none", veinW + 4, ' stroke-linecap="round"') + '<path d="' + smooth(vd) + '" stroke="' + VEIN + '" stroke-width="' + f(veinW) + '" fill="none" stroke-linecap="round"/>';
  var ad = "M" + ap.map(pp).join(" L");
  out += P(smooth(ad), "none", 13, ' stroke-linecap="round"') + '<path d="' + smooth(ad) + '" stroke="' + ART + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
  // one-way valves in the vein: two cusps pointing up the vein (open lets blood up, closed meets in the middle)
  var VT = [.24, .48, .72]; o.valves = o.valves || [1, 1, 1];
  VT.forEach(function (t, i) {
    var c = along(vp, lerp(.52, .9, (t - .24) / .48)), up = [-u[0], -u[1]], q = n, op = o.valves[i], w = veinW / 2 - 1, gap = lerp(0, w * .8, op);
    [1, -1].forEach(function (sd) { out += '<path d="M' + pp(add(add(c, up, -4), q, sd * w)) + ' Q' + pp(add(add(c, up, 10), q, sd * w * .7)) + ' ' + pp(add(add(c, up, 18), q, sd * gap)) + ' L' + pp(add(add(c, up, 6), q, sd * w)) + ' Z" fill="#eef3f6" stroke="' + INK + '" stroke-width="1.8"/>'; });
  });
  if (o.chev) [.12, .36, .6, .84].forEach(function (k) { var a = along(vp, k), b = along(vp, k - .03), d = nrm([b[0] - a[0], b[1] - a[1]]), q = [-d[1], d[0]];
    out += '<path d="M' + pp(add(add(a, q, 6), d, -2)) + ' L' + pp(add(a, d, 5)) + ' L' + pp(add(add(a, q, -6), d, -2)) + '" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; });
  // blood cells: in the artery going down, in the vein going up (or bunched low when pooling)
  var ph = o.flow || 0;
  for (var i = 0; i < 9; i++) {
    var ka = (i / 9 + ph) % 1, kv = pool > 0 ? .55 + .45 * Math.pow((i / 9 + ph * .15) % 1, .5) : (1 - ((i / 9 + ph * .8) % 1)) * .95;
    var pa = along(ap, ka), pv = along(vp, kv);
    out += '<circle cx="' + f(pa[0]) + '" cy="' + f(pa[1]) + '" r="3.6" fill="#f6d2c4"/>';
    out += '<circle cx="' + f(pv[0]) + '" cy="' + f(pv[1]) + '" r="4.6" fill="#dbe6ee" stroke="' + INK + '" stroke-width=".8"/>';
  }
  // sock, shoe
  out += '<path d="M' + pp(S(.92, -32)) + ' L' + pp(S(.92, 36)) + ' L' + pp(S(1.04, 38)) + ' L' + pp(S(1.04, -34)) + ' Z" fill="' + SOCK + '" stroke="' + INK + '" stroke-width="2"/>';
  out += shoe(L);
  return { svg: out, L: L, S: S, K: K, A: A, u: u, n: n, vp: vp, ap: ap, Tg: Tg };
}
// quadratic smoothing of a polyline path "M x y L x y ..."
function smooth(d) {
  var p = d.replace(/^M/, "").split(" L").map(function (q) { return q.trim().split(" ").map(Number); });
  var s = "M" + pp(p[0]); for (var i = 1; i < p.length - 1; i++) { var m = [(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]; s += " Q" + pp(p[i]) + " " + pp(m); } return s + " L" + pp(p[p.length - 1]);
}

// ── the calf pump close-up: a vein segment between two muscles, two valves ──
function pump(cx, cy, sq, title) {
  var s = "", w = 26 - 12 * sq, top = cy - 190, bot = cy + 190, bul = 26 * sq;
  // muscles either side, bulging into the vein when squeezed
  var mc = sq > .5 ? ORANGE : MUSC;
  s += P("M" + (cx - 40) + " " + top + " C" + (cx - 120 - bul) + " " + (cy - 120) + " " + (cx - 120 - bul) + " " + (cy + 120) + " " + (cx - 40) + " " + bot + " C" + (cx - w - 6 - bul * .5) + " " + (cy + 80) + " " + (cx - w - 6 - bul * .5) + " " + (cy - 80) + " " + (cx - 40) + " " + top + " Z", mc, 2.2);
  s += P("M" + (cx + 40) + " " + top + " C" + (cx + 120 + bul) + " " + (cy - 120) + " " + (cx + 120 + bul) + " " + (cy + 120) + " " + (cx + 40) + " " + bot + " C" + (cx + w + 6 + bul * .5) + " " + (cy + 80) + " " + (cx + w + 6 + bul * .5) + " " + (cy - 80) + " " + (cx + 40) + " " + top + " Z", mc, 2.2);
  for (var j = 0; j < 3; j++) { s += '<path d="M' + (cx - 46 - j * 14) + ' ' + (top + 30) + ' Q' + (cx - 80 - j * 14 - bul) + ' ' + cy + ' ' + (cx - 46 - j * 14) + ' ' + (bot - 30) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none"/>' + '<path d="M' + (cx + 46 + j * 14) + ' ' + (top + 30) + ' Q' + (cx + 80 + j * 14 + bul) + ' ' + cy + ' ' + (cx + 46 + j * 14) + ' ' + (bot - 30) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none"/>'; }
  // the vein, narrowed in the middle when squeezed
  var mw = 26 - 16 * sq;
  s += P("M" + (cx - 26) + " " + (top - 40) + " L" + (cx - 26) + " " + (cy - 110) + " Q" + (cx - mw) + " " + cy + " " + (cx - 26) + " " + (cy + 110) + " L" + (cx - 26) + " " + (bot + 40) + " L" + (cx + 26) + " " + (bot + 40) + " L" + (cx + 26) + " " + (cy + 110) + " Q" + (cx + mw) + " " + cy + " " + (cx + 26) + " " + (cy - 110) + " L" + (cx + 26) + " " + (top - 40) + " Z", VEIN, 2.4);
  // valves: the top one opens when squeezed, the bottom one shuts; relaxed it is the other way round
  function valve(y, open) { var g = open ? 16 : 0; return '<path d="M' + (cx - 26) + ' ' + (y + 6) + ' Q' + (cx - 20) + ' ' + (y - 16) + ' ' + (cx - g) + ' ' + (y - 26) + '" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M' + (cx + 26) + ' ' + (y + 6) + ' Q' + (cx + 20) + ' ' + (y - 16) + ' ' + (cx + g) + ' ' + (y - 26) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>'; }
  s += valve(top - 6, sq > .5) + valve(bot + 6, sq <= .5);
  // blood cells: squeezed out upward, or waiting above the shut bottom valve... (relaxed: filling from below)
  for (var i = 0; i < 7; i++) { var y = sq > .5 ? top - 60 + i * 34 - 20 : bot + 30 - i * 30; s += '<circle cx="' + (cx + ((i % 2) ? 7 : -7)) + '" cy="' + y + '" r="7" fill="#dbe6ee" stroke="' + INK + '" stroke-width="1"/>'; }
  s += arrow(cx, sq > .5 ? top - 30 : bot + 60, cx, sq > .5 ? top - 140 : bot - 40, ORANGE, 4);
  s += T(title, cx, bot + 110, 26, sq > .5 ? ORANGE : INK, 800);
  return s;
}
function tube(x, y, sq) {   // the toothpaste tube analogy (squeezed from the bottom up)
  return G("translate(" + x + " " + y + ")", P("M-20 " + (54 - 30 * sq) + " L-14 -30 L14 -30 L20 " + (54 - 30 * sq) + " Z", "#e9ecea", 2) + R(-8, -46, 16, 16, BLUE, 1.6) + P("M-22 " + (54 - 30 * sq) + " L22 " + (54 - 30 * sq) + " L22 62 L-22 62 Z", "#c8c2b4", 1.6) +
    '<path d="M0 -50 q-10 -16 6 -26" stroke="' + "#f4ecdb" + '" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M0 -50 q-10 -16 6 -26" stroke="' + INK + '" stroke-width="1.4" fill="none"/>');
}

// a bar gauge «قدرة الشريان إنه يوسع»
function gauge(x, y, h, v0, v1, col, txt0, txt1) {
  var s = R(x - 22, y - h, 44, h, "#f4ecdb", 2.2, 4), vmax = 7;
  s += '<path d="M' + (x - 30) + ' ' + f(y - h * v0 / vmax) + ' h60" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 4"/>' + (Math.abs(v1 - v0) > .4 ? N(txt0, x - 46, y - h * v0 / vmax + 7, 19, MUTE, "end") : "");
  s += R(x - 18, y - h * v1 / vmax, 36, h * v1 / vmax - 4, col, 0, 3) + N(txt1, x + 34, y - h * v1 / vmax + 8, 24, col, "start");
  return s;
}
// a heart in the chest (side view, simple)
function heart(x, y, r) { return P("M" + x + " " + (y + r) + " C" + (x - r * 1.6) + " " + (y - r * .2) + " " + (x - r * .9) + " " + (y - r * 1.3) + " " + x + " " + (y - r * .5) + " C" + (x + r * .9) + " " + (y - r * 1.3) + " " + (x + r * 1.6) + " " + (y - r * .2) + " " + x + " " + (y + r) + " Z", ART, 2.2); }


// ── motion helpers ──
// one bounce: 0 heel down … 1 heel up, about 2.3 bounces a second (a real seated fidget), a little rest at the bottom
function bounce(t, hz) { var p = (t * (hz || 2.3)) % 1; return Math.pow(Math.sin(p * Math.PI), 2); }
var CUT0 = legCut({});   // reference geometry for the cut (knee, ankle, calf) at rest
var CALF = CUT0.S(.32, 90), VEINMID = CUT0.S(.48, 42);
function seatedAt(lift, o) { return seated(lift, o); }
// blood running along a polyline: n dots, speed in loops per second (negative runs backwards)
function flowDots(pts, t, n, speed, r, fill, from, to) {
  var s = ""; from = from || 0; to = to == null ? 1 : to;
  for (var i = 0; i < n; i++) { var k = ((i / n + t * speed) % 1 + 1) % 1, p = along(pts, lerp(from, to, k)); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + r + '" fill="' + fill + '" stroke="' + INK + '" stroke-width=".8"/>'; }
  return s;
}
// the artery from the heart down to the foot and the vein back, on a seated figure
function bodyPaths(a) {
  var L = a.L, hp = a.p.at(92, 12);
  return { heart: hp, art: [hp, a.p.at(40, 6), a.p.at(4, 4), L.hip, L.knee, add(L.ank, [0, -1], 14)], vein: [add(L.ank, [0, -1], 14), [L.knee[0] + 14, L.knee[1] + 4], [L.hip[0], L.hip[1] + 10], a.p.at(4, -8), a.p.at(40, -6), [hp[0] + 6, hp[1]]] };
}
function heartBeat(x, y, r, t) { var b = 1 + .1 * Math.pow(Math.abs(Math.sin(t * 3.4)), 6); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(b) + ")", heart(0, 0, r)); }
// the calf pump, with the blood moving: sq 0..1 squeeze, mv 0..1 how far the blood has moved since the squeeze began
function pump2(cx, cy, sq, mv, title, t) {
  var s = "", top = cy - 190, bot = cy + 190, bul = 26 * sq, mc = sq > .5 ? ORANGE : MUSC, mw = 26 - 16 * sq;
  [-1, 1].forEach(function (d) {
    s += P("M" + (cx + d * 40) + " " + top + " C" + (cx + d * (120 + bul)) + " " + (cy - 120) + " " + (cx + d * (120 + bul)) + " " + (cy + 120) + " " + (cx + d * 40) + " " + bot + " C" + (cx + d * (32 + bul * .5)) + " " + (cy + 80) + " " + (cx + d * (32 + bul * .5)) + " " + (cy - 80) + " " + (cx + d * 40) + " " + top + " Z", mc, 2.2);
    for (var j = 0; j < 3; j++) s += '<path d="M' + (cx + d * (46 + j * 14)) + ' ' + (top + 30) + ' Q' + (cx + d * (80 + j * 14 + bul)) + ' ' + cy + ' ' + (cx + d * (46 + j * 14)) + ' ' + (bot - 30) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none"/>';
  });
  s += P("M" + (cx - 26) + " " + (top - 70) + " L" + (cx - 26) + " " + (cy - 110) + " Q" + (cx - mw) + " " + cy + " " + (cx - 26) + " " + (cy + 110) + " L" + (cx - 26) + " " + (bot + 70) + " L" + (cx + 26) + " " + (bot + 70) + " L" + (cx + 26) + " " + (cy + 110) + " Q" + (cx + mw) + " " + cy + " " + (cx + 26) + " " + (cy - 110) + " L" + (cx + 26) + " " + (top - 70) + " Z", VEIN, 2.4);
  function valve(y, open) { var g = 16 * open; return [-1, 1].map(function (d) { return '<path d="M' + (cx + d * 26) + ' ' + (y + 8) + ' Q' + (cx + d * 20) + ' ' + (y - 14) + ' ' + f(cx + d * g) + ' ' + (y - 26) + ' L' + f(cx + d * (g + 6)) + ' ' + (y - 20) + ' Q' + (cx + d * 24) + ' ' + (y - 8) + ' ' + (cx + d * 26) + ' ' + (y - 2) + ' Z" fill="#eef3f6" stroke="' + INK + '" stroke-width="2"/>'; }).join(""); }
  // blood cells: they rise with mv while squeezed; relaxed, new ones come in from below
  for (var i = 0; i < 8; i++) {
    var y0 = bot - 30 - i * 44, y = sq > .02 ? y0 - mv * 150 : y0 + 30 * (1 - mv) - 10; if (y < top - 64 || y > bot + 64) continue;
    s += '<circle cx="' + (cx + ((i % 2) ? 8 : -8)) + '" cy="' + f(y) + '" r="8" fill="#dbe6ee" stroke="' + INK + '" stroke-width="1"/>';
  }
  s += valve(top - 6, clamp(sq * 1.6)) + valve(bot + 6, clamp(1 - sq * 1.6));
  if (title) s += T(title, cx, bot + 130, 28, sq > .5 ? ORANGE : INK, 800);
  return s;
}
function hand(x, y, rot, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + (sc || 1) + ")", '<path d="M0 -40 C-30 -40 -40 -10 -40 0 C-40 20 -30 40 0 40 L70 34 L70 -34 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-36 -14 h26 M-38 4 h26 M-34 20 h24" stroke="' + INK + '" stroke-width="1.6"/>'); }
// a toothpaste tube, upright, squeezed from the bottom up to height k
function bigTube(x, y, k, t) {
  var s = "", h = 420, w = 120, pinch = lerp(y + h / 2, y - h / 2 + 90, k);
  s += P("M" + (x - w / 2) + " " + f(pinch) + " L" + (x - w / 2) + " " + (y - h / 2 + 40) + " Q" + x + " " + (y - h / 2) + " " + (x + w / 2) + " " + (y - h / 2 + 40) + " L" + (x + w / 2) + " " + f(pinch) + " Z", "#eef0ec", 2.6);
  s += P("M" + (x - w / 2) + " " + f(pinch) + " L" + (x + w / 2) + " " + f(pinch) + " L" + (x + w / 2 + 14) + " " + (y + h / 2) + " L" + (x - w / 2 - 14) + " " + (y + h / 2) + " Z", "#d6d2c6", 2.2);
  for (var i = 0; i < 4; i++) { var yy = lerp(pinch, y + h / 2, (i + .5) / 4); s += '<path d="M' + (x - w / 2 - 6) + ' ' + f(yy) + ' h' + (w + 12) + '" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>'; }
  s += R(x - 40, y - 60, 80, 90, BLUE, 1.6) + T("معجون", x, y - 4, 22, "#fff", 800);
  s += R(x - 22, y - h / 2 - 40, 44, 34, OLIVE, 2, 4);
  var len = 160 * k; if (len > 2) s += '<path d="M' + x + ' ' + (y - h / 2 - 40) + ' q' + f(-10) + ' ' + f(-len * .5) + ' ' + f(30) + ' ' + f(-len) + '" stroke="' + INK + '" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M' + x + ' ' + (y - h / 2 - 40) + ' q' + f(-10) + ' ' + f(-len * .5) + ' ' + f(30) + ' ' + f(-len) + '" stroke="#f4f6f2" stroke-width="25" fill="none" stroke-linecap="round"/>';
  s += hand(x - w / 2 - 70, pinch + 20, 0, 1) + hand(x + w / 2 + 70, pinch + 20, 180, 1);
  return s;
}
// standing figure (real proportions): hip at floor − 212·s
function standing(x, fl, s, o) { o = o || {}; return fig(Object.assign({ x: x, y: fl - 212 * s, s: s, lean: 0, legs: [[2, -2], [-2, 2]], shirt: o.shirt || "#6f7a55", hair: o.hair }, o)); }
function brainIcon(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#d6a6a0") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -30 q-6 14 8 22 M24 0 q-12 2 -14 14" stroke="' + INK + '" stroke-width="2" fill="none"/>'); }
function clockFace(x, y, r, k) { var a = k * Math.PI * 2 * 3 - Math.PI / 2, b = k * Math.PI * 2 * .25 - Math.PI / 2; return C(x, y, r, "#f4ecdb", 2.6) + [0, 1, 2, 3].map(function (i) { var c = i * Math.PI / 2; return '<path d="M' + f(x + Math.cos(c) * (r - 10)) + ' ' + f(y + Math.sin(c) * (r - 10)) + ' L' + f(x + Math.cos(c) * (r - 3)) + ' ' + f(y + Math.sin(c) * (r - 3)) + '" stroke="' + INK + '" stroke-width="3"/>'; }).join("") + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 8)) + ' ' + f(y + Math.sin(a) * (r - 8)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(b) * (r - 18)) + ' ' + f(y + Math.sin(b) * (r - 18)) + '" stroke="' + ORANGE + '" stroke-width="4.5" stroke-linecap="round"/>' + C(x, y, 4, INK, 0); }

// the study: two frames, the still leg on top, the bouncing leg below. mode: 0 set-up, 1 still result, 2 bouncing result
function study(u, t, mode, k) {
  var s = paper();
  function half(y, still) {
    var lift = still ? 0 : bounce(t), c = legCut({ lift: lift, sq: lift, pool: still ? .3 + .6 * (mode ? 1 : clamp(u / 4)) : 0, flow: still ? t * .05 : t * .45, hl: still ? "" : "calf", chev: !still });
    var g = '<clipPath id="h' + y + '"><rect x="20" y="' + y + '" width="600" height="360"/></clipPath><g clip-path="url(#h' + y + ')">' + G("translate(30 " + (y - 70) + ") scale(.5)", c.svg) + '</g>';
    g += '<rect x="20" y="' + y + '" width="600" height="360" fill="none" stroke="' + INK + '" stroke-width="1.8"/>';
    g += tag(still ? "رجل ثابتة" : "رجل بتتهز", 470, y + 54, 1, 24, still ? ORANGE : OLIVE);
    if (mode) {
      var mine = (mode === 1) === still, kk = mine ? k : (mode === 2 ? 1 : 0), v0 = still ? 4.5 : 3.7, v1 = still ? 1.6 : 6.6;
      if (mode === 1 && !still) kk = 0;
      g += T("قدرة الشريان إنه يوسع", 470, y + 336, 17, INK, 700) + gauge(470, y + 306, 200, v0, lerp(v0, v1, kk), still ? ORANGE : OLIVE, v0.toFixed(1) + "%", lerp(v0, v1, kk).toFixed(1) + "%");
      if (kk >= 1) g += still ? cross(570, y + 130, .7, clamp((k - 1) * 3 + 1)) : check(570, y + 130, .8, 1, OLIVE);
    }
    return mode && ((mode === 1) !== still) ? dim(.6, g) : g;
  }
  s += half(20, 1) + half(400, 0);
  s += G("translate(320 395)", clockFace(0, 0, 38, mode ? 1 : clamp(u / 4))) + numBox("3 ساعات", 190, 402, mode ? 1 : at(u, .9, .3), 20);
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · the study: 3 hours, one leg bouncing, the clock runs
shot(4, push(320, 400, 1.0, 1.04), function (u, d, t) { return study(u, t, 0, 0); });
// 5 · the still leg: its artery lost about two-thirds of its widening
shot(5, push(320, 220, 1.12, 1.2), function (u, d, t) { return study(u, t, 1, at(u, .9, 1.6)); });
// 6 · the bouncing leg: better than before
shot(6, push(320, 590, 1.2, 1.12), function (u, d, t) { return study(u, t, 2, at(u, .5, 1.4)); });
// 7 · why? heart up in the chest, legs down, about a metre between them
shot(7, push(330, 470, 1.05, 1.12), function (u, d, t) {
  var c = window.CHUNKS[7], D = LN[7].end - LN[7].start, k1 = at(u, D * c[1], .4), k2 = at(u, D * c[2], .6);
  var a = seatedAt(0, { s: 1.15, fl: 740, x: 380 }), bp = bodyPaths(a), s = paper() + a.svg;
  s += G("", T("؟", 160, 260, 160, ORANGE, 800), 1 - k1);
  s += G("", heartBeat(bp.heart[0], bp.heart[1], 16, t) + label(bp.heart[0] + 4, bp.heart[1], 470, 300, "القلب", ART, k1, 26), k1);
  s += measure(600, bp.heart[1], 600, 740, k2, "", 30) + G("", T("حوالي متر", 610, bp.heart[1] - 22, 26, ORANGE, 800, "start"), k2);
  s += label(a.L.ball[0] + 20, 732, 120, 620, "رجلك", INK, k2, 24);
  return s;
});
// 8 · going down is easy: gravity helps; the blood runs down the artery
shot(8, push(330, 520, 1.1, 1.22), function (u, d, t) {
  var a = seatedAt(0, { s: 1.15, fl: 740, x: 380 }), bp = bodyPaths(a), s = paper() + a.svg, k = at(u, .3, .5);
  s += G("", '<path d="M' + bp.art.map(pp).join(" L") + '" stroke="' + ART + '" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' + flowDots(bp.art, t, 9, .45, 4, "#f6d2c4"), k);
  s += heartBeat(bp.heart[0], bp.heart[1], 16, t);
  var gx = a.L.knee[0] - 70; s += arrow(gx, a.L.knee[1] - 60, gx, a.L.knee[1] - 60 + 150 * at(u, 1.4, .8), BLUE, 6) + G("", T("الجاذبية", gx - 14, a.L.knee[1] - 70, 24, BLUE, 800, "start"), at(u, 1.8, .4));
  return s;
});
// 9 · but how does it come back up? the vein, the blood not moving, a question mark
shot(9, push(330, 470, 1.0, 1.08), function (u, d, t) {
  var c = legCut({ pool: .3, flow: t * .03, valves: [0, 0, 0] }), s = paper() + c.svg, k = at(u, .2, .4);
  s += G("", '<path d="M' + pp(c.S(.85, 60)) + ' L' + pp(c.S(.05, 70)) + '" stroke="' + BLUE + '" stroke-width="4" stroke-dasharray="10 9" fill="none"/>', k) + arrow(c.S(.1, 74)[0], c.S(.1, 74)[1], c.S(.0, 74)[0] + 6, c.S(.0, 74)[1] - 40, BLUE, 4, k);
  return s + G("", T("؟", 520, 380, 150, ORANGE, 800), at(u, .5, .3));
}, { tr: "in" });
// 10 · by the time it reaches the veins, the heart's push is almost spent
shot(10, push(330, 500, 1.05, 1.1), function (u, d, t) {
  var a = seatedAt(0, { s: 1.15, fl: 740, x: 380 }), bp = bodyPaths(a), s = paper() + a.svg, k1 = at(u, .3, .5), k2 = at(u, d * .45, .6);
  s += '<path d="M' + bp.art.map(pp).join(" L") + '" stroke="' + ART + '" stroke-width="7" fill="none" stroke-linejoin="round" opacity=".85"/>' + flowDots(bp.art, t, 8, .5, 4, "#f6d2c4");
  s += G("", '<path d="M' + bp.vein.map(pp).join(" L") + '" stroke="' + VEIN + '" stroke-width="9" fill="none" stroke-linejoin="round"/>' + flowDots(bp.vein, t, 8, .04, 4.5, "#dbe6ee"), k2);
  s += heartBeat(bp.heart[0], bp.heart[1], 16, t);
  function meter(x, y, v, col, txt, k) { return G("", R(x - 70, y - 22, 140, 30, "#f4ecdb", 2, 4) + R(x - 66, y - 18, 132 * v, 22, col, 0, 3) + T(txt, x, y + 40, 22, col, 800), k); }
  s += meter(520, 200, 1, ORANGE, "ضغط من القلب", k1) + meter(150, 560, .12, BLUE, "ضغط في الوريد", k2);
  return s;
});
// 11 · sit still for long: the blood pools low in the leg
shot(11, push(300, 560, 1.05, 1.18), function (u, d, t) {
  var pk = at(u, .6, 2.6), c = legCut({ pool: pk, flow: t * .03, valves: [0, 0, 0] }), s = paper() + c.svg, lo = c.S(.84, 30);
  s += '<ellipse cx="' + f(lo[0]) + '" cy="' + f(lo[1]) + '" rx="' + f(20 + 30 * pk) + '" ry="' + f(30 + 50 * pk) + '" fill="' + VEIN + '" opacity="' + f(.3 * pk) + '"/>';
  s += arrow(560, 380, 560, 380 + 280 * at(u, .3, .8), VEIN, 5) + G("", T("الجاذبية", 590, 520, 22, BLUE, 800, "start"), at(u, .6, .3));
  s += label(lo[0] + 10, lo[1], 420, 740, "الدم بيتجمّع هنا", BLUE, at(u, 1.6, .5), 24);
  return s;
}, { tr: "out" });
// 12 · it moves slower, and the artery gets lazy about widening
shot(12, push(330, 470, 1.25, 1.35), function (u, d, t) {
  var c = legCut({ pool: .9, flow: t * .02, valves: [0, 0, 0], hl: "art" }), s = paper() + c.svg, ap = c.S(.4, 30);
  s += G("", tag("أبطأ", 520, 300, 1, 30, BLUE), at(u, .2, .3));
  var k = at(u, d * .45, .5);
  s += label(ap[0], ap[1], 440, 560, "الشريان", ART, k, 26) + G("translate(520 430)", R(-18, -70, 36, 120, "#f4ecdb", 2, 4) + R(-14, 50 - 120 * lerp(.6, .2, at(u, d * .5, 1)), 32, 120 * lerp(.6, .2, at(u, d * .5, 1)) - 4, ORANGE, 0, 3), k);
  return s;
});
// 13 · who pushes it up? the calf muscle
shot(13, push(300, 470, 1.0, 1.1), function (u, d, t) {
  var D = LN[13].end - LN[13].start, k = at(u, D * window.CHUNKS[13][1], .5), c = legCut({ pool: .5 * (1 - k), flow: t * .05, hl: k > .5 ? "calf" : "", sq: 0 }), s = paper() + c.svg;
  s += G("", T("؟", 520, 360, 150, ORANGE, 800), 1 - k);
  s += G("", '<circle cx="' + f(CALF[0]) + '" cy="' + f(CALF[1]) + '" r="' + f(90 + 6 * Math.sin(t * 4)) + '" fill="none" stroke="' + OLIVE + '" stroke-width="4" stroke-dasharray="12 9"/>', k) + label(CALF[0] + 30, CALF[1] - 40, 440, 200, "عضلة السمانة", OLIVE, k, 30);
  return s;
});
// 14 · the deep veins run through it, with valves that open upward only
shot(14, push(VEINMID[0] + 90, VEINMID[1] - 10, 1.5, 1.65), function (u, d, t) {
  var op = .5 + .5 * Math.sin(t * 2.4), c = legCut({ flow: t * .25, valves: [op, op, op], chev: 1, hl: "vein" }), s = paper() + c.svg, v = c.S(.48, 39);
  s += label(c.S(.72, 38)[0], c.S(.72, 38)[1], VEINMID[0] + 110, VEINMID[1] + 150, "وريد عميق", BLUE, at(u, .3, .5), 16);
  s += label(v[0] + 4, v[1], VEINMID[0] + 120, VEINMID[1] + 40, "صمام", OLIVE, at(u, d * .5, .5), 18) + G("", T("بيفتح لفوق بس", VEINMID[0] + 220, VEINMID[1] + 74, 15, ORANGE, 800, "start"), at(u, d * .65, .4));
  return s;
}, { tr: "in" });
// 15 · every contraction squeezes the vein, and the blood goes up
shot(15, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var sq = at(u, .5, .5), mv = at(u, .7, 2.0), s = paper() + pump2(320, 390, sq, mv, "السمانة بتنقبض", t);
  s += arrow(320, 160, 320, 160 - 120 * mv, ORANGE, 6, mv) + label(340, 186, 400, 110, "الصمام بيفتح", OLIVE, at(u, 1.0, .5), 22);
  return s;
}, { tr: "out" });
// 16 · when it relaxes, the valve above shuts, so the blood can't fall back
shot(16, push(320, 380, 1.06, 1.0), function (u, d, t) {
  var sq = 1 - at(u, .3, .6), s = paper() + pump2(320, 390, sq, 1 - 0 * sq, "السمانة بترتخي", t);
  s += label(340, 186, 380, 100, "الصمام اللي فوق بيقفل", OLIVE, at(u, .9, .5), 21) + arrow(200, 150, 200, 280, BLUE, 5, at(u, d * .55, .3)) + cross(200, 215, .8, at(u, d * .6, .4));
  return s;
});
// 17 · like squeezing a toothpaste tube from the bottom up
shot(17, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + bigTube(320, 470, at(u, .4, d - .8), t) + iconBox(540, 110, 150, G("scale(.32) translate(-320 -390)", pump2(320, 390, 1, .6, "", t)), at(u, .3, .3));
});
// 18 · and the bounce? each one is the calf contracting and lifting the heel (inset: the calf in sync)
shot(18, push(330, 440, 1.0, 1.06), function (u, d, t) {
  var b = bounce(t), a = seatedAt(b, { ghost: 1, s: 2.1, fl: 700, x: 500 }), s = paper() + a.svg, L = a.L;
  var cut = legCut({ lift: b, sq: b, flow: t * .45, hl: "calf", chev: 1 });
  s += inset(170, 175, 120, G("translate(" + f(-CALF[0] + 10) + " " + f(-CALF[1] + 20) + ")", paper() + cut.svg), at(u, .6, .4));
  s += label(lerp(L.knee[0], L.ank[0], .35) + 16 * L.s, lerp(L.knee[1], L.ank[1], .35), 130, 470, "السمانة", OLIVE, at(u, 1.0, .5), 26);
  var hc = rot([L.ball[0] + 58 * L.s, L.ball[1] - 2], L.ball, L.th);
  s += label(hc[0] + 6, hc[1] - 4, 420, 600, "الكعب بيطلع", ORANGE, at(u, d * .6, .5), 24);
  return s;
}, { tr: "out" });
// 19 · that's why the calf is called the second heart
shot(19, push(330, 470, 1.05, 1.15), function (u, d, t) {
  var b = bounce(t), c = legCut({ lift: b, sq: b, flow: t * .45, hl: "calf", chev: 1 }), s = paper() + c.svg, k = at(u, d * .35, .5), hb = 1 + .14 * b;
  s += G("translate(" + f(CALF[0] + 10) + " " + f(CALF[1] + 10) + ") scale(" + f(hb) + ")", heart(0, 0, 34), k);
  s += G("", tag("القلب التاني", 470, 200, 1, 32, ORANGE), at(u, d * .5, .3));
  return s;
});
// 20 · the myth: the heart alone brings the blood back from the leg — no
shot(20, push(330, 470, 1.08, 1.0), function (u, d, t) {
  var a = seatedAt(0, { s: 1.15, fl: 740, x: 380 }), bp = bodyPaths(a), s = paper() + a.svg, k = at(u, .3, .5);
  s += G("", '<path d="M' + bp.vein.map(pp).join(" L") + '" stroke="' + VEIN + '" stroke-width="9" fill="none" stroke-linejoin="round"/>' + flowDots(bp.vein, t, 8, .3 * (1 - at(u, d - 1.6, .6)), 4.5, "#dbe6ee"), k);
  s += heartBeat(bp.heart[0], bp.heart[1], 18, t) + G("", tag("القلب لوحده؟", 470, 200, 1, 28, INK), at(u, .5, .3));
  s += cross(470, 300, 1.3, at(u, d - 1.2, .5)) + G("", T("لأ", 470, 400, 44, ORANGE, 800), at(u, d - .8, .3));
  return s;
});
// 21 · without the calf, the blood stays down
shot(21, push(300, 560, 1.12, 1.2), function (u, d, t) {
  var c = legCut({ pool: 1, flow: t * .02, valves: [0, 0, 0] }), s = paper() + dim(.4, c.svg), lo = c.S(.84, 30);
  s += '<ellipse cx="' + f(lo[0]) + '" cy="' + f(lo[1]) + '" rx="54" ry="84" fill="' + VEIN + '" opacity="' + f(.24 + .06 * Math.sin(t * 2)) + '"/>' + tag("واقف", 440, 700, at(u, .6, .3), 30, BLUE);
  s += cross(CALF[0], CALF[1], .9, at(u, .3, .5));
  return s;
});
// 22–23 · «يعني من الآخر»: still → pooled; bounce → calf → back to the heart
shot(22, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var a = seatedAt(0, { s: .95, fl: 620, x: 420 }), s = paper() + G("translate(0 -40)", a.svg), lo = [a.L.ank[0] + 4, a.L.ank[1] - 70];
  s += G("translate(0 -40)", '<ellipse cx="' + f(lo[0]) + '" cy="' + f(lo[1]) + '" rx="22" ry="44" fill="' + VEIN + '" opacity=".5"/>', at(u, .8, .6)) + callout("1", 90, 120, at(u, .2, .3), 22);
  s += G("", tag("الدم واقف", 200, 680, 1, 30, BLUE), at(u, 1.2, .3));
  return s;
});
shot(23, push(320, 420, 1.02, 0.98), function (u, d, t) {
  var b = bounce(t), a = seatedAt(b, { s: .95, fl: 620, x: 420 }), bp = bodyPaths(a), s = paper() + G("translate(0 -40)", a.svg + '<path d="M' + bp.vein.map(pp).join(" L") + '" stroke="' + VEIN + '" stroke-width="7" fill="none" stroke-linejoin="round"/>' + flowDots(bp.vein, t, 8, .4, 4, "#dbe6ee") + heartBeat(bp.heart[0], bp.heart[1], 14, t));
  s += callout("2", 90, 120, at(u, .2, .3), 22) + G("", tag("السمانة بتعصر", 200, 680, 1, 28, OLIVE), at(u, .4, .3)) + G("", callout("3", 520, 150, 1, 22) + tag("الدم للقلب", 470, 220, 1, 28, ORANGE), at(u, d * .5, .3));
  return s;
});
// 24 · the odd fact: soldiers standing still on parade sometimes faint — the blood pooled in their legs
shot(24, push(330, 460, 1.0, 1.08), function (u, d, t) {
  var c = window.CHUNKS[24], D = LN[24].end - LN[24].start, k1 = at(u, D * c[1], 1.2), k2 = at(u, D * c[2], .5), k3 = at(u, D * c[3], .5), s = paper() + floor(720), fall = k1;
  [120, 520].forEach(function (x) { s += whole(standing(x, 720, .9)); });
  var m = standing(0, 0, .9);
  s += G("translate(320 720) rotate(" + f(-72 * ease(fall)) + ")", whole(standing(0, 0, .9)));
  s += G("", '<path d="M110 640 v-120 M530 640 v-120" stroke="' + VEIN + '" stroke-width="10" stroke-linecap="round" opacity=".55"/>', k2);
  s += inset(470, 220, 110, G("translate(" + f(-CALF[0]) + " " + f(-CALF[1] - 60) + ")", paper() + legCut({ pool: 1, flow: t * .02, valves: [0, 0, 0] }).svg), k2);
  s += G("", brainIcon(150, 200, 1.1, "#cbbfb4") + T("مفيش دم كفاية", 150, 290, 22, ORANGE, 800), k3);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: someone at a desk bouncing a leg. line 1: «بطّل!» from off-frame. line 2: an inset into the calf with a question mark
  var b = bounce(t), a = seatedAt(b, { s: 1.25, fl: 640, x: 430 }), s = a.svg;
  if (li >= 1) { var u = t - LN[1].start; s += G("", '<path d="M40 70 h230 a20 20 0 0 1 20 20 v60 a20 20 0 0 1 -20 20 h-150 l-30 30 v-30 h-50 a20 20 0 0 1 -20 -20 v-60 a20 20 0 0 1 20 -20 z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + T("بطّل تهز رجلك!", 160, 132, 28, ORANGE, 800), ease(u / .3)); }
  if (li >= 2) { var v = t - LN[2].start, cut = legCut({ lift: b, sq: b, flow: t * .45, hl: "calf", chev: 1 }); s += inset(150, 320, 92, G("translate(" + f(-CALF[0] + 20) + " " + f(-CALF[1] + 10) + ")", paper() + cut.svg), ease(v / .4)) + G("", T("؟", 275, 350, 70, ORANGE, 800), ease((v - .5) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  var b = bounce(t); return G("translate(-10 -40) scale(.3)", legCut({ lift: b, sq: b, flow: t * .45, hl: "calf", chev: 1 }).svg);
};
SCENE.outro = function (svg, u, t) {
  var b = bounce(t), a = seatedAt(0, { s: .55, fl: 270, x: 200 }), c = seatedAt(b, { s: .55, fl: 270, x: 520 });
  return a.svg + G("", c.svg) + callout("1", 60, 60, ease(u / .3)) + callout("2", 380, 60, ease(u / .3 - .5)) +
    G("translate(330 30) scale(.16)", pump2(320, 390, b, b, "", t), ease(u / .3 - 1)) + callout("3", 300, 160, ease(u / .3 - 1)) + callout("4", 560, 160, ease(u / .3 - 1.5));
};
