  // ══ «سالم إكسبريس» (14 December 1991): the pieces this story adds on top of the Salam 98 kit above ══
  //    The ship is drawn from the real photograph of her as the Fred Scamaroni (Marseille, 1966, photos/scamaroni-1966.jpg):
  //    a long white hull with a dark boot-topping, a raked bow with the big bow visor that lifts up for the car deck, a
  //    three-deck superstructure forward with the bridge, long passenger decks aft with a row of lifeboats, twin black-topped
  //    funnels aft. The map uses the real coastlines (Natural Earth through lib/geo.min.js); the wreck position is the one
  //    printed in the January 1992 dive video (26°39′01″N 34°03′48″E). People: the shared person kit.
  function blink(t, e, seed) { return ((t + (seed || 0)) * 1000) % 3900 < 130 ? .05 : e; }
  var WY = 380, SHIPW = "#f2efe6", SHIPD = "#cfc9ba", BOOT2 = "#2a2e36", FUN = "#1c1e24", WIN2 = "#ffd98a";
  function salem(o) {
    var t = o.t || 0, g = "", lit = o.lit, id = "sx" + (++CLIPN);
    if (o.smoke) for (var i = 0; i < 6; i++) { var p = (t * .22 + i / 6) % 1; g += '<circle cx="' + f(372 + p * 140) + '" cy="' + f(-214 - p * 34 + 5 * Math.sin(t + i)) + '" r="' + f(6 + 14 * p) + '" fill="#5f5a54" opacity="' + f2(.4 * (1 - p)) + '"/>'; }
    g += '<path d="M150 -160 V-226 M138 -212 h24 M142 -198 h16" stroke="' + INK + '" stroke-width="2.2"/>';   // the mast over the bridge
    [[340, -206], [392, -204]].forEach(function (q) { g += P("M" + q[0] + " -96 L" + (q[0] + 4) + " " + q[1] + " L" + (q[0] + 30) + " " + q[1] + " L" + (q[0] + 34) + " -96 Z", SHIPW, { w: 2 }) + P("M" + (q[0] + 4) + " " + q[1] + " L" + (q[0] + 30) + " " + q[1] + " L" + (q[0] + 31) + " " + (q[1] + 30) + " L" + (q[0] + 3) + " " + (q[1] + 30) + " Z", FUN, { w: 1.6 }); });
    // superstructure forward: three decks and the bridge; aft: the long passenger deck with the lifeboats
    g += R(70, -100, 210, 38, SHIPW, { w: 2 }) + R(84, -134, 176, 34, SHIPW, { w: 2 }) + R(102, -160, 100, 26, SHIPW, { w: 2 });
    for (var x = 82; x < 272; x += 15) g += R(x, -90, 8, 10, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var x2 = 96; x2 < 252; x2 += 16) g += R(x2, -125, 8, 10, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var x3 = 110; x3 < 196; x3 += 13) g += R(x3, -154, 9, 10, lit ? "#ffe8b0" : "#2a3442", { w: .8 });
    g += R(280, -96, 222, 34, SHIPW, { w: 2 });
    for (var x4 = 292; x4 < 496; x4 += 15) g += R(x4, -86, 8, 9, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var b = 0; b < 5; b++) g += P("M" + (292 + b * 42) + " -104 Q" + (310 + b * 42) + " -114 " + (328 + b * 42) + " -104 L" + (324 + b * 42) + " -98 L" + (296 + b * 42) + " -98 Z", "#f4f1ea", { w: 1.4 }) + R(306 + b * 42, -110, 6, 3, "#e0662f", { s: 0 });
    // the hull: white, a dark boot-topping at the waterline, a row of portholes, the name at the bow
    var hull = "M14 -62 L522 -62 L524 -20 Q520 2 500 4 L48 4 Q30 2 22 -10 Z";
    g += P(hull, SHIPW, { w: 2.4 }) + '<clipPath id="' + id + '"><path d="' + hull + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(0, -10, 540, 20, BOOT2, { s: 0 }) + R(0, -36, 540, 26, "#000", { s: 0, op: .08 }) + '</g>';
    for (var x5 = 70; x5 < 510; x5 += 13) g += Ci(x5, -26, 2.2, lit ? WIN2 : "#2a3442", { w: .6 });
    g += '<path d="M14 -62 H522" stroke="' + INK + '" stroke-width="3"/>';
    if (!o.noname) g += G("", txt("SALEM EXPRESS", 120, -42, 11, "#1c2a4a", { font: "Noto Serif", wt: 700, ls: .5 }));
    if (o.hole) g += P("M34 -12 L46 -24 L58 -14 L52 -4 L40 -2 Z", "#0a0e14", { w: 1.4 });
    // the bow visor: hinged at its top aft corner (60, -62); o.visor = degrees it is lifted
    var vis = P("M14 -62 L62 -62 L62 -12 L24 -12 Q16 -30 14 -62 Z", SHIPW, { w: 2.2 }) + R(14, -14, 48, 6, BOOT2, { s: 0, op: .9 });
    g += G("rotate(" + f(-(o.visor || 0)) + " 62 -62)", vis);
    if (o.lights !== false && lit) g += Ci(150, -226, 2.6, "#ff5a4a", { s: 0, op: .6 + .4 * Math.sin(t * 3) }) + Ci(520, -64, 2.4, "#ffffff", { s: 0 });
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f2((o.s || 1) * (o.dir || 1)) + " " + f2(o.s || 1) + ")", g);
  }
  function shipAt(x, y, s, t, o) { return salem(Object.assign({ x: x - 268 * s, y: y + 1.4 * Math.sin(t * 1.3), s: s, t: t, rot: 1.2 * Math.sin(t * .9) }, o || {})); }
  function rain(t, n, op) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 520 + t * 120) % 520) - 80, y = ((hash(i * 7) * 760 + t * 520) % 760) - 60; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-6 16" stroke="#b8c8dc" stroke-width="1" opacity="' + f2(op || .35) + '"/>'; } return s; }
  function waves(t, wy, h) { var s = ""; for (var k = 0; k < 4; k++) { var d = "M-220 " + f(wy + k * 30); for (var x = -220; x <= 580; x += 12) d += " L" + x + " " + f(wy + k * 30 + (h || 8) * Math.sin(x * .03 + t * (1.4 + k * .3) + k)); s += '<path d="' + d + ' L580 900 L-220 900 Z" fill="' + ["#16284a", "#11213e", "#0c1a32", "#081428"][k] + '" stroke="#5a86b8" stroke-width="1" opacity=".95"/>'; } return s; }
  function stormNight(t, wy) { return sky("skyStar") + cloudBank(t, 80, 10, 6, "#1a2236", .9, 1.4) + cloudBank(t, 150, -8, 5, "#232c44", .8, 1.2) + (Math.sin(t * 1.7) > .97 ? R(-220, -220, 800, 1300, "#cfe0ff", { s: 0, op: .25 }) : ""); }
  // a reef just under the surface: coral heads and the white break of the waves on them
  function reef(x, y, s, t) { var g = ""; for (var i = 0; i < 9; i++) { var rx = (hash(i * 3) - .5) * 160, ry = hash(i * 5) * 20; g += P("M" + f(rx - 20) + " " + f(ry + 20) + " Q" + f(rx - 14) + " " + f(ry - 8) + " " + f(rx) + " " + f(ry - 12) + " Q" + f(rx + 14) + " " + f(ry - 8) + " " + f(rx + 20) + " " + f(ry + 20) + " Z", ["#8a7a5a", "#a08a62", "#7a6a4e"][i % 3], { w: 1.2 }); }
    for (var j = 0; j < 7; j++) { var p = (t * .5 + j / 7) % 1; g += '<path d="M' + f(-80 + j * 26) + ' ' + f(-4 + p * 6) + ' q8 -6 16 0" stroke="#fff" stroke-width="2" fill="none" opacity="' + f2(.8 * (1 - p)) + '"/>'; }
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g); }
  // people: pilgrims in white galabeyas, women in black with headscarves, all from the person kit
  var PILG = [{ outfit: "galabeya", colors: { hair: "#2a2018", skin: "#c98f66" } }, { outfit: "galabeya", colors: { hair: "#d8d4cc", skin: "#b98058" } }, { outfit: { base: "galabeya", hat: "hijab", colors: { coat: "#2a2a34", coatD: "#1a1a22", shirt: "#2a2a34", shirtD: "#1a1a22", hat: "#3a3a4a", hatD: "#22222c" } }, colors: { skin: "#d9a57a" } }, { outfit: "galabeya", colors: { hair: "#3a2a20", skin: "#a8724c", shirt: "#d8d0bc", coat: "#d8d0bc" } }, { outfit: { base: "galabeya", hat: "hijab", colors: { coat: "#3a2e3a", coatD: "#241c24", shirt: "#3a2e3a", shirtD: "#241c24", hat: "#5a4a5a", hatD: "#3a2e3a" } }, colors: { skin: "#c98f66" } }];
  function pil(i, o) { var b = PILG[i % PILG.length], p = Object.assign({ legs: "stand" }, b, o); p.colors = Object.assign({}, b.colors, o.colors || {}); return PERSON.front(p).svg; }
  function pilWalk(i, x, floor, s, ph, dir, o) { var b = PILG[i % PILG.length], p = Object.assign({ x: x, s: s, dir: dir || 1, lean: 3, outfit: b.outfit, colors: Object.assign({}, b.colors), head: { tilt: 2 * Math.sin(ph * 2) }, face: { eyes: 1, mouth: "smile" } }, PERSON.walkPose(ph, 1), o || {}); p.y = PERSON.sideHipY(p, floor); return PERSON.side(p).svg; }
  function bag(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", R(-16, -20, 32, 20, col || "#7a4a2a", { w: 1.4 }) + P("M-8 -20 Q0 -30 8 -20", "none", { w: 1.6 })); }
  function swimmerN(x, y, s, t, i, o) {   // a person in the night sea up to the chest
    o = o || {}; var b = PILG[i % PILG.length], p = Object.assign({}, b, { x: x, y: y + 60 * s, s: s, legs: "stand", breath: (Math.sin(t * 6 + i) + 1) / 2, head: { tilt: 6 * Math.sin(t * 2.4 + i) }, face: { eyes: 1.1, brows: "worried", mouth: i % 2 ? "open" : "o" }, arms: [{ rel: [-46, -20 + 20 * Math.sin(t * 3 + i)], hand: "open", bend: 1 }, { rel: [46, -20 + 20 * Math.cos(t * 3 + i)], hand: "open", bend: -1 }] }); p.colors = Object.assign({}, b.colors);
    var wl = y + 60 * s - 136 * s, cid = "sn" + (++CLIPN);
    return '<clipPath id="' + cid + '"><rect x="' + f(x - 300 * s) + '" y="' + f(wl - 600 * s) + '" width="' + f(600 * s) + '" height="' + f(600 * s) + '"/></clipPath><g clip-path="url(#' + cid + ')">' + PERSON.front(p).svg + '</g><ellipse cx="' + f(x) + '" cy="' + f(wl) + '" rx="' + f(60 * s) + '" ry="' + f(9 * s) + '" fill="none" stroke="#8ab0d8" stroke-width="' + f(2.4 * s) + '" opacity=".7"/>';
  }
  // ── the map: the Red Sea between Jeddah and Safaga, real coastlines ──
  var JED = [39.17, 21.49], SAF = [33.94, 26.74], DUB = [35.69, 27.35], WRK = [34.0633, 26.6503];
  var ROUTE = [[39.10, 21.52], [38.6, 22.1], [37.7, 23.3], [36.7, 24.6], [35.6, 25.7], [34.6, 26.35], [34.2, 26.58], WRK];
  var MG = {};
  function mapAt(key, cx, cy, sc, lon, lat) { return MG[key] || (MG[key] = GEO.globe(cx, cy, sc, lon, lat)); }
  function wideMap() { return mapAt("w", 180, 270, 2600, 36.5, 24.2); }
  function zoomMap() { return mapAt("z", 180, 280, 52000, 34.08, 26.66); }
  function seaChart(t, g, o) {
    o = o || {}; var s = R(-300, -300, 960, 1300, "#12406a", { s: 0 });
    for (var i = 0; i < 16; i++) s += '<path d="M' + f(-60 + ((i * 97 + t * 6) % 480)) + ' ' + (40 + i * 36) + ' q6 -4 12 0 t12 0" stroke="#4a86b8" stroke-width="1.2" fill="none" opacity=".55"/>';
    s += '<path d="' + g.land + '" fill="#d8bf8a" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
    return s;
  }
  function routeD(g, pts, k) { var P2 = pts.map(function (p) { return g.project(p); }), n = (P2.length - 1) * clamp(k), i = Math.floor(n), fr = n - i, d = "M" + f(P2[0][0]) + " " + f(P2[0][1]); for (var j = 1; j <= i; j++) d += " L" + f(P2[j][0]) + " " + f(P2[j][1]); var end = i < P2.length - 1 ? [lerp(P2[i][0], P2[i + 1][0], fr), lerp(P2[i][1], P2[i + 1][1], fr)] : P2[P2.length - 1]; if (i < P2.length - 1) d += " L" + f(end[0]) + " " + f(end[1]); return { d: d, end: end }; }
  function routeLine(g, pts, k, col, o) { o = o || {}; var r = routeD(g, pts, k); return '<path d="' + r.d + '" stroke="' + INK + '" stroke-width="' + ((o.w || 4) + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/><path d="' + r.d + '" stroke="' + col + '" stroke-width="' + (o.w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>' + (o.ship ? miniShip2(r.end, o.t || 0) : ""); }
  function miniShip2(p, t) { return salem({ x: p[0] - 268 * .07, y: p[1] + 4, s: .07, t: t }) + '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(12 + 3 * Math.sin(t * 3)) + '" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>'; }
  function cityPin(g, ll, name, dx, dy, k) { var p = g.project(ll); return pin(p, name, dx, dy, k); }
  function countryLabel(g, ll, name, k) { var p = g.project(ll); return txt(name, p[0], p[1], 18, "#5a4422", { op: clamp(k), wt: 900 }); }
  function wide(t, o) { o = o || {}; var g = wideMap(), s = seaChart(t, g); s += countryLabel(g, [31.6, 25.4], "مصر", 1) + countryLabel(g, [40.6, 24.6], "السعودية", 1) + G("translate(0 0)", txt("البحر الأحمر", g.project([37.4, 22.6])[0], g.project([37.4, 22.6])[1], 13, "#bfe0ff", { op: .8 })); s += cityPin(g, JED, "جدة", 0, 22, 1) + cityPin(g, SAF, "سفاجا", -6, -14, 1) + (o.duba ? cityPin(g, DUB, "ضبا", 10, -12, 1) : ""); return { g: g, s: s }; }
  function zoomed(t) { var g = zoomMap(), s = seaChart(t, g); var w = g.project(WRK), sf = g.project(SAF); s += pin(sf, "سفاجا", -24, 6, 1); var reefs = [[34.075, 26.635], [34.09, 26.66], [34.05, 26.66], [34.11, 26.62], [34.04, 26.63]]; reefs.forEach(function (r, i) { var p = g.project(r); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(22 + hash(i) * 14) + '" ry="' + f(10 + hash(i + 2) * 6) + '" fill="#4ab0b0" stroke="#e8f4f0" stroke-width="1.6" stroke-dasharray="3 3" opacity=".85"/>'; }); return { g: g, s: s, w: w }; }
  var NORMAL = [[34.35, 26.35], [34.25, 26.52], [34.16, 26.62], [34.13, 26.70], [34.02, 26.75], SAF], SHORT = [[34.35, 26.35], [34.2, 26.5], [34.1, 26.6], WRK];
  function recS(t, y, src) { var b = ""; y = y || 70; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".82"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt(src, 288, y + 4, 12, "#fff", { a: "start" }) + b; }
  var SURV = "شهادة حقيقية · محمود عبد العزيز، من الناجين";
  // under the sea: the blue water column, light from above, the wreck on its starboard side, fish, a diver
  function underSea(t) { return R(-220, -220, 800, 1300, "url(#deepSea)", { s: 0 }) + rays(t, 200, -60, 1.6, 6, 600, .14) + dust(t, 50, "#bfe2ff", .5, 7) + R(-220, 470, 800, 400, "#c8b48a", { w: 1.6 }) + P("M-220 470 Q0 450 180 468 T580 462 L580 480 L-220 480 Z", "#a8946a", { s: 0 }); }
  function wreckSide(x, y, s, t) { var g = salem({ x: -270, y: 0, s: 1, t: t, rot: -5, visor: 8, noname: 0 }); for (var i = 0; i < 26; i++) { var cx = -250 + hash(i * 3) * 500, cy = -hash(i * 7) * 150 - 10; g += Ci(cx, cy, 3 + hash(i) * 8, ["#c86a4a", "#e8a04a", "#8ac07a", "#b84a7a"][i % 4], { w: .8, op: .9 }); } g += R(-320, -260, 640, 280, "#0e4a72", { s: 0, op: .45 }) + P("M-320 0 Q0 -20 320 4 L320 60 L-320 60 Z", "#c8b48a", { w: 1.4 }); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g); }
  function fish(t, n, y0) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 600 + t * (14 + hash(i + 3) * 20)) % 600) - 120, y = y0 + hash(i * 5) * 200 + 6 * Math.sin(t * 2 + i); s += G("translate(" + f(x) + " " + f(y) + ")", P("M0 0 Q8 -5 16 0 Q8 5 0 0 Z M0 0 L-6 -4 L-6 4 Z", i % 2 ? "#f2c230" : "#e8eef2", { w: .8 })); } return s; }
  function diver(x, y, s, t) { var o = { x: x, y: y, s: s, rot: -80, dir: 1, outfit: { base: "casual", colors: { shirt: "#1a1c22", shirtD: "#0e1014", pants: "#1a1c22", pantsD: "#0e1014", shoes: "#2a6ab0" } }, colors: { hair: "#1a1c22", skin: "#d9a57a" }, legs: [{ hip: 10 + 14 * Math.sin(t * 3), knee: 10 }, { hip: -10 - 14 * Math.sin(t * 3), knee: 10 }], arms: [{ sh: 70, el: 10, hand: "open" }, { sh: 60, el: 20, hand: "open" }], face: { eyes: 1 } }; return PERSON.side(o).svg + G("translate(" + f(x) + " " + f(y) + ") rotate(-80) scale(" + f2(s) + ")", R(-60, -190, 26, 90, "#c8c8d0", { w: 1.6 })) + (function () { var b = ""; for (var i = 0; i < 6; i++) { var p = (t * .8 + i / 6) % 1; b += Ci(x + 50 * s + Math.sin(t + i) * 4, y - 40 * s - p * 140, 2 + p * 4, "none", { w: 1, op: 1 - p }).replace('stroke="' + INK + '"', 'stroke="#dff2ff"'); } return b; })(); }

  // ── the shots ──
  // 0 · the survivor's real voice; the ship in the storm, already listing
  shot(0, push([180, 330], [180, 336], 1.0, 1.08), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .55, t, { lit: 1, rot: 8 + 1.5 * Math.sin(t * 1.2) }) + waves(t, 400, 9) + rain(t, 80, .35) + recS(t, 66, SURV); }, { foot: "mdark", fw: 250, fy: 130, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 1 · it is real: the photograph of the survivors
  shot(1, push([180, 330], [180, 320], 1.05, 1.12), function (u, d, t) { return stormNight(t, 400) + waves(t, 420, 6) + rain(t, 40, .25); }, { foot: "photo", fw: 290, fy: 140, cap: "صورة حقيقية · ناجين من سالم إكسبريس" });
  // 2 · the night of 14 December 1991, the Red Sea
  shot(2, push([180, 320], [190, 330], 1.0, 1.1), function (u, d, t) { return night(t, 400) + shipAt(lerp(250, 170, u / d), 400, .5, t, { lit: 1, smoke: 1 }) + seaFront(t, 401, .55) + label("14 ديسمبر 1991", 180, 170, u, .3, 30, "#fff") + label("البحر الأحمر", 180, 208, u, .8, 20, YEL); });
  // 3 · Jeddah to Safaga, more than 600 people
  shot(3, push([180, 280], [180, 270], 1.0, 1.06), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE.concat([SAF]), clamp(u / d) * .5, YEL, { dash: "6 6", w: 3, ship: 1, t: t }) + bigNum("+600", 180, 120, u, D(3) * .45, 46, "#fff") + label("إنسان", 180, 150, u, D(3) * .6, 18, YEL); });
  // 4 · mostly Egyptian pilgrims going home
  shot(4, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { var s = night(t, 360) + seaFront(t, 361, .5) + R(-220, 380, 800, 400, "url(#wood)", { s: 0 }); for (var i = 0; i < 5; i++) s += pil(i, { x: 30 + i * 75, y: 470 - (i % 2) * 14, s: .55, breath: (Math.sin(t * 2 + i) + 1) / 2, head: { turn: (hash(i) - .5) * .8, tilt: 3 * Math.sin(t + i) }, face: { eyes: blink(t, 1, i), mouth: "smile" }, arms: [{ rel: [-20, 120], hand: "relaxed", bend: 1 }, { rel: [20, 120], hand: "relaxed", bend: -1 }] }) + bag(48 + i * 75, 490, .9, ["#7a4a2a", "#3a5a7a", "#8a3a34", "#5a6a4a", "#7a6a50"][i]); return s + label("حجاج راجعين بيوتهم", 180, 160, u, .5, 22, "#fff"); });
  // 5 · about 800 km… and it sank 15 km before the port
  shot(5, push([170, 270], [120, 190], 1.0, 1.5), function (u, d, t) { var w = wide(t), g = w.g, k = clamp(u / (D(5) * .55)); var s = w.s + routeLine(g, ROUTE, k, YEL, { w: 3, ship: k < 1, t: t }); if (k >= 1) { var p = g.project(WRK); s += xmark(p[0], p[1], .7, (u - D(5) * .55) / .4) + label("15 كم", p[0] + 20, p[1] + 26, u, D(5) * .7, 14, "#fff"); } return s + label("~800 كم", 210, 330, u, .6, 22, YEL); });
  // 6 · under 20 minutes, with the shore in sight
  shot(6, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#0c1426", { s: 0 }) + dust(t, 40, "#9fc4e6", .4, 3) + watch(180, 270, 80, t, { h: 11.22, sec: u * 6 * 20 }) + label("أقل من 20 دقيقة", 180, 420, u, .5, 26, YEL); });
  // 7 · why are the pilgrims' things still inside? (real 2020 dive)
  shot(7, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 10, 200); }, { foot: "bags20", cap: "فيديو حقيقي · جوه العبّارة، 2020" });
  // 8 · from Jeddah: the port at dusk, the ship at the quay
  shot(8, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyDusk") + cloudBank(t, 140, 3, 4, "#f6b070", .5) + R(-220, 380, 800, 500, "url(#seaDawn)", { s: 0 }) + R(-220, 380, 800, 30, "#6a6a70", { w: 1.6 }); for (var c = 0; c < 3; c++) s += crane(-10 + c * 150, 380, .8, "#c86a2a", t); return s + shipAt(200, 420, .6, t, { lit: 1, smoke: 1 }) + label("جدة", 180, 150, u, .4, 34, "#fff"); });
  // 9 · built in France in the 1960s as the Fred Scamaroni (the real photograph)
  shot(9, push([180, 340], [190, 340], 1.0, 1.06), function (u, d, t) { return sky("skyMorning") + R(-220, 420, 800, 500, "url(#river)", { s: 0 }) + glints(t, 420, 30, "#e4eef6") + shipAt(180, 440, .62, t, { smoke: 1 }) + photoCard("scamaroni-1966.jpg", 180, 210, 270, 161, -2, (u - .3) / .5, "صورة حقيقية · «فريد سكاماروني»، مرسيليا 1966"); });
  // 10 · a big bow door that lifts up for the cars
  shot(10, push([110, 360], [100, 350], 1.9, 2.1), function (u, d, t) { var v = 40 * ease(clamp((u - .6) / 1.6)), s = sky("skyMorning") + R(-220, 400, 800, 500, "url(#river)", { s: 0 }) + salem({ x: 20, y: 400, s: .9, t: t, visor: v }); for (var c = 0; c < 3; c++) { var cx = lerp(-60, 30, clamp((u - 1.6 - c * .5) / 1.4)); s += G("translate(" + f(cx) + " 392) scale(.7)", R(-24, -16, 48, 16, ["#8a3a2e", "#3a5a7a", "#c9b48a"][c], { w: 1.4 }) + R(-14, -26, 28, 11, "#2a3442", { w: 1 }) + Ci(-14, 0, 5, "#1a1c20", {}) + Ci(14, 0, 5, "#1a1c20", {})); } return s + label("الباب الكبير", 110, 230, u, .8, 18, YEL); });
  // 11 · remember this door
  shot(11, push([90, 330], [90, 330], 2.3, 2.5), function (u, d, t) { var s = sky("skyMorning") + R(-220, 400, 800, 500, "url(#river)", { s: 0 }) + salem({ x: 20, y: 400, s: .9, t: t, visor: 40 }); for (var q = 0; q < 3; q++) { var p = (t * .8 + q / 3) % 1; s += '<circle cx="54" cy="370" r="' + f(16 + p * 50) + '" fill="none" stroke="' + YEL + '" stroke-width="2" opacity="' + f2(1 - p) + '"/>'; } return s + label("افتكروا الباب ده", 90, 270, u, .1, 14, YEL); });
  // 12 · the pilgrims boarding with their bags and gifts
  shot(12, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { var s = sky("skyDusk") + R(-220, 380, 800, 500, "url(#seaDawn)", { s: 0 }) + shipAt(240, 380, .55, t, { lit: 1 }) + R(-220, 440, 800, 200, "#8a8478", { w: 1.6 }); for (var i = 0; i < 4; i++) { var x = ((u * 40 + i * 110) % 460) - 60; s += pilWalk(i, x, 470, .45, u * 6 + i, 1) + bag(x + 22, 452, .7, ["#7a4a2a", "#3a5a7a", "#8a3a34", "#5a6a4a"][i]); } return s + label("مصاحف · سجاجيد · راديوهات · شرايط", 180, 150, u, .8, 15, YEL); });
  // 13 · the ship sails for Safaga
  shot(13, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { return sky("skyDusk") + cloudBank(t, 150, 4, 4, "#f6b070", .5) + R(-220, 420, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 420, 30, "#f6d8b0") + shipAt(lerp(260, 130, u / d), 440, .55, t, { lit: 1, smoke: 1 }); });
  // 14 · let's see the route from above
  shot(14, push([180, 270], [180, 270], 1.3, 1.0), function (u, d, t) { return wide(t).s; });
  // 15 · north from Jeddah, between Saudi Arabia and Egypt
  shot(15, push([200, 290], [190, 270], 1.0, 1.02), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE, clamp(u / d) * .5, YEL, { w: 3, ship: 1, t: t }); });
  // 16 · about 800 km: the Saudi shore falls away to the right, the Egyptian one comes closer on the left
  shot(16, push([180, 270], [150, 230], 1.02, 1.15), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE, .5 + clamp(u / d) * .42, YEL, { w: 3, ship: 1, t: t }) + label("~800 كم", 240, 300, u, .5, 22, YEL); });
  // 17 · near Safaga, reefs just under the surface (the map zooms in)
  shot(17, push([180, 280], [180, 280], 1.0, 1.1), function (u, d, t) { var z = zoomed(t); return z.s + label("شعاب مرجانية", 230, 360, u, D(17) * .5, 18, YEL); });
  // 18 · the weather turned that night: wind, high waves
  shot(18, push([180, 330], [180, 340], 1.1, 1.2), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .6, t, { lit: 1, rot: 4 * Math.sin(t * 1.1) }) + waves(t, 398, 12) + rain(t, 120, .45); });
  // 19 · the normal way goes round the reefs
  shot(19, push([180, 280], [180, 280], 1.1, 1.12), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, NORMAL, clamp(u / (d * .8)), "#4ac06a", { w: 3, dash: "7 5" }) + label("الطريق الطبيعي", 280, 200, u, .5, 15, "#4ac06a"); });
  // 20 · the captain took a shortcut close to the reefs
  shot(20, push([180, 280], [170, 290], 1.12, 1.3), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, NORMAL, 1, "#4ac06a", { w: 2, dash: "7 5" }) + routeLine(z.g, SHORT, clamp(u / (d * .85)), "#e23a2a", { w: 3.4, ship: 1, t: t }) + label("طريق مختصر", 120, 200, u, D(20) * .4, 18, "#ff6a4a") + label("القبطان حسن مورو", 180, 120, u, .3, 15, "#fff"); });
  // 21 · a route closed to big ships at night
  shot(21, push([170, 290], [170, 290], 1.3, 1.35), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, SHORT, 1, "#e23a2a", { w: 3.4 }) + label("ممنوع بالليل", 180, 150, u, .4, 22, "#ff6a4a") + G("translate(180 210)", Ci(0, 0, 24, "#e23a2a", { w: 2 }) + R(-14, -4, 28, 8, "#fff", { s: 0 })); });
  // 22 · 11:13 pm, 15 km from Safaga: the ship heading into the reef
  shot(22, push([180, 330], [200, 340], 1.0, 1.15), function (u, d, t) { return stormNight(t, 380) + shipAt(lerp(120, 220, u / d), 400, .55, t, { lit: 1 }) + waves(t, 398, 9) + reef(330, 410, 1, t) + rain(t, 90, .4) + label("11:13 بالليل", 180, 150, u, .3, 30, "#fff") + label("15 كم من سفاجا", 180, 186, u, D(22) * .5, 16, YEL); });
  // 23 · the survivor: "the moment it hit the coral…" (the impact, synced to his voice)
  shot(23, push([220, 350], [230, 360], 1.15, 1.25), function (u, d, t) { var j = u > .6 && u < 1.6 ? 4 * Math.sin(t * 60) * (1.6 - u) : 0; return stormNight(t, 380) + G("translate(" + f(j) + " 0)", shipAt(250, 400, .55, t, { lit: u < 2.4 || Math.sin(t * 20) > 0, rot: u > .6 ? 3 : 0, hole: u > .6 })) + waves(t, 398, 9) + reef(330, 410, 1, t) + rain(t, 90, .4) + recS(t, 66, SURV); }, { foot: "mreef", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 24 · that's Mahmoud Abdel Aziz, on the ferry that night
  shot(24, push([180, 330], [180, 330], 1.0, 1.06), function (u, d, t) { return stormNight(t, 400) + waves(t, 420, 8) + rain(t, 50, .3) + label("محمود عبد العزيز", 180, 420, u, .5, 22, YEL); }, { foot: "photo", fw: 290, fy: 130, cap: "صورة حقيقية · ناجين من سالم إكسبريس" });
  // 25 · the rock tore a hole in the bow, the blow forced the bow door open
  shot(25, push([80, 360], [70, 360], 2.2, 2.5), function (u, d, t) { var v = 26 * ease(clamp((u - D(25) * .45) / .8)), s = stormNight(t, 380) + salem({ x: 20, y: 400, s: .9, t: t, lit: 1, visor: v, hole: 1 }) + waves(t, 396, 8); for (var i = 0; i < 16; i++) { var p = (t * 1.6 + i / 16) % 1; s += Ci(60 - p * 40 + hash(i) * 10, 392 - (1 - p) * 20, 2 + hash(i) * 3, "#cfe6ff", { s: 0, op: .8 * (1 - p) }); } return s + label("خرم", 60, 300, u, .5, 16, "#ff6a4a") + label("والباب اتفتح", 90, 270, u, D(25) * .6, 16, YEL); });
  // 26 · the water into the car deck, and the lights went out
  shot(26, push([180, 336], [180, 340], 1.5, 1.35), function (u, d, t) { var k = clamp((u - D(26) * .55) / .3); return cutScene(t, .78, { water: lerp(.2, .6, clamp(u / d)), list: lerp(2, 8, clamp(u / d)), hlW: 1 }) + R(-220, -220, 800, 1300, "#02040a", { s: 0, op: .82 * k }) + label("النور قطع", 180, 160, u, D(26) * .6, 24, "#fff"); });
  // 27 · imagine: the dark, the floor tilting under your feet
  shot(27, push([180, 330], [180, 320], 1.05, 1.2), function (u, d, t) { var tl = lerp(6, 14, clamp(u / d)), inner = ""; for (var i = 0; i < 4; i++) inner += pil(i, { x: 40 + i * 90, y: 500, s: .6, breath: (Math.sin(t * 5 + i) + 1) / 2, lean: -tl * .6, head: { turn: (hash(i) - .5) * 1.2, tilt: -6 }, face: { eyes: 1.25, brows: "worried", mouth: i % 2 ? "open" : "o" }, arms: [{ rel: [-60, 40], hand: "open", bend: 1 }, { rel: [60, 30], hand: "open", bend: -1 }] }); return deckN(t, tl, inner) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .45 }) + rain(t, 60, .3); });
  // 28 · the survivor: the women, the men, a mother with two children (synced)
  shot(28, push([180, 330], [180, 330], 1.1, 1.15), function (u, d, t) { var tl = 14 + 3 * clamp(u / d), inner = ""; for (var i = 0; i < 3; i++) inner += pil(i + 2, { x: 60 + i * 120, y: 510, s: .6, lean: -tl * .6, head: { tilt: -8 }, face: { eyes: 1.25, brows: "worried", mouth: "open" }, arms: [{ rel: [-40, -40], hand: "open", bend: 1 }, { rel: [40, -50], hand: "open", bend: -1 }] }); return deckN(t, tl, inner) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .5 }) + recS(t, 66, SURV); }, { foot: "mwomen", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 29 · the ship leaning onto her starboard side, fast
  shot(29, push([180, 336], [180, 340], 1.3, 1.25), function (u, d, t) { return cutScene(t, .78, { water: .9, list: lerp(10, 24, clamp(u / d)), hlW: 1, slide: .3 }) + label("بتميل… بسرعة", 180, 160, u, .5, 22, "#ff6a4a"); });
  // 30 · and at that moment… (the cliffhanger frame)
  shot(30, push([180, 334], [180, 336], 1.3, 1.36), function (u, d, t) { return cutScene(t, .78, { water: 1, list: 26 + 1 * Math.sin(t * 1.3), hlW: 1, slide: .4 }); });
  // 31 · the bio line: the same frame, still creeping, and the pill
  shot(31, push([180, 336], [180, 338], 1.36, 1.42), function (u, d, t) { return cutScene(t, .78, { water: 1, list: 26 + 1 * Math.sin(t * 1.3), hlW: 1, slide: .4 }); }, { pill: 1 });
  // 32 · back to the ferry
  shot(32, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .55, t, { lit: 0, rot: 18 + Math.sin(t) }) + waves(t, 400, 10) + rain(t, 90, .4); });
  // 33 · in under twenty minutes she rolled onto her side… and went down
  shot(33, push([180, 334], [180, 380], 1.2, 1.0), function (u, d, t) { var k = ease((u - D(33) * .25) / 2.0), k2 = clamp((u - D(33) * .25 - 1.4) / 2.4); return night(t, WY) + cutS(180 + 26 * k, WY + 20 * k + 250 * k2, .62, t, { water: 1, list: lerp(26, 90, k), hlW: 1, slide: .5 }) + seaFront(t, WY, .7) + rain(t, 60, .3); });
  // 34 · many were asleep in the cabins
  shot(34, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#141a26", { s: 0 }) + R(40, 200, 280, 260, "#2a3040", { w: 2 }) + R(60, 220, 240, 70, "#3a4256", { w: 1.6 }) + R(60, 330, 240, 70, "#3a4256", { w: 1.6 }); s += PERSON.side({ x: 180, y: 275, s: .45, rot: -90, outfit: "galabeya", colors: { hair: "#2a2018", skin: "#c98f66" }, face: { eyes: 0 } }).svg; s += R(60, 290, 240, 8, "#c9c3b4", { w: 1 }); return s + R(-220, lerp(560, 330, clamp(u / d)), 800, 400, "#1f4a7a", { s: 0, op: .75 }) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .3 }); });
  // 35 · the survivor: "the waves… death among the people, one after another" (synced)
  shot(35, push([180, 330], [180, 330], 1.05, 1.1), function (u, d, t) { var s = stormNight(t, 330) + waves(t, 340, 10); for (var i = 0; i < 4; i++) s += swimmerN(60 + i * 80, 420 + (i % 2) * 30, .28, t, i); return s + rain(t, 70, .35) + recS(t, 66, SURV); }, { foot: "mwaves", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 36 · people in the water, in the dark and the waves, swimming for the shore
  shot(36, push([180, 340], [180, 330], 1.0, 1.08), function (u, d, t) { var s = stormNight(t, 300) + R(-220, 290, 800, 20, "#1a1c22", { s: 0 }); for (var l = 0; l < 8; l++) s += Ci(30 + l * 44, 298, 1.8, "#ffd98a", { s: 0, op: .6 + .4 * Math.sin(t * 2 + l) }); s += waves(t, 310, 9); for (var i = 0; i < 5; i++) s += swimmerN(40 + i * 70, 380 + (i % 3) * 40, .3, t, i); return s + label("الشط", 180, 280, u, .6, 14, YEL); });
  // 37 · morning: fishermen and rescuers find survivors, and many dead
  shot(37, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDawnT") + R(-220, 400, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 400, 30, "#f6d8b0") + G("translate(150 420) scale(.5)", raft(0, 0, t)) + G("translate(" + f(lerp(380, 260, u / d)) + " 412)", P("M-40 0 L-34 -12 L36 -12 L44 0 Z", "#2a5a8a", { w: 1.6 }) + R(-10, -24, 18, 12, "#e8e4d8", { w: 1.2 })) + vests(t, 410, 4); });
  // 38 · the official number: 470
  shot(38, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) { return night(t, 380) + seaFront(t, 381, .5) + bigNum("470", 180, 220, u, .5, 70, "#fff") + label("الرقم الرسمي", 180, 266, u, 1, 20, YEL); });
  // 39 · but many say the real number is far higher
  shot(39, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { var s = night(t, 380) + seaFront(t, 381, .5) + G("translate(180 250) rotate(-3)", R(-90, -110, 180, 220, "#f4ecdb", { w: 1.6 }) + txt("كشف الركاب", 0, -82, 15, INK, { wt: 900 })); for (var i = 0; i < 9; i++) s += G("translate(180 250) rotate(-3)", '<path d="M-70 ' + (-56 + i * 18) + ' h140" stroke="#8a8a90" stroke-width="1.4"/>'); return s + label("+470 ؟", 180, 420, u, D(39) * .5, 30, "#ff6a4a"); });
  // 40 · back to the map: she sank here
  shot(40, push([180, 270], [130, 200], 1.0, 1.5), function (u, d, t) { var w = wide(t, { duba: 1 }), g = w.g, p = g.project(WRK); return w.s + routeLine(g, ROUTE, 1, YEL, { w: 3 }) + xmark(p[0], p[1], .7, 1) + label("هنا", p[0] + 26, p[1] + 6, u, .6, 16, "#fff"); });
  // 41 · 15 km from Safaga… about 180 km from the nearest Saudi shore
  shot(41, push([140, 210], [150, 220], 1.5, 1.45), function (u, d, t) { var w = wide(t, { duba: 1 }), g = w.g, p = g.project(WRK), sa = g.project(SAF), db = g.project(DUB); return w.s + xmark(p[0], p[1], .7, 1) + '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(sa[0]) + ' ' + f(sa[1]) + '" stroke="#fff" stroke-width="3"/>' + label("15 كم", p[0] - 10, p[1] + 22, u, .4, 13, "#fff") + routeLine(g, [WRK, DUB], clamp((u - D(41) * .45) / 1), "#f2c230", { w: 2.4, dash: "6 5" }) + label("~180 كم", (p[0] + db[0]) / 2 + 20, (p[1] + db[1]) / 2 + 10, u, D(41) * .6, 15, YEL); });
  // 42 · a month later, a diver went down and filmed (the real January 1992 video)
  shot(42, push([180, 340], [180, 330], 1.0, 1.08), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + diver(lerp(320, 220, u / d), 380, .3, t) + fish(t, 8, 240); }, { foot: "name92", cap: "فيديو حقيقي · غطاس، يناير 1992" });
  // 43 · the name still on her side, the pilgrims' bags in place
  shot(43, push([180, 330], [180, 330], 1.05, 1.1), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 8, 240); }, { foot: "bags92", cap: "فيديو حقيقي · شنط الحجاج، يناير 1992" });
  // 44 · to this day she lies on her side, about 30 m down
  shot(44, push([180, 330], [180, 350], 1.0, 1.1), function (u, d, t) { return underSea(t) + G("translate(0 0)", cutS(170, 420, .5, t, { list: 90, water: 1, hlW: 1, slide: .6 })) + R(-220, 300, 800, 300, "#0e4a72", { s: 0, op: .35 }) + R(-220, 462, 800, 200, "#c8b48a", { w: 1.4 }) + fish(t, 12, 200) + G("translate(320 150)", R(-1, 0, 2, 300, "#fff", { s: 0, op: .5 }) + txt("0 م", -6, 4, 11, "#fff", { a: "end" }) + txt("30 م", -6, 300, 14, YEL, { a: "end" })) + label("~30 متر", 260, 300, u, .6, 18, YEL); }, { foot: "wreck20", cap: "فيديو حقيقي · العبّارة النهارده" });
  // 45 · one of the best-known dive sites; bags, clothes and radios inside
  shot(45, push([180, 330], [180, 330], 1.0, 1.06), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + diver(lerp(340, 240, u / d), 360, .3, t) + diver(lerp(400, 300, u / d), 300, .26, t + 1) + fish(t, 10, 220); }, { foot: "radio20", cap: "فيديو حقيقي · راديو جوه العبّارة، 2020" });
  // 46 · many say it should be left alone: it is a grave
  shot(46, push([180, 330], [180, 320], 1.0, 1.05), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 6, 220) + R(-220, -220, 800, 1300, "#020812", { s: 0, op: .3 }) + label("مقبرة", 180, 420, u, D(46) * .4, 26, "#fff"); }, { foot: "clothes20", cap: "فيديو حقيقي · هدوم جوه العبّارة، 2020" });
  // 47 · the shortcut, banned for all big ships afterwards
  shot(47, push([170, 280], [170, 280], 1.2, 1.25), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, SHORT, 1, "#e23a2a", { w: 3.4 }) + xmark(z.w[0], z.w[1] - 40, 1.2, (u - .6) / .5) + routeLine(z.g, NORMAL, 1, "#4ac06a", { w: 2.4, dash: "7 5" }) + label("اتمنع", 180, 150, u, D(47) * .5, 26, "#ff6a4a"); });
  // 48 · the same bow door, three years later, sank the Estonia in the Baltic
  shot(48, push([100, 340], [110, 340], 1.9, 2.1), function (u, d, t) { var s = sky("skyStar") + cloudBank(t, 90, 10, 6, "#1a2236", .9, 1.4) + salem({ x: 20, y: 400, s: .9, t: t, lit: 1, noname: 1, visor: lerp(0, 70, ease(clamp((u - 1) / 1.2))) }) + waves(t, 396, 12) + rain(t, 100, .45); return s + label("إستونيا · بحر البلطيق · 1994", 110, 230, u, .4, 13, YEL); });
  // 49 · fifteen years later, Al-Salam 98, in the same sea, with pilgrims again
  shot(49, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, 400) + ferryN(lerp(250, 170, u / d), 400, .5, t) + seaFront(t, 401, .55) + label("عبّارة السلام 98 · 2006", 180, 180, u, .6, 20, YEL); });
  // 50 · the call to comment: dawn over the Red Sea, the Safaga shore
  shot(50, push([180, 330], [180, 320], 1.0, 1.06), function (u, d, t) { return sky("skyDawnT") + mountains(392, ["#8a6a5a", "#6a5048", "#4a3a3a"]) + R(-220, 400, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 400, 40, "#f6d8b0") + G("translate(200 430)", R(-3, -26, 6, 26, "#e23a2a", { w: 1.2 }) + Ci(0, 0, 8, "#f2c230", { w: 1.2 })); });
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 8) ? .9 : 0; };

