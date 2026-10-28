  // ── new pieces for this episode: a car in side view, an in-line engine cut open, one cylinder through its four strokes,
  // crankshaft, gearbox, differential, and the 1886 Benz Patent-Motorwagen (after the Commons photos, see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function boom(x, y, r, k) { if (k <= 0) return ""; var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.5 + k)) + '" fill="url(#gBoom)" opacity="' + f(clamp(1.4 - k)) + '"/>'; for (var i = 0; i < 8; i++) { var a = i * 0.785; s += '<path d="M' + f(x + Math.cos(a) * r * 0.4) + ' ' + f(y + Math.sin(a) * r * 0.4) + ' L' + f(x + Math.cos(a) * r * (0.7 + k * 0.6)) + ' ' + f(y + Math.sin(a) * r * (0.7 + k * 0.6)) + '" stroke="' + YEL + '" stroke-width="2.4" opacity="' + f(clamp(1.2 - k)) + '"/>'; } return s; }
  function wheel(x, y, r, ang, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="url(#gTyre)" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(r * 0.6) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><g transform="rotate(' + f(ang) + ')">';
    for (var k = 0; k < 5; k++) s += '<path d="M0 0 L0 ' + f(-r * 0.56) + '" stroke="#7a828c" stroke-width="' + f(r * 0.14) + '" stroke-linecap="round" transform="rotate(' + (k * 72) + ')"/>';
    return s + '<circle r="' + f(r * 0.16) + '" fill="#5a6068" stroke="' + INK + '"/></g></g>'; }
  // a red hatchback seen from the side; o: {s, hood (cut-open glow under the bonnet), flash, spin (wheel angle), tilt}
  function car(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 400 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="40" rx="150" ry="9" fill="#000" opacity=".2"/>';
    s += '<path d="M-150 20 C-152 0 -146 -10 -130 -14 L-80 -18 L-40 -54 C-30 -62 50 -62 70 -50 L110 -20 L140 -14 C152 -10 156 4 154 20 Z" fill="url(#gCar)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-34 -50 L-60 -20 H6 V-52 Z M14 -52 V-20 H96 L64 -48 C50 -54 30 -54 14 -52 Z" fill="#9fd2e8" stroke="' + INK + '" stroke-width="2"/><path d="M10 -20 V16 M-60 -6 h14 M40 -6 h14" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="138" y="-8" width="14" height="8" rx="2" fill="#fff3c4" stroke="' + INK + '" stroke-width="1.4"/><rect x="-152" y="-6" width="10" height="8" rx="2" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.hood) { s += '<path d="M98 -22 L140 -14 C150 -10 152 0 152 12 L96 12 Z" fill="#2b2e33" opacity=".85"/>'; for (var c = 0; c < 4; c++) { var on = o.flash ? ((Math.floor(t * 18) + [0, 2, 3, 1][c]) % 4 === 0) : false; s += '<rect x="' + (102 + c * 11) + '" y="-12" width="8" height="18" fill="#8a929c" stroke="' + INK + '" stroke-width=".8"/>' + (on ? '<circle cx="' + (106 + c * 11) + '" cy="-12" r="9" fill="url(#gBoom)"/>' : ''); } }
    s += wheel(-92, 20, 24, sp) + wheel(98, 20, 24, sp);
    return s + '</g>'; }
  function road(t, y, sp) { var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#gAsphalt)"/>', o = (t * (sp || 300)) % 80; for (var x = -400; x < 1100; x += 80) s += '<rect x="' + f(x - o) + '" y="' + (y + 40) + '" width="40" height="5" fill="#e9e4d8"/>'; return s + '<rect x="-400" y="' + (y - 8) + '" width="1440" height="8" fill="#8a857a"/>'; }
  // one cylinder in section: head with intake (left) and exhaust (right) valves, spark plug, piston on a con-rod to the crank.
  // ang: crank angle (deg, 0 = top dead centre), o: {inV, exV 0..1 open, mix (dots), fire 0..1, smoke, air, s}
  function cylinder(x, y, ang, t, o) {
    o = o || {}; var a = ang * Math.PI / 180, R = 34, Lr = 96, cy0 = y + 150, pinY = cy0 - (R * Math.cos(a) + Math.sqrt(Lr * Lr - Math.pow(R * Math.sin(a), 2))), top = pinY - 34;
    var s = '<g>' + '<rect x="' + (x - 62) + '" y="' + (y - 10) + '" width="124" height="' + 150 + '" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.6"/><rect x="' + (x - 46) + '" y="' + y + '" width="92" height="140" fill="#3a3f46"/>';
    var vol = top - y; if (o.mix) for (var m = 0; m < 22; m++) { var mx = x - 40 + hash(m) * 80, my = y + 4 + hash(m + 9) * Math.max(4, vol - 8); s += '<circle cx="' + f(mx + Math.sin(t * 9 + m) * 2) + '" cy="' + f(my) + '" r="2.6" fill="' + (m % 3 ? CY : YEL) + '"/>'; }
    if (o.fire) s += '<rect x="' + (x - 46) + '" y="' + y + '" width="92" height="' + f(Math.max(0, vol)) + '" fill="url(#gBoom)" opacity="' + f(o.fire) + '"/>';
    if (o.smoke) for (var k = 0; k < 10; k++) s += '<circle cx="' + f(x - 30 + hash(k) * 60) + '" cy="' + f(y + 6 + hash(k + 4) * Math.max(4, vol - 10)) + '" r="4" fill="#7a7670" opacity=".8"/>';
    s += '<rect x="' + (x - 44) + '" y="' + f(top) + '" width="88" height="40" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 44) + ' ' + f(top + 8) + ' h88 M' + (x - 44) + ' ' + f(top + 14) + ' h88" stroke="#5a6068" stroke-width="1.4"/>';
    var cx = x + R * Math.sin(a), cyc = cy0 - R * Math.cos(a); s += '<path d="M' + x + ' ' + f(pinY) + ' L' + f(cx) + ' ' + f(cyc) + '" stroke="#5a6068" stroke-width="12" stroke-linecap="round"/><circle cx="' + x + '" cy="' + f(pinY) + '" r="5" fill="#2b2e33"/>';
    s += '<circle cx="' + x + '" cy="' + cy0 + '" r="' + (R + 10) + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(cx) + '" cy="' + f(cyc) + '" r="8" fill="#2b2e33"/><circle cx="' + x + '" cy="' + cy0 + '" r="6" fill="#2b2e33"/>';
    s += '<path d="M' + (x - 70) + ' ' + (y - 10) + ' H' + (x + 70) + ' V' + (y - 44) + ' H' + (x - 70) + ' Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    var iv = clamp(o.inV || 0) * 12, ev = clamp(o.exV || 0) * 12;
    [[x - 26, iv], [x + 26, ev]].forEach(function (v) { var sp = ""; for (var k = 0; k < 6; k++) sp += (k ? " L" : "M") + (v[0] + (k % 2 ? 7 : -7)) + " " + f(y - 78 + k * 5 + v[1] * 0.5); s += '<path d="' + sp + '" stroke="#3a3f46" stroke-width="2.4" fill="none"/>'; });   // valve springs, as in the photos with the rocker cover off
    s += '<path d="M' + (x - 26) + ' ' + f(y - 80 + iv) + ' V' + f(y - 6 + iv) + ' M' + (x - 36) + ' ' + f(y - 6 + iv) + ' h20" stroke="#c9ced4" stroke-width="5"/><path d="M' + (x + 26) + ' ' + f(y - 50 + ev) + ' V' + f(y - 6 + ev) + ' M' + (x + 16) + ' ' + f(y - 6 + ev) + ' h20" stroke="#c9ced4" stroke-width="5"/>';
    s += '<path d="M' + (x - 70) + ' ' + (y - 30) + ' H' + (x - 110) + '" stroke="#5a6068" stroke-width="16"/><path d="M' + (x + 70) + ' ' + (y - 30) + ' H' + (x + 110) + '" stroke="#5a6068" stroke-width="16"/>';
    s += '<rect x="' + (x - 5) + '" y="' + (y - 64) + '" width="10" height="26" fill="#fbf6e6" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (x - 4) + '" y="' + (y - 44) + '" width="8" height="10" fill="#8a929c"/>';
    if (o.spark) s += '<path d="M' + x + ' ' + (y - 10) + ' l-6 10 l8 0 l-6 12" stroke="' + YEL + '" stroke-width="3" fill="none"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="10" fill="' + YEL + '" opacity=".6" filter="url(#glow)"/>';
    if (o.air) for (var q = 0; q < 6; q++) { var qu = (t * 1.4 + q / 6) % 1; s += '<circle cx="' + f(x - 110 + qu * 80) + '" cy="' + f(y - 30 + Math.sin(q) * 4) + '" r="3" fill="' + CY + '" opacity="' + f(1 - qu * 0.5) + '"/>'; }
    if (o.spray) for (var p = 0; p < 10; p++) { var pu = (t * 3 + p / 10) % 1; s += '<circle cx="' + f(x - 56 + pu * 30) + '" cy="' + f(y - 22 + pu * 30 + (hash(p) - 0.5) * 16 * pu) + '" r="2" fill="' + YEL + '" opacity="' + f(1 - pu) + '"/>'; }
    if (o.exhaust) for (var e = 0; e < 8; e++) { var eu = (t * 1.2 + e / 8) % 1; s += '<circle cx="' + f(x + 70 + eu * 90) + '" cy="' + f(y - 30 - eu * 10) + '" r="' + f(4 + eu * 6) + '" fill="#7a7670" opacity="' + f(0.8 * (1 - eu)) + '"/>'; }
    return s + '</g>'; }
  function gear(x, y, r, teeth, ang, col) { var d = ""; for (var i = 0; i < teeth * 2; i++) { var a = i / (teeth * 2) * Math.PI * 2 + ang, rr = i % 2 ? r : r + 8; d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
    return '<path d="' + d + ' Z" fill="' + (col || "url(#gGear)") + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.3) + '" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function tacho(x, y, r, v, label) { var a = -2.3 + 4.6 * clamp(v), s = '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#8a929c" stroke-width="3"/>';
    for (var k = 0; k <= 7; k++) { var ka = -2.3 + 4.6 * k / 7; s += '<path d="M' + f(Math.sin(ka) * (r - 4)) + ' ' + f(-Math.cos(ka) * (r - 4)) + ' L' + f(Math.sin(ka) * (r - 12)) + ' ' + f(-Math.cos(ka) * (r - 12)) + '" stroke="' + (k > 5 ? RED : "#e9e4d8") + '" stroke-width="2"/><text x="' + f(Math.sin(ka) * (r - 22)) + '" y="' + f(-Math.cos(ka) * (r - 22) + 4) + '" text-anchor="middle" style="font:700 10px Noto Serif;fill:#e9e4d8">' + k + '</text>'; }
    return s + '<path d="M0 0 L' + f(Math.sin(a) * (r - 10)) + ' ' + f(-Math.cos(a) * (r - 10)) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + RED + '"/>' + (label ? '<text y="' + (r * 0.5) + '" text-anchor="middle" style="font:700 9px Noto Serif;fill:#9a958c;direction:ltr">' + label + '</text>' : '') + '</g>'; }
  // the 1886 Benz Patent-Motorwagen: three spoked wheels (one small at the front), a tiller, a bench seat, the engine low at the back
  // with a big horizontal flywheel; o: {s, smoke}
  function motorwagen(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', sp = t * 200;
    function spoked(cx, cy, r) { var g = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="3"/>'; for (var k = 0; k < 12; k++) { var a = (k / 12) * Math.PI * 2 + sp * 0.0174; g += '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.cos(a) * r) + ' ' + f(cy + Math.sin(a) * r) + '" stroke="' + INK + '" stroke-width="1"/>'; } return g + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + INK + '"/>'; }
    s += spoked(-50, 0, 46) + '<path d="M-50 0 L70 0 L90 -30 M-30 -50 H40 L50 -30 H-40 Z" stroke="' + INK + '" stroke-width="3" fill="#2b2620"/>';
    s += '<path d="M-36 -54 C-36 -76 20 -76 24 -54 Z" fill="#2b2620" stroke="' + INK + '" stroke-width="2"/><path d="M40 -50 L70 -96 M60 -96 H84" stroke="' + INK + '" stroke-width="3"/>';
    s += '<ellipse cx="-70" cy="-20" rx="26" ry="7" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2" transform="rotate(' + f(Math.sin(t * 20) * 2) + ' -70 -20)"/><rect x="-82" y="-40" width="30" height="20" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2"/>';
    s += spoked(90, 16, 30);
    if (o.smoke) for (var k = 0; k < 6; k++) { var u = (t * 0.7 + k / 6) % 1; s += '<circle cx="' + f(-100 - u * 70) + '" cy="' + f(-40 - u * 40) + '" r="' + f(5 + u * 12) + '" fill="#8a857a" opacity="' + f(0.6 * (1 - u)) + '"/>'; }
    return s + '</g>'; }
  // Bertha as in the 1888 photos: a cream shawl over her head and shoulders, a long light dress
  function bertha(x, y, t, mood, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-50 150 C-56 50 -30 28 0 28 C30 28 56 50 50 150 Z" fill="#a9c2a0" stroke="' + INK + '" stroke-width="3"/><path d="M-30 80 h60 M-36 110 h72" stroke="#7a9a72" stroke-width="2"/>' + head(0, -20, 36, mood, t, o.look || 0) + '<path d="M-44 -10 C-50 -60 -24 -70 0 -70 C24 -70 50 -60 44 -10 C36 -40 24 -52 0 -52 C-24 -52 -36 -40 -44 -10 Z" fill="#f1e6c8" stroke="' + INK + '" stroke-width="3"/><path d="M-44 -10 C-40 20 -30 40 -46 60 M44 -10 C40 20 30 40 46 60" stroke="#f1e6c8" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M18 -60 L36 -80" stroke="#c9a04e" stroke-width="2"/></g>'; }
  function boy(x, y, t, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 6 + x) * 2) + ') scale(' + (o.s || 1) + ')"><path d="M-36 140 C-40 50 -24 28 0 28 C24 28 40 50 36 140 Z" fill="#6a6a6a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -14, 30, "happy", t, o.look || 0) + '<path d="M-30 -30 C-30 -54 30 -54 34 -30 L44 -26 L-30 -26 Z" fill="#5a5a5a" stroke="' + INK + '" stroke-width="2.4"/>' + (o.push ? '<path d="M' + (o.push * 30) + ' 50 l' + (o.push * 40) + ' -6" stroke="#6a6a6a" stroke-width="12" stroke-linecap="round"/>' : '') + '</g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — driving, under the bonnet tiny explosions, up to a hundred a second (Cairo street, bonnet cut open)
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 400, k), 180, lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 60, 20, 6, 0.8) + city(t - 0, 230, 110, "#c9a58a", "#f7e7b0", 4, false) + road(t, 250, 420);
    s += car(320, 222, t, { hood: u > 1.2, flash: u > 1.2 });
    var n = Math.round(100 * clamp((u - 2.4) / 1.6)); if (u > 2.4) s += '<g transform="translate(450 90)"><rect x="-80" y="-20" width="160" height="38" rx="9" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + YEL + '">' + n + ' انفجار/ثانية</text></g>';
    return s + tag("تحت الكبوت!", 430, 150, u, 1.4, 3, 15);
  });
  // 1 — those explosions are what move the car (bang → arrow → the car shoots off)
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 160, 20, 6, 0.8) + road(t, 250, 900) + car(320 + Math.sin(t * 3) * 8, 222, t, { spin: t * 1200, tilt: -1.5 });
    s += boom(470, 120, 40, (t * 2) % 1) + arrow(500, 140, 560, 200, YEL, 6, 1);
    for (var k = 0; k < 8; k++) { var ku = (t * 2 + k / 8) % 1; s += '<path d="M' + f(160 - ku * 200) + ' ' + (190 + k * 6) + ' h-40" stroke="#fff" stroke-width="2.4" opacity="' + f(1 - ku) + '"/>'; }
    return s;
  });
  // 2 — how does a bang make the wheels spin?
  shot(2, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + boom(200, 170, 70, (t * 1.3) % 1) + '<circle cx="200" cy="170" r="30" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>' + arrow(280, 170, 360, 170, INK, 6, clamp(u / 0.6)) + wheel(450, 170, 64, t * 160);
    return s + qmark(330, 100, t, 56) + tag("إزاي؟", 330, 290, u, 0.8, -3, 20);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + car(300, 170, t, { hood: true, flash: true, s: 0.9 }) + tag("إيه الحكاية؟", 320, 290, u, 0.1, -3, 26);
  });
  // 4 — turn the key: a small electric motor, the starter, spins the big engine for its first turns (pinion meshes the flywheel ring)
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var turn = ease(clamp((u - 0.3) / 0.5)), crank = u > 0.9 ? (u - 0.9) : 0, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2e33"/>';
    s += '<g transform="translate(140 170)"><circle r="56" fill="#3a3f46" stroke="#8a929c" stroke-width="4"/><circle r="18" fill="#1c1c1c"/><g transform="rotate(' + f(-60 + 90 * turn) + ')"><rect x="-6" y="-60" width="12" height="44" rx="3" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><path d="M-22 -96 C-22 -112 22 -112 22 -96 V-64 H-22 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/></g>';
    ["OFF", "ON", "START"].forEach(function (l, k) { var a = (-60 + 45 * k) * Math.PI / 180; s += '<text x="' + f(Math.sin(a) * 74) + '" y="' + f(-Math.cos(a) * 74 + 4) + '" text-anchor="middle" style="font:700 10px Noto Serif;fill:#e9e4d8;direction:ltr">' + l + '</text>'; }); s += '</g>';
    s += gear(420, 170, 100, 40, crank * 2.2, "url(#gGear)") + '<circle cx="420" cy="170" r="60" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    var engaged = u > 0.8, sx = engaged ? 240 : 220; s += '<rect x="' + sx + '" y="236" width="80" height="44" rx="10" fill="#5a6068" stroke="' + INK + '" stroke-width="2.4"/><rect x="' + (sx + 10) + '" y="214" width="56" height="24" rx="8" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/><circle cx="' + (sx + 8) + '" cy="226" r="4" fill="#c9a04e" stroke="' + INK + '"/>' + gear(engaged ? 320 : 300, 258, 16, 9, -crank * 14);
    if (u > 0.8 && u < 2.6) s += '<path d="M180 250 q20 -20 40 0" stroke="' + YEL + '" stroke-width="3" fill="none" opacity="' + f(0.5 + 0.5 * Math.sin(t * 20)) + '"/>';
    return s + tag("المارش", 260, 320, u, 1.0, -3, 18) + tag("أول لفة", 470, 40, u, 1.6, 3, 16);
  });
  // 5 — inside the engine: cylinders, each with a piston going up and down (in-line four, firing 1-3-4-2, crank turning)
  shot(5, function (u, d) { return [320, 180, lerp(0.75, 0.85, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e4d8"/>', base = t * 360 * 0.8;
    [0, 180, 180, 0].forEach(function (ph, k) { var ang = base + ph + (k === 2 || k === 3 ? 360 * 0 : 0), cyc = ((base + [0, 540, 180, 360][k]) % 720) / 720; s += cylinder(140 + k * 120, 40, (base + [0, 540, 180, 360][k]) % 360, t, { fire: cyc < 0.25 ? 1 - cyc * 4 : 0, mix: cyc > 0.75 || cyc < 0.25 }); });
    s += '<path d="M60 190 H580" stroke="#5a6068" stroke-width="8"/>';
    return s + tag("أسطوانة", 140, 300, u, 0.5, -3, 16) + tag("مكبس", 500, 300, u, 1.4, 3, 18);
  });
  // 6 — every piston repeats four steps in a row, forever (one cylinder, the 4 steps lit in turn)
  shot(6, function (u, d) { return [320, 170, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var ang = (t * 360 * 0.6) % 720, st = Math.floor(ang / 180), s = graphPaper(t) + cylinder(200, 80, ang % 360, t, { inV: st === 0, exV: st === 3, mix: st === 1 || st === 0, fire: st === 2 ? 1 - (ang % 180) / 180 : 0, spark: st === 2 && ang % 180 < 30, smoke: st === 3 });
    var L4 = ["شفط", "ضغط", "انفجار", "طرد"]; for (var k = 0; k < 4; k++) s += '<g transform="translate(450 ' + (70 + k * 56) + ')"><rect x="-80" y="-20" width="160" height="40" rx="10" fill="' + (k === st ? YEL : "#fbfaf6") + '" stroke="' + INK + '" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + (k + 1) + '. ' + L4[k] + '</text></g>';
    return s + tag("على طول!", 450, 310, u, 1.6, -3, 17);
  });
  // 7 — 1: the piston goes down, sucks air in, and fuel is sprayed in with it like a spray bottle
  shot(7, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var ang = 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { inV: 1, mix: true, air: true, spray: true });
    return s + tag("شفط هوا", 110, 70, u, 0.4, -3, 16) + tag("بنزين!", 120, 120, u, 1.4, 3, 15);
  });
  // 8 — 2: the piston comes up and squeezes the mix into a tiny space
  shot(8, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var ang = 180 + 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { mix: true });
    s += arrow(330, 220, 330, 120, RED, 6, clamp(u / 0.6));
    return s + tag("ضغط!", 360, 80, u, 0.6, 3, 18);
  });
  // 9 — 3: the plug sparks, the mix explodes and slams the piston down
  shot(9, function (u, d) { var sh = u > 0.5 && u < 1.0 ? 6 * Math.sin(u * 80) : 0; return [220 + sh, 150, lerp(1.3, 1.2, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), ang = 180 * ease(k), s = graphPaper(t) + cylinder(220, 80, ang, t, { fire: u > 0.4 ? clamp(1.2 - k) : 0, spark: u > 0.25 && u < 0.6, mix: u < 0.4 });
    s += boom(220, 90, 60, clamp((u - 0.4) / 0.6)) + arrow(330, 120, 330, 230, YEL, 7, clamp((u - 0.5) / 0.5));
    return s + tag("البوجيه", 110, 60, u, 0.2, -3, 15) + tag("بوم!", 360, 70, u, 0.5, 3, 20, "#ffb08a");
  });
  // 10 — that's the only step that makes power; the rest just prepare it
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), L4 = ["شفط", "ضغط", "انفجار", "طرد"];
    for (var k = 0; k < 4; k++) { var hot = k === 2, x = 100 + k * 146, h = hot ? 160 + 10 * Math.sin(t * 8) : 60; s += '<rect x="' + (x - 50) + '" y="' + f(270 - h) + '" width="100" height="' + f(h) + '" rx="8" fill="' + (hot ? YEL : "#d9d4c8") + '" stroke="' + INK + '" stroke-width="2.6"/><text x="' + x + '" y="300" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + L4[k] + '</text>'; if (hot) s += boom(x, 80, 40, (t * 1.5) % 1); }
    return s + tag("القوة كلها هنا!", 392, 40, u, 0.5, 3, 17) + tag("تجهيز", 130, 150, u, 1.6, -3, 15);
  });
  // 11 — 4: up again, pushing the burnt gas out the exhaust
  shot(11, function (u, d) { return [260, 150, lerp(1.2, 1.1, u / d)]; }, function (u, d, t) {
    var ang = 180 + 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { exV: 1, smoke: true, exhaust: true });
    s += '<path d="M330 50 H420 V70 H460" stroke="#5a6068" stroke-width="14" fill="none"/>'; for (var e = 0; e < 6; e++) { var eu = (t + e / 6) % 1; s += '<circle cx="' + f(470 + eu * 60) + '" cy="' + f(70 - eu * 30) + '" r="' + f(6 + eu * 10) + '" fill="#8a857a" opacity="' + f(0.7 * (1 - eu)) + '"/>'; }
    return s + tag("الشكمان", 440, 120, u, 0.6, 3, 16);
  });
  // 12 — in a four-cylinder engine at 3,000 rpm this happens a hundred times a second (tach + 4 cylinders flashing)
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var rpm = clamp(u / 1.2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + tacho(150, 170, 90, 3 * rpm / 7, "x1000 rpm");
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * 25) + [0, 2, 3, 1][k]) % 4 === 0; s += '<rect x="' + (330 + k * 60) + '" y="110" width="44" height="90" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (352 + k * 60) + '" cy="130" r="26" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(100 * clamp((u - 0.6) / 1.4)); s += '<g transform="translate(440 260)"><rect x="-110" y="-24" width="220" height="44" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 19px Noto Sans Arabic;fill:' + YEL + '">' + n + ' مرة في الثانية!</text></g>';
    return s;
  });
  // 13 — but the piston goes up and down, and the wheel goes round: how?
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), y = 170 + 50 * Math.sin(t * 6);
    s += '<rect x="140" y="60" width="80" height="220" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2.4"/><rect x="146" y="' + f(y - 30) + '" width="68" height="40" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/>' + arrow(250, 120, 250, 220, INK, 4, 1) + arrow(250, 220, 250, 120, INK, 4, 1) + wheel(470, 170, 70, t * 200) + curl(470, 170, 100, -0.6, 2.2, YEL, 5, 1);
    return s + qmark(340, 120, t, 60);
  });
  // 14 — the pistons are joined to the crankshaft, which turns up-and-down into round-and-round, like a bike's pedals
  shot(14, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var a = t * 4, s = graphPaper(t) + cylinder(180, 70, (a * 57.3) % 360, t, {});
    var px = 470 + 40 * Math.sin(a), py = 220 - 40 * Math.cos(a);
    s += '<circle cx="470" cy="220" r="48" fill="none" stroke="#9a958c" stroke-width="2" stroke-dasharray="6 5"/><path d="M470 220 L' + f(px) + ' ' + f(py) + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><rect x="' + f(px - 16) + '" y="' + f(py - 5) + '" width="32" height="10" rx="3" fill="' + INK + '"/>';
    s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(430 + 10 * Math.sin(a)) + ' 110 L460 30" stroke="#2f6f9f" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="470" cy="220" r="10" fill="#5a6068"/>';
    return s + tag("عمود الكرنك", 180, 330, u, 0.4, -3, 17) + tag("زي بدّال العجلة", 470, 330, u, 1.8, 3, 16);
  });
  // 15 — then the gearbox: gears of different sizes
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var a = t * 2, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a48"/><rect x="60" y="40" width="520" height="280" rx="20" fill="#5a6068" opacity=".35" stroke="#8a929c" stroke-width="3"/>';
    s += gear(160, 130, 40, 14, a) + gear(242, 130, 30, 10, -a * 1.4 + 0.2) + gear(320, 130, 22, 8, a * 1.9) + gear(400, 130, 30, 10, -a * 1.4) + gear(480, 130, 40, 14, a);
    s += gear(160, 240, 26, 9, -a * 1.6) + gear(232, 240, 36, 12, a * 1.15) + gear(320, 240, 46, 16, -a * 0.9) + gear(420, 240, 36, 12, a * 1.15);
    s += '<path d="M40 180 H600" stroke="#c9ced4" stroke-width="10"/>';
    return s + tag("الفتيس", 320, 30, u, 0.4, -3, 20);
  });
  // 16 — the small gear gives a lot of force to pull away; the big one gives speed on the road (two pairs, two speeds)
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), a = t * 3;
    s += gear(110, 130, 20, 7, a * 2.5) + gear(180, 130, 50, 17, -a * 1.0) + '<text x="150" y="220" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">قوة 💪</text>';
    s += gear(420, 130, 46, 16, a * 2.5) + gear(510, 130, 24, 8, -a * 4.8) + '<text x="470" y="220" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">سرعة</text>';
    s += '<g transform="translate(150 290) scale(.45)">' + car(0, 0, t, { spin: t * 80 }) + '</g><g transform="translate(470 290) scale(.45)">' + car(0, 0, t, { spin: t * 900 }) + '</g>';
    for (var k = 0; k < 5; k++) { var ku = (t * 2.4 + k / 5) % 1; s += '<path d="M' + f(420 - ku * 80) + ' ' + (280 + k * 4) + ' h-24" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - ku) + '"/>'; }
    return s.replace("قوة 💪", "قوة") + tag("من الوقفة", 150, 40, u, 0.4, -3, 15) + tag("على الطريق", 470, 40, u, 1.6, 3, 15);
  });
  // 17 — from the gearbox a shaft carries the turning to the wheels (car cut away, shaft spinning)
  shot(17, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 80, 20, 6, 0.8) + road(t, 250, 500) + car(320, 222, t, { spin: t * 700 });
    s += '<rect x="210" y="200" width="200" height="16" fill="#2b2e33" opacity=".85"/><rect x="380" y="194" width="50" height="28" rx="4" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 10; k++) s += '<path d="M' + f(214 + ((k * 20 + t * 300) % 196)) + ' 202 v12" stroke="' + YEL + '" stroke-width="3"/>';
    return s + tag("عمود الكردان", 300, 120, u, 0.5, -3, 16) + tag("للعجل", 220, 300, u, 1.4, 3, 15);
  });
  // 18 — a clever gear, the differential, lets the outer wheel turn faster than the inner one round corners (top view + inset)
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#9dbb6e"/>', a = t * 0.5;
    s += '<circle cx="320" cy="420" r="300" fill="none" stroke="#5a5752" stroke-width="80"/><circle cx="320" cy="420" r="300" fill="none" stroke="#e9e4d8" stroke-width="3" stroke-dasharray="20 16"/>';
    var ang = -Math.PI / 2 + 0.6 * Math.sin(a), cx = 320 + 300 * Math.cos(ang), cy = 420 + 300 * Math.sin(ang);
    s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(ang * 57.3 + 90) + ')"><rect x="-50" y="-26" width="100" height="52" rx="12" fill="url(#gCar)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-14" y="-22" width="36" height="44" rx="6" fill="#9fd2e8" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="-42" y="-34" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="-42" y="24" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="22" y="-34" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="22" y="24" width="22" height="10" rx="3" fill="#1c1c1c"/></g>';
    s += '<path d="M' + f(320 + 340 * Math.cos(ang - 0.3)) + ' ' + f(420 + 340 * Math.sin(ang - 0.3)) + ' A340 340 0 0 1 ' + f(320 + 340 * Math.cos(ang)) + ' ' + f(420 + 340 * Math.sin(ang)) + '" stroke="' + RED + '" stroke-width="5" fill="none"/><path d="M' + f(320 + 262 * Math.cos(ang - 0.3)) + ' ' + f(420 + 262 * Math.sin(ang - 0.3)) + ' A262 262 0 0 1 ' + f(320 + 262 * Math.cos(ang)) + ' ' + f(420 + 262 * Math.sin(ang)) + '" stroke="' + BLUE + '" stroke-width="5" fill="none"/>';
    var p = pop((u - 1.0) / 0.8); if (p > 0) { s += '<g transform="translate(520 260) scale(' + f(p) + ')"><path d="M-70 -40 L-40 -70 H40 L70 -40 V40 L40 70 H-40 L-70 40 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="3"/>';
      for (var bo = 0; bo < 10; bo++) { var ba = bo / 10 * Math.PI * 2; s += '<circle cx="' + f(Math.cos(ba) * 62) + '" cy="' + f(Math.sin(ba) * 62) + '" r="3" fill="#9aa2ac"/>'; }
      s += '<ellipse cx="-10" cy="0" rx="18" ry="50" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2"/>';
      for (var tt = 0; tt < 16; tt++) { var ty = -46 + ((tt * 6 + t * 30) % 92); s += '<path d="M-24 ' + f(ty) + ' l12 4" stroke="#7a5a24" stroke-width="2"/>'; }
      s += '<rect x="2" y="-30" width="50" height="60" rx="8" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>' + gear(27, -14, 9, 6, t * 4) + gear(27, 14, 9, 6, -t * 4 + 0.4) + '</g>'; }
    return s + tag("الدفرنس", 520, 170, u, 1.2, 3, 17) + tag("برا أسرع", 130, 60, u, 2.0, -3, 15, "#ffb08a");
  });
  // 19 — the first long trip by car was made by a woman, Bertha Benz, in 1888 (sepia, the Patent-Motorwagen)
  shot(19, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/>' + clouds(t, 30, 10, 5, 0.5) + '<rect x="-400" y="250" width="1440" height="300" fill="#c9a87a"/>';
    for (var tr = 0; tr < 8; tr++) { var tx = ((tr * 120 - t * 40) % 960 + 960) % 960 - 160; s += '<path d="M' + f(tx) + ' 250 V190" stroke="#7a5a3a" stroke-width="6"/><circle cx="' + f(tx) + '" cy="180" r="22" fill="#8a9a5a" opacity=".7"/>'; }
    s += motorwagen(330, 240, t, { s: 1.1, smoke: true }) + bertha(330, 124, t, "happy", { s: 0.5 }) + boy(210, 170, t, { s: 0.48, push: 1, look: 1 }) + boy(450, 170, t + 1, { s: 0.46, push: -1, look: -1 });
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".18"/>';
    var y = Math.round(lerp(2026, 1888, clamp(u / 1.6))); s += '<g transform="translate(130 50)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("بيرتا بنز", 500, 60, u, 1.0, 3, 19);
  });
  // 20 — she took her husband Karl's car without him knowing and drove about 100 km (map Mannheim → Pforzheim, Karl asleep)
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9dcc0"/>', k = clamp(u / (d - 0.6));
    s += '<path d="M100 100 C200 140 300 120 380 200 C430 250 500 260 560 280" stroke="#c9a87a" stroke-width="16" fill="none"/><path d="M100 100 C200 140 300 120 380 200 C430 250 500 260 560 280" stroke="' + RED + '" stroke-width="4" fill="none" stroke-dasharray="' + f(560 * k) + ' 900"/>';
    s += '<circle cx="100" cy="100" r="8" fill="' + INK + '"/><text x="100" y="80" text-anchor="middle" style="font:800 14px Noto Serif;fill:' + INK + ';direction:ltr">Mannheim</text><circle cx="560" cy="280" r="8" fill="' + INK + '"/><text x="560" y="310" text-anchor="middle" style="font:800 14px Noto Serif;fill:' + INK + ';direction:ltr">Pforzheim</text>';
    var bx = lerp(100, 560, k), by = k < 0.5 ? lerp(100, 200, k * 2) : lerp(200, 280, (k - 0.5) * 2); s += '<g transform="translate(' + f(bx) + ' ' + f(by - 14) + ') scale(.35)">' + motorwagen(0, 0, t, {}) + '</g>';
    s += '<g transform="translate(140 240)"><rect x="-60" y="10" width="120" height="30" fill="#7a5230" stroke="' + INK + '" stroke-width="2"/>' + head(0, 0, 26, "n", t * 0 + 1.5, 0) + '<text x="34" y="' + f(-20 - 6 * Math.sin(t * 2)) + '" style="font:800 16px Noto Serif;fill:' + INK + '">z z z</text></g>';
    var km = Math.round(100 * k); s += '<g transform="translate(420 90)"><rect x="-60" y="-18" width="120" height="34" rx="9" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + YEL + '">' + km + ' كم</text></g>';
    return s + tag("كارل نايم!", 140, 320, u, 0.8, -3, 15);
  });
  // 21 — she bought fuel at a pharmacy, and when the fuel pipe clogged she cleared it with her hat pin!
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="40" y="40" width="240" height="220" fill="#c9a87a" stroke="' + INK + '" stroke-width="3"/><rect x="60" y="56" width="200" height="34" fill="#2f6a3a" stroke="' + INK + '" stroke-width="2"/><text x="160" y="80" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#fbf6e6">صيدلية</text>';
    for (var b = 0; b < 6; b++) s += '<rect x="' + (70 + b * 32) + '" y="' + (120 + (b % 2) * 50) + '" width="18" height="34" rx="4" fill="' + ["#9fd2e8", "#c9a04e", "#9dbb6e"][b % 3] + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<g transform="translate(' + f(lerp(160, 340, clamp(u / 1.2))) + ' 200)"><rect x="-14" y="-40" width="28" height="44" rx="5" fill="#c9a04e" stroke="' + INK + '" stroke-width="2"/><text y="-12" text-anchor="middle" style="font:700 8px Noto Serif;fill:' + INK + ';direction:ltr">Ligroin</text></g>';
    var pk = clamp((u - 1.8) / 1.0), pinX = lerp(560, 470, ease(pk)); s += '<rect x="380" y="150" width="200" height="22" rx="10" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(pinX) + ' 161 H' + f(pinX + 110) + '" stroke="#5a6068" stroke-width="3"/><circle cx="' + f(pinX + 112) + '" cy="161" r="7" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.6"/>';
    if (pk >= 1) for (var q = 0; q < 6; q++) { var qu = (t * 1.6 + q / 6) % 1; s += '<circle cx="' + f(380 - qu * 60) + '" cy="161" r="3" fill="' + YEL + '" opacity="' + f(1 - qu) + '"/>'; }
    return s + tag("بنزين من الصيدلية!", 160, 300, u, 0.5, -3, 15) + tag("دبوس البرنيطة!", 480, 100, u, 1.9, 3, 16);
  });
  // 22 — since then the idea is the same: a small bang turns a shaft turns the wheels
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + boom(110, 170, 50, (t * 1.6) % 1) + '<circle cx="110" cy="170" r="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + arrow(160, 170, 220, 170, INK, 5, clamp(u / 0.5));
    s += '<rect x="230" y="160" width="140" height="20" rx="8" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/>'; for (var k = 0; k < 6; k++) s += '<path d="M' + f(236 + ((k * 24 + t * 200) % 130)) + ' 162 v16" stroke="' + YEL + '" stroke-width="3"/>';
    s += arrow(380, 170, 440, 170, INK, 5, clamp((u - 0.6) / 0.5)) + wheel(520, 170, 56, t * 300);
    return s + tag("انفجار", 110, 260, u, 0.3, -3, 15) + tag("عمود", 300, 260, u, 0.8, 3, 15) + tag("عجل", 520, 270, u, 1.3, -3, 15);
  });
  // 23 — so every time you press the accelerator you're asking for more explosions a second (foot down, tach up, faster flashes)
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var p = ease(clamp((u - 0.2) / 0.8)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2e33"/>' + tacho(470, 150, 80, lerp(0.12, 0.85, p) + 0.02 * Math.sin(t * 20), "x1000 rpm");
    s += '<g transform="translate(180 250) rotate(' + f(-20 + 18 * p) + ')"><rect x="-30" y="-70" width="60" height="110" rx="10" fill="#5a6068" stroke="' + INK + '" stroke-width="2.4"/></g><path d="M80 80 L' + f(170 + 10 * p) + ' ' + f(200 + 20 * p) + '" stroke="#2f2a26" stroke-width="40" stroke-linecap="round"/>';
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * lerp(6, 40, p)) + k) % 4 === 0; s += '<rect x="' + (300 + k * 40) + '" y="260" width="30" height="60" rx="4" fill="#5a6068" stroke="#8a929c"/>' + (on ? '<circle cx="' + (315 + k * 40) + '" cy="272" r="18" fill="url(#gBoom)"/>' : ''); }
    return s + tag("انفجارات أكتر!", 470, 260, u, 1.2, 3, 17);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + car(300, 160, t, { hood: true, flash: true, s: 0.8 });
    return s + qmark(500, 80, t, 56) + qmark(550, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { boy: boy, car: car, road: road, cylinder: cylinder, gear: gear, tacho: tacho, motorwagen: motorwagen, bertha: bertha, boom: boom, wheel: wheel, tag: tag };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
