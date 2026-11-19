/* «تنوّر عمارة بالشمس إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One Cairo apartment building cut open: the roof with the panels and a roof room holding the batteries, the charge
   controller and the inverter; the top flat cut open with a lamp, a fridge and an air conditioner. The system grows
   line by line, and the man acts out and reacts to every line. World units are the 1080×1920 frame at zoom 1. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.56; }); return K.act(u, Ks, t); }, pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY, BX0 = 180, BX1 = 900, ROOF = 620, F4 = 870, RX0 = 700, RX1 = 880, RY0 = 430;
  var PANX = [214, 334, 454, 574], PW = 108;

  // ── the building: facade floors 1–3, the top flat cut open, the roof with a parapet, the roof room cut open ──
  function building(t, o) {
    var s = '<g filter="url(#sh)">' + R(BX0, ROOF, BX1 - BX0, GY - ROOF, "url(#facade)") + '</g>';
    for (var fl = 0; fl < 3; fl++) { var y0 = F4 + fl * 230;
      s += R(BX0 - 10, y0 - 8, BX1 - BX0 + 20, 14, "#c9b28a", { sw: 2 });
      for (var w = 0; w < 4; w++) { var wx = BX0 + 50 + w * 170, lit = o.lit && hash(fl * 7 + w) < o.lit;
        s += R(wx, y0 + 50, 90, 120, lit ? "#ffe08a" : (o.night ? "#2a3550" : "#7fa9c8"), { sw: 3 }) + P("M" + (wx + 45) + " " + (y0 + 50) + " V" + (y0 + 170), "#fff", 4, ' opacity=".7"');
        if (lit) s += C(wx + 45, y0 + 110, 90, "url(#bulb)", { op: 0.55 });
        if (w % 2) s += R(wx - 14, y0 + 160, 118, 14, "#b89a6a", { sw: 2 }) + P("M" + (wx - 10) + " " + (y0 + 160) + " v-40 M" + (wx + 100) + " " + (y0 + 160) + " v-40 M" + (wx - 10) + " " + (y0 + 122) + " h110", "#5a4a3a", 4); } }
    s += R(BX0 + 300, GY - 150, 110, 150, "#6a4a2a", { sw: 3 }) + C(BX0 + 394, GY - 76, 5, "#e2b035");
    // top flat, cut open
    s += R(BX0, ROOF + 20, BX1 - BX0, F4 - ROOF - 20, o.night && !o.lamp ? "#3a3a4a" : "url(#wallIn)") + R(BX0, F4 - 14, BX1 - BX0, 14, "url(#floorW)", { sw: 2 }) + R(BX0, ROOF + 20, 24, F4 - ROOF - 20, "url(#wallCut)") + R(BX1 - 24, ROOF + 20, 24, F4 - ROOF - 20, "url(#wallCut)");
    if (o.night && !o.lamp) s += R(BX0, ROOF + 20, BX1 - BX0, F4 - ROOF - 20, "#0a1020", { sw: 0, op: 0.5 });
    // roof slab and parapet
    s += R(BX0 - 14, ROOF, BX1 - BX0 + 28, 22, "url(#conc)") + R(BX0 - 14, ROOF - 34, 18, 34, "url(#conc)", { sw: 2 }) + R(BX1 - 4, ROOF - 34, 18, 34, "url(#conc)", { sw: 2 });
    // a water tank and a satellite dish, Cairo-roof style
    s += '<g filter="url(#sh)">' + R(BX0 + 16, ROOF - 120, 24, 120, "#8a8f96", { sw: 2 }) + '</g>';
    // the roof room (stair room), cut open
    s += '<g filter="url(#sh)">' + R(RX0, RY0, RX1 - RX0, ROOF - RY0, "url(#wallIn)") + '</g>' + R(RX0, RY0, RX1 - RX0, 16, "#cfc3aa") + R(RX0 - 8, RY0 - 14, RX1 - RX0 + 16, 16, "url(#conc)", { sw: 2 });
    return s;
  }
  // the top flat's contents: a hanging lamp (glow 0…1), a fridge, a split air conditioner, a TV, a sofa
  function flat(t, o) {
    var s = "", g = clamp(o.glow || 0), lx = 360, ly = ROOF + 70;
    s += P("M" + lx + " " + (ROOF + 20) + " V" + (ly - 14), INK, 3) + F("M" + (lx - 20) + " " + (ly - 14) + " h40 l-6 14 h-28 Z", "#5a5f66", { sw: 2 }) + C(lx, ly + 10, 13, g > 0.1 ? "#fff6c0" : "#cfcfcf", { st: INK, sw: 2.4 });
    if (g > 0) s += C(lx, ly + 10, 160 * g, "url(#bulb)", { op: g });
    s += '<g filter="url(#sh)">' + R(210, F4 - 70, 120, 56, "url(#sofa)", { rx: 12 }) + R(204, F4 - 54, 22, 40, "#36628f", { rx: 6 }) + R(316, F4 - 54, 22, 40, "#36628f", { rx: 6 }) + '</g>';
    if (o.fridge) s += '<g filter="url(#sh)">' + R(612, F4 - 200, 86, 186, "#eef0f2", { rx: 8 }) + P("M612 " + (F4 - 132) + " h86", INK, 3) + P("M686 " + (F4 - 186) + " v40 M686 " + (F4 - 120) + " v60", "#8a8f96", 5) + (o.fridgeOn ? C(626, F4 - 190, 4, "#3aa05a") : "") + '</g>';
    if (o.ac) { var on = o.acOn; s += '<g filter="url(#sh)">' + R(420, ROOF + 40, 150, 46, "#f4f6f8", { rx: 10 }) + P("M432 " + (ROOF + 76) + " h126", "#9aa2ac", 3) + '</g>';
      if (on) for (var a = 0; a < 4; a++) { var p = (t * 0.9 + a / 4) % 1; s += P("M" + (440 + a * 32) + " " + f(ROOF + 92 + p * 60) + " q8 10 0 20", "#9fd6ff", 4, ' opacity="' + f(1 - p) + '"'); } }
    s += R(470, F4 - 120, 110, 66, "#1e2226", { rx: 4 }) + R(476, F4 - 114, 98, 54, o.tv ? "#5aa8d8" : "#2b3038", { sw: 0 }) + R(500, F4 - 54, 50, 40, "#6a4a2a", { sw: 2 });
    return s;
  }
  // a solar panel seen from the front on the roof: lying flat (squashed) or tilted on a rack, dusty, hot, with a gap below
  function panel(x, t, o) {
    var tilt = clamp(o.tilt || 0), h = lerp(30, 130, tilt), lift = (o.gap ? 34 : 6) + tilt * 10, y1 = ROOF - lift, y0 = y1 - h, s = "";
    if (tilt > 0.05 || o.gap) s += P("M" + (x + 12) + " " + f(y1) + " V" + ROOF + " M" + (x + PW - 12) + " " + f(y1) + " V" + ROOF + " M" + (x + 12) + " " + f(y0 + h * 0.3) + " L" + (x + 22) + " " + ROOF + " M" + (x + PW - 12) + " " + f(y0 + h * 0.3) + " L" + (x + PW - 22) + " " + ROOF, "#8a8f96", 6);
    s += '<g filter="url(#sh)">' + R(x, y0, PW, h, "#c9ced4", { sw: 3, rx: 3 }) + '</g>' + R(x + 5, y0 + 4, PW - 10, h - 8, "url(#cell)", { sw: 0 });
    var gr = ""; for (var c = 1; c < 4; c++) gr += "M" + f(x + 5 + c * (PW - 10) / 4) + " " + f(y0 + 4) + " V" + f(y1 - 4) + " "; for (var r = 1; r < 6; r++) gr += "M" + (x + 5) + " " + f(y0 + 4 + r * (h - 8) / 6) + " H" + (x + PW - 5) + " ";
    s += P(gr, "#8fb0e0", 1.6, ' opacity=".7"') + P("M" + f(x + 14) + " " + f(y0 + 8) + " L" + f(x + 40) + " " + f(y1 - 8), "#fff", 6, ' opacity=".25"');
    if (o.dust) s += R(x + 5, y0 + 4, PW - 10, h - 8, "url(#dust)", { sw: 0, op: clamp(o.dust) * 0.85 }) + (o.dust > 0.3 ? P("M" + (x + 20) + " " + f(y0 + h * 0.4) + " q20 -6 40 2 M" + (x + 30) + " " + f(y0 + h * 0.7) + " q24 -4 44 4", "#8a6a3a", 3, ' opacity=".6"') : "");
    if (o.hot) s += C(x + PW / 2, y0 + h / 2, 90 * clamp(o.hot), "url(#hot)") + (function () { var w = ""; for (var k = 0; k < 3; k++) { var p = (t * 0.8 + k / 3) % 1; w += P("M" + (x + 24 + k * 30) + " " + f(y0 - 6 - p * 50) + " q8 -10 0 -20 q-8 -10 0 -20", "#ff8a5a", 4, ' opacity="' + f((1 - p) * clamp(o.hot)) + '"'); } return w; })();
    return s;
  }
  function panels(t, b, o) { o = o || {}; var n = o.n != null ? o.n : (b.n || 1), s = "";
    for (var i = 0; i < 4; i++) { var k = i < 1 ? 1 : clamp(n - i); if (k <= 0) continue; var x = PANX[i] + (i === 0 && n <= 1 ? 120 : 0);
      s += '<g transform="translate(0 ' + f((1 - ease(k)) * -300) + ')" opacity="' + f(k) + '">' + panel(x, t, { tilt: o.tilt != null ? o.tilt : b.tilt, dust: o.dust, hot: o.hot, gap: o.gap != null ? o.gap : b.gap }) + '</g>'; }
    return s; }
  // the roof room's kit: lead or LiFePO4 batteries (charge level 0…1), the charge controller, the inverter (small/big)
  function equipment(t, b, o) { o = o || {}; var s = "";
    if (b.battery || o.battery) { var lvl = clamp(o.level == null ? 0.8 : o.level), li = b.li || o.li;
      for (var i = 0; i < (li ? 2 : 3); i++) { var x = RX0 + 14 + i * (li ? 80 : 54), w = li ? 70 : 46, hgt = li ? 92 : 64;
        s += '<g filter="url(#sh)">' + R(x, ROOF - hgt, w, hgt, li ? "url(#batLi)" : "url(#batLead)", { rx: 6 }) + '</g>' + R(x + w * 0.2, ROOF - hgt - 8, 8, 8, "#d8352a", { sw: 1.5 }) + R(x + w * 0.65, ROOF - hgt - 8, 8, 8, "#2a2a2a", { sw: 1.5 });
        s += R(x + 8, ROOF - hgt + 12, w - 16, 12, "#1e2226", { sw: 1.5 }) + R(x + 9, ROOF - hgt + 13, (w - 18) * lvl, 10, lvl > 0.3 ? "#5ad07a" : "#e8452e", { sw: 0 });
        if (li) s += T("LiFePO₄", x + w / 2, ROOF - 30, 13, "#2a6a4a"); }
      if (o.heat) s += C(RX0 + 90, ROOF - 40, 90 * clamp(o.heat), "url(#hot)") + (function () { var w = ""; for (var k = 0; k < 3; k++) { var p = (t * 1.1 + k / 3) % 1; w += P("M" + (RX0 + 40 + k * 50) + " " + f(ROOF - 80 - p * 50) + " q8 -10 0 -20", "#ff6a3a", 4, ' opacity="' + f(1 - p) + '"'); } return w; })(); }
    if (b.ctrl || o.ctrl) { var ck = o.ctrl == null ? 1 : clamp(o.ctrl); s += '<g opacity="' + f(ck) + '" filter="url(#sh)">' + R(RX0 + 16, RY0 + 34, 64, 70, "url(#box)", { rx: 6 }) + R(RX0 + 24, RY0 + 44, 48, 22, "#0f2a3a", { sw: 1.5 }) + T(o.ctrlTxt || "100%", RX0 + 48, RY0 + 61, 14, "#7cf2a0") + C(RX0 + 34, RY0 + 86, 5, "#5ad07a") + C(RX0 + 52, RY0 + 86, 5, Math.sin(t * 4) > 0 ? "#f2c230" : "#5a4a1a") + '</g>'; }
    if (b.inv || o.inv) { var big = b.invBig || o.invBig, ik = o.inv == null ? 1 : clamp(o.inv), w2 = big ? 82 : 58, h2 = big ? 112 : 76, x2 = RX1 - w2 - 14, y2 = RY0 + 30;
      s += '<g opacity="' + f(ik) + '" filter="url(#sh)">' + R(x2, y2, w2, h2, big ? "#e9ebee" : "#cfd3d8", { rx: 8 }) + R(x2 + 8, y2 + 10, w2 - 16, 26, "#0f2a3a", { sw: 1.5 }) + P("M" + (x2 + 12) + " " + (y2 + 23) + " q" + f((w2 - 24) / 4) + " -10 " + f((w2 - 24) / 2) + " 0 q" + f((w2 - 24) / 4) + " 10 " + f((w2 - 24) / 2) + " 0", o.trip ? "#e8452e" : "#7cf2a0", 2.4) + (o.trip ? T("!", x2 + w2 / 2, y2 + h2 - 14, 26, "#e8452e") : C(x2 + w2 / 2, y2 + h2 - 18, 6, "#5ad07a")) + '</g>'; }
    if (b.screen) s += R(RX0 - 66, RY0 + 70, 56, 36, "#1e2226", { rx: 4, sw: 2 }) + T(Math.round(1800 + 200 * Math.sin(t)) + "W", RX0 - 38, RY0 + 94, 13, "#7cf2a0");
    return s; }
  // wires with flowing current: panels → roof room → down into the flat's lamp
  function along(pts, p) { var L = 0, seg = []; for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
    var d = p * L; for (var j = 0; j < seg.length; j++) { if (d <= seg[j]) { var k = d / seg[j]; return [lerp(pts[j][0], pts[j + 1][0], k), lerp(pts[j][1], pts[j + 1][1], k)]; } d -= seg[j]; } return pts[pts.length - 1]; }
  function wires(t, b, o) { o = o || {}; var on = o.flow !== false, s = "", n = b.n || 1, px = n <= 1 ? PANX[0] + 120 + PW : PANX[n - 1] + PW, paths;
    if (b.battery || b.ctrl || o.direct === false) paths = [[[px, ROOF - 20], [RX0 + 48, ROOF - 20], [RX0 + 48, RY0 + 104]], [[RX0 + 48, ROOF - 4], [RX0 + 48, ROOF + 30], [360, ROOF + 30], [360, ROOF + 50]]];
    else paths = [[[px, ROOF - 20], [px + 20, ROOF - 20], [px + 20, ROOF + 30], [360, ROOF + 30], [360, ROOF + 50]]];
    paths.forEach(function (pts) { var d = "M" + pts.map(function (q) { return q[0] + " " + q[1]; }).join(" L"); s += P(d, "#1a1a1a", 7) + P(d, "#d8352a", 3);
      if (on) for (var k = 0; k < 7; k++) { var q = along(pts, (t * 0.35 + k / 7) % 1); s += C(q[0], q[1], 5, "#ffd23a", { st: INK, sw: 1.2 }); } });
    return s; }
  // sun rays onto the panels (blocked by a cloud when cloud > 0), at a steep or shallow angle
  function rays(t, cloud, steep) { var s = "", sx = 880, sy = 120; for (var i = 0; i < 6; i++) { var tx = 260 + i * 80, ty = ROOF - 60, p = (t * 1.4 + i / 6) % 1, x = lerp(sx, tx, p), y = lerp(sy, ty, p);
    s += P("M" + sx + " " + sy + " L" + tx + " " + ty, "#ffe28a", 6, ' opacity="' + f(0.35 * (1 - cloud)) + '" stroke-dasharray="14 18" stroke-dashoffset="' + f(-t * 60) + '"'); } return s; }
  function cloudOver(k, t) { if (k <= 0) return ""; var x = lerp(-200, 740, ease(k)); return '<g transform="translate(' + f(x) + ' 170) scale(2.2)" filter="url(#sh)"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="#c9d0d8" stroke="#8a96a2" stroke-width="3"/></g>'; }
  function graph(x, y, w, h, kind, k, t) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x, y, w, h, "#f6f1e6", { rx: 16, sw: 4 }) + P("M" + (x + 20) + " " + (y + h / 2) + " H" + (x + w - 20), "#aaa", 2), d = "";
    for (var i = 0; i <= 40; i++) { var px = x + 20 + (w - 40) * i / 40, v = kind === "dc" ? -0.6 : kind === "spike" ? (i > 14 && i < 20 ? -0.95 : -0.25 * Math.sin(i / 40 * Math.PI * 6)) : -0.7 * Math.sin(i / 40 * Math.PI * 6 + t * 3); d += (i ? " L" : "M") + f(px) + " " + f(y + h / 2 + v * h * 0.4); }
    return s + P(d, kind === "spike" ? "#e8452e" : "#2f6f9f", 6) + '</g>'; }
  function sweat(x, y, t) { var p = (t * 1.3) % 1; return F("M" + f(x) + " " + f(y + p * 30) + " q-7 12 0 15 q7 -3 0 -15 Z", "#9fd6ff", { sw: 1.6, op: 1 - p }); }
  function thermo(x, y, v, k) { if (k <= 0) return ""; var h = 160 * clamp(v); return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x - 16, y - 180, 32, 190, "#fff", { rx: 16, sw: 4 }) + R(x - 7, y - h, 14, h, "#e8452e", { sw: 0 }) + C(x, y + 14, 24, "#e8452e", { st: INK, sw: 4 }) + '</g>'; }
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o);
    var s = K.sky(t, h.night) + K.palm(-60, t, 1.2) + K.palm(1140, t, 1.0) + K.ground(t);
    if (!h.night) s += rays(t, h.cloud || 0, true) + cloudOver(h.cloud || 0, t);
    s += building(t, { night: h.night, lamp: (h.glow || 0) > 0.3, lit: h.lit });
    s += flat(t, { glow: h.glow == null ? (h.night ? 0 : 0.6) : h.glow, fridge: b.fridge || h.fridge, fridgeOn: h.fridgeOn, ac: b.ac || h.ac, acOn: h.acOn, tv: h.tv });
    s += equipment(t, b, h) + panels(t, b, h) + wires(t, b, h);
    if (b.hose || h.hose) s += P("M" + (BX0 + 28) + " " + (ROOF - 100) + " V" + (ROOF - 14) + " H" + (PANX[0] - 10), "#3a8a3a", 9) + R(PANX[0] - 24, ROOF - 30, 22, 18, "#e2b035", { sw: 2 });
    if (b.earth) { var ed = "M" + (BX1 + 4) + " " + (ROOF - 30) + " V" + (GY + 160); s += P(ed, INK, 9) + P(ed, "#3aa05a", 5) + R(BX1 - 6, GY + 160, 20, 120, "#b87333", { sw: 2 }); }
    return s; }

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[3, { battery: 1 }], [5, { ctrl: 1 }], [6, { fridge: 1, ac: 1 }], [7, { n: 4 }], [9, { tilt: 1 }], [11, { inv: 1 }], [13, { invBig: 1 }], [15, { hose: 1 }], [18, { gap: 1 }], [20, { li: 1 }], [21, { earth: 1, screen: 1 }]]);
  var RF = ROOF, FL = F4 - 14, VIS = { shirt: "url(#shirt2)", shirtD: "#7a2a18" };
  var ROOFCAM = [540, 560, 1.25], WHOLE = [540, 960, 0.95];

  // 0 — put one panel on the roof and wire it to a lamp: electricity from the sun
  shot(0, [540, 560, 1.75], [500, 620, 1.55], function (u, d, t) {
    var s = scene(t, {}, { glow: clamp((u - 2.4) / 0.4), flow: u > 2.2 });
    s += act(u, [[0, { x: 250, y: RF, f: 1, p: "push", mood: "n" }], [1.6, { x: 260, y: RF, f: 1, p: "point", mood: "n" }], [2.6, { x: 260, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("لوح واحد", 394, 420, u, 0.6) + pill("لمبة", 360, ROOF + 170, u, 2.5, { col: "#ffd23a" });
  });
  // 1 — but the first cloud puts the lamp out, and at night there's no light at all
  shot(1, [480, 640, 1.45], [440, 720, 1.6], function (u, d, t) {
    var night = u > 2.0, cl = clamp(u / 1.2), g = night ? 0 : 0.6 * (1 - cl) + 0.1 * Math.abs(Math.sin(t * 9)) * cl;
    var s = scene(t, {}, { cloud: night ? 0 : cl, night: night, glow: g, flow: g > 0.3 });
    s += act(u, [[0, { x: 300, y: FL, f: 1, p: "stand", mood: "n" }], [1.0, { x: 300, y: FL, f: 1, p: "pointUp", mood: "worry" }], [2.2, { x: 300, y: FL, f: 1, p: "shock", mood: "shock" }]], t);
    return s + xmark(360, ROOF + 200, u, 1.0, 0.8) + pill(night ? "الليل؟" : "سحابة!", 520, 300, u, 0.6, { bg: "#c7321f" });
  });
  // 2 — so you put a battery between the panel and the lamp to store the day's power for the night
  shot(2, [700, 580, 1.6], [560, 660, 1.4], function (u, d, t) {
    var night = u > 2.4, s = scene(t, { battery: 1 }, { night: night, level: night ? lerp(0.9, 0.7, clamp(u - 2.4)) : lerp(0.2, 0.9, clamp(u / 2.2)), glow: night ? 0.8 : 0.6, direct: false });
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "crouch", mood: "n" }], [1.4, { x: 640, y: RF, f: 1, p: "stand", mood: "n" }], [2.6, { x: 300, y: FL, f: 1, p: "thumbs", mood: "happy", jump: 1 }]], t);
    return s + pill("بطارية", 790, RY0 - 40, u, 0.5, { col: "#ffd23a" }) + ring(790, ROOF - 40, 80, u, 0.6, t);
  });
  // 3 — but if the panel keeps charging a full battery it overheats and dies, and draining it flat kills it too
  shot(3, [780, 560, 1.8], [780, 570, 1.95], function (u, d, t) {
    var phase2 = u > 2.6, s = scene(t, {}, { level: phase2 ? clamp(1 - (u - 2.6) * 1.4) : 1, heat: phase2 ? 0 : clamp((u - 0.4) / 1.2) });
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "stand", mood: "n" }], [1.0, { x: 620, y: RF, f: 1, p: "shock", mood: "shock" }], [2.8, { x: 620, y: RF, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill(phase2 ? "فضيت لآخرها" : "مليانة وبيشحن", 790, RY0 - 50, u, 0.8, { bg: "#c7321f", sz: 34 }) + xmark(860, ROOF - 120, u, 1.4, 0.7);
  });
  // 4 — so a little box in between stops charging when full and disconnects before empty: the charge controller
  shot(4, [760, 540, 1.9], [720, 570, 1.6], function (u, d, t) {
    var s = scene(t, { ctrl: 1 }, { ctrl: clamp((u - 0.3) / 0.6), ctrlTxt: u > 2.5 ? "100% ✓" : Math.round(lerp(60, 100, clamp((u - 1) / 1.5))) + "%", level: lerp(0.6, 1, clamp((u - 1) / 1.5)) });
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "reach", mood: "n" }], [2.2, { x: 640, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("منظّم الشحن", 750, RY0 - 50, u, 0.9, { col: "#ffd23a" }) + ring(748, RY0 + 70, 60, u, 1.0, t);
  });
  // 5 — but one panel gives about 500 W; the fridge alone wants about 150, the air conditioner over 1000
  shot(5, [520, 700, 1.45], [520, 720, 1.6], function (u, d, t) {
    var s = scene(t, {}, { fridge: u > 1.2, ac: u > 2.6, acOn: u > 2.9 && u < 3.4, fridgeOn: u > 1.4, glow: u > 3.4 ? 0.1 : 0.6 });
    s += act(u, [[0, { x: 300, y: FL, f: 1, p: "stand", mood: "n" }], [2.8, { x: 300, y: FL, f: 1, p: "point", mood: "n" }], [3.4, { x: 300, y: FL, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("500 وات", 394, 430, u, 0.4, { col: "#ffd23a" }) + pill("150", 655, F4 - 240, u, 1.4) + pill("+1000", 495, ROOF + 130, u, 2.8, { bg: "#c7321f" });
  });
  // 6 — so you line up many panels and wire them together so their power adds up
  shot(6, [460, 590, 1.55], [470, 610, 1.5], function (u, d, t) {
    var s = scene(t, {}, { n: lerp(1, 4, clamp((u - 0.3) / 2.2)) });
    s += act(u, [[0, { x: 236, y: RF, f: 1, p: "push", mood: "n" }], [2.6, { x: 236, y: RF, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + pill("× 4 = 2000 وات", 460, 320, u, 2.4, { col: "#ffd23a" });
  });
  // 7 — but panels lying flat get the sun at a slant and give less
  shot(7, [470, 590, 1.6], [470, 600, 1.7], function (u, d, t) {
    var s = scene(t, {}, {}); s += K.arrowV(400, 300, ROOF - 50, "#ffd23a", 10, clamp(u - 0.4));
    s += act(u, [[0, { x: 240, y: RF, f: 1, p: "stand", mood: "n" }], [1.4, { x: 240, y: RF, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + pill("نايمة = أقل", 460, 330, u, 1.2, { bg: "#c7321f" });
  });
  // 8 — so you set them on racks tilted about 30°, facing south
  shot(8, [470, 600, 1.7], [470, 610, 1.55], function (u, d, t) {
    var s = scene(t, {}, { tilt: clamp((u - 0.3) / 1.4) });
    s += act(u, [[0, { x: 240, y: RF, f: 1, p: "push", mood: "n" }], [2.0, { x: 240, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("30° للجنوب", 460, 340, u, 1.6, { col: "#ffd23a" }) + vmark(700, 360, u, 2.2, 0.7);
  });
  // 9 — but panels give direct current, and the flat runs on current that swings 50 times a second
  shot(9, [530, 640, 1.4], [530, 680, 1.45], function (u, d, t) {
    var s = scene(t, {}, { fridgeOn: false, tv: false });
    s += graph(220, 330, 280, 150, "dc", clamp(u - 0.3), t) + graph(560, 330, 280, 150, "ac", clamp(u - 1.4), t);
    s += act(u, [[0, { x: 300, y: FL, f: 1, p: "stand", mood: "n" }], [2.0, { x: 520, y: FL, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + pill("مستمر", 360, 300, u, 0.6) + pill("50 مرة/ثانية", 700, 300, u, 1.6, { col: "#9fd6ff", sz: 32 }) + xmark(655, F4 - 260, u, 2.4, 0.6);
  });
  // 10 — so you fit a box that flips the current: the inverter
  shot(10, [800, 540, 1.9], [720, 580, 1.55], function (u, d, t) {
    var s = scene(t, { inv: 1 }, { inv: clamp((u - 0.3) / 0.6), fridgeOn: u > 1.8, tv: u > 1.8 });
    s += act(u, [[0, { x: 650, y: RF, f: 1, p: "reach", mood: "n" }], [1.8, { x: 650, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("الإنفرتر", 820, RY0 - 50, u, 0.8, { col: "#ffd23a" }) + ring(830, RY0 + 70, 60, u, 0.9, t);
  });
  // 11 — but the moment the AC motor starts it draws several times its running current, and the small inverter trips
  shot(11, [530, 660, 1.4], [530, 700, 1.5], function (u, d, t) {
    var trip = u > 1.6, s = scene(t, {}, { acOn: u > 0.6 && !trip, trip: trip, glow: trip ? 0 : 0.6, fridgeOn: !trip, tv: !trip, night: false, flow: !trip });
    s += graph(560, 330, 280, 150, "spike", clamp(u - 0.6), t);
    if (trip && u < 2.2) s += K.C(830, RY0 + 60, 40 + 10 * Math.sin(t * 30), "#ffe46a", { op: 0.7 });
    s += act(u, [[0, { x: 300, y: FL, f: 1, p: "stand", mood: "happy" }], [1.6, { x: 300, y: FL, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("أضعاف!", 700, 300, u, 0.9, { bg: "#c7321f" }) + xmark(840, RY0 - 30, u, 1.7, 0.6);
  });
  // 12 — so you choose an inverter bigger than your loads, built for that surge
  shot(12, [800, 560, 1.8], [560, 660, 1.4], function (u, d, t) {
    var s = scene(t, { invBig: 1 }, { acOn: u > 1.4, fridgeOn: true, tv: true });
    s += act(u, [[0, { x: 650, y: RF, f: 1, p: "reach", mood: "n" }], [1.6, { x: 300, y: FL, f: 1, p: "breathe", mood: "happy", jump: 1 }]], t);
    return s + pill("إنفرتر أكبر", 820, RY0 - 50, u, 0.6, { col: "#ffd23a" });
  });
  // 13 — but Egypt's dust settles on the panels: near Cairo they lost about a quarter of their power in six weeks
  shot(13, [450, 600, 1.6], [450, 600, 1.7], function (u, d, t) {
    var dk = clamp((u - 0.3) / 2.0), s = scene(t, {}, { dust: dk });
    for (var k = 0; k < 40; k++) { var p = (t * 0.4 + hash(k)) % 1; s += C(lerp(-200, 1000, p), 200 + hash(k + 3) * 400 + Math.sin(t * 2 + k) * 20, 4, "#c9a46a", { op: 0.7 * dk }); }
    s += act(u, [[0, { x: 236, y: RF, f: 1, p: "stand", mood: "n" }], [1.4, { x: 236, y: RF, f: 1, p: "cough", mood: "sick" }]], t);
    return s + pill("−25% في 6 أسابيع", 460, 330, u, 2.0, { bg: "#c7321f", sz: 34 });
  });
  // 14 — so you run a water line on the roof and wash them regularly with a soft mop
  shot(14, [440, 600, 1.7], [460, 610, 1.55], function (u, d, t) {
    var s = scene(t, { hose: 1 }, { dust: clamp(1 - (u - 0.6) / 2.2) });
    for (var k = 0; k < 6; k++) { var p = (t * 1.6 + k / 6) % 1; s += C(PANX[0] + 20 + k * 60, ROOF - 140 + p * 120, 5, "#5fb0e6", { op: 1 - p }); }
    s += act(u, [[0, { x: 236, y: RF, f: 1, p: "push", mood: "n" }], [1.2, { x: 330, y: RF, f: 1, p: "push", mood: "n" }], [2.6, { x: 330, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("خط مية + مساحة", 460, 330, u, 0.6, { col: "#9fd6ff", sz: 34 });
  });
  // 15 — the odd thing: many think panels give more in the height of summer heat
  shot(15, [470, 600, 1.5], [470, 610, 1.6], function (u, d, t) {
    var s = scene(t, {}, {}) + C(880, 120, 220 + 20 * Math.sin(t * 3), "url(#hot)");
    s += act(u, [[0, { x: 240, y: RF, f: 1, p: "thumbs", mood: "happy" }], [2.0, { x: 240, y: RF, f: 1, p: "point", mood: "happy" }]], t) + sweat(200, RF - 300, t);
    return s + pill("حر = كهربا أكتر؟", 460, 330, u, 0.6, { sz: 34 });
  });
  // 16 — really a panel can reach 65 °C and lose about 16 % of its power
  shot(16, [470, 600, 1.6], [480, 600, 1.75], function (u, d, t) {
    var s = scene(t, {}, { hot: clamp((u - 0.3) / 1.2), gap: false }) + thermo(700, 500, lerp(0.3, 0.9, clamp((u - 0.3) / 1.4)), clamp(u * 2));
    s += act(u, [[0, { x: 240, y: RF, f: 1, p: "point", mood: "happy" }], [1.2, { x: 240, y: RF, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("65°", 700, 280, u, 1.2, { bg: "#c7321f" }) + pill("−16%", 460, 330, u, 2.0, { bg: "#c7321f" });
  });
  // 17 — so you leave a gap under the panels for the air to cool them
  shot(17, [480, 600, 1.75], [470, 610, 1.6], function (u, d, t) {
    var s = scene(t, {}, { gap: u > 0.3, hot: clamp(1 - (u - 0.8) / 1.4) }) + thermo(700, 500, lerp(0.9, 0.5, clamp((u - 0.8) / 1.4)), 1);
    for (var k = 0; k < 3; k++) { var ap = (t * 0.5 + k / 3) % 1; s += K.arrowH(lerp(180, 560, ap), ROOF - 20, lerp(180, 560, ap) + 90, "#9fd6ff", 6, 1); }
    s += act(u, [[0, { x: 226, y: RF, f: 1, p: "crouch", mood: "n" }], [1.8, { x: 240, y: RF, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("فراغ للهوا", 460, 340, u, 0.8, { col: "#9fd6ff" });
  });
  // 18 — but ordinary lead batteries last a few hundred charges and then die
  shot(18, [780, 560, 1.8], [780, 570, 1.95], function (u, d, t) {
    var lv = clamp(1 - (u - 0.6) / 2.0), s = scene(t, {}, { level: lv });
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "stand", mood: "n" }], [1.8, { x: 640, y: RF, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("كام مية شحنة", 790, RY0 - 50, u, 0.6, { bg: "#c7321f", sz: 34 }) + xmark(860, ROOF - 110, u, 2.4, 0.6);
  });
  // 19 — so you choose lithium iron phosphate batteries that last thousands of charges
  shot(19, [780, 560, 1.95], [720, 570, 1.6], function (u, d, t) {
    var s = scene(t, { li: u > 0.6 ? 1 : 0 }, { level: 1 });
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "reach", mood: "n" }], [1.6, { x: 640, y: RF, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + pill("آلاف الشحنات", 790, RY0 - 50, u, 1.2, { col: "#9fe8b0" });
  });
  // 20 — what's left: an earth wire against lightning and a screen showing every watt
  shot(20, [700, 760, 0.85], [700, 700, 0.95], function (u, d, t) {
    var s = scene(t, { earth: 1, screen: u > 2.0 ? 1 : 0 }, {});
    if (u > 0.8 && u < 1.6) { s += P("M980 -60 L930 140 L980 140 L920 " + (ROOF - 40), "#ffe46a", 10) + P("M" + (BX1 + 4) + " " + (ROOF - 30) + " V" + (GY + 160), "#ffe46a", 12, ' opacity=".7"'); }
    s += act(u, [[0, { x: 640, y: RF, f: 1, p: "cover", mood: "shock" }], [1.8, { x: 640, y: RF, f: 1, p: "point", mood: "happy" }]], t);
    return s + pill("سلك أرضي", BX1 + 40, GY + 60, u, 1.0, { col: "#9fe8b0" }) + pill("شاشة", 818, RY0 - 50, u, 2.1);
  });
  // 21 — congratulations, you lit the whole building from the sun yourself
  shot(21, [540, 700, 1.1], [540, 960, 0.92], function (u, d, t) {
    var s = scene(t, {}, { night: true, glow: 0.9, lit: clamp(u / 1.6), tv: true, fridgeOn: true }) + K.confetti(t, BX0, BX1, ROOF - 200, F4);
    s += act(u, [[0, { x: 300, y: RF, f: 1, p: "cheer", mood: "happy" }], [1.4, { x: 300, y: RF, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("مبروك!", 540, 260, u, 0.4, { col: "#9fe8b0", sz: 56 });
  });
  // 22 — outro
  shot(22, [540, 900, 0.92], [540, 880, 0.96], function (u, d, t) {
    var s = scene(t, {}, { night: true, glow: 0.9, lit: 1, tv: true, fridgeOn: true });
    s += act(u, [[0, { x: 300, y: RF, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("قولولنا!", 540, 260, u, 0.4, { col: "#ffd23a", sz: 56 });
  });
  window.__solar = { scene: scene };
})();
