/* «إزاي الـ GPS بيعرف إن فيه زحمة؟» — paper/isometric version: a city block seen from above, redrawn every frame.
   GPS satellites overhead only tell each phone where it is; the phones in the cars send their position and speed
   up to the map, and the map paints each road by how fast its cars move (green → red). The main road jams up,
   the side street stays green, a faster way is suggested, and in the end the cars fade away and only the phones remain.
   x: along the main road, y: across, z: up. */
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


  // ── the block: main road along x (two lanes), side street along y, four blocks of buildings ──
  var X0 = -300, X1 = 300, Y0 = -230, Y1 = 230, RW = 34, SX = 110, SW = 30;      // road half width, side street centre and half width
  var CARC = ["red", "blue", "white", "yellow", "green", "grey", "black", "white", "blue"];
  function hash2(a, b) { return hash(a * 31 + b * 7); }

  // ── what happens when ───────────────────────────────────
  function state(t, full) {
    var S = { sats: 0, sig: 0, pin: 0, send: 0, cloud: 0, jam: 0, paint: 0, eta: 0, alt: 0, report: 0, ghost: 0, dense: 0 };
    if (full) { S.jam = 1; S.paint = 1; S.cloud = 1; S.send = 1; return S; }
    S.sats = clamp((t - L(4) + 0.3) / 1.0) * (1 - clamp((t - L(8) - 0.5) / 1.0));
    S.sig = t >= L(5) && t < L(8) ? 1 : 0; S.pin = t >= L(7) && t < L(8) + 0.6 ? clamp((t - L(7)) / 0.6) : 0;
    S.send = t >= L(8) ? 1 : 0; S.cloud = clamp((t - L(8) - 0.3) / 0.8);
    S.jam = clamp((t - L(11) - 0.3) / 2.0) * (t < L(23) + 3 ? 1 : 1);
    S.paint = clamp((t - L(10)) / 1.2);
    S.eta = t >= L(15) && t < L(16) + 0.2 ? 1 : 0; S.alt = t >= L(16) && t < L(17) ? clamp((t - L(16)) / 0.8) : 0;
    S.report = t >= L(17) && t < L(18) ? clamp((t - L(17) - 0.2) / 0.6) : 0;
    S.ghost = t >= L(20) && t < L(23) ? clamp((t - L(20) - 0.2) / 1.0) * (1 - clamp((t - L(22) - 2.5) / 0.8)) : 0;
    S.dense = t >= L(22) ? clamp((t - L(22)) / 2.0) : 0;
    return S;
  }
  // where every car is: lane A (y < 0, heading +x) jams before the junction; lane B and the side street keep moving
  function cars(t, S) {
    var out = [], span = X1 - X0;
    for (var k = 0; k < 9; k++) {        // lane A
      var free = X0 + (((hash(k) * span + k * span / 9 + 56 * t) % span) + span) % span, head = SX - SW - 26 + Math.sin(t * 0.6) * 2, jamx = head - k * 34 + ((t * 3) % 34) * 0, x = lerp(free, jamx, S.jam);
      out.push({ x: x, y: -RW / 2, ax: "x", dir: 1, col: CARC[k], v: Math.round(lerp(60, 8 + 4 * hash(k), S.jam)), id: k });
    }
    for (var j = 0; j < 6; j++) { var xb = X1 - (((hash(j + 20) * span + j * span / 6 + 60 * t) % span) + span) % span; out.push({ x: xb, y: RW / 2, ax: "x", dir: -1, col: CARC[(j + 4) % 9], v: 60, id: 20 + j }); }
    for (var s = 0; s < 4; s++) { var sp = Y1 - Y0, yy = Y0 + (((hash(s + 40) * sp + s * sp / 4 + 50 * t) % sp) + sp) % sp; out.push({ x: SX + SW / 2, y: yy, ax: "y", dir: 1, col: CARC[(s + 2) % 9], v: 55, id: 40 + s }); }
    return out;
  }

  // ── drawing helpers ─────────────────────────────────────
  function q(I, x, y, z) { return I.P(x, y, z); }
  function car(g, I, c, t, o) {   // body + cabin with glass, wheels, lights; c.ax = axis of travel, c.dir = ±1
    o = o || {}; var L2 = 17, W2 = 8, ax = c.ax === "x";
    function B(a0, a1, b0, b1, z0, z1, k) { if (ax) I.box(g, c.x + a0, c.x + a1, c.y + b0, c.y + b1, z0, z1, k); else I.box(g, c.x + b0, c.x + b1, c.y + a0, c.y + a1, z0, z1, k); }
    var sh = q(I, c.x, c.y, 0); I.el("ellipse", { cx: f1(sh[0]), cy: f1(sh[1] + 1), rx: f1(15 * I.K), ry: f1(8 * I.K), "class": "gp-shadow" }, g);
    var cl = "gp-car-" + c.col, fb = c.dir > 0 ? 1 : -1;
    B(-L2, L2, -W2, W2, 2.5, 9, { x: cl + "-x", y: cl + "-y", z: cl });
    B(-L2 * 0.45 - fb * 2, L2 * 0.5 - fb * 2, -W2 + 1.5, W2 - 1.5, 9, 15, { x: "gp-glass", y: "gp-glass", z: cl });
    [[-L2 * 0.62, W2], [L2 * 0.62, W2], [-L2 * 0.62, -W2], [L2 * 0.62, -W2]].forEach(function (w) { var p = ax ? q(I, c.x + w[0], c.y + w[1], 3) : q(I, c.x + w[1], c.y + w[0], 3); I.el("ellipse", { cx: f1(p[0]), cy: f1(p[1]), rx: f1(3.4 * I.K / 0.6), ry: f1(3.8 * I.K / 0.6), "class": "gp-tire" }, g); });
    var hl = ax ? q(I, c.x + fb * L2, c.y + W2 * 0.6, 6) : q(I, c.x + W2 * 0.6, c.y + fb * L2, 6); I.el("circle", { cx: f1(hl[0]), cy: f1(hl[1]), r: 1.6, "class": fb > 0 ? "gp-head" : "gp-tail" }, g);
    if (o.brake) { var tl = ax ? q(I, c.x - fb * L2, c.y + W2 * 0.6, 6) : q(I, c.x + W2 * 0.6, c.y - fb * L2, 6); I.el("circle", { cx: f1(tl[0]), cy: f1(tl[1]), r: 2.2, "class": "gp-brake" }, g); }
  }
  function building(g, I, b, t) {
    I.box(g, b.x0, b.x1, b.y0, b.y1, 0, b.h, { x: b.c + "-x", y: b.c + "-y", z: b.c + "-top" });
    var fy = I.vis.fy(b), fx = I.vis.fx(b);
    for (var fl = 1; fl * 14 < b.h - 4; fl++) { var z = fl * 14;
      for (var wx = b.x0 + 6; wx < b.x1 - 6; wx += 12) I.face(g, [[wx, fy, z], [wx + 6, fy, z], [wx + 6, fy, z + 7], [wx, fy, z + 7]], hash2(fl, wx) > 0.75 ? "gp-win-lit" : "gp-win");
      for (var wy = b.y0 + 6; wy < b.y1 - 6; wy += 12) I.face(g, [[fx, wy, z], [fx, wy + 6, z], [fx, wy + 6, z + 7], [fx, wy, z + 7]], hash2(fl, wy + 3) > 0.75 ? "gp-win-lit" : "gp-win"); }
    if (b.h < 30) for (var aw = b.x0 + 8; aw < b.x1 - 14; aw += 26) I.face(g, [[aw, b.y0 - 6, 10], [aw + 18, b.y0 - 6, 10], [aw + 18, b.y0, 13], [aw, b.y0, 13]], hash(aw) > 0.5 ? "gp-awn1" : "gp-awn2");
    I.box(g, (b.x0 + b.x1) / 2 - 6, (b.x0 + b.x1) / 2 + 6, (b.y0 + b.y1) / 2 - 5, (b.y0 + b.y1) / 2 + 5, b.h, b.h + 5, { x: "gp-ac-x", y: "gp-ac", z: "gp-ac-top" });
  }
  function tree(g, I, x, y, t) { I.cyl(g, x, y, 1.6, 0, 10, "gp-trunk", "gp-trunk"); var p = q(I, x, y, 18); I.el("circle", { cx: f1(p[0] + Math.sin(t * 1.3 + x) * 0.6), cy: f1(p[1]), r: f1(9 * I.K / 0.6), "class": "gp-leaf" }, g); }
  function person(g, I, x, y, t, k, phone) {   // a little person on the pavement, phone in hand, walking
    var p = q(I, x, y, 0), s = I.K / 0.6, bob = Math.abs(Math.sin(t * 5 + k)) * 1.2 * s, sw = Math.sin(t * 5 + k) * 3 * s, col = ["#c23a26", "#2f6f9f", "#4f8f5a", "#e2b035", "#7a5ab0"][k % 5];
    var s2 = '<g transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ')">';
    s2 += '<ellipse cx="0" cy="0" rx="' + f1(4 * s) + '" ry="' + f1(2 * s) + '" class="gp-shadow"/><path d="M' + f1(-1.4 * s) + ' ' + f1(-8 * s) + ' L' + f1(-1.4 * s + sw * 0.5) + ' 0 M' + f1(1.4 * s) + ' ' + f1(-8 * s) + ' L' + f1(1.4 * s - sw * 0.5) + ' 0" class="gp-leg"/>';
    s2 += '<rect x="' + f1(-3.2 * s) + '" y="' + f1(-17 * s - bob) + '" width="' + f1(6.4 * s) + '" height="' + f1(10 * s) + '" rx="' + f1(2.4 * s) + '" style="fill:' + col + '" class="gp-body"/><circle cx="0" cy="' + f1(-20.5 * s - bob) + '" r="' + f1(3.2 * s) + '" class="gp-headp"/>';
    if (phone) s2 += '<rect x="' + f1(2.4 * s) + '" y="' + f1(-16 * s - bob) + '" width="' + f1(2.4 * s) + '" height="' + f1(3.8 * s) + '" rx=".6" class="gp-phone"/>';
    var gg = I.el("g", {}, g); gg.innerHTML = s2 + '</g>';
  }
  // a GPS satellite (Block IIF/III layout): gold-foil box body, a ring of antennas facing Earth, two long solar wings
  function satellite(g, I, x, y, z, t, k, op) {
    var p = q(I, x, y, z), s = I.K / 0.6 * 1.1, a = Math.sin(t * 0.4 + k) * 6, gg = I.el("g", { transform: "translate(" + f1(p[0]) + " " + f1(p[1] + Math.sin(t * 0.8 + k) * 3) + ") rotate(" + f1(a) + ") scale(" + f1(s) + ")", style: "opacity:" + op.toFixed(2) }, g);
    var s2 = '<path d="M-60 -2 H-14 M14 -2 H60" class="gp-boom"/>';
    [-1, 1].forEach(function (e) { s2 += '<g transform="translate(' + (e * 37) + ' -2)"><rect x="-22" y="-9" width="44" height="18" class="gp-panel"/>'; for (var c = -2; c <= 2; c++) s2 += '<path d="M' + (c * 8.8) + ' -9 V9" class="gp-cell"/>'; s2 += '<path d="M-22 0 H22" class="gp-cell"/></g>'; });
    s2 += '<rect x="-12" y="-12" width="24" height="20" rx="1.5" class="gp-bus"/><path d="M-12 -4 H12 M-4 -12 V8" class="gp-foil"/><rect x="-9" y="8" width="18" height="5" class="gp-antbase"/>';
    for (var r = 0; r < 4; r++) s2 += '<rect x="' + (-8 + r * 4.4) + '" y="13" width="2.6" height="4" class="gp-ant"/>';
    gg.innerHTML = s2;
  }
  function cloudIcon(g, I, x, y, z, t, op) { var p = q(I, x, y, z), s = I.K / 0.6, gg = I.el("g", { transform: "translate(" + f1(p[0]) + " " + f1(p[1] + Math.sin(t * 1.1) * 2) + ") scale(" + f1(s) + ")", style: "opacity:" + op.toFixed(2) }, g);
    gg.innerHTML = '<path d="M-34 10 C-46 10 -46 -8 -32 -8 C-30 -24 -8 -26 -2 -14 C6 -26 30 -22 28 -6 C42 -6 42 10 30 10 Z" class="gp-cloud"/><rect x="-14" y="-10" width="28" height="18" rx="2" class="gp-mapic"/><path d="M-12 4 L-4 -4 L4 2 L12 -6" class="gp-mapline"/>'; }

  // ── the world ───────────────────────────────────────────
  var BLD = [{ x0: -290, x1: -170, y0: -220, y1: -60, h: 70, c: "gp-b1" }, { x0: -150, x1: 60, y0: -220, y1: -60, h: 46, c: "gp-b2" }, { x0: 150, x1: 290, y0: -220, y1: -60, h: 96, c: "gp-b3" },
             { x0: -290, x1: -120, y0: 90, y1: 220, h: 16, c: "gp-b3" }, { x0: -100, x1: 60, y0: 90, y1: 220, h: 22, c: "gp-b1" }, { x0: 150, x1: 290, y0: 90, y1: 220, h: 14, c: "gp-b2" }];
  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full), C = cars(t, S);
    I.vis = { fy: function (b) { return (Math.cos(I.th) - Math.sin(I.th)) > 0 ? b.y1 : b.y0; }, fx: function (b) { return (Math.cos(I.th) + Math.sin(I.th)) > 0 ? b.x1 : b.x0; } };
    // ground, pavements, roads, lane marks, crossings
    I.face(g, [[X0, Y0, -1], [X1, Y0, -1], [X1, Y1, -1], [X0, Y1, -1]], "gp-pave");
    I.box(g, X0, X1, Y0, Y1, -14, -1, { x: "gp-ground-x", y: "gp-ground-y", z: "gp-pave" });
    I.face(g, [[X0, -RW, 0], [X1, -RW, 0], [X1, RW, 0], [X0, RW, 0]], "gp-road"); I.face(g, [[SX - SW, Y0, 0.1], [SX + SW, Y0, 0.1], [SX + SW, Y1, 0.1], [SX - SW, Y1, 0.1]], "gp-road");
    for (var d = X0 + 10; d < X1; d += 30) if (Math.abs(d - SX) > SW + 6) I.face(g, [[d, -1, 0.2], [d + 16, -1, 0.2], [d + 16, 1, 0.2], [d, 1, 0.2]], "gp-dash");
    for (var d2 = Y0 + 10; d2 < Y1; d2 += 30) if (Math.abs(d2) > RW + 6) I.face(g, [[SX - 1, d2, 0.2], [SX + 1, d2, 0.2], [SX + 1, d2 + 16, 0.2], [SX - 1, d2 + 16, 0.2]], "gp-dash");
    for (var z = 0; z < 6; z++) I.face(g, [[SX - SW - 12, -RW + 4 + z * 11, 0.2], [SX - SW - 4, -RW + 4 + z * 11, 0.2], [SX - SW - 4, -RW + 10 + z * 11, 0.2], [SX - SW - 12, -RW + 10 + z * 11, 0.2]], "gp-zebra");
    if (S.alt > 0) { I.line(g, [[-140, -RW / 2, 1], [SX - SW / 2, -RW / 2, 1], [SX - SW / 2, -RW - 6, 1], [SX + SW / 2, Y0 + 10, 1]], "gp-route", "opacity:" + S.alt.toFixed(2)); }
    // everything standing on the ground, back to front
    var items = [];
    BLD.forEach(function (b) { items.push({ k: q(I, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0)[1] + 0 * b.h, f: function () { building(g, I, b, t); } }); });
    [[-250, -48], [-90, -48], [20, -48], [200, -48], [-230, 48], [-40, 48], [230, 48]].forEach(function (tr, i) { items.push({ k: q(I, tr[0], tr[1], 0)[1], f: function () { tree(g, I, tr[0], tr[1], t); } }); });
    for (var pp = 0; pp < 10; pp++) (function (pp) { var side = pp % 2 ? 46 : -46, span = 520, px = -260 + ((hash(pp + 60) * span + (pp % 3 ? 8 : -8) * t) % span + span) % span; if (Math.abs(px - SX) < SW + 10) return; items.push({ k: q(I, px, side, 0)[1], f: function () { person(g, I, px, side, t, pp, true); } }); })(pp);
    C.forEach(function (c) { if (c.x < X0 + 4 || c.x > X1 - 4 || c.y < Y0 + 4 || c.y > Y1 - 4) return; items.push({ k: q(I, c.x, c.y, 0)[1], c: c, f: function () { var cg = I.el("g", { style: "opacity:" + (1 - 0.85 * S.ghost).toFixed(2) }, g); car(cg, I, c, t, { brake: c.id < 9 && S.jam > 0.5 }); } }); });
    items.sort(function (a, b) { return a.k - b.k; }).forEach(function (it) { it.f(); });
    // the traffic layer, floating over the road like a map layer: each stretch painted by the speed of its cars
    if (S.paint > 0) { var ZL = 24; var segs = 12; for (var sgi = 0; sgi < segs; sgi++) { var xa = X0 + sgi * (X1 - X0) / segs, xb = xa + (X1 - X0) / segs; if (xb > SX - SW && xa < SX + SW) continue;
        var jamHere = xb < SX - SW ? S.jam * clamp((xb - X0) / 240 + 0.3) : 0, col = jamHere > 0.6 ? "gp-t-red" : jamHere > 0.25 ? "gp-t-orange" : "gp-t-green";
        I.face(g, [[xa + 1, -RW / 2 - 3, ZL], [xb - 1, -RW / 2 - 3, ZL], [xb - 1, -RW / 2 + 3, ZL], [xa + 1, -RW / 2 + 3, ZL]], col, "opacity:" + (0.9 * S.paint).toFixed(2)); I.face(g, [[xa + 1, RW / 2 - 3, ZL], [xb - 1, RW / 2 - 3, ZL], [xb - 1, RW / 2 + 3, ZL], [xa + 1, RW / 2 + 3, ZL]], "gp-t-green", "opacity:" + (0.9 * S.paint).toFixed(2)); }
      I.face(g, [[SX + SW / 2 - 3, Y0, ZL], [SX + SW / 2 + 3, Y0, ZL], [SX + SW / 2 + 3, Y1, ZL], [SX + SW / 2 - 3, Y1, ZL]], "gp-t-green", "opacity:" + (0.9 * S.paint).toFixed(2)); }
    // phones: a dot over every car (bright when the cars fade away), pings rising to the map
    if (S.send || S.ghost) C.forEach(function (c, i) { if (c.x < X0 + 4 || c.x > X1 - 4 || c.y < Y0 + 4 || c.y > Y1 - 4) return; var p = q(I, c.x, c.y, 20); I.el("circle", { cx: f1(p[0]), cy: f1(p[1]), r: f1((2.4 + 2.6 * S.ghost) * I.K / 0.6), "class": "gp-dot" }, g);
      if (S.cloud > 0) { var u = (t * 0.7 + hash(i + 3)) % 1, pz = q(I, lerp(c.x, 0, u), lerp(c.y, 0, u), lerp(20, 250, u)); I.el("circle", { cx: f1(pz[0]), cy: f1(pz[1]), r: 1.6, "class": "gp-ping", style: "opacity:" + (S.cloud * (1 - u)).toFixed(2) }, g); } });
    if (S.dense) for (var e = 0; e < 24; e++) { var ex = X0 + 20 + hash(e + 90) * 560, ey = e % 2 ? -RW / 2 : RW / 2, pe = q(I, ex, ey, 20); I.el("circle", { cx: f1(pe[0]), cy: f1(pe[1]), r: 1.8, "class": "gp-dot", style: "opacity:" + S.dense.toFixed(2) }, g); }
    // speed tags over a few cars of lane A
    if (t >= L(9) && t < L(13) && S.send) C.slice(0, 9).forEach(function (c, i) { if (i % 3 || c.x < X0 + 10 || c.x > X1 - 10) return; var p = q(I, c.x, c.y, 34); var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "gp-speed " + (c.v < 30 ? "slow" : "") }, g); tx.textContent = c.v; });
    // Waze-style reports: an accident and a pothole pinned on the road
    if (S.report > 0) [[-60, -RW / 2, "!"], [230, RW / 2, "◒"]].forEach(function (r, i) { var p = q(I, r[0], r[1], 30 + Math.sin(t * 3 + i) * 2), gg = I.el("g", { transform: "translate(" + f1(p[0]) + " " + f1(p[1]) + ") scale(" + (S.report * I.K / 0.6).toFixed(2) + ")" }, g); gg.innerHTML = '<path d="M0 10 C-14 -4 -12 -20 0 -20 C12 -20 14 -4 0 10 Z" class="gp-pin"/><text y="-6" text-anchor="middle" class="gp-pintx">' + r[2] + '</text>'; });
    // the pin "you are here" on the first car of lane A
    if (S.pin > 0) { var me = C[0], pm = q(I, me.x, me.y, 28 + 8 * (1 - S.pin)), pg = I.el("g", { transform: "translate(" + f1(pm[0]) + " " + f1(pm[1]) + ") scale(" + (S.pin * I.K / 0.6).toFixed(2) + ")" }, g); pg.innerHTML = '<path d="M0 12 C-16 -4 -14 -22 0 -22 C14 -22 16 -4 0 12 Z" class="gp-me"/><circle cy="-8" r="5" fill="#fff"/>'; }
    // the sky: GPS satellites and their signals down to one car
    var SAT = [[-260, -200, 330], [240, -180, 360], [-120, 210, 380], [260, 190, 340]];
    if (S.sats > 0) SAT.forEach(function (s, i) { satellite(g, I, s[0], s[1], s[2], t, i, S.sats); if (S.sig) { var me = C[0], a = q(I, s[0], s[1], s[2] - 14), b = q(I, me.x, me.y, 16), u = (t * 0.8 + i * 0.25) % 1; I.el("path", { d: "M" + f1(a[0]) + " " + f1(a[1]) + " L" + f1(b[0]) + " " + f1(b[1]), "class": "gp-sig" }, g); I.el("circle", { cx: f1(lerp(a[0], b[0], u)), cy: f1(lerp(a[1], b[1], u)), r: 2.4, "class": "gp-sigdot" }, g); } });
    if (S.cloud > 0) cloudIcon(g, I, 0, 0, 260, t, S.cloud);
    if (S.eta) { var me2 = C[0], pe2 = q(I, me2.x, me2.y, 44), eg = I.el("g", { transform: "translate(" + f1(pe2[0]) + " " + f1(pe2[1]) + ")" }, g); eg.innerHTML = '<rect x="-30" y="-12" width="60" height="20" rx="6" class="gp-eta"/><text y="3" text-anchor="middle" class="gp-etatx">' + (18 + Math.floor((t - L(15)) * 0)) + ' دقيقة</text>'; }
    return { st: S, cars: C };
  }

  // ── camera: [from time, target, zoom] ──
  function meT(t) { var C = cars(t, state(t)); return [C[0].x, C[0].y, 10]; }
  var SH = [[L(4) - 0.6, [60, 40, 40], 0.42], [L(4) + 0.2, [0, 0, 140], 0.66], [L(5), [0, 0, 120], 0.7], [L(7), meT, 1.6], [L(8), [0, 0, 70], 0.75], [L(10), [-20, 0, 20], 0.95], [L(11), [-60, -10, 10], 1.25],
            [L(12), [-40, 0, 0], 1.05], [L(13), [SX, 40, 0], 1.25], [L(15), meT, 1.5], [L(16), [SX - 30, -40, 0], 1.15], [L(17), [80, 0, 10], 1.1], [L(20), [0, 0, 10], 0.85], [L(21), [-20, 0, 10], 0.7], [L(22), [0, 0, 40], 0.8], [L(23), [-70, -20, 10], 1.3]];
  function tgt(v, t) { return typeof v === "function" ? v(t) : v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 12 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 12 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.5 + 0.1 * Math.sin(t * 0.21) + 0.05 * Math.sin(t * 0.63 + 1.0); }

  // labels: [point or fn(cars), text, colour class, from line, off, to line, off]
  var LB = [[[0, 0, 400], "أقمار الـ GPS", "c-part", 4, 0.4, 5, 0.3], [function (C) { return [C[0].x, C[0].y, 50]; }, "إنت هنا", "c-heat", 7, 0.4, 8, 0.3], [[0, 0, 300], "الخريطة", "c-water", 8, 0.6, 10, 0],
            [[-120, -RW, 60], "60… 60… 60", "c-water", 9, 1.0, 10, 0.2], [[-120, -RW, 60], "عشرة بس!", "c-heat", 11, 1.6, 12, 0.3], [[-120, -RW, 40], "زحمة", "c-heat", 12, 0.3, 13, 0.3], [[SX, 120, 40], "ماشي = أخضر", "c-water", 13, 0.3, 14, 0.3],
            [[SX, -120, 40], "طريق أسرع", "c-water", 16, 0.4, 17, 0.2], [[-60, -RW, 54], "حادثة", "c-heat", 17, 0.5, 18, 0], [[0, 0, 120], "بتشوف الموبايلات بس!", "c-heat", 20, 0.6, 21, 0.4]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), th = theta(t), I = makeIso(th, 0.6, 0, 0), qq = I.P(c.p[0], c.p[1], c.p[2]); I.th = th;
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - qq[0] * c.z).toFixed(2) + " " + (230 - qq[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, { id: 1 });
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var pt = typeof b[0] === "function" ? b[0](r.cars) : b[0], p = I.P(pt[0], pt[1], pt[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra, full) { while (svg.firstChild) svg.removeChild(svg.firstChild); var th = theta(t) + (extra || 0), I = makeIso(th, K, ox, oy), g = document.createElementNS(NS, "g"); I.th = th; svg.appendChild(g); drawWorld(g, I, t, { id: 2, full: full }); return I; };
  window.__gps = { SX: SX, RW: RW };
})();
