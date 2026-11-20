/* «تعمل سكة حديد القطر السريع إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   The Egyptian desert between Sokhna and Matrouh. Three views of the same railway, all at real scale (1 m ≈ 150 units,
   the man 1.75 m at scale 0.7):
   SIDE  (lines 0–2 and 9–23): the track seen from the side, cut open below the sand, growing from a crate on rubber
         wheels to welded rail on ballast, then the Velaro-style train, the overhead wire, the fence and road bridge, the station;
   END   (lines 3–8): looking along the track: rails, the sleeper holding the gauge, the ballast, the wheelset and its cone;
   CARDS (lines 7, 8, 13, 14, 16): top-view / cab-screen cards floating over the scene, the man reacting below them. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.7; }); return K.act(u, Ks, t); }, pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY, SLT = GY - 78, RT = GY - 104, RT0 = GY - 26, WR = 69, X0 = 600;

  // ── backdrop: desert sky with far mountains, the sand cut open ──
  function back(t, h) { return K.sky(t, h && h.night, { far: "desert" }) + K.ground(t, { sand: 1 }); }

  // ── SIDE view ──
  // the crate cart: a wooden crate on four rubber (or steel flanged) wheels; y = where the wheels touch
  function cart(x, y, o) { o = o || {}; var s = "", sink = clamp(o.sink || 0), yy = y + sink * 40, r = 38;
    s += '<g filter="url(#sh)">' + R(x - 130, yy - 2 * r - 150, 260, 150, "url(#crate)", { rx: 6 }) + '</g>';
    s += P("M" + (x - 130) + " " + f(yy - 2 * r - 100) + " h260 M" + (x - 130) + " " + f(yy - 2 * r - 50) + " h260 M" + (x - 60) + " " + f(yy - 2 * r - 150) + " v150 M" + (x + 60) + " " + f(yy - 2 * r - 150) + " v150", "#8a5a2a", 3);
    s += R(x - 140, yy - 2 * r - 8, 280, 14, "#5a4a3a", { sw: 2 });
    [-80, 80].forEach(function (dx) { var cx = x + dx, cy = yy - r, a = (o.roll || 0) / r;
      if (o.steel) s += C(cx, cy, r + 8, "#4a4e56", { st: INK, sw: 3 }) + C(cx, cy, r, "url(#wheelG)", { st: INK, sw: 3 });
      else s += C(cx, cy, r, "url(#tyre)", { st: INK, sw: 3 }) + C(cx, cy, r * 0.5, "#9aa2ac", { st: INK, sw: 2 });
      s += P("M" + f(cx) + " " + f(cy) + " L" + f(cx + Math.cos(a) * r * 0.45) + " " + f(cy + Math.sin(a) * r * 0.45), INK, 4); });
    if (sink > 0) for (var i = -1; i <= 1; i += 2) s += F("M" + f(x - 150 + (i + 1) * 70) + " " + GY + " q40 " + f(-22 * sink) + " 80 0 Z", "#e2b878", { sw: 2 }) + F("M" + f(x - 10 + (i + 1) * 70 - 70) + " " + GY + " q30 " + f(-16 * sink) + " 60 0 Z", "#e2b878", { sw: 2 });
    return s; }
  // rails lying straight on the sand (line 2)
  function looseRails(k) { var dx = (1 - ease(k)) * 1600; return R(-800 + dx, RT0 - 6, 2700, 12, "#8a8f96", { sw: 2, op: 0.7 }) + R(-800 + dx, RT0, 2700, 26, "url(#rail)", { sw: 3 }); }
  var JX = [-660, -60, 540, 1140, 1740];
  // the full track from the side: ballast bank, sleeper ends, the rail; o.joints = gap width (0 = welded), o.bead = weld marks
  function track(t, o) { o = o || {}; var s = "";
    s += F("M-800 " + (GY + 40) + " L-800 " + (GY - 62) + " L1900 " + (GY - 62) + " L1900 " + (GY + 40) + " Z", "url(#ballast)", { sw: 3 });
    for (var i = 0; i < 160; i++) { var bx = -800 + hash(i + 300) * 2700, by = GY - 56 + hash(i + 310) * 90, br = 6 + hash(i + 320) * 8; s += '<ellipse cx="' + f(bx) + '" cy="' + f(by) + '" rx="' + f(br * 1.3) + '" ry="' + f(br) + '" fill="' + (hash(i + 330) > 0.5 ? "#b4aea4" : "#7c766c") + '" stroke="#4a463f" stroke-width="1.6"/>'; }
    for (var x = -790; x < 1900; x += 90) s += R(x, SLT, 44, 34, "url(#sleeper)", { sw: 2.4 });
    var g = o.joints || 0;
    if (g > 0) { var xs = [-800].concat(JX.map(function (j) { return j - g / 2; })), xe = JX.map(function (j) { return j + g / 2; });
      for (var n = 0; n < JX.length; n++) s += R(xs[n] + (n ? g : 0), RT, JX[n] - g / 2 - (xs[n] + (n ? g : 0)), 26, "url(#rail)", { sw: 3 });
      s += R(JX[JX.length - 1] + g / 2, RT, 1900 - JX[JX.length - 1] - g / 2, 26, "url(#rail)", { sw: 3 });
      JX.forEach(function (j) { s += R(j - 46, RT + 8, 92, 14, "#6a6e76", { sw: 2, rx: 3 }) + C(j - 30, RT + 15, 3.5, "#2a2a2a") + C(j - 12, RT + 15, 3.5, "#2a2a2a") + C(j + 12, RT + 15, 3.5, "#2a2a2a") + C(j + 30, RT + 15, 3.5, "#2a2a2a"); }); }
    else { s += R(-800, RT, 2700, 26, "url(#rail)", { sw: 3 }); if (o.bead) JX.forEach(function (j) { s += R(j - 10, RT - 3, 20, 31, "#8a8f96", { sw: 2, rx: 6, op: 0.85 }); }); }
    s += P("M-800 " + (RT + 3) + " H1900", "#fff", 2.4, ' opacity=".55"');
    return s; }
  // the train: two white cars and a long nose (moving right, x = nose tip); o.panto 0…1 raised; o.lit windows; o.blur speed
  function wheel(cx, cy, a) { return C(cx, cy, WR + 7, "#3e424a", { st: INK, sw: 3 }) + C(cx, cy, WR, "url(#wheelG)", { st: INK, sw: 3 }) + C(cx, cy, 20, "#5a6068", { st: INK, sw: 2 }) + P("M" + f(cx) + " " + f(cy) + " L" + f(cx + Math.cos(a) * 52) + " " + f(cy + Math.sin(a) * 52), "#3a3e46", 6); }
  function bogie(cx, a) { var cy = RT - WR; return R(cx - 260, cy - 34, 520, 40, "#3a3e46", { rx: 10, sw: 3 }) + wheel(cx - 187, cy, a) + wheel(cx + 187, cy, a) + R(cx - 40, cy - 70, 80, 40, "#4a4e56", { sw: 2 }); }
  var CAR = 3750, TOP = RT - 585, BOT = RT - 165;
  function train(x, t, o) { o = o || {}; var s = "", a = (o.roll != null ? o.roll : x) / WR, x0 = x - 2 * CAR;
    for (var c = 0; c < 2; c++) { var cx0 = x0 + c * CAR; s += bogie(cx0 + 620, a) + bogie(cx0 + CAR - 620, a); }
    var nose = "M" + f(x0) + " " + f(TOP + 20) + " Q" + f(x0) + " " + TOP + " " + f(x0 + 30) + " " + TOP + " L" + f(x - 1500) + " " + TOP + " C" + f(x - 700) + " " + TOP + " " + f(x - 160) + " " + f(TOP + 200) + " " + f(x) + " " + f(BOT - 70) + " Q" + f(x + 10) + " " + f(BOT) + " " + f(x - 60) + " " + BOT + " L" + f(x0) + " " + BOT + " Z";
    s += '<g filter="url(#sh)">' + F(nose, "url(#trainB)", { sw: 4 }) + '</g>';
    s += R(x0, BOT - 46, 2 * CAR - 60, 22, "#c7321f", { sw: 0 }) + R(x0, BOT - 22, 2 * CAR - 60, 22, "#2a2e36", { sw: 0 });
    for (var w = 0; w < 26; w++) { var wx = x0 + 160 + w * 270; if (wx > x - 1500) break; if ((wx - x0) % CAR > CAR - 300) continue; s += R(wx, TOP + 120, 180, 110, o.lit ? "#ffe9a8" : "url(#glass)", { rx: 18, sw: 3 }); }
    for (var d = 0; d < 2; d++) { var dx = x0 + d * CAR + CAR - 210; if (dx < x - 1600) s += R(dx, TOP + 90, 110, BOT - TOP - 150, "#d9dee4", { rx: 8, sw: 3 }); }
    for (var j = 1; j < 2; j++) s += P("M" + f(x0 + j * CAR) + " " + TOP + " V" + BOT, "#9aa2ac", 6);
    s += F("M" + f(x - 980) + " " + f(TOP + 60) + " C" + f(x - 560) + " " + f(TOP + 64) + " " + f(x - 300) + " " + f(TOP + 150) + " " + f(x - 200) + " " + f(TOP + 230) + " L" + f(x - 700) + " " + f(TOP + 230) + " Z", "url(#glass)", { sw: 3 });
    s += C(x - 70, BOT - 110, 16, o.lamp === false ? "#cfcfcf" : "#fff6c0", { st: INK, sw: 2.4 }) + (o.lamp === false ? "" : C(x + 20, BOT - 110, 70, "url(#bulb)", { op: 0.8 }));
    s += T("إيه الحكاية؟", x0 + 1400, TOP + 330, 70, "#c7321f", { w: 900 });
    if (o.panto != null) { var pk = clamp(o.panto), px = x - 1560, hgt = lerp(40, 215, ease(pk)), hx = 120;
      s += R(px - 60, TOP - 18, 120, 18, "#4a4e56", { sw: 2 }) + P("M" + (px - 40) + " " + (TOP - 18) + " L" + f(px + hx * (1 - pk * 0.4)) + " " + f(TOP - 18 - hgt / 2) + " L" + (px - 10) + " " + f(TOP - 18 - hgt), "#2a2e36", 7) + R(px - 90, f(TOP - 26 - hgt), 160, 10, "#2a2e36", { sw: 2, rx: 4 }); }
    if (o.blur) for (var b = 0; b < 9; b++) { var by = TOP + 40 + b * 50, bl = 300 + hash(b + 5) * 500, bx = x0 + ((t * 2400 + hash(b) * 4000) % (2 * CAR)); s += P("M" + f(bx) + " " + f(by) + " h" + f(bl), "#fff", 6, ' opacity="' + f(0.5 * clamp(o.blur)) + '"'); }
    return s; }
  // the overhead line: masts, the contact wire RT−800 and the catenary RT−920 with droppers; k = how much is built
  var MX = [-260, 640, 1540], CW = RT - 800;
  function wires(t, k, live) { var s = "", k1 = clamp(k * 1.6), k2 = clamp(k * 1.6 - 0.6);
    MX.forEach(function (mx, i) { var mk = clamp(k1 * 3 - i * 0.5); if (mk <= 0) return; var top = lerp(GY, RT - 1000, ease(mk));
      s += '<g filter="url(#sh)">' + R(mx - 16, top, 32, GY - top, "url(#steelW)", { sw: 3 }) + '</g>' + R(mx - 40, GY - 20, 80, 30, "url(#conc)", { sw: 2 });
      if (mk > 0.9) s += P("M" + mx + " " + (RT - 940) + " h60 M" + mx + " " + (CW - 20) + " h60", "#5a6068", 8) + R(mx + 50, RT - 960, 14, 40, "#8a5a30", { sw: 2, rx: 4 }); });
    if (k2 > 0) { var xe = lerp(-800, 1900, ease(k2)), cat = "M-800 " + (RT - 930);
      for (var m = 0; m < MX.length; m++) cat += " Q" + (MX[m] - 450) + " " + (RT - 870) + " " + MX[m] + " " + (RT - 930); cat += " Q" + (MX[2] + 300) + " " + (RT - 870) + " 1900 " + (RT - 930);
      s += '<clipPath id="cwk"><rect x="-800" y="-900" width="' + f(xe + 800) + '" height="3000"/></clipPath><g clip-path="url(#cwk)">' + P(cat, "#3a3e46", 4) + P("M-800 " + CW + " H1900", "#3a3e46", 5);
      for (var d = -780; d < 1900; d += 150) { var dy = RT - 930 + 60 * (1 - Math.pow(((d - MX[0] + 900 * 10) % 900) / 450 - 1, 2)); s += P("M" + d + " " + f(dy) + " V" + CW, "#5a6068", 2); }
      s += '</g>';
      if (live) for (var q = 0; q < 8; q++) { var qx = -800 + ((t * 600 + q * 340) % 2700); s += C(qx, CW, 7, "#ffe46a", { st: INK, sw: 1.2 }); } }
    return s; }
  // the safety fence along the near side, k = raised
  function fence(k) { if (k <= 0) return ""; var s = "", top = GY - 260 * ease(k);
    s += '<g opacity=".92">'; for (var x = -780; x < 1900; x += 160) s += R(x, top, 12, GY - top, "#6a7078", { sw: 2 });
    var m = ""; for (var y = top + 30; y < GY; y += 36) m += "M-780 " + f(y) + " H1900 "; for (var xx = -780; xx < 1900; xx += 36) m += "M" + xx + " " + f(top) + " L" + (xx + 24) + " " + GY + " ";
    s += P(m, "#8a9098", 2, ' opacity=".55"') + R(-780, top - 6, 2680, 10, "#5a6068", { sw: 2 }) + '</g>'; return s; }
  // the road bridge over the line: two piers and a deck with its railing, a car on top; k = built
  function bridge(t, k, carX) { if (k <= 0) return ""; var s = "", dk = RT - 1040, kp = clamp(k * 2), kd = clamp(k * 2 - 1);
    [130, 1010].forEach(function (px) { var top = lerp(GY, dk + 60, ease(kp)); s += '<g filter="url(#sh)">' + R(px - 50, top, 100, GY - top, "url(#conc)", { sw: 3 }) + '</g>'; });
    if (kd > 0) { var y = lerp(dk - 600, dk, ease(kd)); s += '<g filter="url(#sh)">' + R(-40, y, 1220, 90, "url(#conc)", { sw: 3 }) + R(-40, y - 14, 1220, 16, "url(#asph)", { sw: 2 }) + '</g>';
      for (var r = -30; r < 1180; r += 40) s += P("M" + r + " " + f(y - 14) + " v-40", "#8a9098", 4); s += P("M-40 " + f(y - 54) + " H1180", "#8a9098", 6);
      if (carX != null) s += car(carX, y - 14, false); }
    return s; }
  // a small hatchback seen from the side (side road) or from behind (on the crossing)
  function car(x, y, rear) { var s = '<g filter="url(#sh)">';
    if (rear) s += R(x - 90, y - 120, 180, 96, "#2f6ea8", { rx: 18 }) + R(x - 70, y - 160, 140, 50, "#2f6ea8", { rx: 16 }) + R(x - 58, y - 152, 116, 34, "url(#glass)", { rx: 8, sw: 2 }) + R(x - 84, y - 84, 30, 16, "#e8452e", { rx: 4, sw: 2 }) + R(x + 54, y - 84, 30, 16, "#e8452e", { rx: 4, sw: 2 }) + R(x - 86, y - 30, 30, 34, "#1e1e22", { rx: 6, sw: 2 }) + R(x + 56, y - 30, 30, 34, "#1e1e22", { rx: 6, sw: 2 });
    else s += F("M" + (x - 150) + " " + (y - 30) + " L" + (x - 150) + " " + (y - 80) + " Q" + (x - 140) + " " + (y - 96) + " " + (x - 100) + " " + (y - 98) + " L" + (x - 60) + " " + (y - 150) + " L" + (x + 70) + " " + (y - 150) + " L" + (x + 120) + " " + (y - 96) + " Q" + (x + 150) + " " + (y - 90) + " " + (x + 152) + " " + (y - 60) + " L" + (x + 150) + " " + (y - 30) + " Z", "#2f6ea8") + F("M" + (x - 50) + " " + (y - 140) + " L" + (x + 60) + " " + (y - 140) + " L" + (x + 100) + " " + (y - 98) + " L" + (x - 84) + " " + (y - 98) + " Z", "url(#glass)", { sw: 2 }) + C(x - 90, y - 26, 26, "url(#tyre)", { st: INK, sw: 3 }) + C(x + 90, y - 26, 26, "url(#tyre)", { st: INK, sw: 3 });
    return s + '</g>'; }
  // a station: the platform at floor height in front of the line, the canopy, the name sign
  var PLT = RT - 170;
  function station(k, name) { if (k <= 0) return ""; var s = "", dy = (1 - ease(k)) * 500;
    s += '<g transform="translate(0 ' + f(dy) + ')" opacity="' + f(clamp(k * 2)) + '">';
    s += '<g filter="url(#sh)">' + R(-200, PLT, 1500, GY - PLT + 4, "url(#conc)", { sw: 3 }) + '</g>' + R(-200, PLT, 1500, 16, "#f2c230", { sw: 2 }) + R(-200, PLT + 16, 1500, 8, "#2a2e36", { sw: 0 });
    for (var c = 0; c < 4; c++) s += R(-80 + c * 400, PLT - 560, 22, 560, "#9aa2ac", { sw: 2 });
    s += F("M-200 " + (PLT - 560) + " L1300 " + (PLT - 560) + " L1260 " + (PLT - 620) + " L-160 " + (PLT - 620) + " Z", "#e9ebee", { sw: 3 });
    s += R(380, PLT - 520, 280, 70, "#1e5a8a", { rx: 10, sw: 3 }) + T(name || "العلمين", 520, PLT - 470, 44, "#fff");
    return s + '</g>'; }
  // a signal post beside the line (line 15)
  function signal(x) { return R(x - 8, GY - 640, 16, 640, "#5a6068", { sw: 2 }) + R(x - 36, GY - 760, 72, 150, "#1e2226", { rx: 14, sw: 3 }) + C(x, GY - 725, 18, "#3a1a1a") + C(x, GY - 650, 18, "#5ad07a", { st: "#fff", sw: 2 }); }
  // a radio mast with waves (line 16)
  function mast(x, t, k) { var s = R(x - 10, RT - 1100, 20, GY - RT + 1100, "#9aa2ac", { sw: 2 }) + P("M" + x + " " + (RT - 1100) + " v-60 M" + (x - 26) + " " + (RT - 1120) + " h52", "#5a6068", 6);
    for (var w = 0; w < 3; w++) { var p = (t * 0.9 + w / 3) % 1, r = 40 + p * 260; s += P("M" + f(x - r * 0.8) + " " + f(RT - 1150 + r * 0.6) + " A" + f(r) + " " + f(r) + " 0 0 0 " + f(x - r * 0.2) + " " + f(RT - 1150 + r * 0.98), "#2f6f9f", 8, ' opacity="' + f((1 - p) * k) + '"'); }
    return s; }
  function smoke(x, y, t, k) { var s = ""; for (var i = 0; i < 6; i++) { var p = (t * 0.45 + i / 6) % 1; s += C(x - p * 260 + Math.sin(t + i) * 20, y - p * 520, (50 + p * 140), "url(#smoke)", { op: (1 - p) * k }); } return s; }
  function barrel(x, y) { return '<g filter="url(#sh)">' + R(x - 50, y - 140, 100, 140, "#2a2e36", { rx: 10 }) + P("M" + (x - 50) + " " + (y - 100) + " h100 M" + (x - 50) + " " + (y - 40) + " h100", "#4a4e56", 5) + '</g>' + T("سولار", x, y - 60, 26, "#ffd23a"); }
  function sparks(x, y, t, k) { if (k <= 0) return ""; var s = C(x, y, 50 + 20 * Math.sin(t * 40), "url(#spark)", { op: k }); for (var i = 0; i < 6; i++) { var a = hash(i + Math.floor(t * 12)) * Math.PI * 2, l = 30 + hash(i + 3 + Math.floor(t * 12)) * 50; s += P("M" + x + " " + y + " l" + f(Math.cos(a) * l) + " " + f(Math.sin(a) * l), "#fff2a0", 4, ' opacity="' + f(k) + '"'); } return s; }

  // ── END view: looking along the track ──
  function railEnd(cx, by) { return F("M" + (cx - 20) + " " + by + " h40 v-6 h-16 v-10 h8 v-10 h-24 v10 h8 v10 h-16 Z", "url(#railV)", { sw: 2.4 }); }
  // o: spread 0…1, ties 0…1 (slid in), sink 0…1, bal 0…1, ws (wheelset), drop, cone, shift, load, skid
  function endView(t, o) { o = o || {}; var s = "", bal = ease(clamp(o.bal || 0)), sink = clamp(o.sink || 0) * (1 - bal);
    var tieTop = lerp(GY - 34, SLT, bal) + sink * 40, tie = clamp(o.ties || 0), tilt = sink * 5;
    if (bal > 0) { var bt = lerp(GY, SLT + 6, bal); s += '<g filter="url(#sh)">' + F("M" + (X0 - 440) + " " + (GY + 8) + " L" + (X0 - 270) + " " + f(bt) + " L" + (X0 + 270) + " " + f(bt) + " L" + (X0 + 440) + " " + (GY + 8) + " Z", "url(#ballast)") + '</g>';
      for (var i = 0; i < 90; i++) { var bx = X0 - 420 + hash(i + 50) * 840, by = lerp(bt + 6, GY, hash(i + 60)), edge = 270 + (by - bt) / (GY - bt + 1) * 170; if (Math.abs(bx - X0) > edge - 12) continue; var br = 6 + hash(i + 70) * 9; s += '<ellipse cx="' + f(bx) + '" cy="' + f(by) + '" rx="' + f(br * 1.3) + '" ry="' + f(br) + '" fill="' + (hash(i + 80) > 0.5 ? "#b4aea4" : "#7c766c") + '" stroke="#4a463f" stroke-width="1.6"/>'; } }
    if (o.pour > 0) for (var q = 0; q < 26; q++) { var pp = (t * 1.2 + hash(q + 90)) % 1, px = X0 - 300 + hash(q + 91) * 600, py = lerp(200, lerp(GY, SLT, bal), pp); s += C(px, py, 8 + hash(q) * 6, hash(q + 2) > 0.5 ? "#b4aea4" : "#7c766c", { st: "#4a463f", sw: 1.6, op: clamp(o.pour) }); }
    if (sink > 0) s += F("M" + (X0 - 260) + " " + GY + " q50 -26 90 0 M" + (X0 + 170) + " " + GY + " q50 -30 90 0", "#e2b878", { sw: 2 });
    var g = '<g transform="rotate(' + f(tilt) + ' ' + X0 + ' ' + f(tieTop) + ')">';
    if (tie > 0) g += '<g transform="translate(' + f((1 - ease(tie)) * -900) + ' 0)" filter="url(#sh)">' + R(X0 - 195, tieTop, 390, 34, "url(#sleeper)", { sw: 3, rx: 4 }) + '</g>';
    var base = tie > 0.6 ? tieTop : GY, sp = ease(clamp(o.spread || 0)) * 70, rl = X0 - 115 - sp, rr = X0 + 115 + sp;
    g += railEnd(rl, base) + railEnd(rr, base);
    if (tie > 0.6) g += R(rl - 30, base - 8, 14, 10, "#3a3e46", { sw: 1.5 }) + R(rl + 16, base - 8, 14, 10, "#3a3e46", { sw: 1.5 }) + R(rr - 30, base - 8, 14, 10, "#3a3e46", { sw: 1.5 }) + R(rr + 16, base - 8, 14, 10, "#3a3e46", { sw: 1.5 });
    if (o.ws) { var rtop = base - 26, sh = o.shift || 0, drop = ease(clamp(o.drop || 0)) * 70, wl = X0 - 115 + sh, wr = X0 + 115 + sh, cy = rtop - WR + drop, cone = clamp(o.cone || 0);
      // the load: a crate on a frame over the axle
      if (o.load) g += '<g filter="url(#sh)">' + R(X0 - 230 + sh, cy - 230, 460, 150, "url(#crate)", { rx: 6 }) + '</g>' + R(X0 - 240 + sh, cy - 86, 480, 20, "#5a4a3a", { sw: 2 });
      g += R(wl - 60, cy - 66, 18, 50, "#4a4e56", { sw: 2 }) + R(wr + 42, cy - 66, 18, 50, "#4a4e56", { sw: 2 });
      g += R(wl - 70, cy - 9, wr - wl + 140, 18, "url(#steelW)", { sw: 2.4 });
      [[wl, 1], [wr, -1]].forEach(function (w) { var x = w[0], inn = w[1], tw = 34, slope = lerp(2, 14, cone);   // inn: +1 = flange on the right (inner side)
        var xi = x + inn * tw / 2, xo = x - inn * tw / 2, bi = cy + WR + slope / 2, bo = cy + WR - slope / 2;
        g += F("M" + f(xo) + " " + f(cy - WR) + " L" + f(xi) + " " + f(cy - WR) + " L" + f(xi) + " " + f(bi) + " L" + f(xo) + " " + f(bo) + " Z", "url(#steelW)", { sw: 2.6 });
        g += F("M" + f(xi) + " " + f(cy - WR - 6) + " L" + f(xi + inn * 10) + " " + f(cy - WR - 6) + " L" + f(xi + inn * 10) + " " + f(bi + 20) + " Q" + f(xi + inn * 5) + " " + f(bi + 26) + " " + f(xi) + " " + f(bi + 14) + " Z", "#5a6068", { sw: 2.2 });
        if (cone > 0.3) g += P("M" + f(xo) + " " + f(bo) + " L" + f(xi) + " " + f(bi), "#ffd23a", 4, ' opacity="' + f(cone) + '"'); });
      if (o.skid) g += sparks(wr, rtop, t, clamp(o.skid)) + sparks(wl, rtop, t + 0.3, clamp(o.skid) * 0.7); }
    return s + g + '</g>'; }

  // ── CARDS: a top-view or screen card floating over the scene ──
  function card(x, y, w, h, u, u0, inner, title) { var k = clamp((u - u0) / 0.4); if (k <= 0) return "";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(K.pop(k)) + ')"><g filter="url(#sh)">' + R(-w / 2, -h / 2, w, h, "url(#card)", { rx: 28, sw: 5 }) + '</g>' + (title ? T(title, 0, -h / 2 + 52, 38, "#2a2522") : "") + '<g transform="translate(' + f(-w / 2) + ' ' + f(-h / 2) + ')">' + inner + '</g></g>'; }
  // a top-view track piece along a polyline/curve: two rails with sleepers
  function tvTrack(pts, gauge, col) { var s = "", L = []; for (var i = 0; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); L.push([a, b, dx / l, dy / l, l]); }
    L.forEach(function (sg) { for (var d = 0; d < sg[4]; d += 26) { var px = sg[0][0] + sg[2] * d, py = sg[0][1] + sg[3] * d; s += P("M" + f(px - sg[3] * gauge * 0.85) + " " + f(py + sg[2] * gauge * 0.85) + " L" + f(px + sg[3] * gauge * 0.85) + " " + f(py - sg[2] * gauge * 0.85), "#b9b4aa", 9); } });
    [-1, 1].forEach(function (sd) { var d = ""; pts.forEach(function (p, i) { var sg = L[Math.min(i, L.length - 1)]; d += (i ? " L" : "M") + f(p[0] + sd * -sg[3] * gauge / 2) + " " + f(p[1] + sd * sg[2] * gauge / 2); }); s += P(d, col || "#5a6068", 6); });
    return s; }
  function arcPts(cx, cy, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = lerp(a0, a1, i / n) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
  function along(pts, p) { var tot = 0, seg = []; for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    var d = clamp(p) * tot; for (var j = 0; j < seg.length; j++) { if (d <= seg[j]) { var k = d / seg[j]; return [lerp(pts[j][0], pts[j + 1][0], k), lerp(pts[j][1], pts[j + 1][1], k), Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0])]; } d -= seg[j]; } var q = pts[pts.length - 1]; return [q[0], q[1], 0]; }
  function tvTrain(q, len) { var a = q[2] * 180 / Math.PI; return '<g transform="translate(' + f(q[0]) + ' ' + f(q[1]) + ') rotate(' + f(a) + ')" filter="url(#sh)">' + F("M" + f(-len) + " -22 L-40 -22 Q0 -22 14 0 Q0 22 -40 22 L" + f(-len) + " 22 Z", "#fff", { sw: 3 }) + R(-len, -6, len - 30, 12, "#c7321f", { sw: 0 }) + '</g>'; }
  // the curve card: inner and outer rail of a bend; o.train 0…1 along it, o.ok
  function curveCard(u, o) { var s = "", cx = 150, cy = 530, r = 330, inner = arcPts(cx, cy, r - 40, -90, 0, 24), outer = arcPts(cx, cy, r + 40, -90, 0, 24), mid = arcPts(cx, cy, r, -90, 0, 24);
    s += tvTrack(mid, 80) + P("M" + inner.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), "#2f6f9f", 9) + P("M" + outer.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), "#d8352a", 9);
    s += T("بره: أطول", 470, 120, 34, "#d8352a") + T("جوه: أقصر", 250, 470, 34, "#2f6f9f");
    if (o.train != null) s += tvTrain(along(mid, o.train), 150);
    return s; }
  // the turnout card: straight on up, a branch curving off right; blade 0 = straight, 1 = branch; train 0…1
  function turnoutCard(t, o) { var s = "", sx = 260, straight = [[sx, 640], [sx, 40]], branch = [[sx, 640], [sx, 470], [sx + 20, 360], [sx + 80, 250], [sx + 180, 150], [sx + 320, 60]];
    s += tvTrack(straight, 70) + tvTrack(branch.slice(1), 70);
    var b = ease(clamp(o.blade || 0)), py = 470, ty = 300;
    s += P("M" + f(sx - 35) + " " + py + " L" + f(sx - 35 + lerp(8, 30, b)) + " " + ty, "#ffd23a", 9) + P("M" + f(sx + 35) + " " + py + " L" + f(sx + 35 + lerp(-2, 22, b)) + " " + ty, "#ffd23a", 9);
    s += R(sx - 170, 360, 80, 60, "#3a3e46", { rx: 8, sw: 3 }) + P("M" + (sx - 90) + " 390 H" + f(sx - 35 + lerp(8, 30, b) * 0.6), "#9aa2ac", 6) + C(sx - 130, 390, 10, b > 0.05 && b < 0.95 ? "#5ad07a" : "#5a6068");
    if (o.train != null) { var path = b > 0.5 ? branch : straight; s += tvTrain(along(path, o.train), 160); }
    return s; }
  // the cab screen: a speed dial with its target, the speed in the middle
  function dmi(t, sp, lim) { var s = R(30, 90, 560, 430, "#1e2430", { rx: 22, sw: 4 }), cx = 230, cy = 320, r = 150;
    for (var i = 0; i <= 10; i++) { var a = (-225 + i * 27) * Math.PI / 180; s += P("M" + f(cx + Math.cos(a) * (r - 18)) + " " + f(cy + Math.sin(a) * (r - 18)) + " L" + f(cx + Math.cos(a) * r) + " " + f(cy + Math.sin(a) * r), "#cfd6de", 4); }
    var la = (-225 + lim / 300 * 270) * Math.PI / 180, aa = (-225) * Math.PI / 180; s += P("M" + f(cx + Math.cos(aa) * (r + 12)) + " " + f(cy + Math.sin(aa) * (r + 12)) + " A" + (r + 12) + " " + (r + 12) + " 0 " + (lim > 200 ? 1 : 0) + " 1 " + f(cx + Math.cos(la) * (r + 12)) + " " + f(cy + Math.sin(la) * (r + 12)), "#5ad07a", 10);
    var na = (-225 + sp / 300 * 270) * Math.PI / 180; s += P("M" + cx + " " + cy + " L" + f(cx + Math.cos(na) * (r - 24)) + " " + f(cy + Math.sin(na) * (r - 24)), sp > lim + 3 ? "#e8452e" : "#fff", 8) + C(cx, cy, 44, "#1e2430", { st: "#cfd6de", sw: 3 }) + T(String(Math.round(sp)), cx, cy + 14, 40, sp > lim + 3 ? "#e8452e" : "#fff");
    s += R(440, 130, 40, 340, "#2a3240", { rx: 6, sw: 2 }) + R(440, lerp(470, 130, clamp(lim / 230)), 40, lerp(0, 340, clamp(lim / 230)), "#5ad07a", { sw: 0 }) + T("km/h", cx, cy + 90, 22, "#9aa8b8");
    return s; }

  // ── the whole side scene ──
  function side(t, o, h) { o = o || {}; h = h || {}; var b = has(o), s = back(t, h);
    if (h.mast != null) s += mast(980, t, h.mast);
    if (b.bridge || h.bridge != null) s += bridge(t, h.bridge == null ? 1 : h.bridge, h.carOn);
    if (b.wire || h.wire != null) s += wires(t, h.wire == null ? 1 : h.wire, h.live);
    if (h.early) s += looseRails(h.rails == null ? 1 : h.rails); else s += track(t, { joints: h.joints == null ? (b.weld ? 0 : 0) : h.joints, bead: b.weld || h.bead });
    if (h.train != null) s += train(h.train, t, { panto: b.wire || h.panto != null ? (h.panto == null ? 1 : h.panto) : null, lit: h.lit, blur: h.blur, lamp: h.lamp });
    if (h.sig) s += signal(h.sig);
    if (h.smoke) s += smoke(h.train - 1560, TOP - 20, t, h.smoke);
    if (b.station || h.station != null) s += station(h.station == null ? 1 : h.station);
    if ((b.fence || h.fence != null) && !(b.station || h.station != null)) s += fence(h.fence == null ? 1 : h.fence);
    return s; }
  function endScene(t, o, h) { return back(t, h) + endView(t, Object.assign({ ws: 1 }, h || {})); }

  // the build: on from the line after the one that adds it
  K.steps([[12, { weld: 1 }], [18, { wire: 1 }], [20, { fence: 1, bridge: 1 }], [21, { station: 1 }]]);
  var G = GY, ML = 360;

  // 0 — a crate on rubber wheels pushed across the desert: you've got a cart
  shot(0, [520, 820, 1.55], [560, 840, 1.4], function (u, d, t) {
    var cx = lerp(440, 640, ease(u / d)), s = back(t) + cart(cx, G, { roll: cx });
    s += act(u, [[0, { x: cx - 205, y: G, f: 1, p: "push", mood: "n" }], [3.2, { x: cx - 205, y: G, f: 1, p: "push", mood: "happy" }]].map(function (k, i) { if (i) k[1].x = lerp(440, 640, ease(k[0] / d)) - 205; return k; }), t);
    return s + pill("عربية", cx, G - 330, u, 0.8, { col: "#ffd23a" });
  });
  // 1 — but the wheels sink into the sand and the cart stops dead
  shot(1, [600, 860, 1.45], [610, 900, 1.75], function (u, d, t) {
    var sk = clamp(u / 1.4), s = back(t) + cart(640, G, { sink: sk, roll: 640 + Math.sin(t * 20) * 4 * (1 - sk) });
    s += act(u, [[0, { x: 435, y: G, f: 1, p: "push", mood: "n" }], [1.4, { x: 435, y: G, f: 1, p: "push", mood: "worry" }], [2.4, { x: 420, y: G, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("بيغرز!", 640, G - 330, u, 1.0, { bg: "#c7321f" }) + xmark(560, G - 30, u, 1.4, 0.7);
  });
  // 2 — so: steel wheels on steel rails; the friction drops to a tenth and it rolls with one hand
  shot(2, [620, 860, 1.6], [700, 850, 1.3], function (u, d, t) {
    var rk = clamp((u - 0.2) / 1.0), on = u > 1.4, cx = on ? lerp(640, 900, ease((u - 2.6) / 3)) : 640;
    var s = back(t, {}) + looseRails(rk) + (on ? cart(cx, RT0, { steel: 1, roll: cx }) : cart(640, G, { sink: 1 - clamp((u - 1.0) / 0.4) }));
    s += act(u, [[0, { x: 440, y: G, f: 1, p: "point", mood: "n" }], [1.5, { x: 440, y: G, f: 1, p: "stand", mood: "n" }], [2.6, { x: 445, y: G, f: 1, p: "push", mood: "n" }], [5.0, { x: 700, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("حديد على حديد", 640, RT0 - 330, u, 1.4, { col: "#ffd23a" }) + pill("الاحتكاك ÷ 10", 760, RT0 - 450, u, 2.8, { col: "#7cf2a0" }) + ring(cx - 80, RT0 - 38, 52, u, 1.6, t);
  });
  // 3 — END view: under the load the two rails spread apart and the wheels drop between them
  shot(3, [600, 860, 1.5], [610, 900, 1.6], function (u, d, t) {
    var sp = clamp((u - 0.8) / 1.4), s = endScene(t, {}, { load: 1, spread: sp, drop: clamp((sp - 0.55) / 0.3), skid: 0 });
    s += K.arrowH(X0 - 160, G - 50, X0 - 250, "#d8352a", 10, clamp((u - 0.8) / 0.8)) + K.arrowH(X0 + 160, G - 50, X0 + 250, "#d8352a", 10, clamp((u - 0.8) / 0.8));
    s += act(u, [[0, { x: ML, y: G, f: 1, p: "stand", mood: "n" }], [1.6, { x: ML - 20, y: G, f: 1, p: "shock", mood: "shock" }]], t);
    return s + xmark(X0, G - 360, u, 2.2, 0.8) + pill("بيفتحوا!", X0 + 120, 560, u, 1.2, { bg: "#c7321f" });
  });
  // 4 — so you tie them with concrete sleepers at exactly 1,435 mm: the sleepers
  shot(4, [600, 860, 1.6], [580, 880, 1.45], function (u, d, t) {
    var tk = clamp((u - 0.3) / 1.2), s = endScene(t, {}, { ties: tk, ws: u > 1.6 ? 1 : 0, load: 1 });
    if (u > 2.4) { var k = clamp((u - 2.4) / 0.6), y = G - 160; s += P("M" + (X0 - 115) + " " + y + " L" + f(lerp(X0 - 115, X0 + 115, k)) + " " + y, "#ffd23a", 6) + (k > 0.95 ? P("M" + (X0 - 115) + " " + (y - 16) + " v32 M" + (X0 + 115) + " " + (y - 16) + " v32", "#ffd23a", 6) : ""); }
    s += act(u, [[0, { x: ML, y: G, f: 1, p: "push", mood: "n" }], [1.6, { x: ML + 10, y: G, f: 1, p: "crouch", mood: "n" }], [3.6, { x: ML, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("1435 مم", X0, G - 250, u, 2.8, { col: "#ffd23a" }) + pill("الفلنكات", X0 + 60, G + 90, u, 4.0, { col: "#ffd23a", down: false }) + ring(X0, G - 18, 120, u, 1.2, t);
  });
  // 5 — but sleepers on sand: the first heavy train presses them down and bends the track
  shot(5, [600, 880, 1.5], [600, 920, 1.7], function (u, d, t) {
    var sk = clamp((u - 0.6) / 1.4), s = endScene(t, { }, { ties: 1, load: 1, sink: sk });
    s += K.arrowV(X0, 300, 520, "#d8352a", 14, clamp((u - 0.3) / 0.6));
    s += act(u, [[0, { x: ML, y: G, f: 1, p: "stand", mood: "n" }], [1.6, { x: ML - 20, y: G, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("بتهبط!", X0 + 220, G - 360, u, 1.4, { bg: "#c7321f" }) + xmark(X0 + 230, G - 40, u, 1.8, 0.7);
  });
  // 6 — so you lay crushed stone under them; it locks together and spreads the weight
  shot(6, [600, 860, 1.4], [600, 880, 1.3], function (u, d, t) {
    var bk = clamp((u - 0.5) / 2.0), s = endScene(t, {}, { ties: 1, load: 1, sink: 1 - bk, bal: bk, pour: u < 2.6 ? 1 : 0 });
    s += act(u, [[0, { x: ML - 20, y: G, f: 1, p: "dig", mood: "n", rate: 1.4 }], [2.8, { x: ML - 20, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("زلط مكسّر", X0 + 330, G - 160, u, 1.6, { col: "#ffd23a" }) + ring(X0 + 300, G - 40, 70, u, 2.0, t);
  });
  // 7 — but in a bend the outer wheel must run further than the inner, and both sit on one axle
  shot(7, [600, 760, 1.25], [600, 780, 1.3], function (u, d, t) {
    var s = endScene(t, {}, { ties: 1, bal: 1, load: 0, skid: u > 2.6 ? 1 : 0 });
    s += card(600, 440, 640, 560, u, 0.2, curveCard(u, { train: null }));
    s += act(u, [[0, { x: ML - 20, y: G, f: 1, p: "point", mood: "n" }], [2.6, { x: ML - 20, y: G, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("نفس العمود!", X0, SLT - 230, u, 2.0, { bg: "#c7321f" }) + xmark(X0 + 140, SLT - 120, u, 3.0, 0.6);
  });
  // 8 — so the wheel is a cone: in a bend the set slides out and the outer wheel rolls on its wider part
  shot(8, [610, 900, 1.75], [620, 860, 1.5], function (u, d, t) {
    var ck = clamp((u - 0.3) / 1.0), sh = 24 * ease(clamp((u - 1.8) / 1.2)), s = endScene(t, {}, { ties: 1, bal: 1, cone: ck, shift: sh });
    if (u > 3.2) s += card(600, 380, 560, 480, u, 3.2, curveCard(u, { train: clamp((u - 3.4) / 2.2) }));
    s += act(u, [[0, { x: ML - 20, y: G, f: 1, p: "point", mood: "n" }], [3.6, { x: ML - 20, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("مخروطية", X0, SLT - 250, u, 0.8, { col: "#ffd23a" }) + pill("أعرض", X0 + 160, SLT + 60, u, 2.4, { down: false, sz: 32 }) + pill("أضيق", X0 - 80, SLT + 60, u, 2.4, { down: false, sz: 32 }) + ring(X0 + 130 + sh, SLT - 30, 46, u, 2.0, t);
  });
  // 9 — SIDE close-up: many think the clickety-clack comes from the wheels
  shot(9, [560, 900, 1.9], [560, 920, 2.0], function (u, d, t) {
    var wx = lerp(-200, 1300, u / d), s = side(t, {}, { joints: 22 });
    s += bogie(wx, wx / WR);
    JX.forEach(function (j) { [-187, 187].forEach(function (o) { var dx = wx + o - j; if (dx > 0 && dx < 120) s += T("تك", j, RT - 170 - dx * 0.5, 56, "#ffd23a", { stroke: INK }); }); });
    s += act(u, [[0, { x: 380, y: G, f: 1, p: "ear", mood: "n" }], [2.2, { x: 380, y: G, f: 1, p: "shrug", mood: "n" }]], t);
    return s + pill("من العجل؟", 470, G - 360, u, 1.2);
  });
  // 10 — the truth: gaps between the rails, because steel grows in desert heat: half a metre per kilometre
  shot(10, [560, 920, 2.0], [560, 940, 2.2], function (u, d, t) {
    var hk = clamp((u - 2.0) / 2.0), s = side(t, {}, { joints: lerp(28, 4, hk) });
    s += ring(540, RT + 13, 50, u, 0.6, t) + (u > 2.0 ? C(540, RT + 10, 120 * hk, "url(#hot)") : "");
    s += act(u, [[0, { x: 380, y: G, f: 1, p: "point", mood: "n" }], [2.2, { x: 380, y: G, f: 1, p: "collar", mood: "worry" }], [4.4, { x: 380, y: G, f: 1, p: "point", mood: "n" }]], t);
    return s + pill("فراغ", 540, RT - 60, u, 0.6, { col: "#ffd23a" }) + pill("1 كم ← + نص متر", 560, RT - 200, u, 3.4, { col: "#ffd23a", sz: 36 });
  });
  // 11 — but at high speed every gap hits the wheel like a speed bump
  shot(11, [560, 900, 1.9], [560, 920, 2.1], function (u, d, t) {
    var wx = lerp(-100, 1100, clamp(u / 2.6)), near = Math.abs(wx - 187 - 540) < 40 || Math.abs(wx + 187 - 540) < 40, s = side(t, {}, { joints: 22 });
    s += '<g transform="translate(0 ' + (near ? -10 : 0) + ')">' + bogie(wx, wx / 30) + '</g>' + (near ? sparks(540, RT, t, 1) : "");
    if (u > 1.4) s += P("M532 " + (RT + 2) + " l6 8 l-5 6 l7 9", "#2a2522", 3);
    s += act(u, [[0, { x: 390, y: G, f: 1, p: "stand", mood: "n" }], [1.0, { x: 380, y: G, f: 1, p: "cover", mood: "shock" }]], t);
    return s + pill("طاخ!", 540, RT - 240, u, 1.0, { bg: "#c7321f" }) + xmark(640, RT - 110, u, 1.6, 0.6);
  });
  // 12 — so you weld the rails into one and tension them: one long rail, no more clack
  shot(12, [560, 900, 2.0], [600, 860, 1.25], function (u, d, t) {
    var pour = clamp((u - 0.6) / 1.4), done = u > 2.2, s = side(t, {}, { joints: done ? 0 : 6, bead: done });
    if (!done) { s += '<g filter="url(#sh)">' + F("M480 " + (RT - 260) + " L600 " + (RT - 260) + " L570 " + (RT - 150) + " L510 " + (RT - 150) + " Z", "#4a4e56") + '</g>' + P("M540 " + (RT - 260) + " V" + (RT - 420), "#3a3e46", 4);
      if (pour > 0) s += R(533, RT - 150, 14, 150 * pour, "url(#molten)", { sw: 0 }) + C(540, RT + 12, 34 * pour, "url(#molten)", { st: "none" }) + sparks(540, RT, t, pour * 0.6); }
    else if (u < 3.0) s += C(540, RT + 12, 40 * (1 - (u - 2.2) / 0.8), "url(#hot)");
    s += act(u, [[0, { x: 390, y: G, f: 1, p: "crouch", mood: "n" }], [2.4, { x: 390, y: G, f: 1, p: "stand", mood: "n" }], [3.4, { x: 390, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("بتلحم", 540, RT - 480, u, 0.6, { col: "#ffd23a" }) + pill("قضيب واحد طويل", 700, RT - 320, u, 3.0, { col: "#7cf2a0" });
  });
  // 13 — but you want the train to go onto another line
  shot(13, [560, 700, 1.25], [560, 720, 1.3], function (u, d, t) {
    var s = side(t, {}, {}) + card(560, 470, 640, 700, u, 0.1, turnoutCard(t, { blade: 0, train: clamp(u / d) }));
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "point", mood: "n" }], [1.0, { x: 300, y: G, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + pill("خط تاني؟", 800, 900, u, 0.8, { bg: "#c7321f" });
  });
  // 14 — so two steel blades moved by a motor steer the wheels: the turnout
  shot(14, [560, 720, 1.3], [560, 700, 1.25], function (u, d, t) {
    var bl = clamp((u - 0.6) / 1.0), s = side(t, {}, {}) + card(560, 470, 640, 700, u, -1, turnoutCard(t, { blade: bl, train: clamp((u - 1.8) / 2.6) }));
    s += ring(560 - 320 + 260 + 10, 470 - 350 + 385, 70, u, 0.5, t);
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "point", mood: "n" }], [2.6, { x: 300, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("التحويلة", 800, 900, u, 1.4, { col: "#ffd23a" });
  });
  // 15 — but at 230 km/h the driver can't read a signal standing by the line
  shot(15, [560, 760, 1.1], [600, 780, 1.15], function (u, d, t) {
    var tx = lerp(-300, 8400, clamp((u - 0.4) / 5.2)), s = side(t, {}, { train: tx, blur: 1, sig: 820 });
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "point", mood: "n" }], [1.4, { x: 280, y: G, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("230 كم/س", 560, TOP - 120, u, 1.0, { bg: "#c7321f" }) + xmark(820, GY - 860, u, 2.4, 0.7);
  });
  // 16 — so the signal comes by radio to a screen in front of him, and if he speeds the train brakes itself
  shot(16, [560, 720, 1.15], [560, 740, 1.2], function (u, d, t) {
    var tx = lerp(1400, 1700, ease(u / d)), sp = u < 2.6 ? lerp(200, 244, clamp((u - 1.2) / 1.2)) : lerp(244, 226, clamp((u - 2.6) / 0.8)), s = side(t, {}, { train: tx, mast: 1, lamp: true });
    s += card(470, 380, 620, 560, u, 0.4, dmi(t, sp, 230));
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "point", mood: "n" }], [3.2, { x: 300, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("بالراديو", 900, 80, u, 0.6, { col: "#9fd6ff" }) + (u > 2.4 ? pill("بيفرمل لوحده", 470, 700, u, 2.6, { col: "#7cf2a0", sz: 34 }) : "");
  });
  // 17 — but a train this size needs huge power, and diesel is heavy and smokes
  shot(17, [700, 720, 1.05], [720, 760, 1.15], function (u, d, t) {
    var s = side(t, {}, { train: 1900, smoke: clamp((u - 0.8) / 1.0), lamp: false });
    s += barrel(500, G);
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "point", mood: "n" }], [1.8, { x: 300, y: G, f: 1, p: "cough", mood: "sick" }]], t);
    return s + pill("دخان!", 680, TOP - 380, u, 1.6, { bg: "#c7321f" }) + xmark(500, G - 220, u, 2.4, 0.6);
  });
  // 18 — so you hang a 27,500-volt wire over the line, and an arm on the roof draws the power
  shot(18, [640, 700, 0.95], [640, 680, 1.05], function (u, d, t) {
    var wk = clamp((u - 0.2) / 2.6), pk = clamp((u - 3.0) / 1.0), s = side(t, {}, { train: 1900, wire: wk, panto: pk, live: pk > 0.9, lit: pk > 0.9 });
    if (pk > 0.9) s += sparks(1900 - 1560 - 10, CW, t, clamp((u - 4.0) / 0.3) * (u < 5.4 ? 1 : 0.3));
    s += act(u, [[0, { x: 300, y: G, f: 1, p: "pointUp", mood: "n" }], [4.2, { x: 300, y: G, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + pill("27,500 فولت", 640, CW - 120, u, 2.0, { col: "#ffd23a" }) + ring(1900 - 1560, TOP - 120, 120, u, 3.2, t);
  });
  // 19 — but people and cars cross the line, and the train needs kilometres to stop
  shot(19, [560, 760, 1.05], [600, 800, 1.2], function (u, d, t) {
    var tx = lerp(-900, 420, ease(clamp(u / 3.0))), s = side(t, {}, { train: tx, lamp: true, blur: 0.4 });
    s += car(820, RT + 26, true);
    s += act(u, [[0, { x: 600, y: G, f: -1, p: "stand", mood: "n" }], [1.2, { x: 520, y: G, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("كيلومترات عشان يقف", 600, TOP - 150, u, 1.4, { bg: "#c7321f", sz: 36 }) + xmark(820, RT - 260, u, 2.0, 0.6);
  });
  // 20 — so you fence the line, and the roads cross over it on bridges instead of level crossings
  shot(20, [560, 640, 0.92], [560, 660, 0.95], function (u, d, t) {
    var fk = clamp((u - 0.2) / 1.0), bk = clamp((u - 1.0) / 1.6), s = side(t, {}, { fence: fk, bridge: bk, carOn: bk > 0.99 ? lerp(-100, 1200, clamp((u - 2.6) / 1.4)) : null, train: lerp(-600, 3800, clamp((u - 2.0) / 1.8)), blur: 0.6 });
    s += act(u, [[0, { x: 360, y: G, f: 1, p: "push", mood: "n" }], [2.4, { x: 360, y: G, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("سور", 760, G - 330, u, 0.8, { col: "#ffd23a" }) + pill("كوبري بدل المزلقان", 560, 220, u, 2.0, { col: "#7cf2a0", sz: 36 });
  });
  // 21 — what's left: stations at Sokhna, the capital and Alamein, and 41 trains
  shot(21, [480, 640, 1.25], [520, 660, 1.3], function (u, d, t) {
    var sk = clamp((u - 0.2) / 1.0), s = side(t, {}, { station: sk, train: lerp(2400, 1300, ease(clamp((u - 0.8) / 2.0))), lit: true });
    s += act(u, [[0, { x: 300, y: PLT, f: 1, p: "stand", mood: "n" }], [1.4, { x: 300, y: PLT, f: 1, p: "point", mood: "happy" }]], t);
    var names = ["السخنة", "العاصمة", "العلمين"], ni = Math.min(2, Math.floor(clamp((u - 0.8) / 2.4) * 3));
    return s + pill(names[ni], 520, PLT - 680, u, 0.8, { col: "#9fd6ff" }) + pill("41 قطر", 720, PLT - 260, u, 2.6, { col: "#ffd23a" });
  });
  // 22 — and congratulations: a high-speed railway from the Red Sea to the Mediterranean, by yourself
  shot(22, [600, 720, 1.05], [560, 760, 0.72], function (u, d, t) {
    var s = side(t, {}, { train: lerp(1300, 4200, ease(clamp((u - 0.6) / 2.6))), lit: true, blur: clamp(u - 1.4) });
    s += act(u, [[0, { x: 300, y: PLT, f: 1, p: "cheer", mood: "happy" }], [2.0, { x: 300, y: PLT, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s + K.confetti(t, 0, 1100, -200, 1200) + pill("660 كم من البحر للبحر", 560, 100, u, 0.6, { col: "#ffd23a", sz: 44 });
  });
  // 23 — tell us what story you want next
  shot(23, [560, 700, 0.9], [480, 640, 1.2], function (u, d, t) {
    var s = side(t, {}, {});
    s += act(u, [[0, { x: 300, y: PLT, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("الحكاية الجاية؟", 480, PLT - 330, u, 0.4, { col: "#ffd23a", sz: 44 });
  });
  window.__hsr = { side: side, train: train };
})();
