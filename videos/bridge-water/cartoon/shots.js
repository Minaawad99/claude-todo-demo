  // ── new pieces for this episode: a river in cross-section and the machines that build a bridge in it ──
  // Layout of a cross-section (world units): water surface at WL, river bed at BED, the hard layer from ROCK down.
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff", WL = 170, BED = 262, ROCK = 318;
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function worker(x, y, t, mood, o) {   // a ball-head worker in a hard hat and hi-vis vest
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1.5) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#f08a24") + '" stroke="' + INK + '" stroke-width="3"/><path d="M-30 40 L-18 140 M30 40 L18 140" stroke="#e9ecef" stroke-width="7"/>' + head(0, -20, 38, mood, t, o.look || 0);
    if (!o.noHat) s += '<path d="M-40 -34 C-40 -76 40 -76 40 -34 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/><path d="M-50 -34 H50" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    return s + '</g>'; }
  // a river cut in half: sky, flowing water with a wavy surface, soft mud, then the hard layer. o: {sky, wl, bed, rock, x0, x1, murk}
  function river(t, o) {
    o = o || {}; var wl = o.wl || WL, bed = o.bed || BED, rk = o.rock || ROCK, s = sky(o.sky || "day") + clouds(t, 22, wl - 140, 6, 0.75);
    var surf = "M-400 " + wl; for (var x = -400; x <= 1040; x += 20) surf += " L" + x + " " + f(wl + 3 * Math.sin(x * 0.04 - t * 2.4) + 2 * Math.sin(x * 0.11 + t * 1.3));
    s += '<path d="' + surf + ' L1040 ' + (bed + 10) + ' L-400 ' + (bed + 10) + ' Z" fill="url(#gRiver)"/>';
    for (var c = 0; c < 9; c++) s += '<path d="M-400 ' + f(wl + 18 + c * 9) + ' h1440" stroke="#fff" stroke-width="1" opacity=".05"/>';
    for (var i = 0; i < 22; i++) { var u = (t * (0.12 + hash(i) * 0.08) + hash(i + 3)) % 1, px = lerp(-300, 940, u), py = lerp(wl + 12, bed - 8, hash(i + 7)); s += '<path d="M' + f(px) + ' ' + f(py) + ' h' + f(18 + hash(i) * 20) + '" stroke="#cfeaf4" stroke-width="2" stroke-linecap="round" opacity="' + f(0.55 * Math.sin(Math.PI * u)) + '"/>'; }
    for (var fi = 0; fi < 4; fi++) { var fu = (t * (0.05 + hash(fi + 20) * 0.04) + hash(fi + 30)) % 1, fx = lerp(-200, 840, fu), fy = lerp(wl + 24, bed - 16, hash(fi + 40)) + Math.sin(t * 2 + fi) * 5, wg = Math.sin(t * 10 + fi) * 4;
      s += '<g transform="translate(' + f(fx) + ' ' + f(fy) + ')" opacity=".75"><path d="M10 0 C4 -6 -8 -6 -12 0 C-8 6 4 6 10 0 Z M-12 0 L-20 ' + f(-5 + wg) + ' L-20 ' + f(5 + wg) + ' Z" fill="#9fb8a8" stroke="#2b3f3a" stroke-width="1.2"/></g>'; }
    var bp = "M-400 " + bed; for (var xb = -400; xb <= 1040; xb += 40) bp += " L" + xb + " " + f(bed + 5 * Math.sin(xb * 0.03));
    s += '<path d="' + bp + ' L1040 ' + rk + ' L-400 ' + rk + ' Z" fill="url(#gMud)"/>';
    for (var m = 0; m < 40; m++) s += '<circle cx="' + f(-380 + hash(m) * 1400) + '" cy="' + f(bed + 10 + hash(m + 5) * (rk - bed - 14)) + '" r="' + f(1.5 + hash(m + 2) * 2.5) + '" fill="#4f4029" opacity=".5"/>';
    s += '<path d="M-400 ' + rk + ' L1040 ' + rk + ' L1040 700 L-400 700 Z" fill="url(#gRock)"/>';
    for (var r = 0; r < 26; r++) { var rx = -380 + hash(r + 50) * 1400, ry = rk + 12 + hash(r + 60) * 50; s += '<path d="M' + f(rx) + ' ' + f(ry) + ' l14 -6 l12 8 l-6 10 l-16 -2 Z" fill="#5f5c56" stroke="#3a3834" stroke-width="1"/>'; }
    return s + '<path d="M-400 ' + rk + ' H1040" stroke="#3a3834" stroke-width="3" stroke-dasharray="14 8"/>';
  }
  function surfaceFront(t, wl) {   // a translucent band of water drawn over things standing in the river
    wl = wl || WL; var p = "M-400 " + wl; for (var x = -400; x <= 1040; x += 20) p += " L" + x + " " + f(wl + 3 * Math.sin(x * 0.04 - t * 2.4) + 2 * Math.sin(x * 0.11 + t * 1.3));
    return '<path d="' + p + ' L1040 ' + (wl + 14) + ' L-400 ' + (wl + 14) + ' Z" fill="#4f8fa8" opacity=".35"/><path d="' + p + '" stroke="#e9f6fb" stroke-width="2" fill="none" opacity=".8"/>';
  }
  function pile(x, top, bot, w, o) {   // a steel tube pile, open-ended
    o = o || {}; w = w || 22; return '<rect x="' + f(x - w / 2) + '" y="' + f(top) + '" width="' + w + '" height="' + f(bot - top) + '" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/>' + (o.ring !== false ? '<ellipse cx="' + f(x) + '" cy="' + f(top) + '" rx="' + f(w / 2) + '" ry="4" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.5"/>' : '');
  }
  function hammer(x, y, t, hit) {   // hydraulic impact hammer riding on the pile top: yellow body, black ram housing, hoses
    var k = hit || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y - 6 * k) + ')">';
    s += '<rect x="-17" y="-96" width="34" height="86" rx="4" fill="url(#gHammer)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-21" y="-14" width="42" height="14" rx="2" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/><rect x="-12" y="-110" width="24" height="16" rx="3" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M14 -80 C40 -90 40 -130 30 -150" stroke="#1c1c1c" stroke-width="3" fill="none"/><text x="0" y="-52" text-anchor="middle" style="font:800 9px Noto Serif;fill:' + INK + ';direction:ltr;opacity:.6">IHC</text>';
    return s + '</g>';
  }
  function barge(x, y, w, t) { var b = Math.sin(t * 1.6 + x) * 2.5; return '<g transform="translate(' + f(x) + ' ' + f(y + b) + ')"><path d="M' + f(-w / 2) + ' -16 H' + f(w / 2) + ' L' + f(w / 2 - 12) + ' 14 H' + f(-w / 2 + 12) + ' Z" fill="url(#gBarge)" stroke="' + INK + '" stroke-width="2.6"/><path d="M' + f(-w / 2) + ' -16 H' + f(w / 2) + '" stroke="' + YEL + '" stroke-width="3"/></g>'; }
  // crawler crane on a barge: cab, lattice boom from (x,y) at angle ang (deg from horizontal), hook line down to hookY
  function crane(x, y, len, ang, hookY, t) {
    var a = ang * Math.PI / 180, tx = x + Math.cos(a) * len, ty = y - Math.sin(a) * len, s = '<g>';
    s += '<rect x="' + f(x - 34) + '" y="' + f(y - 30) + '" width="54" height="30" rx="3" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="' + f(x + 2) + '" y="' + f(y - 26) + '" width="14" height="12" fill="#9fd2e8" stroke="' + INK + '" stroke-width="1.6"/>';
    var nx = -Math.sin(a) * 5, ny = -Math.cos(a) * 5, d = "M" + f(x + nx) + " " + f(y + ny) + " L" + f(tx + nx) + " " + f(ty + ny) + " M" + f(x - nx) + " " + f(y - ny) + " L" + f(tx - nx) + " " + f(ty - ny);
    for (var k = 0; k < 14; k++) { var u0 = k / 14, u1 = (k + 1) / 14; d += " M" + f(x + (tx - x) * u0 + nx) + " " + f(y + (ty - y) * u0 + ny) + " L" + f(x + (tx - x) * u1 - nx) + " " + f(y + (ty - y) * u1 - ny); }
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="2.2" fill="none"/><path d="' + d + '" stroke="' + YEL + '" stroke-width="1" fill="none"/>';
    s += '<path d="M' + f(x - 20) + ' ' + f(y - 30) + ' L' + f(tx) + ' ' + f(ty) + '" stroke="#555" stroke-width="1.2"/><path d="M' + f(tx) + ' ' + f(ty) + ' V' + f(hookY) + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + f(tx - 4) + ' ' + f(hookY) + ' q4 8 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    return s + '</g>';
  }
  function sheetWall(x, top, bot, o) {   // a line of interlocking steel sheet piles seen in section (corrugated face)
    o = o || {}; var w = o.w || 14, s = '<rect x="' + f(x - w / 2) + '" y="' + f(top) + '" width="' + w + '" height="' + f(bot - top) + '" fill="url(#gRust)" stroke="' + INK + '" stroke-width="2"/>';
    for (var y = top + 8; y < bot; y += 16) s += '<path d="M' + f(x - w / 2) + ' ' + f(y) + ' h' + w + '" stroke="#4a2a16" stroke-width="1" opacity=".6"/>';
    return s;
  }
  function pierBody(x, top, bot, w, o) {   // a concrete pier with a cap and the bearing on top
    o = o || {}; var s = '<path d="M' + f(x - w / 2) + ' ' + f(bot) + ' L' + f(x - w / 2 + 6) + ' ' + f(top) + ' L' + f(x + w / 2 - 6) + ' ' + f(top) + ' L' + f(x + w / 2) + ' ' + f(bot) + ' Z" fill="url(#gConcrete)" stroke="' + INK + '" stroke-width="2.6"/>';
    if (o.cap !== false) s += '<rect x="' + f(x - w / 2 - 14) + '" y="' + f(top - 16) + '" width="' + f(w + 28) + '" height="18" rx="2" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var k = top + 20; k < bot; k += 26) s += '<path d="M' + f(x - w / 2 + 6) + ' ' + f(k) + ' h' + f(w - 12) + '" stroke="#8a867d" stroke-width="1" opacity=".6"/>';
    if (o.wet) s += '<rect x="' + f(x - w / 2 + 2) + '" y="' + f(o.wet) + '" width="' + f(w - 4) + '" height="' + f(bot - o.wet) + '" fill="#4a6a5a" opacity=".22"/>';
    return s;
  }
  function deck(x0, x1, y, t, o) {   // a box-girder deck with railings and cars
    o = o || {}; var s = '<path d="M' + f(x0) + ' ' + f(y) + ' H' + f(x1) + ' V' + f(y + 14) + ' L' + f(x1 - 14) + ' ' + f(y + 26) + ' H' + f(x0 + 14) + ' L' + f(x0) + ' ' + f(y + 14) + ' Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(x0) + ' ' + f(y - 6) + ' H' + f(x1) + '" stroke="#5a6068" stroke-width="2"/>';
    for (var p = x0 + 6; p < x1; p += 16) s += '<path d="M' + f(p) + ' ' + f(y - 6) + ' v6" stroke="#5a6068" stroke-width="1.4"/>';
    if (o.cars) for (var i = 0; i < 6; i++) { var cx = x0 + (((t * (i % 2 ? 70 : -60) + i * 140) % (x1 - x0)) + (x1 - x0)) % (x1 - x0); s += '<g transform="translate(' + f(cx) + ' ' + f(y - 1) + ')"><rect x="-12" y="-9" width="24" height="9" rx="3" fill="' + ["#2f6f9f", "#e2b035", "#8f2618", "#f4f1e8", "#4f8f5a", "#3a3f46"][i] + '" stroke="' + INK + '" stroke-width="1.2"/><rect x="-7" y="-13" width="13" height="5" rx="2" fill="#cfe1ec" stroke="' + INK + '"/></g>'; }
    return s;
  }
  function riprap(x, w, y, n, seed, drop) {   // big rough stones piled around a pier foot; drop 0..1 lets them fall in
    var s = ""; for (var i = 0; i < n; i++) { var hx = x + (hash(i + seed) - 0.5) * w, hy = y - hash(i * 3 + seed) * 14, r = 7 + hash(i + 9 + seed) * 7, dy = drop == null ? 0 : (1 - clamp(drop * 1.6 - hash(i + seed) * 0.6)) * -160;
      s += '<path d="M' + f(hx - r) + ' ' + f(hy + dy) + ' l' + f(r * 0.6) + ' ' + f(-r * 0.9) + ' l' + f(r * 1.1) + ' ' + f(r * 0.2) + ' l' + f(r * 0.4) + ' ' + f(r * 0.8) + ' Z" fill="#8a857a" stroke="' + INK + '" stroke-width="1.6"/>'; }
    return s;
  }
  function bubbles(x, y, t, n, spread, h) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 0.6 + hash(i) ) % 1; s += '<circle cx="' + f(x + (hash(i + 4) - 0.5) * spread + Math.sin(t * 3 + i) * 3) + '" cy="' + f(y - u * h) + '" r="' + f(2 + hash(i + 8) * 3) + '" fill="none" stroke="#e9f6fb" stroke-width="1.4" opacity="' + f(1 - u) + '"/>'; } return s; }
  function cairo(t, y) {   // a soft Cairo skyline at sunset: towers, a minaret, the Cairo Tower lattice
    var s = city(t, y, 70, "#b98a6a", "#ffe7a8", 7, false);
    s += '<path d="M470 ' + y + ' L476 ' + (y - 120) + ' L484 ' + (y - 120) + ' L490 ' + y + ' Z" fill="#a8785a"/><ellipse cx="480" cy="' + (y - 124) + '" rx="12" ry="6" fill="#a8785a"/><path d="M480 ' + (y - 130) + ' v-14" stroke="#a8785a" stroke-width="2"/>';
    s += '<path d="M120 ' + y + ' V' + (y - 90) + ' M116 ' + (y - 90) + ' h8 l-4 -14 Z" stroke="#a8785a" stroke-width="5" fill="#a8785a"/>';
    return s;
  }
  function felucca(x, y, t) { var b = Math.sin(t * 1.4 + x) * 2; return '<g transform="translate(' + f(x) + ' ' + f(y + b) + ')"><path d="M-30 0 Q0 14 30 0 Z" fill="#7a5230" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 V-46 M-24 -6 L10 -60 L4 -4 Z" stroke="' + INK + '" stroke-width="1.6" fill="#fbf6e6"/></g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function nileBridge(t, o) {   // the opening view: a concrete bridge over the Nile at golden hour, cars on top, water running under
    o = o || {}; var s = sky("dusk") + '<rect x="-400" y="-300" width="1440" height="460" fill="url(#gSunset)" opacity=".55"/>' + sun(520, 40, 26, "#ffd27a") + clouds(t, 18, -10, 6, 0.6) + cairo(t, 150);
    var surf = "M-400 160"; for (var x = -400; x <= 1040; x += 20) surf += " L" + x + " " + f(160 + 2.5 * Math.sin(x * 0.05 - t * 2));
    s += '<path d="' + surf + ' L1040 700 L-400 700 Z" fill="url(#gNile)"/>';
    for (var i = 0; i < 26; i++) { var u = (t * 0.1 + hash(i)) % 1; s += '<path d="M' + f(lerp(-300, 940, u)) + ' ' + f(170 + hash(i + 2) * 180) + ' h' + f(20 + hash(i) * 30) + '" stroke="#ffe7c0" stroke-width="2" opacity="' + f(0.45 * Math.sin(Math.PI * u)) + '"/>'; }
    s += felucca(lerp(-80, 700, (t * 0.03) % 1), 176, t);
    [60, 260, 460, 660].forEach(function (px) { s += pierBody(px, 100, 200, 34, { wet: 160 }) + '<ellipse cx="' + px + '" cy="' + f(162 + Math.sin(t * 3 + px) * 1.5) + '" rx="26" ry="4" fill="#fff" opacity=".35"/>'; });
    s += deck(-200, 840, 80, t, { cars: true });
    return s;
  }

  // 0 — crossing a bridge over the Nile: cars above, the river running below (camera tilts down to the water)
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 340, k), lerp(110, 180, k), lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    return nileBridge(t) + tag("كوبري فوق النيل", 230, 30, u, 0.6, -3, 17);
  });
  // 1 — how were these piers built in the water? (dive under the surface: the pier goes on down into the mud)
  shot(1, function (u, d) { return [320, lerp(190, 230, u / d), lerp(1.15, 1.3, u / d)]; }, function (u, d, t) {
    var s = river(t, { sky: "dusk" }) + pierBody(320, 40, ROCK + 40, 46, { wet: WL }) + surfaceFront(t) + bubbles(320, BED, t, 8, 60, 80);
    return s + qmark(400, 210, t, 44) + qmark(240, 240, t + 1, 34) + tag("اتبنت إزاي؟", 430, 290, u, 0.4, 3, 17);
  });
  // 2 — and how does concrete set with water all around it?
  shot(2, function (u, d) { return [320, 200, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = river(t, { sky: "day" }) + '<rect x="250" y="190" width="140" height="72" fill="url(#gFreshC)" stroke="' + INK + '" stroke-width="3"/>';
    for (var g = 0; g < 30; g++) s += '<circle cx="' + f(256 + hash(g) * 128) + '" cy="' + f(196 + hash(g + 3) * 60) + '" r="' + f(1.5 + hash(g + 1) * 2.5) + '" fill="#6a675f"/>';
    s += bubbles(320, 190, t, 14, 130, 60) + surfaceFront(t);
    return s + qmark(430, 150, t, 50, CY) + tag("بتشد إزاي؟", 200, 120, u, 0.6, -3, 18);
  });
  // 3 — the brand beat
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(320 170) scale(.6) translate(-320 -150)">' + pierBody(320, 120, 260, 46) + deck(120, 520, 96, t, { cars: true }) + '</g>';
    return s + worker(470, 140, t, "happy", { s: 0.55 }) + tag("إيه الحكاية؟", 320, 290, u, 0.1, -3, 26);
  });
  // 4 — first they look for hard ground under the mud: a drill rig on a barge takes samples, tens of metres down
  shot(4, function (u, d) { var k = ease(clamp(u / d)); return [330, lerp(180, 250, k), lerp(1.05, 0.9, k)]; }, function (u, d, t) {
    var dep = clamp((u - 0.4) / (d - 1.0)), tip = lerp(WL - 10, ROCK + 22, dep), s = river(t) + barge(320, WL - 2, 150, t);
    s += '<path d="M300 ' + (WL - 18) + ' L320 ' + (WL - 110) + ' L340 ' + (WL - 18) + '" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M320 ' + (WL - 110) + ' V' + f(tip) + '" stroke="#3a3f46" stroke-width="5"/><path d="M314 ' + f(tip - 10) + ' l6 14 l6 -14" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.4"/>';
    if (tip > BED) for (var k = 0; k < 6; k++) s += '<circle cx="' + f(320 + Math.sin(t * 9 + k) * 12) + '" cy="' + f(tip - 4 - k * 5) + '" r="2.4" fill="#4f4029"/>';
    var m = Math.round(lerp(0, 40, dep)); s += '<g transform="translate(520 ' + f(tip) + ')"><rect x="-44" y="-16" width="88" height="30" rx="8" fill="' + INK + '" stroke="' + YEL + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#7cf29a">' + m + ' متر</text></g>' + surfaceFront(t);
    s += '<text x="170" y="' + (BED + 30) + '" style="font:800 14px Noto Sans Arabic;fill:#fbf6e6">طين طري</text><text x="170" y="' + (ROCK + 40) + '" style="font:800 14px Noto Sans Arabic;fill:#fbf6e6">أرض صلبة</text>';
    return s + tag("أرض صلبة", 450, ROCK + 30, u, 2.4, -3, 18);
  });
  // 5 — then they drive piles, giant steel tubes, with a hammer that hits them until they reach the hard layer
  shot(5, function (u, d) { return [lerp(300, 330, u / d), lerp(170, 220, u / d), 1.0]; }, function (u, d, t) {
    var beat = 0.42, ph = (t % beat) / beat, hit = ph < 0.12 ? 1 - ph / 0.12 : 0, dn = Math.min(1, (Math.floor(u / beat) + ph * 0.3) / Math.max(1, (d - 0.6) / beat)), top = lerp(WL - 120, WL - 40, dn), bot = lerp(BED + 6, ROCK + 26, dn);
    var s = river(t) + barge(220, WL - 2, 170, t) + crane(190, WL - 20, 230, 64, top - 150, t) + pile(320, top, bot, 26) + hammer(320, top, t, hit);
    if (hit > 0.3) s += '<circle cx="320" cy="' + f(top) + '" r="' + f(30 * hit + 10) + '" fill="none" stroke="#fff" stroke-width="3" opacity="' + f(hit) + '"/>' + '<path d="M300 ' + f(bot) + ' l-14 6 M340 ' + f(bot) + ' l14 6" stroke="#fbf6e6" stroke-width="2"/>';
    [380, 420].forEach(function (px, k) { s += pile(px, WL - 50 - k * 6, ROCK + 26, 26); });
    s += surfaceFront(t);
    return s + tag("خوازيق", 470, 60, u, 0.4, 3, 20) + tag("لحد الأرض الصلبة", 200, ROCK + 60, u, 2.2, -3, 16);
  });
  // 6 — or they drill inside the tube, lower a steel cage and fill it with concrete (a bored pile, step by step)
  shot(6, function (u, d) { return [320, lerp(210, 240, u / d), lerp(1.15, 1.25, u / d)]; }, function (u, d, t) {
    var q = d / 3, st = Math.min(2, Math.floor(u / q)), k = clamp((u - st * q) / q), s = river(t) + pile(320, WL - 40, ROCK + 30, 44, { ring: true });
    s += '<rect x="300" y="' + (WL - 36) + '" width="40" height="' + (ROCK + 26 - WL + 36) + '" fill="#2b2e33" opacity=".85"/>';
    if (st === 0) { var ay = lerp(WL - 20, ROCK + 20, k); s += '<path d="M320 ' + (WL - 120) + ' V' + f(ay) + '" stroke="#3a3f46" stroke-width="5"/>'; for (var a = 0; a < 6; a++) s += '<path d="M304 ' + f(ay - a * 10 - (t * 40 % 10)) + ' L336 ' + f(ay - a * 10 - 5 - (t * 40 % 10)) + '" stroke="#9aa2ac" stroke-width="3"/>'; s += '<path d="M330 ' + (WL - 120) + ' q30 -10 50 10" stroke="#5f4e34" stroke-width="8" fill="none" opacity=".8"/>'; }
    if (st >= 1) { var cy = st === 1 ? lerp(WL - 160, WL - 30, ease(k)) : WL - 30; s += '<g>'; for (var v = 0; v < 4; v++) s += '<path d="M' + (304 + v * 10) + ' ' + f(cy) + ' V' + f(cy + ROCK - WL + 50) + '" stroke="' + RED + '" stroke-width="2"/>'; for (var h = 0; h < 12; h++) s += '<path d="M303 ' + f(cy + h * 16) + ' H337" stroke="' + RED + '" stroke-width="1.4"/>'; s += '</g>'; }
    if (st === 2) { var lv = lerp(ROCK + 26, WL - 34, ease(k)); s += '<rect x="301" y="' + f(lv) + '" width="38" height="' + f(ROCK + 26 - lv) + '" fill="url(#gFreshC)" opacity=".95"/><path d="M320 ' + (WL - 140) + ' V' + f(lv) + '" stroke="#6a675f" stroke-width="6"/>'; }
    s += surfaceFront(t);
    var L3 = ["يحفروا", "قفص حديد", "خرسانة"]; for (var i = 0; i <= st; i++) s += tag(L3[i], 470, 80 + i * 60, u, i * q + 0.1, i % 2 ? -3 : 3, 17);
    return s;
  });
  // 7 — and the water? a temporary wall around the pier site, of interlocking steel sheets (section + interlock detail)
  shot(7, function (u, d) { return [320, 200, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = river(t), k1 = ease(clamp(u / 1.2)), k2 = ease(clamp((u - 0.6) / 1.2));
    s += sheetWall(220, lerp(WL - 160, WL - 30, k1), lerp(BED - 100, ROCK + 10, k1)) + sheetWall(420, lerp(WL - 160, WL - 30, k2), lerp(BED - 100, ROCK + 10, k2)) + surfaceFront(t);
    var p = pop((u - 1.6) / 0.8); if (p > 0) { s += '<g transform="translate(480 100) scale(' + f(p) + ')"><rect x="-80" y="-44" width="160" height="88" rx="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>'; var zz = "M-66 0"; for (var z = 0; z < 4; z++) zz += " l12 -16 h10 l12 32 h10"; s += '<path d="' + zz + '" stroke="#a8683e" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="' + f(-20 + 2 * Math.sin(t * 4)) + '" cy="16" r="6" fill="none" stroke="' + RED + '" stroke-width="2.4"/></g>'; }
    return s + tag("ألواح حديد متعشّقة", 300, 60, u, 0.5, -3, 17);
  });
  // 8 — they pump the water out from inside: a dry patch in the middle of the river
  shot(8, function (u, d) { return [320, lerp(200, 220, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var dr = ease(clamp((u - 0.3) / (d - 1.2))), inside = lerp(WL, BED - 4, dr), s = river(t);
    s += '<rect x="227" y="' + f(WL - 4) + '" width="186" height="' + f(BED - WL + 10) + '" fill="#e7d8b8"/><rect x="227" y="' + f(inside) + '" width="186" height="' + f(BED + 6 - inside) + '" fill="url(#gRiver)"/>';
    var surf = "M227 " + f(inside); for (var x = 227; x <= 413; x += 12) surf += " L" + x + " " + f(inside + 2 * Math.sin(x * 0.1 + t * 3)); s += '<path d="' + surf + '" stroke="#e9f6fb" stroke-width="2" fill="none"/>';
    s += sheetWall(220, WL - 30, ROCK + 10) + sheetWall(420, WL - 30, ROCK + 10) + '<path d="M227 ' + (WL + 30) + ' H413 M227 ' + (WL + 60) + ' H413" stroke="#3a3f46" stroke-width="5" opacity=".9"/>';
    s += '<rect x="300" y="' + (WL - 60) + '" width="40" height="26" rx="4" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/><path d="M320 ' + (WL - 34) + ' V' + f(inside + 4) + '" stroke="' + INK + '" stroke-width="5"/><path d="M340 ' + (WL - 50) + ' C400 ' + (WL - 80) + ' 460 ' + (WL - 70) + ' 480 ' + (WL - 40) + '" stroke="' + INK + '" stroke-width="6" fill="none"/>';
    for (var j = 0; j < 10; j++) { var ju = (t * 2 + j / 10) % 1; s += '<circle cx="' + f(480 + ju * 40) + '" cy="' + f(WL - 40 + ju * ju * 50) + '" r="3" fill="#cfeaf4" opacity="' + f(1 - ju) + '"/>'; }
    if (dr > 0.85) s += worker(300, BED - 92, t, "happy", { s: 0.45 }) + worker(360, BED - 92, t + 1, "n", { s: 0.45, col: "#2f6f9f", look: -1 });
    s += surfaceFront(t);
    return s + tag("حتة ناشفة!", 320, 40, u, d - 1.6, -3, 19);
  });
  // 9 — it's called a cofferdam; when the pier is done they pull it out again
  shot(9, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var out = ease(clamp((u - 1.6) / 1.4)), fl = clamp((u - 2.6) / 1.0), s = river(t) + pierBody(320, WL - 60, ROCK + 10, 56, { wet: WL });
    if (fl < 1) s += '<rect x="227" y="' + f(lerp(BED - 4, WL, fl)) + '" width="186" height="' + f(BED + 6 - lerp(BED - 4, WL, fl)) + '" fill="url(#gRiver)" opacity=".9"/>';
    s += sheetWall(220, WL - 30 - out * 200, ROCK + 10 - out * 200) + sheetWall(420, WL - 30 - out * 200, ROCK + 10 - out * 200) + pierBody(320, WL - 60, BED, 56, { wet: WL, cap: true });
    s += surfaceFront(t) + bubbles(320, BED, t, 6, 120, 70);
    return s + tag("كوفر دام", 320, 60, u, 0.3, -3, 24) + (out > 0.3 ? arrow(470, 120, 470, 40, YEL, 6, 1) : "");
  });
  // 10 — if the water is very deep, they pour the concrete under water through a long pipe (a tremie from a barge)
  shot(10, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(150, 230, k), lerp(1.0, 0.85, k)]; }, function (u, d, t) {
    var s = river(t, { wl: 120, bed: 330, rock: 380 }) + barge(320, 118, 160, t) + '<path d="M300 92 L340 92 L330 112 L310 112 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><rect x="314" y="112" width="12" height="208" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M340 70 C320 60 300 70 312 94" stroke="#6a675f" stroke-width="10" fill="none"/><rect x="340" y="50" width="70" height="40" rx="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(375 + 10 * Math.cos(t * 3)) + '" cy="70" rx="22" ry="14" fill="none" stroke="' + INK + '" stroke-width="2" transform="rotate(' + f(t * 60) + ' 375 70)"/>';
    for (var cp = 0; cp < 10; cp++) { var cu = (t * 1.4 + cp / 10) % 1; s += '<circle cx="320" cy="' + f(lerp(116, 316, cu)) + '" r="3.4" fill="#6a675f"/>'; }
    var lv = lerp(330, 290, clamp(u / d)); s += bubbles(260, lv, t, 6, 60, 120) + bubbles(380, lv, t + 0.4, 6, 60, 120) + '<path d="M200 330 L200 ' + f(lv) + ' L440 ' + f(lv) + ' L440 330 Z" fill="url(#gFreshC)" stroke="' + INK + '" stroke-width="1.4"/>' + sheetWall(196, 180, 380, { w: 10 }) + sheetWall(444, 180, 380, { w: 10 }) + surfaceFront(t, 120);
    var m = Math.round(lerp(5, 25, clamp(u / 1.6))); s += '<g transform="translate(540 250)"><rect x="-50" y="-16" width="100" height="30" rx="8" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + CY + '">عمق ' + m + ' م</text></g>';
    return s + tag("ماسورة طويلة", 470, 160, u, 0.6, 3, 17);
  });
  // 11 — the pipe pours from the bottom: the concrete pushes the water up and doesn't mix with it (the pipe end stays buried)
  shot(11, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 330, k), lerp(200, 225, k), lerp(1.15, 1.4, k)]; }, function (u, d, t) {
    var lv = lerp(300, 236, ease(clamp(u / d))), s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gRiver)"/>';
    for (var i = 0; i < 30; i++) { var cu = (t * 0.45 + hash(i)) % 1; s += '<path d="M' + f(lerp(60, 600, cu)) + ' ' + f(90 + hash(i + 1) * 150) + ' h26" stroke="#cfeaf4" stroke-width="2.4" opacity="' + f(0.6 * Math.sin(Math.PI * cu)) + '"/>'; }
    s += bubbles(250, 230, t, 8, 80, 140) + bubbles(400, 230, t + 0.3, 8, 80, 140);
    var sp = "M180 300 L180 " + f(lv); for (var x = 180; x <= 460; x += 10) sp += " L" + x + " " + f(lv + 3 * Math.sin(x * 0.15 + t * 2)); s += '<path d="' + sp + ' L460 300 Z" fill="url(#gFreshC)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="308" y="60" width="24" height="' + f(lv + 24 - 60) + '" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/><rect x="312" y="60" width="16" height="' + f(lv + 22 - 60) + '" fill="#8f8b82"/>';
    for (var p = 0; p < 8; p++) { var pu = (t * 1.2 + p / 8) % 1; s += '<circle cx="320" cy="' + f(lerp(70, lv + 18, pu)) + '" r="4" fill="#6a675f"/>'; }
    for (var k = 0; k < 5; k++) { var ku = (t * 0.9 + k / 5) % 1; s += '<circle cx="' + f(320 + Math.cos(k * 1.3) * (20 + ku * 100)) + '" cy="' + f(lv + 16 - ku * 4) + '" r="3" fill="#a5a29a" opacity="' + f(1 - ku) + '"/>'; }
    s += arrow(220, lv - 10, 220, lv - 60, CY, 6, clamp(u / 0.8)) + arrow(420, lv - 10, 420, lv - 60, CY, 6, clamp(u / 0.8));
    s += '<circle cx="320" cy="' + f(lv + 14) + '" r="' + f(22 + 2 * Math.sin(t * 6)) + '" fill="none" stroke="' + YEL + '" stroke-width="3" stroke-dasharray="5 4"/>';
    return s + tag("من تحت لفوق", 440, 120, u, 0.5, 3, 18) + tag("المية بتطلع لفوق", 210, 140, u, 1.8, -3, 15);
  });
  // 12 — concrete doesn't need to dry: cement reacts with water and crystals grow and lock together, even submerged (microscope)
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/><circle cx="320" cy="180" r="150" fill="#1f4a5e" stroke="#9aa2ac" stroke-width="10"/>', g = clamp((u - 0.4) / (d - 0.8));
    s += '<clipPath id="mic"><circle cx="320" cy="180" r="145"/></clipPath><g clip-path="url(#mic)">';
    for (var i = 0; i < 12; i++) { var cx = 220 + hash(i) * 200, cy = 90 + hash(i + 5) * 180, r = 12 + hash(i + 2) * 10; s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="#bdb9af" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var n = 0; n < 8; n++) { var a = n * 0.785 + i, len = r + 4 + 24 * g * (0.6 + hash(i * 8 + n) * 0.6); s += '<path d="M' + f(cx + Math.cos(a) * r) + ' ' + f(cy + Math.sin(a) * r) + ' L' + f(cx + Math.cos(a) * len) + ' ' + f(cy + Math.sin(a) * len) + '" stroke="#e9e4d8" stroke-width="2" stroke-linecap="round"/>'; } }
    for (var w = 0; w < 26; w++) { var wx = 190 + hash(w + 30) * 260 + Math.sin(t * 2 + w) * 6, wy = 60 + hash(w + 40) * 240 + Math.cos(t * 2.3 + w) * 6; s += '<g opacity="' + f(1 - g * 0.8) + '"><circle cx="' + f(wx) + '" cy="' + f(wy) + '" r="4" fill="' + RED + '"/><circle cx="' + f(wx - 4) + '" cy="' + f(wy + 4) + '" r="2.4" fill="#fff"/><circle cx="' + f(wx + 4) + '" cy="' + f(wy + 4) + '" r="2.4" fill="#fff"/></g>'; }
    s += '</g>';
    return s + tag("مية + أسمنت = بلورات", 320, 30, u, 0.4, -3, 17) + tag("بتشد وهي غرقانة!", 320, 340, u, 2.2, 3, 18);
  });
  // 13 — Brooklyn Bridge, 1870s: men worked in huge upside-down timber boxes under the river, full of compressed air (sepia)
  shot(13, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(170, 220, k), lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    var s = river(t, { wl: 110, bed: 250, rock: 330 }) + '<path d="M150 230 L150 300 L490 300 L490 230 Z" fill="#c9a98a" opacity=".5"/>';
    s += '<path d="M140 250 L140 200 L500 200 L500 250 L480 300 L470 250 L170 250 L160 300 Z" fill="url(#gTimber)" stroke="' + INK + '" stroke-width="3"/><rect x="172" y="250" width="296" height="50" fill="#e9c98a" opacity=".55"/>';
    s += '<rect x="280" y="60" width="20" height="140" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/><rect x="350" y="60" width="20" height="140" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/><rect x="250" y="20" width="140" height="40" fill="url(#gGranite)" stroke="' + INK + '" stroke-width="2"/>';
    for (var w = 0; w < 4; w++) s += worker(200 + w * 70, 262, t + w, w === 2 ? "worry" : "n", { s: 0.22, col: "#6b5a3a", noHat: true }) + '<circle cx="' + (220 + w * 70) + '" cy="258" r="' + f(4 + Math.sin(t * 9 + w)) + '" fill="#ffd27a" filter="url(#glow)"/>';
    s += bubbles(150, 250, t, 8, 20, 140) + bubbles(490, 250, t + 0.5, 8, 20, 140) + surfaceFront(t, 110);
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".2"/>';
    var y = Math.round(lerp(2026, 1872, clamp(u / 1.4))); s += '<g transform="translate(110 40)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("هوا مضغوط", 520, 150, u, 1.8, 3, 17) + tag("كوبري بروكلين", 520, 40, u, 0.6, -3, 16);
  });
  // 14 — come up too fast and you got the bends (nitrogen bubbles in the blood), the chief engineer too
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9d8b8"/>', up = ease(clamp(u / 1.4));
    s += '<rect x="90" y="40" width="60" height="300" fill="#8a7a64" stroke="' + INK + '" stroke-width="3"/>' + worker(120, lerp(260, 80, up), t, up > 0.9 ? "dizzy" : "worry", { s: 0.42, col: "#6b5a3a", noHat: true });
    s += '<g transform="translate(400 180)"><circle r="110" fill="#fbf6e6" stroke="' + INK + '" stroke-width="4"/><path d="M-110 -20 C-40 -40 40 0 110 -20 L110 30 C40 50 -40 10 -110 30 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="3"/>';
    for (var b = 0; b < 9; b++) { var bu = (t * 0.5 + b / 9) % 1, bx = lerp(-100, 100, bu), r = 3 + 8 * clamp((u - 1.0) / 1.6) * (0.5 + hash(b) * 0.5); s += '<circle cx="' + f(bx) + '" cy="' + f(4 + Math.sin(b * 2 + t) * 10) + '" r="' + f(r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>'; }
    s += '</g>';
    return s + tag("مرض الغواصين", 400, 320, u, 1.0, -3, 19) + tag("فقاعات في الدم", 400, 40, u, 2.0, 3, 15, "#ffb08a");
  });
  // 15 — his wife Emily carried his instructions to the workers and followed the work until the bridge was done (1883)
  shot(15, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="330" y="40" width="250" height="180" fill="#9fc3df" stroke="' + INK + '" stroke-width="5"/>';
    var g = clamp(u / (d * 0.9)); s += '<path d="M330 ' + f(220 - 0) + ' H580" stroke="#5f8aa8" stroke-width="30" opacity=".6"/>';
    [380, 530].forEach(function (tx) { var h = 140 * g; s += '<rect x="' + (tx - 14) + '" y="' + f(210 - h) + '" width="28" height="' + f(h) + '" fill="url(#gGranite)" stroke="' + INK + '" stroke-width="2"/><path d="M' + (tx - 6) + ' ' + f(210 - h * 0.7) + ' v14 a6 6 0 0 1 12 0 v-14" fill="#5a4a3a"/>'; });
    if (g > 0.8) s += '<path d="M366 ' + f(210 - 140 * g) + ' Q455 160 544 ' + f(210 - 140 * g) + '" stroke="' + INK + '" stroke-width="2" fill="none"/><path d="M330 150 H580" stroke="#7a6650" stroke-width="5"/>';
    s += '<rect x="20" y="230" width="200" height="40" fill="#7a5230" stroke="' + INK + '" stroke-width="3"/><g transform="translate(80 210)">' + head(0, 0, 28, "worry", t, 1) + '</g>';
    var ex = lerp(160, 300, (Math.sin(t * 1.2) + 1) / 2); s += '<g transform="translate(' + f(ex) + ' 160)"><path d="M-36 130 C-40 40 -24 22 0 22 C24 22 40 40 36 130 Z" fill="#5a2a4a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -14, 30, "happy", t, 1) + '<path d="M-26 -34 C-20 -60 20 -60 26 -34" stroke="#3a2418" stroke-width="10" fill="none"/><rect x="18" y="40" width="26" height="20" fill="#fbf6e6" stroke="' + INK + '" stroke-width="2" transform="rotate(-10 30 50)"/></g>';
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".14"/>';
    return s + tag("إميلي", 300, 40, u, 0.5, -3, 22) + tag("1883", 455, 260, u, d - 1.4, 3, 18);
  });
  // 16 — after the foundation the pier rises, with a pointed nose to split the current (section + plan view of the cutwater)
  shot(16, function (u, d) { return [lerp(300, 340, u / d), lerp(200, 180, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var h = 1 - Math.pow(1 - clamp(u / 1.6), 2), top = lerp(BED - 10, WL - 80, h), s = river(t) + '<rect x="250" y="' + (BED - 6) + '" width="140" height="' + (ROCK - BED + 16) + '" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2.4"/>';
    [270, 300, 340, 370].forEach(function (px) { s += pile(px, ROCK + 10, ROCK + 60, 14, { ring: false }); });
    s += pierBody(320, top, BED - 4, 60, { wet: WL, cap: h > 0.95 }) + surfaceFront(t);
    var p = pop((u - 1.8) / 0.8); if (p > 0) { s += '<g transform="translate(520 80) scale(' + f(p) + ')"><rect x="-90" y="-56" width="180" height="112" rx="10" fill="#2f6f8a" stroke="' + INK + '" stroke-width="3"/>';
      for (var l = 0; l < 7; l++) { var ly = -42 + l * 14, ph = (t * 60) % 30, dd = "M-90 " + ly; for (var x = -90; x <= 90; x += 6) { var dy = Math.abs(x) < 40 && Math.abs(ly) < 22 ? (ly < 0 ? -1 : 1) * (22 - Math.abs(ly)) * Math.max(0, 1 - Math.abs(x) / 40) : 0; dd += " L" + x + " " + f(ly + dy); } s += '<path d="' + dd + '" stroke="#cfeaf4" stroke-width="1.6" fill="none" stroke-dasharray="8 6" stroke-dashoffset="' + f(-ph) + '"/>'; }
      s += '<path d="M-44 0 L-20 -16 H30 V16 H-20 Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/><path d="M-44 0 L-20 -16 M-44 0 L-20 16" stroke="' + YEL + '" stroke-width="3"/></g>'; }
    return s + tag("بوز مدبب", 520, 170, u, 2.0, 3, 17);
  });
  // 17 — big rocks are dumped around it so the current can't wash the sand from under it (scour vs riprap, side by side)
  shot(17, function (u, d) { return [320, 230, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = river(t) + pierBody(320, WL - 80, BED + 10, 60, { wet: WL }), sc = clamp(u / 1.6) * 0.0;
    var hole = 'M250 ' + BED + ' Q285 ' + (BED + 26) + ' 290 ' + (BED + 4) + ' L290 ' + BED + ' Z'; s += '<path d="' + hole + '" fill="url(#gRiver)" opacity="' + f(clamp(1 - (u - 0.8))) + '"/>';
    for (var g = 0; g < 10; g++) { var gu = (t * 0.7 + g / 10) % 1; if (u < 1.2) s += '<circle cx="' + f(270 + gu * 120) + '" cy="' + f(BED - 4 - gu * 20) + '" r="2.4" fill="#c9a56a" opacity="' + f(1 - gu) + '"/>'; }
    s += barge(160, WL - 2, 120, t) + riprap(320, 160, BED + 2, 22, 3, clamp((u - 0.6) / 1.6));
    for (var r = 0; r < 4; r++) { var ru = (t * 0.8 + r / 4) % 1; if (u > 0.5 && u < 2.6) s += '<path d="M' + f(200 + r * 10) + ' ' + f(WL + ru * 80) + ' l8 -6 l8 4 l-4 8 Z" fill="#8a857a" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - ru) + '"/>'; }
    s += surfaceFront(t);
    return s + tag("صخور حماية", 460, 110, u, 1.2, 3, 18) + tag("التيار بيشيل الرمل", 200, ROCK + 40, u, 0.2, -3, 14, "#ffb08a");
  });
  // 18 — then the bridge itself: precast concrete segments lifted by cranes and fixed in place
  shot(18, function (u, d) { return [lerp(300, 340, u / d), 150, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / (d - 0.6))), s = river(t, { sky: "day" }) + pierBody(320, 70, ROCK, 50, { wet: WL }) + deck(250, 390, 54, t);
    s += barge(470, WL - 2, 140, t) + '<g transform="translate(' + f(lerp(470, 418, k)) + ' ' + f(lerp(WL - 40, 54, k)) + ')"><path d="M-28 0 H28 V14 L16 26 H-16 L-28 14 Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 0 L0 -40 L20 0" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
    s += crane(500, WL - 20, 220, 70, lerp(WL - 80, 14, k), t) + surfaceFront(t);
    return s + tag("قطع جاهزة", 200, 30, u, 0.5, -3, 19);
  });
  // 19 — they add them both ways from the pier at once, one here, one there, so it never tips (balanced cantilever + scale)
  shot(19, function (u, d) { return [320, 140, lerp(0.95, 0.9, u / d)]; }, function (u, d, t) {
    var n = Math.min(6, Math.floor(u / (d / 6.5)) + 1), half = (u / (d / 6.5)) % 1, s = river(t, { sky: "day" }) + pierBody(320, 90, ROCK, 50, { wet: WL });
    for (var i = 0; i < n; i++) { var lx = 320 - 30 - i * 44, rx = 320 + 30 + i * 44, showR = i < n - 1 || half > 0.5; s += '<path d="M' + f(lx - 22) + ' 76 H' + f(lx + 22) + ' V90 L' + f(lx + 16) + ' 100 H' + f(lx - 16) + ' L' + f(lx - 22) + ' 90 Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/>'; if (showR) s += '<path d="M' + f(rx - 22) + ' 76 H' + f(rx + 22) + ' V90 L' + f(rx + 16) + ' 100 H' + f(rx - 16) + ' L' + f(rx - 22) + ' 90 Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/>'; }
    s += '<path d="M298 76 H342 V100 H298 Z" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/>';
    var tilt = half < 0.5 ? -3 : 0; s += '<g transform="translate(320 250) rotate(' + f(tilt + Math.sin(t * 4)) + ')"><path d="M-60 0 H60" stroke="' + INK + '" stroke-width="5"/><path d="M-60 0 v14 M60 0 v14" stroke="' + INK + '" stroke-width="2"/><rect x="-72" y="14" width="24" height="10" fill="' + YEL + '" stroke="' + INK + '"/><rect x="48" y="14" width="24" height="10" fill="' + YEL + '" stroke="' + INK + '"/></g><path d="M320 250 l-10 24 h20 Z" fill="' + INK + '"/>';
    s += surfaceFront(t);
    return s + tag("هنا", 320 - 30 - (n - 1) * 44, 40, u, 0.4, -3, 15) + tag("وهنا", 320 + 30 + (n - 1) * 44, 40, u, 0.9, 3, 15) + tag("الميزان", 450, 250, u, 1.6, 3, 16);
  });
  // 20 — until the two arms meet in the middle and are tied with steel tendons inside the concrete (tensioned, glowing)
  shot(20, function (u, d) { return [320, 120, lerp(0.75, 0.8, u / d)]; }, function (u, d, t) {
    var cl = ease(clamp(u / 1.4)), s = river(t, { sky: "day" }) + pierBody(90, 100, ROCK, 50, { wet: WL }) + pierBody(550, 100, ROCK, 50, { wet: WL });
    s += deck(-40, lerp(300, 318, cl), 80, t) + deck(lerp(340, 322, cl), 680, 80, t);
    if (cl > 0.98) s += '<rect x="312" y="80" width="16" height="22" fill="url(#gFreshC)" stroke="' + INK + '" stroke-width="1.6"/>';
    var ten = clamp((u - 1.6) / 1.2); if (ten > 0) for (var k = 0; k < 2; k++) s += '<path d="M-40 ' + (88 + k * 6) + ' Q320 ' + (98 + k * 6) + ' 680 ' + (88 + k * 6) + '" stroke="' + YEL + '" stroke-width="2.4" fill="none" stroke-dasharray="' + f(800 * ten) + ' 900" opacity="' + f(0.6 + 0.4 * Math.sin(t * 8)) + '"/>';
    if (ten > 0.9) s += arrow(0, 70, -40, 70, YEL, 5, 1) + arrow(640, 70, 680, 70, YEL, 5, 1);
    s += surfaceFront(t);
    return s + tag("اتقابلوا!", 320, 30, u, 1.2, -3, 19) + tag("كابلات حديد", 320, 150, u, 2.0, 3, 16);
  });
  // 21 — they leave small gaps (expansion joints) because the bridge grows in the heat and shrinks in the cold
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var hot = (Math.sin(t * 1.6) + 1) / 2, gap = lerp(26, 6, hot), s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + (hot > 0.5 ? "#fbe2b0" : "#d6e6f2") + '"/>';
    s += '<rect x="-400" y="180" width="' + f(720 - gap / 2) + '" height="40" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="3"/><rect x="' + f(320 + gap / 2) + '" y="180" width="720" height="40" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 6; k++) { s += '<rect x="' + f(320 - gap / 2 - 30) + '" y="' + (184 + k * 6) + '" width="34" height="3" fill="#5a6068"/><rect x="' + f(320 + gap / 2 - 4) + '" y="' + (187 + k * 6) + '" width="34" height="3" fill="#5a6068"/>'; }
    s += '<g transform="translate(120 90)">' + (hot > 0.5 ? sun(0, 0, 26, "#f2a23a") : '<path d="M0 -26 V26 M-22 -13 L22 13 M-22 13 L22 -13" stroke="#5aa8d8" stroke-width="5" stroke-linecap="round"/>') + '</g>';
    s += '<g transform="translate(520 80)"><rect x="-8" y="-50" width="16" height="90" rx="8" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/><rect x="-4" y="' + f(30 - 70 * hot) + '" width="8" height="' + f(70 * hot + 10) + '" fill="' + RED + '"/><circle cy="44" r="12" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/></g>';
    s += '<g transform="translate(320 250)"><path d="M' + f(-gap / 2) + ' 0 H' + f(gap / 2) + '" stroke="' + INK + '" stroke-width="2"/><text y="26" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">' + (hot > 0.5 ? "بيطوّل" : "بيقصر") + '</text></g>';
    return s + tag("فاصل", 320, 60, u, 0.4, -3, 18);
  });
  // 22 — Tahya Misr bridge over the Nile: Guinness record, the world's widest cable-stayed bridge, about 67 m
  shot(22, function (u, d) { return [lerp(300, 340, u / d), 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + '<rect x="-400" y="-300" width="1440" height="470" fill="url(#gSunset)" opacity=".5"/>' + cairo(t, 170) + '<rect x="-400" y="170" width="1440" height="500" fill="url(#gNile)"/>';
    for (var i = 0; i < 18; i++) { var wu = (t * 0.1 + hash(i)) % 1; s += '<path d="M' + f(lerp(-300, 940, wu)) + ' ' + f(190 + hash(i + 2) * 150) + ' h26" stroke="#ffe7c0" stroke-width="2" opacity="' + f(0.4 * Math.sin(Math.PI * wu)) + '"/>'; }
    [180, 460].forEach(function (px) { s += '<path d="M' + (px - 26) + ' 160 L' + px + ' 20 L' + (px + 26) + ' 160" stroke="url(#gConcrete)" stroke-width="12" fill="none"/><path d="M' + (px - 26) + ' 160 L' + px + ' 20 L' + (px + 26) + ' 160" stroke="' + INK + '" stroke-width="1.6" fill="none"/>'; for (var c = 1; c <= 7; c++) { s += '<path d="M' + px + ' ' + (30 + c * 6) + ' L' + (px - c * 22) + ' 148 M' + px + ' ' + (30 + c * 6) + ' L' + (px + c * 22) + ' 148" stroke="#fbf6e6" stroke-width="1.2"/>'; } s += pierBody(px, 170, 230, 40, { cap: false }); });
    s += deck(-200, 840, 148, t, { cars: true });
    var w = Math.round(67 * clamp((u - 0.8) / 1.4)); s += '<g transform="translate(320 270)"><rect x="-120" y="-24" width="240" height="46" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + YEL + '">عرضه ' + w + ' متر</text></g>';
    var p = pop((u - 2.0) / 0.8); if (p > 0) s += '<g transform="translate(540 60) scale(' + f(p) + ') rotate(' + f(8 * Math.sin(t * 2)) + ')"><circle r="34" fill="url(#gold)" stroke="' + INK + '" stroke-width="3"/><text y="6" text-anchor="middle" style="font:800 13px Noto Serif;fill:' + INK + ';direction:ltr">GUINNESS</text></g>';
    return s + tag("تحيا مصر", 160, 220, u, 0.4, -3, 19);
  });
  // 23 — so the pier you see above the water has a hidden part under the mud that can be even longer
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(150, 250, k), lerp(1.0, 0.8, k)]; }, function (u, d, t) {
    var s = river(t, { wl: 150, bed: 230, rock: 420 }) + pierBody(320, 40, 250, 54, { wet: 150 }) + deck(150, 490, 24, t, { cars: true }) + '<rect x="270" y="244" width="100" height="22" fill="url(#gConcreteV)" stroke="' + INK + '" stroke-width="2"/>';
    [282, 308, 332, 358].forEach(function (px) { s += pile(px, 266, 470, 14, { ring: false }); });
    s += surfaceFront(t, 150);
    var a = clamp((u - 0.6) / 0.8), b = clamp((u - 1.6) / 0.8);
    if (a > 0) s += '<path d="M220 40 V150" stroke="' + YEL + '" stroke-width="4" opacity="' + f(a) + '"/><text x="210" y="100" text-anchor="end" style="font:800 15px Noto Sans Arabic;fill:' + INK + '" opacity="' + f(a) + '">اللي بتشوفه</text>';
    if (b > 0) s += '<path d="M420 150 V470" stroke="' + RED + '" stroke-width="4" opacity="' + f(b) + '"/><text x="430" y="320" style="font:800 15px Noto Sans Arabic;fill:#fbf6e6" opacity="' + f(b) + '">اللي مستخبي</text>';
    return s + tag("أطول من اللي فوق!", 320, 380, u, 2.0, -3, 18);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(320 170) scale(.6) translate(-320 -150)">' + pierBody(200, 120, 260, 40) + pierBody(440, 120, 260, 40) + deck(60, 580, 96, t, { cars: true }) + '</g>' + worker(520, 150, t, "happy", { s: 0.5, look: -1 });
    return s + qmark(130, 80, t, 56) + qmark(90, 130, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { nileBridge: nileBridge, river: river, surfaceFront: surfaceFront, pierBody: pierBody, deck: deck, pile: pile, hammer: hammer, crane: crane, barge: barge, sheetWall: sheetWall, worker: worker, tag: tag, cairo: cairo };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
