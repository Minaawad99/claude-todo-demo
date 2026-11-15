
  // ── «مثلث برمودا» in the «القصة 2D» look. Shapes from the documented features of the real aircraft and ships
  //    (see ../refs/SOURCES.md): the Grumman TBM Avenger (big radial cowling, long greenhouse canopy, ball turret, deep
  //    belly, tall rounded fin), the Martin PBM Mariner (boat hull, gull wing, two engines, twin fins), the collier USS
  //    Cyclops (a row of tall coaling gantries), the Beechcraft Bonanza (V-tail). The map is Natural Earth 1:10m. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  var still = function (u, d) { return [180, 320, 1 + 0.04 * u / d]; };
  var HSY = 394; var NAVY = "#1f2a40", SEA = "#24466a", SK = ["#e0b48c", "#d9a57a", "#e8c0a0", "#c98f66"], YEL = "#f2c230";

  // ── sea and weather ─────────────────────────────────────
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.5 + hash(i + 1) * 1.1) + '" fill="#fff" opacity="' + f2(.35 + .5 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  // the sea from wy down; mood: day | dusk | night | storm
  function sea(t, wy, mood) {
    var top = { day: "#3a9ac0", dusk: "#4a5a7a", night: "#14264a", storm: "#1c2a36" }[mood], bot = { day: "#16557e", dusk: "#1e2a48", night: "#050a18", storm: "#0a1016" }[mood];
    var s = '<linearGradient id="sea_' + mood + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bot + '"/></linearGradient>' + R(-260, wy, 880, 900, "url(#sea_" + mood + ")", { s: 0 });
    var gl = mood === "day" ? "#e6f6ff" : mood === "dusk" ? "#f2b48a" : "#8aa6cc", n = mood === "storm" ? 60 : 46, sp = mood === "storm" ? 40 : 18;
    for (var i = 0; i < n; i++) { var y = wy + 6 + Math.pow(hash(i + 2), 1.4) * 330, x = ((hash(i) * 880 + t * (sp + hash(i + 7) * 20) * (y - wy + 40) / 160) % 880) - 260, w = (10 + hash(i + 5) * 26) * (y - wy + 40) / 120;
      s += mood === "storm" ? '<path d="M' + f(x) + ' ' + f(y) + ' q' + f(w / 2) + ' ' + f(-w / 3) + ' ' + f(w) + ' 0" stroke="#c8d6e0" stroke-width="1.5" fill="none" opacity="' + f2(.25 + .35 * Math.abs(Math.sin(t * 2 + i))) + '"/>'
        : '<path d="M' + f(x) + ' ' + f(y) + ' h' + f(w) + '" stroke="' + gl + '" stroke-width="1.4" opacity="' + f2(.25 + .3 * Math.sin(t * 2 + i)) + '"/>'; }
    return s;
  }
  function sun(x, y, r, t) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 3) + '" fill="url(#warm)" opacity="' + f2(.6 + .05 * Math.sin(t * 2)) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff6d8"/>'; }
  function stormClouds(t, y, op) { return cloudBank(t, y - 60, 6, 6, "#1a1e26", op, 1.6) + cloudBank(t, y - 10, 10, 6, "#2a303a", op, 1.3) + cloudBank(t, y + 40, 14, 6, "#3a404a", op * .8, 1.1); }
  // a lightning bolt from (x, y) down `len`, flickering on its own clock; returns "" when it is dark
  function bolt(t, x, y, len, seed, per) {
    per = per || 2.6; var ph = ((t + hash(seed) * per) % per) / per; if (ph > .16) return "";
    var a = ph < .05 ? 1 : ph < .08 ? .3 : ph < .12 ? .9 : .4, d = "M" + x + " " + y, cx = x, cy = y, br = "";
    for (var k = 1; k <= 9; k++) { cx += (hash(seed * 31 + k) - .5) * 34; cy += len / 9; d += " L" + f(cx) + " " + f(cy); if (k === 3 || k === 6) br += '<path d="M' + f(cx) + ' ' + f(cy) + ' l' + f((hash(seed + k) - .5) * 60) + ' ' + f(len / 6) + ' l' + f((hash(seed + k + 1) - .5) * 30) + ' ' + f(len / 8) + '" stroke="#e8f0ff" stroke-width="1.4" fill="none"/>'; }
    return '<g opacity="' + f2(a) + '"><path d="' + d + '" stroke="#9fc0ff" stroke-width="7" fill="none" filter="url(#glow)"/><path d="' + d + '" stroke="#ffffff" stroke-width="2.2" fill="none"/>' + br + '</g>';
  }
  function flash(t, seed, per) { per = per || 2.6; var ph = ((t + hash(seed) * per) % per) / per; if (ph > .16) return ""; var a = ph < .05 ? .32 : ph < .08 ? .08 : ph < .12 ? .26 : .1; return R(-300, -300, 960, 1240, "#cfe0ff", { s: 0, op: a }); }
  function rain(t, n, op) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 700 + t * 60) % 700) - 170, y = ((hash(i + 9) * 900 + t * 520) % 900) - 130; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-5 16" stroke="#b8c8dc" stroke-width="1" opacity="' + f2(op || .35) + '"/>'; } return s; }

  // ── aircraft and ships (side view, nose to the right; origin at the centre of the fuselage) ──
  function prop(x, y, r, t) { var a = (t * 1700) % 360; return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f(r * .14) + '" ry="' + r + '" fill="#d8dde2" opacity=".28"/>' + G('translate(' + x + ' ' + y + ') scale(.14 1) rotate(' + f(a) + ')', '<path d="M0 0 L-3 ' + (-r) + ' L3 ' + (-r) + ' Z M0 0 L' + f(r * .87 - 3) + ' ' + f(r * .5) + ' L' + f(r * .87 + 1) + ' ' + f(r * .45) + ' Z M0 0 L' + f(-r * .87 - 1) + ' ' + f(r * .45) + ' L' + f(-r * .87 + 3) + ' ' + f(r * .5) + ' Z" fill="#2a2a2a" opacity=".55"/>'); }
  function star(x, y, r) { var d = ""; for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .4 : r; d += (k ? "L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<rect x="' + f(x - r * 2.1) + '" y="' + f(y - r * .32) + '" width="' + f(r * 4.2) + '" height="' + f(r * .64) + '" fill="#f2f2f0" stroke="' + INK + '" stroke-width=".8"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * 1.08) + '" fill="#1c2a5a" stroke="' + INK + '" stroke-width=".8"/><path d="' + d + 'Z" fill="#fff"/>'; }
  // Grumman TBM Avenger, ~210 long at s=1
  function avenger(x, y, s, t, o) {
    o = o || {}; var body = o.dark ? "#121a28" : "#2a3e5e", hi = o.dark ? "#1e2a3e" : "#4a6a94", g = "", bob = Math.sin(t * 1.3 + x * .01) * 2;
    // far wing (behind)
    g += P('M18 2 L-10 3 L-40 -14 L-20 -15 Z', darker(body, .7), { w: 1.2 });
    g += P('M-86 -6 L-118 -10 L-120 -4 L-88 -1 Z', darker(body, .8), { w: 1.1 });
    // fuselage
    g += cel('M100 -20 Q104 0 100 20 L60 22 Q20 24 -20 22 Q-40 20 -60 10 L-108 2 L-112 -8 L-80 -16 Q-50 -22 -30 -26 L50 -24 Q80 -24 100 -20 Z', body, "av" + (CLN++), { w: 1.8 });
    g += '<path d="M60 -22 Q75 -10 62 20" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".6"/><path d="M-20 22 Q-30 14 -34 6" stroke="' + INK + '" stroke-width=".9" fill="none" opacity=".5"/>';
    // engine cowling (big radial) and exhausts
    g += P('M96 -21 Q108 0 96 21 L86 21 Q94 0 86 -21 Z', hi, { w: 1.6 }) + '<path d="M78 8 l-10 0 M78 13 l-10 0" stroke="#3a3a3a" stroke-width="2"/>';
    // the long greenhouse canopy and the ball turret
    g += P('M54 -24 Q50 -38 30 -40 L-24 -40 Q-30 -38 -32 -26 Z', "#9fc0d8", { w: 1.6 }) + '<path d="M40 -39 V-24 M24 -40 V-25 M8 -40 V-25 M-8 -40 V-25 M-20 -40 V-26 M52 -30 H-30" stroke="' + INK + '" stroke-width="1"/>';
    if (o.lit) g += P('M54 -24 Q50 -38 30 -40 L20 -40 L20 -25 Z', "#ffd98a", { s: 0, op: .55 });
    g += '<circle cx="-42" cy="-30" r="12" fill="#9fc0d8" stroke="' + INK + '" stroke-width="1.6"/><path d="M-42 -42 V-18 M-54 -30 H-30" stroke="' + INK + '" stroke-width=".9"/><path d="M-40 -34 l-26 -2" stroke="#2a2a2a" stroke-width="2"/>';
    // tall rounded fin and rudder
    g += P('M-84 -16 Q-92 -48 -104 -52 Q-114 -52 -114 -40 L-112 -8 Z', body, { w: 1.6 }) + '<path d="M-106 -50 L-104 -6" stroke="' + INK + '" stroke-width=".9"/>';
    // near tailplane
    g += P('M-84 -2 L-122 -2 L-124 5 L-88 6 Z', hi, { w: 1.3 });
    // near wing, coming toward the viewer
    g += P('M40 4 L-14 6 L-26 40 L4 42 Z', hi, { w: 1.6 }) + P('M-14 6 L-26 40 L-20 40 L-6 6 Z', darker(hi, .75), { s: 0 });
    // markings: star and bar, the tail code
    g += star(-62, -2, 7) + txt(o.code || "FT", -98, -24, 7, "#f2f2f0", { font: "Noto Serif", wt: 700 });
    g += prop(104, 0, 30, t) + '<circle cx="104" cy="0" r="4" fill="#3a3a3a"/>';
    return G('translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g, o.op);
  }
  // Martin PBM Mariner flying boat, ~300 long at s=1, gull wing above the hull
  function mariner(x, y, s, t, o) {
    o = o || {}; var top = o.dark ? "#141c2a" : "#2a3e5e", bel = o.dark ? "#3a4252" : "#e8e8e2", g = "", bob = Math.sin(t * 1.1 + x * .01) * 2;
    g += P('M-150 -10 L-170 -12 L-174 -2 L-150 0 Z', darker(top, .8), { w: 1.1 });
    // hull: boat bottom with a step
    g += cel('M140 -6 Q146 10 130 22 L20 28 L16 34 L-60 30 L-150 6 L-152 -14 Q-60 -30 60 -30 Q120 -28 140 -6 Z', top, "pm" + (CLN++), { w: 1.8 });
    g += P('M138 4 Q140 14 130 22 L20 28 L16 34 L-60 30 L-150 6 L-150 2 Q-60 18 20 16 Q100 12 138 4 Z', bel, { w: 1.4 });
    g += P('M124 -22 Q136 -16 140 -6 L118 -8 Q116 -18 124 -22 Z', "#9fc0d8", { w: 1.2 }) + P('M96 -28 L74 -40 L50 -40 L44 -30 Z', "#9fc0d8", { w: 1.4 });
    for (var w = 0; w < 6; w++) g += '<circle cx="' + (20 - w * 22) + '" cy="-12" r="2.6" fill="' + (o.lit ? "#ffd98a" : "#9fc0d8") + '" stroke="' + INK + '" stroke-width=".7"/>';
    // twin fins at the tail (one seen)
    g += P('M-128 -16 L-178 -52 L-182 -44 L-136 -8 Z', top, { w: 1.4 }) + '<ellipse cx="-180" cy="-52" rx="11" ry="27" fill="' + top + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-180 -79 V-25" stroke="' + INK + '" stroke-width=".8" opacity=".6"/>';
    // gull wing: rising from the hull, then flat; the engine under the break
    g += P('M50 -30 L30 -64 L-10 -66 L-4 -30 Z', top, { w: 1.6 }) + P('M30 -64 L60 -70 L-60 -72 L-10 -66 Z', darker(top, 1.1), { w: 1.4 });
    g += P('M54 -66 Q74 -66 76 -58 Q74 -48 54 -48 L10 -50 L10 -64 Z', top, { w: 1.5 }) + prop(78, -57, 24, t);
    g += '<path d="M10 -66 L-4 -20 M40 -66 L50 -26" stroke="' + INK + '" stroke-width="0" />';
    g += '<path d="M-36 -66 L-30 -24 M-14 -66 L-26 -24 M-36 -66 L-26 -24" stroke="' + INK + '" stroke-width="1.6"/>' + P('M-48 -22 Q-30 -28 -8 -22 Q-12 -14 -30 -14 Q-46 -15 -48 -22 Z', bel, { w: 1.4 }) + star(-90, -6, 7);
    if (o.fumes) for (var q = 0; q < 6; q++) { var ph = ((t * .5 + q / 6) % 1); g += '<circle cx="' + f(-20 - ph * 60) + '" cy="' + f(-30 - ph * 20) + '" r="' + f(6 + ph * 14) + '" fill="#c8d06a" opacity="' + f2(.35 * (1 - ph)) + '"/>'; }
    return G('translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g, o.op);
  }
  // Beechcraft Bonanza with its V-tail, ~120 long at s=1
  function bonanza(x, y, s, t, o) {
    o = o || {}; var g = "", bob = Math.sin(t * 1.6) * 1.5;
    g += P('M-46 -4 L-70 -26 L-62 -28 L-38 -6 Z', "#b8322a", { w: 1.3 }) + P('M-46 0 L-72 4 L-70 10 L-42 4 Z', "#d9d6cc", { w: 1.2 });
    g += cel('M58 -6 Q62 2 56 8 L10 10 L-56 2 L-58 -4 L-10 -12 Q10 -20 30 -18 L50 -12 Z', "#f0ede4", "bz" + (CLN++), { w: 1.6 });
    g += '<path d="M54 2 L-56 0" stroke="#b8322a" stroke-width="3"/>' + P('M30 -18 Q20 -26 2 -24 L-8 -13 Z', "#9fc0d8", { w: 1.3 });
    if (o.faces) g += '<circle cx="18" cy="-17" r="3.2" fill="' + SK[0] + '"/><circle cx="6" cy="-17" r="3.2" fill="' + SK[3] + '"/>';
    g += P('M24 2 L-6 4 L-16 28 L6 28 Z', "#e8e4d8", { w: 1.4 }) + prop(62, 1, 18, t);
    return G('translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s) + ')', g, o.op);
  }
  // a merchant tanker (SS Gaines Mills): bridge amidships, engine house and funnel aft
  function tanker(x, y, s, t, o) {
    o = o || {}; var win = o.lit === false ? "#2a2e3a" : "#ffd98a", g = "";
    g += '<path d="M-90 -14 H120" stroke="#5a5a5a" stroke-width="1"/><path d="M110 -14 V-56 M-10 -30 V-62" stroke="#6a5a44" stroke-width="1.6"/>';
    g += R(-12, -34, 30, 20, "#e8e4d8", { w: 1.2 }) + R(-6, -42, 18, 8, "#e8e4d8", { w: 1 }) + R(-120, -36, 36, 22, "#e8e4d8", { w: 1.2 }) + P('M-108 -36 L-110 -56 L-96 -56 L-98 -36 Z', "#1a1a1e", { w: 1.2 });
    for (var w = 0; w < 4; w++) g += R(-8 + w * 6, -30, 3, 3.6, win, { s: 0 }) + R(-116 + w * 7, -30, 3, 3.6, win, { s: 0 });
    g += P('M-130 -6 Q-132 -16 -122 -16 L130 -16 L136 -14 L126 0 L-124 0 Z', "#2a2c32", { w: 1.6 }) + '<path d="M-128 -4 L130 -4" stroke="#7a2a22" stroke-width="2.4"/>';
    if (o.people) for (var p = 0; p < 4; p++) g += silhouette(30 + p * 14, -16, .32, "#0a0c12");
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2 + x) * 1.2) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g, o.op);
  }
  // the collier USS Cyclops (1910): low hull, a row of tall gantry frames for coaling, bridge forward, funnel aft
  function cyclops(x, y, s, t, o) {
    o = o || {}; var g = "", c = o.col || "#5a626e";
    for (var k = 0; k < 10; k++) { var gx = -110 + k * 24; if (k < 9) g += '<path d="M' + (gx + 6) + ' -50 L' + (gx + 18) + ' -76 M' + (gx + 6) + ' -76 L' + (gx + 18) + ' -50" stroke="' + c + '" stroke-width="1.2"/>'; g += '<path d="M' + (gx - 6) + ' -18 L' + (gx - 6) + ' -78 L' + (gx + 6) + ' -78 L' + (gx + 6) + ' -18 M' + (gx - 6) + ' -50 L' + (gx + 6) + ' -50" stroke="' + c + '" stroke-width="1.8" fill="none"/>'; }
    g += '<path d="M-116 -78 H122" stroke="' + c + '" stroke-width="2"/>';
    g += R(130, -60, 30, 42, "#c8c4b8", { w: 1.2 }) + R(126, -70, 38, 10, "#b8b4a8", { w: 1.2 }) + R(-200, -38, 70, 18, "#c8c4b8", { w: 1.2 });
    [-182, -150].forEach(function (fx) { g += R(fx - 6, -96, 12, 58, "#1e1e22", { w: 1.2 }) + R(fx - 6, -84, 12, 6, "#e8e4d8", { s: 0 }); });
    g += '<path d="M146 -60 V-110 M-124 -18 V-104 M172 -22 L146 -106 L-124 -100 L-206 -22" stroke="#4a4a4a" stroke-width="1.4" fill="none"/>';
    g += P('M-206 -8 Q-208 -20 -198 -20 L176 -22 L184 -20 L176 0 L-200 0 Z', o.hull || "#3a4048", { w: 1.6 });
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.1) * 1.2) + ') scale(' + f(s) + ')', g, o.op);
  }
  function coastGuard(x, y, s, t) { var g = R(-40, -40, 70, 26, "#f2f0ea", { w: 1.3 }) + R(-30, -58, 40, 18, "#f2f0ea", { w: 1.2 }) + '<path d="M-10 -58 V-90" stroke="#4a4a4a" stroke-width="2"/>';
    g += P('M-110 -6 Q-112 -18 -100 -18 L110 -20 L124 -18 L112 0 L-104 0 Z', "#f6f4ee", { w: 1.6 }) + P('M70 -19 L84 -19 L64 -1 L50 -1 Z', "#d0402a", { s: 0 }) + P('M88 -19 L93 -19 L73 -1 L68 -1 Z', "#2a4a8a", { s: 0 });
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2) * 1.2) + ') scale(' + f(s) + ')', g); }

  // ── instruments ───────────────────────────────────────
  function compass(x, y, r, t, o) {
    o = o || {}; var a = o.spin ? t * o.spin + Math.sin(t * 3.1) * 40 : (o.head || 0) + Math.sin(t * 1.7) * 6, g = '<circle r="' + (r + 8) + '" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="' + r + '" fill="#101418" stroke="#5a5a5a" stroke-width="1.4"/>';
    for (var k = 0; k < 36; k++) { var q = k * 10 * Math.PI / 180; g += '<path d="M' + f(Math.sin(q) * r * .86) + ' ' + f(-Math.cos(q) * r * .86) + ' L' + f(Math.sin(q) * r * (k % 9 ? .94 : .78)) + ' ' + f(-Math.cos(q) * r * (k % 9 ? .94 : .78)) + '" stroke="#e8e4d8" stroke-width="' + (k % 9 ? 1 : 2) + '"/>'; }
    var L4 = ["N", "E", "S", "W"]; for (var j = 0; j < 4; j++) { var q2 = j * Math.PI / 2; g += txt(L4[j], Math.sin(q2) * r * .6, -Math.cos(q2) * r * .6 + r * .1, r * .26, j ? "#e8e4d8" : "#e85a3a", { font: "Noto Serif", wt: 700 }); }
    g += G('rotate(' + f(a) + ')', '<path d="M0 ' + f(-r * .7) + ' L' + f(r * .08) + ' 0 L0 ' + f(r * .7) + ' L' + f(-r * .08) + ' 0 Z" fill="#f2f0ea" stroke="' + INK + '" stroke-width="1"/><path d="M0 ' + f(-r * .7) + ' L' + f(r * .08) + ' 0 L' + f(-r * .08) + ' 0 Z" fill="#e85a3a"/>') + '<circle r="' + f(r * .08) + '" fill="#c9a040"/>';
    g += '<ellipse cx="' + f(-r * .3) + '" cy="' + f(-r * .4) + '" rx="' + f(r * .4) + '" ry="' + f(r * .18) + '" fill="#fff" opacity=".1" transform="rotate(-30)"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ')', g);
  }
  function gauge(x, y, r, v, lab, t) { var g = '<circle r="' + (r + 6) + '" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="' + r + '" fill="#101418"/>';
    for (var k = 0; k <= 10; k++) { var q = (-120 + k * 24) * Math.PI / 180; g += '<path d="M' + f(Math.sin(q) * r * .8) + ' ' + f(-Math.cos(q) * r * .8) + ' L' + f(Math.sin(q) * r * .95) + ' ' + f(-Math.cos(q) * r * .95) + '" stroke="' + (k < 2 ? "#e85a3a" : "#e8e4d8") + '" stroke-width="1.6"/>'; }
    var a = -120 + v * 240 + Math.sin(t * 6) * 1.5; g += G('rotate(' + f(a) + ')', '<path d="M-2 0 L0 ' + f(-r * .82) + ' L2 0 Z" fill="#f2c230"/>') + '<circle r="3" fill="#c9a040"/>' + txt(lab, 0, r * .55, r * .26, "#e8e4d8", { font: "Noto Serif", wt: 700 });
    return G('translate(' + f(x) + ' ' + f(y) + ')', g); }
  function cockpit(t, o) { o = o || {}; var s = o.view || ""; s += P('M-200 360 L-200 900 L560 900 L560 360 Q470 330 180 330 Q-110 330 -200 360 Z', "#1a1c20", { w: 2 }) + P('M-200 360 Q-110 330 180 330 Q470 330 560 360 L560 384 Q460 356 180 356 Q-100 356 -200 384 Z', "#2a2c30", { s: 0 });
    s += P('M-120 -100 L-40 330 M480 -100 L400 330', "none", { w: 10, s: "#14161a" });
    return s; }
  function headset(x, y, s) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', '<path d="M-14 -4 Q-15 -26 0 -26 Q15 -26 14 -4" stroke="#1a1a1a" stroke-width="3" fill="none"/><rect x="-18" y="-8" width="7" height="13" rx="3" fill="#1a1a1a"/><rect x="11" y="-8" width="7" height="13" rx="3" fill="#1a1a1a"/><path d="M-14 4 Q-10 18 4 20" stroke="#1a1a1a" stroke-width="2" fill="none"/><circle cx="6" cy="20" r="3" fill="#2a2a2a"/>'); }
  function radioWaves(x, y, t, n, col, op) { var s = ""; for (var k = 0; k < (n || 4); k++) { var ph = ((t * .8 + k / (n || 4)) % 1); s += '<path d="M' + f(x - 10 - ph * 40) + ' ' + f(y - 12 - ph * 30) + ' Q' + f(x) + ' ' + f(y - 24 - ph * 46) + ' ' + f(x + 10 + ph * 40) + ' ' + f(y - 12 - ph * 30) + '" stroke="' + (col || "#9fd0ff") + '" stroke-width="2" fill="none" opacity="' + f2((op || .8) * (1 - ph)) + '"/>'; } return s; }

  // ── people ───────────────────────────────────────────
  function pilot(x, y, s, t, k, o) { return person(x, y, s, t, Object.assign({ top: "#6a5a3e", pants: "#5a4c34", coat: "#6a5a3e", helmet: "#5a3a22", skin: SK[k % 4], ph: k }, o || {})); }
  function navyMan(x, y, s, t, k, o) { return person(x, y, s, t, Object.assign({ top: "#e8e4d8", pants: "#e8e4d8", hat: "officer", hatCol: "#f2f0ea", skin: SK[k % 4], ph: k }, o || {})); }
  function officer(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: NAVY, pants: NAVY, coat: NAVY, hat: "officer", hatCol: NAVY, skin: SK[0] }, o || {})); }

  // ── the real map (Natural Earth 1:10m, Mercator) ─────────
  var M = window.MAP;
  function mp(lon, lat) { var r = Math.PI / 180; return [M.tx + M.k * lon * r, M.ty - M.k * Math.log(Math.tan(Math.PI / 4 + lat * r / 2))]; }
  // draw the map so (lon, lat) sits at the frame centre (180, 300), z screen px per map unit
  function mapView(t, lon, lat, z, o) {
    o = o || {}; var c = mp(lon, lat), tr = 'translate(180 300) scale(' + f2(z) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')', sw = 1 / z, g = "";
    g += R(-300, -300, 1600, 1600, o.night ? "#16304e" : "#7fb6d6", { s: 0 });
    for (var i = 0; i < 40; i++) { var yy = hash(i) * 1000, xx = ((hash(i + 3) * 1200 + t * 6) % 1200) - 100; g += '<path d="M' + f(xx) + ' ' + f(yy) + ' h' + f(14 + hash(i) * 20) + '" stroke="#e8f4fa" stroke-width="' + f2(1.2 * sw) + '" opacity="' + f2(.25 + .2 * Math.sin(t * 1.5 + i)) + '"/>'; }
    M.countries.forEach(function (cn) { if (cn.n === "Bahamas" || cn.n === "Turks and Caicos Is.") g += '<path d="' + cn.d + '" fill="#8fe0d6" stroke="#8fe0d6" stroke-width="' + f2(9 * sw) + '" stroke-linejoin="round" opacity=".75"/>'; });
    M.countries.forEach(function (cn, i) { var col = o.night ? "#3a5a3a" : ["#7aa860", "#6f9e58", "#84b06a", "#73a35c"][i % 4]; if (cn.n === "United States of America") col = o.night ? "#3a5a3a" : "#76a65c"; g += '<path d="' + cn.d + '" fill="' + col + '" stroke="#2f4a2a" stroke-width="' + f2(1.1 * sw) + '" stroke-linejoin="round"/>'; });
    g += '<path d="' + M.borders + '" fill="none" stroke="#f4f0e2" stroke-width="' + f2(1.3 * sw) + '" stroke-dasharray="' + f2(4 * sw) + ' ' + f2(2 * sw) + '" opacity=".9"/>';
    if (o.egypt) g += '<path d="' + M.egypt + '" fill="#d9b46a" stroke="' + INK + '" stroke-width="' + f2(1.6 * sw) + '" opacity="' + f2(.85 * o.egypt) + '"/>';
    var inner = o.draw ? o.draw(mp, sw) : "";
    return G(tr, g + inner);
  }
  function pin(p, sw, col, lab, dx, dy, size, op) { size = size || 12; var s = '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f2(4 * sw) + '" fill="' + (col || "#fff") + '" stroke="' + INK + '" stroke-width="' + f2(1.4 * sw) + '"/>'; if (lab) s += txt(lab, p[0] + (dx || 0) * sw, p[1] + (dy || -9) * sw, f2(size * sw), "#fff", { st: "rgba(0,0,0,.75)", sw: f2(3 * sw), wt: 900 }); return op == null ? s : '<g opacity="' + f2(op) + '">' + s + '</g>'; }
  function tri3(mp, sw, k, t) { var a = mp(-80.19, 25.76), b = mp(-64.78, 32.30), c = mp(-66.1, 18.47), per = [[a, b], [b, c], [c, a]], s = '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(c[0]) + ' ' + f(c[1]) + ' Z" fill="#e8402a" opacity="' + f2(.18 * clamp(k * 3 - 2) * (0.8 + .2 * Math.sin(t * 2))) + '"/>';
    per.forEach(function (e, j) { var kk = clamp(k * 3 - j); if (kk <= 0) return; var x = lerp(e[0][0], e[1][0], kk), y = lerp(e[0][1], e[1][1], kk); s += '<path d="M' + f(e[0][0]) + ' ' + f(e[0][1]) + ' L' + f(x) + ' ' + f(y) + '" stroke="#ff5a2a" stroke-width="' + f2(3 * sw) + '" stroke-dasharray="' + f2(8 * sw) + ' ' + f2(4 * sw) + '" stroke-linecap="round"/>'; });
    return s; }
  function route(pts, sw, k, col, w) { var s = "", n = pts.length - 1, upto = k * n; for (var j = 0; j < n; j++) { var kk = clamp(upto - j); if (kk <= 0) break; var x = lerp(pts[j][0], pts[j + 1][0], kk), y = lerp(pts[j][1], pts[j + 1][1], kk); s += '<path d="M' + f(pts[j][0]) + ' ' + f(pts[j][1]) + ' L' + f(x) + ' ' + f(y) + '" stroke="' + (col || YEL) + '" stroke-width="' + f2((w || 3) * sw) + '" stroke-linecap="round"/>'; } return s; }
  function arrowHead(p, q, sw, col) { var a = Math.atan2(q[1] - p[1], q[0] - p[0]), L2 = 12 * sw; return '<path d="M' + f(q[0]) + ' ' + f(q[1]) + ' L' + f(q[0] - Math.cos(a - .5) * L2) + ' ' + f(q[1] - Math.sin(a - .5) * L2) + ' L' + f(q[0] - Math.cos(a + .5) * L2) + ' ' + f(q[1] - Math.sin(a + .5) * L2) + ' Z" fill="' + (col || YEL) + '"/>'; }
  function wreckFire(x, y, s, t) { var g = '<ellipse cx="0" cy="4" rx="130" ry="14" fill="#2a1a10" opacity=".7"/>'; g += flames(t, -40, 40, 0, 120, 14, .95) + smoke(t, -40, 40, -110, 8, "#3a2a26", .35) + '<ellipse cx="0" cy="-30" rx="120" ry="90" fill="url(#warm)" opacity="' + f2(.55 + .1 * Math.sin(t * 9)) + '"/>'; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', g); }
  function paper(x, y, w, h, rot, inner) { return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')', R(-w / 2 + 4, -h / 2 + 5, w, h, "rgba(0,0,0,.35)", { s: 0 }) + R(-w / 2, -h / 2, w, h, "#f2ead6", { w: 1.6 }) + (inner || "")); }
  function pill(t, u) { var k = clamp((u - .2) / .4); if (k <= 0) return ""; return G('translate(180 ' + f(112 - 8 * (1 - eout(k))) + ')', '<rect x="-74" y="-17" width="148" height="34" rx="17" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + txt("اللينك في البايو ↑", 0, 7, 15, "#1a1a1a", { wt: 900 }), k); }

  // ═════════ the shots ═════════
  var FT = mp(-80.14, 26.12), MIA = mp(-80.19, 25.76);
  // 0 — 5 December 1945, a naval air station in Florida: five Avengers over a bright sea
  shot(0, push([170, 330], [200, 320], 1.08, 1.18), function (u, d, t) { var s = sky("skyNoon") + sun(300, 110, 18, t) + cloudBank(t, 230, 5, 5, "#ffffff", .8) + cloudBank(t, 300, -8, 4, "#5a6474", .35, 1.4) + sea(t, 360, "day") + rays(t, 300, 110, 2.3, 6, 520, .35);
    for (var k = 0; k < 5; k++) s += avenger(lerp(60, 140, u / d) + [120, 50, 190, -20, 260][k] - 100, [300, 262, 262, 228, 228][k] + 40, [.62, .5, .5, .42, .42][k], t + k, { code: "FT-" + [28, 36, 3, 81, 117][k] });
    return s + dust(t, 20, "#fff6dc", .4) + label("5 ديسمبر 1945", 180, 170, u, .3, 30, "#fff") + label("فلوريدا", 180, 204, u, .8, 20, YEL); });
  // 1 — the sun out, the sky clear, the sea calm
  shot(1, push([180, 300], [180, 280], 1.0, 1.1), function (u, d, t) { return sky("skyNoon") + sun(180, 170, 26, t) + rays(t, 180, 170, 1.57, 9, 600, .4) + cloudBank(t, 260, 4, 5, "#ffffff", .7) + sea(t, 380, "day") + G('translate(0 0)', '<path d="M-60 380 Q60 372 140 380" stroke="#e6f6ff" stroke-width="2" opacity=".5"/>') + label("صافي", 180, 120, u, .8, 28, "#fff"); });
  // 2 — five Avengers on the field, fourteen men walking out
  shot(2, push([180, 330], [200, 340], 1.15, 1.05), function (u, d, t) { var s = sky("skyNoon") + cloudBank(t, 160, 4, 5, "#ffffff", .7) + R(-200, 250, 760, 60, "#9ab26a", { s: 0 }) + R(-200, 290, 760, 400, "#b8b0a0", { s: 0 });
    s += P('M-120 250 L-120 180 Q-40 140 40 180 L40 250 Z', "#8a8e84", { w: 2 }) + R(-90, 200, 100, 50, "#2a2c30", { w: 1.4 });
    for (var k = 0; k < 5; k++) s += avenger(60 + k * 66, 320 + k * 14, .34 + k * .02, 0, { code: "FT" }) + '<path d="M' + (90 + k * 66) + ' ' + (330 + k * 14) + ' v14 M' + (66 + k * 66) + ' ' + (328 + k * 14) + ' v16" stroke="' + INK + '" stroke-width="2"/>';
    for (var p = 0; p < 6; p++) s += pilot(lerp(-40, 120, clamp(u / d)) + p * 34, 450 + (p % 2) * 12, 1.0, t, p, { walk: true, helmet: null, hair: "short" });
    return s + bigNum("14", 180, 150, u, .8, 54, YEL) + label("راجل", 180, 186, u, 1.2, 20, "#fff"); });
  // 3 — an easy exercise… two hours and back
  shot(3, push([180, 320], [180, 320], 1.0, 1.12), function (u, d, t) { return sky("skyMorning") + rays(t, 300, 60, 2.2, 6, 600, .4) + watch(180, 320, 70, t, { h: 2 + u / 60, sec: t * 30 }) + label("ساعتين", 180, 150, u, .5, 32, "#fff"); });
  // 4 — so how do five planes vanish at once… without a single piece of wreckage?
  shot(4, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d), s = sky("skyNight") + stormClouds(t, 200, .9) + sea(t, 400, "storm") + bolt(t, 260, 120, 260, 4) + flash(t, 4);
    for (var j = 0; j < 5; j++) s += avenger(60 + j * 60, 300 - (j % 2) * 30, .32, t + j, { dark: true, op: clamp(1 - k * 1.6 + j * .08) });
    return s + rain(t, 60, .3) + label("ولا حتة حطام؟", 180, 170, u, .8, 30, "#fff"); });
  // 5 — and why did the plane that went to look for them… vanish too?
  shot(5, push([180, 320], [190, 310], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return sky("skyStar") + stars(t, 80, 300) + stormClouds(t, 260, .8) + sea(t, 430, "night") + mariner(lerp(80, 260, k), 300, .7, t, { dark: true, lit: true, op: clamp(1.5 - k * 1.5) }) + label("وهي كمان؟", 180, 170, u, .8, 30, "#fff"); });
  // 6 — this is the story of the Bermuda Triangle, hour by hour (the real map, the triangle drawn)
  shot(6, push([180, 320], [180, 320], 1.0, 1.14), function (u, d, t) { return mapView(t, -72, 26, .62, { draw: function (mp, sw) { return tri3(mp, sw, clamp(u / 1.8), t) + pin(mp(-80.19, 25.76), sw, "#fff", "ميامي", 0, -9, 12) + pin(mp(-64.78, 32.3), sw, "#fff", "برمودا", 0, -9, 12) + pin(mp(-66.1, 18.47), sw, "#fff", "بورتوريكو", 0, 18, 12); } }) + label("ساعة بساعة", 180, 120, u, 1.2, 28, "#fff"); });
  // 7 — 2:10 p.m., the five planes took off
  shot(7, push([170, 330], [210, 300], 1.1, 1.2), function (u, d, t) { var k = clamp(u / d), s = sky("skyNoon") + cloudBank(t, 180, 6, 5, "#ffffff", .7) + R(-200, 420, 760, 300, "#9ab26a", { s: 0 }) + P('M-200 470 L560 440 L560 480 L-200 520 Z', "#7a7870", { s: 0 }) + palmRow(t);
    s += avenger(lerp(40, 260, k), lerp(450, 330, ease(k)), .62, t, { rot: -lerp(0, 9, k), code: "FT-28" });
    return s + dust(t, 14, "#fff", .3) + bigNum("2:10", 180, 160, u, .4, 50, YEL) + label("الضهر", 180, 196, u, .8, 18, "#fff"); });
  function palmRow(t) { var s = ""; for (var k = 0; k < 6; k++) { var x = -40 + k * 80, sw = Math.sin(t * .9 + k) * 2; s += P('M' + x + ' 430 Q' + f(x + 2 + sw * .3) + ' 390 ' + f(x + sw) + ' 350 l4 0 Q' + f(x + 5 + sw * .3) + ' 390 ' + (x + 4) + ' 430Z', "#8a6a44", { w: 1 }); for (var j = 0; j < 6; j++) { var a = -2.6 + j * .62; s += P('M' + f(x + sw + 2) + ' 350 q' + f(Math.cos(a) * 14) + ' ' + f(Math.sin(a) * 10) + ' ' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 4 + 12) + ' q' + f(-Math.cos(a) * 10) + ' -6 ' + f(-Math.cos(a) * 26) + ' ' + f(-Math.sin(a) * 4 - 12) + 'Z', j % 2 ? "#4f7a34" : "#6a9a44", { w: .8 }); } } return s; }
  // 8 — their leader, Lieutenant Charles Taylor, an experienced pilot with more than 2,500 hours
  shot(8, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { return sky("skyMorning") + rays(t, 320, 40, 2.2, 6, 600, .45) + R(-200, 420, 760, 300, "#7a7870", { s: 0 }) + avenger(250, 380, .9, t, { code: "FT-28" }) + portrait(140, 400, 1.9, t, { top: "#f0eee6", skin: SK[0], hair: "short", hairCol: "#4a3424", hat: "officer", hatCol: "#f2f0ea", rim: true }) + label("تشارلز تايلور", 180, 130, u, .5, 26, "#fff") + bigNum("2,500+", 180, 180, u, 1.6, 34, YEL) + label("ساعة طيران", 180, 206, u, 2, 16, "#fff"); });
  // 9 — that morning he asked for someone else to take this flight… and was refused
  shot(9, push([180, 340], [170, 330], 1.0, 1.1), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#3a3a34", { s: 0 }) + R(-200, 380, 760, 400, "#5a4a3a", { s: 0 }) + R(40, 120, 120, 90, "#6a8aa0", { w: 2 }) + rays(t, 100, 160, .8, 5, 500, .4);
    s += R(60, 400, 240, 14, "#7a5a3a", { w: 2 }) + paper(180, 396, 60, 30, -4, '<path d="M-20 -6 h40 M-20 2 h30" stroke="#5a4a3a" stroke-width="1.5"/>');
    s += pilot(100, 560, 2.0, t, 0, { view: "side" }) + officer(270, 560, 2.0, t, { view: "front", sad: false });
    return s + label("اترفض", 180, 120, u, 1.6, 30, "#e8604a"); });
  // 10 — one student asked to be excused at the last minute
  shot(10, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#4a5048", { s: 0 }) + R(-200, 400, 760, 300, "#6a5a44", { s: 0 }) + R(200, 150, 90, 120, "#9ab8cc", { w: 2 }) + rays(t, 245, 210, 2.6, 4, 400, .35);
    for (var k = 0; k < 3; k++) s += R(-20 + k * 120, 420, 90, 30, "#e8e4d8", { w: 1.4 });
    return s + pilot(120, 560, 2.2, t, 2, { view: "side", flip: true }) + label("اعتذر", 180, 130, u, 1.4, 30, "#fff"); });
  // 11 — remember this student
  shot(11, push([180, 320], [180, 300], 1.0, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#2a2e30", { s: 0 }) + rays(t, 180, 0, 1.57, 5, 600, .5) + portrait(180, 400, 2.1, t, { top: "#6a5a3e", skin: SK[2], hair: "short", hairCol: "#2a1a10" }) + '<circle cx="180" cy="300" r="' + f(120 + 4 * Math.sin(t * 3)) + '" fill="none" stroke="' + YEL + '" stroke-width="3" opacity=".8"/>' + label("افتكروه", 180, 140, u, .3, 32, YEL); });
  // 12 — east over the sea; practice bombs; on they went (map: the route east)
  shot(12, push([180, 320], [200, 320], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return mapView(t, -78.6, 26.2, 3.2, { draw: function (mp, sw) { var a = mp(-80.14, 26.12), b = mp(-78.6, 25.9), c = mp(-77.4, 25.9); return route([a, b, c], sw, k) + arrowHead(a, lerp(0, 1, 1) ? (k > .5 ? b : a) : a, sw) + pin(a, sw, "#fff", "فورت لودرديل", 0, -9, 11) + pin(b, sw, "#e85a3a", "تمرين قنابل", 0, 18, 10, clamp(k * 3 - 1)); } }) + label("ناحية الشرق", 180, 120, u, .6, 26, "#fff"); });
  // 13 — 3:40, another pilot over Florida heard Taylor on the radio
  shot(13, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = cockpit(t, { view: sky("skyNoon") + cloudBank(t, 200, 20, 6, "#ffffff", .8) + R(-200, 280, 760, 80, "#7aa860", { s: 0 }) });
    return s + portrait(180, 410, 2.0, t, { top: "#6a5a3e", skin: SK[1], hair: "short", hairCol: "#5a3a22" }) + headset(180, HSY, 3.3) + radioWaves(300, 300, t, 4) + bigNum("3:40", 180, 150, u, .4, 46, YEL); });
  // 14 — "both my compasses are out… I'm sure I'm over the Keys, but I don't know where I am"
  shot(14, push([180, 300], [180, 300], 1.05, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#16181c", { s: 0 }) + compass(110, 270, 66, t, { spin: 140 }) + compass(270, 270, 52, t + 3, { spin: -110 }) + radioWaves(180, 190, t, 4, "#9fd0ff", .6) + label("البوصلتين عطلانين", 180, 140, u, .4, 26, "#fff") + label("مش عارف أنا فين", 180, 380, u, 2.2, 22, YEL); });
  // 15 — he wasn't over Florida… he was over the Bahamas (map: where he thought vs where he was)
  shot(15, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { return mapView(t, -79.2, 25.6, 2.2, { draw: function (mp, sw) { var keys = mp(-81.2, 24.7), ba = mp(-77.6, 26.6), k1 = clamp(u / .6), k2 = clamp((u - 1.4) / .6), s = "";
      s += '<circle cx="' + f(keys[0]) + '" cy="' + f(keys[1]) + '" r="' + f2(22 * sw) + '" fill="none" stroke="#fff" stroke-width="' + f2(2 * sw) + '" stroke-dasharray="' + f2(4 * sw) + '" opacity="' + f2(k1) + '"/>' + txt("كان فاكر", keys[0], keys[1] + 36 * sw, f2(12 * sw), "#fff", { st: "rgba(0,0,0,.7)", sw: f2(3 * sw), op: k1 });
      if (k1 >= 1 && k2 > 0) s += '<path d="M' + f(keys[0] - 14 * sw) + ' ' + f(keys[1] - 14 * sw) + ' l' + f2(28 * sw) + ' ' + f2(28 * sw) + ' M' + f(keys[0] + 14 * sw) + ' ' + f(keys[1] - 14 * sw) + ' l' + f2(-28 * sw) + ' ' + f2(28 * sw) + '" stroke="#e8402a" stroke-width="' + f2(4 * sw) + '" opacity="' + f2(k2) + '"/>';
      s += '<circle cx="' + f(ba[0]) + '" cy="' + f(ba[1]) + '" r="' + f2((18 + 3 * Math.sin(t * 4)) * sw) + '" fill="#e8402a" opacity="' + f2(.35 * k2) + '"/>' + pin(ba, sw, YEL, "هنا", 0, -12, 13, k2);
      return s + txt("فلوريدا", mp(-81.6, 27.6)[0], mp(-81.6, 27.6)[1], f2(13 * sw), "#fff", { st: "rgba(0,0,0,.6)", sw: f2(3 * sw) }) + txt("الباهاما", mp(-77.2, 25.2)[0], mp(-77.2, 25.2)[1], f2(13 * sw), "#fff", { st: "rgba(0,0,0,.6)", sw: f2(3 * sw) }); } }); });
  // 16 — he turned to get back to land… and flew deeper into the ocean (map: heading north-east)
  shot(16, push([180, 320], [190, 300], 1.0, 1.08), function (u, d, t) { var k = clamp(u / d); return mapView(t, -78.6, 27.8, 1.7, { draw: function (mp, sw) { var a = mp(-77.6, 26.6), b = mp(-78.2, 28.0), c = mp(-79.0, 29.2), e = mp(-77.0, 29.6); var s = route([a, b, c], sw, k, YEL, 3); if (k > .95) s += arrowHead(b, c, sw); s += pin(mp(-80.14, 26.12), sw, "#fff", "البر", 0, -9, 12); return s + txt("المحيط", e[0], e[1], f2(14 * sw), "#e8f4fa", { st: "rgba(0,0,0,.5)", sw: f2(3 * sw) }); } }) + label("بيبعد عن البر", 180, 120, u, 1.2, 24, "#fff"); });
  // 17 — on the radio a student shouted: "if we just fly west… we'll get home!"
  shot(17, push([180, 320], [180, 310], 1.05, 1.15), function (u, d, t) { var s = cockpit(t, { view: sky("skyDusk") + cloudBank(t, 220, 14, 6, "#3a4a6a", .7) + sea(t, 300, "dusk") });
    s += portrait(180, 410, 2.0, t, { top: "#6a5a3e", skin: SK[3], hair: "short", hairCol: "#1a1410" }) + headset(180, HSY, 3.3) + radioWaves(180, 200, t, 5, YEL, .8);
    var k = clamp((u - 1) / .8); s += G('translate(' + f(180 - 60 * k) + ' 150)', '<path d="M40 0 H-40 M-40 0 l14 -10 M-40 0 l14 10" stroke="' + YEL + '" stroke-width="5" stroke-linecap="round"/>', k);
    return s + label("ناحية الغرب!", 180, 120, u, .6, 30, "#fff"); });
  // 18 — the planes kept circling back and forth over the water (from above)
  shot(18, push([180, 320], [180, 320], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#2a4466", { s: 0 }); for (var i = 0; i < 60; i++) { var x = ((hash(i) * 760 + t * 8) % 760) - 200; s += '<path d="M' + f(x) + ' ' + f(hash(i + 4) * 1000 - 200) + ' h' + f(12 + hash(i) * 20) + '" stroke="#8aa6cc" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; }
    s += '<ellipse cx="180" cy="320" rx="110" ry="150" fill="none" stroke="#e8e4d8" stroke-width="1.6" stroke-dasharray="6 6" opacity=".5"/>';
    for (var j = 0; j < 5; j++) { var a = t * .5 + j * .3; s += G('translate(' + f(180 + Math.cos(a) * 110) + ' ' + f(320 + Math.sin(a) * 150) + ') rotate(' + f(a * 57.3 + 90) + ')', topPlane()); }
    return s + cloudBank(t, 120, 10, 4, "#c8ccd4", .4) + label("رايحة جاية", 180, 120, u, .8, 26, "#fff"); });
  function topPlane() { return '<path d="M0 -20 L3 -8 L22 -4 L22 2 L3 2 L2 14 L8 17 L8 20 L-8 20 L-8 17 L-2 14 L-3 2 L-22 2 L-22 -4 L-3 -8 Z" fill="#2a3e5e" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="0" cy="-21" rx="6" ry="1.4" fill="#d8dde2" opacity=".5"/>'; }
  // 19 — the sun set, cloud covered the sky, lightning began, the waves rose
  shot(19, push([180, 320], [180, 300], 1.0, 1.12), function (u, d, t) { var k = clamp(u / d), s = sky("skySunset") + '<g opacity="' + f2(k) + '">' + sky("skyNight") + '</g>' + stormClouds(t, 220, .4 + .6 * k) + sea(t, 400, "storm") + bolt(t, 120, 100, 300, 7, 2.2) + bolt(t + 1.1, 280, 120, 260, 9, 2.2) + flash(t, 7, 2.2);
    for (var j = 0; j < 5; j++) s += avenger(80 + j * 56, 330 - (j % 2) * 20, .26, t + j, { dark: true });
    return s + rain(t, 80, .35) + label("البرق", 180, 120, u, 1.6, 28, "#fff"); });
  // 20 — 6:20, Taylor said a sentence that was recorded
  shot(20, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = cockpit(t, { view: sky("skyNight") + stormClouds(t, 200, .9) + bolt(t, 260, 40, 200, 11, 3) + flash(t, 11, 3) + rain(t, 50, .4) });
    s += portrait(180, 410, 2.0, t, { top: "#6a5a3e", skin: SK[0], hair: "short", hairCol: "#4a3424", rim: true }) + headset(180, HSY, 3.3) + '<circle cx="180" cy="380" r="120" fill="#ffb060" opacity=".08"/>';
    return s + bigNum("6:20", 180, 150, u, .4, 46, YEL) + label("تايلور", 180, 186, u, .9, 20, "#fff"); });
  // 21 — "close up… when the first plane drops to ten gallons, we all go down together"
  shot(21, push([180, 320], [180, 310], 1.0, 1.15), function (u, d, t) { var k = clamp(u / d), s = sky("skyNight") + stormClouds(t, 160, .9) + bolt(t, 90, 30, 200, 13, 2.8) + flash(t, 13, 2.8) + sea(t, 470, "storm") + rain(t, 70, .35);
    for (var j = 0; j < 5; j++) s += avenger(180 + [-70, 0, 70, -35, 35][j] * (1.6 - k * .6), [330, 300, 330, 360, 360][j], .3, t + j, { dark: true, lit: true });
    return s + gauge(180, 160, 46, lerp(.35, .06, k), "FUEL", t) + bigNum("10", 180, 250, u, 1.2, 34, YEL) + label("جالون", 180, 274, u, 1.4, 16, "#fff"); });
  // 22 — the last thing heard from him was at 7:04… then silence
  shot(22, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 1.5) / 1), s = R(-200, -200, 760, 1040, "#101216", { s: 0 }) + R(60, 260, 240, 130, "#3a3a34", { w: 2 }) + '<circle cx="130" cy="325" r="40" fill="#1a1a1a" stroke="#6a6a5a" stroke-width="2"/>';
    for (var r = 0; r < 4; r++) s += '<circle cx="130" cy="325" r="' + (10 + r * 9) + '" fill="none" stroke="#4a4a40" stroke-width="1"/>';
    s += R(200, 290, 80, 20, "#1a1a1a", { w: 1 }) + R(lerp(210, 260, (t * .2) % 1), 288, 3, 24, "#e85a3a", { s: 0 }) + '<circle cx="270" cy="350" r="5" fill="' + (k < 1 ? "#5ae85a" : "#2a3a2a") + '"/>';
    var sw = ""; for (var x = -40; x <= 400; x += 4) sw += (x === -40 ? "M" : "L") + x + " " + f(470 + (1 - k) * Math.sin(x * .2 + t * 20) * 14 * hash(Math.floor(x / 4) + Math.floor(t * 12)));
    s += '<path d="' + sw + '" stroke="#5ae85a" stroke-width="2" fill="none" opacity=".85"/>';
    return s + bigNum("7:04", 180, 160, u, .3, 46, YEL) + label("سكوت", 180, 210, u, 2.2, 26, "#fff"); });
  // 23 — 7:27, a big rescue flying boat took off to look for them, thirteen men aboard
  shot(23, push([170, 330], [200, 310], 1.05, 1.15), function (u, d, t) { var k = clamp(u / d); return sky("skyStar") + stars(t, 70, 300) + cloudBank(t, 230, 8, 5, "#2a3044", .7) + sea(t, 420, "night") + mariner(lerp(60, 250, k), lerp(410, 320, ease(k)), .8, t, { dark: true, lit: true, rot: -lerp(2, 8, k) }) + (k < .4 ? '<ellipse cx="' + f(lerp(60, 250, k) - 40) + '" cy="425" rx="70" ry="6" fill="#e8f0ff" opacity=".4"/>' : "") + bigNum("7:27", 180, 150, u, .3, 46, YEL) + bigNum("13", 180, 210, u, 1.6, 34, "#fff") + label("راجل", 180, 236, u, 1.9, 16, "#fff"); });
  // 24 — it sent one message after take-off… then not a word
  shot(24, push([180, 320], [190, 320], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 1) / 1.2); return sky("skyNight") + stormClouds(t, 200, .9) + sea(t, 440, "storm") + mariner(lerp(140, 260, clamp(u / d)), 300, .5, t, { dark: true, lit: k < 1, op: 1 - k * .7 }) + radioWaves(220, 250, t, 4, "#9fd0ff", 1 - k) + rain(t, 60, .35) + label("ولا كلمة", 180, 140, u, 1.8, 28, "#fff"); });
  // 25 — in the dark, a ship passing through saw something in the sky… (the cliffhanger)
  function scene25(u, d, t) { return sky("skyStar") + stars(t, 70, 320) + cloudBank(t, 200, 6, 5, "#20263a", .8) + sea(t, 370, "night") + '<circle cx="250" cy="180" r="' + f(30 + 6 * Math.sin(t * 5)) + '" fill="#ffb060" opacity="' + f2(.35 + .2 * Math.sin(t * 7)) + '" filter="url(#glow)"/><circle cx="250" cy="180" r="4" fill="#fff2c0"/>' + tanker(150, 400, .95, t, { people: true }); }
  shot(25, push([180, 340], [200, 320], 1.0, 1.12), function (u, d, t) { return scene25(u, d, t) + label("شافت حاجة…", 180, 120, u, 1.2, 26, "#fff"); });
  // 26 — the bio line: the cliffhanger frame keeps creeping, a yellow pill near the top
  shot(26, push([200, 320], [210, 310], 1.12, 1.2), function (u, d, t) { return scene25(u + 4, d, t) + pill(t, u); });
  // 27 — back to the ship… 7:50, it saw a tall fire rise out of the sea
  shot(27, push([180, 340], [180, 320], 1.0, 1.12), function (u, d, t) { return sky("skyFire") + stars(t, 30, 200) + sea(t, 380, "night") + '<ellipse cx="240" cy="380" rx="160" ry="20" fill="#ff8a3a" opacity=".3"/>' + wreckFire(240, 382, .9, t) + tanker(90, 430, .8, t, { people: true }) + bigNum("7:50", 180, 140, u, .3, 46, YEL); });
  // 28 — when it came close, it found a big oil slick… and no one
  shot(28, push([180, 330], [180, 310], 1.0, 1.12), function (u, d, t) { var s = sky("skyStar") + stars(t, 60, 300) + sea(t, 360, "night"); s += '<ellipse cx="200" cy="470" rx="170" ry="40" fill="#1a1a22" opacity=".85"/>'; for (var k = 0; k < 6; k++) s += '<ellipse cx="200" cy="470" rx="' + f(60 + k * 22) + '" ry="' + f(12 + k * 5) + '" fill="none" stroke="' + ["#6a3a8a", "#3a6a8a", "#8a7a3a", "#3a8a5a"][k % 4] + '" stroke-width="1.4" opacity=".5"/>';
    var a = -.5 + Math.sin(t * .6) * .25; s += G('translate(40 380) rotate(' + f(a * 57.3) + ')', '<path d="M0 0 L420 -50 L420 50 Z" fill="#fff8d0" opacity=".14"/>');
    return s + tanker(10, 380, .6, t) + label("ومفيش حد", 180, 150, u, 1.4, 30, "#fff"); });
  // 29 — in the morning, hundreds of planes and ships searched for five days
  shot(29, push([180, 320], [180, 330], 1.0, 1.08), function (u, d, t) { var s = sky("skyDawnT") + sea(t, 360, "dusk"); for (var k = 0; k < 7; k++) s += avenger(((hash(k) * 600 + t * 30) % 600) - 120, 120 + k * 30, .18 + hash(k) * .1, t + k, { op: .9 }); for (var j = 0; j < 4; j++) s += tanker(((hash(j + 9) * 500 + t * 8) % 520) - 80, 400 + j * 50, .35 + j * .1, t + j);
    return s + bigNum("5", 180, 150, u, .6, 52, YEL) + label("أيام", 180, 182, u, 1, 20, "#fff"); });
  // 30 — and they didn't find so much as a nail
  shot(30, push([180, 320], [180, 320], 1.0, 1.15), function (u, d, t) { return sky("skyToday") + sea(t, 200, "day") + cloudBank(t, 120, 6, 4, "#ffffff", .6) + label("ولا مسمار", 180, 330, u, .4, 34, "#fff"); });
  // 31 — twenty-seven men… gone in one night
  shot(31, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#0e1016", { s: 0 }) + rays(t, 180, -20, 1.57, 5, 700, .25); for (var k = 0; k < 27; k++) { var x = 60 + (k % 9) * 30, y = 360 + Math.floor(k / 9) * 70; s += silhouette(x, y, .9, "#3a4458", { op: clamp((u - k * .04) / .4) * (.6 + .3 * Math.sin(t + k)) }); }
    return s + bigNum("27", 180, 200, u, .5, 70, YEL) + label("في ليلة واحدة", 180, 240, u, 1.2, 20, "#fff"); });
  // 32 — and that is where the stories began
  shot(32, push([180, 320], [180, 300], 1.0, 1.15), function (u, d, t) { var s = sky("skyStar") + stars(t, 120, 400) + sea(t, 430, "night"); s += '<ellipse cx="180" cy="430" rx="' + f(80 + 10 * Math.sin(t * 2)) + '" ry="10" fill="#7ad0f0" opacity=".25" filter="url(#glow)"/>' + dust(t, 30, "#9fd0ff", .5);
    for (var k = 0; k < 3; k++) s += paper(90 + k * 90, 260 + (k % 2) * 30, 80, 100, -8 + k * 8, txt("?", 0, 14, 40, "#3a2a1a", { font: "Noto Serif", wt: 700 }));
    return s + label("الحكايات", 180, 140, u, .4, 30, "#fff"); });
  // 33 — people remembered the Cyclops, gone there in 1918 with 306 aboard
  shot(33, push([170, 330], [200, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyAsh") + cloudBank(t, 240, 5, 6, "#8a8a8a", .5) + sea(t, 370, "storm") + cyclops(lerp(150, 210, u / d), 370, .8, t) + '<rect x="-200" y="-200" width="760" height="1040" fill="#c8ccd4" opacity="' + f2(.15 + .1 * Math.sin(t * .6)) + '"/>';
    return s + label("سايكلوبس", 180, 140, u, .4, 28, "#fff") + bigNum("1918", 180, 190, u, .9, 34, YEL) + bigNum("306", 180, 250, u, 1.8, 40, "#fff"); });
  // 34 — in 1964 a journalist named the area: the Bermuda Triangle… the deadly triangle
  shot(34, push([180, 330], [180, 320], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#3a2e22", { s: 0 }) + rays(t, 300, 40, 2.3, 6, 600, .4);
    s += paper(180, 330, 220, 290, -3, R(-100, -135, 200, 50, "#b8322a", { s: 0 }) + txt("ARGOSY", 0, -100, 30, "#fff", { font: "Noto Serif", wt: 700 }) + txt("1964", 70, -75, 12, "#3a2a1a", { font: "Noto Serif", wt: 700 }) + txt("THE DEADLY", 0, -40, 22, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + txt("BERMUDA", 0, -12, 26, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + txt("TRIANGLE", 0, 16, 26, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + '<path d="M-40 110 L0 40 L40 110 Z" fill="none" stroke="#b8322a" stroke-width="4"/>');
    return s + label("المثلث المميت", 180, 120, u, 1.4, 28, YEL); });
  // 35 — a triangle between Miami, Bermuda and Puerto Rico, bigger than all of Egypt (the real map, Egypt laid over it)
  shot(35, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var ke = clamp((u - 1.8) / .8); return mapView(t, -73, 25.6, .66, { egypt: ke, draw: function (mp, sw) { var s = tri3(mp, sw, 1, t) + pin(mp(-80.19, 25.76), sw, "#fff", "ميامي", -4, -9, 12) + pin(mp(-64.78, 32.3), sw, "#fff", "برمودا", 0, -9, 12) + pin(mp(-66.1, 18.47), sw, "#fff", "بورتوريكو", 0, 18, 12);
      s += txt("أمريكا", mp(-84, 33)[0], mp(-84, 33)[1], f2(14 * sw), "#fff", { st: "rgba(0,0,0,.6)", sw: f2(3 * sw) }) + txt("كوبا", mp(-79, 21.9)[0], mp(-79, 21.9)[1], f2(12 * sw), "#fff", { st: "rgba(0,0,0,.6)", sw: f2(3 * sw) }) + txt("المكسيك", mp(-99, 20)[0], mp(-99, 20)[1], f2(12 * sw), "#fff", { st: "rgba(0,0,0,.6)", sw: f2(3 * sw) });
      if (ke > 0) { var ec = mp(-70, 26.8); s += txt("مصر", ec[0], ec[1], f2(16 * sw), "#3a2a1a", { op: ke, wt: 900 }); } return s; } }) + label("أكبر من مصر", 180, 120, u, 2.2, 28, YEL); });
  // 36 — books that sold millions: magnets, a sunken city, aliens
  shot(36, push([180, 340], [180, 320], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#2a2024", { s: 0 }) + R(-200, 420, 760, 300, "#5a3a24", { s: 0 }) + rays(t, 180, 0, 1.57, 5, 600, .35);
    var B = [["#3a4a7a", "magnet"], ["#2a6a5a", "city"], ["#6a2a4a", "ufo"]]; B.forEach(function (b, k) { var x = 70 + k * 110, y = 360 + (k % 2) * 16, ic = b[1] === "magnet" ? '<path d="M-16 -10 V8 Q-16 22 0 22 Q16 22 16 8 V-10" stroke="#e85a3a" stroke-width="8" fill="none"/><path d="M-16 -10 h8 M8 -10 h8" stroke="#e8e4d8" stroke-width="8"/>' : b[1] === "city" ? '<path d="M-20 20 V0 L-12 -10 L-4 0 V-16 L4 -24 L12 -16 V20 Z" fill="#d9c890" stroke="' + INK + '"/><path d="M-26 6 q8 -4 16 0 t16 0 t16 0" stroke="#9fd0ff" stroke-width="2" fill="none"/>' : '<ellipse cx="0" cy="0" rx="24" ry="8" fill="#c8ccd4" stroke="' + INK + '"/><path d="M-10 -4 Q0 -18 10 -4" fill="#9fd0ff" stroke="' + INK + '"/><path d="M-8 8 L-18 30 M8 8 L18 30" stroke="#f2f0a0" stroke-width="2" opacity=".7"/>';
      s += G('translate(' + x + ' ' + f(y + Math.sin(t + k) * 2) + ') rotate(' + (k - 1) * 6 + ')', R(-44, -64, 88, 128, b[0], { w: 2 }) + R(-44, -64, 10, 128, darker(b[0], .7), { s: 0 }) + G('translate(4 -10)', ic), clamp((u - k * .5) / .4)); });
    return s + label("ملايين", 180, 150, u, .4, 30, YEL); });
  // 37 — some people went into the triangle… and came back to tell it
  shot(37, push([180, 320], [180, 310], 1.0, 1.15), function (u, d, t) { var k = clamp(u / d); return sky("skyDusk") + cloudBank(t, 260, 4, 6, "#c8b0b0", .7) + '<ellipse cx="200" cy="270" rx="120" ry="90" fill="#e8e0f0" opacity=".5" filter="url(#soft)"/>' + sea(t, 430, "dusk") + bonanza(lerp(180, 120, k), 280, lerp(.3, .9, k), t, { op: clamp(k * 3) }) + label("ورجعت تحكي", 180, 130, u, .8, 28, "#fff"); });
  // 38 — 1970, a young pilot, Bruce Gernon, flying a small plane with his father from the Bahamas to Florida
  shot(38, push([180, 320], [200, 320], 1.0, 1.1), function (u, d, t) { return sky("skyNoon") + cloudBank(t, 200, 10, 5, "#ffffff", .8) + sea(t, 460, "day") + bonanza(170, 320, 1.7, t, { faces: true }) + label("بروس جيرنون", 180, 130, u, .6, 26, "#fff") + bigNum("1970", 180, 176, u, 1.2, 32, YEL); });
  // 39 — a strange cloud ahead; he went in, and found himself in a tunnel, the cloud turning around him
  shot(39, push([180, 320], [180, 320], 1.0, 1.25), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#3a3e4a", { s: 0 }); for (var r = 9; r >= 0; r--) { var rr = 30 + r * 34 + ((t * 20) % 34), a = t * 30 * (r % 2 ? 1 : -1); s += G('translate(180 300) rotate(' + f(a) + ')', '<ellipse cx="0" cy="0" rx="' + f(rr * 1.1) + '" ry="' + f(rr) + '" fill="' + ["#d8dce8", "#b8bcc8", "#9a9eaa", "#c8ccd8"][r % 4] + '" opacity=".9" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="' + f(rr * .6) + ' ' + f(rr * .3) + '"/>'); }
    s += '<circle cx="180" cy="300" r="34" fill="#f6f2e0"/>' + bonanza(180, 330, .7, t, {});
    return s + label("نفق", 180, 130, u, 1.6, 32, "#fff"); });
  // 40 — the compass spinning, the instruments dead, Miami radar couldn't see him
  shot(40, push([180, 320], [180, 320], 1.08, 1.2), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#16181c", { s: 0 }) + compass(110, 250, 58, t, { spin: 200 }) + gauge(270, 250, 44, .02, "ALT", t * 0);
    s += '<circle cx="180" cy="440" r="80" fill="#0a2a14" stroke="#3a6a4a" stroke-width="3"/>'; for (var r = 1; r < 4; r++) s += '<circle cx="180" cy="440" r="' + (r * 20) + '" fill="none" stroke="#3a6a4a" stroke-width="1"/>'; var a = t * 2.2; s += '<path d="M180 440 L' + f(180 + Math.cos(a) * 80) + ' ' + f(440 + Math.sin(a) * 80) + '" stroke="#7af0a0" stroke-width="2"/>';
    return s + label("الرادار مش شايفه", 180, 140, u, 1.6, 24, "#fff"); });
  // 41 — when he came out… he'd arrived in 47 minutes, on a trip that takes an hour and a quarter
  shot(41, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyMorning") + rays(t, 300, 40, 2.2, 6, 600, .4) + watch(110, 340, 52, t, { h: 12 + 47 / 60, sec: t * 60 }) + watch(270, 340, 52, t, { h: 1.25 + 12, sec: t * 6 }) + bigNum("47", 110, 220, u, .8, 40, YEL) + label("دقيقة", 110, 246, u, 1, 16, "#fff") + bigNum("75", 270, 220, u, 1.8, 40, "#fff") + label("دقيقة", 270, 246, u, 2, 16, "#fff"); });
  // 42 — he told it everywhere for years; no one could prove it… or disprove it
  shot(42, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return R(-200, -200, 760, 1040, "#2a2a30", { s: 0 }) + rays(t, 320, 60, 2.3, 5, 500, .4) + '<circle cx="260" cy="200" r="30" fill="#e8e4d8" opacity=".85"/><path d="M250 228 L240 250 L262 230 Z" fill="#e8e4d8" opacity=".85"/>' + txt("?", 260, 214, 36, "#3a2a1a", { font: "Noto Serif", wt: 700 }) + portrait(160, 400, 2.0, t, { top: "#3a4a5a", skin: SK[2], hair: "short", hairCol: "#7a7470", mustache: true, rim: true }) + label("ولا ينفيها", 180, 130, u, 2.4, 26, YEL); });
  // 43 — so what is the truth?
  shot(43, push([180, 320], [180, 300], 1.0, 1.2), function (u, d, t) { return sky("skyToday") + rays(t, 180, 0, 1.57, 9, 700, .5) + sea(t, 420, "day") + label("الحقيقة؟", 180, 260, u, .2, 40, "#fff"); });
  // 44 — one of the busiest sea and air routes in the world; more traffic, more accidents (map)
  shot(44, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { return mapView(t, -74, 26.5, .8, { draw: function (mp, sw) { var s = "", R2 = [[[-80.1, 26.1], [-64.8, 32.3]], [[-80.1, 25.8], [-66.1, 18.5]], [[-82, 23.2], [-60, 34]], [[-75, 38], [-66, 18.5]], [[-80, 25], [-61, 15]], [[-90, 29], [-64.8, 32.3]], [[-80.1, 26.1], [-70, 40]], [[-76.8, 18], [-60, 30]]];
      R2.forEach(function (r, j) { var a = mp(r[0][0], r[0][1]), b = mp(r[1][0], r[1][1]); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#fff" stroke-width="' + f2(1.2 * sw) + '" stroke-dasharray="' + f2(5 * sw) + ' ' + f2(4 * sw) + '" opacity=".5"/>'; for (var q = 0; q < 3; q++) { var k = ((t * .08 + q / 3 + hash(j)) % 1); s += '<circle cx="' + f(lerp(a[0], b[0], k)) + '" cy="' + f(lerp(a[1], b[1], k)) + '" r="' + f2(3.4 * sw) + '" fill="' + (j % 2 ? YEL : "#fff") + '" stroke="' + INK + '" stroke-width="' + f2(sw) + '"/>'; } });
      return s + tri3(mp, sw, 1, t); } }) + label("زحمة", 180, 120, u, .6, 30, "#fff"); });
  // 45 — the Gulf Stream runs like a river and carries any wreckage far away (map)
  shot(45, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return mapView(t, -78, 29, 1.25, { draw: function (mp, sw) { var path = [[-83, 23.4], [-80.6, 24.2], [-79.9, 25.6], [-79.8, 27.5], [-79.5, 30], [-77.5, 32.5], [-74.5, 34.5], [-70, 36.5]].map(function (p) { return mp(p[0], p[1]); }), d = "M" + path.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), s = '<path d="' + d + '" stroke="#2a6ad0" stroke-width="' + f2(20 * sw) + '" fill="none" stroke-linejoin="round" opacity=".45"/>';
      for (var q = 0; q < 14; q++) { var k = ((t * .12 + q / 14) % 1), seg = k * (path.length - 1), j = Math.floor(seg), r = seg - j, p = [lerp(path[j][0], path[j + 1][0], r), lerp(path[j][1], path[j + 1][1], r)], a = Math.atan2(path[j + 1][1] - path[j][1], path[j + 1][0] - path[j][0]); s += G('translate(' + f(p[0]) + ' ' + f(p[1]) + ') rotate(' + f(a * 57.3) + ') scale(' + f2(sw) + ')', '<path d="M-8 -5 L4 0 L-8 5" stroke="#e8f4ff" stroke-width="2.4" fill="none"/>'); }
      return s + txt("الجلف ستريم", mp(-75.4, 31.6)[0], mp(-75.4, 31.6)[1], f2(13 * sw), "#fff", { st: "rgba(0,0,0,.7)", sw: f2(3 * sw), wt: 900 }); } }) + label("زي نهر", 180, 120, u, .6, 28, "#fff"); });
  // 46 — storms there rise suddenly, from a clear sky to high waves (split: clear / storm)
  shot(46, still, function (u, d, t) { var k = clamp((u - .6) / 1.6), sp = lerp(360, 40, ease(k)); return '<svg x="0" y="0" width="360" height="640" overflow="hidden">' + sky("skyNoon") + sun(250, 160, 20, t) + sea(t, 380, "day") + '</svg>' + '<svg x="' + f(sp) + '" y="0" width="' + f(360 - sp + 200) + '" height="640" overflow="hidden"><g transform="translate(' + f(-sp) + ' 0)">' + sky("skyNight") + stormClouds(t, 220, 1) + sea(t, 380, "storm") + bolt(t, 220, 60, 300, 21, 1.8) + rain(t, 70, .4) + '</g></svg>' + '<path d="M' + f(sp) + ' -10 V650" stroke="#fff" stroke-width="2" opacity=".6"/>' + flash(t, 21, 1.8) + label("فجأة", 180, 130, u, .4, 32, "#fff"); });
  // 47 — beside it the Puerto Rico Trench, the deepest place in the Atlantic, more than 8 km down (cut-away)
  shot(47, push([180, 300], [180, 360], 1.0, 1.1), function (u, d, t) { var s = sky("skyToday") + R(-200, 140, 760, 900, "url(#seaDeep)", { s: 0 }) + '<linearGradient id="seaDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8ab8"/><stop offset=".4" stroke="" stop-color="#14365a"/><stop offset="1" stop-color="#02060e"/></linearGradient>';
    s += P('M-200 220 L40 230 L100 300 L150 560 L190 600 L230 540 L290 300 L360 250 L560 240 L560 900 L-200 900 Z', "#3a3026", { w: 2 }) + P('M100 300 L150 560 L190 600 L170 560 L130 320 Z', "#2a221a", { s: 0 });
    s += '<path d="M330 140 V600" stroke="#fff" stroke-width="1.6" opacity=".7"/><path d="M322 140 h16 M322 600 h16" stroke="#fff" stroke-width="1.6"/>' + tanker(120, 140, .35, t);
    var k = clamp((u - .6) / 2), dv = mariner(190, lerp(200, 560, k), .14, t, { op: 1 - k * .7, rot: 30 });
    return s + dv + bigNum("8 كم", 290, 400, u, 1.2, 30, YEL) + label("أعمق حتة في الأطلنطي", 180, 110, u, .5, 20, "#fff"); });
  // 48 — imagine you're a pilot: dark, sea and sky the same colour, and you don't trust the compass…
  shot(48, push([180, 320], [180, 320], 1.05, 1.15), function (u, d, t) { var tilt = Math.sin(t * .5) * 12; var s = G('rotate(' + f(tilt) + ' 180 260)', R(-300, -300, 960, 1200, "#141a26", { s: 0 }) + stars(t, 40, 500) + R(-300, 260, 960, 600, "#121824", { s: 0 }) + '<path d="M-300 260 H660" stroke="#1e2636" stroke-width="2" opacity=".5"/>');
    s += cockpit(t, {}) + compass(180, 400, 42, t, { spin: 60 }) + gauge(74, 405, 30, .5 + Math.sin(t) * .2, "ATT", t) + gauge(286, 405, 30, .12, "FUEL", t);
    return s + label("تخيّل", 180, 130, u, .3, 32, "#fff"); });
  // 49 — the rescue plane? they called it the flying gas tank… one spark is enough
  shot(49, push([180, 320], [200, 320], 1.1, 1.25), function (u, d, t) { var k = clamp((u - 2.2) / .5); return sky("skyNight") + stormClouds(t, 220, .7) + sea(t, 460, "night") + mariner(170, 320, 1.0, t, { dark: true, lit: true, fumes: true }) + (k > 0 ? '<circle cx="200" cy="280" r="' + f(6 + 30 * k) + '" fill="#fff2b0" opacity="' + f2((1 - k) * .9 + .1 * Math.sin(t * 30)) + '" filter="url(#glow)"/>' : "") + label("خزان البنزين الطاير", 180, 130, u, .5, 24, YEL); });
  // 50 — in 1991 divers found five planes of the same type on the seabed… and they weren't them
  shot(50, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = '<linearGradient id="deep2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a5a7a"/><stop offset="1" stop-color="#06141e"/></linearGradient>' + R(-200, -200, 760, 1040, "url(#deep2)", { s: 0 }) + rays(t, 200, -40, 1.7, 6, 700, .25) + R(-200, 410, 760, 300, "#4a4434", { s: 0 });
    for (var k = 0; k < 5; k++) s += avenger(40 + k * 72, 405 - (k % 2) * 10, .28, 0, { dark: true, rot: (hash(k) - .5) * 20, op: .85 });
    s += diver(240, 260, 1.1, t) + '<path d="M210 280 L150 400" stroke="#fff8d0" stroke-width="34" opacity=".12"/>' + dust(t, 30, "#d8f0ff", .5);
    return s + bigNum("1991", 180, 140, u, .4, 34, YEL) + label("مش هما", 180, 190, u, 2.6, 30, "#fff"); });
  function diver(x, y, s, t) { var k = Math.sin(t * 2.4) * 10, g = R(-40, -12, 50, 16, "#c8a030", { w: 1.4 }) + P('M-46 -6 Q-60 -14 -64 -4 Q-60 6 -46 6 Z', "#1a1a1a", { w: 1.2 }) + P('M-40 -6 L20 -10 L28 6 L-40 10 Z', "#1a1c22", { w: 1.4 });
    g += '<path d="M20 2 L52 ' + f(-6 + k) + ' M20 6 L52 ' + f(14 - k) + '" stroke="#1a1c22" stroke-width="8" stroke-linecap="round"/><path d="M50 ' + f(-6 + k) + ' l16 ' + f(-6 + k * .3) + ' M50 ' + f(14 - k) + ' l16 ' + f(6 - k * .3) + '" stroke="#2a6ad0" stroke-width="6"/>';
    g += '<circle cx="-50" cy="-2" r="10" fill="#1a1c22" stroke="' + INK + '"/><rect x="-60" y="-8" width="8" height="10" rx="2" fill="#9fd0ff" stroke="' + INK + '"/><path d="M-34 2 L-20 22 M-20 22 l-6 6" stroke="#1a1c22" stroke-width="6" stroke-linecap="round"/><circle cx="-26" cy="30" r="5" fill="#fff6c0" filter="url(#glow)"/>';
    for (var b = 0; b < 4; b++) { var ph = ((t * .5 + b / 4) % 1); g += '<circle cx="' + f(-58 - ph * 6) + '" cy="' + f(-14 - ph * 80) + '" r="' + f(2 + ph * 3) + '" fill="none" stroke="#d8f0ff" stroke-width="1" opacity="' + f2(1 - ph) + '"/>'; }
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t) * 3) + ') scale(' + f(-s) + ' ' + f(s) + ')', g); }
  // 51 — the US Coast Guard says: no more accidents there than any busy sea
  shot(51, push([180, 330], [200, 320], 1.0, 1.1), function (u, d, t) { return sky("skyToday") + cloudBank(t, 200, 6, 5, "#ffffff", .7) + sea(t, 420, "day") + coastGuard(180, 430, 1.4, t) + label("خفر السواحل", 180, 130, u, .5, 26, "#fff") + label("مش أكتر", 180, 170, u, 1.6, 24, YEL); });
  // 52 — remember the student who stayed behind? Allen Kosnar, the only one of that group who lived, told the story for years
  shot(52, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return R(-200, -200, 760, 1040, "#2e2a26", { s: 0 }) + rays(t, 320, 40, 2.2, 6, 600, .45) + paper(80, 200, 90, 70, -8, avenger(0, 4, .3, 0, { code: "FT" })) + portrait(190, 400, 2.0, t, { top: "#5a4a3a", skin: SK[0], hair: "short", hairCol: "#d8d4cc", rim: true }) + label("آلن كوسنار", 200, 130, u, 1.2, 26, YEL); });
  // 53 — the Navy blamed Taylor, but his mother fought until they changed the report: causes unknown
  shot(53, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 2.4) / .5); return R(-200, -200, 760, 1040, "#2a2a2e", { s: 0 }) + rays(t, 40, 40, .9, 5, 600, .4) + portrait(110, 400, 1.9, t, { top: "#3a2a3a", skin: SK[2], hair: "bun", hairCol: "#a8a4a0", rim: true }) + paper(260, 270, 150, 190, 4, txt("U.S. NAVY", 0, -66, 13, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + '<path d="M-56 -44 h112 M-56 -30 h112 M-56 -16 h80" stroke="#5a4a3a" stroke-width="1.6"/>' + G('rotate(-12)', R(-64, 6, 128, 40, "none", { w: 3, s: "#b8322a" }) + txt("CAUSES OR", 0, 22, 12, "#b8322a", { font: "Noto Serif", wt: 700 }) + txt("REASONS UNKNOWN", 0, 38, 11, "#b8322a", { font: "Noto Serif", wt: 700 }), k)) + label("أسباب غير معروفة", 180, 120, u, 2.6, 24, YEL); });
  // 54 — to this day the five planes are still somewhere under the water… no one knows where
  shot(54, push([180, 300], [180, 360], 1.0, 1.1), function (u, d, t) { var s = '<linearGradient id="deep3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14365a"/><stop offset="1" stop-color="#010308"/></linearGradient>' + R(-200, -200, 760, 1040, "url(#deep3)", { s: 0 }) + rays(t, 180, -60, 1.57, 5, 500, .2) + dust(t, 40, "#9fd0ff", .4);
    for (var k = 0; k < 5; k++) s += avenger(60 + k * 60, 390 + (k % 2) * 16, .24, 0, { rot: (hash(k + 3) - .5) * 30, op: .4 + .1 * Math.sin(t + k) });
    return s + label("محدش يعرف فين", 180, 200, u, 1, 28, "#fff"); });
  // 55 — tell us: which story next time?
  shot(55, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { return mapView(t, -73, 25.6, .66, { night: true, draw: function (mp, sw) { return tri3(mp, sw, 1, t); } }) + label("قولولنا!", 180, 150, u, .3, 34, "#fff"); });

  // ── real photographs (sent by the user): a framed print that slides into an empty corner when the narrator names the thing ──
  var PH = { taylor: [364, 529], cyclops: [610, 503], cyclops2: [723, 424], mariner: [562, 355], avengers: [559, 548], gernon: [450, 267] }, PHN = 0;
  function photoCard(u, d, t, name, tag, o) {
    o = o || {}; var dim = PH[name], at0 = o.at == null ? .5 : o.at, k = clamp((u - at0) / .45), out = o.until ? clamp((o.until - u) / .35) : 1; k = Math.min(k, out); if (k <= 0) return "";
    var maxW = o.w || 290, maxH = o.h || 300, sc = Math.min(maxW / dim[0], maxH / dim[1]), w = dim[0] * sc, h = dim[1] * sc, cx = o.x || 180, cy = o.y || 300, rot = (o.rot == null ? -2 : o.rot) * (1 - .3 * k), z = 1.06 + .08 * clamp((u - at0) / Math.max(1, (o.until || d) - at0)), id = "phc" + (++PHN);
    var g = '<rect x="' + f(-w / 2 - 8) + '" y="' + f(-h / 2 - 8) + '" width="' + f(w + 16) + '" height="' + f(h + 30) + '" fill="#000" opacity=".45" transform="translate(5 7)" filter="url(#soft2)"/>' + R(-w / 2 - 8, -h / 2 - 8, w + 16, h + 30, "#f4f0e4", { w: 1.2, s: "#8a8478" });
    g += '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath><g clip-path="url(#' + id + ')"><image href="../photos/' + name + '.jpg" x="' + f(-w / 2 * z) + '" y="' + f(-h / 2 * z) + '" width="' + f(w * z) + '" height="' + f(h * z) + '" preserveAspectRatio="xMidYMid slice"/></g>';
    g += txt(tag, 0, h / 2 + 15, 10, "#3a3428", { wt: 800 }) + txt("صورة حقيقية", 0, -h / 2 - 12, 10, YEL, { wt: 900, st: "rgba(0,0,0,.7)", sw: 3 });
    return G('translate(' + f(cx) + ' ' + f(cy + (1 - eout(k)) * 30) + ') rotate(' + f(rot) + ') scale(' + f2(.92 + .08 * eout(k)) + ')', g, k);
  }
  var CARDS = {
    2: [["avengers", "طيارات أفنجر", { x: 290, y: 236, w: 110, h: 110, rot: 4, at: 1.0 }]],
    8: [["taylor", "تشارلز تايلور", { x: 292, y: 262, w: 96, h: 130, rot: 4, at: .8 }]],
    23: [["mariner", "مارينر", { x: 290, y: 268, w: 116, h: 80, rot: 3, at: 2.2 }]],
    33: [["cyclops2", "سايكلوبس", { x: 78, y: 300, w: 120, h: 72, rot: -4, at: 1.0 }]],
    38: [["gernon", "جيرنون وطيارته", { x: 292, y: 218, w: 116, h: 70, rot: 3, at: 1.6 }]]
  };
  SH.forEach(function (sh) { var c = CARDS[sh.i]; if (c) sh.card = function (u, d, t) { var r = ""; c.forEach(function (cd) { r += photoCard(u, d, t, cd[0], cd[1], cd[2]); }); return r; }; });
  window.__parts = { avenger: avenger, mariner: mariner, bonanza: bonanza, tanker: tanker, cyclops: cyclops, mapView: mapView, compass: compass, gauge: gauge, sea: sea, bolt: bolt, portrait: portrait, person: person, tri3: tri3, mp: mp };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * .9), z = c[2] * (1 + .02 * Math.sin(t * .8)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>' + (sh.card ? sh.card(u, d, t) : ''); }
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
