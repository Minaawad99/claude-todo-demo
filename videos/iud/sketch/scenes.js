window.CHUNKS = [[0.0, 0.4583, 0.6875], [0.0, 0.5], [0.0, 0.4783], [0.0, 0.4194], [0.0, 0.4828], [0.0, 0.2353, 0.7647], [0.0, 0.2396, 0.4479, 0.6354, 0.8542], [0.0, 0.625], [0.0, 0.2895, 0.6974], [0.0, 0.4375], [0.0, 0.325, 0.45, 0.6875], [0.0, 0.3542, 0.5833], [0.0, 0.2059, 0.4265, 0.7353], [0.0, 0.1795, 0.4103, 0.6282], [0.0, 0.6667], [0.0, 0.5862], [0.0, 0.2295, 0.4426, 0.8525], [0.0, 0.2131, 0.4262, 0.6393], [0.0, 0.3409, 0.6591], [0.0, 0.2658, 0.4051, 0.6329, 0.8354], [0.0, 0.1897, 0.4483], [0.0, 0.381, 0.9286], [0.0, 0.2881, 0.4746, 0.661], [0.0, 0.1515, 0.4545, 0.7475], [0.0, 0.268, 0.5155, 0.6495, 0.8866], [0.0], [0.0, 0.6304]];
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

// ── «اللولب بيمنع الحمل إزاي؟» — shots. Drawings in draw.js (IU.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing for several lines, then flies (eased, ~1.8 s)
// onto the part being talked about, and later back out. The life is in the drawing: sperm swim, ions drift, cells creep.
var _label = label; label = function () { return _label.apply(null, arguments).replace(/<text /g, '<text paint-order="stroke" stroke="#f4ecdb" stroke-width="4" stroke-linejoin="round" '); };   // labels on pink tissue get a paper halo so they read
var UX = 320, UY = 200, US = .95;                                  // the uterus in the panel
function L2P(p) { return [UX + p[0] * US, UY + p[1] * US]; }       // local uterus units → panel
var U = [320, 393, 1], CAV = [320, 300, 1.75], COIL = [320, 300, 2.3], CERV = [320, 500, 2.3], TUBE = [120, 220, 2.1], MID = [320, 330, 1.4];
var WOMAN = { base: "woman" }, DOC = "doctor";
function U1(o) { return IU.uterus(UX, UY, US, o); }
function chip(txt, x, y, col, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .95) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '"/>' + T(txt, 0, sz * .4, sz, "#fbf8f1", 800)); }
function cAt(li, ci) { var l = LN[li], c = window.CHUNKS[li]; return l.start + (l.end - l.start) * (c[ci] || 0); }   // page time of a caption chunk
function blink(t, ph) { return Math.sin(t * 2.3 + (ph || 0)) > .97 ? .08 : 1; }
function woman(x, y, s, face, t, extra) { return PERSON.front(Object.assign({ x: x, y: y, s: s, outfit: "woman", breath: .5 + .5 * Math.sin(t * 1.6), head: { tilt: 3 * Math.sin(t * .9) }, face: Object.assign({ eyes: blink(t) }, face || {}) }, extra || {})).svg; }
function doctor(x, y, s, face, t, extra) { return PERSON.front(Object.assign({ x: x, y: y, s: s, outfit: DOC, breath: .5 + .5 * Math.sin(t * 1.5 + 1), head: { tilt: -3 * Math.sin(t * .8) }, face: Object.assign({ eyes: blink(t, 2) }, face || {}) }, extra || {})).svg; }
// a group of sperm swimming along the route, from k0 to k1 (0 = vagina, 1 = the egg); stop: where they can't pass (0..1)
function swarm(n, k, t, o) {
  o = o || {}; var s = "";
  for (var i = 0; i < n; i++) {
    var kk = k - i * .045 - hash(i + 2) * .03; if (o.stop != null) kk = Math.min(kk, o.stop - hash(i + 7) * .05); if (kk <= 0) continue;
    var p = IU.routeAt(kk), off = (hash(i + 11) - .5) * (o.spread || 26), bob = 3 * Math.sin(t * 3 + i);
    s += IU.sperm(p[0] + Math.cos(p[2] + 1.57) * off, p[1] + Math.sin(p[2] + 1.57) * off + bob, p[2] + .25 * Math.sin(t * 2 + i), 1, i, { slow: o.slow == null ? 1 : o.slow, dead: o.dead && hash(i + 30) < o.dead ? 1 : 0 });
  }
  return s;
}
function routeLine(k, col) { return '<path d="' + IU.routeD(k) + '" stroke="' + (col || ORANGE) + '" stroke-width="3" stroke-dasharray="8 7" fill="none"/>'; }
function eggAt(k) { return IU.egg(IU.EGG[0], IU.EGG[1], 13, k); }

// 4 · «اللولب نوعين: نحاسي، وهرموني.» — the two real devices side by side (copper on the right: it is read first)
shot(4, still(320, 360, 1), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), IU.device(450, 160, 1.15, "copper", { glow: .4 })) + appear(at(u, .3, .5), IU.device(190, 160, 1.15, "hormonal"));
});
shot([4, 1], still(320, 360, 1), function (u, d, t) {
  return paper() + IU.device(450, 160, 1.15, "copper", { glow: .6 }) + IU.device(190, 160, 1.15, "hormonal") + chip("نحاسي", 450, 110, ORANGE, at(u, 0, .3)) + chip("هرموني", 190, 110, OLIVE, at(u, .5, .3));
});
// 5 · a small rule first: the uterus draws itself in
shot(5, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + appear(at(u, 0, 1.2), U1({})); });
shot([5, 2], still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({}) + tag("قاعدة", 320, 90, at(u, 0, .3), 26, ORANGE); });
// 6 · the path: sperm come up through the cervix, across the uterus, into the tube to meet the egg
shot(6, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: swarm(6, .05 + .1 * at(u, 0, d), t) }); });
shot([6, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ hl: "cervix", over: routeLine(.35 * at(u, 0, d)) + swarm(6, .17 + .18 * at(u, 0, d), t) }) + label(306, 500, 160, 470, "عنق الرحم", BLUE, at(u, .1, .5), 22);
});
shot([6, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ hl: "cavity", over: routeLine(.35 + .3 * at(u, 0, d)) + swarm(6, .38 + .3 * at(u, 0, d), t) }) + label(400, 280, 560, 330, "الرحم", BLUE, at(u, .1, .5), 22);
});
shot([6, 3], fly(U, TUBE, 1.8), function (u, d, t) {
  return paper() + U1({ over: routeLine(.65 + .3 * at(u, 0, d)) + swarm(6, .68 + .28 * at(u, 0, d), t) + eggAt(at(u, .3, .6)) });
});
shot([6, 4], still(TUBE[0], TUBE[1], TUBE[2]), function (u, d, t) {
  return paper() + U1({ hl: "tube", over: routeLine(.97) + swarm(6, .97, t, { spread: 14 }) + eggAt(1) }) + label(74, 194, 150, 120, "البويضة", OLIVE, at(u, 0, .5), 15) + label(170, 208, 200, 290, "قناة فالوب", OLIVE, at(u, .4, .5), 15);
});
// 7 · if it doesn't get there — no pregnancy
shot(7, fly(TUBE, U, 1.6), function (u, d, t) {
  var p = L2P([0, 330]); return paper() + U1({ over: routeLine(1, "#9a9086") + eggAt(1) }) + cross(p[0], p[1], .9, at(u, .6, .5));
});
shot([7, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  var p = L2P([0, 330]); return paper() + U1({ over: routeLine(1, "#9a9086") + eggAt(1) }) + cross(p[0], p[1], .9, 1) + chip("مفيش حمل", 320, 90, ORANGE, at(u, 0, .3), 26);
});
// 8 · the copper one: its wire gives off copper ions, toxic to sperm
shot(8, still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.2); return paper() + U1({ over: '<g transform="translate(0 ' + f(260 * (1 - k)) + ')" opacity="' + f(k) + '">' + IU.inUterus("copper") + '</g>' }) + chip("نحاسي", 320, 90, ORANGE, at(u, .3, .3), 24);
});
shot([8, 1], fly(U, COIL, 1.8), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, at(u, .4, 1), t), over: IU.inUterus("copper", { glow: at(u, .3, 1) }) }) + G("", label(326, 330, 360, 410, "أيونات نحاس", ORANGE, at(u, 1.6, .5), 12), 1);
});
shot([8, 2], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .45 + .1 * at(u, 0, d), t, { spread: 50 }), over: IU.inUterus("copper", { glow: 1 }) }) + label(326, 330, 360, 410, "أيونات نحاس", ORANGE, 1, 12) + chip("سامة", 250, 430, ORANGE, at(u, .4, .3), 14);
});
// 9 · they slow down… and die before they get there
shot(9, still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .55 + .02 * at(u, 0, d), t, { spread: 50, slow: 1 - .8 * at(u, 0, d) }), over: IU.inUterus("copper", { glow: 1 }) });
});
shot([9, 1], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .57, t, { spread: 50, slow: .2, dead: at(u, .1, .6) * 1.01 }), over: IU.inUterus("copper", { glow: 1 }) }) + cross(250, 330, .5, at(u, .7, .4));
});
// 10 · the uterus takes it for a foreign body and sends white blood cells that attack any sperm that comes in
var WB = [[-70, 70], [60, 60], [-40, 150], [40, 160], [-90, 40], [90, 40], [0, 220]];
function cells(k, t, toward) { var s = ""; WB.forEach(function (p, i) { var kk = clamp(k * 1.6 - i * .1), x = p[0] * (1.5 - .5 * kk), y = p[1]; if (toward) { x = lerp(x, toward[i % toward.length][0], toward.k * .55); y = lerp(y, toward[i % toward.length][1], toward.k * .55); } s += IU.wbc(x + 3 * Math.sin(t * 1.2 + i), y + 3 * Math.cos(t + i), 15, i, kk); }); return s; }
shot(10, fly(COIL, MID, 1.8), function (u, d, t) { return paper() + U1({ hl: "cavity", over: IU.inUterus("copper", { glow: .5 }) }); });
shot([10, 1], still(MID[0], MID[1], MID[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper", { glow: .5 }) }) + tag("جسم غريب", 320, 170, at(u, 0, .3), 18, INK) + arrow(320, 190, 320, 230, INK, 3, at(u, .2, .3)); });
shot([10, 2], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  return paper() + U1({ inner: cells(at(u, 0, d), t), over: IU.inUterus("copper", { glow: .5 }) }) + label(250, 270, 150, 210, "كرات دم بيضا", BLUE, at(u, .4, .5), 16);
});
shot([10, 3], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  var tw = [[-30, 120], [30, 150], [-10, 180]]; tw.k = at(u, 0, d);
  var sp = IU.sperm(-30, 120, 1.2, 1, 1, { dead: tw.k > .7 ? 1 : 0 }) + IU.sperm(30, 150, 2, 1, 2, { dead: tw.k > .8 ? 1 : 0 }) + IU.sperm(-10, 180, 1.6, 1, 3, { dead: tw.k > .9 ? 1 : 0 });
  return paper() + U1({ inner: sp + cells(1, t, tw), over: IU.inUterus("copper", { glow: .5 }) }) + label(250, 270, 150, 210, "كرات دم بيضا", BLUE, 1, 16);
});
// 11 · like a building's doorman: any stranger is turned back at the door
function guard(t, k) {
  return PERSON.front({ x: 300, y: 430, s: .9, outfit: { base: "casual", hat: "cap", colors: { shirt: "#4a6f8a", shirtD: "#38566c", pants: "#3c3f47", pantsD: "#2c2e35", hat: "#2f3c4c" } }, breath: .5 + .5 * Math.sin(t * 1.6),
    arms: [{ rel: [-40, 60], hand: "relaxed" }, { rel: [lerp(30, 140, k), lerp(70, -30, k)], straight: k > .5, hand: "open", palm: true, rot: -90 * k }], head: { turn: .3 * k }, face: { brows: k > .5 ? "angry" : "neutral", mouth: k > .5 ? "open" : "neutral", eyes: blink(t), look: [k, 0] } }).svg;
}
function stranger(x, t, back) { return IU.sperm(x, 470 + 6 * Math.sin(t * 3), back ? 0 : Math.PI, 4.2, 0) ; }
shot(11, still(320, 393, 1), function (u, d, t) {
  return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, 0) + tag("البواب", 300, 150, at(u, .2, .3), 22, OLIVE);
});
shot([11, 1], still(320, 393, 1), function (u, d, t) {
  var k = at(u, 0, d); return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, at(u, .1, .5)) + stranger(lerp(700, 560, k), t, false) + tag("البواب", 300, 150, 1, 22, OLIVE);
});
shot([11, 2], still(320, 393, 1), function (u, d, t) {
  var k = at(u, 0, d); return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, 1) + stranger(lerp(560, 720, k), t, true) + arrow(520, 400, 620, 400, ORANGE, 5, at(u, .1, .4)) + cross(470, 300, .8, at(u, .2, .4)) + tag("البواب", 300, 150, 1, 22, OLIVE);
});
// 12 · the hormonal one releases a hormone, levonorgestrel, in tiny amounts
shot(12, still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.1); return paper() + U1({ over: '<g transform="translate(0 ' + f(260 * (1 - k)) + ')" opacity="' + f(k) + '">' + IU.inUterus("hormonal") + '</g>' }) + chip("هرموني", 320, 90, OLIVE, at(u, .3, .3), 24);
});
shot([12, 1], fly(U, COIL, 1.8), function (u, d, t) { return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, at(u, .3, 1), t), over: IU.inUterus("hormonal", { glow: at(u, .2, 1) }) }); });
shot([12, 2], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) }) + label(314, 330, 296, 420, "ليفونورجيستريل", OLIVE, at(u, 0, .5), 12);
});
shot([12, 3], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) }) + label(314, 330, 296, 420, "ليفونورجيستريل", OLIVE, 1, 12) + chip("كميات صغيرة جدًا", 320, 450, OLIVE, at(u, 0, .3), 11);
});
// 13 · the hormone makes the cervical mucus thick like jelly, so sperm can't get through
shot(13, fly(COIL, CERV, 1.8), function (u, d, t) { return paper() + U1({ mucus: .15, over: IU.inUterus("hormonal") }); });
shot([13, 1], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: .15 + .85 * at(u, 0, d), hl: "cervix", over: IU.inUterus("hormonal") }) + label(314, 520, 290, 440, "إفرازات عنق الرحم", BLUE, at(u, .2, .5), 10);
});
shot([13, 2], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, over: IU.inUterus("hormonal") }) + label(314, 520, 290, 440, "إفرازات عنق الرحم", BLUE, 1, 10) + iconBox(400, 560, 70, IU.jelly(0, 6, .5, t), at(u, 0, .3));
});
shot([13, 3], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, over: IU.inUterus("hormonal") + swarm(5, .22, t, { stop: .245, spread: 18, slow: .7 }) }) + iconBox(400, 560, 70, IU.jelly(0, 6, .5, t), 1) + cross(320, 552, .35, at(u, .4, .4));
});
// 14 · and keeps the lining thin, so periods get lighter
shot(14, fly(CERV, MID, 1.8), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 24 - 16 * at(u, .6, d), hl: "endo", over: IU.inUterus("hormonal") }) + label(206, 240, 120, 180, "بطانة الرحم", OLIVE, at(u, .4, .5), 16);
});
shot([14, 1], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 8, over: IU.inUterus("hormonal") }) + label(206, 240, 120, 180, "بطانة الرحم", OLIVE, 1, 16) + chip("الدورة بتخف", 320, 470, OLIVE, at(u, 0, .3), 16) +
    G("translate(450 190)", IU.drop(0, 0, .55 + .25 * (1 - at(u, .2, 1)), "#b8463a"), at(u, 0, .3));
});
// 15 · both work more than 99 %
shot(15, still(320, 393, 1), function (u, d, t) {
  return paper() + IU.device(470, 260, .9, "copper") + IU.device(170, 260, .9, "hormonal") + G("", N("+" + count(99, at(u, .2, 1.6)) + "%", 320, 610, 92, ORANGE), at(u, .1, .3)) + T("كفاءة", 320, 680, 28, INK, 800);
});
// 16 · copper lasts up to 10 years, hormonal 3 to 8 depending on the type
shot(16, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 200, .9, "copper", { glow: .5 }) + IU.device(170, 200, .9, "hormonal") + G("", IU.calendar(470, 630, 1.5, "10 سنين"), at(u, .3, .4)); });
shot([16, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + IU.device(470, 200, .9, "copper") + IU.device(170, 200, .9, "hormonal", { glow: .5 }) + IU.calendar(470, 630, 1.5, "10 سنين") + G("", IU.calendar(170, 630, 1.5, "3–8 سنين", OLIVE), at(u, 0, .4));
});
// 17 · what to do after it's fitted: after every period, check the thread is there
shot(17, still(320, 393, 1), function (u, d, t) { return paper() + woman(320, 480, 1.05, { mouth: "neutral", brows: "raised", look: [.5, -.4] }, t) + G("", T("؟", 500, 220, 120, ORANGE, 800), at(u, .3, .3)); });
shot([17, 2], still(320, 393, 1), function (u, d, t) { return paper() + woman(260, 480, 1.05, { mouth: "smile" }, t) + G("", IU.calendar(500, 220, 1.5, "بعد الدورة"), at(u, 0, .35)); });
var THR = [320, 610, 2.2];
shot([17, 3], still(THR[0], THR[1], THR[2]), function (u, d, t) {
  var p = L2P([-4, 440]); return paper() + U1({ over: IU.inUterus("copper") }) + label(p[0] - 4, p[1], 250, 560, "الخيط", ORANGE, at(u, .1, .5), 12) + check(380, 580, .5, at(u, .6, .4));
});
// 18 · see the doctor after the first period to check where it sits
shot(18, still(320, 393, 1), function (u, d, t) { return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t); });
shot([18, 1], still(320, 393, 1), function (u, d, t) { return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t) + G("", IU.calendar(320, 120, 1.3, "أول دورة"), at(u, 0, .35)); });
shot([18, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t) + inset(320, 130, 95, IU.uterus(0, -60, .34, { tubes: false, over: IU.inUterus("copper") }), at(u, 0, .3)) + check(400, 200, .7, at(u, .5, .4));
});
// 19 · warning signs: bad pain, fever, strange discharge, the thread gone → go straight away
var SIG = [[470, 150, "وجع جامد"], [170, 150, "سخونية"], [470, 400, "إفرازات غريبة"], [170, 400, "الخيط اختفى"]];
function sign(i, k, t) {
  var x = SIG[i][0], y = SIG[i][1], ic = [IU.bolt(0, 0, 1.1), IU.thermometer(0, 0, .9, .85 + .1 * Math.sin(t * 3)), IU.drop(0, 0, 1, "#b6b06a"), IU.ln([[-6, -50], [-10, -10], [-4, 30]], "#3a2a22", 3) + '<text x="22" y="10" style="font:800 56px Noto Sans Arabic" fill="' + ORANGE + '" text-anchor="middle">؟</text>'][i];
  return G("", iconBox(x, y, 150, ic, k) + G("", T(SIG[i][2], x, y + 110, 22, INK, 800), k), 1);
}
function signs(n, kl, t) { var s = ""; for (var i = 0; i < n; i++) s += sign(i, i === n - 1 ? kl : 1, t); return s; }
shot(19, still(320, 393, 1), function (u, d, t) { return paper() + signs(1, at(u, 0, .3), t); });
shot([19, 1], still(320, 393, 1), function (u, d, t) { return paper() + signs(2, at(u, 0, .3), t); });
shot([19, 2], still(320, 393, 1), function (u, d, t) { return paper() + signs(3, at(u, 0, .3), t); });
shot([19, 3], still(320, 393, 1), function (u, d, t) { return paper() + signs(4, at(u, 0, .3), t); });
shot([19, 4], still(320, 393, 1), function (u, d, t) { return paper() + signs(4, 1, t) + chip("روحي على طول", 320, 690, ORANGE, at(u, 0, .3), 26); });
// 20 · it doesn't protect against sexually transmitted infections
shot(20, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 220, 1, "copper") + G("", IU.shield(480, 560, 1.6), at(u, .2, .4)); });
shot([20, 1], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 220, 1, "copper") + IU.shield(480, 560, 1.6) + cross(480, 560, 1.2, at(u, .1, .5)) + chip("مبيحميش", 200, 640, ORANGE, at(u, .3, .3), 24); });
// 21 · many think the IUD causes abortion. No.
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + woman(220, 480, 1.05, { mouth: "frown", brows: "worried", look: [.5, -.2] }, t) + chip("إجهاض؟", 470, 200, INK, at(u, .6, .3), 26); });
shot([21, 2], still(320, 393, 1), function (u, d, t) { return paper() + woman(220, 480, 1.05, { mouth: "smile", brows: "raised" }, t) + chip("إجهاض؟", 470, 200, INK, 1, 26) + cross(470, 200, 1, at(u, 0, .4)); });
// 22 · it stops fertilisation itself; when it's taken out, fertility comes back fast
shot(22, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper") + eggAt(1) }) + label(74, 194, 120, 110, "البويضة لوحدها", OLIVE, at(u, .2, .5), 15) + chip("مفيش تلقيح", 400, 90, OLIVE, at(u, .6, .3), 20); });
shot([22, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.2); return paper() + U1({ over: '<g transform="translate(0 ' + f(420 * k) + ')" opacity="' + f(1 - k * .9) + '">' + IU.inUterus("copper") + '</g>' + eggAt(1) }) + arrow(470, 380, 470, 560, ORANGE, 5, at(u, .1, .5));
});
shot([22, 3], still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: eggAt(1) + swarm(5, .7 + .25 * at(u, 0, d), t) }) + chip("الخصوبة بترجع", 400, 90, BLUE, at(u, 0, .3), 20) + check(560, 90, .6, at(u, .4, .4)); });
// 23 · bottom line: copper poisons the sperm, hormonal closes the road, both stop fertilisation
shot(23, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper") + eggAt(1) }); });
shot([23, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 22, 110, 1, t) + swarm(4, .5, t, { dead: 1.01, spread: 60 }), over: IU.inUterus("copper", { glow: 1 }) + eggAt(1) }) + callout("1", 410, 260, at(u, 0, .3), 18);
});
shot([23, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 10, inner: IU.hormone(0, 120, 18, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) + swarm(4, .22, t, { stop: .245, spread: 18, slow: .6 }) + eggAt(1) }) + callout("1", 410, 260, 1, 18) + callout("2", 380, 520, at(u, 0, .3), 18);
});
shot([23, 3], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 10, over: IU.inUterus("hormonal") + eggAt(1) }) + callout("1", 410, 260, 1, 18) + callout("2", 380, 520, 1, 18) + callout("3", 130, 140, at(u, 0, .3), 18) + chip("مفيش تلقيح", 400, 90, OLIVE, at(u, .3, .3), 20);
});
// 24 · the oddest: a copper IUD fitted within 5 days after sex is the strongest emergency contraception
shot(24, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 170, 1.05, "copper", { glow: .5 + .3 * Math.sin(t * 2) }); });
shot([24, 1], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 170, .95, "copper", { glow: .5 }) + G("", IU.calendar(190, 260, 2, "5 أيام"), at(u, 0, .4)); });
shot([24, 3], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 170, .95, "copper", { glow: .5 }) + IU.calendar(190, 260, 2, "5 أيام") + tag("طوارئ", 320, 640, at(u, 0, .3), 34, ORANGE) + check(470, 640, .8, at(u, .6, .4)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the copper T beside a fingertip, about 3 cm. line 1: placed in the uterus. line 2: the cavity stays open round it
  var k1 = li >= 1 ? ease((t - LN[1].start) / .6) : 0, s = "";
  if (li === 0) s += IU.device(380, 200, .9, "copper", { thread: 120 }) + IU.finger(170, 330, 1.3) + measure(470, 200 + 4, 470, 200 + 190 * .9, ease((t - .8) / .8), "") + G("", T("3 سم", 540, 300, 26, ORANGE, 800), ease((t - 1.6) / .3));
  else {
    s += IU.uterus(304, 170, .82, { over: IU.inUterus("copper") + (li >= 2 ? '<path d="M0 420 L0 250 L-60 110 L-150 20" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" fill="none"/>' + IU.sperm(-70, 90, -2, 1.3, 0) : "") });
    if (li >= 2) s += G("", T("؟", 520, 110, 110, ORANGE, 800), ease((t - LN[2].start - .3) / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) { return IU.device(90, 40, .55, "copper", { thread: 40, glow: .5 + .5 * Math.sin(t * 3) }); };
SCENE.outro = function (svg, u, t) {
  return IU.uterus(300, 40, .5, { mucus: 1, endo: 12, tubes: true, inner: IU.ions(0, 130, 16, 100, 1, t) + IU.wbc(-60, 90, 14, 1, 1), over: IU.inUterus("copper") }) +
    callout("1", 330, 95, ease(u / .3)) + callout("2", 250, 85, ease(u / .3 - .5)) + callout("3", 335, 200, ease(u / .3 - 1)) + callout("4", 230, 40, ease(u / .3 - 1.5));
};
