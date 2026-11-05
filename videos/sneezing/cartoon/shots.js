  // ── «ليه بنعطس؟»: a sagittal cut of the head (face to the right), the nose lining, the trigeminal nerve up to the
  // brainstem's sneeze centre, then the chest, the throat and the spray. Shapes are simplified from anatomy diagrams.
  var INK = "#1c1c1c", SKIN = "#f2c9a0", PINK = "#f08a9a", PINKD = "#c95b72", BRAIN = "#f6b3c0", BRAIND = "#d97d92",
      NERVE = "#ffd166", DUST = "#c9a24a", GERM = "#6fae4a", MUC = "#dbeeb0", ALERT = "#e2523a", AIR = "#7ec8e8";
  var HX = 320, HY = 170;
  var SKINP = "M0 -92 C40 -94 62 -74 66 -48 C68 -36 72 -26 80 -8 C84 0 78 4 68 6 C70 14 72 20 66 26 C60 30 62 36 66 44 C68 56 60 66 52 74 C44 84 40 96 26 104 L-44 104 C-70 84 -74 56 -76 20 C-80 -10 -76 -40 -66 -64 C-52 -84 -30 -92 0 -92 Z";
  var BRAINP = "M-58 -44 C-58 -80 -22 -88 2 -74 C22 -62 26 -40 22 -24 C18 -8 2 0 -14 -2 C-36 -2 -58 -10 -58 -44 Z";
  var NOSEP = "M80 -2 C60 -6 44 -10 30 -6 C16 -2 8 6 2 14 L-4 22 L4 26 C14 16 24 14 40 14 C56 14 68 10 78 6 Z";
  var STEMP = "M-16 -4 H6 L4 34 H-14 Z";
  var NERVEP = [[48, 8], [40, -6], [18, -26]], OPTP = [[40, -46], [26, -68], [0, -48]];
  var ZIGP = "M40 -6 L30 -16 L24 -8 L16 -24 L10 -16 L2 -34 L-6 -28 L-14 -46";
  var SHIELD = "M0 -40 L34 -26 L30 6 C26 26 12 36 0 42 C-12 36 -26 26 -30 6 L-34 -26 Z";
  function qb(p, u) { var k = 1 - u; return [k * k * p[0][0] + 2 * k * u * p[1][0] + u * u * p[2][0], k * k * p[0][1] + 2 * k * u * p[1][1] + u * u * p[2][1]]; }
  function qd(p) { return "M" + p[0][0] + " " + p[0][1] + " Q" + p[1][0] + " " + p[1][1] + " " + p[2][0] + " " + p[2][1]; }

  // the head: skin outline, brain, brainstem, nasal lining, trigeminal nerve (o.nerve: signal running), optic nerve, eye.
  // o: {s, x, y, brain (0..1 alarm glow), stem (highlight), center (sneeze centre pulses), cilia, nerve, optic, zig, mood, air}
  function profile(t, o) {
    o = o || {}; var s = o.s || 1, x = o.x == null ? HX : o.x, y = (o.y == null ? HY : o.y) + 3 * Math.sin(t * 2.2), pu = 0.5 + 0.5 * Math.sin(t * 5), g = "";
    g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="' + SKINP + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<path d="' + BRAINP + '" fill="' + BRAIN + '" stroke="' + BRAIND + '" stroke-width="2"/>';
    g += '<path d="M-46 -54 Q-32 -64 -16 -56 M-38 -30 Q-20 -38 0 -30 M-44 -14 Q-24 -18 -2 -12" stroke="' + BRAIND + '" stroke-width="1.6" fill="none"/>';
    if (o.brain) g += '<path d="' + BRAINP + '" fill="' + ALERT + '" opacity="' + f((0.2 + 0.35 * pu) * o.brain) + '"/>';
    g += '<path d="' + STEMP + '" fill="' + (o.stem ? NERVE : BRAIND) + '" stroke="' + INK + '" stroke-width="' + (o.stem ? 2.6 : 1.2) + '"/>';
    g += '<path d="' + NOSEP + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/>';
    if (o.center) g += '<circle cx="-6" cy="26" r="' + f(7 + 9 * pu) + '" fill="' + ALERT + '" opacity="' + f(0.3 + 0.4 * pu) + '"/>';
    g += '<circle cx="-6" cy="26" r="3.6" fill="' + ALERT + '" stroke="' + INK + '" stroke-width="1"/>';
    if (o.cilia) for (var i = 0; i < 7; i++) { var cx = 14 + i * 9, wv = Math.sin(t * 7 + i * 1.7) * 4; g += '<path d="M' + cx + ' 14 q' + f(wv) + ' -4 ' + f(wv * 1.2) + ' -8" stroke="' + PINKD + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>'; }
    g += '<path d="' + qd(NERVEP) + '" stroke="' + (o.nerve ? NERVE : BRAIND) + '" stroke-width="' + (o.nerve ? 3 : 1.4) + '" fill="none" stroke-dasharray="3 3"/>';
    if (o.nerve) for (var k = 0; k < 3; k++) { var p = qb(NERVEP, (t * 0.9 + k / 3) % 1); g += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="3" fill="' + NERVE + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    if (o.optic) { g += '<path d="' + qd(OPTP) + '" stroke="' + AIR + '" stroke-width="3" fill="none"/>'; for (var j = 0; j < 3; j++) { var q = qb(OPTP, (t * 0.8 + j / 3) % 1); g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="2.6" fill="' + AIR + '"/>'; } }
    if (o.zig) g += '<path d="' + ZIGP + '" stroke="' + ALERT + '" stroke-width="3" fill="none" stroke-linejoin="round" stroke-dasharray="' + (2 + pu * 3).toFixed(1) + ' 2"/>';
    g += '<g transform="translate(40 -46)">' + eyes(o.mood || "n", t, 8) + '</g>';
    if (o.air) g += airflow(t, 90, 170, 2, 6, "#ffffff", 1.4, 4);
    return g + "</g>";
  }
  // the chest (side view): lungs grow with b (0..1), the diaphragm drops with them, abdominal muscles can glow
  function bob(t, g) { return '<g transform="translate(0 ' + f(2.5 * Math.sin(t * 2.2)) + ')">' + g + "</g>"; }
  function torso(t, o) {
    o = o || {}; var b = o.b || 0, pu = 0.5 + 0.5 * Math.sin(t * 6), g = "";
    g += '<path d="M276 110 C300 98 340 98 364 110 C384 122 388 170 384 230 C380 268 360 286 320 288 C280 286 262 268 258 230 C254 170 258 122 276 110 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
    var lr = 24 + 10 * b + 1.5 * Math.sin(t * 2);
    g += '<ellipse cx="296" cy="168" rx="' + f(lr * 0.62) + '" ry="' + f(lr) + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/><ellipse cx="344" cy="168" rx="' + f(lr * 0.62) + '" ry="' + f(lr) + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/>';
    var dy = 220 + 14 * b;
    g += '<path d="M268 ' + f(dy) + ' Q320 ' + f(dy - 28) + ' 372 ' + f(dy) + '" stroke="' + ALERT + '" stroke-width="' + (o.dia ? 4 : 2.4) + '" fill="none"/>';
    for (var i = 0; i < 4; i++) { var ay = 238 + i * 9; g += '<path d="M296 ' + ay + ' H346" stroke="' + (o.abs ? ALERT : BRAIND) + '" stroke-width="2" opacity="' + f(o.abs ? 0.35 + 0.5 * pu : 0.6) + '"/>'; }
    if (o.air) g += airflow(t, 200, 258, 200, 5, AIR, 1.2, 2);
    return bob(t, g);
  }
  // the throat from the front: a tube with two vocal folds; c = how closed the folds are (0 open .. 1 shut)
  function throat(t, c) {
    var gap = 36 * (1 - c), g = '<rect x="280" y="30" width="80" height="300" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="3"/>';
    for (var i = 0; i < 9; i++) g += '<path d="M280 ' + (50 + i * 30) + ' H360" stroke="' + PINKD + '" stroke-width="2" opacity=".5"/>';
    for (var m = 0; m < 8; m++) g += '<circle cx="' + f(296 + hash(m) * 48) + '" cy="' + f(40 + ((t * 30 + m * 40) % 260)) + '" r="3.2" fill="' + MUC + '" stroke="' + PINKD + '" stroke-width="1"/>';
    g += '<path d="M280 170 L' + f(320 - gap) + ' 170" stroke="' + PINKD + '" stroke-width="9" stroke-linecap="round"/><path d="M360 170 L' + f(320 + gap) + ' 170" stroke="' + PINKD + '" stroke-width="9" stroke-linecap="round"/>';
    return g;
  }
  function bgIn(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f6e7d6"/>';
    for (var i = 0; i < 26; i++) { var x = -300 + hash(i) * 1240 + Math.sin(t * 0.7 + i) * 8, y = ((hash(i + 5) * 700 - t * (30 + hash(i) * 40)) % 700 + 700) % 700 - 300; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1.2 + hash(i + 2) * 2.2) + '" fill="#d9b48f" opacity=".6"/>'; }
    return s;
  }
  function puffs(t, x, y0, n, col) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 1.6 + i / n) % 1, y = y0 - u * 260, px = x + Math.sin(u * 8 + i) * 16; s += '<circle cx="' + f(px) + '" cy="' + f(y) + '" r="' + f(4 + u * 14) + '" fill="' + (col || "#ffffff") + '" stroke="' + AIR + '" stroke-width="1.4" opacity="' + f(1 - u) + '"/>'; } return s; }
  function sparks(t, cx, cy, rx, ry, n) { var s = ""; for (var i = 0; i < n; i++) { var a = t * 4 + i * 2 * Math.PI / n; s += '<circle cx="' + f(cx + Math.cos(a) * rx) + '" cy="' + f(cy + Math.sin(a) * ry) + '" r="2.6" fill="' + NERVE + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; }
  function paper(t, i) { var x = 300 + ((hash(i) * 260 + t * 150) % 340), y = 100 + hash(i + 3) * 160 + Math.sin(t * 3 + i) * 8; return '<rect x="' + f(x - 11) + '" y="' + f(y - 8) + '" width="22" height="16" fill="#fff" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + f(t * 200 + i * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>'; }
  function alarm(x, y, t, sc) { var k = (sc || 1) * (1 + 0.12 * Math.sin(t * 8)); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><path d="M0 -30 L30 22 L-30 22 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><text y="14" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:' + INK + '">!</text></g>'; }
  function qmk(x, y, t, sz) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:#f2c230;stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // label at the top of the visible area of a camera centred on (cx, cy) with zoom z (screen size scr px)
  function vt(cx, cy, z, text, u, u0, scr, col) { return tag(text, cx, cy - 130 / z, u, u0, -3, scr / z, col); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function sk(t) { return sky("day") + clouds(t, 30, 40, 4, 0.85); }
  function zoom(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function still(x, y, z) { return function () { return [x, y, z]; }; }

  // 0 — hook: a sneeze blows the papers off the desk
  shot(0, zoom(320, 170, 1.0, 320, 170, 1.1), function (u, d, t) {
    var s = sk(t), i;
    for (i = 0; i < 6; i++) s += paper(t, i);
    return s + profile(t, { x: 300, mood: "shock", air: 1 }) + vt(320, 180, 1, "عطسة في ثانية!", u, 0.6, 24);
  });
  // 1 — the sneeze is fast and complicated
  shot(1, still(320, 170, 1.0), function (u, d, t) {
    return sk(t) + profile(t, { brain: 1 }) + sparks(t, 300, 130, 48, 40, 8) + vt(320, 180, 1, "أسرع وأعقد!", u, 0.6, 24);
  });
  // 2 — the question
  shot(2, still(320, 170, 1.05), function (u, d, t) {
    return sk(t) + profile(t, { mood: "curious", brain: 0.3 }) + qmk(232, 110, t, 46) + qmk(410, 110, t, 36) + vt(320, 180, 1, "ليه ده؟", u, 0.6, 24);
  });
  // 3 — the brand line
  shot(3, still(320, 170, 1.0), function (u, d, t) {
    return sk(t) + profile(t, { mood: "happy" }) + vt(320, 180, 1, "إيه الحكاية؟", u, 0.5, 26);
  });
  // 4 — zoom to the nose
  shot(4, zoom(320, 170, 1.0, 362, 176, 1.5), function (u, d, t) {
    return sk(t) + profile(t, {}) + arrow(440, 60, 404, 166, ALERT, 5, clamp(u / 1.2)) + vt(362, 176, 1.5, "الأنف!", u, 0.9, 22);
  });
  // 5 — inside the nose: hairs (cilia) filter the air
  shot(5, zoom(350, 174, 2.0, 350, 174, 2.4), function (u, d, t) {
    return bgIn(t) + profile(t, { cilia: 1 }) + airflow(t, 300, 420, 180, 6, AIR, 1.2, 2) + vt(350, 174, 2.4, "شعيرات بتصفّي الهوا", u, 0.6, 18);
  });
  // 6 — a dust particle touches the lining and the nerves fire
  shot(6, zoom(370, 172, 2.0, 370, 172, 2.1), function (u, d, t) {
    var k = clamp(u / (d * 0.55)), dx = lerp(450, 376, ease(k)), dy = lerp(130, 176, ease(k)), touch = u > d * 0.55;
    var s = bgIn(t) + profile(t, { cilia: 1, nerve: touch ? 1 : 0 });
    s += '<circle cx="' + f(dx) + '" cy="' + f(dy) + '" r="' + f(touch ? 7 + 1.5 * Math.sin(t * 9) : 6) + '" fill="' + DUST + '" stroke="' + INK + '" stroke-width="1.4"/>';
    return s + vt(370, 172, 2.1, "جزيء غريب!", u, 0.5, 18);
  });
  // 7 — the trigeminal nerve
  shot(7, zoom(350, 160, 1.9, 350, 160, 2.0), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1 }) + vt(350, 160, 2.0, "العصب ثلاثي التوائم", u, 0.6, 19);
  });
  // 8 — the signal reaches the brain
  shot(8, zoom(320, 150, 1.5, 320, 150, 1.6), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1, brain: 0.6 }) + alarm(250, 100, t, pop(u / 0.6)) + vt(320, 150, 1.6, "إنذار للمخ!", u, 0.5, 20);
  });
  // 9 — the brainstem
  shot(9, zoom(314, 196, 1.8, 314, 196, 1.9), function (u, d, t) {
    return sk(t) + profile(t, { stem: 1 }) + '<circle cx="314" cy="196" r="' + f(30 + 3 * Math.sin(t * 4)) + '" fill="none" stroke="' + NERVE + '" stroke-width="3" stroke-dasharray="6 6"/>' + vt(314, 196, 1.9, "جذع المخ", u, 0.6, 22);
  });
  // 10 — the sneeze centre
  shot(10, zoom(314, 196, 2.6, 314, 196, 2.8), function (u, d, t) {
    return sk(t) + profile(t, { stem: 1, center: 1 }) + vt(314, 196, 2.8, "مركز العطس", u, 0.6, 22);
  });
  // 11 — the irritant has to be pushed out
  shot(11, zoom(324, 164, 1.25, 324, 164, 1.3), function (u, d, t) {
    var s = sk(t) + profile(t, { center: 1, mood: "worry" }), i;
    for (i = 0; i < 6; i++) { var x = 400 + ((t * 120 + i * 60) % 170), y = 165 + Math.sin(t * 5 + i) * 20; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.4" fill="' + DUST + '" opacity="' + f(1 - (x - 400) / 170) + '"/>'; }
    return s + vt(324, 164, 1.3, "لازم نطردها!", u, 0.6, 22);
  });
  // 12 — the orders go down the spine to the chest and the belly
  shot(12, still(320, 190, 1.0), function (u, d, t) {
    var s = sk(t) + torso(t, { abs: 1 }), i;
    for (i = 0; i < 5; i++) s += '<circle cx="320" cy="' + f(60 + ((t * 60 + i * 12) % 40) + i * 6) + '" r="3" fill="' + ALERT + '"/>';
    return s + vt(320, 190, 1, "عضلات الصدر والبطن", u, 0.6, 22);
  });
  // 13 — the deep breath in
  shot(13, still(320, 190, 1.0), function (u, d, t) {
    return sk(t) + torso(t, { b: ease(clamp(u / d)), air: 1, dia: 1 }) + vt(320, 190, 1, "شهيق عميق", u, 0.6, 22);
  });
  // 14 — the voice box closes and the pressure builds
  shot(14, still(320, 170, 1.2), function (u, d, t) {
    var c = ease(clamp(u / (d * 0.8)));
    return bgIn(t) + throat(t, c) + gauge(420, 120, 26, c, "الضغط") + vt(320, 170, 1.2, "المزمار اتقفل!", u, 0.6, 22);
  });
  // 15 — the flaps burst open and the air comes out
  shot(15, still(320, 170, 1.2), function (u, d, t) {
    var c = 1 - ease(clamp((u - d * 0.45) / (d * 0.2)));
    return bgIn(t) + throat(t, c) + puffs(t, 320, 160, 16) + vt(320, 170, 1.2, "فجأة!", u, 0.4, 24);
  });
  // 16 — the speed
  shot(16, still(320, 180, 1.0), function (u, d, t) {
    var s = bgIn(t) + airflow(t, -60, 700, 90, 12, AIR, 2.2, 8) + airflow(t, -60, 700, 260, 10, AIR, 2.0, 6);
    return s + gauge(320, 190, 90, ease(clamp(u / (d * 0.8))), "كم/س") + vt(320, 180, 1, "160 كم في الساعة", u, 0.6, 22);
  });
  // 17 — as fast as a car on the highway
  shot(17, still(320, 180, 1.0), function (u, d, t) {
    return sk(t) + grass(t, 230, "#9dbb6e", "#6f9548") + '<rect x="-400" y="250" width="1440" height="60" fill="url(#road)"/>' + cars(t, 276, 260) + airflow(t, -40, 320, 218, 5, AIR, 2, 3) + vt(320, 180, 1, "أسرع من عربية!", u, 0.6, 22);
  });
  // 18 — mucus and germs fly out
  shot(18, still(330, 170, 1.0), function (u, d, t) {
    var s = bgIn(t), i, a, r, x, y;
    for (i = 0; i < 14; i++) {
      a = (hash(i) - 0.5) * 1.2; r = ((t * 90 + i * 30) % 300); x = 330 + Math.cos(a) * r; y = 170 + Math.sin(a) * r * 0.7;
      s += i % 2 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + GERM + '" stroke="' + INK + '" stroke-width="1"/>' : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" fill="' + MUC + '" stroke="' + PINKD + '" stroke-width="1.2"/>';
    }
    return s + profile(t, { x: 250 }) + vt(330, 170, 1, "مخاط وجراثيم!", u, 0.6, 22);
  });
  // 19 — the eyes shut on their own
  shot(19, still(320, 170, 1.0), function (u, d, t) {
    var h = 22 * ease(clamp(u / (d * 0.5))), s = sk(t) + '<circle cx="320" cy="170" r="76" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>', i, ex;
    for (i = 0; i < 2; i++) { ex = i ? 342 : 298; s += '<circle cx="' + ex + '" cy="160" r="9" fill="' + INK + '"/><rect x="' + (ex - 11) + '" y="148" width="22" height="' + f(h) + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="1.4"/>'; }
    return bob(t, s) + vt(320, 170, 1, "عينك بتقفل!", u, 0.8, 22);
  });
  // 20 — the bright light
  shot(20, still(320, 180, 1.0), function (u, d, t) {
    var s = sk(t) + '<circle cx="520" cy="70" r="28" fill="#ffd54a"/>', i, a;
    for (i = 0; i < 8; i++) { a = t * 0.3 + i * Math.PI / 4; s += '<path d="M' + f(520 + Math.cos(a) * 40) + ' ' + f(70 + Math.sin(a) * 40) + ' L' + f(520 + Math.cos(a) * 62) + ' ' + f(70 + Math.sin(a) * 62) + '" stroke="#ffd54a" stroke-width="3" stroke-linecap="round" opacity="' + f(0.5 + 0.5 * Math.sin(t * 6 + i)) + '"/>'; }
    return s + bob(t, head(320, 200, 60, "shock", t)) + vt(320, 180, 1, "الضوء القوي!", u, 0.7, 22);
  });
  // 21 — the light nerve and the nose nerve cross in the brain
  shot(21, zoom(330, 130, 1.7, 330, 130, 1.8), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1, optic: 1, brain: 0.6 }) + vt(330, 130, 1.8, "إشارات بتتخلط!", u, 0.6, 20);
  });
  // 22 — the signal is routed wrongly
  shot(22, zoom(320, 150, 1.5, 320, 150, 1.6), function (u, d, t) {
    return sk(t) + profile(t, { zig: 1, brain: 0.8 }) + vt(320, 150, 1.6, "المخ بيفهمها عطسة!", u, 0.6, 20);
  });
  // 23 — the spray reaches about 8 metres
  shot(23, still(320, 180, 0.95), function (u, d, t) {
    var s = sk(t) + grass(t, 262, "#9dbb6e", "#6f9548") + profile(t, { x: 210, y: 150, s: 0.7 }), i, x, y;
    for (i = 0; i < 40; i++) { x = 266 + ((hash(i) * 600 + t * 180) % 520); y = 150 + (hash(i + 7) - 0.5) * 40 + Math.sin(t * 4 + i) * 6; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="2" fill="#bfe6f7" stroke="#2f7fb8" stroke-width=".6"/>'; }
    return s + arrow(266, 300, 586, 300, INK, 2.4, clamp(u / (d * 0.7))) + vt(320, 180, 0.95, "حوالي تمانية متر!", u, 1.0, 22);
  });
  // 24 — the hand over the mouth, then washing
  shot(24, still(320, 180, 1.0), function (u, d, t) {
    var s = sk(t) + bob(t, head(300, 170, 70, "happy", t)), i, x, y;
    s += '<ellipse cx="' + f(346 + Math.sin(t * 8) * 2) + '" cy="206" rx="20" ry="15" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
    for (i = 0; i < 10; i++) { y = 230 - ((t * 40 + i * 25) % 120); x = 346 + Math.sin(t * 6 + i) * 14 + (hash(i) - 0.5) * 30; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(3 + hash(i + 3) * 4) + '" fill="#fff" stroke="#8fb6cf" stroke-width="1.2"/>'; }
    return s + vt(320, 180, 1, "اغسل إيدك!", u, 0.8, 22);
  });
  // 25 — the body protects itself
  shot(25, still(320, 180, 1.0), function (u, d, t) {
    return sk(t) + bob(t, head(300, 170, 62, "happy", t)) + '<g transform="translate(430 170) scale(' + f(pop(u / 0.9)) + ')"><path d="' + SHIELD + '" fill="#4f8fd8" stroke="' + INK + '" stroke-width="2.6"/><path d="M-14 0 L-4 10 L16 -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>' + vt(320, 180, 1, "حماية تلقائية", u, 0.6, 22);
  });
  // 26 — outro
  shot(26, zoom(300, 180, 1.0, 340, 180, 1.0), function (u, d, t) {
    return sk(t) + profile(t, { x: 320, y: 170, s: 0.9, mood: "happy" }) + tag("قولولنا!", 460, 60, u, 0.4, 3, 26);
  });

  window.__parts = { profile: profile, torso: torso, throat: throat };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 18 * Math.sin(t * 1.7), cy = c[1] + 14 * Math.cos(t * 1.7), z = c[2] * (1 + 0.04 * Math.sin(t * 1.3));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
