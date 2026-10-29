/* «إزاي شاشة التلفزيون بتشتغل؟» — paper/isometric version: the screen taken apart into its layers, spread out
   one behind the other: LED backlight, back polarizer, glass with the transistors, the liquid crystal, the colour
   filter, front polarizer. Bundles of light travel through them (toward the viewer, +x) and the camera visits each
   layer. Redrawn every frame. x: through the stack, y: across the screen, z: up. */
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


  // ── the layers ──────────────────────────────────────────
  var W2 = 110, ZH = 150;     // half width across (y), height (z)
  var LAY = [{ k: "back", th: 16, name: "لمبات LED" }, { k: "pol1", th: 4, name: "فلتر 1" }, { k: "tft", th: 6, name: "ترانزستورات" }, { k: "lc", th: 34, name: "كريستال سائل" }, { k: "cf", th: 6, name: "فلتر ألوان" }, { k: "pol2", th: 4, name: "فلتر 2" }];
  function xs(gap) { var x = -120, out = []; LAY.forEach(function (l) { out.push([x, x + l.th]); x += l.th + gap; }); return out; }

  // ── what happens when ───────────────────────────────────
  function state(t, full) {
    var S = { gap: 4, photons: 0, focus: -1, twist: 1, volt: 0, color: 0, front: 1, dark: 0, tft: 0, pick: 0 };
    if (full) { S.gap = 60; S.photons = 1; S.color = 1; return S; }
    var e = clamp((t - L(4) - 0.6) / 1.8), c = clamp((t - L(23) - 0.4) / 1.6); S.gap = lerp(4, 92, easeIO(e)) - (t > L(23) ? lerp(0, 88, easeIO(c)) : 0);
    if (t < L(5)) S.front = 1; else if (t < L(6)) { S.front = 0.06; S.dark = 1; } else if (t < L(23)) S.front = 0; else S.front = clamp((t - L(23) - 1.2) / 1.0);
    if (t >= L(7) && t < L(24)) S.photons = 1;
    S.gates = t >= L(23) && t < L(24) + 0.5;
    if (t >= L(7) && t < L(9)) S.focus = 1; else if (t >= L(9) && t < L(11)) S.focus = 5; else if (t >= L(11) && t < L(16)) S.focus = 3; else if (t >= L(16) && t < L(17)) S.focus = 4; else if (t >= L(22) && t < L(23)) S.focus = 2;
    S.lcOn = t >= L(11) - 0.2;                       // until the crystal shows up, light that passes filter 1 dies at filter 2
    if (t >= L(14)) S.volt = t < L(15) ? clamp((t - L(14) - 1.0) / 0.8) : t < L(16) ? 0.5 + 0.45 * Math.sin(t * 1.6) : 0;
    if (t >= L(16)) S.color = 1;
    if (t >= L(22) && t < L(23)) S.tft = 1;
    return S;
  }

  // ── drawing helpers ─────────────────────────────────────
  function q(I, x, y, z) { return I.P(x, y, z); }
  function slab(g, I, x0, x1, cls, o) { o = o || {}; return I.box(g, x0, x1, -W2, W2, 0, ZH, { x: cls + "-x", y: cls + "-y", z: cls + "-z" }); }
  function faceLine(g, I, x, a, b, cls) { I.line(g, [[x, a[0], a[1]], [x, b[0], b[1]]], cls); }
  // a bundle of light: a double arrow in the y–z plane, ang 0 = shaking up/down, 90 = side to side
  function photon(g, I, x, y, z, ang, cls, sc) { sc = sc || 1; var a = ang * Math.PI / 180, dy = Math.sin(a) * 13 * sc, dz = Math.cos(a) * 13 * sc, p0 = q(I, x, y - dy, z - dz), p1 = q(I, x, y + dy, z + dz);
    I.el("path", { d: "M" + f1(p0[0]) + " " + f1(p0[1]) + " L" + f1(p1[0]) + " " + f1(p1[1]), "class": "lc-ph-o" }, g); I.el("path", { d: "M" + f1(p0[0]) + " " + f1(p0[1]) + " L" + f1(p1[0]) + " " + f1(p1[1]), "class": "lc-ph " + (cls || "") }, g);
    [p0, p1].forEach(function (p) { I.el("circle", { cx: f1(p[0]), cy: f1(p[1]), r: f1(2.6 * sc), "class": "lc-ph-end " + (cls || "") }, g); });
    var tl = q(I, x - 16, y, z); I.el("path", { d: "M" + f1(tl[0]) + " " + f1(tl[1]) + " L" + f1((p0[0] + p1[0]) / 2) + " " + f1((p0[1] + p1[1]) / 2), "class": "lc-ray " + (cls || "") }, g); }

  function drawLayer(g, I, i, X, S, t) {
    var l = LAY[i], x0 = X[i][0], x1 = X[i][1], foc = S.focus === i;
    var cls = { back: "lc-back", pol1: "lc-pol", tft: "lc-glass", lc: "lc-lc", cf: "lc-glass", pol2: "lc-pol" }[l.k];
    slab(g, I, x0, x1, cls);
    if (l.k === "back") { for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) { var y = -W2 + 22 + c * 44, z = 20 + r * 36, p = q(I, x1, y, z); I.el("circle", { cx: f1(p[0]), cy: f1(p[1]), r: f1(9 * I.K / 0.6), "class": "lc-ledglow", style: "opacity:" + (0.55 + 0.3 * Math.sin(t * 4 + r + c)).toFixed(2) }, g); I.el("rect", { x: f1(p[0] - 3), y: f1(p[1] - 3), width: 6, height: 6, "class": "lc-led" }, g); } }
    if (l.k === "pol1") for (var a = 1; a < 12; a++) { var yy = -W2 + a * W2 * 2 / 12; faceLine(g, I, x1 + 0.2, [yy, 4], [yy, ZH - 4], "lc-bar"); }
    if (l.k === "pol2") for (var b = 1; b < 10; b++) { var zz = b * ZH / 10; faceLine(g, I, x1 + 0.2, [-W2 + 4, zz], [W2 - 4, zz], "lc-bar"); }
    if (l.k === "tft") { for (var gr = 1; gr < 6; gr++) faceLine(g, I, x1 + 0.2, [-W2, gr * ZH / 6], [W2, gr * ZH / 6], S.tft && gr === 1 + (Math.floor(t * 2.5) % 5) ? "lc-wire-on" : "lc-wire"); for (var gc = 1; gc < 8; gc++) faceLine(g, I, x1 + 0.2, [-W2 + gc * W2 * 2 / 8, 0], [-W2 + gc * W2 * 2 / 8, ZH], "lc-wire");
      for (var tr = 1; tr < 6; tr++) for (var tc = 1; tc < 8; tc++) { var pp = q(I, x1 + 0.3, -W2 + tc * W2 * 2 / 8 + 6, tr * ZH / 6 - 6); I.el("rect", { x: f1(pp[0] - 2.5), y: f1(pp[1] - 2.5), width: 5, height: 5, "class": "lc-chip" }, g); } }
    if (l.k === "cf") { var n = 9, wcol = ["lc-r", "lc-g", "lc-b"]; for (var s = 0; s < n; s++) { var ya = -W2 + s * W2 * 2 / n, yb = ya + W2 * 2 / n; I.face(g, [[x1 + 0.2, ya, 2], [x1 + 0.2, yb, 2], [x1 + 0.2, yb, ZH - 2], [x1 + 0.2, ya, ZH - 2]], wcol[s % 3]); } }
    if (l.k === "lc") { // rods inside the cell, twisting with depth; with voltage they turn to point along the light
      for (var dr = 0; dr < 5; dr++) { var uu = dr / 4, xx = lerp(x0 + 4, x1 - 4, uu), ang = 90 * uu * S.twist * (1 - S.volt), stand = S.volt;
        for (var ry = -1; ry <= 1; ry++) for (var rz = 0; rz < 3; rz++) { var yc = ry * 60, zc = 30 + rz * 45, an = ang * Math.PI / 180, L2 = 12, dv = [stand * L2, Math.sin(an) * L2 * (1 - stand), Math.cos(an) * L2 * (1 - stand)], wob = Math.sin(t * 3 + dr + ry + rz) * 1.2;
          var pa = q(I, xx - dv[0], yc - dv[1], zc - dv[2] + wob), pb = q(I, xx + dv[0], yc + dv[1], zc + dv[2] + wob); I.el("path", { d: "M" + f1(pa[0]) + " " + f1(pa[1]) + " L" + f1(pb[0]) + " " + f1(pb[1]), "class": "lc-rod" }, g); } }
      if (S.volt > 0.05) { var e1 = q(I, x0, -W2, ZH + 2), e2 = q(I, x1, W2, ZH + 2); I.line(g, [[x0, -W2, ZH + 1], [x1, -W2, ZH + 1], [x1, W2, ZH + 1]], "lc-volt", "opacity:" + S.volt.toFixed(2)); } }
    if (foc) I.line(g, [[x1 + 1, -W2 - 4, -4], [x1 + 1, W2 + 4, -4], [x1 + 1, W2 + 4, ZH + 4], [x1 + 1, -W2 - 4, ZH + 4], [x1 + 1, -W2 - 4, -4]], "lc-focus");
  }
  // the screen face in front: the picture (or black)
  function drawFront(g, I, X, S, t) {
    var x = X[5][1] + 0.4; if (S.front <= 0 && !S.dark) return; if (S.focus >= 0) g = I.el("g", { style: "opacity:.32" }, g);
    var pts = [[x, -W2, 0], [x, W2, 0], [x, W2, ZH], [x, -W2, ZH]];
    if (S.dark) { I.face(g, pts, "lc-black"); return; }
    I.face(g, pts, "lc-pic", "opacity:" + S.front.toFixed(2));
    var sun = q(I, x, 30, 60); I.el("circle", { cx: f1(sun[0]), cy: f1(sun[1]), r: f1(16 * I.K / 0.6), "class": "lc-sun", style: "opacity:" + S.front.toFixed(2) }, g);
    var hill = []; for (var y = -W2; y <= W2; y += 10) hill.push([x, y, 34 + Math.sin(y * 0.03 + 1) * 12]); hill.push([x, W2, 0], [x, -W2, 0]); I.face(g, hill, "lc-hill", "opacity:" + S.front.toFixed(2));
    if (S.gates) for (var gr = 0; gr < 5; gr++) for (var gc = 0; gc < 8; gc++) { var op = 0.5 + 0.5 * Math.sin(t * 3 + gc * 0.9 + gr * 1.3), y0 = -W2 + gc * W2 / 4, z0 = gr * ZH / 5, wq = W2 / 4 * 0.5 * (1 - op); I.face(g, [[x + 0.2, y0, z0 + 2], [x + 0.2, y0 + wq, z0 + 2], [x + 0.2, y0 + wq, z0 + ZH / 5 - 2], [x + 0.2, y0, z0 + ZH / 5 - 2]], "lc-gate"); I.face(g, [[x + 0.2, y0 + W2 / 4 - wq, z0 + 2], [x + 0.2, y0 + W2 / 4, z0 + 2], [x + 0.2, y0 + W2 / 4, z0 + ZH / 5 - 2], [x + 0.2, y0 + W2 / 4 - wq, z0 + ZH / 5 - 2]], "lc-gate"); }
    var bx = -W2 + ((t * 20) % (W2 * 2)); I.face(g, [[x, bx - 10, 12], [x, bx + 10, 12], [x, bx + 6, 6], [x, bx - 6, 6]], "lc-boat", "opacity:" + S.front.toFixed(2));
  }
  function drawPhotons(g, I, X, S, t, seg) {   // seg = index of the gap after layer seg (−1 = before the backlight face? no: from backlight onward)
    if (!S.photons) return;
    var start = X[0][1], end = X[5][1] + 70, rays = [[-60, 40], [0, 100], [60, 60], [-30, 120], [30, 24], [70, 120]];
    rays.forEach(function (r, i) { for (var k = 0; k < 2; k++) {
      var u = ((t * 0.32 + i / 6 + k * 0.5) % 1), x = lerp(start, end, u), ang = Math.floor(hash(i * 7 + k + Math.floor(t * 0.32 + i / 6 + k * 0.5) * 13) * 4) * 45, cls = "", alive = true, op = 1;
      // which gap is it in?
      var gi = -1; for (var j = 0; j < 6; j++) if (x >= X[j][1]) gi = j; if (gi !== seg) continue;
      var pass1 = ang === 0 || (i + k) % 3 === 0;
      if (x > X[1][0]) { if (!pass1) { op = clamp(1 - (x - X[1][0]) / 10); if (op <= 0) continue; } else ang = 0; }
      if (x > X[3][0]) { var lu = clamp((x - X[3][0]) / (X[3][1] - X[3][0])), twist = S.lcOn ? 90 * S.twist * (1 - S.volt) : 0; ang = twist * lu; }
      if (x > X[4][1] && S.color) cls = ["lc-ph-r", "lc-ph-g", "lc-ph-b"][Math.floor((r[0] + W2) / (W2 * 2 / 9)) % 3];
      if (x > X[5][0]) { var pass2 = Math.pow(Math.sin(ang * Math.PI / 180), 2); op *= x > X[5][1] ? pass2 : 1; if (op < 0.05) continue; ang = x > X[5][1] ? 90 : ang; }
      var gg = I.el("g", { style: "opacity:" + op.toFixed(2) }, g); photon(gg, I, x, r[0], r[1], ang, cls, 1.5); } });
  }

  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full), X = xs(S.gap);
    var fl = I.el("g", {}, g); I.face(fl, [[-180, -W2 - 40, -1], [X[5][1] + 120, -W2 - 40, -1], [X[5][1] + 120, W2 + 40, -1], [-180, W2 + 40, -1]], "lc-table");
    for (var i = 0; i < 6; i++) { var lg = S.focus >= 0 && i > S.focus ? I.el("g", { style: "opacity:.32" }, g) : g; drawLayer(lg, I, i, X, S, t); drawPhotons(g, I, X, S, t, i); }   // layers in front of the one in focus turn see-through
    drawFront(g, I, X, S, t);
    if (S.dark) { var bq = q(I, X[0][1] + 6, 0, ZH / 2); I.el("circle", { cx: f1(bq[0]), cy: f1(bq[1]), r: f1(90 * I.K), "class": "lc-glowbig" }, g); }
    return { st: S, X: X };
  }

  // ── camera: [from time, target (x of layer i or point), zoom] ──
  function lx(i) { return function (t) { var X = xs(state(t).gap); return [(X[i][0] + X[i][1]) / 2 + 20, 0, ZH / 2]; }; }
  var SH = [[L(4) - 0.6, [0, 0, 60], 0.75], [L(4) + 0.4, [120, 0, 75], 0.75], [L(5), [120, 0, 75], 0.8], [L(7), lx(1), 1.2], [L(9), lx(5), 1.15], [L(10), lx(4), 0.85], [L(11), lx(3), 1.15], [L(12), lx(3), 1.7],
            [L(13), lx(3), 0.95], [L(14), lx(3), 1.1], [L(16), lx(4), 1.1], [L(22), lx(2), 1.4], [L(23), [0, 0, 70], 0.9], [L(23) + 1.8, [-60, 0, 80], 1.35]];
  function tgt(v, t) { return typeof v === "function" ? v(t) : v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 10 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 10 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return 0.5 + 0.1 * Math.sin(t * 0.21) + 0.05 * Math.sin(t * 0.63 + 1.0); }   // the layer faces open toward us, the stack runs down to the right

  // labels: [layer index or point, text, colour class, from line, off, to line, off]
  var LB = [[-2, "شاشة LCD", "c-part", 4, 0.3, 4, 2.0], [0, "لمبات LED", "c-heat", 4, 2.2, 5, 0.2], [0, "منوّرة على طول", "c-heat", 5, 0.3, 6, 0.2], [1, "فلتر: واقف بس", "c-water", 7, 0.5, 9, 0],
            [5, "فلتر: نايم بس", "c-water", 9, 0.3, 11, 0], [3, "كريستال سائل", "c-part", 11, 0.2, 12, 0.4], [3, "سلّم لولبي", "c-part", 12, 0.6, 13, 0], [5, "عدّى!", "c-water", 13, 1.0, 14, 0],
            [3, "كهربا: اتعدلوا", "c-heat", 14, 1.2, 15, 0], [5, "اتقفل", "c-heat", 14, 1.8, 15, 0], [3, "نص كهربا = نص نور", "c-heat", 15, 0.3, 16, 0], [4, "أحمر · أخضر · أزرق", "c-part", 16, 0.4, 17, 0.2], [2, "ترانزستور لكل نقطة", "c-part", 22, 0.4, 23, 0]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), I = makeIso(theta(t), 0.6, 0, 0), qq = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - qq[0] * c.z).toFixed(2) + " " + (230 - qq[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, { id: 1 });
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], b[5] === b[3] ? L(b[3]) + b[6] : L(b[5]) + b[6]); if (o <= 0) return; var X = r.X, pt = b[0] === -2 ? [X[5][1], 0, ZH + 30] : [(X[b[0]][0] + X[b[0]][1]) / 2, 0, ZH + 24], p = I.P(pt[0], pt[1], pt[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra, full) { while (svg.firstChild) svg.removeChild(svg.firstChild); var I = makeIso(theta(t) + (extra || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g); var r = drawWorld(g, I, t, { id: 2, full: full }); I.X = r.X; return I; };
  window.__lcd = { ZH: ZH, W2: W2 };
})();
