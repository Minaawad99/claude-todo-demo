// ── «ليه جسمك بيتنفض وإنت بتنام؟» (hypnic jerk) — shots. People from the shared person kit (videos/_templates/people/person.js).
// References: v04 (head cut from the side, the brain inside), v11 (the cut brain and its «gate» switch, the bedroom), v20 (a
// body with its nerve line from the brain down the spine). Camera: the «طب إزاي؟» move — dead still, then an eased ~1.8 s fly.
var SKN = "#e3b49a", SKND = "#c98f73", BRAIN = "#dfaa98", BRAIND = "#b97e6c", STEM = "#d29a86", BONEC = "#efe4cc",
    WOODC = "#a9784d", WOODD = "#7c5434", SHEET = "#eef0ea", MATT = "#d9dde0", NIGHT = "#33475c", PILLOWC = "#f2ead8", NERVE = "#e6cf9a";
function sp(pts, close) {   // a smooth line through the points (Catmull-Rom)
  var n = pts.length, d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 0; i < (close ? n : n - 1); i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (!close) { p0 = pts[Math.max(0, i - 1)]; p3 = pts[Math.min(n - 1, i + 2)]; }
    d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
  }
  return d + (close ? " Z" : "");
}
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function blink(t, ph) { return Math.sin(t * 1.9 + (ph || 0)) > .985 ? .05 : 1; }
// a jolt envelope: 0 → 1 in 0.07 s, back to 0 over 0.55 s
function jolt(u, t0) { var x = u - t0; if (x < 0) return 0; if (x < .07) return x / .07; return Math.max(0, 1 - (x - .07) / .55); }
function ticks(x, y, r, k, col) {   // shock marks round a point
  if (k <= .05) return ""; var s = ""; for (var i = 0; i < 5; i++) { var a = -Math.PI * .9 + i * Math.PI * .45 / 1, r1 = r, r2 = r + 18 * k; s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round" opacity="' + f(k) + '"/>'; }
  return s;
}
function zzz(x, y, t, sz) { sz = sz || 30; var s = ""; for (var i = 0; i < 3; i++) { var p = (t * .45 + i / 3) % 1; s += G("", N("z", x + p * 40 + i * 4, y - p * 90, sz * (.6 + .5 * p), BLUE), Math.sin(p * Math.PI)); } return s; }
function heart(x, y, sc, b) { b = 1 + .12 * (b || 0); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc * b) + ")", '<path d="M0 26 C-30 4 -34 -12 -24 -22 C-14 -32 -2 -26 0 -16 C2 -26 14 -32 24 -22 C34 -12 30 4 0 26 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-16 -12 q4 -6 10 -4" stroke="#f3c3a8" stroke-width="3" fill="none" stroke-linecap="round"/>'); }
function beat(t, bpm) { var p = (t * bpm / 60) % 1; return p < .12 ? Math.sin(p / .12 * Math.PI) : p > .22 && p < .32 ? .6 * Math.sin((p - .22) / .1 * Math.PI) : 0; }
function chip(txt, x, y, col, k, sz) { k = pop(k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .95) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6"/>' + T(txt, 0, sz * .38, sz, "#fbf8f1", 800)); }

// ── the bedroom from the side: night window, the bed (head to the left), the sleeper on his back ──
function room(t) {
  var s = paper();
  s += R(380, 120, 200, 170, NIGHT, 3) + '<path d="M480 120 V290 M380 205 H580" stroke="' + INK + '" stroke-width="3"/>';
  s += '<circle cx="530" cy="160" r="20" fill="#efe6c8"/><circle cx="540" cy="153" r="17" fill="' + NIGHT + '"/>';
  [[410, 150], [450, 240], [420, 255], [545, 250], [505, 225]].forEach(function (p, i) { var k = .55 + .45 * Math.sin(t * 2 + i * 1.7); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(2 + 1.4 * k) + '" fill="#f3ecd2" opacity="' + f(k) + '"/>'; });
  s += R(372, 286, 216, 12, "#d8ccae", 2);                                                                // sill
  s += '<path d="M-200 660 H840" stroke="' + INK + '" stroke-width="2.6"/>' + R(-200, 660, 1040, 300, "#e3d7bd", 0) + '<rect x="-200" y="660" width="1040" height="300" fill="url(#hatch)" opacity=".3"/>';
  return s;
}
var BED = { x0: 40, x1: 610, top: 520 };
function bedBack() {   // headboard and the far part of the frame, drawn before the sleeper
  return R(28, 380, 26, 280, WOODC, 2.4, 4) + R(22, 372, 38, 16, WOODD, 2.2, 4) + R(596, 470, 22, 190, WOODC, 2.4, 4) + R(590, 462, 34, 14, WOODD, 2.2, 4) +
    R(54, BED.top, 542, 56, MATT, 2.4, 10) + '<path d="M60 ' + (BED.top + 22) + ' H590" stroke="#b9c0c4" stroke-width="2" stroke-dasharray="10 8"/>' +
    R(54, BED.top + 56, 542, 30, WOODC, 2.4) + R(66, BED.top + 86, 16, 54, WOODD, 2) + R(568, BED.top + 86, 16, 54, WOODD, 2) +
    '<path d="M54 ' + BED.top + ' h542" stroke="' + INK + '" stroke-width="2.4"/>' +
    sp([[70, 500], [100, 478], [160, 474], [196, 486], [200, 512], [150, 522], [86, 522]], true).replace(/^/, '<path d="') + '" fill="' + PILLOWC + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    sp([[470, 520], [480, 496], [560, 492], [590, 504], [592, 524]], false).replace(/^/, '<path d="') + '" fill="#8aa0ae" stroke="' + INK + '" stroke-width="2.2"/>';   // the folded blanket at the foot
}
// the sleeper. o: {eyes, j (jolt 0..1), relax 0..1, k (shift), brows, mouth}. Returns {svg, J}
var SLP = { x: 330, y: 496, s: .84 };
function sleeper(t, o) {
  o = o || {}; var j = o.j || 0, rl = o.relax == null ? 1 : o.relax, br = (Math.sin(t * 1.5) + 1) / 2;
  var P = PERSON.side({ x: SLP.x, y: SLP.y - 10 * j, s: SLP.s, dir: 1, rot: -90, outfit: { base: "home", colors: { shirt: "#7f9bb6", shirtD: "#617d98", pants: "#56667a", pantsD: "#435266" } }, breath: br,
    legs: [{ hip: 6 + 24 * j - 4 * (1 - rl), knee: 6 + 34 * j, ankle: -14 + 10 * j }, { hip: 2 + 12 * j, knee: 4 + 18 * j, ankle: -10 }],
    arms: [{ sh: 14 + 34 * j - 6 * (1 - rl), el: 16 + 26 * j + 10 * (1 - rl), hand: j > .3 ? "open" : "relaxed" }, { sh: 8 + 22 * j, el: 10 + 18 * j, hand: "relaxed" }],
    head: { tilt: -6 * j },
    face: { eyes: o.eyes == null ? 0 : o.eyes, brows: o.brows || (j > .2 ? "raised" : "neutral"), mouth: o.mouth || (j > .2 ? "o" : "neutral") } });
  return { svg: P.svg, J: Object.assign({ hip: [SLP.x, SLP.y - 10 * j] }, P.joints) };
}
function bedScene(t, o) {
  o = o || {}; var p = sleeper(t, o), s = room(t) + bedBack() + p.svg;
  if (o.zz) s += zzz(p.J.head[0] + 30, p.J.head[1] - 60, t, 28);
  if (o.j > .15) s += ticks(p.J.ankle[0], p.J.ankle[1], 26, o.j) + ticks(p.J.wrist[0], p.J.wrist[1], 22, o.j) + ticks(p.J.knee[0], p.J.knee[1], 24, o.j);
  return { svg: s, J: p.J };
}
// the nerve line: brainstem → spine → hip → knee → ankle, and a branch down the arm; a pulse runs along it (k 0..1)
function nervePath(J) {
  var sh = L2(J.hip, J.head, .74), neck = L2(J.hip, J.head, .86);
  return { leg: [J.head, neck, sh, J.hip, J.knee, J.ankle], arm: [sh, J.elbow, J.wrist] };
}
function polyD(p) { return p.map(function (q, i) { return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" "); }
function nerves(J, k, glow, t) {
  var n = nervePath(J), s = "";
  s += '<path d="' + polyD(n.leg) + '" stroke="' + NERVE + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="' + polyD(n.arm) + '" stroke="' + NERVE + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>';
  if (k > 0) {
    s += draw(polyD(n.leg), k, ORANGE, 7) + draw(polyD(n.arm), clamp(k * 1.6 - .6), ORANGE, 5);
    if (k < 1) { var tip = along(n.leg, k); s += '<circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="11" fill="#f6c26b" stroke="' + ORANGE + '" stroke-width="3"/>'; }
  }
  if (glow) n.leg.concat(n.arm).forEach(function (q, i) { if (i) s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(6 + 4 * Math.sin(t * 8 + i)) + '" fill="' + ORANGE + '" opacity=".55"/>'; });
  return s;
}
function along(pts, k) { var L = [0], i; for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); var d = k * L[L.length - 1]; for (i = 1; i < pts.length; i++) if (d <= L[i]) return L2(pts[i - 1], pts[i], (d - L[i - 1]) / (L[i] - L[i - 1] || 1)); return pts[pts.length - 1]; }

// ── the head cut from the side (v04 / v11): skin, skull, cerebrum with folds, cerebellum, brainstem down into the neck ──
var HEADO = [[-62, 230], [-78, 150], [-110, 86], [-128, 12], [-128, -60], [-105, -125], [-55, -168], [15, -180], [80, -160], [122, -112], [138, -55], [142, -18], [151, 10], [148, 26], [170, 62], [162, 73], [147, 77], [152, 92], [143, 100], [149, 112], [141, 123], [134, 141], [108, 154], [80, 154], [70, 168], [68, 230]];
var BRO = [[-110, -10], [-114, -70], [-86, -126], [-30, -156], [35, -159], [92, -129], [120, -76], [124, -30], [112, 2], [70, 14], [24, 10], [-20, 20], [-62, 24], [-98, 16]];
var SW = { wake: [-22, 66], sleep: [26, 4] };   // the two switches: brainstem (wake), hypothalamus (sleep)
function folds() {
  var s = ""; for (var i = 0; i < 26; i++) { var x = -95 + hash(i) * 200, y = -140 + hash(i + 40) * 140, a = hash(i + 80) * 6.28, l = 26 + hash(i + 9) * 26;
    s += '<path d="M' + f(x) + ' ' + f(y) + ' q' + f(Math.cos(a) * l * .5 + 8) + ' ' + f(Math.sin(a) * l * .5 - 10) + ' ' + f(Math.cos(a) * l) + ' ' + f(Math.sin(a) * l) + ' t' + f(Math.cos(a + .6) * l * .7) + ' ' + f(Math.sin(a + .6) * l * .7) + '" stroke="' + BRAIND + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
  return s;
}
var FOLDS = null;
// headCut(cx, cy, sc, o): o.stem (0..1 olive sweep on the brainstem), o.wake / o.sleep (0..1 how lit), o.spark (0..1), o.pulse (0..1 down the stem), o.lev (0 = wake on .. 1 = sleep on)
function headCut(cx, cy, sc, o, t) {
  o = o || {}; FOLDS = FOLDS || folds();
  var s = '<path d="' + sp(HEADO, true) + '" fill="' + SKN + '" stroke="' + INK + '" stroke-width="3"/>';
  s += '<path d="' + sp([[-128, -20], [-122, 60], [-96, 110], [-80, 160]], false) + '" stroke="' + SKND + '" stroke-width="16" fill="none" opacity=".45" stroke-linecap="round"/>';
  s += '<path d="' + sp(BRO.map(function (p) { return [p[0] * 1.09 + 2, (p[1] + 60) * 1.09 - 62]; }), true) + '" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="' + sp([[-6, 0], [-14, 40], [-26, 90], [-34, 150], [-38, 240]], false) + '" stroke="' + INK + '" stroke-width="33" fill="none" stroke-linecap="round"/><path d="' + sp([[-6, 0], [-14, 40], [-26, 90], [-34, 150], [-38, 240]], false) + '" stroke="' + STEM + '" stroke-width="27" fill="none" stroke-linecap="round"/>';
  if (o.stem) s += sweep(-70, -10, 80, 260, o.stem, "d", '<path d="' + sp([[-6, 0], [-14, 40], [-26, 90], [-34, 150], [-38, 240]], false) + '" stroke="#9aa86e" stroke-width="27" fill="none" stroke-linecap="round"/>');
  s += '<ellipse cx="-70" cy="40" rx="44" ry="27" fill="#cf9c88" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i < 4; i++) s += '<path d="M' + (-108 + i * 4) + ' ' + (28 + i * 7) + ' Q-70 ' + (14 + i * 9) + ' ' + (-32 - i * 3) + ' ' + (30 + i * 7) + '" stroke="' + BRAIND + '" stroke-width="1.8" fill="none"/>';
  var id = "brc" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + sp(BRO, true) + '"/></clipPath><path d="' + sp(BRO, true) + '" fill="' + BRAIN + '" stroke="' + INK + '" stroke-width="2.8"/><g clip-path="url(#' + id + ')">' + FOLDS + '</g>';
  s += '<path d="' + sp([[-60, 6], [-40, -24], [10, -30], [50, -14], [60, 6]], false) + '" stroke="' + INK + '" stroke-width="2" fill="#e9c3b2"/>';   // the middle (corpus callosum curve)
  if (o.pulse > 0 && o.pulse < 1) { var q = along([[-6, 0], [-14, 40], [-26, 90], [-34, 150], [-38, 240]], o.pulse); s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="14" fill="#f6c26b" stroke="' + ORANGE + '" stroke-width="3"/>'; }
  s += toggle(SW.wake[0], SW.wake[1], 15, o.wake || 0, ORANGE, t) + toggle(SW.sleep[0], SW.sleep[1], 15, o.sleep || 0, BLUE, t);
  if (o.spark) s += spark(-2, 36, o.spark, t);
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(sc) + ")", s);
}
// a little switch: a ring with a lamp core; k = how lit
function toggle(x, y, r, k, col, t) {
  return (k > 0 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (1.6 + .25 * Math.sin(t * 5))) + '" fill="' + col + '" opacity="' + f(.3 * k) + '"/>' : "") +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .6) + '" fill="' + col + '" opacity="' + f(.15 + .85 * k) + '"/>';
}
function spark(x, y, k, t) {
  if (k <= 0) return ""; var s = ""; for (var i = 0; i < 7; i++) { var a = i / 7 * 6.28 + t * 3, r1 = 10, r2 = 20 + 14 * hash(i + Math.floor(t * 12)); s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/>'; }
  return G("", s + '<path d="M' + (x - 6) + ' ' + (y - 12) + ' l8 9 l-6 3 l8 10" stroke="#e9b949" stroke-width="4" fill="none" stroke-linejoin="round"/>', k);
}

// ── the switch panel close-up: two big rocker switches tied by one bar (only one can be on), a lamp over each ──
// lev: 0 = wake on, 1 = sleep on (in between = the hand-over); shake: jitter of the bar; both: show both on (the impossible case)
function panel(cx, cy, lev, t, o) {
  o = o || {}; var sh = o.shake ? o.shake * 7 * Math.sin(t * 47) : 0, s = "";
  s += R(-230, -170, 460, 340, "#e9dfc7", 3, 18) + R(-214, -154, 428, 308, "none", 1.4, 12);
  [[-110, ORANGE, "صحيان", 1 - lev], [110, BLUE, "نوم", lev]].forEach(function (q) {
    var x = q[0], on = o.both ? 1 : q[3], fl = o.flicker ? (.5 + .5 * Math.sin(t * 31 + x)) : 1;
    s += (on > .05 ? '<circle cx="' + x + '" cy="-92" r="' + f(42 + 4 * Math.sin(t * 4)) + '" fill="' + q[1] + '" opacity="' + f(.28 * on * fl) + '"/>' : "") +
      '<circle cx="' + x + '" cy="-92" r="26" fill="' + (on > .5 ? q[1] : "#f4ecdb") + '" stroke="' + INK + '" stroke-width="2.6" opacity="1"/>' +
      (on > .05 ? '<circle cx="' + x + '" cy="-92" r="26" fill="' + q[1] + '" opacity="' + f(on * fl) + '"/>' : "") +
      '<path d="M' + (x - 8) + ' -66 v-6 M' + (x + 8) + ' -66 v-6" stroke="' + INK + '" stroke-width="2"/>' +
      R(x - 52, -20, 104, 130, "#f4ecdb", 2.6, 10) + T(q[2], x, 150, 30, q[1], 800);
    var a = (q[3] - .5) * 2 * 24 + (q === undefined ? 0 : 0);   // rocker tilt
    s += G("translate(" + x + " 45) rotate(" + f(-a) + ")", R(-34, -46, 68, 92, on > .5 ? q[1] : "#cfc6b0", 2.6, 8) + '<path d="M-26 -30 h52" stroke="#fbf8f1" stroke-width="3" opacity=".6"/>');
  });
  // the bar that ties them: a see-saw over the middle
  var ba = (lev - .5) * 2 * 14 + sh;
  s += G("translate(0 -30) rotate(" + f(ba) + ")", R(-150, -7, 300, 14, INK, 0, 7)) + '<path d="M-14 -16 L0 -38 L14 -16 Z" fill="' + KHAKI + '" stroke="' + INK + '" stroke-width="2" transform="translate(0 30) rotate(180 0 -27)"/>' + C(0, -30, 8, KHAKI, 2);
  return G("translate(" + f(cx) + " " + f(cy) + ")", s);
}

// ── the factory shift change (the analogy): a factory door, one worker walks out, the next walks in ──
function factory(u, t, k) {
  var s = paper() + '<path d="M-200 600 H840" stroke="' + INK + '" stroke-width="2.6"/>' + R(-200, 600, 1040, 300, "#e3d7bd", 0);
  s += R(170, 260, 300, 340, "#d8c8a8", 2.6) + '<path d="M170 260 L220 200 L270 260 L320 200 L370 260 L420 200 L470 260" fill="#c4b08a" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' + R(410, 140, 34, 100, "#b49a72", 2.4);
  for (var i = 0; i < 3; i++) s += G("", '<circle cx="' + f(427 + 10 * Math.sin(t + i)) + '" cy="' + f(126 - ((t * 20 + i * 30) % 90)) + '" r="' + f(12 + ((t * 20 + i * 30) % 90) / 8) + '" fill="#d6d1c4" stroke="' + INK + '" stroke-width="1.4"/>', 1 - ((t * 20 + i * 30) % 90) / 90);
  s += R(270, 430, 100, 170, "#5a4a3a", 2.6) + R(200, 300, 60, 50, "#b9c9cc", 2.2) + R(380, 300, 60, 50, "#b9c9cc", 2.2) + tag("المصنع", 320, 330, 1, 20, OLIVE);
  // the wake worker walks out to the left, the sleep worker walks in from the right
  var x1 = lerp(330, 60, at(u, .2, 2.6)), x2 = lerp(620, 360, at(u, .6, 2.6));
  var w1 = PERSON.side(Object.assign({ x: x1, s: .55, dir: -1, outfit: { base: "worker", colors: { vest: ORANGE, vestD: "#97411f" } }, breath: .5, face: { eyes: blink(t), mouth: "smile" } }, PERSON.walkPose(t * 6, x1 > 61 ? 1 : 0)));
  w1 = PERSON.side(Object.assign({ x: x1, y: PERSON.sideHipY(Object.assign({ x: x1, s: .55, dir: -1, outfit: "worker" }, PERSON.walkPose(t * 6, 1)), 600), s: .55, dir: -1, outfit: { base: "worker", colors: { vest: ORANGE, vestD: "#97411f" } }, breath: .5, face: { eyes: blink(t), mouth: "smile" } }, PERSON.walkPose(t * 6, x1 > 61 ? 1 : 0)));
  var w2 = PERSON.side(Object.assign({ x: x2, y: PERSON.sideHipY(Object.assign({ x: x2, s: .55, dir: -1, outfit: "worker" }, PERSON.walkPose(t * 6 + 1, 1)), 600), s: .55, dir: -1, outfit: { base: "worker", colors: { vest: BLUE, vestD: "#34536b", hat: "#9fb7c3", hatD: "#7a93a0" } }, breath: .5, face: { eyes: blink(t, 2), mouth: "neutral" } }, PERSON.walkPose(t * 6 + 1, x2 > 361 ? 1 : 0)));
  s += w1.svg + w2.svg + chip("صحيان", x1, 250, ORANGE, k, 18) + chip("نوم", x2, 250, BLUE, k, 18);
  return s;
}

// ── the sleep thought: a stair edge, a little man stepping off into the air ──
function stairFall(x, y, sc, k, t) {
  var s = '<path d="M-90 40 H-20 V70 H40 V100 H110" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M-90 40 H-20 V70 H40 V100 H110 V120 H-90 Z" fill="' + KHAKI + '" opacity=".6"/>';
  var P = PERSON.side(Object.assign({ x: -40 + 50 * k, y: -30 + 60 * k * k, s: .2, dir: 1, rot: 30 * k, outfit: "home", face: { eyes: 1.25, brows: "raised", mouth: "o" } }, { legs: [{ hip: 40 * k, knee: 30 * k }, { hip: -20 * k, knee: 10 }], arms: [{ sh: 120 * k, el: 20 }, { sh: 150 * k, el: 10 }] }));
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", s + P.svg + (k > .3 ? arrow(60, -10, 60, 40, BLUE, 4, 1) : ""));
}
function thought(x, y, w, h, inner, k) {
  k = pop(k); if (k <= 0) return "";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", '<circle cx="-' + f(w * .32) + '" cy="' + f(h * .62) + '" r="9" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><circle cx="-' + f(w * .4) + '" cy="' + f(h * .78) + '" r="5" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' +
    '<ellipse rx="' + f(w / 2) + '" ry="' + f(h / 2) + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + inner);
}

// ── triggers: coffee at night, a stressful day, a short night ──
function coffee(x, y, sc, t) {
  var s = '<path d="M-34 -20 H34 L28 34 Q26 44 16 44 H-16 Q-26 44 -28 34 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.6"/><path d="M34 -6 Q54 -6 52 12 Q50 26 30 24" fill="none" stroke="' + INK + '" stroke-width="5"/><ellipse cx="0" cy="-20" rx="34" ry="7" fill="#6b4a33" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="0" cy="48" rx="54" ry="8" fill="#e3d7bd" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 3; i++) { var p = (t * .6 + i / 3) % 1; s += G("", '<path d="M' + (-16 + i * 16) + ' ' + f(-34 - p * 50) + ' q8 -10 0 -20 t0 -20" stroke="' + GREY + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>', Math.sin(p * Math.PI)); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", s);
}
function stressHead(x, y, sc, t) {
  var h = PERSON.head([0, 0], 1.5, 4 * Math.sin(t * 3), { face: { eyes: blink(t, 1), brows: "worried", mouth: "frown" } }, PERSON.colors), s = "";
  for (var i = 0; i <= 50; i++) { var a = i / 50 * 6.28 * 3 + t * 5, r = 10 + i * .5; s += (i ? " L" : "M") + f(Math.cos(a) * r * 1.6) + " " + f(-70 + Math.sin(a) * r * .6); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", h + '<path d="' + s + '" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>');
}
function moonBat(x, y, sc, t) {   // a short night: the moon and an almost empty battery
  var k = .18 + .04 * Math.sin(t * 3);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", '<circle cx="0" cy="-40" r="30" fill="#efe6c8" stroke="' + INK + '" stroke-width="2.4"/><circle cx="20" cy="-54" r="24" fill="' + PAPER + '"/>' +
    R(-40, 10, 80, 40, "#f4ecdb", 2.6, 5) + R(40, 22, 8, 16, INK, 0) + R(-35, 15, 70 * k, 30, ORANGE, 0));
}

// ── the ancestor asleep on a branch, high in a tree ──
function tree(t) {
  var s = paper() + '<path d="M-200 730 H840" stroke="' + INK + '" stroke-width="2.6"/>' + R(-200, 730, 1040, 300, "#cdbf98", 0);
  s += '<path d="M250 740 C262 600 258 470 272 340 L310 340 C318 470 330 600 350 740 Z" fill="' + WOODC + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M290 360 C360 350 470 345 600 352 L600 372 C470 368 360 372 300 384 Z" fill="' + WOODC + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M270 380 C210 360 140 330 60 300 L56 316 C140 350 210 382 268 402 Z" fill="' + WOODC + '" stroke="' + INK + '" stroke-width="2.6"/>';
  [[290, 170, 150], [150, 230, 100], [470, 220, 120], [600, 260, 90], [40, 250, 80]].forEach(function (c, i) { var b = 1 + .015 * Math.sin(t * 1.4 + i); s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + f(c[2] * b) + '" ry="' + f(c[2] * .62 * b) + '" fill="' + (i % 2 ? "#7d8a4f" : "#8f9a5c") + '" stroke="' + INK + '" stroke-width="2.4"/>'; });
  for (var i = 0; i < 14; i++) s += '<path d="M' + f(60 + hash(i) * 560) + ' ' + f(150 + hash(i + 5) * 160) + ' q10 -8 20 0" stroke="#5e653a" stroke-width="2" fill="none"/>';
  return s;
}
// on the branch (top ≈ 352 at x 380–560): fall 0..1 slides him off, grab 0..1 his hand closes on the branch
function ancestor(t, o) {
  o = o || {}; var fl = o.fall || 0, j = o.j || 0;
  var P = PERSON.side({ x: 470 + 40 * fl, y: 333 + 90 * fl * fl - 8 * j, s: .5, dir: 1, rot: -90 + 50 * fl, outfit: { base: "casual", top: "tshirt", feet: "socks", colors: { shirt: "#9a7650", shirtD: "#7a5a3a", pants: "#7a5a3a", pantsD: "#5e4430", socks: PERSON.colors.skin } }, breath: (Math.sin(t * 1.5) + 1) / 2,
    legs: [{ hip: 8 + 30 * j, knee: 10 + 40 * j }, { hip: 2, knee: 6 }], arms: [{ sh: o.grab ? -55 : 14 + 70 * fl, el: o.grab ? 4 : 20, hand: o.grab ? "fist" : "relaxed" }, { sh: 6, el: 10 }],
    face: { eyes: o.eyes == null ? 0 : o.eyes, brows: j > .2 || fl > .3 ? "raised" : "neutral", mouth: j > .2 || fl > .3 ? "o" : "neutral" } });
  return P.svg;
}

// ── shots ──
var W = [325, 470, 1.22], HC = [300, 380], HS = 1.25;
var HEADV = [300, 380, 1], SWV = [300 + SW.sleep[0] * HS * .5 + SW.wake[0] * HS * .5, 380 + 35 * HS, 2.3];
// 4 · the rule: the head cut appears
shot(4, still(HEADV[0], HEADV[1], 1), function (u, d, t) { return paper() + appear(at(u, 0, .8), headCut(HC[0], HC[1], HS, { wake: .2 + .1 * Math.sin(t * 2), sleep: .2 }, t)); });
// 5 · two switches inside your brain: one for waking, one for sleep… and they can't both be on
shot(5, fly(HEADV, SWV, 1.8), function (u, d, t) { return paper() + headCut(HC[0], HC[1], HS, { wake: 1, sleep: .1 }, t); });
shot([5, 1], still(SWV[0], SWV[1], SWV[2]), function (u, d, t) {
  return paper() + headCut(HC[0], HC[1], HS, { wake: 1, sleep: at(u, 1, .4) * .1 }, t) + label(HC[0] + SW.wake[0] * HS, HC[1] + SW.wake[1] * HS, 200, 520, "صحيان", ORANGE, at(u, .1, .5), 13) + label(HC[0] + SW.sleep[0] * HS, HC[1] + SW.sleep[1] * HS, 420, 330, "نوم", BLUE, at(u, .6, .5), 13);
});
shot([5, 3], still(320, 400, 1), function (u, d, t) {   // the panel: they flip against each other; both on = ✗
  var lev = .5 + .5 * Math.sin(Math.max(0, u - .4) * 2.2 - Math.PI / 2);
  return paper() + panel(320, 400, lev, t, { both: u > d - 1.1 && u < d }) + (u > d - 1.1 ? cross(320, 400, 1.6, at(u, d - 1.05, .5)) : "");
});
hud([5, 3], 6, function (u, t) { return chip("زرار واحد بس يشتغل", 320, 80, INK, 1, 22); });
// 6 · what happens as you drift off? — the bed, his eyes closing
shot(6, still(W[0], W[1], W[2]), function (u, d, t) { return bedScene(t, { eyes: .55 - .5 * at(u, .3, d), zz: u > 1 }).svg + G("", T("؟", 520, 380, 110, ORANGE, 800), at(u, .2, .3)); });
// 7 · the wake switch in the brainstem starts handing over to the sleep switch
shot(7, still(HEADV[0], HEADV[1], 1), function (u, d, t) { return paper() + headCut(HC[0], HC[1], HS, { wake: 1, sleep: .1, stem: at(u, .3, 1.2) }, t) + label(HC[0] - 34 * HS, HC[1] + 150 * HS, 120, 650, "جذع المخ", OLIVE, at(u, .8, .5), 16); });
shot([7, 2], fly(HEADV, SWV, 1.8), function (u, d, t) {
  var k = at(u, 1, d); return paper() + headCut(HC[0], HC[1], HS, { wake: 1 - .7 * k, sleep: .1 + .8 * k, stem: 1 }, t) + arrow(HC[0] + SW.wake[0] * HS + 12, HC[1] + SW.wake[1] * HS - 16, HC[0] + SW.sleep[0] * HS - 12, HC[1] + SW.sleep[1] * HS + 14, ORANGE, 3, at(u, 1.6, .6));
});
// 8 · like two shifts at a factory: one going out, one coming in
shot(8, still(320, 420, 1), function (u, d, t) { return factory(u, t, at(u, .2, .3)); });
// 9 · with the hand-over your muscles let go, one by one: the arm sinks, a tone gauge drains
shot(9, still(W[0], W[1], W[2]), function (u, d, t) {
  var k = at(u, .3, d - .3); return bedScene(t, { relax: 1 - k * 0, eyes: 0, zz: true }).svg + G("translate(0 " + f(6 * k) + ")", "");
});
hud(9, 10, function (u, t) { var k = at(u, .3, 2.6); return R(70, 150, 220, 40, "#f4ecdb", 2.2, 6) + R(74, 154, 212 * (1 - .8 * k), 32, k > .5 ? BLUE : ORANGE, 0, 4) + T("شد العضلات", 180, 136, 22, INK, 800); });
// 10 · so where's the problem? — the panel mid hand-over
shot(10, still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .5, t, {}) + G("", T("؟", 320, 300, 120, ORANGE, 800), at(u, .2, .3)); });
// 11 · the hand-over isn't always smooth: the bar shakes, the lamps flicker
shot(11, still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .5 + .15 * Math.sin(t * 9), t, { shake: at(u, .2, .4), flicker: u > .3 }); });
// 12 · a glitch: the brain fires one strong signal to all the muscles at once
shot(12, still(HEADV[0], HEADV[1], 1), function (u, d, t) { return paper() + headCut(HC[0], HC[1], HS, { wake: .5 + .5 * Math.sin(t * 25), sleep: .7, stem: 0, spark: at(u, .1, .2), pulse: clamp((u - .6) / 1.2) }, t); });
shot([12, 1], still(W[0], W[1], W[2]), function (u, d, t) { var b = bedScene(t, { eyes: 0 }); return b.svg + nerves(b.J, at(u, 0, 1.2), false, t); });
shot([12, 3], still(W[0], W[1], W[2]), function (u, d, t) { var b = bedScene(t, { eyes: 0 }); return b.svg + nerves(b.J, 1, true, t); });
// 13 · your leg kicks, your arm jerks, your heart pounds (one jolt per chunk)
function chunkT(i, c) { var l = LN[i]; return l.start + (l.end - l.start) * (window.CHUNKS[i][c] || 0); }
shot(13, still(W[0], W[1], W[2]), function (u, d, t) { var j = jolt(t, chunkT(13, 0) + .15); var b = bedScene(t, { j: j, eyes: j > .1 ? 1.25 : .9 }); return b.svg + label(b.J.ankle[0], b.J.ankle[1], 540, 380, "رجلك", ORANGE, at(u, .2, .4), 24); });
shot([13, 1], still(W[0], W[1], W[2]), function (u, d, t) { var j = jolt(t, chunkT(13, 1) + .1); var b = bedScene(t, { j: j, eyes: 1.2 }); return b.svg + label(b.J.wrist[0], b.J.wrist[1], 260, 370, "دراعك", ORANGE, at(u, .1, .4), 24); });
shot([13, 2], still(W[0], W[1], W[2]), function (u, d, t) {
  var b = bedScene(t, { eyes: 1.2, brows: "worried", mouth: "open" }); return b.svg + iconBox(150, 220, 170, heart(0, 0, 1.9, beat(t, 130)) + T("بيدق جامد", 0, 70, 18, INK, 800), at(u, .1, .3));
});
// 14 · its name: «نفضة النوم» — the doctors call it a hypnic jerk
shot(14, still(W[0], W[1], W[2]), function (u, d, t) { var j = jolt(u % 2.4, .3) * .6; return dim(.55, bedScene(t, { j: j, eyes: 1 }).svg) + tag("نفضة النوم", 320, 300, at(u, .2, .4), 46, ORANGE); });
shot([14, 1], still(W[0], W[1], W[2]), function (u, d, t) { var j = jolt(u % 2.4, .4) * .6; return dim(.55, bedScene(t, { j: j, eyes: 1 }).svg) + tag("نفضة النوم", 320, 300, 1, 46, ORANGE) + G("", N("Hypnic Jerk", 320, 410, 44, OLIVE), at(u, .3, .4)); });
// 15 · where does the falling feeling come from? — a thought bubble: stepping off a stair edge
shot(15, still(W[0], W[1], W[2]), function (u, d, t) { var b = bedScene(t, { eyes: 0, zz: false }); return b.svg + thought(250, 250, 300, 220, stairFall(0, -30, 1.05, at(u, .6, 1.4), t), at(u, .1, .3)); });
// 16 · it often comes with the jolt… nobody knows which comes first
function whichFirst(u, t) {
  var s = paper() + R(60, 250, 220, 220, "#f4ecdb", 2.4, 10) + R(360, 250, 220, 220, "#f4ecdb", 2.4, 10);
  s += stairFall(170, 340, .95, .6 + .2 * Math.sin(t * 2), t) + T("الوقوع", 170, 510, 28, BLUE, 800);
  var j = jolt(u % 1.8, .2);
  s += G("translate(470 360)", '<path d="M-70 30 H70" stroke="' + INK + '" stroke-width="2"/>' + PERSON.side({ x: 10, y: 14 - 6 * j, s: .3, dir: 1, rot: -90, outfit: "home", legs: [{ hip: 6 + 40 * j, knee: 6 + 50 * j }, { hip: 2, knee: 4 }], arms: [{ sh: 14 + 60 * j, el: 20 }, { sh: 6, el: 10 }], face: { eyes: j > .2 ? 1.2 : 0, mouth: j > .2 ? "o" : "neutral" } }).svg + ticks(40, 0, 30, j)) + T("النفضة", 470, 510, 28, ORANGE, 800);
  var k = (Math.sin(t * 2.4) + 1) / 2;
  return s + arrow(285, 330, 355, 330, INK, 4, 1) + arrow(355, 390, 285, 390, INK, 4, 1) + G("", T("؟", 320, 220, 110, ORANGE, 800), .5 + .5 * k);
}
shot(16, still(320, 400, 1), function (u, d, t) { return G("", whichFirst(u, t), 1); });
shot([16, 1], still(320, 400, 1), function (u, d, t) { return whichFirst(u, t) + chip("محدش متأكد", 320, 620, INK, at(u, .2, .3), 26); });
// 17 · why is it stronger on some nights? — a week of nights, two tall bars
var NIGHTS = [.35, .3, .9, .4, .32, .95, .38];
function nightsChart(u, t, hi) {
  var s = paper() + '<path d="M80 600 H580" stroke="' + INK + '" stroke-width="3"/><path d="M80 600 V240" stroke="' + INK + '" stroke-width="3"/>' + T("قوة النفضة", 92, 226, 20, INK, 800, "end");
  NIGHTS.forEach(function (v, i) { var x = 110 + i * 66, h = 330 * v * at(u, .1 + i * .08, .5); s += R(x, 600 - h, 44, h, v > .8 ? ORANGE : KHAKI, 2.2) + '<circle cx="' + (x + 22) + '" cy="630" r="10" fill="#efe6c8" stroke="' + INK + '" stroke-width="1.8"/>'; });
  return s + (hi ? G("", '<rect x="234" y="230" width="60" height="380" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" rx="8"/><rect x="432" y="215" width="60" height="395" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" rx="8"/>', .6 + .4 * Math.sin(t * 4)) : "");
}
shot(17, still(320, 420, 1), function (u, d, t) { return nightsChart(u, t, u > 1); });
// 18 · coffee at night, a stressful day, a short night (one per chunk)
function trig(u, t, n) {
  var s = paper() + T("ليه أقوى؟", 320, 140, 34, INK, 800);
  s += G("", coffee(150, 300, 1.25, t) + iconBox(220, 230, 70, '<circle r="24" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 V-16 M0 0 L12 6" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + T("11", 0, 34, 12, INK, 800)) + T("قهوة بالليل", 150, 410, 24, ORANGE, 800), at(n >= 0 ? u : -1, 0, .3));
  s += G("", stressHead(470, 330, 1.2, t) + T("يوم كله توتر", 470, 450, 24, ORANGE, 800), n >= 1 ? 1 : 0);
  s += G("", moonBat(320, 560, 1.3, t) + T("نوم قليل", 320, 660, 24, ORANGE, 800), n >= 2 ? 1 : 0);
  return s;
}
shot(18, still(320, 400, 1), function (u, d, t) { return trig(u, t, 0); });
shot([18, 1], still(320, 400, 1), function (u, d, t) { return trig(9, t, 0) + G("", stressHead(470, 330, 1.2, t) + T("يوم كله توتر", 470, 450, 24, ORANGE, 800), at(u, 0, .3)); });
shot([18, 2], still(320, 400, 1), function (u, d, t) { return trig(9, t, 1) + G("", moonBat(320, 560, 1.3, t) + T("نوم قليل", 320, 660, 24, ORANGE, 800), at(u, 0, .3)); });
// 19 · the wake switch stays on… so the hand-over is rougher
shot(19, still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .15 + .05 * Math.sin(t * 3), t, {}) + iconBox(110, 140, 110, coffee(0, 6, .7, t), at(u, .2, .3)); });
shot([19, 1], still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .5 + .4 * Math.sin(t * 7), t, { shake: 1, flicker: true }) + spark(320, 370, 1, t) + chip("أخشن", 320, 640, ORANGE, at(u, .3, .3), 28); });
// 20 · many think it's a sign of a nerve problem… no.
shot(20, still(HEADV[0], HEADV[1], 1), function (u, d, t) { return paper() + headCut(HC[0], HC[1], HS, { wake: .3, sleep: .6 }, t) + tag("مشكلة في الأعصاب؟", 320, 110, at(u, .3, .4), 30, INK); });
shot([20, 3], still(HEADV[0], HEADV[1], 1), function (u, d, t) { return paper() + headCut(HC[0], HC[1], HS, { wake: .3, sleep: .6 }, t) + tag("مشكلة في الأعصاب؟", 320, 110, 1, 30, INK) + cross(320, 110, 2.2, at(u, 0, .5)); });
// 21 · up to 7 in 10 people get it, and it's completely normal
function crowd(u, t, n) {
  var s = paper();
  for (var i = 0; i < 10; i++) { var x = 100 + (i % 5) * 110, y = 300 + Math.floor(i / 5) * 170, hit = i < n, j = hit ? jolt((t + i * .37) % 2.6, .2) : 0;
    s += G("", PERSON.head([x, y - 6 * j], 1.5, 0, { face: { eyes: hit && j > .1 ? 1.25 : blink(t, i), brows: hit && j > .1 ? "raised" : "neutral", mouth: hit && j > .1 ? "o" : "smile" } }, PERSON.colors) + R(x - 34, y + 46, 68, 50, hit ? ORANGE : KHAKI, 2.2, 14), at(u, i * .06, .3)) + (hit ? ticks(x, y - 10, 46, j) : ""); }
  return s;
}
shot(21, still(320, 420, 1), function (u, d, t) { var n = Math.round(7 * at(u, .4, 1.4)); return crowd(u, t, n) + G("", N(n + " / 10", 320, 180, 64, ORANGE), at(u, .3, .3)); });
shot([21, 2], still(320, 420, 1), function (u, d, t) { return crowd(9, t, 7) + N("7 / 10", 320, 180, 64, ORANGE) + chip("طبيعية تمامًا", 320, 660, OLIVE, at(u, .1, .3), 28) + check(500, 660, 1, at(u, .5, .5), OLIVE); });
// 22 · bottom line: a switch hands over to a switch ①, the hand-over glitches ②, one signal jolts you ③
shot(22, still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .1, t, {}); });
shot([22, 1], still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .1 + .8 * at(u, .1, 1), t, {}) + callout("1", 140, 200, at(u, .1, .3), 22); });
shot([22, 2], still(320, 400, 1), function (u, d, t) { return paper() + panel(320, 400, .5 + .3 * Math.sin(t * 8), t, { shake: 1, flicker: true }) + callout("1", 140, 200, 1, 22) + callout("2", 320, 200, at(u, .1, .3), 22); });
shot([22, 3], still(W[0], W[1], W[2]), function (u, d, t) { var j = jolt(u, .25); return bedScene(t, { j: j, eyes: j > .1 ? 1.2 : 0 }).svg + callout("3", 520, 380, at(u, .2, .3), 26); });
// 23 · the oddest: a theory that it comes from when our ancestors slept up in the trees
var TV = [400, 420, 1.3], BR = [490, 330, 2.2];
shot(23, still(TV[0], TV[1], TV[2]), function (u, d, t) { return tree(t) + ancestor(t, {}) + zzz(400, 280, t, 24) + measure(620, 372, 620, 728, at(u, 1, 1.2), "") + G("", T("عالي", 600, 560, 24, ORANGE, 800, "start"), at(u, 2.2, .3)); });
shot([23, 3], fly(TV, BR, 1.8), function (u, d, t) { return tree(t) + ancestor(t, {}) + zzz(400, 280, t, 24); });
// 24 · relax up there and you fall… so the brain reads the slack as falling and wakes you to hold on
shot(24, still(BR[0], BR[1], BR[2]), function (u, d, t) { var fl = .5 * at(u, .2, 1.6); return tree(t) + ancestor(t, { fall: fl }) + G("", arrow(560, 300, 560, 400, ORANGE, 4, 1), at(u, 1, .3)); });
shot([24, 2], fly(BR, TV, 1.8), function (u, d, t) { var fl = .5 + .3 * Math.sin(t * 6) * .05; return tree(t) + ancestor(t, { fall: .5 }) + inset(160, 180, 90, '<g transform="scale(.5) translate(-10 50)">' + headCut(0, 0, 1, { spark: 1, wake: 1, sleep: .2 }, t) + '</g>', at(u, .3, .4)); });
shot([24, 4], still(TV[0], TV[1], TV[2]), function (u, d, t) { var j = jolt(u, .2); return tree(t) + ancestor(t, { fall: .5 * (1 - at(u, .2, .5)), j: j, grab: u > .2, eyes: 1.2 }) + check(470, 230, 1, at(u, .8, .5), OLIVE); });
// 25 · a nice theory… not proven yet
shot(25, still(TV[0], TV[1], TV[2]), function (u, d, t) { return dim(.6, tree(t) + ancestor(t, { eyes: blink(t) })) + tag("نظرية", 320, 300, at(u, .1, .3), 50, OLIVE); });
shot([25, 1], still(TV[0], TV[1], TV[2]), function (u, d, t) {
  return dim(.6, tree(t) + ancestor(t, { eyes: blink(t) })) + tag("نظرية", 320, 300, 1, 50, OLIVE) + G("translate(320 470) rotate(-8) scale(" + f(pop(at(u, .2, .4))) + ")", '<rect x="-190" y="-44" width="380" height="80" fill="none" stroke="' + ORANGE + '" stroke-width="5" rx="6"/>' + T("لسه متثبتتش", 0, 16, 44, ORANGE, 800));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // 0: drifting off… the jolt, like missing a stair. 1: he hasn't moved from the bed. 2: it was the brain that slipped
  var l = LN[li], u = t - l.start, j = li === 0 ? jolt(u, Math.max(1.2, (l.end - l.start) * .5)) : 0;
  var s = '<g transform="translate(-60 -230) scale(1.15)">' + bedScene(t, { j: j, eyes: li === 0 ? (j > .05 || u > (l.end - l.start) * .5 ? 1.2 : .4 * (1 - clamp(u / 1.5))) : 1.1, brows: li ? "raised" : null, mouth: li === 1 ? "o" : null }).svg + '</g>';
  var sv = s;
  if (li === 0) sv += iconBox(110, 140, 150, stairFall(0, -10, .7, clamp((u - (l.end - l.start) * .5) / .6), t), clamp((u - (l.end - l.start) * .45) / .3));
  if (li === 1) sv += G("", '<rect x="8" y="290" width="592" height="170" fill="none" stroke="' + OLIVE + '" stroke-width="4" stroke-dasharray="14 10" rx="12"/>', ease(u / .4)) + check(550, 250, 1.2, clamp((u - .6) / .5), OLIVE);
  if (li === 2) sv += inset(150, 130, 100, '<g transform="scale(.62) translate(10 40)">' + headCut(0, 0, 1, { spark: 1, wake: 1, sleep: .4 }, t) + '</g>', ease(u / .4)) + '<path d="M160 215 L70 300" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>';
  return sv;
};
SCENE.bumper = function (u, t) {
  return G("translate(92 120) scale(.42)", headCut(0, 0, 1, { wake: .5 + .5 * Math.sin(t * 3), sleep: .5 - .5 * Math.sin(t * 3) }, t));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(30 -80) scale(.52)", panel(260, 400, .5 + .2 * Math.sin(t * 5), t, { shake: .5 })) + G("translate(300 -60) scale(.5)", bedScene(t, { j: jolt(t % 2.5, .3), eyes: 1 }).svg.replace(paper(), "")) +
    callout("1", 110, 80, ease(u / .3)) + callout("2", 200, 80, ease(u / .3 - .5)) + callout("3", 165, 40, ease(u / .3 - 1)) + callout("4", 470, 160, ease(u / .3 - 1.5));
};
