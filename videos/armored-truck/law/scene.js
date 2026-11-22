/* «عربية نقل الفلوس» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One street seen from the side, the road cut open below: a ربع نقل pickup that grows, part by part, into an armoured
   cash-in-transit truck. Real sizes at 96 units to the metre (the man, 1.75 m, is the kit's man at s 0.5 = 168 units):
   pickup ≈ a single-cab Hilux (5.3 m long, wheelbase 3.1 m, 1.8 m high, wheels 0.75 m); truck ≈ an F-550-class CIT body
   (7.0 m long, wheelbase 4.2 m, box 4.2 m long and 3.0 m high, cab roof 2.5 m, wheels 0.82 m). See ../refs/SOURCES.md. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, shot = K.shot, has = K.has;
  var M = 96, GY = K.GY, RY = GY - 22;           // RY: where the tyres touch the road (the road's top seen at a slight angle)
  var GUARD = { base: "guard", colors: { shirt: "#3e5068", shirtD: "#2c3a4e", pants: "#262a36", pantsD: "#191c25", hat: "#262a36", hatD: "#191c25" } };
  var act = function (u, Ks, t) { Ks.forEach(function (k) { if (k[1].s == null) k[1].s = 0.5; if (!k[1].outfit) k[1].outfit = GUARD; }); return K.act(u, Ks, t); };

  // ── the street: road surface with a dashed centre line, the asphalt and its base cut open, a kerb and a bank behind ──
  function road(t) {
    var s = R(-800, GY - 44, 2700, 44, "url(#asph)", { sw: 3 }) + R(-800, GY, 2700, 46, "url(#asphCut)", { sw: 2 }) + R(-800, GY + 46, 2700, 34, "#9a8f80", { sw: 2 });
    for (var x = -780; x < 1900; x += 150) s += R(x, GY - 26, 80, 7, "#f2c230", { sw: 0 });
    for (var g = 0; g < 60; g++) s += C(-760 + hash(g + 3) * 2600, GY + 62 + hash(g + 8) * 12, 3 + hash(g) * 3, "#6f665a");
    return s + R(-800, GY - 58, 2700, 14, "#cfc8bb", { sw: 2 });
  }
  function bank(x) {      // a small Cairo bank branch, the truck's last stop
    var s = '<g filter="url(#sh)">' + R(x, GY - 470, 380, 412, "#e6dcc6") + '</g>' + R(x - 10, GY - 486, 400, 22, "#cdbf9f") + R(x + 40, GY - 440, 300, 54, "#2f5a7a", { rx: 6 }) + T("بنك", x + 190, GY - 400, 40, "#fff");
    for (var c = 0; c < 4; c++) s += R(x + 30 + c * 90, GY - 370, 22, 312, "#f2ead8", { sw: 2 });
    return s + R(x + 150, GY - 210, 80, 152, "#5a6a78", { sw: 3 }) + R(x + 156, GY - 204, 68, 140, "#8fb6d0", { sw: 2 });
  }

  // ── the vehicle: big 0 = the pickup, 1 = the truck; every length in metres from the front bumper, then to units ──
  function geo(b) { var L = lerp;
    return { len: L(5.3, 7.0, b), fAx: L(0.93, 1.0, b), rAx: L(4.02, 5.2, b), wr: L(0.375, 0.41, b), hoodL: L(1.2, 1.25, b), hoodH: L(1.1, 1.5, b),
      wsTop: L(1.75, 1.55, b), roof: L(1.8, 2.5, b), cabBack: L(2.85, 2.75, b), cabBot: L(0.5, 0.75, b), bed0: L(2.9, 2.8, b),
      bedFloor: L(0.85, 1.05, b), bedTop: L(1.3, 1.3, b), boxTop: L(2.0, 3.0, b), win0: L(1.85, 1.65, b), win1: L(2.75, 2.6, b), winLo: L(1.15, 1.6, b), winHi: L(1.65, 2.3, b) }; }
  // wheel at (x, RY - r): tyre, rim, lug nuts; cut: a quarter cut away to show the run-flat ring inside (runflat), flat: tyre squashed
  function wheel(x, r, o, t) { o = o || {}; var y = RY - r * (o.flat ? 0.86 : 1), s = "", rot = (o.spin || 0) * 360;
    s += '<g filter="url(#sh)">' + (o.flat ? F("M" + f(x - r * 1.12) + " " + f(RY) + " Q" + f(x - r * 1.1) + " " + f(y - r * 0.9) + " " + f(x) + " " + f(y - r) + " Q" + f(x + r * 1.1) + " " + f(y - r * 0.9) + " " + f(x + r * 1.12) + " " + f(RY) + " Z", "#26282b", { sw: 3 }) : C(x, y, r, "url(#tyre)", { st: INK, sw: 3 })) + '</g>';
    s += C(x, y, r * 0.58, "url(#rim)", { st: INK, sw: 2.4 }) + C(x, y, r * 0.2, "#6d7680", { st: INK, sw: 2 });
    for (var i = 0; i < 6; i++) { var a = (rot + i * 60) * Math.PI / 180; s += C(x + Math.cos(a) * r * 0.36, y + Math.sin(a) * r * 0.36, r * 0.05, "#4a525c"); }
    if (o.runflat) { var rr = r * 0.78; s += C(x, y, rr, "none", { st: "#e2b035", sw: r * 0.16, op: o.runflat }) + C(x, y, rr, "none", { st: INK, sw: 1.5, op: o.runflat }); }
    return s; }

  // the whole vehicle. o: big, box, glass, armor, cut, runflat, flat, bull, fire, ports, safe, gps, cams, radio, door
  function truck(xf, o, t) { o = o || {}; var b = clamp(o.big || 0), g = geo(b), X = function (m) { return xf - m * M; }, Y = function (m) { return RY - m * M; };
    var paint = b > 0.5 ? "url(#paintW)" : "url(#paintB)", s = "", r = g.wr * M, xr = X(g.len);
    s += '<ellipse cx="' + f(X(g.len / 2)) + '" cy="' + f(RY + 4) + '" rx="' + f(g.len * M * 0.52) + '" ry="12" fill="#000" opacity=".25"/>';
    // chassis rails
    s += R(X(g.len - 0.2), Y(g.cabBot + 0.05), (g.len - 0.4) * M, 0.18 * M, "#2c2f34", { sw: 2 });
    s += wheel(X(g.rAx), r, { runflat: o.runflat, flat: o.flat === "r", spin: o.spin }, t);
    // cargo: the open pickup bed, or the closed steel box
    if (!o.box) {
      s += '<g filter="url(#sh)">' + F("M" + f(X(g.bed0)) + " " + f(Y(g.bedFloor - 0.35)) + " H" + f(xr + 6) + " V" + f(Y(g.bedTop)) + " H" + f(X(g.bed0)) + " Z", paint) + '</g>';
      s += P("M" + f(xr + 20) + " " + f(Y(g.bedTop - 0.12)) + " H" + f(X(g.bed0) - 14), "#ffffff", 3, ' opacity=".5"');
      if (o.bags !== false) for (var i = 0; i < 3; i++) s += bagIcon(X(g.bed0 + 0.55 + i * 0.6), Y(g.bedTop) + 6, 0.9);
      s += R(xr + 4, Y(g.bedTop) - 6, 14, 22, "#e2b035", { rx: 3, sw: 2 }) + P("M" + f(xr + 6) + " " + f(Y(g.bedTop) - 6) + " a5 6 0 0 1 10 0", INK, 3);   // the padlock on the tailgate
    } else s += box(X, Y, g, o, t, xr);
    s += cab(X, Y, g, o, t, paint, b);
    s += wheel(X(g.fAx), r, { runflat: o.runflat, flat: o.flat === "f", spin: o.spin }, t);
    if (o.bull) { var bk = clamp(o.bull); s += '<g opacity="' + f(bk) + '" transform="translate(' + f((1 - ease(bk)) * 120) + ' 0)">' + P("M" + f(xf + 4) + " " + f(Y(0.35)) + " H" + f(xf + 30) + " V" + f(Y(1.35)) + " H" + f(xf + 4) + " M" + f(xf + 30) + " " + f(Y(0.85)) + " H" + f(xf + 4), INK, 16) + P("M" + f(xf + 4) + " " + f(Y(0.35)) + " H" + f(xf + 30) + " V" + f(Y(1.35)) + " H" + f(xf + 4) + " M" + f(xf + 30) + " " + f(Y(0.85)) + " H" + f(xf + 4), "#8a939c", 10) + '</g>'; }
    return s; }
  function bagIcon(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + F("M-24 0 Q-30 -34 -10 -44 L-14 -54 L14 -54 L10 -44 Q30 -34 24 0 Z", "url(#bag)", { sw: 2.4 }) + P("M-12 -46 H12", INK, 3) + T("ج", 0, -12, 22, "#3f6a2e") + '</g>'; }

  function box(X, Y, g, o, t, xr) { var x0 = xr, x1 = X(g.bed0), y0 = Y(g.boxTop), y1 = Y(g.bedFloor - 0.15), w = x1 - x0, h = y1 - y0, s = "";
    s += '<g filter="url(#sh)">' + R(x0, y0, w, h, "url(#paintW)", { rx: 6 }) + '</g>';
    // a navy band and the words «نقل أموال», rivet lines on the panels, the rear door edge
    s += R(x0, y0 + h * 0.56, w, h * 0.1, "#2c4a7a", { sw: 0 }) + R(x0, y0 + h * 0.66, w, h * 0.025, "#f2c230", { sw: 0 });
    if (w > 300) s += T("نقل أموال", x0 + w * 0.5, y0 + h * 0.44, h * 0.13, "#2c4a7a");
    for (var c = 1; c < 4; c++) s += P("M" + f(x0 + w * c / 4) + " " + f(y0 + 8) + " V" + f(y1 - 8), "#aab2ba", 2);
    s += P("M" + f(x0 + 14) + " " + f(y0 + 10) + " V" + f(y1 - 10), "#8d959e", 3) + R(x0 + 4, y0 + h * 0.4, 10, 28, "#5a636d", { sw: 1.5 });
    if (o.cut) s += inside(x0, y0, w, h, o, t);
    if (o.ports && !o.cut) { var pk = clamp(o.ports); for (var p = 0; p < 3; p++) s += port(x0 + w * (0.2 + p * 0.3), y0 + h * 0.3, pk, o.portOpen); }
    if (o.cams) s += R(x0 - 6, y0 + 6, 22, 16, "#1e2226", { rx: 3, sw: 2 }) + C(x0 - 6, y0 + 14, 5, "#4a8ccc") + R(x1 - 30, y0 + 6, 22, 16, "#1e2226", { rx: 3, sw: 2 });
    return s; }
  // the box cut open: steel lining (armor), the floor, the money (bags, or the safe), the fire pipes along the ceiling
  function inside(x0, y0, w, h, o, t) { var a = o.armor ? 16 : 5, ix = x0 + a, iy = y0 + a, iw = w * 0.86 - a, ih = h - 2 * a, s = "";
    s += R(x0, y0, w * 0.86, h, o.armor ? "url(#hatch)" : "#c9ced4", { sw: 3 }) + R(ix, iy, iw, ih, "url(#steelIn)", { sw: 2.4 });
    for (var r = 0; r < 6; r++) s += C(ix + 12 + r * iw / 6, iy + 10, 2.6, "#7d868f") + C(ix + 12 + r * iw / 6, iy + ih - 10, 2.6, "#7d868f");
    var fl = iy + ih;
    if (o.safe) { var sw = 1.0 * M, sh = 1.25 * M, sx = ix + iw - sw - 14, sy = fl - sh;
      s += '<g filter="url(#sh)">' + R(sx, sy, sw, sh, "url(#safeG)", { rx: 6 }) + '</g>' + R(sx + 8, sy + 8, sw - 16, sh - 16, "none", { st: "#2a3138", sw: 3, rx: 4 }) + C(sx + sw * 0.5, sy + sh * 0.42, 20, "#c9ced4", { st: INK, sw: 3 });
      for (var k = 0; k < 4; k++) { var an = k * Math.PI / 2 + (o.dial || 0); s += P("M" + f(sx + sw * 0.5) + " " + f(sy + sh * 0.42) + " l" + f(Math.cos(an) * 26) + " " + f(Math.sin(an) * 26), "#2a3138", 5); }
      s += R(sx + sw * 0.5 - 18, sy + sh * 0.68, 36, 22, "#0f2a3a", { rx: 3, sw: 1.5 }) + T("GPS", sx + sw * 0.5, sy + sh * 0.68 + 16, 12, o.safeOk ? "#7cf2a0" : "#ff6a5a"); }
    else for (var i = 0; i < 4; i++) s += bagIcon(ix + 40 + i * 52, fl, 1);
    // a fold-down seat for the guard at the cab end, facing the door
    s += R(ix + iw - (o.safe ? 1.2 * M : 0.6 * M) - 50, fl - 46, 46, 10, "#3a3f46", { sw: 2 });
    if (o.fire) { var py = iy + 14; s += P("M" + f(ix + 10) + " " + f(py) + " H" + f(ix + iw - 10), "#c7321f", 8);
      for (var n = 0; n < 4; n++) { var nx = ix + 40 + n * (iw - 80) / 3; s += R(nx - 6, py, 12, 12, "#8a939c", { sw: 1.5 });
        if (o.spray) for (var d = 0; d < 6; d++) { var p = (t * 1.6 + d / 6) % 1; s += C(nx + (d - 2.5) * 8 * p, py + 14 + p * 80, 3, "#bfe6ff", { op: (1 - p) * o.spray }); } } }
    return s; }
  // a round gun port: a steel disc on a pivot, closed or swung aside from the inside
  function port(x, y, k, open) { if (k <= 0) return ""; var o = clamp(open || 0);
    return '<g opacity="' + f(k) + '">' + C(x, y, 13, "#1e2226", { st: INK, sw: 2 }) + '<g transform="rotate(' + f(o * 70) + ' ' + f(x - 13) + ' ' + f(y - 13) + ')">' + C(x, y, 15, "url(#steel)", { st: INK, sw: 2.4 }) + C(x - 13, y - 13, 3.5, "#2a3138") + '</g></g>'; }

  function cab(X, Y, g, o, t, paint, b) { var s = "", xf = X(0), xb = X(g.cabBack), fx = X(g.fAx), rr = g.wr * M + 10;
    // body: hood + cab in one outline, a wheel arch cut around the front wheel
    var d = "M" + f(xf) + " " + f(Y(g.cabBot)) + " L" + f(xf) + " " + f(Y(g.hoodH - 0.08)) + " Q" + f(xf + 2) + " " + f(Y(g.hoodH)) + " " + f(xf - 16) + " " + f(Y(g.hoodH)) +
      " L" + f(X(g.hoodL)) + " " + f(Y(g.hoodH + 0.05)) + " L" + f(X(g.hoodL + 0.45)) + " " + f(Y(g.roof)) + " L" + f(xb + 8) + " " + f(Y(g.roof)) + " Q" + f(xb) + " " + f(Y(g.roof)) + " " + f(xb) + " " + f(Y(g.roof) + 10) +
      " L" + f(xb) + " " + f(Y(g.cabBot)) + " L" + f(fx - rr) + " " + f(Y(g.cabBot)) + " A" + f(rr) + " " + f(rr) + " 0 0 1 " + f(fx + rr) + " " + f(Y(g.cabBot)) + " Z";
    s += C(fx, RY - g.wr * M, rr - 2, "#1e2024") + '<g filter="url(#sh)">' + F(d, paint) + '</g>';
    // windscreen (seen edge-on), door window, door seam, handle, mirror, grille and headlamp
    var gl = o.glass ? "url(#glassC)" : "#a9d3ec";
    s += F("M" + f(X(g.hoodL) - 4) + " " + f(Y(g.hoodH + 0.08)) + " L" + f(X(g.hoodL + 0.4)) + " " + f(Y(g.roof - 0.06)) + " L" + f(X(g.hoodL + 0.5)) + " " + f(Y(g.roof - 0.06)) + " L" + f(X(g.hoodL + 0.1)) + " " + f(Y(g.hoodH + 0.08)) + " Z", gl, { sw: 2 });
    var wx0 = X(g.win1), wx1 = X(g.win0), wy0 = Y(g.winHi), wy1 = Y(g.winLo), th = o.glass ? 9 : 3;
    s += R(wx0, wy0, wx1 - wx0, wy1 - wy0, gl, { rx: 6, sw: th, st: o.glass ? "#2a3138" : INK });
    if (o.glass) for (var l = 1; l < 4; l++) s += R(wx0 + l * 4, wy0 + l * 4, wx1 - wx0 - l * 8, wy1 - wy0 - l * 8, "none", { rx: 4, sw: 1.4, st: "#e9f6ff" });
    s += P("M" + f(wx0 + 12) + " " + f(wy1 - 10) + " L" + f(wx0 + 40) + " " + f(wy0 + 10), "#fff", 6, ' opacity=".55"');
    if (o.crack) s += P("M" + f((wx0 + wx1) / 2) + " " + f((wy0 + wy1) / 2) + " l-20 -14 m20 14 l24 -10 m-24 10 l-6 22 m6 -22 l18 16", "#fff", 2.6) + C((wx0 + wx1) / 2, (wy0 + wy1) / 2, 6, "#2a3138");
    s += P("M" + f(wx0 - 8) + " " + f(Y(g.roof - 0.05)) + " V" + f(Y(g.cabBot + 0.05)) + " M" + f(wx1 + 6) + " " + f(Y(g.hoodH + 0.05)) + " V" + f(Y(g.cabBot + 0.05)), "#7f8790", 2.4);
    s += R(wx0 + 8, Y(g.winLo - 0.12), 22, 7, "#5a636d", { rx: 3, sw: 1.5 });
    if (o.ports) s += port(wx0 + (wx1 - wx0) * 0.5, Y(g.winLo - 0.35), clamp(o.ports), o.portOpen);
    s += R(X(g.hoodL + 0.3) - 4, Y(g.winHi) - 6, 12, 40, "#2c2f34", { rx: 3, sw: 2 });
    s += R(xf - 8, Y(g.hoodH - 0.15), 10, (g.hoodH - 0.55) * M, "#3a3f46", { sw: 2 }) + R(xf - 12, Y(g.hoodH - 0.2), 12, 18, "#ffe9a8", { rx: 3, sw: 2 }) + R(xf - 6, Y(0.55), 14, 0.2 * M, "#8a939c", { rx: 3, sw: 2 });
    if (b > 0.5) s += R(X(g.hoodL + 0.15), Y(g.roof) - 10, 0.5 * M, 10, "#f2a33a", { rx: 3, sw: 2 });       // roof lamp bar
    if (o.gps) s += F("M" + f(xb + 20) + " " + f(Y(g.roof)) + " q22 -26 44 0 Z", "#f4f6f8", { sw: 2.4 }) + ring(xb + 42, Y(g.roof) - 8, 22, o.gpsU || 9, 0, t);
    if (o.radio) s += P("M" + f(xb + 80) + " " + f(Y(g.roof)) + " l-6 -110", "#2a2a2a", 3) + C(xb + 74, Y(g.roof) - 112, 4, "#d8352a");
    if (o.fireCab) s += R(xb - 14, Y(g.roof) + 6, -(xb - X(g.hoodL + 0.5)) + 14, 10, "#c7321f", { sw: 1.5 });
    return s; }
  // fire on the truck (k 0…1) and smoke
  function flames(x, y, k, t) { if (k <= 0) return ""; var s = "";
    for (var i = 0; i < 7; i++) { var ph = t * 5 + i * 1.7, hh = (60 + 40 * Math.sin(ph)) * k; s += F("M" + f(x - 70 + i * 22) + " " + f(y) + " q" + f(-14 + 6 * Math.sin(ph)) + " " + f(-hh * 0.6) + " " + f(6) + " " + f(-hh) + " q" + f(18) + " " + f(hh * 0.5) + " " + f(12) + " " + f(hh) + " Z", "url(#fire)", { sw: 0 }); }
    for (var j = 0; j < 5; j++) { var p = (t * 0.4 + j / 5) % 1; s += C(x - 30 + j * 20 + p * 60, y - 120 - p * 260, 30 + p * 50, "#3a3a3a", { op: 0.45 * (1 - p) * k }); }
    return s; }
  // a cash case: shut, or opened wrong and sprayed with ink (k 0…1)
  function cashCase(x, y, ink, t) { var s = '<g filter="url(#sh)">' + R(x - 60, y - 70, 120, 70, "#3a3f46", { rx: 8 }) + '</g>' + R(x - 20, y - 84, 40, 16, "none", { st: INK, sw: 6, rx: 6 }) + R(x - 8, y - 44, 16, 14, "#c9ced4", { sw: 2 });
    if (ink > 0) for (var i = 0; i < 10; i++) { var a = -Math.PI * (0.1 + 0.8 * hash(i)), d = 30 + 90 * ink * hash(i + 4); s += C(x + Math.cos(a) * d, y - 70 + Math.sin(a) * d, 10 + 10 * hash(i + 7), "#d8357a", { op: ink }); }
    return s; }
  // a plain car parked across the road (the roadblock)
  function car(x, k) { if (k <= 0) return ""; var y = RY; return '<g opacity="' + f(k) + '">' + '<g filter="url(#sh)">' + F("M" + f(x - 220) + " " + f(y - 30) + " v-50 q0 -14 14 -16 l56 -6 l50 -46 h120 l50 46 l40 6 q14 2 14 16 v50 Z", "#7a8a6a") + '</g>' +
      R(x - 100, y - 140, 70, 40, "#a9d3ec", { sw: 2 }) + R(x - 20, y - 140, 70, 40, "#a9d3ec", { sw: 2 }) + wheel(x - 150, 34, {}) + wheel(x + 110, 34, {}) + '</g>'; }

  function scene(t, o, h) { o = o || {}; h = h || {}; var b = has(o);
    var s = K.sky(t, h.night) + K.palm(-40, t, 1.0) + K.palm(1100, t, 0.9) + K.ground(t) + road(t);
    if (h.bankX != null) s += bank(h.bankX);
    s += truck(h.xf == null ? 900 : h.xf, Object.assign({}, b, h), t);
    return s; }
  window.__armor = { scene: scene, truck: truck, wheel: wheel, flames: flames, cashCase: cashCase, car: car, act: act, M: M, RY: RY };

  // ── the build per line (fills in with the shots once the script is approved) ──
  K.steps([]);
  shot(0, [540, 1000, 1.2], [540, 1000, 1.2], function (u, d, t) { return scene(t, {}, {}); });
})();
