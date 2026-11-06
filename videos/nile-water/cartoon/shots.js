  // ── the 25 shots (full-bleed 360×436 picture, reference look) ──
  var K = window.__kit, f = K.f, pop = K.pop, clamp = K.clamp, hash = K.hash, ORANGE = K.ORANGE, YEL = K.YEL, PINK = K.PINK, GREEN = K.GREEN, BLUE = K.BLUE, lerp = K.lerp;
  var RIVER = [[400, 470], [330, 370], [250, 330], [170, 250], [120, 150], [30, 60], [-40, -20]];   // the Nile from the bottom right to the top left
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: K.L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function CAM(x, y, z) { return function (u, d) { var k = clamp(u / d); return [lerp(x[0], x[1], k), lerp(y[0], y[1], k), lerp(z[0], z[1], k)]; }; }

  function reveal(u, d) { return clamp(u / (d * 0.5)); }   // a thing that grows over the first half of its shot

  // 0 — the hook: the tap at home
  shot(0, CAM([170, 190], [180, 160], [1.25, 1.0]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#tileG)"/>';
    for (var x = -60; x < 420; x += 40) s += '<path d="M' + x + ' -60 V500" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>';
    s += '<rect x="90" y="250" width="200" height="110" rx="20" fill="url(#concG)" stroke="#fff" stroke-width="4"/><rect x="108" y="268" width="164" height="80" rx="12" fill="url(#waterG)" stroke="#fff" stroke-width="3"/>';
    s += '<rect x="175" y="60" width="26" height="110" rx="8" fill="url(#steelG)" stroke="#fff" stroke-width="4"/>';
    s += '<path d="M188 60 Q188 30 230 30 Q248 30 248 60" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M188 60 Q188 30 230 30 Q248 30 248 60" fill="none" stroke="url(#steelG)" stroke-width="6" stroke-linecap="round"/>';
    s += '<rect x="240" y="58" width="22" height="46" rx="6" fill="url(#steelG)" stroke="#fff" stroke-width="3"/>';
    s += K.flow(t, [[251, 104], [251, 240]], "#bfeaff", 9, 0.9, 5);
    s += '<path d="M251 104 L251 240" stroke="#7fd3f5" stroke-width="10" opacity=".6"/>';
    s += '<path d="M120 238 V330 M300 238 V330" stroke="#fff" stroke-width="0"/>' + K.spark(70, 150, t, YEL) + K.spark(300, 200, t + 1, YEL);
    return s + K.tag("الميه دي جاية منين؟", 180, 380, u, 0.6, 22, ORANGE);
  });

  // 1 — the river is far away, the tap is at home
  shot(1, CAM([160, 200], [200, 200], [1.0, 1.1]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-60" y="330" width="480" height="200" fill="url(#grassG)"/>';
    s += '<path d="M-60 400 Q180 360 420 390" stroke="none" fill="none"/>';
    s += '<path d="M' + RIVER.map(function (p) { return p[0] + " " + p[1]; }).join(" L") + '" stroke="#fff" stroke-width="58" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="M' + RIVER.map(function (p) { return p[0] + " " + p[1]; }).join(" L") + '" stroke="url(#waterG)" stroke-width="50" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="M' + RIVER.map(function (p) { return p[0] + " " + p[1]; }).join(" L") + '" stroke="#bfeaff" stroke-width="5" stroke-dasharray="16 26" stroke-dashoffset="' + f(-t * 60) + '" fill="none" opacity=".7"/>';
    s += K.flow(t, RIVER, "#fff", 8, 0.1, 4);
    s += K.pipe([[250, 330], [250, 300], [320, 300], [320, 250]], 10);
    s += '<rect x="290" y="200" width="60" height="60" fill="#ffd9b0" stroke="#fff" stroke-width="3"/><path d="M280 202 L320 160 L360 202Z" fill="#ff7a5c" stroke="#fff" stroke-width="3"/>';
    return s + K.tag("من نهر بعيد جداً!", 180, 60, u, 0.9, 22, ORANGE);
  });

  // 2 — muddy water vs clear water
  shot(2, CAM([180, 180], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<circle cx="95" cy="200" r="78" fill="#fff" stroke="#fff" stroke-width="5" opacity=".2"/><circle cx="95" cy="200" r="72" fill="url(#mudG)" stroke="#fff" stroke-width="4"/>' + K.floc(95, 200, 50, 14, 2, 1) + K.sand(60, 160, 70, 80, 12, 3);
    s += '<circle cx="265" cy="200" r="78" fill="#fff" stroke="#fff" stroke-width="5" opacity=".2"/><circle cx="265" cy="200" r="72" fill="url(#waterG)" stroke="#fff" stroke-width="4"/>' + K.spark(240, 170, t, "#fff") + K.spark(290, 230, t + 2, "#fff") + K.spark(262, 205, t + 4, "#fff");
    s += '<path d="M205 200 L225 200" stroke="#fff" stroke-width="6" stroke-linecap="round"/>';
    s += K.big("؟", 180, 330, 72, YEL);
    return s + K.tag("عكرة!", 95, 318, u, 0.6, 22, "#7a4f2a") + K.tag("صافية؟", 265, 318, u, 1.4, 22, "#2a8fc0");
  });

  // 3 — the question
  shot(3, CAM([180, 200], [180, 180], [1.0, 1.1]), function (u, d, t) {
    var s = water(t, 0) + K.bubbles(t, 180, 436, 14, 0.2, 360, 4);
    s += K.big("؟", 150 + Math.sin(t) * 6, 240, 190, YEL) + K.big("؟", 290, 130, 60, ORANGE) + K.big("؟", 60, 330, 46, PINK);
    return s + K.tag("إيه الحكاية؟", 180, 60, u, 0.3, 26, ORANGE);
  });

  // 4 — the Nile is very long
  shot(4, CAM([180, 180], [180, 200], [1.0, 1.0]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-60" y="0" width="480" height="500" fill="url(#grassG)" opacity=".5"/>';
    var n = 8, p = RIVER.map(function (q) { return q; }), k = reveal(u, d);
    s += '<path d="M' + RIVER.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + '" stroke="#fff" stroke-width="54" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + f(1200 * k) + ' 1200"/>';
    s += '<path d="M' + RIVER.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + '" stroke="url(#waterG)" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + f(1200 * k) + ' 1200"/>';
    s += K.flow(t, RIVER, "#fff", 10, 0.12, 4);
    return s + K.big("6650 كم!", 180, 80, 44, ORANGE) + K.tag("أطول نهر في الدنيا تقريباً", 180, 400, u, 1.4, 17, "#0d1a33");
  });

  // 5 — two sources: the White Nile from the lake, the Blue Nile from the highlands
  shot(5, CAM([180, 180], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = sky("day", t);
    s += '<path d="M-60 250 L40 120 L120 170 L190 90 L280 180 L330 140 L420 250 V500 H-60Z" fill="url(#hillG)" stroke="#fff" stroke-width="4"/><path d="M190 90 l22 30 l-14 -4 l-16 14z" fill="#fff"/>';
    s += '<ellipse cx="70" cy="300" rx="76" ry="36" fill="url(#waterG)" stroke="#fff" stroke-width="4"/>';
    var a = [[120, 300], [200, 330], [240, 360]], b = [[300, 210], [270, 280], [240, 360]], c = [[240, 360], [260, 420], [300, 470]];
    s += '<path d="M120 300 Q190 330 240 360 Q270 420 300 470" stroke="#fff" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M120 300 Q190 330 240 360 Q270 420 300 470" stroke="url(#waterG)" stroke-width="22" fill="none" stroke-linecap="round"/>';
    s += '<path d="M300 210 Q270 280 240 360" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M300 210 Q270 280 240 360" stroke="url(#waterG)" stroke-width="14" fill="none" stroke-linecap="round"/>';
    s += K.flow(t, a, "#fff", 4, 0.22, 4) + K.flow(t, b, "#fff", 4, 0.22, 4) + K.flow(t, c, "#fff", 5, 0.2, 4);
    s += K.tag("النيل الأبيض", 70, 250, u, 0.4, 16, "#2a8fc0") + K.tag("النيل الأزرق", 290, 170, u, 1.2, 16, "#2a8fc0");
    return s + K.tag("بحيرة فيكتوريا", 70, 360, u, 1.8, 15, "#0d1a33") + K.tag("هضبة إثيوبيا", 290, 80, u, 2.4, 15, "#0d1a33");
  });

  // 6 — the Blue Nile gives about 60%
  shot(6, CAM([180, 180], [180, 200], [1.0, 1.04]), function (u, d, t) {
    var s = water(t, 0) + K.bubbles(t, 180, 436, 10, 0.15, 360, 3);
    s += K.gauge(180, 220, 128, clamp(u / 1.6) * 0.6, "");
    s += K.big("60%", 180, 240, 52, ORANGE) + K.flow(t, [[40, 380], [320, 380]], "#fff", 6, 0.2, 4);
    return s + K.tag("النيل الأزرق لوحده", 180, 60, u, 0.2, 20, "#0d1a33") + K.tag("حوالي ستين في المية", 180, 376, u, 1.6, 18, "#0d1a33");
  });

  // 7 — in the flood season it goes up to 80%
  shot(7, CAM([180, 180], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = sky("dusk", t) + water(t, 170, { muddy: true }) + K.bubbles(t, 200, 436, 8, 0.12, 300, 3);
    s += K.sand(-20, 200, 400, 240, 14, 90) + K.floc(230, 300, 60, 6, 91, 1);
    s += K.gauge(180, 200, 64, 0.8, "") + K.big("80%", 180, 212, 30, ORANGE);
    s += K.big("موسم الفيضان", 180, 110, 24, YEL);
    return s + K.tag("تمانين في المية!", 180, 370, u, 0.9, 20, "#0d1a33");
  });

  // 8 — the water carries mud, sand and microbes
  shot(8, CAM([180, 200], [180, 180], [1.0, 1.06]), function (u, d, t) {
    var s = water(t, -60, { muddy: true });
    s += K.sand(-20, 0, 400, 460, 26, 5) + K.gravel(-20, 0, 400, 460, 10, 22);
    s += K.microbe(70, 120, 1.9, t, PINK, 1) + K.microbe(260, 200, 1.7, t, GREEN, 2) + K.microbe(120, 330, 1.8, t, GREEN, 3) + K.microbe(300, 350, 1.6, t, PINK, 4);
    return s + K.tag("طين وطمي ورمل", 180, 60, u, 0.5, 20, "#0d1a33") + K.tag("وميكروبات!", 180, 376, u, 1.8, 20, "#0d1a33");
  });

  // 9 — the intake on the river bank, a screen catches the big things
  shot(9, CAM([170, 190], [190, 200], [1.0, 1.05]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-60" y="240" width="480" height="200" fill="url(#grassG)"/>';
    s += '<rect x="170" y="200" width="300" height="240" fill="url(#mudG)"/>' + K.water(t, 230, { muddy: true }).replace(/x="-60"/g, 'x="170"');
    s += '<rect x="90" y="190" width="120" height="200" rx="8" fill="url(#concG)" stroke="#fff" stroke-width="5"/>';
    s += '<rect x="130" y="210" width="50" height="170" fill="#4a3520" stroke="#fff" stroke-width="3"/>';
    for (var g = 0; g < 7; g++) s += '<path d="M' + (138 + g * 6) + ' 215 V375" stroke="#fff" stroke-width="2"/>';
    s += '<path d="M130 230 H180 M130 260 H180 M130 290 H180 M130 320 H180 M130 350 H180" stroke="#fff" stroke-width="1.5" opacity=".6"/>';
    s += '<rect x="180" y="330" width="30" height="8" rx="3" fill="#8b5a2b" stroke="#fff" stroke-width="2" transform="rotate(-18 195 334)"/><rect x="150" y="300" width="40" height="8" rx="3" fill="#a06a35" stroke="#fff" stroke-width="2" transform="rotate(12 170 304)"/>';
    s += K.flow(t, [[330, 330], [230, 300], [180, 300]], "#e8c48e", 6, 0.25, 4);
    return s + K.tag("شبك بيمسك الكبير", 180, 60, u, 0.5, 20, "#0d1a33");
  });

  // 10 — alum is added, the tiny mud particles stick together
  shot(10, CAM([180, 200], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<path d="M120 20 L240 20 L210 110 L150 110 Z" fill="url(#concG)" stroke="#fff" stroke-width="4"/>' + '<rect x="160" y="110" width="40" height="14" fill="url(#steelG)" stroke="#fff" stroke-width="2"/>';
    for (var i = 0; i < 14; i++) { var p = (t * 0.9 + i / 14) % 1; s += '<circle cx="' + f(180 + Math.sin(i * 3) * 10 * p) + '" cy="' + f(124 + p * 110) + '" r="3.5" fill="#fff" stroke="#fff"/>'; }
    s += K.tank(90, 130, 180, 240, 0.9, t, { muddy: true });
    var grow = reveal(u, d) * 1.0 + 0.45;
    s += K.floc(150, 270, 50, 8, 11, grow) + K.floc(230, 310, 40, 6, 12, grow) + K.floc(180, 200, 30, 4, 13, grow);
    return s + K.tag("بيتضاف الشبة", 180, 60, u, 0.4, 20, "#0d1a33") + K.tag("الطين بيلزق ويكبر!", 180, 376, u, 1.6, 17, "#0d1a33");
  });

  // 11 — the clumps are heavy, they sink to the bottom: sedimentation
  shot(11, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += K.tank(60, 90, 240, 280, 0.92, t);
    s += '<rect x="66" y="330" width="228" height="34" fill="url(#mudG)"/>' + K.sand(66, 330, 228, 34, 14, 40);
    var fall = clamp(u / 3.0);
    for (var i = 0; i < 8; i++) { var cy = lerp(130, 300, clamp(fall * 1.3 - i * 0.05)); s += K.floc(100 + i * 25, cy, 8, 3, 50 + i, 1); }
    s += '<path d="M66 130 H294" stroke="#fff" stroke-width="3" opacity=".7"/>';
    return s + K.tag("الترسيب", 180, 60, u, 0.3, 22, "#0d1a33") + K.tag("الميه اللي فوق بقت أصفى", 180, 376, u, 1.4, 16, "#0d1a33");
  });

  // 12 — the sand and gravel filter
  shot(12, CAM([180, 200], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<rect x="90" y="70" width="180" height="300" fill="url(#concG)" stroke="#fff" stroke-width="5" rx="6"/>';
    s += '<rect x="96" y="76" width="168" height="60" fill="url(#waterG)"/>';
    s += '<rect x="96" y="136" width="168" height="110" fill="#ffc64d"/>' + K.sand(96, 136, 168, 110, 30, 60);
    s += '<rect x="96" y="246" width="168" height="78" fill="#7d8896"/>' + K.gravel(96, 246, 168, 78, 22, 70);
    s += K.pipe([[180, 324], [180, 350], [300, 350], [300, 420]], 12);
    for (var k = 0; k < 9; k++) { var p = (t * 0.6 + k / 9) % 1; s += '<circle cx="' + f(120 + k * 18) + '" cy="' + f(90 + p * 150) + '" r="4" fill="#bfeaff" stroke="#fff" stroke-width="1.5" opacity="' + f(1 - p * 0.4) + '"/>'; }
    return s + K.tag("فلاتر رمل وزلط", 180, 40, u, 0.4, 20, "#0d1a33") + K.tag("الرمل بيمسك اللي فاضل", 180, 376, u, 1.6, 16, "#0d1a33");
  });

  // 13 — algae clog the filters
  shot(13, CAM([180, 200], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<rect x="70" y="150" width="220" height="180" fill="url(#concG)" stroke="#fff" stroke-width="5" rx="6"/><rect x="76" y="210" width="208" height="112" fill="#ffc64d"/>' + K.sand(76, 210, 208, 112, 24, 80);
    var grow = reveal(u, d) * 0.9 + 0.3;
    for (var i = 0; i < 12; i++) { var rr = (14 + hash(i) * 14) * grow; s += '<ellipse cx="' + f(100 + hash(i + 4) * 170) + '" cy="' + f(200 + hash(i + 8) * 16) + '" rx="' + f(rr) + '" ry="' + f(rr * 0.6) + '" fill="' + GREEN + '" stroke="#fff" stroke-width="2.5"/>'; }
    s += K.microbe(300, 120, 1.6, t, GREEN, 9);
    return s + K.tag("الطحالب بتسد الفلاتر", 180, 60, u, 0.5, 19, "#0d1a33") + K.tag("الجرعات لازم تتضبط!", 180, 376, u, 1.8, 17, "#0d1a33");
  });

  // 14 — chlorine kills the leftover microbes
  shot(14, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<rect x="30" y="50" width="70" height="120" rx="14" fill="url(#concG)" stroke="#fff" stroke-width="4"/><rect x="36" y="100" width="58" height="66" fill="#d6f25a" opacity=".9"/>';
    s += K.flow(t, [[65, 175], [65, 230], [180, 250]], "#d6f25a", 4, 0.5, 4);
    s += K.tank(120, 180, 210, 220, 0.85, t);
    var pop2 = clamp(u / 2.2);
    for (var i = 0; i < 6; i++) { var sc = Math.max(0.05, 1.6 * (1 - pop2) + (i % 2) * 0.1); s += K.microbe(160 + i * 25, 250 - (i % 2) * 40, sc, t, i % 2 ? PINK : GREEN, i); }
    for (var k = 0; k < 5; k++) { var ps = clamp((u - 1.4) / 1.4); if (ps > 0) s += K.spark(170 + k * 22, 230 - (k % 2) * 40, t + k, YEL); }
    return s + K.tag("الكلور بيقتل الميكروبات", 180, 60, u, 0.5, 19, "#0d1a33") + K.tag("بكمية صغيرة", 180, 376, u, 1.8, 18, "#0d1a33");
  });

  // 15 — a little chlorine stays in the pipe to keep the water safe
  shot(15, CAM([180, 200], [180, 200], [1.0, 1.04]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-60" y="300" width="480" height="200" fill="url(#soilG)"/>';
    s += K.pipe([[-60, 210], [420, 210]], 40);
    s += K.flow(t, [[-60, 210], [420, 210]], "#d6f25a", 16, 0.16, 5) + K.flow(t, [[-60, 210], [420, 210]], "#2a8fc0", 8, 0.16, 3);
    s += K.big("▶", 40, 260, 26, "#fff");
    return s + K.tag("الكلور بيفضل شوية", 180, 60, u, 0.5, 20, "#0d1a33") + K.tag("علشان الميه تفضل سليمة", 180, 376, u, 1.6, 17, "#0d1a33");
  });

  // 16 — the water is stored in a big tank under the ground
  shot(16, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = sky("day", t) + K.soil(t, 150);
    s += K.tank(90, 190, 180, 200, 0.7, t);
    s += K.pipe([[40, 60], [40, 150], [90, 190]], 12) + K.flow(t, [[40, 60], [40, 150], [90, 190]], "#bfeaff", 5, 0.3, 4);
    s += K.pipe([[270, 290], [340, 290]], 16) + K.flow(t, [[270, 290], [340, 290]], "#bfeaff", 4, 0.3, 4);
    return s + K.tag("خزان تحت الأرض", 180, 60, u, 0.5, 20, "#0d1a33") + K.tag("جوه المحطة", 180, 376, u, 1.6, 18, "#0d1a33");
  });

  // 17 — the big pumps push the water into the pipes
  shot(17, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = sky("day", t) + K.soil(t, 260);
    s += '<rect x="40" y="170" width="120" height="110" rx="10" fill="url(#concG)" stroke="#fff" stroke-width="5"/>' + K.pump(100, 225, 42, t);
    s += K.pipe([[160, 225], [420, 225]], 26) + K.flow(t, [[160, 225], [420, 225]], "#bfeaff", 14, 0.22, 5);
    return s + K.tag("طلمبات قوية", 180, 60, u, 0.4, 20, "#0d1a33") + K.tag("بتدفع الميه في المواسير", 180, 376, u, 1.3, 17, "#0d1a33");
  });

  // 18 — the pipe runs for tens of kilometres under the road
  shot(18, CAM([180, 200], [180, 200], [1.0, 1.04]), function (u, d, t) {
    var s = sky("dusk", t) + '<rect x="-60" y="280" width="480" height="260" fill="#2b3346"/>';
    s += '<path d="M-60 300 H420" stroke="#ffd166" stroke-width="4" stroke-dasharray="26 20" stroke-dashoffset="' + f(-t * 120) + '"/>';
    for (var i = 0; i < 4; i++) { var x = ((t * 60 * (i % 2 ? 1 : -1) + i * 120) % 540 + 540) % 540 - 90; s += '<rect x="' + f(x) + '" y="' + (i % 2 ? 330 : 360) + '" width="56" height="22" rx="7" fill="' + ["#ff7a5c", "#2a8fc0", "#ffd166", "#7bd389"][i] + '" stroke="#fff" stroke-width="3"/>'; }
    s += K.pipe([[-60, 250], [420, 250]], 22) + K.flow(t, [[-60, 250], [420, 250]], "#bfeaff", 12, 0.2, 4);
    return s + K.tag("عشرات الكيلومترات", 180, 60, u, 0.5, 22, "#0d1a33");
  });

  // 19 — booster pumps on the way keep the pressure up
  shot(19, CAM([180, 200], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = sky("day", t) + K.soil(t, 290);
    s += '<rect x="120" y="180" width="130" height="110" rx="10" fill="url(#concG)" stroke="#fff" stroke-width="5"/>' + K.pump(185, 235, 36, t);
    s += K.pipe([[-60, 235], [120, 235]], 22) + K.pipe([[250, 235], [420, 235]], 22) + K.flow(t, [[-60, 235], [420, 235]], "#bfeaff", 12, 0.2, 4);
    s += K.gauge(300, 120, 44, clamp(u / 1.5) * 0.7 + 0.2, "");
    return s + K.tag("محطة تقوية", 180, 60, u, 0.5, 22, "#0d1a33") + K.tag("الضغط بيرجع قوي تاني", 180, 376, u, 1.6, 17, "#0d1a33");
  });

  // 20 — at home the tap gives clean water
  shot(20, CAM([180, 200], [180, 200], [1.0, 1.04]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-60" y="300" width="480" height="200" fill="url(#grassG)"/>';
    s += '<rect x="150" y="150" width="200" height="160" fill="#ffd9b0" stroke="#fff" stroke-width="5"/><path d="M130 152 L250 80 L370 152Z" fill="#ff7a5c" stroke="#fff" stroke-width="5"/>';
    s += '<rect x="200" y="200" width="120" height="10" fill="url(#steelG)" stroke="#fff" stroke-width="3"/>' + K.pipe([[260, 150], [260, 200]], 8);
    s += K.flow(t, [[260, 212], [260, 262]], "#bfeaff", 4, 1.0, 4);
    var fill = clamp(u / 2.5) * 80;
    s += '<path d="M220 340 H300 L294 262 H226Z" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="4"/><rect x="230" y="' + f(336 - fill) + '" width="60" height="' + f(fill) + '" fill="url(#waterG)"/>';
    return s + K.tag("الحنفية اللي إنت فاتحها!", 180, 60, u, 0.4, 19, "#0d1a33");
  });

  // 21 — the lab takes samples and checks the water
  shot(21, CAM([180, 200], [180, 200], [1.0, 1.04]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#skyNight)"/>';
    s += '<rect x="-60" y="290" width="480" height="150" fill="#24476b" stroke="#fff" stroke-width="4"/>';
    for (var i = 0; i < 4; i++) s += '<path d="M' + (60 + i * 70) + ' 210 L' + (80 + i * 70) + ' 210 L' + (86 + i * 70) + ' 290 L' + (54 + i * 70) + ' 290 Z" fill="' + BLUE + '" fill-opacity=".5" stroke="#fff" stroke-width="3"/>' + '<rect x="' + (56 + i * 70) + '" y="' + (250 + i * 2) + '" width="28" height="40" fill="' + ["#2a8fc0", "#ffd166", "#7bd389", "#ff7aa2"][i] + '"/>';
    s += '<rect x="200" y="90" width="150" height="120" rx="12" fill="#0d1a33" stroke="#fff" stroke-width="4"/>';
    s += '<text x="275" y="130" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="16" fill="#7fd3f5">NTU</text>';
    s += '<text x="275" y="190" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="50" fill="' + GREEN + '">' + (u < 1 ? "12.0" : "0.4") + '</text>';
    s += '<path d="M300 232 l14 14 l28 -30" stroke="' + GREEN + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="' + f(clamp((u - 1.6) / 0.6)) + '"/>';
    return s + K.tag("معمل التحاليل", 180, 60, u, 0.4, 20, "#0d1a33") + K.tag("بياخد عينات كل فترة", 180, 376, u, 1.6, 17, "#0d1a33");
  });

  // 22 — the clean water comes out of the tap
  shot(22, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-60" y="-60" width="480" height="560" fill="url(#tileG)"/>';
    s += '<rect x="60" y="330" width="240" height="90" rx="22" fill="url(#concG)" stroke="#fff" stroke-width="5"/>';
    s += K.pipe([[180, 40], [180, 80], [220, 80], [220, 170]], 14);
    s += K.flow(t, [[220, 180], [220, 300]], "#e6f7ff", 7, 1.0, 4);
    var fill = clamp(u / 2.4) * 80;
    s += '<path d="M180 300 H260 L254 220 H186Z" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="4"/><rect x="190" y="' + f(296 - fill) + '" width="60" height="' + f(fill) + '" fill="url(#waterG)"/>';
    s += K.spark(120, 180, t, YEL) + K.spark(300, 140, t + 2, YEL);
    return s + K.tag("صافية!", 180, 60, u, 0.4, 26, "#2a8fc0");
  });

  // 23 — the payoff: the water in your glass started in the Ethiopian highlands
  shot(23, CAM([180, 200], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = sky("dusk", t);
    s += '<path d="M-60 260 L40 120 L120 170 L190 90 L280 180 L330 140 L420 260 V500 H-60Z" fill="url(#hillG)" stroke="#fff" stroke-width="4"/>';
    var p = [[190, 110], [210, 180], [260, 250], [320, 300]];
    s += '<path d="M190 110 Q210 180 260 250 T320 300" stroke="#fff" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M190 110 Q210 180 260 250 T320 300" stroke="url(#waterG)" stroke-width="16" fill="none" stroke-linecap="round"/>';
    s += K.flow(t, p, "#fff", 8, 0.16, 4);
    s += '<rect x="290" y="300" width="60" height="70" fill="#ffd9b0" stroke="#fff" stroke-width="4"/><path d="M280 302 L320 262 L360 302Z" fill="#ff7a5c" stroke="#fff" stroke-width="4"/>';
    return s + K.tag("من هضبة إثيوبيا لحنفيتك", 180, 60, u, 0.4, 19, "#0d1a33");
  });

  // 24 — the call to action
  shot(24, CAM([180, 200], [180, 200], [1.0, 1.0]), function (u, d, t) {
    var s = sky("dusk", t) + K.water(t, 300) + K.bubbles(t, 180, 436, 10, 0.2, 360, 4);
    s += K.big("قولولنا!", 180, 230, 50, YEL);
    s += K.spark(60, 120, t, YEL) + K.spark(300, 110, t + 1, YEL);
    return s + K.tag("حكاية إيه المرة الجاية؟", 180, 360, u, 0.8, 18, "#0d1a33");
  });

  window.__parts = { water: K.water };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : K.L(K.LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 14 * Math.sin(t * 1.7), cy = c[1] + 10 * Math.cos(t * 1.7), z = c[2] * (1 + 0.04 * Math.sin(t * 1.3));   // the drift never comes to rest
    svg.innerHTML = '<g transform="translate(180 218) rotate(' + f(0.7 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="360" height="436" filter="url(#grain)"/>';
    return i;
  };
})();
