  // ── new pieces for this episode ─────────────────────────
  var STEEL = "#8a929c", ROPE = "#5a5f66", SAFE = "#4f8f5a";
  function paper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  // people inside the car: a row of ball heads; mood per person or for all
  function riders(x, y, w, t, mood, n) { var s = ""; n = n || 3; for (var i = 0; i < n; i++) { var px = x + (i + 0.5) * w / n, bob = Math.sin(t * 3 + i * 2) * 1.5; s += '<path d="M' + f(px - 14) + ' ' + f(y + 34) + ' C' + f(px - 14) + ' ' + f(y + 10) + ' ' + f(px + 14) + ' ' + f(y + 10) + ' ' + f(px + 14) + ' ' + f(y + 34) + ' Z" fill="' + ["#3f6f8f", "#b9442a", "#4f8f5a", "#e2b035"][i % 4] + '" stroke="#1c1c1c" stroke-width="1.6"/>' + head(px, y + bob, 12, typeof mood === "function" ? mood(i) : mood, t + i, 0); } return s; }
  // the elevator car (front view), w×h, at (x, y) = top-left; o: {mood, dark, open, n}
  function car(x, y, w, h, t, o) {
    o = o || {}; var cxm = x + w / 2, cym = y + h / 2, s = '<g transform="translate(' + f(cxm) + ' ' + f(cym) + ') scale(1.3) translate(' + f(-cxm) + ' ' + f(-cym) + ')">';
    s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx="6" fill="url(#gCar)" stroke="#1c1c1c" stroke-width="3"/>';
    s += '<rect x="' + f(x + 10) + '" y="' + f(y + 14) + '" width="' + (w - 20) + '" height="' + (h - 24) + '" fill="' + (o.dark ? "#2a3040" : "#fff3d6") + '" stroke="#1c1c1c" stroke-width="2"/>';
    s += riders(x + 10, y + h * 0.42, w - 20, t, o.mood || "n", o.n);
    var op = clamp(o.open || 0) * (w - 20) / 2; s += '<rect x="' + f(x + 10) + '" y="' + f(y + 14) + '" width="' + f((w - 20) / 2 - op) + '" height="' + (h - 24) + '" fill="url(#gDoor)" stroke="#1c1c1c" stroke-width="1.6" opacity=".28"/><rect x="' + f(x + w / 2 + op) + '" y="' + f(y + 14) + '" width="' + f((w - 20) / 2 - op) + '" height="' + (h - 24) + '" fill="url(#gDoor)" stroke="#1c1c1c" stroke-width="1.6" opacity=".28"/>';
    s += '<rect x="' + f(x + w / 2 - 18) + '" y="' + f(y + 2) + '" width="36" height="10" rx="2" fill="#1c1c1c"/><text x="' + f(x + w / 2) + '" y="' + f(y + 10.5) + '" text-anchor="middle" style="font:700 8px Noto Serif;fill:#ff6a4a;direction:ltr">' + (o.floor || "20") + '</text>';
    if (o.dark) s += '<rect x="' + f(x + 10) + '" y="' + f(y + 14) + '" width="' + (w - 20) + '" height="' + (h - 24) + '" fill="#0b1020" opacity=".35"/>';
    return s + '</g>';
  }
  function ropes(x0, x1, yTop, yBot, n, t, cut) { var s = ""; for (var i = 0; i < n; i++) { var x = n === 1 ? (x0 + x1) / 2 : lerp(x0, x1, i / (n - 1)), c = cut && cut[i]; if (c) { var gap = 30 + c * 40; s += '<path d="M' + f(x) + ' ' + f(yTop) + ' V' + f((yTop + yBot) / 2 - gap) + '" stroke="' + ROPE + '" stroke-width="4"/><path d="M' + f(x) + ' ' + f((yTop + yBot) / 2 + gap * 0.3) + ' Q' + f(x + 8 * Math.sin(t * 6)) + ' ' + f((yTop + yBot) / 2 + gap) + ' ' + f(x + 4) + ' ' + f(yBot) + '" stroke="' + ROPE + '" stroke-width="4" fill="none"/>'; } else s += '<path d="M' + f(x) + ' ' + f(yTop) + ' V' + f(yBot) + '" stroke="' + ROPE + '" stroke-width="4"/><path d="M' + f(x) + ' ' + f(yTop) + ' V' + f(yBot) + '" stroke="#c9c4b8" stroke-width="1.2" stroke-dasharray="3 3" stroke-dashoffset="' + f(t * 20) + '"/>'; } return s; }
  function rails(x0, x1, y0, y1) { return '<path d="M' + x0 + ' ' + y0 + ' V' + y1 + ' M' + x1 + ' ' + y0 + ' V' + y1 + '" stroke="' + STEEL + '" stroke-width="7"/><path d="M' + x0 + ' ' + y0 + ' V' + y1 + ' M' + x1 + ' ' + y0 + ' V' + y1 + '" stroke="#c9ced4" stroke-width="2"/>'; }
  function shaft(t, yOff) {   // a building cut open to show the shaft: floors with doors scroll by with yOff
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#cbb896"/><rect x="200" y="-300" width="240" height="960" fill="#3a3530"/>';
    for (var k = -6; k < 12; k++) { var y = k * 90 + ((yOff || 0) % 90 + 90) % 90 - 60; s += '<path d="M-400 ' + f(y) + ' H200 M440 ' + f(y) + ' H1040" stroke="#8a7a5a" stroke-width="6"/><rect x="120" y="' + f(y - 70) + '" width="70" height="66" fill="#a7926a" stroke="#5b4636" stroke-width="2"/><rect x="450" y="' + f(y - 70) + '" width="70" height="66" fill="#a7926a" stroke="#5b4636" stroke-width="2"/>'; }
    return s + rails(214, 426, -300, 700);
  }
  function sheave(x, y, r, t, sp, cls) { var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#gSheave)" stroke="#1c1c1c" stroke-width="3"/>', a = t * (sp || 2); for (var k = 0; k < 6; k++) { var an = a + k * 1.047; s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(an) * r * 0.8) + ' ' + f(y + Math.sin(an) * r * 0.8) + '" stroke="#3a3d42" stroke-width="4"/>'; } return s + '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.18) + '" fill="#1c1c1c"/>'; }
  function weightBox(x, y, w, h, label) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx="4" fill="url(#gIron)" stroke="#1c1c1c" stroke-width="3"/>' + (label ? '<text x="' + f(x + w / 2) + '" y="' + f(y + h / 2 + 6) + '" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#f4f1e8">' + label + '</text>' : ""); }
  function shield(x, y, s, n, on) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')"><path d="M0 -40 L34 -28 V4 C34 26 18 40 0 48 C-18 40 -34 26 -34 4 V-28 Z" fill="' + (on ? SAFE : "#c9c4b8") + '" stroke="#1c1c1c" stroke-width="3"/><text y="14" text-anchor="middle" style="font:900 34px Noto Serif;fill:#fff;direction:ltr">' + n + '</text></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — a steel box hanging twenty floors up
  shot(0, function (u, d) { return [lerp(320, 320, u / d), lerp(240, 150, ease(u / d)), lerp(0.75, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(560, 80, 24, "#fff6e2") + clouds(t, 14, 30, 4, 0.6) + '<g transform="translate(' + f(-u * 6) + ' 0)">' + city(t, 360, 160, "#d9b394", "#f6dfa8", 61) + '</g>';
    s += '<rect x="170" y="-200" width="300" height="700" fill="#cbb896" stroke="#5b4636" stroke-width="3"/><rect x="250" y="-200" width="140" height="700" fill="#3a3530"/>' + rails(262, 378, -200, 500);
    for (var k = 0; k < 9; k++) { var y = -160 + k * 70; s += '<path d="M170 ' + y + ' H250 M390 ' + y + ' H470" stroke="#8a7a5a" stroke-width="4"/><rect x="186" y="' + (y + 14) + '" width="44" height="34" fill="#f6dfa8" stroke="#5b4636"/><rect x="410" y="' + (y + 14) + '" width="44" height="34" fill="' + (k % 2 ? "#f6dfa8" : "#9cb3c4") + '" stroke="#5b4636"/>'; }
    var cy = 110 + Math.sin(t * 0.8) * 6; s += ropes(300, 340, -200, cy, 4, t) + car(266, cy, 108, 96, t, { mood: "happy" });
    return s + tag("20 دور!", 120, 60, u, 0.8, -4, 24) + birds(t, 60, 40);
  });
  // 1 — what if the rope snaps?
  shot(1, function (u, d) { return [320, 170, lerp(1.1, 1.3, u / d)]; }, function (u, d, t) {
    var snap = clamp((u - 0.7) / 0.3), sh = snap > 0 ? Math.sin(t * 50) * 3 * (1 - clamp((u - 1.0) / 0.8)) : 0, s = shaft(t, 0);
    s += ropes(300, 340, -300, 120, 4, t, snap > 0 ? [snap, snap * 0.6, 0, 0] : null) + '<g transform="translate(' + f(sh) + ' 0)">' + car(266, 120, 108, 96, t, { mood: snap > 0 ? "shock" : "n" }) + '</g>';
    if (u < 1.2) s += '<g transform="translate(320 50) rotate(' + f(Math.sin(t * 20) * 20) + ')"><circle cx="-12" cy="10" r="9" fill="none" stroke="#c23a26" stroke-width="4"/><circle cx="12" cy="10" r="9" fill="none" stroke="#c23a26" stroke-width="4"/><path d="M-6 2 L14 -30 M6 2 L-14 -30" stroke="#8a929c" stroke-width="5" stroke-linecap="round"/></g>';
    if (snap > 0) for (var k = 0; k < 6; k++) { var a = k * 1.05; s += '<path d="M' + f(300 + Math.cos(a) * 10) + ' ' + f(50 + Math.sin(a) * 10) + ' L' + f(300 + Math.cos(a) * (18 + 10 * snap)) + ' ' + f(50 + Math.sin(a) * (18 + 10 * snap)) + '" stroke="#f2c230" stroke-width="3" stroke-linecap="round"/>'; }
    return s + tag("هيقع؟!", 500, 90, u, 1.0, 4, 26, "#f2b0a0");
  });
  // 2 — no! four things stop it
  shot(2, function (u, d) { return [lerp(260, 380, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = paper(t), no = pop((u - 0.1) / 1.2); s += '<g transform="translate(320 110) scale(' + f(no) + ') rotate(' + f(Math.sin(t * 3) * 3) + ')"><text text-anchor="middle" y="20" style="font:900 70px Noto Sans Arabic;fill:#c23a26;paint-order:stroke;stroke:#fff;stroke-width:10px">لأ!</text></g>';
    for (var k = 0; k < 4; k++) { var p = pop((u - 0.9 - k * 0.4) / 1.2); if (p > 0) s += shield(140 + k * 120, 250 + Math.sin(t * 2.4 + k) * 4, p, k + 1, true); }
    return s;
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = shaft(t, -t * 60) + ropes(300, 340, -300, 140, 4, t) + car(266, 140, 108, 96, t, { mood: "happy", floor: String(20 - Math.floor(u * 3) % 20) });
    return s + tag("إيه الحكاية؟", 320, 280, u, 0.1, -2, 32);
  });
  // 4 — not just one rope
  shot(4, function (u, d) { return [320, lerp(170, 120, u / d), lerp(1.4, 1.8, u / d)]; }, function (u, d, t) {
    var s = shaft(t, 0) + ropes(320, 320, -300, 120, 1, t), hl = 0.5 + 0.5 * Math.sin(t * 6);
    s += '<path d="M320 -300 V120" stroke="#f2c230" stroke-width="' + f(8 + 4 * hl) + '" opacity=".35"/>' + car(266, 120, 108, 96, t, { mood: "curious" });
    return s + tag("حبل واحد؟", 450, 40, u, 0.4, 3, 20);
  });
  // 5 — several steel ropes, four to eight
  shot(5, function (u, d) { return [320, 120, lerp(1.6, 1.4, u / d)]; }, function (u, d, t) {
    var n = Math.min(8, 1 + Math.floor(clamp(u / 2) * 8)), s = shaft(t, 0) + ropes(290, 350, -300, 120, Math.max(2, n), t) + car(266, 120, 108, 96, t, { mood: "happy" });
    for (var i = 0; i < Math.max(2, n); i++) { var x = lerp(290, 350, i / (Math.max(2, n) - 1)); s += '<circle cx="' + f(x) + '" cy="40" r="8" fill="#fff" stroke="#1c1c1c" stroke-width="1.6"/><text x="' + f(x) + '" y="44" text-anchor="middle" style="font:800 10px Noto Serif;fill:#1c1c1c">' + (i + 1) + '</text>'; }
    return s + tag("من 4 لـ 8 حبال", 460, 80, u, 1.6, 3, 19);
  });
  // 6 — each rope alone holds the car full to the brim
  shot(6, function (u, d) { return [lerp(300, 340, u / d), 150, lerp(1.2, 1.45, u / d)]; }, function (u, d, t) {
    var s = shaft(t, 0), fade = clamp((u - 0.4) / 0.8);
    for (var i = 0; i < 6; i++) { var x = lerp(290, 350, i / 5); s += '<path d="M' + f(x) + ' -300 V120" stroke="' + ROPE + '" stroke-width="4" opacity="' + f(i === 2 ? 1 : 1 - 0.85 * fade) + '"/>'; }
    s += '<path d="M314 -300 V120" stroke="#4f8f5a" stroke-width="' + f(6 + 2 * Math.sin(t * 6)) + '" opacity="' + f(0.6 * fade) + '"/>' + car(266, 120 + Math.sin(t * 1.6) * 2, 108, 96, t, { mood: "happy", n: 4 });
    return s + tag("واحد بس يكفّي!", 470, 60, u, 1.3, 3, 20);
  });
  // 7 — for it to fall they'd all have to snap together: almost impossible
  shot(7, function (u, d) { return [lerp(260, 380, u / d), 180, 1.05]; }, function (u, d, t) {
    var s = paper(t);
    for (var i = 0; i < 6; i++) { var x = 120 + i * 80, p = pop((u - 0.2 - i * 0.25) / 1.2); s += '<path d="M' + x + ' 40 V320" stroke="' + ROPE + '" stroke-width="6"/><g transform="translate(' + x + ' 180) scale(' + f(p) + ')"><circle r="18" fill="#fff" stroke="#1c1c1c" stroke-width="2"/><path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="#c23a26" stroke-width="4" stroke-linecap="round" opacity=".5"/></g>'; }
    var pct = pop((u - 2.0) / 1.2); s += '<g transform="translate(320 60) scale(' + f(pct) + ')"><rect x="-120" y="-26" width="240" height="44" rx="10" fill="#1c1c1c"/><text y="6" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#f2c230">شبه مستحيل!</text></g>';
    return s;
  });
  // 8 — the ropes run over a pulley up top; a big iron weight hangs on the other side
  shot(8, function (u, d) { return [lerp(280, 360, u / d), lerp(140, 190, u / d), lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var mv = Math.sin(t * 0.8) * 30, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a3530"/><rect x="-400" y="-300" width="1440" height="300" fill="#5a524a"/><path d="M-400 0 H1040" stroke="#1c1c1c" stroke-width="5"/>';
    s += sheave(320, -10, 60, t, Math.cos(t * 0.8) * 1.6) + '<path d="M262 -10 V' + f(150 + mv) + ' M378 -10 V' + f(200 - mv) + '" stroke="' + ROPE + '" stroke-width="6"/>';
    s += car(208, 150 + mv, 108, 96, t, { mood: "happy" }) + weightBox(352, 200 - mv, 52, 110, "تقل");
    return s + tag("تقل الناحية التانية", 470, 80, u, 0.9, 3, 18);
  });
  // 9 — that weight nearly matches the car: the motor only lifts the difference
  shot(9, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var tilt = 4 * Math.sin(t * 1.6) * 0.5, s = paper(t) + '<path d="M320 300 L290 340 H350 Z" fill="#8a929c" stroke="#1c1c1c" stroke-width="3"/>';
    s += '<g transform="rotate(' + f(tilt) + ' 320 200)"><path d="M140 200 H500" stroke="#1c1c1c" stroke-width="8" stroke-linecap="round"/><path d="M320 200 V300" stroke="#1c1c1c" stroke-width="8"/>' + car(110, 106, 100, 90, t, { mood: "happy" }) + weightBox(440, 110, 70, 86, "تقل") + '</g>';
    var dfp = pop((u - 1.4) / 1.2); s += '<g transform="translate(560 270) scale(' + f(dfp) + ')"><rect x="-28" y="-20" width="56" height="40" rx="6" fill="#e2b035" stroke="#1c1c1c" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#1c1c1c">الفرق</text></g>';
    return s + tag("الموتور بيشيل الفرق بس", 320, 40, u, 1.8, -2, 18);
  });
  // 10 — the motor has a brake that clamps by itself when power goes
  shot(10, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.1, 1.3, u / d)]; }, function (u, d, t) {
    var off = u > 1.6, cl = off ? clamp((u - 1.6) / 0.3) : 0, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#4a5058"/>';
    s += '<rect x="140" y="110" width="200" height="140" rx="20" fill="url(#gMotor)" stroke="#1c1c1c" stroke-width="3"/>' + (off ? "" : '<path d="M200 170 l20 -30 l-6 24 l18 -2 l-22 34 l6 -24 Z" fill="#f2c230" stroke="#1c1c1c" stroke-width="1.6"/>') + sheave(430, 180, 56, t, off ? 0 : 3);
    s += '<rect x="' + f(352 - 26 * (1 - cl)) + '" y="150" width="16" height="60" rx="4" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/><rect x="' + f(492 + 26 * (1 - cl)) + '" y="150" width="16" height="60" rx="4" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/>';
    if (off) s += '<g transform="translate(240 70)"><path d="M-10 -14 l14 0 l-8 14 l10 0 l-16 22 l4 -16 l-10 0 Z" fill="#f2c230" stroke="#1c1c1c" stroke-width="1.6"/><path d="M-20 -20 L20 20" stroke="#c23a26" stroke-width="5" stroke-linecap="round"/></g>';
    return s + tag(off ? "فرامل!" : "فرامل الموتور", 430, 300, u, off ? 1.6 : 0.4, 3, 20);
  });
  // 11 — power cut: the light goes out, the car just stays put
  shot(11, function (u, d) { return [320, lerp(170, 150, u / d), lerp(1.2, 1.4, u / d)]; }, function (u, d, t) {
    var dark = u > 0.6, s = shaft(t, 0) + ropes(300, 340, -300, 120, 4, t) + car(266, 120, 108, 96, t, { mood: dark ? "worry" : "n", dark: dark });
    if (dark) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1020" opacity=".35"/><circle cx="320" cy="168" r="40" fill="#fff3d6" opacity="' + f(0.15 + 0.1 * Math.sin(t * 4)) + '" filter="url(#soft)"/>';
    return s + tag("بيقف مكانه", 470, 60, u, 1.4, 3, 20);
  });
  // 12 — suppose all that fails and it starts racing down
  shot(12, function (u, d) { return [320, 180, lerp(1.1, 1.3, u / d)]; }, function (u, d, t) {
    var sp = clamp(u / 1.2), s = shaft(t, t * 600 * sp) + car(266, 130 + Math.sin(t * 30) * 2 * sp, 108, 96, t, { mood: "shock", floor: String(Math.max(1, 20 - Math.floor(u * 6))) });
    for (var k = 0; k < 6; k++) { var o = ((t * 3 + k / 6) % 1); s += '<path d="M' + (276 + k * 18) + ' ' + f(120 - o * 70) + ' v-40" stroke="#fff" stroke-width="3" opacity="' + f(0.7 * sp * (1 - o)) + '"/>'; }
    return s + tag("بينزل بسرعة؟!", 480, 80, u, 0.6, 3, 20, "#f2b0a0");
  });
  // 13 — the third: the speed governor
  shot(13, function (u, d) { return [lerp(280, 360, u / d), 160, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#5a524a"/><path d="M-400 260 H1040" stroke="#1c1c1c" stroke-width="5"/>' + sheave(320, 140, 70, t, 2.4);
    s += '<path d="M250 140 V420 M390 140 V420" stroke="#c23a26" stroke-width="4"/>';
    return s + tag("منظّم السرعة", 320, 40, u, 0.3, -2, 24);
  });
  // 14 — a pulley at the very top, turning with the car on its own rope
  shot(14, function (u, d) { return [320, lerp(80, 260, ease(u / d)), lerp(1.0, 0.85, u / d)]; }, function (u, d, t) {
    var mv = Math.sin(t * 0.9) * 40, s = shaft(t, 0) + sheave(400, -120, 36, t, Math.cos(t * 0.9) * 3);
    s += '<path d="M364 -120 V' + f(310 + mv) + ' M436 -120 V600" stroke="#c23a26" stroke-width="3.4"/>' + ropes(300, 330, -300, 300 + mv, 4, t) + car(250, 300 + mv, 108, 96, t, { mood: "n" }) + '<rect x="352" y="' + f(302 + mv) + '" width="16" height="16" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/>';
    return s + tag("حبل لوحده", 520, 60, u, 0.8, 3, 18, "#f2b0a0");
  });
  // 15 — weights inside fling outward the faster it spins
  shot(15, function (u, d) { return [320, 180, lerp(1.05, 1.3, u / d)]; }, function (u, d, t) {
    var sp = 1 + 2 * clamp(u / (d - 0.5)), ang = t * 2 * sp, open = 20 + 22 * clamp(u / (d - 0.5)), s = paper(t);
    s += '<circle cx="320" cy="180" r="120" fill="#e9e4d8" stroke="#1c1c1c" stroke-width="4"/><circle cx="320" cy="180" r="108" fill="none" stroke="#8a929c" stroke-width="3" stroke-dasharray="10 8"/>';
    for (var k = 0; k < 2; k++) { var a = ang + k * Math.PI; s += '<g transform="rotate(' + f(a * 57.3) + ' 320 180)"><path d="M320 180 L' + f(320 + open) + ' 160" stroke="#1c1c1c" stroke-width="5"/><rect x="' + f(320 + open) + '" y="146" width="46" height="26" rx="8" fill="url(#gIron)" stroke="#1c1c1c" stroke-width="2.4"/></g>'; }
    s += '<circle cx="320" cy="180" r="12" fill="#1c1c1c"/>';
    return s + tag("أسرع… تتفتح أكتر", 320, 330, u, 0.8, -2, 19);
  });
  // 16 — too fast: the weights catch a latch and the pulley stops
  shot(16, function (u, d) { return [320, 180, lerp(1.2, 1.4, u / d)]; }, function (u, d, t) {
    var hit = clamp((u - 1.0) / 0.25), ang = u < 1.0 ? t * 7 : 1.0 * 7 + (t - u - L(16)) * 0, s = paper(t);
    var a0 = u < 1.0 ? t * 7 : (L(16) + 1.0) * 7;
    s += '<circle cx="320" cy="180" r="120" fill="#e9e4d8" stroke="#1c1c1c" stroke-width="4"/>';
    for (var c = 0; c < 8; c++) { var ca = c * 0.785; s += '<path d="M' + f(320 + Math.cos(ca) * 120) + ' ' + f(180 + Math.sin(ca) * 120) + ' L' + f(320 + Math.cos(ca + 0.2) * 100) + ' ' + f(180 + Math.sin(ca + 0.2) * 100) + '" stroke="#1c1c1c" stroke-width="5"/>'; }
    for (var k = 0; k < 2; k++) { var a = a0 + k * Math.PI; s += '<g transform="rotate(' + f(a * 57.3) + ' 320 180)"><path d="M320 180 L362 160" stroke="#1c1c1c" stroke-width="5"/><rect x="362" y="146" width="46" height="26" rx="8" fill="url(#gIron)" stroke="#1c1c1c" stroke-width="2.4"/></g>'; }
    if (hit > 0) s += '<g opacity="' + f(hit) + '"><circle cx="320" cy="180" r="140" fill="none" stroke="#c23a26" stroke-width="6" opacity="' + f(0.5 + 0.5 * Math.sin(t * 10)) + '"/></g>';
    return s + tag("قفل!", 520, 70, u, 1.0, 4, 30, "#f2b0a0");
  });
  // 17 — when the pulley stops, its rope yanks a lever on the car
  shot(17, function (u, d) { return [lerp(300, 340, u / d), 130, lerp(1.6, 1.9, u / d)]; }, function (u, d, t) {
    var pull = ease(clamp((u - 0.4) / 0.6)), s = shaft(t, 0) + '<path d="M368 -300 V' + f(104 - 14 * pull) + '" stroke="#c23a26" stroke-width="4"/>' + ropes(300, 330, -300, 120, 4, t) + car(250, 120, 108, 96, t, { mood: "worry" });
    s += '<g transform="translate(360 112) rotate(' + f(-30 * pull) + ')"><path d="M0 0 H40" stroke="#1c1c1c" stroke-width="8" stroke-linecap="round"/><path d="M0 0 H40" stroke="#e2b035" stroke-width="4" stroke-linecap="round"/></g><circle cx="360" cy="112" r="5" fill="#1c1c1c"/>';
    return s + tag("بيشد ذراع", 470, 40, u, 0.6, 3, 20);
  });
  // 18 — the lever shoves steel jaws that bite onto the rails
  shot(18, function (u, d) { return [lerp(200, 230, u / d), 200, lerp(2.2, 2.6, u / d)]; }, function (u, d, t) {
    var bite = ease(clamp((u - 0.5) / 0.5)), s = shaft(t, u < 0.5 ? t * 300 : (L(18) + 0.5) * 300) + car(234, 140, 172, 140, t, { mood: "shock", n: 4 });
    s += '<path d="M214 100 V320" stroke="#c9ced4" stroke-width="2"/><g transform="translate(' + f(240 - 14 * bite) + ' 300)"><path d="M0 -20 L16 -10 L16 10 L0 20 Z" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/></g>';
    if (bite > 0.8) for (var k = 0; k < 8; k++) { var a = -1.2 + k * 0.3, r = 8 + ((t * 40 + k * 7) % 18); s += '<circle cx="' + f(214 + Math.cos(a) * r) + '" cy="' + f(300 + Math.sin(a) * r) + '" r="2.4" fill="#f2c230"/>'; }
    return s + tag("فكوك على القضبان!", 330, 60, u, 0.9, -3, 18);
  });
  // 19 — it brakes and stops within a metre or two
  shot(19, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.4)), s = shaft(t, -k * 60) + ropes(300, 340, -300, 140, 2, t, [1, 0.6]) + car(266, 140, 108, 96, t, { mood: k > 0.95 ? "happy" : "worry" });
    s += '<rect x="470" y="100" width="34" height="200" fill="#e2b035" stroke="#1c1c1c" stroke-width="2"/>'; for (var m = 0; m <= 4; m++) s += '<path d="M470 ' + (100 + m * 50) + ' h14" stroke="#1c1c1c" stroke-width="2"/>';
    s += '<text x="520" y="210" style="font:800 18px Noto Serif;fill:#1c1c1c;paint-order:stroke;stroke:#fff;stroke-width:5px;direction:ltr">' + (k * 1.5).toFixed(1) + ' m</text>';
    return s + tag("متر أو اتنين بس", 320, 330, u, 1.2, -2, 19);
  });
  // 20 — the idea is from 1854
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9c49a"/>' + paper(t).replace('fill="#f4efe4"', 'fill="#e6d2a6"').replace('stroke="#d9cdb3"', 'stroke="#cbb486"');
    var n = Math.round(lerp(2026, 1854, clamp(u / 1.4))); s += '<text x="320" y="210" text-anchor="middle" style="font:900 96px Noto Serif;fill:#5b4636;direction:ltr;paint-order:stroke;stroke:#f4e6c6;stroke-width:8px">' + n + '</text>';
    return s + tag("أكتر من 170 سنة!", 320, 300, u, 1.4, -2, 20);
  });
  // 21 — Otis on a high platform in front of a crowd: cut the rope! …it stops
  shot(21, function (u, d) { return [lerp(300, 340, u / d), lerp(170, 190, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var cutAt = 3.6, drop = u > cutAt ? Math.min(14, (u - cutAt) * 60) : 0, cheer = u > cutAt + 0.5;
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e6d2a6"/><rect x="-400" y="270" width="1440" height="300" fill="#b39a6a"/>';
    s += '<path d="M240 -100 V330 M400 -100 V330" stroke="#6b4a30" stroke-width="12"/><path d="M230 -100 H410" stroke="#6b4a30" stroke-width="12"/><path d="M320 -100 V' + f(u > cutAt ? 20 : 86 + drop) + '" stroke="#5b4636" stroke-width="5"/>';
    s += '<g transform="translate(0 ' + f(drop) + ')"><rect x="250" y="150" width="140" height="14" fill="#8c6440" stroke="#1c1c1c" stroke-width="2"/><path d="M250 150 L320 90 L390 150" fill="none" stroke="#5b4636" stroke-width="3"/>';
    s += '<path d="M306 150 C306 120 334 120 334 150 Z" fill="#2b2f34" stroke="#1c1c1c" stroke-width="2"/>' + head(320, 108, 13, cheer ? "happy" : "n", t, 0) + '<rect x="308" y="80" width="24" height="16" fill="#1c1c1c"/><rect x="302" y="94" width="36" height="4" fill="#1c1c1c"/></g>';
    if (u > cutAt - 1.2 && u < cutAt + 0.4) s += '<g transform="translate(300 30) rotate(' + f(u < cutAt ? -40 + (u - cutAt + 1.2) * 30 : 0) + ')"><path d="M0 0 L-30 -30" stroke="#6b4a30" stroke-width="6"/><path d="M-40 -40 L-22 -20 L-34 -44 Z" fill="#8a929c" stroke="#1c1c1c" stroke-width="2"/></g>';
    for (var p = 0; p < 7; p++) { var px = 40 + p * 90 + (p > 3 ? 120 : 0), jump = cheer ? Math.abs(Math.sin(t * 8 + p)) * 8 : 0; if (px > 230 && px < 410) continue; s += '<path d="M' + (px - 14) + ' 330 C' + (px - 14) + ' 300 ' + (px + 14) + ' 300 ' + (px + 14) + ' 330 Z" fill="' + ["#5b4636", "#3f6f8f", "#8f2618", "#4f8f5a"][p % 4] + '" stroke="#1c1c1c" stroke-width="1.6"/>' + head(px, 290 - jump, 12, cheer ? "happy" : "curious", t + p, 0) + '<rect x="' + (px - 9) + '" y="' + (262 - jump) + '" width="18" height="12" fill="#1c1c1c"/>'; }
    return s + tag("اقطعوا الحبل!", 160, 40, u, 0.6, -3, 20) + tag("ووقفت!", 500, 60, u, cutAt + 0.4, 3, 26);
  });
  // 22 — the fourth: big springs at the bottom of the pit
  shot(22, function (u, d) { return [320, lerp(160, 230, u / d), lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var k = 0.5 + 0.5 * Math.sin((u - 0.6) * 2.2), cy = lerp(60, 120, k), sq = clamp((cy - 90) / 30), s = shaft(t, 0) + '<rect x="200" y="300" width="240" height="200" fill="#5b4636"/>';
    for (var sp = 0; sp < 2; sp++) { var x = 270 + sp * 100, top = lerp(210, 236, sq), d0 = "M" + x + " 300"; for (var c = 0; c < 8; c++) d0 += " L" + (x + (c % 2 ? 16 : -16)) + " " + f(lerp(300, top, (c + 1) / 8)); s += '<path d="' + d0 + '" stroke="#c9a650" stroke-width="5" fill="none"/><rect x="' + (x - 20) + '" y="' + f(top - 8) + '" width="40" height="8" fill="#8a929c" stroke="#1c1c1c"/>'; }
    s += car(266, cy, 108, 96, t, { mood: "happy", floor: "B" });
    return s + tag("سوست في البير", 470, 60, u, 0.5, 3, 20);
  });
  // 23 — four layers of safety, each enough on its own
  shot(23, function (u, d) { return [lerp(260, 380, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = paper(t), nm = ["حبال كتير", "تقل وفرامل", "منظّم السرعة", "سوست"];
    for (var k = 0; k < 4; k++) { var p = pop((u - k * 0.7) / 1.2); if (p <= 0) continue; s += shield(110 + k * 140, 160 + Math.sin(t * 2.2 + k) * 5, p * 1.3, k + 1, true) + '<text x="' + (110 + k * 140) + '" y="260" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#1c1c1c">' + nm[k] + '</text>'; }
    return s + tag("كل واحدة تكفّي لوحدها", 320, 320, u, 2.8, -2, 19);
  });
  // 24 — outro: doors open, everyone waves
  shot(24, function (u, d) { return [lerp(290, 350, u / d), 170, lerp(1.2, 1.5, u / d)]; }, function (u, d, t) {
    var s = shaft(t, 0) + ropes(300, 340, -300, 120, 4, t) + car(266, 120, 108, 96, t, { mood: "happy", open: clamp(u / 1.0), floor: "G" });
    return s + tag("حكاية إيه المرة الجاية؟", 320, 278, u, 0.4, -2, 18);
  });

  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
