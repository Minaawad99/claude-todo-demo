/* «إزاي بيطلّعوا النفط من المحيط؟» — paper/isometric version: a block of sea with the rock under it, cut open
   along y = 0 so the layers, the dome-shaped trap, the well and the oil show on the cut face. On top: the survey
   ship with its streamers, then the drillship, then the production ship (FPSO) and a tanker. Redrawn every frame.
   x: along the block, y: across (cut face at y = 0, back wall at y = −150), z: up (sea surface at z = 0). */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function f1(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function makeIso(theta, K, OX, OY) {
    var c = Math.cos(theta), s = Math.sin(theta);
    function P(x, y, z) { var xr = x * c - y * s, yr = x * s + y * c; return [OX + (xr - yr) * 0.866 * K, OY + (xr + yr) * 0.5 * K - z * K]; }
    function d(list, close) { return "M" + list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + (close === false ? "" : " Z"); }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function face(g, list, cls, st) { var a = { d: d(list), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function line(g, list, cls, st) { var a = { d: d(list, false), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function box(g, x0, x1, y0, y1, z0, z1, k) { k = k || {}; var fy = (c - s) > 0 ? y1 : y0, fx = (c + s) > 0 ? x1 : x0;
      face(g, [[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], k.y || "iso-y"); face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], k.x || "iso-x");
      if (k.hatch) face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], "tz-pat-hatch", "opacity:.45");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top"); }
    function ring(cx, cy, cz, r, n, plane, a0, a1) { var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); } return out; }
    function disc(g, cx, cy, cz, r, plane, cls, st) { return face(g, ring(cx, cy, cz, r, 30, plane), cls, st); }
    var A0 = -Math.PI / 4 - theta;
    function cyl(g, cx, cy, r, z0, z1, side, top) { var front = ring(cx, cy, z1, r, 18, "z", A0, A0 + Math.PI), back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; }); face(g, front.concat(back), side || "iso-steel"); return face(g, ring(cx, cy, z1, r, 28, "z"), top || "iso-top"); }
    return { P: P, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, cyl: cyl, K: K };
  }
  function hull2(pts) {   // convex hull of 2D points (monotone chain)
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = []; pts.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (var i = pts.length - 1; i >= 0; i--) { var p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }


  // ── the block and the rock layers ───────────────────────
  var X0 = -320, X1 = 320, Y0 = -150, Y1 = 0, SB = -90, RB = -330, TH = 38, NL = 6, DX = -20;
  function domeAt(x, y) { return 50 * Math.exp(-Math.pow(x - DX, 2) / (2 * 72 * 72)) * Math.exp(-y * y / (2 * 120 * 120)); }
  function bz(k, x, y) { if (k <= 0) return SB; if (k >= NL) return RB; return SB - 44 - (k - 1) * TH + domeAt(x, y) * (1 - (k - 1) * 0.06); }   // top of layer k
  var CAPK = 2, RESK = 3, OWC = SB - 44 - (RESK - 1) * TH + 18;     // seal layer, reservoir layer, oil–water contact
  var LCLS = ["oi-l0", "oi-l1", "oi-cap", "oi-res", "oi-l4", "oi-l5"];

  // ── what happens when ───────────────────────────────────
  function state(t, full) {
    var S = { oil: 0, plank: 0, seis: null, gun: -1, echo: -1, ds: null, pipe: 0, bore: 0, mud: 0, flow: 0, inject: 0, fpso: null, tanker: null, dome: 0, bop: 0 };
    if (full) { S.oil = 1; S.ds = { x: DX }; S.pipe = 1; S.bore = 1; S.flow = 1; return S; }
    S.oil = t < L(7) ? 0 : clamp((t - L(7)) / 2.2);
    if (t < L(7)) S.plank = 1;
    if (t >= L(8) - 0.3 && t < L(13)) { var k = clamp((t - L(8) + 0.3) / (L(12) - L(8))); S.seis = { x: lerp(260, -200, k), on: t > L(9) && t < L(11) + 0.4 }; S.gun = t >= L(9) && t < L(11) ? t - L(9) : -1; S.echo = t >= L(10) - 0.3 && t < L(11) + 0.5 ? t - L(10) + 0.3 : -1; }
    if (t >= L(11) && t < L(13) + 0.5) S.dome = clamp((t - L(12) + 0.2) * 2) * (1 - clamp((t - L(13)) * 2));
    if (t >= L(13) - 0.2 && t < L(21)) { var a = clamp((t - L(13) + 0.2) / 2.0); S.ds = { x: lerp(-380, DX, easeIO(a)) }; }
    if (t >= L(14)) S.pipe = clamp((t - L(14) - 0.3) / (L(15) - L(14) - 0.6));
    if (t >= L(15)) S.bop = 1;
    if (t >= L(16) - 0.2) S.bore = clamp((t - L(16) + 0.2) / (L(19) - L(16) + 0.4)) * 0.9 + (t >= L(19) ? 0.1 * clamp((t - L(19)) / 0.8) : 0);
    if (t >= L(16) && t < L(19) + 0.6) S.mud = 1;
    if (t >= L(19) + 0.6) S.flow = 1;
    if (t >= L(20)) S.inject = clamp((t - L(20) - 0.4) / (L(21) - L(20) - 0.6));
    if (t >= L(21) - 0.4) { S.fpso = { x: DX, a: clamp((t - L(21) + 0.4) / 0.8) }; S.ds = null; }
    if (t >= L(22) - 0.2) S.tanker = { x: lerp(DX + 10, -420, easeIO(clamp((t - L(22) - 0.4) / (L(23) - L(22) + 0.4)))) };
    if (t >= L(23)) { S.fpso = { x: DX, a: 1 }; }
    return S;
  }

  // ── drawing helpers ─────────────────────────────────────
  function pt(I, x, y, z) { return I.P(x, y, z); }
  function seg(g, I, list, cls, st) { return I.line(g, list, cls, st); }
  // a ship hull with a pointed bow at −x; deck at z = h, keel at z = −dr
  function hull(g, I, x0, x1, yc, w, h, dr, side, top) {
    var b = Math.min(40, (x1 - x0) * 0.18), ya = yc - w / 2, yb = yc + w / 2;
    I.face(g, [[x0 + b, yb, -dr], [x1, yb, -dr], [x1, yb, h], [x0 + b, yb, h]], side);
    I.face(g, [[x1, ya, -dr], [x1, yb, -dr], [x1, yb, h], [x1, ya, h]], side + "-x");
    I.face(g, [[x0 + b, yb, -dr], [x0, yc, -dr * 0.6], [x0, yc, h + 4], [x0 + b, yb, h]], side + "-x");
    I.face(g, [[x0 + b, yb, h - 3], [x1, yb, h - 3], [x1, yb, h], [x0 + b, yb, h]], "oi-stripe");
    return I.face(g, [[x0, yc, h + 4], [x0 + b, ya, h], [x1, ya, h], [x1, yb, h], [x0 + b, yb, h]], top);
  }
  // steel lattice derrick: 4 legs tapering, X-bracing on the two visible faces
  function derrick(g, I, cx, cy, z0, w0, w1, hh) {
    var lv = 7, s0 = w0 / 2, s1 = w1 / 2;
    function c(k, sx, sy) { var u = k / lv, s = lerp(s0, s1, u); return [cx + sx * s, cy + sy * s, z0 + hh * u]; }
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { seg(g, I, [c(0, q[0], q[1]), c(lv, q[0], q[1])], "oi-leg"); });
    for (var k = 0; k < lv; k++) { seg(g, I, [c(k, -1, 1), c(k + 1, 1, 1)], "oi-brace"); seg(g, I, [c(k, 1, 1), c(k + 1, -1, 1)], "oi-brace"); seg(g, I, [c(k, 1, -1), c(k + 1, 1, 1)], "oi-brace"); seg(g, I, [c(k, 1, 1), c(k + 1, 1, -1)], "oi-brace"); seg(g, I, [c(k + 1, -1, 1), c(k + 1, 1, 1), c(k + 1, 1, -1)], "oi-brace"); }
    I.box(g, cx - s1 - 2, cx + s1 + 2, cy - s1 - 2, cy + s1 + 2, z0 + hh, z0 + hh + 5, { x: "oi-red-x", y: "oi-red", z: "oi-red" });
  }
  function drillship(g, I, S, t) {
    var x = S.ds.x, bob = Math.sin(t * 1.3) * 1.2, L0 = x - 120, L1 = x + 120;
    var gg = I.el("g", { transform: "translate(0 " + f1(bob) + ")" }, g);
    hull(gg, I, L0, L1, 0, 46, 10, 12, "oi-hull", "oi-deck");
    I.box(gg, L0 + 30, L0 + 74, -18, 18, 10, 40, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" });      // accommodation at the bow
    for (var w = 0; w < 4; w++) I.face(gg, [[L0 + 36 + w * 10, 18, 26], [L0 + 42 + w * 10, 18, 26], [L0 + 42 + w * 10, 18, 33], [L0 + 36 + w * 10, 18, 33]], "oi-win");
    I.face(gg, I.ring(L0 + 30, 0, 44, 22, 20, "z"), "oi-heli"); I.line(gg, I.ring(L0 + 30, 0, 44.5, 12, 20, "z"), "oi-heli-mark");
    I.box(gg, x - 24, x + 24, -20, 20, 10, 22, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" });           // drill floor
    derrick(gg, I, x, 0, 22, 36, 12, 118);
    I.box(gg, x + 40, x + 104, -16, 16, 10, 18, { x: "oi-pipe-x", y: "oi-pipe", z: "oi-pipe-top" });             // pipe rack
    for (var p = 0; p < 5; p++) seg(gg, I, [[x + 42, -12 + p * 6, 18.5], [x + 102, -12 + p * 6, 18.5]], "oi-rack");
    seg(gg, I, [[L0 + 92, 14, 10], [L0 + 92, 14, 52], [L0 + 130, 14, 70]], "oi-crane"); seg(gg, I, [[L1 - 14, 14, 10], [L1 - 14, 14, 44], [L1 + 18, 14, 64]], "oi-crane");
    var q = pt(I, x, 0, 147); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(2.6), "class": "oi-beacon", style: "opacity:" + (0.5 + 0.5 * Math.sin(t * 4)).toFixed(2) }, gg);
  }
  function seisShip(g, I, S, t) {
    var x = S.seis.x, L0 = x - 60, L1 = x + 60, bob = Math.sin(t * 1.5) * 1.2, gg = I.el("g", { transform: "translate(0 " + f1(bob) + ")" }, g);
    // streamers trailing behind (+x), clipped to the block
    for (var k = 0; k < 4; k++) { var yy = -6 - k * 22, ln = []; for (var s = 0; s <= 24; s++) { var xx = L1 + 10 + s * 18; if (xx > X1) break; ln.push([xx, yy - k * 4 * s / 24, Math.sin(xx * 0.05 - t * 2 + k) * 1.2]); } seg(g, I, [[L1, -6 - k * 4, 2]].concat(ln), "oi-streamer");
      for (var h = 3; h < ln.length; h += 3) { var q = pt(I, ln[h][0], ln[h][1], ln[h][2]); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: 1.8, "class": S.echo > 0.6 && Math.sin(t * 12 + h + k) > 0 ? "oi-hydro-on" : "oi-hydro" }, g); } }
    hull(gg, I, L0, L1, -14, 30, 8, 8, "oi-redhull", "oi-deck");
    I.box(gg, L0 + 14, L0 + 52, -26, -2, 8, 30, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" }); I.box(gg, L0 + 20, L0 + 46, -24, -4, 30, 40, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" });
    seg(gg, I, [[L0 + 33, -14, 40], [L0 + 33, -14, 62]], "oi-mast");
    for (var r = 0; r < 3; r++) I.cyl(gg, L0 + 70 + r * 14, -14, 5, 8, 18, "oi-reel", "oi-reel-top");
    // air guns just under the surface behind the ship
    if (S.gun >= 0) { var gx = L1 + 16; for (var b = 0; b < 3; b++) { var ph = ((S.gun + b * 0.47) % 1.4) / 1.4, qb = pt(I, gx + b * 6, -30, -6); I.el("circle", { cx: f1(qb[0]), cy: f1(qb[1]), r: f1(3 + ph * 14), "class": "sb-bubble", style: "opacity:" + (1 - ph).toFixed(2) }, g); } }
  }
  function fpso(g, I, S, t) {
    var x = S.fpso.x, L0 = x - 40, L1 = x + 200, bob = Math.sin(t * 1.0) * 1, gg = I.el("g", { transform: "translate(0 " + f1(bob) + ") ", style: "opacity:" + S.fpso.a.toFixed(2) }, g);
    hull(gg, I, L0, L1, 0, 50, 12, 14, "oi-fpso", "oi-deck");
    for (var m = 0; m < 5; m++) { var mx = L0 + 44 + m * 26; I.box(gg, mx, mx + 20, -16, 16, 12, 26, { x: "oi-pipe-x", y: "oi-pipe", z: "oi-pipe-top" }); I.cyl(gg, mx + 6, 0, 3, 26, 32, "oi-yellow-x", "oi-yellow"); }
    I.box(gg, L1 - 34, L1 - 6, -18, 18, 12, 40, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" });
    seg(gg, I, [[L0 + 22, 0, 12], [L0 + 22, 0, 96]], "oi-flaretower"); seg(gg, I, [[L0 + 16, 0, 12], [L0 + 22, 0, 96], [L0 + 28, 0, 12]], "oi-brace");
    var fq = pt(I, L0 + 22, 0, 98), fl = 1 + 0.25 * Math.sin(t * 9) + 0.15 * Math.sin(t * 23);
    I.el("path", { d: "M" + f1(fq[0]) + " " + f1(fq[1]) + " c" + f1(-7 * fl) + " " + f1(-6 * fl) + " " + f1(-5 * fl) + " " + f1(-16 * fl) + " " + f1(1 * fl) + " " + f1(-22 * fl) + " c0 " + f1(7 * fl) + " " + f1(8 * fl) + " " + f1(11 * fl) + " " + f1(4 * fl) + " " + f1(22 * fl) + " z", "class": "oi-flame" }, gg);
    I.cyl(gg, x, 0, 10, -14, 14, "oi-turret", "oi-turret-top");
  }
  function tanker(g, I, S, t) { var x = S.tanker.x, gg = I.el("g", { transform: "translate(0 " + f1(Math.sin(t * 1.2 + 2) * 1) + ")" }, g);
    hull(gg, I, x - 110, x + 110, -86, 40, 10, 12, "oi-tanker", "oi-tanker-deck"); I.box(gg, x + 78, x + 104, -100, -72, 10, 36, { x: "oi-white-x", y: "oi-white", z: "oi-white-top" });
    for (var p = 0; p < 6; p++) seg(gg, I, [[x - 90 + p * 26, -86, 10], [x - 90 + p * 26, -86, 15]], "oi-rack"); }
  function bopStack(g, I, x, z0, t, shut) {
    I.box(g, x - 10, x + 10, -10, 10, z0, z0 + 6, { x: "oi-pipe-x", y: "oi-pipe", z: "oi-pipe-top" });
    I.box(g, x - 9, x + 9, -9, 9, z0 + 6, z0 + 26, { x: "oi-red-x", y: "oi-red", z: "oi-red" });
    I.cyl(g, x, 0, 8, z0 + 26, z0 + 36, "oi-steel", "oi-steel-top");
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { seg(g, I, [[x + q[0] * 13, q[1] * 13, z0], [x + q[0] * 13, q[1] * 13, z0 + 40]], "oi-frame"); });
    seg(g, I, [[x - 13, 13, z0 + 40], [x + 13, 13, z0 + 40], [x + 13, -13, z0 + 40]], "oi-frame");
  }

  // ── the world ───────────────────────────────────────────
  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full);
    // back walls of the water
    I.face(g, [[X0, Y0, SB], [X1, Y0, SB], [X1, Y0, 0], [X0, Y0, 0]], "sb-water-back");
    I.face(g, [[X0, Y0, SB], [X0, Y1, SB], [X0, Y1, 0], [X0, Y0, 0]], "sb-water-side");
    for (var k = 0; k < 4; k++) { var lx = -260 + k * 150 + Math.sin(t * 0.4 + k) * 20; I.face(g, [[lx, Y0 + 2, 0], [lx + 40, Y0 + 2, 0], [lx + 100, Y0 + 2, SB], [lx + 30, Y0 + 2, SB]], "sb-ray", "opacity:" + (0.08 + 0.04 * Math.sin(t * 1.3 + k)).toFixed(2)); }
    // rock: the side face (x = X1) layer by layer, the seabed on top, the cut face (y = 0) with the dome
    for (var k2 = 0; k2 < NL; k2++) { var sd = []; for (var y = Y0; y <= Y1; y += 15) sd.push([X1, y, bz(k2, X1, y)]); for (var y2 = Y1; y2 >= Y0; y2 -= 15) sd.push([X1, y2, bz(k2 + 1, X1, y2)]); I.face(g, sd, LCLS[k2] + " oi-side"); }
    I.face(g, [[X0, Y0, SB], [X1, Y0, SB], [X1, Y1, SB], [X0, Y1, SB]], "sb-sand");
    for (var w = 0; w < 14; w++) { var wx = X0 + 24 + w * 44, wy = -130 + hash(w + 9) * 120, sw = Math.sin(t * 1.5 + w) * 6, hgt = 18 + hash(w) * 20; I.line(g, [[wx, wy, SB], [wx + sw * 0.5, wy, SB + hgt * 0.5], [wx + sw, wy, SB + hgt]], "sb-weed"); }
    for (var k3 = 0; k3 < NL; k3++) { var fc = []; for (var x = X0; x <= X1; x += 16) fc.push([x, Y1, bz(k3, x, Y1)]); for (var x2 = X1; x2 >= X0; x2 -= 16) fc.push([x2, Y1, bz(k3 + 1, x2, Y1)]); I.face(g, fc, LCLS[k3]); }
    for (var gr = 0; gr < 40; gr++) { var gx = X0 + 10 + hash(gr) * 620, kk = Math.floor(hash(gr + 7) * NL), gz = lerp(bz(kk, gx, 0), bz(kk + 1, gx, 0), 0.3 + 0.4 * hash(gr + 2)), q = pt(I, gx, 0, gz); I.el("ellipse", { cx: f1(q[0]), cy: f1(q[1]), rx: 3 + hash(gr) * 3, ry: 1.2, "class": "oi-grain" }, g); }
    // the oil in the trap: the top of the reservoir layer, above the oil–water contact; injected water pushes from the right
    var oilTop = [], oilBot = [], inj = S.inject;
    if (S.oil > 0) { var owc = lerp(bz(RESK, DX, 0) - 2, OWC, S.oil) + inj * 14;
      for (var x3 = X0; x3 <= X1; x3 += 6) { var tz = bz(RESK, x3, 0), lz = Math.max(owc, bz(RESK + 1, x3, 0)); if (tz > lz + 0.5) { oilTop.push([x3, Y1, tz]); oilBot.unshift([x3, Y1, lz]); } }
      if (oilTop.length > 1) I.face(g, oilTop.concat(oilBot), "oi-oil");
      for (var sp = 0; sp < 10 && oilTop.length > 1; sp++) { var ii = Math.floor(hash(sp) * oilTop.length), a = oilTop[ii], b2 = oilBot[oilBot.length - 1 - ii], qq = pt(I, a[0], 0, lerp(a[2], b2[2], 0.5) + Math.sin(t * 2 + sp) * 2); I.el("circle", { cx: f1(qq[0]), cy: f1(qq[1]), r: 1.2, "class": "oi-glint", style: "opacity:" + (0.3 + 0.3 * Math.sin(t * 3 + sp)).toFixed(2) }, g); } }
    if (inj > 0) { var wxa = DX + 170, wxb = lerp(wxa, DX + 70, inj), wp = []; for (var x4 = wxb; x4 <= wxa + 30; x4 += 6) wp.push([x4, Y1, bz(RESK, x4, 0) - 2]); for (var x5 = wxa + 30; x5 >= wxb; x5 -= 6) wp.push([x5, Y1, bz(RESK + 1, x5, 0) + 2]); I.face(g, wp, "oi-inject");
      for (var ar = 0; ar < 3; ar++) { var ax = lerp(wxa, wxb, ((t * 0.6 + ar / 3) % 1)), az = lerp(bz(RESK, ax, 0), bz(RESK + 1, ax, 0), 0.5); arrow3(g, I, [ax + 10, Y1, az], [ax - 10, Y1, az], "oi-push", 1); } }
    if (S.dome > 0) { var dl = []; for (var x6 = DX - 150; x6 <= DX + 150; x6 += 8) dl.push([x6, Y1, bz(CAPK, x6, 0) + 3]); I.line(g, dl, "oi-domeline", "opacity:" + S.dome.toFixed(2)); }
    // the well: bore through the rock on the cut face, casing + drill pipe, mud going down, oil coming up
    var boreBot = lerp(SB, bz(RESK, DX, 0) - 8, S.bore);
    if (S.bore > 0) { I.face(g, [[DX - 9, Y1, SB], [DX + 9, Y1, SB], [DX + 9, Y1, boreBot], [DX - 9, Y1, boreBot]], "oi-bore"); seg(g, I, [[DX - 9, Y1, SB], [DX - 9, Y1, boreBot]], "oi-casing"); seg(g, I, [[DX + 9, Y1, SB], [DX + 9, Y1, boreBot]], "oi-casing"); seg(g, I, [[DX, Y1, SB], [DX, Y1, boreBot + 4]], S.flow ? "oi-oilcol" : "oi-drillpipe");
      var bq = pt(I, DX, Y1, boreBot); if (S.mud) I.el("path", { d: "M" + f1(bq[0] - 4) + " " + f1(bq[1] - 2) + " l4 6 l4 -6 Z", "class": "oi-bit", transform: "rotate(" + f1((t * 400) % 360) + " " + f1(bq[0]) + " " + f1(bq[1])+ ")" }, g); }
    if (S.inject > 0) { I.face(g, [[DX + 167, Y1, SB], [DX + 173, Y1, SB], [DX + 173, Y1, bz(RESK + 1, DX + 170, 0) + 6], [DX + 167, Y1, bz(RESK + 1, DX + 170, 0) + 6]], "oi-bore"); seg(g, I, [[DX + 170, Y1, 2], [DX + 170, Y1, bz(RESK + 1, DX + 170, 0) + 6]], "oi-waterpipe"); }
    // water: translucent front and side, things in the water
    I.face(g, [[X0, Y1, SB], [X1, Y1, SB], [X1, Y1, 0], [X0, Y1, 0]], "oi-water-front");
    I.face(g, [[X1, Y0, SB], [X1, Y1, SB], [X1, Y1, 0], [X1, Y0, 0]], "oi-water-front");
    if (S.plank) for (var pk = 0; pk < 34; pk++) { var px = X0 + 20 + hash(pk) * 600, py = Y0 + 10 + hash(pk + 3) * 140, pz = -((hash(pk + 6) * 90 + t * (14 + hash(pk) * 10)) % 86), pq = pt(I, px + Math.sin(t * 1.4 + pk) * 6, py, pz); I.el("circle", { cx: f1(pq[0]), cy: f1(pq[1]), r: f1(2.4 + hash(pk + 1) * 2), "class": pk % 3 ? "oi-plank" : "oi-plank2" }, g); }
    if (S.plank) for (var pd = 0; pd < 30; pd++) { var dq = pt(I, X0 + 14 + pd * 21, -10 - hash(pd) * 130, SB + 1); I.el("circle", { cx: f1(dq[0]), cy: f1(dq[1]), r: 1.6, "class": "oi-plank" }, g); }
    var pipeBot = lerp(0, SB, S.pipe);
    if (S.ds || S.fpso) { if (S.pipe > 0) { seg(g, I, [[DX, Y1, -10], [DX, Y1, pipeBot]], "oi-riser"); var nj = Math.floor((-pipeBot) / 18); for (var j = 1; j <= nj; j++) seg(g, I, [[DX - 3, Y1, -j * 18], [DX + 3, Y1, -j * 18]], "oi-joint"); } }
    if (S.bop) bopStack(g, I, DX, SB, t, 0);
    if (S.mud && S.bore > 0) for (var m = 0; m < 6; m++) { var mz = lerp(-8, boreBot, ((t * 0.7 + m / 6) % 1)), mq = pt(I, DX, Y1, mz); I.el("path", { d: "M" + f1(mq[0] - 2.5) + " " + f1(mq[1] - 2) + " l2.5 3 l2.5 -3", "class": "oi-mud" }, g); }
    if (S.flow) for (var fl = 0; fl < 7; fl++) { var fz = lerp(bz(RESK, DX, 0) - 6, 6, ((t * 0.5 + fl / 7) % 1)), fq = pt(I, DX, Y1, fz); I.el("circle", { cx: f1(fq[0]), cy: f1(fq[1]), r: 3, "class": "oi-oildrop" }, g); }
    if (S.inject > 0) for (var wi = 0; wi < 6; wi++) { var wz = lerp(0, bz(RESK + 1, DX + 170, 0) + 8, ((t * 0.8 + wi / 6) % 1)), wq = pt(I, DX + 170, Y1, wz); I.el("circle", { cx: f1(wq[0]), cy: f1(wq[1]), r: 1.8, "class": "oi-wdrop" }, g); }
    // sound: rings going down from the guns, echoes coming back up from the layer tops (drawn on the cut face)
    if (S.gun >= 0 && S.seis) { var gx2 = S.seis.x + 76; for (var r = 0; r < 3; r++) { var age = S.gun - r * 0.7; if (age < 0) continue; var R = (age % 2.1) * 120; if (R > 240) continue; var arc = []; for (var aa = 0; aa <= 16; aa++) { var an = Math.PI * aa / 16; arc.push([gx2 + Math.cos(an) * R, Y1, -6 - Math.sin(an) * R * 0.9]); } I.line(g, arc, "oi-sound", "opacity:" + (1 - R / 240).toFixed(2)); } }
    if (S.echo >= 0 && S.seis) { [1, 2, 3].forEach(function (kk2, i) { var e = clamp((S.echo - i * 0.3) / 1.6); if (e <= 0 || e >= 1) return; var cx = S.seis.x + 120 + i * 40, z0 = bz(kk2, cx, 0), ze = lerp(z0, -4, e), arc = []; for (var aa = 0; aa <= 10; aa++) { var an = Math.PI * aa / 10; arc.push([cx + Math.cos(an) * 46, Y1, ze - Math.sin(an) * 10]); } I.line(g, arc, "oi-echo", "opacity:" + (1 - e * 0.5).toFixed(2)); arrow3(g, I, [cx, Y1, ze + 2], [cx, Y1, ze + 14], "oi-echo-a", 1); }); }
    // the sea surface + ships
    var top = []; for (var x7 = X0; x7 <= X1; x7 += 20) top.push([x7, Y1, Math.sin(x7 * 0.04 + t * 2.2) * 2.5]); for (var x8 = X1; x8 >= X0; x8 -= 20) top.push([x8, Y0, Math.sin(x8 * 0.04 + t * 2.2 + 1) * 2.5]);
    I.face(g, top, "sb-surface"); var crest = []; for (var x9 = X0; x9 <= X1; x9 += 10) crest.push([x9, Y1, Math.sin(x9 * 0.04 + t * 2.2) * 2.5]); I.line(g, crest, "sb-crest");
    if (S.tanker) tanker(g, I, S, t);
    if (S.seis) seisShip(g, I, S, t);
    if (S.ds) drillship(g, I, S, t);
    if (S.fpso) fpso(g, I, S, t);
    if (S.inject > 0) { I.cyl(g, DX + 170, Y1 - 8, 9, -4, 8, "oi-yellow-x", "oi-yellow"); }
    return { st: S };
  }
  function arrow3(g, I, a, b, cls, p) { p = clamp(p == null ? 1 : p); if (p <= 0) return; var e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)], pa = I.P(a[0], a[1], a[2]), pe = I.P(e[0], e[1], e[2]), an = Math.atan2(pe[1] - pa[1], pe[0] - pa[0]), h = 6;
    I.el("path", { d: "M" + f1(pa[0]) + " " + f1(pa[1]) + " L" + f1(pe[0]) + " " + f1(pe[1]), "class": cls }, g);
    I.el("path", { d: "M" + f1(pe[0] + Math.cos(an) * h * 0.4) + " " + f1(pe[1] + Math.sin(an) * h * 0.4) + " L" + f1(pe[0] - Math.cos(an - 0.5) * h) + " " + f1(pe[1] - Math.sin(an - 0.5) * h) + " L" + f1(pe[0] - Math.cos(an + 0.5) * h) + " " + f1(pe[1] - Math.sin(an + 0.5) * h) + " Z", "class": cls + "-head" }, g); }

  // ── camera: [from time, target, zoom] ──
  var C = [DX, 0, -150];
  var SH = [[L(4) - 0.6, [60, -60, -80], 0.6], [L(4) + 0.2, [0, -60, -40], 0.85], [L(7), [DX + 30, 0, -150], 1.2], [L(8), [120, 0, -20], 0.95], [L(9), "SEIS", 1.25], [L(10), "SEIS2", 1.0], [L(12), [DX, 0, -160], 1.3], [L(13), "DS", 0.95],
            [L(14), [DX, 0, -50], 1.25], [L(16), [DX, 0, -140], 1.35], [L(19), [DX, 0, -100], 1.0], [L(20), [DX + 80, 0, -170], 1.25], [L(21), [DX + 70, 0, 10], 1.05], [L(22), [-120, -40, 0], 0.95], [L(23) + 0.6, [0, -60, -60], 0.72]];
  function tgt(v, t) { var S = state(t); if (v === "SEIS") return S.seis ? [S.seis.x + 60, 0, -30] : [0, 0, 0]; if (v === "SEIS2") return S.seis ? [S.seis.x + 120, 0, -110] : [0, 0, -100]; if (v === "DS") return S.ds ? [S.ds.x, 0, 30] : [DX, 0, 30]; return v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 12 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 12 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.42 + 0.12 * Math.sin(t * 0.21) + 0.05 * Math.sin(t * 0.63 + 1.0); }

  // labels: [point, text, colour class, from line, off, to line, off]
  var LB = [[[0, -60, -30], "كائنات صغيرة", "c-part", 4, 0.4, 5, 0], [[DX, 0, bz(CAPK, DX, 0) + 10], "صخر ناشف = غطا", "c-part", 7, 0.3, 8, 0], [[DX, 0, bz(RESK, DX, 0) - 16], "النفط", "c-heat", 7, 1.4, 8, 0.2],
            [function (S) { return [S.seis.x, 0, 52]; }, "سفينة مسح", "c-part", 8, 0.3, 9, 0.3], [function (S) { return [S.seis.x + 230, -40, 14]; }, "كابلات طويلة", "c-water", 8, 1.4, 9, 0.3],
            [function (S) { return [S.seis.x + 80, 0, -40]; }, "صوت لتحت", "c-heat", 9, 0.6, 10, 0], [function (S) { return [S.seis.x + 160, 0, -30]; }, "الصدى راجع", "c-water", 10, 0.4, 11, 0.2],
            [[DX, 0, bz(CAPK, DX, 0) + 24], "قبة!", "c-heat", 12, 0.5, 13, 0], [function (S) { return [S.ds.x, 0, 165]; }, "سفينة حفر", "c-part", 13, 0.6, 14, 0.2],
            [[DX + 30, 0, -40], "مواسير حديد", "c-part", 14, 0.5, 15, 0.2], [[DX + 40, 0, SB + 50], "مانع الانفجار", "c-heat", 15, 0.1, 16, 0.4],
            [[DX + 50, 0, -130], "طين تقيل", "c-part", 16, 0.4, 17, 0], [[DX + 110, 0, -120], "بيطلع لوحده!", "c-heat", 19, 0.8, 20, 0.2],
            [[DX + 170, 0, -150], "مية تزق", "c-water", 20, 0.5, 21, 0.2], [[DX + 80, 0, 80], "سفينة إنتاج", "c-part", 21, 0.6, 22, 0.2], [function (S) { return [S.tanker.x, -86, 50]; }, "ناقلة", "c-part", 22, 0.6, 23, 0]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), I = makeIso(theta(t), 0.6, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (230 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, { id: 1 });
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var pt3 = typeof b[0] === "function" ? b[0](r.st) : b[0], p = I.P(pt3[0], pt3[1], pt3[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra, full) { while (svg.firstChild) svg.removeChild(svg.firstChild); var I = makeIso(theta(t) + (extra || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g); drawWorld(g, I, t, { id: 2, full: full }); return I; };
  window.__oilPts = { DX: DX, SB: SB, top: function (k) { return bz(k, DX, 0); } };
})();
