// ── «الغراب ذكي للدرجة دي؟» — drawings. Crows are drawn from real proportions (refs/SOURCES.md): total length ≈ 45 cm,
// tail ≈ 38 % of it, a thick arched bill about as long as the head, short tarsus, the body tilted about 25° when standing.
// The real clips the user sent play inside drawn phones (clips/, made by tools/clips.py), with the source under each.

function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function smooth(pts, close) {   // a smooth closed outline through points (quadratic midpoints, like the figure trunks)
  var d = "M" + f((pts[0][0] + pts[1][0]) / 2) + " " + f((pts[0][1] + pts[1][1]) / 2), n = pts.length;
  for (var i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
  return d + (close === false ? "" : " Z");
}
var BODY = "#2d2b31", WING = "#3a3741", FEATH = "#5d5966", SHEEN = "#56607a", GAPE = "#c84b5a", FLED = "#4e4946", FLED2 = "#6b625c",
    CRUST = "#c4844a", CRUMB = "#ecd2a0", SOAK = "#cfae7e", WATER = "#7f9fb3", WATER_D = "#5f7f97", SOIL = "#a98a62", SOIL_D = "#8a6c48",
    BRAIN = "#d9a3a0", BRAIN_D = "#b77a78", WALNUT = "#a6804f";

// ── the crow, side view facing right, feet on (x, y). o: {s, flip, head (deg, + = nod down), open (0..1 beak), walk, wing (0..1 lift)}
function crow(x, y, o) {
  o = o || {}; var s = o.s || 1, op = o.open || 0, hd = o.head || 0, wl = o.wing || 0;
  var body = [[116, -196], [112, -160], [88, -124], [44, -98], [-6, -86], [-56, -84], [-104, -90], [-282, -30], [-298, -44], [-150, -112], [-82, -150], [-12, -182], [48, -206], [92, -220]];
  var r = '<path d="' + smooth(body) + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
  // tail feathers and the under-tail
  r += '<path d="M-150 -104 L-290 -38 M-140 -98 L-286 -32 M-160 -110 L-292 -44" stroke="' + FEATH + '" stroke-width="1.6" fill="none"/>';
  // legs: thighs under the belly feathers, scaled tarsi, three toes forward and one back
  var lg = function (dx, ph) { var sw = o.walk ? 10 * Math.sin(ph) : 0; return '<path d="M' + f(-10 + dx) + ' -92 L' + f(-14 + dx + sw * .5) + ' -46 L' + f(-10 + dx + sw) + ' 0" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M' + f(-10 + dx + sw) + ' 0 L' + f(24 + dx + sw) + ' 0 M' + f(-10 + dx + sw) + ' 0 L' + f(14 + dx + sw) + ' 5 M' + f(-10 + dx + sw) + ' 0 L' + f(-36 + dx + sw) + ' 1" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>'; };
  var t = window.__t || 0;
  r = lg(18, t * 6 + 3) + r + lg(0, t * 6);
  // folded wing over the body: primaries reach the tail, a hint of blue sheen
  var wy = -wl * 30;
  r += '<path d="' + smooth([[74, -176 + wy * .2], [40, -196 + wy], [-30, -170 + wy], [-110, -130 + wy * .6], [-176, -100], [-160, -92], [-70, -112], [6, -134], [56, -150]]) + '" fill="' + WING + '" stroke="' + INK + '" stroke-width="2"/>';
  r += '<path d="M-60 -118 L-170 -98 M-40 -126 L-150 -104 M-20 -134 L-120 -112 M10 -150 Q30 -170 60 -170" stroke="' + FEATH + '" stroke-width="1.5" fill="none"/><path d="M-10 -168 Q30 -186 62 -182" stroke="' + SHEEN + '" stroke-width="3" fill="none" opacity=".8"/>';
  // head (turns about the neck), the thick arched bill, the dark eye with a glint
  var bill = '<path d="M146 -253 Q186 -250 216 -222 Q186 -224 148 -222 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
    G("rotate(" + f(op * 26) + " 148 -222)", '<path d="M148 -222 Q184 -222 214 -221 Q184 -208 146 -212 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>') +
    (op > .05 ? G("", '<path d="M150 -222 L190 -221 L' + f(150 + 40 * Math.cos(op * .45)) + ' ' + f(-221 + 40 * Math.sin(op * .45)) + ' Z" fill="' + GAPE + '"/>', 1) : "") +
    '<path d="M140 -252 Q150 -240 146 -228" stroke="' + FEATH + '" stroke-width="2" fill="none"/>';
  var head = '<path d="' + smooth([[78, -214], [80, -248], [108, -268], [140, -260], [152, -238], [150, -212], [128, -196], [96, -200]]) + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>' + bill +
    '<circle cx="122" cy="-238" r="7" fill="#141216" stroke="' + FEATH + '" stroke-width="1.6"/><circle cx="124.5" cy="-240.5" r="2.2" fill="#fff"/>';
  r += G("rotate(" + f(hd) + " 92 -206)", head);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(o.flip ? -s : s) + " " + f(s) + ")", r);
}
// a crow in flight (from below / side): body, spread fingered wings that flap with ph
function flyCrow(x, y, s, ph, flip) {
  var up = Math.sin(ph) * 40, r = "";
  var wing = function (side) { var yy = -up * side; return '<path d="M-20 0 Q-40 ' + f(-60 + yy) + ' -10 ' + f(-120 + yy * 1.6) + ' L5 ' + f(-110 + yy * 1.6) + ' L14 ' + f(-122 + yy * 1.6) + ' L24 ' + f(-106 + yy * 1.6) + ' L36 ' + f(-114 + yy * 1.5) + ' L40 ' + f(-96 + yy * 1.4) + ' Q34 -40 30 0 Z" fill="' + WING + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'; };
  r += G("", wing(1)) + '<path d="' + smooth([[90, -4], [60, -14], [0, -12], [-70, -8], [-120, -20], [-124, 12], [-70, 10], [0, 12], [60, 10]]) + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M86 -10 L118 0 L86 8 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2"/><circle cx="76" cy="-5" r="3.5" fill="#fff"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(flip ? -s : s) + " " + f(s) + ")", r);
}
// a fledgling: rounder, fluffy, short tail, blue-grey eye, pink gape when it begs (head up, beak open)
function fledgling(x, y, o) {
  o = o || {}; var s = o.s || 1, beg = o.beg || 0, t = window.__t || 0, op = beg * (0.6 + 0.4 * Math.abs(Math.sin(t * 7)));
  var fl = []; for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2, rr = (i % 2 ? 1 : 1.06); fl.push([-10 + Math.cos(a) * 82 * rr, -88 + Math.sin(a) * 60 * rr]); }
  var r = '<path d="M-10 -90 L-12 -40 L-8 0 M14 -88 L12 -40 L16 0" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-8 0 h26 M-8 0 h-22 M16 0 h26" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
  r += '<path d="M-80 -90 L-140 -66 L-132 -54 L-74 -70 Z" fill="' + FLED + '" stroke="' + INK + '" stroke-width="2"/>';
  r += '<path d="' + smooth(fl) + '" fill="' + FLED + '" stroke="' + INK + '" stroke-width="2.4"/><path d="' + smooth([[30, -60], [0, -40], [-40, -44], [-20, -70]]) + '" fill="' + FLED2 + '" opacity=".7"/>';
  r += '<path d="M-60 -110 Q-20 -130 30 -110 Q0 -90 -40 -84 Z" fill="' + WING + '" stroke="' + INK + '" stroke-width="1.8"/>';
  var head = '<circle cx="62" cy="-150" r="40" fill="' + FLED + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M96 -164 Q120 -160 136 -146 L98 -142 Z" fill="#3a3436" stroke="' + INK + '" stroke-width="2"/>' +
    G("rotate(" + f(op * 32) + " 98 -144)", '<path d="M98 -144 L134 -144 Q116 -132 96 -134 Z" fill="#3a3436" stroke="' + INK + '" stroke-width="2"/>') +
    (op > .05 ? '<path d="M98 -144 L130 -146 L' + f(98 + 32 * Math.cos(op * .55)) + ' ' + f(-144 + 32 * Math.sin(op * .55)) + ' Z" fill="' + GAPE + '"/>' : "") +
    '<path d="M94 -160 Q100 -150 96 -136" stroke="#e2b36a" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="74" cy="-158" r="7" fill="#6f8fa8" stroke="' + INK + '" stroke-width="1.6"/><circle cx="74" cy="-158" r="3" fill="#141216"/><circle cx="76" cy="-160" r="1.4" fill="#fff"/>';
  r += G("rotate(" + f(-beg * 28) + " 40 -120)", head);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(o.flip ? -s : s) + " " + f(s) + ")", r);
}
// a piece of bread (a cut baguette end), dry with crumbs or soaked darker
function bread(x, y, s, wet, rot) {
  var r = '<path d="M-60 -18 Q-62 -34 -40 -36 L48 -32 Q66 -30 64 -10 L62 14 Q60 28 44 28 L-44 26 Q-62 24 -60 8 Z" fill="' + (wet ? "#b98450" : CRUST) + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<ellipse cx="54" cy="-2" rx="11" ry="26" fill="' + (wet ? SOAK : CRUMB) + '" stroke="' + INK + '" stroke-width="1.8"/>' +
    '<path d="M-36 -24 q10 -6 20 0 M-6 -26 q10 -6 20 0 M24 -24 q8 -5 16 0" stroke="' + (wet ? "#8d5f34" : "#a2683a") + '" stroke-width="2" fill="none"/>';
  if (wet) r += '<path d="M-40 26 q2 8 0 12 M0 28 q2 9 0 14 M30 28 q2 7 0 10" stroke="' + WATER_D + '" stroke-width="3" stroke-linecap="round" fill="none"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s) + ")", r);
}
function crumbs(x, y, u, n) { var s = ""; for (var i = 0; i < (n || 7); i++) { var k = ((u * .9 + hash(i)) % 1), dx = (hash(i + 5) - .5) * 70, yy = y + k * 150; s += '<rect x="' + f(x + dx) + '" y="' + f(yy) + '" width="' + f(5 + hash(i + 9) * 5) + '" height="' + f(4 + hash(i + 3) * 4) + '" fill="' + CRUMB + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - k) + '" transform="rotate(' + f(k * 300 + i * 40) + ' ' + f(x + dx) + ' ' + f(yy) + ')"/>'; } return s; }
// a puddle / water seen from the side: a cut through the water with a moving surface line
function waterCut(x, y, w, h, t, col) {
  var d = "M" + f(x) + " " + f(y); for (var k = 0; k <= 24; k++) d += " L" + f(x + w * k / 24) + " " + f(y + 4 * Math.sin(k * .9 - t * 4));
  return '<path d="' + d + ' L' + f(x + w) + ' ' + f(y + h) + ' L' + f(x) + ' ' + f(y + h) + ' Z" fill="' + (col || WATER) + '" stroke="' + INK + '" stroke-width="2.2" opacity=".92"/>' +
    '<path d="M' + f(x + 20) + ' ' + f(y + 24) + ' h' + f(w * .3) + ' M' + f(x + w * .5) + ' ' + f(y + 40) + ' h' + f(w * .25) + '" stroke="#dfe8ec" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
}
function ground(y, x0, x1, col) { x0 = x0 == null ? -600 : x0; x1 = x1 == null ? 1240 : x1; return R(x0, y, x1 - x0, 500, col || "#d9cba9", 0) + '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="500" fill="url(#hatch)" opacity=".5"/><path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + INK + '" stroke-width="2.6"/>'; }
// sound arcs coming out of a beak (a caw), k 0..1 per call
function caw(x, y, k, ang, col) { if (k <= 0 || k >= 1) return ""; var s = ""; for (var i = 0; i < 3; i++) { var r = 18 + i * 16 + k * 20; s += '<path d="M' + f(x + Math.cos(ang - .5) * r) + ' ' + f(y + Math.sin(ang - .5) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(ang + .5) * r) + ' ' + f(y + Math.sin(ang + .5) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(1 - k) + '"/>'; } return s; }

// ── a phone playing one of the user's clips (clips/<name>.jpg sprite sheet) ──
var CLIP_ON = false;
function clipAt(name, u, rate) { var m = CLIPS[name]; var i = Math.floor(Math.max(0, u) * m.fps * (rate || 1)); return Math.min(m.n - 1, i); }
function clipImg(name, i, x, y, w, h) {
  var m = CLIPS[name], rows = Math.ceil(m.n / m.cols), c = i % m.cols, r = Math.floor(i / m.cols); CLIP_ON = true;
  return '<svg x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" viewBox="' + (c * m.w + 1) + ' ' + (r * m.h + 1) + ' ' + (m.w - 2) + ' ' + (m.h - 2) + '" preserveAspectRatio="xMidYMid slice"><image href="../clips/' + name + '.jpg" x="0" y="0" width="' + (m.cols * m.w) + '" height="' + (rows * m.h) + '"/></svg>';
}
// phone(cx, cy, W, name, u, opt): W = screen width; the screen takes the clip's aspect. opt: {src, rot, k (pop-in), rate, from}
function phone(cx, cy, W, name, u, opt) {
  opt = opt || {}; var m = CLIPS[name], H = W * m.h / m.w, land = m.w > m.h, mx = land ? 34 : 16, my = land ? 16 : 40, k = pop(opt.k == null ? 1 : opt.k);
  if (k <= 0) return "";
  var bw = W + 2 * mx, bh = H + 2 * my, s = '<rect x="' + f(-bw / 2 + 10) + '" y="' + f(-bh / 2 + 12) + '" width="' + f(bw) + '" height="' + f(bh) + '" rx="34" fill="' + INK + '" opacity=".18"/>' +
    '<rect x="' + f(-bw / 2) + '" y="' + f(-bh / 2) + '" width="' + f(bw) + '" height="' + f(bh) + '" rx="34" fill="#2f2a25" stroke="' + INK + '" stroke-width="3"/>' +
    '<rect x="' + f(-bw / 2 + 5) + '" y="' + f(-bh / 2 + 5) + '" width="' + f(bw - 10) + '" height="' + f(bh - 10) + '" rx="30" fill="none" stroke="#5a524a" stroke-width="2"/>' +
    clipImg(name, clipAt(name, u - (opt.from || 0), opt.rate), -W / 2, -H / 2, W, H) + '<rect x="' + f(-W / 2) + '" y="' + f(-H / 2) + '" width="' + f(W) + '" height="' + f(H) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  s += land ? '<circle cx="' + f(-bw / 2 + 17) + '" cy="0" r="5" fill="#141210"/>' : '<rect x="-28" y="' + f(-bh / 2 + 16) + '" width="56" height="10" rx="5" fill="#141210"/>';
  // the play dot pulses while the clip runs
  s += '<circle cx="' + f(W / 2 - 18) + '" cy="' + f(-H / 2 + 18) + '" r="7" fill="' + ORANGE + '" opacity="' + f(.5 + .5 * Math.sin((window.__t || 0) * 6)) + '"/>';
  if (opt.src) s += T(opt.src, 0, bh / 2 + 36, 20, MUTE, 600);
  return G("translate(" + f(cx) + " " + f(cy) + ") rotate(" + f(opt.rot || 0) + ") scale(" + f(k) + ")", s);
}

// ── people (copied from «لو حد شرق قدامك», videos/choking/sketch/shots.js: Drillis & Contini proportions, H = 400) ──
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
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
    out.wr = out.wr || []; out.wr[i] = wr;
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
  out.body = leg(0) + tor + neck + head; out.near = arm(0); out.hd = hd;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }

// ── brains: a crow head cut open (forebrain dome, the NCL at its back, cerebellum, optic lobe), a walnut, a monkey brain
function crowBrain(x, y, s, hi, t) {
  var r = '<path d="' + smooth([[-70, 10], [-80, -30], [-50, -66], [0, -78], [50, -64], [74, -30], [66, 6], [30, 22], [-30, 24]]) + '" fill="' + BRAIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
  r += '<path d="M-60 -10 Q-10 -30 50 -12 M-40 -48 Q0 -40 40 -50" stroke="' + BRAIN_D + '" stroke-width="2" fill="none"/>';
  if (hi) r += '<path d="' + smooth([[-74, -22], [-62, -56], [-30, -70], [-24, -36], [-44, -2], [-68, 4]]) + '" fill="' + ORANGE + '" opacity="' + f(.55 + .25 * Math.sin((t || 0) * 4)) + '" stroke="' + INK + '" stroke-width="1.6"/>';
  r += '<path d="' + smooth([[-92, 4], [-104, 34], [-86, 58], [-60, 50], [-58, 22]]) + '" fill="#c98f8c" stroke="' + INK + '" stroke-width="2.2"/><path d="M-98 22 h30 M-96 36 h28 M-88 48 h20" stroke="' + BRAIN_D + '" stroke-width="1.6"/>';
  r += '<ellipse cx="20" cy="38" rx="30" ry="20" fill="#cf9996" stroke="' + INK + '" stroke-width="2.2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", r);
}
function walnut(x, y, s) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<ellipse rx="64" ry="54" fill="' + WALNUT + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 -54 V54" stroke="' + INK + '" stroke-width="2.4"/><path d="M-50 -20 q14 10 0 22 q-14 12 4 24 M-30 -40 q16 14 2 30 q-16 16 6 34 M30 -40 q-16 14 -2 30 q16 16 -6 34 M50 -20 q-14 10 0 22 q14 12 -4 24" stroke="#7d5c34" stroke-width="2.2" fill="none"/>');
}
function monkeyBrain(x, y, s, t) {
  var r = '<path d="' + smooth([[-120, 20], [-130, -40], [-90, -90], [-10, -110], [80, -96], [130, -50], [134, 10], [100, 46], [40, 56], [-40, 56], [-100, 46]]) + '" fill="' + BRAIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  r += '<path d="M-110 -10 q30 -20 10 -40 q30 -20 50 0 q20 -30 50 -10 q30 -20 60 6 M-100 30 q20 -20 50 -6 q20 -20 50 0 q30 -16 60 0 M-60 -80 q10 30 30 20 M30 -90 q-6 30 20 30 M90 -60 q-20 20 0 40" stroke="' + BRAIN_D + '" stroke-width="2.2" fill="none"/>';
  r += '<path d="' + smooth([[60, 50], [70, 90], [110, 96], [130, 60], [110, 40]]) + '" fill="#c98f8c" stroke="' + INK + '" stroke-width="2.2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", r);
}
// a magnified circle of neurons: dense (crow) or sparse (monkey), they twinkle
function neurons(cx, cy, r, n, t, col) {
  var s = ""; for (var i = 0; i < n; i++) { var a = hash(i) * 6.283, d = Math.sqrt(hash(i + 70)) * (r - 8), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, on = Math.sin(t * 5 + i) > .6;
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (on ? 5 : 3.6) + '" fill="' + (on ? ORANGE : (col || BRAIN_D)) + '"/>'; }
  return s;
}
function bulb(x, y, k, t) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + t * .5; s += '<path d="M' + f(x + Math.cos(a) * 44) + ' ' + f(y + Math.sin(a) * 44) + ' L' + f(x + Math.cos(a) * 58) + ' ' + f(y + Math.sin(a) * 58) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s + C(x, y, 30, "#f1d27a", 2.4) + R(x - 12, y + 28, 24, 18, GREY, 2), k); }
function magnifier(x, y, s, inner) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<circle r="60" fill="#e9eef0" opacity=".55"/>' + (inner || "") + '<circle r="60" fill="none" stroke="' + INK + '" stroke-width="7"/><path d="M42 42 L100 100" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M42 42 L100 100" stroke="' + WOOD + '" stroke-width="9" stroke-linecap="round"/>'); }
function branch(x1, y1, x2, y2, w) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' Q' + f((x1 + x2) / 2) + ' ' + f((y1 + y2) / 2 + 14) + ' ' + f(x2) + ' ' + f(y2) + '" stroke="' + INK + '" stroke-width="' + f((w || 16) + 4) + '" stroke-linecap="round" fill="none"/><path d="M' + f(x1) + ' ' + f(y1) + ' Q' + f((x1 + x2) / 2) + ' ' + f((y1 + y2) / 2 + 14) + ' ' + f(x2) + ' ' + f(y2) + '" stroke="#7a5a3c" stroke-width="' + f(w || 16) + '" stroke-linecap="round" fill="none"/>'; }
// a clear tube (cut-away): glass walls, water to level lv, a floating bit of food
function tube(x, y, w, h, lv, t, opt) {
  opt = opt || {}; var s = "";
  if (lv > 0) s += waterCut(x + 4, y + h - lv, w - 8, lv - 4, t);
  s += '<path d="M' + f(x) + ' ' + f(y) + ' V' + f(y + h) + ' H' + f(x + w) + ' V' + f(y) + '" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(x + 10) + ' ' + f(y + 14) + ' V' + f(y + h - 20) + '" stroke="#fff" stroke-width="4" opacity=".7"/>';
  return s;
}

// ═════ the shots (panel world 640 × 786) ═════
// 6 · why soak it: dry bread crumbles out of the beak; soaked bread stays in one soft piece; thumbnail: rusk dipped in tea
shot(6, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var k = at(u, 2.4, .6), s = paper() + ground(640);
  s += crow(250, 640, { s: .95, head: 10 + 4 * Math.sin(t * 3) });
  var bx = 250 + 205 * .95, by = 640 - 222 * .95;
  s += k < 1 ? G("", bread(bx + 8, by + 6, .62, false, 8) + crumbs(bx, by + 20, u, 8), 1 - k) : "";
  s += G("", bread(bx + 8, by + 6, .62, true, 8), k);
  s += tag(k < .5 ? "ناشف: بيتفتت" : "مبلول: يتقطع", 320, 120, at(u, .3, .3), 30, k < .5 ? ORANGE : BLUE);
  s += iconBox(530, 120, 150, '<path d="M-44 -10 H44 L36 46 H-36 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M-40 6 H40 L36 46 H-36 Z" fill="#b5713f" opacity=".75"/>' + G("rotate(-20)", R(-12, -66, 26, 70, "#e1b878", 2)) + '<path d="M44 0 q22 0 18 18 q-4 14 -22 10" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + T("بقسماط", 0, 70, 20, INK, 700), at(u, d * .62, .3));
  return s;
});
// 7 · scientists noticed: dry and big pieces get dunked more than soft ones
shot(7, push(320, 390, 1.04, 0.98), function (u, d, t) {
  var s = paper() + waterCut(60, 560, 520, 120, t);
  var rows = [["ناشف وكبير", 1, 200, true], ["طري وصغير", 0, 400, false]];
  rows.forEach(function (rw, i) { var y = rw[2], kk = at(u, .3 + i * .8, .4);
    s += G("", T(rw[0], 590, y + 10, 30, i ? MUTE : ORANGE, 800, "start"), kk);
    s += G("", bread(300, y, rw[1] ? .95 : .55, false, 0), kk);
    s += rw[3] ? arrow(300, y + 40, 300, 540, BLUE, 5, at(u, 1.6, .5)) + check(110, y, 1.2, at(u, 2.1, .4)) : cross(110, y, .9, at(u, 2.4, .4)); });
  return s;
});
// 8 · Oxford 2002: Betty, a tube with a little food bucket at the bottom, a straight wire beside it
function bettySet(u, t, bend, lift) {
  var s = paper() + ground(660), tx = 420, ty = 300;
  s += R(tx - 10, ty + 340, 120, 20, WOOD, 2);
  s += '<path d="M' + tx + ' ' + ty + ' V' + (ty + 340) + ' M' + (tx + 100) + ' ' + ty + ' V' + (ty + 340) + '" stroke="' + INK + '" stroke-width="3"/><path d="M' + (tx + 12) + ' ' + (ty + 10) + ' V' + (ty + 320) + '" stroke="#fff" stroke-width="5" opacity=".6"/>';
  var by = ty + 290 - lift * 260; s += G("translate(" + (tx + 50) + " " + f(by) + ")", '<path d="M-26 -20 L26 -20 L20 24 L-20 24 Z" fill="#c6c6c0" stroke="' + INK + '" stroke-width="2.2"/><path d="M-24 -20 Q0 -52 24 -20" stroke="' + INK + '" stroke-width="2.6" fill="none"/>' + C(-8, -24, 6, "#b5713f", 1.4) + C(6, -26, 6, "#b5713f", 1.4));
  return s;
}
function wire(x, y, len, bend, ang) {   // a wire held at (x,y), straight along ang, its far end bent into a hook by `bend` 0..1
  var a = ang * Math.PI / 180, e = [x + Math.cos(a) * len, y + Math.sin(a) * len], hk = 34 * bend, bx = e[0] + Math.cos(a + Math.PI / 2 * 1.0) * 0;
  var d = "M" + f(x) + " " + f(y) + " L" + f(e[0]) + " " + f(e[1]);
  if (bend > 0) d += " q" + f(Math.cos(a) * 22 - Math.sin(a) * hk * .2) + " " + f(Math.sin(a) * 22 + Math.cos(a) * hk * .2) + " " + f(-Math.sin(a) * hk) + " " + f(Math.cos(a) * hk) + " l" + f(-Math.cos(a) * 14 * bend) + " " + f(-Math.sin(a) * 14 * bend);
  return '<path d="' + d + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="#b9bcc0" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
}
shot(8, push(330, 420, 0.94, 1.02), function (u, d, t) {
  var s = bettySet(u, t, 0, 0) + crow(150, 660, { s: .9, head: 4 * Math.sin(t * 2) });
  s += G("", wire(250, 640, 220, 0, -2), at(u, 2.2, .4));
  s += label(470, 570, 330, 420, "سطل أكل", OLIVE, at(u, 1.4, .5), 24) + label(380, 638, 420, 730, "سلك مستقيم", ORANGE, at(u, 3.4, .5), 24);
  return s + tag("أكسفورد · 2002", 180, 120, at(u, .5, .3), 30) + T("بيتي", 150, 330, 30, OLIVE, 800);
});
// 9 · she bends it into a hook with her beak, then fishes the bucket out
shot(9, push(380, 420, 1.0, 1.1), function (u, d, t) {
  var bend = at(u, .6, 1.4), lift = at(u, 2.6, d - 3.2), s = bettySet(u, t, bend, lift);
  var hx = 470, hy = 300 - 30 + 290 * (1 - lift) - 20;
  s += crow(250, 640, { s: .9, head: lerp(30, -10, lift) });
  s += lift > 0 ? '<path d="M' + f(hx) + ' ' + f(hy) + ' L' + f(hx) + ' ' + f(hy - 120) + '" stroke="' + INK + '" stroke-width="7"/><path d="M' + f(hx) + ' ' + f(hy) + ' L' + f(hx) + ' ' + f(hy - 120) + '" stroke="#b9bcc0" stroke-width="3.4"/>' : G("", wire(300, 560, 160, bend, 0), 1);
  s += inset(220, 210, 100, G("translate(-60 0)", wire(0, 0, 70, bend, 0)) + T("خطاف", 0, 80, 26, ORANGE, 800), at(u, .4, .3));
  return s;
}, { tr: "in" });
// 10 · nobody had taught her to bend wire
shot(10, push(320, 380, 1.06, 0.98), function (u, d, t) {
  return paper() + crow(300, 600, { s: 1.1, head: -6 + 4 * Math.sin(t * 2) }) + G("", wire(370, 420, 120, 1, -30), 1) + T("؟", 120, 260, 120, ORANGE, 800) +
    tag("محدش علّمها", 320, 690, at(u, .3, .3), 34, ORANGE);
});
// 11–12 · 007's eight-step puzzle (BBC «Inside the Animal Mind»): the real clip, eight numbered steps lighting up
shot(11, push(320, 380, 0.98, 1.04), function (u, d, t) {
  var tot = LN[13].start - LN[11].start, s = paper() + phone(320, 330, 540, "puzzle", u, { src: "BBC · Inside the Animal Mind", k: at(u, 0, .4), rate: 120 / 10 / Math.max(8, tot) });
  for (var i = 0; i < 8; i++) { var on = u > 1 + i * (tot - 2) / 8; s += callout(String(i + 1), 110 + i * 60, 600, on ? 1 : .0001, 22) + (on ? "" : C(110 + i * 60, 600, 22, PAPER, 1.6) + N(String(i + 1), 110 + i * 60, 609, 22, MUTE)); }
  s += G("", T("007", 320, 90, 40, OLIVE, 800), at(u, .4, .3));
  return s + (u > LN[12].start - LN[11].start ? numBox(count(2.5, at(u, LN[12].start - LN[11].start + 2.5, 1), 1) + " min", 320, 700, at(u, LN[12].start - LN[11].start + 2.4, .3), 34) : "");
});
// 13 · how can such a small brain do all this? a crow head cut open
shot(13, push(320, 380, 1.0, 1.12), function (u, d, t) {
  return paper() + G("translate(320 470) scale(2.2) translate(-110 232)", crow(0, 0, { s: 1 })) + '<circle cx="290" cy="458" r="74" fill="#efe2cf" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="8 6"/>' + crowBrain(296, 470, 0.6, false, t) + '<circle cx="352" cy="446" r="15" fill="#141216"/><circle cx="357" cy="441" r="5" fill="#fff"/>' + label(270, 420, 200, 250, "المخ", ORANGE, at(u, .6, .4), 28) + T("؟", 520, 200, 110, ORANGE, 800);
});
// 14 · the brain is about the size of a walnut, but its neurons are packed together
shot(14, push(320, 400, 0.98, 1.04), function (u, d, t) {
  var s = paper() + crowBrain(180, 300, 1.4, false, t) + G("", walnut(470, 300, 1.15), at(u, .3, .4)) + G("", T("=", 325, 315, 70, INK, 800), at(u, .6, .3));
  s += label(470, 360, 470, 420, "حباية جوز", OLIVE, at(u, .8, .4), 24);
  s += inset(320, 600, 150, neurons(0, 0, 150, 160, t), at(u, 2.2, .3)) + G("", draw("M180 360 L250 480", 1, INK, 1.5), at(u, 2.2, .3));
  return s;
}, { tr: "in" });
// 15 · its forebrain holds as many neurons as a much bigger monkey brain
shot(15, push(320, 400, 1.02, 0.97), function (u, d, t) {
  var s = paper() + crowBrain(150, 250, 1.0, false, t) + monkeyBrain(430, 250, 1.1, t);
  s += inset(150, 520, 110, neurons(0, 0, 110, 120, t), at(u, .4, .3)) + inset(440, 520, 110, neurons(0, 0, 110, 40, t), at(u, .8, .3));
  s += G("", T("≈", 295, 540, 80, ORANGE, 800), at(u, 1.6, .3)) + G("", T("غراب", 150, 680, 28, OLIVE, 800) + T("قرد", 440, 680, 28, INK, 800), at(u, 1, .3));
  return s;
});
// 16 · the back of the forebrain (NCL) works like the part behind your forehead: planning and deciding
shot(16, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + crowBrain(170, 330, 1.5, true, t);
  var hf = fig({ x: 480, y: 580, s: 1.5, hands: [null, null] });
  s += G("", '<clipPath id="hh"><rect x="300" y="100" width="340" height="440"/></clipPath><g clip-path="url(#hh)">' + whole(hf) + '</g>', at(u, .3, .4));
  s += G("", '<ellipse cx="' + f(hf.hd[0] - 18) + '" cy="' + f(hf.hd[1] - 12) + '" rx="18" ry="16" fill="' + ORANGE + '" opacity="' + f(.6 + .25 * Math.sin(t * 4)) + '"/>', at(u, 1, .4));
  s += G("", T("=", 330, 340, 60, INK, 800), at(u, .9, .3)) + tag("بيخطط وبياخد القرار", 320, 640, at(u, 1.8, .3), 30, ORANGE) + bulb(170, 130, at(u, 1.2, .3), t);
  return s;
}, { tr: "out" });
// 17–19 · the crow and the pitcher, for real: the clip; thumbnail of the fable's pitcher; then sink ✓ float ✗ and 5–7 years
shot(17, push(320, 380, 0.96, 1.04), function (u, d, t) {
  var tot = LN[20].start - LN[17].start, s = paper() + phone(390, 360, 320, "water", u, { src: "Water displacement by a crow", k: at(u, 0, .4), rate: 17.5 / Math.max(10, tot) });
  s += iconBox(95, 110, 150, '<path d="M-30 -50 H30 L26 -34 Q50 -10 42 30 Q36 54 0 56 Q-36 54 -42 30 Q-50 -10 -26 -34 Z" fill="#c58e5a" stroke="' + INK + '" stroke-width="2"/><path d="M42 -20 Q66 -14 56 14" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("الجرة", 0, 74, 20, INK, 700), at(u, .6, .3));
  var u19 = u - (LN[19].start - LN[17].start);
  if (u19 > 0) s += G("", tag("بتغطس", 100, 290, 1, 24, BLUE) + check(100, 345, .8, at(u19, .3, .4)) + tag("بتعوم", 100, 430, 1, 24, MUTE) + cross(100, 480, .55, at(u19, .7, .4)), at(u19, 0, .3)) +
    numBox("5–7", 100, 600, at(u19, 1.6, .3), 30) + G("", T("سنين", 100, 662, 24, INK, 700), at(u19, 1.8, .3));
  return s;
});
// 20 · Japan (BBC «The Life of Birds»): walnuts dropped on the road for the cars to crack
shot(20, push(320, 390, 0.98, 1.05), function (u, d, t) {
  return paper() + phone(320, 360, 540, "japan", u, { src: "BBC · The Life of Birds", k: at(u, 0, .4) }) + tag("اليابان", 320, 110, at(u, .4, .3), 30, OLIVE) + G("", walnut(110, 620, .55) + arrow(160, 640, 230, 650, ORANGE, 4, at(u, 1.2, .3)), at(u, .8, .3));
});
// 21 · 2024: crows can count out loud, one to four calls on cue
shot(21, push(300, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + ground(660), n = 0, start = 2.4, per = (d - start - .5) / 10, cnt = 0, kk = 0;
  // calls in four rounds: 1, 2, 3, 4 (ten calls in all)
  var rounds = [1, 2, 3, 4], calls = [], tt = start; rounds.forEach(function (r) { for (var i = 0; i < r; i++) { calls.push([tt, r, i + 1]); tt += per * .85; } tt += per * .4; });
  var cur = null; calls.forEach(function (c) { if (u >= c[0]) cur = c; });
  var open = 0; calls.forEach(function (c) { var x = (u - c[0]) / (per * .7); if (x > 0 && x < 1) open = Math.sin(x * Math.PI); });
  s += crow(200, 660, { s: 1.0, open: open, head: -8 * open });
  calls.forEach(function (c) { s += caw(200 + 214, 660 - 222, (u - c[0]) / (per * .9), -.3); });
  var target = cur ? cur[1] : 0; s += R(400, 150, 200, 200, "#f4ecdb", 2.4) + (target ? N(String(target), 500, 290, 130, ORANGE) : T("؟", 500, 290, 110, MUTE, 800));
  s += T("المطلوب", 500, 130, 24, INK, 700);
  var said = cur ? cur[2] : 0; for (var i = 0; i < 4; i++) s += C(392 + i * 54, 372, 19, i < said ? ORANGE : PAPER, 2);
  return s + tag("2024", 120, 130, at(u, .3, .3), 30, ORANGE);
});
// 22 · crows have taught people since long ago: a crow, an old scroll, a lit idea passing to a head
shot(22, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var hf = fig({ x: 480, y: 640, s: 1.5, hands: [null, null] });
  return paper() + whole(hf) + crow(160, 560, { s: .8, head: 4 * Math.sin(t * 2) }) +
    draw("M290 360 Q370 260 440 330", at(u, .4, .6), ORANGE, 4, ' stroke-dasharray="10 8"') + bulb(hf.hd[0], hf.hd[1] - 110, at(u, 1, .3), t) + tag("من زمان", 200, 160, at(u, .2, .3), 32, ORANGE);
});
// 23 · the oldest lesson (Quran, al-Ma'ida 31): a crow scratching the ground to show how to bury — drawn as soil and a crow only
shot(23, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var dig = at(u, .5, d - 1.5), s = paper() + R(-300, 520, 1240, 600, SOIL, 0) + '<rect x="-300" y="520" width="1240" height="600" fill="url(#hatch)"/>';
  [560, 610, 680].forEach(function (y, j) { s += '<path d="M-300 ' + y + ' Q100 ' + (y + 10) + ' 340 ' + (y - 6) + ' T940 ' + y + '" stroke="' + SOIL_D + '" stroke-width="' + (3 - j * .6) + '" fill="none"' + (j ? ' stroke-dasharray="10 8"' : "") + '/>'; });
  s += '<path d="M-300 520 H' + f(330 - 70 * dig) + ' Q' + f(380) + ' ' + f(520 + 80 * dig) + ' ' + f(430 + 70 * dig) + ' 520 H940" stroke="' + INK + '" stroke-width="2.8" fill="' + SOIL + '"/>';
  s += '<path d="M' + f(330 - 70 * dig) + ' 520 Q380 ' + f(520 + 80 * dig) + ' ' + f(430 + 70 * dig) + ' 520 Z" fill="#6e5538" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + f(470 + 70 * dig) + ' 520 q30 ' + f(-30 * dig) + ' 70 0 Z" fill="' + SOIL + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 5; i++) { var k = (u * 1.6 + i * .2) % 1; if (dig > 0 && dig < 1) s += C(380 + 30 * k + i * 6, 500 - 90 * Math.sin(k * Math.PI), 5, "#6e5538", 1.2); }
  s += crow(220, 520, { s: .85, head: 30 + 14 * Math.sin(t * 8) * (dig > 0 && dig < 1 ? 1 : 0) });
  return s + tag("سورة المائدة · 31", 320, 130, at(u, .3, .3), 30, OLIVE);
});
// 24 · Sweden (Corvid Cleaning, The Guardian): cigarette butts into a machine that pays in food
shot(24, push(320, 390, 0.98, 1.05), function (u, d, t) {
  return paper() + phone(320, 340, 520, "sweden", u, { src: "The Guardian · Corvid Cleaning", k: at(u, 0, .4) }) + tag("السويد", 320, 90, at(u, .4, .3), 30, OLIVE) +
    G("", R(130, 610, 70, 18, "#f2efe6", 2) + R(200, 610, 26, 18, "#d8a067", 2) + arrow(250, 620, 380, 620, ORANGE, 5, at(u, 1.4, .4)) + C(420, 620, 14, "#b5713f", 2) + C(446, 616, 12, "#c58e5a", 2) + T("أكل", 520, 630, 28, BLUE, 800), at(u, 1, .3));
});
// 25–27 · faces (NOVA «Bird Brain»): the mask, crows still scolding years later, even the young ones
shot(25, push(320, 380, 0.96, 1.03), function (u, d, t) {
  var tot = LN[28].start - LN[25].start, s = paper() + phone(270, 380, 290, "faces", u, { src: "NOVA · Bird Brain", k: at(u, 0, .4), rate: 19 / Math.max(10, tot) });
  s += tag("جامعة واشنطن", 500, 110, at(u, .4, .3), 24, OLIVE);
  var u26 = u - (LN[26].start - LN[25].start), u27 = u - (LN[27].start - LN[25].start);
  if (u26 > 0) s += tag("بعد سنين", 520, 330, at(u26, .3, .3), 26, ORANGE) + caw(500, 440, (u26 * 1.4) % 1, 0);
  if (u27 > 0) s += G("", fledgling(500, 700, { s: .7, beg: .3 }), at(u27, .2, .4)) + label(520, 590, 560, 520, "الصغيرين", OLIVE, at(u27, .6, .4), 22);
  return s;
});
// 28 · something like a wake: a dead crow on the ground, the others gather and call, more fly in
function funeral(u, t, k, opt) {
  opt = opt || {}; var s = paper() + ground(640);
  s += G("translate(320 640) rotate(180) scale(-1 1)", crow(0, 6, { s: .6, head: 30 }));
  [[90, 640, .62, false, 0], [560, 640, .62, true, 1.3], [170, 300, .5, false, .6]].forEach(function (c, i) {
    s += G("", crow(c[0], c[1], { s: c[2], flip: c[3], open: Math.max(0, Math.sin(t * 6 + c[4] * 3)) * .9, head: -10 }), at(u, .2 + i * .3, .4));
    s += caw(c[0] + (c[3] ? -1 : 1) * 214 * c[2], c[1] - 222 * c[2], ((t * 1.3 + c[4]) % 1), c[3] ? Math.PI + .3 : -.3);
  });
  s += branch(-40, 300, 300, 320, 14);
  for (var i = 0; i < 3; i++) { var kk = clamp(k * 1.6 - i * .3); s += G("", flyCrow(lerp(i % 2 ? 760 : -120, 420 - i * 120, kk), lerp(80 + i * 30, 200 + i * 40, kk), .55, t * 9 + i, i % 2 === 1), kk > 0 ? 1 : 0); }
  return s;
}
shot(28, push(320, 420, 0.96, 1.04), function (u, d, t) { return funeral(u, t, at(u, d * .55, d * .4)) + tag("شبه العزا", 320, 760, at(u, .3, .3), 28, ORANGE); });
// 29 · not just grief, an investigation: a magnifier over the dead crow, «who? what?»
shot(29, push(330, 520, 1.1, 1.2), function (u, d, t) {
  var mx = 320 + 40 * Math.sin(t * 1.2);
  return funeral(u + 5, t, 1) + magnifier(mx, 560, 1.1, "") + tag("مين؟ إيه؟", 330, 340, at(u, 1.2, .3), 34, ORANGE) + tag("تحقيق", 330, 230, at(u, .3, .3), 36, INK);
}, { tr: "in" });
// 30 · a person holding a dead crow: they learn the face and scold it for months
shot(30, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + ground(700);
  var hf = fig({ x: 420, y: 700 - 212, s: 1, hands: [[300, 470], null], bend: [-1, -1], tilt: 6 });
  s += whole(hf) + G("translate(" + f(hf.wr[0][0] - 4) + " " + f(hf.wr[0][1] + 6) + ") rotate(172) scale(.42)", crow(0, 0, { s: 1, head: 30 }));
  s += '<rect x="' + f(hf.hd[0] - 40) + '" y="' + f(hf.hd[1] - 44) + '" width="80" height="88" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="12 8" opacity="' + f(at(u, 1, .4)) + '"/>';
  s += branch(-40, 200, 260, 220, 12) + crow(90, 210, { s: .5, open: Math.max(0, Math.sin(t * 7)) * .9, head: 6 }) + caw(90 + 107, 210 - 111, (t * 1.4) % 1, -.2) + crow(200, 214, { s: .45, open: Math.max(0, Math.sin(t * 7 + 2)) * .9 }) + caw(200 + 96, 214 - 100, (t * 1.4 + .5) % 1, 0);
  return s + tag("شهور", 520, 160, at(u, d * .55, .3), 34, ORANGE);
});
// 31 · they live in families; the young sometimes stay with their parents for years
shot(31, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + branch(-60, 560, 700, 540, 22) + '<path d="' + smooth([[180, 540], [200, 500], [320, 492], [440, 500], [460, 540], [320, 570]]) + '" fill="#9b7a52" stroke="' + INK + '" stroke-width="2.4"/><path d="M200 520 L440 512 M210 534 L430 528" stroke="#6e5538" stroke-width="2"/>';
  s += crow(110, 548, { s: .62, head: 6 + 4 * Math.sin(t * 2) }) + crow(560, 544, { s: .62, flip: true, head: 6 + 4 * Math.sin(t * 2 + 1) });
  s += fledgling(280, 520, { s: .5, beg: .4 }) + fledgling(370, 520, { s: .48, beg: .2, flip: true });
  return s + tag("عيلة", 320, 160, at(u, .3, .3), 34, OLIVE) + G("", numBox("سنين", 320, 300, 1, 30), at(u, 1.6, .3));
});
// 32 · what the old one learns reaches the young one — like the bread lesson
shot(32, push(320, 420, 1.04, 0.98), function (u, d, t) {
  var s = paper() + ground(640) + waterCut(240, 600, 160, 40, t) + crow(130, 640, { s: .75, head: 20 + 10 * Math.sin(t * 3) }) + fledgling(500, 640, { s: .7, beg: .5, flip: true });
  s += bread(320, 600, .5, true, 0) + draw("M200 300 Q320 200 450 300", at(u, .3, .7), ORANGE, 4) + arrow(440, 290, 460, 310, ORANGE, 4, at(u, .9, .2));
  return s + tag("درس العيش", 320, 150, at(u, .8, .3), 30, ORANGE);
}, { tr: "out" });
// 33 · the myth: «a bad omen» — no. One of the smartest animals on Earth
shot(33, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.2, .5);
  return paper() + crow(300, 680, { s: 1.15, head: 4 * Math.sin(t * 2) }) + G("", tag("نذير شؤم", 320, 140, 1, 36, MUTE) + cross(320, 140, 1.4, k), at(u, .2, .3) * (1 - at(u, d * .55, .3))) + G("", crowBrain(436, 410, .5, true, t) + tag("من أذكى الكائنات", 320, 150, 1, 32, ORANGE), at(u, d * .6, .3));
});
// 34 · recap: five things, one per clause
shot(34, push(320, 400, 0.98, 1.03), function (u, d, t) {
  var items = [["بيبل أكله", function () { return bread(0, 0, .55, true, 0); }], ["بيعمل أدواته", function () { return wire(-40, 0, 60, 1, 0); }], ["بيعد", function () { return N("1 2 3", 0, 14, 40, ORANGE); }],
               ["بيفتكر الوشوش", function () { return '<rect x="-34" y="-40" width="68" height="80" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 6"/><ellipse rx="22" ry="28" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'; }],
               ["بيعلّم ولاده", function () { return G("scale(.35) translate(0 120)", fledgling(0, 0, { beg: .5 })); }]];
  var s = paper(), ch = window.CHUNKS[34], l = LN[34], dur = l.end - l.start;
  items.forEach(function (it, i) { var tt = i === 0 ? 0.1 : dur * (ch[Math.min(ch.length - 1, i)] || i / 5), x = i % 2 ? 450 : 190, y = 130 + i * 130; if (i === 4) x = 320;
    y = 110 + i * 128;
    s += G("", R(70, y - 52, 500, 104, "#f4ecdb", 2) + G("translate(" + f(150 + 6 * Math.sin(t * 3 + i)) + " " + f(y + 5 * Math.cos(t * 2.6 + i)) + ")", it[1]()) + T(it[0], 540, y + 11, 30, INK, 800, "start") + check(255, y, .7, at(u, tt + .3, .3)), at(u, Math.max(0, tt - .2), .3)); });
  return s;
}, { tr: "out" });
// 35 · the odd fact: people who feed crows find gifts left for them (the clip the user sent)
shot(35, push(320, 380, 0.97, 1.03), function (u, d, t) {
  var s = paper() + phone(230, 380, 300, "gifts", u, { src: "She Fed the Crows…", k: at(u, 0, .4), rate: 8.2 / Math.max(6, d) });
  ["خرز", "حتت معدن", "فلوس فكة"].forEach(function (w, i) { s += tag(w, 520, 220 + i * 140, at(u, 2.6 + i * .7, .3), 26, i === 2 ? ORANGE : INK); });
  return s + tag("هدايا", 520, 100, at(u, 1.6, .3), 34, ORANGE);
});

// ── opening card: the viral clip in a phone (lines 0–2), then «is that normal?» drawn (3–4); bumper; summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  window.__t = t; CLIPN = 0;
  if (li <= 2) {
    var s = phone(304, 296, 270, "viral", t - LN[0].start, { src: "المقطع المنتشر", k: 1 });
    if (li >= 1) s += tag("بيغطّسه في المية", 130, 90, ease((t - LN[1].start - 1) / .3), 22, BLUE);
    if (li >= 2) s += tag("ياكل لوحده", 480, 600, ease((t - LN[2].start - .5) / .3), 22, ORANGE);
    return s;
  }
  var u = t - LN[3].start, s2 = ground(560, -100, 720) + waterCut(270, 530, 150, 30, t) + crow(130, 560, { s: .62, head: 18 + 12 * Math.sin(t * 3.4) }) + fledgling(500 + 8 * Math.sin(t * 5), 560, { s: .62, beg: .7, flip: true }) + bread(345, 530, .4, true, 0);
  s2 += G("translate(304 160) rotate(" + f(8 * Math.sin(t * 2.6)) + ") scale(" + f(1 + .08 * Math.sin(t * 4)) + ")", T("؟", 0, 40, 150, ORANGE, 800));
  if (li >= 4) s2 += check(470, 150, 1.3, ease((t - LN[4].start - .3) / .4), OLIVE);
  return s2;
};
SCENE.bumper = function (u, t) { window.__t = t; return '<rect x="0" y="0" width="180" height="200" fill="#e3d7bd"/>' + G("translate(-36 236) scale(.62)", crow(0, 0, { s: 1, head: 6 * Math.sin(t * 3), open: Math.max(0, Math.sin(t * 5)) * .5 })); };
SCENE.outro = function (svg, u, t) {
  window.__t = t;
  return '<rect x="0" y="230" width="600" height="60" fill="#cdbf9e"/>' + crow(250, 236, { s: .72, head: 6 * Math.sin(t * 2) }) + bread(470, 214, .4, true, 0) +
    callout("1", 470, 160, ease(u / .3)) + callout("2", 140, 70, ease(u / .3 - .5)) + callout("3", 320, 40, ease(u / .3 - 1)) + callout("4", 60, 180, ease(u / .3 - 1.5));
};

// the bumper line says «تعالوا نعرف إيه حكاية الغراب» in this episode, not «هشرحهالك في دقيقة»
(function () { var sub = document.querySelector("#bumper .sub"); if (sub) sub.innerHTML = 'تعالوا نعرف حكاية <span class="k-o">الغراب.</span>'; })();
// clips: decode every sprite once, and when a frame shows a clip, let render.js wait until it is painted
var CLIP_IMGS = Object.keys(window.CLIPS).map(function (n) { var im = new Image(); im.src = "../clips/" + n + ".jpg"; return im; });
var CLIPS_READY = Promise.all(CLIP_IMGS.map(function (im) { return im.decode().catch(function () {}); }));
document.addEventListener("DOMContentLoaded", function () {
  var r = window.renderAt;
  window.renderAt = function (t) { CLIP_ON = false; r(t); if (!CLIP_ON) return; return CLIPS_READY.then(function () { return new Promise(function (res) { requestAnimationFrame(function () { requestAnimationFrame(res); }); }); }); };
});
