// ── «الكلب بتاعك بيشوفك إزاي؟» — drawings. Shapes from real references (refs/SOURCES.md): the dog in dog.js; eye cuts
// after the human fovea vs the dog's area centralis with the tapetum behind the retina; cone curves after Neitz 1989
// (dog peaks ≈ 429 and 555 nm) and the human S/M/L curves (≈ 420/530/560); the snout cut after Craven et al. 2010
// (maxilloturbinates at the front, the lamina transversa shelf, the ethmoturbinates in the olfactory recess at the back,
// the olfactory bulb behind them); the nostril with its side slit; the brain cuts after the dog and human brain atlases.
// People: the shared person kit (videos/_templates/people/person.js), the owner in a red T-shirt so the colour point shows.

var WALL = "#e7dcc3", FLOOR = "#cdb48c", FLOOR_D = "#b39a72", RUG = "#a9b8a0", PLANT = "#6f8a45", PLANT_D = "#4f6a33", POT = "#b56a45",
    SHIRT = "#b8473a", SHIRT_D = "#93362b", JEANS = "#4b5f7e", JEANS_D = "#394a66", RETINA = "#c97a68", TAPETUM = "#5fa39a", BRAIN = "#d9a8a0", BRAIN_D = "#b9857c";
var OWNER = { base: "casual", colors: { shirt: SHIRT, shirtD: SHIRT_D, pants: JEANS, pantsD: JEANS_D } };
function breath(t, k) { return (Math.sin(t * 1.7 + (k || 0)) + 1) / 2; }
function blink(t, k) { return ((t + (k || 0)) * 1000) % 3700 < 130 ? .05 : 1; }

// ── the dog's eye as a filter: blur (≈ 20/75 acuity) and a dichromat colour matrix (red and green fold into yellow-grey,
// blue stays). Machado / Viénot deuteranope matrix, the usual stand-in for dog vision.
var DOGM = [.625, .375, 0, 0, 0, .7, .3, 0, 0, 0, 0, .3, .7, 0, 0, 0, 0, 0, 1, 0];
function dvDefs(b) { return '<defs><filter id="dogv' + b + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="' + b + '"/><feColorMatrix type="matrix" values="' + DOGM.join(" ") + '"/></filter>' +
  '<filter id="grey" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs>'; }
function dogView(inner, b) { b = b || 5; return dvDefs(b) + '<g filter="url(#dogv' + b + ')">' + inner + '</g>'; }
// the same colour through the dog's eye, for flat swatches
function dvHex(h) { var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16);
  var R2 = DOGM[0] * r + DOGM[1] * g + DOGM[2] * b, G2 = DOGM[5] * r + DOGM[6] * g + DOGM[7] * b, B2 = DOGM[10] * r + DOGM[11] * g + DOGM[12] * b;
  return "#" + [R2, G2, B2].map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(""); }
// a split view: left of x shows `a`, right shows `b`, with a divider line and a knob
function split(x, a, b, y0, y1) {
  var id1 = "sp" + (++CLIPN), id2 = "sp" + (++CLIPN);
  return '<clipPath id="' + id1 + '"><rect x="-2000" y="-2000" width="' + f(x + 2000) + '" height="4800"/></clipPath><clipPath id="' + id2 + '"><rect x="' + f(x) + '" y="-2000" width="4000" height="4800"/></clipPath>' +
    '<g clip-path="url(#' + id1 + ')">' + a + '</g><g clip-path="url(#' + id2 + ')">' + b + '</g>' +
    '<path d="M' + f(x) + ' ' + (y0 || -100) + ' V' + (y1 || 900) + '" stroke="' + INK + '" stroke-width="3"/>' + C(x, ((y0 || -100) + (y1 || 900)) / 2, 11, PAPER, 2.4);
}

// ── the living room (side view, eye level) ──
function room(fl, opt) {
  opt = opt || {}; var s = '<rect x="-400" y="-400" width="1440" height="' + (fl + 400) + '" fill="' + WALL + '"/>';
  s += '<path d="M-400 ' + (fl - 22) + ' H1040" stroke="' + INK + '" stroke-width="1.6"/>' + R(-400, fl - 22, 1440, 22, "#ddd0b4", 0);
  s += R(-400, fl, 1440, 500, FLOOR, 0) + '<path d="M-400 ' + fl + ' H1040" stroke="' + INK + '" stroke-width="2.6"/>';
  for (var k = 0; k < 6; k++) s += '<path d="M-400 ' + (fl + 26 + k * 34 + k * k * 4) + ' H1040" stroke="' + FLOOR_D + '" stroke-width="1.4"/>';
  if (opt.rug !== false) s += '<ellipse cx="' + (opt.rugX || 320) + '" cy="' + (fl + 34) + '" rx="300" ry="30" fill="' + RUG + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + (opt.rugX || 320) + '" cy="' + (fl + 34) + '" rx="270" ry="22" fill="none" stroke="#c97a55" stroke-width="3"/>';
  if (opt.frame !== false) s += R((opt.frameX || 430) - 60, fl - 420, 120, 90, "#efe6d0", 2.4) + '<path d="M' + ((opt.frameX || 430) - 48) + ' ' + (fl - 345) + ' L' + ((opt.frameX || 430) - 10) + ' ' + (fl - 390) + ' L' + ((opt.frameX || 430) + 14) + ' ' + (fl - 362) + ' L' + ((opt.frameX || 430) + 48) + ' ' + (fl - 398) + ' V' + (fl - 342) + ' H' + ((opt.frameX || 430) - 48) + ' Z" fill="#9db3c0" stroke="' + INK + '" stroke-width="1.4"/>';
  if (opt.plant !== false) s += plant(opt.plantX || 560, fl, window.__t);
  return s;
}
function plant(x, fl, t) {
  var s = "", sw = Math.sin(t * 1.3) * 2;
  [[-40, -170], [-10, -205], [22, -180], [44, -140], [-58, -120], [8, -150]].forEach(function (l, i) {
    var bx = x + (i % 2 ? 4 : -4), by = fl - 70, tx = x + l[0] + sw, ty = fl - 70 + l[1] * .9, mx = (bx + tx) / 2 + (l[0] > 0 ? 18 : -18), my = (by + ty) / 2;
    s += '<path d="M' + f(bx) + ' ' + f(by) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(tx) + ' ' + f(ty) + ' Q' + f(mx - (l[0] > 0 ? 36 : -36)) + ' ' + f(my + 10) + ' ' + f(bx) + ' ' + f(by) + ' Z" fill="' + (i % 2 ? PLANT_D : PLANT) + '" stroke="' + INK + '" stroke-width="1.8"/>';
  });
  return s + P("M" + (x - 34) + " " + (fl - 74) + " L" + (x + 34) + " " + (fl - 74) + " L" + (x + 26) + " " + fl + " L" + (x - 26) + " " + fl + " Z", POT, 2.2) + R(x - 38, fl - 82, 76, 12, "#c97d55", 2);
}
// the owner standing, front view: hip at fl - 210·s
function owner(x, fl, s, t, opt) {
  opt = opt || {}; var y = fl - 210 * s;
  var o = { x: x, y: y, s: s, legs: "stand", outfit: opt.outfit || OWNER, breath: breath(t, x), head: { tilt: opt.tilt != null ? opt.tilt : 2 * Math.sin(t * .9), turn: opt.turn || 0, nod: opt.nod || 0 },
    face: { eyes: opt.eyes != null ? opt.eyes : blink(t, x), look: opt.look || [0, 0], brows: opt.brows || "neutral", mouth: opt.mouth || "smile" } };
  if (opt.arms) o.arms = opt.arms;
  return PERSON.front(o);
}
// the owner walking in profile, the lower foot on fl
function walker(x, fl, s, ph, right, opt) {
  opt = opt || {};
  var o = Object.assign({ x: x, s: s, dir: right ? 1 : -1, lean: 3, outfit: opt.outfit || OWNER, breath: breath(ph, x), head: { tilt: opt.tilt || 0 },
    face: { eyes: 1, brows: opt.brows || "neutral", mouth: opt.mouth || "smile" } }, PERSON.walkPose(ph, opt.still ? 0 : 1));
  o.y = PERSON.sideHipY(o, fl);
  return PERSON.side(o);
}
// a wagging, breathing dog standing or trotting
function pup(x, fl, s, t, opt) {
  opt = opt || {};
  return dog(Object.assign({ x: x, y: fl, s: s, dir: opt.dir || 1, ph: opt.ph || 0, walk: opt.walk || 0, head: opt.head || 0, tail: opt.tail != null ? opt.tail : 14 * Math.sin(t * (opt.wag || 7)),
    sniff: opt.sniff || 0, mouth: opt.mouth != null ? opt.mouth : .55 + .25 * Math.sin(t * 6), eyes: blink(t, x * .01) }, opt));
}

// ── scent: wavy orange ribbons drifting from a source to a nose, dashes running along them ──
function scent(x1, y1, x2, y2, t, k, col, n) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = ""; n = n || 3;
  for (var i = 0; i < n; i++) {
    var off = (i - (n - 1) / 2) * 16, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, d = "";
    for (var q = 0; q <= L * k; q += 6) { var w = Math.sin(q / 38 - t * 3.2 + i * 1.7) * 9 + off * (1 - q / L * .8); d += (q ? " L" : "M") + f(x1 + dx * q / L + nx * w) + " " + f(y1 + dy * q / L + ny * w); }
    s += '<path d="' + d + '" stroke="' + (col || ORANGE) + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 40) + '" opacity=".8"/>';
  }
  return s;
}
// a scent cloud of small dots round a point (the owner's smell, a twin's smell)
function cloud(x, y, r, t, col, k, seed) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = "";
  for (var i = 0; i < 26; i++) { var a = hash(i + (seed || 0)) * 6.283 + t * (.3 + hash(i + 9) * .4), rr = r * Math.sqrt(hash(i + 3 + (seed || 0))) * k, y2 = y + Math.sin(a) * rr * .8 - ((t * 14 + i * 7) % 30);
    s += '<circle cx="' + f(x + Math.cos(a) * rr) + '" cy="' + f(y2) + '" r="' + f(2.4 + hash(i + 5) * 2.6) + '" fill="' + (col || ORANGE) + '" opacity="' + f(.35 + .45 * hash(i + 2)) + '"/>'; }
  return s;
}

// ── the eye, cut through the middle (light comes in from the left) ──
// kind "human": a pit (the fovea) at the back where the cones crowd; "dog": no pit, fewer cones, the tapetum behind the retina
function eyeCut(cx, cy, r, kind, t, o) {
  o = o || {}; var s = "", dog_ = kind === "dog";
  s += C(cx, cy, r, "#f6f1e6", 3);
  s += '<path d="M' + f(cx - r * .82) + ' ' + f(cy - r * .56) + ' A' + f(r * .62) + ' ' + f(r * .62) + ' 0 0 0 ' + f(cx - r * .82) + ' ' + f(cy + r * .56) + '" fill="#e6eef0" stroke="' + INK + '" stroke-width="2.4"/>';   // cornea
  s += R(cx - r * .74, cy - r * .62, r * .07, r * .36, dog_ ? "#7a4a24" : "#5a7a8a", 1.4) + R(cx - r * .74, cy + r * .26, r * .07, r * .36, dog_ ? "#7a4a24" : "#5a7a8a", 1.4);   // iris
  s += '<ellipse cx="' + f(cx - r * .6) + '" cy="' + f(cy) + '" rx="' + f(r * .13) + '" ry="' + f(r * .3) + '" fill="#dbe8ec" stroke="' + INK + '" stroke-width="2"/>';   // lens
  // light rays converging on the back
  var fx = cx + r * .93, fy = cy, k = clamp(o.rays == null ? 1 : o.rays);
  if (k > 0) [-.22, 0, .22].forEach(function (dy) { var a = [cx - r * 1.6, cy + dy * r * 1.6], b = [cx - r * .6, cy + dy * r * .9];
    s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(lerp(b[0], fx, k)) + ' ' + f(lerp(b[1], fy + (dog_ ? dy * r * .28 : 0), k)) + '" stroke="#e0a43a" stroke-width="3" fill="none" stroke-dasharray="7 6" stroke-dashoffset="' + f(-t * 30) + '"/>'; });
  // tapetum (dog): a shining band behind the retina in the upper back
  if (dog_) s += '<path d="M' + f(cx + Math.cos(-1.45) * r * .97) + ' ' + f(cy + Math.sin(-1.45) * r * .97) + ' A' + f(r * .97) + ' ' + f(r * .97) + ' 0 0 1 ' + f(cx + Math.cos(.15) * r * .97) + ' ' + f(cy + Math.sin(.15) * r * .97) + '" stroke="' + TAPETUM + '" stroke-width="' + f(r * .07) + '" fill="none" opacity="' + f(.75 + .25 * Math.sin(t * 3)) + '"/>';
  // retina: a thick lining on the back half; the human one dips into the fovea at the axis
  var d = "";
  for (var a = -1.75; a <= 1.751; a += .05) { var dip = !dog_ ? Math.exp(-a * a / .006) * r * .07 : 0, rr = r * .9 - (-dip); d += (a > -1.75 ? " L" : "M") + f(cx + Math.cos(a) * (r * .88 - dip)) + " " + f(cy + Math.sin(a) * (r * .88 - dip)); }
  s += '<path d="' + d + '" stroke="' + RETINA + '" stroke-width="' + f(r * .08) + '" fill="none" stroke-linecap="round"/>';
  // cones: dots along the retina, crowded at the human fovea, thin and even in the dog
  var n = dog_ ? 15 : 22;
  for (var i = 0; i < n; i++) { var u = (i + .5) / n, aa = dog_ ? -1.6 + 3.2 * u : (u < .5 ? -1.6 + 1.5 * Math.pow(u * 2, 1.8) : 1.6 - 1.5 * Math.pow((1 - u) * 2, 1.8)) * 1;
    s += '<circle cx="' + f(cx + Math.cos(aa) * r * .8) + '" cy="' + f(cy + Math.sin(aa) * r * .8) + '" r="' + f(r * .028) + '" fill="' + (o.coneCol ? o.coneCol(i) : INK) + '"/>'; }
  if (!dog_) for (i = 0; i < 9; i++) { var a2 = (i - 4) * .035; s += '<circle cx="' + f(cx + Math.cos(a2) * r * .76) + '" cy="' + f(cy + Math.sin(a2) * r * .76) + '" r="' + f(r * .026) + '" fill="' + INK + '"/>'; }
  // optic nerve out of the back
  s += P("M" + f(cx + r * .86) + " " + f(cy + r * .3) + " C" + f(cx + r * 1.1) + " " + f(cy + r * .34) + " " + f(cx + r * 1.24) + " " + f(cy + r * .42) + " " + f(cx + r * 1.4) + " " + f(cy + r * .5) + " L" + f(cx + r * 1.4) + " " + f(cy + r * .76) + " C" + f(cx + r * 1.2) + " " + f(cy + r * .66) + " " + f(cx + r * 1.0) + " " + f(cy + r * .62) + " " + f(cx + r * .78) + " " + f(cy + r * .52) + " Z", "#e8cf9f", 2.2);
  // where the light lands: a sharp point (human) or a smeared spot (dog)
  if (k >= 1) s += dog_ ? '<ellipse cx="' + f(fx - r * .04) + '" cy="' + f(fy) + '" rx="' + f(r * .05) + '" ry="' + f(r * .22) + '" fill="#e0a43a" opacity=".55"/>' : C(fx - r * .02, fy, r * .035, "#e0a43a", 1.2);
  return s;
}

// ── the cone curves: sensitivity over wavelength 400–700 nm, in a framed graph ──
function gauss(x, m, w) { return Math.exp(-Math.pow((x - m) / w, 2)); }
function cones(x, y, w, h, peaks, k, t) {
  var s = R(x, y, w, h, "#f4ecdb", 2.2), id = "cg" + (++CLIPN), bar = "";
  for (var i = 0; i < 30; i++) { var nm = 400 + i * 10, col = spec(nm); bar += R(x + i * w / 30, y + h + 8, w / 30 + .6, 18, col, 0); }
  s += bar + R(x, y + h + 8, w, 18, "none", 1.6) + N("400", x + 4, y + h + 46, 14, INK, "start") + N("700", x + w - 4, y + h + 46, 14, INK, "end");
  peaks.forEach(function (p, j) { var kk = clamp(k * peaks.length - j), d = "";
    if (kk <= 0) return;
    for (var q = 0; q <= 60 * kk; q++) { var nm = 400 + q * 5; d += (q ? " L" : "M") + f(x + (nm - 400) / 300 * w) + " " + f(y + h - 8 - gauss(nm, p[0], p[1]) * (h - 26)); }
    s += '<path d="' + d + '" stroke="' + p[2] + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if (kk >= 1) s += C(x + (p[0] - 400) / 300 * w, y + h - 8 - (h - 26), 6, p[2], 1.6);
  });
  return s;
}
function spec(nm) {   // an approximate spectrum colour for the strip under the graph
  var st = [[400, [118, 64, 160]], [450, [55, 90, 190]], [490, [40, 160, 190]], [520, [60, 170, 80]], [570, [220, 210, 60]], [600, [235, 150, 50]], [650, [215, 60, 45]], [700, [160, 40, 40]]];
  for (var i = 1; i < st.length; i++) if (nm <= st[i][0]) { var k = (nm - st[i - 1][0]) / (st[i][0] - st[i - 1][0]), a = st[i - 1][1], b = st[i][1]; return "rgb(" + [0, 1, 2].map(function (j) { return Math.round(lerp(a[j], b[j], k)); }).join(",") + ")"; }
  return "rgb(160,40,40)";
}
function specDog(nm) { var m = spec(nm).match(/\d+/g).map(Number), h = "#" + m.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); return dvHex(h); }

// ── brains in profile (front to the left): the human one with the face area under the temporal lobe; the dog one long,
// with a big olfactory bulb at the front and the caudate deep inside ──
function humanBrain(x, y, sc, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-90 10 C-100 -40 -60 -86 0 -88 C60 -90 104 -56 100 -6 C98 22 80 36 60 40 C50 58 20 60 8 48 C-10 52 -40 48 -56 36 C-76 34 -88 26 -90 10 Z", BRAIN, 2.6) +
    P("M40 44 C56 50 80 50 92 40 C96 52 88 66 70 68 C54 68 44 60 40 44 Z", "#c99790", 2) +   // cerebellum
    '<path d="M-40 -60 q14 18 0 30 q-14 14 4 30 M0 -80 q-10 24 8 40 q14 16 -2 34 M40 -70 q-12 22 6 36 q12 14 0 30 M-70 -10 q24 -6 40 6 q18 10 40 0" stroke="' + BRAIN_D + '" stroke-width="2.4" fill="none"/>' +
    '<path d="M-56 4 C-30 -6 0 -2 30 14" stroke="' + INK + '" stroke-width="2" fill="none"/>' +   // lateral fissure
    P("M24 60 C26 76 30 90 34 104 L48 104 C44 88 42 74 44 62 Z", "#d7b0a3", 2));   // brain stem
  if (o.face) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="18" cy="38" rx="20" ry="9" fill="' + ORANGE + '" opacity="' + f(.5 + .4 * o.face) + '" stroke="' + INK + '" stroke-width="1.6"/>');
  return s;
}
function dogBrain(x, y, sc, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-70 6 C-74 -30 -40 -56 10 -56 C60 -56 92 -30 92 4 C92 26 74 36 56 38 C40 50 10 50 -10 40 C-40 40 -66 30 -70 6 Z", BRAIN, 2.6) +
    P("M56 38 C70 34 92 30 100 14 C108 30 100 50 82 54 C70 56 60 50 56 38 Z", "#c99790", 2) +
    '<path d="M-40 -36 q20 10 10 28 M0 -50 q-8 22 10 34 M40 -46 q-10 20 6 34 M-50 0 q40 -10 90 4" stroke="' + BRAIN_D + '" stroke-width="2.4" fill="none"/>' +
    P("M-70 2 C-84 -6 -104 -4 -110 8 C-114 20 -100 28 -84 24 C-76 22 -70 14 -70 2 Z", o.bulb ? OLIVE : "#c7a07a", 2.2) +   // olfactory bulb
    P("M40 50 C44 64 46 76 48 88 L62 88 C60 74 58 62 58 50 Z", "#d7b0a3", 2));
  if (o.caudate) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="-4" cy="-8" rx="18" ry="10" fill="' + ORANGE + '" opacity="' + f(.25 + .7 * o.caudate) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    (o.caudate > .3 ? '<ellipse cx="-4" cy="-8" rx="' + f(18 + 14 * ((window.__t * 1.2) % 1)) + '" ry="' + f(10 + 8 * ((window.__t * 1.2) % 1)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2" opacity="' + f(1 - (window.__t * 1.2) % 1) + '"/>' : ""));
  if (o.face != null) s += G("translate(" + x + " " + y + ") scale(" + sc + ")", '<ellipse cx="40" cy="26" rx="16" ry="7" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-dasharray="4 4"/>');
  return s;
}
// the back of a head (hair, ears, neck) to set beside a face
function backHead(x, y, s) {
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-14, 22, 28, 30, "#e0a98a", 2) + '<path d="M-36 60 C-30 46 30 46 36 60 L40 90 L-40 90 Z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<ellipse cx="-27" cy="2" rx="6" ry="10" fill="#e0a98a" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="27" cy="2" rx="6" ry="10" fill="#e0a98a" stroke="' + INK + '" stroke-width="1.8"/>' +
    '<path d="M-27 6 C-30 -30 -14 -40 0 -40 C14 -40 30 -30 27 6 C26 22 14 34 0 34 C-14 34 -26 22 -27 6 Z" fill="#2f2620" stroke="' + INK + '" stroke-width="2.2"/><path d="M-10 -30 q6 8 14 0 M-16 -12 q10 6 20 -2 M2 4 q8 6 14 -2" stroke="#4d3f34" stroke-width="1.6" fill="none"/>');
}

// ── the snout, cut down the middle (Craven et al. 2010): nostril → the front maze (maxilloturbinates, warms the air)
// → a shelf (lamina transversa) splits the flow: under it the breath goes on to the throat, over it a share goes up to
// the olfactory recess at the back, packed with scrolls (ethmoturbinates) → the olfactory bulb of the brain behind them
function snoutCut(t, o) {
  o = o || {}; var s = "";
  var head = "M80 300 C80 220 150 150 250 136 C330 126 380 150 420 196 C460 220 540 232 600 250 C640 262 660 296 650 330 C640 360 610 372 580 372 L440 380 C380 420 300 440 220 430 C140 420 80 380 80 300 Z";
  s += P(head, FAWN, 2.8) + '<path d="' + head + '" fill="url(#hatch)" opacity=".12"/>';
  // skull bone and brain case
  s += P("M120 300 C116 230 170 180 250 170 C320 162 370 190 396 232 C380 260 340 270 300 272 C240 276 170 300 120 300 Z", "#efe4cc", 2.2);
  s += P("M140 290 C140 240 180 204 248 196 C310 190 350 210 370 240 C340 256 300 258 260 262 C210 268 170 282 140 290 Z", BRAIN, 2) + '<path d="M180 240 q20 10 40 0 q20 -10 40 4 q20 10 40 -2" stroke="' + BRAIN_D + '" stroke-width="2" fill="none"/>';
  // olfactory bulb: the front of the brain, right behind the recess
  s += P("M366 238 C384 230 404 236 406 250 C406 262 390 268 374 264 C362 260 358 246 366 238 Z", o.bulb ? OLIVE : "#c7a07a", 2.2);
  // nasal cavity
  var cav = "M400 236 C460 236 540 250 600 262 C622 268 630 290 622 312 L560 330 L420 336 C404 320 396 280 400 236 Z";
  s += P(cav, "#f3e3d2", 2.2);
  // the shelf: lamina transversa
  s += P("M420 300 C470 296 520 300 560 306", "none", 5, ' stroke="' + INK + '" stroke-linecap="round"') + P("M420 300 C470 296 520 300 560 306", "none", 2.5, ' stroke="#efe4cc" stroke-linecap="round"');
  // olfactory recess: scrolls (ethmoturbinates) above the shelf at the back
  for (var i = 0; i < 9; i++) { var cx = 412 + (i % 3) * 22, cy = 252 + Math.floor(i / 3) * 16, rr = 8;
    s += '<path d="M' + f(cx) + ' ' + f(cy) + ' m' + f(-rr) + ' 0 a' + rr + ' ' + rr + ' 0 1 1 ' + f(rr * 1.6) + ' ' + f(rr * .4) + ' a' + f(rr * .6) + ' ' + f(rr * .6) + ' 0 1 1 ' + f(-rr * .8) + ' ' + f(-rr * .5) + '" stroke="' + (o.hl === "recess" ? OLIVE : "#a98a6a") + '" stroke-width="2.4" fill="none"/>'; }
  // front maze: maxilloturbinates
  for (i = 0; i < 6; i++) s += '<path d="M' + (500 + i * 16) + ' 274 c6 10 -6 16 2 26 c6 8 -4 14 2 22" stroke="#b08a70" stroke-width="2.2" fill="none"/>';
  // nostril at the front, the side slit
  s += P("M600 252 C628 252 652 270 652 300 C652 322 636 332 620 330 L612 312 C622 304 622 284 606 278 Z", DNOSE, 2);
  s += '<ellipse cx="630" cy="296" rx="8" ry="11" fill="#0d0a08"/>';
  // throat: where the breath goes
  s += P("M420 336 C400 350 380 372 372 410 L330 418 C340 384 360 352 380 336 Z", "#e7c8b6", 2);
  // air: in through the nostril, along the floor to the throat (blue), and a share up over the shelf to the recess (orange)
  if (o.air) {
    var lo = "M640 300 L560 318 L470 322 L400 340 L360 412", hi = "M640 300 L580 288 L520 282 L460 272 L428 262";
    s += G("", '<path d="' + lo + '" stroke="' + BLUE + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="4 14" stroke-dashoffset="' + f(t * 40) + '"/>', o.air);
    s += G("", '<path d="' + hi + '" stroke="' + ORANGE + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="4 14" stroke-dashoffset="' + f(t * 40) + '"/>', clamp(o.air * 2 - 1));
  }
  // eye, ear
  s += '<ellipse cx="380" cy="190" rx="16" ry="11" fill="#3a2414" stroke="' + INK + '" stroke-width="2"/><circle cx="384" cy="187" r="4" fill="#fff"/>';
  s += P("M190 150 C180 100 200 50 220 30 C250 60 270 110 268 140 Z", FAWN, 2.6) + P("M206 140 C202 106 212 70 222 52 C240 80 250 112 250 136 Z", EAR_IN, 0);
  return s;
}
// the nose leather seen from the front: two comma-shaped nostrils, each opening into a slit that runs down and out
function noseFront(x, y, sc, t, o) {
  o = o || {}; var s = "";
  s += G("translate(" + x + " " + y + ") scale(" + sc + ")",
    P("M-156 -64 C-158 -122 -70 -140 0 -140 C70 -140 158 -122 156 -64 C156 -14 130 18 86 26 C54 32 30 50 0 84 C-30 50 -54 32 -86 26 C-130 18 -156 -14 -156 -64 Z", DNOSE, 3) +
    '<path d="M0 0 V84" stroke="#0d0a08" stroke-width="5"/><path d="M-120 20 C-90 8 -40 10 -14 30 M120 20 C90 8 40 10 14 30" stroke="#4a4038" stroke-width="3" fill="none"/>' +
    [-1, 1].map(function (sd) { var fl = 1 + .12 * Math.sin(t * 14) * (o.sniff || 0);
      return G("translate(" + (sd * 84) + " -52) scale(" + f(sd * fl) + " " + f(fl) + ")", '<path d="M-30 -8 C-34 -36 0 -46 18 -32 C32 -20 30 0 22 10 C34 14 50 18 66 30 C46 30 28 26 12 22 C-10 22 -28 10 -30 -8 Z" fill="#0d0a08" stroke="#6b6158" stroke-width="2"/>'); }).join("") +
    '<path d="M-110 -100 C-70 -116 -40 -118 -20 -116" stroke="#6b6158" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>');
  // the leather's pebbled texture
  for (var i = 0; i < 90; i++) { var a = hash(i) * 6.28, r = 10 + hash(i + 7) * 130; s += '<circle cx="' + f(x + Math.cos(a) * r * sc) + '" cy="' + f(y - 60 * sc + Math.sin(a) * r * .55 * sc) + '" r="' + f(3 * sc) + '" fill="none" stroke="#4a4038" stroke-width="' + f(1.4 * sc) + '" opacity=".6"/>'; }
  return s;
}
// a muzzle around the front nose (fur, a little of the mouth)
function muzzleFront(x, y, sc) {
  return G("translate(" + x + " " + y + ") scale(" + sc + ")", P("M-260 -120 C-240 -220 240 -220 260 -120 C280 40 200 200 0 230 C-200 200 -280 40 -260 -120 Z", FAWN, 3) +
    P("M-150 60 C-100 140 100 140 150 60 C120 170 -120 170 -150 60 Z", CREAM, 2) + '<path d="M0 110 V170 M0 170 C-30 190 -70 186 -100 168 M0 170 C30 190 70 186 100 168" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    [[-170, 0], [-190, 30], [-160, 50], [170, 0], [190, 30], [160, 50]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + FAWN_D + '"/>'; }).join(""));
}

// ── an MRI scanner in profile: a ring with the bore, the dog lying in it chin on a rest ──
function mri(x, y, t) {
  var s = R(x - 170, y - 230, 300, 300, "#e4e6e2", 2.6, 26) + '<ellipse cx="' + (x - 20) + '" cy="' + (y - 80) + '" rx="60" ry="104" fill="#c9ccc6" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(x - 170, y + 70, 300, 24, "#b9bcb6", 2) + R(x - 520, y - 12, 520, 22, "#d8d0bb", 2.2, 6) + R(x - 500, y + 10, 18, 84, "#9a9a92", 2) + R(x - 230, y + 10, 18, 84, "#9a9a92", 2);
  s += T("MRI", x + 60, y - 180, 22, INK, 800);
  return s;
}

// ── a pool cut through its side: water, tiles, a lane line; w × h ──
function pool(x, y, w, h, t) {
  var s = R(x - 10, y - 10, w + 20, h + 20, "#d9d4c6", 2.4) + R(x, y, w, h, "#86a9bd", 2);
  for (var k = 0; k < 5; k++) s += '<path d="M' + f(x + 10 + ((k * 90 + t * 30) % (w - 30))) + ' ' + (y + 10) + ' q10 -6 20 0 t20 0" stroke="#e8eef0" stroke-width="2.4" fill="none"/>';
  return s + '<path d="M' + x + ' ' + (y + h * .6) + ' H' + (x + w) + '" stroke="#6f8ea2" stroke-width="2" stroke-dasharray="10 8"/>';
}
// a teaspoon tipping sugar grains
function spoon(x, y, tilt, k, t) {
  var s = G("rotate(" + f(tilt) + " " + x + " " + y + ")", '<ellipse cx="' + x + '" cy="' + y + '" rx="26" ry="14" fill="#d9dcdc" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + (x + 24) + ' ' + (y - 4) + ' L' + (x + 110) + ' ' + (y - 30) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + (x + 24) + ' ' + (y - 4) + ' L' + (x + 110) + ' ' + (y - 30) + '" stroke="#d9dcdc" stroke-width="5" stroke-linecap="round"/>' +
    (k < .5 ? '<ellipse cx="' + x + '" cy="' + (y - 6) + '" rx="20" ry="8" fill="#fbf8f1" stroke="' + INK + '" stroke-width="1.2"/>' : ""));
  if (k > 0 && k < 1) for (var i = 0; i < 14; i++) { var p = (k * 2 + hash(i) * .6) % 1; s += '<rect x="' + f(x - 20 + hash(i + 3) * 18) + '" y="' + f(y + 10 + p * 130) + '" width="4" height="4" fill="#fbf8f1" stroke="' + INK + '" stroke-width=".8"/>'; }
  return s;
}

// ── a Snellen-style chart on a stand: rows of letters getting smaller ──
function chart(x, fl, sc) {
  var s = R(x - 6, fl - 170 * sc, 12, 170 * sc, WOOD, 2) + R(x - 50 * sc, fl - 300 * sc, 100 * sc, 140 * sc, "#fbf8f1", 2.2);
  [[34, 0], [22, 1], [16, 2], [11, 3], [8, 4]].forEach(function (r, i) { var y = fl - 270 * sc + i * 26 * sc; for (var j = 0; j <= i; j++) s += T("E", x + (j - i / 2) * r[0] * .9 * sc, y + r[0] * .4 * sc, r[0] * sc, INK, 900); });
  return s;
}

// ══ shots (one per idea; line numbers from script.txt) ══
var FL = 640;
// 4 · «ليه بيشوفك مغبّش؟»: the dog looking up at a blurred owner
shot(4, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .3] }), p = pup(150, FL, 2.0, t, { head: -12 });
  return paper() + room(FL, { plantX: 600 }) + dogView(o.svg, 4) + shadow(150, FL, 140) + p.svg + G("", T("؟", 250, 200, 120, ORANGE, 800), at(u, .5, .3));
});
// 5 · the eye, cut through: yours has the pit where the detail gathers; his doesn't. «4 مرات»
shot(5, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k1 = at(u, .3, .8), k2 = at(u, (LN[5].end - LN[5].start) * .45, .8);
  var s = paper() + T("عينك", 320, 70, 30, INK, 800) + eyeCut(290, 220, 120, "human", t, { rays: k1 }) +
    label(398, 220, 520, 120, "النقطة دي", ORANGE, at(u, 1.4, .5), 24) + G("", C(398, 220, 18, "none", 3).replace(INK, ORANGE), at(u, 1.4, .4));
  s += G("", T("عينه", 320, 420, 30, INK, 800) + eyeCut(290, 570, 120, "dog", t, { rays: k2 }) + cross(470, 520, .7, at(u, (LN[5].end - LN[5].start) * .55, .4)) + T("مفيش", 470, 590, 24, ORANGE, 800), k2 > 0 ? 1 : 0);
  return s + numBox("÷4", 120, 420, at(u, (LN[5].end - LN[5].start) * .8, .3), 30, true);
});
// 6 · the chart test: what you read sharp from 20 m, he must come to 5 m to see as well
shot(6, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var g = 560, s = paper() + R(-400, g, 1440, 400, "#e3d7bd", 0) + '<path d="M-400 ' + g + ' H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  var cx = 590, man = walker(50, g, .5, 0, true, { still: true }).svg, k = at(u, d * .4, d * .35), x5 = cx - 140;
  s += chart(cx, g, .8) + man + measure(50, g + 50, cx, g + 50, at(u, .5, 1.2), "") + G("", T("20 متر", 320, g + 92, 28, INK, 800), at(u, 1.4, .3));
  s += G("", '<path d="M90 ' + (g - 170) + ' L' + (cx - 40) + ' ' + (g - 200) + '" stroke="#e0a43a" stroke-width="2.4" stroke-dasharray="6 6"/>', at(u, .3, .4));
  var dx = lerp(120, x5 - 80, k), dg = pup(dx, g, .75, t, { walk: k > 0 && k < 1 ? 1 : 0, ph: t * 9, head: -10 });
  s += dg.svg + G("", measure(x5, g + 140, cx, g + 140, at(u, d * .8, .5), "") + G("", T("5 متر", (x5 + cx) / 2, g + 182, 28, BLUE, 800), at(u, d * .8 + .4, .3)), k >= 1 ? 1 : 0);
  return s + G("", tag("زيك بالظبط", 320, 140, 1, 26, OLIVE), at(u, d * .88, .3));
});
// 7 · colour cells: you have three kinds, he has two (cone curves)
shot(7, push(320, 390, 1.0, 1.04), function (u, d, t) {
  var k1 = at(u, .3, 1.6), k2 = at(u, d * .5, 1.2);
  return paper() + T("إنت: 3 أنواع", 320, 70, 30, INK, 800) + cones(80, 90, 480, 200, [[420, 40, "#4a63b8"], [530, 55, "#4f9a4a"], [560, 60, ORANGE]], k1, t) +
    G("", T("هو: نوعين بس", 320, 430, 30, INK, 800) + cones(80, 450, 480, 200, [[429, 42, "#4a63b8"], [555, 65, "#d9b44a"]], k2, t), k2 > 0 ? 1 : 0);
});
// 8 · blue and yellow stay; red and green go grey-yellow: four toys through your eye and his
shot(8, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var toys = [["#3e64b5", "أزرق"], ["#e2c23a", "أصفر"], [SHIRT, "أحمر"], ["#4f9a4a", "أخضر"]], s = paper();
  s += T("إنت", 560, 150, 28, INK, 800, "end") + T("هو", 560, 450, 28, INK, 800, "end");
  for (var i = 0; i < 30; i++) { s += R(60 + i * 17, 330, 17.6, 26, spec(400 + i * 10), 0) + G("", R(60 + i * 17, 630, 17.6, 26, specDog(400 + i * 10), 0), at(u, .8 + i * .03, .2)); }
  s += R(60, 330, 510, 26, "none", 1.6) + R(60, 630, 510, 26, "none", 1.6);
  toys.forEach(function (q, i) { var x = 120 + i * 125, bob = 4 * Math.sin(t * 3 + i), k = at(u, .2 + i * .25, .3), kd = at(u, 1.2 + i * .3, .4), red = i >= 2;
    s += G("", C(x, 240 + bob, 42, q[0], 2.4) + '<path d="M' + (x - 26) + ' ' + f(226 + bob) + ' q12 -14 26 -12" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>' + T(q[1], x, 310, 20, INK, 700), k);
    s += G("", C(x, 540 - bob, 42, dvHex(q[0]), 2.4) + (red ? cross(x, 540 - bob, .5, at(u, 2.6 + (i - 2) * .4, .4)) : check(x, 470, .6, at(u, 2 + i * .3, .4), BLUE)), kd);
  });
  return s;
});
// 9 · like the world behind frosted bathroom glass
shot(9, push(330, 400, 1.06, 1.0), function (u, d, t) {
  var o = owner(330, FL, 1.25, t, { mouth: "smile" }), s = paper() + room(FL);
  var glass = '<rect x="-60" y="-60" width="120" height="120" fill="#cfdde0"/>' + G("", '<ellipse cx="0" cy="-12" rx="16" ry="20" fill="#d9a186"/><rect x="-26" y="10" width="52" height="56" rx="16" fill="' + SHIRT + '"/>', .8);
  for (var i = 0; i < 8; i++) glass += '<path d="M' + (-60 + i * 16) + ' -60 l12 120" stroke="#eef3f3" stroke-width="5" opacity=".7"/>';
  return s + dogView(o.svg, 6) + iconBox(520, 110, 150, '<clipPath id="fg"><rect x="-75" y="-75" width="150" height="150"/></clipPath><g clip-path="url(#fg)" filter="url(#dogv6)">' + glass + '</g>', at(u, .3, .3)) + tag("إزاز مشجّر", 520, 220, at(u, .7, .3), 22, BLUE);
});
// 10 · «طب بيعرفك إزاي؟»: the dog at the owner's feet, looking up, a question mark
shot(10, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var o = owner(400, FL, 1.25, t, { mouth: "smile", look: [-.6, .5], tilt: -6 }), p = pup(170, FL, 2.1, t, { head: -18, mouth: .7 });
  return paper() + room(FL) + o.svg + shadow(170, FL, 150) + p.svg + G("", T("؟", 230, 170, 130, ORANGE, 800), at(u, .4, .3));
}, { tr: "out" });
// 11 · the Budapest scans: your brain answers a face far more than the back of a head; his barely tells them apart
shot(11, push(320, 400, 1.02, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, .4, .5), k2 = at(u, d * .45, .5);
  var face = PERSON.head ? "" : "";
  var P1 = owner(150, 330, .78, t, { mouth: "smile" });
  s += '<clipPath id="hc1"><rect x="60" y="20" width="180" height="140"/></clipPath><g clip-path="url(#hc1)">' + P1.svg + '</g>' + R(60, 20, 180, 140, "none", 2) + T("وش", 150, 186, 22, INK, 800);
  s += R(400, 20, 180, 140, "#efe6d0", 2) + backHead(490, 80, 1.1) + T("قفا", 490, 186, 22, INK, 800);
  // your brain
  s += G("", T("مخك", 160, 250, 26, INK, 800) + humanBrain(160, 340, .9, { face: k }) + R(80, 430, 50, 120, "none", 0) + R(80, lerp(560, 440, k), 40, lerp(0, 120, k), ORANGE, 2) + R(140, lerp(560, 530, k), 40, lerp(0, 30, k), GREY, 2) + T("وش", 100, 590, 18, INK, 700) + T("قفا", 160, 590, 18, INK, 700), k);
  s += G("", T("مخ الكلب", 480, 250, 26, INK, 800) + dogBrain(490, 340, .9, {}) + R(400, lerp(560, 490, k2), 40, lerp(0, 70, k2), "#d9b44a", 2) + R(460, lerp(560, 494, k2), 40, lerp(0, 66, k2), "#d9b44a", 2) + T("وش", 420, 590, 18, INK, 700) + T("قفا", 480, 590, 18, INK, 700) + T("≈", 450, 470, 40, ORANGE, 800), k2);
  return s + '<path d="M320 230 V620" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>' + G("", tag("المجر 2020", 320, 690, 1, 22), at(u, .8, .3));
});
// 12 · it's your smell: the owner walks in, a scent trail drifts to the dog's lifted nose
shot(12, pan(300, 400, 340, 400, 1.0), function (u, d, t) {
  var wx = lerp(620, 470, at(u, 0, d * .8)), w = walker(wx, FL, 1.2, t * 6, false, { mouth: "smile" }), p = pup(140, FL, 1.9, t, { head: -26, sniff: 1, mouth: .2 });
  var s = paper() + room(FL, { plant: false, frameX: 300 }) + w.svg + shadow(140, FL, 130) + p.svg + cloud(wx, FL - 260, 60, t, ORANGE, at(u, .6, .6));
  s += scent(wx - 30, FL - 260, p.nose[0] + 6, p.nose[1], t, at(u, 1.0, 1.4));
  return s + G("", tag("ريحتك", 330, 150, 1, 34, ORANGE), at(u, d * .6, .3));
});
// 13 · 300 million smell cells against your 6 million
shot(13, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .3, d * .45), k2 = at(u, d * .5, .6), p = pup(170, 330, 1.35, t, { head: -10, sniff: 1, mouth: 0 }), o = owner(470, 330 + 40, .62, t, { mouth: "neutral" });
  var s = paper() + p.svg + '<clipPath id="oc"><rect x="380" y="70" width="180" height="270"/></clipPath><g clip-path="url(#oc)">' + o.svg + '</g>';
  s += R(80, 420, 200, 0, "none", 0) + N(count(300, k), 170, 470, 60, ORANGE) + T("مليون خلية شم", 170, 510, 22, INK, 700);
  s += G("", N("6", 470, 470, 60, INK) + T("مليون بس", 470, 510, 22, INK, 700), k2);
  s += R(70, 560, Math.max(1, 490 * k), 40, ORANGE, 2) + G("", R(70, 620, 500 * 6 / 300 + 4, 40, GREY, 2), k2);
  return s + T("كلبك", 70, 548, 20, INK, 700, "start") + G("", T("إنت", 70, 608, 20, INK, 700, "start"), k2);
});
// 14 · a spoon of sugar in two Olympic pools — and he'd smell it
shot(14, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .5, 1.4), s = paper();
  s += pool(40, 420, 270, 140, t) + pool(340, 420, 270, 140, t) + measure(40, 600, 310, 600, at(u, .3, .6), "") + measure(340, 600, 610, 600, at(u, .5, .6), "") + G("", T("50 متر", 175, 640, 24, INK, 800) + T("50 متر", 475, 640, 24, INK, 800), at(u, .9, .3));
  s += spoon(160, 260, -18 + 30 * k, k, t);
  if (k >= 1) s += cloud(175, 470, 50, t, "#fbf8f1", 1, 3);
  return s + iconBox(530, 150, 160, G("scale(.42) translate(-120 110)", pup(60, 40, 1.3, t, { head: -14, sniff: 1, mouth: 0 }).svg) + T("حاسس!", 0, 64, 18, ORANGE, 800), at(u, d * .55, .3)) + tag("معلقة سكر", 160, 140, at(u, .3, .3), 26, ORANGE);
});
// 15 · «طب مناخيره بتعمل كده إزاي؟»: in close on the head, the nose twitching
shot(15, push(470, 320, 2.2, 2.6), function (u, d, t) {
  var p = pup(300, 560, 2.2, t, { head: -6, sniff: 1, mouth: 0 });
  return paper() + p.svg + G("", T("؟", p.nose[0] + 50, p.nose[1] - 30, 60, ORANGE, 800), at(u, .4, .3)) + scent(p.nose[0] + 200, p.nose[1] - 20, p.nose[0] + 6, p.nose[1], t, at(u, .2, .8), ORANGE, 2);
}, { tr: "in" });
// 16 · the snout cut: one path along the floor to the throat (breathing), a share up over the shelf to the smell room
shot(16, push(330, 330, .98, 1.08), function (u, d, t) {
  var ka = at(u, .4, 1.6), kl = at(u, d * .45, .5), kh = at(u, d * .62, .5);
  return paper() + G("translate(-60 60)", snoutCut(t, { air: ka, hl: kh > 0 ? "recess" : "", bulb: kh >= 1 }) +
    label(520, 330, 470, 420, "للنفس", BLUE, kl, 26) + label(440, 262, 470, 150, "أوضة الريحة", ORANGE, kh, 26) + label(386, 250, 300, 120, "المخ", OLIVE, at(u, d * .8, .5), 22));
}, { tr: "in" });
// 17 · breathing out through the side slits, so the sniffing never stops
shot(17, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var s = paper() + muzzleFront(320, 420, 1.0) + noseFront(320, 340, 1.0, t, { sniff: 1 }), cyc = (t * .9) % 1, inh = cyc < .5;
  [-1, 1].forEach(function (sd) {
    s += G("", arrow(320 + sd * 70, 120, 320 + sd * 62, 270, BLUE, 6, clamp(cyc * 2.4)), inh ? 1 : 0);
    for (var i = 0; i < 4; i++) { var p = clamp((cyc - .5) * 2 - i * .08); if (p > 0 && p < 1) s += '<path d="M' + f(320 + sd * (120 + p * 140)) + ' ' + f(340 + 30 + p * 60 + i * 12) + ' q' + f(sd * 14) + ' -10 ' + f(sd * 28) + ' 0" stroke="#9fbccb" stroke-width="6" fill="none" stroke-linecap="round" opacity="' + f(1 - p) + '"/>'; }
  });
  return s + label(182, 318, 230, 600, "فتحة على الجنب", OLIVE, at(u, .8, .5), 24) + G("", tag(inh ? "شهيق" : "زفير", 320, 70, 1, 28, BLUE), at(u, .3, .3));
});
// 18 · each nostril smells on its own, so he knows where it comes from (like your two ears)
shot(18, push(330, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + muzzleFront(380, 470, .9) + noseFront(380, 400, .9, t, { sniff: 1 }), src = [70, 260];
  s += cloud(src[0], src[1], 50, t, ORANGE, at(u, .2, .4)) + scent(src[0] + 30, src[1] + 10, 316, 368, t, at(u, .5, .8), ORANGE, 3) + scent(src[0] + 30, src[1] + 10, 444, 368, t, at(u, .5, .8) * .5, ORANGE, 1);
  s += G("", numBox("+", 316, 300, 1, 22) + numBox("−", 444, 300, 1, 22), at(u, 1.6, .3)) + arrow(250, 620, 90, 620, ORANGE, 6, at(u, d * .55, .5)) + G("", T("من هنا", 170, 670, 24, ORANGE, 800), at(u, d * .6, .3));
  var ear = '<ellipse cx="0" cy="0" rx="22" ry="34" fill="#e0a98a" stroke="' + INK + '" stroke-width="2"/><path d="M-6 -16 q14 4 8 18 q-6 10 4 16" stroke="' + INK + '" stroke-width="2" fill="none"/>' + wave(-60, 0, -26, 0, t, BLUE, 5, 10, 1, 2.4);
  return s + iconBox(540, 110, 130, ear, at(u, d * .7, .3));
});
// 19 · in the scanner, the owner's smell lights the reward centre more than any other smell
shot(19, push(330, 380, 1.0, 1.06), function (u, d, t) {
  var s = paper() + R(-400, 520, 1440, 400, "#e3d7bd", 0) + mri(520, 480, t);
  var p = dog({ x: 395, y: 468, s: 1.05, dir: 1, head: 6, tail: 6 * Math.sin(t * 3), eyes: blink(t, 1), mouth: 0, sniff: .6 });
  s += p.svg + '<path d="M' + 500 + ' ' + 376 + ' A60 104 0 0 1 ' + 500 + ' ' + 584 + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + R(530, 250, 100, 300, "#e4e6e2", 0) + R(270, 400, 90, 60, "#f4ecdb", 2, 6) + T("ريحة صاحبه", 315, 435, 13, ORANGE, 800);
  var kc = at(u, d * .4, 1);
  return s + inset(180, 210, 130, dogBrain(10, 10, 1.1, { caudate: kc }), at(u, .5, .4)) + label(176, 202, 330, 90, "مركز الفرحة", ORANGE, at(u, d * .5, .5), 24) + cloud(315, 400, 30, t, ORANGE, kc);
});
// 20 · the myth: he sees in black and white. No.
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var o = owner(320, FL, 1.25, t, { mouth: "neutral" });
  return paper() + dvDefs(4) + '<g filter="url(#grey)">' + room(FL) + o.svg + '</g>' + G("", cross(320, 330, 3, at(u, d * .7, .5)), 1) + G("", tag("أبيض وإسود", 320, 120, 1, 32), at(u, .3, .3));
});
// 21 · fewer colours, but better at movement and in the dark: the dog's eye shine at night, a ball rolling
shot(21, pan(300, 400, 360, 400, 1.0), function (u, d, t) {
  var s = paper() + R(-400, -400, 1440, 1200, "#20242c", 0) + R(-400, FL, 1440, 400, "#2c2f36", 0) + '<path d="M-400 ' + FL + ' H1040" stroke="#555a62" stroke-width="2"/>' + moon(520, 110, 34);
  var bx = 600 - ((u * 220) % 900), p = pup(200, FL, 1.8, t, { head: -4, mouth: 0, tail: 20 * Math.sin(t * 10) });
  s += '<g opacity=".55">' + p.svg + '</g>' + C(p.eye[0], p.eye[1], 9, "#bfe6c4", 0) + '<circle cx="' + f(p.eye[0]) + '" cy="' + f(p.eye[1]) + '" r="' + f(16 + 3 * Math.sin(t * 6)) + '" fill="#bfe6c4" opacity=".25"/>';
  s += C(bx, FL - 22, 22, "#d9b44a", 2) + '<path d="M' + f(bx + 30) + ' ' + (FL - 30) + ' h50 M' + f(bx + 30) + ' ' + (FL - 16) + ' h36" stroke="#d9b44a" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
  return s + G("", tag("الحركة", 480, 520, 1, 26, ORANGE), at(u, d * .35, .3)) + G("", tag("الضلمة", 140, 180, 1, 26, BLUE), at(u, d * .6, .3));
});
// 22 · the recap: blurry eye, few colours, a nose that reads your smell like a fingerprint
shot(22, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), ks = [at(u, .2, .4), at(u, d * .3, .4), at(u, d * .55, .4)];
  s += G("", R(40, 60, 260, 200, "#f4ecdb", 2) + G("translate(170 160) scale(.42) translate(-290 -220)", eyeCut(290, 220, 120, "dog", t, {})) + T("مغبّشة", 170, 300, 26, INK, 800), ks[0]);
  s += G("", R(340, 60, 260, 200, "#f4ecdb", 2) + C(420, 160, 46, "#4a63b8", 2.4) + C(520, 160, 46, "#d9b44a", 2.4) + T("ألوان قليلة", 470, 300, 26, INK, 800), ks[1]);
  var fp = ""; for (var i = 0; i < 9; i++) fp += '<ellipse cx="0" cy="' + f(i * 1.2) + '" rx="' + f(16 + i * 11) + '" ry="' + f(22 + i * 13) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="' + (i % 2 ? "30 6" : "60 8") + '" stroke-dashoffset="' + f(t * 20 * (i % 2 ? 1 : -1)) + '"/>';
  s += G("", R(140, 340, 360, 320, "#f4ecdb", 2) + G("translate(320 470)", fp) + noseFront(320, 560, .32, t, { sniff: 1 }) + T("ريحتك = بصمة", 320, 700, 28, ORANGE, 800), ks[2]);
  return s;
});
// 23 · identical twins, same house, same food — trained dogs still tell their smells apart
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var a = owner(170, FL, 1.0, t, { mouth: "smile" }), b = owner(470, FL, 1.0, t + .7, { mouth: "smile" }), k = at(u, d * .4, d * .4);
  var p = pup(lerp(320, 250, k), FL, 1.3, t, { dir: -1, head: -14, sniff: 1, walk: k > 0 && k < 1 ? 1 : 0, ph: t * 8, mouth: .6 });
  var s = paper() + room(FL, { plant: false, frame: false }) + a.svg + b.svg + cloud(170, FL - 300, 70, t, ORANGE, at(u, .6, .5), 1) + cloud(470, FL - 300, 70, t, "#c8892f", at(u, .6, .5), 40);
  s += p.svg + G("", tag("توأم متطابق", 320, 110, 1, 30), at(u, .2, .3)) + check(170, 200, 1.1, at(u, d * .85, .4), OLIVE);
  return s;
});

// ══ the hook card art (608 × 660): line 0 the owner, wiped into what the dog sees; line 1 the colours that go;
// line 2 the dog running to him all the same ══
SCENE.intro = function (svg, t, li) {
  var fl = 600, u0 = t - LN[0].start, o = owner(304, fl, 1.18, t, { mouth: "smile" }), base = room(fl, { plantX: 520, frameX: 150, rugX: 304 }) + o.svg, s;
  var w = li === 0 ? lerp(620, 304, ease((u0 - .6) / 1.2)) : 304;
  if (li === 0) s = split(w, base, dogView(base, 5), 0, 660) + (u0 > .9 ? T("إنت", 150, 60, 30, INK, 800) + T("هو", 460, 60, 30, INK, 800) : "");
  else s = dogView(base, 5);
  if (li >= 1) { var u1 = t - LN[1].start;
    s += G("", R(40, 30, 528, 100, PAPER, 2) + C(120, 80, 30, SHIRT, 2) + C(230, 80, 30, "#4f9a4a", 2) + C(380, 80, 30, dvHex(SHIRT), 2) + C(490, 80, 30, dvHex("#4f9a4a"), 2) + arrow(268, 80, 340, 80, INK, 4, 1), ease(u1 / .3)) +
      cross(305, 80, .8, ease((u1 - .6) / .4)); }
  if (li >= 2) { var u2 = t - LN[2].start, k = ease(u2 / 1.2), p = pup(lerp(-60, 170, k), fl, 1.35, t, { walk: k < 1 ? 1 : 0, ph: t * 10, head: -16, tail: 24 * Math.sin(t * 12), mouth: .8 });
    s += p.svg + check(470, 220, 1.3, ease((u2 - 1) / .4), OLIVE); }
  return s;
};
// the bumper (180 × 200): a dog's head sniffing a scent trail
SCENE.bumper = function (u, t) {
  var p = dog({ x: 30, y: 210, s: 1.1, dir: 1, head: -6, sniff: 1, tail: 10 * Math.sin(t * 8), mouth: 0 });
  return p.svg + scent(190, 70, p.nose[0] + 2, p.nose[1], t, 1, ORANGE, 2);
};
// the summary card art (600 × 280): the eye, the two colours, the nose with its smell cell count, the owner's smell
SCENE.outro = function (svg, u, t) {
  var p = dog({ x: 150, y: 270, s: 1.35, dir: 1, head: -8, sniff: 1, tail: 14 * Math.sin(t * 7), mouth: .3 });
  return p.svg + scent(560, 120, p.nose[0] + 4, p.nose[1], t, 1, ORANGE, 3) + cloud(560, 120, 30, t, ORANGE, 1) +
    callout("1", p.eye[0] - 6, p.eye[1] - 28, ease(u / .3)) + callout("2", p.eye[0] + 26, p.eye[1] - 40, ease(u / .3 - .5)) + callout("3", p.nose[0] + 10, p.nose[1] + 30, ease(u / .3 - 1)) + callout("4", 560, 70, ease(u / .3 - 1.5));
};
