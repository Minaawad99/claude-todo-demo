// «How plasma donation works» — the drawings (PL.*), in the «اسكتش» hand: ink lines, flat fills, light hatching.
// Real shapes (refs/SOURCES.md):
//  · the machine after the photo of a Fresenius Aurora plasmapheresis system (Andykatib, CC0, Commons): a white tower on a
//    wheeled stand, a head unit with the touch screen top left and a round red stop button, a front panel with three round
//    grey roller pumps with blue clips, small round valve clamps, the separation chamber (a red cylinder) top right, the
//    collection container hanging lower right, a pole on top for the saline bag. US centres hang a hard plastic bottle.
//  · the arm after «Plasmapheresis line full» (RexxS, CC BY-SA 4.0, Commons): the forearm on a white pad, a green
//    butterfly needle taped at the inside of the elbow, a dark red tube with a clear clamp, a navy pressure cuff on the
//    upper arm.
//  · the bowl: the Latham-type centrifuge bowl of US plasma machines, cut open: blood in at the centre, red cells packed
//    against the outer wall, plasma out from the core.
var PL = (function () {
  var WHITE = "#f4f1e8", WHITE_D = "#d9d4c6", PUMP = "#c9c7c0", CLIP = "#6f9ccf", SCREEN = "#cfe0ea", RED = "#9c2a26", RED_D = "#6e1c1a",
      PLASMA = "#e9b64a", PLASMA_L = "#f3d27c", SKINC = "#e0a98a", SKIND = "#c07f62", NAVY = "#2f3d55", GREEN = "#3c9a5f", CHAIR = "#5d6b62", CHAIR_D = "#46524a";

  function shape(pts, fill, sw) { return P("M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z", fill, sw); }
  function line(pts, col, w, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
  function tube(d, col, w, flow, t) {   // a tube: ink outline, coloured core, and dashes running along it when blood flows
    var s = '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
    if (flow) s += '<path d="' + d + '" stroke="#fff" stroke-opacity=".55" stroke-width="' + f(w * .35) + '" fill="none" stroke-dasharray="6 16" stroke-dashoffset="' + f(-(t || 0) * 40 * flow) + '"/>';
    return s;
  }

  // ── the plastic collection bottle (US centres): o.k = how full (0..1) ──
  function bottle(x, y, s, k, o) {
    o = o || {}; var w = 52 * s, h = 92 * s, lvl = y + h - (h - 8 * s) * clamp(k), id = "bt" + (++CLIPN);
    var body = "M" + f(x - w / 2) + " " + f(y + 10 * s) + " Q" + f(x - w / 2) + " " + f(y) + " " + f(x - w / 2 + 10 * s) + " " + f(y) + " H" + f(x + w / 2 - 10 * s) + " Q" + f(x + w / 2) + " " + f(y) + " " + f(x + w / 2) + " " + f(y + 10 * s) +
      " V" + f(y + h - 6 * s) + " Q" + f(x + w / 2) + " " + f(y + h) + " " + f(x + w / 2 - 6 * s) + " " + f(y + h) + " H" + f(x - w / 2 + 6 * s) + " Q" + f(x - w / 2) + " " + f(y + h) + " " + f(x - w / 2) + " " + f(y + h - 6 * s) + " Z";
    var s1 = '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="#f7f4ec" fill-opacity=".85"/>' +
      '<g clip-path="url(#' + id + ')"><rect x="' + f(x - w) + '" y="' + f(lvl) + '" width="' + f(2 * w) + '" height="' + f(h) + '" fill="' + PLASMA + '"/>' +
      '<path d="M' + f(x - w) + ' ' + f(lvl) + ' H' + f(x + w) + '" stroke="' + PLASMA_L + '" stroke-width="' + f(3 * s) + '"/>' +
      '<rect x="' + f(x - w / 2 + 6 * s) + '" y="' + f(y + 4 * s) + '" width="' + f(6 * s) + '" height="' + f(h - 12 * s) + '" fill="#fff" opacity=".45"/></g>' +
      '<path d="' + body + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.2) + '"/>' +
      R(x - 10 * s, y - 12 * s, 20 * s, 12 * s, "#e8e3d6", 1.8) +   // the cap
      R(x + 4 * s, y + 26 * s, 18 * s, 30 * s, "#fbf8f1", 1.2) + line([[x + 7 * s, y + 31 * s], [x + 7 * s, y + 51 * s]], INK, 1) + line([[x + 10 * s, y + 31 * s], [x + 10 * s, y + 51 * s]], INK, 1.6) + line([[x + 14 * s, y + 31 * s], [x + 14 * s, y + 51 * s]], INK, .8) + line([[x + 17 * s, y + 31 * s], [x + 17 * s, y + 51 * s]], INK, 1.4);   // the barcode label
    for (var i = 1; i < 5; i++) s1 += line([[x - w / 2, y + h * i / 5], [x - w / 2 + 8 * s, y + h * i / 5]], INK, 1.2);   // graduation ticks
    return s1;
  }
  // a soft clear saline bag hanging from a hook
  function salineBag(x, y, s) {
    return line([[x, y - 18 * s], [x, y]], INK, 2) + P("M" + f(x - 24 * s) + " " + f(y) + " H" + f(x + 24 * s) + " Q" + f(x + 28 * s) + " " + f(y + 50 * s) + " " + f(x + 18 * s) + " " + f(y + 78 * s) + " H" + f(x - 18 * s) + " Q" + f(x - 28 * s) + " " + f(y + 50 * s) + " " + f(x - 24 * s) + " " + f(y) + " Z", "#e7eef0", 2) +
      '<rect x="' + f(x - 18 * s) + '" y="' + f(y + 22 * s) + '" width="' + f(36 * s) + '" height="' + f(46 * s) + '" fill="' + BLUE + '" opacity=".18"/>' + T("SALINE", x, y + 18 * s, 9 * s, BLUE, 800) + line([[x, y + 78 * s], [x, y + 92 * s]], INK, 3);
  }

  // ── the machine: x = left edge, y = top of the head unit, s = scale (width 220 at s = 1) ──
  // o.k: bottle fill · o.spin: rotor angle (rad) · o.flow: tubes running · o.on: screen lit · o.glow: chamber highlight 0..1
  function machine(x, y, s, o, t) {
    o = o || {}; t = t || 0; var W = 220 * s, J = {};
    function X(u) { return x + u * s; } function Y(v) { return y + v * s; }
    var sv = "";
    // stand: pole, base with wheels
    sv += R(X(92), Y(430), 36 * s, 150 * s, WHITE_D, 2) + shape([[X(30), Y(590)], [X(190), Y(590)], [X(200), Y(604)], [X(20), Y(604)]], WHITE_D, 2) + C(X(36), Y(612), 8 * s, "#4a4a48", 1.6) + C(X(184), Y(612), 8 * s, "#4a4a48", 1.6);
    // the saline pole and bag
    sv += line([[X(120), Y(0)], [X(120), Y(-70)], [X(150), Y(-70)]], "#9a968c", 5 * s) + salineBag(X(150), Y(-52), .75 * s);
    // head unit
    sv += P("M" + f(X(0)) + " " + f(Y(18)) + " Q" + f(X(0)) + " " + f(Y(0)) + " " + f(X(18)) + " " + f(Y(0)) + " H" + f(X(202)) + " Q" + f(X(220)) + " " + f(Y(0)) + " " + f(X(220)) + " " + f(Y(18)) + " V" + f(Y(128)) + " H" + f(X(0)) + " Z", WHITE, 2.4);
    sv += R(X(14), Y(20), 84 * s, 64 * s, INK, 1.8, 4) + R(X(19), Y(25), 74 * s, 54 * s, o.on === false ? "#9fb0b8" : SCREEN, 0);
    if (o.on !== false) {   // the screen: volume collected, time, cycle
      sv += T((o.ml != null ? o.ml : Math.round(880 * clamp(o.k || 0))) + " mL", X(56), Y(45), 11 * s, INK, 800) + R(X(25), Y(54), 62 * s, 7 * s, "#fbf8f1", 1) + R(X(25), Y(54), 62 * s * clamp(o.k || 0), 7 * s, PLASMA, 1) +
        line([[X(25), Y(70)], [X(48), Y(70)]], BLUE, 2) + line([[X(56), Y(70)], [X(86), Y(70)]], BLUE, 2);
    }
    sv += C(X(132), Y(56), 11 * s, "#f0ece2", 1.6) + C(X(132), Y(56), 6.5 * s, "#c8352c", 1.4) + R(X(150), Y(36), 58 * s, 20 * s, "#f0ece2", 1.2, 3) + line([[X(156), Y(46)], [X(200), Y(46)]], BLUE, 2.4);
    // the front panel
    sv += R(X(10), Y(128), 200 * s, 300 * s, WHITE, 2.4, 6) + hatch("M" + f(X(10)) + " " + f(Y(128)) + " h" + f(200 * s) + " v" + f(10 * s) + " h" + f(-200 * s) + " Z");
    // pumps: round grey drums with a blue clip, the rotor turning
    var pumps = [[60, 250], [130, 205], [62, 330]], spin = o.spin || 0;
    pumps.forEach(function (p, i) {
      var cx = X(p[0]), cy = Y(p[1]), r = 27 * s;
      sv += C(cx, cy, r + 4 * s, "#dedbd2", 1.8) + C(cx, cy, r, PUMP, 2);
      for (var k = 0; k < 2; k++) { var a = spin * (i % 2 ? -1 : 1) + k * Math.PI; sv += C(cx + Math.cos(a) * r * .62, cy + Math.sin(a) * r * .62, 5 * s, "#9d9a92", 1.4); }
      sv += line([[cx - Math.cos(spin) * r * .62, cy - Math.sin(spin) * r * .62 * (i % 2 ? -1 : 1)], [cx + Math.cos(spin) * r * .62, cy + Math.sin(spin) * r * .62 * (i % 2 ? -1 : 1)]], "#8a877f", 3 * s);
      sv += R(cx - r - 10 * s, cy - 8 * s, 12 * s, 16 * s, CLIP, 1.6, 3);
    });
    J.pumps = pumps.map(function (p) { return [X(p[0]), Y(p[1])]; });
    // valve clamps
    [[48, 160], [128, 288], [130, 352], [180, 400]].forEach(function (p) { sv += C(X(p[0]), Y(p[1]), 10 * s, "#e6e2d8", 1.6) + R(X(p[0]) - 4 * s, Y(p[1]) - 6 * s, 8 * s, 12 * s, "#bdb9ae", 1.2); });
    // the separation chamber (the spinning bowl) top right: housing, window, the red rotor inside
    var bx = X(176), by = Y(148);
    var bh = 78 * s, glow = o.glow || 0;
    sv += R(bx - 30 * s, by + 4 * s, 60 * s, 104 * s, "#3f4446", 2.2, 6) + R(bx - 26 * s, by + 8 * s, 52 * s, 96 * s, "#5a6064", 0, 4);   // the centrifuge window: the bowl in its well
    sv += '<g transform="translate(' + f(bx) + ' ' + f(by + 64 * s) + ') scale(' + f(.17 * s) + ') translate(-320 -430)">' + centrifuge(320, 430, 150, { fill: o.flow ? 1 : 0, sep: o.flow ? 1 : 0, w: o.flow ? 1 : 0, a: spin * 1.3, noArrows: true, flowIn: o.flow ? 1 : 0, flowOut: o.flow ? 1 : 0 }, t) + '</g>';
    if (glow > 0) sv += R(bx - 36 * s, by - 2 * s, 72 * s, 116 * s, "none", 3, 8, ' stroke="' + ORANGE + '" stroke-dasharray="7 6" opacity="' + f(glow) + '"');
    sv += R(bx + 18 * s, by + 56 * s, 16 * s, 20 * s, "#ebe8df", 1.6, 3) + R(bx + 26 * s, by + 60 * s, 10 * s, 12 * s, CLIP, 1.2, 2);
    J.bowl = [bx, by + 22 * s + bh / 2];
    // tubing on the panel: whole blood (dark red), plasma (yellow), saline (clear)
    var fl = o.flow ? 1 : 0;
    sv += tube("M" + f(X(-4)) + " " + f(Y(392)) + " C" + f(X(20)) + " " + f(Y(392)) + " " + f(X(24)) + " " + f(Y(360)) + " " + f(X(38)) + " " + f(Y(340)), RED, 4 * s, fl, t) +
      tube("M" + f(X(62)) + " " + f(Y(302)) + " C" + f(X(50)) + " " + f(Y(290)) + " " + f(X(40)) + " " + f(Y(270)) + " " + f(X(42)) + " " + f(Y(250)) + " M" + f(X(84)) + " " + f(Y(236)) + " C" + f(X(104)) + " " + f(Y(228)) + " " + f(X(110)) + " " + f(Y(214)) + " " + f(X(110)) + " " + f(Y(208)) + " M" + f(X(150)) + " " + f(Y(196)) + " C" + f(X(160)) + " " + f(Y(190)) + " " + f(X(166)) + " " + f(Y(180)) + " " + f(X(170)) + " " + f(Y(172)), RED, 4 * s, fl, t) +
      tube("M" + f(X(190)) + " " + f(Y(250)) + " C" + f(X(196)) + " " + f(Y(300)) + " " + f(X(196)) + " " + f(Y(380)) + " " + f(X(190)) + " " + f(Y(436)), PLASMA, 4 * s, fl, t) +
      tube("M" + f(X(150)) + " " + f(Y(-12)) + " C" + f(X(150)) + " " + f(Y(30)) + " " + f(X(230)) + " " + f(Y(90)) + " " + f(X(208)) + " " + f(Y(140)) + " S" + f(X(110)) + " " + f(Y(150)) + " " + f(X(60)) + " " + f(Y(160)), "#dfe8ea", 3 * s, 0, t);
    // the bottle hangs on a bracket lower right
    sv += R(X(160), Y(430), 56 * s, 10 * s, WHITE_D, 1.6) + line([[X(188), Y(440)], [X(188), Y(448)]], INK, 2) + bottle(X(188), Y(458), .9 * s, o.k || 0);
    J.bottle = [X(188), Y(500)]; J.inlet = [X(-4), Y(392)]; J.screen = [X(56), Y(52)];
    return { svg: sv, J: J };
  }

  // ── the donor chair (a padded recliner, side three-quarter): x = centre of the seat, y = floor ──
  function chair(x, y, s) {
    function X(u) { return x + u * s; } function Y(v) { return y + v * s; }
    return R(X(-70), Y(-14), 12 * s, 14 * s, "#4a4a48", 1.4) + R(X(58), Y(-14), 12 * s, 14 * s, "#4a4a48", 1.4) +
      R(X(-80), Y(-44), 160 * s, 32 * s, "#8c8c86", 2, 4) +
      P("M" + f(X(-92)) + " " + f(Y(-210)) + " Q" + f(X(-96)) + " " + f(Y(-300)) + " " + f(X(-70)) + " " + f(Y(-320)) + " H" + f(X(70)) + " Q" + f(X(96)) + " " + f(Y(-300)) + " " + f(X(92)) + " " + f(Y(-210)) + " Z", CHAIR, 2.4) +   // the back
      R(X(-100), Y(-150), 200 * s, 106 * s, CHAIR, 2.4, 12) + R(X(-84), Y(-150), 168 * s, 40 * s, CHAIR_D, 0, 0, ' opacity=".5"') +
      R(X(-126), Y(-176), 40 * s, 120 * s, CHAIR_D, 2.2, 10) + R(X(86), Y(-176), 40 * s, 120 * s, CHAIR_D, 2.2, 10);   // armrests
  }
  // the long padded arm board the donor's arm rests on (white pad on top, as in the photo)
  function armBoard(x, y, w, s) { return R(x, y, w, 22 * s, CHAIR_D, 2.2, 8) + R(x + 6 * s, y - 6 * s, w - 12 * s, 9 * s, "#f6f3ea", 1.6, 4); }

  // ── the arm close-up (after the photo): x0,y0 = the inside of the elbow; the hand off to the left ──
  // o.k: tube filled (0..1) · o.flow: −1 return, +1 draw · o.squeeze: the fist pumps · o.needle: 0..1 the needle slides in
  function arm(x0, y0, s, o, t) {
    o = o || {}; t = t || 0; var sv = "";
    function X(u) { return x0 + u * s; } function Y(v) { return y0 + v * s; }
    // the pad
    sv += P("M" + f(X(-520)) + " " + f(Y(40)) + " Q" + f(X(-300)) + " " + f(Y(20)) + " " + f(X(-80)) + " " + f(Y(54)) + " L" + f(X(260)) + " " + f(Y(60)) + " L" + f(X(260)) + " " + f(Y(170)) + " L" + f(X(-520)) + " " + f(Y(170)) + " Z", "#f6f3ea", 1.8);
    // the forearm from the wrist (left) to the elbow, the upper arm into the cuff (right)
    var top = [[-430, -24], [-300, -34], [-160, -50], [-40, -58], [60, -62], [160, -70]], bot = [[160, 66], [60, 58], [-40, 50], [-160, 44], [-300, 30], [-430, 22]];
    var d = "M" + top.map(function (p) { return f(X(p[0])) + " " + f(Y(p[1])); }).join(" L") + " L" + bot.map(function (p) { return f(X(p[0])) + " " + f(Y(p[1])); }).join(" L") + " Z";
    sv += P(d, SKINC, 2.4) + P("M" + f(X(-430)) + " " + f(Y(10)) + " Q" + f(X(-200)) + " " + f(Y(46)) + " " + f(X(150)) + " " + f(Y(58)), "none", 0) +
      '<path d="M' + f(X(-420)) + ' ' + f(Y(12)) + ' Q' + f(X(-200)) + ' ' + f(Y(40)) + ' ' + f(X(150)) + ' ' + f(Y(54)) + ' L' + f(X(150)) + ' ' + f(Y(64)) + ' L' + f(X(-420)) + ' ' + f(Y(22)) + ' Z" fill="' + SKIND + '" opacity=".55"/>';
    // the vein: a soft blue line along the inside of the forearm, up to the elbow
    sv += '<path d="M' + f(X(-400)) + ' ' + f(Y(-4)) + ' C' + f(X(-260)) + ' ' + f(Y(-14)) + ' ' + f(X(-120)) + ' ' + f(Y(-6)) + ' ' + f(X(10)) + ' ' + f(Y(-10)) + ' S' + f(X(120)) + ' ' + f(Y(-18)) + ' ' + f(X(160)) + ' ' + f(Y(-16)) + '" stroke="#7f8fb4" stroke-width="' + f(7 * s) + '" fill="none" opacity=".55" stroke-linecap="round"/>';
    // the fist at the wrist end (squeezing)
    var sq = o.squeeze ? .5 + .5 * Math.sin(t * 5) : 0;
    sv += P("M" + f(X(-430)) + " " + f(Y(-26)) + " Q" + f(X(-500 - 6 * sq)) + " " + f(Y(-46)) + " " + f(X(-530 - 6 * sq)) + " " + f(Y(-6)) + " Q" + f(X(-540 - 6 * sq)) + " " + f(Y(30)) + " " + f(X(-488)) + " " + f(Y(34)) + " L" + f(X(-430)) + " " + f(Y(24)) + " Z", SKINC, 2.4);
    for (var i = 0; i < 3; i++) sv += line([[X(-520 - 4 * sq), Y(-24 + i * 14)], [X(-496), Y(-20 + i * 14)]], SKIND, 2.2);
    // the cuff on the upper arm (navy, velcro seam, a white arrow mark)
    sv += P("M" + f(X(150)) + " " + f(Y(-92)) + " L" + f(X(300)) + " " + f(Y(-100)) + " L" + f(X(300)) + " " + f(Y(96)) + " L" + f(X(150)) + " " + f(Y(86)) + " Z", NAVY, 2.4) +
      line([[X(176), Y(-90)], [X(176), Y(84)]], "#4a5a76", 3) + T("▲", X(240), Y(40), 22 * s, "#e8e6df", 800) + T("CE", X(250), Y(-40), 14 * s, "#e8e6df", 700);
    // the needle: butterfly wings at the elbow, taped, the tube running off
    var nk = o.needle == null ? 1 : clamp(o.needle), nx = X(-20 + 60 * (1 - nk)), ny = Y(-16);
    var tk = o.k == null ? 1 : clamp(o.k), tcol = tk > .05 ? RED : "#e4e0d6";
    sv += tube("M" + f(nx - 30 * s) + " " + f(ny) + " C" + f(X(-160)) + " " + f(Y(-10)) + " " + f(X(-260)) + " " + f(Y(10)) + " " + f(X(-330)) + " " + f(Y(-10)) + " S" + f(X(-420)) + " " + f(Y(-120)) + " " + f(X(-360)) + " " + f(Y(-260)), tcol, 9 * s, o.flow ? o.flow : 0, t);
    sv += R(X(-230), Y(-20), 70 * s, 24 * s, "#f1f1ee", 1.6, 8, ' opacity=".9"');   // the clear clamp on the tube
    sv += line([[nx, ny], [nx + 40 * s, ny - 2 * s]], "#9aa0a4", 3 * s) + R(nx - 30 * s, ny - 7 * s, 30 * s, 14 * s, GREEN, 1.8, 3) +
      shape([[nx - 22 * s, ny - 6 * s], [nx - 6 * s, ny - 6 * s], [nx - 2 * s, ny - 38 * s], [nx - 18 * s, ny - 40 * s]], GREEN, 1.8) + shape([[nx - 22 * s, ny + 6 * s], [nx - 6 * s, ny + 6 * s], [nx - 2 * s, ny + 38 * s], [nx - 18 * s, ny + 40 * s]], GREEN, 1.8);
    if (nk > .5) sv += R(nx - 42 * s, Y(-74), 34 * s, 120 * s, "#ffffff", 1.2, 3, ' opacity=".45"') + R(X(-300), Y(-56), 30 * s, 96 * s, "#ffffff", 1.2, 3, ' opacity=".45"');   // tape strips
    return sv;
  }

  // ── the bowl cut open (side section): cx, cy = centre, r = half width; o.sep 0..1 how far the blood has separated, a = spin angle ──
  function bowl(cx, cy, r, o, t) {
    o = o || {}; var sep = clamp(o.sep || 0), a = o.a || 0, H = r * 1.5, sv = "", id = "bw" + (++CLIPN);
    var outer = "M" + f(cx - r * .38) + " " + f(cy - H) + " H" + f(cx + r * .38) + " L" + f(cx + r) + " " + f(cy - H * .45) + " V" + f(cy + H * .85) + " Q" + f(cx + r) + " " + f(cy + H) + " " + f(cx + r * .8) + " " + f(cy + H) + " H" + f(cx - r * .8) + " Q" + f(cx - r) + " " + f(cy + H) + " " + f(cx - r) + " " + f(cy + H * .85) + " V" + f(cy - H * .45) + " Z";
    sv += '<clipPath id="' + id + '"><path d="' + outer + '"/></clipPath><path d="' + outer + '" fill="#efe9dc"/>';
    // mixed blood → red outside, plasma inside
    var redW = lerp(r, r * .42, sep);   // the red band: whole width at first, then pressed to the wall
    sv += '<g clip-path="url(#' + id + ')"><rect x="' + f(cx - r) + '" y="' + f(cy - H) + '" width="' + f(2 * r) + '" height="' + f(2 * H) + '" fill="' + (sep < .02 ? "#8f3a2c" : PLASMA) + '"/>';
    if (sep >= .02) sv += '<rect x="' + f(cx - r) + '" y="' + f(cy - H) + '" width="' + f(redW) + '" height="' + f(2 * H) + '" fill="' + RED + '"/><rect x="' + f(cx + r - redW) + '" y="' + f(cy - H) + '" width="' + f(redW) + '" height="' + f(2 * H) + '" fill="' + RED + '"/>' +
      '<rect x="' + f(cx - r + redW - 3) + '" y="' + f(cy - H) + '" width="6" height="' + f(2 * H) + '" fill="#f4efe2"/><rect x="' + f(cx + r - redW - 3) + '" y="' + f(cy - H) + '" width="6" height="' + f(2 * H) + '" fill="#f4efe2"/>';
    // cells: red dots drifting outward as it separates; they jitter with the spin
    for (var i = 0; i < 46; i++) {
      var hx = hash(i * 3.1) * 2 - 1, hy = hash(i * 7.7) * 2 - 1, side = hx < 0 ? -1 : 1, x0 = cx + hx * r * .9, x1 = cx + side * (r - hash(i) * redW * .9 - 6);
      var xx = lerp(x0, x1, sep) + 2 * Math.sin(t * 9 + i), yy = cy + hy * H * .85;
      sv += '<ellipse cx="' + f(xx) + '" cy="' + f(yy) + '" rx="' + f(r * .07) + '" ry="' + f(r * .045) + '" fill="#c0463a" stroke="' + RED_D + '" stroke-width="1.2"/>';
    }
    sv += hatch(outer) + '</g>';
    // the core (where plasma leaves) and the centre tube (where blood comes in)
    sv += R(cx - r * .1, cy - H - r * .5, r * .2, H * 1.5 + r * .5, "#e9e4d6", 2) + P(outer, "none", 3);
    // the spin: an ellipse of motion arrows over the top
    var e = "";
    for (var k = 0; k < 3; k++) { var aa = a + k * 2.094, x1a = cx + Math.cos(aa) * r * 1.15, y1a = cy + H * 1.05 + Math.sin(aa) * r * .22, x2a = cx + Math.cos(aa + .7) * r * 1.15, y2a = cy + H * 1.05 + Math.sin(aa + .7) * r * .22; e += arrow(x1a, y1a, x2a, y2a, ORANGE, 4, 1); }
    sv += '<ellipse cx="' + f(cx) + '" cy="' + f(cy + H * 1.05) + '" rx="' + f(r * 1.15) + '" ry="' + f(r * .22) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="6 8" opacity=".6"/>' + e;
    return sv;
  }

  // ── a test tube of spun blood: plasma on top (55 %), the thin white buffy coat, red cells below ──
  function testTube(cx, top, w, h, sep, o) {
    o = o || {}; var id = "tt" + (++CLIPN), bot = top + h, split = top + h * .08 + (h * .92) * .55;
    var d = "M" + f(cx - w / 2) + " " + f(top) + " V" + f(bot - w / 2) + " A" + f(w / 2) + " " + f(w / 2) + " 0 0 0 " + f(cx + w / 2) + " " + f(bot - w / 2) + " V" + f(top) + " Z";
    var sv = '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="#fbf8f1"/><g clip-path="url(#' + id + ')">';
    var y0 = top + h * .08;
    if (sep < .01) sv += R(cx - w, y0, 2 * w, h, "#8f2f26", 0);
    else { var s2 = lerp(y0, split, sep); sv += R(cx - w, y0, 2 * w, h, "#8f2f26", 0) + R(cx - w, y0, 2 * w, s2 - y0, lerp(0, 1, sep) > .5 ? PLASMA : "#b0583a", 0) + R(cx - w, s2 - 2, 2 * w, 6 * sep, "#f4f0e6", 0) + R(cx - w, s2 + 4 * sep, 2 * w, bot - s2, RED, 0); }
    sv += R(cx - w / 2 + 6, top, 8, h, "#fff", 0, 0, ' opacity=".35"') + '</g><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="3"/>' + R(cx - w / 2 - 6, top - 26, w + 12, 30, "#6f8a9f", 2.4, 4);
    return { svg: sv, split: split, y0: y0, bot: bot };
  }

  // ── a glass of fresh juice settling: k 0..1 the pulp sinks ──
  function juice(cx, cy, s, k) {
    var id = "jc" + (++CLIPN), w1 = 70 * s, w2 = 54 * s, h = 130 * s, top = cy - h / 2, bot = cy + h / 2, lv = top + 14 * s;
    var d = "M" + f(cx - w1) + " " + f(top) + " L" + f(cx - w2) + " " + f(bot) + " H" + f(cx + w2) + " L" + f(cx + w1) + " " + f(top) + " Z";
    var pulpTop = lerp(lv, bot - 40 * s, k), sv = '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="#fbf8f1"/><g clip-path="url(#' + id + ')">' +
      R(cx - w1, lv, 2 * w1, h, lerp(0, 1, k) > .5 ? "#f5dc8e" : "#efb54a", 0) + R(cx - w1, pulpTop, 2 * w1, bot - pulpTop, "#e2902e", 0);
    for (var i = 0; i < 30; i++) { var px = cx + (hash(i) * 2 - 1) * w2, py = lerp(lv + hash(i + 9) * (h - 20 * s), bot - hash(i + 3) * 36 * s, k); sv += C(px, py, 3 * s, "#c87322", 0); }
    return sv + '</g><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' + line([[cx - w1 + 6 * s, top + 20 * s], [cx - w2 + 6 * s, bot - 10 * s]], "#fff", 4 * s, ' opacity=".6"');
  }

  // ── a scale, a monitor, a finger-prick reader (the check-in) ──
  function scale(cx, y, s, val, front) {   // the platform under the person (cx), the column at its right end; front: draw only the platform's front lip
    var c = cx + 80 * s;
    if (front) return R(cx - 70 * s, y - 16 * s, 170 * s, 16 * s, "#d8d4c8", 2, 4);
    return R(c - 10 * s, y - 230 * s, 20 * s, 216 * s, "#e8e4da", 2) + R(c - 30 * s, y - 262 * s, 92 * s, 48 * s, "#e8e4da", 2, 5) + R(c - 22 * s, y - 254 * s, 76 * s, 32 * s, SCREEN, 1.6, 3) + T(val, c + 16 * s, y - 231 * s, 18 * s, INK, 800); }
  function monitor(cx, cy, s, sys, dia, pulse) { return R(cx - 80 * s, cy - 60 * s, 160 * s, 120 * s, "#e8e4da", 2.4, 8) + R(cx - 66 * s, cy - 48 * s, 132 * s, 78 * s, SCREEN, 1.8, 4) + T(sys + "/" + dia, cx, cy - 6 * s, 30 * s, INK, 800) + T("♥ " + pulse, cx, cy + 22 * s, 16 * s, ORANGE, 800) + C(cx, cy + 46 * s, 7 * s, "#c8352c", 1.4); }


  // ── the centrifuge, the way you see it in the machine (3/4 from above and the side): the clear bell-shaped bowl on its
  // spinning chuck, the white header that stays still on top with its two ports, the metal well cut open in front.
  // o.fill 0..1 blood in the bowl · o.sep 0..1 separated · o.w 0..1 speed (0 = still) · o.a rotation angle (rad) · o.rpm text
  function centrifuge(cx, cy, r, o, t) {
    o = o || {}; var fill = clamp(o.fill == null ? 1 : o.fill), sep = clamp(o.sep || 0), w = clamp(o.w || 0), a = o.a || 0, ry = r * .32, h = r * 1.15;
    var yb = cy + h * .55, ym = cy - h * .15, yt = ym - r * .5, rn = r * .42, sv = "", id = "cf" + (++CLIPN);
    // the well: back wall, floor, motor shaft
    sv += '<ellipse cx="' + f(cx) + '" cy="' + f(yb + 30) + '" rx="' + f(r * 1.45) + '" ry="' + f(ry * 1.45) + '" fill="#8d8f8f" stroke="' + INK + '" stroke-width="2.4"/>' +
      P("M" + f(cx - r * 1.45) + " " + f(yb + 30) + " V" + f(ym - 10) + " A" + f(r * 1.45) + " " + f(ry * 1.45) + " 0 0 1 " + f(cx + r * 1.45) + " " + f(ym - 10) + " V" + f(yb + 30), "#a9abab", 2.4) +
      hatch("M" + f(cx - r * 1.45) + " " + f(yb + 30) + " V" + f(ym - 10) + " A" + f(r * 1.45) + " " + f(ry * 1.45) + " 0 0 1 " + f(cx + r * 1.45) + " " + f(ym - 10) + " V" + f(yb + 30));
    sv += R(cx - r * .16, yb + 10, r * .32, 70, "#6d7070", 2) + '<ellipse cx="' + f(cx) + '" cy="' + f(yb + 8) + '" rx="' + f(r * 1.08) + '" ry="' + f(ry * 1.08) + '" fill="#5d6060" stroke="' + INK + '" stroke-width="2.2"/>';   // the chuck
    // the bowl outline: cylinder, shoulder up to the neck
    var body = "M" + f(cx - r) + " " + f(yb) + " V" + f(ym) + " C" + f(cx - r) + " " + f(ym - r * .3) + " " + f(cx - rn) + " " + f(yt + 10) + " " + f(cx - rn) + " " + f(yt) +
      " H" + f(cx + rn) + " C" + f(cx + rn) + " " + f(yt + 10) + " " + f(cx + r) + " " + f(ym - r * .3) + " " + f(cx + r) + " " + f(ym) + " V" + f(yb) + " A" + f(r) + " " + f(ry) + " 0 0 1 " + f(cx - r) + " " + f(yb) + " Z";
    sv += '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="#eef3f3" fill-opacity=".9"/><g clip-path="url(#' + id + ')">';
    // what is inside: mixed blood up to the fill level; once separated, red pressed to the wall, yellow plasma in the middle
    var top = yb + ry - (yb + ry - (yt + 6)) * fill;
    if (fill > 0) {
      sv += R(cx - r - 4, top, 2 * r + 8, yb + ry - top + 4, sep < .02 ? "#8f3a2c" : PLASMA, 0);
      if (sep >= .02) { var bw = lerp(r, r * .3, sep); sv += R(cx - r - 4, top, bw + 4, yb + ry - top + 4, RED, 0) + R(cx + r - bw, top, bw + 4, yb + ry - top + 4, RED, 0) + R(cx - r + bw - 2, top, 4, yb + ry - top, "#f4efe2", 0) + R(cx + r - bw - 2, top, 4, yb + ry - top, "#f4efe2", 0); }
      for (var i = 0; i < 40; i++) {   // red cells, sliding to the wall as it separates
        var hx = hash(i * 2.3) * 2 - 1, side = hx < 0 ? -1 : 1, x0 = cx + hx * r * .9, x1 = cx + side * (r - hash(i) * r * .27 - 4);
        var yy = lerp(top + 6, yb + ry * .6, hash(i * 5.1)), xx = lerp(x0, x1, sep);
        sv += '<ellipse cx="' + f(xx) + '" cy="' + f(yy) + '" rx="' + f(r * .055) + '" ry="' + f(r * .035) + '" fill="#c0463a" stroke="' + RED_D + '" stroke-width="1"/>';
      }
      // the liquid surface seen from above: a red ring round a yellow disc
      sv += '<ellipse cx="' + f(cx) + '" cy="' + f(top) + '" rx="' + f(r) + '" ry="' + f(ry * .9) + '" fill="' + (sep < .02 ? "#a0473a" : RED) + '" stroke="' + RED_D + '" stroke-width="1.4"/>';
      if (sep >= .02) sv += '<ellipse cx="' + f(cx) + '" cy="' + f(top) + '" rx="' + f(r - lerp(r, r * .3, sep)) + '" ry="' + f((r - lerp(r, r * .3, sep)) * .29) + '" fill="' + PLASMA_L + '" stroke="' + INK + '" stroke-width="1"/>';
    }
    // ribs on the plastic turn with the bowl; fast, they blur into streaks
    for (var k = 0; k < 6; k++) {
      var aa = a + k * Math.PI / 3, c = Math.cos(aa); if (c < 0) continue;
      var xx2 = cx + Math.sin(aa) * r, op = (.25 + .5 * c) * (1 - .75 * w);
      sv += PL_line([[xx2, ym + 6], [xx2, yb + ry * c * .9]], "#ffffff", 4, ' opacity="' + f(op) + '"') + PL_line([[xx2 + 2, ym + 6], [xx2 + 2, yb + ry * c * .9]], INK, 1.2, ' opacity="' + f(op * .6) + '"');
    }
    if (w > .05) for (var j = 0; j < 5; j++) { var yj = ym + 20 + j * (yb - ym - 20) / 5, ph = (a * .6 + j * .37) % 1; sv += '<path d="M' + f(cx - r * .9) + ' ' + f(yj) + ' Q' + f(cx) + ' ' + f(yj + ry * .7) + ' ' + f(cx + r * .9) + ' ' + f(yj) + '" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="' + f(30 + 60 * w) + ' 40" stroke-dashoffset="' + f(-ph * 200) + '" opacity="' + f(.5 * w) + '"/>'; }
    sv += '<rect x="' + f(cx - r * .8) + '" y="' + f(yt) + '" width="' + f(r * .18) + '" height="' + f(yb - yt) + '" fill="#fff" opacity=".3"/></g>' + P(body, "none", 3);
    // the front lip of the well, over the bowl's foot
    sv += P("M" + f(cx - r * 1.45) + " " + f(yb + 30) + " A" + f(r * 1.45) + " " + f(ry * 1.45) + " 0 0 0 " + f(cx + r * 1.45) + " " + f(yb + 30), "none", 2.4);
    // the header: stays still while the bowl turns under it; two ports, the tubes, the clamp arm holding it
    sv += '<ellipse cx="' + f(cx) + '" cy="' + f(yt) + '" rx="' + f(rn) + '" ry="' + f(rn * .3) + '" fill="#f6f4ee" stroke="' + INK + '" stroke-width="2.4"/>' +
      R(cx - rn * .7, yt - r * .42, rn * 1.4, r * .42, "#f6f4ee", 2.4, 6) + '<ellipse cx="' + f(cx) + '" cy="' + f(yt - r * .42) + '" rx="' + f(rn * .7) + '" ry="' + f(rn * .2) + '" fill="#e8e5dc" stroke="' + INK + '" stroke-width="2"/>' +
      PL_tube("M" + f(cx - rn * .3) + " " + f(yt - r * .42) + " C" + f(cx - rn * .3) + " " + f(yt - r * .9) + " " + f(cx - r * 1.2) + " " + f(yt - r * .7) + " " + f(cx - r * 1.9) + " " + f(yt - r * .9), RED, 8, o.flowIn || 0, t) +
      PL_tube("M" + f(cx + rn * .3) + " " + f(yt - r * .42) + " C" + f(cx + rn * .3) + " " + f(yt - r * .9) + " " + f(cx + r * 1.2) + " " + f(yt - r * .7) + " " + f(cx + r * 1.9) + " " + f(yt - r * .9), sep > .5 ? PLASMA : "#e4e0d6", 8, o.flowOut || 0, t) +
      R(cx + r * 1.2, yt - r * .62, r * .5, 22, "#c9c7c0", 2, 4) + PL_line([[cx + rn * .6, yt - r * .3], [cx + r * 1.2, yt - r * .5]], "#8a877f", 8);
    // spin arrows round the top once it turns
    if (w > .05 && !o.noArrows) for (var q = 0; q < 2; q++) { var a0 = -a * 0 + q * Math.PI + t * 3 * w, x1 = cx + Math.cos(a0) * r * 1.25, y1 = ym + Math.sin(a0) * ry * 1.25, x2 = cx + Math.cos(a0 + .8) * r * 1.25, y2 = ym + Math.sin(a0 + .8) * ry * 1.25; sv += G("", arrow(x1, y1, x2, y2, ORANGE, 5, 1), w); }
    return sv;
  }
  function PL_line(p, c, w, e) { return line(p, c, w, e); } function PL_tube(d, c, w, fl, t) { return tube(d, c, w, fl, t); }
  return { centrifuge: centrifuge, WHITE: WHITE, RED: RED, PLASMA: PLASMA, PLASMA_L: PLASMA_L, NAVY: NAVY, GREEN: GREEN, SKINC: SKINC,
    shape: shape, line: line, tube: tube, bottle: bottle, salineBag: salineBag, machine: machine, chair: chair, armBoard: armBoard, arm: arm, bowl: bowl, testTube: testTube, juice: juice, scale: scale, monitor: monitor };
})();
