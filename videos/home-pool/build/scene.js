/* «ابنيها بنفسك» — المسبح, 2.5D. The pool is seen from the front and a little from above (one-point perspective):
   the front is a cut through the soil (cross-section with the shell, the pipes and the machines), and behind the cut
   we see the floor, the slope, the back wall and the side walls going back in depth, then the lawn and the house.
   P(x, h, z): x across, h height above the ground (negative = underground), z depth into the picture (0 = the cut).
   Every part has an "on" time in EV (events.js) and stays once built. Layers: world (camera) → tags/gauges → cards. */
(function () {
  var EV = window.EV;
  var INK = "#1d1b19", CREAM = "#fbefd2", YEL = "#ffd23f", RED = "#ff5a4e", GRN = "#6ee07a";
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.18) return 1.18 * ease(u / 0.18); if (u < 0.32) return lerp(1.18, 1, (u - 0.18) / 0.14); return 1; }
  function after(t, t0, d) { return clamp((t - t0) / (d || 0.6)); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mixc(a, b, k) { var A = hex(a), B = hex(b); return "rgb(" + A.map(function (v, i) { return Math.round(lerp(v, B[i], clamp(k))); }).join(",") + ")"; }

  // ── projection ─────────────────────────────────────
  var VPX = 180, VPY = -600, DD = 600, YB = 300;
  function P(x, h, z) { var s = 1 / (1 + z / DD); return [VPX + (x - VPX) * s, VPY + (YB - h - VPY) * s]; }
  function pt(p) { return f(p[0]) + " " + f(p[1]); }
  function poly(pts) { return "M" + pts.map(function (q) { return pt(P(q[0], q[1], q[2])); }).join(" L") + " Z"; }
  function line3(a, b) { return "M" + pt(P(a[0], a[1], a[2])) + " L" + pt(P(b[0], b[1], b[2])); }

  // ── the pool's shape ─────────────────────────────────
  var X0 = 34, XA = 132, XB = 190, X1 = 276, HS = 46, HD = 80, PD = 36, WT = 7, ZH = 62;   // ZH: the house front
  function floorH(x) { return x < XA ? -HS : x > XB ? -HD : lerp(-HS, -HD, (x - XA) / (XB - XA)); }
  function slopeX(h) { return XA + (XB - XA) * (-HS - h) / (HD - HS); }
  var PROF = [[X0, 0], [X0, -HS], [XA, -HS], [XB, -HD], [X1, -HD], [X1, 0]];
  function profAt(z) { return PROF.map(function (q) { return [q[0], q[1], z]; }); }
  var DRAIN1 = 233, DRAINS = [214, 252], DZ = PD * 0.5;
  var PAD = { x0: 288, x1: 354 };

  // faces of the inside, back to front
  var FACES = {
    back: profAt(PD),
    left: [[X0, 0, 0], [X0, -HS, 0], [X0, -HS, PD], [X0, 0, PD]],
    right: [[X1, 0, 0], [X1, -HD, 0], [X1, -HD, PD], [X1, 0, PD]],
    fS: [[X0, -HS, 0], [XA, -HS, 0], [XA, -HS, PD], [X0, -HS, PD]],
    fM: [[XA, -HS, 0], [XB, -HD, 0], [XB, -HD, PD], [XA, -HS, PD]],
    fD: [[XB, -HD, 0], [X1, -HD, 0], [X1, -HD, PD], [XB, -HD, PD]]
  };
  var PAL = {
    dirt: { back: "#6b4426", left: "#5a381f", right: "#5e3c22", fS: "#80552f", fM: "#73492a", fD: "#7c5230" },
    conc: { back: "#dedad2", left: "#c3bfb7", right: "#bab6ae", fS: "#d0ccc4", fM: "#c2beb6", fD: "#ccc8c0" },
    tile: { back: "#7fcdee", left: "#5fb8e0", right: "#58b0da", fS: "#9adcf5", fM: "#86d0f0", fD: "#92d8f4" }
  };
  function insideFaces(pal, op) {
    var s = "";
    ["back", "fS", "fM", "fD", "left", "right"].forEach(function (k) { s += '<path d="' + poly(FACES[k]) + '" fill="' + pal[k] + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round" opacity="' + (op == null ? 1 : op) + '"/>'; });
    return s;
  }
  function faceGrid(col, w, step) {           // a grid on every inside face (rebar, then tiles)
    var s = "", z, x, h;
    for (x = X0; x <= X1; x += step) s += '<path d="' + line3([x, 0, PD], [x, floorH(x), PD]) + '"/>';
    for (h = -step; h > -HD; h -= step) s += '<path d="' + line3([h >= -HS ? X0 : slopeX(h), h, PD], [X1, h, PD]) + '"/>';
    for (x = X0; x <= X1; x += step) s += '<path d="' + line3([x, floorH(x), 0], [x, floorH(x), PD]) + '"/>';
    for (z = 0; z <= PD; z += step * 0.6) { s += '<path d="' + line3([X0, -HS, z], [XA, -HS, z]) + ' L' + pt(P(XB, -HD, z)) + ' L' + pt(P(X1, -HD, z)) + '"/>'; s += '<path d="' + line3([X0, 0, z], [X0, -HS, z]) + '"/><path d="' + line3([X1, 0, z], [X1, -HD, z]) + '"/>'; }
    for (h = -step; h > -HD; h -= step) { if (h >= -HS) s += '<path d="' + line3([X0, h, 0], [X0, h, PD]) + '"/>'; s += '<path d="' + line3([X1, h, 0], [X1, h, PD]) + '"/>'; }
    return '<g stroke="' + col + '" stroke-width="' + w + '" fill="none">' + s + '</g>';
  }
  // the cut: the shell's thickness on the front face, with the steel shown as a red dotted line
  function frontBand(k, rebarDots) {
    var o = [[X0 - WT, 0], [X0 - WT, -HS - WT], [XA - 3, -HS - WT], [XB - 3, -HD - WT], [X1 + WT, -HD - WT], [X1 + WT, 0]];
    var d = "M" + o.map(function (q) { return pt(P(q[0], q[1], 0)); }).join(" L") + " L" + PROF.slice().reverse().map(function (q) { return pt(P(q[0], q[1], 0)); }).join(" L") + " Z";
    var s = '<path d="' + d + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(k) + '"/>';
    if (rebarDots > 0) { var m = [[X0 - WT / 2, 0], [X0 - WT / 2, -HS - WT / 2], [XA - 1.5, -HS - WT / 2], [XB - 1.5, -HD - WT / 2], [X1 + WT / 2, -HD - WT / 2], [X1 + WT / 2, 0]];
      s += '<path d="M' + m.map(function (q) { return pt(P(q[0], q[1], 0)); }).join(" L") + '" stroke="#d2402e" stroke-width="1.6" fill="none" opacity="' + f(rebarDots) + '"/>';
      s += '<path d="M' + m.map(function (q) { return pt(P(q[0], q[1], 0)); }).join(" L") + '" stroke="#d2402e" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="0 9" fill="none" opacity="' + f(rebarDots) + '"/>'; }
    s += '<path d="' + poly([[X0 - WT, 0, 0], [X0, 0, 0], [X0, 0, PD], [X0 - WT, 0, PD + WT]]) + '" fill="#cfcbc3" stroke="' + INK + '" stroke-width="1" opacity="' + f(k) + '"/>';
    s += '<path d="' + poly([[X1, 0, 0], [X1 + WT, 0, 0], [X1 + WT, 0, PD + WT], [X1, 0, PD]]) + '" fill="#cfcbc3" stroke="' + INK + '" stroke-width="1" opacity="' + f(k) + '"/>';
    s += '<path d="' + poly([[X0, 0, PD], [X1, 0, PD], [X1 + WT, 0, PD + WT], [X0 - WT, 0, PD + WT]]) + '" fill="#e3dfd7" stroke="' + INK + '" stroke-width="1" opacity="' + f(k) + '"/>';
    return s;
  }
  function holeOutline() { return "M" + PROF.map(function (q) { return pt(P(q[0], q[1], 0)); }).join(" L") + " Z"; }

  // ── background ───────────────────────────────────
  function sky(t, sunK) {
    var s = '<rect x="-300" y="-300" width="960" height="560" fill="url(#gSky)"/>';
    var sx = 300, sy = 34 - 4 * Math.sin(t * .3), r = 18 + 14 * sunK;
    s += '<circle cx="' + sx + '" cy="' + f(sy) + '" r="' + f(r * 2.2) + '" fill="#ffe9a8" opacity="' + f(.35 + .4 * sunK) + '" filter="url(#soft)"/><circle cx="' + sx + '" cy="' + f(sy) + '" r="' + f(r) + '" fill="#ffd95a"/>';
    if (sunK > .05) for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283 + t * .4, r1 = r + 5, r2 = r + 12 + 5 * Math.sin(t * 3 + k); s += '<path d="M' + f(sx + Math.cos(a) * r1) + ' ' + f(sy + Math.sin(a) * r1) + ' L' + f(sx + Math.cos(a) * r2) + ' ' + f(sy + Math.sin(a) * r2) + '" stroke="#ffc83a" stroke-width="3" stroke-linecap="round" opacity="' + f(sunK) + '"/>'; }
    for (var i = 0; i < 5; i++) { var x = ((hash(i) * 560 + t * (4 + i)) % 560) - 100, y = 8 + hash(i + 7) * 60, w = 26 + hash(i * 3) * 26;
      s += '<g fill="#fff" opacity=".93"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * .3) + '"/><ellipse cx="' + f(x - w * .35) + '" cy="' + f(y - w * .18) + '" rx="' + f(w * .45) + '" ry="' + f(w * .32) + '"/><ellipse cx="' + f(x + w * .25) + '" cy="' + f(y - w * .22) + '" rx="' + f(w * .4) + '" ry="' + f(w * .35) + '"/></g>'; }
    return s;
  }
  function villa(t) {                         // an Egyptian two-storey villa, seen straight on behind the garden
    var base = P(0, 0, ZH)[1], x0 = 52, x1 = 308, top = 70, mid = 140, s = "";
    s += '<rect x="-40" y="' + f(base - 34) + '" width="440" height="34" fill="#e8d6b4" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var b = 0; b < 4; b++) s += '<circle cx="' + (-10 + b * 26) + '" cy="' + f(base - 34) + '" r="16" fill="#5c9a46"/><circle cx="' + (322 + b * 22) + '" cy="' + f(base - 34) + '" r="15" fill="#5c9a46"/>';
    s += '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + f(base - top) + '" fill="url(#gWall)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x0 - 6) + '" y="' + (top - 8) + '" width="' + (x1 - x0 + 12) + '" height="9" fill="#d8c6a6" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<rect x="' + (x0 - 4) + '" y="' + mid + '" width="' + (x1 - x0 + 8) + '" height="6" fill="#d8c6a6" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<rect x="250" y="42" width="32" height="22" rx="3" fill="#ecebe6" stroke="' + INK + '" stroke-width="1.8"/><rect x="254" y="62" width="3" height="8" fill="' + INK + '"/><rect x="275" y="62" width="3" height="8" fill="' + INK + '"/>';
    s += '<g transform="translate(96 54) rotate(' + f(-18 + Math.sin(t * .2)) + ')"><path d="M-12 0 A12 12 0 0 0 12 0 Z" fill="#f4f4f2" stroke="' + INK + '" stroke-width="1.8"/><path d="M0 2 V12" stroke="' + INK + '" stroke-width="1.8"/></g>';
    for (var k = 0; k < 4; k++) { var wx = 72 + k * 60;
      s += '<rect x="' + wx + '" y="84" width="26" height="36" fill="#7fb2cf" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + (wx + 13) + ' 84 V120 M' + wx + ' 102 H' + (wx + 26) + '" stroke="#fff" stroke-width="1.4"/>';
      s += '<rect x="' + (wx - 7) + '" y="84" width="6" height="36" fill="#8a5a34" stroke="' + INK + '" stroke-width="1.2"/><rect x="' + (wx + 27) + '" y="84" width="6" height="36" fill="#8a5a34" stroke="' + INK + '" stroke-width="1.2"/>'; }
    s += '<rect x="62" y="122" width="236" height="3" fill="#d8c6a6" stroke="' + INK + '" stroke-width="1"/>';
    for (var r = 0; r < 26; r++) s += '<rect x="' + (64 + r * 9) + '" y="125" width="2" height="13" fill="' + INK + '"/>';
    s += '<path d="M164 ' + f(base) + ' V' + f(base - 46) + ' A16 16 0 0 1 196 ' + f(base - 46) + ' V' + f(base) + ' Z" fill="#6b4224" stroke="' + INK + '" stroke-width="1.8"/><circle cx="190" cy="' + f(base - 22) + '" r="2" fill="' + YEL + '"/>';
    [80, 118, 230, 268].forEach(function (ax) { s += '<path d="M' + ax + ' ' + f(base - 8) + ' V' + f(base - 44) + ' A12 12 0 0 1 ' + (ax + 24) + ' ' + f(base - 44) + ' V' + f(base - 8) + ' Z" fill="#7fb2cf" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + (ax + 12) + ' ' + f(base - 56) + ' V' + f(base - 8) + '" stroke="#fff" stroke-width="1.2"/>'; });
    for (var g = 0; g < 24; g++) { var gx = 156 + hash(g) * 48, gy = mid + 8 + hash(g + 3) * 18 + Math.sin(t * 2 + g) * .8; s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(3 + hash(g + 9) * 3) + '" fill="' + (g % 3 ? "#e0418a" : "#c22d72") + '"/>'; }
    return s;
  }
  function palm(x, base, sc, t) {
    var sw = Math.sin(t * 1.1) * 3, s = '<g transform="translate(' + x + ' ' + f(base) + ') scale(' + sc + ')"><path d="M0 0 Q-8 -70 ' + f(4 + sw * .4) + ' -150" stroke="#8a6a3a" stroke-width="9" fill="none" stroke-linecap="round"/>';
    for (var r = 0; r < 8; r++) s += '<path d="M-6 ' + (-8 - r * 18) + ' l11 -3" stroke="#6b4f2a" stroke-width="2"/>';
    for (var k = 0; k < 8; k++) { var a = -2.9 + k * .42 + Math.sin(t * 1.4 + k) * .05, L = 50 + (k % 2) * 10; s += '<path d="M' + f(4 + sw * .4) + ' -150 Q' + f(4 + Math.cos(a) * L * .55) + ' ' + f(-168 + Math.sin(a) * L * .3) + ' ' + f(4 + sw * .4 + Math.cos(a) * L) + ' ' + f(-150 + Math.sin(a) * L * .55 + 18) + '" stroke="#3f8f3a" stroke-width="7" fill="none" stroke-linecap="round"/>'; }
    return s + '</g>';
  }
  function lawn(t) {
    var far = ZH, s = '<path d="' + poly([[-200, 0, 0], [560, 0, 0], [560, 0, far], [-200, 0, far]]) + '" fill="#79c24c"/>';
    for (var i = 0; i < 9; i++) { var z0 = i * far / 9, z1 = z0 + far / 18; s += '<path d="' + poly([[-200, 0, z0], [560, 0, z0], [560, 0, z1], [-200, 0, z1]]) + '" fill="#6db341" opacity=".6"/>'; }
    for (var g = 0; g < 70; g++) { var x = -30 + g * 6 + hash(g) * 4, p = P(x, 0, 0), sw = Math.sin(t * 2 + g) * 1.4; if (x > X0 - 10 && x < X1 + 10) continue; s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' q' + f(sw) + ' -5 ' + f(sw * 1.4) + ' -8" stroke="#4f9a35" stroke-width="1.5" fill="none"/>'; }
    return s;
  }
  function soil(t, wet) {
    var s = '<rect x="-300" y="' + YB + '" width="960" height="700" fill="url(#gSoil)"/>';
    for (var i = 0; i < 26; i++) { var x = -40 + hash(i) * 440, y = YB + 20 + hash(i + 40) * 300; s += '<path d="M' + f(x) + ' ' + f(y) + ' q' + f(-6 + hash(i + 2) * 12) + ' 30 ' + f(-4 + hash(i + 3) * 8) + ' 60" stroke="#6a4428" stroke-width="1.4" fill="none" opacity=".55"/>'; }
    for (var j = 0; j < 60; j++) { var x2 = -40 + hash(j + 90) * 440, y2 = YB + 10 + hash(j + 140) * 320, r = 1.5 + hash(j + 5) * 3.5; s += '<ellipse cx="' + f(x2) + '" cy="' + f(y2) + '" rx="' + f(r) + '" ry="' + f(r * .7) + '" fill="' + (j % 3 ? "#5e4029" : "#b08c62") + '" opacity=".6"/>'; }
    if (wet > 0) s += '<path d="' + holeOutline() + '" fill="#3c2a1a" opacity="' + f(.55 * wet) + '" transform="translate(155 ' + (YB + 40) + ') scale(' + f(1 + .5 * wet) + ') translate(-155 -' + (YB + 40) + ')" filter="url(#soft)"/>';
    return s;
  }

  // ── water: the surface plane plus the cut face, at height hw (0 = brim, negative = lower) ─────
  function water(t, hw, col, op) {
    if (hw <= -HD + 1) return "";
    var xl = hw >= -HS ? X0 : slopeX(hw), s = "", a = op == null ? .88 : op;
    var bwTop = P(0, hw, PD)[1];
    s += '<clipPath id="cpBW"><rect x="-50" y="' + f(bwTop) + '" width="460" height="400"/></clipPath><path d="' + poly(FACES.back) + '" fill="' + col + '" opacity=".55" clip-path="url(#cpBW)"/>';
    var surf = [[xl, hw, 0], [X1, hw, 0], [X1, hw, PD], [xl, hw, PD]];
    s += '<path d="' + poly(surf) + '" fill="' + col + '" opacity="' + f(a * .62) + '"/>';
    for (var k = 0; k < 8; k++) { var zx = xl + 8 + ((hash(k) * (X1 - xl - 30) + t * (6 + k)) % Math.max(10, X1 - xl - 24)), zz = 4 + hash(k + 3) * (PD - 8), p = P(zx, hw, zz), w = 9 * (1 - zz / 120); s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' q' + f(w / 2) + ' -2 ' + f(w) + ' 0" stroke="#fff" stroke-width="1.2" fill="none" opacity=".55"/>'; }
    var top = P(0, hw, 0)[1], d = "M" + f(P(xl, hw, 0)[0]) + " " + f(top);
    for (var x = xl; x <= X1; x += 6) d += " L" + f(P(x, hw, 0)[0]) + " " + f(top + Math.sin(x * .09 + t * 3) * 1.4);
    d += " L" + pt(P(X1, hw, 0));
    var under = PROF.slice().reverse().filter(function (q) { return q[1] < hw; }).map(function (q) { return pt(P(q[0], q[1], 0)); });
    d += " L" + under.join(" L") + " Z";
    s += '<path d="' + d + '" fill="' + col + '" opacity="' + f(a) + '"/><path d="M' + pt(P(xl, hw, 0)) + ' L' + pt(P(X1, hw, 0)) + '" stroke="#fff" stroke-width="1.6" opacity=".7"/>';
    for (var r = 0; r < 4; r++) { var ry = top + 10 + r * 12; if (ry < YB - floorH(xl + 20 + r * 20) - 4) s += '<path d="M' + f(xl + 12 + r * 20) + ' ' + f(ry) + ' h' + (60 + r * 8) + '" stroke="#fff" stroke-width="1" opacity=".18"/>'; }
    return s;
  }

  // ── machines and pipes (all on the cut / the front strip of lawn) ─────
  function pumpPad(t, k, flowK) {
    if (k <= 0) return "";
    var s = '<g transform="translate(320 ' + YB + ') scale(' + f(pop(k)) + ') translate(-320 -' + YB + ')">';
    s += '<path d="' + poly([[PAD.x0, 0, 2], [PAD.x1, 0, 2], [PAD.x1, 0, 24], [PAD.x0, 0, 24]]) + '" fill="#bdb6aa" stroke="' + INK + '" stroke-width="1.4"/>';
    var hum = flowK > 0 ? Math.sin(t * 60) * .5 : 0, b = P(296, 0, 10);
    s += '<g transform="translate(' + f(b[0]) + ' ' + f(b[1] + hum) + ')"><rect x="-6" y="-22" width="22" height="20" rx="4" fill="#2f6fb0" stroke="' + INK + '" stroke-width="1.8"/><path d="M-2 -22 V-2 M2 -22 V-2 M6 -22 V-2" stroke="#1d4f86" stroke-width="1.1"/><circle cx="20" cy="-12" r="8" fill="#9aa4ad" stroke="' + INK + '" stroke-width="1.8"/></g>';
    var c = P(336, 0, 14), cx = c[0], cy = c[1];
    s += '<path d="M' + f(cx - 15) + ' ' + f(cy) + ' V' + f(cy - 44) + ' Q' + f(cx - 15) + ' ' + f(cy - 62) + ' ' + f(cx) + ' ' + f(cy - 62) + ' Q' + f(cx + 15) + ' ' + f(cy - 62) + ' ' + f(cx + 15) + ' ' + f(cy - 44) + ' V' + f(cy) + ' Z" fill="#1f8a7a" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<clipPath id="cpTank"><path d="M' + f(cx - 12) + ' ' + f(cy - 3) + ' V' + f(cy - 44) + ' Q' + f(cx - 12) + ' ' + f(cy - 58) + ' ' + f(cx) + ' ' + f(cy - 58) + ' Q' + f(cx + 12) + ' ' + f(cy - 58) + ' ' + f(cx + 12) + ' ' + f(cy - 44) + ' V' + f(cy - 3) + ' Z"/></clipPath><g clip-path="url(#cpTank)"><rect x="' + f(cx - 15) + '" y="' + f(cy - 62) + '" width="30" height="62" fill="#bfe6f7"/><rect x="' + f(cx - 15) + '" y="' + f(cy - 36) + '" width="30" height="22" fill="#e7c98a"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + f(cx - 13 + hash(i) * 26) + '" cy="' + f(cy - 35 + hash(i + 4) * 20) + '" r="1.1" fill="#b8954f"/>';
    s += '<rect x="' + f(cx - 15) + '" y="' + f(cy - 14) + '" width="30" height="14" fill="#9a958c"/>';
    for (var j = 0; j < 8; j++) s += '<circle cx="' + f(cx - 11 + j * 3.2) + '" cy="' + f(cy - 9 + (j % 2) * 3) + '" r="1.8" fill="#6f6a62"/>';
    if (flowK > 0) for (var d = 0; d < 6; d++) { var u = (t * .8 + d / 6) % 1; s += '<path d="M' + f(cx - 10 + hash(d) * 20) + ' ' + f(cy - 54 + u * 16) + ' l0 4" stroke="#2f86c8" stroke-width="2" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; }
    s += '</g><path d="M' + f(cx) + ' ' + f(cy - 62) + ' V' + f(cy - 70) + ' H' + f(b[0] + 20) + ' V' + f(b[1] - 18) + '" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M' + f(cx) + ' ' + f(cy - 62) + ' V' + f(cy - 70) + ' H' + f(b[0] + 20) + ' V' + f(b[1] - 18) + '" stroke="#e9e6df" stroke-width="3" fill="none"/>';
    return s + '</g>';
  }
  function pipes(t, k, flowK, o) {
    if (k <= 0) return "";
    var s = "", paths = [], bot = YB + HD + WT, low = YB + 120, low2 = YB + 134;
    var dx = o.twin ? DRAINS[0] : DRAIN1;
    paths.push("M" + dx + " " + bot + " V" + low + " H306 V" + (YB + 6));
    if (o.twin) paths.push("M" + DRAINS[1] + " " + bot + " V" + low);
    if (o.skim) paths.push("M" + (X1 + WT) + " " + (YB + 12) + " H286 V" + low);
    paths.push("M" + f(P(336, 0, 14)[0]) + " " + (YB + 6) + " V" + low2 + " H20 V" + (YB + 16) + " H" + (X0 - WT));
    for (var i = 0; i < paths.length; i++) s += '<path d="' + paths[i] + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linejoin="round" opacity="' + f(k) + '"/><path d="' + paths[i] + '" stroke="#e9e6df" stroke-width="4.4" fill="none" stroke-linejoin="round" opacity="' + f(k) + '"/>';
    if (flowK > 0) for (var p = 0; p < paths.length; p++) s += '<path d="' + paths[p] + '" stroke="' + (p === paths.length - 1 ? "#2f86c8" : "#7a8a50") + '" stroke-width="2.6" fill="none" stroke-dasharray="3 9" stroke-dashoffset="' + f(-t * 40) + '" stroke-linecap="round" opacity="' + f(flowK) + '"/>';
    if (o.cell > 0) {
      var g = .5 + .5 * Math.sin(t * 8);
      s += '<g transform="translate(150 ' + low2 + ') scale(' + f(pop(o.cell)) + ')"><rect x="-22" y="-8" width="44" height="16" rx="5" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/><rect x="-16" y="-5" width="32" height="10" rx="3" fill="#bfe6f7"/>';
      for (var e = 0; e < 5; e++) s += '<path d="M' + (-12 + e * 6) + ' -4 V4" stroke="#7a828c" stroke-width="1.6"/>';
      s += '<rect x="-16" y="-5" width="32" height="10" rx="3" fill="' + YEL + '" opacity="' + f(.25 * g * o.cell) + '"/>';
      for (var b = 0; b < 5; b++) { var u = (t * 1.2 + b / 5) % 1; s += '<circle cx="' + f(-12 + b * 6) + '" cy="' + f(3 - u * 7) + '" r="1.2" fill="#fff" opacity="' + f(1 - u) + '"/>'; }
      s += '<path d="M-6 -14 l4 -6 l-2 0 l4 -6" stroke="' + YEL + '" stroke-width="2" fill="none" opacity="' + f(g) + '"/></g>';
    }
    return s;
  }
  function drains(t, o) {
    var s = "", xs = o.twin ? DRAINS : [DRAIN1];
    for (var i = 0; i < xs.length; i++) { var c = P(xs[i], -HD, DZ);
      s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="10" ry="3.6" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.2"/>';
      if (o.dome > 0) s += '<path d="M' + f(c[0] - 12) + ' ' + f(c[1]) + ' Q' + f(c[0]) + ' ' + f(c[1] - 12 * o.dome) + ' ' + f(c[0] + 12) + ' ' + f(c[1]) + ' Z" fill="#eeebe4" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(c[0] - 6) + ' ' + f(c[1] - 3 * o.dome) + ' H' + f(c[0] + 6) + ' M' + f(c[0] - 8) + ' ' + f(c[1] - 1) + ' H' + f(c[0] + 8) + '" stroke="#7a828c" stroke-width="1" opacity="' + f(o.dome) + '"/>';
      else s += '<path d="M' + f(c[0] - 7) + ' ' + f(c[1]) + ' H' + f(c[0] + 7) + '" stroke="#9aa4ad" stroke-width="1.6" stroke-dasharray="2 2"/>';
      if (o.suck > 0) for (var k = 0; k < 5; k++) { var u = (t * 1.6 + k / 5) % 1, a = k * 1.26 + .3; s += '<path d="M' + f(c[0] + Math.cos(a) * 26 * (1 - u)) + ' ' + f(c[1] - Math.abs(Math.sin(a)) * 18 * (1 - u)) + ' l' + f(-Math.cos(a) * 4) + ' ' + f(Math.abs(Math.sin(a)) * 3) + '" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="' + f(o.suck * (1 - u) * .85) + '"/>'; }
    }
    return s;
  }
  var SKIM = [X1 - 26, -6, PD];
  function skimmer(t, k) {
    if (k <= 0) return "";
    var a = P(SKIM[0] - 9, 2, PD), b = P(SKIM[0] + 9, -12, PD), sc = pop(k);
    return '<g transform="translate(' + f((a[0] + b[0]) / 2) + ' ' + f((a[1] + b[1]) / 2) + ') scale(' + f(sc) + ')"><rect x="' + f((a[0] - b[0]) / 2) + '" y="' + f((a[1] - b[1]) / 2) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" fill="#f1eee8" stroke="' + INK + '" stroke-width="1.6"/><path d="M-5 -3 l5 4 l5 -4" stroke="' + INK + '" stroke-width="1.4" fill="none"/></g>';
  }
  function leaves(t, ev, hw) {
    var s = "", sk = P(SKIM[0], hw, PD);
    for (var i = 0; i < 8; i++) {
      var t0 = ev.leaves + i * .32, u = after(t, t0, 1.6); if (u <= 0) continue;
      var gone = after(t, ev.suckLeaves + i * .12, 1.4); if (gone >= 1) continue;
      var lx = 60 + i * 26 + hash(i) * 8, lz = 6 + hash(i + 5) * (PD - 12), p = P(lx + Math.sin(t * 1.3 + i) * 3, hw, lz);
      var y = u < 1 ? lerp(60 + hash(i) * 40, p[1], ease(u)) : p[1] + Math.sin(t * 3 + i) * .8, x = u < 1 ? p[0] + Math.sin(t * 2 + i) * 8 * (1 - u) : p[0];
      if (gone > 0) { x = lerp(x, sk[0], ease(gone)); y = lerp(y, sk[1], ease(gone)); }
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 3 + i) * 30 + i * 40) + ') scale(1 ' + (u >= 1 ? .55 : 1) + ')" opacity="' + f(1 - gone * gone) + '"><path d="M-6 0 Q0 -5 6 0 Q0 5 -6 0 Z" fill="' + (i % 2 ? "#c9a032" : "#7aa83a") + '" stroke="' + INK + '" stroke-width="1"/></g>';
    }
    return s;
  }
  function dirt(t, ev) {
    var s = "", u = after(t, ev.dirt, 1.6), c = P(DRAIN1, -HD, DZ);
    for (var i = 0; i < 10; i++) { var x0 = XB + 6 + hash(i) * (X1 - XB - 12), z0 = 4 + hash(i + 3) * (PD - 8), p0 = P(x0, -HD, z0), k = clamp(u * 1.3 - i * .04);
      if (k >= 1) continue; s += '<ellipse cx="' + f(lerp(p0[0], c[0], ease(k))) + '" cy="' + f(lerp(p0[1], c[1], ease(k))) + '" rx="' + f(1.8 + hash(i + 2)) + '" ry="1.2" fill="#5a4a34" opacity="' + f(1 - k) + '"/>'; }
    return s;
  }
  function person(x, y, o) {
    o = o || {}; var sc = o.sc || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ') rotate(' + f(o.rot || 0) + ')">';
    var skin = "#c98c5a", suit = "#e8452e";
    if (o.stand) {
      s += '<path d="M-4 -22 V0 M4 -22 V0" stroke="' + skin + '" stroke-width="5" stroke-linecap="round"/><rect x="-7" y="-48" width="14" height="28" rx="6" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="-7" y="-28" width="14" height="9" fill="' + suit + '"/>';
      s += '<path d="M-6 -44 L' + f(-12 + (o.arm || 0)) + ' -62 M6 -44 L' + f(12 - (o.arm || 0)) + ' -62" stroke="' + skin + '" stroke-width="4.4" stroke-linecap="round"/><circle cx="0" cy="-56" r="9" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-9 -60 Q0 -70 9 -60" fill="#2b2016"/><circle cx="3" cy="-57" r="1.4" fill="' + INK + '"/>';
    } else {
      var kick = Math.sin((o.t || 0) * 9) * 4;
      s += '<path d="M10 0 L24 ' + f(kick) + ' M10 2 L24 ' + f(-kick + 3) + '" stroke="' + skin + '" stroke-width="4.4" stroke-linecap="round"/><rect x="-12" y="-5" width="24" height="11" rx="5" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="4" y="-5" width="8" height="11" fill="' + suit + '"/>';
      s += '<path d="M-10 -2 L-24 ' + f(-6 + kick) + '" stroke="' + skin + '" stroke-width="4" stroke-linecap="round"/><circle cx="-17" cy="0" r="7.5" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.6"/>';
      if (o.hair) s += '<path d="M-17 7 Q' + f(-14 + Math.sin((o.t || 0) * 7) * 2) + ' 14 ' + f(o.hair[0]) + ' ' + f(o.hair[1]) + '" stroke="#2b2016" stroke-width="2.4" fill="none"/>';
      s += '<path d="M-23 -4 Q-17 -9 -11 -4" fill="#2b2016"/><circle cx="-20" cy="-1" r="1.3" fill="' + (o.redEye ? RED : INK) + '"/>';
      if (o.redEye) s += '<circle cx="-20" cy="-1" r="3.2" fill="' + RED + '" opacity=".35"/>';
    }
    return s + '</g>';
  }
  var SHOWER = [14, 0, 48];
  function showerPost(t, k, on) {
    if (k <= 0) return "";
    var b = P(SHOWER[0], 0, SHOWER[2]);
    var s = '<g transform="translate(' + f(b[0]) + ' ' + f(b[1]) + ') scale(' + f(pop(k) * .92) + ')"><ellipse cx="0" cy="0" rx="12" ry="3" fill="#bdb6aa"/><path d="M0 0 V-84 Q0 -92 8 -92 H14" stroke="#c9ced4" stroke-width="4" fill="none"/><path d="M8 -88 h12 l-2 4 h-8 z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.3"/>';
    if (on > 0) for (var i = 0; i < 12; i++) { var u = (t * 2 + i / 12) % 1; s += '<path d="M' + f(10 + (i % 5) * 2 + u * (i % 3 - 1) * 4) + ' ' + f(-83 + u * 80) + ' l0 4" stroke="#7fc6ee" stroke-width="1.6" stroke-linecap="round" opacity="' + f(on * (1 - u)) + '"/>'; }
    return s + '</g>';
  }
  function ladder(t, k) {
    if (k <= 0) return "";
    var x = X1 - 54, z = PD - 1, dy = (1 - ease(k)) * -40, s = '<g opacity="' + f(clamp(k * 2)) + '" transform="translate(0 ' + f(dy) + ')">';
    [x, x + 14].forEach(function (rx) { var a = P(rx, 14, z), b = P(rx, -40, z), c = P(rx, 14, z + 6); s += '<path d="M' + pt(c) + ' Q' + pt(P(rx, 20, z + 2)) + ' ' + pt(a) + ' L' + pt(b) + '" stroke="#d0d5da" stroke-width="2.6" fill="none"/>'; });
    for (var r = 0; r < 4; r++) s += '<path d="' + line3([x, -6 - r * 10, z], [x + 14, -6 - r * 10, z]) + '" stroke="#d0d5da" stroke-width="2.2"/>';
    return s + '</g>';
  }
  function lights(t, k) {
    if (k <= 0) return ""; var s = "", g = .75 + .25 * Math.sin(t * 4);
    [[X0 + 50, -26], [XA + 20, -30], [X1 - 34, -50]].forEach(function (q) { var p = P(q[0], q[1], PD); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(20 * k) + '" fill="#fff7c0" opacity="' + f(.45 * g * k) + '" filter="url(#soft)"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="3.4" fill="#fff7c0" stroke="' + INK + '" stroke-width="1.1"/>'; });
    return s;
  }
  function fence(t, k) {
    if (k <= 0) return ""; var e = ease(k), z = PD + 12, H = 26 * e, s = '<g opacity="' + f(k) + '">';
    s += '<path d="' + poly([[X0 - 14, 0, z], [X1 + 14, 0, z], [X1 + 14, H, z], [X0 - 14, H, z]]) + '" fill="#cfeefb" opacity=".45" stroke="#7aa6c0" stroke-width="1.2"/>';
    for (var x = X0 - 14; x <= X1 + 14; x += 32) s += '<path d="' + line3([x, 0, z], [x, H + 2, z]) + '" stroke="#6f7680" stroke-width="2.6"/>';
    return s + '</g>';
  }
  function haze(t, k, hw) {
    if (k <= 0) return ""; var s = "";
    for (var i = 0; i < 10; i++) { var p = P(X0 + 14 + i * 24 + Math.sin(t * .8 + i) * 6, hw + 6 + 3 * Math.sin(t * 1.1 + i * 2), 6 + (i % 3) * 10); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(22 * k) + '" ry="' + f(9 * k) + '" fill="#d8e05a" opacity="' + f(.3 * k) + '" filter="url(#soft)"/>'; }
    for (var j = 0; j < 3; j++) { var q = P(110 + j * 40, hw + 8, 14); s += '<path d="M' + f(q[0]) + ' ' + f(q[1]) + ' q-5 -6 0 -12 q5 -6 0 -12" stroke="#9aa13a" stroke-width="2" fill="none" opacity="' + f(k * (.6 + .4 * Math.sin(t * 5 + j))) + '"/>'; }
    return s;
  }
  function confetti(t, t0, n) {
    var u = t - t0; if (u < 0 || u > 3.2) return ""; var s = "", cols = ["#ff5a4e", "#ffd23f", "#4fc3f7", "#6ee07a", "#c77dff", "#ff9f1c"];
    for (var i = 0; i < (n || 70); i++) { var a = -1.57 + (hash(i) - .5) * 2.4, v = 260 + hash(i + 3) * 260, x = 180 + Math.cos(a) * v * u * .5 + Math.sin(u * 4 + i) * 10, y = 420 + Math.sin(a) * v * u + 260 * u * u;
      var r = u * 9 + i, w = 6 + hash(i + 7) * 5; s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(w * .45) + '" fill="' + cols[i % 6] + '" transform="rotate(' + f(r * 40) + ' ' + f(x) + ' ' + f(y) + ')" opacity="' + f(clamp(3.2 - u)) + '"/>'; }
    return s;
  }

  // ── camera ─────────────────────────────────────────
  var WIDE = [180, 296, 1.18];
  var SHOTS = [
    [0, [160, 300, 1.4]], [1, [158, 318, 1.6]], [2, [158, 314, 1.5]], [3, [160, 308, 1.45]], [4, [158, 314, 1.55]], [5, [158, 312, 1.45]],
    [6, [178, 268, 1.18]], [7, [232, 330, 1.38]], [8, [318, 270, 2.3]], [9, [160, 296, 1.45]], [10, [228, 292, 1.9]], [11, [222, 340, 1.85]],
    [12, [214, 340, 1.85]], [13, [232, 340, 1.95]], [14, [232, 340, 1.95]], [15, [176, 380, 1.4]], [16, [176, 372, 1.35]], [17, [160, 290, 1.5]],
    [18, [160, 290, 1.45]], [19, [76, 256, 1.6]], [20, [168, 300, 1.35]], [21, [168, 300, 1.35]], [22, [176, 292, 1.4]], [23, WIDE], [24, WIDE]
  ];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && EV.L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : SHOTS[0][1], b = SHOTS[i][1], k = ease((t - (EV.L(SHOTS[i][0]) - .45)) / 1.1);
    if (i === 0) { a = [180, 280, 1.05]; k = ease(t / 2.6); }
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 3; c[1] += Math.cos(t * .29) * 2.5; c[2] *= 1 + .012 * Math.sin(t * .23);
    return c;
  }
  function proj(c, x, y) { return [180 + (x - c[0]) * c[2], 320 + (y - c[1]) * c[2]]; }

  // ── screen-space tags, gauges, cards ──────────────────
  function tag(c, w2, text, t0, t, o) {
    o = o || {}; var u = t - t0, dur = o.dur || 2.4; if (u < 0 || u > dur) return "";
    var p = proj(c, w2[0], w2[1]), sc = pop(u) * clamp((dur - u) / .25), w = text.length * 8.6 + 26, col = o.red ? RED : (o.col || YEL);
    var x = Math.max(w / 2 + 8, Math.min(352 - w / 2, p[0])), y = Math.max(214, Math.min(600, p[1] - 22));
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><path d="M0 22 l-6 -10 h12 z" fill="#1b1a1f" transform="translate(' + f(Math.max(-w / 2 + 12, Math.min(w / 2 - 12, p[0] - x))) + ' -2)"/><rect x="' + f(-w / 2) + '" y="-16" width="' + f(w) + '" height="30" rx="15" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + col + '">' + text + '</text></g>';
  }
  function panelAt(y, k, inner, w, h) { return '<g transform="translate(180 ' + y + ') scale(' + f(pop(k)) + ')" opacity="' + f(clamp(k * 3)) + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14" fill="#14232f" stroke="' + INK + '" stroke-width="2"/>' + inner + '</g>'; }
  function microscope(t, ev) {
    var k = after(t, ev.micro, .5) * (1 - after(t, ev.microEnd - .4, .4)); if (k <= 0) return "";
    var s = '<g transform="translate(180 380) scale(' + f(pop(after(t, ev.micro, .9)) * clamp(k * 3)) + ')"><circle r="104" fill="#f6e8c4" stroke="' + INK + '" stroke-width="5"/><clipPath id="cpMic"><circle r="100"/></clipPath><g clip-path="url(#cpMic)">';
    for (var i = 0; i < 16; i++) { var gx = -90 + (i % 4) * 60 + (Math.floor(i / 4) % 2) * 30, gy = -90 + Math.floor(i / 4) * 58; s += '<ellipse cx="' + gx + '" cy="' + gy + '" rx="27" ry="22" fill="#e2b866" stroke="#a87a30" stroke-width="2"/>'; }
    for (var b = 0; b < 7; b++) { var u = (t * .25 + b / 7) % 1, bx = -80 + u * 170 + Math.sin(t * 3 + b) * 5, by = -70 + b * 22 + Math.sin(u * 12 + b) * 10;
      s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(Math.sin(t * 4 + b) * 20) + ')"><rect x="-6" y="-3" width="12" height="6" rx="3" fill="#7cc04f" stroke="#2f6a1f" stroke-width="1.2"/><path d="M6 0 q4 ' + f(Math.sin(t * 12 + b) * 3) + ' 7 0" stroke="#2f6a1f" stroke-width="1" fill="none"/></g>'; }
    s += '</g><g transform="translate(0 124)"><rect x="-70" y="-15" width="140" height="28" rx="14" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + YEL + '">حبات الرمل × 100</text></g></g>';
    return '<rect width="360" height="640" fill="#000" opacity="' + f(.45 * k) + '"/><g opacity="' + f(clamp(k * 2)) + '">' + s + '</g>';
  }
  function factCard(t, ev) {
    var k = after(t, ev.card, .45) * (1 - after(t, ev.cardEnd - .35, .35)); if (k <= 0) return "";
    var s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.55 * k) + '"/><g transform="translate(180 370) scale(' + f(pop(after(t, ev.card, .9))) + ')">';
    s += '<rect x="-150" y="-166" width="300" height="320" rx="22" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="3"/><text x="0" y="-132" text-anchor="middle" class="hd" fill="' + INK + '">وهل تعلم؟</text>';
    var blueK = after(t, ev.cardBlue - .6, 1.2), deepK = after(t, ev.cardDeep, 1.2);
    s += '<path d="M-120 -96 V-20 H-30 L30 40 H120 V-96 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += '<linearGradient id="gDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mixc("#ffffff", "#9fd6f0", blueK) + '"/><stop offset="1" stop-color="' + mixc("#ffffff", "#1f6fb8", blueK * (.6 + .4 * deepK)) + '"/></linearGradient>';
    s += '<path d="M-117 -86 V-23 H-31 L29 37 H117 V-86 Z" fill="url(#gDeep)"/>';
    for (var w = 0; w < 4; w++) s += '<path d="M' + (-110 + w * 60 + Math.sin(t * 2 + w) * 4) + ' -80 q10 -4 20 0" stroke="#fff" stroke-width="2" fill="none"/>';
    var redK = after(t, ev.cardRed, 1.6);
    if (redK > 0) {
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
    for (var r = 0; r < 4; r++) { var y = 8 + r * 50, u = after(t, ev.vote + .25 + r * .18, .5), grow = after(t, ev.vote + 1, 3.5), n = Math.round(rows[r][1] * (1 + (r === 1 ? .65 : .12) * grow));
      s += '<g transform="translate(' + f((1 - ease(u)) * 260) + ' ' + y + ')"><rect x="-125" y="-19" width="250" height="40" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text x="102" y="7" text-anchor="end" class="tg" fill="' + INK + '">' + rows[r][0] + '</text>';
      s += '<rect x="-115" y="-11" width="62" height="24" rx="12" fill="#1b1a1f"/><text x="-70" y="6" text-anchor="end" class="sm" fill="#fff">' + n + '</text><path d="M-104 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '"/></g>'; }
    for (var h = 0; h < 6; h++) { var hu = ((t - ev.vote) * .5 + h / 6) % 1; s += '<path transform="translate(' + f(-90 + h * 34 + Math.sin(t * 2 + h) * 8) + ' ' + f(230 - hu * 140) + ') scale(1.4)" d="M-4 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '" opacity="' + f((1 - hu) * k) + '"/>'; }
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var ev = EV, c = window.__cam || cam(t);   // window.__cam: fixed framing for the cover
    var holeK = after(t, ev.dig, 1.7), soakK = after(t, ev.soak, 2.6), mudK = after(t, ev.mud, 1.4);
    var stage = t < ev.shell ? "dirt" : t < ev.rebar ? "conc1" : t < ev.sprayEnd ? "spray" : "conc";
    var crackK = t < ev.rebar ? after(t, ev.crack, .7) : 0, rebarK = after(t, ev.rebar, .6), sprayK = after(t, ev.spray, ev.sprayEnd - ev.spray);
    var hw = -HD, wcol = "#3f9ee0", FULL = -6;
    if (t < ev.soak) hw = lerp(-HD, -12, after(t, ev.fill0, 1.2));
    else if (t < ev.shell) { hw = lerp(-12, -HD, soakK); wcol = mixc("#3f9ee0", "#8a6a3a", soakK); }
    else if (t < ev.rebar) hw = lerp(-HD, FULL, after(t, ev.fill1, 2)) - 18 * after(t, ev.crack + .5, 2.5);
    else if (t >= ev.fill2) hw = lerp(-HD, FULL, after(t, ev.fill2, 1.6));
    var greenK = after(t, ev.green, 1.5) * (1 - after(t, ev.clear, 1.8));
    if (t >= ev.fill2) wcol = mixc("#3f9ee0", "#6f9a2a", greenK);
    if (t >= ev.tiles) wcol = mixc("#3f9ee0", "#35b6ea", after(t, ev.tiles, 1));
    var hazeK = after(t, ev.haze, 1.2) * (1 - after(t, ev.wash + .6, 1.5));

    var s = sky(t, after(t, ev.green - .8, 1) * (1 - after(t, ev.clear, 1.5)));
    s += villa(t) + lawn(t) + palm(4, P(0, 0, ZH - 4)[1], .9, t) + palm(352, P(0, 0, ZH - 4)[1], .8, t + 2);
    s += fence(t, after(t, ev.fence, .8));
    s += showerPost(t, after(t, ev.shower, .8), after(t, ev.wash - .3, .4) * (1 - after(t, ev.wash + 1.6, .4)));
    if (t >= ev.swim2 && t < ev.card) {
      var sw = after(t, ev.wash - .8, 1.2), back = after(t, ev.wash + .9, 1.2);
      if (sw > .5 && back < .5) { var sp = P(SHOWER[0] + 10, 0, SHOWER[2] - 2); s += person(sp[0], sp[1], { stand: true, arm: Math.sin(t * 8) * 4, sc: .9 }); }
    }
    s += soil(t, soakK * (t < ev.shell ? 1 : 0));
    var hk = ease(holeK), inside = "";
    if (stage === "dirt") inside = insideFaces(PAL.dirt);
    else if (stage === "conc1") inside = insideFaces(PAL.conc);
    else if (stage === "spray") {
      inside = insideFaces(PAL.dirt) + '<g opacity="' + f(rebarK) + '">' + faceGrid("#b0442a", 1.3, 9) + '</g>';
      if (sprayK > 0) { var gx = lerp(X0 - 10, X1 + 12, sprayK); inside += '<clipPath id="cpSpray"><rect x="-50" y="0" width="' + f(P(gx, 0, 0)[0] + 50) + '" height="640"/></clipPath><g clip-path="url(#cpSpray)">' + insideFaces(PAL.conc) + '</g>'; }
    }
    else { var tk = after(t, ev.tiles, .8); inside = insideFaces(PAL.conc); if (tk > 0) inside += '<g opacity="' + f(tk) + '">' + insideFaces(PAL.tile) + faceGrid("#2f86b8", .7, 6) + '</g>'; }
    s += '<g transform="translate(0 ' + YB + ') scale(1 ' + f(Math.max(.02, hk)) + ') translate(0 -' + YB + ')">' + inside;
    if (stage === "dirt" && mudK > 0) {
      var m = mudK; s += '<path d="M' + pt(P(X0, 0, 0)) + ' q' + f(16 * m) + ' ' + f(20 * m) + ' ' + f(8 * m) + ' ' + HS + ' L' + pt(P(X0, -HS, 0)) + ' Z" fill="#7a5a36" stroke="' + INK + '" stroke-width="1.4"/>';
      s += '<path d="M' + pt(P(X1, 0, 0)) + ' q' + f(-18 * m) + ' ' + f(30 * m) + ' ' + f(-10 * m) + ' ' + HD + ' L' + pt(P(X1, -HD, 0)) + ' Z" fill="#7a5a36" stroke="' + INK + '" stroke-width="1.4"/>';
      for (var cl = 0; cl < 6; cl++) { var cp = P(X0 + 30 + cl * 34, floorH(X0 + 30 + cl * 34) + 4, 10 + hash(cl) * 20); s += '<ellipse cx="' + f(cp[0]) + '" cy="' + f(cp[1]) + '" rx="' + f(7 * m) + '" ry="' + f(4 * m) + '" fill="#6a4a2c" stroke="' + INK + '" stroke-width="1"/>'; }
    }
    s += '</g>';
    if (stage !== "dirt") s += frontBand(stage === "spray" ? Math.max(.25, sprayK) : 1, stage === "conc1" ? 0 : rebarK);
    if (crackK > 0 && t < ev.rebar) {
      var cr = "M" + pt(P(90, -4, PD)) + " l4 9 l-5 7 l6 9 l-3 8 M" + pt(P(230, -10, PD)) + " l-5 10 l6 7 l-4 10 M" + pt(P(X0 - 3, -10, 0)) + " l-4 8 l5 7 l-4 9 M" + pt(P(X1 + 3, -20, 0)) + " l4 9 l-5 8 l5 9";
      s += '<path d="' + cr + '" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-dasharray="80" stroke-dashoffset="' + f(80 * (1 - crackK)) + '"/>';
      for (var d = 0; d < 6; d++) { var u2 = (t * 1.5 + d / 6) % 1, l1 = P(X0 - WT, -20 - d * 4, 0), l2 = P(X1 + WT, -30 - d * 5, 0); s += '<circle cx="' + f(l1[0] - u2 * 18) + '" cy="' + f(l1[1] + u2 * 22) + '" r="2" fill="#3f9ee0" opacity="' + f(crackK * (1 - u2)) + '"/><circle cx="' + f(l2[0] + u2 * 18) + '" cy="' + f(l2[1] + u2 * 22) + '" r="2" fill="#3f9ee0" opacity="' + f(crackK * (1 - u2)) + '"/>'; }
    }
    if (t >= ev.spray && t < ev.sprayEnd) { var sx = lerp(X0 + 6, X1 - 6, sprayK), target = P(sx, floorH(sx), DZ), noz = [target[0] + 26, target[1] - 70];
      s += '<path d="M' + f(noz[0] + 40) + ' ' + f(noz[1] - 50) + ' L' + f(noz[0]) + ' ' + f(noz[1]) + '" stroke="#2b2b2b" stroke-width="6" stroke-linecap="round"/>';
      for (var q = 0; q < 16; q++) { var u = (t * 4 + q / 16) % 1; s += '<circle cx="' + f(lerp(noz[0], target[0], u) + (hash(q) - .5) * 16 * u) + '" cy="' + f(lerp(noz[1], target[1], u)) + '" r="' + f(1.4 + u * 2.2) + '" fill="#a7a198" opacity="' + f(1 - u * .7) + '"/>'; } }
    s += lights(t, after(t, ev.lights, .6));
    s += water(t, hw, wcol, t >= ev.tiles ? .56 : .66);
    var twin = t >= ev.twin;
    if (t >= ev.drain) s += drains(t, { twin: twin, dome: after(t, ev.dome, .6), suck: after(t, ev.drain, .5) * (1 - after(t, ev.free, .5)) + after(t, ev.free + .6, .5) * .5 });
    if (t >= ev.drain && t < ev.dive) s += dirt(t, ev);
    if (t >= ev.dive && t < ev.micro) {
      var dk = after(t, ev.dive, 1.4), fr = after(t, ev.free, 1.6), held = after(t, ev.grab, .5) * (1 - fr), dc = P(DRAIN1, -HD, DZ), st = P(140, FULL, 10);
      var px = lerp(st[0], dc[0] - 8, ease(dk)) + Math.sin(t * 9) * 2 * held, py = lerp(st[1], dc[1] - 16, ease(dk)) - fr * 50;
      s += person(px, py, { t: t, rot: lerp(30, 0, dk) - fr * 25, hair: held > 0 ? [lerp(-17, dc[0] - px, held), lerp(12, dc[1] - py, held)] : null });
      if (held > 0) s += '<g transform="translate(' + f(px) + ' ' + f(py - 24) + ') scale(' + f(pop(held)) + ')"><path d="M0 -12 L12 9 H-12 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/><text x="0" y="6" text-anchor="middle" class="tg" fill="' + INK + '">!</text></g>';
    }
    s += skimmer(t, after(t, ev.skimmer, .9));
    if (t >= ev.leaves) s += leaves(t, ev, FULL);
    if (t >= ev.swim2 && t < ev.card) {
      var sw2 = after(t, ev.wash - .8, 1.2), bk2 = after(t, ev.wash + .9, 1.2), onSurf = !(sw2 > .5 && bk2 < .5);
      if (onSurf) { var xs = 120 + Math.sin(t * .8) * 70; if (sw2 > 0 && bk2 < .5) xs = lerp(xs, 40, ease(sw2 * 2)); var ps = P(xs, FULL + 1, 12);
        s += person(ps[0], ps[1], { t: t, sc: .95, redEye: after(t, ev.eyes, .4) * (1 - after(t, ev.wash, .5)) > .5 });
        if (t >= ev.sweat && t < ev.haze + 1) for (var w2 = 0; w2 < 4; w2++) { var su = (t * 1.6 + w2 / 4) % 1; s += '<path d="M' + f(ps[0] - 10 + w2 * 6) + ' ' + f(ps[1] - 8 + su * 14) + ' q2 3 0 5 q-2 -2 0 -5" fill="#9fe0f7" opacity="' + f(1 - su) + '"/>'; } }
    }
    s += haze(t, hazeK, FULL);
    s += ladder(t, after(t, ev.ladder, .7));
    s += pipes(t, after(t, ev.pump, .6), after(t, ev.flow, .5), { twin: twin, skim: t >= ev.skimmer, cell: after(t, ev.cell, .9) });
    s += pumpPad(t, after(t, ev.pump, .9), after(t, ev.flow, .5));
    var tonK = t < ev.rebar ? after(t, ev.ton, .6) : 0;
    if (tonK > 0) for (var a = 0; a < 3; a++) { var pu = Math.sin(t * 6 + a) * 2, la = P(X0 + 22, -14 - a * 10, 0), ra = P(X1 - 22, -18 - a * 16, 0); s += '<path d="M' + f(la[0] + pu) + ' ' + f(la[1]) + ' h-16 m5 -5 l-5 5 l5 5" stroke="' + RED + '" stroke-width="3" fill="none" opacity="' + f(tonK) + '"/><path d="M' + f(ra[0] - pu) + ' ' + f(ra[1]) + ' h16 m-5 -5 l5 5 l-5 5" stroke="' + RED + '" stroke-width="3" fill="none" opacity="' + f(tonK) + '"/>'; }
    if (t >= ev.salt && t < ev.tagCell) { var bk = after(t, ev.salt, .5) * (1 - after(t, ev.tagCell - .5, .5)), bp = P(80, 34, 4);
      s += '<g transform="translate(' + f(bp[0]) + ' ' + f(bp[1]) + ') rotate(' + f(-40 * bk) + ')" opacity="' + f(bk) + '"><rect x="-16" y="-20" width="32" height="40" rx="5" fill="#f4f1e4" stroke="' + INK + '" stroke-width="2"/><text x="0" y="5" text-anchor="middle" class="sm" fill="#1f6fb8">ملح</text></g>';
      for (var g2 = 0; g2 < 14; g2++) { var gu = (t * 2 + g2 / 14) % 1; s += '<rect x="' + f(bp[0] - 10 + (hash(g2) - .5) * 10) + '" y="' + f(bp[1] + 10 + gu * 36) + '" width="2" height="2" fill="#fff" opacity="' + f(bk * (1 - gu)) + '"/>'; } }
    var clK = after(t, ev.kill, .8) * (t < ev.haze ? 1 : .4);
    if (clK > 0 && t < ev.card) for (var cl2 = 0; cl2 < 12; cl2++) { var cu = (t * .5 + cl2 / 12) % 1, xx = X0 + 12 + hash(cl2) * 220, cpp = P(xx, lerp(floorH(xx) + 4, FULL - 4, cu), 0); s += '<circle cx="' + f(cpp[0]) + '" cy="' + f(cpp[1]) + '" r="1.6" fill="#e9ff8a" opacity="' + f(clK * Math.sin(cu * 3.14)) + '"/>'; }

    var W = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';

    var T = "";
    T += tag(c, P(150, 0, 18), "مسبح بدائي!", ev.yay0 - .3, t, { dur: 2.2 });
    T += tag(c, [155, YB + 40], "تسرّب!", ev.soak + .8, t, { red: true });
    T += tag(c, P(X0, -10, 0), "خرسانة", ev.shell, t, { col: CREAM });
    T += tag(c, P(90, -4, PD), "تشقّق!", ev.crack + .2, t, { red: true, dur: 2 });
    T += tag(c, P(120, -20, PD), "حديد التسليح", ev.rebar, t);
    T += tag(c, P(150, -10, PD), "الخرسانة المرشوشة", ev.tagShot - .2, t, { dur: 2.2 });
    T += tag(c, P(160, FULL, 18), "طحالب!", ev.green + .4, t, { red: true });
    T += tag(c, P(300, 22, 10), "مضخة", ev.pump, t, { col: CREAM, dur: 1.8 });
    T += tag(c, P(336, 60, 14), "فلتر الرمل", ev.tagSand - .2, t);
    T += tag(c, P(SKIM[0], 2, PD), "السكيمر", ev.tagSkim - .2, t);
    T += tag(c, P(DRAIN1, -HD, DZ), "فتحة القاع", ev.drain + .1, t, { col: CREAM });
    T += tag(c, P(DRAIN1 - 30, -40, DZ), "خطر الشفط!", ev.grab + .1, t, { red: true });
    T += tag(c, P(233, -HD, DZ), "≈ 1 م", ev.meter, t, { dur: 2 });
    T += tag(c, P(233, -HD + 6, DZ), "غطاء مقبّب", ev.dome + .1, t);
    T += tag(c, [150, YB + 126], "مولّد الكلور الملحي", ev.tagCell - .2, t, { dur: 2.6 });
    T += tag(c, P(160, 10, 14), "كلورامين", ev.tagCa - .2, t, { red: true });
    T += tag(c, P(SHOWER[0] + 8, 92, SHOWER[2]), "دُش", ev.shower + .1, t);
    T += tag(c, P(150, -HS, 10), "بلاط", ev.tiles, t, { col: CREAM, dur: 1.4 });
    T += tag(c, P(X1 - 47, 18, PD), "سلّم", ev.ladder, t, { col: CREAM, dur: 1.2 });
    T += tag(c, P(XA + 20, -26, PD), "إضاءة", ev.lights, t, { col: CREAM, dur: 1.3 });
    T += tag(c, P(150, 28, PD + 12), "سور", ev.fence, t, { col: CREAM, dur: 1.4 });
    if (t < ev.rebar + .5) { var tk2 = after(t, ev.ton, .5) * (1 - after(t, ev.rebar, .4)); if (tk2 > 0) T += panelAt(552, tk2, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">وزن الماء</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + RED + '">' + Math.round(48 * after(t, ev.ton, 1.2)) + ' <tspan class="sm">طن</tspan></text>', 130, 62); }
    if (t >= ev.salty && t < ev.swim2) { var sk = after(t, ev.salty, .5) * (1 - after(t, ev.swim2 - .4, .4)), fill = after(t, ev.salty + .3, 1.2), b1 = 170 * fill, b2 = Math.max(16, 170 * fill * 3000 / 35000);
      T += panelAt(548, sk, '<text x="0" y="-32" text-anchor="middle" class="tg" fill="#9fc3d6">الملوحة (جزء في المليون)</text><text x="138" y="2" text-anchor="end" class="tg" fill="#fff">البحر</text><rect x="-136" y="-14" width="' + f(b1) + '" height="22" rx="11" fill="#4f8fd0"/><text x="' + f(-136 + b1 - 8) + '" y="2" text-anchor="end" class="sm" fill="#fff" opacity="' + f(clamp(fill * 2 - 1)) + '">35٬000</text><text x="138" y="40" text-anchor="end" class="tg" fill="#fff">المسبح</text><rect x="-136" y="24" width="' + f(b2) + '" height="22" rx="11" fill="' + GRN + '"/><text x="' + f(-136 + b2 + 6) + '" y="40" text-anchor="start" class="tg" fill="' + GRN + '">3٬000</text>', 300, 118); }
    if (t >= ev.gauge && t < ev.shower) { var gk = after(t, ev.gauge, .5) * (1 - after(t, ev.shower - .4, .4)), needle = lerp(.8, .14, after(t, ev.gauge + .3, 1.4)) + Math.sin(t * 9) * .02, na = Math.PI * (1 - needle);
      T += panelAt(548, gk, '<text x="0" y="-32" text-anchor="middle" class="sm" fill="#9fc3d6">الكلور الحرّ</text><path d="M-60 26 A60 60 0 0 1 60 26" stroke="#2b3a46" stroke-width="12" fill="none"/><path d="M-60 26 A60 60 0 0 1 -42 -16" stroke="' + RED + '" stroke-width="12" fill="none"/><path d="M42 -16 A60 60 0 0 1 60 26" stroke="' + GRN + '" stroke-width="12" fill="none"/><path d="M0 26 L' + f(Math.cos(na) * 50) + ' ' + f(26 - Math.sin(na) * 50) + '" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="0" cy="26" r="5" fill="#fff"/><text x="0" y="42" text-anchor="middle" class="sm" fill="' + RED + '">ناقص!</text>', 180, 104); }
    T += microscope(t, ev);
    T += factCard(t, ev);
    T += confetti(t, ev.yay0, 60) + confetti(t, ev.yay, 90);
    T += voteCard(t, ev);
    return W + T;
  };
})();
