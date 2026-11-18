/* «إيه الحكاية؟» «اسكتش» — PEOPLE (locked by the user after «الناصور العصعصي»). build.py puts this file after _helpers.js and
   before the episode's shots.js, so every sketch episode draws people the same way. Don't copy fig() into an episode and
   don't hand-pick elbow sides: call fig() and give it hands / legs; the joints work themselves out.
   THE RULES (the user's):
   - real body proportions (table below) and real sizes for everything a person touches or sits in: furniture, cars,
     tools are drawn in metres at the person's scale, 1 m = PX_PER_M(s) = 400·s / 1.75 units (see the jeep in
     videos/pilonidal/sketch/shots.js: a Willys MB at its real 3.36 m, the driver's feet on its floor, hidden by its side);
   - the ELBOW always sits below / behind the shoulder→hand line (never up at the face, never into the chest);
   - the KNEE only bends one way: the shank swings back, the knee points to the front;
   - a face, always: profile with brow, nose, lips, chin, ear; an eye with its brow; an expression (expr) that fits the
     moment: "neutral" | "pain" | "smile" | "focus"; blink: 1 for a blink every 4 s;
   - hair, always: hs "short" (default, with volume), "long" (+ female: 1), "helmet", "none" for a bald or anatomy figure;
   - clothes: shirt with short sleeves (sleeves: "long" for a jacket or uniform), trousers to the waist, shoes; nude: 1 for
     an anatomy figure (skin only, bones drawn on top);
   - draw order fig().far, then anything between (a seat, a car body: put it here to hide the legs), fig().body, then
     anything in front, then fig().near (the near arm, over the steering wheel or the table).
   Facing left (front = −x). Check every person at full size (tools/frame.js) before rendering. */
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function PX_PER_M(s) { return 400 * (s || 1) / 1.75; }
// ── people: side-view figures facing left, real proportions (Drillis & Contini segment lengths as fractions of the
//    standing height H; H = 400 units at s = 1):
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.075H
// Joints bend the way real ones do, whatever the target: the ELBOW always sits below / behind the line from shoulder to
// hand (never up into the face, never into the chest), the KNEE always points to the front. Legs: [thigh angle, knee angle] in degrees from straight down, + to the
// front; the knee angle is clamped so the shank never folds forward of the thigh line. Hands go to a point or rel(h, side).
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function shadeC(c, k) { var p = function (i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, r = []; for (var i = 0; i < 3; i++) r.push(Math.round(p(i) * (1 - k))); return "rgb(" + r.join(",") + ")"; }
function capD(a, b, wa, wb) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return '<path d="M' + f(a[0] + nx * wa / 2) + ' ' + f(a[1] + ny * wa / 2) + ' L' + f(b[0] + nx * wb / 2) + ' ' + f(b[1] + ny * wb / 2) + ' L' + f(b[0] - nx * wb / 2) + ' ' + f(b[1] - ny * wb / 2) + ' L' + f(a[0] - nx * wa / 2) + ' ' + f(a[1] - ny * wa / 2) + ' Z"/>' +
    '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(wa / 2) + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(wb / 2) + '"/>';
}
// tapered capsules [a, b, wa, wb, colour]: all ink outlines first, then all fills, so the joints stay clean
function limbSet(segs) { var ink = "", fill = ""; segs.forEach(function (q) { ink += '<g fill="' + INK + '">' + capD(q[0], q[1], q[2] + 3.6, q[3] + 3.6) + '</g>'; fill += '<g fill="' + q[4] + '">' + capD(q[0], q[1], q[2], q[3]) + '</g>'; }); return ink + fill; }
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function smoothClosed(pts) {
  var d = "M" + f((pts[0][0] + pts[pts.length - 1][0]) / 2) + " " + f((pts[0][1] + pts[pts.length - 1][1]) / 2);
  for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
  return d + " Z";
}
// the head in profile, facing left, 52 units tall (0.13H) and 46 deep; origin at the middle of the skull
// expr: "neutral" | "pain" | "smile" | "focus" ; hs (hair style): "short" | "long" | "helmet" | "none"
function headD(o, t) {
  var sk = o.skin || SKIN, hc = o.hair || HAIR, s = "", ex = o.expr || "neutral";
  var face = "M14 20 C24 12 28 -6 22 -18 C16 -28 2 -31 -10 -28 C-18 -26 -22 -20 -23 -12 L-23 -6 C-22 -4 -21 -2 -22 0 L-29 9 C-29 11 -27 12 -24 12 L-23 13 C-24 15 -23 16 -22 16.5 C-23 18 -22.5 19.5 -21 20 C-21 23 -19 26 -14 26.5 C-8 27 -2 25 3 21 C6 19 10 19 14 20 Z";
  if (o.hs === "long") s += '<path d="M14 -16 C30 -10 32 14 28 34 C26 44 18 46 14 40 C18 26 18 6 10 -8 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="' + face + '" fill="' + sk + '" stroke="' + INK + '" stroke-width="2"/>';
  // ear, then the eye, brow and mouth for the expression
  s += '<path d="M3 -5 C9 -9 13 -4 12 2 C11 8 7 10 4 8" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M6 -2 C9 -2 9 3 6 4" fill="none" stroke="' + SKIN2 + '" stroke-width="1.3"/>';
  var squint = ex === "pain" ? .45 : ex === "focus" ? .75 : 1, blink = (o.blink && ((t || 0) % 4) < .12) ? .1 : 1;
  s += '<path d="M-19 -3 Q-15.5 ' + f(-3 - 3.2 * squint * blink) + ' -11 -2.5 Q-15 ' + f(-3 + 1.6 * squint * blink) + ' -19 -3 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.3"/>' + (blink > .5 ? '<circle cx="-16.5" cy="-3" r="' + f(1.5 * Math.max(.6, squint)) + '" fill="' + INK + '"/>' : "");
  if (o.female) s += '<path d="M-19.5 -3.5 l-2.5 -1.6 M-18.6 -4.4 l-2 -2" stroke="' + INK + '" stroke-width="1.1"/>';
  var brow = ex === "pain" ? "M-21 -11 Q-16 -10 -10 -7.5" : ex === "focus" ? "M-21 -8.5 Q-15 -9.5 -9.5 -8.5" : "M-21 -9 Q-15 -11.5 -9.5 -9.5";
  s += '<path d="' + brow + '" fill="none" stroke="' + (o.hs === "none" ? SKIN2 : hc) + '" stroke-width="2.4" stroke-linecap="round"/>';
  if (ex === "pain") s += '<path d="M-14 -11.5 l-1.5 -3 M-11 -10 l0 -3" stroke="' + SKIN2 + '" stroke-width="1"/>';
  var mouth = ex === "smile" ? "M-22.5 17 Q-19 19.5 -15.5 15.5" : ex === "pain" ? "M-22.5 17 Q-19 15.3 -15.5 18.6" : "M-22.5 17 Q-19 17.6 -16 16.6";
  s += '<path d="' + mouth + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  if (ex === "smile") s += '<path d="M-14 10 q3 2 5 0" fill="none" stroke="' + SKIN2 + '" stroke-width="1.2"/>';
  s += '<path d="M-24 12.5 q2 1 2.5 -.5" fill="none" stroke="' + SKIN2 + '" stroke-width="1.2"/>';   // nostril
  // hair
  if (o.hs === "helmet") s += '<path d="M-27 -10 C-26 -34 26 -38 28 -8 L30 -4 L-29 -6 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="2"/><path d="M-26 -12 C-10 -16 14 -16 27 -10" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><path d="M-6 -6 L-16 22" stroke="' + INK + '" stroke-width="1.6"/>';
  else if (o.hs !== "none") {
    s += '<path d="M-22 -14 C-24 -26 -12 -34 2 -33 C18 -32 28 -22 26 -6 C25 4 22 12 16 16 C14 10 13 4 12 -2 C11 -7 8 -9 2 -9 L1 2 C-1 4 -3 3 -3 1 L-3 -11 C-9 -14 -16 -16 -22 -14 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<path d="M-14 -24 C-4 -29 8 -28 16 -21 M2 -16 C10 -18 18 -12 20 -4" fill="none" stroke="#fff" stroke-width="1.1" opacity=".18"/>';
    if (o.hs === "long") s += '<path d="M24 -14 C30 -12 32 -6 30 -2" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  }
  return s;
}
// o: {x, y (hip joint), s, lean, legs, hands: [near, far], grip: [bool, bool], shirt, pants, shoes, sleeves: "short" | "long",
//     skin, hair, hs, expr, female, belly, nude, tilt, blink}. Returns {far, body, near, sh, hd, hip, at, up, fw}.
function fig(o) {
  var s = o.s || 1, t = window.__t || 0, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sk = o.skin || SKIN, shirt = o.nude ? sk : (o.shirt || SHIRT_V), pants = o.nude ? sk : (o.pants || PANTS), shoe = o.shoes || "#2f2a24";
  var legs = o.legs || [[6, -4], [-6, 4]], arms = o.hands || [null, null], out = {};
  function leg(i, far) {
    var th = legs[i][0], kn = Math.min(0, legs[i][1]);   // the knee only bends backward (the shank never swings in front of the thigh line)
    var a = dirv(th), b = dirv(th + kn), K = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], A = [K[0] + b[0] * HB.shin * s, K[1] + b[1] * HB.shin * s];
    var pc = far ? shadeC(pants.charAt(0) === "#" ? pants : "#5b5145", .14) : pants, w = o.nude ? [32, 22, 21, 12] : [36, 27, 26, 20];
    var hipP = [hip[0] - fw[0] * 4 * s, hip[1] - fw[1] * 4 * s];
    var str = limbSet([[hipP, K, w[0] * s, w[1] * s, pc], [K, A, w[2] * s, w[3] * s, pc]]);
    // foot: flat on the sole, toes to the front
    var sole = A[1] + HB.ankle * s, heel = A[0] + 10 * s, toe = A[0] - HB.foot * .86 * s, fc = o.nude ? (far ? shadeC("#d9a186", .1) : sk) : (far ? shadeC("#2f2a24", -.0) : shoe);
    str += '<path d="M' + f(heel) + ' ' + f(A[1] - 6 * s) + ' C' + f(heel + 4 * s) + ' ' + f(sole - 6 * s) + ' ' + f(heel + 2 * s) + ' ' + f(sole) + ' ' + f(heel - 4 * s) + ' ' + f(sole) + ' L' + f(toe + 4 * s) + ' ' + f(sole) + ' C' + f(toe - 4 * s) + ' ' + f(sole) + ' ' + f(toe - 4 * s) + ' ' + f(sole - 9 * s) + ' ' + f(toe + 6 * s) + ' ' + f(sole - 11 * s) + ' L' + f(A[0] - 8 * s) + ' ' + f(A[1] - 4 * s) + ' Z" fill="' + fc + '" stroke="' + INK + '" stroke-width="2"/>';
    if (!o.nude) str += '<path d="M' + f(heel - 2 * s) + ' ' + f(sole - 2.5 * s) + ' L' + f(toe + 2 * s) + ' ' + f(sole - 2.5 * s) + '" stroke="#6b6157" stroke-width="' + f(2.4 * s) + '"/>';
    return str;
  }
  function arm(i, far) {
    var sp = atF(HB.sh - 6, far ? 1 : -3), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || atF(HB.sh - HB.ua - HB.fa - 22, 6);
    var l1 = HB.ua * s, l2 = HB.fa * s, dx = tg[0] - sp[0], dy = tg[1] - sp[1], d = clamp2(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - .5), ang = Math.atan2(dy, dx);
    var c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), e1 = [sp[0] + Math.cos(ang + c) * l1, sp[1] + Math.sin(ang + c) * l1], e2 = [sp[0] + Math.cos(ang - c) * l1, sp[1] + Math.sin(ang - c) * l1];
    // the elbow goes to the BACK of the body (smaller "front" coordinate)
    // reach v in the body's own frame (F front, U up); the elbow sits on the side n = (vU, -vF): reaching forward it hangs
    // below the arm, hanging down it points back, behind the back it points back and up, as a real elbow does
    var vF = dx * fw[0] + dy * fw[1], vU = dx * up[0] + dy * up[1], n = [vU * fw[0] - vF * up[0], vU * fw[1] - vF * up[1]];
    var el = ((e1[0] - e2[0]) * n[0] + (e1[1] - e2[1]) * n[1]) >= 0 ? e1 : e2;
    var ux = (tg[0] - el[0]), uy = (tg[1] - el[1]), ul = Math.hypot(ux, uy) || 1, wr = [el[0] + ux / ul * l2, el[1] + uy / ul * l2];
    var skc = far ? shadeC(sk, .12) : sk, shc = far ? shadeC(shirt.charAt(0) === "#" ? shirt : "#7f97a6", .14) : shirt;
    var segs, sleeve = o.nude ? 0 : o.sleeves === "long" ? 1 : .62;
    if (sleeve >= 1) segs = [[sp, el, 21 * s, 18 * s, shc], [el, L2(el, wr, .9), 18 * s, 15 * s, shc]];
    else if (sleeve > 0) { var m = L2(sp, el, sleeve); segs = [[m, el, 15 * s, 13 * s, skc], [el, wr, 13 * s, 10 * s, skc], [sp, m, 22 * s, 20 * s, shc]]; }
    else segs = [[sp, el, 17 * s, 13 * s, skc], [el, wr, 13 * s, 10 * s, skc]];
    var str = limbSet(segs);
    // the hand: along the forearm, thumb on top; a fist when gripping
    var ha = Math.atan2(uy, ux) * 180 / Math.PI, hs = s * HB.hand / 30, flip = (Math.cos(ha * Math.PI / 180) * fw[0] + Math.sin(ha * Math.PI / 180) * fw[1]) >= 0 ? -1 : 1;
    var hand = o.grip && o.grip[i] ? '<rect x="-2" y="-8" width="18" height="16" rx="6" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M6 -8 v16 M11 -8 v16" stroke="' + SKIN2 + '" stroke-width="1"/>'
      : '<path d="M-2 -6.5 C6 -8.5 16 -8 22 -5 C27 -2.5 28 2.5 23 4.5 L6 7 C1 7.5 -3 5 -2 -6.5 Z" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M4 -6 C8 -12 15 -12 15 -7" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M12 -1 L22 -1.5 M11 2.5 L21 2" stroke="' + SKIN2 + '" stroke-width="1"/>';
    str += G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ha) + ") scale(" + f(hs) + " " + f(hs * flip) + ")", hand);
    if (!o.nude && sleeve < 1 && sleeve > 0) { var m2 = L2(sp, el, sleeve), n = [-(el[1] - sp[1]), el[0] - sp[0]], nl = Math.hypot(n[0], n[1]) || 1; str += '<path d="M' + f(m2[0] + n[0] / nl * 11 * s) + ' ' + f(m2[1] + n[1] / nl * 11 * s) + ' L' + f(m2[0] - n[0] / nl * 11 * s) + ' ' + f(m2[1] - n[1] / nl * 11 * s) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    out["el" + i] = el; out["wr" + i] = wr;
    return str;
  }
  // trunk outline from measured depths (h up from the hip joint, side + to the front)
  var fr = [[-8, 18], [4, 23], [16, 24], [34, 24], [56, 22], [76, 25], [92, 28], [104, 27], [114, 20], [122, 12]];
  if (o.belly) fr = [[-8, 18], [4, 26], [18, 36], [36, 40], [58, 34], [78, 28], [92, 28], [104, 27], [114, 20], [122, 12]];
  if (o.female) fr = [[-8, 18], [4, 23], [16, 23], [34, 22], [56, 20], [74, 24], [86, 33], [98, 31], [108, 23], [118, 16], [122, 12]];
  var bk = [[122, -8], [114, -16], [100, -22], [82, -22], [64, -17], [46, -15], [30, -22], [14, -30], [0, -31], [-10, -24]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), tdD = smoothClosed(pts);
  var tor = '<path d="' + tdD + '" fill="' + shirt + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  if (!o.nude) {
    // trousers up to the waist (h 14), a belt line, a shirt fold
    var pf = fr.filter(function (q) { return q[0] <= 14; }), pb = bk.filter(function (q) { return q[0] <= 14; });
    var pp = [atF(16, fr[2][1])].concat(pf.slice().reverse().map(function (q) { return atF(q[0], q[1]); })).reverse();
    var id = "tc" + (++CLIPN);
    tor += '<clipPath id="' + id + '"><path d="' + tdD + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="M' + f(atF(16, 60)[0]) + ' ' + f(atF(16, 60)[1]) + ' L' + f(atF(16, -60)[0]) + ' ' + f(atF(16, -60)[1]) + ' L' + f(atF(-60, -60)[0]) + ' ' + f(atF(-60, -60)[1]) + ' L' + f(atF(-60, 60)[0]) + ' ' + f(atF(-60, 60)[1]) + ' Z" fill="' + pants + '"/>' +
      '<path d="M' + f(atF(16, 60)[0]) + ' ' + f(atF(16, 60)[1]) + ' L' + f(atF(16, -60)[0]) + ' ' + f(atF(16, -60)[1]) + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(atF(19, 60)[0]) + ' ' + f(atF(19, 60)[1]) + ' L' + f(atF(19, -60)[0]) + ' ' + f(atF(19, -60)[1]) + '" stroke="' + shadeC(shirt.charAt(0) === "#" ? shirt : "#7f97a6", .2) + '" stroke-width="1.2" opacity=".6"/></g>';
    tor += '<path d="' + tdD + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  }
  // neck and head
  var n0 = atF(HB.sh - 4, 3), n1 = atF(HB.chin + 4, 2), neck = limbSet([[n0, n1, 26 * s, 22 * s, sk]]);
  if (!o.nude) { var c0 = atF(HB.sh + 2, 12), c1 = atF(HB.sh + 4, -6); neck += '<path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' Q' + f((c0[0] + c1[0]) / 2) + ' ' + f((c0[1] + c1[1]) / 2 + 6 * s) + ' ' + f(c1[0]) + ' ' + f(c1[1]) + '" fill="none" stroke="' + INK + '" stroke-width="1.8"/>'; }
  var hd = atF(HB.head, 4), hang = -(o.lean || 0) + (o.tilt || 0);
  var head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(hang) + ") scale(" + f(s) + ")", headD(o, t));
  out.far = arm(1, true) + leg(1, true);
  out.body = tor + leg(0, false) + neck + head;
  out.near = arm(0, false);
  out.sh = atF(HB.sh, 0); out.hd = hd; out.hip = hip; out.up = up; out.fw = fw; out.at = atF;
  return out;
}
function clamp2(x, a, b) { return x < a ? a : x > b ? b : x; }
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// a wooden chair to scale: seat top 0.25H above the floor (y = seat top), back 0.3H tall
function chair(x, y, s) { s = s || 1; return R(x - 54 * s, y, 108 * s, 14 * s, WOOD, 2.2) + R(x + 40 * s, y - 120 * s, 14 * s, 134 * s, WOOD_D, 2) + R(x - 50 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2) + R(x + 40 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2); }
// a person seated (k 0) or standing (k 1) on the floor floorY at scale s; hips over the seat, feet flat
function sitter(x, floorY, k, o) {
  o = o || {}; k = clamp(k); var s = o.s || 1;
  var hipY = lerp(floorY - 120 * s, floorY - 212 * s, k), legs = [[lerp(82, 8, k), lerp(-82, -4, k)], [lerp(78, -8, k), lerp(-78, 4, k)]];
  return fig(Object.assign({}, o, { x: x - 10 * k * s, y: hipY, s: s, lean: lerp(o.lean == null ? 4 : o.lean, 2, k), hands: k > .5 ? [null, null] : (o.hands || [null, null]), legs: legs, blink: o.blink == null ? 1 : o.blink }));
}
