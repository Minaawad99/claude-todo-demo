// ── «أرقام البنزين: 80 و92 و95» — drawings in the «اسكتش» hand. The engine is a side cut through one cylinder like reference v18
// (head with spark plug and two valves, piston, rod, crank), drawn to real proportions (refs/SOURCES.md). The car and the
// real-proportion people are copied from videos/car-water/sketch/shots.js (itself from videos/choking).
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", BONE = "#e6dcc4";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
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
  out.far = arm(1) + leg(1);
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
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 10 + 26 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
// ── the car: a compact sedan in profile, front to the left, drawn to real size (1 m = 120 units):
// length 4.5 m (540), height 1.45 m (174), wheelbase 2.7 m (324), wheels 0.63 m (r 38), window sill 0.98 m (118).
// Local coordinates: x 0 (front bumper) … 540 (rear), y 0 = the ground under the tyres, up is negative.
// Like reference v18 the body is a cut-away: the cabin, the seats and the people show through the side.
var BODY = "#d8ccae", BODY_D = "#b9ab8a", GLASS = "#cfdde3", WATER = "#5f8aa3", WATER_T = "#8fb0c2", MUD = "#8a7656", SEAT = "#8a8173";
var CAR_P = "M0 -42 L0 -80 Q4 -97 30 -101 L150 -114 L226 -170 Q240 -175 262 -175 L378 -173 L452 -124 L520 -119 Q540 -117 540 -96 L540 -44 L470 -42 A46 46 0 0 0 378 -42 L146 -42 A46 46 0 0 0 54 -42 Z";
var CABIN = "M150 -46 L156 -116 L230 -166 L374 -166 L442 -124 L442 -46 Z";
var WIN_F = "M164 -120 L232 -162 L296 -162 L296 -120 Z", WIN_R = "M306 -120 L306 -162 L372 -162 L436 -124 L436 -120 Z";
function wheel(x, t, spin) { var a = (spin || 0) * t * 200, s = C(x, -38, 38, "#3a352e", 2.4) + C(x, -38, 24, "#a9a59c", 2) + C(x, -38, 7, INK, 0);
  for (var i = 0; i < 5; i++) { var b = (a + i * 72) * Math.PI / 180; s += '<path d="M' + f(x + Math.cos(b) * 8) + ' ' + f(-38 + Math.sin(b) * 8) + ' L' + f(x + Math.cos(b) * 21) + ' ' + f(-38 + Math.sin(b) * 21) + '" stroke="' + INK + '" stroke-width="3"/>'; } return s; }
// a seated person (real proportions, H = 1.75 m = 210 units → s = .525); facing the front (left)
function seated(hx, hy, s, o) {
  o = o || {}; return fig({ x: hx, y: hy, s: s, lean: o.lean == null ? -14 : o.lean, shirt: o.shirt || SHIRT_V, hair: o.hair, legs: o.legs || [[78, -70], [74, -66]], hands: o.hands || [[192, -106], [196, -104]], bend: o.bend || [1, 1], tilt: o.tilt || 0, mouth: o.mouth });
}
// the whole car scene. o: {x, y (car centre in the world), pitch (deg, − = nose down), t, sea (world y of the water surface),
//   inside (local y of the water inside), win (0 closed … 1 down, front window), winR, broken (0..1 the front window shatters),
//   people (fn → local SVG), belt (0 on … 1 off), hlDoor, spin, dark}
function car(o) {
  var t = o.t || 0, s = "", g = "";
  g += '<ellipse cx="270" cy="2" rx="260" ry="8" fill="' + INK + '" opacity="' + (o.sea == null ? .14 : 0) + '"/>';
  g += P(CAR_P, BODY, 2.6);
  g += '<path d="' + CAR_P + '" fill="url(#hatch)" opacity=".35"/>';
  // the cut-away cabin: lighter, with the seats, the dashboard and the people
  g += P(CABIN, "#efe6d2", 1.6);
  var id = "cab" + (++CLIPN); g += '<clipPath id="' + id + '"><path d="' + CABIN + '"/></clipPath><g clip-path="url(#' + id + ')">';
  g += P("M150 -96 L198 -100 L200 -84 L152 -70 Z", "#7c7468", 1.6);   // dashboard
  g += P("M212 -66 L276 -66 L280 -52 L214 -50 Z", SEAT, 1.6) + P("M272 -66 L292 -146 Q300 -150 304 -142 L292 -58 Z", SEAT, 1.6) + R(290, -160, 16, 18, SEAT, 1.4, 4);   // front seat
  g += P("M350 -64 L420 -64 L424 -50 L352 -48 Z", SEAT, 1.6) + P("M414 -64 L428 -140 Q436 -144 440 -136 L432 -56 Z", SEAT, 1.6);   // rear seat
  if (o.people) g += o.people(t);
  if (o.inside != null) { var lv = o.inside; g += '<g transform="rotate(' + f(-(o.pitch || 0)) + ' 300 ' + f(lv) + ')"><rect x="-200" y="' + f(lv) + '" width="900" height="400" fill="' + WATER + '" opacity=".72"/><path d="M-200 ' + f(lv) + ' H700" stroke="#e8eef0" stroke-width="2.4"/></g>'; }
  g += '</g>';
  // steering wheel over the driver's hands
  g += '<ellipse cx="194" cy="-104" rx="6" ry="22" transform="rotate(-24 194 -104)" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M194 -104 L176 -92" stroke="' + INK + '" stroke-width="4"/>';
  // windows: glass over the cabin; the front glass slides down, or shatters
  var w = clamp(o.win || 0), wr = clamp(o.winR || 0), br = o.broken || 0;
  var idf = "wf" + (++CLIPN); g += '<clipPath id="' + idf + '"><path d="' + WIN_F + '"/></clipPath>';
  if (br < 1) g += '<g clip-path="url(#' + idf + ')"><rect x="150" y="' + f(-166 + 48 * w) + '" width="160" height="48" fill="' + GLASS + '" opacity=".55"/>' + (w < .9 ? '<path d="M180 ' + f(-150 + 48 * w) + ' l26 -14 M200 ' + f(-140 + 48 * w) + ' l20 -11" stroke="#fff" stroke-width="3" opacity=".8"/>' : "") + (br > 0 ? crackS(286, -126, br) : "") + '</g>';
  var idr = "wr" + (++CLIPN); g += '<clipPath id="' + idr + '"><path d="' + WIN_R + '"/></clipPath><g clip-path="url(#' + idr + ')"><rect x="300" y="' + f(-166 + 48 * wr) + '" width="140" height="48" fill="' + GLASS + '" opacity=".55"/></g>';
  g += P(WIN_F, "none", 2.2) + P(WIN_R, "none", 2.2) + R(296, -164, 10, 120, BODY, 2);   // frames and the B-pillar
  // doors, handles, wheels, lights
  g += '<path d="M156 -118 L152 -48 M296 -118 L296 -46 M444 -122 L440 -60 Q420 -50 392 -50" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' + R(254, -100, 22, 6, INK, 0, 3) + R(398, -100, 22, 6, INK, 0, 3);
  if (o.hlDoor) g += P("M156 -118 L296 -118 L296 -46 L152 -48 Z", ORANGE, 0, ' opacity="' + f(.35 * o.hlDoor) + '"');
  g += P("M4 -86 L24 -94 L26 -84 L6 -80 Z", "#f4efe3", 1.4) + R(528, -110, 12, 16, ORANGE, 1.4);
  g += wheel(100, t, o.spin) + wheel(424, t, o.spin);
  s += G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.pitch || 0) + ") translate(-270 90)", g);
  if (o.sea != null) s += sea(o.sea, t, o.dark);
  return s;
}
function sea() { return ""; }
function crackS(x, y, k) { var s = ""; for (var i = 0; i < 9; i++) { var a = i * 0.7 + .3, l = 70 * clamp(k * 1.4) * (.6 + hash(i) * .6); s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * l * .5 + 4) + ' ' + f(y + Math.sin(a) * l * .5) + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>'; } return s; }
// the driver in the car (car-local), with the seat belt across the chest; belt: 0 on … 1 off
function driver(belt, o) { o = o || {}; var d = seated(262, -66, .525, o), sh = d.at(110, -18), hp = d.at(6, 18), k = clamp(belt || 0);
  var end = [lerp(hp[0], 296, k), lerp(hp[1], -148, k)];
  return d.far + d.body + '<path d="M298 -150 L' + f(sh[0]) + ' ' + f(sh[1]) + ' L' + f(end[0]) + ' ' + f(end[1]) + '" stroke="#3a352e" stroke-width="7" fill="none" stroke-linejoin="round" opacity="' + (k >= 1 ? 0 : 1) + '"/>' + R(hp[0] - 6, hp[1] - 6, 14, 12, "#9aa2ac", 1.4, 2) + d.near; }

// ── the engine: one cylinder of a modern twin-cam four-valve engine, cut through the middle, side view. Drawn from the
// user's reference photos (refs/photos: the Fama teaching model, the DOHC cutaway, the piston/rod/crank sets) to the real
// proportions of a 1.6 L four-cylinder at 2.4 units per mm: bore 80 mm, stroke 85 mm, rod 145 mm, compression height 30 mm,
// valves at ~23° in a pent roof, compression about 10:1. Head on top with two camshafts, buckets, springs and the plug in its
// well; the block with the water jacket; the round crankcase with the crank, its counterweight and the I-section rod.
var E = { cx: 320, cy: 640, r: 102, L: 348, ch: 72, x0: 224, x1: 416, deck: 112, roof: 80 };
var METAL = "#c3c1b9", METAL_D = "#9a988f", ALU = "#d6d0c0", IRON = "#cfc7b2", CAVITY = "#e9e2d0", GAS0 = "#ebe4d2", JACKET = "#7f9fb3", PORT_IN = "#b8cad3", PORT_EX = "#7d766c", BLACK = "#2e2b27";
function pinY(th) { var a = th * Math.PI / 180, x = E.r * Math.sin(a); return E.cy - E.r * Math.cos(a) - Math.sqrt(E.L * E.L - x * x); }
function pistonTop(th) { return pinY(th) - E.ch; }
function gasPath(top) { return "M" + E.x0 + " " + f(top) + " V" + E.deck + " L300 " + E.roof + " H340 L" + E.x1 + " " + E.deck + " V" + f(top) + " Z"; }
function heatCol(h) { h = clamp(h); var a = [235, 228, 210], b = [231, 170, 125], c = a.map(function (v, i) { return Math.round(lerp(v, b[i], h)); }); return "rgb(" + c.join(",") + ")"; }
function hatchR(x, y, w, h, fill, sw) { return R(x, y, w, h, fill, sw) + '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#hatch)"/>'; }
function hatchP(d, fill, sw) { return P(d, fill, sw) + '<path d="' + d + '" fill="url(#hatch)"/>'; }
// a flame ball: orange body, a lighter core, a ragged front that flickers with t
function flameBall(x, y, r, t, col) {
  if (r <= 1) return ""; var d = "", n = 26;
  for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * (1 + .07 * Math.sin(a * 5 + t * 14) + .04 * Math.sin(a * 9 - t * 9)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  return '<path d="' + d + ' Z" fill="' + (col || "#e0874a") + '" stroke="' + ORANGE + '" stroke-width="2.4" opacity=".92"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .55) + '" fill="#f1c27a" opacity=".85"/>';
}
// a coil spring between two points along an axis (u = unit vector), width w, n turns
function coil(x0, y0, ux, uy, len, w, n) { var d = "", nx = -uy, ny = ux; for (var i = 0; i <= n * 2; i++) { var s = len * i / (n * 2), o = (i % 2 ? 1 : -1) * w / 2; d += (i ? " L" : "M") + f(x0 + ux * s + nx * o) + " " + f(y0 + uy * s + ny * o); } return '<path d="' + d + '" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="' + METAL + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>'; }
// the spark plug, upright, electrode tip at (x, y): drawn from the plug construction drawing (terminal, ribbed insulator, hex shell, thread, side electrode)
function plug(x, y, hl) {
  var s = "", ins = hl ? "#f2d3b8" : "#f4efe3";
  s += R(x - 8, y - 182, 16, 16, BLACK, 1.6, 4) + R(x - 5, y - 168, 10, 10, METAL_D, 1.4);                         // terminal nut and stud
  s += P("M" + (x - 15) + " " + (y - 158) + " L" + (x + 15) + " " + (y - 158) + " L" + (x + 19) + " " + (y - 88) + " L" + (x - 19) + " " + (y - 88) + " Z", ins, 2.2);   // insulator
  for (var i = 0; i < 5; i++) s += '<path d="M' + (x - 16 - i * .5) + ' ' + (y - 150 + i * 12) + ' h' + (32 + i) + '" stroke="' + INK + '" stroke-width="1.4"/>';                 // ribs
  s += R(x - 26, y - 88, 52, 24, METAL_D, 2.2, 2) + '<path d="M' + (x - 9) + ' ' + (y - 88) + ' v24 M' + (x + 9) + ' ' + (y - 88) + ' v24" stroke="' + INK + '" stroke-width="1.2"/>';   // hex
  s += R(x - 18, y - 64, 36, 6, METAL, 1.6) + R(x - 17, y - 58, 34, 46, METAL, 2);                                     // gasket and thread
  for (var k = 0; k < 6; k++) s += '<path d="M' + (x - 17) + ' ' + (y - 54 + k * 7) + ' l34 4" stroke="' + INK + '" stroke-width="1.2"/>';
  s += R(x - 6, y - 12, 12, 6, ins, 1.4) + '<path d="M' + x + ' ' + (y - 6) + ' V' + (y - 1) + '" stroke="' + INK + '" stroke-width="4"/>';   // insulator tip and centre electrode
  s += '<path d="M' + (x + 14) + ' ' + (y - 12) + ' V' + (y + 6) + ' H' + (x - 3) + '" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linejoin="round"/>';   // side electrode hooks under it
  return s;
}
// o: {th (crank deg, 0 = top), cyc (cycle angle for the cams; default th folded into −180..180), t, mix, heat, spark, flame, knock, clash,
//     shake, hl: "piston" | "plug" | "far" , sensor (0..1), ear (0..1), crack, drop (lower the crank: a lower compression ratio)}
function engine(o) {
  var dr = o.drop || 0, th = o.th || 0, t = o.t || 0, top = pistonTop(th) + dr, py = pinY(th) + dr, a = th * Math.PI / 180, ccy = E.cy + dr, cp = [E.cx + E.r * Math.sin(a), ccy - E.r * Math.cos(a)], sx = o.shake || 0, s = "";
  var cyc = o.cyc != null ? o.cyc : ((th + 180) % 360 + 360) % 360 - 180;
  // crankcase: the round bowl under the cylinder (Fama model), a hatched wall with the hollow inside
  s += hatchP("M150 420 V600 A175 175 0 1 0 490 600 V420 Z", IRON, 2.4) + P("M168 420 V600 A157 157 0 1 0 472 600 V420 Z", CAVITY, 1.8);
  // block: cylinder walls, hatched, with the coolant passages
  [[150, E.x0], [E.x1, 490]].forEach(function (w) { s += hatchR(w[0], E.deck, w[1] - w[0], 420 - E.deck, IRON, 2.2) + R(w[0] + 20, E.deck + 16, w[1] - w[0] - 40, 250, JACKET, 1.8, 8); });
  s += R(E.x0, E.deck, E.x1 - E.x0, 420 - E.deck, CAVITY, 0);   // the bore below the piston
  // head: hatched casting, the coolant in it, the two ports curving out (exhaust left, dark; intake right, pale)
  s += hatchP("M130 112 V-20 H190 V-34 H450 V-20 H510 V112 Z", ALU, 2.4);
  s += P("M130 18 Q186 14 226 50 L250 86 L278 92 L262 70 Q226 20 130 -6 Z", PORT_EX, 1.8) + P("M510 18 Q454 14 414 50 L390 86 L362 92 L378 70 Q414 20 510 -6 Z", PORT_IN, 1.8);
  s += R(286, 0, 18, 64, JACKET, 1.6, 6) + R(336, 0, 18, 64, JACKET, 1.6, 6);
  // cam cover and plug well
  s += hatchP("M146 -20 V-120 Q146 -150 176 -150 H464 Q494 -150 494 -120 V-20 Z", "#bdb6a4", 2.4) + R(296, -150, 48, 230, CAVITY, 1.8);
  // the gas in the cylinder: tint by heat, fuel (orange) and air (blue) dots squeezed between roof and piston, the flames
  var gp = gasPath(top), id = "gas" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + gp + '"/></clipPath><path d="' + gp + '" fill="' + heatCol(o.heat || 0) + '" stroke="' + INK + '" stroke-width="2"/>';
  var g = "";
  if (o.mix) { for (var i = 0; i < 46; i++) { var u = hash(i), v = hash(i + 50), x = lerp(E.x0 + 10, E.x1 - 10, u) + 4 * Math.sin(t * 3 + i), y = lerp(E.roof + 6, top - 8, v) + 4 * Math.cos(t * 2.6 + i * 1.7);
      g += i % 3 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4.5" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>' : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="5" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/>'; }
    g = G("", g, clamp(o.mix)); }
  if (o.flame) g += flameBall(320, 90, o.flame * 330, t);
  if (o.knock) g += flameBall(E.x0 + 18, top - 14, o.knock * 120, t + 1, "#c9643a");
  if (o.hl === "far") g += '<circle cx="' + (E.x0 + 26) + '" cy="' + f(top - 20) + '" r="' + f(34 + 4 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="7 5"/>';
  s += '<g clip-path="url(#' + id + ')">' + g + '</g>';
  if (o.clash) s += impact(lerp(E.x0 + 60, 300, .3), top - 26, o.clash, ORANGE);
  // valves: discs seated on the roof slopes, stems up at 23°, springs, bucket tappets, the camshafts turning at half speed
  [[263, 96, -1, PORT_EX], [377, 96, 1, PORT_IN]].forEach(function (v) {
    var ux = .4 * v[2], uy = -.917, nx = .917 * v[2], ny = .4, lift = 0;
    var ca = (180 + cyc / 2) * Math.PI / 180 + (v[2] > 0 ? .5 : -.5), cc = [v[0] + ux * 196, v[1] + uy * 196];
    var head = [v[0] - ux * lift, v[1] - uy * lift];
    s += '<path d="M' + f(head[0] - nx * 32) + ' ' + f(head[1] - ny * 32) + ' L' + f(head[0] + nx * 32) + ' ' + f(head[1] + ny * 32) + ' L' + f(head[0] + nx * 12 + ux * 14) + ' ' + f(head[1] + ny * 12 + uy * 14) + ' L' + f(head[0] - nx * 12 + ux * 14) + ' ' + f(head[1] - ny * 12 + uy * 14) + ' Z" fill="' + METAL + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    s += '<path d="M' + f(head[0] + ux * 12) + ' ' + f(head[1] + uy * 12) + ' L' + f(head[0] + ux * 150) + ' ' + f(head[1] + uy * 150) + '" stroke="' + INK + '" stroke-width="11"/><path d="M' + f(head[0] + ux * 12) + ' ' + f(head[1] + uy * 12) + ' L' + f(head[0] + ux * 150) + ' ' + f(head[1] + uy * 150) + '" stroke="' + METAL + '" stroke-width="6"/>';
    s += coil(head[0] + ux * 104, head[1] + uy * 104, ux, uy, 50, 36, 5);
    s += '<path d="M' + f(head[0] + ux * 154 - nx * 24) + ' ' + f(head[1] + uy * 154 - ny * 24) + ' l' + f(nx * 48) + ' ' + f(ny * 48) + ' l' + f(ux * 18) + ' ' + f(uy * 18) + ' l' + f(-nx * 48) + ' ' + f(-ny * 48) + ' Z" fill="' + METAL_D + '" stroke="' + INK + '" stroke-width="2"/>';   // bucket
    var lobe = "M" + f(cc[0] + Math.cos(ca) * 38) + " " + f(cc[1] + Math.sin(ca) * 38) + " L" + f(cc[0] + Math.cos(ca + 1.2) * 23) + " " + f(cc[1] + Math.sin(ca + 1.2) * 23) + " A23 23 0 1 1 " + f(cc[0] + Math.cos(ca - 1.2) * 23) + " " + f(cc[1] + Math.sin(ca - 1.2) * 23) + " Z";
    s += P(lobe, METAL, 2.2) + C(cc[0], cc[1], 9, METAL_D, 1.6) + C(cc[0], cc[1], 3, INK, 0);
  });
  // piston: hollow cut section, flat crown, three ring grooves (the notches at both sides), the pin boss
  var pk = "", pc = o.hl === "piston" ? "#c8a184" : METAL, L0 = E.x0 + 3, L1 = E.x1 - 3;
  pk += P("M" + L0 + " " + f(top) + " H" + L1 + " V" + f(top + 128) + " H" + (L1 - 14) + " V" + f(top + 34) + " H" + (L0 + 14) + " V" + f(top + 128) + " H" + L0 + " Z", pc, 2.4);
  [10, 18, 26].forEach(function (d) { pk += R(L0 - 1, top + d, 9, 4, INK, 0) + R(L1 - 8, top + d, 9, 4, INK, 0); });
  pk += C(320, py, 30, pc, 2.2) + C(320, py, 13, CAVITY, 2);
  if (o.crack) pk += P("M" + (L0 - 1) + " " + f(top - 1) + " L" + (L0 + 26) + " " + f(top - 1) + " L" + (L0 + 18) + " " + f(top + 10) + " L" + (L0 + 30) + " " + f(top + 20) + " L" + (L0 + 12) + " " + f(top + 34) + " L" + (L0 - 1) + " " + f(top + 30) + " Z", BLACK, 1.6);
  // rod: I-section shank between the small end on the pin and the big end with its cap and two bolts
  var dx = cp[0] - 320, dy = cp[1] - py, l = Math.hypot(dx, dy), nx2 = -dy / l, ny2 = dx / l, ux2 = dx / l, uy2 = dy / l;
  function rp(t2, w) { return [320 + ux2 * t2 * l + nx2 * w, py + uy2 * t2 * l + ny2 * w]; }
  var q = [rp(.04, 14), rp(.86, 22), rp(.86, -22), rp(.04, -14)];
  var rod = P("M" + q.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z", METAL, 2.4) + '<path d="M' + f(rp(.12, 0)[0]) + ' ' + f(rp(.12, 0)[1]) + ' L' + f(rp(.8, 0)[0]) + ' ' + f(rp(.8, 0)[1]) + '" stroke="' + METAL_D + '" stroke-width="12" stroke-linecap="round"/>';
  rod += C(320, py, 20, METAL, 2.2) + C(320, py, 9, METAL_D, 1.6);
  var be = C(cp[0], cp[1], 44, METAL, 2.4) + '<path d="M' + f(cp[0] - nx2 * 50) + ' ' + f(cp[1] - ny2 * 50) + ' L' + f(cp[0] + nx2 * 50) + ' ' + f(cp[1] + ny2 * 50) + '" stroke="' + INK + '" stroke-width="2"/>';
  [-1, 1].forEach(function (sd) { var bx = cp[0] + nx2 * 36 * sd, by = cp[1] + ny2 * 36 * sd; be += '<path d="M' + f(bx - ux2 * 26) + ' ' + f(by - uy2 * 26) + ' L' + f(bx + ux2 * 22) + ' ' + f(by + uy2 * 22) + '" stroke="' + INK + '" stroke-width="7"/>'; });
  be += C(cp[0], cp[1], 26, METAL_D, 2) + C(cp[0], cp[1], 9, INK, 0);
  // crank: the counterweight opposite the pin (with a balance hole), the web, the main journal
  var cw = "M" + f(E.cx + 40 * Math.sin(a + 1.3)) + " " + f(ccy - 40 * Math.cos(a + 1.3)) + " L" + f(E.cx + 136 * Math.sin(a + 2.15)) + " " + f(ccy - 136 * Math.cos(a + 2.15)) + " A136 136 0 0 1 " + f(E.cx + 136 * Math.sin(a + 4.13)) + " " + f(ccy - 136 * Math.cos(a + 4.13)) + " L" + f(E.cx + 40 * Math.sin(a + 4.98)) + " " + f(ccy - 40 * Math.cos(a + 4.98)) + " Z";
  var web = P(cw, "#a9adaa", 2.4) + C(E.cx - 92 * Math.sin(a), ccy + 92 * Math.cos(a), 12, CAVITY, 1.6) +
    P("M" + f(E.cx + 48 * Math.cos(a)) + " " + f(ccy + 48 * Math.sin(a)) + " L" + f(cp[0] + 48 * Math.cos(a)) + " " + f(cp[1] + 48 * Math.sin(a)) + " L" + f(cp[0] - 48 * Math.cos(a)) + " " + f(cp[1] - 48 * Math.sin(a)) + " L" + f(E.cx - 48 * Math.cos(a)) + " " + f(ccy - 48 * Math.sin(a)) + " Z", "#a9adaa", 2.4) +
    C(E.cx, ccy, 36, METAL, 2.4) + C(E.cx, ccy, 12, INK, 0);
  s += web + G("translate(" + f(sx) + " 0)", pk) + rod + be;
  // the spark plug in its well, firing at the electrode
  s += plug(320, 92, o.hl === "plug");
  if (o.spark) { var k = clamp(o.spark); for (var j = 0; j < 8; j++) { var b = j * Math.PI / 4 + t * 3; s += '<path d="M' + f(320 + Math.cos(b) * 6) + ' ' + f(94 + Math.sin(b) * 6) + ' L' + f(320 + Math.cos(b) * (10 + 26 * k)) + ' ' + f(94 + Math.sin(b) * (10 + 26 * k)) + '" stroke="#f0b33c" stroke-width="4" stroke-linecap="round" opacity="' + f(k) + '"/>'; } }
  // knock sensor (photos): a black puck bolted to the side of the block, its connector and wire, and the sound it hears
  if (o.sensor) { var sk = clamp(o.sensor); s += appear(sk, R(490, 302, 26, 60, BLACK, 2.2, 5) + R(516, 318, 14, 28, METAL_D, 1.8) + R(530, 323, 10, 18, METAL, 1.4) + R(500, 270, 22, 34, "#5f5d58", 1.8, 3) + P("M511 270 q0 -40 60 -60", "none", 5));
    if (o.ear) for (var w = 0; w < 3; w++) { var p = (t * 1.6 + w / 3) % 1; s += '<path d="M' + f(556 + p * 70) + ' ' + f(302 - p * 30) + ' q' + f(16 + p * 10) + ' ' + f(30 + p * 30) + ' 0 ' + f(60 + p * 60) + '" stroke="' + ORANGE + '" stroke-width="3.4" fill="none" opacity="' + f((1 - p) * clamp(o.ear)) + '"/>'; } }
  return s;
}
// the knock sensor face-on, as in the photos: ribbed aluminium block, a round black body, washer and hex bolt, the grey plug going sideways
function knockSensorFront(t, ear) {
  var s = R(-200, -200, 400, 400, ALU, 0) + R(-200, -200, 400, 400, "none", 0, 0, ' fill="url(#hatch)" opacity=".4"');
  [-150, -60, 90].forEach(function (x) { s += R(x, -200, 34, 400, "#c8c1ae", 1.8); });
  s += C(0, 0, 70, BLACK, 2.6) + C(0, 0, 40, "#d8d6d0", 2) + '<path d="M-26 0 L-13 -23 L13 -23 L26 0 L13 23 L-13 23 Z" fill="' + METAL + '" stroke="' + INK + '" stroke-width="2"/>';
  s += P("M-62 -26 H-140 V26 H-62 Z", "#7b7a76", 2.2) + R(-150, -18, 12, 36, BLACK, 1.6) + P("M-150 0 Q-190 0 -200 40", "none", 6);
  if (ear) for (var w = 0; w < 3; w++) { var p = (t * 1.6 + w / 3) % 1; s += '<circle r="' + f(80 + p * 90) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f((1 - p) * ear) + '"/>'; }
  return s;
}
// a piston that knocked too long (photos): 3/4 view, ring lands at the edge blown out, a hole down the side, the crown pitted at the edge
function pistonBroken(x, y, sc, k) {
  var s = '<path d="M-100 0 V150 A100 26 0 0 0 100 150 V0" fill="' + METAL + '" stroke="' + INK + '" stroke-width="2.6"/>';
  [16, 30, 44].forEach(function (d) { s += '<path d="M-100 ' + d + ' A100 26 0 0 0 100 ' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>'; });
  s += '<path d="M-100 60 A100 26 0 0 0 100 60" fill="none" stroke="' + METAL_D + '" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="100" ry="26" fill="#d9d6cd" stroke="' + INK + '" stroke-width="2.6"/>';
  for (var i = 0; i < 46; i++) { var a = Math.PI * (.62 + .42 * hash(i)), r = 66 + 32 * hash(i + 9); s += '<circle cx="' + f(Math.cos(a) * r) + '" cy="' + f(Math.sin(a) * r * .26) + '" r="' + f(1.2 + 2 * hash(i + 3)) + '" fill="' + INK + '" opacity="' + f(.35 + .3 * hash(i + 5)) + '"/>'; }
  var z = clamp(k); if (z > 0) {
    var hole = [[-50, 22], [-34, 18], [-18, 24], [-8, 44], [-4, 66], [-14, 92], [-36, 98], [-50, 78], [-58, 52]].map(function (p) { return [lerp(-30, p[0], z), lerp(40, p[1], z)]; });
    var d = "M" + hole.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
    s += '<path d="' + d + '" fill="none" stroke="#efece4" stroke-width="7" stroke-linejoin="round"/><path d="' + d + '" fill="#1f1d1a" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + f(lerp(-30, -40, z)) + ' ' + f(lerp(40, 30, z)) + ' L' + f(lerp(-30, -20, z)) + ' ' + f(lerp(40, 70, z)) + '" stroke="#5f5a52" stroke-width="3"/>';
    s += P("M-56 21 L-44 6 L-28 8 L-16 22 L-34 18 Z", "#8f8b80", 1.6);
    for (var j = 0; j < 9; j++) { var sx2 = -70 + j * 9 + 6 * hash(j); s += '<path d="M' + f(sx2) + ' ' + f(96 + 4 * hash(j + 2)) + ' v' + f(14 + 30 * hash(j + 4)) + '" stroke="#3a352e" stroke-width="' + f(1.5 + 2 * hash(j + 6)) + '" opacity="' + f(.5 * z) + '"/>'; }   // the eroded bite into the crown edge
  }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// an Egyptian station pump (photo): stainless cabinet, a head with two blue screens and a keypad, the red grade sticker, the yellow nozzle on its hook
var GRADES = ["80", "92", "95"], GCOL = ["#9aa86e", "#d9a86a", "#c96a4a"];
function egyPump(x, y, sc, g, t, o) {
  o = o || {}; var on = o.on == null ? 1 : o.on, s = "";
  s += R(-66, -360, 132, 360, "#cfd1cc", 2.6, 3) + '<path d="M-50 -350 V-10 M50 -350 V-10" stroke="#e9eae6" stroke-width="5" opacity=".7"/>';
  s += R(-70, -380, 140, 104, "#dfe0dc", 2.4, 4) + R(-60, -366, 54, 30, "#3e64a8", 1.8, 2) + R(6, -366, 54, 30, "#3e64a8", 1.8, 2) + R(-60, -330, 54, 30, "#3e64a8", 1.8, 2) + R(6, -330, 54, 30, "#3e64a8", 1.8, 2);
  var lit = o.count ? (t * .9 % 40).toFixed(2) : "0.00"; s += N(lit, -33, -344, 16, "#e8f0ff") + N(o.count ? (t * 13.75 % 500).toFixed(0) : "0", 33, -344, 16, "#e8f0ff");
  s += R(-14, -298, 28, 18, BLACK, 1.4, 2);
  s += R(-60, -260, 120, 110, "#b7b9b3", 2, 2);                                                                     // the window recess
  s += G("translate(0 -120) scale(" + f(1 + .2 * clamp(o.big || 0)) + ")", R(-56, -22, 112, 40, "#c8312d", 2, 3) + T("بنزين " + g, 0, 4, 20, "#fff", 800));
  s += R(66, -250, 16, 40, "#8c8e88", 1.8) + P("M74 -210 q30 90 -2 200", "none", 6);                                // hook and hose
  s += G("translate(80 -236) rotate(14)", P("M-6 0 h22 l6 40 h-14 l-4 22 h-10 Z", "#e6b52c", 2) + R(0, 60, 6, 28, "#9a988f", 1.4));   // yellow nozzle
  s += R(-80, 0, 160, 16, "#9e9a90", 2);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// three pumps under the canopy, one per grade; k lights them one by one; big: the grade that grows
function station(t, k, big, bigK) {
  var s = R(-200, 60, 1040, 46, "#d8ccae", 2.4) + R(-200, 106, 1040, 10, "#b9ab8a", 1.6) + R(-60, 116, 30, 560, "#c9c3b3", 2) + R(610, 116, 30, 560, "#c9c3b3", 2);
  s += R(-200, 650, 1040, 300, "#d9cfb6", 2) + '<rect x="-200" y="650" width="1040" height="300" fill="url(#hatch)" opacity=".35"/>' + R(40, 630, 560, 24, "#bfb7a4", 2);
  GRADES.forEach(function (g, i) { s += appear(k == null ? 1 : clamp(k * 3 - i), egyPump(130 + i * 190, 630, .95, g, t, { big: big === i ? bigK : 0, count: i === 1 })); });
  return s;
}
// the fuel door open (photos): the body panel, the dark recess, the cap with its ridges, the door on its arm with the yellow sticker inside
function fuelDoor(x, y, sc, k, g) {
  var s = R(-300, -170, 600, 340, "#c9b98f", 0) + '<rect x="-300" y="-170" width="600" height="340" fill="url(#hatch)" opacity=".3"/>';
  s += R(-30, -110, 220, 220, "#1f1d1a", 2.6, 26) + C(80, 0, 78, "#3a3632", 2.4) + C(80, 0, 52, BLACK, 2) + R(70, -46, 20, 92, "#4a4642", 1.6, 6) + '<path d="M130 -50 a70 70 0 0 1 20 40" stroke="#6a655e" stroke-width="4" fill="none"/>';
  var sx = Math.cos(Math.PI * clamp(k)), w = 220 * Math.abs(sx);
  if (sx >= 0) s += R(-30, -112, Math.max(1, w), 224, "#c9b98f", 2.6, 24) + '<path d="M' + f(-30 + w * .2) + ' -80 v160" stroke="' + INK + '" stroke-width="1" opacity=".3"/>';
  else { s += R(-50 - w, -112, w, 224, "#4a4642", 2.6, 24);   // inside face and the arm
    s += R(-60, -14, 40, 28, "#2a2724", 1.6);
    if (w > 120) s += R(-50 - w * .82, -64, w * .6, 128, "#f2d23a", 2, 8) + T("أوكتين", -50 - w * .52, -18, 22, INK, 800) + N(g, -50 - w * .52, 40, 48, INK); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// a Supermarine Spitfire Mk I in profile, nose to the left (traced from the side-view photo): camouflage, roundel, fin flash, three-blade prop
function spitfire(x, y, sc, t) {
  var body = "M8 0 Q8 -12 22 -18 L120 -28 L200 -32 L232 -34 L246 -40 Q262 -56 300 -57 Q326 -55 338 -36 L420 -28 L520 -22 L546 -26 Q552 -84 578 -96 Q600 -98 604 -60 L604 -6 L600 10 L520 12 L400 20 L320 30 L250 34 L120 26 L22 18 Q8 12 8 0 Z";
  var s = P(body, "#7a7a4c", 2.4);
  s += '<clipPath id="spf"><path d="' + body + '"/></clipPath><g clip-path="url(#spf)"><path d="M60 -40 Q120 0 180 -10 T300 -4 T430 6 T600 -30 V40 H0 Z" fill="#8a6a46" opacity=".85"/></g>';
  s += P("M246 -40 Q262 -56 300 -57 Q326 -55 338 -36 Z", "#d6e0e2", 2) + '<path d="M290 -56 V-38" stroke="' + INK + '" stroke-width="1.6"/>';
  s += P("M150 26 L330 30 L340 40 L170 40 Z", "#9aa38a", 2) + P("M200 40 L250 40 L246 54 L206 54 Z", "#8a8f74", 2);        // wing root and radiator
  s += P("M520 -4 L596 -6 L598 4 L524 6 Z", "#7a7a4c", 1.6);                                                             // tailplane
  s += '<g transform="translate(578 -60)">' + R(0, -26, 8, 16, "#c8312d", 0) + R(8, -26, 8, 16, "#f4efe3", 0) + R(16, -26, 8, 16, "#2f4d8a", 0) + '</g>';
  s += C(400, -2, 22, "#e0b33c", 1.6) + C(400, -2, 17, "#2f4d8a", 0) + C(400, -2, 11, "#f4efe3", 0) + C(400, -2, 6, "#c8312d", 0);
  for (var i = 0; i < 3; i++) s += R(60 + i * 18, -22, 12, 6, "#3a352e", 1);                                             // exhaust stubs
  s += P("M8 0 Q-8 0 -12 -2 Q-8 -6 8 -10 Z", "#3a352e", 1.6);                                                             // spinner
  s += '<ellipse cx="-4" cy="0" rx="5" ry="' + f(60 * (.55 + .45 * Math.abs(Math.cos(t * 40)))) + '" fill="#3a352e" opacity=".55"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s);
}
// a bicycle pump: barrel, T-handle pushed down by p (0..1), the air dots squeezed under the plunger, a warm barrel
function bikePump(x, y, p, t, heat) {
  var top = lerp(-300, -120, p), s = "";
  s += R(-46, -320, 92, 320, "#e9e1cc", 2.6, 6);
  s += '<rect x="-40" y="' + f(top + 14) + '" width="80" height="' + f(-6 - top - 14) + '" fill="' + heatCol(heat) + '"/>';
  for (var i = 0; i < 26; i++) { var yy = lerp(top + 22, -14, hash(i + 3)) + 3 * Math.sin(t * 4 + i), xx = -30 + 60 * hash(i) + 3 * Math.cos(t * 3 + i); s += '<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="4" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>'; }
  s += R(-42, top, 84, 14, "#3a352e", 2) + R(-6, top - 190, 12, 190, METAL, 2) + R(-90, top - 214, 180, 28, "#3a352e", 2.4, 12);
  s += P("M46 -40 q90 0 90 80 q0 40 40 40", "none", 7) + R(-80, -6, 160, 14, "#5b5145", 2, 4);
  if (heat > .2) for (var j = 0; j < 3; j++) s += '<path d="M' + (66 + j * 18) + ' ' + f(-90 - 8 * Math.sin(t * 4 + j)) + ' q-10 -16 0 -32 q10 -16 0 -32" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(clamp(heat)) + '"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", s);
}
// a gauge (needle 0..1) with a label under it
function gauge(x, y, r, v, lab, col) {
  var a = Math.PI * (1 + clamp(v)), s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i <= 6; i++) { var b = Math.PI * (1 + i / 6); s += '<path d="M' + f(x + Math.cos(b) * r * .78) + ' ' + f(y + Math.sin(b) * r * .78) + ' L' + f(x + Math.cos(b) * r * .92) + ' ' + f(y + Math.sin(b) * r * .92) + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y + Math.sin(a) * r * .8) + '" stroke="' + (col || ORANGE) + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0) + T(lab, x, y + 30, 22, INK, 700);
}
// a tolerance bar: how much squeeze a grade takes before it lights by itself
function tolBar(x, y, w, k, g, col) { return R(x, y - 22, 120, 44, col, 2, 4) + N(g, x + 60, y + 10, 28, INK) + R(x + 134, y - 16, Math.max(1, w * clamp(k)), 32, ORANGE, 2) + '<rect x="' + (x + 134) + '" y="' + (y - 16) + '" width="' + f(Math.max(1, w * clamp(k))) + '" height="32" fill="url(#hatch)" opacity=".5"/>'; }
// a road on a slope (deg), the car climbing it
function hill(ang) { return G("rotate(" + ang + " 320 470)", R(-400, 470, 1440, 30, "#6a665e", 2.4) + R(-400, 500, 1440, 500, "#d9cfb6", 2) + '<rect x="-400" y="500" width="1440" height="500" fill="url(#hatch)" opacity=".4"/>' + '<path d="M-380 485 h60 M-260 485 h60 M-140 485 h60 M-20 485 h60 M100 485 h60 M220 485 h60 M340 485 h60 M460 485 h60 M580 485 h60 M700 485 h60" stroke="#e8e1cf" stroke-width="3"/>'); }
// a manual book and a filler flap with its sticker
function manual(x, y, sc) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", R(-80, -110, 160, 220, "#5b6f7c", 2.6, 6) + R(-62, -96, 124, 34, "#f4efe3", 1.6) + T("كتالوج", 0, -72, 22, INK, 800) + P("M-40 0 q40 -40 80 0 l-12 14 h-56 Z", "#d8ccae", 2) + C(-22, 22, 12, "#3a352e", 1.6) + C(22, 22, 12, "#3a352e", 1.6) + R(-80, 100, 160, 10, "#e9e1cc", 1.6)); }
// a coin
function coin(x, y, r) { return C(x, y, r, "#d8b25c", 2) + C(x, y, r * .7, "none", 1.2); }
// two liters side by side: the bars of energy match
function litre(x, y, g, col, k) { return R(x - 50, y - 160, 100, 160, "#f4efe3", 2.4, 8) + '<rect x="' + (x - 48) + '" y="' + f(y - 150 * clamp(k)) + '" width="96" height="' + f(150 * clamp(k)) + '" fill="' + col + '" opacity=".75"/>' + R(x - 20, y - 186, 40, 26, "#3a352e", 2, 3) + N(g, x, y - 60, 34, INK) + T("1 لتر", x, y + 30, 20, INK, 700); }

// ── shots (one per idea; line numbers from script.txt) ──
var ENG = function (z1, z2, cy) { return push(320, cy || 380, z1, z2); };
// 4 · «قاعدة صغيرة»: a pinned rule card over a faint pump
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(.8, bikePump(320, 700, .3, t, 0)) + G("", '<rect x="130" y="180" width="380" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 265)"/>' +
    T("تضغطه بسرعة", 320, 246, 38, INK, 800) + T("يسخن", 320, 306, 44, ORANGE, 800) + C(320, 188, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · a bicycle pump: the plunger goes down, the air under it squeezes and the barrel warms
shot(5, push(320, 470, 1.1, 1.0), function (u, d, t) {
  var p = .5 - .5 * Math.cos(u * 2.6), h = clamp(u / d * 1.3) * (.4 + .6 * p);
  return paper() + bikePump(300, 720, p, t, h) + label(346, 600, 470, 640, "الهوا اتضغط", BLUE, at(u, .6, .5), 24) + label(300, 400, 470, 360, "سخن", ORANGE, at(u, 1.6, .5), 26);
}, { tr: "in" });
// 6 · the engine: the piston rises from the bottom and squeezes fuel and air to about a tenth
shot(6, ENG(.82, .88, 330), function (u, d, t) {
  var k = clamp((u - .6) / (d - 1.2)), th = 180 + 180 * ease(k);
  return paper() + appear(at(u, 0, .5), engine({ th: th, t: t, mix: 1, heat: k * .5, hl: "piston" })) +
    label(410, pistonTop(th) + 60, 500, pistonTop(th) + 150, "المكبس", OLIVE, at(u, .3, .5), 26) + G("", numBox("1/10", 560, 200, 1, 34), at(u, d - 1.4, .4));
});
// 7 · the mixture is hot; the spark plug fires at the right moment
shot(7, ENG(1.2, 1.3, 40), function (u, d, t) {
  var sp = u > d * .45 ? Math.abs(Math.sin((u - d * .45) * 9)) : 0;
  return paper() + engine({ th: 4 * Math.sin(t * 1.2), t: t, mix: 1, heat: .55 + .1 * Math.sin(t * 2), spark: sp, hl: u > d * .4 ? "plug" : "gas" }) +
    label(336, -40, 440, -200, "البوجيه", OLIVE, at(u, d * .4, .5), 26) + label(370, 104, 440, 200, "سخن جامد", ORANGE, at(u, .3, .5), 22);
});
// 8 · normal burning: one flame spreads from the plug and pushes the piston down
shot(8, ENG(.86, .82, 330), function (u, d, t) {
  var k = clamp(u / (d * .7)), th = 150 * ease(clamp((u - .4) / (d - .8)));
  return paper() + engine({ th: th, t: t, mix: 1 - k, heat: .7, flame: lerp(.05, 1, k) }) + arrow(320, pistonTop(th) + 40, 320, pistonTop(th) + 120, ORANGE, 8, at(u, 1, .4)) + check(540, 160, 1.4, at(u, d - 1, .5));
}, { tr: "out" });
// 9 · weak fuel: the far corner, squeezed and hot, lights by itself before the flame gets there
shot(9, ENG(1.0, 1.1, 250), function (u, d, t) {
  var kf = clamp(u / d) * .35, kn = clamp((u - d * .55) / (d * .35));
  return paper() + engine({ th: 6, t: t, mix: 1 - kn * .5, heat: .8, flame: .05 + kf, knock: kn * .8, hl: kn < .1 && u > 1 ? "far" : "" }) +
    label(E.x0 + 26, pistonTop(6) - 22, 200, 250, "الحتة البعيدة", ORANGE, at(u, 1, .5), 22) + G("", tag("ولّعت لوحدها", 440, 230, 1, 24, ORANGE), at(u, d * .65, .4));
});
// 10 · two flame fronts crash into each other: a hammer blow on the piston
shot(10, ENG(1.2, 1.08, 250), function (u, d, t) {
  var b = (u * 3) % 1, sh = u > .4 ? 5 * Math.sin(u * 60) * (1 - b) : 0;
  return paper() + engine({ th: 6, t: t, heat: .9, flame: .55, knock: .9, clash: u > .3 ? b : 0, shake: sh, hl: "piston" }) +
    iconBox(470, 520, 130, G("rotate(" + f(-30 + 30 * Math.abs(Math.sin(u * 6))) + " 20 40)", R(-8, -10, 16, 80, WOOD, 2) + R(-40, -36, 80, 30, "#5b5145", 2, 4)), at(u, .8, .3));
}, { tr: "in" });
// 11 · the sound you hear going uphill: «تك تك»
shot(11, push(320, 400, .82, .9), function (u, d, t) {
  var s = paper() + hill(8) + car({ x: 330, y: 382, pitch: 8, t: t, spin: 1, people: function () { return driver(0); } });
  for (var i = 0; i < 3; i++) { var k = at(u, .3 + i * .45, .25); if (k > 0) s += G("translate(" + (150 + i * 70) + " " + (250 - i * 40 + 4 * Math.sin(t * 8 + i)) + ")", tag("تك", 0, 0, k, 30, ORANGE)); }
  return s;
});
// 12 · the octane number: how much squeeze the fuel takes before it lights by itself
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = .5 - .5 * Math.cos(u * 2.2);
  return paper() + G("translate(80 120) scale(.75)", bikePump(0, 560, k, t, k)) + tag("الأوكتان", 400, 210, at(u, .3, .4), 40, BLUE) + T("= قد إيه يستحمل", 400, 300, 32, INK, 800) + T("من غير ما يولّع لوحده", 400, 350, 26, MUTE, 700) +
    G("", gauge(400, 520, 90, .25 + .6 * k, "ضغط"), at(u, 1, .4));
});
// 13 · 80 < 92 < 95: three tolerance bars
shot(13, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + T("بيستحمل قد إيه؟", 320, 170, 34, INK, 800) + tolBar(60, 300, 260, at(u, .2, .8) * .55, "80", GCOL[0]) + tolBar(60, 420, 260, at(u, .9, .8) * .78, "92", GCOL[1]) + tolBar(60, 540, 260, at(u, 1.8, .8) * (.92 + .02 * Math.sin(t * 3)), "95", GCOL[2]);
});
// 14 · every engine squeezes by a different amount: two cylinders side by side
shot(14, push(320, 400, .98, 1.04), function (u, d, t) {
  var th = 180 + 180 * (.5 - .5 * Math.cos(u * 1.8));
  return paper() + G("translate(10 210) scale(.48)", engine({ th: th, t: t, mix: 1, heat: .3, drop: 26 })) + G("translate(320 210) scale(.48)", engine({ th: th, t: t + 1, mix: 1, heat: .7 })) +
    G("", numBox("8:1", 165, 140, 1, 28) + numBox("11:1", 475, 140, 1, 28), at(u, .5, .4)) + T("ضغط قليل", 165, 650, 26, OLIVE, 800) + T("ضغط عالي", 475, 650, 26, ORANGE, 800);
});
// 15 · old engine → 80 is fine; modern and turbo → a higher number
shot(15, push(320, 400, 1.04, .98), function (u, d, t) {
  var th = 180 + 180 * (.5 - .5 * Math.cos(u * 1.8)), k = at(u, d * .45, .5);
  return paper() + G("translate(10 210) scale(.48)", engine({ th: th, t: t, mix: 1, heat: .3, drop: 26 })) + G("translate(320 210) scale(.48)", engine({ th: th, t: t + 1, mix: 1, heat: .7 })) +
    tag("قديم", 165, 120, 1, 26) + tag("حديث · تيربو", 475, 120, 1, 26) + numBox("80", 165, 680, at(u, .4, .3), 34) + check(240, 670, .8, at(u, .8, .4)) +
    G("", numBox("92", 430, 680, 1, 34) + numBox("95", 530, 680, 1, 34), k);
});
// 16 · your number: in the manual, and on the filler flap
shot(16, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + manual(170, 380, 1.1 + .02 * Math.sin(t * 2)) + fuelDoor(450, 400, .62, at(u, .6, 1.2), "95") + label(400, 330, 470, 560, "غطا التانك", OLIVE, at(u, 1.4, .4), 22);
});
// 17 · lower than asked: the knock sensor hears it and moves the spark later
shot(17, ENG(.84, .9, 360), function (u, d, t) {
  var late = at(u, d * .55, .8), sp = Math.abs(Math.sin(u * 5)) * late;
  return paper() + engine({ th: lerp(4, 20, late), t: t, mix: .6, heat: .7, flame: .2 + .1 * Math.sin(t * 4) * (1 - late), knock: (1 - late) * .5, sensor: at(u, .4, .5), ear: 1 - late, spark: sp }) +
    label(503, 360, 470, 470, "حساس التكتكة", OLIVE, at(u, .8, .5), 22) + inset(130, 130, 105, G("scale(.62)", knockSensorFront(t, 1 - late)), at(u, 1.2, .4)) + G("", tag("الشرارة تتأخر", 470, 690, 1, 24, ORANGE), late);
});
// 18 · safe, but weaker and thirstier; keep knocking and the piston crown can crack
shot(18, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, 1.4), cr = at(u, d * .55, .5);
  return paper() + G("", gauge(170, 300, 110, lerp(.8, .45, k), "العزم") + gauge(470, 300, 110, lerp(.4, .8, k), "الصرف"), 1 - cr * .7) +
    appear(cr, pistonBroken(320, 520, 1.25, at(u, d * .6, .6)));
});
// 19 · higher than asked: no harm… and no benefit
shot(19, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + egyPump(320, 740, 1.05, "95", t, { big: .6 }) + G("", tag("ضرر", 160, 150, 1, 32) + cross(160, 230, .9, at(u, d * .4, .4)), at(u, d * .3, .3)) + G("", tag("فايدة", 480, 150, 1, 32) + cross(480, 230, .9, at(u, d * .75, .4)), at(u, d * .65, .3));
});
// 20 · the myth: «more energy» — crossed out
shot(20, push(320, 400, 1.06, .98), function (u, d, t) {
  return paper() + litre(320, 520, "95", GCOL[2], 1) + G("", tag("طاقة أكتر؟", 320, 220, 1, 40, ORANGE), at(u, .2, .4)) + arrow(320, 330, 320, 290 - 8 * Math.sin(t * 4), ORANGE, 6, 1) + cross(320, 240, 1.8, at(u, d * .7, .5));
});
// 21 · a litre of each holds about the same energy; the extra money buys nothing
shot(21, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, 1.2), s = paper() + litre(200, 480, "92", GCOL[1], k) + litre(440, 480, "95", GCOL[2], k) + T("≈", 320, 420, 70, ORANGE, 800);
  for (var i = 0; i < 4; i++) { var p = clamp((u - d * .55 - i * .2) / 1); if (p > 0) s += coin(440 + 60 * p + i * 10, 240 - 140 * p + 10 * Math.sin(t * 5 + i), 22); }
  return s;
});
// 22 · 98 abroad: same idea, for engines that squeeze harder (sports cars)
shot(22, push(320, 420, .92, 1.0), function (u, d, t) {
  return paper() + R(-400, 470, 1440, 30, "#6a665e", 2.4) + R(-400, 500, 1440, 400, "#d9cfb6", 0) + car({ x: 330 - 30 * u, y: 430, pitch: 0, t: t, spin: 1 }) + numBox("98", 320, 200, at(u, .3, .3), 54) + T("في دول برا", 320, 270, 26, MUTE, 700) + G("", numBox("12:1", 530, 330, 1, 26), at(u, d * .55, .4));
});
// 23 · «يعني من الآخر»: not strength, tolerance — the number in the manual, no less, no more
shot(23, push(320, 400, .98, 1.04), function (u, d, t) {
  return paper() + G("", T("قوة", 190, 215, 44, INK, 800) + cross(190, 185, 1, at(u, .5, .4)), at(u, .1, .3)) + G("", tag("تحمّل", 450, 200, 1, 44, BLUE), at(u, 1, .3)) +
    manual(320, 470, .9) + G("", T("لا أقل", 150, 470, 30, INK, 800) + T("ولا أكتر", 490, 470, 30, INK, 800), at(u, d * .55, .4));
});
// 24 · the odd fact: 100-octane fuel let the RAF raise the boost of its fighters
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, d * .45, 1.5);
  return paper() + spitfire(60 - 120 * k, 400 + 8 * Math.sin(t * 2), .9, t) + numBox("100", 320, 170, at(u, .6, .3), 50) + T("1940", 320, 640, 30, MUTE, 800) +
    G("", wave(620 - 120 * k, 370, 700, 370, t, MUTE, 4, 30, 1, 2) + wave(620 - 120 * k, 420, 700, 420, t, MUTE, 4, 30, 1, 2), k);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: three pumps, one per grade, lighting one by one. line 1: the 95 sticker grows — «أقوى؟». line 2: «قوة» crossed out
  var u0 = t - LN[0].start, s = G("translate(0 10) scale(.7)", station(t, li === 0 ? clamp((u0 - .6) / 2.6) : 1, li >= 1 ? 2 : -1, li >= 1 ? ease((t - LN[1].start) / .6) : 0));
  if (li === 1) { var u1 = t - LN[1].start; s += arrow(380, 330, 452 + 4 * Math.sin(t * 4), 222, ORANGE, 6, ease((u1 - .3) / .4)) + tag("أحسن للموتور؟", 470, 150, ease(u1 / .4), 30, OLIVE) + tag("أوفر؟", 500, 250, ease((u1 - 1.2) / .4), 34, ORANGE) + G("translate(400 250)", coin(0, 4 * Math.sin(t * 5), 18), ease((u1 - 1.4) / .3)); }
  if (li >= 2) { var u2 = t - LN[2].start; s += tag("أعلى ≠ أحسن", 430, 190, ease(u2 / .4), 40, ORANGE) + G("", T("!", 560, 140, 70, ORANGE, 900), ease((u2 - .3) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 192) scale(.4)", egyPump(0, 0, 1, "95", t, { big: .5 + .5 * Math.sin(t * 3) })); };
SCENE.outro = function (svg, u, t) {
  return G("translate(170 60) scale(.27)", engine({ th: 6, t: t, heat: .6, flame: .3, knock: .5, sensor: 1 })) +
    callout("1", 256, 30, ease(u / .3)) + callout("2", 300, 120, ease(u / .3 - .5)) + callout("3", 214, 84, ease(u / .3 - 1)) + callout("4", 330, 150, ease(u / .3 - 1.5)) +
    numBox("80", 440, 70, 1, 22) + numBox("92", 440, 140, 1, 22) + numBox("95", 440, 210, 1, 22) + '<path d="M500 60 V220" stroke="' + ORANGE + '" stroke-width="4"/>' + arrow(520, 220, 520, 70, ORANGE, 4, 1);
};
