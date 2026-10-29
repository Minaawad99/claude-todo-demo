/* Framed close-ups for the paper version, redrawn every frame (ink on paper): the keypad encrypting the PIN (7), a cassette
   holding thousands of notes (12), the thickness sensor catching two notes stuck together (14), the first cash machine,
   London 1967 (20), the paper cheque with a weak radioactive mark (21), the inventor's six digits and his wife's four (22),
   four digits around the world (23). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2620", RED = "#c15636", BLU = "#3c6484", GRN = "#3a6a44", PAPER = "#fbfaf6", ORG = "#e2a92c", NOTE = "#9fc79a";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function num(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 30) + 'px var(--font-numeral);fill:' + (col || INK) + ';direction:ltr">' + txt + '</text>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.25 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  function person(x, y, s, mood, t, o) { o = o || {}; var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 90 C-32 34 -20 20 0 20 C20 20 32 34 30 90 Z" fill="' + (o.col || "#8a8572") + '" stroke="' + INK + '" stroke-width="2"/><circle cy="-6" r="24" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>';
    g += mood === "shock" ? '<circle cx="-8" cy="-8" r="4" fill="' + INK + '"/><circle cx="8" cy="-8" r="4" fill="' + INK + '"/><ellipse cx="0" cy="6" rx="5" ry="6" fill="' + INK + '"/>' : '<circle cx="-8" cy="-8" r="2.6" fill="' + INK + '"/><circle cx="8" cy="-8" r="2.6" fill="' + INK + '"/><path d="M-7 5 q7 4 14 0" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    return g + (o.extra || '') + '</g>'; }
  function digits(x, y, n, filled, col, t) { var s = ""; for (var i = 0; i < n; i++) { var on = i < filled; s += '<rect x="' + f(x + (i - n / 2) * 34 + 2) + '" y="' + (y - 26) + '" width="30" height="40" rx="6" fill="' + (on ? col : PAPER) + '" stroke="' + INK + '" stroke-width="1.8"/>' + (on ? '<text x="' + f(x + (i - n / 2) * 34 + 17) + '" y="' + (y + 4) + '" text-anchor="middle" style="font:700 24px var(--font-numeral);fill:#fff">✱</text>' : ''); } return s; }
  var P = [
    [7, function (t, u) {   // the keypad encrypts the PIN before it ever leaves it
      var s = '<rect x="70" y="190" width="150" height="200" rx="12" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>', hit = Math.floor(t * 3) % 12;
      for (var k = 0; k < 12; k++) { var kx = 86 + (k % 3) * 44, ky = 206 + Math.floor(k / 3) * 44; s += '<rect x="' + kx + '" y="' + ky + '" width="36" height="36" rx="6" fill="' + (k === hit ? ORG : PAPER) + '" stroke="' + INK + '" stroke-width="1.6"/><text x="' + (kx + 18) + '" y="' + (ky + 25) + '" text-anchor="middle" style="font:700 16px var(--font-numeral);fill:' + INK + '">' + ["1", "2", "3", "4", "5", "6", "7", "8", "9", "✱", "0", "#"][k] + '</text>'; }
      var k2 = clamp((u - 0.8) / 2), code = ""; for (var c = 0; c < 8; c++) code += "0123456789ABCDEF"[Math.floor(hash(c + Math.floor(t * 8)) * 16)];
      s += '<path d="M220 290 H300" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 4"/><path d="M292 284 l8 6 l-8 6" stroke="' + INK + '" stroke-width="2" fill="none"/>';
      s += '<g transform="translate(300 290)"><rect x="-40" y="-18" width="80" height="34" rx="6" fill="' + INK + '"/><text y="5" text-anchor="middle" style="font:700 12px var(--font-numeral);fill:#7cf29a;direction:ltr">' + (k2 > 0.2 ? code : "") + '</text></g>';
      s += '<g transform="translate(300 220)"><rect x="-14" y="-6" width="28" height="22" rx="4" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-8 -6 V-14 A8 8 0 0 1 8 -14 V-6" stroke="' + INK + '" stroke-width="2.4" fill="none"/></g>';
      return s + label(180, 100, "الرقم السري بيتشفّر…", INK, 17) + label(180, 128, "جوه الكيبورد نفسه", RED, 15) + label(300, 340, "مشفّر", RED, 14);
    }],
    [12, function (t, u) {   // one cassette holds thousands of notes
      var s = '<path d="M60 380 L60 220 L230 220 L300 260 L300 420 L130 420 Z" fill="#e6e1d6" stroke="' + INK + '" stroke-width="2.2"/><path d="M60 220 L130 260 H300 M130 260 V420" stroke="' + INK + '" stroke-width="2" fill="none"/>';
      var n = Math.min(40, Math.round(u * 14)); for (var i = 0; i < n; i++) s += '<path d="M' + (138 + i * 4) + ' 268 l0 140" stroke="' + GRN + '" stroke-width="3" opacity=".85"/><path d="M' + (138 + i * 4) + ' 268 l-60 -36" stroke="' + GRN + '" stroke-width="2" opacity=".5"/>';
      var cnt = Math.round(lerp(0, 2500, clamp(u / 2.2))); s += num(180, 190, cnt.toLocaleString("en"), RED, 34);
      return s + label(180, 100, "الكاسيت الواحد…", INK, 17) + label(180, 460, "آلاف الورقات", BLU, 17);
    }],
    [14, function (t, u) {   // the thickness sensor: two rollers, a gauge; two stuck notes push it to red
      var two = Math.sin(t * 1.4) > 0.3, s = '<circle cx="180" cy="210" r="34" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><circle cx="180" cy="' + (two ? 302 : 296) + '" r="34" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>';
      var x = ((t * 120) % 380) - 40; s += '<rect x="' + f(x - 60) + '" y="' + 248 + '" width="120" height="6" fill="' + NOTE + '" stroke="' + GRN + '"/>' + (two ? '<rect x="' + f(x - 56) + '" y="254" width="120" height="6" fill="' + NOTE + '" stroke="' + RED + '"/>' : '');
      for (var r = 0; r < 2; r++) s += '<path d="M180 ' + (r ? (two ? 302 : 296) : 210) + ' l' + f(Math.cos(t * 8 + r * 3) * 30) + ' ' + f(Math.sin(t * 8 + r * 3) * 30) + '" stroke="' + INK + '" stroke-width="2"/>';
      var a = two ? 0.8 : -0.6; s += '<g transform="translate(280 380)"><path d="M-40 0 A40 40 0 0 1 40 0" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M20 -34 A40 40 0 0 1 40 0" fill="none" stroke="' + RED + '" stroke-width="5"/><path d="M0 0 L' + f(Math.sin(a) * 34) + ' ' + f(-Math.cos(a) * 34) + '" stroke="' + INK + '" stroke-width="3"/><circle r="4" fill="' + INK + '"/></g>';
      return s + label(180, 100, "حسّاس بيقيس التُخن", INK, 17) + (two ? label(110, 400, "ورقتين!", RED, 19) : label(110, 400, "ورقة واحدة ✓", GRN, 16));
    }],
    [20, function (t, u) {   // the first cash machine: London, 1967
      var s = '<rect x="40" y="200" width="280" height="220" fill="#e2c9a8" stroke="' + INK + '" stroke-width="2"/>'; for (var b = 0; b < 10; b++) s += '<path d="M40 ' + (220 + b * 20) + ' H320" stroke="#c9ad8a" stroke-width="1"/>';
      s += '<rect x="130" y="250" width="100" height="140" rx="4" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/><rect x="146" y="266" width="68" height="34" fill="#2b2f34" stroke="' + INK + '"/><rect x="150" y="320" width="60" height="8" fill="' + INK + '"/><rect x="150" y="350" width="60" height="22" fill="#c9ced4" stroke="' + INK + '"/>';
      s += '<rect x="40" y="180" width="280" height="24" fill="#2f4a8a" stroke="' + INK + '" stroke-width="2"/>' + label(180, 198, "BARCLAYS", "#fff", 14);
      var y = Math.round(lerp(2026, 1967, clamp(u / 1.6))); s += num(180, 160, y, RED, 40);
      for (var k = 0; k < 3; k++) { var ph = (t * 0.5 + k / 3) % 1; s += '<circle cx="' + f(lerp(60, 300, ph)) + '" cy="440" r="3" fill="' + INK + '" opacity=".4"/>'; }
      return s + label(180, 100, "أول مكنة… في لندن", INK, 18);
    }],
    [21, function (t, u) {   // no cards: paper cheques with a weak radioactive mark (carbon-14)
      var s = '<g transform="translate(180 290) rotate(' + f(-6 + 3 * Math.sin(t * 1.3)) + ')"><rect x="-130" y="-60" width="260" height="120" rx="6" fill="#f4ead8" stroke="' + INK + '" stroke-width="2.2"/><path d="M-110 -30 H60 M-110 -6 H20 M-110 18 H40" stroke="#c9ad8a" stroke-width="3"/>';
      s += '<g transform="translate(90 10) rotate(' + f(t * 40) + ')"><circle r="24" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>' + [0, 120, 240].map(function (a) { return '<path d="M0 0 L' + f(Math.cos((a - 30) * Math.PI / 180) * 20) + ' ' + f(Math.sin((a - 30) * Math.PI / 180) * 20) + ' A20 20 0 0 1 ' + f(Math.cos((a + 30) * Math.PI / 180) * 20) + ' ' + f(Math.sin((a + 30) * Math.PI / 180) * 20) + ' Z" fill="' + INK + '"/>'; }).join("") + '<circle r="5" fill="#f2c230" stroke="' + INK + '"/></g></g>';
      for (var k = 0; k < 5; k++) { var ph = (t * 0.8 + k / 5) % 1; s += '<circle cx="270" cy="300" r="' + f(20 + ph * 60) + '" fill="none" stroke="' + ORG + '" stroke-width="2" opacity="' + f(0.6 * (1 - ph)) + '"/>'; }
      return s + label(180, 100, "مفيش كروت…", INK, 17) + label(180, 128, "شيك ورق فيه مادة مشعة خفيفة", RED, 14);
    }],
    [22, function (t, u) {   // the inventor wanted six digits; his wife said she'd only remember four
      var s = person(100, 250, 1.3, "n", t, { col: "#5a6a8a" }) + person(270, 250, 1.3, u > 2 ? "n" : "n", t, { col: "#c15636", extra: '<path d="M-26 -14 C-30 -40 30 -40 26 -14" fill="none" stroke="' + INK + '" stroke-width="5"/>' });
      s += '<path d="M60 150 h80 v40 h-60 l-10 12 l-2 -12 h-8 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/>' + num(100, 180, "123456", BLU, 18);
      if (u > 1.6) s += '<path d="M230 150 h80 v40 h-46 l-12 12 l-2 -12 h-20 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/>' + num(270, 180, "1234", RED, 20);
      return s + label(180, 100, "ستة أرقام؟ لأ… أربعة!", INK, 17) + digits(180, 430, 6, u > 1.6 ? 4 : 6, u > 1.6 ? RED : BLU, t);
    }],
    [23, function (t, u) {   // since then: four digits in most banks of the world
      var s = '<circle cx="180" cy="280" r="110" fill="#cfe1ec" stroke="' + INK + '" stroke-width="2.4"/>', a = t * 0.4;
      [[-60, -30, 50, 30], [10, -50, 40, 24], [30, 10, 60, 40], [-50, 30, 36, 30]].forEach(function (c, i) { var x = 180 + c[0] + 30 * Math.sin(a + i), clip = Math.abs(x - 180) < 100; if (clip) s += '<ellipse cx="' + f(x) + '" cy="' + (280 + c[1]) + '" rx="' + c[2] / 2 + '" ry="' + c[3] / 2 + '" fill="#9fc79a" stroke="' + INK + '" stroke-width="1.4"/>'; });
      return s + label(180, 100, "ومن ساعتها…", INK, 17) + digits(180, 450, 4, 4, RED, t) + label(180, 128, "بسبب مراته!", RED, 17);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
