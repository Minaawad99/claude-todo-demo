
  // ── «ليه بنحتاج ننام؟», version B: one isometric world on paper; the camera travels between its stations ──
  // Stations (world px): the bedroom in the middle, the city, the tissue inside the brain, the vessel, the measuring bars,
  // the memory archive, the sleep-cycle stairs and the 1964 corner. Each line of the voice has a camera target.
  var VW = 360, VH = 640, CX = 180, CY = 300;
  function ST(cx, cy, s, ox, oy, w, h, name) { return { c: [cx, cy], K: isoKit(cx - ox, cy - oy, s), w: w, h: h, name: name }; }
  var S = {
    room: ST(0, 0, 20, 17.4, 45, 390, 380, "الأوضة"), city: ST(-470, -330, 18, 31.1, 63, 380, 320, "المدينة"), tis: ST(430, -330, 22, 23.8, 92.4, 360, 280, "جوه المخ"),
    ves: ST(790, 30, 20, 95.2, 76, 310, 230, "الأوعية"), bars: ST(470, 330, 34, 44.2, -3.4, 240, 280, "القياس"), arch: ST(20, 440, 20, 30, 67, 330, 230, "الذكريات"),
    stairs: ST(-460, 330, 24, 112.8, 45.6, 330, 290, "دورات النوم"), cal: ST(-800, 20, 30, 12.9, 61.5, 290, 240, "1964")
  };
  var KR = S.room.K, KC = S.city.K, KT = S.tis.K, KV = S.ves.K, KB = S.bars.K, KA = S.arch.K, KS = S.stairs.K, KD = S.cal.K, G0 = isoKit(0, 0, 20);
  function seg(u, a, b) { return clamp((u - a) / (b - a)); }
  function lineAt(t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - 0.05 <= t) i++; return i; }
  function tx(text, x, y, sz, col, z, w, op) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle"' + (op != null ? ' opacity="' + f2(op) + '"' : "") + ' style="font:' + (w || 800) + " " + f2(sz / z) + "px Noto Sans Arabic;fill:" + (col || INK) + ";paint-order:stroke;stroke:" + PAPER + ";stroke-width:" + f2(sz * 0.24 / z) + 'px;stroke-linejoin:round">' + text + "</text>"; }
  function L2(p, dx, dy, text, col, k, z, halo) { return lab(p[0], p[1], p[0] + dx / z, p[1] + dy / z, text, col, k, 13, z, halo); }
  function halo(K, x, y, r, t) { return K.poly(K.circ(x, y, 0.03, r * (1 + 0.08 * Math.sin(t * 4)), "z", 32), "none", 0).replace('fill="none"', 'fill="#e2a92c" fill-opacity=".18" stroke="#e2a92c" stroke-width="2.4"'); }
  function bigQ(x, y, k, t, sz) { k = pop(k); if (k <= 0) return ""; return '<text x="' + f(x) + '" y="' + f(y + 3 * Math.sin(t * 3)) + '" text-anchor="middle" style="font:900 ' + f(sz * k) + "px Noto Sans Arabic;fill:" + ORANGE + ";paint-order:stroke;stroke:" + PAPER + ';stroke-width:6px">؟</text>'; }

  // key points (world px)
  var HD = KR.P(HEAD[0], HEAD[1], HEAD[2]), BED = KR.P(3, 4.7, 1.5), CLK = KR.P(0.02, 7.2, 5.1), PLQ = KT.P(7.4, 5.2, 0.2), DESK = KA.P(1.3, 1.0, 1.3), CYC = KS.P(2, 0.8, 2);

  // camera targets per line: [x, y, zoom, panX, panY]
  var TG = [
    [S.room.c[0], S.room.c[1], 0.87], [0, 0, 0.92], [HD[0] + 30, HD[1] - 10, 1.9], [-10, 0, 0.3], [S.city.c[0], S.city.c[1], 0.88],
    [S.tis.c[0], S.tis.c[1], 0.94], [PLQ[0], PLQ[1], 1.6], [S.tis.c[0], S.tis.c[1], 0.94], [S.tis.c[0] - 10, S.tis.c[1], 0.96, 50, 25],
    [S.ves.c[0], S.ves.c[1], 1.05], [S.bars.c[0], S.bars.c[1] - 30, 1.1], [S.arch.c[0], S.arch.c[1], 1.0], [DESK[0], DESK[1], 1.3, 10, 70],
    [S.stairs.c[0] - 60, S.stairs.c[1] - 30, 1.0, 120, 60], [CYC[0], CYC[1], 1.7], [BED[0], BED[1] - 40, 1.45], [HD[0] + 20, HD[1] - 50, 1.6],
    [S.bars.c[0], S.bars.c[1] - 30, 1.1], [S.cal.c[0], S.cal.c[1], 1.1], [S.cal.c[0] + 10, S.cal.c[1], 1.22], [0, 0, 0.85], [-30, 40, 0.21]
  ];
  function camAt(t) {
    var i = lineAt(t), u = t - LN[i].start, d = (i + 1 < LN.length ? LN[i + 1].start : VIDEO_END + 1.5) - LN[i].start;
    var B = TG[i], A = i ? TG[i - 1] : [HD[0], HD[1], 2.2], tr = i === 0 ? 3.2 : Math.min(1.0, d * 0.45), k = ease(clamp(u / tr));
    if (A.length > 3) { A = [A[0] + A[3], A[1] + A[4], A[2]]; }
    var dist = Math.hypot(B[0] - A[0], B[1] - A[1]), x = lerp(A[0], B[0], k), y = lerp(A[1], B[1], k), z = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), k));
    z *= 1 - Math.sin(Math.PI * k) * clamp(dist / 700) * 0.55;
    var after = clamp((u - tr) / Math.max(0.5, d - tr)); if (B.length > 3) { x += B[3] * ease(after); y += B[4] * ease(after); }
    z *= 1 + 0.06 * after;
    return [x + 6 * Math.sin(t * 0.9) / z, y + 5 * Math.cos(t * 0.9) / z, z, i, u, d];
  }

  // the ground: an isometric grid across the whole world, and a dashed trail between the stations
  function ground() {
    var s = "";
    for (var g = -64; g <= 64; g += 4) s += G0.line([[-64, g, 0], [64, g, 0]], "#dccfb2", 1) + G0.line([[g, -64, 0], [g, 64, 0]], "#dccfb2", 1);
    var tr = [S.cal, S.room, S.city, S.tis, S.ves, S.bars, S.arch, S.stairs, S.room], d = "";
    tr.forEach(function (st, i) { d += (i ? " L" : "M") + f(st.c[0]) + " " + f(st.c[1] + st.h * 0.42); });
    return s + '<path d="' + d + '" fill="none" stroke="#c9bc9f" stroke-width="3" stroke-dasharray="10 9" stroke-linejoin="round"/>';
  }

  // each station draws itself according to the line being spoken (li) and the time into it (u)
  function drawRoom(t, li) { return room(KR, t, { zzz: li <= 3 || li >= 20, lamp: true }); }
  function drawCity(t, li, u, d) { return city(KC, t, { trash: li < 4 ? 0.15 : li === 4 ? seg(u, 0.4, d - 0.4) : 1 }); }
  function drawTis(t, li, u, d) {
    var o = { sp: 1, waste: 0.3, act: true };
    if (li === 5) o.waste = lerp(0.3, 1, seg(u, 0.3, d - 0.3));
    else if (li === 6) { o.waste = 1; o.amy = seg(u, 0.2, 1.4); o.hurt = u > 1.6; }
    else if (li === 7) { o = { sp: 1 + 0.25 * ease(seg(u, 0.6, 3.2)), waste: 1, amy: 1, hurt: true }; }
    else if (li === 8) { o = { sp: 1.25, waste: 1, amy: 1, csf: seg(u, 0.1, 0.6), wash: seg(u, 0.6, d - 0.2), drain: true }; }
    else if (li >= 9) { o = { sp: 1.25, waste: 0, csf: 0.6, drain: true, act: li >= 16 }; }
    return tissue(KT, t, o);
  }
  function drawVes(t, li) { return vessel(KV, t, { flow: 1, waste: li >= 8 && li <= 10 }); }
  function drawBars(t, li, u) {
    if (li < 16) return bars(KB, t, { v: [3.4, 3.4], extra: 0.17, grow: li === 10 ? seg(u, 0.1, 1.0) : li < 10 ? 0.12 : 1, ex: li === 10 ? seg(u, 1.4, 2.0) : li > 10 ? 1 : 0 });
    return bars(KB, t, { v: [3.0, 2.8], c0: PAL.blue, c1: PAL.orange, grow: li === 17 ? seg(u, 0.6, 1.6) : li > 17 ? 1 : 0.12 });
  }
  function drawArch(t, li) { return archive(KA, t, { fly: true, filled: 8 + Math.floor(clamp((t - LN[11].start) / 14) * 16) }); }
  function drawStairs(t, li, u, d) { return stairs(KS, t, { grow: li < 13 ? 0.25 : li === 13 ? seg(u, 0, 1.8) : 1, mark: li === 13 ? seg(u, 0, d) * 0.9 : li === 14 ? 0.05 + 0.2 * clamp(u / d) : 0.9 + 0.1 * Math.sin(t * 0.3) }); }
  function dayAt(li, u, d) { if (li < 18) return [1, 0]; if (li > 18) return [11, 0]; var dd = clamp((u - 0.3) / Math.max(0.5, d - 0.8)), dy = 1 + Math.min(10, Math.floor(dd * 10.999)); return [dy, dy < 11 ? (dd * 10.999) % 1 : 0]; }
  function drawCal(t, li, u, d) { var q = dayAt(li, u, d); return calendar(KD, t, { day: q[0], flip: q[1], race: li >= 18 && li <= 19 }); }
  var DRAW = [[S.city, drawCity], [S.tis, drawTis], [S.cal, drawCal], [S.room, drawRoom], [S.ves, drawVes], [S.stairs, drawStairs], [S.bars, drawBars], [S.arch, drawArch]];

  // the labels, icons and numbers that go with each line (drawn over the stations, sized for the zoom)
  function overlay(t, li, u, d, z) {
    var s = "", k;
    if (li === 0) s += ring(HD[0], HD[1], 16, t, ORANGE, z * 0.9);
    if (li === 1) s += bigQ(HD[0] + 50, HD[1] - 70, seg(u, 0.2, 0.9), t, 80) + L2(CLK, 70, -60, "تمن ساعات", BLUE, seg(u, 0.6, 1.4), z);
    if (li === 2) { k = seg(u, 0.4, 1.4); s += ring(HD[0], HD[1], 14, t, ORANGE, z) + halo(KR, HEAD[0], HEAD[1], 1.1, t);
      if (k > 0) s += '<path d="M' + f(HD[0]) + " " + f(HD[1]) + " L" + f(lerp(HD[0], S.tis.c[0], k * 0.25)) + " " + f(lerp(HD[1], S.tis.c[1], k * 0.25)) + '" stroke="' + ORANGE + '" stroke-width="' + f2(2 / z) + '" stroke-dasharray="' + f2(6 / z) + " " + f2(5 / z) + '"/>';
      s += L2(HD, -60, 70, "دماغك", OLIVE, seg(u, 1.0, 1.7), z); }
    if (li === 3) [[S.tis, "1", "غسيل", BLUE, 0.3], [S.arch, "2", "ترتيب", OLIVE, 0.8], [S.stairs, "3", "دورات", ORANGE, 1.3]].forEach(function (q) {
      var kk = seg(u, q[4], q[4] + 0.5); if (kk <= 0) return; s += '<g transform="translate(' + f(q[0].c[0]) + " " + f(q[0].c[1] - q[0].h * 0.55) + ") scale(" + f2(pop(kk) / z) + ')"><circle r="16" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + q[1] + "</text></g>" + tx(q[2], q[0].c[0], q[0].c[1] - q[0].h * 0.55 - 30 / z, 16, q[3], z, 800, kk); });
    if (li === 4) { var b = BAGS[1], bp = KC.P(b[0], b[1], 0.5), bl = KC.P(9.25, 1.85, 5.2); s += L2(bl, 60, -50, "مدينة", OLIVE, seg(u, 0.3, 1.0), z) + L2(bp, 50, 70, "زبالة", ORANGE, seg(u, 1.6, 2.3), z) + sunIcon(S.city.c[0] - 130, S.city.c[1] - 170, 26, t); }
    if (li === 5) { var n = KT.P(8.6, 4.0, 0), w = KT.P(3, 5.2, 0.12); s += halo(KT, 8.6, 4.0, 0.7, t) + L2([n[0], n[1] - 22], 50, -70, "خلية عصبية", OLIVE, seg(u, 0.3, 1.0), z) + L2(w, -50, 70, "فضلات", ORANGE, seg(u, 2.0, 2.7), z); }
    if (li === 6) { var hn = KT.P(3.8, 4.0, 0); s += L2(PLQ, 40, 60, "بيتا أميلويد", BLUE, seg(u, 0.9, 1.6), z) + L2([hn[0], hn[1] - 22], -40, -50, "خلية بتتأذي", ORANGE, seg(u, 2.2, 2.9), z); }
    if (li === 7) { var sp = 1 + 0.25 * ease(seg(u, 0.6, 3.2)), G = tissueGeo(sp), a = KT.P(0.8, G.chY[1] - G.w / 2, 0.05), bb = KT.P(0.8, G.chY[1] + G.w / 2, 0.05), dk = seg(u, 1.0, 1.5);
      s += moonIcon(S.tis.c[0] - 150, S.tis.c[1] - 120, 20) + tx("نوم عميق", S.tis.c[0] - 150, S.tis.c[1] - 82, 14, BLUE, z, 800, seg(u, 0.3, 0.9));
      if (dk > 0) s += arrow(a[0], a[1], bb[0], bb[1], ORANGE, 2.4, dk) + arrow(bb[0], bb[1], a[0], a[1], ORANGE, 2.4, dk);
      s += numTag("+60%", S.tis.c[0] + 120, S.tis.c[1] - 120, seg(u, 2.6, 3.2), 22, ORANGE, z);
      var mk = seg(u, 3.4, 4.0); if (mk > 0) s += '<g opacity="' + f2(mk) + '">' + mouseIcon(S.tis.c[0] - 120, S.tis.c[1] + 150, 0.55, t) + "</g>" + tx("في الفيران", S.tis.c[0] - 10, S.tis.c[1] + 160, 15, OLIVE, z, 800, mk); }
    if (li === 8) { var G8 = tissueGeo(1.25), c8 = KT.P(2.0, G8.chY[0], 0.05), dr = KT.P(10.5, 6.5, -0.5), a8 = KT.P(5.5, G8.chY[1], 0.4), b8 = KT.P(9.2, G8.chY[1], 0.4);
      s += arrow(a8[0], a8[1], b8[0], b8[1], BLUE, 3, seg(u, 1.2, 2.0)) + L2(c8, -50, -60, "سايل المخ", BLUE, seg(u, 0.4, 1.1), z) + L2(dr, 50, 50, "بره", ORANGE, seg(u, 2.4, 3.0), z); }
    if (li === 9) { var sl = KV.P(5, 0, 1.0), ar = KV.P(12, 0, 0); s += L2(sl, -50, -60, "الجليمفاتيك", BLUE, seg(u, 0.4, 1.1), z) + L2(ar, -30, 70, "شريان", OLIVE, seg(u, 1.2, 1.9), z) + numTag("2012", S.ves.c[0] + 60, S.ves.c[1] - 110, seg(u, 2.0, 2.6), 20, INK, z); }
    if (li === 10) { var b1 = KB.P(0.8, 1.6, 0), b2 = KB.P(3.8, 1.6, 0), fr = KB.P(3.8, 1.6, 1.7), t1 = KB.P(0.8, 0.8, 3.4), t2 = KB.P(3.8, 0.8, 3.6), gk = seg(u, 0.6, 1.2);
      s += tx("بعد ليلة نوم", b1[0], b1[1] + 34, 13, INK, z) + tx("بعد ليلة سهر", b2[0], b2[1] + 34, 13, INK, z);
      if (gk > 0) s += '<g opacity="' + f2(gk) + '">' + moonIcon(t1[0], t1[1] - 36, 15) + eyeIcon(t2[0], t2[1] - 36, 0.45, t) + "</g>";
      s += L2(fr, 60, -30, "بيتا أميلويد", BLUE, seg(u, 0.8, 1.4), z) + numTag("+5%", t2[0] + 70, t2[1] - 40, seg(u, 2.0, 2.6), 20, ORANGE, z); }
    if (li === 11) { var dk1 = KA.P(1.2, 1.0, 1.6); s += L2(dk1, 60, -70, "ذكريات اليوم", BLUE, seg(u, 0.5, 1.2), z); }
    if (li === 12) { var dk2 = KA.P(1.3, 2.0, 0.6), sh = KA.P(6.5, 6.4, 3.2); s += halo(KA, 1.3, 1.0, 1.9, t) + L2(dk2, -60, -40, "الهيبوكامبس", OLIVE, seg(u, 0.2, 0.9), z) + L2(sh, -60, 40, "القشرة", OLIVE, seg(u, 2.4, 3.1), z); }
    if (li === 13) { var a3 = KS.P(0.5, -0.5, 3.6), b3 = KS.P(3.5, -0.5, 3.6), k3 = seg(u, 1.6, 2.2);
      s += moonIcon(S.stairs.c[0] + 120, S.stairs.c[1] - 140, 18);
      if (k3 > 0) { var e3 = [lerp(a3[0], b3[0], k3), lerp(a3[1], b3[1], k3)]; s += '<path d="M' + f(a3[0]) + " " + f(a3[1]) + " L" + f(e3[0]) + " " + f(e3[1]) + '" stroke="' + ORANGE + '" stroke-width="' + f2(3 / z) + '"/>'; if (k3 >= 1) s += tx("90 دقيقة", (a3[0] + b3[0]) / 2 + 10, (a3[1] + b3[1]) / 2 - 16 / z, 15, ORANGE, z); } }
    if (li === 14) { var l = stairTop(KS, 1), dd = stairTop(KS, 3), r = stairTop(KS, 6);
      s += L2(l, -40, -50, "خفيف", BLUE, seg(u, 0.1, 0.7), z) + L2(dd, -40, 60, "عميق", "#4a5e7c", seg(u, 0.9, 1.5), z) + L2(r, 50, -60, "أحلام", ORANGE, seg(u, 1.9, 2.5), z);
      s += waveRay(l[0] - 70 / z, l[1] - 72 / z, l[0] - 20 / z, l[1] - 72 / z, t, BLUE, 2 / z, 7 / z, seg(u, 0.4, 0.9), 1.6 / z) + waveRay(dd[0] - 72 / z, dd[1] + 80 / z, dd[0] - 22 / z, dd[1] + 80 / z, t * 0.4, "#4a5e7c", 5 / z, 22 / z, seg(u, 1.2, 1.7), 1.8 / z) + waveRay(r[0] + 22 / z, r[1] - 82 / z, r[0] + 72 / z, r[1] - 82 / z, t, ORANGE, 2.4 / z, 7 / z, seg(u, 2.2, 2.7), 1.6 / z); }
    if (li === 15) { var c5 = seg(u, 0.2, 0.8), l1 = KR.P(3.2, 4.0, 2.1), l2 = KR.P(5.0, 4.4, 1.9);
      if (c5 > 0) s += '<g opacity="' + f2(c5) + '"><circle cx="' + f(HD[0] + 12) + '" cy="' + f(HD[1] - 22) + '" r="3" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/>' + cloud(HD[0] + 50, HD[1] - 78, 110, 64) + runner(HD[0] + 50, HD[1] - 62, 0.5, t) + "</g>";
      s += lockIcon(l1[0], l1[1] - 9, 0.6, seg(u, 1.2, 1.7)) + lockIcon(l2[0], l2[1] - 9, 0.6, seg(u, 1.5, 2.0)) + L2([l1[0], l1[1] - 9], 50, 60, "العضلات مقفولة", ORANGE, seg(u, 1.8, 2.5), z);
      var e5 = seg(u, 2.6, 3.1); if (e5 > 0) s += '<g opacity="' + f2(e5) + '">' + eyeIcon(BED[0] - 70, BED[1] + 60, 0.45, t) + "</g>" + tx("REM", BED[0] - 70, BED[1] + 88, 14, BLUE, z, 900, e5); }
    if (li === 16) { s += bulb(HD[0] + 6, HD[1] - 60, 0.5, false) + tx("بيطفي؟", HD[0] + 70, HD[1] - 60, 14, "#8a8070", z, 800, seg(u, 0.2, 0.8)) + crossMark(HD[0] + 6, HD[1] - 50, 0.85, seg(u, 1.2, 1.7)); }
    if (li === 17) { var p1 = KB.P(0.8, 1.6, 0), p2 = KB.P(3.8, 1.6, 0); s += tx("صاحي", p1[0], p1[1] + 34, 14, BLUE, z) + tx("نوم الأحلام", p2[0], p2[1] + 34, 14, ORANGE, z) + tx("نشاط المخ", S.bars.c[0], S.bars.c[1] - 140, 15, INK, z, 800, seg(u, 0.3, 0.9)); }
    if (li === 18) { var cc = KD.P(2.2, 2.6, 1.4); s += tx("1964", S.cal.c[0], S.cal.c[1] + 150, 26, ORANGE, z, 900) + L2(cc, -50, -60, "11 يوم", BLUE, seg(u, 2.5, 3.1), z); }
    if (li === 19) { var gk2 = seg(u, 1.6, 2.2), bk = pop(seg(u, 0.3, 0.9));
      for (var i = 0; i < 4; i++) s += ghostTree(S.cal.c[0] - 120 + i * 80, S.cal.c[1] - 40 + (i % 2) * 120, 0.7, gk2 * (0.45 + 0.45 * Math.sin(t * 3 + i * 1.7))).replace(/#cfe3ee/g, "#6f8fae");
      if (bk > 0) s += '<g transform="translate(' + f(S.cal.c[0] + 60) + " " + f(S.cal.c[1] - 120) + ") scale(" + f2(bk * 0.55) + ')"><path d="M-110 -44 H110 V40 H-20 L-46 70 L-40 40 H-110 Z" fill="#fbf8f0" stroke="' + INK + '" stroke-width="2.4"/>' + T("كـ..لا..ـم؟!", 0, 12, 36, INK, 800) + "</g>";
      s += L2([S.cal.c[0] - 40, S.cal.c[1] + 60], -40, 50, "هلاوس", ORANGE, seg(u, 2.0, 2.6), z); }
    if (li === 20) s += L2(CLK, 60, -50, "7 ساعات على الأقل", ORANGE, seg(u, 2.2, 2.9), z);
    if (li === 21) [[S.tis, "1"], [S.arch, "2"], [S.stairs, "3"], [S.room, "4"]].forEach(function (q, j) { var kk = seg(u, 0.2 + j * 0.2, 0.7 + j * 0.2); if (kk > 0) s += '<g transform="translate(' + f(q[0].c[0]) + " " + f(q[0].c[1] - q[0].h * 0.5) + ") scale(" + f2(pop(kk) / z) + ')"><circle r="15" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#fff">' + q[1] + "</text></g>"; });
    return s;
  }

  window.__world = function (svg, t) {
    var c = camAt(t), z = c[2], li = c[3], u = c[4], d = c[5], vx0 = c[0] - CX / z, vy0 = c[1] - CY / z, vx1 = vx0 + VW / z, vy1 = vy0 + VH / z, s = ground();
    DRAW.forEach(function (q) { var st = q[0]; if (st.c[0] + st.w / 2 + 40 < vx0 || st.c[0] - st.w / 2 - 40 > vx1 || st.c[1] + st.h / 2 + 60 < vy0 || st.c[1] - st.h / 2 - 60 > vy1) return; s += q[1](t, li, u, d); });
    if (z < 0.6) { var op = clamp((0.6 - z) / 0.2); DRAW.forEach(function (q) { var st = q[0]; s += tx(st.name, st.c[0], st.c[1] + st.h * 0.5 + 24 / z, 14, "#6a6458", z, 800, op); }); }
    s += overlay(t, li, u, d, z);
    svg.innerHTML = '<g transform="translate(' + CX + " " + CY + ") scale(" + z.toFixed(4) + ") translate(" + f(-c[0]) + " " + f(-c[1]) + ')">' + s + '</g><rect width="360" height="640" filter="url(#paperN)"/>';
    return li;
  };
})();
