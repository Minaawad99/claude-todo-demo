  // ── «جريمة بني مزار» in the «القصة 2D» look, played dark: a sleeping Upper-Egypt hamlet (whitewashed and pale-blue
  //    plastered houses, flat roofs stacked with palm fronds, wooden doors, a bulb on a wooden pole, as in the real 2005
  //    Al Arabiya footage), then the courts. Nothing of the victims is drawn: candles, doors and empty rooms stand for them.
  //    Horror transitions: "smash" (white crack → black → the new frame flickers on), "flick" (a failing bulb), "glitch"
  //    (the frame tears sideways), "dip" (a slow fall to black). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = .55 * ease(u / d) + .45 * clamp(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  function D(i) { return LN[i].end - LN[i].start; }
  var YEL = "#f2c230", RED = "#c8261e", WOOD = "#6b4a30", WOOD_D = "#4a3220", PAPER = "#efe6d0", BULB = "#ffe7a8";
  var WALLS = ["#9fb3c4", "#c9c2b0", "#b9a68a", "#8fa6b8", "#d2cbb8"];
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.4 + hash(i + 1) * .9) + '" fill="#fff" opacity="' + f2(.25 + .45 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function flick(t, seed) { var a = Math.sin(t * 23 + seed) + Math.sin(t * 37.3 + seed * 2) + Math.sin(t * 5.1); return a > 1.7 ? .15 : a > 1.2 ? .55 : 1; }
  function fog(t, y, op, col) { var s = ""; for (var i = 0; i < 7; i++) { var w = 160 + hash(i + 40) * 140, x = ((hash(i * 9) * 760 + t * (6 + hash(i) * 6)) % 760) - 200; s += '<ellipse cx="' + f(x) + '" cy="' + f(y + hash(i + 3) * 40) + '" rx="' + f(w) + '" ry="' + f(18 + hash(i + 5) * 14) + '" fill="' + (col || "#8a93a8") + '" opacity="' + f2((op || .18) * (.6 + .4 * Math.sin(t * .4 + i))) + '" filter="url(#soft)"/>'; } return s; }
  function moon(x, y, t) { return '<circle cx="' + x + '" cy="' + y + '" r="34" fill="url(#lamp)" opacity=".25"/>' + Ci(x, y, 13, "#d8d4c4", { s: 0 }) + Ci(x + 6, y - 4, 12, "#0a0f1e", { s: 0 }) + '<ellipse cx="' + f(x - 30 + 14 * Math.sin(t * .2)) + '" cy="' + (y + 6) + '" rx="46" ry="7" fill="#1a2236" opacity=".8"/>'; }
  // a date palm: a leaning trunk with ring marks and a crown of fronds that sway
  function palm(x, y, s, t, col) {
    col = col || "#0c1018"; var g = "", lean = 6 * s, sw = Math.sin(t * .9 + x) * 2;
    g += P('M' + f(x - 3 * s) + ' ' + y + ' Q' + f(x + lean * .4) + ' ' + f(y - 60 * s) + ' ' + f(x + lean) + ' ' + f(y - 120 * s) + ' L' + f(x + lean + 4 * s) + ' ' + f(y - 120 * s) + ' Q' + f(x + lean * .4 + 5 * s) + ' ' + f(y - 60 * s) + ' ' + f(x + 3 * s) + ' ' + y + 'Z', col, { w: 1 });
    for (var k = 0; k < 9; k++) { var a = (k / 9) * 6.28 + sw * .05, cx = x + lean + 2 * s, cy = y - 122 * s, ex = cx + Math.cos(a) * 44 * s, ey = cy + Math.sin(a) * 18 * s + 16 * s + Math.abs(Math.cos(a)) * 10 * s;
      g += P('M' + f(cx) + ' ' + f(cy) + ' Q' + f((cx + ex) / 2) + ' ' + f(cy - 18 * s) + ' ' + f(ex) + ' ' + f(ey + sw) + ' Q' + f((cx + ex) / 2) + ' ' + f(cy - 10 * s) + ' ' + f(cx) + ' ' + f(cy + 3 * s) + 'Z', col, { w: .8 }); }
    return g;
  }
  // an Upper-Egypt village house: plastered wall, a flat roof stacked with palm fronds, a wooden door, small barred windows
  function vHouse(x, y, w, h, o) {
    o = o || {}; var wall = o.wall || WALLS[0], dk = o.dark == null ? .55 : o.dark, g = "", id = "vh" + (++CLN);
    g += '<clipPath id="' + id + '"><rect x="' + f(x + w * .62) + '" y="' + f(y - h - 20) + '" width="' + f(w) + '" height="' + f(h + 40) + '"/></clipPath>';
    g += cel('M' + f(x) + ' ' + f(y) + ' V' + f(y - h) + ' H' + f(x + w) + ' V' + f(y) + ' Z', wall, id, { w: 1.6 });
    g += R(x - 2, y - h - 4, w + 4, 5, darker(wall, .8), { w: 1.2 });   // parapet
    for (var k = 0; k < Math.floor(w / 9); k++) g += P('M' + f(x + 2 + k * 9) + ' ' + f(y - h - 4) + ' l' + f(4 + hash(k + x) * 6) + ' ' + f(-6 - hash(k + y) * 9) + ' l' + f(5) + ' ' + f(7) + 'Z', "#5a4a30", { w: .7 });   // palm fronds on the roof
    var dw = w * .26, dh = h * .62, dx = x + (o.doorX == null ? .37 : o.doorX) * w, open = o.door || 0;
    g += R(dx - 3, y - dh - 3, dw + 6, dh + 3, darker(wall, .7), { w: 1 });
    g += R(dx, y - dh, dw, dh, "#050608", { s: 0 });
    if (o.inner) g += '<rect x="' + f(dx) + '" y="' + f(y - dh) + '" width="' + f(dw) + '" height="' + f(dh) + '" fill="' + o.inner + '" opacity="' + f2(o.innerOp || .8) + '"/>';
    g += G('translate(' + f(dx) + ' 0) scale(' + f2(1 - open * .8) + ' 1) translate(' + f(-dx) + ' 0)', R(dx, y - dh, dw, dh, WOOD, { w: 1.2 }) + '<path d="M' + f(dx + dw / 2) + ' ' + f(y - dh) + ' V' + y + ' M' + f(dx) + ' ' + f(y - dh * .5) + ' H' + f(dx + dw) + '" stroke="' + WOOD_D + '" stroke-width="1"/>' + Ci(dx + dw * .8, y - dh * .48, 1.4, "#c9a860", { s: 0 }));
    (o.wins || [[.14, .36], [.72, .36]]).forEach(function (p, k) { var wx = x + p[0] * w, wy = y - h * (1 - p[1]) - 6, ww = w * .14, wh = h * .2, lit = o.lit && o.lit[k];
      g += R(wx, wy, ww, wh, lit ? (o.litCol || BULB) : "#07090d", { w: 1 }) + (lit ? '<rect x="' + f(wx - ww) + '" y="' + f(wy - wh) + '" width="' + f(ww * 3) + '" height="' + f(wh * 3) + '" fill="url(#warm)" opacity="' + f2(.35 * lit) + '"/>' : '');
      for (var b = 1; b < 3; b++) g += '<path d="M' + f(wx + ww * b / 3) + ' ' + f(wy) + ' v' + f(wh) + '" stroke="' + INK + '" stroke-width=".8"/>'; });
    g += '<rect x="' + f(x) + '" y="' + f(y - h - 6) + '" width="' + f(w) + '" height="' + f(h + 6) + '" fill="#020308" opacity="' + f2(dk) + '"/>';   // night falls on the wall
    return g;
  }
  function lampPost(x, y, s, t, o) { o = o || {}; var fl = o.off ? 0 : flick(t, x) * (o.k == null ? 1 : o.k); return '<circle cx="' + x + '" cy="' + f(y - 120 * s) + '" r="' + f(70 * s) + '" fill="url(#lamp)" opacity="' + f2(.5 * fl) + '"/>' + P('M' + f(x - 2 * s) + ' ' + y + ' L' + f(x - 1.4 * s) + ' ' + f(y - 124 * s) + ' L' + f(x + 1.4 * s) + ' ' + f(y - 124 * s) + ' L' + f(x + 2 * s) + ' ' + y + 'Z', "#2a2018", { w: .8 }) + '<path d="M' + x + ' ' + f(y - 122 * s) + ' h' + f(12 * s) + '" stroke="#2a2018" stroke-width="' + f(1.4 * s) + '"/>' + Ci(x + 12 * s, y - 119 * s, 3 * s, fl > .5 ? "#f4f6ff" : "#5a6070", { w: .6 }); }
  function ground(t, y, col) { return P('M-220 ' + y + ' Q60 ' + (y - 6) + ' 180 ' + y + ' T580 ' + (y - 4) + ' V1200 H-220 Z', col || "#1a1712", { s: 0 }) + '<path d="M-220 ' + (y + 30) + ' Q120 ' + (y + 22) + ' 580 ' + (y + 34) + '" stroke="#2a251c" stroke-width="10" opacity=".5"/>'; }
  // the hamlet at night, wide
  function villageNight(t, o) {
    o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 90, 300) + moon(286, 110, t), gy = o.gy || 420;
    s += palm(-10, gy - 40, 1.2, t) + palm(70, gy - 30, .9, t) + palm(320, gy - 36, 1.1, t) + palm(250, gy - 40, .8, t);
    s += fog(t, gy - 70, .1);
    var hs = [[-70, 70, 70, 4], [8, 66, 82, 0], [82, 74, 66, 1], [164, 62, 86, 3], [234, 78, 70, 2], [318, 70, 74, 4]];
    hs.forEach(function (h, k) { var lit = o.lights ? o.lights(k, t) : 0; s += vHouse(h[0], gy, h[1], h[2], { wall: WALLS[h[3]], dark: o.dark == null ? .5 : o.dark, lit: [lit, lit * .7] }); });
    s += ground(t, gy, "#13110d") + lampPost(o.lampX || 150, gy + 6, 1, t, { k: o.lamp == null ? 1 : o.lamp }) + fog(t, gy + 10, o.fog || .22);
    return s;
  }
  // the three houses of the story, close
  function three(t, o) {
    o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 60, 260) + (o.noMoon ? "" : moon(300, 96, t)) + palm(30, 330, 1.1, t) + palm(330, 322, 1, t), gy = 400;
    [[22, 96, 108, 0], [134, 92, 120, 1], [244, 98, 104, 3]].forEach(function (h, k) { var l = o.lit ? o.lit(k) : 0; s += vHouse(h[0], gy, h[1], h[2], { wall: WALLS[h[3]], dark: o.dark == null ? .5 : o.dark, lit: [l, l], door: o.door ? o.door(k) : 0, inner: o.inner, innerOp: o.innerOp }); });
    s += ground(t, gy, "#12100c") + lampPost(124, 406, .95, t, { k: o.lamp == null ? 1 : o.lamp, off: o.lampOff }) + fog(t, gy + 6, o.fog || .2);
    if (o.people) s += o.people;
    return s;
  }
  // an old CRT television in a dark room, the screen glowing blue
  function tv(x, y, s, t, o) {
    o = o || {}; var g = '<circle cx="0" cy="-10" r="150" fill="url(#lamp)" opacity="' + f2(.22 * (o.glow || 1) * (.85 + .15 * Math.sin(t * 9))) + '"/>';
    g += R(-78, -70, 156, 120, "#3a3630", { w: 2 }) + R(-70, -62, 112, 92, "#0c1420", { w: 1.6 }) + R(52, -50, 18, 70, "#2a2622", { w: 1 }) + Ci(61, -36, 4, "#8a8070") + Ci(61, -20, 4, "#8a8070") + R(-60, 50, 12, 14, "#2a2622", { w: 1 }) + R(48, 50, 12, 14, "#2a2622", { w: 1 }) + '<path d="M-20 -70 L-44 -112 M20 -70 L44 -116" stroke="#8a8070" stroke-width="2"/>';
    g += '<svg x="-70" y="-62" width="112" height="92" viewBox="0 0 112 92" overflow="hidden">' + (o.screen ? o.screen(t) : "") + '<rect width="112" height="92" fill="#9fc4e6" opacity=".08"/>';
    for (var k = 0; k < 23; k++) g += '<path d="M0 ' + (k * 4 + (t * 20) % 4) + ' h112" stroke="#000" stroke-width="1" opacity=".25"/>';
    if (o.static) for (var n = 0; n < 160; n++) g += '<rect x="' + f(hash(n + Math.floor(t * 24) * 7) * 112) + '" y="' + f(hash(n * 3 + Math.floor(t * 24)) * 92) + '" width="2" height="1.4" fill="#fff" opacity="' + f2(hash(n + 2) * o.static) + '"/>';
    g += '</svg>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }
  function room(t, op) { return R(-220, -220, 800, 1300, "#07080c", { s: 0 }) + P('M-220 430 L580 430 V900 H-220Z', "#120f0c", { s: 0 }) + R(-30, 300, 420, 6, "#1e1914", { s: 0 }) + dust(t, 30, "#9fb4d8", .25 * (op || 1), 4); }
  function screenVillage(t) { var s = '<rect width="112" height="92" fill="#1a2236"/>' + stars(t, 14, 40); [[4, 22, 26, 0], [30, 24, 30, 1], [58, 22, 24, 3], [84, 24, 28, 4]].forEach(function (h) { s += vHouse(h[0], 70, h[1], h[2], { wall: WALLS[h[3]], dark: .3 }); }); return s + R(0, 70, 112, 22, "#2a251c", { s: 0 }) + R(0, 78, 112, 14, "#b8222a", { s: 0 }) + txt("عاجل", 100, 88, 8, "#fff", { a: "end", wt: 900 }); }
  function rec(t, y, src) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="#e0662f"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".8"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt(src || "تسجيل حقيقي · قناة العربية · 2005", 288, y + 4, 12.5, "#fff", { a: "start" }) + b; }
  // a candle: ten of them stand for the ten who died
  function candle(x, y, s, t, i, k) { if (k <= 0) return ""; var fl = 1 + .2 * Math.sin(t * 9 + i * 2.1) + .1 * Math.sin(t * 23 + i); return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle cx="0" cy="-34" r="26" fill="url(#warm)" opacity="' + f2(.5 * k) + '"/>' + R(-5, -26, 10, 26, "#efe4cc", { w: 1 }) + '<path d="M0 -26 v-4" stroke="' + INK + '" stroke-width="1"/>' + G('translate(0 -30) scale(' + f2(k * fl) + ')', P('M0 0 Q-4 -6 0 -14 Q4 -6 0 0Z', "#ffcf6a", { w: .6 }) + P('M0 -1 Q-2 -5 0 -9 Q2 -5 0 -1Z', "#fff6dc", { s: 0 }))); }
  function candles(t, n, y, s, k) { var g = ""; for (var i = 0; i < n; i++) { var x = 180 + (i - (n - 1) / 2) * 30 * s; g += candle(x, y + (i % 2) * 10 * s, s, t, i, clamp(k * n - i)); } return g; }
  function paper(x, y, w, h, rot, o) { o = o || {}; var g = R(-w / 2, -h / 2, w, h, PAPER, { w: 1.4 }); for (var k = 0; k < (o.lines || 9); k++) g += '<path d="M' + f(-w / 2 + 12) + ' ' + f(-h / 2 + 34 + k * 11) + ' h' + f((w - 24) * (.6 + hash(k + (o.seed || 0)) * .4)) + '" stroke="#8a8270" stroke-width="2" opacity=".55"/>'; if (o.title) g += txt(o.title, 0, -h / 2 + 20, o.ts || 11, INK, { wt: 900 }); if (o.stamp) g += G('rotate(-14)', '<rect x="-40" y="' + f(h / 2 - 50) + '" width="80" height="26" rx="4" fill="none" stroke="' + RED + '" stroke-width="2.4" opacity="' + f2(o.stamp) + '"/>' + txt(o.stampText || "", 0, h / 2 - 32, 12, RED, { op: o.stamp, wt: 900 })); return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')', g, o.op); }
  function magnifier(x, y, s, t) { return G('translate(' + f(x + 4 * Math.sin(t * .9)) + ' ' + f(y + 3 * Math.cos(t * 1.1)) + ') scale(' + s + ')', '<circle r="30" fill="#bcd8ea" opacity=".18"/><circle r="30" fill="none" stroke="' + INK + '" stroke-width="7"/><circle r="30" fill="none" stroke="#b8a070" stroke-width="4"/><path d="M21 21 L52 52" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M21 21 L52 52" stroke="' + WOOD + '" stroke-width="8" stroke-linecap="round"/><path d="M-16 -14 q8 -10 20 -8" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/>'); }
  function galabeya(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * .8) * 2) + ') rotate(' + f(Math.sin(t * .6) * 2) + ') scale(' + s + ')', '<path d="M0 -150 v-14 q0 -8 8 -8" stroke="#8a8070" stroke-width="3" fill="none"/><path d="M-60 -132 L0 -150 L60 -132" stroke="#5a4a30" stroke-width="5" fill="none"/>' + cel('M-24 -146 Q0 -138 24 -146 L64 -126 L74 -70 L54 -66 L48 -100 L52 110 L-52 110 L-48 -100 L-54 -66 L-74 -70 L-64 -126 Z', "#cfc6b2", "gcl", { w: 2 }) + '<clipPath id="gcl"><rect x="10" y="-200" width="100" height="400"/></clipPath><path d="M0 -140 V-80" stroke="' + INK + '" stroke-width="1.4"/><path d="M-10 -146 Q0 -130 10 -146" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'); }
  function shoes(x, y, s) { var one = function (dx, r) { return G('translate(' + dx + ' 0) rotate(' + r + ')', cel('M-30 0 Q-34 -16 -16 -20 L10 -22 Q22 -30 30 -22 L34 -4 Q34 4 26 4 L-26 4 Q-32 4 -30 0Z', "#3a2a20", "shc", { w: 1.8 }) + '<path d="M-28 2 H30" stroke="#1a120c" stroke-width="3"/>'); }; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<clipPath id="shc"><rect x="-60" y="-8" width="120" height="20"/></clipPath>' + one(-34, -4) + one(34, 6)); }
  function gavel(x, y, s, a) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', R(-60, 30, 120, 18, WOOD_D, { w: 1.6, }) + G('rotate(' + f(a) + ' 40 20)', '<path d="M40 20 L-40 -10" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M40 20 L-40 -10" stroke="' + WOOD + '" stroke-width="6" stroke-linecap="round"/>' + G('rotate(-20 -46 -12)', R(-66, -30, 40, 36, WOOD, { w: 1.8 }) + R(-70, -26, 6, 28, WOOD_D, { w: 1.2 }) + R(-28, -26, 6, 28, WOOD_D, { w: 1.2 })))); }
  // an Egyptian criminal court: the bench under «العدل أساس الملك», the scales, the iron cage of the accused
  function court(t, o) {
    o = o || {}; var s = R(-220, -220, 800, 1300, "#1c140e", { s: 0 }) + R(-220, 90, 800, 360, "#3a2a1c", { s: 0 });
    for (var k = 0; k < 14; k++) s += R(-220 + k * 60, 90, 56, 360, k % 2 ? "#3e2d1f" : "#36271a", { s: 0 });
    s += '<circle cx="180" cy="150" r="120" fill="url(#warm)" opacity=".18"/>' + txt("العدل أساس الملك", 180, 128, 19, "#c9a860", { wt: 900 });
    s += G('translate(180 176) scale(.8)', '<path d="M0 -26 V30 M-40 -16 H40" stroke="#c9a860" stroke-width="3"/><path d="M-40 -16 L-52 8 H-28 Z M40 -16 L28 8 H52 Z" fill="none" stroke="#c9a860" stroke-width="2"/><path d="M-14 30 h28" stroke="#c9a860" stroke-width="4"/>');
    s += R(-40, 240, 440, 80, "#4a3422", { w: 2 }) + R(-40, 232, 440, 12, "#5a4430", { w: 1.6 }); for (var c = 0; c < 3; c++) s += R(118 + c * 50 - 16, 196, 32, 44, "#5a2a22", { w: 1.4 });
    if (o.cage !== false) { var cx = o.cageX == null ? 300 : o.cageX; s += R(cx - 60, 300, 130, 140, "rgba(0,0,0,.35)", { s: 0 }); for (var b = 0; b <= 13; b++) s += '<path d="M' + (cx - 60 + b * 10) + ' 290 V440" stroke="#5a5e66" stroke-width="2.4"/>'; s += '<path d="M' + (cx - 62) + ' 290 H' + (cx + 72) + ' M' + (cx - 62) + ' 360 H' + (cx + 72) + '" stroke="#5a5e66" stroke-width="3"/>'; if (o.inCage) s += shadowMan(cx + 4, 440, .95, t, .9); }
    s += R(-220, 420, 800, 600, "#120d09", { s: 0 }) + dust(t, 40, "#ffe7a8", .35, 2);
    return s;
  }
  function courthouse(t, o) { o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 40, 200), y = 400; s += R(30, y - 150, 300, 150, "#b8ad94", { w: 2 }) + P('M20 ' + (y - 150) + ' L180 ' + (y - 210) + ' L340 ' + (y - 150) + 'Z', "#a89d84", { w: 2 }); for (var c = 0; c < 6; c++) s += R(56 + c * 48, y - 140, 16, 140, "#d2c8ae", { w: 1.4 }); s += R(20, y - 6, 320, 10, "#8a8068", { w: 1.4 }) + txt(o.name || "محكمة جنايات المنيا", 180, y - 162, 13, INK, { wt: 900 }) + '<rect x="30" y="' + (y - 160) + '" width="300" height="170" fill="#020308" opacity="' + f2(o.dark == null ? .45 : o.dark) + '"/>' + P('M174 ' + (y - 210) + ' v-40', "none", { w: 2 }) + G('translate(176 ' + (y - 250) + ') skewY(' + f(Math.sin(t * 2) * 4) + ')', R(0, 0, 30, 6, "#c8261e", { s: 0 }) + R(0, 6, 30, 6, "#f4f2ec", { s: 0 }) + R(0, 12, 30, 6, "#141414", { s: 0 })); return s + ground(t, y + 4, "#16130e") + fog(t, y, .15); }
  function policeTruck(x, y, s, t) { var bl = Math.sin(t * 14) > 0; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle cx="-20" cy="-96" r="90" fill="' + (bl ? "#3a6aff" : "#ff3a3a") + '" opacity=".22" filter="url(#soft)"/>' + R(-90, -80, 130, 70, "#1e2a44", { w: 2 }) + R(40, -60, 50, 50, "#24314f", { w: 2 }) + R(48, -54, 28, 20, "#9fc4e6", { w: 1.2, }) + R(-84, -70, 118, 10, "#f4f2ec", { w: 1 }) + txt("الشرطة", -26, -38, 14, "#f4f2ec", { wt: 900 }) + Ci(-60, -6, 13, "#111") + Ci(60, -6, 13, "#111") + Ci(-60, -6, 5, "#5a5e66", { s: 0 }) + Ci(60, -6, 5, "#5a5e66", { s: 0 }) + R(-30, -90, 24, 10, bl ? "#5a8aff" : "#30364a", { w: 1 }) + R(-6, -90, 24, 10, bl ? "#30364a" : "#ff5a4a", { w: 1 })); }
  function smokeWord(w, x, y, t, k, x2) { if (k <= 0) return ""; var s = '<g opacity="' + f2(clamp(k)) + '">'; for (var i = 0; i < 6; i++) { var p = (t * .2 + hash(i + x)) % 1; s += '<circle cx="' + f(x + (hash(i) - .5) * 70) + '" cy="' + f(y - p * 60) + '" r="' + f(16 + 24 * p) + '" fill="#4a4a54" opacity="' + f2(.35 * (1 - p)) + '" filter="url(#soft)"/>'; } s += txt(w, x + Math.sin(t * .9 + x) * 8, y + Math.sin(t * 1.3 + x) * 7, 40, "#e9e2d2", { st: "rgba(0,0,0,.8)", sw: 5, wt: 900 }) + (x2 ? '<path d="M' + f(x - 44) + ' ' + f(y - 12) + ' L' + f(x - 44 + 88 * clamp(x2)) + ' ' + f(y - 12) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/>' : "") + '</g>'; return s; }
  function shadowMan(x, y, s, t, op) { return G('translate(' + f(x + Math.sin(t * .7) * 1.5) + ' ' + f(y) + ') scale(' + s + ')', P('M-16 0 L-14 -60 Q-26 -66 -24 -100 Q-20 -118 0 -120 Q-4 -134 0 -146 Q12 -152 16 -138 Q18 -126 10 -120 Q22 -116 24 -100 Q26 -66 14 -60 L16 0Z', "#010102", { s: 0 }), op); }
  function folder(x, y, s, t, k) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ') rotate(-4)', P('M-110 -70 h70 l12 12 h138 v140 h-220Z', "#c9a26a", { w: 2 }) + R(-110, -52, 220, 134, "#d8b47a", { w: 2 }) + txt("قضية رقم ٢٠٠٥", 0, -20, 13, "#5a4020", { wt: 800 }) + txt("بني مزار", 0, 4, 15, "#5a4020", { wt: 900 }) + (k > 0 ? G('translate(0 44) scale(' + f2(1 + 1.6 * (1 - eout(k))) + ') rotate(-10)', '<rect x="-74" y="-22" width="148" height="42" rx="5" fill="none" stroke="' + RED + '" stroke-width="4" opacity="' + f2(k) + '"/>' + txt("ضد مجهول", 0, 10, 26, RED, { wt: 900, op: k })) : "")); }
  function pill(u) { var k = eout(clamp((u - .3) / .4)); return G('translate(180 ' + f(150 - (1 - k) * 10) + ')', '<rect x="-92" y="-20" width="184" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + txt("اللينك في البايو ↑", 0, 7, 17, INK, { wt: 900 }), k); }
  function bulbRoom(t, k) { var sw = Math.sin(t * 1.4) * 14, fl = flick(t, 3) * k; return R(-220, -220, 800, 1300, "#050505", { s: 0 }) + G('translate(180 40) rotate(' + f(sw) + ')', '<path d="M0 0 V170" stroke="#2a2a2a" stroke-width="2"/>' + '<circle cx="0" cy="182" r="190" fill="url(#warm)" opacity="' + f2(.35 * fl) + '"/>' + Ci(0, 182, 10, fl > .5 ? BULB : "#3a3a3a", { w: 1.2 }) + R(-5, 166, 10, 8, "#5a5a5a", { w: 1 })) + P('M-220 470 L580 470 V900 H-220Z', "#0e0c0a", { s: 0 }) + '<ellipse cx="' + f(180 + sw * 6) + '" cy="474" rx="110" ry="14" fill="#ffe7a8" opacity="' + f2(.12 * fl) + '"/>'; }

  function photoCard(file, x, y, w, h, rot, k, cap) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y + (1 - eout(k)) * 14) + ') rotate(' + f(rot) + ')', '<rect x="' + (-w / 2 - 5) + '" y="' + (-h / 2 - 5) + '" width="' + (w + 10) + '" height="' + (h + 26) + '" fill="#f6f1e4" stroke="' + INK + '" stroke-width="1.4"/><image href="../photos/' + file + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/>' + '<text x="0" y="' + (h / 2 + 15) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="9.5" fill="#3a3428">' + (cap || "صورة حقيقية · 2005") + '</text>', k); }
  // a real photo card held in screen space (it does not ride the camera): [file, x, y, rot, caption]
  function card(c) { return function (u) { return photoCard(c[0], c[1], c[2], 150, 88, c[3], clamp((u - .5) / .5), c[4]); }; }
  // ═════════ the shots (line numbers from script.txt; 0, 17 and 45 are the real Al Arabiya recording) ═════════
  // 0 — the recording: «a hideous crime, unlike anything Egypt has seen» — the hamlet asleep, the bulb flickering
  shot(0, push([180, 300], [180, 320], 1.0, 1.16), function (u, d, t) { return villageNight(t, { lights: function (k) { return k === 2 ? .8 : 0; } }) + rec(t, 112); });
  // 1 — that voice is real: a television in a dark room, December 2005
  shot(1, push([180, 330], [180, 320], 1.1, 1.24), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage }) + label("قناة العربية", 180, 170, u, .4, 24, "#fff") + label("ديسمبر 2005", 180, 202, u, 1.2, 18, YEL); }, { tr: "flick" });
  // 2 — the night of 28 December, a small hamlet in Minya called Ezbet Shams El-Din
  shot(2, push([150, 320], [200, 326], 1.0, 1.12), function (u, d, t) { return villageNight(t, { lights: function (k) { return [.8, 0, .7, 0, .6, 0][k]; } }) + label("28 ديسمبر 2005", 180, 168, u, .3, 30, "#fff") + label("عزبة شمس الدين · المنيا", 180, 202, u, 1.0, 18, YEL); }, { card: card(["real-street.jpg", 252, 284, 4]), tr: "dip" });
  // 3 — a cold night; the hamlet goes to bed early: the windows go dark one by one
  shot(3, push([180, 330], [180, 340], 1.15, 1.25), function (u, d, t) { return villageNight(t, { fog: .35, lights: function (k) { return clamp(1 - (u - .6 - k * .5) * 3) * [.8, .6, .7, .5, .6, .4][k]; } }) + dust(t, 20, "#cfd8ea", .3, 8); }, { card: card(["real-house-lit.jpg", 112, 150, -4]) });
  // 4 — three houses side by side, three families
  shot(4, push([180, 320], [180, 314], 1.0, 1.08), function (u, d, t) { var s = three(t, { lit: function (k) { return .7; } }); [70, 194, 296].forEach(function (x, k) { s += label(["١", "٢", "٣"][k], x, 228, u, .4 + k * .5, 26, YEL); }); return s; }, { tr: "dip" });
  // 5 — before sunrise, ten of them were no longer alive: the lights die, smash to the number
  shot(5, push([180, 310], [180, 300], 1.0, 1.04), function (u, d, t) { var off = u > D(5) * .55; return three(t, { lit: function (k) { return off ? 0 : .7 * flick(t, k); }, lamp: off ? .25 : 1, dark: off ? .75 : .5 }) + (off ? '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".4"/>' + bigNum("10", 180, 236, u - D(5) * .55, 0, 96, "#e9e2d2") : ""); }, { tr: "smash" });
  // 6 — four of them children, the eldest eleven: four small candles
  shot(6, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 400 L580 400 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 4, 396, 1.6, clamp(u / 1.2)) + bigNum("4", 180, 200, u, .3, 70, "#e9e2d2") + label("أكبرهم 11 سنة", 180, 252, u, 1.4, 20, YEL) + dust(t, 20, "#ffe7a8", .3, 6); }, { tr: "dip" });
  // 7 — who walks into three houses in one night and leaves, unknown to this day? a door left ajar, the dark inside
  shot(7, push([180, 320], [180, 300], 1.0, 1.5), function (u, d, t) { var s = sky("skyVillage") + stars(t, 30, 160) + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .55, door: lerp(.12, .42, clamp(u / d)) + .05 * Math.sin(t * 1.3), doorX: .37 }) + ground(t, 470, "#0e0c09") + fog(t * 2, 460, .45) + dust(t * 2, 40, "#cfd8ea", .45, 11) + '<circle cx="' + f(180 + 90 * Math.sin(t * 1.1)) + '" cy="' + f(300 + 40 * Math.cos(t * .8)) + '" r="150" fill="url(#lamp)" opacity="' + f2(.16 * flick(t, 5)) + '"/>'; return s + '<path d="M150 470 L60 640 L120 640 Z" fill="#000" opacity=".5"/>' ; }, { ov: function (u) { return label("مين؟", 180, 200, u, D(7) * .55, 40, "#e9e2d2"); }, card: card(["real-door.jpg", 262, 392, 5]) });
  // 8 — and why did the court call the only accused innocent? the empty cage
  shot(8, push([240, 330], [270, 340], 1.1, 1.3), function (u, d, t) { return court(t) + label("بريء؟", 260, 216, u, D(8) * .45, 34, YEL); }, { tr: "glitch" });
  // 9 — the story of that night and the twenty years after; we start at dawn
  shot(9, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return villageNight(t, { sky: "skyVillage", dark: .5 }) + '<rect x="-220" y="-220" width="800" height="1300" fill="url(#skyDawnT)" opacity="' + f2(k * .4) + '"/>' + label("الليلة… و20 سنة بعدها", 180, 180, u, .4, 24, "#fff"); }, { tr: "dip" });
  // 10 — dawn: the people wake to what happened
  function dawnVillage(t, o) { o = o || {}; var s = sky("skyDawnGrey") + palm(-10, 380, 1.2, t, "#1a1c22") + palm(330, 384, 1.1, t, "#1a1c22") + fog(t, 330, .3, "#c9c2b6"); [[-60, 70, 70, 4], [14, 80, 82, 0], [96, 70, 66, 1], [170, 78, 86, 3], [250, 70, 70, 2], [322, 70, 74, 4]].forEach(function (h) { s += vHouse(h[0], 420, h[1], h[2], { wall: WALLS[h[3]], dark: .25 }); }); return s + ground(t, 420, "#4a4236") + fog(t, 426, .3, "#d8d0c4"); }
  shot(10, push([180, 330], [180, 340], 1.05, 1.15), function (u, d, t) { var s = dawnVillage(t); for (var i = 0; i < 5; i++) s += person(40 + i * 70 + Math.sin(t + i) * 4, 470 + (i % 2) * 14, 1.25, t, { walk: true, ph: i, flip: i % 2, top: i % 2 ? "#e6dfcc" : "#8a7a64", dress: i % 2 ? "#e6dfcc" : "#8a7a64", hat: i % 2 ? "turban" : "scarf", hatCol: i % 2 ? null : "#141218", skin: ["#b98058", "#a87048"][i % 2] }); return s; }, { tr: "flick" });
  // 11 — house after house; people standing at the doors, unable to believe it
  shot(11, push([180, 310], [180, 320], 1.0, 1.1), function (u, d, t) { var pp = ""; [[56, 0], [86, 1], [176, 2], [206, 3], [300, 4]].forEach(function (p, i) { pp += person(p[0], 478, 1.35, t, { view: "back", top: i % 2 ? "#141218" : "#d8d0bc", dress: i % 2 ? "#141218" : "#d8d0bc", hat: i % 2 ? "scarf" : "turban", hatCol: i % 2 ? "#141218" : null }); }); return three(t, { sky: "skyDawnGrey", noMoon: true, dark: .2, lampOff: true, fog: .35 }) + pp; }, { card: card(["real-mourners.jpg", 112, 156, -4, "صورة حقيقية · العزبة 2005"]) });
  // 12 — the victims were found in a way nobody had seen: a bare bulb swinging over an empty room
  shot(12, push([180, 300], [180, 300], 1.0, 1.12), function (u, d, t) { return bulbRoom(t, 1); }, { tr: "glitch" });
  // 13 — we will not tell those details, out of respect: ten candles
  // 13 — the killer did not stop at killing: the bulb swings, a shadow passes on the wall
  shot(13, push([180, 300], [180, 300], 1.05, 1.2), function (u, d, t) { return bulbRoom(t, 1) + G('translate(' + f(lerp(-60, 420, clamp(u / d))) + ' 0)', shadowMan(0, 470, 2.4, t, .55)) + '<rect x="-220" y="-220" width="800" height="1300" fill="#5a0a08" opacity="' + f2(.12 + .06 * Math.sin(t * 3)) + '"/>'; }, { tr: "smash" });
  // 14 — even the children: the four candles go out one by one
  shot(14, push([180, 330], [180, 330], 1.2, 1.3), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 400 L580 400 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 4, 396, 1.6, 1 - clamp((u - .3) / 1.6)) + dust(t * 2, 50, "#cfd8ea", .4, 6); }, { tr: "dip" });
  // 15 — the analysts said: someone who knew what he was doing, not one man alone: three shadows
  shot(15, push([180, 330], [180, 320], 1.0, 1.12), function (u, d, t) { return R(-220, -220, 800, 1300, "#07070a", { s: 0 }) + fog(t * 3, 430, .25, "#5a5a6a") + '<circle cx="' + f(180 + 90 * Math.sin(t * .9)) + '" cy="300" r="170" fill="url(#lamp)" opacity=".14"/>' + shadowMan(110, 470, 1.6, t, clamp((u - .8) / .6)) + shadowMan(180, 470, 1.8, t, clamp(u / .6)) + shadowMan(250, 470, 1.6, t, clamp((u - 1.4) / .6)) + label("مش شخص لوحده", 180, 160, u, D(15) * .55, 28, YEL); }, { tr: "glitch" });
  // 14 — the forensic report: heavy blows to the head
  shot(16, push([180, 330], [180, 320], 1.1, 1.25), function (u, d, t) { return R(-220, -220, 800, 1300, "#1a1612", { s: 0 }) + '<circle cx="180" cy="300" r="200" fill="url(#warm)" opacity=".2"/>' + paper(180, 320, 200, 250, -3, { title: "تقرير الطب الشرعي", lines: 14, stamp: clamp((u - 1.2) / .3), stampText: "سري" }) + magnifier(230, 300, 1.1, t); }, { tr: "flick" });
  // 15 — the news left the hamlet for every home in Egypt: a city of windows lit blue by televisions
  shot(17, push([180, 320], [180, 300], 1.0, 1.1), function (u, d, t) { var s = sky("skyVillage") + stars(t, 50, 200); for (var r = 0; r < 4; r++) for (var i = 0; i < 9; i++) { var x = -60 + i * 52 + (r % 2) * 26, y = 230 + r * 64, w = 46, h = 60; s += R(x, y, w, h + 30, ["#1a1e2a", "#20242f", "#171a24"][(i + r) % 3], { w: 1 }); for (var w2 = 0; w2 < 2; w2++) { var on = clamp(u * 2.5 - hash(i * 5 + r * 3 + w2) * 1.5); s += R(x + 7 + w2 * 20, y + 12, 12, 14, on > .5 ? "#9fc4ff" : "#0a0c12", { w: .7, op: on > .5 ? .6 + .4 * Math.sin(t * 8 + i + w2) : 1 }); } } return s + label("كل بيت في مصر", 180, 180, u, .8, 26, "#fff"); });
  // 16 — and the television said:
  shot(18, push([180, 330], [180, 330], 1.2, 1.45), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage, static: .3 }); });
  // 17 — the recording: «ten people from three families… in neighbouring houses»
  shot(19, push([180, 326], [180, 320], 1.0, 1.1), function (u, d, t) { return three(t, { lit: function () { return 0; }, dark: .6, lamp: .6 }) + rec(t, 112); }, { tr: "flick" });
  // 18 — the hamlet turned over: police, prosecutors, journalists (camera flashes)
  shot(20, push([180, 330], [190, 330], 1.0, 1.1), function (u, d, t) { var s = three(t, { sky: "skyDawnGrey", noMoon: true, dark: .3, lampOff: true }) + policeTruck(240, 470, 1.0, t); for (var i = 0; i < 4; i++) s += person(30 + i * 40, 486, 1.3, t, { view: "back", top: i === 1 ? "#1c2230" : "#d8d0bc", dress: i === 1 ? null : "#d8d0bc", pants: "#1c2230", cap: i === 1 ? "#1c2230" : null, hat: i === 1 ? null : "turban" }); var fl = (t * 3) % 1 < .06 ? 1 : 0; return s + (fl ? '<rect x="-220" y="-220" width="800" height="1300" fill="#fff" opacity=".22"/>' : "") + dust(t, 20, "#fff", .3, 9); }, { card: card(["real-day.jpg", 248, 156, 4, "صورة حقيقية · العزبة 2005"]), tr: "smash" });
  // 19–22 — the rumours: feud, sorcery, buried treasure — none proven
  function rumours(t, u, ks, x2) { var s = R(-220, -220, 800, 1300, "#07070a", { s: 0 }) + G('translate(' + f(-30 * Math.sin(t * .6)) + ' 0)', fog(t * 5, 300, .26, "#6a6a7a") + fog(t * 5, 420, .22, "#5a5a6a") + '<circle cx="' + f(180 + 110 * Math.sin(t * .9)) + '" cy="320" r="170" fill="url(#lamp)" opacity=".12"/>') + dust(t * 2, 60, "#dcd6ea", .55, 5); s += smokeWord("تار", 92, 230, t, ks[0], x2) + smokeWord("سحر", 268, 300, t, ks[1], x2) + smokeWord("كنز", 140, 380, t, ks[2], x2); return s; }
  shot(21, push([180, 320], [180, 310], 1.0, 1.08), function (u, d, t) { return rumours(t, u, [0, 0, 0]) + label("الحكايات", 180, 300, u, .1, 34, "#e9e2d2"); }, { tr: "dip" });
  shot(22, push([180, 310], [180, 320], 1.0, 1.1), function (u, d, t) { var dd = D(22); return rumours(t, u, [clamp(u / .5), clamp((u - dd * .38) / .5), clamp((u - dd * .7) / .5)]); });
  shot(23, push([180, 320], [180, 320], 1.1, 1.14), function (u, d, t) { return rumours(t, u, [1, 1, 1], clamp(u / .8)); });
  shot(24, push([180, 320], [180, 300], 1.14, 1.3), function (u, d, t) { return rumours(t, u, [1, 1, 1], 1) + label("افتكروا", 180, 160, u, .1, 30, YEL); });
  // 23–24 — not long after, the police announce an arrest: a young man led away (from behind; never his face)
  shot(25, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = sky("skyVillage") + stars(t, 40, 200) + palm(40, 380, 1, t) + ground(t, 400, "#12100c") + policeTruck(250, 440, 1.0, t); s += person(120, 470, 1.5, t, { view: "back", top: "#2a3048", pants: "#1c2230", cap: "#1c2230" }) + person(152, 470, 1.5, t, { view: "back", top: "#d8d0bc", dress: "#d8d0bc" }) + person(184, 470, 1.5, t, { view: "back", top: "#2a3048", pants: "#1c2230", cap: "#1c2230" }); return s + label("القبض على متهم", 180, 170, u, 1.2, 24, "#fff"); }, { tr: "smash" });
  shot(26, push([152, 380], [152, 370], 1.4, 1.6), function (u, d, t) { var s = sky("skyVillage") + ground(t, 400, "#12100c") + policeTruck(250, 440, 1.0, t) + person(152, 470, 1.5, t, { view: "back", top: "#d8d0bc", dress: "#d8d0bc" }); return s + bigNum("27", 152, 290, u, .2, 60, "#e9e2d2") + label("سنة", 152, 316, u, .5, 18, YEL); });
  // 25 — the investigation says he confessed to everything
  shot(27, push([180, 330], [180, 320], 1.1, 1.22), function (u, d, t) { var k = clamp(u / d); return R(-220, -220, 800, 1300, "#14110e", { s: 0 }) + '<circle cx="180" cy="200" r="160" fill="url(#lamp)" opacity=".2"/>' + paper(180, 330, 210, 270, 2, { title: "محضر اعتراف", lines: Math.floor(4 + k * 12), seed: 3 }) + G('translate(' + f(110 + k * 120) + ' ' + f(300 + k * 120) + ') rotate(35)', R(-4, -60, 8, 60, "#1e2a44", { w: 1 }) + P('M-4 0 L0 10 L4 0Z', "#c9a860", { w: .8 })); }, { tr: "flick" });
  // 26 — people calmed down; the case was over… so they thought
  shot(28, push([180, 320], [180, 330], 1.0, 1.08), function (u, d, t) { return dawnVillage(t) + label("خلصت؟", 180, 190, u, D(28) * .6, 32, "#e9e2d2"); }, { card: card(["real-dawn.jpg", 250, 288, 4]), tr: "dip" });
  // 27 — to the Minya criminal court
  shot(29, push([180, 300], [180, 310], 1.0, 1.1), function (u, d, t) { return courthouse(t) + label("محكمة جنايات المنيا", 180, 150, u, .3, 24, YEL); }, { tr: "dip" });
  // 28–29 — the judge opens the papers, page by page… and the court found something nobody expected
  function papers(t, u, fl) { var s = R(-220, -220, 800, 1300, "#1a1410", { s: 0 }) + '<circle cx="180" cy="300" r="190" fill="url(#warm)" opacity=".22"/>'; for (var i = 0; i < 6; i++) s += paper(180 + i * 2, 360 - i * 3, 220, 140, -6 + i * 2, { lines: 7, seed: i }); var p = (u * .9) % 1; if (fl) s += G('translate(180 340) scale(' + f2(Math.cos(p * Math.PI)) + ' 1)', paper(0, 0, 220, 140, 0, { lines: 7, seed: 9 })); return s + dust(t, 24, "#ffe7a8", .3, 2); }
  shot(30, push([180, 340], [180, 340], 1.1, 1.25), function (u, d, t) { return court(t, { cage: false }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".3"/>' + G('translate(0 60)', papers(t, u, true)); }, { tr: "glitch" });
  shot(31, push([180, 340], [180, 330], 1.25, 1.7), function (u, d, t) { return papers(t, u, false) + magnifier(180, 320, 1.6, t) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity="' + f2(clamp(u / d) * .35) + '"/>'; });
  // 30 — the bio line: the frame holds, the camera still creeps
  shot(32, push([180, 330], [180, 326], 1.7, 1.76), function (u, d, t) { return papers(t, u + D(31), false) + magnifier(180, 320, 1.6, t) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".35"/>' ; }, { ov: function (u) { return pill(u); } });
  // 31 — back to the court
  shot(33, push([180, 300], [180, 320], 1.0, 1.06), function (u, d, t) { return court(t, { cage: false }); }, { tr: "smash" });
  // 32 — the galabeya he was said to wear that night: not one drop of blood
  shot(34, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="290" r="200" fill="url(#lamp)" opacity=".22"/>' + galabeya(180, 340, 1.1, t) + magnifier(220, 300, 1.2, t) + bigNum("0", 90, 200, u, D(34) * .6, 70, "#e9e2d2") + label("نقطة دم", 90, 236, u, D(34) * .7, 18, YEL); }, { tr: "flick" });
  // 33 — the shoes: no trace of human blood
  shot(35, push([180, 340], [180, 334], 1.15, 1.3), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="340" r="180" fill="url(#lamp)" opacity=".2"/>' + rays(t, 40, 120, .9, 5, 500, .25) + shoes(180, 380, 1.6, t) + magnifier(160 + 70 * Math.sin(t * 1.2), 340, 1.1, t) + dust(t * 2, 40, "#ffe7a8", .45, 4) + label("مفيش دم", 180, 230, u, D(35) * .5, 28, YEL); });
  // 34 — imagine: ten, in three houses, and not one drop on his clothes
  shot(36, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 1.2) / 1.5); return three(t, { dark: .6, lamp: .5 }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity="' + f2(.35 * k) + '"/>' + G('translate(0 0)', galabeya(180, 330, .8 * k + .001, t), k) + bigNum("10", 70, 170, u, .4, 46, "#e9e2d2") + bigNum("3", 290, 170, u, 1.0, 46, "#e9e2d2"); }, { tr: "dip" });
  // 35 — one man, all of that, in that time? the court found it hard to believe: one shadow, ten candles, a clock
  shot(37, push([180, 330], [180, 320], 1.05, 1.15), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 420 L580 420 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 10, 416, .8, 1) + shadowMan(180, 360, 1.3, t, .95) + label("شخص واحد؟", 180, 150, u, .5, 30, "#e9e2d2"); }, { tr: "glitch" });
  // 36 — the medical reports do not match the witnesses: two papers that disagree
  shot(38, push([180, 320], [180, 320], 1.1, 1.18), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + paper(100, 320, 140, 190, -6, { title: "التقرير الطبي", lines: 10, seed: 2 }) + paper(262, 320, 140, 190, 5, { title: "أقوال الشهود", lines: 10, seed: 5 }) + G('translate(181 320)', xLine(clamp((u - .8) / .5))) + dust(t, 20, "#ffe7a8", .25, 3); });
  function xLine(k) { if (k <= 0) return ""; return '<path d="M-22 -22 L' + f(-22 + 44 * clamp(k * 2)) + ' ' + f(-22 + 44 * clamp(k * 2)) + '" stroke="' + RED + '" stroke-width="7" stroke-linecap="round"/>' + (k > .5 ? '<path d="M22 -22 L' + f(22 - 44 * clamp(k * 2 - 1)) + ' ' + f(-22 + 44 * clamp(k * 2 - 1)) + '" stroke="' + RED + '" stroke-width="7" stroke-linecap="round"/>' : ""); }
  // 37 — the confession itself, taken under pressure and coercion: the paper, a shadow hand over it
  shot(39, push([180, 330], [180, 320], 1.1, 1.25), function (u, d, t) { var k = clamp((u - D(39) * .5) / 1); return R(-220, -220, 800, 1300, "#0e0c0a", { s: 0 }) + paper(180, 330, 210, 270, 2, { title: "محضر اعتراف", lines: 16, seed: 3, stamp: k, stampText: "إكراه" }) + '<path d="M-60 120 Q60 200 130 260 Q160 250 190 290 Q150 300 120 280 L-60 200Z" fill="#000" opacity="' + f2(.55 + .1 * Math.sin(t * 1.4)) + '"/>'; }, { tr: "flick" });
  // 38 — September 2006, the verdict is read: the court, a heartbeat
  shot(40, push([180, 300], [180, 270], 1.0, 1.35), function (u, d, t) { return court(t, { inCage: true }) ; }, { tr: "dip", ov: function (u) { return bigNum("سبتمبر 2006", 180, 300, u, .3, 34, "#e9e2d2"); } });
  // 39 — «براءة»: smash cut, the gavel comes down
  shot(41, push([180, 320], [180, 320], 1.1, 1.0), function (u, d, t) { var a = u < .15 ? lerp(-40, 0, u / .15) : 0; return court(t, { cage: false }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".45"/>' + gavel(180, 380, 1.4, a) + txt("براءة", 180, 230, 64, YEL, { st: "rgba(0,0,0,.85)", sw: 6, wt: 900, op: clamp(u / .2) }); }, { tr: "smash" });
  // 40 — the prosecution appealed, the victims' families appealed
  shot(42, push([180, 320], [180, 320], 1.1, 1.16), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + paper(110, 320, 140, 190, -6, { title: "طعن النيابة", lines: 10, stamp: clamp(u / .4), stampText: "طعن" }) + paper(252, 320, 140, 190, 5, { title: "طعن الأهالي", lines: 10, seed: 4, stamp: clamp((u - D(42) * .5) / .4), stampText: "طعن" }); }, { tr: "flick" });
  // 41 — 22 December 2008: the Court of Cassation upholds the acquittal; the last word
  shot(43, push([180, 300], [180, 310], 1.0, 1.1), function (u, d, t) { return courthouse(t, { name: "محكمة النقض · القاهرة", dark: .35 }) + label("22 ديسمبر 2008", 180, 150, u, .4, 28, "#fff") + label("تأييد البراءة", 180, 182, u, D(43) * .5, 20, YEL); }, { tr: "dip" });
  // 42 — innocent, by a final ruling
  shot(44, push([180, 320], [180, 310], 1.1, 1.2), function (u, d, t) { return court(t, { cage: true }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".35"/>' + label("بريء", 180, 210, u, .4, 44, YEL) + label("حكم نهائي", 180, 246, u, 1.2, 20, "#fff"); });
  // 43 — so who did it? a shadow in a doorway
  shot(45, push([180, 330], [180, 320], 1.2, 1.4), function (u, d, t) { var s = sky("skyVillage") + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .6, door: .8, doorX: .37, inner: "#000" }) + ground(t, 470, "#0e0c09") + fog(t, 460, .3); return s + G('translate(0 0)', shadowMan(180, 470, 1.25, t, .95)) ; }, { tr: "glitch", ov: function (u) { return label("مين؟", 180, 200, u, .2, 40, "#e9e2d2"); } });
  // 44 — nobody knows: the doorway is empty
  shot(46, push([180, 320], [180, 316], 1.4, 1.44), function (u, d, t) { return sky("skyVillage") + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .7, door: .8, doorX: .37, inner: "#000" }) + ground(t, 470, "#0e0c09") + fog(t, 460, .35); }, { tr: "smash" });
  // 45 — the recording: «everyone ends where they began… at point zero» — the TV, static creeping in
  shot(47, push([180, 330], [180, 330], 1.2, 1.36), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage, static: clamp(u / d) * .9 }) + rec(t, 112); }, { tr: "flick" });
  // 46 — remember the rumours? none proven, to this day
  shot(48, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { var k = .35 + .65 * clamp(1 - (u - D(48) * .6) / 1.2); return rumours(t, u, [k, k, k], 1) + G('translate(' + f(90 * Math.sin(t * 1.1)) + ' 0)', '<circle cx="180" cy="300" r="170" fill="url(#lamp)" opacity=".2"/>'); }, { tr: "dip" });
  // 47 — the file is closed, two words written on it: «ضد مجهول»
  shot(49, push([180, 320], [180, 320], 1.05, 1.15), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="300" r="200" fill="url(#warm)" opacity=".18"/>' + folder(180, 320, 1.15, t, clamp((u - D(49) * .55) / .25)); }, { tr: "smash" });
  // 48 — in Ezbet Shams El-Din, three houses still remember the night of 28 December
  shot(50, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) { return three(t, { lit: function (k) { return .55 + .1 * Math.sin(t + k); }, dark: .55 }) + label("عزبة شمس الدين", 180, 176, u, .4, 26, "#fff"); }, { tr: "dip" });
  // 49 — their families still wait for an answer, twenty years on
  // 51 — the families still wait, twenty years on: ten empty frames on a wall, each with a black mourning ribbon
  //       (four smaller for the children); no faces, no names, candle light flickering over them
  function frames(t, k) {
    var s = R(-220, -220, 800, 1300, "#1a1410", { s: 0 }) + R(-220, 380, 800, 600, "#0e0a08", { s: 0 }), fl = .8 + .2 * Math.sin(t * 7) * Math.sin(t * 3.1);
    s += '<circle cx="' + f(180 + 30 * Math.sin(t * .7)) + '" cy="300" r="230" fill="url(#warm)" opacity="' + f2(.22 * fl) + '"/>';
    var spots = [[60, 170, 1], [130, 160, 1], [200, 170, 1], [270, 160, 1], [95, 265, 1], [235, 265, 1], [40, 345, 0], [110, 352, 0], [250, 352, 0], [320, 345, 0]];
    spots.forEach(function (q, n) { var kk = clamp(k * 10 - n), w = q[2] ? 52 : 38, h = q[2] ? 66 : 48; if (kk <= 0) return;
      s += G('translate(' + q[0] + ' ' + f(q[1] + (1 - eout(kk)) * 8) + ') rotate(' + f((hash(n) - .5) * 4) + ')', R(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, "#5a4026", { w: 1.4 }) + R(-w / 2, -h / 2, w, h, "#2a2622", { w: 1 }) + '<ellipse cx="0" cy="' + f(h * .12) + '" rx="' + f(w * .26) + '" ry="' + f(h * .3) + '" fill="#1c1916"/><circle cx="0" cy="' + f(-h * .18) + '" r="' + f(w * .17) + '" fill="#1c1916"/>' + P('M' + f(w / 2 - 14) + ' ' + f(-h / 2 - 5) + ' L' + f(w / 2 + 5) + ' ' + f(-h / 2 + 14) + ' L' + f(w / 2 + 5) + ' ' + f(-h / 2 + 4) + ' L' + f(w / 2 - 4) + ' ' + f(-h / 2 - 5) + 'Z', "#050505", { w: .6 }), kk); });
    return s + candles(t, 3, 420, .9, 1) + dust(t * 2, 40, "#ffe7a8", .4, 7);
  }
  shot(51, push([180, 300], [180, 290], 1.0, 1.08), function (u, d, t) { return frames(t, clamp(u / 1.6)) + bigNum("20 سنة", 180, 100, u, 1.8, 40, "#e9e2d2"); });
  // 50 — tell us: which story next time?
  shot(52, push([180, 320], [180, 316], 1.0, 1.06), function (u, d, t) { return villageNight(t, { lights: function (k) { return .5; } }) + label("قولولنا!", 180, 180, u, .3, 34, "#fff"); }, { tr: "dip" });

  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 9) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * 1.0), z = c[2] * (1 + .02 * Math.sin(t * .7)); return '<g transform="translate(180 320) rotate(' + f(.4 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  // the horror cuts
  function trans(kind, u, prev, cur) {
    if (kind === "smash") {   // a white crack (with moving rays), then black, then the new frame stutters on
      if (u < .06) return cur + '<rect x="-20" y="-20" width="400" height="680" fill="#f4f2ec" opacity=".85"/>' + rays(u * 40, 180, 300, 1.2, 7, 500, .6);
      if (u < .22) return '<rect width="360" height="640" fill="#000"/>' + dust(u * 30, 30, "#fff", .4, 1);
      if (u < .5) return '<g opacity="' + (Math.sin(u * 90) > -.2 ? 1 : .25) + '">' + cur + '</g>';
      return cur;
    }
    if (kind === "flick") { if (u < .45) return '<g opacity="' + f2(Math.sin(u * 70) > 0 ? clamp(u / .45) : .05) + '">' + cur + '</g>'; return cur; }
    if (kind === "glitch") {
      if (u < .3) { var s = '<rect width="360" height="640" fill="#000"/>'; for (var k = 0; k < 8; k++) { var y = k * 80, dx = (hash(k + Math.floor(u * 40)) - .5) * 60 * (1 - u / .3); s += '<svg x="0" y="' + y + '" width="360" height="80" viewBox="0 ' + y + ' 360 80" overflow="hidden"><g transform="translate(' + f(dx) + ' 0)">' + (u < .15 && k % 2 ? prev : cur) + '</g></svg>'; } return s + '<rect width="360" height="640" fill="#c8261e" opacity="' + f2(.12 * (1 - u / .3)) + '"/>'; }
      return cur;
    }
    if (kind === "dip") { if (u < .3) return prev + '<rect width="360" height="640" fill="#000" opacity="' + f2(u / .3) + '"/>'; if (u < .7) return cur + '<rect width="360" height="640" fill="#000" opacity="' + f2(1 - (u - .3) / .4) + '"/>'; return cur; }
    return u < .35 ? prev + '<g opacity="' + f2(ease(u / .35)) + '">' + cur + '</g>' : cur;
  }
  window.__panel = function (svg, t) {
    CLN = 0; SH.sort(function (p, q) { return p.a - q.a; });
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, cur = drawShot(sh, t, next) + (sh.o.ov ? sh.o.ov(u, next - sh.a, t) : "") + (sh.o.card ? sh.o.card(u) : ""), s;
    if (i > 0 && u < .75) { var pv = SH[i - 1]; s = trans(sh.o.tr, u, (sh.o.tr === "glitch" || sh.o.tr === "dip" || !sh.o.tr) ? drawShot(pv, t, sh.a) : "", cur); }
    else s = cur;
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" fill="url(#vig)" opacity=".5"/><rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
