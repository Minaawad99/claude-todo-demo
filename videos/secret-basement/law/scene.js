/* «تعمل قبو سري إزاي؟» in the «لو» look (videos/_reference/law): one full-bleed 9:16 "2.5D" drawing (gradients, soft
   shadows, a house and the earth cut open), redrawn every frame. The build grows line by line and a jointed man in real
   proportions acts out every line: shocked on each «بس…» failure, relieved on each «عشان كده…» fix.
   World units are the 1080×1920 frame at zoom 1. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return Math.round(n * 10) / 10; }
  function pop(k) { k = clamp(k); return k < 0.7 ? ease(k / 0.7) * 1.12 : 1.12 - 0.12 * ease((k - 0.7) / 0.3); }
  var INK = "#2a2522";
  function R(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(Math.max(0, w)) + '" height="' + f(Math.max(0, h)) + '"' + (o.rx ? ' rx="' + o.rx + '"' : "") + ' fill="' + fill + '" stroke="' + (o.st || INK) + '" stroke-width="' + (o.sw == null ? 3 : o.sw) + '"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + (o.fl ? ' filter="url(#' + o.fl + ')"' : "") + '/>'; }
  function P(d, col, w, x) { return '<path d="' + d + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (x || "") + '/>'; }
  function F(d, fill, o) { o = o || {}; return '<path d="' + d + '" fill="' + fill + '" stroke="' + (o.st || INK) + '" stroke-width="' + (o.sw == null ? 3 : o.sw) + '" stroke-linejoin="round"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + (o.fl ? ' filter="url(#' + o.fl + ')"' : "") + '/>'; }
  function C(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(0, r)) + '" fill="' + fill + '" stroke="' + (o.st || "none") + '" stroke-width="' + (o.sw || 0) + '"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + '/>'; }
  function T(text, x, y, sz, col, o) { o = o || {}; return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (o.w || 900) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + (o.stroke ? ';stroke:' + o.stroke + ';stroke-width:' + f(sz / 7) + ';paint-order:stroke' : "") + '">' + text + '</text>'; }

  // ── the place ───────────────────────────────────────────
  var GY = 900, HX0 = 120, HX1 = 960, BX0 = 220, BX1 = 860, BY0 = 1200, BY1 = 1660, TH = 40, SX0 = 776, SX1 = 846, LAMP = 60, EX = 1040;
  var SOILTEX = (function () { var s = ""; for (var i = 0; i < 260; i++) { var x = -600 + hash(i) * 2300, y = GY + 50 + hash(i + 9) * 1500, rx = 14 + hash(i + 3) * 50; s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * (0.3 + hash(i + 5) * 0.3)) + '" fill="' + (hash(i + 7) > 0.5 ? "#5a3820" : "#9a6a40") + '" opacity="' + f(0.25 + hash(i + 2) * 0.3) + '"/>'; }
    for (var k = 0; k < 70; k++) { var gx = -600 + hash(k + 400) * 2300, gy = GY + 60 + hash(k + 500) * 1400, d = "M" + f(gx) + " " + f(gy); for (var j = 1; j < 6; j++) d += " q" + f(8 - hash(k + j) * 16) + " 22 " + f(4 - hash(k + j + 3) * 8) + " 44"; s += P(d, "#4a2c16", 2.4, ' opacity=".35"'); }
    for (var q = 0; q < 50; q++) { var sx = -600 + hash(q + 700) * 2300, sy = GY + 120 + hash(q + 800) * 1400, r = 8 + hash(q + 900) * 18; s += '<ellipse cx="' + f(sx) + '" cy="' + f(sy) + '" rx="' + f(r * 1.3) + '" ry="' + f(r) + '" fill="#a8927a" stroke="#5a4636" stroke-width="2" opacity=".75"/>'; }
    return s; })();
  function sky(t, night) {
    var s = '<rect x="-800" y="-900" width="2700" height="' + (GY + 900) + '" fill="url(#' + (night ? "skyN" : "sky") + ')"/>';
    if (!night) s += '<circle cx="880" cy="120" r="' + f(330 + 10 * Math.sin(t * 0.7)) + '" fill="url(#sun)"/>';
    else for (var i = 0; i < 40; i++) s += C(-500 + hash(i + 40) * 2100, -600 + hash(i + 60) * 900, 2 + hash(i) * 2, "#fff", { op: 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i)) });
    for (var c = 0; c < 6; c++) { var cx = ((-300 + c * 420 + t * 14) % 2400) - 600, cy = -300 + hash(c + 20) * 380, sc = 0.8 + hash(c + 30) * 0.7;
      s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')" opacity="' + (night ? 0.25 : 0.95) + '"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="#fff" stroke="#c9d6e2" stroke-width="3"/><path d="M-80 30 H60" stroke="#dfe7ef" stroke-width="6"/></g>'; }
    // far town, faded
    for (var b = 0; b < 16; b++) { var bx = -700 + b * 160, bh = 120 + hash(b + 70) * 180; s += R(bx, GY - bh, 130, bh, night ? "#3a4560" : "#d9cfc0", { sw: 0, op: 0.7 }); for (var w = 0; w < 4; w++) s += R(bx + 18 + (w % 2) * 56, GY - bh + 24 + Math.floor(w / 2) * 50, 34, 26, night ? (hash(b + w) > 0.5 ? "#ffd27a" : "#2a3348") : "#c4b8a6", { sw: 0, op: 0.7 }); }
    return s;
  }
  function palm(x, t, s) { var g = '<g transform="translate(' + x + ' ' + GY + ') scale(' + (s || 1) + ')"><path d="M-8 0 Q-4 -150 10 -300 L22 -300 Q10 -150 10 0 Z" fill="url(#wood)" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 6; k++) { var a = -150 + k * 60 + Math.sin(t * 1.4 + k) * 4; g += '<path d="M16 -300 Q' + f(16 + Math.cos(a * Math.PI / 180) * 80) + ' ' + f(-330 + Math.sin(a * Math.PI / 180) * 40) + ' ' + f(16 + Math.cos(a * Math.PI / 180) * 150) + ' ' + f(-300 + Math.sin(a * Math.PI / 180) * 90 + 50) + '" stroke="#3f7f2e" stroke-width="16" fill="none" stroke-linecap="round"/>'; }
    return g + '</g>'; }
  function bush(x, s) { return '<g transform="translate(' + x + ' ' + GY + ') scale(' + s + ')"><circle cx="-30" cy="-26" r="34" fill="#5a9a3e" stroke="' + INK + '" stroke-width="3"/><circle cx="18" cy="-38" r="42" fill="#6aae48" stroke="' + INK + '" stroke-width="3"/><circle cx="54" cy="-22" r="28" fill="#4f8a34" stroke="' + INK + '" stroke-width="3"/></g>'; }
  function ground(t) {
    var s = '<rect x="-800" y="' + GY + '" width="2700" height="1900" fill="url(#soil)"/>' + SOILTEX;
    s += '<rect x="-800" y="' + (GY - 10) + '" width="2700" height="22" fill="url(#grass)" stroke="' + INK + '" stroke-width="3"/>';
    for (var g = -790; g < 1900; g += 18) s += P("M" + g + " " + (GY - 8) + " l4 -14 M" + (g + 7) + " " + (GY - 8) + " l-3 -10", "#4f8a34", 3);
    return s;
  }
  // the house cut open: floor slab, walls, roof, a ceiling fan, a picture, the sofa, the rug, the bookcase (the secret door)
  function house(t, o) {
    o = o || {}; var s = '<g filter="url(#sh)">' + F("M70 430 L540 220 L1010 430 Z", "url(#roofG)") + '</g>';
    for (var r = 0; r < 6; r++) s += P("M" + (110 + r * 8) + " " + (412 - r * 32) + " L" + (970 - r * 8) + " " + (412 - r * 32), "#7a2a18", 3, ' opacity=".5"');
    s += R(HX0, 430, HX1 - HX0, GY - 430, "url(#wallIn)") + R(HX0, 430, 30, GY - 430, "url(#wallCut)") + R(HX1 - 30, 430, 30, GY - 430, "url(#wallCut)");
    s += R(HX0, 430, HX1 - HX0, 22, "#cfc3aa") + R(HX0 - 6, GY, HX1 - HX0 + 12, 44, "url(#conc)");
    s += R(230, 520, 130, 96, "#9fc6e0", { rx: 4 }) + P("M295 520 V616 M230 568 H360", "#fff", 4) + R(222, 512, 146, 112, "none", { sw: 5, st: "#8a6a4a" });
    s += R(430, 560, 110, 76, "#f4efe4", { st: "#8a5a32", sw: 6 }) + F("M440 626 L475 586 L500 610 L516 594 L532 626 Z", "#6aa0c8", { sw: 2 }) + C(512, 580, 7, "#f2c230");
    var fa = t * 9; s += P("M640 452 V490", INK, 4) + '<g transform="translate(640 494)">' + C(0, 0, 9, "#6a4a2a", { st: INK, sw: 2 }) + '<ellipse cx="' + f(Math.cos(fa) * 60) + '" cy="0" rx="' + f(Math.abs(Math.cos(fa)) * 60 + 6) + '" ry="6" fill="#8a5a32" stroke="' + INK + '" stroke-width="2"/></g>';
    // sofa upstairs
    s += '<g filter="url(#sh)">' + R(180, GY - 120, 210, 70, "url(#sofa)", { rx: 16 }) + R(170, GY - 96, 34, 96, "#36628f", { rx: 10 }) + R(366, GY - 96, 34, 96, "#36628f", { rx: 10 }) + R(196, GY - 70, 178, 46, "#4f7fb0", { rx: 10 }) + '</g>';
    // rug (lifts at its left edge)
    var rg = clamp(o.rug || 0); s += '<g transform="translate(420 ' + (GY - 6) + ') rotate(' + f(-rg * 26) + ')">' + R(0, -6, 200, 10, "#b8402a", { rx: 3 }) + P("M10 -1 H190", "#f2c230", 3, ' stroke-dasharray="8 6"') + '</g>';
    // bookcase over the shaft, hinged on its right edge
    var sh = clamp(o.shelf || 0), w = 104 * Math.cos(sh * 1.2), bx = 862;
    if (o.shaft) s += R(SX0 - 6, GY - 330, 84, 330, "#2a2018", { sw: 2 });
    s += '<g filter="url(#sh)"><g transform="translate(' + bx + ' ' + (GY - 330) + ')">' + R(-w, 0, w, 330, "url(#wood)");
    if (w > 10) for (var r2 = 0; r2 < 4; r2++) { s += R(-w + 6, r2 * 80 + 74, w - 12, 8, "#6a4220", { sw: 2 }); for (var b = 0; b < 6; b++) { var bw = (w - 16) / 6; s += R(-w + 8 + b * bw, r2 * 80 + 18 + (b % 3) * 4, bw * 0.85, 56 - (b % 3) * 4, ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a", "#9a5fb0", "#e8742e"][(b + r2) % 6], { sw: 2, rx: 2 }); } }
    if (o.book) { var pull = clamp(o.book); s += R(-w + 8 + 2 * (w - 16) / 6 - pull * 6, 98 - pull * 10, (w - 16) / 6 * 0.85, 52, "#f2c230", { sw: 3, rx: 2 }); }
    s += '</g></g>';
    if (o.bell) s += '<g transform="translate(900 ' + (GY - 380) + ')">' + C(0, 0, 18, "#f2c230", { st: INK, sw: 3 }) + C(0, 10, 4, INK) + (o.bell > 1 ? P("M-28 -10 q-8 10 0 20 M28 -10 q8 10 0 20", "#f2a030", 3) : "") + '</g>';
    return s;
  }
  // the pit before the basement exists (shot 0–1)
  function pit(t, depth, cave) { var d = depth, s = F("M430 " + GY + " Q404 " + f(GY + d * 0.6) + " 450 " + f(GY + d) + " H590 Q636 " + f(GY + d * 0.6) + " 610 " + GY + " Z", "#3a2416");
    if (cave) for (var k = 0; k < 22; k++) { var p = clamp(cave * 1.5 - k * 0.025), sx = k % 2 ? 420 : 620, ex = 470 + hash(k) * 100; s += C(lerp(sx, ex, p), lerp(GY + 20 + hash(k + 1) * d * 0.6, GY + d - 20 - hash(k + 2) * 40, p), 16 + hash(k + 3) * 12, k % 3 ? "#7a4c2a" : "#5a3820", { st: INK, sw: 2 }); }
    return s; }
  // the basement and everything that gets added to it. o = flags/progress
  function basement(t, o) {
    o = o || {}; var s = "", ox0 = BX0 - TH, ox1 = BX1 + TH, oy0 = BY0 - TH, oy1 = BY1 + TH;
    if (o.shore || o.concrete) s += R(ox0 - 14, oy0 - 14, ox1 - ox0 + 28, oy1 - oy0 + 28, "#2e1c10", { sw: 0 });
    // shoring planks (bowing when the earth pushes)
    if (o.shore) { var bow = o.bow || 0; for (var i = 0; i < 12; i++) { var y = oy0 - 10 + i * 46; s += R(ox0 - 16 + bow * Math.sin(i / 11 * Math.PI) * 14, y, 18, 42, "url(#plank)", { sw: 2 }) + R(ox1 - 2 - bow * Math.sin(i / 11 * Math.PI) * 14, y, 18, 42, "url(#plank)", { sw: 2 }); }
      s += R(ox0 + 4, oy0 + 160, ox1 - ox0 - 8, 14, "url(#plank)", { sw: 2, op: o.concrete >= 1 ? 0 : 1 }); }
    if (o.membrane) { var mk = clamp(o.membrane); s += '<rect x="' + (ox0 - 8) + '" y="' + (oy0 - 8) + '" width="' + (ox1 - ox0 + 16) + '" height="' + (oy1 - oy0 + 16) + '" rx="6" fill="none" stroke="#141414" stroke-width="12" stroke-dasharray="' + f(3000 * mk) + ' 4000"/>'; }
    if (o.concrete) { var k = clamp(o.concrete), hh = (oy1 - oy0) * k;
      s += '<g filter="url(#sh)">' + R(ox0, oy1 - hh, ox1 - ox0, hh, "url(#conc)") + '</g>';
      for (var q = 0; q < 40; q++) { var cx = ox0 + hash(q + 20) * (ox1 - ox0), cy = oy0 + hash(q + 30) * (oy1 - oy0); if (cy > oy1 - hh) s += C(cx, cy, 2.4, "#8d8a82"); }
      if (k < 1) s += R(ox0, oy1 - hh - 6, ox1 - ox0, 10, "#9a958c", { sw: 0, op: 0.8 });
      if (k >= 1) { var reb = ""; for (var rx = ox0 + 14; rx < ox1; rx += 34) reb += "M" + rx + " " + (oy0 + 8) + " v" + (TH - 16) + " M" + rx + " " + (oy1 - TH + 8) + " v" + (TH - 16) + " "; s += P(reb, "#8a3a22", 3, ' opacity=".55"'); } }
    // the room
    if (o.room) { s += R(BX0, BY0, BX1 - BX0, BY1 - BY0, o.led ? "url(#roomLit)" : "url(#room)", { sw: 3 }) + R(BX0, BY1 - 16, BX1 - BX0, 16, "#9a8a70", { sw: 2 });
      for (var tl = BX0 + 40; tl < BX1; tl += 80) s += P("M" + tl + " " + (BY1 - 16) + " v16", "#7a6a50", 2); }
    if (o.mold) for (var m = 0; m < 16; m++) { var mx = BX0 + 20 + hash(m + 50) * (BX1 - BX0 - 40), my = BY0 + 30 + hash(m + 60) * 260, mr = (10 + hash(m + 70) * 22) * clamp(o.mold); s += C(mx, my, mr, "#4f7a3a", { op: 0.7 }) + C(mx + mr * 0.5, my + mr * 0.4, mr * 0.55, "#2f5a22", { op: 0.75 }); }
    if (o.wool) { var wk = clamp(o.wool), d1 = ""; s += R(BX0, BY0, (BX1 - BX0) * wk, 30, "#f2c94a", { sw: 2 }) + R(BX0, BY0, 24, (BY1 - BY0 - 16) * wk, "#f2c94a", { sw: 2 }) + R(BX1 - 24, BY0, 24, (BY1 - BY0 - 16) * wk, "#f2c94a", { sw: 2 });
      for (var x = BX0 + 10; x < BX0 + (BX1 - BX0) * wk - 10; x += 18) d1 += "M" + x + " " + (BY0 + 5) + " q8 10 0 20 "; s += P(d1, "#c99a2a", 2.4); }
    if (o.cracks) [[400, 0], [560, 1], [700, 2]].forEach(function (c) { s += P("M" + c[0] + " " + (BY1 - 16) + " l6 5 l-8 5 l6 6", o.sealed ? "#8a8a8a" : "#1a1a1a", o.sealed ? 9 : 3); });
    // shaft and ladder up to the bookcase
    if (o.shaft) { s += R(SX0, GY + 44, SX1 - SX0, oy0 - GY - 44, "#2a2018", { sw: 2 }) + R(SX0, oy0, SX1 - SX0, TH, "#2a2018", { sw: 0 }); }
    if (o.ladder) { var lad = ""; for (var y2 = GY + 20; y2 < BY1 - 20; y2 += 34) lad += "M" + (SX0 + 8) + " " + y2 + " H" + (SX1 - 8) + " "; s += P(lad, "#c99a5a", 6) + P("M" + (SX0 + 8) + " " + (GY - 20) + " V" + (BY1 - 16) + " M" + (SX1 - 8) + " " + (GY - 20) + " V" + (BY1 - 16), "#8a6a3a", 8); }
    // drain under the floor into a sump with a pump; discharge up the outside to the garden
    if (o.drain) { var dk = clamp(o.drain); s += P("M" + (BX1 + 20) + " " + (oy1 + 30) + " H" + f(lerp(BX1 + 20, BX0 + 60, dk)), "#6a7078", 22) + P("M" + (BX1 + 20) + " " + (oy1 + 30) + " H" + f(lerp(BX1 + 20, BX0 + 60, dk)), "url(#pipeH)", 14);
      for (var ho = 0; ho < 8; ho++) { var hx = BX1 - ho * 70; if (hx > lerp(BX1 + 20, BX0 + 60, dk)) s += C(hx, oy1 + 30, 3, "#3a3f46"); } }
    if (o.pump) { var pk = clamp(o.pump); s += R(BX0 + 10, BY1 - 16, 100, 90, "#5a5f66", { sw: 3 }) + '<g transform="translate(' + (BX0 + 60) + ' ' + f(lerp(BY1 - 200, BY1 + 30, ease(pk))) + ')">' + R(-30, -22, 60, 50, "#2f6f9f", { rx: 8 }) + C(0, 2, 13, "#e9ebee", { st: INK, sw: 2 }) + P("M0 2 l" + f(Math.cos(t * 9) * 10) + " " + f(Math.sin(t * 9) * 10), INK, 3) + '</g>';
      if (pk >= 1) { var dd = "M" + (BX0 + 60) + " " + (BY1 + 8) + " V" + (BY1 - 40) + " H" + (ox0 - 50) + " V1060 H-40 V" + (GY - 4); s += P(dd, "#6a7078", 20) + P(dd, "url(#pipe)", 12); } }
    if (o.flow) for (var wv = 0; wv < 8; wv++) { var fp = (t * 0.45 + wv / 8) % 1; s += C(lerp(BX1 + 10, BX0 + 70, fp), oy1 + 30, 6, "#3f8fc8", { st: "#fff", sw: 1.5 }); var up = (t * 0.6 + wv / 8) % 1, ux, uy; if (up < 0.5) { ux = ox0 - 50; uy = lerp(BY1 - 40, 1060, up / 0.5); } else { ux = lerp(ox0 - 50, -40, (up - 0.5) / 0.5); uy = 1060; } s += C(ux, uy, 6, "#3f8fc8", { st: "#fff", sw: 1.5 }); }
    // air pipe from the ceiling up and across into a lamp post in the garden
    if (o.vent) { var vk = clamp(o.vent), vd = "M300 " + oy0 + " V1010 H" + LAMP + " V" + (GY - 300); s += '<path d="' + vd + '" stroke="#5a6068" stroke-width="30" fill="none" stroke-dasharray="' + f(1500 * vk) + ' 3000"/><path d="' + vd + '" stroke="url(#pipe)" stroke-width="20" fill="none" stroke-dasharray="' + f(1500 * vk) + ' 3000"/>'; }
    if (o.fan) { var fa = t * 12; s += R(262, BY0 + 2, 76, 50, "#5d93ad", { rx: 6 }) + '<g transform="translate(300 ' + (BY0 + 27) + ')">'; for (var bl = 0; bl < 3; bl++) s += '<path d="M0 0 L20 -6 L20 6 Z" fill="#e9ebee" stroke="' + INK + '" stroke-width="1.5" transform="rotate(' + f(fa * 57 + bl * 120) + ')"/>'; s += '</g>'; }
    if (o.air) for (var ai = 0; ai < 12; ai++) { var ap = (t * 0.25 + ai / 12) % 1, L1 = oy0 - 1010, L2 = 300 - LAMP, L3 = 1010 - (GY - 300), tot = L1 + L2 + L3, dd2 = ap * tot, ax, ay;
      if (dd2 < L1) { ax = 300; ay = oy0 - dd2; } else if (dd2 < L1 + L2) { ax = 300 - (dd2 - L1); ay = 1010; } else { ax = LAMP; ay = 1010 - (dd2 - L1 - L2); }
      s += C(ax, ay, 6, o.radonOut ? "#b07ad8" : "#d6ecff", { st: INK, sw: 1.5 }); }
    // emergency crawl tunnel out to a hatch in the garden
    if (o.escape) { var ek = clamp(o.escape), top = lerp(BY1 - 60, GY - 4, ek), ed = "M" + ox1 + " " + (BY1 - 60) + " H" + EX + " V" + f(top);
      s += '<path d="' + ed + '" stroke="#2a2018" stroke-width="96" fill="none"/><path d="' + ed + '" stroke="url(#conc)" stroke-width="84" fill="none"/><path d="' + ed + '" stroke="#3a2c20" stroke-width="64" fill="none"/>';
      for (var ey = BY1 - 90; ey > top; ey -= 34) s += P("M" + (EX - 24) + " " + ey + " H" + (EX + 24), "#e2b035", 6);
      if (ek >= 1) s += '<ellipse cx="' + EX + '" cy="' + (GY - 8) + '" rx="60" ry="14" fill="#3a6a3a" stroke="' + INK + '" stroke-width="3"/>'; }
    // furniture and finishing touches
    if (o.dehum) { var hk = clamp(o.dehum), hy = lerp(BY0 - 160, BY1 - 136, ease(hk)); s += '<g filter="url(#sh)">' + R(690, hy, 70, 120, "#eef0f2", { rx: 8 }) + R(700, hy + 12, 50, 30, "#1e2a30", { rx: 4, sw: 2 }) + T(o.hum || "45%", 725, hy + 35, 20, "#7cf2a0") + R(700, hy + 70, 50, 38, "#9fd0f0", { rx: 4, sw: 2 }) + '</g>';
      for (var dv = 0; dv < 3; dv++) { var dp = (t * 0.8 + dv / 3) % 1; s += P("M" + (705 + dv * 18) + " " + f(hy - 6 - dp * 34) + " q6 -8 0 -16", "#bfe0ff", 4, ' opacity="' + f(1 - dp) + '"'); } }
    if (o.led) { s += R(BX0 + 30, BY0 + (o.wool ? 34 : 6), BX1 - BX0 - 60, 8, "#fff6c0", { sw: 0 }) + '<rect x="' + BX0 + '" y="' + BY0 + '" width="' + (BX1 - BX0) + '" height="300" fill="url(#warm)"/>'; }
    if (o.desk) s += '<g filter="url(#sh)">' + R(260, BY1 - 110, 190, 16, "url(#wood)") + R(270, BY1 - 94, 14, 78, "#6a4220", { sw: 2 }) + R(426, BY1 - 94, 14, 78, "#6a4220", { sw: 2 }) + R(380, BY1 - 160, 50, 50, "#2b2e33", { rx: 4 }) + R(386, BY1 - 154, 38, 34, "#5aa8d8", { sw: 0 }) + '</g>';
    if (o.safe) s += '<g filter="url(#sh)">' + R(560, BY0 + 110, 96, 96, "#4a5058", { rx: 6 }) + C(608, BY0 + 158, 20, "#9aa2ac", { st: INK, sw: 3 }) + P("M608 " + (BY0 + 158) + " l" + f(Math.cos(t * 2) * 14) + " " + f(Math.sin(t * 2) * 14), INK, 3) + '</g>';
    if (o.radon) { var rk = clamp(o.radon); for (var ri = 0; ri < 44; ri++) { var rp = (t * 0.2 + hash(ri + 80)) % 1, rx2 = BX0 + 20 + hash(ri + 90) * (BX1 - BX0 - 40), ry = lerp(BY1 + 260, BY0 + 30, rp), inR = ry < BY1 - 16; if (o.sealed && inR) continue; s += C(rx2 + Math.sin(t * 2 + ri) * 8, ry, 6 + hash(ri) * 4, "#b07ad8", { op: rk * (inR ? 0.85 : 0.6) }); } }
    return s;
  }
  function waterTable(t, k) { if (k <= 0) return ""; var wy = lerp(1950, 1440, ease(k)), d = "M-800 " + f(wy); for (var x = -800; x <= 1900; x += 30) d += " L" + x + " " + f(wy + Math.sin(x * 0.03 + t * 2.4) * 8); return '<path d="' + d + ' V3000 H-800 Z" fill="url(#water)"/>' + P(d, "#cfe9ff", 4); }

  // ── the man: a jointed figure in real proportions (8 heads tall), angles per joint, a face with moods ──
  var POSES = {
    stand: { lean: 0, head: 0, aN: [6, 12], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] },
    shock: { lean: -14, head: -10, aN: [150, 168], aF: [138, 160], lN: [14, 6], lF: [-16, -6] },
    cover: { lean: 16, head: 14, aN: [158, 262], aF: [150, 250], lN: [16, -8], lF: [-6, -12] },
    cheer: { lean: -6, head: -10, aN: [172, 178], aF: [30, 60], lN: [6, 2], lF: [-6, -2] },
    thumbs: { lean: -4, head: -4, aN: [36, 150], aF: [-6, -2], lN: [4, 2], lF: [-4, -2], thumb: 1 },
    point: { lean: 4, head: 0, aN: [96, 98], aF: [-8, -4], lN: [6, 2], lF: [-6, -2] },
    pointUp: { lean: -8, head: -20, aN: [150, 160], aF: [-8, -4], lN: [6, 2], lF: [-6, -2] },
    worry: { lean: 6, head: 6, aN: [24, 168], aF: [20, 162], lN: [4, 2], lF: [-4, -2] },
    cough: { lean: 26, head: 18, aN: [44, 168], aF: [30, 70], lN: [10, 0], lF: [-6, -4] },
    push: { lean: 22, head: 4, aN: [82, 92], aF: [76, 86], lN: [20, 4], lF: [-24, -16] },
    breathe: { lean: -10, head: -16, aN: [108, 118], aF: [-70, -60], lN: [4, 2], lF: [-4, -2] },
    shrug: { lean: 0, head: 8, aN: [36, 120], aF: [-30, -110], lN: [4, 2], lF: [-4, -2] },
    collar: { lean: 8, head: 12, aN: [36, 172], aF: [10, 30], lN: [6, 2], lF: [-4, -2] },
    wave: { lean: -4, head: -4, aN: [150, 190], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] },
    reach: { lean: -6, head: -24, aN: [158, 160], aF: [20, 40], lN: [4, 2], lF: [-4, -2] },
    crouch: { lean: 34, head: 10, aN: [66, 90], aF: [50, 80], lN: [96, -6], lF: [70, -24] },
    sit: { lean: -6, head: 0, aN: [16, 84], aF: [10, 76], lN: [90, 4], lF: [86, 0] },
    sitDesk: { lean: 4, head: 6, aN: [30, 92], aF: [24, 88], lN: [90, 4], lF: [86, 0] },
    ear: { lean: 30, head: 30, aN: [20, 170], aF: [-10, 0], lN: [10, 0], lF: [-10, -6] },
    hush: { lean: 6, head: 6, aN: [30, 172], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] }
  };
  function walkP(ph) { var a = Math.sin(ph * Math.PI * 2) * 26, b = Math.sin(ph * Math.PI * 2 + Math.PI) * 26; return { lean: 4, head: 0, aN: [-a * 0.8, -a * 0.6 + 14], aF: [-b * 0.8, -b * 0.6 + 14], lN: [a, a - Math.max(0, -Math.sin(ph * Math.PI * 2)) * 34], lF: [b, b - Math.max(0, Math.sin(ph * Math.PI * 2)) * 34] }; }
  function digP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 24 + s * 12, head: 10, aN: [70 + s * 30, 110 + s * 20], aF: [40 + s * 30, 90 + s * 20], lN: [24, 4], lF: [-18, -8], shovel: 1 }; }
  function climbP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 0, head: -6, aN: [160 + s * 14, 170 + s * 10], aF: [150 - s * 14, 165 - s * 10], lN: [50 + s * 40, -10 + s * 10], lF: [50 - s * 40, -10 - s * 10] }; }
  function hammerP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 10, head: 4, aN: [110 + s * 40, 150 + s * 50], aF: [60, 80], lN: [8, 2], lF: [-8, -4], hammer: 1 }; }
  function caulkP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 34, head: 14, aN: [80 + s * 10, 100 + s * 10], aF: [60, 90], lN: [96, -6], lF: [70, -24], caulk: 1 }; }
  function mixPose(a, b, k) { var o = {}; for (var key in a) { var va = a[key], vb = b[key] == null ? va : b[key]; o[key] = Array.isArray(va) ? [lerp(va[0], vb[0], k), lerp(va[1], vb[1], k)] : (typeof va === "number" ? lerp(va, vb, k) : (k < 0.5 ? va : vb)); } for (var k2 in b) if (o[k2] == null) o[k2] = b[k2]; return o; }
  function pose(name, ph) { if (typeof name === "object") return name; if (name === "walk") return walkP(ph); if (name === "dig") return digP(ph); if (name === "climb") return climbP(ph); if (name === "hammer") return hammerP(ph); if (name === "caulk") return caulkP(ph); return POSES[name] || POSES.stand; }
  function dirv(a, fc) { var r = a * Math.PI / 180; return [fc * Math.sin(r), Math.cos(r)]; }
  function add(p, d, l) { return [p[0] + d[0] * l, p[1] + d[1] * l]; }
  function limb(pts, w0, w1, col, dark) { var s = "", d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) d += " L" + f(pts[i][0]) + " " + f(pts[i][1]);
    return P(d, INK, (w0 + w1) / 2 + 6) + P(d, dark || col, (w0 + w1) / 2) + P(d, col, (w0 + w1) / 2 - 7, ' opacity=".9"'); }
  function face(c, fc, mood, t, sc) {
    var s = "", x = c[0], y = c[1], blink = (t % 3.4) < 0.12;
    s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="30" ry="36" fill="url(#skin)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<ellipse cx="' + f(x - fc * 24) + '" cy="' + f(y + 2) + '" rx="8" ry="11" fill="#d39a70" stroke="' + INK + '" stroke-width="2.4"/>';
    s += F("M" + f(x - 31) + " " + f(y - 4) + " Q" + f(x - 30) + " " + f(y - 44) + " " + f(x + 4) + " " + f(y - 42) + " Q" + f(x + 32) + " " + f(y - 40) + " " + f(x + 31) + " " + f(y - 10) + " Q" + f(x + fc * 10) + " " + f(y - 26) + " " + f(x - fc * 20) + " " + f(y - 14) + " Q" + f(x - fc * 26) + " " + f(y - 4) + " " + f(x - fc * 26) + " " + f(y + 8) + " Z", "#2a1a12", { sw: 2.4 });
    var e1 = x + fc * 12, e2 = x - fc * 6, ey = y - 4, big = mood === "shock", sq = mood === "happy" || mood === "proud";
    [e1, e2].forEach(function (ex, i) { var r = i ? 0.82 : 1;
      if (blink || sq) s += P("M" + f(ex - 6 * r) + " " + f(ey + 1) + " q" + f(6 * r) + " -7 " + f(12 * r) + " 0", INK, 3);
      else if (mood === "dizzy" || mood === "sick") s += P("M" + f(ex - 6 * r) + " " + f(ey) + " h" + f(12 * r), INK, 3.4);
      else s += '<ellipse cx="' + f(ex) + '" cy="' + f(ey) + '" rx="' + f((big ? 8 : 5.6) * r) + '" ry="' + f((big ? 9 : 6.4) * r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>' + C(ex + fc * 1.6, ey + 0.6, (big ? 2.8 : 3.2) * r, "#2a1a12");
      var bu = mood === "shock" ? -12 : mood === "worry" || mood === "sick" ? -6 : -9, bt = mood === "worry" || mood === "sick" ? (i ? 4 : -4) * fc : 0, ang = mood === "angry" ? 4 : 0;
      s += P("M" + f(ex - 8 * r) + " " + f(ey + bu - bt + ang) + " L" + f(ex + 8 * r) + " " + f(ey + bu + bt - ang), "#2a1a12", 4); });
    s += P("M" + f(x + fc * 22) + " " + f(y - 2) + " q" + f(fc * 10) + " 8 " + f(fc * 2) + " 12", INK, 2.8);
    s += P("M" + f(x + fc * 2) + " " + f(y + 15) + " q" + f(fc * 10) + " -4 " + f(fc * 20) + " 0", "#3a2418", 4.4);
    var mx = x + fc * 10, my = y + 23;
    if (mood === "shock") s += '<ellipse cx="' + f(mx) + '" cy="' + f(my + 2) + '" rx="6" ry="8" fill="#5a1a14" stroke="' + INK + '" stroke-width="2"/>';
    else if (mood === "happy" || mood === "proud") s += F("M" + f(mx - 10) + " " + f(my - 2) + " Q" + f(mx) + " " + f(my + 12) + " " + f(mx + 10) + " " + f(my - 2) + " Z", "#7a2a1e", { sw: 2 });
    else if (mood === "worry" || mood === "dizzy") s += P("M" + f(mx - 9) + " " + f(my + 2) + " q4 -5 9 0 q4 5 9 0", INK, 2.6);
    else if (mood === "sick") s += '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1) + '" rx="7" ry="5" fill="#5a1a14" stroke="' + INK + '" stroke-width="2"/>';
    else s += P("M" + f(mx - 8) + " " + f(my) + " q8 6 16 0", INK, 2.8);
    if (mood === "shock" || mood === "worry" || mood === "dizzy") { var sw = (t * 1.3) % 1; s += F("M" + f(x - fc * 30) + " " + f(y - 30 + sw * 20) + " q-7 12 0 15 q7 -3 0 -15 Z", "#9fd6ff", { sw: 1.6, op: 1 - sw }); }
    if (mood === "sick") s += C(x + fc * 16, y + 10, 7, "#e88a8a", { op: 0.6 });
    return s;
  }
  // o: x, y (feet on ground y), f (facing ±1), p (pose name/obj), ph, mood, s (scale), hip ([x,y] fixed hip, for sitting/climbing), shirt
  function man(o) {
    var fc = o.f || 1, s = o.s || 1, p = o.pose, mood = o.mood || "n", t = o.t || 0;
    var Lt = 112, Lth = 84, Lsh = 80, Lu = 64, Ll = 60;
    var H = [0, 0], S = add(H, dirv(180 + p.lean, fc), Lt), N = add(S, dirv(180 + p.lean, fc), 14), Hd = add(N, dirv(180 + p.lean + p.head, fc), 34);
    function leg(a) { var K = add(H, dirv(a[0], fc), Lth), A = add(K, dirv(a[1], fc), Lsh); return [H, K, A]; }
    function arm(a) { var E = add(S, dirv(a[0], fc), Lu), W = add(E, dirv(a[1], fc), Ll); return [S, E, W]; }
    var lN = leg(p.lN), lF = leg(p.lF), aN = arm(p.aN), aF = arm(p.aF);
    var ox = o.hip ? o.hip[0] : o.x, oy = o.hip ? o.hip[1] : o.y - Math.max(lN[2][1], lF[2][1]) * s - 12 * s;
    var g = '<g transform="translate(' + f(ox) + ' ' + f(oy) + ') scale(' + f(s) + ')" filter="url(#sh)">';
    var shirt = o.shirt || "url(#shirt)", shirtD = o.shirtD || "#24507a";
    function shoe(A, a) { var d = dirv(a + 90, fc), q = add(A, d, 30); return '<path d="M' + f(A[0] - fc * 8) + ' ' + f(A[1] - 4) + ' L' + f(q[0]) + ' ' + f(q[1] - 2) + ' Q' + f(q[0] + fc * 8) + ' ' + f(q[1] + 10) + ' ' + f(q[0] - fc * 4) + ' ' + f(q[1] + 12) + ' L' + f(A[0] - fc * 10) + ' ' + f(A[1] + 12) + ' Z" fill="#4a2c18" stroke="' + INK + '" stroke-width="3"/>'; }
    function hand(W, open) { return C(W[0], W[1], 11, "url(#skin)", { st: INK, sw: 2.6 }); }
    function armDraw(a, far) { var mid = [lerp(a[0][0], a[1][0], 0.55), lerp(a[0][1], a[1][1], 0.55)]; return limb([a[0], mid], 26, 24, far ? shirtD : shirt, shirtD) + limb([mid, a[1], a[2]], 20, 17, far ? "#b8805a" : "url(#skin)", "#b8805a") + hand(a[2]); }
    g += limb([lF[0], lF[1], lF[2]], 34, 26, "#3e372c", "#3e372c") + shoe(lF[2], p.lF[1]);
    g += armDraw(aF, true);
    // torso: a tapered shape from the hips to the shoulders, shirt with a collar and a belt
    var tv = dirv(180 + p.lean, fc), nv = [tv[1] * fc, -tv[0] * fc], wS = 30, wH = 26;
    var p1 = [H[0] + nv[0] * wH * fc, H[1] + nv[1] * wH * fc], p2 = [H[0] - nv[0] * wH * fc, H[1] - nv[1] * wH * fc], p3 = [S[0] - nv[0] * wS * fc, S[1] - nv[1] * wS * fc], p4 = [S[0] + nv[0] * wS * fc, S[1] + nv[1] * wS * fc];
    g += F("M" + f(p1[0]) + " " + f(p1[1]) + " L" + f(p2[0]) + " " + f(p2[1]) + " L" + f(p3[0]) + " " + f(p3[1]) + " Q" + f(S[0] + tv[0] * 14) + " " + f(S[1] + tv[1] * 14) + " " + f(p4[0]) + " " + f(p4[1]) + " Z", shirt);
    g += P("M" + f(p1[0]) + " " + f(p1[1]) + " L" + f(p2[0]) + " " + f(p2[1]), "#3a2c20", 9);
    if (o.vest) g += F("M" + f(lerp(p1[0], p4[0], 0.1)) + " " + f(lerp(p1[1], p4[1], 0.1)) + " L" + f(lerp(p2[0], p3[0], 0.1)) + " " + f(lerp(p2[1], p3[1], 0.1)) + " L" + f(lerp(p2[0], p3[0], 0.9)) + " " + f(lerp(p2[1], p3[1], 0.9)) + " L" + f(lerp(p1[0], p4[0], 0.9)) + " " + f(lerp(p1[1], p4[1], 0.9)) + " Z", "url(#vest)", { sw: 2.4 });
    g += limb([lN[0], lN[1], lN[2]], 36, 28, "url(#pants)", "#3e372c") + shoe(lN[2], p.lN[1]);
    g += limb([S, N], 18, 18, "url(#skin)", "#b8805a");
    g += face(Hd, fc, mood, t, s);
    if (o.hat) g += F("M" + f(Hd[0] - 36) + " " + f(Hd[1] - 14) + " Q" + f(Hd[0]) + " " + f(Hd[1] - 70) + " " + f(Hd[0] + 36) + " " + f(Hd[1] - 14) + " Z", "#f2c230") + R(Hd[0] - 44, Hd[1] - 18, 88, 10, "#d9a820", { rx: 4, sw: 2.4 });
    g += armDraw(aN, false);
    if (p.thumb) g += R(aN[2][0] - 4, aN[2][1] - 26, 9, 18, "url(#skin)", { rx: 4, sw: 2.4 });
    if (p.shovel) { var a2 = aN[2], b2 = aF[2], dv = [a2[0] - b2[0], a2[1] - b2[1]], ln = Math.hypot(dv[0], dv[1]) || 1, u = [dv[0] / ln, dv[1] / ln], tip = [a2[0] + u[0] * 90, a2[1] + u[1] * 90], back = [b2[0] - u[0] * 60, b2[1] - u[1] * 60];
      g += P("M" + f(back[0]) + " " + f(back[1]) + " L" + f(tip[0]) + " " + f(tip[1]), "#8a5a30", 9) + '<g transform="translate(' + f(tip[0]) + ' ' + f(tip[1]) + ') rotate(' + f(Math.atan2(u[1], u[0]) * 180 / Math.PI - 90) + ')">' + F("M-20 0 L20 0 L16 40 Q0 52 -16 40 Z", "#9aa2ac") + '</g>'; }
    if (p.hammer) { var hw = aN[2]; g += '<g transform="translate(' + f(hw[0]) + ' ' + f(hw[1]) + ') rotate(' + f((p.aN[1]) * fc + 180) + ')">' + R(-5, 0, 10, 60, "#8a5a30", { sw: 2 }) + R(-20, 54, 40, 18, "#5a6068", { sw: 2 }) + '</g>'; }
    if (p.caulk) { var cw = aN[2]; g += '<g transform="translate(' + f(cw[0]) + ' ' + f(cw[1]) + ') rotate(' + f(fc * 70) + ')">' + R(-8, -10, 16, 56, "#e2b035", { sw: 2 }) + F("M-4 46 L4 46 L0 62 Z", "#ddd", { sw: 2 }) + '</g>'; }
    if (o.phone) { var pw = aN[2]; g += R(pw[0] - 10, pw[1] - 30, 20, 34, "#1e2226", { rx: 3, sw: 2 }) + R(pw[0] - 7, pw[1] - 27, 14, 26, "#7ac8ff", { sw: 0 }); }
    return g + '</g>';
  }
  // keyframed acting: K = [[u, {x, y, f, p, mood, ...}], ...]; position eases between keys, the pose blends over the last 0.45 s
  function act(u, K, t) {
    var i = 0; while (i < K.length - 1 && K[i + 1][0] <= u) i++;
    var a = K[i][1], b = i + 1 < K.length ? K[i + 1][1] : a, ua = K[i][0], ub = i + 1 < K.length ? K[i + 1][0] : ua + 1;
    var kpos = b.jump ? (u >= ub ? 1 : 0) : ease((u - ua) / Math.max(0.01, ub - ua)), x = lerp(a.x, b.x == null ? a.x : b.x, kpos), y = lerp(a.y, b.y == null ? a.y : b.y, kpos);
    var moving = Math.abs((b.x == null ? a.x : b.x) - a.x) > 4 && !a.p, ph = x / 150;
    var pa = moving ? pose("walk", ph) : pose(a.p || "stand", u * (a.rate || 1.2)), pb = b.p ? pose(b.p, u * (b.rate || 1.2)) : pa;
    var bk = clamp((u - (ub - 0.45)) / 0.45), pz = mixPose(pa, pb, ease(bk));
    if (!moving && (a.p || "stand") === "stand") { pz = mixPose(pz, { lean: Math.sin(t * 1.6) * 2, head: Math.sin(t * 1.1) * 3 }, 0.5); }
    var hip = a.hip ? [lerp(a.hip[0], (b.hip || a.hip)[0], kpos), lerp(a.hip[1], (b.hip || a.hip)[1], kpos)] : null;
    return man({ x: x, y: y + Math.abs(Math.sin(u * 5)) * (moving ? 4 : 0), f: (kpos > 0.5 && b.f ? b.f : a.f) || 1, pose: pz, mood: u > ub - 0.3 && b.mood ? b.mood : a.mood, t: t, hip: hip, s: a.s || 1, shirt: a.shirt, shirtD: a.shirtD, vest: a.vest, hat: a.hat, phone: a.phone });
  }
  // ── overlays: a dark pill label with a pointer, a red ✗, a green ✓, a yellow ring ──
  function pill(text, x, y, u, u0, o) { o = o || {}; var k = clamp((u - u0) / 0.35); if (k <= 0) return ""; var sz = o.sz || 40, w = text.length * sz * 0.52 + 44, col = o.bg || "#262a30";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ')" filter="url(#sh)">' + R(-w / 2, -sz * 0.9, w, sz * 1.5, col, { rx: sz * 0.42, sw: 3, st: "#111" }) + (o.down !== false ? F("M-12 " + f(sz * 0.6) + " L0 " + f(sz * 0.6 + 16) + " L12 " + f(sz * 0.6) + " Z", col, { sw: 0 }) : "") + T(text, 0, sz * 0.22, sz, o.col || "#fff") + '</g>'; }
  function xmark(x, y, u, u0, s) { var k = clamp((u - u0) / 0.3); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * (s || 1)) + ')" filter="url(#sh)">' + C(0, 0, 46, "#fff", { st: "#d8352a", sw: 9 }) + P("M-20 -20 L20 20 M20 -20 L-20 20", "#d8352a", 12) + '</g>'; }
  function vmark(x, y, u, u0, s) { var k = clamp((u - u0) / 0.3); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * (s || 1)) + ')" filter="url(#sh)">' + C(0, 0, 46, "#3aa05a", { st: "#fff", sw: 7 }) + P("M-20 2 L-6 16 L22 -14", "#fff", 11) + '</g>'; }
  function ring(x, y, r, u, u0, t) { var k = clamp((u - u0) / 0.4); if (k <= 0) return ""; return C(x, y, r * (1.6 - 0.6 * ease(k)) * (1 + 0.04 * Math.sin(t * 6)), "none", { st: "#ffd23a", sw: 8, op: k }) + C(x, y, r * 1.1, "url(#ring)", { op: 0.6 * k }); }

  // ── the build state per line: parts switch on at the line that adds them and stay on ──
  var STEPS = [[2, { shore: 1 }], [4, { concrete: 1, room: 1 }], [6, { membrane: 1, drain: 1, pump: 1 }], [8, { vent: 1, fan: 1, air: 1, lamp: 1 }], [10, { dehum: 1 }], [12, { shaft: 1, ladder: 1 }], [14, { wool: 1 }], [16, { escape: 1 }], [20, { cracks: 1, sealed: 1 }], [22, { desk: 1, safe: 1, bell: 1, led: 1 }]];
  var CUR = 0;
  function has(extra, line) { var o = {}; STEPS.forEach(function (s) { if (s[0] < (line == null ? CUR : line)) Object.assign(o, s[1]); }); return Object.assign(o, extra || {}); }
  function world(t, o, h) { o = o || {}; h = h || {}; var b = has(o);
    var s = sky(t, h.night) + palm(-260, t, 1.1) + bush(1010, 1) + palm(1250, t, 0.9) + ground(t);
    if (h.water) s += waterTable(t, h.water);
    s += basement(t, b);
    if (b.lamp) s += R(LAMP - 10, GY - 300, 20, 300, "#3a3f46", { sw: 3 }) + R(LAMP - 34, GY - 360, 68, 56, "#2b2e33", { rx: 10 }) + C(LAMP, GY - 330, 18, "#ffe08a") + C(LAMP, GY - 330, 46 + 4 * Math.sin(t * 3), "#ffe08a", { op: h.night ? 0.45 : 0.22 });
    s += house(t, Object.assign({ shaft: b.shaft, bell: b.bell ? (h.ring ? 2 : 1) : 0 }, h));
    return s; }
  function confetti(t, x0, x1, y0, y1) { var s = ""; for (var c = 0; c < 40; c++) { var p = (t * 0.5 + hash(c)) % 1, cx = x0 + hash(c + 2) * (x1 - x0) + Math.sin(t * 3 + c) * 20, cy = lerp(y0, y1, p); s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="12" height="18" fill="' + ["#d8352a", "#f2c230", "#3aa05a", "#2f6f9f", "#9a5fb0"][c % 5] + '" transform="rotate(' + f(t * 260 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; } return s; }
  function arrowH(x1, y, x2, col, w, k) { if (k <= 0) return ""; var x = lerp(x1, x2, k), d = x2 > x1 ? 1 : -1; return P("M" + f(x1) + " " + f(y) + " L" + f(x) + " " + f(y), INK, w + 6) + P("M" + f(x1) + " " + f(y) + " L" + f(x) + " " + f(y), col, w) + F("M" + f(x + d * 22) + " " + f(y) + " L" + f(x - d * 6) + " " + f(y - 18) + " L" + f(x - d * 6) + " " + f(y + 18) + " Z", col, { sw: 3 }); }
  function arrowV(x, y1, y2, col, w, k) { if (k <= 0) return ""; var y = lerp(y1, y2, k), d = y2 > y1 ? 1 : -1; return P("M" + f(x) + " " + f(y1) + " L" + f(x) + " " + f(y), INK, w + 6) + P("M" + f(x) + " " + f(y1) + " L" + f(x) + " " + f(y), col, w) + F("M" + f(x) + " " + f(y + d * 22) + " L" + f(x - 18) + " " + f(y - d * 6) + " L" + f(x + 18) + " " + f(y - d * 6) + " Z", col, { sw: 3 }); }

  // ── shots: camera [cx, cy, zoom] from → to, and the acting ──
  var SH = [];
  function shot(line, c0, c1, draw) { SH.push({ a: L(line), c0: c0, c1: c1, draw: draw }); }
  var FL = BY1 - 16, UP = GY;   // floor heights: basement floor, house floor
  var VIS = { shirt: "url(#shirt2)", shirtD: "#7a2a18" };

  // 0 — dig a room under the floor and cover the hole with a rug: "a secret basement"
  shot(0, [540, 760, 1.25], [540, 820, 1.0], function (u, d, t) {
    var dep = 260 * ease(clamp((u - 0.2) / 2.6)), rug = u > 3.4 ? 0 : 1;
    var s = world(t, {}, { rug: u > 3.4 ? 0 : clamp((u - 0.1) * 3) }) + pit(t, dep, 0);
    for (var k = 0; k < 6; k++) { var p = (t * 1.3 + k / 6) % 1; if (u < 3) s += C(lerp(520, 660 + k * 10, p), GY - 100 * Math.sin(p * Math.PI), 9, "#7a4c2a", { st: INK, sw: 2 }); }
    s += act(u, [[0, { x: 560, y: UP, f: -1, p: "dig", mood: "happy", rate: 1.3 }], [3.0, { x: 560, y: UP, f: -1, p: "dig", mood: "happy" }], [3.4, { x: 600, y: UP, f: -1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("قبو سري؟", 520, 380, u, 3.6, { col: "#ffd23a" });
  });
  // 1 — but the earth caves in on you before you finish digging
  shot(1, [520, 1000, 1.15], [520, 1060, 1.45], function (u, d, t) {
    var cave = clamp((u - 0.6) / 1.4), s = world(t) + pit(t, 260, cave);
    s += act(u, [[0, { x: 520, y: GY + 250, f: -1, p: "dig", mood: "n" }], [0.7, { x: 520, y: GY + 250, f: -1, p: "cover", mood: "shock" }]], t);
    return s + xmark(700, GY + 90, u, 1.6) + pill("هيقع عليك!", 520, GY - 70, u, 1.2, { bg: "#c7321f" });
  });
  // 2 — so you shore the sides with planks as you go: a cubic metre of earth ≈ 1.5 t, heavier than a car
  shot(2, [540, 1300, 0.95], [540, 1260, 0.9], function (u, d, t) {
    var s = world(t, { shore: u > 0.2 ? 1 : 0 }) ;
    s += act(u, [[0, { x: 360, y: BY1 + TH, f: 1, p: "hammer", mood: "n", rate: 1.6 }], [2.4, { x: 360, y: BY1 + TH, f: 1, p: "thumbs", mood: "happy" }]], t);
    // a balance: one cube of earth against a car
    var k = ease(clamp((u - 2.6) / 1.0)), tilt = lerp(0, 10, k), bx = 540, by = 640;
    s += '<g opacity="' + f(clamp((u - 2.3) * 3)) + '" transform="translate(' + bx + ' ' + by + ')"><g filter="url(#sh)">' + R(-330, -230, 660, 330, "#f6f1e6", { rx: 26, sw: 4 }) + '</g>' + F("M-16 70 L0 30 L16 70 Z", "#5a6068") + '<g transform="rotate(' + f(tilt) + ')">' + R(-280, 18, 560, 14, "#8a6a3a", { rx: 4 });
    s += '<g transform="translate(180 18)">' + R(-80, -150, 160, 150, "url(#soil)", { sw: 4 }) + T("1 م³", 0, -60, 46, "#fff", { stroke: INK }) + '</g>';
    s += '<g transform="translate(-180 18)">' + F("M-120 0 L-120 -40 Q-118 -60 -90 -62 L-60 -100 H50 L84 -62 Q118 -58 120 -36 L120 0 Z", "#2f6f9f") + R(-50, -92, 44, 30, "#bfe0ff", { sw: 2 }) + R(4, -92, 40, 30, "#bfe0ff", { sw: 2 }) + C(-70, 0, 24, "#2a2a2a", { st: INK, sw: 3 }) + C(70, 0, 24, "#2a2a2a", { st: INK, sw: 3 }) + '</g></g></g>';
    return s + pill("ألواح سند", 540, BY0 - 90, u, 0.6, { col: "#ffd23a" }) + pill("≈ طن ونص", 720, 420, u, 3.2, { bg: "#c7321f" });
  });
  // 3 — but the earth pushes on the walls, harder the deeper you go
  shot(3, [540, 1340, 1.0], [540, 1360, 1.15], function (u, d, t) {
    var k = clamp((u - 0.3) / 1.6), s = world(t, { bow: 0.6 * k + 0.1 * Math.sin(t * 8) * k });
    for (var i = 0; i < 5; i++) { var y = BY0 - 20 + i * 110, len = (40 + i * 34) * k; s += arrowH(BX0 - TH - 40 - len, y, BX0 - TH - 26, "#ffd23a", 12, k) + arrowH(BX1 + TH + 40 + len, y, BX1 + TH + 26, "#ffd23a", 12, k); }
    s += act(u, [[0, { x: 400, y: BY1 + TH, f: -1, p: "stand", mood: "n" }], [1.2, { x: 300, y: BY1 + TH, f: -1, p: "push", mood: "worry" }]], t);
    return s + pill("كل ما تنزل… يزق أكتر", 540, BY0 - 110, u, 1.8, { bg: "#c7321f", sz: 36 });
  });
  // 4 — so you pour reinforced-concrete walls and a ceiling, about 20 cm thick
  shot(4, [540, 1330, 0.95], [700, 1260, 1.25], function (u, d, t) {
    var ck = clamp((u - 0.3) / 2.4), s = world(t, { concrete: ck, room: ck >= 1 ? 1 : 0 });
    if (ck < 1) for (var k = 0; k < 10; k++) { var p = (t * 1.6 + k / 10) % 1; s += C(BX1 - 40 + Math.sin(k) * 20, lerp(BY0 - 80, BY1 - ck * 400, p), 9, "#9a958c", { st: INK, sw: 1.5 }); }
    s += P("M" + (BX1 - 40) + " " + (GY + 40) + " V" + (BY0 - 60), "#5a6068", 26) + P("M" + (BX1 - 40) + " " + (GY + 40) + " V" + (BY0 - 60), "url(#pipe)", 16);
    s += act(u, [[0, { x: 520, y: BY1 + TH, f: 1, p: "stand", mood: "n" }], [0.8, { x: 520, y: BY1 + TH, f: 1, p: "point", mood: "n" }], [2.8, { x: 560, y: FL, f: 1, p: "thumbs", mood: "happy", jump: 1 }]], t);
    if (u > 2.8) s += arrowH(BX1 - 4, 1420, BX1 + TH + 4, "#ffd23a", 8, 1) + arrowH(BX1 + TH + 4, 1420, BX1 - 4, "#ffd23a", 8, 1);
    return s + pill("خرسانة مسلحة", 540, BY0 - 110, u, 1.0, { col: "#ffd23a" }) + pill("20 سم", BX1 + 120, 1340, u, 2.9);
  });
  // 5 — but groundwater presses on the concrete, looking for any crack to get in
  shot(5, [540, 1420, 0.92], [540, 1440, 1.1], function (u, d, t) {
    var wk = clamp(u / 1.6), s = world(t, {}, { water: wk });
    for (var i = 0; i < 6; i++) s += arrowV(BX0 + 40 + i * 110, BY1 + TH + 120, BY1 + TH + 14, "#cfe9ff", 10, clamp((u - 1.0) * 2));
    var lk = clamp((u - 2.0) / 0.6); for (var k = 0; k < 6; k++) { var p = (t * 1.2 + k / 6) % 1; s += F("M" + (BX0 + 8) + " " + f(1450 + p * 180) + " q-7 12 0 15 q7 -3 0 -15 Z", "#3f8fc8", { sw: 1.5, op: lk }); }
    s += '<ellipse cx="' + (BX0 + 120) + '" cy="' + (FL - 2) + '" rx="' + f(110 * lk) + '" ry="10" fill="#5fb0e6" opacity=".7"/>';
    s += act(u, [[0, { x: 500, y: FL, f: -1, p: "stand", mood: "n" }], [2.0, { x: 470, y: FL, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("مية جوفية", 540, BY0 + 70, u, 0.8, { bg: "#1f5f9a" }) + xmark(BX0 + 40, 1440, u, 2.4, 0.8);
  });
  // 6 — so you wrap the outside in a waterproof layer, with a drain under the floor to a pump: the sump pump
  shot(6, [540, 1430, 0.92], [380, 1560, 1.25], function (u, d, t) {
    var s = world(t, { membrane: clamp((u - 0.2) / 1.4), drain: clamp((u - 1.8) / 1.4), pump: clamp((u - 3.0) / 1.0) }, { water: 1 });
    s += act(u, [[0, { x: 500, y: FL, f: -1, p: "shock", mood: "worry" }], [1.0, { x: 500, y: FL, f: -1, p: "pointUp", mood: "n" }], [4.2, { x: 420, y: FL, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("طبقة عازلة", BX1 - 30, BY0 - 110, u, 0.6) + pill("طلمبة الرشح", BX0 + 170, BY1 - 150, u, 3.4, { col: "#9fd6ff" }) + ring(BX0 + 60, BY1 + 30, 70, u, 3.6, t);
  });
  // 7 — but you're in a closed room underground now, and your breath makes the air heavy
  shot(7, [540, 1420, 1.0], [520, 1440, 1.35], function (u, d, t) {
    var s = world(t, {}, {});
    for (var k = 0; k < 9; k++) { var p = (t * 0.35 + k / 9) % 1; s += '<g opacity="' + f(Math.sin(p * Math.PI) * clamp(u / 0.8)) + '">' + T("CO₂", 300 + (k % 5) * 110, lerp(BY1 - 120, BY0 + 40, p), 34, "#8a8a8a") + '</g>'; }
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "stand", mood: "n" }], [1.4, { x: 520, y: FL, f: 1, p: "collar", mood: "dizzy" }]], t);
    return s + pill("هوا تقيل", 540, BY0 - 100, u, 1.4, { bg: "#c7321f" });
  });
  // 8 — so you run an air pipe up and hide it inside a lamp post in the garden
  shot(8, [420, 1150, 0.95], [300, 1000, 0.9], function (u, d, t) {
    var s = world(t, { vent: clamp((u - 0.2) / 2.0), fan: u > 2.2, air: u > 2.4, lamp: u > 2.2 });
    s += act(u, [[0, { x: 520, y: FL, f: -1, p: "collar", mood: "dizzy" }], [2.4, { x: 500, y: FL, f: -1, p: "breathe", mood: "happy" }]], t);
    return s + pill("ماسورة هوا", 300, 960, u, 1.0) + pill("عمود نور!", LAMP + 60, GY - 440, u, 2.5, { col: "#ffd23a" }) + ring(LAMP, GY - 330, 70, u, 2.6, t);
  });
  // 9 — but humidity underground is high, and the walls will grow mould
  shot(9, [540, 1420, 1.0], [600, 1420, 1.3], function (u, d, t) {
    var s = world(t, { mold: clamp((u - 0.2) / 1.6) });
    for (var k = 0; k < 14; k++) { var p = (t * 0.5 + k / 14) % 1; s += C(BX0 + 40 + hash(k + 3) * 560, lerp(BY1 - 20, BY0 + 20, p), 4, "#bfe0ff", { op: Math.sin(p * Math.PI) }); }
    s += act(u, [[0, { x: 460, y: FL, f: 1, p: "stand", mood: "n" }], [1.2, { x: 460, y: FL, f: 1, p: "point", mood: "worry" }]], t);
    return s + pill("عفن!", 640, BY0 - 100, u, 1.4, { bg: "#3f7a2e" });
  });
  // 10 — so you put in a dehumidifier that keeps it between 30 and 50 %
  shot(10, [640, 1420, 1.35], [600, 1420, 1.1], function (u, d, t) {
    var h = Math.round(lerp(85, 45, clamp((u - 1.0) / 2.2))), s = world(t, { mold: clamp(1 - (u - 1.2) / 1.8), dehum: clamp((u - 0.2) / 0.8), hum: h + "%" });
    s += act(u, [[0, { x: 460, y: FL, f: 1, p: "point", mood: "worry" }], [1.0, { x: 460, y: FL, f: 1, p: "stand", mood: "n" }], [3.0, { x: 460, y: FL, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("من 30 لـ 50%", 725, BY0 - 90, u, 2.4, { col: "#9fd6ff" });
  });
  // 11 — but that rug is the first thing anyone lifts
  shot(11, [540, 900, 0.95], [540, 960, 0.95], function (u, d, t) {
    var lift = clamp((u - 0.6) / 0.7), s = world(t, {}, { rug: lift });
    s += act(u, [[0, Object.assign({ x: 700, y: UP, f: -1, p: "stand", mood: "n" }, VIS)], [0.6, Object.assign({ x: 640, y: UP, f: -1, p: "crouch", mood: "shock" }, VIS)]], t);
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "stand", mood: "n" }], [1.2, { x: 520, y: FL, f: 1, p: "pointUp", mood: "shock" }]], t);
    return s + xmark(420, GY - 90, u, 1.5, 0.8) + pill("أول حاجة!", 520, 760, u, 1.1, { bg: "#c7321f" });
  });
  // 12 — so you hide the way in behind a bookcase that swings on a hinge when you pull a certain book
  shot(12, [780, 760, 1.45], [700, 900, 1.05], function (u, d, t) {
    var bk = clamp((u - 1.5) / 0.4), op = clamp((u - 2.0) / 1.0), s = world(t, { shaft: 1, ladder: 1 }, { shelf: op, book: bk, shaft: 1 });
    s += act(u, [[0, { x: 690, y: UP, f: 1, p: "stand", mood: "curious" }], [1.4, { x: 690, y: UP, f: 1, p: "reach", mood: "n" }], [2.2, { x: 690, y: UP, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كتاب معين", 650, 470, u, 1.4, { col: "#ffd23a" }) + pill("مفصلة", 930, 520, u, 2.4) + ring(862, GY - 200, 60, u, 2.4, t);
  });
  // 13 — but any talking or banging below carries up and gives you away
  shot(13, [540, 1100, 0.85], [540, 1060, 0.9], function (u, d, t) {
    var s = world(t);
    for (var k = 0; k < 5; k++) { var p = (t * 0.7 + k / 5) % 1, r = 30 + p * 200; s += '<path d="M' + f(450 - r) + ' ' + f(BY0 + 140 - p * 400) + ' Q450 ' + f(BY0 + 140 - p * 400 - r * 0.5) + ' ' + f(450 + r) + ' ' + f(BY0 + 140 - p * 400) + '" stroke="#fff" stroke-width="8" fill="none" opacity="' + f((1 - p) * 0.9) + '"/>'; }
    s += act(u, [[0, { x: 420, y: FL, f: 1, p: "hammer", mood: "happy", rate: 1.8 }], [1.6, { x: 420, y: FL, f: 1, p: "hush", mood: "worry" }]], t);
    s += act(u, [[0, Object.assign({ x: 560, y: UP, f: -1, p: "stand", mood: "n" }, VIS)], [1.0, Object.assign({ x: 520, y: UP, f: -1, p: "ear", mood: "shock" }, VIS)]], t);
    return s + pill("هيفضحك!", 300, 700, u, 1.4, { bg: "#c7321f" });
  });
  // 14 — so you pack the ceiling and walls with rock wool that soaks up the sound
  shot(14, [540, 1300, 1.05], [540, 1260, 0.95], function (u, d, t) {
    var wk = clamp((u - 0.2) / 1.6), s = world(t, { wool: wk });
    for (var k = 0; k < 4; k++) { var p = (t * 0.7 + k / 4) % 1, r = 30 + p * 120, y = BY0 + 160 - p * 140; if (y > BY0 + 30 * wk) s += '<path d="M' + f(450 - r) + ' ' + f(y) + ' Q450 ' + f(y - r * 0.5) + ' ' + f(450 + r) + ' ' + f(y) + '" stroke="#fff" stroke-width="8" fill="none" opacity="' + f((1 - p) * (1 - 0.8 * wk)) + '"/>'; }
    s += act(u, [[0, { x: 420, y: FL, f: 1, p: "hammer", mood: "n", rate: 1.8 }], [2.0, { x: 420, y: FL, f: 1, p: "thumbs", mood: "happy" }]], t);
    s += act(u, [[0, Object.assign({ x: 520, y: UP, f: -1, p: "ear", mood: "n" }, VIS)], [2.2, Object.assign({ x: 560, y: UP, f: 1, p: "shrug", mood: "n" }, VIS)]], t);
    return s + pill("صوف صخري", 560, BY0 + 110, u, 0.6, { col: "#f2c94a" }) + vmark(760, 760, u, 2.4, 0.8);
  });
  // 15 — but if someone shuts the bookcase on you from outside, you're trapped
  shot(15, [760, 1000, 1.05], [760, 1060, 1.3], function (u, d, t) {
    var sh = clamp(1 - (u - 0.3) / 0.5), s = world(t, {}, { shelf: sh });
    s += act(u, [[0, { hip: [SX0 + 30, GY + 250], f: 1, p: "climb", mood: "n", rate: 1.2 }], [0.9, { hip: [SX0 + 30, GY + 250], f: 1, p: "reach", mood: "shock" }]], t);
    return s + pill("محبوس!", 560, 1180, u, 1.0, { bg: "#c7321f" }) + xmark(860, GY - 160, u, 0.9, 0.8);
  });
  // 16 — so you make a small emergency hatch out to the garden
  shot(16, [860, 1200, 0.9], [880, 1000, 0.95], function (u, d, t) {
    var s = world(t, { escape: clamp((u - 0.1) / 1.4) });
    s += act(u, [[0, { x: 760, y: FL, f: 1, p: "point", mood: "worry" }], [1.4, { x: 940, y: BY1 - 40, f: 1, p: "crouch", mood: "n" }], [2.2, { hip: [EX - 10, 1200], f: 1, p: "climb", mood: "n", jump: 1 }], [2.9, { hip: [EX - 10, GY - 30], f: 1, p: "climb", mood: "n" }], [3.2, { x: EX + 40, y: GY, f: 1, p: "cheer", mood: "happy", jump: 1 }]], t);
    return s + pill("فتحة طوارئ", 880, 700, u, 1.6, { col: "#9fe8b0" });
  });
  // 17 — the odd thing: the most dangerous thing in the basement isn't being found
  shot(17, [540, 1100, 0.85], [540, 1140, 0.9], function (u, d, t) {
    var s = world(t);
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "stand", mood: "happy" }], [0.8, { x: 520, y: FL, f: 1, p: "shrug", mood: "happy" }]], t);
    s += act(u, [[0, Object.assign({ x: 300, y: UP, f: 1, p: "stand", mood: "n" }, VIS)], [2.6, Object.assign({ x: 620, y: UP, f: 1, p: "stand", mood: "n" }, VIS)]], t);
    return s + pill("حد يكتشفه؟", 540, 760, u, 0.8) + xmark(780, 760, u, 2.0, 0.7);
  });
  // 18 — the real danger: a gas from the ground itself, no smell, no colour: radon
  shot(18, [540, 1500, 1.0], [540, 1460, 1.3], function (u, d, t) {
    var s = world(t, { cracks: 1, radon: clamp((u - 0.3) / 1.4) });
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "stand", mood: "n" }], [1.6, { x: 520, y: FL, f: -1, p: "stand", mood: "worry" }], [3.0, { x: 520, y: FL, f: 1, p: "shrug", mood: "worry" }]], t);
    return s + pill("الرادون", 540, BY0 + 90, u, 2.8, { bg: "#7a3aa8" }) + pill("ما بيتشمش ولا بيتشاف", 540, BY0 + 170, u, 1.4, { sz: 34 });
  });
  // 19 — the WHO: one of the biggest causes of lung cancer after smoking
  shot(19, [540, 1460, 1.4], [540, 1440, 1.6], function (u, d, t) {
    var s = world(t, { cracks: 1, radon: 1 });
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "stand", mood: "worry" }], [0.4, { x: 520, y: FL, f: 1, p: "cough", mood: "sick" }]], t);
    var lk = clamp((u - 0.8) / 0.4), br = 1 + 0.05 * Math.sin(t * 3);
    s += '<g opacity="' + f(lk) + '" transform="translate(720 1330) scale(' + f(0.7 * br) + ')"><g filter="url(#sh)">' + C(0, 0, 150, "#fff", { st: INK, sw: 6 }) + '</g>' + P("M0 -100 V-40 M0 -40 Q-20 -30 -40 -20 M0 -40 Q20 -30 40 -20", INK, 10) + F("M-12 -40 C-60 -50 -110 -10 -110 50 C-110 96 -56 104 -28 86 C-12 66 -12 10 -12 -40 Z", "url(#lung)") + F("M12 -40 C60 -50 110 -10 110 50 C110 96 56 104 28 86 C12 66 12 10 12 -40 Z", "url(#lung)");
    for (var k = 0; k < 12; k++) { var a = hash(k + 5) * 6.28 + t, rr = 20 + hash(k + 9) * 40; s += C((k % 2 ? 1 : -1) * (58 + Math.cos(a) * rr * 0.6), 30 + Math.sin(a) * rr * 0.7, 7, "#b07ad8"); }
    s += '</g>';
    return s + pill("منظمة الصحة العالمية", 540, BY0 - 30, u, 0.3, { sz: 30 }) + pill("سرطان الرئة", 720, 1520, u, 1.6, { bg: "#c7321f" });
  });
  // 20 — so you seal the floor cracks and keep the fan running to push it out
  shot(20, [520, 1450, 1.2], [420, 1250, 0.95], function (u, d, t) {
    var s = world(t, { cracks: 1, sealed: u > 1.4, radon: 1, radonOut: true, vent: 1, fan: 1, air: 1 });
    s += act(u, [[0, { x: 420, y: FL, f: 1, p: "caulk", mood: "n", rate: 1.4 }], [2.0, { x: 420, y: FL, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("سد الشقوق", 560, BY0 + 80, u, 0.6) + pill("المروحة شغالة", 300, 960, u, 2.2, { col: "#d9b0ff" });
  });
  // 21 — most important: don't start without a structural engineer, your whole house is on top of you
  shot(21, [540, 900, 0.85], [540, 960, 0.85], function (u, d, t) {
    var s = world(t);
    for (var k = 0; k < 5; k++) s += arrowV(200 + k * 170, 470, GY + 70 + Math.sin(t * 4 + k) * 6, "#ffd23a", 12, clamp((u - 0.4) * 2 - k * 0.15));
    s += act(u, [[0, { x: 380, y: FL, f: 1, p: "stand", mood: "worry" }], [1.6, { x: 380, y: FL, f: 1, p: "thumbs", mood: "happy" }]], t);
    s += act(u, [[0, { x: 640, y: FL, f: -1, p: "point", mood: "n", vest: 1, hat: 1, shirt: "url(#shirt)" }], [1.8, { x: 640, y: FL, f: -1, p: "pointUp", mood: "n", vest: 1, hat: 1 }]], t);
    return s + pill("مهندس إنشائي", 640, BY0 + 60, u, 0.6, { col: "#ffd23a" }) + pill("بيتك فوقك!", 540, 360, u, 1.8, { bg: "#c7321f" });
  });
  // 22 — what's left: a small desk, a wall safe, and a bell that rings if anyone touches the bookcase
  shot(22, [540, 1440, 1.1], [600, 1240, 0.95], function (u, d, t) {
    var s = world(t, { desk: u > 0.5, safe: u > 1.8, bell: u > 3.4, led: 1 }, { ring: u > 3.6 });
    s += act(u, [[0, { x: 560, y: FL, f: -1, p: "stand", mood: "n" }], [0.7, { hip: [470, FL - 120], f: -1, p: "sitDesk", mood: "happy", jump: 1 }], [3.6, { hip: [470, FL - 120], f: -1, p: "pointUp", mood: "happy" }]], t);
    return s + pill("مكتب", 360, BY1 - 230, u, 0.6) + pill("خزنة", 608, BY0 + 60, u, 1.9) + pill("جرس", 900, GY - 460, u, 3.5, { col: "#ffd23a" });
  });
  // 23 — congratulations, you built a secret basement yourself
  shot(23, [540, 1300, 1.2], [540, 1000, 0.8], function (u, d, t) {
    var s = world(t, {}, { ring: false }) + confetti(t, BX0, BX1, BY0, BY1);
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "cheer", mood: "happy" }], [1.2, { x: 520, y: FL, f: -1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("مبروك!", 540, 300, u, 0.4, { col: "#9fe8b0", sz: 56 });
  });
  // 24 — outro
  shot(24, [540, 1000, 0.82], [540, 960, 0.86], function (u, d, t) {
    var s = world(t, {}, { night: true });
    s += act(u, [[0, { x: 520, y: FL, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("قولولنا!", 540, 300, u, 0.4, { col: "#ffd23a", sz: 56 });
  });

  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  window.__parts = { world: world, man: man, act: act, POSES: POSES, has: has, setLine: function (n) { CUR = n; }, pill: pill, xmark: xmark, ring: ring, G: { GY: GY, BX0: BX0, BX1: BX1, BY0: BY0, BY1: BY1, FL: BY1 - 16 } };
  window.__scene = function (svg, t) {
    var i = at(t); CUR = i; var sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a), k = ease(u / d);
    var cx = lerp(sh.c0[0], sh.c1[0], k) + 10 * Math.sin(t * 0.9), cy = lerp(sh.c0[1], sh.c1[1], k) + 8 * Math.cos(t * 0.8), z = lerp(sh.c0[2], sh.c1[2], k) * (1 + 0.012 * Math.sin(t * 1.1));
    // cross-zoom in the first 0.3 s of a shot: continue from the previous camera
    if (i > 0 && u < 0.35) { var pv = SH[i - 1], pc = pv.c1, m = ease(u / 0.35); cx = lerp(pc[0], cx, m); cy = lerp(pc[1], cy, m); z = lerp(pc[2], z, m); }
    svg.innerHTML = '<g transform="translate(540 960) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>';
    return i;
  };
})();
