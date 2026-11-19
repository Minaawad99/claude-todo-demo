var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the throat: mid-line cut of head and neck, face to the left ──
// o: {ep: 0 open … 1 closed, food: [x,y] | null, air: 0..1 (air running in the windpipe), hl: "food" | "air" | "ep", water, finger}
var MOUTH = [118, 330], FOOD_OK = [[150, 318], [250, 300], [318, 318], [345, 380], [352, 470], [350, 560], [350, 700], [350, 820]],
    FOOD_BAD = [[150, 318], [250, 300], [318, 318], [330, 380], [300, 470], [290, 520]];
function throat(t, o) {
  o = o || {}; var s = "";
  var head = "M250 40 C380 30 482 92 490 200 C496 282 470 332 452 380 L452 800 L250 800 L250 560 C250 522 232 492 202 472 C172 456 142 452 122 442 C102 432 96 406 110 392 C100 382 96 366 106 356 C94 350 92 336 102 326 C96 312 92 302 86 292 C60 287 50 270 70 255 C86 222 110 182 116 150 C122 110 162 52 250 40 Z";
  s += P(head, SKIN, 2.6);
  s += '<path d="' + head + '" fill="url(#hatch)" opacity=".18"/>';
  // spine at the back of the neck
  for (var y = 300; y < 800; y += 46) s += R(398, y, 50, 36, BONE, 1.8, 5) + R(402, y + 36, 42, 10, "#d7a48a", 1.2);
  // air spaces: nose, mouth roof, throat; the windpipe and the gullet below
  s += P("M120 205 C175 178 262 184 334 212 L334 246 C262 238 182 246 126 254 Z", CAV, 2);
  s += P("M108 322 C170 290 262 280 334 250 L334 214 C364 208 386 228 386 262 L386 482 L262 482 L262 462 L300 420 L312 332 Z", CAV, 2);
  // windpipe (front) with cartilage rings
  s += R(262, 478, 56, 330, o.hl === "air" ? AIRC : "#e9e4d8", 2.4);
  for (y = 500; y < 800; y += 28) s += P("M262 " + y + " Q290 " + (y + 9) + " 318 " + y, "none", 5, ' stroke="' + BONE + '"') + P("M262 " + (y - 3) + " Q290 " + (y + 6) + " 318 " + (y - 3), "none", 1.2);
  // gullet (behind): a soft, closed tube that opens where the food is
  var fy = o.food && o.food[0] > 322 && o.food[1] > 478 ? o.food[1] : -999;
  s += R(330, 478, 44, 330, o.hl === "food" ? "#c7b06a" : "#d79b85", 2.4);
  var slit = "M352 482"; for (y = 492; y <= 800; y += 10) { var w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 - w) + " " + y; } s += P(slit, "none", 1.6);
  slit = "M352 482"; for (y = 492; y <= 800; y += 10) { w = Math.max(0, 15 - Math.abs(y - fy) * .35); slit += " L" + f(352 + w) + " " + y; } s += P(slit, "none", 1.6);
  // air running up and down the windpipe and out of the nose
  if (o.air) s += G("", '<path d="M290 800 L290 470 L340 330 L345 240 L250 225 L120 230" fill="none" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 16" stroke-dashoffset="' + f(-t * 46) + '"/>', o.air);
  // hard palate (bone) and soft palate
  s += P("M104 300 C170 288 250 280 312 272", "none", 9, ' stroke="' + INK + '"') + P("M104 300 C170 288 250 280 312 272", "none", 5, ' stroke="' + BONE + '"');
  s += P("M310 268 C330 270 346 290 348 322 C340 330 330 322 322 300 Z", "#d78f7b", 1.8);
  // lower jaw bone
  s += P("M112 410 C150 440 205 466 246 476", "none", 12, ' stroke="' + INK + '" stroke-linecap="round"') + P("M112 410 C150 440 205 466 246 476", "none", 7, ' stroke="' + BONE + '" stroke-linecap="round"');
  // tongue
  s += P("M112 336 C150 300 250 286 296 300 C322 316 316 382 302 420 C292 450 276 464 262 468 C230 468 190 446 150 413 C128 396 114 370 112 336 Z", TONGUE, 2.4);
  s += '<path d="M150 340 C200 318 250 312 285 320" stroke="#a9584b" stroke-width="1.6" fill="none"/><path d="M160 372 C210 352 255 350 290 360" stroke="#a9584b" stroke-width="1.4" fill="none" opacity=".7"/>';
  // the epiglottis: hinged at the front of the voice box, upright when breathing, folded back over the windpipe when swallowing
  var a = lerp(-78, 14, clamp(o.ep || 0)) * Math.PI / 180, px = 266, py = 466, L = 66, nx = Math.cos(a), ny = Math.sin(a), qx = -ny, qy = nx;
  s += P("M" + f(px) + " " + f(py) + " Q" + f(px + nx * L * .5 + qx * 13) + " " + f(py + ny * L * .5 + qy * 13) + " " + f(px + nx * L) + " " + f(py + ny * L) + " Q" + f(px + nx * L * .5 - qx * 6) + " " + f(py + ny * L * .5 - qy * 6) + " " + f(px) + " " + f(py) + " Z", o.hl === "ep" ? OLIVE : "#a3a26a", 2.2);
  // food, water, finger
  if (o.water) s += o.water;
  if (o.food) s += C(o.food[0], o.food[1], 17, FOOD, 2.2) + '<circle cx="' + f(o.food[0] - 5) + '" cy="' + f(o.food[1] - 6) + '" r="4" fill="#fff" opacity=".35"/>';
  if (o.finger) s += o.finger;
  return s;
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
  out.far = arm(1) + (o.noLeg1 ? "" : leg(1));
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
  out.body = (o.noLeg0 ? "" : leg(0)) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }
