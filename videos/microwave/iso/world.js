/* «إزاي المايكروويف بيسخن الأكل؟» — paper/isometric version: a kitchen counter with a microwave oven cut open (front and
   right walls removed, ceiling drawn as an outline), redrawn every frame. The magnetron sits in the side compartment, a
   waveguide carries the waves into the cavity, they bounce off the walls into the food on the turntable; hot and cold spots
   on the floor, the turntable carrying the food through them.
   x: along the counter (left → right), y: depth (back → front), z: up. */
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

  // ── the kitchen and the oven ──
  var CZ = 90;                                       // counter height
  var MX0 = 0, MX1 = 150, MY0 = -60, MY1 = 40, MZ0 = CZ, MZ1 = CZ + 80, CX1 = 104;   // oven outside, cavity ends at CX1
  var TT = [52, -10, CZ + 6], TR = 36;              // turntable centre and radius

  function state(t, full) {
    var S = { on: 1, waves: 0, guide: 0, bounce: 0, spots: 0, turn: 1, hot: 0, glow: 0 };
    if (full) { S.waves = 1; S.bounce = 1; S.hot = 1; S.glow = 1; return S; }
    S.glow = 1; S.waves = clamp((t - L(12)) / 0.8); S.guide = t >= L(12) && t < L(13) + 0.5 ? 1 : 0;
    S.bounce = t >= L(13) ? clamp((t - L(13)) / 0.6) : 0; S.spots = t >= L(14) && t < L(16) ? clamp((t - L(14) - 0.6) / 0.8) : 0;
    S.turn = t >= L(14) && t < L(15) ? 0 : 1; S.hot = clamp((t - L(13)) / 4);
    if (t >= L(23)) { S.bounce = 1; S.waves = 1; }
    return S;
  }
  function q(I, x, y, z) { return I.P(x, y, z); }
  function food(g, I, t, S, spin) {   // the plate on the glass turntable: rice, a piece of chicken, peas and a carrot
    I.disc(g, TT[0], TT[1], TT[2], TR, "z", "mw-glass"); I.disc(g, TT[0], TT[1], TT[2] + 1.5, TR - 8, "z", "mw-plate"); I.disc(g, TT[0], TT[1], TT[2] + 1.6, TR - 16, "z", "mw-plate-in");
    var items = [[-0.4, "rice"], [1.6, "chick"], [3.6, "veg"]].map(function (it) { var a = spin + it[0]; return { x: TT[0] + Math.cos(a) * 11, y: TT[1] + Math.sin(a) * 11, k: it[1] }; }).sort(function (a, b) { return q(I, a.x, a.y, 0)[1] - q(I, b.x, b.y, 0)[1]; });
    items.forEach(function (it) {
      var p = q(I, it.x, it.y, TT[2] + 3), s = I.K / 0.6;
      if (it.k === "rice") I.el("ellipse", { cx: f1(p[0]), cy: f1(p[1] - 3 * s), rx: f1(9 * s), ry: f1(5 * s), "class": "mw-rice" }, g);
      else if (it.k === "chick") I.el("path", { d: "M" + f1(p[0] - 8 * s) + " " + f1(p[1]) + " c0 -7 " + f1(15 * s) + " " + f1(-8 * s) + " " + f1(16 * s) + " " + f1(-2 * s) + " c-2 4 " + f1(-12 * s) + " " + f1(5 * s) + " " + f1(-16 * s) + " " + f1(2 * s) + " z", "class": "mw-chick" }, g);
      else { [[-3, 0, "mw-pea"], [3, -1, "mw-pea"], [0, -4, "mw-carrot"]].forEach(function (v) { I.el("circle", { cx: f1(p[0] + v[0] * s), cy: f1(p[1] + v[1] * s), r: f1(2.6 * s), "class": v[2] }, g); }); }
    });
    if (S.hot > 0) for (var k = 0; k < 5; k++) { var u = (t * 0.45 + k / 5) % 1, p2 = q(I, TT[0] - 10 + k * 5, TT[1], TT[2] + 8 + u * 30); I.el("path", { d: "M" + f1(p2[0]) + " " + f1(p2[1]) + " q3 -5 0 -10 t0 -10", "class": "mw-steam", style: "opacity:" + (0.7 * S.hot * Math.sin(Math.PI * u)).toFixed(2) }, g); }
  }
  function magnetron(g, I, t, S) {   // in the side compartment: a finned block with a red magnet ring, its antenna into the waveguide
    I.box(g, 112, 142, -34, 4, CZ + 22, CZ + 56, { x: "mw-mag-x", y: "mw-mag-y", z: "mw-mag-top" });
    for (var k = 0; k < 6; k++) I.line(g, [[112, 4, CZ + 26 + k * 5], [142, 4, CZ + 26 + k * 5]], "mw-fin");
    I.box(g, 118, 136, -28, -2, CZ + 14, CZ + 22, { x: "mw-red-x", y: "mw-red", z: "mw-red-top" }); I.box(g, 118, 136, -28, -2, CZ + 56, CZ + 62, { x: "mw-red-x", y: "mw-red", z: "mw-red-top" });
    if (S.glow) { var p = q(I, 127, -15, CZ + 44); I.el("circle", { cx: f1(p[0]), cy: f1(p[1]), r: f1((18 + 3 * Math.sin(t * 9)) * I.K / 0.6), "class": "mw-glow" }, g); }
  }
  function zig(I, a, b, n, amp, t) {   // a wiggly wave from 3D point a to b
    var out = [], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    for (var i = 0; i <= n; i++) { var k = i / n, w = Math.sin(k * n * 0.9 - t * 9) * amp; out.push([a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k + w]); }
    return out;
  }
  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full), spin = S.turn ? t * 1.1 : 0;
    // wall tiles, counter, cabinet doors
    I.face(g, [[-200, -100, CZ], [300, -100, CZ], [300, -100, CZ + 200], [-200, -100, CZ + 200]], "mw-wall");
    for (var tx = -200; tx <= 300; tx += 25) I.line(g, [[tx, -100, CZ], [tx, -100, CZ + 200]], "mw-tile");
    for (var tz = CZ; tz <= CZ + 200; tz += 25) I.line(g, [[-200, -100, tz], [300, -100, tz]], "mw-tile");
    I.box(g, -200, 300, -100, 80, 0, CZ, { x: "mw-cab-x", y: "mw-cab-y", z: "mw-counter" });
    [[-180, -60], [-40, 80], [100, 220]].forEach(function (cd) { I.face(g, [[cd[0], 80, 10], [cd[1], 80, 10], [cd[1], 80, CZ - 14], [cd[0], 80, CZ - 14]], "mw-cabdoor"); var h = q(I, cd[1] - 14, 80, CZ - 30); I.el("circle", { cx: f1(h[0]), cy: f1(h[1]), r: 2.4, "class": "mw-knob" }, g); });
    // a kettle and a mug on the counter, so it reads as a kitchen
    I.cyl(g, -120, -40, 16, CZ, CZ + 34, "mw-kettle", "mw-kettle-top"); I.cyl(g, 220, -30, 9, CZ, CZ + 18, "mw-mug", "mw-mug-top");
    // the oven: shadow, floor, back wall, left wall, compartment (with front panel), ceiling outline
    I.face(g, [[MX0 - 4, MY0 - 2, CZ + 0.2], [MX1 + 6, MY0 - 2, CZ + 0.2], [MX1 + 6, MY1 + 8, CZ + 0.2], [MX0 - 4, MY1 + 8, CZ + 0.2]], "mw-shadow");
    I.box(g, MX0, MX1, MY0, MY1, CZ, CZ + 4, { x: "mw-shell-x", y: "mw-shell-y", z: "mw-floor" });
    I.face(g, [[MX0, MY0, CZ + 4], [MX1, MY0, CZ + 4], [MX1, MY0, MZ1], [MX0, MY0, MZ1]], "mw-back");
    I.face(g, [[MX0, MY0, CZ + 4], [MX0, MY1, CZ + 4], [MX0, MY1, MZ1], [MX0, MY0, MZ1]], "mw-left");
    I.face(g, [[CX1, MY0, CZ + 4], [CX1, MY1, CZ + 4], [CX1, MY1, MZ1], [CX1, MY0, MZ1]], "mw-inner");
    if (S.spots > 0) for (var r = 0; r < 3; r++) for (var cc = 0; cc < 4; cc++) { var hot = (r + cc) % 2 === 0, p = q(I, 14 + cc * 26, MY0 + 16 + r * 30, CZ + 4.5); I.el("ellipse", { cx: f1(p[0]), cy: f1(p[1]), rx: f1(14 * I.K / 0.6 * (1 + 0.1 * Math.sin(t * 4 + r + cc))), ry: f1(7 * I.K / 0.6), "class": hot ? "mw-hotspot" : "mw-coldspot", style: "opacity:" + S.spots.toFixed(2) }, g); }
    magnetron(g, I, t, S);
    I.box(g, 60, 136, -24, 4, MZ1 - 10, MZ1 - 2, { x: "mw-guide-x", y: "mw-guide-y", z: "mw-guide-top" });    // the waveguide along the ceiling
    I.line(g, [[127, -15, CZ + 62], [127, -15, MZ1 - 10]], "mw-antenna");
    food(g, I, t, S, spin);
    I.face(g, [[CX1, MY1, CZ + 4], [MX1, MY1, CZ + 4], [MX1, MY1, MZ1], [CX1, MY1, MZ1]], "mw-panel");
    var dp = [[110, MY1, MZ1 - 8], [144, MY1, MZ1 - 8], [144, MY1, MZ1 - 20], [110, MY1, MZ1 - 20]]; I.face(g, dp, "mw-display");
    var dt = q(I, 127, MY1, MZ1 - 17), txt = I.el("text", { x: f1(dt[0]), y: f1(dt[1]), "text-anchor": "middle", "class": "mw-time", style: "font-size:" + (7 * I.K / 0.6).toFixed(1) + "px" }, g); txt.textContent = "1:" + ("0" + (59 - Math.floor(t) % 60)).slice(-2);
    for (var b = 0; b < 6; b++) I.face(g, [[112 + (b % 2) * 17, MY1, MZ1 - 28 - Math.floor(b / 2) * 12], [124 + (b % 2) * 17, MY1, MZ1 - 28 - Math.floor(b / 2) * 12], [124 + (b % 2) * 17, MY1, MZ1 - 36 - Math.floor(b / 2) * 12], [112 + (b % 2) * 17, MY1, MZ1 - 36 - Math.floor(b / 2) * 12]], "mw-btn");
    I.face(g, [[MX0, MY0, MZ1], [MX1, MY0, MZ1], [MX1, MY1, MZ1], [MX0, MY1, MZ1]], "mw-ceiling");
    I.line(g, [[MX0, MY1, CZ + 4], [MX0, MY1, MZ1], [CX1, MY1, MZ1]], "mw-edge");
    // the waves: out of the antenna, along the guide, into the cavity, bouncing off the walls into the food
    if (S.guide || S.waves) { var u0 = (t * 0.9) % 1; I.line(g, zig(I, [134, -10, MZ1 - 6], [lerp(134, 62, u0), -10, MZ1 - 6], 14, 1.6, t), "mw-wave", "opacity:" + (0.5 + 0.5 * S.waves).toFixed(2)); }
    if (S.bounce > 0) { var path = [[62, -10, MZ1 - 12], [4, -40, CZ + 50], [96, -55, CZ + 30], [10, 20, CZ + 60], [TT[0], TT[1], TT[2] + 8]];
      for (var w = 0; w < 3; w++) { var ph = (t * 0.32 + w / 3) % 1, seg = ph * (path.length - 1), i = Math.floor(seg), fr = seg - i, a = path[i], c = path[i + 1], pt = [lerp(a[0], c[0], fr), lerp(a[1], c[1], fr), lerp(a[2], c[2], fr)];
        I.line(g, zig(I, a, pt, 10, 2, t + w), "mw-wave", "opacity:" + (S.bounce * 0.9).toFixed(2)); var pp = q(I, pt[0], pt[1], pt[2]); I.el("circle", { cx: f1(pp[0]), cy: f1(pp[1]), r: f1(2.6 * I.K / 0.6), "class": "mw-wavedot" }, g); } }
    return { st: S };
  }

  // ── camera: [from time, target, zoom] ──
  var SH = [[L(4) - 0.6, [70, -10, CZ + 40], 1.6], [L(12), [125, -12, CZ + 45], 2.6], [L(12) + 2.4, [95, -10, MZ1 - 8], 2.8], [L(13), [55, -15, CZ + 35], 2.2],
            [L(14), [52, -12, CZ + 4], 2.4], [L(15), [52, -10, CZ + 8], 2.9], [L(16), [65, -5, CZ + 40], 1.8], [L(23), [75, -10, CZ + 40], 2.0]];
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = a[1], pb = b[1], hold = Math.max(0, t - b[0] - 1.0);
    var z = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.03 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 6 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 6 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.45 + 0.08 * Math.sin(t * 0.21) + 0.04 * Math.sin(t * 0.63 + 1.0); }

  // labels: [point, text, colour class, from line, off, to line, off]
  var LB = [[[127, -15, CZ + 70], "المغنطرون", "c-heat", 12, 0.3, 13, 0.2], [[98, -10, MZ1 + 6], "ماسورة معدن", "c-part", 12, 1.6, 13, 0.2], [[4, -40, CZ + 70], "بتخبط في الحيطان", "c-part", 13, 0.4, 14, 0.2],
            [[TT[0], TT[1], TT[2] + 24], "الأكل بيشربها", "c-water", 13, 2.2, 14, 0.1], [[20, -50, CZ + 12], "سخن", "c-heat", 14, 1.0, 16, 0], [[90, 20, CZ + 12], "بارد", "c-water", 14, 1.6, 16, 0],
            [[TT[0], TT[1] + 30, TT[2] + 4], "بتلف", "c-part", 15, 0.4, 16, 0]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), th = theta(t), I = makeIso(th, 0.6, 0, 0), qq = I.P(c.p[0], c.p[1], c.p[2]); I.th = th;
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - qq[0] * c.z).toFixed(2) + " " + (244 - qq[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, { id: 1 });
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var p = I.P(b[0][0], b[0][1], b[0][2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra, full) { while (svg.firstChild) svg.removeChild(svg.firstChild); var th = theta(t) + (extra || 0), I = makeIso(th, K, ox, oy), g = document.createElementNS(NS, "g"); I.th = th; svg.appendChild(g); drawWorld(g, I, t, { full: full }); return I; };
  window.__mw = { CZ: CZ, TT: TT, MZ1: MZ1 };
})();
