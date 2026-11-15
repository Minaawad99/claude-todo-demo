  // ── «تعمل محطة تحلية إزاي؟» — the «لو» build: one coast in cross-section, a seawater reverse-osmosis plant that grows
  // part by part (shapes after real plants: see ../refs/SOURCES.md). World: sea on the left (surface y=170, the bed
  // sloping down to the left), the shore at x=250, the plant on the ground (y=150) to the right, the city far right.
  var INK = "#1c1c1c", SEAW = "#2b86b5", FRESH = "#7fd0ff", BRINE = "#d9962b", CLIPN = 0, OILN = 0;
  var SY = 170, GY = 150;
  function bedY(x) { return 170 + Math.max(0, Math.min(150, (250 - x) * 0.36)); }
  function K(v) { return v === true ? 1 : (v || 0); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 7) + ';paint-order:stroke">' + text + '</text>'; }
  function Tp(text, x, y, sz, col, u, u0) { var k = pop((u - u0) / 1.1); return k <= 0 ? "" : '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')">' + T(text, 0, 0, sz, col) + '</g>'; }
  function app(k, cx, cy, inner) { k = pop(K(k)); return k <= 0 ? "" : '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + k.toFixed(3) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + inner + '</g>'; }
  // a pipe: ink outline, the colour of what runs in it, light dashes that travel along the path while it flows
  function pipe(d, col, w, t, sp) {
    var s = '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round"/>';
    if (sp) s += '<path d="' + d + '" stroke="#fff" stroke-width="' + f(w * 0.36) + '" fill="none" opacity=".75" stroke-dasharray="5 9" stroke-dashoffset="' + f(-t * sp * 34) + '"/>';
    return s;
  }
  function xmark(x, y, sz, u, u0) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; var d = "M" + (-sz) + " " + (-sz) + " L" + sz + " " + sz + " M" + sz + " " + (-sz) + " L" + (-sz) + " " + sz; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(sz * 0.62) + '" stroke-linecap="round"/><path d="' + d + '" stroke="#e23b2e" stroke-width="' + f(sz * 0.38) + '" stroke-linecap="round"/></g>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">؟</text>'; }
  function bolt(x, y, s, col) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')" d="M4 -16 L-8 2 H-1 L-5 16 L9 -3 H1 Z" fill="' + (col || "#f2c230") + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>'; }

  // the engineer with a hard hat (the channel's character)
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6 + x) * 2) + ') rotate(' + f(Math.sin(t * 1.7 + x) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="' + (o.col || "#e8742e") + '" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/><path d="M0 -88 V-54" stroke="#d9d3c4" stroke-width="6"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="' + (o.col || "#e8742e") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  function stand(x, s, t, mood, o) { return engineer(x, GY - 140 * s, t, mood, Object.assign({ s: s }, o || {})); }

  // ── the coast ───────────────────────────────────────────
  function fishOne(x, y, s, dir, col, mood, t) {
    var w = Math.sin(t * 10 + x * 0.05) * 3;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * dir) + ' ' + f(s) + ')"><path d="M-12 0 L-22 ' + f(-7 + w) + ' L-22 ' + f(7 + w) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/><ellipse rx="14" ry="7" fill="' + col + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="7" cy="-2" r="' + (mood === "shock" ? 3.4 : 2.2) + '" fill="#fff" stroke="' + INK + '" stroke-width=".8"/><circle cx="7.6" cy="-2" r="1" fill="' + INK + '"/>' + (mood === "shock" ? '<ellipse cx="12" cy="3" rx="1.4" ry="2" fill="' + INK + '"/>' : "") + '</g>';
  }
  function fishes(t, o) {
    o = o || {}; var s = "", cols = ["#f2a03a", "#e25a4a", "#f2d24a", "#8fd0a0", "#f28a8a"];
    for (var i = 0; i < 5; i++) {
      var dir = o.flee ? -1 : (i % 2 ? 1 : -1), sp = (o.flee ? 60 : 16) * (0.7 + hash(i) * 0.6), span = 560, x = ((hash(i + 3) * span + t * sp * dir) % span + span) % span - 340;
      var room = bedY(x) - SY - 34; if (room < 10) continue; var y = SY + 18 + hash(i + 11) * room + Math.sin(t * 1.6 + i) * 4;
      s += fishOne(x, y, 0.8 + hash(i + 5) * 0.4, dir, cols[i], o.mood, t);
    }
    return s;
  }
  function jelly(x, y, s, t) {
    var p = 1 + 0.12 * Math.sin(t * 3 + x), g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.5 + x) * 4) + ') scale(' + f(s) + ')">';
    for (var k = -2; k <= 2; k++) { var d = "M" + (k * 5) + " 0"; for (var j = 1; j <= 6; j++) d += " L" + f(k * 5 + Math.sin(t * 4 + j * 0.9 + k) * 3) + " " + (j * 5); g += '<path d="' + d + '" stroke="#f2b6d8" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }
    return g + '<path d="M' + f(-14 * p) + ' 0 C' + f(-14 * p) + ' -20 ' + f(14 * p) + ' -20 ' + f(14 * p) + ' 0 Z" fill="#f7d0ea" fill-opacity=".85" stroke="' + INK + '" stroke-width="1.4"/><circle cx="-4" cy="-8" r="2" fill="#fff" opacity=".7"/></g>';
  }
  function coral(x, s, pale) { var c = pale > 0.5 ? "#e9e2d4" : "#f07a8a", c2 = pale > 0.5 ? "#d9d2c4" : "#f2a03a", y = bedY(x); return '<g transform="translate(' + x + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 0 V-18 M0 -10 L-8 -20 M0 -8 L9 -18 M-8 -20 L-12 -28 M9 -18 L13 -27 M0 -18 L1 -28" stroke="' + INK + '" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M0 0 V-18 M0 -10 L-8 -20 M0 -8 L9 -18 M-8 -20 L-12 -28 M9 -18 L13 -27 M0 -18 L1 -28" stroke="' + c + '" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="16" cy="-4" r="6" fill="' + c2 + '" stroke="' + INK + '" stroke-width="1.4"/></g>'; }
  function coast(t, o) {
    o = o || {}; var s = '<rect x="-1200" y="-600" width="3400" height="770" fill="url(#sky-' + (o.sky || "day") + ')"/>';
    s += sun(o.sky === "dusk" ? 40 : 140, o.sky === "dusk" ? 110 : -70, 26, o.sky === "dusk" ? "#ffd9a0" : "#fff3c4");
    s += clouds(t, 12, -40, 4, 0.85) + '<g transform="translate(760 -30)">' + clouds(t, 9, -30, 3, 0.8) + '</g>' + birds(t, 20, 30);
    // the city far to the right
    for (var b = 0; b < 16; b++) { var bx = 1010 + b * 34, bh = 40 + hash(b + 2) * 80; s += '<rect x="' + bx + '" y="' + f(GY - bh) + '" width="30" height="' + f(bh) + '" fill="' + (o.sky === "dusk" ? "#8a7a8a" : "#9fb3c6") + '"/>'; for (var wy = GY - bh + 8; wy < GY - 8; wy += 14) for (var wx = bx + 5; wx < bx + 24; wx += 10) if (hash(wx * 3 + wy + Math.floor(t * 0.8 + hash(wx + wy) * 4)) > 0.45) s += '<rect x="' + wx + '" y="' + f(wy) + '" width="5" height="7" fill="' + (o.sky === "dusk" ? "#ffe08a" : "#e9f2f8") + '" opacity=".8"/>'; }
    // the sea
    s += '<rect x="-1200" y="' + SY + '" width="1462" height="800" fill="url(#sea1)"/>';
    for (var r = 0; r < 5; r++) { var rx = -420 + r * 140 + Math.sin(t * 0.4 + r) * 26; s += '<path d="M' + f(rx) + ' ' + SY + ' h50 l70 160 h-90 Z" fill="#fff" opacity="' + f(0.06 + 0.03 * Math.sin(t * 1.3 + r)) + '"/>'; }
    var d = "M-1200 " + SY; for (var x = -1200; x <= 262; x += 22) d += " L" + x + " " + f(SY + Math.sin(x * 0.04 + t * 2.2) * 3 + Math.sin(x * 0.11 - t * 3) * 1.6);
    s += '<path d="' + d + ' V' + (SY + 14) + ' H-1200 Z" fill="#bfe6f7" opacity=".7"/>';
    for (var i = 0; i < 26; i++) { var px = -420 + hash(i) * 660 + Math.sin(t * 0.6 + i) * 8, py = SY + 10 + ((hash(i + 5) * 150 - t * (5 + hash(i) * 7)) % 150 + 150) % 150; if (py < bedY(px) - 4) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(0.9 + hash(i + 1) * 1.4) + '" fill="#fff" opacity=".4"/>'; }
    if (o.fish !== false) s += fishes(t, o);
    // the bed, then the land in section
    s += '<path d="M-1200 900 V320 H-166.7 L250 170 V900 Z" fill="#d9c08a" stroke="#9a8250" stroke-width="2"/>';
    for (var g = 0; g < 16; g++) { var gx = -400 + g * 41 + hash(g) * 20, gy = bedY(gx); s += '<path d="M' + f(gx) + ' ' + f(gy) + ' q' + f(Math.sin(t * 2 + g) * 5) + ' -9 ' + f(Math.sin(t * 2 + g) * 8) + ' -' + f(14 + hash(g + 2) * 10) + '" stroke="#3f9a5a" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
    s += coral(150, 0.8, o.pale || 0) + coral(190, 0.6, o.pale || 0) + coral(105, 0.7, o.pale || 0);
    s += '<path d="M250 170 L262 150 H2200 V900 H250 Z" fill="url(#gSoil)" stroke="#5a4630" stroke-width="2"/>';
    for (var e = 0; e < 40; e++) { var ex = 270 + hash(e + 20) * 1100, ey = 215 + hash(e + 31) * 260; s += '<ellipse cx="' + f(ex) + '" cy="' + f(ey) + '" rx="' + f(4 + hash(e) * 7) + '" ry="2.4" fill="#000" opacity=".12"/>'; }
    return s + '<rect x="272" y="' + (GY - 1) + '" width="730" height="6" fill="#c9c4b8" stroke="' + INK + '" stroke-width="1.2"/>';
  }

  // ── the plant, part by part ─────────────────────────────
  // P: {rack, pump, intake, filters, erd, outfall, lime, chlor, tank, dist, lab} each 0..1 (pop-in) or true;
  //    run (default true), cut (membranes seen inside the vessels), clog 0..1, gauge 0..1
  var VY = [50, 75, 100];
  function vessel(x, y, w, t, P) {
    var s = R(x, y, w, 18, "#f4f1e8", 2, 8);
    if (P.cut) { s += '<rect x="' + (x + 14) + '" y="' + (y + 3) + '" width="' + (w - 28) + '" height="12" rx="3" fill="#e2c48a" stroke="' + INK + '" stroke-width="1"/>'; for (var k = 0; k < 5; k++) s += '<path d="M' + (x + 14 + (w - 28) * (k + 1) / 6) + ' ' + (y + 3) + ' v12" stroke="' + INK + '" stroke-width="1"/>'; if (P.run !== false) for (var i = 0; i < 7; i++) { var p = (t * 0.5 + i / 7) % 1; s += '<circle cx="' + f(x + 14 + (w - 28) * p) + '" cy="' + f(y + 9 + Math.sin(p * 20 + i) * 3) + '" r="2" fill="' + (i % 2 ? FRESH : "#fff") + '" stroke="' + INK + '" stroke-width=".6"/>'; } }
    else s += '<path d="M' + (x + 12) + ' ' + (y + 5) + ' H' + (x + w - 12) + '" stroke="#fff" stroke-width="2.4" opacity=".9"/>';
    if (P.clog) s += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + f((w - 4) * clamp(P.clog)) + '" height="14" rx="6" fill="#6a4a2a" opacity=".85"/>';
    return s + R(x - 2, y - 1, 9, 20, "#2f6f9f", 1.6, 3) + R(x + w - 7, y - 1, 9, 20, "#2f6f9f", 1.6, 3);
  }
  function rack(t, P) { var s = '<path d="M522 46 V150 M590 46 V150 M658 46 V150 M518 46 H662" stroke="' + INK + '" stroke-width="5"/><path d="M522 46 V150 M590 46 V150 M658 46 V150 M518 46 H662" stroke="#e2b035" stroke-width="2.4"/>'; VY.forEach(function (y) { s += vessel(516, y, 148, t, P); }); return s; }
  function pump(t, P) {
    var run = P.run !== false, sh = run ? Math.sin(t * 40) * 0.5 : 0, s = '<g transform="translate(0 ' + f(sh) + ')">' + R(416, 144, 56, 6, "#5a6068", 1.6) + R(420, 113, 26, 31, "#3aa05a", 2, 4);
    for (var k = 0; k < 4; k++) s += '<path d="M' + (424 + k * 6) + ' 115 v27" stroke="#1f6a3a" stroke-width="2"/>';
    s += R(446, 124, 6, 9, "#9aa2ac", 1.4) + '<circle cx="458" cy="130" r="13" fill="#3f6f9f" stroke="' + INK + '" stroke-width="2"/><rect x="456" y="112" width="14" height="10" fill="#3f6f9f" stroke="' + INK + '" stroke-width="2"/>';
    var a = t * (run ? 14 : 0); for (var b = 0; b < 3; b++) s += '<path d="M458 130 L' + f(458 + Math.cos(a + b * 2.094) * 9) + ' ' + f(130 + Math.sin(a + b * 2.094) * 9) + '" stroke="#d9eef7" stroke-width="2.4" stroke-linecap="round"/>';
    return s + '</g><path d="M470 110 V104" stroke="' + INK + '" stroke-width="2"/>' + gauge(470, 94, 11, (P.gauge == null ? (run ? 0.8 : 0) : P.gauge) + (run ? Math.sin(t * 17) * 0.015 : 0));
  }
  function intakeHead(t) { var s = R(54, 218, 12, 22, "#9aa2ac", 2) + R(44, 202, 32, 18, "#dfe6ec", 2, 2); for (var k = 0; k < 6; k++) s += '<path d="M' + (48 + k * 4.8) + ' 203 v16" stroke="' + INK + '" stroke-width="1.3"/>'; s += R(40, 197, 40, 6, "#e2b035", 2, 2); for (var i = 0; i < 5; i++) { var p = (t * 0.7 + i / 5) % 1; s += '<circle cx="' + f(lerp(i % 2 ? 100 : 20, 60, p)) + '" cy="' + f(211 + (i - 2) * 3) + '" r="1.6" fill="#fff" opacity="' + f(0.8 * (1 - p)) + '"/>'; } return s; }
  function sandTank(x, t, P) {
    var s = R(x, 78, 40, 68, "#5d93ad", 2.2, 9) + '<rect x="' + (x + 5) + '" y="86" width="30" height="54" rx="4" fill="#bfe0f2" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<rect x="' + (x + 5) + '" y="102" width="30" height="11" fill="#3a3f46"/><rect x="' + (x + 5) + '" y="113" width="30" height="16" fill="#d9b36a"/><rect x="' + (x + 5) + '" y="129" width="30" height="11" fill="#9a958c"/>';
    for (var g = 0; g < 8; g++) s += '<circle cx="' + f(x + 8 + hash(g + x) * 24) + '" cy="' + f(131 + hash(g + 4) * 7) + '" r="1.8" fill="#6f6a62"/>';
    if (P.run !== false) for (var i = 0; i < 5; i++) { var p = (t * 0.45 + i / 5) % 1; s += '<circle cx="' + f(x + 9 + i * 5.5) + '" cy="' + f(88 + p * 50) + '" r="1.7" fill="' + (p < 0.3 ? "#7a5a36" : "#fff") + '" opacity=".9"/>'; }
    return s + R(x + 12, 72, 16, 7, "#3f6f8f", 1.6, 2);
  }
  function filters(t, P) { return sandTank(290, t, P) + sandTank(338, t, P) + R(389, 110, 16, 36, "#c9ced4", 2, 4) + R(392, 116, 10, 26, "#fbfbf7", 1, 2) + '<path d="M392 122 h10 M392 128 h10 M392 134 h10" stroke="#9aa2ac" stroke-width="1"/>' + R(387, 106, 20, 6, "#2f6f9f", 1.6, 2); }
  function erdUnit(t, P) {
    var s = R(545, 126, 50, 18, "#c9ced4", 2, 5) + '<clipPath id="er' + (++CLIPN) + '"><rect x="551" y="129" width="38" height="12" rx="3"/></clipPath><g clip-path="url(#er' + CLIPN + ')"><rect x="551" y="129" width="19" height="12" fill="' + SEAW + '"/><rect x="570" y="129" width="19" height="12" fill="' + BRINE + '"/>';
    for (var k = 0; k < 6; k++) { var yy = 129 + ((k * 4 + t * (P.run !== false ? 22 : 0)) % 16) - 2; s += '<path d="M551 ' + f(yy) + ' H589" stroke="' + INK + '" stroke-width="1.2" opacity=".7"/>'; }
    return s + '</g><rect x="551" y="129" width="38" height="12" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.4"/>' + R(541, 124, 7, 22, "#e2b035", 1.6, 2) + R(592, 124, 7, 22, "#e2b035", 1.6, 2);
  }
  var DIFX = [-120, -95, -70];
  function diffusers(t, P) {
    var s = ""; DIFX.forEach(function (x, n) { var y = bedY(x); s += pipe("M" + x + " " + f(y + 30) + " V" + f(y - 8), BRINE, 5, t, P.run !== false ? 1.5 : 0) + R(x - 5, y - 12, 10, 5, "#3a3f46", 1.4, 1);
      if (P.run !== false) for (var i = 0; i < 9; i++) { var p = (t * 0.55 + i / 9 + n * 0.13) % 1; s += '<circle cx="' + f(x + (hash(i + n * 9) - 0.5) * 60 * p) + '" cy="' + f(y - 12 - p * 78) + '" r="' + f(2.5 + p * 9) + '" fill="' + BRINE + '" opacity="' + f(0.6 * (1 - p)) + '"/>'; } });
    return s;
  }
  function limeTank(t, P) {
    var s = R(700, 76, 45, 70, "#8fb0a0", 2.2, 9) + '<rect x="706" y="86" width="33" height="54" rx="4" fill="#cfeaf7" stroke="' + INK + '" stroke-width="1.2"/>';
    for (var i = 0; i < 16; i++) s += '<circle cx="' + f(710 + (i % 4) * 8.4 + (Math.floor(i / 4) % 2) * 3) + '" cy="' + f(134 - Math.floor(i / 4) * 9) + '" r="4.6" fill="' + (i % 3 ? "#f4f1e8" : "#dcd6c6") + '" stroke="' + INK + '" stroke-width="1"/>';
    if (P.run !== false) for (var k = 0; k < 5; k++) { var p = (t * 0.5 + k / 5) % 1; s += '<circle cx="' + f(711 + k * 6) + '" cy="' + f(138 - p * 48) + '" r="1.6" fill="#fff" opacity="' + f(1 - p) + '"/>'; }
    return s + R(714, 70, 17, 7, "#5a8a78", 1.6, 2);
  }
  function chlorTank(t, P) { var p = (t * 0.9) % 1; return R(752, 110, 18, 36, "#e9e36a", 2, 4) + T("Cl", 761, 133, 9, "#2b2016") + '<path d="M761 110 V102 H776 V134" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + (P.run !== false ? '<circle cx="776" cy="' + f(104 + p * 28) + '" r="2" fill="#b8e23a" stroke="' + INK + '" stroke-width=".6"/>' : ""); }
  function storeTank(t, P) {
    var lv = 100 + 6 * Math.sin(t * 0.9), s = '<path d="M785 74 Q830 46 875 74 Z" fill="#dcd6c6" stroke="' + INK + '" stroke-width="2.2"/>' + R(785, 74, 90, 72, "#e9e4d8", 2.2);
    s += '<rect x="797" y="84" width="34" height="56" rx="3" fill="#f7fbfd" stroke="' + INK + '" stroke-width="1.2"/><rect x="798" y="' + f(lv) + '" width="32" height="' + f(139 - lv) + '" fill="' + FRESH + '"/><path d="M798 ' + f(lv) + ' q8 ' + f(Math.sin(t * 3) * 2.4) + ' 16 0 t16 0" stroke="#fff" stroke-width="1.4" fill="none"/>';
    s += '<path d="M852 76 V146 M862 76 V146" stroke="' + INK + '" stroke-width="1.6"/>'; for (var k = 0; k < 8; k++) s += '<path d="M852 ' + (82 + k * 8) + ' h10" stroke="' + INK + '" stroke-width="1.3"/>';
    return s + '<path d="M785 96 H875" stroke="#bdb8ad" stroke-width="1.4"/>';
  }
  function distPumps(t, P) { var s = ""; [887, 900].forEach(function (x, n) { var a = t * 12 + n; s += R(x - 1, 128, 12, 18, "#3aa05a", 1.6, 3) + '<circle cx="' + (x + 5) + '" cy="140" r="5.5" fill="#3f6f9f" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (x + 5) + ' 140 l' + f(Math.cos(a) * 4.5) + ' ' + f(Math.sin(a) * 4.5) + '" stroke="#fff" stroke-width="1.6"/>'; }); return s; }
  function lab(t) {
    var s = R(925, 104, 52, 46, "#f4f1e8", 2.2) + R(921, 98, 60, 8, "#5d93ad", 2) + R(931, 114, 14, 14, "#9fd0ea", 1.4) + R(950, 114, 14, 14, "#9fd0ea", 1.4) + R(966, 126, 8, 24, "#6a4a2a", 1.4);
    var b = (t * 0.8) % 1; return s + '<path d="M936 141 l3 -8 v-5 h4 v5 l3 8 Z" fill="#8fe0a0" stroke="' + INK + '" stroke-width="1.1"/><circle cx="941" cy="' + f(138 - b * 9) + '" r="1.2" fill="#fff"/>';
  }
  function bucket(x, t) { var p = (t * 1.6) % 1; return '<path d="M' + (x - 9) + ' 132 L' + (x - 7) + ' 150 H' + (x + 7) + ' L' + (x + 9) + ' 132 Z" fill="#cfe1ec" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 8) + ' 138 H' + (x + 8) + ' L' + (x + 7) + ' 149 H' + (x - 7) + ' Z" fill="' + FRESH + '"/><circle cx="' + x + '" cy="' + f(128 + p * 8) + '" r="1.8" fill="' + FRESH + '" stroke="' + INK + '" stroke-width=".5"/>'; }
  function plant(t, P) {
    P = P || {}; var s = "", run = P.run !== false, sp = run ? 1 : 0, hasPump = K(P.pump) > 0, hasRack = K(P.rack) > 0, hasIn = K(P.intake) > 0, erd = K(P.erd) > 0, out = K(P.outfall) > 0, lime = K(P.lime) > 0, tank = K(P.tank) > 0;
    if (hasPump) s += hasIn ? pipe("M60 226 V248.4 L250 180 H282 V140 H420", SEAW, 7, t, sp) : pipe("M228 186 L262 140 H420", SEAW, 7, t, sp);
    if (hasPump && hasRack) {
      s += pipe("M470 118 H512", SEAW, 7, t, sp * 2) + pipe("M512 124 V52", SEAW, 7, t, sp);
      var tail = out ? " L-130 336.8" : " L212 191";
      if (erd) s += pipe("M668 56 V135 H597", BRINE, 7, t, sp * 2) + pipe("M570 144 V200 H250" + tail, BRINE, 7, t, sp) + pipe("M410 140 V163 H535 V139 H545", SEAW, 5, t, sp) + pipe("M545 131 H512", SEAW, 5, t, sp * 2);
      else s += pipe("M668 56 V200 H250" + tail, BRINE, 7, t, sp);
      if (out) s += diffusers(t, P);
      var endX = tank ? 785 : lime ? 776 : 694;
      s += pipe("M676 54 V140 H" + endX, FRESH, 6, t, P.clog ? 0 : sp) + pipe("M662 59 H676 M662 84 H676 M662 109 H676", FRESH, 4, t, 0);
      if (!tank) s += bucket(endX + 6, t);
      if (tank && K(P.dist) > 0) s += pipe("M875 140 H916 V168 H2200", FRESH, 6, t, sp);
    }
    if (hasIn) s += app(P.intake, 60, 230, intakeHead(t));
    if (K(P.filters) > 0) s += app(P.filters, 345, 146, filters(t, P));
    if (hasPump) s += app(P.pump, 444, 146, pump(t, P));
    if (hasRack) s += app(P.rack, 590, 150, rack(t, P));
    if (erd) s += app(P.erd, 570, 135, erdUnit(t, P));
    if (lime) s += app(P.lime, 722, 146, limeTank(t, P));
    if (K(P.chlor) > 0) s += app(P.chlor, 761, 146, chlorTank(t, P));
    if (tank) s += app(P.tank, 830, 146, storeTank(t, P));
    if (K(P.dist) > 0) s += app(P.dist, 898, 146, distPumps(t, P));
    if (K(P.lab) > 0) s += app(P.lab, 950, 150, lab(t));
    return s;
  }
  var FULL = { rack: 1, pump: 1, intake: 1, filters: 1, erd: 1, outfall: 1, lime: 1, chlor: 1, tank: 1, dist: 1, lab: 1 };
  function upTo(n, extra) { var order = ["rack", "pump", "intake", "filters", "erd", "outfall", "lime", "chlor", "tank", "dist", "lab"], P = {}; for (var i = 0; i < n; i++) P[order[i]] = 1; return Object.assign(P, extra || {}); }

  // the membrane seen very close: salty side on the left, fresh on the right
  // mode: "filter" (big holes, salt goes through), "still", "osmosis" (water drifts to the salt), "ro" (pressure pushes water through)
  function micro(cx, cy, r, t, mode) {
    var id = "mc" + (++CLIPN), s = '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath><g clip-path="url(#' + id + ')"><rect x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + r + '" height="' + (2 * r) + '" fill="#1f6f9f"/><rect x="' + cx + '" y="' + (cy - r) + '" width="' + r + '" height="' + (2 * r) + '" fill="' + (mode === "filter" ? "#3f8fb5" : "#c9ecfb") + '"/>';
    var seg = mode === "filter" ? r * 0.13 : r * 0.2, gap = mode === "filter" ? r * 0.2 : r * 0.045;
    for (var y = cy - r; y < cy + r; y += seg + gap) s += '<rect x="' + f(cx - r * 0.06) + '" y="' + f(y) + '" width="' + f(r * 0.12) + '" height="' + f(seg) + '" fill="' + (mode === "filter" ? "#fbfbf7" : "#e2c48a") + '" stroke="' + INK + '" stroke-width="1.2"/>';
    for (var i = 0; i < 16; i++) {
      var p = (t * 0.32 + hash(i)) % 1, x, yy = cy + (hash(i + 7) - 0.5) * 1.6 * r + Math.sin(t * 3 + i) * 2;
      if (mode === "filter" || mode === "ro") x = cx - r + 2 * r * p; else if (mode === "osmosis") x = cx + r - 2 * r * p; else x = cx + (i % 2 ? 1 : -1) * (r * 0.2 + hash(i + 2) * r * 0.7) + Math.sin(t * 2 + i) * 3;
      s += '<circle cx="' + f(x) + '" cy="' + f(yy) + '" r="' + f(r * 0.05) + '" fill="#8fd8ff" stroke="' + INK + '" stroke-width=".8"/>';
    }
    for (var k = 0; k < 9; k++) {
      var q = (t * 0.27 + hash(k + 40)) % 1, sx, sy = cy + (hash(k + 17) - 0.5) * 1.5 * r + Math.cos(t * 2.4 + k) * 3, sz = r * 0.1;
      sx = mode === "filter" ? cx - r + 2 * r * q : cx - r * 0.14 - r * 0.72 * Math.abs(Math.sin(t * (mode === "ro" ? 1.5 : 0.8) + k * 1.7));
      s += '<rect x="' + f(sx - sz / 2) + '" y="' + f(sy - sz / 2) + '" width="' + f(sz) + '" height="' + f(sz) + '" fill="#fff7d6" stroke="' + INK + '" stroke-width="1" transform="rotate(' + f(t * 40 + k * 30) + ' ' + f(sx) + ' ' + f(sy) + ')"/>';
    }
    s += '</g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="' + f(r * 0.07) + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#fff" stroke-width="' + f(r * 0.03) + '"/>';
    if (mode === "ro") s += arrow(cx - r * 0.95, cy, cx - r * 0.3, cy, "#f2c230", r * 0.07);
    return s;
  }

  // small props
  function homeFilter(x, y, t) { var s = R(x - 4, y - 8, 70, 10, "#f4f1e8", 2, 3); [0, 22, 44].forEach(function (dx, i) { s += R(x + dx, y, 18, 42, "#eaf4fb", 1.8, 6) + R(x + dx + 4, y + 5, 10, 32, ["#fbfbf7", "#e9dcae", "#3a3f46"][i], 1, 2) + R(x + dx - 1, y - 2, 20, 6, "#2f6f9f", 1.4, 2); }); return s; }
  function glass(x, y, lv, col) { return '<path d="M' + (x - 9) + ' ' + (y - 26) + ' L' + (x - 7) + ' ' + y + ' H' + (x + 7) + ' L' + (x + 9) + ' ' + (y - 26) + '" fill="#eaf6fb" fill-opacity=".6" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(x - 7 - 1.6 * lv) + ' ' + f(y - 22 * lv) + ' L' + (x - 7) + ' ' + y + ' H' + (x + 7) + ' L' + f(x + 7 + 1.6 * lv) + ' ' + f(y - 22 * lv) + ' Z" fill="' + (col || FRESH) + '"/>'; }
  function pot(x, y, t) {
    var s = "", lid = Math.abs(Math.sin(t * 9)) * 3;
    for (var k = 0; k < 5; k++) { var fl = 1 + 0.3 * Math.sin(t * 11 + k * 2); s += '<path transform="translate(' + (x - 32 + k * 16) + ' ' + (y + 2) + ') scale(' + f(fl) + ')" d="M0 0 C-8 -6 -5 -16 1 -22 C2 -14 9 -10 5 0 Z" fill="' + (k % 2 ? "#ff8a2f" : "#f2c230") + '" stroke="' + INK + '" stroke-width="1"/>'; }
    s += R(x - 44, y - 62, 88, 44, "#9aa2ac", 2.4, 6) + '<path d="M' + (x - 44) + ' ' + (y - 46) + ' h-10 v12 h10 M' + (x + 44) + ' ' + (y - 46) + ' h10 v12 h-10" stroke="' + INK + '" stroke-width="2.4" fill="none"/><path d="M' + (x - 36) + ' ' + (y - 54) + ' v28" stroke="#fff" stroke-width="3" opacity=".6"/>';
    s += '<g transform="translate(0 ' + f(-lid) + ') rotate(' + f(Math.sin(t * 9) * 2) + ' ' + x + ' ' + (y - 64) + ')">' + R(x - 48, y - 70, 96, 9, "#c9ced4", 2.2, 4) + '<circle cx="' + x + '" cy="' + (y - 74) + '" r="5" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.6"/></g>';
    for (var i = 0; i < 8; i++) { var p = (t * 0.5 + i / 8) % 1; s += '<circle cx="' + f(x + (hash(i) - 0.5) * 70 + Math.sin(p * 6 + i) * 8) + '" cy="' + f(y - 76 - p * 80) + '" r="' + f(6 + p * 12) + '" fill="#fff" opacity="' + f(0.7 * (1 - p)) + '"/>'; }
    return s;
  }
  function acUnit(x, y, t) { var s = R(x - 46, y - 16, 92, 30, "#fbfbf7", 2.4, 8) + '<path d="M' + (x - 38) + ' ' + (y + 7) + ' H' + (x + 38) + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + (x + 34) + '" cy="' + (y - 6) + '" r="2.4" fill="#5bbf6a"/>'; for (var i = 0; i < 6; i++) { var p = (t * 0.8 + i / 6) % 1; s += '<path d="M' + f(x - 32 + i * 13) + ' ' + f(y + 18 + p * 30) + ' q4 5 0 10" stroke="#9fd8ff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; } return s; }
  function clock(x, y, r, t) { var a = t * 2.2; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(a) * r * 0.75) + ' ' + f(y - Math.cos(a) * r * 0.75) + '" stroke="#e23b2e" stroke-width="2.4" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(a / 12) * r * 0.5) + ' ' + f(y - Math.cos(a / 12) * r * 0.5) + '" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>'; }
  function sub(x, y, t) { var a = t * 14; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 1.4) * 3) + ')"><path d="M44 0 l' + f(8 + Math.cos(a) * 2) + ' -9 v18 Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6"/><ellipse rx="46" ry="19" fill="#f2c230" stroke="' + INK + '" stroke-width="2.6"/><rect x="-12" y="-30" width="22" height="13" rx="4" fill="#e2a520" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-18" cy="0" r="8" fill="#bfe6fb" stroke="' + INK + '" stroke-width="2"/><circle cx="6" cy="0" r="6" fill="#bfe6fb" stroke="' + INK + '" stroke-width="2"/><path d="M-34 -9 q10 -7 24 -6" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/></g>'; }
  function confetti(t, x0, x1, y0, y1, n, sz) { var s = ""; for (var c = 0; c < n; c++) { var p = (t * 0.45 + hash(c)) % 1, x = lerp(x0, x1, hash(c + 2)) + Math.sin(t * 2 + c) * 8, y = lerp(y0, y1, p); s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + sz + '" height="' + f(sz * 1.6) + '" fill="' + ["#e23b2e", "#f2c230", "#3aa05a", "#2f6f9f", "#f7d0ea"][c % 5] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>'; } return s; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function cam2(a, b) { return function (u, d) { var k = clamp(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }; }

  // 0 — fill a bucket from the sea and run it through the home water filter: is that a desalination plant?
  shot(0, cam2([330, 112, 1.45], [395, 108, 1.7]), function (u, d, t) {
    var k = ease(clamp((u - 0.3) / 1.6)), pour = clamp((u - 2.0) / 1.6), bx = lerp(246, 372, k), by = lerp(166, 78, Math.sin(k * Math.PI / 2)), s = coast(t);
    s += R(366, 124, 96, 5, "#8a6a3a", 1.6) + '<path d="M372 129 V150 M456 129 V150" stroke="' + INK + '" stroke-width="3"/>' + homeFilter(382, 80, t) + glass(476, 150, pour, "#6fb8d8");
    if (pour > 0 && pour < 1) { s += '<path d="M' + f(bx + 10) + ' ' + f(by + 4) + ' Q' + f(bx + 22) + ' ' + f(by + 4) + ' 392 80" stroke="' + SEAW + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; var dp = (t * 2) % 1; s += '<circle cx="476" cy="' + f(126 + dp * 12) + '" r="1.8" fill="#6fb8d8"/>'; }
    s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(pour > 0 && pour < 1 ? 55 : 0) + ')"><path d="M-10 -12 L-8 8 H8 L10 -12 Z" fill="#e23b2e" stroke="' + INK + '" stroke-width="1.8"/><path d="M-9 -7 H9 L8 6 H-8 Z" fill="' + SEAW + '"/><path d="M-10 -12 Q0 -26 10 -12" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
    s += stand(lerp(280, 344, k), 0.2, t, u > d * 0.55 ? "curious" : "happy", { look: 1 });
    return s + qmark(520, 78, t, 30) + tag("محطة تحلية؟", 440, 44, u, d * 0.55, -3, 19);
  });
  // 1 — no: the salt is dissolved in the water itself and goes straight through the filter
  shot(1, cam2([400, 100, 1.5], [410, 96, 1.7]), function (u, d, t) {
    var s = coast(t) + R(366, 124, 96, 5, "#8a6a3a", 1.6) + '<path d="M372 129 V150 M456 129 V150" stroke="' + INK + '" stroke-width="3"/>' + homeFilter(382, 80, t) + glass(476, 150, 1, "#6fb8d8");
    s += stand(520, 0.2, t, u > 1.4 ? "dizzy" : "worry", { look: -1 }) + micro(330, 92, 52, t, "filter");
    return s + tag("الملح بيعدي!", 330, 30, u, 1.0, -3, 17, "#f2a0a0") + tag("35 جم ملح في اللتر", 470, 184, u, d * 0.5, 2, 13) + xmark(424, 100, 12, u, 0.7);
  });
  // 2 — so you get a membrane with openings about a million times finer than a hair: water passes, salt stays
  shot(2, cam2([585, 84, 1.45], [590, 80, 1.7]), function (u, d, t) {
    var s = coast(t) + plant(t, { rack: (u - 0.3) / 0.9, cut: u > 2.2, run: false });
    s += '<path d="M500 80 L540 84" stroke="' + INK + '" stroke-width="2" stroke-dasharray="4 4"/>' + app((u - 1.4) / 0.9, 470, 62, micro(470, 62, 44, t, "still"));
    return s + stand(730, 0.2, t, "happy", { look: -1, point: false }) + tag("غشاء", 600, 174, u, 0.9, -3, 17) + tag("أصغر من الشعرة مليون مرة", 600, 22, u, d * 0.45, 2, 13, "#bfe8c0");
  });
  // 3 — but water won't go through on its own: by nature it is drawn towards the salty side
  shot(3, cam2([320, 180, 1.0], [320, 178, 1.1]), function (u, d, t) {
    var s = coast(t) + '<rect x="-1200" y="-600" width="3400" height="1600" fill="#0d2a48" opacity=".55"/>' + micro(320, 190, 102, t, "osmosis");
    s += T("مالحة", 262, 306, 15, "#fff7d6") + T("حلوة", 378, 306, 15, "#1f6f9f") + arrow(400, 190, lerp(400, 250, clamp((u - 0.8) / 1.2)), 190, "#f2c230", 7, clamp((u - 0.8) * 3));
    return s + tag("المية بتتسحب للملح", 320, 56, u, 1.2, -2, 20, "#f2a0a0");
  });
  // 4 — so you fit a pump that pushes the seawater onto the membrane at about 60 atmospheres
  shot(4, cam2([470, 104, 1.5], [472, 102, 1.85]), function (u, d, t) {
    var on = u > 1.3, s = coast(t) + plant(t, { rack: 1, pump: (u - 0.3) / 0.9, run: on, gauge: ease(clamp((u - 1.3) / 2)) * 0.82 });
    if (on) for (var k = 0; k < 3; k++) { var p = (t * 1.4 + k / 3) % 1; s += '<circle cx="444" cy="128" r="' + f(18 + p * 22) + '" fill="none" stroke="#f2c230" stroke-width="2" opacity="' + f(0.7 * (1 - p)) + '"/>'; }
    return s + tag("طلمبة ضغط عالي", 432, 176, u, 0.9, -3, 14) + tag("60 ضغط جوي", 470, 44, u, d * 0.55, 3, 19, "#f2c230");
  });
  // 5 — the pressure of 600 m of sea above you: reverse osmosis
  shot(5, function (u, d) { var k = clamp(u / d); return [330, lerp(105, 235, ease(k * 1.15)), 1.2]; }, function (u, d, t) {
    var k = ease(clamp(u / d * 1.15)), y = lerp(50, 300, k), s = '<rect x="-1200" y="-600" width="3400" height="630" fill="url(#sky-day)"/>' + clouds(t, 12, -60, 4, 0.85) + '<rect x="-1200" y="20" width="3400" height="900" fill="url(#sea2)"/><rect x="-1200" y="230" width="3400" height="700" fill="#06182a" opacity=".45"/>';
    var w = "M-1200 20"; for (var x = -1200; x <= 2200; x += 24) w += " L" + x + " " + f(20 + Math.sin(x * 0.04 + t * 2.2) * 3); s += '<path d="' + w + ' V34 H-1200 Z" fill="#bfe6f7" opacity=".7"/>';
    for (var i = 0; i < 30; i++) { var px = 40 + hash(i) * 560, py = 30 + ((hash(i + 5) * 340 - t * (10 + hash(i) * 14)) % 340 + 340) % 340; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(1 + hash(i + 1) * 2) + '" fill="#fff" opacity=".45"/>'; }
    s += '<path d="M560 20 V322" stroke="#fff" stroke-width="3"/>'; [0, 200, 400, 600].forEach(function (m) { var yy = 20 + m * 0.5; s += '<path d="M548 ' + yy + ' H572" stroke="#fff" stroke-width="3"/>' + T(m + " م", 520, yy + 5, 13, m === 600 ? "#f2c230" : "#fff"); });
    for (var a = 0; a < 8; a++) { var an = a * Math.PI / 4, r0 = 78 - 14 * k + Math.sin(t * 6 + a) * 4, r1 = r0 - 8 - 20 * k; s += arrow(420 + Math.cos(an) * r0, y + Math.sin(an) * r0 * 0.7, 420 + Math.cos(an) * r1, y + Math.sin(an) * r1 * 0.7, "#ff8a5a", 2 + 2.5 * k, k > 0.12 ? 1 : 0); }
    s += sub(420, y, t) + '<path d="M548 ' + f(y) + ' H572" stroke="#f2c230" stroke-width="5"/>';
    return s + tag("عمق 600 متر", 190, 286, u, d * 0.42, -3, 21, "#f2c230") + tag("التناضح العكسي", 210, 216, u, d * 0.66, 2, 20, "#bfe8c0");
  });
  // 6 — but the sea is full of sand, algae and jellyfish, and they would clog the membrane fast
  shot(6, function (u, d) { var k = clamp(u / d); return k < 0.58 ? [lerp(140, 175, k / 0.58), lerp(222, 212, k / 0.58), 1.6] : [lerp(585, 592, (k - 0.58) / 0.42), 92, lerp(1.6, 1.8, (k - 0.58) / 0.42)]; }, function (u, d, t) {
    var k = clamp(u / d), cl = clamp((k - 0.58) / 0.3), s = coast(t, { fish: false }) + plant(t, { rack: 1, pump: 1, clog: cl, run: cl < 0.9, gauge: 0.82 });
    for (var j = 0; j < 3; j++) { var p = (t * 0.22 + j / 3) % 1; s += jelly(lerp(40 + j * 20, 226, p), lerp(250 - j * 22, 190, p), 0.8 - 0.4 * p, t + j); }
    for (var i = 0; i < 22; i++) { var q = (t * 0.3 + hash(i)) % 1, x0 = 30 + hash(i + 3) * 160, y0 = 180 + hash(i + 8) * (bedY(x0) - 190); s += '<circle cx="' + f(lerp(x0, 228, q * q)) + '" cy="' + f(lerp(y0, 187, q * q)) + '" r="' + f(1.5 + hash(i + 1) * 2.5) + '" fill="' + (i % 3 ? "#c9a25a" : "#4faa5a") + '" stroke="' + INK + '" stroke-width=".5"/>'; }
    s += tag("رمل وطحالب وقناديل", 150, 152, u, 0.5, -2, 14, "#f2a0a0");
    return s + tag("الغشاء اتسد!", 590, 26, u, d * 0.66, -3, 16, "#f2a0a0") + xmark(590, 84, 16, u, d * 0.7);
  });
  // 7 — so you draw the water through a pipe out in the sea, far from the shore, with a screen on its mouth
  shot(7, cam2([130, 218, 1.3], [78, 222, 1.65]), function (u, d, t) {
    var s = coast(t) + plant(t, { rack: 1, pump: 1, intake: (u - 0.3) / 0.9 });
    for (var j = 0; j < 3; j++) { var b = Math.abs(Math.sin(t * 0.9 + j * 2)); s += jelly((j % 2 ? 92 : 26) + (j % 2 ? 1 : -1) * b * 34, 196 + j * 9, 0.55, t + j * 3); }
    return s + tag("ماسورة بعيد عن الشط", 150, 152, u, 0.9, -2, 14) + tag("مصفاة", 2, 196, u, d * 0.6, 3, 15, "#bfe8c0");
  });
  // 8 — then through sand filters and finer filters before it reaches the membrane
  shot(8, cam2([345, 106, 1.85], [352, 104, 2.15]), function (u, d, t) {
    var s = coast(t) + plant(t, { rack: 1, pump: 1, intake: 1, filters: (u - 0.3) / 0.9 });
    for (var i = 0; i < 6; i++) { var p = (t * 0.6 + i / 6) % 1; s += '<circle cx="' + f(lerp(240, 288, p)) + '" cy="' + f(lerp(170, 140, clamp(p * 3))) + '" r="2" fill="#7a5a36" opacity="' + f(1 - p * 0.5) + '"/>'; }
    return s + tag("فلاتر رمل", 334, 58, u, 0.9, -3, 13) + tag("فلاتر أنعم", 436, 92, u, d * 0.5, 3, 12, "#bfe8c0");
  });
  // 9 — but that pump draws a lot of electricity, the plant's biggest running cost
  shot(9, cam2([444, 98, 2.0], [446, 94, 2.3]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(4)), a = t * 9;
    s += R(408, 56, 34, 40, "#f4f1e8", 2, 4) + '<ellipse cx="425" cy="72" rx="12" ry="4" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/><rect x="' + f(425 + Math.cos(a) * 10 - 2) + '" y="70" width="4" height="4" fill="#e23b2e"/>' + R(413, 82, 24, 9, "#1c1c1c", 1, 2) + T(String(1000 + Math.floor(t * 37) % 9000), 425, 90, 7, "#7cf28a");
    for (var k = 0; k < 4; k++) if (Math.sin(t * 13 + k * 1.9) > 0.1) s += bolt(410 + k * 22, 108 + (k % 2) * 26, 0.7);
    for (var c = 0; c < 5; c++) { var p = (t * 0.7 + c / 5) % 1; s += '<g opacity="' + f(1 - p) + '"><circle cx="' + f(452 + c * 7 + Math.sin(p * 6 + c) * 5) + '" cy="' + f(72 - p * 40) + '" r="5" fill="#f2c230" stroke="' + INK + '" stroke-width="1.2"/></g>'; }
    return s + tag("أكبر مصروف", 500, 40, u, d * 0.5, 3, 13, "#f2a0a0") + tag("كهربا كتير", 384, 44, u, 0.7, -3, 12);
  });
  // 10 — stranger still: only about half the water gets through the membrane
  shot(10, cam2([592, 86, 1.7], [600, 86, 1.95]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(4, { cut: true }));
    return s + Tp("100%", 488, 100, 15, "#fff", u, 0.4) + Tp("50%", 724, 100, 17, FRESH, u, d * 0.4) + tag("النص بس بيعدي", 592, 24, u, d * 0.45, -2, 15, "#f2c230");
  });
  // 11 — the other half leaves saltier, still carrying nearly all of the high pressure
  shot(11, cam2([650, 116, 1.85], [664, 122, 2.05]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(4, { cut: true }));
    s += '<path d="M672 170 H690" stroke="' + INK + '" stroke-width="2"/>' + gauge(702, 170, 13, 0.8 + Math.sin(t * 19) * 0.03);
    for (var k = 0; k < 3; k++) { var p = (t * 1.3 + k / 3) % 1; s += '<circle cx="668" cy="150" r="' + f(8 + p * 16) + '" fill="none" stroke="' + BRINE + '" stroke-width="2" opacity="' + f(0.8 * (1 - p)) + '"/>'; }
    return s + tag("مالح أكتر", 730, 196, u, 0.8, 3, 13, "#f0d090") + tag("والضغط لسه عالي!", 650, 60, u, d * 0.5, -2, 14, "#f2a0a0");
  });
  // 12 — so you add an energy recovery device: it takes that pressure and hands it to the incoming water
  shot(12, cam2([570, 140, 1.9], [572, 138, 2.25]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(4, { erd: (u - 0.3) / 0.9 }));
    if (u > 1.6) s += curl(570, 118, 30, 0.2, -3.3, "#f2c230", 2.6, clamp((u - 1.6) / 1.2));
    return s + tag("جهاز استرجاع الطاقة", 572, 184, u, 0.9, -2, 13, "#bfe8c0");
  });
  // 13 — it gives back more than 90% of the pressure that would have been lost
  shot(13, cam2([574, 136, 2.3], [576, 134, 2.6]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(5));
    for (var k = 0; k < 3; k++) { var p = (t * 1.2 + k / 3) % 1; s += '<circle cx="570" cy="135" r="' + f(12 + p * 26) + '" fill="none" stroke="#f2c230" stroke-width="1.8" opacity="' + f(0.8 * (1 - p)) + '"/>'; }
    return s + Tp("+90%", 632, 176, 20, "#f2c230", u, 0.6) + tag("الضغط بيرجع تاني", 520, 186, u, d * 0.45, -2, 10, "#bfe8c0");
  });
  // 14 — but the leftover brine is about twice as salty: dumped at the shore it harms the fish and the reefs
  shot(14, cam2([175, 218, 1.4], [150, 226, 1.6]), function (u, d, t) {
    var g = clamp((u - 0.5) / 2.6), s = coast(t, { mood: g > 0.3 ? "shock" : "n", flee: g > 0.45, pale: g });
    for (var i = 0; i < 12; i++) { var x = 212 - i * 15 * g, r = (10 + i * 1.6) * (0.4 + 0.6 * g) + Math.sin(t * 3 + i) * 2; s += '<ellipse cx="' + f(x) + '" cy="' + f(bedY(x) - 6) + '" rx="' + f(r * 1.5) + '" ry="' + f(r * 0.7) + '" fill="' + BRINE + '" opacity="' + f(0.34 * g + 0.1) + '"/>'; }
    s += plant(t, upTo(5));
    return s + tag("ملوحة الضعف", 110, 150, u, 0.8, -3, 16, "#f2a0a0") + xmark(160, 222, 12, u, d * 0.55);
  });
  // 15 — so you run a long pipe out to sea, ending in many openings that spray the brine and mix it quickly
  shot(15, cam2([60, 246, 1.2], [-36, 268, 1.5]), function (u, d, t) {
    var s = coast(t, { mood: "happy" }) + plant(t, upTo(5, { outfall: (u - 0.3) / 0.9 }));
    return s + tag("ماسورة طويلة لجوه البحر", 20, 184, u, 0.9, -2, 14) + tag("فتحات بترش وتخلط", -96, 214, u, d * 0.5, 3, 14, "#bfe8c0");
  });
  // 16 — but the water that came through is too pure: flat taste, and it eats the pipes
  shot(16, cam2([752, 104, 1.8], [762, 104, 2.0]), function (u, d, t) {
    var r = clamp((u - d * 0.45) / 1.6), s = coast(t) + plant(t, upTo(6));
    s += stand(650, 0.17, t, "worry", { look: 1 }) + glass(676, 122, 0.8) + '<path d="M664 116 Q668 108 676 112" stroke="#e8742e" stroke-width="3" fill="none"/>';
    s += pipe("M760 78 H870", "#9aa2ac", 16, t, 0) + '<path d="M762 73 H868" stroke="#fff" stroke-width="2" opacity=".6"/>';
    [[786, 80, 9], [818, 74, 7], [846, 82, 10], [802, 84, 5]].forEach(function (h, i) { s += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="' + f(h[2] * r) + '" ry="' + f(h[2] * 0.6 * r) + '" fill="#8a4a1e" stroke="#5a2c10" stroke-width="1"/>'; if (r > 0.5) { var p = (t * 1.2 + i * 0.3) % 1; s += '<circle cx="' + h[0] + '" cy="' + f(90 + p * 50) + '" r="2" fill="' + FRESH + '" stroke="' + INK + '" stroke-width=".5" opacity="' + f(1 - p) + '"/>'; } });
    return s + tag("طعمها ماسخ", 668, 62, u, 0.7, -3, 13, "#f2a0a0") + tag("بتاكل المواسير", 816, 48, u, d * 0.5, 2, 13, "#f2a0a0");
  });
  // 17 — so you pass it over limestone, which gives back a little useful mineral, and add chlorine to disinfect it
  shot(17, cam2([735, 106, 2.0], [742, 104, 2.25]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(6, { lime: (u - 0.3) / 0.9, chlor: (u - d * 0.55) / 0.9 }));
    return s + tag("حجر جيري", 722, 56, u, 0.9, -3, 13) + tag("كلور", 806, 94, u, d * 0.55 + 0.4, 3, 13, "#e9e36a");
  });
  // 18 — many people think desalination means boiling seawater and collecting the steam
  shot(18, cam2([440, 92, 1.5], [452, 88, 1.7]), function (u, d, t) {
    var s = coast(t) + pot(450, 150, t) + stand(540, 0.2, t, "curious", { look: -1 });
    for (var k = 0; k < 3; k++) s += '<circle cx="' + (522 - k * 8) + '" cy="' + (88 - k * 10) + '" r="' + (2 + k * 1.5) + '" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
    return s + qmark(560, 70, t, 26) + tag("بنغلي مية البحر؟", 440, 34, u, 0.8, -3, 17);
  });
  // 19 — in fact most of the world's plants now work by pressure, with no boiling at all
  shot(19, cam2([580, 88, 1.5], [592, 86, 1.75]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(8, { cut: true }));
    s += '<g transform="translate(462 64) scale(.36)">' + pot(0, 0, t) + '</g>' + xmark(462, 46, 14, u, 0.5);
    return s + tag("بالضغط من غير غلي", 612, 20, u, d * 0.4, 2, 15, "#bfe8c0");
  });
  // 20 — a thousand litres of drinking water take about 3 kWh, an air conditioner running for two hours
  shot(20, cam2([320, 118, 1.05], [320, 118, 1.15]), function (u, d, t) {
    var s = '<rect x="-1200" y="-600" width="3400" height="1600" fill="#16324f"/>', o = (t * 24) % 40, g = "";
    for (var x = -200; x <= 900; x += 40) g += "M" + f(x + o) + " -300 V700 "; for (var y = -300; y <= 700; y += 40) g += "M-300 " + f(y + o) + " H1000 "; s += '<path d="' + g + '" stroke="#2a5078" stroke-width="1.4" fill="none"/>';
    var lv = 100 + Math.sin(t * 2) * 3;
    s += app((u - 0.2) / 0.9, 130, 120, R(88, 70, 84, 84, "#eaf6fb", 3, 6) + '<rect x="91" y="' + f(lv - 14) + '" width="78" height="' + f(151 - lv + 14) + '" fill="' + FRESH + '"/><path d="M91 ' + f(lv - 14) + ' q20 ' + f(Math.sin(t * 3) * 4) + ' 39 0 t39 0" stroke="#fff" stroke-width="2" fill="none"/>' + R(120, 60, 20, 10, "#2f6f9f", 2, 3) + T("1000 لتر", 130, 190, 20, "#fff"));
    s += app((u - d * 0.3) / 0.9, 320, 120, '<circle cx="320" cy="112" r="' + f(40 + Math.sin(t * 5) * 3) + '" fill="#f2c230" opacity=".22"/>' + bolt(320, 112, 2.6) + T("3 كيلو وات ساعة", 320, 190, 17, "#f2c230"));
    s += app((u - d * 0.62) / 0.9, 510, 120, acUnit(500, 84, t) + clock(560, 140, 16, t) + T("تكييف ساعتين", 510, 190, 18, "#9fd8ff"));
    s += arrow(190, 112, 262, 112, "#fff", 5, clamp((u - d * 0.25) * 2)) + (u > d * 0.58 ? T("=", 408, 124, 34, "#fff") : "");
    return s + tag("3 كيلو وات بس!", 320, 30, u, d * 0.35, -2, 19, "#bfe8c0");
  });
  // 21 — add a big tank, pumps that carry the water to the homes, and a lab that tests the water every day
  shot(21, cam2([800, 100, 1.5], [890, 100, 1.5]), function (u, d, t) {
    var s = coast(t) + plant(t, upTo(8, { tank: (u - 0.2) / 0.9, dist: (u - d * 0.38) / 0.9, lab: (u - d * 0.68) / 0.9 }));
    return s + tag("خزان كبير", 830, 34, u, 0.6, -3, 15) + tag("طلمبات", 898, 190, u, d * 0.38 + 0.4, 3, 13, "#bfe8c0") + tag("معمل", 952, 78, u, d * 0.68 + 0.4, -3, 14, "#e9e36a");
  });
  // 22 — congratulations, you've built a desalination plant: pull back to the whole build
  shot(22, function (u, d) { var k = ease(clamp(u / d)); return [lerp(640, 430, k), lerp(110, 140, k), lerp(1.3, 0.64, k)]; }, function (u, d, t) {
    var s = coast(t, { mood: "happy" }) + plant(t, FULL) + stand(1000, 0.26, t, "happy", {}) + stand(250, 0.24, t + 1, "happy", { col: "#2f6f9f" });
    return s + confetti(t, -120, 980, -160, 150, 46, 7) + tag("مبروك!", 430, -40, u, 0.5, -3, 46, "#bfe8c0");
  });
  // 23 — outro
  shot(23, cam2([430, 140, 0.64], [440, 138, 0.58]), function (u, d, t) {
    return coast(t, { sky: "dusk", mood: "happy" }) + plant(t, FULL) + stand(1000, 0.26, t, "happy", {}) + stand(250, 0.24, t + 1, "happy", { col: "#2f6f9f" }) + tag("قولولنا!", 430, -50, u, 0.4, 3, 48);
  });

  window.__parts = { coast: coast, plant: plant, FULL: FULL, upTo: upTo, micro: micro, rack: rack, pump: pump, pot: pot, tag: tag, stand: stand, T: T, fishes: fishes, jelly: jelly, bedY: bedY };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
