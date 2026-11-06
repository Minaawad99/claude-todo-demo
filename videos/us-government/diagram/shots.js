/* «إزاي الحكم في أمريكا بيمشي؟» — «الرسم الهندسي» shots. One shot per script line:
   line 0 = opening card (window.__intro), lines 1–23 = panel shots, line 24 = summary card (window.__outro). */
(function () {
  var h = window.H, T = h.T, R = h.R, label = h.label, callout = h.callout, cross = h.crossMark, numBox = h.numBox,
      arrow = h.arrow, inset = h.inset, pop = h.pop, clamp = h.clamp, lerp = h.lerp, ease = h.ease, f = h.f;
  var INK = h.INK, PAPER = h.PAPER, ORANGE = h.ORANGE, BLUE = h.BLUE, OLIVE = h.OLIVE, PUTTY = h.PUTTY, BONE = h.BONE;
  var LAND = "#d9cdae", CARD = "#e6dcc2";

  function C(x, y, z) { return function () { return [x, y, z]; }; }
  function P(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function poly(pts, tx, ty, s) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(tx + p[0] * s) + " " + f(ty + p[1] * s); }).join(" ") + " Z"; }
  function ch(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * s) + ')"><path d="M-28 2 L-8 22 L30 -24" fill="none" stroke="' + OLIVE + '" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function circ(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 2) + '"/>'; }

  // real state boundaries (usmap.js, 600×380 frame). Drawn at scale s × (400/600) so the layout matches the older 400-wide map.
  function usMap(x, y, s, hl) {
    hl = hl || {};
    var k = s * 400 / 600, sw = 0.9 / k, o = "";
    Object.keys(USMAP).forEach(function (code) {
      var fill = hl[code] || LAND;
      o += '<path d="' + USMAP[code] + '" transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/>';
    });
    return o;
  }
  // one state placed so its bounding-box centre lands on (cx, cy) at scale k (600-frame units)
  function stateAt(code, cx, cy, k, fill) {
    var B = USBOUNDS[code], tx = cx - B[0] * k, ty = cy - B[1] * k;
    return '<path d="' + USMAP[code] + '" transform="translate(' + f(tx) + ' ' + f(ty) + ') scale(' + f(k) + ')" fill="' + (fill || LAND) + '" stroke="' + INK + '" stroke-width="' + f(1.4 / k) + '" stroke-linejoin="round"/>';
  }
  function stateShape(code, x, y, k, fill) {
    return '<path d="' + USMAP[code] + '" transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')" fill="' + (fill || LAND) + '" stroke="' + INK + '" stroke-width="' + f(1.4 / k) + '" stroke-linejoin="round"/>';
  }
  function pt(x, y, s, px, py) { return [x + px * s, y + py * s]; }

  // buildings: x = centre, y = base line
  function windows(x, y, cols, rows, gx, gy, w, h, col) {
    var o = "";
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) o += R(x + c * gx, y + r * gy, w, h, col || "#b9b29c", 1.2, 1);
    return o;
  }
  function capitol(x, y, s) {
    var W = 240 * s, o = "", i;
    o += R(x - W / 2 - 6 * s, y - 12 * s, W + 12 * s, 12 * s, PUTTY, 2, 0);            // platform
    o += R(x - W / 2, y - 62 * s, W * 0.27, 50 * s, BONE, 2, 0) + R(x + W / 2 - W * 0.27, y - 62 * s, W * 0.27, 50 * s, BONE, 2, 0);
    o += windows(x - W / 2 + 10 * s, y - 52 * s, 3, 1, 22 * s, 0, 10 * s, 18 * s);
    o += windows(x + W / 2 - W * 0.27 + 10 * s, y - 52 * s, 3, 1, 22 * s, 0, 10 * s, 18 * s);
    o += R(x - W * 0.2, y - 92 * s, W * 0.4, 80 * s, BONE, 2, 0);                       // central block
    o += '<path d="M' + f(x - W * 0.22) + ' ' + f(y - 92 * s) + ' L' + f(x) + ' ' + f(y - 118 * s) + ' L' + f(x + W * 0.22) + ' ' + f(y - 92 * s) + ' Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
    for (i = 0; i < 6; i++) o += R(x - W * 0.17 + i * W * 0.068, y - 80 * s, 6 * s, 66 * s, PAPER, 1.4, 0);     // columns
    o += R(x - W * 0.14, y - 130 * s, W * 0.28, 36 * s, BONE, 2, 0);                   // drum
    o += '<path d="M' + f(x - W * 0.15) + ' ' + f(y - 130 * s) + ' A' + f(W * 0.15) + ' ' + f(W * 0.15) + ' 0 0 1 ' + f(x + W * 0.15) + ' ' + f(y - 130 * s) + ' Z" fill="' + PUTTY + '" stroke="' + INK + '" stroke-width="2"/>';
    o += R(x - 3 * s, y - 175 * s, 6 * s, 20 * s, INK, 1, 0);                          // lantern
    return o;
  }
  function whitehouse(x, y, s) {
    var W = 170 * s, H = 70 * s, o = "", i;
    o += R(x - W / 2 - 8 * s, y, W + 16 * s, 8 * s, PUTTY, 2, 0);                       // base
    o += R(x - W / 2, y - H, W, H, BONE, 2, 0);
    o += '<path d="M' + f(x - W / 2 - 8 * s) + ' ' + f(y - H) + ' L' + f(x) + ' ' + f(y - H - 42 * s) + ' L' + f(x + W / 2 + 8 * s) + ' ' + f(y - H) + ' Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
    o += windows(x - W / 2 + 14 * s, y - H + 12 * s, 3, 1, 46 * s, 0, 16 * s, 14 * s);
    o += windows(x - W / 2 + 14 * s, y - H + 36 * s, 3, 1, 46 * s, 0, 16 * s, 14 * s);
    o += windows(x + 0 - 0, y - H + 12 * s, 0, 1, 0, 0, 0, 0);
    o += R(x - 18 * s, y - H + 30 * s, 36 * s, H - 30 * s, OLIVE, 1.6, 0);             // door
    for (i = 0; i < 4; i++) o += R(x - 30 * s + i * 20 * s, y - H + 6 * s, 6 * s, H - 14 * s, PAPER, 1.2, 0); // portico columns
    return o;
  }
  function court(x, y, s) {
    var W = 200 * s, o = "";
    o += R(x - W / 2 - 8 * s, y - 10 * s, W + 16 * s, 10 * s, PUTTY, 2, 0);
    o += '<path d="M' + f(x - W / 2) + ' ' + f(y - 80 * s) + ' L' + f(x) + ' ' + f(y - 120 * s) + ' L' + f(x + W / 2) + ' ' + f(y - 80 * s) + ' Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
    o += R(x - W / 2, y - 80 * s, W, 8 * s, BONE, 2, 0);
    for (var i = 0; i < 6; i++) o += R(x - W / 2 + 10 * s + i * (W - 20 * s) / 5 - 5 * s, y - 72 * s, 10 * s, 62 * s, BONE, 1.6, 0);
    return o;
  }
  function seats(cx, cy, r0, r1, N, col, k) {
    var rows = 7, pts = [], tot = 0, rad = [], r, j;
    for (r = 0; r < rows; r++) { var rr = lerp(r0, r1, r / (rows - 1)); rad.push(rr); tot += rr; }
    for (r = 0; r < rows; r++) {
      var n = Math.round(N * rad[r] / tot);
      for (j = 0; j < n; j++) { var a = Math.PI * (j + 0.5) / n; pts.push([cx + rad[r] * Math.cos(Math.PI - a), cy - rad[r] * Math.sin(a)]); }
    }
    var show = Math.round(pts.length * clamp(k == null ? 1 : k)), o = "";
    for (var i = 0; i < show; i++) o += '<circle cx="' + f(pts[i][0]) + '" cy="' + f(pts[i][1]) + '" r="3.2" fill="' + (col || BLUE) + '" stroke="' + INK + '" stroke-width=".7"/>';
    return o + R(cx - r1 - 12, cy, 2 * r1 + 24, 12, PUTTY, 2, 0);
  }
  function person(x, y, s, col) {
    return circ(x, y - 44 * s, 9 * s, col, 1.6) + '<path d="M' + f(x - 17 * s) + ' ' + f(y) + ' Q' + f(x - 17 * s) + ' ' + f(y - 30 * s) + ' ' + f(x) + ' ' + f(y - 30 * s) + ' Q' + f(x + 17 * s) + ' ' + f(y - 30 * s) + ' ' + f(x + 17 * s) + ' ' + f(y) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6"/>';
  }
  function pawn(x, y, s, col) {
    return R(x - 24 * s, y - 6 * s, 48 * s, 7 * s, col, 1.8, 0) +
      '<path d="M' + f(x - 20 * s) + ' ' + f(y - 6 * s) + ' L' + f(x - 12 * s) + ' ' + f(y - 36 * s) + ' Q' + f(x) + ' ' + f(y - 32 * s) + ' ' + f(x + 12 * s) + ' ' + f(y - 36 * s) + ' L' + f(x + 20 * s) + ' ' + f(y - 6 * s) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      circ(x, y - 50 * s, 11 * s, col, 1.8);
  }
  function shirt(x, y, s, col) {
    var P2 = [[-40,-30],[-14,-40],[-6,-30],[6,-30],[14,-40],[40,-30],[60,-6],[46,12],[34,4],[34,50],[-34,50],[-34,4],[-46,12],[-60,-6]];
    return '<path d="' + poly(P2, x, y, s).replace(/ Z$/, "") + ' Z" fill="' + (col || BONE) + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  }
  function paperDoc(x, y, s, col) {
    var o = R(x - 40 * s, y - 50 * s, 80 * s, 100 * s, col || BONE, 2, 3);
    for (var i = 0; i < 4; i++) o += '<line x1="' + f(x - 26 * s) + '" y1="' + f(y - 30 * s + i * 18 * s) + '" x2="' + f(x + 26 * s) + '" y2="' + f(y - 30 * s + i * 18 * s) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    return o;
  }
  function ballot(x, y, s) {
    return R(x - 60 * s, y - 56 * s, 120 * s, 56 * s, PUTTY, 2, 4) + R(x - 36 * s, y - 62 * s, 72 * s, 8 * s, INK, 1, 0);
  }
  // one state-tile with a short name and an optional number
  function tile(x, y, w, h, fill, txt, k) {
    k = clamp(k == null ? 1 : k);
    return R(x, y, w, h * k, fill, 2, 3) + (k > 0.9 ? T(txt, x + w / 2, y + h / 2 + 8, 20, INK, 800) : "");
  }
  // a horizontal bar of 538 electors: 435 House, 100 Senate, 3 DC
  function electorBar(x, y, w, h, k, mark270) {
    var segs = [[435, PUTTY], [100, BLUE], [3, ORANGE]], o = "", cur = x, total = 538;
    segs.forEach(function (s, i) {
      var sw = w * s[0] / total * clamp(k * 1.4 - i * 0.2);
      o += R(cur, y, Math.max(0, sw), h, s[1], 1.6, 0); cur += w * s[0] / total;
    });
    if (mark270) o += '<line x1="' + f(x + w * 270 / total) + '" y1="' + f(y - 30) + '" x2="' + f(x + w * 270 / total) + '" y2="' + f(y + h + 26) + '" stroke="' + INK + '" stroke-width="2.4"/>';
    return o;
  }

  /* ---------- opening card (line 0): the card's own hook, plus a small picture ---------- */
  window.__intro = function (svg, t) {
    var p = ease(clamp(t / 1.2));
    var o = R(20, 70, 230, 170, "#e4d9bd", 2, 6) + R(330, 70, 230, 170, "#e4d9bd", 2, 6);
    o += T("كاليفورنيا", 135, 268, 20, INK, 800) + T("أوريجون", 445, 268, 20, INK, 800);
    o += '<g transform="translate(' + f(290) + ' ' + f(150 + Math.sin(t * 2.2) * 4) + ') scale(' + f(0.9 * p) + ')">' + shirt(0, 0, 1, BONE) + '</g>';
    o += '<g opacity="' + f(clamp((t - 0.8) / 0.6)) + '">' + T("+ ضريبة", 135, 130, 26, ORANGE, 800) + T("صفر", 445, 130, 40, OLIVE, 900) + '</g>';
    var belt = '';
    for (var i = 0; i < 24; i++) { var x = ((i * 30 - t * 140) % 720 + 720) % 720 - 40; belt += '<circle cx="' + f(x) + '" cy="292" r="8" fill="' + (i % 3 ? ORANGE : OLIVE) + '"/>'; }
    svg.innerHTML = '<rect x="-100" y="-100" width="800" height="500" fill="' + PAPER + '"/><rect x="-100" y="-100" width="800" height="500" fill="url(#grid)" transform="translate(' + f(-((t * 40) % 48)) + ' 0)"/>' + o + belt;
  };

  /* ---------- panel shots ---------- */
  // 1: the map, two states
  shot(1, P(320, 400, 1, 330, 420, 1.08), function (u, d, t) {
    var p = ease(clamp(u / 0.7));
    return usMap(70, 170, 1.25, { CA: ORANGE, OR: OLIVE }) +
      label(145, 370, 110, 580, "كاليفورنيا", ORANGE, p, 26) +
      label(145, 262, 120, 150, "أوريجون", OLIVE, p, 26) +
      numBox("؟", 320, 110, p, 40);
  });
  // 2: fifty states
  shot(2, P(320, 300, 1, 320, 430, 1.05), function (u, d, t) {
    var p = clamp(u / (d * 0.7)), o = usMap(70, 110, 1.25, {}), i, c, r;
    for (i = 0; i < 50; i++) {
      c = i % 10; r = Math.floor(i / 10);
      var on = clamp(p * 50 - i) , x = 110 + c * 40, y = 520 + r * 36;
      o += R(x - 14, y - 12, 28, 22, on > 0 ? OLIVE : PUTTY, 1.4, 4);
    }
    return o + numBox("50", 320, 470, pop(clamp(u / 0.5)), 34);
  });
  // 3: the stopwatch
  shot(3, C(320, 400, 1), function (u, d, t) {
    var a = t * 0.9, cx = 320, cy = 420, r = 170, o = "";
    o += circ(cx, cy, r, BONE, 3.4);
    for (var i = 0; i < 12; i++) { var q = i / 12 * Math.PI * 2; o += '<line x1="' + f(cx + Math.cos(q) * (r - 14)) + '" y1="' + f(cy + Math.sin(q) * (r - 14)) + '" x2="' + f(cx + Math.cos(q) * (r - 30)) + '" y2="' + f(cy + Math.sin(q) * (r - 30)) + '" stroke="' + INK + '" stroke-width="3"/>'; }
    o += R(cx - 20, cy - r - 30, 40, 26, INK, 1, 4) + '<line x1="' + f(cx) + '" y1="' + f(cy) + '" x2="' + f(cx + Math.cos(a - 1.57) * (r - 40)) + '" y2="' + f(cy + Math.sin(a - 1.57) * (r - 40)) + '" stroke="' + ORANGE + '" stroke-width="7" stroke-linecap="round"/>' + circ(cx, cy, 9, INK, 1);
    return o + numBox("دقيقة", 320, 130, pop(clamp(u / 0.5)), 36);
  });
  // 4: the federal government in Washington, three jobs
  shot(4, P(320, 400, 1, 320, 420, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 0.8)), o = capitol(320, 380, 1.35);
    var items = [[130, "الجيش"], [320, "العملة"], [510, "الحدود"]];
    items.forEach(function (it, i) {
      var x = it[0], y = 610, q = clamp(p * 3 - i * 0.6);
      o += circ(x, y, 42, BONE, 2.4);
      if (i === 0) o += '<path d="M' + f(x - 20) + ' ' + f(y - 22) + ' L' + f(x + 20) + ' ' + f(y - 22) + ' L' + f(x + 20) + ' ' + f(y + 2) + ' Q' + f(x) + ' ' + f(y + 26) + ' ' + f(x - 20) + ' ' + f(y + 2) + ' Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>';
      if (i === 1) o += circ(x, y, 22, ORANGE, 2) + T("$", x, y + 8, 26, INK, 900);
      if (i === 2) o += R(x - 26, y - 10, 52, 20, PUTTY, 2, 0) + '<path d="M' + f(x - 20) + ' ' + f(y - 10) + ' l8 -10 M' + f(x - 4) + ' ' + f(y - 10) + ' l8 -10 M' + f(x + 12) + ' ' + f(y - 10) + ' l8 -10" stroke="' + INK + '" stroke-width="1.6"/>';
      o += label(x, y - 42, x, y - 110 - 0, it[1], i === 1 ? ORANGE : INK, q, 25);
    });
    return o;
  });
  // 5: most daily things belong to the state (inset with a school and a receipt)
  shot(5, P(320, 380, 1, 320, 400, 1.1), function (u, d, t) {
    var p = ease(clamp(u / 0.8)), ins = "";
    ins += R(-100, -10, 90, 80, BONE, 2, 0) + '<path d="M-108 -10 L-55 -48 L-2 -10 Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
    ins += R(-72, 30, 22, 40, OLIVE, 1.6, 0) + R(-94, 0, 14, 14, PUTTY, 1.6, 0) + R(-38, 0, 14, 14, PUTTY, 1.6, 0);
    ins += R(20, -6, 60, 80, BONE, 2, 3) + T("%", 50, 44, 40, ORANGE, 900) + R(30, 56, 40, 4, INK, 1, 0) + R(30, 66, 30, 4, INK, 1, 0);
    return usMap(40, 220, 1.05, { MI: OLIVE }) +
      '<line x1="' + f(440) + '" y1="' + f(260) + '" x2="' + f(420) + '" y2="' + f(430) + '" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 5"/>' +
      inset(470, 520, 110 * p + 0.01, ins, 1) +
      label(110, 290, 360, 150, "التعليم", INK, p, 26) +
      label(470, 470, 130, 560, "الضرايب", ORANGE, p, 26);
  });
  // 6: three powers in one government
  shot(6, P(320, 400, 1, 320, 420, 1.04), function (u, d, t) {
    var p = ease(clamp(u / 0.8)), o = "";
    o += capitol(130, 560, 0.62) + whitehouse(320, 560, 0.85) + court(510, 560, 0.7);
    o += callout("1", 130, 400, pop(clamp(p * 3))) + callout("2", 320, 320, pop(clamp(p * 3 - 0.3))) + callout("3", 510, 400, pop(clamp(p * 3 - 0.6)));
    o += T("الكونجرس", 130, 650, 24, INK, 800) + T("الرئيس", 320, 650, 24, INK, 800) + T("المحاكم", 510, 650, 24, INK, 800);
    o += arrow(190, 430, 250, 430, ORANGE, 3, clamp(p * 2 - 0.5)) + arrow(450, 430, 390, 430, ORANGE, 3, clamp(p * 2 - 0.5));
    return o;
  });
  // 7: Congress makes the law
  shot(7, P(320, 470, 1.1, 320, 430, 1.35), function (u, d, t) {
    var p = ease(clamp(u / 0.8)), o = capitol(320, 600, 1.4);
    o += '<g transform="translate(470 420) rotate(' + f(-8 + Math.sin(t * 2) * 3) + ')">' + paperDoc(0, 0, 0.9, BONE) + '</g>';
    o += callout("1", 320, 250, pop(p));
    return o + label(320, 250, 430, 170, "الكونجرس", INK, p, 26);
  });
  // 8: the House, 435 seats
  shot(8, P(320, 380, 1, 320, 420, 1.12), function (u, d, t) {
    var p = ease(clamp(u / 1.6));
    return seats(320, 520, 120, 260, 435, BLUE, p) + numBox("435", 320, 200, pop(clamp(u / 0.5)), 40) + T("مجلس النواب", 320, 660, 26, INK, 800);
  });
  // 9: seats follow population (bars)
  shot(9, P(320, 400, 1, 320, 410, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 1.2)), base = 640, sc = 9.2, o = "";
    var bars = [[120, 39, "كاليفورنيا", "52", ORANGE], [320, 10, "ميشيغان", "13", OLIVE], [520, 0.6, "وايومنج", "1", BLUE]];
    bars.forEach(function (b, i) {
      var hgt = Math.max(6, b[1] * sc * ease(clamp(p * 1.4 - i * 0.2)));
      o += R(b[0] - 45, base - hgt, 90, hgt, b[4], 2, 0);
      o += numBox(b[3], b[0], base - hgt - 36, pop(clamp(p * 2 - i * 0.4)), 26);
      o += T(b[2], b[0], base + 36, 24, INK, 800);
    });
    return o + R(60, base, 520, 3, INK, 1, 0);
  });
  // 10: Michigan has 13 seats
  shot(10, P(320, 400, 1, 470, 300, 1.8), function (u, d, t) {
    var p = ease(clamp(u / 0.9)), o = usMap(70, 170, 1.25, { MI: OLIVE });
    o += label(482, 282, 500, 150, "13 مقعد", OLIVE, p, 28);
    for (var i = 0; i < 13; i++) o += person(170 + i * 30, 640, 0.5, i < 13 * p ? OLIVE : PUTTY);
    return o;
  });
  // 11: the Senate, two seats each, whatever the size
  shot(11, P(320, 400, 1, 320, 410, 1.04), function (u, d, t) {
    var p = ease(clamp(u / 0.9)), o = "";
    [[170, "كاليفورنيا", "أكتر من 39 مليون", ORANGE], [470, "وايومنج", "أقل من 600 ألف", OLIVE]].forEach(function (b, i) {
      var k = clamp(p * 1.5 - i * 0.3);
      o += R(b[0] - 110, 260, 220, 230 * (k > 0 ? 1 : 0), CARD, 2, 6);
      o += T(b[1], b[0], 230, 26, INK, 800) + T(b[2], b[0], 500, 19, INK, 700);
      o += person(b[0] - 40, 430, 0.9, b[3]) + person(b[0] + 40, 430, 0.9, b[3]);
      o += numBox("2", b[0], 330, pop(k), 30);
    });
    return o + T("كل ولاية = 2", 320, 650, 26, INK, 800);
  });
  // 12: the balance: the small state's voice weighs the same
  shot(12, C(320, 400, 1), function (u, d, t) {
    var tilt = Math.sin(t * 1.4) * 0.02, o = "";
    o += '<g transform="rotate(' + f(tilt * 57.3) + ' 320 330)">' + R(60, 326, 520, 12, INK, 1, 0) + '</g>';
    o += '<polygon points="290,470 350,470 320,330" fill="' + PUTTY + '" stroke="' + INK + '" stroke-width="2.4"/>';
    o += R(260, 470, 120, 22, PUTTY, 2, 0);
    o += '<g transform="translate(150 330) rotate(' + f(tilt * 57.3) + ')">' + R(-80, 0, 160, 120, CARD, 2, 6) + T("2", 0, 80, 60, INK, 900) + '</g>';
    o += '<g transform="translate(490 330) rotate(' + f(tilt * 57.3) + ')">' + R(-80, 0, 160, 120, CARD, 2, 6) + T("2", 0, 80, 60, INK, 900) + '</g>';
    return o + ch(320, 200, 1, pop(clamp(u / 0.6))) + T("متساويين", 320, 690, 30, OLIVE, 900);
  });
  // 13: a bill goes through both chambers, then to the President
  shot(13, P(320, 400, 1, 320, 420, 1.05), function (u, d, t) {
    var p = ease(clamp(u / 1.2)), o = "";
    o += seats(150, 300, 50, 110, 60, BLUE, 1) + seats(490, 300, 50, 110, 60, BLUE, 1);
    o += T("النواب", 150, 150, 22, INK, 800) + T("الشيوخ", 490, 150, 22, INK, 800);
    o += whitehouse(320, 690, 0.9);
    var s1 = clamp(p * 2), s2 = clamp(p * 2 - 1);
    var x = lerp(150, 320, s1), y = lerp(330, 470, s1);
    if (s1 >= 1) { x = lerp(490, 320, s2); y = lerp(330, 470, s2); }
    o += arrow(150, 340, 280, 460, INK, 2, s1) + arrow(490, 340, 360, 460, INK, 2, s2);
    o += '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + paperDoc(0, 0, 0.45, BONE) + '</g>';
    return o + T("قانون", 320, 752, 26, OLIVE, 900);
  });
  // 14: the President signs, or vetoes
  shot(14, P(320, 400, 1, 320, 420, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 0.9)), o = whitehouse(320, 620, 1.5);
    o += paperDoc(170, 300, 0.8, BONE) + ch(170, 300, 0.8, clamp(p * 2)) + paperDoc(470, 300, 0.8, BONE) + cross(470, 300, 0.8, clamp(p * 2 - 0.4));
    return o + label(170, 250, 140, 160, "يوقّع", OLIVE, p, 26) + label(470, 250, 500, 160, "يرفض", ORANGE, p, 26);
  });
  // 15: the Supreme Court can cancel a law against the constitution
  shot(15, P(320, 400, 1, 320, 420, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 0.9)), o = court(320, 630, 1.4);
    o += paperDoc(320, 330, 0.9, BONE) + cross(320, 330, 0.9, p);
    return o + label(320, 240, 170, 200, "دستور", INK, p, 26) + label(320, 480, 520, 730, "المحكمة العليا", INK, p, 26);
  });
  // 16: each power can stop the others
  shot(16, C(320, 400, 1), function (u, d, t) {
    var p = clamp(u / 1), N = [[320, 230, "الكونجرس", "1"], [160, 560, "الرئيس", "2"], [480, 560, "المحاكم", "3"]], o = "";
    o += arrow(280, 290, 200, 510, INK, 2.4, p) + arrow(200, 560, 440, 560, INK, 2.4, p) + arrow(440, 510, 360, 290, INK, 2.4, p);
    o += arrow(360, 292, 440, 510, ORANGE, 2.4, p) + arrow(420, 560, 200, 560, ORANGE, 2.4, p) + arrow(200, 510, 280, 292, ORANGE, 2.4, p);
    N.forEach(function (n, i) { o += circ(n[0], n[1], 66, BONE, 2.4) + T(n[2], n[0], n[1] + 7, 20, INK, 800) + callout(n[3], n[0], n[1] - 80, pop(clamp(p * 2 - i * 0.2))); });
    return o + T("يوقفوا بعض", 320, 690, 30, ORANGE, 900);
  });
  // 17: the President is elected indirectly
  shot(17, P(320, 400, 1, 320, 420, 1.05), function (u, d, t) {
    var p = ease(clamp(u / 0.9)), o = "";
    o += ballot(190, 600, 1.2);
    o += paperDoc(190 + Math.sin(t * 2) * 3, 500, 0.6, BONE);
    o += usMap(170, 250, 0.75, { CA: BLUE, OR: BLUE, MI: OLIVE });
    o += numBox("؟", 320, 190, pop(p), 40);
    return o + label(190, 540, 150, 680, "الشعب", INK, p, 26) + label(330, 400, 500, 640, "المجمع الانتخابي", ORANGE, p, 22);
  });
  // 18: 538 electors
  shot(18, C(320, 400, 1), function (u, d, t) {
    var p = ease(clamp(u / 1.2)), o = "";
    o += electorBar(60, 400, 520, 90, p, false);
    o += numBox("538", 320, 300, pop(clamp(u / 0.5)), 46);
    o += T("435 نواب", 60 + 520 * 217 / 538, 378, 20, INK, 800) + T("100 شيوخ", 60 + 520 * 485 / 538, 378, 20, BLUE, 800) + T("3 واشنطن", 60 + 520 * 536.5 / 538, 530, 18, ORANGE, 800);
    return o;
  });
  // 19: 270 is the majority
  shot(19, C(320, 400, 1), function (u, d, t) {
    var p = ease(clamp(u / 1.1)), o = "", x0 = 60, w = 520;
    o += electorBar(x0, 400, w, 90, 1, false);
    o += R(x0, 400, w * 270 / 538 * p, 90, OLIVE, 2, 0);
    o += '<line x1="' + f(x0 + w * 270 / 538) + '" y1="330" x2="' + f(x0 + w * 270 / 538) + '" y2="520" stroke="' + INK + '" stroke-width="3"/>';
    o += numBox("270", x0 + w * 270 / 538, 280, pop(p), 46);
    o += pawn(x0 + w * 270 / 538, 620, 1.2 * pop(clamp(u / 0.4)), OLIVE);
    return o + T("أغلبية", x0 + w * 270 / 538, 720, 26, OLIVE, 900);
  });
  // 20: winner takes all, state by state
  shot(20, C(320, 400, 1), function (u, d, t) {
    var p = clamp(u / 1.2), o = "";
    var tiles = [[70, 200, 150, 110, BLUE], [230, 200, 150, 110, ORANGE], [390, 200, 150, 110, BLUE], [150, 340, 150, 140, ORANGE], [310, 340, 230, 140, BLUE]];
    tiles.forEach(function (tl, i) { o += tile(tl[0], tl[1], tl[2], tl[3], tl[4], "", clamp(p * 2 - i * 0.3)); });
    o += T("كله لواحد", 320, 580, 34, INK, 900) + T("كل ولاية لوحدها", 320, 630, 24, OLIVE, 800);
    return o;
  });
  // 21: Michigan's 15 votes all go to one candidate
  shot(21, P(320, 400, 1, 320, 420, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 1.2)), o = "";
    o += stateAt('MI', 225, 380, 2.3, OLIVE);
    o += numBox("15", 140, 200, pop(clamp(u / 0.5)), 46);
    for (var i = 0; i < 15; i++) {
      var q = clamp(p * 1.6 - i * 0.05), x = lerp(230 + (i % 5) * 16, 440, q), y = lerp(300 + Math.floor(i / 5) * 16, 360, q);
      o += circ(x, y, 6, BONE, 1.4);
    }
    o += pawn(520, 380, 1.4, BLUE) + pawn(520, 560, 1.0, ORANGE);
    return o + label(520, 330, 560, 250, "ياخد الكل", BLUE, p, 26);
  });
  // 22: the popular vote and the electoral vote can disagree
  shot(22, P(320, 400, 1, 320, 420, 1.04), function (u, d, t) {
    var p = ease(clamp(u / 1.2)), base = 640, sc = 0.95, o = "";
    var bars = [[130, BLUE, 330], [220, ORANGE, 310], [420, ORANGE, 300], [510, BLUE, 225]];
    bars.forEach(function (b, i) { o += R(b[0] - 36, base - b[2] * sc * ease(clamp(p * 1.4 - i * 0.12)), 72, b[2] * sc * ease(clamp(p * 1.4 - i * 0.12)), b[1], 2, 0); });
    o += T("أصوات الناس", 175, base + 40, 24, INK, 800) + T("المجمع", 465, base + 40, 24, INK, 800);
    o += cross(510, base - 225 * sc - 40, 0.7, clamp(p * 2 - 0.7));
    o += R(60, base, 520, 3, INK, 1, 0);
    return o;
  });
  // 23: the T-shirt: the tax is a state decision
  shot(23, P(320, 400, 1, 320, 420, 1.06), function (u, d, t) {
    var p = ease(clamp(u / 1.0)), o = "";
    o += '<g transform="translate(320 220) scale(' + f(1.2 * pop(p)) + ')">' + shirt(0, 0, 1, BONE) + '</g>';
    o += R(60, 430, 220, 170, CARD, 2, 6) + R(360, 430, 220, 170, CARD, 2, 6);
    o += T("كاليفورنيا", 170, 480, 24, INK, 800) + T("أوريجون", 470, 480, 24, INK, 800);
    o += arrow(230, 330, 170, 420, ORANGE, 3, clamp(p * 2 - 0.5)) + arrow(410, 330, 470, 420, OLIVE, 3, clamp(p * 2 - 0.5));
    o += T("+ ضريبة", 170, 550, 30, ORANGE, 900) + T("0", 470, 550, 46, OLIVE, 900);
    return o + T("كل ولاية بتقرر لوحدها", 320, 680, 22, INK, 700);
  });

  /* ---------- summary card (line 24, shown over the closing question) ---------- */
  window.__outro = function (svg, u, t) {
    var p = ease(clamp(u / 0.8)), o = "";
    o += usMap(20, 10, 0.42, { CA: ORANGE, MI: OLIVE });
    o += callout("1", 150, 18, pop(clamp(p * 3)));
    o += capitol(50, 146, 0.2) + callout("3", 50, 104, pop(clamp(p * 3 - 0.3)));
    o += whitehouse(150, 146, 0.25) + callout("2", 150, 100, pop(clamp(p * 3 - 0.6)));
    o += court(250, 146, 0.2) + callout("4", 250, 104, pop(clamp(p * 3 - 0.9)));
    var belt2 = '';
    for (var j = 0; j < 16; j++) { var x2 = ((j * 24 - t * 120) % 420 + 420) % 420 - 30; belt2 += '<circle cx="' + f(x2) + '" cy="150" r="5" fill="' + (j % 2 ? ORANGE : INK) + '"/>'; }
    svg.innerHTML = '<rect x="-20" y="-20" width="340" height="200" fill="' + PAPER + '"/><rect x="-20" y="-20" width="340" height="200" fill="url(#grid)" transform="translate(' + f(-((t * 20) % 48)) + ' 0)"/>' + o + belt2;
  };
})();
