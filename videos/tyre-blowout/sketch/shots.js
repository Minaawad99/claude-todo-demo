// ── «لو الكاوتش ضرب على الطريق السريع» — drawings in the «اسكتش» hand. Views follow the «طب إزاي؟» references
// (sheet v10: the road and the car from above at an angle; sheet v18: the car in profile and a wheel close-up, the
// dashboard with the steering wheel) and real dimensions (refs/SOURCES.md):
//   car: a compact sedan, 4.5 m long, 1.8 m wide, wheelbase 2.7 m, track 1.55 m (top view 1 m = 62 units);
//   tyre: 205/55 R16 — 205 mm wide, sidewall 113 mm (55 %), rim 16" (406 mm), outside diameter 632 mm;
//   the radial tyre cut: tread, two steel belts, a nylon cap ply, the polyester body ply wrapped round the bead wires,
//   the inner liner, sitting on the rim flanges with the air inside.
// People: the shared person kit (videos/_templates/people/person.js), dressed casual (T-shirt, trousers, shoes).

var TYRE = "#34302b", TYRE2 = "#4a453e", RIM = "#b9b6ad", RIM_D = "#8f8b82", BODYC = "#c9b98f", BODY_D = "#a89870", GLASS = "#b9cdd4",
    ASPH = "#9c968a", ASPH_D = "#8a8478", DESERT = "#e2cf9f", STEEL = "#8d939a", PLY = "#d8b25a", LINER = "#5a534a", HOT = "#d9733f", AIR = "#7fa6bd";
function pts2d(p) { return p.map(function (q, i) { return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" "); }
function spark(x, y, k, n, col) {   // burst lines «طاخ»
  k = clamp(k); if (k <= 0 || k >= 1) return ""; var s = "", r = 18 + 60 * k;
  for (var i = 0; i < (n || 10); i++) { var a = i / (n || 10) * Math.PI * 2 + .2; s += '<path d="M' + f(x + Math.cos(a) * r * .45) + ' ' + f(y + Math.sin(a) * r * .45) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="' + f(6 * (1 - k) + 2) + '" stroke-linecap="round"/>'; }
  return s;
}
function chunkT(i, c) { var l = LN[i], ch = window.CHUNKS[i]; return l.start + (l.end - l.start) * (ch[c] || 0); }

// ── the car from above, nose up. Local units: 1 m = 62. o: {blown: "FL"|"FR"|"RL"|"RR", flap (t), steer (deg),
//    hl: wheel keys to highlight, light: wheel keys drawn light (unloaded), haz (0/1 hazard lights on), brake (0..1 lights)}
var WH = { FL: [-48, -84], FR: [48, -84], RL: [-48, 84], RR: [48, 84] };
function topCar(x, y, ang, o) {
  o = o || {}; var s = "", t = window.__t;
  ["FL", "FR", "RL", "RR"].forEach(function (k) {
    var p = WH[k], st = k[0] === "F" ? (o.steer || 0) : 0, bl = o.blown === k, w = bl ? 19 : 14, h = 40, lt = o.light && o.light.indexOf(k) >= 0;
    var g = R(-w / 2, -h / 2, w, h, bl ? "#5a2a1a" : TYRE, 2, 3);
    for (var j = -16; j <= 16; j += 6) g += '<path d="M' + f(-w / 2 + 2) + ' ' + j + ' h' + f(w - 4) + '" stroke="' + (bl ? ORANGE : TYRE2) + '" stroke-width="1.6"/>';
    if (bl) for (var j2 = 0; j2 < 3; j2++) { var ph = Math.sin(t * 22 + j2 * 2); g += '<path d="M' + f(k[1] === "L" ? -w / 2 : w / 2) + ' ' + f(-10 + j2 * 10) + ' q' + f((k[1] === "L" ? -1 : 1) * (10 + 5 * ph)) + ' ' + f(4 + 3 * ph) + ' ' + f((k[1] === "L" ? -1 : 1) * (14 + 6 * ph)) + ' ' + f(14) + '" stroke="' + TYRE + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
    s += G("translate(" + p[0] + " " + p[1] + ") rotate(" + st + ")", g, lt ? .35 : 1);
    if (o.hl && o.hl.indexOf(k) >= 0) s += '<rect x="' + f(p[0] - 14) + '" y="' + f(p[1] - 26) + '" width="28" height="52" rx="6" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="5 4"/>';
  });
  var body = "M-40 -137 Q0 -142 40 -137 Q54 -132 55 -112 L56 -60 L56 110 Q55 134 40 139 L-40 139 Q-55 134 -56 110 L-56 -60 L-55 -112 Q-54 -132 -40 -137 Z";
  s += '<path d="' + body + '" fill="' + INK + '" opacity=".14" transform="translate(6 8)"/>';
  s += P(body, BODYC, 2.4) + '<path d="' + body + '" fill="url(#hatch)" opacity=".25"/>';
  s += P("M-44 -128 Q0 -133 44 -128", "none", 1.3) + P("M-30 -128 L-26 -50 M30 -128 L26 -50", "none", 1.1);   // hood creases
  s += P("M-46 -48 Q0 -58 46 -48 L40 -14 Q0 -20 -40 -14 Z", GLASS, 2) + '<path d="M-30 -44 l18 -4 M10 -46 l22 -2" stroke="#eef4f4" stroke-width="2.4"/>';   // windscreen
  s += R(-41, -16, 82, 86, "#d6c79f", 2, 10) + P("M-40 70 Q0 76 40 70 L45 96 Q0 102 -45 96 Z", GLASS, 2);   // roof, rear window
  s += P("M-56 -40 l-12 4 l2 10 l10 -2 Z", BODYC, 1.6) + P("M56 -40 l12 4 l-2 10 l-10 -2 Z", BODYC, 1.6);   // mirrors
  s += P("M-50 -132 L-30 -138 L-30 -128 L-48 -124 Z", "#f4efe3", 1.4) + P("M50 -132 L30 -138 L30 -128 L48 -124 Z", "#f4efe3", 1.4);   // headlights
  var bk = o.brake ? .4 + .6 * o.brake : .55, hz = o.haz && Math.floor(t * 2.6) % 2 === 0;
  s += P("M-52 128 L-32 134 L-32 140 L-48 138 Z", hz ? "#f0a028" : ORANGE, 1.4, ' opacity="' + bk + '"') + P("M52 128 L32 134 L32 140 L48 138 Z", hz ? "#f0a028" : ORANGE, 1.4, ' opacity="' + bk + '"');
  if (hz) s += C(-50, -128, 5, "#f0a028", 0) + C(50, -128, 5, "#f0a028", 0);
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ")", s);
}
// the highway from above: asphalt, lane dashes scrolling with speed v (px/s), the edge line, the hard shoulder and desert
function road(t, v, opt) {
  opt = opt || {}; var s = R(-400, -400, 1440, 1600, DESERT, 0) + '<rect x="-400" y="-400" width="1440" height="1600" fill="url(#hatch)" opacity=".25"/>';
  s += R(40, -400, 470, 1600, ASPH, 0) + R(510, -400, 110, 1600, "#b3ac9c", 0) + '<rect x="510" y="-400" width="110" height="1600" fill="url(#hatch)" opacity=".5"/>';
  s += '<path d="M40 -400 V1200 M620 -400 V1200" stroke="' + INK + '" stroke-width="2.4"/><path d="M510 -400 V1200" stroke="#f4efe3" stroke-width="5"/><path d="M48 -400 V1200" stroke="#f4efe3" stroke-width="4"/>';
  var off = (t * (v == null ? 300 : v)) % 90;
  [197, 354].forEach(function (lx) { for (var y = -450 + off; y < 1200; y += 90) s += R(lx - 3, y, 6, 46, "#f4efe3", 0); });
  for (var i = 0; i < 14; i++) { var yy = ((i * 133 + t * (v == null ? 300 : v)) % 1600) - 400; s += C(-60 + 40 * hash(i), yy, 7 + 5 * hash(i + 3), "#c9b585", 1.2); s += C(690 + 50 * hash(i + 9), yy + 60, 6 + 6 * hash(i + 5), "#b8a774", 1.2); }
  if (opt.label) s += G("", T("كتف الطريق", 565, 330, 18, INK, 800), opt.label);
  return s;
}
// a curved dotted path (the car's track)
function track(pts, col, k) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length - 1; i += 2) d += " Q" + f(pts[i][0]) + " " + f(pts[i][1]) + " " + f(pts[i + 1][0]) + " " + f(pts[i + 1][1]); return draw(d, k == null ? 1 : k, col || ORANGE, 4, ' stroke-dasharray="2 10" stroke-linecap="round"'); }

// ── one wheel from the side (sheet v18 close-up): tyre with tread blocks, sidewall, a 5-spoke alloy rim.
//    flat 0..1: the bottom flattens and the sidewall bulges; spin: rotation (deg); shred: tread pieces flapping (t)
function wheelSide(cx, cy, r, o) {
  o = o || {}; var fl = clamp(o.flat || 0), yb = cy + r * (1 - .3 * fl), poly = [], s = "", N2 = 72;
  for (var i = 0; i < N2; i++) { var a = i / N2 * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (y > yb) { var sq = (y - yb) / (r * .3 + .01); x = cx + Math.cos(a) * r * (1 + .22 * fl * clamp(sq * 3)); y = yb; }
    else if (Math.sin(a) > .2) { x = cx + Math.cos(a) * r * (1 + .12 * fl * Math.sin(a)); }
    poly.push([x, y]); }
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(yb + 4) + '" rx="' + f(r * (.6 + .4 * fl)) + '" ry="7" fill="' + INK + '" opacity=".18"/>';
  s += '<path d="' + pts2d(poly) + ' Z" fill="' + (o.hot ? lerp(0, 1, 0) && TYRE : TYRE) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  if (o.hot) s += '<path d="' + pts2d(poly) + ' Z" fill="' + HOT + '" opacity="' + f(.55 * o.hot) + '"/>';
  var sp = (o.spin || 0) * Math.PI / 180;
  for (var j = 0; j < 36; j++) { var b = j / 36 * Math.PI * 2 + sp, p1 = [cx + Math.cos(b) * r * .98, cy + Math.sin(b) * r * .98], p2 = [cx + Math.cos(b) * r * .86, cy + Math.sin(b) * r * .86];
    if (p1[1] > yb - 2) continue; s += '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]) + '" stroke="' + TYRE2 + '" stroke-width="' + f(r * .05) + '"/>'; }
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .8) + '" fill="none" stroke="' + TYRE2 + '" stroke-width="1.6"/>';
  var rr = r * .64; s += C(cx, cy, rr, RIM, 2.4) + C(cx, cy, rr * .86, RIM_D, 1.6);
  for (var k = 0; k < 5; k++) { var c = k / 5 * Math.PI * 2 + sp, d = c + .36, e = c - .36;
    s += '<path d="M' + f(cx + Math.cos(c - .12) * rr * .26) + ' ' + f(cy + Math.sin(c - .12) * rr * .26) + ' L' + f(cx + Math.cos(e) * rr * .84) + ' ' + f(cy + Math.sin(e) * rr * .84) + ' A' + f(rr * .84) + ' ' + f(rr * .84) + ' 0 0 1 ' + f(cx + Math.cos(d) * rr * .84) + ' ' + f(cy + Math.sin(d) * rr * .84) + ' L' + f(cx + Math.cos(c + .12) * rr * .26) + ' ' + f(cy + Math.sin(c + .12) * rr * .26) + ' Z" fill="' + RIM + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
  s += C(cx, cy, rr * .28, "#d3d0c8", 2) + C(cx, cy, rr * .1, INK, 0);
  for (var m = 0; m < 5; m++) { var q = m / 5 * Math.PI * 2 + sp + .63; s += C(cx + Math.cos(q) * rr * .18, cy + Math.sin(q) * rr * .18, rr * .035, INK, 0); }
  if (o.shred) for (var n = 0; n < 4; n++) { var ph = Math.sin(o.shred * 18 + n * 1.7), a0 = Math.PI * (.95 + n * .12);
    var x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r; s += '<path d="M' + f(x0) + ' ' + f(y0) + ' q' + f(-30 - 10 * ph) + ' ' + f(-10 + 14 * ph) + ' ' + f(-50 - 14 * ph) + ' ' + f(8 + 10 * ph) + '" stroke="' + TYRE + '" stroke-width="' + f(r * .07) + '" fill="none" stroke-linecap="round"/>'; }
  return s;
}
function ground(y, x0, x1) { return R(x0 == null ? -400 : x0, y, (x1 == null ? 1040 : x1) - (x0 == null ? -400 : x0), 500, ASPH, 0) + '<path d="M' + (x0 == null ? -400 : x0) + ' ' + y + ' H' + (x1 == null ? 1040 : x1) + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<rect x="-400" y="' + (y + 1) + '" width="1440" height="500" fill="url(#hatch)" opacity=".3"/>'; }
function heatLines(x, y, t, n, col) { var s = ""; for (var i = 0; i < (n || 3); i++) { var xx = x + (i - (n || 3) / 2) * 22, p = (t * .8 + i * .33) % 1; s += '<path d="M' + f(xx) + ' ' + f(y - p * 40) + ' q8 -10 0 -20 q-8 -10 0 -20" stroke="' + (col || HOT) + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; } return s; }

// ── the radial tyre cut across, sitting on the rim, tread on the road (205/55 R16; 1 mm = 1.45 units). air 0..1 inside.
function tyreCut(cx, cy, o) {
  o = o || {}; var s = "", air = o.air == null ? 1 : o.air, t = window.__t;
  var Lh = function (sd) { return function (p) { return [cx + sd * p[0], cy + p[1]]; }; };
  // outer and inner contour of one half (x ≥ 0): bead (top) → sidewall → shoulder → tread centre (bottom)
  var out = [[112, -82], [138, -40], [150, 8], [146, 52], [132, 76], [0, 82]], inn = [[100, -78], [124, -40], [134, 6], [130, 44], [118, 58], [0, 62]];
  function half(arr, sd) { return arr.map(Lh(sd)); }
  var O = half(out, 1).concat(half(out, -1).reverse()), I = half(inn, 1).concat(half(inn, -1).reverse());
  var rubber = pts2d(O) + " Z " + pts2d(I) + " Z";
  // rim (the cut of the wheel): flanges hold the beads, the drop centre in the middle
  s += P("M" + f(cx - 132) + " " + f(cy - 100) + " L" + f(cx - 124) + " " + f(cy - 76) + " L" + f(cx - 104) + " " + f(cy - 84) + " L" + f(cx - 96) + " " + f(cy - 110) + " L" + f(cx - 44) + " " + f(cy - 112) + " L" + f(cx - 34) + " " + f(cy - 140) + " L" + f(cx + 34) + " " + f(cy - 140) + " L" + f(cx + 44) + " " + f(cy - 112) + " L" + f(cx + 96) + " " + f(cy - 110) + " L" + f(cx + 104) + " " + f(cy - 84) + " L" + f(cx + 124) + " " + f(cy - 76) + " L" + f(cx + 132) + " " + f(cy - 100) + " L" + f(cx + 120) + " " + f(cy - 100) + " L" + f(cx + 108) + " " + f(cy - 98) + " L" + f(cx + 42) + " " + f(cy - 126) + " L" + f(cx - 42) + " " + f(cy - 126) + " L" + f(cx - 108) + " " + f(cy - 98) + " L" + f(cx - 120) + " " + f(cy - 100) + " Z", RIM, 2.2);
  // the air
  var id = "air" + (++CLIPN); s += '<clipPath id="' + id + '"><path d="' + pts2d(I) + ' Z M' + f(cx - 100) + ' ' + f(cy - 78) + '"/></clipPath>';
  if (air > 0) { s += '<path d="' + pts2d(I) + ' Z" fill="' + AIR + '" opacity="' + f(.22 * air) + '"/>';
    for (var i = 0; i < 30; i++) { if (hash(i + 2) > air) continue; var ax = cx + (hash(i) - .5) * 220, ay = cy - 50 + hash(i + 7) * 100 + 5 * Math.sin(t * 3 + i); s += '<circle cx="' + f(ax + 4 * Math.cos(t * 2.4 + i)) + '" cy="' + f(ay) + '" r="4" fill="' + AIR + '" clip-path="url(#' + id + ')"/>'; } }
  s += '<path d="' + rubber + '" fill="' + TYRE2 + '" fill-rule="evenodd" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  // tread grooves (4 main channels)
  [-84, -30, 30, 84].forEach(function (gx) { s += R(cx + gx - 6, cy + 70, 12, 13, PAPER, 1.6, 2); });
  var hl = o.hl || "";
  // inner liner along the inside
  s += '<path d="' + pts2d(I) + ' Z" fill="none" stroke="' + LINER + '" stroke-width="4"/>';
  // body ply: one cord line bead to bead, wrapped round the bead wires
  var ply = [[-104, -70], [-128, -36], [-139, 6], [-136, 46], [-124, 66], [0, 70], [124, 66], [136, 46], [139, 6], [128, -36], [104, -70]].map(function (p) { return [cx + p[0], cy + p[1]]; });
  s += '<path d="' + pts2d(ply) + '" fill="none" stroke="' + (hl === "ply" ? ORANGE : PLY) + '" stroke-width="' + (hl === "ply" ? 5 : 3.4) + '" stroke-dasharray="7 3"/>';
  // two steel belts and the cap ply under the tread
  s += '<path d="M' + f(cx - 118) + ' ' + f(cy + 64) + ' H' + f(cx + 118) + '" stroke="' + (hl === "steel" ? ORANGE : STEEL) + '" stroke-width="' + (hl === "steel" ? 5 : 4) + '"/>' +
       '<path d="M' + f(cx - 108) + ' ' + f(cy + 58) + ' H' + f(cx + 108) + '" stroke="' + (hl === "steel" ? ORANGE : STEEL) + '" stroke-width="' + (hl === "steel" ? 5 : 4) + '"/>' +
       '<path d="M' + f(cx - 120) + ' ' + f(cy + 69) + ' H' + f(cx + 120) + '" stroke="#e8e1cf" stroke-width="1.6" stroke-dasharray="3 3"/>';
  // bead wires: bundles of steel wire in the tyre's foot
  [-1, 1].forEach(function (sd) { for (var a = 0; a < 3; a++) for (var b = 0; b < 2; b++) s += C(cx + sd * (106 + a * 6), cy - 66 + b * 7, 3, STEEL, 1); });
  return s;
}

// ── the driver in profile in his seat, with pedals and the steering wheel (car interior cut, sheet v18).
//    o: {x, y (seat point), s, foot: "gas"|"brake"|"up", press 0..1, face, grip}. Faces right (the car's front).
function cockpit(o) {
  var s = "", t = window.__t, sc = o.s || 1, X = o.x, Y = o.y;
  var floorY = Y + 150 * sc;
  // floor and firewall
  s += P("M" + f(X - 160 * sc) + " " + f(floorY) + " L" + f(X + 230 * sc) + " " + f(floorY) + " L" + f(X + 290 * sc) + " " + f(floorY - 70 * sc) + " L" + f(X + 300 * sc) + " " + f(floorY - 200 * sc) + " L" + f(X + 400 * sc) + " " + f(floorY - 200 * sc) + " L" + f(X + 400 * sc) + " " + f(floorY + 60 * sc) + " L" + f(X - 160 * sc) + " " + f(floorY + 60 * sc) + " Z", "#8a8174", 2.2);
  // seat: cushion and back
  s += P("M" + f(X - 60 * sc) + " " + f(Y + 8 * sc) + " L" + f(X + 60 * sc) + " " + f(Y - 2 * sc) + " L" + f(X + 64 * sc) + " " + f(Y + 26 * sc) + " L" + f(X - 50 * sc) + " " + f(Y + 40 * sc) + " Z", "#6e675c", 2) +
       P("M" + f(X - 62 * sc) + " " + f(Y + 14 * sc) + " L" + f(X - 96 * sc) + " " + f(Y - 190 * sc) + " Q" + f(X - 84 * sc) + " " + f(Y - 204 * sc) + " " + f(X - 70 * sc) + " " + f(Y - 192 * sc) + " L" + f(X - 36 * sc) + " " + f(Y + 4 * sc) + " Z", "#6e675c", 2) +
       R(X - 104 * sc, Y - 250 * sc, 34 * sc, 52 * sc, "#6e675c", 2, 8) + P("M" + f(X - 50 * sc) + " " + f(Y + 40 * sc) + " L" + f(X - 40 * sc) + " " + f(floorY) + " M" + f(X + 40 * sc) + " " + f(Y + 30 * sc) + " L" + f(X + 46 * sc) + " " + f(floorY), "none", 4);
  // the person: seated, leaning back a little, both hands forward on the wheel, the right foot on the chosen pedal
  var press = clamp(o.press || 0);
  var leg0 = o.foot === "brake" ? { hip: 74, knee: 48 - 6 * press, ankle: -4 + 8 * press } : o.foot === "up" ? { hip: 72, knee: 40, ankle: -14 } : { hip: 76, knee: 44 - 6 * press, ankle: -6 + 14 * press };
  var P1 = PERSON.side({ x: X, y: Y - 16 * sc, s: sc, dir: 1, lean: -12, outfit: "casual", breath: (Math.sin(t * 1.8) + 1) / 2,
    legs: [leg0, { hip: 80, knee: 56, ankle: 4 }], arms: [{ sh: 72, el: 24, wrist: -10 }, { sh: 68, el: 26, wrist: -10 }],
    face: o.face || { eyes: 1, brows: "neutral", mouth: "neutral" }, head: { tilt: 0 } });
  var J1 = P1.joints, ball = [lerp(J1.heel[0], J1.toe[0], .72), lerp(J1.heel[1], J1.toe[1], .72)];
  // pedals: the pressed one sits under the ball of the foot; brake = a hanging pad, gas = a floor-hinged pad
  var bAt = o.foot === "gas" ? [ball[0] - 18 * sc, ball[1] - 40 * sc] : ball, gAt = o.foot === "gas" ? ball : [ball[0] + 22 * sc, ball[1] + 34 * sc];
  var pedal = function (at, kind) { var hl = o.hlPedal === kind, col = hl ? (kind === "brake" ? ORANGE : OLIVE) : "#4c463e";
    return kind === "brake" ? P("M" + f(at[0] + 46 * sc) + " " + f(at[1] - 96 * sc) + " L" + f(at[0] + 8 * sc) + " " + f(at[1]), "none", 5 * sc) + G("rotate(-28 " + f(at[0]) + " " + f(at[1]) + ")", R(at[0] - 6 * sc, at[1] - 16 * sc, 12 * sc, 32 * sc, col, 2, 3))
      : P("M" + f(at[0] + 18 * sc) + " " + f(floorY) + " L" + f(at[0] + 4 * sc) + " " + f(at[1] - 30 * sc) + " L" + f(at[0] - 8 * sc) + " " + f(at[1] - 26 * sc) + " L" + f(at[0] + 8 * sc) + " " + f(floorY) + " Z", col, 2); };
  s += pedal(bAt, "brake") + pedal(gAt, "gas") + P1.svg;
  // the steering wheel (edge-on: a tilted ellipse) where the hands are, its column to the dashboard
  var wc = [J1.wrist[0] + 14 * sc, J1.wrist[1] - 6 * sc];
  s += P("M" + f(wc[0]) + " " + f(wc[1]) + " L" + f(X + 300 * sc) + " " + f(Y - 40 * sc), "none", 9 * sc) + '<ellipse cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" rx="' + f(10 * sc) + '" ry="' + f(54 * sc) + '" transform="rotate(-22 ' + f(wc[0]) + ' ' + f(wc[1]) + ')" fill="none" stroke="' + INK + '" stroke-width="' + f(9 * sc) + '"/>';
  s += P("M" + f(X + 290 * sc) + " " + f(Y - 30 * sc) + " L" + f(X + 300 * sc) + " " + f(Y - 110 * sc) + " L" + f(X + 420 * sc) + " " + f(Y - 130 * sc) + " L" + f(X + 420 * sc) + " " + f(Y - 20 * sc) + " Z", "#7c7468", 2);   // dashboard
  return { svg: s, joints: P1.joints, floorY: floorY };
}

// ── the driver from the front, both hands on the wheel (person kit, front view), seat and the wheel rim before him
function driverFront(cx, cy, s, t, o) {
  o = o || {}; var rot = o.wheelRot || 0, wc = [cx, cy - 12 * s], wr = 68 * s;
  var a1 = (200 + rot) * Math.PI / 180, a2 = (-20 + rot) * Math.PI / 180;   // hands at about 9 and 3 o'clock
  var hL = [wc[0] + Math.cos(a1) * wr, wc[1] + Math.sin(a1) * wr], hR = [wc[0] + Math.cos(a2) * wr, wc[1] + Math.sin(a2) * wr];
  var str = R(cx - 150 * s, cy - 340 * s, 300 * s, 360 * s, "#6e675c", 2.4, 26) + R(cx - 70 * s, cy - 420 * s, 140 * s, 80 * s, "#6e675c", 2.4, 18);
  var Pf = PERSON.front({ x: cx, y: cy + 40 * s, s: s, legs: "sit", outfit: "casual", breath: (Math.sin(t * 2.2) + 1) / 2,
    head: { tilt: o.tilt || 0 }, face: o.face || { eyes: 1.1, brows: "angry", mouth: "neutral", look: [0, 0] },
    arms: [{ to: hL, bend: 1, hand: "fist", rot: 90 }, { to: hR, bend: -1, hand: "fist", rot: 90 }] });
  var wheel = '<circle cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" r="' + f(wr) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(17 * s) + '"/><circle cx="' + f(wc[0]) + '" cy="' + f(wc[1]) + '" r="' + f(wr) + '" fill="none" stroke="#3e3a34" stroke-width="' + f(12 * s) + '"/>';
  var spokes = G("rotate(" + f(rot) + " " + f(wc[0]) + " " + f(wc[1]) + ")", P("M" + f(wc[0] - wr) + " " + f(wc[1] + 4 * s) + " Q" + f(wc[0]) + " " + f(wc[1] + 30 * s) + " " + f(wc[0] + wr) + " " + f(wc[1] + 4 * s), "none", 12 * s) + P("M" + f(wc[0]) + " " + f(wc[1] + 20 * s) + " L" + f(wc[0]) + " " + f(wc[1] + wr), "none", 12 * s) + '<ellipse cx="' + f(wc[0]) + '" cy="' + f(wc[1] + 10 * s) + '" rx="' + f(30 * s) + '" ry="' + f(24 * s) + '" fill="#3e3a34" stroke="' + INK + '" stroke-width="2"/>');
  // the hands go over the rim: draw wheel, then the person's arms on top — so wheel first, person after, then re-draw a rim segment under the fingers is skipped (fists wrap it)
  // person first, then the wheel over the body, then the fists again on top so they wrap the rim
  var fists = ""; [0, 1].forEach(function (i) { var w = Pf.joints.wr[i], e = Pf.joints.el[i]; fists += PERSON.hand(w, Math.atan2(w[1] - e[1], w[0] - e[0]), "fist", i ? -1 : 1, s); });
  return str + Pf.svg + wheel + spokes + fists;
}

// ── speedometer: 0–200 km/h, the needle at v
function speedo(cx, cy, r, v, hl) {
  var s = C(cx, cy, r + 8, "#3e3a34", 2.4) + C(cx, cy, r, "#f4ecdb", 2);
  for (var k = 0; k <= 20; k++) { var a = (-225 + k * 13.5) * Math.PI / 180, l = k % 2 ? .1 : .18; s += '<path d="M' + f(cx + Math.cos(a) * r * .92) + ' ' + f(cy + Math.sin(a) * r * .92) + ' L' + f(cx + Math.cos(a) * r * (.92 - l)) + ' ' + f(cy + Math.sin(a) * r * (.92 - l)) + '" stroke="' + INK + '" stroke-width="' + (k % 2 ? 1.6 : 3) + '"/>';
    if (k % 4 === 0) s += N(String(k * 10), cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6 + r * .07, r * .17, INK); }
  if (hl != null) { var a0 = (-225 + hl * 1.35) * Math.PI / 180; s += '<path d="M' + f(cx + Math.cos(a0) * r * .95) + ' ' + f(cy + Math.sin(a0) * r * .95) + ' A' + f(r * .95) + ' ' + f(r * .95) + ' 0 0 0 ' + f(cx + Math.cos(-225 * Math.PI / 180) * r * .95) + ' ' + f(cy + Math.sin(-225 * Math.PI / 180) * r * .95) + '" stroke="' + OLIVE + '" stroke-width="6" fill="none" opacity=".7"/>'; }
  var a = (-225 + v * 1.35) * Math.PI / 180;
  s += '<path d="M' + f(cx - Math.cos(a) * r * .12) + ' ' + f(cy - Math.sin(a) * r * .12) + ' L' + f(cx + Math.cos(a) * r * .8) + ' ' + f(cy + Math.sin(a) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="' + f(r * .06) + '" stroke-linecap="round"/>' + C(cx, cy, r * .08, INK, 0);
  return s + T("كم/س", cx, cy + r * .5, r * .14, MUTE, 700);
}
// the hazard-light button: a red triangle on a dark key, blinking when on
function hazard(x, y, sc, on) { var lit = on && Math.floor(window.__t * 2.6) % 2 === 0;
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", R(-40, -32, 80, 64, "#3e3a34", 2.4, 10) + P("M0 -20 L20 14 L-20 14 Z", "none", 0, ' stroke="' + (lit ? "#ff5a3a" : "#c24a33") + '" stroke-width="6"') + P("M0 -8 L9 7 L-9 7 Z", "none", 0, ' stroke="' + (lit ? "#ff5a3a" : "#c24a33") + '" stroke-width="3"') + (lit ? '<rect x="-46" y="-38" width="92" height="76" rx="14" fill="none" stroke="#f0a028" stroke-width="4" opacity=".7"/>' : "")); }
// a supermarket trolley from above at an angle: basket grid, handle, four castor wheels (one stuck, orange)
function trolley(x, y, ang, sc, t) {
  var s = P("M-46 -70 L46 -70 L40 60 L-40 60 Z", "#d9d5cb", 2.4);
  for (var i = -36; i <= 36; i += 12) s += '<path d="M' + i + ' -66 L' + f(i * .87) + ' 56" stroke="' + MUTE + '" stroke-width="1.4"/>';
  for (var j = -56; j <= 50; j += 14) s += '<path d="M' + f(-45 + (j + 70) * .045) + ' ' + j + ' H' + f(45 - (j + 70) * .045) + '" stroke="' + MUTE + '" stroke-width="1.4"/>';
  s += R(-52, 66, 104, 10, ORANGE, 2, 5) + P("M-40 60 L-50 70 M40 60 L50 70", "none", 2.4);
  [[-42, -62, 0], [42, -62, 0], [-36, 52, 1], [36, 52, 0]].forEach(function (w) { s += G("translate(" + w[0] + " " + w[1] + ") rotate(" + (w[2] ? 30 : 8 * Math.sin(t * 6)) + ")", R(-5, -9, 10, 18, w[2] ? ORANGE : TYRE, 1.6, 3)); });
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + sc + ")", s);
}
// the car in profile (front to the right), body pitched by `pitch` (deg, + = nose down) about the middle; wheels stay on the ground.
var SIDE_P = "M540 -42 L540 -80 Q536 -97 510 -101 L390 -114 L314 -170 Q300 -175 278 -175 L162 -173 L88 -124 L20 -119 Q0 -117 0 -96 L0 -44 L70 -42 A46 46 0 0 1 162 -42 L394 -42 A46 46 0 0 1 486 -42 Z";
function sideCar(x, y, o) {
  o = o || {}; var p = o.pitch || 0, g = "";
  g += P(SIDE_P, BODYC, 2.6) + '<path d="' + SIDE_P + '" fill="url(#hatch)" opacity=".3"/>' +
       P("M376 -120 L308 -162 L244 -162 L244 -120 Z", GLASS, 2.2) + P("M234 -120 L234 -162 L168 -162 L104 -124 L104 -120 Z", GLASS, 2.2) + R(234, -164, 10, 120, BODYC, 2) +
       '<path d="M384 -118 L388 -48 M244 -118 L244 -46 M96 -122 L100 -60" stroke="' + INK + '" stroke-width="1.8"/>' + R(266, -100, 22, 6, INK, 0, 3) + R(122, -100, 22, 6, INK, 0, 3) +
       P("M536 -86 L516 -94 L514 -84 L534 -80 Z", "#f4efe3", 1.4) + R(0, -110, 12, 16, ORANGE, 1.4, 0, o.brake ? ' opacity="1"' : ' opacity=".6"');
  var body = G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(p) + " 270 -90) translate(-270 0)", g);
  var w = wheelSide(x + 440 - 270, y - 38, 38, { spin: o.spin || 0, flat: o.flatF || 0 }) + wheelSide(x + 116 - 270, y - 38, 38, { spin: o.spin || 0, flat: o.flatR || 0 });
  return body + w;
}
// the sidewall text: a curved band of the tyre with «DOT … 2321» and the date boxed
function sidewall(cx, cy, r, k, t) {
  var s = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + TYRE + '" stroke="' + INK + '" stroke-width="3"/>' + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .7) + '" fill="' + TYRE2 + '" stroke="' + INK + '" stroke-width="2"/>' + C(cx, cy, r * .52, RIM, 2.4);
  for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2; s += '<path d="M' + f(cx + Math.cos(a) * r * .97) + ' ' + f(cy + Math.sin(a) * r * .97) + ' L' + f(cx + Math.cos(a) * r * .9) + ' ' + f(cy + Math.sin(a) * r * .9) + '" stroke="' + TYRE2 + '" stroke-width="6"/>'; }
  var id = "sw" + (++CLIPN);
  s += '<path id="' + id + '" d="M' + f(cx - r * .82) + ' ' + f(cy) + ' A' + f(r * .82) + ' ' + f(r * .82) + ' 0 0 1 ' + f(cx + r * .82) + ' ' + f(cy) + '" fill="none"/>';
  s += '<text style="font:800 ' + f(r * .085) + 'px Noto Serif;fill:#cfc9bc;letter-spacing:1px;direction:ltr"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">205/55 R16 91V   DOT  U2LL  LMLR  2321</textPath></text>';
  return s;
}

// ── shots (line numbers from script.txt). World 640 × 786.
// 4 · «طب إيه اللي حصل للكاوتش؟»: the blown wheel close up, a question mark
shot(4, push(300, 420, 1.0, 1.12), function (u, d, t) {
  return paper() + ground(600) + wheelSide(300, 420, 180, { flat: .9, shred: t, spin: 0 }) + G("", T("؟", 520, 260, 140, ORANGE, 800), at(u, .3, .3));
});
// 5 · inside: cords of steel and fabric holding compressed air; the air carries the car
shot(5, push(320, 420, 1.35, 1.42), function (u, d, t) {
  var c = window.CHUNKS[5], D = LN[5].end - LN[5].start, hl = u < D * (c[1] || .4) ? (u < D * (c[1] || .4) * .5 ? "steel" : "ply") : "";
  var s = paper() + ground(504, 100, 540) + tyreCut(320, 420, { hl: hl });
  s += label(300, 484, 250, 600, "سلك صلب", OLIVE, at(u, .3, .5), 22) + label(458, 440, 462, 560, "قماش", OLIVE, at(u, 1.0, .5), 22);
  s += label(260, 400, 230, 240, "هوا مضغوط", BLUE, at(u, D * (c[1] || .4), .5), 22) + label(360, 290, 400, 220, "الجنط", INK, at(u, D * (c[1] || .4) + .6, .5), 22);
  if (u > D * (c[2] || .7)) for (var i = 0; i < 4; i++) s += arrow(220 + i * 60, 470, 220 + i * 60, 400 - 8 * Math.sin(t * 4 + i), BLUE, 5, at(u, D * (c[2] || .7), .4));
  return s;
}, { tr: "in" });
// 6a · the air rushes out: the cut tyre empties and squashes onto the road
shot(6, push(320, 440, 1.5, 1.6), function (u, d, t) {
  var k = at(u, .2, 1.4), s = paper() + ground(504 - 20 * k, 100, 540) + tyreCut(320, 420 + 30 * k, { air: 1 - k });
  for (var i = 0; i < 6; i++) { var p = ((t * 1.6 + i / 6) % 1); s += G("", '<path d="M' + f(180 - p * 160) + ' ' + f(380 + i * 10) + ' q-14 -8 -28 0" stroke="' + AIR + '" stroke-width="4" fill="none" stroke-linecap="round"/>', (1 - p) * (1 - k * .6)); }
  return s + G("", T("الهوا بيطلع", 320, 230, 28, BLUE, 800), at(u, .3, .3));
});
// 6b · flattened on the ground: like a brake working on one corner only
shot([6, 1], push(310, 470, 1.2, 1.3), function (u, d, t) {
  var k = at(u, 0, .8);
  return paper() + ground(560) + wheelSide(310, 410, 150, { flat: k, spin: t * 260 * (1 - k * .7) }) + measure(160, 610, 460, 610, at(u, .9, .7), "", 0) + G("", T("بيتفرطح على الأرض", 310, 680, 24, ORANGE, 800), at(u, 1.1, .3));
});
shot([6, 2], push(290, 400, 1.45, 1.55), function (u, d, t) {
  var s = paper() + road(t, 260) + topCar(276, 420, 0, { blown: "FL", hl: ["FL"] });
  s += arrow(228, 300, 228, 380 + 40, ORANGE, 0, 0);
  for (var i = 0; i < 3; i++) s += arrow(228, 360 - i * 14, 228, 420 + 8 * Math.sin(t * 6 + i) - i * 14, ORANGE, 5, at(u, .3, .4));
  return s + tag("فرملة", 170, 260, at(u, .5, .3), 26, ORANGE) + iconBox(420, 230, 90, '<circle r="30" fill="#3e3a34" stroke="' + INK + '" stroke-width="2"/><path d="M-36 34 L36 34" stroke="' + INK + '" stroke-width="3"/>' + R(-10, -6, 20, 30, ORANGE, 2, 2), at(u, .8, .3));
});
// 7 · that is why the car pulls toward the blown side
shot(7, push(290, 420, 1.35, 1.3), function (u, d, t) {
  var k = at(u, .2, d - .3), ang = -16 * k, x = 300 - 70 * k * k, y = 470 - 60 * k;
  return paper() + road(t, 260) + track([[300, 760], [300, 620], [300 - 10 * k, 560], [300 - 40 * k, 500], [x, y + 40]], ORANGE, k) + topCar(x, y, ang, { blown: "FL", flap: t }) +
    arrow(300 - 30, 250, 300 - 120, 250, ORANGE, 6, at(u, .4, .4)) + G("", T("بتشد", 200, 220, 30, ORANGE, 800), at(u, .5, .3));
}, { tr: "out" });
// 8 · like a supermarket trolley with a stuck wheel
shot(8, push(300, 440, 1.3, 1.4), function (u, d, t) {
  var k = at(u, .5, d - .6), x = 340 - 90 * k * k, y = 580 - 200 * k, s = paper();
  for (var i = 0; i < 8; i++) s += '<path d="M-200 ' + (180 + i * 90) + ' H900" stroke="#d6ccb4" stroke-width="2"/>';
  s += track([[360, 700], [360, 620], [350, 500], [330, 420], [x, y]], ORANGE, k) + trolley(x, y, -38 * k, 1.5, t);
  s += label(x - 36 * 1.5, y + 52 * 1.5, x - 24, y + 150, "عجلة عالقة", ORANGE, at(u, .4, .5), 24);
  return s + iconBox(470, 210, 110, G("scale(.38)", topCar(0, 0, -14, { blown: "FL" })), at(u, .2, .3));
});
// 9 · «طب ليه الفرامل غلط؟»: the driver's foot over the brake
shot(9, push(440, 470, 1.5, 1.6), function (u, d, t) {
  var ck = cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: 0, hlPedal: "brake", face: { eyes: 1.2, brows: "worried", mouth: "o" } });
  return paper() + ck.svg + G("", T("؟", 560, 400, 90, ORANGE, 800), at(u, .3, .3));
}, { tr: "in" });
// 10 · brake hard and the weight is thrown forward: the nose dives
shot(10, push(320, 400, 1.2, 1.26), function (u, d, t) {
  var k = at(u, .6, .8), s = paper() + ground(470) + sideCar(320, 470, { pitch: 4 * k, brake: k, spin: t * 300 * (1 - k) });
  var cg = [lerp(300, 380, k), 400 + 8 * k];
  s += C(cg[0], cg[1], 12, ORANGE, 2.4) + arrow(cg[0], cg[1], cg[0] + 10, cg[1] + 90, ORANGE, 5, at(u, .3, .3)) + arrow(250, 300, 450, 300, ORANGE, 7, at(u, .9, .5));
  return s + G("", T("الوزن لقدام", 350, 270, 28, ORANGE, 800), at(u, 1, .3)) + label(470, 450, 540, 560, "قدام", OLIVE, at(u, 1.3, .4), 22);
});
// 11 · front tyre blown: the pull grows, the wheel is torn from your hands
shot(11, push(300, 380, 1.3, 1.36), function (u, d, t) {
  var k = at(u, .4, d - .4), s = paper() + road(t, 200 * (1 - k * .5));
  s += topCar(320 - 40 * k * k, 470 - 30 * k, -28 * k, { blown: "FL", brake: 1, steer: -20 * k, hl: ["FL", "FR"] });
  for (var i = 0; i < 2; i++) s += arrow(270 + i * 100, 300, 270 + i * 100, 340, ORANGE, 6, 1);
  s += arrow(250, 230, 120, 230, ORANGE, 9, at(u, .6, .4)) + G("", T("الشدة بتزيد", 180, 196, 26, ORANGE, 800), at(u, .7, .3));
  var rot = -70 * at(u, 1.6, 1.2) + 6 * Math.sin(t * 20) * at(u, 1.6, .5);
  return s + inset(470, 200, 80, G("scale(.55) translate(0 40)", '<circle r="120" fill="none" stroke="#3e3a34" stroke-width="18"/>' + G("rotate(" + f(rot) + ")", P("M-120 4 Q0 40 120 4 M0 24 L0 120", "none", 16) + '<ellipse cy="10" rx="36" ry="28" fill="#3e3a34"/>')), at(u, 1.3, .3));
});
// 12 · rear tyre blown: the back goes light and the car can spin round
shot(12, push(320, 410, 1.3, 1.3), function (u, d, t) {
  var k = at(u, 1, d - 1.2), s = paper() + road(t, 220 * (1 - k * .6));
  s += topCar(320 + 30 * k, 430, 140 * k * k, { blown: "RL", brake: 1, light: ["RL", "RR"] });
  s += label(372, 520, 520, 650, "الورا خفيف", BLUE, at(u, .3, .5) * (1 - k), 24);
  s += draw("M470 300 A170 170 0 0 1 470 620", at(u, 1.2, .8), ORANGE, 6) + (k > .3 ? arrow(470, 600, 450, 630, ORANGE, 6, 1) : "");
  return s + cross(200, 260, 1.2, at(u, d - 1, .4));
});
// 13 · «طب أعمل إيه؟ أربع حاجات بالترتيب»
function steps4(x, y, on, cur, sc) {
  var names = ["امسك", "دوغري", "البنزين", "فرامل"], s = "";
  names.forEach(function (n, i) { var cx = x + (1.5 - i) * 140 * (sc || 1), lit = i < on, c = i === cur;
    s += G("translate(" + f(cx) + " " + y + ") scale(" + (sc || 1) * (c ? 1.1 : 1) + ")", '<rect x="-62" y="-46" width="124" height="92" rx="10" fill="' + (c ? ORANGE : lit ? "#f4ecdb" : PAPER) + '" stroke="' + INK + '" stroke-width="2.2"/>' + N(String(i + 1), 0, -6, 34, c ? "#fff" : INK) + T(n, 0, 32, 22, c ? "#fff" : INK, 800)); });
  return s;
}
shot(13, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[13], D = LN[13].end - LN[13].start, on = 0;
  for (var i = 0; i < 4; i++) if (u > D * (c[1] || .4) + i * .35) on = i + 1;
  return paper() + road(t, 260) + topCar(320, 520, 0, { blown: "FL" }) + G("", R(-10, 120, 660, 150, PAPER, 0), on ? 1 : 0) + steps4(320, 200, on, on - 1, 1);
});
hud(14, 18, function (u, t) { var li = 14; for (var i = 14; i < 18; i++) if (startOf(i) <= t) li = i; return G("translate(0 0)", R(0, 0, 640, 112, PAPER, 0) + steps4(320, 58, li - 13, li - 14, .7)); });
// 14 · both hands on the wheel, firmly
shot(14, push(320, 560, 1.55, 1.7), function (u, d, t) {
  var g = at(u, .3, .5);
  return paper() + R(-200, 620, 1040, 400, "#7c7468", 2.4) + driverFront(320, 640, 1.0, t, { wheelRot: 3 * Math.sin(t * 7) * (1 - g * .7), face: { eyes: 1.15, brows: "angry", mouth: "neutral" } }) +
    tag("الإيدين الاتنين", 320, 740, at(u, .6, .3), 24, ORANGE) + tag("جامد", 320, 360, at(u, 1.2, .3), 26, ORANGE);
}, { tr: "in" });
// 15 · keep straight, no sharp turns of the wheel
shot(15, push(320, 470, 1.3, 1.36), function (u, d, t) {
  var wob = 4 * Math.sin(t * 2.2), s = paper() + road(t, 240);
  s += track([[276, 780], [276, 680], [278, 600], [280, 540], [276, 520]], OLIVE, at(u, .2, .8)) + topCar(276 + wob * .6, 470, -wob * .5, { blown: "FL", steer: 2 * Math.sin(t * 2.2) });
  s += draw("M430 760 Q560 650 420 560 Q300 470 470 380", at(u, 1.2, .6), ORANGE, 4) + cross(470, 560, .9, at(u, 1.8, .3));
  return s + check(160, 300, 1.4, at(u, .9, .4), OLIVE) + G("", T("دوغري", 160, 380, 28, OLIVE, 800), at(u, .9, .3));
});
// 16 · foot off the gas, slowly; the car slows by itself
shot(16, push(400, 430, 1.2, 1.3), function (u, d, t) {
  var k = at(u, .4, d - .6), v = lerp(120, 70, k);
  var ck = cockpit({ x: 220, y: 420, s: 1, foot: "gas", press: 1 - k, hlPedal: "gas", face: { eyes: 1, brows: "worried", mouth: "neutral" } });
  return paper() + ck.svg + G("translate(480 330)", speedo(0, 0, 66, v)) + tag("بالراحة", 480, 440, at(u, .8, .3), 24, ORANGE);
});
// 17 · at about 50: only then brake gently, hazard lights on, out to the shoulder
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var v = lerp(70, 50, at(u, 0, 1));
  return paper() + speedo(320, 360, 170, v, 50) + G("", numBox("50", 320, 640, 1, 60), at(u, .8, .3));
});
shot([17, 1], push(440, 470, 1.6, 1.7), function (u, d, t) {
  var p = .3 + .1 * Math.sin(t * 3);
  return paper() + cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: p, hlPedal: "brake", face: { eyes: 1, brows: "neutral", mouth: "neutral" } }).svg + tag("خفيف", 330, 600, at(u, .3, .3), 30, ORANGE);
}, { tr: "in" });
shot([17, 2], push(400, 420, 1.15, 1.2), function (u, d, t) {
  var k = at(u, 1.0, d - 1.0), x = lerp(276, 565, k), ang = 22 * Math.sin(k * Math.PI);
  return paper() + road(t, 160 * (1 - k * .8), { label: at(u, .6, .4) }) + track([[276, 780], [276, 640], [300, 560], [420, 520], [x, 470]], OLIVE, k) + topCar(x, 470 - 40 * k, ang, { blown: "FL", haz: 1, brake: .5 }) + inset(300, 260, 66, hazard(0, 0, 1.1, u > .3), at(u, .1, .3)) + tag("الفلاشر", 300, 370, at(u, .4, .3), 24, ORANGE);
});
// 18 · the myth: let air out in summer so the heat won't burst it — no
shot(18, push(330, 400, 1.2, 1.3), function (u, d, t) {
  var press = Math.abs(Math.sin(t * 2.2)) > .35;
  var s = paper() + sun(560, 90, 54, t) + ground(640) + wheelSide(300, 470, 170, { spin: 0 });
  var vx = 300 + 128, vy = 470 - 60;   // the valve stem on the rim
  s += R(vx - 6, vy - 26, 12, 30, INK, 1.6, 3);
  for (var i = 0; i < 3; i++) { var p = (t * 1.4 + i / 3) % 1; s += G("", '<path d="M' + f(vx + 14 + p * 50) + ' ' + f(vy - 30 - p * 30) + ' q10 -6 20 0" stroke="' + AIR + '" stroke-width="4" fill="none" stroke-linecap="round"/>', 1 - p); }
  s += G("translate(" + f(vx + 4) + " " + f(vy - 40 + (press ? 4 : 0)) + ") rotate(200) scale(1.6)", PERSON.hand([0, 0], 0, "point", 1, 1) );
  s += G("translate(120 190)", R(-14, -80, 28, 120, "#f4ecdb", 2, 12) + R(-8, -60, 16, 96, HOT, 0, 6) + C(0, 44, 20, HOT, 2) + T("45°", 0, 92, 24, ORANGE, 800));
  return s + cross(320, 260, 1.6, at(u, d - 1, .4));
});
// 19 · a tyre low on air bends more as it rolls, heats up inside: that is what bursts it
shot(19, push(320, 440, 1.2, 1.26), function (u, d, t) {
  var k = at(u, .5, d - 1), s = paper() + ground(580);
  s += wheelSide(170, 470, 110, { spin: t * 200 }) + wheelSide(470, 470 + 14, 110, { spin: t * 200, flat: .55 + .1 * Math.sin(t * 12), hot: k });
  s += T("هوا مظبوط", 170, 660, 22, OLIVE, 800) + T("هوا ناقص", 470, 660, 22, BLUE, 800) + check(170, 300, 1.1, at(u, .3, .4), OLIVE);
  return s + heatLines(470, 330, t, 3) + label(420, 560, 380, 700, "بيتني", ORANGE, at(u, .8, .4), 24) + G("", T("بيسخن", 470, 250, 30, ORANGE, 800), at(u, 1.6, .3));
});
// 20 · check the pressure cold, in the morning, at the number by the driver's door
shot(20, push(340, 420, 1.15, 1.22), function (u, d, t) {
  var c = window.CHUNKS[20], D = LN[20].end - LN[20].start, second = u > D * (c[2] || .66), s = paper();
  if (!second) {
    s += sun(120, 240 + 30 * (1 - at(u, 0, 2)), 40, t) + ground(640) + wheelSide(360, 470, 170, {});
    s += G("translate(440 330) rotate(-40)", R(-16, -10, 120, 20, "#9aa2ac", 2, 6) + C(130, 0, 34, "#f4ecdb", 2.4) + '<path d="M130 0 L' + f(130 + 22 * Math.cos(-2.2 + at(u, .5, .8) * 1.5)) + ' ' + f(22 * Math.sin(-2.2 + at(u, .5, .8) * 1.5)) + '" stroke="' + ORANGE + '" stroke-width="4"/>');
    s += G("", T("بارد", 140, 340, 30, BLUE, 800), at(u, .6, .3));
  } else {
    s += R(160, 120, 330, 560, BODYC, 2.6, 16) + R(170, 130, 30, 540, "#b3a37a", 1.6) + R(236, 260, 210, 260, "#f4efe3", 2, 6) + T("ضغط الهوا", 341, 306, 24, INK, 800);
    s += N("2.3 bar", 341, 380, 40, ORANGE) + N("33 psi", 341, 440, 30, INK) + '<path d="M260 470 H420" stroke="' + MUTE + '" stroke-width="2"/>' + T("205/55 R16", 341, 500, 18, MUTE, 700);
    s += tag("جنب باب السواق", 330, 630, at(u - D * (c[2] || .66), .3, .3), 24, OLIVE);
  }
  return s;
});
// 21 · «يعني من الآخر»: the four steps light up
shot(21, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[21], D = LN[21].end - LN[21].start, on = 0;
  for (var i = 0; i < 4; i++) if (u > D * (c[i + 1] != null ? c[i + 1] : .2 + i * .2) - .05) on = i + 1;
  return paper() + road(t, 200) + topCar(276, 540, 0, { blown: "FL", haz: on >= 4 ? 1 : 0 }) + R(-10, 120, 660, 150, PAPER, 0) + steps4(320, 200, on, on - 1, 1);
});
// 22 · every tyre carries its birthday on the sidewall: four digits, week then year
shot(22, push(320, 360, 1.0, 1.14), function (u, d, t) {
  var c = window.CHUNKS[22], D = LN[22].end - LN[22].start, s = paper() + sidewall(320, 520, 330, 1, t);
  var bx = 320 + 330 * .82 * Math.cos(-.62), by = 520 + 330 * .82 * Math.sin(-.62);
  s += inset(320, 220, 150, G("scale(1.4)", R(-80, -28, 160, 56, TYRE, 2, 8) + N("2321", 0, 16, 44, "#e8e1cf") + (u > D * (c[2] || .55) ? R(-74, -24, 70, 48, "none", 0, 4, ' stroke="' + OLIVE + '" stroke-width="5"') : "") + (u > D * (c[3] || .78) ? R(4, -24, 70, 48, "none", 0, 4, ' stroke="' + ORANGE + '" stroke-width="5"') : "")), at(u, D * (c[1] || .3), .3));
  s += tag("الأسبوع 23", 230, 430, at(u, D * (c[2] || .55), .3), 24, OLIVE) + tag("سنة 2021", 420, 430, at(u, D * (c[3] || .78), .3), 24, ORANGE);
  return s;
}, { tr: "in" });
// 23 · many carmakers say: change it after about six years, even if it still looks new
shot(23, push(330, 420, 1.2, 1.3), function (u, d, t) {
  var k = at(u, .8, 1.4), s = paper() + ground(640) + wheelSide(300, 470, 170, { spin: 4 * Math.sin(t) });
  for (var i = 0; i < 9; i++) { var a = -2.6 + i * .35, r0 = 170 * .72; s += draw("M" + f(300 + Math.cos(a) * r0) + " " + f(470 + Math.sin(a) * r0) + " l" + f(8 - 16 * hash(i)) + " " + f(-12) + " l" + f(8 * hash(i + 4)) + " -10", k, "#e8e1cf", 2); }
  return s + label(230, 360, 120, 230, "شقوق", ORANGE, at(u, 1.6, .5), 24) + numBox("6", 500, 200, at(u, .3, .3), 64) + G("", T("سنين", 500, 268, 26, INK, 800), at(u, .5, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the car on the highway at 120, the front-left tyre bursts («طاخ»), the car starts to pull
  // line 1: the foot goes for the brake. line 2: the car slews round, ✗
  var s = "";
  if (li === 0) {
    var u = t - LN[0].start, bt = (LN[0].end - LN[0].start) * .45, k = clamp((u - bt) / 2.5);
    s += G("translate(-16 -40) scale(1)", road(t, 420 * (1 - .2 * k)) + track([[300, 760], [300, 600], [298, 540], [290, 500], [300 - 60 * k * k, 470]], ORANGE, k) + topCar(300 - 60 * k * k, 430, -12 * k, u > bt ? { blown: "FL" } : {}) + spark(252 - 60 * k * k, 346, (u - bt) / .5) );
    s += G("translate(500 90)", speedo(0, 0, 62, 120));
    if (u > bt) s += G("", T("طاخ!", 480, 230, 54, ORANGE, 800), clamp((u - bt) / .25));
    // «اوعى تدوس فرامل»: the brake pedal, crossed out, from the first word
    s += iconBox(110, 100, 130, G("rotate(-18)", P("M14 -22 L-2 26", "none", 7) + R(-22, 18, 40, 30, ORANGE, 2.4, 6)) + T("فرامل", 0, -38, 20, INK, 800), clamp(u / .3)) + cross(110, 104, 1.1, clamp((u - .5) / .4));
  } else if (li === 1) {
    var u1 = t - LN[1].start, p = clamp((u1 - (LN[1].end - LN[1].start) * .6) / .5);
    s += G("translate(-230 -150) scale(1.35)", cockpit({ x: 220, y: 420, s: 1, foot: "brake", press: p, hlPedal: "brake", face: { eyes: 1.25, brows: "raised", mouth: "o" } }).svg);
  } else {
    var u2 = t - LN[2].start, k2 = clamp(u2 / 2.4);
    s += G("translate(-16 -40)", road(t, 200) + topCar(300 + 40 * k2, 420, 160 * ease(k2), { blown: "FL", brake: 1 }) + draw("M460 260 A170 170 0 0 1 460 580", k2, ORANGE, 6)) + cross(470, 120, 1.3, clamp((u2 - 1.6) / .4));
  }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 100) scale(.3)", wheelSide(0, 0, 200, { spin: t * 120, flat: .5 + .2 * Math.sin(t * 3) })); };
SCENE.outro = function (svg, u, t) {
  return R(0, 0, 600, 280, "#d8ccae", 0) + G("translate(80 -50) scale(.55) rotate(90 320 400)", road(t, 120) + topCar(276, 470, 0, { blown: "FL", haz: 1 })) +
    callout("1", 300, 60, ease(u / .3)) + callout("2", 380, 60, ease(u / .3 - .5)) + callout("3", 460, 60, ease(u / .3 - 1)) + callout("4", 540, 60, ease(u / .3 - 1.5));
};
