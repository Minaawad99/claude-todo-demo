/* «بيت بيستخبى تحت الأرض من الإعصار» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One garden cut open: a two-storey house standing over a deep pit. Line by line the pit gets four telescopic hydraulic
   jacks, a synchronising control cabinet, concrete walls, guide rails, a load-holding valve on every jack, a sliding steel
   lid, and a sump pump; the house goes down into the pit by its own weight and comes back up after the tornado.
   Parts are drawn from real photos (refs/SOURCES.md): excavator cylinders, a FEMA shelter door flush in a slab, a sump
   pump, the 2013 Moore funnel. Scale: the man (s 0.55) ≈ 185 units ≈ 1.75 m, so 1 m ≈ 105 units. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.62; }); return K.act(u, Ks, t); };
  var pill = function (a, b, c, d, e, o) { o = Object.assign({ sz: 46 }, o || {}); return K.pill(a, b, c, d, e, o); }, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY;                                   // 860
  var PW0 = 150, PI0 = 190, PI1 = 890, PW1 = 930;  // pit: outer/inner wall faces
  var PF = GY + 1080, PFB = PF + 50;               // pit floor top / bottom
  var HX0 = 240, HX1 = 840, HC = 540, BH = 590, SL = 40, RISE = 190, DOWN = 860;   // house; DOWN = dy fully lowered
  var CYL = [[290, 1], [790, 1], [380, 0], [700, 0]];   // jack x, front(1)/back(0)
  var OUT = 95, HOLE = 1000;                       // where the man stands outside; the garden hole

  // ── sky: the kit's sky, darkened for the storm ──
  function skyS(t, storm) {
    var s = K.sky(t, false);
    if (storm > 0) { s += '<rect x="-800" y="-900" width="2700" height="' + (GY + 900) + '" fill="url(#storm)" opacity="' + f(0.92 * storm) + '"/>';
      for (var c = 0; c < 7; c++) { var cx = ((c * 330 + t * 60) % 2200) - 600, cy = -180 + hash(c + 90) * 160; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(260 + hash(c) * 120) + '" ry="' + f(90 + hash(c + 3) * 40) + '" fill="#2a2e34" opacity="' + f(0.7 * storm) + '"/>'; } }
    return s;
  }
  function rain(t, k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 70; i++) { var x = ((hash(i) * 2400 + t * 500) % 2400) - 700, y = ((hash(i + 7) * 1000 + t * 1400) % 1000) - 200; s += P("M" + f(x) + " " + f(y) + " l-26 70", "#c8d8e8", 3, ' opacity="' + f(0.55 * k) + '"'); } return s; }
  function wind(t, k, y0, y1) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 16; i++) { var p = (t * 1.6 + hash(i)) % 1, x = lerp(-300, 1400, p), y = lerp(y0, y1, hash(i + 4)); s += P("M" + f(x) + " " + f(y) + " h" + f(120 + hash(i + 2) * 90), "#fff", 5, ' opacity="' + f(0.7 * k * Math.sin(p * Math.PI)) + '"'); } return s; }
  // the funnel: a low wide cone under the cloud (as in the 2013 Moore photo), swirl bands, debris at its foot
  function tornado(x, t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">', top = -500, bw = 70, tw = 560;
    s += F("M" + f(x - tw / 2) + " " + top + " C" + f(x - tw / 2 + 60) + " " + f(GY - 600) + " " + f(x - bw) + " " + f(GY - 260) + " " + f(x - bw / 2) + " " + GY + " L" + f(x + bw / 2) + " " + GY + " C" + f(x + bw) + " " + f(GY - 260) + " " + f(x + tw / 2 - 60) + " " + f(GY - 600) + " " + f(x + tw / 2) + " " + top + " Z", "url(#funnel)", { op: 0.92, sw: 2 });
    for (var b = 0; b < 9; b++) { var yy = top + 120 + b * 150 + ((t * 220) % 150), w = lerp(tw, bw, clamp((yy - top) / (GY - top))) * 0.48; s += P("M" + f(x - w) + " " + f(yy) + " q" + f(w) + " 26 " + f(w * 2) + " -8", "#3e434a", 5, ' opacity=".55"'); }
    for (var d = 0; d < 26; d++) { var a = t * 5 + d * 1.7, r = 90 + hash(d) * 160, dy = GY - 40 - hash(d + 3) * 260; s += R(x + Math.cos(a) * r, dy + Math.sin(a) * 30, 14 + hash(d + 5) * 18, 6, d % 3 ? "#6a4a2a" : "#8a8f96", { sw: 1.5 }); }
    s += '<ellipse cx="' + f(x) + '" cy="' + f(GY - 30) + '" rx="260" ry="70" fill="#8a6a4a" opacity=".45" filter="url(#blur8)"/>';
    return s + '</g>'; }
  function lightning(t, k, x) { if (k <= 0 || (t * 3) % 1 > 0.25) return ""; return P("M" + x + " -300 L" + (x - 50) + " -120 L" + (x + 10) + " -120 L" + (x - 60) + " 120", "#fff6a8", 9) + '<rect x="-800" y="-900" width="2700" height="3000" fill="#fff" opacity=".12"/>'; }

  // ── the house: facade or cut open; o: dy, dx, tilt (deg, about the slab centre), open 0..1, lit 0..1, crack 0..1 ──
  function house(t, o) {
    var dy = o.dy || 0, HB = GY + dy, op = clamp(o.open || 0), lit = clamp(o.lit == null ? 1 : o.lit), s = "";
    s += '<g transform="translate(' + f(o.dx || 0) + ' 0) rotate(' + f(o.tilt || 0) + ' ' + HC + ' ' + f(HB) + ')">';
    // the steel platform under the house
    s += R(HX0 - 10, HB, HX1 - HX0 + 20, SL, "url(#steel)", { sw: 3 });
    for (var i = 0; i < 8; i++) s += P("M" + (HX0 + 20 + i * 80) + " " + (HB + 6) + " l20 28", "#3e454a", 3, ' opacity=".5"');
    if (o.rollers) [HX0 - 8, HX1 + 8].forEach(function (rx) { [HB + 20, HB - 300].forEach(function (ry) { s += R(rx - (rx < HC ? 18 : 0), ry - 12, 18, 24, "#3e454a", { sw: 2 }) + C(rx + (rx < HC ? -22 : 22), ry, 12, "#c4c9cf", { st: INK, sw: 3 }); }); });
    // body
    s += '<g filter="url(#sh)">' + R(HX0, HB - BH, HX1 - HX0, BH, "url(#siding)") + '</g>';
    for (var l = 0; l < 14; l++) s += P("M" + HX0 + " " + (HB - BH + 22 + l * 42) + " H" + HX1, "#bfae8e", 2, ' opacity=".6"');
    s += R(HX0 - 6, HB - 300, HX1 - HX0 + 12, 12, "#b9a37c", { sw: 2 });
    // windows (blue shutters, as in the user's video idea, our own drawing) and the door
    function win(x, y) { var g = lit > 0 ? "#ffe9a0" : "#9cc4de", w = R(x, y, 70, 96, g, { sw: 3 }) + P("M" + (x + 35) + " " + y + " V" + (y + 96) + " M" + x + " " + (y + 48) + " H" + (x + 70), "#fff", 4) + R(x - 26, y, 22, 96, "#3f7fb8", { sw: 2.4 }) + R(x + 74, y, 22, 96, "#3f7fb8", { sw: 2.4 });
      if (lit > 0) w += C(x + 35, y + 48, 70, "url(#bulb)", { op: 0.45 * lit }); return w; }
    [300, 505, 720].forEach(function (x) { s += win(x, HB - 520); });
    [300, 720].forEach(function (x) { s += win(x, HB - 230); });
    s += R(500, HB - 230, 80, 230, "#3f7fb8", { sw: 3 }) + R(512, HB - 216, 56, 90, "#9cc4de", { sw: 2 }) + C(566, HB - 110, 6, "#e2b035") + R(486, HB - 12, 108, 12, "#a89878", { sw: 2 });
    // the cut-open inside (op): two floors, stairs, a sofa, a lamp, a bed, the valve lever by the wall
    if (op > 0) { var g = '<g opacity="' + f(op) + '">';
      g += R(HX0, HB - BH, HX1 - HX0, BH, lit > 0.3 ? "url(#roomLit)" : "url(#room)") + R(HX0, HB - 300, HX1 - HX0, 14, "url(#floorW)", { sw: 2 }) + R(HX0, HB - 14, HX1 - HX0, 14, "url(#floorW)", { sw: 2 });
      g += R(HX0, HB - BH, 22, BH, "url(#wallCut)") + R(HX1 - 22, HB - BH, 22, BH, "url(#wallCut)");
      if (lit < 0.3) g += R(HX0 + 22, HB - BH, HX1 - HX0 - 44, BH, "#0a1020", { sw: 0, op: 0.45 * (1 - lit) });
      for (var st = 0; st < 8; st++) g += R(640 + st * 22, HB - 14 - (st + 1) * 35, 26, 35 * (st + 1) > 280 ? 280 : 35, "url(#wood)", { sw: 1.5 });
      g += F("M640 " + (HB - 14) + " L816 " + (HB - 300) + " L838 " + (HB - 300) + " L662 " + (HB - 14) + " Z", "#8a5a30", { sw: 2, op: 0.6 });
      g += '<g filter="url(#sh)">' + R(290, HB - 74, 150, 60, "url(#sofa)", { rx: 12 }) + R(282, HB - 58, 24, 44, "#36628f", { rx: 6 }) + R(426, HB - 58, 24, 44, "#36628f", { rx: 6 }) + '</g>';
      g += R(300, HB - 370, 170, 56, "#e9e3d6", { rx: 10 }) + R(300, HB - 394, 40, 28, "#fff", { rx: 8 }) + R(290, HB - 330, 190, 16, "#8a5a30", { sw: 2 });
      var lx = 440, ly = HB - 236; g += P("M" + lx + " " + (HB - 286) + " V" + (ly - 12), INK, 3) + F("M" + (lx - 18) + " " + (ly - 12) + " h36 l-6 12 h-24 Z", "#5a5f66", { sw: 2 }) + C(lx, ly + 8, 11, lit > 0.3 ? "#fff6c0" : "#bdbdbd", { st: INK, sw: 2 });
      if (lit > 0.3) g += C(lx, ly + 8, 140 * lit, "url(#bulb)", { op: lit });
      // the lowering valve's lever on the wall by the door (line 14)
      g += R(596, HB - 160, 34, 50, "#2b2e33", { rx: 4, sw: 2 }) + '<g transform="rotate(' + f(o.lever || 0) + ' 613 ' + f(HB - 135) + ')">' + R(609, HB - 182, 8, 48, "#d8352a", { sw: 1.5 }) + C(613, HB - 182, 7, "#d8352a", { st: INK, sw: 1.5 }) + '</g>';
      if (o.emLamp) g += R(260, HB - 280, 40, 22, "#e2b035", { rx: 4, sw: 2 }) + C(280, HB - 258, 90, "url(#bulb)", { op: 0.8 });
      s += g + '</g>'; }
    // cracks when the jacks go out of step
    if (o.crack > 0) { var ck = clamp(o.crack); s += P("M520 " + (HB - BH) + " l-20 70 l30 50 l-26 " + f(90 * ck) + " M760 " + (HB - 300) + " l-30 " + f(60 * ck) + " l24 50", "#3a2a1a", 5, ' opacity="' + f(ck) + '"'); }
    // roof
    s += '<g filter="url(#sh)">' + F("M" + (HX0 - 34) + " " + (HB - BH) + " L" + HC + " " + (HB - BH - RISE) + " L" + (HX1 + 34) + " " + (HB - BH) + " Z", "url(#roofG)") + '</g>';
    for (var r = 1; r < 5; r++) { var yy = HB - BH - RISE + r * RISE / 5, hw = (HX1 - HX0 + 68) / 2 * r / 5; s += P("M" + f(HC - hw) + " " + f(yy) + " H" + f(HC + hw), "#7a2a18", 2.4, ' opacity=".6"'); }
    s += R(660, HB - BH - RISE + 30, 34, 90, "#9a5a3a", { sw: 2.4 });
    return s + '</g>';
  }
  // the corners' slab-bottom heights for a tilt (deg) about the slab centre
  function cornerY(dy, tilt, x) { return GY + dy + SL + Math.tan((tilt || 0) * Math.PI / 180) * (x - HC); }

  // ── the pit ──
  function pit(t, b, o) {
    var s = "", conc = b.conc || o.conc || o.pour >= 1;
    s += R(PW0, GY, PW1 - PW0, PFB - GY, conc ? "url(#concBack)" : "url(#pitBack)", { sw: 3 });
    if (!conc) for (var i = 0; i < 40; i++) s += C(PW0 + 20 + hash(i + 300) * 740, GY + 40 + hash(i + 310) * 1100, 6 + hash(i) * 12, "#3a2414", { op: 0.6 });
    else { for (var j = 0; j < 7; j++) s += P("M" + PW0 + " " + (GY + 150 + j * 150) + " H" + PW1, "#8a867c", 2, ' opacity=".5"'); for (var q = 0; q < 30; q++) s += C(PW0 + 30 + hash(q + 50) * 720, GY + 40 + hash(q + 60) * 1100, 3, "#6a665e", { op: 0.5 }); }
    if (o.pour != null && o.pour < 1) { // concrete walls rising from the floor
      var hk = ease(o.pour), top = lerp(PFB, GY, hk);
      s += R(PW0, top, PI0 - PW0, PFB - top, "url(#conc)") + R(PI1, top, PW1 - PI1, PFB - top, "url(#conc)") + R(PI0, PF, PI1 - PI0, PFB - PF, "url(#conc)", { op: clamp(o.pour * 3) });
      s += R(PW0, top - 8, PI0 - PW0, 16, "#9a958c", { sw: 0, op: 0.8 }) + R(PI1, top - 8, PW1 - PI1, 16, "#9a958c", { sw: 0, op: 0.8 });
    } else if (conc) s += R(PW0, GY, PI0 - PW0, PFB - GY, "url(#conc)") + R(PI1, GY, PW1 - PI1, PFB - GY, "url(#conc)") + R(PI0, PF, PI1 - PI0, PFB - PF, "url(#conc)");
    else s += P("M" + PW0 + " " + GY + " l8 120 l-6 160 l10 200 l-8 260 l6 300 M" + PW1 + " " + GY + " l-8 140 l6 180 l-10 220 l8 300 l-6 200", "#2e1c10", 6) + R(PW0, PF + 10, PW1 - PW0, PFB - PF - 10, "#4a2e1a", { sw: 0 });
    if (b.rails || o.rails) [PI0 + 4, PI1 - 26].forEach(function (x) { s += R(x, GY, 22, PF - GY, "url(#steelV)", { sw: 2.4 }); for (var k = 0; k < 9; k++) s += C(x + 11, GY + 60 + k * 120, 4, "#2e3236"); });
    return s;
  }
  // the soil column under the house while digging (plug 1 = full, 0 = gone), drawn over the pit
  function plug(k) { if (k <= 0) return ""; var top = GY + SL, bot = PF + 10, h = (bot - top), s = "";
    return F("M" + (HX0 + 20) + " " + top + " L" + (HX1 - 20) + " " + top + " L" + (HX1 + 10) + " " + f(top + h * k) + " L" + (HX0 - 10) + " " + f(top + h * k) + " Z", "url(#soil)", { sw: 3 }); }

  // ── the jacks: telescopic hydraulic cylinders (yellow barrel, chrome stages, hose port), as in the excavator photo ──
  function jacks(t, b, o) {
    var s = "", n = o.jk == null ? 1 : clamp(o.jk);
    CYL.forEach(function (c, i) { if (n <= 0) return; var x = c[0], front = c[1], w = front ? 58 : 46, top = cornerY(o.dy || 0, o.tilt, x) + (o.drop && i === o.dropI ? o.drop : 0), bot = PF;
      var rise = lerp(bot - 20, top, ease(n)), len = bot - rise, bar = Math.min(140, len), stg = (len - bar) / 3, g = '<g opacity="' + (front ? 1 : 0.72) + '">';
      for (var k = 2; k >= 0; k--) { var y0 = rise, y1 = bot - bar - stg * (2 - k) + 10, ww = w * (0.55 + k * 0.12); if (k < 2) y0 = bot - bar - stg * (2 - k) - stg; y0 = Math.max(rise, y0); }
      // stages from thin (top) to thick (bottom)
      for (var m = 0; m < 3; m++) { var ww2 = w * (0.52 + m * 0.13), ys = rise + stg * m, ye = bot - bar + 8; g += R(x - ww2 / 2, ys, ww2, Math.max(0, ye - ys), "url(#chrome)", { sw: 2.4 }) + R(x - ww2 / 2 - 3, ys - 4, ww2 + 6, 8, "#5a6066", { sw: 1.5 }); }
      g += R(x - w / 2, bot - bar, w, bar, "url(#barrel)", { sw: 3, rx: 6 }) + R(x - w / 2 - 6, bot - 14, w + 12, 14, "#5a5040", { sw: 2 }) + R(x - w / 2 - 4, bot - bar - 6, w + 8, 12, "#8a6a10", { sw: 2 });
      g += C(x + w / 2 - 6, bot - 40, 7, "#2b2e33", { st: INK, sw: 1.5 });
      if (b.valve || o.valve) g += R(x + w / 2 - 2, bot - bar + 6, 30, 34, "#2f6f9f", { sw: 2.4, rx: 3 }) + C(x + w / 2 + 13, bot - bar + 23, 6, "#c4c9cf", { st: INK, sw: 1.5 });
      if (o.oil && front) { var lv = clamp(o.oil); g += R(x - w / 2 + 8, bot - bar * lv + 4, w - 16, bar * lv - 18, "url(#oil)", { sw: 0, op: 0.85 }); }
      s += g + '</g>'; });
    return s;
  }
  // the control cabinet on the pit floor with its screen; hoses and sensor wires to every jack
  function cabinet(t, b, o) { if (!(b.ctrl || o.ctrl)) return ""; var k = o.ctrlK == null ? 1 : clamp(o.ctrlK), x = 470, w = 140, h = 118, y = PF - h, s = '<g opacity="' + f(k) + '">';
    CYL.forEach(function (c) { var hx = c[0] + (c[0] < x ? 22 : -22), hy = PF - 30; s += P("M" + hx + " " + hy + " Q" + f((hx + x + w / 2) / 2) + " " + (PF - 4) + " " + (x + w / 2) + " " + (PF - 20), "#1a1a1a", 7) + P("M" + hx + " " + (hy - 14) + " Q" + f((hx + x + w / 2) / 2) + " " + (PF - 30) + " " + (x + w / 2) + " " + (PF - 60), "#e2b035", 3, ' stroke-dasharray="8 6"'); });
    s += '<g filter="url(#sh)">' + R(x, y, w, h, "#2f6f9f", { rx: 8 }) + '</g>' + R(x + 12, y + 12, w - 24, 40, o.power === false ? "#1a1e22" : "#0f2a3a", { sw: 2 });
    if (o.power !== false) s += T(o.scr || "0.5 مم", x + w / 2, y + 40, 20, "#7cf2a0");
    s += R(x + 14, y + 64, 50, 44, "url(#barrel)", { sw: 2, rx: 4 }) + C(x + 100, y + 86, 18, "#5a6066", { st: INK, sw: 2 }) + C(x + 100, y + 86, 6, "#c4c9cf");
    return s + '</g>'; }
  // the sliding lid: a steel plate (diamond plate) on rails at ground level; k 0 = parked to the right, 1 = shut
  function lid(t, k, rails) { var s = ""; if (rails) s += R(PW0 - 20, GY - 14, 1400, 14, "url(#steel)", { sw: 2 });
    if (k == null) return s; var x0 = lerp(PW1 + 120, PW0 - 10, ease(k)), w = PW1 - PW0 + 20;
    s += '<g filter="url(#sh)">' + R(x0, GY - 56, w, 50, "url(#steelV)", { sw: 4 }) + '</g>';
    for (var i = 0; i < 20; i++) s += P("M" + f(x0 + 20 + i * 40) + " " + (GY - 44) + " l12 14", "#c4c9cf", 3);
    s += C(x0 + 20, GY - 8, 9, "#3e454a", { st: INK, sw: 2 }) + C(x0 + w - 20, GY - 8, 9, "#3e454a", { st: INK, sw: 2 });
    return s; }
  function vent(b) { if (!b.vent) return ""; return P("M" + (PW1 - 60) + " " + (GY + 120) + " V" + (GY - 120) + " h40", INK, 22) + P("M" + (PW1 - 60) + " " + (GY + 120) + " V" + (GY - 120) + " h40", "#c4c9cf", 15); }
  function ladder(b) { if (!b.ladder) return ""; var x = PW0 + 46, s = P("M" + x + " " + GY + " V" + PF + " M" + (x + 30) + " " + GY + " V" + PF, "#d8a020", 6); for (var y = GY + 40; y < PF; y += 50) s += P("M" + x + " " + y + " h30", "#d8a020", 5); return s; }
  // the sump: a small well in the floor with the pump (black motor box, strainer) and a pipe up the right gap to the surface
  function sump(t, b, o) { if (!(b.sump || o.sump)) return ""; var k = o.sumpK == null ? 1 : clamp(o.sumpK), x = 760, s = '<g opacity="' + f(k) + '">';
    s += R(x, PF - 2, 90, 90, "#3a3a3a", { sw: 3 }) + R(x + 22, PF + 20, 46, 50, "#1e2226", { rx: 5, sw: 2 }) + R(x + 26, PF + 70, 38, 12, "#4a4f56", { sw: 1.5 });
    var d = "M" + (x + 45) + " " + (PF + 20) + " V" + (PF - 40) + " H" + (PI1 - 34) + " V" + (GY - 20) + " H" + (PW1 + 80);
    s += P(d, INK, 14) + P(d, "#5a8fb8", 8);
    if (o.pumpOn) for (var i = 0; i < 8; i++) { var p = (t * 0.6 + i / 8) % 1, py = lerp(PF - 40, GY - 20, p); s += C(PI1 - 34, py, 5, "#9fd6ff"); }
    return s + '</g>'; }
  function water(lv) { if (lv <= 0) return ""; var h = 120 * clamp(lv); return R(PI0, PF - h, PI1 - PI0, h, "url(#water)", { sw: 0 }) + P("M" + PI0 + " " + f(PF - h) + " H" + PI1, "#bfe6ff", 3); }
  function drips(t, k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 10; i++) { var p = (t * 0.9 + hash(i)) % 1, x = i % 2 ? PI0 + 6 : PI1 - 6, y = lerp(GY + 40 + hash(i + 2) * 300, PF, p); s += F("M" + x + " " + f(y) + " q-6 12 0 14 q6 -2 0 -14 Z", "#7fc4f0", { sw: 1.2, op: k }); } return s; }
  // debris falling into the open pit / flying over the lid
  function debris(t, k, mode) { if (k <= 0) return ""; var s = "";
    for (var i = 0; i < 9; i++) { var p = (t * (mode === "fly" ? 0.9 : 0.5) + hash(i + 20)) % 1, x, y, rot = t * 300 + i * 50;
      if (mode === "fly") { x = lerp(-300, 1500, p); y = GY - 80 - hash(i + 30) * 500 + Math.sin(p * 9 + i) * 40; } else { x = 260 + hash(i + 40) * 560; y = lerp(GY - 300, GY + 280, p); }
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')" opacity="' + f(k) + '">' + (i % 3 === 0 ? R(-50, -7, 100, 14, "url(#plank)", { sw: 2 }) : i % 3 === 1 ? P("M-30 0 L0 -20 L26 6 M0 -20 L6 -44", "#5a3a20", 6) : R(-18, -12, 36, 24, "#8a8f96", { sw: 2 })) + '</g>'; }
    return s; }
  function garden(t, o) { var s = K.palm(-150, t, 1.0) + K.bush(980, 0.9) + K.palm(1210, t, 0.9);
    s += R(-200, GY - 70, 300, 10, "#f4f0e6", { sw: 2 }) + R(-200, GY - 40, 300, 10, "#f4f0e6", { sw: 2 }); for (var p = -190; p < 100; p += 50) s += R(p, GY - 84, 10, 84, "#f4f0e6", { sw: 2 });
    return s; }
  function hole(k) { if (k <= 0) return ""; var w = 150, d = 170 * clamp(k); return R(HOLE - w / 2, GY - 2, w, d, "#2e1c10", { sw: 3 }) + F("M" + (HOLE + w / 2) + " " + GY + " q40 -36 90 0 Z", "#7a4c2a", { sw: 2 }); }

  // ── the whole scene; h: per-shot overrides ──
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o), storm = h.storm || 0, s = skyS(t, storm);
    s += garden(t, h) + tornado(h.tx == null ? 0 : h.tx, t, h.tk || 0) + K.ground(t) + hole(h.hole || 0);
    if (b.pit || h.pit) { s += pit(t, b, h) + plug(h.plug == null ? (b.plugGone ? 0 : (b.jacks ? 0 : 1)) : h.plug) + sump(t, b, h) + ladder(b) + water(h.water || 0) + drips(t, h.drips || 0);
      if (b.jacks || h.jk != null) s += jacks(t, b, h); s += cabinet(t, b, h); }
    if (h.houseFly == null || h.houseFly < 1) { var fly = h.houseFly || 0, fx = lerp(0, 1700, ease(fly)), fyy = -900 * ease(fly), fr = 140 * fly;
      s += '<g transform="translate(' + f(fx) + ' ' + f(fyy) + ') rotate(' + f(fr) + ' ' + HC + ' 500)">' + house(t, { dy: h.dy || 0, dx: h.dx || 0, tilt: h.tilt || 0, open: h.open || 0, lit: h.lit, crack: h.crack, lever: h.lever, rollers: b.rails || h.rails, emLamp: b.lamp }) + '</g>'; }
    s += lid(t, h.lid != null ? h.lid : (b.lid ? 0 : null), b.lidRails || b.lid || h.lid != null) + vent(b) + debris(t, h.deb || 0, h.debMode) + wind(t, h.wind || 0, GY - 700, GY - 60) + rain(t, h.rain || 0) + lightning(t, h.bolt || 0, 820);
    return s; }

  // ── the build: a part is on from the line AFTER the one that adds it ──
  K.steps([[3, { pit: 1 }], [5, { jacks: 1 }], [7, { ctrl: 1 }], [9, { conc: 1 }], [11, { rails: 1 }], [13, { valve: 1 }], [17, { lid: 1 }], [22, { sump: 1 }], [23, { vent: 1, lamp: 1, ladder: 1 }]]);
  var WHOLE = [540, 1010, 0.92], TOP = [540, 640, 1.15], OUTM = { x: OUT, y: GY, f: 1 };
  function M(o) { return Object.assign({}, OUTM, o); }
  function PM(o) { return Object.assign({ x: 640, y: PF, f: -1 }, o); }   // the man down in the pit, by the cabinet
  function inside(dy, o) { return Object.assign({ x: 380, y: GY + dy - 14, f: 1 }, o); }

  // 0 — a tornado comes; you dig a hole in the garden and hide in it: a shelter
  shot(0, [800, 620, 1.55], [880, 760, 1.6], function (u, d, t) {
    var s = scene(t, {}, { hole: clamp(u / 2.2), tk: clamp((u - 2.2) / 1.2) * 0.9, tx: -500 });
    var inHole = u > 2.6, y = inHole ? GY + 170 : GY;
    s += act(u, [[0, { x: HOLE - 130, y: GY, f: 1, p: "dig", rate: 1.6 }], [2.4, { x: HOLE - 130, y: GY, f: 1, p: "dig" }], [2.6, { x: HOLE, y: GY + 170, f: -1, p: "cover", mood: "worry", jump: 1 }], [3.6, { x: HOLE, y: GY + 170, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("مخبأ", HOLE, GY - 230, u, 3.0, { col: "#ffd23a" });
  });
  // 1 — but you come out to find where your house was is empty ground
  shot(1, [600, 560, 1.0], [700, 640, 1.2], function (u, d, t) {
    var s = scene(t, {}, { hole: 1, storm: clamp(1 - u / 2.5), tk: clamp(1 - u / 1.8), tx: lerp(-200, 1300, clamp(u / 1.8)), houseFly: clamp((u - 0.2) / 1.4), wind: clamp(1 - u / 1.8) });
    s += act(u, [[0, { x: HOLE, y: GY + 170, f: -1, p: "cover", mood: "worry" }], [1.6, { x: HOLE, y: GY, f: -1, p: "stand", mood: "n", jump: 1 }], [2.2, { x: HOLE - 120, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("فين البيت؟!", 540, 520, u, 2.0, { bg: "#c7321f" }) + xmark(540, 700, u, 2.4, 0.9);
  });
  // 2 — so you dig the pit under the whole house: the house itself goes down to hide
  shot(2, [540, 900, 0.95], WHOLE, function (u, d, t) {
    var k = clamp(u / (d - 0.6)), s = scene(t, { pit: 1 }, { plug: 1 });
    s += R(PW0, GY + 3, PW1 - PW0, (PFB - GY) * (1 - ease(k)), "url(#soil)", { sw: 0 });   // earth still to be dug
    s += act(u, [[0, { x: PW0 - 40, y: GY, f: 1, p: "dig", rate: 1.6 }], [d - 1.2, { x: PW0 - 40, y: GY, f: 1, p: "dig" }], [d - 0.6, { x: OUT, y: GY, f: 1, p: "point", mood: "happy" }]], t);
    return s + pill("حفرة تحت البيت كله", 540, 300, u, 1.0, { col: "#ffd23a", sz: 44 }) + K.arrowV(HC, GY + 200, GY + 700, "#ffd23a", 12, clamp((u - 1.6) / 1));
  });
  // 3 — but the house weighs about 100 tonnes; take the earth from under it and it falls
  shot(3, WHOLE, [520, 900, 1.0], function (u, d, t) {
    var k = clamp((u - 0.9) / 1.3), s = scene(t, {}, { plug: 1 - ease(k), dy: 240 * ease(k), tilt: 4 * ease(k) });
    s += act(u, [[0, M({ p: "point" })], [1.8, M({ p: "shock", mood: "shock" })], [2.6, M({ p: "cover", mood: "shock" })]], t);
    return s + pill("100 طن", HC, 330, u, 0.3, { col: "#ffd23a", sz: 52 }) + pill("هيقع!", HC, 560 + 240 * ease(k), u, 2.0, { bg: "#c7321f" }) + xmark(HC, 1500, u, 2.3);
  });
  // 4 — so under each corner a hydraulic jack that alone holds 25 tonnes
  shot(4, [520, 1700, 1.4], [540, 1640, 1.25], function (u, d, t) {
    var k = clamp((u - 0.4) / 2.0), s = scene(t, {}, { plug: 0, jk: k, dy: 240 * (1 - ease(clamp((u - 1.8) / 1.4))), tilt: 4 * (1 - ease(clamp((u - 1.8) / 1.4))), oil: 0.9 });
    s += act(u, [[0, PM({ p: "push", mood: "n" })], [2.4, PM({ p: "push" })], [3.2, PM({ p: "thumbs", mood: "happy" })]], t);
    return s + ring(290, PF - 80, 90, u, 1.0, t) + pill("مكبس هيدروليك", 290, PF - 210, u, 1.1, { sz: 34 }) + pill("25 طن", 790, PF - 210, u, 2.2, { col: "#ffd23a" });
  });
  // 5 — but if one jack goes down faster than the others by a few cm, the house leans and cracks
  shot(5, [520, 1500, 1.0], [520, 1480, 0.98], function (u, d, t) {
    var k = ease(clamp((u - 0.4) / 1.6)), s = scene(t, {}, { dy: 180 * k, tilt: -5 * k, crack: clamp((u - 1.6) / 0.6) });
    s += act(u, [[0, PM({ p: "stand" })], [1.6, PM({ p: "shock", mood: "shock" })], [2.6, PM({ p: "worry", mood: "worry" })]], t);
    return s + K.arrowV(290, 1400, 1600, "#e8452e", 12, k) + pill("أسرع بكام سنتي", 330, 1260, u, 0.8, { bg: "#c7321f", sz: 32 }) + xmark(HC, 380, u, 2.0);
  });
  // 6 — so one brain wired to all four lowers them together within less than a millimetre: synchronised lifting
  shot(6, [540, 1720, 1.4], [540, 1600, 1.15], function (u, d, t) {
    var lv = ease(clamp((u - 0.4) / 1.2)), dn = ease(clamp((u - 2.6) / 2.2)), s = scene(t, { ctrl: 1 }, { ctrlK: clamp((u - 0.3) / 0.5), dy: lerp(180, 0, lv) + 160 * Math.sin(dn * Math.PI), tilt: -5 * (1 - lv), crack: 1 - lv, scr: (0.5 + 0.3 * Math.sin(t * 3)).toFixed(1) + " مم" });
    s += act(u, [[0, PM({ p: "point", mood: "n" })], [2.0, PM({ p: "point" })], [3.4, PM({ p: "cheer", mood: "happy" })]], t);
    return s + ring(540, PF - 60, 110, u, 0.6, t) + pill("أقل من مللي", 540, PF - 200, u, 1.0, { col: "#ffd23a", sz: 36 }) + pill("الرفع المتزامن", 540, 300, u, d - 2.2, { col: "#9fe8b0" });
  });
  // 7 — but the pit's sides are earth: the first rain caves them in on the house
  shot(7, [540, 1660, 1.25], [540, 1640, 1.3], function (u, d, t) {
    var s = scene(t, {}, { storm: 0.5, rain: 1 }), k = clamp((u - 0.8) / 1.5);
    for (var i = 0; i < 14; i++) { var side = i % 2, p = clamp(k * 1.3 - hash(i) * 0.4), x = side ? PI1 - 30 - p * 80 : PI0 + 30 + p * 80, y = GY + 100 + hash(i + 3) * 500 + p * 600; s += C(x, y, 22 + hash(i + 9) * 16, "#6e4426", { st: INK, sw: 2.4, op: clamp(p * 3) }); }
    s += act(u, [[0, PM({ p: "stand", mood: "n" })], [1.4, PM({ p: "shock", mood: "shock" })], [2.4, PM({ p: "cover", mood: "worry" })]], t);
    return s + pill("هتنهار!", 540, 1300, u, 1.4, { bg: "#c7321f" }) + xmark(PW1 - 20, GY + 400, u, 1.8);
  });
  // 8 — so concrete walls all round the pit, and a floor under it
  shot(8, [540, 1640, 1.3], [540, 1560, 1.15], function (u, d, t) {
    var k = clamp((u - 0.3) / 2.2), s = scene(t, {}, { pour: k });
    s += act(u, [[0, PM({ p: "push", mood: "n" })], [2.4, PM({ p: "push" })], [2.8, PM({ p: "thumbs", mood: "happy" })]], t);
    return s + pill("خرسانة", PW0 + 170, GY + 560, u, 1.2, { col: "#ffd23a" }) + pill("أرضية", 380, PF + 110, u, 2.0) + vmark(PW1 + 40, 1000, u, 2.8, 0.8);
  });
  // 9 — but the wind ahead of the tornado pushes the house as it goes down; it hits the wall
  shot(9, [560, 1400, 0.95], [580, 1450, 0.98], function (u, d, t) {
    var dn = ease(clamp(u / 2.6)), sw = clamp((u - 0.6) / 1.4), hit = u > 2.0 ? 1 : 0;
    var s = scene(t, {}, { storm: 0.4, wind: 1, dy: 380 * dn, dx: 26 * ease(sw) + (hit ? Math.sin(u * 30) * 4 * clamp(2.6 - u) : 0), tilt: 2 * ease(sw) });
    s += act(u, [[0, PM({ p: "stand" })], [1.8, PM({ p: "shock", mood: "shock" })], [2.8, PM({ p: "cover", mood: "worry" })]], t);
    return s + K.arrowH(-100, 400, 200, "#fff", 12, clamp((u - 0.2) / 0.8)) + pill("طاخ!", PI1 - 20, GY + 200, u, 2.0, { bg: "#c7321f" }) + xmark(PI1 + 40, GY + 360, u, 2.2, 0.8);
  });
  // 10 — so steel rails in every corner: the house rides down them like a lift
  shot(10, [760, 1500, 1.3], [540, 1560, 1.1], function (u, d, t) {
    var dn = ease(clamp((u - 1.2) / 2.0)) * (1 - ease(clamp((u - 3.4) / 1.2))), s = scene(t, { rails: u > 0.3 ? 1 : 0 }, { storm: 0.3, wind: 0.6, dy: 380 * dn });
    s += act(u, [[0, PM({ p: "push", mood: "n" })], [1.4, PM({ p: "point" })], [3.0, PM({ p: "thumbs", mood: "happy" })]], t);
    return s + ring(PI1 - 15, GY + 400, 80, u, 0.5, t) + pill("قضبان حديد", PI1 - 15, GY + 240, u, 0.7, { col: "#ffd23a" }) + pill("زي الأسانسير", 540, 300, u, 2.2, { col: "#9fe8b0" });
  });
  // 11 — but if one oil hose bursts, that corner drops in a second
  shot(11, [620, 1640, 1.25], [600, 1620, 1.2], function (u, d, t) {
    var br = u > 0.9, dr = ease(clamp((u - 1.0) / 0.5)), s = scene(t, {}, { dy: 120, tilt: 4 * dr, drop: 0, oil: br ? 1 - dr * 0.8 : 1 });
    if (br) for (var i = 0; i < 12; i++) { var p = (t * 2 + i / 12) % 1; s += C(812 + p * 120 * Math.cos(i), PF - 120 - p * 140 + p * p * 260, 7, "#e8a83a", { st: INK, sw: 1, op: 1 - p }); }
    s += act(u, [[0, PM({ p: "stand" })], [1.2, PM({ p: "shock", mood: "shock" })], [2.4, PM({ p: "cover", mood: "shock" })]], t);
    return s + pill("اتقطع!", 860, PF - 300, u, 1.0, { bg: "#c7321f" }) + xmark(790, PF - 400, u, 1.6, 0.8);
  });
  // 12 — so on each jack a valve that locks the oil in by itself: the load-holding valve
  shot(12, [760, 1740, 1.6], [620, 1680, 1.3], function (u, d, t) {
    var s = scene(t, { valve: u > 0.4 ? 1 : 0 }, { dy: 120, oil: 1 });
    if (u > 2.0 && u < 3.2) for (var i = 0; i < 4; i++) { var p = ((u - 2) * 1.2 + i / 4) % 1; s += C(822 + p * 30, PF - 108 + p * 50, 5, "#e8a83a", { op: 1 - p }); }
    s += act(u, [[0, PM({ f: 1, p: "point", mood: "n" })], [2.4, PM({ f: 1, p: "point" })], [3.0, PM({ f: 1, p: "thumbs", mood: "happy" })]], t);
    return s + ring(820, PF - 117, 60, u, 0.5, t) + pill("صمام حجز الحمل", 760, PF - 260, u, 0.8, { col: "#ffd23a", sz: 34 }) + vmark(700, PF - 400, u, 3.0, 0.7);
  });
  // 13 — but the power is the first thing to go in a storm, and the warning comes only ten minutes before
  shot(13, [520, 640, 1.2], [480, 700, 1.4], function (u, d, t) {
    var off = u > 1.0, s = scene(t, {}, { storm: 1, rain: 1, bolt: u > 0.7 && u < 1.3 ? 1 : 0, open: 1, lit: off ? 0 : 1, power: !off, tk: 0.6, tx: -400 });
    s += act(u, [[0, inside(0, { p: "stand", mood: "n" })], [1.2, inside(0, { p: "shock", mood: "shock" })], [2.6, inside(0, { p: "collar", mood: "worry", phone: 1 })]], t);
    return s + pill("الكهربا قطعت", 540, 160, u, 1.1, { bg: "#c7321f", sz: 36 }) + pill("⚠ 10 دقايق", 380, GY - 300, u, 2.6, { col: "#ffd23a" });
  });
  // 14 — so lowering needs no power: open the valve and the house's own weight takes it down in two minutes
  shot(14, [520, 700, 1.2], [540, 1500, 0.95], function (u, d, t) {
    var lv = clamp((u - 0.6) / 0.6), dn = ease(clamp((u - 1.2) / (d - 1.4))), dy = DOWN * dn;
    var s = scene(t, {}, { storm: 1, rain: 1, dy: dy, open: 1, lit: 0, power: false, lever: -60 * lv, oil: 1 - 0.7 * dn, tk: 0.5, tx: -300 });
    s += act(u, [[0, inside(dy, { x: 560, p: "reach", mood: "n" })], [1.0, inside(dy, { x: 560, p: "push" })], [2.2, inside(dy, { x: 560, p: "thumbs", mood: "happy" })]], t);
    return s + K.arrowV(HC, GY - 500 + dy, GY - 300 + dy, "#ffd23a", 14, clamp(u - 1.2)) + pill("وزن البيت", HC, GY - 560 + dy, u, 1.4, { col: "#ffd23a" }) + pill("دقيقتين", 820, 300 + dy * 0.6, u, 2.4, { col: "#9fe8b0" });
  });
  // 15 — but the pit is open at the top: anything flying falls onto the roof
  shot(15, [540, 1250, 1.0], [540, 1250, 1.05], function (u, d, t) {
    var s = scene(t, {}, { storm: 1, rain: 1, dy: DOWN, open: 1, lit: 0, deb: clamp((u - 0.5) / 0.6), tk: 0.8, tx: lerp(-300, 0, u / d) });
    s += act(u, [[0, inside(DOWN, { p: "stand", mood: "n" })], [1.4, inside(DOWN, { p: "pointUp", mood: "worry" })], [2.4, inside(DOWN, { p: "cover", mood: "shock" })]], t);
    return s + pill("مفتوحة!", 540, GY - 120, u, 1.0, { bg: "#c7321f" }) + xmark(820, GY + 120, u, 1.8, 0.8);
  });
  // 16 — so a heavy steel lid that slides on rails and shuts the pit
  shot(16, [700, 1100, 1.2], [540, 1250, 1.0], function (u, d, t) {
    var k = clamp((u - 0.6) / 2.0), s = scene(t, {}, { storm: 1, rain: 1, dy: DOWN, open: 1, lit: 0, lid: k, deb: 1 - k, tk: 0.6, tx: 40 });
    s += act(u, [[0, inside(DOWN, { p: "pointUp", mood: "worry" })], [2.6, inside(DOWN, { p: "pointUp" })], [3.0, inside(DOWN, { p: "thumbs", mood: "happy" })]], t);
    return s + ring(lerp(PW1 + 500, 540, ease(k)), GY - 28, 100, u, 0.6, t) + pill("غطا حديد", lerp(PW1 + 500, 540, ease(k)), GY - 160, u, 0.8, { col: "#ffd23a" });
  });
  // 17 — oddly, many think a tornado bursts houses with the pressure drop, so they open the windows
  shot(17, [420, 1550, 1.6], [400, 1560, 1.7], function (u, d, t) {
    var s = scene(t, {}, { storm: 1, dy: DOWN, open: 1, lit: 0 });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "shrug", mood: "n" })], [1.6, inside(DOWN, { x: 360, p: "reach" })], [3.6, inside(DOWN, { x: 360, p: "worry", mood: "worry" })]], t);
    return s + pill("أفتح الشبابيك؟", 420, GY + DOWN - 420, u, 1.6, { sz: 34 }) + pill("فرق الضغط", 560, GY + DOWN - 620, u, 0.6, { col: "#ffd23a", sz: 32 });
  });
  // 18 — the truth: what breaks is the wind, which can top 300 km/h, and the things it throws
  shot(18, [540, 1000, 0.92], [540, 1050, 0.92], function (u, d, t) {
    var s = scene(t, {}, { storm: 1, rain: 1, dy: DOWN, open: 1, lit: 0, tk: 1, tx: lerp(200, 700, u / d), wind: 1, deb: 1, debMode: "fly" });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "worry", mood: "worry" })], [2.0, inside(DOWN, { x: 360, p: "shock", mood: "shock" })]], t);
    return s + pill("+300 كم/س", 540, 120, u, 1.4, { bg: "#c7321f", sz: 50 }) + pill("خرافة", 400, GY - 220, u, 0.4, { col: "#ffd23a" }) + xmark(560, GY - 220, u, 0.8, 0.7);
  });
  // 19 — so the lid is built to take a board flying at 160 km/h
  shot(19, [540, 1150, 0.95], [540, 1180, 1.0], function (u, d, t) {
    var hit = 1.4, p = clamp(u / hit), bx = lerp(-200, 520, p), by = lerp(GY - 400, GY - 80, p), s = scene(t, {}, { storm: 1, rain: 1, dy: DOWN, open: 1, lit: 0, wind: 0.8, tk: 0.5, tx: 1000 });
    if (u > hit) { var q = u - hit; bx = 520 + q * 300; by = GY - 80 - q * 420 + q * q * 300; }
    s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(u > hit ? (u - hit) * 400 : 34) + ')">' + R(-90, -12, 180, 24, "url(#plank)", { sw: 3 }) + '</g>';
    if (u > hit && u < hit + 0.3) s += C(520, GY - 56, 70, "#fff", { op: 0.6 });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "cover", mood: "worry" })], [hit + 0.4, inside(DOWN, { x: 360, p: "cheer", mood: "happy" })]], t);
    return s + pill("160 كم/س", 300, GY - 480, u, 0.3, { col: "#ffd23a" }) + vmark(700, GY - 200, u, hit + 0.4, 0.9) + pill("ما اتخرمش", 700, GY - 320, u, hit + 0.8, { col: "#9fe8b0", sz: 34 });
  });
  // 20 — but rain water seeps in and collects at the bottom of the pit
  shot(20, [540, 1550, 1.15], [540, 1600, 1.2], function (u, d, t) {
    var s = scene(t, {}, { storm: 1, dy: DOWN, open: 1, lit: 0, drips: 1, water: clamp(u / d) * 0.9 });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "stand" })], [1.2, inside(DOWN, { x: 360, p: "worry", mood: "worry" })]], t);
    return s + pill("مية!", 540, PF - 260, u, 1.0, { bg: "#c7321f" });
  });
  // 21 — so a battery pump in the bottom pulls the water out: the sump pump
  shot(21, [780, 1750, 1.5], [580, 1550, 1.05], function (u, d, t) {
    var s = scene(t, { sump: 1 }, { storm: 1, dy: DOWN, open: 1, lit: 0, sumpK: clamp((u - 0.3) / 0.5), pumpOn: u > 1.4, water: 0.9 * (1 - ease(clamp((u - 1.6) / 2.4))) });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "worry", mood: "worry" })], [2.6, inside(DOWN, { x: 360, p: "thumbs", mood: "happy" })]], t);
    return s + ring(805, PF + 45, 80, u, 0.6, t) + pill("طلمبة الرشح", 805, PF - 120, u, 1.0, { col: "#ffd23a", sz: 36 });
  });
  // 22 — what's left: a vent pipe, an emergency lamp, and a ladder if you need to get out
  shot(22, [560, 1200, 0.95], [540, 1300, 0.92], function (u, d, t) {
    var s = scene(t, { vent: u > 0.4 ? 1 : 0, lamp: u > 1.4 ? 1 : 0, ladder: u > 2.4 ? 1 : 0 }, { storm: 0.8, dy: DOWN, open: 1, lit: 0 });
    s += act(u, [[0, inside(DOWN, { x: 360, p: "point", mood: "n" })], [2.6, inside(DOWN, { x: 360, p: "thumbs", mood: "happy" })]], t);
    return s + pill("تهوية", PW1 - 40, GY - 180, u, 0.5, { sz: 34 }) + pill("لمبة", 280, GY + DOWN - 330, u, 1.5, { sz: 34 }) + pill("سلم", PW0 + 60, 1300, u, 2.5, { sz: 34 });
  });
  // 23 — congratulations: you built a house that hides underground, yourself
  shot(23, [540, 1300, 0.92], [540, 760, 0.98], function (u, d, t) {
    var lk = 1 - clamp(u / 0.8), up = ease(clamp((u - 0.7) / 1.8)), dy = DOWN * (1 - up);
    var s = scene(t, {}, { storm: clamp(0.6 - u * 0.4), lid: lk, dy: dy, open: 1, lit: 1 }) + (u > 2.4 ? K.confetti(t, 200, 880, 0, GY) : "");
    s += act(u, [[0, inside(dy, { x: 360, p: "stand", mood: "n" })], [2.4, inside(dy, { x: 360, p: "cheer", mood: "happy" })]], t);
    return s + pill("مبروك!", 540, 120, u, 2.4, { col: "#9fe8b0", sz: 56 });
  });
  // 24 — outro
  shot(24, [540, 760, 1.0], [540, 900, 0.95], function (u, d, t) {
    var s = scene(t, {}, { open: 1, lit: 1 });
    s += act(u, [[0, inside(0, { x: 360, p: "wave", mood: "happy" })]], t);
    return s + pill("قولولنا!", 540, 120, u, 0.4, { col: "#ffd23a", sz: 56 });
  });
  window.__tornado = { scene: scene, DOWN: DOWN };
})();
