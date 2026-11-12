
  var GY = 400, INKL = "#1d1b19";
  function O(x, h, z) { return [x + z * .34, GY - h - z * .26]; }
  function pt(p) { return f(p[0]) + " " + f(p[1]); }
  function ln(w) { return ' stroke="' + INKL + '" stroke-width="' + (w || 1.6) + '" stroke-linejoin="round"'; }
  function face(pts, fill, w, op) { return '<path d="M' + pts.map(function (q) { return pt(O(q[0], q[1], q[2])); }).join(" L") + ' Z" fill="' + fill + '"' + (w === 0 ? '' : ln(w)) + (op != null ? ' opacity="' + f(op) + '"' : '') + '/>'; }
  function prism(x0, x1, h0, h1, z0, z1, cF, cT, cS, w) { return face([[x1, h0, z0], [x1, h0, z1], [x1, h1, z1], [x1, h1, z0]], cS, w) + face([[x0, h1, z0], [x1, h1, z0], [x1, h1, z1], [x0, h1, z1]], cT, w) + face([[x0, h0, z0], [x1, h0, z0], [x1, h1, z0], [x0, h1, z0]], cF, w); }
  function ellH(cx, h, z, r, fill, w, op) { var c = O(cx, h, z); return '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(r) + '" ry="' + f(r * .3) + '" fill="' + fill + '"' + ln(w) + (op != null ? ' opacity="' + f(op) + '"' : '') + '/>'; }
  function cylV(cx, z, r, h0, h1, fill, top, w) { var a = O(cx - r, h1, z), b = O(cx + r, h0, z); return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' V' + f(b[1]) + ' A' + f(r) + ' ' + f(r * .3) + ' 0 0 0 ' + f(b[0]) + ' ' + f(b[1]) + ' V' + f(a[1]) + ' Z" fill="' + fill + '"' + ln(w) + '/>' + ellH(cx, h1, z, r, top || fill, w); }
  function mixc(a, b, k) { function p(c) { if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; } var A = p(a), B = p(b); return "rgb(" + A.map(function (v, i) { return Math.round(lerp(v, B[i], clamp(k))); }).join(",") + ")"; }

  // ── events ───────────────────────────────────────
  var EV = window.EV = {
    yay0: W(0, "مبروك"), heat: W(1, "لخمسة"), oven: W(1, "فرن"), brick: W(2, "طوب"), mud: W(2, "طين"), straw: W(2, "والتبن"), mold: W(3, "قوالب"), dry: W(3, "تنشف"), adobe: W(3, "الطوب"),
    thin: W(4, "الرفيعة"), hot: W(4, "وتسخّن"), thick: W(5, "سميكة"), night: W(5, "بالليل"), wood: W(6, "الخشب"), dome: W(7, "قبة"), lean: W(8, "بتسند"), course: W(8, "وكل"),
    strong: W(9, "متينة"), push: W(9, "بتزق"), load: W(9, "وينزل"), stale: W(10, "واقف"), tower: W(11, "برج"), catchW: W(11, "يصطاد"), malqaf: W(11, "الملقف"),
    windows: W(12, "شبابيك"), mash: W(12, "مشربية"), court: W(13, "حوش"), flood: W(14, "سيول"), base: W(14, "فبترفع"),
    card: L(15) - .1, pot: W(15, "زير"), evap: W(16, "بتبخر"), cardEnd: E(16) + .25, paint: W(17, "تدهن"), well: W(17, "بير"), palms: W(17, "نخلتين"), yay: W(18, "ومبروك"), vote: L(19) + .3
  };

  // ── the desert: deep blue sky, a hard sun, golden dunes, heat shimmer ─────
  function desert(t, sunK) {
    var s = '<rect x="-1400" y="-800" width="4200" height="1400" fill="url(#gSkyDesert)"/>';
    s += '<circle cx="520" cy="-60" r="' + f(70 + 30 * sunK) + '" fill="#fff1b0" opacity="' + f(.45 + .3 * sunK) + '" filter="url(#soft)"/><circle cx="520" cy="-60" r="26" fill="#fff6c8"/>';
    for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283 + t * .3; s += '<path d="M' + f(520 + Math.cos(a) * 34) + ' ' + f(-60 + Math.sin(a) * 34) + ' L' + f(520 + Math.cos(a) * (46 + 8 * sunK)) + ' ' + f(-60 + Math.sin(a) * (46 + 8 * sunK)) + '" stroke="#ffd95a" stroke-width="3" stroke-linecap="round" opacity="' + f(.4 + .6 * sunK) + '"/>'; }
    var far = 420; s += face([[-1400, 0, 0], [2400, 0, 0], [2400, 0, far], [-1400, 0, far]], "#f0cf8c", 0);
    for (var d = 0; d < 9; d++) { var dx = -1200 + d * 380, dp = O(dx, 0, 300 + (d % 3) * 40); s += '<path d="M' + f(dp[0] - 160) + ' ' + f(dp[1]) + ' Q' + f(dp[0] - 30) + ' ' + f(dp[1] - 70 - (d % 2) * 30) + ' ' + f(dp[0] + 170) + ' ' + f(dp[1]) + ' Z" fill="' + (d % 2 ? "#e6bd73" : "#ecc57f") + '"/><path d="M' + f(dp[0] - 30) + ' ' + f(dp[1] - 70 - (d % 2) * 30) + ' Q' + f(dp[0] + 40) + ' ' + f(dp[1] - 30) + ' ' + f(dp[0] + 170) + ' ' + f(dp[1]) + '" stroke="#d1a35a" stroke-width="2" fill="none"/>'; }
    for (var r = 0; r < 30; r++) { var rp = O(-600 + hash(r) * 1700, 0, 20 + hash(r + 3) * 360); s += '<path d="M' + pt(rp) + ' q8 -3 16 0" stroke="#d9b06a" stroke-width="1.6" fill="none"/>'; }
    if (sunK > .2) for (var hw = 0; hw < 6; hw++) { var hy = 300 - hw * 14 + Math.sin(t * 3 + hw) * 3; s += '<path d="M' + (-100 + hw * 90) + ' ' + f(hy) + ' q12 -8 24 0 t24 0 t24 0" stroke="#fff" stroke-width="2" fill="none" opacity="' + f(.35 * sunK) + '"/>'; }
    s += '<rect x="-1400" y="' + GY + '" width="4200" height="600" fill="url(#gSandCut)"/>';
    for (var sl = 0; sl < 4; sl++) { var yy = GY + 40 + sl * 52; s += '<path d="M-1400 ' + yy + ' ' + Array.from({ length: 30 }, function (_, i) { return 'Q' + (-1400 + i * 140 + 70) + ' ' + f(yy + (i % 2 ? 7 : -7)) + ' ' + (-1260 + i * 140) + ' ' + yy; }).join(' ') + '" stroke="#a88a58" stroke-width="2" fill="none" opacity=".55"/>'; }
    for (var st2 = 0; st2 < 26; st2++) { var sx = -900 + hash(st2 + 40) * 2200, sy = GY + 60 + hash(st2 + 41) * 200; s += '<path d="M' + f(sx) + ' ' + f(sy) + ' q6 -7 14 -2 q6 5 -2 9 q-10 3 -12 -7z" fill="#a39886" stroke="#6f6658" stroke-width="1"/>'; }
    for (var q = 0; q < 70; q++) s += '<ellipse cx="' + f(-1300 + hash(q) * 3000) + '" cy="' + f(GY + 24 + hash(q + 4) * 260) + '" rx="' + f(3 + hash(q + 1) * 5) + '" ry="2.4" fill="#b79a6a" opacity=".6"/>';
    return s;
  }

  // ── the house: footprint x 120…300, depth z 80…200; walls 110 high; the front wall cut low so we see inside ─────
  var HX0 = 120, HX1 = 300, HZ0 = 80, HZ1 = 200, HH = 110;
  function house(t, st) {
    var s = "", lift = st.lift, wall = st.wallCol, th = st.thick, cut = 44;
    function bricks(x0, x1, h0, h1, z0, z1) {   // mortar courses on the front (z0) and right (x1) faces
      var g = "", ch = 9, op = .38 * (1 - after(t, EV.paint, 1.2));
      if (op <= 0 || h1 - h0 < 2) return "";
      for (var r = 1; h0 + r * ch < h1; r++) { var hy = h0 + r * ch + lift; g += '<path d="M' + pt(O(x0, hy, z0)) + ' L' + pt(O(x1, hy, z0)) + ' L' + pt(O(x1, hy, z1)) + '" stroke="#6e4a2c" stroke-width=".8" fill="none"/>'; }
      for (var r2 = 0; h0 + r2 * ch < h1; r2++) { var ya = h0 + r2 * ch + lift, yb = Math.min(h1, h0 + (r2 + 1) * ch) + lift, off = (r2 % 2) * 10;
        for (var bx = x0 + 20 - off; bx < x1 - 2; bx += 20) if (bx > x0 + 2) g += '<path d="M' + pt(O(bx, ya, z0)) + ' L' + pt(O(bx, yb, z0)) + '" stroke="#6e4a2c" stroke-width=".8"/>';
        for (var bz = z0 + 20 - off; bz < z1 - 2; bz += 20) if (bz > z0 + 2) g += '<path d="M' + pt(O(x1, ya, bz)) + ' L' + pt(O(x1, yb, bz)) + '" stroke="#4e3420" stroke-width=".8"/>'; }
      return '<g opacity="' + f(op) + '">' + g + '</g>';
    }
    function W2(x0, x1, h0, h1, z0, z1) { var base = wall.charAt(0) === "#" ? wall : "#b9895a"; return prism(x0, x1, h0 + lift, h1 + lift, z0, z1, wall, mixc(base, "#ffffff", .15), mixc(base, "#000000", .18)) + bricks(x0, x1, h0, h1, z0, z1); }
    if (st.base > 0) s += prism(HX0 - 14, HX1 + 14, 0, 22 * st.base, HZ0 - 10, HZ1 + 10, "url(#gStone)", "#c9c2b4", "#9a9284");
    // floor and the inner room (cool or hot)
    s += face([[HX0, lift, HZ0], [HX1, lift, HZ0], [HX1, lift, HZ1], [HX0, lift, HZ1]], "#d9b98a", 1.2);
    var inner = O(HX0 + th, HH - 6 + lift, HZ1 - th), inner2 = O(HX1 - th, lift, HZ1 - th);
    s += '<rect x="' + f(inner[0]) + '" y="' + f(inner[1]) + '" width="' + f(inner2[0] - inner[0]) + '" height="' + f(inner2[1] - inner[1]) + '" fill="' + mixc("#9fd0f0", "#ff7a3c", st.inHeat) + '" opacity="' + f(.35 + .25 * st.inHeat) + '"/>';
    // back wall, side walls (full height), front wall cut at "cut" (shows the wall's thickness)
    var hb = HH * st.wallUp;
    s += W2(HX0, HX1, 0, hb, HZ1 - th, HZ1) + W2(HX0, HX0 + th, 0, hb, HZ0, HZ1) + W2(HX1 - th, HX1, 0, hb, HZ0, HZ1);
    s += W2(HX0, HX1, 0, Math.min(cut, hb), HZ0, HZ0 + th);
    // small windows with mashrabiya in the back wall
    if (st.win > 0) [160, 240].forEach(function (x) { var a = O(x - 12, 78 + lift, HZ1 - th - .5), b = O(x + 12, 52 + lift, HZ1 - th - .5); s += '<rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" fill="#3a2a1a" opacity="' + f(st.win) + '"/>';
      if (st.mash > 0) for (var g = 0; g < 4; g++) for (var gg = 0; gg < 4; gg++) s += '<rect x="' + f(a[0] + 2 + g * 5.4) + '" y="' + f(a[1] + 2 + gg * 6.2) + '" width="3.6" height="4.4" rx="1.2" fill="#a8774c" opacity="' + f(st.mash) + '"/>'; });
    // the roof: the dome (Nubian courses), or nothing yet
    if (st.dome > 0) {
      var c = O((HX0 + HX1) / 2, HH + lift, (HZ0 + HZ1) / 2), R = 92, ry = 70, k = st.dome;
      s += '<clipPath id="cpDome"><rect x="' + f(c[0] - R - 2) + '" y="' + f(c[1] - ry - 4) + '" width="' + f((2 * R + 4) * k) + '" height="' + f(ry + 6) + '"/></clipPath>';
      s += '<g clip-path="url(#cpDome)"><path d="M' + f(c[0] - R) + ' ' + f(c[1]) + ' A' + R + ' ' + ry + ' 0 0 1 ' + f(c[0] + R) + ' ' + f(c[1]) + ' Z" fill="' + wall + '"' + ln(1.8) + '/>';
      for (var cr = 1; cr < 9; cr++) { var cx = c[0] - R + cr * (2 * R / 9); s += '<path d="M' + f(cx - 12) + ' ' + f(c[1]) + ' Q' + f(cx - 4) + ' ' + f(c[1] - ry * Math.sqrt(1 - Math.pow((cx - c[0]) / R, 2)) * .9) + ' ' + f(cx + 8) + ' ' + f(c[1] - ry * Math.sqrt(1 - Math.pow((cx + 8 - c[0]) / R, 2))) + '" stroke="#7a5a36" stroke-width="1.2" fill="none" opacity=".7"/>'; }
      s += '</g>';
      if (st.dome < 1) { var lc = c[0] - R + 2 * R * k, ly = c[1] - ry * Math.sqrt(Math.max(0, 1 - Math.pow((lc - c[0]) / R, 2))); s += '<rect x="' + f(lc - 6) + '" y="' + f(ly - 4) + '" width="12" height="7" rx="1.4" fill="#c99a62"' + ln(1) + ' transform="rotate(-25 ' + f(lc) + ' ' + f(ly) + ')"/>'; }
      if (st.push > 0) for (var pa = 0; pa < 7; pa++) { var ang = Math.PI + pa / 6 * Math.PI, px = c[0] + Math.cos(ang) * (R - 10), py = c[1] + Math.sin(ang) * (ry - 8), dir = ang + (pa < 3 ? -1 : pa > 3 ? 1 : 0) * .9 + Math.PI / 2 * 0; var u = (t * 1.2 + pa / 7) % 1; s += '<path d="M' + f(px) + ' ' + f(py) + ' l' + f(Math.cos(ang + Math.PI / 2 * (pa < 3 ? -1 : 1)) * 12) + ' ' + f(Math.sin(ang + Math.PI / 2 * (pa < 3 ? -1 : 1)) * 12) + '" stroke="' + YEL + '" stroke-width="3" stroke-linecap="round" opacity="' + f(st.push * (.5 + .5 * Math.sin(t * 6 + pa))) + '"/>'; }
      if (st.load > 0) [HX0 + th / 2, HX1 - th / 2].forEach(function (x) { var a = O(x, HH + lift, (HZ0 + HZ1) / 2), b = O(x, 10 + lift, (HZ0 + HZ1) / 2), u = (t * .8) % 1; s += '<path d="M' + f(a[0]) + ' ' + f(lerp(a[1], b[1], u)) + ' v14 m-6 -6 l6 6 l6 -6" stroke="' + YEL + '" stroke-width="3" fill="none" opacity="' + f(st.load * (1 - u)) + '"/>'; });
    }
    // the malqaf: a tower on the roof opening into the wind (from the left)
    if (st.tower > 0) { var e = ease(st.tower); s += prism(268, 292, HH + lift, HH + lift + 70 * e, 150, 172, wall, mixc("#b9895a", "#fff", .15), mixc("#b9895a", "#000", .18)); var op = O(268, HH + lift + 52 * e, 150); s += '<rect x="' + f(op[0] - .5) + '" y="' + f(op[1] - 10) + '" width="10" height="' + f(16 * e) + '" fill="#3a2a1a" opacity="' + f(e) + '"/>'; }
    if (st.wind > 0) { var path = [[-40, HH + 60], [268, HH + 60], [280, HH + 40], [280, 30], [180, 30], [140, 50]]; for (var wd = 0; wd < 10; wd++) { var u2 = (t * .55 + wd / 10) % 1, seg = u2 * (path.length - 1), si = Math.floor(seg), sf = seg - si, pa2 = path[si], pb2 = path[Math.min(si + 1, path.length - 1)], wp = O(lerp(pa2[0], pb2[0], sf), lerp(pa2[1], pb2[1], sf) + lift, 160); s += '<circle cx="' + f(wp[0]) + '" cy="' + f(wp[1]) + '" r="3" fill="#7fd0ff" opacity="' + f(st.wind * Math.sin(u2 * 3.14)) + '"/>'; } }
    if (st.stale > 0) for (var hz = 0; hz < 6; hz++) { var hp = O(150 + hz * 22, 50 + Math.sin(t + hz) * 6 + lift, 150); s += '<ellipse cx="' + f(hp[0]) + '" cy="' + f(hp[1]) + '" rx="16" ry="8" fill="#c9b48a" opacity="' + f(.35 * st.stale) + '" filter="url(#soft)"/>'; }
    return s;
  }
  function tent(t, k) { if (k <= 0) return ""; var a = O(150, 0, 110), b = O(210, 70, 140), c2 = O(270, 0, 110), d = O(270, 0, 170), e = O(150, 0, 170); var g = '<g opacity="' + f(k) + '"><path d="M' + pt(a) + ' L' + pt(b) + ' L' + pt(c2) + ' Z" fill="#b8462e"' + ln(1.8) + '/><path d="M' + pt(c2) + ' L' + pt(b) + ' L' + pt(d) + ' Z" fill="#8a321f"' + ln(1.8) + '/><path d="M' + f(b[0] - 14) + ' ' + f(a[1]) + ' L' + pt(b) + ' L' + f(b[0] + 14) + ' ' + f(a[1]) + ' Z" fill="#2a1a10"/>'; for (var st = 0; st < 5; st++) { var sp = O(158 + st * 26, 4, 110); g += '<path d="M' + f(sp[0]) + ' ' + f(sp[1]) + ' v-4" stroke="#f2c98a" stroke-width="2"/>'; } return g + '</g>'; }
  function brickYard(t, ev) {               // mixing pit, the wooden mould, rows of bricks drying in the sun
    var s = "", k = after(t, ev.brick - .4, .6) * (1 - after(t, ev.thin + 1, .8)); if (k <= 0) return "";
    s += '<g opacity="' + f(k) + '">';
    var pit = O(360, 0, 110); s += '<ellipse cx="' + f(pit[0]) + '" cy="' + f(pit[1]) + '" rx="46" ry="14" fill="#7a5233"' + ln(1.6) + '/>';
    if (t >= ev.straw) for (var i = 0; i < 18; i++) { var a = hash(i) * 6.28, rr = hash(i + 3) * 36; s += '<path d="M' + f(pit[0] + Math.cos(a) * rr) + ' ' + f(pit[1] + Math.sin(a) * rr * .3) + ' l' + f(6 * Math.cos(a + 1)) + ' ' + f(2 * Math.sin(a + 1)) + '" stroke="#f2d27a" stroke-width="1.6"/>'; }
    var bucket = O(420, 0, 100); s += cylV(bucket[0] - 100 * .34 + 66, 100, 10, 0, 22, "#9aa4ad", "#7fc3e6", 1.4);
    if (t >= ev.mold) { var m = O(330, 2, 70); s += '<rect x="' + f(m[0] - 10) + '" y="' + f(m[1] - 16) + '" width="84" height="22" fill="#7a5233" stroke="#8a5a34" stroke-width="5"' + '/><path d="M' + f(m[0] + 18) + ' ' + f(m[1] - 16) + ' v22 M' + f(m[0] + 46) + ' ' + f(m[1] - 16) + ' v22" stroke="#8a5a34" stroke-width="4"/><path d="M' + f(m[0] - 12) + ' ' + f(m[1] - 18) + ' h88" stroke="' + INKL + '" stroke-width="1" opacity=".5"/>'; }
    if (t >= ev.dry) { var n = Math.min(24, Math.floor((t - ev.dry) * 10)); for (var b = 0; b < n; b++) { var bx = 300 + (b % 6) * 30, bz = 6 + Math.floor(b / 6) * 18; s += prism(bx, bx + 24, 0, 10, bz, bz + 12, mixc("#8a5a34", "#c99a62", after(t, ev.dry + 1, 2)), "#d9b07a", "#a8774c", 1); } }
    return s + '</g>';
  }
  function well(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">' + cylV(410, 150, 16, 0, 22, "url(#gStone)", "#3a5f8a", 1.6);
    var p0 = O(440, 30, 120), p1 = O(480, 50, 150); s += '<path d="M' + pt(O(440, 0, 135)) + ' L' + pt(O(450, 30, 135)) + '" stroke="#6f7680" stroke-width="3"/><path d="M' + pt(p0) + ' L' + pt(O(480, 30, 120)) + ' L' + pt(p1) + ' L' + pt(O(440, 50, 150)) + ' Z" fill="#1f3f7a"' + ln(1.4) + '/>';
    for (var g = 1; g < 4; g++) s += '<path d="M' + pt(O(440 + g * 10, 30, 120)) + ' L' + pt(O(440 + g * 10, 50, 150)) + '" stroke="#5a87c8" stroke-width="1"/>';
    var w = O(410, 22, 150), u = (t * 1.5) % 1; s += '<circle cx="' + f(w[0]) + '" cy="' + f(w[1] - u * 10) + '" r="3" fill="#7fd0ff" opacity="' + f(1 - u) + '"/>'; return s + '</g>'; }
  function palm(x, z, sc, t, k) { if (k <= 0) return ""; var b = O(x, 0, z), sw = Math.sin(t * 1.1) * 3, s = '<g transform="translate(' + f(b[0]) + ' ' + f(b[1]) + ') scale(' + f(sc * pop(k)) + ')"><path d="M0 0 Q-6 -60 ' + f(4 + sw * .4) + ' -120" stroke="#8a6a3a" stroke-width="8" fill="none" stroke-linecap="round"/>';
    for (var q = 0; q < 8; q++) { var a = -2.9 + q * .42 + Math.sin(t * 1.4 + q) * .05, L2 = 44 + (q % 2) * 8; s += '<path d="M' + f(4 + sw * .4) + ' -120 Q' + f(4 + Math.cos(a) * L2 * .55) + ' ' + f(-136 + Math.sin(a) * L2 * .3) + ' ' + f(4 + sw * .4 + Math.cos(a) * L2) + ' ' + f(-120 + Math.sin(a) * L2 * .55 + 16) + '" stroke="#3f8f3a" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
    return s + '</g>'; }
  function courtyard(t, k) {               // a second wing on the left and a shaded courtyard between
    if (k <= 0) return ""; var e = ease(k), s = '<g opacity="' + f(clamp(k * 1.5)) + '">';
    s += face([[20, 0, 80], [120, 0, 80], [120, 0, 200], [20, 0, 200]], "#e8cfa0", 1.2);
    for (var tl = 0; tl < 5; tl++) s += '<path d="M' + pt(O(20 + tl * 20, 0, 80)) + ' L' + pt(O(20 + tl * 20, 0, 200)) + '" stroke="#c9a46a" stroke-width="1"/>';
    s += face([[20, 0, 80], [120, 0, 80], [120, 0, 200], [20, 0, 200]], "#000", 0, .12 * e);
    s += prism(-60, 20, 0, 80 * e, 80, 200, "#c99a62", "#d9b07a", "#a8774c") + prism(20, 120, 0, 40 * e, 194, 200, "#c99a62", "#d9b07a", "#a8774c");
    return s + '</g>';
  }
  function flood(t, k) { if (k <= 0) return ""; var s = "", w = O(-300, 0, 60), w2 = O(700, 0, 60); s += '<path d="M' + f(w[0]) + ' ' + f(w[1] - 26 * k) + ' Q' + f(200) + ' ' + f(w[1] - 36 * k + Math.sin(t * 4) * 3) + ' ' + f(w2[0]) + ' ' + f(w2[1] - 26 * k) + ' L' + f(w2[0]) + ' ' + f(w2[1] + 6) + ' L' + f(w[0]) + ' ' + f(w[1] + 6) + ' Z" fill="#7d5a3a" stroke="#efe2c4" stroke-width="2.4" opacity="' + f(.85 * k) + '"/>';
    for (var r = 0; r < 8; r++) { var u = (t * 1.2 + r / 8) % 1, rp = O(-280 + u * 960, 6, 60); s += '<path d="M' + pt(rp) + ' q8 -5 16 0" stroke="#e9d9b8" stroke-width="2" fill="none" opacity="' + f(k * (1 - u)) + '"/>'; } return s; }


  // ── the builder: a man in a galabiya and a white turban, ~1.75 m (70 units; the wall is 110 ≈ 2.8 m) ─────
  function person(t, ev) {
    var WP = [[0, 300, 95], [ev.brick - .3, 318, 112], [ev.thin - .4, 328, 52]], i = 0;
    while (i < WP.length - 1 && t >= WP[i + 1][0]) i++;
    var a = WP[Math.max(0, i - 1)], b = WP[i], mk = i ? clamp((t - b[0]) / 1.2) : 1, mv = mk > 0 && mk < 1;
    var x = lerp(a[1], b[1], ease(mk)), z = lerp(a[2], b[2], ease(mk)), p = O(x, 0, z), sw = mv ? Math.sin(t * 12) * 5 : 0;
    var carry = t >= ev.thin && t < ev.strong, wave = t >= ev.yay0 - .1 && t < ev.yay0 + 1.6 || t >= ev.yay - .1 && t < ev.vote, mix = t >= ev.mud && t < ev.mold;
    var bob = mv ? Math.abs(Math.sin(t * 12)) * 1.5 : 0, s = '<g transform="translate(' + f(p[0]) + ' ' + f(p[1] - bob) + ')">';
    s += '<ellipse cx="4" cy="1" rx="13" ry="3" fill="#000" opacity=".18"/>';
    s += '<path d="M-3 -16 L' + f(-4 - sw) + ' 0 M3 -16 L' + f(4 + sw) + ' 0" stroke="#7a4e30" stroke-width="3.4" stroke-linecap="round"/><path d="M' + f(-8 - sw) + ' 0 h6 M' + f(2 + sw) + ' 0 h6" stroke="#3a2a1a" stroke-width="2.6" stroke-linecap="round"/>';
    // galabiya
    s += '<path d="M-7 -54 Q-10 -30 -12 -12 L12 -12 Q10 -30 7 -54 Q0 -57 -7 -54 Z" fill="#e9eef2"' + ln(1.4) + '/><path d="M0 -54 v12" stroke="#b7c3cc" stroke-width="1.2"/>';
    // arms
    var la = wave ? 'M-6 -50 L-14 -62 L' + f(-12 + Math.sin(t * 14) * 4) + ' -74' : mix ? 'M-6 -50 L-12 -38 L-8 ' + f(-28 + Math.sin(t * 9) * 3) : carry ? 'M-6 -50 L-10 -40 L-2 -36' : 'M-6 -50 L-9 -38 L' + f(-9 + sw * .6) + ' -28';
    var ra = carry ? 'M6 -50 L10 -40 L6 -36' : mix ? 'M6 -50 L10 -38 L6 ' + f(-28 - Math.sin(t * 9) * 3) : 'M6 -50 L9 -38 L' + f(9 - sw * .6) + ' -28';
    s += '<path d="' + la + '" stroke="#e9eef2" stroke-width="5" stroke-linecap="round" fill="none"/><path d="' + la + '" stroke="' + INKL + '" stroke-width="1" fill="none" opacity=".5"/><path d="' + ra + '" stroke="#e9eef2" stroke-width="5" stroke-linecap="round" fill="none"/><path d="' + ra + '" stroke="' + INKL + '" stroke-width="1" fill="none" opacity=".5"/>';
    if (mix) s += '<path d="M-8 ' + f(-28 + Math.sin(t * 9) * 3) + ' L-4 -6" stroke="#8a5a34" stroke-width="2.4" stroke-linecap="round"/>';
    if (carry) s += '<rect x="-8" y="-42" width="16" height="7" rx="1.2" fill="#c99a62"' + ln(1) + '/>';
    // head: face, moustache, white turban
    s += '<rect x="-2.4" y="-58" width="4.8" height="5" fill="#b07a50"/><circle cx="0" cy="-63" r="6.4" fill="#b07a50"' + ln(1.3) + '/><path d="M-2.6 -60 q2.6 -1.4 5.2 0" stroke="#2a1a10" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="-2.2" cy="-64" r=".9" fill="#1d1b19"/><circle cx="2.2" cy="-64" r=".9" fill="#1d1b19"/>';
    s += '<path d="M-7 -65 Q-7.5 -73 0 -73.5 Q7.5 -73 7 -65 Q0 -67 -7 -65 Z" fill="#f7f7f2"' + ln(1.2) + '/><path d="M-6 -68.5 Q0 -71 6 -68.5" stroke="#cfd3cc" stroke-width="1" fill="none"/>';
    return s + '</g>';
  }
  // ── camera ─────────────────────────────────────────
  var SHOTS = [[0, [262, 300, 1.45]], [2, [420, 330, 1.35]], [4, [262, 290, 1.2]], [6, [262, 270, 1.15]], [7, [262, 250, 1.2]], [10, [262, 250, 1.15]],
    [13, [185, 265, 1.0]], [14, [230, 290, .9]], [17, [300, 250, .9]], [18, [300, 240, .78]]];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : [262, 300, 1.7], b = SHOTS[i][1], k = ease((t - (L(SHOTS[i][0]) - .45)) / 1.3);
    if (i === 0) k = ease(t / 2.4);
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 2.5; c[1] += Math.cos(t * .29) * 2; c[2] *= 1 + .01 * Math.sin(t * .23);
    return c;
  }

  // ── the clay-pot fridge card (the odd fact) ─────────────
  function zeerCard(t) {
    var k = after(t, EV.card, .45) * (1 - after(t, EV.cardEnd - .35, .35)); if (k <= 0) return "";
    var pk = after(t, EV.pot, .8), ev2 = after(t, EV.evap, .8), s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.55 * k) + '"/><g transform="translate(180 370) scale(' + f(pop(after(t, EV.card, .9))) + ')">';
    s += '<rect x="-150" y="-160" width="300" height="300" rx="22" fill="' + CREAM + '"' + ln(3) + '/><text x="0" y="-126" text-anchor="middle" class="hd" fill="' + INKL + '">تلاجة من غير كهربا!</text>';
    s += '<path d="M-90 -80 Q-110 20 -60 90 H60 Q110 20 90 -80 Z" fill="#c4683a"' + ln(2.4) + '/><path d="M-80 -72 Q-96 18 -52 80 H52 Q96 18 80 -72 Z" fill="#d9b07a" opacity="' + f(pk) + '"/>';
    for (var g = 0; g < 30; g++) s += '<circle cx="' + f(-78 + hash(g) * 156) + '" cy="' + f(-66 + hash(g + 3) * 140) + '" r="1.6" fill="#7a5a36" opacity="' + f(pk) + '"/>';
    s += '<path d="M-56 -76 Q-66 10 -36 70 H36 Q66 10 56 -76 Z" fill="#c4683a"' + ln(2.2) + ' opacity="' + f(pk) + '"/><path d="M-50 -70 Q-58 10 -30 64 H30 Q58 10 50 -70 Z" fill="#eaf4fb" opacity="' + f(pk) + '"/>';
    s += '<circle cx="-14" cy="30" r="12" fill="#e8452e"' + ln(1.4) + ' opacity="' + f(pk) + '"/><path d="M8 40 q10 -30 22 -10 q-10 24 -22 10 z" fill="#5ab84a"' + ln(1.2) + ' opacity="' + f(pk) + '"/>';
    for (var w = 0; w < 6; w++) { var u = (t * .9 + w / 6) % 1, side = w % 2 ? 1 : -1; s += '<path d="M' + f(side * (96 + u * 30)) + ' ' + f(20 - u * 60) + ' q' + f(side * 6) + ' -6 0 -12" stroke="#7fd0ff" stroke-width="2.4" fill="none" opacity="' + f(ev2 * (1 - u)) + '"/>'; }
    s += '<g transform="translate(0 112)" opacity="' + f(ev2) + '"><rect x="-90" y="-14" width="180" height="26" rx="13" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="sm" fill="#7fd0ff">رمل مبلول = تبريد بالتبخير</text></g>';
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var c = window.__cam || cam(t), ev = EV;
    var sunK = t < ev.thick + 1 ? after(t, ev.heat - .4, 1) : .4;
    var wallUp = t < ev.thin ? 0 : after(t, ev.thin, 1.4), thick = lerp(5, 20, after(t, ev.thick, 1.4));
    var inHeat = t < ev.thin ? 0 : t < ev.thick ? after(t, ev.hot, 1) : lerp(1, .1, after(t, ev.thick + .6, 1.6));
    if (t >= ev.stale && t < ev.catchW + 1) inHeat = Math.max(inHeat, .35 * after(t, ev.stale, .8) * (1 - after(t, ev.catchW, 1)));
    var st = {
      lift: 22 * ease(after(t, ev.base, 1.2)), base: after(t, ev.base, .8), wallCol: mixc("#b9895a", "#f4f1ea", after(t, ev.paint, 1.6)), thick: thick, inHeat: inHeat, wallUp: wallUp,
      win: after(t, ev.windows, .8), mash: after(t, ev.mash, .8), dome: t < ev.dome ? 0 : t < ev.lean ? .15 * after(t, ev.dome, .8) : lerp(.15, 1, after(t, ev.lean, ev.strong - ev.lean)),
      push: after(t, ev.push, .6) * (1 - after(t, ev.stale, .6)), load: after(t, ev.load, .6) * (1 - after(t, ev.stale, .6)),
      tower: after(t, ev.tower, 1), wind: after(t, ev.catchW, .8) * (1 - after(t, ev.court + 1, 1)) + (t > ev.yay ? .6 : 0), stale: after(t, ev.stale, .8) * (1 - after(t, ev.catchW, 1))
    };
    var s = desert(t, sunK);
    s += palm(20, 250, 1, t, after(t, ev.palms, .8)) + palm(410, 250, .9, t + 2, after(t, ev.palms + .2, .8));
    s += courtyard(t, after(t, ev.court, 1.2)) + well(t, after(t, ev.well, .9));
    s += tent(t, 1 - after(t, ev.brick - .2, .6));
    if (t >= ev.thin - .2) s += house(t, st);
    if (t < ev.thin - .4) s += person(t, ev);
    s += brickYard(t, ev);
    if (t >= ev.thin - .4) s += person(t, ev);
    s += flood(t, after(t, ev.flood, 1) * (1 - after(t, ev.card, .6)));
    // heat arrows from the sun into the walls (thin: through; thick: stopped inside the wall)
    if (t >= ev.thin && t < ev.wood) for (var a = 0; a < 5; a++) { var u = (t * .9 + a / 5) % 1, x0 = 330, x1 = t < ev.thick + .8 ? 240 : 292, hp = O(lerp(x0 + 60, x1, u), 60 + a * 9, 120); s += '<path d="M' + f(hp[0]) + ' ' + f(hp[1]) + ' h-14 m5 -5 l-5 5 l5 5" stroke="' + RED + '" stroke-width="3" fill="none" opacity="' + f(Math.sin(u * 3.14)) + '"/>'; }
    if (t >= ev.wood && t < ev.dome + .4) { var lk = after(t, ev.wood, .5) * (1 - after(t, ev.dome, .4)), lp = O(360, 0, 90); s += '<g opacity="' + f(lk) + '"><g transform="translate(' + f(lp[0]) + ' ' + f(lp[1] - 12) + ') rotate(-8)"><rect x="-50" y="-10" width="100" height="20" rx="10" fill="#a8774c"' + ln(1.6) + '/><ellipse cx="50" cy="0" rx="6" ry="10" fill="#d9b07a"' + ln(1.4) + '/></g></g>'; }
    var W2 = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';

    var nightK = after(t, ev.night - .3, .6) * (1 - after(t, ev.wood - .5, .5));
    if (nightK > 0) W2 += '<rect width="360" height="640" fill="#0d1b3a" opacity="' + f(.5 * nightK) + '"/><circle cx="290" cy="70" r="18" fill="#f4efd2" opacity="' + f(nightK) + '"/><circle cx="298" cy="64" r="16" fill="#1f2c4a" opacity="' + f(nightK) + '"/>';
    var T = "", P = function (x, h, z) { return O(x, h, z); };
    T += tag(c, P(210, 80, 140), "بيت بدائي!", ev.yay0 - .2, t, { dur: 2.2 });
    T += tag(c, P(210, 90, 140), "فرن!", ev.oven, t, { red: true, dur: 1.8 });
    T += tag(c, P(360, 20, 110), "طين + رمل + تبن", ev.mud, t, { dur: 2.6 });
    T += tag(c, P(390, 20, 40), "الطوب اللبن", ev.adobe - .2, t);
    T += tag(c, P(210, 120, 140), "حيطة رفيعة", ev.thin + .2, t, { red: true, dur: 1.8 });
    T += tag(c, P(130, 60, 80), "نص متر", ev.thick + .3, t);
    T += tag(c, P(360, 30, 90), "غالي!", ev.wood + .2, t, { red: true, dur: 1.8 });
    T += tag(c, P(210, 190, 140), "قبة من الطوب", ev.dome + .1, t, { dur: 1.8 });
    T += tag(c, P(210, 200, 140), "كل طوبة بتزق اللي جنبها", ev.push, t, { dur: 2.6 });
    T += tag(c, P(210, 60, 140), "هوا مكتوم", ev.stale, t, { red: true, dur: 1.8 });
    T += tag(c, P(280, 200, 160), "الملقف", ev.malqaf - .1, t);
    T += tag(c, P(200, 90, 200), "مشربية", ev.mash, t, { col: CREAM });
    T += tag(c, P(70, 30, 140), "حوش في الضل", ev.court + .2, t, { col: CREAM });
    T += tag(c, P(60, 40, 60), "سيل!", ev.flood + .1, t, { red: true, dur: 1.4 });
    T += tag(c, P(210, 30, 80), "أساس حجر", ev.base + .2, t);
    T += tag(c, P(410, 40, 150), "بير بمضخة شمسية", ev.well, t, { col: CREAM, dur: 1.8 });
    if (t >= ev.heat - .2 && t < ev.brick) T += panelAt(560, after(t, ev.heat - .2, .5) * (1 - after(t, ev.brick - .4, .4)), '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">الحرارة الضهر</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + RED + '">' + Math.round(45 * after(t, ev.heat, 1.2)) + '°</text>', 120, 62);
    if (t >= ev.dry && t < ev.thin) { var dk = after(t, ev.dry, .5) * (1 - after(t, ev.thin - .3, .3)); T += panelAt(560, dk, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">بينشف في الشمس</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + YEL + '">' + Math.round(14 * after(t, ev.dry + .3, 1.6)) + ' يوم</text>', 160, 62); }
    if (t >= ev.night - .2 && t < ev.wood) { var nk = after(t, ev.night - .2, .5) * (1 - after(t, ev.wood - .3, .3)); T += panelAt(560, nk, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">السخونة بتوصل جوه</text><text x="0" y="18" text-anchor="middle" class="big" fill="#7fd0ff">بالليل 🌙</text>', 170, 62); }
    T += zeerCard(t);
    T += confetti(t, ev.yay0, 60) + confetti(t, ev.yay, 90);
    T += voteCard(t, ev);
    return W2 + T;
  };
})();
