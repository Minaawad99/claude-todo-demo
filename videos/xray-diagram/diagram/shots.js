  // ── «إزاي الأشعة بتشوف عضمك؟»: the hand (skin, bones, X-ray print), a torch, the X-ray head, the tube in cut-away
  // (cathode cup + filament, rotating anode disc, rotor, window), the detector plate. Shapes from textbook cut-aways of a
  // rotating-anode tube and hand radiographs (../refs/SOURCES.md).
  var FINGERS = [{ bx: -48, by: -178, a: -9, L: 150 }, { bx: -16, by: -190, a: -2, L: 165 }, { bx: 17, by: -186, a: 5, L: 155 }, { bx: 47, by: -170, a: 13, L: 120 }],
      THUMB = { bx: -62, by: -95, a: -50, L: 118 }, CARP = [[-36, -40], [-14, -46], [10, -46], [32, -40], [-30, -62], [-8, -68], [14, -68], [34, -62]];
  function dirv(a) { var r = a * Math.PI / 180; return [Math.sin(r), -Math.cos(r)]; }
  function stroke(x1, y1, x2, y2, w, col) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; }
  // the hand, wrist at (x,y), fingers up. o.skin: 0..1 skin opacity; o.bones: 0..1; o.xray: print style (grey flesh, white
  // bones on black); o.crack; o.ring; o.glowTips (red torch glow); o.rot (deg)
  function hand(x, y, s, t, o) {
    o = o || {}; s = s || 1; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + s + ')">';
    var wig = function (i) { return Math.sin(t * 1.4 + i * 1.3) * 1.6; }, all = FINGERS.map(function (q, i) { return { bx: q.bx, by: q.by, a: q.a + wig(i), L: q.L }; });
    var th = { bx: THUMB.bx, by: THUMB.by, a: THUMB.a + wig(5), L: THUMB.L };
    var segs = [];   // skin strokes
    segs.push([0, 440, 0, -30, 114]); segs.push([-4, -60, 0, -148, 130]);
    all.forEach(function (q) { var d = dirv(q.a); segs.push([q.bx, q.by, q.bx + d[0] * q.L, q.by + d[1] * q.L, 35]); });
    var dt = dirv(th.a); segs.push([-40, -40, th.bx + dt[0] * th.L, th.by + dt[1] * th.L, 40]);
    var sk = o.skin == null ? 1 : o.skin;
    if (sk > 0) {
      if (o.xray) { g += '<g opacity="' + f(0.42 * sk) + '">'; segs.forEach(function (q) { g += stroke(q[0], q[1], q[2], q[3], q[4], "#6a6a6a"); }); g += '</g>'; }
      else { g += '<g opacity="' + f(sk) + '">'; segs.forEach(function (q) { g += stroke(q[0], q[1], q[2], q[3], q[4] + 5, INK); }); segs.forEach(function (q) { g += stroke(q[0], q[1], q[2], q[3], q[4], SKIN); });
        g += '<path d="M-18 -150 Q-10 -110 -20 -70 M20 -150 Q12 -110 22 -76" stroke="#b97f65" stroke-width="2" fill="none" opacity=".7"/></g>'; }
    }
    if (o.glowTips) all.forEach(function (q, i) { var d = dirv(q.a), px = q.bx + d[0] * q.L * 0.7, py = q.by + d[1] * q.L * 0.7; g += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(26 + 4 * Math.sin(t * 3 + i)) + '" fill="#e0402a" opacity="' + f(0.55 * o.glowTips) + '" filter="url(#soft2)"/>'; });
    var bk = o.bones == null ? 0 : o.bones;
    if (bk > 0) {
      var bc = o.xray ? "#f6f3ea" : BONE, ol = o.xray ? "#9a958a" : INK, b = '<g opacity="' + f(bk) + '">';
      var bone = function (x1, y1, x2, y2, w) { b += stroke(x1, y1, x2, y2, w + 3, ol) + stroke(x1, y1, x2, y2, w, bc); };
      bone(-24, -18, -28, 440, 24); bone(25, -18, 29, 440, 20);
      CARP.forEach(function (c) { b += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="12.5" fill="' + ol + '"/>'; }); CARP.forEach(function (c) { b += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="11" fill="' + bc + '"/>'; });
      all.forEach(function (q, i) { bone(q.bx * 0.55, -78, q.bx, q.by + 4, 13); var d = dirv(q.a), pos = 0;
        [0.44, 0.32, 0.24].forEach(function (r, k) { var l0 = q.L * pos + 5, l1 = q.L * (pos + r) - 5; bone(q.bx + d[0] * l0, q.by + d[1] * l0, q.bx + d[0] * l1, q.by + d[1] * l1, 11 - k * 1.5); pos += r; }); });
      bone(-36, -58, th.bx, th.by, 14); var pos = 0; [0.55, 0.45].forEach(function (r) { var l0 = th.L * pos + 5, l1 = th.L * (pos + r) - 6; bone(th.bx + dt[0] * l0, th.by + dt[1] * l0, th.bx + dt[0] * l1, th.by + dt[1] * l1, 12); pos += r; });
      if (o.crack) b += '<path d="M-40 150 L-30 156 L-24 146 L-16 154 L-8 148" stroke="#111" stroke-width="' + (o.xray ? 4 : 3) + '" fill="none" stroke-linejoin="round"/>';
      g += b + '</g>';
    }
    if (o.ring) { var q = all[2], d = dirv(q.a), rl = q.L * 0.2, rx = q.bx + d[0] * rl, ry = q.by + d[1] * rl; g += '<g transform="translate(' + f(rx) + ' ' + f(ry) + ') rotate(' + f(q.a) + ')"><rect x="-22" y="-7" width="44" height="14" rx="5" fill="' + (o.xray ? "#ffffff" : "#d9a53a") + '" stroke="' + (o.xray ? "#cfcac0" : INK) + '" stroke-width="2"/></g>'; }
    return g + '</g>';
  }
  function fingerTip(x, y, s, i, frac) { var q = i < 4 ? FINGERS[i] : THUMB, d = dirv(q.a); frac = frac == null ? 0.7 : frac; return [x + s * (q.bx + d[0] * q.L * frac), y + s * (q.by + d[1] * q.L * frac)]; }
  function torch(x, y, ang, on, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">';
    if (on) g += '<path d="M60 -26 L520 -150 L520 150 L60 26 Z" fill="url(#cone)" opacity="' + f(0.75 + 0.05 * Math.sin(t * 5)) + '"/>';
    g += R(-110, -19, 130, 38, "#4a5560", 2.4, 6) + '<path d="M20 -19 L60 -30 V30 L20 19 Z" fill="#5d6a76" stroke="' + INK + '" stroke-width="2.4"/><path d="M60 -28 V28" stroke="#fff3c8" stroke-width="6"/>';
    for (var r = 0; r < 6; r++) g += '<path d="M' + (-96 + r * 12) + ' -19 V19" stroke="#2f3840" stroke-width="2"/>';
    return g + R(-30, -27, 16, 8, ORANGE, 1.6, 2) + '</g>';
  }
  // the X-ray head: housing with the radiation sticker, collimator at the nose (+x), cable at the back
  function xhead(x, y, s, ang, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + s + ')">';
    g += '<path d="M-110 30 C-170 40 -190 120 -140 180" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M-110 30 C-170 40 -190 120 -140 180" stroke="#3a3a3a" stroke-width="8" fill="none"/>';
    g += R(-120, -60, 190, 120, PUTTY, 2.6, 58) + R(-120, -60, 190, 120, "url(#hatch)", 0, 58);
    g += '<circle cx="-40" cy="0" r="24" fill="#f2efe6" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 3; k++) { var a0 = k * 120 - 90 + 30, a1 = a0 + 60, p = function (a, r) { return f(-40 + Math.cos(a * Math.PI / 180) * r) + ' ' + f(Math.sin(a * Math.PI / 180) * r); }; g += '<path d="M' + p(a0, 6) + ' L' + p(a0, 19) + ' A19 19 0 0 1 ' + p(a1, 19) + ' L' + p(a1, 6) + ' A6 6 0 0 0 ' + p(a0, 6) + ' Z" fill="' + INK + '"/>'; }
    g += '<circle cx="-40" cy="0" r="4" fill="' + INK + '"/>' + R(60, -36, 50, 72, "#b3ae9e", 2.4, 4) + R(106, -24, 12, 48, BLUE, 2, 2);
    return g + '</g>';
  }
  function headTip(x, y, s, ang) { var a = ang * Math.PI / 180; return [x + Math.cos(a) * 118 * s, y + Math.sin(a) * 118 * s]; }
  // the detector plate: olive frame, black face (inner = svg drawn in plate coordinates, 0,0 = centre)
  function plate(x, y, w, h, inner, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    if (o.stand !== false) g += R(-20, h / 2, 40, 260, PUTTY, 2.2) + R(-20, h / 2, 40, 260, "url(#hatch)", 0);
    g += R(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, o.frame || OLIVE, 2.6) + R(-w / 2, -h / 2, w, h, o.face || "#161616", 2);
    var id = "pl" + (++CLIPN); g += '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')">' + (inner || "") + '</g>';
    return g + '</g>';
  }
  // the tube in cut-away, centred (cx,cy) at scale s. o: e (electrons boiling 0..1), beam (0..1), burst (0..1), waves (0..1),
  // heat (0..1), spin (turns per second), volt (0..1), fil (filament glow 0..1)
  function tube(cx, cy, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + s + ')">';
    var env = "M-250 -60 Q-262 -60 -262 -48 V48 Q-262 60 -250 60 H-200 Q-190 60 -180 80 Q-160 120 -120 120 H170 Q230 120 230 60 V-60 Q230 -120 170 -120 H-120 Q-160 -120 -180 -80 Q-190 -60 -200 -60 Z";
    g += R(-300, -38, 50, 12, "#8a857a", 1.6) + R(-300, 26, 50, 12, "#8a857a", 1.6);
    g += '<path d="' + env + '" fill="url(#glass)" stroke="' + INK + '" stroke-width="3"/><path d="' + env + '" fill="url(#hatch)" opacity=".5"/>';
    g += '<path d="M-110 -104 H150" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round"/><path d="M40 120 H130" stroke="' + BLUE + '" stroke-width="7"/>';
    // cathode cup + filament
    g += R(-236, -34, 52, 68, PUTTY, 2.4, 4) + R(-236, -34, 52, 68, "url(#hatch)", 0, 4) + R(-200, -22, 18, 44, "#f2efe6", 1.6, 2);
    var fl = o.fil == null ? 1 : o.fil, coil = "M-196 -16"; for (var k = 0; k < 7; k++) coil += " q6 3 0 6"; g += '<path d="' + coil + '" stroke="' + (fl > 0.3 ? "#e8602a" : "#6a5a4a") + '" stroke-width="3" fill="none"/>';
    if (fl > 0) g += '<circle cx="-193" cy="4" r="' + f(18 + 3 * Math.sin(t * 7)) + '" fill="url(#glowO)" opacity="' + f(fl) + '"/>';
    if (o.e) for (var e = 0; e < 14; e++) { var ph = (t * 0.7 + hash(e)) % 1, ex = -184 + ph * 34 * (0.4 + hash(e + 3)), ey = -20 + hash(e + 9) * 40 + Math.sin(t * 3 + e) * 4; g += '<circle cx="' + f(ex) + '" cy="' + f(ey) + '" r="4" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(o.e * Math.sin(ph * Math.PI) * 1.2) + '"/>'; }
    // anode disc on its shaft, rotor, bearings
    g += R(150, -70, 60, 140, "#c9c2a8", 2.4, 6); for (var r = 0; r < 7; r++) { var ry = -64 + ((r * 20 + t * (o.spin || 0.2) * 120) % 140); g += '<path d="M152 ' + f(ry) + ' H208" stroke="#8a8370" stroke-width="2.4"/>'; }
    g += R(208, -94, 44, 26, "#6a6458", 2.2) + R(208, 68, 44, 26, "#6a6458", 2.2) + R(208, -94, 44, 26, "url(#hatch)", 0) + R(208, 68, 44, 26, "url(#hatch)", 0);
    g += '<path d="M110 0 H150" stroke="#8a857a" stroke-width="14"/>';
    var heat = o.heat || 0; if (heat > 0) g += '<circle cx="90" cy="0" r="' + f(120 + 10 * Math.sin(t * 4)) + '" fill="url(#glowO)" opacity="' + f(heat) + '"/>';
    g += '<ellipse cx="110" cy="0" rx="40" ry="104" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="3"/><ellipse cx="110" cy="0" rx="40" ry="104" fill="url(#hatch)"/><ellipse cx="104" cy="0" rx="28" ry="80" fill="none" stroke="#4f5c2a" stroke-width="2"/>';
    var sp = t * (o.spin || 0.2) * Math.PI * 2; for (var k2 = 0; k2 < 8; k2++) { var a = sp + k2 * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a); if (c > -0.2) g += '<path d="M' + f(110 + c * 10) + ' ' + f(sn * 26) + ' L' + f(110 + c * 32) + ' ' + f(sn * 86) + '" stroke="#3f4a1c" stroke-width="2.4"/>'; }
    g += '<ellipse cx="110" cy="0" rx="10" ry="24" fill="#e8dcc0" stroke="' + INK + '" stroke-width="2"/>';
    if (o.spin > 2) for (var m = 0; m < 3; m++) g += '<path d="M' + (160 + m * 10) + ' ' + (-120 - m * 8) + ' A' + (60 + m * 10) + ' 120 0 0 1 ' + (160 + m * 10) + ' ' + (120 + m * 8) + '" stroke="' + ORANGE + '" stroke-width="2.4" fill="none" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 120) + '" opacity=".7"/>';
    if (heat > 0) for (var h = 0; h < 4; h++) { var hp = (t * 0.6 + h / 4) % 1; g += '<path d="M' + (70 + h * 22) + ' ' + f(-110 - hp * 80) + ' q8 -10 0 -20 t0 -20" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(heat * (1 - hp)) + '"/>'; }
    // the beam: electrons racing from the cathode to the disc face
    var bp = o.beam || 0; if (bp > 0) { var bx = lerp(-182, 74, bp); g += '<path d="M-182 4 L' + f(bx) + ' 6" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/><path d="M-182 4 L' + f(bx) + ' 6" stroke="' + ORANGE + '" stroke-width="9" stroke-linecap="round"/>';
      for (var d = 0; d < 8; d++) { var dp = ((t * 2.2 + d / 8) % 1) * bp; g += '<circle cx="' + f(lerp(-182, 74, dp)) + '" cy="' + f(lerp(4, 6, dp)) + '" r="3.4" fill="#fff3c8"/>'; } }
    var bu = o.burst || 0; if (bu > 0) for (var q = 0; q < 10; q++) { var qa = -Math.PI / 2 - 1.4 + q * 0.31, ql = (16 + 22 * Math.abs(Math.sin(t * 14 + q))) * bu; g += '<path d="M' + f(74 + Math.cos(qa) * 10) + ' ' + f(6 + Math.sin(qa) * 10) + ' L' + f(74 + Math.cos(qa) * (10 + ql)) + ' ' + f(6 + Math.sin(qa) * (10 + ql)) + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/>'; }
    if (bu > 0) g += '<circle cx="74" cy="6" r="9" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>';
    var wv = o.waves || 0; if (wv > 0) { g += '<path d="M60 124 L-40 420 L250 420 L130 124 Z" fill="url(#rayCone)" opacity="' + f(wv) + '"/>'; for (var w = 0; w < 4; w++) g += waveRay(70 + w * 18, 30, 30 + w * 50, 420, t, BLUE, 8, 26, wv, 3.4); }
    if (o.volt) g += '<g opacity="' + f(o.volt) + '"><circle cx="-282" cy="-80" r="16" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' + T("−", -282, -72, 26, INK, 800) + '<circle cx="260" cy="-130" r="16" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' + T("+", 260, -122, 24, INK, 800) + '</g>';
    return g + '</g>';
  }
  function glass(x, y, s, t) { var lv = 0.62 + 0.03 * Math.sin(t * 3); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-30 -45 L-24 45 H24 L30 -45 Z" fill="#fff" fill-opacity=".5" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(-30 + 6 * (1 - lv)) + ' ' + f(45 - 90 * lv) + ' L-24 45 H24 L' + f(30 - 6 * (1 - lv)) + ' ' + f(45 - 90 * lv) + ' Z" fill="#9fc3dc"/><path d="M-30 -45 L-24 45 H24 L30 -45" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>'; }
  // the room composition used from line 13 on: plate behind, the hand in front, the head at the lower left aiming at the palm
  var HX = 110, HY = 700, HA = -52, HS = 0.9, PX = 340, PY = 360, PW = 380, PH = 520, WX = 340, WY = 590, WS = 1.0;
  function rays(t, p, stopAtBone, n) {
    var tp = headTip(HX, HY, HS, HA), s = "", tg = [[0, 0.75], [1, 0.75], [2, 0.75], [3, 0.7], [1, 0.25], [2, 0.3], [4, 0.6]];
    s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' L' + f(WX - 120) + ' ' + f(WY - 400) + ' L' + f(WX + 120) + ' ' + f(WY - 250) + ' Z" fill="url(#rayCone)" opacity=".7"/>';
    tg.slice(0, n || 7).forEach(function (q, i) { var e = fingerTip(WX, WY, WS, q[0], q[1]), dx = e[0] - tp[0], dy = e[1] - tp[1], k = stopAtBone ? 1 : 1.25; var ex = tp[0] + dx * k, ey = tp[1] + dy * k; s += arrow(tp[0], tp[1], ex, ey, BLUE, 2.6, clamp(p * 1.3 - i * 0.05)); if (stopAtBone && p > 0.75) s += '<circle cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" r="' + f(6 + 2 * Math.sin(t * 9 + i)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2.4"/>'; });
    return s;
  }
  function room(t, o) {
    o = o || {}; var dk = o.dark == null ? 0 : o.dark, inner = '<rect x="-400" y="-400" width="800" height="800" fill="#8a8a86" opacity="' + f(1 - dk) + '"/>';
    if (o.print) inner += '<g opacity="' + f(o.print) + '">' + hand(WX - PX, WY - PY, WS, t, { skin: 1, bones: 1, xray: true, crack: o.crack }) + '</g>';
    var s = paper() + plate(PX, PY, PW, PH, inner);
    if (o.hand !== false) s += hand(WX, WY, WS, t, { skin: o.skin == null ? 1 : o.skin, bones: o.bones || 0, crack: o.crack });
    s += xhead(HX, HY, HS, HA, t);
    return s;
  }

  // 1 — the secret is all in one picture, the X-ray
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(420, 380, k), lerp(0.92, 1.1, k)]; }, function (u, d, t) {
    var inner = hand(0, 220, 1.05, t, { skin: 1, bones: 1, xray: true });
    return paper() + plate(320, 380, 420, 560, inner) + label(420, 200, 560, 120, "صورة الأشعة", BLUE, (u - 0.6) / 0.8);
  });
  // 2 — brand: the machine, the hand, the plate
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(260, 360, k), lerp(480, 420, k), lerp(0.85, 0.98, k)]; }, function (u, d, t) {
    return room(t) + rays(t, clamp((u - 0.3) / 1.2)) + label(HX + 10, HY - 40, 60, 540, "الجهاز", OLIVE, (u - 0.2) / 0.8) + label(PX + 180, PY - 200, 600, 130, "اللوح", OLIVE, (u - 0.8) / 0.8);
  });
  // 3 — a torch behind your hand in the dark: the light goes through the flesh and glows red
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(440, 380, k), lerp(0.95, 1.1, k)]; }, function (u, d, t) {
    var on = clamp((u - 0.5) / 0.6), s = paper() + R(150, 60, 420, 600, "#3c3c3a", 2.4) + '<rect x="150" y="60" width="420" height="600" fill="url(#hatchW)" opacity=".4"/>';
    s += hand(370, 620, 1.0, t, { glowTips: on }) + torch(170, 740, -48, on > 0, t);
    return s + label(130, 720, 60, 620, "كشاف", BLUE, (u - 0.3) / 0.8) + label(330, 300, 600, 160, "نوّر أحمر", ORANGE, (u - 2.0) / 0.8);
  });
  // 4 — X-rays are light too, only you can't see it, and much stronger
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(340, 290, k), lerp(380, 440, k), lerp(1.05, 0.92, k)]; }, function (u, d, t) {
    var sh = clamp((u - 0.6) / 1.2), s = paper() + R(150, 60, 420, 600, "#dcd8cc", 2.4) + '<rect x="150" y="60" width="420" height="600" fill="url(#hatch)"/>';
    s += '<g opacity="' + f(0.75 * sh) + '">' + hand(410, 600, 1.0, t, { skin: 1, xray: true }).replace(/#6a6a6a/g, "#3a3a38") + '</g>' + hand(360, 630, 1.0, t, {});
    s += xhead(150, 760, 0.85, -50, t); var tp = headTip(150, 760, 0.85, -50);
    for (var r = 0; r < 6; r++) s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' L' + f(330 + r * 40) + ' ' + f(160 + r * 30) + '" stroke="' + BLUE + '" stroke-width="2" stroke-dasharray="6 10" stroke-dashoffset="' + f(-t * 40) + '" opacity=".55"/>';
    return s + label(tp[0] + 10, tp[1] - 20, 60, 520, "الأشعة", BLUE, (u - 0.4) / 0.8) + label(470, 330, 610, 250, "أقوى بكتير", ORANGE, (u - 2.2) / 0.8);
  });
  // 5 — the X-rays come from a tube inside the machine, with all the air pumped out
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(230, 410, k), lerp(380, 420, k), lerp(0.9, 1.18, k)]; }, function (u, d, t) {
    var vac = ''; for (var q = 0; q < 18; q++) { var qx = 100 + hash(q) * 420 + Math.sin(t * 2 + q) * 12, qy = 320 + hash(q + 5) * 160 + Math.cos(t * 2 + q) * 10; vac += '<circle cx="' + f(qx) + '" cy="' + f(qy) + '" r="5" fill="none" stroke="' + BLUE + '" stroke-width="2" opacity="' + f(clamp(1 - u / d)) + '"/>'; }
    return paper() + tube(330, 400, 1.0, t, { fil: 0.2 }) + vac + label(240, 290, 400, 180, "الأنبوبة", OLIVE, (u - 0.3) / 0.8) + '<g opacity="' + f(clamp((u - 1.8) * 2)) + '">' + T("مافيهاش هوا!", 330, 470, 26, ORANGE, 800) + '</g>';
  });
  // 6 — at one end a thin wire gets very hot and gives off tiny particles called electrons
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(200, 150, k), lerp(400, 405, k), lerp(1.3, 2.1, k)]; }, function (u, d, t) {
    var fl = clamp((u - 0.3) / 1.2);
    return paper() + tube(330, 400, 1.0, t, { fil: fl, e: clamp((u - 1.4) / 1.0) }) + label(142, 404, 70, 330, "السلك", OLIVE, (u - 0.4) / 0.8, 14) + label(170, 390, 230, 300, "الإلكترونات", ORANGE, (u - 2.0) / 0.8, 14);
  });
  // 7 — at the other end, a heavy metal disc, waiting
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(380, 450, k), lerp(400, 390, k), lerp(1.2, 1.9, k)]; }, function (u, d, t) {
    return paper() + tube(330, 400, 1.0, t, { fil: 1, e: 1, spin: 0.15 }) + label(450, 320, 520, 260, "القرص", OLIVE, (u - 0.4) / 0.8, 16);
  });
  // 8 — between the wire and the disc, a strong voltage, about 100,000 volts
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(380, 400, k), lerp(1.08, 0.96, k)]; }, function (u, d, t) {
    var s = paper() + tube(330, 400, 1.0, t, { fil: 1, e: 1, spin: 0.15, volt: clamp((u - 0.3) * 2) });
    for (var a = 0; a < 3; a++) s += '<path d="M' + (150 + a * 0) + ' ' + (380 + a * 20) + ' H420" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="8 10" stroke-dashoffset="' + f(-t * 60) + '" opacity="' + f(0.6 * clamp((u - 1.0) * 2)) + '"/>';
    return s + numBox("100,000 V", 330, 230, (u - 0.8) / 1.0, 24);
  });
  // 9 — the voltage pulls the electrons to the disc: they race at over half the speed of light
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(240, 380, k), 400, lerp(1.3, 1.15, k)]; }, function (u, d, t) {
    var s = paper() + tube(330, 400, 1.0, t, { fil: 1, beam: clamp((u - 0.2) / 1.4), spin: 0.2 });
    for (var m = 0; m < 4; m++) { var mx = ((t * 400 + m * 80) % 260) + 160; s += '<path d="M' + f(mx) + ' ' + (370 + m * 18) + ' h-30" stroke="' + INK + '" stroke-width="2" opacity=".35"/>'; }
    return s + label(330, 406, 300, 290, "أكتر من نص سرعة الضوء", ORANGE, (u - 1.6) / 0.8, 17);
  });
  // 10 — the moment they hit the disc they brake suddenly, and that braking gives off X-rays
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(400, 420, k), lerp(410, 500, k), lerp(1.6, 1.15, k)]; }, function (u, d, t) {
    return paper() + tube(330, 400, 1.0, t, { fil: 1, beam: 1, burst: clamp((u - 0.3) / 0.4), waves: clamp((u - 1.4) / 1.2), spin: 0.3 }) + label(404, 400, 300, 330, "فرملة!", ORANGE, (u - 0.5) / 0.6, 16) + label(380, 640, 540, 700, "الأشعة", BLUE, (u - 2.0) / 0.8, 16);
  });
  // 11 — but about 99% of the energy comes out as heat, and only 1% as X-rays
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(420, 470, k), lerp(1.0, 0.92, k)]; }, function (u, d, t) {
    var s = paper() + tube(330, 330, 0.85, t, { fil: 1, beam: 1, burst: 1, waves: 0.6, heat: clamp((u - 0.3) / 1.0), spin: 0.3 }), b = ease(clamp((u - 1.0) / 1.4));
    s += R(90, 620, 460, 34, PAPER, 2) + '<rect x="91" y="621" width="' + f(452 * 0.99 * b) + '" height="32" fill="' + ORANGE + '"/>' + R(90, 680, 460, 34, PAPER, 2) + '<rect x="91" y="681" width="' + f(452 * 0.01 * b + 3 * b) + '" height="32" fill="' + BLUE + '"/>';
    return s + '<g opacity="' + f(b) + '">' + T("حرارة 99%", 320, 610, 22, ORANGE, 800) + T("أشعة 1%", 320, 740, 22, BLUE, 800) + '</g>';
  });
  // 12 — so the disc spins thousands of turns a minute, so it won't melt from the heat
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(380, 450, k), lerp(420, 390, k), lerp(1.35, 1.7, k)]; }, function (u, d, t) {
    var sp = lerp(0.3, 6, clamp((u - 0.3) / 1.5));
    return paper() + tube(330, 400, 1.0, t, { fil: 1, beam: 1, burst: 0.6, heat: 0.5, spin: sp }) + label(560, 450, 600, 560, "آلاف اللفات", ORANGE, (u - 1.2) / 0.8, 16);
  });
  // 13 — the X-rays leave the machine and pass over your hand
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(220, 330, k), lerp(560, 460, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    return room(t) + rays(t, clamp((u - 0.2) / 1.4)) + label(HX + 40, HY - 60, 40, 520, "الأشعة", BLUE, (u - 0.6) / 0.8);
  });
  // 14 — your flesh is mostly water, so the X-rays pass through it easily
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(330, 360, k), lerp(520, 470, k), lerp(1.3, 1.5, k)]; }, function (u, d, t) {
    return room(t) + rays(t, clamp(u / 1.0)) + glass(520, 330, 0.9, t) + label(400, 540, 250, 660, "لحمك", OLIVE, (u - 0.3) / 0.8, 16) + label(520, 290, 600, 230, "مية", BLUE, (u - 1.2) / 0.8, 16);
  });
  // 15 — but your bone is full of calcium, and calcium holds the X-rays and stops them
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(300, 350, k), lerp(480, 430, k), lerp(1.25, 1.45, k)]; }, function (u, d, t) {
    var bk = clamp((u - 0.2) / 0.8);
    return room(t, { skin: lerp(1, 0.45, bk), bones: bk }) + rays(t, clamp((u - 0.8) / 1.2), true) + label(326, 470, 180, 420, "العضم", OLIVE, (u - 0.6) / 0.8, 16) + label(330, 330, 190, 290, "كالسيوم", ORANGE, (u - 1.8) / 0.8, 16);
  });
  // 16 — behind your hand is a plate: every spot the X-rays reach turns dark
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(300, 380, k), lerp(380, 330, k), lerp(1.0, 0.95, k)]; }, function (u, d, t) {
    var dk = clamp((u - 0.3) / (d - 0.8));
    return room(t, { skin: 0.5, bones: 1, dark: dk, print: dk * 0.9 }) + rays(t, 1, true) + label(PX + 190, PY - 180, 610, 120, "اللوح", OLIVE, (u - 0.3) / 0.8) + label(PX + 120, PY - 230, 560, 60, "بيغمق", ORANGE, (u - 1.6) / 0.8);
  });
  // 17 — and the spot where the bone stopped the X-rays stays white
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(340, 330, k), lerp(380, 320, k), lerp(1.0, 1.3, k)]; }, function (u, d, t) {
    var away = ease(clamp((u - 0.3) / 1.4));
    return paper() + plate(PX, PY, PW, PH, hand(WX - PX, WY - PY, WS, t, { skin: 1, bones: 1, xray: true })) + '<g opacity="' + f(1 - away) + '">' + hand(WX + away * 300, WY + away * 200, WS, t, { skin: 0.5, bones: 1 }) + '</g>' + label(330, 300, 200, 200, "بيضا", ORANGE, (u - 1.2) / 0.8);
  });
  // 18 — and the fracture? a small crack lets the X-rays through: a black line inside the white bone
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(330, 310, k), lerp(380, 700, k), lerp(1.0, 1.6, k)]; }, function (u, d, t) {
    var s = paper() + plate(PX, PY, PW, PH + 240, hand(WX - PX, WY - PY, WS, t, { skin: 1, bones: 1, xray: true, crack: true }), { stand: false });
    var cx = WX - 30, cy = WY + 152; s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(34 + 4 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(clamp((u - 1.0) * 2)) + '"/>';
    s += waveRay(cx - 200, cy - 150, cx, cy, t, BLUE, 5, 20, clamp((u - 0.4) / 0.8), 3);
    return s + label(cx + 30, cy, 560, cy - 40, "الكسر", ORANGE, (u - 1.4) / 0.8, 18);
  });
  // 19 — many think the bone is what lights up in the picture
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(320, 350, k), lerp(400, 360, k), lerp(1.05, 1.15, k)]; }, function (u, d, t) {
    var s = paper() + plate(PX, PY, PW, PH, hand(WX - PX, WY - PY, WS, t, { skin: 1, bones: 1, xray: true }));
    for (var r = 0; r < 10; r++) { var a = r / 10 * Math.PI * 2 + t * 0.4, l = 30 + 10 * Math.sin(t * 4 + r); s += '<path d="M' + f(340 + Math.cos(a) * 120) + ' ' + f(400 + Math.sin(a) * 160) + ' l' + f(Math.cos(a) * l) + ' ' + f(Math.sin(a) * l) + '" stroke="#ffe7a0" stroke-width="4" stroke-linecap="round" opacity="' + f(clamp((u - 0.3) * 2)) + '"/>'; }
    return s + crossMark(500, 160, 1.6, (u - 1.6) / 1.0) + label(340, 300, 120, 140, "بينوّر؟", ORANGE, (u - 0.6) / 0.8);
  });
  // 20 — no: the bone is white because it's what kept the X-rays from getting there
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(460, 420, k), lerp(1.25, 1.4, k)]; }, function (u, d, t) {
    return room(t, { skin: 0.45, bones: 1, dark: 1, print: 0.9 }) + rays(t, clamp((u - 0.1) / 1.0), true) + label(330, 350, 170, 270, "منع الأشعة", ORANGE, (u - 0.8) / 0.8, 16);
  });
  // 21 — what you see in the picture is the shadow of your bone
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(330, 350, k), lerp(400, 370, k), lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    var inn = tube(-30, 0, 0.42, t, { fil: 1, beam: 1, burst: 1, waves: 1, spin: 0.4 });
    return paper() + plate(PX, PY, PW, PH, hand(WX - PX, WY - PY, WS, t, { skin: 1, bones: 1, xray: true, crack: true })) + inset(530, 140, 100, inn, (u - 0.4) / 0.8) + numBox("ضل عضمك", 340, 650, (u - 1.0) / 0.8, 26);
  });
  // 22 — whoever found it in 1895 didn't understand it, so he called it X: the unknown
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(230, 410, k), lerp(330, 440, k), lerp(0.95, 1.2, k)]; }, function (u, d, t) {
    var s = paper() + plate(390, 370, 300, 520, hand(0, 230, 0.82, t, { skin: 0.8, bones: 1, xray: true }), { stand: false, face: "#1e1b18", frame: "#4a4038" });
    s += '<g transform="translate(130 210) rotate(' + f(Math.sin(t * 2.5) * 8) + ') scale(' + f(pop((u - 0.6) / 0.8) * (1 + 0.06 * Math.sin(t * 4))) + ')">' + T("X", 0, 40, 120, ORANGE, 900) + '</g>';
    return s + label(130, 250, 70, 330, "المجهول", ORANGE, (u - 1.6) / 0.8) + T("1895", 390, 690, 28, INK, 800);
  });
  // 23 — and the first famous X-ray was of his wife's hand, the ring showing on her finger
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(380, 390, k), lerp(420, 330, k), lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var rt = fingerTip(390, 600, 0.82, 2, 0.2);
    return paper() + plate(390, 370, 300, 520, hand(0, 230, 0.82, t, { skin: 0.8, bones: 1, xray: true, ring: true }), { stand: false, face: "#2a2420", frame: "#4a4038" }) + label(rt[0] + 14, rt[1], 600, rt[1] - 60, "الدبلة", ORANGE, (u - 1.0) / 0.8, 18);
  });
  // (line 0 is the opening card, line 24 the summary card; shot 0 keeps the panel valid if they're hidden)
  shot(0, function () { return [320, 400, 1]; }, function (u, d, t) { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__intro = function (svg, t) {
    var dx = 60 * Math.sin(t * 0.9), sc = 0.62 + 0.06 * Math.sin(t * 1.3), s = '<rect width="580" height="320" fill="#141414"/><g transform="translate(' + f(440 + dx) + ' 160) rotate(-90) scale(' + f(sc) + ')">' + hand(0, 0, 1, t, { skin: 1, bones: 1, xray: true, crack: true }) + '</g>';
    s += '<circle cx="' + f(440 + dx - 152 * sc) + '" cy="' + f(160 - 30 * sc) + '" r="' + f(26 + 6 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>';
    var sx = ((t * 260) % 760) - 90; s += '<rect x="' + f(sx) + '" y="0" width="60" height="320" fill="#9fc3dc" opacity=".22"/><path d="M' + f(sx + 30) + ' 0 V320" stroke="#bfe0ff" stroke-width="3" opacity=".8"/>';
    svg.innerHTML = s;
  };
  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="300" fill="#e4d9bf"/>' + tube(170, 130, 0.42, t, { fil: 1, beam: 1, burst: 1, waves: 0.8, spin: 0.4 }) + '<rect x="350" y="12" width="218" height="276" fill="#141414" stroke="' + INK + '" stroke-width="2"/><g transform="translate(459 270)">' + hand(0, 0, 0.5, t, { skin: 1, bones: 1, xray: true }) + '</g>';
    var sx = 350 + ((u * 200) % 218); svg.style.transform = 'scale(' + f(1 + 0.05 * Math.sin(t * 1.6)) + ') translateY(' + f(3 * Math.sin(t * 1.1)) + 'px)'; var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = Math.round(99 * clamp(u / 2.4)) + '%'; s += '<rect x="' + f(sx - 20) + '" y="12" width="40" height="276" fill="#9fc3dc" opacity=".2"/><path d="M' + f(sx) + ' 12 V288" stroke="#bfe0ff" stroke-width="3" opacity=".7"/>';
    [["1", 70, 150], ["2", 150, 116], ["3", 232, 82], ["4", 200, 250], ["5", 450, 120], ["6", 540, 270]].forEach(function (c, i) { s += callout(c[0], c[1], c[2], (u - 0.2 - i * 0.15) / 0.6); });
    svg.innerHTML = s;
  };
  window.__parts = { hand: hand, tube: tube, xhead: xhead, plate: plate, torch: torch, paper: paper, label: label, T: T, callout: callout, numBox: numBox, waveRay: waveRay, inset: inset };
})();
