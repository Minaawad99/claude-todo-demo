/* «تبني كوبري فوق الشارع إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One Cairo flyover seen from the side and cut open below the ground: a naive hill of earth, then two ramps with
   retaining walls, two columns on piles down through the Nile clay into firm sand, three precast girders lowered at night
   by a mobile crane, the prestressing strands, the topping slab, the rubber bearings, the raised clearance, the drains and
   the concrete barrier. The cross street under it runs into the screen (cars seen from behind). A magnifier shows the deck
   in cross-section for the slope, drains and barrier. World units are the 1080×1920 frame at zoom 1. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var WORK = { vest: 1, hat: 1 };
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.4; if (k[1].vest == null) Object.assign(k[1], WORK); }); return K.act(u, Ks, t); };
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY, GD = 60, SLAB = 22, ASPH = 8;
  var AB0 = -100, AB1 = 1180, COLS = [340, 740], SPANS = [[AB0, 340], [340, 740], [740, AB1]];
  var RAMP0 = -700, RAMP1 = 1780, CLAY = GY + 700, SAND = GY + 900, PILEB = GY + 790, CAP0 = GY + 44, CAP1 = GY + 124;

  // heights: the deck underside rises from 4.3 m to 5.7 m above the street when the bridge is raised (line 15)
  function geo(b) { var DB = GY - lerp(330, 440, clamp(b.lift || 0)), BH = 16 * clamp(b.bear || 0);
    var GT = DB - GD, ST = GT - (b.slab ? SLAB : 0), RT = ST - (b.asph ? ASPH : 0);
    return { DB: DB, BH: BH, GT: GT, ST: ST, RT: RT, HT: DB - GD - SLAB }; }
  // the road surface along the whole profile (ramps up, deck, ramps down)
  function roadY(x, g, top) { var y = top == null ? g.HT : top; if (x <= RAMP0) return GY; if (x < AB0) return lerp(GY, y, (x - RAMP0) / (AB0 - RAMP0)); if (x <= AB1) return y; if (x < RAMP1) return lerp(y, GY, (x - AB1) / (RAMP1 - AB1)); return GY; }

  // ── the ground: Nile clay, firm sand, the street surface and the crossing ──
  function soil() {
    var s = R(-900, GY + 40, 2900, CLAY - GY - 40, "url(#clay)", { sw: 0, op: 0.72 }) + R(-900, CLAY, 2900, SAND - CLAY, "url(#sand)", { sw: 0, op: 0.9 });
    s += P("M-900 " + CLAY + " " + (function () { var d = ""; for (var x = -900; x <= 2000; x += 60) d += "L" + x + " " + f(CLAY + 10 * Math.sin(x * 0.03)) + " "; return d; })(), "#3a2c20", 4);
    s += P("M-900 " + SAND + " " + (function () { var d = ""; for (var x = -900; x <= 2000; x += 60) d += "L" + x + " " + f(SAND + 8 * Math.sin(x * 0.02 + 1)) + " "; return d; })(), "#5a4428", 4);
    for (var i = 0; i < 60; i++) s += C(-800 + hash(i + 11) * 2700, CLAY + 20 + hash(i + 31) * (SAND - CLAY - 40), 4 + hash(i) * 5, "#8a6a34", { op: 0.6 });
    return s; }
  function street(t) {
    var s = R(-900, GY - 12, 2900, 56, "url(#asph)", { sw: 3 });
    for (var x = -880; x < 2000; x += 110) s += R(x, GY + 14, 56, 6, "#e6e2d6", { sw: 0, op: 0.8 });
    // the crossing street runs into the screen under the middle span: a zebra crossing
    for (var z = 0; z < 6; z++) s += R(470 + z * 26 - 6, GY - 10, 14, 52, "#f2efe6", { sw: 0, op: 0.85 });
    return s; }
  // a car seen from behind, driving into the screen: k 0 (near) → 1 (under the bridge, smaller)
  function carRear(x, k, col, o) { o = o || {}; var sc = o.sc || lerp(1, 0.8, k), yb = o.yb != null ? o.yb : lerp(GY + 40, GY + 4, k), w = 170 * sc, h = 120 * sc, s = '<g filter="url(#sh)">';
    if (o.truck) { w = 210 * sc; h = (o.th || 360) * sc;
      s += R(x - w / 2, yb - h, w, h - 26 * sc, "url(#carW)", { rx: 6 }) + P("M" + f(x) + " " + f(yb - h + 6) + " V" + f(yb - 30 * sc), INK, 3) + R(x - 12, yb - h * 0.55, 8, 40 * sc, "#8a9098", { sw: 1.5 }) + R(x + 4, yb - h * 0.55, 8, 40 * sc, "#8a9098", { sw: 1.5 }) + R(x - w / 2 + 4, yb - 60 * sc, w - 8, 10 * sc, "#e8452e", { sw: 0, op: 0.85 }) + R(x - w / 2 - 6, yb - h - 4, w + 12, 12, "#c4c6c8", { rx: 3, sw: 2 }) + T("نقل", x, yb - h * 0.72, 40 * sc, "#2f6f9f") + R(x - w / 2 - 4, yb - 34 * sc, w + 8, 14 * sc, "#3a3d42", { sw: 2 });
      s += R(x - w / 2 + 6, yb - 30 * sc, 22, 14, o.brake ? "#ff3a2a" : "#a8301f", { sw: 1.5 }) + R(x + w / 2 - 28, yb - 30 * sc, 22, 14, o.brake ? "#ff3a2a" : "#a8301f", { sw: 1.5 });
    } else {
      s += F("M" + f(x - w * 0.36) + " " + f(yb - h) + " L" + f(x + w * 0.36) + " " + f(yb - h) + " L" + f(x + w * 0.46) + " " + f(yb - h * 0.56) + " L" + f(x - w * 0.46) + " " + f(yb - h * 0.56) + " Z", col);
      s += F("M" + f(x - w * 0.3) + " " + f(yb - h * 0.94) + " L" + f(x + w * 0.3) + " " + f(yb - h * 0.94) + " L" + f(x + w * 0.38) + " " + f(yb - h * 0.62) + " L" + f(x - w * 0.38) + " " + f(yb - h * 0.62) + " Z", "url(#glass)", { sw: 2 });
      s += R(x - w / 2, yb - h * 0.58, w, h * 0.42, col, { rx: 8 }) + R(x - w * 0.16, yb - h * 0.36, w * 0.32, h * 0.12, "#f2efe6", { sw: 1.5 });
      s += R(x - w / 2 + 6, yb - h * 0.5, w * 0.16, h * 0.1, o.brake ? "#ff3a2a" : "#b8301f", { sw: 1.5 }) + R(x + w / 2 - 6 - w * 0.16, yb - h * 0.5, w * 0.16, h * 0.1, o.brake ? "#ff3a2a" : "#b8301f", { sw: 1.5 });
      if (o.brake) s += C(x - w / 2 + 6 + w * 0.08, yb - h * 0.45, 22 * sc, "url(#hot)") + C(x + w / 2 - 6 - w * 0.08, yb - h * 0.45, 22 * sc, "url(#hot)"); }
    s += R(x - w / 2 + 4, yb - 18 * sc, 30 * sc, 22 * sc, "#1e2024", { rx: 4, sw: 2 }) + R(x + w / 2 - 4 - 30 * sc, yb - 18 * sc, 30 * sc, 22 * sc, "#1e2024", { rx: 4, sw: 2 });
    return s + '</g>'; }
  // traffic on the cross street, under the middle span
  function crossTraffic(t, n) { var s = "", cols = ["url(#carR)", "url(#carB)", "url(#carW)", "url(#carY)"];
    for (var i = 0; i < (n || 3); i++) { var p = (t * 0.32 + i / (n || 3)) % 1, x = 540 + (i % 2 ? 40 : -40), op = p < 0.1 ? p / 0.1 : p > 0.85 ? (1 - p) / 0.15 : 1;
      s += '<g opacity="' + f(op) + '">' + carRear(x, p, cols[i % 4]) + '</g>'; }
    return s; }
  // a car from the side on a road at y (bottom of the wheels), heading dir, with an angle
  function carSide(x, y, dir, col, t, o) { o = o || {}; var w = 250, h = 92, ang = o.ang || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + dir + ' 1)" filter="url(#sh)">';
    if (o.truck) { s += R(-w * 0.6, -h * 1.9, w * 0.86, h * 1.66, "url(#carW)", { rx: 6 }) + R(w * 0.28, -h * 1.2, w * 0.32, h * 0.96, col, { rx: 8 }) + R(w * 0.36, -h * 1.08, w * 0.18, h * 0.36, "url(#glass)", { sw: 2 }); }
    else { s += F("M" + (-w / 2) + " -18 L" + (-w / 2) + " " + (-h * 0.52) + " Q" + (-w * 0.32) + " " + (-h * 0.56) + " " + (-w * 0.22) + " " + (-h) + " L" + (w * 0.2) + " " + (-h) + " Q" + (w * 0.32) + " " + (-h * 0.6) + " " + (w / 2) + " " + (-h * 0.5) + " L" + (w / 2) + " -18 Z", col);
      s += F("M" + (-w * 0.18) + " " + (-h * 0.92) + " L" + (w * 0.16) + " " + (-h * 0.92) + " L" + (w * 0.26) + " " + (-h * 0.56) + " L" + (-w * 0.26) + " " + (-h * 0.56) + " Z", "url(#glass)", { sw: 2 }) + P("M0 " + (-h * 0.92) + " V" + (-h * 0.56), INK, 3);
      s += R(w / 2 - 14, -h * 0.46, 12, 12, "#fff6c0", { sw: 1.5 }) + R(-w / 2 + 2, -h * 0.46, 10, 12, "#d8352a", { sw: 1.5 }); }
    [-w * 0.3, w * 0.3].forEach(function (wx) { s += C(wx, -18, 24, "#1e2024", { st: INK, sw: 3 }) + C(wx, -18, 10, "#9aa2ac") + P("M" + f(wx) + " -18 l" + f(10 * Math.cos(t * 9 * (o.v == null ? 1 : o.v))) + " " + f(10 * Math.sin(t * 9 * (o.v == null ? 1 : o.v))), INK, 3); });
    return s + '</g>'; }
  // cars on the deck and ramps, following the road surface
  function deckTraffic(t, g, n, top) { var s = "", cols = ["url(#carB)", "url(#carR)", "url(#carY)", "url(#carW)"], N = n || 4;
    for (var i = 0; i < N; i++) { var dir = i % 2 ? -1 : 1, p = (t * 0.09 + i / N + (dir < 0 ? 0.37 : 0)) % 1, x = dir > 0 ? lerp(RAMP0 - 200, RAMP1 + 200, p) : lerp(RAMP1 + 200, RAMP0 - 200, p);
      var y = roadY(x, g, top), y2 = roadY(x + 40, g, top), ang = Math.atan2(y2 - y, 40) * 180 / Math.PI;
      s += carSide(x, y, dir, cols[i % 4], t, { ang: ang }); }
    return s; }

  // ── the structure ──
  // the naive hill (k = how much of its middle is still there, 1 = all)
  function hill(g, k) { var top = g.HT, mid = lerp(GY, top, clamp(k)), s = '<g filter="url(#sh)">';
    s += F("M" + RAMP0 + " " + GY + " L" + AB0 + " " + f(top) + " L" + AB0 + " " + GY + " Z", "url(#fill)") + F("M" + RAMP1 + " " + GY + " L" + AB1 + " " + f(top) + " L" + AB1 + " " + GY + " Z", "url(#fill)");
    if (k > 0.01) s += R(AB0, mid, AB1 - AB0, GY - mid, "url(#fill)");
    s += '</g>';
    for (var i = 0; i < 40; i++) { var x = RAMP0 + hash(i + 3) * (RAMP1 - RAMP0), yt = (x > AB0 && x < AB1) ? mid : roadY(x, g, top), y = lerp(yt + 20, GY - 10, hash(i + 8)); if (y > yt + 14) s += C(x, y, 5 + hash(i) * 6, "#7a5a30", { op: 0.5 }); }
    return s; }
  // the ramps with retaining-wall panels on their faces
  function ramps(g, b) { var top = g.HT, s = hill(g, 0);
    [[RAMP0, AB0], [RAMP1, AB1]].forEach(function (r) { var x0 = r[0], x1 = r[1], d = x1 > x0 ? 1 : -1;
      for (var x = x0; d > 0 ? x < x1 : x > x1; x += d * 120) { var xa = x, xb = x + d * 120, ya = roadY(xa, g, top), yb = roadY(xb, g, top);
        s += F("M" + f(xa) + " " + f(ya + 6) + " L" + f(xb) + " " + f(yb + 6) + " L" + f(xb) + " " + GY + " L" + f(xa) + " " + GY + " Z", "#d8cdb8", { sw: 2, op: 0.92 });
        for (var yy = Math.max(ya, yb) + 60; yy < GY; yy += 70) s += P("M" + f(xa) + " " + f(yy) + " L" + f(xb) + " " + f(yy), "#a89a80", 2); }
      // the abutment: the wall where the ramp ends and the bridge starts, with a seat for the girders
      s += R(x1 - (d > 0 ? 40 : 0), top, 40, GY - top, "url(#colG)", { fl: "sh" }) + R(d > 0 ? x1 - 40 : x1 - 20, g.DB + g.BH, 60, 18, "url(#conc)", { sw: 2 });
    });
    return s; }
  // a column on its pile cap: sink (m) and tilt (deg) for line 3; h0…1 grows it from the ground
  function column(x, g, o) { o = o || {}; var top = g.DB + g.BH, hgt = (GY - top) * clamp(o.h == null ? 1 : o.h), sink = o.sink || 0, tilt = o.tilt || 0;
    var s = '<g transform="translate(0 ' + f(sink) + ') rotate(' + f(tilt) + ' ' + x + ' ' + GY + ')"><g filter="url(#sh)">';
    s += R(x - 40, GY - hgt, 80, hgt + 10, "url(#colG)");
    if (o.h == null || o.h >= 1) s += F("M" + (x - 90) + " " + f(top) + " L" + (x + 90) + " " + f(top) + " L" + (x + 90) + " " + f(top + 16) + " L" + (x + 40) + " " + f(top + 56) + " L" + (x - 40) + " " + f(top + 56) + " L" + (x - 90) + " " + f(top + 16) + " Z", "url(#colG)");
    s += '</g>' + P("M" + (x - 20) + " " + f(GY - hgt + 70) + " V" + (GY - 10), "#fff", 6, ' opacity=".25"');
    if (o.crack) s += P("M" + (x - 40) + " " + (GY - 60) + " l20 -14 l-8 -18 l22 -12", "#2a1a12", 3, ' opacity="' + f(o.crack) + '"');
    return s + '</g>'; }
  // the pile cap and three piles down to the sand; k = how far the piles have been dug and poured
  function piles(x, k, t, o) { o = o || {}; var s = "", depth = lerp(CAP1, PILEB, clamp(k));
    [-70, 0, 70].forEach(function (dx, i) { var px = x + dx, d2 = lerp(CAP1, PILEB, clamp(k * 1.15 - i * 0.07));
      if (d2 <= CAP1 + 2) return;
      s += R(px - 17, CAP1, 34, d2 - CAP1, "url(#colG)", { sw: 2.4 });
      for (var yy = CAP1 + 30; yy < d2 - 10; yy += 40) s += P("M" + (px - 11) + " " + yy + " h22", "#7a7468", 2, ' opacity=".6"');
      if (o.auger && d2 < PILEB - 2) { var sp = ""; for (var a = 0; a < 5; a++) sp += "M" + (px - 18) + " " + f(d2 - 70 + a * 14 + (t * 40 % 14)) + " L" + (px + 18) + " " + f(d2 - 62 + a * 14 + (t * 40 % 14)) + " ";
        s += R(px - 4, d2 - 300, 8, 230, "#8a9098", { sw: 2 }) + P(sp, "#5a6068", 5) + F("M" + (px - 18) + " " + f(d2 - 6) + " L" + (px + 18) + " " + f(d2 - 6) + " L" + px + " " + f(d2 + 18) + " Z", "#5a6068", { sw: 2 }); } });
    if (k > 0.05) s += R(x - 110, CAP0, 220, CAP1 - CAP0, "url(#conc)", { fl: "sh" });
    return s; }
  // a girder between x0 and x1 at top y: bend > 0 sags, < 0 cambers; strands shows the steel inside; dy lowers it in
  function girder(x0, x1, gt, o) { o = o || {}; var bend = o.bend || 0, dy = o.dy || 0, n = 16, top = "", bot = "", i, X, Y;
    for (i = 0; i <= n; i++) { X = lerp(x0 + 6, x1 - 6, i / n); Y = gt + dy + bend * Math.sin(Math.PI * i / n); top += (i ? " L" : "M") + f(X) + " " + f(Y); }
    for (i = n; i >= 0; i--) { X = lerp(x0 + 6, x1 - 6, i / n); Y = gt + dy + GD + bend * Math.sin(Math.PI * i / n); bot += " L" + f(X) + " " + f(Y); }
    var s = F(top + bot + " Z", "url(#girder)", { fl: "sh" });
    var flg = ""; for (i = 0; i <= n; i++) { X = lerp(x0 + 6, x1 - 6, i / n); Y = gt + dy + 14 + bend * Math.sin(Math.PI * i / n); flg += (i ? " L" : "M") + f(X) + " " + f(Y); }
    s += P(flg, "#8f8a80", 2.4); flg = ""; for (i = 0; i <= n; i++) { X = lerp(x0 + 6, x1 - 6, i / n); Y = gt + dy + GD - 12 + bend * Math.sin(Math.PI * i / n); flg += (i ? " L" : "M") + f(X) + " " + f(Y); } s += P(flg, "#8f8a80", 2.4);
    if (o.strands) { var sk = clamp(o.strands); for (var r = 0; r < 3; r++) { var d = ""; for (i = 0; i <= n; i++) { X = lerp(x0 + 14, lerp(x0 + 14, x1 - 14, sk), i / n); var fi = (X - x0 - 6) / (x1 - x0 - 12); Y = gt + dy + GD - 20 + r * 4 + bend * Math.sin(Math.PI * fi); d += (i ? " L" : "M") + f(X) + " " + f(Y); } s += P(d, "#c8661c", 3.4); } }
    if (o.cracks) for (var c = 0; c < 5; c++) { var cx = lerp(x0, x1, 0.3 + c * 0.1), cy = gt + dy + GD + bend * Math.sin(Math.PI * (cx - x0) / (x1 - x0)); s += P("M" + f(cx) + " " + f(cy) + " l" + f(4 - hash(c) * 8) + " -14 l" + f(-4 + hash(c + 1) * 8) + " -12", "#2a1a12", 3, ' opacity="' + f(clamp(o.cracks)) + '"'); }
    return s; }
  // the rubber bearing: rubber layers with steel plates between
  function bearing(x, y, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k * 3)) + '">' + R(x - 26, y - 16, 52, 16, "url(#rubber)", { rx: 3, sw: 2 }); for (var i = 1; i < 4; i++) s += P("M" + (x - 24) + " " + (y - 16 + i * 4) + " h48", "#b9c1c9", 1.6); return s + '</g>'; }
  function bearings(g, slide) { var s = "", xs = [AB0 + 22, COLS[0] - 40, COLS[0] + 40, COLS[1] - 40, COLS[1] + 40, AB1 - 22];
    xs.forEach(function (x, i) { s += '<g transform="translate(' + f((1 - ease(clamp(slide * 1.2 - i * 0.04))) * -220) + ' 0)">' + bearing(x, g.DB + 16, clamp(slide * 1.2 - i * 0.04)) + '</g>'; }); return s; }
  // the concrete barrier along the road profile
  function barrier(g, k, top) { if (k <= 0) return ""; var d = "", e = "", x, x1 = lerp(RAMP0, RAMP1, clamp(k));
    for (x = RAMP0; x <= x1; x += 40) d += (x === RAMP0 ? "M" : " L") + x + " " + f(roadY(x, g, top) - 52);
    for (x = Math.floor(x1 / 40) * 40; x >= RAMP0; x -= 40) e += " L" + x + " " + f(roadY(x, g, top));
    var s = F(d + e + " Z", "url(#conc)", { fl: "sh" }), l = ""; for (x = RAMP0; x <= x1; x += 40) l += (x === RAMP0 ? "M" : " L") + x + " " + f(roadY(x, g, top) - 20); return s + P(l, "#8f8a80", 2.4); }
  function lamps(g, k, night) { var s = ""; for (var i = 0; i < 6; i++) { var x = -40 + i * 240, kk = clamp(k * 6 - i); if (kk <= 0) continue; var y = roadY(x, g) - 52, h = 260 * ease(kk);
      s += P("M" + x + " " + y + " V" + f(y - h), "#5a6068", 8) + (kk > 0.9 ? P("M" + x + " " + f(y - h) + " q0 -26 40 -26 h24", "#5a6068", 7) + R(x + 54, y - h - 34, 40, 14, "#fff6c0", { rx: 5, sw: 2 }) + (night ? C(x + 74, y - h - 10, 120, "url(#bulb)", { op: 0.8 }) : "") : ""); } return s; }
  function laneLines(g, k) { if (k <= 0) return ""; var s = "", x1 = lerp(RAMP0, RAMP1, clamp(k)); for (var x = RAMP0 + 30; x < x1; x += 110) s += P("M" + x + " " + f(roadY(x, g) - 3) + " L" + (x + 50) + " " + f(roadY(x + 50, g) - 3), "#f2efe6", 5); return s; }
  // drains: grates on the deck edge and a pipe down beside each column
  function drains(g, k, t) { if (k <= 0) return ""; var s = "";
    COLS.forEach(function (x) { var y0 = g.RT, h = (GY - y0) * clamp(k); s += R(x + 46, y0 - 4, 30, 8, "#2a2d31", { sw: 1.5 }) + P("M" + (x + 61) + " " + y0 + " V" + f(y0 + h), INK, 13) + P("M" + (x + 61) + " " + y0 + " V" + f(y0 + h), "#8a9098", 8);
      if (k >= 1 && t != null) for (var j = 0; j < 3; j++) { var p = (t * 1.5 + j / 3) % 1; s += C(x + 61, GY - 4 + p * 26, 5 * (1 - p), "#5fb0e6"); } });
    return s; }
  // the night mobile crane on the cross street, its hook at (hx, hy)
  function crane(t, hx, hy, load) { var bx = 560, by = GY + 34, s = '<g filter="url(#sh)">';
    s += R(bx - 200, by - 70, 340, 50, "url(#crane)", { rx: 6 }) + R(bx + 140, by - 130, 90, 110, "url(#crane)", { rx: 8 }) + R(bx + 156, by - 118, 50, 42, "url(#glass)", { sw: 2 });
    [-160, -90, 60, 180].forEach(function (wx) { s += C(bx + wx, by - 16, 26, "#1e2024", { st: INK, sw: 3 }) + C(bx + wx, by - 16, 10, "#9aa2ac"); });
    s += P("M" + (bx - 200) + " " + (by - 40) + " l-50 40 M" + (bx + 200) + " " + (by - 40) + " l50 40", "#5a6068", 8);
    var px = bx - 30, py = by - 110; s += R(px - 50, py - 30, 100, 44, "url(#crane)", { rx: 6 });
    var tx = hx, ty = hy - 120; s += P("M" + px + " " + py + " L" + f(tx) + " " + f(ty), INK, 34) + P("M" + px + " " + py + " L" + f(tx) + " " + f(ty), "#f2c230", 26) + P("M" + px + " " + py + " L" + f(tx) + " " + f(ty), "#ffe27a", 6, ' opacity=".7"');
    s += P("M" + f(tx) + " " + f(ty) + " V" + f(hy), INK, 3) + C(tx, ty, 9, "#5a6068", { st: INK, sw: 2 }) + '</g>';
    s += C(bx + 185, by - 136, 8, Math.sin(t * 8) > 0 ? "#ffb02a" : "#7a5010") + (Math.sin(t * 8) > 0 ? C(bx + 185, by - 136, 40, "url(#bulb)", { op: 0.7 }) : "");
    return s; }
  function scaffold(x0, x1, y0, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k * 2)) + '">', top = lerp(GY, y0, ease(k));
    for (var x = x0; x <= x1; x += 60) s += P("M" + x + " " + GY + " V" + f(top), "#8a9098", 5);
    for (var y = GY - 60; y > top; y -= 70) s += P("M" + x0 + " " + y + " H" + x1, "#8a9098", 4);
    for (x = x0; x < x1; x += 60) for (y = GY; y - 70 > top; y -= 70) s += P("M" + x + " " + y + " L" + (x + 60) + " " + (y - 70), "#a8aeb6", 2.4);
    if (k > 0.8) s += R(x0 - 10, top - 14, x1 - x0 + 20, 14, "url(#wood)", { sw: 2 });
    return s + '</g>'; }
  function rain(t, k) { if (k <= 0) return ""; var s = R(-900, -900, 2900, 3400, "#3a4a5a", { sw: 0, op: 0.22 * k }); for (var i = 0; i < 90; i++) { var x = -400 + hash(i) * 1900, y = ((hash(i + 5) * 2200 + t * 1400) % 2200) - 300; s += P("M" + f(x) + " " + f(y) + " l-10 40", "#d8e6f2", 3, ' opacity="' + f(0.6 * k) + '"'); } return s; }
  function thermo(x, y, v, k) { if (k <= 0) return ""; var h = 160 * clamp(v); return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x - 16, y - 180, 32, 190, "#fff", { rx: 16, sw: 4 }) + R(x - 7, y - h, 14, h, "#e8452e", { sw: 0 }) + C(x, y + 14, 24, "#e8452e", { st: INK, sw: 4 }) + '</g>'; }
  function dimV(x, y0, y1, label, k) { if (k <= 0) return ""; var y = lerp(y0, y1, ease(k)); return P("M" + x + " " + y0 + " V" + f(y), "#ffd23a", 6) + P("M" + (x - 20) + " " + y0 + " h40", "#ffd23a", 6) + (k >= 1 ? P("M" + (x - 20) + " " + y1 + " h40", "#ffd23a", 6) : "") + (k > 0.8 ? pill(label, x - 110, (y0 + y1) / 2, 1, 0, { col: "#ffd23a", down: false, sz: 52 }) : ""); }

  // the magnifier: the deck in cross-section (across the road) for the slope, the drains and the barrier
  // o: slope (0…1), water (0…1, runs to the edge), drain, barrier (0…1), car: {x: -1…1 across, tip, lift}
  function xsec(cx, cy, r, k, t, o) { if (k <= 0) return ""; o = o || {}; var s = '<g transform="translate(' + cx + ' ' + cy + ') scale(' + f(K.pop(k)) + ')">';
    s += '<defs><clipPath id="xs"><circle cx="0" cy="0" r="' + r + '"/></clipPath></defs>' + C(0, 0, r + 14, "#262a30", { st: "#111", sw: 4 }) + '<g clip-path="url(#xs)">' + C(0, 0, r, "#cfe3f0");
    if (o.rain) for (var i = 0; i < 30; i++) { var rx = -r + hash(i + 2) * 2 * r, ry = ((hash(i + 9) * 2 * r + t * 900) % (2 * r)) - r; s += P("M" + f(rx) + " " + f(ry) + " l-6 24", "#8aa8c0", 3); }
    var W = 230, sl = 34 * clamp(o.slope || 0), yd = 60;   // deck half width, crown rise (exaggerated 2 %), deck top at the edges
    function top(x) { return yd - sl * (1 - Math.abs(x) / W); }
    s += F("M" + (-W) + " " + yd + " L0 " + f(yd - sl) + " L" + W + " " + yd + " L" + W + " " + (yd + 34) + " L" + (-W) + " " + (yd + 34) + " Z", "url(#conc)");
    [-150, 0, 150].forEach(function (gx) { s += F("M" + (gx - 46) + " " + (yd + 34) + " h92 v12 h-30 v60 h40 v18 h-112 v-18 h40 v-60 h-30 Z", "url(#girder)", { sw: 2.4 }); });
    if (o.slope) s += pill("٢٪", -110, yd - 50, 1, 0, { sz: 28, col: "#ffd23a", down: false }) + P("M-40 " + f(top(-40) - 18) + " L-170 " + f(top(-170) - 18), "#ffd23a", 5) + F("M-176 " + f(top(-176) - 18) + " l16 -12 l2 16 Z", "#ffd23a", { sw: 0 });
    if (o.water) { var wk = clamp(o.water); if (o.slope) { for (var j = 0; j < 6; j++) { var p = (t * 0.8 + j / 6) % 1, sgn = j % 2 ? 1 : -1, wx = sgn * lerp(20, W - 20, p); s += C(wx, top(wx) - 6, 9, "#5fb0e6", { st: "#2a6fa8", sw: 1.5, op: wk }); } }
      else s += F("M-120 " + yd + " Q0 " + (yd - 22 * wk) + " 120 " + yd + " Z", "#5fb0e6", { sw: 2, op: 0.85 * wk }); }
    if (o.drain) [-1, 1].forEach(function (sg) { s += R(sg * (W - 18) - 12, yd - 4, 24, 8, "#2a2d31", { sw: 1.5 }) + P("M" + (sg * (W - 18)) + " " + (yd + 4) + " v40 h" + (sg * 34) + " V" + (r + 20), "#8a9098", 10); if (o.water) for (var q = 0; q < 2; q++) { var pq = (t * 1.2 + q / 2) % 1; s += C(sg * (W + 16), lerp(yd + 60, r, pq), 6, "#5fb0e6"); } });
    var bk = clamp(o.barrier || 0); if (bk > 0) [-1, 1].forEach(function (sg) { var bx = sg * W, h = 76 * ease(bk); s += F("M" + bx + " " + yd + " L" + f(bx - sg * 44) + " " + yd + " L" + f(bx - sg * 40) + " " + f(yd - h * 0.12) + " L" + f(bx - sg * 26) + " " + f(yd - h * 0.4) + " L" + f(bx - sg * 16) + " " + f(yd - h) + " L" + bx + " " + f(yd - h) + " Z", "url(#conc)"); });
    if (o.car) { var c = o.car, x = c.x * W, y = top(x), tip = c.tip || 0;
      s += '<g transform="translate(' + f(x) + ' ' + f(y - (c.lift || 0)) + ') rotate(' + f(tip) + ')">' + '<g transform="translate(0 0)">' + carRear(0, 0, "url(#carB)", { yb: 0, sc: 0.8 }) + '</g></g>'; }
    s += '</g>' + T("مقطع في الكوبري", 0, -r + 44, 26, "#fff", { stroke: "#262a30" }) + '</g>';
    return s; }

  // ── the whole picture: sky, far town, the soil, the street, the build, the traffic ──
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o), g = geo(b), s = "";
    s += K.sky(t, h.night) + (h.rainSky ? R(-900, -900, 2900, GY + 900, "url(#skyR)", { sw: 0, op: clamp(h.rainSky) * 0.85 }) : "");
    if (h.heat) s += C(880, 120, 300 + 30 * Math.sin(t * 3), "url(#hot)", { op: clamp(h.heat) });
    s += K.palm(-420, t, 1.1) + K.palm(1500, t, 1.0) + K.bush(-260, 1.1) + K.bush(1350, 1) + K.ground(t) + soil() + street(t);
    if (b.piles || h.piles != null) COLS.forEach(function (x) { s += piles(x, h.piles != null ? h.piles : 1, t, { auger: h.auger }); });
    if (h.hill != null && h.hill > 0.02) s += hill(g, h.hill); else s += ramps(g, b);
    if (h.scaffold) s += scaffold(AB0, AB1, g.GT, h.scaffold);
    if (b.cols || h.colH != null) COLS.forEach(function (x, i) { s += column(x, g, { h: h.colH, sink: (h.sink || 0) * (i ? 1.2 : 1), tilt: (h.sink || 0) * (i ? 0.09 : -0.07), crack: h.sink ? clamp(h.sink / 40) : 0 }); });
    if (h.cross) s += crossTraffic(t, h.cross);
    if (h.truckK != null) s += carRear(540, h.truckK, "", { truck: 1, th: 420, brake: h.truckBrake });
    s += drains(g, b.drain ? 1 : (h.drain || 0), h.rainSky ? t : null);
    var bear = h.bear != null ? h.bear : (b.bear ? 1 : 0); if (bear) s += bearings(g, bear);
    SPANS.forEach(function (sp, i) { var gk = b.girders ? 1 : (h.girders ? clamp(h.girders * 3 - i) : 0); if (gk <= 0) return;
      var mid = i === 1, gi = h.gi || {}; s += girder(sp[0], sp[1], g.GT, { dy: b.girders ? 0 : (1 - ease(gk)) * -260, bend: mid ? (gi.bend || 0) : (gi.allBend || 0), strands: (mid || gi.all) ? (gi.strands != null ? gi.strands : (b.strands ? 1 : 0)) : 0, cracks: mid ? gi.cracks : 0 });
      if (gi.endChip && i < 2) { var ex = sp[1] - 6; s += P("M" + f(ex) + " " + f(g.DB - 2) + " l-12 -20 l8 -12", "#2a1a12", 3, ' opacity="' + f(gi.endChip) + '"'); } });
    if (b.slab || h.slab) { var sk = b.slab ? 1 : clamp(h.slab); if (sk > 0) s += R(AB0, g.GT - SLAB, (AB1 - AB0) * sk, SLAB + 2, "url(#conc)", { sw: 2.4 }); }
    if (b.asph || h.asph) { var ak = b.asph ? 1 : clamp(h.asph); var d = "", e = ""; for (var x = RAMP0; x <= RAMP1; x += 40) { d += (x === RAMP0 ? "M" : " L") + x + " " + f(roadY(x, g) - ASPH); } for (x = RAMP1; x >= RAMP0; x -= 40) e += " L" + x + " " + f(roadY(x, g) + 2); s += F(d + e + " Z", "url(#asph)", { sw: 2, op: ak }); }
    s += laneLines(g, b.lines ? 1 : (h.lines || 0));
    if (h.deckCars) s += deckTraffic(t, g, h.deckCars, (b.asph || h.asph) ? g.HT - ASPH : g.HT);
    s += barrier(g, b.barrier ? 1 : (h.barrier || 0), (b.asph || h.asph) ? g.HT - ASPH : g.HT);
    s += lamps(g, b.lamps ? 1 : (h.lamps || 0), h.night);
    return s; }
  window.__flyGeo = geo;

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[2, { cols: 1 }], [4, { piles: 1 }], [6, { girders: 1 }], [8, { strands: 1 }], [11, { slab: 1 }], [13, { bear: 1 }], [15, { lift: 1 }], [17, { drain: 1 }], [19, { barrier: 1 }], [20, { asph: 1, lamps: 1, lines: 1 }]]);
  function G(line, extra) { return geo(has(extra || {}, line)); }
  function road(line, extra) { var g = G(line, extra); return g.RT; }

  // 0 — pile up a high hill of earth in the middle of the street, drive the cars over it: a bridge
  shot(0, [600, 900, 1.5], [640, 920, 1.65], function (u, d, t) {
    var g = G(0), s = scene(t, {}, { hill: clamp(u / 1.2) });
    if (u > 1.2) s += '<g opacity="' + f(clamp((u - 1.2) / 0.4)) + '">' + deckTraffic(t, g, 4) + '</g>';
    s += act(u, [[0, { x: 760, y: g.HT, f: -1, p: "stand", mood: "n" }], [1.4, { x: 760, y: g.HT, f: -1, p: "wave", mood: "happy" }], [3.2, { x: 760, y: g.HT, f: -1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("تل تراب", 560, g.HT + 160, u, 0.8) + pill("كوبري؟", 540, g.HT - 280, u, 2.6, { col: "#ffd23a" });
  });
  // 1 — but the hill closed the street under it, nobody can cross
  shot(1, [420, 1040, 1.5], [430, 1050, 1.65], function (u, d, t) {
    var g = G(1), s = scene(t, {}, { hill: 1 }) + deckTraffic(t, g, 3);
    s += carRear(540, 0, "url(#carR)", { brake: true }) + '<g transform="translate(240 0)">' + carRear(540, 0.0, "url(#carY)", { brake: true }).replace(/^/, "") + '</g>';
    s += act(u, [[0, { x: 200, y: GY + 20, f: 1, p: "point", mood: "n" }], [1.6, { x: 200, y: GY + 20, f: 1, p: "shock", mood: "shock" }]], t);
    return s + xmark(540, GY - 220, u, 0.9, 0.9) + pill("الشارع اتقفل!", 540, GY - 360, u, 1.2, { bg: "#c7321f" });
  });
  // 2 — so you take the earth out of the middle, keep it only for the ramps, and put concrete columns there instead
  shot(2, [320, 1050, 1.5], [540, 1000, 1.0], function (u, d, t) {
    var g = G(2), dig = clamp((u - 0.4) / 2.4), up = clamp((u - 2.6) / 2.0), s = scene(t, {}, { hill: 1 - dig, colH: up > 0 ? up : 0 });
    if (up >= 1) s += crossTraffic(t, 2);
    s += act(u, [[0, { x: 180, y: GY + 20, f: 1, p: "dig", mood: "n" }], [2.8, { x: 180, y: GY + 20, f: 1, p: "dig", mood: "n" }], [3.6, { x: 180, y: GY + 20, f: 1, p: "pointUp", mood: "happy" }], [4.8, { x: 180, y: GY + 20, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("الطلعة", -330, g.HT + 120, u, 1.0) + pill("النزلة", 1410, g.HT + 120, u, 1.4) + pill("عمدان خرسانة", 540, g.DB - 160, u, 3.4, { col: "#ffd23a" }) + ring(COLS[0], GY - 160, 110, u, 3.6, t) + ring(COLS[1], GY - 160, 110, u, 3.8, t);
  });
  // 3 — but Cairo sits on Nile clay, and the heavy column sinks into it and leans
  shot(3, [540, 1280, 1.0], [540, 1320, 1.12], function (u, d, t) {
    var sk = 42 * ease(clamp((u - 0.8) / 2.6)), s = scene(t, {}, { sink: sk, cross: 2 });
    s += act(u, [[0, { x: 150, y: GY + 20, f: 1, p: "point", mood: "n" }], [1.6, { x: 150, y: GY + 20, f: 1, p: "worry", mood: "worry" }], [3.2, { x: 150, y: GY + 20, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("طين النيل", 760, GY + 420, u, 0.4, { sz: 44 }) + K.arrowV(COLS[0], GY + 130, GY + 260, "#e8452e", 10, clamp((u - 1.2) / 0.6)) + K.arrowV(COLS[1], GY + 130, GY + 260, "#e8452e", 10, clamp((u - 1.4) / 0.6)) + xmark(COLS[1] + 150, GY - 200, u, 2.6, 0.9) + pill("بيغطس!", COLS[0], GY - 420, u, 2.4, { bg: "#c7321f" });
  });
  // 4 — so you dig 30 m under each column and pour piles down to firm sand
  shot(4, [520, 1420, 1.2], [540, 1460, 1.28], function (u, d, t) {
    var k = clamp((u - 0.5) / 4.0), s = scene(t, {}, { piles: k, auger: k < 1, cross: 2 });
    s += act(u, [[0, { x: 150, y: GY + 20, f: 1, p: "pointUp", mood: "n" }], [2.6, { x: 150, y: GY + 20, f: 1, p: "point", mood: "n" }], [4.8, { x: 150, y: GY + 20, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("خوازيق", 540, GY + 420, u, 1.2, { col: "#ffd23a" }) + pill("رمل صلب", 540, SAND - 90, u, 3.6, { col: "#ffd23a" }) + dimV(COLS[0] - 190, CAP0, PILEB, "٣٠ متر", clamp((u - 1.2) / 3.0));
  });
  // 5 — but if you pour the deck in place, scaffolding closes the street for months
  shot(5, [460, 1000, 1.2], [470, 1010, 1.35], function (u, d, t) {
    var g = G(5), sc = clamp((u - 0.2) / 1.4), s = scene(t, {}, { scaffold: sc });
    s += carRear(540, 0, "url(#carB)", { brake: true });
    s += act(u, [[0, { x: 150, y: GY + 20, f: 1, p: "stand", mood: "n" }], [1.4, { x: 150, y: GY + 20, f: 1, p: "worry", mood: "worry" }], [2.6, { x: 150, y: GY + 20, f: 1, p: "collar", mood: "dizzy" }]], t);
    return s + pill("سقالات", 540, g.GT - 70, u, 0.9) + xmark(540, GY - 300, u, 1.6, 0.9) + pill("شهور!", 700, GY - 200, u, 2.0, { bg: "#c7321f" });
  });
  // 6 — so you cast ready girders in a factory, and a big crane sets them between the columns at night
  shot(6, [540, 980, 0.95], [560, 1000, 1.02], function (u, d, t) {
    var g = G(6), k = clamp((u - 0.3) / 3.6), s = scene(t, {}, { night: true, girders: k }), i = Math.min(2, Math.floor(k * 3)), gk = clamp(k * 3 - i);
    var hx = (SPANS[i][0] + SPANS[i][1]) / 2, hy = g.GT + (1 - ease(gk)) * -260 - 4;
    if (k < 1) s += crane(t, hx, hy); else s += crane(t, (SPANS[2][0] + SPANS[2][1]) / 2, g.GT - 220);
    s += act(u, [[0, { x: 1000, y: GY + 20, f: -1, p: "pointUp", mood: "n" }], [2.4, { x: 1000, y: GY + 20, f: -1, p: "point", mood: "n" }], [3.8, { x: 1000, y: GY + 20, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كمرات جاهزة", 540, g.GT - 330, u, 0.6, { col: "#ffd23a" }) + pill("بالليل", 160, 380, u, 1.6);
  });
  // 7 — but concrete is strong in compression and only a tenth as strong in tension: the girder's belly cracks
  shot(7, [500, 990, 1.4], [500, 1000, 1.5], function (u, d, t) {
    var g = G(7), k = clamp((u - 1.4) / 2.2), bend = 26 * ease(k), s = scene(t, {}, { gi: { bend: bend, cracks: clamp((u - 2.6) / 0.8) }, cross: 2 });
    var tx = lerp(-200, 540, ease(clamp(u / 1.6))); s += carSide(tx, g.GT + bend * Math.sin(Math.PI * clamp((tx - 340) / 400)), 1, "url(#carY)", t, { truck: 1, v: u < 1.6 ? 1 : 0 });
    s += K.arrowH(470, g.GT + 26, 520, "#2f6f9f", 8, clamp((u - 0.6) / 0.4)) + K.arrowH(610, g.GT + 26, 560, "#2f6f9f", 8, clamp((u - 0.6) / 0.4));
    s += K.arrowH(520, g.DB + bend + 30, 440, "#e8452e", 8, clamp((u - 2.4) / 0.4)) + K.arrowH(560, g.DB + bend + 30, 640, "#e8452e", 8, clamp((u - 2.4) / 0.4));
    s += act(u, [[0, { x: 230, y: GY + 20, f: 1, p: "point", mood: "n" }], [2.8, { x: 230, y: GY + 20, f: 1, p: "shock", mood: "shock" }], [4.2, { x: 230, y: GY + 20, f: 1, p: "cover", mood: "shock" }]], t);
    return s + pill("ضغط", 300, g.GT - 120, u, 0.6, { col: "#9fd6ff", sz: 36 }) + pill("شد: عُشره بس", 540, g.DB + 120, u, 2.4, { bg: "#c7321f", sz: 36 }) + xmark(700, g.DB + 40, u, 3.2, 0.6);
  });
  // 8 — so before pouring the girder you stretch steel strands inside it, so it stays squeezed: prestressed concrete
  shot(8, [520, 970, 1.55], [520, 980, 1.4], function (u, d, t) {
    var g = G(8), sk = clamp((u - 0.5) / 1.6), rel = clamp((u - 3.6) / 0.6), s = scene(t, {}, { gi: { strands: sk, bend: 26 * (1 - ease(clamp((u - 0.2) / 0.6))) }, cross: 2 });
    var pull = u > 2.1 && u < 3.6; if (pull) s += K.arrowH(360, g.GT + 40, 300, "#c8661c", 8, clamp((u - 2.1) / 0.4)) + K.arrowH(720, g.GT + 40, 780, "#c8661c", 8, clamp((u - 2.1) / 0.4));
    if (rel > 0) s += K.arrowH(380, g.GT + 40, 460, "#3aa05a", 8, rel) + K.arrowH(700, g.GT + 40, 620, "#3aa05a", 8, rel);
    s += act(u, [[0, { x: 430, y: GY + 20, f: 1, p: "pointUp", mood: "n" }], [2.0, { x: 430, y: GY + 20, f: 1, p: "push", mood: "n" }], [4.6, { x: 430, y: GY + 20, f: 1, p: "pointUp", mood: "happy" }], [6.4, { x: 430, y: GY + 20, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("أسلاك حديد مشدودة", 540, g.GT - 120, u, 1.0, { col: "#ffb070", sz: 34 }) + pill("سابقة الإجهاد", 540, g.DB + 130, u, 5.2, { col: "#ffd23a", sz: 40 }) + ring(540, g.GT + 30, 90, u, 4.0, t);
  });
  // 9 — the odd thing: many think the girder comes out flat as a ruler
  shot(9, [520, 960, 1.45], [520, 960, 1.6], function (u, d, t) {
    var g = G(9), s = scene(t, {}, { cross: 2 }), ry = g.GT - 30, rk = clamp((u - 0.4) / 0.6);
    s += '<g opacity="' + f(rk) + '" filter="url(#sh)">' + R(350, ry - 22, 380, 22, "#f2c230", { rx: 3 }); for (var m = 0; m < 20; m++) s += P("M" + (356 + m * 19) + " " + (ry - 22) + " v" + (m % 5 ? 8 : 14), INK, 2); s += '</g>';
    s += act(u, [[0, { x: 430, y: GY + 20, f: 1, p: "stand", mood: "n" }], [1.0, { x: 430, y: GY + 20, f: 1, p: "shrug", mood: "n" }]], t);
    return s + pill("مستوية؟", 540, ry - 110, u, 0.9, { sz: 44 });
  });
  // 10 — really the stretched strands bow it up a few centimetres as soon as it leaves the mould
  shot(10, [520, 970, 1.6], [520, 990, 1.75], function (u, d, t) {
    var g = G(10), cam = -30 * ease(clamp((u - 0.5) / 1.4)), s = scene(t, {}, { gi: { bend: cam }, cross: 2 }), ry = g.GT - 30;
    s += '<g opacity=".85">' + R(350, ry - 22 + cam, 380, 22, "#f2c230", { rx: 3, sw: 2 }) + '</g>';
    s += P("M540 " + f(g.GT) + " V" + f(g.GT + cam), "#e8452e", 6) + K.arrowV(540, g.GT + 40, g.GT + cam + 10, "#e8452e", 8, clamp((u - 0.8) / 0.6));
    s += act(u, [[0, { x: 430, y: GY + 20, f: 1, p: "shrug", mood: "n" }], [1.4, { x: 430, y: GY + 20, f: 1, p: "shock", mood: "shock" }], [3.4, { x: 430, y: GY + 20, f: 1, p: "pointUp", mood: "happy" }]], t);
    return s + pill("مقوّسة لفوق!", 540, g.GT - 160, u, 1.4, { bg: "#c7321f" }) + pill("كام سم", 680, g.DB + 90, u, 2.2, { col: "#ffd23a", sz: 34 });
  });
  // 11 — so you pour a concrete layer on top to level the road and tie all girders into one slab
  shot(11, [300, 820, 1.4], [760, 820, 1.4], function (u, d, t) {
    var g = G(11), k = clamp((u - 0.6) / 3.2), s = scene(t, {}, { gi: { bend: -30 * (1 - ease(clamp((u - 0.2) / 0.6))) * 0 }, slab: k });
    var mx = lerp(AB0 + 60, AB1 - 120, k), my = geo(has({ slab: 1 }, 11)).ST;
    s += act(u, [[0, { x: AB0 + 80, y: my, f: 1, p: "point", mood: "n" }], [0.6, { x: AB0 + 80, y: my, f: 1 }], [3.6, { x: AB1 - 200, y: my, f: 1 }], [3.8, { x: AB1 - 200, y: my, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("بلاطة واحدة", 540, g.GT - 210, u, 2.4, { col: "#ffd23a" });
  });
  // 12 — but a girder sitting concrete-on-concrete on the column chips its ends as it grows in the heat
  shot(12, [700, 1040, 2.3], [720, 1050, 2.5], function (u, d, t) {
    var g = G(12), hk = clamp(u / 1.0), chip = clamp((u - 1.8) / 0.8), sl = 4 * Math.sin(t * 4) * hk, s = scene(t, {}, { heat: hk, gi: { endChip: chip }, deckCars: 2 });
    s += K.arrowH(640, g.GT + 30, 690, "#e8452e", 7, clamp((u - 0.8) / 0.4)) + K.arrowH(840, g.GT + 30, 790, "#e8452e", 7, clamp((u - 0.8) / 0.4));
    if (chip > 0) for (var c = 0; c < 4; c++) { var p = clamp(chip * 1.4 - c * 0.15), cx = 734 + c * 6 - 10, cy = g.DB + p * 260; if (p > 0 && p < 1) s += F("M" + f(cx) + " " + f(cy) + " l10 -4 l4 9 l-9 6 Z", "#b3afa6", { sw: 2 }); }
    s += thermo(560, g.DB - 40, lerp(0.3, 0.95, hk), hk);
    s += act(u, [[0, { x: 640, y: GY + 20, f: 1, p: "collar", mood: "dizzy" }], [2.2, { x: 640, y: GY + 20, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("خرسانة على خرسانة", 740, g.GT - 70, u, 0.4, { sz: 28 }) + xmark(800, g.DB + 60, u, 2.4, 0.5);
  });
  // 13 — so you put rubber bearings with steel plates under it, so it can creep a little: bearings
  shot(13, [720, 1050, 2.5], [730, 1040, 2.3], function (u, d, t) {
    var g = G(13, { bear: 1 }), bk = clamp((u - 0.6) / 2.0), cr = Math.sin(t * 2.4) * 5 * clamp((u - 3.0) / 0.6), s = scene(t, { bear: bk }, { bear: bk, deckCars: 2 });
    if (u > 3.0) s += K.arrowH(lerp(700, 690, 0.5) + cr, g.GT + 30, 660 + cr, "#3aa05a", 6, 1) + K.arrowH(780 + cr, g.GT + 30, 810 + cr, "#3aa05a", 6, 1);
    s += act(u, [[0, { x: 640, y: GY + 20, f: 1, p: "reach", mood: "n" }], [2.6, { x: 640, y: GY + 20, f: 1, p: "pointUp", mood: "n" }], [4.4, { x: 640, y: GY + 20, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("مطاط ورقايق حديد", 740, g.DB + 90, u, 1.6, { sz: 26, col: "#ffd23a" }) + pill("كراسي الارتكاز", 740, g.GT - 80, u, 4.6, { col: "#ffd23a", sz: 32 }) + ring(COLS[1], g.DB - 8, 60, u, 2.4, t);
  });
  // 14 — but the first tall truck hits the bridge's belly
  shot(14, [480, 1000, 1.3], [480, 1010, 1.42], function (u, d, t) {
    var g = G(14), tk = Math.min(0.62, lerp(0, 0.8, clamp(u / 1.2))), hit = u > 1.0, sh = hit ? Math.sin(t * 60) * 6 * clamp(1 - (u - 1.0) / 0.8) : 0;
    var s = '<g transform="translate(' + f(sh) + ' 0)">' + scene(t, {}, { truckK: tk, truckBrake: hit, deckCars: 2 }) + '</g>';
    s += act(u, [[0, { x: 280, y: GY + 20, f: 1, p: "point", mood: "n" }], [1.0, { x: 280, y: GY + 20, f: 1, p: "cover", mood: "shock" }]], t);
    return s + xmark(540, g.DB + 50, u, 1.0, 0.8) + pill("هيخبط!", 540, g.DB - 200, u, 0.7, { bg: "#c7321f" });
  });
  // 15 — so you raise the bridge: 5.5 m clear under it
  shot(15, [540, 980, 1.0], [540, 960, 0.92], function (u, d, t) {
    var lk = ease(clamp((u - 0.3) / 1.4)), s = scene(t, { lift: lk }, { truckK: lerp(0.3, 0.95, clamp((u - 1.6) / 1.8)), deckCars: 2 }), g = geo(has({ lift: lk }, 15));
    s += dimV(860, GY - 12, g.DB, "٥٫٥ متر", clamp((u - 1.6) / 0.8));
    s += act(u, [[0, { x: 280, y: GY + 20, f: 1, p: "push", mood: "n" }], [1.6, { x: 280, y: GY + 20, f: 1, p: "cheer", mood: "happy" }], [2.8, { x: 280, y: GY + 20, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s;
  });
  var DK = function (line) { return G(line).RT; };
  // 16 — but at the first rain, water pools on the bridge and cars skid on it
  shot(16, [400, 960, 1.3], [420, 960, 1.38], function (u, d, t) {
    var g = G(16), rk = clamp(u / 0.8), pk = clamp((u - 0.8) / 1.6), s = scene(t, {}, { rainSky: rk }) + R(380, g.RT - 6, 400 * pk, 8, "#5fb0e6", { rx: 4, sw: 2, op: 0.9 });
    var cx = lerp(-60, 520, ease(clamp(u / 2.6))), sp = u > 2.0 ? 14 * Math.sin((u - 2.0) * 8) : 0; s += carSide(cx, g.RT, 1, "url(#carR)", t, { ang: sp });
    if (u > 2.0) for (var j = 0; j < 5; j++) s += C(cx - 120 - j * 14, g.RT - 10 - hash(j) * 20, 6, "#9fd6ff", { op: 0.8 });
    s += rain(t, rk) + act(u, [[0, { x: 140, y: GY + 20, f: 1, p: "stand", mood: "n" }], [1.0, { x: 140, y: GY + 20, f: 1, p: "worry", mood: "worry" }], [2.4, { x: 140, y: GY + 20, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("بركة!", 580, g.RT - 160, u, 1.4, { bg: "#c7321f" });
  });
  // 17 — so you tilt the deck 2 % to the side, with drains taking the water down a pipe by the column
  shot(17, [520, 800, 1.15], [525, 805, 1.12], function (u, d, t) {
    var g = G(17), sl = clamp((u - 0.4) / 1.2), dr = clamp((u - 2.4) / 1.4), s = scene(t, {}, { rainSky: 0.8, drain: dr, deckCars: 2 }) + rain(t, 0.8);
    s += xsec(600, g.RT - 330, 260, clamp(u / 0.4), t, { slope: sl, water: 1, drain: dr > 0.3, rain: true });
    s += act(u, [[0, { x: 140, y: GY + 20, f: 1, p: "pointUp", mood: "n" }], [3.6, { x: 140, y: GY + 20, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("بلاعات", COLS[0] + 160, g.RT + 150, u, 3.0, { col: "#9fd6ff", sz: 32 });
  });
  // 18 — but one car losing its steering falls off onto the street
  shot(18, [520, 800, 1.15], [525, 805, 1.12], function (u, d, t) {
    var g = G(18), k = ease(clamp((u - 0.3) / 1.8)), s = scene(t, {}, { deckCars: 2 });
    s += xsec(600, g.RT - 330, 260, 1, t, { slope: 1, drain: 1, car: { x: lerp(0, 1.15, k), tip: 40 * clamp((k - 0.75) / 0.25), lift: -60 * clamp((k - 0.8) / 0.2) } });
    s += act(u, [[0, { x: 140, y: GY + 20, f: 1, p: "point", mood: "n" }], [1.6, { x: 140, y: GY + 20, f: 1, p: "shock", mood: "shock" }]], t);
    return s + xmark(860, g.RT - 200, u, 1.8, 0.7) + pill("هتقع!", 600, g.RT - 600, u, 1.6, { bg: "#c7321f" });
  });
  // 19 — so you build a low concrete wall each side, its sloped face turns the wheel back: the concrete barrier
  shot(19, [520, 800, 1.15], [525, 805, 1.12], function (u, d, t) {
    var g = G(19), bk = clamp((u - 0.4) / 1.4), ck = clamp((u - 2.2) / 2.4), cx = ck < 0.5 ? lerp(0, 0.72, ease(ck * 2)) : lerp(0.72, 0.2, ease((ck - 0.5) * 2)), lift = ck > 0.35 && ck < 0.65 ? 18 * Math.sin((ck - 0.35) / 0.3 * Math.PI) : 0;
    var s = scene(t, {}, { barrier: bk, deckCars: 2 }) + xsec(600, g.RT - 330, 260, 1, t, { slope: 1, drain: 1, barrier: bk, car: { x: cx, tip: -lift * 0.6, lift: lift } });
    s += act(u, [[0, { x: 140, y: GY + 20, f: 1, p: "point", mood: "n" }], [3.4, { x: 140, y: GY + 20, f: 1, p: "pointUp", mood: "n" }], [5.4, { x: 140, y: GY + 20, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("الحاجز الخرساني", 600, g.RT - 600, u, 4.8, { col: "#ffd23a" }) + ring(600 + 230 * 0.9, g.RT - 330 + 20, 54, u, 1.6, t);
  });
  // 20 — what's left: asphalt, lamp posts and white lines
  shot(20, [380, 700, 1.4], [460, 740, 1.15], function (u, d, t) {
    var g = G(20), s = scene(t, {}, { asph: clamp((u - 0.2) / 0.8), lamps: clamp((u - 1.0) / 1.2), lines: clamp((u - 2.0) / 1.2) }), rt = G(20, { asph: 1 }).RT;
    s += act(u, [[0, { x: 140, y: lerp(g.RT, rt, clamp((u - 0.2) / 0.8)), f: 1, p: "point", mood: "n" }], [2.6, { x: 140, y: rt, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("أسفلت", 540, rt - 120, u, 0.4) + pill("أعمدة نور", 220, rt - 420, u, 1.2) + pill("خطوط", 700, rt - 120, u, 2.2);
  });
  // 21 — congratulations, you built a bridge over the street yourself
  shot(21, [360, 720, 1.3], [540, 960, 0.8], function (u, d, t) {
    var g = G(21), s = scene(t, {}, { deckCars: 4, cross: 3, night: false }) + K.confetti(t, -100, 1180, g.RT - 700, GY);
    s += act(u, [[0, { x: 140, y: g.RT, f: 1, p: "cheer", mood: "happy" }], [1.4, { x: 140, y: g.RT, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("مبروك!", 540, g.RT - 420, u, 0.3, { col: "#9fe8b0", sz: 60 });
  });
  // 22 — outro
  shot(22, [540, 960, 0.8], [540, 950, 0.84], function (u, d, t) {
    var g = G(22), s = scene(t, {}, { deckCars: 4, cross: 3 });
    s += act(u, [[0, { x: 140, y: g.RT, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("قولولنا!", 540, g.RT - 420, u, 0.3, { col: "#ffd23a", sz: 60 });
  });
  window.__flyover = { scene: scene, geo: geo, has: has };
})();
