// ── «القيلولة المظبوطة قد إيه؟» — drawings. Shapes follow the «طب إزاي؟» sleep references (sheets v04, v06, v11: a
// side-view sleeper, a stepped sleep-stage graph, an analog clock) and real references (refs/SOURCES.md): the stairs follow
// a real first sleep cycle (wake → N1 → N2 → N3 at ~25 min → N2 → REM at ~70–90 min). People: real body proportions, copied
// from videos/choking/sketch/shots.js (Drillis & Contini). Furniture to the same scale (sofa seat 0.26H, arm 0.37H).

// ── people (from «لو حد شرق قدامك») ──
var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
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
function brainIcon(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#9aa86e") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }

// ── furniture, at the people's scale (s = figure scale, H = 400·s) ──
var SOFA = "#8e9468", SOFA_D = "#6f7550", BLANKET = "#8aa0ae", PILLOW = "#efe6d2", SHIRT_N = "#c8b48f";
// a sofa seen from the front, lengthwise: seat 0.26H, arms 0.37H, back 0.49H, short legs
function sofa(x0, fl, w, s) {
  var st = fl - 104 * s, a = 30 * s, r = "";
  r += R(x0 + a * .6, fl - 196 * s, w - a * 1.2, 100 * s, SOFA_D, 2.2, 10 * s);                       // back cushion
  r += R(x0 + 14 * s, fl - 18 * s, 10 * s, 18 * s, WOOD_D, 1.6) + R(x0 + w - 24 * s, fl - 18 * s, 10 * s, 18 * s, WOOD_D, 1.6);
  r += R(x0, st + 30 * s, w, 74 * s - 18 * s, SOFA_D, 2.2, 4) + R(x0 + a, st, w - 2 * a, 34 * s, SOFA, 2.2, 8 * s);   // base, seat cushion
  r += '<path d="M' + f(x0 + w / 2) + ' ' + f(st + 4 * s) + ' v' + f(28 * s) + '" stroke="' + INK + '" stroke-width="1.4"/>';
  r += R(x0, fl - 150 * s, a, 132 * s, SOFA, 2.2, 10 * s) + R(x0 + w - a, fl - 150 * s, a, 132 * s, SOFA, 2.2, 10 * s);   // arms
  return r;
}
function seatTop(fl, s) { return fl - 104 * s; }
// a man asleep on his back on the sofa: head to the right on a pillow, a blanket over the legs, a hand on the belly that rises with the breath
function sleeper(hx, fl, s, t, opt) {
  opt = opt || {}; var st = seatTop(fl, s), br = Math.sin(t * 1.6), m = fig({ x: hx, y: st - 26 * s, s: s, lean: -90, legs: [[90, 0], [88, 2]], hands: [rel(40, 30 + 2 * br), rel(48, 26 + 2 * br)], bend: [-1, -1], shirt: opt.shirt || SHIRT_N });
  var pil = '<ellipse cx="' + f(hx + 172 * s) + '" cy="' + f(st - 6 * s) + '" rx="' + f(46 * s) + '" ry="' + f(16 * s) + '" fill="' + PILLOW + '" stroke="' + INK + '" stroke-width="2"/>';
  var bl = '<path d="M' + f(hx + 46 * s) + ' ' + f(st + 8 * s) + ' C' + f(hx + 50 * s) + ' ' + f(st - 52 * s - 2 * br * s) + ' ' + f(hx - 60 * s) + ' ' + f(st - 52 * s) + ' ' + f(hx - 150 * s) + ' ' + f(st - 42 * s) + ' C' + f(hx - 210 * s) + ' ' + f(st - 36 * s) + ' ' + f(hx - 250 * s) + ' ' + f(st - 40 * s) + ' ' + f(hx - 258 * s) + ' ' + f(st + 8 * s) + ' Z" fill="' + BLANKET + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(hx - 30 * s) + ' ' + f(st - 46 * s) + ' l-10 ' + f(52 * s) + ' M' + f(hx - 110 * s) + ' ' + f(st - 44 * s) + ' l-6 ' + f(52 * s) + ' M' + f(hx - 190 * s) + ' ' + f(st - 38 * s) + ' l-4 ' + f(46 * s) + '" stroke="#6f8796" stroke-width="3"/>';
  return pil + m.far + m.body + bl + m.near;
}
// the same man sitting on the edge of the sofa, slumped and groggy: hands on the knees, the head hanging and swaying
function groggy(hx, fl, s, t) {
  var sw = Math.sin(t * 1.3), y = fl - 105 * s, kn = [hx - 96 * s, y + 17 * s];
  return whole(fig({ x: hx, y: y, s: s, lean: 22 + 3 * sw, legs: [[80, -80], [76, -76]], hands: [rel(176, 30), [kn[0] + 18 * s, kn[1] - 12 * s]], bend: [1, 1], tilt: -16 + 8 * sw }));
}
// standing up with both arms stretched over the head, fresh
function stretch(hx, fl, s, t) {
  var b = Math.sin(t * 2) * 4;
  return whole(fig({ x: hx, y: fl - 212 * s, s: s, lean: -4, hands: [rel(236 + b, 46), rel(240 - b, -36)], bend: [-1, 1], tilt: 8 }));
}
// a man walking (faces right when right = true), feet on the line y
function walker(x, y, s, ph, right, opt) {
  opt = opt || {}; var a = 18 * Math.sin(ph), m = fig({ x: x, y: y - 212 * s + 2 * Math.abs(Math.cos(ph)) * s, s: s, lean: 3, legs: [[a, -Math.max(0, a) * .2 - 4], [-a, -Math.max(0, -a) * .2 - 4]], hands: opt.hands, bend: [-1, -1], shirt: opt.shirt, tilt: opt.tilt });
  var g = whole(m);
  return right ? G("translate(" + f(2 * x) + " 0) scale(-1 1)", g) : g;
}

// ── marks ──
// "z z z" rising from a sleeper
function zzz(x, y, t, sz) { sz = sz || 30; var s = ""; for (var i = 0; i < 3; i++) { var p = (t * .45 + i / 3) % 1; s += G("", N("z", x + p * 40 + i * 4, y - p * 90, sz * (.6 + .5 * p), BLUE), Math.sin(p * Math.PI)); } return s; }
// a dizzy spiral turning over a head, two little stars round it
function dizzy(x, y, r, t, k) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var d = "";
  for (var i = 0; i <= 60; i++) { var a = i / 60 * Math.PI * 4 + t * 4, rr = r * i / 60; d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr * .45); }
  var st = ""; for (var j = 0; j < 2; j++) { var b = t * 3 + j * Math.PI, sx = x + Math.cos(b) * r * 1.2, sy = y + Math.sin(b) * r * .5; st += '<path d="M' + f(sx) + ' ' + f(sy - 8) + ' L' + f(sx + 2.5) + ' ' + f(sy - 2.5) + ' L' + f(sx + 8) + ' ' + f(sy) + ' L' + f(sx + 2.5) + ' ' + f(sy + 2.5) + ' L' + f(sx) + ' ' + f(sy + 8) + ' L' + f(sx - 2.5) + ' ' + f(sy + 2.5) + ' L' + f(sx - 8) + ' ' + f(sy) + ' L' + f(sx - 2.5) + ' ' + f(sy - 2.5) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return G("", '<path d="' + d + '" stroke="' + ORANGE + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' + st, k);
}
// a twin-bell alarm clock; min = minutes slept, drawn as an orange wedge (the first hour fills the face, the rest a second ring); ring shakes it
function alarmClock(x, y, r, min, ring, t) {
  var sh = ring ? 3 * Math.sin(t * 40) : 0, s = "";
  s += '<path d="M' + f(x - r * .55) + ' ' + f(y + r * .8) + ' l' + f(-r * .25) + ' ' + f(r * .35) + ' M' + f(x + r * .55) + ' ' + f(y + r * .8) + ' l' + f(r * .25) + ' ' + f(r * .35) + '" stroke="' + INK + '" stroke-width="' + f(r * .1) + '" stroke-linecap="round"/>';
  [-1, 1].forEach(function (d) { s += G("rotate(" + f(d * 35 + sh * 2) + " " + f(x) + " " + f(y) + ")", '<path d="M' + f(x - r * .32) + ' ' + f(y - r * 1.02) + ' A' + f(r * .32) + ' ' + f(r * .32) + ' 0 0 1 ' + f(x + r * .32) + ' ' + f(y - r * 1.02) + ' Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="2"/>'); });
  s += '<path d="M' + f(x - r * .25) + ' ' + f(y - r * 1.14) + ' h' + f(r * .5) + '" stroke="' + INK + '" stroke-width="' + f(r * .08) + '" stroke-linecap="round"/>';
  s += C(x, y, r, "#f4ecdb", Math.max(2, r * .07)) + C(x, y, r * .86, "none", 1.2);
  var m1 = Math.min(min, 60), a1 = -Math.PI / 2 + m1 / 60 * Math.PI * 2;
  if (m1 > 0.2) s += m1 >= 59.9 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .8) + '" fill="' + ORANGE + '" opacity=".3"/>' :
    '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r * .8) + ' A' + f(r * .8) + ' ' + f(r * .8) + ' 0 ' + (m1 > 30 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a1) * r * .8) + ' ' + f(y + Math.sin(a1) * r * .8) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  if (min > 60) { var m2 = Math.min(min - 60, 59.9), a2 = -Math.PI / 2 + m2 / 60 * Math.PI * 2; s += '<path d="M' + f(x) + ' ' + f(y - r * 1.12) + ' A' + f(r * 1.12) + ' ' + f(r * 1.12) + ' 0 ' + (m2 > 30 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a2) * r * 1.12) + ' ' + f(y + Math.sin(a2) * r * 1.12) + '" stroke="' + ORANGE + '" stroke-width="' + f(r * .12) + '" fill="none" stroke-linecap="round"/>'; }
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * r * .72) + ' ' + f(y + Math.sin(b) * r * .72) + ' L' + f(x + Math.cos(b) * r * .84) + ' ' + f(y + Math.sin(b) * r * .84) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3) + '"/>'; }
  var am = -Math.PI / 2 + min / 60 * Math.PI * 2, ah = -Math.PI / 2 + (2 + min / 60) / 12 * Math.PI * 2;
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(ah) * r * .45) + ' ' + f(y + Math.sin(ah) * r * .45) + '" stroke="' + INK + '" stroke-width="' + f(r * .09) + '" stroke-linecap="round"/>';
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(am) * r * .7) + ' ' + f(y + Math.sin(am) * r * .7) + '" stroke="' + INK + '" stroke-width="' + f(r * .05) + '" stroke-linecap="round"/>' + C(x, y, r * .06, INK, 0);
  if (ring) for (var k = 0; k < 3; k++) s += '<path d="M' + f(x + r * (1.25 + k * .18)) + ' ' + f(y - r * .9) + ' q' + f(r * .14) + ' ' + f(r * .3) + ' 0 ' + f(r * .6) + ' M' + f(x - r * (1.25 + k * .18)) + ' ' + f(y - r * .9) + ' q' + f(-r * .14) + ' ' + f(r * .3) + ' 0 ' + f(r * .6) + '" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(.5 + .5 * Math.sin(t * 12 + k)) + '"/>';
  return G("translate(" + f(sh) + " 0)", s);
}
// a brain-wave strip (EEG): amp and wavelength in px, speed in px/s; fast small waves for light sleep, big slow ones for deep
function eeg(x, y, w, h, amp, wl, speed, t, col, name, k) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var d = "", cy = y + h / 2 + 8;
  for (var i = 0; i <= w - 20; i += 2) { var p = (i + t * speed) / wl * Math.PI * 2, n = Math.sin(p * 3.7) * .18 + Math.sin(p * 7.3 + 1) * .1; d += (i ? " L" : "M") + f(x + 10 + i) + " " + f(cy + (Math.sin(p) + n) * amp); }
  return appear(k, R(x, y, w, h, "#f4ecdb", 1.8) + T(name, x + w - 12, y + 26, 20, col, 800, "start") + '<path d="' + d + '" stroke="' + col + '" stroke-width="2.6" fill="none" stroke-linejoin="round"/>');
}
// a speech bubble with its tail to the lower right
function bubble(x, y, w, h, text, k, sz) {
  k = pop(k == null ? 1 : k); if (k <= 0) return "";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", '<path d="M' + f(-w / 2) + ' ' + f(-h / 2) + ' H' + f(w / 2) + ' V' + f(h / 2) + ' H' + f(w / 4) + ' l18 22 l-4 -22 H' + f(-w / 2) + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' + T(text, 0, (sz || 28) * .35, sz || 28, ORANGE, 800));
}
function bulb(x, y, sc, on) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", (on ? [0, 1, 2, 3, 4].map(function (i) { var a = -Math.PI * (.1 + i * .2); return '<path d="M' + f(Math.cos(a) * 38) + ' ' + f(-10 + Math.sin(a) * 38) + ' L' + f(Math.cos(a) * 50) + ' ' + f(-10 + Math.sin(a) * 50) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; }).join("") : "") + '<path d="M-14 18 C-14 6 -26 0 -26 -12 A26 26 0 0 1 26 -12 C26 0 14 6 14 18 Z" fill="' + (on ? "#f0c66a" : "#f4ecdb") + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(-13, 18, 26, 14, GREY, 2) + '<path d="M-13 24 h26" stroke="' + INK + '" stroke-width="1.4"/>'); }
function heart(x, y, sc, b) { b = 1 + .08 * (b || 0); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc * b) + ")", '<path d="M0 26 C-30 4 -34 -12 -24 -22 C-14 -32 -2 -26 0 -16 C2 -26 14 -32 24 -22 C34 -12 30 4 0 26 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>'); }
function battery(x, y, sc, k) { var w = 60, h = 30; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", R(-w / 2, -h / 2, w, h, "#f4ecdb", 2.4, 4) + R(w / 2, -6, 6, 12, INK, 0) + (k > 0 ? R(-w / 2 + 4, -h / 2 + 4, (w - 8) * clamp(k), h - 8, k > .95 ? "#7d9a52" : ORANGE, 0) : "")); }

// ── the sleep stairs: a cut through the ground, one landing per stage, steps at real proportions for the figure (s = .35:
// rise 13.7 = 0.097H, run 22 = 0.16H). Wake → light → deeper → deep (the basement, ~25–60 min) → up to the dream landing → wake.
var ST = { s: .35, W: 230, L1: 285, L2: 340, L3: 395, REM: 258 };
var STEPS = [[-40, 230, "flat"], [60, 230, "down", 148, 285, 4], [148, 285, "flat"], [220, 285, "down", 308, 340, 4], [308, 340, "flat"], [380, 340, "down", 468, 395, 4], [468, 395, "flat"], [600, 395, "up", 820, 258, 10], [820, 258, "flat"], [900, 258, "up", 944, 230, 2], [944, 230, "flat"]];
var WALK = [[-10, 230], [60, 230], [148, 285], [220, 285], [308, 340], [380, 340], [468, 395], [600, 395], [820, 258], [900, 258], [944, 230], [1060, 230]];
var STAGE = [   // name, landing x0..x1, floor y, colour
  ["صاحي", -60, 60, 230, INK], ["خفيف", 148, 220, 285, OLIVE], ["أعمق", 308, 380, 340, "#6f8090"], ["عميق", 468, 600, 395, BLUE], ["أحلام", 820, 900, 258, ORANGE], ["صاحي", 944, 1080, 230, INK]];
var SPOT = { wake: 0, light: 184, mid: 344, deep: 534, rem: 860, up: 1000 };
function walkY(x) { for (var i = 1; i < WALK.length; i++) if (x <= WALK[i][0]) { var a = WALK[i - 1], b = WALK[i]; return lerp(a[1], b[1], clamp((x - a[0]) / (b[0] - a[0]))); } return WALK[WALK.length - 1][1]; }
function stairProfile() {
  var pts = [[-260, 230], [60, 230]];
  STEPS.forEach(function (q) { if (q[2] === "flat") return; var n = q[5], run = (q[3] - q[0]) / n, rise = (q[4] - q[1]) / n;
    for (var i = 0; i < n; i++) { if (rise > 0) { pts.push([q[0] + i * run, q[1] + (i + 1) * rise]); pts.push([q[0] + (i + 1) * run, q[1] + (i + 1) * rise]); } else { pts.push([q[0] + i * run, q[1] + (i + 1) * rise]); pts.push([q[0] + (i + 1) * run, q[1] + (i + 1) * rise]); } }
    var nx = STEPS[STEPS.indexOf(q) + 1]; if (nx) pts.push([nx[0], nx[1]]); });
  pts.push([1300, 230]); return pts;
}
var PROF = stairProfile();
// the stairs. op: {k (draw-in 0..1), hl (stage index to light up), labels (0..1), trail (x up to which the walked path glows), dimDeep}
function stairs(op) {
  op = op || {}; var d = "M" + PROF.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), s = "";
  s += '<path d="' + d + ' L1300 1300 L-260 1300 Z" fill="#d9cba8" stroke="none"/><path d="' + d + ' L1300 1300 L-260 1300 Z" fill="url(#hatch)" opacity=".55"/>';
  for (var j = 0; j < 16; j++) { var px = -200 + hash(j) * 1450, py = 470 + hash(j + 20) * 560; if (py > walkY(px) + 30) s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(10 + hash(j + 3) * 12) + '" ry="' + f(6 + hash(j + 5) * 6) + '" fill="#c4b28a" stroke="' + INK + '" stroke-width="1.2"/>'; }
  s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  STAGE.forEach(function (g, i) {
    var on = op.hl == null || op.hl === i || (op.hl === 0 && i === 5);
    s += '<path d="M' + g[1] + ' ' + (g[3] + 3) + ' H' + g[2] + '" stroke="' + g[4] + '" stroke-width="7" opacity="' + (on ? 1 : .35) + '"/>';
    if (op.labels !== 0) s += G("", T(g[0], (g[1] + g[2]) / 2 + (i === 0 ? 30 : i === 5 ? -10 : 0), g[3] + 40, 24, g[4], 800), clamp(op.labels == null ? 1 : op.labels) * (on ? 1 : .4));
  });
  if (op.trail != null && op.trail > -10) { var tp = "M-10 230"; WALK.forEach(function (p) { if (p[0] > -10 && p[0] <= op.trail) tp += " L" + p[0] + " " + f(p[1] - 6); }); tp += " L" + f(op.trail) + " " + f(walkY(op.trail) - 6); s += '<path d="' + tp + '" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-dasharray="10 7" stroke-linecap="round"/>'; }
  if (op.dimDeep) s += '<rect x="300" y="300" width="1100" height="500" fill="' + PAPER + '" opacity="' + f(.6 * op.dimDeep) + '"/>';
  return op.k == null ? s : sweep(-300, 0, 1620, 900, op.k, "r", s);
}
function manOn(x, t, opt) { opt = opt || {}; return walker(x, walkY(x), ST.s, opt.walk ? t * 9 : 0, opt.left ? false : true, opt); }
// eased walk through keyframes [[u, x], …]
function walkX(u, keys) { if (u <= keys[0][0]) return keys[0][1]; for (var i = 1; i < keys.length; i++) if (u <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease((u - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]))); return keys[keys.length - 1][1]; }
function moving(u, keys) { for (var i = 1; i < keys.length; i++) if (u > keys[i - 1][0] && u < keys[i][0] && keys[i][1] !== keys[i - 1][1]) return true; return false; }

// ── the hypnogram: minutes across, stages down (wake, dreams, light, deeper, deep), the real first cycle ──
var HYP = [[0, 0], [3, 2], [8, 3], [25, 4], [62, 3], [72, 1], [88, 0], [91, 2], [100, 3], [130, 3]], HROW = [INK, ORANGE, OLIVE, "#6f8090", BLUE], HNAME = ["صاحي", "أحلام", "خفيف", "أعمق", "عميق"];
function hypno(x, y, w, h, mMax, mDraw, op) {
  op = op || {}; var s = "", rh = h / 4, X = function (m) { return x + m / mMax * w; }, Y = function (r) { return y + r * rh; };
  if (op.band) s += R(X(op.band[0]), y - 14, X(op.band[1]) - X(op.band[0]), h + 28, op.band[2] || OLIVE, 0, 0, ' opacity=".18"');
  for (var r = 0; r < 5; r++) s += '<path d="M' + f(x) + ' ' + f(Y(r)) + ' H' + f(x + w) + '" stroke="' + MUTE + '" stroke-width="1" stroke-dasharray="4 5"/>' + T(HNAME[r], x + w + 50, Y(r) + 8, 20, HROW[r], 800);
  s += '<path d="M' + f(x) + ' ' + f(y - 20) + ' V' + f(y + h + 14) + ' H' + f(x + w + 6) + '" stroke="' + INK + '" stroke-width="2.2" fill="none"/>';
  for (var m = 0; m <= mMax; m += 10) s += '<path d="M' + f(X(m)) + ' ' + f(y + h + 14) + ' v' + (m % 30 ? 6 : 10) + '" stroke="' + INK + '" stroke-width="1.6"/>' + (m % 30 ? "" : N(String(m), X(m), y + h + 46, 22, INK));
  s += T("دقيقة", x + w + 50, y + h + 46, 18, MUTE, 700);
  // the stepped line up to mDraw; deep and dream stretches as thick coloured bars
  var d = "", bars = "", last = null;
  for (var i = 0; i < HYP.length - 1; i++) {
    var a = HYP[i][0], b = Math.min(HYP[i + 1][0], mDraw), row = HYP[i][1]; if (a >= mDraw) break;
    d += (d ? " L" + f(X(a)) + " " + f(Y(row)) : "M" + f(X(a)) + " " + f(Y(row))) + " L" + f(X(b)) + " " + f(Y(row));
    if (row === 4 || row === 1) bars += R(X(a), Y(row) - 7, X(b) - X(a), 14, HROW[row], 1.4);
    if (HYP[i + 1][0] < mDraw && i + 1 < HYP.length) d += " L" + f(X(HYP[i + 1][0])) + " " + f(Y(HYP[i + 1][1]));
    last = [X(b), Y(row)];
  }
  s += bars + '<path d="' + d + '" stroke="' + INK + '" stroke-width="3.2" fill="none" stroke-linejoin="round"/>';
  if (last && op.dot !== false) s += C(last[0], last[1], 7, PAPER, 2.4);
  (op.cuts || []).forEach(function (c) { var kk = clamp(c.k == null ? 1 : c.k); if (kk <= 0) return;
    s += G("", draw("M" + f(X(c.m)) + " " + f(y + h + 14) + " V" + f(y - 30), kk * 1.5, c.col || ORANGE, 3, ' stroke-dasharray="8 6"') + numBox(String(c.m), X(c.m), y - 52, clamp(kk * 2 - .6), 24) + (c.mark === "x" ? cross(X(c.m), y - 110, .8, kk * 2 - 1) : c.mark === "v" ? check(X(c.m), y - 110, 1.1, kk * 2 - 1, OLIVE) : ""), 1); });
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
var FL = 640, S1 = 1;   // the living-room floor for the full-size shots
// 4 · «قاعدة صغيرة»: the sleeper on the sofa, a rule card pinned over him
shot(4, push(320, 430, 1.0, 1.08), function (u, d, t) {
  return paper() + floor(FL) + dim(at(u, .2, .5), sofa(40, FL, 560, S1 * .95) + sleeper(250, FL, .95, t)) + zzz(470, 410, t) +
    G("", '<rect x="150" y="140" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 215)"/>' + C(320, 148, 9, ORANGE, 2) +
      T("قاعدة", 320, 210, 44, ORANGE, 800) + T("خليك فاكرها", 320, 262, 30, INK, 700), at(u, .3, .4));
});
// 5 · sleep is a staircase you go down step by step, then climb again: the whole cut draws itself left to right
hud(5, 6, function (u, t) { return tag("النوم = سلم", 320, 100, at(u, .3, .3), 40, ORANGE); });
shot(5, pan(300, 260, 700, 280, .74), function (u, d, t) {
  return paper() + stairs({ k: at(u, .2, 2.4), labels: at(u, 2.2, .6) }) + manOn(SPOT.wake, t) + draw("M90 180 Q320 120 520 330", at(u, 1.0, .9), ORANGE, 4, ' stroke-dasharray="10 8"') + arrow(500, 316, 520, 335, ORANGE, 4, at(u, 1.8, .2)) +
    draw("M640 470 Q760 470 860 190", at(u, 2.6, .8), ORANGE, 4, ' stroke-dasharray="10 8"') + arrow(855, 205, 862, 186, ORANGE, 4, at(u, 3.3, .2));
});
// 6 · the first minutes light, then deeper, then after ~30 min the deepest step: walk down, the camera follows
var K6 = [[.2, SPOT.wake], [1.1, SPOT.light], [1.8, SPOT.light], [2.6, SPOT.mid], [3.0, SPOT.mid], [4.2, SPOT.deep]];
shot(6, function (u, d) { var x = walkX(u, K6); return [x + 40, walkY(x) - 80, 1.0]; }, function (u, d, t) {
  var x = walkX(u, K6), hl = x < 100 ? 0 : x < 260 ? 1 : x < 420 ? 2 : 3;
  return paper() + stairs({ hl: hl }) + manOn(x, t, { walk: moving(u, K6) }) + (x > 500 ? zzz(x + 30, walkY(x) - 160, t) : "");
}, { tr: "in" });
// 7 · then up to the dream landing; the whole cycle is about 90 minutes
var K7 = [[.2, SPOT.deep], [2.2, SPOT.rem]];
shot(7, function (u, d) { var x = walkX(u, K7); return [lerp(560, 760, ease(u / d)), 250, .88]; }, function (u, d, t) {
  var x = walkX(u, K7), cl = at(u, 2.2, .4);
  return paper() + stairs({ hl: x < 700 ? 3 : 4 }) + manOn(x, t, { walk: moving(u, K7) }) +
    G("", P("M820 70 C800 40 840 20 860 36 C870 10 920 14 924 40 C950 36 964 70 940 84 C944 104 900 110 890 96 C870 112 830 104 836 86 C810 90 806 74 820 70 Z", "#f4ecdb", 2.2) + T("حلم", 880, 76, 26, ORANGE, 800) + C(860, 130, 7, "#f4ecdb", 1.8) + C(866, 152, 4.5, "#f4ecdb", 1.6), cl);
});
// 6–7 · a minutes counter that runs while he goes down and up
hud(6, 8, function (u, t) {
  var e7 = LN[7].start, m = t < e7 ? lerp(0, 30, clamp((t - LN[6].start - .2) / 4)) : lerp(30, 90, clamp((t - e7 - .2) / 2.6));
  return alarmClock(78, 92, 40, m, false, t) + N(Math.round(m) + "", 160, 104, 40, ORANGE, "start") + T("دقيقة", 186, 140, 20, INK, 700);
});
// 8 · «طب ليه الربع ساعة بتفوّقك؟»: the clock runs to 15 minutes
shot(8, push(320, 390, 1.1, 1.02), function (u, d, t) { return paper() + alarmClock(320, 380, 170, 15 * at(u, 0, .7), false, t) + G("", T("؟", 540, 300, 140, ORANGE, 800), at(u, .2, .3)) + numBox("15", 320, 640, at(u, .4, .3), 40); }, { tr: "out" });
// 9 · still on the light steps: the brain rests without diving; the deep part fades back
shot(9, push(200, 250, 1.25, 1.15), function (u, d, t) {
  return paper() + stairs({ hl: 1, dimDeep: at(u, .3, .6) }) + manOn(SPOT.light, t) + zzz(SPOT.light - 20, 120, t, 24) +
    draw("M260 300 Q300 360 360 380", at(u, 1.4, .6), BLUE, 3, ' stroke-dasharray="8 6"') + cross(370, 390, .7, at(u, 2.2, .5)) + tag("خفيف", 120, 90, at(u, .6, .3), 30, OLIVE);
});
// 10 · you wake easily, like someone calling you while you're still on the first steps: he turns and climbs back up
var K10 = [[1.2, SPOT.light], [2.4, SPOT.wake + 10]];
shot(10, push(120, 230, 1.3, 1.2), function (u, d, t) {
  var x = walkX(u, K10);
  return paper() + stairs({ hl: x < 100 ? 0 : 1, dimDeep: 1 }) + manOn(x, t, { left: true, walk: moving(u, K10) }) + bubble(-30, 70, 130, 62, "اصحى!", at(u, .3, .3)) + check(x - 70, 80, 1.2, at(u, 2.5, .4), OLIVE);
});
// 11 · the power nap, 10 to 20 minutes: a band on the graph, sharper focus, better mood
shot(11, push(330, 400, 1.12, 1.18), function (u, d, t) {
  var k = at(u, .2, 1.4);
  return paper() + hypno(70, 230, 420, 220, 60, lerp(0, 20, k), { band: [10, 20, OLIVE], cuts: [{ m: 20, k: at(u, 1.4, .5), col: OLIVE }] }) +
    G("", check(150, 600, .9, 1, OLIVE) + T("تركيز أعلى", 260, 610, 28, INK, 800), at(u, 2.4, .4)) + G("", check(150, 670, .9, 1, OLIVE) + T("مزاج أحسن", 260, 680, 28, INK, 800), at(u, 3.2, .4)) +
    G("", tag("القيلولة السريعة", 320, 120, 1, 30, OLIVE), at(u, .5, .4));
}, { tr: "fade" });
// 12 · «طب ليه الساعة بتدوّخك؟»: the clock runs round a full hour
shot(12, push(320, 390, 1.1, 1.02), function (u, d, t) { return paper() + alarmClock(320, 380, 170, 60 * at(u, 0, .6), false, t) + G("", T("؟", 540, 300, 140, ORANGE, 800), at(u, .2, .3)) + numBox("60", 320, 640, at(u, .3, .3), 40); }, { tr: "out" });
// 13 · down in deep sleep the brain runs slow, heavy waves (EEG strips from the sleeper's head)
shot(13, push(380, 400, 1.02, 1.1), function (u, d, t) {
  var hd = [260 + 166 * .9, seatTop(FL, .9) - 26 * .9];
  return paper() + floor(FL) + sofa(10, FL, 600, .9) + sleeper(260, FL, .9, t) +
    draw("M" + f(hd[0] + 6) + " " + f(hd[1] - 24) + " C" + f(hd[0] + 40) + " 380 560 380 560 330", at(u, .1, .5), INK, 1.6) + C(hd[0] + 6, hd[1] - 24, 4, ORANGE, 1) +
    dim(at(u, 1.6, .5), eeg(70, 110, 500, 96, 12, 26, 140, t, OLIVE, "خفيف", at(u, .3, .4))) + eeg(70, 230, 500, 110, 34, 150, 60, t, BLUE, "عميق: موجات بطيئة", at(u, 1.4, .4));
}, { tr: "in" });
// 14 · wake in the middle of it: the alarm rings in the basement and he is yanked straight up, dizzy
shot(14, push(330, 300, .82, .9), function (u, d, t) {
  var k = at(u, 1.5, .45), x = lerp(SPOT.deep, SPOT.wake + 20, k), y = lerp(ST.L3, ST.W, k), s = paper() + stairs({ hl: k < .5 ? 3 : 0 });
  s += G("", alarmClock(600, 230, 40, 45, u > .5 && u < 1.6, t), at(u, .3, .3));
  if (k > 0 && k < 1) for (var i = 0; i < 4; i++) s += '<path d="M' + f(x - 30 + i * 20) + ' ' + f(y + 20) + ' l' + f((SPOT.deep - SPOT.wake) * .1) + ' ' + f((ST.L3 - ST.W) * .25) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
  s += walker(x, y, ST.s, 0, true) + dizzy(x, y - 160, 26, t, at(u, 2.0, .4));
  return s + iconBox(500, 600, 150, '<path d="M-60 -40 H60 M-60 -40 V60 H60 V-40" stroke="' + INK + '" stroke-width="2.4" fill="#d9cba8"/><path d="M-40 -40 V40 H40 V-40" stroke="' + INK + '" stroke-width="1.6" fill="' + PAPER + '"/>' + T("البدروم", 0, 30, 20, INK, 800) + arrow(0, 10, 0, -66, ORANGE, 6, 1), at(u, 2.6, .3));
});
// 15 · sleep inertia: he sits on the edge of the sofa, groggy, for up to half an hour
shot(15, push(300, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + floor(FL) + sofa(60, FL, 520, .9) + groggy(360, FL, .9, t) + dizzy(290, 210, 40, t, at(u, .3, .4)) +
    tag("خمول النوم", 300, 110, at(u, .5, .4), 34, ORANGE) + G("", alarmClock(530, 260, 54, 30 * at(u, 1.6, 1.6), false, t) + N("30", 530, 360, 34, ORANGE) + T("دقيقة", 530, 392, 20, INK, 700), at(u, 1.4, .3));
}, { tr: "out" });
// 16 · even half an hour can brush the deep step: better mood, a bit heavy
shot(16, push(330, 420, 1.16, 1.1), function (u, d, t) {
  var k = at(u, .2, 1.4);
  return paper() + hypno(70, 230, 420, 220, 60, lerp(0, 30, k), { cuts: [{ m: 30, k: at(u, 1.4, .5) }] }) + G("", '<ellipse cx="' + f(70 + 27.5 / 60 * 420) + '" cy="' + f(230 + 220) + '" rx="34" ry="22" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>', at(u, 1.9, .3)) +
    label(70 + 28 / 60 * 420, 472, 360, 560, "لمست العميق", BLUE, at(u, 2.1, .5), 24) +
    G("", check(150, 640, .9, 1, OLIVE) + T("مزاج أحسن", 260, 650, 28, INK, 800), at(u, 3.0, .4)) + G("", T("~", 150, 724, 54, ORANGE, 800) + T("تقيل شوية", 260, 720, 28, INK, 800), at(u, 3.8, .4));
});
// 17 · «طب والساعة ونص؟»: the clock runs a full hour and half of another
shot(17, push(320, 390, 1.1, 1.02), function (u, d, t) { return paper() + alarmClock(320, 380, 160, 90 * at(u, 0, .7), false, t) + G("", T("؟", 550, 290, 140, ORANGE, 800), at(u, .2, .3)) + numBox("90", 320, 640, at(u, .4, .3), 40); }, { tr: "out" });
// 18 · the full cycle: the walked path glows all the way down and back up to the dream landing
var K18 = [[.2, SPOT.wake], [3.4, SPOT.rem]];
// the minutes along the walk (x on the stairs → minutes of the real cycle) and the graph drawing itself above, in step
function minAt(x) { var X = [SPOT.wake, 60, SPOT.light, 220, SPOT.mid, 380, SPOT.deep, 600, SPOT.rem], M = [0, 3, 6, 8, 18, 25, 45, 62, 80]; for (var i = 1; i < X.length; i++) if (x <= X[i]) return lerp(M[i - 1], M[i], clamp((x - X[i - 1]) / (X[i] - X[i - 1]))); return 80; }
hud(18, 19, function (u, t) { var m = minAt(walkX(u, K18)); return R(24, 40, 592, 230, "#f4ecdb", 1.6) + G("translate(48 80) scale(.92)", hypno(0, 0, 460, 160, 90, m)) + numBox(Math.round(m) + "", 110, 330, 1, 34) + T("دقيقة", 110, 380, 20, INK, 700); });
shot(18, function (u, d) { var x = walkX(u, K18); return [x + 40, walkY(x) - 140, .82]; }, function (u, d, t) {
  var x = walkX(u, K18);
  return paper() + stairs({ trail: x, hl: x < 100 ? 0 : x < 260 ? 1 : x < 420 ? 2 : x < 700 ? 3 : 4 }) + manOn(x, t, { walk: moving(u, K18) });
}, { tr: "out" });
// 19 · creativity, calmer feelings, fully charged: he stands and stretches; a bulb, a heart and a battery light up
shot(19, push(320, 420, 1.0, 1.05), function (u, d, t) {
  return paper() + floor(FL) + dim(.5, sofa(10, FL, 560, .9)) + stretch(330, FL, .9, t) +
    G("", bulb(120, 160, 1.1, true) + T("إبداع", 120, 240, 24, INK, 800), at(u, .3, .4)) + G("", heart(320, 130, 1.1, Math.sin(t * 6)) + T("مشاعر أهدى", 320, 200, 24, INK, 800), at(u, 1.3, .4)) +
    G("", battery(520, 160, 1.3, at(u, 2.6, 1.2)) + T("مشحون", 520, 230, 24, INK, 800), at(u, 2.4, .4));
});
// 20 · not close to bedtime: on a noon-to-morning day line, a late nap pushes the night sleep later and shortens it
shot(20, push(320, 400, 1.1, 1.16), function (u, d, t) {
  var X = function (h) { return 50 + (h - 12) / 20 * 540; }, k = at(u, 1.6, 1.2), ns = lerp(24, 25.5, k), s = paper();
  s += sun(X(12), 230, 34, t) + moon(X(31), 230, 26);
  s += '<path d="M' + X(12) + ' 400 H' + X(32) + '" stroke="' + INK + '" stroke-width="2.4"/>';
  [12, 15, 18, 21, 24, 27, 30].forEach(function (h) { s += '<path d="M' + f(X(h)) + ' 400 v12" stroke="' + INK + '" stroke-width="2"/>' + N(((h - 1) % 12 + 1) + "", X(h), 448, 22, INK); });
  s += T("الضهر", X(12), 480, 18, MUTE, 700) + T("نص الليل", X(24), 480, 18, MUTE, 700);
  s += G("", R(X(14), 350, X(14.5) - X(14), 40, OLIVE, 2) + check(X(14.25), 320, .8, at(u, .6, .4), OLIVE), at(u, .3, .3));
  s += G("", R(X(21), 350, X(22) - X(21), 40, ORANGE, 2), at(u, .9, .3)) + cross(X(21.5), 312, .7, at(u, 2.6, .4));
  s += R(X(ns), 350, X(31) - X(ns), 40, BLUE, 2) + T("نوم الليل", (X(ns) + X(31)) / 2, 378, 20, "#fff", 800) + G("", '<path d="M' + f(X(24)) + ' 350 V390" stroke="' + INK + '" stroke-width="2" stroke-dasharray="4 4"/>' + arrow(X(24), 540, X(ns), 540, ORANGE, 4, k) + T("بيتأخر ويقصر", X(24.8), 580, 22, ORANGE, 800), k > 0 ? 1 : 0);
  return s;
});
// 21 · the myth "the longer you nap, the fresher you wake": a straight rising line, crossed out; the real curve dips after ~30 min
shot(21, push(320, 400, 1.02, 1.08), function (u, d, t) {
  var X = function (m) { return 90 + m / 100 * 460; }, Y = function (v) { return 560 - v * 300; }, s = paper(), k2 = at(u, 2.6, 1.0);
  s += '<path d="M90 230 V560 H580" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + T("فايق", 60, 250, 20, INK, 700) + T("مدروخ", 60, 560, 20, INK, 700);
  [0, 30, 60, 90].forEach(function (m) { s += N(m + "", X(m), 596, 22, INK); });
  s += draw("M" + X(0) + " " + Y(.15) + " L" + X(100) + " " + Y(.95), at(u, .2, 1.0), MUTE, 4, ' stroke-dasharray="12 8"') + cross(X(55), Y(.6), 1.1, at(u, 1.8, .5));
  var cv = ""; for (var m = 0; m <= 100; m += 2) { var v = m < 20 ? lerp(.3, .85, m / 20) : m < 50 ? lerp(.85, .15, (m - 20) / 30) : m < 62 ? .12 : m < 90 ? lerp(.12, .92, (m - 62) / 28) : .9; cv += (m ? " L" : "M") + f(X(m)) + " " + f(Y(v)); }
  return s + draw(cv, k2, ORANGE, 5);
});
// 22 · what matters is which step you wake from: ✓ on the light and dream landings, ✗ in the basement
shot(22, pan(130, 250, 760, 250, .8), function (u, d, t) {
  return paper() + stairs({}) + check(184, 180, 1.4, at(u, .4, .4), OLIVE) + cross(534, 300, 1.1, at(u, 1.2, .5)) + check(860, 160, 1.4, at(u, 2.0, .4), OLIVE) +
    G("", alarmClock(534, 220, 30, 45, true, t), at(u, 1.0, .3));
});
// 23 · «يعني من الآخر»: the whole graph, 20 ✓, 90 ✓, and the hour in the middle ✗
shot(23, push(320, 380, .98, 1.04), function (u, d, t) {
  return paper() + hypno(60, 260, 440, 220, 100, 100 * at(u, 0, .8), { dot: false, cuts: [{ m: 20, k: at(u, 2.2, .5), col: OLIVE, mark: "v" }, { m: 90, k: at(u, 4.1, .5), mark: "v" }, { m: 60, k: at(u, 5.0, .5), col: BLUE, mark: "x" }] });
}, { tr: "out" });
// 24 · NASA, long-haul pilots: a planned rest in the cockpit seat, about 26 minutes
function cockpit(t, k) {
  var s = '<path d="M-100 660 H760" stroke="' + INK + '" stroke-width="2.4"/>' + R(-100, 660, 860, 160, "#cfc3a6", 0);
  s += '<path d="M-60 130 L240 90 L210 360 L-60 400 Z" fill="#cfdde3" stroke="' + INK + '" stroke-width="3"/>';
  for (var i = 0; i < 3; i++) { var cx = ((i * 150 + t * 30) % 420) - 80; s += '<path d="M' + f(cx) + ' ' + (180 + i * 50) + ' q20 -18 40 0 q16 -12 30 4 q12 2 10 12 h-90 q-6 -10 10 -16 Z" fill="#fff" opacity=".9"/>'; }
  s += '<path d="M-60 130 L240 90 L210 360 L-60 400 Z" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M100 110 L80 380" stroke="' + INK + '" stroke-width="5"/>';
  s += '<path d="M-100 400 L230 360 L250 470 L-100 510 Z" fill="#5d5a52" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var j = 0; j < 4; j++) s += C(-40 + j * 60, 445 - j * 7, 16, "#f4ecdb", 2) + '<path d="M' + f(-40 + j * 60) + ' ' + f(445 - j * 7) + ' l' + f(9 * Math.cos(t + j)) + ' ' + f(9 * Math.sin(t + j)) + '" stroke="' + INK + '" stroke-width="2"/>';
  // the seat, reclined, and the pilot asleep in it
  var sx = 470, st = 540;
  s += '<path d="M' + (sx - 30) + ' ' + (st - 10) + ' L' + (sx + 70) + ' 300 L' + (sx + 110) + ' 310 L' + (sx + 30) + ' ' + (st + 10) + ' Z" fill="#4c4a44" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(sx - 130, st, 170, 30, "#4c4a44", 2.4, 8) + R(sx - 40, st + 30, 24, 90, "#3a3833", 2);
  s += whole(fig({ x: sx - 10, y: st - 10, s: .95, lean: -24, legs: [[78, -58], [74, -54]], hands: [[sx - 90, st - 6], [sx - 80, st - 12]], bend: [1, 1], shirt: "#e9e4d6", tilt: 30, hair: "#2e2620" }));
  return s + zzz(560, 350, t, 32);
}
shot(24, push(300, 420, .95, 1.02), function (u, d, t) {
  return paper() + cockpit(t) + G("", alarmClock(530, 140, 48, 26 * at(u, 2.6, 1.6), false, t) + N(Math.round(26 * at(u, 2.6, 1.6)) + "", 440, 150, 40, ORANGE) + T("دقيقة", 440, 182, 20, INK, 700), at(u, 2.4, .3)) +
    iconBox(70, 80, 120, '<path d="M-48 4 L40 -6 Q52 -6 52 2 Q52 10 40 10 L-48 12 Z M-10 0 L-30 -36 L-18 -36 L14 -2 Z M-10 10 L-30 44 L-18 44 L14 10 Z M-44 4 L-52 -14 L-44 -14 L-36 4 Z" fill="#e9e4d6" stroke="' + INK + '" stroke-width="2"/>' + T("ناسا", 0, 50, 18, BLUE, 800), at(u, .3, .3));
});
shot([24, 2], push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, 1.4);
  return paper() + dim(.7, cockpit(t)) + G("", R(110, 230, 420, 330, "#f4ecdb", 2.4) + N("+" + Math.round(54 * k) + "%", 320, 400, 110, ORANGE) + T("انتباه أعلى", 320, 470, 38, INK, 800) + arrow(500, 520, 500, 270, OLIVE, 6, k), at(u, 0, .3)) + G("", T("قيلولة 26 دقيقة", 320, 620, 30, BLUE, 800), at(u, 1.6, .4));
}, { tr: "in" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a quarter-hour nap, then up fresh. line 1: an hour, up groggy. line 2: an hour and a half, up and stretching ✓
  var fl = 600, s = '<path d="M-40 ' + fl + ' H660" stroke="' + INK + '" stroke-width="2.4"/>' + R(-40, fl, 700, 80, "#e3d7bd", 0) + sofa(40, fl, 480, .8);
  var l = LN[li], u = t - l.start, wake = clamp((u - (l.end - l.start) * .55) / .5), mins = [15, 60, 90][li], prev = li ? [15, 60][li - 1] : 0;
  var m = li ? lerp(prev, mins, at(u, 0, 1.2)) : 15 * at(u, 0, 1.2);
  if (li === 0) s += wake < 1 ? sleeper(230, fl, .8, t) + zzz(410, 400, t) : "";
  if (li === 0 && wake >= 1) s += G("", stretch(300, fl, .8, t), clamp((u - (l.end - l.start) * .55 - .5) / .3) + .2);
  if (li === 1) s += wake < .5 ? sleeper(230, fl, .8, t) + zzz(410, 400, t) : groggy(330, fl, .8, t) + dizzy(268, 260, 34, t, wake * 2 - 1);
  if (li === 2) s += wake < .5 ? sleeper(230, fl, .8, t) + zzz(410, 400, t) : stretch(300, fl, .8, t) + check(160, 260, 1.5, wake * 2 - 1, OLIVE);
  s += alarmClock(500, 150, 64, m, wake > 0 && wake < .9, t) + N(Math.round(m) + "", 380, 166, 44, ORANGE) + T("دقيقة", 380, 204, 22, INK, 700);
  return s;
};
SCENE.bumper = function (u, t) {
  return alarmClock(92, 112, 52, (t * 12) % 90, false, t) + zzz(140, 70, t, 20);
};
SCENE.outro = function (svg, u, t) {
  var X = function (m) { return 40 + m / 100 * 430; };
  return hypno(40, 40, 430, 180, 100, 100, { dot: false }).replace(/font:(\d+) (\d+)px/g, function (a, w, z) { return "font:" + w + " " + Math.round(z * .9) + "px"; }) +
    callout("1", X(15), 30, ease(u / .3)) + callout("2", X(43), 196, ease(u / .3 - .5)) + callout("3", X(90), 30, ease(u / .3 - 1)) + callout("4", X(80), 52, ease(u / .3 - 1.5));
};
