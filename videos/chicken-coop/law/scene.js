/* «تعمل عشة فراخ إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One Cairo rooftop seen in 2.5D: the run (four posts, wire walls and a wire roof), the little house on legs in its back
   corner, cut open to show the perch, the nest boxes and the lamp. The coop grows line by line; the owner (the shared
   person kit through K.act) acts out and reacts to every line. World units are the 1080×1920 frame at zoom 1. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var OWN = { outfit: { base: "casual", colors: { shirt: "#3f7fb8", shirtD: "#2a5a86", pants: "#5a5142", pantsD: "#3e372c" } } };
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.9; if (!k[1].outfit) k[1].outfit = OWN.outfit; }); return K.act(u, Ks, t); };
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, has = K.has;
  // keep the man (outside, on the left) in frame: the camera centre may not pass 250 + half the visible width
  var OUTSIDE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 19, 21, 22, 23];
  var shot = function (line, c0, c1, fn) { var cl = function (c) { return OUTSIDE.indexOf(line) >= 0 ? [Math.min(c[0], 250 + 540 / c[2]), c[1], c[2]] : c; }; K.shot(line, cl(c0), cl(c1), fn); };
  // the run: front face X0..X1 on the floor line FY, the back face shifted by DX/DY, H high
  var X0 = 400, X1 = 780, FY = 1540, DX = 80, DY = -80, BY = FY + DY, H = 320, FT = FY - H, BT = BY - H;
  // the house in the back right corner, on legs
  var HX0 = 620, HX1 = 830, HB = 1405, HT = 1245, HP = 1170, LEGB = 1478;
  var ROOFB = 1400, ROOFF = 1610;   // the roof floor from its back edge to its front edge

  function poly(pts, fill, o) { return F("M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z", fill, o); }
  function plank(x1, y1, x2, y2, w, col) { return P("M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2), INK, w + 5) + P("M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2), col || "#b07a44", w); }

  // ── the place: a faded Cairo skyline, the neighbour's roof, our roof with a black water tank and a dish ──
  var TOWN = (function () { var s = ""; for (var i = 0; i < 12; i++) { var x = -300 + i * 150 + hash(i) * 40, w = 110 + hash(i + 4) * 60, h = 160 + hash(i + 8) * 260;
    s += R(x, ROOFB - h, w, h, ["#d9c9ad", "#cdbb9c", "#e2d3b8"][i % 3], { sw: 2, st: "#a89a80" });
    for (var r = 0; r < Math.floor(h / 70); r++) for (var c = 0; c < 2; c++) s += R(x + 18 + c * (w / 2 - 6), ROOFB - h + 24 + r * 70, 26, 34, "#9fb6c8", { sw: 0, op: 0.7 });
    if (hash(i + 2) > 0.4) s += R(x + w * 0.6, ROOFB - h - 34, 30, 34, "#3a3f46", { sw: 1.5, rx: 4 }); if (hash(i + 6) > 0.5) s += P("M" + f(x + 20) + " " + f(ROOFB - h - 6) + " q14 -26 30 -4", "#8a8f96", 4); }
    return '<g opacity=".75">' + s + '</g>'; })();
  function place(t, h) {
    var s = TOWN;
    // our roof floor (tiles), hot in the summer lines
    s += poly([[-200, ROOFB], [1300, ROOFB], [1300, ROOFF], [-200, ROOFF]], h.hot ? "url(#tileHot)" : "url(#tile)", { sw: 0 });
    if (h.hot) s += R(-200, ROOFB, 1500, ROOFF - ROOFB, "url(#tile)", { sw: 0, op: 1 - clamp(h.hot) });
    var tl = ""; for (var i = -6; i < 20; i++) tl += "M" + (i * 80) + " " + ROOFB + " L" + (i * 80 - 60) + " " + ROOFF + " "; for (var j = 1; j < 4; j++) tl += "M-200 " + (ROOFB + j * 52) + " H1300 ";
    s += P(tl, "#8a7c64", 2, ' opacity=".5"');
    if (h.hot) for (var k = 0; k < 7; k++) { var p = (t * 0.7 + k / 7) % 1; s += P("M" + (120 + k * 140) + " " + f(ROOFB + 60 - p * 120) + " q12 -16 0 -32 q-12 -16 0 -32", "#ff8a5a", 5, ' opacity="' + f((1 - p) * clamp(h.hot)) + '"'); }
    // the front edge of the slab and the facade below with a top-floor window or two
    s += R(-200, ROOFF, 1500, 34, "url(#conc)", { sw: 3 }) + R(-200, ROOFF + 34, 1500, 900, "url(#facade)", { sw: 0 });
    for (var w = 0; w < 5; w++) s += R(-60 + w * 260, ROOFF + 110, 110, 150, h.night ? "#2a3550" : "#7fa9c8", { sw: 3 }) + R(-74 + w * 260, ROOFF + 255, 138, 14, "#c9b28a", { sw: 2 });
    // the low parapet between us and the neighbour on the right, their roof and tank beyond
    s += R(940, ROOFB - 10, 22, ROOFF - ROOFB + 10, "url(#conc)", { sw: 2 }) + R(962, ROOFB + 60, 400, 6, "#8a7c64", { sw: 0, op: 0.4 });
    s += '<g filter="url(#sh)">' + R(1030, ROOFB - 110, 90, 130, "url(#tankG)", { rx: 14 }) + '</g>';
    // our black water tank on its stand and a satellite dish on the left
    s += P("M40 " + (ROOFB + 40) + " V" + (ROOFB - 60) + " M150 " + (ROOFB + 40) + " V" + (ROOFB - 60), "#6a6f76", 8) + '<g filter="url(#sh)">' + R(28, ROOFB - 210, 134, 160, "url(#tankG)", { rx: 18 }) + R(28, ROOFB - 180, 134, 10, "#2a2e33", { sw: 0 }) + R(28, ROOFB - 110, 134, 10, "#2a2e33", { sw: 0 }) + '</g>';
    s += P("M240 " + (ROOFB + 20) + " V" + (ROOFB - 70), "#8a8f96", 6) + F("M200 " + (ROOFB - 150) + " q70 10 80 80 q-80 0 -80 -80 Z", "#e9ebee", { sw: 3 }) + P("M240 " + (ROOFB - 110) + " L270 " + (ROOFB - 80), "#8a8f96", 4);
    return s;
  }

  // ── animals ──
  function hen(x, y, o) { o = o || {}; var s = o.s || 1, fc = o.f || 1, t = o.t || 0, sd = o.seed || 0, rooster = o.rooster;
    var body = rooster ? "#b8501e" : (o.col === "b" ? "#a9622e" : "#f4f1ea"), wing = rooster ? "#7a2e12" : (o.col === "b" ? "#7a4420" : "#d9d4c8");
    var peck = o.peck ? Math.max(0, Math.sin(t * 5 + sd * 3)) : 0, hop = o.walk ? Math.abs(Math.sin(t * 7 + sd)) * 4 : 0;
    var g = '<g transform="translate(' + f(x) + ' ' + f(y - hop) + ') scale(' + f(fc * s) + ' ' + f(s) + ')">';
    if (!o.roost) g += P("M-6 -16 L-8 0 M-14 2 L-2 2 M8 -16 L8 0 M2 2 L14 2", "#e0a020", 4);
    if (rooster) g += F("M-26 -44 C-60 -70 -64 -110 -40 -116 C-44 -90 -30 -66 -18 -50 Z", "#1f4a3a", { sw: 2.5 }) + F("M-30 -40 C-70 -54 -84 -92 -66 -104 C-62 -78 -44 -60 -24 -44 Z", "#2a6a4a", { sw: 2.5 });
    else g += F("M-26 -32 L-46 -66 L-34 -64 L-22 -40 Z", wing, { sw: 2.5 });
    g += '<ellipse cx="0" cy="-32" rx="31" ry="22" fill="' + body + '" stroke="' + INK + '" stroke-width="3"/>';
    var fl = o.flap ? Math.sin(t * 22 + sd) : 0;
    g += o.flap ? F("M-6 -38 Q-20 " + f(-80 - fl * 20) + " -40 " + f(-74 - fl * 26) + " Q-26 -50 -6 -30 Z", wing, { sw: 2.5 }) : '<ellipse cx="-4" cy="-30" rx="17" ry="11" fill="' + wing + '" stroke="' + INK + '" stroke-width="2.4"/>';
    var hx = 22 + peck * 10, hy = -58 + peck * 34;
    g += F("M14 -44 Q" + f(hx - 2) + " " + f(hy + 8) + " " + f(hx) + " " + f(hy) + " L" + f(hx + 8) + " " + f(hy + 10) + " Q24 -40 22 -26 Z", body, { sw: 2.5 });
    g += C(hx, hy, 12, body, { st: INK, sw: 2.6 });
    var cb = rooster ? 1.6 : 1; g += F("M" + f(hx - 9) + " " + f(hy - 8) + " q3 " + f(-12 * cb) + " 7 -2 q3 " + f(-14 * cb) + " 7 0 q4 " + f(-10 * cb) + " 6 4 Z", "#d8352a", { sw: 2 });
    var op = o.pant ? Math.abs(Math.sin(t * 10)) * 5 + 2 : 0;
    g += F("M" + f(hx + 10) + " " + f(hy - 3) + " L" + f(hx + 22) + " " + f(hy + 1) + " L" + f(hx + 10) + " " + f(hy + 3) + " Z", "#f0b030", { sw: 1.8 });
    if (op) g += F("M" + f(hx + 10) + " " + f(hy + 4) + " L" + f(hx + 20) + " " + f(hy + 6 + op) + " L" + f(hx + 10) + " " + f(hy + 6 + op * 0.4) + " Z", "#f0b030", { sw: 1.8 });
    g += '<ellipse cx="' + f(hx + 7) + '" cy="' + f(hy + 10) + '" rx="4" ry="' + (rooster ? 9 : 6) + '" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/>';
    g += C(hx + 4, hy - 2, o.sleep ? 0 : 2.6, "#111") + (o.sleep ? P("M" + f(hx) + " " + f(hy - 2) + " h7", "#111", 2) : "");
    return g + '</g>'; }
  function cat(x, y, fc, t, o) { o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + fc + ' 1)">', col = "#55555e";
    g += P("M-58 -46 C-96 -60 -92 -120 -70 -126", INK, 14) + P("M-58 -46 C-96 -60 -92 -120 -70 -126", col, 8);
    g += R(-48, -34, 12, 34, col, { sw: 2.5, rx: 5 }) + R(28, -34, 12, 34, col, { sw: 2.5, rx: 5 });
    g += '<ellipse cx="-6" cy="-48" rx="58" ry="28" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>';
    if (o.reach != null) { var r = clamp(o.reach), ex = lerp(50, o.tx || 120, r), ey = lerp(-50, o.ty || -40, r); g += P("M30 -50 L" + f(ex) + " " + f(ey), INK, 18) + P("M30 -50 L" + f(ex) + " " + f(ey), col, 12) + C(ex, ey, 10, col, { st: INK, sw: 2.5 }); }
    g += C(58, -74, 28, col, { st: INK, sw: 3 }) + F("M40 -96 L44 -124 L60 -100 Z M64 -100 L80 -122 L80 -92 Z", col, { sw: 2.5 });
    g += '<ellipse cx="54" cy="-78" rx="6" ry="' + (o.night ? 7 : 5) + '" fill="' + (o.night ? "#e8f040" : "#c9d040") + '"/><ellipse cx="72" cy="-78" rx="5" ry="' + (o.night ? 7 : 5) + '" fill="' + (o.night ? "#e8f040" : "#c9d040") + '"/>';
    if (o.night) g += C(63, -78, 26, "#e8f040", { op: 0.18 });
    g += F("M80 -66 l6 4 l-6 3 Z", "#e88a8a", { sw: 1.4 }) + P("M84 -64 l22 -6 M84 -62 l22 4", "#ddd", 1.5);
    return g + '</g>'; }
  function weasel(x, y, fc, t, k) { var w = Math.sin(t * 9) * 6, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + fc + ' 1)">';
    g += P("M-150 -14 Q-130 " + f(-30 - w) + " -100 -16", INK, 16) + P("M-150 -14 Q-130 " + f(-30 - w) + " -100 -16", "#4a2a14", 10);
    g += F("M-110 -10 Q-60 " + f(-38 + w) + " 0 -22 Q22 -18 30 -10 Q20 2 -10 0 Q-60 " + f(4 - w) + " -110 2 Z", "#8a5a2e", { sw: 3 });
    g += F("M-80 0 Q-40 -6 0 -4 Q-40 4 -80 2 Z", "#f0dcb0", { sw: 0 }) + C(24, -18, 13, "#8a5a2e", { st: INK, sw: 2.5 }) + C(16, -30, 5, "#8a5a2e", { st: INK, sw: 2 }) + C(28, -21, 2.6, "#111") + C(38, -15, 3, "#111");
    g += P("M-80 2 v8 M-60 2 v8 M-10 0 v10 M8 -2 v10", "#4a2a14", 5);
    return g + '</g>'; }

  // ── the run: floor, posts, wire walls and roof (hex chicken wire, then stiff square mesh) ──
  var FL = [[X0, FY], [X1, FY], [X1 + DX, BY], [X0 + DX, BY]];
  function runBack(t, b, h) { var k = h.runK == null ? 1 : clamp(h.runK), s = "";
    s += poly(FL, "url(#sandF)", { sw: 2, op: 0.95 });
    if (k <= 0) return s;
    var mesh = function (pts) { var r = ""; if (h.hexK > 0) r += poly(pts, "url(#hex)", { sw: 0, op: f(h.hexK * k) }); if (h.gridK > 0) r += poly(pts, "url(#grid)", { sw: 0, op: f(h.gridK * k) }); return r; };
    s += mesh([[X0 + DX, BY], [X1 + DX, BY], [X1 + DX, BT], [X0 + DX, BT]]) + mesh([[X0, FY], [X0 + DX, BY], [X0 + DX, BT], [X0, FT]]) + mesh([[X1, FY], [X1 + DX, BY], [X1 + DX, BT], [X1, FT]]);
    var dp = (1 - ease(k)) * -400;
    s += '<g transform="translate(0 ' + f(dp) + ')">' + plank(X0 + DX, BY, X0 + DX, BT, 12, "#a8743e") + plank(X1 + DX, BY, X1 + DX, BT, 12, "#a8743e") + '</g>';
    return s; }
  function runFront(t, b, h) { var k = h.runK == null ? 1 : clamp(h.runK), s = ""; if (k <= 0) return s;
    var mesh = function (pts) { var r = ""; if (h.hexK > 0) r += poly(pts, "url(#hex)", { sw: 0, op: f(h.hexK * k) }); if (h.gridK > 0) r += poly(pts, "url(#grid)", { sw: 0, op: f(h.gridK * k) }); return r; };
    s += mesh([[X0, FY], [X1, FY], [X1, FT], [X0, FT]]);
    var tk = h.topK == null ? (b.top ? 1 : 0) : clamp(h.topK);
    if (tk > 0) { var ty = (1 - ease(tk)) * -260; s += '<g transform="translate(0 ' + f(ty) + ')" opacity="' + f(tk) + '">' + mesh([[X0, FT], [X1, FT], [X1 + DX, BT], [X0 + DX, BT]]) + plank(X0, FT, X0 + DX, BT, 8, "#c08a52") + plank(X1, FT, X1 + DX, BT, 8, "#c08a52") + plank(X0 + DX, BT, X1 + DX, BT, 8, "#c08a52") + '</g>'; }
    var dp = (1 - ease(k)) * -400;
    s += '<g transform="translate(0 ' + f(dp) + ')" filter="url(#sh)">' + plank(X0, FY + 6, X0, FT, 14, "#b07a44") + plank(X1, FY + 6, X1, FT, 14, "#b07a44") + plank(X0, FT, X1, FT, 9, "#c08a52") + '</g>';
    return s; }

  // ── the house on legs, cut open at the front ──
  function house(t, b, h) { var k = h.houseK == null ? 1 : clamp(h.houseK); if (k <= 0) return ""; var s = "", night = h.night;
    var g = '<g transform="translate(0 ' + f((1 - ease(k)) * -500) + ')" opacity="' + f(clamp(k * 2)) + '" >';
    g += P("M" + (HX0 + 10) + " " + HB + " V" + LEGB + " M" + (HX1 - 10) + " " + HB + " V" + LEGB, INK, 16) + P("M" + (HX0 + 10) + " " + HB + " V" + LEGB + " M" + (HX1 - 10) + " " + HB + " V" + LEGB, "#9a6a3a", 10);
    g += '<g filter="url(#sh)">' + R(HX0, HT, HX1 - HX0, HB - HT, "url(#inside)", { sw: 3 }) + '</g>';
    var pl = ""; for (var i = 1; i < 6; i++) pl += "M" + (HX0 + i * 35) + " " + HT + " V" + HB + " "; g += P(pl, "#5a3a1e", 2, ' opacity=".6"');
    g += F("M" + HX0 + " " + HT + " L" + ((HX0 + HX1) / 2) + " " + HP + " L" + HX1 + " " + HT + " Z", "url(#inside)", { sw: 2 });
    if (b.vents || h.vents) { for (var v = 0; v < 3; v++) g += R(HX0 + 40 + v * 50, HT + 8, 34, 12, "#1a120a", { sw: 1.5, rx: 3 }); }
    g += R(HX0, HB - 12, HX1 - HX0, 14, "url(#straw)", { sw: 2 });
    if (b.perch || h.perch) g += plank(HX0 + 14, 1322, HX1 - 14, 1322, 10, "#c9964e") + P("M" + (HX0 + 30) + " 1322 v-0 M" + (HX0 + 14) + " 1316 h-4", INK, 3);
    if (b.nests || h.nests) for (var n = 0; n < 2; n++) { var nx = HX1 - 100 + n * 46; g += R(nx, 1360, 42, 34, "#b07a44", { sw: 2.5 }) + F("M" + (nx + 4) + " 1364 q17 -12 34 0 Z", "url(#straw)", { sw: 1.5 }); if (h.egg && n === 0) g += '<ellipse cx="' + (nx + 21) + '" cy="1360" rx="9" ry="12" fill="#f6ead6" stroke="' + INK + '" stroke-width="2" transform="scale(1)"/>'; }
    if (b.lamp || h.lamp) { var lx = (HX0 + HX1) / 2; g += P("M" + lx + " " + (HP + 14) + " V" + (HT + 26), INK, 3) + F("M" + (lx - 14) + " " + (HT + 26) + " h28 l-5 10 h-18 Z", "#5a5f66", { sw: 2 }) + C(lx, HT + 44, 9, h.lampOn ? "#fff6c0" : "#cfcfcf", { st: INK, sw: 2 }); }
    // side walls (cut edges), the roof planks and the door on the left wall
    g += R(HX0 - 10, HT, 12, HB - HT, "url(#house)", { sw: 2.5 }) + R(HX1 - 2, HT, 12, HB - HT, "url(#house)", { sw: 2.5 });
    g += R(HX0 - 12, 1330, 14, 70, "#1a120a", { sw: 2 });
    g += plank(HX0 - 30, HT + 12, (HX0 + HX1) / 2, HP - 10, 16, "#e9e2d4") + plank(HX1 + 30, HT + 12, (HX0 + HX1) / 2, HP - 10, 16, "#e9e2d4");
    g += plank(HX0 - 26, HT + 22, (HX0 + HX1) / 2, HP, 8, "#c0402a") + plank(HX1 + 26, HT + 22, (HX0 + HX1) / 2, HP, 8, "#c0402a");
    // the ramp from the door down to the run floor
    g += F("M" + (HX0 - 14) + " 1398 L" + (HX0 - 4) + " 1406 L" + (HX0 - 100) + " 1512 L" + (HX0 - 116) + " 1504 Z", "url(#plank)", { sw: 2.5 });
    for (var r2 = 1; r2 < 6; r2++) { var rx = lerp(HX0 - 10, HX0 - 108, r2 / 6), ry = lerp(1402, 1508, r2 / 6); g += P("M" + f(rx - 8) + " " + f(ry - 4) + " l14 8", "#7a4c26", 4); }
    if (h.closed) { var ck = clamp(h.closed); g += '<g opacity="' + f(ck) + '">' + R(HX0 - 4, HT, HX1 - HX0 + 8, HB - HT, "url(#house)", { sw: 3 }); var pl2 = ""; for (var j = 1; j < 6; j++) pl2 += "M" + (HX0 + j * 35) + " " + HT + " V" + HB + " "; g += P(pl2, "#7a2a18", 2.5) + F("M" + HX0 + " " + HT + " L" + ((HX0 + HX1) / 2) + " " + HP + " L" + HX1 + " " + HT + " Z", "url(#house)", { sw: 3 }) + R(HX0 + 20, HT + 40, 60, 90, "#7a2a18", { sw: 2.5 }) + P("M" + (HX0 + 20) + " " + (HT + 40) + " l60 90 M" + (HX0 + 80) + " " + (HT + 40) + " l-60 90", "#f2e8d8", 4) + '</g>'; }
    if (night && !h.lampOn) g += R(HX0, HP, HX1 - HX0, HB - HP, "#0a1020", { sw: 0, op: 0.35 });
    if (h.lampOn) g += C((HX0 + HX1) / 2, HT + 44, 150 * clamp(h.lampOn), "url(#bulb)", { op: clamp(h.lampOn) });
    return g + '</g>'; }

  function extras(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k)) + '">';
    // a waterer, a hanging feeder and a sand tray, all on the run floor
    s += '<g filter="url(#sh)">' + F("M452 1530 h44 l-6 -46 h-32 Z", "#e9ebee", { sw: 2.5 }) + R(446, 1524, 56, 10, "#5aa8d8", { sw: 2.5, rx: 4 }) + '</g>';
    s += P("M560 " + (FT + 10) + " V1440", INK, 3) + '<g filter="url(#sh)">' + F("M544 1440 h32 l8 50 h-48 Z", "#d8a43a", { sw: 2.5 }) + R(530, 1488, 60, 10, "#a8743e", { sw: 2.5 }) + '</g>';
    s += '<ellipse cx="700" cy="1520" rx="62" ry="14" fill="#e6cf98" stroke="' + INK + '" stroke-width="2.5"/>';
    return s + '</g>'; }

  function thermo(x, y, v, k) { if (k <= 0) return ""; var hh = 160 * clamp(v); return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x - 16, y - 180, 32, 190, "#fff", { rx: 16, sw: 4 }) + R(x - 7, y - hh, 14, hh, "#e8452e", { sw: 0 }) + C(x, y + 14, 24, "#e8452e", { st: INK, sw: 4 }) + '</g>'; }
  function sunHot(t, k) { if (k <= 0) return ""; return C(860, 900, 240 + 20 * Math.sin(t * 3), "url(#hot)", { op: clamp(k) }) + C(860, 900, 70, "#fff2b0", { op: clamp(k) }); }
  function nightTint(on) { return on ? R(-300, 0, 1700, 2700, "#0a1430", { sw: 0, op: 0.38 }) : ""; }
  function bubble(x, y, inner, u, u0) { var k = clamp((u - u0) / 0.35); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(K.pop(k)) + ')" filter="url(#sh)">' + C(-70, 100, 10, "#fff", { st: INK, sw: 3 }) + C(-50, 70, 16, "#fff", { st: INK, sw: 3 }) + '<ellipse cx="0" cy="0" rx="110" ry="80" fill="#fff" stroke="' + INK + '" stroke-width="4"/>' + inner + '</g>'; }

  // hens in the run (default flock of four), each { x, y, col, f, peck … }
  var FLOCK = [[470, 1505, "w", 1, 1], [560, 1528, "b", -1, 2], [650, 1500, "w", 1, 3], [520, 1478, "b", 1, 4]];
  function flock(t, o) { o = o || {}; var s = ""; FLOCK.forEach(function (q, i) { if (o.skip && o.skip.indexOf(i) >= 0) return; s += hen(q[0] + (o.dx ? Math.sin(t * 0.6 + i) * 14 : 0), q[1], { col: q[2], f: q[3], seed: q[4], t: t, peck: o.peck !== false, pant: o.pant, sleep: o.sleep }); }); return s; }

  // the whole scene; m = the man's svg, inside = draw him inside the run (behind the front wire)
  function scene(t, o, h, m, inside) { o = o || {}; h = h || {}; var b = has(o);
    if (h.hexK == null) h.hexK = b.cloth ? 0 : 1; if (h.gridK == null) h.gridK = b.cloth ? 1 : 0;
    var s = K.sky(t, h.night) + sunHot(t, h.hot || 0) + place(t, h);
    s += runBack(t, b, h);
    if (b.house || h.houseK != null) s += house(t, b, h);
    s += (h.animals || "");
    if (b.extras || h.extrasK) s += extras(t, h.extrasK == null ? 1 : h.extrasK);
    if (inside) s += m || "";
    s += runFront(t, b, h);
    if (!inside) s += m || "";
    s += nightTint(h.night && !h.noTint);
    return s; }

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[1, { run: 1 }], [3, { top: 1 }], [7, { cloth: 1 }], [9, { house: 1 }], [11, { vents: 1 }], [13, { perch: 1 }], [15, { nests: 1 }], [21, { lamp: 1 }], [22, { extras: 1 }]]);
  var MX = 320, MY = 1560, IN = 1510;   // the man outside on the left, and his floor inside the run
  var CAM = [600, 1330, 1.6];

  // 0 — four sticks on the roof wrapped in chicken wire: a coop
  shot(0, [560, 1360, 1.75], [600, 1330, 1.6], function (u, d, t) {
    var k = clamp((u - 0.3) / 1.6), m = act(u, [[0, { x: MX, y: MY, f: 1, p: "hammer", mood: "n" }], [2.2, { x: MX, y: MY, f: 1, p: "point", mood: "n" }], [3.4, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var s = scene(t, {}, { runK: k, hexK: clamp((u - 1.4) / 0.8), topK: 0, animals: u > 2.4 ? flock(t) : "" }, m);
    return s + pill("٤ خشبات + سلك", 600, 1080, u, 1.2, { col: "#ffd23a", sz: 36 }) + pill("عشة فراخ", 620, 1150, u, 2.6);
  });
  // 1 — but hens flap: within the hour one is walking on the neighbour's roof
  shot(1, [620, 1320, 1.45], [660, 1340, 1.3], function (u, d, t) {
    var fk = clamp((u - 0.8) / 1.8), fx = lerp(650, 1010, ease(fk)), fy = lerp(1500, 1520, fk) - Math.sin(fk * Math.PI) * 420;
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "happy" }], [1.6, { x: MX, y: MY, f: 1, p: "pointUp", mood: "worry" }], [3.2, { x: MX, y: MY, f: 1, p: "shock", mood: "shock" }]], t);
    var an = flock(t, { skip: [2] }) + hen(fx, fy, { col: "w", f: 1, t: t, flap: fk > 0 && fk < 1, walk: fk >= 1, seed: 3 });
    var s = scene(t, {}, { topK: 0, animals: an }, m);
    return s + pill("سطح الجيران!", 900, 1180, u, 2.6, { bg: "#c7321f", sz: 34 }) + xmark(820, 1120, u, 1.8, 0.6);
  });
  // 2 — so you stretch wire across the top too
  shot(2, [600, 1260, 1.6], [600, 1320, 1.55], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "reach", mood: "n" }], [1.6, { x: MX, y: MY, f: 1, p: "push", mood: "n" }], [2.4, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var s = scene(t, {}, { topK: clamp((u - 0.2) / 1.2), animals: flock(t) }, m);
    return s + pill("سقف سلك", 640, 1050, u, 1.0, { col: "#ffd23a" }) + ring(640, 1180, 110, u, 1.1, t);
  });
  // 3 — but at night a cat reaches a paw through the mesh and grabs a hen by the leg
  shot(3, [640, 1400, 1.5], [620, 1420, 1.6], function (u, d, t) {
    var cx = lerp(1100, 870, ease(clamp(u / 1.4))), rk = clamp((u - 1.6) / 0.8), pull = clamp((u - 2.6) / 0.8);
    var an = flock(t, { skip: [2], peck: false, sleep: true }) + hen(lerp(700, 760, pull), 1505, { col: "w", f: 1, t: t, flap: pull > 0, seed: 3 }) + cat(cx, 1540, -1, t, { night: true, reach: u > 1.4 ? rk : null, tx: 120, ty: -40 });
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [3.0, { x: MX, y: MY, f: 1, p: "shock", mood: "shock" }]], t);
    var s = scene(t, {}, { night: true, animals: an }, m);
    return s + pill("قطة!", 860, 1220, u, 1.0, { bg: "#c7321f" }) + xmark(780, 1360, u, 2.8, 0.55);
  });
  // 4 — worse, the weasel slips through a finger-sized hole and kills the whole coop in one night
  shot(4, [520, 1420, 1.9], [540, 1400, 1.75], function (u, d, t) {
    var wx = lerp(200, 640, ease(clamp((u - 0.4) / 2.6))), dead = u > 3.6;
    var an = (dead ? "" : flock(t, { peck: false, sleep: true })) + weasel(wx, 1532, 1, t, 1);
    if (dead) for (var i = 0; i < 4; i++) an += '<g transform="translate(' + (470 + i * 70) + ' 1520) rotate(80)">' + hen(0, 0, { col: i % 2 ? "b" : "w", f: 1, t: 0, sleep: true, roost: true }) + '</g>';
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [2.6, { x: MX, y: MY, f: 1, p: "point", mood: "worry" }], [3.8, { x: MX, y: MY, f: 1, p: "cover", mood: "shock" }]], t);
    var s = scene(t, {}, { night: true, animals: an }, m);
    s += '<g filter="url(#sh)">' + C(460, 1200, 70, "#fff", { st: INK, sw: 4 }) + C(460, 1200, 62, "url(#hex)", { sw: 0 }) + C(460, 1200, 22, "none", { st: "#ffd23a", sw: 5 }) + '</g>';
    return s + pill("ابن عرس", 640, 1290, u, 0.8, { bg: "#c7321f" }) + pill("خرم قد صباعك", 460, 1080, u, 1.8, { sz: 32 });
  });
  // 5 — chicken wire keeps hens in, it doesn't keep anything out
  shot(5, [600, 1360, 1.6], [600, 1360, 1.7], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "point", mood: "n" }], [2.0, { x: MX, y: MY, f: 1, p: "shrug", mood: "worry" }]], t);
    var s = scene(t, {}, { animals: flock(t) + cat(910, 1560, -1, t, {}) }, m);
    s += K.arrowH(640, 1400, 760, "#5ad07a", 10, clamp((u - 0.3) / 0.6)) + K.arrowH(880, 1340, 790, "#e8452e", 10, clamp((u - 1.4) / 0.6));
    return s + vmark(700, 1300, u, 0.9, 0.5) + xmark(830, 1250, u, 2.0, 0.5) + pill("يحبس جوه", 600, 1110, u, 0.6, { col: "#9fe8b0", sz: 34 }) + pill("مش يحمي", 760, 1180, u, 1.8, { bg: "#c7321f", sz: 34 });
  });
  // 6 — so you swap it for stiff steel mesh, half-inch holes: the protection mesh
  shot(6, [600, 1330, 1.6], [560, 1380, 1.85], function (u, d, t) {
    var g = clamp((u - 0.6) / 1.6);
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "hammer", mood: "n" }], [2.6, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var s = scene(t, {}, { hexK: 1 - g, gridK: g, animals: flock(t) }, m);
    s += '<g filter="url(#sh)">' + C(520, 1120, 70, "#fff", { st: INK, sw: 4 }) + C(520, 1120, 62, "url(#grid)", { sw: 0 }) + '</g>';
    return s + pill("نص بوصة", 520, 1010, u, 1.2, { col: "#ffd23a" }) + pill("شبكة الحماية", 650, 1250, u, 2.6, { col: "#9fe8b0", sz: 36 }) + ring(560, 1380, 140, u, 1.0, t);
  });
  // 7 — but the summer sun turns the roof tiles into fire, hens don't sweat: over thirty degrees they pant and lay less
  shot(7, [640, 1300, 1.5], [600, 1380, 1.75], function (u, d, t) {
    var hk = clamp((u - 0.3) / 1.6);
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [1.8, { x: MX, y: MY, f: 1, p: "collar", mood: "dizzy" }], [5.0, { x: MX, y: MY, f: 1, p: "worry", mood: "worry" }]], t);
    var s = scene(t, {}, { hot: hk, animals: flock(t, { pant: u > 2.4, peck: false }) }, m);
    s += thermo(840, 1300, lerp(0.35, 0.92, clamp((u - 2.8) / 1.6)), clamp((u - 2.6) * 2));
    return s + pill("البلاط نار", 560, 1120, u, 1.0, { bg: "#c7321f", sz: 34 }) + pill("+٣٠°", 840, 1060, u, 3.6, { bg: "#c7321f" }) + pill("مابتعرقش", 520, 1250, u, 2.4, { sz: 34 });
  });
  // 8 — so you build them a little house with a roof and shade, on legs off the tiles, with a wooden ramp to the door
  shot(8, [700, 1300, 1.75], [660, 1340, 1.6], function (u, d, t) {
    var hk = clamp((u - 0.4) / 1.4);
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "hammer", mood: "n" }], [3.2, { x: MX, y: MY, f: 1, p: "point", mood: "n" }], [4.8, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var shade = '<ellipse cx="' + ((HX0 + HX1) / 2 - 30) + '" cy="1488" rx="140" ry="22" fill="#000" opacity="' + f(0.25 * hk) + '"/>';
    var an = shade + hen(700, 1490, { col: "w", f: -1, t: t, seed: 1 }) + hen(560, 1525, { col: "b", f: 1, t: t, seed: 2, peck: true }) + (u > 3 ? hen(lerp(520, 590, clamp((u - 3) / 1.5)), lerp(1500, 1420, clamp((u - 3) / 1.5)), { col: "w", f: 1, t: t, walk: true, seed: 4 }) : hen(470, 1505, { col: "w", f: 1, t: t, peck: true, seed: 4 }));
    var s = scene(t, {}, { houseK: hk, hot: 0.3, animals: an }, m);
    return s + pill("بيت بضل", 725, 1080, u, 1.4, { col: "#ffd23a" }) + pill("رجلين", 860, 1450, u, 2.4, { sz: 32 }) + pill("سلّم", 470, 1400, u, 3.4, { sz: 32 });
  });
  // 9 — but shut the house on them and the hot air and the damp of their breath stay trapped inside
  shot(9, [725, 1330, 1.9], [725, 1330, 2.1], function (u, d, t) {
    var hk = clamp((u - 0.8) / 1.6);
    var m = act(u, [[0, { x: 520, y: IN, f: 1, p: "push", mood: "n" }], [1.2, { x: 520, y: IN, f: 1, p: "stand", mood: "n" }], [2.6, { x: 520, y: IN, f: 1, p: "cough", mood: "sick" }]], t);
    var s = scene(t, {}, { closed: clamp(u / 0.6), animals: flock(t, { skip: [0, 2] }) }, m, true);
    s += C(725, 1320, 140 * hk, "url(#heatIn)") ;
    for (var i = 0; i < 5; i++) { var p = (t * 0.5 + i / 5) % 1; s += P("M" + (650 + i * 36) + " " + f(1390 - p * 120) + " q10 -12 0 -24", "#ffb08a", 5, ' opacity="' + f(hk * (1 - p)) + '"'); }
    return s + pill("محبوس جوه!", 725, 1110, u, 1.4, { bg: "#c7321f", sz: 34 }) + xmark(860, 1220, u, 2.2, 0.5);
  });
  // 10 — so you cut slots up under the roof, higher than where they sleep, and the hot air leaves on its own
  shot(10, [725, 1290, 2.0], [700, 1310, 1.75], function (u, d, t) {
    var m = act(u, [[0, { x: 520, y: IN, f: 1, p: "reach", mood: "n" }], [2.6, { x: 520, y: IN, f: 1, p: "breathe", mood: "happy" }]], t);
    var s = scene(t, {}, { vents: u > 0.8, closed: 0, animals: flock(t, { skip: [0, 2] }) }, m, true);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) { var p = (t * 0.6 + j / 2 + i * 0.13) % 1, x = HX0 + 57 + i * 50; s += K.arrowV(x, HT + 4, HT - 80 * p - 10, "#ffb08a", 6, u > 1.2 ? 1 : 0); }
    return s + pill("فتحات تحت السقف", 725, 1080, u, 0.9, { col: "#ffd23a", sz: 32 }) + ring(725, HT + 14, 90, u, 0.9, t);
  });
  // 11 — but at night hens don't sleep on the floor, they look for something high to stand on
  shot(11, [700, 1360, 1.9], [700, 1380, 2.05], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [1.6, { x: MX, y: MY, f: 1, p: "shrug", mood: "worry" }]], t);
    var an = hen(660, 1392, { col: "w", f: 1, t: t, seed: 1 }) + hen(740, 1392, { col: "b", f: -1, t: t, seed: 2 }) + flock(t, { skip: [0, 1, 2] });
    var s = scene(t, {}, { night: true, animals: an }, m);
    s += K.arrowV(660, 1300, 1250, "#ffd23a", 6, clamp(u - 0.8)) + K.arrowV(740, 1300, 1250, "#ffd23a", 6, clamp(u - 1.0));
    return s + pill("فين أنام؟", 620, 1110, u, 0.8, { sz: 34 });
  });
  // 12 — so you lay a bar across inside the house: the roosting bar
  shot(12, [710, 1320, 2.1], [710, 1330, 1.85], function (u, d, t) {
    var pk = clamp((u - 0.3) / 0.8), up = clamp((u - 1.4) / 0.8);
    var m = act(u, [[0, { x: 520, y: IN, f: 1, p: "reach", mood: "n" }], [2.2, { x: 520, y: IN, f: 1, p: "thumbs", mood: "happy" }]], t);
    var an = hen(lerp(660, 680, up), lerp(1392, 1316, ease(up)), { col: "w", f: 1, t: t, seed: 1, flap: up > 0 && up < 1, roost: up >= 1, sleep: up >= 1, s: 0.85 }) + hen(lerp(760, 750, up), lerp(1392, 1316, ease(up)), { col: "b", f: -1, t: t, seed: 2, flap: up > 0 && up < 1, roost: up >= 1, sleep: up >= 1, s: 0.85 });
    var s = scene(t, {}, { night: true, perch: pk > 0, animals: an, noTint: false }, m, true);
    return s + pill("خشبة النوم", 725, 1130, u, 0.9, { col: "#ffd23a" }) + ring(725, 1322, 100, u, 0.5, t);
  });
  var ROOST = function (t) { return hen(680, 1316, { col: "w", f: 1, t: t, roost: true, s: 0.85, sleep: true }) + hen(750, 1316, { col: "b", f: -1, t: t, roost: true, s: 0.85, sleep: true }); };
  // 13 — but a hen won't lay just anywhere: she looks for a dark hidden corner
  shot(13, [700, 1380, 1.9], [700, 1380, 2.05], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [1.8, { x: MX, y: MY, f: 1, p: "shrug", mood: "worry" }]], t);
    var hx = lerp(560, 760, ease(clamp(u / 2.4)));
    var an = hen(hx, 1505, { col: "b", f: 1, t: t, walk: true, seed: 2 }) + flock(t, { skip: [1, 3] });
    var s = scene(t, {}, { animals: an }, m) + C(790, 1380, 70, "url(#dark)");
    return s + pill("ركن ضلمة؟", 600, 1150, u, 0.8, { sz: 34 });
  });
  // 14 — so you make boxes with straw, one for every four or five hens: the nest boxes
  shot(14, [740, 1350, 2.1], [720, 1350, 1.85], function (u, d, t) {
    var m = act(u, [[0, { x: 520, y: IN, f: 1, p: "crouch", mood: "n" }], [2.6, { x: 520, y: IN, f: 1, p: "cheer", mood: "happy" }]], t);
    var s = scene(t, {}, { nests: u > 0.6, perch: 1, animals: (u > 2.2 ? hen(752, 1372, { col: "b", f: -1, t: t, roost: true, s: 0.8 }) : "") + flock(t, { skip: [0, 1, 2] }) }, m, true);
    return s + pill("أعشاش البيض", 690, 1150, u, 1.0, { col: "#ffd23a" }) + pill("صندوق لكل ٥", 690, 1240, u, 1.8, { sz: 30 }) + ring(752, 1377, 70, u, 0.7, t);
  });
  // 15 — the odd thing: many think a hen needs a rooster to lay
  shot(15, [620, 1360, 1.7], [620, 1360, 1.8], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "point", mood: "happy" }], [1.6, { x: MX, y: MY, f: 1, p: "shrug", mood: "n" }]], t);
    var an = hen(560, 1520, { rooster: true, f: 1, t: t, seed: 5 }) + flock(t, { skip: [1, 3] });
    var s = scene(t, {}, { animals: an }, m);
    return s + bubble(420, 1140, T("؟", 0, 30, 90, "#2a2522"), u, 0.6) + pill("لازم ديك؟", 640, 1110, u, 1.2, { sz: 36 });
  });
  // 16 — really she lays almost every day with no rooster; he's only needed for the egg to hatch
  shot(16, [740, 1360, 2.0], [720, 1360, 1.8], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "shrug", mood: "n" }], [1.4, { x: MX, y: MY, f: 1, p: "shock", mood: "shock" }], [3.2, { x: MX, y: MY, f: 1, p: "point", mood: "happy" }]], t);
    var egg = u > 1.0, an = hen(752, 1372, { col: "b", f: -1, t: t, roost: true, s: 0.8 }) + hen(560, 1520, { rooster: true, f: 1, t: t, seed: 5 }) + flock(t, { skip: [1, 3] });
    var s = scene(t, {}, { egg: egg, animals: an }, m);
    s += xmark(560, 1430, u, 1.8, 0.5);
    return s + pill("بيضة كل يوم", 600, 1150, u, 1.0, { col: "#ffd23a" }) + pill("من غير ديك", 560, 1230, u, 1.8, { col: "#9fe8b0", sz: 34 });
  });
  // 17 — so if you only want eggs, skip the rooster, and spare the neighbours his dawn crowing
  shot(17, [700, 1360, 1.6], [760, 1360, 1.5], function (u, d, t) {
    var rx = lerp(560, 1060, ease(clamp((u - 1.4) / 2.0)));
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "point", mood: "n" }], [1.4, { x: MX, y: MY, f: 1, p: "wave", mood: "happy" }], [3.0, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var an = flock(t, { skip: [1, 3] }) + hen(rx, 1520 + (rx > 760 ? 30 : 0), { rooster: true, f: 1, t: t, walk: u > 1.4, seed: 5 });
    var s = scene(t, {}, { animals: an }, m);
    if (u < 1.4) for (var i = 0; i < 3; i++) s += P("M" + (612 + i * 10) + " " + (1430 - i * 20) + " q16 -10 30 0", "#2a2522", 4, ' opacity="' + f(0.5 + 0.5 * Math.sin(t * 12 + i)) + '"');
    return s + pill("كوكو الفجر", 540, 1140, u, 0.2, { sz: 32 }) + xmark(640, 1250, u, 1.0, 0.5) + pill("وفّر الديك", 640, 1100, u, 2.0, { col: "#9fe8b0", sz: 34 });
  });
  // 18 — but in winter the day gets short and the eggs drop until they stop
  shot(18, [640, 1320, 1.55], [660, 1350, 1.7], function (u, d, t) {
    var dk = clamp((u - 0.4) / 2.0), night = dk > 0.6;
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "stand", mood: "n" }], [2.0, { x: MX, y: MY, f: 1, p: "worry", mood: "worry" }]], t);
    var s = scene(t, {}, { night: night, animals: flock(t, { peck: !night, sleep: night }) }, m);
    var cnt = Math.max(0, 3 - Math.floor(dk * 4)), eg = ""; for (var i = 0; i < 3; i++) eg += '<ellipse cx="' + (600 + i * 60) + '" cy="1080" rx="22" ry="29" fill="' + (i < cnt ? "#f6ead6" : "none") + '" stroke="' + (i < cnt ? INK : "#aaa") + '" stroke-width="3" stroke-dasharray="' + (i < cnt ? "0" : "8 6") + '"/>';
    return s + '<g filter="url(#sh)">' + eg + '</g>' + pill("الشتا", 760, 1180, u, 0.6, { sz: 34 }) + (cnt === 0 ? xmark(660, 1170, u, 2.3, 0.5) : "");
  });
  // 19 — a hen needs about fourteen hours of light a day to keep laying
  shot(19, [660, 1300, 1.6], [660, 1320, 1.7], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "point", mood: "n" }], [2.2, { x: MX, y: MY, f: 1, p: "pointUp", mood: "happy" }]], t);
    var s = scene(t, {}, { animals: flock(t) }, m);
    var k = clamp((u - 0.4) / 2.4), arc = ""; for (var i = 0; i < 14; i++) { var a = -Math.PI / 2 + i / 14 * Math.PI * 2, on = i < k * 14; arc += P("M" + f(660 + Math.cos(a) * 70) + " " + f(1090 + Math.sin(a) * 70) + " L" + f(660 + Math.cos(a) * 92) + " " + f(1090 + Math.sin(a) * 92), on ? "#ffd23a" : "#6a6f76", 10); }
    s += '<g filter="url(#sh)">' + C(660, 1090, 110, "#262a30", { st: "#111", sw: 3 }) + arc + T(Math.round(k * 14) + "", 660, 1108, 52, "#ffd23a") + '</g>';
    return s + pill("ساعة نور", 660, 1250, u, 1.2, { sz: 32 }) + C(660, 1090, 0, "none");
  });
  // 20 — so you hang a small lamp inside the house and switch it on at dawn before the sun
  shot(20, [720, 1300, 1.9], [720, 1320, 1.75], function (u, d, t) {
    var on = clamp((u - 1.6) / 0.4);
    var m = act(u, [[0, { x: 520, y: IN, f: 1, p: "reach", mood: "n" }], [1.6, { x: 520, y: IN, f: 1, p: "point", mood: "n" }], [2.6, { x: 520, y: IN, f: 1, p: "thumbs", mood: "happy" }]], t);
    var s = scene(t, {}, { night: true, lamp: u > 0.4, lampOn: on, animals: ROOST(t) }, m, true);
    return s + pill("لمبة الفجر", 725, 1100, u, 0.8, { col: "#ffd23a" }) + ring(725, HT + 44, 60, u, 1.6, t);
  });
  // 21 — what's left: a waterer, a hanging feeder and a little sand to dust-bathe in
  shot(21, [600, 1400, 1.85], [620, 1390, 1.7], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "crouch", mood: "n" }], [2.8, { x: MX, y: MY, f: 1, p: "thumbs", mood: "happy" }]], t);
    var an = hen(480, 1535, { col: "w", f: 1, t: t, peck: true, seed: 1 }) + hen(560, 1490, { col: "b", f: -1, t: t, peck: true, seed: 2 }) + hen(700, 1515, { col: "w", f: 1, t: t, seed: 3, flap: Math.sin(t * 2) > 0.6 });
    var s = scene(t, {}, { extrasK: clamp(u / 0.8), animals: an }, m);
    return s + pill("مية", 474, 1430, u, 0.6, { sz: 30 }) + pill("علف", 560, 1360, u, 1.6, { sz: 30 }) + pill("رمل", 700, 1460, u, 2.6, { sz: 30 });
  });
  // 22 — congratulations, you built a chicken coop yourself
  shot(22, [620, 1340, 1.5], [600, 1300, 1.2], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "cheer", mood: "happy" }], [1.6, { x: MX, y: MY, f: 1, p: "thumbs", mood: "proud" }]], t);
    var s = scene(t, {}, { animals: flock(t) + ROOST(t) }, m) + K.confetti(t, 300, 900, 1000, 1560);
    return s + pill("مبروك!", 600, 1000, u, 0.3, { col: "#9fe8b0", sz: 56 });
  });
  // 23 — outro
  shot(23, [600, 1300, 1.2], [600, 1290, 1.25], function (u, d, t) {
    var m = act(u, [[0, { x: MX, y: MY, f: 1, p: "wave", mood: "happy" }]], t);
    var s = scene(t, {}, { animals: flock(t) + ROOST(t) }, m);
    return s + pill("قولولنا!", 600, 1000, u, 0.3, { col: "#ffd23a", sz: 56 });
  });
  window.__coop = { scene: scene, flock: flock, roost: ROOST, act: act };
})();
