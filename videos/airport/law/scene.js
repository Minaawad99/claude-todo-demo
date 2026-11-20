/* «تعمل مطار إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One desert airport seen from the side, the earth cut open under the runway. Real scale: 50 world units = 1 m, so the
   man (1.75 m) is drawn at scale 0.25 and the jet is ≈ 45 m long. The runway is shortened along its length (we never show
   all of it at once; the top-view card shows the real kilometres). The build grows line by line, and the man acts out
   and reacts to every line. Cards and labels are drawn in screen space after K.HUD so they keep their size at any zoom. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.25; }); return K.act(u, Ks, t); };
  var shot = K.shot, has = K.has, HUD = K.HUD;
  var GY = K.GY, RY = GY - 26, MY = GY + 4, RW0 = 1000, RWS = 4600, RWL = 8400, EM1 = 9300;
  var TWX = 800, TERM0 = -3100, TERM1 = -1950, FSX = 5300;

  // ── screen-space helpers: a pill / ✗ / ✓ pinned to a world point, at a fixed size on screen ──
  function sp(x, y) { return K.scr(x, y); }
  function hp(text, x, y, u, u0, o) { var q = sp(x, y); o = Object.assign({ sz: 46 }, o || {}); return K.pill(text, q[0], q[1], u, u0, o); }
  function hx(x, y, u, u0, s) { var q = sp(x, y); return K.xmark(q[0], q[1], u, u0, s || 1.1); }
  function hv(x, y, u, u0, s) { var q = sp(x, y); return K.vmark(q[0], q[1], u, u0, s || 1.1); }
  function hring(x, y, r, u, u0, t) { var q = sp(x, y); return K.ring(q[0], q[1], r, u, u0, t); }
  var RED = { bg: "#c7321f" }, YEL = { col: "#ffd23a" }, GRN = { col: "#7cf2a0" };

  // ── the desert: far dunes, the sand's top face (seen a little from above) ──
  function dunes(night) { var s = "";
    for (var i = 0; i < 9; i++) { var x = -4200 + i * 1800 + hash(i + 3) * 600, w = 1400 + hash(i) * 900, h = 160 + hash(i + 7) * 200;
      s += F("M" + f(x - w / 2) + " " + (GY - 56) + " Q" + f(x - w * 0.1) + " " + f(GY - 56 - h * 1.6) + " " + f(x + w / 2) + " " + (GY - 56) + " Z", night ? "#5a5a6a" : "#e6c690", { sw: 0, op: 0.85 }); }
    return s; }
  function sandFace(night, bumps, t) { var s = R(-4200, GY - 60, 15600, 60, "url(#sandFace)", { sw: 0 });
    for (var i = 0; i < 60; i++) { var x = -4100 + hash(i + 11) * 15400, y = GY - 52 + hash(i + 13) * 44; s += P("M" + f(x) + " " + f(y) + " q40 -8 80 0", "#c9a468", 3, ' opacity=".6"'); }
    if (bumps > 0) for (var b = 0; b < 26; b++) { var bx = RW0 - 400 + b * 200 + hash(b) * 80, bh = (14 + hash(b + 5) * 26) * bumps;
      s += F("M" + f(bx - 70) + " " + (GY - 6) + " Q" + f(bx) + " " + f(GY - 6 - bh * 2) + " " + f(bx + 70) + " " + (GY - 6) + " Z", "#d9b57a", { sw: 2, st: "#a8844a" });
      if (bumps > 0.3) s += C(bx + 40, GY - 8, 6, "#8a7a68", { st: INK, sw: 1.5 }); }
    if (night) s += R(-4200, GY - 60, 15600, 60, "#0a1020", { sw: 0, op: 0.55 });
    return s; }

  // ── the runway: top face with markings, a front cut showing the slab or the layers, cracks, lights ──
  function runway(t, b, h) { if (!b.slab && !h.slab) return ""; var x0 = RW0, x1 = h.rwe || (b.long ? RWL : RWS), k = h.slabK == null ? 1 : h.slabK, xe = lerp(x0, x1, k), s = "";
    if (xe <= x0 + 2) return "";
    s += R(x0, GY - 50, xe - x0, 48, "url(#rwTop)", { sw: 2.4 });
    s += P("M" + x0 + " " + (GY - 46) + " H" + f(xe) + " M" + x0 + " " + (GY - 6) + " H" + f(xe), "#f4f4f0", 3);
    for (var x = x0 + 360; x < xe - 120; x += 240) s += P("M" + x + " " + (GY - 26) + " h120", "#f4f4f0", 4);
    for (var p = 0; p < 8; p++) s += P("M" + (x0 + 40 + p * 14) + " " + (GY - 42) + " v32", "#f4f4f0", 6);
    if (b.layers || h.layers) { var L = h.layK || {}; var lp = L.packed == null ? 1 : L.packed, lg = L.gravel == null ? 1 : L.gravel, lc = L.conc == null ? 1 : L.conc;
      s += R(x0, GY + 48, xe - x0, 52 * lp, "url(#packed)", { sw: 2 }) + R(x0, GY + 48 + 52 * (1 - lp), 0, 0, "none", { sw: 0 });
      if (lg > 0) { s += R(x0, GY + 48 - 28 * lg, xe - x0, 28 * lg, "url(#gravel)", { sw: 2 }); for (var g = 0; g < (xe - x0) / 22; g++) s += C(x0 + 8 + g * 22 + hash(g) * 10, GY + 48 - 6 - hash(g + 3) * 18 * lg, 4 + hash(g + 1) * 4, "#5a544c", { op: 0.7 }); }
      if (lc > 0) { var xc = lerp(x0, xe, lc); s += R(x0, GY - 2, xc - x0, 22, "url(#slab)", { sw: 2.4 }); for (var j = x0 + 120; j < xc; j += 240) s += P("M" + j + " " + (GY - 2) + " v22", "#8a867c", 2); } }
    else s += R(x0, GY - 2, xe - x0, 10, "url(#slab)", { sw: 2 });
    if (h.crack) { var c = clamp(h.crack); [[3000, 1], [3000, -1], [2900, 1], [3080, -1]].forEach(function (q, i) { var d = "M" + q[0] + " " + (GY - 6), x = q[0], y = GY - 6; for (var n = 0; n < 7 * c; n++) { x += q[1] * (30 + hash(i * 9 + n) * 30); y += (hash(i * 5 + n) - 0.5) * 20 - (i % 2 ? 4 : -2); d += " L" + f(x) + " " + f(Math.min(GY + 6, Math.max(GY - 48, y))); } s += P(d, "#1e1e1e", 6); });
      for (var cf = 0; cf < 5 * c; cf++) s += P("M" + f(2900 + cf * 50) + " " + (GY - 2) + " l" + f(10 - hash(cf) * 20) + " 10", "#1e1e1e", 4);
      s += P("M2980 " + (GY - 2) + " l-12 10 l16 -2", "#1e1e1e", 3); }
    if (h.night) s += R(x0, GY - 50, xe - x0, 60, "#050a18", { sw: 0, op: 0.55 });
    return s; }
  function runLights(t, k, x1, night) { if (k <= 0) return ""; var s = "", n = 0, gl = night ? 1 : 0;
    for (var x = RW0; x <= x1; x += 300) { var on = clamp((k * 1.15 - (x - RW0) / (x1 - RW0)) * 6), thr = x === RW0;
      [GY - 48, GY - 4].forEach(function (y) { if (on <= 0) return; s += (gl ? C(x, y, 70 * on, thr ? "url(#lampB)" : "url(#lamp)", { op: 0.9 }) : "") + C(x, y, 7, thr ? "#9affb0" : "#fff8d0", { st: INK, sw: 1.5 }); });
      n++; }
    for (var c = RW0 + 150; c < x1; c += 150) { var oc = clamp((k * 1.15 - (c - RW0) / (x1 - RW0)) * 6); if (oc > 0) s += (gl ? C(c, GY - 26, 30 * oc, "url(#lamp)", { op: 0.7 }) : "") + C(c, GY - 26, 4, gl ? "#fff" : "#d8d8d0", { sw: 0 }); }
    return s; }

  // ── the jet: side view, origin at the main wheels on the ground, facing f; pitch nose-up in degrees ──
  function plane(xg, yg, fc, o) { o = o || {}; var s = "", gear = o.gear == null ? 1 : clamp(o.gear), t = o.t || 0;
    var sh = o.shadow == null ? 1 : o.shadow; if (sh > 0) s += '<ellipse cx="' + f(xg + fc * 150) + '" cy="' + f(GY - 22) + '" rx="' + f(1200 * sh) + '" ry="22" fill="#000" opacity="' + f(0.18 * sh) + '"/>';
    s += '<g transform="translate(' + f(xg) + ' ' + f(yg) + ') scale(' + fc + ' 1) rotate(' + f(-(o.pitch || 0)) + ')" filter="url(#sh)">';
    s += F("M-560 -150 L-60 -150 L-120 -175 L-500 -180 Z", "#c9d0d8", { sw: 2 });   // far wing root
    s += F("M-560 -305 L-860 -620 L-990 -620 L-950 -290 Z", "url(#tailG)", { sw: 2.6 });
    s += C(-860, -520, 34, "#fff", { st: "#7a1a10", sw: 2 }) + T("؟", -860, -506, 40, "#c7321f");
    s += F("M1100 -305 Q1255 -300 1258 -205 Q1252 -112 1100 -105 L-500 -105 Q-800 -140 -1000 -255 L-1005 -280 Q-950 -305 -850 -305 Z", "url(#fuse)", { sw: 2.6 });
    s += P("M-930 -178 L1180 -178", "#c7321f", 12) + P("M-930 -160 L1200 -160", "#2a5f92", 5);
    for (var w = -620; w < 960; w += 42) s += R(w, -236, 16, 22, "#3a5a78", { rx: 6, sw: 0 });
    s += F("M1130 -262 L1195 -262 Q1215 -250 1222 -232 L1140 -232 Z", "#2a3a4a", { sw: 1.6 });
    s += R(1000, -270, 50, 112, "none", { rx: 8, sw: 2, st: "#9aa4ae" }) + R(-480, -262, 44, 100, "none", { rx: 8, sw: 2, st: "#9aa4ae" });
    s += F("M-760 -250 L-990 -205 L-1015 -222 L-820 -268 Z", "#d9dee4", { sw: 2 });
    // gear
    if (gear > 0.02) { var gl = 75 * gear; s += P("M0 -105 V" + f(-105 + gl), "#5a6068", 10) + C(-24, -105 + gl, 30 * gear, "#1e2226", { st: INK, sw: 2 }) + C(24, -105 + gl, 30 * gear, "#1e2226", { st: INK, sw: 2 }) + C(24, -105 + gl, 11 * gear, "#8a9098");
      s += P("M1060 -105 V" + f(-105 + 83 * gear), "#5a6068", 8) + C(1060, -105 + 83 * gear, 22 * gear, "#1e2226", { st: INK, sw: 2 });
      if (o.burst) { var bk = clamp(o.burst); for (var q = 0; q < 12; q++) { var a = hash(q + 50) * Math.PI - Math.PI, r = 30 + bk * (80 + hash(q) * 160); s += R(24 + Math.cos(a) * r, -30 + Math.sin(a) * r * 0.7, 18, 10, "#1e2226", { sw: 0, op: 1 - bk * 0.6 }); }
        s += C(24, -30, 90 * (1 - bk) + 20, "url(#fire)", { op: 1 - bk }); } }
    // near engine and wing
    s += F("M190 -150 L380 -150 L360 -126 L210 -126 Z", "#b9c1ca", { sw: 2 });
    s += F("M170 -150 L420 -150 Q436 -100 420 -50 L190 -50 Q140 -70 130 -100 Q140 -132 170 -150 Z", "url(#eng)", { sw: 2.6 });
    s += '<ellipse cx="422" cy="-100" rx="16" ry="50" fill="#2a2e34" stroke="' + INK + '" stroke-width="2.4"/>' + P("M415 -140 L428 -60", "#8a9098", 3);
    if (o.spin) for (var bl = 0; bl < 5; bl++) { var ya = -100 + 40 * Math.sin(t * 40 + bl * 1.26); s += P("M418 -100 L424 " + f(ya), "#9aa2ac", 2.6); }
    s += F("M440 -158 L-60 -150 L-640 -78 L-500 -70 Z", "url(#wingG)", { sw: 2.6 });
    s += P("M-640 -78 L-660 -110", "#5a6068", 5);
    if (o.fire) { var fk = clamp(o.fire); for (var fl = 0; fl < 6; fl++) { var ph = (t * 2.2 + fl / 6) % 1; s += C(260 - ph * 160 + Math.sin(t * 9 + fl) * 20, -150 - ph * 220, (70 - ph * 40) * fk, "url(#fire)", { op: 1 - ph * 0.6 }); }
      for (var sm = 0; sm < 7; sm++) { var p2 = (t * 0.6 + sm / 7) % 1; s += C(180 - p2 * 600, -300 - p2 * 520, (60 + p2 * 160) * fk, "#3a3a3e", { op: (1 - p2) * 0.55 * fk }); } }
    if (o.light) s += '<path d="M1250 -150 L2600 ' + f(-150 + 520) + ' L2600 ' + f(-150 - 220) + ' Z" fill="url(#beam)" opacity="' + f(clamp(o.light) * 0.8) + '"/>' + C(1240, -150, 40 * clamp(o.light), "url(#lamp)");
    if (o.navOn) s += C(-1005, -270, 22, Math.sin(t * 8) > 0 ? "url(#lampR)" : "none") + C(-640, -90, 20, "url(#lampR)");
    return s + '</g>'; }
  // the plane's pose along a take-off run: x from x0 at k=0 to x1 at k=1 with constant acceleration, rotate & lift after kr
  function takeoff(k, x0, x1, kr) { var x = lerp(x0, x1, k * k), up = clamp((k - kr) / (1 - kr)); return { x: x, y: RY - up * up * 700, pitch: Math.min(10, up * 30), gear: 1 - clamp((up - 0.5) * 3) }; }
  // engine suction: streaks curving into the intake, stones lifted from the ground ahead of it
  function suction(x, y, k, t, stones) { var s = ""; for (var i = 0; i < 9; i++) { var p = (t * 1.6 + i / 9) % 1, a = (i / 9 - 0.5) * 2.4, r = 260 * (1 - p) + 20;
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8; s += P("M" + f(px) + " " + f(py) + " q" + f(-Math.cos(a) * 30) + " " + f(-Math.sin(a) * 20) + " " + f(-Math.cos(a) * 60) + " " + f(-Math.sin(a) * 40), "#ffffff", 4, ' opacity="' + f(0.7 * k * p) + '"'); }
    if (stones) for (var j = 0; j < 7; j++) { var q = clamp(stones * 1.4 - j * 0.08), sx = x + 60 + j * 34, sy = GY - 10; var cx2 = lerp(sx, x + 8, ease(q)), cy2 = lerp(sy, y + 10 - 40 * Math.sin(q * Math.PI), ease(q)); if (q < 1) s += C(cx2, cy2, 7, "#8a7a68", { st: INK, sw: 1.6 }); }
    return s; }

  // ── the parts that arrive ──
  function windsock(t, k, x) { if (k <= 0) return ""; var h = 300 * ease(clamp(k * 1.6)), inf = clamp(k * 1.6 - 0.6), s = "", y0 = GY - 30, top = y0 - h;
    s += P("M" + x + " " + y0 + " V" + f(top), "#5a6068", 8) + C(x, top, 9, "#d8352a", { st: INK, sw: 2 });
    if (inf > 0) { var L = 180, wv = Math.sin(t * 7) * 6 * inf;
      for (var i = 0; i < 5; i++) { var a = x - i * L / 5 * inf, b = x - (i + 1) * L / 5 * inf, ha = 36 - i * 4, hb = 36 - (i + 1) * 4, yb = top + (1 - inf) * 60 * (i + 1) / 5 + wv * i / 4;
        s += F("M" + f(a) + " " + f(top - ha / 2 + (1 - inf) * 60 * i / 5) + " L" + f(b) + " " + f(yb - hb / 2) + " L" + f(b) + " " + f(yb + hb / 2) + " L" + f(a) + " " + f(top + ha / 2 + (1 - inf) * 60 * i / 5) + " Z", i % 2 ? "#f4f4f0" : "#f08a24", { sw: 2 }); } }
    return s; }
  function papiBox(x, y, col, k) { if (k <= 0) return ""; var sc = K.pop(k); return '<g transform="translate(' + x + ' ' + y + ') scale(' + f(sc) + ')">' + R(-16, -18, 32, 22, "#3a3f46", { rx: 4, sw: 2 }) + P("M-10 4 v10 M10 4 v10", "#5a6068", 4) + C(0, -7, 60, col === "w" ? "url(#lamp)" : "url(#lampR)", { op: 0.95 }) + C(0, -7, 7, col === "w" ? "#fff" : "#ff5a4a", { st: INK, sw: 1.4 }) + '</g>'; }
  function papi(t, k, cols) { var s = ""; for (var i = 0; i < 4; i++) s += papiBox(RW0 + 520 + i * 60, GY + 22, cols[i], clamp(k * 4 - i)); return s; }
  function tower(t, k, ctl) { if (k <= 0) return ""; var hgt = 1820 * ease(clamp(k * 1.25)), base = GY - 50, s = "", cab = clamp(k * 1.25 - 0.8) * 5;
    s += '<g filter="url(#sh)">' + R(TWX - 400, base - 160, 800, 160, "url(#towerG)", { sw: 3 }) + '</g>';
    for (var w = 0; w < 6; w++) s += R(TWX - 360 + w * 125, base - 120, 70, 60, "url(#glass)", { sw: 2 });
    s += '<g filter="url(#sh)">' + F("M" + (TWX - 120) + " " + base + " L" + (TWX - 90) + " " + f(base - hgt) + " L" + (TWX + 90) + " " + f(base - hgt) + " L" + (TWX + 120) + " " + base + " Z", "url(#towerG)", { sw: 3 }) + '</g>';
    for (var r = base - 300; r > base - hgt + 60; r -= 260) s += R(TWX - 30, r - 50, 60, 40, "#3a5a78", { rx: 4, sw: 1.6 });
    if (cab > 0) { var cy = base - hgt; s += '<g transform="translate(' + TWX + ' ' + f(cy) + ') scale(' + f(K.pop(clamp(cab))) + ')" filter="url(#sh)">' + F("M-260 0 L260 0 L230 30 L-230 30 Z", "#cfd3d8") + R(-300, -40, 600, 40, "#dfe3e8") + F("M-300 -40 L-330 -250 L330 -250 L300 -40 Z", "url(#glass)", { sw: 3 }) + (ctl || "") + P("M-200 -40 L-220 -250 M-70 -40 L-76 -250 M70 -40 L76 -250 M200 -40 L220 -250", INK, 4) + R(-340, -290, 680, 40, "#e9ebee") + P("M0 -290 V-420", "#5a6068", 6) + C(0, -420, 10, "#d8352a") + '</g>'; }
    return s; }
  function waves(x, y, t, k, dir) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 3; i++) { var p = (t * 1.2 + i / 3) % 1, r = 60 + p * 260; s += P("M" + f(x + dir * r * 0.5) + " " + f(y - r * 0.85) + " A" + f(r) + " " + f(r) + " 0 0 " + (dir > 0 ? 1 : 0) + " " + f(x + dir * r * 0.5) + " " + f(y + r * 0.85), "#ffd23a", 8, ' opacity="' + f((1 - p) * k) + '"'); } return s; }
  function station(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k * 3)) + '" transform="translate(0 ' + f((1 - ease(clamp(k * 1.5))) * 120) + ')">', x = FSX - 400, y = GY - 50;
    s += '<g filter="url(#sh)">' + R(x, y - 420, 800, 420, "#e9e2d4") + '</g>' + R(x - 20, y - 450, 840, 40, "url(#redT)");
    for (var d = 0; d < 3; d++) s += R(x + 40 + d * 250, y - 300, 210, 300, d === 1 && k > 0.4 ? "#2a2e34" : "url(#redT)", { sw: 2.4 }) + (d === 1 && k > 0.4 ? "" : P("M" + (x + 40 + d * 250) + " " + (y - 240) + " h210 M" + (x + 40 + d * 250) + " " + (y - 180) + " h210 M" + (x + 40 + d * 250) + " " + (y - 120) + " h210 M" + (x + 40 + d * 250) + " " + (y - 60) + " h210", "#8a2418", 3));
    s += R(x + 300, y - 400, 200, 70, "#fff", { rx: 8, sw: 2 }) + T("مطافي", x + 400, y - 352, 46, "#c7321f");
    return s + '</g>'; }
  function firetruck(x, fc, t, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + (GY - 8) + ') scale(' + fc + ' 1)" filter="url(#sh)">';
    s += R(-300, -190, 470, 160, "url(#redT)", { rx: 14 }) + F("M170 -190 L260 -190 L300 -120 L300 -30 L170 -30 Z", "url(#redT)") + F("M184 -176 L250 -176 L282 -120 L184 -120 Z", "url(#glass)", { sw: 2 });
    s += R(-300, -100, 600, 14, "#f4f4f0", { sw: 0 }) + R(-240, -230, 180, 40, "#c9ced4", { rx: 6 }) + R(140, -214, 60, 22, Math.sin(t * 12) > 0 ? "#3a8aff" : "#ff3a2a", { rx: 6, sw: 2 });
    [-200, -70, 200].forEach(function (wx) { s += C(wx, -26, 34, "#1e2226", { st: INK, sw: 2 }) + C(wx, -26, 13, "#8a9098"); });
    s += P("M-150 -230 L-40 -270", "#5a6068", 12);
    return s + '</g>'; }
  function spray(x0, y0, x1, y1, t, k) { if (k <= 0) return ""; var s = "", mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 420; for (var i = 0; i < 16; i++) { var p = (t * 1.5 + i / 16) % 1; if (p > k) continue; var a = 1 - p, x = a * a * x0 + 2 * a * p * mx + p * p * x1, y = a * a * y0 + 2 * a * p * my + p * p * y1; s += C(x, y, 22 + p * 18, "#cfeaff", { st: "#5aa8e0", sw: 2, op: 0.85 }); } return s; }
  function sweeper(x, t, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + (GY - 10) + ')" filter="url(#sh)">';
    s += R(-130, -90, 180, 64, "#f2c230", { rx: 10 }) + F("M50 -90 L110 -90 L140 -50 L140 -26 L50 -26 Z", "#f2c230") + F("M60 -82 L104 -82 L126 -52 L60 -52 Z", "url(#glass)", { sw: 2 });
    s += R(80, -104, 30, 14, Math.sin(t * 10) > 0 ? "#ff9a2a" : "#a85a10", { rx: 5, sw: 2 }) + T("FOD", -40, -46, 30, "#2a2522");
    s += C(-80, -22, 24, "#1e2226", { st: INK, sw: 2 }) + C(90, -22, 24, "#1e2226", { st: INK, sw: 2 });
    var a = t * 600; s += '<g transform="translate(-150 -20) rotate(' + f(a) + ')">' + C(0, 0, 26, "#5a8aa8", { st: INK, sw: 2 }) + P("M-26 0 H26 M0 -26 V26 M-18 -18 L18 18 M18 -18 L-18 18", "#2a3a4a", 3) + '</g>';
    return s + '</g>'; }
  function strip(x, k, t) { if (k <= 0) return ""; return '<g opacity="' + f(k) + '">' + F("M" + (x - 22) + " " + (GY - 30) + " l40 -6 l6 6 l-40 6 Z", "#c9ced4", { sw: 2 }) + P("M" + (x - 14) + " " + (GY - 33) + " l24 -4", "#fff", 2, ' opacity="' + f(0.5 + 0.5 * Math.sin(t * 6)) + '"') + '</g>'; }
  function wall(k, x) { if (k <= 0) return ""; return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x, GY - 220, 70, 200, "url(#towerG)", { sw: 3 }) + P("M" + x + " " + (GY - 170) + " h70 M" + x + " " + (GY - 120) + " h70 M" + x + " " + (GY - 70) + " h70", "#8a8f96", 2) + '</g>'; }
  function emas(k, crush, xc) { if (k <= 0) return ""; var s = "", n = 15, cw = (EM1 - RWL) / n;
    for (var i = 0; i < n; i++) { var kk = clamp(k * (n + 4) / 4 - i * 0.25), x = RWL + i * cw; if (kk <= 0) continue; var sink = crush && x < xc ? clamp((xc - x) / 300) : 0;
      s += '<g opacity="' + f(kk) + '">' + R(x, GY - 50 + sink * 20, cw - 4, 44 - sink * 20, "url(#emas)", { sw: 2 }) + R(x + 6, GY - 44 + sink * 20, cw - 16, 8, "#f6f2e6", { sw: 0, op: 0.7 }) + '</g>';
      if (sink > 0) for (var c = 0; c < 4; c++) s += C(x + 10 + c * 12, GY - 34 + sink * 18 - hash(i * 4 + c) * 20, 5, "#d8d0bc", { st: "#8a8270", sw: 1.4 }); }
    s += R(RWL, GY - 4, EM1 - RWL, 24, "url(#slab)", { sw: 2, op: clamp(k * 2) });
    return s; }
  function terminal(t, k) { if (k <= 0) return ""; var s = '<g transform="translate(0 ' + f((1 - ease(k)) * 200) + ')" opacity="' + f(clamp(k * 3)) + '">', y = GY - 50;
    s += '<g filter="url(#sh)">' + R(TERM0, y - 420, TERM1 - TERM0, 420, "#e9e6de") + '</g>' + F("M" + (TERM0 - 40) + " " + (y - 420) + " Q" + ((TERM0 + TERM1) / 2) + " " + (y - 620) + " " + (TERM1 + 40) + " " + (y - 420) + " Z", "url(#glass)", { sw: 3 });
    for (var w = 0; w < 9; w++) s += R(TERM0 + 30 + w * 125, y - 380, 100, 260, "url(#glass)", { sw: 2 });
    s += R(TERM0 + 380, y - 470, 420, 70, "#fff", { rx: 10, sw: 2 }) + T("صالة السفر", TERM0 + 590, y - 420, 44, "#2a5f92");
    return s + '</g>'; }
  function bridge(k, xd) { if (k <= 0) return ""; var x0 = TERM1, x1 = lerp(x0 + 60, xd, ease(k)), y = GY - 270; return '<g filter="url(#sh)">' + R(x0, y - 70, x1 - x0, 110, "#cfd3d8", { sw: 3, rx: 6 }) + P("M" + f(x0 + 40) + " " + (y - 10) + " H" + f(x1 - 30), "#9aa2ac", 4) + P("M" + f(x1 - 60) + " " + (y + 40) + " V" + (GY - 40), "#5a6068", 12) + C(x1 - 60, GY - 34, 16, "#1e2226") + '</g>'; }
  function tanks(k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 2; i++) { var kk = clamp(k * 2 - i * 0.5), x = -3900 + i * 380, h = 320 * ease(kk); if (kk <= 0) continue;
      s += '<g filter="url(#sh)">' + R(x, GY - 50 - h, 320, h, "url(#towerG)", { sw: 3 }) + '</g>' + '<ellipse cx="' + (x + 160) + '" cy="' + f(GY - 50 - h) + '" rx="160" ry="26" fill="#e9ebee" stroke="' + INK + '" stroke-width="3"/>' + (kk > 0.8 ? T("وقود", x + 160, GY - 50 - h / 2, 52, "#c7321f") : ""); }
    return s; }

  // ── HUD cards (screen space): speedometer, top-view runway map, stopwatch, PAPI close-up ──
  function card(x, y, w, h, k, inner) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(K.pop(k)) + ')" filter="url(#sh)">' + R(-w / 2, -h / 2, w, h, "#f6f1e6", { rx: 26, sw: 5 }) + inner + '</g>'; }
  function speedo(v, k, ok) { var a = (-120 + 240 * clamp(v / 350)) * Math.PI / 180, inner = '<circle r="130" fill="#1e2226" stroke="#555" stroke-width="6" transform="translate(0 -10)"/>';
    for (var i = 0; i <= 7; i++) { var b = (-120 + i * 240 / 7) * Math.PI / 180; inner += P("M" + f(Math.sin(b) * 104) + " " + f(-10 - Math.cos(b) * 104) + " L" + f(Math.sin(b) * 122) + " " + f(-10 - Math.cos(b) * 122), "#fff", 4); }
    var g = (-120 + 240 * 300 / 350) * Math.PI / 180; inner += P("M" + f(Math.sin(g) * 92) + " " + f(-10 - Math.cos(g) * 92) + " L" + f(Math.sin(g) * 126) + " " + f(-10 - Math.cos(g) * 126), "#5ad07a", 10);
    inner += P("M0 -10 L" + f(Math.sin(a) * 100) + " " + f(-10 - Math.cos(a) * 100), ok ? "#5ad07a" : "#ff5a4a", 9) + C(0, -10, 14, "#ddd") + T(arab(Math.round(v)), 0, 70, 52, "#fff") + T("كم/س", 0, 108, 26, "#bbb", { w: 700 });
    return card(830, 360, 300, 330, k, inner); }
  function arab(n) { return String(n).replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function stopwatch(sec, k) { var a = sec / 180 * 2 * Math.PI, inner = C(0, 10, 110, "#fff", { st: INK, sw: 6 }) + R(-18, -124, 36, 22, "#5a6068", { rx: 4 });
    inner += '<path d="M0 10 L0 -100 A110 110 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(Math.sin(a) * 110) + ' ' + f(10 - Math.cos(a) * 110) + ' Z" fill="' + (sec < 180 ? "#5ad07a" : "#ff5a4a") + '" opacity=".55"/>';
    inner += P("M0 10 L" + f(Math.sin(a) * 90) + " " + f(10 - Math.cos(a) * 90), INK, 7) + T(arab(Math.floor(sec / 60)) + ":" + arab(("0" + Math.floor(sec % 60)).slice(-2)), 0, 168, 44, INK);
    return card(840, 380, 280, 400, k, inner); }
  // top-view: runway bar (length 0…1 of the card, angle deg), a plane icon at position p along it, drift, wind arrows
  function mapCard(k, o) { if (k <= 0) return ""; var inner = R(-400, -260, 800, 520, "#e8d4a8", { rx: 20, sw: 0 }), L = 640 * (o.len == null ? 1 : o.len), ang = o.ang || 0;
    if (o.wind) for (var i = 0; i < 4; i++) { var p = ((o.t || 0) * 0.8 + i / 4) % 1, x = -300 + i * 200; inner += K.arrowV(x, -240 + p * 80, -150 + p * 80, "#2f6f9f", 10, 1); }
    inner += '<g transform="rotate(' + f(ang) + ')">' + R(-L / 2, -40, L, 80, "#5c6066", { sw: 3 }) + P("M" + f(-L / 2 + 40) + " 0 H" + f(L / 2 - 40), "#fff", 5, ' stroke-dasharray="30 26"');
    var px = -L / 2 + 50 + (L - 100) * clamp(o.p || 0), py = o.drift || 0;
    inner += '<g transform="translate(' + f(px) + ' ' + f(py) + ') rotate(' + f(o.yaw || 0) + ')">' + F("M40 0 L-30 -8 L-40 0 L-30 8 Z M10 0 L-10 -46 L-22 -46 L-12 0 L-22 46 L-10 46 Z M-30 0 L-42 -18 L-48 -18 L-44 0 L-48 18 L-42 18 Z", "#fff", { sw: 2.4 }) + '</g></g>';
    if (o.label) inner += T(o.label, 0, 228, 50, "#2a2522");
    return card(540, 470, 820, 540, k, inner); }
  function papiCard(k, cols, ok) { if (k <= 0) return ""; var inner = R(-330, -110, 660, 220, "#1a2030", { rx: 20, sw: 0 }); for (var i = 0; i < 4; i++) inner += C(-210 + i * 140, -10, 70, cols[i] === "w" ? "url(#lamp)" : "url(#lampR)") + C(-210 + i * 140, -10, 30, cols[i] === "w" ? "#fff" : "#ff4a3a", { st: INK, sw: 3 });
    inner += T(ok === 1 ? "مظبوط ✓" : ok === 2 ? "واطي!" : "عالي!", 0, 88, 40, ok === 1 ? "#7cf2a0" : "#ff8a7a");
    return card(540, 380, 700, 260, k, inner); }

  // ── the whole scene ──
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o), night = h.night;
    var s = K.sky(t, night) + dunes(night) + K.ground(t);
    if (night) s += R(-4200, GY, 15600, 2800, "#0a1020", { sw: 0, op: 0.5 });
    s += sandFace(night, h.bumps || 0, t);
    s += tanks((h.tanks != null ? h.tanks : b.tanks) || 0) + terminal(t, (h.terminal != null ? h.terminal : b.terminal) || 0);
    s += tower(t, (h.tower != null ? h.tower : b.tower) || 0, h.ctl) + station(t, (h.station != null ? h.station : b.station) || 0);
    if (b.sock || h.sock) s += windsock(t, h.sock || 1, RW0 + 1500);
    s += runway(t, b, h) + emas((h.emas != null ? h.emas : b.emas) || 0, h.crush, h.crushX);
    if (b.lights || h.lights) s += runLights(t, h.lights || 1, b.long || h.rwe > RWS ? RWL : RWS, night);
    if (b.papi || h.papi) s += papi(t, h.papi || 1, h.papiCols || ["w", "w", "r", "r"]);
    return s; }

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[3, { slab: 1 }], [5, { layers: 1 }], [9, { long: 1 }], [11, { sock: 1 }], [13, { lights: 1 }], [15, { papi: 1 }], [17, { tower: 1 }], [19, { station: 1 }], [22, { emas: 1 }], [23, { terminal: 1, tanks: 1 }]]);
  var VEST = { vest: 1, hat: 1 };
  function M(o) { return Object.assign({ y: MY, f: 1 }, o); }
  function mv(o) { return Object.assign(M(o), VEST); }

  // 0 — scrape a strip of desert flat and land a plane on it: an airport
  shot(0, [1500, GY - 60, 2.6], [2200, GY - 420, 0.5], function (u, d, t) {
    var fl = ease(clamp(u / 1.6)), s = scene(t, {}, { bumps: 1 - fl }), w = "";
    var a = clamp((u - 1.0) / 2.0), lx = lerp(-2400, 2000, ease(a)), ly = lerp(RY - 1100, RY, ease(clamp(a * 1.15))), roll = clamp((u - 3.0) / 1.2);
    s += plane(a < 1 ? lx : lerp(2000, 2700, ease(roll)), Math.min(RY, ly), 1, { t: t, pitch: a < 0.9 ? 4 : 2 * (1 - roll), shadow: clamp(1 - (RY - ly) / 900), spin: 1 });
    s += act(u, [[0, M({ x: 1360, p: "push", mood: "n" })], [1.6, M({ x: 1560, p: "point", mood: "n" })], [2.6, M({ x: 1560, p: "pointUp", mood: "happy" })], [3.4, M({ x: 1560, p: "thumbs", mood: "happy" })]], t);
    w += hp("أرض ممسوحة", 1650, GY - 140, u, 0.9, YEL) + hp("مطار!", 2400, RY - 700, u, 3.2, GRN);
    return s + HUD + w;
  });
  // 1 — but the engine sucks in gravel and dust: one stone can break a blade inside it
  shot(1, [3050, GY - 120, 2.4], [3120, GY - 110, 2.7], function (u, d, t) {
    var s = scene(t, {}, { bumps: 0.6 }), w = "", brk = clamp((u - 2.6) / 0.4);
    s += plane(2700, RY, 1, { t: t, spin: 1 }) + suction(2700 + 422, RY - 100, clamp(u / 0.6), t, clamp((u - 0.8) / 1.8));
    if (brk > 0) { for (var i = 0; i < 6; i++) { var p = clamp(brk + i * 0.05); s += P("M" + f(3110 - p * (120 + i * 30)) + " " + f(RY - 100 + (i - 3) * 14) + " l-14 " + f((i - 3) * 3), "#ffd23a", 4, ' opacity="' + f(1 - p) + '"'); } s += C(3125, RY - 100, 70 * (1 - brk) + 10, "url(#fire)", { op: 1 - brk * 0.5 }); }
    s += act(u, [[0, M({ x: 2880, f: 1, p: "stand", mood: "n" })], [0.8, M({ x: 2880, f: 1, p: "cover", mood: "worry" })], [2.7, M({ x: 2870, f: 1, p: "shock", mood: "shock" })]], t);
    w += hp("زلط!", 3330, GY - 60, u, 1.2, RED) + hx(3125, RY - 100, u, 2.8, 1) + hp("ريشة اتكسرت!", 3150, RY - 300, u, 3.0, RED);
    return s + HUD + w;
  });
  // 2 — so you cover the ground with a smooth concrete runway, not a single stone on it
  shot(2, [2600, GY - 120, 1.1], [2600, GY - 200, 0.8], function (u, d, t) {
    var k = ease(clamp((u - 0.2) / 2.0)), s = scene(t, {}, { slab: 1, slabK: k, bumps: 0.6 * (1 - k) }), w = "";
    s += plane(2700, RY, 1, { t: t });
    s += act(u, [[0, M({ x: 1900, p: "push", mood: "n" })], [2.0, M({ x: 2250, p: "push", mood: "n" })], [2.5, M({ x: 2250, p: "thumbs", mood: "happy" })]], t);
    w += hp("ممر خرسانة", 2500, GY - 160, u, 0.8, YEL) + hv(2300, GY - 260, u, 2.6);
    return s + HUD + w;
  });
  // 3 — but a big jet can weigh 560 tonnes, and a thin slab cracks under it
  shot(3, [2900, GY - 200, 1.3], [3000, GY - 80, 2.0], function (u, d, t) {
    var cr = clamp((u - 1.8) / 1.6), s = scene(t, {}, { crack: cr }), w = "";
    s += plane(2950, RY + cr * 8, 1, { t: t, pitch: -cr * 0.3 });
    s += act(u, [[0, M({ x: 3250, f: -1, p: "point", mood: "n" })], [1.6, M({ x: 3250, f: -1, p: "worry", mood: "worry" })], [3.0, M({ x: 3270, f: -1, p: "shock", mood: "shock" })]], t);
    w += hp("٥٦٠ طن", 3150, RY - 380, u, 0.4, RED) + hx(3000, GY - 10, u, 3.2, 1);
    return s + HUD + w;
  });
  // 4 — so you build it in layers: packed gravel below, concrete about 40 cm thick on top
  shot(4, [1500, GY + 30, 2.6], [1650, GY + 10, 2.2], function (u, d, t) {
    var lp = ease(clamp((u - 0.3) / 1.4)), lg = ease(clamp((u - 1.8) / 1.2)), lc = ease(clamp((u - 3.1) / 1.4)), s = scene(t, {}, { layers: 1, layK: { packed: lp, gravel: lg, conc: lc } }), w = "";
    if (u > 0.5 && u < 2.0) { var rx = lerp(1280, 1900, clamp((u - 0.5) / 1.5)); s += C(rx, GY + 4, 46, "#e2b035", { st: INK, sw: 3 }) + C(rx, GY + 4, 14, "#5a6068") + P("M" + f(rx) + " " + (GY + 4) + " L" + f(rx - 70) + " " + (GY - 70), "#5a6068", 8); }
    s += act(u, [[0, M({ x: 1400, p: "stand", mood: "n" })], [0.4, M({ x: 1400, p: "crouch", mood: "n" })], [4.6, M({ x: 1400, p: "point", mood: "n" })], [5.4, M({ x: 1400, p: "thumbs", mood: "happy" })]], t);
    if (lc > 0.9) { var q1 = sp(1720, GY - 2), q2 = sp(1720, GY + 20); w += P("M" + f(q1[0]) + " " + f(q1[1]) + " V" + f(q2[1]), "#ffd23a", 6) + P("M" + f(q1[0] - 18) + " " + f(q1[1]) + " h36 M" + f(q1[0] - 18) + " " + f(q2[1]) + " h36", "#ffd23a", 6); }
    w += hp("أرض مدكوكة", 1520, GY + 74, u, 1.0, { down: false, sz: 36 }) + hp("زلط", 1480, GY + 34, u, 2.4, { down: false, sz: 36 }) + hp("٤٠ سم خرسانة", 1700, GY - 90, u, 4.4, YEL);
    return s + HUD + w;
  });
  // 5 — but a small metal strip on the runway burst Concorde's tyre in 2000, the first step of its crash
  shot(5, [3500, GY - 200, 1.3], [3700, GY - 260, 1.0], function (u, d, t) {
    var a = clamp((u - 0.9) / 2.6), px = lerp(1800, 4600, a * a), bu = px > 3600 ? clamp((px - 3600) / 600) : 0, s = scene(t, {}, {}), w = "";
    s += strip(3600, bu > 0 ? 0 : 1, t) + plane(px, RY, 1, { t: t, spin: 1, burst: bu });
    if (bu > 0) s += C(3600, RY - 40, 260 * bu, "#3a3a3e", { op: 0.4 * (1 - bu) });
    s += act(u, [[0, M({ x: 3420, p: "point", mood: "n" })], [1.4, M({ x: 3420, p: "worry", mood: "worry" })], [2.8, M({ x: 3400, p: "shock", mood: "shock" })]], t);
    w += hp("حتة حديد", 3600, GY - 100, u, 0.3, RED) + hp("كونكورد ٢٠٠٠", 3600, RY - 420, u, 3.1, RED);
    var sh = bu > 0 && bu < 0.6 ? Math.sin(t * 60) * 8 : 0;
    return '<g transform="translate(' + f(sh) + ' 0)">' + s + '</g>' + HUD + w;
  });
  // 6 — so trucks patrol the runway several times a day and pick up anything on it
  shot(6, [3500, GY - 120, 2.1], [3700, GY - 120, 2.0], function (u, d, t) {
    var x = lerp(2900, 4100, ease(clamp(u / 2.6))), s = scene(t, {}, {}), w = "";
    s += strip(3600, x - 150 > 3600 ? 0 : 1, t) + sweeper(x, t);
    s += act(u, [[0, mv({ x: 3300, p: "stand", mood: "n" })], [2.4, mv({ x: 3700, p: "point", mood: "n" })], [3.0, mv({ x: 3700, p: "thumbs", mood: "happy" })]], t);
    w += hp("عربية تفتيش", x, GY - 200, u, 0.4, YEL) + hv(3600, GY - 120, u, 2.2, 0.9);
    return s + HUD + w;
  });
  // 7 — but a big jet needs about 300 km/h to lift off (on the short runway it runs out)
  shot(7, [3000, GY - 500, 0.55], [3900, GY - 500, 0.6], function (u, d, t) {
    var a = clamp(u / 3.0), px = lerp(1300, RWS - 1200 + 300, a * a), v = 300 * 0.72 * Math.min(1, a * 1.1), s = scene(t, {}, {}), w = "";
    s += plane(px, RY, 1, { t: t, spin: 1 });
    s += act(u, [[0, M({ x: 4400, f: -1, p: "stand", mood: "n" })], [1.6, M({ x: 4400, f: -1, p: "worry", mood: "worry" })], [2.8, M({ x: 4400, f: -1, p: "shock", mood: "shock" })]], t);
    w += speedo(v, clamp(u / 0.3), false) + hx(RWS, GY - 60, u, 2.4, 1.1) + hp("الممر خلص!", RWS, GY - 320, u, 2.6, RED);
    return s + HUD + w;
  });
  // 8 — so you stretch the runway to 3 or 4 km
  shot(8, [4600, GY - 900, 0.36], [5200, GY - 900, 0.36], function (u, d, t) {
    var k = ease(clamp(u / 1.0)), s = scene(t, {}, { rwe: lerp(RWS, RWL, k) }), w = "", a = clamp((u - 0.7) / 2.6), p = takeoff(a, 1300, 7600, 0.62);
    s += plane(p.x, p.y, 1, { t: t, spin: 1, pitch: p.pitch, gear: p.gear, shadow: clamp(1 - (RY - p.y) / 700) });
    s += act(u, [[0, M({ x: 5400, f: -1, p: "point", mood: "n" })], [2.2, M({ x: 5400, f: -1, p: "cheer", mood: "happy" })]], t);
    w += (u > 3.0 ? speedo(Math.min(300, 320 * Math.min(1, a / 0.66)), clamp((u - 3.0) / 0.3), a > 0.6) : "") + mapCard(clamp((u - 0.1) / 0.3) * (u < 2.6 ? 1 : clamp((3.2 - u) / 0.4)), { len: lerp(0.35, 1, k), p: a, label: k > 0.9 ? "٣ – ٤ كيلو" : "١ كيلو" });
    return s + HUD + w;
  });
  // 9 — but a crosswind pushes the plane off the runway (top view)
  shot(9, [2800, GY - 260, 1.0], [2900, GY - 240, 1.15], function (u, d, t) {
    var s = scene(t, {}, {}), w = "";
    for (var i = 0; i < 10; i++) { var p = (t * 1.3 + i / 10) % 1; s += P("M" + f(2200 + i * 130) + " " + f(GY - 800 + p * 600) + " l" + f(-20) + " 80", "#ffffff", 6, ' opacity="' + f(0.6 * (1 - p)) + '"'); }
    s += plane(2600, RY, 1, { t: t, spin: 1 });
    s += act(u, [[0, M({ x: 3150, f: -1, p: "stand", mood: "n" })], [0.8, M({ x: 3150, f: -1, p: "collar", mood: "worry" })], [2.4, M({ x: 3160, f: -1, p: "shock", mood: "shock" })]], t);
    var a = clamp((u - 0.6) / 2.6); w += mapCard(clamp(u / 0.3), { wind: 1, t: t, p: a, drift: 150 * a * a, yaw: 20 * a, label: "ريح من الجنب" });
    if (a > 0.85) w += K.xmark(540 + 200, 470 + 120, u, 2.9, 1.1);
    return s + HUD + w;
  });
  // 10 — so you point the runway into the wind and put an orange sock beside it: the windsock
  shot(10, [2600, GY - 260, 1.4], [2500, GY - 220, 1.8], function (u, d, t) {
    var s = scene(t, {}, { sock: clamp((u - 2.2) / 1.6) }), w = "";
    for (var i = 0; i < 8; i++) { var p = (t * 1.1 + i / 8) % 1; s += P("M" + f(2900 - p * 900) + " " + f(GY - 520 + i * 40) + " l-90 0", "#ffffff", 5, ' opacity="' + f(0.55 * (1 - p)) + '"'); }
    s += act(u, [[0, M({ x: 2350, p: "stand", mood: "n" })], [2.2, M({ x: 2350, p: "push", mood: "n" })], [3.6, M({ x: 2320, p: "pointUp", mood: "happy" })], [4.6, M({ x: 2320, p: "thumbs", mood: "happy" })]], t);
    var ang = -90 * ease(clamp((u - 0.4) / 1.4)); w += mapCard(clamp(u / 0.3) * clamp((2.4 - u) / 0.3), { wind: 1, t: t, ang: ang, p: clamp((u - 1.6) / 0.8), label: "مع اتجاه الريح ✓" });
    w += hp("كُم الريح", RW0 + 1420, GY - 420, u, 3.4, YEL) + hring(RW0 + 1420, GY - 330, 90, u, 3.0, t);
    return s + HUD + w;
  });
  // 11 — but at night the pilot can't see the runway at all
  shot(11, [2400, GY - 400, 0.6], [2700, GY - 360, 0.75], function (u, d, t) {
    var s = scene(t, {}, { night: 1 }), w = "", a = clamp(u / 2.8);
    s += plane(lerp(-1500, 1200, a), lerp(RY - 1300, RY - 600, a), 1, { t: t, pitch: 3, light: 1, navOn: 1, shadow: 0 });
    s += act(u, [[0, M({ x: 3000, f: -1, p: "stand", mood: "n" })], [1.0, M({ x: 3000, f: -1, p: "worry", mood: "worry" })], [2.2, M({ x: 3000, f: -1, p: "shrug", mood: "worry" })]], t);
    w += hp("الممر فين؟", 2700, GY - 260, u, 1.0, RED);
    return s + HUD + w;
  });
  // 12 — so you plant lights along both sides of the runway and down its middle
  shot(12, [2600, GY - 300, 0.6], [3400, GY - 300, 0.55], function (u, d, t) {
    var lk = clamp((u - 0.3) / 2.2), s = scene(t, {}, { night: 1, lights: Math.max(0.001, lk) }), w = "", a = clamp(u / 3.4);
    s += plane(lerp(1200, 2600, a), lerp(RY - 600, RY - 160, a), 1, { t: t, pitch: 3, light: 1, navOn: 1, shadow: 0 });
    s += act(u, [[0, M({ x: 3000, f: -1, p: "point", mood: "n" })], [1.8, M({ x: 3000, f: -1, p: "cheer", mood: "happy" })]], t);
    w += hp("لمبات الممر", 3800, GY - 200, u, 1.4, YEL);
    return s + HUD + w;
  });
  // 13 — but coming down, the pilot can't tell if he's too high or too low
  shot(13, [1400, GY - 500, 0.55], [1500, GY - 520, 0.6], function (u, d, t) {
    var s = scene(t, {}, { night: 1 }), w = "", a = clamp(u / 3.0), hi = Math.sin(u * 2.6);
    var q1 = sp(-1200, RY - 1200), q2 = sp(RW0 + 600, RY);
    s += P("M-1400 " + (RY - 1500) + " L" + (RW0 + 600) + " " + RY, "#ffffff", 6, ' stroke-dasharray="30 30" opacity=".35"') + P("M-1400 " + (RY - 600) + " L" + (RW0 + 600) + " " + RY, "#ffffff", 6, ' stroke-dasharray="30 30" opacity=".35"');
    s += plane(lerp(-1400, 200, a), lerp(RY - 1000, RY - 520, a) + hi * 260, 1, { t: t, pitch: 3 + hi * 3, light: 1, navOn: 1, shadow: 0 });
    s += act(u, [[0, M({ x: 2000, f: -1, p: "stand", mood: "n" })], [0.9, M({ x: 2000, f: -1, p: "shrug", mood: "worry" })]], t);
    w += K.pill(hi > 0 ? "واطي؟" : "عالي؟", 540, 520, u, 0.6, { sz: 52, bg: "#c7321f" });
    return s + HUD + w;
  });
  // 14 — so you put four lights by the runway: two white and two red means on the right path — the PAPI lights
  shot(14, [1600, GY - 60, 2.4], [700, GY - 450, 0.62], function (u, d, t) {
    var st = u < 2.0 ? 1 : u < 3.4 ? 0 : u < 4.6 ? 2 : 1, cols = st === 0 ? ["w", "w", "w", "w"] : st === 2 ? ["r", "r", "r", "r"] : ["w", "w", "r", "r"];
    var s = scene(t, {}, { night: 1, papi: Math.max(0.001, clamp((u - 0.3) / 1.2)), papiCols: u < 2.0 ? ["w", "w", "r", "r"] : cols }), w = "", a = clamp((u - 2.0) / 5.0);
    s += P("M-2400 " + f(RY - 0.42 * (RW0 + 1600 + 2400)) + " L" + (RW0 + 600) + " " + RY, "#5ad07a", 7, ' stroke-dasharray="40 26" opacity="' + f(clamp((u - 4.6) / 0.4)) + '"');
    var gx = lerp(-1800, 400, a), gy = RY - 0.42 * (RW0 + 600 - gx) + (st === 0 ? -260 : st === 2 ? 220 : 0) * clamp((u - 2.0) / 0.6) * (u < 4.6 ? 1 : clamp((5.2 - u) / 0.6));
    if (u > 1.6) s += plane(gx, gy, 1, { t: t, pitch: 3, light: 1, navOn: 1, shadow: 0 });
    s += act(u, [[0, M({ x: RW0 + 450, p: "crouch", mood: "n" })], [1.5, M({ x: RW0 + 420, p: "point", mood: "n" })], [5.0, M({ x: RW0 + 420, p: "thumbs", mood: "happy" })]], t);
    if (u > 2.0) w += papiCard(clamp((u - 2.0) / 0.3), cols, st === 1 ? 1 : st === 2 ? 2 : 0);
    w += hp("لمبات بابي", RW0 + 610, GY - 70, u, 0.9, YEL) + (u > 4.8 ? K.vmark(860, 300, u, 4.8, 1) : "");
    return s + HUD + w;
  });
  // 15 — but with more planes, two can end up on the runway at the same moment
  shot(15, [2600, GY - 700, 0.4], [2800, GY - 600, 0.45], function (u, d, t) {
    var s = scene(t, {}, {}), w = "", a = clamp(u / 3.6);
    s += plane(lerp(2400, 3400, a), RY, 1, { t: t, spin: 1 });
    s += plane(lerp(-300, 1500, a), lerp(RY - 900, RY - 140, a), 1, { t: t, pitch: 3, shadow: 0 });
    s += act(u, [[0, M({ x: 3700, f: -1, p: "stand", mood: "n" })], [1.2, M({ x: 3700, f: -1, p: "worry", mood: "worry" })], [2.6, M({ x: 3700, f: -1, p: "cover", mood: "shock" })]], t);
    w += hx(2000, RY - 400, u, 2.2, 1.2) + hp("خطر!", 2000, RY - 700, u, 2.4, RED);
    return s + HUD + w;
  });
  // 16 — so you build a tall glass tower that gives every plane its turn by radio: the control tower
  shot(16, [600, GY - 900, 0.42], [TWX, GY - 1880, 1.3], function (u, d, t) {
    var tk = clamp((u - 0.2) / 2.4), ctl = R(-78, -62, 28, 22, "#5a6068", { sw: 1.5 }) + R(-36, -74, 70, 34, "#3a3f46", { sw: 1.5 }) + R(-30, -94, 30, 20, "#7ac8ff", { sw: 1.2 }) + act(u, [[0, { x: -60, y: -40, f: 1, p: "sitDesk", mood: "n", s: 0.25 }], [3.8, { x: -60, y: -40, f: 1, p: "point", mood: "happy", s: 0.25 }]], t);
    var s = scene(t, {}, { tower: tk, ctl: ctl }), w = "", a = clamp(u / 5.9);
    s += plane(lerp(3400, 4600, a), RY, 1, { t: t, spin: 1 });
    var gy = RY - 300 - (u > 2.4 ? 900 * ease(clamp((u - 2.4) / 3)) : 0); s += plane(lerp(600, 3600, a), gy, 1, { t: t, pitch: u > 2.4 ? 9 : 3, gear: u > 3 ? 0 : 1, shadow: 0 });
    s += waves(TWX + 340, GY - 1990, t, clamp((u - 2.2) / 0.4), 1);
    s += act(u, [[0, M({ x: TWX + 500, f: -1, p: "stand", mood: "n" })], [2.6, M({ x: TWX + 500, f: -1, p: "pointUp", mood: "happy" })], [4.0, M({ x: TWX + 500, f: -1, p: "thumbs", mood: "happy" })]], t);
    w += hp("برج المراقبة", TWX, GY - 2420, u, 2.6, YEL) + hp("استنّى دورك!", lerp(600, 3600, a), gy - 420, u, 2.4, YEL);
    return s + HUD + w;
  });
  // 17 — but if a plane catches fire, every second counts
  shot(17, [3300, GY - 300, 0.95], [3300, GY - 260, 1.1], function (u, d, t) {
    var s = scene(t, {}, {}), w = "";
    s += plane(3000, RY, 1, { t: t, fire: clamp(u / 0.6) });
    s += act(u, [[0, M({ x: 3560, f: -1, p: "stand", mood: "n" })], [0.5, M({ x: 3600, f: -1, p: "shock", mood: "shock" })]], t);
    w += stopwatch(u * 6, clamp((u - 0.8) / 0.3)) + hp("حريقة!", 3260, RY - 520, u, 0.5, RED);
    return s + HUD + w;
  });
  // 18 — so you build a fire station inside the airport that reaches any spot on the runway in under 3 minutes
  shot(18, [FSX, GY - 400, 0.62], [3800, GY - 320, 0.75], function (u, d, t) {
    var sk = clamp((u + 0.0) / 0.8), tx = lerp(FSX, 4500, ease(clamp((u - 0.9) / 1.8))), sp2 = clamp((u - 2.8) / 0.6), fire = 1 - clamp((u - 3.0) / 1.6);
    var s = scene(t, {}, { station: sk }), w = "";
    s += plane(3000, RY, 1, { t: t, fire: fire });
    s += firetruck(tx, -1, t) + spray(tx - 260, GY - 280, 3300, RY - 130, t, sp2);
    s += act(u, [[0, M({ x: 3900, f: 1, p: "worry", mood: "worry" })], [3.0, M({ x: 3900, f: -1, p: "point", mood: "n" })], [4.0, M({ x: 3900, f: -1, p: "cheer", mood: "happy" })]], t);
    w += stopwatch(6 + clamp(u / 4.0) * 132, 1) + K.pill("أقل من ٣ دقايق", 840, 640, u, 3.4, { sz: 40, col: "#7cf2a0", down: false });
    return s + HUD + w;
  });
  // 19 — but if a landing plane's brakes fail, it rolls on off the end of the runway
  shot(19, [7700, GY - 300, 0.6], [8600, GY - 260, 0.75], function (u, d, t) {
    var a = clamp(u / 3.6), px = lerp(6000, 8500, 1 - (1 - a) * (1 - a)), s = scene(t, {}, {}), w = "", off = clamp((px + 0 - RWL) / 100);
    s += plane(px, RY + off * 20, 1, { t: t, pitch: -off * 1.5 });
    if (off > 0) for (var i = 0; i < 6; i++) { var p = (t * 1.4 + i / 6) % 1; s += C(px + lerp(-60, -300, p), GY - 20 - p * 140, 30 + p * 70, "#d9b57a", { op: (1 - p) * 0.7 }); }
    s += act(u, [[0, M({ x: 8000, f: 1, p: "stand", mood: "n" })], [1.8, M({ x: 8000, f: 1, p: "worry", mood: "worry" })], [3.0, M({ x: 8000, f: 1, p: "cover", mood: "shock" })]], t);
    w += hp("الفرامل!", 7400, RY - 420, u, 0.8, RED) + hx(RWL + 300, GY - 120, u, 3.0, 1.1);
    return s + HUD + w;
  });
  // 20 — the odd thing: many think the runway's end should be a strong wall to stop it
  shot(20, [8100, GY - 280, 0.7], [8300, GY - 200, 0.9], function (u, d, t) {
    var wk = clamp((u - 0.4) / 0.8), a = clamp((u - 1.4) / 1.8), px = lerp(6600, RWL + 300 - 1258, ease(a)), hit = clamp((u - 3.2) / 0.3), s = scene(t, {}, {}), w = "";
    s += wall(wk, RWL + 300) + plane(px, RY, 1, { t: t, pitch: hit * 2 });
    if (hit > 0) s += C(RWL + 300, RY - 140, 260 * hit, "url(#fire)", { op: 1 - hit * 0.5 });
    s += act(u, [[0, M({ x: 8700 + 400, f: -1, p: "shrug", mood: "n" })], [1.6, M({ x: 9100, f: -1, p: "point", mood: "n" })], [3.2, M({ x: 9100, f: -1, p: "cover", mood: "shock" })]], t);
    w += hp("سور؟", RWL + 335, GY - 330, u, 0.8, RED) + hx(RWL + 335, GY - 120, u, 3.4, 1.1);
    return s + HUD + w;
  });
  // 21 — the truth: many airports end the runway in crumbly concrete that crushes under the wheels and holds the plane;
  //      it has saved more than 20 planes in the US alone
  shot(21, [8700, GY - 260, 0.8], [8800, GY - 110, 1.4], function (u, d, t) {
    var ek = clamp((u - 0.3) / 1.8), a = clamp((u - 2.4) / 3.6), px = lerp(6900, 8750, 1 - (1 - a) * (1 - a)), sink = clamp((px - RWL) / 300);
    var s = scene(t, {}, { emas: ek, crush: 1, crushX: px + 30 }), w = "";
    s += plane(px, RY + sink * 18, 1, { t: t });
    s += act(u, [[0, M({ x: 9450, f: -1, p: "point", mood: "n" })], [2.4, M({ x: 9450, f: -1, p: "worry", mood: "worry" })], [5.8, M({ x: 9450, f: -1, p: "cheer", mood: "happy" })]], t);
    w += hp("خرسانة هشّة", (RWL + EM1) / 2, GY - 160, u, 1.0, YEL) + hv(px, RY - 300, u, 6.0) + K.pill("أكتر من ٢٠ طيارة اتنقذت", 540, 360, u, 6.6, { sz: 50, col: "#7cf2a0" });
    return s + HUD + w;
  });
  // 22 — what's left: a terminal, a bridge to the plane's door, and fuel tanks
  shot(22, [-1300, GY - 300, 0.75], [-2200, GY - 320, 0.62], function (u, d, t) {
    var s = scene(t, {}, { terminal: clamp(u / 1.0), tanks: clamp((u - 1.6) / 1.2) }), w = "";
    s += plane(-650, RY, -1, { t: t }) + bridge(clamp((u - 0.9) / 1.0), -1640);
    s += act(u, [[0, M({ x: -1300, f: -1, p: "stand", mood: "n" })], [0.3, M({ x: -1500, f: -1 })], [2.0, M({ x: -1500, f: -1, p: "thumbs", mood: "happy" })]], t);
    w += hp("كوبري الركاب", -1800, GY - 420, u, 1.6, YEL);
    return s + HUD + w;
  });
  // 23 — and congratulations: you built an airport yourself
  shot(23, [1550, GY - 60, 2.4], [-200, GY - 800, 0.27], function (u, d, t) {
    var s = scene(t, {}, {}), w = "", a = clamp(u / 3.6), p = takeoff(a, 1200, 3800, 0.5);
    s += plane(-650, RY, -1, { t: t }) + bridge(1, -1640) + plane(p.x, p.y, 1, { t: t, spin: 1, pitch: p.pitch, gear: p.gear, shadow: clamp(1 - (RY - p.y) / 700) });
    s += act(u, [[0, M({ x: 1500, f: 1, p: "cheer", mood: "proud" })]], t);
    w += K.confetti(t, 0, 1080, -100, 1500) + K.pill("مطار كامل!", 540, 300, u, 0.4, { sz: 56, col: "#ffd23a" });
    return s + HUD + w;
  });
  // 24 — tell us what we should explain next
  shot(24, [-200, GY - 800, 0.27], [1450, GY - 70, 2.2], function (u, d, t) {
    var s = scene(t, {}, {}), w = "", a = 1, p = takeoff(1, 1200, 3800, 0.5);
    s += plane(-650, RY, -1, { t: t }) + bridge(1, -1640) + plane(p.x + u * 900, p.y - u * 300, 1, { t: t, spin: 1, pitch: 10, gear: 0, shadow: 0 });
    s += act(u, [[0, M({ x: 1500, f: 1, p: "wave", mood: "happy" })]], t);
    return s + HUD + w;
  });
  window.__airport = { scene: scene, plane: plane };
})();
