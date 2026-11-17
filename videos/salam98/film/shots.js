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

  // ═════════ the shots (line numbers from script.txt; 0, 23 and 30 are the real recording) ═════════
  var WY = 380;
  function stern(t, x, y, s, list, o) { return cutS(x, y, s, t, Object.assign({ list: list, skin: true }, o || {})); }
  // 0 — the recording: «the ship is sinking, captain!» — the ferry listing in the night
  shot(0, push([180, 320], [180, 330], 1.0, 1.14), function (u, d, t) { var l = lerp(12, 24, clamp(u / 7)) + 1.2 * Math.sin(t * 1.3); return night(t, WY) + stern(t, 180, WY, .62, l) + seaFront(t, WY, .7) + rec(t, 112); });
  // 1 — that voice is real: the black box of the Salam 98
  shot(1, push([180, 330], [180, 320], 1.1, 1.22), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#0a1626", { s: 0 }) + rays(t, 120, -40, 1.25, 5, 620, .1) + dust(t, 40, "#9fc4e6", .5, 3); s += P('M-220 440 Q60 410 180 430 T580 420 V900 H-220 Z', "#1a2a3a", { w: 1.6 }) + vdr(180, 400, 1.3, t); return s + label("الصندوق الأسود", 180, 200, u, .5, 28, "#fff") + label("عبّارة السلام 98", 180, 236, u, 1.6, 20, YEL); });
  // 2 — the night of 2 February 2006, in the middle of the Red Sea
  shot(2, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) { return night(t, WY) + ferryN(lerp(260, 180, u / d), WY, .56, t) + seaFront(t, WY + 1, .5) + label("2 فبراير 2006", 180, 170, u, .3, 30, "#fff") + label("البحر الأحمر", 180, 204, u, .8, 18, YEL); });
  // 3 — a ferry going home from Saudi Arabia to Egypt, about 1,400 people aboard
  shot(3, push([210, 330], [150, 330], 1.3, 1.15), function (u, d, t) { return night(t, 400) + ferryN(180, 400, .72, t) + seaFront(t, 401, .5) + bigNum("1,400", 180, 150, u, D(3) * .55, 46) + label("إنسان", 180, 184, u, D(3) * .55 + .4, 20, "#fff") + photoCard("salam98-genoa-2001.jpg", 96, 250, 130, 88, -4, (u - .5) / .5, "صورة حقيقية · 2001"); });
  // 4 — mostly Egyptians: workers with their savings, pilgrims back from the Hajj
  shot(4, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = deckN(t, 0, ""); s += woman(62, 600, 3.3, t, { ph: 2 }) + galabeya(306, 600, 3.5, t, { ph: 1 }) + worker(170, 640, 4.0, t, {}) ; return s + label("عمال راجعين", 110, 130, u, D(4) * .3, 22, "#fff") + (u > D(4) * .62 ? R(-220, -220, 800, 1300, "#000", { s: 0, op: .001 }) : "") + G('', pilgrim(262, 650, 4.0, t, { ph: 3 }), clamp((u - D(4) * .62) / .5)) + label("وحجاج", 268, 130, u, D(4) * .66, 22, YEL); });
  // 5 — how does a ferry sink from the water that was fighting its fire?
  shot(5, push([180, 340], [180, 330], 1.5, 1.3), function (u, d, t) { return cutScene(t, .78, { fire: .9, spr: 1, water: .5 + .3 * clamp(u / d), list: 3 + 4 * clamp(u / d), hlW: 1 }) + label("مية الإطفا؟", 180, 150, u, D(5) * .5, 30, YEL); });
  // 6 — and why did nobody hear a distress call?
  shot(6, push([180, 320], [180, 300], 1.0, 1.12), function (u, d, t) { var s = night(t, 400) + ferryN(250, 400, .2, t, { smokeOff: 1 }) + seaFront(t, 401, .4); for (var k = 0; k < 3; k++) s += '<path d="M' + (150 + k * 22) + ' 330 q-16 -26 0 -52" stroke="#8a94a8" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f2(.25 + .2 * Math.sin(t * 3 + k)) + '"/>'; return s + xmark(160, 300, 1.2, (u - .9) / .5) + label("ولا نداء استغاثة؟", 180, 190, u, .5, 26, "#fff"); });
  // 7 — the story of that night, hour by hour; we start at the port
  shot(7, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDusk") + cloudBank(t, 150, 3, 4, "#f6b070", .5) + R(-220, 420, 800, 500, "url(#seaDawn)", { s: 0 }) + ferryN(180, 420, .5, t, { smokeOff: 1 }) + seaFront(t, 421, .4, "#3a3a5a") + watch(180, 230, 52, t, { h: 6 + u * .5 }) + label("ساعة بساعة", 180, 130, u, .4, 28, "#fff"); });
  // 8 — before nightfall at Duba: passengers boarding, about 220 vehicles loaded into the car deck
  shot(8, push([150, 330], [210, 330], 1.05, 1.15), function (u, d, t) {
    var s = sky("skyDusk") + cloudBank(t, 120, 2, 4, "#f6b070", .5) + mountains(330, ["#8a6a6a", "#6a5060", "#4a3a50"]) + R(-220, 380, 800, 30, "url(#seaDawn)", { s: 0 });
    s += G('translate(250 404) scale(.9)', hullCut({ x: 0, y: 0, t: t, skin: true })) + R(180, 352, 144, 54, "#1a1410", { w: 2 }) + P('M176 404 L328 404 L352 432 L150 432 Z', "#8a8170", { w: 2 });   // the stern door open, the ramp down on the quay
    s += R(-220, 428, 800, 400, "#6a6258", { s: 0 }) + '<path d="M-220 428 H580" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 3; i++) { var cx = ((u * 26 + i * 120) % 360) - 90; s += G('translate(' + f(cx) + ' ' + (462 + i * 4) + ') scale(1.5)', '<path d="M0 0 v-9 l6 -2 l6 -9 h18 l7 9 l8 2 v9 z" fill="' + CARCOL[i * 2 + 1] + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="9" cy="0" r="4.5" fill="#1a1a1a"/><circle cx="36" cy="0" r="4.5" fill="#1a1a1a"/><rect x="14" y="-18" width="16" height="7" fill="' + WIN + '" opacity=".8"/>'); }
    s += woman(40, 600, 2.6, t, { walk: true, ph: 4 }) + galabeya(150, 610, 2.9, t, { walk: true, ph: 2.4 }) + worker(86, 640, 3.4, t, { walk: true, ph: 1 });
    return s + label("مينا ضبا · السعودية", 180, 150, u, .4, 24, "#fff") + bigNum("220", 120, 232, u, D(8) * .7, 44) + label("عربية", 120, 262, u, D(8) * .7 + .3, 18, "#fff"); });
  // 9 — built in Italy in 1970: thirty-six years old
  shot(9, push([180, 320], [180, 310], 1.0, 1.12), function (u, d, t) { return R(-220, -220, 800, 1300, "#2a2218", { s: 0 }) + '<circle cx="180" cy="280" r="260" fill="url(#warm)" opacity=".3"/>' + dust(t, 30, "#ffe2a8", .5, 5) + photoCard("boccaccio-1970s.jpg", 180, 262, 260, 162, -3 + .6 * Math.sin(t * .7), (u - .2) / .5, "صورة حقيقية · باسمها الأول «بوكاتشيو»") + label("إيطاليا · 1970", 180, 130, u, .5, 26, "#fff") + bigNum("36", 150, 432, u, D(9) * .62, 44) + label("سنة", 210, 428, u, D(9) * .62 + .3, 22, "#fff"); });
  // 10 — passenger decks were added on top: taller than she was designed
  shot(10, push([180, 330], [180, 310], 1.25, 1.4), function (u, d, t) { var k = eout(clamp((u - .8) / 1.2)); return night(t, 400) + ferryN(180, 400, .6, t, { smokeOff: 1 }) + seaFront(t, 401, .5) + R(40, 400 - 62 - 20 * k, 250, 3, YEL, { s: 0, op: clamp((u - .8) / .4) }) + arrowL(318, 372, 318, 372 - 40 * k - 10, YEL, (u - .8) / .6) + label("أدوار زيادة", 180, 240, u, 1.0, 26, YEL); });
  // 11 — at night she sailed for Safaga; a routine crossing
  shot(11, push([200, 300], [170, 305], 1.05, 1.15), function (u, d, t) { var m = seaMap(t, .1 * clamp(u / d)), k = clamp((u - .5) / 1.6); return m.svg + '<path d="M' + f(m.a[0]) + ' ' + f(m.a[1]) + ' L' + f(lerp(m.a[0], m.b[0], k)) + ' ' + f(lerp(m.a[1], m.b[1], k)) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 5" fill="none"/>' + pin(m.a, "ضبا", 8, -14, 1) + pin(m.b, "سفاجا", -8, 28, (u - 1.6) / .4) + miniShip(m.ship, t) + label("السعودية", 300, 380, u, .3, 15, "#e8d9b0") + label("مصر", 60, 200, u, .3, 15, "#e8d9b0"); });
  // 12 — smoke from the car deck: fire
  shot(12, push([160, 340], [150, 336], 1.5, 1.9), function (u, d, t) { return cutScene(t, .78, { fire: clamp((u - D(12) * .55) / .8), list: 0 }) + G('translate(142 318)', puff(0, 0, t, 6, 60, 2), clamp(u / .6)) + label("نار في الجراج", 180, 170, u, D(12) * .6, 26, ORANGE); });
  // 13 — sprinklers and fire hoses; the fire dies down and comes back
  shot(13, push([170, 338], [190, 338], 1.7, 1.6), function (u, d, t) { return cutScene(t, .78, { fire: .55 + .4 * Math.sin(u * 1.4 + 1), spr: clamp((u - .3) / .5), water: .2 * clamp(u / d) }) + label("رشاشات المية", 180, 190, u, .8, 22, "#bfe6ff"); });
  // 14 — all that water should drain overboard through scuppers in the car-deck floor
  shot(14, push([292, 340], [300, 342], 3.2, 3.8), function (u, d, t) { var s = cutScene(t, .78, { fire: .4, spr: 1, water: .3 }); for (var i = 0; i < 4; i++) { var p = (t * 1.3 + i / 4) % 1; s += '<circle cx="' + f(329.5) + '" cy="' + f(340 + p * 16) + '" r="1.6" fill="#9fd0f4" opacity="' + f2(1 - p) + '"/>'; } return s + arrowL(318, 322, 326, 334, YEL, (u - .6) / .5, 1.6) + txt("فتحة صرف", 312, 318, 6.5, "#fff", { st: "rgba(0,0,0,.7)", sw: 1.5, op: clamp((u - .8) / .4) }); });
  // 15 — but the scuppers were blocked
  shot(15, push([300, 342], [302, 342], 3.8, 4.2), function (u, d, t) { return cutScene(t, .78, { fire: .4, spr: 1, water: .36, blocked: clamp(u / .4) }) + xmark(323, 334, .28, (u - .4) / .4) + txt("مسدودة", 306, 322, 7.5, "#ff6a4a", { st: "rgba(0,0,0,.7)", sw: 1.5, op: clamp((u - .5) / .3) }); });
  // 16 — remember these scuppers
  shot(16, push([302, 342], [296, 340], 4.2, 3.4), function (u, d, t) { var r = (t * 1.2) % 1; return cutScene(t, .78, { fire: .4, spr: 1, water: .4, blocked: 1 }) + '<circle cx="323" cy="334" r="' + f(4 + r * 14) + '" fill="none" stroke="' + YEL + '" stroke-width="1.2" opacity="' + f2(1 - r) + '"/><circle cx="323" cy="334" r="6" fill="none" stroke="' + YEL + '" stroke-width="1.2"/>'; });
  // 17 — the water kept collecting inside; the car deck is one open hall from end to end
  shot(17, push([180, 336], [180, 340], 1.7, 1.3), function (u, d, t) { return cutScene(t, .78, { fire: .5, spr: 1, water: lerp(.4, .8, clamp(u / d)), blocked: 1, list: 1.2 * Math.sin(t * 1.1), hlW: 1 }) + label("صالة واحدة مفتوحة", 180, 180, u, D(17) * .5, 24, YEL) + arrowL(180, 470 - 30, 70, 440, YEL, (u - D(17) * .5) / .6) + arrowL(180, 440, 290, 440, YEL, (u - D(17) * .5) / .6); });
  // 18 — like a tray of water in your hands: tip it and all the water runs to one side
  shot(18, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var tb = D(18) * .5, a = u < tb ? 1.5 * Math.sin(t * 2) : lerp(0, 22, ease((u - tb) / 1.6)) + 1.2 * Math.sin(t * 3); return R(-220, -220, 800, 1300, "#2a2218", { s: 0 }) + '<circle cx="180" cy="300" r="260" fill="url(#warm)" opacity=".35"/>' + dust(t, 30, "#ffe2a8", .5, 8) + G('translate(180 330) scale(.62)', tray(0, 0, a, 300 * 22, t)) + label("زي صينية مية", 180, 170, u, .4, 26, "#fff"); });
  // 19 — Duba was still close, but she carried on for Safaga
  shot(19, push([200, 300], [180, 300], 1.15, 1.25), function (u, d, t) { var m = seaMap(t, .12 + .12 * clamp(u / d)), tb = D(19) * .45, k = clamp((u - .6) / .6); return m.svg + '<path d="M' + f(m.ship[0]) + ' ' + f(m.ship[1]) + ' L' + f(m.b[0]) + ' ' + f(m.b[1]) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 5" fill="none"/>' + pin(m.a, "ضبا", 8, -14, 1) + pin(m.b, "سفاجا", -8, 28, 1) + miniShip(m.ship, t) + arrowL(m.ship[0] + 6, m.ship[1] - 16, m.a[0] - 6, m.a[1] - 8, YEL, k, 2.4) + xmark((m.ship[0] + m.a[0]) / 2, (m.ship[1] + m.a[1]) / 2 - 12, .6, (u - tb) / .4) + label("كملت…", 110, 170, u, tb + .3, 26, YEL); });
  // 20 — an hour… two… three; the list to starboard grows
  shot(20, push([180, 336], [180, 340], 1.35, 1.25), function (u, d, t) { var l = lerp(3, 14, clamp(u / d)) + .6 * Math.sin(t * 1.4); return cutScene(t, .78, { fire: .5 + .3 * Math.sin(u * 2), spr: 1, water: .9, blocked: 1, list: l, hlW: 1, slide: .1 }) + watch(84, 190, 34, t, { h: 9.5 + u * .7 }) + label("الميل بيزيد", 240, 196, u, D(20) * .6, 22, YEL); });
  // 21 — on the recording the captain tells the crew: calm the people down
  shot(21, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return bridge(t, 12 + Math.sin(t), G('rotate(4 180 600)', officer(110, 680, 4.6, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e" }) + officer(280, 670, 4.2, t, { view: "side", flip: true, ph: 2 }))) + label("«هدّوا الناس»", 180, 120, u, D(21) * .55, 26, YEL); });
  // 22 — an hour after midnight, this is what the wheelhouse sounded like
  shot(22, push([180, 320], [180, 326], 1.0, 1.12), function (u, d, t) { return night(t, WY) + stern(t, 180, WY, .62, 18 + Math.sin(t * 1.3)) + seaFront(t, WY, .7) + watch(180, 190, 40, t, { h: 1.1 }) + label("بعد نص الليل بساعة", 180, 120, u, .3, 22, "#fff"); });
  // 23 — the recording: «we are down 20 degrees now… the ship will roll over!»
  shot(23, push([180, 336], [180, 340], 1.2, 1.35), function (u, d, t) { return cutScene(t, .78, { fire: .4, spr: .6, water: 1, blocked: 1, list: 20 + .9 * Math.sin(t * 1.4), hlW: 1, slide: .3 }) + rec(t, 112) + bigNum("20°", 180, 232, u, .6, 46); });
  // 24 — the captain ordered: everyone to port!
  shot(24, push([200, 330], [170, 330], 1.0, 1.08), function (u, d, t) { var inner = ""; for (var i = 0; i < 6; i++) inner += CAST[i](360 - ((u * 34 + i * 78) % 470), 500 + (i % 3) * 44, 2.4 + (i % 3) * .5, t, { walk: true, flip: true, ph: i * 1.7 }); return deckN(t, 12, inner) + label("«كله شمال!»", 180, 150, u, D(24) * .2, 30, YEL) + arrowL(250, 190, 110, 190, "#fff", (u - D(24) * .3) / .6, 4); });
  // 25 — imagine standing on the deck in the dark, the floor tilting under your feet, no life jacket to be found
  shot(25, push([180, 330], [180, 320], 1.05, 1.2), function (u, d, t) { var tl = lerp(14, 22, clamp(u / d)); return deckN(t, tl, woman(50, 520, 2.6, t, { view: "side" }) + galabeya(300, 540, 2.8, t, { view: "side", flip: true }) + worker(160, 700, 5.2, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e", bag: false })); });
  // 26–28 — the cliffhanger, the bio line over the frozen frame, back to the ferry
  function cliff(t, l) { return night(t, WY) + stern(t, 180, WY, .62, l + 1.2 * Math.sin(t * 1.3)) + seaFront(t, WY, .7); }
  shot(26, push([180, 320], [180, 330], 1.1, 1.3), function (u, d, t) { return cliff(t, lerp(22, 30, clamp(u / d))); });
  shot(27, push([180, 330], [180, 332], 1.3, 1.36), function (u, d, t) { var k = eout(clamp((u - .3) / .4)); return cliff(t, 30) + G('translate(180 ' + f(150 - (1 - k) * 10) + ')', '<rect x="-92" y="-20" width="184" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.6"/>' + txt("اللينك في البايو ↑", 0, 6, 17, "#1a1a1a", { wt: 900 }), k); });
  shot(28, push([180, 332], [180, 334], 1.36, 1.4), function (u, d, t) { return cliff(t, 31); });
  // 29 — 01:30: she rolls over to starboard… and goes down
  shot(29, push([180, 334], [180, 380], 1.2, 1.0), function (u, d, t) { var k = ease((u - D(29) * .3) / 2.0), k2 = clamp((u - D(29) * .3 - 1.6) / 2.2); return night(t, WY) + cutS(180 + 26 * k, WY + 20 * k + 250 * k2, .62, t, { list: lerp(31, 118, k), skin: k < .5, water: 1, slide: 1, blocked: 1 }) + seaFront(t, WY, .78) + G('translate(-100 -30) scale(.62) translate(180 600)', k > .5 ? bubblesW(380, 430, t) : "") + bigNum("1:30", 180, 170, u, .3, 46) + label("بعد نص الليل", 180, 204, u, .6, 18, "#fff"); });
  // 30 — the recording: «the ship has sunk, captain… there is no power but God's…» — the sea closed over her
  shot(30, push([180, 330], [180, 350], 1.0, 1.14), function (u, d, t) { return night(t, 340) + seaFront(t, 341, .6) + vests(t, 340, 5) + lights(t, 340, 0) + G('translate(-60 60) scale(.6)', bubblesW(380, 430, t)) + rec(t, 112); });
  // 31 — among the last sounds recorded: the box goes down with her
  shot(31, push([180, 300], [180, 360], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#07101e", { s: 0 }) + dust(t, 50, "#9fc4e6", .5, 3) + vdr(180, lerp(240, 400, clamp(u / d)), 1.0, t) + G('translate(-60 0) scale(.6)', bubblesW(380, 430, t)); });
  // 32 — nobody outside heard a distress call from the ferry
  shot(32, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#141a26", { s: 0 }) + '<circle cx="180" cy="300" r="240" fill="url(#warm)" opacity=".14"/>' + dust(t, 24, "#9fc4e6", .4, 9) + G('translate(160 330) scale(.82)', radio(0, 0)); for (var k = 0; k < 3; k++) s += '<path d="M' + (60 + k * 20) + ' 240 q-16 -30 0 -60" stroke="#8a94a8" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f2(.25 + .2 * Math.sin(t * 3 + k)) + '"/>'; return s + xmark(80, 210, 1.3, (u - .8) / .5) + label("ولا نداء استغاثة", 180, 140, u, .5, 24, "#fff"); });
  // 33 — the alarm came from an automatic beacon that floats free and signals the satellite
  shot(33, push([180, 340], [180, 320], 1.5, 1.3), function (u, d, t) { return night(t, 370) + G('translate(180 300)', rings(0, 0, t, 3, "#ffd45a", 110)) + G('translate(180 378) scale(.7)', epirb(0, 0, t)) + seaFront(t, 372, .75) + label("جهاز أوتوماتيك", 180, 190, u, .6, 24, YEL); });
  // 34 — picked up at a rescue base in Scotland, then France, then Egypt
  shot(34, push([180, 300], [180, 310], 1.0, 1.1), function (u, d, t) {
    var gl = GEO.globe(180, 330, 190, 14, 42), a = gl.project([34.9, 27]), b = gl.project([-3.56, 57.65]), c = gl.project([2.3, 46.5]), e = gl.project([31.2, 30.05]), sat = [200, 96], T1 = D(34) * .2, T2 = D(34) * .62, T3 = D(34) * .8;
    function hop(p, q, k) { k = clamp(k); return k <= 0 ? "" : '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(lerp(p[0], q[0], k)) + ' ' + f(lerp(p[1], q[1], k)) + '" stroke="' + YEL + '" stroke-width="2.2" stroke-dasharray="6 5" stroke-dashoffset="' + f(-t * 30) + '"/>'; }
    var s = R(-220, -220, 800, 1300, "#07101e", { s: 0 }) + stars(t, 80, 640) + '<path d="' + gl.sphere + '" fill="#16345a" stroke="' + INK + '" stroke-width="2"/><path d="' + gl.grat + '" fill="none" stroke="#3a5a86" stroke-width=".6"/><path d="' + gl.land + '" fill="#7a8a5a" stroke="' + INK + '" stroke-width="1"/>';
    s += G('translate(' + sat[0] + ' ' + f(sat[1] + 3 * Math.sin(t * 1.2)) + ') scale(.7)', satellite(0, 0, t)) + hop(a, [sat[0], sat[1] + 20], (u - .2) / .6) + hop([sat[0], sat[1] + 20], b, (u - T1) / .6) + hop(b, c, (u - T2) / .4) + hop(c, e, (u - T3) / .5);
    return s + Ci(a[0], a[1], 4, ORANGE) + (u > T1 + .5 ? Ci(b[0], b[1], 4, YEL) + txt("اسكتلندا", b[0] - 8, b[1] - 10, 15, "#fff", { st: "rgba(0,0,0,.7)", sw: 3, wt: 900 }) : "") + (u > T2 + .3 ? Ci(c[0], c[1], 3.5, YEL) + txt("فرنسا", c[0] - 30, c[1] + 6, 13, "#fff", { st: "rgba(0,0,0,.7)", sw: 3, wt: 900 }) : "") + (u > T3 + .4 ? Ci(e[0], e[1], 3.5, YEL) + txt("مصر", e[0] - 22, e[1] + 16, 13, "#fff", { st: "rgba(0,0,0,.7)", sw: 3, wt: 900 }) : ""); });
  // 35 — people in the sea, in the dark and the swell, holding on to anything that floats
  shot(35, push([170, 330], [190, 340], 1.0, 1.12), function (u, d, t) { return night(t, 250) + seaFront(t, 252, .35) + G('translate(250 300) scale(.5)', raft(0, 0, t)) + seaPeople(t, 250, 6) + seaFront(t, 470, .35) + G('translate(96 440) rotate(' + f(4 * Math.sin(t)) + ')', R(-40, -5, 80, 10, "#8a6a44", { w: 1.4 })); });
  // 36 — another ferry of the same company was at sea that night, and did not come
  shot(36, push([160, 320], [200, 320], 1.0, 1.1), function (u, d, t) { return night(t, 330) + ferryN(lerp(250, 330, clamp(u / d)), 330, .22, t) + seaFront(t, 331, .5) + head(110, 400, 1.6, t, 1) + head(220, 430, 1.9, t, 3) + label("عبّارة تانية… وماراحتش", 180, 170, u, D(36) * .55, 22, YEL); });
  // 37 — rescue came after long hours
  shot(37, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDawnT") + R(-220, 400, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 400, 30, "#f6d8b0") + G('translate(120 418) scale(.5)', raft(0, 0, t)) + steamerR(lerp(380, 250, eout(clamp(u / d))), 404, t) + seaFront(t, 402, .35, "#3a3a5a") + photoCard("rescue-ir.jpg", 180, 220, 200, 140, 2, (u - .3) / .5, "صورة حقيقية · الإنقاذ (البحرية الأمريكية)") + label("بعد ساعات طويلة", 180, 110, u, .4, 22, "#fff"); });
  function steamerR(x, y, t) { return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2)) + ')', P('M-60 0 L-70 -14 L50 -14 L64 0 Z', "#8a929c", { w: 1.6 }) + R(-30, -30, 50, 16, "#e8e4d8", { w: 1.2 }) + R(-14, -42, 20, 12, "#e8e4d8", { w: 1.2 }) + '<path d="M-4 -42 v-22 M-12 -56 h16" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-4" cy="-66" r="2.4" fill="#ffe9a8"/>'); }
  // 38 — of about 1,400 only 388 lived
  shot(38, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDawnT") + R(-220, 420, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 420, 30, "#f6d8b0") + G('translate(180 440) scale(.6)', raft(0, 0, t)) + seaFront(t, 422, .3, "#3a3a5a") + bigNum("388", 180, 230, u, D(38) * .45, 70) + label("نجوا بس", 180, 272, u, D(38) * .45 + .4, 22, "#fff") + label("من 1,400", 180, 150, u, .3, 22, "#fff"); });
  // 39 — more than a thousand people died that night
  shot(39, push([180, 320], [180, 340], 1.0, 1.12), function (u, d, t) { return night(t, 330) + seaFront(t, 331, .5) + lights(t, 330, 40) + bigNum("+1,000", 180, 210, u, .4, 60, "#fff") + label("إنسان", 180, 250, u, .9, 22, YEL); });
  // 40 — in Safaga the families stood at the port gate for days, waiting for a name on a list
  shot(40, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyDusk") + cloudBank(t, 130, 2, 4, "#f6b070", .5) + R(-220, 420, 800, 500, "#5a5248", { s: 0 }) + R(40, 180, 26, 250, "#c9b48a", { w: 2 }) + R(294, 180, 26, 250, "#c9b48a", { w: 2 }) + R(30, 150, 300, 40, "#3a5a8a", { w: 2 }) + txt("ميناء سفاجا", 180, 178, 20, "#fff", { wt: 900 });
    for (var b = 0; b < 12; b++) s += R(70 + b * 19, 250, 4, 180, "#2a2e3a", { w: .8 }); s += R(66, 250, 228, 6, "#2a2e3a", { w: .8 }) + G('translate(307 300) rotate(2)', R(-16, -30, 32, 60, "#f6f1e4", { w: 1.2 }) + [0, 1, 2, 3, 4, 5, 6].map(function (q) { return '<path d="M-11 ' + (-22 + q * 7) + ' h22" stroke="#3a3428" stroke-width="1.2"/>'; }).join(""));
    s += woman(50, 640, 3.6, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e" }) + worker(320, 650, 3.8, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e", bag: false, ph: 3 }) + woman(236, 670, 4.0, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e", ph: 2 }) + galabeya(140, 690, 4.4, t, { view: "back", back: true, hair: "bob", hairCol: "#17120e", ph: 1 });
    return s; });
  // 41 — weeks later the black box came up from the seabed, with the voices you heard
  shot(41, push([180, 360], [180, 300], 1.2, 1.1), function (u, d, t) { var y = lerp(430, 250, clamp(u / d)); return R(-220, -220, 800, 1300, "#07101e", { s: 0 }) + rays(t, 150, -60, 1.3, 5, 640, .12) + dust(t, 50, "#9fc4e6", .5, 3) + '<path d="M180 -200 V' + f(y - 60) + '" stroke="#8a929c" stroke-width="2.4"/>' + P('M160 ' + f(y - 60) + ' h40 l8 26 h-12 l-4 -12 h-24 l-4 12 h-12 Z', "#8a929c", { w: 1.6 }) + vdr(180, y, .9, t) + P('M-220 520 Q60 490 180 510 T580 500 V900 H-220 Z', "#1a2a3a", { w: 1.6 }); });
  // 42 — remember the scuppers? the inquiry: the trapped fire-fighting water rolled her over, not the fire
  shot(42, push([200, 338], [180, 338], 1.6, 1.3), function (u, d, t) { return cutScene(t, .78, { fire: .5, water: .95, blocked: 1, list: 12 + .8 * Math.sin(t * 1.4), hlW: 1, slide: .1 }) + label("مية الإطفا", 110, 176, u, D(42) * .4, 26, YEL) + label("مش النار", 262, 176, u, D(42) * .82, 24, "#fff"); });
  // 43 — the owner left Egypt: acquitted at first, then seven years in prison, in his absence
  shot(43, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { var T1 = D(43) * .3, T2 = D(43) * .52, px = lerp(-40, 300, clamp(u / (T1 + .6))), py = lerp(330, 150, clamp(u / (T1 + .6)));
    var s = sky("skyDusk") + cloudBank(t, 200, 4, 4, "#f6b070", .5) + G('translate(' + f(px) + ' ' + f(py) + ') rotate(-18)', P('M-40 0 Q-30 -8 30 -6 Q44 -4 46 0 Q44 4 30 6 Q-30 8 -40 0 Z', "#e8e4d8", { w: 1.4 }) + P('M-4 -4 L-20 -30 L-8 -30 L12 -4 Z M-4 4 L-20 30 L-8 30 L12 4 Z M-36 -2 L-46 -16 L-40 -16 L-28 -2 Z', "#c9c3b4", { w: 1.2 }));
    s += R(-220, 470, 800, 400, "#2a2420", { s: 0 }) + G('translate(180 380) scale(.7)', gavel(0, 0, u > T2 ? 1 - Math.abs(Math.sin(clamp((u - T2) / .5) * Math.PI)) * .6 : .2));
    return s + label("براءة · 2008", 100, 250, u, T1, 22, "#fff") + xmark(100, 244, 1.2, (u - T2) / .4) + bigNum("7", 262, 262, u, T2 + .2, 64) + label("سنين سجن · 2009", 250, 296, u, T2 + .5, 17, "#fff") + label("وهو غايب", 180, 130, u, D(43) * .86, 24, YEL); });
  // 44 — and the other ferry? its master got six months for not going
  shot(44, push([200, 320], [170, 320], 1.0, 1.1), function (u, d, t) { return night(t, 380) + ferryN(180, 380, .4, t) + seaFront(t, 381, .5) + bigNum("6", 150, 220, u, D(44) * .4, 64) + label("شهور", 210, 214, u, D(44) * .4 + .3, 24, "#fff"); });
  // 45 — more than a thousand homes in Egypt still remember the night of 2 February
  shot(45, push([180, 330], [180, 310], 1.0, 1.12), function (u, d, t) { return village(t) + label("2 فبراير 2006", 180, 150, u, D(45) * .6, 28, "#fff"); });
  // 46 — tell us: which story next time?
  shot(46, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { return night(t, 420) + '<circle cx="180" cy="300" r="160" fill="url(#warm)" opacity=".18"/>' + ferryN(180, 420, .46, t) + seaFront(t, 421, .5) + label("قولولنا!", 180, 180, u, .3, 34, "#fff"); });

  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 8 && i <= 20) ? .9 : 0; };
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
