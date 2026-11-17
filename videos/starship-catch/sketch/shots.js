// ── «السفينة اللي البرج مسكها» — Starship Flight 15 (Ship 42), drawings + real footage cards.
// Shapes follow the real ship, booster and Pad 2 tower as seen in the SpaceX Flight 15 webcast frames (refs/SOURCES.md):
// a 9 m steel cylinder about 52 m tall with an ogive nose, black hexagonal heat-shield tiles on the windward half,
// two small forward flaps near the nose, two big aft flaps at the base, a catch pin on each side just under the forward
// flaps, three sea-level Raptors in the middle. The tower is a square lattice column; two «chopstick» arms ride a carriage on it.

// ── real footage: footage/<clip>/NNNN.jpg at 30 fps, cut from the webcast clips the user sent (gitignored) ──
var CLIPS = { launch: [211, 640, 360], starlink: [210, 360, 640], reentry: [270, 640, 360], reentry2: [240, 640, 360],
              flaps: [270, 640, 360], "catch": [450, 640, 358], topcam: [150, 640, 358], drone: [270, 640, 358] };
function frameURL(n, s) { var c = CLIPS[n], i = Math.max(1, Math.min(c[0], 1 + Math.floor(s * 30))); return "../footage/" + n + "/" + ("000" + i).slice(-4) + ".jpg"; }
// preload every frame so the renderer never shoots a frame before its picture has decoded
window.__imgs = [];
Object.keys(CLIPS).forEach(function (n) { for (var i = 1; i <= CLIPS[n][0]; i++) { var im = new Image(); im.src = frameURL(n, (i - 1) / 30 + 0.001); window.__imgs.push(im); } });

// a photo card pinned to the paper: white border, two strips of tape, the clip playing inside, the credit under it.
// s = seconds into the clip; o = {crop: [top, bottom] fractions cut off the source, rot, note, credit, speed}
function vcard(n, s, x, y, w, k, o) {
  k = pop(k == null ? 1 : k); if (k <= 0) return ""; o = o || {}; var c = CLIPS[n], ct = (o.crop || [0.07, 0.15])[0], cb = (o.crop || [0.07, 0.15])[1];
  var full = w * c[2] / c[1], h = full * (1 - ct - cb), pad = 9, id = "vc" + (++CLIPN), rot = o.rot == null ? -2 : o.rot;
  var s0 = '<rect x="' + f(-w / 2 - pad + 6) + '" y="' + f(-h / 2 - pad + 8) + '" width="' + f(w + 2 * pad) + '" height="' + f(h + 2 * pad + 26) + '" fill="#000" opacity=".16"/>' +
    '<rect x="' + f(-w / 2 - pad) + '" y="' + f(-h / 2 - pad) + '" width="' + f(w + 2 * pad) + '" height="' + f(h + 2 * pad + 26) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath>' +
    '<g clip-path="url(#' + id + ')"><image href="' + frameURL(n, s) + '" x="' + f(-w / 2) + '" y="' + f(-h / 2 - ct * full) + '" width="' + f(w) + '" height="' + f(full) + '" preserveAspectRatio="none"/></g>' +
    '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"/>' +
    '<rect x="' + f(-w / 2 - 24) + '" y="' + f(-h / 2 - 22) + '" width="74" height="24" fill="#e3d6b0" opacity=".85" transform="rotate(-24 ' + f(-w / 2 + 12) + ' ' + f(-h / 2 - 10) + ')"/>' +
    '<rect x="' + f(w / 2 - 50) + '" y="' + f(-h / 2 - 22) + '" width="74" height="24" fill="#e3d6b0" opacity=".85" transform="rotate(22 ' + f(w / 2 - 12) + ' ' + f(-h / 2 - 10) + ')"/>' +
    T(o.credit || "SpaceX · Flight 15", w / 2 - 2, h / 2 + pad + 18, 15, MUTE, 700, "start") +
    (o.note ? T(o.note, -w / 2 + 2, h / 2 + pad + 18, 15, ORANGE, 800, "end") : "");
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot * (2 - k)) + ") scale(" + f(k) + ")", s0);
}

// ── the ship (nose up at 0,0, base at y 520, radius 45 ≈ 9 m / 52 m) ──
var STEEL = "#d2d1cb", STEEL2 = "#b3b2ab", TILE = "#36363b", TILE2 = "#5b5b62", FLAME = "#e88a3a", FLAME2 = "#f6d27a";
function flames(k, t, xs, y, len) {
  if (k <= 0) return ""; var s = ""; (xs || [-24, 0, 24]).forEach(function (x, i) {
    var L = (len || 110) * k * (0.88 + 0.12 * Math.sin(t * 37 + i * 2.1)), y0 = y || 548;
    s += '<path d="M' + f(x - 12) + ' ' + y0 + ' Q' + f(x - 8) + ' ' + f(y0 + L * .6) + ' ' + f(x) + ' ' + f(y0 + L) + ' Q' + f(x + 8) + ' ' + f(y0 + L * .6) + ' ' + f(x + 12) + ' ' + y0 + ' Z" fill="' + FLAME + '" stroke="' + INK + '" stroke-width="1.2"/>' +
         '<path d="M' + f(x - 6) + ' ' + y0 + ' Q' + f(x) + ' ' + f(y0 + L * .55) + ' ' + f(x + 6) + ' ' + y0 + ' Z" fill="' + FLAME2 + '"/>'; });
  return s;
}
// o: {hl: "tiles"|"flaps"|"pins"|"engines", flame: 0..1, fa: forward-flap angle, aa: aft-flap angle, legs: true}
function ship(o) {
  o = o || {}; var t = window.__t, hl = o.hl || "", id = "hx" + (++CLIPN), cid = "sb" + (++CLIPN), s = "";
  var body = "M-45 120 C-45 55 -22 6 0 0 C22 6 45 55 45 120 V520 H-45 Z";
  s += '<pattern id="' + id + '" width="14" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 L3.5 0 H10.5 L14 6 L10.5 12 H3.5 Z" fill="' + (hl === "tiles" ? "#5a3b30" : TILE) + '" stroke="' + (hl === "tiles" ? ORANGE : TILE2) + '" stroke-width="1"/></pattern>';
  s += flames(o.flame || 0, t);
  if (o.legs) s += P("M-40 470 L-92 548 M40 470 L92 548 M-30 500 L-92 548 M30 500 L92 548", "none", 5) + P("M-104 548 H-80 M80 548 H104", "none", 6);
  [-1, 1].forEach(function (m) {
    var fa = (o.fa || 0) * m, aa = (o.aa || 0) * m, fc = hl === "flaps" ? ORANGE : TILE;
    s += G("rotate(" + f(fa) + " " + f(-42 * m) + " 142)", P("M" + f(-40 * m) + " 92 L" + f(-74 * m) + " 122 L" + f(-76 * m) + " 186 L" + f(-44 * m) + " 192 Z", fc, 1.8));
    s += G("rotate(" + f(aa) + " " + f(-44 * m) + " 456)", P("M" + f(-44 * m) + " 398 L" + f(-92 * m) + " 440 L" + f(-94 * m) + " 516 L" + f(-44 * m) + " 516 Z", fc, 1.8));
  });
  [-24, 0, 24].forEach(function (x) { s += P("M" + (x - 9) + " 520 L" + (x - 13) + " 548 H" + (x + 13) + " L" + (x + 9) + " 520 Z", hl === "engines" ? ORANGE : "#6e6d68", 1.6); });
  s += '<path d="' + body + '" fill="' + STEEL + '"/><clipPath id="' + cid + '"><path d="' + body + '"/></clipPath><g clip-path="url(#' + cid + ')">' +
       '<path d="M-50 0 H-4 L-8 60 L-3 120 L-7 200 L-2 300 L-7 400 L-3 520 H-50 Z" fill="url(#' + id + ')"/>';
  for (var y = 165; y < 520; y += 46) s += '<path d="M-3 ' + y + ' H50" stroke="' + STEEL2 + '" stroke-width="1.4"/>';
  s += '<path d="M28 130 V510" stroke="#ecebe6" stroke-width="6" opacity=".7"/></g>';
  s += P(body, "none", 2.2);
  var pc = hl === "pins" ? ORANGE : "#8b8a84";
  s += R(44, 198, 14, 10, pc, 1.5) + R(-58, 198, 14, 10, pc, 1.5);
  return s;
}
// the Super Heavy booster (top at 0, base at 710 ≈ 71 m; same 9 m width): vented hot-stage ring, grid fins, engine skirt
function booster(o) {
  o = o || {}; var s = "", t = window.__t;
  s += flames(o.flame || 0, t, [-34, -17, 0, 17, 34], 728, 160);
  s += R(-45, 0, 90, 710, STEEL, 2.2) + R(-45, 0, 90, 34, "#8d8c86", 2);
  for (var x = -38; x < 45; x += 13) s += R(x, 6, 7, 22, INK, 0);
  [-1, 1].forEach(function (m) { s += R(m < 0 ? -84 : 45, 54, 39, 52, "#9a9993", 1.8); for (var k = 1; k < 4; k++) s += '<path d="M' + (m < 0 ? -84 : 45) + ' ' + (54 + k * 13) + ' h39 M' + ((m < 0 ? -84 : 45) + k * 10) + ' 54 v52" stroke="' + INK + '" stroke-width=".9"/>'; });
  for (var y = 90; y < 700; y += 52) s += '<path d="M-45 ' + y + ' H45" stroke="' + STEEL2 + '" stroke-width="1.4"/>';
  s += '<path d="M28 40 V700" stroke="#ecebe6" stroke-width="6" opacity=".7"/>';
  [-34, -17, 0, 17, 34].forEach(function (x) { s += P("M" + (x - 6) + " 710 L" + (x - 8) + " 728 H" + (x + 8) + " L" + (x + 6) + " 710 Z", "#6e6d68", 1.2); });
  return s;
}
// the tower: a square lattice column from (x, base) up h; the arms ride a carriage at height ay above the base
function tower(x, base, h) {
  var s = R(x, base - h, 70, h, "#c4bfb2", 2), top = base - h;
  for (var y = base; y > top + 1; y -= 70) s += '<path d="M' + x + ' ' + y + ' L' + (x + 70) + ' ' + f(Math.max(top, y - 70)) + ' M' + (x + 70) + ' ' + y + ' L' + x + ' ' + f(Math.max(top, y - 70)) + ' M' + x + ' ' + y + ' H' + (x + 70) + '" stroke="' + INK + '" stroke-width="1.3"/>';
  s += R(x - 6, top - 12, 82, 14, "#9d978a", 1.8);
  return s;
}
// one chopstick arm seen from the side: from the tower face (x) out to the right by len, at height y
function arm(x, y, len, col, far) {
  var s = '<path d="M' + x + ' ' + (y - 16) + ' L' + (x + len) + ' ' + (y - 7) + ' V' + (y + 7) + ' L' + x + ' ' + (y + 16) + ' Z" fill="' + (col || "#8f8a7e") + '" stroke="' + INK + '" stroke-width="2"' + (far ? ' opacity=".55"' : "") + '/>';
  for (var k = 0; k < len - 20; k += 22) s += '<path d="M' + (x + k) + ' ' + f(y - 15 + k * 9 / len) + ' L' + (x + k + 11) + ' ' + f(y + 14 - k * 9 / len) + ' L' + (x + k + 22) + ' ' + f(y - 14 + k * 9 / len) + '" stroke="' + INK + '" stroke-width="1" fill="none"' + (far ? ' opacity=".5"' : "") + '/>';
  return s + R(x - 14, y - 26, 18, 52, "#7b766b", 1.8);
}
// the catch seen from above: the tower, the two arms swinging shut (k 0 open → 1 closed), the ship's circle and its pins
function plan(k, hl) {
  var s = R(-150, -36, 72, 72, "#c4bfb2", 2) + '<path d="M-150 -36 L-78 36 M-78 -36 L-150 36" stroke="' + INK + '" stroke-width="1.2"/>';
  s += C(40, 0, 40, STEEL, 2.2) + '<path d="M3 -14 A40 40 0 0 0 3 14 L0 0 Z" fill="' + TILE + '"/>';
  s += R(30, -55, 20, 13, hl ? ORANGE : "#8b8a84", 1.6) + R(30, 42, 20, 13, hl ? ORANGE : "#8b8a84", 1.6);
  [-1, 1].forEach(function (m) {
    var px = -78, py = 26 * m, ex = 150, ey = lerp(150, 56, k) * m, a = Math.atan2(ey - py, ex - px), nx = -Math.sin(a) * 11, ny = Math.cos(a) * 11;
    s += '<path d="M' + f(px + nx) + ' ' + f(py + ny) + ' L' + f(ex + nx * .6) + ' ' + f(ey + ny * .6) + ' L' + f(ex - nx * .6) + ' ' + f(ey - ny * .6) + ' L' + f(px - nx) + ' ' + f(py - ny) + ' Z" fill="#8f8a7e" stroke="' + INK + '" stroke-width="2"/>';
    s += C(px, py, 6, INK, 0);
  });
  return s;
}
// the curve of the Earth seen from low orbit, with its thin blue air
function limb(cy, r, t) {
  return '<circle cx="320" cy="' + cy + '" r="' + (r + 26) + '" fill="#bcd0d6" stroke="none"/><circle cx="320" cy="' + cy + '" r="' + r + '" fill="' + OCEAN + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M' + f(140 - (t * 14) % 60) + ' ' + (cy - r + 40) + ' q40 -14 80 0 q30 10 70 -4 q40 -12 90 4" fill="none" stroke="' + LAND + '" stroke-width="16" stroke-linecap="round" opacity=".7"/>';
}
// the glowing air in front of the belly: a bow of hot gas below a ship falling belly-first
function plasma(cx, cy, w, k, t) {
  if (k <= 0) return ""; var fl = 1 + 0.06 * Math.sin(t * 23);
  return '<path d="M' + f(cx - w) + ' ' + f(cy - 20) + ' Q' + f(cx) + ' ' + f(cy + 120 * k * fl) + ' ' + f(cx + w) + ' ' + f(cy - 20) + '" fill="' + FLAME + '" opacity="' + f(.55 * k) + '" stroke="' + ORANGE + '" stroke-width="3"/>' +
         '<path d="M' + f(cx - w * .8) + ' ' + f(cy - 10) + ' Q' + f(cx) + ' ' + f(cy + 70 * k * fl) + ' ' + f(cx + w * .8) + ' ' + f(cy - 10) + '" fill="' + FLAME2 + '" opacity="' + f(.7 * k) + '"/>';
}
// a skydiver seen from above, arms and legs spread (real proportions: arm 0.44H span each side, legs 0.52H)
function skydiver(t) {
  var w = 4 * Math.sin(t * 3);
  return G("rotate(" + f(w) + ")", P("M-8 -18 L-34 -40 L-40 -36 M8 -18 L34 -40 L40 -36", "none", 6) + P("M-6 20 L-22 52 M6 20 L22 52", "none", 7) +
    '<ellipse cx="0" cy="0" rx="13" ry="24" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/>' + C(0, -32, 9, SKIN, 2));
}
function parachute(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + (s || 1) + ")", P("M-50 0 Q0 -60 50 0 Q38 -6 25 0 Q12 -6 0 0 Q-12 -6 -25 0 Q-38 -6 -50 0 Z", "#e8d9b8", 2) + P("M-50 0 L-12 70 M50 0 L12 70 M0 0 V70", "none", 1.3) + P("M-16 70 H16 L10 92 H-10 Z", "#c9c4b6", 2)); }
function oven(t) {
  var s = R(-40, -34, 80, 66, "#b55a3c", 2);
  for (var y = -34; y < 32; y += 11) s += '<path d="M-40 ' + y + ' H40" stroke="' + INK + '" stroke-width="1"/>';
  for (var r = 0, y2 = -34; y2 < 32; y2 += 11, r++) for (var x = -40 + (r % 2) * 10; x < 40; x += 20) s += '<path d="M' + x + ' ' + y2 + ' v11" stroke="' + INK + '" stroke-width="1"/>';
  return s + P("M-18 32 Q-14 " + f(10 - 4 * Math.sin(t * 9)) + " -4 18 Q0 4 6 16 Q14 " + f(6 + 4 * Math.cos(t * 8)) + " 18 32 Z", FLAME, 1.6);
}
function money(x, y, txt, k) { return appear(k, R(x - 52, y - 24, 104, 48, "#cfd8b4", 1.8) + C(x, y, 14, "#b9c597", 1.4) + N(txt, x, y + 7, 18, INK)); }
function stopwatch(cx, cy, r, k) {
  return C(cx, cy, r, "#f4ecdb", 3) + R(cx - 12, cy - r - 20, 24, 14, INK, 0) + '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.sin(k * 6.283) * (r - 12)) + ' ' + f(cy - Math.cos(k * 6.283) * (r - 12)) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' + C(cx, cy, 5, ORANGE, 0);
}
function stars(t) { var s = ""; for (var i = 0; i < 40; i++) s += '<circle cx="' + f(hash(i) * 640) + '" cy="' + f(hash(i + 50) * 500) + '" r="' + f(1 + hash(i + 9) * 1.6) + '" fill="' + INK + '" opacity="' + f(.25 + .2 * Math.sin(t * 2 + i)) + '"/>'; return s; }

// ── shots ──
// 4 · the ship on its booster: the real launch, then the stack drawn with its sizes
shot(4, push(320, 380, 1.0, 1.06), function (u, d, t) { return paper() + vcard("launch", u, 320, 360, 520, at(u, 0, .4), { crop: [0, 0.16], rot: -2 }); });
shot([4, 1], push(330, 400, 0.98, 1.06), function (u, d, t) {
  return paper() + G("translate(250 56) scale(.5)", ship() + G("translate(0 548)", booster())) +
    measure(330, 56, 330, 316, at(u, .4, .7), "") + T("50 م", 390, 196, 30, ORANGE, 800) +
    label(272, 150, 470, 120, "ستارشيب", OLIVE, at(u, .9, .5), 26) + label(272, 520, 470, 520, "سوبر هيفي", OLIVE, at(u, 2, .5), 26);
});
// 5 · 14 laps round the Earth, then the satellites going out
shot(5, push(320, 400, 1.04, 0.96), function (u, d, t) {
  var a = t * 1.6, ox = 320 + Math.cos(a) * 250, oy = 380 + Math.sin(a) * 90;
  var back = Math.sin(a) < 0;
  return paper() + stars(t) + (back ? C(ox, oy, 9, ORANGE, 2) : "") + globe(320, 380, 190, -t * 22, 20) +
    '<ellipse cx="320" cy="380" rx="250" ry="90" fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="8 7"/>' + (back ? "" : C(ox, oy, 9, ORANGE, 2)) +
    numBox(count(14, at(u, .3, 1.6)) + "", 130, 650, at(u, .2, .3), 40) + appear(at(u, .4, .3), T("لفة", 130, 712, 24, INK, 800)) +
    numBox("22.5", 500, 650, at(u, 1.4, .3), 40) + appear(at(u, 1.6, .3), T("ساعة", 500, 712, 24, INK, 800));
});
shot([5, 2], push(320, 393, 1.0, 1.05), function (u, d, t) {
  return paper() + vcard("starlink", u + 0.6, 320, 380, 300, at(u, 0, .4), { crop: [0.02, 0.3], rot: 2, note: "من رحلة سابقة", credit: "SpaceX" }) + tag("26 قمر", 540, 120, at(u, .8, .3), 26, BLUE);
});
// 6 · why is coming back the hard part?
shot(6, push(320, 380, 1.0, 1.08), function (u, d, t) {
  return paper() + stars(t) + limb(1500, 1000, t) + G("translate(" + f(200 + u * 30) + " 260) rotate(-90) scale(.42)", ship()) + T("؟", 520, 260, 150, ORANGE, 800);
}, { tr: "in" });
// 7 · 27,000 km/h — the real reentry glow
shot(7, push(320, 393, 1.0, 1.05), function (u, d, t) {
  return paper() + vcard("reentry", u + 0.5, 320, 330, 560, at(u, 0, .4), { rot: -1.5 }) + numBox(count(27000, at(u, .5, 1.6)), 320, 610, at(u, .4, .3), 40) + appear(at(u, .6, .3), T("كيلو في الساعة", 320, 672, 24, INK, 800));
});
// 8 · the air in front gets squeezed and hot: 1400 °C
shot(8, push(320, 380, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .3, 1), s = paper();
  for (var i = 0; i < 6; i++) { var y = 700 - ((u * 160 + i * 60) % 300); s += arrow(150 + i * 68, y + 60, 150 + i * 68, y, BLUE, 3, 1); }
  return s + plasma(320, 340, 280, k, t) + G("translate(20 300) rotate(-90) scale(.6)", ship({ hl: "tiles" })) +
    label(400, 420, 250, 520, "هوا مضغوط", BLUE, at(u, .6, .5), 24) + numBox("1400°", 480, 170, at(u, 1.6, .3), 44) + appear(at(u, 1.8, .3), T("درجة", 480, 236, 24, INK, 800));
});
// 9 · the real tiles in the glow, then the tiles close up and the oven analogy
shot(9, push(320, 393, 1.0, 1.05), function (u, d, t) { return paper() + vcard("reentry2", u, 320, 360, 560, at(u, 0, .4), { crop: [0.0, 0.3], rot: 1.5 }) + label(260, 250, 140, 560, "البلاط", OLIVE, at(u, .8, .5), 26); });
shot([9, 1], push(300, 400, 1.0, 1.1), function (u, d, t) {
  var s = paper() + G("translate(320 120) scale(1.25)", ship({ hl: "tiles" }));
  return s + inset(470, 560, 120, G("scale(2.4)", '<rect x="-60" y="-60" width="120" height="120" fill="url(#hx' + (CLIPN - 1) + ')"/>') + '<rect x="-120" y="-120" width="240" height="240" fill="' + ORANGE + '" opacity="' + f(.12 + .08 * Math.sin(t * 6)) + '"/>', at(u, .4, .4)) +
    iconBox(130, 130, 150, oven(t), at(u, 1.4, .35));
});
// 10 · no parachute
shot(10, push(320, 370, 1.25, 1.35), function (u, d, t) { return paper() + parachute(320, 330 + 8 * Math.sin(t * 2), 2.2) + cross(320, 380, 2.4, at(u, .6, .5)); }, { tr: "out" });
// 11 · lying on its belly: the air brakes it
shot(11, push(320, 380, 1.1, 1.18), function (u, d, t) {
  var s = paper();
  for (var i = 0; i < 7; i++) { var y = 760 - ((u * 220 + i * 50) % 330); s += arrow(110 + i * 70, y + 70, 110 + i * 70, y, BLUE, 3.4, 1); }
  return s + G("translate(60 " + f(330 + 6 * Math.sin(t * 2)) + ") rotate(-90) scale(.55)", ship()) + label(300, 385, 200, 540, "بطنها لتحت", OLIVE, at(u, .5, .5), 24) +
    arrow(560, 200, 560, 120, ORANGE, 5, at(u, 1.6, .4)) + appear(at(u, 1.8, .3), T("فرملة", 560, 250, 24, ORANGE, 800));
});
// 12 · four flaps steer it — the real flap, then the drawing and the skydiver
shot(12, push(320, 393, 1.0, 1.04), function (u, d, t) { return paper() + vcard("flaps", u, 320, 330, 560, at(u, 0, .4), { rot: -1.5 }) + label(330, 230, 470, 560, "جنيح", OLIVE, at(u, .6, .5), 26); });
shot([12, 1], push(330, 393, 1.0, 1.06), function (u, d, t) {
  var w = 14 * Math.sin(t * 3.2);
  return paper() + G("translate(80 380) rotate(-90) scale(.75)", ship({ hl: "flaps", fa: w, aa: -w * .8 })) +
    callout("1", 128, 260, at(u, .2, .3)) + callout("2", 128, 500, at(u, .4, .3)) + callout("3", 510, 260, at(u, .6, .3)) + callout("4", 510, 500, at(u, .8, .3)) +
    iconBox(520, 110, 150, G("translate(0 6) scale(1.1)", skydiver(t)), at(u, 1.2, .35));
});
// 13 · down to about 300 km/h
shot(13, push(320, 420, 1.2, 1.12), function (u, d, t) {
  var v = Math.round(lerp(27000, 300, at(u, .2, 2.2)));
  return paper() + G("translate(150 " + f(270 + 8 * Math.sin(t * 2)) + ") rotate(-90) scale(.5)", ship()) + numBox(v.toLocaleString("en-US"), 320, 520, 1, 46) + T("كيلو في الساعة", 320, 590, 24, INK, 800) +
    draw("M140 640 H500", at(u, .2, 2.2), ORANGE, 6);
}, { tr: "in" });
// 14 · three engines light and it flips upright beside the tower
shot(14, push(300, 400, 1.12, 1.2), function (u, d, t) {
  var k = at(u, 1.3, 2.2), y = lerp(150, 250, ease(u / 4.5));
  return paper() + tower(70, 780, 640) + arm(140, 300, 120, null, true) + G("translate(" + f(lerp(330, 360, k)) + " " + f(y) + ") rotate(" + f(lerp(-90, 0, k)) + " 0 260) scale(.5) translate(0 -0)", ship({ flame: at(u, .4, .3), hl: k < 1 ? "engines" : "" })) +
    numBox("3", 480, 160, at(u, .4, .3), 40) + appear(at(u, .6, .3), T("محركات", 480, 220, 24, ORANGE, 800));
});
// 15 · the two arms close under the pins
shot(15, push(320, 400, 1.08, 1.14), function (u, d, t) {
  var k = at(u, .6, 1.4);
  return paper() + tower(60, 790, 660) + arm(130, 279, 260, null, true) + G("translate(300 140) scale(.62)", ship({ flame: 1 - k, hl: "pins" })) + arm(130, 285, 260) +
    inset(450, 590, 125, G("scale(.55)", plan(k, true)), at(u, .3, .4)) + label(340, 268, 500, 200, "النتوء", OLIVE, at(u, 1.8, .5), 22) +
    iconBox(520, 110, 110, P("M-40 30 L36 -34 M-30 38 L40 -22", "none", 6) + C(-36, 34, 6, "#c97a5b", 0), at(u, 1.8, .35));
});
shot([15, 3], push(320, 393, 1.0, 1.05), function (u, d, t) { return paper() + vcard("topcam", u, 320, 360, 560, at(u, 0, .4), { rot: 1.5 }) + label(320, 300, 470, 560, "الدراعين", OLIVE, at(u, .6, .5), 26); });
// 16 · the myth: the tower snatches a falling ship — no
shot(16, push(320, 360, 1.15, 1.25), function (u, d, t) {
  var y = lerp(-80, 120, at(u, 0, 1.2));
  return paper() + tower(60, 790, 660) + arm(130, 285, 260) + G("translate(300 " + f(y) + ") scale(.62)", ship()) +
    [0, 1, 2].map(function (i) { return '<path d="M' + (250 + i * 50) + ' ' + f(y - 40 - i * 10) + ' v-60" stroke="' + INK + '" stroke-width="3" stroke-dasharray="6 6"/>'; }).join("") + cross(470, 300, 2, at(u, 1.6, .5));
});
// 17 · it stops itself on its engines; the arms only take it — then the real ship sitting on the arms
shot(17, push(320, 360, 1.2, 1.12), function (u, d, t) {
  return paper() + tower(60, 790, 660) + arm(130, 285, 260) + G("translate(300 " + f(132 + 5 * Math.sin(t * 3)) + ") scale(.62)", ship({ flame: 1, hl: "engines" })) + check(520, 160, 1.6, at(u, .8, .5), OLIVE);
});
shot([17, 1], push(320, 393, 1.0, 1.06), function (u, d, t) { return paper() + vcard("drone", u + 2, 320, 380, 560, at(u, 0, .4), { crop: [0.08, 0.06], rot: -1 }); });
// 18 · why no legs: the legs weigh, every kilo comes off the cargo
shot(18, push(320, 390, 1.12, 1.18), function (u, d, t) {
  var tilt = at(u, 1.6, 1) * 8;
  return paper() + G("translate(190 130) scale(.5)", ship({ legs: true })) + cross(190, 290, 1.6, at(u, .8, .4)) +
    G("translate(470 520) rotate(" + f(tilt) + ")", P("M-130 0 H130", "none", 5) + R(-125, -60, 90, 60, "#9a9993", 1.8) + T("رجلين", -80, -22, 20, INK, 800) + R(45, -40, 80, 40, BEIGE, 1.8) + T("حمولة", 85, -14, 18, BLUE, 800)) +
    P("M470 520 L440 600 H500 Z", "#b3ad9c", 2) + numBox("-كيلو", 470, 680, at(u, 2.4, .3), 26);
});
// 19 · both stages back: the trip costs fuel and upkeep, not a new rocket
shot(19, push(340, 380, 1.12, 1.18), function (u, d, t) {
  return paper() + G("translate(140 90) scale(.36)", ship() + G("translate(0 548)", booster())) + T("↺", 140, 640, 60, OLIVE, 800) +
    appear(at(u, .8, .4), R(300, 120, 300, 110, "#f4ecdb", 2) + T("وقود + صيانة", 450, 186, 30, BLUE, 800)) + check(260, 175, .9, at(u, 1.3, .4), OLIVE) +
    appear(at(u, 2.6, .4), R(300, 330, 300, 110, "#f4ecdb", 2) + T("صاروخ جديد", 450, 396, 30, INK, 800)) + cross(450, 385, 1.7, at(u, 3.4, .4));
});
// 20 · the price of a kilo to orbit
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k1 = at(u, .2, .8), k2 = at(u, 1.4, .8);
  return paper() + P("M100 640 H560 M100 640 V160", "none", 2.4) + R(160, 640 - 420 * k1, 140, 420 * k1, GREY, 2) + R(370, 640 - 30 * k2, 140, 30 * k2, ORANGE, 2) +
    T("آلاف $", 230, 200, 30, INK, 800) + bigNum("~100$", "للكيلو", 440, 560, k2, ORANGE, 46) + arrow(300, 260, 400, 560, ORANGE, 4, at(u, 2, .6));
});
// 21 · Moon and Mars: ships refilling each other in orbit
shot(21, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .4, 1.2), flow = (t * 60) % 40;
  return paper() + stars(t) + G("translate(" + f(lerp(-40, 70, k)) + " 330) rotate(-90) scale(.42)", ship()) + G("translate(" + f(lerp(680, 570, k)) + " 330) rotate(90) scale(.42)", ship()) +
    (k > .99 ? '<path d="M290 330 H350" stroke="' + BLUE + '" stroke-width="8" stroke-dasharray="10 10" stroke-dashoffset="' + f(-flow) + '"/>' : "") +
    label(320, 330, 320, 470, "تموين", BLUE, at(u, 1.6, .4), 24) + moon(140, 640, 60) + C(520, 640, 50, "#c0603e", 2.4) + T("القمر", 140, 740, 22, OLIVE, 800) + T("المريخ", 520, 740, 22, ORANGE, 800);
});
// 22 · the recap, one step per clause
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[22], l = LN[22], b = function (i) { return l.start + (l.end - l.start) * (c[i] || 0) - l.start; };
  var cell = function (i, x, y, inner) { return appear(at(u, b(i + 1), .4), R(x - 135, y - 150, 270, 300, "#f4ecdb", 2) + callout(String(i + 1), x - 112, y - 128, 1, 14) + inner); };
  return paper() + (u < b(1) + .3 ? G("", tag("من الآخر", 320 + 20 * Math.sin(t * 3), 380, at(u, 0, .3), 60, ORANGE), 1 - at(u, b(1), .3)) : "") + cell(0, 175, 230, G("translate(175 230) scale(1.3)", '<rect x="-60" y="-60" width="120" height="120" fill="' + TILE + '"/>' + plasma(0, 40, 70, 1, t))) +
    cell(1, 465, 230, G("translate(400 " + f(230 + 10 * Math.sin(t * 2.5)) + ") rotate(-90) scale(.25)", ship({ fa: 15 * Math.sin(t * 3), aa: -12 * Math.sin(t * 3) })) + arrow(360, 360 - (t * 60) % 60, 360, 300 - (t * 60) % 60, BLUE, 3, 1) + arrow(570, 360 - (t * 60) % 60, 570, 300 - (t * 60) % 60, BLUE, 3, 1)) +
    cell(2, 175, 560, G("translate(175 " + f(440 + 8 * Math.sin(t * 3)) + ") scale(.32)", ship({ flame: 1 }))) +
    cell(3, 465, 560, G("translate(465 560) scale(.6)", plan(.75 + .25 * Math.sin(t * 2.5), true)));
});
// 23 · the odd fact: 18 seconds, on the webcast clock
shot(23, push(320, 393, 1.0, 1.05), function (u, d, t) {
  var k = clamp((u - .6) / 4.2);
  return paper() + vcard("catch", 3.7 + Math.min(u, 10.5) * 1.0, 320, 300, 560, at(u, 0, .4), { crop: [0.07, 0], rot: -1 }) +
    stopwatch(200, 640, 70, k * 18 / 60) + numBox(String(Math.round(18 * k)), 420, 650, 1, 50) + appear(at(u, .3, .3), T("ثانية", 420, 718, 24, INK, 800));
});

// ── the hook card, the bumper and the summary drawing ──
SCENE.intro = function (svg, t, li) {
  if (li === 0) return tower(150, 640, 560) + arm(220, 238, 240, null, true) + G("translate(370 " + f(80 + 4 * Math.sin(t * 2)) + ") scale(.6)", ship()) + arm(220, 230, 240);
  if (li === 1) {
    var u = t - LN[1].start;
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { var y = 600 - ((t * 300 + i * 97) % 520); return '<path d="M' + (40 + i * 26) + ' ' + f(y) + ' v-90" stroke="' + ORANGE + '" stroke-width="9" stroke-linecap="round" opacity=".6"/>'; }).join("") + G("translate(160 " + f(300 + 26 * Math.sin(t * 2.6)) + ") rotate(" + f(10 * Math.sin(t * 2)) + ") scale(1.5)", appear(at(u, 0, .3), P("M-40 40 L-30 -20 Q0 -50 30 -20 L40 40 Z", "#9b958a", 2) + plasma(0, 30, 60, 1, t))) +
      G("translate(305 260)", appear(at(u, 1.6, .3), G("translate(0 " + f(12 * Math.sin(t * 2.4)) + ") rotate(" + f(6 * Math.sin(t * 1.7)) + ")", parachute(0, 0, 1)) + wave(-110, 150, 110, 150, t, BLUE, 6, 40, 1, 4))) +
      G("translate(" + f(500 + 14 * Math.sin(t * 2.2)) + " " + f(300 + 10 * Math.cos(t * 1.8)) + ")", appear(at(u, 3.4, .3), P("M-60 20 L40 20 L70 0 L40 -20 L-60 -20 Z", "#e8e3d6", 2) + P("M-40 -20 L-10 -60 L10 -20", "#e8e3d6", 2) + T("شهور", 0, 90, 30, ORANGE, 800)));
  }
  var u2 = t - LN[2].start;
  return tower(150, 640, 560) + arm(220, 238, 240, null, true) + G("translate(370 80) scale(.6)", ship()) + arm(220, 230, 240) + check(500, 520, 1.8, at(u2, .3, .5), OLIVE);
};
SCENE.bumper = function (u, t) {
  return '<rect x="0" y="0" width="180" height="200" fill="#e9e2cf"/>' + G("translate(90 " + f(52 + 4 * Math.sin(t * 3)) + ") scale(.2)", ship({ flame: 1 }));
};
SCENE.outro = function (svg, u, t) {
  return tower(90, 280, 270) + arm(160, 76, 200, null, true) + G("translate(300 " + f(-2 + 2 * Math.sin(t * 2)) + ") scale(.45)", ship({ flame: .5 + .1 * Math.sin(t * 9) })) + arm(160, 70, 200) +
    callout("1", 252, 150, ease(u / .3)) + callout("2", 356, 50, ease(u / .3 - .5)) + callout("3", 300, 262, ease(u / .3 - 1)) + callout("4", 230, 52, ease(u / .3 - 1.5)) +
    G("translate(500 140) scale(.5)", plan(1, true));
};
