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

  function counter(x, y, text, col, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-120" y="-30" width="240" height="56" rx="12" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="10" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:' + (col || "#7cf29a") + '">' + text + '</text></g>'; }
  function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function road(t, o) {   // a plain road seen from the side, day or night; o: {sky, v, cars}
    o = o || {}; var s = sky(o.sky || "day") + (o.sky === "night" ? stars(t) + moon(520, 60) : clouds(t, 10, 30, 4, 0.8)) + city(t, 210, 110, o.sky === "night" ? "#2a3550" : "#c79a7b", true, 6, o.sky === "night");
    s += '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="' + (o.sky === "night" ? "#4a4a46" : "#c9c4b8") + '"/>';
    s += '<path d="M-400 286 H1040" stroke="#f4f1e8" stroke-width="4" stroke-dasharray="30 24" stroke-dashoffset="' + f(-t * (o.v || 120)) + '"/>';
    if (o.cars !== false) for (var j = 0; j < 3; j++) { var x2 = 1040 - (((t * 150 + j * 520) % 1600)); s += '<g transform="translate(' + f(x2) + ' 318) scale(-1 1)">' + carSide(0, 0, t, 0.6, ["#2f6f9f", "#e2b035", "#4f8f5a"][j]) + '</g>'; }
    return s;
  }

  // ── airplane episode pieces ─────────────────────────────
  var BLU = "#3b8fe0", YEL = "#f2c230", GRN = "#2fae5a", RED = "#e8503a", ORG = "#f29a2e";
  function lab(text, x, y, col, sz) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:800 ' + (sz || 20) + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:4;paint-order:stroke">' + text + '</text>'; }
  // a twin-engine airliner, side view, nose to the right; o: {rot, gear, flap, glow (wing), stripe}
  function airliner(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + (s || 1) + ')">';
    g += '<path d="M-6 -6 L-62 -40 L-44 -40 L34 -6 Z" fill="#b9c1c9" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M-148 -14 L-180 -80 L-160 -80 L-116 -14 Z" fill="' + (o.stripe || "#2f6fbf") + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M-150 -4 L-186 -20 L-172 -20 L-130 -4 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M-176 -8 C-166 -18 -150 -24 -110 -24 H120 C148 -24 168 -14 176 -2 C170 10 150 14 120 14 H-110 C-146 14 -166 4 -176 -8 Z" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="3"/>';
    g += '<path d="M-168 2 H154" stroke="' + (o.stripe || "#2f6fbf") + '" stroke-width="4"/><path d="M136 -18 L156 -11 L150 -6 L132 -9 Z" fill="#2b3a4a" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 18; i++) g += '<circle cx="' + (-120 + i * 14) + '" cy="-9" r="2.8" fill="#2b3a4a"/>';
    if (o.gear) { var a = t * 500; [[112, 0.8], [-6, 1], [10, 1]].forEach(function (w) { g += '<path d="M' + w[0] + ' 12 V' + f(26 * w[1]) + '" stroke="' + INK + '" stroke-width="4"/><g transform="translate(' + w[0] + ' ' + f(30 * w[1]) + ') rotate(' + f(a) + ')"><circle r="7" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><path d="M-4 0 H4" stroke="#8a929c" stroke-width="2"/></g>'; }); }
    g += '<path d="M24 6 L-52 44 L-30 46 L64 8 Z" fill="' + (o.glow ? "#fff3b0" : "#dfe4ea") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.flap) g += '<path d="M-52 44 L-30 46 L' + f(-34 - 2 * o.flap) + ' ' + f(46 + 10 * o.flap) + ' L' + f(-56 - 2 * o.flap) + ' ' + f(44 + 10 * o.flap) + ' Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>';
    if (o.glow) g += '<path d="M24 6 L-52 44 L-30 46 L64 8 Z" fill="#fff3b0" opacity="' + f(0.4 + 0.3 * Math.sin(t * 6)) + '" filter="url(#glow)"/>';
    g += '<g transform="translate(-2 24)"><rect x="-28" y="-10" width="56" height="20" rx="10" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="27" cy="0" rx="4" ry="9" fill="#2b2f34"/><path d="M-20 -4 H18" stroke="#fff" stroke-width="2" opacity=".6"/></g>';
    return g + '</g>';
  }
  // looking out of a cabin window at the wing; o: {down (air pushed down under the wing), tagY}
  function windowView(t, o) {
    o = o || {}; var id = "cw" + (CLIPN++), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e4da"/>';
    for (var k = 0; k < 6; k++) s += '<path d="M-400 ' + (-40 + k * 90) + ' H1040" stroke="#ddd6c8" stroke-width="3"/>';
    s += '<defs><clipPath id="' + id + '"><rect x="170" y="40" width="300" height="270" rx="120"/></clipPath></defs><g clip-path="url(#' + id + ')">' + sky("day") + clouds(t, 220, 250, 7, 0.95, 1.4) + clouds(t, 120, 190, 4, 0.7, 0.8);
    s += '<path d="M90 300 L470 130 L500 124 L504 140 L150 350 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="3"/><path d="M90 300 L470 130" stroke="#9aa2ac" stroke-width="7"/><path d="M472 130 L488 70 L500 72 L500 124 Z" fill="#2f6fbf" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M190 320 L450 180 M270 330 L462 214" stroke="#b9c1c9" stroke-width="2"/>';
    if (o.down) for (var i = 0; i < 8; i++) { var uu = ((t * 0.9 + i / 8) % 1), x = 230 + i * 30, y = 240 + i * -10 + uu * 90; s += '<path d="M' + f(x) + ' ' + f(y) + ' v18" stroke="' + BLU + '" stroke-width="4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * uu)) + '"/><path d="M' + f(x - 5) + ' ' + f(y + 12) + ' l5 8 l5 -8" stroke="' + BLU + '" stroke-width="3" fill="none" opacity="' + f(Math.sin(Math.PI * uu)) + '"/>'; }
    s += '</g><rect x="170" y="40" width="300" height="270" rx="120" fill="none" stroke="#cfc7b6" stroke-width="22"/><rect x="170" y="40" width="300" height="270" rx="120" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="186" y="' + f(30 + 8 * Math.sin(t * 0.5)) + '" width="268" height="26" rx="10" fill="#d9d2c2" stroke="' + INK + '" stroke-width="2"/>';
    return s;
  }
  // a turbofan seen from the front: lip, spinning blades, spinner with a swirl
  function engineFront(x, y, r, t) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r * 1.12) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="4"/><circle r="' + f(r) + '" fill="#1c1e22"/>';
    for (var i = 0; i < 18; i++) { var a = i * 20 + t * 400; s += '<path transform="rotate(' + f(a) + ')" d="M0 ' + f(-r * 0.2) + ' C' + f(r * 0.18) + ' ' + f(-r * 0.5) + ' ' + f(r * 0.12) + ' ' + f(-r * 0.8) + ' ' + f(r * 0.06) + ' ' + f(-r * 0.96) + ' L' + f(-r * 0.1) + ' ' + f(-r * 0.96) + ' C' + f(-r * 0.04) + ' ' + f(-r * 0.7) + ' 0 ' + f(-r * 0.45) + ' ' + f(-r * 0.08) + ' ' + f(-r * 0.2) + ' Z" fill="#8a929c" stroke="#3a3f46" stroke-width="1.2"/>'; }
    s += '<circle r="' + f(r * 0.2) + '" fill="#e9ecef" stroke="' + INK + '" stroke-width="2"/><path transform="rotate(' + f(t * 400) + ')" d="M0 0 C' + f(r * 0.1) + ' ' + f(-r * 0.05) + ' ' + f(r * 0.1) + ' ' + f(r * 0.12) + ' 0 ' + f(r * 0.14) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>';
    return s + '</g>';
  }
  // the engine from the side, cut open: slow air in at the front, fast air out the back
  function engineSide(x, y, s, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    for (var i = 0; i < 9; i++) { var u1 = ((t * 0.6 + i / 9) % 1), y1 = -36 + (i % 5) * 18; g += '<path d="M' + f(lerp(-300, -140, u1)) + ' ' + y1 + ' h30" stroke="' + BLU + '" stroke-width="4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u1)) + '"/>';
      var u2 = ((t * 1.8 + i / 9) % 1), y2 = -20 + (i % 3) * 20; g += '<path d="M' + f(lerp(130, 360, u2)) + ' ' + y2 + ' h60" stroke="' + ORG + '" stroke-width="5" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u2)) + '"/>'; }
    g += '<path d="M-140 -60 C-140 -76 -120 -80 -90 -80 H90 C120 -80 140 -50 150 -30 V30 C140 50 120 80 90 80 H-90 C-120 80 -140 76 -140 60 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="4"/><path d="M-126 -56 H120 L136 -26 V26 L120 56 H-126 Z" fill="#2b2f34"/>';
    for (var b = 0; b < 3; b++) { var bx = -100 + b * 12; g += '<path d="M' + bx + ' -52 V52" stroke="#8a929c" stroke-width="6" stroke-dasharray="10 6" stroke-dashoffset="' + f(-t * 300 + b * 5) + '"/>'; }
    g += '<path d="M-40 -20 H60 V20 H-40 Z" fill="#5a6068"/><path d="M60 -16 H110 V16 H60 Z" fill="' + ORG + '" opacity="' + f(0.6 + 0.3 * Math.sin(t * 20)) + '"/>';
    return g + '</g>';
  }
  // the four forces around a point; hl: which ones are bright ("lw", "td" or "all"); p: 0..1 reveal
  function forces(cx, cy, t, hl, u, len) {
    len = len || 90; var w = 1 + 0.06 * Math.sin(t * 5), s = "", F = [["lw", 0, -1, GRN, "الرفع"], ["lw", 0, 1, RED, "الوزن"], ["td", 1, 0, BLU, "الدفع"], ["td", -1, 0, ORG, "المقاومة"]];
    F.forEach(function (q, i) { var on = hl === "all" || hl === q[0], p = clamp((u - 0.2 - (hl === "all" ? i * 0.4 : 0)) / 0.5), L2 = len * w * (on ? 1 : 0.8), x0 = cx + q[1] * (q[1] ? 120 : 0), y0 = cy + q[2] * 40;
      s += '<g opacity="' + (on ? 1 : 0.25) + '">' + arrow(x0, y0, x0 + q[1] * L2, y0 + q[2] * L2, q[3], 10, p) + (p > 0.6 ? lab(q[4], x0 + q[1] * (L2 + 46), y0 + q[2] * (L2 + 26) + 7, q[3], 20) : "") + '</g>'; });
    return s;
  }
  // a wing cut across, with the air flowing over and under it and turning down behind it
  function streams(cx, cy, t, n, down) {
    var s = "";
    for (var k = 0; k < n; k++) { var kk = k - (n - 1) / 2, y0 = cy + kk * 24 + (kk < 0 ? -10 : 10), d = "";
      for (var x = cx - 300; x <= cx + 300; x += 10) { var dx = (x - cx) / 90, bump = (kk < 0 ? -1 : 1) * (Math.abs(kk) < 1 ? 46 : 30) * Math.exp(-dx * dx) / (1 + Math.abs(kk) * 0.3), dw = x > cx ? (x - cx) * 0.22 * down / (1 + Math.abs(kk) * 0.25) : 0; d += (x === cx - 300 ? "M" : " L") + f(x) + " " + f(y0 + bump + dw - (kk < 0 ? 4 : -4)); }
      s += '<path d="' + d + '" stroke="' + (kk < 0 ? "#2f7fe0" : "#5d93ad") + '" stroke-width="3.4" fill="none" stroke-dasharray="18 12" stroke-dashoffset="' + f(-t * 90) + '"/>'; }
    return s;
  }
  // a speed gauge with its own scale
  function spd(x, y, v, max, s, unit) { var a = -2.2 + 4.4 * clamp(v / max); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><circle r="46" fill="' + INK + '" stroke="#c9ced4" stroke-width="5"/><path d="M' + f(Math.sin(-2.2) * 34) + ' ' + f(-Math.cos(-2.2) * 34) + ' A34 34 0 1 1 ' + f(Math.sin(2.2) * 34) + ' ' + f(-Math.cos(2.2) * 34) + '" stroke="#3a3d42" stroke-width="6" fill="none"/><path d="M0 0 L' + f(Math.sin(a) * 32) + ' ' + f(-Math.cos(a) * 32) + '" stroke="' + TR + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#f4f1e8"/><text y="28" text-anchor="middle" style="font:800 16px Noto Serif;fill:#f4f1e8">' + ar(Math.round(v)) + '</text><text y="66" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#f4f1e8;stroke:' + INK + ';stroke-width:3;paint-order:stroke">' + (unit || "كم/س") + '</text></g>'; }
  // the airport: sky, grass, a tower, the runway with its centre line running by at speed v
  function runway(t, v, o) {
    o = o || {}; var s = sky("day") + clouds(t, 20 + v * 0.1, 20, 4, 0.8) + '<rect x="-400" y="200" width="1440" height="500" fill="url(#grass-day)"/>';
    var tx = ((520 - t * v * 0.25) % 1500 + 1500) % 1500 - 400; s += '<g transform="translate(' + f(tx) + ' 200)"><rect x="-8" y="-90" width="16" height="90" fill="#d9d2c2" stroke="' + INK + '" stroke-width="2"/><path d="M-24 -110 H24 L18 -90 H-18 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="-26" y="-116" width="52" height="8" fill="#5a6068"/></g>';
    s += '<rect x="-400" y="232" width="1440" height="66" fill="#4a4844"/><path d="M-400 265 H1040" stroke="#f4f1e8" stroke-width="5" stroke-dasharray="40 30" stroke-dashoffset="' + f(t * v) + '"/>';
    s += '<path d="M-400 234 H1040 M-400 296 H1040" stroke="#f4f1e8" stroke-width="3"/>';
    for (var i = 0; i < 14; i++) { var lx = ((i * 110 - t * v) % 1540 + 1540) % 1540 - 450; s += '<circle cx="' + f(lx) + '" cy="300" r="4" fill="#ffd27a"/><circle cx="' + f(lx) + '" cy="230" r="3" fill="#ffd27a"/>'; }
    return s;
  }
  // the Wright Flyer, side view, nose (the front elevator) to the right
  function flyer(x, y, s, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3) * 3) + ') scale(' + s + ')">';
    g += '<path d="M-90 -40 H90 M-90 0 H90" stroke="#f6eedb" stroke-width="9" stroke-linecap="round"/><path d="M-90 -40 H90 M-90 0 H90" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    for (var i = -3; i <= 3; i++) g += '<path d="M' + (i * 28) + ' -40 V0" stroke="#6a5a40" stroke-width="2"/>';
    g += '<path d="M90 -20 L150 -24 M90 -14 L150 -12" stroke="#6a5a40" stroke-width="2"/><path d="M140 -30 H180 M140 -10 H180" stroke="#efe4c8" stroke-width="5" stroke-linecap="round"/>';
    g += '<path d="M-90 -30 L-140 -26 M-90 -10 L-140 -14" stroke="#6a5a40" stroke-width="2"/><rect x="-156" y="-40" width="10" height="36" fill="#efe4c8" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<ellipse cx="-70" cy="-20" rx="5" ry="' + f(18 * Math.abs(Math.sin(t * 30))) + '" fill="#6a5a40" opacity=".7"/><ellipse cx="-70" cy="-20" rx="3" ry="18" fill="#6a5a40" opacity=".25"/>';
    g += '<path d="M-10 -6 H30" stroke="#3a3428" stroke-width="7" stroke-linecap="round"/><circle cx="36" cy="-8" r="6" fill="#f2dcc0" stroke="' + INK + '" stroke-width="1.6"/>';
    return g + '</g>';
  }
  function stopwatch(x, y, r, t) { var a = t * 6; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-8" y="' + (-r - 16) + '" width="16" height="12" rx="3" fill="' + INK + '"/><circle r="' + r + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="5"/><path d="M0 0 L' + f(Math.sin(a) * r * 0.8) + ' ' + f(-Math.cos(a) * r * 0.8) + '" stroke="' + TR + '" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="' + INK + '"/></g>'; }
  function thermo(x, y, v, t) {   // v in °C, from 30 down to -60
    var h = lerp(10, 170, clamp((v + 60) / 90)), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-16" y="-180" width="32" height="200" rx="16" fill="#f4f6f8" stroke="' + INK + '" stroke-width="4"/><circle cy="30" r="28" fill="' + BLU + '" stroke="' + INK + '" stroke-width="4"/><rect x="-7" y="' + f(20 - h) + '" width="14" height="' + f(h) + '" fill="' + BLU + '"/>';
    for (var i = 0; i < 6; i++) s += '<path d="M16 ' + (-160 + i * 30) + ' h10" stroke="' + INK + '" stroke-width="2"/>';
    return s + '</g>';
  }
  function jumboTop(x, y, s) {   // a jumbo from above, nose up; wing tips at x ±192 when s = 1
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 -50 L192 30 L192 42 L10 10 Z M0 -50 L-192 30 L-192 42 L-10 10 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="3"/><path d="M0 70 L60 96 L60 104 L4 92 Z M0 70 L-60 96 L-60 104 L-4 92 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 -150 C14 -150 18 -120 18 -90 V100 C18 112 8 120 0 124 C-8 120 -18 112 -18 100 V-90 C-18 -120 -14 -150 0 -150 Z" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="3"/>' +
      [-120, -70, 70, 120].map(function (ex) { return '<rect x="' + (ex - 8) + '" y="' + f(-22 + Math.abs(ex) * 0.42) + '" width="16" height="30" rx="6" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>'; }).join("") + '</g>';
  }
  var SKYUP = function (t) { return sky("day") + clouds(t, 160, 250, 7, 0.95, 1.3) + clouds(t, 60, 40, 3, 0.6); };

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — look out of the window at the wing: that piece holds up four hundred tonnes
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(320, 360, k), lerp(180, 200, k), lerp(1.0, 1.25, k)]; }, function (u, d, t) {
    return windowView(t) + tag(ar(400) + " طن!", 400, 120, u, 2.6, -4, 26);
  });
  // 1 — metal, fuel, passengers and bags, hanging in the air eleven kilometres up
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(170, 200, k), lerp(1.05, 0.95, k)]; }, function (u, d, t) {
    var s = SKYUP(t) + airliner(320, 150 + Math.sin(t * 1.4) * 4, 0.95, t), W = [["معدن", 150, 70], ["وقود", 260, 50], ["ركاب", 380, 50], ["شنط", 490, 70]];
    W.forEach(function (w, i) { var k = pop((u - 0.3 - i * 0.55) / 0.6); if (k > 0) s += '<g transform="translate(' + w[1] + ' ' + w[2] + ') scale(' + f(k) + ')">' + lab(w[0], 0, 0, YEL, 22) + '</g>'; });
    s += '<path d="M520 190 V330" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '"/>';
    return s + tag(ar(11) + " كيلو فوق", 500, 300, u, 3.4, -3, 20);
  });
  // 2 — and the engine only pushes it forward; so who is lifting it?
  shot(2, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + engineFront(220, 180, 100, t) + arrow(340, 180, 340 + 120 * clamp(u / 0.8), 180, BLU, 12, 1) + '<g transform="translate(500 210)">' + head(0, 0, 46, "curious", t, -1) + '</g>';
    return s + qmark(560, 120, t, 50) + qmark(450, 110, t + 1, 34) + tag("مين رافعها؟", 320, 312, u, 1.4, -2, 22);
  });
  // 3 — what's the story?
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + airliner(lerp(-80, 720, clamp(u / d)), 120, 0.55, t) + '<g transform="translate(320 240) scale(' + f(pop(u / 0.6)) + ')">' + head(0, 0, 50, "happy", t, 0) + '</g>';
    return s + qmark(420, 200, t, 50) + qmark(220, 210, t + 2, 40) + tag("إيه الحكاية؟", 320, 62, u, 0.1, -3, 28);
  });
  // 4 — in the air it is pulled four ways at once
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 0.92, u / d)]; }, function (u, d, t) {
    return SKYUP(t) + airliner(320, 180, 0.7, t) + forces(320, 180, t, "all", u, 70) + tag(ar(4) + " اتجاهات", 320, 330, u, 1.8, -2, 20);
  });
  // 5 — weight pulls it down, the wing lifts it up
  shot(5, function (u, d) { return [320, 180, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    return SKYUP(t) + airliner(320, 180, 0.7, t, { glow: u > 1.2 }) + forces(320, 180, t, "lw", u + 1, 80);
  });
  // 6 — the engine pushes forward, the air pushes back
  shot(6, function (u, d) { return [320, 180, lerp(1.05, 0.95, u / d)]; }, function (u, d, t) {
    return SKYUP(t) + airliner(320, 180, 0.7, t) + forces(320, 180, t, "td", u + 1, 80) + airflow(t, -60, 700, 300, 10, "#fff", 0.8, 4);
  });
  // 7 — the engine is a giant fan: it sucks air in at the front and throws it out the back
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), 180, lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    return graphPaper(t) + engineSide(320, 180, 0.95, t) + lab("هوا داخل", 110, 110, BLU, 20) + lab("هوا خارج بسرعة", 560, 110, ORG, 20) + tag("مروحة عملاقة", 320, 312, u, 0.6, -2, 22);
  });
  // 8 — that's all it does; the whole load is on the wing
  shot(8, function (u, d) { return [lerp(320, 300, u / d), lerp(180, 200, u / d), lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    return SKYUP(t) + airliner(320, 170, 0.9, t, { glow: u > 0.8 }) + arrow(150, 190, 150 + 90 * clamp(u / 0.6), 190, BLU, 8, 1) + tag("الشيلة على الجناح", 290, 290, u, 0.9, -3, 21);
  });
  // 9 — the wing from the side: curved on top, nose tilted up a little
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var ang = 6 + Math.sin(t * 1.5) * 1.2, s = graphPaper(t) + airfoil(320, 190, 2.6, ang, "#dfe4ea");
    s += '<path d="M150 190 H500" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 6"/><path d="M490 190 A160 160 0 0 0 488 ' + f(190 - Math.tan(ang * Math.PI / 180) * 160) + '" stroke="' + RED + '" stroke-width="4" fill="none"/>';
    return s + tag("ضهر مقوّس", 300, 90, u, 0.8, -3, 22) + tag("مايل لفوق", 520, 260, u, 2.0, 3, 20, "#f2e0b0");
  });
  // 10 — the air over it and under it both turn down behind the wing
  shot(10, function (u, d) { return [lerp(300, 360, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + streams(300, 170, t, 7, clamp(u / 1.2)) + airfoil(300, 170, 2.2, 6, "#dfe4ea") + tag("الهوا بينزل لتحت", 470, 320, u, 1.6, -2, 20);
  });
  // 11 — the wing throws air down, the air pushes it up, and the pressure on top drops
  shot(11, function (u, d) { return [320, 180, lerp(1.05, 0.98, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + streams(300, 190, t, 7, 1) + airfoil(300, 190, 2.2, 6, "#dfe4ea");
    for (var i = 0; i < 4; i++) { var uu = ((t * 0.8 + i / 4) % 1); s += arrow(460 + i * 34, 210 + uu * 40, 470 + i * 34, 250 + uu * 50, BLU, 5, 1); }
    s += arrow(300, 150, 300, 150 - 100 * clamp((u - 1) / 0.8), GRN, 14, 1);
    for (var j = 0; j < 5; j++) s += lab("−", 200 + j * 50, 130 + Math.sin(t * 3 + j) * 4, BLU, 26) + lab("+", 210 + j * 45, 250 + Math.sin(t * 3 + j) * 4, RED, 24);
    return s + tag("ضغط أقل فوق", 300, 62, u, 2.2, -3, 21);
  });
  // 12 — put your hand out of the car window and tilt it: you feel it rise
  shot(12, function (u, d) { return [lerp(280, 320, u / d), 200, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = road(t, { v: 260, cars: false }), cx = 250, lift = Math.sin(t * 2.4) * 8 + 6;
    s += carSide(cx, 262, t, 1.25, "#2f6f9f") + '<path d="M' + (cx + 20) + ' 200 C' + (cx + 24) + ' 180 ' + (cx + 40) + ' ' + f(166 - lift) + ' ' + (cx + 56) + ' ' + f(160 - lift) + '" stroke="#e8b48a" stroke-width="12" fill="none" stroke-linecap="round"/>';
    s += '<g transform="translate(' + (cx + 70) + ' ' + f(154 - lift) + ') rotate(-14)"><ellipse rx="22" ry="8" fill="#f2c79e" stroke="' + INK + '" stroke-width="2.4"/></g>' + airflow(t, 640, 330, 150, 9, "#fff", 1.2, 2);
    s += arrow(cx + 70, 140 - lift, cx + 70, 100 - lift, GRN, 7, clamp((u - 0.8) / 0.5));
    return s + tag("إيدك بتترفع!", 470, 80, u, 1.6, -3, 22);
  });
  // 13 — lift needs speed: double the speed, four times the lift
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), k = clamp((u - 1.5) / 1.4), base = 280;
    function bar(x, h, col, txt) { return '<rect x="' + (x - 30) + '" y="' + f(base - h) + '" width="60" height="' + f(h) + '" rx="6" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' + lab(txt, x, base - h - 12, col, 22); }
    s += bar(140, 40, BLU, "×١") + bar(220, 40 * lerp(1, 2, k), BLU, k > 0.95 ? "×٢" : "") + bar(400, 40, GRN, "×١") + bar(480, 40 * lerp(1, 4, k), GRN, k > 0.95 ? "×٤" : "");
    s += '<path d="M60 ' + base + ' H580" stroke="' + INK + '" stroke-width="4"/>' + lab("السرعة", 180, 318, BLU, 20) + lab("الرفع", 440, 318, GRN, 20);
    return s + tag("محتاجة سرعة", 320, 62, u, 0.4, -3, 22);
  });
  // 14 — so it runs down a runway that can be three kilometres long
  shot(14, function (u, d) { return [lerp(260, 380, u / d), 200, 0.95]; }, function (u, d, t) {
    var s = runway(t, 200) + airliner(lerp(120, 460, clamp(u / d)), 228, 0.55, t, { gear: 1 });
    s += arrow(80, 150, 560, 150, YEL, 6, clamp(u / 1.5)) + arrow(560, 150, 80, 150, YEL, 6, clamp(u / 1.5));
    return s + tag(ar(3) + " كيلو", 320, 120, u, 1.4, -2, 22);
  });
  // 15 — before it moves, flaps slide out behind the wing: a bigger, more curved wing
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.8) / 2)), s = graphPaper(t) + airfoil(280, 180, 2.4, 4, "#dfe4ea");
    s += '<g transform="translate(' + f(420 + 10 * k) + ' ' + f(172 + 6 * k) + ') rotate(' + f(4 + 18 * k) + ') scale(2.4)"><path d="M0 -3 C10 -3 26 -1 38 2 C26 4 10 5 0 4 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1"/></g>';
    return s + airflow(t, -60, 700, 120, 8, "#5d93ad", 0.7, 3) + tag("الفلابس", 480, 280, u, 1.2, 3, 24);
  });
  // 16 — at about three hundred km/h the lift beats the weight and the wheels leave the ground
  shot(16, function (u, d) { return [320, lerp(190, 160, clamp((u - d * 0.6) / (d * 0.4))), 1.0]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.65)), v = 300 * ease(k), up = clamp((u - d * 0.65) / (d * 0.35));
    var s = runway(t, 120 + v * 2.2) + airliner(330, 228 - 120 * up * up, 0.62, t, { gear: 1, flap: 1, rot: -9 * clamp(up * 3) });
    return s + spd(90, 80, v, 320, 0.9) + tag("العجل يسيب الأرض!", 400, 70, u, d * 0.68, -3, 20);
  });
  // 17 — then every square metre of wing carries more than seven hundred kilos: ten people
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<path d="M170 290 L470 290 L520 210 L220 210 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="4"/>' + lab("١ متر مربع", 345, 330, INK === "#1c1c1c" ? "#fff" : "#fff", 18);
    for (var i = 0; i < 10; i++) { var k = pop((u - 0.6 - i * 0.28) / 0.6); if (k <= 0) continue; var r = i < 5 ? 0 : 1, x = 250 + (i % 5) * 52 + r * 20, y = 245 - r * 40 - (i < 5 ? 0 : 0); s += '<g transform="translate(' + x + ' ' + y + ') scale(' + f(k * 0.9) + ')">' + head(0, 0, 18, ["happy", "n", "curious", "shock"][i % 4], t + i, 0) + '</g>'; }
    return s + tag("+" + ar(700) + " كيلو", 330, 70, u, 3.4, -3, 24);
  });
  // 18 — it climbs to the top, where it is about fifty-five below zero outside
  shot(18, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var k = clamp(u / d), s = sky("day") + '<rect x="-400" y="-300" width="1440" height="960" fill="#0e2a5a" opacity="' + f(0.55 * k) + '"/>' + clouds(t, 90, lerp(200, 300, k), 6, 0.9, 1.2);
    s += airliner(lerp(160, 300, k), lerp(240, 150, k), 0.6, t, { rot: -8 }) + thermo(520, 200, lerp(25, -55, ease(k)), t);
    for (var i = 0; i < 8; i++) s += '<circle cx="' + f(480 + hash(i) * 90) + '" cy="' + f(40 + ((t * 30 + hash(i + 3) * 300) % 300)) + '" r="2.4" fill="#fff" opacity=".8"/>';
    return s + tag("−" + ar(55) + "°", 430, 70, u, d * 0.6, -3, 26, "#cfe6f7");
  });
  // 19 — thin air up there: nine hundred km/h on less fuel
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="-300" width="1440" height="960" fill="#0e2a5a" opacity=".45"/>' + clouds(t, 520, 280, 8, 0.95, 1.3) + airflow(t, 700, -80, 170, 14, "#fff", 2.2, 0);
    for (var i = 0; i < 10; i++) s += '<circle cx="' + f(((hash(i) * 900 - t * 300) % 900 + 900) % 900 - 130) + '" cy="' + f(40 + hash(i + 7) * 270) + '" r="5" fill="#bcd9f2" opacity=".7"/>';
    return s + airliner(330, 180, 0.75, t) + counter(320, 60, ar(900) + " كم/س", "#7cf29a", 0.9) + tag("هوا خفيف", 470, 300, u, 1.0, -2, 20);
  });
  // 20 — the pilot keeps lift exactly equal to weight, so it stays level
  shot(20, function (u, d) { return [320, 180, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var s = SKYUP(t) + '<path d="M-200 180 H860" stroke="' + YEL + '" stroke-width="3" stroke-dasharray="14 10" stroke-dashoffset="' + f(t * 80) + '"/>' + airliner(320, 180, 0.7, t);
    return s + forces(320, 180, t, "lw", u + 1, 80) + tag("قد بعض بالظبط", 470, 62, u, 1.0, -3, 20);
  });
  // 21 — the first airplane in history, 1903, flew for twelve seconds
  shot(21, function (u, d) { return [lerp(280, 360, u / d), 185, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 8, 40, 3, 0.7) + '<path d="M-400 250 C-100 230 100 260 320 244 C520 232 760 256 1040 246 V700 H-400 Z" fill="#d9c08a"/>' + birds(t, 70, 60);
    s += flyer(lerp(60, 420, clamp(u / d)), 190 - 24 * Math.sin(Math.PI * clamp(u / d)), 1.3, t) + stopwatch(560, 90, 28, t) + lab(ar(Math.min(12, Math.floor(u / d * 13))) + " ث", 560, 155, "#fff", 20);
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#a0784a" opacity=".22"/>';
    return s + tag(ar(1903), 220, 62, u, 0.2, -3, 24, "#f2e0b0");
  });
  // 22 — its whole flight was shorter than a jumbo's wings, tip to tip
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + jumboTop(320, 150, 0.82), k = clamp((u - 1.2) / 1.2);
    s += arrow(147, 268, 493, 268, BLU, 5, clamp(u / 0.8)) + arrow(493, 268, 147, 268, BLU, 5, clamp(u / 0.8)) + lab(ar(64) + " متر", 560, 275, BLU, 20);
    s += '<path d="M147 310 H' + f(147 + 198 * k) + '" stroke="' + RED + '" stroke-width="10" stroke-linecap="round"/>' + flyer(147 + 198 * k, 300, 0.2, t) + (k > 0.95 ? lab(ar(37) + " متر", 410, 318, RED, 20) : "");
    return s + tag("أقصر من الجناحين", 320, 40, u, 2.4, -2, 20);
  });
  // 23 — so the wing you're looking at throws air down the whole trip, and that's what holds you up
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(360, 320, k), lerp(200, 180, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    return windowView(t, { down: 1 }) + tag("ده اللي شايلك", 320, 330, u, 2.6, -2, 22);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + airliner(lerp(-60, 700, ((t * 0.12) % 1)), 110, 0.5, t) + '<g transform="translate(320 220) scale(.9)">' + head(0, 0, 56, "happy", t, 0) + '</g>';
    return s + qmark(420, 170, t, 56) + qmark(470, 210, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 312, u, 0.2, -2, 19);
  });

  window.__parts = { airliner: airliner, windowView: windowView, engineFront: engineFront, forces: forces, streams: streams, airfoil: airfoil, flyer: flyer, jumboTop: jumboTop, tag: tag, head: head, graphPaper: graphPaper, SKYUP: SKYUP };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
