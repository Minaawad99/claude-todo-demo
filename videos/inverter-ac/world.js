/* «إزاي التكييف الإنفرتر بيوفر كهربا؟» — isometric 3D room, redrawn every frame.
   The camera both pans/zooms between parts AND slowly turns around the room (the model is rotated about
   its vertical axis before the isometric projection), so the view never sits on one face.
   x: left wall (−230) → outside (+320), y: back wall (−170) → front cut (+170), z: up. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, t) { return easeIO((t - a) / (b - a)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }

  // ── a rotatable isometric projection with the Iso3D drawing helpers ──
  function makeIso(theta, K, OX, OY) {
    var c = Math.cos(theta), s = Math.sin(theta);
    function P(x, y, z) { var xr = x * c - y * s, yr = x * s + y * c; return [OX + (xr - yr) * 0.866 * K, OY + (xr + yr) * 0.5 * K - z * K]; }
    function d(list, close) { return "M" + list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + (close === false ? "" : " Z"); }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function face(g, list, cls, st) { var a = { d: d(list), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function line(g, list, cls, st) { var a = { d: d(list, false), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function box(g, x0, x1, y0, y1, z0, z1, k) {
      k = k || {};
      face(g, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], k.y || "iso-y");
      face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], k.x || "iso-x");
      if (k.hatch !== false) face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], "tz-pat-hatch");
      if (k.hatchY) face(g, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], "tz-pat-hatch", "opacity:.5");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top");
    }
    function ring(cx, cy, cz, r, n, plane, a0, a1) {
      var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
      for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); }
      return out;
    }
    function disc(g, cx, cy, cz, r, plane, cls) { return face(g, ring(cx, cy, cz, r, 30, plane), cls); }
    function cyl(g, cx, cy, r, z0, z1, side, top) {
      var a0 = -Math.PI / 4 - theta, front = ring(cx, cy, z1, r, 18, "z", a0, a0 + Math.PI);
      var back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; });
      face(g, front.concat(back), side || "iso-steel"); return face(g, ring(cx, cy, z1, r, 28, "z"), top || "iso-top");
    }
    function pipe(g, list, inner) { line(g, list, "iso-pipe-o"); return line(g, list, inner || "iso-pipe-i"); }
    return { P: P, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, cyl: cyl, pipe: pipe, K: K };
  }
  // points along a 3D polyline by fraction of its length
  function track(pts) {
    var seg = [], tot = 0;
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); seg.push(l); tot += l; }
    return function (u) {
      u = ((u % 1) + 1) % 1; var dl = u * tot;
      for (var i = 0; i < seg.length; i++) { if (dl <= seg[i] || i === seg.length - 1) { var k = seg[i] ? dl / seg[i] : 0, a = pts[i], b = pts[i + 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; } dl -= seg[i]; }
    };
  }

  // ── what the machine is doing over time ─────────────────────
  function speed(t) {                       // compressor speed 0..1
    if (t < L(10)) return 0.8;
    if (t < L(15)) { if (t < L(11) + 0.6) return 1; if (t < L(12) + 0.4) return 0; return 1; }
    if (t < L(17)) return 0.6;
    if (t < L(18)) { var u = (t - L(17)) / (L(18) - L(17)); return 0.6 + 0.4 * Math.sin(u * Math.PI * 2); }
    if (t < L(19)) return 1;
    if (t < L(20)) return lerp(1, 0.35, smooth(L(19), L(20), t));
    return 0.35;
  }
  var SPH = [], DT = 0.05; (function () { var acc = 0; for (var i = 0; i * DT < 200; i++) { SPH.push(acc); acc += speed(i * DT) * DT; } })();
  function phase(t) { var i = Math.max(0, Math.min(SPH.length - 2, Math.floor(t / DT))); return lerp(SPH[i], SPH[i + 1], (t - i * DT) / DT); }
  function roomT(t) {
    if (t > L(10) && t < L(15)) { if (t < L(11) + 0.6) return lerp(26, 24, smooth(L(10), L(11) + 0.6, t)); if (t < L(12) + 0.4) return lerp(24, 26, smooth(L(11) + 0.6, L(12) + 0.4, t)); return lerp(26, 24, smooth(L(12) + 0.4, L(14), t)); }
    if (t > L(18) && t < L(20)) return lerp(29, 24, smooth(L(18), L(20), t));
    return 24;
  }
  function flicker(t) { var a = win(t, L(13) + 1.0, L(13) + 1.7, 0.05) + win(t, L(14) + 0.6, L(14) + 1.3, 0.05); return a > 0 ? 0.25 + 0.75 * (Math.sin(t * 61) > 0 ? 1 : 0) : 1; }

  // ── the scene ───────────────────────────────────────────────
  var coldP = [[110, -150, 262], [162, -150, 262], [162, -150, 140], [232, -58, 140]], hotP = [[232, -58, 112], [156, -144, 112], [156, -144, 250], [110, -144, 250]];
  var coldT = track(coldP), hotT = track(hotP);
  var airC = [], airH = [], outH = [];
  for (var k = 0; k < 6; k++) { airC.push(track([[40 + k * 12, -138, 244], [30 + k * 14, -60, 170], [10 + k * 16, 60, 90]])); airH.push(track([[-120 + k * 30, 80, 60], [0 + k * 12, -60, 200], [40 + k * 12, -150, 288]])); outH.push(track([[190 + k * 6, -40, 110 + k * 6], [200 + k * 8, 70, 125], [220 + k * 10, 180, 150]])); }

  function drawScene(g, I, t, o) {
    o = o || {};
    var sp = speed(t), ph = phase(t);
    // room shell
    I.box(g, -230, 150, -170, 170, -14, 0, { z: "iso-floor" });
    I.face(g, [[-230, -170, 0], [150, -170, 0], [150, -170, 320], [-230, -170, 320]], "iso-wall2"); I.face(g, [[-230, -170, 0], [150, -170, 0], [150, -170, 320], [-230, -170, 320]], "tz-pat-hatch", "opacity:.3");
    I.face(g, [[-230, -170, 0], [-230, 170, 0], [-230, 170, 320], [-230, -170, 320]], "iso-wall"); I.face(g, [[-230, -170, 0], [-230, 170, 0], [-230, 170, 320], [-230, -170, 320]], "tz-pat-hatch", "opacity:.3");
    // window + sun, thermometer
    I.face(g, [[-150, -169, 150], [-60, -169, 150], [-60, -169, 250], [-150, -169, 250]], "iso-top");
    I.face(g, [[-144, -168, 156], [-66, -168, 156], [-66, -168, 244], [-144, -168, 244]], "iso-sky");
    I.disc(g, -86, -167, 226, 10, "y", "iso-sun");
    I.line(g, [[-105, -167, 156], [-105, -167, 244]], "iso-frame"); I.line(g, [[-144, -167, 200], [-66, -167, 200]], "iso-frame");
    I.face(g, [[-36, -169, 160], [-20, -169, 160], [-20, -169, 250], [-36, -169, 250]], "iso-top");
    var lvl = 172 + (roomT(t) - 20) * 6; I.line(g, [[-28, -168, 172], [-28, -168, lvl]], "iso-thermo"); I.disc(g, -28, -168, 168, 5, "y", "iso-hot");
    // rug, sofa, plant, floor lamp
    I.face(g, [[-190, -60, 1], [-40, -60, 1], [-40, 80, 1], [-190, 80, 1]], "iso-rug");
    I.box(g, -205, -75, -168, -150, 0, 95, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
    I.box(g, -205, -75, -150, -95, 0, 42, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
    I.box(g, -205, -190, -150, -95, 0, 62, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" }); I.box(g, -90, -75, -150, -95, 0, 62, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
    I.cyl(g, -40, -130, 14, 0, 30, "iso-pot", "iso-soil"); I.disc(g, -40, -130, 52, 22, "z", "iso-leaf"); I.disc(g, -46, -126, 70, 15, "z", "iso-leaf");
    I.line(g, [[-205, 70, 0], [-205, 70, 150]], "iso-frame", "stroke-width:2.2"); I.cyl(g, -205, 70, 20, 150, 180, "iso-shade", "iso-shade-top");
    var lampOn = flicker(t); var lq = I.P(-205, 70, 160);
    I.el("circle", { cx: lq[0].toFixed(1), cy: lq[1].toFixed(1), r: (34 * I.K).toFixed(1), "class": "iso-glow", style: "opacity:" + (0.55 * lampOn).toFixed(2) }, g);
    // indoor unit on the back wall
    I.box(g, 10, 120, -168, -140, 236, 286, { z: "iso-unit-top", x: "iso-unit-x", y: "iso-unit", hatch: false });
    for (var sl = 0; sl < 4; sl++) I.line(g, [[16, -139, 242 + sl * 4], [114, -139, 242 + sl * 4]], "iso-slat");
    var lq2 = I.P(112, -139, 278); I.el("circle", { cx: lq2[0].toFixed(1), cy: lq2[1].toFixed(1), r: 1.8, "class": sp > 0.05 ? "iso-led-on" : "iso-led" }, g);
    // room air: warm rising into the unit, cold blowing out (more when the compressor works harder)
    if (o.flows !== false && t > L(6) - 0.3) {
      var nA = 4, aOn = 0.4 + 0.6 * sp;
      airH.forEach(function (tr, i) { for (var k = 0; k < nA; k++) { var u = (k / nA + t * 0.12 + i * 0.13) % 1, q = tr(u), s = I.P(q[0], q[1], q[2]); I.el("circle", { cx: s[0].toFixed(1), cy: s[1].toFixed(1), r: (2.6 * I.K / 0.62).toFixed(1), "class": "pt-heat", style: "opacity:" + (0.75 * Math.sin(Math.PI * u)).toFixed(2) }, g); } });
      airC.forEach(function (tr, i) { for (var k = 0; k < nA; k++) { var u = (k / nA + t * 0.2 * aOn + i * 0.17) % 1, q = tr(u), s = I.P(q[0], q[1], q[2]); I.el("circle", { cx: s[0].toFixed(1), cy: s[1].toFixed(1), r: (2.8 * I.K / 0.62).toFixed(1), "class": "pt-cold", style: "opacity:" + (aOn * Math.sin(Math.PI * u)).toFixed(2) }, g); } });
    }
    // exterior wall (cut at the front) + pipes through it
    I.box(g, 130, 150, -170, 170, 0, 320, { z: "iso-top", x: "iso-wall-out", y: "iso-cut", hatchY: true });
    I.pipe(g, coldP, "iso-pipe-cold"); I.pipe(g, hotP, "iso-pipe-hot");
    if (o.flows !== false) {
      for (var j = 0; j < 7; j++) {
        var qc = coldT((j / 7 + ph * 0.25) % 1), qh = hotT((j / 7 + ph * 0.25) % 1), a = I.P(qc[0], qc[1], qc[2]), b = I.P(qh[0], qh[1], qh[2]), on = sp > 0.02 ? 1 : 0.15;
        I.el("circle", { cx: a[0].toFixed(1), cy: a[1].toFixed(1), r: (2.6 * I.K / 0.62).toFixed(1), "class": "pt-cold", style: "opacity:" + on }, g);
        I.el("circle", { cx: b[0].toFixed(1), cy: b[1].toFixed(1), r: (2.6 * I.K / 0.62).toFixed(1), "class": "pt-hot", style: "opacity:" + on }, g);
      }
    }
    // outdoor unit on its bracket, front cut away
    I.box(g, 160, 320, -70, 80, 56, 68, { z: "iso-top" });
    I.line(g, [[160, 80, 56], [150, 80, 20]], "iso-frame", "stroke-width:2.4"); I.line(g, [[320, 80, 56], [150, 80, -10]], "iso-frame", "stroke-width:1.6");
    I.face(g, [[170, -60, 68], [310, -60, 68], [310, -60, 196], [170, -60, 196]], "iso-wall2");
    for (var cz = 80; cz < 190; cz += 9) I.line(g, [[176, -59, cz], [240, -59, cz]], "iso-coil");
    I.face(g, [[170, -60, 68], [170, 70, 68], [170, 70, 196], [170, -60, 196]], "iso-wall");
    I.face(g, [[170, -60, 68], [310, -60, 68], [310, 70, 68], [170, 70, 68]], "iso-floor");
    // fan (turns with the compressor) behind a ring
    var fa = ph * 9, fc = [206, -36, 132];
    I.disc(g, fc[0], fc[1], fc[2], 48, "y", "iso-fanring");
    for (var bl = 0; bl < 3; bl++) { var ba = fa + bl * Math.PI * 2 / 3; I.face(g, [[fc[0], fc[1] + 1, fc[2]], [fc[0] + Math.cos(ba - 0.32) * 44, fc[1] + 1, fc[2] + Math.sin(ba - 0.32) * 44], [fc[0] + Math.cos(ba + 0.25) * 42, fc[1] + 1, fc[2] + Math.sin(ba + 0.25) * 42]], "iso-blade"); }
    I.disc(g, fc[0], fc[1] + 2, fc[2], 7, "y", "iso-hub");
    // divider + compressor (copper-red dome, shakes while it runs)
    I.face(g, [[248, -60, 68], [248, 70, 68], [248, 70, 196], [248, -60, 196]], "iso-wall2", "opacity:.9");
    var jx = sp > 0.02 ? Math.sin(t * 80) * 0.9 * sp : 0;
    I.cyl(g, 282 + jx, 6, 20, 68, 140, "iso-comp", "iso-comp-top"); I.cyl(g, 282 + jx, 6, 13, 140, 152, "iso-comp", "iso-comp-top");
    I.box(g, 262, 300, -50, -30, 160, 186, { z: "iso-board-top", x: "iso-board-x", y: "iso-board", hatch: false });     // control board
    // hot air out of the front of the outdoor unit
    if (o.flows !== false && t > L(7) - 0.3) outH.forEach(function (tr, i) { for (var k = 0; k < 3; k++) { var u = (k / 3 + ph * 0.3 + i * 0.11) % 1, q = tr(u), s = I.P(q[0], q[1], q[2]); I.el("circle", { cx: s[0].toFixed(1), cy: s[1].toFixed(1), r: (2.6 * I.K / 0.62).toFixed(1), "class": "pt-heat", style: "opacity:" + ((sp > 0.02 ? 0.8 : 0.1) * Math.sin(Math.PI * u)).toFixed(2) }, g); } });
    // unit outer side + top rim + cut edges
    I.face(g, [[310, -60, 68], [310, 70, 68], [310, 70, 196], [310, -60, 196]], "iso-unit-x"); for (var gz = 80; gz < 190; gz += 8) I.line(g, [[310, -50, gz], [310, 60, gz]], "iso-slat");
    I.line(g, [[170, 70, 196], [310, 70, 196], [310, -60, 196]], "iso-frame"); I.line(g, [[170, 70, 68], [170, 70, 196]], "iso-frame");
    return sp;
  }

  // ── camera: pan/zoom keyframes + a slow turn around the room ────
  var SH = [[0, [40, 0, 140], 0.95], [L(4), [40, 0, 150], 0.95], [L(5), [130, -110, 190], 1.35], [L(6), [65, -150, 255], 2.1], [L(7), [240, 10, 130], 2.0],
            [L(8), [280, 6, 115], 2.7], [L(9), [250, 0, 125], 2.1], [L(10), [40, 0, 150], 1.0], [L(11), [-28, -168, 205], 2.4], [L(12), [40, 0, 150], 1.05],
            [L(13), [282, 6, 112], 2.5], [L(14), [-160, 40, 150], 1.6], [L(15), [270, -20, 150], 1.8], [L(18), [40, 0, 150], 1.0], [L(19), [65, -150, 240], 1.7],
            [L(20), [40, 0, 150], 1.05], [L(21), [250, 0, 125], 1.7], [L(22), [40, 0, 150], 1.0], [L(24), [-60, -60, 160], 1.4], [L(25), [40, 0, 150], 1.0],
            [L(26), [40, 0, 150], 0.95], [L(27), [65, -150, 250], 1.5], [L(28), [40, 0, 150], 0.95]];
  function camAt(t) {
    var a = SH[0], b = SH[0];
    for (var i = 0; i < SH.length; i++) if (SH[i][0] <= t) { a = SH[i - 1] || SH[i]; b = SH[i]; }
    var k = easeIO((t - b[0]) / 1.0); if (t < b[0]) k = 0;
    // during a hold the camera keeps creeping in; the creep built up on the last shot eases out as the next move starts
    var hold = Math.max(0, t - b[0] - 1.0), prev = a === b ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.05 * Math.sin(t * 0.37)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k), lerp(a[1][2], b[1][2], k)], z: z };
  }
  function theta(t) { return -0.5 + 0.17 * Math.sin(t * 0.2) + 0.06 * Math.sin(t * 0.53 + 1.0); }  // the outside wall seen nearly edge-on, like the reference

  // labels + halos: [3D point, text, colour, from, fo, to, too, halo r]
  var LB = [[[130, -110, 230], "غاز التبريد بيلف هنا", "c-water", 5, 0.4, 6, 0], [[65, -150, 300], "الوحدة اللي جوه", "c-water", 6, 0.2, 7, 0, 64], [[240, 10, 220], "الوحدة اللي برة", "c-heat", 7, 0.2, 8, 0, 80],
            [[282, 6, 170], "الكمبروسر", "c-part", 8, 0.3, 10, 0, 30], [[-28, -168, 265], "", "c-water", 11, 0, 13, 0], [[-205, 70, 200], "النور بيرعش!", "c-heat", 14, 0.5, 15, 0, 40],
            [[281, -40, 200], "البوردة", "c-part", 15, 0.4, 16, 0, 26]];
  window.__room = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var th = theta(t), c = camAt(t), I = makeIso(th, 0.62, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (244 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var sp = drawScene(g, I, t);
    LB.forEach(function (b) {
      var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return;
      var p = I.P(b[0][0], b[0][1], b[0][2]), f = I.el("g", { style: "opacity:" + o.toFixed(2) }, g);
      if (b[7]) { var hp = I.P(b[0][0], b[0][1], b[0][2] - b[7] * 0.9); I.el("ellipse", { cx: hp[0].toFixed(1), cy: hp[1].toFixed(1), rx: (b[7] * I.K * 1.05).toFixed(1), ry: (b[7] * I.K * 0.62).toFixed(1), "class": "iso-halo", style: "stroke-width:" + (2.6 / c.z).toFixed(2) + ";opacity:" + (0.6 + 0.4 * Math.sin(t * 5)).toFixed(2) }, f); }
      var fs = 13 / c.z, txt = b[1] || (Math.round(roomT(t)) + "°");
      var tx = I.el("text", { x: p[0].toFixed(1), y: p[1].toFixed(1), "text-anchor": "middle", "class": b[1] ? "iso-label " + b[2] : "bignum blue", style: b[1] ? "font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" : "font-size:" + (30 / c.z).toFixed(1) + "px;stroke-width:" + (7 / c.z).toFixed(1) + "px" }, f);
      tx.textContent = txt;
    });
    // ×4 inrush and the spark at the compressor (13)
    var o13 = win(t, L(13) + 1.0, L(14) + 0.2); if (o13 > 0) { var cp = I.P(282, 6, 200); var tt = I.el("text", { x: cp[0].toFixed(1), y: cp[1].toFixed(1), "text-anchor": "middle", "class": "bignum red", style: "opacity:" + o13 + ";font-size:" + (30 / c.z).toFixed(1) + "px;stroke-width:" + (7 / c.z).toFixed(1) + "px" }, g); tt.textContent = "×4"; }
    return sp;
  };
  window.__roomStatic = function (svg, t, K, ox, oy) {   // intro + outro: a small view that keeps turning
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var I = makeIso(theta(t) + 0.09 * Math.sin(t * 0.85), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g);
    drawScene(g, I, t, { flows: true }); return I;
  };
  window.__speed = speed; window.__makeIso = makeIso; window.__phase = phase;
})();
