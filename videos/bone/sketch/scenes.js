window.CHUNKS = [[0.0, 0.2963], [0.0, 0.6122], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.3582, 0.7313], [0.0, 0.5], [0.0, 0.3133, 0.7349], [0.0, 0.3537], [0.0], [0.0, 0.1753, 0.6495], [0.0, 0.3548, 0.7419], [0.0], [0.0, 0.4691, 0.6914], [0.0, 0.4118], [0.0, 0.2857, 0.6429], [0.0], [0.0, 0.4839], [0.0, 0.4394, 0.7121], [0.0, 0.1485, 0.4356, 0.6931], [0.0, 0.5102], [0.0, 0.5577], [0.0, 0.2206, 0.4265, 0.7206], [0.0, 0.3679, 0.6509], [0.0], [0.0]];
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

// ── «إزاي العضم بيلتئم بعد الكسر؟» — drawings. Shapes follow the «طب إزاي؟» reference (sheets v07 hand and X-ray,
// v20 tissue cut-aways) and real references (refs/SOURCES.md): a long bone cut lengthwise (periosteum, compact cortex
// with osteon lines, yellow marrow with fat cells, the nutrient artery), and the four textbook stages of fracture repair:
// fracture haematoma, soft callus (fibrocartilage collar outside + internal callus), hard callus (woven bone, from the
// ends towards the gap), remodelling (osteoclasts take the bulge back).

// materials
var BONE = "#ece2c8", OSTEON = "#d3c39c", PERI = "#c98a72", MARROW = "#e6c06a", FAT = "#d6ab52", BLOOD = "#9e3327", BLOOD_D = "#74241b",
    CART = "#b9c8c5", CART_D = "#8fa6a3", WOVEN = "#e0cfa2", WOVEN_D = "#c9b27c", MUS = "#e6cbbb", MUS_L = "#d3ab97", CAST = "#f2eee4", CAST_L = "#d9d2c1", XR = "#24211d";

// ── the long bone, cut lengthwise and seen a little from above (a half-cylinder, like the SEER cut-away in refs/):
// the flat cut face in front (periosteum, cortex, marrow) and the round outer surface of the back half above it ──
var CX = 320, CY = 400, HO = 100, HI = 56, E = 44;   // half-heights: outer surface, marrow cavity; E = depth of the round top
var FR = [[-22, -HO - E - 6], [-14, -116], [-4, -82], [-17, -50], [6, -16], [-6, 20], [15, 56], [3, 88], [17, 116]];   // the jagged break
function frPath(dx, dy) { return FR.map(function (p, i) { return (i ? "L" : "M") + f(CX + p[0] + dx) + " " + f(CY + p[1] + (dy || 0)); }).join(" "); }
function clipSide(side, dx, inner) {   // keep only the part of `inner` left (side -1) or right (+1) of the break
  var id = "fr" + (++CLIPN), far = side < 0 ? -2000 : 2600, pts = FR.map(function (p) { return f(CX + p[0] + dx) + " " + f(CY + p[1]); });
  var d = "M" + far + " " + f(CY - HO - E - 6) + " L" + pts.join(" L") + " L" + far + " " + f(CY + 116) + " Z";
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>';
}
var AP = (function () { var d = ""; for (var x = -400; x <= 1100; x += 10) d += (x > -400 ? " L" : "M") + x + " " + f(CY + 14 + 7 * Math.sin(x * .02)); return d; })();
function artY(x) { return CY + 14 + 7 * Math.sin(x * .02); }
// the round top of the back half: periosteum in three flat tones (lit edge, mid, shade with hatching) and surface vessels
function boneTop(t) {
  var X0 = -700, W = 2000, y0 = CY - HO - E, s = "";
  s += R(X0, y0, W, E, "#a96d58", 0) + R(X0, y0 + E * .3, W, E * .7, PERI, 0) + R(X0, y0 + E * .72, W, E * .28, "#dfa58d", 0);
  s += '<g opacity=".55">' + hatch("M" + X0 + " " + y0 + " h" + W + " v" + f(E * .3) + " h" + (-W) + " Z") + '</g>';
  for (var k = 0; k < 9; k++) { var x = -260 + k * 150, d = "M" + x + " " + f(y0 + E - 2); for (var j = 1; j <= 6; j++) d += " L" + f(x + j * 22 + 6 * Math.sin(j * 2 + k)) + " " + f(y0 + E - 2 - j * E / 6.5); s += '<path d="' + d + '" stroke="#b5452f" stroke-width="2" fill="none" opacity=".8"/>'; }
  s += '<path d="M' + X0 + ' ' + f(y0 + E - 5) + ' H1300" stroke="#f1cbb8" stroke-width="2.5" opacity=".8"/>';   // highlight along the lit edge
  return s + '<path d="M' + X0 + ' ' + y0 + ' H1300" stroke="' + INK + '" stroke-width="2.4"/>';
}
// the flat cut face (whole, unbroken): periosteum, cortex with osteons, marrow with fat cells, the nutrient artery
function boneFace(t, o) {
  o = o || {}; var X0 = -700, W = 2000, s = "", k;
  s += R(X0, CY - HO, W, HO * 2, PERI, 0) + R(X0, CY - HO + 6, W, HO * 2 - 12, BONE, 0);
  s += R(X0, CY + HO - 26, W, 20, "#ddd0b0", 0);                                    // the lower cortex a shade darker (it faces down)
  for (k = 0; k < 5; k++) { var y1 = CY - HO + 12 + k * 7, y2 = CY + HI + 6 + k * 7;
    s += '<path d="M' + X0 + ' ' + y1 + ' H1300 M' + X0 + ' ' + y2 + ' H1300" stroke="' + OSTEON + '" stroke-width="1.4" stroke-dasharray="' + (30 + k * 7) + ' 6"/>'; }
  for (k = 0; k < 70; k++) { var lx = -300 + hash(k) * 1250, ly = (k % 2 ? CY - HO + 10 : CY + HI + 4) + hash(k + 7) * 34; s += '<ellipse cx="' + f(lx) + '" cy="' + f(ly) + '" rx="2.6" ry="1.3" fill="#b9a678"/>'; }
  s += R(X0, CY - HI, W, HI * 2, MARROW, 0) + R(X0, CY - HI, W, 12, "#c99f45", 0);   // marrow; shade under the upper cortex = it is a hollow
  for (k = 0; k < 60; k++) { var mx = -300 + hash(k + 90) * 1250, my = CY - HI + 14 + hash(k + 33) * (HI * 2 - 22), r = 4 + hash(k + 5) * 6;
    s += '<circle cx="' + f(mx) + '" cy="' + f(my) + '" r="' + f(r) + '" fill="#efd28c" stroke="' + FAT + '" stroke-width="1.3"/><circle cx="' + f(mx - r * .3) + '" cy="' + f(my - r * .3) + '" r="' + f(r * .3) + '" fill="#f8e7b8"/>'; }
  if (!o.noVessel) {   // the artery: it pulses with the heartbeat and red cells run along it
    var beat = 1 + .25 * Math.max(0, Math.sin(t * 7.5)) * (Math.sin(t * 3.75) > 0 ? 1 : 0);
    s += '<path d="' + AP + '" stroke="' + INK + '" stroke-width="' + f(8 * beat) + '" fill="none"/><path d="' + AP + '" stroke="#b5452f" stroke-width="' + f(5 * beat) + '" fill="none"/><path d="' + AP + '" stroke="#d9806a" stroke-width="1.5" fill="none" transform="translate(0 -1.5)"/>';
    for (k = 0; k < 40; k++) { var cx = -300 + ((k * 38 + t * 70) % 1300); s += '<ellipse cx="' + f(cx) + '" cy="' + f(artY(cx)) + '" rx="3.2" ry="1.8" fill="#7a2219"/>'; }
    [[-60, -1], [120, 1], [470, -1], [640, 1]].forEach(function (b) { var bx = b[0], by = artY(bx);
      s += '<path d="M' + bx + ' ' + f(by) + ' Q' + (bx + 26) + ' ' + f(by + b[1] * 30) + ' ' + (bx + 34) + ' ' + f(CY + b[1] * (HO - 4)) + '" stroke="#b5452f" stroke-width="3" fill="none"/>'; });
  }
  s += '<path d="M' + X0 + ' ' + (CY - HO) + ' H1300 M' + X0 + ' ' + (CY + HO) + ' H1300" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + X0 + ' ' + (CY - HO + 6) + ' H1300 M' + X0 + ' ' + (CY + HO - 6) + ' H1300" stroke="' + INK + '" stroke-width="1"/>';
  return s + '<path d="M' + X0 + ' ' + (CY - HI) + ' H1300 M' + X0 + ' ' + (CY + HI) + ' H1300" stroke="' + INK + '" stroke-width="1.8"/>';
}
function boneBody(t, o) { return boneTop(t) + boneFace(t, o); }
// muscle round the bone: rounded bundles along the arm, each lit on top and shaded underneath; they swell a little in turn
function muscle(t) {
  var s = R(-700, -400, 2000, 1600, "#d3a594", 0), k;
  for (k = 0; k < 22; k++) {
    var yc = -330 + k * 64, h = 60 + 4 * Math.sin(t * 1.3 + k);
    if (yc > CY - HO - E - 40 && yc < CY + HO + 30) continue;
    s += '<path d="M-700 ' + f(yc - h / 2) + ' Q320 ' + f(yc - h / 2 - 8 * Math.sin(k)) + ' 1300 ' + f(yc - h / 2) + ' L1300 ' + f(yc + h / 2) + ' Q320 ' + f(yc + h / 2 - 8 * Math.sin(k)) + ' -700 ' + f(yc + h / 2) + ' Z" fill="' + MUS + '" stroke="' + MUS_L + '" stroke-width="1.6"/>';
    s += '<path d="M-700 ' + f(yc - h / 2 + 7) + ' Q320 ' + f(yc - h / 2 + 7 - 8 * Math.sin(k)) + ' 1300 ' + f(yc - h / 2 + 7) + '" stroke="#f1dccf" stroke-width="3" fill="none"/>';
    s += '<path d="M-700 ' + f(yc + h / 2 - 9) + ' Q320 ' + f(yc + h / 2 - 9 - 8 * Math.sin(k)) + ' 1300 ' + f(yc + h / 2 - 9) + ' L1300 ' + f(yc + h / 2) + ' Q320 ' + f(yc + h / 2 - 8 * Math.sin(k)) + ' -700 ' + f(yc + h / 2) + ' Z" fill="#cf9f8c"/>';
  }
  return s + R(-700, CY + HO, 2000, 26, INK, 0, 0, ' opacity=".18"');   // the bone's shadow on the muscle under it
}
// the callus collar round the bone (its cut section above and below the face, its back half over the round top). b = bulge
function collar(dx, b, lift) {
  var x0 = CX - 170, x1 = CX + 170 + dx, m = CX + dx / 2, top = CY - HO + 4 - (lift || 0), bot = CY + HO - 4;
  return "M" + x0 + " " + top + " C" + (x0 + 70) + " " + top + " " + (m - 60) + " " + f(top - b) + " " + m + " " + f(top - b) + " C" + (m + 60) + " " + f(top - b) + " " + (x1 - 70) + " " + top + " " + x1 + " " + top +
         " L" + x1 + " " + bot + " C" + (x1 - 70) + " " + bot + " " + (m + 60) + " " + f(bot + b) + " " + m + " " + f(bot + b) + " C" + (m - 60) + " " + f(bot + b) + " " + (x0 + 70) + " " + bot + " " + x0 + " " + bot + " Z";
}
// the collar's outer surface over the round top: a dome from the face edge up over the back
function dome(dx, b) { var x0 = CX - 175, x1 = CX + 175 + dx, m = CX + dx / 2, y = CY - HO + 2, pk = CY - HO - E - b * .95;
  return "M" + x0 + " " + y + " C" + (x0 + 60) + " " + y + " " + (m - 90) + " " + f(pk) + " " + m + " " + f(pk) + " C" + (m + 90) + " " + f(pk) + " " + (x1 - 60) + " " + y + " " + x1 + " " + y + " Z"; }
// k: how many of the texture's cells are there yet (they multiply as the callus grows)
function texCart(x, y, w, h, k) { var s = "", n = Math.round(90 * (k == null ? 1 : clamp(k))), j; for (j = 0; j < n; j++) { var cx = x + hash(j + 300) * w, cy = y + hash(j + 400) * h; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="4.5" ry="3" fill="#e4ecea" stroke="' + CART_D + '" stroke-width="1.1"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="1.3" fill="' + CART_D + '"/>'; } return s; }
function texWoven(x, y, w, h) { var s = "", k; for (k = 0; k < 80; k++) { var cx = x + hash(k + 500) * w, cy = y + hash(k + 600) * h; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(4 + hash(k) * 6) + '" ry="' + f(3 + hash(k + 1) * 4) + '" transform="rotate(' + f(hash(k + 2) * 180) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + WOVEN_D + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; }
function clipTo(d, inner) { var id = "cp" + (++CLIPN); return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>'; }
function clotPath(m, k, t, sx, sy) { var d = "", n = 28, i; for (i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, r = 1 + .1 * Math.sin(a * 5 + 1) + .03 * Math.sin(t * 2 + a * 3), rx = (40 + 70 * k) * r, ry = (60 + 75 * k) * r; d += (i ? " L" : "M") + f(m + sx + Math.cos(a) * rx) + " " + f(CY + sy + Math.sin(a) * ry); } return d + " Z"; }
// the haematoma: a dark clot filling the gap and bulging out under the torn periosteum, with depth (a darker back copy)
function clot(dx, k, t) {
  if (k <= 0) return ""; var m = CX + dx / 2, d = clotPath(m, k, t, 0, 0), s = P(clotPath(m, k * .92, t, 8, -E * .7), BLOOD_D, 2) + P(d, BLOOD, 2.2);
  s += clipTo(d, (function () { var r = "", j; for (j = 0; j < 26; j++) { var x = m - 110 + hash(j + 70) * 220, y = CY - 140 + hash(j + 80) * 280; r += '<path d="M' + f(x) + ' ' + f(y) + ' l' + f(30 - hash(j) * 60) + ' ' + f(20 - hash(j + 3) * 40) + '" stroke="#d27a66" stroke-width="1.3"/>'; }
    for (j = 0; j < 30; j++) r += '<ellipse cx="' + f(m - 110 + hash(j + 170) * 220 + 3 * Math.sin(t + j)) + '" cy="' + f(CY - 140 + hash(j + 180) * 280) + '" rx="5" ry="3.4" fill="#b84a3a" stroke="' + BLOOD_D + '" stroke-width="1"/>'; return r; })());
  return s + '<ellipse cx="' + f(m - 30 * k) + '" cy="' + f(CY - 60 * k) + '" rx="' + f(16 * k) + '" ry="' + f(9 * k) + '" fill="#d77d6a" opacity=".7"/>';
}
// o: {frac 0..1 (crack appears), gap px, clot 0..1, soft 0..1, hard 0..1, remodel 0..1, healed 0..1, noMuscle}
function boneCut(t, o) {
  o = o || {}; var gap = o.gap || 0, s = o.noMuscle ? "" : muscle(t), cd, callus = "";
  var bulge = 58 * clamp(o.soft || 0) * (1 - .85 * (o.remodel || 0)), hk = clamp(o.hard || 0);
  if (o.soft > 0) {
    var one = function (lift, back) {   // one layer of the collar: the back half (lifted, darker) or the cut section in front
      var d = back ? dome(gap, bulge) : collar(gap, bulge, 0), r = P(d, back ? CART_D : CART, 2.2) + (back ? clipTo(d, R(CX - 200, CY - HO - E - 120, 420 + gap, E * .6 + 120, "#a3b8b5", 0) + '<g opacity=".4">' + hatch("M-2000 -2000 H2600 V" + (CY - HO - E * .6) + " H-2000 Z") + '</g>') : "") + (back ? "" : clipTo(d, texCart(CX - 180, CY - 220, 380 + gap, 390, o.soft)));
      if (hk > 0) { var wL = 170 * hk, x0 = CX - 170, x1 = CX + 170 + gap, inn = '<path d="' + d + '" fill="' + (back ? WOVEN_D : WOVEN) + '"/>' + (back ? "" : clipTo(d, texWoven(CX - 180, CY - 220, 380 + gap, 390))) + '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
        r += sweep(x0 - 2, CY - 260, wL + 2, 480, 1, "r", inn) + sweep(x1 - wL, CY - 260, wL + 2, 480, 1, "r", inn); }
      return r;
    };
    callus = one(0, true) + one(0, false);
    s += G("", callus, 1 - clamp(o.healed || 0));
  }
  s += clot(gap, (o.clot || 0) * (1 - clamp(o.soft || 0)), t);
  var body = boneBody(t, o);
  if (o.frac > 0) {
    s += clipSide(-1, 0, body) + G("translate(" + f(gap) + " 0)", clipSide(1, 0, body));
    s += draw(frPath(0), o.frac, INK, 2.6) + (gap > .5 ? draw(frPath(gap), o.frac, INK, 2.6) : "");
    if (o.soft > 0) { var mc = CX + gap / 2, ic = "M" + f(mc - 90) + " " + CY + " C" + f(mc - 60) + " " + (CY - HI - 4) + " " + f(mc + 60) + " " + (CY - HI - 4) + " " + f(mc + 90) + " " + CY + " C" + f(mc + 60) + " " + (CY + HI + 4) + " " + f(mc - 60) + " " + (CY + HI + 4) + " " + f(mc - 90) + " " + CY + " Z";
      s += G("", clipTo(ic, '<rect x="' + (CX - 100) + '" y="' + (CY - HI) + '" width="' + (200 + gap) + '" height="' + (2 * HI) + '" fill="' + (hk > .6 ? WOVEN : CART) + '"/>' + (hk > .6 ? texWoven(CX - 80, CY - HI, 160 + gap, 2 * HI) : texCart(CX - 80, CY - HI, 160 + gap, 2 * HI, o.soft))) + '<path d="' + ic + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="5 4"/>', clamp(o.soft * 1.5) * (1 - (o.remodel || 0))); }
    // the collar's parts that wrap over the top and bottom of the bone stay in front of it
    if (callus) s += G("", clipTo("M-2000 -2000 H2600 V" + (CY - HO) + " H-2000 Z M-2000 " + (CY + HO) + " H2600 V2600 H-2000 Z", callus), 1 - clamp(o.healed || 0));
  } else s += body;
  if (o.healed > 0) s += G("", boneBody(t, o), clamp(o.healed));
  return s;
}

// ── cells ──
function osteoblast(x, y, k, rot) { if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") rotate(" + (rot || 0) + ") scale(" + f(pop(k)) + ")", '<ellipse cx="2" cy="8" rx="10" ry="3" fill="' + INK + '" opacity=".2"/><rect x="-9" y="-7" width="18" height="14" rx="4" fill="#8f9a5a" stroke="' + INK + '" stroke-width="1.4"/><rect x="-6" y="-5" width="9" height="3" rx="1.5" fill="#bcc68a"/><circle cx="1" cy="0" r="3.4" fill="' + INK + '"/>'); }
function osteoclast(x, y, k, t) {
  if (k <= 0) return ""; var w = 1 + .05 * Math.sin(t * 3 + x);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(pop(k) * w) + " " + f(pop(k) / w) + ")",
    '<ellipse cx="3" cy="12" rx="36" ry="5" fill="' + INK + '" opacity=".2"/><path d="M-34 6 C-38 -14 -18 -26 0 -24 C20 -26 38 -14 34 6 L30 6 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 l-4 -5 l-4 5 Z" fill="#c9704b" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M-26 -12 C-20 -20 -6 -22 6 -21" stroke="#e8a383" stroke-width="4" fill="none" stroke-linecap="round"/>' + [-17, -4, 9, 20].map(function (nx, i) { return '<ellipse cx="' + nx + '" cy="' + (-10 + (i % 2) * 6) + '" rx="5" ry="4" fill="#f0d6c4" stroke="' + INK + '" stroke-width="1"/>'; }).join(""));
}
function macrophage(x, y, k, t, i) {
  if (k <= 0) return ""; var d = "", n = 14, j; for (j = 0; j <= n; j++) { var a = j / n * Math.PI * 2, r = 15 + 4 * Math.sin(a * 3 + t * 3 + (i || 0)); d += (j ? " L" : "M") + f(Math.cos(a) * r) + " " + f(Math.sin(a) * r); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(pop(k)) + ")", '<ellipse cx="3" cy="17" rx="16" ry="4" fill="' + INK + '" opacity=".18"/>' + P(d + " Z", "#e6d8bd", 1.6) + '<ellipse cx="-5" cy="-7" rx="6" ry="3" fill="#fbf4e6"/><path d="M-5 -4 q6 -6 10 0 q-2 6 -10 4 z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1"/>');
}
function chip(x, y, r, k) { if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ")", '<path d="M' + -r + ' 0 L' + f(-r * .3) + ' ' + f(-r * .8) + ' L' + r + ' ' + f(-r * .2) + ' L' + f(r * .5) + ' ' + f(r * .7) + ' Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="1.4"/>', clamp(k)); }

// ── the hand and forearm, palm down, seen from above (reference v07): bones as outlined capsules ──
// segments [x1, y1, x2, y2, w]; the skin is the same skeleton drawn fatter
var BONES = [
  [252, 900, 268, 360, 30], [256, 380, 276, 336, 52], [372, 900, 362, 350, 22], [364, 360, 370, 330, 20],   // radius (thumb side), ulna
  [262, 318, 284, 312, 18], [294, 306, 316, 310, 18], [326, 310, 346, 314, 18], [356, 318, 368, 326, 16],   // proximal carpals
  [258, 288, 272, 284, 17], [286, 280, 304, 280, 17], [314, 282, 330, 284, 16], [340, 288, 356, 294, 17],   // distal carpals
  [250, 280, 214, 214, 15], [214, 214, 196, 176, 13], [196, 176, 186, 146, 11],                               // thumb
  [282, 272, 278, 176, 13], [278, 176, 276, 122, 11], [276, 122, 275, 90, 10], [275, 90, 275, 66, 9],         // index
  [312, 272, 314, 166, 13], [314, 166, 316, 106, 11], [316, 106, 317, 70, 10], [317, 70, 318, 46, 9],         // middle
  [338, 276, 346, 176, 12], [346, 176, 352, 122, 11], [352, 122, 355, 88, 10], [355, 88, 357, 66, 9],         // ring
  [360, 284, 374, 196, 11], [374, 196, 384, 152, 10], [384, 152, 389, 126, 9], [389, 126, 392, 106, 8]];      // little
var FINGERS = [[12, 15, 2], [15, 19, 4], [19, 23, 4], [23, 27, 4], [27, 31, 4]];   // index ranges (thumb..little) for the skin
function caps(list, w0, col, ink) { return list.map(function (b) { return '<path d="M' + b[0] + ' ' + b[1] + ' L' + b[2] + ' ' + b[3] + '" stroke="' + col + '" stroke-width="' + f(b[4] + w0) + '" stroke-linecap="round"/>'; }).join(""); }
var PALM = "M232 300 C226 250 244 200 262 180 L392 192 C396 230 388 290 380 330 L366 380 L250 380 Z";
function arm(o) {   // o: {skin 0..1, xray, cast 0..1, swell 0..1, frac 0..1 (radius break), callus 0..1, healedLine}
  o = o || {}; var s = "", sw = o.swell || 0;
  var fingers = BONES.slice(12).map(function (b) { return [b[0], b[1], b[2], b[3], b[4] + 22]; });
  if (o.skin !== 0) {
    // the forearm as one tapered shape (wider near the elbow), swelling on the thumb side over the break when sw > 0
    var fa = "M190 920 C196 760 204 600 " + f(214 - 52 * sw) + " " + f(470) + " C" + f(218 - 46 * sw) + " 420 222 392 228 360 L388 360 C390 392 " + f(394 + 10 * sw) + " 420 " + f(398 + 12 * sw) + " 470 C404 600 412 760 420 920 Z";
    var sk = '<path d="' + PALM + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' + caps(fingers, 4, INK) + '<path d="' + fa + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
             '<path d="' + PALM + '" fill="' + SKIN + '"/>' + caps(fingers, 0, SKIN) + '<path d="' + fa + '" fill="' + SKIN + '"/>' + shade3d(fingers, sw);
    if (sw > 0) sk += '<ellipse cx="236" cy="450" rx="' + f(30 * sw) + '" ry="' + f(46 * sw) + '" fill="#a77a8a" opacity=".35"/><path d="M' + f(206 - 30 * sw) + ' 430 q-6 40 6 80" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity="' + f(sw) + '"/>';
    s += G("", sk, o.xray ? .28 : 1);
  }
  if (o.xray || o.bones) {
    var col = o.xray ? "#f1eee6" : BONE, list = BONES.slice();
    var bs = caps(list, 3, o.xray ? "#9c978c" : INK) + caps(list, 0, col) + (o.xray ? caps(list.map(function (b) { return [b[0] + b[4] * .18, b[1], b[2] + b[4] * .18, b[3], b[4] * .3]; }), 0, "#cfcabd") : caps(list.map(function (b) { return [b[0] + b[4] * .2, b[1], b[2] + b[4] * .2, b[3], b[4] * .32]; }), 0, OSTEON));
    if (o.frac > 0) {   // a break across the radius, 70 px above the wrist
      var fy = 450, g = 4 * o.frac;
      bs += '<path d="M228 ' + (fy - 6) + ' l10 8 l9 -10 l10 12 l9 -8 l10 10 l9 -6 l8 6" stroke="' + (o.xray ? XR : INK) + '" stroke-width="' + f(3 + g) + '" fill="none" opacity="' + f(o.frac) + '"/>';
    }
    if (o.callus > 0) bs += '<ellipse cx="262" cy="452" rx="' + f(24 + 6 * o.callus) + '" ry="' + f(22 * o.callus) + '" fill="' + (o.xray ? "#d9d4c8" : WOVEN) + '" stroke="' + (o.xray ? "#9c978c" : INK) + '" stroke-width="2" opacity=".9"/>' + caps([BONES[0]], 0, col).replace('stroke-width="30"', 'stroke-width="26"');
    s += bs;
  }
  if (o.cast > 0) {   // a short arm cast: from below the elbow to the palm crease, thumb out through a hole
    var cs = '<path d="M196 920 L204 420 C206 360 214 310 236 260 L392 230 C398 300 404 360 412 420 L420 920 Z" fill="' + CAST + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    for (var k = 0; k < 18; k++) { var y = 900 - k * 36; cs += '<path d="M' + (200 + k * .2) + ' ' + y + ' L' + (416 - k * .6) + ' ' + (y - 22) + '" stroke="' + CAST_L + '" stroke-width="2"/>'; }
    cs += '<path d="M350 920 L346 420 C344 360 354 300 384 236 L392 232 C398 300 404 360 412 420 L420 920 Z" fill="' + CAST_L + '" opacity=".8"/><path d="M214 900 L218 430 C220 370 230 320 250 272" stroke="#fffdf6" stroke-width="7" fill="none" stroke-linecap="round"/>';
    cs += '<path d="M236 260 C232 250 240 236 254 234 L388 222 C398 222 398 232 392 240" fill="#e5ddca" stroke="' + INK + '" stroke-width="2"/>';
    cs += '<ellipse cx="236" cy="268" rx="26" ry="18" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';   // thumb hole
    s += sweep(150, 200, 320, 760, o.cast, "u", cs) + (o.cast >= 1 ? caps(fingers.slice(0, 3), 4, INK) + caps(fingers.slice(0, 3), 0, SKIN) : "");
  }
  return s;
}
// skin in the round: a shade stripe down the right side of every finger and the forearm, nails, knuckle creases
function shade3d(fingers, sw) {
  var s = caps(fingers.map(function (b) { return [b[0] + b[4] * .27, b[1], b[2] + b[4] * .27, b[3], b[4] * .3]; }), 0, SKIN2);
  s += '<path d="M352 920 C350 760 352 600 ' + f(360 + 10 * sw) + ' 470 C358 420 358 392 360 360 L388 360 C390 392 ' + f(394 + 10 * sw) + ' 420 ' + f(398 + 12 * sw) + ' 470 C404 600 412 760 420 920 Z" fill="' + SKIN2 + '"/>';
  s += '<path d="M226 900 C230 700 236 560 242 430" stroke="#ecc3ad" stroke-width="8" fill="none" stroke-linecap="round"/>';
  [3, 7, 11, 15].forEach(function (i) { var b = fingers[i]; s += '<path d="M' + f(b[2] - 5) + ' ' + f(b[3] + 6) + ' q5 -5 10 0" fill="#f1d3c3" stroke="' + INK + '" stroke-width="1.2"/>'; });   // nails at the tips
  [1, 5, 9, 13].forEach(function (i) { var b = fingers[i]; s += '<path d="M' + f(b[0] - 7) + ' ' + f(b[1] + 2) + ' q7 4 14 0" stroke="' + BROWN + '" stroke-width="1.4" fill="none"/>'; });   // knuckle creases
  return s;
}
function xrayPlate(x, y, w, h) { return R(x, y, w, h, XR, 2.4) + '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="' + (h - 16) + '" fill="none" stroke="#5e653a" stroke-width="5"/>'; }

// ── the bone surface up close (rule shot): builders lay down new bone on the left, an eater digs a pit on the right ──
function surface(u, t) {
  var s = '<path d="M-100 420 L-40 360 H820 L760 420 Z" fill="#f4ecd8" stroke="' + INK + '" stroke-width="2.4"/>' + R(-100, 420, 860, 500, BONE, 2.4) + R(-100, 420, 860, 14, "#ddd0b0", 0), k;
  for (k = 0; k < 14; k++) s += '<path d="M' + (-60 + k * 64) + ' 380 l40 0" stroke="' + OSTEON + '" stroke-width="2"/>';
  for (k = 0; k < 9; k++) s += '<path d="M-100 ' + (450 + k * 30) + ' H760" stroke="' + OSTEON + '" stroke-width="2" stroke-dasharray="' + (40 + k * 9) + ' 8"/>';
  for (k = 0; k < 40; k++) s += '<ellipse cx="' + f(-80 + hash(k + 5) * 820) + '" cy="' + f(440 + hash(k + 15) * 330) + '" rx="5" ry="2.4" fill="#b9a678"/>';
  // new layer laid by the builders (olive), growing with time
  var nl = 26 * clamp((u - .6) / 2.5) + 4 * Math.sin(t * 1.5);
  s += '<path d="M-100 420 H300 V' + f(420 - nl) + ' H-100 Z" fill="#e8dcb8" stroke="' + INK + '" stroke-width="1.6"/>';
  for (k = 0; k < 7; k++) s += big(-60 + k * 50, 410 - nl, 1.8, osteoblast(-60 + k * 50, 410 - nl, at(u, .3 + k * .08, .3)));
  // the pit dug by the eater
  var pit = 26 + 18 * clamp((u - .6) / 2.5);
  s += '<path d="M380 420 C420 420 420 ' + f(420 + pit) + ' 480 ' + f(420 + pit) + ' C540 ' + f(420 + pit) + ' 540 420 580 420" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>';
  s += big(480, 420 + pit * .3, 1.7, osteoclast(480, 420 + pit * .3, at(u, .5, .4), t));
  for (k = 0; k < 6; k++) { var a = (t * .8 + k / 6) % 1; s += '<circle cx="' + f(470 + 20 * Math.sin(k * 2)) + '" cy="' + f(400 - a * 90) + '" r="3" fill="' + ORANGE + '" opacity="' + f(1 - a) + '"/>'; }
  return s;
}

function big(x, y, k, inner) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + k + ') translate(' + f(-x) + ' ' + f(-y) + ')', inner); }
// ── analogy icons (drawn round 0,0 for iconBox) ──
function icoScaffold() { var s = ""; [-30, 0, 30].forEach(function (x) { s += '<path d="M' + x + ' -38 V38" stroke="' + INK + '" stroke-width="4"/>'; }); [-24, 4, 32].forEach(function (y) { s += '<path d="M-38 ' + y + ' H38" stroke="' + ORANGE + '" stroke-width="4"/>'; }); return s + '<path d="M-30 32 L0 4 M0 32 L30 4 M-30 4 L0 -24" stroke="' + INK + '" stroke-width="2"/>'; }
function icoTrowel() { return '<path d="M-36 24 C-30 6 30 6 38 24 Z" fill="#a9a59a" stroke="' + INK + '" stroke-width="2"/><path d="M-8 -6 L22 -30 L32 -20 L4 4 Z" fill="#c9cfd2" stroke="' + INK + '" stroke-width="2"/><path d="M22 -30 l10 -10" stroke="' + WOOD_D + '" stroke-width="7" stroke-linecap="round"/>' + '<path d="M-20 14 q6 -6 12 0 q6 6 12 0" stroke="' + INK + '" stroke-width="1.5" fill="none"/>'; }
function icoConcrete() { return '<rect x="-36" y="-22" width="72" height="50" fill="#b7b3aa" stroke="' + INK + '" stroke-width="2"/>' + hatch("M-36 -22 h72 v50 h-72 Z") + '<path d="M-36 -22 l12 -12 h72 l-12 12 Z" fill="#cfcbc2" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -40 v-6 M0 -40 v-6 M20 -40 v-6" stroke="' + ORANGE + '" stroke-width="4"/>'; }
function icoSand(t) { var x = 8 * Math.sin(t * 6); return '<path d="M-40 18 H40" stroke="#8a8f96" stroke-width="16"/><path d="M-8 10 q8 -10 16 0" fill="#9aa0a6" stroke="' + INK + '" stroke-width="1.6"/>' + '<rect x="' + f(-22 + x) + '" y="-24" width="44" height="22" rx="3" fill="#c9a26a" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(-22 + x) + '" y="-6" width="44" height="6" fill="#8a6a40"/>'; }
function icoGlue() { return '<path d="M-30 10 L10 -26 L28 -8 L-10 28 Z" fill="#e9e4d6" stroke="' + INK + '" stroke-width="2"/><path d="M10 -26 l10 -10 l16 16 l-10 10" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + T("غرا", -4, 8, 15, INK, 800); }
function icoPill() { return G("rotate(-30)", '<rect x="-34" y="-14" width="68" height="28" rx="14" fill="#f2efe6" stroke="' + INK + '" stroke-width="2"/><path d="M0 -14 V14" stroke="' + INK + '" stroke-width="2"/><path d="M0 -14 H20 A14 14 0 0 1 20 14 H0 Z" fill="' + BLUE + '"/>'); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a pinned rule card over the bone surface
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(.6, surface(0, t)) + G("", '<rect x="150" y="170" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 245)"/>' +
    T("العضم", 320, 232, 40, OLIVE, 800) + T("عايش", 320, 284, 38, INK, 800) + C(320, 178, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · builders and eaters, always at work
shot(5, push(290, 430, 1.15, 1.25), function (u, d, t) {
  return paper() + surface(u, t) + label(90, 390, 150, 260, "خلايا بتبني", OLIVE, at(u, 1.2, .5), 26) + label(470, 450, 400, 600, "خلايا بتهد", ORANGE, at(u, 2.4, .5), 26);
}, { tr: "in" });
// 6 · the forearm, the radius inside, then the crack
shot(6, push(300, 470, 0.9, 1.05), function (u, d, t) {
  var k = at(u, .35, .3);
  return paper() + arm({ xray: false, bones: true, skin: 1 }) + G("", arm({ skin: 0, bones: true, frac: k }), 1) + label(252, 600, 140, 680, "العضم", OLIVE, at(u, .4, .5), 26) +
    (k > 0 ? '<path d="M210 450 l-20 -10 M300 446 l22 -12 M216 460 l-18 12" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(k * (1 - at(u, 2, .6))) + '"/>' : "");
});
// 6b · into the bone, cut lengthwise: it snaps
shot([6, 1], push(320, 400, 1.49, 1.30), function (u, d, t) {
  var k = at(u, .2, .5); return paper() + boneCut(t, { frac: k, gap: 14 * k }) + label(CX - 150, CY - HO, 170, 200, "الغشا", OLIVE, at(u, .9, .4), 24);
}, { tr: "in" });
// 7 · the vessels tear, blood pools round the break and clots
shot(7, push(320, 400, 1.30, 1.43), function (u, d, t) {
  var k = at(u, .6, d * .7);
  var drops = ""; for (var j = 0; j < 6; j++) { var a = ((t * .9 + j / 6) % 1); drops += '<circle cx="' + f(CX - 6 + 26 * Math.sin(j * 2.3) * a) + '" cy="' + f(CY + 14 + 50 * Math.cos(j * 1.7) * a) + '" r="' + f(5 * (1 - a) + 1) + '" fill="' + BLOOD + '" opacity="' + f(1 - k) + '"/>'; }
  return paper() + boneCut(t, { frac: 1, gap: 14, clot: k }) + drops + label(CX - 30, CY + 14, 380, 640, "الأوعية", ORANGE, at(u, .2, .5), 24) + label(CX + 60, CY - 120, 440, 190, "جلطة", ORANGE, at(u, 1.6, .5), 28);
});
// 7b · «وده الورم اللي بتشوفه»: back out to the arm, the wrist swells
shot([7, 2], push(300, 470, 1.05, 0.95), function (u, d, t) {
  return paper() + arm({ swell: at(u, .2, .8) * (1 + .03 * Math.sin(t * 3)) }) + label(190, 450, 110, 580, "ورم", ORANGE, at(u, .7, .5), 28);
}, { tr: "out" });
// 8 · the clot is a scaffold; clean-up cells come and eat the chips
shot(8, push(320, 400, 1.37, 1.49), function (u, d, t) {
  var s = paper() + boneCut(t, { frac: 1, gap: 14, clot: 1 }), j;
  for (j = 0; j < 7; j++) { var cx = CX + 7 + 70 * Math.cos(j * 1.3), cy = CY + 110 * Math.sin(j * 1.9); s += chip(cx, cy, 9, 1 - at(u, 1.6 + j * .25, .4)); s += macrophage(cx + 30 * (1 - at(u, .8 + j * .2, 1)), cy - 22, at(u, .6 + j * .15, .3), t, j); }
  return s + iconBox(450, 205, 110, icoScaffold(), at(u, .5, .3)) + label(CX + 40, CY + 90, 380, 640, "خلايا تنضّف", OLIVE, at(u, 2.2, .5), 24);
});
// 9 · how do the two ends join? the gap, a question mark
shot(9, push(320, 400, 1.45, 1.6), function (u, d, t) {
  return paper() + boneCut(t, { frac: 1, gap: 14, clot: 1 }) + T("؟", CX + 7, CY - 135 + 6 * Math.sin(t * 3), 120, ORANGE, 800);
}, { tr: "in" });
// 10 · a week later: cells from the periosteum build a cartilage bridge across the ends
shot(10, push(320, 400, 1.30, 1.37), function (u, d, t) {
  var k = at(u, 1.2, d - 1.6), s = paper() + boneCut(t, { frac: 1, gap: 14, clot: 1, soft: k }), j;
  for (j = 0; j < 12; j++) { var a = ((t * .35 + j / 12) % 1), side = j % 2 ? -1 : 1, x0 = CX - 220 + (j % 6) * 90, y0 = CY + side * (HO + 2);
    s += '<circle cx="' + f(lerp(x0, CX + 7, a)) + '" cy="' + f(lerp(y0, CY + side * (HO + 30), a)) + '" r="5" fill="#8f9a5a" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(clamp(u - .4) * (1 - a * .6)) + '"/>'; }
  return s + numBox("~1", 175, 175, at(u, .2, .3), 34) + G("", T("أسبوع", 175, 228, 24, INK, 800), at(u, .4, .3)) +
    label(CX - 150, CY + HO, 185, 640, "الغشا", OLIVE, at(u, .6, .5), 24) + label(CX + 7, CY - HO - 40, 400, 190, "غضروف", BLUE, at(u, 2.4, .5), 26);
});
// 11 · «الكالس الطري»: like wet cement, it holds but can't take a load
shot(11, push(320, 400, 1.37, 1.27), function (u, d, t) {
  var w = Math.sin(t * 2.4) * 2.5 * at(u, 1.6, .4);
  return paper() + G("rotate(" + f(w * .3) + " " + CX + " " + CY + ")", boneCut(t, { frac: 1, gap: 14, soft: 1 })) + tag("كالس طري", 250, 195, at(u, .2, .3), 34, BLUE) +
    iconBox(450, 205, 110, icoTrowel(), at(u, .9, .3)) + arrow(CX + 7, 600, CX + 7, 520, ORANGE, 7, at(u, 1.8, .4)) + G("", '<rect x="' + (CX - 30) + '" y="610" width="74" height="50" fill="#6b6f74" stroke="' + INK + '" stroke-width="2"/>' + T("وزن", CX + 7, 644, 20, "#fff", 800), at(u, 1.6, .3)) + cross(CX + 120, 600, 1, at(u, 2.4, .5));
});
// 12 · when is it real bone?
shot(12, push(320, 400, 1.35, 1.45), function (u, d, t) { return paper() + boneCut(t, { frac: 1, gap: 14, soft: 1 }) + T("؟", CX + 7, CY - 165 + 6 * Math.sin(t * 3), 110, ORANGE, 800); }, { tr: "in" });
// 13 · builders lay calcium on the cartilage: it turns into woven bone from the ends inwards
shot(13, push(320, 400, 1.37, 1.30), function (u, d, t) {
  var k = at(u, .8, d - 1), s = paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: k }), j;
  for (j = 0; j < 22; j++) { var a = ((t * .6 + j / 22) % 1), x = CX - 150 + hash(j + 11) * 320, top = j % 2; s += '<circle cx="' + f(x) + '" cy="' + f(top ? lerp(CY - 260, CY - HO - 40, a) : lerp(CY + 260, CY + HO + 40, a)) + '" r="4" fill="' + ORANGE + '" opacity="' + f(clamp(u * 2) * (1 - a)) + '"/>'; }
  for (j = 0; j < 6; j++) s += osteoblast(CX - 120 + j * 50, CY - HO - 50 - 8 * Math.sin(j), at(u, .3 + j * .1, .3), 0);
  return s + numBox("Ca", 175, 175, at(u, .4, .3), 34) + G("", T("كالسيوم", 175, 228, 22, ORANGE, 800), at(u, .6, .3)) + label(CX + 60, CY + HO + 30, 370, 650, "عضم خشن", ORANGE, at(u, 2, .5), 26);
});
// 13b · «وده اللي بيبان في الأشعة»: the X-ray shows the lump of callus round the break
shot([13, 2], push(300, 440, 1.1, 1.25), function (u, d, t) {
  return paper() + xrayPlate(150, 150, 340, 560) + G("", '<clipPath id="xr13"><rect x="158" y="158" width="324" height="544"/></clipPath><g clip-path="url(#xr13)">' + arm({ xray: true, frac: 1, callus: at(u, .3, .8) }) + '</g>', 1) +
    label(290, 452, 420, 560, "الكالس", BLUE, at(u, 1, .5), 26);
}, { tr: "out" });
// 14 · like concrete setting; 6 to 8 weeks
shot(14, push(320, 450, 1.25, 1.32), function (u, d, t) {
  var k = at(u, 1.4, 1.2), s = paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1 }) + iconBox(450, 205, 110, icoConcrete(), at(u, .2, .3));
  s += G("", R(110, 590, 420, 120, "#f4ecdb", 2.4), at(u, 1.2, .3));
  for (var j = 0; j < 8; j++) s += G("", R(125 + j * 50, 610, 40, 80, j < 6 ? "#f4ecdb" : "#efe2c9", 1.8) + R(125 + j * 50, 610, 40, 18, j < 6 ? ORANGE : "#d99a7a", 1.8) + N(String(j + 1), 145 + j * 50, 672, 24, INK), at(u, 1.4 + j * .12, .25));
  return s + G("", T("أسبوع", 320, 580, 24, INK, 800), at(u, 1.4, .3)) + draw("M125 702 H" + f(125 + 390 * k), k, ORANGE, 5);
});
// 15 · why the cast matters: if the ends move, the bridge breaks
shot(15, function (u, d) { var k = ease((u - 1.3) / .8); return [320, lerp(470, 400, k), lerp(0.95, 1.3, k)]; }, function (u, d, t) {
  var wob = Math.sin(t * 7) * 6 * at(u, 1.8, .3), crack = at(u, 2.6, .5);
  var s = paper() + G("", arm({ cast: at(u, 0, .9) }), 1 - at(u, 1.5, .4));
  s += G("", G("rotate(" + f(wob) + " " + CX + " " + CY + ")", boneCut(t, { frac: 1, gap: 14, soft: 1, hard: .25 })) +
    draw("M" + (CX - 10) + " " + (CY - 150) + " l14 30 l-12 22 l16 30", crack, ORANGE, 5) + draw("M" + (CX + 20) + " " + (CY + 160) + " l-12 -28 l14 -20", crack, ORANGE, 5) + cross(CX + 170, CY - 200, 1.1, at(u, 3, .5)), at(u, 1.5, .4));
  return s + label(300, 520, 470, 640, "الجبس", OLIVE, at(u, .6, .5) * (1 - at(u, 1.5, .3)), 26);
});
// 16 · does the bone stay swollen?
shot(16, push(320, 400, 1.30, 1.40), function (u, d, t) {
  var m = CX + 7, b = 58 * (1 + .04 * Math.sin(t * 3));
  return paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1 }) + '<ellipse cx="' + m + '" cy="' + CY + '" rx="175" ry="' + f(HO + b + 18) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="12 9"/>' + T("؟", m + 140, CY - HO - b - 10, 80, ORANGE, 800);
});
// 17 · eaters take the bulge back, builders restore the shape
shot(17, push(320, 400, 1.37, 1.27), function (u, d, t) {
  var k = at(u, .6, d - .8), s = paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1, remodel: k, healed: clamp((k - .7) / .3) }), b = 58 * (1 - .85 * k), j;
  for (j = 0; j < 4; j++) { var x = CX - 90 + j * 66; s += osteoclast(x, CY - HO - b * .8 - 14, at(u, .2 + j * .15, .3) * (1 - clamp((k - .85) / .15)), t); s += osteoclast(x + 30, CY + HO + b * .8 + 14, at(u, .3 + j * .15, .3) * (1 - clamp((k - .85) / .15)), t); }
  for (j = 0; j < 5; j++) s += osteoblast(CX - 200 + j * 24, CY - HO - 10, at(u, 1 + j * .1, .3), 0);
  return s + label(CX + 108, CY - HO - b * .8 - 30, 420, 165, "خلايا الهد", ORANGE, at(u, .5, .5), 24) + label(CX - 160, CY - HO - 14, 190, 175, "خلايا البنا", OLIVE, at(u, 1.4, .5), 22);
});
// 18 · like sanding a weld smooth; it can take years
shot(18, push(320, 400, 1.30, 1.38), function (u, d, t) {
  var k = .7 + .3 * at(u, .2, d - .5);
  return paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1, remodel: k, healed: clamp((k - .7) / .3) }) + iconBox(450, 205, 110, icoSand(t), at(u, .2, .3)) + tag("سنين", 200, 600, at(u, 1.8, .3), 40, ORANGE);
});
// 19 · speed: children faster, smoking slower, calcium and vitamin D help (bars: relative, no figures)
shot(19, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), rows = [["طفل", .45, BLUE, 0], ["كبير", .75, INK, .5], ["مدخّن", 1, ORANGE, 1.1]];
  s += T("وقت الالتئام", 320, 170, 30, INK, 800);
  rows.forEach(function (r, i) { var y = 240 + i * 120, k = at(u, .4 + r[3], .8); s += G("", T(r[0], 560, y + 34, 28, r[2], 800, "middle"), at(u, .2 + r[3], .3)) + R(80, y, 400 * r[1] * k, 50, r[2] === INK ? BEIGE : r[2], 2) + (r[2] === ORANGE ? '<path d="M' + f(80 + 400 * k - 6) + ' ' + f(y + 25) + ' h16" stroke="' + INK + '" stroke-width="0"/>' : ""); });
  s += G("", R(80, 610, 480, 90, "#f4ecdb", 2) + T("كالسيوم + فيتامين D", 320, 664, 30, OLIVE, 800), at(u, 2.8, .3)) + check(90, 655, .8, at(u, 3.2, .4), OLIVE);
  return s + '<circle cx="' + f(80 + 400 * .45 * at(u, .4, .8)) + '" cy="265" r="6" fill="' + BLUE + '" opacity="' + f(.5 + .5 * Math.sin(t * 5)) + '"/>';
});
// 20 · the myth: «stronger than before» — crossed out
shot(20, push(320, 400, 1.40, 1.27), function (u, d, t) {
  return paper() + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1 }) + tag("أقوى من الأول؟", 320, 180, at(u, .3, .3), 34, INK) + cross(320, 180, 2, at(u, d * .6, .5));
}, { tr: "out" });
// 21 · thicker at first, then back as it was: a graph of the thickness over time
shot(21, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, d - .8), s = paper(), x0 = 80, x1 = 570, yb = 520, d2 = "", x;
  s += '<path d="M' + x0 + ' 220 V' + (yb + 80) + ' H' + (x1 + 20) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("السُمك", x0 + 6, 205, 22, INK, 800, "end") + T("الوقت", x1, yb + 115, 22, INK, 800);
  s += '<path d="M' + x0 + ' ' + yb + ' H' + x1 + '" stroke="' + OLIVE + '" stroke-width="2.4" stroke-dasharray="10 8"/>';
  for (x = x0; x <= x0 + (x1 - x0) * k; x += 5) { var p = (x - x0) / (x1 - x0), h = p < .15 ? 0 : 230 * Math.exp(-Math.pow((p - .4) / .14, 2)); d2 += (x > x0 ? " L" : "M") + x + " " + f(yb - h); }
  s += '<path d="' + d2 + '" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
  return s + label(x0 + (x1 - x0) * .4, yb - 230, x0 + (x1 - x0) * .62, 230, "أتخن", ORANGE, at(u, 1.2, .5), 26) + label(x1 - 30, yb, x1 - 60, yb + 60, "زي ما كان", OLIVE, at(u, d - 1.2, .5), 24);
});
// 22 · «يعني من الآخر»: the four stages side by side
function mini(x, y, o, t) { var id = "mn" + (++CLIPN); return '<clipPath id="' + id + '"><rect x="' + (x - 140) + '" y="' + (y - 120) + '" width="280" height="240"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + (x - CX * .62) + ' ' + (y - CY * .62) + ') scale(.62)">' + boneCut(t, o) + '</g></g>' + R(x - 140, y - 120, 280, 240, "none", 2.4); }
shot(22, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var cells = [[170, 250, { frac: 1, gap: 14, clot: 1 }, "جلطة", ORANGE], [470, 250, { frac: 1, gap: 14, soft: 1 }, "غضروف", BLUE], [170, 560, { frac: 1, gap: 14, soft: 1, hard: 1 }, "عضم", ORANGE], [470, 560, { frac: 1, gap: 14, soft: 1, hard: 1, remodel: 1, healed: 1 }, "نحت", OLIVE]], s = paper();
  cells.forEach(function (c, i) { var k = at(u, .2 + i * D22(d), .35); s += appear(k, mini(c[0], c[1], c[2], t)) + callout(String(i + 1), c[0] - 120, c[1] - 100, k) + G("", T(c[3], c[0], c[1] + 160, 28, c[4], 800), k); });
  return s;
});
function D22(d) { return Math.max(.5, (d - 1) / 4); }
// 23 · the odd fact: skin heals with a scar, bone heals with bone
shot(23, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper();
  // skin cut-away: three layers, a scar band of different tissue across them
  var sk = '<path d="M40 200 L76 166 H636 L600 200 Z" fill="#e7b39f" stroke="' + INK + '" stroke-width="2"/><path d="M600 200 L636 166 V366 L600 400 Z" fill="#c98f7a" stroke="' + INK + '" stroke-width="2"/><path d="M306 200 L342 166 L362 166 L330 200 Z" fill="#f1e6dc" stroke="' + INK + '" stroke-width="1.6"/>' + R(40, 200, 560, 50, "#d99a84", 2) + R(40, 250, 560, 90, "#e7bfae", 2) + R(40, 340, 560, 60, "#efdcae", 2) + '<path d="M300 200 L310 340 L330 340 L338 200 Z" fill="#f1e6dc" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M304 220 h30 M306 250 h28 M307 280 h26 M308 310 h24" stroke="#cbb6a6" stroke-width="2"/>';
  s += appear(at(u, .2, .4), sk) + label(320, 270, 470, 150, "ندبة", ORANGE, at(u, .9, .5), 28) + G("", T("الجلد", 90, 180, 24, INK, 800), at(u, .4, .3));
  s += G("", '<clipPath id="od23"><rect x="40" y="460" width="560" height="200"/></clipPath><g clip-path="url(#od23)"><g transform="translate(0 160) scale(1 .9)">' + boneCut(t, { frac: 1, gap: 14, soft: 1, hard: 1, remodel: 1, healed: 1, noMuscle: true }) + '</g></g>' + R(40, 460, 560, 200, "none", 2.4), at(u, 1.6, .4)) + G("", T("العضم", 90, 450, 24, INK, 800), at(u, 1.8, .3)) + check(520, 560, 1.2, at(u, 2.4, .4), OLIVE);
  return s + cross(470, 280, .8, at(u, 1.3, .4));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the arm goes into a cast; a 6-week calendar. line 1: no glue, no medicine (crossed out). line 2: the X-ray, one piece again
  var s = "", l0 = LN[0], u0 = t - l0.start;
  if (li < 2) {
    s += G("translate(30 -40) scale(1.02)", arm({ cast: clamp(u0 / 1.6) }));
    s += iconBox(500, 80, 120, '<rect x="-40" y="-34" width="80" height="72" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><rect x="-40" y="-34" width="80" height="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + N("6", 0, 26, 34, INK) + T("أسابيع", 0, 52, 14, INK, 800), ease((t - l0.start - 1.2) / .4));
  }
  if (li === 1) { var u1 = t - LN[1].start; s += iconBox(90, 230, 110, icoGlue(), ease(u1 / .3)) + cross(90, 230, 1, ease((u1 - .6) / .4)) + iconBox(90, 380, 110, icoPill(), ease((u1 - .4) / .3)) + cross(90, 380, 1, ease((u1 - 1) / .4)); }
  if (li >= 2) { var u2 = t - LN[2].start; s += xrayPlate(140, 40, 330, 580) + '<clipPath id="xin"><rect x="148" y="48" width="314" height="564"/></clipPath><g clip-path="url(#xin)"><g transform="translate(-10 -10)">' + arm({ xray: true, frac: 1 - ease(u2 / 1.2) }) + '</g></g>' + check(520, 120, 1.3, ease((u2 - .8) / .4), OLIVE); }
  return s;
};
SCENE.bumper = function (u, t) {   // a bone with a crack that closes and opens
  var g = 3 + 3 * Math.sin(t * 2), s = '<rect x="0" y="0" width="180" height="200" fill="' + MUS + '"/>';
  var bone = '<path d="M20 100 H160" stroke="' + INK + '" stroke-width="34" stroke-linecap="round"/><path d="M20 100 H160" stroke="' + BONE + '" stroke-width="29" stroke-linecap="round"/><circle cx="22" cy="90" r="16" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.5"/><circle cx="22" cy="112" r="16" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.5"/><circle cx="158" cy="90" r="16" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.5"/><circle cx="158" cy="112" r="16" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.5"/><path d="M14 100 H166" stroke="' + BONE + '" stroke-width="28"/>';
  s += '<clipPath id="bL"><path d="M0 0 H86 L94 92 L84 108 L92 200 H0 Z"/></clipPath><clipPath id="bR"><path d="M180 0 H86 L94 92 L84 108 L92 200 H180 Z"/></clipPath>';
  s += G("translate(" + f(-g) + " 0)", '<g clip-path="url(#bL)">' + bone + '</g>') + G("translate(" + f(g) + " 0)", '<g clip-path="url(#bR)">' + bone + '</g>');
  return s;
};
SCENE.outro = function (svg, u, t) {
  var s = "", st = [{ frac: 1, gap: 14, clot: 1 }, { frac: 1, gap: 14, soft: 1 }, { frac: 1, gap: 14, soft: 1, hard: 1 }, { frac: 1, gap: 14, soft: 1, hard: 1, remodel: 1, healed: 1 }];
  st.forEach(function (o, i) { var x = 75 + i * 150, y = 140, id = "oc" + i;
    s += '<clipPath id="' + id + '"><rect x="' + (x - 68) + '" y="' + (y - 110) + '" width="136" height="220"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + f(x - CX * .5) + ' ' + f(y - CY * .5) + ') scale(.5)">' + boneCut(t, o) + '</g></g>' + R(x - 68, y - 110, 136, 220, "none", 2) + callout(String(i + 1), x - 48, y - 88, ease(u / .3 - i * .5), 13); });
  return s;
};
