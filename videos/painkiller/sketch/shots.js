// ── «إزاي البرشامة بتعرف مكان الوجع؟» — drawings.
// The body, the vessels, the heart and the digestive tract are the real shapes of two Wikimedia Commons plates
// (Circulatory System en.svg, Digestive system diagram en.svg — refs/SOURCES.md), restyled into the sketch palette by
// tools/restyle.py (art/*.js). The tissue block, the villi, the stomach wall and COX on its membrane are drawn here
// after histology plates; ibuprofen, aspirin and arachidonic acid are their real skeletal formulas.

// ── real anatomy plates ──
// circ layers: layer5 silhouette (+ lungs, kidneys outline), layer1/15/16/9 arteries, layer6/14/12/13 veins, layer8 heart
var ART_C = {};
function hexRGB(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function rgbHex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
// recolour every fill (and stroke) in a string to `col`, keeping each colour's relative lightness
function tint(s, col, strokeCol) {
  var c = hexRGB(col);
  s = s.replace(/fill="(#[0-9a-f]{6})"/g, function (m, h) { if (h === "#2a2016") return m; var q = hexRGB(h), l = (q[0] * .3 + q[1] * .59 + q[2] * .11) / 255, k = .78 + .3 * l; return 'fill="' + rgbHex(c.map(function (v) { return v * k; })) + '"'; });
  if (strokeCol) s = s.replace(/stroke="(#[0-9a-f]{6})"/g, 'stroke="' + strokeCol + '"');
  return s;
}
var ART_ARTERIES = ["layer1", "layer15", "layer16", "layer9"], ART_VEINS = ["layer6", "layer14", "layer12", "layer13"];
function artLayers(name, ids, fn, key) {
  key = name + ":" + ids.join(",") + ":" + (key || ""); if (ART_C[key]) return ART_C[key];
  var A = ART[name], s = ids.map(function (i) { return A.layers[i] || ""; }).join("");
  return (ART_C[key] = fn ? fn(s) : s);
}
var SKIN_B = "#e7c2a8";
// the body seen from the front, skin coloured with an ink outline (the circulatory plate's silhouette)
function body() { return artLayers("circ", ["layer5"], function (s) { return tint(s, SKIN_B, INK); }, "skin"); }
function vessels(op) {
  op = op || {};
  return (op.veins === false ? "" : artLayers("circ", ART_VEINS)) + artLayers("circ", ART_ARTERIES) + artLayers("circ", ["layer8"]);
}
// the drug in the blood: every vessel turns orange inside a circle that grows out of the heart
function drugVessels(r) {
  if (r <= 0) return ""; var id = "dv" + (++CLIPN);
  var s = artLayers("circ", ART_VEINS.concat(ART_ARTERIES), function (s) { return tint(s, "#e0703f"); }, "drug");
  return '<clipPath id="' + id + '"><circle cx="305" cy="235" r="' + f(r) + '"/></clipPath><g clip-path="url(#' + id + ')">' + s + '</g>';
}
// the stomach alone, the real outline from the digestive plate (digest coordinates)
function stomach(fill, stroke, w) { return '<path d="' + ART.stomach.d + '" transform="' + ART.stomach.tr + '" fill="' + (fill || "#dba184") + '" stroke="' + (stroke || INK) + '" stroke-width="' + (w || 2) + '"/>'; }
var STC = [330, 488];   // stomach centre in digest coordinates
function digest() { return artLayers("digest", ["layer1"], function (s) { return s.replace(/stroke="#(e[0-9a-f]|d[0-9a-f])[0-9a-f]{4}"/g, 'stroke="' + INK + '"'); }, "ink"); }

// ── small marks ──
// a pain burst (reference v20: the red star at the burn), pulsing
function burst(x, y, r, k, t) {
  k = clamp(k); if (k <= 0) return ""; var s = "", n = 12, p = 1 + .12 * Math.sin(t * 9);
  var d = ""; for (var i = 0; i < n * 2; i++) { var a = i / (n * 2) * Math.PI * 2 + t * .4, rr = r * p * (i % 2 ? .55 : 1) * k; d += (i ? "L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.5 * k) + '" fill="' + ORANGE + '" opacity=".18"/>';
  return s + '<path d="' + d + 'Z" fill="#c8452c" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' + C(x, y, r * .22 * k, "#f1b06a", 1.2);
}
// the pill: a white film-coated tablet with a score line
function pill(x, y, s, rot) {
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s) + ")",
    '<ellipse cx="0" cy="3" rx="22" ry="11" fill="#cfc7b6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-1" rx="22" ry="11" fill="#fbf8f0" stroke="' + INK + '" stroke-width="2"/><path d="M0 -11 V9" stroke="' + MUTE + '" stroke-width="1.6"/>');
}
// drug molecules: small orange-ringed dots (the same mark everywhere the drug goes)
function dot(x, y, r, op) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r || 4) + '" fill="#e9874f" stroke="' + INK + '" stroke-width="1"' + (op != null ? ' opacity="' + f(op) + '"' : "") + '/>'; }
// prostaglandin: an orange hexagon-ish ring with a tail (PG has a five-carbon ring and two chains)
function pg(x, y, s, rot, op) {
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s || 1) + ")",
    '<path d="M-5 -6 L4 -7 L8 1 L1 7 L-7 3 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M8 1 l6 -4 l6 4 M-7 3 l-6 4 l-6 -4" stroke="' + INK + '" stroke-width="1.4" fill="none"/>', op);
}
// a nerve impulse running along a polyline: n pulses, speed px/s, returns small orange dashes
function polyAt(pts, u) {   // point at fraction u along a polyline
  var L = 0, seg = []; for (var i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  var w = clamp(u) * L; for (i = 0; i < seg.length; i++) { if (w <= seg[i] || i === seg.length - 1) { var q = seg[i] ? w / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; } w -= seg[i]; }
}
function polyD(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
function impulses(pts, t, n, speed, col, r) {
  var s = "", L = 0; for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  for (var k = 0; k < n; k++) { var u = ((t * speed / L) + k / n) % 1, p = polyAt(pts, u); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r || 6) + '" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return s;
}
// a nerve fibre: ink edge, pale yellow core (nerves are yellow-white in anatomy plates)
var NERVE = "#e9dc9c";
function nerve(pts, w, col) { var d = polyD(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + (col || NERVE) + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }

// ── brain and spinal cord over the body (front view; reference v20) ──
function brainFront(x, y, s, col) {
  var h = "";
  [-1, 1].forEach(function (m) {
    h += '<path d="M' + f(x) + ' ' + f(y - 26 * s) + ' C' + f(x + m * 20 * s) + ' ' + f(y - 32 * s) + ' ' + f(x + m * 34 * s) + ' ' + f(y - 18 * s) + ' ' + f(x + m * 33 * s) + ' ' + f(y + 2 * s) + ' C' + f(x + m * 32 * s) + ' ' + f(y + 18 * s) + ' ' + f(x + m * 18 * s) + ' ' + f(y + 24 * s) + ' ' + f(x + m * 3 * s) + ' ' + f(y + 20 * s) + ' Z" fill="' + (col || "#9db27e") + '" stroke="' + INK + '" stroke-width="1.6"/>';
    h += '<path d="M' + f(x + m * 8 * s) + ' ' + f(y - 18 * s) + ' q' + f(m * 10 * s) + ' ' + f(6 * s) + ' ' + f(m * 18 * s) + ' ' + f(2 * s) + ' M' + f(x + m * 10 * s) + ' ' + f(y) + ' q' + f(m * 10 * s) + ' ' + f(-6 * s) + ' ' + f(m * 20 * s) + ' ' + f(2 * s) + ' M' + f(x + m * 6 * s) + ' ' + f(y + 12 * s) + ' q' + f(m * 8 * s) + ' ' + f(4 * s) + ' ' + f(m * 16 * s) + ' 0" stroke="' + INK + '" stroke-width="1.1" fill="none" opacity=".7"/>';
  });
  return h + '<path d="M' + f(x - 5 * s) + ' ' + f(y + 18 * s) + ' h' + f(10 * s) + ' v' + f(14 * s) + ' h' + f(-10 * s) + ' Z" fill="#9db27e" stroke="' + INK + '" stroke-width="1.4"/>';
}
// spinal cord (the cord inside a column of vertebrae) from the brainstem down to the lower back
function spine(x, y0, y1) {
  var s = R(x - 5, y0, 10, y1 - y0, NERVE, 1.6);
  for (var y = y0 + 6; y < y1; y += 15) s += R(x - 11, y, 22, 10, "#efe6cf", 1.3, 3);
  return s + R(x - 3, y0, 6, y1 - y0, NERVE, 0);
}
// the median nerve route from the cord down the (viewer's) left arm to the index fingertip, in circ coordinates
var ARM_NERVE = [[300, 170], [262, 196], [236, 232], [220, 300], [200, 360], [180, 410], [160, 452], [148, 480], [140, 508]];

// ── a skin-and-tissue block cut open (reference v20 skin block, layers after the Commons «Skin layers» plate) ──
// o: {inf 0..1 inflamed, rel 0..1 prostaglandin released, sens 0..1 endings sensitised, sig impulses per second, drug 0..1}
var ENDINGS = [[200, 0], [262, 0], [330, 0], [398, 0], [460, 0]];
function topY(x, sw, t) { return 250 - sw * 46 * Math.exp(-Math.pow((x - 330) / 150, 2)) + 3 * Math.sin(x * .03 + t * .6); }
function tissue(t, o) {
  o = o || {}; var sw = clamp(o.inf || 0), s = "", x, k, X0 = 20, X1 = 620, EP = 34, DB = 470, HB = 660;
  var top = []; for (x = X0; x <= X1; x += 15) top.push([x, topY(x, sw, t)]);
  // top face (skin surface seen from above, receding)
  var back = top.map(function (p) { return [p[0] + 40, p[1] - 70]; });
  s += '<path d="' + polyD(top) + ' ' + back.slice().reverse().map(function (p) { return "L" + f(p[0]) + " " + f(p[1]); }).join(" ") + ' Z" fill="' + rgbHex(hexRGB("#efcdb4").map(function (v, i) { return lerp(v, [226, 150, 128][i], sw * .6); })) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (k = 1; k < 5; k++) s += '<path d="' + polyD(top.map(function (p, i) { return [p[0] + 40 * k / 5 + 6 * Math.sin(i + k), p[1] - 70 * k / 5]; })) + '" stroke="#c99f86" stroke-width="1" fill="none"/>';
  s += '<path d="M' + X1 + ' ' + f(top[top.length - 1][1]) + ' l40 -70 V' + (HB - 70) + ' l-40 70 Z" fill="#d9b89e" stroke="' + INK + '" stroke-width="2"/>';
  // hypodermis: fat lobules
  s += R(X0, DB, X1 - X0, HB - DB, "#eedb9f", 2) + G("", (function () { var r = ""; for (k = 0; k < 34; k++) { var cx = X0 + 20 + (k % 9) * 68 + (Math.floor(k / 9) % 2) * 34, cy = DB + 30 + Math.floor(k / 9) * 48; if (cy < HB - 14) r += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="30" ry="21" fill="#f6e8b8" stroke="#c9b06a" stroke-width="1.4"/>'; } return r; })());
  // dermis
  var dcol = rgbHex(hexRGB("#e7b3a0").map(function (v, i) { return lerp(v, [214, 120, 100][i], sw); }));
  var epiBot = top.map(function (p, i) { return [p[0], p[1] + EP + 8 * Math.sin(i * 1.3)]; });
  s += '<path d="' + polyD(epiBot) + ' L' + X1 + ' ' + DB + ' L' + X0 + ' ' + DB + ' Z" fill="' + dcol + '" stroke="' + INK + '" stroke-width="1.6"/>';
  s += '<path d="' + polyD(epiBot) + ' L' + X1 + ' ' + DB + ' L' + X0 + ' ' + DB + ' Z" fill="url(#hatch)" opacity=".25"/>';
  // epidermis with its cell rows
  s += '<path d="' + polyD(top) + ' ' + epiBot.slice().reverse().map(function (p) { return "L" + f(p[0]) + " " + f(p[1]); }).join(" ") + ' Z" fill="#f1d2bb" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="' + polyD(top.map(function (p) { return [p[0], p[1] + 9]; })) + '" stroke="#d6ad93" stroke-width="1.2" fill="none"/>';
  // blood: an arteriole and a venule across the dermis, capillary loops up into each papilla
  s += '<path d="M' + X0 + ' 440 C200 432 420 448 ' + X1 + ' 436" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M' + X0 + ' 440 C200 432 420 448 ' + X1 + ' 436" stroke="#c0503a" stroke-width="10" fill="none"/>';
  s += '<path d="M' + X0 + ' 456 C220 462 420 450 ' + X1 + ' 458" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M' + X0 + ' 456 C220 462 420 450 ' + X1 + ' 458" stroke="#4f6f99" stroke-width="10" fill="none"/>';
  for (k = 1; k < epiBot.length - 1; k += 3) { var p = epiBot[k]; s += '<path d="M' + f(p[0] - 6) + ' 438 C' + f(p[0] - 10) + ' ' + f(p[1] + 40) + ' ' + f(p[0] - 6) + ' ' + f(p[1] + 6) + ' ' + f(p[0]) + ' ' + f(p[1] + 6) + ' C' + f(p[0] + 6) + ' ' + f(p[1] + 6) + ' ' + f(p[0] + 10) + ' ' + f(p[1] + 40) + ' ' + f(p[0] + 6) + ' 452" stroke="#b5483a" stroke-width="2" fill="none" opacity=".8"/>'; }
  if (o.drug) for (k = 0; k < 14; k++) { var dx = X0 + ((k * 47 + t * 60) % (X1 - X0)); s += dot(dx, 440 + Math.sin(k) * 2, 4, o.drug); }
  // the injury: damaged cells in the middle of the dermis, prostaglandin drifting out of them
  if (sw > 0) {
    var cells = ""; for (k = 0; k < 9; k++) { var cx2 = 300 + (k % 3) * 30 + hash(k) * 8, cy2 = 330 + Math.floor(k / 3) * 26 + hash(k + 5) * 6; cells += '<path d="M' + f(cx2 - 12) + ' ' + f(cy2) + ' q4 -12 13 -10 q11 1 11 11 q-2 11 -12 11 q-10 -1 -12 -12 Z" fill="#a8473a" stroke="' + INK + '" stroke-width="1.3"/>' + C(cx2, cy2, 3, "#5b2a24", 0); }
    s += G("", cells, sw);
  }
  // the nerve: a fibre comes up out of the fat and splits into free endings in the epidermis
  var trunk = [[330, HB + 10], [330, 470], [332, 400], [330, 360]];
  s += nerve(trunk, 7);
  var tips = ENDINGS.map(function (e) { var tx = e[0], ty = topY(tx, sw, t) + 18; return [[330, 360], [lerp(330, tx, .5), 320], [tx, ty + 30], [tx, ty]]; });
  tips.forEach(function (b) { s += nerve(b, 3.5); });
  var sens = clamp(o.sens || 0);
  tips.forEach(function (b, i) { var e = b[3], g = sens * (.7 + .3 * Math.sin(t * 7 + i)); s += (g > 0 ? '<circle cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" r="' + f(8 + 10 * g) + '" fill="' + ORANGE + '" opacity="' + f(.35 * g) + '"/>' : "") + C(e[0], e[1], 4.5, g > .2 ? ORANGE : NERVE, 1.4); });
  // prostaglandin around the endings
  var rel = clamp(o.rel || 0), n = Math.round(22 * rel);
  for (k = 0; k < n; k++) { var a = hash(k + 3) * Math.PI * 2, rr = 30 + hash(k + 11) * 150 * clamp(rel * 1.4), px = 330 + Math.cos(a) * rr * 1.3 + 8 * Math.sin(t * 1.3 + k), py = 330 + Math.sin(a) * rr * .45 + 6 * Math.cos(t * 1.1 + k); s += pg(px, py, .9, k * 40 + t * 30); }
  // impulses running down the fibre toward the cord
  if (o.sig) { tips.forEach(function (b, i) { s += impulses(b.slice().reverse().concat([[332, 400], [330, 470], [330, HB + 10]]), t + i * .37, Math.max(1, Math.round(o.sig / 2)), 90 + 30 * o.sig, ORANGE, 4.5); }); }
  return s;
}

// ── villi of the small intestine (after histology plates: columnar epithelium, capillary net, central lacteal) ──
function villus(x, t, k, i) {
  var top = 230 + 20 * Math.sin(i * 2.1), s = "", w = 56;
  var out = "M" + (x - w) + " 640 L" + (x - w) + " " + (top + 50) + " Q" + (x - w) + " " + (top - 8) + " " + x + " " + (top - 8) + " Q" + (x + w) + " " + (top - 8) + " " + (x + w) + " " + (top + 50) + " L" + (x + w) + " 640";
  var inn = "M" + (x - w + 16) + " 640 L" + (x - w + 16) + " " + (top + 54) + " Q" + (x - w + 16) + " " + (top + 10) + " " + x + " " + (top + 10) + " Q" + (x + w - 16) + " " + (top + 10) + " " + (x + w - 16) + " " + (top + 54) + " L" + (x + w - 16) + " 640";
  s += '<path d="' + out + ' Z" fill="#eab9a2" stroke="' + INK + '" stroke-width="2"/>';
  for (var y = top + 54; y < 640; y += 15) s += '<path d="M' + (x - w) + ' ' + y + ' h16 M' + (x + w - 16) + ' ' + y + ' h16" stroke="#b9826c" stroke-width="1.1"/>';
  for (var a = 0; a < 9; a++) { var an = Math.PI + a / 8 * Math.PI, rx = x + Math.cos(an) * (w - 8), ry = top + 50 + Math.sin(an) * (58 - 8) * .98; s += C(rx, ry, 2.4, "#7a4a3a", 0); }
  s += '<path d="' + inn + ' Z" fill="#f4dccb" stroke="' + INK + '" stroke-width="1.3"/>';
  // capillary net: arteriole up the left, venule down the right, a mesh between
  s += '<path d="M' + (x - 26) + ' 640 V' + (top + 50) + ' Q' + x + ' ' + (top + 18) + ' ' + (x + 26) + ' ' + (top + 50) + ' V640" stroke="#c0503a" stroke-width="4" fill="none"/>';
  s += '<path d="M' + (x + 26) + ' ' + (top + 70) + ' V640" stroke="#4f6f99" stroke-width="5" fill="none"/>';
  for (y = top + 80; y < 620; y += 34) s += '<path d="M' + (x - 26) + ' ' + y + ' q10 10 26 4 q14 -6 26 8" stroke="#b5483a" stroke-width="1.6" fill="none"/>';
  s += R(x - 5, top + 60, 10, 640 - top - 60, "#f3ecc8", 1.2, 5);   // lacteal
  // drug crossing in: dots on the surface, then sliding down the venule
  if (k > 0) for (var j = 0; j < 5; j++) { var q = ((t * .35 + j / 5 + i * .13) % 1); var px = x + 26, py = lerp(top + 70, 640, q); s += dot(px, py, 4.5, clamp(k * 2)); }
  return s;
}
function villi(t, k) {
  var s = R(-40, 640, 720, 200, "#c97f6a", 2) + '<rect x="-40" y="640" width="720" height="200" fill="url(#hatch)" opacity=".35"/>';
  s += R(-40, 700, 720, 140, "#b86d5a", 1.6);
  [95, 245, 395, 545].forEach(function (x, i) { s += villus(x, t, k, i); });
  // drug in the gut, drifting down toward the villi
  for (var j = 0; j < 16; j++) { var x = 30 + hash(j) * 580, y = 60 + ((hash(j + 4) * 300 + t * 26 * (1 + hash(j + 8))) % 200) + 120 * k; if (y < 200 + 40 * hash(j)) s += dot(x, y, 5, 1 - .6 * k); }
  return s;
}

// ── COX on its membrane (after the crystal structure of COX-1 with ibuprofen, PDB 1EQG: a dimer that sits in one leaflet,
// each half with a long channel from the membrane up to the active site) ──
var CHAN = [[214, 610], [208, 566], [214, 520], [226, 480], [236, 446]];
function membrane(t) {
  var s = '<rect x="-60" y="586" width="760" height="96" fill="#efe3c4"/>';
  for (var x = -60; x < 700; x += 18) {
    [596, 672].forEach(function (y, r) { var w = 2 * Math.sin(t * 2 + x * .1 + r); s += '<path d="M' + f(x - 3) + ' ' + (r ? y - 8 : y + 8) + ' q' + f(w) + ' ' + (r ? -14 : 14) + ' 0 ' + (r ? -26 : 26) + ' M' + f(x + 3) + ' ' + (r ? y - 8 : y + 8) + ' q' + f(-w) + ' ' + (r ? -14 : 14) + ' 0 ' + (r ? -26 : 26) + '" stroke="#b9a678" stroke-width="1.4" fill="none"/>' + C(x, y, 8, "#d9b98a", 1.3); });
  }
  return s;
}
function coxHalf(m, col) {   // m = -1 left monomer, +1 right (mirrored about x = 320)
  var tr = m > 0 ? "translate(640 0) scale(-1 1)" : "";
  var body = "M120 520 C70 470 70 360 120 300 C160 250 240 230 300 262 C330 280 336 330 322 380 C316 430 330 480 300 530 C280 566 250 578 224 572 C190 582 150 560 120 520 Z";
  var mbd = "M168 548 C170 590 196 606 214 604 C236 604 256 588 258 552 Z";
  var s = '<path d="' + mbd + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + '<path d="' + body + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // a knobbly molecular surface: bumps and shading arcs
  for (var k = 0; k < 16; k++) { var bx = 110 + hash(k + 20) * 200, by = 290 + hash(k + 40) * 250; s += '<path d="M' + f(bx) + ' ' + f(by) + ' q8 -9 16 0" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".35"/>'; }
  s += '<path d="M290 280 C320 320 312 420 300 470" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".3"/>';
  // the channel: membrane opening → active site
  s += '<path d="' + polyD(CHAN) + '" stroke="' + INK + '" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + polyD(CHAN) + '" stroke="#5c5338" stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  s += C(240, 438, 14, "#4b432c", 1.6);
  // EGF domain at the dimer interface
  s += '<path d="M300 300 C330 290 340 320 324 336 C310 344 296 330 300 300 Z" fill="#8b9361" stroke="' + INK + '" stroke-width="1.6"/>';
  return G(tr, s);
}
function cox(t, op) { return coxHalf(-1, "#aab37c") + coxHalf(1, "#9ea873"); }
// arachidonic acid: a 20-carbon chain with four cis kinks and the acid head (drawn along the channel when it goes in)
function arach(x, y, rot, s, col) {
  var pts = [], a = 0, px = 0, py = 0; for (var i = 0; i < 20; i++) { pts.push([px, py]); var turn = [5, 8, 11, 14].indexOf(i) >= 0 ? .55 : 0; a += turn; var z = i % 2 ? -.5 : .5; px += 9 * Math.cos(a + z); py += 9 * Math.sin(a + z); }
  var d = polyD(pts); return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ") scale(" + f(s || 1) + ")", '<path d="' + d + '" stroke="' + (col || "#5d6a78") + '" stroke-width="3" fill="none" stroke-linejoin="round"/>' + C(pts[19][0], pts[19][1], 5, "#c0503a", 1.2));
}
// ibuprofen, skeletal formula: isobutyl — benzene — CH(CH3)COOH
function ibuprofen(x, y, s, rot, col) {
  col = col || BLUE; var r = 14, ring = [], i;
  for (i = 0; i < 6; i++) ring.push([r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)]);
  var d = polyD(ring) + " Z";
  [[1, 2], [3, 4], [5, 0]].forEach(function (b) { var p = ring[b[0]], q = ring[b[1]]; d += " M" + f(p[0] * .7) + " " + f(p[1] * .7) + " L" + f(q[0] * .7) + " " + f(q[1] * .7); });
  d += " M14 0 L26 -7 L26 -21 M26 -7 L38 0 L50 -7 M38 0 L38 14 M42 0 L42 13";   // CH(CH3)–COOH (C=O double bond)
  d += " M-14 0 L-26 -7 L-38 0 L-50 -7 M-38 0 L-38 14";                           // isobutyl
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s) + ")", '<path d="' + d + '" stroke="' + col + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + T("OH", 58, -4, 11, col, 800) + T("O", 40, 25, 11, col, 800));
}
// aspirin, skeletal formula: benzene with COOH and the acetyl ester next to each other
function aspirin(x, y, s, col) {
  col = col || BLUE; var r = 22, ring = [], i;
  for (i = 0; i < 6; i++) ring.push([r * Math.cos(Math.PI / 2 + i * Math.PI / 3), r * Math.sin(Math.PI / 2 + i * Math.PI / 3)]);
  var d = polyD(ring) + " Z";
  [[0, 1], [2, 3], [4, 5]].forEach(function (b) { var p = ring[b[0]], q = ring[b[1]]; d += " M" + f(p[0] * .72) + " " + f(p[1] * .72) + " L" + f(q[0] * .72) + " " + f(q[1] * .72); });
  // ring[3] is the top vertex (0,-22), ring[4] the upper-left one
  d += " M0 -22 L0 -44 L-19 -55 M0 -44 L19 -55 M3 -44 L22 -55";          // COOH (one C=O)
  d += " M19 -11 L38 -22 L57 -11 L76 -22 M57 -11 L57 11 M61 -11 L61 11";    // O–C(=O)–CH3
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="' + d + '" stroke="' + col + '" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + T("OH", -30, -56, 15, col, 800) + T("O", 28, -58, 15, col, 800) + T("O", 38, -28, 15, col, 800) + T("O", 59, 26, 15, col, 800));
}

// ── analogies ──
// an electric alarm bell: gong, striker, the coil box under it; rings harder with k
function bell(k, t) {
  var j = Math.sin(t * 40) * 6 * k, s = '<circle r="40" fill="#c8513a" stroke="' + INK + '" stroke-width="2.4"/><circle r="27" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/><circle r="7" fill="' + INK + '"/>';
  s += R(-14, 38, 28, 22, "#8c8475", 1.8) + '<path d="M0 38 L' + f(j) + ' 22" stroke="' + INK + '" stroke-width="4"/>' + C(j, 20, 6, "#d8ccae", 1.6);
  for (var i = 1; i <= 3; i++) { var o = clamp(k * 3 - i + 1) * (.6 + .4 * Math.sin(t * 10 + i)); s += '<path d="M' + (48 + i * 12) + ' -24 q12 24 0 48 M' + (-48 - i * 12) + ' -24 q-12 24 0 48" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(o) + '"/>'; }
  return s;
}
// pin-tumbler lock cut open with a snapped key stuck in the plug (reference v01: the lock cross-section)
function lockKey(k) {
  var s = R(-70, -40, 140, 80, "#c9b48a", 2) + R(-70, -6, 140, 34, "#b39a6a", 1.6);
  for (var i = 0; i < 4; i++) { var x = -48 + i * 30; s += '<path d="M' + x + ' -38 q-5 4 0 8 q5 4 0 8 q-5 4 0 8" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' + R(x - 5, -14, 10, 14, "#7a8a96", 1.3) + R(x - 5, 0, 10, 10 + (i % 2) * 4, "#d4a54a", 1.3); }
  s += G("translate(" + f(lerp(-120, 0, k)) + " 0)", '<path d="M-64 14 L60 14 L56 22 L48 18 L42 24 L34 18 L26 22 L-64 22 Z" fill="#d6c79a" stroke="' + INK + '" stroke-width="1.6"/>');
  return s + G("", '<path d="M-74 10 l-30 -8 l-14 20 l30 10 Z" fill="#d6c79a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-70 4 l6 6 l-6 6 l6 6" stroke="' + ORANGE + '" stroke-width="2.4" fill="none"/>', clamp(k * 2 - 1));
}
// a little town in three-quarter view, rain over all of it; one house burns and the rain puts it out (k 0→1)
function town(t, k) {
  var ISO = function (o, x, y, z) { return [o[0] + (x - y) * .866, o[1] + (x + y) * .5 - z]; };
  var poly = function (o, pts, fill, w) { return '<path d="' + pts.map(function (p, i) { var q = ISO(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (w || 2) + '" stroke-linejoin="round"/>'; };
  // a house: footprint W along x, D along y, walls H high, a gable roof with its ridge along x
  var house = function (o, W, D, H, wall, roof) {
    var R2 = 46, s = poly(o, [[0, 0, H], [W, 0, H], [W, D / 2, H + R2], [0, D / 2, H + R2]], roof);
    s += poly(o, [[0, D, 0], [W, D, 0], [W, D, H], [0, D, H]], wall) + poly(o, [[W, 0, 0], [W, D, 0], [W, D, H], [W, D / 2, H + R2], [W, 0, H]], "#d8c9a6");
    s += poly(o, [[0, D, H], [W, D, H], [W, D / 2, H + R2], [0, D / 2, H + R2]], roof) + poly(o, [[0, D + 4, H - 2], [W + 4, D + 4, H - 2], [W + 4, D + 4, H + 2], [0, D + 4, H + 2]], "#5a4636", 1);
    for (var i = 0; i < 2; i++) s += poly(o, [[W * (.2 + i * .45), D, H * .45], [W * (.2 + i * .45) + 22, D, H * .45], [W * (.2 + i * .45) + 22, D, H * .8], [W * (.2 + i * .45), D, H * .8]], "#9fb7c3", 1.4);
    return s + poly(o, [[W, D * .35, 0], [W, D * .65, 0], [W, D * .65, H * .62], [W, D * .35, H * .62]], "#6a5a48", 1.4);
  };
  var s = poly([320, 300], [[-700, -600, 0], [900, -600, 0], [900, 900, 0], [-700, 900, 0]], "#cfc4a6");
  s += house([150, 380], 120, 90, 80, "#ece2c8", "#b0573c") + house([440, 330], 110, 90, 90, "#e8dcc0", "#7a5a40") + house([300, 520], 130, 100, 90, "#ece2c8", "#8a6a4c");
  // fire on the front house's roof, shrinking as the rain lands; smoke after
  var fire = 1 - k, fx0 = 262, fy0 = 414;
  if (fire > 0) for (var i = 0; i < 5; i++) { var fx = fx0 + i * 24, fy = fy0 + i * 13.8, fh = (46 + 16 * Math.sin(t * 8 + i)) * fire; s += '<path d="M' + f(fx - 13) + ' ' + f(fy) + ' Q' + f(fx - 6) + ' ' + f(fy - fh * .6) + ' ' + f(fx + 2 * Math.sin(t * 6 + i)) + ' ' + f(fy - fh) + ' Q' + f(fx + 8) + ' ' + f(fy - fh * .5) + ' ' + f(fx + 13) + ' ' + f(fy) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(fx - 5) + ' ' + f(fy) + ' Q' + f(fx) + ' ' + f(fy - fh * .5) + ' ' + f(fx + 5) + ' ' + f(fy) + ' Z" fill="#efc15a"/>'; }
  if (k > .4) for (i = 0; i < 4; i++) { var u = (t * .4 + i / 4) % 1; s += '<circle cx="' + f(300 + 30 * u + i * 14) + '" cy="' + f(400 - 150 * u) + '" r="' + f(10 + 18 * u) + '" fill="#a9a294" stroke="' + INK + '" stroke-width="1.2" opacity="' + f((1 - u) * (k - .4) * 1.6) + '"/>'; }
  // rain everywhere
  for (var j = 0; j < 70; j++) { var x = hash(j) * 720 - 40, y = ((hash(j + 7) * 820 + t * 420) % 820) - 40; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-6 18" stroke="' + BLUE + '" stroke-width="2.4" stroke-linecap="round"/>'; }
  return s;
}

// ── the stomach wall in section (after histology: acid in the lumen, a mucus gel, columnar surface cells with gastric pits) ──
function stomachWall(t, mucus, hurt) {
  var s = "", x, k;
  for (k = 0; k < 26; k++) { var hx2 = 30 + hash(k) * 580, hy = 60 + ((hash(k + 3) * 200 + t * 18) % 200) + lerp(0, 120, 1 - mucus) * hash(k + 9); s += N("H⁺", hx2, hy, 20, ORANGE); }
  var my = 320 - 90 * mucus;   // top of the mucus gel
  s += '<path d="M-60 ' + f(my) + ' ' + (function () { var d = ""; for (x = -60; x <= 700; x += 20) d += "L" + x + " " + f(my + 6 * Math.sin(x * .04 + t)); return d; })() + ' L700 330 L-60 330 Z" fill="#b8c9cc" stroke="' + INK + '" stroke-width="1.8" opacity=".9"/>';
  s += '<path d="M-60 ' + f(my + 10) + ' L700 ' + f(my + 10) + '" stroke="#e8eef0" stroke-width="2" stroke-dasharray="14 10" opacity="' + f(mucus) + '"/>';
  // surface epithelium: a row of tall cells, two gastric pits dipping into it
  var ccol = rgbHex(hexRGB("#eebfa8").map(function (v, i) { return lerp(v, [214, 110, 80][i], hurt); }));
  s += R(-60, 330, 760, 110, ccol, 2);
  for (x = -50; x < 700; x += 26) { s += '<path d="M' + x + ' 330 V440" stroke="#b9826c" stroke-width="1.2"/>' + '<ellipse cx="' + (x + 13) + '" cy="412" rx="6" ry="9" fill="#7a4a3a"/>' + '<path d="M' + (x + 3) + ' 336 h20 v26 h-20 Z" fill="#f5eedc" opacity=".8"/>'; }
  [170, 460].forEach(function (px) { s += '<path d="M' + (px - 18) + ' 330 V430 Q' + px + ' 452 ' + (px + 18) + ' 430 V330 Z" fill="#b8c9cc" stroke="' + INK + '" stroke-width="1.6"/>'; });
  s += R(-60, 440, 760, 140, "#e2a796", 2) + '<rect x="-60" y="440" width="760" height="140" fill="url(#hatch)" opacity=".3"/>';
  s += '<path d="M-60 500 C140 490 420 512 700 498" stroke="#c0503a" stroke-width="7" fill="none"/>';
  s += R(-60, 580, 760, 260, "#c97f6a", 2);
  for (k = 0; k < 8; k++) s += '<path d="M-60 ' + (600 + k * 22) + ' C200 ' + (590 + k * 22) + ' 400 ' + (612 + k * 22) + ' 700 ' + (598 + k * 22) + '" stroke="#a75d4a" stroke-width="1.4" fill="none"/>';
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: the rule card pinned over the body with its brain
shot(4, push(300, 300, 1.25, 1.35), function (u, d, t) {
  return paper() + body() + brainFront(300, 52, .95) + G("", '<rect x="150" y="430" width="300" height="140" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 300 500)"/>' +
    T("الوجع", 300, 486, 40, ORANGE, 800) + T("بيتحس في المخ", 300, 540, 30, INK, 700) + C(300, 436, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · the endings in the fingertip send a signal up the arm and the cord; the brain is what feels it
shot(5, push(260, 320, 1.15, 1.3), function (u, d, t) {
  var k = at(u, .2, .8), s = paper() + body() + spine(300, 92, 420) + nerve(ARM_NERVE, 4);
  s += brainFront(300, 52, .95, at(u, 2.6, .6) > 0 ? "#d98a5a" : "#9db27e") + burst(140, 510, 24, k, t);
  if (u > 1.1) s += impulses(ARM_NERVE.slice().reverse().concat([[300, 140], [300, 90]]), t, 3, 230, ORANGE, 6);
  return s + label(140, 510, 200, 620, "أطراف الأعصاب", OLIVE, at(u, .8, .5), 22) + label(318, 44, 430, 90, "المخ", BLUE, at(u, 2.6, .5), 24);
});
// 6 · the tablet dissolves in the stomach (real plate), the drug moves on into the small intestine
shot(6, push(330, 530, 1.25, 1.15), function (u, d, t) {
  var k = at(u, .4, 1.6), s = paper() + digest();
  var sx = STC[0], sy = STC[1]; s += G("", stomach("none", ORANGE, 3.5), at(u, .6, .4) * (.6 + .4 * Math.sin(t * 4))); s += G("", pill(sx + 4 * Math.sin(t * 2), sy, 1.1 * (1 - .8 * k), 20 + 10 * Math.sin(t)), 1 - k * .7);
  for (var j = 0; j < 18; j++) { var a = hash(j) * Math.PI * 2, r = 8 + 40 * k * hash(j + 2), q = at(u, 1.8 + hash(j) * .6, 1.2); var x = lerp(sx + Math.cos(a) * r, 250 + hash(j + 5) * 120, q), y = lerp(sy + Math.sin(a) * r * .7, 590 + hash(j + 6) * 100, q); if (k > .05) s += dot(x, y, 4); }
  return s + label(380, 460, 460, 380, "المعدة", OLIVE, at(u, .6, .5), 24) + label(300, 650, 420, 750, "الأمعاء", OLIVE, at(u, 2.4, .5), 24);
});
// 6b · into the blood: villi of the small intestine, the drug crosses the lining into the capillaries
shot([6, 2], push(320, 420, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .3, 1.2); return paper() + villi(t, k) + label(395, 300, 520, 150, "الخملات", OLIVE, at(u, .4, .5), 22) + label(421, 520, 600, 560, "الدم", ORANGE, at(u, 1.1, .5), 24);
}, { tr: "in" });
// 7 · the blood goes round the whole body in about a minute: the drug spreads through every real vessel from the heart
shot(7, push(300, 420, .95, 1.0), function (u, d, t) {
  var k = at(u, .2, 2.6), s = paper() + body() + vessels() + drugVessels(620 * k);
  var h = u * 2.4, cx = 520, cy = 120;
  s += G("", C(cx, cy, 44, "#f4ecdb", 2.4) + '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.sin(h) * 34) + ' ' + f(cy - Math.cos(h) * 34) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + R(cx - 6, cy - 58, 12, 10, INK, 0) + C(cx, cy, 4, INK, 0) + T("~ دقيقة", cx, cy + 74, 24, INK, 800), at(u, .4, .3));
  return s + label(300, 30, 140, 70, "راسك", ORANGE, at(u, 3.2, .4), 22) + label(262, 805, 120, 760, "صباع رجلك", ORANGE, at(u, 3.6, .4), 22);
}, { tr: "out" });
// 8 · the drug is everywhere — so why does it work only where it hurts? (the head burst, a question mark)
shot(8, push(300, 300, 1.15, 1.3), function (u, d, t) {
  return paper() + body() + vessels() + drugVessels(900) + burst(300, 36, 20, 1, t) + T("؟", 450, 260, 150, ORANGE, 800);
});
// 9 · the inflamed spot: damaged cells release prostaglandin (tissue block)
shot(9, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .2, 1.2); return paper() + tissue(t, { inf: k, rel: at(u, 1.2, 2) }) + label(300, 340, 190, 160, "خلايا ملتهبة", ORANGE, at(u, .8, .4), 22) + label(420, 300, 440, 120, "بروستاجلاندين", ORANGE, at(u, 2.0, .5), 22);
}, { tr: "out" });
// 10 · prostaglandin turns the nerve endings up: a touch is enough to send pain
shot(10, push(330, 300, 1.3, 1.5), function (u, d, t) {
  var k = at(u, .3, 1); return paper() + tissue(t, { inf: 1, rel: 1, sens: k, sig: 1 + 5 * at(u, 1.6, 1) }) + label(262, 214, 300, 110, "طرف العصب", OLIVE, at(u, .5, .5), 22);
}, { tr: "in" });
// 11 · like an alarm bell someone turned all the way up
shot(11, push(330, 300, 1.5, 1.6), function (u, d, t) {
  return paper() + tissue(t, { inf: 1, rel: 1, sens: 1, sig: 6 }) + iconBox(440, 170, 130, G("translate(0 -10) scale(.8)", bell(at(u, .2, .6), t)), at(u, .1, .3));
});
// 12 · prostaglandin is made by an enzyme, COX, sitting in a cell membrane: arachidonic acid in, prostaglandin out
function coxScene(u, t, block) {
  var s = membrane(t) + cox(t);
  // a cycle of 2.2 s: the chain slides along the channel; a prostaglandin leaves the top
  for (var m = -1; m <= 1; m += 2) {
    var cyc = ((t + (m > 0 ? 1.1 : 0)) % 2.2) / 2.2, mx = function (x) { return m > 0 ? 640 - x : x; };
    var stop = block ? .38 : 1, q = Math.min(cyc / .6, stop), p = polyAt(CHAN, q);
    if (!block || m > 0 && block < 1) { s += arach(mx(p[0] - 20), p[1] + 10, m > 0 ? -100 : -80, .9); }
    else { var b = cyc < .5 ? cyc / .5 : 1 - (cyc - .5) / .5; p = polyAt(CHAN, .18 * b); s += arach(mx(p[0] - 30), p[1] + 20, -80, .9); }
    if (!block && cyc > .6) { var w = (cyc - .6) / .4; s += pg(mx(240 + 60 * w), 430 - 330 * w, 1.6, 40 * w, 1 - w * .5); }
  }
  return s;
}
shot(12, push(320, 430, 1.0, 1.06), function (u, d, t) {
  return paper() + coxScene(u, t, 0) + label(160, 330, 250, 170, "إنزيم كوكس", OLIVE, at(u, .3, .5), 24) + label(420, 640, 470, 740, "غشا الخلية", MUTE, at(u, .8, .5), 20);
});
// 13 · ibuprofen goes into the channel and plugs it; the chain can't get in (chunk 3: a snapped key in a lock)
shot(13, push(260, 450, 1.15, 1.25), function (u, d, t) {
  var k = at(u, .2, 1.6), p = polyAt(CHAN, lerp(-.2, .82, k)), s = paper() + coxScene(u, t, k > .99 ? 1 : 0);
  s += ibuprofen(k < .01 ? 120 : p[0], k < .01 ? 700 : p[1], .85, -70 + 10 * Math.sin(t * 2));
  return s + label(p[0] + 20, p[1], 330, 200, "إيبوبروفين", BLUE, at(u, .6, .5), 22) + cross(140, 620, .9, at(u, 2.6, .4)) +
    iconBox(410, 660, 150, G("scale(.95)", lockKey(at(u, d * .62, .8))), at(u, d * .58, .3));
});
// 14 · less prostaglandin, the endings calm down, fewer signals go to the brain
shot(14, push(330, 320, 1.4, 1.2), function (u, d, t) {
  var k = at(u, .2, d - .6); return paper() + tissue(t, { inf: 1 - .4 * k, rel: 1 - k, sens: 1 - k, sig: lerp(6, .6, k), drug: 1 }) + G("", ibuprofen(130, 120, 1.1, 0), at(u, .2, .3));
}, { tr: "out" });
// 15 · the rest of the body: no alarm there, so nothing to feel
shot(15, push(300, 420, .95, 1.0), function (u, d, t) {
  var s = paper() + body() + vessels() + drugVessels(900) + burst(300, 36, 20, 1 - .7 * at(u, 1.2, 1.4), t);
  [[150, 470], [275, 640], [330, 790], [340, 330]].forEach(function (p, i) { s += G("", C(p[0], p[1], 15, "#f4ecdb", 1.8) + '<path d="M' + (p[0] - 9) + ' ' + p[1] + ' h18" stroke="' + MUTE + '" stroke-width="3"/>', at(u, .3 + i * .2, .3)); });
  return s + tag("مفيش إنذار", 480, 560, at(u, .9, .3), 26, MUTE);
});
// 16 · rain on the whole town only puts out the house that's on fire
shot(16, push(320, 420, 1.0, 1.06), function (u, d, t) { return paper() + town(t, at(u, 1.2, d - 1.4)); }, { tr: "out" });
// 17 · then why can it upset your stomach? (real plate, stomach close up, the drug reaches it too)
shot(17, push(335, 485, 2.2, 2.0), function (u, d, t) {
  var s = paper() + digest() + G("", stomach("none", ORANGE, 3), .6 + .4 * Math.sin(t * 4)); for (var j = 0; j < 12; j++) s += dot(290 + hash(j) * 90 + 4 * Math.sin(t * 2 + j), 455 + hash(j + 2) * 55, 3);
  return s + T("؟", 430, 450, 70, ORANGE, 800);
}, { tr: "in" });
// 18 · the same enzyme keeps the mucus that guards the stomach from acid; the drug thins it
shot(18, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, 1.6, d - 1.8); return paper() + stomachWall(t, 1 - .75 * k, k) + label(320, 270, 460, 150, "طبقة الحماية", BLUE, at(u, .3, .5), 24) + label(150, 140, 250, 60, "الحمض", ORANGE, at(u, .9, .5), 22);
}, { tr: "in" });
// 19 · that's why: take it after food; and the proof it goes everywhere
shot(19, push(330, 480, 1.7, 1.6), function (u, d, t) {
  var s = paper() + digest() + stomach("none", ORANGE, 3); for (var j = 0; j < 14; j++) s += dot(290 + hash(j) * 90, 455 + hash(j + 2) * 55, 3);
  s += iconBox(240, 345, 110, '<ellipse cx="0" cy="10" rx="46" ry="16" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="6" rx="30" ry="9" fill="#e0c9a0" stroke="' + INK + '" stroke-width="1.4"/><path d="M-20 4 q6 -12 14 -2 q8 -10 16 0" fill="#c98a4a" stroke="' + INK + '" stroke-width="1.2"/><path d="M-12 -18 q4 -8 0 -14 M2 -18 q4 -8 0 -14 M16 -18 q4 -8 0 -14" stroke="' + MUTE + '" stroke-width="1.6" fill="none"/>', at(u, .2, .3));
  return s + check(420, 410, 1.1, at(u, d * .55, .5), OLIVE);
});
// 20 · the myth: a pill that steers itself to the head — crossed out
shot(20, push(300, 300, 1.15, 1.25), function (u, d, t) {
  var k = at(u, .3, 1.6), p = polyAt([[320, 300], [360, 220], [330, 140], [300, 60]], k);
  return paper() + body() + burst(300, 36, 18, 1, t) + draw("M320 300 L360 220 L330 140 L300 60", k, ORANGE, 3, ' stroke-dasharray="8 7"') + pill(p[0], p[1], .9, 30) + cross(330, 180, 1.5, at(u, d * .8, .5));
}, { tr: "out" });
// 21 · it goes round the whole body; the difference shows only where the alarm is
shot(21, push(300, 420, .96, 1.02), function (u, d, t) {
  return paper() + body() + vessels() + drugVessels(900) + burst(300, 36, 20, 1 - .6 * at(u, 1.6, 1.2), t) + check(470, 420, 1.3, at(u, .6, .5), OLIVE) + label(300, 36, 430, 120, "الإنذار", ORANGE, at(u, 1.6, .5), 24);
});
// 22 · recap: ① the blood carries it ② it blocks COX ③ the alarm goes down where it was loud
shot(22, push(300, 420, 1.0, .95), function (u, d, t) {
  var s = paper() + body() + vessels() + drugVessels(900) + burst(300, 36, 18 * (1 - .5 * at(u, 3, 1)), 1, t);
  s += callout("1", 360, 235, at(u, .3, .3), 18) + iconBox(500, 380, 170, G("translate(-80 -105) scale(.25)", cox(t)) + ibuprofen(-21, 6, .4, -70), at(u, 1.4, .3)) + callout("2", 500, 280, at(u, 1.5, .3), 18) + callout("3", 350, 40, at(u, 2.8, .3), 18);
  return s;
}, { tr: "out" });
// 23 · the odd fact: aspirin was sold for more than 70 years before anyone knew how it works (1899 → 1971)
shot(23, push(320, 400, 1.0, .96), function (u, d, t) {
  var k = at(u, 1.2, 2.6), s = paper() + appear(at(u, 0, .4), aspirin(250, 300, 2.1)) + label(250, 230, 470, 160, "أسبرين", BLUE, at(u, .4, .5), 26);
  s += draw("M90 560 L550 560", at(u, .8, .5), INK, 3) + G("", N("1899", 90, 610, 30) + R(86, 548, 8, 24, INK, 0), at(u, .8, .3));
  s += R(90, 552, 460 * k, 16, ORANGE, 1.6) + G("", N("1971", 550, 610, 30, ORANGE) + R(546, 548, 8, 24, INK, 0), at(u, 3.6, .3));
  return s + N(count(72, k), 320, 690, 64, ORANGE) + G("", T("سنة", 320, 735, 26, INK, 700), at(u, 1.4, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the head aches, a tablet at the mouth. line 1: it goes down into the stomach and the ache fades. line 2: who told it?
  var l1 = LN[1], k = clamp((t - l1.start) / Math.max(1, l1.end - l1.start)), s = "";
  s += G("translate(-150 20) scale(1.5)", body() + '<path d="M300 92 V296" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".6"/>' + G("translate(300 280) scale(.42) translate(-300 -412)", stomach("#dba184", INK, 3)) +
    burst(300, 34, 16, li === 0 ? 1 : 1 - .75 * clamp((k - .5) * 2.5), t));
  var py = li === 0 ? 92 : lerp(92, 312, clamp(k * 1.6)), px = li === 0 ? 300 : lerp(300, 313, clamp(k * 1.6 - .6));
  s += G("translate(-150 20) scale(1.5)", pill(px, py, .45, 0));
  if (li >= 1) s += G("", R(470, 40, 120, 70, "#f4ecdb", 1.6) + N("30", 510, 90, 34, ORANGE) + T("دقيقة", 562, 86, 16, INK, 700), ease((t - l1.start) / .4));
  if (li >= 2) { var u = t - LN[2].start; s += draw("M370 500 C470 400 460 160 330 90", ease(u / .6), ORANGE, 4, ' stroke-dasharray="10 8"') + G("", T("؟", 520, 300, 120, ORANGE, 800), ease((u - .3) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 110) rotate(" + f(-20 + 10 * Math.sin(t * 1.2)) + ")", pill(0, 0, 2.4, 0)) + dot(40 + 8 * Math.sin(t * 2), 160, 6) + dot(130, 165 + 6 * Math.cos(t * 2), 5) + dot(85, 175, 4);
};
SCENE.outro = function (svg, u, t) {
  var s = G("translate(74 4) scale(.32)", body() + vessels() + drugVessels(900) + burst(300, 36, 22, 1, t));
  s += G("translate(330 -50) scale(.4)", cox(t)) + pg(540, 70 + 6 * Math.sin(t * 2), 1.6, t * 20) + pg(500, 40, 1.3, 60);
  return s + callout("1", 200, 80, ease(u / .3)) + callout("2", 400, 60, ease(u / .3 - .5)) + callout("3", 570, 40, ease(u / .3 - 1)) + callout("4", 196, 14, ease(u / .3 - 1.5));
};
