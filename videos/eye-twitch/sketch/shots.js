// ── «ليه عينك بترف لوحدها؟» — drawings. Shapes follow real anatomy (refs/SOURCES.md): the eye is the person's right eye
// seen from the front, outer corner on the left and the pink inner corner (caruncle) on the right. The blink muscle
// (orbicularis oculi) is drawn as concentric elliptical bands of fibres round the eye, cut into small teams (motor
// units); the facial nerve comes in from the temple side (left) and sends one branch to each team. Reference hand:
// «طب إزاي؟» v06 (brain with switches) and v04 (body cut).

var IRIS = "#6b4a2f", IRIS2 = "#8a6440", SCLERA = "#f4efe6", LIDPINK = "#d98c80", BROW = "#3e3128", NERVE = "#e2c86a",
    FIB = ["#c98a72", "#b97d66", "#d29a80", "#bf8a6c", "#c47f6a", "#d7a68a"], LAMP = "#f2d27a", DARKWIN = "#5d6b74";
function bez(p0, p1, p2, p3, k) { var m = 1 - k; return [m * m * m * p0[0] + 3 * m * m * k * p1[0] + 3 * m * k * k * p2[0] + k * k * k * p3[0], m * m * m * p0[1] + 3 * m * m * k * p1[1] + 3 * m * k * k * p2[1] + k * k * k * p3[1]]; }
function pts(a) { return a.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }

// ── the eye, close-up. o: {blink 0 open … 1 shut, tw: twitch strength 0..1, tx: where on the lower lid (0 outer … 1 inner), t, skin: false}
// the twitch is a burst of small fast flicks of one patch of the lower lid, like the real thing
function flick(t) { var b = (t % 1.7) < 1.1 ? 1 : 0.15; return b * Math.max(0, Math.sin(t * 2 * Math.PI * 6.5)) * (0.6 + 0.4 * Math.sin(t * 13.7)); }
function eye(cx, cy, s, o) {
  o = o || {}; var t = o.t || 0, bl = clamp(o.blink || 0), tw = o.tw || 0, tx = o.tx == null ? 0.38 : o.tx, out = "";
  var L = [cx - 200 * s, cy + 6 * s], M = [cx + 192 * s, cy + 18 * s];
  var U1 = [cx - 120 * s, cy - 118 * s], U2 = [cx + 96 * s, cy - 130 * s], D1 = [cx + 96 * s, cy + 74 * s], D2 = [cx - 110 * s, cy + 80 * s];
  var up = [], lo = [], N = 28, i, fl = tw * flick(t);
  for (i = 0; i <= N; i++) {
    var k = i / N, a = bez(L, U1, U2, M, k), b = bez(L, D2, D1, M, k);   // lower lid sampled outer → inner too
    var bump = Math.exp(-Math.pow((k - tx) / 0.11, 2)) * fl * 9 * s;
    b = [b[0], b[1] - bump];
    lo.push(b); up.push([lerp(a[0], b[0], bl * 0.97), lerp(a[1], b[1] - 3 * s, bl * 0.97)]);
  }
  if (o.skin !== false) {
    // brow, lid crease, lower-lid fold and a soft shadow under the brow
    out += '<path d="M' + f(cx - 300 * s) + ' ' + f(cy - 150 * s) + ' C' + f(cx - 160 * s) + ' ' + f(cy - 290 * s) + ' ' + f(cx + 120 * s) + ' ' + f(cy - 300 * s) + ' ' + f(cx + 250 * s) + ' ' + f(cy - 225 * s) + ' L' + f(cx + 245 * s) + ' ' + f(cy - 200 * s) + ' C' + f(cx + 110 * s) + ' ' + f(cy - 262 * s) + ' ' + f(cx - 150 * s) + ' ' + f(cy - 250 * s) + ' ' + f(cx - 300 * s) + ' ' + f(cy - 120 * s) + ' Z" fill="' + BROW + '" stroke="' + INK + '" stroke-width="2"/>';
    for (i = 0; i < 22; i++) { var bk = i / 21, bp = bez([cx - 290 * s, cy - 140 * s], [cx - 150 * s, cy - 275 * s], [cx + 110 * s, cy - 285 * s], [cx + 245 * s, cy - 214 * s], bk); out += '<path d="M' + f(bp[0]) + ' ' + f(bp[1] + 8 * s) + ' l' + f(18 * s) + ' ' + f(-14 * s) + '" stroke="#6a5544" stroke-width="' + f(2 * s) + '" stroke-linecap="round"/>'; }
    var cr = [cx - 205 * s, cy - 20 * s], c1 = [cx - 120 * s, cy - 160 * s], c2 = [cx + 100 * s, cy - 172 * s], c3 = [cx + 200 * s, cy - 2 * s];
    out += '<path d="M' + f(cr[0]) + ' ' + f(cr[1]) + ' C' + f(c1[0]) + ' ' + f(c1[1] + 40 * s * bl) + ' ' + f(c2[0]) + ' ' + f(c2[1] + 40 * s * bl) + ' ' + f(c3[0]) + ' ' + f(c3[1]) + '" stroke="' + SKIN2 + '" stroke-width="' + f(2.4 * s) + '" fill="none"/>';
    out += '<path d="M' + f(cx - 170 * s) + ' ' + f(cy + 64 * s) + ' C' + f(cx - 80 * s) + ' ' + f(cy + 126 * s) + ' ' + f(cx + 80 * s) + ' ' + f(cy + 120 * s) + ' ' + f(cx + 170 * s) + ' ' + f(cy + 60 * s) + '" stroke="' + SKIN2 + '" stroke-width="' + f(1.8 * s) + '" fill="none" opacity=".7"/>';
  }
  // the opening: white of the eye, iris and pupil, clipped to the lids
  var id = "eo" + (++CLIPN), open = pts(up) + " " + pts(lo.slice().reverse()).replace(/^M/, "L") + " Z";
  out += '<clipPath id="' + id + '"><path d="' + open + '"/></clipPath>';
  var ix = cx + (o.look || 0) * 30 * s, iy = cy - 8 * s;
  out += '<g clip-path="url(#' + id + ')"><rect x="' + f(cx - 220 * s) + '" y="' + f(cy - 160 * s) + '" width="' + f(440 * s) + '" height="' + f(300 * s) + '" fill="' + SCLERA + '"/>' +
    '<path d="M' + f(cx - 200 * s) + ' ' + f(cy - 30 * s) + ' Q' + f(cx) + ' ' + f(cy - 160 * s) + ' ' + f(cx + 200 * s) + ' ' + f(cy - 20 * s) + ' L' + f(cx + 200 * s) + ' ' + f(cy - 160 * s) + ' L' + f(cx - 200 * s) + ' ' + f(cy - 160 * s) + ' Z" fill="' + INK + '" opacity=".12"/>' +
    C(ix, iy, 82 * s, IRIS, 2.2);
  for (i = 0; i < 28; i++) { var ang = i / 28 * Math.PI * 2; out += '<path d="M' + f(ix + Math.cos(ang) * 36 * s) + ' ' + f(iy + Math.sin(ang) * 36 * s) + ' L' + f(ix + Math.cos(ang) * 76 * s) + ' ' + f(iy + Math.sin(ang) * 76 * s) + '" stroke="' + IRIS2 + '" stroke-width="' + f(2.4 * s) + '"/>'; }
  out += C(ix, iy, 34 * s, "#1c1510", 0) + '<circle cx="' + f(ix + 30 * s) + '" cy="' + f(iy - 30 * s) + '" r="' + f(13 * s) + '" fill="#fff" opacity=".9"/>' +
    '<path d="' + pts(up) + '" stroke="' + INK + '" stroke-width="' + f(14 * s) + '" fill="none" opacity=".18"/></g>';
  // pink inner corner and the lid rims
  out += '<ellipse cx="' + f(M[0] - 14 * s) + '" cy="' + f(M[1] - 2 * s) + '" rx="' + f(13 * s) + '" ry="' + f(10 * s) + '" fill="' + LIDPINK + '" stroke="' + INK + '" stroke-width="1.4"/>';
  out += '<path d="' + pts(lo) + '" stroke="' + LIDPINK + '" stroke-width="' + f(6 * s) + '" fill="none"/><path d="' + pts(lo) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  out += '<path d="' + pts(up) + '" stroke="' + INK + '" stroke-width="' + f(4.5 * s) + '" fill="none" stroke-linecap="round"/>';
  // lashes: upper ones curl up, lower ones short and down
  for (i = 3; i < N - 2; i += 1) { var p = up[i], q = up[i + 1], nx = q[1] - p[1], ny = -(q[0] - p[0]), nl = Math.hypot(nx, ny) || 1, len = (20 + 10 * Math.sin(i / N * Math.PI)) * s * (1 - .35 * bl), dirY = bl > .6 ? -1 : 1;
    out += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' q' + f(nx / nl * len * .3 - 6 * s) + ' ' + f(ny / nl * len * .5 * dirY) + ' ' + f(nx / nl * len * .6 - 14 * s) + ' ' + f(ny / nl * len * dirY) + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" fill="none" stroke-linecap="round"/>'; }
  for (i = 4; i < N - 3; i += 2) { var lp = lo[i]; out += '<path d="M' + f(lp[0]) + ' ' + f(lp[1] + 2) + ' l' + f(-3 * s) + ' ' + f(9 * s) + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '" stroke-linecap="round"/>'; }
  // twitch marks beside the flicking patch
  if (tw > 0.05) { var tp = lo[Math.round(tx * N)]; for (i = 0; i < 3; i++) { var a2 = Math.PI * (0.55 + i * 0.18); out += G("", '<path d="M' + f(tp[0] + Math.cos(a2) * 40 * s) + ' ' + f(tp[1] + Math.sin(a2) * 40 * s + 10 * s) + ' l' + f(Math.cos(a2) * 22 * s) + ' ' + f(Math.sin(a2) * 22 * s) + '" stroke="' + ORANGE + '" stroke-width="' + f(5 * s) + '" stroke-linecap="round"/>', clamp(tw * (0.3 + fl))); } }
  return out;
}
function lowerLid(cx, cy, s, tx) { return bez([cx - 200 * s, cy + 6 * s], [cx - 110 * s, cy + 80 * s], [cx + 96 * s, cy + 74 * s], [cx + 192 * s, cy + 18 * s], tx); }
function skin() { return '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + SKIN + '"/><rect x="-2000" y="-2000" width="4640" height="4800" fill="url(#hatch)" opacity=".12"/>'; }

// ── the blink muscle: rings of fibre teams round the eye. o: {k: how much is drawn, hl: [team ids] in orange, fire: 0..1 (the
// twitching teams light and jitter), all: 0..1 (every team lit), sq: 0..1 (squeeze), nerves: "tw" | "all" | "one" | "", sig, t, block}
var MUS = (function () {
  var segs = [], id = 0;
  for (var r = 0; r < 7; r++) {
    var a = hash(r * 7 + 1) * 0.4;
    while (a < Math.PI * 2 - 0.15) { var len = 0.28 + hash(id * 3 + 5) * 0.32, b = Math.min(a + len, Math.PI * 2 + hash(r) * 0.4 - 0.05);
      var mid = (a + b) / 2, m = ((mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      segs.push({ id: id, r: r, a: a, b: b, mid: m, col: FIB[Math.floor(hash(id * 11 + 2) * FIB.length)], tw: r <= 2 && m > 1.72 && m < 2.12, one: r === 4 && m > 2.3 && m < 2.8 });
      id++; a = b + 0.05; }
  }
  return segs;
})();
function ringR(r) { return [212 + r * 17, 124 + r * 16]; }
function arcPath(cx, cy, rx, ry, a, b) { var d = "", n = Math.max(3, Math.round((b - a) * 14)); for (var i = 0; i <= n; i++) { var g = lerp(a, b, i / n); d += (i ? " L" : "M") + f(cx + Math.cos(g) * rx) + " " + f(cy + Math.sin(g) * ry); } return d; }
function segMid(cx, cy, sg, sq) { var R = ringR(sg.r), z = 1 - 0.07 * (sq || 0); return [cx + Math.cos(sg.mid) * R[0] * z, cy + Math.sin(sg.mid) * R[1] * z]; }
function muscle(cx, cy, o) {
  o = o || {}; var t = o.t || 0, k = o.k == null ? 1 : o.k, sq = o.sq || 0, z = 1 - 0.07 * sq, out = "", fl = (o.fire || 0) * flick(t), hl = o.hl || [];
  MUS.forEach(function (sg) {
    var vis = clamp(k * 1.6 - sg.r * 0.09); if (vis <= 0) return;
    var R = ringR(sg.r), jit = sg.tw ? fl * 4 : 0, d = arcPath(cx, cy - jit, R[0] * z, R[1] * z, sg.a, lerp(sg.a, sg.b, vis));
    var lit = (sg.tw && fl > 0.25) || (o.all || 0) > 0.5 || hl.indexOf(sg.id) >= 0 || (o.one && sg.one), col = lit ? ORANGE : sg.col;
    if (o.block && sg.tw) col = o.block > 0.5 ? "#9db3c2" : col;
    if (o.team && !lit) col = sg.col;
    out += '<path d="' + d + '" stroke="' + INK + '" stroke-width="20" fill="none" stroke-linecap="butt"/><path d="' + d + '" stroke="' + col + '" stroke-width="16" fill="none"/>' +
           '<path d="' + d + '" stroke="#fff" stroke-width="1.2" fill="none" opacity=".35" stroke-dasharray="7 5"/>';
  });
  return out;
}
// the facial nerve: a trunk from the temple side (left), one branch per team it drives; dashes run along lit branches
function nerves(cx, cy, which, o) {
  o = o || {}; var t = o.t || 0, sq = o.sq || 0, out = "", trunk = [cx - 340, cy + 360], hub = [cx - 250, cy + 200];
  var list = MUS.filter(function (sg) { return which === "all" ? (sg.r === 1 || sg.r === 3 || sg.r === 5) && sg.mid > 1.5 && sg.mid < 4.0 : which === "tw" ? sg.tw : which === "one" ? sg.one : false; });
  out += '<path d="M' + f(trunk[0]) + ' ' + f(trunk[1]) + ' Q' + f(hub[0] - 60) + ' ' + f(hub[1] + 90) + ' ' + f(hub[0]) + ' ' + f(hub[1]) + '" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M' + f(trunk[0]) + ' ' + f(trunk[1]) + ' Q' + f(hub[0] - 60) + ' ' + f(hub[1] + 90) + ' ' + f(hub[0]) + ' ' + f(hub[1]) + '" stroke="' + NERVE + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
  list.forEach(function (sg, i) {
    var m = segMid(cx, cy, sg, sq), R = ringR(6), cp = [cx + Math.cos(sg.mid) * (R[0] + 40), cy + Math.sin(sg.mid) * (R[1] + 40)], d = "M" + f(hub[0]) + " " + f(hub[1]) + " Q" + f(cp[0]) + " " + f(cp[1]) + " " + f(m[0]) + " " + f(m[1]);
    var kk = clamp((o.k == null ? 1 : o.k) * 1.5 - i * 0.04); if (kk <= 0) return;
    out += draw(d, kk, INK, 6) + draw(d, kk, NERVE, 3);
    if (o.sig && kk >= 1) out += '<path d="' + d + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-dasharray="6 22" stroke-dashoffset="' + f(-t * 90 - i * 9) + '" stroke-linecap="round" opacity="' + f(o.sig) + '"/>';
    if (kk >= 1) out += C(m[0], m[1], 5.5, o.sig ? ORANGE : NERVE, 1.6);
  });
  return out;
}
// the eye drawn faintly inside the muscle view
function ghostEye(cx, cy) { return G("", eye(cx, cy, 1, { skin: false }), .55); }
function brain(x, y, s, glow) {
  var d = "M-60 10 C-72 -30 -40 -62 -6 -58 C20 -74 62 -58 64 -24 C84 -6 74 30 46 34 C30 52 -6 50 -18 40 C-46 48 -66 34 -60 10 Z";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", '<path d="' + d + '" fill="' + (glow ? "#e3b0a0" : "#d8a698") + '" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M-40 -20 q14 -12 26 0 t26 0 M-46 8 q16 -10 30 2 t28 -2 M10 -40 q6 18 -4 30 M-10 18 q8 10 26 6" stroke="#9c5f52" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M6 40 Q8 62 2 80" stroke="' + INK + '" stroke-width="10" fill="none"/><path d="M6 40 Q8 62 2 80" stroke="#c98a72" stroke-width="6" fill="none"/>');
}

// ── analogies ──
// a block of flats, front view: each floor has its own switch in the panel on the right; lit floors glow
function flats(x, y, lit, t) {
  var s = R(x, y, 300, 470, "#d9c8a6", 2.6) + R(x - 14, y - 22, 328, 24, "#b49a72", 2.2) + R(x + 120, y + 400, 60, 70, "#8a6a4c", 2);
  for (var fl = 0; fl < 5; fl++) { var fy = y + 20 + fl * 76, on = lit[4 - fl];
    for (var w = 0; w < 3; w++) s += R(x + 26 + w * 92, fy, 64, 54, on ? LAMP : DARKWIN, 2) + '<path d="M' + (x + 58 + w * 92) + ' ' + fy + ' v54 M' + (x + 26 + w * 92) + ' ' + (fy + 27) + ' h64" stroke="' + INK + '" stroke-width="1.4"/>' + (on ? '<rect x="' + (x + 26 + w * 92) + '" y="' + fy + '" width="64" height="54" fill="#fff" opacity="' + f(.15 + .1 * Math.sin(t * 3 + w)) + '"/>' : ""); }
  return s;
}
function switches(x, y, lit) {
  var s = R(x, y, 110, 400, "#f4ecdb", 2.4);
  for (var i = 0; i < 5; i++) { var sy = y + 26 + i * 76, on = lit[4 - i]; s += R(x + 30, sy, 50, 50, "#fff", 2, 4) + R(x + 45, on ? sy + 8 : sy + 24, 20, 18, on ? ORANGE : GREY, 1.8, 3) + T(String(5 - i), x + 98, sy + 36, 20, INK, 800); }
  return s;
}
// a stairwell from the side: four landings, a lamp on the wall at each; one flickers
function stairs(t, bad) {
  var s = '<path d="M60 760 L60 120 L600 120 L600 760 Z" fill="#e2d6bc" stroke="' + INK + '" stroke-width="2.6"/>', i;
  var d = "M60 700"; for (i = 0; i < 16; i++) d += " h34 v-34"; s += P(d + " L600 156 L600 760 L60 760 Z", "#c9b48e", 2.4);
  for (i = 0; i < 4; i++) { var lx = 140 + i * 130, ly = 560 - i * 130, flickOn = i !== bad || (Math.sin(t * 31) > .2 && Math.sin(t * 7.3) > -.6), on = i === bad ? flickOn : true;
    if (on) s += '<circle cx="' + lx + '" cy="' + (ly + 34) + '" r="62" fill="' + LAMP + '" opacity="' + (i === bad ? .55 : .35) + '"/>';
    s += R(lx - 16, ly, 32, 14, INK, 0) + C(lx, ly + 30, 17, on ? LAMP : "#8f8a7c", 2.2); }
  return s;
}
// an envelope (the «news» of the myth)
function envelope(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", R(-60, -40, 120, 80, "#f4ecdb", 2.4) + P("M-60 -40 L0 8 L60 -40", "none", 2.4) + C(0, 18, 12, ORANGE, 2)); }
function syringe(x, y, ang, s, push) {
  push = push || 0;
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + (s || 1) + ")",
    '<path d="M0 0 L-40 0" stroke="' + INK + '" stroke-width="3"/>' + R(-170, -16, 130, 32, "#e8eef0", 2.4, 4) + R(-160 + push * 60, -12, 112 - push * 60, 24, "#9db3c2", 0) +
    R(-182, -26, 12, 52, "#f4ecdb", 2.2) + R(-250 + push * 60, -6, 70, 12, "#f4ecdb", 2) + R(-262 + push * 60, -20, 12, 40, "#f4ecdb", 2.2) +
    T("بوتوكس", -105, 7, 15, BLUE, 800));
}
// the nerve–muscle junction, cut open: the nerve ending (bulb with vesicles) over a muscle fibre; t moves the released drops
function junction(t, blocked, kb) {
  var s = "", i, cx = 320;
  // muscle fibre, striated
  s += R(40, 470, 560, 170, "#c98a72", 2.6, 18);
  for (i = 0; i < 26; i++) s += '<path d="M' + (60 + i * 21) + ' 476 v158" stroke="#a5634f" stroke-width="' + (i % 2 ? 3 : 1.4) + '"/>';
  s += '<path d="M200 470 Q320 448 440 470" fill="#d9a186" stroke="' + INK + '" stroke-width="2.4"/>';
  for (i = 0; i < 9; i++) s += R(220 + i * 24, 462, 10, 10, OLIVE, 1.4, 2);
  // the nerve coming down and its ending
  s += P("M290 -20 L290 250 Q240 300 236 360 Q240 432 320 436 Q400 432 404 360 Q400 300 350 250 L350 -20 Z", NERVE, 2.6);
  s += '<path d="M300 0 L300 240 M340 0 L340 240" stroke="#c6a94a" stroke-width="2" stroke-dasharray="10 8"/>';
  for (i = 0; i < 14; i++) { var vx = 262 + hash(i) * 116, vy = 300 + hash(i + 20) * 110; s += C(vx, vy, 11, "#f4ecdb", 1.8);
    if (blocked) s += G("", '<path d="M' + f(vx - 8) + ' ' + f(vy - 8) + ' l16 16 M' + f(vx + 8) + ' ' + f(vy - 8) + ' l-16 16" stroke="' + BLUE + '" stroke-width="3"/>', kb); }
  // the released drops crossing the gap (stop when blocked)
  var flow = blocked ? 1 - clamp(kb * 1.4) : 1;
  for (i = 0; i < 10; i++) { var ph = (t * .9 + hash(i + 3)) % 1, dx = 250 + hash(i + 7) * 140, dy = 436 + ph * 30; if (flow > 0) s += C(dx, dy, 4.5, ORANGE, 0).replace('stroke-width="0"', 'stroke-width="0" opacity="' + f(flow) + '"'); }
  // a signal running down the nerve
  if (!blocked || kb < .5) s += '<path d="M320 -20 L320 280" stroke="' + ORANGE + '" stroke-width="5" stroke-dasharray="8 30" stroke-dashoffset="' + f(-t * 120) + '" stroke-linecap="round"/>';
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
var EX = 320, EY = 400;   // where the eye sits in the panel
// 4 · it's in the blink muscle: the eye close-up, then the ring muscle shows through the skin
shot(4, push(320, 410, 1.0, 1.06), function (u, d, t) { return skin() + eye(EX, EY, 1.05, { t: t, tw: 1 - at(u, 1, .6) }) + label(lowerLid(EX, EY, 1.05, .38)[0], lowerLid(EX, EY, 1.05, .38)[1] + 14, 180, 640, "هنا", ORANGE, at(u, .3, .5), 30); });
shot([4, 1], push(320, 400, 1.0, .88), function (u, d, t) {
  var k = at(u, .1, 1.4); return skin() + ghostEye(EX, EY) + G("", muscle(EX, EY, { t: t, k: k }), .92) + label(EX + 200, EY - 250, 470, 90, "عضلة الرمش", OLIVE, at(u, 1.2, .5), 30) +
    draw("M" + (EX - 370) + " " + EY + " A370 290 0 0 1 " + (EX - 260) + " " + (EY - 205), at(u, 1.4, .6), ORANGE, 4) + arrow(EX - 275, EY - 195, EX - 250, EY - 215, ORANGE, 4, at(u, 1.9, .2));
}, { tr: "out" });
// 5 · made of thousands of thin fibres: a bundle cut open, the fibres pulled out of it
shot(5, push(320, 400, 1.05, 1.0), function (u, d, t) { return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t }) + G("", '<circle cx="' + (EX - 150) + '" cy="' + (EY + 190) + '" r="40" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 6"/>', at(u, .3, .4)); });
shot([5, 1], push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), i, k = at(u, .1, 1);
  s += '<path d="M60 300 L440 300 A40 110 0 0 1 440 520 L60 520 A40 110 0 0 1 60 300 Z" fill="#b97d66" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<ellipse cx="440" cy="410" rx="40" ry="110" fill="#c98a72" stroke="' + INK + '" stroke-width="2.6"/>';
  for (i = 0; i < 46; i++) { var a = hash(i) * Math.PI * 2, rr = Math.sqrt(hash(i + 50)) * .9; s += '<ellipse cx="' + f(440 + Math.cos(a) * 34 * rr) + '" cy="' + f(410 + Math.sin(a) * 100 * rr) + '" rx="3.6" ry="8" fill="#e0ae94" stroke="' + INK + '" stroke-width="1"/>'; }
  for (i = 0; i < 5; i++) { var y0 = 340 + i * 34, ex = lerp(440, 600, k) + 6 * Math.sin(t * 2 + i), d = "M440 " + y0 + " C500 " + (y0 - 10) + " 540 " + (y0 + 30 * (i - 2)) + " " + f(ex) + " " + f(y0 + 40 * (i - 2) * k);
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#d6957a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#a5634f" stroke-width="9" fill="none" stroke-dasharray="1.5 5"/>'; }
  return s + label(260, 300, 220, 180, "حزمة ألياف", OLIVE, at(u, .4, .5), 28) + label(590, 330, 560, 220, "ليفة", OLIVE, at(u, 1, .5), 28) + G("", N("1000s", 200, 640, 50, ORANGE), at(u, 1.4, .4));
}, { tr: "in" });
// 6 · split into small teams, each driven by one nerve: colour the teams, then one branch lights one team
shot(6, push(300, 420, .86, .94), function (u, d, t) {
  var k1 = at(u, .2, 1), one = u > 2.2;
  return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, one: one }) + nerves(EX, EY, "one", { t: t, k: at(u, 2, .8), sig: one ? 1 : 0 }) +
    G("", tag("فرقة", EX + 200, EY - 270, 1, 28, OLIVE), k1) + label(segMid(EX, EY, MUS.filter(function (q) { return q.one; })[0])[0], segMid(EX, EY, MUS.filter(function (q) { return q.one; })[0])[1], EX + 60, EY + 300, "عصب واحد", ORANGE, at(u, 2.6, .5), 28);
});
// 7 · like a block of flats: every floor has its own switch
shot(7, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var lit = [0, 1, 2, 3, 4].map(function (i) { return u > .6 + i * .45 ? 1 : 0; });
  if (u > 3) lit = [0, 1, 2, 3, 4].map(function (i) { return Math.floor(u * 1.4) % 5 === i ? 1 : 0; });
  return paper() + flats(60, 180, lit, t) + switches(450, 210, lit) + label(505, 200, 600, 130, "مفتاح لكل دور", ORANGE, at(u, .4, .5), 26);
});
// 8 · every blink: the brain sends one order down every branch at once
shot(8, push(280, 400, .84, .9), function (u, d, t) {
  var go = at(u, .8, .6);
  return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, all: go }) + nerves(EX, EY, "all", { t: t, k: 1, sig: go }) + brain(EX - 250, EY - 250, 1, go > .5) +
    '<path d="M' + (EX - 250) + ' ' + (EY - 175) + ' Q' + (EX - 400) + ' ' + (EY) + ' ' + (EX - 340) + ' ' + (EY + 360) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-dasharray="6 18" stroke-dashoffset="' + f(-t * 90) + '" opacity="' + f(go) + '"/>' +
    tag("كلهم مع بعض", EX + 160, EY + 330, at(u, 1.4, .3), 28, ORANGE);
});
// 9 · the whole ring squeezes and the lid shuts (a blink)
shot(9, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var b = Math.max(0, Math.sin(clamp((u - .6) / 1.2) * Math.PI)); b = Math.min(1, b * 1.4);
  return skin() + eye(EX, EY, 1.05, { t: t, blink: b }) + G("", muscle(EX, EY, { t: t, sq: b, all: b }), .45 + .2 * b) +
    arrow(EX - 470, EY, EX - 400 + 24 * b, EY, ORANGE, 6, at(u, .4, .3)) + arrow(EX + 470, EY, EX + 400 - 24 * b, EY, ORANGE, 6, at(u, .4, .3)) + arrow(EX, EY - 360, EX, EY - 300 + 18 * b, ORANGE, 6, at(u, .4, .3)) + arrow(EX, EY + 350, EX, EY + 300 - 18 * b, ORANGE, 6, at(u, .4, .3));
});
// 10 · why only one small patch? a dashed ring on the flicking patch and a question mark
shot(10, push(300, 450, 1.15, 1.3), function (u, d, t) {
  var p = lowerLid(EX, EY, 1.05, .38);
  return skin() + eye(EX, EY, 1.05, { t: t, tw: 1 }) + G("", '<circle cx="' + f(p[0]) + '" cy="' + f(p[1] + 16) + '" r="' + f(56 + 3 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="9 7"/>', at(u, .2, .4)) + T("؟", EX + 200, EY - 140, 150, ORANGE, 800);
}, { tr: "in" });
// 11 · a few nerves fire on their own, with no order from the brain
shot(11, push(280, 420, .84, .92), function (u, d, t) {
  var go = at(u, .8, .5);
  return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, fire: go }) + nerves(EX, EY, "tw", { t: t, k: at(u, .2, .8), sig: go }) + brain(EX - 250, EY - 250, 1) +
    cross(EX - 250, EY - 250, 1.2, at(u, 1.6, .5)) + tag("مفيش أمر", EX - 250, EY - 140, at(u, 2, .3), 24, INK);
});
// 12 · several times a second: a trace of the firing nerve, only their fibres jump
hud([12, 0], 13, function (u, t) {
  var s = R(40, 30, 560, 150, "#f4ecdb", 2.2) + '<path d="M60 140 H580" stroke="' + INK + '" stroke-width="1.4"/>', x, d = "M60 140";
  for (x = 60; x <= 580; x += 4) { var ph = ((x - 60) / 520 * 7 - t * 7) % 1; ph = ph < 0 ? ph + 1 : ph; var y = 140 - (ph < .06 ? 80 * Math.sin(ph / .06 * Math.PI) : 0); d += " L" + x + " " + f(y); }
  s += '<path d="' + d + '" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>' + measure(60, 168, 580, 168, 1, "") + T("ثانية واحدة", 320, 210, 22, INK, 700);
  return G("translate(0 -10)", s);
});
shot(12, push(300, 470, .92, 1.0), function (u, d, t) { return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, fire: 1 }) + nerves(EX, EY, "tw", { t: t, k: 1, sig: 1 }) + label(EX - 120, EY + 175, EX - 230, EY + 330, "ألياف الفرق دي بس", ORANGE, at(u, 1.2, .5), 26); });
// 13 · like one lamp on the stairs flickering while the rest stay lit
shot(13, push(330, 420, 1.0, 1.06), function (u, d, t) { return paper() + stairs(t, 2) + label(384, 330, 250, 240, "لمبة واحدة", ORANGE, at(u, .6, .5), 28); });
// 14 · you can't stop it at will: «اقفي!» from the brain does nothing
shot(14, push(320, 420, 1.05, .98), function (u, d, t) {
  return skin() + eye(EX, EY + 40, 1, { t: t, tw: 1 }) + G("", R(300, 70, 260, 90, "#f4ecdb", 2.4, 10) + P("M360 160 L340 200 L390 160", "#f4ecdb", 2.4) + T("اقفي بقى!", 430, 132, 40, INK, 800), at(u, .3, .3)) +
    brain(170, 110, .9) + cross(430, 115, 1.3, at(u, 1.6, .5));
});
// 15 · what winds the nerve up? the nerve ending close-up with sparks and a question mark
shot(15, push(320, 360, 1.05, 1.0), function (u, d, t) {
  var s = paper() + junction(t, false);
  for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + t * 2; s += '<path d="M' + f(320 + Math.cos(a) * 110) + ' ' + f(340 + Math.sin(a) * 110) + ' l' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 26) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>'; }
  return s + T("؟", 530, 260, 140, ORANGE, 800) + label(380, 200, 470, 120, "طرف العصب", OLIVE, at(u, .3, .5), 26);
});
// 16 · late nights, stress, the third coffee, tired eyes from the phone: four tiles, one per caption chunk
function chunkAt(line, i) { var c = window.CHUNKS[line]; if (!c || c[i] == null) return i * .8; return (LN[line].end - LN[line].start) * c[i]; }
shot(16, push(320, 400, 1.02, 1.06), function (u, d, t) {
  var s = paper(), boxes = [
    [180, 230, C(10, -14, 34, "#f4ecdb", 2.4) + '<path d="M10 -14 V-36 M10 -14 L28 -2" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + '<path d="M-56 -50 A30 30 0 1 0 -26 -6 A24 24 0 1 1 -56 -50 Z" fill="' + KHAKI + '" stroke="' + INK + '" stroke-width="2"/>', "السهر", BLUE],
    [460, 230, brain(0, -8, .8) + '<path d="M-60 -60 l14 18 l-10 4 l14 18 M60 -60 l-14 18 l10 4 l-14 18" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round"/>', "التوتر", ORANGE],
    [180, 520, [-44, 0, 44].map(function (x, i) { return G("translate(" + x + " 10)", R(-18, -30, 36, 46, i === 2 ? ORANGE : "#f4ecdb", 2.2, 4) + '<path d="M18 -18 q14 0 14 12 q0 12 -14 12" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + '<path d="M-6 -40 q-6 -8 0 -16 M6 -40 q-6 -8 0 -16" stroke="' + MUTE + '" stroke-width="2" fill="none" opacity="' + f(.5 + .5 * Math.sin(t * 3 + i)) + '"/>'); }).join(""), "القهوة التالتة", ORANGE],
    [460, 520, R(-36, -64, 72, 120, "#3d3a34", 2.4, 10) + R(-28, -54, 56, 96, "#9db3c2", 0, 3) + '<rect x="-28" y="-54" width="56" height="96" fill="#fff" opacity="' + f(.15 + .15 * Math.sin(t * 4)) + '"/>', "الموبايل", BLUE]];
  var T16 = [chunkAt(16, 0), chunkAt(16, 0) + .75, chunkAt(16, 1), chunkAt(16, 2)];
  boxes.forEach(function (b, i) { var k = at(u, T16[i] - .1, .35); s += iconBox(b[0], b[1], 220, G("translate(0 -10)", b[2]) + T(b[3], 0, 92, 24, b[4], 800), k); });
  return s;
});
// 17 · it usually settles by itself in days or weeks: the twitch bursts shrink along a calendar strip
shot(17, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper(), x, k = at(u, .2, d - .6), dd = "M50 420";
  s += '<path d="M50 420 H600" stroke="' + INK + '" stroke-width="2"/>';
  for (x = 50; x <= 50 + 550 * k; x += 3) { var amp = 150 * Math.exp(-(x - 50) / 190) * (Math.sin(x * .9) > 0 ? 1 : .2) * Math.abs(Math.sin(x * .37)); dd += " L" + x + " " + f(420 - amp); }
  s += '<path d="' + dd + '" stroke="' + ORANGE + '" stroke-width="2.6" fill="none"/>';
  for (var i = 0; i < 7; i++) s += R(60 + i * 78, 470, 62, 66, "#f4ecdb", 2, 3) + R(60 + i * 78, 470, 62, 16, ORANGE, 2, 0) + N(String(1 + i * 3), 91 + i * 78, 522, 22, INK);
  return s + T("أيام… أسابيع", 330, 600, 30, INK, 800) + check(540, 330, 1.3, at(u, d - 1.2, .5), OLIVE);
});
// 18 · see a doctor if the lid shuts fully, or the twitch spreads to the cheek or mouth
shot(18, push(320, 400, 1.02, 1.0), function (u, d, t) {
  var s = paper(), k1 = at(u, chunkAt(18, 0), .4), k2 = at(u, chunkAt(18, 1), .4);
  s += iconBox(180, 260, 250, R(-125, -125, 250, 250, SKIN, 1.6) + G("translate(0 -10) scale(.5)", eye(0, 20, 1, { t: t, blink: 1 })), k1) + G("", T("الجفن بيقفل خالص", 180, 430, 24, ORANGE, 800), k1);
  var face = '<path d="M-40 -110 C40 -120 90 -60 92 0 C96 40 80 60 70 70 L78 92 C70 100 60 104 56 110 C40 124 0 120 -40 112 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M10 -40 q20 -10 40 0" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M30 80 q14 4 26 -2" stroke="' + INK + '" stroke-width="3" fill="none"/>';
  s += iconBox(460, 260, 250, face + G("", '<circle cx="40" cy="20" r="26" fill="' + ORANGE + '" opacity=".45"/><circle cx="44" cy="80" r="20" fill="' + ORANGE + '" opacity=".45"/>', .6 + .4 * Math.sin(t * 6)), k2) + G("", T("وصلت للخد أو البُق", 460, 430, 24, ORANGE, 800), k2);
  return s + tag("اكشف عند دكتور", 320, 600, at(u, chunkAt(18, 2) || 3.4, .3), 32, INK);
});
// 19 · if it lasts for months, doctors can calm it with Botox: a syringe comes in by the outer corner of the lower lid
shot(19, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.6, 1);
  return skin() + eye(EX, EY, 1.05, { t: t, tw: 1 - .7 * at(u, 2.8, .8) }) + syringe(lerp(640, EX - 70, k), lerp(720, EY + 150, k), -135, 1, at(u, 2.6, .6)) +
    iconBox(130, 150, 150, R(-50, -46, 100, 92, "#f4ecdb", 2) + R(-50, -46, 100, 22, ORANGE, 2) + T("شهور", 0, 28, 24, INK, 800), at(u, .2, .3));
});
// 20 · yes, the same stuff as for wrinkles: frown lines on a forehead smooth out
shot(20, push(320, 380, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .5, 1.2), s = skin(), i;
  for (i = 0; i < 4; i++) { var y = 200 + i * 46, a = 16 * (1 - k); s += '<path d="M90 ' + y + ' Q200 ' + f(y - a) + ' 320 ' + y + ' T550 ' + y + '" stroke="' + SKIN2 + '" stroke-width="' + f(4 - 2.5 * k) + '" fill="none" opacity="' + f(1 - .6 * k) + '"/>'; }
  s += G("translate(0 280)", eye(EX, 160, .7, { t: t, skin: false }));
  return s + syringe(560, 140, -150, .8, k) + tag("نفس الدوا", 320, 680, at(u, .3, .3), 34, BLUE);
});
// 21 · Botox cuts the nerve–muscle link in that spot only: the junction works, then it's blocked; about 3 months
shot(21, push(320, 380, 1.0, 1.04), function (u, d, t) { return paper() + junction(t, false) + label(292, 160, 170, 110, "العصب", OLIVE, at(u, .3, .5), 26) + label(200, 600, 190, 710, "العضلة", OLIVE, at(u, .6, .5), 26) + label(320, 452, 300, 720, "الوصلة", BLUE, at(u, 1, .5), 26); });
shot([21, 1], push(320, 380, 1.04, 1.0), function (u, d, t) {
  var kb = at(u, .1, .8); return paper() + junction(t, true, kb) + cross(320, 452, 1.1, at(u, .6, .5)) + numBox("3", 520, 120, at(u, 1.2, .3), 50) + G("", T("شهور", 520, 200, 30, INK, 800), at(u, 1.4, .3));
});
// 22 · the myth: a twitch means news is coming — no
shot(22, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .3, 1.6), x = lerp(620, 380, k), y = lerp(120, 250, k) - 60 * Math.sin(k * Math.PI);
  return skin() + eye(EX - 30, EY + 80, .9, { t: t, tw: 1 }) + envelope(x, y + 6 * Math.sin(t * 3), 1) + G("", T("خبر جاي؟", x, y - 60, 30, INK, 800), k) + cross(x, y, 1.4, at(u, d - 1.1, .5));
});
// 23 · just a few nerves awake more than they should be
shot(23, push(300, 440, .88, .96), function (u, d, t) { return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, fire: 1 }) + nerves(EX, EY, "tw", { t: t, k: 1, sig: 1 }) + tag("كام عصب صاحيين", EX + 60, EY - 290, at(u, .4, .3), 30, ORANGE); }, { tr: "out" });
// 24 · the recap: the ring, the teams, the lone nerves, the flicking patch
shot(24, push(300, 420, .82, .88), function (u, d, t) {
  return skin() + ghostEye(EX, EY) + muscle(EX, EY, { t: t, fire: at(u, chunkAt(24, 4), .3) }) + nerves(EX, EY, "tw", { t: t, k: at(u, chunkAt(24, 3), .6), sig: 1 }) +
    callout("1", EX + 250, EY - 200, at(u, chunkAt(24, 1), .3), 22) + callout("2", EX + 300, EY + 60, at(u, chunkAt(24, 2), .3), 22) + callout("3", EX - 300, EY + 250, at(u, chunkAt(24, 3), .3), 22) + callout("4", EX - 150, EY + 200, at(u, chunkAt(24, 4), .3), 22);
}, { tr: "out" });
// 25 · the odd fact: you blink about 15,000 times a day without noticing
shot(25, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var ph = (t % 1.1) / 1.1, b = ph < .12 ? Math.sin(ph / .12 * Math.PI) : 0, k = at(u, .4, d - 1);
  return skin() + eye(EX, EY - 40, 1, { t: t, blink: b }) + numBox(count(15000, k), 320, 600, at(u, .3, .3), 54) + G("", T("رمشة في اليوم", 320, 690, 32, INK, 800), at(u, .5, .3));
}, { tr: "in" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the eye, the lower lid starts to flick. line 1: «اقفي!» does nothing. line 2: the lid «with a mind of its own» (a tiny brain on it)
  var u = t - LN[li].start, s = '<rect x="-20" y="-20" width="660" height="700" fill="' + SKIN + '"/>' + eye(304, 340, .95, { t: t, tw: li === 0 ? clamp(u / .6) : 1 });
  var p = lowerLid(304, 340, .95, .38);
  if (li >= 1) s += G("", R(330, 40, 250, 86, "#f4ecdb", 2.4, 10) + T("اقفي!", 455, 100, 40, INK, 800), ease((t - LN[1].start) / .3)) + cross(455, 84, 1, ease((t - LN[1].start - 1) / .4));
  if (li >= 2) s += brain(p[0], p[1] + 110, .55, true) + G("", '<path d="M' + f(p[0]) + ' ' + f(p[1] + 76) + ' L' + f(p[0]) + ' ' + f(p[1] + 20) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="5 6"/>', ease((t - LN[2].start) / .3));
  return s;
};
SCENE.bumper = function (u, t) {
  var b = (t % 1.4) < .18 ? Math.sin((t % 1.4) / .18 * Math.PI) : 0;
  return '<rect x="0" y="0" width="180" height="200" fill="' + SKIN + '"/>' + eye(90, 104, .36, { t: t, blink: b, tw: .8 });
};
SCENE.outro = function (svg, u, t) {
  return G("translate(300 140) scale(.27) translate(-320 -400)", ghostEye(EX, EY) + muscle(EX, EY, { t: t, fire: 1 }) + nerves(EX, EY, "tw", { t: t, sig: 1 }) + syringe(EX - 40, EY + 230, -140, 1)) +
    callout("1", 400, 60, ease(u / .3)) + callout("2", 400, 160, ease(u / .3 - .5)) + callout("3", 200, 190, ease(u / .3 - 1)) + callout("4", 320, 240, ease(u / .3 - 1.5));
};
