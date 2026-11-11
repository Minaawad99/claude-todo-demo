  // ── «أوعى تاخد الموبايل الحمام» — pieces drawn at real scale: 1.6 px = 1 cm (toilet seat 42 cm, phone 15 cm,
  // a 175 cm man with real body proportions: head 23 cm, torso 52, upper arm 30, forearm 26, thigh 45, shin 45, foot 26).
  var INK = "#1c1c1c", CM = 1.6, FLOOR = 322;
  var SKIN = "#d29a6e", SKIN2 = "#b67d55", SHIRT = "#3a78b8", SHIRT2 = "#2c5f94", PANTS = "#4a4f5a", PANTS2 = "#3a3e47", HAIR = "#2a1d14";
  function rad(a) { return a * Math.PI / 180; }
  function limb(x1, y1, x2, y2, w, col, edge) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + (edge || INK) + '" stroke-width="' + f(w + 2.4) + '" stroke-linecap="round"/><path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; }
  function seg(p, len, ang) { return [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len]; }   // ang 0 = straight down, +90 = forward (right)
  // a man seen from the side, facing right. hip = [x, y]. pose angles in degrees (0 = hanging straight down, + = forward):
  // torso (lean, 0 upright), head (nod), sh/el (upper arm, forearm) for the near arm, sh2/el2 far arm, th/kn (thigh, shin) near, th2/kn2 far.
  function man(hip, pose, t, o) {
    o = o || {}; var s = o.s || CM, P = Object.assign({ torso: 0, head: 0, sh: 8, el: 8, sh2: -6, el2: 4, th: 0, kn: 0, th2: 0, kn2: 0, foot: 90 }, pose);
    var g = "", neck = [hip[0] + Math.sin(rad(P.torso)) * 52 * s, hip[1] - Math.cos(rad(P.torso)) * 52 * s];
    var shoulder = [hip[0] + Math.sin(rad(P.torso)) * 47 * s, hip[1] - Math.cos(rad(P.torso)) * 47 * s];
    function leg(th, kn, near) {
      var knee = seg(hip, 45 * s, th), ankle = seg(knee, 45 * s, th - kn), toe = [ankle[0] + 22 * s, ankle[1]];
      var pantsCol = near ? PANTS : PANTS2, out = "";
      if (o.pantsDown) { out += limb(hip[0], hip[1], knee[0], knee[1], 15 * s, near ? SKIN : SKIN2) + limb(knee[0], knee[1], ankle[0], ankle[1], 10.5 * s, near ? SKIN : SKIN2);
        out += '<ellipse cx="' + f(ankle[0] + 2) + '" cy="' + f(ankle[1] - 6 * s) + '" rx="' + f(11 * s) + '" ry="' + f(7 * s) + '" fill="' + pantsCol + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
      else out += limb(hip[0], hip[1], knee[0], knee[1], 16 * s, pantsCol) + limb(knee[0], knee[1], ankle[0], ankle[1], 12 * s, pantsCol);
      out += '<path d="M' + f(ankle[0] - 5 * s) + ' ' + f(ankle[1] - 4 * s) + ' Q' + f(ankle[0] - 6 * s) + ' ' + f(ankle[1] + 4 * s) + ' ' + f(ankle[0]) + ' ' + f(ankle[1] + 4 * s) + ' L' + f(toe[0] + 2 * s) + ' ' + f(ankle[1] + 4 * s) + ' Q' + f(toe[0] + 3 * s) + ' ' + f(ankle[1] - 2 * s) + ' ' + f(toe[0] - 6 * s) + ' ' + f(ankle[1] - 3 * s) + ' Z" fill="' + (near ? "#2b2b2f" : "#1d1d20") + '" stroke="' + INK + '" stroke-width="1.4"/>';
      if (o.numb && near) for (var k = 0; k < 6; k++) { var u = (t * 2 + k / 6) % 1, p = [lerp(hip[0], ankle[0], .3 + k * .12), lerp(hip[1], ankle[1], .3 + k * .12)]; out += '<path d="M' + f(p[0] - 4) + ' ' + f(p[1] - 6 - u * 6) + ' l3 -4 l3 4 l3 -4" stroke="#ffd23f" stroke-width="1.6" fill="none" opacity="' + f(1 - u) + '"/>'; }
      return out;
    }
    function arm(sh, el, near) {
      var elbow = seg(shoulder, 30 * s, sh), wrist = seg(elbow, 26 * s, sh + el), hand = seg(wrist, 9 * s, sh + el);
      var out = limb(shoulder[0], shoulder[1], elbow[0], elbow[1], 9.5 * s, near ? SHIRT : SHIRT2) + limb(elbow[0], elbow[1], wrist[0], wrist[1], 7.5 * s, near ? SKIN : SKIN2);
      out += '<ellipse cx="' + f(hand[0]) + '" cy="' + f(hand[1]) + '" rx="' + f(5.5 * s) + '" ry="' + f(4.5 * s) + '" fill="' + (near ? SKIN : SKIN2) + '" stroke="' + INK + '" stroke-width="1.3"/>';
      return { svg: out, hand: hand };
    }
    var far = arm(P.sh2, P.el2, false);
    g += leg(P.th2, P.kn2, false) + far.svg;
    // torso: a tapered shirt from shoulders to hips
    var ang = rad(P.torso), nx = Math.cos(ang), ny = Math.sin(ang), wS = 21 * s, wH = 17 * s;
    var tor = [[shoulder[0] - nx * wS * .55, shoulder[1] - ny * wS * .55], [shoulder[0] + nx * wS * .45, shoulder[1] + ny * wS * .45], [hip[0] + nx * wH * .6, hip[1] + ny * wH * .6], [hip[0] - nx * wH * .55, hip[1] - ny * wH * .55]];
    g += '<path d="M' + tor.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(" L") + ' Z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    g += '<path d="M' + f(lerp(tor[0][0], tor[3][0], .2)) + ' ' + f(lerp(tor[0][1], tor[3][1], .2)) + ' L' + f(lerp(tor[0][0], tor[3][0], .9)) + ' ' + f(lerp(tor[0][1], tor[3][1], .9)) + '" stroke="' + SHIRT2 + '" stroke-width="2" opacity=".6"/>';
    g += leg(P.th, P.kn, true);
    // neck + head (profile: skull, forehead, nose, lips, chin, ear, hair)
    var hd = rad(P.torso + P.head), hc = [neck[0] + Math.sin(hd) * 12 * s, neck[1] - Math.cos(hd) * 12 * s];
    g += limb(shoulder[0], shoulder[1], neck[0] + Math.sin(hd) * 3 * s, neck[1] - Math.cos(hd) * 3 * s, 8 * s, SKIN);
    var blink = Math.sin(t * 2.3) > .97 ? .15 : 1;
    g += '<g transform="translate(' + f(hc[0]) + ' ' + f(hc[1]) + ') rotate(' + f(P.torso + P.head) + ') scale(' + f(s / 1.6) + ')">';
    g += '<path d="M-14 -14 Q-16 -30 0 -32 Q14 -32 16 -18 L17 -10 L22 -4 Q23 -1 18 0 L18 5 Q19 8 16 9 L17 12 Q15 17 8 18 Q0 19 -3 14 L-6 6 Q-15 2 -14 -14 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    g += '<path d="M-15 -12 Q-18 -32 0 -34 Q16 -34 17 -20 Q10 -26 2 -22 Q-4 -18 -6 -10 Z" fill="' + HAIR + '"/>';
    g += '<path d="M-4 -6 q-5 -2 -5 4 q0 5 5 4" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<ellipse cx="11" cy="-9" rx="2" ry="' + f(2.2 * blink) + '" fill="' + INK + '"/><path d="M7 -14 q4 -2 8 0" stroke="' + HAIR + '" stroke-width="1.6" fill="none"/>';
    if (o.mood === "disgust") g += '<path d="M10 11 q4 -3 7 1" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    else if (o.mood === "shock") g += '<ellipse cx="14" cy="11" rx="2.6" ry="3.4" fill="#5a1f1a"/>';
    else if (o.mood === "pain") g += '<path d="M9 11 l3 -2 l3 2 l3 -2" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
    else g += '<path d="M11 11 q3 1.5 6 0" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
    g += '</g>';
    var near = arm(P.sh, P.el, true); g += near.svg;
    if (o.phone) g += phone(near.hand[0] + 2, near.hand[1] - 6 * s, s, o.phoneAng == null ? -20 : o.phoneAng, t, o.screen, o.germs);
    if (o.sweat) for (var k = 0; k < 3; k++) { var su = (t * 1.2 + k / 3) % 1; g += '<path d="M' + f(hc[0] + 18 + k * 5) + ' ' + f(hc[1] - 20 + su * 18) + ' q2 3 0 5 q-2 -2 0 -5" fill="#9fe0f7" opacity="' + f(1 - su) + '"/>'; }
    return o.flip ? '<g transform="translate(' + f(2 * hip[0]) + ' 0) scale(-1 1)">' + g + '</g>' : g;
  }
  // a smartphone: 15 × 7 cm, 0.8 cm thick, seen at an angle; the screen scrolls a feed
  function phone(x, y, s, ang, t, screen, germs) {
    var w = 7.4 * s, h = 15 * s, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">';
    g += '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(1.2 * s) + '" fill="#16181d" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<rect x="' + f(-w / 2 + .5 * s) + '" y="' + f(-h / 2 + .8 * s) + '" width="' + f(w - s) + '" height="' + f(h - 1.6 * s) + '" rx="' + f(.8 * s) + '" fill="' + (screen === "off" ? "#20242c" : "#e9f1fb") + '"/>';
    if (screen !== "off") { var sc = (t * 14) % (4 * s); for (var r = -1; r < 6; r++) { var yy = -h / 2 + 1.4 * s + r * 4 * s - sc; if (yy < -h / 2 + .8 * s || yy > h / 2 - 2.6 * s) continue; g += '<rect x="' + f(-w / 2 + 1 * s) + '" y="' + f(yy) + '" width="' + f(w - 2 * s) + '" height="' + f(2.6 * s) + '" rx="1" fill="' + ["#f2a93b", "#7fb2cf", "#e0418a", "#6ee07a"][(r + 8) % 4] + '" opacity=".85"/>'; } }
    if (germs) for (var k = 0; k < germs; k++) { var gx = -w / 2 + 1 * s + hash(k) * (w - 2 * s), gy = -h / 2 + 1 * s + hash(k + 7) * (h - 2 * s); g += bug(gx, gy, .5, t + k, k % 2 ? "#7cc04f" : "#a8c84a"); }
    g += '<path d="M' + f(-w / 2 + 1 * s) + ' ' + f(-h / 2 + 1.2 * s) + ' l' + f(w * .3) + ' ' + f(h * .25) + '" stroke="#fff" stroke-width="1.4" opacity=".35"/>';
    return g + '</g>';
  }
  // a bacterium (E. coli: a short rod with flagella), wriggling
  function bug(x, y, sc, t, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 3) * 25 + hash(Math.floor(x)) * 180) + ') scale(' + sc + ')"><path d="M-9 0 q-5 ' + f(Math.sin(t * 12) * 4) + ' -10 0 M-9 2 q-5 ' + f(-Math.sin(t * 12) * 4) + ' -10 2" stroke="#2f6a1f" stroke-width="1.2" fill="none"/><rect x="-9" y="-4" width="18" height="8" rx="4" fill="' + (col || "#7cc04f") + '" stroke="#2f6a1f" stroke-width="1.4"/><circle cx="-3" cy="-1" r="1" fill="#2f6a1f"/><circle cx="3" cy="1" r="1" fill="#2f6a1f"/></g>'; }
  // a close-coupled floor toilet seen from the side, facing right (bowl front at x + 38 cm). seat 42 cm, cistern top 80 cm.
  function toilet(x, t, o) {
    o = o || {}; var s = CM, g = "", y = FLOOR;
    function X(cm) { return x + cm * s; } function Y(cm) { return y - cm * s; }
    g += '<rect x="' + f(X(-34)) + '" y="' + f(Y(80)) + '" width="' + f(34 * s) + '" height="' + f(38 * s) + '" rx="' + f(3 * s) + '" fill="url(#gPorc)" stroke="' + INK + '" stroke-width="1.8"/>';
    g += '<rect x="' + f(X(-36)) + '" y="' + f(Y(83)) + '" width="' + f(38 * s) + '" height="' + f(4 * s) + '" rx="' + f(1.5 * s) + '" fill="#f7f8fa" stroke="' + INK + '" stroke-width="1.6"/>';
    var press = o.press || 0; g += '<rect x="' + f(X(-21)) + '" y="' + f(Y(84.5 - press * 1.2)) + '" width="' + f(8 * s) + '" height="' + f(1.8 * s) + '" rx="2" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/>';
    // bowl: rim at 40 cm, pedestal down to the floor
    g += '<path d="M' + f(X(-4)) + ' ' + f(Y(40)) + ' L' + f(X(36)) + ' ' + f(Y(40)) + ' Q' + f(X(40)) + ' ' + f(Y(40)) + ' ' + f(X(38)) + ' ' + f(Y(30)) + ' Q' + f(X(32)) + ' ' + f(Y(18)) + ' ' + f(X(18)) + ' ' + f(Y(16)) + ' L' + f(X(16)) + ' ' + f(Y(0)) + ' L' + f(X(-2)) + ' ' + f(Y(0)) + ' L' + f(X(0)) + ' ' + f(Y(18)) + ' Q' + f(X(-6)) + ' ' + f(Y(26)) + ' ' + f(X(-4)) + ' ' + f(Y(40)) + ' Z" fill="url(#gPorc)" stroke="' + INK + '" stroke-width="1.8"/>';
    g += '<path d="M' + f(X(2)) + ' ' + f(Y(18)) + ' Q' + f(X(10)) + ' ' + f(Y(14)) + ' ' + f(X(14)) + ' ' + f(Y(4)) + '" stroke="#c9ced4" stroke-width="1.4" fill="none"/>';
    if (o.cut) {   // cut-away: the water in the bowl
      g += '<path d="M' + f(X(2)) + ' ' + f(Y(38)) + ' L' + f(X(34)) + ' ' + f(Y(38)) + ' Q' + f(X(28)) + ' ' + f(Y(22)) + ' ' + f(X(16)) + ' ' + f(Y(20)) + ' Q' + f(X(6)) + ' ' + f(Y(22)) + ' ' + f(X(2)) + ' ' + f(Y(38)) + ' Z" fill="#e7eef4" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + f(X(8)) + ' ' + f(Y(28)) + ' Q' + f(X(16)) + ' ' + f(Y(26 + Math.sin(t * 6))) + ' ' + f(X(28)) + ' ' + f(Y(28)) + ' L' + f(X(26)) + ' ' + f(Y(23)) + ' Q' + f(X(16)) + ' ' + f(Y(21)) + ' ' + f(X(9)) + ' ' + f(Y(24)) + ' Z" fill="#8fc9e6"/>'; }
    // seat ring (3 cm) and the lid, open (up against the cistern) or closed
    g += '<rect x="' + f(X(-3)) + '" y="' + f(Y(43)) + '" width="' + f(40 * s) + '" height="' + f(3 * s) + '" rx="' + f(1.4 * s) + '" fill="#fbfbfc" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.lid === "closed") g += '<rect x="' + f(X(-3)) + '" y="' + f(Y(46)) + '" width="' + f(41 * s) + '" height="' + f(3 * s) + '" rx="' + f(1.4 * s) + '" fill="#f1f3f6" stroke="' + INK + '" stroke-width="1.6"/>';
    else g += '<rect x="' + f(X(-4)) + '" y="' + f(Y(84)) + '" width="' + f(3 * s) + '" height="' + f(40 * s) + '" rx="' + f(1.4 * s) + '" fill="#f1f3f6" stroke="' + INK + '" stroke-width="1.6"/>';
    return g;
  }
  // the toilet plume: fine droplets thrown up (≈ 2 m/s), up to 150 cm in 8 s; o.laser draws the green light sheet
  function plume(x, t0, t, o) {
    o = o || {}; var u = t - t0; if (u < 0) return ""; var s = CM, g = "", top = Math.min(150, 150 * clamp(u / (o.dur || 8)) + 20 * clamp(u / 0.4)), bx = x + 17 * s, by = FLOOR - 40 * s;
    if (o.laser) g += '<path d="M' + f(bx - 70) + ' ' + f(FLOOR - 200 * s) + ' L' + f(bx + 70) + ' ' + f(FLOOR - 200 * s) + ' L' + f(bx + 40) + ' ' + f(by) + ' L' + f(bx - 40) + ' ' + f(by) + ' Z" fill="#3cff6a" opacity=".1"/>';
    for (var i = 0; i < (o.n || 90); i++) { var a = (hash(i) - .5) * 1.1, life = (u * (.8 + hash(i + 3) * .5) + hash(i + 9)) % 1, h = top * s * Math.pow(life, .7), px = bx + Math.sin(a) * h * .55 + Math.sin(t * 2 + i) * 3, py = by - Math.cos(a) * h;
      g += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(.8 + hash(i + 5) * 1.6) + '" fill="' + (o.laser ? "#9dff9b" : "#bfe3f2") + '" opacity="' + f((o.op || .8) * (1 - life * .7)) + '"/>'; }
    return g;
  }
  // the bathroom: tiled wall, floor, door (left), sink + mirror (right), a towel; a wall clock that can race
  function bathroom(t, o) {
    o = o || {}; var g = '<rect x="-400" y="-300" width="1440" height="' + (FLOOR + 300) + '" fill="url(#gTileW)"/>', dark = o.dark || 0;
    for (var x = -400; x < 1040; x += 26) g += '<path d="M' + x + ' -300 V' + FLOOR + '" stroke="#b9c7cf" stroke-width="1"/>';
    for (var y = FLOOR - 26; y > -300; y -= 26) g += '<path d="M-400 ' + y + ' H1040" stroke="#b9c7cf" stroke-width="1"/>';
    g += '<rect x="-400" y="' + FLOOR + '" width="1440" height="200" fill="url(#gFloor)"/>';
    for (var x2 = -400; x2 < 1040; x2 += 48) g += '<path d="M' + x2 + ' ' + FLOOR + ' L' + (x2 - 30) + ' 420" stroke="#8a8378" stroke-width="1"/>';
    // door (210 cm) with handle
    g += '<rect x="20" y="' + f(FLOOR - 210 * CM) + '" width="' + f(85 * CM) + '" height="' + f(210 * CM) + '" fill="#a8774c" stroke="' + INK + '" stroke-width="2"/><rect x="28" y="' + f(FLOOR - 200 * CM) + '" width="' + f(75 * CM) + '" height="' + f(80 * CM) + '" fill="none" stroke="#8a5f38" stroke-width="2"/><circle cx="' + f(20 + 75 * CM) + '" cy="' + f(FLOOR - 100 * CM) + '" r="4" fill="#d9c79a" stroke="' + INK + '" stroke-width="1.2"/>';
    // sink at 85 cm, mirror above
    var sx = 520; g += '<rect x="' + (sx - 6) + '" y="' + f(FLOOR - 85 * CM) + '" width="8" height="' + f(85 * CM) + '" fill="#e9ecef" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (sx - 40) + ' ' + f(FLOOR - 85 * CM) + ' H' + (sx + 50) + ' Q' + (sx + 46) + ' ' + f(FLOOR - 70 * CM) + ' ' + (sx + 20) + ' ' + f(FLOOR - 66 * CM) + ' H' + (sx - 20) + ' Q' + (sx - 38) + ' ' + f(FLOOR - 70 * CM) + ' ' + (sx - 40) + ' ' + f(FLOOR - 85 * CM) + ' Z" fill="url(#gPorc)" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<path d="M' + (sx + 30) + ' ' + f(FLOOR - 85 * CM) + ' v-14 h-14" stroke="#c9ced4" stroke-width="4" fill="none"/><rect x="' + (sx - 46) + '" y="' + f(FLOOR - 190 * CM) + '" width="96" height="' + f(70 * CM) + '" rx="6" fill="#cfe6f2" stroke="' + INK + '" stroke-width="2"/><path d="M' + (sx - 30) + ' ' + f(FLOOR - 180 * CM) + ' l30 40" stroke="#fff" stroke-width="3" opacity=".6"/>';
    g += '<rect x="430" y="' + f(FLOOR - 140 * CM) + '" width="10" height="4" fill="#9aa4ad"/><path d="M420 ' + f(FLOOR - 138 * CM) + ' h30 v' + f(48 * CM + Math.sin(t) * 1) + ' h-30 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.clock != null) g += clock(250, FLOOR - 175 * CM, 20, o.clock);
    if (dark) g += '<rect x="-400" y="-300" width="1440" height="960" fill="#05070c" opacity="' + f(dark) + '"/>';
    return g;
  }
  function clock(x, y, r, minutes) { var g = '<circle cx="' + x + '" cy="' + f(y) + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>'; for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283; g += '<path d="M' + f(x + Math.sin(a) * r * .8) + ' ' + f(y - Math.cos(a) * r * .8) + ' L' + f(x + Math.sin(a) * r * .92) + ' ' + f(y - Math.cos(a) * r * .92) + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    var am = minutes / 60 * 6.283, ah = minutes / 720 * 6.283 + 1.2; return g + '<path d="M' + x + ' ' + f(y) + ' L' + f(x + Math.sin(ah) * r * .5) + ' ' + f(y - Math.cos(ah) * r * .5) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/><path d="M' + x + ' ' + f(y) + ' L' + f(x + Math.sin(am) * r * .78) + ' ' + f(y - Math.cos(am) * r * .78) + '" stroke="#d9452e" stroke-width="1.8" stroke-linecap="round"/><circle cx="' + x + '" cy="' + f(y) + '" r="2" fill="' + INK + '"/>'; }
  // a card with two bars (study result)
  function bars(x, y, title, a, b, la, lb, k, t) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + f(pop(k * 1.2)) + ')"><rect x="-150" y="-110" width="300" height="200" rx="16" fill="#fbf6ea" stroke="' + INK + '" stroke-width="2.4"/><text x="0" y="-80" text-anchor="middle" class="tag" style="font-size:17px">' + title + '</text>';
    [[a, la, "#d9452e", -60], [b, lb, "#3a9a5a", 60]].forEach(function (q) { var hh = 120 * q[0] / 40 * ease(clamp(k * 1.5 - (q[3] > 0 ? .4 : 0))); g += '<rect x="' + (q[3] - 30) + '" y="' + f(60 - hh) + '" width="60" height="' + f(hh) + '" rx="4" fill="' + q[2] + '" stroke="' + INK + '" stroke-width="1.6"/><text x="' + q[3] + '" y="' + f(52 - hh) + '" text-anchor="middle" class="tag" style="font-size:20px">' + Math.round(q[0] * clamp(k * 1.5)) + '٪</text><text x="' + q[3] + '" y="80" text-anchor="middle" class="tag" style="font-size:13px">' + q[1] + '</text>'; });
    return g + '</g>';
  }
  // the anatomy panel: the end of the gut seen in a cut, the cushions of veins around the opening swell as blood pools
  function anatomy(x, y, t, swell, o) {
    o = o || {}; var g = '<g transform="translate(' + x + ' ' + y + ')">', sw = clamp(swell), pulse = 1 + .03 * Math.sin(t * 5) * sw;
    g += '<rect x="-210" y="-150" width="420" height="300" rx="20" fill="#2a1c22"/>';
    g += '<path d="M-60 -150 C-60 -40 -40 20 -26 90 L-22 150 H22 L26 90 C40 20 60 -40 60 -150 Z" fill="#e7a0a0" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M-36 -150 C-36 -40 -18 30 -10 90 L-8 150 H8 L10 90 C18 30 36 -40 36 -150 Z" fill="#c76b74"/>';
    g += '<path d="M-130 110 Q-60 70 -26 100 M130 110 Q60 70 26 100" stroke="#d9a07a" stroke-width="20" fill="none" stroke-linecap="round"/>';
    [[-1, 40], [1, 40], [-1, 100], [1, 100]].forEach(function (q, i) { var r = (8 + 14 * sw * (i < 2 ? .8 : 1)) * pulse; g += '<ellipse cx="' + f(q[0] * (30 + r * .5)) + '" cy="' + q[1] + '" rx="' + f(r * .75) + '" ry="' + f(r) + '" fill="' + (sw > .3 ? "#7a2238" : "#9a3a50") + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var v = 0; v < 3; v++) g += '<path d="M' + f(q[0] * (30 + r * .5) - 4) + ' ' + f(q[1] - r * .6 + v * r * .4) + ' q4 3 8 0" stroke="#c94a64" stroke-width="1.2" fill="none"/>'; });
    if (o.flow) for (var k = 0; k < 8; k++) { var u = (t * .7 + k / 8) % 1, side = k % 2 ? 1 : -1; g += '<circle cx="' + f(side * (80 - u * 40)) + '" cy="' + f(-120 + u * (o.pool ? 210 : 160)) + '" r="3.2" fill="#d9283c" opacity="' + f(Math.sin(u * 3.14)) + '"/>'; }
    if (o.gravity) for (var a = 0; a < 3; a++) { var gu = (t * 1.2 + a / 3) % 1; g += '<path d="M' + (-150 + a * 150) + ' ' + f(-100 + gu * 60) + ' v24 m-7 -7 l7 7 l7 -7" stroke="#ffd23f" stroke-width="3" fill="none" opacity="' + f(1 - gu) + '"/>'; }
    return g + '</g>';
  }
  // a kitchen table with a plate of food (bread, falafel) for the "you eat with the same hand" beat
  function table(x, t, o) {
    o = o || {}; var g = '<rect x="-400" y="-300" width="1440" height="' + (FLOOR + 300) + '" fill="#f1e2c4"/><rect x="-400" y="' + FLOOR + '" width="1440" height="200" fill="#c79a6b"/>';
    g += '<rect x="' + (x - 160) + '" y="' + f(FLOOR - 75 * CM) + '" width="320" height="10" fill="#8a5a34" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x - 150) + '" y="' + f(FLOOR - 75 * CM + 10) + '" width="10" height="' + f(75 * CM - 10) + '" fill="#6b4224"/><rect x="' + (x + 140) + '" y="' + f(FLOOR - 75 * CM + 10) + '" width="10" height="' + f(75 * CM - 10) + '" fill="#6b4224"/>';
    var ty = FLOOR - 75 * CM; g += '<ellipse cx="' + (x + 50) + '" cy="' + f(ty - 2) + '" rx="46" ry="7" fill="#f4f4f2" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 4; k++) g += '<circle cx="' + (x + 30 + k * 12) + '" cy="' + f(ty - 9) + '" r="7" fill="#8a5a24" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<path d="M' + (x - 10) + ' ' + f(ty - 3) + ' q20 -16 40 0 Z" fill="#e8c27a" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.phoneOn) g += phone(x - 90, ty - 3, CM, 90, t, "off", o.germs);
    return g;
  }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var TX = 300;                                              // where the toilet stands
  var SIT = { torso: 18, head: 22, sh: 40, el: 95, sh2: 30, el2: 80, th: 92, kn: 88, th2: 88, kn2: 84 };
  function sitter(t, o) { return man([TX + 6 * CM, FLOOR - 46 * CM], Object.assign({}, SIT, (o && o.pose) || {}), t, Object.assign({ pantsDown: true, phone: true, phoneAng: -60 }, o || {})); }
  function walkPose(t) { var w = Math.sin(t * 6); return { torso: 4, head: 14, sh: 40 + w * 4, el: 90, sh2: -w * 20, el2: 20, th: w * 22, kn: Math.max(0, -w) * 30, th2: -w * 22, kn2: Math.max(0, w) * 30 }; }
  function scene(t, o) { o = o || {}; return bathroom(t, o) + toilet(TX, t, o) + (o.noMan ? "" : sitter(t, o)); }

  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(220, 320, k), 188, lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    var k = clamp(u / 2.2), x = lerp(90, TX - 30, ease(k));
    if (k < 1) return bathroom(t, {}) + toilet(TX, t, {}) + man([x, FLOOR - 92 * CM], walkPose(t), t, { phone: true, phoneAng: -40 }) + tag("بتاخده معاك؟", 320, 100, u, 1.4, -3, 24);
    return scene(t, {}) + tag("بتاخده معاك؟", 320, 100, u, 1.4, -3, 24);
  });
  shot(1, function (u, d) { return [300, 200, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) { return scene(t, { clock: 10 + u * 4 }) + tag("بتعمل فيك إيه؟", 330, 100, u, .6, -3, 22); });
  shot(2, function (u, d) { return [lerp(330, 345, u / d), lerp(180, 160, u / d), lerp(1.8, 2.4, u / d)]; }, function (u, d, t) { return scene(t, { germs: Math.min(6, Math.floor(u * 3)) }) + tag("مش شايفه!", 385, 120, u, 1, -3, 20); });
  shot(3, function (u, d) { return [300, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) { return scene(t, {}) + tag("إيه الحكاية؟", 320, 70, u, .2, -3, 30); });
  shot(4, function (u, d) { return [lerp(280, 300, u / d), 170, 1.35]; }, function (u, d, t) { return scene(t, { clock: 10 + u * 40 }) + tag("بيسرق وقتك", 250, 85, u, .5, -3, 22); });
  shot(5, function (u, d) { return [260, 160, lerp(1.3, 1.5, u / d)]; }, function (u, d, t) { var m = 2 + 13 * ease(clamp(u / (d * .8))); return scene(t, { clock: 10 + m * 6 }) + tag(m < 8 ? "دقيقتين…" : "ربع ساعة!", 250, 72, u, .2, -3, 24, m < 8 ? "#e8c48e" : "#f2a0a0"); });
  shot(6, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) { return bathroom(t, {}) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".35"/>' + bars(320, 190, "أكتر من 5 دقايق على التواليت", 37.3, 0, "بالموبايل", "من غيره", clamp(u / 1.6), t); });
  shot(7, function (u, d) { return [320, 180, 1.04]; }, function (u, d, t) { return bathroom(t, {}) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".35"/>' + bars(320, 190, "أكتر من 5 دقايق على التواليت", 37.3, 7.1 * clamp(u / 1.2), "بالموبايل", "من غيره", 1, t) + tag("7٪ بس", 470, 130, u, .8, 3, 20); });
  shot(8, function (u, d) { return [lerp(300, 330, u / d), lerp(220, 250, u / d), lerp(1.3, 1.7, u / d)]; }, function (u, d, t) { return scene(t, {}) + tag("القعدة الطويلة؟", 470, 205, u, .3, -3, 20); });
  shot(9, function (u, d) { return [320, 230, lerp(1.6, 1.8, u / d)]; }, function (u, d, t) {
    var g = scene(t, { cut: true }) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".25"/>' + toilet(TX, t, { cut: true }) + sitter(t, {});
    for (var a = 0; a < 3; a++) { var gu = (t * 1.2 + a / 3) % 1; g += '<path d="M' + (TX + 10 * CM + a * 12) + ' ' + f(FLOOR - 40 * CM + gu * 30) + ' v18 m-6 -6 l6 6 l6 -6" stroke="#ffd23f" stroke-width="3" fill="none" opacity="' + f(1 - gu) + '"/>'; }
    return g + tag("مفيش حاجة سانداك", 330, 162, u, .6, -3, 18);
  });
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) { return anatomy(320, 180, t, clamp(u / d) * .8, { flow: true, pool: true }) + tag("الدم بيتجمّع", 470, 70, u, .8, -3, 20); });
  shot(11, function (u, d) { return [320, 200, lerp(1.15, 1.35, u / d)]; }, function (u, d, t) { return anatomy(320, 180, t, 1, { flow: true }) + tag("البواسير", 320, 300, u, .1, -3, 30, "#f2a0a0"); });
  shot(12, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) { var k = clamp(u / 1.8); return anatomy(320, 180, t, 1, {}) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".45"/>' + '<g transform="translate(320 180) scale(' + f(pop(k)) + ')"><rect x="-120" y="-60" width="240" height="120" rx="18" fill="#fbf6ea" stroke="' + INK + '" stroke-width="2.4"/><text x="0" y="-22" text-anchor="middle" class="tag" style="font-size:17px">خطر البواسير</text><text x="0" y="34" text-anchor="middle" class="tag" style="font-size:46px;fill:#d9452e">+' + Math.round(46 * k) + '٪</text></g>'; });
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(330, 300, k), lerp(240, 220, k), lerp(1.6, 1.3, k)]; }, function (u, d, t) {
    var g = bathroom(t, {}) + toilet(TX, t, {}); if (u < d * .55) g += sitter(t, { numb: true, mood: "pain" }) + '<path d="M' + f(TX + 2 * CM) + ' ' + f(FLOOR - 43 * CM) + ' h' + f(38 * CM) + '" stroke="#d9452e" stroke-width="5" opacity="' + f(.5 + .5 * Math.sin(t * 8)) + '"/>';
    else { var w = Math.sin(t * 9) * 6; g += man([TX + 60, FLOOR - 92 * CM], { torso: 8 + w * .5, head: 10, sh: -10, el: 10, sh2: 10, el2: 10, th: 6 + w, kn: 10, th2: -4, kn2: 4 }, t, { numb: true, mood: "pain", phone: true }); }
    return g + tag("تنميل!", 470, 170, u, .8, -3, 26, "#f2a0a0");
  });
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(300, 320, k), lerp(200, 215, k), lerp(1.1, 1.5, ease(k))]; }, function (u, d, t) { return scene(t, { dark: .25 }) + tag("الجزء الأقرف…", 230, 150, u, .4, -3, 22, "#c9e6a0"); });
  shot(15, function (u, d) { return [lerp(270, 290, u / d), 230, 1.6]; }, function (u, d, t) {
    var press = clamp(Math.sin(clamp((u - .6) / .6) * Math.PI)), g = bathroom(t, {}) + toilet(TX, t, { press: press });
    g += man([TX - 180, FLOOR - 92 * CM], { torso: 60, head: -20, sh: 55, el: 5, sh2: 20, el2: 20, th: 0, kn: 0, th2: -6, kn2: 4 }, t, { mood: "n" });
    return g + plume(TX, 1.2, u, { n: 50, op: .35 }) + tag("نافورة مش شايفها", 420, 150, u, 1.4, -3, 20);
  });
  shot(16, function (u, d) { return [300, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) { return bathroom(t, { dark: .82 }) + toilet(TX, t, {}) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".55"/>' + plume(TX, .3, u, { laser: true, n: 140, dur: 4 }) + tag("زي الصاروخ!", 420, 60, u, 1.2, -3, 24, "#c9e6a0"); });
  shot(17, function (u, d) { return [310, 170, 1.0]; }, function (u, d, t) {
    var g = bathroom(t, { dark: .82 }) + toilet(TX, t, {}) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".55"/>' + plume(TX, 0, u * 2.2, { laser: true, n: 140 });
    var rx = TX + 70; g += '<rect x="' + rx + '" y="' + f(FLOOR - 160 * CM) + '" width="18" height="' + f(160 * CM) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var c = 0; c <= 160; c += 10) g += '<path d="M' + rx + ' ' + f(FLOOR - c * CM) + ' h' + (c % 50 ? 6 : 12) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<text x="' + (rx + 24) + '" y="' + f(FLOOR - 150 * CM + 5) + '" class="tag" style="font-size:16px;fill:#fff">150 سم</text>';
    var sec = Math.min(8, u * 2.2 * 1); g += '<g transform="translate(480 60)"><rect x="-44" y="-22" width="88" height="40" rx="8" fill="#14232f" stroke="#fff" stroke-width="1.6"/><text x="0" y="8" text-anchor="middle" class="tag" style="font-size:24px;fill:#6ee07a">' + sec.toFixed(1) + ' ث</text></g>';
    return g;
  });
  shot(18, function (u, d) { return [lerp(320, 360, u / d), lerp(160, 140, u / d), lerp(1.4, 2.0, u / d)]; }, function (u, d, t) { return bathroom(t, { dark: .3 }) + toilet(TX, t, {}) + sitter(t, { germs: Math.min(8, Math.floor(u * 4)), mood: "disgust" }) + plume(TX, 0, u + 3, { n: 120, op: .6 }); });
  shot(19, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var g = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9eef2"/>';
    for (var k = 0; k < 6; k++) { var x = 120 + k * 80, red = k === 3, pk = pop(clamp((u - k * .18) / 1)); g += '<g transform="translate(' + x + ' 170) scale(' + f(pk * 2.6) + ')">' + phone(0, 0, CM, 0, t, red ? "off" : "on", red ? 6 : 0) + '</g>'; }
    return g + tag("1 من كل 6", 320, 60, u, 1.2, -3, 26, "#f2a0a0") + tag("بكتيريا من البراز", 320, 300, u, 1.8, 3, 20);
  });
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(260, 340, k), 210, 1.25]; }, function (u, d, t) {
    var k = clamp(u / d), g = table(320, t, { phoneOn: k > .3, germs: 5 });
    g += man([180, FLOOR - 46 * CM], { torso: 6, head: 12, sh: 50 + 30 * Math.sin(t * 2), el: 60 + 40 * Math.max(0, Math.sin(t * 2)), sh2: 30, el2: 60, th: 90, kn: 90, th2: 86, kn2: 86 }, t, { phone: k < .3 });
    g += '<rect x="130" y="' + f(FLOOR - 46 * CM) + '" width="70" height="8" fill="#8a5a34" stroke="' + INK + '" stroke-width="1.4"/><rect x="134" y="' + f(FLOOR - 46 * CM + 8) + '" width="8" height="' + f(46 * CM - 8) + '" fill="#6b4224"/><rect x="188" y="' + f(FLOOR - 46 * CM + 8) + '" width="8" height="' + f(46 * CM - 8) + '" fill="#6b4224"/>';
    return g + tag("نفس الإيد!", 340, 70, u, 1.6, -3, 24, "#f2a0a0");
  });
  shot(21, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var g = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', pts = [[110, 230], [260, 140], [400, 230], [540, 140]], names = ["التواليت", "الموبايل", "إيدك", "بُقّك"];
    for (var k = 0; k < 4; k++) { var pk = pop(clamp((u - k * .35) / 1)); g += '<g transform="translate(' + pts[k][0] + ' ' + pts[k][1] + ') scale(' + f(pk) + ')"><circle r="46" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text y="66" text-anchor="middle" class="tag" style="font-size:18px">' + names[k] + '</text></g>'; }
    g += toilet(0, t, {}).replace(/^/, '<g transform="translate(110 230) scale(.42) translate(-' + f(5 * CM) + ' -' + f(FLOOR - 44 * CM) + ')">') + '</g>';
    g += '<g transform="translate(260 140) scale(2.2)">' + phone(0, 0, CM, 0, t, "on", 3) + '</g>';
    g += '<g transform="translate(400 230)"><ellipse rx="22" ry="16" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M-6 -16 v-14 M2 -16 v-17 M10 -14 v-14" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/></g>';
    g += '<g transform="translate(540 140)"><path d="M-20 0 q20 -14 40 0 q-20 16 -40 0 Z" fill="#c9545e" stroke="' + INK + '" stroke-width="1.8"/><path d="M-20 0 q20 6 40 0" stroke="#7a2232" stroke-width="2"/></g>';
    for (var a = 0; a < 3; a++) { var ak = clamp((u - .6 - a * .5) / .6); if (ak <= 0) continue; var p = pts[a], q = pts[a + 1]; g += arrow(p[0] + 40, p[1] + (q[1] < p[1] ? -20 : 20), lerp(p[0] + 40, q[0] - 40, ak), lerp(p[1], q[1], ak), "#d9452e", 4, 1); var bu = (t * .8 + a * .3) % 1; g += bug(lerp(p[0], q[0], bu), lerp(p[1], q[1], bu) - 18, .9, t + a, "#7cc04f"); }
    return g + tag("في خطوتين!", 320, 320, u, 2.2, -2, 24, "#f2a0a0");
  });
  shot(22, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var g = '<rect x="-400" y="-300" width="1440" height="960" fill="#eaf4ec"/>', items = [["سيبه برّه", 0], ["اقفل الغطا", 1.2], ["امسحه", 2.8]];
    items.forEach(function (it, k) { var x = 140 + k * 180, pk = pop(clamp((u - it[1]) / 1)); if (pk <= 0) return; g += '<g transform="translate(' + x + ' 170) scale(' + f(pk) + ')"><rect x="-80" y="-110" width="160" height="200" rx="16" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>';
      if (k === 0) g += '<rect x="-30" y="-80" width="60" height="110" fill="#a8774c" stroke="' + INK + '" stroke-width="2"/><circle cx="20" cy="-25" r="4" fill="#d9c79a"/><g transform="translate(-55 -30) scale(1.6)">' + phone(0, 0, CM, 0, t, "off", 0) + '</g>';
      if (k === 1) g += '<g transform="translate(-18 50) scale(.7) translate(-' + f(TX) + ' -' + f(FLOOR) + ')">' + toilet(TX, t, { lid: "closed" }) + '</g>';
      if (k === 2) g += '<g transform="translate(0 -20) scale(2.2)">' + phone(0, 0, CM, 0, t, "on", 0) + '</g><rect x="' + f(-30 + Math.sin(t * 5) * 18) + '" y="-34" width="34" height="22" rx="4" fill="#cfe9f7" stroke="' + INK + '" stroke-width="1.4" opacity=".9"/>';
      g += '<text x="0" y="74" text-anchor="middle" class="tag" style="font-size:18px">' + it[0] + '</text><circle cx="58" cy="-90" r="14" fill="#3a9a5a"/><path d="M51 -90 l5 5 l9 -10" stroke="#fff" stroke-width="3" fill="none"/></g>'; });
    return g;
  });
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(300, 200, k), 190, 1.1]; }, function (u, d, t) {
    var k = clamp(u / d), x = lerp(TX + 40, 80, ease(k));
    return bathroom(t, { clock: 10 + k * 25 }) + toilet(TX, t, { lid: "closed" }) + man([x, FLOOR - 92 * CM], walkPose(t), t, { mood: "n", flip: true }) + '<g transform="translate(250 60)"><rect x="-56" y="-24" width="112" height="44" rx="10" fill="#14232f" stroke="' + INK + '" stroke-width="2"/><text x="0" y="8" text-anchor="middle" class="tag" style="font-size:24px;fill:#6ee07a">05:00</text></g>' + tag("خمس دقايق بس", 420, 120, u, .4, -3, 22);
  });
  shot(24, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) { return bathroom(t, {}) + toilet(TX, t, { lid: "closed" }) + man([TX - 120, FLOOR - 92 * CM], { torso: 0, head: 0, sh: 160 + 15 * Math.sin(t * 6), el: 20, sh2: -4, el2: 6 }, t, { mood: "n" }) + tag("قولولنا!", 330, 70, u, .3, -3, 26); });

  window.__parts = { man: man, toilet: toilet, phone: phone, bathroom: bathroom, plume: plume, bug: bug, tag: tag, sitter: sitter, anatomy: anatomy };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
