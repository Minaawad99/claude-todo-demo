/* Framed close-ups for the paper version, redrawn every frame (ink on paper):
   all ropes at once? (7), the counterweight balance (9), governor weights flinging out (15), the latch (16),
   1854 (20), Otis cuts the rope (21), four layers of safety (23). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function f(n) { return (+n).toFixed(1); }
  var INK = "#2b2620", RED = "#c23a26", GRN = "#4f8f5a", ROPE = "#5a5f66";
  function label(x, y, txt, col, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:700 ' + (size || 15) + 'px var(--font-sans);fill:' + (col || INK) + '">' + txt + '</text>'; }
  function face(x, y, r, mood, t) { var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>', e = r * 0.3;
    if (mood === "happy") return s + '<path d="M' + f(x - e * 1.6) + ' ' + f(y) + ' q' + f(e * 0.7) + ' ' + f(-e) + ' ' + f(e * 1.3) + ' 0 M' + f(x + e * 0.3) + ' ' + f(y) + ' q' + f(e * 0.7) + ' ' + f(-e) + ' ' + f(e * 1.3) + ' 0" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    return s + '<path d="M' + f(x - e) + ' ' + f(y - e) + ' v' + f(e * 1.6) + ' M' + f(x + e) + ' ' + f(y - e) + ' v' + f(e * 1.6) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>'; }
  function shield(x, y, s, n) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')"><path d="M0 -34 L28 -24 V4 C28 22 14 34 0 40 C-14 34 -28 22 -28 4 V-24 Z" fill="' + GRN + '" stroke="' + INK + '" stroke-width="2.4"/><text y="12" text-anchor="middle" style="font:700 28px var(--font-numeral);fill:#fff">' + n + '</text></g>'; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.3 * u * u * (3 - 2 * u); }
  function frame(t, a, b) { var k = push(t, a, b), dx = 10 * Math.sin(t * 1.1), dy = 8 * Math.cos(t * 1.1); return '<g transform="translate(' + f(180 + dx) + ' ' + f(244 + dy) + ') rotate(' + f(0.8 * Math.sin(t * 0.83)) + ') scale(' + k.toFixed(4) + ') translate(-180 -244)">'; }
  var P = [
    [7, function (t, u) {
      var s = ""; for (var i = 0; i < 6; i++) { var x = 70 + i * 44, p = clamp((u - 0.2 - i * 0.25) * 3); s += '<path d="M' + x + ' 150 V360" stroke="' + ROPE + '" stroke-width="5"/>'; if (p > 0) s += '<g transform="translate(' + x + ' 255) scale(' + f(p) + ')"><circle r="14" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/></g>'; }
      return s + label(180, 120, "كلهم مع بعض؟", INK, 18) + (u > 1.8 ? label(180, 400, "شبه مستحيل!", RED, 20) : "");
    }],
    [9, function (t, u) {
      var tilt = 3 * Math.sin(t * 1.6), s = '<path d="M180 330 L156 370 H204 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><g transform="rotate(' + f(tilt) + ' 180 240)"><path d="M50 240 H310" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M180 240 V330" stroke="' + INK + '" stroke-width="6"/>';
      s += '<rect x="40" y="170" width="74" height="66" rx="5" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/><rect x="48" y="180" width="58" height="50" fill="#fff3d6" stroke="' + INK + '" stroke-width="1.6"/>' + face(64, 196, 7, "happy", t) + face(90, 196, 7, "happy", t);
      s += '<rect x="254" y="172" width="54" height="64" rx="4" fill="#4a5058" stroke="' + INK + '" stroke-width="2.4"/><text x="281" y="210" text-anchor="middle" style="font:700 13px var(--font-sans);fill:#f4f1e8">تقل</text></g>';
      var df = clamp((u - 1.4) * 2); return s + '<g transform="translate(300 330) scale(' + f(df) + ')"><rect x="-26" y="-16" width="52" height="32" rx="5" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:700 12px var(--font-sans);fill:' + INK + '">الفرق</text></g>' + label(180, 120, "الموتور بيشيل الفرق بس", INK, 17);
    }],
    [15, function (t, u) {
      var sp = 1 + 2 * clamp(u / 3), a0 = t * 2 * sp, open = 18 + 26 * clamp(u / 3), s = '<circle cx="180" cy="260" r="110" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><circle cx="180" cy="260" r="98" fill="none" stroke="#8a929c" stroke-width="2.4" stroke-dasharray="9 7"/>';
      for (var k = 0; k < 2; k++) { var a = a0 + k * Math.PI; s += '<g transform="rotate(' + f(a * 57.3) + ' 180 260)"><path d="M180 260 L' + f(180 + open) + ' 242" stroke="' + INK + '" stroke-width="4"/><rect x="' + f(180 + open) + '" y="230" width="40" height="22" rx="7" fill="#6a6f76" stroke="' + INK + '" stroke-width="2"/></g>'; }
      return s + '<circle cx="180" cy="260" r="10" fill="' + INK + '"/>' + label(180, 120, "أسرع… الأتقال تتفتح أكتر", INK, 16);
    }],
    [16, function (t, u) {
      var stop = u > 1.0, a0 = stop ? (L(16) + 1.0) * 7 : t * 7, s = '<circle cx="180" cy="260" r="110" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>';
      for (var c = 0; c < 8; c++) { var ca = c * 0.785; s += '<path d="M' + f(180 + Math.cos(ca) * 110) + ' ' + f(260 + Math.sin(ca) * 110) + ' L' + f(180 + Math.cos(ca + 0.2) * 92) + ' ' + f(260 + Math.sin(ca + 0.2) * 92) + '" stroke="' + INK + '" stroke-width="4"/>'; }
      for (var k = 0; k < 2; k++) { var a = a0 + k * Math.PI; s += '<g transform="rotate(' + f(a * 57.3) + ' 180 260)"><path d="M180 260 L222 242" stroke="' + INK + '" stroke-width="4"/><rect x="222" y="230" width="40" height="22" rx="7" fill="#6a6f76" stroke="' + INK + '" stroke-width="2"/></g>'; }
      if (stop) s += '<circle cx="180" cy="260" r="126" fill="none" stroke="' + RED + '" stroke-width="5" opacity="' + f(0.5 + 0.5 * Math.sin(t * 10)) + '"/>';
      return s + label(180, 120, stop ? "قفل! البكرة وقفت" : "السرعة زادت…", stop ? RED : INK, 18);
    }],
    [20, function (t, u) {
      var n = Math.round(lerp(2026, 1854, clamp(u / 1.4))); return '<rect x="20" y="150" width="320" height="220" rx="12" fill="#e6d2a6" stroke="' + INK + '" stroke-width="2.4"/><text x="180" y="290" text-anchor="middle" style="font:700 84px var(--font-numeral);fill:#5b4636">' + n + '</text>' + label(180, 120, "الفكرة دي قديمة جدًا", INK, 18);
    }],
    [21, function (t, u) {
      var cutAt = 3.6, drop = u > cutAt ? Math.min(12, (u - cutAt) * 50) : 0, cheer = u > cutAt + 0.5, s = '<rect x="20" y="140" width="320" height="270" fill="#efe3c6"/>';
      s += '<path d="M90 140 V380 M270 140 V380" stroke="#6b4a30" stroke-width="9"/><path d="M80 146 H280" stroke="#6b4a30" stroke-width="9"/><path d="M180 146 V' + f(u > cutAt ? 180 : 226 + drop) + '" stroke="' + ROPE + '" stroke-width="4"/>';
      s += '<g transform="translate(0 ' + f(drop) + ')"><rect x="104" y="260" width="152" height="10" fill="#8c6440" stroke="' + INK + '" stroke-width="2"/><path d="M104 260 L180 226 L256 260" fill="none" stroke="#5b4636" stroke-width="2.4"/><path d="M166 260 C166 236 194 236 194 260 Z" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.6"/>' + face(180, 226, 10, cheer ? "happy" : "n", t) + '<rect x="171" y="204" width="18" height="12" fill="' + INK + '"/></g>';
      for (var p = 0; p < 6; p++) { var px = 44 + p * 54 + (p > 2 ? 54 : 0), j = cheer ? Math.abs(Math.sin(t * 8 + p)) * 6 : 0; if (px > 96 && px < 264) continue; s += face(px, 360 - j, 9, cheer ? "happy" : "n", t); }
      for (var q = 0; q < 4; q++) { var qx = 40 + q * 96, j2 = cheer ? Math.abs(Math.sin(t * 8 + q * 2)) * 6 : 0; s += face(qx, 396 - j2, 9, cheer ? "happy" : "n", t); }
      return s + label(180, 120, u < cutAt ? "اقطعوا الحبل!" : "…ووقفت!", u < cutAt ? INK : GRN, 20);
    }],
    [23, function (t, u) {
      var nm = ["حبال كتير", "تقل وفرامل", "منظّم السرعة", "سوست"], s = "";
      for (var k = 0; k < 4; k++) { var p = clamp((u - k * 0.6) * 2.5); if (p <= 0) continue; var x = 60 + k * 80; s += shield(x, 250 + Math.sin(t * 2.2 + k) * 4, p, k + 1) + label(x, 320, nm[k], INK, 12); }
      return s + label(180, 120, "4 طبقات أمان", INK, 20) + (u > 2.6 ? label(180, 390, "كل واحدة تكفّي لوحدها", GRN, 16) : "");
    }]
  ];
  window.__panels = function (t) {
    P.forEach(function (p) { var i = p[0], el = document.getElementById("pp" + i); if (!el) return; if (t < L(i) - 0.5 || t > L(i + 1) + 0.5) return; el.innerHTML = frame(t, L(i), L(i + 1)) + p[1](t, t - L(i)) + "</g>"; });
  };
})();
