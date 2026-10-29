/* Framed close-ups for the paper version, redrawn every frame (ink on paper):
   every dot opens and closes on its own (6), the fence and the rope (8), three stripes = one pixel (17),
   red + green = yellow (18), all three = white (19), 4K in numbers (20), 60 pictures a second (21). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2620", RED = "#d8452e", GRN = "#3fae5a", BLU = "#3f6fd8", WOOD = "#8c6440", LIT = "#fff3c4";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  function px(x, y, sz, lv) { var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(sz) + '" height="' + f(sz) + '" fill="' + INK + '"/>'; [RED, GRN, BLU].forEach(function (c, k) { s += '<rect x="' + f(x + k * sz / 3 + 1) + '" y="' + f(y + 1) + '" width="' + f(sz / 3 - 2) + '" height="' + f(sz - 2) + '" fill="' + c + '" opacity="' + f(0.15 + 0.85 * clamp(lv[k])) + '"/>'; }); return s; }
  var P = [
    [6, function (t, u) {   // a grid of little shutters, each opening and closing on its own
      var s = '<rect x="40" y="150" width="280" height="230" fill="' + LIT + '" stroke="' + INK + '" stroke-width="2"/>';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) { var x = 50 + c * 54, y = 160 + r * 54, op = clamp(0.5 + 0.8 * Math.sin(t * (1.4 + hash(r * 5 + c) * 2.2) + hash(c * 3 + r) * 6)), w = 22 * (1 - op);
        s += '<rect x="' + x + '" y="' + y + '' + '" width="' + f(w) + '" height="48" fill="#5a5f66" stroke="' + INK + '"/><rect x="' + f(x + 44 - w) + '" y="' + y + '" width="' + f(w) + '" height="48" fill="#5a5f66" stroke="' + INK + '"/><rect x="' + x + '" y="' + y + '" width="44" height="48" fill="none" stroke="' + INK + '" stroke-width="1.6"/>'; }
      return s + label(180, 120, "كل نقطة بتقفل وتفتح لوحدها", INK, 16) + label(180, 420, "والنور ورا شغّال على طول", RED, 15);
    }],
    [8, function (t, u) {   // the fence: up-and-down passes, side-to-side stops
      var s = '<rect x="160" y="140" width="40" height="260" fill="none"/>';
      for (var b = 0; b < 3; b++) s += '<rect x="' + (156 + b * 20) + '" y="140" width="10" height="260" rx="3" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="1.6"/>';
      var w1 = "M30 210", w2 = "M30 330"; for (var x = 30; x <= 330; x += 6) { var ph = x * 0.06 - t * 8; w1 += " L" + x + " " + f(210 + Math.sin(ph) * 22); w2 += " L" + x + " " + f(330 + Math.sin(ph) * 5 * (x < 170 ? 1 : Math.max(0, 1 - (x - 170) / 20))); }
      s += '<path d="' + w1 + '" stroke="' + RED + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="' + w2 + '" stroke="' + BLU + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      for (var e = 0; e < 6; e++) { var ex = 40 + e * 22; s += '<ellipse cx="' + ex + '" cy="330" rx="' + f(Math.abs(Math.sin(ex * 0.06 - t * 8)) * 12 + 2) + '" ry="3" fill="none" stroke="' + BLU + '" stroke-width="1.4" opacity=".7"/>'; }
      return s + label(270, 180, "لفوق وتحت ✓", RED, 15) + (u > 1.6 ? label(270, 370, "يمين وشمال ✗", BLU, 15) : "") + label(180, 112, "زي سور قضبانه واقفة", INK, 17);
    }],
    [17, function (t, u) {   // zoom out: one pixel = three stripes
      var k = clamp(u / 1.6), sz = lerp(150, 50, k), s = "";
      for (var r = -2; r <= 2; r++) for (var c = -2; c <= 2; c++) { var x = 180 + c * sz - sz / 2, y = 260 + r * sz - sz / 2; if (x < 30 || x + sz > 330 || y < 150 || y + sz > 380) continue; s += px(x, y, sz, c === 0 && r === 0 ? [1, 1, 1] : [0.4 + 0.3 * Math.sin(t * 2 + c), 0.4 + 0.3 * Math.sin(t * 2 + r), 0.4]); }
      s += '<rect x="' + f(180 - sz / 2 - 3) + '" y="' + f(260 - sz / 2 - 3) + '" width="' + f(sz + 6) + '" height="' + f(sz + 6) + '" fill="none" stroke="#e2a92c" stroke-width="4"/>';
      return s + label(180, 120, "التلاتة جنب بعض = بكسل", INK, 17);
    }],
    [18, function (t, u) {   // red + green = yellow
      var m = clamp((u - 0.5) / 1.0), s = '<rect x="40" y="150" width="280" height="230" fill="' + INK + '"/>';
      s += '<circle cx="' + f(lerp(110, 155, m)) + '" cy="265" r="' + f(62 + 4 * Math.sin(t * 4)) + '" fill="' + RED + '" style="mix-blend-mode:screen"/><circle cx="' + f(lerp(250, 205, m)) + '" cy="265" r="' + f(62 + 4 * Math.sin(t * 4 + 1.5)) + '" fill="' + GRN + '" style="mix-blend-mode:screen"/>';
      s += '<circle cx="180" cy="265" r="' + f(30 * m) + '" fill="#ffe23a"/>';
      return s + label(180, 120, "أحمر + أخضر", INK, 17) + (m > 0.6 ? label(180, 420, "= أصفر!", "#c9a020", 22) : "");
    }],
    [19, function (t, u) {   // all three = white
      var m = clamp((u - 0.3) / 0.9), s = '<rect x="40" y="150" width="280" height="230" fill="' + INK + '"/>';
      [[RED, -Math.PI / 2], [GRN, Math.PI / 6], [BLU, Math.PI * 5 / 6]].forEach(function (c) { var r = lerp(80, 30, m); s += '<circle cx="' + f(180 + Math.cos(c[1]) * r) + '" cy="' + f(265 + Math.sin(c[1]) * r) + '" r="' + f(56 + 4 * Math.sin(t * 4 + c[1])) + '" fill="' + c[0] + '" style="mix-blend-mode:screen"/>'; });
      s += '<circle cx="180" cy="265" r="' + f(26 * m) + '" fill="#fff"/>';
      return s + label(180, 120, "التلاتة على الآخر", INK, 17) + (m > 0.6 ? label(180, 420, "= أبيض!", INK, 22) : "");
    }],
    [20, function (t, u) {   // 4K: 3840 × 2160
      var a = clamp(u / 1.2), b = clamp((u - 1.4) / 1.4), c = clamp((u - 3.0) / 1.2), s = '<rect x="50" y="160" width="260" height="146" fill="' + INK + '" stroke="' + INK + '" stroke-width="3"/>';
      var n = Math.round(lerp(4, 40, a)), sz = 260 / n; for (var r = 0; r < Math.ceil(146 / sz); r++) for (var cc = 0; cc < n; cc++) { var hue = (cc / n + r / (n * 0.6) + t * 0.05) % 1; s += '<rect x="' + f(50 + cc * sz) + '" y="' + f(160 + r * sz) + '" width="' + f(sz - 0.6) + '" height="' + f(Math.min(sz, 306 - 160 - r * sz) - 0.6) + '" fill="hsl(' + Math.round(hue * 360) + ',70%,55%)"/>'; }
      s += '<path d="M50 150 H310 M50 144 v12 M310 144 v12" stroke="' + INK + '" stroke-width="2"/>' + label(180, 140, "3840", INK, 14) + '<path d="M320 160 V306 M314 160 h12 M314 306 h12" stroke="' + INK + '" stroke-width="2"/><text x="338" y="238" text-anchor="middle" transform="rotate(90 338 238)" style="font:700 14px var(--font-numeral);fill:' + INK + '">2160</text>';
      var p = Math.round(8294400 * b), d = Math.round(24883200 * c);
      return s + label(180, 350, p.toLocaleString("en") + " بكسل", INK, 18) + (c > 0 ? label(180, 390, "× 3 = " + d.toLocaleString("en") + " نقطة!", RED, 17) : "") + label(180, 112, "شاشة 4K", INK, 18);
    }],
    [21, function (t, u) {   // 60 pictures every second: a flip-book
      var fr = Math.floor(t * 10), s = "";
      for (var k = 3; k >= 0; k--) s += '<rect x="' + (80 + k * 14) + '" y="' + (170 - k * 10) + '" width="180" height="120" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>';
      var bx = 90 + ((fr * 12) % 160); s += '<circle cx="' + bx + '" cy="' + f(240 - Math.abs(Math.sin(fr * 0.6)) * 50) + '" r="14" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><path d="M80 280 H260" stroke="' + INK + '" stroke-width="2"/>';
      var c = Math.min(60, Math.round(60 * clamp(u / 1.8))); s += '<g transform="translate(180 370)"><circle r="40" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 L' + f(Math.sin(t * 6.28) * 32) + ' ' + f(-Math.cos(t * 6.28) * 32) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><text y="20" text-anchor="middle" style="font:700 14px var(--font-numeral);fill:' + INK + '">' + c + '</text></g>';
      return s + label(180, 120, "60 صورة كل ثانية!", INK, 18);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
