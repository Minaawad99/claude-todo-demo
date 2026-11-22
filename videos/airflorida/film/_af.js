  // ══ «إير فلوريدا 90» (13 January 1982): the pieces this story adds on top of the Hudson kit above ══
  //    The plane: a Boeing 737-200 (short body, long thin JT8D engines tight under the wing, the 737 tail with its dorsal
  //    fin) in Air Florida colours as the wreckage shows them in the CBS footage: white, with green and blue stripes.
  //    Washington: the Potomac frozen, the 14th Street Bridge crowded with cars, the Washington Monument and the Capitol
  //    dome in the snow. The Park Police Bell 206 helicopter is blue and white (as in the footage). See ../refs/SOURCES.md.
  function arrowL(x1, y1, x2, y2, col, k, w) { k = clamp(k); if (k <= 0) return ""; var xe = lerp(x1, x2, k), ye = lerp(y1, y2, k), a = Math.atan2(ye - y1, xe - x1), h = 9; return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe) + ' ' + f(ye) + '" stroke="' + col + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe + Math.cos(a) * 5) + ' ' + f(ye + Math.sin(a) * 5) + ' L' + f(xe - Math.cos(a - .5) * h) + ' ' + f(ye - Math.sin(a - .5) * h) + ' L' + f(xe - Math.cos(a + .5) * h) + ' ' + f(ye - Math.sin(a + .5) * h) + ' Z" fill="' + col + '"/>'; }
  var AFG = "#3f9a5a", AFB = "#1f5f9a", SNOWC = "#f4f6f8";
  var LARRY = { outfit: { base: "pilot", hat: null }, colors: { hair: "#3a2a1e", hairL: "#5a4636", skin: "#e0a98a" }, headset: true };
  var ROGER = { outfit: { base: "pilot", hat: null }, colors: { hair: "#a8743c", hairL: "#c8945c", skin: "#efc3a8" }, headset: true };
  var JOE = { outfit: { base: "office", tie: true }, colors: { shirt: "#7f9bc6", shirtD: "#5f7ba6", hair: "#5a3a22", hairL: "#7a5a3a", skin: "#e3ad90", tie: "#3a2a2a", pants: "#3b3f4a", pantsD: "#2a2d36" } };
  function snow(t, n, op, big) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 520 + t * (10 + hash(i + 3) * 18) + Math.sin(t * .8 + i) * 12) % 520) - 80, y = ((hash(i * 7) * 760 + t * (30 + hash(i) * 40)) % 760) - 60, r = (big ? 1.6 : 1) * (.8 + hash(i + 9) * 1.8); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#fff" opacity="' + f2((op || .8) * (.5 + .5 * hash(i * 5))) + '"/>'; } return s; }
  function snowSky(t, o) { o = o || {}; return sky(o.dusk ? "skyDuskS" : "skySnow") + cloudBank(t, 60, 4, 5, "#c4c8ce", .5, 1.2) + cloudBank(t, 150, -3, 4, "#aeb4bc", .45, 1); }
  // the Washington skyline from the Virginia bank: low buildings under the height limit, the Monument, the Capitol dome
  function dcSkyline(y, s, o) {
    o = o || {}; var g = "";
    for (var i = 0; i < 40; i++) { var x = -330 + i * 17, h = 14 + hash(i * 3.1) * 26; g += R(x, -h, 16, h, i % 3 ? "#b8b4aa" : "#a8a49a", { w: 1 }) + R(x, -h - 2, 16, 3, SNOWC, { s: 0 }); }
    g += P("M-6 0 L-4 -150 L0 -158 L4 -150 L6 0 Z", "#e8e4da", { w: 1.4 }) + R(1, -150, 3, 150, "#b8b4aa", { s: 0, op: .6 });   // the Washington Monument
    g += G("translate(120 0)", R(-50, -24, 100, 24, "#e8e4da", { w: 1.2 }) + P("M-18 -24 L-18 -40 Q0 -70 18 -40 L18 -24 Z", "#eceae2", { w: 1.2 }) + R(-2, -76, 4, 8, "#eceae2", { w: .8 }) + P("M-22 -40 h44", "none", { w: 1 }));   // the Capitol
    g += G("translate(-150 0)", P("M-26 0 L-26 -16 Q0 -42 26 -16 L26 0 Z", "#eceae2", { w: 1.2 }));   // the Jefferson Memorial
    for (var j = 0; j < 30; j++) g += '<ellipse cx="' + f(-320 + j * 22 + hash(j) * 8) + '" cy="-4" rx="' + f(10 + hash(j * 2) * 6) + '" ry="7" fill="#6a6e6a" stroke="' + INK + '" stroke-width=".8"/>';
    return G("translate(" + f(o.x || 180) + " " + f(y) + ") scale(" + f2(s) + ")", g + (o.haze == null ? R(-340, -170, 680, 172, "#d4d8dc", { s: 0, op: .45 }) : R(-340, -170, 680, 172, "#d4d8dc", { s: 0, op: o.haze })));
  }
  function iceRiver(t, y, o) {
    o = o || {}; var g = R(-400, y, 1160, 900, "url(#iceW)", { s: 0 });
    for (var i = 0; i < 60; i++) { var x = (hash(i * 4) * 1000) - 320 + Math.sin(t * .2 + i) * 2, yy = y + 6 + hash(i * 7) * 300, w = 10 + hash(i + 2) * 34 * (1 + (yy - y) / 140); g += '<path d="M' + f(x - w) + ' ' + f(yy) + ' L' + f(x - w * .4) + ' ' + f(yy - w * .2) + ' L' + f(x + w * .7) + ' ' + f(yy - w * .16) + ' L' + f(x + w) + ' ' + f(yy + w * .05) + ' L' + f(x + w * .2) + ' ' + f(yy + w * .2) + ' Z" fill="#e8eef2" stroke="' + INK + '" stroke-width=".8" opacity=".9"/>'; }
    if (o.open) g += '<ellipse cx="' + f(o.open[0]) + '" cy="' + f(o.open[1]) + '" rx="' + f(o.open[2]) + '" ry="' + f(o.open[2] * .25) + '" fill="#2a3e4e" stroke="' + INK + '" stroke-width="1.2"/>';
    return g;
  }
  // a boxy early-80s car, side view (snow on the roof); o.crushed flattens the roof
  var CARC = ["#8a3a2e", "#3a5a7a", "#c9b48a", "#5a6a4a", "#7a7a80", "#a85a2a"];
  function car(x, y, s, i, o) { o = o || {}; var c = CARC[i % 6], g = P("M-24 0 L-24 -10 L-14 -11 L-8 -20 L12 -20 L18 -11 L24 -10 L24 0 Z", c, { w: 1.4 }); if (o.crushed) g = P("M-24 0 L-24 -9 L-10 -10 L-4 -12 L14 -11 L24 -9 L24 0 Z", c, { w: 1.4 }) + '<path d="M-6 -10 l6 -2 l5 3" stroke="' + INK + '" stroke-width="1" fill="none"/>'; else g += P("M-6 -18 L-6 -12 L4 -12 L4 -18 Z M7 -18 L7 -12 L15 -12 L11 -18 Z", "#2a3442", { w: .8 }) + P("M-9 -20 Q2 -23 13 -20 Z", SNOWC, { s: 0 }); g += Ci(-14, 0, 4, "#1a1c20", { w: 1 }) + Ci(14, 0, 4, "#1a1c20", { w: 1 }); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s * (o.dir || 1)) + " " + f2(s) + ")", g); }
  // the 14th Street Bridge, side view: low concrete arches, a wall, two lanes of stopped cars; o.hit = the broken span
  function bridge14(x, y, s, t, o) {
    o = o || {}; var g = "";
    for (var k = -4; k <= 4; k++) g += P("M" + (k * 110 - 50) + " 0 Q" + (k * 110) + " -26 " + (k * 110 + 50) + " 0 L" + (k * 110 + 50) + " 60 L" + (k * 110 - 50) + " 60 Z", "#8a8a84", { w: 1.2, op: .0 }) + R(k * 110 + 46, -6, 12, 70, "#a8a49a", { w: 1.4 });
    g += R(-500, -20, 1000, 20, "#b8b4aa", { w: 1.6 }) + R(-500, -22, 1000, 3, SNOWC, { s: 0 });
    for (var c = 0; c < 26; c++) { var cx = -480 + c * 38 + (c % 2) * 6; if (o.hit && cx > o.hit[0] && cx < o.hit[1]) { g += car(cx, -20, .9, c, { crushed: 1 }); continue; } g += car(cx, -20, .9, c); }
    g += R(-500, -34, 1000, 8, "#c8c4ba", { w: 1.2 }) + R(-500, -36, 1000, 3, SNOWC, { s: 0 });
    if (o.hit) g += P("M" + o.hit[0] + " -36 L" + (o.hit[0] + 20) + " -28 L" + (o.hit[1] - 14) + " -30 L" + o.hit[1] + " -36 L" + o.hit[1] + " -26 L" + o.hit[0] + " -26 Z", "#5a5a56", { w: 1.2 });
    if (o.lights) for (var l = 0; l < 26; l++) g += Ci(-470 + l * 38, -24, 2.4, "#ffe2a0", { s: 0, op: .7 + .3 * Math.sin(t * 2 + l) });
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g);
  }
  // the Boeing 737-200, side view, nose to the right (length ≈ 270); o.ice: snow and ice on the wing and the top
  function b737(o) {
    var g = "", id = "bf" + (++CLIPN), t = o.t || 0;
    var body = "M-136 -8 L-96 -15 L104 -15 Q132 -14 138 0 Q133 13 106 15 L-84 15 Q-112 10 -136 -2 Z";
    var fin = "M-92 -14 L-134 -78 L-116 -79 L-80 -30 L-56 -14 Z";
    g += P("M-6 4 L-42 -4 L-30 -4 L22 2 Z", "#9aa3ad", { w: 1.4 });
    g += P(fin, "#f4f5f2", { w: 1.8 }) + '<clipPath id="' + id + 'f"><path d="' + fin + '"/></clipPath><g clip-path="url(#' + id + 'f)"><path d="M-140 -40 Q-110 -60 -80 -36 L-80 -20 Q-110 -46 -140 -26 Z" fill="' + AFG + '"/><path d="M-140 -26 Q-110 -46 -80 -20 L-80 -10 Q-110 -32 -140 -12 Z" fill="' + AFB + '"/></g>' + P(fin, "none", { w: 1.8 });
    g += P(body, "#f4f5f2", { w: 2.2 }) + '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(-150, 6, 300, 12, "#c9ced4", { s: 0 }) + R(-150, -4, 300, 4, AFG, { s: 0 }) + R(-150, 0, 300, 3.4, AFB, { s: 0 }) + R(-150, 9, 300, 9, "#000", { s: 0, op: .12 }) + (o.ice ? R(-150, -16, 300, 5, SNOWC, { s: 0, op: .9 }) : "") + '</g>';
    for (var x = -84; x < 92; x += 7.2) if (Math.abs(x - 84) > 6) g += '<rect x="' + f(x) + '" y="-10" width="3.2" height="4.4" rx="1.5" fill="#2a3442"/>';
    g += '<path d="M110 -10 L121 -10 L127 -4 L111 -4 Z M100 -10 L107 -10 L108 -4 L100 -4 Z" fill="#1d2430" stroke="' + INK + '" stroke-width="1"/>';
    g += G((o.dir || 1) < 0 ? "translate(20 0) scale(-1 1)" : "", txt("Air Florida", 10, 11.5, 9, AFB, { font: "Noto Serif", wt: 700 }));
    g += P("M-134 -6 L-108 -11 L-100 -6 L-128 -2 Z", "#c2c9d0", { w: 1.2 });
    g += P("M-4 10 L-50 26 L-36 27 L30 12 Z", "#c9d0d7", { w: 1.6 }) + (o.ice ? P("M-4 10 L-50 26 L-44 26 L28 12 Z", SNOWC, { s: 0, op: .95 }) + '<path d="M-40 24 l3 3 M-24 19 l2 3 M-8 14 l2 3" stroke="#bcd8ea" stroke-width="1.4"/>' : "");
    var eng = "M-6 18 h52 q8 0 8 4 v2 q0 4 -8 4 h-52 q-6 -1 -6 -5 Z";
    g += P(eng, "#dde2e7", { w: 1.6 }) + '<ellipse cx="54" cy="23" rx="2.4" ry="5" fill="#2c323b" stroke="' + INK + '" stroke-width="1.2"/><path d="M-12 20 h-6 v6 h6" fill="#7f8790" stroke="' + INK + '" stroke-width="1.1"/>';
    if (o.thrust) for (var i = 0; i < 4; i++) { var p = (t * 3 + i / 4) % 1; g += '<path d="M' + f(-20 - p * 50) + ' ' + f(23 + Math.sin(t * 9 + i) * 2) + ' h-14" stroke="#fff" stroke-width="2" opacity="' + f2(.35 * (1 - p)) + '"/>'; }
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f2((o.s || 1) * (o.dir || 1)) + " " + f2(o.s || 1) + ")", g);
  }
  // the broken tail section sticking out of the ice, people holding on to it
  function tailIce(x, y, s, t, o) {
    o = o || {}; var g = P("M-70 10 L-60 -16 L40 -22 L60 6 Z", "#e8eaec", { w: 2 }) + R(-60, -10, 100, 4, AFG, { s: 0 }) + R(-60, -6, 100, 3, AFB, { s: 0 });
    g += P("M-30 -18 L-64 -96 L-46 -98 L-8 -40 L20 -20 Z", "#f4f5f2", { w: 2 }) + P("M-58 -70 Q-36 -84 -16 -58 L-12 -46 Q-34 -70 -54 -58 Z", AFG, { w: 1 }) + P("M-54 -58 Q-34 -70 -12 -46 L-8 -38 Q-30 -58 -50 -48 Z", AFB, { w: 1 });
    g += '<path d="M40 -22 L48 -30 L52 -18 L60 -26 L60 6" stroke="' + INK + '" stroke-width="1.6" fill="#c9ced4"/>';
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g);
  }
  // a person in the icy water up to the chest: the kit's front view, with the water drawn over the body
  var WCOL = [["#3a3a46", "#2a2a36", "#2f2620"], ["#7a3a34", "#5a2a26", "#1f1a16"], ["#c9b48a", "#a8946a", "#7a5a3a"], ["#4a5a6a", "#3a4a5a", "#3a2a20"]];
  function swimmer(x, y, s, t, i, o) {
    o = o || {}; var c = o.base ? null : WCOL[i % 4], p = Object.assign({}, o.base || { outfit: { base: "office", tie: false } }, { x: x, y: y + 60 * s, s: s, legs: "stand", breath: (Math.sin(t * 6 + i) + 1) / 2, head: { tilt: 5 * Math.sin(t * 3 + i), turn: o.turn || 0, nod: o.nod || 0 }, face: Object.assign({ eyes: 1, brows: "worried", mouth: "open" }, o.face || {}), arms: o.arms || [{ rel: [-40, -30], hand: "fist", bend: 1 }, { rel: [40, -30], hand: "fist", bend: -1 }] });
    if (c) p.colors = { shirt: c[0], shirtD: c[1], hair: c[2], skin: SKN[i % 6] }; else p.colors = Object.assign({}, o.base.colors);
    var py = y + 60 * s - 166 * s + 30 * s;
    var wl = py + 60 * s, wv = "M" + f(x - 90 * s) + " " + f(wl); for (var q = 1; q <= 6; q++) wv += " Q" + f(x - 90 * s + (q - .5) * 30 * s) + " " + f(wl + (q % 2 ? -4 : 4) * s * Math.sin(t * 2 + i + q)) + " " + f(x - 90 * s + q * 30 * s) + " " + f(wl);
    var cid = "sw" + (++CLIPN);
    return '<clipPath id="' + cid + '"><rect x="' + f(x - 300 * s) + '" y="' + f(wl - 600 * s) + '" width="' + f(600 * s) + '" height="' + f(600 * s) + '"/></clipPath><g clip-path="url(#' + cid + ')">' + PERSON.front(p).svg + '</g>' + '<path d="' + wv + '" stroke="#9fb8c8" stroke-width="' + f(2 * s) + '" fill="none"/>' + '<ellipse cx="' + f(x) + '" cy="' + f(py + 60 * s) + '" rx="' + f(60 * s) + '" ry="' + f(10 * s) + '" fill="none" stroke="#e8eef2" stroke-width="' + f(3 * s) + '" opacity="' + f2(.6 + .3 * Math.sin(t * 2 + i)) + '"/>';
  }
  // the Park Police helicopter (Bell 206: a teardrop cabin, skids, a slim tail boom), blue and white; o.rope hangs a line
  function heli(x, y, s, t, o) {
    o = o || {}; var g = "";
    g += P("M-10 -6 L-92 -12 L-92 -4 L-10 4 Z", "#2f5fa8", { w: 1.6 }) + P("M-92 -12 L-104 -32 L-96 -32 L-86 -12 Z", "#2f5fa8", { w: 1.4 }) + R(-98, -8, 14, 4, "#2a3442", { w: 1 });
    g += P("M-34 -20 Q-34 -40 0 -40 Q34 -40 42 -16 Q44 4 20 10 L-28 10 Q-36 4 -34 -20 Z", "#f4f5f2", { w: 2 }) + P("M-34 -4 Q0 2 42 -6 Q44 4 20 10 L-28 10 Q-36 4 -34 -4 Z", "#2f5fa8", { w: 1.4 });
    g += P("M6 -36 Q30 -36 38 -16 L8 -16 Z", "#8ab0d0", { w: 1.4 }) + R(-24, -32, 24, 18, "#8ab0d0", { w: 1.2 });
    g += '<path d="M-30 22 H34 M-20 10 L-24 22 M18 10 L22 22" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    g += R(-6, -48, 12, 8, "#3a414c", { w: 1.2 }) + '<ellipse cx="0" cy="-49" rx="' + f(86 + 6 * Math.sin(t * 40)) + '" ry="3" fill="#2a2e36" opacity=".45"/>' + '<path d="M' + f(-80 * Math.cos(t * 30)) + ' -49 L' + f(80 * Math.cos(t * 30)) + ' -49" stroke="' + INK + '" stroke-width="2.6"/>';
    g += Ci(-98, -10 + 0, 9, "none", { w: 1, op: .4 });
    var out = G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s * (o.dir || 1)) + " " + f2(s) + ")", g);
    if (o.rope) { var ry = o.rope, sw = 8 * Math.sin(t * 1.4); out += '<path d="M' + f(x) + ' ' + f(y + 22 * s) + ' Q' + f(x + sw) + ' ' + f(y + ry / 2) + ' ' + f(x + sw * 1.6) + ' ' + f(y + ry) + '" stroke="#e8c84a" stroke-width="2" fill="none"/>' + Ci(x + sw * 1.6, y + ry, 7, "none", { w: 3 }).replace('fill="none"', 'fill="none"').replace('stroke="' + INK + '"', 'stroke="#e8c84a"'); }
    return out;
  }
  // the switch panel: ENGINE ANTI-ICE, the switch left OFF
  function antiIce(t, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#2d333c", { s: 0 }) + R(40, 110, 280, 300, "#3a414c", { w: 2.4 });
    g += txt("ENGINE ANTI-ICE", 180, 150, 16, "#e8ecef", { font: "Noto Serif", wt: 700 });
    [120, 240].forEach(function (sx, k) { g += Ci(sx, 250, 34, "#1b1f26", { w: 2 }) + txt(k ? "2" : "1", sx, 205, 13, "#c9d0d7", { font: "Noto Serif", wt: 700 }) + txt("ON", sx, 196 - 0, 0.1, "#fff") + txt("ON", sx, 300, 11, "#7f8790", { font: "Noto Serif", wt: 700 }) + txt("OFF", sx, 326, 13, o.lit ? "#f2c230" : "#c9d0d7", { font: "Noto Serif", wt: 700 }) + R(sx - 6, 250, 12, 40, "#c9d0d7", { w: 1.6 }) + Ci(sx, 290, 9, "#e8ecef", { w: 1.6 }); });
    if (o.ring) for (var q = 0; q < 3; q++) { var p = (t * .8 + q / 3) % 1; g += '<circle cx="180" cy="300" r="' + f(60 + p * 90) + '" fill="none" stroke="#f2c230" stroke-width="2" opacity="' + f2(1 - p) + '"/>'; }
    if (o.x) g += xmark(180, 270, 3.2, o.x);
    return g;
  }
  // two engine-power dials: what it said and what it was (EPR)
  function dial(x, y, r, v, lab, col) { var a = -2.2 + (v - 1) / 1.2 * 4.4, g = Ci(x, y, r + 6, "#2a2e36", { w: 2 }) + Ci(x, y, r, "#0e1116", { w: 1.4 }); for (var i = 0; i <= 12; i++) { var aa = -2.2 + i / 12 * 4.4; g += '<path d="M' + f(x + Math.sin(aa) * r * .78) + ' ' + f(y - Math.cos(aa) * r * .78) + ' L' + f(x + Math.sin(aa) * r * .92) + ' ' + f(y - Math.cos(aa) * r * .92) + '" stroke="#c9d0d7" stroke-width="' + (i % 3 ? 1.2 : 2.4) + '"/>'; } g += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(a) * r * .8) + ' ' + f(y - Math.cos(a) * r * .8) + '" stroke="' + col + '" stroke-width="3.4" stroke-linecap="round"/>' + Ci(x, y, 4, col, { w: 1 }) + txt(v.toFixed(2), x, y + r * .55, 15, col, { font: "Noto Serif", wt: 700 }) + txt(lab, x, y + r + 30, 17, "#fff"); return g; }
  // under the water: dark, light from the surface, bubbles, Joe sinking
  function underwater(t, k) {
    var g = R(-220, -220, 800, 1300, "url(#under)", { s: 0 }) + rays(t, 180, -40, 1.57, 5, 500, .12);
    for (var i = 0; i < 30; i++) { var p = (t * .3 + hash(i)) % 1; g += Ci(80 + hash(i * 3) * 200 + Math.sin(t * 2 + i) * 6, 460 - p * 460, 1.5 + hash(i) * 4, "none", { w: 1, op: .6 * (1 - p) }).replace('stroke="' + INK + '"', 'stroke="#bfe2ff"'); }
    g += PERSON.front(Object.assign({}, JOE, { x: 180, y: lerp(300, 360, k), s: .9, rot: 0, colors: Object.assign({}, JOE.colors), legs: "stand", slump: .5, head: { tilt: -14, nod: .3 }, face: { eyes: .1, brows: "worried", mouth: "frown" }, arms: [{ rel: [-90, 30 + 10 * Math.sin(t)], hand: "open", bend: 1 }, { rel: [90, 20 + 10 * Math.cos(t)], hand: "open", bend: -1 }] })).svg;
    return g + R(-220, -220, 800, 1300, "#0a2030", { s: 0, op: .25 });
  }
  function quoteCard(t, u, lines) { var g = R(-220, -220, 800, 1300, "#0b0d12", { s: 0 }) + dust(t, 30, "#9fb4c8", .35, 5); lines.forEach(function (l, i) { var k = clamp((u - l[1]) / .5); g += txt(l[0], 180, 230 + i * 70, l[2] || 26, l[3] || "#fff", { op: k, wt: 900 }); }); return g + txt("من نص الصندوق الأسود · مكتوب، مش تسجيل", 180, 400, 12, "#9aa3ad", { op: clamp(u / .6) }); }
  function nameTag(s, x, y, u, at) { return label(s, x, y, u, at, 16, YEL); }
  var WY2 = 380;
  function dcWide(t, o) { o = o || {}; return snowSky(t, o) + dcSkyline(WY2 - 70, .7, { x: 180 }) + iceRiver(t, WY2 - 64) + bridge14(180, WY2 - 30, .7, t, o.bridge || {}) + (o.nosnow ? "" : snow(t, 90, .85)); }

  // ── the shots ──
  // 0 · the real CBS footage of the rescue, big, over the frozen river; the recording bar
  shot(0, push([180, 320], [180, 326], 1.0, 1.08), function (u, d, t) { return snowSky(t) + iceRiver(t, 300, { open: [200, 360, 80] }) + tailIce(200, 360, .9, t) + snow(t, 80, .8) + rec(t, 62, "نشرة CBS · يوم الحادثة"); }, { foot: "hook", fw: 330, fy: 120, rot: 0, sync: 1, cap: "فيديو حقيقي · نشرة CBS · 13 يناير 1982" });
  // 1 · it is real: the helicopter over the ice, the tail in the river
  shot(1, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return snowSky(t) + iceRiver(t, 300, { open: [190, 380, 90] }) + tailIce(190, 380, 1.0, t) + heli(lerp(260, 200, u / d), 200, .9, t, { rope: 140, dir: -1 }) + snow(t, 80, .8); });
  // 2 · date and place
  shot(2, push([180, 320], [190, 330], 1.0, 1.1), function (u, d, t) { return dcWide(t) + label("13 يناير 1982", 180, 160, u, .3, 32, "#fff") + label("واشنطن · 4 العصر", 180, 200, u, .8, 20, YEL); });
  // 3 · the snowstorm, the frozen Potomac
  shot(3, push([180, 360], [180, 340], 1.3, 1.15), function (u, d, t) { return snowSky(t) + dcSkyline(300, .6, { x: 180, haze: .6 }) + iceRiver(t, 300) + snow(t, 160, .95, 1) + label("عاصفة تلج", 180, 170, u, .4, 30, "#fff"); });
  // 4 · a plane to Florida, 79 people
  shot(4, push([180, 320], [170, 320], 1.0, 1.1), function (u, d, t) { return snowSky(t) + b737({ x: lerp(140, 220, u / d), y: 320, s: 1.05, t: t, ice: 1 }) + snow(t, 100, .85) + label("← فلوريدا ☀", 180, 150, u, .4, 22, YEL) + bigNum("79", 180, 230, u, D(4) * .5, 56, "#fff"); });
  // 5 · under a minute after takeoff
  shot(5, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#1a2230", { s: 0 }) + snow(t, 60, .4) + watch(180, 270, 80, t, { h: 3.98, sec: u * 6 * 12 }) + label("أقل من دقيقة", 180, 420, u, .5, 28, YEL); });
  // 6 · one switch nobody turned on
  shot(6, push([180, 270], [180, 280], 1.2, 1.35), function (u, d, t) { return antiIce(t, { lit: 1 }) + txt("؟", 180, 110, 60, YEL, { st: "rgba(0,0,0,.6)", sw: 4, op: clamp((u - D(6) * .5) / .4) }); });
  // 7 · the first officer said it, more than once
  shot(7, push([180, 300], [140, 300], 1.15, 1.4), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, jeff: { face: { brows: "worried", eyes: 1.15, mouth: "open", look: [1, 0] }, head: { turn: .6 } }, sully: { face: { brows: "neutral", look: [-.3, 0] } } }) + snow(t, 30, .5) + label("«ده مش مظبوط»", 120, 196, u, .5, 15, "#fff"); });
  // 8 · minute by minute, from the airport
  shot(8, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = snowSky(t) + R(-220, 330, 800, 400, "#e8eaec", { w: 1.6 }) + R(40, 240, 280, 90, "#c9c4b8", { w: 1.6 }); for (var i = 0; i < 10; i++) s += R(52 + i * 27, 262, 18, 26, "#ffd98a", { w: 1 }); return s + R(30, 232, 300, 10, SNOWC, { w: 1 }) + b737({ x: 120, y: 360, s: .6, t: t, ice: 1 }) + snow(t, 100, .85) + label("نبدأ من المطار", 180, 170, u, .5, 24, "#fff"); });
  // 9 · the airport closed in the morning: plows on the runway
  shot(9, push([180, 340], [200, 330], 1.0, 1.1), function (u, d, t) { var s = snowSky(t) + R(-220, 330, 800, 400, "#eef0f2", { w: 1.6 }) + R(-220, 360, 800, 40, "#b8bcc2", { w: 1 }); for (var k = 0; k < 3; k++) { var px = lerp(-60, 420, ((u / d) + k * .33) % 1); s += G("translate(" + f(px) + " 372)", R(-24, -26, 40, 26, "#e8a020", { w: 1.6 }) + R(-14, -38, 20, 14, "#e8a020", { w: 1.4 }) + P("M16 -18 L34 -4 L34 4 L16 0 Z", "#7a7a80", { w: 1.4 }) + Ci(-14, 0, 6, "#1a1c20", {}) + Ci(8, 0, 6, "#1a1c20", {}) + Ci(-4, -42, 3, "#ff8a3a", { s: 0, op: .6 + .4 * Math.sin(t * 8 + k) })); } return s + snow(t, 140, .9, 1) + label("المطار مقفول", 180, 170, u, .4, 26, "#fff"); });
  // 10 · reopened at noon, everyone late: the crowd at the gate
  shot(10, push([180, 330], [180, 320], 1.0, 1.06), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#d6d0c2", { s: 0 }) + R(-220, 120, 800, 160, "url(#skySnow)", { w: 2 }) + snow(t, 40, .6) + R(-220, 280, 800, 30, "#8a8478", { w: 1.6 }) + R(220, 150, 110, 30, "#1a1c20", { w: 1.4 }) + txt("DELAYED", 275, 171, 12, "#ff8a3a", { font: "Noto Serif", wt: 700 }); for (var i = 0; i < 6; i++) s += PERSON.front({ x: 20 + i * 64, y: 470, s: .62, legs: "stand", breath: (Math.sin(t * 2 + i) + 1) / 2, outfit: { base: "office", tie: i % 2 }, colors: { shirt: PAX[i][0], shirtD: PAX[i][1], hair: PAX[i][2], skin: SKN[i] }, head: { turn: (hash(i) - .5) * 1.2, tilt: 3 * Math.sin(t + i) }, face: { eyes: blink(t, 1, i), brows: "worried", mouth: "frown", look: [0, -.4] }, arms: [{ rel: [-20, 120], hand: "relaxed", bend: 1 }, { rel: [20, 120], hand: "relaxed", bend: -1 }] }).svg; return s; });
  // 11 · Joe Stiley, on a business trip; his son's birthday
  shot(11, push([180, 310], [180, 300], 1.0, 1.12), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#d6d0c2", { s: 0 }) + R(-220, 120, 800, 160, "url(#skySnow)", { w: 2 }) + snow(t, 40, .6) + R(-220, 280, 800, 30, "#8a8478", { w: 1.6 }); s += PERSON.front(Object.assign({}, JOE, { x: 180, y: 520, s: 1.25, legs: "stand", colors: Object.assign({}, JOE.colors), breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: -6, nod: .15 }, face: { eyes: blink(t, 1), mouth: "smile", look: [0, .8] }, arms: [{ to: [160, 400], hand: "relaxed", bend: 1 }, { to: [200, 400], hand: "relaxed", bend: -1 }] })).svg; s += G("translate(180 392) rotate(-4)", R(-22, -16, 44, 32, "#f6f1e4", { w: 1.4 }) + R(-18, -12, 36, 22, "#8ab0d0", { w: .8 }) + Ci(0, -2, 5, "#e3ad90", { w: .8 })); return s + nameTag("جو ستايلي", 180, 140, u, .4) + label("عيد ميلاد ابنه 🎂", 180, 166, u, D(11) * .6, 15, "#fff"); });
  // 12 · remember Joe
  shot(12, push([180, 300], [180, 296], 1.5, 1.6), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#d6d0c2", { s: 0 }) + R(-220, 120, 800, 160, "url(#skySnow)", { w: 2 }) + snow(t, 40, .6); s += PERSON.front(Object.assign({}, JOE, { x: 180, y: 520, s: 1.25, legs: "stand", colors: Object.assign({}, JOE.colors), head: { tilt: 0, turn: 0 }, face: { eyes: blink(t, 1), mouth: "neutral", look: [0, 0] }, arms: [{ to: [160, 400], hand: "relaxed", bend: 1 }, { to: [200, 400], hand: "relaxed", bend: -1 }] })).svg; return s + label("افتكروا جو", 180, 140, u, .1, 18, YEL); });
  // 13 · the captain and the first officer
  shot(13, push([180, 300], [180, 300], 1.15, 1.25), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER }) + snow(t, 30, .5) + label("الكابتن لاري · 34", 255, 190, u, .4, 13, YEL) + label("المساعد روجر", 105, 190, u, 1.4, 13, YEL); });
  // 14 · the Boeing 737, flight 90
  shot(14, push([180, 320], [190, 320], 1.0, 1.1), function (u, d, t) { return snowSky(t) + R(-220, 360, 800, 400, "#eef0f2", { w: 1.6 }) + b737({ x: 180, y: 330, s: 1.15, t: t, ice: 1 }) + snow(t, 110, .85) + label("رحلة 90", 180, 170, u, .4, 30, "#fff") + label("بوينج 737", 180, 206, u, 1, 17, YEL); });
  // 15 · about 2:30: de-icing, the orange fluid sprayed on
  shot(15, push([200, 320], [180, 320], 1.1, 1.2), function (u, d, t) { var s = snowSky(t) + R(-220, 360, 800, 400, "#eef0f2", { w: 1.6 }) + b737({ x: 150, y: 330, s: 1.15, t: t }); s += G("translate(300 380)", R(-40, -34, 80, 34, "#e8c020", { w: 1.6 }) + Ci(-24, 0, 8, "#1a1c20", {}) + Ci(24, 0, 8, "#1a1c20", {}) + '<path d="M0 -34 L-30 -110" stroke="' + INK + '" stroke-width="6"/><path d="M0 -34 L-30 -110" stroke="#e8c020" stroke-width="3.6"/>' + R(-44, -124, 28, 18, "#e8c020", { w: 1.4 })); for (var i = 0; i < 26; i++) { var p = (t * 1.4 + i / 26) % 1; s += Ci(lerp(260, 150 + hash(i) * 60, p), lerp(262, 300 + hash(i * 3) * 30, p) + p * p * 20, 2.4, "#f0943a", { s: 0, op: .8 * (1 - p) }); } return s + snow(t, 80, .8) + label("حوالي 2:30", 180, 170, u, .4, 26, "#fff"); });
  // 16 · 49 minutes in the queue
  shot(16, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = snowSky(t) + R(-220, 360, 800, 400, "#eef0f2", { w: 1.6 }); for (var i = 3; i >= 0; i--) s += b737({ x: 40 + i * 110, y: 360 - i * 10, s: .45 - i * .04, t: t, ice: 1 }); return s + snow(t, 140, .9, 1) + bigNum("49", 150, 200, u, .5, 60) + label("دقيقة", 220, 194, u, .9, 22, "#fff"); });
  // 17 · the snow builds up on the wings again
  shot(17, push([150, 330], [160, 340], 1.6, 1.9), function (u, d, t) { var k = clamp(u / d), s = snowSky(t) + G("translate(180 340) scale(3)", P("M-50 0 L50 -14 L54 -8 L-46 8 Z", "#c9d0d7", { w: 1 }) + P("M-50 0 L50 -14 L52 -" + f(11 + 3 * k) + " L-48 " + f(-2 - 4 * k) + " Z", SNOWC, { w: .6, op: .4 + .6 * k })); return s + snow(t, 180, .95, 1) + label("التلج بيرجع", 180, 170, u, .4, 24, "#fff"); });
  // 18 · the checklist: "engine anti-ice?"
  shot(18, push([140, 300], [160, 300], 1.4, 1.5), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, book: 1, cpt: LARRY, fo: ROGER, jeff: { head: { nod: .4, turn: .1 }, face: { look: [0, 1], mouth: Math.sin(t * 9) > 0 && u > .8 ? "open" : "neutral" }, arms: [{ to: [78, 418], hand: "relaxed", bend: 1 }, { to: [132, 418], hand: "relaxed", bend: -1 }] } }) + snow(t, 30, .5) + label("«تدفئة المحركات؟»", 120, 196, u, .8, 15, "#fff"); });
  // 19 · "off"
  shot(19, push([180, 290], [180, 290], 1.3, 1.4), function (u, d, t) { return antiIce(t, { lit: 1 }) + label("«مقفولة»", 180, 110, u, .3, 26, YEL); });
  // 20 · remember that word too
  shot(20, push([180, 300], [180, 300], 1.4, 1.55), function (u, d, t) { return antiIce(t, { lit: 1, ring: 1 }) + label("افتكروا الكلمة دي", 180, 110, u, .1, 18, YEL); });
  // 21 · what engine anti-ice does: keeps ice off a small probe in the engine inlet
  shot(21, push([180, 320], [180, 320], 1.1, 1.3), function (u, d, t) { var k = clamp(u / d); return snowSky(t) + engineFront(180, 320, 100, t, { ang: t * 10, blur: .5 }) + Ci(232, 268, 7, "#c9d0d7", { w: 1.6 }) + Ci(232, 268, 7 + 6 * k, SNOWC, { w: 1, op: k }) + arrowL(300, 200, 244, 262, YEL, clamp((u - .4) / .5), 3) + label("حساس", 300, 190, u, .6, 18, YEL) + snow(t, 60, .7); });
  // 22 · the probe tells the pilots how hard the engine is pushing
  shot(22, push([180, 300], [180, 300], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#14181e", { s: 0 }) + dial(180, 280, 90, lerp(1.0, 1.7, clamp(u / 2)), "قوة المحرك", "#7fd6ff"); });
  // 23 · blocked, it read full power; the truth was much less
  shot(23, push([180, 300], [180, 300], 1.0, 1.06), function (u, d, t) { return R(-220, -220, 800, 1300, "#14181e", { s: 0 }) + dial(95, 270, 70, 2.04, "العداد بيقول", "#4ac06a") + dial(265, 270, 70, lerp(2.04, 1.70, clamp((u - D(23) * .45) / 1)), "الحقيقة", "#ff6a4a"); });
  // 24 · one minute to four: the takeoff run in the snow
  shot(24, push([180, 320], [190, 320], 1.0, 1.1), function (u, d, t) { var k = ease(u / d); return snowSky(t) + R(-220, 360, 800, 400, "#eef0f2", { w: 1.6 }) + R(-220, 372, 800, 30, "#9aa0a8", { w: 1 }) + b737({ x: lerp(40, 260, k), y: 360, s: .8, t: t, thrust: 1, ice: 1 }) + snow(t, 120, .9, 1) + label("3:59", 180, 160, u, .3, 44, "#fff"); });
  // 25-27 · "that's not right" / "yes it is" / "no, it's not right"
  shot(25, push([120, 300], [110, 296], 1.7, 1.9), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, jeff: { face: { brows: "worried", eyes: 1.2, mouth: u > D(25) * .5 && Math.sin(t * 9) > 0 ? "open" : "frown", look: [0, .8] }, head: { turn: .2, nod: .2 } } }) + snow(t, 30, .5) + label("«ده مش مظبوط»", 110, 196, u, D(25) * .5, 14, "#fff"); });
  shot(26, push([255, 300], [255, 296], 1.7, 1.9), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, sully: { face: { brows: "angry", mouth: Math.sin(t * 9) > 0 ? "open" : "neutral", look: [0, 0] } } }) + snow(t, 30, .5) + label("«لا، مظبوط»", 255, 196, u, .3, 14, "#fff"); });
  shot(27, push([110, 300], [120, 300], 1.8, 1.9), function (u, d, t) { return cockpit(t, { sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, jeff: { face: { brows: "worried", eyes: 1.1, mouth: Math.sin(t * 9) > 0 ? "open" : "frown", look: [1, 0] }, head: { turn: .6 } } }) + snow(t, 30, .5) + label("«لا… مش مظبوط»", 110, 196, u, .3, 14, "#fff"); });
  // 28 · rotated, and lifted off
  shot(28, push([180, 320], [200, 300], 1.0, 1.1), function (u, d, t) { var k = ease(u / d); return snowSky(t) + R(-220, 380, 800, 400, "#eef0f2", { w: 1.6 }) + b737({ x: lerp(100, 280, k), y: lerp(380, 320, k * k), s: .8, rot: -lerp(0, 10, clamp(k * 3)), t: t, thrust: 1, ice: 1 }) + snow(t, 120, .9, 1); });
  // 29 · it would not climb: the stick shaker, the whole cockpit shaking
  shot(29, push([180, 300], [180, 300], 1.2, 1.3), function (u, d, t) { var j = 2.4 * Math.sin(t * 90), s = G("translate(" + f(j) + " " + f(j * .6) + ")", cockpit(t, { warn: 1, sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, sully: { face: { eyes: 1.25, brows: "worried", mouth: "o" } }, jeff: { face: { eyes: 1.25, brows: "worried", mouth: "open", look: [1, 0] }, head: { turn: .5 } } })); return s + snow(t, 30, .5) + label("الطيارة بتقع", 180, 120, u, D(29) * .5, 24, "#ff6a4a"); });
  // 30 · imagine: by the window, the bridge and the stopped cars coming up
  shot(30, push([180, 320], [170, 330], 1.0, 1.08), function (u, d, t) { var k = clamp(u / d), g = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 }), wx = 60, wy = 140, ww = 150, wh = 200; g += '<clipPath id="win2"><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60"/></clipPath><g clip-path="url(#win2)">' + sky("skySnow") + iceRiver(t, lerp(400, 260, k)) + bridge14(135, lerp(420, 300, k), lerp(.4, 1.4, k * k), t) + snow(t, 60, .9) + '</g><rect x="' + (wx - 14) + '" y="' + (wy - 14) + '" width="' + (ww + 28) + '" height="' + (wh + 28) + '" rx="72" fill="none" stroke="#ece8de" stroke-width="22"/><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60" fill="none" stroke="' + INK + '" stroke-width="2.4"/>'; g += PERSON.front(Object.assign({}, JOE, { x: 260, y: 600, s: 1.7, legs: "sit", colors: Object.assign({}, JOE.colors), breath: (Math.sin(t * 2.4) + 1) / 2, head: { turn: -.8, tilt: -6 }, face: { eyes: 1.2, brows: "worried", mouth: "o", look: [-1, .3] }, arms: [{ to: [180, 470], hand: "fist", bend: 1 }, { to: [330, 560], hand: "relaxed", bend: -1 }] })).svg; return g; });
  // 31 · in the cockpit, the last two sentences (the cliffhanger frame)
  shot(31, push([180, 300], [180, 290], 1.25, 1.45), function (u, d, t) { return cockpit(t, { warn: 1, sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, sully: { face: { eyes: 1.1, brows: "worried", mouth: "frown" } }, jeff: { face: { eyes: 1.2, brows: "worried", mouth: "frown", look: [1, 0] }, head: { turn: .5 } } }); });
  // 32 · the bio line: the same frame, still creeping, and the pill
  shot(32, push([180, 290], [180, 286], 1.45, 1.55), function (u, d, t) { return cockpit(t, { warn: 1, sky: "url(#skySnow)", nocity: 1, cpt: LARRY, fo: ROGER, sully: { face: { eyes: 1.1, brows: "worried", mouth: "frown" } }, jeff: { face: { eyes: 1.2, brows: "worried", mouth: "frown", look: [1, 0] }, head: { turn: .5 } } }); }, { pill: 1 });
  // 33 · back to the plane: low over the bridge
  shot(33, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = u / d; return snowSky(t) + dcSkyline(300, .55, { x: 180, haze: .5 }) + iceRiver(t, 304) + bridge14(180, 346, .8, t) + b737({ x: lerp(-40, 120, k), y: lerp(250, 290, k), s: .7, rot: -8, t: t, thrust: 1, ice: 1 }) + snow(t, 120, .9, 1); });
  // 34 · the last words, from the transcript (written, not a recording)
  shot(34, push([180, 300], [180, 300], 1.0, 1.05), function (u, d, t) { return quoteCard(t, u, [["«لاري… إحنا بنقع يا لاري.»", .2, 24], ["«أنا عارف.»", D(34) * .65, 28, YEL]]); });
  // 35 · into the bridge, then the river
  shot(35, push([180, 330], [180, 340], 1.05, 1.15), function (u, d, t) { var k = clamp(u / 1.6), hitK = u > 1.4, s = snowSky(t) + dcSkyline(300, .55, { x: 180, haze: .5 }) + iceRiver(t, 304, hitK ? { open: [250, 380, lerp(10, 70, clamp((u - 2) / 1.2))] } : {}) + bridge14(180, 346, .8, t, hitK ? { hit: [-60, 90] } : {}); if (!hitK) s += b737({ x: lerp(60, 200, k), y: lerp(290, 336, k), s: .7, rot: -8, t: t, ice: 1 }); else { var q = clamp((u - 1.4) / 1.2); s += b737({ x: lerp(200, 250, q), y: lerp(336, 390, q), s: .7, rot: lerp(-8, 20, q), t: t }); for (var i = 0; i < 24; i++) { var p = clamp((u - 1.5) / 1.6); s += Ci(240 + Math.cos(i) * p * 120, 370 - Math.abs(Math.sin(i * 1.7)) * p * 130 + p * p * 60, 3 + hash(i) * 5, i % 3 ? "#fff" : "#8a8a84", { s: 0, op: 1 - p }); } } return s + snow(t, 120, .9, 1); });
  // 36 · Joe under the water, blacking out
  shot(36, push([180, 300], [180, 320], 1.0, 1.15), function (u, d, t) { return underwater(t, clamp(u / d)); });
  // 37 · Joe's own voice (the real interview), synced to the card
  shot(37, push([180, 320], [180, 326], 1.15, 1.2), function (u, d, t) { return underwater(t, 1) + rec(t, 62, "جو ستايلي، من الناجين"); }, { foot: "joe", fw: 320, fy: 110, rot: 0, sync: 1, cap: "صوت حقيقي · جو ستايلي بيحكي" });
  // 38 · that is Joe himself, years later (the interview keeps playing)
  shot(38, push([180, 320], [180, 320], 1.2, 1.25), function (u, d, t) { return underwater(t, 1); }, { foot: "hosp", fw: 300, fy: 120, cap: "صورة حقيقية · جو في المستشفى، 1982" });
  // 39 · Joe came to, above the water, holding the tail
  shot(39, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return snowSky(t) + iceRiver(t, 280, { open: [190, 380, 110] }) + tailIce(190, 370, 1.1, t) + swimmer(150, 390, .38, t, 0, { base: JOE, face: { eyes: .8, mouth: "frown" }, arms: [{ rel: [40, -20], hand: "fist", bend: -1 }, { rel: [70, -40], hand: "fist", bend: -1 }] }) + swimmer(240, 400, .36, t, 1) + snow(t, 100, .9) + nameTag("جو", 150, 300, u, .5); });
  // 40 · of 79, five lived; four died in their cars on the bridge (the real wreck footage)
  shot(40, push([180, 380], [180, 370], 1.0, 1.08), function (u, d, t) { return snowSky(t, { dusk: 1 }) + iceRiver(t, 360, { open: [190, 440, 100] }) + tailIce(190, 440, .9, t) + snow(t, 90, .8) + bigNum("5", 140, 430, u, .6, 64, "#fff") + label("من 79", 220, 420, u, 1, 22, YEL); }, { foot: "wreck", cap: "فيديو حقيقي · نشرة CBS · حطام الطيارة" });
  // 41 · twenty minutes later, the police helicopter and the line (real footage)
  shot(41, push([180, 380], [180, 380], 1.0, 1.06), function (u, d, t) { return snowSky(t) + iceRiver(t, 360, { open: [190, 460, 100] }) + tailIce(190, 460, .8, t) + heli(lerp(320, 200, clamp(u / 2.5)), 380, .7, t, { rope: 70, dir: -1 }) + snow(t, 90, .8) + label("~20 دقيقة", 180, 340, u, .5, 20, YEL); }, { foot: "heli" });
  // 42 · Arland Williams, 46
  shot(42, push([180, 300], [180, 296], 1.3, 1.45), function (u, d, t) { return snowSky(t) + iceRiver(t, 250, { open: [180, 330, 120] }) + tailIce(260, 320, .9, t) + swimmer(180, 300, .6, t, 3, { face: { eyes: .9, brows: "worried", mouth: "neutral" }, arms: [{ rel: [-40, -40], hand: "fist", bend: 1 }, { rel: [50, 10], hand: "relaxed", bend: -1 }] }) + snow(t, 90, .8) + nameTag("آرلاند ويليامز · 46", 180, 140, u, .5); });
  // 43 · he caught the line and passed it on, twice
  shot(43, push([180, 300], [180, 300], 1.15, 1.2), function (u, d, t) { var ph = (u % 2.6) / 2.6, rx = lerp(200, 120, ease(clamp(ph * 2))); return snowSky(t) + iceRiver(t, 250, { open: [170, 330, 140] }) + heli(200, 100, .8, t, { rope: 190 }) + swimmer(200, 300, .5, t, 3, { arms: [{ to: [rx, 300 - 60], hand: "fist", bend: 1 }, { rel: [40, 10], hand: "relaxed", bend: -1 }] }) + swimmer(110, 320, .45, t, 1, { arms: [{ to: [rx - 4, 248], hand: "fist", bend: 1, straight: true }, { rel: [40, -10], hand: "fist", bend: -1 }] }) + Ci(rx, 240, 9, "none", { w: 3 }).replace('stroke="' + INK + '"', 'stroke="#e8c84a"') + snow(t, 90, .8); });
  // 44 · when the helicopter came back for him, he was gone
  shot(44, push([180, 300], [180, 310], 1.2, 1.3), function (u, d, t) { var s = snowSky(t, { dusk: 1 }) + iceRiver(t, 250, { open: [180, 330, 120] }); for (var r = 0; r < 3; r++) { var p = (t * .4 + r / 3) % 1; s += '<ellipse cx="180" cy="330" rx="' + f(20 + p * 90) + '" ry="' + f((20 + p * 90) * .25) + '" fill="none" stroke="#e8eef2" stroke-width="1.6" opacity="' + f2(.7 * (1 - p)) + '"/>'; } return s + heli(220, 120, .8, t, { rope: 170 }) + snow(t, 70, .7); });
  // 45 · Joe, both legs broken, took the line and two women with him
  shot(45, push([180, 320], [190, 320], 1.1, 1.2), function (u, d, t) { var x = lerp(260, 120, u / d); return snowSky(t) + iceRiver(t, 250, { open: [x, 336, 150] }) + heli(x + 10, 110, .8, t, { rope: 190 }) + swimmer(x, 320, .42, t, 0, { base: JOE, face: { eyes: 1, brows: "worried", mouth: "frown" }, arms: [{ to: [x + 14, 258], hand: "fist", bend: 1, straight: true }, { to: [x + 50, 330], hand: "fist", bend: -1 }] }) + swimmer(x + 56, 336, .38, t, 2) + swimmer(x - 44, 334, .38, t, 1, { arms: [{ rel: [-20, -10], hand: "fist", bend: 1 }, { to: [x - 10, 320], hand: "fist", bend: -1 }] }) + snow(t, 90, .8) + label("رجليه مكسورين", 180, 150, u, .6, 18, YEL); });
  // 46 · Joe's own voice: "Nikki lost her grip… my God, I've lost her" (the real footage of that tow, synced)
  shot(46, push([180, 330], [180, 330], 1.05, 1.1), function (u, d, t) { return snowSky(t) + iceRiver(t, 300) + snow(t, 60, .6) + rec(t, 62, "جو ستايلي، من الناجين"); }, { foot: "joerope", fw: 320, fy: 110, rot: 0, sync: 1, cap: "فيديو حقيقي · الهليكوبتر بتسحب جو والستّين" });
  // 47 · Priscilla let go near the bank, her hands frozen
  shot(47, push([180, 320], [170, 330], 1.1, 1.2), function (u, d, t) { var s = snowSky(t) + iceRiver(t, 240, { open: [130, 306, 90] }) + P("M-220 360 L380 300 L580 300 L580 900 L-220 900 Z", "#eef0f2", { w: 1.6 }); for (var i = 0; i < 6; i++) s += PERSON.front({ x: 250 + i * 34, y: 280 - i * 3, s: .3, legs: "stand", outfit: { base: "office", tie: false }, colors: { shirt: PAX[i][0], shirtD: PAX[i][1], hair: PAX[i][2], skin: SKN[i] }, head: { turn: -.6 }, face: { eyes: 1.2, brows: "worried", mouth: "open", look: [-1, .5] }, arms: [{ rel: [-30, 40], hand: "fist", bend: 1 }, { rel: [-40, -30], hand: "open", bend: -1 }] }).svg; return s + swimmer(130, 300, .45, t, 2, { face: { eyes: .6, brows: "worried", mouth: "open" }, arms: [{ rel: [-20, -60], hand: "open", bend: 1 }, { rel: [30, -70], hand: "open", bend: -1 }] }) + snow(t, 90, .8) + nameTag("بريسيلا", 130, 190, u, .6); });
  // 48 · Lenny Skutnik took off his coat and jumped in (the real footage of the bank)
  shot(48, push([180, 380], [180, 380], 1.0, 1.06), function (u, d, t) { var k = clamp((u - 1) / 1.4), s = snowSky(t) + iceRiver(t, 340) + P("M-220 440 L380 380 L580 380 L580 900 L-220 900 Z", "#eef0f2", { w: 1.6 }); var o = Object.assign({ x: lerp(300, 170, k), s: .5, dir: -1, lean: lerp(4, 40, k), outfit: { base: "office", tie: true }, colors: { shirt: "#e8eef3", shirtD: "#bccbd6", hair: "#2f2620", skin: "#e0a98a", pants: "#3b3f4a" }, head: { turn: -.5 }, face: { eyes: 1, brows: "angry", mouth: "frown" } }, PERSON.walkPose(u * 7, 1)); o.y = PERSON.sideHipY(o, lerp(410, 440, k)) + k * k * 20; o.rot = -lerp(0, 50, k); s += PERSON.side(o).svg; if (k > .9) s += '<ellipse cx="160" cy="450" rx="30" ry="7" fill="none" stroke="#fff" stroke-width="2"/>'; return s + G("translate(320 410)", P("M-16 0 L-10 -26 L10 -26 L16 0 Z", "#6a4a2a", { w: 1.2 })) + snow(t, 90, .8) + nameTag("ليني سكوتنيك", 180, 350, u, .5); }, { foot: "shore", cap: "فيديو حقيقي · الإنقاذ على شط النهر" });
  // 49 · the engine anti-ice that was off: the first cause
  shot(49, push([180, 290], [180, 290], 1.3, 1.4), function (u, d, t) { return antiIce(t, { lit: 1, x: clamp((u - .8) / .6) }) + label("السبب الأول", 180, 110, u, D(49) * .5, 24, YEL); });
  // 50 · the snow on the wings, the captain who did not listen
  shot(50, push([180, 300], [180, 300], 1.0, 1.06), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#14181e", { s: 0 }) + dust(t, 20, "#9fb4c8", .3, 2); [["1", "تدفئة المحركات مقفولة", 0], ["2", "تلج على الجناحات", D(50) * .3], ["3", "الكابتن ماسمعش لمساعده", D(50) * .62]].forEach(function (r, i) { var k = clamp((u - r[2]) / .4); s += G("translate(0 " + f((1 - eout(k)) * 10) + ")", Ci(310, 190 + i * 70, 18, YEL, { w: 1.6, op: k }) + txt(r[0], 310, 197 + i * 70, 20, INK, { op: k, wt: 900 }) + txt(r[1], 284, 198 + i * 70, 19, "#fff", { a: "start", op: k })); }); return s; });
  // 51 · taught to pilots everywhere: the first officer speaks, the captain listens
  shot(51, push([180, 300], [180, 300], 1.15, 1.25), function (u, d, t) { return cockpit(t, { sky: "url(#skyWinter)", nocity: 1, cpt: LARRY, fo: ROGER, jeff: { face: { mouth: Math.sin(t * 9) > 0 ? "open" : "neutral", look: [1, 0] }, head: { turn: .5 } }, sully: { head: { turn: .6 }, face: { brows: "raised", look: [-1, 0] } } }) + check(180, 150, 1.4, (u - D(51) * .6) / .4); });
  // 52 · the bridge renamed for Arland Williams; Joe saw his children grow up
  shot(52, push([180, 300], [180, 300], 1.0, 1.08), function (u, d, t) { return snowSky(t, { dusk: 1 }) + dcSkyline(360, .6, { x: 180, haze: .4 }) + iceRiver(t, 362) + bridge14(180, 400, .7, t, { lights: 1 }) + G("translate(180 200)", R(-130, -40, 260, 80, "#1f6a3a", { w: 2.4 }) + R(-124, -34, 248, 68, "none", { s: "#fff", w: 1.6 }) + txt("ARLAND D. WILLIAMS JR.", 0, -6, 17, "#fff", { font: "Noto Serif", wt: 700 }) + txt("MEMORIAL BRIDGE", 0, 20, 15, "#fff", { font: "Noto Serif", wt: 700 })) + snow(t, 40, .5); }, { foot: null });
  // 53 · 27 years later, in January again: another plane in a frozen river, everyone alive (Hudson)
  shot(53, push([180, 400], [180, 400], 1.3, 1.4), function (u, d, t) { return winter(t, { gold: 1 }) + skyline(380, .75, { x: 170, haze: .1 }) + river(t, 380, { gold: 1 }) + floating(t, 160, 430, .9) + ferry(300, 440, .9, t, -1) + label("2009 · نهر هدسون", 180, 300, u, D(53) * .3, 20, YEL); });
  // 54 · the call to comment: Washington at dusk, the snow easing
  shot(54, push([180, 330], [180, 320], 1.0, 1.06), function (u, d, t) { return snowSky(t, { dusk: 1 }) + dcSkyline(360, .7, { x: 180, haze: .3 }) + iceRiver(t, 362) + bridge14(180, 400, .7, t, { lights: 1 }) + snow(t, 30, .5); });

