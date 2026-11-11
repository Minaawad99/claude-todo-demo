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
  function bug(x, y, sc, t, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 3) * 25 + hash(Math.floor(x)) * 180) + ') scale(' + sc + ')"><path d="M-9 0 q-5 ' + f(Math.sin(t * 12) * 4) + ' -10 0 M-9 2 q-5 ' + f(-Math.sin(t * 12) * 4) + ' -10 2" stroke="#2f6a1f" stroke-width="1.2" fill="none"/><rect x="-9" y="-4" width="18" height="8" rx="4" fill="' + (col || "#7cc04f") + '" stroke="#2f6a1f" stroke-width="1.4"/><circle cx="-3" cy="-1" r="1" fill="#2f6a1f"/><circle cx="3" cy="1" r="1" fill="#2f6a1f"/></g>'; }
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
