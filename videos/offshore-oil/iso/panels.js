/* Framed close-ups for the paper version, redrawn every frame (ink on paper):
   heat + pressure cook the dead plankton (5), oil sits in the pores like a sponge (6), the computer's 3D picture (11),
   the two real drill bits (15), the three jobs of the mud (17), the blowout preventer shutting (18), the whole trip (23). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2620", RED = "#c23a26", WAT = "#3f8fc4", OIL = "#2a2018", SAND = "#d9c79a", STEEL = "#9aa2ac", GOLD = "#c9a04e", GRN = "#4f8f5a", YEL = "#e2b035";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function arrow(x1, y1, x2, y2, col, w, p) { p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = w * 2.6;
    return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe) + ' ' + f(ye) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/><path d="M' + f(xe + Math.cos(a) * h * 0.5) + ' ' + f(ye + Math.sin(a) * h * 0.5) + ' L' + f(xe - Math.cos(a - 0.5) * h) + ' ' + f(ye - Math.sin(a - 0.5) * h) + ' L' + f(xe - Math.cos(a + 0.5) * h) + ' ' + f(ye - Math.sin(a + 0.5) * h) + ' Z" fill="' + col + '"/>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  function plank(x, y, s, k, t) { var r = Math.sin(t * 2 + k) * 20; return k % 2 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><circle r="8" fill="#a8d89a" stroke="' + INK + '" stroke-width="1.4"/><circle r="3.5" fill="none" stroke="' + INK + '"/></g>' : '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><ellipse rx="11" ry="4.5" fill="#d9e8a0" stroke="' + INK + '" stroke-width="1.4"/><path d="M-6 -3 V3 M0 -4 V4 M6 -3 V3" stroke="' + INK + '" stroke-width=".9"/></g>'; }
  function drop(x, y, r, t) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 2) + ')"><path d="M0 ' + f(-r * 1.5) + ' C' + f(r * 0.6) + ' ' + f(-r * 0.7) + ' ' + f(r) + ' ' + f(-r * 0.3) + ' ' + f(r) + ' ' + f(r * 0.2) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(-r) + ' ' + f(r * 0.2) + ' C' + f(-r) + ' ' + f(-r * 0.3) + ' ' + f(-r * 0.6) + ' ' + f(-r * 0.7) + ' 0 ' + f(-r * 1.5) + ' Z" fill="' + OIL + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(r * 0.05) + '" r="' + f(r * 0.2) + '" fill="#fff"/><circle cx="' + f(r * 0.35) + '" cy="' + f(r * 0.05) + '" r="' + f(r * 0.2) + '" fill="#fff"/><circle cx="' + f(-r * 0.32) + '" cy="' + f(r * 0.08) + '" r="' + f(r * 0.09) + '" fill="' + INK + '"/><circle cx="' + f(r * 0.38) + '" cy="' + f(r * 0.08) + '" r="' + f(r * 0.09) + '" fill="' + INK + '"/></g>'; }
  function threads(y0, n) { var s = '<path d="M-26 ' + y0 + ' H26 L22 ' + (y0 + n * 7 + 4) + ' H-22 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < n; i++) s += '<path d="M-24 ' + (y0 + 4 + i * 7) + ' L24 ' + (y0 + 8 + i * 7) + '" stroke="' + INK + '" stroke-width="1.2"/>'; return s; }
  function cone(x, y, rot, flip, spin) {
    var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (flip ? -1 : 1) + ' 1)"><path d="M-46 -40 Q-58 0 -46 40 L30 13 Q42 0 30 -13 Z" fill="#b9bfc6" stroke="' + INK + '" stroke-width="2"/>';
    [0.12, 0.42, 0.72].forEach(function (tt, r) { var cx = -46 + 76 * tt, hh = 40 * (1 - tt) + 13 * tt, n = 5 - r, ph = (spin * (1.6 + r * 0.6)) % 1;
      s += '<path d="M' + f(cx) + ' ' + f(-hh) + ' Q' + f(cx - 6) + ' 0 ' + f(cx) + ' ' + f(hh) + '" stroke="' + INK + '" stroke-width="1.2" fill="none"/>';
      for (var k = 0; k < n; k++) { var yy = -hh + (2 * hh) * ((k + ph) % n + 0.5) / n; s += '<path d="M' + f(cx - 5) + ' ' + f(yy - 5) + ' L' + f(cx + 7) + ' ' + f(yy) + ' L' + f(cx - 5) + ' ' + f(yy + 5) + ' Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width=".9"/>'; } });
    return s + '</g>'; }
  function tricone(x, y, sc, spin) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">' + threads(-150, 6) + '<path d="M-44 -104 H44 L60 -70 V-20 L36 10 H-36 L-60 -20 V-70 Z" fill="#5fa597" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -100 L-24 6 M20 -100 L24 6" stroke="' + INK + '" stroke-width="1.6"/>' + cone(-46, 40, 48, false, spin) + cone(46, 40, -48, true, spin) + cone(0, 62, 90, false, spin) + '</g>'; }
  function pdc(x, y, sc, ang) {
    var R = 78, yG = -40, D = 86, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">' + threads(-150, 5) + '<path d="M-40 -110 H40 L' + R + ' -70 V' + yG + ' H' + (-R) + ' V-70 Z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + (-R) + ' ' + yG + ' A' + R + ' ' + D + ' 0 0 0 ' + R + ' ' + yG + ' Z" fill="#8a6a30" stroke="' + INK + '" stroke-width="2"/>', bl = [];
    for (var j = 0; j < 7; j++) { var ph0 = j * 2 * Math.PI / 7 + ang, pts = []; for (var k = 0; k <= 12; k++) { var u = k / 12, ph = ph0 + 0.9 * u, r = R * Math.cos(u * 1.45); pts.push([r * Math.sin(ph), yG + D * Math.sin(u * 1.45) - 6 * Math.cos(ph) * (1 - u), Math.cos(ph), u]); }
      var fr = pts.filter(function (p) { return p[2] > -0.05; }); if (fr.length > 1) bl.push([fr.reduce(function (m, p) { return m + p[2]; }, 0) / fr.length, fr]); }
    bl.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (b) { var p = b[1], d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L");
      s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="22" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="#e2c47a" stroke-width="18" stroke-linecap="round" fill="none"/>';
      p.forEach(function (q, i) { if (i % 2 || q[3] > 0.85) return; var rr = 3 + 3.2 * Math.max(0.2, q[2]); s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1] - 3) + '" rx="' + f(rr * (0.45 + 0.55 * Math.max(0, q[2]))) + '" ry="' + f(rr) + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="1.1"/>'; }); });
    return s + '</g>'; }
  var P = [
    [5, function (t, u) {   // layers pile up, pressure from above, heat from below: green plankton turn into oil
      var n = Math.min(4, Math.floor(u / 0.55)), cook = clamp((u - 2.4) / 1.6), s = '<rect x="30" y="140" width="300" height="270" fill="#f4efe4" stroke="' + INK + '" stroke-width="2"/>';
      for (var k = 0; k < 4; k++) { if (k >= n) continue; var y = 300 - (k + 1) * 34; s += '<rect x="30" y="' + y + '" width="300" height="34" fill="' + ["#d9c79a", "#c9b07a", "#b39a72", "#a98a5c"][k] + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
      var gc = "rgb(" + Math.round(lerp(150, 42, cook)) + "," + Math.round(lerp(190, 32, cook)) + "," + Math.round(lerp(110, 24, cook)) + ")";
      s += '<rect x="30" y="300" width="300" height="40" fill="' + gc + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var q = 0; q < 8; q++) s += cook < 0.5 ? plank(50 + q * 37, 320, 0.9, q, t) : drop(50 + q * 37, 322, 8, t);
      s += '<rect x="30" y="340" width="300" height="70" fill="#e0a070"/><rect x="30" y="340" width="300" height="14" fill="' + RED + '" opacity="' + f((0.3 + 0.2 * Math.sin(t * 6)) * clamp(u - 1.2)) + '"/>';
      for (var a = 0; a < 3; a++) s += arrow(90 + a * 90, 110 + Math.sin(t * 4 + a) * 3, 90 + a * 90, 140 + Math.sin(t * 4 + a) * 3, INK, 4, clamp((u - 1.0) * 2));
      return s + label(180, 100, "ضغط", INK, 16) + label(180, 386, "حرارة", RED, 18) + (cook > 0.5 ? label(180, 440, "= نفط!", INK, 22) : label(180, 440, "ملايين السنين…", INK, 16));
    }],
    [6, function (t, u) {   // grains of sand with oil in between, and a sponge
      var s = '<clipPath id="pc6"><circle cx="180" cy="250" r="120"/></clipPath><g clip-path="url(#pc6)"><rect x="40" y="120" width="280" height="280" fill="' + OIL + '"/>';
      for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) { var gx = 60 + c * 36 + (r % 2 ? 18 : 0) + Math.sin(t * 0.6 + r) * 3, gy = 140 + r * 32 + Math.cos(t * 0.5 + c) * 2, rr = 15 + hash(r * 8 + c) * 4; s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(rr) + '" fill="' + SAND + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
      for (var o = 0; o < 8; o++) { var ou = (t * 0.4 + o / 8) % 1; s += '<circle cx="' + f(80 + o * 30) + '" cy="' + f(lerp(380, 130, ou)) + '" r="2.4" fill="#8a6a40" opacity=".8"/>'; }
      s += '</g><circle cx="180" cy="250" r="120" fill="none" stroke="' + INK + '" stroke-width="3"/>';
      var sp = clamp((u - 1.8) * 2); if (sp > 0) s += '<g transform="translate(290 370) scale(' + f(sp) + ') rotate(' + f(Math.sin(t * 2) * 5) + ')"><rect x="-44" y="-28" width="88" height="56" rx="10" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/>' + [[-22, -10, 6], [0, 8, 5], [20, -12, 7], [26, 12, 4], [-26, 12, 4]].map(function (h) { return '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + h[2] + '" fill="' + OIL + '"/>'; }).join("") + '</g>';
      return s + label(180, 104, "مش بحيرة… مسام في الصخر", INK, 16) + (sp > 0 ? label(250, 430, "زي الإسفنجة", INK, 16) : "");
    }],
    [11, function (t, u) {   // the survey computer: the echoes become a 3D block of layers with a dome
      var b = clamp(u / 2.6), s = '<rect x="40" y="150" width="280" height="190" rx="12" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="54" y="164" width="252" height="162" fill="#0f2a3a"/><path d="M160 340 L150 380 H210 L200 340 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
      var rot = 0.5 + t * 0.25, cA = Math.cos(rot), sA = Math.sin(rot), cols = ["#e2c47a", "#8a929c", "#c9a06e", "#a98a5c"];
      function P(x, z, y) { var X = x * cA - z * sA, Z = x * sA + z * cA; return [180 + X * 0.9, 260 + Z * 0.42 - y]; }
      for (var k = 3; k >= 0; k--) { if (k >= Math.ceil(b * 4 + 0.01)) continue; var d = ""; for (var i = 0; i <= 10; i++) { var x = -90 + i * 18, p = P(x, 90, (4 - k) * 14 + 30 * b * Math.exp(-x * x / 2600)); d += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
        for (var i2 = 10; i2 >= 0; i2--) { var x2 = -90 + i2 * 18, p2 = P(x2, 90, (3 - k) * 14 + 30 * b * Math.exp(-x2 * x2 / 2600) * (k < 3 ? 1 : 0)); d += " L" + f(p2[0]) + " " + f(p2[1]); } s += '<path d="' + d + ' Z" fill="' + cols[k] + '" stroke="#7cf2ff" stroke-width="1"/>'; }
      for (var a = 0; a < 6; a++) for (var c = 0; c < 6; c++) { var x0 = -90 + a * 30, z0 = -90 + c * 30, h = function (x, z) { return 56 + 30 * b * Math.exp(-(x * x + z * z) / 2600); }, q = [P(x0, z0, h(x0, z0)), P(x0 + 30, z0, h(x0 + 30, z0)), P(x0 + 30, z0 + 30, h(x0 + 30, z0 + 30)), P(x0, z0 + 30, h(x0, z0 + 30))];
        s += '<path d="M' + q.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="#e2c47a" stroke="#7cf2ff" stroke-width=".7" opacity=".9"/>'; }
      var sc = 164 + ((t * 70) % 162); s += '<path d="M54 ' + f(sc) + ' H306" stroke="#7cf2ff" stroke-width="2" opacity=".35"/>';
      return s + label(180, 120, "الصدى… بقى صورة 3D", INK, 17) + (b >= 1 ? label(180, 430, "شايف القبة؟", RED, 18) : "");
    }],
    [15, function (t, u) {   // the two real bits, both turning; rock chips flying
      var s = '<rect x="30" y="360" width="300" height="60" fill="#a98a5c" stroke="' + INK + '" stroke-width="2"/>';
      for (var c = 0; c < 14; c++) { var side = c % 2, uu = (t * 1.3 + hash(c)) % 1, a = -Math.PI / 2 + (hash(c + 3) - 0.5) * 2.4, cx = side ? 262 : 98; s += '<path d="M' + f(cx + Math.cos(a) * 60 * uu) + ' ' + f(350 + Math.sin(a) * 40 * uu) + ' l6 -3 l2 6 l-7 2 Z" fill="' + SAND + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(1 - uu) + '"/>'; }
      s += tricone(98, 300 + Math.sin(t * 20) * 1.2, 0.62, t * 1.2) + (u > 1.6 ? pdc(262, 300 + Math.sin(t * 22) * 1.2, 0.62, t * 3) : "");
      return s + label(98, 140, "تروس مسننة", INK, 15) + (u > 1.6 ? label(262, 140, "ألماظ صناعي", INK, 15) : "") + (u > 3.2 ? label(180, 452, "بتلف وتطحن الصخر", RED, 17) : "");
    }],
    [17, function (t, u) {   // mud down the pipe, out of the bit, up the sides with the chips
      var s = '<rect x="120" y="110" width="120" height="300" fill="#7a5838" stroke="' + INK + '" stroke-width="2"/><rect x="160" y="110" width="40" height="260" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><rect x="166" y="110" width="28" height="260" fill="#b08050"/>';
      for (var c = 0; c < 6; c++) { var y = 120 + ((t * 70 + c * 44) % 250); s += '<path d="M172 ' + f(y) + ' L180 ' + f(y + 8) + ' L188 ' + f(y) + '" stroke="#f4e2c0" stroke-width="3" fill="none"/>'; }
      s += '<path d="M150 370 H210 L200 400 H160 Z" fill="#5fa597" stroke="' + INK + '" stroke-width="2"/>';
      for (var k = 0; k < 12; k++) { var sd = k % 2, uu = (t * 0.5 + hash(k)) % 1, x = sd ? 220 : 140; s += '<path d="M' + f(x + Math.sin(t * 3 + k) * 4) + ' ' + f(lerp(390, 120, uu)) + ' l6 -3 l2 6 l-7 2 Z" fill="' + SAND + '" stroke="' + INK + '" stroke-width=".8"/>'; }
      var jobs = [["تبريد", WAT], ["تطليع الفتافيت", INK], ["مسك الضغط", RED]];
      jobs.forEach(function (j, i) { var p = clamp((u - 0.4 - i * 1.1) * 2.5); if (p <= 0) return; s += '<g transform="translate(284 ' + (170 + i * 90) + ') scale(' + f(p) + ')"><circle r="18" fill="#fff" stroke="' + j[1] + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:700 18px var(--font-numeral);fill:' + j[1] + '">' + (i + 1) + '</text></g>' + label(284, 214 + i * 90, j[0], j[1], 11); });
      return s + label(180, 96, "الطين بيعمل 3 حاجات", INK, 17);
    }],
    [18, function (t, u) {   // the BOP: yellow frame, ram blocks; the pressure jumps and the rams close
      var surge = clamp((u - 2.2) / 0.4), shut = clamp((u - 2.8) / 0.5), s = '<rect x="30" y="400" width="300" height="30" fill="#a98a5c" stroke="' + INK + '" stroke-width="2"/><rect x="170" y="100" width="20" height="300" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="1.6"/>';
      s += '<path d="M190 150 C236 150 250 180 246 220 M170 150 C124 150 110 184 114 230" stroke="' + RED + '" stroke-width="3" fill="none"/>';
      [180, 220].forEach(function (y) { s += '<path d="M136 ' + (y + 30) + ' V' + (y + 12) + ' Q136 ' + y + ' 156 ' + y + ' H204 Q224 ' + y + ' 224 ' + (y + 12) + ' V' + (y + 30) + ' Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>'; });
      [262, 290, 318, 346].forEach(function (y, i) { var sl = 30 * shut * (i % 2 ? 0.6 : 1); s += '<rect x="128" y="' + y + '" width="104" height="22" rx="3" fill="' + (i % 2 ? "#8a929c" : RED) + '" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(92 + sl) + '" y="' + (y + 5) + '" width="36" height="12" rx="3" fill="' + STEEL + '" stroke="' + INK + '"/><rect x="' + f(232 - sl) + '" y="' + (y + 5) + '" width="36" height="12" rx="3" fill="' + STEEL + '" stroke="' + INK + '"/>'; });
      s += '<g fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.6"><rect x="84" y="170" width="12" height="230"/><rect x="264" y="170" width="12" height="230"/><rect x="78" y="164" width="204" height="10"/><rect x="72" y="394" width="216" height="10"/></g>';
      if (surge > 0 && shut < 1) for (var g = 0; g < 6; g++) { var uu = (t * 1.6 + g / 6) % 1; s += '<circle cx="' + f(180 + Math.sin(g * 3 + t * 4) * 4) + '" cy="' + f(lerp(420, 260, uu)) + '" r="4" fill="#ffd98a" stroke="' + INK + '"/>'; }
      var gv = 0.3 + 0.65 * surge, ga = -2.4 + 4.8 * gv; s += '<g transform="translate(300 120)"><circle r="26" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 L' + f(Math.sin(ga) * 20) + ' ' + f(-Math.cos(ga) * 20) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="' + INK + '"/></g>';
      if (surge > 0 && shut < 1) s += '<circle cx="300" cy="80" r="8" fill="' + RED + '" opacity="' + (Math.sin(t * 14) > 0 ? 1 : 0.2) + '"/>';
      return s + label(150, 120, "مانع الانفجار", INK, 17) + (shut > 0.5 ? label(180, 462, "قفل في ثواني!", RED, 20) : "");
    }],
    [23, function (t, u) {   // the whole trip in five stops
      var st = [["كائنات", function (x, y) { return plank(x, y, 1.4, 1, t); }], ["صخر", function (x, y) { return '<rect x="' + (x - 16) + '" y="' + (y - 12) + '" width="32" height="24" fill="#a98a5c" stroke="' + INK + '" stroke-width="2"/>'; }], ["بير", function (x, y) { return '<path d="M' + (x - 10) + ' ' + (y + 14) + ' L' + x + ' ' + (y - 16) + ' L' + (x + 10) + ' ' + (y + 14) + ' M' + (x - 6) + ' ' + (y + 2) + ' H' + (x + 6) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'; }],
        ["سفينة", function (x, y) { return '<path d="M' + (x - 18) + ' ' + (y + 2) + ' H' + (x + 18) + ' L' + (x + 12) + ' ' + (y + 12) + ' H' + (x - 12) + ' Z" fill="#7a2a20" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x + 4) + '" y="' + (y - 10) + '" width="10" height="12" fill="#fff" stroke="' + INK + '"/>'; }], ["عربيتك", function (x, y) { return '<path d="M' + (x - 18) + ' ' + (y + 6) + ' V' + (y - 2) + ' L' + (x - 10) + ' ' + (y - 12) + ' H' + (x + 8) + ' L' + (x + 18) + ' ' + (y - 2) + ' V' + (y + 6) + ' Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + (x - 9) + '" cy="' + (y + 8) + '" r="4" fill="' + INK + '"/><circle cx="' + (x + 9) + '" cy="' + (y + 8) + '" r="4" fill="' + INK + '"/>'; }]];
      var s = '<path d="M60 180 C200 160 300 200 300 250 C300 300 60 280 60 330 C60 380 200 380 300 380" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-dasharray="6 6" stroke-dashoffset="' + f(-t * 20) + '"/>', pos = [[60, 180], [300, 250], [60, 330], [180, 372], [300, 380]];
      st.forEach(function (p, i) { var k = clamp((u - 0.2 - i * 0.45) * 3); if (k <= 0) return; s += '<g transform="translate(' + pos[i][0] + ' ' + pos[i][1] + ') scale(' + f(k) + ') translate(' + (-pos[i][0]) + ' ' + (-pos[i][1]) + ')"><circle cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="28" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/>' + p[1](pos[i][0], pos[i][1]) + '</g>' + label(pos[i][0], pos[i][1] + 46, p[0], INK, 12); });
      var mv = clamp(u / 2.8), ip = Math.min(3, Math.floor(mv * 4)), kk = mv * 4 - ip, dp = [lerp(pos[ip][0], pos[ip + 1][0], kk), lerp(pos[ip][1], pos[ip + 1][1], kk) - 36];
      return s + drop(dp[0], dp[1], 10, t) + label(180, 120, "رحلة ملايين السنين!", RED, 19);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
