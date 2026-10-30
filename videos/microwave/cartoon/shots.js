  // ── new pieces for this episode: a microwave oven (front view and cut open: magnetron, waveguide, cavity, turntable, door
  // mesh), water molecules with their + and − ends, a compass, a plate of rice/veg/chicken, a fork sparking ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function kitchen(t) {   // tiled wall and a counter
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e2d4"/>';
    for (var x = -400; x < 1040; x += 40) s += '<path d="M' + x + ' -300 V250" stroke="#d2c8b4" stroke-width="2"/>';
    for (var y = -300; y < 250; y += 40) s += '<path d="M-400 ' + y + ' H1040" stroke="#d2c8b4" stroke-width="2"/>';
    return s + '<rect x="-400" y="250" width="1440" height="20" fill="#8a6a48"/><rect x="-400" y="270" width="1440" height="400" fill="#a8845e"/>'; }
  function dark(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#141a24"/>'; for (var i = 0; i < 40; i++) { var u = (t * 0.1 + hash(i)) % 1; s += '<circle cx="' + f(-200 + hash(i + 3) * 1040 + 15 * Math.sin(t + i)) + '" cy="' + f(lerp(420, -100, u)) + '" r="' + f(1.5 + hash(i) * 2.5) + '" fill="' + CY + '" opacity="' + f(0.45 * Math.sin(Math.PI * u)) + '"/>'; } return s; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function thermo(x, y, v, label, t, col) {
    var h = 120, lv = clamp(v) * (h - 20), c = col || (v > 0.6 ? RED : BLUE);
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-10" y="' + (-h) + '" width="20" height="' + h + '" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><circle cx="0" cy="8" r="15" fill="' + c + '" stroke="' + INK + '" stroke-width="2.2"/><rect x="-4" y="' + f(-lv) + '" width="8" height="' + f(lv + 6) + '" fill="' + c + '"/>' +
      (label ? '<g transform="translate(0 ' + (-h - 22) + ')"><rect x="-40" y="-16" width="80" height="28" rx="7" fill="' + INK + '"/><text y="5" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + (c === RED ? "#ffb08a" : CY) + '">' + label + '</text></g>' : '') + '</g>'; }
  function steam(x, y, t, w, k) { var s = ""; for (var i = 0; i < 6; i++) { var u = (t * 0.4 + i / 6) % 1, xx = x - w + (i / 5) * 2 * w + Math.sin(t * 2 + i) * 6; s += '<path d="M' + f(xx) + ' ' + f(y - u * 70) + ' q7 -10 0 -20 t0 -20" stroke="#fff" stroke-width="' + f(4 * (1 - u)) + '" fill="none" stroke-linecap="round" opacity="' + f(0.8 * (k == null ? 1 : k) * Math.sin(Math.PI * u)) + '"/>'; } return s; }
  // a plate of rice, vegetables and a piece of chicken, seen from a low angle; spin rotates it (radians)
  function plate(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><ellipse cx="0" cy="6" rx="78" ry="20" fill="#000" opacity=".15"/><ellipse cx="0" cy="0" rx="76" ry="22" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="0" cy="-2" rx="54" ry="14" fill="#f1efe8" stroke="#c9c4b8" stroke-width="1.2"/>';
    var a = o.spin || 0, items = [[-24, "rice"], [22, "chicken"], [100, "veg"]].map(function (it) { var ang = a + it[0] * Math.PI / 180; return { x: Math.cos(ang) * 26, y: Math.sin(ang) * 7 - 4, k: it[1], z: Math.sin(ang) }; }).sort(function (p, q) { return p.z - q.z; });
    items.forEach(function (it) {
      if (it.k === "rice") s += '<ellipse cx="' + f(it.x) + '" cy="' + f(it.y - 6) + '" rx="24" ry="12" fill="url(#gRice)" stroke="' + INK + '" stroke-width="1.6"/>' + [0, 1, 2, 3, 4].map(function (g) { return '<ellipse cx="' + f(it.x - 12 + g * 6) + '" cy="' + f(it.y - 10 + (g % 2) * 4) + '" rx="2.4" ry="1.2" fill="#fff" stroke="#c9c4b8" stroke-width=".5"/>'; }).join("");
      else if (it.k === "chicken") s += '<path d="M' + f(it.x - 20) + ' ' + f(it.y) + ' C' + f(it.x - 22) + ' ' + f(it.y - 18) + ' ' + f(it.x + 16) + ' ' + f(it.y - 20) + ' ' + f(it.x + 20) + ' ' + f(it.y - 4) + ' C' + f(it.x + 14) + ' ' + f(it.y + 6) + ' ' + f(it.x - 12) + ' ' + f(it.y + 6) + ' ' + f(it.x - 20) + ' ' + f(it.y) + ' Z" fill="url(#gChicken)" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(it.x - 8) + ' ' + f(it.y - 12) + ' l10 -2 M' + f(it.x - 4) + ' ' + f(it.y - 6) + ' l12 -2" stroke="#7a3a10" stroke-width="1.2" opacity=".6"/>';
      else s += '<circle cx="' + f(it.x - 6) + '" cy="' + f(it.y - 5) + '" r="5" fill="#6aa84f" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(it.x + 5) + '" cy="' + f(it.y - 4) + '" r="5" fill="#8acb5f" stroke="' + INK + '" stroke-width="1.2"/><rect x="' + f(it.x - 2) + '" y="' + f(it.y - 14) + '" width="10" height="5" rx="2" fill="#f08a24" stroke="' + INK + '" stroke-width="1"/>';
    });
    if (o.hot) s += steam(0, -20, t, 30, o.hot);
    return s + '</g>'; }
  // the microwave from the front: body, door with a dark window and its mesh of dots, the food turning inside, control panel
  function microwave(x, y, t, o) {
    o = o || {}; var on = o.on || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="4" rx="150" ry="10" fill="#000" opacity=".18"/><path d="M-140 0 L-140 -160 L-120 -178 L160 -178 L160 -18 L140 0 Z" fill="url(#gMwSide)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-140" y="-160" width="280" height="160" rx="8" fill="url(#gMw)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<rect x="-128" y="-148" width="190" height="136" rx="6" fill="#cfccc4" stroke="' + INK + '" stroke-width="2"/><rect x="-116" y="-136" width="166" height="112" rx="4" fill="url(#gWin)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<clipPath id="mwwin"><rect x="-116" y="-136" width="166" height="112" rx="4"/></clipPath><g clip-path="url(#mwwin)">';
    if (on) s += '<rect x="-116" y="-136" width="166" height="112" fill="url(#gCav)" opacity="' + f(0.85 * on) + '"/>';
    s += plate(-33, -46, t, { s: 0.85, spin: o.spin == null ? t * 1.2 * on : o.spin, hot: o.hot });
    if (o.fork) s += fork(-30, -60, t, { s: 0.7, spark: o.spark });
    for (var r = 0; r < 12; r++) for (var c = 0; c < 18; c++) s += '<circle cx="' + (-112 + c * 9.4) + '" cy="' + (-132 + r * 9.4) + '" r="1.6" fill="#0b0d10" opacity=".55"/>';
    s += '<path d="M-110 -130 L-40 -130 L-110 -60 Z" fill="#fff" opacity=".07"/></g>';
    s += '<rect x="56" y="-120" width="8" height="70" rx="4" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="74" y="-148" width="58" height="136" rx="4" fill="#e6e2d8" stroke="' + INK + '" stroke-width="1.6"/><rect x="80" y="-140" width="46" height="22" rx="3" fill="#10161c" stroke="' + INK + '" stroke-width="1.4"/><text x="103" y="-124" text-anchor="middle" style="font:800 13px Noto Serif;fill:#7cf29a;direction:ltr">' + (o.time || "0:00") + '</text>';
    for (var b = 0; b < 9; b++) s += '<rect x="' + (80 + (b % 3) * 16) + '" y="' + (-108 + Math.floor(b / 3) * 18) + '" width="12" height="12" rx="3" fill="#fbfaf6" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<circle cx="103" cy="-34" r="12" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><path d="M103 -34 L' + f(103 + 9 * Math.cos(t * 0.5)) + ' ' + f(-34 + 9 * Math.sin(t * 0.5)) + '" stroke="' + INK + '" stroke-width="2"/>';
    if (on) s += '<circle cx="-33" cy="-80" r="' + f(60 + 6 * Math.sin(t * 6)) + '" fill="#ffd23a" opacity="' + f(0.08 * on) + '"/>';
    return s + '</g>'; }
  // the microwave cut open (front and right walls removed): magnetron with its cooling fins, waveguide, the cavity, turntable
  function cutaway(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-150 0 L-110 -40 L190 -40 L150 0 Z" fill="#cfccc4" stroke="' + INK + '" stroke-width="2"/><path d="M-110 -40 L-110 -220 L190 -220 L190 -40 Z" fill="#e9e6de" stroke="' + INK + '" stroke-width="2"/><path d="M-150 0 L-150 -180 L-110 -220 L-110 -40 Z" fill="#d9d6ce" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-150 -180 L-110 -220 L190 -220 L150 -180 Z" fill="#f4f2ec" stroke="' + INK + '" stroke-width="2" opacity=".25"/>';
    s += '<path d="M-130 -20 L-100 -40 H40 L10 -20 Z" fill="none" stroke="#9aa2ac" stroke-width="1.4" stroke-dasharray="4 3"/>';
    // magnetron box at the right, outside the cavity wall, with fins and a magnet ring; waveguide into the cavity top
    s += '<g transform="translate(150 -150)"><rect x="-6" y="-44" width="48" height="70" rx="3" fill="url(#gMag)" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 7; k++) s += '<path d="M-6 ' + (-38 + k * 9) + ' h48" stroke="#5a6068" stroke-width="1.4"/>';
    s += '<rect x="4" y="26" width="28" height="22" rx="2" fill="#c23a26" stroke="' + INK + '" stroke-width="1.8"/><path d="M18 -44 v-10" stroke="' + INK + '" stroke-width="5"/>';
    if (o.glow) s += '<circle cx="18" cy="-10" r="' + f(30 + 4 * Math.sin(t * 9)) + '" fill="#ffd23a" opacity="' + f(0.25 * o.glow) + '"/>';
    s += '</g><path d="M168 -204 L168 -212 L60 -212 L60 -196 L150 -196" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>';
    if (o.food !== false) s += plate(20, -36, t, { s: 1.1, spin: o.spin == null ? t * 1.2 : o.spin, hot: o.hot });
    s += '<ellipse cx="20" cy="-28" rx="92" ry="18" fill="none" stroke="#9aa2ac" stroke-width="2" opacity=".7"/>';
    return s + '</g>'; }
  // a water molecule: big red oxygen (−) and two white hydrogens (+) at 104.5°; ang in radians
  function mol(x, y, ang, s, o) {
    o = o || {}; var r = 14 * s, d = 18 * s, a1 = ang + 0.912, a2 = ang - 0.912, g = '';
    [a1, a2].forEach(function (a) { g += '<circle cx="' + f(x + Math.cos(a) * d) + '" cy="' + f(y + Math.sin(a) * d) + '" r="' + f(8 * s) + '" fill="url(#gH)" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>' + (o.signs ? '<text x="' + f(x + Math.cos(a) * d) + '" y="' + f(y + Math.sin(a) * d + 4 * s) + '" text-anchor="middle" style="font:800 ' + f(11 * s) + 'px Noto Serif;fill:' + BLUE + '">+</text>' : ''); });
    g += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#gO)" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '"/>' + (o.signs ? '<text x="' + f(x - Math.cos(ang) * 4 * s) + '" y="' + f(y + 5 * s) + '" text-anchor="middle" style="font:800 ' + f(15 * s) + 'px Noto Serif;fill:#fff">−</text>' : '<circle cx="' + f(x - 4 * s) + '" cy="' + f(y - 4 * s) + '" r="' + f(4 * s) + '" fill="#fff" opacity=".5"/>');
    return g; }
  function compass(x, y, ang, t, s) {
    s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><circle r="56" fill="#c9a04e" stroke="' + INK + '" stroke-width="3"/><circle r="48" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>' +
      [0, 1, 2, 3].map(function (k) { return '<path d="M0 -48 v8" stroke="' + INK + '" stroke-width="2" transform="rotate(' + k * 90 + ')"/>'; }).join("") +
      '<g transform="rotate(' + f(ang * 180 / Math.PI) + ')"><path d="M0 -40 L8 0 L-8 0 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M0 40 L8 0 L-8 0 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.4"/></g><circle r="4" fill="' + INK + '"/></g>'; }
  function magnet(x, y, rot, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + (s || 1) + ')"><path d="M-34 -40 V10 A34 34 0 0 0 34 10 V-40 H14 V10 A14 14 0 0 1 -14 10 V-40 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-34" y="-52" width="20" height="14" fill="#e9ecef" stroke="' + INK + '" stroke-width="2"/><rect x="14" y="-52" width="20" height="14" fill="#e9ecef" stroke="' + INK + '" stroke-width="2"/></g>'; }
  function wave(x0, x1, y, amp, len, t, col, w, sp) { var d = "M" + x0 + " " + f(y + amp * Math.sin(-t * (sp || 6))); for (var x = x0; x <= x1; x += 4) d += " L" + x + " " + f(y + amp * Math.sin((x - x0) / len * 2 * Math.PI - t * (sp || 6))); return '<path d="' + d + '" stroke="' + (col || YEL) + '" stroke-width="' + (w || 3) + '" fill="none" stroke-linecap="round"/>'; }
  function fork(x, y, t, o) {   // a fork lying on the plate, tines to the right; spark: arcs jumping between the tines
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(-8) scale(' + (o.s || 1) + ')"><path d="M-70 -3 L10 -4 L10 4 L-70 3 Z" fill="url(#gMag)" stroke="' + INK + '" stroke-width="1.6"/><path d="M10 -9 H22 V9 H10 Z" fill="url(#gMag)" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 4; k++) s += '<path d="M22 ' + (-8 + k * 5.3) + ' H50" stroke="#9aa2ac" stroke-width="3.4" stroke-linecap="round"/><path d="M22 ' + (-8 + k * 5.3) + ' H50" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".6"/>';
    if (o.spark) for (var j = 0; j < 4; j++) { var on = Math.sin(t * 23 + j * 2.1) > 0.2; if (!on) continue; var yy = -8 + j * 5.3, d = "M50 " + yy; for (var q = 1; q < 5; q++) d += " L" + f(50 + q * 5) + " " + f(yy + (hash(Math.floor(t * 30) + j * 7 + q) - 0.5) * 12); s += '<path d="' + d + '" stroke="#bfe8ff" stroke-width="2.4" fill="none"/><path d="' + d + '" stroke="#fff" stroke-width="1" fill="none"/><circle cx="52" cy="' + yy + '" r="5" fill="#bfe8ff" opacity=".6"/>'; }
    return s + '</g>'; }
  function person(x, y, t, mood, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#3a7ab8") + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 38, mood, t, o.look || 0) + (o.extra || '') + '</g>'; }
  function popcorn(x, y, k, t) { var s = ""; for (var i = 0; i < 9; i++) { var a = hash(i) * 6.28, r = 8 + k * (30 + hash(i + 3) * 60), px = x + Math.cos(a) * r + Math.sin(t * 5 + i) * 14 * k, py = y + Math.sin(a) * r * 0.6 - k * 40 * Math.sin(Math.PI * clamp(k)) + k * k * 30 - Math.abs(Math.sin(t * 7 + i * 1.7)) * 30 * k; s += k > hash(i + 9) * 0.6 ? '<g transform="translate(' + f(px) + ' ' + f(py) + ') rotate(' + f(t * 200 + i * 40) + ')"><circle r="7" fill="#fff6d8" stroke="' + INK + '" stroke-width="1.2"/><circle cx="5" cy="-3" r="5" fill="#fffbe6" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-4" cy="4" r="5" fill="#fffbe6" stroke="' + INK + '" stroke-width="1.2"/></g>' : '<ellipse cx="' + f(x + (hash(i) - 0.5) * 30) + '" cy="' + f(y + (hash(i + 1) - 0.5) * 10) + '" rx="4" ry="3" fill="#e2b035" stroke="' + INK + '" stroke-width="1"/>'; } return s; }
  function molField(x, y, w, h, t, sp, n, o) {   // a crowd of water molecules jiggling (sp = speed), turning with the field (o.field angle)
    var s = ""; for (var i = 0; i < (n || 20); i++) { var px = x + hash(i) * w + Math.sin(t * sp * 3 + i) * sp * 4, py = y + hash(i + 5) * h + Math.cos(t * sp * 2.6 + i * 1.3) * sp * 4, a = o && o.field != null ? o.field + Math.sin(t * 9 + i) * 0.3 : hash(i + 2) * 6.28 + t * sp * 0.6;
      s += mol(px, py, a, 0.55); } return s; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — you put your food in the microwave for two minutes and it comes out piping hot
  shot(0, function (u, d) { return [320, 170, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.6)), sec = Math.max(0, Math.round(120 * (1 - k))), s = kitchen(t) + microwave(320, 250, t, { on: k < 1 ? 1 : 0, time: Math.floor(sec / 60) + ":" + ("0" + sec % 60).slice(-2), hot: k });
    if (k >= 1) s += '<text x="460" y="70" style="font:800 22px Noto Serif;fill:' + RED + '">ding!</text>';
    return s + tag("دقيقتين", 140, 60, u, 0.3, -3, 17);
  });
  // 1 — how does it heat with no fire and no heating element?
  shot(1, function (u, d) { return [320, 175, lerp(1.05, 1.0, u / d)]; }, function (u, d, t) {
    var s = kitchen(t) + microwave(320, 250, t, { on: 1, time: "1:30" });
    s += '<g transform="translate(110 130)"><path d="M0 30 C-24 10 -10 -14 0 -30 C4 -10 22 -6 16 18 C26 8 26 -4 22 -12 C34 6 24 30 0 30 Z" fill="#ff7a2a" stroke="' + INK + '" stroke-width="2" transform="scale(' + f(1 + 0.08 * Math.sin(t * 9)) + ')"/></g>';
    s += '<g transform="translate(530 130)"><path d="M-30 -10 q10 -14 20 0 t20 0 t20 0" stroke="#d8352a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-30 6 q10 -14 20 0 t20 0 t20 0" stroke="#d8352a" stroke-width="6" fill="none" stroke-linecap="round"/></g>';
    var x = clamp((u - 0.6) / 0.4); s += '<path d="M80 100 l60 60 M140 100 l-60 60 M500 100 l60 60 M560 100 l-60 60" stroke="' + RED + '" stroke-width="8" stroke-linecap="round" opacity="' + f(x) + '"/>';
    return s + qmark(320, 50, t, 50) + tag("نار؟", 110, 200, u, 0.2, -3, 16) + tag("سخان؟", 530, 200, u, 0.5, 3, 16);
  });
  // 2 — and why does a forgotten fork inside throw sparks?
  shot(2, function (u, d) { return [lerp(300, 290, u / d), lerp(170, 150, u / d), lerp(1.1, 1.45, u / d)]; }, function (u, d, t) {
    return kitchen(t) + microwave(320, 250, t, { on: 1, time: "0:45", fork: true, spark: u > 0.6 }) + qmark(470, 60, t, 44) + tag("شرار!", 170, 70, u, 0.8, -3, 18, "#bfe0ff");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 175, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return kitchen(t) + microwave(320, 250, t, { on: 1, time: "1:00", hot: 0.6 }) + tag("إيه الحكاية؟", 320, 320, u, 0.1, -3, 26);
  });
  // 4 — before we start: everything is made of tiny bits called molecules (a lens over a glass of water)
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.2)), s = graphPaper(t) + '<g transform="translate(160 300)"><path d="M-36 -130 L-28 0 H28 L36 -130 Z" fill="#cfe6f2" stroke="' + INK + '" stroke-width="2.4" opacity=".9"/><path d="M-34 -100 L-28 -2 H28 L34 -100 Z" fill="' + CY + '" opacity=".6"/></g>';
    s += '<circle cx="160" cy="250" r="16" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M174 244 L' + f(lerp(180, 340, k)) + ' ' + f(lerp(240, 170, k)) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>';
    s += '<clipPath id="lensm"><circle cx="450" cy="170" r="' + f(140 * k) + '"/></clipPath><g clip-path="url(#lensm)"><rect x="300" y="20" width="300" height="300" fill="#cfe9f7"/>' + molField(330, 50, 240, 240, t, 1, 18) + '</g><circle cx="450" cy="170" r="' + f(140 * k) + '" fill="none" stroke="#9aa2ac" stroke-width="10"/>';
    return s + tag("الجزيئات", 450, 335, u, 1.2, 3, 17);
  });
  // 5 — molecules never stop, they jiggle all the time; jiggling faster means hotter (slow side vs fast side, thermometers)
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var fast = clamp((u - 1.2) / 1.0), s = graphPaper(t) + '<rect x="40" y="40" width="230" height="250" rx="10" fill="#dcecf6" stroke="' + INK + '" stroke-width="2"/><rect x="330" y="40" width="230" height="250" rx="10" fill="#f8dccf" stroke="' + INK + '" stroke-width="2"/>';
    s += molField(60, 60, 190, 210, t, 0.5, 10) + molField(350, 60, 190, 210, t, 0.5 + 3 * fast, 10);
    s += thermo(292, 290, 0.3, "", t, BLUE) + thermo(584, 290, lerp(0.3, 0.9, fast), "", t, fast > 0.5 ? RED : BLUE);
    return s + tag("بتتهز", 155, 330, u, 0.3, -3, 16, "#bfe0ff") + tag("أسرع = أسخن", 445, 330, u, 1.4, 3, 16, "#ffb08a");
  });
  // 6 — and our food? rice, vegetables and chicken, all full of water
  shot(6, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + plate(320, 220, t, { s: 2.6, spin: 0.2 * Math.sin(t * 0.8) });
    for (var k = 0; k < 10; k++) { var ph = (t * 0.6 + k / 10) % 1; s += '<ellipse cx="' + f(220 + hash(k) * 200) + '" cy="' + f(190 - ph * 60) + '" rx="3" ry="4.5" fill="' + CY + '" stroke="#2f6f9f" stroke-width=".8" opacity="' + f(Math.sin(Math.PI * ph)) + '"/>'; }
    return s + tag("رز", 210, 80, u, 0.4, -3, 16) + tag("خضار", 330, 60, u, 0.8, 2, 16) + tag("فراخ", 450, 80, u, 1.2, 3, 16) + tag("مية!", 320, 330, u, 2.2, -2, 19, "#bfe0ff");
  });
  // 7 — a water molecule has a + end and a − end, like a tiny magnet
  shot(7, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + mol(230, 190, -Math.PI / 2 + 0.15 * Math.sin(t * 2), 4, { signs: true });
    s += magnet(480, 200, 6 * Math.sin(t * 1.5), 1.5) + '<text x="480" y="300" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:' + INK + '">=</text>';
    return s + tag("سالب", 120, 290, u, 0.4, -3, 16, "#ffb08a") + tag("موجب", 120, 70, u, 1.0, 3, 16, "#bfe0ff") + tag("مغناطيس صغير", 480, 60, u, 1.8, 3, 16);
  });
  // 8 — like a compass needle: the needle turns towards the magnet, the molecule turns towards the electricity
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var mx = 150 + 60 * Math.sin(t * 1.2), ang = Math.atan2(80 - 190, mx - 180) + Math.PI / 2, s = graphPaper(t) + magnet(mx, 70, 180, 0.8) + compass(180, 190, ang, t, 1.4);
    var side = Math.sin(t * 1.2) > 0 ? 1 : -1, ma = side > 0 ? 0 : Math.PI;
    s += '<rect x="380" y="70" width="16" height="220" rx="4" fill="' + (side > 0 ? RED : BLUE) + '" stroke="' + INK + '" stroke-width="2"/><text x="388" y="60" text-anchor="middle" style="font:800 22px Noto Serif;fill:' + (side > 0 ? RED : BLUE) + '">' + (side > 0 ? "+" : "−") + '</text>';
    s += mol(500, 180, ma + 0.2 * Math.sin(t * 6), 2.6, { signs: true });
    return s + tag("البوصلة", 180, 330, u, 0.3, -3, 16) + tag("الجزيء", 500, 330, u, 1.4, 3, 16);
  });
  // 9 — the microwave sends waves whose electricity flips 2,450,000,000 times a second
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = dark(t) + wave(20, 620, 170, 60, 160, t, YEL, 4, 8);
    for (var x = 40; x < 620; x += 40) { var v = Math.sin((x - 20) / 160 * 2 * Math.PI - t * 8) * 50; s += '<path d="M' + x + ' 170 v' + f(-v) + '" stroke="' + (v > 0 ? RED : BLUE) + '" stroke-width="3" opacity=".7"/>'; }
    var n = Math.round(lerp(0, 2450000000, clamp(u / (d - 0.4)))); s += '<g transform="translate(320 300)"><rect x="-150" y="-26" width="300" height="48" rx="12" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 22px Noto Serif;fill:' + YEL + ';direction:ltr">' + n.toLocaleString("en") + '</text></g>';
    return s + tag("مرة في الثانية!", 320, 40, u, 1.6, -2, 16);
  });
  // 10 — so the molecule tries to turn with it, back and forth, bumping into its neighbours
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var a = Math.sin(t * 6) * 1.2, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/>' + wave(20, 620, 40, 14, 120, t, YEL, 2, 8);
    s += mol(320, 190, a, 3.2, { signs: true });
    [[180, 120], [460, 120], [180, 260], [460, 260], [320, 60], [320, 320]].forEach(function (p, i) { var hit = Math.max(0, Math.sin(t * 6 + i)) * 10; s += mol(p[0] + (p[0] < 320 ? -hit : p[0] > 320 ? hit : 0), p[1] + (p[1] < 190 ? -hit : p[1] > 190 ? hit : 0), hash(i) * 6 + Math.sin(t * 6 + i) * 0.8, 1.6); });
    var cur = '<path d="M' + f(320 + Math.cos(a) * 80) + ' ' + f(190 + Math.sin(a) * 80) + ' A80 80 0 0 1 ' + f(320 + Math.cos(a + 0.6) * 80) + ' ' + f(190 + Math.sin(a + 0.6) * 80) + '" stroke="' + YEL + '" stroke-width="3" fill="none"/>';
    return s + cur + tag("رايح جاي", 560, 190, u, 0.6, 3, 16);
  });
  // 11 — molecules jiggling faster: hotter food
  shot(11, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 1.6), s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + (k > 0.5 ? "#3a1a10" : "#0f2a3a") + '"/>' + molField(60, 40, 460, 280, t, 0.6 + 3 * k, 26);
    return s + thermo(580, 300, lerp(0.35, 0.95, k), k > 0.5 ? "سخن!" : "", t) + tag("أسرع = أسخن", 300, 330, u, 1.0, -2, 18, "#ffb08a");
  });
  // 12 — the waves come from a part called the magnetron, through a metal pipe into the box (cut open)
  shot(12, function (u, d) { return [lerp(330, 380, ease(clamp(u / d))), 140, lerp(1.0, 1.25, ease(clamp(u / d)))]; }, function (u, d, t) {
    var s = graphPaper(t) + cutaway(300, 300, t, { glow: 1, food: true });
    for (var k = 0; k < 4; k++) { var ph = (t * 0.8 + k / 4) % 1, px = lerp(468, 360, ph); s += wave(px - 20, px + 20, 88 - 2, 4, 14, t, YEL, 2.4).replace('stroke-width="2.4"', 'stroke-width="2.4" opacity="' + f(1 - ph * 0.5) + '"'); }
    return s + tag("المغنطرون", 520, 60, u, 0.4, 3, 17, "#ffb08a") + tag("ماسورة معدن", 330, 40, u, 1.4, -3, 15);
  });
  // 13 — inside the box the waves keep bouncing off the walls until the food soaks them up
  shot(13, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + cutaway(300, 300, t, { glow: 1, hot: clamp(u / 3) });
    for (var b = 0; b < 4; b++) { var ph = (t * 0.35 + b / 4) % 1, pts = [[460, 90], [200, 140], [430, 210], [270, 250], [320, 262]], seg = ph * 4, i = Math.floor(seg), fr = seg - i; if (i >= 4) continue; var a = pts[i], c = pts[i + 1], x = lerp(a[0], c[0], fr), y = lerp(a[1], c[1], fr); s += '<path d="M' + a[0] + ' ' + a[1] + ' L' + f(x) + ' ' + f(y) + '" stroke="' + YEL + '" stroke-width="3" stroke-dasharray="6 4" opacity=".8"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
    return s + tag("بتخبط في الحيطان", 170, 60, u, 0.4, -3, 16) + tag("الأكل بيشربها", 470, 330, u, 2.0, 3, 15);
  });
  // 14 — why does the turntable turn? the waves meet each other: hot spots and cold spots on the floor
  shot(14, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<path d="M60 300 L180 120 H580 L460 300 Z" fill="#e9e6de" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { var hot = (r + c) % 2 === 0, cx = 150 + c * 100 + r * 40 - 40, cy = 270 - r * 60, pul = 1 + 0.12 * Math.sin(t * 4 + r + c); s += '<ellipse cx="' + f(cx + r * 0) + '" cy="' + f(cy) + '" rx="' + f(46 * pul) + '" ry="' + f(22 * pul) + '" fill="url(#' + (hot ? "gHotC" : "gColdC") + ')"/>'; }
    s += wave(170, 560, 100, 12, 90, t, YEL, 2.6) + wave(170, 560, 100, 12, 90, -t, "#ffb08a", 2.6);
    return s + tag("سخن", 140, 330, u, 0.8, -3, 16, "#ffb08a") + tag("بارد", 500, 330, u, 1.4, 3, 16, "#bfe0ff");
  });
  // 15 — so the turntable turns, so every bit of the food passes through the hot spots
  shot(15, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<path d="M60 300 L180 120 H580 L460 300 Z" fill="#e9e6de" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { var hot = (r + c) % 2 === 0, cx = 150 + c * 100 + r * 40 - 40, cy = 270 - r * 60; s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="46" ry="22" fill="url(#' + (hot ? "gHotC" : "gColdC") + ')"/>'; }
    s += '<ellipse cx="320" cy="214" rx="120" ry="34" fill="#cfe6f2" stroke="' + INK + '" stroke-width="2" opacity=".85"/>' + plate(320, 210, t, { s: 1.3, spin: t * 1.6, hot: 0.7 });
    s += '<path d="M200 250 A120 34 0 0 0 440 250" stroke="' + INK + '" stroke-width="2.4" fill="none" marker-end="url(#ar)"/><path d="M432 244 l10 6 l-10 6" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    return s + tag("بتلف", 320, 330, u, 0.4, -2, 18);
  });
  // 16 — and the fork? metal reflects the waves, and the electricity bunches up in its sharp tines and sparks
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#141a24"/>' + fork(300, 190, t, { s: 3, spark: u > 1.0 });
    for (var k = 0; k < 4; k++) { var ph = (t * 0.9 + k / 4) % 1, x = lerp(-40, 190, ph); s += wave(x - 30, x + 30, 90 + k * 40, 6, 24, t, YEL, 2.4); var bx = lerp(190, 0, ph); if (ph > 0.5) s += wave(bx - 30, bx + 30, 110 + k * 40, 6, 24, t, "#ffb08a", 2); }
    return s + tag("بيعكس الموجات", 140, 40, u, 0.4, -3, 15) + tag("شرار!", 500, 300, u, 1.2, 3, 18, "#bfe0ff");
  });
  // 17 — the waves only get one or two centimetres into the food (a piece cut open, the hot outer layer)
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 1.4), s = graphPaper(t) + '<path d="M120 280 C110 140 530 140 520 280 Z" fill="#d97a4a" stroke="' + INK + '" stroke-width="3"/><path d="M150 280 C146 176 494 176 490 280 Z" fill="#f2c79a" opacity="' + f(1 - 0.6 * k) + '"/><path d="M150 280 C146 176 494 176 490 280 Z" fill="#f2c79a" opacity="' + f(0.4 * k) + '"/>';
    s += '<path d="M120 280 C110 140 530 140 520 280" fill="none" stroke="' + RED + '" stroke-width="' + f(4 + 20 * k) + '" opacity=".55"/>';
    for (var w = 0; w < 5; w++) { var ph = (t * 0.8 + w / 5) % 1; s += wave(lerp(40, 120, ph) - 20, lerp(40, 120, ph) + 20, 180 + w * 18, 5, 18, t, YEL, 2.2); }
    s += '<path d="M520 230 h44 M520 248 h44 M556 222 v32" stroke="' + INK + '" stroke-width="2"/><text x="580" y="244" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">٢ سم</text>';
    return s + tag("سنتيمتر أو اتنين", 320, 70, u, 0.6, -2, 16);
  });
  // 18 — the outside gets very hot, the middle waits for the heat to crawl in: wait a minute before you eat
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.4)), s = graphPaper(t) + '<path d="M120 280 C110 140 530 140 520 280 Z" fill="#d97a4a" stroke="' + INK + '" stroke-width="3"/>';
    for (var r = 0; r < 6; r++) { var ins = r / 6, heat = clamp(k * 1.3 - ins * 0.9); s += '<path d="M' + f(120 + 30 * r) + ' 280 C' + f(110 + 32 * r) + ' ' + f(140 + 22 * r) + ' ' + f(530 - 32 * r) + ' ' + f(140 + 22 * r) + ' ' + f(520 - 30 * r) + ' 280 Z" fill="' + (heat > 0.4 ? "#e0583a" : "#f2c79a") + '" opacity="' + f(0.35 + 0.5 * heat) + '"/>'; }
    for (var a = 0; a < 6; a++) { var ph = (t * 0.6 + a / 6) % 1, ang = Math.PI * (0.15 + a * 0.14), x0 = 320 + Math.cos(ang) * 190, y0 = 280 - Math.sin(ang) * 120; s += '<path d="M' + f(lerp(x0, 320, ph * 0.5)) + ' ' + f(lerp(y0, 250, ph * 0.5)) + ' l' + f(-Math.cos(ang) * 14) + ' ' + f(Math.sin(ang) * 10) + '" stroke="' + RED + '" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - ph) + '"/>'; }
    s += '<g transform="translate(560 90)"><circle r="34" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 V-24" stroke="' + INK + '" stroke-width="3" transform="rotate(' + f(t * 120) + ')"/><circle r="3" fill="' + INK + '"/></g>';
    return s + steam(320, 160, t, 80, 0.8) + tag("استنى دقيقة", 140, 60, u, 1.6, -3, 17);
  });
  // 19 — the strange part: the microwave was discovered by accident, in 1945 (a radar dish, the year counter)
  shot(19, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="270" width="1440" height="300" fill="#8a7a5a"/>';
    s += '<g transform="translate(420 250)"><path d="M-8 0 L-16 60 M8 0 L16 60" stroke="' + INK + '" stroke-width="5"/><g transform="rotate(' + f(-20 + 40 * Math.sin(t * 1.6)) + ')"><path d="M-90 -30 A100 50 0 0 0 90 -30 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="3"/><path d="M0 -30 V-90" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="-90" r="6" fill="' + RED + '"/></g></g>';
    for (var r = 1; r <= 3; r++) { var ph = (t * 1.1 + r / 3) % 1; s += '<path d="M' + f(420 - 40 - ph * 80) + ' ' + f(120 - ph * 60) + ' a' + f(40 + ph * 80) + ' ' + f(40 + ph * 80) + ' 0 0 1 ' + f(80 + ph * 160) + ' 0" stroke="' + YEL + '" stroke-width="5" fill="none" opacity="' + f(1 - ph) + '"/>'; }
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".15"/>';
    var y = Math.round(lerp(2026, 1945, clamp(u / 1.6))); s += '<g transform="translate(150 70)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("بالصدفة!", 150, 200, u, 1.8, -3, 19);
  });
  // 20 — an American engineer, Percy Spencer, standing by a radar set, found the chocolate had melted in his pocket
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var melt = clamp((u - 1.4) / 1.6), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="270" width="1440" height="300" fill="#8a7a5a"/>' + cutaway(520, 290, t, { s: 0.45, glow: 1, food: false }).replace("", "");
    s += person(250, 150, t, melt > 0.5 ? "shock" : "n", { col: "#6a6a5a", s: 1.1, look: 1, extra: '<rect x="-30" y="-30" width="22" height="13" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="6" y="-30" width="22" height="13" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' });
    s += '<g transform="translate(290 220)"><rect x="-18" y="-6" width="36" height="34" fill="#5a5a4a" stroke="' + INK + '" stroke-width="2"/><rect x="-12" y="' + f(-24 + 14 * melt) + '" width="24" height="' + f(20 - 8 * melt) + '" rx="' + f(2 + 6 * melt) + '" fill="url(#gChoc)" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 3; k++) if (melt > 0.3) s += '<path d="M' + (-10 + k * 9) + ' 28 q2 ' + f(8 + 10 * melt + 3 * Math.sin(t * 3 + k)) + ' 0 ' + f(14 + 12 * melt) + '" stroke="#5a3418" stroke-width="5" stroke-linecap="round" fill="none"/>';
    s += '</g>' + '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".12"/>';
    return s + tag("بيرسي سبنسر", 130, 60, u, 0.5, -3, 16) + tag("ساحت!", 360, 300, u, 2.2, 3, 18, "#ffb08a");
  });
  // 21 — then he tried popcorn kernels, and they popped in front of him
  shot(21, function (u, d) { return [lerp(300, 260, u / d), lerp(180, 200, u / d), lerp(1.0, 1.35, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.8), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="270" width="1440" height="300" fill="#8a7a5a"/>' + cutaway(470, 290, t, { s: 0.55, glow: 1, food: false });
    s += '<rect x="180" y="230" width="140" height="40" rx="4" fill="#8a5a30" stroke="' + INK + '" stroke-width="2"/><path d="M210 230 L220 180 H280 L290 230 Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>' + popcorn(250, 200, k, t);
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".12"/>' + tag("فشار!", 160, 80, u, 1.2, -3, 19);
  });
  // 22 — the first microwave sold was as tall as a man and weighed about 340 kilos
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="300" width="1440" height="300" fill="#8a7a5a"/>';
    s += '<g transform="translate(260 300)"><rect x="-70" y="-270" width="140" height="270" rx="6" fill="url(#gMag)" stroke="' + INK + '" stroke-width="3"/><rect x="-54" y="-200" width="108" height="70" rx="4" fill="url(#gWin)" stroke="' + INK + '" stroke-width="2"/><rect x="-54" y="-250" width="108" height="30" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><text y="-229" text-anchor="middle" style="font:800 12px Noto Serif;fill:#fff">RADARANGE</text>';
    for (var k = 0; k < 6; k++) s += '<circle cx="' + (-40 + k * 16) + '" cy="-110" r="5" fill="#fbfaf6" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '</g>' + person(420, 150, t, "shock", { col: "#6a6a5a", s: 1.05, look: -1 });
    s += '<path d="M180 30 V300 M172 30 h16 M172 300 h16" stroke="' + INK + '" stroke-width="2"/>';
    var kg = Math.round(lerp(0, 340, clamp(u / 2.4))); s += '<g transform="translate(540 70)"><rect x="-70" y="-22" width="140" height="42" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + YEL + '">' + kg + ' كيلو</text></g>';
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".12"/>' + tag("قد الراجل!", 120, 160, u, 0.6, -3, 16);
  });
  // 23 — in short: the magnetron makes waves, the walls throw them onto the food, its water jiggles and heats (numbered parts)
  shot(23, function (u, d) { return [320, 175, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + cutaway(300, 300, t, { glow: 1, hot: 0.8 });
    var N = [[470, 120, "1"], [180, 110, "2"], [320, 230, "3"]];
    N.forEach(function (n, i) { var on = clamp((u - 0.4 - i * 1.4) / 0.4); s += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + f(16 + 3 * Math.sin(t * 5 + i) * on) + '" fill="' + (on > 0.5 ? YEL : "#fbfaf6") + '" stroke="' + INK + '" stroke-width="2.4"/><text x="' + n[0] + '" y="' + (n[1] + 7) + '" text-anchor="middle" style="font:800 18px Noto Serif;fill:' + INK + '">' + n[2] + '</text>'; });
    return s + tag("موجات", 560, 60, u, 0.4, 3, 15) + tag("الحيطان", 120, 40, u, 1.8, -3, 15) + tag("المية بتتهز", 470, 330, u, 3.2, 3, 15);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    return kitchen(t) + microwave(300, 250, t, { on: 1, time: "0:30", hot: 0.6 }) + qmark(520, 70, t, 56) + qmark(560, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { microwave: microwave, cutaway: cutaway, plate: plate, mol: mol, compass: compass, magnet: magnet, wave: wave, fork: fork, steam: steam, tag: tag, kitchen: kitchen, thermo: thermo };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
