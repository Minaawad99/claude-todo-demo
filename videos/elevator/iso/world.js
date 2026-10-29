/* «إزاي الأسانسير مابيقعش؟» — paper/isometric version: a tall building cut open to show the shaft, redrawn
   every frame. The car rides the rails on several ropes over a pulley, a counterweight on the other side; the
   speed governor sits in the machine room on the roof with its own rope down to the car; springs wait in the pit.
   The camera follows the car up and down the shaft and the view turns slowly.
   x: across the shaft, y: back (−) → front (+), z: up (pit floor at 0, machine room from 620). */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function f1(n) { return (+n).toFixed(1); }

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

  // ── what the lift is doing ──────────────────────────────
  var TOPZ = 620, CH = 64, FLOOR = 50;                 // machine room floor, car height, floor spacing
  function carZ(t) {
    if (t < L(8)) return 430 + Math.sin(t * 0.8) * 3;
    if (t < L(11)) return 380 + 50 * Math.sin((t - L(8)) * 0.7);
    if (t < L(12)) return 380 + 50 * Math.sin((L(11) - L(8)) * 0.7);
    var z0 = 380 + 50 * Math.sin((L(11) - L(8)) * 0.7);
    if (t < L(13)) { var u = t - L(12); return z0 - 40 * u * u; }                       // racing down
    var zf = z0 - 40 * Math.pow(L(13) - L(12), 2);
    if (t < L(18) + 0.5) return zf - 6 * (t - L(13));                                    // slow-motion while we explain
    var zs = zf - 6 * (L(18) + 0.5 - L(13)), k = clamp((t - L(18) - 0.5) / 1.2);
    if (t < L(22)) return zs - 14 * (k - k * k / 2);                                     // braking to a stop within a metre or two
    var zb = zs - 7; if (t < L(23)) return lerp(zb, 26, easeIO((t - L(22)) / (L(23) - L(22)))) ;   // lowered gently onto the pit springs
    return 26;
  }
  function cut(t) { return t > L(12) - 0.1 && t < L(22); }                               // ropes gone in the "what if" part
  function govSpeed(t) { if (t < L(12)) return 0.6; if (t < L(16) + 1.0) return 0.6 + 2.4 * clamp((t - L(12)) / (L(16) + 1 - L(12))); return 0; }
  var GPH = [], DT = 0.05; (function () { var a = 0; for (var i = 0; i * DT < 200; i++) { GPH.push(a); a += govSpeed(i * DT) * DT * 3; } })();
  function gph(t) { var i = Math.max(0, Math.min(GPH.length - 2, Math.floor(t / DT))); return lerp(GPH[i], GPH[i + 1], (t - i * DT) / DT); }
  function jaws(t) { return clamp((t - L(18) - 0.3) / 0.4) * (t < L(22) ? 1 : 0); }
  function dark(t) { return t > L(11) + 0.5 && t < L(12) + 0.2; }

  // ── drawing ─────────────────────────────────────────────
  function riders(g, I, cz, t, mood) { for (var i = 0; i < 3; i++) { var x = -22 + i * 22, q = I.P(x, 40, cz + 30), r = 6.5 * I.K; I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(r), "class": "el-head" }, g);
      var ew = r * 0.28; if (mood === "shock") { I.el("circle", { cx: f1(q[0] - ew), cy: f1(q[1] - ew * 0.5), r: f1(ew * 0.8), "class": "el-eye-o" }, g); I.el("circle", { cx: f1(q[0] + ew), cy: f1(q[1] - ew * 0.5), r: f1(ew * 0.8), "class": "el-eye-o" }, g); }
      else I.el("path", { d: "M" + f1(q[0] - ew) + " " + f1(q[1] - ew) + " v" + f1(ew * 1.6) + " M" + f1(q[0] + ew) + " " + f1(q[1] - ew) + " v" + f1(ew * 1.6), "class": "el-eye" }, g); } }
  function drawWorld(g, I, t, o) {
    o = o || {}; var cz = carZ(t), cw = TOPZ - 60 - (cz - 20) * 0.95, rcut = cut(t), jw = jaws(t);
    // building: two back walls with floors, the pit, the machine room on top
    I.face(g, [[-120, -80, 0], [120, -80, 0], [120, -80, TOPZ + 80], [-120, -80, TOPZ + 80]], "el-wall2");
    I.face(g, [[-120, -80, 0], [-120, 110, 0], [-120, 110, TOPZ + 80], [-120, -80, TOPZ + 80]], "el-wall");
    for (var fz = FLOOR; fz < TOPZ; fz += FLOOR) { I.line(g, [[-120, 110, fz], [-120, -80, fz], [120, -80, fz]], "el-floorline"); var fq = I.P(-120, 100, fz + 8); var tx = I.el("text", { x: f1(fq[0] + 4), y: f1(fq[1]), "class": "el-floornum" }, g); tx.textContent = String(fz / FLOOR); }
    I.box(g, -120, 120, -80, 110, -40, 0, { z: "el-pit", x: "iso-cut", y: "iso-cut", hatch: true });
    // pit springs (buffers)
    [-26, 26].forEach(function (bx) { var top = Math.min(24, Math.max(10, cz - 2)), pts = []; for (var k = 0; k <= 10; k++) pts.push([bx + (k % 2 ? 7 : -7), 30, lerp(0, top, k / 10)]); I.line(g, pts, "el-spring"); I.box(g, bx - 9, bx + 9, 22, 38, top, top + 3, { z: "iso-top", x: "iso-x", y: "iso-y" }); });
    // guide rails
    [-52, 52].forEach(function (rx) { I.box(g, rx - 2, rx + 2, 22, 28, 0, TOPZ, { z: "el-rail", x: "el-rail", y: "el-rail-y" }); });
    // counterweight on its own rails at the back
    I.box(g, -26, 26, -62, -44, cw, cw + 70, { z: "el-iron-top", x: "el-iron-x", y: "el-iron" });
    if (!rcut) I.line(g, [[0, -53, cw + 70], [0, -53, TOPZ + 20]], "el-rope");
    // the car
    var dk = dark(t);
    I.box(g, -46, 46, -2, 52, cz, cz + CH, { z: "el-car-top", x: "el-car-x", y: dk ? "el-car-dark" : "el-car" });
    I.face(g, [[-38, 52.5, cz + 6], [38, 52.5, cz + 6], [38, 52.5, cz + CH - 8], [-38, 52.5, cz + CH - 8]], dk ? "el-cab-dark" : "el-cab");
    riders(g, I, cz, t, t > L(12) && t < L(19) + 1.4 ? "shock" : "n");
    I.face(g, [[-38, 53, cz + 6], [38, 53, cz + 6], [38, 53, cz + CH - 8], [-38, 53, cz + CH - 8]], "el-glass");
    // safety jaws + lever under the car (they bite the rails when the governor yanks)
    [-1, 1].forEach(function (sd) { var jx = sd * (46 - 4 * jw); I.box(g, jx - 4, jx + 4, 18, 32, cz - 8, cz + 2, { z: jw > 0.5 ? "el-jaw-on" : "el-jaw", x: jw > 0.5 ? "el-jaw-on" : "el-jaw", y: jw > 0.5 ? "el-jaw-on" : "el-jaw" });
      if (jw > 0.7) for (var sp = 0; sp < 5; sp++) { var u = ((t * 4 + sp / 5) % 1), q = I.P(sd * 52, 25, cz - 4 + u * 26); I.el("circle", { cx: f1(q[0] + sd * u * 10 * I.K), cy: f1(q[1]), r: f1(1.6 * I.K / 0.6), "class": "el-spark", style: "opacity:" + (1 - u).toFixed(2) }, g); } });
    var lv = clamp((t - L(17) - 0.3) / 0.5) * (t < L(22) ? 1 : 0); I.line(g, [[40, 50, cz + CH + 2], [56, 50, cz + CH + 2 + 10 * lv]], "el-lever");
    // hoist ropes (several), or the cut ends dangling
    var n = o.ropes || 6;
    for (var r = 0; r < n; r++) { var rx = -15 + r * 30 / (n - 1), hl = o.highlight === r; if (rcut) { var sw = Math.sin(t * 3 + r) * 4; I.line(g, [[rx, 26, TOPZ], [rx + sw, 26, TOPZ - 40 - r * 4]], "el-rope"); I.line(g, [[rx, 26, cz + CH], [rx - sw, 26, cz + CH + 20 + r * 3]], "el-rope"); }
      else I.line(g, [[rx, 26, cz + CH], [rx, 26, TOPZ + 20]], hl ? "el-rope-hl" : "el-rope", o.fadeRopes && !hl ? "opacity:.2" : ""); }
    // governor rope (its own loop) down the side to the car's lever
    I.line(g, [[56, 50, cz + CH + 2 + 10 * lv], [56, 50, TOPZ + 30]], "el-gov-rope"); I.line(g, [[66, 50, 0], [66, 50, TOPZ + 30]], "el-gov-rope", "stroke-dasharray:4 4;stroke-dashoffset:" + f1(-gph(t) * 30));
    // machine room on the roof: floor, motor + brake, main sheave, governor pulley
    I.box(g, -120, 120, -80, 110, TOPZ, TOPZ + 10, { z: "el-roof", x: "iso-cut", y: "iso-cut", hatch: true });
    var sa = -(cz) * 0.05; I.disc(g, 0, -14, TOPZ + 40, 40, "x", "el-sheave"); for (var sp2 = 0; sp2 < 6; sp2++) { var an = sa + sp2 * 1.047; I.line(g, [[0, -14, TOPZ + 40], [0, -14 + Math.cos(an) * 34, TOPZ + 40 + Math.sin(an) * 34]], "el-spoke"); }
    I.box(g, -80, -30, -40, 10, TOPZ + 10, TOPZ + 50, { z: "el-motor-top", x: "el-motor-x", y: "el-motor" });
    var bk = t > L(10) + 1.6 && t < L(12) ? 1 : 0; I.box(g, -30, -22, -30, 0, TOPZ + 16, TOPZ + 44, { z: bk ? "el-brake-on" : "el-brake", x: bk ? "el-brake-on" : "el-brake", y: bk ? "el-brake-on" : "el-brake" });
    I.disc(g, 61, 50, TOPZ + 40, 18, "y", "el-gov"); var ga = gph(t);
    for (var w = 0; w < 2; w++) { var a2 = ga + w * Math.PI, open = 6 + 8 * clamp((govSpeed(t) - 0.6) / 2.4); I.line(g, [[61, 49, TOPZ + 40], [61 + Math.cos(a2) * open, 49, TOPZ + 40 + Math.sin(a2) * open]], "el-fly"); }
    return { cz: cz };
  }

  // ── camera ──
  var SH = [[L(4), "C", 1.5], [L(5), [0, 26, 500], 1.8], [L(6), "C", 1.7], [L(7), [0, 20, 330], 0.75], [L(8), [0, 0, TOPZ + 20], 1.5], [L(9), [0, 0, 480], 0.85], [L(10), [-40, -10, TOPZ + 30], 2.4],
            [L(11), "C", 1.8], [L(12), "C", 1.3], [L(13), [60, 50, TOPZ + 40], 2.6], [L(14), [40, 40, TOPZ - 40], 1.6], [L(17), "C", 2.0], [L(18), "J", 3.2], [L(19), "C", 1.6],
            [L(20), "C", 1.2], [L(22), [0, 30, 30], 2.0], [L(23), [0, 20, 320], 0.72]];
  function tgt(v, t) { var cz = carZ(t); if (v === "C") return [0, 26, cz + 30]; if (v === "J") return [46, 25, cz]; return v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 10 * Math.sin(t * 1.0), lerp(pa[1], pb[1], k) + 10 * Math.cos(t * 1.0), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return 0.08 + 0.2 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.63 + 1.0); }

  var LB = [[function (z) { return [0, 26, z + 120]; }, "حبال حديد", "c-part", 5, 0.3, 7, 0], [function (z) { return [0, -53, TOPZ - 30]; }, "التقل", "c-part", 8, 0.6, 10, 0],
            [function () { return [-55, -15, TOPZ + 70]; }, "الموتور والفرامل", "c-heat", 10, 0.2, 11, 0], [function () { return [61, 50, TOPZ + 72]; }, "منظّم السرعة", "c-heat", 13, 0.2, 15, 0.5],
            [function (z) { return [56, 50, z + 120]; }, "حبله لوحده", "c-heat", 14, 0.4, 15, 0.5], [function (z) { return [60, 25, z - 20]; }, "فكوك", "c-heat", 18, 0.4, 19, 1.0], [function () { return [0, 30, 60]; }, "سوست", "c-water", 22, 0.3, 23, 0]];
  window.__shaft = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), I = makeIso(theta(t), 0.6, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (230 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var opt = {}; if (t > L(5) && t < L(6)) opt.ropes = Math.min(8, Math.max(2, 1 + Math.floor((t - L(5)) * 3))); if (t > L(4) && t < L(5)) opt.ropes = 6; if (t > L(6) && t < L(7)) { opt.highlight = 2; opt.fadeRopes = t > L(6) + 0.6; }
    var r = drawWorld(g, I, t, opt);
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var pt = b[0](r.cz), p = I.P(pt[0], pt[1], pt[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r;
  };
  window.__shaftStatic = function (svg, t, K, ox, oy, extra) { while (svg.firstChild) svg.removeChild(svg.firstChild); var I = makeIso(theta(t) + (extra || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g); drawWorld(g, I, t); return I; };
  window.__carZ = carZ;
})();
