/* «الغرزة» — the episode's own drawings (sketch style). Panel units 640 × 786.
   Real shapes and sizes (see ../refs/SOURCES.md):
   - the Cairo Ring Road: four 3.6 m lanes each way, dashed white lane lines (3 m dash, 9 m gap in the plan view, shortened
     here), a concrete New Jersey barrier on the edge (0.81 m high, 0.61 m base, 0.15 m top, a 55° face over a 75 mm kerb);
   - a saloon car 4.5 × 1.8 m (an Elantra / Verna class car, the commonest shape on Cairo roads);
   - a fuel tanker: a cab-over tractor (about 6 m, two axles) and a three-axle tank semi-trailer (about 12 m) with an
     elliptical aluminium barrel, three or four compartments with manholes on top, a fold-down handrail, a rear ladder and
     the hazard diamond; full length about 16.5 m, width 2.5 m.
   Plan view scale: 1 m = 27.8 px (a lane is 100 px). */
var GZ = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0", MUTE = "#8f8576";
var ASPH = "#b9b2a3", ASPHD = "#a39c8c", CONC = "#d6d0c2", CONCD = "#bdb5a5", WHITE = "#f7f3e8", GLASS = "#7f97a6", GLASSL = "#a9bcc6",
    TANK = "#dfe2e1", TANKD = "#b9c0c2", CAB = "#e9e5da", TYRE = "#2f2b27", FUEL = "#7d6a8a", FIRE1 = "#e08a3a", FIRE2 = "#f2c25a", SMOKE = "#8c857a";
var CARC = ["#c9c3b5", "#8aa0ad", "#b5a284", "#9b8f84", "#d9d3c4", "#7f8c78"];
function f(n) { return (+n).toFixed(1); }
function now() { return (typeof window !== 'undefined' && window.__t) || 0; }
function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round" stroke-linecap="round"' + (ex || "") + '/>'; }
function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + op.toFixed(3) + '"' : "") + '>' + inner + '</g>'; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ── the road from above (plan view): traffic runs up the panel. Lanes x = 100…500 (lane i centre 150 + 100 i), median
//    barrier on the left (x 70…96), the New Jersey barrier on the right edge (x 504…530). o.scroll: px the lane dashes have
//    moved (the traffic's speed relative to the camera, which travels with it). o.y0, o.y1: the strip drawn.
var LANE = function (i) { return 150 + 100 * i; };
function road(o) {
  o = o || {}; var y0 = o.y0 == null ? -900 : o.y0, y1 = o.y1 == null ? 1700 : o.y1, sc = o.scroll || 0, s = "";
  s += R(-600, y0, 670, y1 - y0, "#d9cfb6", 0) + R(530, y0, 700, y1 - y0, "#d9cfb6", 0);                // verges (dry earth)
  for (var k = 0; k < 40; k++) { var yy = y0 + ((k * 97 + sc * .999) % (y1 - y0)); s += P("M" + f(-560 + rnd(k) * 600) + " " + f(yy) + " l14 -6 l10 5", "none", 1.2, ' opacity=".35"'); s += P("M" + f(560 + rnd(k + 9) * 600) + " " + f(yy + 40) + " l14 -6 l10 5", "none", 1.2, ' opacity=".35"'); }
  s += R(96, y0, 408, y1 - y0, ASPH, 0);                                                                // asphalt
  for (k = 0; k < 60; k++) { var ay = y0 + ((k * 53 + sc) % (y1 - y0)); s += '<circle cx="' + f(110 + rnd(k * 3) * 380) + '" cy="' + f(ay) + '" r="1.6" fill="' + ASPHD + '"/>'; }
  s += P("M104 " + y0 + " V" + y1, "none", 3, ' stroke="' + WHITE + '"') + P("M496 " + y0 + " V" + y1, "none", 3, ' stroke="' + WHITE + '"');   // solid edge lines
  for (var i = 1; i < 4; i++) { var x = 100 + 100 * i; for (var y = y0 - 140 + ((sc % 140) + 140) % 140; y < y1; y += 140) s += '<rect x="' + (x - 3) + '" y="' + f(y) + '" width="6" height="56" fill="' + WHITE + '"/>'; }
  s += jerseyTop(70, 96, y0, y1, sc) + jerseyTop(504, 530, y0, y1, sc);
  s += P("M96 " + y0 + " V" + y1, "none", 2) + P("M504 " + y0 + " V" + y1, "none", 2);
  return s;
}
// the concrete barrier seen from above: base, the sloped faces (hatched), the narrow top, joints every 3.8 m (106 px)
function jerseyTop(xa, xb, y0, y1, sc) {
  var s = R(xa, y0, xb - xa, y1 - y0, CONC, 2), m = (xa + xb) / 2;
  s += R(m - 3, y0, 6, y1 - y0, "#e6e1d5", 1.2) + '<rect x="' + (xa + 2) + '" y="' + y0 + '" width="' + (m - 5 - xa) + '" height="' + (y1 - y0) + '" fill="url(#hatch)" opacity=".7"/>';
  for (var y = y0 + ((sc % 106) + 106) % 106; y < y1; y += 106) s += P("M" + xa + " " + f(y) + " H" + xb, "none", 1.4);
  return s;
}
// a saloon car from above, centred at (x, y), nose up; ang = heading (deg, + turns right); col body colour; o.brake lights; o.ring: an orange ring
function carTop(x, y, col, ang, o) {
  o = o || {}; var s = "";
  s += '<ellipse cx="3" cy="6" rx="27" ry="64" fill="' + INK + '" opacity=".12"/>';                    // shadow
  s += P("M-22 -54 Q-25 -62 -14 -63 L14 -63 Q25 -62 22 -54 L25 -20 L25 48 Q25 62 12 62 L-12 62 Q-25 62 -25 48 L-25 -20 Z", col, 2);   // body
  s += P("M-21 -26 Q0 -34 21 -26 L18 -6 Q0 -10 -18 -6 Z", GLASS, 1.6) + P("M-16 -24 L-6 -28", "none", 1.6, ' stroke="' + GLASSL + '"');   // windscreen
  s += P("M-18 -6 Q0 -10 18 -6 L18 30 Q0 33 -18 30 Z", o.roof || col, 1.4);                            // roof
  s += P("M-18 30 Q0 33 18 30 L20 44 Q0 48 -20 44 Z", GLASS, 1.6);                                     // rear window
  s += P("M-14 -60 L-4 -44 M14 -60 L4 -44", "none", 1, ' opacity=".5"');                                // bonnet creases
  s += P("M-25 -18 l-7 -2 l1 6 l6 1", col, 1.4) + P("M25 -18 l7 -2 l-1 6 l-6 1", col, 1.4);              // mirrors
  s += '<rect x="-20" y="-63" width="10" height="4" rx="2" fill="#f4eed9" stroke="' + INK + '" stroke-width="1"/><rect x="10" y="-63" width="10" height="4" rx="2" fill="#f4eed9" stroke="' + INK + '" stroke-width="1"/>';
  var bl = o.brake ? "#e2483a" : "#9c4a3a";
  s += '<rect x="-21" y="58" width="11" height="5" rx="2" fill="' + bl + '" stroke="' + INK + '" stroke-width="1"/><rect x="10" y="58" width="11" height="5" rx="2" fill="' + bl + '" stroke="' + INK + '" stroke-width="1"/>';
  if (o.brake) s += '<ellipse cx="-15" cy="70" rx="12" ry="9" fill="#e2483a" opacity=".35"/><ellipse cx="15" cy="70" rx="12" ry="9" fill="#e2483a" opacity=".35"/>';
  if (o.blink) { var on = Math.sin(now() * 9) > 0; if (on) s += '<circle cx="' + (o.blink > 0 ? 24 : -24) + '" cy="-58" r="5" fill="#f0a23a" stroke="' + INK + '" stroke-width="1"/><circle cx="' + (o.blink > 0 ? 24 : -24) + '" cy="58" r="5" fill="#f0a23a" stroke="' + INK + '" stroke-width="1"/>'; }
  if (o.ring) s += '<ellipse cx="0" cy="0" rx="44" ry="80" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 7" opacity="' + f(o.ring) + '"/>';
  if (o.burnt) s = '<g style="filter:saturate(.15) brightness(.72)">' + s + '</g>' + P("M-25 -63 L25 62 M25 -63 L-25 62", "none", 1.2, ' opacity=".35"');
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ")", s);
}
// the fuel tanker from above, the front of the cab at (x, y), nose up. Cab 2.3 × 2.5 m, gap, barrel 12 m. ang about the cab front.
function tankerTop(x, y, ang, o) {
  o = o || {}; var s = "", L = 440;
  s += '<rect x="-31" y="10" width="72" height="' + L + '" fill="' + INK + '" opacity=".12"/>';
  s += R(-34, 0, 68, 66, CAB, 2, 6) + R(-30, 4, 60, 12, GLASS, 1.4, 3) + P("M-34 30 H34", "none", 1.2) + R(-38, 20, 6, 12, CAB, 1.2) + R(32, 20, 6, 12, CAB, 1.2);   // cab roof, windscreen edge, mirrors
  s += R(-16, 70, 32, 26, "#5b5650", 1.6);                                                                  // chassis / fifth wheel between cab and tank
  var by = 90; s += R(-36, by, 72, L - 90, TANK, 2.2, 30);                                                  // the barrel from above (rounded ends)
  s += '<rect x="-10" y="' + (by + 6) + '" width="20" height="' + (L - 102) + '" fill="#c9cfd0" stroke="' + INK + '" stroke-width="1.2"/>';   // walkway
  s += P("M-14 " + (by + 6) + " V" + (by + L - 96) + " M14 " + (by + 6) + " V" + (by + L - 96), "none", 1.2, ' stroke-dasharray="6 5"');   // fold-down handrail
  for (var m = 0; m < 4; m++) { var my = by + 50 + m * 82; s += '<circle cx="0" cy="' + my + '" r="11" fill="#eef0ef" stroke="' + INK + '" stroke-width="1.6"/><circle cx="0" cy="' + my + '" r="5" fill="none" stroke="' + INK + '" stroke-width="1"/>'; }   // manholes, one per compartment
  s += R(-38, by + L - 96 - 8, 76, 12, "#8f8b84", 1.4);                                                     // rear bumper / underrun bar
  if (o.ring) s += '<rect x="-56" y="-18" width="112" height="' + (L + 30) + '" rx="40" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 7" opacity="' + f(o.ring) + '"/>';
  if (o.brake) s += '<ellipse cx="-26" cy="' + (by + L - 82) + '" rx="12" ry="9" fill="#e2483a" opacity=".45"/><ellipse cx="26" cy="' + (by + L - 82) + '" rx="12" ry="9" fill="#e2483a" opacity=".45"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + " 0 0)", s);
}
// ── side view (elevation). Scale given per call: s = px per metre. Ground at y. Facing right (nose at the right).
function wheelSide(cx, cy, r, spin) {
  var s = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + TYRE + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .55) + '" fill="#bdb8ae" stroke="' + INK + '" stroke-width="1.2"/>';
  for (var k = 0; k < 5; k++) { var a = spin + k * 1.2566; s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(a) * r * .5) + ' ' + f(cy + Math.sin(a) * r * .5) + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return s + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .12) + '" fill="' + INK + '"/>';
}
// a saloon car in profile: rear at x, ground y, scale s (px/m). 4.5 m long, 1.45 m high.
function carSide(x, y, s, col, o) {
  o = o || {}; var k = s / 10, sp = o.spin || 0, q = function (a, b) { return f(x + a * k) + " " + f(y - b * k); };
  var g = '<ellipse cx="' + f(x + 22.5 * k) + '" cy="' + f(y + 1) + '" rx="' + f(23 * k) + '" ry="' + f(2.2 * k) + '" fill="' + INK + '" opacity=".15"/>';
  g += P("M" + q(1, 3.2) + " L" + q(.4, 6.8) + " Q" + q(.8, 8.6) + " " + q(3.4, 9.4) + " L" + q(9, 10) + " Q" + q(13, 14.4) + " " + q(17, 14.5) + " L" + q(27, 14.4) + " Q" + q(31, 14) + " " + q(35, 10) + " L" + q(42.5, 9.1) + " Q" + q(44.8, 8.6) + " " + q(45, 6) + " L" + q(44.6, 3.2) + " Z", col, 2);   // body
  g += P("M" + q(10.6, 10.2) + " Q" + q(14, 13.6) + " " + q(17.2, 13.7) + " L" + q(21.6, 13.7) + " L" + q(21.6, 10.2) + " Z", GLASS, 1.4) + P("M" + q(22.6, 10.2) + " L" + q(22.6, 13.7) + " L" + q(26.8, 13.6) + " Q" + q(30, 13.2) + " " + q(33.2, 10.2) + " Z", GLASS, 1.4);   // windows
  g += P("M" + q(22.1, 3.6) + " L" + q(22.1, 10.2) + " M" + q(10, 9.8) + " L" + q(10.6, 3.6), "none", 1.2) + P("M" + q(2, 7.4) + " L" + q(43.6, 7.4), "none", 1, ' opacity=".45"');
  g += '<rect x="' + f(x + .2 * k) + '" y="' + f(y - 8 * k) + '" width="' + f(1.4 * k) + '" height="' + f(1.8 * k) + '" fill="' + (o.brake ? "#e2483a" : "#9c4a3a") + '" stroke="' + INK + '" stroke-width="1"/>';
  if (o.brake) g += '<ellipse cx="' + f(x - 1 * k) + '" cy="' + f(y - 7 * k) + '" rx="' + f(3 * k) + '" ry="' + f(2 * k) + '" fill="#e2483a" opacity=".35"/>';
  g += '<rect x="' + f(x + 43.2 * k) + '" y="' + f(y - 8.2 * k) + '" width="' + f(1.6 * k) + '" height="' + f(1.4 * k) + '" fill="#f4eed9" stroke="' + INK + '" stroke-width="1"/>';
  g += wheelSide(x + 8.6 * k, y - 3.2 * k, 3.2 * k, sp) + wheelSide(x + 36.4 * k, y - 3.2 * k, 3.2 * k, sp);
  return g;
}
// the fuel tanker in profile, rear at x, ground y, s px/m: three-axle semi-trailer (12 m, barrel 2.0 m deep) + cab-over tractor.
function tankerSide(x, y, s, o) {
  o = o || {}; var k = s, sp = o.spin || 0, q = function (a, b) { return f(x + a * k) + " " + f(y - b * k); }, g = "";
  g += '<ellipse cx="' + f(x + 8.2 * k) + '" cy="' + f(y + 1) + '" rx="' + f(8.8 * k) + '" ry="' + f(.22 * k) + '" fill="' + INK + '" opacity=".15"/>';
  g += P("M" + q(.2, 1.05) + " L" + q(13.2, 1.05) + " L" + q(13.2, 1.35) + " L" + q(.2, 1.35) + " Z", "#5b5650", 1.4);   // chassis rail
  g += P("M" + q(.3, 1.3) + " L" + q(.3, 3.1) + " Q" + q(.3, 3.4) + " " + q(.8, 3.4) + " L" + q(12.9, 3.4) + " Q" + q(13.5, 3.4) + " " + q(13.5, 3.1) + " L" + q(13.5, 1.6) + " Q" + q(13.5, 1.3) + " " + q(12.9, 1.3) + " Z", TANK, 2.2);   // barrel
  g += P("M" + q(.5, 2.9) + " L" + q(13.3, 2.9), "none", 1, ' opacity=".35"') + P("M" + q(.5, 1.7) + " L" + q(13.3, 1.7), "none", 1, ' opacity=".35"');
  for (var c = 1; c < 4; c++) g += P("M" + q(.3 + c * 3.3, 1.3) + " L" + q(.3 + c * 3.3, 3.4), "none", 1, ' opacity=".55"');   // compartment bulkheads (weld lines)
  for (c = 0; c < 4; c++) g += R(x + (1.7 + c * 3.3) * k, y - 3.65 * k, .9 * k, .25 * k, "#eef0ef", 1.2);                      // manholes
  g += P("M" + q(.8, 3.4) + " L" + q(.8, 3.95) + " L" + q(13.0, 3.95) + " L" + q(13.0, 3.4), "none", 1.4);                     // handrail
  for (c = 1; c < 10; c++) g += P("M" + q(.8 + c * 1.22, 3.4) + " L" + q(.8 + c * 1.2, 3.95), "none", 1);
  g += P("M" + q(.1, 1.2) + " L" + q(.1, 3.6), "none", 1.6) + P("M" + q(-.15, 1.2) + " L" + q(-.15, 3.6), "none", 1.6);       // rear ladder rails
  for (c = 0; c < 6; c++) g += P("M" + q(-.15, 1.4 + c * .4) + " L" + q(.1, 1.4 + c * .4), "none", 1.2);
  g += R(x + 5.2 * k, y - 2.75 * k, 1.5 * k, .9 * k, "#f4ecdb", 1.2) + '<text x="' + f(x + 5.95 * k) + '" y="' + f(y - 2.15 * k) + '" text-anchor="middle" style="font:800 ' + f(.48 * k) + 'px Noto Sans Arabic;fill:' + ORANGE + '">بنزين</text>';
  g += G("translate(" + f(x + 7.6 * k) + " " + f(y - 2.3 * k) + ") rotate(45)", '<rect x="' + f(-.32 * k) + '" y="' + f(-.32 * k) + '" width="' + f(.64 * k) + '" height="' + f(.64 * k) + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2"/>');   // hazard diamond
  [1.6, 2.9, 4.2].forEach(function (a) { g += wheelSide(x + a * k, y - .5 * k, .5 * k, sp); });                                // three trailer axles
  // tractor: cab-over, 2.6 m cab, rear axle under the front of the barrel (fifth wheel), wheelbase 3.0 m
  g += P("M" + q(11.2, 1.05) + " L" + q(16.3, 1.05) + " L" + q(16.3, 1.35) + " L" + q(11.2, 1.35) + " Z", "#5b5650", 1.4);
  g += P("M" + q(13.75, 1.2) + " L" + q(13.75, 3.7) + " Q" + q(13.75, 3.95) + " " + q(14.05, 3.95) + " L" + q(16.0, 3.95) + " Q" + q(16.4, 3.95) + " " + q(16.4, 3.5) + " L" + q(16.5, 1.4) + " Q" + q(16.5, 1.1) + " " + q(16.2, 1.1) + " L" + q(13.75, 1.1) + " Z", CAB, 2);
  g += P("M" + q(15.3, 2.5) + " L" + q(16.3, 2.5) + " L" + q(16.35, 3.6) + " L" + q(15.5, 3.6) + " Z", GLASS, 1.2) + P("M" + q(14.1, 2.5) + " L" + q(15.0, 2.5) + " L" + q(15.0, 3.5) + " L" + q(14.1, 3.5) + " Z", GLASS, 1.2);
  g += P("M" + q(14.0, 2.2) + " L" + q(14.0, 1.4) + " M" + q(15.1, 2.4) + " L" + q(15.1, 1.4), "none", 1, ' opacity=".5"') + R(x + 16.35 * k, y - 1.45 * k, .2 * k, .45 * k, "#8f8b84", 1);   // door, step, bumper
  g += wheelSide(x + 12.6 * k, y - .5 * k, .5 * k, sp) + wheelSide(x + 15.6 * k, y - .5 * k, .5 * k, sp);
  return g;
}
// the concrete New Jersey barrier in section (end-on): 0.61 m base, 0.15 m top, 0.81 m high. x = road-side foot, s px/m, dir = -1 if the road is on the right
function jerseySection(x, y, s, dir) {
  dir = dir || 1; var q = function (a, b) { return f(x + dir * a * s) + " " + f(y - b * s); };
  return P("M" + q(0, 0) + " L" + q(0, .075) + " L" + q(.18, .33) + " L" + q(.23, .81) + " L" + q(.38, .81) + " L" + q(.43, .33) + " L" + q(.61, .075) + " L" + q(.61, 0) + " Z", CONC, 2) +
    '<path d="M' + q(.05, .1) + ' L' + q(.2, .33) + ' L' + q(.25, .78) + '" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".4"/>';
}
// the tanker seen from behind (section across the road), centre x, ground y, s px/m; roll (deg, + towards the right / barrier) about the right wheels
function tankerRear(x, y, s, roll, piv) {
  piv = piv || 1;
  var g = "", q = function (a, b) { return f(a * s) + " " + f(-b * s); };
  g += R(-1.25 * s, -1.35 * s, 2.5 * s, .3 * s, "#5b5650", 1.4);                                                               // chassis
  g += '<ellipse cx="0" cy="' + f(-2.35 * s) + '" rx="' + f(1.25 * s) + '" ry="' + f(1.05 * s) + '" fill="' + TANK + '" stroke="' + INK + '" stroke-width="2.2"/>';   // elliptical barrel
  g += '<ellipse cx="0" cy="' + f(-2.35 * s) + '" rx="' + f(1.0 * s) + '" ry="' + f(.82 * s) + '" fill="none" stroke="' + INK + '" stroke-width="1" opacity=".4"/>';
  g += P("M" + q(-.15, 1.3) + " L" + q(-.15, 3.4) + " M" + q(.15, 1.3) + " L" + q(.15, 3.4), "none", 1.6);                        // ladder
  g += R(-.25 * s, -3.6 * s, .5 * s, .2 * s, "#eef0ef", 1.2) + P("M" + q(-.6, 3.4) + " L" + q(-.6, 3.9) + " L" + q(.6, 3.9) + " L" + q(.6, 3.4), "none", 1.4);   // manhole, handrail
  g += R(-1.25 * s, -1.0 * s, 2.5 * s, .22 * s, "#8f8b84", 1.4);                                                               // underrun bar
  g += '<rect x="' + f(-1.15 * s) + '" y="' + f(-.95 * s) + '" width="' + f(.3 * s) + '" height="' + f(.12 * s) + '" fill="#9c4a3a"/><rect x="' + f(.85 * s) + '" y="' + f(-.95 * s) + '" width="' + f(.3 * s) + '" height="' + f(.12 * s) + '" fill="#9c4a3a"/>';
  [-1, 1].forEach(function (d) { g += R(d * 1.25 * s - (d > 0 ? .6 * s : 0), -1 * s, .6 * s, 1 * s, TYRE, 1.6, 4); });          // dual tyres each side
  return G("translate(" + f(x + piv * 1.25 * s) + " " + f(y) + ") rotate(" + f(roll || 0) + ") translate(" + f(-piv * 1.25 * s) + " 0)", g);
}
// fuel spreading on the road (plan or section): an irregular sheen, k 0..1
function spill(cx, cy, r, k, flat) {
  if (k <= 0) return ""; var d = "", n = 14; for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * k * (.75 + .35 * rnd(i + 3) + .04 * Math.sin(now() * 2 + i)); d += (i ? " L" : "M") + f(cx + Math.cos(a) * rr) + " " + f(cy + Math.sin(a) * rr * (flat || 1)); }
  return '<path d="' + d + ' Z" fill="' + FUEL + '" opacity=".55" stroke="' + INK + '" stroke-width="1.2"/>' + '<path d="' + d + ' Z" fill="url(#hatch)" opacity=".4"/>';
}
// flames in the sketch hand: a few tongues that flicker; h height, w width
function flames(cx, base, w, h, k) {
  if (k <= 0) return ""; var t = now(), s = "", n = Math.max(3, Math.round(w / 26));
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(base - h * k * 1.1) + '" rx="' + f(w * .7) + '" ry="' + f(h * k * .5) + '" fill="' + SMOKE + '" opacity=".25"/>';
  for (var i = 0; i < n; i++) {
    var x = cx - w / 2 + w * (i + .5) / n, hh = h * k * (.6 + .4 * rnd(i) + .12 * Math.sin(t * 7 + i * 1.7)), ww = w / n * .9, sw = 6 * Math.sin(t * 5 + i);
    s += P("M" + f(x - ww / 2) + " " + f(base) + " Q" + f(x - ww * .6) + " " + f(base - hh * .5) + " " + f(x + sw) + " " + f(base - hh) + " Q" + f(x + ww * .6) + " " + f(base - hh * .5) + " " + f(x + ww / 2) + " " + f(base) + " Z", FIRE1, 1.6);
    s += P("M" + f(x - ww / 4) + " " + f(base) + " Q" + f(x - ww * .3) + " " + f(base - hh * .3) + " " + f(x + sw * .5) + " " + f(base - hh * .6) + " Q" + f(x + ww * .3) + " " + f(base - hh * .3) + " " + f(x + ww / 4) + " " + f(base) + " Z", FIRE2, 0);
  }
  return s;
}
// a tyre bursting: the star of bits round (x, y)
function burst(x, y, k) { if (k <= 0) return ""; var s = ""; for (var i = 0; i < 9; i++) { var a = i * .698, r1 = 8 + 30 * k, r2 = r1 + 12; s += P("M" + f(x + Math.cos(a) * r1) + " " + f(y + Math.sin(a) * r1) + " L" + f(x + Math.cos(a) * r2) + " " + f(y + Math.sin(a) * r2), "none", 3, ' stroke="' + ORANGE + '" opacity="' + f(1 - k * .6) + '"'); } return s; }
// a stopwatch face (for the bumper and the time sum)
function watch(x, y, r, k, txt) { var a = -Math.PI / 2 + k * Math.PI * 2; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#f7f1e2" stroke="' + INK + '" stroke-width="2.4"/>' + R(x - 6, y - r - 12, 12, 10, INK, 0) + P("M" + f(x) + " " + f(y) + " L" + f(x + Math.cos(a) * r * .8) + " " + f(y + Math.sin(a) * r * .8), "none", 3, ' stroke="' + ORANGE + '"') + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + INK + '"/>' + (txt ? '<text x="' + f(x) + '" y="' + f(y + r * .55) + '" text-anchor="middle" style="font:800 ' + f(r * .32) + 'px Noto Serif;fill:' + INK + '">' + txt + '</text>' : ""); }
return { road: road, carTop: carTop, tankerTop: tankerTop, carSide: carSide, tankerSide: tankerSide, jerseySection: jerseySection, tankerRear: tankerRear, spill: spill, flames: flames, burst: burst, watch: watch, LANE: LANE, CARC: CARC, ASPH: ASPH, CONC: CONC, GLASS: GLASS, R: R, P: P };
})();
