/* «ابنيها بنفسك» — المسبح. One side-view build of a garden pool, redrawn every frame.
   World = 360×640 (same as the page). Ground line at GY. The pool is cut open so the viewer sees the shell, the soil,
   the pipes and the machines. Every part has an "on" time in EV (events.js) and stays once built.
   Layers: world (camera) → screen tags/gauges → captions → cards. */
(function () {
  var EV = window.EV, NS = "http://www.w3.org/2000/svg";
  var INK = "#1d1b19", CREAM = "#fbefd2", YEL = "#ffd23f", RED = "#ff5a4e", GRN = "#6ee07a";
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.18) return 1.18 * ease(u / 0.18); if (u < 0.32) return lerp(1.18, 1, (u - 0.18) / 0.14); return 1; }
  function after(t, t0, d) { return clamp((t - t0) / (d || 0.6)); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  function mixc(a, b, k) { var p = function (c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }, A = p(a), B = p(b); return "rgb(" + A.map(function (v, i) { return Math.round(lerp(v, B[i], clamp(k))); }).join(",") + ")"; }

  // ── geometry of the build ─────────────────────────────
  var GY = 330, PX0 = 46, PX1 = 262, WT = 7;               // ground line, pool inner left/right, shell thickness
  function floorY(x) { return x < 128 ? 388 : x > 182 ? 424 : lerp(388, 424, (x - 128) / 54); }
  function poolPath(inset) {                               // inner outline, top-left → down → across → up
    var i = inset || 0;
    return "M" + (PX0 + i) + " " + GY + " V" + (388 - i) + " H" + 128 + " L182 " + (424 - i) + " H" + (PX1 - i) + " V" + GY;
  }
  var HOLE = "M" + PX0 + " " + GY + " V388 H128 L182 424 H" + PX1 + " V" + GY + " Z";
  var SHELL = "M" + (PX0 - WT) + " " + GY + " V" + (388 + WT) + " H" + (128 - 2) + " L" + (182 - 2) + " " + (424 + WT) + " H" + (PX1 + WT) + " V" + GY +
              " H" + PX1 + " V424 H182 L128 388 H" + PX0 + " V" + GY + " Z";
  var DRAIN1 = 222, DRAINS = [204, 240];                    // one drain, then two drains ~1 m apart (27 px/m)

  // ── background: sky, sun, clouds, an Egyptian villa, palm, garden ─────────
  function sky(t, sunK) {
    var s = '<rect x="-200" y="-200" width="760" height="' + (GY + 200) + '" fill="url(#gSky)"/>';
    var sx = 300, sy = 70 - 6 * Math.sin(t * 0.3), r = 22 + 16 * sunK;
    s += '<circle cx="' + sx + '" cy="' + f(sy) + '" r="' + f(r * 2.2) + '" fill="#ffe9a8" opacity="' + f(0.35 + 0.4 * sunK) + '" filter="url(#soft)"/>';
    s += '<circle cx="' + sx + '" cy="' + f(sy) + '" r="' + f(r) + '" fill="#ffd95a"/>';
    if (sunK > 0.05) for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283 + t * 0.4, r1 = r + 6, r2 = r + 14 + 6 * Math.sin(t * 3 + k); s += '<path d="M' + f(sx + Math.cos(a) * r1) + ' ' + f(sy + Math.sin(a) * r1) + ' L' + f(sx + Math.cos(a) * r2) + ' ' + f(sy + Math.sin(a) * r2) + '" stroke="#ffc83a" stroke-width="3" stroke-linecap="round" opacity="' + f(sunK) + '"/>'; }
    for (var i = 0; i < 5; i++) { var x = ((hash(i) * 520 + t * (5 + i * 1.3)) % 520) - 80, y = 24 + hash(i + 7) * 120, w = 30 + hash(i * 3) * 30;
      s += '<g fill="#fff" opacity=".92"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * .3) + '"/><ellipse cx="' + f(x - w * .35) + '" cy="' + f(y - w * .18) + '" rx="' + f(w * .45) + '" ry="' + f(w * .32) + '"/><ellipse cx="' + f(x + w * .25) + '" cy="' + f(y - w * .22) + '" rx="' + f(w * .4) + '" ry="' + f(w * .35) + '"/></g>'; }
    return s;
  }
  function villa(t) {
    var s = "", x0 = 108, x1 = 300, top = 150;
    s += '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (GY - top) + '" fill="url(#gWall)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x0 - 6) + '" y="' + (top - 8) + '" width="' + (x1 - x0 + 12) + '" height="10" fill="#d8c6a6" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x0 - 4) + '" y="238" width="' + (x1 - x0 + 8) + '" height="7" fill="#d8c6a6" stroke="' + INK + '" stroke-width="1.6"/>';
    // roof: water tank and a satellite dish (every Egyptian roof)
    s += '<rect x="250" y="116" width="34" height="26" rx="3" fill="#e9e6df" stroke="' + INK + '" stroke-width="2"/><rect x="254" y="138" width="4" height="6" fill="' + INK + '"/><rect x="276" y="138" width="4" height="6" fill="' + INK + '"/>';
    s += '<g transform="translate(150 128) rotate(' + f(-20 + Math.sin(t * .2) * 1) + ')"><path d="M-14 0 A14 14 0 0 0 14 0 Z" fill="#f4f4f2" stroke="' + INK + '" stroke-width="2"/><path d="M0 2 L0 14" stroke="' + INK + '" stroke-width="2"/></g><rect x="146" y="140" width="8" height="3" fill="' + INK + '"/>';
    // windows: wooden shutters (arched on the ground floor), a balcony upstairs
    for (var k = 0; k < 3; k++) { var wx = 126 + k * 58;
      s += '<rect x="' + wx + '" y="168" width="30" height="40" fill="#7fb2cf" stroke="' + INK + '" stroke-width="2"/><path d="M' + (wx + 15) + ' 168 V208 M' + wx + ' 188 H' + (wx + 30) + '" stroke="#fff" stroke-width="1.6"/>';
      s += '<rect x="' + (wx - 8) + '" y="168" width="7" height="40" fill="#8a5a34" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + (wx + 31) + '" y="168" width="7" height="40" fill="#8a5a34" stroke="' + INK + '" stroke-width="1.4"/>'; }
    s += '<rect x="116" y="212" width="180" height="4" fill="#d8c6a6" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var b = 0; b < 19; b++) s += '<rect x="' + (118 + b * 9.5) + '" y="216" width="2.2" height="18" fill="' + INK + '"/>';
    s += '<rect x="116" y="232" width="180" height="3" fill="' + INK + '"/>';
    s += '<path d="M150 330 V280 A16 16 0 0 1 182 280 V330 Z" fill="#6b4224" stroke="' + INK + '" stroke-width="2"/><circle cx="176" cy="306" r="2" fill="' + YEL + '"/>';
    for (var k2 = 0; k2 < 2; k2++) { var ax = 210 + k2 * 50; s += '<path d="M' + ax + ' 312 V272 A13 13 0 0 1 ' + (ax + 26) + ' 272 V312 Z" fill="#7fb2cf" stroke="' + INK + '" stroke-width="2"/><path d="M' + (ax + 13) + ' 259 V312" stroke="#fff" stroke-width="1.4"/>'; }
    // bougainvillea over the door
    for (var g = 0; g < 26; g++) { var gx = 140 + hash(g) * 60, gy = 246 + hash(g + 3) * 26 + Math.sin(t * 2 + g) * 0.8; s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(3 + hash(g + 9) * 3) + '" fill="' + (g % 3 ? "#e0418a" : "#c22d72") + '"/>'; }
    return s;
  }
  function palm(x, t) {
    var sw = Math.sin(t * 1.1) * 3, s = '<path d="M' + x + ' ' + GY + ' Q' + (x - 6) + ' 250 ' + f(x + 4 + sw * .4) + ' 168" stroke="#8a6a3a" stroke-width="9" fill="none" stroke-linecap="round"/>';
    for (var r = 0; r < 9; r++) s += '<path d="M' + (x - 5) + ' ' + (322 - r * 17) + ' l10 -3" stroke="#6b4f2a" stroke-width="2"/>';
    for (var k = 0; k < 8; k++) { var a = -2.9 + k * 0.42 + Math.sin(t * 1.4 + k) * 0.05, L = 46 + (k % 2) * 10, ex = x + 4 + sw * .4 + Math.cos(a) * L, ey = 168 + Math.sin(a) * L * 0.55 + 18;
      s += '<path d="M' + f(x + 4 + sw * .4) + ' 168 Q' + f(x + 4 + Math.cos(a) * L * .55) + ' ' + f(150 + Math.sin(a) * L * .3) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="#3f8f3a" stroke-width="7" fill="none" stroke-linecap="round"/>'; }
    return s;
  }
  function lawn(t, hole) {
    var s = '<rect x="-200" y="' + (GY - 4) + '" width="760" height="10" fill="#7cc04f" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 60; i++) { var x = -40 + i * 8 + hash(i) * 4; if (hole && x > PX0 - 10 && x < PX1 + 10) continue; var sw = Math.sin(t * 2 + i) * 1.6; s += '<path d="M' + f(x) + ' ' + (GY - 3) + ' q' + f(sw) + ' -5 ' + f(sw * 1.5) + ' -8" stroke="#4f9a35" stroke-width="1.6" fill="none"/>'; }
    return s;
  }
  function soil(t, wet) {
    var s = '<rect x="-200" y="' + GY + '" width="760" height="600" fill="url(#gSoil)"/>';
    s += '<path d="M-200 470 Q60 458 180 474 T560 466 V900 H-200 Z" fill="#7a5638" opacity=".55"/><path d="M-200 560 Q80 548 200 566 T560 556 V900 H-200 Z" fill="#5f4129" opacity=".6"/>';
    for (var i = 0; i < 70; i++) { var x = -150 + hash(i) * 660, y = GY + 12 + hash(i + 40) * 300, r = 2 + hash(i + 5) * 5; s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * .7) + '" fill="' + (i % 3 ? "#5e4029" : "#a8865c") + '" opacity=".7"/>'; }
    if (wet > 0) s += '<path d="' + HOLE + '" fill="#3c2a1a" opacity="' + f(.55 * wet) + '" transform="translate(154 380) scale(' + f(1 + .55 * wet) + ') translate(-154 -380)" filter="url(#soft)"/>';
    return s;
  }

  // ── the pool parts ───────────────────────────────────
  function water(t, level, col, op) {          // level 0..1 of the full depth; fills the inner outline
    if (level <= 0.001) return "";
    var top = lerp(428, GY + 8, level), d = "M" + (PX0 - 2) + " " + f(top);
    for (var x = PX0 - 2; x <= PX1 + 2; x += 6) d += " L" + x + " " + f(top + Math.sin(x * .09 + t * 3) * 1.6 + Math.sin(x * .21 - t * 2.3) * .8);
    d += " L" + (PX1 + 2) + " 426 H" + (PX0 - 2) + " Z";
    var s = '<g clip-path="url(#cpPool)"><path d="' + d + '" fill="' + col + '" opacity="' + (op || .9) + '"/>';
    for (var k = 0; k < 7; k++) { var cx = PX0 + 10 + ((hash(k) * 200 + t * (8 + k)) % 200), cy = top + 12 + hash(k + 3) * 50; s += '<path d="M' + f(cx) + ' ' + f(cy) + ' q6 -3 12 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".35"/>'; }
    s += '<path d="M' + (PX0 - 2) + ' ' + f(top) + ' H' + (PX1 + 2) + '" stroke="#fff" stroke-width="1.6" opacity=".5"/></g>';
    return s;
  }
  function shellDraw(t, k, cracked, rebarK, sprayK, tiles) {
    var s = "";
    if (rebarK > 0) {                          // the steel cage: a grid of red-brown bars along the cut
      var g = ""; for (var x = PX0 - WT; x <= PX1 + WT; x += 9) g += '<path d="M' + x + ' ' + GY + ' V' + f(floorY(Math.min(Math.max(x, PX0), PX1)) + WT) + '" stroke="#a0442a" stroke-width="1.6"/>';
      for (var y = GY + 6; y < 432; y += 9) g += '<path d="M' + (PX0 - WT) + ' ' + y + ' H' + (PX1 + WT) + '" stroke="#a0442a" stroke-width="1.6"/>';
      s += '<g clip-path="url(#cpShell)" opacity="' + f(rebarK) + '">' + g + '</g>';
    }
    var shown = Math.max(k, sprayK);
    if (shown > 0) {
      var w = k > 0 ? 1 : sprayK, clipW = (PX1 + WT + 10 - (PX0 - WT)) * w;
      s += '<clipPath id="cpGrow"><rect x="' + (PX0 - WT - 4) + '" y="' + (GY - 4) + '" width="' + f(clipW) + '" height="140"/></clipPath>';
      s += '<path d="' + SHELL + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2" clip-path="url(#cpGrow)" opacity="' + (rebarK > 0 && k <= 0 ? .92 : 1) + '"/>';
      if (tiles > 0) { var tl = ""; for (var x2 = PX0; x2 < PX1; x2 += 8) tl += '<path d="M' + x2 + ' ' + GY + ' V' + f(floorY(x2)) + '" stroke="#1d6aa0" stroke-width=".8"/>'; for (var y2 = GY + 8; y2 < 426; y2 += 8) tl += '<path d="M' + PX0 + ' ' + y2 + ' H' + PX1 + '" stroke="#1d6aa0" stroke-width=".8"/>';
        s += '<g clip-path="url(#cpPool)" opacity="' + f(tiles) + '"><path d="' + poolPath() + ' Z" fill="#7fd0f0"/>' + tl + '</g>';
        s += '<rect x="' + (PX0 - WT - 6) + '" y="' + (GY - 5) + '" width="' + (WT + 8) + '" height="6" fill="#efe6d4" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(tiles) + '"/><rect x="' + (PX1 - 2) + '" y="' + (GY - 5) + '" width="' + (WT + 8) + '" height="6" fill="#efe6d4" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(tiles) + '"/>'; }
    }
    if (cracked > 0) {
      var c = "M" + (PX0 - 3) + " 340 l-3 8 l4 6 l-4 9 l3 7 M" + (PX1 + 3) + " 350 l3 9 l-4 7 l5 9 M150 " + 408 + " l6 4 l-2 6 l7 3";
      s += '<path d="' + c + '" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-dasharray="80" stroke-dashoffset="' + f(80 * (1 - cracked)) + '"/>';
    }
    return s;
  }
  function pumpPad(t, k, flowK, cellK, saltK) {
    if (k <= 0) return "";
    var s = '<g transform="translate(316 330) scale(' + f(pop(k)) + ') translate(-316 -330)">';
    s += '<rect x="278" y="326" width="78" height="6" fill="#bdb6aa" stroke="' + INK + '" stroke-width="1.6"/>';
    // pump: motor + volute
    var hum = flowK > 0 ? Math.sin(t * 60) * .5 : 0;
    s += '<g transform="translate(0 ' + f(hum) + ')"><rect x="282" y="306" width="22" height="20" rx="4" fill="#2f6fb0" stroke="' + INK + '" stroke-width="2"/><path d="M286 306 V326 M290 306 V326 M294 306 V326" stroke="#1d4f86" stroke-width="1.2"/><circle cx="309" cy="316" r="9" fill="#9aa4ad" stroke="' + INK + '" stroke-width="2"/></g>';
    // sand filter, cut open: water on top, sand, gravel
    s += '<path d="M318 326 V284 Q318 266 333 266 Q348 266 348 284 V326 Z" fill="#1f8a7a" stroke="' + INK + '" stroke-width="2"/>';
    s += '<clipPath id="cpTank"><path d="M321 323 V285 Q321 270 333 270 Q345 270 345 285 V323 Z"/></clipPath><g clip-path="url(#cpTank)"><rect x="318" y="266" width="30" height="60" fill="#bfe6f7"/><rect x="318" y="290" width="30" height="24" fill="#e7c98a"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + f(320 + hash(i) * 26) + '" cy="' + f(291 + hash(i + 4) * 22) + '" r="1.2" fill="#b8954f"/>';
    s += '<rect x="318" y="314" width="30" height="12" fill="#9a958c"/>';
    for (var j = 0; j < 8; j++) s += '<circle cx="' + (321 + j * 3.4) + '" cy="' + f(318 + (j % 2) * 3) + '" r="2" fill="#6f6a62"/>';
    if (flowK > 0) for (var d = 0; d < 6; d++) { var u = ((t * .8 + d / 6) % 1); s += '<path d="M' + f(322 + hash(d) * 22) + ' ' + f(272 + u * 16) + ' l0 4" stroke="#2f86c8" stroke-width="2" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; }
    s += '</g><path d="M333 266 V258 H312" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M333 266 V258 H312" stroke="#e9e6df" stroke-width="3" fill="none"/>';
    s += '<path d="M312 258 V308" stroke="' + INK + '" stroke-width="5"/><path d="M312 258 V308" stroke="#e9e6df" stroke-width="3"/>';
    s += '</g>';
    return s;
  }
  // underground pipes: drain(s) + skimmer → pump; filter → return jet in the left wall. Flow dots run once the pump is on.
  function pipes(t, k, flowK, o) {
    if (k <= 0) return "";
    var s = "", paths = [];
    var inlet = "M" + (o.twin ? DRAINS[0] : DRAIN1) + " " + (424 + WT) + " V450 H300 V332";
    paths.push(inlet);
    if (o.twin) paths.push("M" + DRAINS[1] + " " + (424 + WT) + " V450");
    if (o.skim) paths.push("M" + (PX1 + WT + 4) + " 346 H272 V450");
    paths.push("M333 332 V462 H30 V352 H" + (PX0 - WT));
    for (var i = 0; i < paths.length; i++) s += '<path d="' + paths[i] + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linejoin="round" opacity="' + f(k) + '"/><path d="' + paths[i] + '" stroke="#e9e6df" stroke-width="4.4" fill="none" stroke-linejoin="round" opacity="' + f(k) + '"/>';
    if (flowK > 0) for (var p = 0; p < paths.length; p++) s += '<path d="' + paths[p] + '" stroke="' + (p === paths.length - 1 ? "#2f86c8" : "#7a8a50") + '" stroke-width="2.6" fill="none" stroke-dasharray="3 9" stroke-dashoffset="' + f(-t * 40) + '" stroke-linecap="round" opacity="' + f(flowK) + '"/>';
    if (o.cell > 0) {                            // salt chlorinator cell on the return line, glowing with tiny bubbles
      var g = .5 + .5 * Math.sin(t * 8);
      s += '<g transform="translate(150 462) scale(' + f(pop(o.cell)) + ')"><rect x="-22" y="-8" width="44" height="16" rx="5" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/><rect x="-16" y="-5" width="32" height="10" rx="3" fill="#bfe6f7"/>';
      for (var e = 0; e < 5; e++) s += '<path d="M' + (-12 + e * 6) + ' -4 V4" stroke="#7a828c" stroke-width="1.6"/>';
      s += '<rect x="-16" y="-5" width="32" height="10" rx="3" fill="' + YEL + '" opacity="' + f(.25 * g * o.cell) + '"/>';
      for (var b = 0; b < 5; b++) { var u = (t * 1.2 + b / 5) % 1; s += '<circle cx="' + f(-12 + b * 6) + '" cy="' + f(3 - u * 7) + '" r="1.2" fill="#fff" opacity="' + f(1 - u) + '"/>'; }
      s += '<path d="M-6 -14 l4 -6 l-2 0 l4 -6" stroke="' + YEL + '" stroke-width="2" fill="none" opacity="' + f(g) + '"/></g>';
    }
    return s;
  }
  function drains(t, o) {
    var s = "", xs = o.twin ? DRAINS : [DRAIN1];
    for (var i = 0; i < xs.length; i++) { var x = xs[i];
      s += '<rect x="' + (x - 8) + '" y="' + (424 - 1) + '" width="16" height="' + (WT + 2) + '" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.4"/>';
      if (o.dome > 0) s += '<path d="M' + (x - 11) + ' 424 Q' + x + ' ' + f(424 - 10 * o.dome) + ' ' + (x + 11) + ' 424 Z" fill="#e9e6df" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 6) + ' 421 H' + (x + 6) + ' M' + (x - 8) + ' 423 H' + (x + 8) + '" stroke="#7a828c" stroke-width="1" opacity="' + f(o.dome) + '"/>';
      else s += '<path d="M' + (x - 8) + ' 424 H' + (x + 8) + '" stroke="#9aa4ad" stroke-width="2" stroke-dasharray="2 2"/>';
      if (o.suck > 0) for (var k = 0; k < 4; k++) { var u = (t * 1.6 + k / 4) % 1, a = k * 1.57 + 0.4; s += '<path d="M' + f(x + Math.cos(a) * 26 * (1 - u)) + ' ' + f(422 - Math.abs(Math.sin(a)) * 22 * (1 - u)) + ' l' + f(-Math.cos(a) * 4) + ' ' + f(Math.abs(Math.sin(a)) * 4) + '" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="' + f(o.suck * (1 - u) * .8) + '"/>'; }
    }
    return s;
  }
  function skimmer(t, k) {
    if (k <= 0) return "";
    var s = '<g transform="translate(' + PX1 + ' 344) scale(' + f(pop(k)) + ')"><rect x="0" y="-8" width="' + (WT + 6) + '" height="16" fill="#e9e6df" stroke="' + INK + '" stroke-width="1.8"/><path d="M1 -4 l5 3 l-5 3" stroke="' + INK + '" stroke-width="1.4" fill="none"/></g>';
    return s;
  }
  function leaves(t, ev, level) {
    var s = "", top = lerp(428, GY + 8, level);
    for (var i = 0; i < 7; i++) {
      var t0 = ev.leaves + i * 0.35, u = after(t, t0, 1.6); if (u <= 0) continue;
      var x0 = 60 + i * 26 + hash(i) * 10, x = x0 + Math.sin(t * 2 + i) * 8 * (1 - u), y = lerp(150 + hash(i) * 40, top - 1, ease(u));
      var gone = after(t, ev.suckLeaves + i * 0.12, 1.4); if (gone >= 1) continue;
      if (u >= 1) { x = x0 + Math.sin(t * 1.3 + i) * 2; y = top - 1 + Math.sin(t * 3 + i); }
      if (gone > 0) { x = lerp(x, PX1 + 6, ease(gone)); y = lerp(y, 344, ease(gone)); }
      var r = Math.sin(t * 3 + i) * 30 + i * 40;
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ')" opacity="' + f(1 - gone * gone) + '"><path d="M-6 0 Q0 -5 6 0 Q0 5 -6 0 Z" fill="' + (i % 2 ? "#c9a032" : "#7aa83a") + '" stroke="' + INK + '" stroke-width="1"/></g>';
    }
    return s;
  }
  function dirt(t, ev) {
    var s = "", u = after(t, ev.dirt, 1.6);
    for (var i = 0; i < 9; i++) { var x0 = PX0 + 90 + hash(i) * 150, y0 = floorY(x0) - 2, k = clamp(u * 1.3 - i * .04);
      var x = lerp(x0, DRAIN1, ease(k)), y = lerp(y0, 424, ease(k)); if (k >= 1) continue; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1.6 + hash(i + 2)) + '" fill="#5a4a34" opacity="' + f(1 - k) + '"/>'; }
    return s;
  }
  function person(x, y, o) {                   // a simple swimmer (side view, swimming horizontally or standing)
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ')">';
    var skin = "#c98c5a", suit = "#e8452e";
    if (o.stand) {
      s += '<path d="M-4 0 V22 M4 0 V22" stroke="' + skin + '" stroke-width="5" stroke-linecap="round"/><rect x="-7" y="-26" width="14" height="28" rx="6" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="-7" y="-6" width="14" height="9" fill="' + suit + '"/>';
      s += '<path d="M-6 -22 L' + f(-12 + (o.arm || 0)) + ' -40 M6 -22 L' + f(12 - (o.arm || 0)) + ' -40" stroke="' + skin + '" stroke-width="4.4" stroke-linecap="round"/><circle cx="0" cy="-34" r="9" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-9 -38 Q0 -48 9 -38" fill="#2b2016"/>';
      s += '<circle cx="3" cy="-35" r="1.4" fill="' + INK + '"/>';
    } else {
      var kick = Math.sin((o.t || 0) * 9) * 4;
      s += '<path d="M10 0 L24 ' + f(kick) + ' M10 2 L24 ' + f(-kick + 3) + '" stroke="' + skin + '" stroke-width="4.4" stroke-linecap="round"/><rect x="-12" y="-5" width="24" height="11" rx="5" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="4" y="-5" width="8" height="11" fill="' + suit + '"/>';
      s += '<path d="M-10 -2 L-24 ' + f(-6 + kick) + '" stroke="' + skin + '" stroke-width="4" stroke-linecap="round"/><circle cx="-17" cy="0" r="7.5" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/>';
      if (o.hair) s += '<path d="M-17 7 Q' + f(-14 + Math.sin((o.t || 0) * 7) * 2) + ' 16 ' + f(o.hair[0]) + ' ' + f(o.hair[1]) + '" stroke="#2b2016" stroke-width="2.4" fill="none"/>';
      s += '<path d="M-23 -4 Q-17 -9 -11 -4" fill="#2b2016"/><circle cx="-20" cy="-1" r="1.3" fill="' + (o.redEye ? RED : INK) + '"/>';
      if (o.redEye) s += '<circle cx="-20" cy="-1" r="3.2" fill="' + RED + '" opacity=".35"/>';
    }
    return s + "</g>";
  }
  function showerPost(t, k, on) {
    if (k <= 0) return "";
    var s = '<g transform="translate(20 ' + GY + ') scale(' + f(pop(k)) + ') translate(-20 -' + GY + ')"><rect x="14" y="' + (GY - 4) + '" width="16" height="4" fill="#bdb6aa"/><path d="M20 ' + GY + ' V242 Q20 234 28 234 H34" stroke="#c9ced4" stroke-width="4" fill="none"/><path d="M28 238 h12 l-2 4 h-8 z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.4"/>';
    if (on > 0) for (var i = 0; i < 12; i++) { var u = (t * 2 + i / 12) % 1; s += '<path d="M' + f(30 + (i % 5) * 2 + u * (i % 3 - 1) * 4) + ' ' + f(243 + u * 60) + ' l0 4" stroke="#7fc6ee" stroke-width="1.6" stroke-linecap="round" opacity="' + f(on * (1 - u)) + '"/>'; }
    return s + "</g>";
  }
  function ladder(t, k) {
    if (k <= 0) return "";
    var y = lerp(GY - 40, GY, ease(k)), s = '<g opacity="' + f(clamp(k * 2)) + '"><path d="M' + (PX1 - 4) + ' ' + f(y - 18) + ' Q' + (PX1 - 4) + ' ' + f(y - 26) + ' ' + (PX1 + 6) + ' ' + f(y - 26) + ' M' + (PX1 - 4) + ' ' + f(y - 18) + ' V' + f(y + 52) + '" stroke="#c9ced4" stroke-width="3" fill="none"/>';
    for (var r = 0; r < 4; r++) s += '<path d="M' + (PX1 - 16) + ' ' + f(y + 8 + r * 12) + ' H' + (PX1 - 4) + '" stroke="#c9ced4" stroke-width="2.4"/>';
    return s + '</g>';
  }
  function lights(t, k) {
    if (k <= 0) return ""; var s = "", g = .75 + .25 * Math.sin(t * 4);
    [[PX0 + 2, 372], [PX1 - 2, 380]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(24 * k) + '" fill="#fff7c0" opacity="' + f(.45 * g * k) + '" filter="url(#soft)"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#fff7c0" stroke="' + INK + '" stroke-width="1.2"/>'; });
    return s;
  }
  function fence(t, k) {
    if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">';
    s += '<rect x="' + (PX0 - 14) + '" y="' + f(GY - 34 * ease(k)) + '" width="' + (PX1 - PX0 + 28) + '" height="' + f(34 * ease(k)) + '" fill="#bfe6f7" opacity=".35" stroke="#7aa6c0" stroke-width="1.4"/>';
    for (var x = PX0 - 14; x <= PX1 + 14; x += 30) s += '<rect x="' + (x - 1.5) + '" y="' + f(GY - 36 * ease(k)) + '" width="3" height="' + f(36 * ease(k)) + '" fill="#6f7680"/>';
    return s + '</g>';
  }
  function haze(t, k) {
    if (k <= 0) return ""; var s = "";
    for (var i = 0; i < 9; i++) { var x = PX0 + 14 + i * 24 + Math.sin(t * .8 + i) * 6, y = GY - 4 - 8 * Math.sin(t * 1.1 + i * 2); s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(22 * k) + '" ry="' + f(10 * k) + '" fill="#d8e05a" opacity="' + f(.28 * k) + '" filter="url(#soft)"/>'; }
    for (var j = 0; j < 3; j++) { var sx = 110 + j * 40, sy = GY - 16; s += '<path d="M' + sx + ' ' + sy + ' q-5 -6 0 -12 q5 -6 0 -12" stroke="#9aa13a" stroke-width="2" fill="none" opacity="' + f(k * (.6 + .4 * Math.sin(t * 5 + j))) + '"/>'; }
    return s;
  }
  function confetti(t, t0, n) {
    var u = t - t0; if (u < 0 || u > 3.2) return ""; var s = "", cols = ["#ff5a4e", "#ffd23f", "#4fc3f7", "#6ee07a", "#c77dff", "#ff9f1c"];
    for (var i = 0; i < (n || 70); i++) { var a = -1.57 + (hash(i) - .5) * 2.4, v = 260 + hash(i + 3) * 260, x = 180 + Math.cos(a) * v * u * .5 + Math.sin(u * 4 + i) * 10, y = 470 + Math.sin(a) * v * u + 260 * u * u;
      var r = u * 9 + i, w = 6 + hash(i + 7) * 5; s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(w * .45) + '" fill="' + cols[i % 6] + '" transform="rotate(' + f(r * 40) + ' ' + f(x) + ' ' + f(y) + ')" opacity="' + f(clamp(3.2 - u)) + '"/>'; }
    return s;
  }

  // ── camera (world → screen). One continuous take: eases between framings, never parked ─────
  var WIDE = [196, 345, 1.22];
  var SHOTS = [
    [0, [156, 362, 1.5]], [1, [154, 376, 1.7]], [2, [154, 376, 1.55]], [3, [156, 370, 1.5]], [4, [154, 378, 1.6]], [5, [154, 376, 1.5]],
    [6, [176, 330, 1.3]], [7, [218, 372, 1.38]], [8, [318, 300, 2.4]], [9, [176, 360, 1.5]], [10, [246, 356, 2.1]], [11, [214, 408, 1.9]],
    [12, [208, 402, 1.9]], [13, [222, 410, 2.1]], [14, [222, 410, 2.1]], [15, [196, 420, 1.45]], [16, [196, 410, 1.4]], [17, [160, 356, 1.6]],
    [18, [160, 356, 1.55]], [19, [100, 320, 1.6]], [20, [160, 356, 1.4]], [21, [160, 356, 1.4]], [22, [176, 360, 1.4]], [23, WIDE], [24, WIDE]
  ];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && EV.L(SHOTS[i + 1][0]) - 0.45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : SHOTS[0][1], b = SHOTS[i][1], k = ease((t - (EV.L(SHOTS[i][0]) - 0.45)) / 1.1);
    if (i === 0) { a = [176, 320, 1.12]; k = ease(t / 2.6); }
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 3; c[1] += Math.cos(t * .29) * 2.5; c[2] *= 1 + .012 * Math.sin(t * .23);   // the creep that never stops
    return c;
  }
  function proj(c, x, y) { return [180 + (x - c[0]) * c[2], 320 + (y - c[1]) * c[2]]; }

  // ── screen-space tags, gauges and cards ──────────────────
  function tag(c, wx, wy, text, t0, t, o) {
    o = o || {}; var u = t - t0, dur = o.dur || 2.4; if (u < 0 || u > dur) return "";
    var p = proj(c, wx, wy), sc = pop(u) * clamp((dur - u) / .25), w = text.length * 8.6 + 26, col = o.red ? RED : (o.col || YEL);
    var x = Math.max(w / 2 + 8, Math.min(352 - w / 2, p[0])), y = Math.max(40, Math.min(600, p[1] - 22));
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><path d="M0 22 l-6 -10 h12 z" fill="#1b1a1f" transform="translate(' + f(Math.max(-w / 2 + 12, Math.min(w / 2 - 12, p[0] - x))) + ' -2)"/><rect x="' + f(-w / 2) + '" y="-16" width="' + f(w) + '" height="30" rx="15" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + col + '">' + text + '</text></g>';
  }
  function counter(c, wx, wy, label, val, unit, k, red) {
    if (k <= 0) return ""; var p = proj(c, wx, wy), sc = pop(k);
    return '<g transform="translate(' + f(Math.max(70, Math.min(290, p[0]))) + ' ' + f(Math.max(70, p[1])) + ') scale(' + f(sc) + ')"><rect x="-62" y="-30" width="124" height="56" rx="10" fill="#14232f" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">' + label + '</text><text x="0" y="16" text-anchor="middle" class="big" fill="' + (red ? RED : GRN) + '">' + val + ' <tspan class="sm">' + unit + '</tspan></text></g>';
  }
  function microscope(t, ev) {
    var k = after(t, ev.micro, .5) * (1 - after(t, ev.microEnd - .4, .4)); if (k <= 0) return "";
    var s = '<g transform="translate(180 270) scale(' + f(pop(after(t, ev.micro, .9)) * clamp(k * 3)) + ')"><circle r="104" fill="#f6e8c4" stroke="' + INK + '" stroke-width="5"/><clipPath id="cpMic"><circle r="100"/></clipPath><g clip-path="url(#cpMic)">';
    for (var i = 0; i < 16; i++) { var gx = -90 + (i % 4) * 60 + (Math.floor(i / 4) % 2) * 30, gy = -90 + Math.floor(i / 4) * 58; s += '<ellipse cx="' + gx + '" cy="' + gy + '" rx="27" ry="22" fill="#e2b866" stroke="#a87a30" stroke-width="2"/>'; }
    var dead = after(t, ev.kill, .8);
    for (var b = 0; b < 7; b++) { var u = (t * .25 + b / 7) % 1, bx = -80 + u * 170 + Math.sin(t * 3 + b) * 5, by = -70 + b * 22 + Math.sin(u * 12 + b) * 10;
      s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(Math.sin(t * 4 + b) * 20) + ')"><rect x="-6" y="-3" width="12" height="6" rx="3" fill="#7cc04f" stroke="#2f6a1f" stroke-width="1.2"/><path d="M6 0 q4 ' + f(Math.sin(t * 12 + b) * 3) + ' 7 0" stroke="#2f6a1f" stroke-width="1" fill="none"/></g>'; }
    s += '</g><text x="0" y="132" text-anchor="middle" class="tg" fill="' + INK + '">حبات الرمل × 100</text></g>';
    return '<rect width="360" height="640" fill="#000" opacity="' + f(.45 * k) + '"/>' + '<g opacity="' + f(clamp(k * 2)) + '">' + s + '</g>';
  }
  function factCard(t, ev) {
    var k = after(t, ev.card, .45) * (1 - after(t, ev.cardEnd - .35, .35)); if (k <= 0) return "";
    var s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.55 * k) + '"/><g transform="translate(180 300) scale(' + f(pop(after(t, ev.card, .9))) + ')">';
    s += '<rect x="-150" y="-170" width="300" height="320" rx="22" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="3"/><text x="0" y="-136" text-anchor="middle" class="hd" fill="' + INK + '">وهل تعلم؟</text>';
    // a pool lined all in white, seen from the side: shallow end pale, deep end blue
    var blueK = after(t, ev.cardBlue - .6, 1.2), deepK = after(t, ev.cardDeep, 1.2);
    s += '<path d="M-120 -96 V-20 H-30 L30 40 H120 V-96 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += '<linearGradient id="gDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mixc("#ffffff", "#9fd6f0", blueK) + '"/><stop offset="1" stop-color="' + mixc("#ffffff", "#1f6fb8", blueK * (0.6 + .4 * deepK)) + '"/></linearGradient>';
    s += '<path d="M-117 -86 V-23 H-31 L29 37 H117 V-86 Z" fill="url(#gDeep)"/>';
    for (var w = 0; w < 4; w++) s += '<path d="M' + (-110 + w * 60 + Math.sin(t * 2 + w) * 4) + ' -80 q10 -4 20 0" stroke="#fff" stroke-width="2" fill="none"/>';
    var redK = after(t, ev.cardRed, 1.6);
    if (redK > 0) {                         // white light goes in, the red part fades on the way down
      for (var r = 0; r < 3; r++) { var col = ["#ff4a3a", "#3fbf5a", "#3a7bff"][r], x0 = -60 + r * 22, fade = r === 0 ? 1 - redK : 1;
        s += '<path d="M' + x0 + ' -112 L' + (x0 + 40) + ' 20" stroke="' + col + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="150" stroke-dashoffset="' + f(150 * (1 - clamp(redK * 2))) + '" opacity="' + f(clamp(fade + .1)) + '"/>'; }
      s += '<g transform="translate(-138 56)" opacity="' + f(clamp(redK * 2)) + '"><rect x="0" y="-14" width="96" height="26" rx="13" fill="#1b1a1f"/><text x="48" y="5" text-anchor="middle" class="sm" fill="' + RED + '">يمتصّ الأحمر</text></g>';
    }
    s += '<text x="40" y="118" text-anchor="middle" class="big" fill="#1f6fb8" opacity="' + f(blueK) + '">الماء أزرق!</text>';
    if (deepK > 0) s += '<g opacity="' + f(deepK) + '"><path d="M128 -60 V20" stroke="' + INK + '" stroke-width="2.4" marker-end="url(#arr)"/><text x="132" y="34" text-anchor="end" class="sm" fill="' + INK + '">أعمق = أزرق</text></g>';
    return s + '</g>';
  }
  function voteCard(t, ev) {
    var k = after(t, ev.vote, .45); if (k <= 0) return "";
    var s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.6 * k) + '"/><g transform="translate(180 250) scale(' + f(pop(after(t, ev.vote, .9))) + ')">';
    s += '<rect x="-120" y="-122" width="240" height="64" rx="18" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3"/><path d="M-20 -60 l14 18 l8 -18 z" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M-22 -61 h26" stroke="#ff8c1a" stroke-width="5"/>';
    s += '<text x="0" y="-80" text-anchor="middle" class="hd" fill="#fff">اكتب فكرتك!</text><text x="0" y="-26" text-anchor="middle" class="sm" fill="#f1e6cf">الأكثر إعجابًا = الفيديو القادم</text>';
    var rows = [["مصعد", 214], ["فكرتك أنت!", 603], ["جسر معلّق", 361], ["قطار", 128]];
    for (var r = 0; r < 4; r++) { var y = 8 + r * 50, u = after(t, ev.vote + .25 + r * .18, .5), grow = after(t, ev.vote + 1, 3.5), n = Math.round(rows[r][1] * (1 + (r === 1 ? 0.65 : 0.12) * grow));
      s += '<g transform="translate(' + f((1 - ease(u)) * 260) + ' ' + y + ')"><rect x="-125" y="-19" width="250" height="40" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text x="102" y="7" text-anchor="end" class="tg" fill="' + INK + '">' + rows[r][0] + '</text>';
      s += '<rect x="-115" y="-11" width="62" height="24" rx="12" fill="#1b1a1f"/><text x="-70" y="6" text-anchor="end" class="sm" fill="#fff">' + n + '</text><path d="M-104 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '"/></g>'; }
    for (var h = 0; h < 6; h++) { var hu = ((t - ev.vote) * .5 + h / 6) % 1; s += '<path transform="translate(' + f(-90 + h * 34 + Math.sin(t * 2 + h) * 8) + ' ' + f(230 - hu * 140) + ') scale(1.4)" d="M-4 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '" opacity="' + f((1 - hu) * k) + '"/>'; }
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var ev = EV, c = cam(t);
    // build state
    var holeK = after(t, ev.dig, 1.7), soakK = after(t, ev.soak, 2.6), mudK = after(t, ev.mud, 1.4);
    var shellK = t >= ev.shell && t < ev.rebar ? after(t, ev.shell, .5) : 0, crackK = t < ev.rebar ? after(t, ev.crack, .7) : 0;
    var rebarK = after(t, ev.rebar, .6) * (1 - after(t, ev.sprayEnd, .6)), sprayK = after(t, ev.spray, ev.sprayEnd - ev.spray), finalShell = t >= ev.sprayEnd ? 1 : 0;
    var lvl = 0, wcol = "#3f9ee0";
    if (t < ev.soak) lvl = after(t, ev.fill0, 1.2) * .82;
    else if (t < ev.shell) { lvl = .82 * (1 - soakK); wcol = mixc("#3f9ee0", "#8a6a3a", soakK); }
    else if (t < ev.rebar) { lvl = after(t, ev.fill1, 2) * .92 * (1 - after(t, ev.crack + .5, 2.5) * .35); }
    else if (t >= ev.fill2) lvl = after(t, ev.fill2, 1.6) * .92;
    var greenK = after(t, ev.green, 1.5) * (1 - after(t, ev.clear, 1.8));
    if (t >= ev.fill2) wcol = mixc("#3f9ee0", "#6f9a2a", greenK);
    if (t >= ev.tiles) wcol = mixc("#3f9ee0", "#2fb0e6", after(t, ev.tiles, 1));
    var hazeK = after(t, ev.haze, 1.2) * (1 - after(t, ev.wash + .6, 1.5));

    var s = sky(t, after(t, ev.green - .8, 1) * (1 - after(t, ev.clear, 1.5))) + villa(t) + palm(26, t) + fence(t, after(t, ev.fence, .8));
    s += soil(t, soakK * (t < ev.shell ? 1 : 0)) + lawn(t, holeK > 0);
    // the hole being dug, then the shell
    if (holeK > 0 && finalShell === 0 && shellK === 0 && sprayK === 0) {
      var hk = ease(holeK), mud = mudK * (t < ev.shell ? 1 : 0);
      s += '<g transform="translate(154 ' + GY + ') scale(1 ' + f(hk) + ') translate(-154 -' + GY + ')"><path d="' + HOLE + '" fill="#5a3c22" stroke="' + INK + '" stroke-width="2"/></g>';
      if (mud > 0) s += '<path d="M' + PX0 + ' ' + GY + ' q14 ' + f(30 * mud) + ' 6 ' + f(58 * mud) + ' L' + PX0 + ' 388 Z M' + PX1 + ' ' + GY + ' q-16 ' + f(34 * mud) + ' -8 ' + f(70 * mud) + ' L' + PX1 + ' 424 Z" fill="#7a5a36" stroke="' + INK + '" stroke-width="1.6"/>';
    }
    s += shellDraw(t, finalShell || shellK, crackK, rebarK, finalShell ? 1 : sprayK, after(t, ev.tiles, .8));
    // spray nozzle while the shell is shot
    if (t >= ev.spray && t < ev.sprayEnd) { var sx = lerp(PX0, PX1, sprayK), sy = floorY(Math.min(PX1, Math.max(PX0, sx))) - 40;
      s += '<path d="M' + f(sx + 30) + ' ' + f(sy - 60) + ' L' + f(sx + 4) + ' ' + f(sy) + '" stroke="#2b2b2b" stroke-width="6" stroke-linecap="round"/>';
      for (var p = 0; p < 14; p++) { var u = (t * 4 + p / 14) % 1; s += '<circle cx="' + f(sx + (hash(p) - .5) * 26 * u) + '" cy="' + f(sy + u * 40) + '" r="' + f(1.4 + u * 2) + '" fill="#a7a198" opacity="' + f(1 - u) + '"/>'; } }
    s += lights(t, after(t, ev.lights, .6));
    s += water(t, lvl, wcol, t >= ev.tiles ? .78 : .9);
    if (crackK > 0 && t < ev.rebar) for (var d = 0; d < 6; d++) { var u2 = (t * 1.5 + d / 6) % 1; s += '<circle cx="' + f(PX0 - 8 - u2 * 18) + '" cy="' + f(354 + d * 4 + u2 * 20) + '" r="2" fill="#3f9ee0" opacity="' + f(crackK * (1 - u2)) + '"/><circle cx="' + f(PX1 + 8 + u2 * 18) + '" cy="' + f(362 + d * 4 + u2 * 20) + '" r="2" fill="#3f9ee0" opacity="' + f(crackK * (1 - u2)) + '"/>'; }
    // pressure arrows on the walls while it fills with 48 t
    var tonK = t < ev.rebar ? after(t, ev.ton, .6) : 0;
    if (tonK > 0) for (var a = 0; a < 3; a++) { var pu = Math.sin(t * 6 + a) * 2; s += '<path d="M' + f(PX0 + 22 + pu) + ' ' + (350 + a * 14) + ' h-16 m5 -5 l-5 5 l5 5" stroke="' + RED + '" stroke-width="3" fill="none" opacity="' + f(tonK) + '"/><path d="M' + f(PX1 - 22 - pu) + ' ' + (356 + a * 18) + ' h16 m-5 -5 l5 5 l-5 5" stroke="' + RED + '" stroke-width="3" fill="none" opacity="' + f(tonK) + '"/>'; }
    var twin = t >= ev.twin, pipeK = after(t, ev.pump, .6);
    s += pipes(t, pipeK, after(t, ev.flow, .5), { twin: twin, skim: t >= ev.skimmer, cell: after(t, ev.cell, .9) });
    s += pumpPad(t, after(t, ev.pump, .9), after(t, ev.flow, .5));
    if (t >= ev.drain) s += drains(t, { twin: twin, dome: after(t, ev.dome, .6), suck: after(t, ev.drain, .5) * (1 - after(t, ev.free, .5)) + after(t, ev.free + .6, .5) * .5 });
    s += skimmer(t, after(t, ev.skimmer, .9));
    if (t >= ev.leaves) s += leaves(t, ev, lvl);
    if (t >= ev.drain && t < ev.dive) s += dirt(t, ev);
    // the swimmer: dives near the drain, gets held by the hair, freed by the twin drains
    if (t >= ev.dive && t < ev.micro) {
      var dk = after(t, ev.dive, 1.4), fr = after(t, ev.free, 1.6), held = after(t, ev.grab, .5) * (1 - fr);
      var px = lerp(120, DRAIN1 - 6, ease(dk)) + Math.sin(t * 9) * 2 * held, py = lerp(GY + 4, 404, ease(dk)) - fr * 70;
      s += person(px, py, { t: t, rot: lerp(30, 0, dk) - fr * 25, hair: held > 0 ? [lerp(-17, DRAIN1 - px, held), lerp(14, 424 - py, held)] : null });
      if (held > 0) s += '<g transform="translate(' + f(px) + ' ' + f(py - 26) + ') scale(' + f(pop(held)) + ')"><path d="M0 -12 L12 9 H-12 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/><text x="0" y="6" text-anchor="middle" class="tg" fill="' + INK + '">!</text></g>';
    }
    if (t >= ev.swim2 && t < ev.card) {
      var sw = after(t, ev.wash - .8, 1.2), back = after(t, ev.wash + .9, 1.2);
      var x2 = sw > 0 ? lerp(140, 30, ease(sw)) : 120 + Math.sin(t * .8) * 60, y2 = sw > 0 ? lerp(GY + 6, GY - 22, ease(sw)) : GY + 8;
      if (back > 0) { x2 = lerp(30, 120, ease(back)); y2 = lerp(GY - 22, GY + 8, ease(back)); }
      var stand = sw > .5 && back < .5;
      s += person(x2, y2, stand ? { stand: true, arm: Math.sin(t * 8) * 4 } : { t: t, redEye: after(t, ev.eyes, .4) * (1 - after(t, ev.wash, .5)) > .5 });
      if (t >= ev.sweat && t < ev.haze + 1) for (var w2 = 0; w2 < 4; w2++) { var su = (t * 1.6 + w2 / 4) % 1; s += '<path d="M' + f(x2 - 10 + w2 * 6) + ' ' + f(y2 - 8 + su * 14) + ' q2 3 0 5 q-2 -2 0 -5" fill="#9fe0f7" opacity="' + f(1 - su) + '"/>'; }
    }
    s += showerPost(t, after(t, ev.shower, .8), after(t, ev.wash - .3, .4) * (1 - after(t, ev.wash + 1.6, .4)));
    s += haze(t, hazeK);
    s += ladder(t, after(t, ev.ladder, .7));
    // salt bag pouring into the pool
    if (t >= ev.salt && t < ev.tagCell) { var bk = after(t, ev.salt, .5) * (1 - after(t, ev.tagCell - .5, .5));
      s += '<g transform="translate(90 ' + f(GY - 46) + ') rotate(' + f(-40 * bk) + ')" opacity="' + f(bk) + '"><rect x="-16" y="-20" width="32" height="40" rx="5" fill="#f4f1e4" stroke="' + INK + '" stroke-width="2"/><text x="0" y="5" text-anchor="middle" class="sm" fill="#1f6fb8">ملح</text></g>';
      for (var g2 = 0; g2 < 14; g2++) { var gu = (t * 2 + g2 / 14) % 1; s += '<rect x="' + f(80 + (hash(g2) - .5) * 10) + '" y="' + f(GY - 34 + gu * 40) + '" width="2" height="2" fill="#fff" opacity="' + f(bk * (1 - gu)) + '"/>'; } }
    // chlorine sparkles in the water once the cell runs
    var clK = after(t, ev.kill, .8) * (t < ev.haze ? 1 : .4);
    if (clK > 0 && t < ev.card) for (var cl = 0; cl < 10; cl++) { var cu = (t * .5 + cl / 10) % 1; s += '<circle cx="' + f(PX0 + 12 + hash(cl) * 200) + '" cy="' + f(400 - cu * 50) + '" r="1.6" fill="#e9ff8a" opacity="' + f(clK * Math.sin(cu * 3.14)) + '"/>'; }

    var W = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';

    // screen layer: tags and gauges
    var T = "";
    T += tag(c, 154, GY - 10, "مسبح بدائي!", ev.yay0 - .3, t, { dur: 2.2 });
    T += tag(c, 154, 360, "تسرّب!", ev.soak + .8, t, { red: true });
    T += tag(c, PX0, 350, "خرسانة", ev.shell, t, { col: CREAM });
    T += tag(c, PX0 - 4, 344, "تشقّق!", ev.crack + .2, t, { red: true, dur: 2 });
    T += tag(c, 120, 360, "حديد التسليح", ev.rebar, t);
    T += tag(c, 154, 380, "الخرسانة المرشوشة", ev.tagShot - .2, t, { dur: 2.2 });
    T += tag(c, 160, GY + 6, "طحالب!", ev.green + .4, t, { red: true });
    T += tag(c, 296, 306, "مضخة", ev.pump, t, { col: CREAM, dur: 1.8 });
    T += tag(c, 333, 268, "فلتر الرمل", ev.tagSand - .2, t);
    T += tag(c, PX1 + 6, 344, "السكيمر", ev.tagSkim - .2, t);
    T += tag(c, DRAIN1, 422, "فتحة القاع", ev.drain + .1, t, { col: CREAM });
    T += tag(c, DRAIN1 - 30, 380, "خطر الشفط!", ev.grab + .1, t, { red: true });
    T += tag(c, 222, 418, "≈ 1 م", ev.meter, t, { dur: 2 });
    T += tag(c, 222, 414, "غطاء مقبّب", ev.dome + .1, t);
    T += tag(c, 150, 456, "مولّد الكلور الملحي", ev.tagCell - .2, t, { dur: 2.6 });
    T += tag(c, 160, GY - 12, "كلورامين", ev.tagCa - .2, t, { red: true });
    T += tag(c, 30, 236, "دُش", ev.shower + .1, t);
    T += tag(c, 154, GY + 30, "بلاط", ev.tiles, t, { col: CREAM, dur: 1.4 });
    T += tag(c, PX1 - 8, GY - 20, "سلّم", ev.ladder, t, { col: CREAM, dur: 1.2 });
    T += tag(c, PX0 + 4, 372, "إضاءة", ev.lights, t, { col: CREAM, dur: 1.3 });
    T += tag(c, 150, GY - 34, "سور", ev.fence, t, { col: CREAM, dur: 1.4 });
    // the 48 t counter and the salt gauge, chlorine gauge
    if (t < ev.rebar + .5) { var tk = after(t, ev.ton, .5) * (1 - after(t, ev.rebar, .4)); T += counter(c, 154, 300, "وزن الماء", Math.round(48 * after(t, ev.ton, 1.2)), "طن", tk, true); }
    if (t >= ev.salty && t < ev.swim2) { var sk = after(t, ev.salty, .5) * (1 - after(t, ev.swim2 - .4, .4)), fill = after(t, ev.salty + .3, 1.2);
      var b1 = 170 * fill, b2 = Math.max(16, 170 * fill * 3000 / 35000);
      T += '<g transform="translate(180 116) scale(' + f(pop(sk)) + ')" opacity="' + f(clamp(sk * 3)) + '"><rect x="-150" y="-56" width="300" height="118" rx="14" fill="#14232f" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-32" text-anchor="middle" class="tg" fill="#9fc3d6">الملوحة (جزء في المليون)</text>';
      T += '<text x="138" y="2" text-anchor="end" class="tg" fill="#fff">البحر</text><rect x="-136" y="-14" width="' + f(b1) + '" height="22" rx="11" fill="#4f8fd0"/><text x="' + f(-136 + b1 - 8) + '" y="2" text-anchor="end" class="sm" fill="#fff" opacity="' + f(clamp(fill * 2 - 1)) + '">35٬000</text>';
      T += '<text x="138" y="40" text-anchor="end" class="tg" fill="#fff">المسبح</text><rect x="-136" y="24" width="' + f(b2) + '" height="22" rx="11" fill="' + GRN + '"/><text x="' + f(-136 + b2 + 6) + '" y="40" text-anchor="start" class="tg" fill="' + GRN + '">3٬000</text></g>'; }
    if (t >= ev.gauge && t < ev.shower) { var gk = after(t, ev.gauge, .5) * (1 - after(t, ev.shower - .4, .4)), needle = lerp(.8, .14, after(t, ev.gauge + .3, 1.4)) + Math.sin(t * 9) * .02;
      T += '<g transform="translate(180 128) scale(' + f(pop(gk)) + ')" opacity="' + f(clamp(gk * 3)) + '"><rect x="-90" y="-52" width="180" height="96" rx="14" fill="#14232f" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-32" text-anchor="middle" class="sm" fill="#9fc3d6">الكلور الحرّ</text>';
      T += '<path d="M-60 26 A60 60 0 0 1 60 26" stroke="#2b3a46" stroke-width="12" fill="none"/><path d="M-60 26 A60 60 0 0 1 -42 -16" stroke="' + RED + '" stroke-width="12" fill="none"/><path d="M42 -16 A60 60 0 0 1 60 26" stroke="' + GRN + '" stroke-width="12" fill="none"/>';
      var na = Math.PI * (1 - needle); T += '<path d="M0 26 L' + f(Math.cos(na) * 50) + ' ' + f(26 - Math.sin(na) * 50) + '" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="0" cy="26" r="5" fill="#fff"/><text x="0" y="40" text-anchor="middle" class="sm" fill="' + RED + '">ناقص!</text></g>'; }
    T += microscope(t, ev);
    T += factCard(t, ev);
    T += confetti(t, ev.yay0, 60) + confetti(t, ev.yay, 90);
    T += voteCard(t, ev);
    return W + T;
  };
})();
