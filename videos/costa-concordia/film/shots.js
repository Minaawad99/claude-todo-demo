  // ── «عبّارة السلام 98» in the «القصة 2D» look (the Titanic recipe). The ferry is drawn from the 2001 Genoa photograph
  //    (white hull, blue boot stripe, side sponsons, four passenger decks, a row of lifeboats, a white funnel with a dark
  //    blue cap). Two views carry the story: the stern / hull cut (the car deck, the water, the list) and the profile, bow
  //    to the left (she sails west, Duba to Safaga). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  // primitives for the ship drawings (stroke width as a number, rounded corners)
  var CLIPN = 0, ORANGE = "#e0662f", BLUE = "#5aa0d0", OLIVE = "#8a9a5a", STEEL = "#9aa2ac", SKIN = "#d9a186", HAIR = "#2a2018", PAPER = "#f4ecdb", GREY = "#8a8a90", WOOD = "#a9784d", WOOD_D = "#7c5434", YEL = "#f2c230";
  var HULL = "#f1ebdc", HULL_D = "#cfc6b0", BOOT = "#2f4a78", WATER = "#3f86b8", GLASS = "#ffd98a", FIRE1 = "#f08a2f", FIRE2 = "#ffd45a", NIGHT = "#141c2c", VEST = "#e8722a", WIN = "#ffd98a";
  function r_(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
  function c_(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function p_(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
  function t_(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
  function n_(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:700 ' + sz + 'px Noto Serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
  var LANES = [-152, -104, -52, 0, 50, 100, 150], CARCOL = ["#b9ab8a", "#8f9aa3", "#c9b28a", "#a36a4c", "#9aa58a", "#d8ccae", "#7f8a96"];
  function waterPoly(A, list, W) {
    W = W || 366; var H = W / 2, tn = Math.tan(Math.abs(list) * Math.PI / 180), sg = list >= 0 ? 1 : -1; if (A <= 0) return null;
    if (tn < 1e-4) { var h = A / W; return [[-H, 0], [H, 0], [H, -h], [-H, -h]]; }
    var b = Math.sqrt(2 * A / tn);
    if (b < W) return [[sg * H, 0], [sg * H, -b * tn], [sg * (H - b), 0]];
    var m = A / W, e = W * tn / 2; return [[-H, 0], [H, 0], [H, -(m + sg * e)], [-H, -(m - sg * e)]];
  }
  function polyD(p) { return "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + " Z"; }
  function carRear(x, i, tall) {
    if (tall) return r_(x - 21, -64, 42, 54, "#c7bda6", 1.6, 2) + '<path d="M' + (x - 21) + ' -46 h42 M' + x + ' -64 v54" stroke="' + INK + '" stroke-width="1"/>' + r_(x - 19, -10, 9, 10, INK, 0, 2) + r_(x + 10, -10, 9, 10, INK, 0, 2);
    return r_(x - 14, -22, 28, 17, CARCOL[i % 7], 1.6, 4) + r_(x - 11, -32, 22, 12, GLASS, 1.4, 3) + r_(x - 13, -7, 7, 7, INK, 0, 2) + r_(x + 6, -7, 7, 7, INK, 0, 2) + r_(x - 11, -17, 5, 3, ORANGE, 0) + r_(x + 6, -17, 5, 3, ORANGE, 0);
  }
  function hullCut(o) {
    var t = o.t || 0, g = "", list = o.list || 0, id = "dk" + (++CLIPN);
    // superstructure: four passenger decks, the funnel
    var decks = [[-178, -122, 356], [-168, -164, 336], [-150, -206, 300], [-112, -244, 224]];
    g += r_(-26, -300, 52, 58, HULL, 2) + r_(-28, -304, 56, 18, BOOT, 2) + r_(-40, -288, 80, 6, BOOT, 1.4);
    if (o.fire && !o.skin) g += puff(0, -306, t, 5, 110, 3);
    decks.forEach(function (d, k) { g += r_(d[0], d[1], d[2], k === 3 ? 38 : 42, HULL, 2); for (var x = d[0] + 14; x < d[0] + d[2] - 16; x += 22) g += r_(x, d[1] + 12, 12, k === 3 ? 10 : 13, k === 3 ? "#56636e" : GLASS, 1); });
    g += '<path d="M-178 -122 h356" stroke="' + INK + '" stroke-width="2.4"/>' + r_(-204, -116, 30, 12, VEST, 1.4, 6) + r_(174, -116, 30, 12, VEST, 1.4, 6);   // lifeboats at the deck edge
    // hull shell
    var shell = "M-189 -80 L-189 62 Q-189 126 -122 126 L122 126 Q189 126 189 62 L189 -80 Z";
    g += p_("M-189 16 L-204 22 L-204 50 L-189 58 Z", HULL_D, 2) + p_("M189 16 L204 22 L204 50 L189 58 Z", HULL_D, 2);   // sponsons
    g += p_(shell, HULL, 2.8);
    g += '<clipPath id="' + id + 'h"><path d="' + shell + '"/></clipPath><g clip-path="url(#' + id + 'h)"><rect x="-200" y="36" width="400" height="100" fill="' + BOOT + '"/></g>';
    if (o.skin) {   // the stern from outside: the ramp door, the name, the rubbing strake
      g += r_(-70, -72, 140, 88, HULL_D, 2, 4) + '<path d="M-70 -28 h140 M-40 -72 v88 M40 -72 v88" stroke="' + INK + '" stroke-width="1"/>' + '<path d="M-189 -80 h378" stroke="' + INK + '" stroke-width="3"/>' + n_("AL SALAM 98", 0, -84, 9, INK) + p_(shell, "none", 2.8);
      return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(list) + ") translate(0 -32)", g);
    }
    // below the car deck: engine room and tanks (hatched)
    g += '<g clip-path="url(#' + id + 'h)"><rect x="-200" y="0" width="400" height="140" fill="#cfc4aa"/><rect x="-200" y="0" width="400" height="140" fill="url(#hatch)" opacity=".5"/><rect x="-200" y="36" width="400" height="100" fill="' + BOOT + '" opacity=".35"/>' + r_(-60, 40, 50, 60, STEEL, 1.6, 4) + r_(10, 40, 50, 60, STEEL, 1.6, 4) + '<path d="M-189 100 h378" stroke="' + INK + '" stroke-width="1.4"/></g>';
    // the car deck: one open hall across the whole beam
    g += r_(-183, -80, 366, 80, "#f6f0e1", 2) + '<clipPath id="' + id + '"><rect x="-183" y="-80" width="366" height="80"/></clipPath><g clip-path="url(#' + id + ')">';
    var ck = o.cars == null ? 1 : o.cars, sl = o.slide || 0, sg = list >= 0 ? 1 : -1;
    LANES.forEach(function (x, i) { var kk = clamp(ck * 7 - (6 - i)); if (kk <= 0) return; var xs = lerp(x, sg > 0 ? 166 - (6 - i) * 30 : -166 + i * 30, sl); g += G("", carRear(xs, i, i === 2), kk); });
    if (o.fire) { g += puff(-52, -66, t, 6, 30, 1) + flame(-52, -60, .9 * o.fire, t, 0) + flame(-66, -40, .6 * o.fire, t, 2) + flame(-36, -44, .5 * o.fire, t, 4) + (o.fire > .7 ? flame(-2, -30, .5 * o.fire, t, 6) : ""); }
    if (o.spr) { for (var x2 = -160; x2 <= 160; x2 += 40) { g += r_(x2 - 3, -78, 6, 5, STEEL, 1); for (var j = 0; j < 3; j++) { var p = (t * 1.6 + hash(x2 + j * 7)) % 1, dx = (j - 1) * 9; g += '<path d="M' + f(x2 + dx * p) + ' ' + f(-72 + p * 66) + ' l' + f(dx * .12) + ' 9" stroke="' + BLUE + '" stroke-width="2" stroke-linecap="round" opacity="' + f(o.spr * (1 - p * .4)) + '"/>'; } } }
    var wp = waterPoly((o.water || 0) * 366 * 30, list);
    if (wp) g += '<path d="M' + wp.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + (o.hlW ? BLUE : WATER) + '" opacity="' + (o.hlW ? .9 : .78) + '"/><path d="M' + f(wp[wp.length - 2][0]) + " " + f(wp[wp.length - 2][1]) + " L" + f(wp[wp.length - 1][0]) + " " + f(wp[wp.length - 1][1]) + (wp.length === 3 ? "" : "") + '" stroke="#e8eef0" stroke-width="2.2"/>';
    g += '</g><path d="M-183 -76 h366" stroke="' + STEEL + '" stroke-width="3"/>';
    // the scuppers: a drain at each edge of the deck, through the shell, out above the waterline
    [-1, 1].forEach(function (sd) { g += '<path d="M' + sd * 181 + ' 4 h' + sd * 8 + '" stroke="#f6f0e1" stroke-width="7"/><path d="M' + sd * 180 + ' 0 v8 h' + sd * 9 + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'; if (o.blocked) g += G("", c_(sd * 179, 2, 5.5, "#6b5a45", 1.2) + c_(sd * 174, -2, 3.5, "#8a7656", 1), o.blocked); });
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(list) + ") translate(0 -32)", g);
  }
  
  function flame(x, y, s, t, seed) {
    var out = ""; seed = seed || 0;
    for (var i = 0; i < 3; i++) { var w = (11 - i * 3) * s, h = (34 - i * 8) * s * (1 + .2 * Math.sin(t * (9 + i * 2) + seed + i)), sx = Math.sin(t * 7 + i + seed) * 4 * s;
      out += '<path d="M' + f(x - w) + ' ' + f(y) + ' Q' + f(x - w * 1.3) + ' ' + f(y - h * .5) + ' ' + f(x + sx) + ' ' + f(y - h) + ' Q' + f(x + w * 1.3) + ' ' + f(y - h * .5) + ' ' + f(x + w) + ' ' + f(y) + ' Z" fill="' + [ORANGE, FIRE1, FIRE2][i] + '"' + (i ? "" : ' stroke="' + INK + '" stroke-width="1.2"') + '/>'; }
    return out;
  }
  function puff(x, y, t, n, h, seed) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .35 + hash(i + (seed || 0))) % 1; s += '<circle cx="' + f(x + (hash(i + 5) - .5) * 30 + 14 * Math.sin(t * 1.3 + i) * p) + '" cy="' + f(y - p * h) + '" r="' + f(5 + 12 * p) + '" fill="#6f6a62" opacity="' + f(.5 * (1 - p)) + '"/>'; } return s; }
  
  function ferry(o) {
    var t = o.t || 0, g = "", s = o.s || 1;
    if (!o.smokeOff) for (var i = 0; i < 6; i++) { var p = (t * .22 + i / 6) % 1; g += '<circle cx="' + f(268 + p * 150) + '" cy="' + f(-134 - p * 30 + 5 * Math.sin(t + i)) + '" r="' + f(6 + 14 * p) + '" fill="#6f6a62" opacity="' + f(.42 * (1 - p)) + '"/>'; }
    g += '<path d="M138 -98 v-42 M128 -128 h20 M132 -118 h12" stroke="' + INK + '" stroke-width="2"/>';   // mast over the bridge
    g += p_("M250 -98 L254 -128 L288 -128 L284 -98 Z", HULL, 2) + p_("M253 -122 L254 -132 L290 -132 L287 -122 Z", BOOT, 1.6) + p_("M287 -128 L300 -126 L287 -124 Z", BOOT, 1.2);   // funnel with its wing
    var tiers = [[66, -56, 440, 14], [92, -70, 388, 14], [106, -84, 318, 14], [112, -98, 214, 14]];
    tiers.forEach(function (d, k) { g += r_(d[0], d[1], d[2], d[3], HULL, 1.8); for (var x = d[0] + 8; x < d[0] + d[2] - 8; x += 10) g += '<rect x="' + x + '" y="' + (d[1] + 4) + '" width="5" height="5" fill="' + (o.lit ? FIRE2 : k === 3 && x < 150 ? "#56636e" : GLASS) + '" stroke="' + INK + '" stroke-width=".6"/>'; });
    for (var b = 0; b < 5; b++) g += '<path d="M' + (212 + b * 34) + ' -60 q13 9 26 0 z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (216 + b * 34) + ' -70 v10 M' + (234 + b * 34) + ' -70 v10" stroke="' + INK + '" stroke-width="1"/>';   // lifeboats under their davits
    var hull = "M0 -50 L44 0 L506 0 L524 -10 L524 -42 L60 -42 Z";
    g += p_(hull, HULL, 2.6) + '<clipPath id="fh' + (++CLIPN) + '"><path d="' + hull + '"/></clipPath><g clip-path="url(#fh' + CLIPN + ')"><rect x="0" y="-5" width="530" height="8" fill="' + BOOT + '"/></g>' + p_("M150 -12 L470 -12 L470 -4 L150 -4 Z", HULL_D, 1.4);   // boot stripe and the sponson
    for (var x3 = 70; x3 < 500; x3 += 14) g += '<circle cx="' + x3 + '" cy="-33" r="1.6" fill="' + (o.lit ? FIRE2 : INK) + '"/>';
    g += '<rect x="486" y="-40" width="34" height="28" fill="' + HULL_D + '" stroke="' + INK + '" stroke-width="1.2"/>';   // the stern ramp
    if (o.cut) {   // the car deck seen through the side: one hall from end to end
      var c = "";
      c += '<rect x="64" y="-30" width="452" height="20" fill="#f6f0e1" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var k2 = 0; k2 < 19; k2++) { var cx = 76 + k2 * 23; c += k2 % 5 === 2 ? r_(cx, -27, 19, 16, "#c7bda6", 1) : '<path d="M' + cx + ' -12 v-5 l3 -1 l3 -5 h8 l3 5 l3 1 v5 z" fill="' + CARCOL[k2 % 7] + '" stroke="' + INK + '" stroke-width=".9"/>'; }
      if (o.water) c += '<rect x="65" y="' + f(-11 - 7 * o.water) + '" width="450" height="' + f(7 * o.water) + '" fill="' + WATER + '" opacity=".8"/>';
      g += G("", c, o.cut);
    }
    return G("translate(" + f(o.x) + " " + f(o.y) + ") scale(" + s + ")", g);
  }
  
  function tray(x, y, ang, A, t) {   // a serving tray seen from the side, 300 wide, held at both ends; the water stays level
    var wp = waterPoly(A, ang, 300), id = "tr" + (++CLIPN), g = '<clipPath id="' + id + '"><rect x="-150" y="-60" width="300" height="60"/></clipPath>';
    if (wp) g += '<g clip-path="url(#' + id + ')"><path d="' + polyD(wp) + '" fill="' + WATER + '" opacity=".85"/></g>';
    g += '<path d="M-156 -30 L-150 0 L150 0 L156 -30" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M-150 3 h300" stroke="' + STEEL + '" stroke-width="4"/>';
    [-1, 1].forEach(function (sd) { g += '<path d="M' + sd * 250 + ' 70 L' + sd * 176 + ' 8" stroke="' + INK + '" stroke-width="30" stroke-linecap="round"/><path d="M' + sd * 250 + ' 70 L' + sd * 176 + ' 8" stroke="' + SKIN + '" stroke-width="26" stroke-linecap="round"/>' + '<ellipse cx="' + sd * 160 + '" cy="-2" rx="22" ry="13" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'; });
    return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ")", g);
  }
  function swimmer(x, y, t, i, sc) {   // a head and a life jacket above the water (no face, like the figures)
    var b = 5 * Math.sin(t * 1.7 + i * 1.3), s = sc || 1;
    return G("translate(" + f(x) + " " + f(y + b) + ") scale(" + s + ")", '<path d="M-20 22 Q-22 -4 0 -6 Q22 -4 20 22 Z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -6 v28" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="0" cy="-20" rx="12" ry="14" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -24 Q0 -40 12 -24 Q0 -30 -12 -24 Z" fill="' + HAIR + '"/>' +
      '<path d="M-20 4 L-38 ' + f(-8 - 6 * Math.sin(t * 3 + i)) + '" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>');
  }
  function raft(x, y, t) { var b = 4 * Math.sin(t * 1.4); return G("translate(" + f(x) + " " + f(y + b) + ") rotate(" + f(3 * Math.sin(t * 1.1)) + ")", '<path d="M-70 0 Q-60 -64 0 -70 Q60 -64 70 0 Z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-22 0 Q-20 -36 0 -38 Q20 -36 22 0 Z" fill="' + NIGHT + '"/>' + r_(-80, -4, 160, 22, "#3a352e", 2, 10) + '<path d="M0 -70 v-14" stroke="' + INK + '" stroke-width="2"/>' + c_(0, -88, 4, FIRE2, 1)); }
  function epirb(x, y, t) {   // the emergency beacon: a yellow float with an aerial and a strobe
    var fl = Math.sin(t * 8) > .3 ? 1 : .25;
    return G("translate(" + f(x) + " " + f(y + 4 * Math.sin(t * 1.8)) + ") rotate(" + f(6 * Math.sin(t * 1.3)) + ")", '<path d="M0 -62 v-70" stroke="' + INK + '" stroke-width="3"/>' + r_(-22, -30, 44, 70, "#e3b93c", 2.4, 10) + r_(-26, -34, 52, 16, VEST, 2, 6) + r_(-12, -62, 24, 30, "#f4ecdb", 2, 6) + '<circle cx="0" cy="-70" r="9" fill="' + FIRE2 + '" opacity="' + fl + '" stroke="' + INK + '" stroke-width="1.6"/>' + n_("EPIRB", 0, 12, 10, INK));
  }
  function rings(x, y, t, n, col, R0) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .6 + i / n) % 1; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(14 + p * (R0 || 120)) + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="3" opacity="' + f(1 - p) + '"/>'; } return s; }
  function satellite(x, y, t) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(-18 + 4 * Math.sin(t)) + ")", r_(-58, -12, 40, 24, BLUE, 1.6) + r_(18, -12, 40, 24, BLUE, 1.6) + '<path d="M-48 -12 v24 M-38 -12 v24 M-28 -12 v24 M28 -12 v24 M38 -12 v24 M48 -12 v24" stroke="' + INK + '" stroke-width=".8"/>' + r_(-18, -16, 36, 32, "#d8ccae", 2, 3) + '<path d="M0 16 v12 M-10 34 q10 -12 20 0" stroke="' + INK + '" stroke-width="2" fill="none"/>'); }
  function radio(x, y) { return G("translate(" + f(x) + " " + f(y) + ")", r_(-110, -60, 220, 120, "#4a4740", 2.6, 8) + r_(-96, -46, 90, 44, "#9fb7a0", 2, 3) + n_("CH 16", -51, -16, 22, INK) + [0, 1, 2, 3, 4].map(function (i) { return '<path d="M20 ' + (-44 + i * 10) + ' h76" stroke="#2a2016" stroke-width="3"/>'; }).join("") + c_(-76, 28, 13, "#8f8576", 2) + c_(-40, 28, 13, "#8f8576", 2) + r_(10, 16, 86, 26, ORANGE, 2, 4) + t_("DISTRESS", 53, 34, 13, "#fff", 800) +
    '<path d="M110 0 q30 10 20 50 q-10 40 30 60" fill="none" stroke="' + INK + '" stroke-width="3"/>' + r_(140, 104, 40, 70, "#4a4740", 2.2, 10)); }
  function gavel(x, y, k) { var a = lerp(-50, 0, k); return G("translate(" + f(x) + " " + f(y) + ")", r_(-70, 40, 140, 18, WOOD_D, 2, 4) + r_(-56, 26, 112, 16, WOOD, 2, 4) + G("rotate(" + f(a) + " 110 0)", r_(-10, -6, 130, 12, WOOD, 2, 5) + r_(-46, -26, 60, 50, WOOD_D, 2.4, 6) + '<path d="M-34 -26 v50 M2 -26 v50" stroke="' + INK + '" stroke-width="1.4"/>')); }
  function bubblesW(x, y, t) { var s = ""; for (var i = 0; i < 12; i++) { var p = (t * .6 + hash(i)) % 1; s += '<circle cx="' + f(x + (hash(i + 7) - .5) * 240) + '" cy="' + f(y + 260 - p * 250) + '" r="' + f(3 + hash(i + 3) * 7) + '" fill="none" stroke="#e8eef0" stroke-width="2" opacity="' + f(1 - p) + '"/>'; } return s; }

  // ── film-specific pieces ──
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  function D(i) { return LN[i].end - LN[i].start; }
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.5 + hash(i + 1) * 1.1) + '" fill="#fff" opacity="' + f2(.35 + .5 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function glints(t, wy, n, col) { var s = ""; for (var i = 0; i < (n || 44); i++) { var x = ((hash(i) * 800 + t * (14 + hash(i + 7) * 22)) % 800) - 220; s += '<path d="M' + f(x) + ' ' + f(wy + 8 + hash(i + 2) * 230) + ' h' + f(14 + hash(i + 5) * 26) + '" stroke="' + (col || "#a8c0e6") + '" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function night(t, wy) { return sky("skyStar") + stars(t, 90, wy) + '<circle cx="292" cy="96" r="17" fill="#e9e4d2"/><circle cx="285" cy="92" r="15" fill="#18203a"/>' + R(-220, wy, 800, 900, "url(#seaNight)", { s: 0 }) + glints(t, wy); }
  function seaFront(t, wy, op, col) { var d = "M-220 " + f(wy); for (var x = -220; x <= 580; x += 10) d += " L" + x + " " + f(wy + 2.4 * Math.sin((x - t * 40) * .05)); return '<path d="' + d + ' L580 1400 L-220 1400 Z" fill="' + (col || "#16264a") + '" opacity="' + f2(op == null ? .7 : op) + '"/><path d="' + d + '" stroke="#cfe0f6" stroke-width="1.4" fill="none" opacity=".8"/>'; }
  function cutS(x, y, s, t, o) { return G('translate(' + f(x) + ' ' + f(y + 1.5 * Math.sin(t * 1.2)) + ') scale(' + s + ')', hullCut(Object.assign({ x: 0, y: 0, t: t }, o))); }
  function cutScene(t, s, o, wy) { wy = wy || 360; return night(t, wy) + cutS(180, wy, s, t, o) + seaFront(t, wy, .62); }
  function rec(t, y) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".78"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt("تسجيل حقيقي · الصندوق الأسود", 288, y + 4, 13, "#fff", { a: "start" }) + b; }
  function photoCard(file, x, y, w, h, rot, k, cap) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y + (1 - eout(k)) * 14) + ') rotate(' + f(rot) + ')', '<rect x="' + (-w / 2 - 5) + '" y="' + (-h / 2 - 5) + '" width="' + (w + 10) + '" height="' + (h + 26) + '" fill="#f6f1e4" stroke="' + INK + '" stroke-width="1.4"/><image href="../photos/' + file + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/>' + '<text x="0" y="' + (h / 2 + 15) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="9.5" fill="#3a3428">' + (cap || "صورة حقيقية") + '</text>', k); }
  function xmark(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 -14 L' + f(-14 + 28 * clamp(k * 2)) + ' ' + f(-14 + 28 * clamp(k * 2)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' + (k > .5 ? '<path d="M14 -14 L' + f(14 - 28 * clamp(k * 2 - 1)) + ' ' + f(-14 + 28 * clamp(k * 2 - 1)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' : "")); }
  function arrowL(x1, y1, x2, y2, col, k, w) { k = clamp(k); if (k <= 0) return ""; var xe = lerp(x1, x2, k), ye = lerp(y1, y2, k), a = Math.atan2(ye - y1, xe - x1), h = 9; return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe) + ' ' + f(ye) + '" stroke="' + col + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe + Math.cos(a) * 5) + ' ' + f(ye + Math.sin(a) * 5) + ' L' + f(xe - Math.cos(a - .5) * h) + ' ' + f(ye - Math.sin(a - .5) * h) + ' L' + f(xe - Math.cos(a + .5) * h) + ' ' + f(ye - Math.sin(a + .5) * h) + ' Z" fill="' + col + '"/>'; }
  function vdr(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle r="70" fill="url(#warm)" opacity="' + f2(.35 + .1 * Math.sin(t * 3)) + '"/>' + r_(-40, -22, 80, 48, "#e8632a", 2, 12) + r_(-52, 10, 104, 16, "#c9521e", 2, 4) + r_(-26, -40, 52, 20, "#f4ecdb", 2, 6) + '<path d="M-40 -6 h80 M-40 6 h80" stroke="#f4ecdb" stroke-width="5" opacity=".9"/>' + n_("VDR", 0, 4, 13, "#1a1a1a") + '<circle cx="0" cy="-30" r="4" fill="#ff5a3a" opacity="' + (Math.sin(t * 7) > 0 ? 1 : .2) + '"/>'); }
  function ferryN(x, y, s, t, o) { return ferry(Object.assign({ x: x - 262 * s, y: y + 1.2 * Math.sin(t * 1.3), s: s, t: t, lit: 1 }, o || {})); }
  // the Red Sea between Duba and Safaga, real coastlines (Natural Earth through lib/geo.min.js); 1° of latitude ≈ 108 units
  var DUBA = [35.69, 27.35], SAFAGA = [33.94, 26.73], WRECK = [34.883, 27.033], MAPG = null;
  function mapG() { return MAPG || (MAPG = GEO.globe(180, 300, 3600, 34.85, 27.05)); }
  function seaMap(t, k) { var g = mapG(), a = g.project(DUBA), b = g.project(SAFAGA), w = g.project(WRECK), s = R(-300, -300, 960, 1300, "#12284a", { s: 0 });
    for (var i = 0; i < 12; i++) s += '<path d="M' + f(-60 + ((i * 97 + t * 6) % 480)) + ' ' + (120 + i * 34) + ' q6 -4 12 0 t12 0" stroke="#5a86b8" stroke-width="1.2" fill="none" opacity=".6"/>';
    s += '<path d="' + g.land + '" fill="#b89a62" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    return { svg: s, a: a, b: b, w: w, ship: [lerp(a[0], w[0], k), lerp(a[1], w[1], k)] }; }
  function pin(p, name, dx, dy, k, col) { k = clamp(k); return Ci(p[0], p[1], 5, col || YEL, { w: 1.6 }) + (k > 0 ? txt(name, p[0] + dx, p[1] + dy, 17, "#fff", { op: k, st: "rgba(0,0,0,.7)", sw: 4, wt: 900 }) : ""); }
  function miniShip(p, t) { return ferryN(p[0], p[1] + 3, .07, t, { smokeOff: 1 }) + '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(12 + 3 * Math.sin(t * 3)) + '" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>'; }
  var SK = ["#c98f66", "#b98058", "#d9a57a", "#a8724c"];
  function worker(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#5a6a7a", pants: "#3a3a40", mustache: true, skin: SK[1], bag: true }, o || {})); }
  function galabeya(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#8a8f96", dress: "#8a8f96", skin: SK[3], mustache: true, hat: "flat", hatCol: "#e8e2d0" }, o || {})); }
  function pilgrim(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#f4f0e6", dress: "#f4f0e6", skin: SK[0], beard: "#d8d4cc", hair: "none" }, o || {})); }
  function woman(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#2a2a34", dress: "#2a2a34", skin: SK[2], hair: "bob", hairCol: "#3a2a44" }, o || {})); }
  function officer(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#f2f0ea", pants: "#1c2440", hat: "officer", skin: SK[0], mustache: true }, o || {})); }
  var CAST = [worker, galabeya, pilgrim, woman, worker, galabeya];
  // a deck at night with the rail, tilted by `tilt` degrees; people stand on it
  function deckN(t, tilt, inner) {
    var g = R(-400, 400, 1160, 500, "url(#wood)", { s: 0 }); for (var i = 0; i < 14; i++) g += '<path d="M-400 ' + (412 + i * 18) + ' H760" stroke="#3a2414" stroke-width="1" opacity=".6"/>';
    g += '<path d="M-400 338 H760 M-400 362 H760" stroke="#e8e4d8" stroke-width="3"/>'; for (var p = 0; p < 24; p++) g += R(-390 + p * 48, 338, 4, 64, "#e8e4d8", { w: .8 });
    g += R(250, 150, 160, 252, "#e6dfcc", { w: 2 }); for (var w = 0; w < 3; w++) g += R(266 + w * 40, 190, 22, 26, WIN, { w: 1.2 }) + R(266 + w * 40, 270, 22, 26, WIN, { w: 1.2 });
    g += '<path d="M60 400 V262 Q60 236 90 236 M210 400 V262 Q210 236 180 236" stroke="#e8e4d8" stroke-width="6" fill="none"/>' + P('M70 250 Q135 282 200 250 L196 240 H74 Z', VEST, { w: 1.6 });
    return sky("skyStar") + stars(t, 60, 300) + G('rotate(' + f(-tilt * .5) + ' 180 420)', R(-400, 330, 1160, 600, "url(#seaNight)", { s: 0 }) + glints(t, 330, 30)) + G('rotate(' + f(tilt) + ' 180 420)', g + (inner || ""));
  }
  function bridge(t, tilt, inner) {   // the wheelhouse from inside: a row of windows on the night sea, the console, the wheel
    var s = R(-200, -200, 760, 1100, "#1a1e28", { s: 0 }), win = "";
    for (var i = 0; i < 4; i++) { var x = 14 + i * 86; win += '<svg x="' + x + '" y="150" width="74" height="120" viewBox="0 0 74 120" overflow="hidden"><rect width="74" height="120" fill="#0e1830"/><g transform="rotate(' + f(-tilt) + ' 37 60)"><rect x="-60" y="70" width="200" height="120" fill="#1c3460"/><path d="M-60 70 H140" stroke="#8fb0e0" stroke-width="1"/></g>' + [0, 1, 2, 3, 4].map(function (k) { return '<circle cx="' + f(hash(i * 5 + k) * 74) + '" cy="' + f(hash(i + k * 3) * 50) + '" r=".8" fill="#fff"/>'; }).join("") + '</svg>' + R(x, 150, 74, 120, "none", { w: 3, s: "#3a4252" }); }
    s += win + R(-20, 300, 400, 90, "#3a4252", { w: 2 }) + R(-20, 300, 400, 10, "#56607a", { s: 0 });
    for (var k = 0; k < 6; k++) s += R(20 + k * 56, 322, 40, 26, "#10141c", { w: 1.2 }) + '<circle cx="' + (30 + k * 56) + '" cy="335" r="3" fill="' + (k % 2 ? "#e23a2a" : "#7ad87a") + '" opacity="' + f2(.5 + .5 * Math.sin(t * 4 + k)) + '"/>';
    s += G('translate(180 380)', '<circle r="34" fill="none" stroke="#8a6a44" stroke-width="6"/><circle r="6" fill="#8a6a44"/>' + [0, 1, 2, 3, 4, 5].map(function (q) { return '<path d="M0 0 L' + f(Math.cos(q * 1.047 + tilt * .02) * 44) + ' ' + f(Math.sin(q * 1.047 + tilt * .02) * 44) + '" stroke="#8a6a44" stroke-width="4"/>'; }).join(""));
    s += R(-200, 430, 760, 400, "#12151c", { s: 0 }) + '<circle cx="180" cy="120" r="150" fill="url(#warm)" opacity=".12"/>';
    return s + (inner || "");
  }
  function head(x, y, s, t, k, vest) { var b = 3 * Math.sin(t * 1.7 + k * 1.3); return G('translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')', (vest === false ? '' : P('M-17 22 Q-19 2 0 0 Q19 2 17 22 Z', VEST, { w: 1.6 }) + '<path d="M0 0 v22" stroke="' + INK + '" stroke-width="1.2"/>') + G('translate(0 -12)', face(k % 2 ? "front" : "side", { skin: SK[k % 4], hair: k % 3 === 2 ? "bob" : "short", mustache: k % 3 === 0, sad: true })) + '<path d="M-17 8 L-30 ' + f(-4 - 5 * Math.sin(t * 3 + k)) + '" stroke="' + SK[k % 4] + '" stroke-width="5" stroke-linecap="round"/>'); }
  function seaPeople(t, wy, n) { var s = "", pos = [[90, 60], [250, 90], [160, 130], [300, 160], [60, 170], [210, 200], [120, 230]]; for (var i = 0; i < n; i++) s += head(pos[i][0], wy + pos[i][1], .9 + pos[i][1] / 400, t, i) + '<ellipse cx="' + pos[i][0] + '" cy="' + f(wy + pos[i][1] + 22) + '" rx="26" ry="4" fill="#cfe0f6" opacity=".25"/>'; return s; }
  function vests(t, wy, n) { var s = ""; for (var i = 0; i < n; i++) s += G('translate(' + f(40 + i * 62 + 8 * Math.sin(t * .7 + i)) + ' ' + f(wy + 3 + 3 * Math.sin(t * 1.6 + i * 2)) + ') rotate(' + f(18 * Math.sin(t * .8 + i)) + ')', r_(-10, -4, 20, 8, VEST, 1.2, 3)); return s; }
  function lights(t, wy, n) { var s = ""; for (var i = 0; i < n; i++) { var x = 20 + hash(i * 3) * 320, y = wy + 20 + hash(i + 11) * 200, fl = .6 + .4 * Math.sin(t * 2 + i * 1.7); s += '<circle cx="' + f(x + 3 * Math.sin(t * .6 + i)) + '" cy="' + f(y + 2 * Math.sin(t * 1.1 + i)) + '" r="9" fill="#ffcf7a" opacity="' + f2(.18 * fl) + '"/><circle cx="' + f(x + 3 * Math.sin(t * .6 + i)) + '" cy="' + f(y + 2 * Math.sin(t * 1.1 + i)) + '" r="1.8" fill="#ffe9a8" opacity="' + f2(fl) + '"/>'; } return s; }
  function village(t) { var s = sky("skyStar") + stars(t, 110, 330) + R(-220, 400, 800, 500, "#161a22", { s: 0 }); for (var i = 0; i < 13; i++) { var w = 44 + hash(i) * 30, h = 50 + hash(i + 4) * 70, x = -40 + i * 36 + hash(i + 9) * 10, y = 400 + (i % 3) * 14; s += R(x, y - h, w, h + 40, ["#2a2e3a", "#333847", "#262a34"][i % 3], { w: 1.2 }); for (var k = 0; k < 2; k++) { var on = hash(i * 7 + k) > .25; s += R(x + 8 + k * 18, y - h + 14, 9, 12, on ? WIN : "#12141a", { w: .8, op: on ? .7 + .3 * Math.sin(t * 1.5 + i + k) : 1 }); } } return s; }

  // ══════ «كوستا كونكورديا»: the ship drawn from the 2011 Palma photograph (white hull, a long row of yellow-orange
  //   lifeboats on deck 4, blue balcony bands, a stepped superstructure, a yellow funnel with a blue «C» and a black top
  //   at the stern, radar domes forward) and the wreck photographs at Giglio (lying on her starboard side). ══════
  var HW = "#f4f2ea", BAL = "#3f6ea8", LBC = "#f0a830", FUN = "#f2c230", NAVY2 = "#1c2440";
  // profile, bow to the right, origin on the waterline amidships; 1 m = 2 units (290 m → 580)
  function concordia(x, y, s, t, o) {
    o = o || {}; var g = "", lit = !o.dark, fl = o.flicker ? (Math.sin(t * 23) > .2 ? 1 : .25) : 1, W = lit ? "#ffd98a" : "#2a3040";
    if (o.smoke !== false) for (var q = 0; q < 6; q++) { var ph = ((t * .22 + q / 6) % 1); g += '<circle cx="' + f(-212 - ph * 70) + '" cy="' + f(-152 - ph * 26) + '" r="' + f(5 + ph * 12) + '" fill="#3a3c44" opacity="' + f2(.5 * (1 - ph)) + '"/>'; }
    g += p_("M-288 4 L270 4 Q288 4 292 -8 L282 18 L-282 18 Z", "#8a2a2a", 1.6);
    g += p_("M-288 4 L-292 -34 L282 -34 L306 -40 L294 -10 Q290 4 270 4 Z", HW, 2);
    g += '<path d="M-288 2 H286" stroke="' + BAL + '" stroke-width="2.4"/>';
    for (var k = 0; k < 46; k++) g += '<circle cx="' + (-276 + k * 12) + '" cy="-18" r="1.3" fill="' + (lit ? W : "#3a4050") + '" opacity="' + f2(fl) + '"/>';
    g += r_(-252, -48, 450, 14, "#5a6270", 1.2);
    for (var i = 0; i < 24; i++) g += '<rect x="' + (-244 + i * 18) + '" y="-46" width="15" height="9" rx="4" fill="' + LBC + '" stroke="' + INK + '" stroke-width=".9"/>';
    g += p_("M-262 -48 L-262 -98 L-238 -106 L150 -106 L198 -98 L224 -82 L242 -62 L252 -48 Z", HW, 2);
    for (var b = 0; b < 6; b++) { var by = -58 - b * 8, x0 = -256 + b * 2, x1 = 236 - b * 12; g += '<rect x="' + x0 + '" y="' + by + '" width="' + (x1 - x0) + '" height="3.4" fill="' + BAL + '"/>'; if (lit) for (var w = x0 + 4; w < x1 - 4; w += 9) g += '<rect x="' + w + '" y="' + (by - 3.4) + '" width="3.4" height="2.6" fill="' + W + '" opacity="' + f2(fl * (.55 + .45 * hash(w + b * 7))) + '"/>'; }
    g += r_(196, -92, 40, 6, "#1a2030", 1) + r_(-232, -116, 370, 10, HW, 1.6) + '<circle cx="150" cy="-118" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><circle cx="130" cy="-118" r="5" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<path d="M168 -116 V-146 M158 -138 H178 M162 -130 H174" stroke="' + INK + '" stroke-width="1.6"/>';
    g += p_("M-224 -112 L-228 -152 L-194 -152 L-190 -112 Z", FUN, 1.8) + p_("M-227.4 -146 L-228 -152 L-194 -152 L-194.6 -146 Z", "#16161a", 1.2) + n_("C", -209, -122, 20, "#1f4fa0");
    if (o.gash) g += p_("M40 -4 L58 -12 L74 -6 L92 -14 L112 -6 L126 -10 L130 0 L40 2 Z", "#2a1a14", 1.4) + '<path d="M58 -12 l4 6 M92 -14 l2 8" stroke="#8a2a2a" stroke-width="1.2"/>';
    if (o.waterIn) g += '<clipPath id="ccw' + (++CLIPN) + '"><path d="M-288 4 L-292 -34 L282 -34 L306 -40 L294 -10 Q290 4 270 4 Z"/></clipPath><g clip-path="url(#ccw' + CLIPN + ')"><rect x="-300" y="' + f(2 - 30 * o.waterIn) + '" width="620" height="60" fill="#3f86b8" opacity=".75"/></g>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g, o.op);
  }
  // seen from the bow (or stern), listing: beam 35.5 m → 71; heel in degrees, + = the right side (starboard) goes down
  function ccFront(x, y, s, t, o) {
    o = o || {}; var g = "", lit = !o.dark, fl = o.flicker ? (Math.sin(t * 23) > .2 ? 1 : .25) : 1, W = lit ? "#ffd98a" : "#2a3040";
    g += r_(-10, -146, 20, 34, FUN, 1.6) + r_(-10, -150, 20, 8, "#16161a", 1);
    g += p_("M-36 -34 L-36 6 Q-30 28 0 32 Q30 28 36 6 L36 -34 Z", HW, 2) + '<path d="M-36 6 Q-30 28 0 32 Q30 28 36 6" fill="#8a2a2a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-36 2 H36" stroke="' + BAL + '" stroke-width="2"/>';
    g += r_(-40, -48, 80, 14, "#5a6270", 1.2) + '<rect x="-50" y="-46" width="12" height="9" rx="4" fill="' + LBC + '" stroke="' + INK + '" stroke-width=".9"/><rect x="38" y="-46" width="12" height="9" rx="4" fill="' + LBC + '" stroke="' + INK + '" stroke-width=".9"/>';
    g += r_(-38, -106, 76, 58, HW, 1.8) + r_(-48, -90, 96, 6, "#1a2030", 1);
    for (var b = 0; b < 6; b++) { g += '<rect x="-36" y="' + (-58 - b * 8) + '" width="72" height="2.6" fill="' + BAL + '"/>'; if (lit) for (var w = -32; w < 32; w += 8) g += '<rect x="' + w + '" y="' + (-61 - b * 8) + '" width="3" height="2.4" fill="' + W + '" opacity="' + f2(fl * (.5 + .5 * hash(w * 3 + b))) + '"/>'; }
    g += r_(-30, -116, 60, 10, HW, 1.4) + '<path d="M0 -116 V-140 M-8 -132 H8" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.people) for (var p = 0; p < o.people; p++) g += '<circle cx="' + f(-30 + hash(p) * 26) + '" cy="' + f(-50 - hash(p + 4) * 4) + '" r="1.6" fill="#1a1a1a"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.heel || 0) + ') scale(' + s + ')', g, o.op);
  }
  // Giglio: dark hills, the harbour village lights, the little lighthouse; the rocks of Le Scole in the sea
  function giglio(t, wy, o) { o = o || {}; var g = p_("M-120 " + wy + " L-60 " + (wy - 40) + " Q0 " + (wy - 120) + " 70 " + (wy - 96) + " Q130 " + (wy - 80) + " 180 " + (wy - 46) + " L240 " + (wy - 20) + " L280 " + wy + " Z", "#14211c", 1.6);
    for (var i = 0; i < 26; i++) { var lx = 120 + hash(i) * 120, ly = wy - 8 - hash(i + 3) * 34 * (1 - (lx - 120) / 140); g += '<rect x="' + f(lx) + '" y="' + f(ly) + '" width="2.4" height="2.4" fill="#ffd98a" opacity="' + f2(.5 + .5 * Math.abs(Math.sin(t * 1.3 + i))) + '"/>'; }
    g += r_(236, wy - 26, 6, 24, "#c23a2a", 1) + '<circle cx="239" cy="' + (wy - 28) + '" r="' + f(8 + 4 * Math.sin(t * 3)) + '" fill="#ffe9a8" opacity=".35"/>';
    return G('translate(' + f(o.dx || 0) + ' 0)', g); }
  function rocks(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', p_("M-40 0 L-30 -14 L-18 -8 L-6 -22 L8 -10 L22 -18 L36 0 Z", "#2a2a28", 1.4) + '<path d="M-46 2 q10 ' + f(-6 - 3 * Math.sin(t * 4)) + ' 20 0 t20 0 t20 0 t20 0" stroke="#e8f2fa" stroke-width="2" fill="none" opacity=".85"/>'); }
  function itMap(t, k) { var g = GEO.globe(180, 320, 9800, 11.25, 42.35), civ = g.project([11.80, 42.09]), gig = g.project([10.92, 42.36]), sav = [-40, 60], s = R(-300, -300, 960, 1300, "#12284a", { s: 0 });
    for (var i = 0; i < 12; i++) s += '<path d="M' + f(-60 + ((i * 97 + t * 6) % 480)) + ' ' + (120 + i * 34) + ' q6 -4 12 0 t12 0" stroke="#5a86b8" stroke-width="1.2" fill="none" opacity=".6"/>';
    s += '<path d="' + g.land + '" fill="#b89a62" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' + '<ellipse cx="' + f(gig[0]) + '" cy="' + f(gig[1]) + '" rx="12" ry="18" fill="#b89a62" stroke="' + INK + '" stroke-width="1.4"/>';
    return { svg: s, civ: civ, gig: gig, sav: sav }; }
  function hall(t, o) { o = o || {}; var dark = o.dark, s = R(-200, -200, 760, 1100, dark ? "#120e10" : "#4a2a2a", { s: 0 }) + R(-200, 380, 760, 400, dark ? "#1a1416" : "#6a3a2a", { s: 0 });
    for (var c = 0; c < 3; c++) { var cx = 60 + c * 120; s += '<path d="M' + cx + ' -200 V110" stroke="#2a2018" stroke-width="1.4"/>' + (dark ? Ci(cx, 120, 10, "#3a3430") : '<circle cx="' + cx + '" cy="120" r="44" fill="url(#warm)" opacity=".6"/>' + Ci(cx, 120, 10, "#ffe9a8")); }
    for (var k = 0; k < 3; k++) { var tx = 50 + k * 130, ty = 400 + (k % 2) * 30; s += '<ellipse cx="' + tx + '" cy="' + ty + '" rx="48" ry="12" fill="#f4f0e6" stroke="' + INK + '" stroke-width="1.4"/>' + R(tx - 4, ty, 8, 40, "#3a2a20", { w: 1 }); }
    s += person(40, 420, 1.3, t, { top: "#3a3a44", pants: "#2a2a30", skin: SK[0], view: "side" }) + person(200, 440, 1.3, t, { top: "#7a3a4a", dress: "#7a3a4a", hair: "bob", skin: SK[2], view: "side", flip: true }) + person(310, 425, 1.3, t, { top: "#2a3a4a", pants: "#2a2a30", skin: SK[3], mustache: true });
    var band = ""; for (var m = 0; m < 3; m++) band += person(130 + m * 50, 300, 1.05, t, { top: "#1a1a1e", pants: "#1a1a1e", skin: SK[m] }); s += R(100, 300, 160, 8, "#3a2418", { w: 1 }) + G('', band, dark ? .35 : 1);
    if (o.fall) for (var p = 0; p < 7; p++) { var u = ((t * .9 + hash(p)) % 1); s += '<ellipse cx="' + f(40 + hash(p + 2) * 280) + '" cy="' + f(380 + u * 120) + '" rx="8" ry="2.6" fill="#f4f0e6" stroke="' + INK + '" stroke-width="1" transform="rotate(' + f(u * 200) + ' ' + f(40 + hash(p + 2) * 280) + ' ' + f(380 + u * 120) + ')"/>'; }
    return G('rotate(' + f(o.tilt || 0) + ' 180 400)', s); }
  function schettinoP(x, y, s, t, o) { return portrait(x, y, s, t, Object.assign({ top: NAVY2, hair: "short", hairCol: "#15110e", skin: "#c98f66", rim: true }, o || {})); }
  function defalcoP(x, y, s, t, o) { return portrait(x, y, s, t, Object.assign({ top: "#f2f0ea", hair: "none", skin: "#d9a57a", rim: true }, o || {})); }
  function captainS(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: NAVY2, pants: NAVY2, skin: "#c98f66", hat: "officer", hatCol: "#f2f0ea" }, o || {})); }
  function rec2(t, y, src) { var b = ""; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".78"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt("تسجيل حقيقي · " + src, 288, y + 4, 13, "#fff", { a: "start" }) + b; }
  function office(t, inner) { var s = R(-200, -200, 760, 1100, "#1c2230", { s: 0 }) + R(-200, 420, 760, 400, "#2a2a30", { s: 0 }) + R(20, 380, 320, 18, "#5a4632", { w: 1.6 }) + '<circle cx="300" cy="200" r="120" fill="url(#warm)" opacity=".25"/>' + R(220, 330, 90, 50, "#2a2a28", { w: 1.4 }) + '<circle cx="246" cy="355" r="7" fill="#c9a040"/>' + R(266, 346, 34, 16, "#9fb7a0", { w: 1 });
    s += R(40, 120, 120, 90, "#2a3a5a", { w: 2 }) + '<path d="M50 190 l20 -30 l20 20 l20 -40 l30 50" stroke="#7ad87a" stroke-width="1.6" fill="none"/>'; return s + (inner || ""); }
  function shore(t, inner) { return sky("skyStar") + stars(t, 70, 300) + R(-220, 330, 800, 400, "url(#seaNight)", { s: 0 }) + glints(t, 330, 26) + ccFront(240, 330, .9, t, { heel: 64, flicker: true }) + seaFront(t, 331, .55) + p_("M-220 470 L-40 430 L60 452 L140 420 L240 460 L580 440 L580 900 L-220 900 Z", "#1e1c1a", 1.6) + (inner || ""); }
  function bars(t) { var s = ""; for (var i = 0; i < 9; i++) s += r_(-10 + i * 46, -100, 9, 900, "#4a4c52", 1.4); return s + r_(-200, 120, 760, 10, "#4a4c52", 1.4); }

  // ═════════ the shots (line numbers from script.txt; 0, 24 and 39 are the real recordings) ═════════
  var WY = 380;
  // 0 — the call: «I'm in command now! Get back on board!» over the ship lying on her side at night
  shot(0, push([180, 320], [180, 330], 1.0, 1.14), function (u, d, t) { return night(t, WY) + giglio(t, WY, { dx: -90 }) + ccFront(165, WY, 1.2, t, { heel: lerp(48, 58, clamp(u / 6)), flicker: true }) + seaFront(t, WY + 1, .7) + rec2(t, 112, "خفر السواحل الإيطالي"); });
  // 1 — that voice is real: a coast guard officer shouting at a ship's captain
  shot(1, push([180, 300], [180, 310], 1.0, 1.08), function (u, d, t) { return R(-220, -220, 800, 1300, "#101420", { s: 0 }) + panelBox(70, 180, office(t, defalcoP(120, 120, .9, t)), "translate(0 -100)", t) + panelBox(258, 180, shore(t, schettinoP(110, 380, .9, t, { sad: true })), "translate(0 -250)", t) + label("خفر السواحل", 270, 110, u, .4, 18, YEL) + label("القبطان", 270, 300, u, D(1) * .6, 18, YEL); });
  // 2 — the night of 13 January 2012, off a small Italian island called Giglio
  shot(2, push([180, 330], [200, 330], 1.0, 1.1), function (u, d, t) { return night(t, WY) + giglio(t, WY) + concordia(lerp(40, 90, u / d), WY, .42, t) + seaFront(t, WY + 1, .5) + label("13 يناير 2012", 180, 160, u, .3, 30, "#fff") + label("جزيرة جيليو · إيطاليا", 180, 194, u, .8, 18, YEL); });
  // 3 — one of Europe's biggest cruise ships, nearly three football pitches long, more than 4,000 people aboard
  shot(3, push([200, 330], [150, 330], 1.25, 1.1), function (u, d, t) { return night(t, 400) + concordia(180, 400, .6, t) + seaFront(t, 401, .5) + bigNum("4,200", 180, 150, u, D(3) * .6, 44) + label("إنسان وأكتر", 180, 184, u, D(3) * .6 + .4, 20, "#fff") + photoCard("concordia-palma-2011.jpg", 96, 250, 140, 96, -4, (u - .5) / .5, "صورة حقيقية · كوستا كونكورديا 2011"); });
  // 4 — people at dinner, a band playing, a calm sea
  shot(4, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return hall(t, {}) + label("صالة الأكل", 180, 130, u, .4, 22, "#fff"); });
  // 5 — how does a ship like that roll onto her side, a few steps from the shore?
  shot(5, push([180, 330], [180, 330], 1.2, 1.05), function (u, d, t) { return night(t, WY) + giglio(t, WY, { dx: -60 }) + ccFront(190, WY, 1.0, t, { heel: lerp(5, 40, clamp(u / d)) }) + seaFront(t, WY + 1, .6) + label("على بعد خطوات من الشط", 180, 150, u, D(5) * .5, 22, YEL); });
  // 6 — and why was her captain off the ship, with people still aboard?
  shot(6, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, 300) + ccFront(250, 300, .9, t, { heel: 55, flicker: true, people: 14 }) + seaFront(t, 301, .5) + G('translate(110 420)', p_("M-44 -6 Q-40 10 -26 12 H26 Q40 10 44 -8 L38 -4 H-38 Z", LBC, 1.6) + captainS(0, -2, .9, t, { view: "back", back: true })) + seaFront(t, 440, .3) + label("القبطان؟", 110, 330, u, D(6) * .3, 22, YEL); });
  // 7 — hour by hour; we start at the port
  shot(7, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDusk") + cloudBank(t, 150, 3, 4, "#f6b070", .5) + R(-220, 420, 800, 500, "url(#seaDawn)", { s: 0 }) + concordia(180, 420, .5, t, { smoke: true }) + seaFront(t, 421, .4, "#3a3a5a") + watch(180, 230, 52, t, { h: 7.33 + u * .3 }) + label("ساعة بساعة", 180, 130, u, .4, 28, "#fff"); });
  // 8 — 19:20, she leaves Civitavecchia near Rome on a week-long Mediterranean cruise
  shot(8, push([200, 320], [170, 320], 1.05, 1.15), function (u, d, t) { var m = itMap(t), k = clamp((u - .6) / 2.2), p = [lerp(m.civ[0], m.gig[0] + 20, k), lerp(m.civ[1], m.gig[1], k)]; return m.svg + '<path d="M' + f(m.civ[0]) + ' ' + f(m.civ[1]) + ' L' + f(p[0]) + ' ' + f(p[1]) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 5" fill="none"/>' + pin(m.civ, "تشيفيتافيكيا", 0, 26, 1) + pin(m.gig, "جيليو", -10, -26, (u - 1.6) / .4) + concordia(p[0], p[1] + 2, .05, t, { smoke: false }) + label("روما ↗", 300, 230, u, .3, 15, "#e8d9b0") + watch(278, 150, 28, t, { h: 7.33 }); });
  // 9 — some 600 passengers had just come aboard and had not done the safety drill
  shot(9, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = sky("skyDusk") + R(-220, 380, 800, 30, "url(#seaDawn)", { s: 0 }) + G('translate(250 404) scale(.9)', concordia(0, 0, .9, t, { smoke: false })) + R(-220, 428, 800, 400, "#6a6258", { s: 0 }); for (var i = 0; i < 5; i++) s += CAST[i](20 + ((u * 22 + i * 80) % 420) - 60, 600 + (i % 2) * 20, 2.4, t, { walk: true, ph: i * 1.3 }); return s + bigNum("600", 120, 200, u, .5, 44) + label("ماعملوش تدريب الطوارئ", 180, 250, u, D(9) * .55, 20, "#fff") + xmark(300, 196, 1, (u - D(9) * .6) / .4); });
  // 10 — the captain: Francesco Schettino. Long experience… and too much confidence
  shot(10, push([180, 330], [180, 310], 1.0, 1.12), function (u, d, t) { return bridge(t, 0, '') + schettinoP(180, 380, 2.2, t) + label("فرانشيسكو سكيتينو", 180, 130, u, .4, 24, "#fff") + label("القبطان", 180, 160, u, .8, 18, YEL); });
  // 11 — the «salute»: sailing close past Giglio with every light on, for the islanders to watch
  shot(11, push([140, 330], [220, 330], 1.1, 1.2), function (u, d, t) { var s = night(t, WY) + giglio(t, WY, { dx: 40 }) + concordia(lerp(-40, 120, clamp(u / d)), WY + 6, .4, t) + seaFront(t, WY + 7, .5); for (var i = 0; i < 6; i++) s += person(250 + i * 16, WY - 10, .25, t, { view: "back", back: true, ph: i, top: "#2a2a30" }); return s + label("«التحية»", 180, 160, u, .4, 30, YEL); });
  // 12 — next to him on the bridge, the head waiter, who came from that island
  shot(12, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return bridge(t, 0, captainS(110, 640, 3.6, t, { view: "back", back: true }) + person(262, 640, 3.4, t, { top: "#1a1a1e", pants: "#1a1a1e", skin: SK[2], mustache: true, view: "side", flip: true })) + label("رئيس الجرسونات · من الجزيرة", 180, 120, u, .6, 20, "#fff"); });
  // 13 — he switched off the navigation alarm, navigating by eye
  shot(13, push([180, 340], [180, 330], 1.6, 1.4), function (u, d, t) { var on = u < D(13) * .35; return bridge(t, 0, '') + R(120, 300, 120, 50, "#10141c", { w: 1.6 }) + '<circle cx="180" cy="325" r="14" fill="' + (on && Math.sin(t * 8) > 0 ? "#e23a2a" : "#3a1a1a") + '" stroke="' + INK + '" stroke-width="1.4"/>' + xmark(180, 325, 1.1, (u - D(13) * .35) / .4) + label("إنذار الملاحة", 180, 270, u, .3, 18, "#fff") + label("بعينه", 180, 250, u, D(13) * .6, 26, YEL); });
  // 14 — even his reading glasses were left in his cabin; he kept asking his officer to read the radar
  shot(14, push([180, 330], [180, 320], 1.2, 1.3), function (u, d, t) { var s = R(-200, -200, 760, 1100, "#2a2230", { s: 0 }) + R(40, 360, 280, 16, "#6a4a32", { w: 1.6 }) + '<circle cx="260" cy="200" r="120" fill="url(#warm)" opacity=".25"/>';
    s += G('translate(180 352)', '<circle cx="-22" cy="0" r="16" fill="#cfe0f0" opacity=".5" stroke="' + INK + '" stroke-width="3"/><circle cx="22" cy="0" r="16" fill="#cfe0f0" opacity=".5" stroke="' + INK + '" stroke-width="3"/><path d="M-6 -2 q6 -6 12 0 M-38 -2 l-24 -10 M38 -2 l24 -10" stroke="' + INK + '" stroke-width="3" fill="none"/>');
    return s + label("النضارة… في الأوضة", 180, 200, u, .5, 22, "#fff") + G('translate(150 150)', R(60, 90, 90, 70, "#10241a", { w: 1.6 }) + '<circle cx="105" cy="125" r="28" fill="none" stroke="#7ad87a" stroke-width="1"/><path d="M105 125 L' + f(105 + 28 * Math.cos(t * 2)) + ' ' + f(125 + 28 * Math.sin(t * 2)) + '" stroke="#7ad87a" stroke-width="1.6"/>', clamp((u - D(14) * .5) / .4)); });
  // 15 — 21:45: he sees the waves breaking on rocks ahead… and turns too late
  shot(15, push([200, 360], [220, 370], 1.4, 1.7), function (u, d, t) { return night(t, WY) + giglio(t, WY, { dx: 120 }) + concordia(lerp(60, 120, clamp(u / d)), WY + 4, .5, t, { rot: -6 * clamp((u - D(15) * .6) / 1) }) + rocks(300, WY + 8, 1.2, t) + seaFront(t, WY + 9, .5) + watch(80, 180, 36, t, { h: 9.75 }) + label("متأخر", 220, 290, u, D(15) * .7, 26, YEL); });
  // 16 — the port side hits a rock under the water; a long gash opens
  shot(16, push([220, 330], [232, 334], 1.3, 1.5), function (u, d, t) { var hit = clamp((u - .6) / .4), sh = hit > 0 && hit < 1 ? 3 * Math.sin(u * 60) : 0; return R(-220, -220, 800, 1300, "#0c1630", { s: 0 }) + R(-220, 360, 800, 600, "url(#seaNight)", { s: 0 }) + G('translate(' + f(sh) + ' 0)', concordia(160, 360, .9, t, { gash: hit > .5, smoke: false })) + rocks(270, 368, 1.4, t) + seaFront(t, 362, .55) + label("صخرة", 270, 420, u, .9, 18, YEL) + photoCard("wreck-gash.jpg", 178, 214, 150, 100, -3, (u - D(16) * .55) / .5, "صورة حقيقية · الشق في جنب السفينة"); });
  // 17 — water floods the engine room, the power goes, the ship drifts without engines
  shot(17, push([180, 340], [180, 330], 1.1, 1.2), function (u, d, t) { var lv = lerp(520, 330, clamp(u / d)), s = R(-200, -200, 760, 1100, "#1a1e24", { s: 0 }); for (var i = 0; i < 4; i++) s += R(20 + i * 86, 260, 60, 160, "#5a6270", { w: 1.6 }) + R(30 + i * 86, 280, 40, 20, "#3a4048", { w: 1 });
    s += '<rect x="-200" y="' + f(lv) + '" width="760" height="600" fill="#2a6a9a" opacity=".8"/>' + '<path d="M-200 ' + f(lv) + ' q20 -4 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#cfe6f4" stroke-width="2" fill="none"/>';
    var off = u > D(17) * .45; s += Ci(180, 120, 12, off ? "#2a2a2a" : "#ffe9a8") + (off ? '' : '<circle cx="180" cy="120" r="70" fill="url(#warm)" opacity=".5"/>') + (off ? R(-200, -200, 760, 1100, "#000", { s: 0, op: .45 }) : ""); return s + label("الكهربا قطعت", 180, 200, u, D(17) * .45, 24, YEL); });
  // 18 — the dining room: plates fall, the lights go out… and passengers said the band was playing the Titanic song
  shot(18, push([180, 330], [180, 320], 1.0, 1.12), function (u, d, t) { var dk = u > D(18) * .3; return hall(t, { dark: dk, fall: true, tilt: 4 * Math.sin(t * .8) }) + label("أغنية تيتانيك", 180, 140, u, D(18) * .62, 26, YEL); });
  // 19 — the coincidence: three months short of 100 years since the Titanic sank
  shot(19, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, 400) + glints(t, 400, 30) + bigNum("1912", 100, 260, u, .3, 40, "#fff") + bigNum("2012", 260, 260, u, .9, 40, YEL) + arrowL(150, 248, 210, 248, "#fff", (u - .6) / .4, 3) + label("100 سنة إلا 3 شهور", 180, 320, u, 1.4, 22, "#fff"); });
  // 20 — the loudspeakers: nothing's wrong… it's an electrical problem
  shot(20, push([180, 330], [180, 330], 1.2, 1.3), function (u, d, t) { var r = (t * 1.2) % 1; return hall(t, { dark: true }) + G('translate(180 170)', p_("M-30 -20 L-10 -20 L14 -40 L14 40 L-10 20 L-30 20 Z", "#6a6a70", 2) + '<path d="M28 -' + f(16 + r * 10) + ' q' + f(14 + r * 10) + ' ' + f(16 + r * 10) + ' 0 ' + f(32 + r * 20) + '" stroke="#fff" stroke-width="3" fill="none" opacity="' + f2(1 - r) + '"/>') + label("«مشكلة في الكهربا»", 180, 260, u, .6, 22, YEL); });
  // 21 — the coast guard calls; the answer: a blackout, all fine
  shot(21, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return office(t, person(100, 640, 3.4, t, { top: "#f2f0ea", pants: "#1c2440", skin: SK[0], view: "back", back: true })) + label("خفر السواحل · ليفورنو", 180, 110, u, .3, 20, "#fff") + label("«عطل كهربا… كله تمام»", 180, 270, u, D(21) * .55, 22, YEL); });
  // 22 — remember the coast guard
  shot(22, push([260, 340], [260, 330], 1.6, 1.8), function (u, d, t) { var r = (t * 1.2) % 1; return office(t, '') + '<circle cx="265" cy="355" r="' + f(10 + r * 30) + '" fill="none" stroke="' + YEL + '" stroke-width="1.6" opacity="' + f2(1 - r) + '"/>'; });
  // 23 — below, passengers in life jackets waiting; a crew member tells them:
  function muster(t, inner) { var s = R(-200, -200, 760, 1100, "#3a3a44", { s: 0 }) + R(-200, 420, 760, 400, "#2a2a30", { s: 0 }); for (var i = 0; i < 6; i++) s += person(10 + i * 64, 560 + (i % 2) * 20, 2.2 + (i % 2) * .3, t, { top: ["#e8722a", "#e8722a", "#d86a2a"][i % 3], pants: "#2a2a30", skin: SK[i % 4], hair: i % 3 === 1 ? "bob" : "short", view: "back", back: true, ph: i }); return s + person(250, 420, 2.0, t, { top: "#1a1a1e", pants: "#1a1a1e", skin: SK[2], hair: "bob", hairCol: "#15110e", ph: 3 }) + (inner || ""); }
  shot(23, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return muster(t) + label("سترات النجاة", 120, 130, u, .5, 20, "#fff"); });
  // 24 — the real video: «go back to your cabins and stay calm… everything is under control»
  shot(24, push([200, 320], [210, 320], 1.15, 1.3), function (u, d, t) { return muster(t) + rec2(t, 112, "فيديو ركاب"); });
  // 25 — and meanwhile the ship was filling with water
  shot(25, push([180, 340], [180, 330], 1.2, 1.1), function (u, d, t) { return night(t, WY) + concordia(180, WY, .58, t, { waterIn: clamp(u / d) * .9 + .1, rot: 1.5 * Math.sin(t) }) + seaFront(t, WY + 1, .55) + label("بتتملي مية", 180, 180, u, .5, 24, YEL); });
  // 26 — forty minutes after the impact he finally tells the coast guard: water is coming in
  shot(26, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return bridge(t, 3, captainS(180, 650, 3.8, t, { view: "back", back: true })) + bigNum("40", 100, 140, u, .4, 40) + label("دقيقة", 100, 168, u, .6, 16, "#fff") + label("«فيه مية داخلة»", 230, 150, u, D(26) * .5, 22, YEL); });
  // 27 — the abandon-ship order only at 22:50, more than an hour later
  shot(27, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, WY) + ccFront(190, WY, 1.0, t, { heel: 12 + Math.sin(t) }) + seaFront(t, WY + 1, .55) + watch(180, 200, 46, t, { h: 10.83 }) + label("أمر ترك السفينة", 180, 118, u, .4, 22, YEL); });
  // 28 — she had rolled the other way; the boats on the high side could not be lowered
  shot(28, push([180, 330], [200, 320], 1.3, 1.45), function (u, d, t) { return night(t, WY) + ccFront(180, WY, 1.4, t, { heel: 22 + 1.5 * Math.sin(t * 1.1), people: 18 }) + seaFront(t, WY + 1, .6) + xmark(110, 260, 1, (u - D(28) * .6) / .4) + label("القوارب مش نازلة", 180, 150, u, D(28) * .55, 22, YEL); });
  // 29 — imagine standing on deck at night, the floor tilting, the boat in front of you not going down
  shot(29, push([180, 330], [180, 320], 1.05, 1.2), function (u, d, t) { var tl = lerp(14, 24, clamp(u / d)); return deckN(t, tl, woman(50, 520, 2.6, t, { view: "side" }) + galabeya(300, 540, 2.8, t, { view: "side", flip: true, top: "#3a4a5a", dress: null, pants: "#2a2a30", hat: null }) + worker(160, 700, 5.2, t, { view: "back", back: true, bag: false, hair: "bob", hairCol: "#17120e", top: "#e8722a" })); });
  // 30–32 — the cliffhanger, the bio line over the frozen frame, back to the ship
  function cliff(t, h) { return night(t, WY) + giglio(t, WY, { dx: -80 }) + ccFront(165, WY, 1.2, t, { heel: h + 1.2 * Math.sin(t * 1.3), flicker: true, people: 20 }) + seaFront(t, WY, .7); }
  shot(30, push([180, 320], [180, 330], 1.1, 1.3), function (u, d, t) { return cliff(t, lerp(24, 32, clamp(u / d))); });
  shot(31, push([180, 330], [180, 332], 1.3, 1.36), function (u, d, t) { var k = eout(clamp((u - .3) / .4)); return cliff(t, 32) + G('translate(180 ' + f(150 - (1 - k) * 10) + ')', '<rect x="-92" y="-20" width="184" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.6"/>' + txt("اللينك في البايو ↑", 0, 6, 17, "#1a1a1a", { wt: 900 }), k); });
  shot(32, push([180, 332], [180, 334], 1.36, 1.4), function (u, d, t) { return cliff(t, 33); });
  // 33 — Captain Schettino had left the ship, and was sitting on the shore
  shot(33, push([180, 340], [180, 330], 1.1, 1.2), function (u, d, t) { return shore(t, captainS(120, 470, 2.2, t, { view: "side", hat: null })) + label("على الشط", 180, 150, u, D(33) * .4, 26, YEL); });
  // 34 — he said he slipped and fell into a lifeboat… the policeman noticed his clothes were dry
  shot(34, push([180, 340], [170, 340], 1.2, 1.35), function (u, d, t) { var b = 'M250 270 L' + f(100 + 10 * Math.sin(t)) + ' 300 L' + f(180 + 10 * Math.sin(t)) + ' 320 Z'; return shore(t, '<path d="' + b + '" fill="#fff6c8" opacity=".25"/>' + captainS(130, 470, 2.2, t, { view: "side", hat: null }) + person(270, 470, 2.2, t, { top: "#1a2a4a", pants: "#1a2a4a", skin: SK[0], hat: "officer", hatCol: "#1a2a4a", view: "side", flip: true })) + label("هدومه ناشفة", 180, 150, u, D(34) * .6, 26, YEL); });
  // 35 — and inside the ship, still about a hundred people
  shot(35, push([200, 320], [200, 320], 1.2, 1.3), function (u, d, t) { var b = 'M60 -40 L' + f(170 + 30 * Math.sin(t * .7)) + ' 300 L' + f(230 + 30 * Math.sin(t * .7)) + ' 300 Z'; return night(t, WY) + ccFront(175, WY, 1.3, t, { heel: 64, flicker: true, people: 22 }) + seaFront(t, WY, .7) + '<path d="' + b + '" fill="#fff6c8" opacity=".18"/>' + bigNum("100", 100, 200, u, .5, 48) + label("لسه جوه", 100, 236, u, .9, 20, "#fff"); });
  // 36–38 — 01:46: De Falco calls him: «take your boat under the bow, there's a ladder… I'm recording this call»
  function call(t, u, txtA, txtB, kA, kB) { return R(-220, -220, 800, 1300, "#101420", { s: 0 }) + panelBox(70, 180, office(t, defalcoP(120, 120, .9, t)), "translate(0 -100)", t) + panelBox(258, 180, shore(t, schettinoP(110, 380, .9, t, { sad: true })), "translate(0 -250)", t) + (txtA ? label(txtA, 250, 160, u, kA, 17, YEL) : "") + (txtB ? label(txtB, 250, 350, u, kB, 17, YEL) : ""); }
  shot(36, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { return call(t, u, "دي فالكو", "", .4, 0) + bigNum("1:46", 300, 60, u, D(36) * .3, 30, "#fff"); });
  shot(37, push([180, 320], [180, 314], 1.06, 1.12), function (u, d, t) { return call(t, u, "«اطلع على السلم»", "", .3, 0) + label("● بسجّل المكالمة", 250, 200, u, D(37) * .7, 14, "#ff6a5a"); });
  shot(38, push([180, 314], [180, 320], 1.12, 1.16), function (u, d, t) { return call(t, u, "", "«الدنيا ضلمة»", 0, .4); });
  // 39 — the real call: «there are bodies already, Schettino… you want to go home?»
  shot(39, push([180, 320], [180, 326], 1.16, 1.26), function (u, d, t) { return call(t, u, "", "", 0, 0) + rec2(t, 112, "مكالمة خفر السواحل"); });
  // 40 — Schettino… never went back
  shot(40, push([180, 340], [180, 360], 1.3, 1.1), function (u, d, t) { return shore(t, captainS(150, 470, 2.2, t, { view: "back", back: true, hat: null })) + xmark(180, 200, 1.2, (u - .6) / .4); });
  // 41 — the people of Giglio opened their homes and churches: clothes, food, a place to sleep
  shot(41, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = village(t) + '<circle cx="180" cy="300" r="140" fill="url(#warm)" opacity=".35"/>' + R(140, 250, 80, 150, "#c9b48a", { w: 1.6 }) + P('M136 252 L180 210 L224 252 Z', "#8a6a44", { w: 1.6 }) + R(166, 330, 28, 70, WIN, { w: 1.2 }) + '<path d="M180 210 V190 M172 198 H188" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < 4; i++) s += person(40 + i * 90, 620, 2.4, t, { top: ["#8a6a5a", "#5a6a7a", "#7a5a6a", "#6a7a5a"][i], pants: "#2a2a30", skin: SK[i], hair: i % 2 ? "bob" : "short", view: "back", back: true, walk: true, ph: i }); return s + label("أهل الجزيرة", 180, 140, u, .4, 24, YEL); });
  // 42 — the island's deputy mayor went aboard himself and brought people out until 5:30 in the morning
  shot(42, push([180, 330], [190, 320], 1.1, 1.25), function (u, d, t) { var cy = lerp(250, 180, clamp(u / d)); return night(t, WY) + ccFront(175, WY, 1.3, t, { heel: 66, flicker: true, people: 10 }) + seaFront(t, WY, .7) + '<path d="M160 ' + (WY - 4) + ' L196 190" stroke="#c9a040" stroke-width="2" stroke-dasharray="3 2"/>' + person(lerp(162, 190, clamp(u / d)), lerp(WY - 10, 215, clamp(u / d)), .6, t, { top: "#3a4a5a", pants: "#2a2a30", skin: SK[0] }) + watch(90, 170, 30, t, { h: 5.5 }) + label("نائب العمدة", 180, 120, u, .4, 22, YEL); });
  // 43 — the strangest: the next day, a South Korean newly-wed couple in their cabin, who slept through it all
  shot(43, push([180, 340], [180, 330], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1100, "#1a1a24", { s: 0 }) + G('rotate(-18 180 400)', R(-200, 430, 760, 400, "#3a3040", { s: 0 }) + R(40, 360, 220, 60, "#e8e2d4", { w: 2 }) + R(30, 330, 20, 90, "#5a4632", { w: 1.6 }) + G('translate(150 368)', face("side", { skin: SK[2], hair: "bob", hairCol: "#15110e" }) + G('translate(40 4)', face("side", { skin: SK[0], hair: "short" }))) + R(40, 372, 220, 40, "#c9b8d8", { w: 1.6 }) + R(300, 200, 60, 220, "#6a5a4a", { w: 1.8 })); var bx = 330 - 120 * clamp((u - D(43) * .45) / 1.2); return s + (u > D(43) * .45 ? '<path d="M340 250 L' + f(bx) + ' 380 L' + f(bx + 70) + ' 400 Z" fill="#fff6c8" opacity=".3"/>' : "") + label("تاني يوم", 180, 140, u, .3, 24, YEL); });
  // 44 — thirty-two people died that night
  shot(44, push([180, 320], [180, 340], 1.0, 1.12), function (u, d, t) { return night(t, 330) + seaFront(t, 331, .5) + lights(t, 330, 32) + bigNum("32", 180, 220, u, .4, 70, "#fff") + label("إنسان", 180, 256, u, .9, 22, YEL); });
  // 45 — Schettino got sixteen years in prison, and went in in 2017
  shot(45, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return R(-200, -200, 760, 1100, "#22242a", { s: 0 }) + '<circle cx="180" cy="300" r="200" fill="url(#warm)" opacity=".15"/>' + schettinoP(180, 360, 2.0, t, { sad: true }) + bars(t) + bigNum("16", 90, 180, u, D(45) * .3, 60) + label("سنة سجن", 90, 214, u, D(45) * .3 + .3, 18, "#fff") + label("2017", 280, 190, u, D(45) * .7, 24, "#fff"); });
  // 46 — the ship lay on her side off the island for two and a half years, then was righted and towed away for scrap
  shot(46, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var k = clamp((u - D(46) * .45) / 2); return sky("skyToday") + R(-220, 400, 800, 400, "#3f7aa8", { s: 0 }) + glints(t, 400, 20, "#fff") + giglio(t, 400, { dx: -100 }) + ccFront(200, 400, 1.0, t, { heel: lerp(68, 0, ease(k)), dark: true }) + seaFront(t, 401, .45, "#2a5a80") + photoCard("wreck-giglio.jpg", 120, 210, 160, 104, -3, (u - .3) / .5, "صورة حقيقية · السفينة قدام جيليو") + label("سنتين ونص", 250, 140, u, .6, 22, "#fff"); });
  // 47 — De Falco's «get back on board» became a symbol in Italy for anyone who runs from responsibility
  shot(47, push([180, 330], [180, 320], 1.0, 1.12), function (u, d, t) { return R(-200, -200, 760, 1100, "#1c2230", { s: 0 }) + rays(t, 120, -40, 1.2, 5, 600, .12) + defalcoP(180, 360, 2.2, t) + label("«ارجع على السفينة»", 180, 150, u, .4, 26, YEL); });
  // 48 — tell us
  shot(48, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { return night(t, 420) + '<circle cx="180" cy="300" r="160" fill="url(#warm)" opacity=".18"/>' + concordia(180, 420, .46, t) + seaFront(t, 421, .5) + label("قولولنا!", 180, 180, u, .3, 34, "#fff"); });

  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 8 && i <= 22) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * .9), z = c[2] * (1 + .02 * Math.sin(t * .8)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    CLIPN = 0; SH.sort(function (p, q) { return p.a - q.a; });
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
