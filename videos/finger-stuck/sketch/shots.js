// ── «البنصر اللي مش بيترفع» — drawings. The hand is the rig the user approved (scratchpad hand2), built from real
// anatomy (refs/SOURCES.md): three phalanges per finger with the joints thicker than the shafts, nails on the distal
// half, the extensor tendons fanning down the back of the hand, the juncturae tendinum tying the middle and ring
// tendons together above the knuckles, and the extra extensors of the index (extensor indicis) and the little finger
// (extensor digiti minimi). Right hand, palm down on a table, seen from above at a slight tilt, fingers toward us.

var SKIN2 = "#b77a5c", LIT = "#efc0a4", NAIL = "#efcdb9", WOODT = "#d9c29b", WOODG = "#c4a97c", TEND = "#f4eee2";

// ── curve helpers ──
function smooth(pts, closed) {   // Catmull-Rom → cubic Bézier through the points
  var n = pts.length, d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 0; i < (closed ? n : n - 1); i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (!closed) { if (i == 0) p0 = p1; if (i == n - 2) p3 = p2; }
    d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
  }
  return d + (closed ? " Z" : "");
}
function sline(pts, col, w, op, ex) { return '<path d="' + smooth(pts, false) + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : "") + (ex || "") + '/>'; }

// a jointed digit outline from joints [[x, y, width], …] (root → tip centre)
function digit(j) {
  var L = [], R = [], n = j.length;
  function nrm(i) { var a = j[Math.max(0, i - 1)], b = j[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l, dx / l, dy / l]; }
  for (var i = 0; i < n; i++) { var q = nrm(i), w = j[i][2] / 2; L.push([j[i][0] + q[0] * w, j[i][1] + q[1] * w]); R.push([j[i][0] - q[0] * w, j[i][1] - q[1] * w]); }
  var e = nrm(n - 1), tw = j[n - 1][2] / 2, tip = [];
  for (var k = 1; k < 6; k++) { var th = Math.PI * k / 6, c = Math.cos(th), s = Math.sin(th); tip.push([j[n - 1][0] + e[0] * tw * c + e[2] * tw * s, j[n - 1][1] + e[1] * tw * c + e[3] * tw * s]); }
  return { d: smooth(L.concat(tip, R.reverse()), true), at: function (i, off) { var q = nrm(i), w = j[i][2] / 2; return [j[i][0] + q[0] * w * off, j[i][1] + q[1] * w * off]; }, nrm: nrm };
}
// joints of a finger: root (x,y), direction a (deg, 0 = down), phalanx lengths, widths at root / PIP / DIP / tip.
// lift 0..1 tips it toward the camera (segments foreshorten, the far end grows); fold 0..1 curls it under the palm.
function joints(x, y, a, ls, ws, lift, bend, fold) {
  lift = lift || 0; fold = fold || 0;
  var out = [], r = a * Math.PI / 180, px = x, py = y, sc = [1, 1 - 0.30 * lift, 1 - 0.45 * lift, 1 - 0.55 * lift], fs = [1 - 0.35 * fold, 1 - 0.85 * fold, 1 - 0.85 * fold];
  var W = [ws[0], ws[0] * 0.92, ws[1] * 1.03, ws[1] * 0.9, ws[2] * 1.02, ws[2] * 0.94, ws[3]];
  out.push([px, py, W[0]]);
  for (var s = 0; s < 3; s++) {
    var L = Math.max(2, ls[s] * sc[s + 1] * fs[s]), gr = 1 + 0.18 * lift * (s + 1) / 3;
    out.push([px + Math.sin(r) * L / 2, py + Math.cos(r) * L / 2, W[1 + 2 * s] * gr]);
    px += Math.sin(r) * L; py += Math.cos(r) * L; r += (bend || 0) * Math.PI / 180;
    out.push([px, py, (s < 2 ? W[2 + 2 * s] : W[6]) * gr]);
  }
  return out;   // 0 root, 2 PIP, 4 DIP, 6 tip centre
}
function wrinkles(D, i, count, len, op) {
  var s = "", q = D.nrm(i);
  for (var k = 0; k < count; k++) { var o = (k - (count - 1) / 2) * 5, c = D.at(i, 0), cx = c[0] + q[2] * o, cy = c[1] + q[3] * o, w = len * (1 - Math.abs(k - (count - 1) / 2) * 0.25);
    s += '<path d="M' + f(cx + q[0] * w / 2) + ' ' + f(cy + q[1] * w / 2) + ' Q' + f(cx + q[2] * 3.5) + ' ' + f(cy + q[3] * 3.5) + ' ' + f(cx - q[0] * w / 2) + ' ' + f(cy - q[1] * w / 2) + '" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round" opacity="' + (op || .5) + '"/>'; }
  return s;
}
// a finger: body, shaded side (its thickness), lit ridge, knuckle wrinkles, nail. o: {red 0..1}
function drawFinger(j, o) {
  o = o || {}; var D = digit(j), s = '<path d="' + D.d + '" fill="' + SKIN + '"/>';
  if (o.red) s += '<path d="' + D.d + '" fill="' + ORANGE + '" opacity="' + f(.55 * o.red) + '"/>';
  var sh = [], i; for (i = 0; i < j.length; i++) sh.push(D.at(i, -1)); for (i = j.length - 1; i >= 0; i--) sh.push(D.at(i, -0.25));
  s += '<path d="' + smooth(sh, true) + '" fill="' + SKIN2 + '" opacity=".5"/>';
  var hl = []; for (i = 1; i < j.length - 1; i++) hl.push(D.at(i, 0.5));
  s += sline(hl, LIT, f(j[3][2] * 0.16), .75);
  s += '<path d="' + D.d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  s += wrinkles(D, 2, 3, j[2][2] * 0.55, .55) + wrinkles(D, 4, 2, j[4][2] * 0.45, .45);
  var a = j[5], b = j[6], ang = Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI, nw = b[2] * 0.62, nl = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.05 + b[2] * 0.25;
  if (nl > 8) s += G('translate(' + f(a[0]) + ' ' + f(a[1]) + ') rotate(' + f(-ang) + ')', '<path d="M' + f(-nw / 2) + ' 2 Q0 -4 ' + f(nw / 2) + ' 2 L' + f(nw / 2) + ' ' + f(nl - nw * 0.45) + ' Q' + f(nw / 2) + ' ' + f(nl) + ' 0 ' + f(nl) + ' Q' + f(-nw / 2) + ' ' + f(nl) + ' ' + f(-nw / 2) + ' ' + f(nl - nw * 0.45) + ' Z" fill="' + NAIL + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + f(-nw * 0.28) + ' 6 L' + f(-nw * 0.28) + ' ' + f(nl * 0.6) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>');
  return s;
}
function shadowOf(j, dx, dy, op) { var J = j.map(function (p) { return [p[0] + dx, p[1] + dy, p[2]]; }); return '<path d="' + digit(J).d + '" fill="' + INK + '" opacity="' + op + '"/>'; }
// folded under: the first phalanx dips to the table and the bent middle knuckle faces the camera
function drawFolded(x, y, a, len, w) {
  var r = a * Math.PI / 180, ex = x + Math.sin(r) * len, ey = y + Math.cos(r) * len, s = "";
  var j = [[x, y, w], [x + Math.sin(r) * len * .5, y + Math.cos(r) * len * .5, w], [ex, ey, w * 1.12]], D = digit(j), sh = [], i;
  s += '<ellipse cx="' + f(ex + 6) + '" cy="' + f(ey + 12) + '" rx="' + f(w * 0.62) + '" ry="' + f(w * 0.34) + '" fill="' + INK + '" opacity=".28"/>';
  s += '<path d="' + D.d + '" fill="' + SKIN + '"/>';
  for (i = 0; i < 3; i++) sh.push(D.at(i, -1)); for (i = 2; i >= 0; i--) sh.push(D.at(i, -0.2));
  s += '<path d="' + smooth(sh, true) + '" fill="' + SKIN2 + '" opacity=".55"/><path d="' + D.d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  for (var k = 0; k < 3; k++) { var rr = w * (0.16 + 0.1 * k); s += '<path d="M' + f(ex - rr) + ' ' + f(ey - 2 + k * 2) + ' Q' + f(ex) + ' ' + f(ey + rr * 0.9) + ' ' + f(ex + rr) + ' ' + f(ey - 2 + k * 2) + '" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity="' + (.55 - k * .12) + '" stroke-linecap="round"/>'; }
  return s + '<ellipse cx="' + f(ex - w * 0.12) + '" cy="' + f(ey - w * 0.05) + '" rx="' + f(w * 0.12) + '" ry="' + f(w * 0.07) + '" fill="' + LIT + '" opacity=".8"/>';
}
function padThumb(TJ) { var a = TJ[0], b = TJ[2], c = TJ[4]; function mid(p, q, k) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 * (k || 1)]; }
  var m1 = mid(a, b, .95); return [a, mid(a, m1), m1, mid(m1, b), b, mid(b, c, .96), c]; }

// ── the hand (hand units: the wrist cuff at the top ≈ y 75, fingertips ≈ y 620) ──
var FG = { pinky: [148, 330, -11, [74, 46, 38], [42, 38, 34, 30]], ring: [203, 350, -4, [92, 58, 44], [48, 43, 39, 34]], middle: [262, 356, 1, [98, 64, 46], [50, 45, 41, 35]], index: [320, 344, 7, [90, 56, 42], [48, 43, 39, 34]] };
var BEND = { pinky: -2, ring: 0, middle: 0, index: 2 };
// tendon start points under the cuff, one per finger
var TW = { pinky: [206, 120], ring: [228, 120], middle: [250, 120], index: [272, 120] };
function fingerJ(k, q) { var g = FG[k]; return joints(g[0], g[1], g[2], g[3], g[4], q.lift || 0, BEND[k], q.fold || 0); }
function thumbJ(q) { var TJ = joints(350, 228, 30, [0, 66, 52], [62, 50, 44, 38], q.lift || 0, 8).slice(2); TJ[0][2] = 66; return padThumb(TJ); }
// o: {f: {pinky|ring|middle|index|thumb: {lift, fold, red, jit}}, xray 0..1, tend: {...} tendon options}
function hand(o) {
  o = o || {}; var F = o.f || {}, s = "", J = {}, x = o.xray || 0, k;
  ["pinky", "ring", "middle", "index"].forEach(function (k) { J[k] = fingerJ(k, F[k] || {}); });
  var back = 'M154 118 C146 190 130 262 122 322 C120 336 128 346 142 350 C176 368 216 372 262 374 C312 374 348 362 362 342 C374 318 378 296 376 270 C372 236 358 180 344 118 Z';
  var skin = "";
  // contact shadows: a lifted finger's shadow stays on the table and slides away from it
  skin += '<path d="' + back + '" transform="translate(9 12)" fill="' + INK + '" opacity=".13"/>';
  for (k in J) { var q = F[k] || {}; if ((q.fold || 0) > .7) continue; var lj = q.lift ? fingerJ(k, { fold: q.fold }) : J[k]; skin += shadowOf(lj, 8 + (q.lift || 0) * 6, 12 + (q.lift || 0) * 30, f(.13 + (q.lift || 0) * .07)); }
  // the middle finger: straight, folding, or folded under
  var mf = (F.middle || {}).fold || 0, mk = clamp((mf - .45) / .4);
  if (mk > 0) skin += G("", drawFolded(FG.middle[0], FG.middle[1], FG.middle[2], 62, 52), mk);
  ["pinky", "ring", "index"].forEach(function (k) { skin += drawFinger(J[k], F[k]); });
  if (mk < 1) skin += G("", drawFinger(J.middle, F.middle), 1 - mk);
  // the thumb sits under the edge of the hand
  var th = F.thumb || {}, TJ = thumbJ(th), TJ0 = th.lift ? thumbJ({}) : TJ;
  skin += shadowOf(TJ0, 8 + (th.lift || 0) * 6, 12 + (th.lift || 0) * 30, f(.13 + (th.lift || 0) * .07)) + drawFinger(TJ, th);
  // back of the hand over the finger roots
  skin += '<path d="' + back + '" fill="' + SKIN + '"/>';
  skin += '<path d="M154 118 C146 190 130 262 122 322 C120 336 128 346 142 350 L162 340 C158 270 168 190 180 118 Z" fill="' + SKIN2 + '" opacity=".5"/>';
  [[204, 150, 146, 318], [226, 150, 203, 338], [248, 150, 262, 344], [272, 150, 320, 330]].forEach(function (t) { skin += sline([[t[0], t[1]], [(t[0] * 2 + t[2]) / 3, 230], [t[2], t[3]]], SKIN2, 3.2, .5); });
  [[148, 330, 40], [203, 350, 46], [262, 356, 48], [320, 344, 46]].forEach(function (p) {
    skin += '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 12) + '" rx="' + f(p[2] * 0.26) + '" ry="6" fill="' + LIT + '" opacity=".45"/>';
    skin += '<path d="M' + f(p[0] - p[2] * 0.35) + ' ' + (p[1] - 2) + ' q' + f(p[2] * 0.35) + ' -12 ' + f(p[2] * 0.7) + ' 0" fill="none" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>'; });
  [[176, 352], [233, 364], [292, 362]].forEach(function (p) { skin += '<path d="M' + (p[0] - 7) + ' ' + (p[1] - 6) + ' q7 12 14 0" fill="none" stroke="' + INK + '" stroke-width="2.2" opacity=".6"/>'; });
  skin += '<path d="M154 118 C146 190 130 262 122 322 C120 336 126 344 134 348" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  skin += '<path d="M344 118 C350 150 356 176 366 200" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  skin += '<path d="M370 268 C384 282 388 300 382 316" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" opacity=".45"/>';
  s += x > 0 ? '<g opacity="' + f(1 - .68 * x) + '" style="filter:saturate(' + f(1 - .6 * x) + ')">' + skin + '</g>' : skin;
  if (x > 0) s += '<g opacity="' + f(x) + '">' + tendons(J, F, o.tend || {}) + '</g>';
  // sleeve cuff (always on top: the tendons run in from under it)
  s += '<path d="M136 74 L362 74 L358 128 C298 138 206 138 144 128 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  s += '<path d="M146 116 C206 124 298 124 356 116" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".4"/>';
  return s;
}
// the extensor tendons. opt: {pull: 0..1 (the middle tendon dragged toward the fingertip), band 0..1 highlight,
// own 0..1 (the extra muscles of index and pinky in olive), lock 0..1 (the ring tendon held), col: {finger: colour}}
function tendonPts(k, J, F) {
  var w = TW[k], q = F[k] || {}, j = J[k];
  if ((q.fold || 0) > .45) { var g = FG[k], r = g[2] * Math.PI / 180; return [w, [(w[0] * 2 + g[0]) / 3, 240], [g[0], g[1]], [g[0] + Math.sin(r) * 58, g[1] + Math.cos(r) * 58]]; }
  return [w, [(w[0] * 2 + j[0][0]) / 3, 240], [j[0][0], j[0][1]], [j[2][0], j[2][1]], [j[4][0], j[4][1]], [j[5][0], j[5][1]]];
}
function tendons(J, F, o) {
  var s = "", col = o.col || {}, pull = o.pull || 0;
  // the extra muscles: a second tendon beside the index and the little finger, joining at the knuckle
  if (o.own) {
    s += sline([[TW.pinky[0] - 14, 120], [180, 240], [FG.pinky[0] - 4, FG.pinky[1] - 6]], OLIVE, 6, o.own);
    s += sline([[TW.index[0] + 16, 120], [300, 240], [FG.index[0] + 6, FG.index[1] - 6]], OLIVE, 6, o.own);
  }
  ["pinky", "ring", "middle", "index"].forEach(function (k) {
    var p = tendonPts(k, J, F), c = col[k] || TEND;
    s += sline(p, INK, 10) + sline(p, c, 6);
  });
  // the band (juncturae tendinum) between the ring and middle tendons, just above the knuckles
  var by = 300 + 14 * pull, b1 = [210, by + 2], b2 = [258, by + 6];
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>';
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + (o.band ? ORANGE : "#e3cdb6") + '" stroke-width="10" stroke-linecap="round"/>';
  return s;
}
// hand units → panel units (the hand is tilted -12° about (250, 300) and placed at P0)
var P0 = [80, 96], RT = -12;
function hp(x, y, o) { o = o || {}; var p = o.p || P0, sc = o.s || 1, a = RT * Math.PI / 180, dx = x - 250, dy = y - 300; return [p[0] + (250 + dx * Math.cos(a) - dy * Math.sin(a)) * sc, p[1] + (300 + dx * Math.sin(a) + dy * Math.cos(a)) * sc]; }
function placed(inner, o) { o = o || {}; var p = o.p || P0; return G('translate(' + f(p[0]) + ' ' + f(p[1]) + ') scale(' + (o.s || 1) + ') rotate(' + RT + ' 250 300)', inner); }
function tipOf(k, q) { var j = fingerJ(k, q || {}); return hp(j[6][0], j[6][1]); }
// the table seen from above: light wood with grain, running under the whole panel
function table(t) {
  var s = '<rect x="-400" y="-400" width="1440" height="1600" fill="' + WOODT + '"/>';
  for (var k = 0; k < 18; k++) { var y = -300 + k * 80 + 18 * Math.sin(k * 1.7); s += '<path d="M-400 ' + f(y) + ' C0 ' + f(y + 24 * Math.sin(k)) + ' 400 ' + f(y - 20 * Math.cos(k * 1.3)) + ' 1040 ' + f(y + 10) + '" fill="none" stroke="' + WOODG + '" stroke-width="' + (k % 3 ? 2 : 3.5) + '" opacity=".7"/>'; }
  return s + '<ellipse cx="560" cy="160" rx="22" ry="9" fill="none" stroke="' + WOODG + '" stroke-width="2.4" opacity=".8"/>';
}
// effort marks round a fingertip that tries and fails
function strain(x, y, t, k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 3; i++) { var a = -2.2 + i * .55, r = 46 + 6 * Math.sin(t * 18 + i); s += '<path d="M' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + ' l' + f(Math.cos(a) * 16) + ' ' + f(Math.sin(a) * 16) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, k); }
function lockIcon(x, y, k) { k = pop(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<path d="M-14 -4 V-16 A14 14 0 0 1 14 -16 V-4" fill="none" stroke="' + INK + '" stroke-width="5"/><rect x="-22" y="-6" width="44" height="34" rx="5" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="0" cy="8" r="4" fill="' + INK + '"/>'); }
// a finger going up and back down over [a, a+dur] seconds of the shot
function upDown(u, a, dur) { var k = (u - a) / dur; return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, k * 1.25)) * (k < .8 ? 1 : 1 - (k - .8) / .2) + (k > .8 ? 0 : 0); }
function liftK(u, a) { return ease((u - a) / .35); }
var CAM = [345, 455];

// 1 · try it now: the hand comes down flat on the table
shot(1, push(CAM[0], CAM[1], 1.02, 1.12), function (u, d, t) {
  var k = ease(u / 1.1), dz = 1 - k;
  return paper() + table(t) + G('translate(' + f(-30 * dz) + ' ' + f(-60 * dz) + ')', placed(hand({}), { s: 1 + .08 * dz })) +
    tag("كف إيدك على الترابيزة", 345, 740, at(u, 1.2, .3), 30);
});
// 2 · fold the middle finger under
shot(2, push(CAM[0], CAM[1] + 20, 1.12, 1.2), function (u, d, t) {
  var k = at(u, .35, .8), m = tipOf("middle", { fold: 0 });
  return paper() + table(t) + placed(hand({ f: { middle: { fold: k } } })) +
    arrow(m[0] + 46, m[1] - 70, m[0] + 46, m[1] - 120 + 8 * Math.sin(t * 6), ORANGE, 6, k) + label(m[0] - 8, m[1] - 110, 400, 690, "الوسطاني تحت", OLIVE, at(u, .9, .5), 26);
});
// 3–5 · thumb, index, little finger: each lifts easily (✓)
function easyShot(line, finger, name, cx, cy) {
  shot(line, push(cx, cy, 1.14, 1.22), function (u, d, t) {
    var F = { middle: { fold: 1 } }, lk = Math.min(liftK(u, .15), 1 - ease((u - d + .25) / .3)); F[finger] = { lift: lk };
    var tip = finger === "thumb" ? (function () { var j = thumbJ({}); return hp(j[6][0], j[6][1]); })() : tipOf(finger, {});
    return paper() + table(t) + placed(hand({ f: F })) + arrow(tip[0], tip[1] - 40, tip[0], tip[1] - 110 - 10 * Math.sin(t * 7), ORANGE, 6, lk) +
      check(tip[0] + (finger === "pinky" ? -60 : 60), tip[1] - 150, 1.3, at(u, d * .55, .35), OLIVE) + tag(name, cx, cy + 280, at(u, .2, .3), 30, OLIVE);
  });
}
easyShot(3, "thumb", "الكبير", 400, 440);
easyShot(4, "index", "السبابة", 370, 460);
easyShot(5, "pinky", "الصغير", 280, 460);
// 6 · now the ring finger: the camera closes in on it, the colour runs down it
shot(6, push(270, 500, 1.2, 1.4), function (u, d, t) {
  var r = tipOf("ring", {}), k = at(u, .3, .9);
  return paper() + table(t) + placed(hand({ f: { middle: { fold: 1 }, ring: { red: k * (.75 + .25 * Math.sin(t * 5)) } } })) +
    '<ellipse cx="' + f(r[0]) + '" cy="' + f(r[1]) + '" rx="34" ry="18" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>' +
    arrow(r[0] + 50, r[1] - 40, r[0] + 50, r[1] - 110 - 10 * Math.sin(t * 6), ORANGE, 6, at(u, .8, .3)) + tag("البنصر", 290, 740, at(u, .9, .3), 30, ORANGE);
}, { tr: "in" });
// 7 · stuck: it trembles but stays down, no matter how hard you try
shot(7, push(270, 510, 1.4, 1.46), function (u, d, t) {
  var r = tipOf("ring", {}), jit = 0.05 * Math.abs(Math.sin(t * 26)) * at(u, .1, .3);
  return paper() + table(t) + G('translate(' + f(1.6 * Math.sin(t * 40)) + ' 0)', placed(hand({ f: { middle: { fold: 1 }, ring: { red: 1, lift: jit } } }))) +
    strain(r[0], r[1] - 10, t, at(u, .1, .3)) + '<rect x="' + f(r[0] - 70) + '" y="' + f(r[1] + 50) + '" width="140" height="54" rx="27" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + G("", T("لازق!", r[0], r[1] + 88, 32, "#fff", 800), at(u, .1, .25));
});
// 8 · why? the skin goes thin and the tendons show through

// 9 · the middle and ring tendons are tied by a small band (inset: the band close up)
shot(8, push(CAM[0], CAM[1] - 50, 1.3, 1.16), function (u, d, t) {
  var u9 = u - (LN[9].start - LN[8].start), b = hp(234, 304), k = at(u9, .5, .5);
  return paper() + table(t) + placed(hand({ f: { middle: { fold: 1 } }, xray: at(u, .05, .5), tend: { band: k, col: { ring: k > 0 ? "#a9c1cf" : TEND, middle: k > 0 ? "#a9c1cf" : TEND } } })) +
    tag("طب ليه؟", 345, 650, Math.min(at(u, .05, .25), 1 - at(u9, 0, .3)), 34) +
    label(b[0] + 26, b[1], 440, b[1] - 150, "شريط بيربطهم", ORANGE, at(u9, 1.0, .5), 26) +
    inset(470, 620, 96, G('scale(2.2) translate(' + f(-b[0]) + ' ' + f(-b[1]) + ')', placed(hand({ f: { middle: { fold: 1 } }, xray: 1, tend: { band: 1 } }))), at(u9, 1.6, .4));
}, { tr: "in" });
// 10 · the index and little finger have their own extra muscle, so they move freely
shot(10, push(CAM[0], CAM[1] - 40, 1.1, 1.16), function (u, d, t) {
  var own = at(u, .3, .6), li = upDown(u, 1.6, 1.4), lp = upDown(u, 2.6, 1.4);
  var F = { middle: { fold: 1 }, index: { lift: li }, pinky: { lift: lp } };
  var a = hp(TW.index[0] + 14, 190), b = hp(TW.pinky[0] - 12, 190);
  return paper() + table(t) + placed(hand({ f: F, xray: 1, tend: { own: own, col: { index: own > .5 ? "#d7dcb0" : TEND, pinky: own > .5 ? "#d7dcb0" : TEND } } })) +
    label(a[0], a[1], 440, 260, "عضلة لوحدها", OLIVE, at(u, .7, .5), 24) + label(b[0], b[1], 250, 260, "عضلة لوحدها", OLIVE, at(u, 1.0, .5), 24) +
    check(hp(330, 600)[0] + 40, hp(330, 600)[1] - 40, 1, at(u, 2.2, .3), OLIVE) + check(hp(120, 540)[0] - 40, hp(120, 540)[1] - 30, 1, at(u, 3.2, .3), OLIVE);
});
// 11 · when the middle folds it drags the shared tendon toward the tip, and the band locks the ring finger down
shot(11, push(CAM[0], CAM[1] - 30, 1.12, 1.2), function (u, d, t) {
  var fk = at(u, .2, .9), pl = at(u, .7, .6), lk = at(u, 1.6, .3);
  var r = tipOf("ring", {}), m = hp(262, 300);
  return paper() + table(t) + placed(hand({ f: { middle: { fold: fk }, ring: { red: lk * .6 } }, xray: 1, tend: { pull: pl, band: 1, col: { middle: pl > .1 ? ORANGE : TEND, ring: lk > .1 ? ORANGE : TEND } } })) +
    arrow(m[0] + 40, m[1] - 40, m[0] + 40, m[1] + 40 + 6 * Math.sin(t * 6), ORANGE, 6, pl) + lockIcon(r[0], r[1] + 70, lk) + tag("مقفول", r[0] + 10, r[1] + 150, at(u, 1.9, .3), 28, ORANGE);
});
// 12 · send it to a friend: the hand again, the ring finger trying, a phone in the corner
shot(12, push(CAM[0], CAM[1], 1.16, 1.08), function (u, d, t) {
  var r = tipOf("ring", {}), jit = 0.05 * Math.abs(Math.sin(t * 22));
  return paper() + table(t) + placed(hand({ f: { middle: { fold: 1 }, ring: { red: .8, lift: jit } } })) + strain(r[0], r[1] - 10, t, 1) +
    iconBox(500, 230, 130, '<rect x="-30" y="-52" width="60" height="104" rx="10" fill="' + INK + '"/><rect x="-24" y="-42" width="48" height="80" rx="3" fill="#f4ecdb"/><path d="M-12 -6 l14 -14 v8 c14 0 22 8 22 24 c-6 -10 -12 -12 -22 -12 v8 Z" fill="' + ORANGE + '"/>', at(u, .3, .3));
}, { tr: "out" });

// ── opening card and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // the hook: the hand flat, the ring finger glowing and trembling, a question mark over it
  var jit = 0.04 * Math.abs(Math.sin(t * 20)), pulse = .6 + .4 * Math.sin(t * 4);
  var s = G('translate(40 10) scale(.98) rotate(-12 250 300)', hand({ f: { middle: { fold: 1 }, ring: { red: pulse, lift: jit } } }));
  var j = fingerJ("ring", {}), r = hp(j[6][0], j[6][1], { p: [40, 10], s: .98 });
  return s + '<ellipse cx="' + f(r[0]) + '" cy="' + f(r[1] + 6) + '" rx="40" ry="20" fill="none" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(pulse) + '"/>' + T("؟", 520, 160, 120, ORANGE, 800);
};
SCENE.outro = function (svg, u, t) {
  var o = { p: [210, -8], s: .46 };
  var jit = 0.04 * Math.abs(Math.sin(t * 20));
  var s = placed(hand({ f: { middle: { fold: 1 }, ring: { red: .6, lift: jit } }, xray: 1, tend: { band: 1, own: 1, col: { ring: ORANGE } } }), o);
  var m = hp(262, 400, o), r = hp(195, 560, o), b = hp(234, 304, o), ix = hp(296, 200, o);
  return s + callout("1", m[0] + 26, m[1], ease(u / .3)) + callout("2", r[0] - 34, r[1], ease(u / .3 - .5)) + callout("3", b[0] - 40, b[1] - 10, ease(u / .3 - 1)) + callout("4", ix[0] + 40, ix[1], ease(u / .3 - 1.5));
};
