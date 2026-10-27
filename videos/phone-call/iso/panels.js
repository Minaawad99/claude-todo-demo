/* Framed close-ups for the paper version, redrawn every frame (ink on paper, the voice in orange):
   the mic (5), electricity on a scope (6), sampling into numbers (7), squeezing them (8), the light family (11),
   the speed of light (12), inside a fibre (16), unpacking at mum's phone (20), the speaker (21), the whole trip (25). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  var V = "#e08a1e", INK = "#2b2620";
  function wy(k, t) { return Math.sin(k * 18 - t * 6) * 0.6 + Math.sin(k * 41 - t * 9) * 0.3 + Math.sin(k * 7 + t) * 0.25; }
  function wave(x0, x1, y, amp, t, p, col, w) { var d = "", n = 80; p = clamp(p == null ? 1 : p); for (var i = 0; i <= n * p; i++) { var k = i / n; d += (i ? " L" : "M") + f(lerp(x0, x1, k)) + " " + f(y - wy(k, t) * amp * Math.sin(Math.PI * k)); } return d ? '<path d="' + d + '" stroke="' + (col || V) + '" stroke-width="' + (w || 3.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ""; }
  function bits(x, y, t, n, size, col) { var s = ""; for (var i = 0; i < n; i++) s += '<text x="' + f(x + i * size * 0.72) + '" y="' + f(y) + '" style="font:700 ' + size + 'px var(--font-numeral);fill:' + (col || V) + '">' + ((Math.sin(i * 12.9898 + Math.floor(t * 5) * 78.233) * 43758.5453 % 1 + 1) % 1 > 0.5 ? 1 : 0) + '</text>'; return s; }
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  var P = [
    [5, function (t, u) {   // the mic: air dots hit a thin membrane that shakes
      var s = ""; for (var r = 0; r < 7; r++) for (var c = 0; c < 9; c++) { var x = 40 + c * 22 + Math.sin(c * 0.8 - t * 7) * 6, y = 170 + r * 22; s += '<circle cx="' + f(x) + '" cy="' + y + '" r="3.4" fill="#5d93ad"/>'; }
      var b = Math.sin(t * 7 - 7) * 7; s += '<path d="M250 160 Q' + f(256 + b) + ' 240 250 320" stroke="' + INK + '" stroke-width="3" fill="none"/><rect x="262" y="150" width="60" height="180" rx="10" fill="#d8d0bf" stroke="' + INK + '" stroke-width="2"/><path d="M322 240 H350" stroke="' + V + '" stroke-width="4"/>';
      return s + label(180, 120, "الميكروفون: غشا رفيع بيتهز", INK, 16);
    }],
    [6, function (t, u) {   // electricity with the same ups and downs
      var s = '<rect x="30" y="140" width="300" height="200" rx="14" fill="#1a2e22" stroke="' + INK + '" stroke-width="3"/>';
      for (var g = 0; g < 6; g++) s += '<path d="M' + (50 + g * 52) + ' 150 V330" stroke="#2f5a3e"/>'; s += wave(45, 315, 240, 70, t, clamp(u / 1.2), "#7cf29a", 3);
      return s + label(180, 120, "الهزة بقت كهربا", INK, 17) + label(180, 380, "بتعلى وتوطى زي صوتك", V, 16);
    }],
    [7, function (t, u) {   // measured thousands of times a second
      var s = wave(30, 330, 230, 70, t * 0.3, 1, "#c9bfa8", 3), n = Math.floor(clamp(u / 2.6) * 30), nums = "";
      for (var i = 0; i <= n; i++) { var k = i / 30, x = lerp(30, 330, k), y = 230 - wy(k, t * 0.3) * 70 * Math.sin(Math.PI * k); s += '<path d="M' + f(x) + ' 230 V' + f(y) + '" stroke="' + V + '" stroke-width="3"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.6" fill="' + V + '"/>'; if (i < 10) nums += Math.round(50 + wy(k, t * 0.3) * 40 * Math.sin(Math.PI * k)) + "  "; }
      return s + '<text x="180" y="350" text-anchor="middle" style="font:700 18px var(--font-numeral);fill:' + INK + ';direction:ltr">' + nums + '</text>' + label(180, 120, "قياس… آلاف المرات في الثانية", INK, 16);
    }],
    [8, function (t, u) {   // squeeze the numbers
      var sq = clamp((u - 0.5) / 1.4), w = lerp(280, 110, sq * sq * (3 - 2 * sq)), s = '<rect x="' + f(180 - w / 2) + '" y="180" width="' + f(w) + '" height="120" rx="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var r = 0; r < 4; r++) s += bits(180 - w / 2 + 10, 208 + r * 26, t + r, Math.max(3, Math.floor(w / 13) - 1), 17);
      s += '<rect x="' + f(180 - w / 2 - 34) + '" y="160" width="24" height="160" rx="5" fill="#b9b2a2" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(180 + w / 2 + 10) + '" y="160" width="24" height="160" rx="5" fill="#b9b2a2" stroke="' + INK + '" stroke-width="2"/>';
      return s + label(180, 120, "بيضغطها عشان تاخد أقل مساحة", INK, 16);
    }],
    [11, function (t, u) {   // the light family: radio is light we can't see
      var s = '<rect x="20" y="200" width="320" height="56" rx="8" fill="url(#gSpec)" stroke="' + INK + '" stroke-width="2"/>', p = 0.5 + 0.5 * Math.sin(t * 4);
      s += '<rect x="16" y="194" width="80" height="68" rx="8" fill="none" stroke="' + V + '" stroke-width="' + f(3 + 2 * p) + '"/><rect x="190" y="194" width="74" height="68" rx="8" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
      s += label(56, 290, "راديو", V, 16) + label(227, 290, "اللي بنشوفه", INK, 15);
      s += '<g transform="translate(56 160)"><ellipse rx="22" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><circle r="6" fill="#2f6f9f"/><path d="M-20 -16 L20 16" stroke="#c23a26" stroke-width="5" stroke-linecap="round" opacity="' + f(clamp((u - 1.2) * 3)) + '"/></g>';
      return s + label(180, 120, "من نفس عيلة النور", INK, 17);
    }],
    [12, function (t, u) {   // the speed of light: seven times round the Earth in a second
      var s = '<circle cx="180" cy="250" r="80" fill="#9cc3dd" stroke="' + INK + '" stroke-width="2.4"/><path d="M130 220 q20 -20 40 -6 q14 14 34 0 q20 -14 26 14 q-14 26 -40 20 q-26 -6 -40 6 q-20 -6 -20 -34 Z" fill="#9db86b" stroke="' + INK + '"/>';
      var a = ((t * 1.5) % 1) * Math.PI * 2; s += '<circle cx="180" cy="250" r="104" fill="none" stroke="' + V + '" stroke-width="2" stroke-dasharray="5 6"/><circle cx="' + f(180 + Math.cos(a) * 104) + '" cy="' + f(250 + Math.sin(a) * 104) + '" r="7" fill="' + V + '"/>';
      var km = Math.round(clamp(u / 1.5) * 300000); return s + '<text x="180" y="140" text-anchor="middle" style="font:700 28px var(--font-numeral);fill:' + INK + ';direction:ltr">' + km.toLocaleString("en-US") + ' km/s</text>' + label(180, 395, "7 لفات حوالين الأرض في الثانية!", V, 16);
    }],
    [16, function (t, u) {   // inside one glass thread: light bouncing, blinking on and off
      var s = '<rect x="0" y="190" width="360" height="100" fill="#dbe9ef" stroke="#5d93ad" stroke-width="3"/><path d="M0 200 H360 M0 280 H360" stroke="#9cc3dd" stroke-width="2"/>';
      for (var k = 0; k < 7; k++) { var x0 = -120 + ((t * 220 + k * 90) % 600), on = Math.sin(k * 9.1) > -0.3, d = ""; for (var z = 0; z < 5; z++) d += (z ? " L" : "M") + f(x0 + z * 30) + " " + (z % 2 ? 204 : 276); if (on) s += '<path d="' + d + '" stroke="' + V + '" stroke-width="4" fill="none" stroke-linejoin="round"/>'; }
      return s + bits(110, 340, t * 3, 8, 20, INK) + label(180, 120, "جوه خيط زجاج رفيع زي الشعرة", INK, 16) + label(180, 160, "مليارات ومضة في الثانية", V, 15);
    }],
    [20, function (t, u) {   // mum's phone unpacks the numbers back into electricity
      var s = bits(40, 210, t * 2, 6, 20) + '<path d="M170 205 H200" stroke="' + V + '" stroke-width="4"/><path d="M200 197 L212 205 L200 213 Z" fill="' + V + '"/>';
      s += '<rect x="220" y="150" width="120" height="110" rx="10" fill="#1a2e22" stroke="' + INK + '" stroke-width="2.4"/>' + wave(228, 332, 205, 40, t, clamp((u - 0.4) / 1.2), "#7cf29a", 2.6);
      return s + label(180, 120, "يفك الأرقام… ويرجعها كهربا", INK, 16);
    }],
    [21, function (t, u) {   // the speaker cone pushed back and forth
      var pz = Math.sin(t * 24) * 8, s = '<path d="M140 190 L200 160 L200 320 L140 290 Z" fill="#c9c4b8" stroke="' + INK + '" stroke-width="2.4"/><rect x="110" y="210" width="30" height="60" fill="#8a857d" stroke="' + INK + '" stroke-width="2"/>';
      s += '<g transform="translate(' + f(pz) + ' 0)"><ellipse cx="200" cy="240" rx="12" ry="80" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/></g>';
      for (var w = 0; w < 4; w++) { var o = ((t * 1.6 + w / 4) % 1); s += '<path d="M' + f(230 + o * 100) + ' ' + f(200 - o * 20) + ' Q' + f(250 + o * 110) + ' 240 ' + f(230 + o * 100) + ' ' + f(280 + o * 20) + '" stroke="' + V + '" stroke-width="3" fill="none" opacity="' + f(1 - o) + '"/>'; }
      return s + label(180, 120, "السماعة بتتزق لقدام ولورا", INK, 16);
    }],
    [25, function (t, u) {   // the whole trip
      var names = ["هوا", "كهربا", "أرقام", "نور", "هوا تاني"], s = "", step = 0.9;
      for (var k = 0; k < 5; k++) { var x = 36 + k * 72, a = clamp((u - k * step) / 0.35); if (a <= 0) continue; var sc = a < 1 ? 0.6 + 0.4 * a : 1;
        s += '<g transform="translate(' + x + ' 240) scale(' + f(sc) + ')"><circle r="30" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/>';
        if (k === 0 || k === 4) s += wave(-22, 22, 0, 10, t, 1, "#5d93ad", 2.4); if (k === 1) s += wave(-22, 22, 0, 10, t, 1, "#3f9f5a", 2.4); if (k === 2) s += bits(-20, 6, t, 3, 14); if (k === 3) s += '<circle r="10" fill="' + V + '"/><circle r="4" fill="#fff"/>';
        s += '</g>' + label(x, 300, names[k], k === 3 ? V : INK, 14); if (k) s += '<path d="M' + (x - 40) + ' 240 H' + (x - 32) + '" stroke="' + V + '" stroke-width="3"/>'; }
      return s + label(180, 140, "رحلة صوتك", INK, 20);
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
  window.__panelLines = P.map(function (p) { return p[0]; });
})();
