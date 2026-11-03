  // ── «Comment le TGV roule à 320 km/h ?» (دايجرام, French). Objects follow real shapes (../refs/SOURCES.md): a TGV Duplex
  // power car (long nose, pantograph on the roof, two bogies) and double-deck coaches on shared articulated bogies, the
  // 25 kV overhead line on masts, a ballasted high-speed track with welded rails, the cab signal display, a real map of
  // France (geo.js) with the LGV Sud-Est / Méditerranée route. Running motif: the train itself, seen from the side.
  var DARK = "#41392f", SKY = "#b9bfbb", LAND = "#c5cb9e", LANDD = "#8e9f6a", PB = "#4f7a9a", SAND = "#d9b9a0", BALLAST = "#a19d93",
      BODY = "#e9e4d6", BODYD = "#cfc9b9", WIN = "#5d6a72", RAIL = "#7d7a72", SLEEP = "#b8a48a", COP = "#c4532c", MAST = "#9a968c";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function TS(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:700 ' + sz + 'px Noto Serif, DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + '">' + text + '</text>'; }
  function TM(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:700 ' + sz + 'px DejaVu Sans Mono, monospace;fill:' + (col || INK) + '">' + text + '</text>'; }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function circ(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function poly(pts, fill, sw, hatch) { var d = 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z'; return '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"/>' + (hatch ? '<path d="' + d + '" fill="url(#' + hatch + ')"/>' : ''); }
  function line(x1, y1, x2, y2, col, w, ex) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (ex || '') + '/>'; }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function ppart(p, k) { k = clamp(k); var L0 = plen(p) * k, s = 0, o = [p[0]]; for (var i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (s + l >= L0) { var r = l ? (L0 - s) / l : 0; o.push([lerp(p[i - 1][0], p[i][0], r), lerp(p[i - 1][1], p[i][1], r)]); return o; } o.push(p[i]); s += l; } return o; }
  function pd(p) { return 'M' + p.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L'); }
  function route(p, k, col, w) { if (k <= 0) return ""; var q = pd(ppart(p, k)); return '<path d="' + q + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + q + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function pin(x, y, k, r) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; r = r || 11; return G(x, y, k, 0, circ(0, 0, r, DARK, 2) + circ(0, 0, r * 0.32, PAPER, 0)); }
  function chapter(n, k) { k = pop(k); if (k <= 0) return ""; var s = circ(0, 0, 26, PAPER, 2.2) + TS(String(n), 0, 11, 30, ORANGE); for (var i = 0; i < 4; i++) s += circ(-27 + i * 18, 44, 5, i < n ? (i === n - 1 ? ORANGE : DARK) : PAPER, 1.4); return fixed(G(70, 80, k, 0, s)); }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("?", 0, 0, sz || 60, ORANGE)); }
  function bigNum(n, unit, x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return fixed(G(x, y, k, 0, TS(n, 0, 0, sz || 64, ORANGE) + T(unit, 0, 30, 20, INK, 700))); }

  // ── the TGV in side elevation (rail level at y = 0, running to the right; the nose is at the right end)
  function wheel(x, y, r, t, sp) { var a = t * (sp || 0) * 6, s = circ(x, y, r, DARK, 1.6) + circ(x, y, r * 0.35, MAST, 1); for (var k = 0; k < 3; k++) s += line(x, y, x + Math.cos(a + k * 2.09) * r * 0.8, y + Math.sin(a + k * 2.09) * r * 0.8, PAPER, 1.4); return s; }
  function bogie(x, t, sp) { return R(x - 30, -20, 60, 10, DARK, 1.6, 2) + wheel(x - 16, -10, 10, t, sp) + wheel(x + 16, -10, 10, t, sp); }
  function pantograph(x, k, top) { var h = lerp(6, (top || 48), clamp(k)), s = R(x - 16, -86, 32, 6, DARK, 1.4, 1); s += '<path d="M' + f(x - 12) + ' -86 L' + f(x + 6) + ' ' + f(-86 - h * 0.55) + ' L' + f(x - 4) + ' ' + f(-86 - h) + '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>'; return s + R(x - 18, -89 - h, 28, 4, COP, 1.4, 1); }
  // power car: 300 long, with the long nose; o: panto 0..1, glow (motor lit), sp (wheel speed)
  function powerCar(t, o) {
    o = o || {}; var s = "";
    s += poly([[0, -14], [195, -14], [255, -22], [292, -34], [300, -44], [286, -58], [240, -74], [190, -84], [0, -84]], BODY, 2);
    s += poly([[200, -80], [238, -72], [270, -58], [252, -56], [222, -66], [198, -70]], WIN, 1.6);
    s += '<path d="M0 -44 H230 Q262 -40 296 -40" stroke="' + PB + '" stroke-width="7" fill="none"/>' + '<path d="M0 -30 H200 Q236 -26 270 -26" stroke="' + COP + '" stroke-width="2.4" fill="none"/>';
    s += R(150, -70, 22, 34, BODYD, 1.4, 2) + line(40, -84, 40, -14, BODYD, 1.2) + R(60, -74, 70, 12, BODYD, 1.2, 2);
    for (var g = 0; g < 6; g++) s += line(64 + g * 11, -72, 64 + g * 11, -64, INK, 1);   // roof grille
    if (o.glow) s += '<ellipse cx="110" cy="-40" rx="70" ry="22" fill="url(#glowO)" opacity="' + f(o.glow * (0.7 + 0.3 * Math.sin(t * 8))) + '"/>';
    s += bogie(60, t, o.sp) + bogie(170, t, o.sp) + pantograph(110, o.panto == null ? 1 : o.panto, o.ptop);
    return s;
  }
  // one double-deck coach, 230 long, starting at x = 0 (its rear shares an articulated bogie with the next coach)
  function coach(t, o) {
    o = o || {}; var s = R(0, -92, 230, 78, BODY, 2, 6) + '<path d="M0 -44 H230" stroke="' + PB + '" stroke-width="7"/>';
    for (var w = 0; w < 6; w++) { s += R(14 + w * 35, -84, 24, 18, WIN, 1.2, 3) + R(14 + w * 35, -36, 24, 14, WIN, 1.2, 3); }
    return s;
  }
  // the whole rake: power car at the right; n coaches behind it, joined by shared bogies; x is the nose tip
  function trainSide(x, y, s, t, o) {
    o = o || {}; var n = o.n == null ? 2 : o.n, g = "", L0 = 300;
    for (var c = n - 1; c >= 0; c--) { var cx = -L0 - (c + 1) * 236; g += G(cx + 6, 0, 1, 0, coach(t, o)) + (c < n - 1 || true ? bogie(cx + 3, t, o.sp) : ""); }
    g += G(-L0, 0, 1, 0, powerCar(t, o));
    return G(x, y, s, 0, g);
  }
  // track in elevation with scrolling sleepers; overhead line on masts; sp = how fast the ground slides back (px/s)
  function trackSide(x0, x1, y, t, sp, o) {
    o = o || {}; var s = R(x0, y + 4, x1 - x0, 16, BALLAST, 0) + '<rect x="' + f(x0) + '" y="' + f(y + 4) + '" width="' + f(x1 - x0) + '" height="16" fill="url(#hatch)"/>', off = (t * (sp || 0)) % 40;
    for (var x = x0 - 40; x < x1 + 40; x += 40) { var xx = x - off; if (xx > x0 - 20 && xx < x1) s += R(xx, y + 2, 22, 6, SLEEP, 1.2); }
    s += R(x0, y - 3, x1 - x0, 5, RAIL, 1.4);
    if (o.joints) { var jo = (t * (sp || 0)) % 160; for (var j = x0; j < x1 + 160; j += 160) { var jx = j - jo; if (jx > x0 && jx < x1) s += R(jx - 2, y - 4, 4, 7, PAPER, 0); } }
    if (o.wire != null) { var mo = (t * (sp || 0)) % 260, wy = o.wire; for (var m = x0 - 260; m < x1 + 260; m += 260) { var mx = m - mo; if (mx > x0 - 30 && mx < x1 + 30) s += R(mx - 5, wy - 30, 10, y - wy + 34, MAST, 1.4) + line(mx, wy - 26, mx + 30, wy - 26, INK, 2) + line(mx + 30, wy - 26, mx + 30, wy, INK, 1.2); }
      s += line(x0, wy - 22, x1, wy - 22, INK, 1.2) + line(x0, wy, x1, wy, INK, 2); for (var h = x0; h < x1; h += 52) { var hx = h - (t * (sp || 0)) % 52; if (hx > x0) s += line(hx, wy - 22, hx, wy, INK, 0.8); } }
    return s;
  }
  function speedLines(x0, x1, y0, y1, t, n, k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < n; i++) { var q = (t * 1.4 + hash(i)) % 1, y = lerp(y0, y1, hash(i + 3)), x = lerp(x1, x0, q); s += line(x, y, x + 40 + 40 * hash(i + 5), y, DARK, 1.4, ' opacity="' + f(0.5 * k * Math.sin(q * Math.PI)) + '"'); } return s; }

  // ── the TGV on its track in isometric (running toward +x; the nose at the +x end)
  function isoTrain(t, o) {
    o = o || {}; var s = "", sp = o.sp == null ? 60 : o.sp, off = (t * sp) % 14, mo = (t * sp) % 120;
    s += isoFace([[-300, -14, 0], [520, -14, 0], [520, 44, 0], [-300, 44, 0]], BALLAST, "hatch", 1.4);
    for (var x = -300; x < 520; x += 14) { var xx = x - off; if (xx > -300 && xx < 508) s += isoBox(xx, -4, 0, 6, 38, 2, [SLEEP, SLEEP, SLEEP], 0.8); }
    [4, 26].forEach(function (y) { var a = iso(-300, y, 3), b = iso(520, y, 3); s += line(a[0], a[1], b[0], b[1], RAIL, 3); });
    if (o.wire !== false) for (var m = -300; m < 640; m += 120) { var mx = m - mo; if (mx > -300 && mx < 520) s += isoBox(mx, -28, 0, 4, 4, 78, [MAST, MAST, MAST], 1.2) + (function () { var a = iso(mx + 2, -26, 74), b = iso(mx + 2, 15, 74); return line(a[0], a[1], b[0], b[1], INK, 1.8); })(); }
    var X1 = o.nose == null ? 380 : o.nose, N0 = X1 - 60, P0 = N0 - 130;
    // coaches
    for (var c = 0; c < 3; c++) { var cx = P0 - (c + 1) * 146; s += isoBox(cx, 0, 6, 142, 30, 44, [BODY, BODY, BODYD], 1.6); var lf = function (x, z, w, h) { return isoFace([[x, 30, z], [x + w, 30, z], [x + w, 30, z + h], [x, 30, z + h]], WIN, "", 1); }; for (var w2 = 0; w2 < 5; w2++) s += lf(cx + 10 + w2 * 27, 34, 16, 7) + lf(cx + 10 + w2 * 27, 16, 16, 6); s += isoFace([[cx, 30, 25], [cx + 142, 30, 25], [cx + 142, 30, 28], [cx, 30, 28]], PB, "", 0); }
    // power car body + nose
    s += isoBox(P0, 0, 6, 130, 30, 40, [BODY, BODY, BODYD], 1.6) + isoFace([[P0, 30, 24], [N0, 30, 24], [N0, 30, 27], [P0, 30, 27]], PB, "", 0);
    s += isoFace([[N0, 30, 6], [N0, 30, 46], [X1, 22, 16], [X1, 22, 6]], BODY, "", 1.6) + isoFace([[N0, 0, 46], [N0, 30, 46], [X1, 22, 16], [X1, 8, 16]], BODY, "", 1.6) + isoFace([[X1, 8, 6], [X1, 22, 6], [X1, 22, 16], [X1, 8, 16]], BODYD, "hatch", 1.4);
    s += isoFace([[N0 + 4, 28, 36], [N0 + 26, 25, 28], [N0 + 26, 25, 22], [N0 + 4, 28, 30]], WIN, "", 1) + isoFace([[N0, 30, 24], [X1 - 6, 23.5, 15], [X1 - 6, 23.5, 13], [N0, 30, 21]], PB, "", 0);
    // pantograph up to the wire
    var pb = iso(P0 + 40, 15, 46), pt2 = iso(P0 + 40, 15, 74), pm = iso(P0 + 52, 15, 60); s += '<path d="M' + f(pb[0]) + ' ' + f(pb[1]) + ' L' + f(pm[0]) + ' ' + f(pm[1]) + ' L' + f(pt2[0]) + ' ' + f(pt2[1]) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    if (o.wire !== false) { var w0 = iso(-300, 15, 74), w1 = iso(520, 15, 74); s += line(w0[0], w0[1], w1[0], w1[1], INK, 2); if (o.volt) { for (var v = 0; v < 6; v++) { var q = (t * 0.6 + v / 6) % 1, p = iso(lerp(-200, P0 + 40, q), 15, 74); s += circ(p[0], p[1], 4, ORANGE, 1); } } }
    if (o.spark) { var sk = iso(P0 + 40, 15, 74); s += '<circle cx="' + f(sk[0]) + '" cy="' + f(sk[1]) + '" r="' + f(8 + 3 * Math.sin(t * 30)) + '" fill="url(#glowW)"/>'; }
    return s;
  }

  // ── France: real outline, neighbours, the LGV route Paris → Lyon → Marseille
  function france(k, t, o) {
    o = o || {}; var s = '<rect x="-400" y="-400" width="1440" height="1600" fill="' + SKY + '"/><path d="' + GEO.near + '" fill="#d9d3bf" stroke="' + INK + '" stroke-width="1.2"/><path d="' + GEO.fr + '" fill="' + LAND + '" stroke="' + INK + '" stroke-width="2"/>';
    s += route(GEO.lgv, k, ORANGE, 5); var P = GEO.pts;
    s += pin(P.PAR[0], P.PAR[1], K(k, 0, 0.1), 9) + pin(P.MRS[0], P.MRS[1], K(k, 0.95, 0.05), 9) + (o.lyon ? pin(P.LYS[0], P.LYS[1], 1, 7) : "");
    s += T("Paris", P.PAR[0] - 16, P.PAR[1] - 8, 20, INK, 800, "end") + T("Marseille", P.MRS[0] + 16, P.MRS[1] + 6, 20, INK, 800, "start") + (o.lyon ? T("Lyon", P.LYS[0] - 14, P.LYS[1] + 6, 17, INK, 700, "end") : "");
    if (k > 0 && k < 1) { var q = ppart(GEO.lgv, k), e = q[q.length - 1]; s += circ(e[0], e[1], 7, ORANGE, 1.6); }
    return s;
  }

  // ── shots (one per line)
  // 0 — Paris → Marseille in a bit more than three hours
  shot(0, mv(260, 420, 1.0, 300, 410, 1.08), function (u, d, t) {
    var s = paper() + isoAt(-26, 190, 1.4) + isoTrain(t, { sp: 90 });
    var k = pop(K(u, 1.2)); if (k > 0) s += G(320, 640, k, -3, R(-150, -46, 300, 92, PAPER, 2, 6) + T("PARIS GARE DE LYON", -134, -16, 17, INK, 800, "start") + T("→ MARSEILLE ST-CHARLES", -134, 10, 17, INK, 800, "start") + TS("3h05", 120, 30, 30, ORANGE, "end") + line(-134, 18, 40, 18, INK, 0.8, ' stroke-dasharray="3 3"'));
    return s;
  });
  // 1 — 750 km at more than 300 km/h
  shot(1, mv(330, 420, 1.0, 340, 430, 1.12), function (u, d, t) {
    var k = ease(K(u, 0.2, 2.0)); return france(k, t) + label(370, 420, 470, 380, "750 km", ORANGE, K(u, 1.4)) + bigNum("300+", "km/h", 470, 610, K(u, 1.6), 52);
  });
  // 2 — how can such a heavy train go so fast without leaving the rails?
  shot(2, mv(300, 380, 1.15, 300, 400, 1.0), function (u, d, t) {
    return paper() + trackSide(-200, 900, 470, t, 400, { wire: 300 }) + trainSide(560, 470, 1.0, t, { sp: 4, n: 1 }) + speedLines(-100, 700, 340, 450, t, 10, 1) + label(300, 450, 200, 560, "≈ 400 t", BLUE, K(u, 0.8)) + qmark(380, 250, K(u, 1.6), 70) + qmark(470, 230, K(u, 2.0), 50);
  });
  // 3 — comment ça marche ? (the train in a circle, as in the reference)
  shot(3, mv(320, 400, 1.0, 320, 400, 1.06), function (u, d, t) {
    var s = paper() + circ(320, 400, 200, PAPER, 2) + '<clipPath id="cc"><circle cx="320" cy="400" r="198"/></clipPath><g clip-path="url(#cc)">' + trackSide(100, 540, 470, t, 300, { wire: 300 }) + trainSide(470, 470, 0.7, t, { sp: 4, n: 1 }) + '</g>';
    return s + T("Comment ça marche ?", 320, 680, 34, INK, 800);
  });
  // 4 — no petrol engine: it runs on electricity
  shot(4, mv(330, 400, 1.05, 320, 390, 1.18), function (u, d, t) {
    chapter(1, K(u, 0.1, 0.6)); var s = paper() + trackSide(-200, 900, 500, t, 300, { wire: 330 }) + trainSide(600, 500, 1.1, t, { sp: 4, n: 1, glow: K(u, 1.2) });
    s += crossMark(150, 260, 0.9, K(u, 0.8)) + G(150, 260, 1, 0, R(-36, -26, 72, 52, PUTTY, 2, 4) + T("essence", 0, 6, 15, INK, 700)) + label(470, 450, 520, 260, "électricité", ORANGE, K(u, 1.6));
    return s;
  });
  // 5 — above the track, a wire at 25,000 volts
  shot(5, mv(300, 330, 1.25, 330, 330, 1.5), function (u, d, t) {
    var s = paper() + trackSide(-200, 900, 500, t, 120, { wire: 330 }); for (var v = 0; v < 6; v++) { var q = (t * 0.5 + v / 6) % 1; s += circ(lerp(-100, 700, q), 330, 5, ORANGE, 1.2); }
    return s + label(260, 330, 330, 220, "fil de contact", OLIVE, K(u, 0.6)) + bigNum("25 000", "volts", 320, 480, K(u, 1.6), 54);
  });
  // 6 — on the roof, the pantograph rubs against the wire
  shot(6, mv(400, 380, 1.3, 430, 360, 1.7), function (u, d, t) {
    var s = paper() + trackSide(-200, 900, 500, t, 200, { wire: 340 }) + trainSide(640, 500, 1.1, t, { sp: 4, n: 1, panto: ease(K(u, 0.4, 1.0)), ptop: 66 });
    var px = 640 - 330 + 110 * 1.1; s += '<circle cx="' + f(px) + '" cy="340" r="' + f(10 + 3 * Math.sin(t * 30)) + '" fill="url(#glowW)" opacity="' + f(K(u, 1.2)) + '"/>';
    return s + label(px + 6, 380, px + 120, 260, "pantographe", ORANGE, K(u, 1.6));
  });
  // 7 — the current goes down to the power cars at both ends
  shot(7, mv(330, 420, 0.75, 330, 420, 0.82), function (u, d, t) {
    var s = paper() + trackSide(-400, 1100, 500, t, 200, { wire: 360 });
    // rear power car (mirrored), two coaches, front power car
    s += G(140, 500, 0.8, 0, '<g transform="scale(-1 1)">' + powerCar(t, { sp: 4, glow: K(u, 1.0), panto: 0 }) + '</g>') + G(146, 500, 0.8, 0, coach(t) + G(236, 0, 1, 0, coach(t)) + bogie(3, t, 4) + bogie(236, t, 4) + bogie(469, t, 4)) + G(523, 500, 0.8, 0, powerCar(t, { sp: 4, glow: K(u, 1.0), panto: 1, ptop: 60 }));
    for (var v = 0; v < 5; v++) { var q = (t * 0.8 + v / 5) % 1, px = 523 + 110 * 0.8; s += circ(px, lerp(360, 470, q), 4, ORANGE, 1); }
    return s + label(-30, 470, -60, 320, "motrice", ORANGE, K(u, 1.4)) + label(680, 470, 700, 320, "motrice", ORANGE, K(u, 1.4));
  });
  // 8 — one trainset has the power of about a hundred cars
  shot(8, mv(320, 420, 1.0, 320, 400, 1.06), function (u, d, t) {
    var s = paper() + isoAt(24, 140, 1.2) + isoTrain(t, { sp: 20, wire: true });
    for (var c = 0; c < 100; c++) { var k = clamp(u * 40 - c); if (k <= 0) break; var cx = 110 + (c % 10) * 44, cy = 520 + Math.floor(c / 10) * 22; s += G(cx, cy, pop(k) * 0.5, 0, R(-26, -12, 52, 16, c % 7 ? PUTTY : ORANGE, 1.4, 5) + R(-14, -20, 28, 10, PUTTY, 1.2, 3) + circ(-14, 4, 5, DARK, 1) + circ(14, 4, 5, DARK, 1)); }
    return s + T("≈ 100 voitures", 330, 770, 24, ORANGE, 800);
  });
  // 9 — at 300 km/h the real problem isn't the motor, it's the air
  shot(9, mv(330, 400, 1.0, 340, 400, 1.12), function (u, d, t) {
    chapter(2, K(u, 0.1, 0.6)); var s = paper() + trackSide(-200, 900, 500, t, 380, { wire: 330 }) + trainSide(560, 500, 1.0, t, { sp: 6, n: 1 });
    for (var i = 0; i < 8; i++) { var y = 380 + i * 14, q = (t * 1.2 + i * 0.13) % 1; s += arrow(lerp(760, 590, q), y, lerp(720, 560, q), y, BLUE, 2.4, 1); }
    return s + label(580, 420, 600, 260, "l'air", BLUE, K(u, 1.6));
  });
  // 10 — the faster you go, the harder the air pushes (it grows with the square of the speed)
  shot(10, mv(320, 420, 1.0, 320, 410, 1.08), function (u, d, t) {
    var s = paper() + line(120, 640, 540, 640, INK, 2) + line(120, 640, 120, 220, INK, 2), v = [["100", 1], ["200", 4], ["300", 9]];
    v.forEach(function (b, i) { var h = 44 * b[1] * ease(K(u, 0.3 + i * 0.6, 0.8)); s += R(170 + i * 130, 640 - h, 80, h, i === 2 ? ORANGE : PUTTY, 2) + '<rect x="' + (170 + i * 130) + '" y="' + f(640 - h) + '" width="80" height="' + f(h) + '" fill="url(#hatch)"/>' + T(b[0] + " km/h", 210 + i * 130, 672, 18, INK, 700) + (h > 20 ? T("×" + b[1], 210 + i * 130, 640 - h - 12, 22, i === 2 ? ORANGE : INK, 800) : ""); });
    return s + T("résistance de l'air", 330, 200, 22, BLUE, 800);
  });
  // 11 — so the nose is long and smooth, for the air to slide over it
  shot(11, mv(470, 420, 1.5, 450, 420, 1.3), function (u, d, t) {
    var s = paper() + trackSide(-200, 900, 500, t, 380) + trainSide(600, 500, 1.1, t, { sp: 6, n: 0 });
    for (var i = 0; i < 6; i++) { var y0 = 360 + i * 22, p = [], ph = t * 2 + i; for (var x = 700; x >= 300; x -= 10) { var bump = x < 620 && x > 380 ? Math.max(0, (500 - 40 - y0) > 0 ? 0 : 0) : 0; var yy = y0 - (x < 610 ? Math.min(60, (610 - x) * 0.35) * (1 - i / 7) : 0); p.push([x, yy + Math.sin(x * 0.05 + ph) * 1.5]); } s += '<path d="' + pd(ppart(p, K(u, 0.3 + i * 0.1, 1.2))) + '" stroke="' + BLUE + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
    return s + label(590, 450, 610, 300, "nez allongé", ORANGE, K(u, 1.8));
  });
  // 12 — the rails: almost no tight bends on a high-speed line
  shot(12, mv(320, 400, 1.0, 320, 410, 1.1), function (u, d, t) {
    chapter(3, K(u, 0.1, 0.6)); var s = paper(), k = ease(K(u, 0.3, 1.6));
    s += '<path d="M120 700 C160 520 200 440 320 380 S480 260 520 120" stroke="' + DARK + '" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="' + f(1000 * (1 - k)) + '"/>';
    s += G(470, 560, 1, 0, '<path d="M-60 60 Q-60 -40 40 -40" stroke="' + DARK + '" stroke-width="8" fill="none"/>') + crossMark(470, 560, 0.8, K(u, 1.8));
    return s + label(320, 380, 140, 300, "ligne à grande vitesse", OLIVE, K(u, 1.0));
  });
  // 13 — bends several kilometres in radius, so you feel almost nothing
  shot(13, mv(320, 420, 1.0, 320, 420, 1.08), function (u, d, t) {
    var s = paper(), k = ease(K(u, 0.2, 1.8)); s += '<path d="M-60 720 A700 700 0 0 1 640 120" stroke="' + DARK + '" stroke-width="10" fill="none" stroke-dasharray="1200" stroke-dashoffset="' + f(1200 * (1 - k)) + '"/>';
    s += line(640, 820, 330, 470, INK, 1.4, ' stroke-dasharray="6 6" opacity="' + f(K(u, 1.0)) + '"') + circ(640, 820, 6, INK, 1);
    var cup = pop(K(u, 2.0)); if (cup > 0) s += G(250, 300, cup, 0, R(-26, -30, 52, 40, PAPER, 2, 4) + '<ellipse cx="0" cy="-30" rx="26" ry="7" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M26 -20 q16 6 0 18" stroke="' + INK + '" stroke-width="2" fill="none"/>');
    return s + label(470, 610, 520, 680, "rayon > 4 km", ORANGE, K(u, 1.2));
  });
  // 14 — welded rails, no more clack-clack
  shot(14, mv(320, 400, 1.1, 320, 400, 1.25), function (u, d, t) {
    var s = paper() + T("avant", 320, 250, 18, INK, 700) + trackSide(60, 580, 300, t, 160, { joints: true }) + crossMark(560, 290, 0.5, K(u, 0.8));
    s += T("LGV : rails soudés", 320, 470, 18, OLIVE, 800) + trackSide(60, 580, 540, t, 160, {});
    for (var w = 0; w < 4; w++) { var wx = 120 + w * 130; s += R(wx - 6, 534, 12, 8, "#9a8f7a", 1, 1); }
    var tac = (t * 160) % 160 < 30 && u < 2.5; if (tac) s += T("tac-tac", 320, 220, 22, ORANGE, 800);
    return s + label(310, 538, 390, 640, "sans joints", ORANGE, K(u, 1.6));
  });
  // 15 — between two coaches, a single shared set of wheels
  shot(15, mv(330, 430, 1.5, 320, 440, 1.8), function (u, d, t) {
    var s = paper() + trackSide(-200, 900, 500, t, 120) + G(-110, 500, 1, 0, coach(t)) + G(126, 500, 1, 0, coach(t)) + G(120, 500, 1, 0, bogie(3, t, 3));
    return s + label(123, 490, 260, 620, "1 bogie pour 2 voitures", ORANGE, K(u, 1.0));
  });
  // 16 — an articulated bogie keeps the whole rake aligned
  shot(16, mv(320, 420, 0.8, 320, 420, 0.9), function (u, d, t) {
    var s = paper() + trackSide(-400, 1100, 500, t, 200) + trainSide(820, 500, 0.8, t, { sp: 4, n: 3, panto: 1 });
    for (var b = 0; b < 3; b++) { var bx = 820 + (-300 - b * 236 - 233) * 0.8; s += circ(bx, 492, 14, "none", 2.4).replace('stroke="' + INK + '"', 'stroke="' + ORANGE + '"'); }
    s += line(-100, 440, 800, 440, ORANGE, 1.6, ' stroke-dasharray="10 8" opacity="' + f(K(u, 1.2)) + '"');
    return s + label(420, 492, 420, 620, "bogie articulé", ORANGE, K(u, 0.8));
  });
  // 17 — at this speed the driver can't read the trackside signs
  shot(17, mv(320, 400, 1.0, 320, 400, 1.15), function (u, d, t) {
    chapter(4, K(u, 0.1, 0.6)); var s = paper() + trackSide(-200, 900, 560, t, 900);
    for (var p = 0; p < 3; p++) { var px = 640 - ((t * 900 + p * 300) % 900); s += G(px, 560, 1, 0, R(-3, -110, 6, 110, MAST, 1.2) + R(-22, -150, 44, 44, PAPER, 2, 4) + circ(0, -128, 12, ORANGE, 1.4)); }
    s += '<rect x="-200" y="380" width="1040" height="190" fill="' + PAPER + '" opacity=".45"/>' + crossMark(320, 470, 0.9, K(u, 1.2));
    return s + label(320, 440, 420, 260, "panneaux : illisibles", ORANGE, K(u, 1.6));
  });
  // 18 — the signals go through the rails and show up in the cab
  shot(18, mv(320, 420, 1.0, 320, 400, 1.1), function (u, d, t) {
    var s = paper() + trackSide(-200, 900, 640, t, 300);
    s += G(320, 330, 1, 0, R(-200, -130, 400, 230, DARK, 2.4, 10) + '<rect x="-200" y="-130" width="400" height="230" rx="10" fill="url(#hatchW)"/>' + R(-150, -100, 300, 150, "#2e3a3e", 2, 6) + TM("300", -40, 0, 64, "#9fd8a8") + T("km/h", 80, 0, 22, "#9fd8a8", 700) + R(60, -86, 70, 40, "#2e3a3e", 1.4, 4) + TM("300", 95, -58, 18, ORANGE));
    for (var v = 0; v < 6; v++) { var q = (t * 0.9 + v / 6) % 1; s += circ(lerp(320, 320, q), lerp(630, 440, q), 5, BLUE, 1.2); }
    return s + label(240, 280, 120, 520, "signal en cabine", BLUE, K(u, 1.0)) + label(330, 630, 470, 560, "info dans les rails", BLUE, K(u, 1.8));
  });
  // 19 — stopping from 300 km/h takes more than three kilometres
  shot(19, mv(330, 420, 1.0, 340, 420, 1.06), function (u, d, t) {
    var k = ease(K(u, 0.3, 2.4)), s = paper() + trackSide(-200, 900, 520, t, 400 * (1 - k)) + trainSide(lerp(240, 600, k), 520, 0.45, t, { sp: 6 * (1 - k), n: 2 });
    s += line(60, 600, 600, 600, ORANGE, 3) + line(60, 588, 60, 612, ORANGE, 3) + line(600, 588, 600, 612, ORANGE, 3);
    for (var e = 0; e < 10; e++) { var ex = 60 + e * 54 + 27, ek = pop(K(u, 1.2 + e * 0.1, 0.5)); if (ek > 0) s += G(ex, 690, ek * 0.9, 0, '<path d="M0 -60 L-10 0 H10 Z M-14 0 H14" stroke="' + DARK + '" stroke-width="2" fill="none"/>' + line(-6, -30, 6, -30, DARK, 1.4)); }
    return s + T("> 3 km", 330, 580, 30, ORANGE, 800) + T("≈ 10 tours Eiffel couchées", 330, 740, 18, INK, 700);
  });
  // 20 — many think you need a levitating train to go that fast
  shot(20, mv(320, 420, 1.0, 320, 410, 1.08), function (u, d, t) {
    var s = paper() + R(-100, 560, 840, 40, PUTTY, 2) + '<rect x="-100" y="560" width="840" height="40" fill="url(#hatch)"/>' + G(0, 8 * Math.sin(t * 2), 1, 0, trainSide(560, 520, 0.9, t, { n: 1, panto: 0 }));
    for (var m = 0; m < 6; m++) s += T("N S", 120 + m * 80, 548, 12, BLUE, 700);
    return s + crossMark(320, 420, 1.2, K(u, 1.8)) + label(300, 540, 330, 680, "lévitation magnétique", BLUE, K(u, 0.8));
  });
  // 21 — nope: classic steel rails (the conical wheel on the rail, in section)
  shot(21, mv(320, 420, 1.0, 320, 430, 1.15), function (u, d, t) {
    var s = paper() + G(320, 470, 1, 0, poly([[-50, 40], [50, 40], [40, 30], [16, 26], [16, -40], [32, -50], [32, -70], [-32, -70], [-32, -50], [-16, -40], [-16, 26], [-40, 30]], RAIL, 2, "hatch"));
    var a = t * 3; s += G(320, 360, 1, 0, poly([[-90, 30], [80, 46], [96, 40], [96, -110], [-90, -110]], MAST, 2) + '<rect x="-90" y="-110" width="186" height="140" fill="url(#hatch)"/>' + line(-90, 30 + 2 * Math.sin(a), 80, 46, INK, 1));
    return s + label(320, 420, 470, 560, "acier", OLIVE, K(u, 0.8)) + label(240, 320, 120, 220, "roue conique", OLIVE, K(u, 1.4));
  });
  // 22 — 2007: 574.8 km/h
  shot(22, mv(320, 420, 1.0, 330, 420, 1.1), function (u, d, t) {
    var k = ease(K(u, 0.4, 3.2)), s = paper() + trackSide(-200, 900, 560, t, 1200) + trainSide(560, 560, 0.9, t, { sp: 10, n: 1 }) + speedLines(-100, 700, 420, 540, t, 16, 1);
    s += T("V150 · 3 avril 2007", 320, 640, 18, INK, 700);
    return s + fixed(TS((574.8 * k).toFixed(1).replace(".", ","), 320, 250, 80, ORANGE) + T("km/h", 320, 290, 24, INK, 800));
  });
  // 23 — still the world record for a train on rails
  shot(23, mv(320, 400, 1.05, 320, 400, 1.0), function (u, d, t) {
    var s = paper() + G(320, 380, 1, 0, circ(0, 0, 120, PAPER, 2.4) + circ(0, 0, 104, ORANGE, 0) + '<circle r="104" fill="url(#hatch)"/>' + TS("1", 0, 34, 110, PAPER) + T("record du monde", 0, 160, 24, INK, 800));
    return s + T("train sur rails", 320, 620, 20, OLIVE, 700) + G(320, 690, 1, 0, trainSide(160, 0, 0.35, t, { n: 2, sp: 6 }));
  });
  // 24 — in short: electricity from above, air that slides, almost straight rails, signals in the cab
  shot(24, mv(320, 400, 0.95, 320, 400, 1.05), function (u, d, t) {
    var s = paper() + isoAt(11, 220, 1.25) + isoTrain(t, { sp: 80, volt: true });
    var a = iso(250, 15, 74), b = iso(372, 20, 30), c = iso(60, 30, 2), e = iso(300, 28, 30);
    return s + callout(1, a[0], a[1] - 30, K(u, 0.3, 0.4)) + callout(2, b[0] + 30, b[1], K(u, 1.3, 0.4)) + callout(3, c[0], c[1] + 30, K(u, 2.4, 0.4)) + callout(4, e[0], e[1] + 50, K(u, 3.6, 0.4));
  });

  window.__parts = { isoAt: isoAt, iso: iso, isoTrain: isoTrain, trainSide: trainSide, trackSide: trackSide, speedLines: speedLines, G: G, T: T, TS: TS, R: R, line: line, circ: circ };

  // ── summary card (the last line)
  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="300" fill="' + PAPER + '"/>' + '<g transform="translate(40 240) scale(0.62)">' + trackSide(-60, 800, 0, t, 300, { wire: -150 }) + trainSide(760, 0, 1, t, { sp: 4, n: 1, panto: 1, ptop: 60 }) + '</g>';
    var P = [[40 + (760 - 300 + 110) * 0.62, 240 - 150 * 0.62 - 6, 1], [40 + 756 * 0.62, 240 - 30 * 0.62, 2], [40 + (760 - 303) * 0.62, 240 - 10, 4], [40 + (760 - 300 + 150) * 0.62, 240 - 60 * 0.62, 3]];
    P.forEach(function (p, i) { var k = clamp((u - 0.3 - i * 0.3) / 0.4); if (k > 0) s += '<g transform="translate(' + f(p[0]) + ' ' + f(p[1] - 26) + ') scale(' + f(pop(k) * 0.8) + ')"><circle r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans;fill:' + ORANGE + '">' + p[2] + '</text></g>'; });
    svg.innerHTML = s;
  };
})();
