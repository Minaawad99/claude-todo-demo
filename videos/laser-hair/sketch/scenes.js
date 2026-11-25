window.CHUNKS = [[0.0, 0.4167], [0.0], [0.0, 0.4828], [0.0, 0.4194], [0.0], [0.0, 0.3333, 0.5714], [0.0, 0.1649, 0.268, 0.5155, 0.6701, 0.8351], [0.0, 0.6053], [0.0, 0.5714], [0.0, 0.375, 0.7292], [0.0, 0.3194, 0.5417, 0.6944], [0.0, 0.2154, 0.4308, 0.6615], [0.0, 0.4483], [0.0, 0.2833, 0.5333, 0.8167], [0.0], [0.0, 0.4857], [0.0, 0.5333, 0.7778], [0.0, 0.25, 0.4474, 0.6579, 0.8421], [0.0, 0.1975, 0.3333, 0.6543, 0.8642], [0.0, 0.2281, 0.5614, 0.7895], [0.0, 0.2179, 0.3974, 0.6026, 0.859], [0.0, 0.3469, 0.6735], [0.0, 0.2609, 0.6522], [0.0, 0.2586, 0.5862], [0.0, 0.1809, 0.4149, 0.6702, 0.883], [0.0], [0.0, 0.6304]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the frame never shakes (user's rule after viewers complained): the camera holds still and moves only in eased ~1.8 s flies in or out (fly / still); motion comes from the drawing (pulses, flows, things appearing);
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
// fly(from, to, dur): the «طب إزاي؟» camera move, measured frame by frame in the bypass video: the frame holds dead still,
// then flies in one eased (slow-fast-slow) move of about 1.8 s to a new [cx, cy, zoom] (×1.2–2.4 in onto the part being
// talked about, or back out ×0.4–0.8), then holds still again. No drift, no wobble. from / to are [cx, cy, zoom].
function fly(a, b, dur) { dur = dur || 1.8; return function (u) { var k = ease(u / dur); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), a[2] * Math.pow(b[2] / a[2], k)]; }; }
function still(x, y, z) { return function () { return [x, y, z || 1]; }; }
var XF = 0.45;   // crossfade length (s)
window.SCENE = window.SCENE || {};
window.__t = 0;
window.SCENE.panel = function (A, B, t) {
  window.__t = t; CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0], cy = c[1], z = c[2] * extraZ;   // dead-still frame between moves, as measured in «طب إزاي؟» (the user's rule: no shake, it tired viewers' eyes). The life qa.py needs comes from the drawing itself
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

// ── «إزاي الليزر بيشيل الشعر؟» — shots. Drawings in draw.js (LZ.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move (user's rule): the frame holds dead still on one drawing for several lines, then flies
// (eased, ~1.8 s) in onto the part being talked about and later back out. The life between moves is in the drawing:
// the light pulses, heat runs, melanin glows, hairs move.
var FX = [.14, .38, .62, .86], BX = 40, BY = 330, BW = 540;           // the skin block and its follicles
var W = [320, 470, 1.0], F = [228, 470, 1.75], B = [200, 572, 2.7], S = [262, 330, 1.9];
var WOMAN = { hair: "long", fem: true }, WCOL = Object.assign({}, PERSON.colors, { hair: "#3b2519", hairL: "#7a5238", lip: "#b8545c" });
function pulse(t) { return Math.max(0, 1 - ((t * 1.4) % 1) * 2.6); }                       // a flash every 0.7 s
function face(x, y, sz, fc, k) {   // the woman's face in a framed box (iconBox look)
  return iconBox(x, y, sz, '<clipPath id="fc' + (++CLIPN) + '"><rect x="' + f(-sz / 2 + 3) + '" y="' + f(-sz / 2 + 3) + '" width="' + f(sz - 6) + '" height="' + f(sz - 6) + '"/></clipPath><g clip-path="url(#fc' + CLIPN + ')">' +
    PERSON.head([0, sz * .1], sz / 80, 0, { face: fc, _of: WOMAN }, WCOL) + '</g>', k);
}
function block(fol, o) { return LZ.skinBlock(BX, BY, BW, fol, o).svg; }
function laser(x, y, t, on, L, col) { var p = on ? pulse(t) : 0; return LZ.beam(x, y, L || 300, on ? (.35 + .65 * p) : 0, col) + LZ.handpiece(x, y, .8, p); }
function fols(o1, o0) { return FX.map(function (x, i) { return Object.assign({ x: x }, o0 || {}, i === 1 ? o1 || {} : {}); }); }
function cal(x, y, txt, k) { return iconBox(x, y, 130, '<rect x="-40" y="-34" width="80" height="70" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="-34" width="80" height="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' +
  '<path d="M-24 -42 V-28 M24 -42 V-28" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + T(txt, 0, 20, txt.length > 6 ? 15 : 19, INK, 800), k); }
function chip(txt, x, y, col, k) { k = pop(k); if (k <= 0) return ""; var w = txt.length * 15 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="-20" width="' + w + '" height="40" rx="8" fill="' + col + '"/>' + T(txt, 0, 9, 22, "#fbf8f1", 800)); }

// 4 · «طب الليزر بيعمل إيه أصلاً؟» — the leg under the handpiece, a big question mark
shot(4, still(320, 393, 1), function (u, d, t) {
  return paper() + LZ.leg(38, 470, .97, {}) + laser(250, 438, t, true, 0) + T("؟", 500, 300, 150, ORANGE, 800);
});
// 5 · the device sends a pulse of light — into the cut-open skin
shot(5, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, u > .3, 300 * at(u, .3, .5)); });
shot([5, 2], still(W[0], W[1], W[2]), function (u, d, t) {   // shorter than a blink: an eye that blinks beside the flash
  var bl = Math.abs(Math.sin(t * 2.2)), eye = '<path d="M-44 0 Q0 ' + f(-34 * bl) + ' 44 0 Q0 ' + f(34 * bl) + ' -44 0 Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="3"/>' + (bl > .3 ? '<circle r="' + f(14 * bl) + '" fill="#4a3426"/>' : "") + T("رمشة عين", 0, 66, 20, INK, 800);
  return paper() + block(fols()) + laser(262, 300, t, true, 300) + iconBox(510, 130, 150, eye, at(u, .1, .3));
});
// 6 · the light passes the skin… and looks for one colour: the dark pigment in the hair, melanin
shot(6, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, true, 300 * at(u, 0, 1)); });
shot([6, 2], fly(W, F, 1.8), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, true, 300); });
shot([6, 3], still(F[0], F[1], F[2]), function (u, d, t) {
  var k = at(u, .1, 1.2); return paper() + block(fols({ mel: k }), {}) + laser(262, 300, t, true, 300) + (u > 1.4 ? label(214, 470, 330, 420, "الميلانين", ORANGE, at(u, 1.4, .5), 15) : "");
});
// 7 · melanin drinks the light and turns it into heat
shot(7, still(F[0], F[1], F[2]), function (u, d, t) { return paper() + block(fols({ mel: 1 })) + laser(262, 300, t, true, 300) + label(214, 470, 330, 420, "الميلانين", ORANGE, 1, 15); });
shot([7, 1], still(F[0], F[1], F[2]), function (u, d, t) {
  var k = at(u, 0, 1.2) * .35; return paper() + block(fols({ mel: 1, k: k + .04 * Math.sin(t * 6) })) + laser(262, 300, t, true, 300) + label(262, 360, 340, 400, "حرارة", ORANGE, at(u, .4, .4), 16);
});
// 8 · like a black blouse in the sun: it heats faster than the white one
function blouse(x, y, col) { return LZ.shape([[x - 70, y], [x - 34, y - 14], [x - 16, y - 4], [x + 16, y - 4], [x + 34, y - 14], [x + 70, y], [x + 96, y + 56], [x + 66, y + 70], [x + 54, y + 44], [x + 56, y + 170], [x - 56, y + 170], [x - 54, y + 44], [x - 66, y + 70], [x - 96, y + 56]], col, 2.4) + LZ.line([[x - 16, y - 4], [x, y + 12], [x + 16, y - 4]], INK, 2); }
function thermo(x, y, k) { return '<rect x="' + (x - 9) + '" y="' + y + '" width="18" height="120" rx="9" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + (y + 128) + '" r="15" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x - 4) + '" y="' + f(y + 120 - 110 * k) + '" width="8" height="' + f(110 * k + 10) + '" fill="' + ORANGE + '"/>'; }
function heatUp(x, y, t, n) {   // heat squiggles rising from the black blouse, all the time
  var L = window.LIFE || 1, s = ""; for (var i = 0; i < 4 * L; i++) { var u = (t * .7 + i / (4 * L)) % 1, xx = x - 60 + (i % 5) * 30, yy = y - u * 110; s += G("", '<path d="M' + f(xx) + ' ' + f(yy) + ' q8 -10 0 -20 t0 -20" stroke="' + ORANGE + '" stroke-width="' + f(3 + L) + '" fill="none" stroke-linecap="round"/>', 1 - u); } return s; }
function sunAt(t) { var s = '<circle cx="320" cy="150" r="46" fill="#e9b949" stroke="' + INK + '" stroke-width="2.4"/>'; for (var r = 0; r < 12; r++) { var a = r * Math.PI / 6 + t * .4 * (window.LIFE || 1); s += LZ.line([[320 + Math.cos(a) * 62, 150 + Math.sin(a) * 62], [320 + Math.cos(a) * 82, 150 + Math.sin(a) * 82]], "#c9962a", 4); } return s; }
shot(8, still(320, 393, 1), function (u, d, t) {
  var k = at(u, .3, d + 1.5);
  return paper() + sunAt(t) + blouse(180, 300, "#2f2a28") + blouse(460, 300, "#f6f2ea") + heatUp(180, 290, t) + thermo(150, 520, .2 + .65 * k) + thermo(430, 520, .2 + .1 * k);
});
shot([8, 1], still(320, 393, 1), function (u, d, t) {
  return paper() + sunAt(t) + blouse(180, 300, "#2f2a28") + blouse(460, 300, "#f6f2ea") + heatUp(180, 290, t) + thermo(150, 520, .85) + thermo(430, 520, .3) + G("", T("بتسخن أسرع", 180, 720, 30, ORANGE, 800), at(u, .1, .3)) +
    wave(120, 270, 240, 270, t, ORANGE, 4, 12, at(u, .2, .4), 2);
});
// 9 · the heat runs down inside the hair… to the bulb
shot(9, still(F[0], F[1], F[2]), function (u, d, t) { return paper() + block(fols({ mel: 1, k: .35 + .45 * at(u, 0, d) })) + laser(262, 300, t, true, 300); });
shot([9, 2], fly(F, B, 1.8), function (u, d, t) { return paper() + block(fols({ mel: 1, k: .8 + .2 * at(u, 0, 1.2) + .03 * Math.sin(t * 6) })); });
// 10 · the bulb is the factory, a few millimetres under the skin; it makes the hair
shot(10, still(B[0], B[1], B[2]), function (u, d, t) { return paper() + block(fols({ k: .96 + .04 * Math.sin(t * 5) })) + tag("المصنع", 200, 520, at(u, .3, .3), 16, OLIVE); });
shot([10, 1], fly(B, [215, 470, 1.5], 1.8), function (u, d, t) {
  return paper() + block(fols({ k: .96 + .04 * Math.sin(t * 5) })) + tag("المصنع", 200, 520, 1, 16, OLIVE) + measure(300, 330, 300, 590, at(u, .5, .8), "") + G("", T("كام مللي", 360, 470, 20, ORANGE, 800), at(u, 1.1, .3));
});
shot([10, 3], still(215, 470, 1.5), function (u, d, t) {   // it makes the hair: the shaft grows a little out of the bulb
  return paper() + block(fols({ out: 60 + 14 * at(u, 0, d) })) + tag("المصنع", 200, 520, 1, 16, OLIVE) + arrow(170, 560, 170, 440, OLIVE, 4, at(u, .2, .5));
});
// 11 · the heat harms the factory's cells: it weakens and can hardly make a new hair
shot(11, fly([215, 470, 1.5], B, 1.8), function (u, d, t) { return paper() + block(fols({ k: 1, dmg: at(u, .6, d) })); });
shot([11, 2], still(B[0], B[1], B[2]), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + tag("ضعيف", 200, 520, at(u, .1, .3), 16, ORANGE) + cross(250, 540, .55, at(u, .8, .5)); });
// 12 · so why doesn't the hair fall at once?
shot(12, fly(B, W, 1.8), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + G("", T("؟", 520, 230, 120, ORANGE, 800), at(u, 1.2, .3)); });
// 13 · the hair is still in place; the skin needs time to push it out
shot(13, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + T("؟", 520, 230, 120, ORANGE, 800) + label(240, 380, 120, 230, "لسه مكانها", INK, at(u, .2, .5), 16); });
shot([13, 2], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ dmg: 1, shed: .9 * at(u, .2, d + 1.4) })) + arrow(300, 300, 330, 200, ORANGE, 5, at(u, .3, .4)) + cal(520, 160, "1–3 أسابيع", at(u, .1, .3));
});
// 14 · why so many sessions? — her face and the session counter
shot(14, still(320, 393, 1), function (u, d, t) {
  var s = paper() + LZ.leg(38, 520, .97, {}) + face(320, 200, 200, { mouth: "frown", brows: "worried", look: [0, .4], eyes: 1 - .9 * (Math.sin(t * 2.5) > .97) }, at(u, 0, .3));
  for (var i = 0; i < 6; i++) s += callout(String(i + 1), 110 + i * 84, 700, at(u, .2 + i * .12, .3), 22);
  return s;
});
// 15 · not all the hair works at the same time — three follicles in three phases
var PH = [{ x: .2, phase: "grow" }, { x: .52, phase: "stop" }, { x: .83, phase: "rest", out: 30 }], PX3 = [148, 321, 488];
function block3(o) { return LZ.skinBlock(BX, BY, BW, PH.map(function (q, i) { return Object.assign({}, q, (o || [])[i] || {}); })).svg; }
shot(15, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + appear(at(u, 0, .6), block3()); });
// 16 · growth, stopped, asleep: each one named in turn while the others dim
shot(16, still(W[0], W[1], W[2]), function (u, d, t) {
  var c = window.CHUNKS[16], l = LN[16], i = 0; for (var j = 0; j < c.length; j++) if (t >= l.start + (l.end - l.start) * c[j]) i = j;
  var s = paper() + block3(), cols = ["#4f8a7a", INK, INK], names = ["نمو", "واقف", "نايم"];
  for (var k = 0; k <= i; k++) s += chip(names[k], PX3[k], 210, k === i ? cols[0] === cols[k] ? cols[k] : ORANGE : "#6d6a64", at(t - (l.start + (l.end - l.start) * c[k]), 0, .3));
  return s + G("", '<rect x="' + f(PX3[i] - 70) + '" y="260" width="140" height="470" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" rx="10"/>', at(u, .1, .3));
});
// 17 · the laser hits the growing hair hardest, because it still holds on to the bulb
function chips3(k) { return chip("نمو", PX3[0], 210, "#4f8a7a", k) + chip("واقف", PX3[1], 210, "#6d6a64", k) + chip("نايم", PX3[2], 210, "#6d6a64", k); }
shot(17, still(W[0], W[1], W[2]), function (u, d, t) {
  var k = at(u, .5, d + 2); return paper() + block3([{ k: k }, { k: k * .35 }, { k: 0 }]) + chips3(1) + LZ.beam(320, 300, 300, .4 + .5 * pulse(t), null).replace(/x/, "x") ;
});
shot([17, 3], fly(W, [148, 560, 2.2], 1.8), function (u, d, t) { return paper() + block3([{ k: 1 }, { k: .35 }, {}]) + chips3(1) + label(110, 600, 60, 500, "ماسك في البُصيلة", "#4f8a7a", at(u, 1.6, .5), 13); });
// 18 · you wait a few weeks, the sleeping hair wakes, and the next session hits it
shot(18, fly([148, 560, 2.2], W, 1.8), function (u, d, t) { return paper() + block3([{ dmg: 1 }, {}, {}]) + chips3(1) + cal(520, 150, "كام أسبوع", at(u, 1.2, .3)); });
shot([18, 2], still(W[0], W[1], W[2]), function (u, d, t) {   // the asleep follicle becomes a growing one
  var k = at(u, .1, .8); return paper() + G("", block3([{ dmg: 1 }, {}, {}]), 1 - k) + G("", block3([{ dmg: 1 }, {}, { phase: "grow", out: 60 }]), k) + chip("نمو", PX3[2], 210, "#4f8a7a", 1) + chip("نمو", PX3[0], 210, "#4f8a7a", 1) + chip("واقف", PX3[1], 210, "#6d6a64", 1);
});
shot([18, 3], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block3([{ dmg: 1 }, {}, { phase: "grow", out: 60, k: at(u, .3, d) }]) + laser(500, 300, t, true, 300) + chip("الجلسة 2", 160, 160, ORANGE, at(u, .1, .3));
});
// 19 · so it works best on dark hair in light skin
shot(19, still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ mel: 1, k: .5 + .5 * at(u, .2, d) })) + laser(262, 300, t, true, 300) + chip("شعر غامق", 470, 170, INK, at(u, LN[19].end - LN[19].start > 2 ? 1.0 : .5, .3)) + chip("جلد فاتح", 470, 222, "#c27a68", at(u, 1.6, .3)) + check(560, 120, .8, at(u, 2.2, .4));
});
// 20 · on dark skin the skin's own melanin would take the light; a longer wavelength goes past it to the hair
shot(20, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + LZ.skinBlock(BX, BY, BW, fols(), { skinMel: true }).svg + T("بشرة غامقة", 470, 190, 24, INK, 800); });
shot([20, 1], still(W[0], W[1], W[2]), function (u, d, t) {
  var p = pulse(t); return paper() + LZ.skinBlock(BX, BY, BW, fols({ mel: 1, k: .2 + .8 * at(u, .3, d + 1.6) }), { skinMel: true }).svg + LZ.beam(262, 300, 300, .4 + .6 * p, "#f0c6b8") + LZ.handpiece(262, 300, .8, p) +
    chip("طول موجي أطول", 470, 190, "#a5473b", at(u, .1, .3));
});
shot([20, 4], still(W[0], W[1], W[2]), function (u, d, t) {
  var p = pulse(t); return paper() + LZ.skinBlock(BX, BY, BW, fols({ mel: 1, k: 1 }), { skinMel: true }).svg + LZ.beam(262, 300, 300, .4 + .6 * p, "#f0c6b8") + LZ.handpiece(262, 300, .8, p) +
    chip("طول موجي أطول", 470, 190, "#a5473b", 1) + label(330, 345, 450, 270, "الجلد مايسخنش", "#4f8a7a", at(u, .1, .5), 15);
});
// 21 · many women think the laser removes hair for ever. No.
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + LZ.leg(38, 520, .97, { cleared: [60, 400] }) + face(320, 200, 200, { mouth: "smile", eyes: 1 - .9 * (Math.sin(t * 2.5) > .97) }, at(u, 0, .3)); });
shot([21, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + LZ.leg(38, 520, .97, { cleared: [60, 400] }) + face(320, 200, 200, { mouth: "smile" }, 1) + chip("للأبد", 320, 360, INK, at(u, 0, .3)) + cross(320, 360, 1, at(u, .5, .5));
});
// 22 · it reduces it; what comes back is finer and lighter
shot(22, still(320, 393, 1), function (u, d, t) { return paper() + LZ.leg(38, 520, .97, { keep: .35 + .65 * (1 - at(u, .2, d)) }) + face(320, 200, 200, { mouth: "neutral" }, 1); });
shot([22, 1], still(320, 393, 1), function (u, d, t) {
  var hair = function (x, w, col) { return LZ.line([[x, 60], [x + 18, -50]], INK, w + 3) + LZ.line([[x, 60], [x + 18, -50]], col, w); };
  return paper() + LZ.leg(38, 520, .97, { keep: .35, thin: true }) + face(320, 200, 200, { mouth: "smile" }, 1) +
    iconBox(540, 160, 150, hair(-40, 7, "#3b2519") + hair(20, 2.5, "#8a6a52") + T("قبل", -32, 62, 16, INK, 800) + T("بعد", 28, 62, 16, INK, 800), at(u, .2, .3)) + chip("أخف وأرفع", 320, 700, "#4a6f8a", at(u, LN[22].end - LN[22].start - 1.5 > 0 ? 1.4 : .8, .3));
});
// 23 · bottom line: light → heat → the bulb → weakened (numbered on the one follicle)
var RC = [215, 470, 1.5];
shot(23, fly(W, RC, 1.8), function (u, d, t) { return paper() + block(fols({ mel: 1 })) + laser(262, 300, t, true, 300); });
shot([23, 1], still(RC[0], RC[1], RC[2]), function (u, d, t) {
  return paper() + block(fols({ mel: 1, k: at(u, .4, 1) })) + laser(262, 300, t, true, 300) + callout("1", 300, 330, at(u, 0, .3), 16) + callout("2", 250, 420, at(u, .6, .3), 16);
});
shot([23, 2], still(RC[0], RC[1], RC[2]), function (u, d, t) {
  return paper() + block(fols({ k: 1, dmg: at(u, .5, 1) })) + laser(262, 300, t, true, 300) + callout("1", 300, 330, 1, 16) + callout("2", 250, 420, 1, 16) + callout("3", 150, 580, at(u, 0, .3), 16) + callout("4", 250, 610, at(u, .6, .3), 16);
});
// 24 · the oddest: white and light blonde hair doesn't react at all — no melanin to drink the light
shot(24, fly(RC, W, 1.8), function (u, d, t) { return paper() + block(fols({ white: true }, { white: true }), { white: true }); });
shot([24, 3], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ white: true }, { white: true }), { white: true }) + laser(262, 300, t, true, 420) + label(214, 470, 340, 420, "مافيهوش ميلانين", "#6d6a64", at(u, .2, .5), 14) + cross(150, 600, .9, at(u, .9, .5));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: her leg under the handpiece. line 1: the hairs are still there (her face, surprised). line 2: two weeks, they fall
  var l2 = LN[2], fall = li >= 2 ? clamp((t - l2.start - .4) / Math.max(1, l2.end - l2.start)) : 0;
  var s = LZ.leg(0, 430, .96, { bracket: li === 0 ? [130, 310] : null, fall: fall }) + (li === 0 ? LZ.beam(232, 400, 0, 0) + LZ.handpiece(232, 400, .85, pulse(t)) : "");
  if (li >= 1) s += face(470, 150, 190, { mouth: li >= 2 ? "smile" : "o", eyes: li >= 2 ? 1 : 1.25, brows: li >= 2 ? "neutral" : "raised", look: [0, .6] }, ease((t - LN[1].start) / .3));
  if (li >= 2) s += cal(120, 150, "أسبوعين", ease((t - l2.start) / .3));
  return s;
};
SCENE.bumper = function (u, t) {
  var p = pulse(t); return LZ.beam(90, 120, 80, .5 + .5 * p) + LZ.handpiece(90, 120, .55, p) + '<rect x="0" y="120" width="180" height="80" fill="#e4a593"/>' + LZ.line([[40, 120], [52, 96]], INK, 3) + LZ.line([[110, 120], [122, 96]], INK, 3);
};
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(60 -110) scale(.62)">' + LZ.skinBlock(40, 300, 540, [{ x: .38, k: 1 }], { backHairs: 4 }).svg + LZ.beam(262, 270, 280, .6 + .4 * pulse(t)) + LZ.handpiece(262, 270, .8, pulse(t)) + '</g>' +
    callout("1", 270, 70, ease(u / .3)) + callout("2", 190, 150, ease(u / .3 - .5)) + callout("3", 230, 200, ease(u / .3 - 1)) + callout("4", 150, 250, ease(u / .3 - 1.5));
};
