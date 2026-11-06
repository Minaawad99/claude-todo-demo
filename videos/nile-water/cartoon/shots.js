  // ── the 25 shots, reference look (full-bleed 360×436, bold white outlines), with the real parts of a Nile treatment plant:
  //    bar screen + rake, flash mixer, flocculation, rectangular clarifier with a chain scraper, rapid sand filter with wash
  //    troughs and underdrain, chlorine cylinders + contact tank, underground clear-water tank, high-lift pumps, booster station ──
  var K = window.__kit, ORANGE = K.ORANGE, YEL = K.YEL, PINK = K.PINK, GREEN = K.GREEN, BLUE = K.BLUE, NAVY = "#0d1a33";
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function CAM(x, y, z) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x[0], x[1], k), lerp(y[0], y[1], k), lerp(z[0], z[1], k)]; }; }
  function grow(u, d) { return clamp(u / (d * 0.55)); }
  function P(p) { return "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L"); }
  function bg(fill) { return '<rect x="-80" y="-80" width="520" height="600" fill="' + fill + '"/>'; }
  function navyBg() { var s = bg("url(#skyNight)"); for (var x = -80; x < 440; x += 24) s += '<path d="M' + x + ' -80 V520" stroke="#fff" stroke-opacity=".05"/>'; for (var y = -80; y < 520; y += 24) s += '<path d="M-80 ' + y + ' H440" stroke="#fff" stroke-opacity=".05"/>'; return s; }

  // ── realistic pieces ──
  function faucet(x, y, s, t) {   // a chrome single-lever gooseneck mixer on a deck plate
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    g += '<ellipse cx="0" cy="0" rx="34" ry="9" fill="url(#steelG)" stroke="#fff" stroke-width="3"/>';
    g += '<path d="M-14 0 V-120 Q-14 -170 36 -170 Q86 -170 86 -120 V-104" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/><path d="M-14 0 V-120 Q-14 -170 36 -170 Q86 -170 86 -120 V-104" fill="none" stroke="url(#steelG)" stroke-width="22" stroke-linecap="round"/>';
    g += '<path d="M-20 -120 Q-20 -176 36 -176" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>';
    g += '<rect x="74" y="-108" width="24" height="12" rx="4" fill="#5d6873" stroke="#fff" stroke-width="2.5"/>';
    g += '<path d="M-14 -40 L-52 -62" stroke="#fff" stroke-width="16" stroke-linecap="round"/><path d="M-14 -40 L-52 -62" stroke="url(#steelG)" stroke-width="10" stroke-linecap="round"/>';
    return g + '</g>';
  }
  function stream(x, y0, y1, t, w) {   // a glossy falling stream of water
    var s = '<path d="M' + (x - w / 2) + ' ' + y0 + ' Q' + (x - w / 2 - 1) + ' ' + ((y0 + y1) / 2) + ' ' + (x - w / 2 + 1) + ' ' + y1 + ' L' + (x + w / 2 - 1) + ' ' + y1 + ' Q' + (x + w / 2 + 1) + ' ' + ((y0 + y1) / 2) + ' ' + (x + w / 2) + ' ' + y0 + ' Z" fill="#9fe0ff" opacity=".85" stroke="#fff" stroke-width="1.5"/>';
    for (var i = 0; i < 6; i++) { var k = (t * 2.2 + i / 6) % 1; s += '<rect x="' + f(x - w / 2 + 2) + '" y="' + f(y0 + k * (y1 - y0)) + '" width="' + f(w * 0.25) + '" height="10" rx="2" fill="#fff" opacity=".8"/>'; }
    return s;
  }
  function splash(x, y, t) { var s = ""; for (var i = 0; i < 7; i++) { var k = (t * 2.5 + i / 7) % 1, a = -Math.PI * (0.15 + 0.7 * hash(i)); s += '<circle cx="' + f(x + Math.cos(a) * 26 * k) + '" cy="' + f(y + Math.sin(a) * 22 * k + 30 * k * k) + '" r="' + f(3 * (1 - k) + 1) + '" fill="#cfefff" stroke="#fff" stroke-width="1"/>'; } return s; }
  function glass(x, y, w, h, level, fill, t) {   // a tumbler, slightly narrower at the base, with highlights
    var s = '<path d="M' + (x - w / 2) + ' ' + (y - h) + ' L' + (x - w / 2 + 6) + ' ' + y + ' L' + (x + w / 2 - 6) + ' ' + y + ' L' + (x + w / 2) + ' ' + (y - h) + ' Z" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>';
    var ly = y - 6 - (h - 10) * clamp(level), lw = w / 2 - 6 * (ly - (y - h)) / h;
    if (level > 0) { var d = "M" + f(x - (w / 2 - 5)) + " " + f(ly); for (var q = -w / 2 + 6; q <= w / 2 - 6; q += 6) d += " L" + f(x + q) + " " + f(ly + Math.sin(q * 0.3 + t * 5) * 1.5); s += '<path d="' + d + ' L' + f(x + w / 2 - 10) + ' ' + (y - 4) + ' L' + f(x - w / 2 + 10) + ' ' + (y - 4) + ' Z" fill="' + fill + '"/>'; }
    s += '<path d="M' + (x - w / 2 + 9) + ' ' + (y - h + 10) + ' L' + (x - w / 2 + 13) + ' ' + (y - 12) + '" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>';
    return s;
  }
  function palm(x, y, s, t) {
    var sw = Math.sin(t * 1.6 + x) * 4, g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 0 Q4 -40 ' + f(sw) + ' -80" stroke="#8a5a2b" stroke-width="9" fill="none" stroke-linecap="round"/>';
    for (var i = 0; i < 6; i++) { var a = -Math.PI / 2 + (i - 2.5) * 0.55 + Math.sin(t * 1.4 + i) * 0.06, ex = f(sw + Math.cos(a) * 44), ey = f(-80 + Math.sin(a) * 30 + 14); g += '<path d="M' + f(sw) + ' -80 Q' + f(sw + Math.cos(a) * 26) + ' ' + f(-80 + Math.sin(a) * 34) + ' ' + ex + ' ' + ey + '" stroke="#2f8a4a" stroke-width="9" fill="none" stroke-linecap="round"/>'; }
    return g + '</g>';
  }
  function felucca(x, y, s, t) {   // the Nile sailing boat
    var b = Math.sin(t * 2) * 2; return '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')"><path d="M-40 0 Q0 16 44 0 L36 -6 H-34 Z" fill="#c8793a" stroke="#fff" stroke-width="3"/><path d="M0 -6 V-60" stroke="#5a3a1a" stroke-width="3"/><path d="M2 -62 L40 -10 L2 -10 Z" fill="#fff8e6" stroke="#fff" stroke-width="2"/><path d="M-2 -70 L-30 -14 L-2 -12" fill="#f0e6cf" stroke="#fff" stroke-width="2"/></g>';
  }
  function skyline(y, t) {   // Cairo: blocks, minarets, the Cairo Tower with its lotus top
    var s = ""; for (var i = 0; i < 12; i++) { var x = -40 + i * 36, h = 30 + hash(i) * 50; s += '<rect x="' + x + '" y="' + f(y - h) + '" width="32" height="' + f(h) + '" fill="' + (i % 2 ? "#5a7fa8" : "#6f93b8") + '" stroke="#fff" stroke-width="2"/>'; for (var w = 0; w < 3; w++) s += '<rect x="' + (x + 6 + w * 8) + '" y="' + f(y - h + 8) + '" width="4" height="5" fill="#ffe08a" opacity="' + (hash(i + w) > 0.5 ? 0.9 : 0.3) + '"/>'; }
    s += '<path d="M250 ' + y + ' L254 ' + (y - 110) + ' L262 ' + (y - 110) + ' L266 ' + y + ' Z" fill="#c9d6e4" stroke="#fff" stroke-width="2.5"/><path d="M248 ' + (y - 110) + ' Q258 ' + (y - 132) + ' 268 ' + (y - 110) + ' Z" fill="#9fb4c9" stroke="#fff" stroke-width="2.5"/><path d="M258 ' + (y - 132) + ' V' + (y - 146) + '" stroke="#fff" stroke-width="2"/>';
    s += '<path d="M90 ' + y + ' V' + (y - 70) + '" stroke="#e8dcc4" stroke-width="6"/><circle cx="90" cy="' + (y - 74) + '" r="5" fill="#e8dcc4" stroke="#fff" stroke-width="2"/>';
    return s;
  }
  // Africa and the Nile, from rough real coordinates (lon/lat) projected onto the frame
  var AF = [[-6, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31.5], [34, 28], [35, 24], [38, 18], [43, 12], [51, 12], [51, 10], [45, 2], [40, -3], [40, -10], [35, -20], [33, -26], [27, -34], [20, -35], [18, -30], [14, -22], [12, -15], [13, -6], [9, -1], [9, 4], [5, 4.5], [-2, 5], [-8, 4.5], [-13, 8], [-17, 14], [-17, 21], [-13, 27], [-9, 32]];
  var WHITE = [[33, -0.5], [32.5, 3.5], [31.6, 9.5], [32.5, 15.6]], BLUEN = [[37.3, 11.8], [36.2, 10.4], [35, 11.5], [33.6, 13.6], [32.5, 15.6]], MAIN = [[32.5, 15.6], [33.8, 17.7], [32, 19], [31, 20.5], [33, 22.5], [32.9, 24.1], [32.6, 25.7], [31.2, 30], [31, 31.4]];
  function pj(p) { return [20 + (p[0] + 20) / 75 * 320, 20 + (38 - p[1]) / 74 * 396]; }
  function pjs(a) { return a.map(pj); }
  function africa(t, k, kB) {
    var s = '<path d="' + P(pjs(AF)) + ' Z" fill="#e6c88f" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>';
    s += '<path d="' + P(pjs([[29, -5], [30, -8], [31, -10], [32, -8]])) + '" stroke="#c9a96b" stroke-width="2" fill="none"/>';
    s += '<path d="' + P(pjs([[34, 14], [38, 14], [40, 9], [38, 6], [35, 8]])) + ' Z" fill="#a8b97a" opacity=".8"/>';   // the Ethiopian highlands
    var v = pj([33, -1]); s += '<ellipse cx="' + f(v[0]) + '" cy="' + f(v[1]) + '" rx="13" ry="11" fill="#3fb0e6" stroke="#fff" stroke-width="2.5"/>';
    var ta = pj([37.3, 12]); s += '<circle cx="' + f(ta[0]) + '" cy="' + f(ta[1]) + '" r="5" fill="#3fb0e6" stroke="#fff" stroke-width="2"/>';
    var dash = function (a, kk, w, col) { var p = pjs(a); return '<path d="' + P(p) + '" stroke="#fff" stroke-width="' + (w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="' + f(kk) + ' 1"/><path d="' + P(p) + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="' + f(kk) + ' 1"/>'; };
    s += dash(WHITE, k, 4, "#7fc8ef") + dash(BLUEN, kB == null ? k : kB, 5, "#1f6fd1") + dash(MAIN, k, 6, "#1f7fbf");
    var c = pj([31.2, 30]); s += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="5" fill="' + ORANGE + '" stroke="#fff" stroke-width="2"/>';
    return s;
  }
  function lens(x, y, r, inner) {   // a microscope view
    return '<clipPath id="lensC"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/></clipPath><g clip-path="url(#lensC)">' + inner + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#fff" stroke-width="7"/><circle cx="' + x + '" cy="' + y + '" r="' + (r + 9) + '" fill="none" stroke="#24476b" stroke-width="10"/>';
  }
  function diatom(x, y, s, a, t) {   // a pennate diatom: a long boat-shaped glass shell with ribs
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a + Math.sin(t + x) * 4) + ') scale(' + s + ')"><path d="M-26 0 Q0 -9 26 0 Q0 9 -26 0Z" fill="#c9b45a" stroke="#fff" stroke-width="2"/>';
    for (var i = -4; i <= 4; i++) g += '<path d="M' + (i * 5) + ' -5 V5" stroke="#8a7a2a" stroke-width="1.2"/>';
    return g + '<path d="M-22 0 H22" stroke="#8a7a2a" stroke-width="1.4"/></g>';
  }
  function rod(x, y, a, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a + t * 30) + ')"><rect x="-10" y="-4" width="20" height="8" rx="4" fill="#ff7aa2" stroke="#fff" stroke-width="1.6"/><path d="M10 0 q6 -4 10 0 t10 0" stroke="#fff" stroke-width="1.2" fill="none"/></g>'; }
  function silt(x0, y0, w, h, n, t, seed) { var s = ""; for (var i = 0; i < n; i++) { var x = x0 + ((hash(i + seed) * w + t * 8 * (hash(i + 2) - 0.5)) % w + w) % w, y = y0 + ((hash(i + seed + 5) * h + Math.sin(t + i) * 5) % h + h) % h; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1.4 + hash(i + 7) * 2.4) + '" fill="#8a5a2b"/>'; } return s; }
  function rake(x, y, h, t) { var k = (t * 0.25) % 1, ry = y + h - k * h; return '<rect x="' + (x - 8) + '" y="' + f(ry - 6) + '" width="60" height="12" rx="3" fill="' + ORANGE + '" stroke="#fff" stroke-width="2.5"/><path d="M' + (x + 44) + ' ' + f(ry) + ' V' + (y - 30) + '" stroke="#fff" stroke-width="3"/>'; }
  function impeller(x, y, r, t, col) { var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + f(t * 300) + ')">'; for (var k = 0; k < 4; k++) s += '<rect x="-3" y="' + (-r) + '" width="6" height="' + r + '" rx="2" fill="' + (col || "#e6ecf2") + '" stroke="#fff" stroke-width="1.5" transform="rotate(' + (k * 90) + ')"/>'; return s + '</g>'; }
  function cylinder(x, y, s) {   // a chlorine cylinder on its cradle, with valve
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-60" y="-22" width="120" height="44" rx="22" fill="#e9c94a" stroke="#fff" stroke-width="3"/><path d="M-56 -8 H56" stroke="#fff" stroke-width="3" opacity=".5"/><rect x="-6" y="-34" width="12" height="12" fill="#5d6873" stroke="#fff" stroke-width="2"/><path d="M-40 22 L-48 36 M40 22 L48 36" stroke="#8a95a3" stroke-width="5"/><text x="0" y="8" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="18" fill="#5a4a10">Cl₂</text></g>';
  }
  function pumpSet(x, y, s, t, col) {   // a horizontal end-suction pump with its motor on a base plate
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-70" y="22" width="150" height="12" fill="#5d6873" stroke="#fff" stroke-width="2.5"/>';
    g += '<rect x="-64" y="-20" width="72" height="42" rx="8" fill="' + (col || "#2f6fb5") + '" stroke="#fff" stroke-width="3"/>'; for (var i = 0; i < 6; i++) g += '<path d="M' + (-58 + i * 11) + ' -16 V18" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>';
    g += '<rect x="8" y="-6" width="14" height="12" fill="#8a95a3" stroke="#fff" stroke-width="2"/><circle cx="42" cy="0" r="22" fill="#d9483b" stroke="#fff" stroke-width="3"/>' + impeller(42, 0, 14, t, "#ffd0c8").replace('<g transform', '<g opacity=".9" transform');
    return g + '<rect x="34" y="-44" width="16" height="22" fill="#d9483b" stroke="#fff" stroke-width="2.5"/></g>';
  }
  function dial(x, y, r, v, txt) { return gauge(x, y, r, v, txt); }
  function house(x, y, w, h, roof) { return '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="#f2d3a8" stroke="#fff" stroke-width="4"/><path d="M' + (x - 12) + ' ' + (y - h + 2) + ' L' + (x + w / 2) + ' ' + (y - h - (roof || 50)) + ' L' + (x + w + 12) + ' ' + (y - h + 2) + ' Z" fill="#d9654b" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>'; }

  // 0 — the hook: a real kitchen tap
  shot(0, CAM([200, 180], [210, 200], [1.35, 1.0]), function (u, d, t) {
    var s = bg("#1f6f8f");
    for (var x = -80; x < 440; x += 44) for (var y = -80; y < 300; y += 30) s += '<rect x="' + (x + (y / 30 % 2) * 22) + '" y="' + y + '" width="42" height="28" rx="3" fill="#2a7fa1" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>';
    s += '<rect x="-80" y="296" width="520" height="20" fill="#e8edf2" stroke="#fff" stroke-width="3"/><rect x="-80" y="316" width="520" height="220" fill="#5a3f2b"/>';
    s += '<path d="M60 300 Q60 390 180 390 Q300 390 300 300 Z" fill="#c9d3dd" stroke="#fff" stroke-width="5"/><ellipse cx="180" cy="378" rx="10" ry="4" fill="#5d6873"/>';
    s += faucet(110, 300, 1.05, t) + stream(203, 194, 330, t, 11) + glass(204, 372, 54, 70, 0.25 + 0.6 * grow(u, d), "rgba(120,200,240,.8)", t) + splash(204, 320, t);
    return s + tag("الميه دي جاية منين؟", 200, 110, u, 0.7, 17, ORANGE);
  });

  // 1 — the river is far away: the Nile with palms and a felucca, Cairo behind, a pipe running to a house
  shot(1, CAM([180, 200], [180, 210], [1.0, 1.1]), function (u, d, t) {
    var s = sky("day", t) + sun(300, 50, 16) + skyline(170, t) + '<rect x="-80" y="168" width="520" height="40" fill="url(#grassG)"/>';
    s += water(t, 205) + felucca(lerp(40, 140, (t * 0.05) % 1), 260, 0.9, t) + palm(30, 210, 0.9, t) + palm(320, 210, 0.8, t + 1);
    s += '<rect x="-80" y="320" width="520" height="200" fill="url(#soilG)"/>' + pipe([[60, 300], [60, 350], [300, 350], [300, 395]], 12) + flow(t, [[60, 300], [60, 350], [300, 350], [300, 395]], "#bfeaff", 8, 0.2, 4);
    s += house(268, 420, 64, 50, 26);
    return s + tag("من نهر بعيد جداً!", 180, 120, u, 0.9, 21, ORANGE);
  });

  // 2 — muddy river water vs the clear water in the glass
  shot(2, CAM([180, 200], [180, 210], [1.0, 1.06]), function (u, d, t) {
    var s = navyBg();
    s += glass(95, 330, 120, 200, 0.85, "url(#mudG)", t) + silt(42, 150, 106, 170, 40, t, 3) + floc(95, 250, 34, 6, 7, 1);
    s += glass(265, 330, 120, 200, 0.85 * grow(u, d) + 0.05, "rgba(110,200,245,.85)", t) + spark(240, 190, t, "#fff") + spark(290, 250, t + 2, "#fff") + bubbles(t, 265, 320, 6, 0.3, 50, 2);
    s += big("←", 180, 250, 40, "#fff");
    return s + tag("ميه النهر", 95, 380, u, 0.5, 18, "#7a4f2a") + tag("ميه الحنفية", 265, 380, u, 1.3, 18, "#2a8fc0");
  });

  // 3 — the question
  shot(3, CAM([180, 220], [180, 200], [1.0, 1.12]), function (u, d, t) {
    var s = water(t, -80) + bubbles(t, 180, 436, 16, 0.2, 360, 4);
    s += big("؟", 160 + Math.sin(t * 1.5) * 8, 260, 200, YEL) + big("؟", 300, 130, 64, ORANGE) + big("؟", 54, 340, 48, PINK);
    return s + tag("إيه الحكاية؟", 180, 60, u, 0.3, 26, ORANGE);
  });

  // 4 — the Nile drawn from Lake Victoria to the Mediterranean on a real map of the basin: about 6,650 km
  shot(4, function (u, d) { var k = ease(clamp(u / d)), v = NM(33, -1); return [lerp(v[0], 180, k), lerp(v[1] - 40, 214, k), lerp(1.7, 1.0, k)]; }, function (u, d, t) {
    var g2 = grow(u, d), s = nileMap(t, { k: g2 }) + nileLabels(u, { cities: [["بحيرة فيكتوريا", 32.8, -2.6, 0.3, 10, "#2a8fc0", 16], ["القاهرة", 31.24, 30.04, 2.2, 10, ORANGE]] });
    return s + big(Math.round(6650 * g2) + " كم", 90, 120, 30, ORANGE);
  });

  // 5 — two sources: the White Nile from Lake Victoria, the Blue Nile from Lake Tana in the Ethiopian highlands, meeting at Khartoum
  shot(5, function (u, d) { var k = ease(clamp(u / d)), a = NM(33.2, 2.5), b = NM(35, 12.5); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(2.0, 2.2, k)]; }, function (u, d, t) {
    var s = nileMap(t, { k: 1, flow: true }) + nileLabels(u, { countries: true, seas: false, size: 0.6, cities: [
      ["النيل الأبيض", 31.0, 6.0, 0.3, 11, "#2a8fc0", 0], ["بحيرة فيكتوريا", 32.8, -1.2, 0.6, 10, "#2a8fc0", 0],
      ["النيل الأزرق", 35.4, 11.2, 1.4, 11, "#1f5fc8", -14], ["بحيرة تانا", 37.3, 12.0, 1.8, 10, "#1f5fc8", -14],
      ["الخرطوم", 32.53, 15.6, 2.4, 11, ORANGE, -14], ["هضبة إثيوبيا", 39.6, 6.2, 2.8, 10, "#5a5a20", 0]] });
    return s;
  });

  // 6 — the Blue Nile gives about 60% of the water reaching Aswan (a donut split)
  shot(6, CAM([180, 210], [180, 200], [1.0, 1.05]), function (u, d, t) {
    var s = water(t, -80) + bubbles(t, 180, 436, 10, 0.15, 360, 3);
    var k = grow(u, d) * 0.6, R = 110, cx = 180, cy = 210, arc = function (a0, a1) { return 'M' + f(cx + Math.sin(a0) * R) + ' ' + f(cy - Math.cos(a0) * R) + ' A' + R + ' ' + R + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + f(cx + Math.sin(a1) * R) + ' ' + f(cy - Math.cos(a1) * R); };
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#fff" stroke-width="44"/><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#bfe6f7" stroke-width="36"/>';
    if (k > 0.001) s += '<path d="' + arc(0, k * 2 * Math.PI) + '" fill="none" stroke="#1f5fc8" stroke-width="36"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="80" fill="' + NAVY + '" stroke="#fff" stroke-width="4"/>' + big(Math.round(k * 100) + "%", cx, cy + 16, 46, ORANGE);
    return s + tag("النيل الأزرق", 180, 60, u, 0.2, 20, "#1f5fc8") + tag("الباقي: النيل الأبيض والعطبرة", 180, 380, u, 1.6, 14, NAVY);
  });

  // 7 — in the flood season (July–October) it reaches about 80%, and the river turns brown with silt
  shot(7, CAM([180, 200], [180, 220], [1.0, 1.06]), function (u, d, t) {
    var lv = lerp(260, 170, grow(u, d)), s = sky("dusk", t) + skyline(200, t) + palm(40, 210, 0.9, t) + palm(330, 210, 0.8, t + 1);
    s += water(t, lv, { muddy: true }) + silt(-40, lv + 10, 440, 300, 60, t, 9);
    s += '<path d="M-80 ' + f(lv + 6) + ' H440" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" opacity=".6"/>';
    s += gauge(280, 320, 56, 0.8 * grow(u, d), "") + big("80%", 280, 330, 26, ORANGE);
    return s + tag("موسم الفيضان", 120, 330, u, 0.6, 20, NAVY);
  });

  // 8 — under the microscope: silt, sand, diatoms (algae), bacteria
  shot(8, CAM([180, 210], [180, 200], [1.0, 1.08]), function (u, d, t) {
    var inner = bg("url(#mudG)") + '<rect x="0" y="0" width="360" height="436" fill="#d9b98a" opacity=".5"/>' + silt(30, 50, 300, 330, 70, t, 1) + sand(70, 90, 220, 260, 8, 5);
    inner += diatom(120, 150, 1.6, 20, t) + diatom(250, 300, 1.4, -30, t) + diatom(200, 120, 1.1, 70, t) + rod(110, 300, 10, t) + rod(270, 170, 80, t) + rod(220, 340, 140, t);
    var s = navyBg() + lens(180, 220, 150, inner);
    return s + tag("طمي ورمل", 70, 70, u, 0.5, 16, "#7a4f2a") + tag("طحالب", 300, 80, u, 1.4, 16, "#3f9a55") + tag("ميكروبات", 280, 390, u, 2.2, 16, "#c2456b");
  });

  // 9 — the intake on the river bank: a bar screen with a moving rake catches branches, plastic and leaves
  shot(9, CAM([170, 200], [200, 210], [1.0, 1.1]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-80" y="120" width="520" height="40" fill="url(#grassG)"/>' + soil(t, 150);
    s += '<rect x="150" y="150" width="300" height="300" fill="url(#mudG)"/>' + water(t, 170, { muddy: true }).replace(/x="-60"/g, 'x="150"') + silt(160, 190, 260, 240, 30, t, 4);
    s += '<rect x="40" y="90" width="120" height="330" fill="url(#concG)" stroke="#fff" stroke-width="5"/><rect x="48" y="100" width="104" height="22" fill="#5d6873" stroke="#fff" stroke-width="2"/>';
    s += '<rect x="132" y="170" width="20" height="240" fill="#3b4a5a" stroke="#fff" stroke-width="2"/>'; for (var g = 0; g < 4; g++) s += '<path d="M' + (135 + g * 5) + ' 172 V408" stroke="#d8dee6" stroke-width="2.2"/>';
    s += rake(120, 170, 230, t);
    s += '<path d="M150 260 l18 -6 l2 8 z" fill="#3f9a55" stroke="#fff" stroke-width="1.5"/><rect x="152" y="300" width="34" height="7" rx="3" fill="#8a5a2b" stroke="#fff" stroke-width="1.5" transform="rotate(-25 169 303)"/><rect x="154" y="340" width="12" height="26" rx="4" fill="#9fd8ef" stroke="#fff" stroke-width="2" transform="rotate(70 160 353)"/>';
    s += flow(t, [[380, 300], [240, 300], [160, 300]], "#e8c48e", 7, 0.22, 4) + pipe([[48, 380], [-80, 380]], 22);
    return s + tag("مأخذ المية", 100, 60, u, 0.4, 18, NAVY) + tag("الشبك بيمسك الكبير", 230, 120, u, 1.4, 15, NAVY);
  });

  // 10 — alum (الشبة) is dosed into a flash mixer; in the lens the fine silt gathers into flocs
  shot(10, CAM([180, 210], [180, 200], [1.0, 1.06]), function (u, d, t) {
    var s = navyBg();
    s += '<rect x="20" y="40" width="80" height="110" rx="10" fill="#e8edf2" stroke="#fff" stroke-width="4"/><rect x="26" y="80" width="68" height="64" fill="#f6f2e6"/>' + big("شبة", 60, 70, 18, NAVY);
    s += pipe([[60, 150], [60, 180], [150, 180], [150, 200]], 8) + flow(t, [[60, 150], [60, 180], [150, 180], [150, 205]], "#fff", 5, 0.5, 3);
    s += tank(100, 200, 120, 200, 0.85, t, { muddy: true }) + '<path d="M160 160 V340" stroke="#fff" stroke-width="7"/><path d="M160 160 V340" stroke="#8a95a3" stroke-width="3"/>' + impeller(160, 340, 22, t * 2) + '<rect x="140" y="140" width="40" height="24" rx="4" fill="#2f6fb5" stroke="#fff" stroke-width="3"/>';
    var g2 = grow(u, d), inner = bg("url(#mudG)") + silt(220, 120, 140, 200, Math.round(40 * (1 - g2)) + 6, t, 2) + floc(290, 170, 26, Math.round(3 + 7 * g2), 21, g2 + 0.2) + floc(270, 260, 22, Math.round(2 + 6 * g2), 23, g2 + 0.2);
    s += lens(290, 220, 72, inner);
    return s + tag("بيتضاف الشبة", 180, 50, u, 0.4, 20, NAVY) + tag("الطين الناعم بيلزق في كتل", 200, 390, u, 1.6, 15, NAVY);
  });

  // 11 — sedimentation: a long rectangular basin; the flocs settle, a chain scraper pushes the sludge, clear water spills over the weir
  shot(11, CAM([200, 220], [160, 220], [1.15, 1.0]), function (u, d, t) {
    var s = navyBg() + '<rect x="0" y="100" width="360" height="260" fill="url(#concG)" stroke="#fff" stroke-width="5"/>';
    s += '<rect x="8" y="120" width="344" height="232" fill="url(#waterG)"/><rect x="8" y="120" width="120" height="232" fill="#a87a4a" opacity=".55"/><rect x="128" y="120" width="100" height="232" fill="#a87a4a" opacity=".25"/>';
    s += '<path d="M8 330 Q180 318 352 336 V352 H8 Z" fill="#6b4a2a" stroke="#fff" stroke-width="2"/>';
    for (var i = 0; i < 12; i++) { var k = (t * 0.12 + i / 12) % 1, x = 20 + k * 300, y = 130 + Math.pow(k, 0.7) * 190 * (0.6 + 0.4 * hash(i)); s += floc(x, y, 6, 3, 30 + i, 1); }
    var sk = (t * 30) % 60; for (var j = 0; j < 7; j++) s += '<rect x="' + f(20 + j * 60 - sk) + '" y="334" width="6" height="14" fill="' + ORANGE + '" stroke="#fff" stroke-width="1.5"/>';
    s += '<path d="M330 120 V96 H360" stroke="#fff" stroke-width="5" fill="none"/>' + flow(t, [[330, 118], [352, 104], [372, 104]], "#bfeaff", 4, 0.6, 3.5);
    return s + tag("حوض الترسيب", 180, 60, u, 0.3, 20, NAVY) + tag("الكتل التقيلة بتنزل لتحت", 180, 400, u, 1.4, 15, NAVY);
  });

  // 12 — the rapid sand filter: water layer, wash trough, fine sand, graded gravel, the underdrain with nozzles
  shot(12, CAM([180, 160], [180, 260], [1.15, 1.0]), function (u, d, t) {
    var s = navyBg() + '<rect x="40" y="40" width="280" height="370" rx="6" fill="url(#concG)" stroke="#fff" stroke-width="5"/>';
    s += '<rect x="48" y="48" width="264" height="86" fill="url(#waterG)"/><path d="M150 70 V110 Q180 128 210 110 V70" fill="#8a95a3" stroke="#fff" stroke-width="3"/>';
    s += '<rect x="48" y="134" width="264" height="120" fill="#f2c25a"/>' + sand(48, 134, 264, 120, 46, 60);
    s += '<rect x="48" y="254" width="264" height="44" fill="#9aa5b2"/>' + gravel(48, 254, 264, 44, 18, 70) + '<rect x="48" y="298" width="264" height="50" fill="#7d8896"/>';
    for (var g = 0; g < 9; g++) s += '<circle cx="' + (64 + g * 30) + '" cy="' + (306 + (g % 2) * 22) + '" r="12" fill="#b8c2cc" stroke="#fff" stroke-width="2"/>';
    s += '<rect x="48" y="350" width="264" height="52" fill="#24476b"/>'; for (var n = 0; n < 8; n++) s += '<rect x="' + (66 + n * 32) + '" y="342" width="8" height="12" fill="#e6ecf2" stroke="#fff" stroke-width="1.5"/>';
    for (var k = 0; k < 12; k++) { var p = (t * 0.45 + k / 12) % 1; s += '<circle cx="' + f(70 + (k * 23) % 230) + '" cy="' + f(80 + p * 300) + '" r="3.5" fill="#bfeaff" stroke="#fff" stroke-width="1.2"/>'; }
    s += flow(t, [[312, 376], [400, 376]], "#bfeaff", 4, 0.4, 4);
    return s + tag("رمل ناعم", 290, 190, u, 0.8, 13, NAVY) + tag("زلط", 300, 280, u, 1.4, 13, NAVY) + tag("فلتر الرمل والزلط", 180, 300, u, 0.3, 18, NAVY);
  });

  // 13 — algae: a green mat grows on the sand and clogs it, the water level above rises; the doses are tuned
  shot(13, CAM([180, 200], [180, 220], [1.0, 1.08]), function (u, d, t) {
    var g2 = grow(u, d), s = navyBg() + '<rect x="40" y="80" width="280" height="290" rx="6" fill="url(#concG)" stroke="#fff" stroke-width="5"/>';
    var lvl = lerp(170, 100, g2); s += '<rect x="48" y="' + f(lvl) + '" width="264" height="' + f(200 - lvl) + '" fill="url(#waterG)"/><rect x="48" y="200" width="264" height="162" fill="#f2c25a"/>' + sand(48, 200, 264, 162, 36, 90);
    for (var i = 0; i < 14; i++) s += diatom(70 + (i * 19) % 230, 196 + (i % 3) * 4, 0.5 + 0.6 * g2, (i * 37) % 180, t);
    s += '<path d="M48 200 H312" stroke="' + GREEN + '" stroke-width="' + f(4 + 10 * g2) + '" opacity=".9"/>';
    s += gauge(300, 60, 36, 0.3 + 0.5 * g2, "") + big("↑", 300, 70, 22, ORANGE);
    return s + tag("الطحالب بتسد الفلاتر", 160, 50, u, 0.5, 17, NAVY) + tag("الجرعات بتتظبط كل يوم", 180, 400, u, 1.8, 15, NAVY);
  });

  // 14 — chlorine from the cylinders into the contact tank; the leftover microbes die
  shot(14, CAM([180, 200], [180, 210], [1.0, 1.06]), function (u, d, t) {
    var s = navyBg() + cylinder(90, 80, 0.9) + cylinder(250, 80, 0.9);
    s += pipe([[90, 110], [90, 150], [250, 150], [250, 110]], 6) + pipe([[170, 150], [170, 200]], 6) + flow(t, [[170, 150], [170, 210]], "#e9f27a", 4, 0.6, 3);
    s += tank(40, 200, 280, 200, 0.9, t);
    var kk = clamp((u - 0.8) / 1.6);
    for (var i = 0; i < 7; i++) { var sc = Math.max(0.01, 1.4 * (1 - kk)); s += microbe(80 + i * 34, 280 + (i % 2) * 40, sc, t, i % 2 ? PINK : GREEN, i); if (kk > 0.3) s += spark(80 + i * 34, 280 + (i % 2) * 40, t + i, YEL); }
    return s + tag("الكلور", 180, 150, u, 0.3, 18, NAVY) + tag("بيقتل الميكروبات اللي فاضلة", 180, 380, u, 1.6, 14, NAVY);
  });

  // 15 — a little chlorine stays with the water all the way through the pipes (the residual)
  shot(15, CAM([160, 210], [220, 210], [1.1, 1.0]), function (u, d, t) {
    var s = sky("day", t) + skyline(150, t) + '<rect x="-80" y="150" width="520" height="40" fill="url(#grassG)"/>' + soil(t, 180);
    s += '<rect x="-80" y="232" width="560" height="56" fill="#fff"/><rect x="-80" y="238" width="560" height="44" fill="url(#waterG)"/>';
    for (var i = 0; i < 9; i++) { var x = ((t * 50 + i * 60) % 560) - 80; s += '<circle cx="' + f(x) + '" cy="' + f(260 + Math.sin(t * 3 + i) * 8) + '" r="9" fill="#e9f27a" stroke="#fff" stroke-width="2"/><text x="' + f(x) + '" y="' + f(264 + Math.sin(t * 3 + i) * 8) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="9" fill="#5a4a10">Cl</text>'; }
    return s + tag("شوية كلور بيفضلوا في الميه", 180, 330, u, 0.5, 15, NAVY) + tag("لحد ما توصل بيتك", 180, 380, u, 1.6, 15, NAVY);
  });

  // 16 — the underground clear-water tank: columns inside, vent pipes poking up through the grass
  shot(16, CAM([180, 160], [180, 240], [1.1, 1.0]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-80" y="110" width="520" height="30" fill="url(#grassG)"/>' + soil(t, 136);
    s += '<path d="M90 110 V70 Q90 60 100 60 H110" stroke="#fff" stroke-width="10" fill="none"/><path d="M90 110 V70 Q90 60 100 60 H110" stroke="#8a95a3" stroke-width="5" fill="none"/><path d="M270 110 V70 Q270 60 260 60 H250" stroke="#fff" stroke-width="10" fill="none"/><path d="M270 110 V70 Q270 60 260 60 H250" stroke="#8a95a3" stroke-width="5" fill="none"/>';
    s += tank(20, 160, 320, 230, 0.65 + 0.1 * grow(u, d), t);
    for (var c = 0; c < 5; c++) s += '<rect x="' + (52 + c * 60) + '" y="166" width="14" height="218" fill="#c9d3dd" stroke="#fff" stroke-width="2" opacity=".85"/>';
    s += pipe([[-80, 230], [20, 230]], 14) + flow(t, [[-80, 230], [26, 230]], "#bfeaff", 4, 0.4, 4);
    return s + tag("خزان تحت الأرض", 180, 90, u, 0.4, 19, NAVY) + tag("جوه المحطة", 180, 420, u, 1.6, 16, NAVY);
  });

  // 17 — the high-lift pump hall: three pump sets, a common header, pressure gauges
  shot(17, CAM([150, 210], [210, 210], [1.15, 1.0]), function (u, d, t) {
    var s = navyBg() + '<rect x="-80" y="330" width="520" height="200" fill="#3b4a5a"/><path d="M-80 330 H440" stroke="#fff" stroke-width="3"/>';
    s += pipe([[-80, 150], [440, 150]], 26) + flow(t, [[-80, 150], [440, 150]], "#bfeaff", 14, 0.28, 5);
    for (var i = 0; i < 3; i++) { var x = 60 + i * 120; s += pipe([[x + 42, 270], [x + 42, 150]], 12) + pumpSet(x, 300, 0.9, t + i, "#2f6fb5") + gauge(x + 70, 214, 16, 0.65 + 0.05 * Math.sin(t * 3 + i), ""); }
    return s + tag("طلمبات الضغط العالي", 180, 60, u, 0.4, 18, NAVY) + tag("بتدفع الميه في المواسير", 180, 400, u, 1.3, 16, NAVY);
  });

  // 18 — a big main under the road: tens of kilometres to the city
  shot(18, CAM([180, 210], [180, 210], [1.0, 1.06]), function (u, d, t) {
    var s = sky("dusk", t) + skyline(170, t) + '<rect x="-80" y="168" width="520" height="70" fill="#3a4152"/>';
    s += '<path d="M-80 204 H440" stroke="#ffd166" stroke-width="4" stroke-dasharray="26 20" stroke-dashoffset="' + f(-t * 140) + '"/>';
    for (var i = 0; i < 4; i++) { var x = ((t * 70 * (i % 2 ? 1 : -1) + i * 140) % 560 + 560) % 560 - 100; s += '<rect x="' + f(x) + '" y="' + (i % 2 ? 176 : 212) + '" width="54" height="20" rx="7" fill="' + ["#ff7a5c", "#2a8fc0", "#ffd166", "#7bd389"][i] + '" stroke="#fff" stroke-width="3"/><circle cx="' + f(x + 12) + '" cy="' + (i % 2 ? 196 : 232) + '" r="5" fill="#222"/><circle cx="' + f(x + 42) + '" cy="' + (i % 2 ? 196 : 232) + '" r="5" fill="#222"/>'; }
    s += soil(t, 238) + '<circle cx="-10" cy="320" r="0"/>' + pipe([[-80, 320], [440, 320]], 56) + flow(t, [[-80, 320], [440, 320]], "#bfeaff", 14, 0.2, 6);
    s += '<rect x="290" y="250" width="50" height="34" rx="6" fill="#2f7a4a" stroke="#fff" stroke-width="3"/><text x="315" y="273" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="14" fill="#fff">كم 18</text>';
    return s + tag("عشرات الكيلومترات", 180, 400, u, 0.5, 20, NAVY);
  });

  // 19 — a booster station on the way: pressure drops along the pipe, the pump lifts it again
  shot(19, CAM([180, 210], [180, 210], [1.0, 1.06]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-80" y="250" width="520" height="40" fill="url(#grassG)"/>' + soil(t, 286);
    s += '<rect x="110" y="150" width="140" height="130" rx="6" fill="#e8dcc4" stroke="#fff" stroke-width="4"/><path d="M100 152 H260 L240 130 H120 Z" fill="#8a95a3" stroke="#fff" stroke-width="3"/>' + pumpSet(180, 240, 0.7, t, "#2f6fb5");
    s += pipe([[-80, 330], [150, 330], [150, 262]], 18) + pipe([[214, 262], [214, 330], [440, 330]], 18);
    s += flow(t, [[-80, 330], [150, 330]], "#bfeaff", 4, 0.12, 4) + flow(t, [[214, 330], [440, 330]], "#bfeaff", 9, 0.35, 4);
    s += gauge(40, 200, 30, 0.2, "") + gauge(320, 200, 30, 0.2 + 0.6 * grow(u, d), "");
    return s + tag("ضعيف", 40, 250, u, 0.6, 13, "#c2456b") + tag("قوي", 320, 250, u, 1.6, 13, "#3f9a55") + tag("محطة تقوية", 180, 60, u, 0.3, 20, NAVY);
  });

  // 20 — the building: the riser carries the water up to every floor, the kitchen tap at the top
  shot(20, CAM([180, 330], [200, 170], [1.2, 1.0]), function (u, d, t) {
    var s = sky("day", t) + '<rect x="-80" y="400" width="520" height="80" fill="url(#soilG)"/>';
    s += '<rect x="60" y="60" width="240" height="340" fill="#f2d3a8" stroke="#fff" stroke-width="5"/>'; for (var fl = 0; fl < 4; fl++) s += '<path d="M60 ' + (140 + fl * 80) + ' H300" stroke="#fff" stroke-width="3"/><rect x="200" y="' + (80 + fl * 80) + '" width="70" height="40" fill="#9fd8ef" stroke="#fff" stroke-width="3"/>';
    s += pipe([[180, 470], [180, 400], [120, 400], [120, 100]], 8); for (var j = 0; j < 4; j++) s += pipe([[120, 130 + j * 80], [150, 130 + j * 80]], 6);
    s += flow(t, [[180, 470], [180, 400], [120, 400], [120, 100]], "#bfeaff", 10, 0.3, 3.5);
    s += faucet(160, 136, 0.28, t) + stream(173, 106, 128, t, 3);
    return s + tag("الحنفية اللي إنت فاتحها!", 190, 60, u, 0.4, 15, NAVY);
  });

  // 21 — the lab: a turbidimeter reading in NTU, chlorine test vials, sample bottles
  shot(21, CAM([180, 200], [190, 210], [1.0, 1.06]), function (u, d, t) {
    var s = navyBg() + '<rect x="-80" y="300" width="520" height="200" fill="#e8edf2" stroke="#fff" stroke-width="3"/><rect x="-80" y="300" width="520" height="14" fill="#c9d3dd"/>';
    s += '<rect x="30" y="160" width="150" height="140" rx="12" fill="#e6ecf2" stroke="#fff" stroke-width="4"/><rect x="44" y="176" width="122" height="64" rx="6" fill="#0d1a33"/>';
    s += '<text x="105" y="200" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="12" fill="#7fd3f5">NTU</text><text x="105" y="232" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="30" fill="' + GREEN + '">' + (u < 1.2 ? "12.0" : "0.4") + '</text><rect x="90" y="250" width="30" height="40" rx="4" fill="#cfefff" stroke="#fff" stroke-width="2"/>';
    var vials = ["#fff6c8", "#ffe28a", "#ffcf5a", "#ffb938"]; for (var i = 0; i < 4; i++) s += '<rect x="' + (210 + i * 28) + '" y="230" width="18" height="70" rx="6" fill="' + vials[i] + '" stroke="#fff" stroke-width="2.5"/>';
    s += '<path d="M330 296 V250 L350 220 V200 H364" stroke="#fff" stroke-width="3" fill="none" opacity=".0"/>';
    s += '<path d="M200 150 l14 14 l28 -30" stroke="' + GREEN + '" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="' + f(clamp((u - 1.6) / 0.6)) + '"/>';
    return s + tag("معمل التحاليل", 180, 60, u, 0.4, 20, NAVY) + tag("بياخد عينات كل فترة", 180, 380, u, 1.4, 16, NAVY);
  });

  // 22 — the clean water pours from the tap into the glass
  shot(22, CAM([200, 200], [190, 220], [1.4, 1.1]), function (u, d, t) {
    var s = bg("#1f6f8f"); for (var x = -80; x < 440; x += 44) for (var y = -80; y < 300; y += 30) s += '<rect x="' + (x + (y / 30 % 2) * 22) + '" y="' + y + '" width="42" height="28" rx="3" fill="#2a7fa1" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>';
    s += '<rect x="-80" y="296" width="520" height="20" fill="#e8edf2" stroke="#fff" stroke-width="3"/><rect x="-80" y="316" width="520" height="220" fill="#5a3f2b"/>';
    s += faucet(110, 300, 1.05, t) + stream(203, 194, 300, t, 11) + glass(204, 372, 70, 100, 0.2 + 0.7 * grow(u, d), "rgba(120,200,240,.85)", t) + spark(260, 260, t, "#fff") + spark(150, 230, t + 2, "#fff");
    return s + tag("صافية ونضيفة", 200, 110, u, 0.4, 18, "#2a8fc0");
  });

  // 23 — the payoff: from Lake Tana in the Ethiopian highlands, down the Blue Nile and the Nile, to Cairo and your glass
  shot(23, function (u, d) { var k = ease(clamp(u / d)), a = NM(36.5, 13), b = NM(31.6, 28.5); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(2.0, 1.7, k)]; }, function (u, d, t) {
    var s = nileMap(t, { k: 1 }), path = NMD.blue.concat(NMD.main.slice(1)).map(function (q) { return NM(q[0], q[1]); });
    for (var i = 0; i < 10; i++) { var q = along(path, (t * 0.08 + i / 10) % 1); s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="3.2" fill="#fff" stroke="#1f5fc8" stroke-width="1.2"/>'; }
    var c = NM(31.24, 30.04); s += glass(c[0] + 18, c[1] + 4, 16, 22, 0.8, "rgba(120,200,240,.95)", t);
    return s + nileLabels(u, { seas: false, size: 0.7, cities: [["من إثيوبيا", 37.3, 12.0, 0.4, 12, "#1f5fc8", 18], ["لكوبايتك في القاهرة", 31.24, 30.04, 1.8, 12, ORANGE, -16]] });
  });

  // 24 — the call to action
  shot(24, CAM([180, 200], [180, 220], [1.0, 1.05]), function (u, d, t) {
    var s = sky("dusk", t) + skyline(260, t) + water(t, 260) + felucca(lerp(60, 280, (t * 0.04) % 1), 300, 0.8, t);
    s += big("قولولنا!", 180, 170, 52, YEL);
    return s + tag("عايزين حكاية إيه المرة الجاية؟", 180, 400, u, 0.8, 15, NAVY);
  });

  window.__parts = { faucet: faucet, glass: glass, stream: stream, splash: splash, palm: palm, felucca: felucca, skyline: skyline, africa: africa, pj: pj, sand: sand, gravel: gravel, water: water, pipe: pipe, flow: flow, tag: tag, big: big, spark: spark, sky: sky, sun: sun, soil: soil };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 12 * Math.sin(t * 1.7), cy = c[1] + 9 * Math.cos(t * 1.7), z = c[2] * (1 + 0.035 * Math.sin(t * 1.3));   // the drift never comes to rest
    svg.innerHTML = '<g transform="translate(180 218) rotate(' + f(0.6 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="360" height="436" filter="url(#grain)"/>';
    return i;
  };
})();
