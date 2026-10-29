  // ── new pieces for this episode: the High Dam (a rock-fill embankment, not a concrete wall), its turbines and generators,
  // the step-up switchyard at the dam's foot, 500 kV towers, the city substations, the street kiosk and the home ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff", CU = "#e09a5a";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function worker(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1.5) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#f08a24") + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 38, mood, t, o.look || 0);
    if (!o.noHat) s += '<path d="M-40 -34 C-40 -76 40 -76 40 -34 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/><path d="M-50 -34 H50" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    return s + '</g>'; }
  function bolt(x, y, s, col) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')" d="M4 -20 L-8 2 H0 L-4 20 L10 -4 H2 Z" fill="' + (col || YEL) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'; }
  function dots(path, t, n, col, sp, r) {   // charges running along a polyline [[x,y],...]
    var L2 = [], tot = 0; for (var i = 1; i < path.length; i++) { var l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); L2.push(l); tot += l; }
    var s = ""; for (var k = 0; k < n; k++) { var d = ((t * (sp || 120) + k * tot / n) % tot), j = 0; while (j < L2.length - 1 && d > L2[j]) { d -= L2[j]; j++; } var u = d / L2[j], x = lerp(path[j][0], path[j + 1][0], u), y = lerp(path[j][1], path[j + 1][1], u);
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (r || 3.4) + '" fill="' + (col || YEL) + '" stroke="' + INK + '" stroke-width="1"/>'; }
    return s; }
  function poly(path) { return "M" + path.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"); }
  // a room at night: wall, switch, ceiling lamp. o: {on 0..1, press 0..1}
  function room(t, o) {
    o = o || {}; var on = clamp(o.on || 0), s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gRoom)"/><rect x="-400" y="-300" width="1440" height="960" fill="#0b1730" opacity="' + f(0.6 * (1 - on)) + '"/>';
    s += '<rect x="420" y="60" width="160" height="130" fill="#1e3458" stroke="#6a5a40" stroke-width="8"/>' + stars(t).replace(/<circle/g, '<circle clip-path="url(#winclip)"') + '<clipPath id="winclip"><rect x="424" y="64" width="152" height="122"/></clipPath><path d="M500 60 V190 M420 125 H580" stroke="#6a5a40" stroke-width="5"/>';
    s += '<rect x="-400" y="300" width="1440" height="300" fill="#8a6a48"/><rect x="-400" y="296" width="1440" height="8" fill="#5a4030"/>';
    s += '<path d="M260 -300 V20" stroke="' + INK + '" stroke-width="2"/><path d="M240 20 H280 L292 44 H228 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    if (on > 0) s += '<circle cx="260" cy="56" r="' + f(160 * on) + '" fill="url(#gBulb)" opacity="' + f(0.7 * on) + '"/>';
    s += '<circle cx="260" cy="56" r="13" fill="' + (on > 0.5 ? "#fffbe6" : "#9aa2ac") + '" stroke="' + INK + '" stroke-width="2"/>';
    var pr = clamp(o.press || 0); s += '<rect x="120" y="140" width="34" height="50" rx="5" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/><rect x="129" y="' + f(150 + 14 * (on > 0.5 ? 1 : 0)) + '" width="16" height="16" rx="3" fill="#d9d4c8" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.hand) s += '<path d="M' + f(lerp(40, 112, pr)) + ' ' + f(lerp(230, 174, pr)) + ' l26 -4 l4 10 l-26 6 Z" fill="#e0b48a" stroke="' + INK + '" stroke-width="2"/><path d="M-40 260 L' + f(lerp(40, 112, pr)) + ' ' + f(lerp(236, 180, pr)) + '" stroke="#2f6f9f" stroke-width="22" stroke-linecap="round"/>';
    return s; }
  // the dam in cross-section: lake (left, high), rock-fill embankment with a clay core and a road on top, the river below (right, low)
  // o: {lake, river, tunnel 0..1 (water in the power tunnel), house} ; world: crest y 100, lake level LK, river level RV, bed 300
  var LK = 120, RV = 200;
  function damSection(t, o) {
    o = o || {}; var s = sky("day") + clouds(t, 60, -10, 7, 0.8) + birds(t, 40, 50) + birds(t + 3, 70, 40), lk = o.lake || LK, rv = o.river || RV;
    // the High Dam is very wide and low (base about 9× its height): slopes run from the crest (290–330, y 96) to feet at x -40 and 640
    s += '<path d="M-400 ' + f(lk) + ' H' + f(290 - (lk - 96) / 204 * 330) + ' L-40 300 H-400 Z" fill="url(#gLake)"/>';
    var surf = "M-400 " + lk; for (var x = -400; x <= 240; x += 20) surf += " L" + x + " " + f(lk + 2 * Math.sin(x * 0.05 - t * 2)); s += '<path d="' + surf + '" stroke="#cfeaf4" stroke-width="2" fill="none"/>';
    var rx0 = 330 + (rv - 96) / 204 * 310; s += '<path d="M' + f(rx0) + ' ' + f(rv) + ' H1040 V300 H640 Z" fill="url(#gRiver)"/>';
    var rs = "M" + f(rx0) + " " + rv; for (var x2 = Math.ceil(rx0 / 20) * 20; x2 <= 1040; x2 += 20) rs += " L" + x2 + " " + f(rv + 2 * Math.sin(x2 * 0.06 - t * 3)); s += '<path d="' + rs + '" stroke="#cfeaf4" stroke-width="2" fill="none"/>';
    for (var i = 0; i < 10; i++) { var cu = (t * 0.25 + hash(i)) % 1; s += '<path d="M' + f(lerp(560, 1000, cu)) + ' ' + f(rv + 14 + hash(i + 3) * 70) + ' h22" stroke="#cfeaf4" stroke-width="2" opacity="' + f(0.6 * Math.sin(Math.PI * cu)) + '"/>'; }
    for (var gl = 0; gl < 18; gl++) { var gk = hash(gl + Math.floor(t * 12) * 17); s += '<circle cx="' + f(-300 + hash(gl * 3) * 520) + '" cy="' + f(lk + 8 + hash(gl * 7) * 90) + '" r="' + f(1.5 + gk * 2.5) + '" fill="#e9f6fb" opacity="' + f(gk) + '"/>'; }
    s += '<path d="M-40 300 L290 96 L330 96 L640 300 Z" fill="url(#gFill)" stroke="' + INK + '" stroke-width="3"/><path d="M230 300 L300 100 L322 100 L360 300 Z" fill="url(#gCore)" opacity=".85"/>';
    for (var r = 0; r < 40; r++) { var rx = -20 + hash(r) * 640, ry = 110 + hash(r + 9) * 180; if (ry > 96 + (rx < 310 ? (310 - rx) * 0.62 : (rx - 310) * 0.66)) s += '<circle cx="' + f(rx) + '" cy="' + f(ry) + '" r="' + f(3 + hash(r + 2) * 4) + '" fill="#7a6650" opacity=".55"/>'; }
    s += '<rect x="286" y="88" width="48" height="8" fill="#5a5752"/>' + '<rect x="-400" y="300" width="1440" height="400" fill="url(#gRock)"/>';
    if (o.tunnel != null) { var tp = [[40, 250], [300, 318], [650, 286]], k = clamp(o.tunnel); s += '<path d="' + poly(tp) + '" stroke="#3a3834" stroke-width="30" fill="none" stroke-linejoin="round"/><path d="' + poly(tp) + '" stroke="#2f7fa8" stroke-width="22" fill="none" stroke-linejoin="round" opacity="' + f(0.3 + 0.7 * k) + '"/>' + (k > 0 ? dots(tp, t, 12, CY, 60 + 140 * k, 3) : ''); }
    if (o.house !== false) s += '<rect x="620" y="236" width="64" height="64" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2.4"/><path d="M620 236 H684" stroke="' + INK + '" stroke-width="4"/><rect x="632" y="246" width="40" height="10" fill="#9fd2e8" stroke="' + INK + '" stroke-width="1.4"/>';
    return s; }
  // a Francis runner seen from above inside its spiral case: water spirals in, the runner turns
  function francis(x, y, r, t, sp) {
    var a = t * (sp || 2), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    var sc = "M" + f(r * 1.9) + " " + f(-r * 0.2); for (var k = 0; k <= 60; k++) { var th = k / 60 * Math.PI * 2, rr = r * (1.85 - 0.6 * k / 60); sc += " L" + f(Math.cos(th) * rr) + " " + f(Math.sin(th) * rr); }
    s += '<path d="M' + f(r * 1.9) + ' ' + f(-r * 0.75) + ' H' + f(r * 3) + ' V' + f(r * 0.35) + ' H' + f(r * 1.9) + ' Z" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2.4"/><path d="' + sc + ' Z" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2.6"/>';
    for (var rb = 0; rb < 10; rb++) { var th2 = rb / 10 * Math.PI * 2, r1 = r * 1.24, r2 = r * (1.85 - 0.6 * rb / 10); s += '<path d="M' + f(Math.cos(th2) * r1) + ' ' + f(Math.sin(th2) * r1) + ' L' + f(Math.cos(th2) * r2) + ' ' + f(Math.sin(th2) * r2) + '" stroke="#3a3f46" stroke-width="2.4" stroke-dasharray="2 3"/>'; }   // riveted seams, as in the photo of the scroll case
    s += '<circle r="' + f(r * 1.22) + '" fill="#2f6f8a" stroke="' + INK + '" stroke-width="2"/>';
    for (var w = 0; w < 14; w++) { var wa = (w / 14) * Math.PI * 2 - t * 1.2 * (sp || 2) * 0.4, ww = (t * 0.8 + w / 14) % 1, rr2 = lerp(r * 1.7, r * 0.5, ww); s += '<circle cx="' + f(Math.cos(wa + ww * 3) * rr2) + '" cy="' + f(Math.sin(wa + ww * 3) * rr2) + '" r="3" fill="' + CY + '" opacity="' + f(1 - ww * 0.6) + '"/>'; }
    for (var g = 0; g < 20; g++) { var ga = g / 20 * Math.PI * 2; s += '<path d="M' + f(Math.cos(ga) * r * 1.2) + ' ' + f(Math.sin(ga) * r * 1.2) + ' L' + f(Math.cos(ga + 0.2) * r * 1.02) + ' ' + f(Math.sin(ga + 0.2) * r * 1.02) + '" stroke="#5a6068" stroke-width="3"/>'; }
    s += '<g transform="rotate(' + f(a * 57.3) + ')"><circle r="' + r + '" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var b = 0; b < 13; b++) { var ba = b / 13 * Math.PI * 2; s += '<path d="M' + f(Math.cos(ba) * r * 0.3) + ' ' + f(Math.sin(ba) * r * 0.3) + ' Q' + f(Math.cos(ba + 0.5) * r * 0.7) + ' ' + f(Math.sin(ba + 0.5) * r * 0.7) + ' ' + f(Math.cos(ba + 0.9) * r * 0.97) + ' ' + f(Math.sin(ba + 0.9) * r * 0.97) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>'; }
    return s + '<circle r="' + f(r * 0.28) + '" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/></g></g>'; }
  // generator cross-section from above: stator ring with copper coils, rotor with alternating N/S magnet poles turning inside
  function genSection(x, y, r, t, sp, o) {
    o = o || {}; var a = t * (sp || 1.5), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r * 1.3) + '" fill="url(#gCase)" stroke="' + INK + '" stroke-width="3"/><circle r="' + f(r * 1.06) + '" fill="#2b2e33"/>';
    for (var c = 0; c < 24; c++) { var ca = c / 24 * Math.PI * 2, near = 0; for (var p = 0; p < 8; p++) { var pa = p / 8 * Math.PI * 2 + a, dd = Math.abs(Math.atan2(Math.sin(ca - pa), Math.cos(ca - pa))); if (dd < 0.18) near = 1 - dd / 0.18; }
      s += '<rect x="' + f(-6) + '" y="' + f(-r * 1.24) + '" width="12" height="' + f(r * 0.17) + '" rx="2" fill="url(#gCopper)" stroke="' + INK + '" stroke-width="1" transform="rotate(' + f(ca * 57.3) + ')"/>';
      if (o.glow && near > 0) s += '<rect x="-7" y="' + f(-r * 1.25) + '" width="14" height="' + f(r * 0.19) + '" rx="3" fill="' + YEL + '" opacity="' + f(near) + '" filter="url(#glow)" transform="rotate(' + f(ca * 57.3) + ')"/>'; }
    s += '<g transform="rotate(' + f(a * 57.3) + ')"><circle r="' + f(r * 0.92) + '" fill="#4a5058" stroke="' + INK + '" stroke-width="2"/>';
    for (var q = 0; q < 8; q++) { var qa = q / 8 * 360; s += '<g transform="rotate(' + qa + ')"><rect x="' + f(-r * 0.16) + '" y="' + f(-r * 0.94) + '" width="' + f(r * 0.32) + '" height="' + f(r * 0.3) + '" rx="3" fill="' + (q % 2 ? BLUE : RED) + '" stroke="' + INK + '" stroke-width="1.6"/><text y="' + f(-r * 0.72) + '" text-anchor="middle" style="font:800 ' + f(r * 0.14) + 'px Noto Serif;fill:#fff;direction:ltr">' + (q % 2 ? "S" : "N") + '</text></g>'; }
    return s + '<circle r="' + f(r * 0.2) + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/></g></g>'; }
  function trafo(x, y, s, t, o) {   // a big oil-filled power transformer: tank, radiator fins, brown porcelain bushings, hum lines
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-60" y="-50" width="120" height="70" rx="4" fill="url(#gTrafo)" stroke="' + INK + '" stroke-width="2.6"/>';
    for (var r = 0; r < 7; r++) g += '<rect x="' + (64 + r * 7) + '" y="-44" width="4" height="58" fill="#6f7c69" stroke="' + INK + '" stroke-width="1"/>';
    [-34, 0, 34].forEach(function (bx, k) { g += '<rect x="' + (bx - 5) + '" y="-104" width="10" height="56" fill="url(#gPorc)" stroke="' + INK + '" stroke-width="1.6"/>'; for (var ri = 0; ri < 7; ri++) g += '<ellipse cx="' + bx + '" cy="' + (-98 + ri * 7) + '" rx="9" ry="2.4" fill="#a8704a" stroke="' + INK + '" stroke-width=".8"/>'; g += '<circle cx="' + bx + '" cy="-106" r="4" fill="#8a929c" stroke="' + INK + '"/>'; });
    g += '<rect x="-60" y="20" width="120" height="10" fill="#3a3f46"/><text y="-8" text-anchor="middle" style="font:800 13px Noto Serif;fill:' + INK + ';direction:ltr;opacity:.6">' + (o.label || "") + '</text>';
    for (var h = 0; h < 3; h++) { var hu = (t * 1.2 + h / 3) % 1; g += '<path d="M' + f(-70 - hu * 30) + ' ' + f(-20 + h * 8) + ' q-6 -6 0 -12" stroke="' + CY + '" stroke-width="2" fill="none" opacity="' + f(1 - hu) + '"/><path d="M' + f(118 + hu * 30) + ' ' + f(-20 + h * 8) + ' q6 -6 0 -12" stroke="' + CY + '" stroke-width="2" fill="none" opacity="' + f(1 - hu) + '"/>'; }
    return g + '</g>'; }
  function tower(x, y, s) {   // a 500 kV lattice tower with cross-arms and hanging insulator strings; returns its 3 conductor points
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-30 0 L-8 -150 L8 -150 L30 0" stroke="#5a6068" stroke-width="3" fill="none"/>';
    for (var k = 0; k < 7; k++) { var y0 = -k * 21, w0 = 30 - k * 3.1, y1 = y0 - 21, w1 = w0 - 3.1; g += '<path d="M' + f(-w0) + ' ' + f(y0) + ' L' + f(w1) + ' ' + f(y1) + ' M' + f(w0) + ' ' + f(y0) + ' L' + f(-w1) + ' ' + f(y1) + '" stroke="#7a828c" stroke-width="1.4"/>'; }
    // three cross-arms with insulator strings hanging at both tips (a double-circuit lattice tower, after the photos), a peak for the earth wire
    [[-150, 40], [-122, 52], [-94, 44]].forEach(function (a) { g += '<path d="M' + (-a[1]) + ' ' + a[0] + ' H' + a[1] + ' L' + (a[1] - 8) + ' ' + (a[0] + 8) + ' H' + (-a[1] + 8) + ' Z" fill="#8a929c" stroke="' + INK + '" stroke-width="1.6"/>';
      [-1, 1].forEach(function (sd) { var cx = sd * (a[1] - 4); g += '<path d="M' + cx + ' ' + a[0] + ' V' + (a[0] + 18) + '" stroke="#3a3f46" stroke-width="4"/>'; for (var d = 0; d < 4; d++) g += '<ellipse cx="' + cx + '" cy="' + (a[0] + 4 + d * 4) + '" rx="4" ry="1.4" fill="#5a6068"/>'; }); });
    return g + '<path d="M-8 -150 L0 -168 L8 -150" stroke="#5a6068" stroke-width="3" fill="none"/></g>'; }
  function towerPts(x, y, s) { return [[x - 36 * s, y - 132 * s], [x - 48 * s, y - 104 * s], [x - 40 * s, y - 76 * s], [x + 36 * s, y - 132 * s], [x + 48 * s, y - 104 * s], [x + 40 * s, y - 76 * s]]; }
  function sag(a, b, d) { return 'M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f((a[0] + b[0]) / 2) + ' ' + f((a[1] + b[1]) / 2 + d) + ' ' + f(b[0]) + ' ' + f(b[1]); }
  function desertGround(t, y) { var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#gSand)"/>'; for (var i = 0; i < 16; i++) { var x = ((i * 100 - t * 20) % 1440 + 1440) % 1440 - 400; s += '<path d="M' + f(x) + ' ' + f(y + 20 + hash(i) * 60) + ' q30 -8 60 0" stroke="#b8945a" stroke-width="2" fill="none"/>'; } return s; }
  function egyptMap(t, o) {   // a simple map: the Nile from Aswan to Cairo and the Delta; o: {line 0..1, grid}
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e6cfa0"/>';
    for (var dn = 0; dn < 60; dn++) { var dx = ((hash(dn) * 1100 + t * 18) % 1100) - 250, dy = -100 + hash(dn + 7) * 520; s += '<path d="M' + f(dx) + ' ' + f(dy) + ' q14 -7 28 0 q14 7 28 0" stroke="#b08a52" stroke-width="3.4" fill="none" opacity=".8"/>'; }
    s += '<path d="M180 30 H470 V330 H180 Z" fill="#ecd8ac" stroke="#b8945a" stroke-width="2" stroke-dasharray="8 6"/>';
    var nile = [[330, 330], [334, 290], [326, 250], [338, 210], [330, 170], [322, 130], [318, 96]]; s += '<path d="' + poly(nile) + '" stroke="#2f7fa8" stroke-width="5" fill="none"/><path d="M318 96 L290 50 M318 96 L320 46 M318 96 L350 52" stroke="#2f7fa8" stroke-width="3"/><path d="M280 54 Q320 26 360 54 L318 96 Z" fill="#9dbb6e" opacity=".6"/>';
    s += '<path d="M318 340 C300 330 296 314 324 306 C350 300 360 320 340 334 Z" fill="url(#gLake)"/>';
    s += '<path d="' + poly(nile) + '" stroke="#cfeaf4" stroke-width="2" fill="none" stroke-dasharray="6 10" stroke-dashoffset="' + f(t * 30) + '"/>';
    s += '<circle cx="330" cy="304" r="6" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><text x="352" y="310" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">أسوان</text><circle cx="318" cy="96" r="6" fill="' + INK + '"/><text x="340" y="100" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">القاهرة</text>';
    if (o.line != null) { var p = clamp(o.line), lp = [[336, 300], [342, 250], [344, 200], [338, 150], [326, 100]]; s += '<path d="' + poly(lp) + '" stroke="' + YEL + '" stroke-width="4" fill="none" stroke-dasharray="' + f(260 * p) + ' 400"/>' + (p > 0.1 ? dots(lp, t, 7, YEL, 110, 5.5) : '');
      if (p > 0.2) { var gu = (t * 0.7) % 1, gi = Math.min(3, Math.floor(gu * 4)), gk = gu * 4 - gi, gx = lerp(lp[gi][0], lp[gi + 1][0], gk), gy = lerp(lp[gi][1], lp[gi + 1][1], gk); s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="26" fill="url(#gBulb)"/>' + bolt(gx, gy, 0.9); } }
    if (o.grid) { var gl = [[[326, 100], [250, 120], [220, 90]], [[326, 100], [420, 120], [440, 80]], [[338, 150], [400, 170], [450, 200]], [[344, 200], [260, 220]], [[326, 100], [300, 60]]]; gl.forEach(function (g, k) { s += '<path d="' + poly(g) + '" stroke="' + YEL + '" stroke-width="2.4" fill="none" opacity="' + f(clamp(o.grid * 2 - k * 0.3)) + '"/>' + dots(g, t + k, 2, YEL, 60, 3); }); }
    return s; }
  function kiosk(x, y, s, t) {   // an Egyptian distribution kiosk: light grey cabinet with louvred doors on a concrete plinth
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-54" y="-12" width="108" height="12" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/><rect x="-48" y="-84" width="96" height="72" rx="2" fill="#d9d6cc" stroke="' + INK + '" stroke-width="2.4"/><path d="M-52 -84 H52 V-90 H-52 Z" fill="#c9c6bc" stroke="' + INK + '" stroke-width="1.6"/>';
    [-24, 24].forEach(function (dx) { g += '<rect x="' + (dx - 20) + '" y="-78" width="40" height="62" fill="#e4e1d8" stroke="' + INK + '" stroke-width="1.4"/>'; for (var l = 0; l < 5; l++) g += '<path d="M' + (dx - 12) + ' ' + (-70 + l * 4) + ' h24 M' + (dx - 12) + ' ' + (-40 + l * 4) + ' h24" stroke="#9a978f" stroke-width="1.2"/>'; });
    return g + '<rect x="-34" y="-58" width="8" height="10" fill="' + RED + '" stroke="' + INK + '" stroke-width="1"/></g>'; }
  function meter(x, y, s, t, o) {   // a prepaid card meter: grey box, digital display, keypad, card slot
    // an Egyptian prepaid card meter: white case, blue backlit display, the card sticking out on the right, a round port bottom-left
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-44" y="-64" width="88" height="128" rx="8" fill="#f4f5f6" stroke="' + INK + '" stroke-width="2.6"/><rect x="-36" y="-54" width="72" height="34" rx="3" fill="#3f7fd8" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<text x="0" y="-31" text-anchor="middle" style="font:800 15px Noto Serif;fill:#eaf4ff;direction:ltr">' + (o.kwh || "0123.4") + '</text><rect x="44" y="-50" width="20" height="34" rx="2" fill="#fbfaf6" stroke="' + INK + '" stroke-width="1.6"/><circle cx="54" cy="-33" r="6" fill="none" stroke="#c9a04e" stroke-width="2"/>';
    for (var k = 0; k < 3; k++) g += '<circle cx="' + (-20 + k * 20) + '" cy="-8" r="3" fill="' + (k === 0 && Math.sin(t * 8) > 0 ? RED : "#c9ced4") + '" stroke="' + INK + '" stroke-width=".8"/>';
    g += '<circle cx="-20" cy="22" r="12" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/><circle cx="-20" cy="22" r="5" fill="#f4f5f6"/><path d="M4 16 h32 M4 24 h26 M4 32 h30" stroke="#9a958c" stroke-width="2"/><rect x="-30" y="44" width="60" height="6" rx="2" fill="#3a3f46"/>';
    return g + '</g>'; }
  function faradayLab(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="250" width="1440" height="300" fill="#8a6a48"/><rect x="80" y="230" width="480" height="20" fill="#6a4a30" stroke="' + INK + '" stroke-width="3"/>'; for (var b = 0; b < 4; b++) s += '<rect x="' + (440 + b * 26) + '" y="' + (150 + (b % 2) * 6) + '" width="22" height="' + (80 - (b % 2) * 6) + '" fill="#7a5230" stroke="' + INK + '" stroke-width="2"/>'; return s; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — every time you press the light switch, the power might be coming from the Nile at Aswan
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(200, 320, k), lerp(160, 170, k), lerp(1.35, 1.0, k)]; }, function (u, d, t) {
    var pr = ease(clamp((u - 0.5) / 0.5)), on = u > 1.0 ? clamp((u - 1.0) / 0.3) : 0, s = room(t, { on: on, press: pr, hand: true });
    if (u > 1.6) { var wp = [[137, 140], [137, 100], [400, 100], [420, 120]]; s += '<path d="' + poly(wp) + '" stroke="' + YEL + '" stroke-width="3" fill="none" stroke-dasharray="6 5" opacity=".9"/>' + dots(wp, t, 5, YEL, 140, 3.4); }
    return s + tag("من أسوان؟", 500, 230, u, 2.4, 3, 18);
  });
  // 1 — how does water turn into electricity? (a water drop becomes a lightning bolt)
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.3) / 0.9)), s = graphPaper(t) + '<g transform="translate(' + f(lerp(320, 220, k)) + ' 180) scale(' + f(1.6 + 0.08 * Math.sin(t * 4)) + ')"><path d="M0 -40 C18 -14 30 4 30 18 A30 30 0 0 1 -30 18 C-30 4 -18 -14 0 -40 Z" fill="url(#gWater)" stroke="' + INK + '" stroke-width="2.4"/></g>';
    s += arrow(270, 180, 370, 180, YEL, 7, clamp((u - 0.6) / 0.5)) + (u > 1.0 ? bolt(440, 180, 2.6 + 0.2 * Math.sin(t * 8)) : "");
    return s + qmark(330, 110, t, 46);
  });
  // 2 — and how does it travel hundreds of kilometres to the socket in your home? (map: Aswan → your house)
  shot(2, function (u, d) { var k = 1 - Math.pow(1 - clamp(u / d), 1.6); return [330, lerp(260, 170, k), lerp(1.4, 0.95, k)]; }, function (u, d, t) {
    var s = egyptMap(t, { line: clamp(u / (d - 0.6)) });
    s += '<g transform="translate(372 96) scale(.5)"><path d="M-30 0 V-30 L0 -52 L30 -30 V0 Z" fill="#fbf6e6" stroke="' + INK + '" stroke-width="3"/><rect x="-10" y="-24" width="20" height="16" fill="' + (u > d - 1.2 ? (Math.sin(t * 10) > 0 ? YEL : "#fffbe6") : "#5d93ad") + '" stroke="' + INK + '" stroke-width="2"/></g>';
    return s + tag("مئات الكيلومترات!", 470, 220, u, 1.0, 3, 17);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + genSection(220, 160, 64, t, 1.6, { glow: true }) + bolt(400, 150, 2.4) + worker(500, 150, t, "happy", { s: 0.5, look: -1 }) + tag("إيه الحكاية؟", 320, 290, u, 0.1, -3, 26);
  });
  // 4 — the High Dam: about four kilometres long and 111 metres high (rock-fill embankment in section, with dimension marks)
  shot(4, function (u, d) { return [lerp(300, 340, u / d), 190, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = damSection(t, { house: false }), h = clamp((u - 0.4) / 0.8), m = Math.round(111 * h), km = (3.8 * clamp((u - 1.8) / 1.0)).toFixed(1);
    s += '<path d="M310 96 V300" stroke="' + YEL + '" stroke-width="5" stroke-dasharray="' + f(204 * h) + ' 300"/><path d="M300 96 h20 M300 300 h20" stroke="' + YEL + '" stroke-width="4" opacity="' + f(h) + '"/><text x="326" y="200" style="font:800 18px Noto Sans Arabic;fill:' + INK + '">' + m + ' م</text>';
    if (u > 1.8) s += '<g transform="translate(470 80)"><rect x="-80" y="-20" width="160" height="36" rx="9" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + YEL + '">طوله ' + km + ' كم</text></g>';
    s += worker(310, 62, t, "happy", { s: 0.16 });
    s += '<g transform="translate(560 96) scale(.5)" opacity=".9"><path d="M-30 0 L-22 -150 L-14 0 Z M-12 0 L-2 -170 L8 0 Z M10 0 L20 -150 L28 0 Z" fill="#d9ccb0" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -110 h16" stroke="' + INK + '" stroke-width="4"/></g>';   // the Lotus monument
    return s + tag("صخر وتراب!", 470, 260, u, 2.6, 3, 16);
  });
  // 5 — behind it Lake Nasser, a man-made lake more than 500 km long (seen from space, after the ISS photos)
  shot(5, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 300, k), lerp(200, 170, k), lerp(1.5, 0.9, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9a87a"/>';
    for (var i = 0; i < 40; i++) s += '<path d="M' + f(-200 + hash(i) * 1000) + ' ' + f(-100 + hash(i + 5) * 500) + ' q20 -10 40 0" stroke="#b08f62" stroke-width="3" fill="none" opacity=".6"/>';
    var lake = "M120 40 C150 70 170 60 190 90 C200 110 230 100 240 130 C250 160 280 150 290 180 C300 210 330 200 340 230 C348 250 352 262 350 275 C330 272 320 250 300 245 C280 240 270 215 250 210 C230 205 225 180 205 172 C185 165 180 140 160 130 C140 120 130 90 110 70 Z";
    s += '<path d="' + lake + '" fill="url(#gLake)" stroke="#16405e" stroke-width="2"/>';
    for (var b = 0; b < 12; b++) { var bx = 130 + b * 18, by = 70 + b * 17; s += '<path d="M' + f(bx) + ' ' + f(by) + ' q' + f(8 + hash(b) * 8) + ' -4 ' + f(12 + hash(b) * 12) + ' ' + f(-8 - hash(b + 1) * 8) + ' M' + f(bx + 12) + ' ' + f(by + 14) + ' q-6 4 ' + f(-10 - hash(b + 2) * 10) + ' ' + f(6 + hash(b + 3) * 8) + '" stroke="#1f4a6a" stroke-width="2" stroke-linecap="round" fill="none"/>'; }
    s += '<path d="M350 275 L352 300 L344 330 L356 370 L348 420" stroke="#2f7fa8" stroke-width="4" fill="none"/><rect x="342" y="272" width="16" height="6" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var sp = 0; sp < 30; sp++) s += '<rect x="' + f(420 + (sp % 6) * 10) + '" y="' + f(300 + Math.floor(sp / 6) * 9) + '" width="6" height="5" fill="#2b3a5a"/>';
    for (var cl = 0; cl < 7; cl++) { var cx2 = ((hash(cl) * 900 + t * 110) % 900) - 150, cy2 = -40 + hash(cl + 3) * 420; s += '<ellipse cx="' + f(cx2) + '" cy="' + f(cy2) + '" rx="' + f(50 + hash(cl) * 40) + '" ry="' + f(18 + hash(cl + 1) * 12) + '" fill="#fff" opacity=".55" filter="url(#soft)"/>'; }
    for (var gl = 0; gl < 26; gl++) { var gk = hash(gl + Math.floor(t * 12) * 31), gu2 = hash(gl * 5 + 2); s += '<circle cx="' + f(lerp(130, 340, gu2)) + '" cy="' + f(lerp(60, 260, gu2) + (gk - 0.5) * 20) + '" r="' + f(1.5 + gk * 2.5) + '" fill="#e9f6fb" opacity="' + f(gk) + '"/>'; }   // sun glints flickering on the water
    var km = Math.round(lerp(0, 500, clamp((u - 0.8) / 1.6))); s += '<g transform="translate(160 260)"><rect x="-86" y="-20" width="172" height="36" rx="9" fill="' + INK + '" stroke="' + CY + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + CY + '">أكتر من ' + km + ' كم</text></g>';
    return s + tag("بحيرة ناصر", 250, 80, u, 0.4, -3, 18) + tag("السد", 400, 270, u, 1.4, 3, 14, "#ffb08a");
  });
  // 6 — the lake is about 70 m above the river in front of the dam: that's the secret
  shot(6, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = damSection(t), k = clamp((u - 0.4) / 0.8), m = Math.round(70 * k);
    s += '<path d="M-100 ' + LK + ' H600" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/><path d="M200 ' + RV + ' H700" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/>';
    s += '<path d="M530 ' + LK + ' V' + f(lerp(LK, RV, k)) + '" stroke="' + YEL + '" stroke-width="6"/><text x="544" y="' + f((LK + RV) / 2 + 6) + '" style="font:800 20px Noto Sans Arabic;fill:' + INK + '">' + m + ' م</text>';
    return s + tag("سر الحكاية!", 150, 40, u, 1.8, -3, 19);
  });
  // 7 — the water goes down huge tunnels and gets faster as it drops (speed meter climbing)
  shot(7, function (u, d) { return [lerp(240, 320, u / d), 220, lerp(1.25, 1.1, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.6)), s = damSection(t, { tunnel: k });
    s += gauge(160, 140, 28, 0.1 + 0.8 * k, "") + '<text x="160" y="184" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:' + INK + '">السرعة</text>';
    return s + tag("أنفاق ضخمة", 150, 230, u, 0.4, -3, 17);
  });
  // 8 — at the tunnel's end it hits the turbine, a giant steel wheel with blades, and spins it (Francis runner from above)
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var sp = lerp(0.5, 3.5, clamp(u / (d * 0.7))), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a48"/>' + francis(300, 180, 70, u * sp, 1);
    s += arrow(580, 150, 470, 150, CY, 7, clamp(u / 0.6));
    return s + tag("توربينة", 300, 40, u, 0.6, -3, 20) + tag("ريش", 470, 300, u, 1.8, 3, 16);
  });
  // 9 — the turbine is joined to a long shaft, and on top of it the generator (vertical unit cut open)
  shot(9, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(260, 150, k), lerp(1.15, 0.95, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9d4c8"/><rect x="-400" y="210" width="1440" height="400" fill="url(#gConcreteV)"/>', ph = t * 3;
    s += '<path d="M180 290 C180 250 460 250 460 290 L460 320 L180 320 Z" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var b = 0; b < 8; b++) { var bx = 320 + 110 * Math.sin(ph + b * 0.785), vis = Math.cos(ph + b * 0.785) > 0; if (vis) s += '<path d="M' + f(bx) + ' 266 q' + f(10 * Math.cos(ph + b)) + ' 14 0 40" stroke="' + INK + '" stroke-width="5" fill="none"/>'; }
    s += '<rect x="308" y="60" width="24" height="210" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/>';
    for (var m = 0; m < 6; m++) { var my = 80 + ((t * 120 + m * 34) % 190); s += '<path d="M310 ' + f(my) + ' h20" stroke="#fff" stroke-width="2" opacity=".6"/>'; }
    s += '<path d="M200 80 H440 V150 H200 Z" fill="url(#gCase)" stroke="' + INK + '" stroke-width="3"/><path d="M200 80 C200 50 440 50 440 80" fill="#8a929c" stroke="' + INK + '" stroke-width="3"/>';
    for (var c = 0; c < 9; c++) s += '<rect x="' + (210 + c * 25) + '" y="96" width="16" height="40" fill="url(#gCopper)" stroke="' + INK + '" stroke-width="1"/>';
    s += curl(320, 290, 160, -0.5, 2.4, CY, 5, clamp(u / 0.8)) + curl(320, 70, 150, -0.5, 2.4, YEL, 5, clamp((u - 0.8) / 0.8));
    return s + tag("المولّد", 520, 60, u, 1.0, 3, 19) + tag("عمود", 420, 200, u, 0.5, -3, 15) + tag("التوربينة", 520, 300, u, 0.2, 3, 16);
  });
  // 10 — inside the generator, big magnets turn inside coils of copper (cross-section, poles N/S going round)
  shot(10, function (u, d) { return [320, 180, lerp(0.95, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1e2a36"/>' + genSection(320, 180, 120, t, 1.2, { glow: u > 1.2 });
    return s + tag("مغناطيسات", 130, 70, u, 0.5, -3, 18) + tag("لفايف نحاس", 510, 300, u, 1.4, 3, 17, "#ffcf9a");
  });
  // 11 — each time a magnet passes the wire it pushes its electrons along: a current flows (and lights a bulb)
  shot(11, function (u, d) { return [320, 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', mx = 320 + 140 * Math.sin(t * 2.4), sp = Math.abs(Math.cos(t * 2.4));
    var wire = [[100, 200], [540, 200], [540, 80], [100, 80], [100, 200]]; s += '<path d="' + poly(wire) + '" stroke="url(#gCopper)" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="' + poly(wire) + '" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".4"/>';
    s += dots(wire, t, 18, CY, 40 + 200 * sp, 4.4);
    s += '<g transform="translate(' + f(mx) + ' 250)"><rect x="-50" y="-18" width="50" height="36" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="0" y="-18" width="50" height="36" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/><text x="-25" y="7" text-anchor="middle" style="font:800 18px Noto Serif;fill:#fff">N</text><text x="25" y="7" text-anchor="middle" style="font:800 18px Noto Serif;fill:#fff">S</text></g>';
    s += '<circle cx="320" cy="80" r="' + f(40 + 30 * sp) + '" fill="url(#gBulb)" opacity="' + f(0.3 + 0.7 * sp) + '"/><circle cx="320" cy="80" r="16" fill="' + (sp > 0.3 ? "#fffbe6" : "#c9ced4") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (sp > 0.85) s += bolt(200, 150, 0.9) + bolt(450, 150, 0.9);
    return s + tag("الإلكترونات بتتزق", 320, 320, u, 0.8, -3, 17);
  });
  // 12 — Michael Faraday found this about 200 years ago (1831) with just a magnet and a wire (sepia lab, needle kicks)
  shot(12, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = faradayLab(t), push = Math.sin(t * 3.2), sp = Math.abs(Math.cos(t * 3.2));
    s += '<g transform="translate(180 150)"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="#3a3530" stroke="' + INK + '" stroke-width="3"/><path d="M-14 30 L0 60 L14 30" fill="#fbf6e6" stroke="' + INK + '" stroke-width="2"/>' + head(0, -20, 38, sp > 0.7 ? "shock" : "curious", t, 1) + '<path d="M-36 -10 C-44 10 -40 30 -30 34 M36 -10 C44 10 40 30 30 34" stroke="#7a5a3a" stroke-width="7" fill="none"/><path d="M-34 -40 C-30 -66 30 -66 34 -40" stroke="#7a5a3a" stroke-width="8" fill="none"/></g>';
    for (var c = 0; c < 10; c++) s += '<ellipse cx="' + (300 + c * 10) + '" cy="200" rx="6" ry="26" fill="none" stroke="url(#gCopper)" stroke-width="4"/>';
    s += '<rect x="' + f(230 + push * 50) + '" y="190" width="60" height="20" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><path d="M400 200 C430 200 430 150 460 150" stroke="url(#gCopper)" stroke-width="4" fill="none"/>';
    s += '<g transform="translate(490 150)"><circle r="34" fill="#fbf6e6" stroke="' + INK + '" stroke-width="3"/><path d="M0 10 L' + f(Math.sin(push * 0.9 * (sp)) * 26 * (Math.cos(t * 3.2) > 0 ? 1 : -1)) + ' -18" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle cy="10" r="4" fill="' + INK + '"/></g>';
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".18"/>';
    var y = Math.round(lerp(2026, 1831, clamp(u / 1.4))); s += '<g transform="translate(330 40)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("فاراداي", 130, 110, u, 0.6, -3, 19) + tag("مغناطيس وسلك بس!", 480, 290, u, 2.0, 3, 16);
  });
  // 13 — the High Dam has twelve turbines, 175 MW each: the power station from outside, after the photos (long white hall with
  // vertical fins, the switchyard gantries on the terrace above, turquoise water churning out of the twelve outlets)
  shot(13, function (u, d) { return [lerp(220, 420, ease(clamp(u / d))), 170, 1.05]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="20" width="1440" height="110" fill="url(#gSand)"/><rect x="-400" y="70" width="1440" height="70" fill="#d6d0c2" stroke="' + INK + '" stroke-width="2"/>';
    for (var g = 0; g < 10; g++) { var gx = -80 + g * 90; s += '<path d="M' + gx + ' 70 V24 M' + (gx + 40) + ' 70 V24 M' + (gx - 6) + ' 30 H' + (gx + 46) + '" stroke="#7a828c" stroke-width="3"/>'; }
    s += '<rect x="-400" y="130" width="1440" height="80" fill="#f1efe8" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var fn = -400; fn < 1040; fn += 9) s += '<path d="M' + fn + ' 134 V206" stroke="#c9c6bc" stroke-width="3"/>';
    s += '<rect x="-400" y="210" width="1440" height="16" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/><rect x="-400" y="226" width="1440" height="200" fill="#2fb3a8"/>';
    var n = Math.min(12, Math.floor(u * 4) + 1);
    for (var i = 0; i < 12; i++) { var ox = -40 + i * 62, lit = i < n; s += '<rect x="' + (ox - 16) + '" y="226" width="32" height="14" fill="#1f6a64"/>';
      if (lit) { for (var w = 0; w < 6; w++) { var wu = (t * 1.4 + w / 6 + i * 0.13) % 1; s += '<ellipse cx="' + f(ox + Math.sin(w * 2 + t) * 10) + '" cy="' + f(240 + wu * 60) + '" rx="' + f(10 + wu * 20) + '" ry="' + f(4 + wu * 6) + '" fill="#e9fbf8" opacity="' + f(0.8 * (1 - wu)) + '"/>'; }
        s += '<text x="' + ox + '" y="200" text-anchor="middle" style="font:800 13px Noto Serif;fill:' + INK + ';direction:ltr">' + (i + 1) + '</text>'; } }
    return s + '<g transform="translate(' + f(lerp(220, 420, ease(clamp(u / d)))) + ' 300)"><rect x="-110" y="-22" width="220" height="42" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:' + YEL + '">' + n + ' × 175 ميجاوات</text></g>';
  });
  // 14 — together 2,100 MW; in 1970 they covered half of Egypt's electricity (map half filled)
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), mw = Math.round(2100 * clamp(u / 1.2)), half = clamp((u - 1.6) / 1.2);
    s += '<g transform="translate(160 170)"><rect x="-120" y="-30" width="240" height="56" rx="12" fill="' + INK + '" stroke="' + YEL + '" stroke-width="4"/><text y="10" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:' + YEL + '">' + mw + ' ميجاوات</text></g>';
    s += '<g transform="translate(460 170)"><path d="M-80 -90 H60 L80 -60 V90 H-80 Z" fill="#fbf6e6" stroke="' + INK + '" stroke-width="3"/><clipPath id="egc"><path d="M-80 -90 H60 L80 -60 V90 H-80 Z"/></clipPath><rect x="-80" y="' + f(90 - 180 * 0.5 * half) + '" width="160" height="' + f(180 * 0.5 * half) + '" fill="' + YEL + '" clip-path="url(#egc)"/><path d="M-80 0 H80" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>' + bolt(0, 40, 1.4) + '</g>';
    return s + tag("سنة 1970", 460, 30, u, 1.2, 3, 17) + tag("نص كهربا مصر!", 460, 320, u, 2.4, -3, 18);
  });
  // 15 — but it must travel about 900 km to Cairo, and the wire loses some on the way (a long wire warming up, dots fading)
  shot(15, function (u, d) { return [lerp(240, 400, u / d), 180, 1.0]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 30, 6, 0.75) + desertGround(t, 230);
    for (var x = -200; x < 900; x += 6) { var fade = clamp((x + 200) / 1000); s += '<rect x="' + x + '" y="150" width="6" height="8" fill="' + (fade > 0.5 ? "#e0702a" : CU) + '" opacity="' + f(0.6 + 0.4 * fade) + '"/>'; }
    for (var k = 0; k < 24; k++) { var ku = (t * 0.25 + k / 24) % 1, x2 = lerp(-200, 900, ku); s += '<circle cx="' + f(x2) + '" cy="154" r="5" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - ku * 0.8) + '"/>'; if (k % 3 === 0) s += '<path d="M' + f(x2) + ' 144 q-4 -10 2 -18" stroke="#e0702a" stroke-width="2" fill="none" opacity="' + f(ku * 0.8) + '"/>'; }
    var km = Math.round(900 * clamp(u / (d - 0.4))); s += '<g transform="translate(' + f(lerp(240, 400, u / d)) + ' 280)"><rect x="-70" y="-20" width="140" height="38" rx="9" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:' + YEL + '">' + km + ' كم</text></g>';
    return s + tag("بيضيّع في السكة", lerp(240, 400, u / d) + 120, 80, u, 1.6, 3, 16, "#ffb08a");
  });
  // 16 — so they raise the voltage in huge transformers to 500,000 volts (the switchyard at the dam's foot, as in the photo)
  shot(16, function (u, d) { return [lerp(300, 340, u / d), 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + '<path d="M-400 140 L-100 120 L200 150 L600 110 L1040 140 V600 H-400 Z" fill="url(#gFill)"/>' + desertGround(t, 230);
    for (var g = 0; g < 4; g++) s += '<path d="M' + (90 + g * 140) + ' 230 V90 M' + (150 + g * 140) + ' 230 V90 M' + (80 + g * 140) + ' 96 H' + (160 + g * 140) + '" stroke="#7a828c" stroke-width="4"/>';
    s += trafo(200, 220, 0.9, t, { label: "" }) + trafo(440, 220, 0.9, t, { label: "" });
    var kv = Math.round(lerp(15, 500000, Math.pow(clamp((u - 0.6) / 1.8), 2))); s += '<g transform="translate(320 300)"><rect x="-120" y="-24" width="240" height="44" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + YEL + '">' + kv.toLocaleString("en") + ' فولت</text></g>';
    if (u > 2.4) s += bolt(320, 60, 1.6 + 0.2 * Math.sin(t * 9));
    return s + tag("محولات ضخمة", 130, 40, u, 0.4, -3, 17);
  });
  // 17 — high voltage means less current, so the wire heats less and less power is lost (low V crowd vs high V few fast)
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), A = [[60, 120], [580, 120]], B = [[60, 250], [580, 250]];
    s += '<path d="M60 120 H580" stroke="#e0702a" stroke-width="16" stroke-linecap="round" opacity="' + f(0.7 + 0.3 * Math.sin(t * 6)) + '"/><path d="M60 120 H580" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    for (var k = 0; k < 6; k++) { var hu = (t * 0.8 + k / 6) % 1; s += '<path d="M' + (100 + k * 80) + ' ' + f(104 - hu * 30) + ' q-6 -8 0 -16" stroke="#e0702a" stroke-width="3" fill="none" opacity="' + f(1 - hu) + '"/>'; }
    s += dots(A, t, 30, YEL, 40, 4) + '<path d="M60 250 H580" stroke="' + CU + '" stroke-width="10" stroke-linecap="round"/>' + dots(B, t, 6, YEL, 260, 5);
    s += '<text x="600" y="126" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">جهد واطي</text><text x="600" y="256" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">جهد عالي</text>';
    return s + tag("تيار كتير = سخونية", 320, 60, u, 0.4, -3, 16, "#ffb08a") + tag("تيار قليل = ضياع أقل", 320, 320, u, 1.6, 3, 16);
  });
  // 18 — it travels on giant steel towers, in one grid linked across all of Egypt (towers marching + grid map inset)
  shot(18, function (u, d) { return [lerp(280, 360, u / d), 170, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + sun(520, 60, 26, "#ffd27a") + clouds(t, 20, 0, 5, 0.6) + desertGround(t, 250), off = -((t * 40) % 220);
    var tw = []; for (var i = -2; i < 6; i++) tw.push(off + i * 220);
    tw.forEach(function (x, i) { var sc = 0.9; s += tower(x, 250, sc); if (i > 0) { var a = towerPts(tw[i - 1], 250, sc), b = towerPts(x, 250, sc); for (var c = 0; c < 6; c++) s += '<path d="' + sag(a[c], b[c], 26) + '" stroke="#3a3f46" stroke-width="1.6" fill="none"/>'; } });
    for (var bi = 0; bi < 3; bi++) s += birds(t, 40 + bi * 20, 30);
    var p = pop((u - 1.6) / 0.8); if (p > 0) s += '<clipPath id="mapclip"><rect x="180" y="30" width="290" height="300" rx="16"/></clipPath><g transform="translate(540 220) scale(' + f(p * 0.45) + ') translate(-325 -180)"><g clip-path="url(#mapclip)">' + egyptMap(t, { grid: clamp((u - 1.6) / 1.4), line: 1 }) + '</g><rect x="180" y="30" width="290" height="300" rx="16" fill="none" stroke="' + INK + '" stroke-width="6"/></g>';
    return s + tag("أبراج عملاقة", 140, 40, u, 0.4, -3, 17) + (u > 2.2 ? tag("شبكة واحدة", 540, 340, u, 2.2, 3, 15) : "");
  });
  // 19 — near the cities, substations bring the voltage down step by step (stairs: 500,000 → 220,000 → 66,000 → 22,000 → 11,000)
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e4d8"/>', vals = ["500,000", "220,000", "66,000", "22,000", "11,000"], st = Math.min(4, Math.floor(u / (d / 5.2)));
    for (var i = 0; i < 5; i++) { var x = 60 + i * 120, y = 80 + i * 50, on = i <= st; s += '<rect x="' + x + '" y="' + y + '" width="110" height="' + (330 - y) + '" fill="' + (on ? "#fbf6e6" : "#d9d4c8") + '" stroke="' + INK + '" stroke-width="2.4"/><text x="' + (x + 55) + '" y="' + (y + 26) + '" text-anchor="middle" style="font:800 15px Noto Serif;fill:' + (on ? INK : "#9a958c") + ';direction:ltr">' + vals[i] + '</text><text x="' + (x + 55) + '" y="' + (y + 46) + '" text-anchor="middle" style="font:700 12px Noto Sans Arabic;fill:' + (on ? INK : "#9a958c") + '">فولت</text>';
      if (on) s += trafo(x + 55, y + 120, 0.4, t, {}); }
    var bx = 60 + st * 120 + 55, by = 80 + st * 50 - 20 + Math.abs(Math.sin(t * 6)) * -8; s += bolt(bx, by, 1.2);
    return s + tag("خطوة خطوة", 480, 40, u, 0.6, 3, 18);
  });
  // 20 — down to the transformer on the street corner, which brings it to 220 volts (night street, green kiosk, houses)
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("night") + stars(t) + city(t, 250, 110, "#2b3a5a", "#ffe7a8", 11, true) + '<rect x="-400" y="250" width="1440" height="400" fill="#4a4844"/><rect x="-400" y="250" width="1440" height="20" fill="#8a857a"/>' + cars(t, 310, 80);
    s += '<path d="M520 270 V120 M500 130 H540" stroke="#5a6068" stroke-width="5"/><circle cx="508" cy="130" r="30" fill="url(#gBulb)" opacity=".6"/>';
    s += kiosk(300, 270, 1.0, t);
    var wp = [[320, 210], [320, 180], [600, 180]]; s += '<path d="' + poly(wp) + '" stroke="' + YEL + '" stroke-width="2" fill="none" opacity=".6"/>' + dots(wp, t, 6, YEL, 80, 3);
    var v = Math.round(lerp(11000, 220, clamp((u - 0.6) / 1.6))); s += '<g transform="translate(160 120)"><rect x="-80" y="-22" width="160" height="40" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:800 19px Noto Sans Arabic;fill:' + YEL + '">' + v.toLocaleString("en") + ' فولت</text></g>';
    return s + tag("محول الشارع", 300, 330, u, 0.4, -3, 16);
  });
  // 21 — into the house through the meter, to the socket, to the lamp above your head (path lights up in order)
  shot(21, function (u, d) { return [lerp(220, 320, ease(clamp(u / d))), 170, lerp(1.2, 1.0, ease(clamp(u / d)))]; }, function (u, d, t) {
    var on = clamp((u - 2.4) / 0.4), s = room(t, { on: 0.35 + 0.65 * on });
    s += meter(40, 180, 0.8, t, { kwh: (1234.5 + u * 0.4).toFixed(1) });
    var wp = [[40, 120], [40, 90], [180, 90], [180, 230], [210, 230]], wp2 = [[180, 90], [260, 90], [260, 20]];
    s += '<path d="' + poly(wp) + '" stroke="#5a5752" stroke-width="3" fill="none"/><path d="' + poly(wp2) + '" stroke="#5a5752" stroke-width="3" fill="none"/>' + dots(wp, t, 6, YEL, 90, 3) + (u > 1.4 ? dots(wp2, t, 4, YEL, 90, 3) : "");
    s += '<rect x="206" y="216" width="30" height="30" rx="4" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><circle cx="216" cy="231" r="3" fill="' + INK + '"/><circle cx="226" cy="231" r="3" fill="' + INK + '"/>';
    return s + tag("العداد", 40, 280, u, 0.3, -3, 15) + tag("البريزة", 222, 290, u, 1.0, 3, 15) + tag("اللمبة", 340, 40, u, 2.2, -3, 15);
  });
  // 22 — electricity isn't stored in the wire: what Aswan makes is used at the same instant (turbine and lamp pulse together)
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), pulse = 0.5 + 0.5 * Math.sin(t * 5);
    s += francis(130, 180, 50, t * 2, 1) + '<circle cx="520" cy="160" r="' + f(50 + 30 * pulse) + '" fill="url(#gBulb)" opacity="' + f(0.5 + 0.5 * pulse) + '"/><circle cx="520" cy="160" r="20" fill="#fffbe6" stroke="' + INK + '" stroke-width="2.4"/><rect x="510" y="180" width="20" height="16" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>';
    var wp = [[230, 180], [470, 170]]; s += '<path d="' + poly(wp) + '" stroke="' + CU + '" stroke-width="6"/>' + dots(wp, t, 8, YEL, 300, 4);
    s += '<g transform="translate(350 290)"><circle r="28" fill="#fbf6e6" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 L0 -20 M0 0 L' + f(Math.sin(t * 12) * 16) + ' ' + f(-Math.cos(t * 12) * 16) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>';
    return s + tag("أسوان", 130, 280, u, 0.3, -3, 16) + tag("بيتك", 520, 270, u, 0.6, 3, 16) + tag("في نفس اللحظة!", 350, 50, u, 1.6, -3, 19);
  });
  // 23 — so when you press the switch, somewhere a turbine is turning for you (back to the room, turbine inset)
  shot(23, function (u, d) { return [lerp(320, 260, u / d), 170, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = room(t, { on: 1, press: 1, hand: u < 1.2 });
    var p = pop((u - 0.6) / 0.8); if (p > 0) s += '<g transform="translate(470 230) scale(' + f(p) + ')"><circle r="74" fill="#2b3a48" stroke="' + YEL + '" stroke-width="4"/>' + '<g transform="scale(.42)">' + francis(0, 0, 70, t * 2.4, 1).replace('<g transform="translate(0.0 0.0)">', '<g>') + '</g></g>';
    return s + tag("علشانك!", 470, 330, u, 1.4, 3, 20);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + genSection(220, 160, 60, t, 1.4, { glow: true }) + bolt(360, 150, 2) + worker(500, 150, t, "happy", { s: 0.5, look: -1 });
    return s + qmark(130, 70, t, 52) + qmark(90, 120, t + 1, 34) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { room: room, damSection: damSection, francis: francis, genSection: genSection, trafo: trafo, tower: tower, towerPts: towerPts, sag: sag, egyptMap: egyptMap, kiosk: kiosk, meter: meter, bolt: bolt, dots: dots, worker: worker, tag: tag, desertGround: desertGround };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
