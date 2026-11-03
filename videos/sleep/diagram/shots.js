
  // ── «ليه بنحتاج ننام؟», version A: «الرسم الهندسي» cards with isometric drawings (portrait world 640×800) ──
  var KR = isoKit(297, 341, 26), KC = isoKit(278, 316, 24), KT = isoKit(285, 266, 32), KV = isoKit(149, 263, 36),
      KA = isoKit(269, 286, 34), KS = isoKit(123, 320, 42), KB = isoKit(242, 406, 60), KD = isoKit(298, 297, 50), KB2 = isoKit(262, 600, 44);
  function hp(K) { return K.P(HEAD[0], HEAD[1], HEAD[2]); }
  function seg(u, a, b) { return clamp((u - a) / (b - a)); }
  function bigQ(x, y, k, t, sz) { k = pop(k); if (k <= 0) return ""; return '<text x="' + f(x) + '" y="' + f(y + 4 * Math.sin(t * 3)) + '" text-anchor="middle" style="font:900 ' + f((sz || 110) * k) + "px Noto Sans Arabic;fill:" + ORANGE + ";paint-order:stroke;stroke:" + PAPER + ';stroke-width:10px">؟</text>'; }
  function frame(t) {   // an old photo: a dark print with a pale border and film scratches
    var s = dark("#141414") + '<rect x="30" y="40" width="580" height="720" fill="none" stroke="#d9d4c8" stroke-width="3"/><rect x="40" y="50" width="560" height="700" fill="#3a2e20" opacity=".18"/>';
    for (var i = 0; i < 3; i++) { var x = 60 + ((hash(i + Math.floor(t * 8)) * 520) | 0); s += '<path d="M' + x + ' 50 V750" stroke="#d9d4c8" stroke-width="1" opacity=".18"/>'; }
    return s;
  }
  function fibrils(t) { var s = '<rect x="-130" y="-130" width="260" height="260" fill="#f0d3c4"/>'; for (var i = 0; i < 9; i++) { var d = ""; for (var j = 0; j <= 12; j++) { var a = i * 0.7 + j * 0.5, r = 8 + j * 5.5; d += (j ? " L" : "M") + f(Math.cos(a) * r * (0.6 + 0.4 * Math.sin(i)) + Math.sin(t * 2 + i + j) * 2) + " " + f(Math.sin(a * 1.3) * r * 0.8); } s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#c0603a" stroke-width="3.6" fill="none" stroke-linecap="round"/>'; } return s; }
  function dim2(a, b, col, k) { if (k <= 0) return ""; return arrow(a[0], a[1], b[0], b[1], col, 2.6, k) + arrow(b[0], b[1], a[0], a[1], col, 2.6, k); }

  shot(0, function () { return [320, 400, 1]; }, function (u, d, t) { return paper(); });

  // 1 — the bedroom at night: why do we sleep at all?
  shot(1, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 300, k), lerp(410, 400, k), lerp(0.98, 1.1, k)]; }, function (u, d, t) {
    var s = paper() + room(KR, t, { zzz: true, lamp: true }), h = hp(KR), c = KR.P(0.02, 7.2, 5.1);
    return s + bigQ(h[0] + 70, h[1] - 110, seg(u, 0.2, 0.9), t) + lab(c[0], c[1], 250, 205, "تمن ساعات", BLUE, seg(u, 0.6, 1.4));
  });
  // 2 — what happens inside your head? (an inset of the brain with a question mark)
  shot(2, function (u, d) { var k = ease(clamp(u / 1.2)); return [lerp(300, 330, k), lerp(400, 330, k), lerp(1.1, 1.35, k)]; }, function (u, d, t) {
    var h = hp(KR), s = paper() + room(KR, t, { zzz: true, lamp: true }), k = seg(u, 0.3, 0.9), ix = 440, iy = 230, r = 115;
    if (k > 0) s += '<path d="M' + f(h[0] + 14) + " " + f(h[1] - 14) + " L" + f(ix - r * 0.72) + " " + f(iy + r * 0.72) + '" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 5"/>';
    s += ring(h[0], h[1], 18, t, ORANGE, 1.35) + inset(ix, iy, r, brain2d(0, 8, 0.6, t, { q: true }), k);
    return s + lab(h[0], h[1] + 10, 300, 520, "دماغك", OLIVE, seg(u, 1.0, 1.7), 21, 1.35);
  });
  // 3 — the promise: three things happen in there (numbered)
  shot(3, function (u, d) { var k = clamp(u / d); return [320, lerp(390, 380, k), lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    var s = paper() + brain2d(320, 360, 1.5, t, { glow: true });
    s += callout("1", 215, 300, seg(u, 0.3, 0.8)) + callout("2", 330, 420, seg(u, 0.8, 1.3)) + callout("3", 450, 290, seg(u, 1.3, 1.8));
    var lg = [["1 غسيل", 500, BLUE, 0.3], ["2 ترتيب", 320, OLIVE, 0.8], ["3 دورات", 140, ORANGE, 1.3]];
    lg.forEach(function (q) { var k = seg(u, q[3], q[3] + 0.5); if (k > 0) s += '<g opacity="' + f2(k) + '">' + T(q[0], q[1], 690, 30, q[2], 800) + "</g>"; });
    return s;
  });
  // 4 — the analogy: a city by day, the rubbish piling up at the kerbs
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(290, 350, k), lerp(410, 390, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = paper() + sunIcon(120, 120, 32, t) + city(KC, t, { trash: seg(u, 0.4, d - 0.4) }), b = BAGS[1], p = KC.P(b[0], b[1], 0.5), bl = KC.P(9.25, 1.85, 5.2);
    return s + lab(bl[0], bl[1], 520, 200, "مدينة", OLIVE, seg(u, 0.3, 1.0)) + lab(p[0], p[1], p[0] + 80, p[1] + 150, "زبالة", ORANGE, seg(u, 1.6, 2.3));
  });
  // 5 — the brain is the same: busy cells, waste left between them
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(400, 390, k), lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var s = paper() + tissue(KT, t, { sp: 1, waste: seg(u, 0.5, d - 0.3), act: true }), n = KT.P(8.6, 4.0, 0), w = KT.P(3, 5.2, 0.12);
    return s + lab(n[0], n[1] - 24, 480, 330, "خلية عصبية", OLIVE, seg(u, 0.3, 1.0)) + lab(w[0], w[1], 120, 560, "فضلات", ORANGE, seg(u, 2.0, 2.7));
  });
  // 6 — the worst of it: beta-amyloid clumps; a cell gets hurt (inset: the fibrils)
  shot(6, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 330, k), lerp(400, 420, k), lerp(1.05, 1.25, k)]; }, function (u, d, t) {
    var s = paper() + tissue(KT, t, { sp: 1, waste: 1, act: true, amy: seg(u, 0.2, 1.4), hurt: u > 1.6 }), a = KT.P(7.4, 5.2, 0.2), hn = KT.P(3.8, 4.0, 0);
    s += inset(500, 205, 88, fibrils(t), seg(u, 1.0, 1.6));
    return s + lab(a[0], a[1], 470, 600, "بيتا أميلويد", BLUE, seg(u, 0.9, 1.6), 21, 1.15) + lab(hn[0], hn[1] - 24, 260, 250, "خلية بتتأذي", ORANGE, seg(u, 2.2, 2.9), 21, 1.2);
  });
  // 7 — deep sleep: the gaps between the cells open up (60 % in mice)
  shot(7, function (u, d) { var k = clamp(u / d); return [320, lerp(405, 395, k), lerp(1.0, 1.06, k)]; }, function (u, d, t) {
    var g = ease(seg(u, 0.6, 3.2)), sp = 1 + 0.25 * g, G = tissueGeo(sp), s = paper() + tissue(KT, t, { sp: sp, waste: 1, amy: 1 });
    var a = KT.P(0.8, G.chY[1] - G.w / 2, 0.05), b = KT.P(0.8, G.chY[1] + G.w / 2, 0.05);
    s += moonIcon(110, 120, 30) + '<g opacity="' + f2(seg(u, 0.3, 0.9)) + '">' + T("نوم عميق", 110, 190, 24, BLUE, 800) + "</g>";
    s += dim2(a, b, ORANGE, seg(u, 1.0, 1.5)) + numTag("+60%", 480, 190, seg(u, 2.6, 3.2), 32, ORANGE);
    s += inset(130, 640, 78, mouseIcon(-4, 6, 0.85, t), seg(u, 3.4, 4.0));
    var mk = seg(u, 3.8, 4.4); if (mk > 0) s += '<g opacity="' + f2(mk) + '">' + T("في الفيران", 300, 660, 24, OLIVE, 800) + "</g>";
    return s;
  });
  // 8 — the brain's fluid flows in waves and washes the waste out to the drain
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(300, 345, k), 400, 1.04]; }, function (u, d, t) {
    var G = tissueGeo(1.25), s = paper() + tissue(KT, t, { sp: 1.25, waste: 1, amy: 1, csf: seg(u, 0.1, 0.6), wash: seg(u, 0.6, d - 0.2), drain: true });
    var c = KT.P(2.0, G.chY[0], 0.05), dr = KT.P(10.5, 6.5, -0.5);
    s += arrow(KT.P(5.5, G.chY[1], 0.4)[0], KT.P(5.5, G.chY[1], 0.4)[1], KT.P(9.2, G.chY[1], 0.4)[0], KT.P(9.2, G.chY[1], 0.4)[1], BLUE, 3.4, seg(u, 1.2, 2.0));
    return s + lab(c[0], c[1], 150, 215, "سايل المخ", BLUE, seg(u, 0.4, 1.1)) + lab(dr[0], dr[1], 520, 660, "بره", ORANGE, seg(u, 2.4, 3.0));
  });
  // 9 — the glymphatic route: fluid in a sleeve around the arteries (named 2012)
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(410, 390, k), lerp(0.98, 1.08, k)]; }, function (u, d, t) {
    var s = paper() + vessel(KV, t, { flow: 1, waste: true }), sl = KV.P(5, 0, 1.0), ar = KV.P(12, 0, 0);
    return s + lab(sl[0], sl[1], 200, 200, "الجليمفاتيك", BLUE, seg(u, 0.4, 1.1)) + lab(ar[0], ar[1], 430, 640, "شريان", OLIVE, seg(u, 1.2, 1.9)) + numTag("2012", 470, 160, seg(u, 2.0, 2.6), 32);
  });
  // 10 — one night without sleep: about 5 % more beta-amyloid
  shot(10, function (u, d) { var k = clamp(u / d); return [320, lerp(400, 390, k), lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    var s = paper() + bars(KB, t, { v: [3.4, 3.4], extra: 0.17, grow: seg(u, 0.1, 1.0), ex: seg(u, 1.4, 2.0), c0: PAL.blue, c1: PAL.blue });
    var g = seg(u, 0.6, 1.2); if (g > 0) s += '<g opacity="' + f2(g) + '">' + moonIcon(242, 185, 24) + eyeIcon(398, 262, 0.75, t) + "</g>";
    s += T("بعد ليلة نوم", 200, 548, 22, INK, 800) + T("بعد ليلة سهر", 356, 636, 22, INK, 800);
    var fr = KB.P(3.8, 1.6, 1.7);
    return s + lab(fr[0], fr[1], 470, 430, "بيتا أميلويد", BLUE, seg(u, 0.8, 1.4)) + numTag("+5%", 500, 300, seg(u, 2.0, 2.6), 32, ORANGE);
  });
  // 11 — at the same time the brain sorts the day's memories
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(320, 300, k), lerp(400, 390, k), lerp(0.98, 1.06, k)]; }, function (u, d, t) {
    var s = paper() + archive(KA, t, { fly: true, filled: 12 }), dk = KA.P(1.2, 1.0, 1.6);
    return s + lab(dk[0], dk[1], 400, 150, "ذكريات اليوم", BLUE, seg(u, 0.5, 1.2));
  });
  // 12 — the hippocampus replays them and moves the important ones to the cortex
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(290, 310, k), lerp(385, 410, k), lerp(1.04, 1.1, k)]; }, function (u, d, t) {
    var s = paper() + archive(KA, t, { fly: true, filled: 14 }), dk = KA.P(1.3, 2.0, 0.6), sh = KA.P(6.5, 6.4, 3.2);
    s += inset(520, 145, 86, brain2d(0, 6, 0.48, t, { hippo: true, cortex: u > 2.4 }), seg(u, 0.6, 1.2));
    return s + lab(dk[0], dk[1], 150, 230, "الهيبوكامبس", OLIVE, seg(u, 0.2, 0.9)) + lab(sh[0], sh[1], 130, 520, "القشرة", OLIVE, seg(u, 2.4, 3.1));
  });
  // 13 — sleep runs in cycles of about 90 minutes
  shot(13, function (u, d) { var k = ease(clamp(u / d)); return [lerp(250, 380, k), lerp(360, 440, k), 1.0]; }, function (u, d, t) {
    var s = paper() + moonIcon(560, 120, 28) + stairs(KS, t, { grow: seg(u, 0, 1.8), mark: seg(u, 0, d) * 0.9 }), a = KS.P(0.5, -0.5, 3.6), b = KS.P(3.5, -0.5, 3.6), k = seg(u, 1.6, 2.2);
    if (k > 0) { var e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; s += '<path d="M' + f(a[0]) + " " + f(a[1]) + " L" + f(e[0]) + " " + f(e[1]) + " M" + f(a[0]) + " " + f(a[1] - 10) + " v20 M" + f(e[0]) + " " + f(e[1] - 10) + ' v20" stroke="' + ORANGE + '" stroke-width="3"/>';
      if (k >= 1) s += T("90 دقيقة", 250, 165, 26, ORANGE, 800); }
    return s;
  });
  // 14 — each cycle: light sleep, deep sleep, dream sleep (with their brain waves)
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(200, 230, k), lerp(300, 320, k), lerp(1.5, 1.6, k)]; }, function (u, d, t) {
    var s = paper() + stairs(KS, t, { grow: 1, mark: 0.05 + 0.2 * clamp(u / d) }), z = 1.55, l = stairTop(KS, 1), dd = stairTop(KS, 3), r = stairTop(KS, 6);
    s += lab(l[0], l[1], 70, 150, "خفيف", BLUE, seg(u, 0.1, 0.7), 21, z) + lab(dd[0], dd[1], 100, 450, "عميق", "#4a5e7c", seg(u, 0.9, 1.5), 21, z) + lab(r[0], r[1], 330, 180, "أحلام", ORANGE, seg(u, 1.9, 2.5), 21, z);
    s += waveRay(26, 120, 96, 120, t, BLUE, 3, 9, seg(u, 0.4, 0.9), 2) + waveRay(40, 480, 110, 480, t * 0.4, "#4a5e7c", 8, 30, seg(u, 1.2, 1.7), 2.4) + waveRay(300, 150, 380, 150, t, ORANGE, 4, 9, seg(u, 2.2, 2.7), 2);
    return s;
  });
  // 15 — in dream sleep the muscles are switched off, so you don't act the dream out
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(250, 240, k), lerp(380, 370, k), lerp(1.38, 1.5, k)]; }, function (u, d, t) {
    var s = paper() + room(KR, t, { lamp: true }), h = hp(KR), l1 = KR.P(3.2, 4.0, 2.1), l2 = KR.P(5.0, 4.4, 1.9), c = seg(u, 0.2, 0.8);
    if (c > 0) { s += '<g opacity="' + f2(c) + '"><circle cx="' + f(h[0] + 22) + '" cy="' + f(h[1] - 34) + '" r="5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(h[0] + 40) + '" cy="' + f(h[1] - 70) + '" r="8" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' + cloud(330, 185, 200, 120) + runner(330, 215, 0.9, t) + "</g>"; }
    s += lockIcon(l1[0], l1[1] - 14, 1.1, seg(u, 1.2, 1.7)) + lockIcon(l2[0], l2[1] - 14, 1.1, seg(u, 1.5, 2.0));
    s += inset(110, 540, 66, eyeIcon(0, 0, 1.1, t), seg(u, 2.6, 3.1)); var rk = seg(u, 2.9, 3.4); if (rk > 0) s += '<g opacity="' + f2(rk) + '">' + T("REM", 110, 632, 26, BLUE, 900) + "</g>";
    return s + lab(l1[0], l1[1] - 14, 180, 300, "العضلات مقفولة", ORANGE, seg(u, 1.8, 2.5), 21, 1.45);
  });
  // 16 — the misconception: "the brain switches off" ✗
  shot(16, function (u, d) { var k = clamp(u / d); return [320, lerp(400, 390, k), lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    var s = paper() + bulb(320, 150, 1.2, false) + brain2d(320, 420, 1.35, t, { off: true });
    var k = seg(u, 0.2, 0.8); if (k > 0) s += '<g opacity="' + f2(k) + '">' + T("بيطفي؟", 470, 165, 30, "#8a8070", 800) + "</g>";
    return s + crossMark(320, 400, 3.2, seg(u, 1.2, 1.7));
  });
  // 17 — the opposite: in dream sleep it is nearly as busy as awake
  shot(17, function (u, d) { var k = clamp(u / d); return [320, lerp(395, 405, k), lerp(1.0, 1.06, k)]; }, function (u, d, t) {
    var s = paper() + brain2d(180, 200, 0.72, t, { glow: true }) + brain2d(460, 200, 0.72, t, { glow: u > 0.6 });
    s += T("صاحي", 180, 345, 28, BLUE, 800) + T("نوم الأحلام", 460, 345, 28, ORANGE, 800);
    s += bars(KB2, t, { v: [3.0, 2.8], grow: seg(u, 0.6, 1.6), c0: PAL.blue, c1: PAL.orange });
    return s + T("نشاط المخ", 320, 772, 22, INK, 800);
  });
  // 18 — 1964: Randy Gardner stays awake for eleven days (an old photo)
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(320, 310, k), lerp(400, 390, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var dd = clamp((u - 0.3) / Math.max(0.5, d - 0.8)), day = 1 + Math.min(10, Math.floor(dd * 10.999)), fl = (dd * 10.999) % 1, c = KD.P(2.2, 2.6, 1.4);
    var s = frame(t) + calendar(KD, t, { day: day, flip: day < 11 ? fl : 0, race: true }) + T("1964", 320, 700, 44, "#e8c48e", 900);
    return s + lab(c[0], c[1], 140, 220, "11 يوم", "#e8c48e", seg(u, 2.5, 3.1), 24, 1, "#141414");
  });
  // 19 — by the end: slurred speech and seeing things that aren't there
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(310, 330, k), lerp(390, 380, k), lerp(1.08, 1.16, k)]; }, function (u, d, t) {
    var s = frame(t) + calendar(KD, t, { day: 11, race: true }), b = pop(seg(u, 0.3, 0.9)), gk = seg(u, 1.6, 2.2);
    for (var i = 0; i < 4; i++) s += ghostTree(110 + i * 140, 250 + (i % 2) * 330, 1.1, gk * (0.45 + 0.45 * Math.sin(t * 3 + i * 1.7)));
    if (b > 0) s += '<g transform="translate(450 170) scale(' + f2(b) + ')"><path d="M-110 -44 H110 V40 H-20 L-46 70 L-40 40 H-110 Z" fill="#f4efe0" stroke="' + INK + '" stroke-width="2.4"/>' + T("كـ..لا..ـم؟!", 0, 12, 36, INK, 800) + "</g>";
    return s + lab(250, 560, 360, 700, "هلاوس", ORANGE, seg(u, 2.0, 2.6), 24, 1, "#141414");
  });
  // 20 — the payoff: sleep washes the brain and files the memories; give it seven hours
  shot(20, function (u, d) { var k = ease(clamp(u / d)); return [lerp(310, 320, k), lerp(390, 400, k), lerp(1.12, 1.0, k)]; }, function (u, d, t) {
    var s = paper() + room(KR, t, { zzz: true, lamp: true }), c = KR.P(0.02, 7.2, 5.1), KI = isoKit(-15, -33, 10);
    s += inset(140, 150, 84, brain2d(0, 8, 0.48, t, { wash: 1 }), seg(u, 0.3, 0.9)) + inset(500, 150, 84, '<rect x="-100" y="-100" width="200" height="200" fill="' + PAPER + '"/>' + archive(KI, t, { fly: true, filled: 20 }), seg(u, 1.0, 1.6));
    var a = seg(u, 0.6, 1.1), b = seg(u, 1.3, 1.8); if (a > 0) s += '<g opacity="' + f2(a) + '">' + T("غسيل", 140, 262, 24, BLUE, 800) + "</g>"; if (b > 0) s += '<g opacity="' + f2(b) + '">' + T("ترتيب", 500, 262, 24, OLIVE, 800) + "</g>";
    return s + lab(c[0], c[1], 250, 330, "7 ساعات على الأقل", ORANGE, seg(u, 2.2, 2.9));
  });

  // the opening card: the bedroom at night on a black "photo", a red ring on the sleeper's head
  window.__intro = function (svg, t) {
    var KI = isoKit(277 + 10 * Math.sin(t * 0.8), 128, 15), s = '<rect width="580" height="320" fill="#141414"/>' + room(KI, t, { night: true, zzz: true, lamp: true }), h = KI.P(HEAD[0], HEAD[1], HEAD[2]);
    svg.innerHTML = s + ring(h[0], h[1], 22, t, "#e0402a");
  };
  // the summary card: the room and the brain with numbered callouts; the stat counts up
  window.__outro = function (svg, u, t) {
    var KO = isoKit(150, 96, 10.5), s = '<rect width="580" height="300" fill="#e4d9bf"/>' + room(KO, t, { zzz: true, lamp: true }) + brain2d(430, 140, 0.72, t, { wash: 1, hippo: true, cortex: true });
    for (var i = 0; i < 6; i++) { var q = (t * 0.3 + i / 6) % 1; s += '<circle cx="' + f(440 + q * 110) + '" cy="' + f(150 + Math.sin(i * 2) * 20) + '" r="3.4" fill="#8a5a2c" stroke="' + INK + '" stroke-width=".8" opacity="' + f2(1 - q) + '"/>'; }
    [["1", 345, 106], ["2", 470, 175], ["3", 425, 162], ["4", 420, 52]].forEach(function (c, i) { s += callout(c[0], c[1], c[2], (u - 0.2 - i * 0.15) / 0.6); });
    var nn = document.querySelector("#outro .n"); if (nn) nn.textContent = Math.round(60 * clamp(u / 2)) + "%";
    svg.style.transform = "scale(" + f2(1 + 0.04 * Math.sin(t * 1.4)) + ")";
    svg.innerHTML = s;
  };
  window.__parts = { isoKit: isoKit, room: room, brain2d: brain2d, tissue: tissue, vessel: vessel, archive: archive, stairs: stairs, calendar: calendar, lab: lab, numTag: numTag, moonIcon: moonIcon, HEAD: HEAD, PAL: PAL };
})();
