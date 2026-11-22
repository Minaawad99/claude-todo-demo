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
  function recOld(t, y) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
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
