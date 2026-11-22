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
    var wR = wheel(X(g.rAx), r, { runflat: o.runflat, flat: o.flat === "r" || o.flat === "both", spin: o.spin }, t), sag = o.sag || 0;
    s += wR + '<g transform="translate(0 ' + f(sag) + ')">';
    // cargo: the open pickup bed, or the closed steel box
    if (!o.box) {
      s += '<g filter="url(#sh)">' + F("M" + f(X(g.bed0)) + " " + f(Y(g.bedFloor - 0.35)) + " H" + f(xr + 6) + " V" + f(Y(g.bedTop)) + " H" + f(X(g.bed0)) + " Z", paint) + '</g>';
      s += P("M" + f(xr + 20) + " " + f(Y(g.bedTop - 0.12)) + " H" + f(X(g.bed0) - 14), "#ffffff", 3, ' opacity=".5"');
      var nb = o.bagN == null ? 3 : o.bagN; for (var i = 0; i < nb; i++) s += bagIcon(X(g.bed0 + 0.55 + i * 0.6), Y(g.bedTop) + 6, 0.9);
      s += R(xr + 4, Y(g.bedTop) - 6, 14, 22, "#e2b035", { rx: 3, sw: 2 }) + P("M" + f(xr + 6) + " " + f(Y(g.bedTop) - 6) + " a5 6 0 0 1 10 0", INK, 3);   // the padlock on the tailgate
    } else { var dk = o.boxDrop == null ? 1 : ease(clamp(o.boxDrop)), lift = (1 - dk) * -620;
      if (dk < 1) s += P("M" + f((xr + X(g.bed0)) / 2) + " " + f(Y(g.boxTop) + lift) + " V-1400", "#2a2a2a", 4) + F("M" + f((xr + X(g.bed0)) / 2 - 14) + " " + f(Y(g.boxTop) + lift - 30) + " h28 l-6 30 h-16 Z", "#e2b035", { sw: 2 });
      s += '<g transform="translate(0 ' + f(lift) + ')">' + box(X, Y, g, o, t, xr) + '</g>'; }
    s += cab(X, Y, g, o, t, paint, b) + '</g>';
    s += wheel(X(g.fAx), r, { runflat: o.runflat, flat: o.flat === "f" || o.flat === "both", spin: o.spin }, t);
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

  // ── the build per line: a part is on from the line after the one that adds it ──
  K.steps([[2, { box: 1 }], [4, { glass: 1 }], [6, { armor: 1 }], [8, { big: 1 }], [10, { runflat: 1 }], [12, { bull: 1 }], [14, { fire: 1, fireCab: 1 }], [16, { ports: 1 }], [18, { safe: 1, safeOk: 1 }], [22, { gps: 1 }], [23, { cams: 1, radio: 1 }]]);
  var GYM = RY + 22 - 22, FY = RY;          // the man's feet on the road
  function cam(cx, z, dy) { return [cx, RY - 330 / z + (dy || 0), z]; }
  var THIEF = { base: "casual", hat: "cap", colors: { shirt: "#2b2b2e", shirtD: "#1a1a1c", pants: "#3a3a3e", pantsD: "#26262a", hat: "#1a1a1c", hatD: "#0e0e10" } };
  function thief(u, Ks, t) { Ks.forEach(function (k) { k[1].outfit = THIEF; }); return act(u, Ks, t); }
  function bullet(x0, y, x1, k) { if (k <= 0 || k >= 1) return ""; var x = lerp(x0, x1, k); return P("M" + f(x - 60) + " " + f(y) + " H" + f(x), "#ffd23a", 4, ' opacity=".7"') + F("M" + f(x) + " " + f(y - 5) + " h10 q8 5 0 10 h-10 Z", "#b87333", { sw: 1.5 }); }
  function hole(x, y, k) { return k > 0 ? C(x, y, 7, "#1e2226", { st: "#fff", sw: 2 }) + P("M" + f(x - 14) + " " + f(y - 10) + " L" + f(x + 14) + " " + f(y + 10) + " M" + f(x + 12) + " " + f(y - 12) + " L" + f(x - 12) + " " + f(y + 12), "#fff", 2) : ""; }
  function splat(x, y, k) { return k > 0 ? F("M" + f(x) + " " + f(y - 12) + " l5 8 l9 -2 l-5 8 l6 7 l-9 0 l-6 8 l-3 -9 l-9 -3 l8 -5 Z", "#9aa2ac", { sw: 1.5 }) : ""; }
  function miniCar(x, y, k) { return k > 0 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(0.32 * K.pop(k)) + ')">' + F("M-110 0 v-30 l40 -8 l36 -32 h80 l36 32 l28 8 v30 Z", "#5a8fc0", { sw: 6 }) + C(-60, 0, 20, "#26282b") + C(70, 0, 20, "#26282b") + '</g>' : ""; }
  function card(x, y, w, h, k, inner) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(K.pop(k)) + ')" filter="url(#sh)">' + R(-w / 2, -h / 2, w, h, "#f6f1e6", { rx: 18, sw: 5 }) + inner + '</g>'; }
  var XF = 900;

  // 0 — put the cash bags in a pickup and padlock it: a cash truck
  shot(0, cam(560, 1.7), cam(590, 1.55), function (u, d, t) {
    var s = scene(t, {}, { bagN: u < 1.6 ? 2 : 3 });
    s += act(u, [[0, { x: 330, y: FY, f: 1, p: "push", mood: "n" }], [1.6, { x: 340, y: FY, f: 1, p: "reach", mood: "n" }], [3.2, { x: 330, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("ربع نقل", 700, 960, u, 0.5) + pill("قفل", 400, 1010, u, 3.0, { col: "#ffd23a" }) + ring(400, 1105, 30, u, 3.0, t);
  });
  // 1 — but a thief with a hammer breaks the lock and runs off with the bags
  shot(1, cam(560, 1.35), cam(520, 1.4), function (u, d, t) {
    var s = scene(t, {}, { bagN: u < 2.4 ? 3 : 2 });
    s += act(u, [[0, { x: 935, y: FY, f: -1, p: "stand", mood: "n" }], [2.2, { x: 935, y: FY, f: -1, p: "stand", mood: "n" }], [2.6, { x: 935, y: FY, f: -1, p: "shock", mood: "shock" }]], t);
    s += thief(u, [[0, { x: -60, y: FY, f: 1 }], [1.1, { x: 340, y: FY, f: 1, p: "hammer", mood: "n" }], [2.3, { x: 340, y: FY, f: 1, p: "reach", mood: "happy" }], [2.7, { x: 340, y: FY, f: -1 }], [d, { x: -120, y: FY, f: -1 }]], t);
    if (u > 2.4) s += bagIcon(lerp(330, -110, clamp((u - 2.7) / (d - 2.7))) - 20, FY - 70, 0.8);
    return s + pill("اتسرقت!", 470, 930, u, 2.5, { bg: "#c7321f" }) + xmark(400, 1060, u, 1.7, 0.6);
  });
  // 2 — so you lower a closed steel box with no windows onto the chassis
  shot(2, cam(520, 1.5, -60), cam(540, 1.6), function (u, d, t) {
    var s = scene(t, { box: 1 }, { boxDrop: clamp((u - 0.2) / 1.8) });
    s += act(u, [[0, { x: 300, y: FY, f: 1, p: "pointUp", mood: "n" }], [1.9, { x: 300, y: FY, f: 1, p: "push", mood: "n" }], [2.8, { x: 300, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("صندوق حديد", 510, 900, u, 2.0, { col: "#ffd23a" }) + vmark(620, 1000, u, 2.6, 0.6);
  });
  // 3 — but the driver still sits behind ordinary glass, and one shot goes through
  shot(3, cam(700, 2.2, -40), cam(690, 2.4, -40), function (u, d, t) {
    var s = scene(t, {}, { crack: u > 1.4 });
    s += act(u, [[0, { x: 935, y: FY, f: -1, p: "point", mood: "n" }], [1.3, { x: 935, y: FY, f: -1, p: "point", mood: "n" }], [1.7, { x: 945, y: FY, f: -1, p: "cover", mood: "shock" }]], t);
    s += bullet(420, 1094, 679, clamp((u - 1.0) / 0.4));
    return s + pill("إزاز عادي", 680, 1000, u, 0.4, { bg: "#c7321f" }) + xmark(760, 1040, u, 1.5, 0.5);
  });
  // 4 — so you swap it for layers of glass and plastic bonded together, 4 to 7 cm thick
  shot(4, cam(700, 2.1, -80), cam(700, 2.2, -70), function (u, d, t) {
    var s = scene(t, { glass: 1 }, {});
    s += act(u, [[0, { x: 935, y: FY, f: -1, p: "reach", mood: "n" }], [2.8, { x: 935, y: FY, f: -1, p: "thumbs", mood: "happy" }]], t);
    var n = Math.min(7, Math.floor(clamp((u - 0.5) / 2) * 7) + 1), lay = "";
    for (var i = 0; i < n; i++) lay += R(-90 + i * 26, -70, i % 2 ? 10 : 16, 140, i % 2 ? "#f2e6a0" : "url(#glassC)", { sw: 2 });
    s += card(700, 900, 260, 210, clamp((u - 0.3) / 0.4), lay + T(n >= 7 ? "٤–٧ سم" : "", 0, 96, 26, "#2a2522"));
    return s + ring(696, 1040, 50, u, 0.3, t) + pill("إزاز + بلاستيك", 700, 760, u, 1.2, { col: "#ffd23a", sz: 34 });
  });
  // 5 — but the door's sheet metal is thin, and a bullet goes straight through
  shot(5, cam(650, 2.0, -30), cam(660, 2.1, -30), function (u, d, t) {
    var s = scene(t, {}, {});
    s += bullet(380, 1130, 700, clamp((u - 0.3) / 0.4)) + hole(700, 1130, u > 0.7 ? 1 : 0) + bullet(700, 1130, 1200, clamp((u - 0.7) / 0.5));
    s += act(u, [[0, { x: 1000, y: FY, f: -1, p: "stand", mood: "n" }], [0.9, { x: 1010, y: FY, f: -1, p: "cover", mood: "shock" }]], t);
    return s + pill("صاج رقيق", 690, 1010, u, 0.8, { bg: "#c7321f" }) + xmark(600, 1100, u, 1.0, 0.5);
  });
  // 6 — so you line the whole truck with hardened steel plates; a bullet hits and flattens
  shot(6, cam(520, 1.6), cam(540, 1.75), function (u, d, t) {
    var s = scene(t, { armor: 1 }, { cut: 1 });
    s += act(u, [[0, { x: 300, y: FY, f: 1, p: "hammer", mood: "n" }], [2.6, { x: 300, y: FY, f: 1, p: "hammer", mood: "n" }], [3.6, { x: 300, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    s += bullet(1250, 1050, 627, clamp((u - 3.2) / 0.5)) + splat(627, 1050, u > 3.7 ? 1 : 0);
    return s + pill("حديد مقوّى", 520, 920, u, 0.8, { col: "#ffd23a" }) + vmark(700, 990, u, 3.9, 0.55);
  });
  // 7 — but the steel is heavy, and the pickup can't carry it
  shot(7, cam(600, 1.6), cam(600, 1.7), function (u, d, t) {
    var k = ease(clamp(u / 0.8)), s = scene(t, {}, { sag: 18 * k, flat: u > 0.6 ? "both" : null });
    s += act(u, [[0, { x: 300, y: FY, f: 1, p: "stand", mood: "n" }], [0.8, { x: 300, y: FY, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("تقيل!", 600, 930, u, 0.5, { bg: "#c7321f" }) + xmark(520, 1170, u, 0.8, 0.5);
  });
  // 8 — so it all moves onto a truck chassis: about 11 t loaded, like 8 cars
  shot(8, cam(560, 1.5), cam(520, 1.3, -40), function (u, d, t) {
    var s = scene(t, {}, { big: clamp((u - 0.3) / 2.2) });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "pointUp", mood: "n" }], [2.6, { x: 190, y: FY, f: 1, p: "shock", mood: "shock" }], [4.2, { x: 190, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    for (var c = 0; c < 8; c++) s += miniCar(330 + (c % 4) * 90, 790 + Math.floor(c / 4) * 50, clamp((u - 3.0 - c * 0.12) / 0.3));
    return s + pill("١١ طن", 470, 690, u, 2.6, { col: "#ffd23a" });
  });
  // 9 — but the first shot at a tyre and the truck sits where it is
  shot(9, cam(780, 2.6, 60), cam(790, 2.8, 60), function (u, d, t) {
    var s = scene(t, {}, { flat: u > 0.5 ? "f" : null });
    s += bullet(1300, RY - 40, 830, clamp(u / 0.45));
    s += act(u, [[0, { x: 935, y: FY, f: -1, p: "stand", mood: "n" }], [0.6, { x: 945, y: FY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("بنشر!", 800, 1080, u, 0.6, { bg: "#c7321f" }) + xmark(700, 1150, u, 0.8, 0.45);
  });
  // 10 — so a hard ring inside every wheel keeps it going for tens of km: the run-flat
  shot(10, cam(800, 2.6, 60), cam(980, 2.0, 30), function (u, d, t) {
    var roll = ease(clamp((u - 2.6) / (d - 2.6))), s = scene(t, { runflat: 1 }, { runflat: clamp((u - 0.4) / 0.8), flat: "f", xf: XF + roll * 220, spin: roll * 1.5 });
    s += act(u, [[0, { x: 935, y: FY, f: -1, p: "crouch", mood: "n" }], [2.2, { x: 935, y: FY, f: -1, p: "stand", mood: "n" }], [3.4, { x: 940, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("الرن فلات", 820 + roll * 220, 1060, u, 1.0, { col: "#ffd23a" }) + ring(804 + roll * 220, RY - 39, 46, u, 0.5, t);
  });
  // 11 — but robbers can block the road with a car
  shot(11, cam(760, 1.25), cam(780, 1.3), function (u, d, t) {
    var s = scene(t, {}, {}) + car(1260, clamp(u / 0.4));
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "stand", mood: "n" }], [0.6, { x: 190, y: FY, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("الطريق اتقفل!", 1040, 980, u, 0.5, { bg: "#c7321f", sz: 34 }) + xmark(1080, 1100, u, 0.8, 0.5);
  });
  // 12 — so a heavy steel bumper up front pushes anything out of the way
  shot(12, cam(800, 1.3), cam(880, 1.25), function (u, d, t) {
    var mv = ease(clamp((u - 1.4) / 1.8)), s = scene(t, { bull: 1 }, { bull: clamp((u - 0.2) / 0.8), xf: XF + mv * 160, spin: mv }) + car(1260 + mv * 260, 1 - clamp((u - 2.6) / 0.8));
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "point", mood: "n" }], [2.8, { x: 190, y: FY, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + pill("صدّام حديد", 960 + mv * 160, 1000, u, 0.6, { col: "#ffd23a" }) + ring(930 + mv * 160, RY - 85, 60, u, 0.6, t);
  });
  // 13 — but what if they set the truck on fire to smoke you out?
  shot(13, cam(520, 1.4), cam(530, 1.45), function (u, d, t) {
    var s = scene(t, {}, {}) + flames(560, RY - 60, clamp(u / 0.6), t) + flames(760, RY - 100, clamp((u - 0.3) / 0.6), t);
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "stand", mood: "n" }], [0.5, { x: 175, y: FY, f: 1, p: "cough", mood: "sick" }]], t);
    return s + pill("نار!", 560, 880, u, 0.5, { bg: "#c7321f" });
  });
  // 14 — so a fireproof lining in the cab, and pipes that put the fire out by themselves
  shot(14, cam(470, 1.6), cam(480, 1.55), function (u, d, t) {
    var out = clamp((u - 1.4) / 1.6), s = scene(t, { fire: 1 }, { cut: 1, fire: 1, spray: u > 1.0 ? 1 : 0 }) + flames(560, RY - 60, 1 - out, t) + flames(760, RY - 100, 1 - out, t);
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "cough", mood: "sick" }], [2.4, { x: 190, y: FY, f: 1, p: "breathe", mood: "happy" }]], t);
    return s + pill("مواسير إطفا", 440, 900, u, 0.8, { col: "#ffd23a" }) + ring(440, 975, 50, u, 0.8, t);
  });
  // 15 — but to see what's outside you have to open the door
  shot(15, cam(380, 1.9), cam(370, 2.0), function (u, d, t) {
    var s = scene(t, {}, {});
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "reach", mood: "n" }], [0.9, { x: 190, y: FY, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + pill("لازم تفتح؟", 300, 900, u, 0.6, { bg: "#c7321f" }) + xmark(236, 1040, u, 1.0, 0.45);
  });
  // 16 — so small round ports in the sides that open only from inside
  shot(16, cam(420, 1.8), cam(440, 1.7), function (u, d, t) {
    var s = scene(t, { ports: 1 }, { ports: clamp((u - 0.3) / 0.6), portOpen: clamp((u - 1.8) / 0.6) - clamp((u - 3.0) / 0.5) });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "point", mood: "n" }], [2.4, { x: 190, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("فتحات من جوه بس", 430, 880, u, 0.9, { col: "#ffd23a", sz: 34 }) + ring(429, 1023, 34, u, 0.6, t);
  });
  // 17 — but if they get into the box, the money is right there
  shot(17, cam(410, 1.8), cam(400, 1.85), function (u, d, t) {
    var s = scene(t, {}, { cut: 1 });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "point", mood: "n" }], [0.8, { x: 190, y: FY, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("الفلوس قدامهم!", 400, 940, u, 0.5, { bg: "#c7321f", sz: 34 }) + xmark(560, 1060, u, 0.9, 0.5);
  });
  // 18 — so the money is locked in a safe whose lock follows GPS: it opens only at the bank
  shot(18, cam(470, 1.75), cam(400, 1.3, -30), function (u, d, t) {
    var sk = ease(clamp((u - 0.2) / 0.8)), ok = u > 3.0, s = scene(t, { safe: 1 }, { cut: 1, safeOk: ok, dial: t * 2, bankX: lerp(-700, -330, ease(clamp((u - 2.2) / 1.0))) });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "push", mood: "n" }], [2.0, { x: 190, y: FY, f: 1, p: "point", mood: "n" }], [3.3, { x: 190, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("خزنة", 560, 900, u, 0.6, { col: "#ffd23a" }) + pill(ok ? "في البنك ✓" : "بره البنك ✗", 400, 790, u, 1.4, { bg: ok ? "#2a7a46" : "#c7321f", sz: 34 }) + ring(565, 1040, 70, u, 0.6, t);
  });
  // 19 — the surprise: many people think a thief who grabs the cash case has won
  shot(19, cam(330, 1.75), cam(310, 1.85), function (u, d, t) {
    var s = scene(t, {}, {}), tx = lerp(420, 260, ease(clamp(u / 1.2)));
    s += thief(u, [[0, { x: 420, y: FY, f: -1 }], [1.2, { x: 260, y: FY, f: -1, p: "cheer", mood: "proud" }]], t) + cashCase(tx - 60, FY - 70, 0, t);
    s += act(u, [[0, { x: 60, y: FY, f: 1, p: "shrug", mood: "n" }]], t);
    return s + pill("كسب؟", 260, 900, u, 1.0);
  });
  // 20 — the truth: some cases hold ink that sprays the notes if opened wrongly
  shot(20, cam(300, 2.0), cam(290, 2.1), function (u, d, t) {
    var ink = ease(clamp((u - 0.8) / 0.6)), s = scene(t, {}, {});
    s += thief(u, [[0, { x: 220, y: FY, f: -1, p: "crouch", mood: "happy" }], [0.9, { x: 230, y: FY, f: -1, p: "shock", mood: "shock" }]], t) + cashCase(140, FY, ink, t);
    for (var n = 0; n < 6; n++) s += R(80 + n * 22, FY - 18 - n * 4, 40, 18, ink > 0.5 ? "#d8357a" : "#6aa86a", { sw: 1.5, rx: 2 });
    return s + pill("حبر!", 150, 940, u, 1.0, { col: "#ff8ac0" }) + pill("ورق ملهوش لازمة", 300, 840, u, 2.6, { bg: "#c7321f", sz: 34 });
  });
  // 21 — but what if they steal the whole truck?
  shot(21, cam(520, 1.3), cam(600, 1.25), function (u, d, t) {
    var mv = ease(clamp((u - 0.1) / 1.3)), s = scene(t, {}, { xf: XF + mv * 700, spin: mv * 3 });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "stand", mood: "n" }], [0.4, { x: 190, y: FY, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("اتخطفت!", 400, 880, u, 0.4, { bg: "#c7321f" });
  });
  // 22 — so a tracker: the company sees where the truck is and cuts the engine remotely
  shot(22, cam(800, 1.35, -60), cam(820, 1.3, -60), function (u, d, t) {
    var stop = u > 3.0, mv = ease(clamp(u / 3.0)), s = scene(t, { gps: 1 }, { gps: 1, gpsU: u, xf: XF + 300 + mv * 120, spin: mv });
    var dot = "", px = lerp(-90, 60, mv); for (var r = 0; r < 4; r++) dot += P("M" + (-110 + r * 60) + " -80 V80 M-120 " + (-60 + r * 45) + " H120", "#c9c0aa", 3);
    dot += P("M-100 40 Q-30 40 0 -10 T110 -40", "#2f6f9f", 8) + C(px, lerp(40, -30, mv), 12, "#d8352a", { st: "#fff", sw: 3 }) + T(stop ? "الموتور اتطفى" : "GPS", 0, 108, 22, stop ? "#c7321f" : "#2a2522");
    s += card(560, 760, 280, 250, clamp((u - 0.4) / 0.4), dot);
    s += act(u, [[0, { x: 470, y: FY, f: 1, p: "point", mood: "n" }], [3.2, { x: 470, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("جهاز تتبّع", 980, 880, u, 0.8, { col: "#ffd23a" });
  });
  // 23 — finishing touches: cameras on every side, a radio, and a driver who never gets out
  shot(23, cam(520, 1.55, -40), cam(530, 1.45, -40), function (u, d, t) {
    var s = scene(t, { cams: 1, radio: 1 }, {});
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "point", mood: "n" }], [2.0, { x: 190, y: FY, f: 1, p: "pointUp", mood: "n" }], [3.4, { x: 190, y: FY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كاميرات", 330, 880, u, 0.5, { col: "#ffd23a" }) + ring(222, 954, 26, u, 0.5, t) + pill("لاسلكي", 760, 820, u, 1.6, { col: "#ffd23a" }) + pill("السواق مبينزلش", 700, 960, u, 3.0, { sz: 32 });
  });
  // 24 — and congratulations: you built an armoured cash truck yourself
  shot(24, cam(470, 1.25, -40), cam(450, 1.1, -60), function (u, d, t) {
    var s = scene(t, {}, { bankX: -330 });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "cheer", mood: "proud" }]], t);
    return s + K.confetti(t, -100, 1100, 500, 1250);
  });
  // 25 — tell us what you want to know next
  shot(25, cam(450, 1.1, -60), cam(450, 1.05, -60), function (u, d, t) {
    var s = scene(t, {}, { bankX: -330 });
    s += act(u, [[0, { x: 190, y: FY, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("؟", 140, 940, u, 0.5);
  });
})();
