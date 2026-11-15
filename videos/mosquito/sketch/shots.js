// ── «الناموس بيلاقيك إزاي في الضلمة؟» — drawings (see refs/SOURCES.md). The mosquito is a side view of a female Culex /
// Aedes: humped thorax, banded abdomen tilted up, one long proboscis, feathery antennae, narrow wings, six long legs
// with the hind pair raised. People are plain busts and profiles with no faces, as in the reference hand.
var MQ = "#7a6650", MQ_D = "#43372b", MQ_L = "#d9cfba", BLOOD = "#a8362a", HAIR = "#3d3229", SKIN_L = "#e8c2ac", FAT = "#ecd9a8",
    SHIRTS = ["#b9c2b0", "#c9b48f", "#9fb0bd", "#c8a79a"], NIGHT = "#55524b";

// a mosquito, about 140 × 100 units at s = 1, facing left. op: fly (default true), flip, rot, fed 0..1, bite, ph, eye, op
function mosq(x, y, s, t, op) {
  op = op || {}; var fly = op.fly !== false, ph = op.ph || 0, fl = fly ? Math.sin(t * 46 + ph * 7) : 0;
  var bx = fly ? 3 * Math.sin(t * 5 + ph) : 0, by = fly ? 4 * Math.cos(t * 6.3 + ph) : 0;
  var leg = function (d, w) { return '<path d="' + d + '" fill="none" stroke="' + MQ_D + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"/>'; };
  var sw = fly ? 2.5 * Math.sin(t * 7 + ph) : 0, b = "";
  b += G("translate(5 -1)", leg("M-8 9 L" + f(-26 + sw) + " 30 L" + f(-36 + sw) + " 60") + leg("M-1 11 L" + f(2 + sw) + " 38 L" + f(-6 + sw) + " 64") + leg("M6 9 L32 20 L56 " + f(-6 + sw) + " L72 " + f(-30 + sw)), .45);
  b += '<ellipse cx="38" cy="0" rx="42" ry="' + (fly ? 11 : 8) + '" transform="translate(2 -11) rotate(' + f(fly ? -16 + 24 * fl : -13) + ')" fill="#f6f1e6" fill-opacity=".72" stroke="' + INK + '" stroke-width="1.2"/>';
  if (fly) b += '<ellipse cx="38" cy="0" rx="42" ry="10" transform="translate(2 -11) rotate(' + f(-16 - 24 * fl) + ')" fill="#f6f1e6" fill-opacity=".35" stroke="' + INK + '" stroke-width=".8"/>';
  var fed = op.fed || 0, ah = 7 * fed;
  b += '<path d="M10 -8 C30 ' + f(-17 - ah * .6) + ' 58 ' + f(-23 - ah * .5) + ' 76 -17 C62 ' + f(-3 + ah) + ' 30 ' + f(6 + ah * 1.3) + ' 10 8 Z" fill="' + (fed > .05 ? BLOOD : MQ) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  for (var k = 1; k <= 5; k++) b += '<path d="M' + (12 + k * 10) + ' ' + f(-10 - k * 1.7) + ' L' + (9 + k * 10) + ' ' + f(5 - k * 2.6 + ah) + '" stroke="' + (fed > .05 ? "#7d241b" : MQ_L) + '" stroke-width="2.6" fill="none"/>';
  b += '<ellipse cx="0" cy="0" rx="16" ry="13" transform="rotate(-10)" fill="' + MQ_D + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M-9 -6 Q0 -11 9 -8" stroke="' + MQ_L + '" stroke-width="1.6" fill="none"/>';
  b += C(-20, 2, 7.5, MQ, 1.6) + '<ellipse cx="-21.500" cy="1" rx="4.6" ry="5.6" fill="' + (op.eye || "#2d3a2a") + '"/>';
  b += leg(op.bite ? "M-26 5 L-40 64" : "M-26 5 L-58 30", 2.6) + leg("M-26 3 L-40 11", 1.6) + leg("M-25 -3 C-36 -14 -46 -12 -55 -3", 1.5) + leg("M-24 -5 C-32 -21 -44 -21 -51 -14", 1.5);
  b += leg("M-8 9 L" + f(-24 - sw) + " 32 L" + f(-30 - sw) + " 62") + leg("M-1 11 L" + f(6 - sw) + " 40 L" + f(0 - sw) + " 66") + leg("M6 9 L36 22 L60 " + f(-8 - sw) + " L78 " + f(-30 - sw));
  return G("translate(" + f(x + bx * s) + " " + f(y + by * s) + ") rotate(" + f(op.rot || 0) + ") scale(" + f(op.flip ? -s : s) + " " + f(s) + ")", b, op.op);
}
// a front-view bust with no face, 124 × 150 at s = 1 around the head centre. op: shirt, dark, hot, bites, long
function bust(x, y, s, op) {
  op = op || {}; var sk = op.dark ? "#3d3a34" : op.hot ? "#d98658" : SKIN, sh = op.dark ? "#33302b" : op.shirt || SHIRTS[0], hr = op.dark ? "#2a2723" : HAIR, b = "";
  if (op.long) b += '<path d="M-33 -6 C-40 40 -34 56 -26 60 L26 60 C34 56 40 40 33 -6 Z" fill="' + hr + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M-62 112 C-62 64 -34 52 -14 47 L-14 28 L14 28 L14 47 C34 52 62 64 62 112 Z" fill="' + sh + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-14 30 L-14 47 Q0 58 14 47 L14 30 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/>';
  b += '<ellipse cx="-30" cy="2" rx="5" ry="9" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="30" cy="2" rx="5" ry="9" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/>';
  b += '<ellipse cx="0" cy="0" rx="29" ry="36" fill="' + sk + '" stroke="' + INK + '" stroke-width="2"/>';
  b += '<path d="M-29 -4 C-33 -46 33 -46 29 -4 C20 -24 -18 -26 -29 -4 Z" fill="' + hr + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  if (op.bites) [[-12, 8], [10, 16], [-4, 38], [16, -2], [-34, 78], [30, 84]].forEach(function (p, i) { var k = pop(op.bites - i * .25); if (k > 0) b += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(4.2 * k) + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/>'; });
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a head and shoulders in profile, facing left; the mouth is at (-45, 22) and the nose tip at (-54, 8)
function profile(x, y, s, op) {
  op = op || {}; var b = '<path d="M0 -46 C-22 -46 -36 -36 -38 -22 L-42 -8 L-54 8 L-44 12 L-46 20 L-43 25 L-40 38 C-32 44 -22 45 -14 44 L-12 62 C-40 68 -60 76 -64 130 L78 130 C76 90 60 72 30 62 L34 30 C50 10 44 -46 0 -46 Z" fill="' + (op.hot ? "#d98658" : SKIN) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-12 62 C-40 68 -60 76 -64 130 L78 130 C76 90 60 72 30 62 C16 71 0 71 -12 62 Z" fill="' + (op.shirt || SHIRTS[2]) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-36 -28 C-30 -54 32 -58 43 -20 C47 0 41 20 34 30 C31 10 27 -6 14 -14 C0 -24 -20 -22 -36 -28 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  b += '<ellipse cx="12" cy="4" rx="5" ry="8" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.4"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a pregnant woman standing in profile, facing left (head centre at 0,0; the figure runs down to y = 300)
function pregnant(x, y, s) {
  var b = '<path d="M30 -30 C52 0 50 60 44 100 L20 100 L24 20 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M-14 44 L-12 60 C-34 70 -40 96 -38 124 C-76 140 -86 204 -40 234 L-38 300 L46 300 L48 110 C48 84 40 68 30 62 L34 30 Z" fill="#c8a79a" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M0 -46 C-22 -46 -36 -36 -38 -22 L-42 -8 L-54 8 L-44 12 L-46 20 L-43 25 L-40 38 C-32 44 -22 45 -14 44 L-12 62 Q10 72 30 62 L34 30 C50 10 44 -46 0 -46 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  b += '<path d="M-36 -28 C-30 -54 32 -58 43 -20 C47 0 41 20 34 30 C31 10 27 -6 14 -14 C0 -24 -20 -22 -36 -28 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  b += '<path d="M14 84 C6 124 -14 156 -52 168" fill="none" stroke="' + INK + '" stroke-width="18" stroke-linecap="round"/><path d="M14 84 C6 124 -14 156 -52 168" fill="none" stroke="' + SKIN + '" stroke-width="14" stroke-linecap="round"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", b);
}
// a bed from the side with someone asleep, 440 wide; the head is at (92, -34) from the mattress top-left corner
function bed(x, y, t) {
  var br = 3 * Math.sin(t * 1.6), b = R(-14, -96, 16, 176, WOOD_D, 2) + R(424, -40, 14, 120, WOOD_D, 2) + R(0, 0, 426, 40, "#e9e1cc", 2) + R(0, 40, 426, 22, WOOD, 2) + R(8, 62, 14, 22, WOOD_D, 1.6) + R(402, 62, 14, 22, WOOD_D, 1.6);
  b += '<path d="M24 0 C24 -30 60 -34 96 -30 C130 -26 140 -10 140 0 Z" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>';
  b += '<ellipse cx="92" cy="-36" rx="30" ry="26" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M62 -38 C60 -70 112 -74 120 -46 C104 -58 80 -56 62 -38 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.8"/>';
  b += '<path d="M118 0 C122 ' + f(-48 - br) + ' 170 ' + f(-62 - br) + ' 230 ' + f(-54 - br) + ' C300 -46 350 -40 410 -22 L420 0 Z" fill="' + SHIRTS[2] + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M150 ' + f(-40 - br) + ' Q250 -30 400 -14" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".5"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", b);
}
// a CO₂ molecule (O–C–O) and a plume of them drifting along path(p) → [x, y, spread]
function co2(x, y, s, op) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", C(-10, 0, 6, "#8fb0c4", 1.4) + C(10, 0, 6, "#8fb0c4", 1.4) + C(0, 0, 7, "#57534a", 1.4), op); }
function plume(path, t, k, n, sp, sz) {
  var s = ""; for (var i = 0; i < n; i++) { var p = (i / n + t * (sp || .07)) % 1; if (p > k) continue; var q = path(p), lat = (hash(i + 3) - .5) * 2 * q[2] + 5 * Math.sin(t * 2 + i);
    s += co2(q[0] + lat * .35, q[1] + lat, (sz || .8) * (.8 + .4 * hash(i)), Math.min(1, p * 8) * (1 - p * .55)); }
  return s;
}
function breath(x, y, len, t, k, n, sz) { return plume(function (p) { return [x - len * p, y + 30 * p * Math.sin(p * 5 + 1), 6 + 46 * p]; }, t, k == null ? 1 : k, n || 14, .09, sz); }
// smell rising off skin: n wavy lines of colour col
function fumes(x, y, w, n, h, t, col, k, amp) {
  var s = ""; for (var i = 0; i < n; i++) { var xi = x - w / 2 + w * (i + .5) / n, hh = h * (.65 + .35 * hash(i + n)); s += wave(xi, y, xi + 14 * (hash(i) - .5), y - hh, t + i * .7, col, amp || 6, 26, k == null ? 1 : k, 3); }
  return s;
}
function drop(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M0 -24 C13 -4 17 6 17 13 A17 17 0 0 1 -17 13 C-17 6 -13 -4 0 -24 Z" fill="' + (col || BLOOD) + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 12 Q-8 20 0 22" stroke="#fff" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>'); }
// a strip of skin seen from the side: surface at y, hairs, epidermis and dermis below; h = depth
function skin(x, y, w, h, t, op) {
  op = op || {}; var d = "M" + f(x) + " " + f(y), k, s = "";
  for (k = 1; k <= 20; k++) d += " L" + f(x + w * k / 20) + " " + f(y + 2.5 * Math.sin(k * 1.3));
  s += '<path d="' + d + " L" + f(x + w) + " " + f(y + h) + " L" + f(x) + " " + f(y + h) + ' Z" fill="' + SKIN_L + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var e = Math.min(h * .3, 46); d = "M" + f(x) + " " + f(y); for (k = 1; k <= 20; k++) d += " L" + f(x + w * k / 20) + " " + f(y + 2.5 * Math.sin(k * 1.3));
  for (k = 20; k >= 0; k--) d += " L" + f(x + w * k / 20) + " " + f(y + e + 7 * Math.sin(k * 1.9));
  s += '<path d="' + d + ' Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.4"/>';
  if (h > 150) { for (k = 0; k < Math.floor(w / 46); k++) s += '<ellipse cx="' + f(x + 26 + k * 46) + '" cy="' + f(y + h - 26 + 6 * hash(k)) + '" rx="22" ry="17" fill="' + FAT + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  for (k = 0; k < Math.floor(w / 58); k++) { var hx = x + 30 + k * 58 + 14 * hash(k + 5), sw = 4 * Math.sin(t * 1.7 + k); s += '<path d="M' + f(hx) + ' ' + f(y + Math.min(h - 8, 60)) + ' Q' + f(hx + 4) + ' ' + f(y - 10) + ' ' + f(hx + 16 + sw) + ' ' + f(y - (op.hair || 34)) + '" stroke="' + HAIR + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
  return s;
}
// where a mosquito is on its way from a to b (k 0..1), with a wobble; returns [x, y]
function fly(a, b, k, t, i) { var w = 1 - Math.abs(2 * k - 1) * .4; return [lerp(a[0], b[0], k) + 14 * w * Math.sin(t * 3.1 + i * 2), lerp(a[1], b[1], k) + 12 * w * Math.cos(t * 3.7 + i)]; }
var ROW = [95, 245, 395, 545];   // four people in a row

// ── the four senses, pinned over the panel while they are explained (lines 6–10) ──
hud(6, 11, function (u, t) {
  var names = ["الشم", "النظر", "الحرارة", "ريحة الجلد"], from = [6, 8, 9, 10], cols = [BLUE, OLIVE, ORANGE, OLIVE], s = "", x = 616;
  names.forEach(function (n, i) { var on = t >= LN[from[i]].start, w = n.length * 12 + 44, k = on ? pop((t - LN[from[i]].start) / .9 + .01) : 1; x -= w + 8;
    s += G("translate(" + f(x + w / 2) + " 40) scale(" + f(on ? k : 1) + ")", '<rect x="' + f(-w / 2) + '" y="-18" width="' + w + '" height="36" rx="18" fill="' + (on ? "#f4ecdb" : PAPER) + '" stroke="' + (on ? INK : MUTE) + '" stroke-width="' + (on ? 2 : 1.2) + '"/>' + N(String(i + 1), w / 2 - 17, 7, 19, on ? cols[i] : MUTE) + T(n, -8, 7, 19, on ? cols[i] : MUTE, 800)); });
  return s;
});

// 4 · only the female bites: a big female on skin, her abdomen filling; thumbnail: the eggs the blood is for
shot(4, push(330, 420, 1.12, 1.0), function (u, d, t) {
  var k = at(u, 1.2, d - 1.8);
  return paper() + skin(-40, 590, 760, 240, t, { hair: 26 }) + mosq(350, 386, 3.2, t, { fly: false, bite: true, fed: k }) +
    label(245, 500, 190, 430, "الخرطوم", OLIVE, at(u, .5, .5), 24) + label(560, 320, 520, 190, "بطنها بتتملي دم", ORANGE, at(u, 2.2, .5), 24) + tag("أنثى", 330, 190, at(u, .3, .3), 34, ORANGE) +
    iconBox(100, 150, 130, [[-30, 6], [-14, -2], [2, 8], [18, 0], [32, 10], [-22, 20], [-4, 24], [14, 20]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6" ry="12" fill="' + MQ_L + '" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + f(8 * Math.sin(t * 2 + p[0])) + ' ' + p[0] + ' ' + p[1] + ')"/>'; }).join("") + T("البيض", 0, 54, 18, INK, 700) + drop(0, -34, .6), at(u, d * .6, .3));
});
// 5 · how does she find you in the dark? A dark bedroom, the mosquito hunting; then the answer: by smell first
shot(5, push(320, 410, 1.0, 1.08), function (u, d, t) {
  var m = [330 + 150 * Math.sin(t * .9), 250 + 60 * Math.cos(t * 1.3)], k2 = at(u, d * .62, .3);
  return paper() + R(30, 110, 580, 560, "#cfc5ad", 2.4) + R(410, 160, 130, 150, "#8aa0ad", 2.4) + '<path d="M475 160 V310 M410 235 H540" stroke="' + INK + '" stroke-width="2"/>' + moon(505, 200, 18) +
    R(30, 610, 580, 60, "#b9a482", 2) + bed(110, 530, t) + '<rect x="30" y="110" width="580" height="560" fill="' + INK + '" opacity=".52"/><rect x="30" y="110" width="580" height="560" fill="url(#hatch)" opacity=".5"/>' +
    '<circle cx="' + f(m[0]) + '" cy="' + f(m[1]) + '" r="62" fill="' + PAPER + '" opacity=".32"/>' + mosq(m[0], m[1], .95, t, { flip: Math.cos(t * .9) > 0 }) +
    G("", T("؟", 150, 250, 120, ORANGE, 800), 1 - k2) + tag("بالشم", 320, 730, k2, 40, BLUE);
}, { tr: "out" });
// 6 · every breath out carries CO₂: a head in profile, the gas leaving the mouth
shot(6, push(300, 400, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .3, 1.2);
  return paper() + profile(470, 330, 3.0, {}) + breath(330, 398, 330, t, k, 18, 1.5) + G("", N("CO₂", 150, 300, 58, BLUE) + T("تاني أكسيد الكربون", 170, 600, 28, BLUE, 800), at(u, 1, .4)) +
    draw("M150 318 Q150 352 190 380", at(u, 1.1, .4), INK, 1.6);
});
// 7 · she smells it from more than 10 m and follows the plume like a thread of smoke
function trail(p) { return [540 - 480 * p, 300 + 150 * p + 46 * Math.sin(p * 8) * p, 8 + 40 * p]; }
shot(7, push(320, 410, 0.94, 1.04), function (u, d, t) {
  var k = at(u, .2, 1.4), g = at(u, 1.2, d - 1.6), p = 1 - .8 * g, q = trail(p), k2 = at(u, .8, 1.2);
  return paper() + profile(585, 280, 1.15, {}) + plume(trail, t, k, 34, .05, .8) + mosq(q[0] + 30 * Math.sin(t * 4.2) * p, q[1] + 26 * Math.cos(t * 3.4) * p, .9, t, { flip: true }) +
    measure(70, 640, 540, 640, k2, "") + G("", N("+" + count(10, k2), 280, 705, 50, ORANGE) + T("متر", 362, 702, 30, INK, 800), clamp(k2 * 3)) +
    iconBox(100, 140, 120, R(-4, -6, 8, 48, WOOD, 1.6) + C(0, -8, 5, ORANGE, 1.4) + wave(0, -14, 6, -54, t, MUTE, 7, 24, 1, 3) + T("خيط دخان", 0, 56, 17, INK, 700), at(u, d * .62, .3));
});
// 8 · the smell switches her eyes on: a head close-up with its big compound eye, looking for anything dark
shot(8, push(320, 410, 1.08, 1.0), function (u, d, t) {
  var k = at(u, .9, .8), e = "", i, j, k3 = at(u, d * .5, .4);
  for (i = -4; i <= 4; i++) for (j = -5; j <= 5; j++) { var ex = i * 17 + (j % 2 ? 8.5 : 0), ey = j * 15; if (ex * ex / 5200 + ey * ey / 7600 < 1) e += '<circle cx="' + f(ex) + '" cy="' + ey + '" r="7.5" fill="none" stroke="' + INK + '" stroke-width="1.1" opacity=".7"/>'; }
  var hd = C(170, 400, 118, MQ, 2.6) + '<path d="M70 460 L-20 640" stroke="' + MQ_D + '" stroke-width="16" stroke-linecap="round"/><path d="M120 300 C100 200 150 150 230 120 M150 292 C150 220 200 180 280 170" stroke="' + MQ_D + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
  for (i = 0; i < 7; i++) hd += '<path d="M' + f(128 + i * 15) + ' ' + f(232 - i * 16) + ' l' + f(-16 + 3 * Math.sin(t * 3 + i)) + ' -22 M' + f(128 + i * 15) + ' ' + f(232 - i * 16) + ' l22 ' + f(-10 + 3 * Math.cos(t * 3 + i)) + '" stroke="' + MQ_D + '" stroke-width="1.6"/>';
  hd += G("translate(200 392)", '<ellipse rx="76" ry="90" fill="' + (k > .5 ? "#6f7d4d" : "#8d8a80") + '" stroke="' + INK + '" stroke-width="2.4"/>' + e + '<ellipse cx="' + f(18 + 8 * Math.sin(t * 1.4)) + '" cy="-10" rx="26" ry="34" fill="' + INK + '" opacity="' + f(.25 + .3 * k) + '"/>');
  return paper() + '<path d="M276 392 L640 250 L640 600 Z" fill="' + OLIVE + '" opacity="' + f(.16 * k * (1 + .2 * Math.sin(t * 5))) + '"/>' + hd +
    dim(k3, bust(420, 330, 1.0, { shirt: "#e9e1cc" })) + bust(540, 470, 1.25, { dark: true }) + '<circle cx="540" cy="510" r="' + f(118 + 5 * Math.sin(t * 4)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" opacity="' + f(k3) + '"/>' +
    tag("غامق", 540, 690, k3, 32, ORANGE) + label(200, 330, 300, 210, "العين", OLIVE, at(u, 1.2, .5), 24);
}, { tr: "in" });
// 9 · under a metre she feels your body heat, like a small thermal camera
shot(9, push(330, 410, 1.0, 1.07), function (u, d, t) {
  var k = at(u, .3, 1), s = paper(), i, m = fly([70, 300], [250, 380], at(u, .6, d - 1), t, 1);
  for (i = 0; i < 4; i++) { var r = 110 + ((i * 55 + t * 46) % 220); s += '<circle cx="450" cy="420" r="' + f(r) + '" fill="none" stroke="' + ORANGE + '" stroke-width="' + f(5 * (1 - (r - 110) / 220) + .6) + '" opacity="' + f(k * (1 - (r - 110) / 220)) + '"/>'; }
  s += bust(450, 400, 1.9, { hot: true, shirt: "#d9a05c" }) + mosq(m[0], m[1], .95, t, { flip: true });
  s += measure(250, 660, 450, 660, at(u, 1, .8), "") + G("", T("أقل من", 388, 716, 26, INK, 800) + N("1", 318, 720, 44, ORANGE) + T("متر", 276, 716, 26, INK, 800), at(u, 1.4, .4));
  return s + iconBox(110, 150, 140, R(-46, -30, 92, 60, "#57534a", 2, 6) + R(-36, -22, 52, 44, "#3f6a7e", 1.6) + '<ellipse cx="-10" cy="0" rx="13" ry="17" fill="' + ORANGE + '"/><ellipse cx="-10" cy="-3" rx="6" ry="8" fill="#e8c35a"/>' + C(30, -8, 9, "#2a2016", 1.6) + C(30, 14, 4, ORANGE, 1) + T("كاميرا حرارية", 0, 58, 17, INK, 700), at(u, d * .6, .3));
});
// 10 · last of all the smell of your skin tells her where to land: a forearm close-up, the smell rising, she comes down
shot(10, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var k = at(u, .8, d - 1.6), landed = k > .98, m = fly([520, 150], [330, 458], k, t, 2);
  return paper() + skin(-60, 520, 800, 330, t) + fumes(320, 505, 470, 7, 260, t, OLIVE, at(u, .2, .8)) + mosq(m[0], landed ? 458 : m[1], 1.0, t, { fly: !landed }) + tag("ريحة الجلد", 150, 180, at(u, .5, .3), 34, OLIVE);
}, { tr: "in" });
// 11 · four people in a room, and they all go to one: why you?
function four(t, op) { op = op || {}; var s = ""; ROW.forEach(function (x, i) { s += bust(x, 430, .98, { shirt: SHIRTS[i], long: i === 2, bites: op.bites && i === 1 ? op.bites : 0 }); }); return s; }
shot(11, push(320, 410, 0.98, 1.06), function (u, d, t) {
  var s = paper() + four(t), k = at(u, .2, d - .8), i;
  for (i = 0; i < 6; i++) { var m = fly([60 + i * 110, 120 + 60 * hash(i)], [245 + 70 * Math.cos(i * 1.05), 400 + 70 * Math.sin(i * 1.05) - 30], k, t, i); s += mosq(m[0], m[1], .5, t, { flip: m[0] < 245, ph: i }); }
  return s + tag("إنت", 245, 610, at(u, .6, .3), 36, ORANGE) + T("؟", 500, 250, 110, ORANGE, 800);
}, { tr: "out" });
// 12 · every skin has its own smell, like a fingerprint
shot(12, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var s = paper() + four(t), cols = [BLUE, ORANGE, OLIVE, MUTE], fp = "", i;
  ROW.forEach(function (x, i) { s += fumes(x, 380, 96, 3, 200, t * (1 + i * .15), cols[i], at(u, .2 + i * .3, .6), 4 + i * 2.5); });
  for (i = 1; i <= 5; i++) fp += '<path d="M' + (-i * 8) + ' 26 C' + (-i * 8) + ' ' + (-i * 11) + ' ' + (i * 8) + ' ' + (-i * 11) + ' ' + (i * 8) + ' 26" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="' + (20 + i * 9) + ' 5"/>';
  return s + iconBox(110, 680, 130, G("translate(0 " + f(-8 + 2 * Math.sin(t * 3)) + ")", fp) + T("بصمة", 0, 56, 18, INK, 700), at(u, d * .6, .3));
});
// 13 · skin in section: bacteria on the surface eat sweat and oils and give off smelly acids
shot(13, push(320, 430, 1.0, 1.1), function (u, d, t) {
  var s = paper() + skin(-40, 400, 720, 420, t), i;
  // a sweat gland: a coil deep down, its duct up to a pore, a bead of sweat on top
  s += '<path d="M430 640 c-26 -6 -26 -34 0 -34 c26 0 26 30 0 28 c-20 -2 -18 -22 0 -22 M430 612 C440 540 420 480 432 402" fill="none" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round"/>';
  s += '<ellipse cx="434" cy="' + f(396 - 2 * Math.sin(t * 2)) + '" rx="' + f(11 + 2 * Math.sin(t * 2)) + '" ry="8" fill="#9fc0d3" stroke="' + INK + '" stroke-width="1.4"/>';
  for (i = 0; i < 9; i++) { var bx = 110 + i * 54 + 12 * Math.sin(t * 1.3 + i * 2), a = 30 * Math.sin(t * 2.2 + i * 1.7); s += appear(at(u, .3 + i * .08, .3), '<rect x="-15" y="-7" width="30" height="14" rx="7" fill="#8a9458" stroke="' + INK + '" stroke-width="1.6" transform="translate(' + f(bx) + ' ' + f(388 - 4 * hash(i)) + ') rotate(' + f(a) + ')"/>'); }
  s += fumes(300, 360, 420, 6, 190, t, ORANGE, at(u, d * .55, .8), 7);
  return s + label(218, 386, 110, 250, "بكتيريا", OLIVE, at(u, .5, .5), 26) + label(436, 520, 560, 560, "عرق", BLUE, at(u, 1.6, .5), 26) + label(396, 250, 520, 170, "أحماض ليها ريحة", ORANGE, at(u, d * .6, .5), 26);
}, { tr: "in" });
// 14 · some skins give off far more fatty acids: the mosquito magnets
shot(14, push(320, 410, 1.06, 0.98), function (u, d, t) {
  var s = paper() + bust(170, 440, 1.5, { shirt: SHIRTS[0] }) + bust(470, 440, 1.5, { shirt: SHIRTS[1] }), k = at(u, .6, d - 1.2), i;
  s += fumes(170, 370, 110, 2, 120, t, MUTE, at(u, .2, .5), 4) + fumes(470, 370, 200, 7, 250, t, ORANGE, at(u, .4, .8), 8);
  for (i = 0; i < 6; i++) { var m = fly([40 + i * 60, 110 + 50 * hash(i + 2)], [470 + 96 * Math.cos(i * 1.05 + 3), 390 + 80 * Math.sin(i * 1.05 + 3)], k, t, i); s += mosq(m[0], m[1], .45, t, { flip: true, ph: i }); }
  return s + iconBox(110, 690, 130, G("rotate(" + f(-20 + 6 * Math.sin(t * 3)) + ")", '<path d="M-30 -34 V4 A30 30 0 0 0 30 4 V-34 H12 V4 A12 12 0 0 1 -12 4 V-34 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="-30" y="-34" width="18" height="14" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2"/><rect x="12" y="-34" width="18" height="14" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2"/>'), at(u, d * .7, .3)) +
    tag("مغناطيس الناموس", 440, 700, at(u, d * .7, .3), 28, ORANGE);
});
// 15 · the experiment: a cage, two scented sleeves to choose from, and one person a hundred times more attractive
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, d - 2), k2 = at(u, d * .5, 1.4), s = paper() + R(90, 150, 460, 300, "#f4ecdb", 2.4) + '<rect x="90" y="150" width="460" height="300" fill="url(#hatch)" opacity=".35"/>', i;
  s += R(140, 450, 110, 130, "#e9e1cc", 2.2) + R(390, 450, 110, 130, "#e9e1cc", 2.2) + R(152, 520, 86, 50, SHIRTS[2], 1.8) + R(402, 520, 86, 50, SHIRTS[1], 1.8);
  s += fumes(195, 515, 60, 2, 50, t, MUTE, 1, 3) + fumes(445, 515, 80, 4, 60, t, ORANGE, 1, 5);
  for (i = 0; i < 15; i++) { var left = i === 4, m = fly([130 + 380 * hash(i), 190 + 220 * hash(i + 20)], left ? [195, 480] : [412 + 66 * hash(i + 7), 462 + 44 * hash(i + 31)], clamp(k * 1.3 - hash(i + 50) * .3), t, i); s += mosq(m[0], m[1], .3, t, { flip: !left, ph: i }); }
  return s + T("أقل واحد", 195, 616, 22, MUTE, 800) + T("أكتر واحد", 445, 616, 22, ORANGE, 800) + numBox("×" + count(100, k2), 320, 710, at(u, d * .5, .3), 50) + T("تجربة", 320, 132, 24, INK, 800);
}, { tr: "out" });
// 16 · the smell stays for years, whatever you eat or wash with: the same wavy line, year after year
shot(16, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var s = paper() + bust(140, 430, 1.35, { shirt: SHIRTS[1] }) + fumes(140, 365, 150, 5, 210, t, ORANGE, 1, 8), i;
  for (i = 0; i < 3; i++) { var k = at(u, .4 + i * .6, .4), x = 330 + i * 108; s += G("translate(" + f(x) + " 330) scale(" + f(pop(k)) + ")", R(-44, -50, 88, 104, "#f4ecdb", 2) + R(-44, -50, 88, 26, ORANGE, 2) + T("سنة", 0, -30, 18, "#fff", 800) + N(String(i + 1), 0, 34, 46)) + wave(x - 34, 420, x + 34, 420, t, ORANGE, 8, 26, k, 3) + check(x, 470, .7, at(u, .8 + i * .6, .3), OLIVE); }
  return s + iconBox(390, 640, 120, G("rotate(-8)", R(-36, -16, 72, 34, "#d9cfe0", 2, 10) + C(-14, -26, 7, "#f4efe3", 1.4) + C(2, -32, 10, "#f4efe3", 1.4) + C(20, -26, 6, "#f4efe3", 1.4)) + T("صابون", 0, 46, 18, INK, 700), at(u, d * .62, .3)) +
    iconBox(530, 640, 120, C(0, -4, 34, "#f4efe3", 2) + C(0, -4, 22, "none", 1.2) + '<path d="M-8 -10 q8 -12 16 0 q-2 14 -8 16 q-6 -2 -8 -16 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.4"/>' + T("أكل", 0, 50, 18, INK, 700), at(u, d * .55, .3));
});
// 17 · what else? A bigger body breathes out more, so she smells it from farther
shot(17, push(320, 410, 0.96, 1.04), function (u, d, t) {
  var k = at(u, .4, 1), m = fly([70, 600], [300, 300], at(u, 1.5, d - 2), t, 3);
  return paper() + profile(250, 250, .8, { shirt: SHIRTS[0] }) + breath(212, 268, 120, t, k, 5, .6) + profile(520, 430, 1.7, { shirt: SHIRTS[3] }) + breath(442, 468, 380, t, k, 20, .95) +
    mosq(m[0], m[1], .7, t, { flip: true }) + tag("نَفَس أكتر", 300, 690, at(u, d * .4, .3), 32, BLUE) + label(212, 268, 150, 150, "نَفَس أقل", MUTE, at(u, .8, .5), 22);
});
// 18 · that is why a pregnant woman is bitten about twice as much
shot(18, push(330, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper() + pregnant(430, 250, 1.5) + breath(362, 284, 260, t, at(u, .2, .8), 16, .9), k = at(u, .4, d - 1), i;
  for (i = 0; i < 4; i++) { var m = fly([40, 160 + i * 130], [300 - 30 * (i % 2), 330 + i * 70], k, t, i); s += mosq(m[0], m[1], .6, t, { flip: true, ph: i }); }
  return s + numBox("×2", 150, 690, at(u, d * .5, .3), 60) + label(480, 600, 520, 690, "الحامل", ORANGE, at(u, .5, .5), 26);
}, { tr: "in" });
// 19 · and whoever is still sweaty or warm shows up more clearly to her
shot(19, push(320, 410, 1.0, 1.07), function (u, d, t) {
  var s = paper(), i, m = fly([90, 180], [200, 300], at(u, .6, d - 1), t, 4);
  for (i = 0; i < 3; i++) { var r = 150 + ((i * 60 + t * 44) % 180); s += '<circle cx="380" cy="440" r="' + f(r) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f(1 - (r - 150) / 180) + '"/>'; }
  s += bust(380, 420, 2.1, { hot: true, shirt: SHIRTS[2] });
  for (i = 0; i < 5; i++) { var p = (t * .5 + i * .23) % 1; s += G("translate(" + f(330 + i * 26 - (i > 2 ? 10 : 0)) + " " + f(380 + 20 * hash(i) + p * 70) + ") scale(.5)", drop(0, 0, 1, "#9fc0d3"), 1 - p); }
  return s + fumes(380, 330, 190, 5, 190, t, OLIVE, at(u, .4, .6), 7) + mosq(m[0], m[1], .8, t, { flip: true }) + label(350, 430, 130, 620, "عرق", BLUE, at(u, .5, .5), 26) + label(520, 300, 560, 170, "سخن", ORANGE, at(u, 1.1, .5), 26);
});
// 20 · the myth: «دمهم حلو». A drop of blood with sugar cubes, crossed out
shot(20, push(320, 400, 1.1, 0.98), function (u, d, t) {
  var b = 1 + .04 * Math.sin(t * 4), cube = function (x, y, r) { return G("translate(" + x + " " + f(y + 4 * Math.sin(t * 2.4 + x)) + ") rotate(" + r + ")", '<path d="M-22 -10 L0 -22 L22 -10 L22 14 L0 26 L-22 14 Z" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M-22 -10 L0 2 L22 -10 M0 2 V26" stroke="' + INK + '" stroke-width="1.6" fill="none"/>'); };
  return paper() + G("translate(320 400) scale(" + f(b) + ")", drop(0, 0, 6.5)) + cube(250, 430, -8) + cube(390, 450, 10) + cube(330, 500, 0) + tag("دمهم حلو", 320, 640, at(u, .3, .3), 38, INK) + cross(320, 410, 4.2, at(u, d * .62, .5));
}, { tr: "out" });
// 21 · she does not smell your blood at all: it is your skin and your breath
shot(21, push(320, 410, 1.0, 1.06), function (u, d, t) {
  var k = at(u, d * .5, .4);
  return paper() + dim(at(u, .5, .5), G("translate(120 250) scale(2.6)", drop(0, 0, 1))) + cross(120, 255, 1.3, at(u, .6, .4)) + mosq(330, 190, 1.3, t, { flip: true }) +
    skin(250, 560, 190, 130, t) + fumes(345, 548, 150, 4, 130, t, OLIVE, k) + R(250, 560, 190, 130, "none", 2.4) + T("جلدك", 345, 730, 28, OLIVE, 800) + check(345, 480, 1.1, at(u, d * .55, .4), OLIVE) +
    breath(600, 420, 120, t, at(u, d * .7, .5), 9, .9) + T("نَفَسك", 540, 520, 28, BLUE, 800) + check(540, 340, 1.1, at(u, d * .75, .4), BLUE);
});
// 22 · the recap: breath from far, heat up close, the skin's smell picks who
shot(22, push(320, 410, 0.94, 1.02), function (u, d, t) {
  var g = at(u, .5, d - 1.2), s = paper(), m = fly([50, 600], [420, 350], g, t, 5);
  s += '<path d="M80 760 A520 520 0 0 1 600 -40" fill="none" stroke="' + BLUE + '" stroke-width="2.4" stroke-dasharray="12 9"/><path d="M330 760 A300 300 0 0 1 620 150" fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="12 9"/>';
  s += profile(545, 330, 1.5, {}) + plume(function (p) { return [476 - 420 * p, 364 + 230 * p, 8 + 44 * p]; }, t, 1, 22, .05, .75) + fumes(560, 262, 90, 3, 110, t, OLIVE, 1, 5);
  return s + mosq(m[0], m[1], .85, t, { flip: true }) + tag("النَفَس", 130, 380, at(u, .3, .3), 30, BLUE) + tag("الحرارة", 330, 650, at(u, d * .4, .3), 30, ORANGE) + tag("ريحة الجلد", 500, 130, at(u, d * .68, .3), 30, OLIVE);
}, { tr: "out" });
// 23 · the odd fact: she tastes your skin with her feet before she bites
shot(23, push(310, 470, 1.0, 1.14), function (u, d, t) {
  var s = paper() + skin(-60, 590, 800, 260, t, { hair: 24 }) + mosq(350, 386, 3.2, t, { fly: false }), k = at(u, .8, .5);
  [[254, 584], [350, 596], [600, 290]].slice(0, 2).forEach(function (p, i) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(20 + 6 * Math.sin(t * 5 + i)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(k) + '"/>'; });
  return s + label(300, 610, 150, 720, "بتدوق برجليها", ORANGE, at(u, 1, .5), 28);
}, { tr: "in" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a bedroom, the lamp goes off. line 1: the whine by the ear. line 2: four people, one of them bitten
  var u0 = t - LN[0].start, dark = .5 * ease((u0 - 1.0) / .7), s = R(0, 90, 608, 500, "#d6ccb4", 2.4) + R(0, 520, 608, 70, "#b9a482", 2) + R(420, 150, 130, 150, "#8aa0ad", 2.4) + '<path d="M485 150 V300 M420 225 H550" stroke="' + INK + '" stroke-width="2"/>' + moon(515, 190, 18);
  s += R(30, 440, 60, 80, WOOD, 2) + '<path d="M60 440 V400" stroke="' + INK + '" stroke-width="4"/><path d="M34 400 L46 350 H74 L86 400 Z" fill="' + (dark > .1 ? "#b9ae96" : "#f0d27a") + '" stroke="' + INK + '" stroke-width="2"/>';
  s += bed(130, 450, t) + '<rect x="0" y="90" width="608" height="500" fill="' + INK + '" opacity="' + f(dark) + '"/>';
  if (li >= 1) { var u = t - LN[1].start, a = t * 2.6, mx = 250 + 80 * Math.cos(a), my = 350 + 34 * Math.sin(a * 1.3);
    s += '<circle cx="' + f(mx) + '" cy="' + f(my) + '" r="56" fill="' + PAPER + '" opacity=".3"/>' + mosq(mx, my, .8, t, { flip: Math.sin(a) > 0 }) + wave(mx + 40, my - 50, mx + 120, my - 90, t * 2, ORANGE, 6, 16, ease(u / .4), 3); }
  if (li >= 2) { var u2 = t - LN[2].start, row = ""; [0, 1, 2, 3].forEach(function (i) { row += bust(-99 + i * 66, 0, .46, { shirt: SHIRTS[i], long: i === 2, bites: i === 1 ? Math.max(0, u2 * 1.6 - .6) : 0 }); });
    s += iconBox(304, 190, 290, G("translate(0 -30)", row) + T("إنت بس", 0, 110, 26, ORANGE, 800), ease(u2 / .35)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return fumes(90, 196, 120, 4, 70, t, OLIVE, 1, 4) + mosq(96 + 10 * Math.sin(t * 1.7), 96 + 8 * Math.cos(t * 2.1), 1.0, t, {});
};
SCENE.outro = function (svg, u, t) {
  var tr = function (p) { return [452 - 380 * p, 150 + 60 * p, 5 + 26 * p]; }, m = tr(.5 + .3 * Math.sin(t * .8));
  var s = '<path d="M330 290 A210 210 0 0 1 560 -10" fill="none" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="9 7"/>';
  s += profile(505, 128, 1.1, {}) + plume(tr, t, 1, 16, .05, .6) + fumes(520, 76, 70, 3, 60, t, OLIVE, 1, 4) + mosq(m[0], m[1] - 40, .55, t, { flip: true });
  return s + callout("1", 250, 240, ease(u / .3)) + callout("2", 360, 60, ease(u / .3 - .5)) + callout("3", 575, 40, ease(u / .3 - 1)) + callout("4", m[0], m[1] - 86, ease(u / .3 - 1.5));
};
