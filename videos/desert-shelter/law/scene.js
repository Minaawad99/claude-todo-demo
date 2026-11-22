/* «ملجأ نجاة في الصحرا» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One desert scene cut open: a broken-down car on the left, and next to it the belowground shelter of the US Army survival
   manual (FM 3-05.70 ch. 5): a trench half a metre deep, the sand mounded on three sides, a door at the open end, one
   sheet over it and a second sheet 30 cm above it. It grows line by line while the man acts out and reacts to every line.
   World units are the 1080×1920 frame at zoom 1; the man is s 0.8 ≈ 154 units a metre. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var DESERT = { base: "desert" };
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.8; if (k[1].outfit == null) k[1].outfit = DESERT; }); return K.act(u, Ks, t); };
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var GY = K.GY, TX0 = 600, TX1 = 920, DEP = 95, TF = GY + DEP, MH = 60, TARP = GY - MH, GAP = 46, TARP2 = TARP - GAP;
  var CX0 = -170, CX1 = 450;
  // poses this episode needs beyond the kit's: sitting on the trench floor with the legs out, lying flat (rot −90)
  var SITF = { lean: 10, head: 6, aN: [30, 84], aF: [24, 76], lN: [84, 70], lF: [80, 64] };
  var LIE = { lean: 0, head: -4, aN: [8, 40], aF: [4, 30], lN: [2, 0], lF: [-2, -4] };

  // ── the car: a small sedan in profile, facing right, its bonnet propped open ──
  function car(t, o) { o = o || {};
    var s = '<g filter="url(#sh)">', y0 = GY - 40;
    s += F("M" + CX0 + " " + y0 + " L" + CX0 + " " + (y0 - 80) + " Q" + (CX0 + 10) + " " + (y0 - 112) + " " + (CX0 + 70) + " " + (y0 - 118) + " L" + (CX0 + 150) + " " + (y0 - 122) + " L" + (CX0 + 230) + " " + (y0 - 196) + " Q" + (CX0 + 250) + " " + (y0 - 206) + " " + (CX0 + 290) + " " + (y0 - 206) + " L" + (CX0 + 420) + " " + (y0 - 206) + " Q" + (CX0 + 450) + " " + (y0 - 204) + " " + (CX0 + 470) + " " + (y0 - 186) + " L" + (CX0 + 530) + " " + (y0 - 124) + " L" + (CX1 - 20) + " " + (y0 - 112) + " Q" + CX1 + " " + (y0 - 104) + " " + CX1 + " " + (y0 - 70) + " L" + CX1 + " " + y0 + " Z", "url(#carB)", { sw: 4 });
    s += '</g>';
    // windows (someone inside shows through them: o.inner), door lines, handles, lights, bumper
    var W1 = "M" + (CX0 + 168) + " " + (y0 - 124) + " L" + (CX0 + 238) + " " + (y0 - 188) + " L" + (CX0 + 320) + " " + (y0 - 188) + " L" + (CX0 + 320) + " " + (y0 - 124) + " Z",
        W2 = "M" + (CX0 + 336) + " " + (y0 - 124) + " L" + (CX0 + 336) + " " + (y0 - 188) + " L" + (CX0 + 420) + " " + (y0 - 188) + " Q" + (CX0 + 444) + " " + (y0 - 186) + " " + (CX0 + 456) + " " + (y0 - 172) + " L" + (CX0 + 500) + " " + (y0 - 124) + " Z";
    if (o.inner) s += F(W1 + " " + W2, "#3a2a20", { sw: 0 }) + '<clipPath id="cw"><path d="' + W1 + " " + W2 + '"/></clipPath><g clip-path="url(#cw)">' + o.inner + '</g>';
    s += F(W1, "url(#glass)", { sw: 3, op: o.inner ? 0.4 : null }) + F(W2, "url(#glass)", { sw: 3, op: o.inner ? 0.4 : null });
    s += P("M" + (CX0 + 180) + " " + (y0 - 176) + " L" + (CX0 + 206) + " " + (y0 - 150), "#fff", 5, ' opacity=".5"') + P("M" + (CX0 + 352) + " " + (y0 - 178) + " L" + (CX0 + 380) + " " + (y0 - 150), "#fff", 5, ' opacity=".5"');
    s += P("M" + (CX0 + 328) + " " + (y0 - 190) + " V" + (y0 - 10) + " M" + (CX0 + 160) + " " + (y0 - 120) + " V" + (y0 - 10) + " M" + (CX0 + 510) + " " + (y0 - 118) + " V" + (y0 - 30), INK, 2.4, ' opacity=".6"');
    s += R(CX0 + 280, y0 - 104, 30, 8, "#7a828c", { rx: 4, sw: 1.5 }) + R(CX0 + 450, y0 - 104, 30, 8, "#7a828c", { rx: 4, sw: 1.5 });
    s += R(CX1 - 16, y0 - 96, 18, 20, "#ffe9a0", { rx: 4, sw: 2 }) + R(CX0 - 4, y0 - 92, 14, 22, "#d8352a", { rx: 3, sw: 2 });
    s += R(CX0 - 8, y0 - 26, CX1 - CX0 + 16, 22, "#5a6068", { rx: 8, sw: 3 });
    // the open bonnet, a little steam
    if (o.hood) { s += F("M" + (CX0 + 530) + " " + (y0 - 124) + " L" + (CX0 + 548) + " " + (y0 - 236) + " L" + (CX0 + 566) + " " + (y0 - 232) + " L" + (CX1 - 20) + " " + (y0 - 112) + " Z", "url(#carB)", { sw: 3 });
      for (var k = 0; k < 3; k++) { var p = (t * 0.6 + k / 3) % 1; s += C(CX0 + 580 + k * 20 + p * 30, y0 - 140 - p * 160, 18 + p * 30, "#eef0f2", { op: (1 - p) * (o.steam == null ? 0.8 : o.steam) }); } }
    [CX0 + 110, CX1 - 120].forEach(function (wx) { s += C(wx, GY - 46, 50, "#26292e", { st: INK, sw: 4 }) + C(wx, GY - 46, 26, "#a8b0b8", { st: INK, sw: 3 }) + P("M" + (wx - 18) + " " + (GY - 46) + " h36 M" + wx + " " + (GY - 64) + " v36", "#6a727c", 3); });
    // heat coming off the hot car
    if (o.hot) for (var h = 0; h < 5; h++) { var q = (t * 0.9 + h / 5) % 1; s += P("M" + (CX0 + 200 + h * 60) + " " + f(y0 - 214 - q * 90) + " q12 -14 0 -28 q-12 -14 0 -28", "#ff7a3a", 5, ' opacity="' + f((1 - q) * o.hot) + '"'); }
    if (o.oven) s += F("M" + (CX0 + 168) + " " + (y0 - 124) + " L" + (CX0 + 238) + " " + (y0 - 188) + " L" + (CX0 + 320) + " " + (y0 - 188) + " L" + (CX0 + 320) + " " + (y0 - 124) + " Z", "#ff5a2a", { sw: 0, op: 0.45 * o.oven }) + F("M" + (CX0 + 336) + " " + (y0 - 124) + " L" + (CX0 + 336) + " " + (y0 - 188) + " L" + (CX0 + 420) + " " + (y0 - 188) + " L" + (CX0 + 500) + " " + (y0 - 124) + " Z", "#ff5a2a", { sw: 0, op: 0.45 * o.oven });
    return s; }
  // things lying by the car: the shovel and the folded sheet (before they are used), a water can, the bag
  function kit0(t, b, o) { var s = "";
    if (!o.noShovel && !b.trench) s += '<g transform="translate(500 ' + (GY - 4) + ') rotate(-8)">' + P("M0 0 L170 0", "#8a5a30", 10) + F("M170 -18 L206 -14 Q216 0 206 14 L170 18 Z", "#9aa2ac") + '</g>';
    if (!b.tarp && !o.noTarp) s += '<g filter="url(#sh)">' + R(480, GY - 40, 80, 36, "url(#tarp)", { rx: 6 }) + R(486, GY - 70, 70, 30, "url(#tarp2)", { rx: 6 }) + '</g>';
    if (!o.bagDoor) s += '<g filter="url(#sh)">' + R(CX0 + 40, GY - 66, 56, 62, "#7a4a2a", { rx: 12 }) + R(CX0 + 50, GY - 48, 36, 20, "#5a3420", { rx: 6, sw: 2 }) + '</g>';
    s += '<g filter="url(#sh)">' + R(CX0 + 104, GY - 80, 40, 76, "#d8e6ee", { rx: 8 }) + R(CX0 + 114, GY - 94, 20, 16, "#2f6f9f", { rx: 3, sw: 2 }) + R(CX0 + 106, GY - 50, 36, 38, "#7ab8e0", { sw: 0, op: 0.6 }) + '</g>';
    return s; }
  // ── the shelter: dig 0…1 (the trench), mound 0…1 (the sand on three sides), the two sheets, the bag in the door ──
  function shelter(t, b, o) { var s = "", dk = clamp(o.dig != null ? o.dig : (b.trench ? 1 : 0)), mk = clamp(o.mound != null ? o.mound : (b.mound ? 1 : 0)), dep = DEP * dk;
    // the mound behind the trench (the far side, seen over it), then the head-end mound; the door end stays open
    if (mk > 0) { var mh = MH * ease(mk);
      s += F("M" + (TX0 - 110) + " " + GY + " Q" + (TX0 - 90) + " " + f(GY - mh * 1.1) + " " + (TX0 - 20) + " " + f(GY - mh) + " L" + (TX1 + 10) + " " + f(GY - mh * 0.9) + " Q" + (TX1 + 50) + " " + f(GY - mh * 0.8) + " " + (TX1 + 70) + " " + GY + " Z", "url(#mound)", { sw: 2.4, op: 0.85 });
      s += F("M" + (TX0 - 100) + " " + GY + " Q" + (TX0 - 70) + " " + f(GY - mh * 1.05) + " " + (TX0 - 4) + " " + f(GY - mh) + " L" + TX0 + " " + GY + " Z", "url(#mound)", { sw: 3 }); }
    if (dk > 0) {   // the trench cut open: back wall, floor, the ramp up to the door
      s += F("M" + TX0 + " " + (GY + 6) + " L" + TX0 + " " + f(GY + dep) + " L" + TX1 + " " + f(GY + dep) + " Q" + (TX1 + 50) + " " + f(GY + dep * 0.6) + " " + (TX1 + 96 * dk) + " " + (GY + 6) + " Z", "url(#sandIn)", { sw: 3 });
      s += P("M" + (TX0 + 20) + " " + f(GY + dep * 0.4) + " h" + f((TX1 - TX0 - 40)) + " M" + (TX0 + 40) + " " + f(GY + dep * 0.75) + " h" + f(TX1 - TX0 - 80), "#9a6a36", 2, ' opacity=".35"');
      if (o.digging) for (var g = 0; g < 4; g++) { var p = (t * 1.4 + g / 4) % 1; s += C(lerp(TX1 - 60, TX1 + 160, p), GY - 70 * Math.sin(p * Math.PI) - 10, 9 - g, "#d4a564", { st: INK, sw: 1.4, op: 1 - p * 0.6 }); } }
    if (o.compass) { var ck = clamp(o.compass); s += '<g opacity="' + f(ck) + '">' + K.arrowH(TX0 + 30, GY + dep + 40, TX1 - 30, "#ffd23a", 9, ck) + T("ش", TX0 + 12, GY + dep + 54, 40, "#fff", { stroke: INK }) + T("ج", TX1 - 8, GY + dep + 54, 40, "#fff", { stroke: INK }) + '</g>'; }
    return s; }
  // the sheets go over the man (drawn after him): the first lies on the mounds held by stones, the second on four sticks
  function roof(t, b, o) { var s = "", k1 = clamp(o.tarp != null ? o.tarp : (b.tarp ? 1 : 0)), k2 = clamp(o.tarp2 != null ? o.tarp2 : (b.tarp2 ? 1 : 0));
    if (k1 > 0) { var x1 = lerp(TX0 - 70, TX1 + 30, ease(k1)), hot = clamp(o.hot || 0);
      s += '<g filter="url(#sh)">' + F("M" + (TX0 - 80) + " " + (TARP + 4) + " Q" + f((TX0 + x1) / 2) + " " + (TARP + 18) + " " + f(x1) + " " + TARP + " L" + f(x1) + " " + (TARP - 12) + " Q" + f((TX0 + x1) / 2) + " " + (TARP + 4) + " " + (TX0 - 80) + " " + (TARP - 8) + " Z", "url(#tarp)", { sw: 3 }) + '</g>';
      if (hot) s += F("M" + (TX0 - 80) + " " + (TARP + 4) + " Q" + f((TX0 + x1) / 2) + " " + (TARP + 18) + " " + f(x1) + " " + TARP + " L" + f(x1) + " " + (TARP - 12) + " Q" + f((TX0 + x1) / 2) + " " + (TARP + 4) + " " + (TX0 - 80) + " " + (TARP - 8) + " Z", "#ff4a1a", { sw: 0, op: 0.6 * hot }) + (function () { var w = ""; for (var h = 0; h < 5; h++) { var q = (t * 1.1 + h / 5) % 1; w += P("M" + (TX0 + 10 + h * 64) + " " + f(TARP + 24 + q * 70) + " q10 12 0 24 q-10 12 0 24", "#ff6a2a", 5, ' opacity="' + f((1 - q) * hot) + '"'); } return w; })();
      if (k1 > 0.95) [TX0 - 76, TX0 - 40, TX1 + 4].forEach(function (sx, i) { s += '<ellipse cx="' + sx + '" cy="' + (TARP - 14) + '" rx="' + (20 + i * 3) + '" ry="14" fill="#a8927a" stroke="' + INK + '" stroke-width="3"/>'; }); }
    if (k2 > 0) { var y2 = lerp(TARP2 - 260, TARP2, ease(k2));
      [TX0 - 50, TX1 + 20].forEach(function (sx) { s += P("M" + sx + " " + (GY - 4) + " V" + f(Math.max(y2, TARP2) - 6), "#8a5a30", 8); });
      s += '<g filter="url(#sh)">' + F("M" + (TX0 - 70) + " " + f(y2 + 4) + " Q" + ((TX0 + TX1) / 2) + " " + f(y2 + 14) + " " + (TX1 + 40) + " " + f(y2 + 2) + " L" + (TX1 + 40) + " " + f(y2 - 10) + " Q" + ((TX0 + TX1) / 2) + " " + f(y2 + 2) + " " + (TX0 - 70) + " " + f(y2 - 8) + " Z", "url(#tarp2)", { sw: 3 }) + '</g>';
      if (o.air && k2 > 0.95) for (var a = 0; a < 5; a++) { var p = (t * 0.45 + a / 5) % 1; s += K.arrowH(lerp(TX0 - 90, TX1 - 20, p), TARP - 30 + (a % 2) * 8, lerp(TX0 - 40, TX1 + 30, p), "#bfe6ff", 5, 1); } }
    if (b.bag || o.bag != null) { var bk = clamp(o.bag != null ? o.bag : 1), bx = lerp(TX1 + 160, TX1 + 26, ease(bk));
      s += '<g filter="url(#sh)">' + R(bx, GY - 78, 64, 96, "#7a4a2a", { rx: 14 }) + R(bx + 12, GY - 52, 40, 24, "#5a3420", { rx: 6, sw: 2 }) + '</g>'; }
    return s; }
  // overlays this episode needs: a thermometer with a value, sweat, a plane, a rescue helicopter, the SOS inset
  function thermo(x, y, v, k, txt, col) { if (k <= 0) return ""; var h = 150 * clamp(v); return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x - 15, y - 170, 30, 180, "#fff", { rx: 15, sw: 4 }) + R(x - 7, y - h, 14, h, col || "#e8452e", { sw: 0 }) + C(x, y + 14, 23, col || "#e8452e", { st: INK, sw: 4 }) + (txt ? T(txt, x, y - 196, 44, col || "#e8452e", { stroke: "#fff" }) : "") + '</g>'; }
  function drops(x, y, t, n, sp) { var s = ""; for (var i = 0; i < (n || 1); i++) { var p = (t * (sp || 1.3) + i / (n || 1)) % 1; s += F("M" + f(x + i * 22) + " " + f(y + p * 50) + " q-8 13 0 17 q8 -4 0 -17 Z", "#9fd6ff", { sw: 1.8, op: 1 - p }); } return s; }
  function plane(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')" filter="url(#sh)">' + F("M-90 0 Q-80 -14 -40 -14 L70 -12 Q96 -8 100 0 Q96 8 70 10 L-40 12 Q-80 12 -90 0 Z", "#f2f4f6", { sw: 3 }) + F("M0 -10 L-30 -70 L-12 -70 L30 -10 Z M0 10 L-24 52 L-8 52 L28 10 Z M-76 -6 L-96 -40 L-84 -40 L-62 -8 Z", "#c9d0d8", { sw: 2.4 }) + R(40, -8, 30, 8, "#6a9ac0", { sw: 1.6 }) + '</g>'; }
  function heli(x, y, t, s) { var r = Math.sin(t * 40) * 120; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')" filter="url(#sh)">' + P("M-40 0 L-150 -10", "#d8352a", 14) + F("M-150 -30 L-170 -30 L-160 10 Z", "#d8352a", { sw: 2.4 }) + F("M-50 -40 Q20 -60 70 -20 Q80 20 30 30 L-40 30 Q-60 0 -50 -40 Z", "#d8352a", { sw: 3 }) + F("M10 -36 Q54 -30 64 -8 L14 -6 Z", "url(#glass)", { sw: 2 }) + P("M-30 46 H60 M-14 30 V46 M40 30 V46", INK, 4) + P("M0 -46 V-56", INK, 6) + P("M" + f(-r) + " -60 L" + f(r) + " -60", "#4a4f56", 6) + '</g>'; }
  function sosInset(cx, cy, k, n, t) { if (k <= 0) return ""; var r = 210, s = '<g transform="translate(' + cx + ' ' + cy + ') scale(' + f(K.pop(k)) + ')" filter="url(#sh)">' + C(0, 0, r, "#e8c68a", { st: "#fff", sw: 10 });
    for (var i = 0; i < 30; i++) s += C(-r + hash(i + 300) * 2 * r * 0.9, -r + hash(i + 400) * 2 * r * 0.9, 4 + hash(i) * 6, "#c9a066", { op: Math.hypot(-r + hash(i + 300) * 2 * r * 0.9, -r + hash(i + 400) * 2 * r * 0.9) < r - 14 ? 0.7 : 0 });
    var S = [[30, -40], [0, -48], [-30, -40], [-30, -10], [0, 0], [30, 10], [30, 40], [0, 48], [-30, 40]], O = []; for (var a = 0; a < 10; a++) O.push([34 * Math.cos(a * Math.PI / 5), 46 * Math.sin(a * Math.PI / 5)]);
    var pts = S.map(function (q) { return [q[0] + 110, q[1]]; }).concat(O).concat(S.map(function (q) { return [q[0] - 110, q[1]]; })), m = Math.floor(clamp(n) * pts.length);
    for (var j = 0; j < m; j++) s += '<ellipse cx="' + f(pts[j][0]) + '" cy="' + f(pts[j][1]) + '" rx="15" ry="12" fill="#8a7a6a" stroke="' + INK + '" stroke-width="2.6"/>';
    return s + T("من فوق", 0, r - 30, 30, "#5a3a1a") + '</g>'; }

  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o);
    var s = K.desertSky(t, { night: h.night, sun: h.sun || [880, 120], warm: h.warm }) + K.sand(t, { night: h.night });
    if (h.temp) s += '<rect x="-800" y="' + (GY + 4) + '" width="2700" height="1600" fill="url(#tempG)" opacity="' + f(clamp(h.temp)) + '"/>';
    if (h.warmGround) s += '<rect x="-800" y="' + (GY + 4) + '" width="2700" height="600" fill="url(#warmG)" opacity="' + f(clamp(h.warmGround)) + '"/>';
    if (h.plane != null) s += plane(lerp(1500, -700, h.plane), 260, 0.9);
    s += car(t, { hood: true, steam: h.steam, hot: h.hot, oven: h.oven, inner: h.inner });
    s += kit0(t, b, h) + shelter(t, b, h);
    return s; }
  function over(t, o, h) { return roof(t, has(o), h || {}); }


  // ── the same shelter seen from above at an angle (the user's note: from the side only one heap of sand shows; from up
  // here the trench, the sand heaped on its three sides and the open door on the fourth all read at once). 220 units a
  // metre: x along the trench (head end 0, door end L), z across it (front 0, back W), y up. ──
  var M = 220, L = 484, W = 176, D = 110, RAMP = 130, HM = 100, H2 = HM + 66, OX = 300, OY = 1300;
  function Q(x, z, y) { return [OX + x + 0.3 * z, OY - 0.75 * z - 0.65 * (y || 0)]; }
  function poly(pts, fill, o) { return F("M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z", fill, o); }
  function isoGround(t, night) {
    var s = '<g transform="translate(0 -690)">' + K.desertSky(t, { night: night, sun: [930, 520], warm: night ? 0 : 0.6, noShimmer: 1 }) + '</g>';
    s += R(-800, 455, 2700, 2600, night ? "#7a6a5a" : "url(#sandG)", { sw: 0 });
    for (var k = 0; k < 22; k++) { var y = 470 + Math.pow(k / 22, 1.6) * 1500, d = "M-800 " + f(y); for (var x = -800; x < 1900; x += 160) d += " q80 " + f(-6 + hash(k * 13 + x) * 12) + " 160 0"; s += P(d, night ? "#4a4038" : "#b8864a", 1.5 + k * 0.12, ' opacity=".3"'); }
    for (var q = 0; q < 30; q++) { var px = -600 + hash(q + 70) * 2200, py = 520 + hash(q + 90) * 1400, r = (5 + hash(q) * 12) * (0.5 + (py - 470) / 1400); s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(r * 1.4) + '" ry="' + f(r * 0.8) + '" fill="#b9a088" stroke="#6a5440" stroke-width="2" opacity=".75"/>'; }
    for (var g = 0; g < 22; g++) { var ph = (t * 0.3 + hash(g + 500)) % 1, gx = lerp(-200, 1500, ph), gy = 700 + hash(g + 600) * 1100; s += P("M" + f(gx) + " " + f(gy) + " q40 -10 90 -4 q40 6 80 -2", night ? "#c9c2b0" : "#fff3d6", 5, ' opacity="' + f(0.8 * Math.sin(ph * Math.PI)) + '"'); }   // sand blown along the ground
    if (night) s += R(-800, 455, 2700, 2600, "#0a1430", { sw: 0, op: 0.45 });
    return s; }
  function ridge(pts) {   // pts(i/n) -> [front base, crest, back base]; back slope lit, front slope in shade
    var fb = [], cr = [], bb = [], n = 16; for (var i = 0; i <= n; i++) { var r = pts(i / n); fb.push(r[0]); cr.push(r[1]); bb.push(r[2]); }
    function d(a) { return a.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"); }
    var s = F("M" + d(bb) + " L" + d(cr.slice().reverse()) + " Z", "#f6dca6", { sw: 3 }) + F("M" + d(fb) + " L" + d(cr.slice().reverse()) + " Z", "url(#mound)", { sw: 3 });
    for (var k = 0; k < 10; k++) { var q = fb[1 + Math.floor(hash(k + 3) * (n - 2))], c = cr[1 + Math.floor(hash(k + 3) * (n - 2))], m = hash(k + 9) * 0.7 + 0.15; s += C(lerp(q[0], c[0], m), lerp(q[1], c[1], m), 3 + hash(k) * 3, "#b8864a", { op: 0.5 }); }
    return s + P("M" + d(cr), "#fff6dc", 4, ' opacity=".8"'); }
  function ridgeX(xa, xb, zc, w, h) { return ridge(function (k) { var x = lerp(xa, xb, k), pr = Math.pow(Math.sin(Math.PI * k), 0.45); return [Q(x, zc - w * pr, 0), Q(x, zc, h * pr), Q(x, zc + w * pr, 0)]; }); }
  function ridgeZ(za, zb, xc, w, h) { return ridge(function (k) { var z = lerp(za, zb, k), pr = Math.pow(Math.sin(Math.PI * k), 0.45); return [Q(xc - w * pr, z, 0), Q(xc, z, h * pr), Q(xc + w * pr, z, 0)]; }); }
  function isoHole(dk) { if (dk <= 0) return ""; var d = D * dk, l = L, r = RAMP * dk, s = "";
    var open = [Q(0, 0), Q(l + r, 0), Q(l + r, W), Q(0, W)];
    s += '<clipPath id="hole"><path d="M' + open.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z"/></clipPath>';
    s += poly(open, "#a8743e", { sw: 0 }) + '<g clip-path="url(#hole)">';
    s += poly([Q(0, 0, -d), Q(l, 0, -d), Q(l, W, -d), Q(0, W, -d)], "#b88450", { sw: 0 });
    s += poly([Q(0, W, 0), Q(l + r, W, 0), Q(l, W, -d), Q(0, W, -d)], "#c99860", { sw: 2 });
    s += poly([Q(l, 0, -d), Q(l + r, 0, 0), Q(l + r, W, 0), Q(l, W, -d)], "#ddb070", { sw: 2 });
    s += '</g>' + poly(open, "none", { sw: 3.4 });
    return s; }
  // o: dig 0…1, mound 0…1, tarp 0…1, tarp2 0…1, hot, air, bag, compass, man (svg drawn inside the trench, under the sheets)
  function iso(t, o) { o = o || {}; var b = has(o), dk = clamp(o.dig != null ? o.dig : (b.trench ? 1 : 0)), mk = clamp(o.mound != null ? o.mound : (b.mound ? 1 : 0)), s = isoGround(t, o.night);
    var hm = HM * ease(mk);
    if (mk > 0) s += ridgeX(-70, L + 30, W + 60, 60 * ease(mk), hm);
    s += isoHole(dk);
    if (o.inside) s += o.inside;
    if (mk > 0) s += ridgeZ(-90, W + 90, -55, 60 * ease(mk), hm);
    if (o.compass) { var ck = clamp(o.compass), a = Q(30, -150), z = Q(L - 30, -150); s += '<g opacity="' + f(ck) + '">' + K.arrowH(a[0], a[1], z[0], "#ffd23a", 9, ck) + T("شمال", a[0] - 20, a[1] + 62, 38, "#fff", { stroke: INK }) + T("جنوب", z[0] + 10, z[1] + 62, 38, "#fff", { stroke: INK }) + '</g>'; }
    if (mk > 0) s += ridgeX(-70, L + 30, -60, 60 * ease(mk), hm);
    var k1 = clamp(o.tarp != null ? o.tarp : (b.tarp ? 1 : 0)), k2 = clamp(o.tarp2 != null ? o.tarp2 : (b.tarp2 ? 1 : 0));
    if (k1 > 0) { var x1 = lerp(-90, L + 30, ease(k1)), c1 = [Q(-90, -70, HM), Q(x1, -70, HM), Q(x1, W + 70, HM), Q(-90, W + 70, HM)];
      s += '<g filter="url(#sh)">' + poly(c1, "url(#tarp)", { sw: 3 }) + '</g>' + P("M" + f(Q(-90, W / 2, HM)[0]) + " " + f(Q(-90, W / 2, HM)[1]) + " L" + f(Q(x1, W / 2, HM)[0]) + " " + f(Q(x1, W / 2, HM)[1]), "#8fc0f0", 3, ' opacity=".5"');
      if (o.hot) s += poly(c1, "#ff4a1a", { sw: 0, op: 0.55 * clamp(o.hot) }) + (function () { var w = ""; for (var h = 0; h < 6; h++) { var q = (t * 1.0 + h / 6) % 1, p = Q(-40 + h * 90, W / 2, HM); w += P("M" + f(p[0]) + " " + f(p[1] - q * 80) + " q12 -14 0 -28 q-12 -14 0 -28", "#ff6a2a", 5, ' opacity="' + f((1 - q) * clamp(o.hot)) + '"'); } return w; })();
      if (k1 > 0.95) [[-90, -70], [-90, W + 70], [L + 30, -70], [L + 30, W + 70]].forEach(function (c) { var p = Q(c[0], c[1], HM); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="26" ry="17" fill="#a8927a" stroke="' + INK + '" stroke-width="3"/>'; }); }
    if (k2 > 0) { var y2 = lerp(H2 + 420, H2, ease(k2)), cs = [[-110, -90], [L + 50, -90], [L + 50, W + 90], [-110, W + 90]];
      cs.forEach(function (c) { if (c[1] > 0) { var g = Q(c[0], c[1], 0), tp = Q(c[0], c[1], H2); s += P("M" + f(g[0]) + " " + f(g[1]) + " L" + f(tp[0]) + " " + f(tp[1]), "#8a5a30", 8); } });
      if (k2 > 0.9) s += poly([Q(-60, -40, HM), Q(L + 60, -40, HM), Q(L + 60, W + 100, HM), Q(-60, W + 100, HM)], "#000", { sw: 0, op: 0.18 });
      if (o.air && k2 > 0.95) for (var a2 = 0; a2 < 4; a2++) { var p2 = (t * 0.45 + a2 / 4) % 1, aa = Q(lerp(-120, L - 60, p2), -95, (HM + H2) / 2), ab = Q(lerp(-60, L, p2), -95, (HM + H2) / 2); s += K.arrowH(aa[0], aa[1], ab[0], "#bfe6ff", 6, 1); }
      s += '<g filter="url(#sh)">' + poly(cs.map(function (c) { return Q(c[0], c[1], y2); }), "url(#tarp2)", { sw: 3, op: 0.72 }) + '</g>';
      cs.forEach(function (c) { if (c[1] < 0) { var g = Q(c[0], c[1], 0), tp = Q(c[0], c[1], H2); s += P("M" + f(g[0]) + " " + f(g[1]) + " L" + f(tp[0]) + " " + f(tp[1]), "#8a5a30", 8); } }); }
    return s; }
  var ISO = [600, 1180, 1.4], DOOR = Q(L + 150, W / 2), HEAD = Q(-160, W / 2), FRONT = Q(250, -170);
  var LIEH = Q(250, W / 2, -D + 16);
  function lieIso(u, t, mood) { return act(u, [[0, { hip: LIEH, rot: -90, f: 1, p: LIE, mood: mood || "n", s: 0.72 }]], t); }

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[7, { trench: 1 }], [10, { mound: 1 }], [12, { tarp: 1 }], [14, { tarp2: 1 }], [19, { bag: 1 }]]);
  var SUN2 = [930, 520], WARM = 0.75;
  var SIT_CAR = { hip: [CX0 + 400, GY - 84], f: 1, p: "sitDesk", s: 0.8 };

  // 0 — the car broke down; you wait inside it: you have shade from the sun
  shot(0, [200, 960, 1.35], [180, 930, 1.6], function (u, d, t) {
    var inner = act(u, [[0, Object.assign({ mood: "n" }, SIT_CAR)], [2.6, Object.assign({ mood: "worry" }, SIT_CAR)], [4.2, Object.assign({ mood: "happy" }, SIT_CAR)]], t);
    var s = scene(t, {}, { steam: 1, inner: inner });
    return s + pill("عطلانة!", 260, 700, u, 0.6, { bg: "#c7321f" }) + pill("ضل", 160, 1060, u, 3.4, { col: "#7cf2a0", down: false }) + ring(160, GY - 160, 170, u, 3.4, t);
  });
  // 1 — but inside, the car is an oven, much hotter than outside
  shot(1, [160, 930, 1.75], [140, 930, 1.95], function (u, d, t) {
    var inner = act(u, [[0, Object.assign({ mood: "n" }, SIT_CAR)], [1.2, Object.assign({ mood: "dizzy" }, SIT_CAR, { p: "collar" })], [3.0, Object.assign({ mood: "shock" }, SIT_CAR, { p: "shock" })]], t);
    var s = scene(t, {}, { hot: clamp(u / 0.8), oven: clamp(u / 0.6), inner: inner });
    return s + pill("فرن!", 150, 760, u, 0.6, { bg: "#c7321f" }) + thermo(-40, GY - 280, 1, clamp((u - 1.4) / 0.3), "") + drops(CX0 + 420, GY - 230, t, 2);
  });
  // 2 — so you get out but stay by it: from above a car is far easier to spot than a lost man
  shot(2, [300, 980, 1.3], [300, 860, 0.85], function (u, d, t) {
    var out = u > 0.6, s = scene(t, {}, { plane: clamp((u - 2.0) / 3.6), inner: out ? null : act(u, [[0, Object.assign({ mood: "n" }, SIT_CAR)]], t) });
    if (out) s += act(u - 0.6, [[0, { x: 240, y: GY, f: 1, p: "stand", mood: "n" }], [1.4, { x: 560, y: GY, f: -1, p: "point", mood: "n" }], [3.0, { x: 560, y: GY, f: -1, p: "pointUp", mood: "happy" }], [4.4, { x: 560, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + ring(140, GY - 120, 230, u, 2.6, t) + pill("بتتشاف من فوق", 200, 640, u, 2.8, { col: "#7cf2a0", sz: 64 }) + vmark(560, 470, u, 4.2, 1.4);
  });
  // 3 — but the sand under your feet gets hotter than the air: its surface can reach 65°
  shot(3, [600, 900, 1.5], [640, 1040, 1.7], function (u, d, t) {
    var s = scene(t, {}, { temp: clamp((u - 2.2) / 0.8) * 0.8 });
    s += act(u, [[0, { x: 600, y: GY, f: 1, p: "pointUp", mood: "worry" }], [1.8, { x: 600, y: GY, f: 1, p: "collar", mood: "dizzy" }], [3.4, { x: 600, y: GY, f: 1, p: "shock", mood: "shock" }]], t);
    s += drops(560, GY - 300, t, 2);
    return s + pill("الرملة نار", 760, 600, u, 0.4, { bg: "#c7321f" }) + thermo(760, GY - 40, 0.95, clamp((u - 2.4) / 0.4), "٦٥ درجة") + xmark(640, GY + 80, u, 3.6, 0.8);
  });
  // 4 — so you dig down: half a metre under, the sand is about 20°
  shot(4, [620, 1080, 1.4], [660, 1200, 1.6], function (u, d, t) {
    var s = scene(t, {}, { temp: clamp((u - 0.4) / 0.8) });
    s += act(u, [[0, { x: 560, y: GY, f: 1, p: "crouch", mood: "n" }], [1.6, { x: 560, y: GY, f: 1, p: "point", mood: "n" }], [4.6, { x: 560, y: GY, f: 1, p: "thumbs", mood: "happy" }]], t);
    s += P("M760 " + (GY - 2) + " V" + (GY + 77), "#fff", 4, ' stroke-dasharray="10 10" opacity=".9"') + T("نص متر", 690, GY + 48, 34, "#fff", { stroke: INK });
    return s + thermo(760, GY - 30, 0.95, 1, "٦٥ درجة") + thermo(860, GY + 260, 0.3, clamp((u - 2.6) / 0.4), "٢٠ درجة", "#2f7fd8") + pill("البرودة تحت", 700, 1460, u, 1.0, { col: "#7cf2a0" });
  });
  // 5 — but dig at noon and you sweat away your body's water (seen from above from here on: the trench as it is)
  shot(5, [640, 1180, 1.2], [650, 1180, 1.28], function (u, d, t) {
    var s = iso(t, { dig: clamp(u / 3) * 0.2 });
    s += act(u, [[0, { x: DOOR[0], y: DOOR[1], f: -1, p: "dig", rate: 1.6, mood: "n", s: 0.75 }], [1.6, { x: DOOR[0], y: DOOR[1], f: -1, p: "dig", rate: 1.6, mood: "dizzy", s: 0.75 }], [2.4, { x: DOOR[0], y: DOOR[1], f: -1, p: "collar", mood: "dizzy", s: 0.75 }]], t);
    s += drops(DOOR[0] - 20, DOOR[1] - 290, t, 3, 1.8);
    return s + pill("عز الضهر", 720, 640, u, 0.3, { bg: "#c7321f" }) + xmark(DOOR[0] - 150, 820, u, 1.8, 0.8);
  });
  // 6 — so you wait for the sun to drop and dig slowly: a trench half a metre deep, as long as you lying down
  shot(6, [620, 1200, 1.18], [615, 1210, 1.24], function (u, d, t) {
    var dk = clamp(0.2 + u / 5), s = iso(t, { dig: dk }), w = "";
    s = '<g>' + s + '</g>' + R(-800, -900, 2700, 3000, "#f29a4a", { sw: 0, op: 0.18 * clamp(u / 1.4) });
    s += act(u, [[0, { x: DOOR[0], y: DOOR[1], f: -1, p: "breathe", mood: "n", s: 0.75 }], [1.0, { x: DOOR[0], y: DOOR[1], f: -1, p: "dig", rate: 1.1, mood: "n", s: 0.75 }], [5.2, { x: DOOR[0], y: DOOR[1], f: -1, p: "thumbs", mood: "happy", s: 0.75 }]], t);
    var a = Q(0, -40), b2 = Q(L, -40), c = Q(-30, 0), e = Q(-30, 0, -D * dk);
    s += P("M" + f(a[0]) + " " + f(a[1]) + " L" + f(b2[0]) + " " + f(b2[1]), "#fff", 5, ' opacity="' + f(clamp((u - 3.2) / 0.4)) + '"') + P("M" + f(c[0]) + " " + f(c[1]) + " L" + f(e[0]) + " " + f(e[1]), "#fff", 5, ' opacity="' + f(clamp((u - 2.2) / 0.4)) + '"');
    return s + pill("نص متر", c[0] + 30, c[1] - 90, u, 2.2, { col: "#ffd23a", sz: 36 }) + pill("قدّ طولك", (a[0] + b2[0]) / 2, a[1] + 120, u, 3.4, { col: "#ffd23a", sz: 36, down: false });
  });
  // 7 — you run it north to south, so the sun can't get in
  shot(7, [610, 1210, 1.2], [610, 1230, 1.26], function (u, d, t) {
    var s = iso(t, { compass: clamp((u - 0.3) / 0.6) });
    s += act(u, [[0, { x: DOOR[0], y: DOOR[1], f: -1, p: "point", mood: "n", s: 0.75 }], [2.6, { x: DOOR[0], y: DOOR[1], f: -1, p: "thumbs", mood: "happy", s: 0.75 }]], t);
    return s + pill("الشمس ما تدخلوش", 620, 700, u, 1.6, { col: "#7cf2a0", sz: 40 });
  });
  // 8 — but half a metre deep is cramped: you can't turn over in it
  shot(8, [580, 1250, 1.55], [585, 1260, 1.7], function (u, d, t) {
    var s = iso(t, { inside: lieIso(u, t, u > 1.2 ? "worry" : "n") });
    var top = Q(250, W / 2, 0); s += K.arrowV(top[0] + 60, top[1] - 30, top[1] + 20, "#ff6a5a", 8, clamp((u - 1.0) / 0.4)) + K.arrowV(top[0] + 60, LIEH[1] + 70, LIEH[1] + 20, "#ff6a5a", 8, clamp((u - 1.0) / 0.4));
    return s + pill("ضيق!", 560, 940, u, 0.8, { bg: "#c7321f" });
  });
  // 9 — so you heap the sand on three sides, the shelter gets taller, and the fourth side stays open as the door
  shot(9, [610, 1190, 1.18], [610, 1170, 1.12], function (u, d, t) {
    var mk = clamp(u / 3.0), s = iso(t, { mound: mk, inside: u > 3.4 ? lieIso(u - 3.4, t, "happy") : "" });
    if (u < 3.4) s += act(u, [[0, { x: DOOR[0], y: DOOR[1], f: -1, p: "dig", rate: 1.4, mood: "n", s: 0.75 }], [3.0, { x: DOOR[0], y: DOOR[1], f: -1, p: "point", mood: "n", s: 0.75 }]], t);
    var p1 = Q(L / 2, W + 60, HM), p2 = Q(-55, W / 2, HM), p3 = Q(L / 2, -60, HM), dr = Q(L + RAMP / 2, W / 2, 0);
    s += pill("١", p1[0], p1[1] - 40, u, 1.0, { col: "#ffd23a", sz: 40 }) + pill("٢", p2[0], p2[1] - 40, u, 1.7, { col: "#ffd23a", sz: 40 }) + pill("٣", p3[0], p3[1] + 110, u, 2.4, { col: "#ffd23a", sz: 40, down: false });
    return s + ring(dr[0], dr[1], 90, u, 3.8, t) + pill("الباب", dr[0] + 40, dr[1] - 120, u, 3.8, { col: "#7cf2a0", sz: 40 }) + vmark(860, 930, u, 5.4, 0.9);
  });
  // 10 — but the pit has no roof and the sun still falls on you
  shot(10, [590, 1230, 1.45], [590, 1240, 1.55], function (u, d, t) {
    var s = iso(t, { inside: lieIso(u, t, u > 1.2 ? "shock" : "n") });
    for (var r = 0; r < 5; r++) { var g = Q(60 + r * 90, W / 2, -D + 20); s += P("M" + f(g[0] + 500) + " 300 L" + f(g[0]) + " " + f(g[1]), "#ffe28a", 7, ' opacity=".55" stroke-dasharray="16 16" stroke-dashoffset="' + f(-t * 80) + '"'); }
    return s + pill("من غير سقف", 600, 920, u, 0.5, { bg: "#c7321f" }) + xmark(820, 1060, u, 1.4, 0.8);
  });
  // 11 — so you stretch the sheet over it and pin the edges with stones: the belowground shelter
  shot(11, [590, 1180, 1.2], [600, 1170, 1.15], function (u, d, t) {
    var k1 = clamp((u - 0.4) / 2.0), s = iso(t, { tarp: k1, inside: lieIso(u, t, "n") });
    s += act(u, [[0, { x: HEAD[0], y: HEAD[1], f: 1, p: "push", mood: "n", s: 0.75 }], [2.4, { x: HEAD[0], y: HEAD[1], f: 1, p: "crouch", mood: "n", s: 0.75 }], [4.0, { x: HEAD[0], y: HEAD[1], f: 1, p: "thumbs", mood: "happy", s: 0.75 }]], t);
    var c = Q(L / 2, W / 2, HM);
    return s + pill("الملجأ اللي تحت الأرض", 600, 800, u, 3.0, { col: "#ffd23a", sz: 40 }) + ring(c[0], c[1], 230, u, 2.6, t);
  });
  // 12 — but a single sheet heats up like a griddle over your head (cut open again: him under it)
  shot(12, [760, 1080, 1.85], [760, 1080, 2.0], function (u, d, t) {
    var s = scene(t, {}, { sun: SUN2, warm: WARM });
    s += act(u, [[0, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "n" }], [1.0, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "dizzy" }]], t);
    s += over(t, {}, { hot: clamp((u - 0.2) / 0.6) });
    return s + pill("زي الصاج!", 760, 880, u, 0.8, { bg: "#c7321f" }) + xmark(940, 930, u, 1.6, 0.7);
  });
  // 13 — so a second sheet 30 cm above it on four sticks; the air between insulates: up to 22° cooler inside
  shot(13, [600, 1150, 1.15], [600, 1140, 1.1], function (u, d, t) {
    var k2 = clamp((u - 0.3) / 1.8), s = iso(t, { tarp2: k2, air: u > 2.2 });
    s += act(u, [[0, { x: FRONT[0], y: FRONT[1] + 120, f: -1, p: "reach", mood: "n", s: 0.75 }], [2.4, { x: FRONT[0], y: FRONT[1] + 120, f: -1, p: "point", mood: "n", s: 0.75 }], [5.6, { x: FRONT[0], y: FRONT[1] + 120, f: -1, p: "thumbs", mood: "happy", s: 0.75 }]], t);
    var e = Q(-110, -90, HM), e2 = Q(-110, -90, H2);
    s += P("M" + f(e[0] - 40) + " " + f(e[1]) + " L" + f(e2[0] - 40) + " " + f(e2[1]), "#fff", 5, ' opacity="' + f(clamp((u - 2.0) / 0.3)) + '"');
    return s + pill("٣٠ سم هوا", e[0] + 90, e2[1] - 70, u, 2.2, { col: "#ffd23a", sz: 40 }) + pill("أبرد لحد ٢٢ درجة", 640, 700, u, 4.6, { col: "#7cf2a0", sz: 44 });
  });
  // 14 — oddly, many people think it's best to take your clothes off to cool down
  shot(14, [900, 980, 1.6], [940, 960, 1.8], function (u, d, t) {
    var s = scene(t, {}, { sun: SUN2, warm: WARM }) + over(t, {}, {});
    s += act(u, [[0, { x: TX1 + 140, y: GY, f: -1, p: "collar", mood: "n" }], [1.6, { x: TX1 + 140, y: GY, f: -1, p: "collar", mood: "worry" }], [2.6, { x: TX1 + 140, y: GY, f: -1, p: "shrug", mood: "n" }]], t);
    return s + pill("أقلع هدومي؟", TX1 + 140, 600, u, 0.6, { sz: 36 });
  });
  // 15 — in truth you can lose 2.5 litres of sweat an hour; clothes hold it on the skin to cool you instead of wasting it
  shot(15, [1000, 900, 2.3], [960, 960, 1.7], function (u, d, t) {
    var s = scene(t, {}, { sun: SUN2, warm: WARM }) + over(t, {}, {});
    s += act(u, [[0, { x: TX1 + 140, y: GY, f: -1, p: "shrug", mood: "worry" }], [3.6, { x: TX1 + 140, y: GY, f: -1, p: "point", mood: "n" }], [6.0, { x: TX1 + 140, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    s += drops(TX1 + 120, GY - 260, t, 3, 1.6);
    if (u > 3.6) { var k = clamp((u - 3.6) / 0.5); for (var i = 0; i < 6; i++) s += C(TX1 + 112 + (i % 3) * 18, GY - 200 + Math.floor(i / 3) * 26, 6, "#9fd6ff", { st: "#4a8ccc", sw: 1.6, op: k }); }
    return s + (u < 3.6 ? pill("٢.٥ لتر عرق في الساعة", 980, 620, u, 0.8, { bg: "#c7321f", sz: 34 }) : pill("الهدوم بتمسكه", 980, 640, u, 3.7, { col: "#7cf2a0", sz: 40 })) + ring(TX1 + 130, GY - 190, 60, u, 3.8, t);
  });
  // 16 — so you stay dressed, head covered, quiet in the shade
  shot(16, [770, 1080, 1.8], [770, 1080, 1.95], function (u, d, t) {
    var s = scene(t, {}, { sun: SUN2, warm: WARM });
    s += act(u, [[0, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "n" }], [1.6, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "happy" }]], t);
    s += over(t, {}, { air: true });
    return s + vmark(930, 900, u, 1.8, 0.8) + pill("لابس وفي الضل", 760, 790, u, 0.8, { col: "#7cf2a0", sz: 36 });
  });
  // 17 — but the moment the sun sets, the desert turns very cold
  shot(17, [780, 1040, 1.7], [790, 1060, 1.85], function (u, d, t) {
    var s = scene(t, {}, { night: true });
    s += act(u, [[0, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "n" }], [0.8, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "worry" }]], t);
    s += over(t, {}, {});
    for (var a = 0; a < 4; a++) { var p = (t * 0.6 + a / 4) % 1; s += K.arrowH(TX1 + 260 - p * 200, GY - 20 + a * 14, TX1 + 160 - p * 200, "#bfe6ff", 6, 1); }
    return s + pill("برد!", 900, 820, u, 0.4, { bg: "#2f6f9f" }) + thermo(1080, GY - 40, 0.15, clamp((u - 0.8) / 0.4), "", "#2f7fd8");
  });
  // 18 — so you shut the door with your bag, and the ground under you stays warmer than the air
  shot(18, [800, 1060, 1.7], [770, 1120, 1.6], function (u, d, t) {
    var s = scene(t, {}, { night: true, warmGround: clamp((u - 1.8) / 0.8), bagDoor: 1 });
    s += act(u, [[0, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "n" }], [2.6, { hip: [760, TF - 24], rot: -90, f: 1, p: LIE, mood: "happy" }]], t);
    s += over(t, {}, { bag: clamp((u - 0.2) / 1.0) });
    return s + pill("الشنطة باب", TX1 + 60, 860, u, 1.0, { col: "#ffd23a", sz: 34 }) + pill("الأرض أدفى", 760, 1380, u, 2.2, { col: "#ffb070", sz: 36, down: false }) + vmark(560, 960, u, 3.0, 0.7);
  });
  // 19 — but none of it matters if nobody finds you
  shot(19, [460, 960, 1.1], [460, 900, 0.85], function (u, d, t) {
    var s = scene(t, {}, { plane: clamp(u / 2.0) * 0.9 + 0.05, bagDoor: 1 });
    s += act(u, [[0, { x: 545, y: GY, f: -1, p: "pointUp", mood: "n" }], [0.8, { x: 545, y: GY, f: -1, p: "wave", mood: "worry" }], [1.6, { x: 545, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    s += over(t, {}, {});
    return s + pill("محدش شايفك", 460, 420, u, 0.5, { bg: "#c7321f", sz: 64 });
  });
  // 20 — so you lay stones in an SOS and take the car's mirror off to flash at any plane
  shot(20, [400, 960, 1.15], [400, 920, 1.2], function (u, d, t) {
    var s = scene(t, {}, { plane: u > 3.0 ? clamp((u - 3.0) / 3.0) * 0.7 + 0.1 : null, bagDoor: 1 }) + over(t, {}, {});
    s += act(u, [[0, { x: 60, y: GY, f: 1, p: "crouch", mood: "n" }], [2.8, { x: 120, y: GY, f: 1, p: "crouch", mood: "n" }], [3.2, { x: 120, y: GY, f: 1, p: "reach", mood: "n" }]], t);
    if (u > 3.4) { var w = K.man.wN || [140, GY - 300], px = lerp(1500, -700, clamp((u - 3.0) / 3.0) * 0.7 + 0.1);
      s += R(w[0] - 16, w[1] - 26, 32, 22, "#dfe6ec", { rx: 4, sw: 2.4 }) + P("M" + f(w[0]) + " " + f(w[1] - 16) + " L" + f(px) + " 260", "#fff6c0", 10, ' opacity="' + f(0.4 + 0.4 * Math.abs(Math.sin(t * 9))) + '"') + C(w[0], w[1] - 16, 30, "url(#bulb)", { op: 0.9 }); }
    return s + sosInset(560, 560, clamp((u - 0.2) / 0.4), clamp((u - 0.5) / 2.4), t) + pill("SOS", 560, 300, u, 2.6, { col: "#ffd23a" });
  });
  // 21 — what's left: drink your water without rationing it, move only at night, and wait
  shot(21, [800, 1020, 1.35], [930, 1020, 1.35], function (u, d, t) {
    var night = u > 1.9 && u < 3.6, s = scene(t, {}, { night: night, bagDoor: 1, sun: SUN2, warm: WARM }) + over(t, {}, {});
    s += act(u, [[0, { x: TX1 + 140, y: GY, f: -1, p: "breathe", mood: "happy" }], [1.9, { x: TX1 + 140, y: GY, f: -1, p: "stand", mood: "n", jump: 1 }], [2.0, { x: TX1 + 140, y: GY, f: 1, mood: "n" }], [3.4, { x: TX1 + 300, y: GY, f: 1, p: "stand", mood: "n" }], [3.6, { x: TX1 + 140, y: GY, f: -1, p: "pointUp", mood: "n", jump: 1 }], [4.6, { x: TX1 + 140, y: GY, f: -1, p: "pointUp", mood: "happy" }]], t);
    if (u < 1.9 && K.man.wN) { var w = K.man.wN; s += R(w[0] - 12, w[1] - 46, 24, 52, "#9fd6ff", { rx: 8, sw: 2.4 }) + R(w[0] - 7, w[1] - 56, 14, 12, "#2f6f9f", { rx: 3, sw: 2 }); }
    return s + pill(u < 1.9 ? "اشرب مياهك" : u < 3.6 ? "اتحرك بالليل" : "واستنى", 900, 620, u, 0.3, { col: "#ffd23a", sz: 38 });
  });
  // 22 — and congratulations: you built a desert survival shelter yourself (the whole build from above, help arriving)
  shot(22, [620, 1120, 1.15], [600, 1080, 1.0], function (u, d, t) {
    var s = iso(t, { bag: 1 });
    var bp = Q(L + 40, W / 2, 0); s += '<g filter="url(#sh)">' + R(bp[0] - 34, bp[1] - 90, 68, 96, "#7a4a2a", { rx: 14 }) + R(bp[0] - 20, bp[1] - 64, 40, 24, "#5a3420", { rx: 6, sw: 2 }) + '</g>';
    s += heli(lerp(1400, 900, ease(clamp(u / 2.2))), 560 + 20 * Math.sin(t * 2), t, 1.3);
    s += act(u, [[0, { x: FRONT[0] + 120, y: FRONT[1] + 140, f: 1, p: "wave", mood: "happy", s: 0.75 }], [1.2, { x: FRONT[0] + 120, y: FRONT[1] + 140, f: 1, p: "cheer", mood: "proud", s: 0.75 }]], t);
    return s + K.confetti(t, 100, 1100, 300, 1600) + pill("ملجأ نجاة", 560, 760, u, 0.6, { col: "#ffd23a", sz: 60 });
  });
  // 23 — tell us what story you want next
  shot(23, [600, 1080, 1.0], [600, 1090, 0.96], function (u, d, t) {
    var s = iso(t, {});
    var bp = Q(L + 40, W / 2, 0); s += '<g filter="url(#sh)">' + R(bp[0] - 34, bp[1] - 90, 68, 96, "#7a4a2a", { rx: 14 }) + R(bp[0] - 20, bp[1] - 64, 40, 24, "#5a3420", { rx: 6, sw: 2 }) + '</g>';
    s += heli(900 + 30 * Math.sin(t), 560 + 20 * Math.sin(t * 2), t, 1.3);
    s += act(u, [[0, { x: FRONT[0] + 120, y: FRONT[1] + 140, f: 1, p: "cheer", mood: "proud", s: 0.75 }], [1.0, { x: FRONT[0] + 120, y: FRONT[1] + 140, f: 1, p: "wave", mood: "happy", s: 0.75 }]], t);
    return s + pill("قولولنا!", 600, 760, u, 0.5, { col: "#ffd23a", sz: 64 });
  });
  window.__desert = { scene: scene, over: over, iso: iso, Q: Q, act: act, TX0: TX0, TX1: TX1, TF: TF, GY: GY, LIE: LIE, L: L, W: W, D: D, HM: HM };
})();
