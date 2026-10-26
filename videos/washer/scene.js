/* «إزاي الغسالة بتشتغل؟» — clean technical-diagram style (reference: the washing-machine video).
   Full-bleed paper, a 3/4 view of the machine in the bathroom at the start and end, and a front cross-section
   in the middle: drum with holes and paddles, clothes that really tumble, springs, dampers, concrete weight,
   motor + belt, heater, inlet and drain. Everything is redrawn each frame as a pure function of time. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, t) { return easeIO((t - a) / (b - a)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.35; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function el(tag, attrs, parent, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; parent.appendChild(e); return e; }
  function f1(x) { return x.toFixed(1); }
  var AR = "٠١٢٣٤٥٦٧٨٩"; function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; }); }

  // ── drum motion: angular speed by phase, integrated so clothes and holes stay continuous ──
  function omega(t) {
    if (t < L(4)) return 1.2;
    if (t < L(16) + 0.4) return 1.25;                                   // wash tumble
    if (t < L(20)) return lerp(1.25, 26, smooth(L(16) + 0.4, L(17) + 1.6, t));   // spin up
    if (t < L(27)) return 7;                                            // unbalanced spinning, shaking
    if (t < L(28)) return 1.0;                                          // slow distribute
    return lerp(1.0, 18, smooth(L(28), L(29), t));
  }
  var TH = [], DT = 0.02; (function () { var a = 0; for (var i = 0; i * DT < 200; i++) { TH.push(a); a += omega(i * DT) * DT; } })();
  function drumA(t) { var i = Math.max(0, Math.min(TH.length - 2, Math.floor(t / DT))); return lerp(TH[i], TH[i + 1], (t - i * DT) / DT); }
  function mode(t) {
    if (t < L(16) + 1.0) return "tumble";
    if (t < L(20)) return "spin";
    if (t < L(27)) return "clump";
    if (t < L(28)) return "spread";
    return "spin";
  }
  function shake(t) {                                                    // tub offset when unbalanced
    var a = 0;
    if (t > L(20) && t < L(27)) a = 7 * smooth(L(20), L(21), t) * (1 - 0.35 * smooth(L(24), L(24) + 1, t) - 0.3 * smooth(L(25), L(25) + 1, t) - 0.25 * smooth(L(26), L(26) + 1, t));
    var th = drumA(t); return [a * Math.sin(th), a * 0.6 * Math.cos(th)];
  }
  function water(t) {
    var w = smooth(L(4) + 1.0, L(6), t) * 0.38;
    w *= 1 - smooth(L(14) + 0.3, L(15), t);
    w += smooth(L(15) + 0.2, L(15) + 1.4, t) * 0.3 * (1 - smooth(L(16), L(16) + 0.9, t));
    return w;
  }

  // garments: colour, size, phase
  var CL = [["#8b5a3c", 15, 0.0], ["#a8704a", 12, 0.18], ["#c99a6a", 13, 0.37], ["#7a4a30", 11, 0.55], ["#b98058", 14, 0.71], ["#9a6440", 10, 0.86], ["#d3a77a", 9, 0.44]];
  function garment(t, i, cx, cy, R) {
    var m = mode(t), th = drumA(t), c = CL[i];
    var pinned = function (base) { var a = base + th; return [cx + Math.cos(a) * (R - c[1] * 0.6), cy + Math.sin(a) * (R - c[1] * 0.6), a]; };
    if (m === "spin") return pinned(c[2] * Math.PI * 2);
    if (m === "clump") return pinned(1.2 + c[2] * 0.9);
    if (m === "spread") { var k = smooth(L(27), L(28) - 0.3, t); return pinned(lerp(1.2 + c[2] * 0.9, c[2] * Math.PI * 2, k)); }
    // tumble: ride up the wall with a paddle, let go near the top, fall back into the water
    var u = ((th * 0.16 + c[2]) % 1 + 1) % 1, aStart = Math.PI / 2 + 0.5, aRel = -0.25;   // SVG angles (y down): bottom = π/2
    if (u < 0.7) { var a = lerp(aStart, aRel, u / 0.7), r = R - c[1] * 0.6; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, a]; }
    var k2 = (u - 0.7) / 0.3, p0 = [cx + Math.cos(aRel) * (R - 12), cy + Math.sin(aRel) * (R - 12)], p1 = [cx + Math.cos(aStart) * (R - 14), cy + Math.sin(aStart) * (R - 14)];
    return [lerp(p0[0], p1[0], k2), lerp(p0[1], p1[1], k2) - Math.sin(k2 * Math.PI) * 10 + 40 * k2 * k2 * 0, k2 * 6];
  }

  // ── the cross-section ─────────────────────────────────────────
  function spring(g, x0, y0, x1, y1, n) {
    var pts = [], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    for (var i = 0; i <= n; i++) { var k = i / n, w = i === 0 || i === n ? 0 : (i % 2 ? 5 : -5); pts.push(f1(x0 + dx * k + nx * w) + " " + f1(y0 + dy * k + ny * w)); }
    el("path", { d: "M" + pts.join(" L"), "class": "w-spring" }, g);
  }
  function damper(g, x0, y0, x1, y1) {
    var mx = lerp(x0, x1, 0.5), my = lerp(y0, y1, 0.5);
    el("line", { x1: f1(x0), y1: f1(y0), x2: f1(mx), y2: f1(my), "class": "w-damper" }, g);
    el("line", { x1: f1(lerp(x0, x1, 0.38)), y1: f1(lerp(y0, y1, 0.38)), x2: f1(x1), y2: f1(y1), "class": "w-rod" }, g);
    el("circle", { cx: f1(x0), cy: f1(y0), r: 3, "class": "w-pin" }, g); el("circle", { cx: f1(x1), cy: f1(y1), r: 3, "class": "w-pin" }, g);
  }
  function section(g, t) {
    var s = shake(t), cx = 180 + s[0], cy = 318 + s[1], RO = 100, R = 87, th = drumA(t), m = mode(t), sp = omega(t);
    // cabinet
    el("rect", { x: 66, y: 148, width: 228, height: 336, rx: 4, "class": "w-cab" }, g);
    el("rect", { x: 66, y: 148, width: 228, height: 12, "class": "w-cab-top" }, g);
    el("rect", { x: 82, y: 484, width: 20, height: 6, "class": "w-foot" }, g); el("rect", { x: 258, y: 484, width: 20, height: 6, "class": "w-foot" }, g);
    // inlet: tap → valve → detergent drawer → tub
    el("path", { d: "M40 130 H84 V166", "class": "w-hose" }, g); el("rect", { x: 78, y: 160, width: 14, height: 12, "class": "w-valve" }, g);
    el("rect", { x: 96, y: 162, width: 46, height: 22, rx: 2, "class": "w-drawer" }, g);
    el("path", { d: "M120 184 Q122 206 " + f1(cx - 40) + " " + f1(cy - 88), "class": "w-hose-thin" }, g);
    // springs (top) and dampers (bottom) follow the tub
    spring(g, 92, 162, cx - 64, cy - 74, 12); spring(g, 268, 162, cx + 64, cy - 74, 12);
    damper(g, 112, 476, cx - 46, cy + 86); damper(g, 248, 476, cx + 46, cy + 86);
    // drain pump + hose
    el("circle", { cx: 104, cy: 456, r: 11, "class": "w-pump" }, g);
    var pa = (t * (t > L(14) && t < L(15) + 0.4 ? 14 : 0)); el("path", { d: "M" + f1(104 + Math.cos(pa) * 8) + " " + f1(456 + Math.sin(pa) * 8) + " L" + f1(104 - Math.cos(pa) * 8) + " " + f1(456 - Math.sin(pa) * 8), "class": "w-blade" }, g);
    el("path", { d: "M93 456 H58 V500", "class": "w-hose" }, g);
    // motor + belt to the big pulley behind the drum
    var mxp = 232, myp = 456; el("circle", { cx: mxp, cy: myp, r: 17, "class": "w-motor" }, g);
    var bp = el("g", { transform: "rotate(" + f1(th * 57.3 * 4) + " " + mxp + " " + myp + ")" }, g); el("circle", { cx: mxp, cy: myp, r: 8, "class": "w-pulley" }, bp); el("line", { x1: mxp - 7, y1: myp, x2: mxp + 7, y2: myp, "class": "w-spoke" }, bp);
    el("path", { d: "M" + f1(cx - 58) + " " + f1(cy + 18) + " L" + (mxp - 8) + " " + myp + " M" + f1(cx + 20) + " " + f1(cy + 56) + " L" + (mxp + 8) + " " + myp, "class": "w-belt" }, g);
    // outer tub, water, heater
    el("circle", { cx: f1(cx), cy: f1(cy), r: RO, "class": "w-tub" }, g);
    var wl = water(t); if (wl > 0.01) {
      var yW = cy + RO - wl * 2 * RO, hw = Math.sqrt(Math.max(0, RO * RO - Math.pow(yW - cy, 2))) - 2, wav = 2.5 * Math.sin(t * 4);
      el("path", { d: "M" + f1(cx - hw) + " " + f1(yW) + " Q" + f1(cx) + " " + f1(yW + wav) + " " + f1(cx + hw) + " " + f1(yW) + " A" + (RO - 2) + " " + (RO - 2) + " 0 0 1 " + f1(cx - hw) + " " + f1(yW) + " Z", "class": "w-water" }, g);
    }
    var hot = win(t, L(13) + 0.3, L(14) + 0.2);
    el("path", { d: "M" + f1(cx - 30) + " " + f1(cy + 92) + " l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6", "class": "w-heater", style: "stroke:" + (hot ? "#d8452a" : "#9a8f80") }, g);
    if (hot) el("path", { d: "M" + f1(cx - 30) + " " + f1(cy + 92) + " l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6", "class": "w-heater-glow", style: "opacity:" + (0.5 * hot * (0.7 + 0.3 * Math.sin(t * 9))).toFixed(2) }, g);
    // concrete weights on the tub
    el("rect", { x: f1(cx - 42), y: f1(cy - RO - 20), width: 84, height: 22, rx: 2, "class": "w-concrete" }, g);
    el("rect", { x: f1(cx - 42), y: f1(cy - RO - 20), width: 84, height: 22, rx: 2, "class": "w-concrete-dots" }, g);
    el("rect", { x: f1(cx - 30), y: f1(cy + RO - 6), width: 60, height: 12, rx: 2, "class": "w-concrete" }, g);
    // the inner drum: holes and paddles turn with it
    el("circle", { cx: f1(cx), cy: f1(cy), r: R, "class": "w-drum" }, g);
    el("circle", { cx: f1(cx), cy: f1(cy), r: R - 30, "class": "w-pulley-ghost" }, g);
    var holes = []; for (var ring = 0; ring < 4; ring++) { var rr = 22 + ring * 18, nn = 6 + ring * 7; for (var h = 0; h < nn; h++) { var a = th + h / nn * Math.PI * 2 + ring * 0.3; holes.push("M" + f1(cx + Math.cos(a) * rr) + " " + f1(cy + Math.sin(a) * rr) + "h0.01"); } }
    el("path", { d: holes.join(""), "class": "w-holes" }, g);
    if (sp > 12) el("circle", { cx: f1(cx), cy: f1(cy), r: R - 8, "class": "w-blur" }, g);
    for (var p = 0; p < 3; p++) { var pa2 = th + p * Math.PI * 2 / 3, x1 = cx + Math.cos(pa2 - 0.12) * R, y1 = cy + Math.sin(pa2 - 0.12) * R, x2 = cx + Math.cos(pa2 + 0.12) * R, y2 = cy + Math.sin(pa2 + 0.12) * R, x3 = cx + Math.cos(pa2) * (R - 16), y3 = cy + Math.sin(pa2) * (R - 16);
      el("path", { d: "M" + f1(x1) + " " + f1(y1) + " L" + f1(x3) + " " + f1(y3) + " L" + f1(x2) + " " + f1(y2) + " Z", "class": "w-paddle" }, g); }
    el("circle", { cx: f1(cx), cy: f1(cy), r: 9, "class": "w-hub" }, g);
    // clothes
    CL.forEach(function (c, i) {
      var q = garment(t, i, cx, cy, R), rot = q[2] * 57.3;
      var gg = el("g", { transform: "translate(" + f1(q[0]) + " " + f1(q[1]) + ") rotate(" + f1(rot) + ")" }, g);
      el("path", { d: "M" + (-c[1]) + " " + (-c[1] * 0.55) + " q" + c[1] * 0.4 + " " + (-c[1] * 0.5) + " " + c[1] * 1.1 + " " + (-c[1] * 0.1) + " q" + c[1] * 0.9 + " " + c[1] * 0.2 + " " + c[1] * 0.9 + " " + c[1] * 0.75 + " q" + (-c[1] * 0.3) + " " + c[1] * 0.6 + " " + (-c[1] * 1.2) + " " + c[1] * 0.45 + " q" + (-c[1] * 0.8) + " " + (-c[1] * 0.2) + " " + (-c[1] * 0.8) + " " + (-c[1] * 1.1) + " Z", fill: c[0], "class": "w-cloth" }, gg);
    });
    // water flung out through the holes during the spin (19)
    var fling = win(t, L(19), L(20) + 0.2);
    if (fling > 0) for (var d = 0; d < 26; d++) { var u = ((d * 0.37 + t * 1.6) % 1), a3 = d * 2.4 + th * 0.2, r3 = R + u * 40; el("circle", { cx: f1(cx + Math.cos(a3) * r3), cy: f1(cy + Math.sin(a3) * r3), r: 2.2, "class": "w-drop", style: "opacity:" + (fling * (1 - u)).toFixed(2) }, g); }
    // water in from the drawer (4–5, 15) and out of the drain (14)
    var inflow = win(t, L(4) + 0.8, L(6)) + win(t, L(15) + 0.1, L(16));
    if (inflow > 0) for (var w = 0; w < 8; w++) { var u2 = ((w / 8 + t * 0.9) % 1), px = lerp(lerp(40, 84, clamp(u2 * 3)), lerp(120, cx - 40, clamp((u2 - 0.5) * 2)), clamp((u2 - 0.33) * 3)), py = u2 < 0.33 ? 130 : lerp(170, cy - 88, clamp((u2 - 0.33) / 0.67));
      el("circle", { cx: f1(px), cy: f1(py), r: 2.4, "class": "w-drop", style: "opacity:" + inflow.toFixed(2) }, g); }
    var powder = win(t, L(5), L(6) + 0.3); if (powder > 0) for (var pw = 0; pw < 8; pw++) { var u3 = ((pw / 8 + t * 0.7) % 1); el("circle", { cx: f1(lerp(118, cx - 40, u3) + Math.sin(pw * 3) * 4), cy: f1(lerp(176, cy - 88, u3)), r: 1.8, "class": "w-powder", style: "opacity:" + powder.toFixed(2) }, g); }
    var outflow = win(t, L(14) + 0.3, L(15) + 0.4); if (outflow > 0) for (var o = 0; o < 9; o++) { var u4 = ((o / 9 + t * 0.8) % 1), ox = u4 < 0.4 ? lerp(cx - 40, 104, u4 / 0.4) : u4 < 0.7 ? lerp(104, 58, (u4 - 0.4) / 0.3) : 58, oy = u4 < 0.4 ? lerp(cy + 92, 456, u4 / 0.4) : u4 < 0.7 ? 456 : lerp(456, 500, (u4 - 0.7) / 0.3);
      el("circle", { cx: f1(ox), cy: f1(oy), r: 2.6, "class": "w-dirty", style: "opacity:" + outflow.toFixed(2) }, g); }
    // door lock icon (4)
    var lk = win(t, L(4) + 0.3, L(5)); if (lk > 0) { var lg = el("g", { style: "opacity:" + lk, transform: "translate(270 190)" }, g); el("rect", { x: -9, y: -2, width: 18, height: 14, rx: 2, "class": "w-lock" }, lg); el("path", { d: "M-5 -2 v-5 a5 5 0 0 1 10 0 v5", "class": "w-lock-arc" }, lg); }
    return { cx: cx, cy: cy };
  }

  // ── the machine in the bathroom (start + end) ───────────────
  function bathroom(g, t, walk) {
    var cvs = el("g", {}, g);
    for (var r = 0; r < 9; r++) for (var c = 0; c < 6; c++) el("rect", { x: 20 + c * 56, y: 60 + r * 36, width: 55, height: 35, "class": "b-tile" }, cvs);
    el("path", { d: "M20 384 H340 V600 H20 Z", "class": "b-floor" }, cvs);
    el("path", { d: "M20 60 V600", "class": "b-edge" }, cvs);
    el("rect", { x: 150, y: 118, width: 34, height: 34, rx: 4, "class": "b-socket" }, cvs); el("circle", { cx: 167, cy: 135, r: 8, "class": "b-plug" }, cvs);
    el("path", { d: "M228 130 h18 v14 M246 137 q12 0 12 14 v40", "class": "b-tap" }, cvs);
    var jx = walk ? Math.sin(t * 40) * 2.2 + walk * 10 : 0, jy = walk ? Math.abs(Math.sin(t * 33)) * -1.5 : 0;
    var m = el("g", { transform: "translate(" + f1(jx) + " " + f1(jy) + ")" }, g);
    el("path", { d: "M167 143 C170 190 130 200 120 228", "class": "b-cable" }, m);
    el("path", { d: "M268 210 L300 186 V380 L268 410 Z", "class": "m-side" }, m);
    el("path", { d: "M92 210 L124 186 H300 L268 210 Z", "class": "m-top" }, m);
    el("rect", { x: 92, y: 210, width: 176, height: 200, rx: 3, "class": "m-front" }, m);
    el("rect", { x: 92, y: 210, width: 176, height: 34, "class": "m-panel" }, m);
    el("rect", { x: 102, y: 218, width: 40, height: 12, rx: 2, "class": "m-drawer" }, m);
    el("circle", { cx: 162, cy: 227, r: 9, "class": "m-knob" }, m);
    el("rect", { x: 186, y: 219, width: 38, height: 16, rx: 2, "class": "m-display" }, m);
    var secs = Math.floor(t) % 60; el("text", { x: 205, y: 231, "text-anchor": "middle", "class": "m-digits" }, m, "٠:" + ar(String(secs).padStart(2, "0")));
    for (var b = 0; b < 3; b++) el("rect", { x: 232 + b * 11, y: 223, width: 8, height: 6, rx: 1, "class": "m-btn" }, m);
    var dcx = 180, dcy = 322;
    el("circle", { cx: dcx, cy: dcy, r: 64, "class": "m-door" }, m); el("circle", { cx: dcx, cy: dcy, r: 50, "class": "m-glass" }, m);
    var th = drumA(t), holes = [];
    for (var h = 0; h < 24; h++) { var a = th + h / 24 * Math.PI * 2, rr = 16 + (h % 3) * 11; holes.push("M" + f1(dcx + Math.cos(a) * rr) + " " + f1(dcy + Math.sin(a) * rr) + "h0.01"); }
    el("path", { d: holes.join(""), "class": "w-holes" }, m);
    [0, 2, 4].forEach(function (i) { var q = garment(t, i, dcx, dcy, 48); var c = CL[i]; el("ellipse", { cx: f1(q[0]), cy: f1(q[1]), rx: c[1] * 0.8, ry: c[1] * 0.5, fill: c[0], "class": "w-cloth", transform: "rotate(" + f1(q[2] * 57.3) + " " + f1(q[0]) + " " + f1(q[1]) + ")" }, m); });
    el("path", { d: "M244 312 v20", "class": "m-handle" }, m);
    el("path", { d: "M300 330 C330 340 330 420 310 440 H280", "class": "b-hose" }, m);
    el("rect", { x: 270, y: 436, width: 26, height: 8, "class": "b-drain" }, cvs);
    if (walk > 0) { el("path", { d: "M80 300 h-24 M84 330 h-30 M80 360 h-22", "class": "b-motion" }, g); }
  }

  // ── camera: smooth pan/zoom between views + a gentle drift so it never sits still ──
  var CAM = [[0, 180, 300, 0.95], [L(0) + 1.4, 175, 250, 1.25], [L(1), 180, 300, 0.95], [L(3) - 0.2, 180, 322, 1.4],
             [L(4), 180, 318, 0.92], [L(5), 140, 220, 1.4], [L(6), 180, 318, 0.95], [L(9), 200, 390, 1.35], [L(10), 180, 318, 1.2], [L(12), 180, 318, 1.05],
             [L(13), 180, 380, 1.4], [L(14), 130, 430, 1.35], [L(15), 180, 318, 0.92], [L(17), 180, 318, 1.15], [L(19), 180, 318, 0.95], [L(21), 180, 318, 1.05],
             [L(23), 180, 318, 0.9], [L(24), 150, 230, 1.3], [L(25), 160, 420, 1.3], [L(26), 180, 230, 1.3], [L(27), 180, 318, 1.05], [L(28), 180, 300, 0.95]];
  function cam(t) {
    var a = CAM[0], b = CAM[0];
    for (var i = 0; i < CAM.length; i++) if (CAM[i][0] <= t) { a = CAM[i - 1] || CAM[i]; b = CAM[i]; }
    var k = easeIO((t - b[0]) / 1.0); if (t < b[0]) k = 0;
    var z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k)) * (1 + 0.035 * Math.sin(t * 0.41));
    return [lerp(a[1], b[1], k) + 4 * Math.sin(t * 0.27), lerp(a[2], b[2], k) + 3 * Math.cos(t * 0.31), z];
  }

  // numbered callouts (23–27) and the bottom strips
  var CALL = [["١", 112, 196, 300, 180], ["٢", 138, 440, 300, 470], ["٣", 180, 205, 300, 240]];
  window.__washer = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = cam(t), root = el("g", { transform: "translate(" + f1(180 - c[0] * c[2]) + " " + f1(320 - c[1] * c[2]) + ") scale(" + c[2].toFixed(4) + ")" }, svg);
    var bathOn = t < L(4) - 0.2 || t > L(28) + 0.2, secOn = !bathOn;
    var xf = clamp((t - (L(4) - 0.5)) / 0.4) * (1 - clamp((t - (L(28) - 0.2)) / 0.4));   // cross-fade weight of the section
    if (xf < 1) { var bg = el("g", { style: "opacity:" + (1 - xf).toFixed(2) }, root); bathroom(bg, t, win(t, L(1) + 0.2, L(2) + 0.3) * ((t - L(1)) % 2 > 1 ? 1 : 0.5)); }
    if (xf > 0) {
      var sg = el("g", { style: "opacity:" + xf.toFixed(2) }, root), pos = section(sg, t);
      var co = win(t, L(23) + 0.2, L(28) - 0.2);
      if (co > 0) CALL.forEach(function (cl, i) {
        var on = t > L(24 + i) - 0.1 ? 1 : 0.3, gg = el("g", { style: "opacity:" + (co * on).toFixed(2) }, sg);
        var px = cl[1] + (i === 1 ? 0 : 0), py = cl[2];
        el("path", { d: "M" + px + " " + py + " L" + (cl[3] - 12) + " " + cl[4], "class": "c-lead" }, gg);
        el("circle", { cx: cl[3], cy: cl[4], r: 11, "class": "c-dot" }, gg); el("text", { x: cl[3], y: cl[4] + 5, "text-anchor": "middle", "class": "c-num" }, gg, cl[0]);
      });
      var warn = win(t, L(20) + 0.3, L(23)); if (warn > 0) { var wg = el("g", { style: "opacity:" + (warn * (0.6 + 0.4 * Math.sin(t * 8))).toFixed(2), transform: "translate(300 330)" }, sg); el("path", { d: "M0 -14 L13 10 H-13 Z", "class": "c-warn" }, wg); el("text", { x: 0, y: 7, "text-anchor": "middle", "class": "c-warn-t" }, wg, "!"); }
    }
    return c;
  };
  window.__omega = omega; window.__win = win; window.__L = L;
})();
