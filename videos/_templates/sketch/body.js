/* «اسكتش» — shared body drawings: the HAND RIG and PEOPLE. build.py puts this file after _helpers.js and before the
   episode's shots.js (CFG "parts", default ["body"]), so every name here is in scope for the shots.
   Locked by the user after «ليه صوابعك بتطقطق؟» (videos/knuckles): every hand in every sketch episode is drawn with this rig,
   never a mitten or a simple outline, and a hand doing something (cracking, pressing, folding, pointing at a detail) is
   shown FROM ABOVE in close-up, not from the side.
   - HAND(x, y, s, rot, o, mirror): the right hand from «ليه البنصر مش بيترفع؟» (videos/finger-stuck), approved by the user:
     three phalanges per finger, joints wider than the shafts, nails on the distal half, knuckle wrinkles, a shaded side and
     a lit ridge, knuckle domes, tendon lines and web shadows on the back, contact shadows. (x, y) is the middle of the hand,
     rot 0 = fingers toward you (down the screen), 180 = fingers up; mirror = the left hand.
     o = {f: {thumb|index|middle|ring|pinky: {lift, fold, pull, red}}, xray 0..1 + tend {...} (extensor tendons),
          bones 0..1 (the skeleton laid over it, reference v07), hl: finger (orange ring on its knuckle), sleeve: colour}
   - HP(x, y, s, rot, px, py, mirror): where a rig point (hand units) lands on the panel, for labels, bursts and arrows.
   - fingerJ(k, q), thumbJ(q), drawFinger(joints), drawFolded(...): one finger on its own (to lay a finger over another hand).
   - interlaced(cx, cy, s, kin, push): both hands from above, fingers interlaced, coming together (kin) and pushed (push).
   - fig({x, y (hip joint), s, lean, shirt, hair, legs, hands, bend, tilt}): a flat side-view person facing left with real
     body proportions (Drillis & Contini), from «لو حد شرق قدامك» (videos/choking). whole(fig) draws it; rel(h, side) puts
     a hand on the body; sitter(), chair(), desk(), floor() for a seated person; burst() for a crack or a hit.
   Check every pose in a frame strip before rendering, and show the user the drawings before any render. */
var BONEC = "#f7f1e3", SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", WOODC = "#a9784d";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }

// ── the hand rig ──
var LIT = "#efc0a4", NAIL = "#efcdb9", TENDR = "#f4eee2";

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
function fingerJ(k, q) { var g = FG[k], pl = q.pull || 0, r = g[2] * Math.PI / 180; return joints(g[0] + Math.sin(r) * pl, g[1] + Math.cos(r) * pl, g[2], g[3], g[4], q.lift || 0, BEND[k], q.fold || 0); }
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
  // every finger: straight, folding, or folded under (the bent knuckle facing the camera)
  ["pinky", "ring", "middle", "index"].forEach(function (k) {
    var fk = clamp((((F[k] || {}).fold || 0) - .45) / .4), g = FG[k];
    if (fk > 0) skin += G("", drawFolded(g[0], g[1], g[2], g[3][0] * .66, g[4][0] * 1.05), fk);
    if (fk < 1) skin += G("", drawFinger(J[k], F[k]), 1 - fk);
  });
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
  if (o.bones) s += '<g opacity="' + f(o.bones) + '">' + rigBones(J, F) + '</g>';
  if (o.hl) { var hg = FG[o.hl], hq = (F[o.hl] || {}).pull || 0; s += '<ellipse cx="' + f(hg[0]) + '" cy="' + f(hg[1] - 6 + hq / 2) + '" rx="' + f(hg[4][0] * .62) + '" ry="' + f(22 + hq / 2) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>'; }
  // sleeve cuff (always on top: the tendons run in from under it)
  s += '<path d="M136 74 L362 74 L358 128 C298 138 206 138 144 128 Z" fill="' + (o.sleeve || BLUE) + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
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
    var p = tendonPts(k, J, F), c = col[k] || TENDR;
    s += sline(p, INK, 10) + sline(p, c, 6);
  });
  // the band (juncturae tendinum) between the ring and middle tendons, just above the knuckles
  var by = 300 + 14 * pull, b1 = [210, by + 2], b2 = [258, by + 6];
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>';
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + (o.band ? ORANGE : "#e3cdb6") + '" stroke-width="10" stroke-linecap="round"/>';
  return s;
}
// the bones laid over the rig (reference v07): carpals under the cuff, a metacarpal to each knuckle, three phalanges per finger
function rigBones(J, F) {
  var s = "";
  function bone(p, q, w) { return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round"/><path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + BONEC + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
    '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="' + f(w * .62) + '" ry="' + f(w * .5) + '" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function toward(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  [[196, 150, 15, 11], [226, 146, 15, 12], [256, 147, 15, 12], [286, 152, 14, 11], [204, 176, 15, 11], [234, 178, 15, 12], [264, 178, 14, 11], [292, 182, 14, 12]].forEach(function (c, i) {
    s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '" transform="rotate(' + (i * 23 % 40 - 20) + ' ' + c[0] + ' ' + c[1] + ')" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="1.8"/>'; });
  var base = { pinky: [196, 196], ring: [222, 198], middle: [250, 198], index: [280, 196] };
  ["pinky", "ring", "middle", "index"].forEach(function (k) {
    var j = J[k], q = F[k] || {}, g = FG[k];
    if ((q.fold || 0) > .45) { s += bone(base[k], [g[0], g[1] - 8], 18); return; }
    s += bone(base[k], toward(base[k], [j[0][0], j[0][1]], .94), 18);
    s += bone(toward([j[0][0], j[0][1]], [j[2][0], j[2][1]], .08), toward([j[0][0], j[0][1]], [j[2][0], j[2][1]], .92), 16);
    s += bone(toward([j[2][0], j[2][1]], [j[4][0], j[4][1]], .1), toward([j[2][0], j[2][1]], [j[4][0], j[4][1]], .9), 14);
    s += bone(toward([j[4][0], j[4][1]], [j[6][0], j[6][1]], .12), toward([j[4][0], j[4][1]], [j[6][0], j[6][1]], .78), 12);
  });
  var T = thumbJ((F.thumb) || {});
  s += bone([300, 186], toward([300, 186], [T[0][0], T[0][1]], .9), 18) + bone(toward([T[0][0], T[0][1]], [T[4][0], T[4][1]], .1), toward([T[0][0], T[0][1]], [T[4][0], T[4][1]], .88), 16) + bone(toward([T[4][0], T[4][1]], [T[6][0], T[6][1]], .14), toward([T[4][0], T[4][1]], [T[6][0], T[6][1]], .75), 13);
  return s;
}
// place the rig: (x, y) = the middle of the hand, s scale, rot (0 = fingers down toward you, 180 = fingers up), mirror = the left hand
function HAND(x, y, s, rot, o, mirror) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f((mirror ? -1 : 1) * s) + " " + f(s) + ") translate(-250 -350)", hand(o || {})); }
// a panel point for a rig point
function HP(x, y, s, rot, px, py, mirror) { var a = (rot || 0) * Math.PI / 180, dx = (px - 250) * s * (mirror ? -1 : 1), dy = (py - 350) * s; return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)]; }

// ── people: flat side-view figures facing left, real proportions (Drillis & Contini; see videos/choking/sketch/shots.js) ──
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]], toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1]], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>');
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y) { return '<path d="M-400 ' + y + ' H1040" stroke="' + INK + '" stroke-width="2.4"/>' + R(-400, y, 1440, 300, "#e3d7bd", 0) + '<rect x="-400" y="' + y + '" width="1440" height="300" fill="url(#hatch)" opacity=".35"/>'; }
// a chair (seat 0.25H = 100 above the floor) and a desk (0.43H = 172), side view; x = front edge of the seat
function chair(x, fl) { return R(x, fl - 106, 96, 12, WOODC, 2) + R(x + 84, fl - 250, 12, 144, WOODC, 2) + R(x + 6, fl - 94, 9, 94, "#7c5434", 1.8) + R(x + 80, fl - 94, 9, 94, "#7c5434", 1.8); }
function desk(x, w, fl) { return R(x, fl - 178, w, 12, WOODC, 2) + R(x + 10, fl - 166, 10, 166, "#7c5434", 1.8) + R(x + w - 20, fl - 166, 10, 166, "#7c5434", 1.8); }
// a seated man facing left at chair front x; shake: knee bounce 0..1; hands: two targets
function sitter(x, fl, hands, shake, opt) {
  opt = opt || {}; var hip = [x + 30, fl - 112], th = 90 + 5 * (shake || 0);
  return fig({ x: hip[0], y: hip[1], lean: opt.lean || 4, shirt: opt.shirt || SHIRT_V, hands: hands, bend: opt.bend || [-1, -1], legs: [[th, -th + 4], [88, -86]] });
}
// sound burst lines ("طق") at (x, y); k 0..1 life
function burst(x, y, k, sz, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = (sz || 30) * (0.5 + k), s = ""; for (var i = 0; i < 9; i++) { var a = i * Math.PI * 2 / 9 + .3; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4.5" stroke-linecap="round"/>'; } return G("", s, 1 - k * k); }
function speaker(x, y, sc, on, t) { var s = '<path d="M-30 -14 H-12 L10 -34 V34 L-12 14 H-30 Z" fill="' + INK + '"/>'; if (on) for (var i = 0; i < 3; i++) s += '<path d="M' + (20 + i * 14) + ' -' + (16 + i * 9) + ' q' + (10 + i * 4) + ' ' + (16 + i * 9) + ' 0 ' + (32 + i * 18) + '" stroke="' + INK + '" stroke-width="4" fill="none" opacity="' + f(.5 + .5 * Math.sin(t * 6 - i)) + '"/>'; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }

// both hands from above, fingers interlaced (the left hand's middle and little fingers lie over the right hand), as in the
// «ليه صوابعك بتطقطق؟» hook. kin 0..1 brings them together, push 0..1 moves the pair forward (up the screen).
function interlaced(cx, cy, s, kin, push) {
  var gap = lerp(176, -100, kin) * s, R0 = [cx + 140 * s + gap, cy - 95 * push], L0 = [cx - 140 * s - gap, cy - 95 * push], rr = 132, rl = 228;
  function tf(c, rot, m) { return "translate(" + f(c[0]) + " " + f(c[1]) + ") rotate(" + rot + ") scale(" + f((m ? -1 : 1) * s) + " " + f(s) + ") translate(-250 -350)"; }
  return HAND(L0[0], L0[1], s, rl, {}, true) + HAND(R0[0], R0[1], s, rr, {}) + G(tf(L0, rl, true), drawFinger(fingerJ("middle", {})) + drawFinger(fingerJ("pinky", {})));
}
