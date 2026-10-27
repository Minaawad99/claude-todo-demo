/* Framed close-ups for the paper version, redrawn every frame (ink on paper):
   four satellites and the distance to each one fix where you are (6), what the phone sends: place + speed, no name (9),
   the map remembers every day: this street at five o'clock (14), the artist with 99 phones in a hand cart (18),
   and the map turning his empty street red (19). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2620", RED = "#d8452e", GRN = "#3fae5a", ORG = "#e2a92c", BLU = "#2f6f9f", GOLD = "#c9a04e";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  function sat(x, y, s, t, k) { var a = Math.sin(t * 0.6 + k) * 8, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + s + ')"><path d="M-40 0 H40" stroke="' + INK + '" stroke-width="2"/>';
    [-1, 1].forEach(function (e) { g += '<rect x="' + (e * 26 - 14) + '" y="-7" width="28" height="14" fill="#2a4a8a" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (e * 26 - 5) + ' -7 V7 M' + (e * 26 + 5) + ' -7 V7 M' + (e * 26 - 14) + ' 0 H' + (e * 26 + 14) + '" stroke="#8fb6e8" stroke-width=".8"/>'; });
    return g + '<rect x="-9" y="-9" width="18" height="16" rx="1.5" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-9 -2 H9 M-3 -9 V7" stroke="#8a6a30" stroke-width=".8"/><rect x="-6" y="7" width="12" height="4" fill="#d9d4c8" stroke="' + INK + '"/></g>'; }
  function phone(x, y, s, inner) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-40" y="-76" width="80" height="152" rx="12" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="-34" y="-64" width="68" height="124" rx="4" fill="#f4f1e8"/>' + (inner || "") + '<circle cy="68" r="4" fill="#5a6068"/></g>'; }
  function streetMap(x0, y0, w, h, red, t) {   // a small map tile: streets, one of them coloured by traffic
    var s = '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="#e9e4d8"/>';
    for (var i = 1; i < 4; i++) s += '<path d="M' + x0 + ' ' + f(y0 + i * h / 4) + ' H' + (x0 + w) + ' M' + f(x0 + i * w / 4) + ' ' + y0 + ' V' + (y0 + h) + '" stroke="#fff" stroke-width="5"/>';
    return s + '<path d="M' + x0 + ' ' + f(y0 + h / 2) + ' H' + (x0 + w) + '" stroke="' + (red > 0.5 ? RED : GRN) + '" stroke-width="6" opacity="' + f(0.5 + 0.5 * Math.abs(red - 0.5) * 2) + '"/>'; }
  var P = [
    [6, function (t, u) {   // trilateration: 4 satellites, a circle of distance from each, they meet where you are
      var me = [186, 330], S4 = [[70, 160], [290, 150], [110, 120], [250, 210]], s = '<rect x="30" y="250" width="300" height="150" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2"/>';
      for (var i = 1; i < 6; i++) s += '<path d="M30 ' + (250 + i * 25) + ' H330 M' + (30 + i * 50) + ' 250 V400" stroke="#fff" stroke-width="4"/>';
      S4.forEach(function (p, i) { var k = clamp((u - 0.3 - i * 0.5) * 2); if (k <= 0) return; var r = Math.hypot(me[0] - p[0], me[1] - p[1]);
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(r * k) + '" fill="none" stroke="' + [RED, BLU, GRN, ORG][i] + '" stroke-width="2.4" stroke-dasharray="6 4" opacity=".8"/>' + sat(p[0], p[1], 0.85, t, i) + '<path d="M' + p[0] + ' ' + (p[1] + 10) + ' L' + me[0] + ' ' + me[1] + '" stroke="' + [RED, BLU, GRN, ORG][i] + '" stroke-width="1.4" opacity=".5"/>'; });
      if (u > 2.4) s += '<path d="M' + me[0] + ' ' + (me[1] + 6) + ' C' + (me[0] - 14) + ' ' + (me[1] - 10) + ' ' + (me[0] - 12) + ' ' + (me[1] - 26) + ' ' + me[0] + ' ' + (me[1] - 26) + ' C' + (me[0] + 12) + ' ' + (me[1] - 26) + ' ' + (me[0] + 14) + ' ' + (me[1] - 10) + ' ' + me[0] + ' ' + (me[1] + 6) + ' Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + me[0] + '" cy="' + (me[1] - 14) + '" r="4.5" fill="#fff"/>';
      return s + label(180, 100, "4 أقمار… وبُعدك عن كل واحد", INK, 16) + (u > 2.4 ? label(180, 440, "إنت هنا بالظبط!", RED, 18) : "");
    }],
    [9, function (t, u) {   // what the phone sends, every few seconds, with no name
      var s = phone(110, 280, 1, streetMap(-34, -64, 68, 124, 0, t).replace(/x="-34"/, 'x="-34"') + '<circle cx="0" cy="-2" r="6" fill="' + RED + '" stroke="#fff" stroke-width="2"/>');
      var k = (t * 0.6) % 1, px = lerp(160, 290, k), py = lerp(250, 160, k);
      s += '<g transform="translate(' + f(px) + ' ' + f(py) + ')" opacity="' + f(1 - k * 0.4) + '"><rect x="-44" y="-30" width="88" height="60" rx="8" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/><text y="-10" text-anchor="middle" style="font:700 11px var(--font-sans);fill:' + INK + '">مكانك</text><text y="6" text-anchor="middle" style="font:700 11px var(--font-sans);fill:' + INK + '">سرعتك: 60</text><text y="22" text-anchor="middle" style="font:700 10px var(--font-sans);fill:' + RED + ';text-decoration:line-through">الاسم</text></g>';
      s += '<path d="M260 140 C280 110 320 110 330 140 C350 140 350 166 330 166 H262 C244 166 244 140 260 140 Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>';
      return s + label(180, 100, "كل كام ثانية…", INK, 17) + (u > 2.2 ? label(250, 400, "من غير اسمك", RED, 17) : "");
    }],
    [14, function (t, u) {   // the map remembers: speed on this street through the day, the 5 o'clock dip
      var s = '<g transform="translate(90 170)"><circle r="42" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>'; for (var h = 0; h < 12; h++) s += '<path d="M' + f(Math.sin(h * 0.5236) * 34) + ' ' + f(-Math.cos(h * 0.5236) * 34) + ' L' + f(Math.sin(h * 0.5236) * 39) + ' ' + f(-Math.cos(h * 0.5236) * 39) + '" stroke="' + INK + '" stroke-width="2"/>';
      var hr = lerp(0, 5, clamp(u / 2.4)) * 0.5236; s += '<path d="M0 0 L' + f(Math.sin(hr) * 22) + ' ' + f(-Math.cos(hr) * 22) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(hr * 12) * 32) + ' ' + f(-Math.cos(hr * 12) * 32) + '" stroke="' + RED + '" stroke-width="2"/><circle r="3" fill="' + INK + '"/></g>';
      var d = "M40 300"; for (var x = 0; x <= 280; x += 8) { var hh = x / 280 * 24, v = 60 - 44 * Math.exp(-Math.pow(hh - 17, 2) / 2) - 30 * Math.exp(-Math.pow(hh - 8.5, 2) / 1.5); d += " L" + (40 + x) + " " + f(380 - v * 1.4); } var k = clamp((u - 0.6) / 2.4);
      s += '<path d="M40 380 H320 M40 380 V280" stroke="' + INK + '" stroke-width="2"/><path d="' + d + '" stroke="' + BLU + '" stroke-width="3" fill="none" stroke-dasharray="600" stroke-dashoffset="' + f(600 * (1 - k)) + '"/>';
      s += '<path d="M' + f(40 + 17 / 24 * 280) + ' 280 V380" stroke="' + RED + '" stroke-width="2" stroke-dasharray="4 4" opacity="' + f(k) + '"/>' + (k > 0.7 ? label(40 + 17 / 24 * 280, 400, "الساعة 5", RED, 13) : "");
      return s + label(230, 160, "بتفتكر كل يوم", INK, 16) + label(230, 186, "السرعة على مدار اليوم", BLU, 12);
    }],
    [18, function (t, u) {   // the artist pulling a red hand cart with 99 phones down an empty street
      var walk = lerp(-40, 200, clamp(u / 6)), s = '<rect x="20" y="300" width="320" height="110" fill="#b9b2a2"/><path d="M20 300 H340" stroke="' + INK + '" stroke-width="2"/>';
      for (var c = 0; c < 9; c++) s += '<path d="M' + (20 + c * 40) + ' 300 l-20 110" stroke="#9a9384" stroke-width="2"/>';
      s += '<rect x="20" y="150" width="90" height="150" fill="#d9c3a2" stroke="' + INK + '" stroke-width="2"/><rect x="250" y="130" width="90" height="170" fill="#c9a98a" stroke="' + INK + '" stroke-width="2"/>';
      for (var w = 0; w < 6; w++) s += '<rect x="' + (32 + (w % 3) * 26) + '" y="' + (170 + Math.floor(w / 3) * 50) + '" width="14" height="22" fill="#8fb6cf" stroke="' + INK + '"/><rect x="' + (262 + (w % 3) * 26) + '" y="' + (150 + Math.floor(w / 3) * 50) + '" width="14" height="22" fill="#8fb6cf" stroke="' + INK + '"/>';
      var cx = walk + 60, step = Math.sin(t * 6) * 4, g = '<g transform="translate(' + f(cx) + ' 0)">';
      g += '<path d="M-40 352 L-12 330" stroke="' + INK + '" stroke-width="3"/><rect x="-96" y="330" width="60" height="20" rx="3" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>';
      for (var p = 0; p < 18; p++) g += '<rect x="' + (-92 + (p % 9) * 6) + '" y="' + (322 - Math.floor(p / 9) * 7 - (p % 2)) + '" width="5" height="9" rx="1" fill="#2b2f34" stroke="#fbfaf6" stroke-width=".6"/>';
      g += '<circle cx="-86" cy="354" r="7" fill="' + INK + '"/><circle cx="-46" cy="354" r="7" fill="' + INK + '"/>';
      g += '<path d="M0 320 L' + f(-6 + step) + ' 356 M0 320 L' + f(6 - step) + ' 356" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><rect x="-9" y="282" width="18" height="40" rx="7" fill="#26405e" stroke="' + INK + '" stroke-width="2"/><path d="M-6 296 L-14 330" stroke="#26405e" stroke-width="6" stroke-linecap="round"/><circle cy="270" r="11" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/></g>';
      return s + g + label(180, 100, "شارع فاضي… و99 موبايل", INK, 17) + label(180, 124, "برلين 2020", RED, 13);
    }],
    [19, function (t, u) {   // and on the map, the empty street turns red
      var red = clamp((u - 0.8) / 1.2), s = phone(180, 270, 1.35, streetMap(-34, -64, 68, 124, red, t) + (red > 0.5 ? '<text y="-40" text-anchor="middle" style="font:700 9px var(--font-sans);fill:' + RED + '">زحمة!</text>' : ""));
      return s + label(180, 100, "الخريطة: 99 عربية واقفة!", INK, 16) + (red > 0.8 ? label(180, 470, "والشارع فاضي…", RED, 16) : "");
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
