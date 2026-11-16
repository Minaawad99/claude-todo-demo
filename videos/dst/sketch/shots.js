// ── people (copied from videos/choking/sketch/shots.js: real body proportions, Drillis & Contini) ──
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

// ── «ليه بنقدّم الساعة في الصيف؟» — drawings. Shapes follow the «طب إزاي؟» reference (v06: sun, clock, day line;
// v14: globes) and real references (refs/SOURCES.md): the Earth with real coastlines tilted 23.4° on its orbit, the Cairo
// skyline with the Cairo Tower (lattice shaft, lotus crown, round floors and mast), a gas-fired combined-cycle plant
// (turbine hall, boiler block, tall stack) and a lattice pylon, a round wall clock. Day lengths are Cairo's real ones.
var DAY = "#ecd08a", NIGHT = "#3e4856", DAWN = "#e9b98a", SKYD = "#cfdde0", LIT = "#f2c96b", DARKW = "#5b6470", WALL = "#d8ccae", WALL2 = "#c4b69a";
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, k) { var p = hex(a), q = hex(b); k = clamp(k); return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(lerp(p[i], q[i], k)); }).join(",") + ")"; }
function hm(h) { var H = Math.floor(h + 1e-6), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } return H + ":" + ("0" + M).slice(-2); }

// a globe tilted by roll degrees (the axis leans), with the axis drawn through the poles
function tglobe(cx, cy, r, lon, roll, op) {
  op = op || {}; var g = GEO.globe(cx, cy, r, lon, 0, roll), id = "tg" + (++CLIPN);
  var s = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r + 5) + '" fill="#cdd8d6" stroke="' + INK + '" stroke-width="1.2"/>';
  s += '<path d="' + g.sphere + '" fill="' + OCEAN + '"/><path d="' + g.grat + '" fill="none" stroke="#eef2ec" stroke-width="1.2" opacity=".85"/>';
  s += '<path d="' + g.land + '" fill="' + LAND + '" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>';
  // night side: away from the Sun (sun on the left unless op.sunRight)
  var dir = op.sunRight ? -1 : 1;
  s += '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath><g clip-path="url(#' + id + ')"><rect x="' + f(dir > 0 ? cx : cx - r - 2) + '" y="' + f(cy - r - 2) + '" width="' + f(r + 2) + '" height="' + f(2 * r + 4) + '" fill="url(#hatch)"/><rect x="' + f(dir > 0 ? cx : cx - r - 2) + '" y="' + f(cy - r - 2) + '" width="' + f(r + 2) + '" height="' + f(2 * r + 4) + '" fill="' + INK + '" opacity=".12"/></g>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  var a = roll * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a);
  if (op.axis !== false) s += '<path d="M' + f(cx - ux * r * 1.35) + ' ' + f(cy - uy * r * 1.35) + ' L' + f(cx + ux * r * 1.35) + ' ' + f(cy + uy * r * 1.35) + '" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="7 5"/>' + C(cx + ux * r * 1.35, cy + uy * r * 1.35, 4, INK, 0);
  if (op.dot) { var p = g.project(op.dot); if (p) s += C(p[0], p[1], 7, ORANGE, 2) + C(p[0], p[1], 2.5, "#fff", 0); }
  return s;
}

// a round wall clock (white face, dark rim, 60 ticks, 12 · 3 · 6 · 9), time h:m
function clock(cx, cy, r, h, m, op) {
  op = op || {}; var s = C(cx, cy, r, op.rim || "#5a4636", 2.4) + C(cx, cy, r * .86, "#f6f1e4", 1.6), i;
  for (i = 0; i < 60; i++) { var b = i / 60 * Math.PI * 2, r1 = i % 5 ? r * .78 : r * .7; s += '<path d="M' + f(cx + Math.cos(b) * r1) + ' ' + f(cy + Math.sin(b) * r1) + ' L' + f(cx + Math.cos(b) * r * .83) + ' ' + f(cy + Math.sin(b) * r * .83) + '" stroke="' + INK + '" stroke-width="' + f(i % 5 ? Math.max(.8, r * .012) : Math.max(1.6, r * .03)) + '"/>'; }
  if (r > 40) [["12", 0, -1], ["3", 1, 0], ["6", 0, 1], ["9", -1, 0]].forEach(function (q) { s += N(q[0], cx + q[1] * r * .55, cy + q[2] * r * .55 + r * .08, r * .2, INK); });
  if (op.wedge) { var w0 = op.wedge[0], w1 = op.wedge[1], a0 = w0 / 12 * Math.PI * 2 - Math.PI / 2, a1 = w1 / 12 * Math.PI * 2 - Math.PI / 2, rr = r * .66;
    s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(a0) * rr) + ' ' + f(cy + Math.sin(a0) * rr) + ' A' + f(rr) + ' ' + f(rr) + ' 0 ' + (w1 - w0 > 6 ? 1 : 0) + ' 1 ' + f(cx + Math.cos(a1) * rr) + ' ' + f(cy + Math.sin(a1) * rr) + ' Z" fill="' + (op.wcol || ORANGE) + '" opacity=".3"/>'; }
  var ha = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = m / 60 * Math.PI * 2 - Math.PI / 2;
  s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(ha) * r * .45) + ' ' + f(cy + Math.sin(ha) * r * .45) + '" stroke="' + INK + '" stroke-width="' + f(r * .07) + '" stroke-linecap="round"/>';
  s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(ma) * r * .7) + ' ' + f(cy + Math.sin(ma) * r * .7) + '" stroke="' + INK + '" stroke-width="' + f(r * .04) + '" stroke-linecap="round"/>';
  return s + C(cx, cy, r * .06, op.hand || ORANGE, 1.4);
}
function sunIcon(x, y, r, t) { var s = "", k; for (k = 0; k < 10; k++) { var a = k / 10 * Math.PI * 2 + (t || 0) * .3; s += '<path d="M' + f(x + Math.cos(a) * r * 1.3) + ' ' + f(y + Math.sin(a) * r * 1.3) + ' L' + f(x + Math.cos(a) * r * 1.7) + ' ' + f(y + Math.sin(a) * r * 1.7) + '" stroke="' + ORANGE + '" stroke-width="' + f(Math.max(2, r * .18)) + '" stroke-linecap="round"/>'; } return s + C(x, y, r, "#e2a062", 2); }
function moonIcon(x, y, r) { return '<path d="M' + f(x + r * .3) + ' ' + f(y - r) + ' A' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(x + r * .3) + ' ' + f(y + r) + ' A' + f(r * .75) + ' ' + f(r * .9) + ' 0 1 1 ' + f(x + r * .3) + ' ' + f(y - r) + ' Z" fill="' + MOONC + '" stroke="' + INK + '" stroke-width="1.8"/>'; }

// a 24-hour day line (reference v06's sun → moon line, made into a real clock scale): 0–24 h, night dark, daylight warm.
// o: {rise, set, wake: [from, to], k (how far it has drawn), lab (hour labels), hi: [from, to] a highlighted stretch}
function dayBar(x, y, w, o) {
  o = o || {}; var k = o.k == null ? 1 : o.k, H = o.h || 42, X = function (hh) { return x + w * hh / 24; }, s = "";
  s += sweep(x - 2, y - 60, w + 4, H + 120, k, "r",
    R(x, y, w, H, NIGHT, 2) + '<rect x="' + f(X(o.rise)) + '" y="' + f(y) + '" width="' + f(X(o.set) - X(o.rise)) + '" height="' + H + '" fill="' + DAY + '" stroke="' + INK + '" stroke-width="2"/>' +
    (o.hi ? '<rect x="' + f(X(o.hi[0])) + '" y="' + f(y) + '" width="' + f(X(o.hi[1]) - X(o.hi[0])) + '" height="' + H + '" fill="' + (o.hiCol || ORANGE) + '" opacity=".55"/>' + '<rect x="' + f(X(o.hi[0])) + '" y="' + f(y) + '" width="' + f(X(o.hi[1]) - X(o.hi[0])) + '" height="' + H + '" fill="url(#hatch)"/>' : "") +
    [0, 3, 6, 9, 12, 15, 18, 21, 24].map(function (hh) { return '<path d="M' + f(X(hh)) + ' ' + f(y + H) + ' v8" stroke="' + INK + '" stroke-width="1.6"/>' + (o.lab !== false ? N(String(hh), X(hh), y + H + 30, 20, MUTE) : ""); }).join("") +
    sunIcon(X(o.rise), y - 26, 11) + moonIcon(X(o.set) + 4, y - 26, 12));
  if (o.wake) s += G("", '<path d="M' + f(X(o.wake[0])) + ' ' + f(y + H + 48) + ' h' + f(X(o.wake[1]) - X(o.wake[0])) + '" stroke="' + OLIVE + '" stroke-width="6" stroke-linecap="round"/>' + T(o.wakeT || "الناس صاحية", (X(o.wake[0]) + X(o.wake[1])) / 2, y + H + 80, 22, OLIVE, 700), clamp(k * 2 - 1));
  return s;
}

// ── Cairo at eye level: sky, sun, the Nile, a row of blocks and the Cairo Tower ──
// o: {sky 0 night … 1 day, dawn 0..1 warm tint, sun: [x, y] | null, lit 0..1 windows lit, moon, stars, t}
function cairoTower(x, g, h, lit) {
  var w = h * .075, top = g - h * .78, s = "", y;
  s += R(x - w / 2, top, w, g - top, "#d9cdb0", 2);
  var d = ""; for (y = top + 6; y < g - 4; y += w * .7) d += "M" + f(x - w / 2) + " " + f(y) + " L" + f(x + w / 2) + " " + f(y + w * .7) + " M" + f(x + w / 2) + " " + f(y) + " L" + f(x - w / 2) + " " + f(y + w * .7) + " ";
  s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="1" opacity=".7" fill="none"/>';
  // the lotus crown: lattice petals opening out under the round floors
  var cw = w * 2.1, cb = top + h * .02, ct = top - h * .07, p = "";
  for (var i = 0; i <= 6; i++) { var xx = x - cw / 2 + cw * i / 6; p += "M" + f(lerp(x - w / 2, x + w / 2, i / 6)) + " " + f(cb + h * .05) + " L" + f(xx) + " " + f(ct) + " "; }
  s += '<path d="M' + f(x - w / 2) + ' ' + f(cb + h * .05) + ' L' + f(x - cw / 2) + ' ' + f(ct) + ' L' + f(x + cw / 2) + ' ' + f(ct) + ' L' + f(x + w / 2) + ' ' + f(cb + h * .05) + ' Z" fill="#e8dfc8" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="' + p + '" stroke="' + INK + '" stroke-width="1.2" fill="none"/>';
  // round floors (restaurant + deck), the upper drum and the mast
  var fw = w * 1.55, fh = h * .085; s += R(x - fw / 2, ct - fh, fw, fh, "#c9b996", 2);
  for (i = 0; i < 3; i++) s += '<rect x="' + f(x - fw / 2 + 3) + '" y="' + f(ct - fh + 4 + i * fh / 3) + '" width="' + f(fw - 6) + '" height="' + f(fh / 3 - 6) + '" fill="' + mix("#7d8a96", LIT, lit) + '"/>';
  s += R(x - fw * .62, ct - fh - 6, fw * 1.24, 6, "#e8dfc8", 1.6) + R(x - w * .55, ct - fh - 6 - h * .045, w * 1.1, h * .045, "#c9b996", 1.6);
  s += '<path d="M' + f(x) + ' ' + f(ct - fh - 6 - h * .045) + ' V' + f(ct - fh - h * .2) + '" stroke="' + INK + '" stroke-width="2.4"/>' + C(x, ct - fh - h * .2, 2.5, ORANGE, 0);
  return s;
}
function block(x, g, w, h, lit, seed, col) {
  var s = R(x, g - h, w, h, col || WALL, 2), cols = Math.max(2, Math.floor(w / 22)), rows = Math.max(2, Math.floor(h / 26)), i, j;
  s += R(x - 3, g - h - 6, w + 6, 6, WALL2, 1.4);
  for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) { var on = hash(seed * 37 + j * 11 + i) < lit; s += '<rect x="' + f(x + 6 + i * (w - 12) / cols) + '" y="' + f(g - h + 10 + j * (h - 14) / rows) + '" width="' + f((w - 12) / cols - 6) + '" height="' + f((h - 14) / rows - 9) + '" fill="' + (on ? LIT : DARKW) + '" stroke="' + INK + '" stroke-width=".8"/>'; }
  // a split AC box under some windows
  if (seed % 2) s += R(x + w - 22, g - h * .55, 16, 10, "#ece6d8", 1.2);
  return s;
}
function cairo(o) {
  o = o || {}; var t = o.t || 0, g = o.g || 560, s = "", sky = mix(NIGHT, SKYD, o.sky == null ? 1 : o.sky);
  s += '<rect x="-200" y="-200" width="1040" height="' + (g + 200) + '" fill="' + sky + '"/>';
  if (o.dawn) s += '<rect x="-200" y="' + (g - 260) + '" width="1040" height="260" fill="' + DAWN + '" opacity="' + f(o.dawn * .85) + '"/>';
  if (o.stars) for (var i = 0; i < 26; i++) s += '<circle cx="' + f(-60 + hash(i) * 760) + '" cy="' + f(40 + hash(i + 7) * (g - 260)) + '" r="' + f(1 + hash(i + 3) * 1.6) + '" fill="#f4ecdb" opacity="' + f(o.stars * (.5 + .5 * Math.sin(t * 2 + i))) + '"/>';
  if (o.moon) s += moonIcon(o.moon[0], o.moon[1], 22);
  if (o.sun) s += sun(o.sun[0], o.sun[1], o.sunR || 34, t);
  // far blocks, then the tower, then near blocks
  [[-120, 70, 150, 3], [-40, 90, 190, 4], [70, 60, 130, 5], [360, 80, 170, 6], [460, 64, 140, 7], [540, 90, 200, 8], [650, 80, 150, 9]].forEach(function (b) { s += block(b[0], g - 40, b[1], b[2], o.lit || 0, b[3], WALL2); });
  s += cairoTower(o.tx || 300, g - 40, o.th || 430, o.lit || 0);
  s += '<rect x="-200" y="' + (g - 40) + '" width="1040" height="40" fill="#c9bb98" stroke="' + INK + '" stroke-width="2"/>';
  // the Nile in front, with a felucca drifting
  s += '<rect x="-200" y="' + g + '" width="1040" height="120" fill="' + mix("#2f3b48", "#7f9fb2", o.sky == null ? 1 : o.sky) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (i = 0; i < 7; i++) { var wx = -60 + ((i * 120 + t * 30) % 820); s += '<path d="M' + f(wx) + ' ' + f(g + 30 + (i % 3) * 26) + ' q12 -5 24 0" stroke="#d6e2e6" stroke-width="2.2" fill="none" opacity=".7"/>'; }
  var fx = 470 - 10 * t % 900; fx = 520 - (t * 8) % 300;
  s += G("translate(" + f(fx) + " " + f(g + 44 + 2 * Math.sin(t * 2)) + ")", '<path d="M-38 0 L38 0 L28 14 L-30 14 Z" fill="#8a6a4c" stroke="' + INK + '" stroke-width="1.8"/><path d="M0 0 V-80" stroke="' + INK + '" stroke-width="2.2"/><path d="M2 -78 L44 -6 L2 -6 Z" fill="#f4efe3" stroke="' + INK + '" stroke-width="1.8"/><path d="M-4 -70 L-40 -10" stroke="' + INK + '" stroke-width="1.6"/>');
  s += '<rect x="-200" y="' + (g + 120) + '" width="1040" height="400" fill="#e3d7bd" stroke="' + INK + '" stroke-width="2"/><rect x="-200" y="' + (g + 120) + '" width="1040" height="400" fill="url(#hatch)" opacity=".35"/>';
  return s;
}

// ── a flat in a block, cut open: three rooms with a lamp, a split AC and a TV that switch on ──
function flatCut(x, y, on, t) {
  var s = R(x, y, 460, 420, "#efe6d2", 3), rooms = [[x, y], [x + 230, y], [x, y + 210], [x + 230, y + 210]];
  s += '<path d="M' + (x + 230) + ' ' + y + ' V' + (y + 420) + ' M' + x + ' ' + (y + 210) + ' H' + (x + 460) + '" stroke="' + INK + '" stroke-width="6"/>';
  rooms.forEach(function (r, i) {
    var k = clamp(on * 4 - i), rx = r[0], ry = r[1];
    s += '<rect x="' + (rx + 4) + '" y="' + (ry + 4) + '" width="222" height="202" fill="' + mix("#b9b3a3", "#f6e7bf", k) + '"/>';
    // ceiling lamp
    s += '<path d="M' + (rx + 115) + ' ' + (ry + 4) + ' v24" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (rx + 97) + ' ' + (ry + 46) + ' L' + (rx + 105) + ' ' + (ry + 28) + ' h20 l8 18 Z" fill="#8f8576" stroke="' + INK + '" stroke-width="1.6"/>' + C(rx + 115, ry + 50, 6, k > .5 ? LIT : "#e9e4d8", 1.4);
    if (k > .5) s += '<path d="M' + (rx + 99) + ' ' + (ry + 50) + ' L' + (rx + 60) + ' ' + (ry + 200) + ' H' + (rx + 170) + ' L' + (rx + 131) + ' ' + (ry + 50) + ' Z" fill="' + LIT + '" opacity=".22"/>';
    // split AC on the wall, with cold air when on
    s += R(rx + 140, ry + 22, 74, 24, "#f4f1ea", 1.6, 4) + '<path d="M' + (rx + 146) + ' ' + (ry + 40) + ' h62" stroke="' + INK + '" stroke-width="1"/>' + C(rx + 206, ry + 30, 2, k > .5 ? "#6fae6a" : GREY, 0);
    if (k > .5) for (var j = 0; j < 3; j++) s += '<path d="M' + (rx + 152 + j * 20) + ' ' + f(ry + 54 + (t * 30 + j * 12) % 30) + ' q6 6 0 12" stroke="' + BLUE + '" stroke-width="2" fill="none" opacity=".7"/>';
    // floor furniture: a TV on a low unit (rooms 0, 3), a sofa (1, 2)
    if (i % 3 === 0) s += R(rx + 30, ry + 172, 90, 30, WOOD, 1.6) + R(rx + 38, ry + 116, 74, 50, k > .5 ? "#7fa0b8" : "#3a3a3a", 2) + '<path d="M' + (rx + 75) + ' ' + (ry + 166) + ' v6" stroke="' + INK + '" stroke-width="3"/>';
    else s += '<path d="M' + (rx + 40) + ' ' + (ry + 202) + ' v-50 h120 v50 Z" fill="#9a6a52" stroke="' + INK + '" stroke-width="1.8"/>' + R(rx + 40, ry + 170, 120, 18, "#b8826a", 1.6);
  });
  return s;
}
// a combined-cycle gas plant (turbine hall, boiler block, stack) and a lattice pylon carrying the line out
function plant(x, g, load, t) {
  var s = R(x, g - 120, 230, 120, "#7f97a6", 2) + R(x + 230, g - 190, 90, 190, "#a8b4b8", 2), i;
  for (i = 1; i < 12; i++) s += '<path d="M' + (x + i * 19) + ' ' + (g - 118) + ' v116" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>';
  for (i = 1; i < 6; i++) s += '<path d="M' + (x + 232) + ' ' + (g - 190 + i * 32) + ' h86" stroke="' + INK + '" stroke-width=".8" opacity=".5"/>';
  s += R(x + 330, g - 330, 34, 330, "#d8d2c4", 2) + R(x + 330, g - 318, 34, 12, ORANGE, 1.2) + R(x + 330, g - 290, 34, 12, "#f4efe3", 1.2) + R(x + 320, g - 26, 54, 26, "#a8b4b8", 1.6);
  s += '<path d="M' + (x + 320) + ' ' + (g - 150) + ' h10" stroke="' + INK + '" stroke-width="10"/>';
  // the gas line coming in (yellow, as gas pipes are painted)
  s += '<path d="M' + (x - 120) + ' ' + (g - 16) + ' H' + (x + 6) + '" stroke="' + INK + '" stroke-width="12"/><path d="M' + (x - 120) + ' ' + (g - 16) + ' H' + (x + 6) + '" stroke="#e0b93f" stroke-width="8"/>';
  // exhaust from the stack, more with the load
  for (i = 0; i < 6; i++) { var p = ((t * .35 + i / 6) % 1), r = (10 + 30 * p) * (.4 + load); s += '<circle cx="' + f(x + 347 + 40 * p + 8 * Math.sin(t + i)) + '" cy="' + f(g - 340 - 150 * p) + '" r="' + f(r) + '" fill="#cfcac0" stroke="' + INK + '" stroke-width="1.2" opacity="' + f((1 - p) * (.3 + .6 * load)) + '"/>'; }
  return s;
}
function pylon(x, g, h) {
  var w0 = h * .32, w1 = h * .08, s = "", top = g - h, i, d = "";
  s += '<path d="M' + f(x - w0 / 2) + ' ' + g + ' L' + f(x - w1 / 2) + ' ' + f(top + h * .12) + ' L' + f(x + w1 / 2) + ' ' + f(top + h * .12) + ' L' + f(x + w0 / 2) + ' ' + g + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  for (i = 0; i < 7; i++) { var y1 = g - (h * .88) * i / 7, y2 = g - (h * .88) * (i + 1) / 7, a1 = lerp(w0, w1, i / 7) / 2, a2 = lerp(w0, w1, (i + 1) / 7) / 2; d += "M" + f(x - a1) + " " + f(y1) + " L" + f(x + a2) + " " + f(y2) + " M" + f(x + a1) + " " + f(y1) + " L" + f(x - a2) + " " + f(y2) + " M" + f(x - a2) + " " + f(y2) + " H" + f(x + a2) + " "; }
  s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="1.2" fill="none"/>';
  [[.12, .9], [.3, .7], [.48, .55]].forEach(function (q) { var y = top + h * q[0], a = h * .5 * q[1] / 1.4; s += '<path d="M' + f(x - a) + ' ' + f(y) + ' H' + f(x + a) + ' M' + f(x - a) + ' ' + f(y) + ' L' + f(x - w1) + ' ' + f(y + 14) + ' M' + f(x + a) + ' ' + f(y) + ' L' + f(x + w1) + ' ' + f(y + 14) + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x - a + 4) + ' ' + f(y) + ' v14 M' + f(x + a - 4) + ' ' + f(y) + ' v14" stroke="#7f97a6" stroke-width="4"/>'; });
  return s + C(x, top + 4, 3, ORANGE, 0) + '<path d="M' + x + ' ' + f(top + h * .12) + ' V' + top + '" stroke="' + INK + '" stroke-width="2"/>';
}
// the load meter: needle from 0 (left) to 1 (right), red band at the top end
function gauge(cx, cy, r, v, lab) {
  var s = '<path d="M' + f(cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + f(cx + r) + ' ' + cy + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + f(cx + r * Math.cos(Math.PI * 1.25)) + ' ' + f(cy + r * Math.sin(Math.PI * 1.25)) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(cx + r) + ' ' + cy + '" stroke="' + ORANGE + '" stroke-width="10" fill="none" opacity=".8" transform="translate(0 0)"/>';
  for (var i = 0; i <= 10; i++) { var a = Math.PI + i / 10 * Math.PI; s += '<path d="M' + f(cx + Math.cos(a) * r * .78) + ' ' + f(cy + Math.sin(a) * r * .78) + ' L' + f(cx + Math.cos(a) * r * .92) + ' ' + f(cy + Math.sin(a) * r * .92) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 1.4 : 2.6) + '"/>'; }
  var na = Math.PI + clamp(v) * Math.PI; s += '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.cos(na) * r * .82) + ' ' + f(cy + Math.sin(na) * r * .82) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(cx, cy, 7, INK, 0);
  return s + (lab ? T(lab, cx, cy + 32, 20, INK, 700) : "");
}

// ── people ──
// asleep in bed, side view: a bed 1.15 H long, mattress top 0.27 H, the head on the pillow and the duvet over the body
function bed(x, fl, s, t, awake) {
  var H = 400 * s, L = 1.15 * H, mt = fl - .27 * H, o = "", br = 1 + .015 * Math.sin(t * 1.6);
  o += R(x - 14, mt - .3 * H, 14, .3 * H + (fl - mt), WOOD_D, 2) + R(x + L, mt - .14 * H, 12, .14 * H + (fl - mt), WOOD_D, 2);
  o += R(x, mt + .06 * H, L, (fl - mt) - .06 * H - 20, WOOD, 2) + R(x, mt, L, .07 * H, "#f1ece0", 2, 6);
  o += '<ellipse cx="' + f(x + .1 * H) + '" cy="' + f(mt - .03 * H) + '" rx="' + f(.12 * H) + '" ry="' + f(.045 * H) + '" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>';
  // head lying face up (0.115 H deep, 0.13 H tall → turned on its back)
  var hx = x + .12 * H, hy = mt - .085 * H, rx = .065 * H, ry = .058 * H;
  o += G("translate(" + f(hx) + " " + f(hy) + ")", '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + f(-rx) + ' ' + f(ry * .1) + ' C' + f(-rx * 1.05) + ' ' + f(-ry * .9) + ' ' + f(-rx * .1) + ' ' + f(-ry * 1.15) + ' ' + f(rx * .2) + ' ' + f(-ry * 1) + ' L' + f(rx * .1) + ' ' + f(-ry * .55) + ' Q' + f(-rx * .5) + ' ' + f(-ry * .4) + ' ' + f(-rx * .7) + ' ' + f(ry * .3) + ' Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<path d="M' + f(rx * .55) + ' ' + f(-ry * .95) + ' l' + f(rx * .32) + ' ' + f(-ry * .25) + ' l' + f(rx * .05) + ' ' + f(ry * .3) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.6"/>' + (awake ? "" : '<path d="M' + f(rx * .3) + ' ' + f(-ry * .45) + ' q' + f(rx * .2) + ' ' + f(ry * .12) + ' ' + f(rx * .35) + ' 0" stroke="' + INK + '" stroke-width="1.6" fill="none"/>'));
  // duvet over the trunk and legs: shoulders at 0.2 H from the head end, feet at 1.07 H; it rises a little with each breath
  o += '<path d="M' + f(x + .19 * H) + ' ' + f(mt + 2) + ' C' + f(x + .2 * H) + ' ' + f(mt - .14 * H * br) + ' ' + f(x + .45 * H) + ' ' + f(mt - .15 * H * br) + ' ' + f(x + .6 * H) + ' ' + f(mt - .11 * H) + ' C' + f(x + .8 * H) + ' ' + f(mt - .08 * H) + ' ' + f(x + .98 * H) + ' ' + f(mt - .1 * H) + ' ' + f(x + 1.08 * H) + ' ' + f(mt - .05 * H) + ' L' + f(x + 1.13 * H) + ' ' + f(mt + .1 * H) + ' L' + f(x + .19 * H) + ' ' + f(mt + .1 * H) + ' Z" fill="#a9c0cc" stroke="' + INK + '" stroke-width="2.2"/>';
  o += '<path d="M' + f(x + .3 * H) + ' ' + f(mt - .1 * H) + ' q' + f(.15 * H) + ' ' + f(.04 * H) + ' ' + f(.3 * H) + ' ' + f(.02 * H) + '" stroke="#86a2b2" stroke-width="2" fill="none"/>';
  if (!awake) for (var i = 0; i < 3; i++) { var p = (t * .5 + i / 3) % 1; o += G("", T("z", hx + 20 + p * 50, hy - 40 - p * 70, 16 + p * 14, MUTE, 800), Math.sin(p * Math.PI)); }
  return o;
}
function room(fl, wallTo) { return '<rect x="-300" y="-300" width="1240" height="' + (fl + 300) + '" fill="#e9dfc6"/>' + floor(fl) + '<path d="M-300 ' + (fl - 24) + ' H940" stroke="' + INK + '" stroke-width="1.4"/>'; }
function windowSky(x, y, w, h, sky, sunP, t) {
  var id = "ws" + (++CLIPN), s = '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/></clipPath>';
  s += '<g clip-path="url(#' + id + ')"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + sky + '"/>' + (sunP ? sun(sunP[0], sunP[1], 30, t) : "") + cairoMini(x, y + h, w) + '</g>';
  return s + R(x, y, w, h, "none", 6) + '<path d="M' + (x + w / 2) + ' ' + y + ' v' + h + ' M' + x + ' ' + (y + h / 2) + ' h' + w + '" stroke="' + INK + '" stroke-width="4"/>' + R(x - 12, y + h, w + 24, 12, WOOD, 2);
}
function cairoMini(x, g, w) { var s = ""; for (var i = 0; i < 6; i++) { var bw = 26 + hash(i) * 30, bh = 30 + hash(i + 5) * 60; s += R(x + i * w / 6, g - bh, bw, bh, WALL2, 1.2); } return s; }
// a schoolchild walking (s = 0.74: a 9-year-old is about 1.3 m against 1.75 m), with a backpack
function kid(x, fl, s, t, op) {
  op = op || {}; var sw = 22 * Math.sin(t * 5.2);
  var k = fig({ x: x, y: fl - 212 * s, s: s, lean: 4, shirt: "#e9e6dc", hair: HAIR, legs: [[sw, -8 - Math.max(0, -sw) * .6], [-sw, -8 - Math.max(0, sw) * .6]], hands: [rel(-30, 30 + sw), rel(-30, -28 - sw)] });
  var bp = k.at(80, -40); return k.far + R(bp[0] - 4, bp[1] - 44 * s, 40 * s, 62 * s, "#bd552f", 2, 6) + k.body + k.near;
}

// ── shots (one per idea; line numbers from script.txt) ──
var TILT = 23.4, CAIRO = [31.2, 30.0];
// 4 · the Earth leans about 23.5° as it goes round the Sun: the Sun off the left edge, the globe on its orbit, the angle drawn
shot(4, push(330, 400, 1.05, .96), function (u, d, t) {
  var k = at(u, .8, 1), a = TILT * k;
  var s = paper() + sun(-70, 400, 170, t) + draw("M120 610 C260 700 560 690 700 560", at(u, 0, .8), INK, 1.6, ' stroke-dasharray="8 8"') + draw("M120 190 C260 100 560 110 700 240", at(u, 0, .8), INK, 1.6, ' stroke-dasharray="8 8"');
  s += appear(at(u, .2, .4), tglobe(420, 400, 160, 30 + t * 3, -a));
  s += '<path d="M420 190 V610" stroke="' + MUTE + '" stroke-width="1.6" stroke-dasharray="4 6"/>';
  if (k > 0) s += '<path d="M420 300 A100 100 0 0 0 ' + f(420 - 100 * Math.sin(a * Math.PI / 180)) + ' ' + f(400 - 100 * Math.cos(a * Math.PI / 180)) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none"/>';
  return s + numBox(count(23.5, k, 1) + "°", 520, 160, at(u, 1, .3), 40) + label(470, 640, 560, 700, "مدار الأرض", INK, at(u, 1.6, .5), 20);
});
// 5 · June: the north leans toward the Sun, long day; December, on the far side of the orbit, it leans away, short day
shot(5, function (u, d) { var k = ease((u - d * .45) / 1.2); return [lerp(300, 340, k), 430, lerp(.86, .82, k)]; }, function (u, d, t) {
  var s = paper() + sun(320, 420, 52, t) + '<ellipse cx="320" cy="420" rx="210" ry="80" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>';
  // left globe: the Sun is on its right → lean the north pole toward the right; right globe: north still leans the same way in space, now away from the Sun
  s += tglobe(110, 420, 82, 30 + t * 3, TILT, { sunRight: true, dot: CAIRO }) + tglobe(530, 420, 82, 30 + t * 3, TILT, { dot: CAIRO });
  var half = d * .45;
  s += tag("الصيف", 110, 270, at(u, .3, .3), 30, ORANGE) + G("", T("النهار يطول", 110, 580, 26, INK, 800), at(u, .9, .3));
  s += tag("الشتا", 530, 270, at(u, half + .4, .3), 30, BLUE) + G("", T("النهار يقصر", 530, 580, 26, INK, 800), at(u, half + 1, .3));
  return s;
}, { tr: "out" });
// 6 · Cairo's real day lengths: 21 June 4:54 → 18:59 (14 h 05), 21 December 6:43 → 16:59 (10 h 16), standard time
shot(6, push(320, 400, .98, 1.05), function (u, d, t) {
  var s = paper() + T("القاهرة", 320, 150, 34, INK, 800);
  s += T("21 يونيو", 600, 228, 24, ORANGE, 800, "start") + dayBar(40, 270, 560, { rise: 4.9, set: 18.98, k: at(u, .3, .9) });
  s += T("21 ديسمبر", 600, 448, 24, BLUE, 800, "start") + dayBar(40, 490, 560, { rise: 6.72, set: 16.98, k: at(u, d * .5, .9) });
  s += G("", measure(40 + 560 * 4.9 / 24, 370, 40 + 560 * 18.98 / 24, 370, 1, "") + N(count(14, at(u, .9, .8)), 300, 425, 44, ORANGE) + T("ساعة", 370, 422, 24, INK, 700), at(u, .9, .3));
  s += G("", measure(40 + 560 * 6.72 / 24, 590, 40 + 560 * 16.98 / 24, 590, 1, "") + N(count(10, at(u, d * .45 + .4, .8)), 300, 645, 44, BLUE) + T("ساعات", 374, 642, 24, INK, 700), at(u, d * .45 + .4, .3));
  return s;
}, { tr: "out" });
// 7 · «قاعدة صغيرة»: a pinned card
shot(7, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", sunIcon(190, 560, 40, t) + clock(450, 560, 80, 5, 0), .35) + G("", '<rect x="130" y="210" width="380" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 295)"/>' +
    T("الساعة", 320, 280, 42, ORANGE, 800) + T("رقم إحنا متفقين عليه", 320, 335, 30, INK, 700) + C(320, 216, 9, ORANGE, 2), at(u, .3, .4));
});
// 8 · the Sun doesn't look at your clock: the Sun holds still over the river while the clock hands spin
shot(8, push(320, 420, 1.04, .98), function (u, d, t) {
  var spin = u * 2.6;
  return paper() + G("translate(0 120) scale(1 .9)", cairo({ sky: 1, sun: [470, 160], t: t, lit: 0 })) + iconBox(150, 210, 230, clock(0, 0, 100, spin, (spin % 1) * 60), at(u, .2, .3)) + cross(150, 210, 1.3, at(u, 1.6, .5)) +
    label(450, 300, 400, 380, "الشمس", ORANGE, at(u, .6, .5), 24);
});
// 9 · midsummer: sunrise at 4:55 over a city asleep (dark windows), the clock in the corner
shot(9, push(320, 430, 1.02, 1.08), function (u, d, t) {
  var k = at(u, .2, d - .4);
  return paper() + cairo({ sky: lerp(.25, .8, k), dawn: 1 - k * .4, sun: [215, lerp(560, 330, k)], lit: 0, t: t }) + iconBox(115, 170, 180, clock(0, 0, 78, 4, 55), at(u, .3, .3)) + G("", N("4:55", 115, 300, 38, ORANGE), at(u, .6, .3));
}, { tr: "out" });
// 10 · a whole hour of light wasted while people sleep; thumbnail: a lamp burning in an empty room
shot(10, push(320, 420, 1.04, .98), function (u, d, t) {
  var s = paper() + G("translate(0 -80)", cairo({ sky: .9, dawn: .4, sun: [215, 300], lit: 0, t: t })) + R(-40, 600, 720, 300, PAPER, 0);
  s += dayBar(40, 640, 560, { rise: 4.9, set: 18.98, k: at(u, .2, .8), hi: [4.9, 6], wake: [6.5, 24], lab: true });
  s += label(40 + 560 * 5.4 / 24, 650, 200, 570, "ساعة ضايعة", ORANGE, at(u, 1.1, .5), 22);
  return s + iconBox(510, 130, 200, '<path d="M-90 70 H90" stroke="' + INK + '" stroke-width="2"/><path d="M0 -100 v34" stroke="' + INK + '" stroke-width="2"/><path d="M-22 -40 L-12 -66 h24 l10 26 Z" fill="#8f8576" stroke="' + INK + '" stroke-width="1.8"/>' + C(0, -34, 8, LIT, 1.6) + '<path d="M-20 -36 L-70 70 H70 L20 -36 Z" fill="' + LIT + '" opacity="' + f(.25 + .08 * Math.sin(t * 6)) + '"/>' + R(40, 20, 34, 50, "#a9784d", 1.6) + T("فاضية", 0, 96, 18, MUTE, 700), at(u, d * .55, .3));
});
// 11 · at night: the sun sets at 7 and the city stays up till midnight, windows lit
shot(11, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var half = d * .45, k = at(u, .1, half), n = at(u, half, 1.4);
  return paper() + cairo({ sky: lerp(.75, 0, k), dawn: k * (1 - n), sun: k < 1 ? [140, lerp(380, 600, k)] : null, lit: n * .85, stars: n, moon: n > .3 ? [500, 150] : null, t: t }) +
    iconBox(115, 160, 170, clock(0, 0, 72, lerp(7, 12, n), 0), at(u, .3, .3)) + G("", N(n > .6 ? "12:00" : "7:00", 115, 282, 34, ORANGE), at(u, .6, .3));
});
// 12 · every flat turns on lights, AC and TV; the power stations take the strain (the load meter climbs)
shot(12, function (u, d) { var k = ease((u - d * .5) / 1.2); return [lerp(300, -200, k), lerp(430, 650, k), lerp(1.05, .76, k)]; }, function (u, d, t) {
  var half = d * .5, on = at(u, .2, 2.2), lk = at(u, half, 1.6);
  var s = paper() + flatCut(60, 210, on, t) + label(175, 262, 300, 150, "النور", OLIVE, at(u, .6, .5), 24) + label(390, 236, 480, 150, "التكييف", BLUE, at(u, 1.1, .5), 24) + label(130, 340, 170, 140, "التلفزيون", OLIVE, at(u, 1.6, .5), 24);
  s += G("", plant(-560, 1000, .4 + .6 * lk, t) + pylon(-60, 1000, 300) + '<path d="M-150 742 Q-70 760 -10 742 M-10 742 Q40 700 120 630" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' + gauge(-330, 520, 95, lerp(.4, .92, lk), "الأحمال"), at(u, half - .3, .5));
  return s;
});
// 13 · the fix: move the clock forward one hour (the minute hand runs one full turn, 5 → 6)
shot(13, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.4); return paper() + clock(320, 380, 200, 5 + k, k * 60, { wedge: [5, 5 + k] }) + numBox("+1", 320, 660, at(u, 1.4, .3), 48) + draw("M470 140 A230 230 0 0 1 560 300", at(u, .2, .6), ORANGE, 5) + arrow(552, 284, 562, 306, ORANGE, 5, at(u, .7, .2));
}, { tr: "out" });
// 14 · on the clock the Sun now rises at 6 and sets at 8: the daylight block slides one hour later against the waking hours
shot(14, push(320, 420, 1.02, .98), function (u, d, t) {
  var k = at(u, 1.2, 1.4), sh = k;
  var s = paper() + T("قبل", 600, 196, 26, MUTE, 800, "start") + dayBar(40, 240, 560, { rise: 4.9, set: 18.98, hi: [4.9, 6], wake: [6.5, 24] });
  s += T("بعد", 600, 446, 26, ORANGE, 800, "start") + dayBar(40, 490, 560, { rise: 4.9 + sh, set: 18.98 + sh, wake: [6.5, 24], hi: [18.98, 18.98 + sh], hiCol: DAY });
  s += arrow(40 + 560 * 5.4 / 24, 290, 40 + 560 * 19.5 / 24, 470, ORANGE, 4, at(u, 2.6, .8));
  s += G("", N("6:00", 40 + 560 * 5.9 / 24, 450, 26, INK) + N("8:00", 40 + 560 * 19.98 / 24, 450, 26, ORANGE), at(u, 2.4, .4));
  return s;
});
// 15 · lights go on an hour later, the plants burn less gas — and much of that gas is imported for dollars
shot(15, push(320, 470, .9, .96), function (u, d, t) {
  var k = at(u, .4, 2);
  return paper() + plant(60, 700, lerp(1, .35, k), t) + pylon(560, 700, 300) + gauge(160, 260, 100, lerp(.92, .55, k), "الأحمال") +
    iconBox(470, 200, 210, '<path d="M-90 30 Q0 50 90 30 L76 60 Q0 74 -76 60 Z" fill="#5a6e7a" stroke="' + INK + '" stroke-width="2"/>' + [-50, -6, 38].map(function (x) { return '<ellipse cx="' + x + '" cy="22" rx="22" ry="16" fill="#e8e2d2" stroke="' + INK + '" stroke-width="1.6"/>'; }).join("") + R(54, -10, 22, 30, "#e8e2d2", 1.6) + T("LNG", 0, -40, 22, BLUE, 800) + N("$", 70, -54, 40, OLIVE), at(u, d * .5, .3)) +
    label(345, 400, 260, 470, "غاز أقل", ORANGE, at(u, 1.2, .5), 24);
}, { tr: "out" });
// 16 · «طب ليه نرجّعها في الشتا؟»: the clock goes back one hour
shot(16, push(320, 400, 1.04, 1.0), function (u, d, t) { var k = at(u, .2, 1); return paper() + clock(320, 380, 190, 6 - k, (1 - k) * 60 % 60, { wedge: [6 - k, 6], wcol: BLUE }) + T("؟", 560, 220, 120, BLUE, 800) + numBox("−1", 320, 650, at(u, .6, .3), 44); });
// 17 · winter, if we kept it: the Sun would rise near 8 (7:45 in December)
shot(17, push(320, 430, 1.04, .98), function (u, d, t) {
  var k = at(u, .3, d - .6);
  return paper() + cairo({ sky: lerp(0, .3, k), dawn: k * .5, stars: 1 - k, sun: [480, lerp(640, 515, k)], lit: .6, t: t }) + iconBox(115, 170, 180, clock(0, 0, 78, 7, 45), at(u, .3, .3)) + G("", N("7:45", 115, 300, 38, ORANGE), at(u, .6, .3)) + tag("ديسمبر", 470, 140, at(u, .8, .3), 28, BLUE);
}, { tr: "out" });
// 18 · children walking to school in the dark under a street lamp
shot(18, push(320, 470, 1.08, 1.0), function (u, d, t) {
  var fl = 620, x = 470 - u * 22;
  var s = paper() + '<rect x="-200" y="-200" width="1040" height="' + (fl + 200) + '" fill="' + NIGHT + '"/>';
  for (var i = 0; i < 20; i++) s += '<circle cx="' + f(hash(i) * 640) + '" cy="' + f(60 + hash(i + 9) * 260) + '" r="1.6" fill="#f4ecdb" opacity="' + f(.5 + .5 * Math.sin(t * 2 + i)) + '"/>';
  s += block(-80, fl, 170, 300, .4, 3, WALL2) + block(500, fl, 200, 260, .5, 6, WALL2) + floor(fl);
  s += '<path d="M160 ' + fl + ' V250 q0 -24 30 -24 h50" fill="none" stroke="' + INK + '" stroke-width="8"/><path d="M226 222 h44 l-8 16 h-28 Z" fill="#8f8576" stroke="' + INK + '" stroke-width="2"/><path d="M234 238 L170 ' + fl + ' H330 L262 238 Z" fill="' + LIT + '" opacity=".28"/>';
  s += kid(x, fl, .74, t) + kid(x + 110, fl, .7, t + .4);
  return s + cross(560, 180, 1.1, at(u, d * .55, .5)) + G("", sunIcon(560, 180, 24, t), .6 * at(u, .4, .3));
});
// 19 · the myth: the clock change makes the day an hour longer — crossed out
shot(19, push(320, 420, 1.06, .98), function (u, d, t) {
  var k = at(u, .4, 1.2);
  return paper() + clock(160, 190, 80, 5 + (u * .8) % 12, (u * 48) % 60) + dayBar(40, 340, 560, { rise: 4.9, set: 18.98 + k, hi: [18.98, 18.98 + k], hiCol: ORANGE }) + numBox("+1", 40 + 560 * 19.5 / 24, 250, at(u, 1.2, .3), 34) + cross(320, 360, 2, at(u, d - .8, .5));
});
// 20 · the day stays the same length: the two blocks measure the same, only shifted by one hour
shot(20, push(320, 420, .98, 1.05), function (u, d, t) {
  var a = 40 + 560 * 4.9 / 24, b = 40 + 560 * 18.98 / 24, sh = 560 / 24;
  return paper() + dayBar(40, 240, 560, { rise: 4.9, set: 18.98 }) + dayBar(40, 470, 560, { rise: 5.9, set: 19.98, k: at(u, .3, .6) }) +
    measure(a, 330, b, 330, at(u, .3, .6), "") + measure(a + sh, 560, b + sh, 560, at(u, .8, .6), "") + G("", N("14", 320, 395, 36, INK) + N("14", 320 + sh, 625, 36, INK), at(u, 1.2, .3)) + check(560, 150, 1.2, at(u, 1.5, .4), OLIVE);
});
// 21 · «يعني من الآخر»: light starts early → we get up with it → less power at night
shot(21, push(320, 420, .96, 1.02), function (u, d, t) {
  var c = window.CHUNKS[21], D = LN[21].end - LN[21].start, k1 = at(u, D * (c[1] || .33), .4), k2 = at(u, D * (c[2] || .66), .4);
  var s = paper() + G("", sunIcon(120, 300, 46, t) + T("النور بدري", 120, 420, 26, ORANGE, 800), at(u, .2, .3));
  s += arrow(200, 300, 250, 300, INK, 4, k1) + G("translate(320 300)", clock(0, 0, 70, 6, 0) + T("بنصحى بدري", 0, 120, 26, OLIVE, 800), k1);
  s += arrow(400, 300, 450, 300, INK, 4, k2) + G("", C(530, 290, 36, "#e9e4d8", 2.4) + R(514, 322, 32, 22, "#8f8576", 2) + gauge(530, 520, 70, .5) + T("كهربا أقل", 530, 420, 26, BLUE, 800), k2) + cross(530, 290, .8, at(u, D * (c[2] || .66) + .5, .4));
  return s;
}, { tr: "out" });
// 22 · the odd fact: the idea came from an insect collector in New Zealand, 1895 (George Vernon Hudson, Wellington)
shot(22, push(320, 400, .98, 1.04), function (u, d, t) {
  var lon = lerp(31, 174, at(u, .2, 1.8));
  return paper() + globe(300, 380, 210, lon, -20, { dot: [174.8, -41.3] }) + label(300 + 0, 380 + 60, 470, 560, "نيوزيلندا", OLIVE, at(u, 1.8, .5), 26) + bigNum(String(Math.round(1895 * ease(at(u, d * .55, 1.2)))), "", 320, 700, at(u, d * .55, .3), ORANGE, 70);
});
// 23 · he wanted two more hours of light after work to hunt insects: a man with a net at dusk, moths round him
shot(23, push(320, 470, 1.06, 1.0), function (u, d, t) {
  var fl = 640, sw = Math.sin(t * 2.4) * 10, s = paper() + '<rect x="-200" y="-200" width="1040" height="' + (fl + 200) + '" fill="' + mix(DAWN, SKYD, .5) + '"/>' + sun(560, fl - 30, 60, t);
  for (var i = 0; i < 6; i++) { var a = t * 1.5 + i, mx = 220 + 110 * Math.cos(a * (.7 + i * .1)), my = 300 + 70 * Math.sin(a * 1.3); s += G("translate(" + f(mx) + " " + f(my) + ")", '<path d="M0 0 C-10 -12 -22 -6 -16 6 Z M0 0 C10 -12 22 -6 16 6 Z" fill="#b39a74" stroke="' + INK + '" stroke-width="1.4" transform="scale(1 ' + f(.4 + .6 * Math.abs(Math.sin(t * 9 + i))) + ')"/>'); }
  var m = fig({ x: 380, y: fl - 212, s: 1, lean: -4, shirt: "#b9a98a", hair: "#5a4636", hands: [rel(95 + sw * .4, 66), rel(78 + sw * .4, 58)], bend: [1, 1], legs: [[16, -6], [-12, 4]] });
  var hnd = m.at(95 + sw * .4, 66);
  s += floor(fl) + m.far + m.body + '<path d="M' + f(hnd[0]) + ' ' + f(hnd[1]) + ' L' + f(hnd[0] - 100) + ' ' + f(hnd[1] - 110) + '" stroke="' + WOOD_D + '" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="' + f(hnd[0] - 124) + '" cy="' + f(hnd[1] - 134) + '" rx="46" ry="30" fill="none" stroke="' + INK + '" stroke-width="3" transform="rotate(-40 ' + f(hnd[0] - 124) + ' ' + f(hnd[1] - 134) + ')"/><path d="M' + f(hnd[0] - 158) + ' ' + f(hnd[1] - 114) + ' Q' + f(hnd[0] - 164) + ' ' + f(hnd[1] - 44) + ' ' + f(hnd[0] - 104) + ' ' + f(hnd[1] - 94) + '" fill="#f4efe3" stroke="' + INK + '" stroke-width="1.6" opacity=".85"/>' + m.near;
  return s + numBox("+2", 540, 150, at(u, .5, .3), 40) + G("", T("ساعة نور", 540, 210, 22, INK, 800), at(u, .7, .3)) + label(m.hd[0] + 10, m.hd[1] - 20, 470, 260, "عالم حشرات", OLIVE, at(u, 1.2, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a bedroom at 5 a.m., the sun already up behind the window, someone asleep. line 1: the city still asleep.
  // line 2: the calendar «آخر جمعة · أبريل» and the clock's hands jump one hour forward
  var fl = 600, s = room(fl);
  s += windowSky(330, 150, 200, 190, mix(DAWN, SKYD, .5), [470, 240], t);
  s += '<path d="M330 340 L170 ' + fl + ' H420 L530 340 Z" fill="' + LIT + '" opacity=".25"/>';
  s += bed(70, fl, .95, t, false);
  var k2 = li >= 2 ? ease((t - LN[2].start - 1.2) / 1.2) : 0;
  s += clock(140, 170, 70, 5 + k2, k2 * 60, k2 > 0 ? { wedge: [5, 5 + k2] } : null);
  if (li >= 1) { var u = t - LN[1].start; s += G("", tag("لسه نايمة", 300, 70, 1, 26, MUTE), ease(u / .4)); }
  if (li >= 2) { var v = t - LN[2].start; s += iconBox(530, 470, 130, R(-50, -40, 100, 90, "#f4efe3", 2) + R(-50, -40, 100, 24, ORANGE, 2) + T("أبريل", 0, -22, 16, "#fff", 800) + T("آخر جمعة", 0, 24, 18, INK, 800), ease(v / .4)) + numBox("+1", 140, 290, ease((v - 1.6) / .4), 32); }
  return s;
};
SCENE.bumper = function (u, t) {
  return sunIcon(130, 50, 18, t) + clock(90, 110, 62, 5 + (t * .4) % 1, ((t * .4) % 1) * 60);
};
SCENE.outro = function (svg, u, t) {
  return dayBar(30, 60, 500, { rise: 4.9, set: 18.98, hi: [4.9, 6], lab: false, h: 30 }) + dayBar(30, 170, 500, { rise: 5.9, set: 19.98, hi: [18.98, 19.98], hiCol: DAY, lab: false, h: 30 }) +
    T("قبل", 540, 88, 20, MUTE, 800, "end") + T("بعد", 540, 198, 20, ORANGE, 800, "end") +
    callout("1", 30 + 500 * 4.9 / 24, 120, ease(u / .3)) + callout("2", 30 + 500 * 6.5 / 24, 240, ease(u / .3 - .5)) + callout("3", 30 + 500 * 19.4 / 24, 240, ease(u / .3 - 1)) + callout("4", 470, 120, ease(u / .3 - 1.5));
};
