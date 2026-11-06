  // ── the Nile basin map, shared by both versions. Real coordinates (lon, lat), equirectangular, framed so the whole
  //    river from Lake Victoria to the Mediterranean fills the 360×436 picture. Drawn flat; the isometric version lays it on
  //    the ground with a matrix and places the labels upright. ──
  var NMK = 10.6;
  function NM(lon, lat) { return [180 + (lon - 32.5) * NMK * 0.97, 18 + (33.5 - lat) * NMK]; }
  function nmPath(a) { return "M" + a.map(function (p) { var q = NM(p[0], p[1]); return f(q[0]) + " " + f(q[1]); }).join(" L"); }
  function nmPoly(a, fill, o) { o = o || {}; return '<path d="' + nmPath(a) + ' Z" fill="' + fill + '"' + (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 1.5) + '" stroke-linejoin="round"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + '/>'; }
  var NMD = {
    med: [[5, 42], [5, 36.5], [10, 37.2], [11, 33.6], [12, 32.9], [15, 32.3], [19, 30.3], [20, 31.0], [21, 32.8], [23, 32.6], [25, 31.7], [27, 31.4], [29, 30.9], [30.4, 31.45], [31.1, 31.55], [31.8, 31.5], [32.3, 31.25], [33.5, 31.1], [34.2, 31.3], [34.9, 32.5], [35.3, 33.5], [35.9, 35], [36, 42]],
    red: [[32.55, 29.95], [32.6, 29.3], [33.6, 27.3], [34.3, 25.6], [35.5, 23.9], [36.9, 22], [37.3, 20], [38.5, 18], [39.7, 15.4], [41.6, 13.4], [43.3, 12.6], [43.5, 12.7], [42.8, 15.2], [42.5, 16.8], [41.2, 19], [39.2, 21.5], [38.2, 23.9], [37.1, 25.6], [35.9, 27.4], [34.95, 29.5], [34.6, 28.6], [34.25, 27.75], [33.6, 28.5], [32.7, 29.6]],
    ocean: [[43.3, 12.4], [44.3, 10.4], [45.5, 10.6], [48, 11.2], [51.2, 11.8], [51, 10.4], [49.5, 7], [48, 4.5], [46, 1.8], [43, -0.8], [41.5, -2], [40.2, -2.6], [39.6, -4.5], [39.2, -12], [70, -12], [70, 16], [53, 16.5], [48, 14], [45, 13], [43.5, 12.7]],
    victoria: [[31.8, -1], [31.7, -0.2], [32.2, 0.3], [33, 0.45], [33.9, 0.15], [34.1, -0.4], [33.8, -1.5], [33.5, -2.4], [32.7, -2.65], [31.8, -2.1]],
    albert: [[30.4, 1.0], [30.9, 1.7], [31.4, 2.3], [31.2, 2.4], [30.6, 1.6], [30.2, 1.1]],
    kyoga: [[32.6, 1.4], [33.2, 1.6], [33.6, 1.5], [33.2, 1.3]],
    nasser: [[32.95, 24.0], [32.7, 23.3], [32.0, 22.6], [31.3, 21.7], [31.2, 21.85], [31.85, 22.75], [32.55, 23.45], [32.8, 24.05]],
    delta: [[31.1, 30.35], [30.0, 31.2], [30.4, 31.5], [31.1, 31.6], [31.9, 31.5], [32.3, 31.2]],
    highlands: [[35.4, 13.6], [37.4, 14.4], [39.4, 14.0], [40.0, 12.0], [39.6, 9.6], [41.6, 9.0], [40.2, 7.2], [38.2, 5.6], [36.4, 6.2], [35.2, 7.6], [35.0, 9.6], [34.8, 11.2]],
    green: [[29.5, 4.2], [33.5, 4.3], [35.4, 1.5], [35.2, -2.5], [33.8, -3.6], [30.6, -3.4], [29.4, -1.0]],
    sudd: [[29.6, 6.8], [31.4, 6.6], [31.8, 8.4], [30.8, 9.4], [29.8, 8.9]],
    white: [[33.2, 0.42], [33.0, 1.45], [32.2, 2.2], [31.4, 2.3], [31.5, 3.6], [31.6, 4.85], [31.4, 6.2], [30.8, 7.8], [30.4, 9.4], [31.65, 9.6], [32.3, 11.5], [32.6, 13.2], [32.5, 15.6]],
    blue: [[37.35, 11.6], [37.9, 11.0], [38.2, 10.5], [37.7, 10.05], [36.9, 10.2], [36.2, 10.6], [35.2, 11.3], [34.4, 11.8], [33.6, 13.6], [32.5, 15.6]],
    atbara: [[37.4, 13.3], [36.3, 14.5], [35.2, 16.3], [33.97, 17.67]],
    sobat: [[34.4, 8.3], [33.4, 8.8], [32.4, 9.3], [31.65, 9.6]],
    main: [[32.5, 15.6], [33.2, 16.8], [33.97, 17.67], [33.3, 19.5], [32.3, 18.8], [31.6, 18.1], [30.5, 19.2], [30.4, 20.4], [31.35, 21.8], [32.4, 23.2], [32.9, 24.1], [32.65, 25.7], [32.7, 26.15], [31.9, 26.6], [31.2, 27.2], [30.75, 28.1], [31.1, 29.1], [31.24, 30.04], [31.1, 30.4]],
    rosetta: [[31.1, 30.4], [30.6, 31.0], [30.4, 31.45]],
    damietta: [[31.1, 30.4], [31.4, 31.0], [31.8, 31.5]],
    egypt: [[25, 31.6], [25, 22], [36.9, 22]],
    sudanS: [[23.5, 8.7], [26, 9.4], [28, 9.5], [30, 10.0], [32, 10.4], [33.2, 10.3], [34.0, 9.4], [34.1, 8.6]],
    ethiopia: [[36.5, 14.3], [37.9, 14.9], [39.8, 14.5], [41.7, 13.0], [42.4, 12.5], [42.8, 11.4], [44, 8.9], [44, 5], [41.9, 4.0], [39, 3.5], [35.9, 4.6], [35.3, 5.4], [34.7, 6.5], [33.2, 7.9], [34.1, 8.6], [34.1, 9.6], [34.4, 10.6], [35.2, 11.6], [36.1, 12.7], [36.5, 14.3]],
    uganda: [[29.6, -1.4], [33.9, -1.0], [34.0, 1.2], [35.0, 1.9], [34.4, 3.9], [33.5, 3.8], [32.0, 3.6], [30.9, 3.5], [30.0, 2.2], [29.9, 0.8]]
  };
  function nmLine(a, k, w, col) {   // a river: a white halo, then the colour, revealed from its source by k (0..1)
    var d = nmPath(a), dash = k >= 1 ? "" : ' pathLength="1" stroke-dasharray="' + f(Math.max(0, k)) + ' 1"';
    return '<path d="' + d + '" stroke="#fff" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + dash + '/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>';
  }
  // the base map; o.k reveals all rivers, or o.kW / o.kB / o.kM per branch
  function nileMap(t, o) {
    o = o || {}; var k = o.k == null ? 1 : o.k, s = "";
    s += '<rect x="-300" y="-300" width="960" height="1040" fill="#ead39f"/>';
    for (var i = 0; i < 22; i++) { var x = -60 + hash(i) * 480, y = -40 + hash(i + 9) * 500; s += '<path d="M' + f(x) + ' ' + f(y) + ' q14 -6 28 0" stroke="#d9bd84" stroke-width="2" fill="none"/>'; }   // dunes
    s += nmPoly(NMD.green, "#a9cf7c", { op: 0.9 }) + nmPoly(NMD.highlands, "#b9b56e", { op: 0.95 });
    for (var r = 0; r < 4; r++) { var c = NM(38.2, 9.6), rr = 18 + r * 12; s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(rr * 1.3) + '" ry="' + f(rr) + '" fill="none" stroke="#8f8a4c" stroke-width="1.2" opacity=".3"/>'; }   // contour lines on the Ethiopian plateau
    s += nmPoly(NMD.sudd, "#7fbf6a", { op: 0.9 }); for (var m = 0; m < 10; m++) { var q = NM(29.9 + hash(m) * 1.8, 6.9 + hash(m + 4) * 2.2); s += '<path d="M' + f(q[0]) + ' ' + f(q[1]) + ' v-5 M' + f(q[0] + 3) + ' ' + f(q[1]) + ' v-4" stroke="#3f8a4a" stroke-width="1.2"/>'; }
    // seas, with moving ripples
    var sea = "#3a9ad9"; s += nmPoly(NMD.med, sea) + nmPoly(NMD.red, sea) + nmPoly(NMD.ocean, sea);
    s += '<path d="' + nmPath(NMD.med.slice(1, -1)) + '" stroke="#fff" stroke-width="2.2" fill="none"/><path d="' + nmPath(NMD.red) + ' Z" stroke="#fff" stroke-width="2.2" fill="none"/><path d="' + nmPath(NMD.ocean.slice(0, 10)) + '" stroke="#fff" stroke-width="2.2" fill="none"/>';
    for (var w = 0; w < 6; w++) { var a = NM(14 + w * 3.5, 33.6 + (w % 2) * 0.8), b2 = NM(45 + (w % 3) * 3, 3 + w * 1.5); s += '<path d="M' + f(a[0] + Math.sin(t + w) * 4) + ' ' + f(a[1]) + ' q6 -4 12 0 t12 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/><path d="M' + f(b2[0] + Math.sin(t + w) * 4) + ' ' + f(b2[1]) + ' q6 -4 12 0 t12 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>'; }
    // borders
    var bd = function (a) { return '<path d="' + nmPath(a) + '" stroke="#fff" stroke-width="1.6" fill="none" stroke-dasharray="5 4" opacity=".9"/>'; };
    s += bd(NMD.egypt) + bd(NMD.sudanS) + bd(NMD.ethiopia) + bd(NMD.uganda);
    // the green Nile valley in Egypt and the delta
    s += '<path d="' + nmPath(NMD.main.slice(10)) + '" stroke="#8fcf6a" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' + nmPoly(NMD.delta, "#8fcf6a");
    // lakes
    s += nmPoly(NMD.victoria, sea, { stroke: "#fff", sw: 2 }) + nmPoly(NMD.albert, sea, { stroke: "#fff", sw: 1.4 }) + nmPoly(NMD.kyoga, sea, { stroke: "#fff", sw: 1.2 }) + nmPoly(NMD.nasser, sea, { stroke: "#fff", sw: 1.4 });
    var ta = NM(37.3, 12.0); s += '<ellipse cx="' + f(ta[0]) + '" cy="' + f(ta[1]) + '" rx="5.5" ry="6.5" fill="' + sea + '" stroke="#fff" stroke-width="1.6"/>';
    // rivers
    var kW = o.kW == null ? k : o.kW, kB = o.kB == null ? k : o.kB, kM = o.kM == null ? clamp(k * 1.6 - 0.6) : o.kM;
    s += nmLine(NMD.sobat, kW, 2, "#5aaee0") + nmLine(NMD.atbara, kB, 2.2, "#3f7fd6") + nmLine(NMD.white, kW, 3.2, "#7fc8ef") + nmLine(NMD.blue, kB, 3.8, "#1f5fc8");
    s += nmLine(NMD.main, kM, 4.4, "#1f7fbf") + nmLine(NMD.rosetta, clamp(kM * 4 - 3), 2.6, "#1f7fbf") + nmLine(NMD.damietta, clamp(kM * 4 - 3), 2.6, "#1f7fbf");
    // flowing dots along the rivers once drawn
    if (o.flow) { var F = function (a, n, sp) { var p = a.map(function (q) { return NM(q[0], q[1]); }); return flow(t, p, "#fff", n, sp, 1.8); }; s += F(NMD.white, 6, 0.06) + F(NMD.blue, 5, 0.09) + F(NMD.main, 10, 0.05); }
    // cities
    var city = function (lon, lat, big) { var p = NM(lon, lat); return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + (big ? 4.2 : 3) + '" fill="' + (big ? "#ff8c1a" : "#0d1a33") + '" stroke="#fff" stroke-width="1.6"/>'; };
    s += city(31.24, 30.04, 1) + city(32.9, 24.09) + city(32.53, 15.6, 1) + city(31.6, 4.85) + city(33.2, 0.44) + city(38.75, 9.0);
    return s;
  }
  // labels, upright; P maps a flat map point to where it lands on screen (identity for the flat version)
  function nileLabels(u, o) {
    o = o || {}; var P = o.P || function (p) { return p; }, sz = o.size || 1, s = "";
    var L1 = function (txt, lon, lat, u0, size, col, dy) { var p = P(NM(lon, lat)); return tag(txt, p[0], p[1] + (dy || 0) * sz, u, u0, size * sz, col || "#0d1a33"); };
    var T = function (txt, lon, lat, size, col, rot) { var p = P(NM(lon, lat)); return '<text x="' + f(p[0]) + '" y="' + f(p[1]) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="' + f(size * sz) + '" fill="' + col + '" stroke="#fff" stroke-width="' + f(2.4 * sz) + '" paint-order="stroke"' + (rot ? ' transform="rotate(' + rot + ' ' + f(p[0]) + ' ' + f(p[1]) + ')"' : "") + '>' + txt + '</text>'; };
    if (o.countries !== false) s += T("مصر", 28.4, 26.6, 15, "#8a5a2b") + T("السودان", 29.2, 15.4, 13, "#8a5a2b") + T("جنوب السودان", 28.6, 7.0, 10, "#8a5a2b") + T("إثيوبيا", 39.6, 7.4, 12, "#5a5a20") + T("أوغندا", 32.4, 2.7, 9, "#3f6a2a");
    if (o.seas !== false) s += T("البحر المتوسط", 26.5, 33.0, 10, "#0d3a66") + T("البحر الأحمر", 38.0, 21.0, 9, "#0d3a66", 56);
    var C = o.cities || [];
    for (var i = 0; i < C.length; i++) s += L1(C[i][0], C[i][1], C[i][2], C[i][3], C[i][4] || 9, C[i][5], C[i][6] || -12);
    return s;
  }
