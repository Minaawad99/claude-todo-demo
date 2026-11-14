  // ── «تعمل بنزينة إزاي؟»: pieces shared with earlier episodes (characters, car, labels) ──
  var INK = "#1c1c1c";
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/><path d="M0 -88 V-54" stroke="#d9d3c4" stroke-width="6"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function carSide(x, y, t, s, col) {   // a family car, side view, wheels turning
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return c + '</g>';
  }
  function hardHat(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s }, o || {})); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  function star(x, y, r, t, col) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2 + t * 2, rr = i % 2 ? r * 0.45 : r * (1 + 0.15 * Math.sin(t * 18 + i)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + ' Z" fill="' + (col || "#ffe46a") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // ── a petrol station in cross-section (layout after real forecourts, ../refs/SOURCES.md): a buried double-wall steel tank
  // with a fill port, a vent riser, a submersible pump and product line to the dispenser island, a shear valve under the
  // dispenser, a breakaway on the hose, a sloped concrete forecourt draining to an oil/water separator, and a canopy.
  var GY = 150, WY = 372, SOILC = "#9a7048", SOILD = "#7a5636", FUEL = "#eba21c", FUELD = "#b06a10";
  var TX0 = 120, TX1 = 380, TY0 = 215, TY1 = 300, TM = (TY0 + TY1) / 2, DX = 500, HOL = [DX + 31, GY - 44];
  function poly(pts, k) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var tot = 0, i, seg = [];
    for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    var rem = tot * k, d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
    for (i = 1; i < pts.length && rem > 0.01; i++) { var q = Math.min(1, rem / seg[i - 1]); d += " L" + f(lerp(pts[i - 1][0], pts[i][0], q)) + " " + f(lerp(pts[i - 1][1], pts[i][1], q)); rem -= seg[i - 1]; }
    return d;
  }
  function tube(d, w, col) { if (!d) return ""; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#b9c0c8") + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function flowD(d, t, col, w, sp) { if (!d) return ""; return '<path d="' + d + '" stroke="' + (col || FUEL) + '" stroke-width="' + (w || 3) + '" fill="none" stroke-dasharray="6 8" stroke-dashoffset="' + f(-((t * (sp || 40)) % 14)) + '" stroke-linecap="round"/>'; }
  function rain(t, k) { var s = ""; for (var i = 0; i < 70; i++) { var x = -200 + hash(i) * 1200, y = ((t * 520 + hash(i + 5) * 420) % 420) - 260; if (y < GY - 14) s += '<path d="M' + f(x) + ' ' + f(y) + ' l-3 12" stroke="#cfe6f5" stroke-width="1.6" opacity="' + f(0.7 * (k == null ? 1 : k)) + '"/>'; } return s; }
  function flame(x, y, sc, t) {
    var a = Math.sin(t * 13) * 5, b = Math.sin(t * 17 + 1) * 4; if (sc <= 0) return "";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><circle cy="-24" r="40" fill="#ff9a2a" opacity=".3" filter="url(#soft)"/><path d="M0 0 C-24 -10 -18 -34 ' + f(-4 + a) + ' -60 C6 -42 26 -30 15 -8 C10 0 4 0 0 0 Z" fill="#ff7a1a" stroke="' + INK + '" stroke-width="2"/><path d="M0 -2 C-11 -8 -8 -22 ' + f(b) + ' -36 C6 -22 12 -14 6 -4 Z" fill="#ffe46a"/></g>';
  }
  // the street, the far city and traffic, the ground in section and the groundwater far below
  function scene(t, o) {
    o = o || {}; var k = o.sky || "day", dark = k !== "day", i;
    var s = sky(k) + (k === "night" ? stars(t) : clouds(t, 14, -70, 5, 0.85));
    s += city(t, GY - 6, 100, dark ? "#2f3a52" : "#a9bccb", "#ffe9a0", 3, dark);
    s += '<rect x="-400" y="' + (GY - 9) + '" width="1440" height="9" fill="' + (dark ? "#4a4f58" : "#c9c4b8") + '"/>' + cars(t, GY - 13, 46);
    s += '<rect x="-400" y="' + GY + '" width="1440" height="800" fill="' + SOILC + '"/><rect x="-400" y="' + (GY + 150) + '" width="1440" height="700" fill="' + SOILD + '"/>';
    for (i = 0; i < 60; i++) s += '<circle cx="' + f(-380 + hash(i) * 1400) + '" cy="' + f(GY + 16 + hash(i + 4) * 200) + '" r="' + f(1.5 + hash(i + 7) * 2.5) + '" fill="#5a3c20" opacity=".5"/>';
    var w = "M-400 " + WY; for (var x = -400; x <= 1040; x += 20) w += " L" + x + " " + f(WY + Math.sin(x * 0.03 + t * 1.6) * 2.5);
    s += '<path d="' + w + ' V900 H-400 Z" fill="#3f7fb0"/>';
    for (i = 0; i < 14; i++) { var rx = ((hash(i) * 1400 + t * 26) % 1400) - 380; s += '<path d="M' + f(rx) + ' ' + f(WY + 16 + hash(i + 2) * 110) + ' h' + f(16 + hash(i + 3) * 22) + '" stroke="#8fc3e6" stroke-width="2" opacity=".6" stroke-linecap="round"/>'; }
    s += '<rect x="-400" y="' + GY + '" width="1440" height="9" fill="url(#gAsphalt)" stroke="' + INK + '" stroke-width="1.6"/>';
    return s;
  }
  function capsule(g) { return 'M' + TX0 + ' ' + (TY0 - g) + ' H' + TX1 + ' Q' + (TX1 + 30 + g * 2) + ' ' + TM + ' ' + TX1 + ' ' + (TY1 + g) + ' H' + TX0 + ' Q' + (TX0 - 30 - g * 2) + ' ' + TM + ' ' + TX0 + ' ' + (TY0 - g) + ' Z'; }
  // the tank; o: level 0..1, rust 0..1, leak (y the drops fall to), dbl 0..1 (outer wall), sensor, alarm, vapour
  function tank(t, o) {
    o = o || {}; var s = "", lv = o.level == null ? 0.7 : o.level, top = lerp(TY1 - 6, TY0 + 8, lv), i, x;
    s += tube(poly([[170, GY + 4], [170, TY0 + 4]]), 6) + R(159, GY - 3, 22, 6, "#c23a26", 1.6, 2);
    if (o.dbl) s += '<path d="' + capsule(9) + '" fill="#e6edf2" stroke="' + INK + '" stroke-width="3" opacity="' + f(o.dbl) + '"/>';
    s += '<clipPath id="tkc"><path d="' + capsule(-2) + '"/></clipPath><path d="' + capsule(0) + '" fill="#39424c" stroke="' + INK + '" stroke-width="6"/>';
    var w = "M" + (TX0 - 20) + " " + f(top); for (x = TX0 - 20; x <= TX1 + 20; x += 10) w += " L" + x + " " + f(top + Math.sin(x * 0.08 + t * 3) * 1.8);
    s += '<g clip-path="url(#tkc)"><path d="' + w + ' V' + (TY1 + 4) + ' H' + (TX0 - 20) + ' Z" fill="' + FUEL + '"/><path d="' + w + '" stroke="#ffd980" stroke-width="2" fill="none"/>';
    for (i = 0; i < 7; i++) { var p = (t * 0.35 + hash(i)) % 1; s += '<circle cx="' + f(TX0 + 10 + hash(i + 3) * (TX1 - TX0 - 20)) + '" cy="' + f(lerp(TY1, top, p)) + '" r="2.2" fill="#ffd980" opacity=".7"/>'; }
    if (o.vapour) for (i = 0; i < 16; i++) s += '<circle cx="' + f(TX0 + 14 + hash(i) * (TX1 - TX0 - 28) + Math.sin(t * 5 + i) * 5) + '" cy="' + f(lerp(TY0 + 6, top - 3, hash(i + 9)) + Math.cos(t * 6 + i * 2) * 2.5) + '" r="' + f(4 + hash(i + 2) * 3) + '" fill="#e9eef2" opacity="' + f(0.55 * o.vapour) + '"/>';
    s += '</g><path d="' + capsule(0) + '" fill="none" stroke="#c9ced4" stroke-width="2.4"/>';
    if (o.rust) { var RP = [[150, TY1], [212, TY1 + 1], [300, TY1], [362, TY1 - 5], [TX0 - 12, TM + 14], [330, TY0], [200, TY0], [TX1 + 12, TM - 6]];
      for (i = 0; i < RP.length; i++) { var r = (5 + hash(i) * 6) * clamp(o.rust * 1.4 - i * 0.05); if (r > 0) s += '<circle cx="' + RP[i][0] + '" cy="' + RP[i][1] + '" r="' + f(r) + '" fill="#8a4a1e" stroke="#5a2c10" stroke-width="1.4"/><circle cx="' + (RP[i][0] + 2) + '" cy="' + (RP[i][1] - 1) + '" r="' + f(r * 0.4) + '" fill="#c0692a"/>'; } }
    if (o.leak) [212, 300, 150].forEach(function (lx, j) { for (var q = 0; q < 3; q++) { var pp = (t * 0.7 + q / 3 + j * 0.2) % 1; s += '<path d="M' + lx + ' ' + f(lerp(TY1 + 6, o.leak, pp)) + ' q-4 6 0 9 q4 -3 0 -9 Z" fill="' + FUELD + '" stroke="' + INK + '" stroke-width="1"/>'; } });
    if (o.sensor) { var sc = pop(o.sensor), col = o.alarm ? "#ff3b2f" : "#3aa05a", bl = 0.5 + 0.5 * Math.sin(t * 9);
      s += '<g transform="translate(250 ' + (TY1 + 5) + ') scale(' + f(sc) + ')">' + R(-9, -4, 18, 8, "#2b2e33", 1.4, 2) + '<circle r="2.6" fill="' + col + '" opacity="' + f(0.4 + 0.6 * bl) + '"/>';
      if (o.beep) for (i = 0; i < 3; i++) { var pr = (t * 1.1 + i / 3) % 1; s += '<circle r="' + f(6 + pr * 30) + '" fill="none" stroke="' + col + '" stroke-width="2" opacity="' + f(1 - pr) + '"/>'; }
      s += '</g>'; }
    return s;
  }
  var VENT = [[140, TY0], [140, 196], [70, 196], [70, 40]];
  function vent(t, k, puff) {
    var s = tube(poly(VENT, k), 5); if (k >= 1) s += R(61, 33, 18, 7, "#8a929c", 1.6, 2);
    if (puff) for (var i = 0; i < 6; i++) { var p = (t * 0.45 + i / 6) % 1; s += '<circle cx="' + f(70 + Math.sin(p * 6 + i) * 8 * p + p * 16) + '" cy="' + f(30 - p * 64) + '" r="' + f(4 + p * 9) + '" fill="#f1f4f6" opacity="' + f((1 - p) * 0.8 * puff) + '"/>'; }
    return s;
  }
  var PIPE = [[349, 187], [DX, 187], [DX, GY + 2]];
  function stp(t, k, pk, flow) {
    k = clamp(k); if (k <= 0) return ""; var s = tube(poly([[340, GY + 4], [340, TY1 - 14]], k), 5, "#8a929c") + R(328, GY - 3, 24, 6, "#5a6068", 1.6, 2);
    s += tube(poly(PIPE, pk), 5) + R(331, 180, 18, 14, "#c23a26", 1.8, 3);
    if (k >= 1) { s += R(333, TY1 - 34, 14, 22, "#c23a26", 1.6, 3); for (var i = 0; i < 3; i++) { var a = t * 12 + i * 2.1; s += '<path d="M340 ' + (TY1 - 9) + ' l' + f(Math.cos(a) * 7) + ' ' + f(Math.sin(a) * 3) + '" stroke="#ffd980" stroke-width="2" stroke-linecap="round"/>'; } }
    if (flow) s += flowD(poly([[340, TY1 - 34], [340, 194]]), t) + flowD(poly(PIPE), t);
    return s;
  }
  function shear(t, k, shut) { if (k <= 0) return ""; return '<g transform="translate(' + DX + ' ' + (GY + 15) + ') scale(' + f(pop(k)) + ')">' + R(-9, -6, 18, 12, shut ? "#d8352a" : "#3aa05a", 1.8, 3) + '<path d="M0 -6 V6" stroke="' + INK + '" stroke-width="1.4"/><path d="' + (shut ? "M-6 0 H6" : "M0 -4 V4") + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>'; }
  function nozzle(x, y, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')"><path d="M-11 -5 H6 L19 2 L18 6 L4 2 H-11 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M-8 2 q4 8 10 2" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>'; }
  function hoseD(a, b, sag) { return "M" + f(a[0]) + " " + f(a[1]) + " Q" + f((a[0] + b[0]) / 2) + " " + f(Math.max(a[1], b[1]) + sag) + " " + f(b[0]) + " " + f(b[1]); }
  function hose(d) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#3a3f46" stroke-width="3" fill="none" stroke-linecap="round"/>'; }
  // the dispenser on its island; o: k (pop-in), lit (display text), nz [x,y,rot] nozzle position (default: in the holster),
  // sag, tilt, nohose, brk (breakaway ring on the hose)
  function dispenser(t, o) {
    o = o || {}; var k = o.k == null ? 1 : o.k; if (k <= 0) return ""; var s = R(DX - 36, GY - 7, 72, 7, "url(#gConc)", 2, 3);
    var a = [DX + 22, GY - 68], nz = o.nz || [HOL[0], HOL[1], -90];
    if (!o.nohose) { var d = hoseD(a, nz, o.sag == null ? 36 : o.sag); s += hose(d);
      if (o.brk) { var bx = 0.5625 * a[0] + 0.375 * ((a[0] + nz[0]) / 2) + 0.0625 * nz[0], by = 0.5625 * a[1] + 0.375 * (Math.max(a[1], nz[1]) + (o.sag == null ? 36 : o.sag)) + 0.0625 * nz[1]; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(4.5 * pop(o.brk)) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="1.6"/>'; }
      s += nozzle(nz[0], nz[1], nz[2] || 0); }
    s += '<g transform="translate(' + DX + ' ' + (GY - 7) + ') rotate(' + f(o.tilt || 0) + ') scale(' + f(pop(k)) + ')">' + R(-22, -72, 44, 72, "#f4f1e8", 2.4, 4) + R(-22, -72, 44, 14, "#c23a26", 2.4, 4) + '<path d="M-22 -62 H22" stroke="' + INK + '" stroke-width="2"/>';
    s += R(-17, -53, 34, 17, "#10202a", 1.6, 2) + '<text x="0" y="-40" text-anchor="middle" style="font:700 12px monospace;fill:#7dffb0">' + (o.lit == null ? "00.0" : o.lit) + '</text>';
    for (var i = 0; i < 3; i++) s += R(-15 + i * 11, -31, 8, 6, ["#3aa05a", "#f2c230", "#2f6f9f"][i], 1, 1);
    s += R(-17, -21, 34, 16, "#d9d4c8", 1.2, 2) + R(22, -50, 6, 18, "#2b2e33", 1.2, 1) + '<circle cx="0" cy="-65" r="3" fill="#fff" opacity="' + f(0.5 + 0.5 * Math.sin(t * 6)) + '"/></g>';
    return s;
  }
  function slab(k) { if (k <= 0) return ""; return '<g opacity="' + f(clamp(k)) + '"><path d="M410 ' + GY + ' L715 ' + (GY + 4) + ' L790 ' + GY + ' V' + (GY + 13) + ' H410 Z" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/>' + R(707, GY + 2, 16, 5, "#2b2e33", 1.2, 1) + '</g>'; }
  function sep(t, k, flow) {
    if (k <= 0) return ""; var s = tube(poly([[715, GY + 9], [715, 192]], k), 5) + tube(poly([[772, 224], [840, 224]], k), 5);
    s += '<g transform="translate(732 213) scale(' + f(pop(k)) + ') translate(-732 -213)">' + R(690, 188, 84, 50, "#39424c", 2.6, 5) + '<rect x="693" y="204" width="78" height="31" fill="#5aa0c8"/>';
    var w = "M693 200"; for (var x = 693; x <= 739; x += 6) w += " L" + x + " " + f(200 + Math.sin(x * 0.3 + t * 3) * 1); s += '<path d="' + w + ' V207 H693 Z" fill="' + FUEL + '"/><path d="M740 190 V226" stroke="#c9ced4" stroke-width="3"/>';
    for (var i = 0; i < 5; i++) { var p = (t * 0.5 + i / 5) % 1; s += '<circle cx="' + f(700 + hash(i) * 34) + '" cy="' + f(lerp(232, 206, p)) + '" r="2.4" fill="' + FUEL + '"/>'; }
    s += '<path d="' + 'M690 188 H774 V238 H690 Z' + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/></g>';
    if (flow) s += flowD(poly([[715, GY + 9], [715, 198]]), t, "#8fc3e6", 3, 50) + flowD(poly([[772, 224], [840, 224]]), t, "#8fc3e6", 3, 50);
    return s;
  }
  function ext(x, k) { if (k <= 0) return ""; return '<g transform="translate(' + x + ' ' + GY + ') scale(' + f(pop(k)) + ')">' + R(-5, -22, 10, 22, "#d8352a", 1.6, 3) + R(-2, -27, 4, 5, "#2b2e33", 1) + '<path d="M2 -25 q8 0 8 8" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>'; }
  function canopy(t, k, o) {
    o = o || {}; if (k <= 0) return ""; var s = '<g transform="translate(0 ' + f(lerp(-280, 0, ease(k))) + ')">' + R(446, 34, 12, GY - 34, "#e9e4d8", 2) + R(680, 34, 12, GY - 34, "#e9e4d8", 2) + R(396, 14, 350, 22, "#c23a26", 2.4, 3) + '<rect x="398" y="21" width="346" height="6" fill="#f4f1e8"/>';
    for (var i = 0; i < 6; i++) s += '<ellipse cx="' + (430 + i * 56) + '" cy="38" rx="12" ry="3" fill="#ffe9a0" stroke="' + INK + '" stroke-width="1" opacity="' + f(0.7 + 0.3 * Math.sin(t * 5 + i * 1.7)) + '"/>' + (o.night ? '<path d="M' + (418 + i * 56) + ' 40 L' + (396 + i * 56) + ' ' + GY + ' H' + (464 + i * 56) + ' L' + (442 + i * 56) + ' 40 Z" fill="#ffe9a0" opacity="' + f(0.1 + 0.03 * Math.sin(t * 5 + i)) + '"/>' : "");
    s += '</g>';
    if (o.estop) s += '<g transform="translate(452 ' + (GY - 58) + ') scale(' + f(pop(o.estop)) + ')">' + R(-8, -10, 16, 20, "#f2c230", 1.6, 2) + '<circle r="5.5" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/><circle r="' + f(8 + 3 * Math.sin(t * 6)) + '" fill="none" stroke="#d8352a" stroke-width="1.4" opacity=".6"/></g>';
    if (o.ext) s += ext(436, o.ext) + ext(672, o.ext);
    return s;
  }
  function tanker(x, t) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(GY + Math.sin(t * 30) * 0.5) + ')">' + R(-80, -24, 166, 7, "#2b2e33", 1.6) + R(-82, -62, 124, 40, "url(#steel)", 2.4, 20) + '<path d="M-60 -62 V-22 M-20 -62 V-22 M20 -62 V-22" stroke="#6a727c" stroke-width="1.6"/>' + R(-30, -68, 20, 7, "#8a929c", 1.6, 2);
    s += '<path d="M46 -56 H70 Q84 -54 86 -36 V-18 H46 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2.4"/>' + R(60, -50, 18, 16, "url(#gGlass)", 1.6, 2);
    [-56, -32, 62].forEach(function (wx) { s += '<circle cx="' + wx + '" cy="-10" r="10" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle cx="' + wx + '" cy="-10" r="4" fill="#c9ced4"/>'; });
    return s + '</g>';
  }
  function barrel(x, y, lv) { var s = R(x - 17, y - 46, 34, 46, "#2f6f9f", 2.2, 4) + '<path d="M' + (x - 17) + ' ' + (y - 31) + ' h34 M' + (x - 17) + ' ' + (y - 15) + ' h34" stroke="' + INK + '" stroke-width="2"/>' + R(x - 5, y - 42, 10, 38, "#10202a", 1.4, 2); return s + '<rect x="' + (x - 4) + '" y="' + f(y - 5 - 36 * clamp(lv)) + '" width="8" height="' + f(36 * clamp(lv)) + '" fill="' + FUEL + '"/>' + R(x + 6, y - 51, 7, 5, "#8a929c", 1.2, 1); }
  function carFlip(x, t, col) { return '<g transform="translate(' + f(x) + ' ' + (GY - 17.2) + ') scale(-0.75 0.75)">' + carSide(0, 0, t, 1, col) + '</g>'; }
  function car(x, t, col) { return carSide(x, GY - 17.2, t, 0.75, col); }
  function confetti(t, x0, x1, y0, y1) { var s = ""; for (var c = 0; c < 26; c++) { var p = (t * 0.5 + hash(c)) % 1, x = x0 + hash(c + 2) * (x1 - x0), y = lerp(y0, y1, p); s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="6" height="9" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>'; } return s; }
  // the whole build so far. P: tank, level, rust, leak, dbl, sensor, alarm, beep, vapour, vent, puff, stp, pipe, flow, disp, lit, nz, sag,
  // tilt, nohose, brk, shear, shut, slab, sep, sepflow, canopy, estop, ext, night
  function station(t, P) {
    var s = "";
    if (P.canopy) s += canopy(t, P.canopy, { estop: P.estop, ext: P.ext, night: P.night });
    if (P.slab) s += slab(P.slab);
    if (P.sep) s += sep(t, P.sep, P.sepflow);
    if (P.vent) s += vent(t, P.vent, P.puff);
    if (P.tank) s += tank(t, P);
    if (P.stp) s += stp(t, P.stp, P.pipe, P.flow);
    if (P.shear) s += shear(t, P.shear, P.shut);
    if (P.disp) s += dispenser(t, { k: P.disp, lit: P.lit, nz: P.nz, sag: P.sag, tilt: P.tilt, nohose: P.nohose, brk: P.brk });
    return s;
  }
  function parts(n, extra) {
    var p = { tank: 1, level: 0.7 }; if (n >= 2) { p.dbl = 1; p.sensor = 1; } if (n >= 3) p.vent = 1; if (n >= 4) { p.stp = 1; p.pipe = 1; p.disp = 1; }
    if (n >= 5) { p.brk = 1; p.shear = 1; } if (n >= 6) { p.slab = 1; p.sep = 1; } if (n >= 7) { p.canopy = 1; p.ext = 1; p.estop = 1; }
    for (var k in (extra || {})) p[k] = extra[k]; return p;
  }
  function fill(cx) { return [cx - 52, GY - 33, 12]; }   // nozzle in the filler of a car standing at cx
  // the nozzle up close in section, spout in a car tank: lvl = fuel surface y, on = fuel flowing, air = air drawn in through the hole
  function nozzleBig(t, lvl, on, air) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f3348"/>', i;
    for (i = 0; i < 26; i++) { var gx = ((i * 60 + t * 22) % 1560) - 430; s += '<path d="M' + f(gx) + ' -300 V700" stroke="#2b4560" stroke-width="2"/>'; }
    for (i = 0; i < 14; i++) s += '<path d="M-400 ' + (-240 + i * 60) + ' H1040" stroke="#2b4560" stroke-width="2"/>';
    s += R(232, 205, 330, 200, "#39424c", 3, 10) + '<rect x="330" y="198" width="110" height="12" fill="#39424c"/>';
    var w = "M235 " + f(lvl); for (var x = 235; x <= 559; x += 12) w += " L" + x + " " + f(lvl + Math.sin(x * 0.06 + t * 3) * (on ? 3 : 1.5)); s += '<path d="' + w + ' V402 H235 Z" fill="' + FUEL + '"/><path d="' + w + '" stroke="#ffd980" stroke-width="2.4" fill="none"/>';
    if (on) s += '<path d="M385 238 Q' + f(392 + Math.sin(t * 14) * 2) + ' ' + f((238 + lvl) / 2) + ' 388 ' + f(lvl + 4) + '" stroke="' + FUEL + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
    s += '<g transform="translate(380 230) rotate(38)">' + R(-190, -13, 190, 26, "#c9ced4", 2.6, 6);
    if (on) s += '<rect x="-186" y="-8" width="184" height="11" fill="' + FUEL + '"/>' + flowD("M-186 -2 H-4", t, "#ffd980", 3, 90);
    s += '<path d="M-16 8 H-230" stroke="#7fd0ff" stroke-width="3.4" fill="none"/>';
    if (air) for (i = 0; i < 6; i++) s += '<circle cx="' + f(-16 - ((t * 90 + i * 36) % 214)) + '" cy="8" r="3" fill="#fff"/>';
    s += '<circle cx="-16" cy="13" r="5" fill="#10202a" stroke="' + INK + '" stroke-width="1.6"/>' + R(-305, -30, 120, 60, "#c23a26", 3, 14) + '<path d="M-290 30 L-212 54 L-202 46" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<circle cx="-245" cy="0" r="18" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/><path d="M-261 0 Q-245 ' + f(air ? Math.sin(t * 10) * 3 : -11) + ' -229 0" stroke="#2f6f9f" stroke-width="3.4" fill="none"/></g>';
    if (air) for (i = 0; i < 3; i++) { var p = (t * 1.2 + i / 3) % 1; s += '<circle cx="' + f(lerp(322, 357, p) + i * 3) + '" cy="' + f(lerp(266, 233, p)) + '" r="' + f(3.4 * (1 - p * 0.5)) + '" fill="#7fd0ff"/>'; }
    return s;
  }
  function phone(x, y, sc, t) { var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2) * 4) + ') scale(' + sc + ')">' + R(-16, -30, 32, 60, "#2b2e33", 2.4, 6) + R(-12, -24, 24, 44, "#5aa0c8", 1.2, 2); for (var i = 0; i < 3; i++) { var p = (t * 0.9 + i / 3) % 1; s += '<path d="M' + f(20 + p * 22) + ' ' + f(-12 - p * 10) + ' q' + f(6 + p * 4) + ' ' + f(12 + p * 10) + ' 0 ' + f(24 + p * 20) + '" stroke="#f2c230" stroke-width="2.6" fill="none" opacity="' + f(1 - p) + '"/>'; } return s + '</g>'; }
  function spark(x1, y1, x2, y2, t) { var d = "M" + f(x1) + " " + f(y1), n = 5; for (var i = 1; i < n; i++) d += " L" + f(lerp(x1, x2, i / n) + (hash(i + Math.floor(t * 24)) - 0.5) * 9) + " " + f(lerp(y1, y2, i / n) + (hash(i * 3 + Math.floor(t * 24)) - 0.5) * 9); d += " L" + f(x2) + " " + f(y2); return '<path d="' + d + '" stroke="#fff" stroke-width="5" fill="none" filter="url(#glow)"/><path d="' + d + '" stroke="#7fd0ff" stroke-width="2.2" fill="none"/>'; }
  function man(x, t, mood, col, sc) { return mini(x, GY, sc || 0.72, col || "#2f6f9f", t, mood); }

  // 0 — a drum of petrol and a hose at the kerb: is that a petrol station?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(250, 300, k), lerp(105, 120, k), lerp(1.6, 1.2, k)]; }, function (u, d, t) {
    var cx = lerp(-80, 150, ease(u / 2.6)), s = scene(t) + car(cx, u < 2.6 ? t : 0, "#3aa05a");
    s += barrel(300, GY, 1) + hose(hoseD([309, GY - 49], [262, GY - 26], 6)) + nozzle(262, GY - 26, 170) + man(270, t, "happy", "#e8742e");
    return s + qmark(355, 50, t, 44) + tag("بنزينة؟", 445, 80, u, 3.2, 3, 26);
  });
  // 1 — no: the drum is empty after four cars, and one spark sets the street on fire
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(300, 290, k), lerp(120, 105, k), lerp(1.2, 1.55, k)]; }, function (u, d, t) {
    var lv = 1 - clamp(u / 2.2), fire = clamp((u - 2.8) / 0.8), s = scene(t);
    for (var i = 0; i < 4; i++) { var cu = u * 2.2 - i * 1.15, x = lerp(-90, 150, ease(cu)) + (cu > 1.1 ? (cu - 1.1) * 420 : 0); if (cu > 0) s += car(x, t, ["#3aa05a", "#c23a26", "#e2b035", "#2f6f9f"][i]); }
    s += barrel(300, GY, lv) + hose(hoseD([309, GY - 49], [262, GY - 26], 6)) + nozzle(262, GY - 26, 170) + man(270, t, u > 2 ? "shock" : "worry", "#e8742e");
    if (fire > 0) s += star(318, GY - 54, 14 * (1 - clamp((u - 3.3) * 2)) + 0.01, t, "#fff") + flame(300, GY - 44, fire * 1.3, t) + flame(336, GY - 4, fire * 0.8, t + 1) + flame(250, GY - 2, fire * 0.6, t + 2);
    return s + tag("4 عربيات بس!", 190, 40, u, 0.8, -3, 22) + tag("شرارة!", 400, 50, u, 3.0, 4, 24, "#f2a0a0") + cross(380, 110, 0.5, (u - 3.4) / 1.2);
  });
  // 2 — so you dig a big pit and bury a steel tank that holds about forty thousand litres
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(250, 270, k), lerp(150, 235, k), lerp(1.05, 1.2, k)]; }, function (u, d, t) {
    var dn = ease(clamp((u - 0.5) / 2.4)), cov = ease(clamp((u - 3.3) / 1.0)), s = scene(t), y = lerp(-250, 0, dn);
    s += '<path d="M70 ' + (GY - 1) + ' H430 L420 ' + (TY1 + 18) + ' H80 Z" fill="#5a3c20" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 8; k++) { var p = (t * 0.9 + k / 8) % 1; s += '<circle cx="' + f(lerp(430, 470 + k * 8, p)) + '" cy="' + f(GY - 34 * Math.sin(p * Math.PI) * (1 - cov)) + '" r="4" fill="' + SOILD + '"/>'; }
    s += '<path d="M440 ' + GY + ' q40 -34 90 0 Z" fill="' + SOILD + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - cov) + '"/>';
    s += '<g opacity="' + f(cov) + '"><path d="M70 ' + GY + ' H430 L420 ' + (TY1 + 18) + ' H80 Z" fill="' + SOILC + '"/><rect x="60" y="' + GY + '" width="380" height="9" fill="url(#gAsphalt)" stroke="' + INK + '" stroke-width="1.6"/></g>';
    s += '<g transform="translate(0 ' + f(y) + ')">' + (cov < 1 ? '<path d="M170 ' + TY0 + ' L250 -300 L330 ' + TY0 + '" stroke="' + INK + '" stroke-width="2.4" fill="none" opacity="' + f(1 - cov) + '"/>' : "") + tank(t, { level: 0.08 }) + '</g>';
    return s + man(40, t, "happy", "#e8742e") + tag("خزان حديد", 250, 196, u, 1.2, -3, 22) + tag("40,000 لتر", 470, 262, u, 3.2, 3, 24, "#ffe08a");
  });
  // 3 — but buried steel rusts over the years, and the petrol leaks into the ground
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(250, 265, k), lerp(250, 268, k), lerp(1.45, 1.8, k)]; }, function (u, d, t) {
    var r = clamp(u / 2.2); return scene(t) + station(t, parts(1, { rust: r, leak: u > 1.6 ? 372 : 0 })) + tag("صدا!", 190, 196, u, 0.7, -4, 22, "#f2a0a0") + tag("بيسرّب", 370, 338, u, 2.0, 3, 22, "#f2a0a0");
  });
  // 4 — one litre of petrol can spoil a million litres of groundwater
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(262, 255, k), lerp(300, 372, k), lerp(1.5, 1.25, k)]; }, function (u, d, t) {
    var k = ease(clamp(u / 3.6)), s = scene(t) + station(t, parts(1, { rust: 1, leak: WY }));
    for (var i = 0; i < 5; i++) s += '<ellipse cx="' + f(250 + Math.sin(t * 0.8 + i) * 14) + '" cy="' + f(WY + 16 + i * 7) + '" rx="' + f((30 + 250 * k) * (1 - i * 0.14)) + '" ry="' + f(7 + 12 * k) + '" fill="#6a3f0c" opacity="' + f(0.34 - i * 0.04) + '"/>';
    return s + tag("1 لتر", 150, 340, u, 0.5, -3, 22, "#ffe08a") + tag("مليون لتر مية!", 262, 448, u, 1.9, 3, 26, "#f2a0a0") + cross(420, 395, 0.6, (u - 2.6) / 1.2);
  });
  // 5 — so the tank is built with two walls, and a sensor between them beeps as soon as a drop gets through
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(250, 250, k), lerp(262, 280, k), lerp(1.3, 1.65, k)]; }, function (u, d, t) {
    var a = u > 3.4 && ((u - 3.4) % 1.4) < 0.9; return scene(t) + station(t, parts(1, { dbl: ease(u / 1.4), sensor: (u - 2.0) / 1.2, beep: u > 2.6, alarm: a })) + tag("جدارين", 175, 200, u, 0.7, -3, 22, "#ffe08a") + tag("حساس تسريب", 330, 342, u, 2.4, 3, 21) + check(420, 258, 0.5, (u - 3.0) / 1.2);
  });
  // 6 — but while the tank is being filled, the vapour inside needs a way out
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(255, 240, k), lerp(180, 195, k), lerp(1.15, 1.25, k)]; }, function (u, d, t) {
    var lv = lerp(0.25, 0.78, clamp(u / d)), s = scene(t) + station(t, parts(2, { level: lv, vapour: 1 }));
    s += tanker(205, t) + hose(hoseD([130, GY - 22], [170, GY - 4], 16)) + flowD(poly([[170, GY + 4], [170, TY0 + 20]]), t, FUEL, 3, 60);
    for (var i = 0; i < 4; i++) { var p = 0.5 + 0.5 * Math.sin(t * 7 + i); s += arrow(160 + i * 62, TY0 + 4, 160 + i * 62, TY0 - 8 - p * 8, "#ff6a5a", 3, 1); }
    return s + tag("البخار محبوس!", 385, 100, u, 1.3, 3, 18, "#f2a0a0");
  });
  // 7 — so you run a vent pipe up, close to four metres, away from people and from any spark
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(190, 120, k), lerp(185, 108, k), lerp(1.2, 1.36, k)]; }, function (u, d, t) {
    var vk = ease(clamp((u - 0.3) / 2.0)), s = scene(t) + station(t, parts(2, { level: 0.8, vapour: 1 - 0.7 * clamp((u - 2.3) / 2), vent: vk, puff: clamp((u - 2.3) / 0.6) }));
    s += tanker(205, t) + hose(hoseD([130, GY - 22], [170, GY - 4], 16)) + man(10, t, "happy", "#e8742e");
    var ak = clamp((u - 3.0) * 1.6); s += arrow(40, (GY + 40) / 2, 40, 44, "#f2c230", 4, ak) + arrow(40, (GY + 40) / 2, 40, GY - 4, "#f2c230", 4, ak);
    return s + tag("ماسورة تهوية", 200, 46, u, 1.0, 3, 21) + tag("≈ 4 متر", -35, 60, u, 3.3, -4, 22, "#ffe08a");
  });
  // 8 — but the petrol is under the ground, and the car is up here
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(390, 440, k), lerp(200, 185, k), lerp(1.05, 1.15, k)]; }, function (u, d, t) {
    var cx = lerp(250, 600, ease(u / 1.4)), s = scene(t) + station(t, parts(3)) + car(cx, u < 1.4 ? t : 0, "#c23a26");
    for (var i = 0; i < 7; i++) { var p = (t * 0.6 + i / 7) % 1; s += '<circle cx="' + f(lerp(380, 560, p)) + '" cy="' + f(lerp(250, GY + 14, p) - Math.sin(p * Math.PI) * 26) + '" r="4" fill="#f2c230" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(Math.sin(p * Math.PI)) + '"/>'; }
    return s + qmark(480, 238, t, 54) + tag("إزاي يطلع؟", 560, 285, u, 0.6, 3, 22);
  });
  // 9 — so a submersible pump goes down inside the tank and pushes the petrol through pipes to the dispenser
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(350, 430, k), lerp(225, 170, k), lerp(1.35, 1.15, k)]; }, function (u, d, t) {
    var s = scene(t) + station(t, parts(3, { stp: ease(clamp(u / 1.5)) + 0.001, pipe: ease(clamp((u - 1.5) / 1.5)), disp: (u - 3.0) / 1.2, flow: u > 3.0 })) + car(600, 0, "#c23a26");
    return s + tag("طلمبة غاطسة", 445, 238, u, 0.9, -3, 21, "#ffe08a") + tag("مكنة البنزين", 600, 52, u, 3.6, 3, 21);
  });
  // 10 — the dispenser counts every litre and delivers about forty litres a minute
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(525, 520, k), lerp(112, 104, k), lerp(1.9, 2.3, k)]; }, function (u, d, t) {
    var lit = (u * 6.8).toFixed(1); if (lit.length < 4) lit = "0" + lit; var nz = fill(600);
    var s = scene(t) + station(t, parts(4, { flow: 1, lit: lit, nz: nz, sag: 26 })) + car(600, 0, "#c23a26") + nozzle(nz[0], nz[1], nz[2]) + flowD(hoseD([DX + 22, GY - 68], nz, 26), t, FUEL, 1.6, 50);
    return s + man(470, t, "happy", "#e8742e", 0.62) + tag("40 لتر/دقيقة", 580, 48, u, 1.4, 3, 17, "#ffe08a");
  });
  // 11 — but the car's tank can fill up and spill while you are daydreaming
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(565, 555, k), lerp(118, 126, k), lerp(2.1, 2.5, k)]; }, function (u, d, t) {
    var nz = fill(600), s = scene(t) + station(t, parts(4, { flow: 1, lit: (27.2 + u * 5).toFixed(1), nz: nz, sag: 26 })) + car(600, 0, "#c23a26") + nozzle(nz[0], nz[1], nz[2]);
    for (var i = 0; i < 9; i++) { var p = (t * 1.3 + i / 9) % 1; s += '<path d="M' + f(nz[0] + 8 + Math.sin(i * 2) * 5 - p * 6) + ' ' + f(lerp(nz[1] + 4, GY - 2, p * p)) + ' q-3 5 0 7 q3 -2 0 -7 Z" fill="' + FUEL + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += '<ellipse cx="' + (nz[0] + 4) + '" cy="' + (GY + 3) + '" rx="' + f(8 + clamp(u / d) * 34) + '" ry="3.4" fill="' + FUEL + '" stroke="' + INK + '" stroke-width="1"/>';
    s += man(506, t, "dizzy", "#e8742e", 0.62) + T("z", 492, 84 - ((t * 10) % 14), 11, "#fff") + T("z", 484, 70 - ((t * 10) % 14), 8, "#fff");
    return s + tag("بيدلق!", 620, 76, u, 0.8, 3, 16, "#f2a0a0") + cross(655, 108, 0.36, (u - 1.4) / 1.2);
  });
  // 12 — so there is a small hole at the tip of the nozzle that sucks in air
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(320, 330, k), lerp(180, 175, k), lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    var s = nozzleBig(t, 330, true, true) + arrow(455, 282, 372, 240, "#f2c230", 4, clamp((u - 1.0) * 2));
    return s + tag("خرم صغير", 500, 296, u, 0.8, 3, 24, "#ffe08a") + tag("بيسحب هوا", 170, 215, u, 2.0, -4, 22);
  });
  // 13 — as soon as the petrol covers it, the nozzle shuts off by itself, with no electricity at all
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(330, 322, k), lerp(175, 180, k), lerp(1.08, 1.0, k)]; }, function (u, d, t) {
    var lvl = lerp(330, 216, ease(clamp(u / 1.9))), on = lvl > 227, s = nozzleBig(t, lvl, on, on);
    if (!on) s += star(187, 79, 30 * (1 - clamp((u - 1.7) / 0.7)) + 0.01, t, "#ffe46a") + '<circle cx="359" cy="231" r="' + f(9 + 4 * Math.sin(t * 8)) + '" fill="none" stroke="#f2c230" stroke-width="3"/>';
    return s + tag("تك!", 300, 52, u, 1.7, -5, 26, "#ffe08a") + tag("يفصل لوحده", 500, 150, u, 2.3, 3, 24, "#bfe8c0") + check(590, 100, 0.6, (u - 2.8) / 1.2);
  });
  // 14 — but someone can drive off with the nozzle still in the tank
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(560, 625, k), lerp(118, 118, k), lerp(1.5, 1.3, k)]; }, function (u, d, t) {
    var cx = 600 + 105 * ease(clamp((u - 0.4) / 1.8)) + Math.sin(t * 24) * (u > 2.2 ? 1.5 : 0), nz = fill(cx);
    var s = scene(t) + station(t, parts(4, { nz: nz, sag: Math.max(0, 26 - (cx - 600) * 0.5), tilt: clamp((cx - 660) / 45) * 6 })) + car(cx, t, "#c23a26") + nozzle(nz[0], nz[1], nz[2]);
    return s + man(455, t, "shock", "#e8742e") + tag("استنى!", 470, 52, u, 0.9, -4, 24, "#f2a0a0");
  });
  // 15 — so the hose has a coupling that comes apart and seals itself: not a drop comes out
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(585, 610, k), lerp(112, 116, k), lerp(1.7, 2.1, k)]; }, function (u, d, t) {
    var cx = 705 + u * 9, nz = fill(cx), sw = Math.sin(t * 3) * 6 * Math.exp(-u * 0.5), a = [DX + 22, GY - 68], e1 = [556 + sw, GY - 12], e2 = [nz[0] - 34, GY - 16 + Math.sin(t * 5) * 2];
    var s = scene(t) + station(t, parts(4, { nohose: 1, shear: 1 })) + car(cx, t, "#c23a26") + hose(hoseD(a, e1, 4)) + hose(hoseD(e2, nz, 8)) + nozzle(nz[0], nz[1], nz[2]);
    [e1, e2].forEach(function (e) { s += '<circle cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" r="5.5" fill="#f2c230" stroke="' + INK + '" stroke-width="1.8"/><circle cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" r="' + f(8 + 3 * Math.sin(t * 7)) + '" fill="none" stroke="#f2c230" stroke-width="1.4" opacity=".7"/>'; });
    return s + star((e1[0] + e2[0]) / 2, GY - 16, 16 * (1 - clamp(u / 0.6)) + 0.01, t) + tag("وصلة أمان", 610, 58, u, 0.8, 3, 18, "#ffe08a") + check(600, GY - 42, 0.34, (u - 2.0) / 1.2) + man(470, t, "happy", "#e8742e", 0.62);
  });
  // 16 — and if a car hits the dispenser itself, a valve under it shuts the pipe at once
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(545, 505, k), lerp(125, 152, k), lerp(1.45, 1.95, k)]; }, function (u, d, t) {
    var k = clamp(u / 1.0), hit = u > 1.0, cx = lerp(840, 594, k * k) + (hit ? Math.min(10, (u - 1.0) * 30) : 0);
    var s = scene(t) + station(t, parts(5, { tilt: hit ? -16 * clamp((u - 1.0) * 6) + Math.sin(t * 20) * 1.2 * Math.exp(-(u - 1) * 2) : 0, shut: hit, flow: !hit, shear: 1 })) + carFlip(cx, hit ? 0 : t, "#2f6f9f");
    if (hit) s += star(532, GY - 30, 22 * (1 - clamp((u - 1.0) / 0.7)) + 0.01, t) + '<circle cx="' + DX + '" cy="' + (GY + 15) + '" r="' + f(15 + 4 * Math.sin(t * 8)) + '" fill="none" stroke="#f2c230" stroke-width="2.4"/>';
    return s + tag("صمام قطع", 600, 208, u, 1.5, 3, 20, "#ffe08a") + check(420, 190, 0.4, (u - 2.4) / 1.2);
  });
  // 17 — but any petrol spilled on the ground gets washed into the drains by the rain
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(570, 660, k), lerp(140, 150, k), lerp(1.35, 1.5, k)]; }, function (u, d, t) {
    var s = scene(t, { sky: "dusk" }) + station(t, parts(5)) + car(600, 0, "#c23a26");
    for (var i = 0; i < 9; i++) { var p = (t * 0.35 + i / 9) % 1, x = lerp(560, 900, p); s += '<ellipse cx="' + f(x) + '" cy="' + (GY + 4) + '" rx="' + f(16 - p * 6) + '" ry="3" fill="' + ["#eba21c", "#d06a8a", "#5aa0c8"][i % 3] + '" opacity=".85" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += arrow(650, GY + 26, 760, GY + 26, "#f2a0a0", 4, clamp((u - 0.8) / 1));
    return s + rain(t) + tag("على المجاري!", 700, 78, u, 1.2, 3, 22, "#f2a0a0") + cross(790, 128, 0.5, (u - 1.8) / 1.2);
  });
  // 18 — so the floor is concrete sloping to a drain, with a tank under it that separates the petrol from the water
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(650, 680, k), lerp(160, 185, k), lerp(1.3, 1.5, k)]; }, function (u, d, t) {
    var sk = ease(clamp(u / 1.2)), pk = clamp((u - 1.2) / 1.2), s = scene(t, { sky: "dusk" }) + station(t, parts(5, { slab: sk, sep: pk, sepflow: u > 2.6 })) + car(600, 0, "#c23a26");
    if (sk >= 1) for (var i = 0; i < 6; i++) { var p = (t * 0.6 + i / 6) % 1; s += '<ellipse cx="' + f(lerp(560, 712, p)) + '" cy="' + f(GY + 1 + p * 3) + '" rx="7" ry="2" fill="' + (i % 2 ? FUEL : "#8fc3e6") + '" stroke="' + INK + '" stroke-width=".6"/>'; }
    return s + rain(t, 0.7) + tag("خرسانة مايلة", 770, 98, u, 0.6, -3, 19) + tag("فاصل", 800, 262, u, 2.6, 3, 22, "#ffe08a") + check(840, 200, 0.42, (u - 3.4) / 1.2);
  });
  // 19 — many people think a mobile phone can set a petrol station on fire
  function phoneScene(u, t, ok) {
    var nz = fill(645), s = scene(t) + station(t, parts(6, { nz: nz, sag: 26, flow: 1 })) + car(645, 0, "#c23a26") + nozzle(nz[0], nz[1], nz[2]) + man(552, t, ok ? "happy" : "worry", "#3aa05a") + R(562, GY - 44, 7, 12, "#2b2e33", 1.2, 2);
    return s + phone(560, 36, 1, t);
  }
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(545, 525, k), lerp(98, 90, k), lerp(1.5, 1.75, k)]; }, function (u, d, t) {
    var s = phoneScene(u, t, false), r = 44 + 3 * Math.sin(t * 6), k = pop((u - 0.9) / 1.2);
    if (k > 0) s += '<g transform="translate(560 36) scale(' + f(k) + ')"><circle r="' + f(r) + '" fill="none" stroke="#d8352a" stroke-width="7"/><path d="M' + f(-r * 0.7) + ' ' + f(-r * 0.7) + ' L' + f(r * 0.7) + ' ' + f(r * 0.7) + '" stroke="#d8352a" stroke-width="7"/></g>';
    return s + qmark(640, 46, t, 46);
  });
  // 20 — the truth: not one fire has ever been confirmed to be caused by a phone
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(525, 545, k), lerp(90, 96, k), lerp(1.75, 1.55, k)]; }, function (u, d, t) {
    return phoneScene(u, t, true) + check(596, 62, 0.7, (u - 0.5) / 1.2) + tag("ولا حريقة!", 440, 18, u, 1.0, -3, 24, "#bfe8c0");
  });
  // 21 — the real culprit is static electricity, blamed for more than a hundred and fifty recorded fires
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(585, 598, k), lerp(108, 114, k), lerp(1.55, 1.8, k)]; }, function (u, d, t) {
    var nz = fill(645), s = scene(t) + station(t, parts(6, { nz: nz, sag: 26 })) + car(645, 0, "#c23a26") + nozzle(nz[0], nz[1], nz[2]) + man(558, t, "shock", "#3aa05a");
    s += '<path d="M566 ' + (GY - 26) + ' L' + f(578 + Math.sin(t * 4) * 1.5) + ' ' + (GY - 32) + '" stroke="#3aa05a" stroke-width="6" stroke-linecap="round"/><circle cx="' + f(580 + Math.sin(t * 4) * 1.5) + '" cy="' + (GY - 33) + '" r="3.6" fill="#fbfbf7" stroke="' + INK + '" stroke-width="1.2"/>';
    if (((t * 2.2) % 1) < 0.7) s += spark(582, GY - 34, nz[0] - 6, nz[1] - 4, t) + star(nz[0] - 8, nz[1] - 5, 7 + 3 * Math.sin(t * 20), t, "#fff");
    for (var i = 0; i < 5; i++) s += T(i % 2 ? "+" : "−", 545 + i * 9 + Math.sin(t * 5 + i) * 2, GY - 12 - i * 9 + Math.cos(t * 6 + i) * 2, 9, "#7fd0ff");
    return s + tag("كهربا استاتيكية", 565, 42, u, 0.7, -3, 18, "#ffe08a") + tag("+150 حريقة", 690, 182, u, 3.0, 4, 18, "#f2a0a0");
  });
  // 22 — add a big canopy, fire extinguishers and an emergency button that cuts the power to every dispenser
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(530, 560, k), lerp(105, 85, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var s = scene(t) + station(t, parts(6, { canopy: clamp(u / 1.3) + 0.001, ext: (u - 1.9) / 1.2, estop: (u - 3.0) / 1.2 })) + car(645, 0, "#c23a26") + man(552, t, "happy", "#3aa05a");
    return s + tag("مظلة", 600, -30, u, 0.9, 3, 24) + tag("طفايات", 350, 120, u, 2.0, -3, 24, "#f2a0a0") + tag("زرار طوارئ", 320, 36, u, 3.1, 3, 24, "#ffe08a");
  });
  // 23 — congratulations: you have built a petrol station
  function whole(t, sk, night) {
    var nz = fill(645), s = scene(t, { sky: sk }) + station(t, parts(7, { flow: 1, sepflow: 1, puff: 0.6, nz: nz, sag: 26, night: night, lit: ((t * 6.8) % 60).toFixed(1) })) + car(645, 0, "#c23a26") + nozzle(nz[0], nz[1], nz[2]);
    return s + man(552, t, "happy", "#3aa05a") + man(470, t + 1, "happy", "#e8742e") + hardHat(250, GY - 42, 0.3, t, "happy", { point: true });
  }
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [lerp(460, 400, k), lerp(150, 172, k), lerp(1.25, 0.84, k)]; }, function (u, d, t) {
    return whole(t, "day") + confetti(t, 20, 780, -60, GY) + tag("مبروك!", 250, 20, u, 0.3, -3, 34, "#bfe8c0");
  });
  // 24 — if you want to make videos like this, look at the bio
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(400, 380, k), lerp(172, 150, k), lerp(0.84, 0.92, k)]; }, function (u, d, t) {
    var s = whole(t, "day"), k = pop((u - 0.3) / 1.2), by = 30 + Math.sin(t * 3) * 4;
    s += '<g transform="translate(250 ' + f(by) + ') scale(' + f(k * 1.5) + ')">' + R(-20, -36, 40, 72, "#2b2e33", 2.4, 7) + R(-16, -30, 32, 56, "#fbfbf7", 1.2, 3) + '<circle cx="0" cy="-16" r="8" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/><path d="M-10 0 H10 M-10 7 H6" stroke="#9aa2ac" stroke-width="2.4" stroke-linecap="round"/>' + R(-12, 13, 24, 9, "#2f6f9f", 1.2, 3) + '<circle cx="0" cy="17.5" r="' + f(9 + 5 * Math.abs(Math.sin(t * 5))) + '" fill="none" stroke="#f2c230" stroke-width="2"/></g>';
    return s + arrow(165, 72, 208, 48, "#f2c230", 5, clamp((u - 1.0) * 2)) + tag("بص على البايو!", 135, 98, u, 0.8, -3, 22, "#ffe08a");
  });
  // 25 — outro
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(400, 440, k), lerp(172, 160, k), lerp(0.84, 0.95, k)]; }, function (u, d, t) {
    return whole(t, "dusk", true) + tag("قولولنا!", 250, 20, u, 0.4, 3, 32);
  });

  window.__parts = { scene: scene, station: station, parts: parts, tank: tank, vent: vent, stp: stp, dispenser: dispenser, canopy: canopy, slab: slab, sep: sep, car: car, carFlip: carFlip, nozzle: nozzle, fill: fill, man: man, tanker: tanker, hardHat: hardHat, tag: tag, T: T, flame: flame, GY: GY };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
