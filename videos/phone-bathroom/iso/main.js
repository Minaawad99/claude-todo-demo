
  // ── isometric projection ─────────────────────────────
  var OX = 180, OY = 300, C30 = 0.866;
  function P(x, y, z) { return [OX + (x - y) * C30, OY + (x + y) * 0.5 - z]; }
  function pt(p) { return f(p[0]) + " " + f(p[1]); }
  function quad(pts, fill, o) { o = o || {}; return '<path d="M' + pts.map(function (q) { return pt(P(q[0], q[1], q[2])); }).join(" L") + ' Z" fill="' + fill + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 1.4 : o.w) + '" stroke-linejoin="round"' + (o.op != null ? ' opacity="' + o.op + '"' : '') + '/>'; }
  function line3(a, b, col, w, op) { return '<path d="M' + pt(P(a[0], a[1], a[2])) + ' L' + pt(P(b[0], b[1], b[2])) + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (op != null ? ' opacity="' + op + '"' : '') + '/>'; }
  // a box: top, the face looking to +y (front-left) and the face looking to +x (front-right)
  function box(x, y, z, w, d, h, cTop, cL, cR, o) {
    return quad([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], cL, o) + quad([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], cR, o) + quad([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], cTop, o);
  }
  // an ellipse lying flat (centre, radii along x and y, at height z)
  function flatEll(cx, cy, z, rx, ry, fill, o) { var d = ""; for (var k = 0; k <= 24; k++) { var a = k / 24 * 6.283; d += (k ? " L" : "M") + pt(P(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z)); } o = o || {}; return '<path d="' + d + ' Z" fill="' + fill + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 1.4 : o.w) + '"/>'; }

  // ── the room: 210 × 200 cm, walls 250 cm; ceramic tiles to 140 cm, paint above ─────
  var RX = 210, RY = 200, RH = 250;
  function room(t, o) {
    o = o || {}; var s = "";
    // walls: large marble-grey tiles (60 × 30 cm) floor to ceiling, as in the reference bathroom photo
    s += quad([[0, 0, 0], [0, RY, 0], [0, RY, RH], [0, 0, RH]], "#dfe2e3") + quad([[0, 0, 0], [RX, 0, 0], [RX, 0, RH], [0, 0, RH]], "#e9ebec");
    for (var z = 30; z < RH; z += 30) { s += line3([0, 0, z], [0, RY, z], "#c3c8ca") + line3([0, 0, z], [RX, 0, z], "#c3c8ca"); }
    for (var r = 0; r * 30 < RH; r++) { var off = r % 2 ? 30 : 0;
      for (var a = 60 - off; a < RY; a += 60) s += line3([0, a, r * 30], [0, a, r * 30 + 30], "#c3c8ca");
      for (var b = 60 - off; b < RX; b += 60) s += line3([b, 0, r * 30], [b, 0, r * 30 + 30], "#c3c8ca"); }
    for (var v = 0; v < 26; v++) { var vz = hash(v) * RH, vy = hash(v + 3) * RY, vx = hash(v + 7) * RX;   // faint marble veins
      s += line3([0.3, vy, vz], [0.3, vy + 12 + hash(v + 1) * 18, vz + 4 + hash(v + 2) * 8], "#b9c0c4", .8, .7) + line3([vx, 0.3, vz], [vx + 14 + hash(v + 5) * 16, 0.3, vz + 3 + hash(v + 6) * 8], "#b9c0c4", .8, .7); }
    s += quad([[0, 0, 0], [RX, 0, 0], [RX, RY, 0], [0, RY, 0]], "#d3d6d8");
    for (var fx = 60; fx < RX; fx += 60) s += line3([fx, 0, 0], [fx, RY, 0], "#b6babd");
    for (var fy = 60; fy < RY; fy += 60) s += line3([0, fy, 0], [RX, fy, 0], "#b6babd");
    s += quad([[0, RY, 0], [-12, RY, 0], [-12, RY, RH], [0, RY, RH]], "#cfd3d5") + quad([[RX, 0, 0], [RX, -12, 0], [RX, -12, RH], [RX, 0, RH]], "#c6cacc");
    s += quad([[-12, -12, RH], [RX, -12, RH], [RX, 0, RH], [0, 0, RH], [0, RY, RH], [-12, RY, RH]], "#b9bec1");
    // door (85 × 210) on the left wall
    s += quad([[0.5, 118, 0], [0.5, 198, 0], [0.5, 198, 210], [0.5, 118, 210]], "#f4f4f2") + quad([[0.5, 124, 8], [0.5, 192, 8], [0.5, 192, 202], [0.5, 124, 202]], "#ecebe8", { w: .8 });
    var hd = P(0.5, 128, 100); s += '<rect x="' + f(hd[0] - 1) + '" y="' + f(hd[1] - 1) + '" width="9" height="3" rx="1.5" fill="#b9a27a" stroke="' + INK + '" stroke-width=".8"/>';
    // vanity against the left wall: drawers, marble top at 85 cm, vessel basin, tap from the wall, pill-shaped mirror
    s += box(0, 10, 8, 50, 90, 72, "#ffffff", "#f2f3f4", "#eceeef");
    s += line3([50, 10, 44], [50, 100, 44], "#c9cdd0", 1.2) + line3([50, 55, 8], [50, 55, 80], "#c9cdd0", 1.2);
    s += box(0, 8, 80, 52, 94, 5, "#e6e8e9", "#d9dcde", "#cfd3d5");
    s += flatEll(28, 52, 85, 17, 15, "#f7f8f9") + flatEll(28, 52, 96, 18, 16, "#ffffff") + flatEll(28, 52, 96.3, 14, 12, "#e2e6e9", { w: .8 });
    var tp1 = P(2, 52, 112), tp2 = P(18, 52, 112), tp3 = P(20, 52, 104); s += '<path d="M' + pt(tp1) + ' L' + pt(tp2) + ' Q' + f(tp2[0] + 3) + ' ' + f(tp2[1]) + ' ' + pt(tp3) + '" stroke="#b9a27a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    var md = ""; for (var k = 0; k <= 16; k++) { var aa = Math.PI * k / 16; md += (k ? " L" : "M") + pt(P(0.6, 52 + Math.cos(aa) * 26, 190 + Math.sin(aa) * 26)); }
    md += " L" + pt(P(0.6, 26, 120)) + " L" + pt(P(0.6, 78, 120)) + " Z"; s += '<path d="' + md + '" fill="#d6e6ee" stroke="' + INK + '" stroke-width="1.4"/>' + line3([0.6, 38, 180], [0.6, 56, 140], "#fff", 2.4, .7);
    // toilet-roll holder (chrome) on the right wall
    s += line3([182, 0.5, 72], [196, 0.5, 72], "#9aa4ad", 2.4) + flatEll(189, 5, 66, 6, 5, "#ffffff", { w: 1 });
    if (o.clock != null) s += wallClock(78, 186, o.clock);
    return s;
  }
  function wallClock(x, z, minutes) {        // a round clock on the right wall (a circle in the x–z plane)
    var d = "", r = 17; for (var k = 0; k <= 24; k++) { var a = k / 24 * 6.283; d += (k ? " L" : "M") + pt(P(x + Math.cos(a) * r, 0.6, z + Math.sin(a) * r)); }
    var s = '<path d="' + d + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    for (var h = 0; h < 12; h++) { var a2 = h / 12 * 6.283; s += line3([x + Math.sin(a2) * r * .78, 0.6, z + Math.cos(a2) * r * .78], [x + Math.sin(a2) * r * .92, 0.6, z + Math.cos(a2) * r * .92], INK, 1.2); }
    var am = minutes / 60 * 6.283, ah = minutes / 720 * 6.283 + 1.2;
    return s + line3([x, 0.6, z], [x + Math.sin(ah) * r * .5, 0.6, z + Math.cos(ah) * r * .5], INK, 2.4) + line3([x, 0.6, z], [x + Math.sin(am) * r * .8, 0.6, z + Math.cos(am) * r * .8], "#d9452e", 1.6);
  }
  // the toilet against the right wall, facing +y: cistern 38 × 18 cm up to 80 cm, bowl 70 cm deep, seat at 42 cm
  var TXc = 140;
  function toilet(t, o) {
    o = o || {}; var s = "", x0 = TXc - 19, press = o.press || 0;
    s += box(x0, 1, 42, 38, 17, 38, "#ffffff", "#eef1f4", "#dfe3e7") + box(x0 - 1, 0, 80, 40, 19, 3, "#f7f8fa", "#e9ecef", "#d9dde2");
    s += flatEll(TXc, 9.5, 83 - press * 1.2, 4.6, 4.6, "#d6dbe0") + line3([TXc, 5, 83.1 - press * 1.2], [TXc, 14, 83.1 - press * 1.2], "#8a929c", 1);   // round dual-flush button
    s += box(TXc - 9, 18, 0, 18, 28, 24, "#f4f6f8", "#e9ecef", "#d5dae0");                               // pedestal
    var tw = [P(TXc + 9, 26, 6), P(TXc + 9, 34, 14), P(TXc + 9, 26, 20)]; s += '<path d="M' + pt(tw[0]) + ' Q' + pt(tw[1]) + ' ' + pt(tw[2]) + '" stroke="#c3c9cf" stroke-width="1.6" fill="none"/>';   // the trapway seen on the side
    s += flatEll(TXc, 44, 24, 14, 22, "#eef1f4") + flatEll(TXc, 45, 40, 19, 28, "#f4f6f8");
    s += flatEll(TXc, 45, 42.5, 19, 28, "#ffffff") + flatEll(TXc, 47, 42.6, 12, 19, o.dark ? "#2a3a44" : "#cfe2ec", { w: 1 });
    if (o.lid === "closed") s += flatEll(TXc, 45, 45, 19, 28, "#f1f3f6");
    else s += quad([[TXc - 18, 19, 43], [TXc + 18, 19, 43], [TXc + 16, 9, 92], [TXc - 16, 9, 92]], "#f1f3f6") + quad([[TXc - 12, 18, 50], [TXc + 12, 18, 50], [TXc + 11, 11, 86], [TXc - 11, 11, 86]], "#e3e7eb", { w: .8 });
    return s;
  }
  // the plume after a flush: fine droplets up to 150 cm in 8 s (Crimaldi et al. 2022); laser = the green light sheet
  function plume(t0, t, o) {
    o = o || {}; var u = t - t0; if (u < 0) return ""; var s = "", top = Math.min(150, 150 * clamp(u / (o.dur || 8)) + 20 * clamp(u / .4));
    if (o.laser) s += quad([[TXc - 50, 46, 43], [TXc + 50, 46, 43], [TXc + 50, 46, 200], [TXc - 50, 46, 200]], "#3cff6a", { w: 0, op: .12 });
    for (var i = 0; i < (o.n || 100); i++) { var a = (hash(i) - .5) * 1.2, life = (u * (.8 + hash(i + 3) * .5) + hash(i + 9)) % 1, h = top * Math.pow(life, .7), p = P(TXc + Math.sin(a) * h * .5 + Math.sin(t * 2 + i) * 3, 46 + (hash(i + 4) - .5) * 30, 43 + h * Math.cos(a));
      s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(.7 + hash(i + 5) * 1.4) + '" fill="' + (o.laser ? "#9dff9b" : "#bfe3f2") + '" opacity="' + f((o.op || .8) * (1 - life * .7)) + '"/>'; }
    return s;
  }
  function ruler(k) { if (k <= 0) return ""; var s = box(TXc + 34, 60, 0, 3, 3, 160 * ease(k), "#f2c230", "#e2b220", "#c9a01c"); for (var c = 0; c <= 160 * ease(k); c += 10) s += line3([TXc + 37, 63, c], [TXc + 37, 63 + (c % 50 ? 4 : 8), c], INK, 1); var tp = P(TXc + 37, 70, 150); return s + (k > .9 ? '<text x="' + f(tp[0] + 4) + '" y="' + f(tp[1] + 4) + '" class="tg" fill="#fff">150 سم</text>' : ""); }
  // a dining table seen in isometric (for "you eat with the same hand"): table 75 cm, plate, bread, falafel
  function diningRoom(t, o) {
    o = o || {}; var s = quad([[0, 0, 0], [0, RY, 0], [0, RY, RH], [0, 0, RH]], "#f1e2c4") + quad([[0, 0, 0], [RX, 0, 0], [RX, 0, RH], [0, 0, RH]], "#f6ead2") + quad([[0, 0, 0], [RX, 0, 0], [RX, RY, 0], [0, RY, 0]], "#c79a6b");
    for (var fx = 30; fx < RX; fx += 30) s += line3([fx, 0, 0], [fx, RY, 0], "#b0865a");
    s += quad([[0.6, 40, 110], [0.6, 120, 110], [0.6, 120, 170], [0.6, 40, 170]], "#9fc8de") + line3([0.6, 80, 110], [0.6, 80, 170], "#fff", 2);
    [[70, 60], [150, 60], [70, 130], [150, 130]].forEach(function (q) { s += box(q[0] - 3, q[1] - 3, 0, 6, 6, 72, "#6b4224", "#7a4e2c", "#5e3a1e"); });
    s += box(64, 54, 72, 92, 82, 4, "#a8774c", "#8a5a34", "#7a4e2c");
    for (var pl = 1; pl < 5; pl++) s += line3([64 + pl * 18.4, 54, 76.1], [64 + pl * 18.4, 136, 76.1], "#8a5a34", 1);
    s += flatEll(132, 118, 76.5, 16, 16, "#f4f4f2") + flatEll(132, 118, 77, 10, 10, "#7fb04a", { w: .6 });
    var gl = P(145, 70, 77); s += '<path d="M' + f(gl[0] - 4) + ' ' + f(gl[1]) + ' l1 -14 h6 l1 14 z" fill="#e9f3f7" stroke="' + INK + '" stroke-width="1" opacity=".9"/><rect x="' + f(gl[0] - 3.2) + '" y="' + f(gl[1] - 8) + '" width="6.4" height="7" fill="#f2a93b" opacity=".8"/>';
    s += flatEll(110, 95, 76.5, 22, 22, "#f4f4f2") + flatEll(110, 95, 77, 15, 15, "#e9e4da", { w: .8 });
    for (var k = 0; k < 4; k++) { var p = P(102 + k * 6, 90 + (k % 2) * 8, 80); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="4" fill="#8a5a24" stroke="' + INK + '" stroke-width="1"/>'; }
    var br = P(122, 100, 79); s += '<ellipse cx="' + f(br[0]) + '" cy="' + f(br[1]) + '" rx="10" ry="5" fill="#e8c27a" stroke="' + INK + '" stroke-width="1.2"/>';
    if (o.phoneOn) { var pp = P(88, 70, 76.5); s += '<g transform="translate(' + f(pp[0]) + ' ' + f(pp[1]) + ') scale(1 .55) rotate(30)">' + phone(0, 0, 1, 0, t, "off", o.germs || 0) + '</g>'; }
    s += box(70, 140, 0, 40, 40, 44, "#8a5a34", "#7a4e2c", "#6b4224");                                        // chair
    return s;
  }

  // ── events (word times) ─────────────────────────────
  function W(i, w) { var ws = LN[i].text.split(" "), tot = ws.join("").length, acc = 0; for (var k = 0; k < ws.length; k++) { if (ws[k].indexOf(w) === 0) return L(i) + (E(i) - L(i)) * acc / tot; acc += ws[k].length; } return L(i); }
  window.EV = { vote: 1e9 };

  // ── the man in the room ─────────────────────────────
  // seated on the toilet facing +y (screen: left and 30° down), so his profile faces left and the thighs point 60° from vertical
  var SEAT = P(TXc, 40, 46);
  var SIT = { torso: 14, head: 34, sh: 22, el: 82, sh2: 26, el2: 76, th: 62, kn: 60, th2: 58, kn2: 56 };
  function sitter(t, o) { return man([SEAT[0], SEAT[1]], Object.assign({}, SIT, (o && o.pose) || {}), t, Object.assign({ pantsDown: true, phone: true, phoneAng: -72, flip: true }, o || {})); }
  function walkPose(t) { var w = Math.sin(t * 6); return { torso: 4, head: 14, sh: 40 + w * 4, el: 90, sh2: -w * 20, el2: 20, th: w * 22, kn: Math.max(0, -w) * 30, th2: -w * 22, kn2: Math.max(0, w) * 30 }; }
  function walker(x, y, t, o) { var p = P(x, y, 92); return man([p[0], p[1]], walkPose(t), t, Object.assign({ phone: true, phoneAng: -40 }, o || {})); }

  // ── screen-space helpers: tags, cards ─────────────────
  var CAMNOW = [180, 320, 1];
  function proj(x, y) { var c = CAMNOW; return [180 + (x - c[0]) * c[2], 320 + (y - c[1]) * c[2]]; }
  function tag(w2, text, t0, t, o) {
    if (window.__noTags) return "";
    o = o || {}; var u = t - t0, dur = o.dur || 2.6; if (u < 0 || u > dur) return "";
    var p = proj(w2[0], w2[1]), sc = pop(u) * clamp((dur - u) / .25), w = text.length * 8.6 + 26, col = o.red ? "#ff5a4e" : (o.col || "#ffd23f");
    var x = Math.max(w / 2 + 8, Math.min(352 - w / 2, p[0])), y = Math.max(214, Math.min(600, p[1] - 22));
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><path d="M0 22 l-6 -10 h12 z" fill="#1b1a1f" transform="translate(' + f(Math.max(-w / 2 + 12, Math.min(w / 2 - 12, p[0] - x))) + ' -2)"/><rect x="' + f(-w / 2) + '" y="-16" width="' + f(w) + '" height="30" rx="15" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + col + '">' + text + '</text></g>';
  }
  function card(k, inner, h) { if (k <= 0) return ""; h = h || 300; return '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.55 * clamp(k * 2)) + '"/><g transform="translate(180 390) scale(' + f(pop(k)) + ')"><rect x="-150" y="' + (-h / 2) + '" width="300" height="' + h + '" rx="22" fill="#fbf6ea" stroke="' + INK + '" stroke-width="3"/>' + inner + '</g>'; }
  function isoBar(x, h, col, label, val) {   // a 3D bar standing on the card
    var s = '<g transform="translate(' + x + ' 90)">', w = 26, d = 14;
    s += '<path d="M0 0 L' + w + ' ' + (-d / 2) + ' L' + w + ' ' + f(-d / 2 - h) + ' L0 ' + f(-h) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M0 0 L' + (-w) + ' ' + (-d / 2) + ' L' + (-w) + ' ' + f(-d / 2 - h) + ' L0 ' + f(-h) + ' Z" fill="' + col + '" opacity=".8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M0 ' + f(-h) + ' L' + w + ' ' + f(-d / 2 - h) + ' L0 ' + f(-d - h) + ' L' + (-w) + ' ' + f(-d / 2 - h) + ' Z" fill="#fff" opacity=".6" stroke="' + INK + '" stroke-width="1.4"/>';
    return s + '<text x="0" y="' + f(-h - 22) + '" text-anchor="middle" class="big" fill="' + INK + '">' + val + '</text><text x="0" y="26" text-anchor="middle" class="tg" fill="' + INK + '">' + label + '</text></g>';
  }

  // ── camera per line ─────────────────────────────────
  var SHOTS = [[0, [150, 300, 1.25]], [1, [250, 300, 1.75]], [2, [232, 262, 3.0]], [3, [200, 300, 1.15]], [4, [235, 230, 1.6]], [5, [235, 220, 1.7]],
    [8, [262, 330, 2.0]], [9, [262, 340, 2.2]], [13, [235, 360, 1.9]], [14, [262, 320, 1.7]], [15, [270, 290, 1.7]], [16, [262, 270, 1.4]],
    [17, [262, 250, 1.35]], [18, [238, 268, 2.4]], [20, [170, 330, 1.25]], [23, [150, 300, 1.25]], [24, [190, 300, 1.15]]];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : [190, 300, 1.05], b = SHOTS[i][1], k = ease((t - (L(SHOTS[i][0]) - .45)) / 1.1);
    if (i === 0) k = ease(t / 2.4);
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 3; c[1] += Math.cos(t * .29) * 2.5; c[2] *= 1 + .012 * Math.sin(t * .23);
    return c;
  }
  function line(t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return i; }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var c = window.__cam || cam(t), i = line(t), u = t - L(i), s = "", T = ""; CAMNOW = c;
    var dark = window.__noDark ? 0 : i >= 16 && i <= 17 ? .8 : i === 14 ? .25 * after(t, L(14), 2) : i === 18 ? .3 : 0;
    if (i === 20) s += diningRoom(t, { phoneOn: u > 1, germs: 5 }) + man([P(90, 165, 46)[0], P(90, 165, 46)[1]], { torso: 10, head: 14, sh: 60 + 30 * Math.sin(t * 2), el: 70 + 40 * Math.max(0, Math.sin(t * 2)), sh2: 30, el2: 60, th: 62, kn: 62, th2: 58, kn2: 58 }, t, { flip: true, phone: u < 1 });
    else {
      s += room(t, { clock: i <= 5 ? 10 + (i >= 4 ? (t - L(4)) * (i === 5 ? 25 : 8) : 0) : (i >= 23 ? 10 + 25 * after(t, L(23), 3) : null) });
      var lid = i >= 22 ? "closed" : "open";
      s += toilet(t, { lid: lid, press: i === 15 ? clamp(Math.sin(clamp((u - .6) / .6) * Math.PI)) : 0, dark: dark > .5 });
      if (i === 0) { var k0 = ease(clamp(u / 2.4)); s += k0 < 1 ? walker(lerp(30, 120, k0), lerp(150, 70, k0), t) : sitter(t, {}); }
      else if (i === 13) { if (u < (E(13) - L(13)) * .55) s += sitter(t, { numb: true, mood: "pain" }) + line3([TXc - 18, 60, 42], [TXc + 18, 60, 42], "#d9452e", 5, .5 + .5 * Math.sin(t * 8)); else { var p13 = P(TXc + 20, 90, 92); s += man([p13[0], p13[1]], { torso: 6, head: 10, sh: -10, el: 10, sh2: 10, el2: 10, th: 6 + Math.sin(t * 9) * 6, kn: 10, th2: -4, kn2: 4 }, t, { numb: true, mood: "pain", phone: true, flip: true }); } }
      else if (i === 15) { var p15 = P(148, 102, 92); s += man([p15[0], p15[1]], { torso: 20, head: 10, sh: 85, el: 0, sh2: 10, el2: 10 }, t, { mood: "n" }); s += plume(L(15) + 1.2, t, { n: 50, op: .35 }); }
      else if (i === 16 || i === 17) { s += '<rect x="-400" y="-300" width="1200" height="1300" fill="#000" opacity=".72"/>' + toilet(t, { dark: true }) + plume(i === 16 ? L(16) + .3 : L(17) - 3.5, t, { laser: true, n: 150, dur: i === 16 ? 4 : 8 }); if (i === 17) s += ruler(after(t, L(17), 1.2)); }
      else if (i === 18) s += sitter(t, { germs: Math.min(8, Math.floor(u * 4)), mood: "disgust" }) + plume(L(18) - 3, t, { n: 140, op: .6 });
      else if (i === 23) { var k23 = ease(clamp(u / (E(23) - L(23)))); s += walker(lerp(120, 30, k23), lerp(80, 150, k23), t, { phone: false, flip: true }); }
      else if (i === 24) { var p24 = P(60, 150, 92); s += man([p24[0], p24[1]], { torso: 0, head: 0, sh: 160 + 15 * Math.sin(t * 6), el: 20, sh2: -4, el2: 6 }, t, { mood: "n" }); }
      else if (i === 22) { }
      else s += sitter(t, { germs: i === 2 ? Math.min(6, Math.floor(u * 3)) : 0, numb: false });
      if (i === 9) for (var a = 0; a < 3; a++) { var gu = (t * 1.2 + a / 3) % 1, gp = P(TXc - 6 + a * 6, 44, 30 - gu * 20); s += '<path d="M' + f(gp[0]) + ' ' + f(gp[1]) + ' v10 m-4 -4 l4 4 l4 -4" stroke="#ffd23f" stroke-width="2.4" fill="none" opacity="' + f(1 - gu) + '"/>'; }
      if (dark > 0 && i !== 16 && i !== 17) s += '<rect x="-400" y="-300" width="1200" height="1300" fill="#05070c" opacity="' + f(dark) + '"/>';
    }
    var Wd = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';

    // tags in the room
    var seat = P(TXc, 44, 42), hand = P(TXc, 70, 100);
    T += tag([150, 230], "بتاخده معاك؟", L(0) + 1.6, t);
    T += tag([hand[0] - 20, hand[1] - 30], "مش شايفه!", L(2) + 1, t, { red: true });
    T += tag([232, 140], "بيسرق وقتك", L(4) + .4, t);
    T += tag([232, 140], "ربع ساعة!", W(5, "ربع"), t, { red: true });
    T += tag([seat[0], seat[1] - 10], "القعدة الطويلة؟", L(8) + .3, t);
    T += tag([seat[0], seat[1]], "مفيش حاجة سانداك", L(9) + .5, t);
    T += tag([seat[0] - 30, seat[1] + 10], "تنميل!", L(13) + .8, t, { red: true });
    T += tag([seat[0], seat[1] - 20], "الجزء الأقرف…", L(14) + .5, t, { col: "#c9e6a0" });
    T += tag(P(TXc, 9, 84), "السيفون", L(15) + .5, t);
    T += tag(P(TXc - 30, 46, 150), "زي الصاروخ!", L(16) + 1.2, t, { col: "#c9e6a0" });
    T += tag([hand[0], hand[1] - 20], "في قلب الرذاذ", L(18) + .8, t, { red: true });
    T += tag(P(88, 70, 80), "نفس الإيد!", L(20) + 1.6, t, { red: true });
    T += tag(P(60, 150, 190), "خمس دقايق بس", L(23) + .4, t);
    T += tag(P(60, 150, 190), "قولولنا!", L(24) + .3, t);
    if (i === 17) { var sec = Math.min(8, (t - L(17) + 3.5) * 1.6); T += '<g transform="translate(290 250)"><rect x="-44" y="-22" width="88" height="40" rx="8" fill="#14232f" stroke="#fff" stroke-width="1.6"/><text x="0" y="8" text-anchor="middle" class="big" fill="#6ee07a">' + sec.toFixed(1) + ' ث</text></g>'; }

    // cards: the study, the anatomy, one phone in six, the path, the fixes
    if (i === 6 || i === 7) { var k6 = after(t, L(6), .9), g6 = after(t, L(6) + .3, 1.4), g7 = after(t, L(7), 1.2);
      T += card(k6, '<text x="0" y="-112" text-anchor="middle" class="hd" fill="' + INK + '">أكتر من 5 دقايق</text>' + isoBar(-60, 125 * g6, "#d9452e", "بالموبايل", Math.round(37 * g6) + "٪") + isoBar(60, 30 * g7, "#3a9a5a", "من غيره", Math.round(7 * g7) + "٪")); }
    if (i >= 10 && i <= 12) { var k10 = after(t, L(10), .9);
      T += card(k10, '<g transform="scale(.66)">' + anatomy(0, 0, t, i === 10 ? clamp(u / (E(10) - L(10))) * .8 : 1, { flow: true, pool: i === 10 }) + '</g>' + (i >= 11 ? '<g transform="translate(0 120) scale(' + f(pop(after(t, L(11), .8))) + ')"><rect x="-70" y="-18" width="140" height="34" rx="17" fill="#1b1a1f"/><text x="0" y="6" text-anchor="middle" class="big" fill="#ff8a7a">البواسير</text></g>' : '') +
        (i === 12 ? '<g transform="scale(' + f(pop(after(t, L(12), .9))) + ')"><rect x="-110" y="-56" width="220" height="112" rx="16" fill="#fbf6ea" stroke="' + INK + '" stroke-width="2.4"/><text x="0" y="-20" text-anchor="middle" class="tg" fill="' + INK + '">خطر البواسير</text><text x="0" y="34" text-anchor="middle" style="font:900 38px Noto Sans Arabic" fill="#d9452e">أعلى ' + Math.round(46 * after(t, L(12) + .3, 1.4)) + '٪</text></g>' : ''), 320); }
    if (i === 19) { var k19 = after(t, L(19), .9), ph = "";
      for (var q = 0; q < 6; q++) { var pk = pop(after(t, L(19) + .2 + q * .15, .9)), xx = -110 + (q % 3) * 110, yy = q < 3 ? -40 : 70; ph += '<g transform="translate(' + xx + ' ' + yy + ') scale(' + f(pk * 3) + ')">' + phone(0, 0, 1, 0, t, q === 4 ? "off" : "on", q === 4 ? 6 : 0) + '</g>'; }
      T += card(k19, '<text x="0" y="-120" text-anchor="middle" class="hd" fill="' + INK + '">موبايل من كل 6</text>' + ph + '<text x="0" y="135" text-anchor="middle" class="tg" fill="#d9452e">عليه بكتيريا من البراز</text>', 310); }
    if (i === 21) { var k21 = after(t, L(21), .9), pts = [[-100, -70], [60, -70], [-100, 70], [60, 70]], nm = ["التواليت", "الموبايل", "إيدك", "بُقّك"], g21 = "";
      for (var n = 0; n < 4; n++) { var nk = pop(after(t, L(21) + n * .35, .9)); g21 += '<g transform="translate(' + (pts[n][0] + 20) + ' ' + pts[n][1] + ') scale(' + f(nk) + ')"><circle r="38" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text y="58" text-anchor="middle" class="tg" fill="' + INK + '">' + nm[n] + '</text></g>'; }
      g21 += '<g transform="translate(-80 -70) scale(.55)">' + '<path d="M-20 -40 h40 v34 h-40 z M-26 -6 h52 q0 30 -26 36 q-26 -6 -26 -36 z" fill="#f4f6f8" stroke="' + INK + '" stroke-width="2.4"/></g>';
      g21 += '<g transform="translate(80 -70) scale(2.4)">' + phone(0, 0, 1, 0, t, "on", 3) + '</g><g transform="translate(-80 70)"><ellipse rx="18" ry="13" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-5 -13 v-11 M2 -13 v-14 M9 -11 v-11" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/></g><g transform="translate(80 70)"><path d="M-18 0 q18 -12 36 0 q-18 14 -36 0 Z" fill="#c9545e" stroke="' + INK + '" stroke-width="1.6"/></g>';
      var ar = [[-40, -70, 40, -70], [80, -30, -60, 40], [-40, 70, 40, 70]];
      for (var r = 0; r < 3; r++) { var rk = after(t, L(21) + .7 + r * .5, .6); if (rk <= 0) continue; g21 += '<path d="M' + ar[r][0] + ' ' + ar[r][1] + ' L' + f(lerp(ar[r][0], ar[r][2], rk)) + ' ' + f(lerp(ar[r][1], ar[r][3], rk)) + '" stroke="#d9452e" stroke-width="4" marker-end="url(#arr)"/>'; }
      T += card(k21, g21 + '<text x="0" y="-132" text-anchor="middle" class="hd" fill="#d9452e">في خطوتين!</text>', 320); }
    if (i === 22) { var k22 = after(t, L(22), .9), g22 = "", items = [["سيبه برّه", W(22, "سيب")], ["اقفل الغطا", W(22, "واقفل")], ["امسحه", W(22, "وامسح")]];
      items.forEach(function (it, n2) { var ik = pop(after(t, it[1], .8)); if (ik <= 0) return; g22 += '<g transform="translate(0 ' + (-80 + n2 * 80) + ') scale(' + f(ik) + ')"><rect x="-120" y="-30" width="240" height="60" rx="14" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><text x="80" y="8" text-anchor="end" class="big" fill="' + INK + '">' + it[0] + '</text><circle cx="-90" cy="0" r="16" fill="#3a9a5a"/><path d="M-98 0 l6 6 l10 -12" stroke="#fff" stroke-width="3.4" fill="none"/></g>'; });
      T += card(k22, g22, 300); }
    return Wd + T;
  };
})();
