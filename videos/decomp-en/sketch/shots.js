window.EN_ED = true;
// ── «تحلل جسم الإنسان» / How a Body Decomposes — one drawing file for both editions (decomp-en/sketch/make.sh adds
// `window.EN_ED = true;`). Calm forensic-science drawings: cells, a body always covered by a sheet, a soil cut, a skeleton.
// Nothing gory. Quick mode, see refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var CELL = "#f2d6c8", CELL_D = "#d9a186", NUC = "#b77a5c", LYS = "#e8c46a", SHEET = "#f7f3ea", SHEET_D = "#ddd6c6", PURPLE = "#8f6a8a",
    SOIL = "#a9845c", SOIL_D = "#8a6a46", SOIL_L = "#c9a97a", BONE = "#efe6d0", BACT = OLIVE, FLY = "#3d3a34";

// ── a cell with its nucleus and lysosomes (enzyme sacs); burst 0..1 opens the sacs and spills enzyme dots, crumble breaks the wall
function cell(x, y, r, t, burst, crumble) {
  burst = burst || 0; crumble = crumble || 0; var s = "", n = 40, d = "";
  for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * (1 + .05 * Math.sin(a * 5 + t * 1.5) - crumble * .25 * Math.max(0, Math.sin(a * 7 + 1))); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr * .85); }
  s += '<path d="' + d + ' Z" fill="' + CELL + '" stroke="' + INK + '" stroke-width="2.6"' + (crumble > .3 ? ' stroke-dasharray="' + f(30 - 20 * crumble) + ' ' + f(6 + 14 * crumble) + '"' : "") + '/>';
  s += '<ellipse cx="' + f(x - r * .1) + '" cy="' + f(y) + '" rx="' + f(r * .3) + '" ry="' + f(r * .26) + '" fill="' + NUC + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - .6 * crumble) + '"/>';
  for (var k = 0; k < 7; k++) {
    var a2 = k * .9 + 1, px = x + Math.cos(a2) * r * .62, py = y + Math.sin(a2) * r * .5;
    if (burst < .5) s += C(px, py, r * .09, LYS, 1.6) + C(px, py, r * .03, ORANGE, 0);
    else s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r * .09) + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="4 4"/>';
    for (var j = 0; j < 4 * burst; j++) { var b = j * 1.6 + k + t * .8, rr2 = r * .12 + burst * r * .25 * (1 + .3 * Math.sin(t * 2 + j)); s += C(px + Math.cos(b) * rr2, py + Math.sin(b) * rr2, r * .025 + 1.5, ORANGE, 0); }
  }
  return s;
}
// oxygen dots arriving through a small vessel on the left; flow 0..1
function o2in(x, y, t, flow) { var s = R(x - 220, y - 22, 170, 44, "#f0d2c4", 2.2, 20); for (var k = 0; k < 5; k++) { var u = (t * .7 + k / 5) % 1; s += G("", C(x - 210 + u * 210, y + (k % 2 ? -8 : 8), 8, BLUE, 1.4), flow * (1 - u * .3)); } return s; }
// ── a body lying on its back, covered with a sheet, seen from the side (head to the left). swell 0..1 bulges the belly
function sheet(x, y, s, t, swell, sink) {
  swell = swell || 0; sink = sink || 0; var b = 30 * swell + 2 * Math.sin(t * 1.4) * swell;
  var top = "M-250 0 C-250 -44 -214 -60 -180 -50 C-150 -40 -130 -40 -110 -44 C-40 -54 0 " + f(-52 - b) + " 60 " + f(-56 - b * 1.2) + " C120 " + f(-58 - b) + " 150 -40 200 -32 C240 -26 260 -18 262 0 Z";
  return G("translate(" + f(x) + " " + f(y + sink * 20) + ") scale(" + s + " " + f(s * (1 - .55 * sink)) + ")", '<path d="' + top + '" fill="' + SHEET + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<path d="M-150 -38 C-120 -20 -60 -26 -20 -40 M40 -40 C80 -20 140 -26 180 -24" stroke="' + SHEET_D + '" stroke-width="3" fill="none"/>');
}
function table(x, y, w) { return R(x - w / 2, y, w, 16, "#b9b4a6", 2.2, 4) + '<path d="M' + f(x - w / 2 + 30) + ' ' + f(y + 16) + ' v80 M' + f(x + w / 2 - 30) + ' ' + f(y + 16) + ' v80" stroke="' + INK + '" stroke-width="5"/>'; }
// muscle fibres: rows of filaments; lock 0..1 pulls them together and pins them, loose relaxes them
function fibres(x, y, t, lock, loose) {
  var s = R(x - 220, y - 120, 440, 240, "#e7b7a6", 2.4, 30), sh = 30 * (lock || 0) * (1 - (loose || 0));
  for (var r = 0; r < 5; r++) { var yy = y - 90 + r * 45; s += R(x - 200, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x + 40 - sh, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x - 130, yy + 10, 260, 8, "#c98a74", 1.2, 4); if (lock > .5 && !(loose > .5)) s += '<path d="M' + f(x - 40 + sh - 8) + ' ' + f(yy - 12) + ' l16 24 M' + f(x - 40 + sh + 8) + ' ' + f(yy - 12) + ' l-16 24" stroke="' + ORANGE + '" stroke-width="2.6" opacity=".8"/>'; }
  return s + '<path d="M' + f(x + 14 * Math.sin(t * 3) * (1 - (lock || 0))) + ' ' + (y - 120) + ' v240" stroke="none"/>';
}
function battery(x, y, v) { return R(x - 40, y - 70, 80, 140, PAPER, 2.4, 8) + R(x - 16, y - 82, 32, 12, INK, 0, 3) + R(x - 32, y + 62 - 124 * clamp(v), 64, 124 * clamp(v), v < .3 ? ORANGE : OLIVE, 0, 4); }
// a rod bacterium
function bact(x, y, a, s) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + (s || 1) + ")", '<rect x="-16" y="-7" width="32" height="14" rx="7" fill="' + BACT + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M16 0 q8 -6 14 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'); }
function fly(x, y, t, s) { var w = 6 * Math.abs(Math.sin(t * 40)); return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", '<ellipse cx="-6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="10" ry="6" fill="' + FLY + '"/><circle cx="10" cy="-1" r="4" fill="' + FLY + '"/>'); }
// a soil cut with grass on top, layers, stones
function soil(y, t) { var s = R(-40, y, 720, 860 - y, SOIL, 2.4); s += R(-40, y + 120, 720, 860 - y - 120, SOIL_D, 0) + '<path d="M-40 ' + (y + 120) + ' H680" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>'; for (var k = 0; k < 18; k++) s += '<path d="M' + f(k * 38 - 20) + ' ' + y + ' l6 -16 l6 16" stroke="' + OLIVE + '" stroke-width="3" fill="none"/>'; for (k = 0; k < 10; k++) s += '<ellipse cx="' + f(hash(k) * 640) + '" cy="' + f(y + 30 + hash(k + 3) * 220) + '" rx="' + f(8 + hash(k + 5) * 10) + '" ry="6" fill="' + SOIL_L + '" stroke="' + INK + '" stroke-width="1.2"/>'; return s; }
// a skeleton lying down (side), simple bones
function skeleton(x, y, s) {
  var b = '<ellipse cx="-200" cy="-10" rx="30" ry="24" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="-210" cy="-14" r="5" fill="' + INK + '"/>';
  b += '<path d="M-168 -6 H130" stroke="' + INK + '" stroke-width="8"/><path d="M-168 -6 H130" stroke="' + BONE + '" stroke-width="5"/>';
  for (var k = 0; k < 8; k++) b += '<path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + BONE + '" stroke-width="2.6" fill="none"/>';
  b += '<ellipse cx="120" cy="-4" rx="26" ry="18" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  ["M140 0 L250 4", "M140 6 L250 14", "M-110 0 L0 14", "M-110 4 L0 22"].forEach(function (d) { b += '<path d="' + d + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" stroke="' + BONE + '" stroke-width="6" stroke-linecap="round"/>'; });
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
function thermo(x, y, v, lab) { var h = 220 * clamp(v); return R(x - 16, y - 240, 32, 250, "#f6f1e6", 2.4, 16) + R(x - 8, y - h, 16, h, ORANGE, 0) + C(x, y + 16, 24, ORANGE, 2.4) + (lab ? T(lab, x + 70, y - h + 8, 28, INK, 800) : ""); }
function stageTag(n, txt, k) { return G("", numBox(String(n), 120, 190, k, 40, true) + T(txt, 180, 202, 34, INK, 800, "end"), clamp(k)); }
// the four-stage strip on top (HUD): which one is on
function strip(on) { var L = [TX("هضم ذاتي", "self-digestion"), TX("انتفاخ", "bloat"), TX("تحلل", "decay"), TX("عضم", "bones")], s = ""; for (var i = 0; i < 4; i++) { var x = 110 + i * 140, a = i + 1 === on; s += '<rect x="' + (x - 62) + '" y="34" width="124" height="40" rx="6" fill="' + (a ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="1.8"/>' + T((i + 1) + " · " + L[i], x, 61, EN ? 13 : 17, a ? "#fff" : INK, 700); } return s; }


// ── a standing body outline (front, medical-diagram plain, no face). Strokes don't scale, so it can be zoomed into.
var NS = ' vector-effect="non-scaling-stroke"';
function bodyOutline() {
  return '<path d="M-20 -190 L-20 -170 C-70 -165 -100 -150 -110 -120 L-150 40 C-155 60 -135 66 -128 46 L-95 -70 L-90 40 L-80 250 C-80 266 -50 266 -48 250 L-20 70 L20 70 L48 250 C50 266 80 266 80 250 L90 40 L95 -70 L128 46 C135 66 155 60 150 40 L110 -120 C100 -150 70 -165 20 -170 L20 -190 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"' + NS + '/><circle cx="0" cy="-228" r="40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"' + NS + '/>';
}
// the gut inside the belly (body units, around 0,20): the colon framing the small intestine coils
function gutLayer() {
  var s = '<path d="M-44 52 V-12 C-44 -22 -36 -26 -26 -26 H26 C36 -26 44 -22 44 -12 V52" fill="none" stroke="#c98a74" stroke-width="18" stroke-linecap="round"/><path d="M-44 52 V-12 C-44 -22 -36 -26 -26 -26 H26 C36 -26 44 -22 44 -12 V52" fill="none" stroke="' + INK + '" stroke-width="1.6"' + NS + ' opacity=".7"/>';
  s += '<path d="M-28 -8 C-10 -16 10 -2 28 -8 C34 4 10 10 -6 4 C-24 0 -34 14 -20 20 C0 26 20 14 30 22 C30 34 6 40 -12 34 C-28 30 -32 44 -16 48 C4 52 20 44 28 48" fill="none" stroke="#e0a08c" stroke-width="9" stroke-linecap="round"/><path d="M-28 -8 C-10 -16 10 -2 28 -8 C34 4 10 10 -6 4 C-24 0 -34 14 -20 20 C0 26 20 14 30 22 C30 34 6 40 -12 34 C-28 30 -32 44 -16 48 C4 52 20 44 28 48" fill="none" stroke="' + INK + '" stroke-width="1.4"' + NS + ' opacity=".6"/>';
  return s;
}
// a continuous zoom from the whole body into a point (fx,fy body units) that lands on screen at (cx,cy); Z grows 1 → zmax
function zoomBody(Z, fx, fy, cx, cy, bodyOp, org) { return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(Z * .9) + ") translate(" + f(-fx) + " " + f(-fy) + ")", bodyOutline(org ? { organs: org, hl: "gut" } : {}), bodyOp); }

// ════ realistic anatomy (replaces the first rough body): proportions of 8 heads (head 60 units, 480 tall, crotch at y 0),
// a two-tone skin edge like the reference body (v20), faint landmarks, organs in their real places, a real muscle,
// skin layers, a fingertip and a front-view skeleton. Strokes are non-scaling so the camera can zoom deep.
var BLOOD = "#b8392a", SKIN_D = "#c98a70", ORG = { lung: "#e2a3a0", heart: "#b8392a", liver: "#8f3f2c", stomach: "#e7b39a", colon: "#d9a07f", small: "#ecbca6" };
// the left half of the outline (viewer's left), neck to crotch, as cubic segments; the right half is its mirror
var BODY_L = [[-11, -182], [-12, -166], [-30, -162, -52, -162, -62, -154], [-72, -146, -76, -130, -75, -115], [-76, -96, -77, -84, -78, -70],
  [-79, -55, -82, -30, -84, 2], [-86, 12, -88, 30, -90, 44], [-91, 54, -84, 58, -80, 50], [-77, 40, -76, 25, -72, 10], [-70, -10, -66, -40, -64, -62],
  [-62, -80, -60, -100, -58, -116], [-56, -100, -52, -80, -46, -56], [-42, -40, -44, -24, -50, -8], [-54, 4, -52, 20, -48, 40],
  [-42, 75, -36, 100, -32, 115], [-30, 130, -34, 160, -30, 190], [-28, 205, -26, 215, -24, 222], [-30, 232, -34, 240, -26, 242], [-18, 242, -12, 242, -10, 242],
  [-10, 232, -12, 222, -12, 214], [-14, 190, -18, 160, -16, 128], [-14, 116, -12, 110, -10, 100], [-8, 70, -6, 40, -3, 14], [-2, 10, -1, 8, 0, 8]];
function bodyPath() {
  var P = function (x, y) { return f(x) + " " + f(y); }, d = "M" + P(BODY_L[0][0], BODY_L[0][1]), i, s;
  for (i = 1; i < BODY_L.length; i++) { s = BODY_L[i]; d += s.length === 2 ? " L" + P(s[0], s[1]) : " C" + P(s[0], s[1]) + " " + P(s[2], s[3]) + " " + P(s[4], s[5]); }
  for (i = BODY_L.length - 1; i >= 1; i--) { s = BODY_L[i]; var prev = BODY_L[i - 1], p0 = prev.length === 2 ? prev : [prev[4], prev[5]]; d += s.length === 2 ? " L" + P(-p0[0], p0[1]) : " C" + P(-s[2], s[3]) + " " + P(-s[0], s[1]) + " " + P(-p0[0], p0[1]); }
  return d + " Z";
}
var BODY_D = bodyPath(), CLIPB = 0;
function bodyOutline(opts) {
  opts = opts || {}; var id = "bd" + (++CLIPB), s = '<clipPath id="' + id + '"><path d="' + BODY_D + '"/><ellipse cx="0" cy="-210" rx="24" ry="30"/></clipPath>';
  s += '<path d="' + BODY_D + '" fill="' + SKIN + '"/><ellipse cx="0" cy="-210" rx="24" ry="30" fill="' + SKIN + '"/>';
  // shade: a darker rim inside the edge, then hatching on the right-hand side (light from the left)
  s += '<g clip-path="url(#' + id + ')"><path d="' + BODY_D + '" fill="none" stroke="' + SKIN_D + '" stroke-width="7"/><ellipse cx="0" cy="-210" rx="24" ry="30" fill="none" stroke="' + SKIN_D + '" stroke-width="6"/>' + R(30, -250, 80, 500, "url(#hatch)", 0) + '</g>';
  if (opts.organs) s += G("", organs(opts.hl), opts.organs);
  // landmarks: collarbones, chest, ribs edge, navel, knees, fingers
  var lm = ["M-8 -160 C-24 -156 -40 -158 -54 -152", "M8 -160 C24 -156 40 -158 54 -152", "M-40 -126 C-30 -112 -12 -110 -2 -116", "M40 -126 C30 -112 12 -110 2 -116",
    "M-34 -92 C-24 -82 -12 -78 0 -84 C12 -78 24 -82 34 -92", "M-28 -4 C-16 4 -8 8 0 8 C8 8 16 4 28 -4", "M-30 108 C-26 116 -18 116 -16 108", "M30 108 C26 116 18 116 16 108",
    "M-84 40 V54 M-80 42 V56 M84 40 V54 M80 42 V56", "M0 -150 V-90"];
  s += lm.map(function (d) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="1.3" fill="none" opacity=".35"' + NS + '/>'; }).join("") + C(0, -40, 1.6, INK, 0);
  s += '<path d="' + BODY_D + '" fill="none" stroke="' + INK + '" stroke-width="2.4"' + NS + '/><ellipse cx="0" cy="-210" rx="24" ry="30" fill="none" stroke="' + INK + '" stroke-width="2.4"' + NS + '/>';
  return s + '<path d="M-6 -240 C-20 -238 -26 -226 -24 -212" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".3"' + NS + '/>';
}
// organs in the torso (body units), anatomical right = viewer's left
function organs(hl) {
  var o = function (d, c, k) { return '<path d="' + d + '" fill="' + c + '" stroke="' + INK + '" stroke-width="1.4"' + NS + (hl && hl !== k ? ' opacity=".45"' : "") + '/>'; };
  var s = o("M-6 -150 C-20 -152 -40 -140 -44 -110 C-46 -96 -42 -86 -30 -84 C-20 -84 -10 -90 -6 -100 Z", ORG.lung, "lung") + o("M6 -150 C20 -152 40 -140 44 -110 C46 -96 42 -86 30 -84 C22 -84 16 -88 12 -96 L6 -110 Z", ORG.lung, "lung");
  s += o("M-4 -118 C-2 -126 10 -128 14 -120 C20 -110 16 -98 6 -92 C0 -96 -8 -104 -4 -118 Z", ORG.heart, "heart");
  s += o("M-46 -84 C-30 -90 0 -88 12 -80 C4 -70 -14 -62 -32 -60 C-42 -60 -48 -70 -46 -84 Z", ORG.liver, "liver") + o("M10 -82 C24 -88 36 -82 36 -70 C36 -58 24 -54 14 -58 C8 -62 4 -70 10 -82 Z", ORG.stomach, "stomach");
  s += gutLayer(hl);
  return s;
}
// the gut: the colon framing the abdomen with its pouches (haustra), the small intestine coiled inside, the appendix
function gutLayer(hl) {
  var op = hl && hl !== "gut" ? ' opacity=".45"' : "", s = "", fr = "M-34 2 V-46 C-34 -54 -28 -58 -20 -58 H20 C28 -58 34 -54 34 -46 V-6 C34 4 24 8 12 6";
  s += '<path d="' + fr + '" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"' + op + '/><path d="' + fr + '" fill="none" stroke="' + ORG.colon + '" stroke-width="10.4" stroke-linecap="round"' + op + '/>';
  // haustra: little pinches across the colon
  var pts = []; for (var y = -50; y <= -4; y += 6) pts.push([-34, y], [34, y]); for (var x = -26; x <= 26; x += 6) pts.push([x, -58]);
  s += pts.map(function (p) { var h = p[1] === -58 && Math.abs(p[0]) < 30; return '<path d="M' + (h ? f(p[0]) + ' ' + f(p[1] - 5) + ' v10' : f(p[0] - 5) + ' ' + f(p[1]) + ' h10') + '" stroke="' + INK + '" stroke-width="1" opacity=".5"' + NS + '/>'; }).join("");
  var sm = "M-22 -46 C-10 -52 8 -40 22 -46 C28 -38 10 -32 -4 -36 C-20 -40 -26 -28 -14 -24 C0 -20 16 -30 24 -22 C26 -12 8 -10 -6 -14 C-22 -18 -26 -6 -12 -4 C4 -2 14 -8 20 -2";
  s += '<path d="' + sm + '" fill="none" stroke="' + INK + '" stroke-width="7.4" stroke-linecap="round"' + op + '/><path d="' + sm + '" fill="none" stroke="' + ORG.small + '" stroke-width="5.2" stroke-linecap="round"' + op + '/>';
  return s + '<path d="M-34 4 c2 6 -2 10 -6 12" stroke="' + ORG.colon + '" stroke-width="3" stroke-linecap="round"' + op + '/>';
}
// a skeletal muscle (a biceps-like belly between two tendons) with a cut end showing its bundles; lock pulls it short
function muscle(x, y, s, lock, t) {
  var L = 1 - .12 * (lock || 0), b = "";
  b += '<path d="M-260 -6 H' + f(-170 * L) + ' M' + f(170 * L) + ' -6 H260 M-260 6 H' + f(-170 * L) + ' M' + f(170 * L) + ' 6 H260" stroke="' + INK + '" stroke-width="2" fill="none"/>' + R(-262, -6, 262 - 170 * L, 12, BONE, 0) + R(170 * L, -6, 262 - 170 * L, 12, BONE, 0);
  var belly = "M" + f(-180 * L) + " 0 C" + f(-120 * L) + " " + f(-70 - 10 * lock) + " " + f(60 * L) + " " + f(-74 - 10 * lock) + " " + f(180 * L) + " 0 C" + f(60 * L) + " " + f(74 + 10 * lock) + " " + f(-120 * L) + " " + f(70 + 10 * lock) + " " + f(-180 * L) + " 0 Z";
  b += '<path d="' + belly + '" fill="#b5523f" stroke="' + INK + '" stroke-width="2.6"/>';
  for (var k = -4; k <= 4; k++) b += '<path d="M' + f(-170 * L) + ' 0 C' + f(-110 * L) + ' ' + f(k * 15) + ' ' + f(60 * L) + ' ' + f(k * 16) + ' ' + f(170 * L) + ' 0" stroke="#8f3a2c" stroke-width="1.6" fill="none" opacity=".7"/>';
  b += '<path d="' + belly + '" fill="none" stroke="#e08a72" stroke-width="5" opacity=".35" transform="translate(-4 -4) scale(.94)"/>';
  // the cut end: an oval face with bundles (fascicles) wrapped in pale tissue
  var cut = '<ellipse cx="0" cy="0" rx="48" ry="70" fill="#f0d0c0" stroke="' + INK + '" stroke-width="2.4"/>';
  for (k = 0; k < 14; k++) { var a = hash(k) * 6.28, r = Math.sqrt(hash(k + 3)) * .78; cut += '<ellipse cx="' + f(Math.cos(a) * r * 40) + '" cy="' + f(Math.sin(a) * r * 58) + '" rx="' + f(10 + hash(k + 5) * 4) + '" ry="' + f(13 + hash(k + 6) * 5) + '" fill="#b5523f" stroke="' + INK + '" stroke-width="1.2"/>'; }
  b += G("translate(" + f(10 * L) + " 0)", cut);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// one muscle fibre with its stripes (sarcomeres); lock packs the stripes tight and pins them
function fibre(x, y, w, lock, loose, t) {
  var c = (lock || 0) * (1 - (loose || 0)), s = R(x - w / 2, y - 26, w, 52, "#d9776a", 2.4, 26), sp = 34 - 12 * c, n = Math.floor((w - 30) / sp);
  for (var k = 0; k <= n; k++) { var xx = x - w / 2 + 16 + k * sp; s += R(xx, y - 22, sp * .45, 44, "#8f3a2c", 0) + '<path d="M' + f(xx + sp * .72) + ' ' + (y - 22) + ' v44" stroke="' + INK + '" stroke-width="1.6"/>'; if (c > .5) s += '<path d="M' + f(xx - 4) + ' ' + (y - 30) + ' l8 8 M' + f(xx + 4) + ' ' + (y - 30) + ' l-8 8" stroke="' + ORANGE + '" stroke-width="2.2"/>'; }
  return s;
}
// skin in section: epidermis, dermis with capillaries, fat; pool 0..1 settles purple blood into the lower dermis
function skinSection(w, h, pool, t) {
  var s = R(-w / 2, -h / 2, w, h * .16, "#e8b8a0", 0) + R(-w / 2, -h / 2 + h * .16, w, h * .44, "#e7a58f", 0) + R(-w / 2, -h / 2 + h * .6, w, h * .4, "#f2e2b0", 0);
  for (var k = 0; k < 8; k++) s += C(-w / 2 + 16 + k * (w / 8), h * .28 + (k % 2) * 10, 11, "#f8eecb", 1.2);
  s += '<path d="M' + (-w / 2) + ' ' + f(-h / 2 + h * .16) + ' C-40 ' + f(-h / 2 + h * .2) + ' 40 ' + f(-h / 2 + h * .12) + ' ' + (w / 2) + ' ' + f(-h / 2 + h * .16) + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
  s += '<path d="M' + (-w / 2) + ' ' + f(-h / 2 + h * .32) + ' C-30 ' + f(-h / 2 + h * .26) + ' 30 ' + f(-h / 2 + h * .4) + ' ' + (w / 2) + ' ' + f(-h / 2 + h * .32) + '" stroke="' + BLOOD + '" stroke-width="4" fill="none"/>';
  s += R(-w / 2, -h / 2 + h * .6 - h * .26 * pool, w, h * .26 * pool, PURPLE, 0) + '<path d="M' + (-w / 2) + ' ' + f(-h / 2 + h * .6) + ' H' + (w / 2) + '" stroke="' + INK + '" stroke-width="1.4"/>';
  return s;
}
// a fingertip from the side: nail plate, cuticle, pad; shrink pulls the skin back from the nail
function fingertip(x, y, s, shrink) {
  var k = shrink || 0, b = '<path d="M-160 60 H70 C120 60 150 30 150 -6 C150 -40 120 -56 80 -56 H-160 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  b += '<path d="M-160 50 H70 C110 50 136 30 140 0" stroke="' + SKIN_D + '" stroke-width="7" fill="none" opacity=".6"/>';
  b += '<path d="M' + f(-10 - 40 * k) + ' -56 C' + f(30 - 30 * k) + ' -66 120 -66 162 -44 C168 -40 166 -34 158 -34 C120 -48 60 -50 ' + f(-10 - 40 * k) + ' -44 Z" fill="#f4e6dc" stroke="' + INK + '" stroke-width="2.2"/>';
  b += '<path d="M' + f(-14 - 40 * k) + ' -58 C' + f(-6 - 40 * k) + ' -48 ' + f(-6 - 40 * k) + ' -46 ' + f(-14 - 40 * k) + ' -40" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  b += '<path d="M40 30 C70 34 100 26 116 10 M30 -20 C60 -16 90 -22 104 -30" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".35"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// a skeleton from the front (same 8-head units as the body)
function bone(d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="' + BONE + '" stroke-width="' + w + '" stroke-linecap="round" fill="none"/>'; }
function skeletonFront() {
  var s = '<path d="M-21 -214 C-22 -240 22 -240 21 -214 C21 -200 16 -192 12 -186 C8 -180 -8 -180 -12 -186 C-16 -192 -21 -200 -21 -214 Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<ellipse cx="-8" cy="-210" rx="6" ry="7" fill="' + INK + '"/><ellipse cx="8" cy="-210" rx="6" ry="7" fill="' + INK + '"/><path d="M0 -202 l-3 7 h6 Z" fill="' + INK + '"/><path d="M-9 -188 H9" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="2 2"/>';
  for (var v = 0; v < 22; v++) { var y = -178 + v * 8.4, w = 5 + v * .3; s += R(-w, y, 2 * w, 6.4, BONE, 1.2, 2); }
  for (var r = 0; r < 10; r++) { var ry = -154 + r * 7.5, rx = 26 + r * 2.4 - (r > 6 ? (r - 6) * 4 : 0); s += bone("M-5 " + f(ry) + " C" + f(-rx) + " " + f(ry - 6) + " " + f(-rx - 8) + " " + f(ry + 18) + " " + f(-rx + 4) + " " + f(ry + 26), 2.2) + bone("M5 " + f(ry) + " C" + f(rx) + " " + f(ry - 6) + " " + f(rx + 8) + " " + f(ry + 18) + " " + f(rx - 4) + " " + f(ry + 26), 2.2); }
  s += R(-4, -156, 8, 52, BONE, 1.4, 3) + bone("M-6 -160 C-24 -156 -40 -158 -54 -152", 3.2) + bone("M6 -160 C24 -156 40 -158 54 -152", 3.2);
  s += '<path d="M-6 -18 C-24 -30 -48 -26 -50 -8 C-50 6 -36 14 -20 12 C-12 10 -6 6 0 8 C6 6 12 10 20 12 C36 14 50 6 50 -8 C48 -26 24 -30 6 -18 Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="-14" cy="2" r="5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="14" cy="2" r="5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.2"/>';
  [-1, 1].forEach(function (m) {
    s += bone("M" + (m * 58) + " -148 L" + (m * 72) + " -68", 4.2) + bone("M" + (m * 70) + " -64 L" + (m * 82) + " 2", 2.6) + bone("M" + (m * 75) + " -64 L" + (m * 86) + " 2", 2.2);
    for (var fg = 0; fg < 5; fg++) s += bone("M" + f(m * (80 + fg * 2)) + " 8 L" + f(m * (78 + fg * 3.5)) + " " + (40 + (fg === 2 ? 6 : 0)), 1.6);
    s += bone("M" + (m * 32) + " 6 L" + (m * 26) + " 108", 5.2) + C(m * 34, 2, 6, BONE, 1.6) + C(m * 24, 114, 5, BONE, 1.4) + bone("M" + (m * 24) + " 122 L" + (m * 20) + " 214", 4) + bone("M" + (m * 30) + " 124 L" + (m * 27) + " 212", 2);
    s += bone("M" + (m * 20) + " 222 L" + (m * 34) + " 240", 3) + bone("M" + (m * 16) + " 224 L" + (m * 24) + " 242", 2.2);
  });
  return s;
}
function skeleton(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") rotate(-90) scale(" + f(s * .9) + ")", skeletonFront()); }

// ── shots (same line numbers in both editions)
// 4 · one small rule: the camera goes from the whole body into the chest, the tissue, and one cell with its blood supply
shot(4, push(330, 420, 1.0, 1.0), function (u, d, t) {
  var k = ease(clamp((u - .2) / (d - .5))), Z = Math.exp(Math.log(46) * k), fx = -50, fy = -110, cx = 360, cy = 420, s = paper();
  s += zoomBody(Z, fx, fy, cx, cy, 1 - clamp((Z - 4) / 6));
  var tk = clamp((Z - 3) / 5); if (tk > 0) { var rt = 3.6 * Z * .9, sp = 8 * Z * .9; for (var i = -5; i <= 5; i++) for (var j = -5; j <= 5; j++) { var px = cx + i * sp + (j % 2 ? sp / 2 : 0), py = cy + j * sp * .86; if (px < -rt || px > 640 + rt || py < -rt || py > 800 + rt) continue; s += G("", cell(px, py, rt, t + i + j, 0, 0), tk); } }
  s += G("", o2in(cx - 150, cy, t, 1), clamp((k - .85) / .15));
  return s + tag(TX("قاعدة", "THE RULE"), 320, 140, clamp((k - .8) / .2), 34, OLIVE);
});
// 5 · a cell lives while the blood brings oxygen; cut it and the cell falls apart
shot(5, push(330, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, d * .45, d * .5); return paper() + cell(360, 420, 150, t, 0, k) + o2in(210, 420, t, 1 - at(u, d * .3, .6)) + cross(110, 300, .9, at(u, d * .35, .4)); }, { tr: "in" });
// 6 · first stage: self-digestion
shot(6, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(1, TX("الهضم الذاتي", "autolysis"), at(u, .2, .3)) + cell(320, 440, 170, t, 0, 0); });
// 7 · enzymes locked in tiny sacs; without oxygen the sacs burst
shot(7, push(330, 430, 1.0, 1.25), function (u, d, t) { return paper() + cell(320, 440, 200, t, at(u, d * .55, .8), 0) + label(320 + Math.cos(1) * 124, 440 + Math.sin(1) * 100, 470, 680, TX("أكياس إنزيمات", "enzyme sacs"), ORANGE, at(u, .6, .5), 24); });
// 8 · the enzymes spill out and digest the cell itself, like a stomach digesting food
shot(8, push(320, 420, 1.06, 1.0), function (u, d, t) { return paper() + cell(300, 450, 190, t, 1, at(u, .3, d - .5)) + iconBox(520, 150, 160, '<path d="M-30 -50 C-60 -40 -60 20 -20 40 C20 60 60 30 50 0 C40 -20 10 -10 0 -30 C-6 -44 -16 -54 -30 -50 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>', at(u, d * .5, .3)); });
// 9 · meanwhile the body cools about one degree an hour (1.5 °F)
shot(9, push(320, 420, 1.0, 1.05), function (u, d, t) { var k = at(u, .2, d - .3); return paper() + thermo(220, 600, .95 - .5 * k, EN ? count(98.6 - 6 * k, 1, 1) + "°F" : count(37 - 4 * k, 1, 1) + "°") + numBox(TX("−1° / ساعة", "−1.5°F / hr"), 430, 300, at(u, .8, .3), 34); });
// 10 · the blood settles with gravity, purple patches on the lower side
shot(10, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + table(320, 470, 560) + sheet(320, 470, 1.05, t, 0) + arrow(560, 250, 560, 380, MUTE, 6, at(u, .3, .5)) + inset(330, 620, 120, skinSection(260, 240, k, t), at(u, .6, .3)); });
// 11 · muscles stiffen as their energy runs out, then loosen a day or two later: a real muscle, and one of its fibres
shot(11, push(320, 420, 1.0, 1.04), function (u, d, t) { var lock = at(u, .3, 1.2), loose = at(u, d * .65, 1); return paper() + muscle(310, 320, 1.12, lock * (1 - loose), t) + fibre(310, 580, 560, lock, loose, t) + label(300, 554, 220, 690, TX("ليفة عضلية", "muscle fibre"), OLIVE, at(u, .6, .5), 22) + battery(560, 150, 1 - lock) + G("", T(TX("يوم أو اتنين", "1–2 days"), 300, 720, 30, OLIVE, 800), loose); });
// 12 · second stage: bloat
shot(12, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(2, TX("الانتفاخ", "bloat"), at(u, .2, .3)) + table(320, 520, 560) + sheet(320, 520, 1.05, t, .3); });
hud(12, 18, function (u, t) { var on = t < LN[16].start ? 2 : t < LN[17].start ? 3 : 4; return strip(on); });
hud(6, 12, function (u, t) { return strip(1); });
// 13 · trillions of gut bacteria: from the whole body into the belly, the gut, and the bacteria multiplying inside
shot(13, push(320, 430, 1.0, 1.0), function (u, d, t) {
  var k = ease(clamp((u - .1) / (d * .5))), Z = Math.exp(Math.log(6.5) * k), s = paper();
  s += zoomBody(Z, 0, -28, 320, 430, 1, clamp((Z - 1.3) / 1.5));
  var n = Math.round(46 * clamp((u - d * .45) / (d * .45)));
  for (var j = 0; j < n; j++) s += bact(140 + hash(j) * 360 + 6 * Math.sin(t * 2 + j), 260 + hash(j + 9) * 330 + 6 * Math.cos(t * 2 + j), hash(j + 4) * 180 + t * 20, .9);
  return s + G("", '<rect x="230" y="680" width="180" height="40" rx="6" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(TX("مناعة: ✗", "immune: ✗"), 320, 708, 22, ORANGE, 800), at(u, d * .7, .3));
});
// 14 · they make gas and the body swells like a balloon in a few days
shot(14, push(320, 430, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5), s = paper() + table(320, 520, 560) + sheet(320, 520, 1.05, t, k); for (var j = 0; j < 6; j++) { var v = (t * .5 + j / 6) % 1; s += C(260 + j * 30, 470 - v * 60 * k, 6 + 6 * v, "#d8e6c8", 1.2); } return s + numBox(TX("أيام", "days"), 500, 250, at(u, d * .6, .3), 32); });
// 15 · the gases smell awful and call in flies from far away
shot(15, push(320, 430, 1.06, 1.0), function (u, d, t) { var s = paper() + table(320, 560, 560) + sheet(320, 560, 1.05, t, 1); for (var i = 0; i < 4; i++) s += '<path d="M' + (220 + i * 60) + ' 480 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" stroke="' + OLIVE + '" stroke-width="4" fill="none" opacity="' + f(.4 + .3 * Math.sin(t * 3 + i)) + '"/>'; for (var k = 0; k < 5; k++) { var q = clamp(u / d * 1.3 - k * .12); s += fly(lerp(680 + k * 40, 330 + k * 30, q) + 8 * Math.sin(t * 6 + k), lerp(120 + k * 40, 360 + (k % 2) * 30, q), t, 1.2); } return s; });
// 16 · stage three, active decay: tissue liquefies, larvae feed, most of the mass is lost (bar drops; the sheet sinks)
shot(16, push(320, 430, 1.04, 1.0), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + stageTag(3, TX("التحلل النشط", "active decay"), at(u, .2, .3)) + soil(560, t) + sheet(320, 560, 1.05, t, 0, k) + R(470, 200, 140, 26, PAPER, 2) + R(472, 202, 136 * (1 - .75 * k), 22, OLIVE, 0) + T(TX("الوزن", "mass"), 540, 260, 22, INK, 700); });
// 17 · in the end only the skeleton stays, for hundreds of years
shot(17, push(320, 460, 1.0, 1.06), function (u, d, t) { return paper() + stageTag(4, TX("الهيكل العضمي", "skeleton"), at(u, .2, .3)) + soil(380, t) + skeleton(320, 560, 1.05) + G("", numBox(TX("مئات السنين", "centuries"), 440, 250, 1, 30), at(u, d * .55, .3)); }, { tr: "out" });
// 18 · temperature first: warm speeds it up, cold slows it right down
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + G("translate(180 260)", '<circle r="54" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * .785 + t; return '<path d="M' + f(Math.cos(a) * 66) + ' ' + f(Math.sin(a) * 66) + ' l' + f(Math.cos(a) * 18) + ' ' + f(Math.sin(a) * 18) + '" stroke="' + INK + '" stroke-width="4"/>'; }).join("")) + arrow(120, 420, 260, 420, ORANGE, 9, at(u, .5, .4)) + G("translate(460 260) rotate(" + f(t * 20) + ")", [0, 1, 2].map(function (i) { return '<path d="M0 -60 V60" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round" transform="rotate(' + (i * 60) + ')"/>'; }).join("")) + arrow(420, 420, 470, 420, BLUE, 9, at(u, d * .5, .4)) + G("", T("×", 500, 432, 40, BLUE, 800), at(u, d * .6, .3)); });
// 19 · in air twice as fast as in water, eight times faster than buried in soil
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var rows = [[TX("هوا", "air"), 1, "#cfe0e8", TX("أسبوع", "1 week")], [TX("مية", "water"), 2, "#9fb7c3", TX("أسبوعين", "2 weeks")], [TX("تربة", "soil"), 8, SOIL, TX("8 أسابيع", "8 weeks")]], s = paper();
  rows.forEach(function (r, i) { var k = at(u, .3 + i * .7, .5), y = 260 + i * 150; s += R(80, y - 50, 120, 100, r[2], 2.2, 8) + T(r[0], 140, y + 10, 28, INK, 800) + R(230, y - 10, (44 * r[1] + 6 * Math.sin(t * 3 + i)) * k, 40, i ? MUTE : ORANGE, 2, 4) + G("", T(r[3], 236, y - 24, 26, INK, 800, "end"), k); });
  return s;
});
// 20 · the myth: hair and nails keep growing after death. no.
shot(20, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + fingertip(300, 440, 1.6, 0) + arrow(420, 280, 540, 280 - 0 * Math.sin(t * 3), ORANGE, 8, at(u, .4, .5)) + T("؟", 560, 220, 90, ORANGE, 800) + cross(420, 620, 1.3, at(u, d * .8, .4)); });
// 21 · the skin dries and shrinks back, so they look longer
shot(21, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5); return paper() + fingertip(300, 440, 1.6, k) + measure(300 - 16 * 1.6 - 64 * k * 1.6, 300, 300 + 162 * 1.6, 300, 1, "") + label(300 - 14 * 1.6 - 64 * k * 1.6, 360, 330, 620, TX("الجلد بينكمش", "skin shrinks"), OLIVE, at(u, d * .5, .5), 24); });
// 22 · recap: cells digest themselves, bacteria bloat, insects finish, bones remain
shot(22, push(320, 420, .88, 1.06), function (u, d, t) { var s = paper(), q = d / 4.4; var bb = function (i) { return f(16 * Math.sin(t * 2.4 + i * 1.3)); };
  s += G("translate(170 " + (300 + +bb(0)) + ") scale(.8)", cell(0, 0, 160, t, 1, .4), at(u, .1, .3)) + G("translate(470 " + (320 + +bb(1)) + ") scale(.55)", sheet(0, 0, 1, t, 1), at(u, q, .3)) + G("", fly(170 + 30 * Math.sin(t * 1.7), 600 + +bb(2), t, 4), at(u, 2 * q, .3)) + G("translate(470 " + (600 + +bb(3)) + ") scale(.62)", skeleton(0, 0, 1), at(u, 3 * q, .3)); for (var i = 0; i < 4; i++) s += callout(String(i + 1), [60, 360, 60, 360][i], [150, 150, 470, 470][i], at(u, .1 + i * q, .3), 20); return s; }, { tr: "out" });
// 23 · the odd fact: a research farm in the US studies donated bodies to pin down time of death
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) { var s = paper() + R(-40, 520, 720, 300, "#c9c09a", 2.4); for (var k = 0; k < 6; k++) s += '<path d="M' + (40 + k * 110) + ' 520 V380 M' + (20 + k * 110) + ' 420 H' + (150 + k * 110) + ' M' + (20 + k * 110) + ' 460 H' + (150 + k * 110) + '" stroke="' + INK + '" stroke-width="3"/>'; for (k = 0; k < 3; k++) s += C(120 + k * 200, 300, 50, OLIVE, 2.4) + R(114 + k * 200, 340, 12, 60, WOOD_D || "#7c5434", 2); return s + G("translate(470 640) rotate(" + f(-6 + 3 * Math.sin(t * 1.5)) + ")", R(-90, -60, 180, 120, "#f7f3ea", 2.4, 4) + '<path d="M-70 -30 H70 M-70 0 H40 M-70 30 H60" stroke="' + INK + '" stroke-width="2" opacity=".5"/>' + C(60, 30, 26, "none", 4) + '<path d="M78 48 l26 26" stroke="' + INK + '" stroke-width="6"/>') + G("", numBox(TX("وقت الوفاة؟", "time of death?"), 320, 160, 1, 30), at(u, d * .55, .3)); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = '<path d="M60 300 H160 l20 -60 l30 120 l20 -60 H260" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-linejoin="round"/>';
  var k = clamp((t - LN[0].start) / 2.2); s += '<path d="M260 300 H' + f(260 + 290 * k) + '" stroke="' + INK + '" stroke-width="5"/>' + C(260 + 290 * k, 300, 9, ORANGE, 2);
  s += G("translate(" + f(300 + 14 * Math.sin(t * 2.2)) + " " + f(460 + 10 * Math.cos(t * 1.8)) + ") scale(" + f(1 + .06 * Math.sin(t * 2.6)) + ")", cell(0, 0, 110, t, li >= 1 ? ease((t - LN[1].start) / 1.2) : 0, 0), li >= 1 ? 1 : .35 + .1 * Math.sin(t * 3));
  if (li >= 2) s += G("", '<path d="M80 600 H520" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 8"/>' + [0, 1, 2, 3].map(function (i) { return callout(String(i + 1), 100 + i * 135, 600, 1, 18); }).join(""), ease((t - LN[2].start) / .5));
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 112) scale(.32)", cell(0, 0, 120, t, 0, 0)); };
SCENE.outro = function (svg, u, t) {
  return G("translate(70 140) scale(.3)", cell(0, 0, 160, t, 1, .3)) + G("translate(220 150) scale(.32)", sheet(0, 0, 1, t, 1)) + fly(370, 140, t, 1.6) + G("translate(500 150) scale(.3)", skeleton(0, 0, 1)) +
    callout("1", 70, 60, ease(u / .3)) + callout("2", 220, 60, ease(u / .3 - .5)) + callout("3", 370, 60, ease(u / .3 - 1)) + callout("4", 500, 60, ease(u / .3 - 1.5));
};
