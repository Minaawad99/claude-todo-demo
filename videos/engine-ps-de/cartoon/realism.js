  // ── more realistic redraws (after the reference photos, see ../refs/SOURCES.md); these replace the simpler versions above ──
  function alloy(x, y, r, ang, o) {   // a modern alloy wheel: dark tyre with sidewall, 10 split spokes, brake disc + caliper
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#1c1e21" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(r * 0.94) + '" fill="none" stroke="#3a3d42" stroke-width="1.4"/><circle r="' + f(r * 0.7) + '" fill="#5a6068" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<circle r="' + f(r * 0.5) + '" fill="#8a929c" opacity=".6"/><path d="M' + f(r * 0.2) + ' ' + f(-r * 0.62) + ' a8 8 0 0 1 ' + f(r * 0.3) + ' ' + f(r * 0.1) + '" stroke="' + (o.caliper || "#c23a26") + '" stroke-width="' + f(r * 0.16) + '" fill="none"/>';
    s += '<g transform="rotate(' + f(ang) + ')">'; for (var k = 0; k < 5; k++) s += '<g transform="rotate(' + (k * 72) + ')"><path d="M-2 ' + f(-r * 0.16) + ' L' + f(-r * 0.12) + ' ' + f(-r * 0.68) + ' M2 ' + f(-r * 0.16) + ' L' + f(r * 0.12) + ' ' + f(-r * 0.68) + '" stroke="#d9dee3" stroke-width="' + f(r * 0.09) + '" stroke-linecap="round"/></g>';
    return s + '<circle r="' + f(r * 0.16) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/></g></g>'; }
  // a VW-Golf-like compact hatchback (no badge): short bonnet, steep windscreen, long flat roof, thick C-pillar, upright tailgate,
  // slim LED headlight, wide horizontal tail-light
  function hatch(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 400 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="34" rx="156" ry="8" fill="#000" opacity=".25"/>';
    s += '<path d="M-150 16 C-154 -6 -150 -24 -142 -32 L-128 -40 C-118 -56 -104 -62 -84 -63 L4 -63 C20 -62 30 -58 40 -50 L74 -26 L128 -20 C146 -17 154 -8 154 6 L152 16 Z" fill="' + (o.col || "url(#gCarB)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-124 -38 C-114 -52 -102 -57 -86 -58 L-60 -58 L-56 -30 L-122 -30 Z" fill="#1f2d3a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-50 -58 L-6 -58 L-4 -30 L-46 -30 Z M2 -58 C18 -58 28 -54 36 -48 L62 -30 L4 -30 Z" fill="#2b3e52" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-60 -60 L-54 -28" stroke="' + INK + '" stroke-width="7"/><path d="M-140 -14 C-60 -18 60 -18 150 -10" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="M-148 -4 H150" stroke="' + INK + '" stroke-width="1" opacity=".35"/>';
    s += '<path d="M-2 -28 V12 M-50 -28 V12" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><rect x="-36" y="-22" width="12" height="3" rx="1.5" fill="#1c1c1c"/><rect x="14" y="-22" width="12" height="3" rx="1.5" fill="#1c1c1c"/>';
    s += '<path d="M34 -36 l10 -2 l2 8 l-10 0 Z" fill="' + (o.col || "url(#gCarB)") + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M128 -18 L152 -12 L150 -6 L130 -10 Z" fill="#eaf6ff" stroke="' + INK + '" stroke-width="1.2"/><path d="M130 -12 h18" stroke="#9fe0ff" stroke-width="1.6"/><path d="M-152 -26 h20 v6 h-20 Z" fill="#d8352a" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M-150 10 h22 M128 10 h24" stroke="#1c1c1c" stroke-width="4" opacity=".6"/>';
    s += '<path d="M-124 16 a30 30 0 0 1 60 0 M68 16 a30 30 0 0 1 60 0" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    s += alloy(-94, 16, 26, sp) + alloy(98, 16, 26, sp);
    return s + '</g>';
  }
  // a Porsche-911-like coupé (no badge): low nose with the headlights as round bulges on the wings, raked windscreen,
  // the long fastback roofline, wide rear haunch, ducktail spoiler, tail-light bar
  function sportsCar(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 500 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="36" rx="162" ry="8" fill="#000" opacity=".25"/>';
    s += '<path d="M-156 14 C-160 -2 -158 -14 -150 -20 L-140 -24 C-128 -34 -110 -46 -84 -54 C-56 -62 -30 -62 -12 -58 C6 -54 22 -44 40 -30 L104 -22 C126 -26 140 -22 150 -14 C158 -8 162 2 160 14 Z" fill="' + (o.col || "url(#gSport)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-150 -22 L-158 -26 L-154 -30 L-138 -26 Z" fill="#1c1c1c"/>';
    s += '<path d="M-96 -46 C-74 -56 -46 -58 -24 -55 L-10 -30 L-104 -30 Z" fill="#1f2d3a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-4 -52 C10 -48 22 -40 32 -30 L-4 -30 Z" fill="#2b3e52" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-60 -54 L-58 -30" stroke="' + INK + '" stroke-width="2" opacity=".6"/><ellipse cx="112" cy="-24" rx="18" ry="7" fill="#eaf6ff" stroke="' + INK + '" stroke-width="1.4"/><path d="M-156 -12 H-132" stroke="#d8352a" stroke-width="4"/>';
    s += '<path d="M-130 -28 C-80 -30 40 -26 120 -16" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="M-10 -28 V12" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><rect x="-26" y="-20" width="10" height="3" rx="1.5" fill="#1c1c1c"/>';
    s += '<path d="M-140 -2 h30" stroke="#1c1c1c" stroke-width="3" opacity=".5"/><path d="M-80 4 C-60 6 -40 6 -20 4" stroke="' + INK + '" stroke-width="1" opacity=".4"/>';
    s += '<path d="M-128 14 a32 32 0 0 1 64 0 M70 14 a30 30 0 0 1 60 0" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    s += alloy(-96, 14, 28, sp, { caliper: "#f2c230" }) + alloy(100, 14, 26, sp, { caliper: "#f2c230" });
    return s + '</g>';
  }
  // an inline engine from the side, as in the cut-away photos: aluminium block with a cut window (bores + pistons),
  // head, ribbed valve cover with oil filler cap, intake runners above, exhaust manifold in front, timing cover + pulleys + belt
  function engineRow(x, y, t, o) {
    o = o || {}; var n = o.n || 4, w = o.w || 40, h = o.h || 90, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', W = n * w + 20, rpm = o.rpm || 2, X0 = -W / 2, X1 = W / 2;
    var ORD = n === 4 ? [0, 2, 3, 1] : n === 5 ? [0, 3, 1, 4, 2] : [0, 4, 2, 6, 1, 5, 3, 7];
    // intake runners behind (curving up to a plenum)
    for (var r = 0; r < n; r++) { var rx = X0 + 10 + w / 2 + r * w; s += '<path d="M' + f(rx) + ' -28 C' + f(rx) + ' -60 ' + f(rx + w * 0.3) + ' -62 ' + f(rx + w * 0.3) + ' -70" stroke="#3a3f46" stroke-width="' + f(w * 0.42) + '" fill="none"/><path d="M' + f(rx) + ' -28 C' + f(rx) + ' -60 ' + f(rx + w * 0.3) + ' -62 ' + f(rx + w * 0.3) + ' -70" stroke="#6a727c" stroke-width="' + f(w * 0.3) + '" fill="none"/>'; }
    s += '<rect x="' + f(X0 + 4) + '" y="-88" width="' + f(W - 8) + '" height="20" rx="10" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.2"/>';
    // valve cover (ribbed) + head
    s += '<path d="M' + f(X0 - 4) + ' -6 L' + f(X0 + 4) + ' -30 H' + f(X1 - 4) + ' L' + f(X1 + 4) + ' -6 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var rb = X0 + 14; rb < X1 - 8; rb += 12) s += '<path d="M' + f(rb) + ' -27 V-9" stroke="#8a929c" stroke-width="2"/>';
    s += '<rect x="' + f(X1 - 34) + '" y="-40" width="18" height="10" rx="3" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<rect x="' + f(X0 - 8) + '" y="-6" width="' + f(W + 16) + '" height="16" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.2"/>';
    // exhaust manifold behind the block: only the collector shows, coming out at the back end (left) and going down
    s += '<path d="M' + f(X0 + 10) + ' 2 C' + f(X0 - 20) + ' 4 ' + f(X0 - 34) + ' 30 ' + f(X0 - 36) + ' ' + (h + 30) + '" stroke="#7a4a2a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M' + f(X0 + 10) + ' 2 C' + f(X0 - 20) + ' 4 ' + f(X0 - 34) + ' 30 ' + f(X0 - 36) + ' ' + (h + 30) + '" stroke="#a8683a" stroke-width="5" fill="none" stroke-linecap="round"/>';
    // block with the cut window
    s += '<rect x="' + f(X0 - 4) + '" y="10" width="' + f(W + 8) + '" height="' + (h + 4) + '" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var i = 0; i < n; i++) {
      var cx = X0 + 10 + w / 2 + i * w, ph = (t * rpm + ORD[i] / n) % 1, py = 16 + (h - 50) * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      s += '<rect x="' + f(cx - w / 2 + 4) + '" y="12" width="' + (w - 8) + '" height="' + (h - 2) + '" fill="#2b2e33" stroke="#1c1c1c" stroke-width="1"/><rect x="' + f(cx - w / 2 + 4) + '" y="12" width="4" height="' + (h - 2) + '" fill="#5a6068" opacity=".6"/>';
      if (ph < 0.12 && o.fire !== false) s += '<rect x="' + f(cx - w / 2 + 4) + '" y="12" width="' + (w - 8) + '" height="' + f(py - 12) + '" fill="url(#gBoom)" opacity="' + f(1 - ph / 0.12) + '"/>';
      s += '<path d="M' + f(cx - w / 2 + 5) + ' ' + f(py) + ' h' + (w - 10) + ' v18 c0 4 -3 7 -6 7 h' + (-(w - 22)) + ' c-3 0 -6 -3 -6 -7 Z" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(cx - w / 2 + 5) + ' ' + f(py + 4) + ' h' + (w - 10) + ' M' + f(cx - w / 2 + 5) + ' ' + f(py + 8) + ' h' + (w - 10) + '" stroke="#3a3f46" stroke-width="1.2"/>';
      s += '<path d="M' + f(cx) + ' ' + f(py + 20) + ' L' + f(cx + 6 * Math.sin(ph * Math.PI * 4)) + ' ' + (h + 14) + '" stroke="#8a929c" stroke-width="7" stroke-linecap="round"/>';
    }
    s += '<path d="M' + f(X0 - 4) + ' ' + (h + 14) + ' H' + f(X1 + 4) + '" stroke="#5a6068" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + f(X0 - 4) + ' ' + (h + 14) + ' h' + f(W + 8) + ' v18 c0 10 -20 14 -' + f(W / 2) + ' 14 c-' + f(W / 2 - 20) + ' 0 -' + f(W / 2 - 4) + ' -4 -' + f(W / 2 + 8) + ' -14 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.2"/>';
    // timing cover with pulleys and the belt at the front end (right)
    var pa = t * rpm * 720;
    s += '<rect x="' + f(X1 + 4) + '" y="-24" width="16" height="' + (h + 46) + '" rx="6" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + f(X1 + 30) + ' -16 L' + f(X1 + 30) + ' ' + (h + 18) + '" stroke="#1c1c1c" stroke-width="5" stroke-dasharray="6 4" stroke-dashoffset="' + f(-pa * 0.2) + '"/>';
    [[-14, 12], [h + 14, 16], [h * 0.5, 10]].forEach(function (pp, k) { s += '<g transform="translate(' + f(X1 + 30 + (k === 2 ? 14 : 0)) + ' ' + f(pp[0]) + ') rotate(' + f(pa * (k ? 1 : 0.5)) + ')"><circle r="' + pp[1] + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/><path d="M0 ' + (-pp[1] + 3) + ' V' + (pp[1] - 3) + '" stroke="#3a3f46" stroke-width="2"/><circle r="3" fill="' + INK + '"/></g>'; });
    return s + '</g>';
  }
  // a V8 from the front, after the Holden V8 photo: two banks at 90° with ribbed valve covers, the intake manifold in the
  // valley, red plug leads, the front pulleys with the belt; a cut window in each bank shows the pistons
  function v8(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', rpm = o.rpm || 2;
    s += '<path d="M-120 -60 L-30 30 L30 30 L120 -60 L100 -84 L0 10 L-100 -84 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="3"/>';
    [-1, 1].forEach(function (sg, b) { var g = '<g transform="rotate(' + (sg * 45) + ')">';
      var ph = (t * rpm + b * 0.25) % 1, py = -150 + 40 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      g += '<rect x="-42" y="-196" width="84" height="170" rx="4" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-188" width="60" height="150" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.6"/>';
      if (ph % 0.5 < 0.08) g += '<rect x="-30" y="-188" width="60" height="' + f(py + 188) + '" fill="url(#gBoom)"/>';
      g += '<path d="M-28 ' + f(py) + ' h56 v22 c0 5 -4 8 -8 8 h-40 c-4 0 -8 -3 -8 -8 Z" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/><path d="M-28 ' + f(py + 5) + ' h56 M-28 ' + f(py + 10) + ' h56" stroke="#3a3f46" stroke-width="1.4"/><path d="M0 ' + f(py + 30) + ' L0 -10" stroke="#8a929c" stroke-width="9" stroke-linecap="round"/>';
      g += '<rect x="-50" y="-222" width="100" height="28" rx="5" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-46 -222 C-46 -250 46 -250 46 -222 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var rb = -36; rb <= 36; rb += 12) g += '<path d="M' + rb + ' -242 V-226" stroke="#8a929c" stroke-width="2"/>';
      g += '<path d="M' + (sg * 46) + ' -208 C' + (sg * 80) + ' -200 ' + (sg * 70) + ' -150 ' + (sg * 40) + ' -120" stroke="#c8261c" stroke-width="4" fill="none"/>';
      s += g + '</g>'; });
    // intake manifold in the valley, with the throttle body
    s += '<path d="M-60 -70 L-24 -150 H24 L60 -70 Z" fill="#6a727c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 -140 H30" stroke="#8a929c" stroke-width="3"/><circle cx="0" cy="-118" r="16" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/><path d="M-10 -118 H10" stroke="#c9ced4" stroke-width="3" transform="rotate(' + f(t * 40) + ' 0 -118)"/>';
    // front pulleys and belt
    var pa = t * rpm * 720;
    s += '<path d="M0 50 L-62 -10 L62 -10 Z" fill="none" stroke="#1c1c1c" stroke-width="6" stroke-linejoin="round" stroke-dasharray="8 4" stroke-dashoffset="' + f(-pa * 0.3) + '"/>';
    [[0, 50, 26], [-62, -10, 16], [62, -10, 18]].forEach(function (p) { s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + f(pa) + ')"><circle r="' + p[2] + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 ' + (-p[2] + 4) + ' V' + (p[2] - 4) + ' M' + (-p[2] + 4) + ' 0 H' + (p[2] - 4) + '" stroke="#3a3f46" stroke-width="2.4"/><circle r="4" fill="' + INK + '"/></g>'; });
    s += '<path d="M-60 60 C-60 100 60 100 60 60 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // the turbocharger cut open (from cut-away turbos): cast-iron turbine snail glowing at the rim, aluminium compressor snail,
  // the centre bearing housing with its oil lines, and the round wastegate actuator
  function turbo(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, sp = (o.spin == null ? 6 : o.spin) * t * 360, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    function snail(cx, fill, flip) { var k = flip ? -1 : 1; return '<path d="M' + (cx - 66 * k) + ' 0 A66 66 0 1 ' + (flip ? 0 : 1) + ' ' + (cx + 22 * k) + ' 62 L' + (cx + 76 * k) + ' 62 L' + (cx + 76 * k) + ' 88 L' + (cx + 10 * k) + ' 88 A88 88 0 0 ' + (flip ? 1 : 0) + ' ' + (cx - 66 * k) + ' 0 Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/><rect x="' + (cx + (flip ? -84 : 70)) + '" y="56" width="14" height="38" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + cx + '" cy="0" r="64" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/>'; }
    function wheelBlades(cx, col) { var g = '<g transform="translate(' + cx + ' 0) rotate(' + f(sp) + ')"><circle r="46" fill="#1f2328"/>'; for (var k = 0; k < 11; k++) g += '<path d="M0 0 Q20 -12 44 -6 L44 6 Q18 -2 0 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + (k * 32.7) + ')"/>'; return g + '<circle r="11" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><circle r="3" fill="' + INK + '"/></g>'; }
    s += snail(-110, "#4b4f55", true) + '<circle cx="-110" cy="0" r="64" fill="none" stroke="#ff7a2a" stroke-width="4" opacity="' + f(0.35 + 0.25 * Math.sin(t * 3)) + '" filter="url(#glow)"/>' + snail(110, "url(#gSnail)", false);
    for (var b = 0; b < 8; b++) { var ba = b * Math.PI / 4; s += '<circle cx="' + f(-110 + Math.cos(ba) * 58) + '" cy="' + f(Math.sin(ba) * 58) + '" r="2.6" fill="#2b2e33"/><circle cx="' + f(110 + Math.cos(ba) * 58) + '" cy="' + f(Math.sin(ba) * 58) + '" r="2.6" fill="#5a6068"/>'; }
    s += '<path d="M-56 -22 H56 L48 22 H-48 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -22 V-46 H20 V-22 M-10 22 V40 H10 V22" stroke="#c9a04e" stroke-width="5" fill="none"/><path d="M-110 0 H110" stroke="#d9dee3" stroke-width="8"/>';
    s += '<circle cx="150" cy="-88" r="22" fill="#b9c0c8" stroke="' + INK + '" stroke-width="2.2"/><path d="M150 -66 L120 -40" stroke="#5a6068" stroke-width="4"/>';
    s += wheelBlades(-110, "#c98a5a") + wheelBlades(110, "#d9dee3");
    if (o.hot !== false) for (var e = 0; e < 8; e++) { var u = (t * 1.3 + e / 8) % 1; s += '<circle cx="' + f(-230 + u * 90) + '" cy="' + f(70 - u * 60 + Math.sin(e) * 6) + '" r="' + f(6 + u * 3) + '" fill="#8a857a" opacity="' + f(0.8 * (1 - u * 0.6)) + '"/>'; }
    if (o.cold) for (var c = 0; c < 10; c++) { var v = (t * 1.6 + c / 10) % 1; s += '<circle cx="' + f(lerp(110, 260, v)) + '" cy="' + f(lerp(0, 72, v) + Math.sin(c) * 5) + '" r="4" fill="' + CY + '" opacity="' + f(1 - v * 0.4) + '"/>'; }
    return s + '</g>';
  }
  // a horse in side view with real proportions: deep chest, arched neck, long tapering head, thin legs with knees, hocks
  // and dark hooves, mane and tail; it trots (diagonal leg pairs move together). Faces right.
  function horse(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y - Math.abs(Math.sin(t * 6)) * 3) + ') scale(' + (o.s || 1) + ')">', st = Math.sin(t * 6);
    function leg(hx, hy, sw, front, far) {   // hip/shoulder at (hx, hy), swing sw (-1..1)
      var kx = hx + sw * 10 + (front ? 4 : -4), ky = hy + 34, fx = kx + sw * 8, fy = hy + 72 - Math.max(0, sw) * 8, col = far ? "#5a3a1e" : "#7a4f2a";
      return '<path d="M' + hx + ' ' + hy + ' L' + f(kx) + ' ' + f(ky) + ' L' + f(fx) + ' ' + f(fy) + '" stroke="' + col + '" stroke-width="' + (far ? 8 : 9) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M' + f(fx - 5) + ' ' + f(fy + 4) + ' h11 l-2 -7 h-7 Z" fill="#1c1c1c"/>'; }
    s += leg(-46, 6, -st, false, true) + leg(44, 6, st, true, true);
    s += '<path d="M-62 -6 C-90 -4 -100 30 -92 60 C-86 40 -78 20 -64 8" fill="#3a2412" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + f(Math.sin(t * 4) * 6) + ' -62 -6)"/>';
    s += '<path d="M-64 -10 C-70 -30 -50 -40 -20 -38 C10 -36 40 -40 56 -34 C70 -28 70 0 62 14 C50 30 20 28 -10 26 C-40 28 -60 22 -64 -10 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M40 -36 C52 -60 70 -84 84 -92 C92 -96 100 -94 104 -88 L126 -60 C130 -54 128 -48 120 -48 C112 -48 106 -52 100 -58 L86 -66 C80 -50 72 -30 62 -14 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<circle cx="104" cy="-78" r="3" fill="' + INK + '"/><path d="M92 -94 L96 -110 L102 -92 Z" fill="#7a4f2a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="122" cy="-54" r="2" fill="' + INK + '"/>';
    s += '<path d="M88 -92 C74 -80 62 -60 52 -38" stroke="#3a2412" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M84 -86 C76 -76 70 -66 62 -52" stroke="#2a1a0c" stroke-width="3" fill="none"/>';
    s += '<path d="M-30 -30 C-10 -34 20 -34 40 -30" stroke="#c9905a" stroke-width="3" fill="none" opacity=".6"/>';
    s += leg(-50, 10, st, false, false) + leg(48, 10, -st, true, false);
    return s + '</g>';
  }

