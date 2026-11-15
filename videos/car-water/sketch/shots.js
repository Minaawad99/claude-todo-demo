// ── «لو عربيتك وقعت في المية» — drawings in the «اسكتش» hand (reference v18: the car in profile as a cut-away). The car is a
// compact sedan drawn to real size; people use the real-proportion figures from videos/choking/sketch/shots.js.
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
function stopwatch(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 14, y - r - 26, 28, 18, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 10, "none", 1.2);
  for (var i = 0; i < 4; i++) { var b = -Math.PI / 2 + i * Math.PI / 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 22)) + ' ' + f(y + Math.sin(b) * (r - 22)) + ' L' + f(x + Math.cos(b) * (r - 10)) + ' ' + f(y + Math.sin(b) * (r - 10)) + '" stroke="' + INK + '" stroke-width="4"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 12) + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}

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
// the canal water from the side, eye level: a translucent body over everything under the surface
function sea(y, t, dark) {
  var top = "M-400 " + f(y); for (var x = -400; x <= 1040; x += 12) top += " L" + x + " " + f(y + 4 * Math.sin((x - t * 60) * .04));
  return '<path d="' + top + ' L1040 1400 L-400 1400 Z" fill="' + WATER + '" opacity="' + (dark ? .92 : .62) + '"/>' + '<path d="' + top + '" stroke="#e8eef0" stroke-width="3" fill="none"/>' +
    '<rect x="-400" y="' + f(y + 300) + '" width="1440" height="900" fill="#2d4a5c" opacity=".18"/>';
}
// the canal bank: a dirt slope with a road on top (left side)
function bank(t) { return P("M-400 300 L120 300 L300 560 L300 1400 L-400 1400 Z", MUD, 2.4) + '<path d="M-400 300 L120 300 L300 560 L300 1400 L-400 1400 Z" fill="url(#hatch)" opacity=".5"/>' + R(-400, 288, 520, 14, "#6a665e", 2) + '<path d="M-380 295 h60 M-280 295 h60 M-180 295 h60 M-80 295 h60 M20 295 h60" stroke="#e8e1cf" stroke-width="3"/>'; }
// a crack spreading from (x, y)
function crackS(x, y, k) { var s = ""; for (var i = 0; i < 9; i++) { var a = i * 0.7 + .3, l = 70 * clamp(k * 1.4) * (.6 + hash(i) * .6); s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * l * .5 + 4) + ' ' + f(y + Math.sin(a) * l * .5) + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a + .2) * l) + ' ' + f(y + Math.sin(a + .2) * l) + '" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>'; } return s; }
function bubbles(x, y, t, n, h) { var s = ""; for (var i = 0; i < n; i++) { var p = ((t * .7 + hash(i) ) % 1), bx = x + (hash(i + 7) - .5) * 60 + 6 * Math.sin(t * 3 + i); s += '<circle cx="' + f(bx) + '" cy="' + f(y - p * (h || 200)) + '" r="' + f(3 + hash(i + 3) * 6) + '" fill="none" stroke="#e8eef0" stroke-width="2" opacity="' + f(1 - p) + '"/>'; } return s; }
// the emergency hammer: red handle, steel double point, a belt cutter at the end
function hammer(x, y, ang, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + (sc || 1) + ")", R(-8, 0, 16, 90, ORANGE, 2, 5) + P("M-30 -14 L30 -14 L36 0 L30 8 L-30 8 L-36 0 Z", "#9aa2ac", 2) + '<path d="M-36 0 l-8 -3 l0 6 z M36 0 l8 -3 l0 6 z" fill="' + INK + '"/>' + R(-10, 86, 20, 16, "#3a352e", 1.6, 3)); }
// the driver in the car (car-local), with the seat belt across the chest; belt: 0 on … 1 off
function driver(belt, o) { o = o || {}; var d = seated(262, -66, .525, o), sh = d.at(110, -18), hp = d.at(6, 18), k = clamp(belt || 0);
  var end = [lerp(hp[0], 296, k), lerp(hp[1], -148, k)];
  return d.far + d.body + '<path d="M298 -150 L' + f(sh[0]) + ' ' + f(sh[1]) + ' L' + f(end[0]) + ' ' + f(end[1]) + '" stroke="#3a352e" stroke-width="7" fill="none" stroke-linejoin="round" opacity="' + (k >= 1 ? 0 : 1) + '"/>' + R(hp[0] - 6, hp[1] - 6, 14, 12, "#9aa2ac", 1.4, 2) + d.near; }
function kid(o) { o = o || {}; return whole(seated(398, -64, .33, { shirt: "#c98a5a", hands: [[370, -80], [372, -78]], legs: [[80, -60], [76, -60]], lean: -10 })); }
// four steps as icon chips: belt, window, kids, out; on = how many are lit, cur = the current one
function steps4(x, y, on, cur, sc) {
  var names = ["الحزام", "الشباك", "العيال", "اطلع"], s = "";
  names.forEach(function (n, i) { var cx = x + (1.5 - i) * 78 * (sc || 1), lit = i < on, c = i === cur;
    s += G("translate(" + f(cx) + " " + y + ") scale(" + (sc || 1) * (c ? 1.12 : 1) + ")", '<rect x="-34" y="-30" width="68" height="60" rx="8" fill="' + (c ? ORANGE : lit ? "#f4ecdb" : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), 0, -2, 22, c ? "#fff" : INK) + T(n, 0, 22, 14, c ? "#fff" : INK, 800)); });
  return s;
}

// ── shots (one per idea; line numbers from script.txt). The car floats at (320, 420); its sill is at world y 392.
var CX = 320, CY = 420;
function bob(t) { return 3 * Math.sin(t * 1.3); }
function floating(t, o) { o = o || {}; return car(Object.assign({ x: CX, y: CY + bob(t), pitch: -3 + 1.2 * Math.sin(t * .9), t: t, sea: CY - 14, people: function (tt) { return driver(0); } }, o)); }
// 4 · «طب ليه الباب مش هيتفتح؟»: the door, highlighted, and a question mark
shot(4, push(300, 400, 1.15, 1.25), function (u, d, t) {
  return paper() + floating(t, { hlDoor: at(u, .2, .4) }) + G("", T("؟", 230, 250, 120, ORANGE, 800), at(u, .3, .3));
});
// 5 · water outside pushes on the door; inside there is only air
shot(5, push(260, 400, 1.4, 1.5), function (u, d, t) {
  var s = paper() + floating(t, { hlDoor: .6 }), k = at(u, .6, .6);
  for (var i = 0; i < 5; i++) { var y = 420 + i * 14 + bob(t), L = 40 + i * 10; s += arrow(170 - L - 8 * Math.sin(t * 4 + i), y, 172, y, ORANGE, 4, k); }
  return s + label(140, 470, 120, 580, "المية برا", BLUE, at(u, 1, .5), 22) + label(250, 360, 300, 250, "هوا جوه", INK, at(u, 2.2, .5), 22);
});
// 6 · with the water at the sill, about 200 kg pushes on the door
shot(6, push(300, 420, 1.2, 1.1), function (u, d, t) {
  var s = paper() + floating(t, { hlDoor: .6 }), k = at(u, .5, 1.2);
  for (var i = 0; i < 5; i++) { var y = 410 + i * 16 + bob(t), L = 30 + i * 22; s += arrow(176 - L - 6 * Math.sin(t * 4 + i), y, 178, y, ORANGE, 5, 1); }
  return s + measure(470, CY - 14, 470, CY + 58, k, "", 0) + G("", T("حوالي 60 سم", 560, CY + 30, 18, BLUE, 700), at(u, 1, .3)) + numBox(count(200, k) + " kg", 230, 620, at(u, .4, .3), 40) + G("", T("على الباب", 230, 680, 24, INK, 800), at(u, .8, .3));
});
// 7 · like someone heavy leaning on the door from outside
shot(7, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var lean = fig({ x: 470, y: 600, lean: -28 + 2 * Math.sin(t * 2), shirt: "#8f7f9a", hands: [[380, 430], [384, 440]], bend: [1, 1], legs: [[-30, 10], [-20, 4]] });
  return paper() + floor(812) + R(260, 260, 110, 360, BODY, 2.6) + R(276, 280, 78, 90, GLASS, 2) + R(332, 450, 22, 8, INK, 0, 3) + whole(lean) +
    G("", numBox("200 kg", 470, 200, 1, 32), at(u, .4, .3)) + iconBox(120, 140, 150, '<path d="M-60 0 Q-30 -10 0 0 T60 0 V50 H-60 Z" fill="' + WATER + '" opacity=".7"/>' + arrow(-40, 20, 20, 20, BLUE, 4, 1) + R(24, -50, 20, 100, BODY, 2), at(u, .2, .3));
}, { tr: "out" });
// 8 · forget the door; four words
hud(9, 16, function (u, t) { var li = 0; for (var i = 9; i < 16; i++) if (startOf(i) <= t) li = i; var cur = li >= 15 ? 3 : li === 14 ? 2 : li >= 10 ? 1 : 0; return steps4(320, 60, cur + 1, cur, .8); });
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c = window.CHUNKS[8], D = LN[8].end - LN[8].start, s = paper() + floating(t, {}), on = 0;
  for (var i = 0; i < 4; i++) if (u > D * (c[1] || .4) + i * (D * (1 - (c[1] || .4)) / 4)) on = i + 1;
  return s + cross(220, 410, 1.1, at(u, .4, .4)) + G("", steps4(320, 160, on, on - 1, 1), at(u, D * (c[1] || .4) - .2, .3));
});
// 9 · first: the seat belt off, before anything else
shot(9, push(250, 330, 2.1, 2.3), function (u, d, t) {
  var k = at(u, .6, .8);
  return paper() + floating(t, { people: function () { return driver(k); } }) + label(200, 360, 120, 230, "فك الحزام", ORANGE, at(u, 1.2, .5), 13);
}, { tr: "in" });
// 10 · then open the window at once, while it is still above the water
shot(10, push(250, 340, 1.9, 1.8), function (u, d, t) {
  var w = at(u, .5, 1.6);
  return paper() + floating(t, { win: w, people: function () { return driver(1); } }) + label(230, 330, 150, 230, "الشباك", OLIVE, at(u, .3, .4), 13) + arrow(230, 300, 230, 330, ORANGE, 3, at(u, .5, .4));
});
// 11 · electric windows usually keep working for a while: don't wait
shot(11, push(250, 340, 1.8, 1.9), function (u, d, t) {
  var press = Math.abs(Math.sin(t * 3)) > .5 ? 1 : 0;
  return paper() + floating(t, { win: .4 + .5 * at(u, .4, 2.4), people: function () { return driver(1); } }) +
    inset(320, 230, 66, R(-40, -20, 80, 40, "#5a5650", 2, 8) + P("M-26 -10 L-10 -10 L-18 -20 Z", "#fff", 0) + P("M10 10 L26 10 L18 20 Z", "#fff", 0) + G("translate(" + f(-8) + " " + f(-30 + press * 10) + ")", '<path d="M-8 -60 v50 a10 10 0 0 0 20 0 v-50" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'), at(u, .3, .3)) +
    G("", T("ماتستناش", 320, 320, 18, ORANGE, 800), at(u, 1.6, .3));
});
// 12 · if it won't open: the emergency hammer, on a corner of the glass, not the middle
shot(12, push(240, 340, 2.0, 2.1), function (u, d, t) {
  var hit = at(u, 1.6, .25), br = at(u, 1.85, .5), sw = Math.sin(clamp((u - 1.0) / .6) * Math.PI / 2);
  return paper() + floating(t, { broken: u > 2.6 ? 1 : br, people: function () { return driver(1, { hands: [[300 - 30 * sw, -150 + 10 * sw], [196, -104]] }); } }) +
    (u < 2.6 ? hammer(286 + 26 * (1 - sw), 300 - 18 * (1 - sw), 60 - 50 * sw, .5) : "") + label(286, 302, 340, 230, "الركن", ORANGE, at(u, 2.6, .4), 13) + G("", cross(200, 290, .5, at(u, 3, .3)), at(u, 3, .2)) + G("", T("مش النص", 200, 262, 12, ORANGE, 800), at(u, 3.1, .3));
});
// 13 · leave the windscreen alone
shot(13, push(220, 330, 1.6, 1.7), function (u, d, t) { return paper() + floating(t, { broken: 1, people: function () { return driver(1); } }) + cross(195, 270, .8, at(u, .3, .4)) + label(195, 280, 110, 200, "الإزاز اللي قدام", INK, at(u, .2, .4), 14); });
// 14 · children: belts off, out through the window before you
shot(14, push(360, 360, 1.7, 1.6), function (u, d, t) {
  var k = at(u, 1.4, 1.6);
  return paper() + floating(t, { broken: 1, winR: 1, people: function () { return driver(1) + (k < .3 ? kid() : ""); } }) +
    (k >= .3 ? G("translate(" + f(lerp(380, 400, k)) + " " + f(lerp(330, 250, k)) + ") rotate(" + f(-60 * k) + ")", whole(fig({ x: 0, y: 0, s: .33, lean: 30, shirt: "#c98a5a", hands: [[-40, -150], [-30, -150]], bend: [1, 1] }))) : "") +
    label(400, 330, 430, 230, "العيال الأول", ORANGE, at(u, .3, .4), 14);
});
// 15 · then you, straight out, and swim away from the car
shot(15, pan(250, 380, 120, 380, 1.1), function (u, d, t) {
  var k = at(u, .4, 2.2), sx = lerp(190, -60, k), stroke = Math.sin(t * 5);
  var sw = G("translate(" + f(sx) + " " + f(CY - 12) + ") rotate(-84)", whole(fig({ x: 0, y: 0, s: .525, lean: 0, hands: [[-70 * stroke, -150], [70 * stroke, -150]], bend: [1, -1], legs: [[10 * stroke, 0], [-10 * stroke, 0]] })));
  return paper() + floating(t, { broken: 1, winR: 1, people: function () { return ""; } }) + sw + arrow(sx - 120, CY - 50, sx - 180, CY - 50, ORANGE, 5, at(u, .8, .4)) + G("", T("بعيد عن العربية", sx + 40, CY - 110, 22, ORANGE, 800), at(u, 1, .3));
}, { tr: "out" });
// 16 · why the hurry? a stopwatch over the floating car
shot(16, push(320, 380, 1.0, 1.05), function (u, d, t) { return paper() + floating(t, {}) + G("translate(470 180)", stopwatch(0, 0, 60, (u % 6) / 6)) + G("", T("؟", 160, 230, 110, ORANGE, 800), at(u, .2, .3)); });
// 17 · the engine is heavy: the nose goes down first, water pours in through the windows
shot(17, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .3, d - .6), p = lerp(-3, -24, k);
  return paper() + car({ x: CX, y: CY + 40 * k, pitch: p, t: t, sea: CY - 14, win: 1, inside: lerp(-40, -100, k), people: function () { return driver(1, { mouth: 1 }); } }) +
    label(120, 450 + 60 * k, 230, 640, "الموتور تقيل", OLIVE, at(u, .6, .5), 22) + arrow(150, 360, 200, 400 + 30 * k, BLUE, 5, at(u, 1.8, .4)) + G("", T("المية بتدخل", 130, 340, 20, BLUE, 800), at(u, 1.8, .3));
});
// 18 · in a minute or two it is all under water
shot(18, push(320, 460, 1.0, 0.94), function (u, d, t) {
  var k = at(u, .2, d - .5);
  return paper() + car({ x: CX, y: lerp(470, 640, k), pitch: lerp(-24, -12, k), t: t, sea: 300, inside: -200, win: 1, people: function () { return ""; } }) + bubbles(240, 520, t, 10, 220) + numBox("1–2", 470, 180, at(u, .3, .3), 40) + G("", T("دقيقة", 470, 240, 24, INK, 800), at(u, .5, .3));
}, { tr: "out" });
// 19 · the myth: wait for it to fill, then open the door — no
shot(19, push(300, 440, 1.15, 1.25), function (u, d, t) {
  var k = at(u, .3, d * .5);
  return paper() + car({ x: CX, y: 460, pitch: -6, t: t, sea: CY - 120, inside: lerp(-60, -168, k), hlDoor: at(u, d * .4, .4), people: function () { return driver(1, { mouth: 1 }); } }) + bubbles(220, 360, t, 6, 120) + cross(240, 460, 1.4, at(u, d - 1, .4));
});
// 20 · by then: dark, under water, out of breath
shot(20, push(300, 440, 1.3, 1.45), function (u, d, t) {
  var k = at(u, .2, d - .4);
  return paper() + car({ x: CX, y: 460, pitch: -6, t: t, sea: 200, dark: 1, inside: -175, people: function () { return driver(1, { mouth: 1 }); } }) + bubbles(250, 380, t, 8, 150) + G("translate(470 230)", R(-14, -80, 28, 120, "#f4ecdb", 2, 6) + R(-10, -76 + 112 * k, 20, 112 * (1 - k), BLUE, 0, 4) + T("O₂", 0, 66, 20, BLUE, 800), at(u, .3, .3));
});
// 21 · don't phone from inside: out first, then call
shot(21, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var c = window.CHUNKS[21], D = LN[21].end - LN[21].start, second = u > D * (c[1] || .5), ph = '<rect x="-24" y="-44" width="48" height="88" rx="8" fill="#3a352e" stroke="' + INK + '" stroke-width="2"/><rect x="-18" y="-36" width="36" height="64" rx="3" fill="#e9ecea"/>';
  return paper() + (second ? bank(t) + sea(380, t) + whole(fig({ x: 60, y: 76, s: .8, lean: 4, shirt: SHIRT_V, hands: [[30, -210], null], bend: [-1, -1] })) + G("translate(36 -216) scale(.5)", ph) + check(160, 160, 1.3, at(u, D * (c[1] || .5) + .3, .4)) : floating(t, { people: function () { return driver(1, { hands: [[226, -150], [196, -104]] }); } }) + G("translate(226 335) scale(.3)", ph) + cross(240, 300, 1.1, at(u, .5, .4)));
});
// 22 · «يعني من الآخر»: the four steps, the door crossed out
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var c = window.CHUNKS[22], D = LN[22].end - LN[22].start, on = 0;
  for (var i = 0; i < 4; i++) if (u > D * ((c[1] || .25) + i * .12)) on = i + 1;
  return paper() + floating(t, { win: 1 }) + steps4(320, 160, on, on - 1, 1) + cross(220, 410, 1.1, at(u, D * .82, .4)) + G("", T("الباب", 220, 480, 22, ORANGE, 800), at(u, D * .82, .3));
});
// 23 · the odd fact: the windscreen is glass–plastic–glass; a hammer only cracks it
shot(23, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var hit = (u % 1.4) / 1.4, k = at(u, 1.2, .6), s = paper();
  s += R(140, 260, 360, 34, GLASS, 2.4) + R(140, 294, 360, 12, "#e8d79a", 2) + R(140, 306, 360, 34, GLASS, 2.4) + crackS(320, 280, k) + crackS(320, 322, k * .8);
  s += label(500, 300, 515, 400, "بلاستيك", OLIVE, at(u, .6, .5), 22) + label(470, 274, 515, 200, "إزاز", BLUE, at(u, .4, .5), 22) + label(470, 326, 515, 470, "إزاز", BLUE, at(u, .5, .5), 22);
  s += hammer(320, 250 - 60 * Math.sin(hit * Math.PI), -90 - 30 * Math.sin(hit * Math.PI), 1) + impact(320, 262, hit < .2 ? hit * 5 : 0);
  return s + G("", T("بيشرخ بس", 320, 560, 34, ORANGE, 800), at(u, 2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the car slides off the canal road into the water. line 1: it floats, the water still under the windows. line 2: the stopwatch from 1:00
  var u0 = t - LN[0].start, k = li === 0 ? clamp((u0 - .8) / 2.2) : 1, x = lerp(150, 380, k), y = lerp(250, 430, ease(k)), p = li === 0 ? lerp(0, 22, Math.sin(k * Math.PI)) * (k < .5 ? 1 : 1) - 3 * k : -3 + 1.2 * Math.sin(t * .9);
  var s = G("translate(0 -40) scale(.95)", bank(t) + car({ x: x, y: y + (k >= 1 ? bob(t) : 0), pitch: li === 0 ? lerp(0, 28, Math.sin(k * Math.PI * .9)) - 3 * k : p, t: t, spin: k < 1 ? 1 : 0, people: function () { return driver(0, { mouth: li >= 1 ? 1 : 0 }); } }) + sea(450, t));
  if (li === 0 && k > .85) s += G("", '<path d="M300 380 q20 -40 40 0 M340 370 q30 -50 60 0" stroke="#e8eef0" stroke-width="4" fill="none"/>', 1 - clamp((u0 - 3) / .5));
  if (li >= 1) s += label(410, 368, 380, 250, "المية تحت الشباك", BLUE, clamp((t - LN[1].start - .4) / .6), 20);
  if (li >= 2) { var v = t - LN[2].start; s += iconBox(500, 120, 150, stopwatch(0, 0, 52, v / 60), ease(v / .4)) + G("", N("0:" + ("0" + Math.max(0, 60 - Math.ceil(v))).slice(-2), 500, 236, 34, ORANGE), ease((v - .2) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(-6 40) scale(.33) translate(-50 -200)", car({ x: 320, y: 420 + bob(t), pitch: -3 + 2 * Math.sin(t * 1.4), t: t, sea: 406, people: function () { return driver(0); } })); };
SCENE.outro = function (svg, u, t) {
  return G("translate(10 -150) scale(.85)", car({ x: 320, y: 420 + bob(t), pitch: -3, t: t, sea: 406, win: 1, people: function () { return driver(.5) + kid(); } })) +
    callout("1", 222, 160, ease(u / .3)) + callout("2", 200, 95, ease(u / .3 - .5)) + callout("3", 350, 120, ease(u / .3 - 1)) + callout("4", 70, 90, ease(u / .3 - 1.5)) + arrow(150, 90, 90, 90, ORANGE, 4, ease(u / .3 - 1.5));
};
