  // ── «150 PS gegen 400 PS» — new pieces (shapes from real photos: see ../refs/SOURCES.md) ──
  var GRN = "#5bbf6a", ORG = "#e8742e";
  function txt(x, y, s, size, col, anchor, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + size + 'px Noto Sans;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + (size > 20 ? 3 : 2) + ';paint-order:stroke">' + s + '</text>'; }
  function pulse(t, sp) { return 0.5 + 0.5 * Math.sin(t * (sp || 5)); }
  function badge(x, y, s, w, col, tc) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="' + f(-w / 2) + '" y="-22" width="' + w + '" height="44" rx="12" fill="' + (col || INK) + '" stroke="' + INK + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:900 24px Noto Sans;fill:' + (tc || YEL) + '">' + s + '</text></g>'; }
  // the hard-hat character (orange vest, white helmet)
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/>';
    if (o.wave) { var wa = Math.sin(t * 7) * 18; s += '<path d="M-44 60 Q-80 30 ' + f(-96 + wa * 0.3) + ' -10" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(-96 + wa * 0.3) + '" cy="-14" r="11" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>'; }
    return s + '</g>';
  }
  // a low two-door sports coupé (generic, no badge), nose to the right; o: {s, spin, col}
  function sportsCar(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 500 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="40" rx="160" ry="9" fill="#000" opacity=".2"/>';
    s += '<path d="M-158 18 C-160 0 -150 -10 -134 -14 L-70 -22 C-40 -48 10 -50 40 -42 L120 -16 C150 -12 162 0 160 18 Z" fill="' + (o.col || "url(#gSport)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-56 -22 C-34 -42 6 -44 30 -38 L52 -20 Z" fill="#2b3a48" stroke="' + INK + '" stroke-width="2"/><path d="M-8 -40 V-20" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-150 -12 L-128 -18 L-126 -26 L-160 -24 Z" fill="#1c1c1c"/><path d="M120 -12 L156 -2" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/><rect x="-162" y="-4" width="10" height="6" rx="2" fill="' + RED + '"/>';
    s += '<path d="M-60 6 H60" stroke="' + INK + '" stroke-width="1.6" opacity=".4"/><path d="M-120 10 h20" stroke="#3a3f46" stroke-width="5"/>';
    s += wheel(-100, 18, 26, sp) + wheel(104, 18, 26, sp);
    return s + '</g>';
  }
  function hatch(x, y, t, o) { o = o || {}; return car(x, y, t, Object.assign({ col: "url(#gCarB)" }, o)); }
  // an engine block seen from the side: n cylinders in a row (o.v: two banks in a V, front view), pistons moving, flashes in firing order
  function engineRow(x, y, t, o) {
    o = o || {}; var n = o.n || 4, w = o.w || 40, h = o.h || 90, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', W = n * w + 20, rpm = o.rpm || 2;
    s += '<rect x="' + f(-W / 2 - 8) + '" y="-22" width="' + f(W + 16) + '" height="22" rx="6" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<rect x="' + f(-W / 2) + '" y="0" width="' + W + '" height="' + h + '" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/>';
    var ORD = n === 4 ? [0, 2, 3, 1] : n === 5 ? [0, 3, 1, 4, 2] : [0, 4, 2, 6, 1, 5, 3, 7];
    for (var i = 0; i < n; i++) {
      var cx = -W / 2 + 10 + w / 2 + i * w, ph = (t * rpm + ORD[i] / n) % 1, py = 8 + (h - 44) * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      s += '<rect x="' + f(cx - w / 2 + 3) + '" y="2" width="' + (w - 6) + '" height="' + (h - 4) + '" fill="#2b2e33"/>';
      if (ph < 0.12 && o.fire !== false) s += '<rect x="' + f(cx - w / 2 + 3) + '" y="2" width="' + (w - 6) + '" height="' + f(py) + '" fill="url(#gBoom)" opacity="' + f(1 - ph / 0.12) + '"/>';
      s += '<rect x="' + f(cx - w / 2 + 4) + '" y="' + f(py) + '" width="' + (w - 8) + '" height="24" rx="3" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(cx) + ' ' + f(py + 24) + ' L' + f(cx) + ' ' + (h + 12) + '" stroke="#5a6068" stroke-width="6"/>';
      s += '<rect x="' + f(cx - 3) + '" y="-34" width="6" height="14" fill="#fbf6e6" stroke="' + INK + '" stroke-width="1.2"/>';
    }
    s += '<path d="M' + f(-W / 2 - 14) + ' ' + (h + 12) + ' H' + f(W / 2 + 14) + '" stroke="#5a6068" stroke-width="10" stroke-linecap="round"/><rect x="' + f(-W / 2 - 8) + '" y="' + h + '" width="' + f(W + 16) + '" height="30" rx="10" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4" opacity=".85"/>';
    return s + '</g>';
  }
  // a V8 from the front: two banks of cylinders at 90°, crank in the middle, pistons pumping; flashes alternate
  function v8(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', rpm = o.rpm || 2;
    s += '<path d="M-130 -70 L-20 40 L20 40 L130 -70 L100 -100 L0 0 L-100 -100 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="3"/>';
    [-1, 1].forEach(function (sg, b) { var g = '<g transform="rotate(' + (sg * 45) + ')">';
      var ph = (t * rpm + b * 0.25) % 1, py = -150 + 40 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      g += '<rect x="-34" y="-190" width="68" height="150" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.4"/>';
      if (ph % 0.5 < 0.08) g += '<rect x="-32" y="-188" width="64" height="' + f(py + 188) + '" fill="url(#gBoom)"/>';
      g += '<rect x="-30" y="' + f(py) + '" width="60" height="28" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/><path d="M0 ' + f(py + 28) + ' L0 -10" stroke="#5a6068" stroke-width="8"/>';
      g += '<rect x="-46" y="-218" width="92" height="30" rx="6" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-5" y="-232" width="10" height="16" fill="#fbf6e6" stroke="' + INK + '"/>';
      s += g + '</g>'; });
    s += '<circle cx="0" cy="10" r="34" fill="#8a929c" stroke="' + INK + '" stroke-width="2.6"/><g transform="rotate(' + f(t * rpm * 720) + ' 0 10)"><path d="M0 10 L0 -14" stroke="#2b2e33" stroke-width="10" stroke-linecap="round"/></g><circle cx="0" cy="10" r="6" fill="#2b2e33"/>';
    s += '<path d="M-60 60 C-60 100 60 100 60 60 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // the turbocharger cut open (photos: a cutaway turbo): hot snail housing with the turbine on the left, the compressor on the right,
  // one shaft between; spin = wheel speed (turns/s for drawing), o: {hot, cold air}
  function turbo(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, sp = (o.spin == null ? 6 : o.spin) * t * 360, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    function snail(cx, fill) { return '<path d="M' + (cx - 64) + ' 0 A64 64 0 1 1 ' + (cx + 20) + ' 60 L' + (cx + 70) + ' 60 L' + (cx + 70) + ' 84 L' + (cx + 10) + ' 84 A84 84 0 0 1 ' + (cx - 64) + ' 0 Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/><circle cx="' + cx + '" cy="0" r="62" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/>'; }
    function wheelBlades(cx, col) { var g = '<g transform="translate(' + cx + ' 0) rotate(' + f(sp) + ')"><circle r="44" fill="#2b2e33"/>'; for (var k = 0; k < 10; k++) g += '<path d="M0 0 Q18 -10 40 -6 L40 6 Q16 -2 0 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + (k * 36) + ')"/>'; return g + '<circle r="10" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/></g>'; }
    s += snail(-110, "url(#gHot)") + snail(110, "url(#gSnail)");
    s += '<rect x="-60" y="-14" width="120" height="28" rx="6" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-110 0 H110" stroke="#c9ced4" stroke-width="8"/>';
    s += wheelBlades(-110, "#e9a06e") + wheelBlades(110, "#d9dee3");
    if (o.hot !== false) for (var e = 0; e < 8; e++) { var u = (t * 1.3 + e / 8) % 1; s += '<circle cx="' + f(-220 + u * 90) + '" cy="' + f(70 - u * 60 + Math.sin(e) * 6) + '" r="' + f(6 + u * 3) + '" fill="#8a857a" opacity="' + f(0.8 * (1 - u * 0.6)) + '"/>'; }
    if (o.cold) for (var c = 0; c < 10; c++) { var v = (t * 1.6 + c / 10) % 1; s += '<circle cx="' + f(lerp(110, 260, v)) + '" cy="' + f(lerp(0, 72, v) + Math.sin(c) * 5) + '" r="4" fill="' + CY + '" opacity="' + f(1 - v * 0.4) + '"/>'; }
    return s + '</g>';
  }
  // a cartoon horse in side view (brown body, darker mane), walking legs; o: {s, pull}
  function horse(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 6)) * -2) + ') scale(' + (o.s || 1) + ')">', st = Math.sin(t * 6) * 14;
    [[-40, st], [-24, -st], [36, -st], [52, st]].forEach(function (l) { s += '<path d="M' + l[0] + ' 10 L' + f(l[0] + l[1] * 0.6) + ' 70" stroke="#6a4424" stroke-width="12" stroke-linecap="round"/><path d="M' + f(l[0] + l[1] * 0.6 - 6) + ' 72 h12" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>'; });
    s += '<ellipse cx="6" cy="0" rx="70" ry="34" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M56 -16 L90 -66 C96 -76 116 -76 122 -66 L132 -42 C134 -34 126 -30 118 -34 L104 -40 L80 6 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="3"/><circle cx="108" cy="-58" r="3.4" fill="' + INK + '"/><path d="M94 -76 L98 -90 L104 -74" fill="#7a4f2a" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M90 -70 C76 -50 66 -30 58 -14" stroke="#3a2412" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-62 -6 C-90 0 -96 30 -86 50" stroke="#3a2412" stroke-width="9" fill="none" stroke-linecap="round" transform="rotate(' + f(Math.sin(t * 4) * 8) + ' -62 -6)"/>';
    return s + '</g>';
  }
  // a stopwatch
  function stopwatch(x, y, r, v, max, label, col) { var a = (v / max) * Math.PI * 2, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-8" y="' + (-r - 16) + '" width="16" height="12" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><circle r="' + r + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M0 0 L0 ' + (-r) + ' A' + r + ' ' + r + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(Math.sin(a) * r) + ' ' + f(-Math.cos(a) * r) + ' Z" fill="' + (col || YEL) + '" opacity=".55"/><path d="M0 0 L' + f(Math.sin(a) * (r - 6)) + ' ' + f(-Math.cos(a) * (r - 6)) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/>';
    return s + '</g>' + txt(x, y + r + 26, label, 20, "#fff"); }
  function workshop(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9d4c8"/>'; for (var i = -6; i < 18; i++) s += '<rect x="' + (i * 80 + ((t * 40) % 80)) + '" y="-300" width="40" height="960" fill="#cfc9bc" opacity=".6"/>'; return s + '<rect x="-400" y="300" width="1440" height="200" fill="#8a857a"/>'; }
  function dark(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f2328"/>'; for (var i = 0; i < 30; i++) s += '<circle cx="' + f(-300 + hash(i) * 1240) + '" cy="' + f(-200 + ((hash(i + 3) * 700 + t * 20) % 700)) + '" r="' + f(1 + hash(i + 7) * 2) + '" fill="#f2c230" opacity="' + f(0.15 + 0.2 * pulse(t + i, 3)) + '"/>'; return s; }
  function mixBox(x, y, w, h, n, t, k) { var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx="8" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.4"/>'; for (var i = 0; i < n; i++) s += '<circle cx="' + f(x + 8 + hash(i + k) * (w - 16) + Math.sin(t * 6 + i) * 3) + '" cy="' + f(y + 8 + hash(i + 5 + k) * (h - 16) + Math.cos(t * 5 + i) * 3) + '" r="3.4" fill="' + (i % 3 ? CY : YEL) + '"/>'; return s; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function street(t, sp) { return sky("day") + clouds(t, 20, 20, 5, 0.8) + city(t, 250, 90, "#b9a98a", true, 3, false) + road(t, 280, sp || 400); }

  // 0 — a Golf has 150 PS, a sports car 400
  shot(0, function (u, d) { return [lerp(280, 340, clamp(u / d)), 200, lerp(1.1, 1.0, ease(u / d))]; }, function (u, d, t) {
    var s = street(t, 420) + hatch(170, 268, t, { s: 0.85 }) + sportsCar(470 + Math.sin(t * 1.4) * 12, 270, t, { s: 0.85 });
    return s + badge(170, 120, "150 PS", 130, INK, "#bfe0ff") + (u > 1.2 ? badge(470, 120, "400 PS", 130, INK, YEL) : "");
  });
  // 1 — but what does that number actually mean?
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineer(160, 210, t, "curious", { s: 0.75 }) + badge(420, 160 + Math.sin(t * 3) * 6, "PS", 110, INK, YEL);
    return s + qmark(520, 110, t, 54) + qmark(330, 90, t, 44) + qmark(500, 250, t, 38);
  });
  // 2 — and how do you get almost three times as much out of an engine?
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 180, lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.6), s = workshop(t);
    s += '<rect x="150" y="' + f(280 - 60) + '" width="110" height="60" fill="#5d93ad" stroke="' + INK + '" stroke-width="3"/>' + txt(205, 205, "150", 22, "#bfe0ff");
    var h2 = lerp(60, 160, k) + 6 * Math.sin(t * 6); s += '<rect x="380" y="' + f(280 - h2) + '" width="110" height="' + f(h2) + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>' + txt(435, f(270 - h2), Math.round(lerp(150, 400, k)) + "", 22, YEL);
    return s + tag("fast ×3!", 320, 60, u, 1.6, -3, 26) + qmark(560, 120, t, 50);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 190, lerp(1.0, 0.95, u / d)]; }, function (u, d, t) {
    var s = street(t, 600) + hatch(lerp(120, 200, u / d), 268, t, { s: 0.7 }) + sportsCar(lerp(380, 470, u / d), 270, t, { s: 0.7 });
    return s + tag("Was steckt dahinter?", 320, 100, u, 0.2, -2, 28);
  });
  // 4 — 1 PS lifts 75 kg one metre in one second
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 1.0) / 1.0), s = workshop(t);
    s += '<rect x="400" y="20" width="20" height="290" fill="#8a5a2a" stroke="' + INK + '" stroke-width="2"/><circle cx="410" cy="24" r="18" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
    var wy = lerp(270, 150, ease(k)); s += '<path d="M410 24 V' + f(wy - 40) + ' M392 24 H250 L' + f(200 + 120 * ease(k) * 0.4) + ' 220" stroke="#5a4a34" stroke-width="3" fill="none"/>';
    s += weightBlock(410, wy + 40, "75 kg") + horse(lerp(140, 190, ease(k)), 230, t, { s: 0.7 });
    s += '<path d="M540 270 V150" stroke="' + YEL + '" stroke-width="4"/><path d="M530 270 H550 M530 150 H550" stroke="' + YEL + '" stroke-width="4"/>' + txt(578, 216, "1 m", 20, YEL);
    s += stopwatch(570, 70, 26, clamp(u - 1.0), 1, "1 s");
    return s + tag("1 PS", 200, 60, u, 0.3, -3, 26);
  });
  function weightBlock(x, y, label) { return '<path d="M' + (x - 40) + ' ' + f(y) + ' L' + (x - 30) + ' ' + f(y - 40) + ' H' + (x + 30) + ' L' + (x + 40) + ' ' + f(y) + ' Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 10) + ' ' + f(y - 40) + ' Q' + x + ' ' + f(y - 58) + ' ' + (x + 10) + ' ' + f(y - 40) + '" stroke="#3a3f46" stroke-width="5" fill="none"/>' + txt(x, y - 13, label, 15, "#fff"); }
  // 5 — a real horse can briefly manage almost 15 PS
  shot(5, function (u, d) { return [lerp(300, 340, u / d), 200, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 20, 5, 0.8) + grass(t, 260, "grass-day", "#5f8a3a") + horse(300, 220, t * 1.6, { s: 1.0 });
    for (var i = 0; i < 6; i++) { var du = (t * 1.5 + i / 6) % 1; s += '<circle cx="' + f(200 - du * 120) + '" cy="' + f(290 - du * 20) + '" r="' + f(4 + du * 8) + '" fill="#c9b07a" opacity="' + f(0.7 * (1 - du)) + '"/>'; }
    var n = Math.round(15 * clamp((u - 0.4) / 1.4)); s += badge(500, 90, "≈ " + n + " PS", 150, INK, YEL);
    return s + tag("kurzzeitig!", 500, 160, u, 1.8, 3, 20);
  });
  // 6 — both engines run the same cycle: intake, compression, ignition, exhaust
  shot(6, function (u, d) { return [320, 170, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var ang = (t * 360 * 0.7) % 720, st = Math.floor(ang / 180), s = graphPaper(t) + cylinder(200, 80, ang % 360, t, { inV: st === 0, exV: st === 3, mix: st <= 1, fire: st === 2 ? 1 - (ang % 180) / 180 : 0, spark: st === 2 && ang % 180 < 30, smoke: st === 3 });
    var L4 = ["Ansaugen", "Verdichten", "Zünden", "Ausstoßen"]; for (var k = 0; k < 4; k++) s += '<g transform="translate(460 ' + (70 + k * 56) + ')"><rect x="-90" y="-20" width="180" height="40" rx="10" fill="' + (k === st ? YEL : "#fbfaf6") + '" stroke="' + INK + '" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans;fill:' + INK + '">' + (k + 1) + '. ' + L4[k] + '</text></g>';
    return s;
  });
  // 7 — the piston sucks in air and fuel and squeezes them together
  shot(7, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.3)), ang = 360 * k, s = graphPaper(t) + cylinder(220, 80, ang, t, { inV: k < 0.5 ? 1 : 0, mix: true, air: k < 0.5, spray: k < 0.5 });
    if (k > 0.5) s += arrow(330, 220, 330, 120, RED, 6, clamp((k - 0.5) * 4));
    return s + tag("Luft + Benzin", 120, 60, u, 0.3, -3, 16) + tag("zusammen!", 380, 90, u, d * 0.55, 3, 16);
  });
  // 8 — the spark plug fires and the explosion pushes the piston down
  shot(8, function (u, d) { var sh = u > 0.5 && u < 1.0 ? 6 * Math.sin(u * 80) : 0; return [220 + sh, 150, lerp(1.3, 1.2, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), ang = 180 * ease(k), s = graphPaper(t) + cylinder(220, 80, ang, t, { fire: u > 0.4 ? clamp(1.2 - k) : 0, spark: u > 0.25 && u < 0.6, mix: u < 0.4 });
    s += boom(220, 90, 60, clamp((u - 0.4) / 0.6)) + arrow(330, 120, 330, 230, YEL, 7, clamp((u - 0.5) / 0.5));
    return s + tag("Zündkerze", 110, 60, u, 0.2, -3, 15) + tag("Bumm!", 380, 70, u, 0.5, 3, 20, "#ffb08a");
  });
  // 9 — the crankshaft turns the up-and-down into turning
  shot(9, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var a = t * 4, s = graphPaper(t) + cylinder(180, 70, (a * 57.3) % 360, t, {});
    s += curl(180, 220, 70, -0.5, 2.6, YEL, 5, 1) + wheel(470, 190, 70, a * 57.3) + '<path d="M230 220 H400" stroke="#5a6068" stroke-width="10"/>';
    return s + tag("Kurbelwelle", 220, 330, u, 0.4, -3, 18) + tag("Drehung!", 480, 70, u, 1.4, 3, 20);
  });
  // 10 — the 150 PS engine often has only four cylinders and 1.5 litres
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineRow(320, 120, t, { n: 4, w: 56, h: 110, rpm: 1.5 });
    return s + badge(150, 60, "150 PS", 130, INK, "#bfe0ff") + tag("4 Zylinder", 200, 295, u, 0.6, -3, 20) + tag("1,5 Liter", 470, 295, u, 1.6, 3, 20);
  });
  // 11 — the 400 PS engine is for example a V8 with four litres
  shot(11, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + v8(320, 230, t, { s: 0.75, rpm: 1.5 });
    return s + badge(130, 60, "400 PS", 130, INK, YEL) + tag("V8", 520, 90, u, 0.5, 3, 28) + tag("4 Liter", 500, 300, u, 1.4, -3, 22);
  });
  // 12 — more displacement = more air and fuel per explosion
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var g = clamp((u - 0.3) / 1.2), s = graphPaper(t);
    s += mixBox(120, 100, 120, 130, 22, t, 0) + mixBox(lerp(380, 350, g), lerp(100, 50, g), lerp(120, 170, g), lerp(130, 180, g), Math.round(lerp(22, 44, g)), t, 50);
    s += txt(180, 258, "375 cm³", 20, "#bfe0ff") + txt(435, 258, "500 cm³", 20, YEL);
    return s + tag("Hubraum", 320, 40, u, 0.3, -2, 24) + tag("mehr pro Bumm", 300, 310, u, 1.6, 3, 18);
  });
  // 13 — more cylinders = more explosions per turn
  shot(13, function (u, d) { return [320, 180, lerp(1.06, 1.0, u / d)]; }, function (u, d, t) {
    var s = dark(t) + engineRow(180, 110, t, { n: 4, w: 34, h: 80, rpm: 1.2 }) + engineRow(460, 110, t, { n: 8, w: 30, h: 80, rpm: 1.2 });
    s += txt(180, 260, "2 pro Umdrehung", 18, "#bfe0ff") + txt(460, 260, "4 pro Umdrehung", 18, YEL);
    return s + tag("mehr Zylinder", 320, 320, u, 0.6, -2, 22);
  });
  // 14 — at 6000 rpm the four-cylinder bangs 200 times a second
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var rpm = clamp(u / 1.2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + tacho(150, 170, 90, 6 * rpm / 7, "x1000 U/min");
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * 25) + [0, 2, 3, 1][k]) % 4 === 0; s += '<rect x="' + (330 + k * 60) + '" y="100" width="44" height="90" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (352 + k * 60) + '" cy="120" r="26" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(200 * clamp((u - 0.5) / 1.6)); s += badge(440, 260, n + " pro Sekunde", 240, INK, "#bfe0ff");
    return s;
  });
  // 15 — in the V8 it's 400 times
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + v8(200, 230, t * 1.6, { s: 0.6, rpm: 3 });
    for (var k = 0; k < 8; k++) { var on = (Math.floor(t * 30) + k) % 4 === 0; s += '<rect x="' + (370 + (k % 4) * 52) + '" y="' + (70 + Math.floor(k / 4) * 70) + '" width="38" height="56" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (389 + (k % 4) * 52) + '" cy="' + (88 + Math.floor(k / 4) * 70) + '" r="22" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(400 * clamp(u / 1.2)); return s + badge(470, 270, n + " pro Sekunde", 240, INK, YEL);
  });
  // 16 — the second trick is the turbo
  shot(16, function (u, d) { var k = ease(u / d); return [320, 180, lerp(0.8, 1.0, k)]; }, function (u, d, t) {
    var s = workshop(t) + turbo(320, 170, t, { s: 0.9, spin: 2 + u * 3, cold: false, hot: false });
    return s + tag("Turbo", 320, 50, u, 0.3, -3, 30);
  });
  // 17 — the hot exhaust spins a turbine at up to 200,000 rpm
  shot(17, function (u, d) { return [lerp(300, 240, u / d), 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = dark(t) + turbo(320, 170, t, { s: 0.9, spin: 12, cold: false });
    var n = Math.round(200000 * clamp((u - 0.6) / 2)); s += badge(220, 320, n.toLocaleString("de-DE") + " U/min", 250, INK, "#ffb08a");
    return s + tag("Abgas", 130, 60, u, 0.4, -3, 20, "#f2a0a0") + tag("Turbine", 220, 40, u, 1.2, 3, 18);
  });
  // 18 — on the same shaft a compressor presses fresh air into the engine
  shot(18, function (u, d) { return [lerp(360, 400, u / d), 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = dark(t) + turbo(260, 170, t, { s: 0.9, spin: 12, cold: true });
    s += engineRow(540, 210, t, { n: 4, w: 30, h: 70, rpm: 1.5, s: 0.9 }) + '<path d="M420 236 C470 240 480 160 520 160" stroke="#5a6068" stroke-width="16" fill="none"/>';
    for (var c = 0; c < 6; c++) { var v = (t * 1.4 + c / 6) % 1; s += '<circle cx="' + f(lerp(420, 520, v)) + '" cy="' + f(lerp(236, 160, v)) + '" r="4" fill="' + CY + '"/>'; }
    return s + tag("Verdichter", 380, 60, u, 0.4, 3, 20, "#bfe0ff") + tag("frische Luft", 500, 330, u, 1.4, -3, 18);
  });
  // 19 — more air = more oxygen, so more fuel can burn
  shot(19, function (u, d) { var sh = u > 1.6 && u < 2.0 ? 5 * Math.sin(u * 80) : 0; return [320 + sh, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var g = clamp((u - 0.2) / 1.0), s = graphPaper(t) + mixBox(110, 90, 160, 160, Math.round(lerp(16, 44, g)), t, 7);
    s += boom(470, 170, lerp(40, 90, clamp((u - 1.4) / 0.8)), ((u - 1.4) * 1.2) % 1.2);
    return s + tag("O₂", 190, 60, u, 0.3, -3, 22, "#bfe0ff") + tag("mehr Benzin", 190, 300, u, 0.9, 3, 18) + tag("größerer Bumm!", 470, 320, u, 1.6, -3, 20, "#ffb08a");
  });
  // 20 — that's why the big engine often has two turbos instead of one
  shot(20, function (u, d) { return [320, 190, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + v8(320, 250, t, { s: 0.6, rpm: 2 }) + turbo(110, 120, t, { s: 0.42, spin: 10, cold: true }) + turbo(530, 120, t, { s: 0.42, spin: 10, cold: true });
    return s + tag("2 Turbos", 320, 50, u, 0.5, -3, 26);
  });
  // 21 — Audi even gets 400 PS from only five cylinders, with a lot of boost
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineRow(250, 120, t, { n: 5, w: 46, h: 100, rpm: 1.8 }) + turbo(520, 150, t, { s: 0.42, spin: 14, cold: true });
    return s + tag("Audi: 5 Zylinder", 250, 40, u, 0.4, -3, 20) + badge(520, 280, "400 PS", 130, INK, YEL) + tag("viel Ladedruck", 250, 330, u, 2.2, 3, 18, "#bfe0ff");
  });
  // 22 — careful: PS is not the same as torque
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + badge(170, 170, "PS", 110, INK, YEL) + badge(470, 170, "Drehmoment", 200, INK, "#bfe0ff");
    s += txt(320, 186, "≠", 60 + 6 * pulse(t, 6), RED) + engineer(320, 300, t, "worry", { s: 0.35 });
    return s + tag("Achtung!", 320, 60, u, 0.3, -3, 24, "#f2a0a0");
  });
  // 23 — torque is how hard the engine turns, and PS = torque × rpm
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.05, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), a = t * 3;
    s += '<g transform="translate(150 150)"><circle r="50" fill="url(#gGear)" stroke="' + INK + '" stroke-width="2.4"/><g transform="rotate(' + f(a * 57.3) + ')"><path d="M0 0 L110 0" stroke="#5a6068" stroke-width="14" stroke-linecap="round"/><rect x="96" y="-16" width="30" height="32" rx="6" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/></g><polygon points="-14,-8 14,-8 14,8 -14,8" fill="#2b2e33"/></g>';
    s += curl(150, 150, 140, -0.6, 2.4, "#bfe0ff", 5, 1);
    var k = clamp((u - 1.4) / 0.6); s += '<g opacity="' + f(k) + '">' + '<rect x="320" y="200" width="300" height="60" rx="12" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/>' + txt(470, 239, "PS = Drehmoment × Drehzahl", 18, YEL) + '</g>';
    return s + tag("wie kräftig", 150, 320, u, 0.4, -3, 20, "#bfe0ff");
  });
  // 24 — the Golf needs about 8.5 s to 100, the sports car about 4
  shot(24, function (u, d) { return [lerp(300, 360, u / d), 200, 1.0]; }, function (u, d, t) {
    var tt = clamp(u / (d - 0.4)) * 8.5, s = street(t, 300 + tt * 120);
    var p1 = Math.min(1, Math.pow(tt / 8.5, 2)), p2 = Math.min(1, Math.pow(tt / 4, 2));
    s += sportsCar(lerp(80, 560, p2), 230, t, { s: 0.55 }) + hatch(lerp(80, 560, p1), 300, t, { s: 0.55 });
    s += txt(110, 42, "400 PS", 16, YEL) + stopwatch(110, 90, 28, Math.min(tt, 4), 10, Math.min(tt, 4).toFixed(1) + " s", YEL) + txt(260, 42, "150 PS", 16, "#bfe0ff") + stopwatch(260, 90, 28, tt, 10, tt.toFixed(1) + " s", "#bfe0ff");
    return s + tag("0–100", 470, 60, u, 0.3, 3, 22);
  });
  // 25 — in return the strong engine drinks a lot more fuel and gets much hotter
  shot(25, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = workshop(t), fl = 1 - clamp(u / (d - 0.4)) * 0.8;
    s += '<g transform="translate(170 180)"><circle r="90" fill="#1c1c1c" stroke="#8a929c" stroke-width="4"/><path d="M-70 0 A70 70 0 0 1 70 0" stroke="#3a3f46" stroke-width="14" fill="none"/><path d="M0 0 L' + f(-Math.cos(fl * Math.PI) * 64) + ' ' + f(-Math.sin(fl * Math.PI) * 64) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="' + RED + '"/>' + txt(-60, 30, "E", 18, "#fff") + txt(60, 30, "F", 18, "#fff") + '</g>';
    var th = clamp(u / 1.6); s += '<rect x="440" y="60" width="30" height="200" rx="15" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><rect x="446" y="' + f(250 - 180 * th) + '" width="18" height="' + f(180 * th + 4) + '" rx="9" fill="' + RED + '"/><circle cx="455" cy="270" r="26" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>';
    for (var h = 0; h < 4; h++) { var hu = (t * 0.8 + h / 4) % 1; s += '<path d="M' + (520 + h * 18) + ' ' + f(260 - hu * 120) + ' q8 -12 0 -24 q-8 -12 0 -24" stroke="#ff7a2a" stroke-width="3" fill="none" opacity="' + f(1 - hu) + '"/>'; }
    return s + tag("mehr Benzin", 170, 320, u, 0.4, -3, 20) + tag("heißer!", 500, 40, u, 1.4, 3, 22, "#f2a0a0");
  });
  // 26 — in the end it's the same explosion: bigger, more often, with more air
  shot(26, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = dark(t) + boom(320, 170, 80, (t * 1.4) % 1.2);
    return s + tag("größer", 130, 80, u, 0.5, -3, 22) + tag("öfter", 500, 80, u, 1.0, 3, 22, "#bfe0ff") + tag("mehr Luft", 320, 310, u, 1.6, -2, 22, "#bde8b0");
  });
  // 27 — outro
  shot(27, function (u, d) { return [lerp(300, 360, clamp(u / d)), 190, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 40, 30, 6, 0.85) + city(t, 250, 100, "#7a6a5a", true, 9, false) + road(t, 280, 500) + sportsCar(420, 270, t, { s: 0.7 }) + hatch(200, 268, t, { s: 0.65 });
    return s + engineer(560, 150, t, "happy", { s: 0.4, wave: true }) + tag("Sagt uns!", 320, 80, u, 0.4, 3, 26);
  });

  window.__parts = { car: car, hatch: hatch, sportsCar: sportsCar, engineRow: engineRow, v8: v8, turbo: turbo, horse: horse, cylinder: cylinder, boom: boom, tag: tag, engineer: engineer, badge: badge, workshop: workshop, dark: dark, street: street, road: road };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
