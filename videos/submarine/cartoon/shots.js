  // ── new pieces for this episode ─────────────────────────
  var AIR = "#bfe6f7", WATER = "#2f7fb8";
  // a sea backdrop: sky + waves above y0 (if visible), water getting darker with depth, light rays, rising bubbles, drifting specks
  function sea(t, y0, depth, o) {
    o = o || {}; var s = "", dk = clamp(depth || 0);
    if (y0 > -300) { s += sky(o.sky || "day") + clouds(t, 14, Math.min(y0 - 160, 40), 4, 0.8); if (o.gulls) s += birds(t, y0 - 120, 40); }
    var top = Math.max(-300, y0);
    s += '<rect x="-400" y="' + f(top) + '" width="1440" height="' + f(660 - top + 300) + '" fill="url(#sea' + (dk > 0.6 ? "3" : dk > 0.25 ? "2" : "1") + ')"/>';
    if (y0 > -300) { var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y0 + Math.sin(x * 0.04 + t * 2.2) * 4 + Math.sin(x * 0.11 - t * 3) * 2); s += '<path d="' + d + ' V' + (y0 + 20) + ' H-400 Z" fill="#8fd0ee" opacity=".55"/><path d="' + d + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>'; }
    if (dk < 0.7) for (var r = 0; r < 6; r++) { var rx = -100 + r * 150 + Math.sin(t * 0.4 + r) * 30; s += '<path d="M' + f(rx) + ' ' + top + ' L' + f(rx + 60) + ' ' + top + ' L' + f(rx + 160) + ' 400 L' + f(rx + 40) + ' 400 Z" fill="#fff" opacity="' + f((0.07 + 0.04 * Math.sin(t * 1.3 + r)) * (1 - dk)) + '"/>'; }
    for (var i = 0; i < 40; i++) { var px = -300 + hash(i) * 1240 + Math.sin(t * 0.6 + i) * 10, py = ((hash(i + 5) * 700 - t * (6 + hash(i) * 8)) % 700 + 700) % 700 - 300; if (py > top) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(0.8 + hash(i + 2) * 1.6) + '" fill="#fff" opacity=".35"/>'; }
    return s;
  }
  function bubbles(t, x, y, n, sp, spread, top) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), bx = x + Math.sin(u * 9 + i) * spread * u + (hash(i) - 0.5) * spread, by = y - u * (y - (top == null ? y - 200 : top)), r = 2 + hash(i + 3) * 5 * (0.5 + u); s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(r) + '" fill="' + AIR + '" fill-opacity=".35" stroke="#fff" stroke-width="1.4" opacity="' + f(1 - u * 0.6) + '"/>'; } return s; }
  function fish(t, y0, sp, n, col) { var s = ""; for (var i = 0; i < n; i++) { var x = ((t * sp * (i % 2 ? 1 : 0.8) + i * 170) % 1100) - 250, y = y0 + i * 18 + Math.sin(t * 2 + i) * 6, w = Math.sin(t * 10 + i) * 3; s += '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-14 0 Q0 -9 12 0 Q0 9 -14 0 Z" fill="' + (col || "#f2a93b") + '" stroke="#1c1c1c" stroke-width="1.2"/><path d="M-13 0 L-22 ' + f(-6 + w) + ' L-22 ' + f(6 + w) + ' Z" fill="' + (col || "#f2a93b") + '" stroke="#1c1c1c" stroke-width="1.2"/><circle cx="6" cy="-2" r="1.6" fill="#1c1c1c"/></g>'; } return s; }
  function seabed(t, y) { var s = '<path d="M-400 ' + y + ' Q0 ' + (y - 20) + ' 300 ' + y + ' T1040 ' + y + ' V700 H-400 Z" fill="#c9b07a" stroke="#8a7448" stroke-width="2"/>'; for (var i = 0; i < 18; i++) { var x = -300 + i * 70 + hash(i) * 30, h = 30 + hash(i + 1) * 50, sw = Math.sin(t * 1.6 + i) * 10; s += '<path d="M' + f(x) + ' ' + y + ' Q' + f(x + sw) + ' ' + f(y - h / 2) + ' ' + f(x + sw * 1.4) + ' ' + f(y - h) + '" stroke="#4f8f5a" stroke-width="5" fill="none" stroke-linecap="round"/>'; } return s; }
  // the submarine, side view (nose to the left). o: {s, tilt, cut (0..1 tank water level shown in a cut-away), hatch (captain head), mood, prop}
  var SUBN = 0;
  function sub(x, y, t, o) {
    o = o || {}; var sid = ++SUBN; var sc = o.s || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + sc + ')">';
    s += '<ellipse cx="0" cy="44" rx="170" ry="10" fill="#0c2a40" opacity=".18" filter="url(#soft)"/>';
    // propeller (spinning) and rudder at the back
    var pa = t * 14; s += '<path d="M178 -22 L196 -34 L200 -30 L190 0 Z M178 22 L196 34 L200 30 L190 0 Z" fill="url(#gSubDark)" stroke="#1c1c1c" stroke-width="1.6"/>';
    s += '<ellipse cx="202" cy="0" rx="4" ry="' + f(16 * Math.abs(Math.cos(pa))) + '" fill="#c9a650" stroke="#1c1c1c" stroke-width="1.2"/><ellipse cx="202" cy="0" rx="4" ry="' + f(16 * Math.abs(Math.sin(pa))) + '" fill="#b08e40" stroke="#1c1c1c" stroke-width="1.2"/><circle cx="200" cy="0" r="4" fill="#1c1c1c"/>';
    // hull
    s += '<path d="M-190 0 C-190 -26 -160 -38 -110 -38 H130 C160 -38 186 -16 196 0 C186 16 160 38 130 38 H-110 C-160 38 -190 26 -190 0 Z" fill="url(#gSub)" stroke="#1c1c1c" stroke-width="2.2"/>';
    s += '<path d="M-170 -16 C-150 -30 -110 -32 -60 -32 H110" stroke="#fff" stroke-width="3" opacity=".28" fill="none" stroke-linecap="round"/>';
    if (o.cut != null) {   // cut-away: inner pressure hull and the ballast tanks between the two skins
      var lv = clamp(o.cut);
      s += '<path d="M-176 0 C-176 -22 -150 -32 -110 -32 H130 C156 -32 178 -14 186 0 C178 14 156 32 130 32 H-110 C-150 32 -176 22 -176 0 Z" fill="#0f2233"/>';
      var hullIn = "M-176 0 C-176 -22 -150 -32 -110 -32 H130 C156 -32 178 -14 186 0 C178 14 156 32 130 32 H-110 C-150 32 -176 22 -176 0 Z";
      s += '<clipPath id="hc' + sid + '"><path d="' + hullIn + '"/></clipPath><g clip-path="url(#hc' + sid + ')">';
      [[-176, -110], [110, 186]].forEach(function (r) { var x0 = r[0], x1 = r[1]; s += '<rect x="' + x0 + '" y="-34" width="' + (x1 - x0) + '" height="68" fill="' + AIR + '"/><rect x="' + x0 + '" y="' + f(34 - 68 * lv) + '" width="' + (x1 - x0) + '" height="' + f(68 * lv + 2) + '" fill="' + WATER + '"/>' + (lv > 0.02 && lv < 0.98 ? '<path d="M' + x0 + ' ' + f(34 - 68 * lv + Math.sin(t * 5) * 1.5) + ' H' + x1 + '" stroke="#fff" stroke-width="1.6" opacity=".7"/>' : ""); });
      s += '</g>';
      s += '<path d="M-110 -26 H110 V26 H-110 Z" fill="url(#gInner)" stroke="#1c1c1c" stroke-width="2.4"/><path d="M-110 -26 C-124 -26 -128 26 -110 26 M110 -26 C124 -26 128 26 110 26" fill="url(#gInner)" stroke="#1c1c1c" stroke-width="2.4"/>';
      for (var w = 0; w < 5; w++) s += '<circle cx="' + (-80 + w * 40) + '" cy="0" r="7" fill="#ffe9a0" stroke="#1c1c1c" stroke-width="1.6"/>';
      s += '<path d="M-150 -36 v-8 M150 -36 v-8" stroke="#1c1c1c" stroke-width="4"/><path d="M-150 36 v6 M150 36 v6" stroke="#1c1c1c" stroke-width="4"/>';
    } else for (var p = 0; p < 6; p++) s += '<circle cx="' + (-120 + p * 46) + '" cy="4" r="6" fill="#ffe9a0" stroke="#1c1c1c" stroke-width="1.6"/>';
    // sail (tower) + periscope + planes
    s += '<path d="M-60 -38 L-50 -84 H10 L20 -38 Z" fill="url(#gSubDark)" stroke="#1c1c1c" stroke-width="2"/><path d="M-30 -84 V-112 H-16" stroke="#3a3d42" stroke-width="4" fill="none"/><rect x="-18" y="-116" width="10" height="7" fill="#3a3d42"/>';
    var pl = o.planes || 0; s += '<g transform="translate(-36 -64) rotate(' + f(pl) + ')"><path d="M-30 0 H30" stroke="#1c1c1c" stroke-width="6" stroke-linecap="round"/><path d="M-30 0 H30" stroke="#5a6470" stroke-width="3" stroke-linecap="round"/></g>';
    if (o.hatch) s += head(-20, -96, 12, o.mood || "happy", t, 0);
    return s + '</g>';
  }
  function captain(x, y, t, mood, o) {   // the captain up close: ball head, cap, navy shirt
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2.5) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ')">';
    s += '<path d="M-70 150 C-74 60 -46 34 0 34 C46 34 74 60 70 150 Z" fill="#26405e" stroke="#1c1c1c" stroke-width="3"/><path d="M-18 36 L0 60 L18 36" fill="#f4f1e8" stroke="#1c1c1c" stroke-width="2"/>';
    s += head(0, -40, 44, mood, t, o.look) + '<path d="M-46 -64 C-40 -100 40 -100 46 -64 Z" fill="#f4f1e8" stroke="#1c1c1c" stroke-width="3"/><path d="M-50 -64 H50" stroke="#1c1c1c" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="-80" r="6" fill="#e2b035" stroke="#1c1c1c" stroke-width="1.6"/>';
    if (o.lever != null) { var lv = o.lever; s += '<path d="M60 150 L' + f(80 + 30 * lv) + ' 60" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/><rect x="' + f(68 + 30 * lv) + '" y="40" width="26" height="22" rx="5" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/><path d="M44 60 Q70 ' + f(90) + ' ' + f(80 + 30 * lv) + ' 58" stroke="#26405e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(80 + 30 * lv) + '" cy="56" r="11" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>'; }
    return s + '</g>';
  }
  function control(t, warn) {   // inside the control room: pipes, gauges, a porthole with fish going by
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a4654"/>';
    for (var p = 0; p < 4; p++) s += '<path d="M-400 ' + (40 + p * 18) + ' H1040" stroke="#5a6676" stroke-width="10"/><path d="M-400 ' + (40 + p * 18) + ' H1040" stroke="#7a8696" stroke-width="3"/>';
    s += '<circle cx="520" cy="190" r="70" fill="url(#sea2)" stroke="#c9a650" stroke-width="12"/>' + '<g clip-path="url(#port)">' + fish(t, 160, 50, 3, "#f2c230") + bubbles(t, 520, 260, 6, 0.4, 30, 110) + '</g>';
    for (var b = 0; b < 8; b++) s += '<circle cx="' + (520 + Math.cos(b * 0.785) * 70) + '" cy="' + (190 + Math.sin(b * 0.785) * 70) + '" r="4" fill="#8a6f30"/>';
    s += gauge(110, 210, 26, 0.4 + 0.1 * Math.sin(t * 1.2), "") + gauge(180, 220, 20, 0.6, "") + '<rect x="-400" y="290" width="1440" height="300" fill="#2b3440"/>';
    if (warn) s += '<circle cx="250" cy="120" r="10" fill="#ff3b2f" filter="url(#glow)" opacity="' + (Math.sin(t * 9) > 0 ? 1 : 0.2) + '"/>';
    return s;
  }
  function depthGauge(x, y, m) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-44" y="-20" width="88" height="40" rx="8" fill="#1c1c1c" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:700 20px Noto Serif;fill:#7cf29a;direction:ltr">' + Math.round(m) + ' m</text></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — thousands of tonnes of steel, floating like a boat
  shot(0, function (u, d) { return [lerp(260, 380, u / d), 180, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = sea(t, 190, 0, { gulls: true }) + sub(320, 198 + Math.sin(t * 1.6) * 3, t, { hatch: true, mood: "happy", tilt: Math.sin(t * 1.2) * 1.2 });
    return s + tag("آلاف الأطنان!", 470, 70, u, 0.6, 3, 22);
  });
  // 1 — floats, dives, comes back up
  shot(1, function (u, d) { var k = u / d; return [320, lerp(180, 230, Math.sin(Math.PI * k)), lerp(1.0, 0.9, Math.sin(Math.PI * k))]; }, function (u, d, t) {
    var k = u / d, dv = Math.sin(Math.PI * clamp((k - 0.15) / 0.85)), sy = lerp(198, 330, dv), s = sea(t, 160, dv * 0.3);
    s += bubbles(t, 320, sy - 40, dv > 0.05 && k < 0.55 ? 10 : 0, 1.2, 40, 160) + fish(t, 250, 30, 3) + sub(320, sy, t, { tilt: (k < 0.5 ? 1 : -1) * 6 * Math.sin(Math.PI * clamp((k - 0.15) / 0.85) * 2) });
    return s + tag(k < 0.5 ? "تنزل…" : "وتطلع!", 500, 300, u, k < 0.5 ? 0.8 : d / 2, k < 0.5 ? -3 : 3, 22);
  });
  // 2 — the secret: water and air
  shot(2, function (u, d) { return [lerp(240, 400, u / d), 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.2) + bubbles(t, 160, 380, 12, 0.5, 120, -80) + bubbles(t, 480, 380, 12, 0.5, 120, -80);
    var a = pop((u - 0.3) / 1.2), b = pop((u - 1.6) / 1.2);
    s += '<g transform="translate(200 180) scale(' + f(a) + ')"><path d="M0 -80 C40 -20 60 10 60 40 C60 80 30 100 0 100 C-30 100 -60 80 -60 40 C-60 10 -40 -20 0 -80 Z" fill="' + WATER + '" stroke="#1c1c1c" stroke-width="4"/><path d="M-30 30 C-30 10 -20 0 -14 -6" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/></g>';
    s += '<g transform="translate(440 180) scale(' + f(b) + ')"><circle r="80" fill="' + AIR + '" fill-opacity=".5" stroke="#1c1c1c" stroke-width="4"/><circle cx="-30" cy="-30" r="16" fill="#fff" opacity=".8"/></g>';
    return s + tag("مية", 200, 320, u, 0.4, -3, 24, "#cfe3ef") + tag("وهوا", 440, 320, u, 1.7, 3, 24);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    return sea(t, -400, 0.35) + fish(t, 90, 60, 5, "#f2c230") + sub(lerp(780, -140, u / d), 200, t, { s: 0.7 }) + bubbles(t, lerp(840, -80, u / d), 200, 8, 1, 30, 40) + tag("إيه الحكاية؟", 320, 290, u, 0.1, -2, 32);
  });
  // 4 — water pushes anything in it upward: a beach ball held under and let go
  shot(4, function (u, d) { return [lerp(300, 340, u / d), 190, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var rel = u > 0.9, by = rel ? lerp(260, 140, clamp((u - 0.9) / 0.7)) + (u > 1.6 ? Math.sin(t * 3) * 4 : 0) : 260 + Math.sin(t * 8) * 3, s = sea(t, 150, 0);
    s += '<g transform="translate(320 ' + f(by) + ') rotate(' + f(t * 30) + ')"><circle r="40" fill="#fff" stroke="#1c1c1c" stroke-width="3"/><path d="M0 -40 A40 40 0 0 1 34.6 20 L0 0 Z" fill="#c23a26"/><path d="M34.6 20 A40 40 0 0 1 -34.6 20 L0 0 Z" fill="#2f6f9f"/><path d="M-34.6 20 A40 40 0 0 1 0 -40 L0 0 Z" fill="#f2c230"/><circle r="40" fill="none" stroke="#1c1c1c" stroke-width="3"/></g>';
    if (!rel) s += '<path d="M320 ' + f(by - 40) + ' C318 120 330 40 330 -40" stroke="#e2b48e" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M320 ' + f(by - 40) + ' C318 120 330 40 330 -40" stroke="#1c1c1c" stroke-width="2" fill="none" opacity=".4"/>';
    s += arrow(400, 300, 400, 220, "#4f8f5a", 9, (u - 0.2) / 0.6) + arrow(240, 300, 240, 220, "#4f8f5a", 9, (u - 0.4) / 0.6);
    return s + tag("المية بتزق لفوق!", 470, 60, u, 1.0, 3, 20);
  });
  // 5 — the push equals the weight of the water it pushed aside
  shot(5, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var drop = clamp((u - 0.4) / 0.8), lvl = lerp(200, 170, drop), s = paper(t);
    s += '<path d="M120 90 V290 H360 V150 H400" fill="none" stroke="#1c1c1c" stroke-width="4"/><rect x="122" y="' + f(lvl) + '" width="236" height="' + f(288 - lvl) + '" fill="' + WATER + '" opacity=".75"/><path d="M122 ' + f(lvl + Math.sin(t * 4) * 1.5) + ' H358" stroke="#fff" stroke-width="2"/>';
    s += '<rect x="200" y="' + f(lerp(40, 200, drop * drop)) + '" width="80" height="70" rx="8" fill="#8a8f96" stroke="#1c1c1c" stroke-width="3"/>';
    var spill = clamp((u - 1.1) / 1.4); for (var k = 0; k < 6; k++) { var q = ((t * 1.5 + k / 6) % 1); if (spill > 0.05) s += '<circle cx="' + f(400 + q * 30) + '" cy="' + f(150 + q * q * 120) + '" r="4" fill="' + WATER + '"/>'; }
    s += '<path d="M410 230 V300 H500 V230" fill="none" stroke="#1c1c1c" stroke-width="4"/><rect x="412" y="' + f(298 - 60 * spill) + '" width="86" height="' + f(60 * spill) + '" fill="' + WATER + '" opacity=".75"/>';
    return s + tag("المية اللي اتزاحت", 455, 312, u, 2.0, 2, 16) + tag("الزقة = وزنها", 300, 30, u, 2.6, -3, 19);
  });
  // 6 — lighter than the water it moves aside floats; heavier sinks: a nail vs a ship
  shot(6, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sea(t, 140, 0) + '<path d="M320 -300 V700" stroke="#1c1c1c" stroke-width="4"/>';
    var ny = lerp(150, 320, clamp((u - 0.5) / 2)); s += '<g transform="translate(160 ' + f(ny) + ') rotate(' + f(70 + u * 20) + ')"><rect x="-4" y="-36" width="8" height="72" fill="#8a8f96" stroke="#1c1c1c" stroke-width="2"/><rect x="-12" y="-40" width="24" height="7" fill="#8a8f96" stroke="#1c1c1c" stroke-width="2"/></g>' + bubbles(t, 160, ny, 5, 1, 10, 140);
    s += '<g transform="translate(480 ' + f(132 + Math.sin(t * 1.6) * 3) + ') rotate(' + f(Math.sin(t * 1.3) * 2) + ')"><path d="M-110 0 H110 L90 30 H-90 Z" fill="#c23a26" stroke="#1c1c1c" stroke-width="3"/><rect x="-60" y="-34" width="90" height="34" fill="#f4f1e8" stroke="#1c1c1c" stroke-width="3"/><rect x="10" y="-60" width="18" height="26" fill="#2b2f34" stroke="#1c1c1c" stroke-width="2"/></g>';
    return s + tag("مسمار: بيغطس", 160, 60, u, 0.4, -3, 18, "#cfe3ef") + tag("سفينة: بتعوم", 480, 60, u, 1.4, 3, 18);
  });
  // 7 — two skins, and between them big ballast tanks
  shot(7, function (u, d) { return [lerp(260, 380, u / d), 190, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.3) + fish(t, 60, 40, 3) + sub(320, 200, t, { cut: 0, s: 1.15 });
    var hl = 0.5 + 0.5 * Math.sin(t * 4); s += '<rect x="' + f(320 - 176 * 1.15) + '" y="' + f(200 - 36 * 1.15) + '" width="' + f(66 * 1.15) + '" height="' + f(72 * 1.15) + '" fill="none" stroke="#f2c230" stroke-width="' + f(3 + 2 * hl) + '" rx="10"/><rect x="' + f(320 + 110 * 1.15) + '" y="' + f(200 - 36 * 1.15) + '" width="' + f(76 * 1.15) + '" height="' + f(72 * 1.15) + '" fill="none" stroke="#f2c230" stroke-width="' + f(3 + 2 * hl) + '" rx="10"/>';
    return s + tag("خزانات الاتزان", 320, 320, u, 1.2, -2, 20);
  });
  // 8 — at the surface the tanks are full of air: light, floating
  shot(8, function (u, d) { return [lerp(300, 340, u / d), 170, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    return sea(t, 180, 0, { gulls: true }) + sub(320, 184 + Math.sin(t * 1.6) * 3, t, { cut: 0, tilt: Math.sin(t * 1.2) }) + tag("مليانة هوا = خفيفة", 320, 70, u, 0.8, -3, 20);
  });
  // 9 — open the vents on top: air bubbles out
  shot(9, function (u, d) { return [lerp(320, 220, u / d), lerp(170, 150, u / d), lerp(1.1, 1.5, u / d)]; }, function (u, d, t) {
    var s = sea(t, 160, 0) + sub(320, 186, t, { cut: 0.15 * clamp(u / d), tilt: Math.sin(t * 1.2) * 0.6 });
    s += bubbles(t, 320 - 150, 140, 12, 1.4, 20, 40) + bubbles(t, 320 + 150, 140, 12, 1.4, 20, 40);
    [[-150], [150]].forEach(function (p) { s += '<g transform="translate(' + (320 + p[0]) + ' 140)"><rect x="-10" y="-6" width="20" height="8" fill="#2b2f34"/><rect x="-10" y="' + f(-14 - 6 * clamp(u * 2)) + '" width="20" height="6" fill="#c23a26" stroke="#1c1c1c"/></g>'; });
    return s + tag("الفتحات اللي فوق", 170, 50, u, 0.6, -3, 18);
  });
  // 10 — water comes in from below and fills the tanks
  shot(10, function (u, d) { return [lerp(200, 440, u / d), 210, 1.35]; }, function (u, d, t) {
    var lv = lerp(0.15, 0.95, clamp(u / d)), s = sea(t, 150, 0.1) + sub(320, 200, t, { cut: lv });
    for (var k = 0; k < 8; k++) { var q = ((t * 1.6 + k / 8) % 1); s += '<path d="M' + f(170 + (k % 2) * 300) + ' ' + f(280 - q * 40) + ' v-10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - q) + '"/>'; }
    return s + arrow(170, 300, 170, 250, WATER, 7, (u - 0.2) / 0.5) + arrow(470, 300, 470, 250, WATER, 7, (u - 0.4) / 0.5) + tag("المية بتدخل من تحت", 320, 312, u, 0.7, 2, 18, "#cfe3ef");
  });
  // 11 — heavier now: down she goes (the depth counter runs)
  shot(11, function (u, d) { return [320, lerp(170, 220, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = u / d, s = sea(t, lerp(80, -240, k), k * 0.5) + bubbles(t, 320, 150, 10, 1.3, 60, -100) + sub(320, lerp(180, 210, k), t, { cut: 0.95, tilt: 2 });
    return s + depthGauge(560, 40, lerp(0, 40, k)) + tag("تقلت… بتغطس!", 140, 300, u, 0.5, -3, 20, "#cfe3ef");
  });
  // 12 — the little wings on her sides tip the nose down
  shot(12, function (u, d) { return [lerp(220, 420, u / d), 180, 1.15]; }, function (u, d, t) {
    var pt = clamp((u - 0.5) / 0.8), s = sea(t, -400, 0.45) + '<g transform="translate(' + f((u * 120) % 300 - 150) + ' 0)">' + fish(t, 40, 0, 4, "#f2c230") + '</g>' + seabed(t, 340);
    s += sub(320 - u * 20, 170 + u * 12, t, { tilt: -10 * pt, planes: -22 * pt }) + bubbles(t, 520, 180, 8, 1.6, 20, 80);
    s += curl(284, 106, 40, -2.6, -1.4, "#f2c230", 4, pt);
    return s + tag("أجنحة صغيرة", 120, 60, u, 0.6, -3, 19);
  });
  // 13 — captain: and stop halfway?
  shot(13, function (u, d) { return [lerp(300, 340, u / d), 215, lerp(1.1, 1.35, u / d)]; }, function (u, d, t) {
    return control(t) + captain(320, 250, t, "curious", { look: Math.sin(t * 2) }) + tag("تقف في النص؟", 470, 112, u, 0.2, 3, 22);
  });
  // 14 — small tanks add or drop a little water at a time
  shot(14, function (u, d) { return [lerp(280, 360, u / d), 190, lerp(1.2, 1.45, u / d)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.45) + fish(t, 60, 40, 3) + sub(320, 200, t, { cut: 0.55 + 0.1 * Math.sin(u * 3) });
    var tk = 0.45 + 0.3 * Math.sin(u * 2.4); s += '<rect x="290" y="216" width="60" height="16" rx="4" fill="' + AIR + '" stroke="#1c1c1c" stroke-width="2"/><rect x="291" y="' + f(231 - 14 * tk) + '" width="58" height="' + f(14 * tk) + '" fill="' + WATER + '"/>';
    s += arrow(330, 262, 330, 238, WATER, 5, Math.sin(u * 2.4) > 0 ? 1 : 0) + arrow(310, 238, 310, 262, "#8fc2da", 5, Math.sin(u * 2.4) <= 0 ? 1 : 0);
    return s + tag("شوية بشوية", 320, 320, u, 0.8, -2, 20);
  });
  // 15 — exactly as heavy as the water she pushes aside: she just hangs there
  shot(15, function (u, d) { return [lerp(250, 390, u / d), 190, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var sy = 190 + Math.sin(t * 1.3) * 3, s = sea(t, -400, 0.5) + fish(t, 60, 55, 5, "#f2c230") + seabed(t, 350) + sub(320, sy, t, { cut: 0.6 });
    s += arrow(320, sy + 50, 320, sy + 120, "#2b2620", 9) + arrow(320, sy - 92, 320, sy - 162, "#4f8f5a", 9);
    var b = pop((u - 1.2) / 1.2); s += '<g transform="translate(470 ' + f(sy - 100) + ') scale(' + f(b) + ')"><circle r="22" fill="#4f8f5a" stroke="#1c1c1c" stroke-width="2"/><text y="9" text-anchor="middle" style="font:900 26px sans-serif;fill:#fff">=</text></g>';
    return s + tag("واقفة مكانها", 150, 70, u, 0.6, -3, 20);
  });
  // 16 — and the pressure down there?
  shot(16, function (u, d) { return [lerp(300, 340, u / d), 215, lerp(1.1, 1.3, u / d)]; }, function (u, d, t) {
    return control(t, true) + captain(320, 250, t, "worry", { look: -Math.sin(t * 2) }) + tag("والضغط؟!", 470, 112, u, 0.2, 3, 24, "#f2b0a0");
  });
  // 17 — every ten metres adds a whole sky of air pressure
  shot(17, function (u, d) { return [320, lerp(120, 260, ease(u / d)), lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var s = sea(t, 60, 0.2) + '<rect x="160" y="60" width="4" height="340" fill="#1c1c1c"/>';
    for (var m = 0; m <= 3; m++) { var y = 60 + m * 90, on = pop((u - 0.4 - m * 0.7) / 1.2); s += '<path d="M150 ' + y + ' H174" stroke="#1c1c1c" stroke-width="3"/><text x="140" y="' + (y + 6) + '" text-anchor="end" style="font:800 16px Noto Serif;fill:#fff;paint-order:stroke;stroke:#1c1c1c;stroke-width:4px;direction:ltr">' + (m * 10) + ' m</text>';
      if (m) for (var k = 0; k < m; k++) s += '<g transform="translate(' + (210 + k * 46) + ' ' + y + ') scale(' + f(on) + ')"><circle r="18" fill="#cfe3ef" stroke="#1c1c1c" stroke-width="2"/><path d="M-8 4 h16 M-8 -2 h16" stroke="#2f6f9f" stroke-width="3"/></g>'; }
    return s + tag("كل 10 متر = ضغط جو كامل!", 400, 30, u, 0.3, -2, 17);
  });
  // 18 — at 300 m the water squeezes 30 times harder: a soda can crumples
  shot(18, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.0, 1.35, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.8)), dep = lerp(0, 300, k), cr = clamp((dep - 60) / 200), s = sea(t, -400, Math.min(0.55, 0.3 + 0.5 * k));
    for (var bd = 0; bd < 12; bd++) { var by = ((bd * 60 - t * 90) % 720 + 720) % 720 - 300; s += '<rect x="-400" y="' + f(by) + '" width="1440" height="22" fill="#fff" opacity=".09"/>'; }   // water streaming up past the sinking can
    s += bubbles(t, 320, 200, 6, 0.8, 20, 20) + '<g transform="translate(320 ' + f(180 + Math.sin(t * 2) * 3) + ') rotate(' + f(Math.sin(t * 2.4) * 9) + ')"><path d="M-30 -60 Q' + f(-30 + cr * 18) + ' 0 -30 60 H30 Q' + f(30 - cr * 22) + ' 0 30 -60 Z" fill="#c23a26" stroke="#1c1c1c" stroke-width="3"/>' + (cr > 0.2 ? '<path d="M-24 -20 L-6 -6 L-20 10 M24 -10 L8 4 L22 20" stroke="#1c1c1c" stroke-width="2" fill="none"/>' : "") + '<ellipse cx="0" cy="-60" rx="30" ry="8" fill="#c9c4b8" stroke="#1c1c1c" stroke-width="2"/></g>';
    for (var a = 0; a < 8; a++) { var an = a * 0.785, r1 = 110 - 10 * Math.sin(t * 5 + a); s += arrow(320 + Math.cos(an) * r1, 180 + Math.sin(an) * r1, 320 + Math.cos(an) * 72, 180 + Math.sin(an) * 72, "#5d93ad", 4, 1); }
    return s + depthGauge(540, 50, dep) + tag("×30", 120, 80, u, d - 1.2, -4, 32, "#f2b0a0");
  });
  // 19 — the inner hull: thick steel, round like a pipe to spread the push
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.8) + '<g transform="rotate(' + f(t * 8) + ' 320 180)">';
    for (var a = 0; a < 16; a++) { var an = a * 0.3927, r1 = 150 - 8 * Math.sin(t * 5 + a); s += arrow(320 + Math.cos(an) * r1, 180 + Math.sin(an) * r1, 320 + Math.cos(an) * 104, 180 + Math.sin(an) * 104, "#8fc2da", 4, 1); }
    s += '</g><circle cx="320" cy="180" r="96" fill="#5a6470" stroke="#1c1c1c" stroke-width="3"/><circle cx="320" cy="180" r="74" fill="#26405e" stroke="#1c1c1c" stroke-width="3"/><circle cx="320" cy="180" r="74" fill="none" stroke="#ffe9a0" stroke-width="2" opacity=".5"/>';
    s += head(320, 180, 26, "happy", t, 0);
    return s + tag("حديد تخين ومدوّر", 320, 330, u, 0.8, -2, 20);
  });
  // 20 — captain: and up again? (pulls the red lever)
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 215, lerp(1.15, 1.4, u / d)]; }, function (u, d, t) {
    return control(t) + captain(300, 250, t, "curious", { lever: ease(clamp((u - 0.3) / 0.6)) }) + tag("وتطلع إزاي؟", 470, 112, u, 0.1, 3, 22);
  });
  // 21 — bottles of very compressed air inside
  shot(21, function (u, d) { return [lerp(220, 420, u / d), 190, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a4654"/>';
    s += '<path d="M40 30 H600" stroke="#5a6676" stroke-width="14"/><path d="M40 30 H600" stroke="#bfe6f7" stroke-width="5" stroke-dasharray="14 12" stroke-dashoffset="' + f(-t * 90) + '"/>';
    for (var b = 0; b < 5; b++) { var x = 120 + b * 100; s += '<rect x="' + (x - 30) + '" y="80" width="60" height="220" rx="28" fill="url(#gTank)" stroke="#1c1c1c" stroke-width="3"/><rect x="' + (x - 10) + '" y="60" width="20" height="22" fill="#5a6470" stroke="#1c1c1c" stroke-width="2"/>' + gauge(x, 46, 16, 0.85 + 0.05 * Math.sin(t * 6 + b), ""); }
    return s + tag("هوا مضغوط جامد", 320, 330, u, 0.6, -2, 20);
  });
  // 22 — blow that air into the tanks: it shoves the water out the bottom
  shot(22, function (u, d) { return [lerp(220, 420, u / d), 210, 1.35]; }, function (u, d, t) {
    var lv = lerp(0.95, 0.05, clamp((u - 0.3) / (d - 0.6))), s = sea(t, -400, 0.5) + sub(320, 200, t, { cut: lv });
    for (var k = 0; k < 10; k++) { var q = ((t * 2 + k / 10) % 1), x = 170 + (k % 2) * 300; s += '<path d="M' + f(x) + ' ' + f(246 + q * 60) + ' v14" stroke="' + WATER + '" stroke-width="5" stroke-linecap="round" opacity="' + f(1 - q) + '"/>'; }
    s += arrow(320, 150, 200, 150, "#bfe6f7", 7, (u - 0.1) / 0.5) + arrow(320, 150, 440, 150, "#bfe6f7", 7, (u - 0.1) / 0.5);
    return s + tag("الهوا بيطرد المية!", 320, 312, u, 0.8, 2, 19);
  });
  // 23 — lighter: the water pushes her up, she breaks the surface with a splash
  shot(23, function (u, d) { var k = u / d; return [320, lerp(240, 170, k), lerp(1.05, 0.95, k)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.6)), wl = lerp(-200, 170, k), sy = lerp(330, 196, ease(k)), s = sea(t, wl, 0.4 * (1 - k), { gulls: k > 0.8 });
    s += bubbles(t, 320, sy + 30, 12, 1.6, 70, wl) + sub(320, sy + Math.sin(t * 2) * 2, t, { tilt: -8 * (1 - k), hatch: k > 0.95, mood: "happy" });
    if (k > 0.85) for (var j = 0; j < 14; j++) { var a = -Math.PI + j * Math.PI / 13, r = 30 + 90 * clamp((u - (d - 0.6) * 0.85) * 1.5); s += '<circle cx="' + f(320 + Math.cos(a) * r * 1.6) + '" cy="' + f(160 + Math.sin(a) * r * 0.8) + '" r="5" fill="#fff" opacity=".9"/>'; }
    return s + depthGauge(560, 40, lerp(120, 0, k)) + tag("وتطلع!", 140, 70, u, d - 1.2, -3, 26);
  });
  // 24 — water in, she sinks; air in, she rises
  shot(24, function (u, d) { return [lerp(260, 380, u / d), 180, 1.05]; }, function (u, d, t) {
    var s = sea(t, -400, 0.25), half = (d - 1) / 2;
    var a = pop((u - 0.3) / 1.2), b = pop((u - half) / 1.2);
    s += '<g transform="translate(170 ' + f(170 + Math.sin(t * 1.4) * 30 * a) + ') scale(' + f(a * 0.55) + ')">' + sub(0, 0, t, { cut: 0.9 }) + '</g>' + arrow(170, 250, 170, 320, "#2b2620", 8, a);
    s += '<g transform="translate(470 ' + f(170 - Math.sin(t * 1.4) * 30 * b) + ') scale(' + f(b * 0.55) + ')">' + sub(0, 0, t, { cut: 0.1 }) + '</g>' + arrow(470, 110, 470, 40, "#4f8f5a", 8, b);
    return s + tag("مية تدخل… تنزل", 170, 312, u, 0.5, -2, 17, "#cfe3ef") + tag("هوا يدخل… تطلع", 470, 312, u, half + 0.2, 2, 17);
  });
  // 25 — outro: the captain waves from the hatch at sunset
  shot(25, function (u, d) { return [lerp(290, 350, u / d), 170, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var s = sea(t, 190, 0, { sky: "dusk", gulls: true }) + sun(520, 120, 26, "#fff1d0") + sub(320, 200 + Math.sin(t * 1.6) * 3, t, { hatch: true, mood: "happy" });
    var wv = Math.sin(t * 8) * 8; s += '<path d="M308 104 L' + f(286 + wv) + ' 80" stroke="#1c1c1c" stroke-width="3" stroke-linecap="round"/><circle cx="' + f(284 + wv) + '" cy="77" r="4" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="1.4"/>';
    return s + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.3, -2, 19);
  });

  // graph paper that keeps drifting, so even a plain backdrop is never frozen
  function paper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }

  window.__panel = function (svg, t) {
    SUBN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
