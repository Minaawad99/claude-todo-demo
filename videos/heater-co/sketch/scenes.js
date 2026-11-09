window.CHUNKS = [[0.0, 0.1887], [0.0, 0.3636, 0.6364], [0.0, 0.475], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.3231, 0.5846], [0.0, 0.35], [0.0, 0.25, 0.7941], [0.0, 0.541], [0.0, 0.2121, 0.4394], [0.0], [0.0, 0.7121], [0.0, 0.5738], [0.0, 0.4583], [0.0, 0.1019, 0.3056, 0.6019, 0.8426], [0.0, 0.3023], [0.0, 0.4769, 0.7077], [0.0, 0.5741], [0.0, 0.314, 0.5465], [0.0, 0.1744, 0.3488, 0.5], [0.0, 0.5333], [0.0, 0.2923, 0.7846], [0.0, 0.1648, 0.4945, 0.8462], [0.0, 0.3714, 0.7571], [0.0], [0.0]];
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

// ── «السخان والحمام المقفول» — drawings from the standard instantaneous gas water heater (a white enamel box, sight
// window, two knobs, a draft hood and flue on top, gas / cold / hot pipes underneath; inside: a burner bar, a finned copper
// heat exchanger and its coil) and a bathroom cut from the side, in the «اسكتش» hand. Sources in refs/SOURCES.md.
var ENAMEL = "#f4f1ea", ENAMEL_D = "#d9d4c8", TILE = "#dfe5e2", TILE_L = "#c7d0cc", COPPER = "#b8763e", GASY = "#c9a227",
    STEAM = "#ffffff", BLOOD = "#b8392a", BLOOD_L = "#d9654b", CHERRY = "#e8493a", O2C = BLUE, CC = "#3d3a34", HC = "#f4f1ea", VEIN = "#e8b4a0";

function mixc(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }; var o = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), k)); o += (v < 16 ? "0" : "") + v.toString(16); } return o; }

// a flame that flickers; yel 0 = blue (enough air), 1 = yellow-orange (short of oxygen)
function flame(x, y, h, t, yel, seed) {
  seed = seed || 0; var w = h * .42, fl = 1 + .1 * Math.sin(t * 13 + seed * 2.1) + .06 * Math.sin(t * 21 + seed), hh = h * fl * (1 + .25 * yel), sway = 3 * Math.sin(t * 9 + seed);
  var out = mixc("#5b8fd0", "#e98b2e", yel), inn = mixc("#cfe3ff", "#ffd24a", yel);
  var d = function (W, H) { return "M" + f(x - W) + " " + f(y) + " C" + f(x - W) + " " + f(y - H * .45) + " " + f(x + sway - W * .3) + " " + f(y - H * .7) + " " + f(x + sway) + " " + f(y - H) + " C" + f(x + sway + W * .3) + " " + f(y - H * .7) + " " + f(x + W) + " " + f(y - H * .45) + " " + f(x + W) + " " + f(y) + " Z"; };
  return '<path d="' + d(w, hh) + '" fill="' + out + '" stroke="' + INK + '" stroke-width="1.6"/><path d="' + d(w * .5, hh * .55) + '" fill="' + inn + '"/>';
}

// molecules: O blue, C dark, H white. CO gets a dashed orange ring so the eye finds it.
function atom(x, y, r, c) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
function mol(x, y, type, s, rot) {
  s = s || 1; var r = 9 * s, inner = "";
  if (type === "O2") inner = atom(-r * .8, 0, r, O2C) + atom(r * .8, 0, r, O2C);
  if (type === "CO") inner = '<circle r="' + f(r * 2.3) + '" fill="none" stroke="' + ORANGE + '" stroke-width="' + f(1.6 * s) + '" stroke-dasharray="' + f(4 * s) + ' ' + f(3 * s) + '"/>' + atom(-r * .8, 0, r * 1.05, CC) + atom(r * .8, 0, r, O2C);
  if (type === "CO2") inner = atom(-r * 1.5, 0, r, O2C) + atom(r * 1.5, 0, r, O2C) + atom(0, 0, r * 1.05, CC);
  if (type === "H2O") inner = atom(-r * .9, r * .7, r * .6, HC) + atom(r * .9, r * .7, r * .6, HC) + atom(0, 0, r, O2C);
  if (type === "CH4") inner = [0, 1, 2, 3].map(function (k) { var a = k * 1.571 + .785; return atom(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1, r * .55, HC); }).join("") + atom(0, 0, r, CC);
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ")", inner);
}
// a cloud of molecules drifting inside a box; n of them, kind chooses the type
function cloud(x, y, w, h, n, type, t, s, seed) {
  var out = ""; seed = seed || 0;
  for (var k = 0; k < n; k++) { var i = k + seed * 50, px = x + ((hash(i) * w + t * (6 + hash(i + 3) * 10)) % w), py = y + hash(i + 7) * h + 6 * Math.sin(t * 1.3 + i); out += mol(px, py, type, s || .7, hash(i + 9) * 180 + t * 20); }
  return out;
}

// ── the heater seen from the front. op: yel (flame colour), cut (show the inside), pipe (flue length up), on
function heater(x, y, w, t, op) {
  op = op || {}; var h = w * 1.7, s = "";
  if (op.pipe) s += R(x - w * .14, y - op.pipe, w * .28, op.pipe, "#cfcac0", 2);
  s += P("M" + f(x - w * .3) + " " + f(y) + " L" + f(x - w * .14) + " " + f(y - w * .14) + " L" + f(x + w * .14) + " " + f(y - w * .14) + " L" + f(x + w * .3) + " " + f(y) + " Z", "#cfcac0", 2);   // draft hood
  ["M", GASY, ORANGE, BLUE].forEach(function (c, i) { if (i) s += R(x - w * .32 + (i - 1) * w * .32 - 5, y + h, 10, w * .45, c, 1.6); });   // gas / hot / cold pipes under it
  s += R(x - w / 2, y, w, h, ENAMEL, 2.6, 10);
  if (op.cut) {
    s += R(x - w * .42, y + h * .06, w * .84, h * .8, "#e9e4d8", 1.6, 4);
    s += R(x - w * .36, y + h * .14, w * .72, h * .38, "#d9a77a", 2, 3);   // finned heat exchanger
    for (var k = 0; k < 14; k++) s += '<path d="M' + f(x - w * .33 + k * w * .049) + ' ' + f(y + h * .15) + ' v' + f(h * .36) + '" stroke="' + INK + '" stroke-width="1" opacity=".5"/>';
    var coil = "M" + f(x - w * .4) + " " + f(y + h * .2); for (k = 0; k < 4; k++) coil += " H" + f(x + (k % 2 ? -w * .34 : w * .34)) + " v" + f(h * .09);
    s += '<path d="' + coil + '" stroke="' + COPPER + '" stroke-width="' + f(w * .045) + '" fill="none" stroke-linejoin="round"/><path d="' + coil + '" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".4"/>';
    s += R(x - w * .38, y + h * .74, w * .76, h * .06, "#8f8576", 1.6, 2);   // burner bar
    for (k = 0; k < 7; k++) s += flame(x - w * .32 + k * w * .107, y + h * .74, w * .16 * (op.on == null ? 1 : op.on), t, op.yel || 0, k);
  } else {
    s += R(x - w * .3, y + h * .1, w * .6, h * .12, ENAMEL_D, 1.4, 4);   // the badge
    s += R(x - w * .16, y + h * .56, w * .32, h * .18, "#2f2a24", 2, 6);   // sight window
    s += '<g clip-path="none">' + flame(x, y + h * .72, w * .16 * (op.on == null ? 1 : op.on), t, op.yel || 0, 1) + '</g>';
    s += C(x - w * .2, y + h * .87, w * .085, "#e6e1d4", 1.8) + C(x + w * .2, y + h * .87, w * .085, "#e6e1d4", 1.8);
    s += '<path d="M' + f(x - w * .2) + ' ' + f(y + h * .87) + ' l0 ' + f(-w * .07) + ' M' + f(x + w * .2) + ' ' + f(y + h * .87) + ' l' + f(w * .05) + ' ' + f(-w * .05) + '" stroke="' + INK + '" stroke-width="2"/>';
  }
  return s;
}

// a person seen from the side, plain shapes, no face. slump 0..1 tips them over away from the door; sway for dizziness
function person(x, y, s, slump, sway, t) {
  var sk = ease(slump || 0), a = 62 * sk + (sway || 0) * 5 * Math.sin((t || 0) * 2.4); s = s * (1 - .3 * sk);
  var body = '<path d="M-14 0 L-10 -78 L10 -78 L14 0 Z" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M-20 -78 C-24 -120 -22 -150 0 -158 C22 -150 24 -120 20 -78 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M16 -146 C30 -120 30 -100 22 -82" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M16 -146 C30 -120 30 -100 22 -82" stroke="' + SKIN + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<rect x="-8" y="-172" width="16" height="16" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="-190" r="21" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(a) + ")", body);
}

// ── the bathroom cut from the side: tiled back wall, shower on the left, heater on the wall, door on the right.
// op: o2 0..1 (blue O2 in the air), co 0..1 (CO in the air), yel, door 0..1 (open), steam, slump, sway, nohead (hide heater), out (heater moved outside)
function bath(t, op) {
  op = op || {}; var s = "", X0 = 40, X1 = 600, Y0 = 110, Y1 = 640;
  s += R(X0, Y0, X1 - X0, Y1 - Y0, TILE, 0);
  for (var gx = X0; gx < X1; gx += 40) s += '<path d="M' + gx + ' ' + Y0 + ' V' + Y1 + '" stroke="' + TILE_L + '" stroke-width="1.2"/>';
  for (var gy = Y0; gy < Y1; gy += 40) s += '<path d="M' + X0 + ' ' + gy + ' H' + X1 + '" stroke="' + TILE_L + '" stroke-width="1.2"/>';
  s += R(X0 - 20, Y0 - 34, X1 - X0 + 40, 34, BEIGE, 2.4) + hatch("M" + (X0 - 20) + " " + (Y0 - 34) + " h" + (X1 - X0 + 40) + " v34 h-" + (X1 - X0 + 40) + " Z");   // ceiling slab
  s += R(X0 - 20, Y1, X1 - X0 + 40, 40, BEIGE, 2.4) + hatch("M" + (X0 - 20) + " " + Y1 + " h" + (X1 - X0 + 40) + " v40 h-" + (X1 - X0 + 40) + " Z");          // floor slab
  // small high window, shut
  s += R(470, 150, 80, 56, "#bcd3dc", 2.4, 3) + '<path d="M510 150 V206" stroke="' + INK + '" stroke-width="2"/>';
  // the door on the right: a panel; when it opens it narrows and shows the light of the hall behind it
  var dk = clamp(op.door || 0);
  s += R(452, 330, 110, 310, "#fff4d6", 2.4);
  s += P("M452 330 L" + f(452 + 110 * (1 - .78 * dk)) + " " + f(330 - 20 * dk) + " L" + f(452 + 110 * (1 - .78 * dk)) + " " + f(640 + 14 * dk) + " L452 640 Z", "#a9784d", 2.4) + C(452 + 110 * (1 - .78 * dk) - 14, 490, 5, INK, 0);
  if (dk > 0) for (var k = 0; k < 3; k++) s += arrow(600 - k * 10, 400 + k * 70, 600 - 120 * dk - k * 10, 400 + k * 70, BLUE, 4, dk);
  // shower: tray, pipe, head, water
  s += R(80, 618, 200, 22, "#f7f3ea", 2.2, 4) + '<path d="M300 230 H240 V170 H222" stroke="' + INK + '" stroke-width="5" fill="none"/>' + R(178, 160, 44, 16, "#cfcac0", 2, 4);
  // the heater on the wall, its flue stops at the ceiling (nowhere to go)
  if (!op.out) s += heater(330, 240, 76, t, { yel: op.yel || 0, pipe: 96 });
  // the person in the shower
  s += person(205, 618, 1.25, op.slump || 0, op.sway || 0, t);
  for (k = 0; k < 9; k++) { var dx = 184 + k * 4.5, ph = (t * 2.2 + hash(k)) % 1; s += '<path d="M' + f(dx) + ' ' + f(180 + ph * 420) + ' v22" stroke="' + BLUE + '" stroke-width="2" opacity=".55"/>'; }
  // steam
  for (k = 0; k < 6 * (op.steam || 0); k++) { var u2 = (t * .25 + k / 6) % 1; s += '<path d="M' + f(100 + k * 60) + ' ' + f(560 - u2 * 380) + ' q-14 -20 0 -40 q14 -20 0 -40" stroke="' + STEAM + '" stroke-width="7" fill="none" stroke-linecap="round" opacity="' + f((1 - u2) * .8) + '"/>'; }
  // the air: O2 pairs and CO
  s += cloud(X0 + 20, Y0 + 30, X1 - X0 - 60, Y1 - Y0 - 90, Math.round(26 * (op.o2 == null ? 1 : op.o2)), "O2", t, .62, 1);
  s += cloud(X0 + 20, Y0 + 30, X1 - X0 - 60, Y1 - Y0 - 120, Math.round(22 * (op.co || 0)), "CO", t, .62, 2);
  // the cut edges
  s += '<path d="M' + X0 + ' ' + Y0 + ' V' + Y1 + ' M' + X1 + ' ' + Y0 + ' V' + Y1 + '" stroke="' + INK + '" stroke-width="3"/>';
  return s;
}

// a red blood cell seen from above: a disc with a dimple, four seats around it carrying O2 / CO
function rbc(x, y, r, seats, t, spin) {
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * .92) + '" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * .5) + '" ry="' + f(r * .44) + '" fill="' + BLOOD_L + '" stroke="' + INK + '" stroke-width="1.2" opacity=".9"/>';
  (seats || []).forEach(function (m, i) { if (!m) return; var a = i * 1.571 + .785 + (spin || 0); s += mol(x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74, m, r / 60, a * 57.3 + 90); });
  return s;
}
// a blood vessel cut along its length with cells flowing through it; co = share of seats taken by CO
function vessel(t, co, n) {
  var s = R(-40, 250, 720, 300, "#f0d2c4", 0) + '<path d="M-40 250 H680 M-40 550 H680" stroke="' + INK + '" stroke-width="3"/>' + R(-40, 226, 720, 24, VEIN, 2) + R(-40, 550, 720, 24, VEIN, 2);
  for (var k = 0; k < (n || 6); k++) { var px = ((hash(k) * 760 + t * 46) % 760) - 60, py = 300 + hash(k + 4) * 200; var seats = [0, 1, 2, 3].map(function (j) { return hash(k * 4 + j + 20) < co ? "CO" : "O2"; }); s += rbc(px, py, 46, seats, t, t * .3 + k); }
  return s;
}

// a bus seat (the analogy): someone grey sitting who won't get up
function busSeat(x, y, s, k) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", R(-40, -10, 80, 16, OLIVE, 2, 4) + R(20, -80, 16, 76, OLIVE, 2, 4) + '<path d="M-30 6 V40 M30 6 V40" stroke="' + INK + '" stroke-width="4"/>' +
    G("", '<circle cx="2" cy="-62" r="14" fill="' + GREY + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -46 H18 V-10 H-26 V-20 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="2"/>', k));
}
// a head-and-chest outline from the front with the brain and the heart
function bodyFront(t, starve) {
  var s = '<path d="M320 70 C380 70 410 110 410 170 C410 230 380 262 352 270 L352 300 C430 310 500 340 520 420 L540 760 H100 L120 420 C140 340 210 310 288 300 L288 270 C260 262 230 230 230 170 C230 110 260 70 320 70 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  var gl = .5 + .5 * Math.sin(t * 5);
  s += '<path d="M262 160 C258 120 290 96 320 98 C356 96 384 120 380 162 C378 196 350 212 320 210 C290 212 264 196 262 160 Z" fill="' + mixc("#e7a9a0", "#a99a96", starve) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var k = 0; k < 5; k++) s += '<path d="M' + (276 + k * 20) + ' ' + (118 + (k % 2) * 8) + ' q8 30 -2 70" stroke="' + INK + '" stroke-width="1.3" fill="none" opacity=".45"/>';
  s += G("translate(300 470) scale(" + f(1 + .05 * Math.sin(t * (6 - 3 * starve))) + ")", '<path d="M0 30 C-60 -10 -50 -60 -20 -60 C-6 -60 0 -48 0 -40 C0 -48 6 -60 20 -60 C50 -60 60 -10 0 30 Z" fill="' + mixc(BLOOD, "#9a7a72", starve) + '" stroke="' + INK + '" stroke-width="2"/>');
  if (starve > .3) s += '<circle cx="320" cy="155" r="' + f(70 + 6 * gl) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" opacity="' + f(starve) + '"/><circle cx="300" cy="455" r="' + f(64 + 6 * gl) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" opacity="' + f(starve) + '"/>';
  return s;
}
// an oxygen bar for the HUD, top of the panel (reference: «الأوكسجين في جسمه»)
function o2bar(v, label) { return T(label || "الأكسجين", 600, 52, 20, INK, 700, "start") + R(340, 64, 260, 18, PAPER, 1.8) + R(342, 66, 256 * clamp(v), 14, v < .45 ? ORANGE : OLIVE, 0); }
// a nose and smell lines (for the myth)
function smell(x, y, k, t) { var s = ""; for (var i = 0; i < 3; i++) s += '<path d="M' + f(x + i * 22) + ' ' + f(y) + ' c-10 -14 10 -22 0 -36 c-10 -14 10 -22 0 -36" stroke="' + OLIVE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(k * (.6 + .4 * Math.sin(t * 3 + i))) + '"/>'; return s; }
// two vials of blood: normal and CO-poisoned (cherry red)
function vial(x, y, c, lvl) { return R(x - 34, y - 220, 68, 240, "#eef1ee", 2.4, 30) + '<path d="M' + (x - 32) + ' ' + f(y + 20 - 200 * lvl) + ' H' + (x + 32) + ' V' + (y - 10) + ' a32 32 0 0 1 -64 0 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="1.6"/>' + R(x - 44, y - 236, 88, 22, ENAMEL_D, 2, 4); }
// the sponsor coupon
function coupon(x, y, k) {
  var w = 440, h = 220, s = '<path d="M' + (x - w / 2) + ' ' + (y - h / 2) + ' H' + (x + w / 2) + ' V' + (y - 24) + ' a24 24 0 0 0 0 48 V' + (y + h / 2) + ' H' + (x - w / 2) + ' V' + (y + 24) + ' a24 24 0 0 0 0 -48 Z" fill="#f7e9a6" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + (x + w / 2 - 120) + ' ' + (y - h / 2 + 14) + ' V' + (y + h / 2 - 14) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 7"/>';
  s += T("كود الخصم", x - 50, y - 50, 26, INK, 700) + G("", numBox("Awad11", x - 50, y + 20, 1, 44, true), clamp(k));
  s += G("translate(" + (x + w / 2 - 60) + " " + y + ")", '<path d="M-30 -20 H30 L24 44 H-24 Z" fill="#f2d600" stroke="' + INK + '" stroke-width="2.2"/><path d="M-14 -20 C-14 -44 14 -44 14 -20" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("نون", 0, 20, 22, INK, 800));
  return s;
}

// ── shots (line numbers from script.txt)
// 4 · a small rule: remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 150, 340, 460, "#f4ecdb", 2.4, 8) + T("قاعدة", 320, 210, 34, OLIVE, 800) + flame(320, 520, 220, t, 0) + R(250, 520, 140, 22, "#8f8576", 2, 3) + cloud(170, 260, 300, 140, 8, "O2", t, .8, 3); });
// 5 · fire needs oxygen; when it runs short the flame turns and makes another gas
shot(5, push(320, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, d * .4, 1.4); return paper() + flame(320, 560, 260, t, k) + R(240, 560, 160, 24, "#8f8576", 2, 3) + cloud(80, 160, 480, 300, Math.round(16 * (1 - .75 * k)), "O2", t, .9, 4) + cloud(160, 140, 320, 200, Math.round(7 * k), "CO", t, 1, 5) + G("translate(520 200)", T("؟", 0, 0, 90, ORANGE, 800), k); });
// 6 · the heater burns the gas with oxygen from the bathroom's own air
shot(6, push(320, 420, 1.1, 1.0), function (u, d, t) { var s = paper() + heater(320, 120, 260, t, { cut: 1 }); for (var k = 0; k < 4; k++) { var ph = (t * .6 + k / 4) % 1; s += mol(lerp(60, 230, ph), 520 + k * 22, "O2", .9, t * 30) + mol(lerp(580, 410, ph), 520 + k * 22, "O2", .9, -t * 30); } return s + label(320, 540, 470, 700, "الشعلة", ORANGE, at(u, .6, .5), 24) + label(250, 160, 120, 90, "هوا الحمام", BLUE, at(u, 1.6, .5), 24); }, { tr: "in" });
// 7 · enough air: CO2 and water vapour come out, and those are fine
shot(7, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var a = at(u, .2, .4), b = at(u, .8, .4), c = at(u, 1.6, .5);
  var bob = function (i) { return f(14 * Math.sin(t * 2.6 + i)); };
  return paper() + G("translate(-60 110) scale(1.15)", appear(a, G("translate(0 " + bob(0) + ")", mol(110, 300, "CH4", 2.8, t * 25))) + appear(a, T("+", 200, 312, 50, INK, 800)) + appear(a, G("translate(0 " + bob(1) + ")", mol(270, 270, "O2", 2.2, 12 * Math.sin(t * 2)) + mol(270, 340, "O2", 2.2, -12 * Math.sin(t * 2)))) +
    draw("M330 305 L390 305", b, INK, 4) + arrow(380, 305, 400, 305, INK, 4, b) +
    appear(c, G("translate(0 " + bob(2) + ")", mol(500, 250, "CO2", 2, 10 * Math.sin(t * 2.2)) + mol(470, 370, "H2O", 2, t * 30) + mol(560, 370, "H2O", 2, -t * 30))) + label(500, 250, 330, 140, "تاني أكسيد الكربون", OLIVE, at(u, 2, .4), 20) + check(500, 520, 1.3, at(u, d * .75, .5)));
});
// 8 · the little heater burns a bathroom's worth of air in about half an hour
shot(8, push(320, 380, .92, .98), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + bath(t, { o2: 1 - .55 * k, steam: .6 }) + G("translate(560 80)", '<circle r="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 L0 -36 A36 36 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(36 * Math.sin(k * Math.PI)) + ' ' + f(-36 * Math.cos(k * Math.PI)) + ' Z" fill="' + ORANGE + '" opacity=".75"/>') + T("30 دقيقة", 560, 150, 20, INK, 700); });
// 9 · the door is shut: oxygen drops, the flame starts making carbon monoxide
shot(9, push(330, 320, 1.0, 1.3), function (u, d, t) { var k = at(u, .4, d - .8); return paper() + bath(t, { o2: .45 - .3 * k, co: k, yel: k, steam: .5 }) + label(330, 400, 470, 270, "أول أكسيد الكربون", ORANGE, at(u, d * .6, .5), 22); });
hud(8, 10, function (u, t) { var k = clamp((t - LN[8].start) / (LN[10].start - LN[8].start)); return o2bar(1 - .75 * k, "الأكسجين في الحمام"); });
// 10 · what does it do to us? the camera flies into the body
shot(10, push(205, 420, 1.3, 1.7), function (u, d, t) { return paper() + bath(t, { o2: .2, co: 1, yel: 1, steam: .4, sway: 1 }) + T("؟", 290, 320, 110, ORANGE, 800); });
// 11 · in your blood: carriers that take oxygen all over the body, haemoglobin
shot(11, push(320, 400, 1.06, 1.0), function (u, d, t) { return paper() + vessel(t, 0, 6) + label(180, 400, 330, 170, "الهيموجلوبين", OLIVE, at(u, 1.6, .5), 24) + label(380, 330, 500, 680, "أكسجين", BLUE, at(u, .6, .5), 22); }, { tr: "in" });
// 12 · CO grips them about 200 times harder than oxygen
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.6), seats = ["CO", k > .3 ? "CO" : "O2", k > .6 ? "CO" : "O2", k > .9 ? "CO" : "O2"], s = paper() + R(-40, 0, 720, 800, "#f0d2c4", 0) + rbc(320, 400, 200, seats, t, 0);
  for (var j = 1; j < 4; j++) if (k > j * .3) { var a = j * 1.571 + .785, q = clamp((k - j * .3) / .3); s += mol(320 + Math.cos(a) * (150 + 200 * q), 400 + Math.sin(a) * (150 + 200 * q), "O2", 2.4, q * 200); }
  return s + numBox("200×", 320, 720, at(u, 1.8, .3), 44);
});
// 13 · like someone sitting in your bus seat who won't get up
shot(13, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(-40, 0, 720, 800, "#f0d2c4", 0) + rbc(260, 430, 170, ["CO", "CO", "CO", "O2"], t, Math.sin(t * .8) * .05) + iconBox(520, 160, 170, busSeat(0, 30, 1, 1), at(u, .3, .3)); });
// 14 · sponsor: noon, Saudi Arabia and the UAE, code Awad11
shot(14, push(320, 400, 1.0, 1.05), function (u, d, t) { return paper() + tag("إعلان", 110, 90, 1, 22, MUTE) + G("rotate(" + f(-3 + Math.sin(t * 1.4) * 1.5) + " 320 380)", coupon(320, 380, at(u, .3, .4))) + T("السعودية · الإمارات", 320, 580, 30, INK, 800) + appear(at(u, 2.6, .4), T("خصم لحد", 360, 660, 28, INK, 800) + N("10%", 230, 668, 52, ORANGE)); });
// 15 · back to the bathroom: the brain and the heart starve first
shot(15, push(320, 400, 1.0, .96), function (u, d, t) { return paper() + bodyFront(t, at(u, .6, 1.6)) + label(320, 155, 500, 110, "المخ", ORANGE, at(u, 1.2, .5), 24) + label(300, 455, 470, 380, "القلب", ORANGE, at(u, 1.9, .5), 24); });
hud(15, 17, function (u, t) { var k = clamp((t - LN[15].start) / (LN[17].start - LN[15].start)); return o2bar(.4 - .3 * k, "الأكسجين في الجسم"); });
// 16 · headache, dizziness, vomiting, the muscles go slack — you can't reach the door
shot(16, push(330, 400, 1.08, .95), function (u, d, t) { var k = at(u, d * .45, 1.4); return paper() + bath(t, { o2: .15, co: 1, yel: 1, slump: k, sway: 1 - k, steam: .3 }) + G("", measure(372, 606, 448, 606, at(u, d * .6, .6), ""), 1) + cross(410, 560, .8, at(u, d * .8, .4)); });
// 17 · the myth: you'll smell the gas if something's wrong. no.
shot(17, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(60, 420, 520, 30, "#cfcac0", 2.4, 6) + R(300, 400, 40, 70, GASY, 2.4, 4) + smell(240, 400, at(u, .4, .6), t) + tag("ريحة؟", 320, 600, at(u, .6, .3), 30) + cross(320, 260, 1.5, at(u, d * .7, .5)); });
// 18 · the smell is added to the unburnt gas; CO has no colour and no smell
shot(18, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var L1 = paper() + '<path d="M320 120 V700" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 6"/>';
  L1 += R(40, 470, 240, 26, "#cfcac0", 2.2, 5) + cloud(70, 250, 200, 180, 6, "CH4", t, 1.1, 6) + smell(120, 420, 1, t) + T("غاز", 160, 560, 28, INK, 800) + check(160, 640, 1, at(u, .8, .4));
  L1 += cloud(360, 250, 220, 220, 7, "CO", t, 1.1, 7) + T("أول أكسيد الكربون", 480, 560, 24, ORANGE, 800) + appear(at(u, d * .5, .4), T("لا لون ولا ريحة", 480, 610, 24, INK, 700)) + cross(480, 680, .9, at(u, d * .6, .4));
  return L1;
});
// 19 · check the flame: blue is fine, yellow or orange means oxygen is short
shot(19, push(320, 420, 1.0, 1.06), function (u, d, t) { return paper() + R(80, 520, 200, 22, "#8f8576", 2, 3) + flame(180, 520, 220, t, 0, 1) + R(360, 520, 200, 22, "#8f8576", 2, 3) + G("", flame(460, 520, 220, t, 1, 2), at(u, d * .35, .4)) + check(180, 640, 1.1, at(u, .9, .4)) + cross(460, 640, 1.1, at(u, d * .7, .4)); });
// 20 · the fix: the heater outside the bathroom, with a flue going out of the house
shot(20, push(320, 380, .92, 1.0), function (u, d, t) {
  var s = paper() + bath(t, { out: 1, steam: .4 }) + R(600, 76, 60, 604, BEIGE, 2.4) + hatch("M600 76 h60 v604 h-60 Z");
  var k = at(u, .4, .8);
  s += G("translate(" + f(lerp(0, 380, k)) + " 0)", heater(330, 240, 76, t, { pipe: 30 }));
  s += draw("M710 405 V440 H300 V230", at(u, 1.0, .8), ORANGE, 5);
  s += draw("M710 212 V96 H1000", at(u, 1.2, .8), "#cfcac0", 18) + label(760, 96, 640, 30, "مدخنة", OLIVE, at(u, 1.8, .5), 24) + label(710, 330, 640, 712, "بره الحمام", OLIVE, at(u, 1, .5), 24);
  return G("translate(-20 40) scale(.82)", s);
}, { tr: "out" });
// 21 · if you feel dizzy: open the door, get out to the air, call the ambulance
shot(21, push(380, 400, 1.0, 1.1), function (u, d, t) { var k = at(u, .3, 1); return paper() + bath(t, { o2: .2 + .6 * k, co: 1 - k, door: k, sway: 1, steam: .2 }) + iconBox(130, 200, 130, '<rect x="-24" y="-42" width="48" height="84" rx="8" fill="' + CC + '" stroke="' + INK + '" stroke-width="2"/><rect x="-18" y="-32" width="36" height="56" fill="#fff"/><path d="M-6 -4 h12 M0 -10 v12" stroke="' + ORANGE + '" stroke-width="5"/>', at(u, d * .65, .3)); });
// 22 · recap: fire without enough air makes a gas that takes oxygen's place in your blood
shot(22, push(320, 400, .96, 1.02), function (u, d, t) { return paper() + bath(t, { o2: .3, co: .8, yel: 1, steam: .3 }) + label(330, 380, 470, 260, "شعلة صفرا", ORANGE, at(u, .3, .4), 22) + inset(500, 640, 110, rbc(0, 0, 70, ["CO", "CO", "O2", "CO"], t, t * .2), at(u, 2, .3)); }, { tr: "out" });
// 23 · the odd fact: the poisoned can look flushed and rosy, as if peacefully asleep
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + vial(220, 560, "#7a1f1a", .8) + G("", vial(420, 560, CHERRY, .8), at(u, .8, .5)) + T("دم عادي", 220, 640, 24, INK, 700) + appear(at(u, 1, .4), T("دم فيه أول أكسيد", 420, 640, 24, ORANGE, 700)) + label(420, 450, 330, 290, "أحمر فاتح", ORANGE, at(u, 1.6, .5), 22); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var k1 = li >= 1 ? ease((t - LN[1].start) / 1.5) : 0;
  return G("translate(16 10) scale(.9)", bath(t, { steam: 1, o2: 1 - .5 * k1, sway: k1 }) + (li >= 2 ? '<circle cx="330" cy="370" r="74" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-dasharray="12 9" opacity="' + f(ease((t - LN[2].start) / .4)) + '"/>' : ""));
};
SCENE.bumper = function (u, t) { return heater(90, 72, 46, t, {}); };
SCENE.outro = function (svg, u, t) {
  return heater(90, 50, 92, t, { yel: 1 }) + arrow(160, 140, 220, 140, INK, 3, 1) + mol(290, 140, "CO", 2.4) + arrow(360, 140, 410, 140, INK, 3, 1) + rbc(490, 140, 70, ["CO", "CO", "O2", "CO"], t, 0) +
    callout("1", 40, 60, ease(u / .3)) + callout("2", 140, 220, ease(u / .3 - .5)) + callout("3", 290, 80, ease(u / .3 - 1)) + callout("4", 560, 70, ease(u / .3 - 1.5));
};
