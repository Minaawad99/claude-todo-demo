// ── «الفيب ولا السيجارة؟» — drawings. Real shapes from refs/SOURCES.md: a cigarette is 84 mm × 8 mm, a 27 mm cellulose filter
// under cork-pattern tipping paper, shredded tobacco in white paper, an ash cone over a glowing band at the lit end (filter photo:
// white when new, brown with tar when smoked). The vape is the pen type from the IJERPH construction photo: drip tip, clear tank
// with e-liquid, a coil head (coil + cotton wicks) in the middle, the threaded base, then the battery tube with its button.
// People: the real-proportion figures from «لو حد شرق قدامك» (videos/choking/sketch/shots.js).

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}
// ── people: flat side-view figures facing left. Joints by angle (deg from straight down, + toward the front) or hands by IK.
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
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }

// ── materials ──
var PAPERW = "#f4f0e6", CORK = "#d79a5c", CORK_D = "#b8753a", TOBAC = "#9a6235", TOBAC_D = "#6e4223", FIBRE = "#f7f4ec", TARF = "#b98a4a",
    ASH = "#9d978b", EMBER = "#d9572b", GLOW = "#f2913f", SMOKE = "#aeaaa1", LUNG = "#e0a194", LUNG_D = "#c47d70", AIRW = "#f2e4d8",
    TARC = "#5a3a22", BLOODC = "#b4473a", BLOODL = "#cf6a58", LIQ = "#dcb85e", GLASS = "#dfe8e6", METAL = "#9a978f", METAL_D = "#6f6c65",
    BODYV = "#d9d5cb", COAT = "#ebe7dc", LEAF = "#8d9a52", LEAF_D = "#6c7a3a";

// a cigarette lying along +x: the lit end at (x, y), the mouth end to the right. sc = px per mm.
// o: {burn 0..1 (shorter), glow 0..1, cut (paper opened over the top half), tar 0..1 (filter goes brown), hl: "filter" | "tobacco"}
function cigarette(x, y, sc, o) {
  o = o || {}; var L = 84 - 40 * (o.burn || 0), r = 4 * sc, fx = x + (L - 27) * sc, ex = x + L * sc, s = "", i;
  // tobacco rod in white paper
  s += R(x, y - r, fx - x, 2 * r, o.hl === "tobacco" ? "#f7e2c8" : PAPERW, 1.8);
  s += '<path d="M' + f(x + 6) + ' ' + f(y - r * .35) + ' H' + f(fx - 6) + '" stroke="#ddd6c6" stroke-width="' + f(Math.max(1, sc * .5)) + '"/>';
  // filter under the cork tipping paper, with its spots and the ring of air holes
  s += R(fx, y - r, ex - fx, 2 * r, o.hl === "filter" ? "#e9b57a" : CORK, 1.8);
  for (i = 0; i < 26; i++) s += '<ellipse cx="' + f(fx + hash(i) * (ex - fx)) + '" cy="' + f(y - r * .8 + hash(i + 40) * r * 1.6) + '" rx="' + f(sc * .9) + '" ry="' + f(sc * .45) + '" fill="' + CORK_D + '" opacity=".7"/>';
  for (i = 0; i < 6; i++) s += '<circle cx="' + f(fx + 12 * sc) + '" cy="' + f(y - r * .7 + i * r * .28) + '" r="' + f(sc * .28) + '" fill="' + INK + '" opacity=".6"/>';
  if (o.cut) {   // the paper opened over the top: shredded tobacco, then the fibre filter (brown with tar)
    var ty = y - r + 2, th = r * 1.15;
    s += R(x + 4, ty, fx - x - 4, th, TOBAC, 1.4);
    for (i = 0; i < 60; i++) { var px = x + 8 + hash(i + 3) * (fx - x - 16), py = ty + 3 + hash(i + 7) * (th - 6), a = hash(i + 11) * 3; s += '<path d="M' + f(px) + ' ' + f(py) + ' l' + f(Math.cos(a) * sc * 2.4) + ' ' + f(Math.sin(a) * sc * 1.2) + '" stroke="' + (i % 3 ? TOBAC_D : "#c08b55") + '" stroke-width="' + f(sc * .45) + '" stroke-linecap="round"/>'; }
    var fc = o.tar ? TARF : FIBRE;
    s += R(fx, ty, ex - fx - 3, th, fc, 1.4);
    if (o.tar) s += '<rect x="' + f(fx) + '" y="' + f(ty) + '" width="' + f((ex - fx) * .45) + '" height="' + f(th) + '" fill="' + TARC + '" opacity="' + f(.45 * o.tar) + '"/>';
    for (i = 0; i < 18; i++) s += '<path d="M' + f(fx + 4 + i * (ex - fx - 8) / 18) + ' ' + f(ty + 2) + ' v' + f(th - 4) + '" stroke="' + (o.tar ? "#8f6a36" : "#d9d4c8") + '" stroke-width="1"/>';
    s += '<path d="M' + f(x + 4) + ' ' + f(ty) + ' Q' + f((x + ex) / 2) + ' ' + f(ty - r * .9) + ' ' + f(ex - 3) + ' ' + f(ty) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  }
  // the lit end: a glowing band and the ash cone, glowing harder while you draw on it
  var g = o.glow == null ? .5 : o.glow;
  if (g > 0) for (i = 3; i >= 1; i--) s += '<circle cx="' + f(x - sc) + '" cy="' + f(y) + '" r="' + f(r * (1 + i * .7 * (.6 + g))) + '" fill="' + GLOW + '" opacity="' + f(.12 * g) + '"/>';
  s += P("M" + f(x + 3 * sc) + " " + f(y - r) + " L" + f(x) + " " + f(y - r) + " Q" + f(x - 5 * sc) + " " + f(y) + " " + f(x) + " " + f(y + r) + " L" + f(x + 3 * sc) + " " + f(y + r) + " Z", lerp(0, 1, g) > .6 ? "#e8622c" : EMBER, 1.6);
  s += P("M" + f(x + .5 * sc) + " " + f(y - r * .95) + " Q" + f(x - 7 * sc) + " " + f(y - r * .2) + " " + f(x - 6 * sc) + " " + f(y) + " Q" + f(x - 7 * sc) + " " + f(y + r * .3) + " " + f(x + .5 * sc) + " " + f(y + r * .95) + " Z", ASH, 1.4);
  for (i = 0; i < 7; i++) s += '<circle cx="' + f(x - hash(i + 90) * 5 * sc) + '" cy="' + f(y - r * .7 + hash(i + 91) * r * 1.4) + '" r="' + f(sc * .5) + '" fill="' + (i % 2 ? INK : "#f4b26a") + '" opacity="' + f(i % 2 ? .5 : g) + '"/>';
  return s;
}
// smoke curling up from (x, y): strands that drift with t. h height, w sway, op opacity
function smoke(x, y, t, h, w, op, col) {
  var s = "", i, k;
  for (i = 0; i < 3; i++) { var d = ""; for (k = 0; k <= 24; k++) { var yy = k / 24 * h, sx = Math.sin(yy / (38 + i * 9) - t * (1.6 + i * .3) + i * 2) * w * (yy / h + .1); d += (k ? " L" : "M") + f(x + sx + (i - 1) * 3 * yy / h) + " " + f(y - yy); }
    s += '<path d="' + d + '" stroke="' + (col || SMOKE) + '" stroke-width="' + f(4 + i * 3) + '" fill="none" stroke-linecap="round" opacity="' + f((op == null ? .6 : op) * (1 - i * .2)) + '"/>'; }
  return s;
}
// the chemicals riding up the smoke: n dots, the first `bad` of them orange (k fades them in)
function specks(x, y, t, h, w, n, bad, kBad) {
  var s = "";
  for (var i = 0; i < n; i++) { var p = (hash(i + 5) + t * (.08 + .07 * hash(i + 9))) % 1, px = x + (hash(i + 13) - .5) * w * (.3 + p), py = y - p * h, isBad = i % Math.max(1, Math.round(n / Math.max(1, bad))) === 0;
    s += '<circle cx="' + f(px + 6 * Math.sin(t * 2 + i)) + '" cy="' + f(py) + '" r="' + f(isBad && kBad > 0 ? 3.6 : 2.3) + '" fill="' + (isBad && kBad > 0 ? ORANGE : INK) + '" opacity="' + f((isBad ? Math.max(.55, kBad) : .55) * Math.sin(p * Math.PI)) + '"/>'; }
  return s;
}
// a pen vape along +x: the mouthpiece at (x, y), the battery to the right. sc px per mm.
// o: {cut, heat 0..1 (the coil glows), lvl (liquid level 0..1), vapor 0..1 (cloud out of the mouthpiece), hl: "coil"|"tank"|"battery"}
function vape(x, y, sc, o, t) {
  o = o || {}; t = t || 0; var r = 7 * sc, s = "", i, X = function (mm) { return x + mm * sc; };
  // drip tip
  s += P("M" + f(X(0)) + " " + f(y - r * .55) + " Q" + f(X(-1)) + " " + f(y) + " " + f(X(0)) + " " + f(y + r * .55) + " L" + f(X(12)) + " " + f(y + r * .7) + " L" + f(X(14)) + " " + f(y + r * .7) + " L" + f(X(14)) + " " + f(y - r * .7) + " L" + f(X(12)) + " " + f(y - r * .7) + " Z", "#3a332c", 1.8);
  s += '<path d="M' + f(X(3)) + ' ' + f(y - r * .3) + ' H' + f(X(11)) + '" stroke="#6b6259" stroke-width="' + f(sc * .8) + '" stroke-linecap="round"/>';
  // tank: metal caps, clear tube, e-liquid, the scale marks
  s += R(X(14), y - r, 5 * sc, 2 * r, METAL, 1.8) + R(X(53), y - r, 5 * sc, 2 * r, METAL, 1.8);
  s += R(X(19), y - r * .92, 34 * sc, r * 1.84, o.hl === "tank" ? "#d6e6ec" : GLASS, 1.6);
  var lv = o.lvl == null ? .7 : o.lvl, ly = y + r * .92 - r * 1.84 * lv;
  s += '<rect x="' + f(X(19)) + '" y="' + f(ly) + '" width="' + f(34 * sc) + '" height="' + f(y + r * .92 - ly) + '" fill="' + LIQ + '" opacity=".85"/>';
  s += '<path d="M' + f(X(19)) + ' ' + f(ly) + ' H' + f(X(53)) + '" stroke="' + INK + '" stroke-width="1.2"/>';
  for (i = 0; i < 5; i++) s += '<path d="M' + f(X(23 + i * 6)) + ' ' + f(y + r * .5) + ' v' + f(-r * (i % 2 ? .3 : .5)) + '" stroke="' + INK + '" stroke-width="1" opacity=".6"/>';
  // coil head in the middle of the tank: a metal tube, cotton wicks soaking up liquid, the coil wound round them
  s += R(X(24), y - r * .32, 24 * sc, r * .64, METAL, 1.4);
  if (o.cut || o.hl === "coil") {
    s += R(X(29), y - r * .62, 14 * sc, r * 1.24, "#efe6cf", 1.4);   // the cotton, wet at the ends
    s += '<rect x="' + f(X(29)) + '" y="' + f(y - r * .62) + '" width="' + f(3 * sc) + '" height="' + f(r * 1.24) + '" fill="' + LIQ + '" opacity=".7"/><rect x="' + f(X(40)) + '" y="' + f(y - r * .62) + '" width="' + f(3 * sc) + '" height="' + f(r * 1.24) + '" fill="' + LIQ + '" opacity=".7"/>';
    var hc = o.heat || 0, cc = hc > .5 ? "#e8622c" : hc > .15 ? "#b0563a" : METAL_D, cd = "";
    for (i = 0; i <= 7; i++) cd += (i ? " L" : "M") + f(X(30.5 + i * 1.6)) + " " + f(y + (i % 2 ? r * .7 : -r * .7));
    if (hc > 0) s += '<rect x="' + f(X(30)) + '" y="' + f(y - r * .9) + '" width="' + f(12 * sc) + '" height="' + f(r * 1.8) + '" rx="' + f(r * .6) + '" fill="' + GLOW + '" opacity="' + f(.35 * hc * (.8 + .2 * Math.sin(t * 9))) + '"/>';
    s += '<path d="' + cd + '" stroke="' + INK + '" stroke-width="' + f(sc * 1.1 + 2) + '" fill="none" stroke-linejoin="round"/><path d="' + cd + '" stroke="' + cc + '" stroke-width="' + f(sc * 1.1) + '" fill="none" stroke-linejoin="round"/>';
  }
  // threaded base and the battery tube with its button
  s += R(X(58), y - r * .8, 8 * sc, r * 1.6, METAL_D, 1.6);
  for (i = 0; i < 4; i++) s += '<path d="M' + f(X(59.5 + i * 1.8)) + ' ' + f(y - r * .8) + ' v' + f(r * 1.6) + '" stroke="' + INK + '" stroke-width="1" opacity=".6"/>';
  s += R(X(66), y - r, 74 * sc, 2 * r, o.hl === "battery" ? "#e6dcc0" : BODYV, 1.8, f(r * .5));
  if (o.cut) {
    s += R(X(72), y - r * .7, 52 * sc, r * 1.4, "#8f6b4a", 1.4, f(r * .3)) + R(X(124), y - r * .35, 3 * sc, r * .7, METAL, 1.2) + T("+", X(76), y + r * .25, r * .9, "#f4ecdb", 800);
    s += R(X(128), y - r * .5, 9 * sc, r, "#4f6a52", 1.2) + '<path d="M' + f(X(130)) + ' ' + f(y) + ' h' + f(5 * sc) + '" stroke="#d6c58a" stroke-width="1.4"/>';   // the chip and the puff sensor
  } else {
    s += C(X(76), y, r * .42, "#c9c3b5", 1.4) + C(X(76), y, r * .2, "none", 1);
    s += R(X(112), y - r * .55, 18 * sc, r * 1.1, "#c7cfc6", 1.2);
  }
  s += '<circle cx="' + f(X(140)) + '" cy="' + f(y) + '" r="' + f(r * .25) + '" fill="' + (o.heat > .3 ? "#7fb0d6" : "#b7b2a6") + '"/>';
  // the cloud out of the mouthpiece
  if (o.vapor > 0) for (i = 0; i < 6; i++) { var p = (t * .5 + i / 6) % 1; s += '<circle cx="' + f(X(-2) - p * 70 * sc / 3) + '" cy="' + f(y - p * 26 * sc / 3 + 8 * Math.sin(i * 2 + t)) + '" r="' + f(r * (.6 + p * 2.2)) + '" fill="#f1f0ec" stroke="#c9c6bd" stroke-width="1.2" opacity="' + f(o.vapor * .75 * (1 - p)) + '"/>'; }
  return s;
}
// lungs seen from the front, centred on (0,0) about 380 wide; o: {tar 0..1, drops: t-driven droplets, hl: "air"}
var LUNG_L = "M-26 -110 C-60 -150 -128 -122 -152 -40 C-176 36 -186 112 -176 172 C-150 190 -84 186 -32 170 C-22 120 -24 30 -26 -110 Z",
    LUNG_R = "M26 -110 C60 -150 128 -122 152 -40 C176 36 186 112 176 172 C150 190 94 188 62 174 C62 146 44 124 30 112 C26 60 24 0 26 -110 Z";
var BR = [];   // bronchial tree as segments, built once
(function () { function go(x, y, a, len, d) { var x2 = x + Math.sin(a) * len, y2 = y + Math.cos(a) * len; BR.push([x, y, x2, y2, d]); if (d < 4) { go(x2, y2, a - .45, len * .7, d + 1); go(x2, y2, a + .38, len * .7, d + 1); } }
  go(0, -110, -.95, 62, 0); go(0, -110, .95, 58, 0); })();
function lungs(t, o) {
  o = o || {}; var s = "", id = "lg" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + LUNG_L + '"/><path d="' + LUNG_R + '"/></clipPath>';
  s += P(LUNG_L, LUNG, 2.4) + P(LUNG_R, LUNG, 2.4);
  s += '<g clip-path="url(#' + id + ')"><path d="' + LUNG_L + '" fill="url(#hatch)" opacity=".2"/><path d="' + LUNG_R + '" fill="url(#hatch)" opacity=".2"/>';
  // the lobe lines
  s += '<path d="M-150 20 C-110 40 -70 30 -40 0 M-176 110 C-120 90 -80 60 -40 40 M150 0 C110 40 80 60 50 70" stroke="' + LUNG_D + '" stroke-width="2" fill="none"/>';
  // tar: brown patches spreading through the lungs
  if (o.tar > 0) for (var i = 0; i < 46; i++) { var side = i % 2 ? 1 : -1, px = side * (40 + hash(i + 1) * 130), py = -100 + hash(i + 2) * 270, rr = 6 + hash(i + 3) * 14;
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(rr * clamp(o.tar * 1.6 - hash(i + 4) * .6)) + '" fill="' + TARC + '" opacity=".75"/>'; }
  s += '</g>';
  // windpipe with its rings, the airway tree, little air sacs at the ends
  s += R(-13, -240, 26, 132, o.hl === "air" ? "#d5e2e6" : AIRW, 2.2);
  for (var y = -230; y < -112; y += 16) s += '<path d="M-13 ' + y + ' Q0 ' + (y + 5) + ' 13 ' + y + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
  BR.forEach(function (b) { var w = 16 - b[4] * 3.2; s += '<path d="M' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(b[2]) + ' ' + f(b[3]) + '" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" stroke-linecap="round"/><path d="M' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(b[2]) + ' ' + f(b[3]) + '" stroke="' + (o.hl === "air" ? "#d5e2e6" : AIRW) + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>';
    if (b[4] === 4) for (var j = 0; j < 3; j++) s += C(b[2] + (j - 1) * 5, b[3] + (j % 2) * 5, 4.2, "#e9b5a8", 1); });
  // droplets travelling down the airways to the ends
  if (o.drops) BR.forEach(function (b, n) { if (n % 2) return; var p = (t * .7 + hash(n)) % 1, bx = lerp(b[0], b[2], p), by = lerp(b[1], b[3], p); s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="3" fill="' + BLUE + '" opacity="' + f(o.drops) + '"/>'; });
  return s;
}
// a close-up of the airway lining: hair-like cilia sweeping, then stuck under tar (k 0..1). Drawn round (0,0), ~240 wide
function cilia(t, k) {
  var s = R(-150, 30, 300, 120, LUNG, 2) + '<rect x="-150" y="30" width="300" height="120" fill="url(#hatch)" opacity=".25"/>';
  for (var i = 0; i < 9; i++) s += '<path d="M' + (-140 + i * 34) + ' 30 v120" stroke="' + LUNG_D + '" stroke-width="1.6"/>';
  for (i = 0; i < 26; i++) { var x = -140 + i * 11, sw = Math.sin(t * 7 + i * .6) * 12 * (1 - k); s += '<path d="M' + x + ' 30 Q' + f(x + sw * .5) + ' 6 ' + f(x + sw) + ' -16" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
  if (k > 0) s += G("", P("M-150 -24 C-100 -36 -40 -18 10 -30 C60 -40 110 -22 150 -30 L150 30 L-150 30 Z", TARC, 1.6), k * .88);
  return s;
}
// a red blood cell seen at an angle: a dimpled disc
function rbc(x, y, r, rot) { return G("rotate(" + f(rot || 0) + " " + f(x) + " " + f(y) + ")", '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * .5) + '" fill="' + BLOODC + '" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="' + f(x) + '" cy="' + f(y - r * .04) + '" rx="' + f(r * .5) + '" ry="' + f(r * .2) + '" fill="' + BLOODL + '"/>'); }
function o2(x, y, sz) { sz = sz || 1; return C(x - 6 * sz, y, 7 * sz, "#8fb2c9", 1.4) + C(x + 6 * sz, y, 7 * sz, "#8fb2c9", 1.4); }
function co(x, y, sz) { sz = sz || 1; return C(x - 6 * sz, y, 8 * sz, "#4a4038", 1.4) + C(x + 7 * sz, y, 7 * sz, "#c95a46", 1.4); }
function heart(x, y, sc, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", '<path d="M0 26 C-30 4 -40 -12 -28 -24 C-18 -32 -4 -28 0 -16 C4 -28 18 -32 28 -24 C40 -12 30 4 0 26 Z" fill="' + (col || "#c0503e") + '" stroke="' + INK + '" stroke-width="2.2"/>'); }
// a gas water heater on the bathroom wall (front): the case, the flame window, the pipes, the flue on top
function heater(x, y, t, k) {
  var s = R(x - 60, y - 100, 120, 200, "#f2efe7", 2.4, 10) + R(x - 30, y + 20, 60, 34, "#3a342c", 1.8, 4);
  for (var i = 0; i < 5; i++) { var h = 12 + 6 * Math.sin(t * 11 + i * 1.7); s += '<path d="M' + (x - 22 + i * 11) + ' ' + (y + 50) + ' q4 ' + f(-h) + ' 0 ' + f(-h - 6) + ' q-4 ' + f(h * .4) + ' 0 ' + f(h + 6) + '" fill="' + (i % 2 ? "#5d8fc0" : "#e8873a") + '" stroke="none"/>'; }
  s += R(x - 14, y - 160, 28, 60, METAL, 1.8) + R(x - 40, y + 100, 10, 50, METAL, 1.6) + R(x + 30, y + 100, 10, 50, METAL, 1.6);
  s += C(x + 30, y - 60, 10, "#d8d2c4", 1.6) + C(x - 30, y - 60, 10, "#d8d2c4", 1.6);
  return s;
}
// an electric kettle with its heating coil (side cut)
function kettle(x, y, t, k) {
  var s = P("M" + (x - 60) + " " + (y + 70) + " L" + (x - 48) + " " + (y - 60) + " L" + (x + 44) + " " + (y - 60) + " L" + (x + 60) + " " + (y + 70) + " Z", "#e6e2d6", 2.4);
  s += '<path d="M' + (x - 54) + ' ' + (y - 10) + ' L' + (x + 54) + ' ' + (y - 10) + ' L' + (x + 59) + ' ' + (y + 66) + ' L' + (x - 59) + ' ' + (y + 66) + ' Z" fill="#a9c2cf" opacity=".85"/>';
  s += P("M" + (x + 44) + " " + (y - 46) + " C" + (x + 96) + " " + (y - 50) + " " + (x + 96) + " " + (y + 40) + " " + (x + 54) + " " + (y + 40), "none", 12, ' stroke="' + INK + '" stroke-linecap="round"') + P("M" + (x + 44) + " " + (y - 46) + " C" + (x + 96) + " " + (y - 50) + " " + (x + 96) + " " + (y + 40) + " " + (x + 54) + " " + (y + 40), "none", 7, ' stroke="#d8d3c6" stroke-linecap="round"');
  s += P("M" + (x - 48) + " " + (y - 50) + " L" + (x - 80) + " " + (y - 70) + " L" + (x - 76) + " " + (y - 58) + " L" + (x - 50) + " " + (y - 36) + " Z", "#e6e2d6", 2);
  var cd = ""; for (var i = 0; i <= 10; i++) cd += (i ? " L" : "M") + f(x - 40 + i * 8) + " " + f(y + 56 + (i % 2 ? -8 : 0));
  s += '<path d="' + cd + '" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="' + cd + '" stroke="' + (k > .3 ? "#e8622c" : METAL) + '" stroke-width="4" fill="none"/>';
  for (i = 0; i < 4; i++) { var p = (t * .6 + i / 4) % 1; s += '<circle cx="' + f(x - 30 + i * 20) + '" cy="' + f(y + 50 - p * 56) + '" r="' + f(3 + p * 2) + '" fill="none" stroke="#fff" stroke-width="1.6" opacity="' + f(k * (1 - p)) + '"/>'; }
  return s;
}
// a paper tissue; st 0..1 = the brown stain spreading
function tissue(x, y, st) {
  var s = P("M" + (x - 110) + " " + (y - 100) + " Q" + (x - 50) + " " + (y - 112) + " " + x + " " + (y - 100) + " Q" + (x + 60) + " " + (y - 90) + " " + (x + 110) + " " + (y - 102) + " L" + (x + 116) + " " + (y + 100) + " Q" + (x + 50) + " " + (y + 112) + " " + x + " " + (y + 100) + " Q" + (x - 60) + " " + (y + 90) + " " + (x - 114) + " " + (y + 104) + " Z", "#fbf9f3", 2.2);
  s += '<path d="M' + (x - 108) + ' ' + y + ' H' + (x + 112) + ' M' + x + ' ' + (y - 100) + ' V' + (y + 100) + '" stroke="#ddd8cc" stroke-width="1.4"/>';
  if (st > 0) s += '<ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="' + f(48 * st) + '" ry="' + f(40 * st) + '" fill="#a77a48" opacity=".55"/><ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="' + f(26 * st) + '" ry="' + f(21 * st) + '" fill="#7d5530" opacity=".6"/>';
  return s;
}
// a tobacco leaf (long and pointed, a strong midrib); burn 0..1 from the bottom up
function leaf(x, y, sc, burn, t) {
  var d = "M0 -170 C70 -120 92 -10 64 90 C46 136 20 160 0 172 C-20 160 -46 136 -64 90 C-92 -10 -70 -120 0 -170 Z", s = "", id = "lf" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>';
  s += P(d, LEAF, 2.4) + '<g clip-path="url(#' + id + ')">';
  s += '<path d="M0 -168 V172" stroke="' + LEAF_D + '" stroke-width="4"/>';
  for (var i = 0; i < 8; i++) { var yy = -130 + i * 36; s += '<path d="M0 ' + yy + ' Q-30 ' + (yy - 10) + ' -70 ' + (yy - 34) + ' M0 ' + yy + ' Q30 ' + (yy - 10) + ' 70 ' + (yy - 34) + '" stroke="' + LEAF_D + '" stroke-width="2" fill="none"/>'; }
  if (burn > 0) { var by = 172 - burn * 220, e = ""; for (i = 0; i <= 16; i++) e += (i ? " L" : "M") + (-100 + i * 12.5) + " " + f(by + 8 * Math.sin(i * 1.9 + t * 3)); s += '<path d="' + e + ' L100 200 L-100 200 Z" fill="#2f2721"/><path d="' + e + '" stroke="' + GLOW + '" stroke-width="6" fill="none"/><path d="' + e + '" stroke="' + EMBER + '" stroke-width="2.4" fill="none"/>'; }
  s += '</g>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", s);
}
// a little molecule (ball and stick) for "new substances"
function molecule(x, y, sc, col, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(sc) + ")", '<path d="M-14 0 L0 -10 L14 0 M0 -10 V-24" stroke="' + INK + '" stroke-width="2.4"/>' + C(-14, 0, 6, col || ORANGE, 1.4) + C(0, -10, 7, "#4a4038", 1.4) + C(14, 0, 6, col || ORANGE, 1.4) + C(0, -24, 5, "#e8e2d4", 1.4)); }
// a thermometer with its mercury at k (0..1)
function thermo(x, y, h, k, col) { return R(x - 9, y - h, 18, h, "#f4ecdb", 2, 9) + C(x, y + 8, 16, col || ORANGE, 2) + '<rect x="' + (x - 4) + '" y="' + f(y - (h - 10) * k) + '" width="8" height="' + f((h - 10) * k + 6) + '" fill="' + (col || ORANGE) + '"/>' + [0, 1, 2, 3].map(function (i) { return '<path d="M' + (x + 9) + ' ' + (y - 20 - i * (h - 30) / 3) + ' h8" stroke="' + INK + '" stroke-width="1.4"/>'; }).join(""); }
// a no-flame sign
function flame(x, y, sc, t) { var h = 1 + .06 * Math.sin(t * 12); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + " " + f(sc * h) + ")", '<path d="M0 -50 C22 -24 34 -6 30 16 C26 38 10 48 0 48 C-14 48 -30 36 -30 14 C-30 -6 -16 -14 -10 -30 C-4 -18 0 -14 4 -10 C6 -26 4 -38 0 -50 Z" fill="#e8873a" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 0 C10 12 12 24 6 36 C0 42 -10 38 -10 28 C-10 16 -2 12 0 0 Z" fill="#f2c45a"/>'); }
// a balance: tilt in degrees (+ = right pan down)
function balance(x, y, tilt, left, right) {
  var a = tilt * Math.PI / 180, lx = x - Math.cos(a) * 200, ly = y - Math.sin(a) * 200, rx = x + Math.cos(a) * 200, ry = y + Math.sin(a) * 200;
  var s = R(x - 8, y, 16, 330, WOOD, 2) + R(x - 90, y + 320, 180, 20, WOOD_D, 2) + '<path d="M' + f(lx) + ' ' + f(ly) + ' L' + f(rx) + ' ' + f(ry) + '" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M' + f(lx) + ' ' + f(ly) + ' L' + f(rx) + ' ' + f(ry) + '" stroke="' + WOOD + '" stroke-width="7" stroke-linecap="round"/>' + C(x, y, 12, METAL, 2);
  function pan(px, py, inner) { return '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(px - 70) + ' ' + f(py + 120) + ' M' + f(px) + ' ' + f(py) + ' L' + f(px + 70) + ' ' + f(py + 120) + '" stroke="' + INK + '" stroke-width="1.6"/>' + P("M" + f(px - 84) + " " + f(py + 120) + " Q" + f(px) + " " + f(py + 160) + " " + f(px + 84) + " " + f(py + 120) + " Z", METAL, 2) + G("translate(" + f(px) + " " + f(py + 112) + ")", inner); }
  return s + pan(lx, ly, left) + pan(rx, ry, right);
}

// a camera that moves at an even speed the whole shot (no slow start, so sparse shots never park)
function glide(x1, y1, x2, y2, z1, z2) { return function (u, d) { var k = clamp(u / d); return [lerp(x1, x2, k), lerp(y1, y2, k), lerp(z1, z2, k)]; }; }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قبل ما نشرح… قاعدة صغيرة»: a rule card pinned to the board
shot(4, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .3, .5), s = paper();
  s += G("rotate(" + f(-3 + 1.2 * Math.sin(t * 1.8)) + " 320 380)", appear(k, R(150, 260, 340, 240, "#f4ecdb", 2.4) + '<rect x="150" y="260" width="340" height="240" fill="url(#hatch)" opacity=".15"/>' + T("قاعدة", 320, 330, 46, INK, 800) + '<path d="M200 360 H440" stroke="' + INK + '" stroke-width="2"/>' + flame(320, 430, .9, t)));
  s += C(320, 262, 12, ORANGE, 2) + '<path d="M320 274 v14" stroke="' + INK + '" stroke-width="3"/>';
  s += G("", T("خليك فاكرها", 320, 580, 30, ORANGE, 800), at(u, 2.0, .4));
  return s;
});
// 5 · the rule: a whole tobacco leaf, then the same leaf burning, new molecules coming off the smoke
hud(5, 12, function (u, t) { return R(170, 26, 300, 44, "#f4ecdb", 1.8) + T("حريق = مواد جديدة", 320, 57, 24, ORANGE, 800); });
shot(5, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var b = at(u, 1.6, 2.6), s = paper();
  s += leaf(170, 430, .95, 0, t) + T("سليمة", 170, 650, 28, OLIVE, 800);
  s += leaf(470, 430, .95, b, t) + G("", T("بتتحرق", 470, 650, 28, ORANGE, 800), at(u, 1.2, .3));
  s += G("", smoke(470, 260, t, 180, 30, .5), b);
  for (var i = 0; i < 7; i++) { var p = (t * .25 + i / 7) % 1; s += G("", molecule(430 + hash(i) * 90 + 10 * Math.sin(t + i), 250 - p * 170, .9, i % 3 ? ORANGE : BLUE, t * 40 + i * 50), b * Math.sin(p * Math.PI)); }
  s += '<path d="M320 200 V680" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>';
  return s;
});
// 6 · the cigarette, cut open: tobacco, filter, and the lit end glowing to 900° while you draw on it
shot(6, push(330, 400, 0.98, 1.08), function (u, d, t) {
  var s = paper(), g = .4 + .6 * at(u, 3.4, .8), sc = 6.2;
  s += G("rotate(-6 320 420)", cigarette(110, 420, sc, { cut: 1, glow: g + .08 * Math.sin(t * 7) }));
  s += G("", smoke(96, 380, t, 260, 26, .5), at(u, .2, .4));
  s += label(240, 404, 300, 300, "التبغ", OLIVE, at(u, .6, .5), 24) + label(500, 380, 560, 290, "الفلتر", OLIVE, at(u, 1.0, .5), 24);
  s += label(90, 440, 150, 560, "جمرة", ORANGE, at(u, 1.8, .5), 28);
  s += G("", thermo(470, 640, 150, clamp(at(u, 3.4, 1.6) * .95), ORANGE) + bigNum(count(900, at(u, 3.4, 1.6)) + "°", "درجة", 560, 580, 1, ORANGE, 46), at(u, 3.1, .3));
  return s;
}, { tr: "in" });
// 7 · the smoke: more than 7,000 chemicals, about 70 of them cause cancer
shot(7, push(320, 380, 1.12, 1.0), function (u, d, t) {
  var s = paper(), k70 = at(u, 3.8, .8);
  s += G("rotate(-6 320 700)", cigarette(200, 700, 6.2, { glow: .7 + .2 * Math.sin(t * 5) }));
  s += smoke(180, 680, t, 560, 46, .45) + specks(185, 680, t, 560, 260, 110, 9, k70);
  s += numBox(count(7000, at(u, .6, 1.6)), 460, 200, at(u, .5, .3), 40, true) + G("", T("مادة كيماوية", 460, 260, 26, INK, 800), at(u, .9, .3));
  s += numBox("70", 460, 380, k70, 40) + G("", T("بيعملوا سرطان", 460, 440, 26, ORANGE, 800), at(u, 4.2, .3));
  return s;
}, { tr: "out" });
// 8 · tar coats the lungs; the cleaning hairs (cilia) get stuck under it
shot(8, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), tar = at(u, 1.6, 2.6), c = window.CHUNKS[8], D = LN[8].end - LN[8].start, kc = at(u, D * (c[c.length - 1] || .7) - .3, .4);
  s += G("translate(300 470) scale(1.05)", lungs(t, { tar: tar }));
  for (var i = 0; i < 10; i++) { var p = (t * .5 + i / 10) % 1; s += '<circle cx="' + f(300 + 4 * Math.sin(i + t)) + '' + '" cy="' + f(200 + p * 120) + '" r="4" fill="' + TARC + '" opacity="' + f(.7 * (1 - p) * at(u, .8, .4)) + '"/>'; }
  s += label(160, 480, 230, 700, "القطران", ORANGE, at(u, 1.6, .5), 26);
  s += inset(500, 190, 115, G("scale(.72)", cilia(t, at(u, D * (c[c.length - 1] || .7) + .6, 1.4))), kc);
  s += G("", T("الشعيرات", 500, 330, 24, OLIVE, 800), kc);
  return s;
});
// 9 · like blowing smoke through a white tissue: a brown stain
shot(9, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var s = paper(), st = at(u, 1.4, 1.6);
  s += tissue(360, 420, st);
  for (var i = 0; i < 5; i++) { var p = (t * .8 + i / 5) % 1; s += '<circle cx="' + f(120 + p * 220) + '" cy="' + f(420 + 18 * Math.sin(i * 2 + t * 2)) + '" r="' + f(10 + 18 * p) + '" fill="' + SMOKE + '" opacity="' + f(.45 * (1 - p) * (1 - at(u, 2.8, .6))) + '"/>'; }
  s += label(380, 430, 520, 600, "بقعة بني", ORANGE, at(u, 2.6, .5), 26);
  s += iconBox(130, 150, 150, G("rotate(-20) translate(-40 0)", cigarette(-20, 0, 1.6, { cut: 1, tar: 1, glow: 0 })) + T("الفلتر بعد الشرب", 0, 58, 15, INK, 700), at(u, .3, .3));
  return s;
}, { tr: "out" });
// 10 · carbon monoxide: CO, the same gas as a gas heater in a closed bathroom
shot(10, glide(300, 300, 340, 420, 1.2, 1.0), function (u, d, t) {
  var s = paper(), k = at(u, 2.4, .5);
  s += G("rotate(" + f(14 * Math.sin(t * 1.6)) + " 300 230)", co(300 + 14 * Math.sin(t * 1.3), 230 + 16 * Math.sin(t * 2), 3.2)) + G("", T("CO", 300, 330, 40, ORANGE, 800), at(u, .5, .3)) + label(270, 230, 120, 120, "كربون", INK, at(u, .9, .4), 22) + label(340, 230, 500, 120, "أكسجين", ORANGE, at(u, 1.2, .4), 22);
  // the bathroom: a closed door, the heater, the gas filling the room
  s += G("", R(110, 400, 420, 300, "#e7dcc4", 2.4) + R(130, 470, 90, 230, WOOD, 2) + C(205, 590, 5, INK, 0) + T("مقفول", 175, 455, 20, ORANGE, 800) + heater(390, 560, t, 1), k);
  for (var i = 0; i < 12; i++) { var p = (t * .18 + hash(i)) % 1; s += G("", co(150 + hash(i + 3) * 360, 690 - p * 270, .9), k * Math.sin(p * Math.PI)); }
  s += label(400, 470, 520, 380, "السخان", OLIVE, at(u, 3.0, .4), 22);
  return s;
}, { tr: "in" });
// 11 · in the blood: CO takes the oxygen's place on the red cells; the heart works harder
shot(11, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var s = paper() + R(-100, 280, 840, 280, "#e9c2b4", 2.4) + '<rect x="-100" y="280" width="840" height="280" fill="url(#hatch)" opacity=".2"/>', sw = at(u, .8, 1.4);
  for (var i = 0; i < 6; i++) { var x = ((i * 130 + t * 50) % 780) - 70, y = 420 + 60 * Math.sin(i * 2.1); s += rbc(x, y, 46, -12 + i * 8);
    s += (hash(i) < sw ? co(x, y - 46, 1.2) : o2(x, y - 46, 1.2)); }
  s += G("", T("O₂", 140, 250, 30, BLUE, 800), 1 - sw) + G("", T("CO", 140, 250, 30, ORANGE, 800), sw);
  var b = Math.abs(Math.sin(t * (4 + 6 * sw)));
  s += heart(500, 650, 1.6 + .25 * b) + label(500, 640, 360, 700, "القلب بيتعب", ORANGE, at(u, 2.4, .5), 24);
  return s;
});
// 12 · the vape: no fire at all
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper();
  s += G("rotate(-8 320 360)", vape(100, 360, 3.1, { lvl: .7, vapor: .7 }, t));
  s += flame(320, 580, 1.4, t) + cross(320, 580, 1.6, at(u, 1.3, .4)) + G("", T("مفيش نار", 320, 690, 30, ORANGE, 800), at(u, 1.5, .3));
  return s;
});
// 13 · inside: a coil heats the liquid to about 200° and turns it into a mist — like the coil in a kettle
shot(13, glide(280, 410, 360, 420, .92, 1.06), function (u, d, t) {
  var s = paper(), h = at(u, 1.0, .8);
  s += vape(40, 400, 3.9, { cut: 1, heat: h, lvl: .6, vapor: .35 + .65 * at(u, 2.6, .6) }, t);
  s += label(185, 400, 250, 250, "السلك", OLIVE, at(u, .4, .4), 24) + label(130, 425, 120, 560, "السايل", INK, at(u, .9, .4), 22) + label(380, 405, 440, 560, "البطارية", INK, at(u, .6, .4), 22);
  s += G("", thermo(560, 330, 120, .35 * at(u, 1.6, 1), ORANGE) + bigNum(count(200, at(u, 1.6, 1)) + "°", "درجة", 470, 250, 1, ORANGE, 40), at(u, 1.4, .3));
  s += G("", T("رذاذ", 70, 320, 26, BLUE, 800), at(u, 3.0, .3));
  s += iconBox(520, 640, 150, G("scale(.7)", kettle(0, 0, t, 1)), at(u, d - 1.8, .3));
  return s;
}, { tr: "in" });
// 14 · no burning: no tar, no carbon monoxide
shot(14, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper();
  s += G("rotate(-8 320 230)", vape(100, 230, 3.1, { lvl: .7, vapor: .6 }, t));
  s += G("", G("translate(200 480) scale(.5)", lungs(t, { tar: 1 })) + T("قطران", 200, 640, 26, INK, 800) + cross(200, 480, 1.6, at(u, .9, .4)), at(u, .2, .3));
  s += G("", co(450, 480, 2.6) + T("أول أكسيد الكربون", 450, 640, 22, INK, 800) + cross(450, 480, 1.6, at(u, 1.7, .4)), at(u, 1.0, .3));
  return s;
}, { tr: "out" });
// 15 · NHS: far less harmful than cigarettes… but less harmful isn't safe
shot(15, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), tilt = 14 * at(u, .8, 1.4) + 1.2 * Math.sin(t * 2), c = window.CHUNKS[15], D = LN[15].end - LN[15].start, k2 = at(u, D * (c[c.length - 2] || .6), .4);
  s += balance(320, 220, -tilt, cigarette(-60, -10, 1.5, { glow: .6 }) + G("translate(-40 -12)", smoke(-20, 0, t, 60, 8, .4)), G("translate(-60 -10) rotate(0)", vape(0, 0, .9, { lvl: .7 }, t)));
  s += G("", tag("NHS", 320, 130, 1, 26, BLUE), at(u, .3, .3)) + G("", T("أقل ضرر", 520, 640, 30, BLUE, 800), at(u, 2.0, .3));
  s += G("", tag("آمن؟", 140, 640, 1, 32, INK) + cross(140, 630, 1.1, at(u, D * (c[c.length - 1] || .8), .4)), k2);
  return s;
});
// 16 · research: still toxic substances, fewer — and metals such as nickel and lead from the coil
shot(16, glide(260, 420, 380, 420, .96, 1.1), function (u, d, t) {
  var s = paper(), k = at(u, 2.6, .6);
  s += vape(30, 420, 4.0, { cut: 1, heat: .9, lvl: .55, vapor: .8 }, t);
  for (var i = 0; i < 18; i++) { var p = (t * .55 + hash(i)) % 1, x = 120 - p * 260, y = 420 - p * 120 + (hash(i + 4) - .5) * 160 * p; s += i % 4 === 0 ? G("", R(x - 4, y - 4, 8 + 4 * hash(i), 8, "#7c7a74", 1.2), k * (1 - p)) : C(x, y, 3.2, i % 3 ? INK : ORANGE, 0); }
  s += G("", tag("Ni", 130, 230, 1, 26, OLIVE) + tag("Pb", 230, 230, 1, 26, OLIVE), k) + label(178, 440, 300, 600, "من السلك نفسه", OLIVE, at(u, 3.6, .5), 24);
  s += G("", numBox("أقل", 520, 240, 1, 30), at(u, 1.4, .3));
  return s;
}, { tr: "in" });
// 17 · nicotine in nearly all of them; some carry more than a cigarette
shot(17, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k1 = at(u, .4, 1.0), k2 = at(u, 2.0, 1.4);
  s += '<path d="M80 600 H560" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(150, 600 - 220 * k1, 120, 220 * k1, ORANGE, 2) + R(370, 600 - 300 * k2, 120, 300 * k2, BLUE, 2);
  s += cigarette(150, 650, 1.4, { glow: .6 }) + vape(366, 650, .9, { lvl: .7 }, t);
  s += T("سيجارة", 210, 710, 22, ORANGE, 800) + T("فيب", 430, 710, 22, BLUE, 800);
  s += G("", tag("نيكوتين", 320, 190, 1, 34, INK), at(u, .2, .3)) + G("", T("أكتر", 430, 280 - 0 * k2, 26, BLUE, 800), at(u, 3.0, .3));
  return s;
}, { tr: "out" });
// 18 · studied since 1950, vapes spread only about 20 years ago
shot(18, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper(), k = at(u, .3, 2.0), kv = at(u, 2.4, 1.2), X = function (y) { return 80 + (y - 1950) / 76 * 480; };
  s += '<path d="M70 560 H580" stroke="' + INK + '" stroke-width="2.4"/>';
  [1950, 1970, 1990, 2010, 2026].forEach(function (y) { s += '<path d="M' + f(X(y)) + ' 550 v20" stroke="' + INK + '" stroke-width="2"/>' + N(String(y), X(y), 600, 18, INK); });
  s += R(80, 380, (X(2026) - 80) * k, 50, ORANGE, 2) + G("", T("سجاير", 130, 414, 22, "#fff", 800), at(u, .4, .3));
  s += R(X(2006), 460, (X(2026) - X(2006)) * kv, 50, BLUE, 2) + G("", T("فيب", X(2016), 494, 22, "#fff", 800), kv);
  s += measure(80, 320, X(2026), 320, k, "76 سنة") + measure(X(2006), 650, X(2026), 650, kv, "20 سنة");
  s += G("", G("translate(470 250) rotate(-10)", cigarette(-60, 0, 1.6, { glow: .7 }) + smoke(-64, -8, t, 70, 8, .5)), at(u, .2, .3));
  return s;
});
// 19 · nobody knows yet what a vape does to the lungs after thirty years
shot(19, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var s = paper();
  s += G("translate(220 470) scale(.85)", lungs(t, { hl: "air" }));
  s += G("", T("؟", 480, 360, 180 + 8 * Math.sin(t * 3), ORANGE, 800), at(u, .4, .4));
  s += G("", tag("بعد 30 سنة", 470, 600, 1, 30, ORANGE), at(u, 1.2, .3));
  return s;
});
// 20 · the myth: «it's just water vapour» — no
shot(20, push(320, 420, 1.06, 0.98), function (u, d, t) {
  var s = paper() + kettle(320, 480, t, 1);
  for (var i = 0; i < 5; i++) { var p = (t * .5 + i / 5) % 1; s += '<circle cx="' + f(240 - p * 60) + '' + '" cy="' + f(410 - p * 160) + '" r="' + f(12 + 26 * p) + '" fill="#f6f5f1" stroke="#cbc8bf" stroke-width="1.4" opacity="' + f(.8 * (1 - p)) + '"/>'; }
  s += tag("بخار مية؟", 320, 180, at(u, .2, .3), 34, BLUE) + cross(320, 175, 1.8, at(u, d - 1.0, .4));
  return s;
});
// 21 · an aerosol of tiny droplets that reach the deepest part of the lungs
shot(21, push(320, 430, 1.04, 1.12), function (u, d, t) {
  var s = paper();
  s += G("translate(300 470) scale(1.05)", lungs(t, { drops: 1 }));
  s += inset(520, 200, 100, G("scale(1.2)", [0, 1, 2, 3, 4, 5, 6].map(function (i) { var a = i / 7 * Math.PI * 2; return C(Math.cos(a) * 34, Math.sin(a) * 34, 22, "#e9b5a8", 1.8); }).join("") + C(0, 0, 22, "#e9b5a8", 1.8) + [0, 1, 2, 3, 4].map(function (i) { var p = (t * .6 + i / 5) % 1; return C(-60 + p * 60, -60 + p * 60 + 6 * Math.sin(i), 4, BLUE, 0); }).join("")), at(u, 1.2, .3));
  s += G("", T("آخر حتة", 520, 330, 24, OLIVE, 800), at(u, 1.5, .3));
  return s;
}, { tr: "in" });
// 22 · «يعني من الآخر»: nicotine hooks you, the burning kills you, the vape is less harmful but not safe
shot(22, glide(300, 330, 330, 470, .9, 1.06), function (u, d, t) {
  var s = paper(), c = window.CHUNKS[22], D = LN[22].end - LN[22].start, k1 = at(u, .2, .5), k2 = at(u, D * (c[2] || .5), .4), k3 = at(u, D * (c[3] || .72), .4);
  s += G("", tag("نيكوتين", 180, 160, 1, 30, INK) + T("بيمسكك", 450, 170, 32, INK, 800) + '<path d="M300 160 H350" stroke="' + INK + '" stroke-width="2"/>', .2 + .8 * k1);
  s += G("", G("translate(60 380)", cigarette(60, 0, 2.2, { glow: .9 }) + smoke(56, -12, t, 80, 10, .5)) + T("الحريق بيموّتك", 450, 395, 32, ORANGE, 800), .2 + .8 * k2);
  s += G("", G("translate(60 600)", vape(0, 0, 1.1, { lvl: .7, vapor: .6 }, t)) + T("أقل ضرر", 450, 590, 30, BLUE, 800) + T("بس مش آمن", 450, 636, 26, ORANGE, 800), .2 + .8 * k3);
  return s;
}, { tr: "out" });
// 23 · the odd fact: a Chinese pharmacist invented it after his father died of lung cancer from smoking
shot(23, push(330, 430, 1.0, 1.08), function (u, d, t) {
  var s = paper() + floor(700), m = fig({ x: 240, y: 488, lean: 3, shirt: COAT, hands: [rel(84, 52), rel(80, 44)], bend: [1, 1], tilt: 16 });
  var hnd = m.at(84, 62);
  s += m.far + m.body + G("rotate(-10 " + f(hnd[0]) + " " + f(hnd[1]) + ")", vape(hnd[0] - 34, hnd[1], .36, { lvl: .7, vapor: .5 }, t)) + m.near;
  s += label(236, 330, 360, 230, "صيدلي صيني", OLIVE, at(u, .4, .5), 24) + G("", tag("2003", 470, 300, 1, 30, INK), at(u, 1.0, .3));
  s += iconBox(500, 470, 170, G("translate(0 20) scale(.36)", lungs(t, { tar: 1 })) + T("أبوه", 0, -62, 20, ORANGE, 800), at(u, 2.6, .3));
  s += G("", T("سرطان الرئة", 500, 600, 24, ORANGE, 800), at(u, 3.0, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
// a man smoking (left, facing right) and a man vaping (right, facing left), real proportions
function smoker(t, x, mirror) {
  var m = fig({ x: 0, y: 388, lean: 2, shirt: mirror ? "#8f7f9a" : SHIRT_V, hands: [rel(122, 44), null], bend: [-1, -1] }), h = m.at(144, 30), s = m.far + m.body;
  var obj = mirror ? G("translate(" + f(h[0] - 30) + " " + f(h[1] + 2) + ")", vape(0, 0, .3, { lvl: .7, vapor: 1 }, t)) + [0, 1, 2, 3].map(function (i) { var p = (t * .35 + i / 4) % 1; return '<circle cx="' + f(h[0] - 30 - p * 50) + '" cy="' + f(h[1] - 6 - p * 60) + '" r="' + f(6 + p * 22) + '" fill="#f4f3ef" stroke="#c9c6bd" stroke-width="1.2" opacity="' + f(.85 * (1 - p)) + '"/>'; }).join("") : G("rotate(-8 " + f(h[0]) + " " + f(h[1]) + ")", cigarette(h[0] - 22, h[1], .32, { glow: .6 + .3 * Math.sin(t * 3) })) + smoke(h[0] - 24, h[1] - 2, t, 140, 12, .55);
  return G("translate(" + x + " 0) scale(" + (mirror ? 1 : -1) + " 1)", s + obj + m.near);
}
SCENE.intro = function (svg, t, li) {
  var s = '<path d="M-20 600 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 600, 660, 80, "#e3d7bd", 0);
  s += smoker(t, 150, false) + smoker(t, 460, true);
  s += T("سيجارة", 150, 650, 24, ORANGE, 800) + T("فيب", 460, 650, 24, BLUE, 800);
  s += G("", T("؟", 305, 330, 120 + 6 * Math.sin(t * 3), ORANGE, 800), li === 0 ? 1 : .25);
  if (li >= 1) { var u = t - LN[1].start, k = ease(u / .3), dm = li >= 2 ? ease((t - LN[2].start) / .5) : 0;
    s += G("", tag("نيكوتين", 150, 90, 1, 26, INK) + tag("نيكوتين", 460, 90, 1, 26, INK) + T("=", 305, 100, 40, INK, 800), k * (1 - .6 * dm)); }
  if (li >= 2) { var v = t - LN[2].start; s += cross(305, 90, 1.1, ease((v - .5) / .4)) + G("", T("أكتر حاجة بتأذيك؟", 305, 190, 30, ORANGE, 800), ease((v - .9) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(20 120) rotate(-15)", cigarette(20, 0, 1.6, { glow: .8 })) + smoke(48, 106, t, 90, 10, .55);
};
SCENE.outro = function (svg, u, t) {
  return G("rotate(-6 150 150)", cigarette(30, 150, 2.6, { cut: 1, glow: .9 })) + smoke(28, 140, t, 120, 12, .5) + vape(330, 150, 1.8, { cut: 1, heat: .9, lvl: .6, vapor: .7 }, t) +
    callout("1", 30, 80, ease(u / .3)) + callout("2", 200, 90, ease(u / .3 - .5)) + callout("3", 400, 100, ease(u / .3 - 1)) + callout("4", 300, 70, ease(u / .3 - 1.5));
};
