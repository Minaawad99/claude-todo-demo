window.CHUNKS = [[0.0], [0.0, 0.5556], [0.0, 0.4444], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.377, 0.5902], [0.0, 0.6596], [0.0, 0.4545], [0.0, 0.5484], [0.0, 0.2143, 0.619], [0.0], [0.0, 0.5263], [0.0, 0.56], [0.0, 0.4268], [0.0], [0.0, 0.2, 0.6533], [0.0, 0.5139], [0.0, 0.5893], [0.0, 0.3462, 0.5962], [0.0, 0.56], [0.0, 0.493], [0.0, 0.4182], [0.0, 0.3919, 0.7973], [0.0, 0.1685, 0.4382, 0.6629], [0.0, 0.2114, 0.6179, 0.7642], [0.0], [0.0]];
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

// ── «التيك توك والفيسبوك عارفين إنت عايز إيه إزاي؟» — drawings. Real shapes (refs/SOURCES.md): a modern phone at its real
// proportions (147.6 × 71.6 mm, rounded corners, a pill camera cut-out, the mic holes on the bottom edge); the TikTok
// «For You» screen as it is laid out (tabs on top, the action column on the right: avatar, heart, comments, save, share,
// the user name and caption at the bottom, the thin progress bar); a Facebook «Sponsored» post (avatar, name, «ممول»,
// the picture, the «تسوّق الآن» bar, like / comment / share); a shop page in a browser window with the real Meta Pixel
// call `fbq('track', 'ViewContent')`; a server rack. Panel 640 × 786.

var SCR = "#1d1a17", FB = "#3b5b98", TTR = "#e2475c", TTC = "#41c3c9", SAD = "#6f8597";
// a phone, centred at cx, cy, h tall; scr(sw, sh) draws the screen in its own coordinates (clipped)
function phone(cx, cy, h, scr, op) {
  op = op || {}; var w = h / 2.06, x = cx - w / 2, y = cy - h / 2, b = w * .045, sw = w - 2 * b, sh = h - 2 * b, id = "ph" + (++CLIPN), r = w * .16;
  var s = '<rect x="' + f(x + 6) + '" y="' + f(y + 8) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(r) + '" fill="' + INK + '" opacity=".14"/>';
  s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(r) + '" fill="#3a3632" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<rect x="' + f(x - 3) + '" y="' + f(y + h * .2) + '" width="4" height="' + f(h * .07) + '" rx="2" fill="#3a3632" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + f(x + w - 1) + '" y="' + f(y + h * .26) + '" width="4" height="' + f(h * .11) + '" rx="2" fill="#3a3632" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<clipPath id="' + id + '"><rect width="' + f(sw) + '" height="' + f(sh) + '" rx="' + f(r - b) + '"/></clipPath>';
  s += G("translate(" + f(x + b) + " " + f(y + b) + ")", '<g clip-path="url(#' + id + ')"><rect width="' + f(sw) + '" height="' + f(sh) + '" fill="' + (op.bg || SCR) + '"/>' + scr(sw, sh) + '</g>' +
    '<rect x="' + f(sw / 2 - sw * .16) + '" y="' + f(sh * .018) + '" width="' + f(sw * .32) + '" height="' + f(sh * .032) + '" rx="' + f(sh * .016) + '" fill="#0d0c0b"/>');
  if (op.mic) for (var i = 0; i < 6; i++) s += C(cx - w * .32 + i * 5, y + h - 2, 1.6, INK, 0) + C(cx + w * .2 + i * 5, y + h - 2, 1.6, INK, 0);
  return s;
}
// what a video shows (flat, no faces): 0 football, 1 food, 2 car, 3 sad rain, 4 sea, 5 sneakers
function clip(kind, w, h, t) {
  var s = "", i;
  if (kind === 0) { s += R(0, 0, w, h, "#5f8a4a", 0) + '<path d="M0 ' + f(h * .55) + ' H' + f(w) + ' M' + f(w / 2) + ' ' + f(h * .55) + ' m-40 0 a40 22 0 1 0 80 0 a40 22 0 1 0 -80 0" stroke="#e8eadf" stroke-width="3" fill="none"/>';
    var bx = w * .3 + w * .4 * (.5 + .5 * Math.sin(t * 1.3)); s += C(bx, h * .62 - 30 * Math.abs(Math.sin(t * 2.6)), 12, "#f4f1e6", 1.6) + '<path d="M' + f(bx - 5) + ' ' + f(h * .62 - 30 * Math.abs(Math.sin(t * 2.6)) - 4) + ' l5 -4 l5 4 l-2 6 h-6 Z" fill="' + INK + '"/>'; }
  else if (kind === 1) { s += R(0, 0, w, h, "#c8a774", 0) + '<ellipse cx="' + f(w / 2) + '" cy="' + f(h * .5) + '" rx="' + f(w * .36) + '" ry="' + f(w * .2) + '" fill="#f1ece0" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(w / 2) + '" cy="' + f(h * .5) + '" rx="' + f(w * .24) + '" ry="' + f(w * .12) + '" fill="#d9a03d" stroke="' + INK + '" stroke-width="1.4"/>';
    for (i = 0; i < 3; i++) s += '<path d="M' + f(w * .42 + i * 18) + ' ' + f(h * .4) + ' q-8 -14 0 -26 t0 -26" stroke="#fff" stroke-width="2.4" fill="none" opacity="' + f(.35 + .3 * Math.sin(t * 3 + i)) + '"/>'; }
  else if (kind === 2) { s += R(0, 0, w, h, "#9ab3c4", 0) + R(0, h * .62, w, h * .38, "#6b6560", 0); var cx = w * .5 + 8 * Math.sin(t * 2);
    s += '<path d="M' + f(cx - 70) + ' ' + f(h * .6) + ' l8 -26 q10 -6 30 -8 l18 -20 h44 l24 22 q24 4 26 18 v14 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + C(cx - 40, h * .6, 12, INK, 0) + C(cx + 42, h * .6, 12, INK, 0) + C(cx - 40, h * .6, 5, GREY, 0) + C(cx + 42, h * .6, 5, GREY, 0); }
  else if (kind === 3) { s += R(0, 0, w, h, SAD, 0) + '<path d="M' + f(w * .2) + ' ' + f(h * .3) + ' a26 22 0 0 1 46 -14 a30 26 0 0 1 56 6 a20 18 0 0 1 4 34 H' + f(w * .2) + ' a18 18 0 0 1 0 -26 Z" fill="#a9b4bc" stroke="' + INK + '" stroke-width="1.6"/>';
    for (i = 0; i < 14; i++) { var rx = (hash(i) * w), ry = (hash(i + 30) * h + t * 140) % h; s += '<path d="M' + f(rx) + ' ' + f(ry) + ' l-3 12" stroke="#dbe4ea" stroke-width="2"/>'; } }
  else if (kind === 4) { s += R(0, 0, w, h, "#9fc0cf", 0) + R(0, h * .5, w, h * .5, "#4f7c95", 0) + C(w * .7, h * .32, 22, "#f2c46a", 1.4); for (i = 0; i < 4; i++) s += wave(-20, h * .58 + i * 26, w + 20, h * .58 + i * 26, t, "#d6e2e6", 4, 50, 1, 2.2); }
  else { s += R(0, 0, w, h, "#ddd2b8", 0) + G("translate(" + f(w / 2) + " " + f(h * .55) + ") scale(" + f(w / 260) + ")", sneaker()); }
  return s;
}
// a running shoe in profile (sole, midsole, upper, laces, heel tab), drawn around 0,0, about 200 wide
function sneaker(col) {
  col = col || ORANGE;
  return '<path d="M-100 20 Q-104 34 -88 36 H96 Q112 34 104 16 Z" fill="#f1ece0" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M-96 20 Q-100 -30 -78 -52 Q-70 -60 -56 -54 Q-40 -30 -6 -26 Q40 -22 70 -6 Q100 6 104 16 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M-48 -40 L-20 -30 M-38 -48 L-10 -34 M-28 -54 L0 -36" stroke="#f1ece0" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M-20 0 Q20 -14 70 -4" stroke="#f1ece0" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-94 -6 Q-80 -2 -70 12" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
}
// the TikTok «For You» screen: a video, the tabs, the action column, the caption and the progress bar
function ttScreen(w, h, t, op) {
  op = op || {}; var s = "", sc = w / 290, scroll = op.scroll || 0;
  s += G("translate(0 " + f(-scroll * h) + ")", clip(op.kind == null ? 0 : op.kind, w, h, t) + (op.next != null ? G("translate(0 " + f(h) + ")", clip(op.next, w, h, t)) : ""));
  s += '<rect width="' + f(w) + '" height="' + f(h * .14) + '" fill="#000" opacity=".25"/>';
  s += T("متابعة", w * .32, h * .085, 15 * sc, "#e8e4da", 700) + T("لك", w * .64, h * .085, 16 * sc, "#fff", 800) + R(w * .6, h * .1, w * .08, 3, "#fff", 0);
  var cx = w * .87, y0 = h * .44, g = h * .1, hl = op.hl || {};
  s += C(cx, y0, 18 * sc, "#c9b48f", 2) + C(cx, y0 + 18 * sc, 7 * sc, TTR, 0) + T("+", cx, y0 + 22.5 * sc, 11 * sc, "#fff", 800);
  var heart = function (x, y, k, fill) { return '<path d="M' + f(x) + ' ' + f(y + 10 * k) + ' C' + f(x - 22 * k) + ' ' + f(y - 6 * k) + ' ' + f(x - 12 * k) + ' ' + f(y - 22 * k) + ' ' + f(x) + ' ' + f(y - 11 * k) + ' C' + f(x + 12 * k) + ' ' + f(y - 22 * k) + ' ' + f(x + 22 * k) + ' ' + f(y - 6 * k) + ' ' + f(x) + ' ' + f(y + 10 * k) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.4"/>'; };
  s += heart(cx, y0 + g, sc * (hl.heart ? 1.15 + .08 * Math.sin(t * 6) : 1), op.liked ? TTR : "#f4f1e6") + T(op.likes || "12.4K", cx, y0 + g + 24 * sc, 10 * sc, "#fff", 700);
  s += '<path d="M' + f(cx - 15 * sc) + ' ' + f(y0 + 2 * g - 8 * sc) + ' a15 12 0 1 1 6 10 l-8 5 l2 -8 Z" fill="#f4f1e6" stroke="' + INK + '" stroke-width="1.4"/>' + T("318", cx, y0 + 2 * g + 20 * sc, 10 * sc, "#fff", 700);
  s += '<path d="M' + f(cx - 9 * sc) + ' ' + f(y0 + 3 * g - 14 * sc) + ' h' + f(18 * sc) + ' v' + f(26 * sc) + ' l' + f(-9 * sc) + ' ' + f(-7 * sc) + ' l' + f(-9 * sc) + ' ' + f(7 * sc) + ' Z" fill="#f4f1e6" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<path d="M' + f(cx + 14 * sc) + ' ' + f(y0 + 4 * g - 4 * sc) + ' l' + f(-14 * sc) + ' ' + f(-14 * sc) + ' v' + f(8 * sc) + ' q' + f(-16 * sc) + ' 0 ' + f(-16 * sc) + ' ' + f(18 * sc) + ' q' + f(6 * sc) + ' ' + f(-8 * sc) + ' ' + f(16 * sc) + ' ' + f(-6 * sc) + ' v' + f(8 * sc) + ' Z" fill="#f4f1e6" stroke="' + INK + '" stroke-width="1.4"/>';
  s += T("@user", w * .06, h * .86, 14 * sc, "#fff", 800, "end") + R(w * .06, h * .885, w * .55, 6 * sc, "#e8e4da", 0, 3) + R(w * .06, h * .91, w * .38, 6 * sc, "#e8e4da", 0, 3);
  var p = op.prog == null ? (t * .12) % 1 : op.prog;
  s += R(0, h - 5 * sc, w, 5 * sc, "#000", 0) + R(0, h - 5 * sc, w * clamp(p), 5 * sc, "#f4f1e6", 0);
  return s;
}
// a Facebook post marked «ممول» (Sponsored): avatar, name, the picture, the shop bar, like · comment · share
function fbPost(w, k, op) {
  op = op || {}; var s = "", h = w * 1.22;
  s += R(0, 0, w, h, "#fbf8f1", 1.4);
  s += C(w * .9, w * .1, w * .055, op.av || OLIVE, 1.4) + R(w * .4, w * .065, w * .38, w * .03, INK, 0, 3) + T("ممول", w * .78, w * .15, w * .045, MUTE, 700, "start");
  s += G("translate(0 " + f(w * .2) + ")", clip(op.kind == null ? 5 : op.kind, w, w * .78, op.t || 0));
  s += R(0, w * .98, w, w * .1, "#ede7da", 0) + T(op.shop || "تسوّق الآن", w * .17, w * 1.045, w * .04, INK, 800) + R(w * .55, w * 1.02, w * .38, w * .025, MUTE, 0, 3);
  s += '<path d="M0 ' + f(w * 1.1) + ' H' + f(w) + '" stroke="' + KHAKI + '" stroke-width="1.2"/>' + T("أعجبني", w * .83, w * 1.17, w * .04, FB, 700) + T("تعليق", w * .5, w * 1.17, w * .04, MUTE, 700) + T("مشاركة", w * .17, w * 1.17, w * .04, MUTE, 700);
  return s;
}
function fbScreen(w, h, t, op) {
  op = op || {}; var s = R(0, 0, w, h, "#e9e6df", 0) + R(0, 0, w, h * .1, "#fbf8f1", 0) + T("facebook", w * .08, h * .07, w * .085, FB, 800, "end");
  s += G("translate(" + f(w * .04) + " " + f(h * .13 - (op.scroll || 0)) + ")", fbPost(w * .92, 1, { t: t, kind: op.kind }));
  return s;
}
// a stopwatch, drawn around 0,0, radius r, the hand at fraction k of a turn
function watch(r, k, col) {
  var a = -Math.PI / 2 + k * Math.PI * 2;
  return R(-r * .18, -r * 1.32, r * .36, r * .22, INK, 0, 2) + C(0, 0, r, "#f4ecdb", 3) +
    '<path d="M0 0 L0 ' + f(-r) + ' A' + f(r) + ' ' + f(r) + ' 0 ' + (k % 1 > .5 ? 1 : 0) + ' 1 ' + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r) + ' Z" fill="' + (col || ORANGE) + '" opacity=".3"/>' +
    '<path d="M0 0 L' + f(Math.cos(a) * r * .82) + ' ' + f(Math.sin(a) * r * .82) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(0, 0, 5, INK, 0);
}
// a person as a plain token (no face): head and shoulders
function person(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M-22 30 Q-22 6 0 6 Q22 6 22 30 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + C(0, -8, 12, col, 2)); }
// a browser window with a shop's product page
function shopPage(x, y, w, k, t) {
  var h = w * .9, s = R(x, y, w, h, "#fbf8f1", 2.2) + R(x, y, w, h * .09, "#e2d9c4", 2.2);
  s += C(x + w - 18, y + h * .045, 5, ORANGE, 1) + C(x + w - 34, y + h * .045, 5, "#d9b44a", 1) + C(x + w - 50, y + h * .045, 5, OLIVE, 1);
  s += R(x + 16, y + h * .02, w - 90, h * .05, "#fbf8f1", 1.2, 6) + T("shop.com/sneakers", x + 26, y + h * .062, 14, MUTE, 600, "end");
  s += R(x + w * .52, y + h * .16, w * .42, h * .44, "#ddd2b8", 1.4) + G("translate(" + f(x + w * .73) + " " + f(y + h * .4) + ") scale(" + f(w / 560) + ")", sneaker());
  s += R(x + w * .06, y + h * .18, w * .38, 12, INK, 0, 3) + R(x + w * .06, y + h * .24, w * .3, 9, MUTE, 0, 3) + N("1,850", x + w * .25, y + h * .38, 30, ORANGE) + T("جنيه", x + w * .25, y + h * .45, 16, INK, 700);
  s += R(x + w * .06, y + h * .66, w * .88, h * .1, ORANGE, 2, 6) + T("أضف للعربة", x + w * .5, y + h * .73, 20, "#fff", 800);
  return s;
}
// the Meta Pixel snippet as it sits in a page's code
function pixelCode(x, y, w, k) {
  var s = R(x, y, w, 128, "#2b2723", 2.2, 6), L1 = "<script>", L2 = "fbq('track',", L3 = "  'ViewContent');", L4 = "</script>";
  var mono = function (txt, yy, col) { return '<text x="' + f(x + 16) + '" y="' + f(yy) + '" style="font:700 19px DejaVu Sans Mono, monospace;fill:' + col + ';direction:ltr" text-anchor="start">' + txt.replace(/</g, "&lt;") + '</text>'; };
  return s + sweep(x, y, w, 128, k, "r", mono(L1, y + 28, "#9fb6c6") + mono(L2, y + 56, "#e7c27a") + mono(L3, y + 84, "#e7c27a") + mono(L4, y + 112, "#9fb6c6"));
}
// a server rack (front): units with drive slots and blinking lights
function rack(x, y, w, h, t) {
  var s = R(x, y, w, h, "#4a4540", 2.4, 4), n = 7, uh = (h - 20) / n;
  for (var i = 0; i < n; i++) { var yy = y + 10 + i * uh; s += R(x + 10, yy, w - 20, uh - 6, "#6b645c", 1.4, 2);
    for (var j = 0; j < 4; j++) s += R(x + 18 + j * 16, yy + 6, 10, uh - 18, "#3a3632", 0, 1);
    s += C(x + w - 22, yy + uh / 2 - 3, 3.5, Math.sin(t * 7 + i * 1.7) > 0 ? "#9bd06a" : "#2f4a22", 0) + C(x + w - 34, yy + uh / 2 - 3, 3.5, Math.sin(t * 5 + i) > .3 ? ORANGE : "#5a3424", 0); }
  return s;
}
function dataDot(x1, y1, x2, y2, t, n, col) { var s = ""; for (var i = 0; i < n; i++) { var p = ((t * .7 + i / n) % 1); s += R(lerp(x1, x2, p) - 7, lerp(y1, y2, p) - 5, 14, 10, col || ORANGE, 1.2, 2); } return s; }
// a row of numbers the app logs for one video
function logRow(x, y, k, cells) {
  var s = "", cw = 130;
  cells.forEach(function (c, i) { var kk = at(k, i * .25, .3); if (kk <= 0) return; s += G("", R(x - (i + 1) * cw, y, cw - 8, 70, "#f4ecdb", 2) + T(c[0], x - i * cw - cw / 2 - 4, y + 26, 17, MUTE, 700) + N(c[1], x - i * cw - cw / 2 - 4, y + 60, 28, c[2] || INK), kk); });
  return s;
}

// ── shots ──
// 4 · «قاعدة صغيرة»: a pinned card
shot(4, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), phone(320, 420, 520, function (w, h) { return ttScreen(w, h, t, { kind: 0 }); })) +
    G("", '<rect x="120" y="200" width="400" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 285)"/>' + C(320, 206, 9, ORANGE, 2) +
      T("كل حركة", 320, 270, 44, INK, 800) + T("= رقم", 320, 330, 46, ORANGE, 800), at(u, .4, .4));
});
// 5 · it doesn't understand words, it understands numbers: each action turns into a number in a row
shot(5, push(330, 380, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .5, d - 1);
  return paper() + phone(440, 300, 400, function (w, h) { return ttScreen(w, h, t, { kind: 1, hl: { heart: k > .3 } }); }) +
    G("", '<path d="M110 160 q-40 -10 -40 30 q0 40 50 36 l-8 22 l30 -24 q50 -4 46 -40 q-4 -30 -50 -24 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T("كلام؟", 118, 205, 24, INK, 800), at(u, .2, .3)) + cross(118, 196, .9, at(u, 1, .4)) +
    logRow(620, 560, k, [["قعدت", count(14, k) + "s", ORANGE], ["لايك", "1"], ["رجعته", "×" + Math.round(2 * ease(k))], ["قلّبت", "0"]]) + label(250, 595, 330, 690, "سطر أرقام لكل فيديو", OLIVE, at(u, 1.6, .5), 22);
});
// 6 · how does it know you liked it? not just the like: the action column, the heart dims
shot(6, push(330, 380, 1.08, 1.0), function (u, d, t) {
  var k = at(u, d * .55, .6);
  return paper() + phone(300, 400, 600, function (w, h) { return ttScreen(w, h, t, { kind: 2, hl: { heart: k < .1 } }); }) +
    label(430, 360, 470, 230, "اللايك", BLUE, at(u, .3, .5), 26) + G("", T("بس؟", 540, 300, 30, ORANGE, 800), k) + cross(565, 260, .7, at(u, d * .6, .4));
}, { tr: "in" });
// 7 · the number that matters most: how long you stayed — the progress bar fills and a stopwatch counts
shot(7, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, d - .5);
  return paper() + phone(220, 400, 560, function (w, h) { return ttScreen(w, h, t, { kind: 2, prog: k }); }) +
    G("translate(490 330)", watch(90, k * .9)) + N(count(18, k) + "s", 490, 500, 54, ORANGE) + T("قعدت قد إيه", 490, 550, 26, INK, 800) + label(220, 680, 420, 690, "الشريط ده", OLIVE, at(u, 1, .5), 22);
});
// 8 · finished or watched again = liked ✓ ; swiped after a second = no ✗ (two phones side by side)
shot(8, push(320, 400, 1.02, 0.97), function (u, d, t) {
  var k1 = at(u, .2, d * .45), k2 = at(u, d * .55, d * .3), s = paper();
  s += phone(470, 380, 440, function (w, h) { return ttScreen(w, h, t, { kind: 1, prog: k1 < 1 ? k1 : (k1 + (u - d * .45) * .4) % 1 }); });
  s += phone(170, 380, 440, function (w, h) { return ttScreen(w, h, t, { kind: 0, next: 4, prog: .08 * k2, scroll: ease(at(u, d * .75, .4)) }); });
  s += G("", '<path d="M440 160 a30 30 0 1 1 -8 -20 m8 -10 v12 h-12" stroke="' + OLIVE + '" stroke-width="5" fill="none" stroke-linecap="round"/>', at(u, d * .3, .3));
  s += check(470, 660, 1.4, at(u, d * .4, .4), OLIVE) + T("عجبك", 470, 730, 30, OLIVE, 800);
  s += G("", N("1s", 170, 160, 40, ORANGE), clamp(k2 * 3)) + arrow(250, 520, 250, 300, ORANGE, 6, at(u, d * .7, .3)) + cross(170, 660, 1.1, at(u, d * .8, .4)) + G("", T("لأ", 170, 730, 30, ORANGE, 800), at(u, d * .85, .3));
  return s;
});
// 9 · like a sharp shopkeeper: a shop shelf in three-quarter view, the gaze lingers on one item; thumbnail: the seller
shot(9, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), items = [GREY, ORANGE, BLUE, OLIVE], pick = 1 + (at(u, d * .3, 1) > .5 ? 0 : 0);
  s += '<path d="M60 250 L580 210 L600 560 L80 600 Z" fill="#e6dcc5" stroke="' + INK + '" stroke-width="2"/>';
  [330, 470].forEach(function (yy, r) { s += '<path d="M70 ' + (yy + 30 - r * 4) + ' L590 ' + (yy - 10 - r * 4) + ' l8 18 L78 ' + (yy + 50 - r * 4) + ' Z" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="1.8"/>'; });
  for (var i = 0; i < 4; i++) { var x = 130 + i * 120, y = 340 - i * 9; s += G("translate(" + x + " " + (y - 40) + ")", '<path d="M-34 -30 l18 -10 h32 l18 10 l12 30 l-16 6 v44 h-60 v-44 l-16 -6 Z" fill="' + items[i] + '" stroke="' + INK + '" stroke-width="2"/>');
    s += G("translate(" + x + " " + (y + 100) + ") scale(.36)", sneaker(items[3 - i])); }
  var gx = 250 + 4 * Math.sin(t * 3), k = at(u, .4, 1.2);
  s += G("translate(560 680)", '<ellipse rx="44" ry="26" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + C(-6, 0, 15, "#5a4636", 0) + C(-6, 0, 6, INK, 0));
  s += draw("M520 665 L" + f(gx) + " 330", k, ORANGE, 2.4, ' stroke-dasharray="8 7"') + G("translate(250 220) scale(.9)", watch(36, (t * .3) % 1), at(u, 1.2, .4));
  s += iconBox(110, 120, 130, '<rect x="-46" y="-20" width="92" height="56" fill="' + TAN + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-54 -20 L-40 -46 H40 L54 -20 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-30 -46 v26 M0 -46 v26 M30 -46 v26" stroke="#f4ecdb" stroke-width="4"/>' + R(-12, 4, 24, 32, WOOD_D, 1.4), at(u, .2, .3));
  return s + label(560, 650, 470, 760, "البياع بيبص", OLIVE, at(u, 1.6, .5), 22);
});
// 10 · how does it bring you new videos? a phone, the next video coming up with a question mark
shot(10, push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + phone(320, 420, 600, function (w, h) { return ttScreen(w, h, t, { kind: 0, next: 4, scroll: .3 + .06 * Math.sin(t * 2) }); }) + T("؟", 520, 260, 140, ORANGE, 800);
}, { tr: "out" });
// 11 · people who behave like you: a crowd of tokens with taste bars; two match you; their videos travel to you
shot(11, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var s = paper(), me = [320, 640], k = at(u, .3, 1.2), match = [[150, 300], [480, 260]];
  var taste = function (x, y, a, col) { var r = ""; a.forEach(function (v, i) { r += R(x - 30 + i * 21, y + 34 - v * 40, 16, v * 40, i === 1 ? col : GREY, 1.2); }); return r; };
  for (var i = 0; i < 10; i++) { var x = 80 + (i % 5) * 120, y = 160 + Math.floor(i / 5) * 200; if ((i === 1 || i === 8)) continue; s += dim(k, person(x, y, 1, KHAKI) + taste(x, y + 40, [hash(i), hash(i + 3), hash(i + 7)], GREY)); }
  match.forEach(function (m) { s += person(m[0], m[1], 1.1, OLIVE) + taste(m[0], m[1] + 44, [.3, .95, .4], OLIVE); s += draw("M" + m[0] + " " + (m[1] + 90) + " L" + me[0] + " " + (me[1] - 70), at(u, 1.2, .6), OLIVE, 2.4, ' stroke-dasharray="8 7"'); });
  s += person(me[0], me[1], 1.3, ORANGE) + taste(me[0], me[1] + 50, [.35, .9, .3], ORANGE) + label(me[0] + 30, me[1] - 20, 470, 600, "إنت", ORANGE, at(u, .3, .4), 26);
  if (u > 1.6) for (var j = 0; j < 2; j++) { var p = ((t * .5 + j * .5) % 1), m = match[j]; s += G("translate(" + f(lerp(m[0], me[0], p) - 16) + " " + f(lerp(m[1] + 90, me[1] - 70, p) - 26) + ")", R(0, 0, 32, 52, SCR, 1.4, 5) + '<path d="M11 18 l12 8 l-12 8 Z" fill="#fff"/>'); }
  return s + label(match[1][0] + 20, match[1][1] - 20, 560, 150, "ناس شبهك", OLIVE, at(u, 1, .5), 24);
});
// 12 · every new video is tried on a few people first: rings 10 → 100 → 1,000
shot(12, push(320, 420, 1.1, 0.92), function (u, d, t) {
  var s = paper(), k1 = at(u, .05, .9), k2 = at(u, d * .55, .6), k3 = at(u, d * .75, .6);
  var ring = function (n, r, k, col) { var o = ""; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + t * (n > 40 ? -.18 : .6); o += C(320 + Math.cos(a) * r, 430 + Math.sin(a) * r, n > 40 ? 4 : 7, col, n > 40 ? 0 : 1.4); } return G("", o, clamp(k)); };
  s += ring(120, 290, k3, GREY) + ring(40, 200, k2, KHAKI) + ring(10, 110, k1, OLIVE);
  s += G("translate(304 " + f(400 - 6 * Math.abs(Math.sin(t * 3))) + ")", R(0, 0, 32, 56, SCR, 1.6, 5) + '<path d="M11 18 l12 10 l-12 10 Z" fill="#fff"/>');
  s += G("", N("10", 320, 290, 30, OLIVE), k1) + G("", N("100", 320, 205, 30, INK), k2) + G("", N("1,000+", 320, 115, 32, ORANGE), k3);
  return s + label(320 + 110, 430, 230, 700, "قعدوا عليه؟", OLIVE, at(u, .9, .5), 24) + check(250, 650, .8, at(u, d * .5, .3), OLIVE);
});
// 13 · the WSJ test: a rack of phones run by bots; a clock under two hours
shot(13, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k = at(u, .4, d - .8);
  s += '<path d="M40 560 L600 560 L620 600 L20 600 Z" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 5; i++) { var x = 90 + i * 115; s += appear(at(u, i * .15, .3), phone(x, 450, 210, function (w, h) { return ttScreen(w, h, t + i, { kind: [0, 1, 2, 3, 4][i] }); }));
    s += '<path d="M' + (x - 22) + ' 560 l8 -18 h28 l8 18" fill="#8c857c" stroke="' + INK + '" stroke-width="1.4"/>'; }
  s += G("translate(470 190)", watch(80, k * 1.8 % 1)) + T("أقل من ساعتين", 470, 325, 32, ORANGE, 800);
  s += iconBox(150, 180, 170, T("WSJ", 0, -12, 44, INK, 800) + T("تجربة", 0, 34, 24, MUTE, 700), at(u, .2, .3));
  return s + label(90, 360, 200, 680, "حسابات آلية", OLIVE, at(u, 1, .5), 22);
});
// 14 · and the ad you saw? back to the Facebook phone, a question mark
shot(14, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + phone(300, 420, 620, function (w, h) { return fbScreen(w, h, t, {}); }) + T("؟", 530, 300, 150, ORANGE, 800);
}, { tr: "fade" });
// 15 · before I tell you… the link in the bio: the channel's profile page, the link in the bio lights up
shot(15, push(320, 400, 0.98, 1.08), function (u, d, t) {
  var k = at(u, d * .45, .6), blink = .5 + .5 * Math.sin(t * 6);
  return paper() + phone(300, 460, 560, function (w, h) {
    var s = R(0, 0, w, h, "#fbf8f1", 0) + C(w / 2, h * .17, w * .14, "#f4ecdb", 2.2) + G("translate(" + f(w / 2 - 34) + " " + f(h * .17 - 34) + ") scale(.34)", '<use href="#mark"/>');
    s += T("إيه الحكاية؟", w / 2, h * .3, 26, INK, 800);
    [["متابِع", "…"], ["متابَع", "…"], ["إعجاب", "…"]].forEach(function (c, i) { s += N(c[1], w * (.78 - i * .28), h * .41, 20) + T(c[0], w * (.78 - i * .28), h * .445, 14, MUTE, 700); });
    s += R(w * .12, h * .48, w * .76, h * .05, "#e2475c", 0, 6) + T("متابعة", w / 2, h * .515, 18, "#fff", 800);
    s += T("فيديوهات بتشرح الحاجات اللي حوالينا", w / 2, h * .58, 14, INK, 700);
    s += R(w * .14, h * .6, w * .72, h * .05, k > 0 ? "rgba(189,85,47," + f(.15 + .2 * blink * k) + ")" : "none", k > 0 ? 2.4 : 0, 6) + T("اللينك هنا", w / 2, h * .633, 17, ORANGE, 800);
    for (var i = 0; i < 6; i++) s += R(w * .02 + (i % 3) * w * .33, h * .69 + Math.floor(i / 3) * h * .16, w * .3, h * .15, [SAD, "#5f8a4a", "#c8a774", "#9ab3c4", ORANGE, "#4f7c95"][i], 1, 2);
    return s;
  }) + arrow(560, 520, 440, 530, ORANGE, 7, k) + tag("اللينك في البايو", 320, 120, at(u, d * .5, .3), 32, ORANGE);
});
// 16 · the Pixel: a small piece of code inside the shop's page; about a third of popular sites
shot(16, push(320, 380, 0.96, 1.04), function (u, d, t) {
  var k = at(u, .5, 1.2);
  return paper() + appear(at(u, 0, .4), shopPage(60, 120, 520, 1, t)) + pixelCode(150, 520, 380, k) + label(530, 570, 440, 700, "البيكسل", ORANGE, at(u, 1.2, .5), 28) +
    numBox("⅓", 120, 680, at(u, d * .55, .3), 50) + G("", T("المواقع المشهورة", 260, 700, 22, INK, 800), at(u, d * .6, .3));
}, { tr: "out" });
// 17 · you look at something on a shop's site → the site tells Facebook → the ad
shot(17, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .5, 1);
  return paper() + shopPage(40, 140, 330, 1, t) + rack(460, 120, 140, 300, t) + T("فيسبوك", 530, 455, 22, FB, 800) +
    (u > .8 ? dataDot(370, 300, 460, 260, t, 3, ORANGE) : "") + draw("M370 300 L460 260", k, ORANGE, 2.4, ' stroke-dasharray="8 6"') +
    appear(at(u, d * .55, .5), phone(320, 610, 300, function (w, h) { return fbScreen(w, h, t, {}); })) + draw("M530 430 Q530 600 400 600", at(u, d * .5, .6), FB, 2.4, ' stroke-dasharray="8 6"') +
    label(200, 330, 150, 520, "بتتفرج", OLIVE, at(u, .3, .4), 22);
});
// 18 · it also knows where you are and who your friends are: a street map with a pin, friends linked to you
shot(18, push(320, 420, 1.06, 0.98), function (u, d, t) {
  var s = paper() + R(30, 140, 580, 560, "#e9e1cc", 2), k = at(u, .3, .8);
  s += '<path d="M30 300 L610 360 M30 520 L610 470 M200 140 L240 700 M440 140 L400 700" stroke="#fbf8f1" stroke-width="22"/><path d="M30 300 L610 360 M30 520 L610 470 M200 140 L240 700 M440 140 L400 700" stroke="' + KHAKI + '" stroke-width="1.4" fill="none"/>';
  s += R(60, 170, 110, 100, "#d8ccae", 1.4) + R(470, 180, 120, 140, "#d8ccae", 1.4) + R(270, 380, 110, 70, "#bfd0a6", 1.4) + R(60, 560, 140, 110, "#d8ccae", 1.4) + R(450, 520, 140, 150, "#d8ccae", 1.4);
  var py = 400 - 20 * Math.abs(Math.sin(t * 2.4)) * (1 - k);
  s += G("translate(320 " + f(py) + ")", '<path d="M0 0 C-30 -40 -34 -60 -34 -76 A34 34 0 1 1 34 -76 C34 -60 30 -40 0 0 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' + C(0, -76, 12, "#f4ecdb", 2)) + label(340, 330, 450, 200, "مكانك", OLIVE, at(u, .6, .4), 24);
  var fr = [[120, 450], [520, 420], [300, 620]];
  fr.forEach(function (p, i) { var kk = at(u, d * .45 + i * .2, .4); if (kk <= 0) return; s += draw("M320 400 L" + p[0] + " " + p[1], kk, OLIVE, 2.4, ' stroke-dasharray="6 6"') + G("", person(p[0], p[1], .9, OLIVE) + G("translate(" + (p[0] + 34) + " " + (p[1] - 40) + ")", '<circle r="16" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-3" cy="-3" r="7" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M2 2 l7 7" stroke="' + INK + '" stroke-width="3"/>'), kk); });
  return s + label(300, 600, 470, 740, "أصحابك بيدوروا", OLIVE, at(u, d * .7, .4), 22);
});
// 19 · many think the phone listens through the mic. No. — the phone's bottom edge with the mic holes, sound waves, crossed out
shot(19, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var s = paper(), k = at(u, .2, .5);
  s += phone(320, 230, 760, function (w, h) { return fbScreen(w, h, t, {}); }, { mic: true });
  s += inset(200, 640, 110, G("scale(2.6) translate(-0 -2)", R(-60, -20, 120, 30, "#3a3632", 2, 10) + C(-30, -2, 2.4, INK, 0) + C(-22, -2, 2.4, INK, 0) + C(-14, -2, 2.4, INK, 0) + C(14, -2, 2.4, INK, 0) + C(22, -2, 2.4, INK, 0) + C(30, -2, 2.4, INK, 0)), at(u, .2, .4));
  for (var i = 0; i < 3; i++) { var r = 30 + ((t * 40 + i * 30) % 90); s += G("", '<path d="M' + f(470 - r * .5) + ' ' + f(650 - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 0 ' + f(470 - r * .5) + ' ' + f(650 + r) + '" stroke="' + BLUE + '" stroke-width="4" fill="none"/>', k * (1 - r / 130)); }
  s += label(220, 640, 380, 520, "المايك", BLUE, at(u, .5, .4), 24);
  return s + cross(470, 650, 1.6, at(u, d * .75, .4)) + G("", T("لأ", 560, 560, 70, ORANGE, 800), at(u, d * .85, .3));
}, { tr: "in" });
// 20 · researchers tested over 17,000 apps: a wall of app icons; none sent your voice — a sound file with 0
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k = at(u, .3, 1.6), cols = [OLIVE, ORANGE, BLUE, "#d9b44a", "#8a6a4c", SAD, TTC, FB];
  for (var i = 0; i < 48; i++) { var x = 70 + (i % 8) * 72, y = 150 + Math.floor(i / 8) * 72, kk = clamp(k * 48 - i); if (kk <= 0) continue;
    s += G("translate(" + x + " " + y + ") scale(" + f(pop(kk)) + ")", R(-26, -26, 52, 52, cols[i % 8], 1.6, 12) + C(0, 0, 9, "#f4ecdb", 0)); }
  s += G("", R(80, 590, 300, 70, "#f4ecdb", 2.4) + N(count(17260, k), 230, 640, 40, ORANGE), clamp(k * 2)) + G("", T("تطبيق اتجرّب", 230, 690, 22, INK, 800), clamp(k * 2));
  var w = at(u, d * .55, .5);
  s += G("translate(500 640)", R(-60, -48, 120, 96, "#f4ecdb", 2.4, 8) + '<path d="M-40 0 h10 l6 -20 l10 40 l10 -34 l8 22 l6 -8 h30" stroke="' + BLUE + '" stroke-width="4" fill="none"/>', w) + G("", N("0", 590, 600, 44, ORANGE), at(u, d * .65, .3));
  return s + cross(500, 640, 1.1, at(u, d * .7, .4));
});
// 21 · they don't need to listen: your actions say more than your words — a small speech bubble vs a tall stack of log rows
shot(21, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k = at(u, .4, d - 1);
  s += G("", '<path d="M90 300 q-30 0 -30 30 v40 q0 30 30 30 h20 l-6 22 l26 -22 h40 q30 0 30 -30 v-40 q0 -30 -30 -30 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T("كلامك", 130, 364, 22, MUTE, 800), at(u, .2, .3));
  var rows = Math.floor(1 + k * 9);
  for (var i = 0; i < rows; i++) { var y = 700 - i * 56; s += R(330, y, 260, 48, i % 2 ? "#f4ecdb" : "#ece2cc", 1.6) + N(["14s", "×2", "1s", "♥", "38s", "0", "22s", "×3", "5s", "♥"][i], 380, y + 34, 22, i % 3 ? INK : ORANGE) + R(420, y + 18, 140, 10, KHAKI, 0, 4); }
  return s + label(460, 700 - (rows - 1) * 56, 380, 150, "تصرفاتك", ORANGE, at(u, 1, .4), 26) + measure(310, 748, 310, 748 - rows * 56, 1, "");
});
// 22 · to change what you see: swipe fast on what you don't want, or press «مش مهتم»
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, d * .5, .5);
  s += phone(320, 420, 640, function (w, h) {
    var o = ttScreen(w, h, t, { kind: 3, next: 0, scroll: ease(at(u, .4, .5)) * (1 - k) });
    if (k > 0) o += G("", R(0, 0, w, h, "#000", 0), .45 * k) + G("translate(0 " + f(h * (1 - .45 * ease(k))) + ")", R(0, 0, w, h * .5, "#fbf8f1", 0, 16) + R(w * .4, 10, w * .2, 6, KHAKI, 0, 3) +
      R(w * .08, 40, w * .84, 70, "#f4ecdb", 2.4, 10) + T("مش مهتم", w * .45, 86, 28, INK, 800) + '<path d="M' + f(w * .78) + ' 64 a14 14 0 1 0 0.1 0 M' + f(w * .78 - 10) + ' 85 l20 -20" stroke="' + INK + '" stroke-width="3" fill="none"/>' + R(w * .08, 130, w * .84, 50, "#fbf8f1", 1.2, 10) + R(w * .3, 150, w * .4, 10, KHAKI, 0, 4));
    return o;
  });
  s += arrow(560, 540, 560, 330, ORANGE, 7, at(u, .3, .4)) + G("", T("بسرعة", 520, 600, 26, ORANGE, 800), at(u, .4, .3));
  var tap = at(u, d * .62, .3); if (tap > 0) s += C(330, 340 + 96 * 1 , 22 + 14 * tap, "none", 3).replace('stroke="' + INK + '"', 'stroke="' + ORANGE + '"');
  return s;
});
// 23 · the recap: ① the seconds you stay ② people like you ③ the sites that report back
shot(23, push(320, 420, 0.96, 1.04), function (u, d, t) {
  var s = paper();
  s += G("translate(470 220)", watch(70, (t * .6) % 1), at(u, .1, .4)) + callout("1", 380, 160, at(u, .2, .3));
  s += G("", person(130, 420 - 8 * Math.abs(Math.sin(t * 3)), 1.1, ORANGE) + person(220, 420, 1.1, OLIVE) + person(40, 420, 1.1, OLIVE), at(u, 1.3, .4)) + callout("2", 250, 350, at(u, 1.3, .3));
  s += G("", shopPage(300, 470, 290, 1, t) + R(380, 640, 150, 34, "#2b2723", 1.6, 4) + '<text x="390" y="664" style="font:700 15px DejaVu Sans Mono, monospace;fill:#e7c27a;direction:ltr">fbq(\'track\')</text>', at(u, d * .65, .4)) + callout("3", 300, 470, at(u, d * .65, .3));
  return s + draw("M470 300 Q300 340 160 360", at(u, .8, .6), INK, 2, ' stroke-dasharray="6 6"') + draw("M220 480 Q300 520 330 560", at(u, d * .6, .5), INK, 2, ' stroke-dasharray="6 6"');
}, { tr: "out" });
// 24 · the odd fact: a bot that only lingered on sad videos — the feed fills with grey-blue rain; 36 min · 93%
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  d = LN[25].start - LN[24].start; var s = paper(), k = at(u, d * .35, d * .5);
  s += phone(200, 410, 600, function (w, h) { return ttScreen(w, h, t, { kind: k > .4 ? 3 : 0, prog: (t * .2) % 1 }); });
  for (var i = 0; i < 14; i++) { var sad = i / 14 < .93 * ease(k) || i === 0, x = 400 + (i % 2) * 110, y = 100 + Math.floor(i / 2) * 82; s += G("translate(" + x + " " + y + ")", R(0, 0, 96, 70, sad ? SAD : ["#5f8a4a", "#d9b44a", ORANGE, "#c8a774"][i % 4], 1.6, 6) + (sad ? '<path d="M30 46 q18 -14 36 0" stroke="#dbe4ea" stroke-width="3" fill="none"/>' : ""), at(u, i * .06, .3)); }
  s += G("", R(30, 690, 230, 70, "#f4ecdb", 2.4) + N(count(36, at(u, d * .35, d * .3)) + " min", 145, 740, 38, ORANGE), at(u, d * .3, .3));
  return s + numBox(count(93, k) + "%", 505, 718, at(u, d * .55, .3), 44);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: two friends talking, a speech bubble with the sneakers. line 1: the phone opens on Facebook, the sneaker ad.
  // line 2: no typing, no search — a keyboard and a search bar, both crossed out
  var s = "";
  if (li === 0) {
    var u = t - LN[0].start;
    s += person(170, 470, 3, OLIVE) + person(440, 470, 3, ORANGE);
    s += G("", '<path d="M210 120 q-40 0 -40 40 v100 q0 40 40 40 h40 l-24 50 l70 -50 h150 q40 0 40 -40 v-100 q0 -40 -40 -40 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>' + G("translate(330 225) scale(1.1)", sneaker()), clamp(u / .4));
  } else if (li === 1) {
    var u1 = t - LN[1].start;
    s += phone(304, 340, 640, function (w, h) { return fbScreen(w, h, t, { scroll: 30 * (1 - ease(u1 / 1.2)) }); });
    s += label(400, 300, 480, 120, "إعلان", ORANGE, ease((u1 - 1.2) / .5), 30);
  } else {
    var u2 = t - LN[2].start;
    s += G("translate(304 210)", R(-250, -50, 500, 100, "#fbf8f1", 3, 50) + '<circle cx="200" cy="-4" r="20" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M214 10 l18 18" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' + T("بحث…", 120, 14, 36, MUTE, 700)) + cross(304, 210, 1.6, ease((u2 - .9) / .4));
    var kb = ""; for (var r = 0; r < 3; r++) for (var c = 0; c < 9 - r; c++) kb += R(70 + r * 25 + c * 52, 380 + r * 62, 44, 52, "#f4ecdb", 2, 6);
    s += G("", kb + R(170, 566, 270, 52, "#f4ecdb", 2, 6), 1) + cross(304, 480, 1.8, ease((u2 - .2) / .4));
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 104) scale(.62)", phone(0, 0, 260, function (w, h) { return ttScreen(w, h, t, { kind: 0, next: 1, scroll: (t * .5) % 1 }); }));
};
SCENE.outro = function (svg, u, t) {
  return phone(300, 140, 260, function (w, h) { return ttScreen(w, h, t, { kind: 2 }); }) + G("translate(120 100)", watch(42, (t * .2) % 1)) + callout("1", 170, 60, ease(u / .3)) +
    person(480, 120, 1.1, ORANGE) + person(540, 120, 1.1, OLIVE) + callout("2", 560, 70, ease(u / .3 - .5)) +
    R(410, 180, 160, 40, "#2b2723", 1.6, 4) + '<text x="420" y="207" style="font:700 16px DejaVu Sans Mono, monospace;fill:#e7c27a;direction:ltr">fbq(\'track\')</text>' + callout("3", 590, 200, ease(u / .3 - 1)) +
    G("translate(120 220)", R(-40, -16, 80, 30, "#3a3632", 1.6, 8) + C(-14, 0, 2.4, "#f4ecdb", 0) + C(-6, 0, 2.4, "#f4ecdb", 0) + C(6, 0, 2.4, "#f4ecdb", 0) + C(14, 0, 2.4, "#f4ecdb", 0)) + cross(120, 220, .6, ease(u / .3 - 1.5)) + callout("4", 60, 200, ease(u / .3 - 1.5));
};
