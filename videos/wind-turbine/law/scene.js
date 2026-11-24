/* «تعمل توربينة رياح إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One build at REAL scale (80 world units = 1 m; the man is 1.75 m): a fan on a 5 m pole by a village grows into a 100 m
   tower on a 1,000-tonne foundation, with three 50 m blades, a nacelle cut open (shaft, gearbox, brake, generator), a wind
   vane, a step-up transformer, blade coating, lightning receptors, a ladder and the red aviation light. The sky, sun,
   far hills and far turbines are screen-space (window.LAW_BG) so the camera can climb 100 m. Ground line y = 0. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has, scr = K.scr;
  var LN = window.TIMING.lines, DUR = window.TIMING.duration;
  var H = 8000, NB = -H, NT = -H - 320, HX = -300, HY = -H - 160, BL = 4000;     // tower top, nacelle roof, hub, blade length
  var MODE = {};                                                                   // set by each shot: storm, dusk, flash
  function lineAt(t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start <= t) i++; return i; }

  // ── the rotor's angle: integrate a speed (turns per second) set per line, smoothed; line 17 parks one blade straight down ──
  function rps(i, u) {
    switch (i) {
      case 0: return u < 0.9 ? 0 : 1.1;
      case 1: return 0.12 + 0.12 * Math.max(0, Math.sin(u * 5));
      case 2: return lerp(0.25, 1.0, clamp(u / 4));
      case 3: case 4: return 1.0;
      case 5: return 0.5;
      case 6: return lerp(0.5, 0.25, clamp((u - 0.3) / 2.8));
      case 9: return u < 0.5 ? 0.25 : 0.07;
      case 11: return 0.8;
      case 12: return u < 0.6 ? 0.8 : u < 3.2 ? lerp(0.8, 0, clamp((u - 0.6) / 2.6)) : 0;
      case 17: case 18: case 19: return 0;
      default: return 0.25;
    }
  }
  var DT = 1 / 120, ANG = [0], v = 0, a = 0, parkFrom = null, parkTo = null;
  for (var k = 1; k * DT <= DUR + 2; k++) { var tt = k * DT, li = lineAt(tt), uu = tt - LN[li].start;
    if (li === 17) { if (parkFrom == null) { parkFrom = a; parkTo = a + ((((60 - a) % 120) + 120) % 120 || 120); } a = lerp(parkFrom, parkTo, ease(uu / 1.2)); v = 0; }
    else if (li > 17 && li < 20) { }
    else { v += (rps(li, uu) - v) * Math.min(1, DT * 4); a += v * 360 * DT; }
    ANG.push(a); }
  function rotorAng(t) { var k = Math.max(0, Math.min(ANG.length - 1, Math.round(t / DT))); return ANG[k]; }
  function rotorSpd(t) { var k = Math.max(1, Math.min(ANG.length - 1, Math.round(t / DT))); return (ANG[k] - ANG[k - 1]) / DT / 360; }

  // ── screen-space background: sky (day / storm / dusk), sun, clouds, far hills of the Red Sea coast, far turbines ──
  window.LAW_BG = function (cam, t) {
    var st = clamp(MODE.storm || 0), dk = clamp(MODE.dusk || 0), s = R(-10, -10, 1100, 1940, "url(#skyD)", { sw: 0 });
    if (dk) s += R(-10, -10, 1100, 1940, "url(#skyK)", { sw: 0, op: dk });
    if (st) s += R(-10, -10, 1100, 1940, "url(#skyS)", { sw: 0, op: st });
    s += C(860, 250, 330 + 10 * Math.sin(t * 0.7), "url(#sun)", { op: 1 - st });
    var pcx = cam.cx * cam.z * 0.06, pcy = cam.cy * cam.z * 0.03;
    for (var c = 0; c < 6; c++) { var cx = ((c * 330 + t * 16 - pcx) % 1600 + 1600) % 1600 - 260, cy = 180 + hash(c + 20) * 900 - pcy % 900, sc = 0.8 + hash(c + 30) * 0.8;
      if (cy < -200 || cy > 2000) cy = ((cy % 1100) + 1100) % 1100 + 120;
      s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')" opacity="' + f(0.95 - 0.5 * st) + '"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="' + (st > 0.5 ? "#59606c" : "#fff") + '" stroke="' + (st > 0.5 ? "#3a404a" : "#c9d6e2") + '" stroke-width="3"/></g>'; }
    var hy = 960 - cam.cy * cam.z;                                        // where the horizon (ground line) is on screen
    if (hy > -50 && hy < 2400) {
      var px = -cam.cx * cam.z * 0.12, d = "M-40 " + f(hy);
      for (var x = -40; x <= 1120; x += 40) d += " L" + x + " " + f(hy - 70 - 90 * Math.abs(Math.sin((x - px) / 230)) - 50 * Math.abs(Math.sin((x - px) / 97)));
      s += F(d + " L1120 " + f(hy) + " Z", st ? "#8c8c96" : "#d9b98e", { sw: 0, op: 0.75 });
      for (var w = 0; w < 6; w++) { var wx = ((w * 210 + 60 + px * 1.6) % 1300 + 1300) % 1300 - 110, wh = 170 + hash(w + 3) * 60, ra = t * 70 + w * 40;
        s += '<g opacity="' + f(0.5 - 0.2 * st) + '">' + F("M" + f(wx - 4) + " " + f(hy) + " L" + f(wx - 2) + " " + f(hy - wh) + " L" + f(wx + 2) + " " + f(hy - wh) + " L" + f(wx + 4) + " " + f(hy) + " Z", "#eef1f4", { sw: 0 });
        for (var b = 0; b < 3; b++) { var aa = (ra + b * 120) * Math.PI / 180; s += P("M" + f(wx) + " " + f(hy - wh) + " l" + f(Math.sin(aa) * 70) + " " + f(-Math.cos(aa) * 70), "#eef1f4", 4); }
        s += '</g>'; } }
    return s;
  };
  // screen overlays: rain, flash
  function weather(t) { var st = clamp(MODE.storm || 0), s = "";
    if (st > 0) for (var i = 0; i < 90; i++) { var p = (t * 1.6 + hash(i)) % 1, x = hash(i + 5) * 1300 - 100 + p * 160, y = p * 2000 - 60; s += P("M" + f(x) + " " + f(y) + " l-26 70", "#c9d8ea", 3, ' opacity="' + f(0.55 * st) + '"'); }
    if (MODE.flash) s += R(-10, -10, 1100, 1940, "#fff", { sw: 0, op: clamp(MODE.flash) * 0.7 });
    return s; }

  // ── the ground, cut open: sand on top, soil below with stones ──
  var SOIL = (function () { var s = ""; for (var i = 0; i < 180; i++) { var x = -3600 + hash(i) * 7200, y = 120 + hash(i + 9) * 2600, rx = 20 + hash(i + 3) * 70;
      s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * (0.35 + hash(i + 5) * 0.3)) + '" fill="' + (hash(i + 7) > 0.5 ? "#6e4628" : "#b08050") + '" opacity="' + f(0.3 + hash(i + 2) * 0.3) + '"/>'; }
    for (var q = 0; q < 60; q++) { var sx = -3600 + hash(q + 700) * 7200, sy = 200 + hash(q + 800) * 2600, r = 10 + hash(q + 900) * 26; s += '<ellipse cx="' + f(sx) + '" cy="' + f(sy) + '" rx="' + f(r * 1.3) + '" ry="' + f(r) + '" fill="#b4a088" stroke="#5a4636" stroke-width="2.5" opacity=".8"/>'; }
    return s; })();
  function ground() {
    return R(-60000, 60, 120000, 60000, "#8a5a34", { sw: 0 }) + R(-60000, 900, 120000, 60000, "#74482a", { sw: 0 }) + R(-60000, 2200, 120000, 60000, "#5a3820", { sw: 0 }) + SOIL +
      R(-60000, -6, 120000, 70, "url(#sandG)", { sw: 4 }); }
  // an Egyptian village house: red brick between a concrete frame, rebar sticking out of the roof
  function house(x, w, h, seed) { var fl = Math.max(1, Math.round(h / 270)), s = '<g filter="url(#sh)">' + R(x, -h, w, h, "url(#brick)") + '</g>';
    for (var r = 0; r < fl; r++) { var y0 = -h + r * (h / fl); s += R(x - 6, y0 - 8, w + 12, 18, "#c8c2b6", { sw: 2 });
      for (var c = 0; c < Math.floor(w / 130); c++) { var wx = x + 30 + c * 130; s += R(wx, y0 + 60, 70, 100, hash(seed + r * 3 + c) > 0.4 ? "#5f86a8" : "#3a2e26", { sw: 3 }) + R(wx - 6, y0 + 160, 82, 10, "#c8c2b6", { sw: 2 }); } }
    s += R(x, -h, 18, h, "#c8c2b6", { sw: 2 }) + R(x + w - 18, -h, 18, h, "#c8c2b6", { sw: 2 });
    for (var b = 0; b < 4; b++) s += P("M" + f(x + 10 + b * (w - 20) / 3) + " " + (-h - 8) + " v-60", "#6a4a3a", 4);
    if (seed % 2) s += R(x + w - 110, -h - 90, 70, 80, "#3a3f46", { rx: 8, sw: 3 });
    s += R(x + w / 2 - 40, -150, 80, 150, "#5a3a22", { sw: 3 });
    return s; }
  function village(t) { return house(-1750, 420, 700, 3) + K.palm(-1250, t, 2.4) + house(-1180, 380, 560, 4) + house(-740, 300, 760, 5) + K.bush(-380, 2.2) + K.palm(-2050, t, 2.8); }

  // wind: streaks moving right at height y with speed sp (world), drawn thick enough for any zoom
  function wind(t, x0, x1, y, sp, n, col, z) { var s = "", w = 7 / z; for (var i = 0; i < n; i++) { var p = (t * sp / (x1 - x0) + hash(i + y)) % 1, x = lerp(x0, x1, p), len = 30 / z + sp * 0.25, yy = y + Math.sin(t * 2 + i) * 20 / z + (hash(i * 3 + y) - 0.5) * 160 / z;
      s += P("M" + f(x) + " " + f(yy) + " q" + f(len / 2) + " " + f(-12 / z) + " " + f(len) + " 0", col || "#ffffff", w, ' opacity="' + f(0.75 * Math.sin(p * Math.PI)) + '"'); } return s; }
  function swirl(x, y, r, t, z) { var a = t * 4; return P("M" + f(x + r * Math.cos(a)) + " " + f(y + r * Math.sin(a)) + " A" + f(r) + " " + f(r) + " 0 1 1 " + f(x + r * Math.cos(a + 4)) + " " + f(y + r * Math.sin(a + 4)), "#fff", 6 / z, ' opacity=".7"'); }

  // ── the tower (grows 0…1 from a 5 m pole), with sway, a cut-open view with the ladder, the door, the earth cable ──
  function towerH(g) { return lerp(420, H, ease(g)); }
  function tower(o) { var g = o.grow, h = towerH(g), b = lerp(14, 180, g), tp = lerp(10, 100, g), sw = o.sway || 0, d = "", e = "";
    for (var i = 0; i <= 20; i++) { var q = i / 20, y = -h * q, x = sw * q * q, w = lerp(b, tp, q); d += (i ? " L" : "M") + f(x - w) + " " + f(y); e = " L" + f(x + w) + " " + f(y) + e; }
    var path = d + e.replace(/^ L/, " L") + " Z", s = '<g filter="url(#sh)">' + F(path, g < 0.2 ? "url(#poleG)" : "url(#towerG)", { sw: 4 }) + '</g>';
    if (g > 0.5) for (var j = 1; j < 4; j++) { var y = -h * j / 4, w = lerp(b, tp, j / 4), x = sw * (j / 4) * (j / 4); s += P("M" + f(x - w) + " " + f(y) + " H" + f(x + w), "#9aa4ae", 6); }
    if (g > 0.5) s += R(-60, -230, 120, 220, "#d8dde2", { rx: 10, sw: 4 }) + C(36, -120, 7, "#5a6068") + R(-110, -16, 220, 16, "#b8bcc2", { sw: 3 });
    if (o.cut) { var cw = 0.82; s += F("M" + f(-b * cw) + " -20 L" + f(-tp * cw) + " " + f(-h + 40) + " L" + f(tp * cw) + " " + f(-h + 40) + " L" + f(b * cw) + " -20 Z", "url(#towerIn)", { sw: 3 });
      s += P("M-40 -20 L-40 " + f(-h + 40) + " M40 -20 L40 " + f(-h + 40), "#e2b035", 8);
      var rungs = ""; for (var r2 = -60; r2 > -h + 40; r2 -= 60) rungs += "M-40 " + r2 + " H40 "; s += P(rungs, "#e2b035", 6); }
    return s; }
  // the foundation in the cut-open ground: the pit, a rebar cage, then concrete filling up (fill 0…1)
  function foundation(o) { var s = "", pit = clamp(o.pit), fill = clamp(o.fill), w = 760, d = 300;
    if (pit <= 0) return s;
    s += R(-w - 30, 0, 2 * w + 60, d * pit + 20, "#3a2616", { sw: 3, op: 0.9 });
    if (o.rebar) { var rb = ""; for (var x = -w + 40; x < w; x += 70) rb += "M" + x + " " + 20 + " V" + (d - 20) + " "; for (var y = 40; y < d; y += 60) rb += "M" + (-w + 30) + " " + y + " H" + (w - 30) + " "; s += P(rb, "#8a4a2a", 5); }
    if (fill > 0) { var top = d - d * fill; s += R(-w, top, 2 * w, d - top, "url(#concG)", { sw: 4 }) + (fill > 0.95 ? F("M-260 0 L-220 -40 L220 -40 L260 0 Z", "url(#concG)", { sw: 4 }) : "");
      if (fill < 1) s += P("M" + (-w + 40) + " " + f(top + 8) + " q60 -14 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0", "#8f8a80", 4); }
    return s; }

  // ── one blade (pointing up from the hub, local units): big 0…1 morphs a short paddle into a slender 50 m airfoil blade ──
  function blade(len, big, pf, o) { var L = "", Rr = "", pts = 14;
    for (var i = 0; i <= pts; i++) { var q = i / pts, wS = lerp(150, 60, q) * (q < 0.25 ? 0.6 + 1.6 * q : 1), wB = len * (q < 0.2 ? lerp(0.017, 0.04, q / 0.2) : lerp(0.04, 0.006, (q - 0.2) / 0.8)), w = lerp(lerp(70, 210, Math.min(1, q * 3)), wB, big) * pf, y = -len * q;
      if (!big && q > 0.85) w *= Math.sqrt((1 - q) / 0.15 + 0.05);
      L += (i ? " L" : "M") + f(-w * 0.62) + " " + f(y); Rr = " L" + f(w * 0.38) + " " + f(y) + Rr; }
    var s = F(L + Rr + " Z", "url(#bladeG)", { sw: 4 });
    if (o.coat > 0) { var cl = ""; for (var j = Math.round(pts * (1 - 0.45 * o.coat)); j <= pts; j++) { var q2 = j / pts, wB2 = len * (q2 < 0.2 ? lerp(0.017, 0.04, q2 / 0.2) : lerp(0.04, 0.006, (q2 - 0.2) / 0.8)) * pf; cl += (cl ? " L" : "M") + f(wB2 * 0.38 - 6) + " " + f(-len * q2); } s += P(cl, "#e0703a", Math.max(10, len * 0.004)); }
    if (big > 0.9) s += C(0, -len, Math.max(10, len * 0.004), "#9aa2ac", { st: INK, sw: 3 });
    if (o.glow) s += P("M0 0 L0 " + f(-len), "#ffe46a", Math.max(14, len * 0.006), ' opacity="' + f(o.glow) + '"');
    return s; }
  // the rotor at the hub: three blades, the spinner. Angle a (degrees, clockwise), shake (storm), glowing blade index
  function rotor(a, len, big, pf, o) { var s = "";
    for (var b = 0; b < 3; b++) { var sh = (o.shake || 0) * Math.sin(o.t * 23 + b * 2); s += '<g transform="rotate(' + f(a + b * 120 + sh) + ')">' + blade(len, big, pf, { coat: o.coat || 0, glow: o.glowB === b ? o.glow : 0 }) + '</g>'; }
    if (o.trail) { var tr = ""; for (var b2 = 0; b2 < 3; b2++) { var a0 = (a + b2 * 120 - 90) * Math.PI / 180, a1 = a0 - 0.6; tr += "M" + f(len * Math.cos(a1)) + " " + f(len * Math.sin(a1)) + " A" + f(len) + " " + f(len) + " 0 0 1 " + f(len * Math.cos(a0)) + " " + f(len * Math.sin(a0)) + " "; } s += P(tr, "#ffffff", len * 0.012, ' opacity="' + f(o.trail * 0.55) + '"'); }
    var hr = lerp(90, 150, big);
    s += '<g filter="url(#sh)">' + F("M0 " + f(-hr) + " Q" + f(-hr * 1.9) + " 0 0 " + f(hr) + " Z", "url(#nacG)", { sw: 4 }) + C(0, 0, hr * 0.9, "url(#nacG)", { st: INK, sw: 4 }) + '</g>';
    return s; }
  function gear(cx, cy, r, n, ang, fill) { var d = ""; for (var i = 0; i < n * 2; i++) { var a1 = (ang + i * 180 / n) * Math.PI / 180, a2 = (ang + (i + 1) * 180 / n) * Math.PI / 180, rr = i % 2 ? r : r + 14;
      d += (i ? " L" : "M") + f(cx + rr * Math.cos(a1)) + " " + f(cy + rr * Math.sin(a1)) + " L" + f(cx + rr * Math.cos(a2)) + " " + f(cy + rr * Math.sin(a2)); }
    return F(d + " Z", fill, { sw: 3 }) + C(cx, cy, r * 0.35, "#5a6068", { st: INK, sw: 3 }) + P("M" + f(cx) + " " + f(cy) + " l" + f(r * 0.7 * Math.cos(ang * Math.PI / 180)) + " " + f(r * 0.7 * Math.sin(ang * Math.PI / 180)), "#2a2e33", 6); }
  // the nacelle (local: x −200…760, y −320…0 above the tower top). cut: open the side to show the machine inside
  function nacelle(t, o, ra) { var s = "", sp = rotorSpd(t);
    var shell = "M-200 -40 Q-210 -300 -150 -320 L640 -320 Q760 -310 760 -200 L760 -40 Q750 0 700 0 L-160 0 Q-200 0 -200 -40 Z";
    if (!o.cut) s += '<g filter="url(#sh)">' + F(shell, "url(#nacG)", { sw: 4 }) + '</g>' + P("M-150 -290 H620", "#ffffff", 8, ' opacity=".6"') + P("M80 -320 V0 M420 -320 V0", "#b8c0c8", 4);
    else { s += '<g filter="url(#sh)">' + F(shell, "url(#nacIn)", { sw: 6 }) + '</g>' + R(-190, -26, 940, 22, "#8a9098", { sw: 3 });
      var g = clamp(o.gear || 0), gy = lerp(-900, 0, ease(g));
      s += R(-250, -178, g > 0.95 ? 380 : 690, 56, "url(#pipeH)", { sw: 3 }) + R(-40, -230, 70, 180, "#6a727c", { rx: 8, sw: 3 });   // main shaft and its bearing
      if (g > 0) s += '<g transform="translate(0 ' + f(gy) + ')">' + R(120, -270, 220, 240, "#7d8a96", { rx: 14, sw: 4, op: 0.96 }) + gear(190, -150, 70, 18, ra, "#c9a14a") + gear(285, -150, 26, 7, -ra * 2.7, "#e2c06a") + R(330, -158, 110, 16, "url(#pipeH)", { sw: 2 }) +
        C(388, -150, 52, "#5a6068", { st: INK, sw: 3 }) + (o.brake ? C(388, -150, 52, "#ff5a2a", { op: 0.4 + 0.3 * Math.sin(t * 20) }) : "") + '</g>' + (g < 1 && g > 0 ? P("M230 " + f(gy - 270) + " V-700", "#3a3a3a", 4) : "");
      s += '<g filter="url(#sh)">' + R(440, -262, 210, 224, "url(#genG)", { rx: 18, sw: 4 }) + '</g>';
      for (var c = 0; c < 6; c++) { var ph = ((t * Math.max(0.05, sp) * (g > 0.95 ? 28 : 1) * 2 + c / 6) % 1); s += P("M" + f(452 + ph * 186) + " -250 V-50", "#b87333", 8, ' opacity="' + f(Math.sin(ph * Math.PI)) + '"'); }
      s += R(668, -250, 70, 200, "#3a4048", { rx: 6, sw: 3 }) + C(690, -220, 6, "#5ad07a") + C(712, -220, 6, Math.sin(t * 5) > 0 ? "#f2c230" : "#5a4a1a"); }
    if (o.vane) { var vk = clamp(o.vane); s += '<g opacity="' + f(vk) + '">' + P("M640 -320 V-430 M560 -320 V-410", "#6a727c", 8);
      for (var cu = 0; cu < 3; cu++) { var aa = t * 9 + cu * 2.09; s += C(560 + 46 * Math.cos(aa), -410 + 8 * Math.sin(aa), 13, "#e8ecf0", { st: INK, sw: 3 }); }
      s += F("M600 -440 L700 -430 L700 -400 Z", "#e8ecf0", { sw: 3 }) + '</g>'; }
    if (o.beacon) { var on = Math.sin(t * 5) > 0; s += R(20, -350, 40, 30, "#5a6068", { sw: 3 }) + C(40, -362, 16, on ? "#ff3a2a" : "#7a2a22", { st: INK, sw: 3 }) + (on ? C(40, -362, 90, "url(#redG)") : ""); }
    if (o.yawGlow) s += R(-130, -20, 260, 30, "#ffd23a", { rx: 10, sw: 3, op: 0.5 + 0.4 * Math.sin(t * 8) });
    return s; }
  // the turbine: tower + nacelle (scaled with the tower while it grows) + rotor
  function turbine(t, o) { var g = o.grow, h = towerH(g), ns = lerp(0.12, 1, ease(g)), sw = o.sway || 0, ra = o.ang != null ? o.ang : rotorAng(t), big = o.big || 0, len = lerp(620, BL, ease(big));
    var s = tower({ grow: g, sway: sw, cut: o.cut2 });
    var rt = '<g transform="translate(-300 -160)">' + rotor(ra, len, big, o.pitch == null ? 1 : o.pitch, { t: t, shake: o.shake, coat: o.coat, trail: o.trail, glowB: o.glowB, glow: o.glow }) + '</g>';
    s += '<g transform="translate(' + f(sw) + ' ' + f(-h) + ') scale(' + f(ns) + ')">' + (o.cut ? rt + nacelle(t, o, ra) : nacelle(t, o, ra) + rt) + '</g>';
    return s; }
  // the transformer at the foot of the tower, the cable to the grid on low poles
  function transformer(x, k) { if (k <= 0) return ""; var y = lerp(-1400, 0, ease(k)), s = '<g transform="translate(' + x + ' ' + f(y) + ')" filter="url(#sh)">' + R(0, -210, 220, 210, "url(#trG)", { rx: 8, sw: 4 });
    for (var i = 0; i < 6; i++) s += R(14 + i * 34, -190, 18, 160, "#4f7a5a", { sw: 2 });
    s += R(40, -250, 26, 40, "#d9d2c0", { sw: 3 }) + R(150, -250, 26, 40, "#d9d2c0", { sw: 3 }) + '</g>' + (k < 1 ? P("M" + (x + 110) + " " + f(y - 210) + " V" + f(y - 1400), "#3a3a3a", 5) : "");
    return s; }
  function gridLine(t, o) { var s = "", x0 = o.trans ? 700 : 180, y0 = o.trans ? -230 : -60, pts = [[x0, y0], [1400, -520], [2600, -520], [3800, -520], [5000, -520]];
    for (var p = 1; p < 5; p++) s += R(pts[p][0] - 14, -520, 28, 520, "url(#wood)", { sw: 3 }) + R(pts[p][0] - 70, -540, 140, 20, "#6a4a2a", { sw: 3 });
    var d = "M" + pts.map(function (q) { return q[0] + " " + q[1]; }).join(" L"); s += P(d, "#1a1a1a", 9);
    var loss = o.loss || 0;
    for (var k = 0; k < 26; k++) { var q = (t * 0.22 + k / 26) % 1, x = lerp(x0, 5000, q), seg = x < 1400 ? 0 : 1, yy = seg ? -520 : lerp(y0, -520, (x - x0) / (1400 - x0)), fade = loss ? clamp(1 - q * 1.6 * loss) : 1;
      s += C(x, yy, o.trans ? 13 : 17, "#ffd23a", { st: INK, sw: 2, op: fade }); }
    if (loss) for (var h2 = 0; h2 < 8; h2++) { var hp = (t * 0.9 + h2 / 8) % 1, hx = 1100 + h2 * 320; s += P("M" + hx + " " + f(-560 - hp * 120) + " q14 -18 0 -36 q-14 -18 0 -36", "#ff6a3a", 6, ' opacity="' + f((1 - hp) * loss) + '"'); }
    return s; }
  function earth(o) { if (!o.rod) return ""; return R(240, -10, 22, 700, "#b87333", { sw: 3 }) + P("M110 -8 H251", "#3aa05a", 10); }
  function truck(x, t, pour) { var s = '<g transform="translate(' + x + ' 0)" filter="url(#sh)">' + R(0, -240, 560, 120, "#e8e4dc", { sw: 4 }) + R(470, -360, 170, 240, "#d9473a", { rx: 14, sw: 4 }) + R(500, -340, 110, 90, "#9fd0f0", { sw: 3 });
    s += '<g transform="translate(230 -330) rotate(-12)">' + F("M-190 0 Q-180 -130 0 -140 Q200 -130 230 0 Q200 120 0 110 Q-180 110 -190 0 Z", "url(#drumG)", { sw: 4 });
    for (var i = 0; i < 4; i++) { var p = ((t * 0.6 + i / 4) % 1); s += P("M" + f(-170 + p * 380) + " -110 l-60 210", "#e07a2a", 16, ' opacity="' + f(Math.sin(p * Math.PI)) + '"'); } s += '</g>';
    for (var w = 0; w < 3; w++) s += C(80 + w * 170 + (w === 2 ? 220 : 0), -60, 60, "#2a2e33", { st: INK, sw: 4 }) + C(80 + w * 170 + (w === 2 ? 220 : 0), -60, 24, "#9aa2ac");
    s += P("M-10 -260 L-280 -40", "#8a9098", 26) + '</g>';
    if (pour) s += P("M" + (x - 280) + " -40 Q" + (x - 330) + " 60 " + (x - 340) + " 160", "#9a958c", 34, ' opacity=".95"');
    return s; }

  // ── the screen-space insets (round magnifiers, as in r06): airfoil, top view, pitch, leading edge ──
  var IC = 0;
  function inset(x, y, r, k, body) { if (k <= 0) return ""; var id = "ic" + (IC++), sc = K.pop(k);
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')" filter="url(#sh)"><clipPath id="' + id + '"><circle r="' + r + '"/></clipPath>' + C(0, 0, r, "#eaf3fb", { st: "#fff", sw: 14 }) +
      '<g clip-path="url(#' + id + ')">' + body + '</g>' + C(0, 0, r, "none", { st: INK, sw: 4 }) + '</g>'; }
  function airfoil(rot, sc, col) { return '<g transform="rotate(' + f(rot) + ') scale(' + f(sc) + ')">' + F("M-110 0 Q-108 -26 -60 -30 Q40 -30 120 -4 Q130 0 120 4 Q40 14 -60 16 Q-108 18 -110 0 Z", col || "url(#bladeG)", { sw: 4 }) + '</g>'; }
  function flowLines(t, bend) { var s = ""; for (var i = 0; i < 5; i++) { var y = -110 + i * 55, p = (t * 0.8 + i * 0.13) % 1; s += P("M-200 " + y + " C-80 " + y + " -20 " + f(y - (y < 0 ? 40 : 10) * bend) + " 200 " + f(y + 30 * bend), "#5fa8e0", 5, ' stroke-dasharray="26 18" stroke-dashoffset="' + f(-t * 140) + '" opacity=".8"'); } return s; }
  function topView(t, windA, yaw) { var s = R(-200, -200, 400, 400, "#e9dcb8", { sw: 0 }), wa = windA * Math.PI / 180;
    for (var i = 0; i < 4; i++) { var p = (t * 0.7 + i / 4) % 1, off = (i - 1.5) * 50, sx = -Math.cos(wa) * 150 + -Math.sin(wa) * off, sy = -Math.sin(wa) * 150 + Math.cos(wa) * off;
      s += '<g transform="translate(' + f(sx + Math.cos(wa) * p * 120) + ' ' + f(sy + Math.sin(wa) * p * 120) + ') rotate(' + f(windA) + ')" opacity="' + f(Math.sin(p * Math.PI)) + '">' + P("M-30 0 H20", "#2f7fc0", 9) + F("M30 0 L12 -14 L12 14 Z", "#2f7fc0", { sw: 2 }) + '</g>'; }
    s += '<g transform="rotate(' + f(yaw) + ')">' + R(-10, -30, 110, 60, "#f2f4f6", { rx: 18, sw: 4 }) + R(-34, -120, 22, 240, "#f2f4f6", { rx: 10, sw: 4 }) + C(-24, 0, 22, "#dfe4e8", { st: INK, sw: 4 }) + '</g>' + C(30, 0, 12, "#9aa2ac", { st: INK, sw: 2 });
    return s; }
  function erosion(t, coatK) { var s = R(-200, -200, 400, 400, "#cfe2f2", { sw: 0 }) + F("M200 -150 L-40 -150 Q-160 -150 -160 0 Q-160 150 -40 150 L200 150 Z", "url(#bladeG)", { sw: 5 });
    for (var i = 0; i < 12; i++) { var p = (t * 1.4 + hash(i)) % 1, y = -120 + hash(i + 4) * 240, x = lerp(-260, -150 + Math.abs(y) * 0.12, p); s += C(x, y, 9, "#5fa8e0", { op: 1 - p * 0.3 }) + (p > 0.92 ? C(x + 6, y, 18, "none", { st: "#5fa8e0", sw: 3 }) : ""); }
    for (var j = 0; j < 9; j++) { var py = -110 + j * 27, px = -156 + Math.abs(py) * 0.1; s += C(px + 6, py, 6, "#8a7a6a", { op: 1 - coatK }); }
    if (coatK > 0) s += P("M-60 -140 Q-158 -140 -158 0 Q-158 140 -60 140", "#e0703a", 22, ' opacity="' + f(coatK) + '" stroke-dasharray="' + f(560 * coatK) + ' 600"');
    return s; }
  function confetti(t) { var s = ""; for (var c = 0; c < 46; c++) { var p = (t * 0.45 + hash(c)) % 1, cx = hash(c + 2) * 1080 + Math.sin(t * 3 + c) * 30, cy = lerp(-40, 1500, p);
    s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="14" height="22" fill="' + ["#d8352a", "#f2c230", "#3aa05a", "#2f6f9f", "#9a5fb0"][c % 5] + '" transform="rotate(' + f(t * 260 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; } return s; }

  // ── the whole scene ──
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o), z = K.cam.z;
    IC = 0; MODE = { storm: h.storm || 0, dusk: h.dusk || 0, flash: h.flash || 0 };
    var s = village(t) + ground() + foundation({ pit: h.pit != null ? h.pit : (b.found ? 1 : 0), fill: h.fill != null ? h.fill : (b.found ? 1 : 0), rebar: h.rebar });
    if (h.wind) s += h.wind;
    s += earth(b) + transformer(560, h.trans != null ? h.trans : (b.trans ? 1 : 0)) + (h.cable || b.trans ? gridLine(t, { trans: h.trans != null ? h.trans >= 1 : b.trans, loss: h.loss }) : "");
    if (h.lamp != null) { var lg = clamp(h.lamp); s += P("M0 -400 Q-120 -260 -150 -150", INK, 4) + R(-160, -120, 20, 120, "#6a727c", { sw: 2 }) + C(-150, -140, 22, lg > 0.2 ? "#fff6c0" : "#d0d0d0", { st: INK, sw: 3 }) + (lg > 0 ? C(-150, -140, 170 * lg, "url(#bulb)", { op: lg }) : ""); }
    s += turbine(t, { grow: h.grow != null ? h.grow : (b.grow ? 1 : 0), big: h.big != null ? h.big : (b.big ? 1 : 0), sway: h.sway, cut: h.cut, gear: h.gear != null ? h.gear : (b.gear ? 1 : 0), brake: h.brake, vane: h.vane != null ? h.vane : (b.vane ? 1 : 0),
      beacon: b.beacon || h.beacon, pitch: h.pitch, shake: h.shake, coat: h.coat != null ? h.coat : (b.coat ? 1 : 0), trail: h.trail, glowB: h.glowB, glow: h.glow, ang: h.ang, cut2: h.cut2, yawGlow: h.yawGlow });
    if (h.truck != null) s += truck(1050, t, h.truck);
    return s; }
  var guy = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.54; if (k[1].home) { k[1].outfit = "casual"; } else if (k[1].vest == null) { k[1].vest = 1; k[1].hat = 1; } }); return K.act(u, Ks, t); };
  function W(t, z, list) { var s = ""; list.forEach(function (l) { s += wind(t, l[0], l[1], l[2], l[3], l[4] || 6, "#ffffff", z); }); return s; }

  K.steps([[2, { grow: 1 }], [4, { found: 1 }], [6, { big: 1 }], [8, { gear: 1 }], [10, { vane: 1 }], [14, { trans: 1 }], [17, { coat: 1 }], [19, { rod: 1 }], [20, { beacon: 1 }]]);
  var ROOFY = NT;

  // 0 — a fan on a pole, wired to a motor: electricity from the wind
  shot(0, [-60, -300, 1.25], [-40, -260, 1.1], function (u, d, t) {
    var z = K.cam.z, spin = rotorSpd(t), s = scene(t, {}, { grow: 0, lamp: clamp((u - 1.6) / 0.5), wind: W(t, z, [[-700, 600, -420, 260, 5], [-700, 600, -250, 230, 4]]) });
    s += guy(u, [[0, { x: -300, y: 0, f: 1, p: "push", mood: "n", home: 1 }], [1.3, { x: -300, y: 0, f: 1, p: "point", mood: "n", home: 1 }], [2.4, { x: -300, y: 0, f: 1, p: "thumbs", mood: "happy", home: 1 }]], t);
    return s + scr(pill("مروحة", 640, 520, u, 0.4) + pill("موتور", 760, 760, u, 1.0) + pill("كهربا!", 330, 900, u, 2.0, { col: "#ffd23a" }));
  });
  // 1 — but near the ground it barely turns: houses and trees break the wind
  shot(1, [-520, -420, 0.72], [-380, -360, 0.82], function (u, d, t) {
    var z = K.cam.z, s = scene(t, {}, { grow: 0, lamp: 0.2 + 0.3 * Math.abs(Math.sin(t * 7)), wind: W(t, z, [[-2600, -1800, -500, 500, 6], [-2600, -1800, -300, 500, 5]]) + swirl(-1300, -800, 90, t, z) + swirl(-850, -900, 70, -t, z) + swirl(-200, -380, 60, t * 1.3, z) + W(t, z, [[-1400, 400, -900, 160, 4]]) });
    s += guy(u, [[0, { x: -300, y: 0, f: 1, p: "stand", mood: "n", home: 1 }], [1.2, { x: -300, y: 0, f: 1, p: "pointUp", mood: "worry", home: 1 }], [2.8, { x: -300, y: 0, f: 1, p: "shock", mood: "shock", home: 1 }], [4.8, { x: -300, y: 0, f: 1, p: "cover", mood: "worry", home: 1 }]], t);
    return s + scr(pill("البيوت بتكسر الهوا", 420, 380, u, 0.8, { bg: "#c7321f", sz: 36 }) + xmark(760, 820, u, 2.4, 0.8));
  });
  // 2 — so you raise the tower to about 100 m: up there the wind is faster, twice the speed = eight times the power
  shot(2, [0, -420, 0.9], [0, -4700, 0.155], function (u, d, t) {
    var z = K.cam.z, g = clamp((u - 0.3) / 3.6), hgt = towerH(g);
    var s = scene(t, {}, { grow: g, wind: W(t, z, [[-3000, 3000, -500, 300, 5], [-3000, 3000, -hgt * 0.5 - 200, 900, 6], [-3000, 3000, -hgt - 300, 1900, 8]]) });
    s += guy(u, [[0, { x: -340, y: 0, f: 1, p: "stand", mood: "n" }], [1.0, { x: -340, y: 0, f: 1, p: "pointUp", mood: "n" }], [4.2, { x: -340, y: 0, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + scr(pill("100 متر", 760, 560, u, 3.6, { col: "#ffd23a" }) + pill("هوا ×2 = كهربا ×8", 540, 330, u, 4.6, { col: "#9fe8b0", sz: 38 }));
  });
  // 3 — but the wind pushes a 100 m tower from the top: it could snap like a matchstick
  shot(3, [0, -6400, 0.2], [0, -700, 0.5], function (u, d, t) {
    var sw = 420 * Math.sin(t * 2.6) * clamp(u / 0.8), s = scene(t, {}, { sway: sw, wind: W(t, K.cam.z, [[-3000, 3000, -7600, 2200, 8]]) });
    s += guy(u, [[0, { x: -480, y: 0, f: 1, p: "pointUp", mood: "worry" }], [2.0, { x: -480, y: 0, f: 1, p: "shock", mood: "shock" }], [3.3, { x: -500, y: 0, f: 1, p: "cover", mood: "shock" }]], t);
    return s + scr(pill("هيقع!", 640, 420, u, 1.0, { bg: "#c7321f", sz: 52 }) + xmark(800, 640, u, 1.4, 0.8));
  });
  // 4 — so you dig under it and pour a concrete foundation weighing over 1,000 tonnes
  shot(4, [180, -120, 0.42], [120, -220, 0.5], function (u, d, t) {
    var pit = clamp(u / 0.6), fill = clamp((u - 1.0) / 2.6), s = scene(t, {}, { pit: pit, fill: fill, rebar: 1, truck: fill > 0 && fill < 1 ? 1 : 0 });
    s += guy(u, [[0, { x: -900, y: 0, f: 1, p: "dig", mood: "n", rate: 1.4 }], [2.6, { x: -900, y: 0, f: 1, p: "dig", mood: "n" }], [3.3, { x: -900, y: 0, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + scr(pill("أساس خرسانة", 540, 380, u, 0.8, { col: "#ffd23a" }) + pill("+1000 طن", 540, 500, u, 2.6, { col: "#9fe8b0" }));
  });
  // 5 — but the little fan with its short blades catches very little wind
  shot(5, [160, -8260, 0.75], [100, -8250, 0.85], function (u, d, t) {
    var z = K.cam.z, s = scene(t, {}, { wind: W(t, z, [[-2200, 1600, -8500, 900, 7], [-2200, 1600, -7900, 900, 7]]) });
    s += guy(u, [[0, { x: 420, y: ROOFY, f: -1, p: "stand", mood: "n" }], [1.0, { x: 420, y: ROOFY, f: -1, p: "point", mood: "n" }], [2.2, { x: 420, y: ROOFY, f: -1, p: "shrug", mood: "worry" }]], t);
    return s + scr(pill("ريش قصيرة = هوا قليل", 540, 380, u, 0.6, { bg: "#c7321f", sz: 36 }) + xmark(300, 640, u, 1.6, 0.7));
  });
  // 6 — so you fit three blades, each over 50 m long, shaped like an aircraft wing
  shot(6, [-100, -8220, 0.62], [-300, -7000, 0.13], function (u, d, t) {
    var z = K.cam.z, bg = clamp((u - 0.3) / 2.9), s = scene(t, {}, { big: bg });
    s += guy(u, [[0, { x: 420, y: ROOFY, f: -1, p: "push", mood: "n" }], [2.4, { x: 420, y: ROOFY, f: -1, p: "cheer", mood: "happy" }]], t);
    var foil = airfoil(-6, 1.1) + flowLines(t, 1) + K.arrowV(0, -40, -150, "#3aa05a", 12, clamp((u - 3.8) / 0.5));
    return s + scr(pill("+50 متر", 760, 820, u, 2.4, { col: "#ffd23a" }) + inset(540, 600, 200, clamp((u - 3.0) / 0.4), foil) + pill("زي جناح الطيارة", 540, 340, u, 3.4, { col: "#9fe8b0", sz: 36 }));
  });
  // 7 — but these big blades turn about 15 times a minute, and the generator needs about 1,500
  shot(7, [260, -8180, 0.95], [300, -8170, 1.05], function (u, d, t) {
    var s = scene(t, {}, { cut: 1, gear: 0 });
    s += guy(u, [[0, { x: 700, y: NB - 26, f: -1, p: "stand", mood: "n" }], [1.0, { x: 700, y: NB - 26, f: -1, p: "point", mood: "n" }], [3.6, { x: 700, y: NB - 26, f: -1, p: "worry", mood: "worry" }]], t);
    return s + scr(pill("15 لفة/دقيقة", 260, 520, u, 0.6, { col: "#ffd23a", sz: 36 }) + pill("المولّد: 1500؟", 800, 520, u, 2.6, { bg: "#c7321f", sz: 36 }) + xmark(560, 760, u, 3.4, 0.6));
  });
  // 8 — so you put gears between them that multiply the speed about 100 times: the gearbox
  shot(8, [240, -8180, 1.05], [220, -8170, 0.95], function (u, d, t) {
    var s = scene(t, { gear: 1 }, { cut: 1, gear: clamp((u - 0.2) / 1.2) });
    s += ring(230, -8150, 170, u, 1.4, t);
    s += guy(u, [[0, { x: 700, y: NB - 26, f: -1, p: "reach", mood: "n" }], [2.2, { x: 700, y: NB - 26, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + scr(pill("الجيربوكس", 520, 520, u, 1.4, { col: "#ffd23a" }) + pill("× 100", 520, 640, u, 2.0, { col: "#9fe8b0" }));
  });
  // 9 — but the wind isn't steady: every little while it comes from another side
  shot(9, [250, -8250, 0.7], [200, -8250, 0.78], function (u, d, t) {
    var wa = lerp(0, 70, ease(clamp((u - 0.3) / 1.2))), s = scene(t, {}, {});
    s += guy(u, [[0, { x: 420, y: ROOFY, f: -1, p: "stand", mood: "n" }], [1.2, { x: 420, y: ROOFY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + scr(inset(760, 560, 200, clamp(u / 0.4), topView(t, wa, 0)) + pill("الهوا لف!", 300, 380, u, 0.8, { bg: "#c7321f" }) + xmark(900, 760, u, 1.6, 0.55));
  });
  // 10 — so a sensor on top measures the wind's direction, and a motor turns the whole head to face it
  shot(10, [260, -8300, 0.75], [200, -8250, 0.62], function (u, d, t) {
    var yaw = lerp(0, 70, ease(clamp((u - 1.6) / 1.6))), s = scene(t, { vane: 1 }, { vane: clamp((u - 0.2) / 0.5), yawGlow: u > 1.6 && u < 3.3 });
    s += guy(u, [[0, { x: 300, y: ROOFY, f: 1, p: "reach", mood: "n" }], [1.4, { x: 300, y: ROOFY, f: 1, p: "point", mood: "n" }], [3.2, { x: 300, y: ROOFY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + scr(pill("بيقيس اتجاه الهوا", 640, 330, u, 0.6, { col: "#ffd23a", sz: 34 }) + inset(760, 640, 190, clamp((u - 1.4) / 0.4), topView(t, 70, yaw)) + (u > 3.2 ? vmark(900, 820, u, 3.2, 0.6) : ""));
  });
  // 11 — but if a storm comes, the blades spin crazily fast and break
  shot(11, [-220, -8050, 0.32], [-260, -8150, 0.37], function (u, d, t) {
    var st = clamp(u / 0.6), s = scene(t, {}, { storm: st, shake: 6 * st, wind: W(t, K.cam.z, [[-5000, 3000, -9500, 3200, 12], [-5000, 3000, -7000, 3200, 12]]) });
    s += guy(u, [[0, { x: 380, y: ROOFY, f: -1, p: "shock", mood: "shock" }], [1.4, { x: 380, y: ROOFY, f: -1, p: "cover", mood: "shock" }]], t);
    return s + scr(weather(t) + pill("هتتكسر!", 540, 380, u, 1.2, { bg: "#c7321f", sz: 52 }) + xmark(820, 600, u, 1.6, 0.8));
  });
  // 12 — so above 90 km/h each blade turns on itself and gives its edge to the wind, and brakes stop everything
  shot(12, [-200, -8100, 0.36], [150, -8180, 0.62], function (u, d, t) {
    var pk = ease(clamp((u - 0.8) / 1.6)), s = scene(t, {}, { storm: lerp(1, 0.6, clamp(u / 6)), pitch: lerp(1, 0.32, pk), brake: u > 3.6 && u < 6, cut: u > 3.4 ? 1 : 0, wind: W(t, K.cam.z, [[-5000, 3000, -9000, 3000, 10]]) });
    var pv = airfoil(lerp(0, 82, pk), 1) + flowLines(t, lerp(1, 0, pk));
    s += guy(u, [[0, { x: 380, y: ROOFY, f: -1, p: "cover", mood: "worry" }], [2.4, { x: 380, y: ROOFY, f: -1, p: "point", mood: "n" }], [4.8, { x: 380, y: ROOFY, f: -1, p: "breathe", mood: "happy" }]], t);
    return s + scr(weather(t) + pill("+90 كم/س", 300, 330, u, 0.4, { col: "#ffd23a" }) + inset(760, 560, 180, clamp((u - 0.6) / 0.4) * (u < 3.4 ? 1 : clamp((3.8 - u) / 0.4)), pv) + pill("فرامل", 540, 380, u, 3.8, { col: "#9fe8b0" }));
  });
  // 13 — but the generator gives about 690 volts, and sent a long way the power is lost in the wire
  shot(13, [640, -300, 0.55], [800, -280, 0.58], function (u, d, t) {
    var s = scene(t, {}, { cable: 1, trans: 0, loss: clamp((u - 1.4) / 1.2) });
    s += guy(u, [[0, { x: 380, y: 0, f: 1, p: "point", mood: "n" }], [2.4, { x: 380, y: 0, f: 1, p: "point", mood: "n" }], [3.6, { x: 380, y: 0, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + scr(pill("690 فولت", 420, 620, u, 0.6, { col: "#ffd23a" }) + pill("بتضيع في السلك!", 680, 380, u, 2.2, { bg: "#c7321f", sz: 36 }));
  });
  // 14 — so a transformer at the foot of the tower raises it to thousands of volts: the step-up transformer
  shot(14, [700, -340, 0.6], [760, -320, 0.55], function (u, d, t) {
    var tk = clamp((u - 0.2) / 1.2), s = scene(t, { trans: 1 }, { cable: 1, trans: tk });
    s += ring(670, -110, 170, u, 1.3, t);
    s += guy(u, [[0, { x: 400, y: 0, f: 1, p: "reach", mood: "n" }], [1.6, { x: 400, y: 0, f: 1, p: "push", mood: "n" }], [3.0, { x: 400, y: 0, f: 1, p: "thumbs", mood: "happy" }], [4.6, { x: 400, y: 0, f: 1, p: "cheer", mood: "proud" }]], t);
    return s + scr(pill("محوّل الرفع", 520, 420, u, 1.2, { col: "#ffd23a" }) +  pill("آلاف الفولت", 760, 560, u, 2.6, { col: "#9fe8b0" }));
  });
  // 15 — the odd thing: many people think the blades turn slowly
  shot(15, [100, -8100, 0.6], [60, -8150, 0.66], function (u, d, t) {
    var s = scene(t, {}, {});
    s += guy(u, [[0, { x: 320, y: ROOFY, f: -1, p: "thumbs", mood: "happy" }], [1.4, { x: 320, y: ROOFY, f: -1, p: "point", mood: "happy" }]], t);
    return s + scr(pill("بتلف براحة؟", 540, 360, u, 0.5, { sz: 44 }));
  });
  // 16 — really the blade tip runs at about 300 km/h, faster than any car on the street
  shot(16, [-300, -8160, 0.2], [160, -8260, 0.52], function (u, d, t) {
    var s = scene(t, {}, { trail: clamp((u - 0.4) / 0.6) });
    s += guy(u, [[0, { x: 320, y: ROOFY, f: -1, p: "point", mood: "n" }], [1.8, { x: 320, y: ROOFY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + scr(pill("300 كم/س", 540, 360, u, 1.2, { bg: "#c7321f", sz: 56 }) + pill("أسرع من أي عربية", 540, 500, u, 3.0, { col: "#ffd23a", sz: 36 }));
  });
  // 17 — so you coat the blade's edge, because raindrops and sand grains hit it like bullets
  shot(17, [-300, -7500, 0.85], [-360, -7300, 1.1], function (u, d, t) {
    var ck = clamp((u - 1.4) / 3.2), s = scene(t, {}, { coat: ck });
    s += P("M-160 " + (NT + 10) + " L-470 -7330", "#e2b035", 5) + guy(u, [[0, { hip: [-470, -7250], f: 1, p: "caulk", mood: "n" }], [4.2, { hip: [-470, -7250], f: 1, p: "caulk", mood: "n" }], [5.0, { hip: [-470, -7250], f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + scr(inset(780, 560, 190, clamp((u - 0.3) / 0.4), erosion(t, ck)) + pill("زي الرصاص!", 780, 330, u, 0.9, { bg: "#c7321f", sz: 36 }) + pill("طبقة حماية", 300, 400, u, 2.2, { col: "#ffd23a" }));
  });
  // 18 — but the tower is the tallest thing around, and lightning looks for it
  shot(18, [-1500, -8900, 0.26], [-1350, -8800, 0.29], function (u, d, t) {
    var bolt = u > 1.0 && u < 1.8, a0 = rotorAng(t), tipA = (a0 + 240) * Math.PI / 180, tx = HX + BL * Math.sin(tipA), ty = HY - BL * Math.cos(tipA);
    var s = scene(t, {}, { storm: clamp(u / 0.5), flash: bolt ? Math.abs(Math.sin(u * 30)) : 0, glowB: 2, glow: bolt ? 1 : 0 });
    if (bolt) s += P("M" + f(tx - 900) + " " + f(ty - 4200) + " L" + f(tx - 300) + " " + f(ty - 2600) + " L" + f(tx - 700) + " " + f(ty - 2100) + " L" + f(tx) + " " + f(ty), "#fff7b0", 60) + P("M" + f(tx - 900) + " " + f(ty - 4200) + " L" + f(tx - 300) + " " + f(ty - 2600) + " L" + f(tx - 700) + " " + f(ty - 2100) + " L" + f(tx) + " " + f(ty), "#ffe46a", 26);
    s += guy(u, [[0, { x: 320, y: ROOFY, f: -1, p: "pointUp", mood: "worry" }], [1.0, { x: 320, y: ROOFY, f: -1, p: "cover", mood: "shock" }]], t);
    return s + scr(weather(t) + pill("صاعقة!", 540, 380, u, 1.1, { bg: "#c7321f", sz: 52 }));
  });
  // 19 — so a metal piece at each blade tip catches the strike, and a cable takes it down to earth
  shot(19, [-3600, -10000, 0.7], [380, -260, 0.5], function (u, d, t) {
    var a0 = rotorAng(t), tipA = (a0 + 240) * Math.PI / 180, tx = HX + BL * Math.sin(tipA), ty = HY - BL * Math.cos(tipA), gl = clamp((u - 1.2) / 0.6);
    var s = scene(t, { rod: 1 }, { storm: clamp(0.6 - u / 3), glowB: 2, glow: gl });
    if (gl) { var p = clamp((u - 1.2) / 2.4); s += P("M" + HX + " " + HY + " L0 " + NB + " L0 -10 L251 -10 L251 690", "#ffe46a", 30, ' opacity=".85" stroke-dasharray="' + f(p * 11000) + ' 12000"'); }
    s += C(tx, ty, 60 + 8 * Math.sin(t * 9), "none", { st: "#ffd23a", sw: 14 });
    s += guy(u, [[0, { x: 560, y: 0, f: -1, p: "stand", mood: "n" }], [3.4, { x: 560, y: 0, f: -1, p: "point", mood: "n" }], [4.4, { x: 560, y: 0, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + scr(pill("بتمسك الصاعقة", 540, 360, u, 0.3, { col: "#ffd23a" }) + pill("سلك للأرض", 540, 380, u, 3.6, { col: "#9fe8b0" }));
  });
  // 20 — what's left: a ladder inside the tower for the technician, and a red light on top so planes see it
  shot(20, [0, -900, 0.55], [60, -7900, 0.5], function (u, d, t) {
    var s = scene(t, { beacon: 1 }, { cut2: 1, beacon: u > 2.4 });
    var hy = lerp(-420, -7420, ease(u / d));
    s += guy(u, [[0, { hip: [0, hy], f: 1, p: "climb", mood: "n", rate: 2 }]], t);
    var plane = u > 2.6 ? '<g transform="translate(' + f(lerp(1200, -200, clamp((u - 2.6) / 2))) + ' 300) scale(-1 1)">' + F("M-60 0 L60 -6 L80 0 L60 6 Z", "#eef1f4", { sw: 3 }) + F("M0 0 L-20 -40 L-6 -40 L20 0 Z", "#dfe4e8", { sw: 2 }) + '</g>' : "";
    return s + scr(plane + pill("سلّم جوه البرج", 540, 380, u, 0.5, { col: "#ffd23a" }) + pill("لمبة حمرا", 760, 640, u, 2.8, { bg: "#c7321f" }));
  });
  // 21 — congratulations, you built a wind turbine yourself
  shot(21, [200, -8300, 0.6], [-300, -6300, 0.14], function (u, d, t) {
    var s = scene(t, {}, { dusk: clamp(u / 2) });
    s += guy(u, [[0, { x: 300, y: ROOFY, f: -1, p: "cheer", mood: "happy" }], [1.6, { x: 300, y: ROOFY, f: -1, p: "thumbs", mood: "proud" }]], t);
    return s + scr(confetti(t) + pill("مبروك!", 540, 380, u, 0.3, { col: "#9fe8b0", sz: 60 }));
  });
  // 22 — outro
  shot(22, [200, -8350, 0.75], [240, -8350, 0.8], function (u, d, t) {
    var s = scene(t, {}, { dusk: 1 });
    s += guy(u, [[0, { x: 300, y: ROOFY, f: -1, p: "wave", mood: "happy" }]], t);
    return s + scr(pill("قولولنا!", 540, 380, u, 0.3, { col: "#ffd23a", sz: 60 }));
  });
  window.__wind = { scene: scene, rotorAng: rotorAng };
})();
