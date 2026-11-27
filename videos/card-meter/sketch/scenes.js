window.CHUNKS = [[0.0, 0.4167], [0.0, 0.3333, 0.7292], [0.0], [0.0, 0.4194], [0.0, 0.697], [0.0, 0.2927, 0.6098], [0.0, 0.2619, 0.5714], [0.0, 0.2933, 0.5733, 0.8133], [0.0, 0.4318, 0.7045], [0.0, 0.5], [0.0, 0.2436, 0.3462, 0.5, 0.6923], [0.0, 0.2394, 0.5634, 0.7887], [0.0, 0.2745, 0.6275], [0.0, 0.4857, 0.8286], [0.0, 0.4286], [0.0, 0.2609, 0.6739], [0.0, 0.3137, 0.5098, 0.8431], [0.0, 0.2931, 0.4655, 0.7759], [0.0], [0.0, 0.2037, 0.4259, 0.6667], [0.0, 0.3, 0.5, 0.74], [0.0, 0.3043, 0.5217, 0.6377, 0.8261], [0.0, 0.4423, 0.8077], [0.0, 0.2241, 0.4828, 0.7931], [0.0, 0.32, 0.68, 0.94], [0.0, 0.3023, 0.5581], [0.0, 0.2143, 0.5, 0.8], [0.0, 0.1957, 0.3043, 0.4891, 0.6522, 0.7609, 0.8804], [0.0], [0.0, 0.6304]];
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

// ── «إزاي عداد الكارت بيشتغل؟» — shots. Drawings in draw.js (CM.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (eased, ~1.8 s) onto the part being
// talked about and later back out. The life between moves is in the drawing: current dots run, the red LED blinks, the
// LCD counts, the man breathes and blinks.
var MX = 320, MY = 360, MS = 1.15;                    // where the meter sits in the panel world
function mp(x, y) { return [MX + x * MS, MY + y * MS]; } // a point on the meter (meter units) → panel world
var WIDE = [320, 393, 1], LCDV = [320, 215, 2.1], LEDV = [mp(-60, -74)[0], mp(-60, -74)[1], 2.6], SLOT = [320, 400, 1.7];
var SHUNT = [mp(-34, 120)[0], mp(-34, 120)[1] - 20, 2.2], ICV = [mp(-82, -72)[0] + 30, mp(-82, -72)[1], 2.2], MCU = [mp(18, -72)[0], mp(18, -72)[1], 2.2], RELV = [mp(66, 110)[0], mp(66, 110)[1], 2.4], MEM = [mp(80, -84)[0], mp(80, -84)[1], 2.4];
function blink(t) { return Math.sin(t * 2.3) > .97 ? .05 : 1; }
function ledPulse(t, per) { per = per || .7; return ((t % per) / per) < .22 ? 1 : 0; }
function front(o) { return CM.meter(MX, MY, MS, o); }
function opened(o) { return CM.inside(MX, MY, MS, o); }
function chip(txt, x, y, col, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var w = txt.length * 13 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="-20" width="' + w + '" height="40" rx="8" fill="' + col + '"/>' + T(txt, 0, 8, 21, "#fbf8f1", 800)); }
function q(x, y, k, sz) { return G("", T("؟", x, y, sz || 140, ORANGE, 800), at(k, 0, .3)); }
// the man of the house (home clothes), front view, feet on floorY
function man(x, floorY, s, t, fc, arms, head) {
  var P1 = PERSON.front({ x: x, y: floorY - .52 * 400 * s, s: s, legs: "stand", outfit: "home", breath: (Math.sin(t * 1.7) + 1) / 2,
    head: Object.assign({ tilt: 2.5 * Math.sin(t * 1.1) }, head || {}), face: Object.assign({ eyes: blink(t) }, fc || {}), arms: arms });
  return P1.svg;
}
function shocked(x, floorY, s, t) { var sh = [x, floorY - .87 * 400 * s]; return man(x, floorY, s, t, { mouth: "o", eyes: 1.25, brows: "raised" }, [{ to: [sh[0] - 70 * s, sh[1] + 10 * s], hand: "open", bend: -1, palm: true }, { to: [sh[0] + 70 * s, sh[1] + 10 * s], hand: "open", bend: 1, palm: true }]); }
function roomMan(t, light, fc, arms, bal, warn) { return CM.room({ light: light, meterBal: bal, warn: warn }) + (fc === "shock" ? shocked(300, 700, 1.0, t) : man(300, 700, 1.0, t, fc, arms)) + CM.nightOver(1 - light); }
// a number that counts between two values across a shot
function between(a, b, k) { return a + (b - a) * ease(k); }

// 4 · «طب الفلوس اللي بتشحنها بتروح فين؟» — the meter, the card beside it, a big question mark
shot(4, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(520, 600, .9, { rot: -14 + 3 * Math.sin(t * 1.3) }) + q(530, 230, u, 130); });
shot([4, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(520, 600 - 6 * Math.sin(t * 1.6), .9, { rot: -14 }) + T("؟", 530, 230, 130, ORANGE, 800) + arrow(500, 540, 420, 430, ORANGE, 4, at(u, .1, .5)); });
// 5 · the card holds a small chip, like a bank card's
shot(5, still(320, 393, 1), function (u, d, t) { return paper() + CM.card(320, 393, 2.6 + .02 * Math.sin(t), { glow: 0 }); });
shot([5, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.card(320, 393, 2.6, { glow: .5 + .5 * Math.sin(t * 3) }) + label(190, 440, 120, 600, "شريحة", OLIVE, at(u, .1, .5), 26); });
shot([5, 2], still(320, 393, 1), function (u, d, t) {
  var visa = R(-58, -38, 116, 76, "#2f4f6e", 2.2, 7) + CM.chipPad(-28, -2, .55, 0) + T("بنك", 30, 26, 14, "#e8e2d2", 800);
  return paper() + CM.card(320, 393, 2.6, { glow: .5 + .5 * Math.sin(t * 3) }) + label(190, 440, 120, 600, "شريحة", OLIVE, 1, 26) + iconBox(520, 150, 150, visa, at(u, .1, .3));
});
// 6 · when you charge, the clerk writes your balance onto the chip
shot(6, still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { amt: "" }); });
shot([6, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { amt: between(0, 100, at(u, .1, 1.4)).toFixed(2), cardGlow: .3 }); });
shot([6, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.chipBig(320, 360, 1.3, "رصيدك: 100.00 ج", at(u, .1, 1.4)) + G("", T("بيتكتب على الشريحة", 320, 160, 26, INK, 800), at(u, .3, .3)); });
// 7 · you put the card in: the meter reads the balance, keeps it in its memory and wipes the card
shot(7, still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: 25.4, card: at(u, .1, 1.2), pulse: ledPulse(t) }); }, { tr: "fade" });
shot([7, 1], fly([SLOT[0], SLOT[1] - 60, 1.3], LCDV, 1.6), function (u, d, t) { var v = between(25.4, 125.4, at(u, .6, 1.4)); return paper() + front({ bal: v, card: 1, pulse: ledPulse(t) }) + G("", T("+100", 470, 140, 24, ORANGE, 800), at(u, 1.6, .3)); });
shot([7, 2], still(MEM[0] - 60, MEM[1] + 20, 1.9), function (u, d, t) {
  var k = at(u, .2, .9); return paper() + opened({ bal: 125.4, hi: "mem", pulse: ledPulse(t) }) + arrow(mp(0, -20)[0], mp(0, -20)[1], mp(90, -66)[0], mp(90, -66)[1], ORANGE, 4, k) + label(mp(99, -84)[0], mp(99, -84)[1], 520, 160, "ذاكرة العداد", OLIVE, at(u, .8, .5), 18);
}, { tr: "fade" });
shot([7, 3], still(320, 393, 1), function (u, d, t) { var k = 1 - at(u, .3, 1.0); return paper() + CM.chipBig(320, 360, 1.3, k > .1 ? "100.00 ج" : "0.00 ج", k) + G("", T("الكارت اتصفّر", 320, 160, 28, ORANGE, 800), at(u, 1.1, .3)); });
// 8 · so the money is now inside the meter, not on the card
shot(8, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }); });
shot([8, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }) + check(470, 140, 1.1, at(u, .1, .5)) + chip("الفلوس هنا", 320, 70, OLIVE, at(u, .2, .3)); });
shot([8, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }) + check(470, 140, 1.1, 1) + chip("الفلوس هنا", 320, 70, OLIVE, 1) + cross(540, 640, 1, at(u, .1, .5)); });
// 9 · how does the meter know how much you used? — the man at home, the light on, the question
shot(9, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "raised" }, null, 125.4) + q(520, 520, u, 120); });
shot([9, 1], fly([320, 400, 1], [130, 300, 2.2], 1.8), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "raised" }, null, 125.4) + T("؟", 520, 520, 120, ORANGE, 800); });
// 10 · the electricity comes into your home through a cable; inside the meter a small piece of metal measures the current
shot(10, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + CM.houseCut(t, at(u, .2, .6)); });
shot([10, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, pulse: ledPulse(t) }); });
shot([10, 3], fly(WIDE, SHUNT, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: u > 1 ? "shunt" : "", pulse: ledPulse(t) }); });
shot([10, 4], still(SHUNT[0], SHUNT[1], SHUNT[2]), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "shunt", pulse: ledPulse(t) }) + label(mp(-34, 112)[0], mp(-34, 112)[1], 210, 410, "حتة معدن", OLIVE, at(u, .1, .5), 13) + chip("التيار", mp(-30, 150)[0] + 50, mp(-30, 150)[1] + 8, BLUE, at(u, .6, .3)); });
// 11 · an electronic chip multiplies the current by the voltage, and knows how much you draw every moment
shot(11, fly(SHUNT, ICV, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }); });
function eq(u, n) {   // current × voltage = power, built chunk by chunk
  var s = numBox("5 A", 130, 650, n >= 1 ? 1 : 0, 26) + (n >= 1 ? T("×", 225, 662, 34, INK, 800) : "") + numBox("220 V", 320, 650, n >= 1 ? 1 : 0, 26);
  if (n >= 2) s += T("=", 420, 662, 34, INK, 800) + numBox("1100 W", 520, 650, at(u, .1, .3), 26, true);
  return '<rect x="20" y="595" width="600" height="100" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + s;
}
hud([11, 1], [12, 0], function (u, t) { var c = window.CHUNKS[11], l = LN[11], n = t >= l.start + (l.end - l.start) * c[2] ? 2 : 1; return eq(t - (l.start + (l.end - l.start) * c[2]), n); });
shot([11, 1], still(ICV[0], ICV[1] + 40, 1.7), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }) + label(mp(-82, -100)[0], mp(-82, -100)[1], 330, 170, "شريحة القياس", OLIVE, at(u, .1, .5), 13); });
shot([11, 2], still(ICV[0], ICV[1] + 40, 1.7), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }) + label(mp(-82, -100)[0], mp(-82, -100)[1], 330, 170, "شريحة القياس", OLIVE, 1, 13); });
// 12 · every bit of a kilowatt-hour that adds up, the red light blinks
shot(12, fly([ICV[0], ICV[1] + 40, 1.7], WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }); });
shot([12, 1], fly(WIDE, LEDV, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }); });
shot([12, 2], still(LEDV[0], LEDV[1], LEDV[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .55) }) + label(mp(-60, -64)[0], mp(-60, -64)[1], 330, 320, "بتغمز", ORANGE, at(u, .1, .5), 10); });
// 13 · like a taxi meter: the more you go, the more it adds
shot(13, fly(LEDV, WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .55) }) + iconBox(520, 160, 170, '<g transform="scale(1.25)">' + CM.taxi(12 + t * .6 % 30) + '</g>', at(u, 1.5, .3)); });
shot([13, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .4) }) + iconBox(520, 160, 170, '<g transform="scale(1.25)">' + CM.taxi(12 + t * .6 % 30) + '</g>', 1) + T("كيلووات +", 140, 700, 26, ORANGE, 800); });
// 14 · so how does it take the money?
shot(14, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + q(530, 220, u, 130); });
shot([14, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + T("؟", 530, 220, 130, ORANGE, 800) + chip("ج", 540, 380, ORANGE, at(u, .1, .3)); });
// 15 · the meter keeps the price table inside it: how much a kilowatt-hour costs
shot(15, fly(WIDE, MCU, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "mcu", pulse: ledPulse(t) }); });
function table(k, hl) {
  var s = '<g transform="translate(320 600)">' + R(-250, -110, 500, 210, "#fbf8f1", 2.4, 6) + T("جدول الأسعار", 0, -78, 24, OLIVE, 800) + CM.lineP([[-220, -62], [220, -62]], INK, 1.4);
  for (var i = 0; i < 3; i++) { var kk = clamp(k * 3 - i); s += G("", T("شريحة " + (i + 1), 150, -24 + i * 40, 19, INK, 800) + CM.lineP([[70, -30 + i * 40], [-90, -30 + i * 40]], "#b3a98f", 1.4, ' stroke-dasharray="4 5"') + T(["قرش", "قروش أكتر", "أغلى"][i], -160, -24 + i * 40, 19, i === hl ? ORANGE : INK, 800), kk); }
  return s + '</g>';
}
hud([15, 1], [16, 0], function (u, t) { return table(at(u, 0, 1.2), u > 1.6 ? 2 : -1); });
shot([15, 1], still(MCU[0], MCU[1] - 40, 1.5), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "mcu", pulse: ledPulse(t) }) + label(mp(18, -110)[0], mp(18, -110)[1], 470, 130, "المخ", OLIVE, at(u, .1, .5), 16); });
// 16 · it multiplies your use by the price and takes it off the balance, bit by bit
shot(16, fly([MCU[0], MCU[1] - 40, 1.5], WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + G("", tag("كيلووات × السعر", 320, 690, 1, 26, ORANGE), at(u, 1, .3)); });
shot([16, 2], fly(WIDE, LCDV, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4 - 2.6 * at(u, .4, d + 3), pulse: ledPulse(t), lcdCol: ORANGE }); });
shot([16, 3], still(LCDV[0], LCDV[1], LCDV[2]), function (u, d, t) { return paper() + front({ bal: 122.8 - 1.4 * at(u, 0, d), pulse: ledPulse(t), lcdCol: ORANGE }) + G("", T("−", 205, 160, 40, ORANGE, 800), at(u, .1, .3)); });
// 17 · the more you use in a month, the dearer the kilowatt-hour: the tiers
shot(17, fly(LCDV, WIDE, 1.6), function (u, d, t) { return paper() + CM.stairs(65, 560, 5, at(u, .3, 2.2), -1) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, at(u, .3, 1.5)); });
shot([17, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { var cur = Math.min(4, Math.floor(at(u, 0, d) * 5)); return paper() + CM.stairs(65, 560, 5, 1, cur) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, 1) + G("", T("الكيلو يغلى", 200, 220, 34, ORANGE, 800), at(u, .1, .3)) + arrow(120, 300, 380, 140, ORANGE, 5, at(u, .3, .6)); });
shot([17, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + CM.stairs(65, 560, 5, 1, 4) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, 1) + chip("الشرايح", 320, 160, OLIVE, at(u, .1, .3)); });
// 18 · so how does it cut you off?
shot(18, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "worried" }, null, 3.5) + q(520, 520, u, 120); });
// 19 · when the balance is nearly gone, the meter beeps and lights a warning lamp
shot(19, fly([320, 400, 1], WIDE, 1.2), function (u, d, t) { return paper() + front({ bal: 3.5, pulse: ledPulse(t) }); });
shot([19, 1], fly(WIDE, LCDV, 1.6), function (u, d, t) { return paper() + front({ bal: 3.5 - .3 * at(u, 0, d), pulse: ledPulse(t), lcdCol: ORANGE }); });
function beep(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var a = (t * 1.6 + i / 3) % 1; s += '<path d="M' + f(x + 20 + 30 * a) + ' ' + f(y - 26 - 20 * a) + ' q' + f(18 + 10 * a) + ' ' + f(26 + 20 * a) + ' 0 ' + f(52 + 40 * a) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - a) + '"/>'; } return s; }
shot([19, 2], fly(LCDV, [mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9], 1.4), function (u, d, t) { var w = ledPulse(t, .5); return paper() + front({ bal: 3.2, pulse: ledPulse(t), warn: w, lcdCol: ORANGE }) + beep(mp(60, -74)[0] + 20, mp(60, -74)[1], t); });
shot([19, 3], still(mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9), function (u, d, t) { var w = ledPulse(t, .5); return paper() + front({ bal: 3.1, pulse: ledPulse(t), warn: w, lcdCol: ORANGE }) + beep(mp(60, -74)[0] + 20, mp(60, -74)[1], t) + label(mp(60, -64)[0], mp(60, -64)[1], 360, 380, "تحذير", ORANGE, at(u, .1, .5), 14); });
// 20 · at zero it sends a pulse to a switch inside it, called the relay
shot(20, fly([mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9], LCDV, 1.2), function (u, d, t) { var v = 3.1 * (1 - at(u, 0, .9)); return paper() + front({ bal: v, pulse: ledPulse(t), warn: ledPulse(t, .5), lcdCol: ORANGE }) + G("", numBox("0.00", 470, 120, 1, 22, true), at(u, 1, .3)); });
shot([20, 1], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "mcu", sig: clamp((u - .3) / 1.1) }); }, { tr: "fade" });
shot([20, 2], fly([320, 380, 1.25], RELV, 1.4), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "relay", sig: 1 }); });
shot([20, 3], still(RELV[0], RELV[1], RELV[2]), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "relay", sig: 1 }) + label(mp(66, 80)[0], mp(66, 80)[1], 480, 380, "الريليه", OLIVE, at(u, .1, .5), 12); });
// 21 · the relay has a magnet: it pulls the contact and opens it, the line is cut and the light goes out
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 0, coil: at(u, .3, .4), flow: 1 }) + label(-150 * 1.22 + 320, 393 - 60 * 1.22, 120, 130, "مغناطيس", BLUE, at(u, .5, .5), 20); }, { tr: "in" });
shot([21, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: at(u, .1, .5), coil: 1, flow: 1 }) + label(-150 * 1.22 + 320, 393 - 60 * 1.22, 120, 130, "مغناطيس", BLUE, 1, 20) + label(320 + 150 * 1.22, 393 - 16 * 1.22, 520, 150, "الكونتاكت", INK, at(u, .4, .5), 20); });
shot([21, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1, coil: 1 - at(u, .4, .5), spark: 1 - at(u, 0, .4) }) + label(320 + 150 * 1.22, 393 - 16 * 1.22, 520, 150, "الكونتاكت", INK, 1, 20) + G("", T("مفتوح", 520, 520, 30, ORANGE, 800), at(u, .2, .3)); });
shot([21, 3], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1 }) + T("مفتوح", 520, 520, 30, ORANGE, 800) + cross(400, 600, .8, at(u, .1, .4)) + chip("مفيش تيار", 320, 690, ORANGE, at(u, .4, .3)); });
shot([21, 4], still(320, 400, 1), function (u, d, t) { var L = 1 - at(u, .1, .25); return paper() + roomMan(t, L, L > .5 ? { look: [0, -.4] } : "shock", null, 0); });
// 22 · just like a light switch, except the one pressing it is the meter
shot(22, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 0, "shock", null, 0) + iconBox(520, 150, 170, '<g transform="scale(1.1)">' + CM.wallSwitch(at(u, .5, .3)) + '</g>', at(u, .1, .3)); });
shot([22, 1], still(320, 393, 1), function (u, d, t) { var k = at(u, .4, .3); return paper() + G("translate(300 340) scale(2.6)", CM.wallSwitch(k)) + CM.meter(520, 600, .38, { bal: 0, lcdCol: ORANGE }) + arrow(470, 560, 380, 470, ORANGE, 5, at(u, .1, .4)); });
shot([22, 2], still(320, 393, 1), function (u, d, t) { return paper() + G("translate(300 340) scale(2.6)", CM.wallSwitch(1)) + CM.meter(520, 600, .38, { bal: 0, lcdCol: ORANGE, warn: ledPulse(t, .5) }) + arrow(470, 560, 380, 470, ORANGE, 5, 1) + chip("العداد", 520, 760 - 30, OLIVE, at(u, .1, .3)); });
// 23 · as soon as you charge and put the card in, a reverse pulse closes it and the light comes back
shot(23, still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: 0, card: at(u, .1, .9), lcdCol: ORANGE }); });
shot([23, 1], still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: between(0, 100, at(u, .1, 1)), card: 1 }); });
shot([23, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1 - at(u, .5, .5), coil: at(u, .1, .3) * (1 - at(u, 1.2, .4)), rev: true, flow: u > 1 ? 1 : 0 }) + chip("نبضة عكسية", 320, 130, BLUE, at(u, .1, .3)); });
shot([23, 3], still(320, 400, 1), function (u, d, t) { var L = at(u, .1, .25); return paper() + roomMan(t, L, L > .5 ? { mouth: "grin", brows: "raised" } : "shock", null, 100); });
// 24 · many think that if the card is lost, the money is lost. No.
shot(24, still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "frown", brows: "worried", look: [.7, .5] }, null, { turn: .4 * Math.sin(t * 1.2), tilt: -6 }); });
shot([24, 1], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "frown", brows: "worried", look: [.7, .5] }, null, { turn: .4 * Math.sin(t * 1.2), tilt: -6 }) + iconBox(520, 520, 170, '<g transform="rotate(-12)">' + CM.card(0, 0, .75, {}) + '</g>' + T("ضاع؟", 0, 70, 20, ORANGE, 800), at(u, .1, .3)); });
shot([24, 2], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "open", brows: "worried", look: [.7, .5] }) + iconBox(520, 520, 170, '<g transform="rotate(-12)">' + CM.card(0, 0, .75, {}) + '</g>' + T("ضاع؟", 0, 70, 20, ORANGE, 800), 1) + chip("الفلوس ضاعت؟", 320, 110, INK, at(u, .1, .3)); });
shot([24, 3], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "neutral", brows: "raised", look: [-.6, -.2] }) + chip("الفلوس ضاعت؟", 320, 110, INK, 1) + cross(320, 110, 1, at(u, .05, .4)); });
// 25 · as long as you put it in the meter, your balance is safe inside
shot(25, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t) }); });
shot([25, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t) }) + check(470, 140, 1.1, at(u, .1, .5)) + chip("في أمان", 320, 70, OLIVE, at(u, .2, .3)); });
// 26 · bottom line: the card carries the money, the meter counts and takes it off, the relay cuts
shot(26, fly(WIDE, [320, 380, 1.25], 1.4), function (u, d, t) { return paper() + opened({ bal: 100, flow: 1, pulse: ledPulse(t) }); });
function recap(u, n) { return callout("1", mp(0, -5)[0], mp(0, -5)[1] + 40, n >= 1 ? 1 : 0, 18) + callout("2", mp(18, -72)[0], mp(18, -72)[1] - 70, n >= 2 ? 1 : 0, 18) + callout("3", mp(66, 110)[0] + 70, mp(66, 110)[1], n >= 3 ? 1 : 0, 18); }
shot([26, 1], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 100, flow: 1, hi: "contacts", pulse: ledPulse(t) }) + recap(u, 1); });
shot([26, 2], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 100 - .5 * at(u, 0, d), flow: 1, hi: "mcu", pulse: ledPulse(t) }) + recap(u, 2); });
shot([26, 3], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 99.5, flow: 1 - at(u, .4, .3), open: at(u, .3, .4), hi: "relay" }) + recap(u, 3); });
// 27 · the oddest: on its way back the card carries a report to the company: your use, and whether someone opened the meter's cover
shot(27, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t), card: 1 - at(u, .3, 1) }); });
shot([27, 1], still(320, 393, 1), function (u, d, t) { var k = at(u, 0, d); return paper() + CM.office(t, {}) + G("", CM.card(lerp(620, 240, k), lerp(200, 520, k), .7, { rot: -6, glow: 1 }), 1 - at(u, d - .2, .2)); });
shot([27, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { cardGlow: 1 }) + G("", R(40, 180, 300, 300, PAPER, 0), at(u, 0, .3)) + CM.report(190, 330, 1.1, 0, 0); });
shot([27, 3], still(320, 393, 1), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + R(60, 60, 520, 120, "#f1ead8", 2.4) + T("شركة الكهربا", 320, 135, 34, CM.colors.CARDD, 800) + CM.report(320, 470, 1.5, 0, 0); });
shot([27, 4], still(320, 470, 1.4), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + CM.report(320, 470, 1.5, at(u, .1, 1), 0); });
shot([27, 5], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t), coverOpen: at(u, .1, .6) }) + G("", T("حد فتح الغطا", 320, 70, 30, ORANGE, 800), at(u, .5, .3)); });
shot([27, 6], still(320, 470, 1.4), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + CM.report(320, 470, 1.5, 1, at(u, .1, .3)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the man at home, the balance hits zero, the light goes out. line 1: in the dark, shocked; who did it? a hand on a button at the company. line 2: nobody did
  var l0 = LN[0], off = clamp((t - (l0.end - .5)) / .25), L = li === 0 ? 1 - off : 0;
  var s = '<g transform="translate(0 -60) scale(.95)">' + CM.room({ light: L, meterBal: li === 0 ? 1.2 * (1 - clamp((t - .3) / 1.2)) : 0, warn: li === 0 ? ledPulse(t, .5) : 0 }) +
    (L > .5 ? man(300, 700, 1, t, { look: [-.6, -.1], brows: "worried" }) : shocked(300, 700, 1, t)) + CM.nightOver(1 - L) + '</g>';
  if (li >= 1) {
    var bub = '<g transform="translate(450 150)">' + '<ellipse cx="0" cy="0" rx="130" ry="105" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<rect x="-80" y="-46" width="160" height="86" fill="#e6d6b2" stroke="' + INK + '" stroke-width="2.2"/><path d="M-92 -46 L0 -88 L92 -46 Z" fill="#b5543a" stroke="' + INK + '" stroke-width="2.2"/>' + T("شركة الكهربا", 0, -14, 16, INK, 800) +
      '<circle cx="0" cy="18" r="15" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + CM.lineP([[40, 60], [8, 24]], INK, 10) + CM.lineP([[40, 60], [8, 24]], "#e0a98a", 6) + T("؟", 100, -40, 50, ORANGE, 800) + '</g>' +
      '<circle cx="360" cy="270" r="12" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="340" cy="300" r="7" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/>';
    s += G("", bub, ease((t - LN[1].start) / .3));
    if (li >= 2) s += cross(450, 160, 1.6, clamp((t - LN[2].start - .2) / .5));
  }
  return s;
};
SCENE.bumper = function (u, t) { return '<g transform="translate(90 104) scale(.36)">' + CM.meter(0, 0, 1, { bal: 125.4, pulse: ledPulse(t), wires: false }) + '</g>'; };
SCENE.outro = function (svg, u, t) {
  return CM.card(90, 150, .8, { glow: .5 + .5 * Math.sin(t * 3) }) + arrow(160, 150, 215, 150, INK, 3, 1) +
    '<g transform="translate(300 140) scale(.44)">' + CM.inside(0, 0, 1, { bal: 100, flow: 1, pulse: ledPulse(t), wires: false }) + '</g>' + arrow(390, 150, 440, 150, INK, 3, 1) +
    '<g transform="translate(520 150) scale(.3)">' + CM.relay(0, 0, 1, { open: 0, flow: 1 }) + '</g>' +
    callout("1", 90, 70, ease(u / .3)) + callout("2", 300, 60, ease(u / .3 - .5)) + callout("3", 270, 110, ease(u / .3 - 1)) + callout("4", 520, 70, ease(u / .3 - 1.5));
};
