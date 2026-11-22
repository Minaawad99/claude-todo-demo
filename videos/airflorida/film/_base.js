  // ── «معجزة هدسون» (US Airways 1549, 15 January 2009) in the «القصة 2D» look. The plane is drawn from the reference frames in
  //    ../refs (an A320 in the 2009 US Airways livery: white body, grey belly, "US AIRWAYS" in navy, red and blue cheat lines,
  //    a navy tail with white and red flag stripes, two CFM engines under the wings). Staging borrowed from the two videos the
  //    user sent: the red flight track on the map, the chase camera behind the plane down the river, the side view against the
  //    Manhattan skyline from the New Jersey bank, and the plane floating with people on the wings and the ferries coming.
  //    People: the shared person kit (PERSON.front / PERSON.side). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  function D(i) { return LN[i].end - LN[i].start; }
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  var CLIPN = 0, NAVY = "#1d2a5c", RED = "#c8322a", WHITE = "#f4f5f2", BELLY = "#b9c0c8", GREY = "#8a929c", YEL = "#f2c230", ORANGE = "#e0662f", GREEN = "#5affa0";
  PERSON.setInk(INK);

  // ── the plane, side view: nose to the right in local units (length ≈ 320), centre line y = 0 ──
  function a320(o) {
    var g = "", id = "fz" + (++CLIPN), t = o.t || 0;
    var body = "M-162 -9 L-104 -15 L116 -15 Q150 -14 157 1 Q152 14 120 15 L-86 15 Q-128 11 -162 -3 Z";
    // far wing and far engine (behind the body)
    g += P("M-8 4 L-54 -6 L-40 -6 L26 2 Z", "#9aa3ad", { w: 1.4 }) + P("M14 -2 h30 q8 0 8 5 v3 h-38 Z", "#aab2ba", { w: 1.2 });
    // tail fin with the flag stripes
    var fin = "M-102 -14 L-146 -76 L-126 -77 L-74 -14 Z";
    g += P(fin, NAVY, { w: 1.8 }) + '<clipPath id="' + id + 'f"><path d="' + fin + '"/></clipPath><g clip-path="url(#' + id + 'f)">';
    for (var k = 0; k < 5; k++) g += '<path d="M' + (-150 + k * 9) + ' -40 L' + (-96 + k * 9) + ' -20" stroke="' + (k % 2 ? RED : WHITE) + '" stroke-width="3.2"/>';
    g += '</g>' + P(fin, "none", { w: 1.8 });
    g += P(body, WHITE, { w: 2.2 });
    g += '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(-170, 5, 340, 14, BELLY, { s: 0 }) +
      '<path d="M-70 4.5 L150 4.5" stroke="' + RED + '" stroke-width="2"/><path d="M-70 7.5 L150 7.5" stroke="' + NAVY + '" stroke-width="2"/>' +
      R(-170, 9, 340, 10, "#000", { s: 0, op: .14 }) + '</g>';
    for (var x = -96; x < 104; x += 7.4) if (Math.abs(x - 96) > 6 && Math.abs(x + 92) > 4) g += '<rect x="' + f(x) + '" y="-7.5" width="3.4" height="4.6" rx="1.6" fill="#2a3442"/>';
    g += '<path d="M126 -9 L139 -9 L146 -3 L128 -3 Z M114 -9 L123 -9 L124 -3 L114 -3 Z" fill="#1d2430" stroke="' + INK + '" stroke-width="1"/>';
    g += R(98, -10, 9, 21, "none", { w: 1 }) + R(-98, -10, 8, 19, "none", { w: 1 });
    g += G((o.dir || 1) < 0 ? "translate(44 0) scale(-1 1)" : "", txt("US AIRWAYS", 22, -.5, 10.5, NAVY, { font: "Noto Serif", wt: 700, ls: .6 })) + '<rect x="-26" y="-8" width="9" height="6" fill="' + NAVY + '"/><path d="M-26 -6 h9 M-26 -4 h9" stroke="#fff" stroke-width=".8"/>';
    g += P("M-160 -6 L-128 -10 L-120 -6 L-152 -3 Z", "#c2c9d0", { w: 1.2 });   // stabiliser
    // near wing and engine
    g += P("M-6 10 L-60 30 L-44 31 L34 12 Z", "#c9d0d7", { w: 1.6 }) + '<path d="M-58 30 l-4 -6" stroke="' + INK + '" stroke-width="1.4"/>';
    var eng = "M2 14 h40 q12 0 12 8 v4 q0 8 -12 8 h-36 q-8 -2 -8 -10 Z";
    g += P(eng, "#dde2e7", { w: 1.8 }) + R(4, 26, 46, 7, "#000", { s: 0, op: .12 }) + '<ellipse cx="53" cy="24" rx="3.6" ry="9.6" fill="#2c323b" stroke="' + INK + '" stroke-width="1.4"/><path d="M2 20 h-8 v8 h8" fill="#7f8790" stroke="' + INK + '" stroke-width="1.2"/>';
    if (o.thrust) for (var i = 0; i < 4; i++) { var p = (t * 3 + i / 4) % 1; g += '<path d="M' + f(-8 - p * 50) + ' ' + f(24 + Math.sin(t * 9 + i) * 2) + ' h' + f(-12) + '" stroke="#fff" stroke-width="2" opacity="' + f2(.35 * (1 - p)) + '"/>'; }
    if (o.smoke) for (var j = 0; j < 9; j++) { var q = (t * .9 + j / 9) % 1; g += '<circle cx="' + f(-6 - q * 160) + '" cy="' + f(26 - q * 6 + Math.sin(j * 3) * 5) + '" r="' + f(4 + q * 16) + '" fill="#5a5a5e" opacity="' + f2(o.smoke * .5 * (1 - q)) + '"/>'; }
    if (o.fire) g += '<ellipse cx="-4" cy="24" rx="' + f(9 + 3 * Math.sin(t * 20)) + '" ry="4" fill="#ffb03a" opacity="' + f2(o.fire) + '"/><ellipse cx="-2" cy="24" rx="4" ry="2.4" fill="#fff4c0" opacity="' + f2(o.fire) + '"/>';
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f2((o.s || 1) * (o.dir || 1)) + " " + f2(o.s || 1) + ")", g);
  }
  // the plane from behind (the chase camera of the reference animation): bank = degrees
  function a320rear(x, y, s, t, o) {
    o = o || {}; var g = "";
    g += P("M-8 4 L-150 -4 L-150 -10 L-148 -12 L-10 -4 Z", "#c9d0d7", { w: 1.6 }) + P("M8 4 L150 -4 L150 -10 L148 -12 L10 -4 Z", "#c9d0d7", { w: 1.6 });
    g += P("M-150 -10 l-2 -9 l4 0 Z M150 -10 l2 -9 l-4 0 Z", NAVY, { w: 1 });
    [-1, 1].forEach(function (sd) { g += Ci(sd * 50, 10, 10, "#dde2e7", { w: 1.6 }) + Ci(sd * 50, 10, 5.4, "#2c323b", { w: 1 }) + (o.thrust ? Ci(sd * 50, 10, 3, "#ffb878", { s: 0, op: .5 + .3 * Math.sin(t * 20) }) : "") + R(sd * 50 - 2, -2, 4, 4, "#9aa3ad", { w: .8 }); });
    g += P("M-44 -8 L-4 -10 L-4 -4 L-44 -4 Z M44 -8 L4 -10 L4 -4 L44 -4 Z", "#c2c9d0", { w: 1.2 });
    g += '<ellipse cx="0" cy="0" rx="17" ry="17" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-16 5 A17 17 0 0 0 16 5 Z" fill="' + BELLY + '"/><path d="M-15 6 Q0 12 15 6" stroke="' + RED + '" stroke-width="1.4" fill="none"/>';
    g += P("M-4 -14 L-3 -64 L3 -64 L4 -14 Z", NAVY, { w: 1.6 }) + '<path d="M-2 -60 v40 M2 -60 v40" stroke="' + RED + '" stroke-width="1"/>';
    if (o.smoke) for (var j = 0; j < 6; j++) { var q = (t * .8 + j / 6) % 1; [-50, 50].forEach(function (ex) { g += '<circle cx="' + f(ex * (1 + q * .3)) + '" cy="' + f(12 + q * 30) + '" r="' + f(3 + q * 12) + '" fill="#6a6a70" opacity="' + f2(o.smoke * .5 * (1 - q)) + '"/>'; }); }
    return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(o.bank || 0) + ") scale(" + f2(s) + ")", g);
  }

  // ── New York: sky, sun, the Manhattan skyline seen from the New Jersey bank, the Hudson with ice ──
  function winter(t, o) { o = o || {}; return sky(o.gold ? "skyGold" : "skyWinter") + '<circle cx="' + (o.sx || 300) + '" cy="' + (o.sy || 110) + '" r="70" fill="url(#warm)" opacity=".7"/>' + Ci(o.sx || 300, o.sy || 110, 15, "#fff6d8", { s: 0 }) + cloudBank(t, 70, 3, 4, "#ffffff", .35, .8) + rays(t, o.sx || 300, o.sy || 110, 2.3, 4, 560, .12); }
  var SKY = (function () { var b = [], x = -330; while (x < 330) { var w = 11 + hash(x * .37) * 18, mid = Math.exp(-Math.pow((x + 20) / 150, 2)), h = 22 + hash(x * .91 + 3) * 46 + mid * 95; b.push([x, w, h, Math.floor(hash(x * 1.7) * 5), Math.floor(hash(x * 2.3) * 4)]); x += w - 2 + hash(x) * 4; } return b; })();
  var TONES = ["#dccfb6", "#c6b79c", "#b9c2c9", "#a99f8c", "#d2d6d8"];
  function tower(x, w, h, tone, top, sh) {
    var g = "", hb = h;
    if (top === 1) { g += R(x + w * .2, -h - 12, w * .6, 14, tone, { w: 1 }); }   // a setback
    if (top === 2) g += '<path d="M' + f(x + w / 2) + ' ' + f(-h) + ' v-' + f(10 + w * .6) + '" stroke="' + INK + '" stroke-width="1.2"/>';   // an antenna
    if (top === 3) g += P("M" + f(x) + " " + f(-h) + " L" + f(x + w / 2) + " " + f(-h - w * .5) + " L" + f(x + w) + " " + f(-h) + " Z", tone, { w: 1 });   // a pyramid roof
    g += R(x, -h, w, h, tone, { w: 1.1 }) + R(x + w * .62, -h, w * .38, h, sh, { s: 0, op: .5 });
    for (var yy = -h + 5; yy < -3; yy += 5) for (var xx = x + 2.5; xx < x + w - 2; xx += 3.4) if (hash(xx * 3 + yy) > .45) g += '<rect x="' + f(xx) + '" y="' + f(yy) + '" width="1.6" height="2.2" fill="#4a5262" opacity=".45"/>';
    return g;
  }
  function skyline(y, s, o) {
    o = o || {}; var g = "", sh = o.shade || "#6a7486";
    SKY.forEach(function (b, i) { if (i % 2) g += tower(b[0] + 4, b[1] * .9, b[2] * 1.25 + 8, "#aeb8c4", b[4], "#8a96a6"); });
    g += R(-340, -260, 680, 262, "#dfe6ee", { s: 0, op: .35 });
    SKY.forEach(function (b, i) { g += tower(b[0], b[1], b[2], o.lit && i % 3 === 0 ? o.lit : TONES[b[3]], b[4], sh); });
    // the Empire State Building and the Chrysler Building, from their real outlines
    g += P("M-34 0 V-150 H-28 V-168 H-22 V-180 H-17 V-196 H-14 V-212 L-12.5 -232 L-11 -212 V-196 H-8 V-180 H-3 V-168 H3 V-150 H9 V0 Z", "#d8ccb2", { w: 1.2 }) + R(-12.5, -196, 11, 196, sh, { s: 0, op: .45 });
    g += P("M40 0 V-150 H44 V-168 Q50 -186 56 -168 H60 V-150 H64 V0 Z", "#cfc6b6", { w: 1.2 }) + '<path d="M45 -166 L52 -194 L59 -166 M47 -170 Q52 -180 57 -170 M48 -175 Q52 -183 56 -175" stroke="' + INK + '" stroke-width=".9" fill="#e6e1d6"/>';
    g += R(-340, -14, 680, 14, "#5a5e64", { w: 1 });   // the piers and the West Side Highway at the waterline
    return G("translate(" + f(o.x || 180) + " " + f(y) + ") scale(" + f2(s) + ")", g + (o.haze ? R(-340, -270, 680, 272, "#dfe6ee", { s: 0, op: o.haze }) : ""));
  }
  function river(t, y, o) {
    o = o || {}; var g = R(-400, y, 1160, 900, o.gold ? "url(#hudsonG)" : "url(#hudsonW)", { s: 0 }) + '<path d="M-400 ' + y + ' H760" stroke="#2c3440" stroke-width="2.4"/>';
    g += glints(t, y, 40, o.gold ? "#f6d8b0" : "#e4eef6");
    for (var i = 0; i < (o.ice == null ? 14 : o.ice); i++) { var x = ((hash(i * 4) * 900 + t * (3 + hash(i) * 4)) % 900) - 250, yy = y + 14 + hash(i * 7) * 260, w = 8 + hash(i + 2) * 22 * (1 + (yy - y) / 160); g += '<ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * .18) + '" fill="#eef3f6" stroke="' + INK + '" stroke-width=".8" opacity=".85"/>'; }
    return g;
  }
  function glints(t, wy, n, col) { var s = ""; for (var i = 0; i < (n || 44); i++) { var x = ((hash(i) * 800 + t * (14 + hash(i + 7) * 22)) % 800) - 220; s += '<path d="M' + f(x) + ' ' + f(wy + 8 + hash(i + 2) * 230) + ' h' + f(14 + hash(i + 5) * 26) + '" stroke="' + (col || "#a8c0e6") + '" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function njBank(y) { var g = P("M-400 " + y + " L760 " + (y - 10) + " L760 900 L-400 900 Z", "#e9ecef", { w: 1.6 }); for (var i = 0; i < 16; i++) g += R(-380 + i * 70, y - 2 - i * .6, 46, 6, "#9aa3ad", { w: 1 }); return g + R(-400, y + 30, 1160, 800, "#c7ccd2", { s: 0, op: .6 }); }
  // the far shore seen from the river, running down the frame as two banks (for the chase camera)
  function corridor(t, k, o) {
    o = o || {}; var g = winter(t, { sx: 250, sy: 120 }), hz = 260;
    g += skyline(hz, .55, { x: 70, lit: "#cbbfa8", haze: .25 }) + G("translate(240 0)", skyline(hz + 2, .32, { x: 40, lit: "#b8c0c8", haze: .4 }));
    g += P("M-400 " + hz + " L760 " + hz + " L760 900 L-400 900 Z", "url(#hudsonW)", { s: 0 });
    g += P("M-400 " + (hz + 2) + " L150 " + hz + " L-60 640 L-400 640 Z", "#9a9a90", { w: 1.4 }) + P("M210 " + hz + " L760 " + (hz + 4) + " L760 640 L420 640 Z", "#a7a596", { w: 1.4 });
    for (var i = 0; i < 26; i++) { var p = (k * 3 + t * .25 + i / 26) % 1, yy = hz + p * p * 400; g += '<path d="M' + f(150 - p * p * 210 - 10) + ' ' + f(yy) + ' h' + f(-20 - 80 * p) + '" stroke="#5a5a56" stroke-width="' + f(1 + p * 3) + '" opacity=".6"/><path d="M' + f(210 + p * p * 210 + 10) + ' ' + f(yy) + ' h' + f(20 + 80 * p) + '" stroke="#5a5a56" stroke-width="' + f(1 + p * 3) + '" opacity=".6"/>'; }
    for (var j = 0; j < 30; j++) { var q = (t * .3 + j / 30) % 1, yy2 = hz + 6 + q * q * 380; g += '<path d="M' + f(180 + (hash(j) - .5) * 60 * (1 + q * 4)) + ' ' + f(yy2) + ' h' + f(8 + q * 30) + '" stroke="#e4eef6" stroke-width="1.2" opacity="' + f2(.5 * q) + '"/>'; }
    return g;
  }

  // ── geese (Canada geese, side view: brown back, pale breast, black neck and head, white chin strap) ──
  function goose(x, y, s, t, ph, dir) {
    var fl = Math.sin(t * 9 + ph), g = "";
    g += P("M-14 0 Q-4 -7 10 -3 Q16 0 10 4 Q-2 8 -14 3 Z", "#8a7660", { w: 1.2 }) + P("M-6 3 Q2 6 9 3", "none", { w: 0 }) + P("M-10 2 Q0 6 8 3 Q0 4 -10 2 Z", "#e6ddcc", { s: 0 });
    g += P("M9 -2 Q20 -6 26 -9 L27 -6 Q20 -3 11 2 Z", "#1a1a1c", { w: 1 }) + P("M25 -10 Q30 -12 32 -9 L36 -8 L31 -6 Q27 -5 25 -7 Z", "#1a1a1c", { w: 1 }) + '<path d="M26 -8.5 Q28 -6 30 -7" stroke="#fff" stroke-width="1.6" fill="none"/>';
    g += P("M-14 1 L-20 -1 L-18 3 Z", "#2a2a2c", { w: .8 });
    g += G("rotate(" + f(fl * 50) + " -2 -3)", P("M-4 -3 Q-10 -18 -26 -26 Q-16 -10 -10 -2 Z", "#6f5d4a", { w: 1.1 }));
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s * (dir || 1)) + " " + f2(s) + ")", g);
  }
  function flock(t, cx, cy, sc, n, dir, spread) { var g = ""; for (var i = 0; i < n; i++) { var row = Math.floor((i + 1) / 2), sd = i % 2 ? 1 : -1; g += goose(cx - row * 26 * sc * (dir || 1) + Math.sin(t + i) * 3, cy + sd * row * 14 * sc * (spread || 1) + Math.cos(t * 1.3 + i) * 2, sc, t, i * 1.7, dir); } return g; }

  // ── an engine seen from the front, under the wing (after the v03 engine close-up): spin = fan speed ──
  function engineFront(x, y, r, t, o) {
    o = o || {}; var g = P("M" + (-r * 3) + " " + f(-r * 1.25) + " L" + (r * 3) + " " + f(-r * 1.55) + " L" + (r * 3) + " " + f(-r * 1.05) + " L" + (-r * 3) + " " + f(-r * .8) + " Z", "#b9c1c9", { w: 2 }) + R(-r * .25, -r * 1.05, r * .5, r * .4, "#9aa3ad", { w: 1.4 });
    g += Ci(0, 0, r, "#e6eaee", { w: 2.4 }) + Ci(0, 0, r * .86, "#3a414a", { w: 1.6 });
    var a = o.ang || 0;
    for (var i = 0; i < 18; i++) { var aa = a + i / 18 * 6.283, bent = o.broken && i % 4 === 0 ? .5 : 0; g += '<path d="M' + f(Math.cos(aa) * r * .2) + ' ' + f(Math.sin(aa) * r * .2) + ' Q' + f(Math.cos(aa + .25 + bent) * r * .55) + ' ' + f(Math.sin(aa + .25 + bent) * r * .55) + ' ' + f(Math.cos(aa + .1 + bent * 1.6) * r * .84) + ' ' + f(Math.sin(aa + .1 + bent * 1.6) * r * .84) + '" stroke="#c9d0d7" stroke-width="' + f(r * .09) + '" stroke-linecap="round"/>'; }
    if (o.blur) g += Ci(0, 0, r * .84, "#9aa3ad", { s: 0, op: o.blur * .7 });
    g += Ci(0, 0, r * .2, "#e8ecef", { w: 1.6 }) + '<path d="M' + f(-r * .08) + ' ' + f(-r * .08) + ' l' + f(r * .12) + ' ' + f(r * .12) + '" stroke="' + INK + '" stroke-width="1.4" transform="rotate(' + f(a * 57.3) + ')"/>';
    g += '<path d="M' + f(-r * .7) + ' ' + f(-r * .55) + ' A' + f(r * .9) + ' ' + f(r * .9) + ' 0 0 1 ' + f(r * .3) + ' ' + f(-r * .85) + '" stroke="#fff" stroke-width="' + f(r * .05) + '" fill="none" opacity=".5"/>';
    if (o.smoke) for (var j = 0; j < 8; j++) { var q = (t * .7 + j / 8) % 1; g += Ci(Math.sin(j * 2.1) * r * .4, -q * r * 2.6, r * (.2 + q * .6), "#4a4a50", { s: 0, op: o.smoke * .55 * (1 - q) }); }
    return G("translate(" + f(x) + " " + f(y) + ")", g);
  }

  // ── the cockpit, seen from the instrument panel: Sully in the left seat (on the viewer's right), Jeff on the right ──
  var SULLY = { outfit: { base: "pilot", hat: null }, colors: { hair: "#e8e6df", hairL: "#ffffff", skin: "#e3ad90" }, headset: true };
  var JEFF = { outfit: { base: "pilot", hat: null }, colors: { hair: "#6a5848", hairL: "#8a7664", skin: "#dfa688" }, headset: true };
  function pil(base, o) { var p = Object.assign({}, base, o); p.colors = Object.assign({}, base.colors); p.face = Object.assign({}, o.face || {}); if (base === SULLY) p.face.mustache = "#efece6"; return PERSON.front(p).svg; }
  function blink(t, e, seed) { return ((t + (seed || 0)) * 1000) % 3900 < 130 ? .05 : e; }
  function cockpit(t, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#22272f", { s: 0 });
    // side windows with the sky and the city beyond, the window posts
    [[-70, 1], [430, -1]].forEach(function (w) { var x = w[0]; g += P("M" + x + " 150 L" + (x + w[1] * 110) + " 120 L" + (x + w[1] * 110) + " 330 L" + x + " 360 Z", o.sky || "url(#skyWinter)", { w: 2 }) + (o.nocity ? "" : G("translate(" + (x + w[1] * 55) + " " + (330 + (o.drop || 0) * 60) + ") scale(.35)", skyline(0, 1, { x: 0 }))) + '<path d="M' + x + ' 150 L' + (x + w[1] * 110) + ' 120" stroke="#fff" stroke-width="3" opacity=".25"/>'; });
    g += P("M40 60 L320 60 L360 150 L0 150 Z", "#3a414c", { w: 2 });   // overhead panel
    for (var i = 0; i < 26; i++) { var bx = 30 + (i % 13) * 23, by = 80 + Math.floor(i / 13) * 30; g += R(bx, by, 12, 9, "#1b1f26", { w: .8 }) + R(bx + 2, by + 2, 8, 2.4, (o.apu && i === 9) ? "#7fd6ff" : (i * 7 % 5 === 0 ? "#f2b04a" : "#4a5260"), { s: 0, op: (o.apu && i === 9) ? .95 : .7 }); }
    g += R(150, 150, 60, 230, "#2c323b", { w: 1.6 }) + R(158, 170, 44, 6, "#1b1f26", { s: 0 });   // the cockpit door behind
    // seats
    [[105, "#3e4a5e"], [255, "#3e4a5e"]].forEach(function (s) { g += P("M" + (s[0] - 62) + " 520 L" + (s[0] - 56) + " 230 Q" + s[0] + " 200 " + (s[0] + 56) + " 230 L" + (s[0] + 62) + " 520 Z", s[1], { w: 2 }) + P("M" + (s[0] - 30) + " 236 Q" + s[0] + " 222 " + (s[0] + 30) + " 236 L" + (s[0] + 28) + " 268 L" + (s[0] - 28) + " 268 Z", "#526079", { w: 1.4 }); });
    var br = (Math.sin(t * 1.6) + 1) / 2, sf = o.sully || {}, jf = o.jeff || {};
    g += pil(o.fo || JEFF, { x: 105, y: 468, s: 1.05, legs: "sit", breath: br, head: Object.assign({ tilt: 2 * Math.sin(t * .8), turn: .25 }, jf.head || {}), face: Object.assign({ eyes: blink(t, 1, .7), mouth: "neutral", brows: "neutral", look: [.3, 0] }, jf.face || {}), arms: jf.arms || [{ to: [70, 452], hand: "relaxed", bend: 1 }, { to: [140, 452], hand: "relaxed", bend: -1 }] });
    g += pil(o.cpt || SULLY, { x: 255, y: 468, s: 1.05, legs: "sit", breath: br, head: Object.assign({ tilt: 1.5 * Math.sin(t * .7 + 1), turn: -.2 }, sf.head || {}), face: Object.assign({ eyes: blink(t, 1), mouth: "neutral", brows: "neutral", look: [-.2, 0] }, sf.face || {}), arms: sf.arms || [{ to: [222, 452], hand: "relaxed", bend: 1 }, { to: [310, 430], hand: "fist", bend: -1 }] });
    if (sf.stick !== false) g += P("M306 470 L312 428 Q318 418 326 424 L320 470 Z", "#1b1f26", { w: 1.6 });
    if (o.book) g += G("translate(" + f(105) + " " + f(410) + ") rotate(-6)", R(-34, -22, 68, 44, "#f4ecdb", { w: 1.6 }) + '<path d="M0 -22 V22" stroke="' + INK + '" stroke-width="1.2"/>' + (function () { var s = ""; for (var k = 0; k < 6; k++) s += '<path d="M-28 ' + (-14 + k * 6) + ' h22 M6 ' + (-14 + k * 6) + ' h22" stroke="#8a8a90" stroke-width="1.2"/>'; return s; })() + G("rotate(0)", P("M0 -22 Q" + f(-30 * Math.cos(t * 4)) + " -26 " + f(-34 * Math.cos(t * 4)) + " -20 L" + f(-34 * Math.cos(t * 4)) + " 24 Q" + f(-30 * Math.cos(t * 4)) + " 18 0 22 Z", "#fbf6ea", { w: 1.2 })) + txt("ENG DUAL FAILURE", 0, -27, 7, "#c8322a", { font: "Noto Serif", wt: 700 }));
    // the glareshield and the screens in the foreground
    g += P("M-220 430 Q180 400 580 430 L580 900 L-220 900 Z", "#161a20", { w: 2 });
    [40, 110, 250, 320].forEach(function (sx, k) { g += R(sx - 28, 440, 56, 44, "#0b1622", { w: 1.4 }) + R(sx - 22, 446, 44, 32, k === 1 || k === 2 ? "#123a5a" : "#0f2a20", { s: 0 }) + '<path d="M' + (sx - 18) + ' ' + (466 - 6 * Math.sin(t + k)) + ' h36" stroke="' + (o.warn && k === 1 ? "#ff6a4a" : "#7fd6ff") + '" stroke-width="1.4" opacity=".8"/>'; });
    if (o.warn) [70, 290].forEach(function (wx) { var on = Math.sin(t * 10) > 0; g += R(wx - 14, 410, 28, 14, on ? "#ff3a2a" : "#5a1a14", { w: 1.2 }) + (on ? '<circle cx="' + wx + '" cy="417" r="26" fill="#ff3a2a" opacity=".25" filter="url(#glow)"/>' : ""); });
    return g;
  }
  // the overhead panel close up: the APU master switch (on the viewer's right column) and a finger pressing it
  function apuPanel(t, k, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#2d333c", { s: 0 }) + R(20, 90, 320, 360, "#3a414c", { w: 2.4 });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { var bx = 52 + c * 76, by = 120 + r * 82, isA = r === 1 && c === 2;
      g += R(bx - 4, by - 4, 52, 48, "#2a3038", { w: 1.2 }) + R(bx, by, 44, 40, "#1b1f26", { w: 1.6 }) + R(bx + 6, by + 6, 32, 11, isA && k > .5 ? "#7fd6ff" : "#2e3540", { w: .8 }) + R(bx + 6, by + 22, 32, 11, "#2e3540", { w: .8 });
      if (isA && k > .5) g += txt("ON", bx + 22, by + 15.5, 9, "#0b1622", { font: "Noto Serif", wt: 700 }) + '<rect x="' + (bx - 20) + '" y="' + (by - 20) + '" width="84" height="80" fill="#7fd6ff" opacity="' + f2(.18 + .08 * Math.sin(t * 4)) + '" filter="url(#soft)"/>';
      if (isA) g += txt("APU", bx + 22, by - 12, 11, "#e8ecef", { font: "Noto Serif", wt: 700 }) + txt("MASTER SW", bx + 22, by + 54, 7.5, "#c9d0d7", { font: "Noto Serif", wt: 700 });
      else g += '<path d="M' + (bx + 8) + ' ' + (by - 10) + ' h28" stroke="#c9d0d7" stroke-width="1.4" opacity=".6"/>'; }
    if (o.ring) for (var q = 0; q < 3; q++) { var p = (t * .8 + q / 3) % 1; g += Ci(228, 222, 30 + p * 70, "none", { w: 2, op: 1 - p }).replace('stroke="' + INK + '"', 'stroke="#7fd6ff"'); }
    if (o.hand !== false) { var press = k < .5 ? lerp(70, 0, ease(k / .5)) : lerp(0, 50, ease((k - .5) / .5)); g += G("translate(" + f(196 + press * .3) + " " + f(150 + press) + ")", PERSON.hand([40, 150], -Math.PI / 2 - .25, "point", 1, 1.25, { skin: "#e3ad90", skinD: "#c07f62", skinL: "#efc3a8", shirt: "#f4f2ec", shirtD: "#d6d2c6" }) + P("M18 150 L22 300 L80 300 L62 150 Z", "#f4f2ec", { w: 2 })); }
    return g;
  }
  // the approach-control room: a dark room, a radar scope with the blip, the controller with a headset
  var PAT = { outfit: { base: "office", tie: false }, colors: { hair: "#3a2a20", hairL: "#5a463a", skin: "#e0a98a", shirt: "#b9cde0", shirtD: "#8ea8c0" }, headset: true };
  function tracon(t, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#0c1014", { s: 0 }) + '<circle cx="180" cy="300" r="260" fill="#2a6a4a" opacity=".12" filter="url(#soft)"/>';
    for (var i = 0; i < 5; i++) g += R(-60 + i * 110, 140, 80, 60, "#0f1a14", { w: 1.2 }) + R(-54 + i * 110, 146, 68, 48, "#123020", { s: 0, op: .7 });
    var br = (Math.sin(t * 1.4) + 1) / 2, pf = o.pat || {};
    g += PERSON.front(Object.assign({}, PAT, { x: 180, y: 520, s: 1.15, legs: "sit", breath: br, colors: Object.assign({}, PAT.colors), head: Object.assign({ tilt: 2 * Math.sin(t * .7), nod: .15 }, pf.head || {}), face: Object.assign({ eyes: blink(t, 1, 1.3), mouth: "neutral", brows: "worried", look: [0, .6] }, pf.face || {}), arms: pf.arms || [{ to: [140, 486], hand: "relaxed", bend: 1 }, { to: [220, 486], hand: "relaxed", bend: -1 }] })).svg;
    // the scope in front of him, lighting him green
    g += R(-220, 470, 800, 500, "#14191e", { w: 2 }) + G("translate(180 560)", '<ellipse rx="120" ry="44" fill="url(#scope)" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M0 0 L' + f(Math.cos(t * 2) * 118) + ' ' + f(Math.sin(t * 2) * 42) + '" stroke="' + GREEN + '" stroke-width="1.6" opacity=".7"/>' + '<ellipse rx="80" ry="29" fill="none" stroke="' + GREEN + '" stroke-width=".8" opacity=".4"/><ellipse rx="40" ry="15" fill="none" stroke="' + GREEN + '" stroke-width=".8" opacity=".4"/>' + (o.lost ? "" : Ci(-30, -12, 3.4, GREEN, { s: 0, op: .6 + .4 * Math.sin(t * 6) }) + txt("1549", -30, -18, 10, GREEN, { font: "Noto Serif", wt: 700 })));
    g += R(-220, 0, 800, 640, "url(#glowGreen)", { s: 0 });
    return g;
  }

  // ── the cabin, seen from the front galley down the aisle: three rows of passengers facing us ──
  var PAX = [["#7a3a34", "#5a2a26", "#2f2620"], ["#3f5a7a", "#2f4560", "#a8743c"], ["#5a6a4a", "#44523a", "#1f1a16"], ["#9a8a6a", "#7a6a50", "#7a5a3a"], ["#4a4a58", "#36364a", "#c9a46a"], ["#8a4a6a", "#6a3450", "#3a2a20"]];
  var SKN = ["#e0a98a", "#c98f6a", "#efc3a8", "#a8724c", "#dba07e", "#f0c8b0"];
  function pax(i, x, y, s, t, mode, k) {
    var c = PAX[i % 6], br = (Math.sin(t * 1.5 + i) + 1) / 2, o = { x: x, y: y, s: s, legs: "sit", breath: br, outfit: { base: "casual" }, colors: { shirt: c[0], shirtD: c[1], hair: c[2], skin: SKN[i % 6] } };
    var hy = y - 166 * s;
    if (mode === "brace") { var kk = ease(k); o.head = { nod: kk, tilt: 0 }; o.slump = .4 * kk; o.face = { eyes: .1, brows: "worried", mouth: "frown" }; o.arms = [{ to: [x - 14 * s, lerp(y - 40 * s, hy - 10 * s, kk)], hand: "flat", bend: 1, rot: 20 }, { to: [x + 14 * s, lerp(y - 40 * s, hy - 10 * s, kk)], hand: "flat", bend: -1, rot: 160 }]; }
    else if (mode === "shock") { o.head = { tilt: 3 * Math.sin(t + i), turn: (hash(i) - .5) * .6 }; o.face = { eyes: 1.25, brows: "worried", mouth: i % 2 ? "o" : "open", look: [(hash(i * 3) - .5), -.3] }; o.arms = [{ to: [x - 44 * s, y - 20 * s], hand: "fist", bend: 1 }, { to: [x + 44 * s, y - 20 * s], hand: "fist", bend: -1 }]; }
    else { o.head = { tilt: 2 * Math.sin(t * .8 + i), turn: (hash(i) - .5) * .8 }; o.face = { eyes: blink(t, mode === "worried" ? 1.1 : 1, i), brows: mode === "worried" ? "worried" : "neutral", mouth: mode === "worried" ? "frown" : "neutral", look: [(hash(i * 3) - .5) * 1.6, 0] }; o.arms = [{ to: [x - 42 * s, y - 4 * s], hand: "relaxed", bend: 1 }, { to: [x + 42 * s, y - 4 * s], hand: "relaxed", bend: -1 }]; }
    var seat = P("M" + f(x - 58 * s) + " " + f(y + 30 * s) + " L" + f(x - 52 * s) + " " + f(hy - 44 * s) + " Q" + f(x) + " " + f(hy - 64 * s) + " " + f(x + 52 * s) + " " + f(hy - 44 * s) + " L" + f(x + 58 * s) + " " + f(y + 30 * s) + " Z", "#2f4a7a", { w: 1.6 }) + P("M" + f(x - 40 * s) + " " + f(hy - 50 * s) + " Q" + f(x) + " " + f(hy - 60 * s) + " " + f(x + 40 * s) + " " + f(hy - 50 * s) + " L" + f(x + 40 * s) + " " + f(hy - 30 * s) + " L" + f(x - 40 * s) + " " + f(hy - 30 * s) + " Z", "#e8e4d8", { w: 1 });
    return seat + PERSON.front(o).svg;
  }
  function cabin(t, mode, k, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 });
    g += P("M-220 -100 L130 230 L230 230 L580 -100 Z", "#ece8de", { w: 1.6 }) + P("M-220 900 L130 330 L230 330 L580 900 Z", "#5a5f6a", { w: 1.6 }) + R(130, 230, 100, 100, "#c9c3b4", { w: 1.6 });
    for (var i = 0; i < 5; i++) { var p = i / 5, xl = lerp(-30, 120, p), xr = lerp(390, 240, p), y = lerp(150, 250, p), h = lerp(60, 20, p), w = lerp(34, 10, p), ty = (o.tilt || 0);
      [xl, xr - w].forEach(function (wx) { g += '<rect x="' + f(wx) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(w * .4) + '" fill="url(#skyWinter)" stroke="' + INK + '" stroke-width="1.4"/>' + (o.roofs ? '<rect x="' + f(wx) + '" y="' + f(y + h * lerp(.9, .3, o.roofs)) + '" width="' + f(w) + '" height="' + f(h * lerp(.1, .7, o.roofs)) + '" fill="#8a7e6e" opacity=".9"/>' : ""); }); }
    var rows = [[.55, 270, [125, 155, 205, 235]], [.8, 340, [70, 118, 242, 290]], [1.05, 450, [-10, 60, 300, 370]]];
    var n = 0; rows.forEach(function (r, ri) { r[2].forEach(function (x, j) { g += pax(n++, x, r[1], r[0], t, mode, clamp(k * 1.4 - (2 - ri) * .12 - j * .04)); }); });
    return g;
  }
  // a window seat close up: a passenger turned to the window, the rooftops coming up in it
  function windowSeat(t, k) {
    var g = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 });
    var wx = 60, wy = 140, ww = 150, wh = 200;
    g += '<clipPath id="win1"><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60"/></clipPath><g clip-path="url(#win1)">' + sky("skyWinter");
    var by = lerp(wy + wh + 40, wy + 40, k);
    for (var i = 0; i < 14; i++) { var bx = wx - 40 + i * 18 + ((t * 30) % 18), bh = 30 + hash(i) * 120; g += R(bx, by - bh * .3 + (hash(i * 3) * 30), 16, 400, i % 2 ? "#9a8a76" : "#b8a88e", { w: 1 }) + R(bx + 2, by - bh * .3 + hash(i * 3) * 30 + 4, 12, 6, "#6a6052", { s: 0, op: .5 }); }
    g += '</g><rect x="' + (wx - 14) + '" y="' + (wy - 14) + '" width="' + (ww + 28) + '" height="' + (wh + 28) + '" rx="72" fill="none" stroke="#ece8de" stroke-width="22"/><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
    g += PERSON.front({ x: 260, y: 600, s: 1.7, legs: "sit", breath: (Math.sin(t * 2.4) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: "#3f5a7a", shirtD: "#2f4560", hair: "#a8743c", skin: "#efc3a8" }, head: { turn: -.8, tilt: -6 }, face: { eyes: 1.2, brows: "worried", mouth: "o", look: [-1, .3] }, arms: [{ to: [180, 470], hand: "fist", bend: 1 }, { to: [330, 560], hand: "relaxed", bend: -1 }] }).svg;
    return g;
  }

  // ── the George Washington Bridge, side view (two steel lattice towers, the main cable, the deck) ──
  function gwb(x, y, s) {
    var g = "";
    [-160, 160].forEach(function (tx) { g += R(tx - 12, -190, 24, 200, "#9aa6ae", { w: 1.6 }); for (var k = 0; k < 9; k++) g += '<path d="M' + (tx - 12) + ' ' + (-190 + k * 22) + ' L' + (tx + 12) + ' ' + (-168 + k * 22) + ' M' + (tx + 12) + ' ' + (-190 + k * 22) + ' L' + (tx - 12) + ' ' + (-168 + k * 22) + '" stroke="#5a666e" stroke-width="1.2"/>'; });
    g += '<path d="M-420 -40 Q-300 -160 -160 -186 Q0 -40 160 -186 Q300 -160 420 -40" stroke="' + INK + '" stroke-width="4" fill="none"/><path d="M-420 -40 Q-300 -160 -160 -186 Q0 -40 160 -186 Q300 -160 420 -40" stroke="#9aa6ae" stroke-width="2" fill="none"/>';
    for (var h = -150; h <= 150; h += 15) { var cy = -40 - 146 * Math.pow(Math.abs(h) / 160, 2); g += '<path d="M' + h + ' ' + f(cy) + ' V-8" stroke="#5a666e" stroke-width=".9"/>'; }
    g += R(-420, -10, 840, 12, "#7a868e", { w: 1.8 });
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g);
  }
  // ── a New York Waterway ferry (white, blue band, two decks of windows), bow to the left ──
  function ferry(x, y, s, t, dir) {
    var g = P("M-80 0 L-70 -18 L84 -18 L90 0 Q70 10 -70 8 Z", "#f4f5f2", { w: 1.8 }) + R(-74, -8, 160, 6, "#2f4a8a", { s: 0 }) + P("M-56 -18 L-50 -40 L66 -40 L70 -18 Z", "#f4f5f2", { w: 1.6 }) + P("M-30 -40 L-26 -52 L30 -52 L34 -40 Z", "#f4f5f2", { w: 1.4 });
    for (var i = 0; i < 12; i++) g += R(-48 + i * 9.6, -34, 6, 8, "#2a3442", { s: 0 });
    for (var j = 0; j < 5; j++) g += R(-22 + j * 10, -49, 6, 6, "#2a3442", { s: 0 });
    g += '<path d="M-82 4 q-10 -2 -20 2 M90 4 q14 -2 24 2" stroke="#fff" stroke-width="2" opacity="' + f2(.5 + .3 * Math.sin(t * 3)) + '" fill="none"/>';
    return G("translate(" + f(x) + " " + f(y + Math.sin(t * 1.4 + x) * 1.2) + ") scale(" + f2(s * (dir || 1)) + " " + f2(s) + ")", g);
  }
  // the plane floating, side view from the river, with people on both wings and on the slide rafts at the front doors
  function floating(t, x, y, s, o) {
    o = o || {}; var g = "", pl = a320({ x: x, y: y, s: s, rot: -1.5, t: t, dir: -1 });
    g += pl;
    var np = o.people == null ? 1 : o.people, ps = .06 * s;
    for (var i = 0; i < 16; i++) { if (i / 16 > np) break; var px = x + (i < 8 ? -18 + i * 7 : 30 + (i - 8) * 7) * s, fy = y + 14 * s, c = PAX[i % 6];
      g += PERSON.front({ x: px, y: fy - 208 * ps, s: ps, legs: "stand", breath: (Math.sin(t * 7 + i) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: c[0], shirtD: c[1], hair: c[2], skin: SKN[i % 6] }, head: { tilt: 4 * Math.sin(t * 5 + i) }, face: { eyes: 1, brows: "worried", mouth: "frown" }, arms: [{ rel: [16, 40], hand: "fist", bend: 1 }, { rel: [-16, 40], hand: "fist", bend: -1 }] }).svg; }
    g += R(-400, y + 6 * s, 1160, 600, "url(#hudsonW)", { s: 0, op: .9 }) + '<path d="M-400 ' + f(y + 6 * s) + ' H760" stroke="#e4eef6" stroke-width="1.6" opacity=".7"/>';
    [-104, 98].forEach(function (dx, k) { var rx = x - dx * s; g += P("M" + f(rx - 22 * s) + " " + f(y + 6 * s) + " Q" + f(rx) + " " + f(y + 12 * s) + " " + f(rx + 22 * s) + " " + f(y + 6 * s) + " L" + f(rx + 20 * s) + " " + f(y + 1 * s) + " L" + f(rx - 20 * s) + " " + f(y + 1 * s) + " Z", "#f2c230", { w: 1.4 }); });
    return g;
  }

  // ── the map: New York from above, north up (schematic, after the real geography: the Hudson, Manhattan, the East
  //    River, LaGuardia on the north shore of Queens, Teterboro in New Jersey, the George Washington Bridge) ──
  var LGA = [300, 262], TEB = [56, 96], GWB = [136, 84], HUD = [137, 380], STRIKE = [312, 168];
  var TRACK = [[300, 262], [322, 222], [312, 168], [276, 128], [222, 104], [170, 92], [140, 104], [138, 180], [137, 270], [137, 380]];
  function trackD(pts, k) { var n = (pts.length - 1) * clamp(k), i = Math.floor(n), fr = n - i, d = "M" + pts[0][0] + " " + pts[0][1]; for (var j = 1; j <= i; j++) d += " L" + pts[j][0] + " " + pts[j][1]; if (i < pts.length - 1) d += " L" + f(lerp(pts[i][0], pts[i + 1][0], fr)) + " " + f(lerp(pts[i][1], pts[i + 1][1], fr)); return { d: d, p: i < pts.length - 1 ? [lerp(pts[i][0], pts[i + 1][0], fr), lerp(pts[i][1], pts[i + 1][1], fr)] : pts[pts.length - 1] }; }
  function nycMap(t, o) {
    o = o || {}; var g = R(-300, -300, 960, 1300, "#6f9cc0", { s: 0 });
    for (var i = 0; i < 14; i++) g += '<path d="M' + f(-60 + ((i * 97 + t * 5) % 480)) + ' ' + (40 + i * 40) + ' q6 -4 12 0 t12 0" stroke="#9ec0dc" stroke-width="1.2" fill="none" opacity=".6"/>';
    var LAND = "#e2d8c0";
    g += P("M-300 -300 L118 -300 L120 40 L122 160 L126 300 L130 420 L138 560 L150 700 L-300 900 Z", LAND, { w: 1.8 });   // New Jersey
    g += P("M152 20 L200 10 L206 150 L212 300 L214 420 L202 560 L178 612 L170 560 L160 420 L152 300 L150 150 Z", "#d9cbb0", { w: 1.8 });   // Manhattan
    g += P("M160 -300 L700 -300 L700 196 L420 188 L330 200 L282 236 L250 300 L236 420 L232 600 L700 640 L700 900 L224 900 L218 420 L214 300 L208 150 L204 0 L160 -40 Z", LAND, { w: 1.8 });   // the Bronx, Queens
    g += P("M240 300 L262 246 L300 232 L340 238 L346 268 L300 290 Z", "#cfc4aa", { w: 1.4 }) + '<path d="M266 280 L330 240 M282 250 L318 286" stroke="#5a5a62" stroke-width="5" stroke-linecap="round"/><path d="M266 280 L330 240 M282 250 L318 286" stroke="#f4ecdb" stroke-width="1" stroke-dasharray="3 3"/>';
    g += '<path d="M44 86 L70 106 M50 106 L66 84" stroke="#5a5a62" stroke-width="4" stroke-linecap="round"/>';
    g += '<path d="M116 ' + GWB[1] + ' L156 ' + (GWB[1] - 2) + '" stroke="' + INK + '" stroke-width="4"/><path d="M116 ' + GWB[1] + ' L156 ' + (GWB[1] - 2) + '" stroke="#c9d0d7" stroke-width="2"/>';
    for (var b = 0; b < 40; b++) { var bx = 160 + hash(b) * 40, by = 30 + hash(b * 3) * 540; if (bx < 150 + (by / 600) * 30 || bx > 205) continue; g += R(bx, by, 4, 4, "#b8a88e", { s: 0, op: .8 }); }
    if (o.labels !== false) g += txt("نيو جيرسي", 60, 300, 15, "#5a4a32", { op: .9 }) + txt("مانهاتن", 182, 470, 13, "#5a4a32", { op: .9 }) + G("translate(132 250) rotate(-88)", txt("نهر هدسون", 0, 0, 12, "#123a5a", { op: .9 })) + txt("لاجوارديا", LGA[0] + 20, LGA[1] + 44, 14, "#121419");
    return g;
  }
  function trackLine(pts, k, col, t, o) { o = o || {}; var tr = trackD(pts, k); return '<path d="' + tr.d + '" stroke="' + INK + '" stroke-width="' + ((o.w || 4) + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/><path d="' + tr.d + '" stroke="' + col + '" stroke-width="' + (o.w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>' + (o.dot === false ? "" : Ci(tr.p[0], tr.p[1], 5 + Math.sin(t * 6), "#fff", { w: 1.6 })); }
  function pin(p, name, dx, dy, k, col) { k = clamp(k); return Ci(p[0], p[1], 5, col || YEL, { w: 1.6 }) + (k > 0 ? txt(name, p[0] + dx, p[1] + dy, 14, "#fff", { op: k, st: "rgba(0,0,0,.75)", sw: 4, wt: 900 }) : ""); }
  function xmark(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 -14 L' + f(-14 + 28 * clamp(k * 2)) + ' ' + f(-14 + 28 * clamp(k * 2)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' + (k > .5 ? '<path d="M14 -14 L' + f(14 - 28 * clamp(k * 2 - 1)) + ' ' + f(-14 + 28 * clamp(k * 2 - 1)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' : '')); }
  function check(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 0 L-4 10 L16 -12" stroke="#4ac06a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="' + f(50 * (1 - k)) + '"/>'); }
  // a city seen from straight above: blocks of rooftops in the Manhattan grid, the plane's shadow crossing them
  function rooftops(t, k) {
    var g = R(-300, -300, 960, 1300, "#6a6660", { s: 0 }), off = (t * 40) % 60;
    for (var r = -8; r < 16; r++) for (var c = -6; c < 12; c++) { var x = c * 50 - 40, y = r * 60 + off - 60; g += R(x, y, 44, 52, ["#b8a88e", "#a8987e", "#c9b9a0", "#9a8c78"][(r * 7 + c * 3 + 400) % 4], { w: 1.2 }) + R(x + 6, y + 6, 14, 10, "#8a7e6e", { s: 0, op: .6 }) + R(x + 26, y + 30, 10, 12, "#e8e2d4", { s: 0, op: .5 }); }
    g += G("translate(180 300) rotate(-90) scale(" + f2(.9 + k * .4) + ")", '<g opacity=".35">' + P("M-150 -6 L150 -6 L150 6 L-150 6 Z M-10 0 L-60 -150 L-40 -150 L30 0 L-40 150 L-60 150 Z M-150 0 L-140 -50 L-128 -50 L-128 50 L-140 50 Z", "#000", { s: 0 }) + '</g>');
    return g;
  }
  // a museum hangar: the plane on stands under spotlights
  function museum(t) {
    var g = R(-220, -220, 800, 1300, "#1a1c22", { s: 0 }) + P("M-220 120 Q180 20 580 120 L580 -220 L-220 -220 Z", "#24272e", { w: 2 });
    for (var i = 0; i < 9; i++) g += '<path d="M' + (-140 + i * 70) + ' ' + (140 - Math.sin(i / 8 * 3.14) * 90) + ' L' + (-140 + i * 70) + ' 460" stroke="#2e323a" stroke-width="5"/>';
    g += R(-220, 420, 800, 400, "#3a3c42", { w: 2 }) + '<ellipse cx="180" cy="430" rx="200" ry="22" fill="#000" opacity=".4"/>';
    g += rays(t, 90, 20, 1.2, 3, 520, .14) + rays(t, 280, 20, 1.95, 3, 520, .14);
    g += a320({ x: 180, y: 330, s: .95, t: t, rot: -1 }) + R(110, 345, 6, 80, "#5a5f6a", { w: 1.2 }) + R(240, 345, 6, 80, "#5a5f6a", { w: 1.2 });
    [40, 300, 330].forEach(function (vx, i) { g += PERSON.front({ x: vx, y: 470, s: .36, legs: "stand", breath: (Math.sin(t * 2 + i) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: PAX[i + 2][0], shirtD: PAX[i + 2][1], hair: PAX[i + 2][2], skin: SKN[i] }, head: { turn: i ? -.6 : .6, tilt: -8 }, face: { eyes: 1, mouth: "neutral", look: [i ? -1 : 1, -.6] } }).svg; });
    return g;
  }
  function rec(t, y, src) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".8"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt("تسجيل حقيقي · " + (src || "برج المراقبة"), 288, y + 4, 13, "#fff", { a: "start" }) + b; }
  function screenFix(s) { return G("", s); }   // screen-space overlays drawn inside a shot are kept still by the shot's inverse camera (see drawShot)
  function alt(t, ft, x, y) { return '<rect x="' + (x - 70) + '" y="' + (y - 28) + '" width="140" height="44" rx="8" fill="#0b0f18" opacity=".75"/>' + txt(Math.round(ft).toLocaleString("en-US"), x + 10, y + 4, 24, "#ffd45a", { font: "Noto Serif", wt: 700 }) + txt("قدم", x - 48, y + 2, 13, "#fff"); }

