/* «لو» kit (videos/_templates/law/kit.js): everything an episode in the «لو» look shares — drawing helpers, the sky, the
   ground cut open, the jointed man (POSES, joint limits, face moods, tools), keyframed acting, labels, ✗/✓ marks, rings,
   arrows, confetti, and the shot runner with the build-that-grows state. Load it after ../timing.js and before the
   episode's scene.js; set window.LAW_GY (ground line, default 900) first if the episode needs another.
   Built from «تعمل قبو سري إزاي؟» (videos/secret-basement/law/scene.js). Check every pose with poses.html before rendering. */
// The user's rule: every person in every skill is drawn with the shared person kit. Load it from next to this kit
// (videos/_templates/people/person.js) when the page has not, so man() and act() below always draw that person.
if (!window.PERSON && document.currentScript) document.write('<script src="' + document.currentScript.src.replace(/law\/kit\.js(\?.*)?$/, "people/person.js") + '"><\/script>');
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return Math.round(n * 10) / 10; }
  function pop(k) { k = clamp(k); return k < 0.7 ? ease(k / 0.7) * 1.12 : 1.12 - 0.12 * ease((k - 0.7) / 0.3); }
  var INK = "#2a2522";
  function R(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(Math.max(0, w)) + '" height="' + f(Math.max(0, h)) + '"' + (o.rx ? ' rx="' + o.rx + '"' : "") + ' fill="' + fill + '" stroke="' + (o.st || INK) + '" stroke-width="' + (o.sw == null ? 3 : o.sw) + '"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + (o.fl ? ' filter="url(#' + o.fl + ')"' : "") + '/>'; }
  function P(d, col, w, x) { return '<path d="' + d + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (x || "") + '/>'; }
  function F(d, fill, o) { o = o || {}; return '<path d="' + d + '" fill="' + fill + '" stroke="' + (o.st || INK) + '" stroke-width="' + (o.sw == null ? 3 : o.sw) + '" stroke-linejoin="round"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + (o.fl ? ' filter="url(#' + o.fl + ')"' : "") + '/>'; }
  function C(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(0, r)) + '" fill="' + fill + '" stroke="' + (o.st || "none") + '" stroke-width="' + (o.sw || 0) + '"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + '/>'; }
  function T(text, x, y, sz, col, o) { o = o || {}; return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (o.w || 900) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + (o.stroke ? ';stroke:' + o.stroke + ';stroke-width:' + f(sz / 7) + ';paint-order:stroke' : "") + '">' + text + '</text>'; }
  var GY = window.LAW_GY || 900;
  var SOILTEX = (function () { var s = ""; for (var i = 0; i < 260; i++) { var x = -600 + hash(i) * 2300, y = GY + 50 + hash(i + 9) * 1500, rx = 14 + hash(i + 3) * 50; s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * (0.3 + hash(i + 5) * 0.3)) + '" fill="' + (hash(i + 7) > 0.5 ? "#5a3820" : "#9a6a40") + '" opacity="' + f(0.25 + hash(i + 2) * 0.3) + '"/>'; }
    for (var k = 0; k < 70; k++) { var gx = -600 + hash(k + 400) * 2300, gy = GY + 60 + hash(k + 500) * 1400, d = "M" + f(gx) + " " + f(gy); for (var j = 1; j < 6; j++) d += " q" + f(8 - hash(k + j) * 16) + " 22 " + f(4 - hash(k + j + 3) * 8) + " 44"; s += P(d, "#4a2c16", 2.4, ' opacity=".35"'); }
    for (var q = 0; q < 50; q++) { var sx = -600 + hash(q + 700) * 2300, sy = GY + 120 + hash(q + 800) * 1400, r = 8 + hash(q + 900) * 18; s += '<ellipse cx="' + f(sx) + '" cy="' + f(sy) + '" rx="' + f(r * 1.3) + '" ry="' + f(r) + '" fill="#a8927a" stroke="#5a4636" stroke-width="2" opacity=".75"/>'; }
    return s; })();
  function sky(t, night) {
    var s = '<rect x="-800" y="-900" width="2700" height="' + (GY + 900) + '" fill="url(#' + (night ? "skyN" : "sky") + ')"/>';
    if (!night) s += '<circle cx="880" cy="120" r="' + f(330 + 10 * Math.sin(t * 0.7)) + '" fill="url(#sun)"/>';
    else for (var i = 0; i < 40; i++) s += C(-500 + hash(i + 40) * 2100, -600 + hash(i + 60) * 900, 2 + hash(i) * 2, "#fff", { op: 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i)) });
    for (var c = 0; c < 6; c++) { var cx = ((-300 + c * 420 + t * 14) % 2400) - 600, cy = -300 + hash(c + 20) * 380, sc = 0.8 + hash(c + 30) * 0.7;
      s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')" opacity="' + (night ? 0.25 : 0.95) + '"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="#fff" stroke="#c9d6e2" stroke-width="3"/><path d="M-80 30 H60" stroke="#dfe7ef" stroke-width="6"/></g>'; }
    // far town, faded
    for (var b = 0; b < 16; b++) { var bx = -700 + b * 160, bh = 120 + hash(b + 70) * 180; s += R(bx, GY - bh, 130, bh, night ? "#3a4560" : "#d9cfc0", { sw: 0, op: 0.7 }); for (var w = 0; w < 4; w++) s += R(bx + 18 + (w % 2) * 56, GY - bh + 24 + Math.floor(w / 2) * 50, 34, 26, night ? (hash(b + w) > 0.5 ? "#ffd27a" : "#2a3348") : "#c4b8a6", { sw: 0, op: 0.7 }); }
    return s;
  }
  function palm(x, t, s) { var g = '<g transform="translate(' + x + ' ' + GY + ') scale(' + (s || 1) + ')"><path d="M-8 0 Q-4 -150 10 -300 L22 -300 Q10 -150 10 0 Z" fill="url(#wood)" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 6; k++) { var a = -150 + k * 60 + Math.sin(t * 1.4 + k) * 4; g += '<path d="M16 -300 Q' + f(16 + Math.cos(a * Math.PI / 180) * 80) + ' ' + f(-330 + Math.sin(a * Math.PI / 180) * 40) + ' ' + f(16 + Math.cos(a * Math.PI / 180) * 150) + ' ' + f(-300 + Math.sin(a * Math.PI / 180) * 90 + 50) + '" stroke="#3f7f2e" stroke-width="16" fill="none" stroke-linecap="round"/>'; }
    return g + '</g>'; }
  function bush(x, s) { return '<g transform="translate(' + x + ' ' + GY + ') scale(' + s + ')"><circle cx="-30" cy="-26" r="34" fill="#5a9a3e" stroke="' + INK + '" stroke-width="3"/><circle cx="18" cy="-38" r="42" fill="#6aae48" stroke="' + INK + '" stroke-width="3"/><circle cx="54" cy="-22" r="28" fill="#4f8a34" stroke="' + INK + '" stroke-width="3"/></g>'; }
  function ground(t) {
    var s = '<rect x="-800" y="' + GY + '" width="2700" height="1900" fill="url(#soil)"/>' + SOILTEX;
    s += '<rect x="-800" y="' + (GY - 10) + '" width="2700" height="22" fill="url(#grass)" stroke="' + INK + '" stroke-width="3"/>';
    for (var g = -790; g < 1900; g += 18) s += P("M" + g + " " + (GY - 8) + " l4 -14 M" + (g + 7) + " " + (GY - 8) + " l-3 -10", "#4f8a34", 3);
    return s;
  }
  // the desert version (first used in «ملجأ نجاة في الصحرا», videos/desert-shelter): a hazy sky with far dunes and rocky
  // hills instead of the town, and sand cut open instead of soil and grass. o: night, sun [x, y] (late afternoon = lower
  // and warmer), warm 0..1 (orange evening light). Needs the gradients skyD, skyN, sun, sandG in the page's <defs>.
  var SANDTEX = (function () { var s = ""; for (var i = 0; i < 220; i++) { var x = -800 + hash(i + 1000) * 2700, y = GY + 30 + hash(i + 1100) * 1500, rx = 10 + hash(i + 1200) * 36;
      s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * 0.35) + '" fill="' + (hash(i + 1300) > 0.5 ? "#b07c42" : "#f0d49a") + '" opacity="' + f(0.25 + hash(i + 1400) * 0.3) + '"/>'; }
    for (var k = 0; k < 26; k++) { var ly = GY + 60 + k * 58 + hash(k + 1500) * 20, d = "M-800 " + f(ly); for (var x = -800; x < 1900; x += 180) d += " q90 " + f(-10 + hash(k * 31 + x) * 20) + " 180 0"; s += P(d, "#9a6a36", 2.2, ' opacity="' + f(0.12 + hash(k + 1600) * 0.12) + '"'); }
    for (var q = 0; q < 40; q++) { var sx = -800 + hash(q + 1700) * 2700, sy = GY + 140 + hash(q + 1800) * 1400, r = 7 + hash(q + 1900) * 16; s += '<ellipse cx="' + f(sx) + '" cy="' + f(sy) + '" rx="' + f(r * 1.4) + '" ry="' + f(r) + '" fill="#b9a088" stroke="#6a5440" stroke-width="2" opacity=".7"/>'; }
    return s; })();
  function desertSky(t, o) { o = o || {}; var night = o.night, sp = o.sun || [880, 120], w = clamp(o.warm || 0);
    var s = '<rect x="-800" y="-900" width="2700" height="' + (GY + 900) + '" fill="url(#' + (night ? "skyN" : "skyD") + ')"/>';
    if (!night && w > 0) s += '<rect x="-800" y="-900" width="2700" height="' + (GY + 900) + '" fill="#f29a4a" opacity="' + f(0.35 * w) + '"/>';
    if (!night) s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(360 + 12 * Math.sin(t * 0.7)) + '" fill="url(#sun)"/>' + C(sp[0], sp[1], 70, w > 0.3 ? "#ffd08a" : "#fffbe8", { op: 0.95 });
    else { for (var i = 0; i < 60; i++) s += C(-700 + hash(i + 40) * 2500, -700 + hash(i + 60) * (GY + 400), 2 + hash(i) * 2.4, "#fff", { op: 0.35 + 0.55 * Math.abs(Math.sin(t * 1.7 + i)) });
      s += C(240, 140, 54, "#f4f0dc", { st: "#c9c2a8", sw: 3 }) + C(264, 128, 46, "url(#skyN)"); }
    for (var c = 0; c < 3; c++) { var cx = ((c * 760 + t * 10) % 2600) - 700, cy = -200 + hash(c + 20) * 260, sc = 0.7 + hash(c + 30) * 0.5;
      s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc * 1.4) + ' ' + f(sc * 0.6) + ')" opacity="' + (night ? 0.15 : 0.6) + '"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="#fff" stroke="none"/></g>'; }
    // far rocky hills, then two rows of dunes, faded by the haze
    var hill = "M-800 " + GY; for (var hx = -800; hx <= 1900; hx += 100) hill += " L" + hx + " " + f(GY - 150 - 120 * Math.abs(Math.sin(hx * 0.004 + 1)) - 40 * hash(hx + 5));
    s += '<path d="' + hill + ' L1900 ' + GY + ' Z" fill="' + (night ? "#2c3550" : "#d9b98e") + '" opacity=".55"/>';
    [[GY - 90, night ? "#3a3f58" : "#e6c48c", 0.008, 0.75], [GY - 40, night ? "#4a4a5e" : "#ebc888", 0.013, 0.9]].forEach(function (r, j) {
      var d = "M-800 " + GY; for (var x = -800; x <= 1900; x += 40) d += " L" + x + " " + f(r[0] + 50 * Math.sin(x * r[2] + j * 2) + 20 * Math.sin(x * r[2] * 2.7));
      s += '<path d="' + d + ' L1900 ' + GY + ' Z" fill="' + r[1] + '" opacity="' + r[3] + '"/>'; });
    if (!night && !o.noShimmer) for (var m = 0; m < 6; m++) { var p = (t * 0.4 + m / 6) % 1, mx = -300 + hash(m + 77) * 1700; s += P("M" + f(mx) + " " + f(GY - 20 - p * 60) + " q20 -8 40 0 q20 8 40 0", "#fff", 3, ' opacity="' + f(0.35 * Math.sin(p * Math.PI)) + '"'); }
    return s;
  }
  function sand(t, o) { o = o || {};
    var s = '<rect x="-800" y="' + GY + '" width="2700" height="1900" fill="url(#sandG)"/>' + SANDTEX;
    if (o.night) s += '<rect x="-800" y="' + (GY - 4) + '" width="2700" height="1900" fill="#0a1430" opacity=".45"/>';
    s += '<path d="M-800 ' + (GY + 6) + ' H1900" stroke="' + INK + '" stroke-width="3"/>' + '<rect x="-800" y="' + (GY - 6) + '" width="2700" height="12" fill="' + (o.night ? "#8a7a68" : "#f2d6a0") + '"/>';
    for (var g = -790; g < 1900; g += 60) s += P("M" + g + " " + (GY - 2) + " q15 -6 30 0", o.night ? "#6a5a4a" : "#c9a066", 2.4, ' opacity=".6"');
    return s;
  }
  // the house cut open: floor slab, walls, roof, a ceiling fan, a picture, the sofa, the rug, the bookcase (the secret door)
  // ── the man: a jointed figure in real proportions (8 heads tall), angles per joint, a face with moods ──
  var POSES = {
    stand: { lean: 0, head: 0, aN: [6, 12], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] },
    shock: { lean: -14, head: -10, aN: [150, 168], aF: [138, 160], lN: [14, 6], lF: [-16, -6] },
    cover: { lean: 16, head: 14, aN: [158, 262], aF: [150, 250], lN: [16, -8], lF: [-6, -12] },
    cheer: { lean: -6, head: -10, aN: [172, 178], aF: [30, 60], lN: [6, 2], lF: [-6, -2] },
    thumbs: { lean: -4, head: -4, aN: [36, 150], aF: [-6, -2], lN: [4, 2], lF: [-4, -2], thumb: 1 },
    point: { lean: 4, head: 0, aN: [96, 98], aF: [-8, -4], lN: [6, 2], lF: [-6, -2] },
    pointUp: { lean: -8, head: -20, aN: [150, 160], aF: [-8, -4], lN: [6, 2], lF: [-6, -2] },
    worry: { lean: 6, head: 6, aN: [24, 168], aF: [20, 162], lN: [4, 2], lF: [-4, -2] },
    cough: { lean: 26, head: 18, aN: [44, 168], aF: [30, 70], lN: [10, 0], lF: [-6, -4] },
    push: { lean: 22, head: 4, aN: [82, 92], aF: [76, 86], lN: [20, 4], lF: [-24, -16] },
    breathe: { lean: -10, head: -16, aN: [108, 118], aF: [-70, -60], lN: [4, 2], lF: [-4, -2] },
    shrug: { lean: 0, head: 8, aN: [36, 120], aF: [-24, 60], lN: [4, 2], lF: [-4, -2] },
    collar: { lean: 8, head: 12, aN: [36, 172], aF: [10, 30], lN: [6, 2], lF: [-4, -2] },
    wave: { lean: -4, head: -4, aN: [150, 190], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] },
    reach: { lean: -6, head: -24, aN: [158, 160], aF: [20, 40], lN: [4, 2], lF: [-4, -2] },
    crouch: { lean: 34, head: 10, aN: [66, 90], aF: [50, 80], lN: [96, -6], lF: [70, -24] },
    sit: { lean: -6, head: 0, aN: [16, 84], aF: [10, 76], lN: [90, 4], lF: [86, 0] },
    sitDesk: { lean: 4, head: 6, aN: [30, 92], aF: [24, 88], lN: [90, 4], lF: [86, 0] },
    ear: { lean: 30, head: 30, aN: [20, 170], aF: [-10, 0], lN: [10, 0], lF: [-10, -6] },
    hush: { lean: 6, head: 6, aN: [30, 172], aF: [-6, -2], lN: [4, 2], lF: [-4, -2] }
  };
  function walkP(ph) { var a = Math.sin(ph * Math.PI * 2) * 26, b = Math.sin(ph * Math.PI * 2 + Math.PI) * 26; return { walk: ph, lean: 4, head: 0, aN: [-a * 0.8, -a * 0.6 + 14], aF: [-b * 0.8, -b * 0.6 + 14], lN: [a, a - Math.max(0, -Math.sin(ph * Math.PI * 2)) * 34], lF: [b, b - Math.max(0, Math.sin(ph * Math.PI * 2)) * 34] }; }
  // digging: the top (far) hand at the chest, the lower (near) hand forward and low on the handle, so the shaft runs down and
  // forward and the blade is in the ground in front of the feet. The cycle: push the blade down (0–0.5), lever it up and
  // toss the earth back (0.5–1).
  function digP(ph) { var c = ph % 1, dn = c < 0.5 ? Math.sin(c * 2 * Math.PI) : 0, up = c >= 0.5 ? Math.sin((c - 0.5) * 2 * Math.PI) : 0;
    return { lean: 30 + dn * 10 - up * 12, head: 14 - up * 6, aN: [34 + dn * 8 - up * 14, 30 + dn * 6 - up * 30], aF: [16 + dn * 6 - up * 10, 96 - up * 20], lN: [26 + dn * 6, 6], lF: [-14, -10], shovel: 1, lift: up }; }
  function climbP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 0, head: -6, aN: [160 + s * 14, 170 + s * 10], aF: [150 - s * 14, 165 - s * 10], lN: [50 + s * 40, -10 + s * 10], lF: [50 - s * 40, -10 - s * 10] }; }
  function hammerP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 10, head: 4, aN: [110 + s * 40, 150 + s * 50], aF: [60, 80], lN: [8, 2], lF: [-8, -4], hammer: 1 }; }
  function caulkP(ph) { var s = Math.sin(ph * Math.PI * 2); return { lean: 34, head: 14, aN: [80 + s * 10, 100 + s * 10], aF: [60, 90], lN: [96, -6], lF: [70, -24], caulk: 1 }; }
  function mixPose(a, b, k) { var o = {}; for (var key in a) { if (key === "walk") { if (b.walk != null || k < 0.5) o.walk = b.walk != null ? b.walk : a.walk; continue; } var va = a[key], vb = b[key] == null ? va : b[key]; o[key] = Array.isArray(va) ? [lerp(va[0], vb[0], k), lerp(va[1], vb[1], k)] : (typeof va === "number" ? lerp(va, vb, k) : (k < 0.5 ? va : vb)); } for (var k2 in b) if (o[k2] == null) o[k2] = b[k2]; return o; }
  function pose(name, ph) { if (typeof name === "object") return name; if (name === "walk") return walkP(ph); if (name === "dig") return digP(ph); if (name === "climb") return climbP(ph); if (name === "hammer") return hammerP(ph); if (name === "caulk") return caulkP(ph); return POSES[name] || POSES.stand; }
  function dirv(a, fc) { var r = a * Math.PI / 180; return [fc * Math.sin(r), Math.cos(r)]; }
  function add(p, d, l) { return [p[0] + d[0] * l, p[1] + d[1] * l]; }
  function limb(pts, w0, w1, col, dark) { var s = "", d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) d += " L" + f(pts[i][0]) + " " + f(pts[i][1]);
    return P(d, INK, (w0 + w1) / 2 + 6) + P(d, dark || col, (w0 + w1) / 2) + P(d, col, (w0 + w1) / 2 - 7, ' opacity=".9"'); }
  function face(c, fc, mood, t, sc) {
    var s = "", x = c[0], y = c[1], blink = (t % 3.4) < 0.12;
    s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="30" ry="36" fill="url(#skin)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<ellipse cx="' + f(x - fc * 24) + '" cy="' + f(y + 2) + '" rx="8" ry="11" fill="#d39a70" stroke="' + INK + '" stroke-width="2.4"/>';
    s += F("M" + f(x - 31) + " " + f(y - 4) + " Q" + f(x - 30) + " " + f(y - 44) + " " + f(x + 4) + " " + f(y - 42) + " Q" + f(x + 32) + " " + f(y - 40) + " " + f(x + 31) + " " + f(y - 10) + " Q" + f(x + fc * 10) + " " + f(y - 26) + " " + f(x - fc * 20) + " " + f(y - 14) + " Q" + f(x - fc * 26) + " " + f(y - 4) + " " + f(x - fc * 26) + " " + f(y + 8) + " Z", "#2a1a12", { sw: 2.4 });
    var e1 = x + fc * 12, e2 = x - fc * 6, ey = y - 4, big = mood === "shock", sq = mood === "happy" || mood === "proud";
    [e1, e2].forEach(function (ex, i) { var r = i ? 0.82 : 1;
      if (blink || sq) s += P("M" + f(ex - 6 * r) + " " + f(ey + 1) + " q" + f(6 * r) + " -7 " + f(12 * r) + " 0", INK, 3);
      else if (mood === "dizzy" || mood === "sick") s += P("M" + f(ex - 6 * r) + " " + f(ey) + " h" + f(12 * r), INK, 3.4);
      else s += '<ellipse cx="' + f(ex) + '" cy="' + f(ey) + '" rx="' + f((big ? 8 : 5.6) * r) + '" ry="' + f((big ? 9 : 6.4) * r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>' + C(ex + fc * 1.6, ey + 0.6, (big ? 2.8 : 3.2) * r, "#2a1a12");
      var bu = mood === "shock" ? -12 : mood === "worry" || mood === "sick" ? -6 : -9, bt = mood === "worry" || mood === "sick" ? (i ? 4 : -4) * fc : 0, ang = mood === "angry" ? 4 : 0;
      s += P("M" + f(ex - 8 * r) + " " + f(ey + bu - bt + ang) + " L" + f(ex + 8 * r) + " " + f(ey + bu + bt - ang), "#2a1a12", 4); });
    s += P("M" + f(x + fc * 22) + " " + f(y - 2) + " q" + f(fc * 10) + " 8 " + f(fc * 2) + " 12", INK, 2.8);
    s += P("M" + f(x + fc * 2) + " " + f(y + 15) + " q" + f(fc * 10) + " -4 " + f(fc * 20) + " 0", "#3a2418", 4.4);
    var mx = x + fc * 10, my = y + 23;
    if (mood === "shock") s += '<ellipse cx="' + f(mx) + '" cy="' + f(my + 2) + '" rx="6" ry="8" fill="#5a1a14" stroke="' + INK + '" stroke-width="2"/>';
    else if (mood === "happy" || mood === "proud") s += F("M" + f(mx - 10) + " " + f(my - 2) + " Q" + f(mx) + " " + f(my + 12) + " " + f(mx + 10) + " " + f(my - 2) + " Z", "#7a2a1e", { sw: 2 });
    else if (mood === "worry" || mood === "dizzy") s += P("M" + f(mx - 9) + " " + f(my + 2) + " q4 -5 9 0 q4 5 9 0", INK, 2.6);
    else if (mood === "sick") s += '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1) + '" rx="7" ry="5" fill="#5a1a14" stroke="' + INK + '" stroke-width="2"/>';
    else s += P("M" + f(mx - 8) + " " + f(my) + " q8 6 16 0", INK, 2.8);
    if (mood === "shock" || mood === "worry" || mood === "dizzy") { var sw = (t * 1.3) % 1; s += F("M" + f(x - fc * 30) + " " + f(y - 30 + sw * 20) + " q-7 12 0 15 q7 -3 0 -15 Z", "#9fd6ff", { sw: 1.6, op: 1 - sw }); }
    if (mood === "sick") s += C(x + fc * 16, y + 10, 7, "#e88a8a", { op: 0.6 });
    return s;
  }
  // o: x, y (feet on ground y), f (facing ±1), p (pose name/obj), ph, mood, s (scale), hip ([x,y] fixed hip, for sitting/climbing), shirt
  // man(o): the «لو» man, drawn with the shared person kit (PERSON.side) in the same pose language as before:
  // POSES angles are from straight down, + towards where he faces; aN/aF = [upper arm, forearm], lN/lF = [thigh, shin].
  // o: x, y (feet on ground y), f (facing ±1), pose, mood, t, s (scale), hip ([x,y] fixed hip), shirt, shirtD, vest, hat,
  // phone, outfit (a PERSON outfit preset or object; vest/hat give the worker outfit). The old drawing stays as manOld().
  var MOODFACE = { n: {}, happy: { mouth: "smile" }, proud: { mouth: "grin" }, shock: { brows: "raised", mouth: "open", eyes: 1.25 },
    worry: { brows: "worried", mouth: "frown" }, dizzy: { brows: "worried", mouth: "frown", tired: true, eyes: 0.6 }, sick: { brows: "worried", mouth: "o", tired: true } };
  var PS = 0.84;   // the old man's legs were 164 units, the kit's 196: same height on screen
  function man(o) {
    if (!window.PERSON) return manOld(o);
    if (!man.ink) { window.PERSON.setInk(INK); man.ink = 1; }
    var fc = o.f || 1, s = (o.s || 1) * PS, t = o.t || 0, mood = o.mood || "n";
    var p = Object.assign({}, o.pose || POSES.stand);
    ["aN", "aF"].forEach(function (k) { var a = p[k]; p[k] = [a[0], Math.min(a[0] + 165, Math.max(a[0], a[1]))]; });
    ["lN", "lF"].forEach(function (k) { var a = p[k]; p[k] = [a[0], Math.max(a[0] - 160, Math.min(a[0], a[1]))]; });
    var lean = p.lean || 0;
    function arm(a, hand) { return { sh: a[0] - lean, el: a[1] - a[0], hand: hand }; }
    var handN = p.thumb ? "thumb" : p.point || (p.aN[0] > 80 && p.aN[0] < 110 && p.aN[1] - p.aN[0] < 12) ? "point" : (p.hammer || p.caulk || p.shovel || o.phone) ? "fist" : "relaxed";
    var face = Object.assign({}, MOODFACE[mood] || {});
    if (((t * 0.31 + (o.x || 0) * 0.001) % 1) < 0.035) face.eyes = 0.05;   // a blink now and then
    var outfit = o.outfit || ((o.vest || o.hat) ? { base: "worker" } : { base: "casual" });
    if (typeof outfit === "string") outfit = { base: outfit };
    // the blue shirt is the default only for the plain casual man; a named outfit keeps its own colours unless shirt is given
    var defc = (o.outfit && !o.shirt) ? {} : { shirt: o.shirt || "#4a8ccc", shirtD: o.shirtD || "#2a5f92", pants: "#5a5142", pantsD: "#3e372c" };
    outfit = Object.assign({}, outfit, { colors: Object.assign(defc, outfit.colors || {}) });
    if (!o.vest && outfit.base === "worker" && !outfit.over) outfit.over = "none";
    if (!o.hat && outfit.base === "worker" && !outfit.hat) outfit.hat = "none";
    var q = { rot: o.rot || 0, s: s, dir: fc, lean: lean, breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: (p.head || 0) - lean * 0.3 }, face: face, outfit: outfit,
      legs: [{ hip: p.lN[0], knee: p.lN[0] - p.lN[1] }, { hip: p.lF[0], knee: p.lF[0] - p.lF[1] }], arms: [arm(p.aN, handN), arm(p.aF, p.shovel ? "fist" : "relaxed")] };
    if (p.walk != null) { var W = window.PERSON.walkPose(p.walk * Math.PI * 2, 1); q.legs = W.legs; q.arms = W.arms; q.lean = 3; }   // the kit's own gait: the foot on the floor straight, the other bends after toe-off
    q.x = o.hip ? o.hip[0] : o.x; q.y = o.hip ? o.hip[1] : window.PERSON.sideHipY(Object.assign({ x: 0 }, q), o.y);
    var P = window.PERSON.side(q), J = P.joints;
    // world points of both wrists, for the tools (the kit only reports the near arm)
    function wrist(a) { var L = lean * Math.PI / 180, sp = [-2 * Math.cos(L) + 117 * Math.sin(L), -117 * Math.cos(L) - 2 * Math.sin(L)], ua = a.sh + lean, fa = ua + a.el;
      function V(d) { d = d * Math.PI / 180; return [Math.sin(d), Math.cos(d)]; }
      var w = [sp[0] + V(ua)[0] * 74 + V(fa)[0] * 58, sp[1] + V(ua)[1] * 74 + V(fa)[1] * 58]; return [q.x + w[0] * s * fc, q.y + w[1] * s]; }
    var wN = wrist(q.arms[0]), wF = wrist(q.arms[1]); man.wN = wN; man.wF = wF;   // the wrists, for props an episode draws in the hand
    var g = '<g filter="url(#sh)">' + P.svg;
    if (mood === "shock" || mood === "worry" || mood === "dizzy") { var sw = (t * 1.3) % 1, hc = J.head; g += F("M" + f(hc[0] - fc * 40 * s) + " " + f(hc[1] - 20 + sw * 20) + " q-7 12 0 15 q7 -3 0 -15 Z", "#9fd6ff", { sw: 1.6, op: 1 - sw }); }
    if (p.shovel) { var dv = [wN[0] - wF[0], wN[1] - wF[1]], ln = Math.hypot(dv[0], dv[1]) || 1, u = [dv[0] / ln, dv[1] / ln], back = [wF[0] - u[0] * 26, wF[1] - u[1] * 26], tip = [wN[0] + u[0] * 120, wN[1] + u[1] * 120];
      if (u[1] < 0.2) { u = [fc * 0.5, 0.87]; tip = [wN[0] + u[0] * 120, wN[1] + u[1] * 120]; }
      g += P_("M" + f(back[0]) + " " + f(back[1]) + " L" + f(tip[0]) + " " + f(tip[1]), "#8a5a30", 9) + '<g transform="translate(' + f(tip[0]) + ' ' + f(tip[1]) + ') rotate(' + f(Math.atan2(u[1], u[0]) * 180 / Math.PI - 90) + ')">' + F("M-20 0 L20 0 L16 40 Q0 52 -16 40 Z", "#9aa2ac") + (p.lift > 0.2 ? C(0, 30, 16, "#7a4c2a", { st: INK, sw: 2 }) : "") + '</g>'; }
    if (p.hammer) g += '<g transform="translate(' + f(wN[0]) + ' ' + f(wN[1]) + ') rotate(' + f(p.aN[1] * fc + 180) + ')">' + R(-5, 0, 10, 60, "#8a5a30", { sw: 2 }) + R(-20, 54, 40, 18, "#5a6068", { sw: 2 }) + '</g>';
    if (p.caulk) g += '<g transform="translate(' + f(wN[0]) + ' ' + f(wN[1]) + ') rotate(' + f(fc * 70) + ')">' + R(-8, -10, 16, 56, "#e2b035", { sw: 2 }) + F("M-4 46 L4 46 L0 62 Z", "#ddd", { sw: 2 }) + '</g>';
    if (o.phone) g += R(wN[0] - 10, wN[1] - 30, 20, 34, "#1e2226", { rx: 3, sw: 2 }) + R(wN[0] - 7, wN[1] - 27, 14, 26, "#7ac8ff", { sw: 0 });
    return g + '</g>';
  }
  function P_(d, col, w) { return P(d, col, w); }
  function manOld(o) {
    var fc = o.f || 1, s = o.s || 1, p = o.pose, mood = o.mood || "n", t = o.t || 0;
    var Lt = 112, Lth = 84, Lsh = 80, Lu = 64, Ll = 60;
    // joint limits (angles from straight down, + = towards where he faces): an elbow only folds the forearm forward/up
    // (forearm ≥ upper arm, at most 165° more), a knee only folds the shin backward (shin ≤ thigh, at most 160° less)
    p = Object.assign({}, p); ["aN", "aF"].forEach(function (k) { var a = p[k]; p[k] = [a[0], Math.min(a[0] + 165, Math.max(a[0], a[1]))]; });
    ["lN", "lF"].forEach(function (k) { var a = p[k]; p[k] = [a[0], Math.max(a[0] - 160, Math.min(a[0], a[1]))]; });
    var H = [0, 0], S = add(H, dirv(180 - p.lean, fc), Lt), N = add(S, dirv(180 - p.lean, fc), 14), Hd = add(N, dirv(180 - p.lean - p.head, fc), 34);
    function leg(a) { var K = add(H, dirv(a[0], fc), Lth), A = add(K, dirv(a[1], fc), Lsh); return [H, K, A]; }
    function arm(a) { var E = add(S, dirv(a[0], fc), Lu), W = add(E, dirv(a[1], fc), Ll); return [S, E, W]; }
    var lN = leg(p.lN), lF = leg(p.lF), aN = arm(p.aN), aF = arm(p.aF);
    var ox = o.hip ? o.hip[0] : o.x, oy = o.hip ? o.hip[1] : o.y - Math.max(lN[2][1], lF[2][1]) * s - 12 * s;
    var g = '<g transform="translate(' + f(ox) + ' ' + f(oy) + ') scale(' + f(s) + ')" filter="url(#sh)">';
    var shirt = o.shirt || "url(#shirt)", shirtD = o.shirtD || "#24507a";
    function shoe(A, a) { var d = dirv(a + 90, fc), q = add(A, d, 30); return '<path d="M' + f(A[0] - fc * 8) + ' ' + f(A[1] - 4) + ' L' + f(q[0]) + ' ' + f(q[1] - 2) + ' Q' + f(q[0] + fc * 8) + ' ' + f(q[1] + 10) + ' ' + f(q[0] - fc * 4) + ' ' + f(q[1] + 12) + ' L' + f(A[0] - fc * 10) + ' ' + f(A[1] + 12) + ' Z" fill="#4a2c18" stroke="' + INK + '" stroke-width="3"/>'; }
    function hand(W, open) { return C(W[0], W[1], 11, "url(#skin)", { st: INK, sw: 2.6 }); }
    function armDraw(a, far) { var mid = [lerp(a[0][0], a[1][0], 0.55), lerp(a[0][1], a[1][1], 0.55)]; return limb([a[0], mid], 26, 24, far ? shirtD : shirt, shirtD) + limb([mid, a[1], a[2]], 20, 17, far ? "#b8805a" : "url(#skin)", "#b8805a") + hand(a[2]); }
    g += limb([lF[0], lF[1], lF[2]], 34, 26, "#3e372c", "#3e372c") + shoe(lF[2], p.lF[1]);
    g += armDraw(aF, true);
    // torso: a tapered shape from the hips to the shoulders, shirt with a collar and a belt
    var tv = dirv(180 - p.lean, fc), nv = [tv[1] * fc, -tv[0] * fc], wS = 30, wH = 26;
    var p1 = [H[0] + nv[0] * wH * fc, H[1] + nv[1] * wH * fc], p2 = [H[0] - nv[0] * wH * fc, H[1] - nv[1] * wH * fc], p3 = [S[0] - nv[0] * wS * fc, S[1] - nv[1] * wS * fc], p4 = [S[0] + nv[0] * wS * fc, S[1] + nv[1] * wS * fc];
    g += F("M" + f(p1[0]) + " " + f(p1[1]) + " L" + f(p2[0]) + " " + f(p2[1]) + " L" + f(p3[0]) + " " + f(p3[1]) + " Q" + f(S[0] + tv[0] * 14) + " " + f(S[1] + tv[1] * 14) + " " + f(p4[0]) + " " + f(p4[1]) + " Z", shirt);
    g += P("M" + f(p1[0]) + " " + f(p1[1]) + " L" + f(p2[0]) + " " + f(p2[1]), "#3a2c20", 9);
    if (o.vest) g += F("M" + f(lerp(p1[0], p4[0], 0.1)) + " " + f(lerp(p1[1], p4[1], 0.1)) + " L" + f(lerp(p2[0], p3[0], 0.1)) + " " + f(lerp(p2[1], p3[1], 0.1)) + " L" + f(lerp(p2[0], p3[0], 0.9)) + " " + f(lerp(p2[1], p3[1], 0.9)) + " L" + f(lerp(p1[0], p4[0], 0.9)) + " " + f(lerp(p1[1], p4[1], 0.9)) + " Z", "url(#vest)", { sw: 2.4 });
    g += limb([lN[0], lN[1], lN[2]], 36, 28, "url(#pants)", "#3e372c") + shoe(lN[2], p.lN[1]);
    g += limb([S, N], 18, 18, "url(#skin)", "#b8805a");
    g += face(Hd, fc, mood, t, s);
    if (o.hat) g += F("M" + f(Hd[0] - 36) + " " + f(Hd[1] - 14) + " Q" + f(Hd[0]) + " " + f(Hd[1] - 70) + " " + f(Hd[0] + 36) + " " + f(Hd[1] - 14) + " Z", "#f2c230") + R(Hd[0] - 44, Hd[1] - 18, 88, 10, "#d9a820", { rx: 4, sw: 2.4 });
    g += armDraw(aN, false);
    if (p.thumb) g += R(aN[2][0] - 4, aN[2][1] - 26, 9, 18, "url(#skin)", { rx: 4, sw: 2.4 });
    if (p.shovel) { var top = aF[2], low = aN[2], dv = [low[0] - top[0], low[1] - top[1]], ln = Math.hypot(dv[0], dv[1]) || 1, u = [dv[0] / ln, dv[1] / ln], back = [top[0] - u[0] * 26, top[1] - u[1] * 26], tip = [low[0] + u[0] * 120, low[1] + u[1] * 120];
      if (u[1] < 0.2) { u = [fc * 0.5, 0.87]; tip = [low[0] + u[0] * 120, low[1] + u[1] * 120]; }   // a shovel blade always points at the ground
      g += P("M" + f(back[0]) + " " + f(back[1]) + " L" + f(tip[0]) + " " + f(tip[1]), "#8a5a30", 9) + '<g transform="translate(' + f(tip[0]) + ' ' + f(tip[1]) + ') rotate(' + f(Math.atan2(u[1], u[0]) * 180 / Math.PI - 90) + ')">' + F("M-20 0 L20 0 L16 40 Q0 52 -16 40 Z", "#9aa2ac") + (p.lift > 0.2 ? C(0, 30, 16, "#7a4c2a", { st: INK, sw: 2 }) : "") + '</g>'; }
    if (p.hammer) { var hw = aN[2]; g += '<g transform="translate(' + f(hw[0]) + ' ' + f(hw[1]) + ') rotate(' + f((p.aN[1]) * fc + 180) + ')">' + R(-5, 0, 10, 60, "#8a5a30", { sw: 2 }) + R(-20, 54, 40, 18, "#5a6068", { sw: 2 }) + '</g>'; }
    if (p.caulk) { var cw = aN[2]; g += '<g transform="translate(' + f(cw[0]) + ' ' + f(cw[1]) + ') rotate(' + f(fc * 70) + ')">' + R(-8, -10, 16, 56, "#e2b035", { sw: 2 }) + F("M-4 46 L4 46 L0 62 Z", "#ddd", { sw: 2 }) + '</g>'; }
    if (o.phone) { var pw = aN[2]; g += R(pw[0] - 10, pw[1] - 30, 20, 34, "#1e2226", { rx: 3, sw: 2 }) + R(pw[0] - 7, pw[1] - 27, 14, 26, "#7ac8ff", { sw: 0 }); }
    return g + '</g>';
  }
  // keyframed acting: K = [[u, {x, y, f, p, mood, ...}], ...]; position eases between keys, the pose blends over the last 0.45 s
  function act(u, K, t) {
    var i = 0; while (i < K.length - 1 && K[i + 1][0] <= u) i++;
    var a = K[i][1], b = i + 1 < K.length ? K[i + 1][1] : a, ua = K[i][0], ub = i + 1 < K.length ? K[i + 1][0] : ua + 1;
    var kpos = b.jump ? (u >= ub ? 1 : 0) : ease((u - ua) / Math.max(0.01, ub - ua)), x = lerp(a.x, b.x == null ? a.x : b.x, kpos), y = lerp(a.y, b.y == null ? a.y : b.y, kpos);
    var moving = Math.abs((b.x == null ? a.x : b.x) - a.x) > 4 && !a.p, ph = x / 150;
    var pa = moving ? pose("walk", ph) : pose(a.p || "stand", u * (a.rate || 1.2)), pb = b.p ? pose(b.p, u * (b.rate || 1.2)) : pa;
    var bk = clamp((u - (ub - 0.45)) / 0.45), pz = mixPose(pa, pb, ease(bk));
    if (!moving && (a.p || "stand") === "stand") { pz = mixPose(pz, { lean: Math.sin(t * 1.6) * 2, head: Math.sin(t * 1.1) * 3 }, 0.5); }
    var hip = a.hip ? [lerp(a.hip[0], (b.hip || a.hip)[0], kpos), lerp(a.hip[1], (b.hip || a.hip)[1], kpos)] : null;
    return man({ x: x, y: y + Math.abs(Math.sin(u * 5)) * (moving ? 4 : 0), f: (kpos > 0.5 && b.f ? b.f : a.f) || 1, pose: pz, mood: u > ub - 0.3 && b.mood ? b.mood : a.mood, t: t, hip: hip, rot: a.rot, s: a.s || 1, shirt: a.shirt, shirtD: a.shirtD, vest: a.vest, hat: a.hat, phone: a.phone, outfit: a.outfit });
  }
  // ── overlays: a dark pill label with a pointer, a red ✗, a green ✓, a yellow ring ──
  function pill(text, x, y, u, u0, o) { o = o || {}; var k = clamp((u - u0) / 0.35); if (k <= 0) return ""; var sz = o.sz || 40, w = text.length * sz * 0.52 + 44, col = o.bg || "#262a30";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ')" filter="url(#sh)">' + R(-w / 2, -sz * 0.9, w, sz * 1.5, col, { rx: sz * 0.42, sw: 3, st: "#111" }) + (o.down !== false ? F("M-12 " + f(sz * 0.6) + " L0 " + f(sz * 0.6 + 16) + " L12 " + f(sz * 0.6) + " Z", col, { sw: 0 }) : "") + T(text, 0, sz * 0.22, sz, o.col || "#fff") + '</g>'; }
  function xmark(x, y, u, u0, s) { var k = clamp((u - u0) / 0.3); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * (s || 1)) + ')" filter="url(#sh)">' + C(0, 0, 46, "#fff", { st: "#d8352a", sw: 9 }) + P("M-20 -20 L20 20 M20 -20 L-20 20", "#d8352a", 12) + '</g>'; }
  function vmark(x, y, u, u0, s) { var k = clamp((u - u0) / 0.3); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * (s || 1)) + ')" filter="url(#sh)">' + C(0, 0, 46, "#3aa05a", { st: "#fff", sw: 7 }) + P("M-20 2 L-6 16 L22 -14", "#fff", 11) + '</g>'; }
  function ring(x, y, r, u, u0, t) { var k = clamp((u - u0) / 0.4); if (k <= 0) return ""; return C(x, y, r * (1.6 - 0.6 * ease(k)) * (1 + 0.04 * Math.sin(t * 6)), "none", { st: "#ffd23a", sw: 8, op: k }) + C(x, y, r * 1.1, "url(#ring)", { op: 0.6 * k }); }

  function confetti(t, x0, x1, y0, y1) { var s = ""; for (var c = 0; c < 40; c++) { var p = (t * 0.5 + hash(c)) % 1, cx = x0 + hash(c + 2) * (x1 - x0) + Math.sin(t * 3 + c) * 20, cy = lerp(y0, y1, p); s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="12" height="18" fill="' + ["#d8352a", "#f2c230", "#3aa05a", "#2f6f9f", "#9a5fb0"][c % 5] + '" transform="rotate(' + f(t * 260 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; } return s; }
  function arrowH(x1, y, x2, col, w, k) { if (k <= 0) return ""; var x = lerp(x1, x2, k), d = x2 > x1 ? 1 : -1; return P("M" + f(x1) + " " + f(y) + " L" + f(x) + " " + f(y), INK, w + 6) + P("M" + f(x1) + " " + f(y) + " L" + f(x) + " " + f(y), col, w) + F("M" + f(x + d * 22) + " " + f(y) + " L" + f(x - d * 6) + " " + f(y - 18) + " L" + f(x - d * 6) + " " + f(y + 18) + " Z", col, { sw: 3 }); }
  function arrowV(x, y1, y2, col, w, k) { if (k <= 0) return ""; var y = lerp(y1, y2, k), d = y2 > y1 ? 1 : -1; return P("M" + f(x) + " " + f(y1) + " L" + f(x) + " " + f(y), INK, w + 6) + P("M" + f(x) + " " + f(y1) + " L" + f(x) + " " + f(y), col, w) + F("M" + f(x) + " " + f(y + d * 22) + " L" + f(x - 18) + " " + f(y - d * 6) + " L" + f(x + 18) + " " + f(y - d * 6) + " Z", col, { sw: 3 }); }
  // ── shots and the build that grows: STEPS = [[line, {part: 1}], …] turns parts on from that line onward ──
  var SH = [], STEPS = [], CUR = 0;
  function shot(line, c0, c1, draw) { SH.push({ a: L(line), c0: c0, c1: c1, draw: draw }); }
  function steps(s) { STEPS = s; }
  function has(extra, line) { var o = {}; STEPS.forEach(function (s) { if (s[0] < (line == null ? CUR : line)) Object.assign(o, s[1]); }); return Object.assign(o, extra || {}); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  window.__scene = function (svg, t) {
    var i = at(t); CUR = i; var sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a), k = ease(u / d);
    var cx = lerp(sh.c0[0], sh.c1[0], k) + 10 * Math.sin(t * 0.9), cy = lerp(sh.c0[1], sh.c1[1], k) + 8 * Math.cos(t * 0.8), z = lerp(sh.c0[2], sh.c1[2], k) * (1 + 0.012 * Math.sin(t * 1.1));
    if (i > 0 && u < 0.35) { var pc = SH[i - 1].c1, m = ease(u / 0.35); cx = lerp(pc[0], cx, m); cy = lerp(pc[1], cy, m); z = lerp(pc[2], z, m); }
    svg.innerHTML = '<g transform="translate(540 960) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>';
    return i;
  };
  window.LAW = { L: L, clamp: clamp, ease: ease, lerp: lerp, hash: hash, f: f, pop: pop, INK: INK, R: R, P: P, F: F, C: C, T: T, GY: GY,
    sky: sky, desertSky: desertSky, sand: sand, palm: palm, bush: bush, ground: ground, POSES: POSES, pose: pose, mixPose: mixPose, man: man, manOld: manOld, act: act,
    pill: pill, xmark: xmark, vmark: vmark, ring: ring, confetti: confetti, arrowH: arrowH, arrowV: arrowV,
    shot: shot, steps: steps, has: has, setLine: function (n) { CUR = n; } };
  window.__parts = window.LAW;
})();