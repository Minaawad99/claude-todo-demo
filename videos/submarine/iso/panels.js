/* Framed close-ups for the paper version, redrawn every frame (ink on paper, water in blue):
   water + air (2), water pushes up (4), the push = the water moved aside (5), nail vs ship (6),
   pressure every 10 m (17), the can at 300 m (18), the round hull (19), the air bottles (21), the rule (24). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  var INK = "#2b2620", WAT = "#3f8fc4", AIR = "#cfe9f6";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function arrow(x1, y1, x2, y2, col, w, p) { p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = w * 2.6;
    return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe) + ' ' + f(ye) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/><path d="M' + f(xe + Math.cos(a) * h * 0.5) + ' ' + f(ye + Math.sin(a) * h * 0.5) + ' L' + f(xe - Math.cos(a - 0.5) * h) + ' ' + f(ye - Math.sin(a - 0.5) * h) + ' L' + f(xe - Math.cos(a + 0.5) * h) + ' ' + f(ye - Math.sin(a + 0.5) * h) + ' Z" fill="' + col + '"/>'; }
  function water(x0, y0, x1, y1, t) { var d = "M" + x0 + " " + y1 + " V" + f(y0); for (var x = x0; x <= x1; x += 8) d += " L" + x + " " + f(y0 + Math.sin(x * 0.08 + t * 3) * 2.2); return '<path d="' + d + ' V' + y1 + ' Z" fill="' + WAT + '" opacity=".75"/>'; }
  function bubbles(t, x, y0, y1, n) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * 0.7 + i / n) % 1); s += '<circle cx="' + f(x + Math.sin(u * 8 + i * 2) * 14 + (i % 3 - 1) * 20) + '" cy="' + f(lerp(y0, y1, u)) + '" r="' + f(2 + u * 3) + '" fill="#fff" fill-opacity=".4" stroke="#fff" stroke-width="1.2"/>'; } return s; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  var P = [
    [2, function (t, u) {
      var a = clamp((u - 0.3) * 2.5), b = clamp((u - 1.7) * 2.5), s = bubbles(t, 180, 400, 120, 10);
      s += '<g transform="translate(100 250) scale(' + f(a) + ')"><path d="M0 -70 C34 -20 52 6 52 34 C52 70 26 86 0 86 C-26 86 -52 70 -52 34 C-52 6 -34 -20 0 -70 Z" fill="' + WAT + '" stroke="' + INK + '" stroke-width="3"/></g>';
      s += '<g transform="translate(260 250) scale(' + f(b) + ')"><circle r="66" fill="' + AIR + '" stroke="' + INK + '" stroke-width="3"/><circle cx="-24" cy="-24" r="12" fill="#fff"/></g>';
      return s + label(100, 370, "مية", WAT, 20) + label(260, 370, "هوا", INK, 20) + label(180, 120, "السر كله في حاجتين", INK, 18);
    }],
    [4, function (t, u) {
      var rel = u > 0.9, by = rel ? lerp(310, 210, clamp((u - 0.9) / 0.7)) + (u > 1.6 ? Math.sin(t * 3) * 3 : 0) : 310 + Math.sin(t * 8) * 2, s = water(40, 210, 320, 400, t);
      s += '<g transform="translate(180 ' + f(by) + ') rotate(' + f(t * 30) + ')"><circle r="36" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M0 -36 A36 36 0 0 1 31 18 L0 0 Z" fill="#c23a26"/><path d="M31 18 A36 36 0 0 1 -31 18 L0 0 Z" fill="#2f6f9f"/><path d="M-31 18 A36 36 0 0 1 0 -36 L0 0 Z" fill="#e2b035"/><circle r="36" fill="none" stroke="' + INK + '" stroke-width="3"/></g>';
      if (!rel) s += '<path d="M180 ' + f(by - 36) + ' V150" stroke="#e2b48e" stroke-width="22" stroke-linecap="round"/>';
      return s + arrow(110, 380, 110, 320, "#4f8f5a", 6, u / 0.6) + arrow(250, 380, 250, 320, "#4f8f5a", 6, (u - 0.2) / 0.6) + label(180, 120, "المية بتزق لفوق", INK, 18);
    }],
    [5, function (t, u) {
      var drop = clamp((u - 0.4) / 0.8), lvl = lerp(270, 240, drop), spill = clamp((u - 1.1) / 1.4), s = "";
      s += '<path d="M40 180 V370 H240 V230 H262" fill="none" stroke="' + INK + '" stroke-width="3"/>' + water(42, lvl, 238, 368, t);
      s += '<rect x="100" y="' + f(lerp(110, 270, drop * drop)) + '" width="70" height="60" rx="6" fill="#8a8f96" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var k = 0; k < 5; k++) { var q = ((t * 1.5 + k / 5) % 1); if (spill > 0.05) s += '<circle cx="' + f(262 + q * 20) + '" cy="' + f(232 + q * q * 90) + '" r="3.4" fill="' + WAT + '"/>'; }
      s += '<path d="M268 300 V370 H330 V300" fill="none" stroke="' + INK + '" stroke-width="3"/><rect x="270" y="' + f(368 - 50 * spill) + '" width="58" height="' + f(50 * spill) + '" fill="' + WAT + '" opacity=".75"/>';
      return s + label(180, 120, "الزقة = وزن المية اللي اتزاحت", INK, 16) + label(300, 400, "المية اللي اتزاحت", WAT, 13);
    }],
    [6, function (t, u) {
      var s = water(20, 200, 340, 410, t) + '<path d="M180 150 V410" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 5"/>', ny = lerp(205, 380, clamp((u - 0.4) / 2));
      s += '<g transform="translate(90 ' + f(ny) + ') rotate(' + f(70 + u * 20) + ')"><rect x="-3" y="-30" width="6" height="60" fill="#8a8f96" stroke="' + INK + '" stroke-width="1.6"/><rect x="-10" y="-34" width="20" height="6" fill="#8a8f96" stroke="' + INK + '" stroke-width="1.6"/></g>';
      s += '<g transform="translate(270 ' + f(196 + Math.sin(t * 1.6) * 2) + ') rotate(' + f(Math.sin(t * 1.3) * 2) + ')"><path d="M-70 0 H70 L56 22 H-56 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2.4"/><rect x="-36" y="-24" width="56" height="24" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/></g>';
      return s + label(90, 150, "مسمار: يغطس", INK, 15) + label(270, 150, "سفينة: تعوم", INK, 15) + label(180, 120, "أخف من المية اللي زاحتها؟ تعوم", INK, 15);
    }],
    [17, function (t, u) {
      var s = water(40, 160, 320, 420, t) + '<path d="M70 160 V410" stroke="' + INK + '" stroke-width="3"/>';
      for (var m = 0; m <= 3; m++) { var y = 160 + m * 80, on = clamp((u - 0.3 - m * 0.7) * 3); s += '<path d="M62 ' + y + ' H78" stroke="' + INK + '" stroke-width="3"/><text x="56" y="' + (y + 5) + '" text-anchor="end" style="font:700 14px var(--font-numeral);fill:' + INK + ';direction:ltr">' + (m * 10) + 'm</text>';
        for (var k = 0; k < m; k++) s += '<g transform="translate(' + (110 + k * 40) + ' ' + y + ') scale(' + f(on) + ')"><circle r="15" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M-7 3 h14 M-7 -3 h14" stroke="' + WAT + '" stroke-width="3"/></g>'; }
      return s + label(180, 120, "كل 10 متر = ضغط جو كامل", INK, 17);
    }],
    [18, function (t, u) {
      var k = clamp(u / 3), dep = lerp(0, 300, k), cr = clamp((dep - 60) / 200), s = water(20, 140, 340, 420, t);
      for (var b = 0; b < 8; b++) { var by = ((b * 50 - t * 70) % 400 + 400) % 400 + 140; s += '<rect x="20" y="' + f(by) + '" width="320" height="14" fill="#fff" opacity=".1"/>'; }
      s += '<g transform="translate(180 ' + f(270 + Math.sin(t * 2) * 3) + ') rotate(' + f(Math.sin(t * 2.4) * 8) + ')"><path d="M-26 -52 Q' + f(-26 + cr * 16) + ' 0 -26 52 H26 Q' + f(26 - cr * 20) + ' 0 26 -52 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="0" cy="-52" rx="26" ry="7" fill="#c9c4b8" stroke="' + INK + '" stroke-width="2"/></g>';
      for (var a = 0; a < 8; a++) { var an = a * 0.785; s += arrow(180 + Math.cos(an) * 100, 270 + Math.sin(an) * 100, 180 + Math.cos(an) * 64, 270 + Math.sin(an) * 64, "#fff", 3, 1); }
      return s + '<text x="180" y="190" text-anchor="middle" style="font:700 26px var(--font-numeral);fill:#fff;direction:ltr">' + Math.round(dep) + ' m</text>' + label(180, 120, "على 300 متر: الضغط ×30", INK, 17);
    }],
    [19, function (t, u) {
      var s = '<g transform="rotate(' + f(t * 8) + ' 180 260)">'; for (var a = 0; a < 14; a++) { var an = a * 0.449; s += arrow(180 + Math.cos(an) * 130, 260 + Math.sin(an) * 130, 180 + Math.cos(an) * 92, 260 + Math.sin(an) * 92, WAT, 4, 1); } s += '</g>';
      s += '<circle cx="180" cy="260" r="86" fill="#8a929c" stroke="' + INK + '" stroke-width="3"/><circle cx="180" cy="260" r="64" fill="#f4efe4" stroke="' + INK + '" stroke-width="3"/><text x="180" y="267" text-anchor="middle" style="font:700 16px var(--font-sans);fill:' + INK + '">جوه</text>';
      return s + label(180, 120, "حديد تخين ومدوّر", INK, 18) + label(180, 400, "الضغط بيتوزّع على الدايرة كلها", WAT, 15);
    }],
    [21, function (t, u) {
      var s = '<path d="M30 160 H330" stroke="#8a929c" stroke-width="12"/><path d="M30 160 H330" stroke="' + AIR + '" stroke-width="4" stroke-dasharray="12 10" stroke-dashoffset="' + f(-t * 80) + '"/>';
      for (var b = 0; b < 4; b++) { var x = 75 + b * 70; s += '<rect x="' + (x - 24) + '" y="190" width="48" height="180" rx="22" fill="#5fa37a" stroke="' + INK + '" stroke-width="2.4"/><rect x="' + (x - 8) + '" y="168" width="16" height="24" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>';
        var a = -2.2 + 4.2 * (0.86 + 0.04 * Math.sin(t * 6 + b)); s += '<circle cx="' + x + '" cy="230" r="14" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/><path d="M' + x + ' 230 L' + f(x + Math.sin(a) * 10) + ' ' + f(230 - Math.cos(a) * 10) + '" stroke="#c23a26" stroke-width="2.4"/>'; }
      return s + label(180, 120, "أسطوانات هوا مضغوط جامد", INK, 17);
    }],
    [24, function (t, u) {
      var half = 2.6, a = clamp((u - 0.3) * 2), b = clamp((u - half) * 2), s = water(20, 160, 340, 420, t); s += bubbles(t, 180, 410, 170, 12);
      function boat(x, y, lv, sc) { return '<g transform="translate(' + x + ' ' + f(y) + ') scale(' + f(sc) + ')"><rect x="-60" y="-18" width="120" height="36" rx="18" fill="' + AIR + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-58" y="' + f(16 - 32 * lv) + '" width="116" height="' + f(32 * lv) + '" fill="#1c5f8f"/><rect x="-36" y="-12" width="72" height="24" rx="10" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/><rect x="-14" y="-34" width="22" height="16" fill="#5a6470" stroke="' + INK + '" stroke-width="2"/></g>'; }
      s += boat(95, 250 + Math.sin(t * 1.4) * 26 * a, 0.9, a) + arrow(95, 300, 95, 360, INK, 5, a) + boat(265, 300 - Math.sin(t * 1.4) * 26 * b, 0.1, b) + arrow(265, 250, 265, 190, "#4f8f5a", 5, b);
      return s + label(95, 400, "مية تدخل: تنزل", WAT, 14) + label(265, 400, "هوا يدخل: تطلع", "#4f8f5a", 14) + label(180, 120, "اللعبة كلها في الوزن", INK, 18);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
