/* «صوتك بيروح فين؟» — the paper/isometric version: a slice of a city redrawn every frame.
   Two buildings far apart (Ahmed on the left, mum on the right), a tower on each side, and the street cut open
   to show the fibre cable underneath. "Your voice" is one orange token that changes form along its trip:
   air → (phone) → radio rings → down the mast → light pulses in the cable → up the mast → radio → air.
   The view turns slowly and the camera follows the token, so the frame never sits still.
   x: left (−320) → right (+320), y: back (−220) → front (+220), z: up. */
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
    function depth(x, y) { return (x * c - y * s) + (x * s + y * c); }
    function d(list, close) { return "M" + list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + (close === false ? "" : " Z"); }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function face(g, list, cls, st) { var a = { d: d(list), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function line(g, list, cls, st) { var a = { d: d(list, false), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function box(g, x0, x1, y0, y1, z0, z1, k) {
      k = k || {}; var fy = (c - s) > 0 ? y1 : y0, fx = (c + s) > 0 ? x1 : x0;
      face(g, [[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], k.y || "iso-y");
      face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], k.x || "iso-x");
      if (k.hatch) face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], "tz-pat-hatch", "opacity:.45");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top");
    }
    function ring(cx, cy, cz, r, n, plane, a0, a1) { var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); } return out; }
    function disc(g, cx, cy, cz, r, plane, cls, st) { return face(g, ring(cx, cy, cz, r, 30, plane), cls, st); }
    var A0 = -Math.PI / 4 - theta;
    function cyl(g, cx, cy, r, z0, z1, side, top) { var front = ring(cx, cy, z1, r, 18, "z", A0, A0 + Math.PI), back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; }); face(g, front.concat(back), side || "iso-steel"); return face(g, ring(cx, cy, z1, r, 28, "z"), top || "iso-top"); }
    return { P: P, depth: depth, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, cyl: cyl, K: K };
  }

  // ── the city ────────────────────────────────────────────
  var BA = [-300, -170, 60, 130, 150], BA2 = [-150, -60, -200, -110, 110], BB = [170, 300, 60, 130, 130], BB2 = [60, 150, -200, -110, 100];
  var TA = [-105, -155, 110, 215], TB = [105, -155, 100, 205], TC = [285, -60, 0, 150];          // towers: x, y, base z, top z
  var AH = [-235, 168], MU = [235, 168];                                                        // Ahmed, mum
  var CAB = [[TA[0], TA[1], TA[2]], [TA[0], TA[1], -40], [TA[0], 0, -40], [TB[0], 0, -40], [TB[0], TB[1], -40], [TB[0], TB[1], TB[2]]];
  function track(pts) { var seg = [], tot = 0; for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); seg.push(l); tot += l; }
    return function (u) { u = clamp(u); var dl = u * tot; for (var i = 0; i < seg.length; i++) { if (dl <= seg[i] || i === seg.length - 1) { var k = seg[i] ? dl / seg[i] : 0, a = pts[i], b = pts[i + 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; } dl -= seg[i]; } }; }
  var cable = track(CAB);
  var phA = [AH[0] + 7, AH[1], 31], phB = [MU[0] - 7, MU[1], 31], topA = [TA[0], TA[1], TA[3] - 8], topB = [TB[0], TB[1], TB[3] - 8];
  function car(t) { var u = clamp((t - L(23)) / (L(25) - L(23))); return [lerp(-260, 250, easeIO(u)), -50, 0]; }

  // where the voice token is and what it looks like: {p:[x,y,z], form}
  function voice(t) {
    var T0, a, b, k;
    if (t < L(4)) {                                           // the hook: the whole trip, fast
      var u = clamp((t - 0.6) / (L(3) - 1.2)), legs = [[0, 0.12, "air"], [0.12, 0.3, "radio"], [0.3, 0.75, "light"], [0.75, 0.9, "radio"], [0.9, 1.0, "air"]];
      if (u < 0.12) return { p: [lerp(AH[0], phA[0], u / 0.12), AH[1], 31], form: "air" };
      if (u < 0.3) { k = (u - 0.12) / 0.18; return { p: [lerp(phA[0], topA[0], k), lerp(phA[1], topA[1], k), lerp(phA[2], topA[2], k)], form: "radio" }; }
      if (u < 0.75) return { p: cable((u - 0.3) / 0.45), form: "light" };
      if (u < 0.9) { k = (u - 0.75) / 0.15; return { p: [lerp(topB[0], phB[0], k), lerp(topB[1], phB[1], k), lerp(topB[2], phB[2], k)], form: "radio" }; }
      return { p: [lerp(phB[0], MU[0], (u - 0.9) / 0.1), MU[1], 31], form: "air" };
    }
    if (t < L(5)) return { p: [lerp(AH[0] + 2, phA[0], easeIO((t - L(4)) / (L(5) - L(4)))), AH[1], 31], form: "air" };
    if (t < L(10)) return { p: phA, form: "inside" };
    if (t < L(13)) return { p: phA, form: "radio" };
    if (t < L(15)) { k = easeIO((t - L(13)) / (L(14) - L(13))); return { p: [lerp(phA[0], topA[0], k), lerp(phA[1], topA[1], k), lerp(phA[2], topA[2], k)], form: "radio" }; }
    if (t < L(17)) return { p: cable(0.55 * easeIO((t - L(15)) / (L(17) - L(15)))), form: "light" };
    if (t < L(19)) return { p: cable(0.55 + 0.05 * ((t - L(17)) / (L(19) - L(17)))), form: "light" };
    if (t < L(20)) { k = (t - L(19)) / (L(20) - L(19)); if (k < 0.6) return { p: cable(0.6 + 0.4 * easeIO(k / 0.6)), form: "light" }; k = easeIO((k - 0.6) / 0.4); return { p: [lerp(topB[0], phB[0], k), lerp(topB[1], phB[1], k), lerp(topB[2], phB[2], k)], form: "radio" }; }
    if (t < L(22)) return { p: phB, form: "inside" };
    if (t < L(23)) return { p: [lerp(phB[0], MU[0] + 2, easeIO((t - L(22)) / 1.2)), MU[1], 31], form: "air" };
    return { p: null, form: "none" };
  }

  // ── drawing ─────────────────────────────────────────────
  function person(g, I, x, y, t, scarf, shirt, mood, talk) {
    var bob = Math.sin(t * 2.4 + x) * 0.8;
    I.cyl(g, x, y, 7, 0, 22 + bob, shirt, shirt + "-top");
    if (scarf) I.cyl(g, x, y, 7.6, 22 + bob, 33 + bob, scarf, scarf);
    var h = I.P(x, y, 30 + bob), r = 6.5 * I.K;
    I.el("circle", { cx: f1(h[0]), cy: f1(h[1]), r: f1(r), "class": "pc-head" }, g);
    var blink = ((t * 0.55 + x * 0.01) % 1) < 0.05, ew = r * 0.28;
    if (mood === "happy") I.el("path", { d: "M" + f1(h[0] - ew * 1.6) + " " + f1(h[1]) + " q" + f1(ew * 0.7) + " " + f1(-ew) + " " + f1(ew * 1.3) + " 0 M" + f1(h[0] + ew * 0.3) + " " + f1(h[1]) + " q" + f1(ew * 0.7) + " " + f1(-ew) + " " + f1(ew * 1.3) + " 0", "class": "pc-eye" }, g);
    else if (!blink) I.el("path", { d: "M" + f1(h[0] - ew) + " " + f1(h[1] - ew) + " v" + f1(ew * 1.6) + " M" + f1(h[0] + ew) + " " + f1(h[1] - ew) + " v" + f1(ew * 1.6), "class": "pc-eye" }, g);
    if (talk) { var m = 0.4 + 0.6 * Math.abs(Math.sin(t * 11)); I.el("ellipse", { cx: f1(h[0]), cy: f1(h[1] + r * 0.45), rx: f1(r * 0.22), ry: f1(r * 0.18 * m + 0.4), "class": "pc-mouth" }, g); }
  }
  function phoneAt(g, I, p, side) { I.box(g, p[0] - 1.2, p[0] + 1.2, p[1] - 2.5, p[1] + 2.5, p[2] - 5, p[2] + 5, { z: "pc-phone-top", x: "pc-phone", y: "pc-phone" }); }
  function building(g, I, b, lit, t, seed) {
    I.box(g, b[0], b[1], b[2], b[3], 0, b[4], { z: "pc-roof", x: "pc-bld-x", y: "pc-bld" });
    for (var fz = 18; fz < b[4] - 10; fz += 24) for (var wx = b[0] + 10; wx < b[1] - 12; wx += 22) {
      var on = ((Math.sin(wx * 3.1 + fz * 1.7 + seed) + 1) * 0.5 + Math.floor(t * 0.4 + wx) % 3 * 0.1) > 0.55;
      I.face(g, [[wx, b[3] + 0.5, fz], [wx + 12, b[3] + 0.5, fz], [wx + 12, b[3] + 0.5, fz + 14], [wx, b[3] + 0.5, fz + 14]], on ? "pc-win-on" : "pc-win");
    }
    if (lit) I.face(g, [[lit[0], b[3] + 0.6, 4], [lit[0] + 30, b[3] + 0.6, 4], [lit[0] + 30, b[3] + 0.6, 30], [lit[0], b[3] + 0.6, 30]], "pc-door");
  }
  function towerDraw(g, I, T, t, active) {
    var x = T[0], y = T[1];
    I.line(g, [[x - 8, y - 8, T[2]], [x, y, T[3]], [x + 8, y + 8, T[2]]], "pc-mast"); I.line(g, [[x - 8, y + 8, T[2]], [x, y, T[3]], [x + 8, y - 8, T[2]]], "pc-mast");
    for (var zz = T[2] + 20; zz < T[3] - 10; zz += 22) { var k = (T[3] - zz) / (T[3] - T[2]) * 8; I.line(g, [[x - k, y - k, zz], [x + k, y + k, zz]], "pc-mast-thin"); }
    [[-6, 0], [4, -5], [3, 6]].forEach(function (o) { I.box(g, x + o[0] - 2, x + o[0] + 2, y + o[1] - 2, y + o[1] + 2, T[3] - 26, T[3] - 8, { z: "pc-panel-top", x: "pc-panel", y: "pc-panel" }); });
    var lp = I.P(x, y, T[3] + 2); I.el("circle", { cx: f1(lp[0]), cy: f1(lp[1]), r: f1(2.4 * I.K / 0.6), "class": Math.sin(t * 4 + x) > 0 ? "pc-beacon-on" : "pc-beacon" }, g);
    if (active) for (var w = 0; w < 3; w++) { var u = ((t * 1.1 + w / 3) % 1); I.face(g, I.ring(x, y, T[3] - 16, 8 + u * 60, 26, "z"), "pc-ring", "opacity:" + (0.9 * (1 - u)).toFixed(2)); }
  }
  // the voice token
  function drawVoice(g, I, v, t) {
    if (!v.p) return; var q = I.P(v.p[0], v.p[1], v.p[2]), K = I.K / 0.6;
    if (v.form === "air") { for (var k = 0; k < 4; k++) { var u = ((t * 1.6 + k / 4) % 1); I.el("path", { d: "M" + f1(q[0] - 2 * K) + " " + f1(q[1] - (5 + u * 8) * K) + " q" + f1(5 * K) + " " + f1((5 + u * 8) * K) + " 0 " + f1((10 + u * 16) * K), "class": "pc-voice-air", style: "opacity:" + (1 - u).toFixed(2) + ";transform:translateX(" + f1(u * 10 * K) + "px)" }, g); } return; }
    if (v.form === "radio") { for (var r = 0; r < 4; r++) { var w = ((t * 1.4 + r / 4) % 1); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1((3 + w * 16) * K), "class": "pc-voice-radio", style: "opacity:" + (1 - w).toFixed(2) }, g); } }
    if (v.form === "light") { I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(9 * K), "class": "pc-voice-glow" }, g); }
    if (v.form === "inside") { I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1((5 + 2 * Math.sin(t * 8)) * K), "class": "pc-voice-glow" }, g); }
    I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(3.4 * K), "class": "pc-voice" }, g);
  }

  function drawWorld(g, I, t, o) {
    o = o || {}; var v = voice(t), cpos = car(t);
    // ground with the street cut open down the middle (the cable runs in the trench)
    I.box(g, -320, 320, -220, -16, -70, 0, { z: "pc-ground", x: "iso-cut", y: "iso-cut", hatch: true });
    I.box(g, -320, 320, -16, 16, -70, -46, { z: "pc-soil", x: "iso-cut", y: "iso-cut" });
    I.face(g, [[-320, -16, -46], [320, -16, -46], [320, -16, 0], [-320, -16, 0]], "pc-soil-wall");
    I.box(g, -320, 320, -5, 5, -46, -36, { z: "pc-cable-top", x: "pc-cable", y: "pc-cable" });
    // light pulses in the cable (more of them while the voice is inside it)
    var busy = t > L(15) - 0.3 && t < L(20) ? 1 : 0.35;
    for (var k = 0; k < 14; k++) { var u = ((t * 0.35 + k / 14) % 1), px = lerp(-320, 320, u), pq = I.P(px, 0, -35); I.el("circle", { cx: f1(pq[0]), cy: f1(pq[1]), r: f1(2.2 * I.K / 0.6), "class": "pc-pulse", style: "opacity:" + (busy * (0.5 + 0.5 * Math.sin(k * 5 + t * 20))).toFixed(2) }, g); }
    I.box(g, -320, 320, 16, 220, -70, 0, { z: "pc-ground", x: "iso-cut", y: "iso-cut", hatch: true });
    // street + sidewalk on the back half, dashes rolling under the car
    I.face(g, [[-320, -78, 0.4], [320, -78, 0.4], [320, -22, 0.4], [-320, -22, 0.4]], "pc-road");
    for (var dx = -300; dx < 320; dx += 40) I.face(g, [[dx, -51, 0.6], [dx + 18, -51, 0.6], [dx + 18, -49, 0.6], [dx, -49, 0.6]], "pc-dash");
    for (var tr = -300; tr < 320; tr += 60) { I.cyl(g, tr, 36, 4, 0, 22, "pc-trunk", "pc-trunk"); I.disc(g, tr, 36, 30, 12, "z", "iso-leaf"); }
    // the hidden cable route up the masts and through the ground, shown as a glowing dashed line
    if (o.xray !== false && t > L(15) - 0.5 && t < L(21)) I.line(g, CAB, "pc-xray", "stroke-dashoffset:" + f1(-t * 30));
    // buildings, towers, people, car — back to front
    var items = [];
    function add(cx, cy, fn) { items.push([I.depth(cx, cy), fn]); }
    add((BA2[0] + BA2[1]) / 2, (BA2[2] + BA2[3]) / 2, function () { building(g, I, BA2, null, t, 2); towerDraw(g, I, TA, t, v.form === "radio" && t > L(13) - 0.2 && t < L(15)); });
    add((BB2[0] + BB2[1]) / 2, (BB2[2] + BB2[3]) / 2, function () { building(g, I, BB2, null, t, 5); towerDraw(g, I, TB, t, (t > L(17) && t < L(20)) || (t < L(4) && t > L(2))); });
    add(TC[0], TC[1], function () { towerDraw(g, I, TC, t, t > L(24) + 0.6 && t < L(25)); });
    add((BA[0] + BA[1]) / 2, (BA[2] + BA[3]) / 2, function () { building(g, I, BA, [-250], t, 1); });
    add((BB[0] + BB[1]) / 2, (BB[2] + BB[3]) / 2, function () { building(g, I, BB, [220], t, 7); });
    add(AH[0], AH[1], function () { person(g, I, AH[0], AH[1], t, null, "pc-shirt-a", t > L(25) ? "happy" : "n", t < L(5) || (t > L(0) && t < L(3))); phoneAt(g, I, phA); });
    add(MU[0], MU[1], function () { person(g, I, MU[0], MU[1], t, "pc-scarf", "pc-shirt-m", t > L(22) ? "happy" : "n", false); phoneAt(g, I, phB); });
    if (t > L(23) - 0.3 && t < L(25) + 0.3) add(cpos[0], cpos[1], function () { var x = cpos[0], y = cpos[1]; I.box(g, x - 22, x + 22, y - 10, y + 10, 4, 16, { z: "pc-car-top", x: "pc-car-x", y: "pc-car" }); I.box(g, x - 12, x + 10, y - 9, y + 9, 16, 26, { z: "pc-glass", x: "pc-glass", y: "pc-glass" }); });
    items.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (it) { it[1](); });

    // ── what the network does ──
    // the air path the voice does NOT take, crossed out
    var no = win(t, L(14) + 0.2, L(15) + 0.2);
    if (no > 0) { var arc = []; for (var a2 = 0; a2 <= 20; a2++) { var kk = a2 / 20; arc.push([lerp(topA[0], phB[0], kk), lerp(topA[1], phB[1], kk), lerp(topA[2], phB[2], kk) + Math.sin(Math.PI * kk) * 90]); } I.line(g, arc, "pc-nope", "opacity:" + no.toFixed(2)); var mid = I.P(arc[10][0], arc[10][1], arc[10][2]), s = 14 * I.K / 0.6; I.el("path", { d: "M" + f1(mid[0] - s) + " " + f1(mid[1] - s) + " L" + f1(mid[0] + s) + " " + f1(mid[1] + s) + " M" + f1(mid[0] + s) + " " + f1(mid[1] - s) + " L" + f1(mid[0] - s) + " " + f1(mid[1] + s), "class": "pc-x", style: "opacity:" + no.toFixed(2) }, g); }
    // the network searching: rings sweep out from every tower
    var srch = win(t, L(17), L(18) + 0.3);
    if (srch > 0) [TA, TB, TC].forEach(function (T, i) { var u = ((t * 0.7 + i / 3) % 1); I.face(g, I.ring(T[0], T[1], 1, 20 + u * 200, 40, "z"), "pc-search", "opacity:" + (srch * (1 - u)).toFixed(2)); });
    // mum's phone saying "I'm here" every so often
    var here = win(t, L(18), L(19) + 0.2);
    if (here > 0) { var hu = ((t - L(18)) * 0.9) % 1; for (var hh = 0; hh < 12; hh++) { var kk2 = (hu + hh * 0.02) % 1, pp = [lerp(phB[0], topB[0], kk2), lerp(phB[1], topB[1], kk2), lerp(phB[2], topB[2], kk2)], qq = I.P(pp[0], pp[1], pp[2]); if (hh === 0) I.el("circle", { cx: f1(qq[0]), cy: f1(qq[1]), r: f1(3.6 * I.K / 0.6), "class": "pc-ping", style: "opacity:" + here.toFixed(2) }, g); } }
    // handover: the car's link jumps from tower A to tower C
    if (t > L(23) && t < L(25) + 0.2) { var useC = t > L(24) + 0.6, T = useC ? TC : TA, cq = [cpos[0], cpos[1], 22]; I.line(g, [cq, [T[0], T[1], T[3] - 16]], "pc-link", "stroke-dashoffset:" + f1(-t * 40) + ";opacity:" + (useC ? 1 : clamp(1 - (t - L(24)) * 0.8)).toFixed(2)); }
    drawVoice(g, I, v, t);
    return v;
  }

  // ── camera: [time, target ("V" = the voice token), zoom] ──
  var SH = [[L(4), "V", 4.4], [L(5), [AH[0], AH[1], 26], 4.8], [L(10), [AH[0], AH[1], 30], 3.4], [L(11), [AH[0] + 20, AH[1] - 20, 60], 1.6], [L(13), "V", 1.5], [L(14), [0, -60, 120], 0.95],
            [L(15), "V", 1.8], [L(16), "V", 2.4], [L(17), [0, -40, 60], 0.85], [L(18), [MU[0], MU[1] - 60, 60], 1.5], [L(19), "V", 1.6], [L(20), [MU[0], MU[1], 28], 4.2],
            [L(22), [MU[0], MU[1], 26], 4.6], [L(23), "C", 1.6], [L(24) + 0.4, "C", 1.2], [L(25), [0, 0, 40], 0.9], [L(26), [0, 0, 40], 0.85]];
  function tgt(v, t) { if (v === "V") { var p = voice(t).p || [0, 0, 0]; return p; } if (v === "C") { var c = car(t); return [c[0], c[1], 20]; } return v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 9 * Math.sin(t * 0.8), lerp(pa[1], pb[1], k) + 9 * Math.cos(t * 0.8), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return 0.06 + 0.24 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.63 + 1.0); }

  var LB = [[[AH[0] + 12, AH[1], 46], "أحمد", "c-water", 4, 0, 6, 0], [[TA[0], TA[1], TA[3] + 22], "أقرب برج", "c-heat", 13, 0.4, 15, 0], [[0, 0, -10], "كابل ألياف تحت الأرض", "c-heat", 15, 0.6, 17, 0],
            [[MU[0] - 10, MU[1], 50], "ماما", "c-water", 18, 0, 20, 0], [[MU[0], MU[1], 62], "أنا هنا!", "c-heat", 18, 0.5, 19, 0.2], [[TB[0], TB[1], TB[3] + 22], "برج ماما", "c-heat", 19, 0.2, 20, 0.4],
            [[TC[0], TC[1], TC[3] + 22], "البرج اللي بعده", "c-heat", 24, 0.4, 25, 0]];
  window.__city = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), I = makeIso(theta(t), 0.6, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (230 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    drawWorld(g, I, t);
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var p = I.P(b[0][0], b[0][1], b[0][2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
  };
  window.__cityStatic = function (svg, t, K, ox, oy, extra) { while (svg.firstChild) svg.removeChild(svg.firstChild); var I = makeIso(theta(t) + (extra || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g); drawWorld(g, I, t); return I; };
  window.__voice = voice;
})();
