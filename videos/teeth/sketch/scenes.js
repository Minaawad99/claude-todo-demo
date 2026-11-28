window.CHUNKS = [[0.0, 0.5161], [0.0, 0.2045, 0.5], [0.0, 0.3167, 0.6], [0.0, 0.4194], [0.0, 0.2167, 0.4333, 0.8], [0.0, 0.2459, 0.4098, 0.6393], [0.0, 0.4359, 0.6923], [0.0, 0.4167, 0.7917], [0.0, 0.16, 0.36, 0.4933, 0.8], [0.0, 0.4419, 0.8605], [0.0, 0.4872, 0.7692], [0.0, 0.4706], [0.0, 0.4474, 0.6316], [0.0, 0.44], [0.0, 0.2632, 0.5263, 0.807], [0.0, 0.3333, 0.549, 0.8039], [0.0, 0.2535, 0.4507, 0.6338, 0.8169], [0.0, 0.2923, 0.4615, 0.7231], [0.0, 0.1972, 0.5775, 0.7887], [0.0, 0.375, 0.6607], [0.0, 0.3269, 0.7308], [0.0, 0.2258, 0.5323, 0.8387], [0.0, 0.1212, 0.3636, 0.4949, 0.6465, 0.8586], [0.0, 0.1778, 0.3667, 0.5333, 0.7333], [0.0, 0.2055, 0.4521, 0.6164, 0.7534], [0.0, 0.2143, 0.4762, 0.6905, 0.8571], [0.0], [0.0, 0.6304]];
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

// ── «ليه سنانك بتصفر وإنت بتغسلها؟» — shots. Drawings in draw.js (TH.*), the person in people.js (shared person kit).
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (~1.8 s) onto the part being talked
// about and later back out. The life is in the drawing: the person breathes and blinks, acid bubbles rise, fluoride settles.
var MX = 300, MY = 470, MS = 1.15;                                     // the cut molar in its jaw
var WIDE = [320, 430, 1.0], CROWN = [330, 320, 1.4], NECK = [215, 455, 2.1], NECKW = [250, 430, 1.45];
var BATH = [320, 370, 1.2];
function mol(o) { return TH.molar(MX, MY, MS, o || {}); }
function chipT(x, y, txt, col, side, k, sz) { k = clamp(k == null ? 1 : k); return k > 0 ? G("", TH.tag(x, y, txt, col, side, sz), k) : ""; }
function q(x, y, k, sz) { return G("", T("؟", x, y, sz || 120, ORANGE, 800), clamp(k)); }
// the bathroom: we look at him from the mirror (o: brusher options)
function bath(t, o) {
  var g = '<rect x="-400" y="-400" width="1440" height="1600" fill="#e6e0d0"/>';
  for (var i = -6; i < 20; i++) g += '<path d="M' + (i * 64) + ' -400 V1200" stroke="#d3cbb6" stroke-width="2"/>';
  for (var j = -6; j < 20; j++) g += '<path d="M-400 ' + (j * 64) + ' H1040" stroke="#d3cbb6" stroke-width="2"/>';
  g += '<clipPath id="mir' + (++CLIPN) + '"><rect x="70" y="50" width="500" height="560"/></clipPath>' + TH.mirror(70, 50, 500, 560);
  g += '<g clip-path="url(#mir' + CLIPN + ')">' + PEOPLE.brusher(320, 900, 1.5, t, o || {}) + '</g>';
  g += '<rect x="58" y="38" width="524" height="584" fill="none" stroke="#8a7a5c" stroke-width="14"/><rect x="58" y="38" width="524" height="584" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  return g + TH.sink(320, 660, 460);
}
bath(0, {}); var MOUTH = [PEOPLE_MOUTH[0], PEOPLE_MOUTH[1]];
function mouthCam(z) { return [MOUTH[0], MOUTH[1] + 20, z || 2.4]; }
function num(n, k) { return numBox(n, 560, 90, k, 46, true); }
function lyr(u, a) { return LN[a].end - LN[a].start; }

// 4 · «قبل ما نشرح… السنة ليها طبقتين… خليك فاكرهم»
shot(4, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + appear(at(u, 0, .8), mol()); }, { tr: "fade" });
shot([4, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + callout("1", 196, 232, at(u, .1, .3), 18) + callout("2", 330, 290, at(u, .5, .3), 18); });
shot([4, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + callout("1", 196, 232, 1, 18) + callout("2", 330, 290, 1, 18) + tag("قاعدة", 540, 110, at(u, .1, .3), 24, ORANGE); });
// 5 · outside: white, half see-through, the enamel — the hardest thing in your body
shot(5, fly(WIDE, CROWN, 1.8), function (u, d, t) { return paper() + mol() + sweep(150, 180, 330, 260, at(u, .4, 1.2), 1, '<g opacity=".35">' + mol() + '</g>'); });
shot([5, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) {   // half see-through: the yellow behind it glows through a little
  return paper() + mol() + inset(470, 200, 62, TH.tooth(0, 60, .45, { uncut: true, yellow: .25 + .08 * Math.sin(t * 2) }), at(u, .1, .3));
});
shot([5, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + chipT(402, 232, "المينا", BLUE, 1, at(u, .1, .4), 17); });
shot([5, 3], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + chipT(402, 232, "المينا", BLUE, 1, 1, 17) + tag("أقوى من العضم", 330, 450, at(u, .2, .3), 22, ORANGE); });
// 6 · and under it, yellow by nature: the dentin
shot(6, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + '<circle cx="300" cy="300" r="' + f(70 * at(u, .1, .8) + 6 * Math.sin(t * 3)) + '" fill="#e9b949" opacity=".22"/>' + chipT(402, 232, "المينا", BLUE, 1, 1, 17); });
shot([6, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + '<circle cx="300" cy="300" r="' + f(60 + 6 * Math.sin(t * 3)) + '" fill="#e9b949" opacity=".22"/>' + chipT(300, 300, "العاج", OLIVE, 1, at(u, .1, .4), 17) + chipT(402, 232, "المينا", BLUE, 1, 1, 17); });
// 7 · so the thinner the enamel, the more of the yellow under it shows
shot(7, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { var k = at(u, .2, 1.4); return paper() + mol({ en: 1 - .7 * k }) + chipT(300, 300, "العاج", OLIVE, 1, 1, 17); });
shot([7, 1], fly(CROWN, WIDE, 1.8), function (u, d, t) { return paper() + mol({ en: .3 }) + inset(520, 270, 92, TH.tooth(0, 80, .5, { uncut: true, yellow: .15 + .7 * at(u, .3, 1.4) }), at(u, .1, .3)); });
shot([7, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .3 }) + inset(520, 270, 92, TH.tooth(0, 80, .5, { uncut: true, yellow: .85 + .03 * Math.sin(t * 3) }), 1) + arrow(430, 270, 400, 270, ORANGE, 4, at(u, .1, .4)); });
// 8 · «طب إيه اللي بيرقّق المينا؟» — first mistake: brushing straight after something sour
shot(8, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .3 }) + q(520, 240, at(u, .3, .3)); });
shot([8, 2], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin" } }) + num("1", at(u, .1, .3)); });
shot([8, 4], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, {}) + num("1", 1) + iconBox(130, 140, 150, TH.glassOJ(0, 60, .75, .7), at(u, 0, .3)); });
// 9 · a glass of orange juice softens the enamel's surface for a while
shot(9, fly(WIDE, CROWN, 1.8), function (u, d, t) { var k = at(u, .3, 1.6); return paper() + mol({ soft: k }) + '<g transform="rotate(' + f(-35 * at(u, 0, .8)) + ' 480 260)">' + TH.glassOJ(480, 280, .7, .7 - .3 * k) + '</g>'; });
shot([9, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + chipT(402, 232, "طري", ORANGE, 1, at(u, .2, .4), 17); });
shot([9, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + chipT(402, 232, "طري", ORANGE, 1, 1, 17) + watchSmall(t, at(u, .1, .3)); });
function watchSmall(t, k) { return iconBox(150, 160, 120, TH.watch(0, 6, 40, t, ""), k); }
// 10 · scrub it then and you scrape it off while it's soft
function scrubBrush(t, x, y) { var b = 34 * Math.sin(t * 12); return TH.brush(x + b, y, 0, 1.05, { paste: true }); }
function chips(t, n, x, y) { var s = ""; for (var i = 0; i < (n || 12); i++) { var u = (t * 1.1 + hash(i)) % 1; s += '<rect x="' + f(x + (hash(i + 3) - .5) * 160 + (hash(i + 5) - .5) * 160 * u) + '" y="' + f(y - 40 * u + 220 * u * u) + '" width="5" height="5" fill="#f7f3ea" stroke="' + ORANGE + '" stroke-width="1" opacity="' + f(1 - u) + '"/>'; } return s; }
shot(10, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + scrubBrush(t, 290, 160); });
shot([10, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 - .4 * at(u, 0, d), en: 1 - .35 * at(u, 0, d) }) + scrubBrush(t, 290, 160) + chips(t, 14, 300, 200); });
shot([10, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: .6, en: .65 }) + scrubBrush(t, 290, 160) + chips(t, 14, 300, 200) + chipT(402, 232, "وهي طرية", ORANGE, 1, at(u, .1, .4), 17); });
// 11 · like wiping a wall whose paint is still wet
shot(11, still(320, 393, 1), function (u, d, t) { return paper() + TH.wetWall(110, 170, at(u, .2, d + .2), t); });
// 12 · the right way: rinse with water, and wait half an hour to an hour
shot(12, still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, at(u, .1, .4), OLIVE) + TH.cup(220, 560, 2.2, .55 + .02 * Math.sin(t * 3)) + tag("اشطف بمية", 220, 650, at(u, .3, .3), 24, BLUE); });
shot([12, 1], still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, 1, OLIVE) + TH.watch(320, 380, 150, t * 2.2, "") ; });
shot([12, 2], still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, 1, OLIVE) + TH.watch(320, 380, 150, t * 2.2, "") + bigNum("30–60", "دقيقة", 320, 650, at(u, .1, .4), ORANGE, 64); });
// 13 · second mistake: scrubbing hard
shot(13, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { scrub: 1, face: { mouth: "grin", brows: "angry" } }) + num("2", at(u, .1, .3)); });
shot([13, 1], fly(BATH, mouthCam(2.0), 1.8), function (u, d, t) { return paper() + bath(t, { scrub: 1, face: { mouth: "grin", brows: "angry" } }) + num("2", 1); });
// 14 · like sandpaper on a painted door: the harder you press, the more you take off
shot(14, still(320, 393, 1), function (u, d, t) { return paper() + TH.sandDoor(170, 110, t, .15); });
shot([14, 2], still(320, 393, 1), function (u, d, t) { return paper() + TH.sandDoor(170, 110, t * 1.6, .15 + .7 * at(u, 0, d)) + arrow(560, 300, 560, 470, ORANGE, 6, at(u, .1, .4)) + T("ضغط", 560, 280, 24, ORANGE, 800); });
// 15 · it eats the enamel at the gum line, and the gum itself pulls down
shot(15, fly(WIDE, NECKW, 1.8), function (u, d, t) { return paper() + mol({ wear: at(u, .4, 1.6) }); });
shot([15, 1], still(NECKW[0], NECKW[1], NECKW[2]), function (u, d, t) { return paper() + mol({ wear: 1 }) + tag("عند اللثة", 150, 330, at(u, .1, .3), 20, ORANGE) + arrow(160, 350, 190, 425, ORANGE, 3, at(u, .3, .4)); });
shot([15, 2], still(NECKW[0], NECKW[1], NECKW[2]), function (u, d, t) { return paper() + mol({ wear: 1, rec: at(u, .1, d) }) + arrow(150, 410, 150, 470, ORANGE, 4, at(u, .2, .4)); });
// 16 · the right way: a soft brush, tilted 45° to the gum, small strokes, for two minutes
function at45(t, k) { var j = 3 * Math.sin(t * 10); return TH.brushEnd(MX - 104 * MS + j, MY - 22 * MS + j, 45, 1.25); }
shot(16, fly(NECKW, NECK, 1.8), function (u, d, t) { return paper() + mol() + check(110, 300, .55, at(u, .2, .4), OLIVE) + G("", at45(t), at(u, .1, .3)); });
shot([16, 1], still(NECK[0], NECK[1], NECK[2]), function (u, d, t) { return paper() + mol() + at45(t) + draw("M150 380 A60 60 0 0 1 195 365", at(u, .1, .5), ORANGE, 2.5) + G("", N("45°", 150, 350, 26, ORANGE), at(u, .4, .3)); });
shot([16, 3], still(NECK[0], NECK[1], NECK[2]), function (u, d, t) { return paper() + mol() + at45(t * 1.6) + G("", N("45°", 150, 350, 26, ORANGE), 1) + wave(150, 440, 200, 440, t, BLUE, 4, 14, at(u, .1, .4), 2); });
shot([16, 4], fly(NECK, WIDE, 1.8), function (u, d, t) { return paper() + mol() + at45(t) + iconBox(520, 130, 150, TH.watch(0, 0, 50, t, "دقيقتين"), at(u, .3, .3)); });
// 17 · but there's a third mistake most people make every day… and nobody told them
shot(17, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, {}) + num("3", at(u, .1, .3)) + q(560, 260, at(u, .3, .3), 80); });
shot([17, 2], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin" } }) + num("3", 1) + q(560, 260, 1, 80) + tag("كل يوم", 140, 120, at(u, .1, .3), 22, ORANGE); });
shot([17, 3], fly(BATH, mouthCam(1.7), 1.8), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin", brows: "raised" } }) + num("3", 1); });
// 18 · the bio line: the link pill
shot(18, still(320, 393, 1), function (u, d, t) {
  var k = at(u, .3, .4); return paper() + dim(.6, bath(t, { face: { mouth: "grin", brows: "raised" } })) +
    G('translate(320 ' + f(190 - (1 - k) * 12) + ')', '<rect x="-150" y="-34" width="300" height="68" rx="34" fill="#f2c94c" stroke="' + INK + '" stroke-width="2.4"/>' + T("اللينك في البايو ↑", 0, 11, 30, "#1a1a1a", 900), k);
});
// 19 · back to it: rinsing with water straight after brushing
shot(19, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { cup: true, face: { mouth: "o", eyes: .6 } }) + num("3", at(u, .1, .3)); });
shot([19, 1], fly(BATH, mouthCam(1.8), 1.8), function (u, d, t) { return paper() + bath(t, { cup: true, face: { mouth: "o", eyes: .6 } }) + num("3", 1); });
// 20 · «طب وإيه المشكلة؟» — the paste has fluoride; it makes the enamel stronger
shot(20, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + q(520, 240, at(u, .2, .3)); });
shot([20, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ fl: at(u, .3, 1.4) }) + TH.tube(360, 110, -12, .9); });
shot([20, 2], fly(WIDE, CROWN, 1.8), function (u, d, t) { return paper() + mol({ fl: 1 }) + chipT(402, 232, "بيقوّي المينا", OLIVE, 1, at(u, .6, .4), 15); });
// 21 · the water washes it off before it works. Right: spit the paste, don't rinse
function rinse(t, k) { var s = ""; for (var i = 0; i < 18; i++) { var v = (t * .9 + hash(i)) % 1, x = 150 + hash(i + 2) * 300; s += '<path d="M' + f(x) + ' ' + f(130 + v * 320) + ' q-4 10 0 16 q4 -6 0 -16" fill="#8fb5cc" stroke="' + BLUE + '" stroke-width="1.2" opacity="' + f(k * (1 - v * .6)) + '"/>'; } return s; }
shot(21, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { var k = at(u, .2, d); return paper() + mol({ fl: 1, flOff: k }) + rinse(t, at(u, 0, .4)); });
shot([21, 2], fly(CROWN, WIDE, 1.8), function (u, d, t) { return paper() + mol({ fl: 1 }) + iconBox(140, 130, 150, TH.cup(0, 50, 1, .6), at(u, .1, .3)) + cross(140, 130, .9, at(u, .5, .5)); });
shot([21, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ fl: 1 }) + iconBox(140, 130, 150, TH.cup(0, 50, 1, .6), 1) + cross(140, 130, .9, 1) + tag("تُف بس", 520, 130, at(u, .1, .3), 22, BLUE) + check(520, 190, .6, at(u, .3, .4), OLIVE); });
// 22 · fourth mistake: home whitening tricks. Lemon dissolves the enamel; charcoal and baking soda can sand it
shot(22, still(320, 393, 1), function (u, d, t) { return paper() + numBox("4", 560, 90, at(u, .1, .3), 46, true) + TH.lemon(120, 420, 1.5) + G("", TH.charcoal(320, 450, 1.6), at(u, .4, .3)) + G("", TH.soda(510, 450, 1.5), at(u, .7, .3)); });
shot([22, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: at(u, .1, 1), en: 1 - .4 * at(u, .2, d) }) + TH.lemon(480, 200, .9); });
shot([22, 4], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ en: .55 }) + TH.charcoal(490, 220, .8) + scrubBrush(t, 290, 160) + chips(t, 12, 300, 200); });
// 23 · lots think yellowish teeth mean dirty ones. No: a healthy tooth doesn't have to be snow white
shot(23, still(320, 393, 1), function (u, d, t) { return paper() + TH.smile(320, 360, 1.4, .55 + .02 * Math.sin(t * 2)); });
shot([23, 2], still(320, 393, 1), function (u, d, t) { return paper() + TH.smile(320, 360, 1.4, .55) + tag("مش نضيفة؟", 320, 600, at(u, .1, .3), 28, INK); });
shot([23, 3], still(320, 393, 1), function (u, d, t) { return paper() + dim(.5, TH.smile(320, 300, 1.2, .55)) + tag("مش نضيفة؟", 320, 520, 1, 28, INK) + cross(320, 510, 1.1, at(u, .1, .5)); });
shot([23, 4], still(320, 393, 1), function (u, d, t) { return paper() + TH.shades(135, 400, 6, at(u, 0, 1.2)) + check(320, 600, 1, at(u, 1, .5), OLIVE) + tag("كلها سليمة", 320, 680, at(u, 1.3, .3), 24, OLIVE); });
// 24 · bottom line: wait after sour · soft brush · don't rinse · no home tricks
function recap(ks) {
  var cells = [[180, 250], [460, 250], [180, 560], [460, 560]], s = "";
  var art = [function () { return TH.watch(0, 0, 70, window.__t, ""); }, function () { return TH.brush(-100, 0, 0, .8, {}); },
    function () { return TH.cup(0, 60, 1.4, .6) + cross(0, 10, 1.1, 1); }, function () { return TH.lemon(0, 0, 1) + cross(0, 0, 1.1, 1); }];
  for (var i = 0; i < 4; i++) { var k = clamp(ks[i] || 0); if (k <= 0) continue; s += G("", G('translate(' + cells[i][0] + ' ' + cells[i][1] + ')', art[i]()), k) + callout(String(i + 1), cells[i][0] - 110, cells[i][1] - 110, k, 18); }
  return s;
}
function head24(k) { return tag("من الآخر", 320, 80, k, 26, ORANGE); }
shot(24, still(320, 393, 1), function (u, d, t) { return paper() + head24(at(u, .1, .3)); });
shot([24, 1], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([at(u, 0, .3)]); });
shot([24, 2], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, at(u, 0, .3)]); });
shot([24, 3], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, 1, at(u, 0, .3)]); });
shot([24, 4], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, 1, 1, at(u, 0, .3)]); });
// 25 · the oddest: enamel has not one living cell… so once it's gone, your body can't build it again
shot(25, still(320, 393, 1), function (u, d, t) { return paper() + inset(190, 360, 140, TH.crystals(0, 0, 150), at(u, .1, .3)) + tag("المينا", 190, 545, at(u, .3, .3), 24, BLUE) + G("", inset(460, 360, 120, TH.boneCells(0, 0, 130, t), 1) + tag("العضم", 460, 545, 1, 24, OLIVE), at(u, .8, .4)); });
shot([25, 1], still(320, 393, 1), function (u, d, t) { return paper() + inset(190, 360, 140, TH.crystals(0, 0, 150), 1) + tag("المينا", 190, 545, 1, 24, BLUE) + inset(460, 360, 120, TH.boneCells(0, 0, 130, t), 1) + tag("العضم", 460, 545, 1, 24, OLIVE) +
  T("مافيهاش خلايا", 190, 610, 26, ORANGE, 800) + cross(190, 360, 1.2, at(u, .3, .5)) + G("", T("خلايا حية", 460, 610, 26, OLIVE, 800), at(u, .9, .3)); });
shot([25, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: 1 - .75 * at(u, .2, 1.2) }); });
shot([25, 4], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .25 }) + tag("مابترجعش", 500, 260, at(u, .1, .3), 24, ORANGE) + arrow(470, 280, 420, 300, ORANGE, 4, at(u, .4, .4)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: brushing at the mirror. line 1: the teeth turning yellow (inset). line 2: «how» you brush, not how often
  var s = '<g transform="translate(-16 -20) scale(.98)">' + bath(t, { face: { mouth: li >= 1 ? "grin" : "grin", brows: li >= 1 ? "worried" : "neutral" } }) + '</g>';
  if (li >= 1) s += inset(470, 150, 110, TH.smile(0, 0, .55, clamp((t - LN[1].start) / 2.2) * .85), ease((t - LN[1].start) / .3));
  if (li >= 2) s += tag("2×", 120, 120, ease((t - LN[2].start) / .3), 34, INK) + cross(120, 110, .7, clamp((t - LN[2].start - 1.6) / .5)) + tag("إزاي؟", 120, 230, ease((t - LN[2].start - 2.4) / .3), 30, ORANGE);
  return s;
};
SCENE.bumper = function (u, t) {
  return '<g transform="translate(90 112) scale(.33)">' + TH.tooth(0, 0, 1, { uncut: true }) + '</g>' + TH.brush(118, 70, -35, .3, { paste: true });
};
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(180 -40) scale(.36)">' + TH.molar(300, 470, 1.15, { fl: 1 }) + '</g>' +
    callout("1", 228, 40, ease(u / .3)) + callout("2", 300, 92, ease(u / .3 - .5)) + callout("3", 372, 150, ease(u / .3 - 1)) + callout("4", 352, 26, ease(u / .3 - 1.5));
};
