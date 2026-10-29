/* Framed close-ups for the paper version, redrawn every frame (ink on paper): molecules jiggling (4–5), the plate of food
   full of water (6), the water molecule as a tiny magnet (7), the compass needle (8), the wave and 2,450,000,000 (9),
   the molecule turning back and forth (10), faster = hotter (11), the fork sparking (16), the waves only 2 cm deep (17),
   the heat crawling to the middle (18), 1945 and the radar (19), Percy Spencer's chocolate (20), popcorn (21), the Radarange (22). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2620", RED = "#c15636", BLU = "#3c6484", GOLD = "#c9a04e", PAPER = "#fbfaf6", ORG = "#e2a92c";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.25 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  function mol(x, y, a, s, signs) {   // oxygen with two hydrogens at 104.5°
    var g = ""; [a + 0.912, a - 0.912].forEach(function (b) { var hx = x + Math.cos(b) * 17 * s, hy = y + Math.sin(b) * 17 * s; g += '<circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="' + f(8 * s) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + (signs ? '<text x="' + f(hx) + '" y="' + f(hy + 4 * s) + '" text-anchor="middle" style="font:700 ' + f(11 * s) + 'px var(--font-numeral);fill:' + BLU + '">+</text>' : ''); });
    return g + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(13 * s) + '" fill="' + BLU + '" stroke="' + INK + '" stroke-width="1.6"/>' + (signs ? '<text x="' + f(x) + '" y="' + f(y + 5 * s) + '" text-anchor="middle" style="font:700 ' + f(14 * s) + 'px var(--font-numeral);fill:#fff">−</text>' : '<circle cx="' + f(x - 4 * s) + '" cy="' + f(y - 4 * s) + '" r="' + f(3.4 * s) + '" fill="#fff" opacity=".45"/>'); }
  function crowd(x, y, w, h, t, sp, n, field) { var s = ""; for (var i = 0; i < n; i++) { var px = x + hash(i) * w + Math.sin(t * sp * 3 + i) * sp * 3, py = y + hash(i + 5) * h + Math.cos(t * sp * 2.6 + i * 1.3) * sp * 3; s += mol(px, py, field != null ? field + Math.sin(t * 8 + i) * 0.35 : hash(i + 2) * 6.28 + t * sp * 0.5, 0.6); } return s; }
  function thermo(x, y, v, col) { var h = 110, lv = clamp(v) * (h - 18); return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-8" y="' + (-h) + '" width="16" height="' + h + '" rx="8" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/><circle cy="6" r="12" fill="' + col + '" stroke="' + INK + '" stroke-width="1.8"/><rect x="-3" y="' + f(-lv) + '" width="6" height="' + f(lv + 6) + '" fill="' + col + '"/></g>'; }
  function wave(x0, x1, y, amp, len, t, col, w) { var d = "M" + x0 + " " + f(y); for (var x = x0; x <= x1; x += 3) d += " L" + x + " " + f(y + amp * Math.sin((x - x0) / len * 6.283 - t * 8)); return '<path d="' + d + '" stroke="' + (col || ORG) + '" stroke-width="' + (w || 2.4) + '" fill="none" stroke-linecap="round"/>'; }
  function plate(x, y, s, a) { var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse rx="76" ry="22" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/><ellipse rx="54" ry="14" cy="-2" fill="#f1efe8" stroke="#c9c4b8"/>';
    g += '<ellipse cx="' + f(-24 + 4 * Math.sin(a)) + '" cy="-8" rx="24" ry="11" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M8 -6 C6 -22 40 -24 44 -8 C38 0 14 2 8 -6 Z" fill="#d99a5a" stroke="' + INK + '" stroke-width="1.4"/><circle cx="-2" cy="4" r="5" fill="#7aae5a" stroke="' + INK + '"/><circle cx="8" cy="6" r="5" fill="#7aae5a" stroke="' + INK + '"/><rect x="-14" y="0" width="9" height="5" rx="2" fill="#e2833a" stroke="' + INK + '"/>';
    return g + '</g>'; }
  function person(x, y, s, mood, t, extra) { var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 90 C-32 34 -20 20 0 20 C20 20 32 34 30 90 Z" fill="#8a8572" stroke="' + INK + '" stroke-width="2"/><circle cy="-6" r="24" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>';
    g += mood === "shock" ? '<circle cx="-8" cy="-8" r="4" fill="' + INK + '"/><circle cx="8" cy="-8" r="4" fill="' + INK + '"/><ellipse cx="0" cy="6" rx="5" ry="6" fill="' + INK + '"/>' : '<circle cx="-8" cy="-8" r="2.6" fill="' + INK + '"/><circle cx="8" cy="-8" r="2.6" fill="' + INK + '"/><path d="M-7 5 q7 4 14 0" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    return g + (extra || '') + '</g>'; }
  function cutBox(x, y, s, t) {   // a small cut-open microwave: cavity, magnetron with a glow, waves
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 0 H130 V-80 H0 Z" fill="#e9e6de" stroke="' + INK + '" stroke-width="1.8"/><path d="M90 0 V-80" stroke="' + INK + '" stroke-width="1.4"/><rect x="98" y="-62" width="24" height="36" fill="#a7aeb6" stroke="' + INK + '" stroke-width="1.4"/><circle cx="110" cy="-44" r="' + f(14 + 2 * Math.sin(t * 9)) + '" fill="#ffd27a" opacity=".4"/>';
    return g + wave(8, 86, -46, 6, 22, t, ORG, 2) + '</g>'; }
  var P = [
    [4, function (t, u) {   // a glass of water and a lens: tiny molecules
      var k = clamp(u / 1.2), s = '<path d="M60 250 L70 400 H130 L140 250 Z" fill="#cfe1ec" stroke="' + INK + '" stroke-width="2"/><path d="M64 290 L70 398 H130 L136 290 Z" fill="#a5cfe6" opacity=".7"/><circle cx="100" cy="330" r="14" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      s += '<path d="M112 322 L' + f(lerp(120, 200, k)) + ' ' + f(lerp(316, 250, k)) + '" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 4"/><clipPath id="pl4"><circle cx="250" cy="240" r="' + f(95 * k) + '"/></clipPath><g clip-path="url(#pl4)"><rect x="140" y="130" width="220" height="220" fill="#e3eef4"/>' + crowd(170, 160, 160, 160, t, 1, 14) + '</g><circle cx="250" cy="240" r="' + f(95 * k) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
      return s + label(180, 100, "أي حاجة معمولة من…", INK, 17) + (u > 1.4 ? label(250, 370, "الجزيئات", BLU, 19) : "");
    }],
    [5, function (t, u) {   // they never stop: jiggling faster = hotter
      var fast = clamp((u - 2.0) / 1.2), s = '<rect x="30" y="150" width="140" height="200" rx="6" fill="#e3eef4" stroke="' + INK + '" stroke-width="2"/><rect x="190" y="150" width="140" height="200" rx="6" fill="#f3dccd" stroke="' + INK + '" stroke-width="2"/>';
      s += crowd(45, 170, 110, 160, t, 0.5, 7) + crowd(205, 170, 110, 160, t, 0.5 + 3 * fast, 7) + thermo(100, 470, 0.3, BLU) + thermo(260, 470, lerp(0.3, 0.9, fast), fast > 0.5 ? RED : BLU);
      return s + label(180, 100, "عمرها ما بتقف…", INK, 17) + (fast > 0.3 ? label(180, 128, "أسرع = أسخن", RED, 17) : "");
    }],
    [6, function (t, u) {   // rice, vegetables and a piece of chicken: full of water
      var s = plate(180, 290, 2.0, t);
      for (var k = 0; k < 9; k++) { var ph = (t * 0.6 + k / 9) % 1; s += '<ellipse cx="' + f(90 + hash(k) * 180) + '" cy="' + f(260 - ph * 70) + '" rx="3" ry="4.4" fill="#a5cfe6" stroke="' + BLU + '" opacity="' + f(Math.sin(Math.PI * ph)) + '"/>'; }
      return s + label(180, 100, "الرز والخضار والفراخ", INK, 17) + (u > 2.4 ? label(180, 420, "كلهم مليانين مية", BLU, 18) : "");
    }],
    [7, function (t, u) {   // the water molecule: + end and − end, like a tiny magnet
      var s = mol(180 + 8 * Math.sin(t * 1.7), 260 + 8 * Math.cos(t * 2.3), -Math.PI / 2 + 0.35 * Math.sin(t * 2.5), 4 + 0.15 * Math.sin(t * 4), true);
      if (u > 1.6) s += '<g transform="translate(180 410) rotate(' + f(4 * Math.sin(t * 2)) + ')"><path d="M-30 -30 V6 A30 30 0 0 0 30 6 V-30 H12 V6 A12 12 0 0 1 -12 6 V-30 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><rect x="-30" y="-40" width="18" height="10" fill="#e9ecef" stroke="' + INK + '"/><rect x="12" y="-40" width="18" height="10" fill="#e9ecef" stroke="' + INK + '"/></g>';
      return s + label(80, 170, "موجب", BLU, 15) + label(80, 330, "سالب", RED, 15) + label(180, 100, "جزيء المية", INK, 17);
    }],
    [8, function (t, u) {   // the compass needle turns towards the magnet; the molecule towards the electricity
      var mx = 90 + 50 * Math.sin(t * 1.2), ang = Math.atan2(150 - 250, mx - 110) + Math.PI / 2, s = '<g transform="translate(' + f(mx) + ' 150) rotate(180) scale(.6)"><path d="M-30 -30 V6 A30 30 0 0 0 30 6 V-30 H12 V6 A12 12 0 0 1 -12 6 V-30 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/></g>';
      s += '<g transform="translate(110 260)"><circle r="54" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2.4"/><circle r="46" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/><g transform="rotate(' + f(ang * 180 / Math.PI) + ')"><path d="M0 -38 L7 0 L-7 0 Z" fill="' + RED + '" stroke="' + INK + '"/><path d="M0 38 L7 0 L-7 0 Z" fill="#c9ced4" stroke="' + INK + '"/></g><circle r="3.4" fill="' + INK + '"/></g>';
      var side = Math.sin(t * 1.2) > 0; s += '<rect x="220" y="190" width="12" height="150" rx="3" fill="' + (side ? RED : BLU) + '" stroke="' + INK + '" stroke-width="1.6"/>' + mol(290, 265, (side ? Math.PI : 0) + 0.2 * Math.sin(t * 6), 1.6, true);
      return s + label(180, 100, "زي إبرة البوصلة", INK, 17) + label(110, 350, "الإبرة ← المغناطيس", INK, 12) + label(280, 360, "الجزيء ← الكهربا", BLU, 12);
    }],
    [9, function (t, u) {   // the wave: electricity flipping 2,450,000,000 times a second
      var s = wave(20, 340, 260, 50, 120, t, ORG, 3);
      for (var x = 30; x < 340; x += 26) { var v = Math.sin((x - 20) / 120 * 6.283 - t * 8) * 40; s += '<path d="M' + x + ' 260 v' + f(-v) + '" stroke="' + (v > 0 ? RED : BLU) + '" stroke-width="2.4" opacity=".75"/>'; }
      var n = Math.round(lerp(0, 2450000000, clamp(u / 3))); s += '<text x="180" y="400" text-anchor="middle" style="font:700 30px var(--font-numeral);fill:' + RED + ';direction:ltr">' + n.toLocaleString("en") + '</text>';
      return s + label(180, 100, "كهربا بتقلب اتجاهها…", INK, 17) + label(180, 432, "مرة في الثانية", INK, 15);
    }],
    [10, function (t, u) {   // the molecule tries to turn with it, back and forth, and bumps its neighbours
      var a = Math.sin(t * 6) * 1.1, s = wave(20, 340, 150, 10, 80, t, ORG, 2) + mol(180, 280, a, 3, true);
      [[80, 200], [280, 200], [80, 360], [280, 360]].forEach(function (p, i) { var hit = Math.max(0, Math.sin(t * 6 + i)) * 8; s += mol(p[0] + (p[0] < 180 ? -hit : hit), p[1] + (p[1] < 280 ? -hit : hit), hash(i) * 6 + Math.sin(t * 6 + i) * 0.8, 1.2); });
      return s + label(180, 100, "رايح جاي…", INK, 17) + label(180, 440, "ويخبط في اللي جنبه", RED, 15);
    }],
    [11, function (t, u) {   // faster = hotter
      var k = clamp(u / 1.4), s = '<rect x="30" y="150" width="240" height="250" rx="6" fill="' + (k > 0.5 ? "#f3dccd" : "#e3eef4") + '" stroke="' + INK + '" stroke-width="2"/>' + crowd(45, 165, 210, 220, t, 0.6 + 3 * k, 16) + thermo(310, 400, lerp(0.35, 0.95, k), k > 0.5 ? RED : BLU);
      return s + label(180, 100, "جزيئات بتتهز أسرع…", INK, 17) + (k > 0.6 ? label(180, 440, "يعني أكل أسخن!", RED, 19) : "");
    }],
    [16, function (t, u) {   // the fork: metal reflects, the electricity bunches up in the tines and sparks
      var s = '<g transform="translate(70 290) rotate(-8) scale(2.4)"><path d="M-20 -3 L50 -4 L50 4 L-20 3 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1"/><path d="M50 -9 H60 V9 H50 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1"/>';
      for (var k = 0; k < 4; k++) s += '<path d="M60 ' + (-8 + k * 5.3) + ' H82" stroke="#9aa2ac" stroke-width="3" stroke-linecap="round"/>';
      if (u > 1.2) for (var j = 0; j < 4; j++) { if (Math.sin(t * 23 + j * 2.1) < 0.2) continue; var yy = -8 + j * 5.3, d = "M82 " + yy; for (var q = 1; q < 5; q++) d += " L" + f(82 + q * 4) + " " + f(yy + (hash(Math.floor(t * 30) + j * 7 + q) - 0.5) * 10); s += '<path d="' + d + '" stroke="' + BLU + '" stroke-width="1.6" fill="none"/>'; }
      s += '</g>';
      for (var w = 0; w < 3; w++) { var ph = (t * 0.9 + w / 3) % 1; s += wave(f(lerp(20, 150, ph)) - 20, f(lerp(20, 150, ph)) + 20, 180 + w * 30, 5, 18, t, ORG, 2); }
      return s + label(180, 100, "المعدن بيعكس الموجات", INK, 16) + (u > 1.2 ? label(260, 410, "شرار!", BLU, 22) : "");
    }],
    [17, function (t, u) {   // the waves get only 1–2 cm into the food
      var k = clamp(u / 1.4), s = '<path d="M40 380 C30 200 330 200 320 380 Z" fill="#f2c79a" stroke="' + INK + '" stroke-width="2.4"/><path d="M40 380 C30 200 330 200 320 380" fill="none" stroke="' + RED + '" stroke-width="' + f(4 + 16 * k) + '" opacity=".5"/>';
      for (var w = 0; w < 4; w++) { var ph = (t * 0.8 + w / 4) % 1; s += wave(Math.round(lerp(10, 50, ph)), Math.round(lerp(10, 50, ph)) + 30, 260 + w * 26, 4, 14, t, ORG, 2); }
      s += '<path d="M300 280 h40 M300 300 h40 M334 274 v32" stroke="' + INK + '" stroke-width="1.6"/>';
      return s + label(180, 100, "الموجات بتدخل…", INK, 17) + label(300, 330, "١ - ٢ سم", RED, 15);
    }],
    [18, function (t, u) {   // the middle waits for the heat to crawl in
      var k = clamp(u / 5) * (0.9 + 0.1 * Math.sin(t * 3)), s = '<path d="M40 380 C30 200 330 200 320 380 Z" fill="#f2c79a" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var r = 0; r < 5; r++) { var heat = clamp(k * 1.4 - r * 0.22); s += '<path d="M' + (40 + 24 * r) + ' 380 C' + (30 + 26 * r) + ' ' + (200 + 20 * r) + ' ' + (330 - 26 * r) + ' ' + (200 + 20 * r) + ' ' + (320 - 24 * r) + ' 380 Z" fill="' + RED + '" opacity="' + f(0.15 + 0.35 * heat) + '"/>'; }
      s += '<g transform="translate(300 170)"><circle r="26" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 V-18" stroke="' + INK + '" stroke-width="2.4" transform="rotate(' + f(t * 120) + ')"/></g>';
      return s + label(160, 100, "الوسط بيستنى…", INK, 17) + (u > 3 ? label(180, 430, "استنى دقيقة!", RED, 19) : "");
    }],
    [19, function (t, u) {   // 1945, by accident, next to a radar
      var s = '<g transform="translate(180 330)"><path d="M-8 0 L-16 60 M8 0 L16 60" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(' + f(-18 + 22 * Math.sin(t * 0.8)) + ')"><path d="M-80 -24 A90 44 0 0 0 80 -24 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><path d="M0 -24 V-80" stroke="' + INK + '" stroke-width="2"/><circle cy="-80" r="5" fill="' + RED + '"/></g></g>';
      for (var r = 0; r < 3; r++) { var ph = (t * 0.6 + r / 3) % 1; s += '<path d="M' + f(140 - ph * 70) + ' ' + f(210 - ph * 50) + ' a' + f(40 + ph * 70) + ' ' + f(40 + ph * 70) + ' 0 0 1 ' + f(80 + ph * 140) + ' 0" stroke="' + ORG + '" stroke-width="2" fill="none" opacity="' + f(1 - ph) + '"/>'; }
      var y = Math.round(lerp(2026, 1945, clamp(u / 1.6))); s += '<text x="180" y="170" text-anchor="middle" style="font:700 38px var(--font-numeral);fill:' + RED + '">' + y + '</text>';
      return s + label(180, 100, "اتكشف بالصدفة!", INK, 18);
    }],
    [20, function (t, u) {   // Percy Spencer by the radar set: the chocolate melted in his pocket
      var melt = clamp((u - 1.6) / 1.6), s = cutBox(200, 420, 1.0, t) + person(110, 260, 1.4, melt > 0.5 ? "shock" : "n", t);
      s += '<g transform="translate(140 330)"><rect x="-16" y="-6" width="32" height="30" fill="#6a6656" stroke="' + INK + '" stroke-width="1.6"/><rect x="-10" y="' + f(-22 + 12 * melt) + '" width="20" height="' + f(18 - 6 * melt) + '" rx="' + f(2 + 5 * melt) + '" fill="#5a3418" stroke="' + INK + '"/>';
      for (var k = 0; k < 3; k++) if (melt > 0.3) s += '<path d="M' + (-8 + k * 8) + ' 24 q2 ' + f(6 + 10 * melt) + ' 0 ' + f(12 + 10 * melt) + '" stroke="#5a3418" stroke-width="4" stroke-linecap="round" fill="none"/>';
      return s + '</g>' + label(180, 100, "بيرسي سبنسر", INK, 18) + (melt > 0.5 ? label(250, 230, "الشوكولاتة ساحت!", RED, 15) : "");
    }],
    [21, function (t, u) {   // then popcorn kernels: they popped
      var k = clamp((u - 0.4) / 1.8), s = cutBox(200, 420, 1.0, t) + '<rect x="60" y="330" width="110" height="20" fill="#8a5a30" stroke="' + INK + '" stroke-width="1.6"/><path d="M80 330 L88 290 H142 L150 330 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var i = 0; i < 9; i++) { var a = hash(i) * 6.28, r = 6 + k * (30 + hash(i + 3) * 50), px = 115 + Math.cos(a) * r, py = 300 + Math.sin(a) * r * 0.6 - k * 50 * Math.sin(Math.PI * k); s += k > hash(i + 9) * 0.6 ? '<g transform="translate(' + f(px) + ' ' + f(py) + ') rotate(' + f(t * 180 + i * 40) + ')"><circle r="6" fill="#fff6d8" stroke="' + INK + '"/><circle cx="4" cy="-3" r="4.4" fill="#fffbe6" stroke="' + INK + '"/></g>' : '<ellipse cx="' + f(105 + hash(i) * 20) + '" cy="' + f(296 + hash(i + 1) * 8) + '" rx="3.4" ry="2.6" fill="' + ORG + '" stroke="' + INK + '"/>'; }
      return s + label(180, 100, "جرب حبات فشار…", INK, 18) + (k > 0.5 ? label(180, 220, "فاتفرقعت!", RED, 20) : "");
    }],
    [22, function (t, u) {   // the first one sold: as tall as a man, 340 kg
      var s = '<g transform="translate(120 420)"><rect x="-50" y="-230" width="100" height="230" rx="4" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><rect x="-38" y="-170" width="76" height="56" fill="#2b2f34" stroke="' + INK + '"/><rect x="-38" y="-216" width="76" height="24" fill="' + RED + '" stroke="' + INK + '"/><text y="-199" text-anchor="middle" style="font:700 9px var(--font-numeral);fill:#fff">RADARANGE</text></g>';
      s += person(260, 300, 1.45, "shock", t) + '<path d="M50 190 V420 M44 190 h12 M44 420 h12" stroke="' + INK + '" stroke-width="1.6"/>';
      var kg = Math.round(lerp(0, 340, clamp(u / 2.4))); s += '<text x="260" y="180" text-anchor="middle" style="font:700 34px var(--font-numeral);fill:' + RED + '">' + kg + '</text>' + label(260, 206, "كيلو", RED, 14);
      return s + label(180, 100, "أول مايكروويف اتباع", INK, 17);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
