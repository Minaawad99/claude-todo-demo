  // ── new pieces for this episode ─────────────────────────
  var INK = "#1c1c1c", TG = "#2fae5a", TO = "#f29a2e", TR = "#d8352a", TD = "#8a1a14", NAV = "#2f7fe0", CLIPN = 0;
  function carSide(x, y, t, s, col) {   // a family car, side view, wheels turning
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return c + '</g>';
  }
  // a map navigation app, drawn in screen coordinates 0..w × 0..h. o: { jam 0..1 (how much of the route is red), alt 0..1 (faster route), eta text, mins, pin, dots }
  function navApp(w, h, t, o) {
    o = o || {}; var s = '<rect width="' + w + '" height="' + h + '" fill="#f2efe9"/>';
    // blocks, a park, the river
    for (var b = 0; b < 14; b++) { var bx = (hash(b) * w * 1.1) - 10, by = hash(b + 3) * h; s += '<rect x="' + f(bx) + '" y="' + f(by) + '" width="' + f(w * 0.18) + '" height="' + f(h * 0.08) + '" rx="2" fill="#e4dfd4"/>'; }
    s += '<path d="M' + f(w * 0.62) + ' ' + f(h * 0.2) + ' h' + f(w * 0.3) + ' v' + f(h * 0.14) + ' h' + f(-w * 0.3) + ' Z" fill="#cfe6c4"/><path d="M0 ' + f(h * 0.78) + ' C' + f(w * 0.3) + ' ' + f(h * 0.72) + ' ' + f(w * 0.6) + ' ' + f(h * 0.86) + ' ' + w + ' ' + f(h * 0.8) + ' V' + f(h * 0.88) + ' C' + f(w * 0.6) + ' ' + f(h * 0.94) + ' ' + f(w * 0.3) + ' ' + f(h * 0.8) + ' 0 ' + f(h * 0.86) + ' Z" fill="#aad3f0"/>';
    // streets
    [0.18, 0.42, 0.66].forEach(function (yy) { s += '<path d="M0 ' + f(h * yy) + ' H' + w + '" stroke="#fff" stroke-width="' + f(w * 0.05) + '"/><path d="M0 ' + f(h * yy) + ' H' + w + '" stroke="#d9d4c8" stroke-width="' + f(w * 0.05 + 2) + '" opacity=".4"/>'; });
    [0.25, 0.55, 0.82].forEach(function (xx) { s += '<path d="M' + f(w * xx) + ' 0 V' + h + '" stroke="#fff" stroke-width="' + f(w * 0.045) + '"/>'; });
    // the route: from the car (bottom) up and right to the destination, coloured by traffic
    var R = [[0.25, 0.95], [0.25, 0.66], [0.25, 0.42], [0.55, 0.42], [0.55, 0.18], [0.82, 0.18], [0.82, 0.06]], jam = clamp(o.jam || 0), lw = w * 0.045;
    var cols = [TG, jam > 0.3 ? TO : TG, jam > 0.6 ? TR : jam > 0.3 ? TO : TG, jam > 0.6 ? TD : TO, TG, TG];
    s += '<path d="M' + R.map(function (p) { return f(p[0] * w) + ' ' + f(p[1] * h); }).join(' L') + '" stroke="#1a5ab0" stroke-width="' + f(lw + 3) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    for (var i = 0; i < R.length - 1; i++) s += '<path d="M' + f(R[i][0] * w) + ' ' + f(R[i][1] * h) + ' L' + f(R[i + 1][0] * w) + ' ' + f(R[i + 1][1] * h) + '" stroke="' + cols[i] + '" stroke-width="' + f(lw) + '" stroke-linecap="round"' + (cols[i] === TR || cols[i] === TD ? ' opacity="' + f(0.8 + 0.2 * Math.sin(t * 6)) + '"' : '') + '/>';
    if (o.alt) { var A = [[0.25, 0.66], [0.82, 0.66], [0.82, 0.06]]; s += '<path d="M' + A.map(function (p) { return f(p[0] * w) + ' ' + f(p[1] * h); }).join(' L') + '" stroke="' + NAV + '" stroke-width="' + f(lw * 0.8) + '" fill="none" stroke-dasharray="' + f(lw) + ' ' + f(lw * 0.6) + '" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(o.alt) + '" stroke-linecap="round"/>';
      s += '<g transform="translate(' + f(w * 0.82) + ' ' + f(h * 0.5) + ') scale(' + f(o.alt) + ')"><rect x="' + f(-w * 0.2) + '" y="' + f(-h * 0.035) + '" width="' + f(w * 0.4) + '" height="' + f(h * 0.07) + '" rx="' + f(h * 0.02) + '" fill="' + NAV + '"/><text y="' + f(h * 0.015) + '" text-anchor="middle" style="font:800 ' + f(w * 0.06) + 'px Noto Sans Arabic;fill:#fff">أسرع بـ 7 د</text></g>'; }
    // destination pin + the blue arrow (you), creeping along the first leg
    s += '<g transform="translate(' + f(0.82 * w) + ' ' + f(0.06 * h) + ')"><path d="M0 0 C' + f(-w * 0.05) + ' ' + f(-h * 0.03) + ' ' + f(-w * 0.04) + ' ' + f(-h * 0.07) + ' 0 ' + f(-h * 0.07) + ' C' + f(w * 0.04) + ' ' + f(-h * 0.07) + ' ' + f(w * 0.05) + ' ' + f(-h * 0.03) + ' 0 0 Z" fill="' + TR + '" stroke="#8a1a14" stroke-width="1"/><circle cy="' + f(-h * 0.045) + '" r="' + f(w * 0.015) + '" fill="#fff"/></g>';
    var ay = lerp(0.9, 0.7, (t * 0.04) % 1) * h, ax = 0.25 * w; s += '<circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="' + f(w * 0.06) + '" fill="' + NAV + '" opacity=".2"/><path d="M' + f(ax) + ' ' + f(ay - w * 0.04) + ' L' + f(ax + w * 0.03) + ' ' + f(ay + w * 0.03) + ' L' + f(ax) + ' ' + f(ay + w * 0.015) + ' L' + f(ax - w * 0.03) + ' ' + f(ay + w * 0.03) + ' Z" fill="' + NAV + '" stroke="#fff" stroke-width="1.6"/>';
    if (o.dots) for (var d = 0; d < 18; d++) { var u = (t * (0.05 + hash(d) * 0.05) + hash(d + 2)) % 1, dd = d % 3, px = dd === 0 ? u * w : dd === 1 ? w * [0.25, 0.55, 0.82][d % 3] : u * w, py = dd === 0 ? h * 0.42 : dd === 1 ? u * h : h * 0.66; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(w * 0.012) + '" fill="#5a6068" opacity=".7"/>'; }
    // top banner (next turn) and bottom card (time, distance)
    s += '<rect width="' + w + '" height="' + f(h * 0.11) + '" fill="#0f6a4a"/><path d="M' + f(w * 0.1) + ' ' + f(h * 0.08) + ' V' + f(h * 0.04) + ' H' + f(w * 0.17) + '" stroke="#fff" stroke-width="' + f(w * 0.02) + '" fill="none"/><path d="M' + f(w * 0.17) + ' ' + f(h * 0.025) + ' l' + f(w * 0.03) + ' ' + f(h * 0.015) + ' l' + f(-w * 0.03) + ' ' + f(h * 0.015) + ' Z" fill="#fff"/><text x="' + f(w * 0.6) + '" y="' + f(h * 0.07) + '" text-anchor="middle" style="font:800 ' + f(w * 0.065) + 'px Noto Sans Arabic;fill:#fff">يمين بعد ٢٠٠ م</text>';
    var mins = o.mins || 18, late = jam > 0.5;
    s += '<rect y="' + f(h * 0.86) + '" width="' + w + '" height="' + f(h * 0.14) + '" fill="#fff"/><rect x="' + f(w * 0.42) + '" y="' + f(h * 0.875) + '" width="' + f(w * 0.16) + '" height="' + f(h * 0.008) + '" rx="2" fill="#d9d4c8"/>';
    s += '<text x="' + f(w * 0.72) + '" y="' + f(h * 0.94) + '" text-anchor="middle" style="font:800 ' + f(w * 0.085) + 'px Noto Sans Arabic;fill:' + (late ? TR : TG) + '">' + mins + ' دقيقة</text><text x="' + f(w * 0.25) + '" y="' + f(h * 0.94) + '" text-anchor="middle" style="font:700 ' + f(w * 0.055) + 'px Noto Sans Arabic;fill:#5a6068">' + (o.eta || "7 كم") + '</text>';
    return s;
  }
  function phoneIn(x, y, s, t, inner, o) {   // a phone in a hand; inner(w, h) draws its screen
    o = o || {}; var w = 150, h = 300, id = "ph" + (++CLIPN), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ') rotate(' + f((o.rot || -6) + Math.sin(t * 1.3) * 1.2) + ')">';
    if (o.hand !== false) g += '<path d="M-110 210 C-100 140 -96 100 -80 60 L-60 70 C-70 110 -74 150 -60 200 Z" fill="#e0b48a" stroke="' + INK + '" stroke-width="3"/>';
    g += '<rect x="' + (-w / 2 - 10) + '" y="' + (-h / 2 - 14) + '" width="' + (w + 20) + '" height="' + (h + 28) + '" rx="24" fill="#1c1e22" stroke="' + INK + '" stroke-width="3"/><clipPath id="' + id + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + (-w / 2) + ' ' + (-h / 2) + ')">' + inner(w, h) + '</g></g>';
    g += '<rect x="-16" y="' + (-h / 2 - 8) + '" width="32" height="8" rx="4" fill="#000"/><path d="M' + (-w / 2 + 8) + ' ' + (-h / 2 + 10) + ' L' + (-w / 2 + 40) + ' ' + (-h / 2 + 10) + ' L' + (-w / 2 + 8) + ' ' + (-h / 2 + 90) + ' Z" fill="#fff" opacity=".08"/>';
    if (o.hand !== false) g += '<path d="M' + (w / 2 + 4) + ' 30 C' + (w / 2 + 30) + ' 40 ' + (w / 2 + 34) + ' 80 ' + (w / 2 + 6) + ' 96 M' + (w / 2 + 4) + ' 100 C' + (w / 2 + 30) + ' 110 ' + (w / 2 + 30) + ' 150 ' + (w / 2 + 4) + ' 160" stroke="' + INK + '" stroke-width="3" fill="#e0b48a"/><path d="M' + (-w / 2 - 6) + ' 40 C' + (-w / 2 - 30) + ' 50 ' + (-w / 2 - 30) + ' 90 ' + (-w / 2 - 4) + ' 100" stroke="' + INK + '" stroke-width="3" fill="#e0b48a"/>';
    return g + '</g>';
  }
  // the street seen from the side: buildings behind, pavement, the road; cars at speed v (px/s), bunched when jam
  function street(t, o) {
    o = o || {}; var s = sky(o.sky || "day") + clouds(t, 10, 30, 4, 0.8) + city(t, 210, 120, "#c79a7b", true, 4, false) + '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="#c9c4b8"/>';
    s += '<path d="M-400 286 H1040" stroke="#f4f1e8" stroke-width="4" stroke-dasharray="30 24" stroke-dashoffset="' + f(o.jam > 0.5 ? -t * 10 : -t * 120) + '"/>';
    for (var l = 0; l < 8; l++) { var lx = -300 + l * 180; s += '<path d="M' + lx + ' 210 V120 h20" stroke="#3a3d42" stroke-width="4" fill="none"/><circle cx="' + (lx + 22) + '" cy="124" r="5" fill="#ffe9a0"/>'; }
    var jam = clamp(o.jam || 0), cols = ["#c23a26", "#2f6f9f", "#f4f1e8", "#e2b035", "#4f8f5a", "#9aa2ac", "#3a3d42", "#7a5ab0"];
    for (var k = 0; k < 8; k++) { var free = ((t * (o.v || 160) + k * 220) % 1760) - 400, packed = 560 - k * 112 + Math.sin(t * 0.8 + k) * 3, x = lerp(free, packed, jam); s += carSide(x, 262, t * (1 - jam * 0.9), 0.62, cols[k]); if (jam > 0.5) s += '<circle cx="' + f(x - 56) + '" cy="' + f(256) + '" r="5" fill="#ff3b2f" filter="url(#glow)"/>'; }
    for (var j = 0; j < 4; j++) { var x2 = 1040 - (((t * 150 + j * 380) % 1600)); s += '<g transform="translate(' + f(x2) + ' 318) scale(-1 1)">' + carSide(0, 0, t, 0.62, cols[(j + 3) % 8]) + '</g>'; }
    return s;
  }
  // a GPS satellite (Block IIF / III look): gold-foil box, antenna array facing Earth, two long solar wings
  function gpsSat(x, y, s, t, k) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 0.8 + k) * 4) + ') rotate(' + f(Math.sin(t * 0.4 + k) * 5) + ') scale(' + s + ')"><path d="M-110 0 H110" stroke="#9aa2ac" stroke-width="4"/>';
    [-1, 1].forEach(function (e) { for (var p = 0; p < 2; p++) { var px = e * (42 + p * 36); g += '<rect x="' + (px - 16) + '" y="-20" width="32" height="40" fill="url(#gSatPanel)" stroke="' + INK + '" stroke-width="2"/><path d="M' + (px - 16) + ' -7 H' + (px + 16) + ' M' + (px - 16) + ' 7 H' + (px + 16) + ' M' + px + ' -20 V20" stroke="#8fb6e8" stroke-width="1"/>'; } });
    g += '<rect x="-24" y="-26" width="48" height="46" rx="3" fill="url(#gFoil)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 -8 H24 M-8 -26 V20 M10 -26 V20" stroke="#8a6a30" stroke-width="1"/>';
    g += '<rect x="-18" y="20" width="36" height="8" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.6"/>'; for (var a = 0; a < 5; a++) g += '<rect x="' + (-15 + a * 6.5) + '" y="28" width="4" height="9" rx="1.5" fill="#d9d4c8" stroke="' + INK + '" stroke-width="1"/>';
    return g + '</g>';
  }
  function space(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gSpace)"/>'; for (var o = 0; o < 3; o++) s += '<ellipse cx="320" cy="' + (440 + o * 20) + '" rx="' + (420 + o * 90) + '" ry="' + (330 + o * 40) + '" fill="none" stroke="#8fb6e8" stroke-width="2.5" stroke-dasharray="14 12" stroke-dashoffset="' + f(-t * (40 + o * 15)) + '" opacity=".35"/>'; for (var i = 0; i < 70; i++) { var x = -300 + hash(i) * 1240, y = -200 + hash(i + 5) * 560; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(0.6 + hash(i + 9) * 1.6) + '" fill="#fff" opacity="' + f(0.4 + 0.4 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function earth(t, y) { var sh = (t * 30) % 300; return '<ellipse cx="320" cy="' + y + '" rx="620" ry="260" fill="url(#gEarth)" stroke="#8fd0ee" stroke-width="4"/><path transform="translate(' + f(sh - 150) + ' 0)" d="M-120 ' + (y - 190) + ' C40 ' + (y - 230) + ' 120 ' + (y - 170) + ' 240 ' + (y - 210) + ' C340 ' + (y - 240) + ' 420 ' + (y - 200) + ' 520 ' + (y - 230) + '" stroke="#6f9548" stroke-width="40" fill="none" opacity=".7" stroke-linecap="round"/>'; }
  function pin(x, y, s, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 0 C-22 -22 -18 -50 0 -50 C18 -50 22 -22 0 0 Z" fill="' + (col || TR) + '" stroke="' + INK + '" stroke-width="3"/><circle cy="-32" r="8" fill="#fff"/></g>'; }
  function cloudBox(x, y, s, t) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2) * 3) + ') scale(' + s + ')"><path d="M-70 20 C-96 20 -96 -16 -66 -16 C-62 -50 -18 -54 -6 -30 C10 -54 60 -46 56 -14 C86 -14 86 20 60 20 Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><rect x="-28" y="-20" width="56" height="34" rx="4" fill="#f2efe9" stroke="' + INK + '" stroke-width="2"/><path d="M-22 6 L-8 -6 L6 4 L22 -12" stroke="' + TR + '" stroke-width="4" fill="none"/></g>'; }
  function speedo(x, y, v, s, lbl) { var a = -2.2 + 4.4 * clamp(v / 120); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><circle r="44" fill="#1c1c1c" stroke="#c9ced4" stroke-width="5"/><path d="M' + f(Math.sin(-2.2) * 34) + ' ' + f(-Math.cos(-2.2) * 34) + ' A34 34 0 1 1 ' + f(Math.sin(2.2) * 34) + ' ' + f(-Math.cos(2.2) * 34) + '" stroke="#3a3d42" stroke-width="6" fill="none"/><path d="M0 0 L' + f(Math.sin(a) * 32) + ' ' + f(-Math.cos(a) * 32) + '" stroke="' + TR + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#f4f1e8"/><text y="28" text-anchor="middle" style="font:800 16px Noto Serif;fill:#f4f1e8">' + Math.round(v) + '</text>' + (lbl ? '<text y="64" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#f4f1e8">' + lbl + '</text>' : '') + '</g>'; }
  function topMap(t, o) {   // a top view of streets with moving phone dots; o: { dense, jam }
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#ece8df"/>';
    for (var b = 0; b < 40; b++) { var bx = -300 + (b % 10) * 140, by = -150 + Math.floor(b / 10) * 150; s += '<rect x="' + (bx + 14) + '" y="' + (by + 14) + '" width="112" height="122" rx="6" fill="#ddd7ca"/>'; }
    for (var r = 0; r < 5; r++) s += '<path d="M-400 ' + (-150 + r * 150) + ' H1040" stroke="#fff" stroke-width="24"/>'; for (var c = 0; c < 11; c++) s += '<path d="M' + (-300 + c * 140) + ' -300 V660" stroke="#fff" stroke-width="20"/>';
    if (o.jam) s += '<path d="M-400 150 H1040" stroke="' + TR + '" stroke-width="10" opacity="' + f(o.jam) + '"/><path d="M' + (-300 + 5 * 140) + ' -300 V660" stroke="' + TG + '" stroke-width="8" opacity="' + f(o.jam) + '"/>';
    var n = Math.round(30 + 90 * (o.dense || 0)); for (var d = 0; d < n; d++) { var lane = d % 3, sp = lane === 0 && o.jam ? 0.02 : 0.12, u = (t * sp + hash(d)) % 1, px = lane === 2 ? -300 + 5 * 140 : -400 + u * 1440, py = lane === 0 ? 150 : lane === 1 ? -150 + (d % 4 + 1) * 150 - 150 : -300 + u * 960; if (lane === 1) py = [0, 300, 450][d % 3];
      s += '<circle cx="' + f(px) + '" cy="' + f(py + (hash(d + 4) - 0.5) * 10) + '" r="6" fill="' + NAV + '" stroke="#fff" stroke-width="2"/>'; }
    return s;
  }
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function driver(x, y, t, mood, o) {   // a ball-head driver seen through the side window of a big car
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 9) * 0.8) + ')">' + carSide(0, 0, t * (o.still ? 0 : 1), 2.4, o.col || "#2f6f9f") + '</g>';
    return s + head(x + 10, y - 104, 30, mood, t, 1);
  }

  // ── radar episode pieces ───────────────────────────────
  var BLU = "#3b8fe0", YEL = "#f2c230", RAD = "#e8503a";
  // an Egyptian roadside speed camera (from the user's photos). Default: the tall grey tower with a black glass face
  // and two round lenses. o.pole: the pole type with a box, two lenses and a flash lamp on an arm. y = waist of the pole
  function radarBox(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">', fx, fy;
    var lens = function (cx, cy) { return '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="#e8ecf0" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#1c1e22"/><circle cx="' + (cx - 3) + '" cy="' + (cy - 3) + '" r="2.4" fill="#fff"/>'; };
    if (o.pole) {
      g += '<rect x="-6" y="-160" width="12" height="420" fill="url(#steel)" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 -150 L-64 -176" stroke="#b9c0c8" stroke-width="8" stroke-linecap="round"/><path d="M0 -150 L-64 -176" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".5"/>';
      g += '<rect x="-92" y="-192" width="40" height="22" rx="4" fill="#1c1e22" stroke="' + INK + '" stroke-width="2.4"/><rect x="-88" y="-176" width="32" height="5" fill="#3a3f45"/>';
      g += '<rect x="-40" y="-110" width="34" height="40" rx="4" fill="#e6e8e4" stroke="' + INK + '" stroke-width="2.4"/><rect x="-36" y="-104" width="26" height="6" fill="#c8ccc6"/>' + lens(-22, -54) + lens(-22, -28);
      fx = -72; fy = -181;
    } else {
      g += '<rect x="-34" y="-150" width="68" height="410" rx="6" fill="url(#steel)" stroke="' + INK + '" stroke-width="3"/><rect x="-34" y="-150" width="68" height="12" rx="4" fill="#5a6068"/>';
      g += '<rect x="-24" y="-134" width="48" height="104" rx="5" fill="#16181b" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -130 H-6 L-20 -104 Z" fill="#fff" opacity=".12"/>' + lens(0, -100) + lens(0, -68);
      g += '<rect x="-14" y="-44" width="28" height="7" rx="2" fill="#3a3f45"/><rect x="-40" y="248" width="80" height="12" fill="#8a9098" stroke="' + INK + '" stroke-width="2"/>';
      fx = 0; fy = -100;
    }
    g += '<circle cx="' + (o.pole ? -4 : 16) + '" cy="' + (o.pole ? -100 : -126) + '" r="3.5" fill="' + (Math.sin(t * 6) > 0 ? "#ff3b2f" : "#5a1a14") + '"/>';
    if (o.flash > 0) g += '<circle cx="' + fx + '" cy="' + fy + '" r="' + f(80 * o.flash) + '" fill="url(#gGlowW)" opacity="' + f(o.flash) + '"/><circle cx="' + fx + '" cy="' + fy + '" r="' + f(22 * o.flash) + '" fill="#fff"/>';
    return g + '</g>';
  }
  // the radar beam: arcs travelling out from (x, y) in direction ang
  function beam(x, y, t, ang, len, col, spread) {
    var s = "", sp = spread || 0.32;
    for (var i = 0; i < 6; i++) { var r = ((t * 110 + i * len / 6) % len) + 12, a0 = ang - sp, a1 = ang + sp;
      s += '<path d="M' + f(x + Math.cos(a0) * r) + ' ' + f(y + Math.sin(a0) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(a1) * r) + ' ' + f(y + Math.sin(a1) * r) + '" stroke="' + (col || BLU) + '" stroke-width="5" fill="none" stroke-linecap="round" opacity="' + f(0.95 * (1 - r / (len + 12))) + '"/>'; }
    return s;
  }
  // a travelling sine wave from x1 towards x2 (drawn up to fraction p), wavelength lam
  function waveLine(x1, x2, y, t, lam, amp, col, dir, p, w) {
    p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), n = Math.max(10, Math.round(Math.abs(xe - x1) / 3)), d = "";
    for (var i = 0; i <= n; i++) { var x = lerp(x1, xe, i / n), ph = (x - dir * t * 140) / lam * 6.2832; d += (i ? " L" : "M") + f(x) + " " + f(y + Math.sin(ph) * amp); }
    w = w || 4; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
  }
  // sound rings left behind by a moving source; pos(time) gives its x
  function rings(pos, y, t, n, col, gap) {
    var s = "", step = gap || 0.3, base = Math.floor(t / step) * step;
    for (var k = 0; k < n; k++) { var te = base - k * step, r = (t - te) * 120, o = 1 - k / n; if (r <= 0) continue; s += '<circle cx="' + f(pos(te)) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="none" stroke="' + (col || "#3a3d42") + '" stroke-width="3" opacity="' + f(0.8 * o) + '"/>'; }
    return s;
  }
  // an Egyptian ambulance: orange high-roof VW van, green stripes, blue light bar, «إسعاف» and the ministry badge
  function ambulance(x, y, t, s, flip) {
    var a = t * 420, g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 10)) * 1.2) + ') scale(' + ((flip ? -1 : 1) * (s || 1)) + ' ' + (s || 1) + ')">';
    g += '<path d="M-112 -12 V-106 Q-112 -114 -104 -114 H34 Q44 -114 48 -104 L66 -60 H96 C106 -58 112 -50 112 -40 V-12 Z" fill="#f2872a" stroke="' + INK + '" stroke-width="3"/>';
    g += '<path d="M-110 -58 H112 V-50 H-110 Z M-110 -42 H112 V-37 H-110 Z" fill="#1f9a5a"/><rect x="-112" y="-22" width="226" height="10" fill="#3a3d42"/>';
    g += '<path d="M50 -100 L64 -62 H44 V-100 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="6" y="-100" width="32" height="34" rx="3" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><path d="M4 -100 V-14" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>';
    g += '<circle cx="-36" cy="-84" r="13" fill="#fff" stroke="#d8352a" stroke-width="3"/><path d="M-36 -92 V-76 M-43 -84 H-29" stroke="#2f6fbf" stroke-width="3.4"/><rect x="104" y="-50" width="8" height="8" rx="2" fill="#fff6c0"/>';
    var on = Math.sin(t * 14) > 0; g += '<rect x="0" y="-125" width="46" height="11" rx="4" fill="' + (on ? "#4f8bff" : "#1a2a6a") + '" stroke="' + INK + '" stroke-width="2"/><rect x="-108" y="-124" width="12" height="10" rx="3" fill="' + (on ? "#1a2a6a" : "#4f8bff") + '" stroke="' + INK + '" stroke-width="2"/>';
    g += '<circle cx="23" cy="-120" r="' + (on ? 18 : 5) + '" fill="#4f8bff" opacity=".4" filter="url(#glow)"/><circle cx="-102" cy="-119" r="' + (on ? 5 : 14) + '" fill="#4f8bff" opacity=".4" filter="url(#glow)"/>';
    g += '<text x="-72" y="-70" text-anchor="middle" transform="scale(' + (flip ? -1 : 1) + ' 1)" style="font:800 15px Noto Sans Arabic;fill:#1d4fa8">إسعاف</text>';
    [-70, 70].forEach(function (wx) { g += '<g transform="translate(' + wx + ' -6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return g + '</g>';
  }
  function limitSign(x, y, s, n, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-4" y="0" width="8" height="140" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><circle r="38" fill="#fff" stroke="#d8352a" stroke-width="10"/><circle r="43" fill="none" stroke="' + INK + '" stroke-width="2"/><text y="12" text-anchor="middle" style="font:800 30px Noto Serif;fill:' + INK + '">' + n + '</text></g>'; }
  // an Egyptian private-car plate: blue band «مصر EGYPT», letters over numbers
  function plate(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-70" y="-30" width="140" height="60" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="-70" y="-30" width="140" height="18" rx="6" fill="#2f6fbf"/><text x="-40" y="-16" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#fff">مصر</text><text x="40" y="-16" text-anchor="middle" style="font:800 11px Noto Sans;fill:#fff">EGYPT</text><path d="M0 -12 V30" stroke="' + INK + '" stroke-width="2"/><text x="35" y="18" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + INK + '">س ع د</text><text x="-35" y="18" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + INK + '">١٢٣٤</text></g>'; }
  function stopwatch(x, y, r, t, k) { var a = t * 9; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-8" y="' + (-r - 16) + '" width="16" height="12" rx="3" fill="' + INK + '"/><circle r="' + r + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="5"/><path d="M0 0 L' + f(Math.sin(a) * r * 0.8) + ' ' + f(-Math.cos(a) * r * 0.8) + '" stroke="' + RAD + '" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="' + INK + '"/></g>'; }
  // a traffic officer in the white summer uniform, holding a laser gun
  function officer(x, y, t, mood, aim) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2) * 2) + ')">';
    s += '<path d="M-46 150 C-50 70 -32 40 0 40 C32 40 50 70 46 150 Z" fill="#f4f2ec" stroke="' + INK + '" stroke-width="3"/><path d="M-14 42 L0 66 L14 42" fill="#1c1c1c"/>';
    s += '<path d="M30 70 L90 ' + f(60 + (aim || 0)) + '" stroke="#f4f2ec" stroke-width="16" stroke-linecap="round"/><path d="M30 70 L90 ' + f(60 + (aim || 0)) + '" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".4"/>';
    s += head(0, 0, 38, mood || "n", t, 1);
    s += '<path d="M-40 -22 C-40 -50 40 -50 40 -22 Z" fill="#f4f2ec" stroke="' + INK + '" stroke-width="3"/><rect x="-44" y="-26" width="88" height="10" rx="4" fill="#1c1c1c"/><circle cx="0" cy="-36" r="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<g transform="translate(96 ' + f(54 + (aim || 0)) + ')"><path d="M4 12 L-6 44 H8 L18 12 Z" fill="#1c1e22" stroke="' + INK + '" stroke-width="2.4"/><rect x="-14" y="-16" width="62" height="30" rx="6" fill="#2b2f34" stroke="' + INK + '" stroke-width="2.6"/><rect x="4" y="-30" width="26" height="12" rx="4" fill="#1c1e22" stroke="' + INK + '" stroke-width="2"/><circle cx="30" cy="-24" r="5" fill="#3b6fa0" stroke="' + INK + '" stroke-width="1.6"/><rect x="-8" y="-10" width="30" height="17" rx="2" fill="#0e2a3a" stroke="#6a7480" stroke-width="1.4"/><text x="7" y="3" text-anchor="middle" style="font:800 10px Noto Sans;fill:#7cf29a">' + ar(120) + '</text><circle cx="50" cy="-1" r="11" fill="#1c1e22" stroke="' + INK + '" stroke-width="2.4"/><circle cx="50" cy="-1" r="6" fill="#3b6fa0"/><circle cx="50" cy="-1" r="' + (Math.sin(t * 9) > 0 ? 3 : 1.5) + '" fill="#ff3b2f"/></g>';
    return s + '</g>';
  }
  // a roadside camera gantry (from the user's photo): pole, an arm over the road, a camera box and dome cameras
  function gantry(x, y, s, t, flash) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-7" y="-24" width="14" height="210" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><rect x="-7" y="-24" width="130" height="8" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><rect x="-7" y="-6" width="110" height="5" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/><path d="M7 -16 L30 -6 M40 -16 L60 -6 M74 -16 L94 -6" stroke="' + INK + '" stroke-width="2"/>';
    g += '<circle cx="60" cy="-30" r="7" fill="#3a3f45" stroke="' + INK + '" stroke-width="2"/><circle cx="118" cy="-30" r="7" fill="#3a3f45" stroke="' + INK + '" stroke-width="2"/><rect x="88" y="0" width="30" height="18" rx="4" fill="url(#gHousing)" stroke="' + INK + '" stroke-width="2.4"/><circle cx="92" cy="10" r="5" fill="#1c1e22"/>';
    return g + (flash > 0 ? '<circle cx="92" cy="10" r="' + f(36 * flash) + '" fill="url(#gGlowW)"/>' : '') + '</g>'; }
  // a big number card
  function counter(x, y, text, col, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-120" y="-30" width="240" height="56" rx="12" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="10" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:' + (col || "#7cf29a") + '">' + text + '</text></g>'; }
  function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function road(t, o) {   // a plain road seen from the side, day or night; o: {sky, v, cars}
    o = o || {}; var s = sky(o.sky || "day") + (o.sky === "night" ? stars(t) + moon(520, 60) : clouds(t, 10, 30, 4, 0.8)) + city(t, 210, 110, o.sky === "night" ? "#2a3550" : "#c79a7b", true, 6, o.sky === "night");
    s += '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="' + (o.sky === "night" ? "#4a4a46" : "#c9c4b8") + '"/>';
    s += '<path d="M-400 286 H1040" stroke="#f4f1e8" stroke-width="4" stroke-dasharray="30 24" stroke-dashoffset="' + f(-t * (o.v || 120)) + '"/>';
    if (o.cars !== false) for (var j = 0; j < 3; j++) { var x2 = 1040 - (((t * 150 + j * 520) % 1600)); s += '<g transform="translate(' + f(x2) + ' 318) scale(-1 1)">' + carSide(0, 0, t, 0.6, ["#2f6f9f", "#e2b035", "#4f8f5a"][j]) + '</g>'; }
    return s;
  }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — on the road, a small flash, and days later the ticket arrives
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 380, k), 190, lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var cx = lerp(-160, 760, clamp(u / 2.6)), fl = clamp(1 - Math.abs(u - 1.55) / 0.3);
    var s = road(t, { sky: "night", v: 200 }) + radarBox(470, 140, 0.7, t, { flash: fl, pole: 1 }) + carSide(cx, 262, t, 0.9, "#c23a26");
    if (fl > 0) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#fff" opacity="' + f(0.55 * fl) + '"/>';
    var k = pop((u - 2.7) / 0.9);
    if (k > 0) s += '<g transform="translate(320 170) scale(' + f(k) + ')"><rect x="-130" y="-70" width="260" height="140" rx="16" fill="#fbfaf6" stroke="' + INK + '" stroke-width="4"/><rect x="-130" y="-70" width="260" height="36" rx="16" fill="#d8352a"/><text y="-44" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#fff">مخالفة سرعة</text>' + '<text y="8" text-anchor="middle" style="font:800 30px Noto Serif;fill:' + INK + '">' + ar(120) + ' كم/س</text><text y="48" text-anchor="middle" style="font:700 16px Noto Sans Arabic;fill:#5a6068">الحد ' + ar(80) + '</text></g>';
    return s + tag("فلاش!", 470, 62, u, 1.5, 3, 22, "#fff3b0");
  });
  // 1 — how did it know you were doing 120?
  shot(1, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = road(t, { v: 240 }) + driver(220, 250, t, "shock", { col: "#c23a26" }) + speedo(470, 120, 120 + 3 * Math.sin(t * 5), 1.3, "كم/س");
    return s + qmark(560, 70, t, 46) + qmark(380, 90, t + 1, 34) + tag("عرف منين؟", 470, 312, u, 0.8, -2, 21);
  });
  // 2 — from far away, without touching the car or knowing who you are
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(320, 300, k), 190, lerp(1.15, 0.9, k)]; }, function (u, d, t) {
    var cx = lerp(80, 200, clamp(u / d)), s = road(t, { v: 180 }) + radarBox(560, 120, 0.6, t) + carSide(cx, 262, t, 0.7, "#c23a26");
    s += '<path d="M' + f(cx + 70) + ' 200 H520" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '"/><text x="' + f((cx + 590) / 2) + '" y="188" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:' + INK + '">' + ar(100) + ' متر</text>';
    s += '<g transform="translate(' + f(cx) + ' 140)">' + head(0, 0, 22, "curious", t, 1) + '</g>' + qmark(cx + 30, 100, t, 30);
    return s + tag("من غير ما يلمسها!", 320, 312, u, 0.9, -2, 20);
  });
  // 3 — "إيه الحكاية؟"
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(400 240) scale(' + f(0.75 * pop(u / 0.6)) + ')">' + radarBox(0, 0, 1, t) + '</g>' + beam(391, 165, t, Math.PI, 260, BLU);
    return s + qmark(520, 120, t, 50) + tag("إيه الحكاية؟", 300, 62, u, 0.2, -3, 28);
  });
  // 4 — it throws radio waves at you, like a phone, but focused one way
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(330, 300, k), 190, lerp(1.05, 1.0, k)]; }, function (u, d, t) {
    var s = road(t, { v: 90 }) + radarBox(540, 120, 0.7, t) + beam(532, 50, t, Math.PI + 0.25, 360, BLU, 0.2) + carSide(lerp(60, 140, clamp(u / d)), 262, t, 0.8, "#c23a26");
    var k = pop((u - 1.2) / 0.8);
    if (k > 0) { s += '<g transform="translate(150 90) scale(' + f(0.6 * k) + ')"><rect x="-26" y="-48" width="52" height="96" rx="10" fill="#1c1e22" stroke="' + INK + '" stroke-width="3"/><rect x="-20" y="-40" width="40" height="76" rx="4" fill="#3b6fa0"/></g>';
      for (var i = 0; i < 4; i++) { var r = ((t * 50 + i * 18) % 72) + 30; s += '<circle cx="150" cy="90" r="' + f(r) + '" fill="none" stroke="' + BLU + '" stroke-width="3" opacity="' + f(1 - r / 102) + '"/>'; } }
    return s + tag("موجات راديو", 470, 312, u, 0.5, -2, 21) + tag("زي الموبايل", 150, 62, u, 1.4, 3, 18);
  });
  // 5 — the waves travel at the speed of light, 300,000 km every second
  shot(5, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gSpace)"/>' + stars(t) + '<circle cx="320" cy="430" r="230" fill="url(#gEarth)" stroke="#8fd0ee" stroke-width="4"/>';
    var a = t * 3.2; s += '<circle cx="320" cy="430" r="260" fill="none" stroke="' + BLU + '" stroke-width="3" stroke-dasharray="6 10" opacity=".5"/>';
    for (var k = 0; k < 8; k++) { var aa = a - k * 0.06; s += '<circle cx="' + f(320 + Math.cos(aa) * 260) + '" cy="' + f(430 + Math.sin(aa) * 260) + '" r="' + f(9 - k) + '" fill="#bfe0ff" opacity="' + f(1 - k / 8) + '"/>'; }
    var n = Math.round(300000 * clamp(u / 1.6));
    return s + counter(320, 90, ar(n.toLocaleString("en").replace(/,/g, "٬")) + " كم/ث", "#bfe0ff") + tag("بسرعة النور!", 320, 62, u, 1.6, -3, 20);
  });
  // 6 — the waves hit your car and come back, like a ball off a wall
  shot(6, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<path d="M320 -100 V460" stroke="' + INK + '" stroke-width="4" stroke-dasharray="12 10"/>';
    s += '<rect x="40" y="40" width="40" height="260" fill="url(#bld)" stroke="' + INK + '" stroke-width="3"/>'; for (var b = 0; b < 8; b++) s += '<path d="M40 ' + (60 + b * 30) + ' h40" stroke="#8a5a3c" stroke-width="2"/>';
    var q = (t * 0.7) % 1, bx = q < 0.5 ? lerp(280, 100, q / 0.5) : lerp(100, 280, (q - 0.5) / 0.5);
    s += '<circle cx="' + f(bx) + '" cy="220" r="22" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(bx - 14) + ' 208 Q' + f(bx) + ' 226 ' + f(bx + 14) + ' 208" stroke="' + INK + '" stroke-width="2" fill="none"/>' + arrow(250, 150, 120, 150, YEL, 6, 1) + arrow(120, 280, 250, 280, YEL, 6, 1);
    s += '<g transform="translate(0 0)">' + carSide(410, 250, 0, 0.7, "#c23a26") + '</g>' + radarBox(600, 150, 0.5, t);
    s += waveLine(570, 470, 180, t, 34, 9, BLU, -1, 1) + waveLine(470, 570, 215, t, 34, 9, YEL, 1, 1);
    return s + tag("زي الكورة", 160, 312, u, 0.6, -2, 20) + tag("ترجع للجهاز", 480, 312, u, 1.4, 2, 18);
  });
  // 7 — a parked car: the wave comes back exactly as it went
  shot(7, function (u, d) { return [320, 180, lerp(1.05, 1.12, u / d)]; }, function (u, d, t) {
    var s = road(t, { v: 0, cars: false }) + radarBox(560, 120, 0.6, t) + carSide(150, 262, 0, 0.8, "#c23a26");
    s += '<rect x="230" y="60" width="290" height="110" rx="12" fill="#fbfaf6" opacity=".92" stroke="' + INK + '" stroke-width="3"/>';
    s += waveLine(510, 240, 90, t, 40, 11, BLU, -1, 1) + waveLine(240, 510, 140, t, 40, 11, YEL, 1, 1);
    s += '<text x="525" y="96" style="font:800 14px Noto Sans Arabic;fill:' + BLU + '">رايحة</text><text x="525" y="146" style="font:800 14px Noto Sans Arabic;fill:#b08a10">راجعة</text>';
    return s + tag("نفس الموجة بالظبط", 380, 312, u, 0.9, -2, 20, "#cfe9ff") + '<text x="150" y="160" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + INK + '">P</text>';
  });
  // 8 — a car coming closer: the returning wave gets squeezed, its frequency rises
  shot(8, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var cx = lerp(60, 200, clamp(u / d)), s = road(t, { v: 160, cars: false }) + radarBox(560, 120, 0.6, t) + carSide(cx, 262, t, 0.8, "#c23a26") + arrow(cx + 90, 220, cx + 150, 220, "#ff8a7e", 6, 1);
    s += '<rect x="230" y="60" width="290" height="110" rx="12" fill="#fbfaf6" opacity=".92" stroke="' + INK + '" stroke-width="3"/>';
    var lam = lerp(40, 20, clamp((u - 0.6) / 1.6));
    s += waveLine(510, 240, 90, t, 40, 11, BLU, -1, 1) + waveLine(240, 510, 140, t, lam, 11, YEL, 1, 1);
    return s + tag("بتتزنق!", 380, 312, u, 1.2, -2, 22, "#ffd0a0") + tag("الذبذبة بتعلى", 380, 62, u, 2.4, 2, 18);
  });
  // 9 — the faster you go, the higher it climbs
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var v = lerp(40, 160, clamp(u / (d - 0.3))), s = graphPaper(t) + speedo(130, 170, v, 1.6, "كم/س");
    s += '<rect x="240" y="80" width="360" height="180" rx="14" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>' + waveLine(260, 580, 170, t, lerp(46, 12, clamp(v / 160)), 30, YEL, 1, 1, 5);
    return s + tag("أسرع = ذبذبة أعلى", 420, 312, u, 0.6, -2, 20);
  });
  // 10 — Doppler, the Austrian scientist, 1842
  shot(10, function (u, d) { return [lerp(320, 300, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a2a1c"/><rect x="-400" y="-300" width="1440" height="960" fill="url(#gGlowW)" opacity=".08"/>';
    s += '<rect x="180" y="20" width="200" height="250" rx="6" fill="url(#gFoil)" stroke="' + INK + '" stroke-width="4"/><rect x="196" y="36" width="168" height="218" fill="#d9c4a0" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M230 254 C226 190 250 170 280 170 C310 170 334 190 330 254 Z" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><path d="M262 172 L280 200 L298 172" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/>';
    s += head(280, 128, 40, "curious", t, -1) + '<path d="M244 128 C242 150 250 162 258 166 M316 128 C318 150 310 162 302 166" stroke="#5a3c20" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M246 104 C252 82 308 82 314 104" stroke="#5a3c20" stroke-width="10" fill="none" stroke-linecap="round"/>';
    for (var i = 0; i < 4; i++) { var r = ((t * 40 + i * 25) % 100) + 20; s += '<circle cx="470" cy="150" r="' + f(r) + '" fill="none" stroke="' + YEL + '" stroke-width="3" opacity="' + f(1 - r / 120) + '"/>'; }
    return s + tag("كريستيان دوبلر", 280, 312, u, 0.5, -2, 20) + tag(ar(1842), 470, 60, u, 1.8, 3, 24, "#ffe08a");
  });
  // 11 — you hear it every day: the ambulance siren
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 190, 1.05]; }, function (u, d, t) {
    var ax = lerp(80, 520, clamp(u / d)), s = road(t, { v: 220, cars: false });
    s += rings(function (te) { return lerp(80, 520, clamp((te - (t - u)) / d)); }, 250, t, 8, "#d8352a", 0.28) + ambulance(ax, 300, t, 0.8);
    return s + tag("صفارة الإسعاف", 320, 60, u, 0.4, -2, 21);
  });
  // 12 — coming towards you it sounds high, once it passes it drops
  shot(12, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var t0 = t - u, ax = lerp(-150, 790, clamp(u / d)), s = road(t, { v: 220, cars: false });
    s += rings(function (te) { return lerp(-150, 790, clamp((te - t0) / d)); }, 250, t, 10, "#d8352a", 0.22) + ambulance(ax, 300, t, 0.8);
    var passed = ax > 320; s += '<g transform="translate(320 120)">' + head(0, 0, 34, passed ? "worry" : "shock", t, passed ? 1 : -1) + '</g>';
    s += '<path d="M290 120 c-10 -8 -10 -24 0 -30" stroke="' + INK + '" stroke-width="3" fill="none"/>';
    return s + (passed ? tag("تخين", 160, 62, u, d * 0.5, -3, 24, "#cfe9ff") : tag("رفيع!", 480, 62, u, 0.3, 3, 24, "#ffd0a0"));
  });
  // 13 — the radar does the same, with waves we can't hear
  shot(13, function (u, d) { return [320, 180, lerp(1.05, 1.12, u / d)]; }, function (u, d, t) {
    var s = road(t, { v: 140 }) + radarBox(540, 120, 0.7, t) + beam(532, 50, t, Math.PI + 0.25, 360, BLU, 0.2);
    var k = pop((u - 0.9) / 0.8); if (k > 0) s += '<g transform="translate(200 120) scale(' + f(k) + ')"><path d="M-10 -40 C30 -40 40 0 20 20 C10 30 10 44 -6 44 C-20 44 -24 30 -16 20" stroke="' + INK + '" stroke-width="6" fill="#f0c8a0"/><circle r="56" fill="none" stroke="#d8352a" stroke-width="9"/><path d="M-40 -40 L40 40" stroke="#d8352a" stroke-width="9"/></g>';
    return s + tag("مابنسمعهاش", 200, 312, u, 1.2, -2, 21);
  });
  // 14 — inside the box: it compares what went out with what came back
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2f34"/><rect x="60" y="30" width="520" height="290" rx="20" fill="url(#gHousing)" stroke="' + INK + '" stroke-width="4"/><rect x="90" y="56" width="460" height="220" rx="10" fill="url(#screen)" stroke="' + INK + '" stroke-width="3"/>';
    s += waveLine(110, 530, 110, t, 44, 18, BLU, -1, 1) + waveLine(110, 530, 210, t, 30, 18, YEL, 1, 1);
    s += '<text x="100" y="80" text-anchor="start" style="font:800 15px Noto Sans Arabic;fill:#bfe0ff">اللي راحت</text><text x="100" y="268" text-anchor="start" style="font:800 15px Noto Sans Arabic;fill:#ffe08a">اللي رجعت</text>';
    var k = pop((u - 1.4) / 0.7); if (k > 0) s += '<g transform="translate(320 160) scale(' + f(k) + ')"><rect x="-60" y="-18" width="120" height="36" rx="10" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#fff">الفرق</text></g>';
    for (var i = 0; i < 6; i++) s += '<circle cx="' + (110 + i * 16) + '" cy="296" r="4" fill="' + (hash(i + Math.floor(t * 3)) > 0.5 ? "#7cf29a" : "#3a3f46") + '"/>';
    return s + tag("بيقارن", 320, 312, u, 0.4, -2, 20);
  });
  // 15 — every 1 km/h adds about 45 waves per second
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var v = Math.floor(1 + 9 * clamp(u / (d - 0.6))), s = graphPaper(t) + speedo(150, 170, v, 1.5, "");
    s += '<text x="150" y="268" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:' + INK + '">' + ar(v) + ' كم/س</text>' + arrow(250, 170, 330, 170, YEL, 7, 1);
    s += counter(470, 170, "+ " + ar(v * 45) + " ذبذبة", "#7cf29a", 0.9) + waveLine(370, 580, 250, t, lerp(40, 22, v / 10), 12, YEL, 1, 1);
    return s + tag("كل كيلو = ٤٥ ذبذبة", 320, 62, u, 0.6, -2, 20);
  });
  // 16 — a car at 100: about 4,500 extra waves every second
  shot(16, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 1.8), s = road(t, { v: 260 }) + carSide(lerp(60, 220, clamp(u / d)), 262, t, 0.9, "#c23a26") + speedo(150, 90, 100 * k, 1.0, "");
    s += counter(440, 120, ar(Math.round(4470 * k).toLocaleString("en").replace(/,/g, "٬")) + " ذبذبة", YEL, 0.95);
    return s + tag("في الثانية!", 440, 62, u, 1.9, 3, 21, "#fff3b0");
  });
  // 17 — the whole sum takes less than a second
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + stopwatch(170, 190, 70, t, 1);
    s += '<g transform="translate(450 180)"><rect x="-110" y="-60" width="220" height="120" rx="14" fill="url(#gHousing)" stroke="' + INK + '" stroke-width="4"/><rect x="-92" y="-42" width="184" height="84" rx="8" fill="#0f1a12" stroke="' + INK + '" stroke-width="3"/><text y="22" text-anchor="middle" style="font:800 52px Noto Serif;fill:#7cf29a">' + (u < 0.8 ? "..." : ar(120)) + '</text></g>';
    return s + tag("أقل من ثانية", 320, 312, u, 0.5, -2, 22);
  });
  // 18 — over the limit: the camera next to it wakes up
  shot(18, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = road(t, { v: 220 }) + limitSign(140, 100, 1.1, ar(80), t) + radarBox(470, 150, 0.75, t, { flash: 0 });
    var k = pop((u - 0.6) / 0.6); if (k > 0) s += '<g transform="translate(470 60) scale(' + f(k) + ')"><rect x="-60" y="-24" width="120" height="44" rx="10" fill="#d8352a" stroke="' + INK + '" stroke-width="3" opacity="' + f(0.7 + 0.3 * Math.sin(t * 12)) + '"/><text y="10" text-anchor="middle" style="font:800 26px Noto Serif;fill:#fff">' + ar(120) + '</text></g>';
    s += '<circle cx="427" cy="122" r="' + f(16 + 6 * Math.sin(t * 10)) + '" fill="#ff3b2f" opacity="' + f(0.35 * clamp((u - 1) / 0.5)) + '" filter="url(#glow)"/>';
    return s + tag("عدّى الحد!", 220, 312, u, 1.0, -2, 22, "#ffd0a0");
  });
  // 19 — it photographs the car and the plate; at night a flash makes the numbers readable
  shot(19, function (u, d) { return [320, 185, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var fl = clamp(1 - Math.abs(u - 0.9) / 0.3), s = road(t, { sky: "night", v: 220 }) + radarBox(520, 120, 0.7, t, { flash: fl, pole: 1 }) + carSide(lerp(40, 330, clamp(u / 1.4)), 262, t, 0.9, "#c23a26");
    if (fl > 0) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#fff" opacity="' + f(0.5 * fl) + '"/>';
    var k = pop((u - 1.5) / 0.8); if (k > 0) s += '<g transform="translate(260 150) rotate(-4) scale(' + f(k) + ')"><rect x="-150" y="-100" width="300" height="200" fill="#fbfaf6" stroke="' + INK + '" stroke-width="4"/><rect x="-136" y="-86" width="272" height="150" fill="#3a3f46"/>' + carSide(0, 10, 0, 0.9, "#c23a26") + plate(0, 30, 0.6) + '<text x="0" y="88" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + INK + '">' + ar(120) + ' كم/س — ' + ar(23) + ':' + ar(14) + '</text></g>';
    return s + tag("اللوحة باينة", 520, 312, u, 2.0, 2, 20);
  });
  // 20 — handheld guns fire laser instead of radio, and time how fast the distance shrinks
  shot(20, function (u, d) { return [lerp(320, 300, u / d), 185, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var cx = lerp(40, 160, clamp(u / d)), s = road(t, { v: 150 }) + carSide(cx, 262, t, 0.8, "#c23a26") + officer(470, 160, t, "n", -10);
    for (var i = 0; i < 8; i++) { var q = (t * 2.2 + i / 8) % 1; s += '<circle cx="' + f(lerp(600, cx + 80, q)) + '" cy="' + f(lerp(202, 230, q)) + '" r="5" fill="#ff3b2f" filter="url(#glow)"/><circle cx="' + f(lerp(600, cx + 80, q)) + '" cy="' + f(lerp(202, 230, q)) + '" r="2.4" fill="#fff"/>'; }
    var dist = Math.round(lerp(180, 120, clamp(u / d)));
    return s + counter(220, 70, ar(dist) + " متر", "#ff8a7e", 0.75) + tag("ليزر", 520, 312, u, 0.6, 2, 22, "#ffd0a0");
  });
  // 21 — some roads time you between two cameras far apart
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, k), 180, 0.95]; }, function (u, d, t) {
    var s = road(t, { v: 200 }) + gantry(40, 120, 1, t, clamp(1 - Math.abs(u - 0.3) / 0.2)) + gantry(560, 120, 1, t, clamp(1 - Math.abs(u - (d - 0.6)) / 0.2));
    var cx = lerp(80, 620, clamp(u / (d - 0.4))); s += carSide(cx, 262, t, 0.75, "#c23a26");
    s += '<path d="M90 110 H600" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 40) + '"/>' + stopwatch(330, 60, 26, t, 1);
    return s + tag("بين كاميرتين", 330, 312, u, 0.8, -2, 21);
  });
  // 22 — the first road radar was tried in America in 1947 (sepia)
  shot(22, function (u, d) { return [lerp(280, 360, u / d), 185, lerp(1.0, 1.18, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 6, 40, 3, 0.7) + grass(t, 230, "grass-dusk", "#5a5030") + '<rect x="-400" y="246" width="1440" height="70" fill="#7a7060"/>';
    var cx = lerp(20, 330, clamp(u / d)); s += birds(t, 70, 60) + '<g transform="translate(130 236) scale(.8)"><rect x="-50" y="-14" width="100" height="14" fill="#9a8f7a" stroke="' + INK + '" stroke-width="2"/><path d="M-8 -14 V-60 H8 V-14" fill="#5a5246" stroke="' + INK + '" stroke-width="2"/><g transform="translate(0 -70) rotate(' + f(-20 + Math.sin(t * 0.8) * 12) + ')"><ellipse rx="16" ry="52" fill="#4a463e" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 H-34" stroke="' + INK + '" stroke-width="3"/><circle cx="-34" r="4" fill="' + INK + '"/></g></g>' + '<g transform="translate(' + f(cx) + ' ' + f(282 + Math.abs(Math.sin(t * 8)) * 2) + ')"><path d="M-80 -6 C-80 -30 -60 -36 -30 -36 C-20 -58 30 -58 40 -36 C70 -34 84 -24 84 -6 Z" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><circle cx="-46" cy="0" r="14" fill="#1c1c1c"/><circle cx="50" cy="0" r="14" fill="#1c1c1c"/></g>';
    s += '<g transform="translate(470 230)"><path d="M-30 60 L0 0 L30 60 M0 0 V60" stroke="' + INK + '" stroke-width="5"/><rect x="-34" y="-36" width="68" height="40" rx="6" fill="#8a7a5a" stroke="' + INK + '" stroke-width="3"/><circle cx="-34" cy="-16" r="10" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/></g>' + beam(436, 214, t * 1.6, Math.PI, 220, "#fff4c8");
    s += '<g transform="translate(560 170)">' + head(0, 0, 30, "curious", t, -1) + '<path d="M-34 -14 H34 L24 -34 H-24 Z" fill="#5a4a34" stroke="' + INK + '" stroke-width="3"/></g>';
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#a0784a" opacity=".22"/>';
    return s + tag("أمريكا " + ar(1947), 300, 62, u, 0.1, -3, 22, "#f2e0b0");
  });
  // 23 — so the flash you saw was the last step of a sum that finished before you could blink
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), steps = [["موجة", BLU], ["مقارنة", YEL], [ar(120), "#7cf29a"], ["فلاش!", "#fff3b0"]];
    for (var i = 0; i < 4; i++) { var k = pop((u - 0.3 - i * 0.6) / 0.6); if (k <= 0) continue; var x = 90 + i * 155; s += '<g transform="translate(' + x + ' 170) scale(' + f(k) + ')"><circle r="52" fill="' + INK + '" stroke="' + steps[i][1] + '" stroke-width="5"/><text y="8" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + steps[i][1] + '">' + steps[i][0] + '</text></g>'; if (i < 3) s += arrow(x + 58, 170, x + 98, 170, YEL, 5, k); }
    var blink = (t * 1.6) % 1 < 0.12; s += '<g transform="translate(320 300)">' + head(0, 0, 30, blink ? "n" : "shock", t, 0) + '</g>';
    return s + tag("قبل ما ترمش!", 320, 62, u, 2.4, -2, 22);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(230 250) scale(.7)">' + radarBox(0, 0, 1, t) + '</g>' + beam(222, 180, t, Math.PI, 160, BLU) + '<g transform="translate(430 200) scale(.9)">' + head(0, 0, 56, "happy", t, -1) + '</g>';
    return s + qmark(480, 100, t, 56) + qmark(530, 140, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 312, u, 0.2, -2, 19);
  });

  window.__parts = { radarBox: radarBox, beam: beam, waveLine: waveLine, carSide: carSide, road: road, plate: plate, speedo: speedo, ambulance: ambulance, tag: tag, head: head, graphPaper: graphPaper };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
