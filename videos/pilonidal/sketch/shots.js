// ── «الناصور العصعصي» — drawings. People: real body proportions, copied from videos/choking/sketch/shots.js (Drillis & Contini).
// Anatomy from real references (refs/SOURCES.md): a transverse cut through the buttocks at the sacrococcygeal level, back up
// (patient lying face down): skin, subcutaneous fat, gluteus maximus on both sides, the sacrum below; the natal cleft in the
// midline with its pit, the tract running into a pocket in the fat (never into bone or bowel).

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
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, o.pants || PANTS, o.pants || PANTS) + (o.nude ? '' : shoe);
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
  if (!o.nude) tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
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
// a beat 0..1 repeating n times over dur seconds starting at u0: 0 rest, peaks at mid-beat
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }
function chips(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 44) + '" cy="' + y + '" r="17" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 44, y + 7, 18, c ? "#fff" : INK); } return s; }

// ── materials ──
var SKC = "#d98f7c", DERM = "#e4a891", FATC = "#e8ddb0", MUSC = "#b86a5c", GRAN = "#e2a493", PUS = "#d9c46a", WOUND = "#9c4a40", REDH = "#cf5a3c", GAUZE = "#f6f1e4";
var H_COL = "#3e3128";
function fatDefs() {
  return '<defs><pattern id="fatp" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="9" cy="8" r="7.5" fill="#f4edd0" stroke="#c9bb88" stroke-width="1.1"/><circle cx="26" cy="23" r="7.5" fill="#f4edd0" stroke="#c9bb88" stroke-width="1.1"/></pattern>' +
    '<pattern id="musp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 6 H12" stroke="#93483d" stroke-width="1.4"/></pattern></defs>';
}
// a hair: a thin dark curve from (x,y) at angle a (deg, 0 = right), length L, bend b
function hair(x, y, a, L, b, w, col) {
  a = a * Math.PI / 180; var ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, mx = (x + ex) / 2 - Math.sin(a) * (b || 0), my = (y + ey) / 2 + Math.cos(a) * (b || 0);
  return '<path d="M' + f(x) + ' ' + f(y) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + (col || H_COL) + '" stroke-width="' + (w || 2.4) + '" fill="none" stroke-linecap="round"/>';
}

// ── the transverse cut (back up). o: {cx, depth, w, bump: [x, h, r], pocket 0..1, pus 0..1, inflame 0..1, hairs: n inside,
//    tract 0..1, surf: [[x, a]] hairs lying on the skin, excise 0..1 (outline), lift 0..1 (block lifted out), open 0..1 (wound
//    left open), gauze 0..1, heal 0..1, scar: x (stitched line), hl: "fat" | "bone" | "pocket"} ──
var CUT_TOP = 236, SKT = 24;
function surfY(x, o) {
  var cx = o.cx == null ? 320 : o.cx, dx = Math.abs(x - cx), d = o.depth == null ? 120 : o.depth, w = o.w || 78;
  var y = CUT_TOP + 0.0016 * (Math.abs(x - 320) - 170) * (Math.abs(x - 320) - 170) + d * Math.pow(Math.max(0, 1 - dx / w), 1.7);
  if (o.bump) y -= o.bump[1] * Math.exp(-Math.pow((x - o.bump[0]) / o.bump[2], 2));
  return y;
}
function cleftBottom(o) { var cx = o.cx == null ? 320 : o.cx; return [cx, surfY(cx, o)]; }
function pocketAt(o) { var b = cleftBottom(o); return [b[0] + 26, b[1] + 92]; }
function cut(t, o) {
  o = o || {}; var s = fatDefs(), x, top = [], bot = [];
  for (x = -260; x <= 900; x += 6) { var y = surfY(x, o); top.push([x, y]); bot.push([x, y + SKT]); }
  var tp = top.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" ");
  var bp = bot.slice().reverse().map(function (p) { return "L" + f(p[0]) + " " + f(p[1]); }).join(" ");
  // fat under the skin, all the way down
  var fatD = tp + " L900 1100 L-260 1100 Z";
  s += P(fatD, FATC, 2.4) + '<path d="' + fatD + '" fill="url(#fatp)" opacity="' + (o.hl === "fat" ? 1 : .85) + '"/>';
  if (o.hl === "fat") s += '<path d="' + fatD + '" fill="' + ORANGE + '" opacity=".08"/>';
  // gluteus maximus on both sides, from the edges of the sacrum out and up under the fat
  var cx0 = 320;
  [1, -1].forEach(function (sd) {
    var X = function (v) { return f(cx0 + sd * v); };
    var d = "M" + X(120) + " 640 C" + X(150) + " 560 " + X(250) + " 470 " + X(420) + " 440 L" + X(620) + " 430 L" + X(620) + " 1100 L" + X(150) + " 1100 C" + X(120) + " 900 " + X(110) + " 760 " + X(120) + " 640 Z";
    s += P(d, MUSC, 2.2) + '<path d="' + d + '" fill="url(#musp)" opacity=".55"/>';
  });
  // the sacrum (cut across): a wide bean with the median crest toward the skin; the sacral canal inside
  var bh = o.hl === "bone";
  s += P("M190 680 C200 630 270 610 300 606 L320 586 L340 606 C370 610 440 630 450 680 C452 728 380 748 320 748 C260 748 188 728 190 680 Z", bh ? "#efe2b8" : BONE, 2.6);
  s += '<path d="M200 680 C210 640 280 624 320 620 C360 624 430 640 440 680" fill="none" stroke="#cdbf9e" stroke-width="1.4"/>';
  for (var i = 0; i < 18; i++) s += '<circle cx="' + f(214 + hash(i) * 212) + '" cy="' + f(650 + hash(i + 40) * 80) + '" r="' + f(2 + hash(i + 9) * 3) + '" fill="none" stroke="#c4b48f" stroke-width="1.1"/>';
  s += '<path d="M300 652 Q320 640 340 652 Q346 672 320 678 Q294 672 300 652 Z" fill="#f2e9d5" stroke="' + INK + '" stroke-width="1.8"/>';
  // skin: epidermis line over the dermis
  s += P(tp + " " + bp + " Z", SKC, 2.4);
  var mid = top.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1] + 7); }).join(" ");
  s += '<path d="' + mid + '" fill="none" stroke="#b9705e" stroke-width="1.3"/>';
  // body hair on the skin (short strokes leaning one way)
  for (x = -240; x <= 880; x += 22) { var yy = surfY(x, o), dd = Math.abs(x - (o.cx == null ? 320 : o.cx)); if (dd < 40) continue; s += hair(x, yy, -120 + (x < 320 ? 0 : 60), 9 + 6 * hash(x), 1, 1.3, "#6a5444"); }
  // the pit, the tract and the pocket
  var b = cleftBottom(o), pc = pocketAt(o), pk = clamp(o.pocket || 0), tr = clamp(o.tract == null ? (pk > 0 ? 1 : 0) : o.tract);
  if (o.inflame) s += '<ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="' + f(90 + 8 * Math.sin(t * 4)) + '" ry="' + f(66 + 6 * Math.sin(t * 4)) + '" fill="' + REDH + '" opacity="' + f(.22 * o.inflame) + '"/><ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="62" ry="44" fill="' + REDH + '" opacity="' + f(.2 * o.inflame) + '"/>';
  if (tr > 0) { var tx = lerp(b[0], pc[0] - 10, tr), ty = lerp(b[1] + 4, pc[1] - 16, tr);
    s += '<path d="M' + f(b[0]) + ' ' + f(b[1] + 2) + ' Q' + f(b[0] + 2) + ' ' + f((b[1] + ty) / 2 + 6) + ' ' + f(tx) + ' ' + f(ty) + '" stroke="' + INK + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M' + f(b[0]) + ' ' + f(b[1] + 2) + ' Q' + f(b[0] + 2) + ' ' + f((b[1] + ty) / 2 + 6) + ' ' + f(tx) + ' ' + f(ty) + '" stroke="' + GRAN + '" stroke-width="8.5" fill="none" stroke-linecap="round"/>'; }
  if (pk > 0) {
    var rx = 58 * pk, ry = 36 * pk, col = o.pus ? mixC(GRAN, PUS, o.pus) : GRAN;
    s += '<ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + col + '" stroke="' + (o.hl === "pocket" ? ORANGE : INK) + '" stroke-width="' + (o.hl === "pocket" ? 3.4 : 2.4) + '"/>';
    if (o.pus) for (i = 0; i < 6; i++) s += '<circle cx="' + f(pc[0] - rx * .6 + hash(i + 3) * rx * 1.2) + '" cy="' + f(pc[1] - ry * .4 + hash(i + 7) * ry * .8 + 2 * Math.sin(t * 2 + i)) + '" r="' + f(3 + 3 * hash(i)) + '" fill="#efe0a0" opacity="' + f(o.pus) + '"/>';
  }
  var nh = Math.floor(o.hairs || 0);
  for (i = 0; i < nh; i++) s += hair(pc[0] - 40 * pk + hash(i + 21) * 70 * pk, pc[1] - 16 * pk + hash(i + 5) * 26 * pk, -30 + hash(i + 2) * 70, 30 + hash(i + 11) * 22, 6 - 12 * hash(i), 2.6);
  // excision: a dashed ellipse round pit and pocket; the block lifts out, the wound stays
  var ex = [b[0] + 14, b[1] + 46, 76, 108];
  if (o.excise || o.lift || o.open) {
    var el = '<ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"';
    if (o.lift || o.open) {
      var inner = s, id = "ex" + (++CLIPN), fill = o.gauze ? GAUZE : WOUND;
      var hole = el + ' fill="' + WOUND + '" stroke="' + INK + '" stroke-width="2.4"/>';
      // the open wound fills up from the bottom as it heals
      if (o.heal) hole += '<clipPath id="' + id + 'h"><ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"/></clipPath><g clip-path="url(#' + id + 'h)"><rect x="' + f(ex[0] - 90) + '" y="' + f(ex[1] + ex[3] - 2 * ex[3] * o.heal) + '" width="180" height="300" fill="' + GRAN + '" stroke="' + INK + '" stroke-width="2"/></g>';
      if (o.gauze) hole += G("", el + ' fill="' + GAUZE + '" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M' + f(ex[0] - 60) + ' ' + f(ex[1] - 60) + ' l120 120 M' + f(ex[0] + 60) + ' ' + f(ex[1] - 60) + ' l-120 120 M' + f(ex[0] - 70) + ' ' + f(ex[1]) + ' h140 M' + f(ex[0]) + ' ' + f(ex[1] - 100) + ' v200" stroke="#cfc6b0" stroke-width="1.6"/>', o.gauze * (1 - (o.heal || 0) * .9));
      s += '<clipPath id="' + id + 't"><path d="' + fatD + '"/></clipPath><g clip-path="url(#' + id + 't)">' + hole + '</g>';
      if (o.lift) s += '<clipPath id="' + id + '"><ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"/></clipPath>' + G("translate(" + f(o.lift * 150) + " " + f(-o.lift * 330) + ") rotate(" + f(o.lift * 14) + " " + f(ex[0]) + " " + f(ex[1]) + ")", '<g clip-path="url(#' + id + ')">' + inner + '</g>' + el + ' fill="none" stroke="' + INK + '" stroke-width="2.4"/>', 1);
    } else s += el + ' fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(clamp(o.excise)) + '"/>';
  }
  if (o.scar != null) for (i = -2; i <= 2; i++) { var sx = o.scar + i * 4, sy = surfY(o.scar + i * 14, o); s += '<path d="M' + f(o.scar + i * 14 - 7) + ' ' + f(sy - 8) + ' L' + f(o.scar + i * 14 + 7) + ' ' + f(sy + 8) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>'; }
  if (o.surf) o.surf.forEach(function (h) { s += hair(h[0], surfY(h[0], o) - 3, h[1], h[2] || 46, h[3] || 4, 2.6); });
  return s;
}
function mixC(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, r = []; for (var i = 0; i < 3; i++) r.push(Math.round(lerp(p(a, i), p(b, i), k))); return "rgb(" + r.join(",") + ")"; }

// ── the body from the side with its bones (real proportions: fig() in the figure's own frame, h above the hip joint, side
//    + to the front). Sacrum from the promontory (h 40) curving back and down; coccyx tip about level with the hip joint; the
//    rectum in front of the sacrum down to the anus; the cleft starts on the skin over the end of the sacrum (h ≈ 18). ──
var ANAT = { x: 330, y: 520, s: 1.7 };
function anatFig() { return fig({ x: ANAT.x, y: ANAT.y, s: ANAT.s, lean: 0, shirt: SKIN, pants: SKIN, nude: 1, hair: HAIR, legs: [[4, -2], [-4, 2]], hands: [rel(-30, 10), rel(-30, 6)] }); }
function anat(t, o) {
  o = o || {}; var g = anatFig(), A = function (h, sd) { return g.at(h, sd); }, pt = function (q) { return f(q[0]) + " " + f(q[1]); };
  var poly = function (pts) { return "M" + pts.map(function (q) { return pt(A(q[0], q[1])); }).join(" L") + " Z"; };
  var smooth = function (pts) { var d = "M" + pt(A(pts[0][0], pts[0][1])); for (var i = 1; i < pts.length; i++) d += " L" + pt(A(pts[i][0], pts[i][1])); return d; };
  var s = g.far + g.body, k = o.bones == null ? 1 : o.bones, sk = "";
  // hip bone (faint): the iliac wing from the crest down to the hip socket
  sk += '<path d="' + poly([[74, -14], [80, 2], [72, 16], [40, 18], [8, 10], [-6, 2], [-10, -8], [10, -14], [36, -18]]) + '" fill="' + BONE + '" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>';
  var fh = A(0, 0); sk += C(fh[0], fh[1], 8 * ANAT.s, BONE, 1.8);
  var kn = A(-98, 4); sk += '<path d="M' + pt(fh) + ' L' + pt(kn) + '" stroke="' + INK + '" stroke-width="' + f(13 * ANAT.s) + '" stroke-linecap="round" opacity=".5"/><path d="M' + pt(fh) + ' L' + pt(kn) + '" stroke="' + BONE + '" stroke-width="' + f(10 * ANAT.s) + '" stroke-linecap="round" opacity=".6"/>';
  // the rectum, in front of the sacrum, down to the anus
  var rc = smooth([[44, 6], [30, 4], [16, -2], [4, -6], [-8, -8], [-16, -12]]);
  sk += '<path d="' + rc + '" stroke="' + INK + '" stroke-width="' + f(11 * ANAT.s) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + rc + '" stroke="' + (o.hl === "bowel" ? "#d9a06a" : "#c98a72") + '" stroke-width="' + f(8 * ANAT.s) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  // lumbar vertebrae (lordosis) with their spines to the back
  [86, 76, 66, 56, 46].forEach(function (h) { var sd = -4 + 3 * Math.sin((h - 40) / 50 * Math.PI), c = A(h, sd);
    sk += G("translate(" + pt(c) + ") scale(" + f(ANAT.s * .62) + ")", R(-9, -6, 18, 12, BONE, 1.2, 2) + R(9, -2.5, 7, 5, BONE, 1, 1.5) + R(-8, 6, 16, 3, "#d7a48a", .8, 1)); });
  // sacrum and coccyx
  var bc = o.hl === "bone" ? "#f0dc9c" : BONE;
  sk += '<path d="' + poly([[44, 0], [44, -12], [34, -19], [20, -22], [8, -21], [-2, -17], [2, -12], [12, -12], [24, -8], [36, -4]]) + '" fill="' + bc + '" stroke="' + INK + '" stroke-width="2"/>';
  [[-3, -16], [-8, -14], [-12, -11]].forEach(function (q, i) { var c = A(q[0], q[1]); sk += C(c[0], c[1], (3.4 - i * .5) * ANAT.s, bc, 1.6); });
  s += G("", sk, .35 + .65 * k);
  return s;
}
function spot() { return anatFig().at(18, -29); }
function coccyxTip() { return anatFig().at(-12, -11); }
function anus() { return anatFig().at(-16, -12); }

// ── icons ──
function wheat(x, y, sc, rot) {
  var s = '<path d="M0 0 L0 200" stroke="#b49a52" stroke-width="5" stroke-linecap="round"/>';
  for (var i = 0; i < 7; i++) { var yy = -6 + i * 20; [1, -1].forEach(function (sd) {
    s += '<ellipse cx="' + (sd * 10) + '" cy="' + yy + '" rx="9" ry="15" transform="rotate(' + (sd * 22) + ' ' + (sd * 10) + ' ' + yy + ')" fill="#d9b765" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M' + (sd * 14) + ' ' + (yy + 10) + ' L' + (sd * 30) + ' ' + (yy + 62) + '" stroke="#8a7438" stroke-width="1.6"/>'; }); }
  s += '<ellipse cx="0" cy="-26" rx="8" ry="14" fill="#d9b765" stroke="' + INK + '" stroke-width="1.6"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + (sc || 1) + ")", s);
}
function scalpel(x, y, rot, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ") scale(" + (sc || 1) + ")", '<path d="M0 0 C10 -20 30 -34 40 -40 L50 -30 C40 -14 22 -4 0 0 Z" fill="#dfe3e4" stroke="' + INK + '" stroke-width="2"/>' + R(44, -48, 120, 16, "#9aa4a8", 2, 4) + '<path d="M60 -40 h90" stroke="#c4cbce" stroke-width="2"/>'); }
function tweezers(x, y, rot, op) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", '<path d="M0 0 L-6 -150 L4 -152 L6 -4 Z M8 0 L22 -150 L32 -148 L14 -2 Z" fill="#c4cbce" stroke="' + INK + '" stroke-width="2"/>'); }
function clock(x, y, r, hrs) {
  var s = C(x, y, r, "#f4ecdb", 3);
  for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.sin(a) * (r - 4)) + ' ' + f(y - Math.cos(a) * (r - 4)) + ' L' + f(x + Math.sin(a) * (r - 11)) + ' ' + f(y - Math.cos(a) * (r - 11)) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3) + '"/>'; }
  var am = hrs * Math.PI * 2, ah = hrs / 12 * Math.PI * 2;
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(am) * r * .75) + ' ' + f(y - Math.cos(am) * r * .75) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(ah) * r * .5) + ' ' + f(y - Math.cos(ah) * r * .5) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
function chair(x, y, s) { s = s || 1; return R(x - 54 * s, y, 108 * s, 14 * s, WOOD, 2.2) + R(x + 40 * s, y - 120 * s, 14 * s, 134 * s, WOOD_D, 2) + R(x - 50 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2) + R(x + 40 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2); }
// a seated or standing figure; k 0 = seated, 1 = standing (floor y)
function sitter(x, floorY, k, o) {
  o = o || {}; k = clamp(k);
  var hipY = lerp(floorY - 120, floorY - 212, k), legs = [[lerp(82, 8, k), lerp(-82, -4, k)], [lerp(78, -8, k), lerp(-78, 4, k)]];
  return fig({ x: x - 10 * k, y: hipY, lean: lerp(o.lean == null ? 4 : o.lean, 2, k), shirt: o.shirt || SHIRT_V, hair: o.hair, belly: o.belly, hands: o.hands || [null, null], bend: o.bend || [-1, -1], legs: legs });
}
function jeep(x, y, t) {
  var b = 3 * Math.abs(Math.sin(t * 7)), s = "", JC = "#6b7046";
  s += G("translate(0 " + f(-b) + ")", P("M" + (x - 210) + " " + (y - 60) + " L" + (x - 210) + " " + (y - 110) + " L" + (x - 70) + " " + (y - 116) + " L" + (x - 40) + " " + (y - 150) + " L" + (x + 160) + " " + (y - 150) + " L" + (x + 190) + " " + (y - 110) + " L" + (x + 190) + " " + (y - 60) + " Z", JC, 2.6) +
    '<path d="M' + (x - 60) + ' ' + (y - 116) + ' L' + (x - 90) + ' ' + (y - 210) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + (x - 60) + ' ' + (y - 116) + ' L' + (x - 90) + ' ' + (y - 210) + '" stroke="#8a9a9e" stroke-width="3"/>' +
    R(x - 200, y - 104, 26, 30, "#52563a", 1.6, 4) + '<circle cx="' + (x - 186) + '" cy="' + (y - 98) + '" r="9" fill="#f1e2a4" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + (x - 150) + ' ' + (y - 140) + ' l30 0" stroke="' + INK + '" stroke-width="1.4"/>' + T("★", x + 60, y - 92, 40, "#f4ecdb", 800));
  [x - 140, x + 120].forEach(function (wx) { s += C(wx, y - 36, 40, "#3a342c", 2.6) + C(wx, y - 36, 18, "#8f8576", 2) + '<path d="M' + wx + ' ' + (y - 36) + ' l' + f(14 * Math.cos(t * 9)) + ' ' + f(14 * Math.sin(t * 9)) + '" stroke="' + INK + '" stroke-width="3"/>'; });
  return s;
}
function nest(x, y, sc) { var s = ""; for (var i = 0; i < 16; i++) { var a = i * 23; s += hair(x - 34 + hash(i) * 20, y - 6 + hash(i + 3) * 18, a, 50, 10, 2.2, "#5a4636"); } return G("", s); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «الناصور العصعصي»: the whole body from the side, then into the lower back: bones, the spot over the end of the spine; «عش الشعر»
shot(4, function (u, d) { var k = ease(u / d); return [lerp(330, 345, k), lerp(400, 500, k), lerp(.82, 1.75, k)]; }, function (u, d, t) {
  var sp = spot(), cc = coccyxTip();
  return paper() + floor(ANAT.y + 212 * ANAT.s) + anat(t, { hl: at(u, 1.4, .4) > 0 ? "bone" : "", bones: at(u, .3, .8) }) + label(cc[0], cc[1], 300, 640, "العصعص", OLIVE, at(u, 1.4, .5), 22) +
    '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(9 + 3 * Math.sin(t * 5)) + '" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 4, ORANGE, 1.4) +
    label(sp[0], sp[1], 430, 330, "الناصور", ORANGE, at(u, 1.9, .5), 22) +
    iconBox(230, 390, 100, G("scale(.75)", nest(0, -8)) + T("عش الشعر", 0, 44, 15, ORANGE, 800), at(u, d - 1.6, .4));
});
// 5 · cut hair falls from the head and back and gathers in the cleft (transverse cut, back up)
shot(5, push(320, 360, 1.0, 1.12), function (u, d, t) {
  var o = { depth: 120 }, b = cleftBottom(o), s = paper() + cut(t, o), fl = "";
  for (var i = 0; i < 14; i++) {
    var st = .6 + i * .32, k = clamp((u - st) / 2.4), tx = lerp(-60 + hash(i) * 760, b[0] - 22 + hash(i + 8) * 44, ease(k)), ty = lerp(-120 - hash(i + 2) * 200, b[1] - 6 - hash(i + 4) * 22, ease(k) * ease(k));
    if (u > st) fl += hair(tx, ty, (1 - k) * (t * 120 + i * 40) + k * (hash(i) * 40 - 20), 44, 5, 3);
  }
  return s + fl + label(b[0] + 8, b[1] - 40, 440, 170, "الشق", OLIVE, at(u, d - 2.2, .5), 26) + G("", T("شعر مقصوص", 140, 120, 24, ORANGE, 800), at(u, .4, .3));
});
// 6 · a hair magnified: overlapping scales, all pointing to the tip; it slides only toward the root
shot(6, push(320, 400, 1.0, 1.1), function (u, d, t) {
  var s = paper(), off = -((t * 26) % 38), y = 400;
  var sh = P("M40 " + (y - 34) + " L640 " + (y - 30) + " L640 " + (y + 30) + " L40 " + (y + 34) + " Z", "#7a5a40", 2.6);
  var sc = ""; for (var x = 60 + off; x < 660; x += 38) sc += '<path d="M' + f(x) + ' ' + (y - 33) + ' Q' + f(x + 22) + ' ' + y + ' ' + f(x) + ' ' + (y + 33) + '" stroke="' + INK + '" stroke-width="2.2" fill="#8e6a4c"/>';
  s += G("", '<clipPath id="hc"><path d="M40 ' + (y - 34) + ' L640 ' + (y - 30) + ' L640 ' + (y + 30) + ' L40 ' + (y + 34) + ' Z"/></clipPath>') + sh + '<g clip-path="url(#hc)">' + sc + '</g>';
  // the root bulb at the left
  s += '<ellipse cx="34" cy="' + y + '" rx="36" ry="46" fill="#6b4a32" stroke="' + INK + '" stroke-width="2.6"/>';
  s += label(250, y - 20, 330, 230, "قشور", OLIVE, at(u, .5, .5), 28);
  s += arrow(500, 560, 200, 560, ORANGE, 7, at(u, 1.6, .6)) + G("", T("تدخل", 350, 610, 26, ORANGE, 800), at(u, 1.9, .3));
  s += arrow(200, 250, 470, 250, INK, 5, at(u, 2.4, .5)) + cross(335, 250, .8, at(u, 2.8, .4));
  s += iconBox(540, 120, 130, G("translate(-50 -10)", hair(0, 0, 0, 100, 0, 3)) + C(-50, -10, 6, H_COL, 1) + T("شعرة", 0, 44, 18, INK, 700), at(u, .2, .3));
  return s;
}, { tr: "in" });
// 7 · sitting and moving: the buttocks press together, the hair is pushed into the skin step by step and can't come back
shot(7, push(320, 400, 1.15, 1.28), function (u, d, t) {
  var sq = .5 + .5 * Math.sin(t * 4.2), st = clamp((u - .8) / (d - 1.6)), stepK = Math.floor(st * 5) / 5 + ease((st * 5) % 1) / 5;
  var o = { depth: 120, w: 78 - 22 * sq, tract: 1 }, b = cleftBottom(o), pc = pocketAt(o);
  var hx = lerp(b[0], pc[0] - 4, stepK), hy = lerp(b[1] - 30, pc[1] - 4, stepK);
  return paper() + cut(t, o) + hair(hx, hy, -60, 48, 3, 3) + arrow(80, 300, 80 + 70 * sq + 40, 300, ORANGE, 6, at(u, .3, .3)) + arrow(560, 300, 560 - 70 * sq - 40, 300, ORANGE, 6, at(u, .3, .3)) +
    G("", T("حك", 320, 150, 30, ORANGE, 800), at(u, .5, .3)) + G("", arrow(hx + 40, hy + 30, hx + 40, hy - 40, INK, 4, 1) + cross(hx + 40, hy - 6, .6, 1), at(u, d - 1.4, .4));
});
// 8 · like an ear of wheat up a sleeve: every move takes it higher
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var sw = Math.sin(t * 5), climb = Math.floor(u * 1.25) * 34 + 34 * ease((u * 1.25) % 1), s = paper();
  s += G("rotate(" + f(sw * 4) + " 320 60)", R(220, 60, 200, 700, "#8fa5b1", 2.6, 20) + R(244, 60, 152, 700, "#b9c9cf", 1.6, 14) + '<path d="M230 300 h180 M230 520 h180" stroke="#7c919c" stroke-width="2" stroke-dasharray="8 8"/>' +
    wheat(320, 620 - climb, .9, 180) + arrow(420 + 40, 600 - climb, 460, 470 - climb, ORANGE, 6, at(u, .8, .4)));
  s += inset(520, 170, 85, G("scale(.36) translate(-346 -470)", cut(t, { depth: 120, pocket: .6, hairs: 3 })), at(u, .3, .3)) + label(300, 560 - climb, 190, 700, "سنبلة القمح", OLIVE, at(u, .6, .5), 24);
  return s;
});
// 9 · the body treats the hair as foreign: inflammation, and a pocket forms under the skin
shot(9, push(330, 430, 1.25, 1.4), function (u, d, t) {
  var k = at(u, 2.0, 2.0), o = { depth: 120, pocket: .25 + .75 * k, hairs: 1, inflame: at(u, .9, .8) }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] - 8, pc[1] + 4, 230, 330, "جسم غريب", ORANGE, at(u, .6, .5), 24) + label(pc[0] + 40, pc[1] + 10, 450, 350, "جيب", OLIVE, at(u, 2.6, .5), 28);
}, { tr: "in" });
// 10 · more hair gathers, pus fills it, the skin swells: the abscess
shot(10, push(330, 400, 1.3, 1.18), function (u, d, t) {
  var k = at(u, .4, d * .6), o = { depth: 120, pocket: 1 + .15 * k, hairs: 1 + 7 * k, pus: at(u, 1.6, 1.2), inflame: 1, bump: [346, 34 * at(u, 2.0, 1.2) * (1 + .04 * Math.sin(t * 6)), 60] }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] + 30, pc[1] + 20, 450, 350, "خراج", ORANGE, at(u, d - 1.6, .5), 32) + G("", T("صديد", 210, 370, 26, "#a08a2a", 800), at(u, 1.8, .3));
}, { tr: "out" });
// 11 · who: men about three times women, mostly 15 to 30
shot(11, push(320, 560, 1.22, 1.3), function (u, d, t) {
  var a = fig({ x: 220, y: 600, s: .95, lean: 2 + Math.sin(t * 2), shirt: SHIRT_V }), b = fig({ x: 440, y: 612, s: .89, lean: 2, shirt: "#a38aa0", hair: "#5a4636" });
  var tl = 'M' + f(b.hd[0] + 14) + ' ' + f(b.hd[1] - 6) + ' C' + f(b.hd[0] + 46) + ' ' + f(b.hd[1] + 10) + ' ' + f(b.hd[0] + 40) + ' ' + f(b.hd[1] + 60) + ' ' + f(b.hd[0] + 26) + ' ' + f(b.hd[1] + 80);
  var tail = '<path d="' + tl + '" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="' + tl + '" stroke="#5a4636" stroke-width="11" fill="none" stroke-linecap="round"/>';
  var D = LN[11].end - LN[11].start, c = window.CHUNKS[11], kAge = at(u, D * (c[c.length - 1] || .6), .6);
  return paper() + floor(612 + 212 * .89) + whole(a) + G("", tail + whole(b), 1 - .45 * at(u, 1.6, .4)) + numBox("×3", 120, 430, at(u, 1.8, .3), 40, true) +
    measure(200, 330, 440, 330, kAge, "") + G("", N("15", 200, 310, 28, ORANGE) + N("30", 440, 310, 28, ORANGE) + T("سنة", 320, 312, 22, INK, 700), kAge);
});
// 12 · hairy, heavy, sitting for hours (desk work)
shot(12, push(320, 430, 1.02, 1.1), function (u, d, t) {
  var p = sitter(300, 700, 0, { belly: true, hands: [[176, 494], [186, 498]], bend: [1, 1], lean: 8 }), s = paper() + floor(700);
  s += R(40, 480, 200, 14, WOOD, 2.2) + R(54, 494, 12, 206, WOOD_D, 2) + R(214, 494, 12, 206, WOOD_D, 2) + R(70, 376, 120, 90, "#3a342c", 2.4, 6) + R(80, 386, 100, 70, "#b9c9cf", 1.4, 4) + R(118, 466, 24, 14, "#3a342c", 2);
  s += chair(330, 590) + p.far + p.body + p.near + G("", clock(510, 170, 64, t * .55), 1);
  var D = LN[12].end - LN[12].start, c = window.CHUNKS[12];
  s += tag("شعر كتير", 500, 340, at(u, .2, .3), 22) + tag("وزن زيادة", 500, 420, at(u, D * (c[1] || .35), .3), 22) + tag("قعدة طويلة", 500, 500, at(u, D * (c[2] || .65), .3), 22, ORANGE);
  return s;
});
// 13 · the abscess first: a cut to the side of the swelling, the pus drains
shot(13, push(340, 380, 1.15, 1.3), function (u, d, t) {
  var cutK = at(u, 1.6, .6), drain = at(u, 2.4, 2.2), o = { depth: 120, pocket: 1.1 - .45 * drain, hairs: 6, pus: 1 - drain * .8, inflame: 1 - drain * .6, bump: [346, 34 * (1 - drain), 60] };
  var sx = 392, sy = surfY(sx, o), s = paper() + cut(t, o);
  if (cutK > 0) s += '<path d="M' + (sx - 4) + ' ' + f(sy - 2) + ' l' + f(10 * cutK) + ' ' + f(30 * cutK) + '" stroke="' + WOUND + '" stroke-width="6" stroke-linecap="round"/>';
  for (var i = 0; i < 5; i++) { var p = (t * .9 + i / 5) % 1; if (drain > 0 && drain < 1) s += '<ellipse cx="' + f(sx + 14 + p * 40) + '" cy="' + f(sy + p * 60) + '" rx="7" ry="9" fill="' + PUS + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f((1 - p) * (1 - drain * .6)) + '"/>'; }
  s += scalpel(lerp(560, sx + 4, at(u, .6, 1.0)), lerp(160, sy - 4, at(u, .6, 1.0)), -60, 1.1) + G("", T("الخراج الأول", 160, 150, 26, ORANGE, 800), at(u, .2, .3));
  return s;
});
// 14 · then the whole pocket, with its hair, comes out in one block
shot(14, push(340, 380, 1.08, 1.0), function (u, d, t) {
  var o = { depth: 120, pocket: .9, hairs: 7, excise: at(u, .3, .6), lift: at(u, 1.6, 1.4) };
  return paper() + cut(t, o) + label(470, 110, 430, 170, "الجيب كله", OLIVE, at(u, 2.6, .5), 24);
});
// 15 · the old way: left open to heal by itself, packed with gauze, weeks of dressings
shot(15, push(340, 420, 1.15, 1.25), function (u, d, t) {
  var heal = at(u, 1.6, d - 2.0), o = { depth: 120, open: 1, gauze: at(u, .6, .5), heal: heal * .8 };
  var wk = 1 + Math.floor(heal * 5.99);
  return paper() + cut(t, o) + iconBox(480, 170, 120, R(-56, -50, 112, 104, "#f4ecdb", 2) + R(-56, -50, 112, 24, ORANGE, 2) + N(String(wk), 0, 36, 46, INK), at(u, 1.2, .3)) + G("", T("أسابيع", 480, 260, 22, ORANGE, 800), at(u, 1.4, .3)) +
    label(330, 360, 200, 200, "مفتوح", INK, at(u, .3, .5), 24) + G("", T("زمان", 200, 150, 22, MUTE, 700), at(u, .2, .3));
});
// 16 · today: the closure is moved off the middle and the cleft is made shallow, so hair has nowhere to gather
shot(16, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, 1.0, 2.6), o = { depth: lerp(120, 26, k), cx: lerp(320, 352, k), scar: k > .5 ? 400 : null };
  var b = cleftBottom({ depth: 120 }), b2 = cleftBottom(o), s = paper() + cut(t, o);
  s += measure(530, CUT_TOP + 60, 530, CUT_TOP + 60 + lerp(120, 26, k), 1, "") + G("", T("عمق", 530, CUT_TOP + 30, 22, BLUE, 800), at(u, .4, .3));
  // a hair slides over the shallow cleft and off
  var hp = (t * .5) % 1; if (k >= 1) s += hair(lerp(180, 520, hp), surfY(lerp(180, 520, hp), o) - 6, -4, 40, 3, 2.6);
  s += label(400, surfY(400, o) + 2, 400, 150, "الجرح على جنب", ORANGE, at(u, 3.0, .5), 22) + check(560, 520, 1.1, at(u, d - 1.2, .5), BLUE);
  return s;
});
// 17 · small cases: a scope or a laser fibre goes in through the pit and seals the tract from inside
shot(17, push(330, 400, 1.2, 1.32), function (u, d, t) {
  var o = { depth: 120, pocket: .55 * (1 - .5 * at(u, 2.0, 1.4)), hairs: 2 * (1 - at(u, 1.4, .6)), tract: 1 }, b = cleftBottom(o), pc = pocketAt(o), ins = at(u, .4, 1.0);
  var tipx = lerp(b[0] - 100, pc[0] - 6, ins), tipy = lerp(b[1] - 200, pc[1] - 8, ins), s = paper() + cut(t, o);
  s += '<path d="M' + f(tipx - 180) + ' ' + f(tipy - 330) + ' L' + f(tipx) + ' ' + f(tipy) + '" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M' + f(tipx - 180) + ' ' + f(tipy - 330) + ' L' + f(tipx) + ' ' + f(tipy) + '" stroke="#9aa4a8" stroke-width="8" stroke-linecap="round"/>';
  var gl = at(u, 1.8, .4); if (gl > 0) s += '<circle cx="' + f(tipx) + '" cy="' + f(tipy) + '" r="' + f(16 + 6 * Math.sin(t * 14)) + '" fill="' + ORANGE + '" opacity="' + f(.55 * gl) + '"/>' + C(tipx, tipy, 6, "#f6d58a", 1.4);
  return s + label(tipx - 90, tipy - 165, 260, 140, "منظار / ليزر", BLUE, at(u, 1.0, .5), 24);
});
// 18 · prevention: remove the hair; laser lowers the chance it comes back
shot(18, push(320, 380, 1.05, 1.15), function (u, d, t) {
  var o = { depth: 70 }, hx = lerp(80, 560, (u * .22) % 1), s = paper(), hs = [];
  for (var i = 0; i < 16; i++) { var x = 60 + i * 34; if (x > hx || u < 1.2) hs.push([x, -110 + hash(i) * 40, 30]); }
  o.surf = hs; s += cut(t, o);
  var sy = surfY(hx, o);
  if (u > 1.2) s += G("", R(hx - 40, sy - 210, 80, 120, "#dfe3e4", 2.4, 10) + R(hx - 20, sy - 90, 40, 30, "#9aa4a8", 2) + '<path d="M' + f(hx) + ' ' + f(sy - 60) + ' L' + f(hx) + ' ' + f(sy - 6) + '" stroke="' + ORANGE + '" stroke-width="' + f(6 + 4 * Math.abs(Math.sin(t * 12))) + '" opacity=".75"/>', at(u, 1.2, .3));
  var D = LN[18].end - LN[18].start, c = window.CHUNKS[18];
  s += tag("ليزر", 140, 120, at(u, D * (c[1] || .5), .3), 28, BLUE) + G("", arrow(470, 90, 470, 170, ORANGE, 6, 1) + T("يرجع أقل", 470, 210, 22, ORANGE, 800), at(u, D * (c[1] || .5) + .8, .4));
  return s;
});
// 19 · clean and dry; don't sit more than an hour without getting up
shot(19, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var D = LN[19].end - LN[19].start, c = window.CHUNKS[19], k2 = D * (c[1] || .4), cyc = Math.max(0, u - k2), standK = clamp(Math.sin(clamp((cyc - 1.0) / 2.0) * Math.PI) * 1.4);
  var p = sitter(330, 700, standK, { hands: [rel(40, 40), rel(40, 34)] }), s = paper() + floor(700) + chair(352, 590) + p.far + p.body + p.near;
  s += G("", clock(520, 180, 66, clamp(cyc / 1.0) * 1) + T("ساعة", 520, 290, 26, ORANGE, 800), at(u, k2, .3));
  s += G("", tag("نضيف", 140, 140, 1, 26, BLUE) + tag("ناشف", 140, 220, 1, 26, BLUE) + check(250, 140, .8, at(u, .6, .4), BLUE) + check(250, 220, .8, at(u, 1.0, .4), BLUE), at(u, .2, .3));
  if (standK > .4) s += arrow(250, 520, 250, 420, ORANGE, 6, standK);
  return s;
});
// 20 · the myth: it reaches the bone or the bowel? No
shot(20, push(345, 500, 1.7, 1.85), function (u, d, t) {
  var sp = spot(), cc = coccyxTip(), an = anus(), s = paper() + anat(t, { hl: u > 1.8 ? "bowel" : "bone" });
  s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="10" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 4, ORANGE, 1.4);
  s += draw("M" + f(sp[0]) + " " + f(sp[1]) + " Q" + f(sp[0] - 4) + " " + f(cc[1] - 10) + " " + f(cc[0] + 4) + " " + f(cc[1]), at(u, .5, .8), ORANGE, 3, ' stroke-dasharray="6 5"') +
       draw("M" + f(sp[0]) + " " + f(sp[1]) + " Q" + f(sp[0] + 4) + " " + f(an[1] - 10) + " " + f(an[0] + 6) + " " + f(an[1]), at(u, 1.8, .8), ORANGE, 3, ' stroke-dasharray="6 5"');
  s += label(cc[0], cc[1], 300, 400, "العضمة؟", INK, at(u, 1.0, .5), 18) + label(an[0], an[1], 330, 560, "المصران؟", INK, at(u, 2.2, .5), 18) + cross(sp[0] - 22, sp[1] + 34, .55, at(u, d - .9, .4));
  return s;
});
// 21 · just a pocket under the skin; the coccyx is only its address
shot(21, push(330, 470, 1.0, 1.08), function (u, d, t) {
  var o = { depth: 120, pocket: 1, hairs: 5, hl: u < 1.6 ? "pocket" : "bone" }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] + 40, pc[1], 440, 380, "تحت الجلد", OLIVE, at(u, .3, .5), 24) + measure(400, pc[1] + 40, 400, 590, at(u, 1.0, .6), "") + check(470, 470, .8, at(u, 1.4, .4), BLUE) +
    label(330, 740, 420, 790, "العصعص", INK, at(u, 1.8, .5), 22) + tag("عنوان", 220, 600, at(u, 2.4, .3), 26, ORANGE);
});
// 22 · «يعني من الآخر»: loose hair + rubbing + a deep cleft → the skin swallows the hair
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var D = LN[22].end - LN[22].start, c = window.CHUNKS[22], k1 = at(u, D * (c[1] || .2), .3), k2 = at(u, D * (c[1] || .2) + .8, .3), k3 = at(u, D * (c[1] || .2) + 1.6, .3), k4 = at(u, D * (c[2] || .7), .4);
  var s = paper();
  s += iconBox(110, 150, 140, hair(-40, 10 + 6 * Math.sin(t * 3), -20 + 8 * Math.sin(t * 2), 80, 8, 3) + hair(-30, 30, -10 + 8 * Math.cos(t * 2.4), 70, -6, 3), k1) + G("", T("+", 220, 164, 50, INK, 800), k2);
  s += iconBox(320, 150, 140, arrow(-60 + 10 * Math.sin(t * 6), 0, -10 + 10 * Math.sin(t * 6), 0, ORANGE, 6, 1) + arrow(60 - 10 * Math.sin(t * 6), 0, 10 - 10 * Math.sin(t * 6), 0, ORANGE, 6, 1), k2) + G("", T("+", 430, 164, 50, INK, 800), k3);
  s += iconBox(530, 150, 140, '<path d="M-60 -20 Q-20 -20 0 ' + f(36 + 8 * Math.sin(t * 3)) + ' Q20 -20 60 -20" stroke="' + INK + '" stroke-width="4" fill="none"/>', k3);
  s += G("", arrow(320, 250, 320, 330, ORANGE, 7, 1), k4) + G("translate(320 560) scale(.62) translate(-330 -440)", cut(t, { depth: 120, pocket: 1, hairs: 6, w: 78 - 16 * Math.abs(Math.sin(t * 3)), inflame: .5 + .5 * Math.sin(t * 4) }) + hair(330 + 30 * Math.sin(t * 2), lerp(100, 380, (t * .7) % 1), t * 160, 50, 5, 3.4), 1);
  return s;
}, { tr: "out" });
// 23 · the odd fact: WWII, «jeep disease», more than 70,000 US soldiers in hospital
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var b = 3 * Math.abs(Math.sin(t * 7)), sol = fig({ x: 330, y: 520 - b, lean: 4, shirt: "#7d7a52", hair: "#5b5f3a", legs: [[82, -82], [78, -78]], hands: [[230, 452 - b], [236, 456 - b]], bend: [1, 1] });
  var helmet = '<path d="M' + f(sol.hd[0] - 30) + ' ' + f(sol.hd[1] - 6) + ' C' + f(sol.hd[0] - 30) + ' ' + f(sol.hd[1] - 46) + ' ' + f(sol.hd[0] + 30) + ' ' + f(sol.hd[1] - 46) + ' ' + f(sol.hd[0] + 32) + ' ' + f(sol.hd[1] - 4) + ' Z" fill="#5b5f3a" stroke="' + INK + '" stroke-width="2.2"/>';
  var s = paper() + floor(650) + '<path d="M-400 650 H1040" stroke="' + INK + '" stroke-width="2" stroke-dasharray="30 20" stroke-dashoffset="' + f(t * 200) + '"/>';
  s += jeep(320, 650, t).replace("", "") + sol.far + sol.body + sol.near + helmet + R(214, 440 - b, 10, 30, INK, 0) ;
  s += bigNum(count(70000, at(u, .8, 1.6)), "جندي", 320, 150, at(u, .6, .3), ORANGE, 64) + tag("مرض الجيب", 320, 290, at(u, 3.4, .3), 30, ORANGE);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: someone seated on a chair; a sore spot pulses over the end of the spine. 1: inset — the swelling, pus. 2: inset — hair pulled out of it
  var s = '<path d="M-20 600 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 600, 660, 80, "#e3d7bd", 0);
  var wince = 4 * Math.sin(t * 3.4), sh = 2.5 * Math.sin(t * 13), p = fig({ x: 260 + sh, y: 478, lean: 4 + wince, shirt: SHIRT_V, legs: [[82, -82], [78, -78]], hands: [rel(30, -26), rel(60, 24)], bend: [1, -1] });
  s += chair(285, 492) + p.far + p.body + p.near;
  var sp = p.at(22, -30); s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(20 + 12 * Math.sin(t * 6)) + '" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 7, ORANGE, 1.6);
  if (li >= 1) { var u = t - LN[1].start, k = ease(u / .4);
    var o = { depth: 110, pocket: 1, pus: 1, hairs: li >= 2 ? 3 : 6, inflame: 1, bump: [346, 30 + 3 * Math.sin(t * 6), 60] };
    s += inset(470, 200, 130, G("scale(.7) translate(-336 -360)", cut(t, o)), k) + draw("M" + f(sp[0] + 10) + " " + f(sp[1] - 6) + " L380 280", k, INK, 1.6);
    if (li < 2) for (var i = 0; i < 3; i++) { var q = (t * .8 + i / 3) % 1; s += '<ellipse cx="' + f(470 + 2) + '" cy="' + f(160 - 30 * q) + '" rx="7" ry="9" fill="' + PUS + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f((1 - q) * k) + '"/>'; }
  }
  if (li >= 2) { var v = t - LN[2].start, pull = ease(v / 1.2);
    s += G("", tweezers(470, 150 - 60 * pull, 8) + hair(468, 150 - 60 * pull, 80, 60, 6, 3) + hair(476, 150 - 60 * pull, 100, 54, -6, 3), ease(v / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 110) scale(.36) translate(-330 -420)", cut(t, { depth: 110, pocket: 1, hairs: 4 + Math.floor(u * 3) % 3, inflame: .6 + .4 * Math.sin(t * 4) }));
};
SCENE.outro = function (svg, u, t) {
  var o = { depth: 120, pocket: 1, hairs: 6, w: 78 - 14 * Math.abs(Math.sin(t * 3)) };
  return G("translate(300 150) scale(.5) translate(-330 -400)", cut(t, o)) + hair(220 + 20 * Math.sin(t * 2), 30, 40, 40, 4, 2.6) +
    callout("1", 236, 30, ease(u / .3)) + callout("2", 140, 70, ease(u / .3 - .5)) + callout("3", 300, 110, ease(u / .3 - 1)) + callout("4", 340, 190, ease(u / .3 - 1.5));
};
