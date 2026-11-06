  // ── «الواي فاي بيبعت الداتا في الهوا إزاي؟» (v2): a real 3-D camera (yaw/pitch per shot), outlined plates with rounded
  // corners, lit faces, back faces culled, painter's order by depth. Objects are slabs (extruded outlines), tubes and rings.
  var IS = 1.0, GRN = "#5c8f3e", RED = "#c4532c", SCR = "#17324a", SKY = "#9fc3dc", BONE2 = "#faf7ee";
  var K3 = 1.2247, VW = {}, L3 = [];
  function setView(th, ph) {
    VW.V = [Math.cos(th) * Math.cos(ph), Math.sin(th) * Math.cos(ph), Math.sin(ph)];
    VW.R = [Math.sin(th), -Math.cos(th), 0];
    VW.U = [-Math.sin(ph) * Math.cos(th), -Math.sin(ph) * Math.sin(th), Math.cos(ph)];
  }
  setView(Math.PI / 4, 0.615);
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function un(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function add3(a, b, k) { k = k == null ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function lerp3(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  function P(p) { return [dot3(p, VW.R) * K3 * IS, -dot3(p, VW.U) * K3 * IS]; }
  var LIG = un([-0.5, 0.35, 0.8]);
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16); return "rgb(" + Math.round(((n >> 16) & 255) * k) + "," + Math.round(((n >> 8) & 255) * k) + "," + Math.round((n & 255) * k) + ")"; }
  function shadeN(hex, n) { var k = 0.5 + 0.5 * Math.max(0, dot3(n, LIG)); return shade(hex, k); }
  function orient(F, up) { up = up || [0, 0, 1]; var B = un(add3(up, F, -dot3(up, F))), A = cr(B, F); return { A: A, B: B }; }
  function rrectPts(w, h, r) {
    var pts = [], k = 5, cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
    cs.forEach(function (c) { for (var i = 0; i <= k; i++) { var a = (c[2] + 90 * i / k) * Math.PI / 180; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } });
    return pts;
  }
  function circPts(r, n) { var pts = []; for (var i = 0; i < (n || 28); i++) { var a = i / (n || 28) * Math.PI * 2; pts.push([r * Math.cos(a), r * Math.sin(a)]); } return pts; }
  function rectPts(w, h) { return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]; }
  function mapP(C, A, B, pts, e) { var N = un(cr(A, B)); return pts.map(function (p) { return [C[0] + A[0] * p[0] + B[0] * p[1] + N[0] * e, C[1] + A[1] * p[0] + B[1] * p[1] + N[1] * e, C[2] + A[2] * p[0] + B[2] * p[1] + N[2] * e]; }); }
  function poly3(p3, fill, sw, extra) { return '<polygon points="' + p3.map(function (p) { var q = P(p); return f(q[0]) + "," + f(q[1]); }).join(" ") + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.1 : sw) + '" stroke-linejoin="round"' + (extra || "") + '/>'; }
  // an extruded convex outline centred on C: visible faces only, lit by the light, optional hatch overlay
  function slab(C, A, B, pts, T, col, o) {
    o = o || {}; var N = un(cr(A, B)), n = pts.length, area = 0, out = "", i, j, hz = T / 2;
    for (i = 0; i < n; i++) { j = (i + 1) % n; area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
    var sg = area >= 0 ? 1 : -1;
    function W(p, e) { return [C[0] + A[0] * p[0] + B[0] * p[1] + N[0] * e, C[1] + A[1] * p[0] + B[1] * p[1] + N[1] * e, C[2] + A[2] * p[0] + B[2] * p[1] + N[2] * e]; }
    for (i = 0; i < n; i++) {
      j = (i + 1) % n; var p = pts[i], q = pts[j], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      var nw = un(add3(add3([0, 0, 0], A, sg * dy / L), B, -sg * dx / L));
      if (dot3(nw, VW.V) <= 0) continue;
      var quad = [W(p, -hz), W(q, -hz), W(q, hz), W(p, hz)];
      out += poly3(quad, shadeN(col, nw), 1.0);
      if (o.hatch) out += poly3(quad, "url(#hatch)", 0.6);
    }
    var front = dot3(N, VW.V) > 0, nf = front ? N : [-N[0], -N[1], -N[2]], fe = front ? hz : -hz;
    var face = pts.map(function (p) { return W(p, fe); });
    out += poly3(face, shadeN(o.face || col, nf), 1.2);
    if (o.hatch) out += poly3(face, "url(#hatch)", 0.6);
    return out;
  }
  // a flat decal on a plate (screen, mosaic, label card): local pts mapped on the plane, e = offset along the plane normal
  function plane(C, A, B, pts, col, e) { return poly3(mapP(C, A, B, pts, e || 0), col, 0.8); }
  function tube(pts, r, col) {
    var d = pts.map(function (p, i) { var q = P(p); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ");
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(2 * r + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(2 * r) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function dotAt(p, r, col) { var q = P(p); return '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1"/>'; }
  // an arc of a ring in the plane spanned by A,B around C
  function ringArc(C, A, B, r, a0, a1, col, op, sw) {
    var d = ""; for (var i = 0; i <= 36; i++) { var a = lerp(a0, a1, i / 36), q = P(add3(add3(C, A, r * Math.cos(a)), B, r * Math.sin(a))); d += (i ? " L" : "M") + f(q[0]) + " " + f(q[1]); }
    return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 2.6) + '" fill="none" opacity="' + f(op == null ? 1 : op) + '" stroke-linecap="round"/>';
  }
  function put(c, s) { L3.push([dot3(c, VW.V), s]); }
  function flush() { L3.sort(function (a, b) { return a[0] - b[0]; }); var s = ""; for (var i = 0; i < L3.length; i++) s += L3[i][1]; L3 = []; return s; }
  function alongPoly(pts, p) { var n = pts.length - 1, s = clamp(p) * n, i = Math.min(n - 1, Math.floor(s)); return lerp3(pts[i], pts[i + 1], s - i); }
  function lab(c, lx, ly, text, col, k, sz) { var q = P(c); return label(q[0], q[1], lx, ly, text, col, k, sz); }
  function camV(th0, ph0, th1, ph1, z0, z1, pan) {
    return function (u, d) { var k = clamp(u / d), kk = k * k * (3 - 2 * k); setView(lerp(th0, th1, kk), lerp(ph0, ph1, kk)); var zz = lerp(z0, z1, kk); return [pan ? pan[0] : 0, pan ? pan[1] : 0, zz < 1.9 ? zz * 0.8 : zz]; };
  }
  function floorGrid(ext, step) {
    var s = slab([0, 0, -1], [1, 0, 0], [0, 1, 0], rectPts(ext * 2, ext * 2), 2, "#e6dcc4");
    for (var k = -ext; k <= ext; k += step) { s += tube([[k, -ext, 0], [k, ext, 0]], 0.5, "#cbbd9f") + tube([[-ext, k, 0], [ext, k, 0]], 0.5, "#cbbd9f"); }
    return s;
  }
  // ── objects ─────────────────────────────────────────────────────────────────────────────────────────────
  function phone3(c, F, t, s, o) {
    s = s || 1; o = o || {}; var ob = orient(F), A = ob.A, B = ob.B, T = 7 * s;
    var body = slab(c, A, B, rrectPts(44 * s, 88 * s, 9 * s), T, "#3a404b", { face: "#2e333c" });
    var sc = add3(c, F, T / 2 + 0.2 * s), scr = slab(sc, A, B, rrectPts(38 * s, 82 * s, 6 * s), 0.4 * s, SCR, { face: SCR });
    var ui = plane(add3(sc, F, 0.3 * s), A, B, [[-4 * s, 36 * s], [4 * s, 36 * s], [4 * s, 39 * s], [-4 * s, 39 * s]], "#0b1620");
    if (o.screen === "movie") {
      ui += plane(add3(sc, F, 0.3 * s), A, B, rrectPts(30 * s, 40 * s, 3 * s).map(function (p) { return [p[0], p[1] + 4 * s]; }), SKY);
      ui += plane(add3(sc, F, 0.35 * s), A, B, [[-14 * s, -18 * s], [14 * s, -18 * s], [4 * s, 4 * s], [-14 * s, -6 * s]], "#5f9a5a");
      ui += plane(add3(sc, F, 0.35 * s), A, B, circPts(4 * s, 14).map(function (p) { return [p[0] + 9 * s, p[1] + 20 * s]; }), YEL);
      var pw = 24 * s * (t * 0.25 % 1);
      ui += plane(add3(sc, F, 0.35 * s), A, B, [[-12 * s, -29 * s], [-12 * s + pw, -29 * s], [-12 * s + pw, -26 * s], [-12 * s, -26 * s]], RED);
    } else if (o.screen === "photo") {
      for (var r = 0; r < 4; r++) for (var c2 = 0; c2 < 3; c2++) { var v = hash(r * 3 + c2 + 2); ui += plane(add3(sc, F, 0.35 * s), A, B, rectPts(9 * s, 9 * s).map(function (p) { return [p[0] + (c2 - 1) * 10 * s, p[1] + (r - 1.5) * 12 * s]; }), v > 0.6 ? "#e2a04a" : v > 0.3 ? "#5f9a5a" : "#2f7fb8"); }
    }
    return body + scr + ui;
  }
  var YEL = "#f2c230", BLUE = "#46698a", OLIVE = "#6b7d3c", ORANGE = "#c4532c";
  function router3(c, t, s) {
    s = s || 1; var W = 96 * s, D = 58 * s, H = 26 * s, cc = [c[0], c[1], c[2] + H / 2];
    var out = slab(cc, [1, 0, 0], [0, 1, 0], rrectPts(W, D, 9 * s), H, BONE, { face: BONE2 });
    for (var k = 0; k < 3; k++) { var q = P([c[0] - 20 * s + k * 16 * s, c[1] - 8 * s, c[2] + H + 0.5]); out += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(3.2 * s) + '" fill="' + (k === 2 ? BLUE : GRN) + '" opacity="' + f(0.4 + 0.6 * Math.abs(Math.sin(t * 3 + k))) + '" stroke="' + INK + '" stroke-width="1"/>'; }
    for (var v = 0; v < 6; v++) out += plane([c[0] - 30 * s + v * 12 * s, c[1] + D / 2 + 0.2, c[2] + H * 0.4], [1, 0, 0], [0, 0, 1], rectPts(6 * s, H * 0.4), "#8a929c", 0);
    var a1 = [c[0] - 30 * s, c[1] - 14 * s, c[2] + H], a2 = [c[0] - 34 * s, c[1] - 18 * s, c[2] + H + 46 * s], b1 = [c[0] + 30 * s, c[1] - 14 * s, c[2] + H], b2 = [c[0] + 34 * s, c[1] - 18 * s, c[2] + H + 46 * s];
    out += tube([a1, a2], 1.8 * s, "#2d3136") + tube([b1, b2], 1.8 * s, "#2d3136") + dotAt(a2, 3 * s, "#2d3136") + dotAt(b2, 3 * s, "#2d3136");
    return out;
  }
  function cubeObj(c, w, d, h, col, o) { return slab([c[0], c[1], c[2] + h / 2], [1, 0, 0], [0, 1, 0], rrectPts(w, d, Math.min(w, d) * 0.08), h, col, o); }
  // a token of data: photo card (0), message bubble (1), sound disc (2), facing F
  function token3(c, kind, F, s) {
    s = s || 1; var ob = orient(F), A = ob.A, B = ob.B;
    if (kind === 0) { var card = slab(c, A, B, rrectPts(24 * s, 18 * s, 2 * s), 1.4 * s, PAPER, { face: "#fbf8ef" }); var cells = ""; for (var r = 0; r < 2; r++) for (var k = 0; k < 3; k++) cells += plane(add3(c, F, 0.9 * s), A, B, rectPts(6 * s, 5 * s).map(function (p) { return [p[0] + (k - 1) * 7 * s, p[1] + (r - 0.5) * 6 * s]; }), ["#2f7fb8", "#e2a04a", "#5f9a5a", "#e2a04a", "#2f7fb8", "#5f9a5a"][r * 3 + k]); return card + cells; }
    if (kind === 1) return slab(c, A, B, rrectPts(26 * s, 15 * s, 7 * s), 1.4 * s, BLUE, { face: "#5a84ab" });
    return slab(c, A, B, circPts(8 * s, 20), 1.4 * s, OLIVE, { face: "#86a04e" });
  }
  // a data cable: flat tube with plugs at both ends
  function cable(pts, col) { return tube(pts, 2.6, col || "#33383f"); }
  // a row of bits along a 3-D path
  function bitsPath(pts, n, t, sp, col, sz) {
    var s = ""; for (var i = 0; i < n; i++) { var c = t * sp + i / n, p = c % 1, q = P(alongPoly(pts, p)), v = hash(i * 13 + Math.floor(c)) > 0.5 ? "1" : "0"; s += '<g opacity="' + f(Math.min(1, p * 5, (1 - p) * 5)) + '">' + T(v, q[0], q[1] + 6, sz || 20, col || INK, 900) + '</g>'; }
    return s;
  }
  // rings in the floor plane (radio waves spreading out from an antenna)
  function floorRings(C, t, n, col, r0, step, a0, a1) { var s = ""; for (var k = 0; k < n; k++) { var r = r0 + ((t * 40 + k * step) % (n * step)); s += ringArc(C, [1, 0, 0], [0, 1, 0], r, a0 || 0, a1 || Math.PI * 2, col, clamp(1 - r / (n * step + r0)), 2.4); } return s; }
  var PAPER = "#eee5d0";
  // ── shots: one per script line (line 0 is the opening card, line 24 the summary card) ─────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  // 0 — placeholder (the opening card is the intro overlay)
  shot(0, camV(0.8, 0.5, 0.8, 0.5, 1, 1), function () { return paper(); });
  // 1 — pictures and sound travel through the air, you can't see them
  shot(1, camV(0.5, 0.35, 0.95, 0.5, 1.2, 1.3), function (u, d, t) {
    var A0 = [-150, 0, 44], B0 = [150, 0, 44], FA = un([1, 0.3, 0]), FB = un([-1, -0.3, 0]);
    var s = paper() + floorGrid(170, 34);
    put(A0, phone3(A0, FA, t, 1.25)); put(B0, phone3(B0, FB, t, 1.25, { screen: "movie" }));
    put([0, 0, 0], ringArc([-150, 0, 110], [1, 0, 0], [0, 0, 1], 40 + (t * 30) % 40, -0.9, 0.9, BLUE, 0.6));
    var rings = ""; for (var k = 0; k < 3; k++) rings += ringArc([-150, 0, 110], [1, 0, 0], [0, 0, 1], 40 + k * 40 + (t * 30) % 40, -0.9, 0.9, BLUE, clamp(0.9 - k * 0.25));
    s += flush() + rings;
    for (var i = 0; i < 6; i++) { var p = (t * 0.22 + i / 6) % 1, q = lerp3([-150, 0, 150], [150, 0, 150], p); q[2] += Math.sin(p * Math.PI) * 60; var ob = token3(q, i % 3, VW.V, 1.2); s += ob; }
    var lc = P([-150, 0, 150]); return s + label(lc[0], lc[1], -230, -230, "صور وصوت", BLUE, (u - 0.5) / 0.8, 20) + label(P([0, 0, 180])[0], P([0, 0, 180])[1], 120, -270, "مش شايفهم", ORANGE, (u - 1.4) / 0.8, 20);
  });
  // 2 — the puzzle: how does it travel, and who decodes it?
  shot(2, camV(0.7, 0.9, 0.5, 0.65, 1.3, 1.4), function (u, d, t) {
    var R0 = [-130, 0, 0], PH = [130, 0, 44];
    var s = paper() + floorGrid(170, 34);
    put(R0, router3(R0, t, 1.1)); put(PH, phone3(PH, un([-1, 0, 0]), t, 1.2, { screen: "movie" }));
    var pts = []; for (var k = 0; k <= 12; k++) pts.push([lerp(-100, 100, k / 12), 0, 110 + Math.sin(k / 12 * Math.PI) * 50]);
    s += flush() + bitsPath(pts, 9, t, 0.22, BLUE, 22) ;
    var q = P([0, 0, 200]);
    s += T("؟", q[0] - 80, q[1] + Math.sin(t * 2) * 5, 60, ORANGE, 900) + T("؟", q[0] + 70, q[1] - 30 + Math.cos(t * 2) * 5, 36, BLUE, 900);
    var a = P([0, 0, 120]), b = P(PH);
    return s + label(a[0], a[1], -200, -120, "الداتا؟", BLUE, (u - 0.4) / 0.8, 20) + label(b[0], b[1] - 30, 230, -200, "بتفكّها إزاي؟", ORANGE, (u - 1.6) / 0.8, 20);
  });
  // 3 — the title card: the router with waves spreading on the floor
  shot(3, camV(0.2, 0.5, 1.0, 0.6, 1.0, 1.15), function (u, d, t) {
    var s = paper() + floorGrid(170, 34);
    put([0, 0, 0], router3([0, 0, 0], t, 1.6)); s += flush() + floorRings([0, 0, 1], t, 4, BLUE, 40, 50);
    return s + T("إيه الحكاية؟", 0, -300, 44, ORANGE, 900) + T("هشرحهالك في دقيقة", 0, -250, 24, INK, 700);
  });
  // 4 — close on the router: what it sends is 0s and 1s
  shot(4, camV(0.9, 0.5, 1.2, 0.6, 2.0, 2.3), function (u, d, t) {
    var s = paper() + floorGrid(150, 34);
    put([0, 0, 0], router3([0, 0, 0], t, 1.8)); s += flush();
    var out = [[60, -30, 40], [130, -60, 90], [170, -90, 140]];
    s += bitsPath(out, 8, t, 0.5, BLUE, 26);
    var a = P([60, -30, 40]);
    return s + label(a[0], a[1], -230, -130, "الراوتر", BLUE, (u - 0.3) / 0.8, 22) + label(P([130, -60, 90])[0], P([130, -60, 90])[1], 200, 160, "أصفار وواحدات", ORANGE, (u - 1.1) / 0.8, 22);
  });
  // 5 — the photo leaves the phone, dissolves into bits, and the bits go down the cable
  shot(5, camV(0.9, 0.35, 1.2, 0.5, 1.4, 1.5), function (u, d, t) {
    var a = clamp(u / d), PC = [-160, 0, 44], FP = un([1, 0, 0]), s = paper() + floorGrid(170, 34);
    var cab = [[-160, -40, 6], [-60, -40, 6], [20, -40, 6], [102, -40, 6]];
    put(PC, phone3(PC, FP, t, 1.25, { screen: "photo" })); put([150, -40, 0], router3([150, -40, 0], t, 1.2));
    s += flush() + cable(cab, "#3c5a46");
    var card, fade = 1, spread = 0;
    if (a < 0.3) { var k1 = a / 0.3; card = lerp3([-150, 0, 60], [-60, 30, 130], k1 * k1 * (3 - 2 * k1)); fade = 1; }
    else if (a < 0.55) { var k2 = (a - 0.3) / 0.25; card = lerp3([-70, 20, 120], [-100, -40, 30], k2); fade = 1 - k2; }
    if (card) { var F = un([1, 0.2 + Math.sin(a * 6) * 0.3, 0.4]); s += token3(card, 0, F, 3.2 * (fade < 1 ? fade : 1) + 0.01) + ""; }
    s += bitsPath(cab, 16, t, 0.22, BLUE, 26);
    var lp = P([-60, -40, 6]), lb = P([-130, 0, 50]), lc = P([40, -40, 6]);
    return s + label(lb[0], lb[1], -250, -250, "صورة", BLUE, (u - 0.3) / 0.8, 20) + label(lp[0], lp[1] + 10, -250, 130, "سلك", OLIVE, (u - 0.9) / 0.8, 20) + label(lc[0], lc[1], 170, 250, "أرقام بتتسافر", ORANGE, (u - 1.4) / 0.8, 20);
  });
  // 6 — the router turns the bits into a radio wave
  shot(6, camV(0.8, 1.05, 1.3, 1.1, 1.5, 1.6), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), R0 = [0, 0, 0];
    put(R0, router3(R0, t, 2)); s += flush();
    s += floorRings([0, 0, 130], t, 4, BLUE, 40, 55) + tube([[-160, -60, 2], [-40, -20, 2], [-20, -10, 26]], 2.6, "#33383f");
    s += bitsPath([[-160, -60, 2], [-40, -20, 2], [-20, -10, 26]], 9, t, 0.3, BLUE, 20);
    var a = P([0, 0, 180]);
    return s + label(a[0], a[1], -170, -270, "موجة راديو", BLUE, (u - 0.5) / 0.8, 24);
  });
  // 7 — the wave changes shape with every bit
  shot(7, camV(0.4, 0.3, 1.0, 0.45, 1.2, 1.3), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), pts = [];
    for (var x = -200; x <= 200; x += 6) { var b = Math.floor((x + t * 60) / 60), v = hash(b * 3) > 0.5, A = v ? 26 : 9, fr = v ? 0.3 : 0.12; pts.push([x, 0, 60 + Math.sin(x * fr - t * 7) * A]); }
    s += tube(pts, 2, BLUE);
    var lab1 = "", cell = 60; for (var bb = -6; bb < 6; bb++) { var xc = bb * cell - (t * 60) % cell + 30; if (xc > -200 && xc < 200) { var qq = P([xc, 0, 0]); lab1 += T(hash(bb * 3) > 0.5 ? "1" : "0", qq[0], qq[1], 20, OLIVE, 900); } }
    return s + lab1 + label(P([0, 0, 90])[0], P([0, 0, 90])[1], -200, -240, "كل تغيير = رقم", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 8 — zoom on the wave: the data IS the shape of the wave
  shot(8, camV(0.5, 0.4, 0.7, 0.5, 2.0, 2.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), pts = [];
    for (var x = -200; x <= 200; x += 4) { var b = Math.floor((x + t * 60) / 60), v = hash(b * 3) > 0.5, A = v ? 26 : 9, fr = v ? 0.3 : 0.12; pts.push([x, 0, 60 + Math.sin(x * fr - t * 7) * A]); }
    s += tube(pts, 3.5, BLUE);
    return s + label(P([0, 0, 60])[0], P([0, 0, 60])[1], 120, -220, "الداتا هي الشكل", BLUE, (u - 0.5) / 0.8, 20);
  });
  // 9 — it travels at the speed of light, which the eye can't see
  shot(9, camV(0.2, 0.2, 0.8, 0.35, 1.0, 1.2), function (u, d, t) {
    var s = paper() + floorGrid(190, 34), R0 = [-160, 0, 0], PH = [160, 0, 44];
    put(R0, router3(R0, t, 1.1)); put(PH, phone3(PH, un([-1, 0, 0]), t, 1.2, { screen: "movie" })); s += flush();
    var a = P([-100, 0, 110]), b = P([100, 0, 110]);
    s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 12" stroke-dashoffset="' + f(-t * 160) + '"/>';
    s += '<circle cx="230" cy="-270" r="22" fill="#f4c26b" stroke="' + INK + '" stroke-width="1.6"/>';
    return s + label(a[0], a[1], -220, -220, "بسرعة الضوء", ORANGE, (u - 0.4) / 0.8, 22);
  });
  // 10 — the antenna catches the wave; a chip reads it (magnified inset)
  shot(10, camV(0.3, 0.3, 1.2, 0.5, 1.4, 1.5), function (u, d, t) {
    var C = [0, 0, 44], s = paper() + floorGrid(150, 34);
    put(C, phone3(C, un([1, 0.2, 0]), t, 1.9, { screen: "movie" })); s += flush();
    s += ringArc([-200, 0, 150], [1, 0, 0], [0, 0, 1], 60 + (t * 40) % 60, -0.9, 0.9, BLUE, 0.8) + ringArc([-200, 0, 150], [1, 0, 0], [0, 0, 1], 120 + (t * 40) % 60, -0.9, 0.9, BLUE, 0.4);
    var chip = '<rect x="-34" y="-26" width="68" height="52" rx="5" fill="#2b2f35" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) chip += '<rect x="' + (-36 + k * 12) + '" y="-34" width="5" height="8" fill="#b89a52"/><rect x="' + (-36 + k * 12) + '" y="26" width="5" height="8" fill="#b89a52"/>';
    chip += T(hash(Math.floor(t * 4)) > 0.5 ? "1" : "0", 0, 8, 26, GRN, 900);
    s += inset(200, -210, 70, '<g transform="scale(1.8)">' + chip + '</g>', (u - 0.5) / 0.8);
    return s + label(P([0, 0, 120])[0], P([0, 0, 120])[1], -240, -130, "الهوائي", BLUE, (u - 1.2) / 0.8, 20);
  });
  // 11 — the bits come back together as a picture, a message or a sound
  shot(11, camV(0.6, 0.5, 0.4, 0.45, 1.3, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), rows = [[120, -60, 50, 0], [120, 0, 50, 1], [120, 60, 50, 2]];
    rows.forEach(function (r) { put([r[0], r[1], r[2]], token3([r[0], r[1], r[2]], r[3], un([1, 0.6, 0.2]), 2.6)); }); s += flush();
    s += bitsPath([[-160, 0, 50], [60, 0, 50], [110, 0, 50]], 14, t, 0.3, BLUE, 18);
    var a = P([120, -60, 50]), b = P([120, 0, 50]), c = P([120, 60, 50]);
    return s + label(a[0], a[1], 230, -250, "صورة", BLUE, (u - 0.8) / 0.8, 20) + label(b[0], b[1], 230, -40, "رسالة", ORANGE, (u - 1.2) / 0.8, 20) + label(c[0], c[1], 230, 150, "صوت", OLIVE, (u - 1.6) / 0.8, 20);
  });
  // 12 — one router, many devices on the same air
  shot(12, camV(1.0, 1.1, 1.4, 1.0, 1.25, 1.3), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), R0 = [0, 0, 0];
    put(R0, router3(R0, t, 1.3));
    var devs = [[-190, -90], [-190, 80], [190, -90], [190, 80], [0, -170], [0, 160]];
    devs.forEach(function (p, i) { var ff = un([-p[0], -p[1], 0]); put([p[0], p[1], 44], phone3([p[0], p[1], 44], ff, t, 0.9, { screen: "movie" })); });
    s += flush();
    devs.forEach(function (p, i) { s += tube([[0, 0, 40], [p[0] * 0.5, p[1] * 0.5, 60], [p[0], p[1], 60]], 0.8, "#b9b08f"); s += bitsPath([[0, 0, 40], [p[0] * 0.5, p[1] * 0.5, 60], [p[0], p[1], 60]], 2, t, 0.3 + i * 0.02, BLUE, 16); });
    var q = P([0, 0, 160]);
    return s + numBox("20", q[0], q[1] - 10, clamp((u - 0.2) / 0.5), 26) + label(P([-190, -90, 44])[0], P([-190, -90, 44])[1], -240, -250, "عشرين جهاز", ORANGE, (u - 0.8) / 0.8, 20);
  });
  // 13 — they listen first, and wait while someone else is sending
  shot(13, camV(0.2, 0.5, 0.9, 0.5, 1.4, 1.5), function (u, d, t) {
    var s = paper() + floorGrid(190, 34), on = Math.floor(t * 0.7) % 5;
    for (var i = 0; i < 5; i++) { var c = [-200 + i * 100, 0, 44]; put(c, phone3(c, un([0, -1, 0]), t, 1.0, { screen: "photo" })); }
    s += flush();
    for (var j = 0; j < 5; j++) { var x = -200 + j * 100, q = P([x, 0, 130]); s += j === on ? floorRings([x, 0, 4], t, 2, ORANGE, 10, 26) : '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="11" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(q[0]) + ' ' + f(q[1]) + ' L' + f(q[0] + Math.cos(t * 3) * 7) + ' ' + f(q[1] + Math.sin(t * 3) * 7) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    var h = P([-100, 0, 180]);
    return s + label(h[0], h[1], -230, -240, "بتستنى شوية", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 14 — the stream is cut into many lanes, one for each device
  shot(14, camV(0.8, 0.9, 1.1, 0.95, 1.2, 1.3), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), trunk = [[-200, 0, 20], [-120, 0, 20]];
    s += tube(trunk, 6, BLUE);
    for (var k = 0; k < 8; k++) {
      var y = -150 + k * 42, c = k % 2 ? BLUE : OLIVE, pts = [[-120, 0, 20], [-40, 0, 20], [0, y, 20], [60, y, 20], [160, y, 20]];
      s += tube(pts, 3, "#e6dcc4") + tube(pts, 1.6, c);
      s += bitsPath(pts, 2, t, 0.3 + k * 0.03, INK, 13);
      put([180, y, 20], phone3([180, y, 20], un([-1, 0, 0]), t, 0.5, { screen: "movie" }));
    }
    s += flush();
    return s + label(P([-160, 0, 20])[0], P([-160, 0, 20])[1], -240, -240, "مئات الخطوط", BLUE, (u - 0.5) / 0.8, 22);
  });
  // 15 — the teacher hands papers to every desk at once
  shot(15, camV(0.4, 0.8, 1.0, 0.8, 1.3, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34);
    put([-200, 0, 0], cubeObj([-200, 0, 0], 60, 40, 46, "#9b7b52", { hatch: true }));
    for (var i = 0; i < 5; i++) { var x = -60 + (i % 3) * 110, y = -60 + Math.floor(i / 3) * 130; put([x, y, 0], cubeObj([x, y, 0], 64, 44, 26, "#c8b48f")); put([x, y, 26], token3([x, y, 26], 0, un([0, -1, 0.6]), 1)); }
    s += flush();
    for (var k = 0; k < 6; k++) { var p = (t * 0.5 + k / 6) % 1, tx = lerp(-200, -60 + (k % 3) * 110, p), ty = lerp(0, -60 + Math.floor(k / 3) * 130, p), tz = 60 + Math.sin(p * Math.PI) * 70; s += token3([tx, ty, tz], 0, un([0, -1, 0.5]), 1.1); }
    var a = P([-200, 0, 46]), b = P([-60, -60, 26]);
    return s + label(a[0], a[1], -240, -180, "المدرس", BLUE, (u - 0.4) / 0.8, 20) + label(b[0], b[1], 60, -200, "الكراسات", OLIVE, (u - 1.2) / 0.8, 20);
  });
  // 16 — distance and walls: the wave gets weaker
  shot(16, camV(0.5, 0.7, 1.2, 0.8, 1.3, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), R0 = [-200, 0, 0];
    put(R0, router3(R0, t, 1.0)); put([170, 0, 44], phone3([170, 0, 44], un([-1, 0, 0]), t, 1.1, { screen: "movie" }));
    put([0, 0, 0], slab([0, 0, 70], [0, 1, 0], [0, 0, 1], rectPts(150, 140), 16, PUTTY, { hatch: true }));
    s += flush();
    for (var k = 0; k < 5; k++) { var r = 30 + ((t * 40 + k * 40) % 200); s += ringArc([-200, 0, 80], [1, 0, 0], [0, 0, 1], r, -0.9, 0.9, BLUE, clamp(1 - r / 200) * (r < 160 ? 1 : 0), 2.4); }
    var q = P([0, 0, 140]);
    s += crossMark(q[0] + 30, q[1], 0.5, clamp((u - 0.9) / 0.6));
    return s + label(q[0], q[1], -40, -240, "الحيطة بتاكل", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 17 — two rooms, three walls: four bars in one room, one bar behind the walls
  shot(17, camV(0.4, 1.1, 0.6, 1.2, 1.4, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34);
    put([0, 0, 0], slab([-60, 0, 80], [0, 1, 0], [0, 0, 1], rectPts(300, 160), 0.1, "#fff", {}));
    var W1 = [[-70, 0, 0], [-40, 0, 0], [-10, 0, 0]];
    [-70, -10, 50].forEach(function (x) { put([x, 0, 0], slab([x, 0, 80], [0, 1, 0], [0, 0, 1], rectPts(14, 160), 160, PUTTY, { hatch: true })); });
    put([-200, -60, 0], router3([-200, -60, 0], t, 0.9)); put([-120, 40, 44], phone3([-120, 40, 44], un([1, 0, 0]), t, 0.9, { screen: "movie" }));
    put([120, 40, 44], phone3([120, 40, 44], un([-1, 0, 0]), t, 0.9, { screen: "movie" }));
    s += flush();
    var q1 = P([-120, 40, 110]), q2 = P([120, 40, 110]);
    s += bars(q1[0] - 20, q1[1], 4) + bars(q2[0] - 20, q2[1], 1);
    s += pk(0, 0, 1, 0);
    return s + label(P([-50, 0, 170])[0], P([-50, 0, 170])[1], -240, -250, "تلات حيطان", ORANGE, (u - 0.4) / 0.8, 22);
  });
  function bars(x, y, n) { var s = ""; for (var i = 0; i < 4; i++) s += '<rect x="' + (x + i * 14) + '" y="' + f(y - (10 + i * 9)) + '" width="9" height="' + (10 + i * 9) + '" fill="' + (i < n ? GRN : "#cfc8b8") + '" stroke="' + INK + '" stroke-width="1"/>'; return s; }
  function pk(x, y, kind, op) { return ""; }
  // 18 — the microwave runs at a frequency next to Wi-Fi's: they clash now and then
  shot(18, camV(0.9, 0.5, 1.2, 0.55, 1.4, 1.5), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), O = [-120, 0, 0], RT = [120, 0, 0];
    put(O, cubeObj(O, 110, 70, 80, "#e9e6df")); put(add3(O, [0, 0, 0]), slab([O[0] + 0, O[1] + 36, 40], [1, 0, 0], [0, 0, 1], rrectPts(70, 50, 4), 2, "#2d3136", { face: "#25313d" }));
    put(RT, router3(RT, t, 1.2)); s += flush();
    s += floorRings([RT[0], RT[1], 60], t, 3, BLUE, 30, 40, -0.9 + Math.PI, 0.9 + Math.PI);
    if (Math.sin(t * 9) > -0.2) { var z = P([-30, 36, 60]), zz = [[0, 0], [14, -18], [24, 8], [38, -22], [48, 4], [62, -16]]; s += '<path d="' + zz.map(function (p, i) { return (i ? "L" : "M") + f(z[0] + p[0]) + " " + f(z[1] + p[1]); }).join(" ") + '" stroke="' + RED + '" stroke-width="3" fill="none" stroke-linejoin="round"/>'; }
    var q = P([-120, 0, 120]);
    return s + numBox("2.45 GHz", q[0] + 70, q[1] + 60, clamp((u - 0.9) / 0.6), 22) + label(P([-120, 0, 40])[0], P([-120, 0, 40])[1], -240, -160, "الميكروويف", BLUE, (u - 0.4) / 0.8, 20) + label(P([0, 0, 90])[0], P([0, 0, 90])[1], 60, -250, "خناقة", ORANGE, (u - 1.6) / 0.8, 22);
  });
  // 19 — the name: not an acronym, a marketing choice (flat card)
  shot(19, camV(0.5, 0.5, 0.5, 0.5, 1, 1.05), function (u, d, t) {
    var s = paper();
    s += '<ellipse cx="0" cy="-40" rx="200" ry="100" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M-60 52 L-90 130 L-20 66 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += T("Wi-Fi", 0, -20, 54, BLUE, 900) + T("Wireless Fidelity", 0, 30, 18, "#6f6a62", 700);
    var sl = clamp((u - 1.2) / 0.8); s += '<path d="M-130 26 L' + f(-130 + 260 * sl) + ' 26" stroke="' + RED + '" stroke-width="4" stroke-linecap="round"/>';
    return s + label(90, 26, 230, 160, "مش اختصار", ORANGE, (u - 1.4) / 0.8, 22);
  });
  // 20 — a radio telescope on the ground, a black hole in the sky (inset)
  shot(20, camV(0.2, 0.25, 0.9, 0.4, 1.3, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34);
    put([-100, 0, 0], cubeObj([-100, 0, 0], 60, 40, 14, "#8a8f96"));
    var dishC = [-100, 0, 110], tilt = un([0.4 + Math.sin(t * 0.4) * 0.05, 0.3, 1]);
    put(dishC, slab(dishC, orient(tilt).A, orient(tilt).B, circPts(70, 36), 6, BONE, { face: BONE2 })); s += flush();
    s += tube([[-100, 0, 14], [-100, 0, 110]], 3, "#5a6068");
    s += inset(170, -120, 92, '<circle r="20" fill="#000"/><ellipse rx="60" ry="16" fill="none" stroke="#ffd98a" stroke-width="9" transform="rotate(' + f(t * 40) + ')"/><circle r="20" fill="#000"/>', (u - 0.5) / 0.8);
    var a = P([-100, 0, 110]);
    return s + label(a[0], a[1], -240, -250, "أستراليا", BLUE, (u - 0.4) / 0.8, 20) + label(170, -200, 150, -300, "ثقوب سوداء", ORANGE, (u - 1.2) / 0.8, 20);
  });
  // 21 — the money from the patents: stacks that keep growing
  shot(21, camV(0.5, 0.6, 1.1, 0.7, 1.3, 1.4), function (u, d, t) {
    var k = clamp(u / d), n = 2 + Math.floor(k * 10), m = 1 + Math.floor(k * 12), s = paper() + floorGrid(170, 34);
    for (var i = 0; i < n; i++) put([-90, 0, i * 9], cubeObj([-90, 0, i * 9], 110, 60, 9, "#7fb07a"));
    for (var j = 0; j < m; j++) put([60, 30, j * 9], cubeObj([60, 30, j * 9], 100, 56, 9, "#8fc08a"));
    s += flush();
    var q = P([-90, 0, n * 9 + 20]);
    return s + numBox("مئات الملايين", 0, -270, clamp((u - 0.3) / 0.6), 22) + label(q[0], q[1], -240, -180, "دولار", BLUE, (u - 1.0) / 0.8, 20);
  });
  // 22 — the film you watched: every bit delivered in order into the phone
  shot(22, camV(0.6, 0.4, 1.2, 0.55, 1.4, 1.5), function (u, d, t) {
    var C = [60, 0, 44], s = paper() + floorGrid(160, 34);
    put(C, phone3(C, un([-1, 0, 0]), t, 1.7, { screen: "movie" })); s += flush();
    s += bitsPath([[-200, -60, 60], [-40, -20, 60], [30, 0, 60]], 12, t, 0.3, BLUE, 20);
    var a = P([-120, -40, 60]);
    return s + label(a[0], a[1], -230, -240, "موجة ماشية", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 23 — payoff: a precise order of millions of numbers and waves (inset of the order)
  shot(23, camV(0.5, 0.6, 1.0, 0.5, 1.3, 1.4), function (u, d, t) {
    var s = paper() + floorGrid(170, 34), R0 = [-170, 0, 0];
    put(R0, router3(R0, t, 1.0)); put([130, 0, 44], phone3([130, 0, 44], un([-1, 0, 0]), t, 1.3, { screen: "movie" })); s += flush();
    var lanes = [-30, 0, 30]; lanes.forEach(function (y, i) { s += tube([[-120, y, 40], [60, y, 40]], 1.6, "#c9c0a4"); s += bitsPath([[-120, y, 40], [60, y, 40]], 6, t, 0.3 + i * 0.05, BLUE, 16); });
    var grid = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) grid += T((r + c) % 2 ? "1" : "0", -70 + c * 18, -20 + r * 18, 14, BLUE, 900);
    s += inset(60, -220, 80, grid, (u - 0.8) / 0.8);
    var q = P([60, 0, 90]);
    return s + label(q[0], q[1], 60, -120, "ترتيب دقيق", ORANGE, (u - 1.2) / 0.8, 20);
  });
  // 24 — placeholder (the summary card is an HTML overlay)
  shot(24, camV(0.8, 0.5, 0.8, 0.5, 1, 1), function () { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__panel = window.__panel;
  window.__intro = function (svg, t) {
    setView(0.9 + t * 0.3, 0.5);
    var s = '<rect width="580" height="320" fill="#141414"/><g transform="translate(290 170) scale(1.1)">';
    put([0, 0, 0], phone3([0, 0, 44], un([1, 0.4, 0]), t, 1.2, { screen: "movie" }));
    put([-170, 0, 0], router3([-170, 0, 0], t, 0.9));
    s += flush() + floorRings([-170, 0, 2], t, 3, BLUE, 20, 40) + '</g>';
    svg.innerHTML = s;
  };
  window.__outro = function (svg, u, t) {
    setView(0.8 + u * 0.2, 0.6);
    var s = '<rect width="580" height="300" fill="#e4d9bf"/><g transform="translate(290 160) scale(0.9)">';
    put([-130, 0, 0], router3([-130, 0, 0], t, 1.1)); put([130, 0, 44], phone3([130, 0, 44], un([-1, 0, 0]), t, 1.1, { screen: "movie" }));
    s += flush() + floorRings([-130, 0, 130], t, 3, BLUE, 30, 40) + '</g>';
    [["1", 130, 80], ["2", 280, 60], ["3", 220, 220], ["4", 400, 150], ["5", 440, 90], ["6", 330, 260]].forEach(function (c, i) { s += callout(c[0], c[1], c[2], (u - 0.2 - i * 0.15) / 0.6); });
    svg.innerHTML = s;
  };
  window.__parts = { router3: router3, phone3: phone3 };
})();
