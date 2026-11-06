  // ── isometric version: the whole treatment plant is one diorama (river → intake → flash mixer → flocculation →
  //    sedimentation → sand filters → chlorine → clear-water tank → pump house → main to the city) and the camera
  //    travels over it; the other shots are small isometric vignettes. Three-tone shading, thin white edges. ──
  var NAVY = "#0d1a33";
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function CAM(x, y, z) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x[0], x[1], k), lerp(y[0], y[1], k), lerp(z[0], z[1], k)]; }; }
  function CI(a, b, z) { return function (u, d) { var k = ease(clamp(u / d)), A = I(a[0], a[1], a[2]), B = I(b[0], b[1], b[2]); return [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(z[0], z[1], k)]; }; }
  function grow(u, d) { return clamp(u / (d * 0.55)); }

  // projection: x runs down-right, y down-left, z up
  var OX = 0, OY = 0;
  function I(x, y, z) { return [OX + (x - y) * 0.866, OY + (x + y) * 0.5 - (z || 0)]; }
  function poly(ps, fill, o) { o = o || {}; return '<polygon points="' + ps.map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '" fill="' + fill + '" stroke="' + (o.stroke || "#fff") + '" stroke-width="' + (o.sw == null ? 1.4 : o.sw) + '" stroke-linejoin="round"' + (o.op != null ? ' opacity="' + o.op + '"' : "") + '/>'; }
  function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function shade(c, k) { var a = hx(c).map(function (v) { return Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); }); return "rgb(" + a.join(",") + ")"; }
  function box(x, y, z, w, d, h, col, o) {   // a solid block: top lighter, the +x face a bit dark, the +y face darker
    o = o || {}; var s = "";
    s += poly([I(x + w, y, z), I(x + w, y + d, z), I(x + w, y + d, z + h), I(x + w, y, z + h)], o.side || shade(col, -0.18), o);
    s += poly([I(x, y + d, z), I(x + w, y + d, z), I(x + w, y + d, z + h), I(x, y + d, z + h)], o.front || shade(col, -0.32), o);
    s += poly([I(x, y, z + h), I(x + w, y, z + h), I(x + w, y + d, z + h), I(x, y + d, z + h)], o.top || shade(col, 0.12), o);
    return s;
  }
  function basin(x, y, w, d, h, lv, t, o) {   // an open concrete basin with water at height lv
    o = o || {}; var c = "#cfd6de", s = "";
    s += poly([I(x, y, 0), I(x + w, y, 0), I(x + w, y, h), I(x, y, h)], shade(c, -0.35)) + poly([I(x, y, 0), I(x, y + d, 0), I(x, y + d, h), I(x, y, h)], shade(c, -0.25));
    var wc = o.water || "#3fb0e6";
    s += poly([I(x, y, lv), I(x + w, y, lv), I(x + w, y + d, lv), I(x, y + d, lv)], wc, { sw: 1 });
    for (var i = 0; i < 3; i++) { var k = ((t * 0.3 + i / 3) % 1); var a = I(x + w * k, y + 4, lv), b = I(x + w * k, y + d - 4, lv); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#fff" stroke-width="1.5" opacity=".45"/>'; }
    if (o.inner) s += o.inner;
    s += poly([I(x + w, y, 0), I(x + w, y + d, 0), I(x + w, y + d, h), I(x + w, y, h)], shade(c, -0.12)) + poly([I(x, y + d, 0), I(x + w, y + d, 0), I(x + w, y + d, h), I(x, y + d, h)], shade(c, -0.22));
    s += poly([I(x, y, h), I(x + w, y, h), I(x + w, y + d, h), I(x, y + d, h)], "none", { sw: 2.5 });
    return s;
  }
  function cyl(x, y, z, r, h, col, o) {   // a vertical cylinder (tank, mixer)
    o = o || {}; var b = I(x, y, z), tp = I(x, y, z + h), rx = r * 1.2247, ry = r * 0.7071;
    var s = '<path d="M' + f(b[0] - rx) + ' ' + f(b[1]) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 0 ' + f(b[0] + rx) + ' ' + f(b[1]) + ' L' + f(tp[0] + rx) + ' ' + f(tp[1]) + ' L' + f(tp[0] - rx) + ' ' + f(tp[1]) + ' Z" fill="' + shade(col, -0.2) + '" stroke="#fff" stroke-width="1.4"/>';
    s += '<rect x="' + f(b[0] - rx * 0.55) + '" y="' + f(tp[1]) + '" width="' + f(rx * 0.25) + '" height="' + f(b[1] - tp[1]) + '" fill="#fff" opacity=".18"/>';
    s += '<ellipse cx="' + f(tp[0]) + '" cy="' + f(tp[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + (o.top || shade(col, 0.15)) + '" stroke="#fff" stroke-width="1.6"/>';
    return s;
  }
  function ipipe(p3, w, col) { var p = p3.map(function (q) { return I(q[0], q[1], q[2]); }); var d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L"); return '<path d="' + d + '" stroke="#fff" stroke-width="' + (w + 3) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#9aa5b2") + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="#fff" stroke-width="' + f(w * 0.25) + '" fill="none" opacity=".35" transform="translate(0 ' + f(-w * 0.2) + ')"/>'; }
  function iflow(t, p3, col, n, sp, r) { return flow(t, p3.map(function (q) { return I(q[0], q[1], q[2]); }), col, n, sp, r); }
  function tree(x, y, s, t) { var b = I(x, y, 0), sw = Math.sin(t * 1.5 + x) * 1.5; return '<ellipse cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" rx="' + f(9 * s) + '" ry="' + f(4 * s) + '" fill="#000" opacity=".15"/><rect x="' + f(b[0] - 2 * s) + '" y="' + f(b[1] - 18 * s) + '" width="' + f(4 * s) + '" height="' + f(18 * s) + '" fill="#8a5a2b"/><circle cx="' + f(b[0] + sw) + '" cy="' + f(b[1] - 24 * s) + '" r="' + f(11 * s) + '" fill="#4fb36a" stroke="#fff" stroke-width="1.4"/><circle cx="' + f(b[0] - 3 * s + sw) + '" cy="' + f(b[1] - 27 * s) + '" r="' + f(4 * s) + '" fill="#7bd389"/>'; }
  function palmI(x, y, s, t) { var b = I(x, y, 0), sw = Math.sin(t * 1.6 + x) * 2, g = '<path d="M' + f(b[0]) + ' ' + f(b[1]) + ' Q' + f(b[0] + 3 * s) + ' ' + f(b[1] - 20 * s) + ' ' + f(b[0] + sw) + ' ' + f(b[1] - 40 * s) + '" stroke="#8a5a2b" stroke-width="' + f(4 * s) + '" fill="none"/>'; for (var i = 0; i < 6; i++) { var a = -Math.PI / 2 + (i - 2.5) * 0.6; g += '<path d="M' + f(b[0] + sw) + ' ' + f(b[1] - 40 * s) + ' q' + f(Math.cos(a) * 12 * s) + ' ' + f(Math.sin(a) * 14 * s) + ' ' + f(Math.cos(a) * 22 * s) + ' ' + f(Math.sin(a) * 10 * s + 8 * s) + '" stroke="#2f8a4a" stroke-width="' + f(4 * s) + '" fill="none" stroke-linecap="round"/>'; } return g; }
  function ground(x0, y0, x1, y1, col) { return poly([I(x0, y0, 0), I(x1, y0, 0), I(x1, y1, 0), I(x0, y1, 0)], col || "#8fd18a", { sw: 0 }); }
  function slab(x0, y0, x1, y1, th, col) { return box(x0, y0, -th, x1 - x0, y1 - y0, th, col || "#8fd18a", { top: col || "#8fd18a" }); }
  function riverI(x0, x1, y0, y1, t, muddy) {   // a river strip with moving ripples
    var c = muddy ? "#b98a5c" : "#3fb0e6", s = poly([I(x0, y0, -6), I(x1, y0, -6), I(x1, y1, -6), I(x0, y1, -6)], c, { sw: 0 });
    for (var i = 0; i < 14; i++) { var k = ((t * 0.06 + hash(i)) % 1), x = x0 + k * (x1 - x0), y = y0 + 8 + hash(i + 3) * (y1 - y0 - 16), a = I(x, y, -6), b = I(x + 26, y, -6); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>'; }
    return s;
  }
  function building(x, y, w, d, h, col, rows) {   // a block with windows on both visible faces
    var s = box(x, y, 0, w, d, h, col);
    for (var r = 0; r < (rows || 3); r++) for (var c = 0; c < 3; c++) {
      var z = 8 + r * (h - 10) / (rows || 3), xx = x + 6 + c * (w - 12) / 3, a = I(xx, y + d, z), b = I(xx + (w - 12) / 3 - 4, y + d, z), e = I(xx + (w - 12) / 3 - 4, y + d, z + 7), g = I(xx, y + d, z + 7);
      s += poly([a, b, e, g], "#ffe08a", { sw: 0, op: hash(r * 3 + c + x) > 0.4 ? 0.9 : 0.35 });
      var yy = y + 6 + c * (d - 12) / 3, a2 = I(x + w, yy, z), b2 = I(x + w, yy + (d - 12) / 3 - 4, z), e2 = I(x + w, yy + (d - 12) / 3 - 4, z + 7), g2 = I(x + w, yy, z + 7);
      s += poly([a2, b2, e2, g2], "#bfe6f7", { sw: 0, op: 0.8 });
    }
    return s;
  }
  function label(text, x, y, z, u, u0, size, col) { var p = I(x, y, z); return tag(text, p[0], p[1], u, u0, size || 9, col || NAVY); }
  function marker(x, y, z, t) { var p = I(x, y, z), k = 0.5 + 0.5 * Math.sin(t * 5); return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(6 + 6 * k) + '" fill="none" stroke="' + YEL + '" stroke-width="2" opacity="' + f(1 - k * 0.6) + '"/>'; }

  // ── the plant diorama, in world units; every shot over it draws it whole and then its own overlay ──
  function plant(t, o) {
    o = o || {}; var s = "";
    s += slab(-140, -160, 960, 420, 14, "#8fd18a");
    s += riverI(-140, 960, -150, -40, t, o.muddy);
    s += poly([I(-140, -40, -6), I(960, -40, -6), I(960, -40, 0), I(-140, -40, 0)], "#6b8f4f", { sw: 0 });
    for (var p = 0; p < 6; p++) s += palmI(-100 + p * 180, -30 + (p % 2) * 6, 0.8, t + p);
    // intake on the bank, with the bar screen facing the river
    s += box(0, -50, 0, 60, 70, 34, "#cfd6de");
    for (var b = 0; b < 6; b++) { var a1 = I(6 + b * 8, -50, 4), a2 = I(6 + b * 8, -50, 30); s += '<path d="M' + f(a1[0]) + ' ' + f(a1[1]) + ' L' + f(a2[0]) + ' ' + f(a2[1]) + '" stroke="#3b4a5a" stroke-width="2"/>'; }
    var rk = I(30, -50, 6 + ((t * 0.3) % 1) * 24); s += '<rect x="' + f(rk[0] - 20) + '" y="' + f(rk[1] - 2) + '" width="40" height="4" fill="' + ORANGE + '" stroke="#fff" stroke-width="1"/>';
    s += ipipe([[60, -10, 8], [120, -10, 8], [120, 40, 8]], 7);
    // alum store and flash mixer
    s += cyl(150, 110, 0, 16, 40, "#e8edf2") + cyl(140, 50, 0, 22, 44, "#7fb2d9");
    s += ipipe([[150, 110, 40], [150, 70, 48]], 3, "#e8edf2");
    var mx = I(140, 50, 44); s += '<g transform="translate(' + f(mx[0]) + ' ' + f(mx[1]) + ') scale(1 0.58) rotate(' + f(t * 280) + ')"><rect x="-18" y="-2" width="36" height="4" fill="#3b4a5a"/><rect x="-2" y="-18" width="4" height="36" fill="#3b4a5a"/></g>';
    s += ipipe([[162, 50, 10], [200, 50, 10]], 6);
    // flocculation basin with slow paddles
    var fl = ""; for (var q = 0; q < 3; q++) { var c = I(225 + q * 28, 70, 30); fl += '<g transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') scale(1 .5) rotate(' + f(t * 60 + q * 30) + ')"><rect x="-10" y="-1.5" width="20" height="3" fill="#fff"/><rect x="-1.5" y="-10" width="3" height="20" fill="#fff"/></g>'; }
    s += basin(200, 20, 100, 100, 36, 30, t, { water: o.floc ? "#a8875a" : "#7fa6b5", inner: fl });
    // sedimentation: long basin, water clearer towards the outlet
    s += basin(320, 20, 200, 100, 36, 30, t, { water: "#59a9cf" });
    s += poly([I(320, 20, 30), I(380, 20, 30), I(380, 120, 30), I(320, 120, 30)], "#a8875a", { sw: 0, op: 0.6 });
    // three rapid sand filters, sand showing through the water
    for (var k = 0; k < 3; k++) s += basin(540 + k * 46, 20, 40, 100, 30, 22, t, { water: k === o.clog ? "#5f9a52" : "#5bb8e0", inner: poly([I(544 + k * 46, 24, 16), I(576 + k * 46, 24, 16), I(576 + k * 46, 116, 16), I(544 + k * 46, 116, 16)], "#f2c25a", { sw: 0, op: 0.35 }) });
    // chlorine house with yellow cylinders
    s += box(690, 150, 0, 60, 50, 34, "#e8dcc4") + box(686, 146, 34, 68, 58, 6, "#8a95a3");
    for (var cy = 0; cy < 2; cy++) { var cc = I(700 + cy * 26, 210, 6); s += '<ellipse cx="' + f(cc[0]) + '" cy="' + f(cc[1]) + '" rx="12" ry="7" fill="#e9c94a" stroke="#fff" stroke-width="1.4"/>'; }
    // clear-water tank under a low grassy roof, with vents
    s += box(680, 20, 0, 130, 100, 8, "#8fd18a") + ipipe([[710, 50, 8], [710, 50, 22]], 4) + ipipe([[780, 90, 8], [780, 90, 22]], 4);
    // a road beside the main, for the traffic shots
    s += poly([I(780, 130, 0.5), I(830, 130, 0.5), I(830, 420, 0.5), I(780, 420, 0.5)], "#5b6270", { sw: 1 });
    for (var dd = 0; dd < 7; dd++) { var r1 = I(805, 140 + dd * 40 + ((t * 30) % 40), 1), r2 = I(805, 156 + dd * 40 + ((t * 30) % 40), 1); s += '<path d="M' + f(r1[0]) + ' ' + f(r1[1]) + ' L' + f(r2[0]) + ' ' + f(r2[1]) + '" stroke="#ffd166" stroke-width="2"/>'; }
    // pump house and the main leaving for the city
    s += box(830, 20, 0, 80, 80, 46, "#e8dcc4") + box(826, 16, 46, 88, 88, 6, "#d9654b");
    s += ipipe([[870, 100, 10], [870, 420, 10]], 10, "#5d7fa6");
    s += ipipe([[300, 70, 10], [320, 70, 10]], 5) + ipipe([[520, 70, 10], [540, 70, 10]], 5) + ipipe([[672, 70, 10], [690, 70, 10]], 5) + ipipe([[810, 60, 10], [830, 60, 10]], 5);
    return s;
  }
  function plantCam(x, y, z) { var p = I(x, y, z || 20); return p; }

  // lens + microscope life (shared with the realistic version)
  function lens(x, y, r, inner) { return '<clipPath id="lensC"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/></clipPath><g clip-path="url(#lensC)">' + inner + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#fff" stroke-width="7"/><circle cx="' + x + '" cy="' + y + '" r="' + (r + 9) + '" fill="none" stroke="#24476b" stroke-width="10"/>'; }
  function diatom(x, y, s, a, t) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a + Math.sin(t + x) * 4) + ') scale(' + s + ')"><path d="M-26 0 Q0 -9 26 0 Q0 9 -26 0Z" fill="#c9b45a" stroke="#fff" stroke-width="2"/>'; for (var i = -4; i <= 4; i++) g += '<path d="M' + (i * 5) + ' -5 V5" stroke="#8a7a2a" stroke-width="1.2"/>'; return g + '</g>'; }
  function silt(x0, y0, w, h, n, t, seed) { var s = ""; for (var i = 0; i < n; i++) { var x = x0 + ((hash(i + seed) * w + t * 8 * (hash(i + 2) - 0.5)) % w + w) % w, y = y0 + ((hash(i + seed + 5) * h + Math.sin(t + i) * 5) % h + h) % h; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1.4 + hash(i + 7) * 2.4) + '" fill="#8a5a2b"/>'; } return s; }
  // Africa on the ground plane (an isometric matrix over the flat map)
  var AF = [[-6, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31.5], [34, 28], [35, 24], [38, 18], [43, 12], [51, 12], [51, 10], [45, 2], [40, -3], [40, -10], [35, -20], [33, -26], [27, -34], [20, -35], [18, -30], [14, -22], [12, -15], [13, -6], [9, -1], [9, 4], [5, 4.5], [-2, 5], [-8, 4.5], [-13, 8], [-17, 14], [-17, 21], [-13, 27], [-9, 32]];
  var WHITE = [[33, -0.5], [32.5, 3.5], [31.6, 9.5], [32.5, 15.6]], BLUEN = [[37.3, 11.8], [36.2, 10.4], [35, 11.5], [33.6, 13.6], [32.5, 15.6]], MAIN = [[32.5, 15.6], [33.8, 17.7], [32, 19], [31, 20.5], [33, 22.5], [32.9, 24.1], [32.6, 25.7], [31.2, 30], [31, 31.4]];
  function mp(p) { return [(p[0] + 20) * 4.2, (38 - p[1]) * 4.2]; }   // map units (x east, y south) → world x,y
  function mapI(t, k, o) {
    o = o || {}; var s = slab(-20, -20, 340, 330, 10, "#3fb0e6");
    var land = AF.map(function (p) { var q = mp(p); return I(q[0], q[1], 0); }); s += poly(land, "#e6c88f", { sw: 2.5 });
    var hi = [[34, 14], [38, 14], [40, 9], [38, 6], [35, 8]].map(function (p) { var q = mp(p); return I(q[0], q[1], 0); }); s += poly(hi, "#a8b97a", { sw: 0 });
    var line = function (a, kk, w, col) { var p = a.map(function (q) { var m = mp(q); return I(m[0], m[1], 0); }); var d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L"); return '<path d="' + d + '" stroke="#fff" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="' + f(kk) + ' 1"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="' + f(kk) + ' 1"/>'; };
    s += line(WHITE, k, 3, "#7fc8ef") + line(BLUEN, k, 4, "#1f6fd1") + line(MAIN, k, 5, "#1f7fbf");
    var v = mp([33, -1]), vc = I(v[0], v[1], 0); s += '<ellipse cx="' + f(vc[0]) + '" cy="' + f(vc[1]) + '" rx="12" ry="7" fill="#3fb0e6" stroke="#fff" stroke-width="1.6"/>';
    var c = mp([31.2, 30]); s += box(c[0] - 4, c[1] - 4, 0, 8, 8, 14, "#ff8c1a");
    return s;
  }
  function mI(lonlat, z) { var q = mp(lonlat); return I(q[0], q[1], z || 0); }

  // 0 — the hook: an isometric kitchen corner with the tap running
  shot(0, CI([-75, -160, 80], [-60, -130, 50], [2.6, 1.8]), function (u, d, t) {
    var s = bg0();
    s += box(-200, -200, 0, 400, 12, 160, "#2a7fa1", { top: "#3a95b8" }) + box(-200, -188, 0, 12, 388, 160, "#226a88", { top: "#3a95b8" });
    s += box(-188, -188, 0, 300, 90, 60, "#e8edf2");
    s += basin(-120, -170, 90, 60, 18, 4, t, { water: "#bfe6f7" }).replace(/(points="[^"]*")/g, function (m) { return m; });
    var tap0 = [-75, -182, 60], tap1 = [-75, -182, 104], tap2 = [-75, -150, 104], tap3 = [-75, -150, 92];
    s += ipipe([tap0, tap1, tap2, tap3], 6, "#cfd6de");
    var a = I(-75, -150, 90), b = I(-75, -150, 52); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#9fe0ff" stroke-width="5" opacity=".9"/>' + flow(t, [a, b], "#fff", 4, 1.6, 1.8);
    s += cyl(-75, -150, 44, 8, 16, "#bfe6f7", { top: "#7fd3f5" });
    return s + label("الميه دي جاية منين؟", -75, -150, 135, u, 0.7, 9, ORANGE);
  });
  function bg0() { return '<rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#skyNight)"/>'; }

  // 1 — the Nile with palms and a felucca, a pipe running to a house far away
  shot(1, CI([150, 100, 0], [150, 60, 0], [1.1, 1.25]), function (u, d, t) {
    var s = bg0() + slab(-100, -100, 400, 300, 10, "#8fd18a") + riverI(-100, 400, -100, 20, t);
    for (var i = 0; i < 5; i++) s += palmI(-60 + i * 100, 30, 1, t + i);
    var bt = I(((t * 18) % 500) - 100, -40, 0); s += '<path d="M' + f(bt[0] - 14) + ' ' + f(bt[1]) + ' l28 0 l-4 5 h-20 z" fill="#c8793a" stroke="#fff" stroke-width="1.2"/><path d="M' + f(bt[0]) + ' ' + f(bt[1] - 2) + ' l0 -26 l14 22 z" fill="#fff8e6" stroke="#fff" stroke-width="1"/>';
    s += ipipe([[40, 20, 4], [40, 220, 4], [300, 220, 4]], 6) + iflow(t, [[40, 20, 4], [40, 220, 4], [300, 220, 4]], "#bfeaff", 8, 0.18, 2.5);
    s += box(300, 200, 0, 50, 50, 36, "#f2d3a8") + box(296, 196, 36, 58, 58, 5, "#d9654b");
    return s + label("من نهر بعيد جداً!", 120, 0, 60, u, 0.9, 11, ORANGE);
  });

  // 2 — a glass of river water next to a glass of tap water
  shot(2, CI([0, 0, 30], [0, 0, 20], [2.6, 2.4]), function (u, d, t) {
    var s = bg0() + slab(-80, -80, 80, 80, 6, "#24476b");
    var g1 = I(-30, 20, 0), g2 = I(30, -20, 0);
    s += cyl(-30, 20, 0, 16, 50, "#ffffff", { top: "#a8875a" }).replace(/fill="rgb\([^)]*\)"/, 'fill="#a8875a"') + silt(g1[0] - 16, g1[1] - 44, 32, 40, 14, t, 2);
    s += cyl(30, -20, 0, 16, 50, "#ffffff", { top: "#7fd3f5" }).replace(/fill="rgb\([^)]*\)"/, 'fill="#5bb8e0"') + spark(g2[0] - 6, g2[1] - 30, t, "#fff") + spark(g2[0] + 8, g2[1] - 14, t + 2, "#fff");
    return s + tag("ميه النهر", g1[0], g1[1] + 18, u, 0.5, 9, "#7a4f2a") + tag("ميه الحنفية", g2[0], g2[1] + 18, u, 1.3, 9, "#2a8fc0");
  });

  // 3 — the question over a block of water
  shot(3, CI([0, 0, 60], [0, 0, 50], [1.9, 2.2]), function (u, d, t) {
    var s = bg0() + box(-60, -60, 0, 120, 120, 40, "#3fb0e6", { top: "#7fd3f5" });
    var c = I(0, 0, 40); s += bubbles(t, c[0], c[1], 8, 0.25, 60, 2);
    return s + big("؟", c[0] + Math.sin(t * 1.4) * 4, c[1] - 30, 80, YEL) + tag("إيه الحكاية؟", c[0], c[1] - 120, u, 0.3, 14, ORANGE);
  });

  // 4 — the Nile drawn across Africa: about 6,650 km
  shot(4, CAM([0, 10], [150, 145], [0.72, 0.78]), function (u, d, t) {
    var s = bg0() + mapI(t, grow(u, d)); var c = mI([31.2, 30], 14), v = mI([33, -1]);
    return s + tag("القاهرة", c[0] + 30, c[1] - 6, u, 1.6, 11, NAVY) + tag("بحيرة فيكتوريا", v[0] + 40, v[1] + 12, u, 0.6, 11, NAVY) + big("6650 كم", c[0] - 40, c[1] - 50, 34, ORANGE);
  });

  // 5 — the two branches meeting at Khartoum
  shot(5, CAM([80, 95], [185, 170], [1.9, 2.3]), function (u, d, t) {
    var v = mI([33, -1]), kh = mI([32.5, 15.6]), ta = mI([37.3, 12]), s = bg0() + mapI(t, 1);
    s += '<circle cx="' + f(kh[0]) + '" cy="' + f(kh[1]) + '" r="' + f(3 + Math.sin(t * 4)) + '" fill="#fff"/>';
    return s + tag("النيل الأبيض", v[0] - 34, v[1] - 22, u, 0.4, 7, "#2a8fc0") + tag("النيل الأزرق", ta[0] + 30, ta[1] - 6, u, 1.2, 7, "#1f6fd1") + tag("الخرطوم", kh[0] - 30, kh[1] - 8, u, 2.0, 6, NAVY);
  });

  // 6 — 60%: two isometric columns
  shot(6, CI([0, 0, 40], [0, 0, 55], [1.6, 1.7]), function (u, d, t) {
    var g2 = grow(u, d), s = bg0() + slab(-90, -60, 90, 60, 6, "#24476b");
    s += box(-60, -20, 0, 40, 40, 140 * 0.6 * g2 + 1, "#1f5fc8") + box(20, -20, 0, 40, 40, 140 * 0.4 * g2 + 1, "#7fc8ef");
    var a = I(-40, 0, 140 * 0.6 * g2 + 20), b = I(40, 0, 140 * 0.4 * g2 + 20);
    return s + big(Math.round(60 * g2) + "%", a[0], a[1], 22, ORANGE) + big(Math.round(40 * g2) + "%", b[0], b[1], 16, "#fff") + tag("النيل الأزرق", a[0], a[1] + 100, u, 0.3, 9, "#1f5fc8") + tag("الباقي", b[0], b[1] + 90, u, 1.0, 9, NAVY);
  });

  // 7 — 80% in the flood season, the river turns brown
  shot(7, CI([0, 0, 50], [0, 0, 65], [1.6, 1.7]), function (u, d, t) {
    var g2 = grow(u, d), s = bg0() + slab(-90, -60, 90, 60, 6, "#a8875a");
    s += box(-60, -20, 0, 40, 40, 140 * 0.8 * g2 + 1, "#1f5fc8") + box(20, -20, 0, 40, 40, 140 * 0.2 * g2 + 1, "#7fc8ef");
    var a = I(-40, 0, 140 * 0.8 * g2 + 20);
    return s + big(Math.round(80 * g2) + "%", a[0], a[1], 22, ORANGE) + tag("موسم الفيضان", a[0] + 60, a[1] + 140, u, 0.6, 10, "#7a4f2a");
  });

  // 8 — a drop of Nile water under the microscope
  shot(8, CAM([180, 210], [180, 200], [1.0, 1.08]), function (u, d, t) {
    var inner = '<rect x="0" y="0" width="360" height="436" fill="#c4a06e"/>' + silt(30, 50, 300, 330, 70, t, 1) + sand(70, 90, 220, 260, 8, 5) + diatom(120, 150, 1.6, 20, t) + diatom(250, 300, 1.4, -30, t) + microbe(260, 160, 1.2, t, PINK, 1) + microbe(110, 300, 1.0, t, GREEN, 2);
    var s = '<rect x="-80" y="-80" width="520" height="600" fill="url(#skyNight)"/>' + lens(180, 220, 150, inner);
    return s + tag("طمي ورمل", 70, 70, u, 0.5, 16, "#7a4f2a") + tag("طحالب", 300, 80, u, 1.4, 16, "#3f9a55") + tag("ميكروبات", 280, 390, u, 2.2, 16, "#c2456b");
  });

  // 9..19 — over the plant diorama
  function over(target, u, d, t, o) { return bg0() + plant(t, o); }
  shot(9, function (u, d) { var a = I(-60, -120, 0), b = I(30, -30, 20), k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(1.4, 2.4, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t, { muddy: true }) + iflow(t, [[30, -120, -4], [30, -55, 4], [30, -10, 8]], "#e8c48e", 5, 0.4, 2.5) + marker(30, -50, 20, t);
    return s + label("مأخذ المية", 30, -20, 50, u, 0.4, 7) + label("الشبك بيمسك الكبير", 30, -80, 30, u, 1.4, 6);
  });
  shot(10, function (u, d) { var a = I(140, 60, 40), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.2, 2.7, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t, { floc: true }) + iflow(t, [[150, 110, 40], [150, 70, 48]], "#fff", 3, 0.6, 1.5) + marker(140, 50, 44, t);
    return s + label("الشبة", 160, 120, 52, u, 0.4, 7) + label("خلاط سريع", 120, 30, 60, u, 1.2, 6);
  });
  shot(11, function (u, d) { var a = I(250, 70, 30), b = I(420, 70, 30), k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), 1.9]; }, function (u, d, t) {
    var s = over(0, u, d, t, { floc: true });
    for (var i = 0; i < 8; i++) { var k = (t * 0.15 + i / 8) % 1, p = I(330 + k * 180, 40 + (i % 4) * 18, 30 - k * 26); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="2.5" fill="' + ORANGE + '" stroke="#fff" stroke-width=".8"/>'; }
    return s + label("التجميع", 250, 70, 60, u, 0.2, 7) + label("الترسيب", 420, 70, 60, u, 1.4, 7);
  });
  shot(12, function (u, d) { var a = I(610, 70, 20), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.0, 2.6, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t);
    for (var k = 0; k < 3; k++) { var p = I(560 + k * 46, 70, 22 - ((t * 0.8 + k / 3) % 1) * 20); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="2" fill="#bfeaff"/>'; }
    return s + label("فلاتر الرمل والزلط", 610, 70, 60, u, 0.3, 7);
  });
  shot(13, function (u, d) { var a = I(560, 70, 20), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.6, 3.0, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t, { clog: 0 }) + marker(560, 70, 24, t);
    return s + label("طحالب بتسد الفلتر", 560, 70, 50, u, 0.5, 6, "#3f9a55") + label("الجرعات بتتظبط", 600, 120, 10, u, 1.8, 6);
  });
  shot(14, function (u, d) { var a = I(720, 175, 20), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.4, 2.8, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t) + iflow(t, [[720, 150, 10], [720, 120, 10], [690, 70, 10]], "#e9f27a", 4, 0.5, 2) + marker(720, 175, 20, t);
    return s + label("الكلور", 720, 175, 60, u, 0.3, 8) + label("بيقتل الميكروبات", 720, 210, 20, u, 1.4, 6);
  });
  shot(15, function (u, d) { var a = I(870, 200, 10), b = I(870, 380, 10), k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), 2.4]; }, function (u, d, t) {
    var s = over(0, u, d, t);
    for (var i = 0; i < 8; i++) { var k = (t * 0.2 + i / 8) % 1, p = I(870, 100 + k * 320, 10); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="3.5" fill="#e9f27a" stroke="#fff" stroke-width="1"/>'; }
    return s + label("شوية كلور بيفضلوا في الميه", 870, 260, 30, u, 0.5, 6);
  });
  shot(16, function (u, d) { var a = I(745, 70, 10), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.2, 2.6, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t), g = '<g opacity=".92">' + box(690, 30, -40, 110, 80, 38, "#cfd6de") + poly([I(694, 34, -10), I(796, 34, -10), I(796, 106, -10), I(694, 106, -10)], "#3fb0e6", { sw: 1 }) + '</g>';
    return s + g + marker(745, 70, 10, t) + label("خزان تحت الأرض", 745, 70, 40, u, 0.4, 7);
  });
  shot(17, function (u, d) { var a = I(870, 60, 30), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.2, 2.6, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t) + iflow(t, [[870, 100, 10], [870, 300, 10]], "#bfeaff", 8, 0.4, 3);
    var c = I(870, 60, 52); s += '<g transform="translate(' + f(c[0]) + ' ' + f(c[1] - 14) + ') scale(.7)">' + '<circle r="10" fill="#d9483b" stroke="#fff" stroke-width="2"/><g transform="rotate(' + f(t * 300) + ')"><rect x="-1.5" y="-8" width="3" height="16" fill="#fff"/><rect x="-8" y="-1.5" width="16" height="3" fill="#fff"/></g></g>';
    return s + label("طلمبات الضغط العالي", 870, 60, 80, u, 0.4, 7);
  });
  shot(18, function (u, d) { var a = I(870, 250, 10), b = I(870, 400, 10), k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), 1.6]; }, function (u, d, t) {
    var s = over(0, u, d, t) + iflow(t, [[870, 100, 10], [870, 420, 10]], "#bfeaff", 14, 0.25, 3);
    for (var i = 0; i < 3; i++) { var k = ((t * 0.12 + i / 3) % 1); s += box(788 + (i % 2) * 22, 140 + k * 260, 1, 14, 24, 10, ["#ff7a5c", "#ffd166", "#2a8fc0"][i]); }
    return s + label("عشرات الكيلومترات", 870, 330, 30, u, 0.5, 8);
  });
  shot(19, function (u, d) { var a = I(870, 330, 10), k = ease(clamp(u / d)); return [a[0], a[1], lerp(2.2, 2.6, k)]; }, function (u, d, t) {
    var s = over(0, u, d, t) + box(880, 310, 0, 40, 40, 26, "#e8dcc4") + box(877, 307, 26, 46, 46, 4, "#8a95a3");
    s += iflow(t, [[870, 100, 10], [870, 310, 10]], "#bfeaff", 4, 0.12, 2.5) + iflow(t, [[870, 350, 10], [870, 420, 10]], "#bfeaff", 6, 0.5, 2.5) + marker(900, 330, 20, t);
    return s + label("محطة تقوية", 900, 330, 50, u, 0.3, 7);
  });

  // 20 — the apartment building: the riser up to every floor, the kitchen tap
  shot(20, CI([40, 40, 70], [40, 40, 140], [1.5, 2.0]), function (u, d, t) {
    var s = bg0() + slab(-80, -80, 200, 200, 8, "#8fd18a") + building(0, 0, 80, 80, 140, "#f2d3a8", 5);
    s += ipipe([[-80, 100, 2], [90, 100, 2], [90, 90, 2], [90, 90, 140]], 4, "#5d7fa6") + iflow(t, [[-80, 100, 2], [90, 100, 2], [90, 90, 2], [90, 90, 140]], "#bfeaff", 10, 0.3, 2);
    for (var fl = 0; fl < 5; fl++) s += ipipe([[90, 90, 12 + fl * 26], [80, 70, 12 + fl * 26]], 2.5, "#5d7fa6");
    return s + label("الحنفية اللي إنت فاتحها!", 40, 40, 170, u, 0.4, 8);
  });

  // 21 — the lab bench: turbidimeter (NTU), chlorine test vials
  shot(21, CI([0, 0, 50], [0, 0, 60], [2.2, 2.4]), function (u, d, t) {
    var s = bg0() + box(-80, -40, 0, 160, 80, 40, "#e8edf2") + box(-60, -20, 40, 50, 40, 30, "#cfd6de");
    var sc = I(-35, 20, 58); s += '<rect x="' + f(sc[0] - 22) + '" y="' + f(sc[1] - 12) + '" width="44" height="22" rx="3" fill="#0d1a33" stroke="#fff" stroke-width="1.4"/><text x="' + f(sc[0]) + '" y="' + f(sc[1] + 5) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="12" fill="' + GREEN + '">' + (u < 1.2 ? "12.0" : "0.4") + '</text>';
    var vial = ["#fff6c8", "#ffe28a", "#ffcf5a", "#ffb938"]; for (var i = 0; i < 4; i++) s += cyl(20 + i * 14, 10, 40, 4, 18, vial[i]);
    return s + tag("معمل التحاليل", sc[0] + 30, sc[1] - 50, u, 0.4, 10, NAVY) + tag("NTU", sc[0], sc[1] + 26, u, 1.0, 7, "#2a8fc0");
  });

  // 22 — back in the kitchen: the glass fills with clean water
  shot(22, CI([-75, -150, 70], [-75, -150, 50], [2.6, 3.0]), function (u, d, t) {
    var s = bg0() + box(-200, -200, 0, 400, 12, 160, "#2a7fa1", { top: "#3a95b8" }) + box(-200, -188, 0, 12, 388, 160, "#226a88", { top: "#3a95b8" }) + box(-188, -188, 0, 300, 90, 60, "#e8edf2");
    s += basin(-120, -170, 90, 60, 18, 4, t, { water: "#bfe6f7" }) + ipipe([[-75, -182, 60], [-75, -182, 104], [-75, -150, 104], [-75, -150, 92]], 6, "#cfd6de");
    var a = I(-75, -150, 90), b = I(-75, -150, 52); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#9fe0ff" stroke-width="5"/>' + flow(t, [a, b], "#fff", 4, 1.6, 1.8);
    s += cyl(-75, -150, 44, 8, 4 + 14 * grow(u, d), "#5bb8e0", { top: "#7fd3f5" }) + spark(a[0] + 20, a[1] + 10, t, "#fff");
    return s + tag("صافية ونضيفة", -40, -120, u, 0.4, 9, "#2a8fc0");
  });

  // 23 — from the Ethiopian highlands to Cairo, to your glass
  shot(23, CAM([114, 157], [175, 110], [2.4, 1.8]), function (u, d, t) {
    var s = bg0() + mapI(t, 1), path = BLUEN.concat(MAIN.slice(1, 8)).map(function (q) { return mI(q); });
    for (var i = 0; i < 6; i++) { var q = along(path, (t * 0.12 + i / 6) % 1); s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="2.5" fill="#fff"/>'; }
    var ta = mI([37.3, 12]), c = mI([31.2, 30], 14);
    return s + tag("من إثيوبيا", ta[0] + 26, ta[1] + 8, u, 0.5, 7, NAVY) + tag("لكوبايتك", c[0] + 28, c[1] - 8, u, 1.8, 7, ORANGE);
  });

  // 24 — the call to action over the river
  shot(24, CI([150, 0, 40], [150, 20, 30], [1.15, 1.25]), function (u, d, t) {
    var s = bg0() + slab(-100, -100, 400, 300, 10, "#8fd18a") + riverI(-100, 400, -100, 40, t);
    for (var i = 0; i < 5; i++) s += palmI(-60 + i * 100, 50, 1, t + i);
    var c = I(120, 0, 60);
    return s + big("قولولنا!", c[0], c[1], 40, YEL) + tag("عايزين حكاية إيه المرة الجاية؟", c[0], c[1] + 40, u, 0.8, 10, NAVY);
  });

  window.__parts = { I: I, box: box, basin: basin, cyl: cyl, ipipe: ipipe, plant: plant, mapI: mapI };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), z = c[2] * (1 + 0.03 * Math.sin(t * 1.3)), cx = c[0] + 10 * Math.sin(t * 1.7) / z, cy = c[1] + 7 * Math.cos(t * 1.7) / z;
    svg.innerHTML = '<g transform="translate(180 218) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="360" height="436" filter="url(#grain)"/>';
    return i;
  };
})();
