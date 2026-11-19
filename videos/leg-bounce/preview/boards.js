// «ليه بتهز رجلك؟» — preview boards (drawing tests before the voice). Real kinematics of a seated leg bounce:
// the ball of the foot stays on the floor, the calf pulls the heel up (ankle plantar-flexion about the ball),
// the hip stays on the chair, so the knee rises on an arc found by two-bone IK. Anatomy from Gray's-style side views:
// femur, patella, tibia in front, fibula behind it, gastrocnemius over soleus at the back, Achilles to the heel,
// the popliteal artery and vein behind the knee running down as the posterior tibial vessels between bone and calf.
var ART = "#c4503a", VEIN = "#5f8db0", MUSC = "#c9705e", MUSC_D = "#a9564a", INSIDE = "#efcfb9", CHAIR = "#8f7a5c", DESK = "#b08a5e", SOCK = "#e9e2d2";
function rot(p, c, deg) { var a = deg * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k]; }
function nrm(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
function pp(p) { return f(p[0]) + " " + f(p[1]); }
// the seated leg pose: hip on the chair, ball of the foot on the floor; lift 0..1 raises the heel up to 22°
function legPose(hip, ball, s, lift) {
  var th = -22 * lift, ank = rot([ball[0] + 44 * s, ball[1] - 16 * s], ball, th);
  var k1 = ik(hip, ank, HB.thigh * s, HB.shin * s, 1), k2 = ik(hip, ank, HB.thigh * s, HB.shin * s, -1), kn = k1[1] < k2[1] ? k1 : k2;
  return { hip: hip, knee: kn, ank: ank, ball: ball, th: th, s: s };
}
// a shoe in the foot's own frame (origin at the ball, +x toward the heel), turned by the heel lift
function shoe(L, col) {
  var s = L.s, pts = [[-19, 0], [58, 0], [60, -20], [44, -27], [30, -19], [6, -15], [-12, -11]];
  var w = pts.map(function (q) { return rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s], L.ball, L.th); });
  var sole = [[-19, 0], [60, 0], [60, 6], [-17, 6]].map(function (q) { return rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s - 4 * s], L.ball, L.th); });
  return '<path d="M' + w.map(pp).join(" L") + ' Q' + pp(rot([L.ball[0] - 22 * s, L.ball[1] - 6 * s], L.ball, L.th)) + ' ' + pp(w[0]) + ' Z" fill="' + (col || "#3b342d") + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + sole.map(pp).join(" L") + ' Z" fill="#efe9dc" stroke="' + INK + '" stroke-width="1.4"/>' + [[14, -20], [22, -24], [30, -27]].map(function (q) { var a = rot([L.ball[0] + q[0] * s, L.ball[1] + q[1] * s], L.ball, L.th), b = rot([L.ball[0] + (q[0] - 4) * s, L.ball[1] + (q[1] + 6) * s], L.ball, L.th); return '<path d="M' + pp(a) + ' L' + pp(b) + '" stroke="#efe9dc" stroke-width="' + f(1.6 * s) + '" stroke-linecap="round"/>'; }).join("");
}
// the near leg as two tapered trouser segments plus the shoe (same look as fig())
function legFlat(L, op) {
  var s = L.s, sock = add(L.ank, nrm([L.knee[0] - L.ank[0], L.knee[1] - L.ank[1]]), 10 * s);
  var d1 = "M" + pp(L.hip) + " L" + pp(L.knee), d2 = "M" + pp(L.knee) + " L" + pp(sock);
  var g = '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(40 * s) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(29 * s) + '" stroke-linecap="round"/>' +
    '<path d="M' + pp(sock) + ' L' + pp(L.ank) + '" stroke="' + INK + '" stroke-width="' + f(22 * s) + '" stroke-linecap="round"/><path d="M' + pp(sock) + ' L' + pp(L.ank) + '" stroke="' + SOCK + '" stroke-width="' + f(18 * s) + '" stroke-linecap="round"/>' +
    '<path d="' + d1 + '" stroke="' + PANTS + '" stroke-width="' + f(36 * s) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + PANTS + '" stroke-width="' + f(25 * s) + '" stroke-linecap="butt"/>' + shoe(L);
  return op != null ? G("", g, op) : g;
}
function chair(x, fl, s) { var sy = fl - 100 * s; return R(x - 20 * s, sy, 120 * s, 12 * s, CHAIR, 2) + R(x + 88 * s, sy - 190 * s, 12 * s, 190 * s, CHAIR, 2) + R(x - 14 * s, sy + 12 * s, 9 * s, 88 * s, CHAIR, 1.8) + R(x + 86 * s, sy + 12 * s, 9 * s, 88 * s, CHAIR, 1.8); }
function desk(x0, x1, fl, s) { var ty = fl - 172 * s; return R(x0, ty, x1 - x0, 14 * s, DESK, 2.2) + R(x1 - 24 * s, ty + 14 * s, 14 * s, 158 * s, DESK, 2); }
function mug(x, y) { return R(x - 18, y - 40, 36, 40, "#f4ecdb", 2, 3) + P("M" + (x + 18) + " " + (y - 32) + " c16 0 16 22 0 22", "none", 3) + R(x - 15, y - 37, 30, 6, BROWN, 0); }
// a seated person at a desk, near leg drawn by legPose (lift 0..1)
function seated(lift, o) {
  o = o || {}; var s = o.s || 1.3, fl = o.fl || 720, hx = o.x || 420, hip = [hx, fl - 110 * s], ball = [hx - 145 * s, fl];
  var p = fig({ x: hip[0], y: hip[1], s: s, lean: -4, noLeg0: 1, noLeg1: 1, legs: [[0, 0], [86, -84]], hands: [[hx - 150 * s, fl - 178 * s], [hx - 138 * s, fl - 176 * s]], bend: [1, 1], shirt: o.shirt || SHIRT_V });
  var L = legPose(hip, ball, s, lift), ghost = "", farL = legPose([hip[0] + 6 * s, hip[1] - 2 * s], [ball[0] + 34 * s, fl], s, 0);
  if (o.ghost) ghost = legFlat(legPose(hip, ball, s, 0), .28);
  return { svg: floor(fl) + chair(hx - 30 * s, fl, s) + desk(-200, hx - 120 * s, fl, s) + mug(hx - 210 * s, fl - 172 * s) + p.far + G("", legFlat(farL), .9).replace(/#5b5145/g, '#4a4239') + ghost + legFlat(L) + p.body + p.near, L: L, p: p };
}

// ── the leg cut: a close-up of the seated shank and the knee, skin cut open ──
// o: {lift 0..1, sq 0..1 (calf squeeze), pool 0..1 (blood pooled low), flow (phase for dots), hl: "calf"|"vein"|"art"|"valve"}
function legCut(o) {
  o = o || {}; var s = 3, ball = [110, 700], hip = [ball[0] + 145 * 3, ball[1] - 110 * 3], L = legPose(hip, ball, s, o.lift || 0), K = L.knee, A = L.ank, out = "";
  var u = nrm([A[0] - K[0], A[1] - K[1]]), n = [-u[1], u[0]], len = Math.hypot(A[0] - K[0], A[1] - K[1]);   // n points to the back (right)
  if (n[0] < 0) n = [-n[0], -n[1]];
  function S(t, off) { return add(add(K, u, t * len), n, off); }
  var sq = o.sq || 0;
  // outline of the shank: straight shin in front, calf bulge at the back narrowing to the Achilles
  var fr = [[0, -64], [.25, -54], [.6, -44], [.88, -36], [1.02, -34]], bk = [[1.02, 46], [.86, 42], [.7, 62], [.5, 100 + 8 * sq], [.3, 118 + 10 * sq], [.14, 108], [0, 84]];
  var shank = "M" + fr.map(function (q) { return pp(S(q[0], q[1])); }).join(" L");
  bk.forEach(function (q) { shank += " L" + pp(S(q[0], q[1])); });
  // thigh: from the knee to the hip, with the pants on
  var v = nrm([hip[0] - K[0], hip[1] - K[1]]), m = [v[1], -v[0]]; if (m[1] > 0) m = [-m[0], -m[1]];
  function Tg(t, off) { return add(add(K, v, t * 500), m, off); }
  var sil = [Tg(1.2, 104), Tg(.45, 86), Tg(.08, 72), Tg(-.08, 54), Tg(-.15, 14), S(.06, -62)].concat(fr.slice(1).map(function (q) { return S(q[0], q[1]); }))
    .concat(bk.map(function (q) { return S(q[0], q[1]); })).concat([Tg(.14, -84), Tg(.45, -96), Tg(1.2, -104)]);
  var sd = smooth("M" + sil.map(pp).join(" L")) + " Z";
  out += '<path d="' + sd + '" fill="' + INSIDE + '" stroke="' + INK + '" stroke-width="2.6"/><path d="' + sd + '" fill="url(#hatch)" opacity=".6"/>';
  // the skin edge, drawn as a band just inside the outline
  var cid = "lc" + (++CLIPN); out += '<clipPath id="' + cid + '"><path d="' + sd + '"/></clipPath><path d="' + sd + '" fill="none" stroke="' + SKIN + '" stroke-width="22" clip-path="url(#' + cid + ')"/><path d="' + sd + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  // the femur end and the patella (knee cap) in front
  out += P("M" + pp(Tg(1, 26)) + " L" + pp(Tg(.08, 26)) + " Q" + pp(Tg(-.08, 34)) + " " + pp(Tg(-.08, 0)) + " Q" + pp(Tg(-.08, -40)) + " " + pp(Tg(.06, -36)) + " L" + pp(Tg(1, -26)) + " Z", BONE, 2);
  var pat = Tg(-.09, 2); out += '<ellipse cx="' + f(pat[0]) + '" cy="' + f(pat[1]) + '" rx="16" ry="27" transform="rotate(' + f(Math.atan2(u[1], u[0]) * 180 / Math.PI - 90) + ' ' + pp(pat) + ')" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  // tibia (front, thick) and fibula (behind, thin)
  out += P("M" + pp(S(.02, -52)) + " Q" + pp(S(-.02, -14)) + " " + pp(S(.03, 16)) + " L" + pp(S(.15, 2)) + " L" + pp(S(.9, -10)) + " L" + pp(S(.99, -4)) + " L" + pp(S(1.0, -36)) + " L" + pp(S(.9, -34)) + " L" + pp(S(.15, -44)) + " Z", BONE, 2);
  out += P("M" + pp(S(.1, 10)) + " L" + pp(S(.95, 6)) + " L" + pp(S(.95, 16)) + " L" + pp(S(.1, 22)) + " Z", BONE, 1.6);
  // calf muscles: soleus (deep) then gastrocnemius (the bulge) over the vessels' back edge, Achilles to the heel
  var bul = 10 * sq, mcol = o.hl === "calf" ? (sq > .3 ? ORANGE : "#d07a52") : MUSC;
  out += P(smooth("M" + [S(.2, 34), S(.4, 84 + bul * .6), S(.62, 76 + bul * .5), S(.82, 44), S(.78, 34), S(.5, 30), S(.3, 30)].map(pp).join(" L")) + " Z", MUSC_D, 2, ' fill-opacity=".92"');
  out += P(smooth("M" + [S(.0, 62), S(.12, 98), S(.3, 112 + bul), S(.46, 96 + bul * .8), S(.62, 64), S(.7, 50), S(.55, 54), S(.34, 60), S(.14, 56)].map(pp).join(" L")) + " Z", mcol, 2.2);
  for (var j = 0; j < 5; j++) out += '<path d="M' + pp(S(.06 + j * .02, 66 + j * 8)) + ' Q' + pp(S(.3, 74 + j * 8 + bul * .6)) + ' ' + pp(S(.6 - j * .02, 58 + j * 4)) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none" opacity=".8"/>';
  out += P("M" + [S(.6, 46), S(.98, 30), S(1.0, 22), S(.62, 36)].map(pp).join(" L") + " Z", "#e8d9bd", 1.8);
  // vessels behind the bones: artery (red) and the deep vein (blue, wider), down the back of the shank
  var vp = [Tg(.9, -66), Tg(.25, -66), S(-.02, 52), S(.18, 46), S(.5, 42), S(.82, 32), S(.95, 22)];
  var ap = [Tg(.9, -52), Tg(.25, -52), S(-.02, 36), S(.18, 30), S(.5, 28), S(.82, 22), S(.95, 12)];
  var pool = o.pool || 0, veinW = 20 + 6 * pool, vd = "M" + vp.map(pp).join(" L");
  out += P(smooth(vd), "none", veinW + 4, ' stroke-linecap="round"') + '<path d="' + smooth(vd) + '" stroke="' + VEIN + '" stroke-width="' + f(veinW) + '" fill="none" stroke-linecap="round"/>';
  var ad = "M" + ap.map(pp).join(" L");
  out += P(smooth(ad), "none", 13, ' stroke-linecap="round"') + '<path d="' + smooth(ad) + '" stroke="' + ART + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
  // one-way valves in the vein: two cusps pointing up the vein (open lets blood up, closed meets in the middle)
  var VT = [.24, .48, .72]; o.valves = o.valves || [1, 1, 1];
  VT.forEach(function (t, i) {
    var c = along(vp, lerp(.52, .9, (t - .24) / .48)), up = [-u[0], -u[1]], q = n, op = o.valves[i], w = veinW / 2 - 1, gap = lerp(0, w * .8, op);
    [1, -1].forEach(function (sd) { out += '<path d="M' + pp(add(add(c, up, -4), q, sd * w)) + ' Q' + pp(add(add(c, up, 10), q, sd * w * .7)) + ' ' + pp(add(add(c, up, 18), q, sd * gap)) + ' L' + pp(add(add(c, up, 6), q, sd * w)) + ' Z" fill="#eef3f6" stroke="' + INK + '" stroke-width="1.8"/>'; });
  });
  if (o.chev) [.12, .36, .6, .84].forEach(function (k) { var a = along(vp, k), b = along(vp, k - .03), d = nrm([b[0] - a[0], b[1] - a[1]]), q = [-d[1], d[0]];
    out += '<path d="M' + pp(add(add(a, q, 6), d, -2)) + ' L' + pp(add(a, d, 5)) + ' L' + pp(add(add(a, q, -6), d, -2)) + '" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; });
  // blood cells: in the artery going down, in the vein going up (or bunched low when pooling)
  var ph = o.flow || 0;
  for (var i = 0; i < 9; i++) {
    var ka = (i / 9 + ph) % 1, kv = pool > 0 ? .55 + .45 * Math.pow((i / 9 + ph * .15) % 1, .5) : (1 - ((i / 9 + ph * .8) % 1)) * .95;
    var pa = along(ap, ka), pv = along(vp, kv);
    out += '<circle cx="' + f(pa[0]) + '" cy="' + f(pa[1]) + '" r="3.6" fill="#f6d2c4"/>';
    out += '<circle cx="' + f(pv[0]) + '" cy="' + f(pv[1]) + '" r="4.6" fill="#dbe6ee" stroke="' + INK + '" stroke-width=".8"/>';
  }
  // sock, shoe
  out += '<path d="M' + pp(S(.92, -32)) + ' L' + pp(S(.92, 36)) + ' L' + pp(S(1.04, 38)) + ' L' + pp(S(1.04, -34)) + ' Z" fill="' + SOCK + '" stroke="' + INK + '" stroke-width="2"/>';
  out += shoe(L);
  return { svg: out, L: L, S: S, K: K, A: A, u: u, n: n, vp: vp, ap: ap, Tg: Tg };
}
// quadratic smoothing of a polyline path "M x y L x y ..."
function smooth(d) {
  var p = d.replace(/^M/, "").split(" L").map(function (q) { return q.trim().split(" ").map(Number); });
  var s = "M" + pp(p[0]); for (var i = 1; i < p.length - 1; i++) { var m = [(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]; s += " Q" + pp(p[i]) + " " + pp(m); } return s + " L" + pp(p[p.length - 1]);
}

// ── the calf pump close-up: a vein segment between two muscles, two valves ──
function pump(cx, cy, sq, title) {
  var s = "", w = 26 - 12 * sq, top = cy - 190, bot = cy + 190, bul = 26 * sq;
  // muscles either side, bulging into the vein when squeezed
  var mc = sq > .5 ? ORANGE : MUSC;
  s += P("M" + (cx - 40) + " " + top + " C" + (cx - 120 - bul) + " " + (cy - 120) + " " + (cx - 120 - bul) + " " + (cy + 120) + " " + (cx - 40) + " " + bot + " C" + (cx - w - 6 - bul * .5) + " " + (cy + 80) + " " + (cx - w - 6 - bul * .5) + " " + (cy - 80) + " " + (cx - 40) + " " + top + " Z", mc, 2.2);
  s += P("M" + (cx + 40) + " " + top + " C" + (cx + 120 + bul) + " " + (cy - 120) + " " + (cx + 120 + bul) + " " + (cy + 120) + " " + (cx + 40) + " " + bot + " C" + (cx + w + 6 + bul * .5) + " " + (cy + 80) + " " + (cx + w + 6 + bul * .5) + " " + (cy - 80) + " " + (cx + 40) + " " + top + " Z", mc, 2.2);
  for (var j = 0; j < 3; j++) { s += '<path d="M' + (cx - 46 - j * 14) + ' ' + (top + 30) + ' Q' + (cx - 80 - j * 14 - bul) + ' ' + cy + ' ' + (cx - 46 - j * 14) + ' ' + (bot - 30) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none"/>' + '<path d="M' + (cx + 46 + j * 14) + ' ' + (top + 30) + ' Q' + (cx + 80 + j * 14 + bul) + ' ' + cy + ' ' + (cx + 46 + j * 14) + ' ' + (bot - 30) + '" stroke="' + MUSC_D + '" stroke-width="1.3" fill="none"/>'; }
  // the vein, narrowed in the middle when squeezed
  var mw = 26 - 16 * sq;
  s += P("M" + (cx - 26) + " " + (top - 40) + " L" + (cx - 26) + " " + (cy - 110) + " Q" + (cx - mw) + " " + cy + " " + (cx - 26) + " " + (cy + 110) + " L" + (cx - 26) + " " + (bot + 40) + " L" + (cx + 26) + " " + (bot + 40) + " L" + (cx + 26) + " " + (cy + 110) + " Q" + (cx + mw) + " " + cy + " " + (cx + 26) + " " + (cy - 110) + " L" + (cx + 26) + " " + (top - 40) + " Z", VEIN, 2.4);
  // valves: the top one opens when squeezed, the bottom one shuts; relaxed it is the other way round
  function valve(y, open) { var g = open ? 16 : 0; return '<path d="M' + (cx - 26) + ' ' + (y + 6) + ' Q' + (cx - 20) + ' ' + (y - 16) + ' ' + (cx - g) + ' ' + (y - 26) + '" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M' + (cx + 26) + ' ' + (y + 6) + ' Q' + (cx + 20) + ' ' + (y - 16) + ' ' + (cx + g) + ' ' + (y - 26) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>'; }
  s += valve(top - 6, sq > .5) + valve(bot + 6, sq <= .5);
  // blood cells: squeezed out upward, or waiting above the shut bottom valve... (relaxed: filling from below)
  for (var i = 0; i < 7; i++) { var y = sq > .5 ? top - 60 + i * 34 - 20 : bot + 30 - i * 30; s += '<circle cx="' + (cx + ((i % 2) ? 7 : -7)) + '" cy="' + y + '" r="7" fill="#dbe6ee" stroke="' + INK + '" stroke-width="1"/>'; }
  s += arrow(cx, sq > .5 ? top - 30 : bot + 60, cx, sq > .5 ? top - 140 : bot - 40, ORANGE, 4);
  s += T(title, cx, bot + 110, 26, sq > .5 ? ORANGE : INK, 800);
  return s;
}
function tube(x, y, sq) {   // the toothpaste tube analogy (squeezed from the bottom up)
  return G("translate(" + x + " " + y + ")", P("M-20 " + (54 - 30 * sq) + " L-14 -30 L14 -30 L20 " + (54 - 30 * sq) + " Z", "#e9ecea", 2) + R(-8, -46, 16, 16, BLUE, 1.6) + P("M-22 " + (54 - 30 * sq) + " L22 " + (54 - 30 * sq) + " L22 62 L-22 62 Z", "#c8c2b4", 1.6) +
    '<path d="M0 -50 q-10 -16 6 -26" stroke="' + "#f4ecdb" + '" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M0 -50 q-10 -16 6 -26" stroke="' + INK + '" stroke-width="1.4" fill="none"/>');
}

// a bar gauge «قدرة الشريان إنه يوسع»
function gauge(x, y, h, v0, v1, col, txt0, txt1) {
  var s = R(x - 22, y - h, 44, h, "#f4ecdb", 2.2, 4), vmax = 7;
  s += '<path d="M' + (x - 30) + ' ' + f(y - h * v0 / vmax) + ' h60" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 4"/>' + N(txt0, x - 46, y - h * v0 / vmax + 7, 19, MUTE, "end");
  s += R(x - 18, y - h * v1 / vmax, 36, h * v1 / vmax - 4, col, 0, 3) + N(txt1, x + 34, y - h * v1 / vmax + 8, 24, col, "start");
  return s;
}
// a heart in the chest (side view, simple)
function heart(x, y, r) { return P("M" + x + " " + (y + r) + " C" + (x - r * 1.6) + " " + (y - r * .2) + " " + (x - r * .9) + " " + (y - r * 1.3) + " " + x + " " + (y - r * .5) + " C" + (x + r * .9) + " " + (y - r * 1.3) + " " + (x + r * 1.6) + " " + (y - r * .2) + " " + x + " " + (y + r) + " Z", ART, 2.2); }

// ─────────────── the boards ───────────────
var BOARDS = [];
function board(cap, svg) { BOARDS.push({ cap: cap, svg: svg }); }

// 1 · hook: the bounce done right — heel up, toes down, knee on an arc (close crop on the legs)
(function () {
  var a = seated(1, { ghost: 1, s: 2.1, fl: 700, x: 500 }), L0 = legPose(a.L.hip, a.L.ball, a.L.s, 0), L = a.L, s = "";
  s += paper() + a.svg;
  var hc = rot([L.ball[0] + 58 * L.s, L.ball[1] - 2], L.ball, L.th), h0 = [L.ball[0] + 58 * L.s, L.ball[1] - 2];
  s += arrow(L0.knee[0] - 40, L0.knee[1] + 10, L.knee[0] - 40, L.knee[1] - 24, ORANGE, 5) + arrow(h0[0] + 30, h0[1], hc[0] + 30, hc[1] - 18, ORANGE, 5);
  s += label(L.ball[0] - 20, L.ball[1] - 8, 260, 750, "الصوابع ثابتة", OLIVE, 1, 24);
  s += label(hc[0] + 10, hc[1] - 6, 420, 600, "الكعب بيطلع", ORANGE, 1, 24);
  s += label(L.knee[0] - 20, L.knee[1] + 30, 330, 470, "الركبة بتطلع وتنزل", ORANGE, 1, 24);
  board('لو إنت من اللي بيهزّوا <span class="k-o">رجلهم</span> وهمّا قاعدين…', s);
})();
// 1b · the bounce as a strip of 4 poses (the actual motion, ~4 times a second)
(function () {
  var s = paper(), lifts = [0, .5, 1, .5];
  lifts.forEach(function (k, i) {
    var x = 40 + (i % 2) * 300, y = i < 2 ? 0 : 390, sd = seated(k, { s: 1.5, fl: 340, x: 330 }), L0 = legPose(sd.L.hip, sd.L.ball, 1.5, 0), g = sd.svg;
    g += '<path d="M60 ' + f(L0.knee[1] - 18) + ' H280" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="7 6"/>' + arrow(sd.L.knee[0] + 40, L0.knee[1] - 18, sd.L.knee[0] + 40, sd.L.knee[1] - 19, ORANGE, 3, k > .1 ? 1 : 0);
    s += G("translate(" + x + " " + y + ")", '<clipPath id="c' + i + '"><rect x="0" y="40" width="280" height="330"/></clipPath><g clip-path="url(#c' + i + ')">' + g + '</g><rect x="0" y="40" width="280" height="330" fill="none" stroke="' + INK + '" stroke-width="1.6"/>' + callout(String(i + 1), 24, 64, 1));
  });
  board('<span class="k-gr">(حركة الهزة مفصّلة: 4 أوضاع، الحركة كلها من الكاحل)</span>', s);
})();
// 2 · the study: two legs, three hours, the artery's widening
(function () {
  var s = paper();
  function half(y, still) {
    var c = legCut({ lift: still ? 0 : .8, sq: still ? 0 : .8, pool: still ? .8 : 0, flow: .3, hl: still ? "" : "calf" });
    var g = '<clipPath id="h' + y + '"><rect x="20" y="' + y + '" width="600" height="360"/></clipPath><g clip-path="url(#h' + y + ')">' + G("translate(30 " + (y - 70) + ") scale(.5)", c.svg) + '</g>';
    g += '<rect x="20" y="' + y + '" width="600" height="360" fill="none" stroke="' + INK + '" stroke-width="1.8"/>';
    g += tag(still ? "رجل ثابتة" : "رجل بتتهز", 470, y + 54, 1, 24, still ? ORANGE : OLIVE);
    g += T("قدرة الشريان إنه يوسع", 470, y + 330, 17, INK, 700);
    g += gauge(470, y + 300, 200, still ? 4.5 : 3.7, still ? 1.6 : 6.6, still ? ORANGE : OLIVE, still ? "4.5%" : "3.7%", still ? "1.6%" : "6.6%");
    g += still ? cross(560, y + 120, .7, 1) : check(560, y + 120, .8, 1, OLIVE);
    return g;
  }
  s += half(20, 1) + half(400, 0) + G("translate(320 395)", C(0, 0, 36, "#f4ecdb", 2.4) + '<path d="M0 0 V-24 M0 0 L18 10" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>') + numBox("3 ساعات", 210, 400, 1, 20);
  board('الرجل الثابتة… الشريان بتاعها خسر حوالي <span class="k-o">تلتين</span> قدرته إنه يوسع.', s);
})();
// 3 · heart up there, feet down here: the loop and the distance
(function () {
  var a = seated(0, { s: 1.15, fl: 740, x: 380 }), s = paper() + a.svg, hp = a.p.at(92, 14);
  s += heart(hp[0], hp[1], 16);
  var L = a.L, art = "M" + pp(hp) + " Q" + pp(a.p.at(20, 4)) + " " + pp(L.hip) + " L" + pp(L.knee) + " L" + pp(add(L.ank, [0, -1], 10));
  s += '<path d="' + art + '" stroke="' + ART + '" stroke-width="5" fill="none" stroke-dasharray="10 8"/>';
  s += arrow(L.knee[0] - 26, L.knee[1] + 20, L.ank[0] - 26, L.ank[1] - 50, ART, 4);
  s += measure(600, hp[1], 600, 740, 1, "", 30) + T("حوالي متر", 585, (hp[1] + 740) / 2, 26, ORANGE, 800, "start");
  s += label(hp[0] + 4, hp[1], 470, 300, "القلب", ART, 1, 24) + label(L.ank[0], L.ank[1] - 30, 70, 600, "الرجل", INK, 1, 22);
  board('قلبك فوق في صدرك… ورجلك تحت، على بعد <span class="k-o">حوالي متر</span>.', s);
})();
// 4 · the cut: sitting still, the blood pools low
(function () {
  var c = legCut({ lift: 0, sq: 0, pool: 1, flow: .2, valves: [0, 0, 0] }), s = paper() + c.svg;
  var lo = c.S(.86, 30);
  s += '<ellipse cx="' + f(lo[0]) + '" cy="' + f(lo[1]) + '" rx="46" ry="70" fill="' + VEIN + '" opacity=".25"/>';
  s += arrow(560, 360, 560, 650, VEIN, 5) + T("الجاذبية", 590, 500, 22, BLUE, 800, "start");
  s += label(c.S(.2, 46)[0], c.S(.2, 46)[1], 500, 250, "الوريد", BLUE, 1, 24) + label(c.S(.3, 36)[0], c.S(.3, 36)[1], 500, 310, "الشريان", ART, 1, 22);
  s += label(lo[0], lo[1], 400, 740, "الدم بيتجمّع هنا", BLUE, 1, 22);
  board('لما بتقعد ثابت فترة طويلة… الدم <span class="k-b">بيتجمّع</span> تحت، في رجلك.', s);
})();
// 5 · the calf muscle, named
(function () {
  var c = legCut({ lift: .8, sq: 1, flow: .5, hl: "calf", valves: [1, 1, 1], chev: 1 }), s = paper() + c.svg, m = c.S(.3, 88);
  s += label(m[0], m[1], 430, 200, "عضلة السمانة", OLIVE, 1, 26) + label(c.S(.48, 39)[0], c.S(.48, 39)[1], 400, 520, "صمام بيفتح لفوق بس", BLUE, 1, 20);
  board('<span class="k-g">عضلة السمانة.</span> الأوردة العميقة معدّية جوّاها، وجواها <span class="k-b">صمامات</span>.', s);
})();
// 6 · the pump, relaxed vs squeezed, with the toothpaste tube
(function () {
  var s = paper() + pump(170, 380, 0, "مرتخية") + pump(470, 380, 1, "منقبضة");
  s += iconBox(560, 86, 120, G("translate(0 6) scale(.9)", tube(0, 0, .6)), 1);
  board('كل ما السمانة <span class="k-o">تنقبض</span>… بتعصر الوريد، فالدم يطلع لفوق.', s);
})();
