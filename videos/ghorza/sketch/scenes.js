window.CHUNKS = [[0.0, 0.6042], [0.0, 0.6], [0.0, 0.5833], [0.0, 0.4194], [0.0, 0.3077, 0.7077], [0.0, 0.5833], [0.0, 0.46, 0.66], [0.0, 0.1757, 0.4324, 0.5541, 0.8784], [0.0, 0.3158, 0.6579], [0.0, 0.4194], [0.0, 0.2759, 0.5345, 0.7241], [0.0, 0.4038, 0.7692], [0.0, 0.1636, 0.6545], [0.0, 0.2692, 0.5769], [0.0, 0.3036, 0.5536], [0.0, 0.3333, 0.6032, 0.8254], [0.0, 0.3378, 0.6081, 0.8108], [0.0, 0.4118, 0.7255], [0.0, 0.4318], [0.0, 0.2676, 0.5775, 0.7887], [0.0], [0.0, 0.2787, 0.6066, 0.8525], [0.0, 0.275, 0.5125, 0.825], [0.0, 0.3529, 0.8235], [0.0, 0.5278], [0.0, 0.439], [0.0, 0.1579, 0.4, 0.6526, 0.8316], [0.0, 0.4182, 0.7091], [0.0, 0.6304]];
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

// ── «الغرزة» — shots. Drawings in draw.js (GZ.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (~1.8 s) in or out. Life comes from the
// drawing: lane dashes running down (the camera travels with the traffic), wheels, blinkers, brake lights, flames, breathing.
var Z = GZ, LANE = Z.LANE, CC = Z.CARC, SPEED = 130;                    // px/s the lane dashes run down the panel
var OV = [320, 430, .8];                                               // overview of the road, plan view
function chunkT(i, j) { var l = LN[i], c = window.CHUNKS[i]; return l.start + (l.end - l.start) * (c[j] || 0); }
function road(t, o) { return Z.road(Object.assign({ scroll: t * SPEED }, o || {})); }
function kf(K, t) {   // keyframes [[t, x, y, ang?], …] → eased in between
  if (t <= K[0][0]) return K[0].slice(1); for (var i = 1; i < K.length; i++) if (t < K[i][0]) { var a = K[i - 1], b = K[i], k = ease((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] || 0, b[3] || 0, k)]; }
  return K[K.length - 1].slice(1);
}
// ── scene A: the Warraq crash in plan view. The tanker in lane 2; the young man weaves from lane 0 across to lane 3 and cuts
//    left into the tanker's right rear (prosecution: the left front of his car hit the right rear of the tanker).
var T6 = chunkT(6, 1) + .2, HIT = T6 + .55;                            // the cut, the contact
var WK = [[LN[4].start, LANE(0), 720], [chunkT(4, 2), LANE(0), 700], [chunkT(4, 2) + .8, LANE(1), 660], [LN[5].start + .6, LANE(1), 640],
  [chunkT(5, 1), LANE(2), 610], [chunkT(5, 1) + .8, LANE(3), 590], [LN[6].start + .6, LANE(3), 565], [T6, LANE(3) - 4, 548], [HIT, 430, 524]];
function weaver(t) {
  if (t < HIT) { var p = kf(WK, t), q = kf(WK, t + .05), ang = Math.atan2(q[0] - p[0], -(q[1] - p[1]) + SPEED * 2.2 * .05) * 57.3; if (t > T6) ang = lerp(ang, -24, clamp((t - T6) / (HIT - T6))); return [p[0], p[1], ang]; }
  var k = ease((t - HIT) / 1.1); return [lerp(430, 470, k), lerp(524, 590, k), lerp(-24, 38, k)];   // he loses the wheel and slews right
}
function tankerAt(t) { var k = ease((t - HIT - .15) / 1.2); return { x: LANE(2) + 70 * k, a: 9 * k }; }
var OTHERS = [[0, 330, 3], [0, 560, 0], [1, 200, 1], [1, 900, 4], [2, 800, 2], [3, 120, 5]];
function others(t, o) { o = o || {}; return OTHERS.map(function (c, i) { return Z.carTop(LANE(c[0]), c[1] + 6 * Math.sin(t * .6 + i), CC[c[2]], 0, { ring: o.ring ? o.ring : 0, brake: o.brake && o.brake(i) }); }).join(""); }
function sceneA(t, o) {
  o = o || {}; var w = weaver(t), tk = tankerAt(t), s = road(t) + others(t, o) + Z.tankerTop(tk.x, 40, tk.a, { brake: t > HIT });
  if (o.path) s += draw("M150 760 C150 700 250 690 250 650 S350 610 350 600 S450 590 450 560", o.path, ORANGE, 4, ' stroke-dasharray="12 9"');
  s += Z.carTop(w[0], w[1], ORANGE, w[2], { ring: o.wring || 0, blink: t > chunkT(4, 2) && t < T6 ? (t < HIT ? 1 : 0) : 0 });
  if (t > HIT - .05) s += Z.burst(LANE(2) + 36 + tk.x - LANE(2), 470, clamp((t - HIT) / .5)) + Z.burst(LANE(2) + 40 + tk.x - LANE(2), 360, clamp((t - HIT - .35) / .5));
  return s;
}
var CA = [400, 520, 1.9];
function spd(x, y, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", '<rect x="-92" y="-30" width="184" height="52" fill="' + INK + '"/>' + N("110", 40, 10, 30, "#fff") + T("كم/س", -36, 8, 24, "#fff", 800)); }                                              // close on the tanker's right rear
shot(4, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + sceneA(t) + tag("الدائري · الوراق", 320, 0, at(u, .2, .3), 26); });
shot([4, 2], still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + sceneA(t, { wring: at(u, 0, .4) }) + tag("الدائري · الوراق", 320, 0, 1, 26); });
shot(5, fly(OV, [300, 560, 1.25], 1.8), function (u, d, t) { return paper() + sceneA(t, { wring: 1 }) + spd(300, 400, at(u, .6, .3)); });
shot([5, 1], still(300, 560, 1.25), function (u, d, t) { return paper() + sceneA(t, { path: at(u, 0, d), wring: 1 }) + spd(300, 400, 1); });
shot(6, fly([300, 560, 1.25], CA, 1.8), function (u, d, t) { return paper() + sceneA(t) + label(350, 300, 200, 250, "ناقلة بنزين", OLIVE, at(u, .3, .5), 22); });
shot([6, 1], still(CA[0], CA[1], CA[2]), function (u, d, t) { return paper() + sceneA(t) + label(386, 478, 250, 430, "ضهرها من اليمين", ORANGE, at(u, .1, .5), 16); });
shot([6, 2], still(CA[0], CA[1], CA[2]), function (u, d, t) { return paper() + sceneA(t) + T("فرقع!", 470, 380, 28, ORANGE, 800); });

// ── scene B: section across the road, seen from behind: the tanker slews into the barrier and rolls onto its side; the
//    fuel runs out and catches fire (kept restrained: flames and smoke, no people).
var GY = 560, SB = 100;                                               // ground line, px per metre
function sceneB(u0, k) {   // k: {slide, roll, spill, fire}
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 6; i++) s += '<rect x="' + (-120 + i * 140) + '" y="' + (GY + 4) + '" width="60" height="6" fill="#f7f3e8"/>';
  s += Z.jerseySection(560, GY, SB, 1) + label(590, GY - 50, 610, GY - 180, "الحاجز الخرساني", OLIVE, k.lab == null ? 1 : k.lab, 15);
  var x = lerp(220, 310, k.slide || 0), roll = k.roll || 0;
  s += Z.spill(x + 120, GY + 22, 230, k.spill || 0, .18);
  s += Z.tankerRear(x, GY - (roll ? 0 : 0), SB, roll > 0 ? lerp(0, 12, Math.min(1, roll * 3)) - (roll > .33 ? 0 : 0) : 0, 1);
  return s;
}
function rolled(x, k) { return Z.tankerRear(x, GY, SB, -90 * ease(k), -1); }   // onto its left side
shot(7, still(320, 430, 1), function (u, d, t) {
  var sl = at(u, .2, 1.1), s = sceneB(u, { slide: sl, lab: at(u, .8, .5) });
  if (u > 1.2) s += Z.burst(540, GY - 120, clamp((u - 1.2) / .4));
  return paper() + s;
});
shot([7, 2], still(320, 430, 1), function (u, d, t) {
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>' + Z.jerseySection(560, GY, SB, 1);
  return paper() + s + rolled(500, at(u, 0, .9)) + G("", T("اتقلبت", 200, 200, 34, ORANGE, 800), at(u, .7, .3));
});
function down(u, sp, fi) {
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>' + Z.jerseySection(560, GY, SB, 1);
  s += Z.spill(260, GY + 30, 300, sp, .2) + rolled(500, 1);
  if (sp > .2) s += draw("M250 " + (GY - 60) + " Q230 " + (GY - 20) + " 210 " + (GY + 14), sp, "#7d6a8a", 6);
  return s + Z.flames(260, GY + 24, 340, 170, fi);
}
shot([7, 3], still(320, 430, 1), function (u, d, t) { return paper() + down(u, at(u, 0, d + .4), 0) + label(160, GY + 40, 80, GY + 140, "بنزين", "#7d6a8a", at(u, .3, .5), 18); });
shot([7, 4], still(320, 430, 1), function (u, d, t) { return paper() + down(u, 1, at(u, 0, .8)); });

// ── scene C: plan view, pulled back: the overturned tanker by the barrier, and the jam behind it. 27 cars burnt, 31 dead.
var JAM = []; (function () { for (var r = 0; r < 7; r++) for (var l = 0; l < 4; l++) JAM.push([LANE(l), 640 + r * 150 + (l % 2) * 40 + (r * 13 % 30), (r * 4 + l) % 6]); })();
function sceneC(t, n) {
  var s = Z.road({ scroll: 0, y0: -400, y1: 1900 });
  s += Z.spill(420, 260, 150, 1, 1.8) + '<g style="filter:saturate(.2) brightness(.7)">' + Z.tankerTop(455, 20, 6) + '</g>' + Z.flames(430, 470, 160, 120, .9) + Z.flames(440, 250, 120, 90, .8);
  JAM.forEach(function (c, i) { s += Z.carTop(c[0], c[1], CC[c[2]], 0, { burnt: i < n }); if (i < n && i % 3 === 0) s += Z.flames(c[0], c[1] - 20, 40, 40, .7); });
  return s;
}
var CC1 = [320, 760, .56];
shot(8, still(CC1[0], CC1[1], CC1[2]), function (u, d, t) { var n = Math.round(27 * at(u, .3, 1.8)); return paper() + sceneC(t, n); });
shot([8, 2], still(CC1[0], CC1[1], CC1[2]), function (u, d, t) { return paper() + dim(at(u, 0, .4), sceneC(t, 27)); });
hud(8, 9, function (u, t) { var n = Math.round(27 * clamp((t - chunkT(8, 1)) / 1.6)); return t > chunkT(8, 1) - .1 ? numBox(String(n) + " عربية", 170, 80, 1, 28, true) : ""; });
hud([8, 2], 9, function (u, t) { return bigNum("31", "واحد راحوا", 320, 420, ease(u / .5), ORANGE, 120); });

// ── 9–10 · what did the weave buy him? 20 km at 110 instead of 100: 10:55 instead of 12:00
shot(9, still(320, 393, 1), function (u, d, t) { return paper() + Z.watch(320, 360, 150, (t * .25) % 1) + G("", T("؟", 320, 640, 120, ORANGE, 800), at(u, .4, .3)); });
function bar(y, lab, kmh, mins, k, col) {
  var w = 460 * (mins / 12), s = T(lab, 540, y - 18, 28, INK, 800, "start") + R(80, y, 460, 44, "#e9dfc7", 1.6) + R(80, y, w * k, 44, col, 1.6);
  return s + (k > .98 ? N(mins === 12 ? "12:00" : "10:55", 90, y + 90, 34, INK, "start") + T("دقيقة", 200, y + 90, 22, INK, 700, "end") : "");
}
shot(10, still(320, 393, 1), function (u, d, t) { return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, at(u, .2, 1.6), "#8aa0ad"); });
shot([10, 1], still(320, 393, 1), function (u, d, t) { return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, 1, "#8aa0ad") + bar(460, "بـ110 كم/س", 110, 10.92, at(u, 0, 1.4), ORANGE); });
shot([10, 2], still(320, 393, 1), function (u, d, t) {
  var x1 = 80 + 460 * 10.92 / 12, x2 = 540;
  return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, 1, "#8aa0ad") + bar(460, "بـ110 كم/س", 110, 10.92, 1, ORANGE) +
    G("", P("M" + f(x1) + " 520 V600 M" + x2 + " 520 V600 M" + f(x1) + " 590 H" + x2, "none", 2.4) + T("دقيقة واحدة بس", (x1 + x2) / 2 - 30, 650, 34, ORANGE, 800, "start"), at(u, .2, .4));
});

// ── 11–14 · the rule: at 110 a car covers about 30 m a second; a driver needs about 1.5 s to see and brake → about 45 m
hud(11, 15, function (u, t) { return tag("قاعدة", 560, 60, ease(u / .3), 22, ORANGE); });
shot(11, still(320, 393, 1), function (u, d, t) { return paper() + Z.watch(320, 380, 120, (t * .5) % 1) + tag("خليك فاكرها", 320, 620, at(u, .8, .3), 28, INK); });
var SV = 16, GR = 560;
function lamps(t, s) { var g = ""; for (var x = -400 + ((-t * 160) % (40 * s) + 40 * s) % (40 * s); x < 1040; x += 40 * s) g += P("M" + f(x) + " " + GR + " V" + (GR - 12 * s) + " h" + f(2.2 * s), "none", 3) + R(x + 2.2 * s - 6, GR - 12 * s - 2, 14, 6, "#f4eed9", 1.4); return g; }                                                // side view: 12 px per metre, ground at y 520
function sideRoad(t) { var s = R(-400, GR, 1440, 200, Z.ASPH, 2); for (var x = -400 + ((-t * 160) % 120 + 120) % 120; x < 1040; x += 120) s += '<rect x="' + f(x) + '" y="' + (GR + 30) + '" width="50" height="6" fill="#f7f3e8"/>'; return s; }
function runCar(x, t, o, sv) { return Z.carSide(x, GR, sv || SV, "#8aa0ad", Object.assign({ spin: t * 30 }, o || {})); }
shot(12, still(320, 420, 1), function (u, d, t) { return paper() + lamps(t, SV) + sideRoad(t) + runCar(40, t) + spd(320, 300, at(u, .1, .3)); });
shot([12, 1], still(320, 420, 1), function (u, d, t) {
  var k = ((u - .2) % 1.6) / 1.6, x = 20 + 480 * clamp(k * 1.25);
  return paper() + lamps(t, SV) + sideRoad(t) + G("", runCar(20, 0), .3) + runCar(x, t) + measure(92, GR + 80, 572, GR + 80, at(u, .2, .8), "30 م", 34);
});
shot([12, 2], still(320, 420, 1), function (u, d, t) { return paper() + lamps(t, SV) + sideRoad(t) + G("", runCar(20, 0), .3) + runCar(500, t) + measure(92, GR + 80, 572, GR + 80, 1, "30 م", 34) + Z.watch(320, 250, 80, clamp(u / 1)) + T("ثانية واحدة", 320, 380, 30, BLUE, 800); });
function faceBox(x, y, sz, fc, k) {   // the driver's face in a framed box
  return iconBox(x, y, sz, '<clipPath id="fb' + (++CLIPN) + '"><rect x="' + f(-sz / 2 + 3) + '" y="' + f(-sz / 2 + 3) + '" width="' + f(sz - 6) + '" height="' + f(sz - 6) + '"/></clipPath><g clip-path="url(#fb' + CLIPN + ')">' +
    PERSON.head([0, sz * .1 + 2 * Math.sin(window.__t * 1.6)], sz / 80, 3 * Math.sin(window.__t * 1.1), { face: Object.assign({ eyes: Math.sin(window.__t * 2.3) > .96 ? .05 : 1 }, fc) }, PERSON.colors) + '</g>', k);
}
function pedal(x, y, k) { return R(x - 30, y - 50 + 14 * k, 60, 80, "#5b5650", 2, 6) + P("M" + (x - 22) + " " + f(y - 30 + 14 * k) + " H" + (x + 22) + " M" + (x - 22) + " " + f(y - 10 + 14 * k) + " H" + (x + 22), "none", 1.4, ' stroke="#8f8b84"') + T("فرامل", x, y + 70, 18, INK, 800); }
shot(13, still(320, 393, 1), function (u, d, t) { return paper() + faceBox(320, 300, 300, { eyes: 1.2, brows: "raised", mouth: "o" }, at(u, 0, .3)); });
shot([13, 1], still(320, 393, 1), function (u, d, t) { return paper() + faceBox(170, 250, 220, { eyes: 1.2, brows: "raised", mouth: "o" }, 1) + Z.watch(470, 250, 85, clamp(u / 1.5) * .75) + bigNum("1.5", "ثانية", 470, 450, at(u, .2, .3), BLUE, 64); });
shot([13, 2], still(320, 393, 1), function (u, d, t) { return paper() + faceBox(170, 250, 220, { eyes: 1.1, brows: "worried", mouth: "frown" }, 1) + Z.watch(470, 250, 85, .75) + bigNum("1.5", "ثانية", 470, 450, 1, BLUE, 64) + pedal(320, 640, at(u, .6, .4)); });
shot(14, still(320, 420, 1), function (u, d, t) { var x = 20 + 540 * at(u, .1, d + 1.2); return paper() + lamps(t, 12) + sideRoad(t) + G("", runCar(20, 0, {}, 12), .3) + runCar(Math.min(x, 560), t, {}, 12); });
shot([14, 2], still(320, 420, 1), function (u, d, t) {
  var tt = t * (1 - at(u, .3, 1)); return paper() + lamps(tt, 12) + sideRoad(tt) + G("", runCar(20, 0, {}, 12), .3) + runCar(560, tt, { brake: u > .2 }, 12) + measure(74, GR + 80, 614, GR + 80, at(u, 0, .8), "45 م", 40) + T("لسه بيدوس فرامل", 320, 330, 34, ORANGE, 800);
});

// ── 15 · the weave eats the safety gap in front of you and behind you
var GB = [320, 430, .8];
function gapScene(t, k, o) {   // k: 0 the gap is whole, 1 the weaver is in it
  o = o || {}; var s = road(t) + Z.carTop(LANE(1), 150, CC[1]) + Z.carTop(LANE(1), 760, CC[4]) + Z.carTop(LANE(0), 420, CC[0]) + Z.carTop(LANE(3), 300, CC[5]) + Z.carTop(LANE(2), 640, CC[2]);
  var wx = lerp(LANE(2) + 10, LANE(1), ease(k)), wy = 460;
  if (k <= 0) s += measure(LANE(1) + 60, 214, LANE(1) + 60, 696, o.m == null ? 1 : o.m, "", 0);
  else s += G("", measure(LANE(1) + 60, 214, LANE(1) + 60, wy - 64, 1, "") + measure(LANE(1) + 60, wy + 64, LANE(1) + 60, 696, 1, ""), 1) + G("", '<rect x="' + (LANE(1) + 50) + '" y="214" width="20" height="482" fill="' + ORANGE + '" opacity=".25"/>', ease(k));
  return s + Z.carTop(wx, wy + (1 - ease(k)) * 120, ORANGE, -16 * Math.sin(Math.PI * ease(k)), { blink: k > 0 && k < 1 ? -1 : 0 });
}
shot(15, still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, 0, { m: at(u, .3, .8) }) + G("", T("مسافة الأمان", LANE(1) + 76, 455, 30, BLUE, 800, "end"), at(u, .9, .3)); });
shot([15, 1], still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, at(u, 0, 1.2)); });
shot([15, 2], fly(GB, [250, 300, 1.5], 1.8), function (u, d, t) { return paper() + gapScene(t, 1) + label(LANE(1) + 60, 300, 480, 240, "قدامك", ORANGE, at(u, 1.2, .5), 22); });
shot([15, 3], fly([250, 300, 1.5], [250, 600, 1.5], 1.2), function (u, d, t) { return paper() + gapScene(t, 1) + label(LANE(1) + 60, 600, 480, 640, "وراك", ORANGE, at(u, .6, .5), 22); });

// ── 16 · a push in a queue: the first falls on the one behind, and he on the next
var QF = 600;   // floor
function queue(t, push) {
  var s = '<path d="M0 ' + QF + ' H640" stroke="' + INK + '" stroke-width="2"/>' + R(-10, QF, 660, 200, "#e6dcc4", 0);
  var cols = ["#a9c3dc", "#c9a77c", "#b9a7c9", "#9fb8a0"];
  for (var i = 3; i >= 0; i--) {
    var x = 130 + i * 120, lean = 16 * ease(clamp(push * 4 - i * 1.0)), o = { x: x, s: .78, dir: -1, outfit: { base: "casual", colors: { shirt: cols[i], shirtD: cols[i] } }, breath: (Math.sin(t * 1.6 + i) + 1) / 2,
      legs: [{ hip: 0, knee: 3 }, { hip: 2, knee: 3 }], arms: [{ sh: 8, el: 20, hand: "relaxed" }, { sh: -4, el: 18, hand: "relaxed" }], face: { mouth: lean > 4 ? "o" : "neutral", brows: lean > 4 ? "raised" : "neutral", eyes: lean > 4 ? 1.2 : 1 } };
    o.y = PERSON.sideHipY(o, QF); s += G("rotate(" + f(lean) + " " + f(x + 10) + " " + QF + ")", PERSON.side(o).svg);
  }
  return s;
}
shot(16, still(320, 420, 1), function (u, d, t) { return paper() + queue(t, 0) + arrow(20, 380, 90, 380, ORANGE, 6, at(u, .6, .4)); });
shot([16, 1], still(320, 420, 1), function (u, d, t) { return paper() + queue(t, at(u, 0, 2.6) * .45) + arrow(20, 380, 90, 380, ORANGE, 6, 1); });
shot([16, 2], still(320, 420, 1), function (u, d, t) { return paper() + queue(t, .45 + .55 * at(u, 0, d)) + arrow(20, 380, 90, 380, ORANGE, 6, 1); });

// ── 17–19 · you control your own car — the driver behind his windscreen, seen from the front
function cabin(t, face, o) {
  o = o || {}; var s = R(-10, -10, 660, 806, "#cfd9dc", 0);                                         // sky / glare behind
  s += R(190, 300, 260, 360, "#5a5652", 2, 40);                                                   // seat back
  var hip = 640, sc = 1.55, br = (Math.sin(t * 1.5) + 1) / 2, wy = hip - 96 * sc, ax = 64 * sc;
  var turn = o.turn || 0;
  s += PERSON.front({ x: 320, y: hip, s: sc, legs: "sit", outfit: "casual", breath: br, head: { tilt: 2 * Math.sin(t * .9), turn: turn },
    face: Object.assign({ eyes: Math.sin(t * 2.4) > .96 ? .05 : 1 }, face), arms: [{ to: [320 - ax, wy - 18], hand: "fist", bend: -1 }, { to: [320 + ax, wy - 18], hand: "fist", bend: 1 }] }).svg;
  s += '<ellipse cx="320" cy="' + f(wy) + '" rx="' + f(ax + 18) + '" ry="' + f(34) + '" fill="none" stroke="' + INK + '" stroke-width="16"/><ellipse cx="320" cy="' + f(wy) + '" rx="' + f(ax + 18) + '" ry="34" fill="none" stroke="#3d3a37" stroke-width="11"/>';
  s += P("M320 " + f(wy) + " V" + f(wy + 60), "none", 12, ' stroke="#3d3a37"');
  s += '<path d="M150 230 L490 230 L560 600 L80 600 Z" fill="' + Z.GLASS + '" opacity=".2"/>' + P("M190 245 L150 400 M215 245 L185 350", "none", 5, ' stroke="#fff" opacity=".4"');
  s += P("M0 -10 L150 230 L80 600 L0 600 Z M640 -10 L490 230 L560 600 L640 600 Z", "#8aa0ad", 2.4) + R(0, 180, 640, 50, "#8aa0ad", 2.4);   // pillars and roof
  s += R(290, 232, 60, 22, "#3d3a37", 2, 6);                                                     // rear-view mirror
  s += P("M0 600 L640 600 L640 820 L0 820 Z", "#8aa0ad", 2.4) + P("M100 640 Q320 625 540 640", "none", 1.6, ' opacity=".5"');   // bonnet
  return s;
}
shot(17, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "smile", brows: "neutral" }); });
shot([17, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "grin", brows: "neutral" }) + tag("عربيتك", 300, 650, at(u, .2, .3), 28, OLIVE) + check(410, 642, .8, at(u, .6, .4), OLIVE); });
shot(18, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", look: [.8, 0], brows: "raised" }, { turn: .25 }); });
shot([18, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", look: [.8, 0], brows: "worried" }, { turn: .25 }) + G("", T("؟", 470, 330, 110, ORANGE, 800), at(u, .2, .3)); });
shot(19, still(320, 450, 1.4), function (u, d, t) { return paper() + dim(.5, cabin(t, { mouth: "neutral", look: [.8, 0], brows: "worried" }, { turn: .25 }) + T("؟", 470, 330, 110, ORANGE, 800)); });
hud(19, 20, function (u, t) {   // the mid-video bio pill
  var k = pop(clamp(u / .35)); if (k <= 0) return "";
  return G("translate(320 " + f(110 + 4 * Math.sin(t * 3)) + ") scale(" + f(k) + ")", '<rect x="-170" y="-34" width="340" height="68" rx="34" fill="#f2c94c" stroke="' + INK + '" stroke-width="2.4"/>' + T("اللينك في البايو ↑", 0, 12, 32, "#1a1a1a", 900));
});

// ── 20–23 · you don't control the one beside you: he brakes, swerves, or drives a heavy tanker that can't stop quick
var YOU = [LANE(1), 470], NB = [LANE(2), 400];
function nbScene(t, o) {
  o = o || {}; var s = road(t);
  var fb = o.brakeK || 0, sw = o.swerve || 0;
  s += Z.carTop(LANE(1), 250 + 70 * fb, CC[3], 0, { brake: fb > 0 }) + Z.carTop(LANE(0), 380, CC[0]) + Z.carTop(LANE(3), 560, CC[2]);
  s += Z.tankerTop(LANE(3), -80, 0, { ring: o.tring || 0 });
  s += Z.carTop(lerp(NB[0], NB[0] - 60, ease(sw)), NB[1] + 20 * ease(sw), CC[5], -18 * Math.sin(Math.PI * Math.min(1, sw * .8)) - 6 * ease(sw), { ring: o.nring || 0 });
  s += Z.carTop(YOU[0], YOU[1], "#4a6f8a", 0, {});
  return s;
}
shot(20, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t) + label(YOU[0] - 20, YOU[1] + 30, 60, YOU[1] + 190, "انت", BLUE, at(u, .1, .4), 36); });
shot(21, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t, { nring: at(u, .2, .4) }) + label(YOU[0] - 20, YOU[1] + 30, 60, YOU[1] + 190, "انت", BLUE, 1, 36) + label(NB[0] + 26, NB[1] + 20, 590, NB[1] + 180, "اللي جنبك", ORANGE, at(u, .4, .5), 34); });
shot([21, 2], still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t, { nring: 1 }) + faceBox(500, 120, 180, { eyes: 1.3, brows: "raised", mouth: "o" }, at(u, .1, .3)); });
var CN = [300, 400, 1.15];
shot(22, fly(OV, CN, 1.8), function (u, d, t) { return paper() + nbScene(t, { brakeK: at(u, .2, 1.2) }) + G("", T("فرامل فجأة", LANE(1), 150, 24, ORANGE, 800), at(u, .6, .3)); });
shot([22, 1], still(CN[0], CN[1], CN[2]), function (u, d, t) { return paper() + nbScene(t, { brakeK: 1, swerve: at(u, 0, 1.4) }) + arrow(NB[0] + 20, NB[1] - 90, NB[0] - 50, NB[1] - 150, ORANGE, 5, at(u, .2, .4)); });
shot([22, 2], fly(CN, [360, 300, .9], 1.6), function (u, d, t) { return paper() + nbScene(t, { brakeK: 1, swerve: 1, tring: at(u, .4, .4) }) + G("", tag("محمّلة", LANE(3), 180, 1, 22, ORANGE), at(u, .8, .3)); });
// 23 · the stopping distances from the same speed: the loaded tanker needs much longer
shot(23, still(320, 420, 1), function (u, d, t) {
  var s = paper() + R(-400, 300, 1440, 60, Z.ASPH, 2) + R(-400, 600, 1440, 60, Z.ASPH, 2);
  s += Z.carSide(10, 300, 14, "#8aa0ad", {}) + Z.tankerSide(10, 600, 14, {});
  s += '<rect x="73" y="318" width="' + f(250 * at(u, .2, .8)) + '" height="18" fill="' + BLUE + '" opacity=".75"/>' + T("عربية", 620, 200, 30, INK, 800, "start");
  s += '<rect x="241" y="618" width="' + f(390 * at(u, .5, 1.3)) + '" height="18" fill="' + ORANGE + '" opacity=".85"/>' + T("ناقلة محمّلة", 620, 470, 30, INK, 800, "start");
  return s + G("", T("أطول بكتير", 440, 730, 38, ORANGE, 800), at(u, 1.5, .3));
});

// ── 24–26 · «the weave is skill». No. Skill is everyone getting home.
shot(24, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "grin", brows: "raised" }) + tag("شطارة", 320, 650, at(u, .2, .3), 30, INK); });
shot([24, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", brows: "neutral" }) + tag("شطارة", 320, 650, 1, 30, INK) + cross(320, 644, 1.1, at(u, .1, .5)); });
function safeRoad(t, k) {   // every car in its lane with room around it; a ✓ pops on each
  var L = [[0, 180, 0], [0, 600, 3], [1, 380, 1], [2, 120, 2], [2, 560, 4], [3, 300, 5]], s = road(t);
  L.forEach(function (c, i) { s += Z.carTop(LANE(c[0]), c[1], CC[c[2]], 0) + check(LANE(c[0]) + 40, c[1] - 70, .7, at(k, i * .2, .4), OLIVE); });
  return s + Z.carTop(LANE(1), 760, "#4a6f8a", 0) + check(LANE(1) + 40, 690, .7, at(k, 1.3, .4), OLIVE);
}
shot(25, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + safeRoad(t, u); });
shot(26, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + dim(.55, safeRoad(t, 9)) + Z.watch(320, 300, 110, (t * .4) % 1) + G("", T("ثواني", 320, 470, 40, ORANGE, 800), at(u, .5, .3)); });
shot([26, 2], still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, 1) + G("", T("مفيش وقت", 470, 120, 34, BLUE, 800), at(u, .3, .3)); });
shot([26, 3], still(OV[0], OV[1], OV[2]), function (u, d, t) {
  var s = road(t); OTHERS.forEach(function (c, i) { s += Z.carTop(LANE(c[0]), c[1], CC[c[2]], 0, { ring: at(u, i * .15, .4) }); });
  return paper() + s + Z.carTop(LANE(2), 560, "#4a6f8a", 0) + G("", tag("أرواح ملهاش ذنب", 320, 40, 1, 28, ORANGE), at(u, 1.2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
// The hook: one choreographed weave, every move into a real gap. Each car he cuts in front of reacts: it brakes (lights),
// drops back and twitches away (left or right), with a startle mark — never an overlap.
var HK = { A: [1, 380], B: [2, 175], C: [1, -125], D: [3, 60], E: [0, 280], F: [3, 330], G: [0, -60], H: [0, 470] };
var HW = [[0, 350, 640], [1.4, 350, 362], [2.6, 250, 262], [3.4, 250, 62], [4.3, 350, -40], [5.2, 450, -160], [7.4, 450, -420]];
var HR = { A: [1.5, -1, 72], B: [3.75, 1, 56], D: [4.55, 1, 60] };   // reaction start, swerve side, how far it drops back
function hookWeaver(t) { var p = kf(HW, t), q = kf(HW, t + .05); return [p[0], p[1], Math.atan2(q[0] - p[0], -(q[1] - p[1]) + 9) * 57.3]; }
function react(t, r) {   // → {dx, dy, ang, brake, jolt}
  if (!r || t < r[0]) return { dx: 0, dy: 0, ang: 0, brake: false, jolt: 0 };
  var u = t - r[0], out = ease(u / .35) * (1 - ease((u - 1.1) / 1.3)), back = ease(u / 1.2);
  return { dx: r[1] * 20 * out, dy: r[2] * back, ang: r[1] * 9 * out * (u < .5 ? 1 : 1 - ease((u - .5) / .8)), brake: u < 2.4, jolt: u < .9 ? 1 - u / .9 : 0 };
}
function startle(x, y, k) { if (k <= 0) return ""; var s = ""; [-40, -14, 14, 40].forEach(function (a) { var r = a * Math.PI / 180; s += '<path d="M' + f(x + Math.sin(r) * 36) + ' ' + f(y - Math.cos(r) * 36) + ' L' + f(x + Math.sin(r) * (52 + 10 * (1 - k))) + ' ' + f(y - Math.cos(r) * (52 + 10 * (1 - k))) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(k) + '"/>'; }); return s + G("", T("!", x, y - 64, 30, ORANGE, 900), k); }
SCENE.intro = function (svg, t, li) {
  // line 0: the weave, a stopwatch «a few seconds». line 1: only his car ringed. line 2: every car he endangered ringed
  var s = '<clipPath id="ic"><rect x="-30" y="0" width="668" height="660"/></clipPath><g clip-path="url(#ic)"><g transform="translate(4 150)">' + Z.road({ scroll: t * SPEED, y0: -200, y1: 560 });
  Object.keys(HK).forEach(function (k, i) {
    var c = HK[k], r = react(t, HR[k]), x = LANE(c[0]) + r.dx, y = c[1] + r.dy + 3 * Math.sin(t * .9 + i);
    s += Z.carTop(x, y, CC[i % 6], r.ang, { brake: r.brake, ring: li >= 2 ? ease((t - LN[2].start - i * .1) / .3) : 0 }) + startle(x, y - 40, r.jolt);
  });
  var w = hookWeaver(t); s += Z.carTop(w[0], w[1], ORANGE, w[2], { blink: Math.abs(w[2]) > 4 ? (w[2] > 0 ? 1 : -1) : 0, ring: li === 1 ? ease((t - LN[1].start) / .3) : 0 });
  s += '</g></g>';
  if (li === 0) s += G("", Z.watch(562, 64, 38, (t * .6) % 1) + tag("كام ثانية", 556, 140, 1, 18, ORANGE), ease((t - .8) / .3));
  return s;
};
SCENE.bumper = function (u, t) {
  var s = '<g transform="translate(-30 0) scale(.5)">' + Z.road({ scroll: t * SPEED, y0: 0, y1: 400 }) + '</g>';
  var p = (t * .5) % 1; return s + G("translate(0 0) scale(.5)", Z.carTop(250 + 100 * Math.sin(p * 6.283), 250, ORANGE, 20 * Math.cos(p * 6.283)) + Z.carTop(150, 120, CC[1], 0) + Z.carTop(350, 330, CC[2], 0));
};
SCENE.outro = function (svg, u, t) {
  var s = '<g transform="translate(150 -20) scale(.6) rotate(0)"><clipPath id="oc"><rect x="-20" y="0" width="640" height="520"/></clipPath><g clip-path="url(#oc)">' + Z.road({ scroll: t * SPEED, y0: 0, y1: 520 }) +
    Z.carTop(LANE(1), 120, CC[1], 0) + Z.carTop(LANE(1), 440, CC[4], 0) + Z.carTop(LANE(1) + 50 * Math.sin(t * 2), 290, ORANGE, -14 * Math.cos(t * 2)) + Z.carTop(LANE(3), 260, CC[2], 0) + '</g></g>';
  return s + callout("1", 300, 190, ease(u / .3)) + callout("2", 240, 110, ease(u / .3 - .5)) + callout("3", 360, 160, ease(u / .3 - 1));
};
