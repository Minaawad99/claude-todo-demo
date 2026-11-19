/* «من مسمار لمطرقة خوازيق ديزل» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   A building site on soft Nile clay, the earth cut open in layers (fill, soft clay, a firm sand layer at ~20 m — after
   r07); a building on the left that sinks and then stands on piles; one concrete pile in the middle that is driven line
   by line: a hand hammer, a tall timber tripod with men on the rope, a winch, a yellow steel leader mast (after r13), a
   helmet with a plywood cushion, then a diesel hammer drawn cut open (our own drawing; r05 was avoided). Scale: 1 m ≈ 75. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.42; }); return K.act(u, Ks, t); };
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY, M = 75, PX = 560, PW = 46, LP = 20 * M, CLAY = GY + 130, SAND = GY + 20 * M - 60;
  var TOPY = GY - LP - 300;   // apex of the tripod / top of the mast

  // ── the ground in layers ──
  function layers(t) {
    var s = '<rect x="-1400" y="' + CLAY + '" width="3800" height="' + (SAND - CLAY) + '" fill="url(#clay)" opacity=".92"/>';
    for (var k = 0; k < 60; k++) { var x = -1300 + hash(k + 11) * 3600, y = CLAY + 40 + hash(k + 21) * (SAND - CLAY - 80); s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(30 + hash(k) * 60) + '" ry="6" fill="#4e473c" opacity=".35"/>'; }
    var d = "M-1400 " + SAND; for (var x2 = -1400; x2 <= 2400; x2 += 60) d += " L" + x2 + " " + f(SAND + Math.sin(x2 * 0.01) * 14); s += '<path d="' + d + ' V' + (SAND + 900) + ' H-1400 Z" fill="url(#sandL)" stroke="' + INK + '" stroke-width="3"/>';
    for (var q = 0; q < 50; q++) s += C(-1300 + hash(q + 31) * 3600, SAND + 40 + hash(q + 41) * 600, 4 + hash(q) * 6, "#8a6a3a", { op: 0.6 });
    s += pill("طين طري", -900, CLAY + 120, 9, 0, { bg: "#4e473c", sz: 36, down: false }) + pill("رمل ناشف", -900, SAND + 110, 9, 0, { bg: "#8a6a3a", sz: 36, down: false });
    return s;
  }
  // a small building on the left: sinks/tilts on clay (k 0…1) or stands on piles
  function building(t, sink, piles) {
    var bx = -640, bw = 420, bh = 620, tilt = sink * 7, dy = sink * 70, s = "";
    if (piles) for (var i = 0; i < 5; i++) { var px = bx + 30 + i * 90; s += R(px, GY, 26, SAND - GY + 30, "url(#pileG)", { sw: 2 }); }
    s += '<g transform="translate(' + f(bx + bw / 2) + ' ' + f(GY + dy) + ') rotate(' + f(tilt) + ')"><g filter="url(#sh)">' + R(-bw / 2, -bh, bw, bh, "#e2cfa8") + '</g>';
    for (var fl = 0; fl < 4; fl++) for (var w = 0; w < 3; w++) s += R(-bw / 2 + 40 + w * 130, -bh + 40 + fl * 150, 80, 90, "#7fa9c8", { sw: 2 });
    s += R(-bw / 2 - 10, -bh - 16, bw + 20, 18, "#c9b28a", { sw: 2 }) + R(-bw / 2 - 6, -6, bw + 12, 30, "url(#conc)", { sw: 2 }) + '</g>';
    if (sink > 0.2) s += P("M" + (bx - 30) + " " + (GY + 6) + " q20 -14 40 0 M" + (bx + bw) + " " + (GY + 4) + " q20 -16 40 0", "#5e5649", 6);
    return s;
  }
  // the pile: penetration pen (m); the top shows a helmet + plywood cushion when helmet
  function pile(t, pen, o) { o = o || {}; var top = GY - LP + pen * M, s = "";
    var crack = o.crack ? clamp(o.crack) : 0;
    s += '<g filter="url(#sh)"' + (o.lean ? ' transform="rotate(' + f(o.lean) + ' ' + PX + ' ' + GY + ')"' : "") + '>' + R(PX - PW / 2, top, PW, LP, "url(#pileG)", { sw: 3 }) + F("M" + (PX - PW / 2) + " " + f(top + LP) + " L" + PX + " " + f(top + LP + 40) + " L" + (PX + PW / 2) + " " + f(top + LP) + " Z", "url(#pileG)");
    for (var m = 1; m < 20; m++) s += P("M" + (PX - PW / 2) + " " + f(top + m * M) + " h" + (m % 5 ? 10 : 20), "#d8352a", 3);
    if (crack > 0) s += P("M" + (PX - 14) + " " + f(top) + " l8 " + f(30 * crack) + " l-6 " + f(20 * crack) + " M" + (PX + 10) + " " + f(top) + " l-6 " + f(26 * crack), INK, 3) + (function () { var c = ""; for (var k = 0; k < 6; k++) { var p = clamp(crack * 1.4 - k * 0.1); c += C(PX - 30 + k * 12 + p * (k % 2 ? 30 : -30), top - 4 + p * 60, 5, "#b8b2a6", { st: INK, sw: 1 }); } return c; })();
    if (o.helmet) { var hk = clamp(o.helmet), hy = lerp(top - 200, top - 46, ease(hk)); for (var l = 0; l < 4; l++) s += R(PX - PW / 2 - 4, hy + 30 + l * 4, PW + 8, 4, l % 2 ? "#d9b06a" : "#b8884a", { sw: 1 }); s += F("M" + (PX - 40) + " " + f(hy) + " H" + (PX + 40) + " V" + f(hy + 30) + " H" + (PX + PW / 2 + 6) + " V" + f(hy + 50) + " H" + (PX - PW / 2 - 6) + " V" + f(hy + 30) + " H" + (PX - 40) + " Z", "url(#iron)"); }
    return s + '</g>'; }
  function pileTop(pen) { return GY - LP + pen * M; }
  // a tall timber tripod with a pulley; rope to a hanging drop weight (wy = its bottom y) and down to the pullers / winch
  function tripod(t, wy, ropeTo, noW) { var ax = PX, ay = TOPY, s = "";
    [[PX - 360, 0.9], [PX + 360, 0.9], [PX + 60, 0.7]].forEach(function (l, i) { s += P("M" + l[0] + " " + GY + " L" + ax + " " + ay, i === 2 ? "#5a3820" : INK, 34) + P("M" + l[0] + " " + GY + " L" + ax + " " + ay, i === 2 ? "#6a4220" : "url(#log)", 26); });
    s += C(ax, ay + 20, 26, "#5a6068", { st: INK, sw: 3 }) + C(ax, ay + 20, 8, "#2b2e33");
    if (!noW) s += P("M" + (ax - 20) + " " + (ay + 20) + " V" + f(wy - 120), "#c9a46a", 5); s += P("M" + (ax + 20) + " " + (ay + 20) + " L" + f(ropeTo[0]) + " " + f(ropeTo[1]), "#c9a46a", 5);
    if (!noW) s += '<g filter="url(#sh)">' + R(PX - 48, wy - 120, 96, 120, "url(#iron)", { rx: 6 }) + R(PX - 12, wy - 132, 24, 14, "#5a6068", { sw: 2 }) + '</g>';
    return s; }
  function winch(t, spin) { var x = PX + 420, y = GY, s = '<g filter="url(#sh)">' + R(x - 70, y - 90, 150, 90, "url(#yel)", { rx: 8 }) + R(x + 40, y - 120, 40, 34, "#2b2e33", { rx: 4 }) + '</g>';
    var a = t * spin * 6; s += '<g transform="translate(' + (x - 10) + ' ' + (y - 50) + ')">' + C(0, 0, 34, "#5a6068", { st: INK, sw: 3 }); for (var k = 0; k < 4; k++) s += P("M0 0 L" + f(Math.cos(a + k * 1.57) * 30) + " " + f(Math.sin(a + k * 1.57) * 30), "#2b2e33", 4); s += '</g>';
    if (spin) for (var p = 0; p < 3; p++) { var q = (t * 0.8 + p / 3) % 1; s += C(x + 70 + q * 20, y - 130 - q * 60, 10 + q * 14, "url(#smoke)", { op: 1 - q }); }
    return s; }
  // the leader mast (yellow lattice after r13) with a crawler base, rails for the hammer
  function leader(t, k) { if (k <= 0) return ""; var top = lerp(GY, TOPY, ease(clamp(k))), s = "", x0 = PX - 62, x1 = PX - 30;
    s += '<g filter="url(#sh)">' + R(x0, top, 32, GY - top, "url(#yel)", { sw: 3 }) + '</g>'; var d = "";
    for (var y = top + 10; y < GY - 20; y += 40) d += "M" + x0 + " " + y + " L" + x1 + " " + (y + 40) + " M" + x1 + " " + y + " L" + x0 + " " + (y + 40) + " ";
    s += P(d, "#8a6a10", 3) + R(PX + 150, GY - 120, 280, 90, "url(#yel)", { rx: 12 }) + R(PX + 330, GY - 210, 90, 100, "#f6c63a", { rx: 8 }) + R(PX + 342, GY - 196, 60, 50, "#bfe0ff", { sw: 2 });
    s += R(PX + 130, GY - 40, 320, 40, "#2b2e33", { rx: 20 }); for (var w = 0; w < 6; w++) s += C(PX + 160 + w * 52, GY - 20, 14, "#5a6068", { st: INK, sw: 2 });
    s += P("M" + (PX + 200) + " " + (GY - 110) + " L" + (x1) + " " + f(lerp(GY, top + 300, 1)), "url(#yel)", 22) + P("M" + (PX + 200) + " " + (GY - 110) + " L" + x1 + " " + f(top + 300), INK, 2);
    return s; }
  // the diesel hammer, cut open: a cylinder on the helmet, the ram (piston) at height ry above impact (0 = down),
  // fuel jet (fuel 0…1), blast glow (fire 0…1), exhaust puff (ex 0…1)
  function diesel(t, pen, o) { o = o || {}; var base = pileTop(pen) - 46, cylH = 520, top = base - cylH, x0 = PX - 52, w = 104, s = "";
    s += '<g filter="url(#sh)">' + R(x0, top, w, cylH, "url(#iron)", { rx: 10 }) + '</g>' + R(x0 + 18, top + 40, w - 36, cylH - 80, "#20242a", { sw: 2 }) + R(PX - 34, base - 40, 68, 40, "#5a6068", { sw: 2 });
    var ry = o.ry || 0, ramH = 170, ramY = base - 46 - ramH - ry;
    if (o.fire) s += R(PX - 34, ramY + ramH, 68, Math.max(6, base - 46 - (ramY + ramH)), "url(#fire)", { sw: 0, op: clamp(o.fire) });
    s += R(PX - 34, ramY, 68, ramH, "url(#pileG)", { sw: 2, rx: 4 }) + P("M" + (PX - 28) + " " + (ramY + 20) + " V" + (ramY + ramH - 20), "#fff", 5, ' opacity=".5"');
    s += R(x0 + w, base - 140, 34, 60, "#d8352a", { rx: 4, sw: 2 }) + T("D", x0 + w + 17, base - 102, 22, "#fff");
    if (o.fuel) for (var k = 0; k < 6; k++) s += C(PX - 20 + k * 8, base - 56 - hash(k) * 10, 3, "#e2b035", { op: clamp(o.fuel) });
    if (o.ex) for (var p = 0; p < 4; p++) { var q = clamp(o.ex) * (0.6 + p * 0.15); s += C(x0 - 30 - q * 80, base - 120 - q * 120 - p * 20, 24 + q * 40, "url(#smoke)", { op: 1 - q * 0.8 }); }
    return s; }
  function hammerCycle(t, rate) { var c = (t * rate) % 1; return { ry: c < 0.08 ? 0 : 320 * Math.sin((c - 0.08) / 0.92 * Math.PI), fire: c < 0.12 ? 1 - c / 0.12 : 0, ex: c < 0.3 ? c / 0.3 : 0, fuel: c > 0.86 ? 1 : 0, hit: c < 0.05 }; }
  // a workbench at hip height (0.9 m); the nail stands where the hammer head lands for a man at x 200 (kit hammer stroke)
  function bench(t, nailK) { var s = '<g filter="url(#sh)">' + R(230, GY - 56, 170, 12, "url(#log)") + R(238, GY - 44, 12, 44, "#6a4220", { sw: 2 }) + R(380, GY - 44, 12, 44, "#6a4220", { sw: 2 }) + '</g>';
    var ny = lerp(GY - 86, GY - 70, nailK); s += R(236, GY - 68, 130, 12, "#d9b06a", { sw: 2 }) + R(252, ny, 4, GY - 68 - ny + 4, "#9aa2ac", { sw: 1 }) + R(246, ny - 4, 16, 4, "#9aa2ac", { sw: 1 });
    return s; }
  function tape(t) { var s = ""; for (var k = 0; k < 2; k++) { var x = k ? PX + 520 : PX - 520; s += R(x - 4, GY - 120, 8, 120, "#d8352a", { sw: 2 }); } var d = "M" + (PX - 520) + " " + (GY - 100) + " Q" + PX + " " + f(GY - 80 + Math.sin(t * 2) * 6) + " " + (PX + 520) + " " + (GY - 100); return s + P(d, "#d8352a", 10) + P(d, "#fff", 10, ' stroke-dasharray="20 20"'); }
  function venice(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k)) + '" transform="translate(540 760) scale(' + f(0.8 + 0.2 * ease(clamp(k))) + ')"><g filter="url(#sh)">' + R(-380, -330, 760, 660, "#f6f1e6", { rx: 20, sw: 6 }) + '</g>';
    s += R(-350, -300, 700, 380, "#a9cde6", { sw: 0 }); var cols = ["#d8826a", "#e2b06a", "#c96a5a", "#e8c48e"]; for (var b = 0; b < 4; b++) { var bx = -330 + b * 170, bh = 220 + (b % 2) * 50; s += R(bx, 60 - bh, 150, bh, cols[b], { sw: 3 }); for (var w = 0; w < 4; w++) s += F("M" + (bx + 18 + (w % 2) * 70) + " " + (60 - bh + 50 + Math.floor(w / 2) * 80) + " v40 h40 v-40 q-20 -24 -40 0 Z", "#3a4a5a", { sw: 2 }); }
    s += R(-350, 60, 700, 70, "#2f7fb8", { sw: 0, op: 0.85 }); for (var p = 0; p < 22; p++) s += R(-340 + p * 31, 130, 14, 160, "#8a5a30", { sw: 1.5 });
    s += R(-350, 130, 700, 170, "#5e5649", { sw: 0, op: 0.35 }) + T("فينيسيا", 0, -250, 44, INK) + '</g>'; return s; }
  function counter(t, k) { if (k <= 0) return ""; var n = Math.min(12, Math.floor(clamp(k) * 13)), s = '<g opacity="' + f(clamp(k * 3)) + '" filter="url(#sh)">' + R(PX + 120, GY - 520, 300, 170, "#1e2226", { rx: 14 }) + T(n + "", PX + 270, GY - 400, 90, "#7cf2a0") + T("ضربة / ٢٥ سم", PX + 270, GY - 480, 28, "#cfd3d8") + '</g>'; return s; }

  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o);
    var s = '<rect x="-3000" y="-4000" width="6000" height="3200" fill="' + (h.night ? "#0f1d3a" : "#6fa8d6") + '"/>' + K.sky(t, h.night) + K.palm(-1100, t, 1.1) + K.palm(1500, t, 1.0) + K.ground(t) + layers(t);
    s += building(t, h.sink || 0, h.piles || b.bpiles);
    return s; }

  // ── the build per line (on from the line after the one that adds it) ──
  K.steps([[2, { bpiles: 1 }], [6, { winch: 1 }], [8, { leader: 1 }], [10, { helmet: 1 }], [12, { diesel: 1 }]]);   // line that adds it; on from the next line
  var RIGCAM = [560, 300, 0.62], GRD = GY;
  function rig(t, b, h) { h = h || {}; var pen = h.pen, s = "";
    if (b.leader || h.leader) s += leader(t, h.leader != null ? h.leader : 1);
    if (!b.leader && !h.leader && h.tripod !== false) s += tripod(t, h.wy != null ? h.wy : pileTop(pen) - 160, h.rope || [PX + 420, GY - 60]);
    if ((b.winch || h.winch) && !b.diesel) s += winch(t, h.spin || 0);
    s += pile(t, pen, { helmet: b.helmet || h.helmet ? (h.helmet == null ? 1 : h.helmet) : 0, crack: h.crack, lean: h.lean });
    if ((b.leader || h.leader) && !(b.diesel || h.diesel)) { var hy = h.wy != null ? h.wy : pileTop(pen) - 60; s += R(PX - 48, hy - 120, 96, 120, "url(#iron)", { rx: 6 }) + R(PX - 66, hy - 100, 22, 20, "#5a6068", { sw: 2 }) + P("M" + PX + " " + (hy - 120) + " V" + (TOPY + 20), "#c9a46a", 5); }
    if (b.diesel || h.diesel) s += diesel(t, pen, h.cyc || {});
    return s; }

  // 0 — a hammer and a nail in a plank: the simplest pile hammer
  shot(0, [270, GY - 130, 3.4], [280, GY - 150, 2.8], function (u, d, t) {
    var nk = clamp(Math.floor(u * 1.0) / 4), s = scene(t) + bench(t, nk);
    s += act(u, [[0, { x: 200, y: GY, f: 1, p: "hammer", mood: "n", rate: 1.0 }], [4.2, { x: 200, y: GY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("أبسط مطرقة", 300, GY - 300, u, 2.4, { col: "#ffd23a", sz: 30 });
  });
  // 1 — but a building on soft clay sinks and tilts
  shot(1, [-430, GY - 200, 1.0], [-430, GY - 140, 1.15], function (u, d, t) {
    var sk = clamp((u - 0.4) / 2.2), s = scene(t, {}, { sink: sk });
    s += act(u, [[0, { x: -120, y: GY, f: -1, p: "stand", mood: "n" }], [1.4, { x: -120, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("بتغطس وتميل!", -430, GY - 820, u, 1.6, { bg: "#c7321f", sz: 40 }) + xmark(-160, GY - 300, u, 2.0, 0.8);
  });
  // 2 — so you drive long concrete columns into the ground like giant nails: piles
  shot(2, [-430, GY + 360, 0.55], [-400, GY + 120, 0.78], function (u, d, t) {
    var pk = clamp((u - 0.3) / 2.6), s = scene(t, {}, { sink: 1 - pk, piles: false });
    for (var i = 0; i < 5; i++) { var px = -610 + i * 90, kk = clamp(pk * 1.4 - i * 0.08); s += R(px, GY, 26, (SAND - GY + 30) * kk, "url(#pileG)", { sw: 2 }); }
    if (pk >= 1) for (var j = 0; j < 5; j++) { var ap = (t * 0.6 + j / 5) % 1; s += K.arrowV(-597 + j * 90, lerp(GY + 40, SAND - 120, ap), lerp(GY + 40, SAND - 120, ap) + 160, "#ffd23a", 20, 1); }
    s += act(u, [[0, { x: -120, y: GY, f: -1, p: "worry", mood: "worry" }], [2.4, { x: -120, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("الخوازيق", -430, SAND - 160, u, 1.6, { col: "#ffd23a", sz: 44 }) + ring(-430, SAND - 30, 200, u, 2.4, t);
  });
  // 3 — but a pile can be 20 m long and a hand hammer won't move it a centimetre
  shot(3, [560, GY - 1300, 0.95], [600, GY - 160, 1.6], function (u, d, t) {
    var s = scene(t) + pile(t, 0, {});
    s += act(u, [[0, { x: PX + 90, y: GY, f: -1, p: "hammer", mood: "n", rate: 1.8 }], [1.8, { x: PX + 110, y: GY, f: -1, p: "shrug", mood: "worry" }]], t);
    for (var m = 0; m <= 20; m += 5) s += T(m + "", PX - 70, GY - m * M + 10, 30, "#fff", { stroke: INK });
    return s + pill("٢٠ متر", PX + 200, GY - 1100, u, 0.6, { col: "#ffd23a", sz: 50 }) + xmark(PX + 60, GY - 230, u, 1.8, 0.7);
  });
  // 4 — so a tall three-legged frame with a pulley lifts a heavy iron weight on a rope and drops it on the pile top
  shot(4, [560, TOPY + 320, 0.95], [720, GY - 220, 1.25], function (u, d, t) {
    var c = (u * 0.5) % 1, top = pileTop(lerp(0, 1, clamp((u - 1.8) / 4))), wy = top - (c < 0.8 ? lerp(0, 260, c / 0.8) : lerp(260, 0, (c - 0.8) / 0.2));
    var s = scene(t) + '<g opacity="' + f(clamp(u / 0.8)) + '">' + tripod(t, wy, [PX + 448, GY - 150]) + '</g>' + pile(t, lerp(0, 1, clamp((u - 1.8) / 4)), {});
    s += act(u, [[0, { x: PX + 470, y: GY, f: -1, p: { lean: -16, head: -10, aN: [150, 165], aF: [140, 160], lN: [16, 6], lF: [-18, -8] }, mood: "n" }], [2.6, { x: PX + 470, y: GY, f: -1, p: { lean: -22, head: -14, aN: [130, 150], aF: [120, 145], lN: [22, 8], lF: [-22, -12] }, mood: "happy" }]], t);
    return s + pill("بكرة", PX + 120, TOPY + 20, u, 0.6) + pill("تقل حديد", PX + 170, top - 200, u, 1.2, { col: "#ffd23a" });
  });
  // 5 — but the men on the rope barely lift it a few times a minute
  shot(5, [740, GY - 220, 1.35], [680, GY - 520, 1.1], function (u, d, t) {
    var c = (u * 0.18) % 1, top = pileTop(1), wy = top - lerp(0, 220, Math.sin(c * Math.PI));
    var s = scene(t) + tripod(t, wy, [PX + 448, GY - 150]) + pile(t, 1, {});
    s += P("M" + (PX + 448) + " " + (GY - 150) + " L" + (PX + 538) + " " + (GY - 146), "#c9a46a", 5);
    s += act(u, [[0, { x: PX + 470, y: GY, f: -1, p: { lean: -22, head: -14, aN: [130, 150], aF: [120, 145], lN: [22, 8], lF: [-22, -12] }, mood: "worry" }], [1.4, { x: PX + 470, y: GY, f: -1, p: "collar", mood: "dizzy" }]], t);
    s += act(u, [[0, { x: PX + 560, y: GY, f: -1, p: { lean: -20, head: -10, aN: [130, 150], aF: [125, 148], lN: [20, 8], lF: [-20, -10] }, mood: "dizzy", shirt: "url(#shirt2)", shirtD: "#7a2a18" }]], t);
    return s + pill("كام مرة في الدقيقة", PX + 260, GY - 520, u, 1.0, { bg: "#c7321f", sz: 34 });
  });
  // 6 — so you fit a motor winch that lifts the weight and lets it fall on its own
  shot(6, [660, GY - 380, 1.0], [680, GY - 300, 1.15], function (u, d, t) {
    var c = (u * 0.9) % 1, pen = lerp(1, 3, clamp(u / d)), top = pileTop(pen), wy = top - (c < 0.75 ? lerp(0, 300, c / 0.75) : lerp(300, 0, (c - 0.75) / 0.25));
    var s = scene(t) + tripod(t, wy, [PX + 410, GY - 50]) + winch(t, u > 0.6 ? 1 : 0) + pile(t, pen, {});
    s += act(u, [[0, { x: PX + 560, y: GY, f: -1, p: "reach", mood: "n" }], [1.4, { x: PX + 600, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("ونش بموتور", PX + 420, GY - 230, u, 0.6, { col: "#ffd23a" });
  });
  // 7 — but the falling weight swings and hits the pile off-centre, so it tilts or breaks
  shot(7, [560, GY - 1450, 1.0], [620, GY - 220, 1.2], function (u, d, t) {
    var sw = Math.sin(t * 2.6) * 70, lean = clamp((u - 1.2) / 1.2) * 5, top = pileTop(3);
    var s = scene(t) + tripod(t, 0, [PX + 410, GY - 50], true) + winch(t, 1) + pile(t, 3, { lean: lean });
    s += '<g transform="translate(' + f(sw) + ' 0)">' + R(PX - 48, top - 300, 96, 120, "url(#iron)", { rx: 6 }) + '</g>' + P("M" + PX + " " + (TOPY + 20) + " L" + f(PX + sw) + " " + (top - 300), "#c9a46a", 5);
    s += act(u, [[0, { x: PX + 300, y: GY, f: -1, p: "stand", mood: "n" }], [1.2, { x: PX + 330, y: GY, f: -1, p: "cover", mood: "shock" }]], t);
    return s + pill("بيتمرجح!", PX, top - 420, u, 0.8, { bg: "#c7321f" }) + xmark(PX + 120, top - 40, u, 1.6, 0.8);
  });
  // 8 — so it rides on a tall steel mast and only falls in a straight line
  shot(8, [560, TOPY + 420, 0.85], [660, GY - 260, 1.15], function (u, d, t) {
    var lk = clamp((u - 0.2) / 1.6), c = (u * 0.9) % 1, top = pileTop(3.5), wy = top - (c < 0.75 ? lerp(0, 300, c / 0.75) : lerp(300, 0, (c - 0.75) / 0.25));
    var s = scene(t) + rig(t, has({ leader: 1 }), { pen: 3.5, leader: lk, wy: lk >= 1 ? wy : top - 60, tripod: false });
    s += act(u, [[0, { x: PX + 560, y: GY, f: -1, p: "pointUp", mood: "n" }], [2.0, { x: PX + 560, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("برج حديد", PX - 220, TOPY + 120, u, 1.2, { col: "#ffd23a" }) + vmark(PX + 140, top - 120, u, 2.2, 0.8);
  });
  // 9 — but hitting bare concrete crumbles the pile's head
  shot(9, [560, pileTop(4) - 120, 2.0], [620, GY - 220, 1.3], function (u, d, t) {
    var hit = clamp((u - 0.6) / 0.3), s = scene(t) + rig(t, has({}), { pen: 4, wy: pileTop(4) - lerp(200, 0, hit), crack: clamp((u - 0.8) / 1.2) });
    s += act(u, [[0, { x: PX + 150, y: GY, f: -1, p: "stand", mood: "n" }], [1.0, { x: PX + 170, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("بتتفتفت!", PX - 170, pileTop(4) - 170, u, 1.0, { bg: "#c7321f", sz: 34 });
  });
  // 10 — so you cap it with a steel helmet over a cushion of plywood layers that soaks up the shock
  shot(10, [560, pileTop(4) - 110, 2.4], [620, GY - 220, 1.3], function (u, d, t) {
    var s = scene(t) + rig(t, has({}), { pen: 4, helmet: clamp((u - 0.3) / 1.0), wy: pileTop(4) - 260 });
    s += act(u, [[0, { x: PX + 150, y: GY, f: -1, p: "reach", mood: "n" }], [1.8, { x: PX + 150, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("طاقية حديد", PX + 170, pileTop(4) - 220, u, 0.8, { col: "#ffd23a", sz: 30 }) + pill("مخدة خشب", PX - 170, pileTop(4) - 30, u, 1.6, { sz: 30 });
  });
  // 11 — but the winch wastes time on every lift, and you want fast blows one after another
  shot(11, [600, GY - 900, 0.8], [700, GY - 220, 1.25], function (u, d, t) {
    var c = (u * 0.35) % 1, top = pileTop(4) - 46, wy = top - (c < 0.85 ? lerp(0, 300, c / 0.85) : lerp(300, 0, (c - 0.85) / 0.15));
    var s = scene(t) + rig(t, has({}), { pen: 4, wy: wy }) + winch(t, 0.5);
    s += act(u, [[0, { x: PX + 600, y: GY, f: -1, p: "stand", mood: "n" }], [1.4, { x: PX + 600, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + pill("بطيء!", PX + 250, GY - 500, u, 1.0, { bg: "#c7321f" });
  });
  // 12 — so the weight itself becomes a piston inside a cylinder, like a standing diesel car engine
  shot(12, [560, pileTop(4) - 300, 1.6], [620, GY - 240, 1.25], function (u, d, t) {
    var k = clamp((u - 0.3) / 1.4), s = scene(t) + leader(t, 1) + pile(t, 4, { helmet: 1 }) + '<g transform="translate(0 ' + f((1 - ease(k)) * -400) + ')" opacity="' + f(k) + '">' + diesel(t, 4, { ry: 200 }) + '</g>';
    s += act(u, [[0, { x: PX + 180, y: GY, f: -1, p: "pointUp", mood: "n" }], [2.2, { x: PX + 180, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("مكبس", PX + 190, pileTop(4) - 400, u, 1.6, { col: "#ffd23a" }) + pill("أسطوانة", PX - 190, pileTop(4) - 520, u, 2.0);
  });
  // 13 — falling, it squeezes the air until it's very hot, and the sprayed diesel lights by itself
  shot(13, [560, pileTop(4) - 200, 2.4], [560, pileTop(4) - 130, 3.0], function (u, d, t) {
    var ry = lerp(260, 0, ease(clamp((u - 0.3) / 2.0))), hot = clamp((u - 1.0) / 1.4), fire = u > 3.2 ? clamp(1 - (u - 3.2) / 0.6) : 0;
    var s = scene(t) + leader(t, 1) + pile(t, 4, { helmet: 1 }) + diesel(t, 4, { ry: ry, fuel: u > 2.6 && u < 3.2 ? 1 : 0, fire: fire });
    s += R(PX - 34, pileTop(4) - 92 - ry * 0, 68, 0, "none") + '<rect x="' + (PX - 34) + '" y="' + f(pileTop(4) - 92 - Math.max(6, ry)) + '" width="68" height="' + f(Math.max(6, ry)) + '" fill="#ff8a3a" opacity="' + f(hot * 0.6) + '"/>';
    s += act(u, [[0, { x: PX + 120, y: GY, f: -1, p: "point", mood: "n" }], [3.2, { x: PX + 130, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("هوا سخن", PX + 160, pileTop(4) - 160, u, 1.2, { bg: "#c7321f", sz: 28 }) + pill("ديزل", PX - 150, pileTop(4) - 90, u, 2.6, { col: "#ffd23a", sz: 28 });
  });
  // 14 — the blast throws the piston up again, it falls again: about 50 blows a minute, no winch
  shot(14, [560, pileTop(5) - 260, 1.5], [640, GY - 280, 1.1], function (u, d, t) {
    var cy = hammerCycle(t, 0.83), pen = lerp(4, 9, clamp(u / d)), s = scene(t) + leader(t, 1) + pile(t, pen, { helmet: 1 }) + diesel(t, pen, cy);
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "shock", mood: "happy" }], [1.2, { x: PX + 240, y: GY, f: -1, p: "cheer", mood: "happy" }]], t);
    return s + pill("٥٠ ضربة في الدقيقة", PX + 260, GY - 700, u, 1.4, { col: "#ffd23a", sz: 36 });
  });
  // 15 — but in very soft clay the pile sinks too easily, the piston doesn't bounce enough, and it stalls
  shot(15, [560, GY + 260, 0.75], [620, GY - 220, 1.25], function (u, d, t) {
    var stall = u > 2.2, cy = stall ? { ry: 0 } : (function () { var c = hammerCycle(t, 0.83); c.ry *= lerp(1, 0.25, clamp(u / 2.2)); c.fire *= 1 - clamp(u / 2.2); return c; })();
    var s = scene(t) + leader(t, 1) + pile(t, 9, { helmet: 1 }) + diesel(t, 9, cy);
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "stand", mood: "n" }], [2.2, { x: PX + 220, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + pill("طين طري أوي", PX + 220, GY + 140, u, 0.4, { bg: "#4e473c", sz: 34 }) + pill("وقفت!", PX - 200, pileTop(9) - 380, u, 2.3, { bg: "#c7321f" });
  });
  // 16 — so the operator drops the piston a few times with no diesel until the ground firms up, then fires it
  shot(16, [560, pileTop(9) - 260, 1.3], [620, GY - 240, 1.2], function (u, d, t) {
    var cold = u < 2.6, cy = hammerCycle(t, cold ? 0.5 : 0.83); if (cold) { cy.fire = 0; cy.ex = 0; cy.fuel = 0; cy.ry *= 0.6; }
    var pen = lerp(9, 10, clamp(u / d)), s = scene(t) + leader(t, 1) + pile(t, pen, { helmet: 1 }) + diesel(t, pen, cy);
    s += act(u, [[0, { x: PX + 200, y: GY, f: -1, p: "reach", mood: "n" }], [2.8, { x: PX + 200, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill(cold ? "من غير ديزل" : "ولّعت!", PX - 210, pileTop(9) - 420, u, 0.6, { col: cold ? "#cfd3d8" : "#ffd23a", sz: 32 });
  });
  // 17 — the odd thing: many think piles are a modern invention
  shot(17, [600, GY - 700, 0.8], [640, GY - 300, 1.05], function (u, d, t) {
    var cy = hammerCycle(t, 0.83), s = scene(t) + leader(t, 1) + pile(t, 12, { helmet: 1 }) + diesel(t, 12, cy);
    s += act(u, [[0, { x: PX + 260, y: GY, f: -1, p: "point", mood: "proud" }]], t);
    return s + pill("اختراع حديث؟", PX + 250, GY - 620, u, 0.6, { sz: 40 });
  });
  // 18 — really all of Venice stands on millions of wooden piles, hand-driven centuries ago
  shot(18, [540, 760, 1.0], [540, 780, 1.08], function (u, d, t) {
    var s = scene(t) + leader(t, 1) + pile(t, 13, { helmet: 1 }) + diesel(t, 13, { ry: 0 }) + venice(t, clamp((u - 0.2) * 2));
    return s + pill("ملايين الخوازيق الخشب", 540, 1090, u, 1.6, { col: "#ffd23a", sz: 34 }) + act(u, [[0, { x: 860, y: 1300, f: -1, p: "shock", mood: "shock" }]], t);
  });
  // 19 — one church there stands on more than a million piles
  shot(19, [540, 800, 1.15], [540, 820, 1.25], function (u, d, t) {
    var s = scene(t) + venice(t, 1);
    return s + pill("+١٬٠٠٠٬٠٠٠ خازوق", 540, 1090, u, 0.6, { bg: "#c7321f", sz: 40 });
  });
  // 20 — from the blows the pile takes over the last few centimetres, the engineer knows how much it will carry
  shot(20, [620, GY - 350, 1.0], [620, GY - 330, 1.15], function (u, d, t) {
    var cy = hammerCycle(t, 0.83), pen = lerp(19, 19.8, clamp(u / d)), s = scene(t) + leader(t, 1) + pile(t, pen, { helmet: 1 }) + diesel(t, pen, cy) + counter(t, clamp((u - 0.4) / 3));
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "point", mood: "n", hat: 1, vest: 1, shirt: "url(#shirt)" }], [3.2, { x: PX + 220, y: GY, f: -1, p: "thumbs", mood: "happy", hat: 1, vest: 1 }]], t);
    return s + pill("المهندس", PX + 220, GY - 230, u, 0.8, { col: "#ffd23a", sz: 28 });
  });
  // 21 — what's left: ear plugs, a helmet, and a tape to keep people away
  shot(21, [560, GY - 300, 0.9], [560, GY - 260, 1.0], function (u, d, t) {
    var cy = hammerCycle(t, 0.83), s = scene(t) + leader(t, 1) + pile(t, 19.8, { helmet: 1 }) + diesel(t, 19.8, cy) + (u > 2.0 ? tape(t) : "");
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "hush", mood: "n" }], [1.0, { x: PX + 220, y: GY, f: -1, p: "thumbs", mood: "happy", hat: 1 }]], t);
    return s + pill("سدادات ودان", PX + 220, GY - 260, u, 0.4, { sz: 28 }) + pill("خوذة", PX + 380, GY - 340, u, 1.0, { sz: 28 }) + pill("شريط", PX, GY - 160, u, 2.1, { sz: 28 });
  });
  // 22 — congratulations, you built a diesel pile hammer yourself
  shot(22, [500, GY - 400, 0.9], [260, GY - 300, 0.62], function (u, d, t) {
    var s = scene(t, {}, { piles: true }) + leader(t, 1) + pile(t, 20, { helmet: 1 }) + diesel(t, 20, { ry: 0 }) + K.confetti(t, PX - 400, PX + 400, GY - 900, GY);
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "cheer", mood: "happy", hat: 1 }]], t);
    return s + pill("مبروك!", 260, GY - 900, u, 0.4, { col: "#9fe8b0", sz: 70 });
  });
  // 23 — outro
  shot(23, [260, GY - 300, 0.62], [280, GY - 280, 0.64], function (u, d, t) {
    var s = scene(t, {}, { piles: true, night: true }) + leader(t, 1) + pile(t, 20, { helmet: 1 }) + diesel(t, 20, { ry: 0 });
    s += act(u, [[0, { x: PX + 220, y: GY, f: -1, p: "wave", mood: "happy", hat: 1 }]], t);
    return s + pill("قولولنا!", 260, GY - 900, u, 0.4, { col: "#ffd23a", sz: 70 });
  });
  window.__pile = { scene: scene, leader: leader, pile: pile, diesel: diesel, pileTop: pileTop, PX: PX, GY: GY };
})();
