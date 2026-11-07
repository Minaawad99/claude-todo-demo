/* «إزاي الغواصة بتنزل وتطلع؟» — cartoon panels in the reference look, redrawn every frame (shared helpers from the helicopter episode).
   Every panel keeps three layers moving at once: the camera (slow push / pan, never parked), the subject
   (rotor always turning, the helicopter bobbing, the pilot blinking and reacting) and the background
   (clouds, birds, traffic, flickering windows, stars), with parallax between the layers.
   World units: the panel is 640×360. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.15 * ease(u / 0.22); if (u < 0.36) return lerp(1.15, 1, (u - 0.22) / 0.14); return 1; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }

  // ── backgrounds ─────────────────────────────────────────
  function sky(kind) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-' + kind + ')"/>'; }
  function sun(x, y, r, col) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.8) + '" fill="' + col + '" opacity=".45" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>'; }
  function moon(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="34" fill="#f2efe0" opacity=".22" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="20" fill="#f4f1e4"/><circle cx="' + (x + 8) + '" cy="' + (y - 6) + '" r="18" fill="#1a2c4c"/>'; }
  function clouds(t, speed, y, n, op, sc) {
    var s = "", W = 1100; sc = sc || 1;
    for (var i = 0; i < n; i++) {
      var x = ((hash(i + y) * W + t * speed) % W) - 230, yy = y + hash(i * 3 + y) * 40, w = (60 + hash(i * 7) * 70) * sc;
      s += '<g filter="url(#soft)" fill="#fff" opacity="' + op + '"><ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * 0.22) + '"/><ellipse cx="' + f(x + w * 0.3) + '" cy="' + f(yy - w * 0.12) + '" rx="' + f(w * 0.5) + '" ry="' + f(w * 0.28) + '"/></g>';
    }
    return s;
  }
  function stars(t) { var s = ""; for (var i = 0; i < 60; i++) { var tw = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.8 + hash(i) * 2) + i)); s += '<circle cx="' + f(-200 + hash(i) * 1040) + '" cy="' + f(-120 + hash(i + 9) * 300) + '" r="' + f(0.6 + hash(i + 4) * 1.2) + '" fill="#fff" opacity="' + tw.toFixed(2) + '"/>'; } return s; }
  function birds(t, y0, sp) { var s = ""; for (var i = 0; i < 4; i++) { var x = ((t * sp + i * 90 + hash(i) * 60) % 1000) - 200, y = y0 + i * 9 + Math.sin(t * 2 + i) * 4, w = Math.sin(t * 9 + i * 2) * 4; s += '<path d="M' + f(x - 7) + ' ' + f(y - w) + ' Q' + f(x - 3) + ' ' + f(y - 2) + ' ' + f(x) + ' ' + f(y) + ' Q' + f(x + 3) + ' ' + f(y - 2) + ' ' + f(x + 7) + ' ' + f(y - w) + '" stroke="#3a3530" stroke-width="1.4" fill="none"/>'; } return s; }
  // a skyline strip; windows blink on and off over time
  function city(t, y, h, col, win, seed, night) {
    var s = '<path d="M-400 ' + (y + 400) + ' V' + y, x = -400, rects = "";
    while (x < 1040) { var w = 30 + hash(x + seed) * 50, hh = h * (0.4 + hash(x * 1.7 + seed) * 0.6); s += " V" + f(y - hh) + " H" + f(x + w) + " V" + y;
      if (win) for (var wy = y - hh + 8; wy < y - 6; wy += 13) for (var wx = x + 6; wx < x + w - 8; wx += 12) { var k = Math.floor(wx * 3 + wy * 7 + seed), on = hash(k + Math.floor(t * 0.7 + hash(k) * 5)) > (night ? 0.45 : 0.75); if (on) rects += '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="5" height="7" fill="' + win + '" opacity="' + (night ? 0.85 : 0.6) + '"/>'; }
      x += w; }
    return s + " H1040 V" + (y + 400) + ' Z" fill="' + col + '"/>' + rects;
  }
  function grass(t, y, col1, col2) {
    var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#' + col1 + ')"/>';
    for (var i = 0; i < 90; i++) { var x = -300 + i * 13 + hash(i) * 8, sw = Math.sin(t * 2.2 + i * 0.7) * 3, yy = y + 6 + hash(i + 2) * 60; s += '<path d="M' + f(x) + ' ' + f(yy) + ' q' + f(sw) + ' -6 ' + f(sw * 1.6) + ' -10" stroke="' + col2 + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }
    return s;
  }
  function cars(t, y, sp) { var s = ""; for (var i = 0; i < 5; i++) { var x = ((t * sp * (i % 2 ? 1 : -0.8) + i * 230) % 1300 + 1300) % 1300 - 330; s += '<g transform="translate(' + f(x) + ' ' + y + ')"><rect x="-14" y="-8" width="28" height="9" rx="3" fill="' + ["#2f6f9f", "#e2b035", "#8f2618", "#f4f1e8", "#4f8f5a"][i] + '" stroke="#1c1c1c"/><rect x="-8" y="-13" width="15" height="6" rx="2" fill="#cfe1ec" stroke="#1c1c1c"/><circle cx="-8" cy="2" r="3" fill="#1c1c1c"/><circle cx="8" cy="2" r="3" fill="#1c1c1c"/></g>'; } return s; }

  // ── the pilot ───────────────────────────────────────────
  function eyes(mood, t, r) {
    var blink = ((t * 0.55 + 0.3) % 1) < 0.05, k = r / 13, s = "";
    if (blink && mood !== "dizzy" && mood !== "shock") return '<path d="M' + f(-6 * k) + ' 0 h' + f(4 * k) + ' M' + f(2 * k) + ' 0 h' + f(4 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
    if (mood === "happy") return '<path d="M' + f(-7 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" fill="none" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(6 * k) + ' q' + f(4 * k) + ' ' + f(4 * k) + ' ' + f(8 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.6 * k) + '" fill="none"/>';
    if (mood === "shock") return '<circle cx="' + f(-4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '"/><circle cx="' + f(4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '"/><ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(2.4 * k) + '" ry="' + f(3.2 * k) + '" fill="#1c1c1c"/>';
    if (mood === "dizzy") { for (var e = -1; e <= 1; e += 2) { var p = "M" + f(e * 4 * k) + " " + f(-1 * k); for (var a = 0; a < 12; a++) { var ang = a * 0.9 + t * 8 * e, rr = a * 0.28 * k; p += " L" + f(e * 4 * k + Math.cos(ang) * rr) + " " + f(-1 * k + Math.sin(ang) * rr); } s += '<path d="' + p + '" stroke="#1c1c1c" stroke-width="' + f(1.1 * k) + '" fill="none"/>'; } return s + '<path d="M' + f(-4 * k) + ' ' + f(7 * k) + ' q' + f(2 * k) + ' ' + f(-2 * k) + ' ' + f(4 * k) + ' 0 q' + f(2 * k) + ' ' + f(2 * k) + ' ' + f(4 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" fill="none"/>'; }
    if (mood === "curious") return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-4 * k) + ' v' + f(6 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(1 * k) + ' ' + f(-9 * k) + ' l' + f(6 * k) + ' ' + f(-2 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" stroke-linecap="round"/>';
    if (mood === "worry") return '<path d="M' + f(-4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + ' M' + f(4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(-7 * k) + ' ' + f(-7 * k) + ' l' + f(5 * k) + ' ' + f(2 * k) + ' M' + f(7 * k) + ' ' + f(-7 * k) + ' l' + f(-5 * k) + ' ' + f(2 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.3 * k) + '" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(8 * k) + ' q' + f(4 * k) + ' ' + f(-3 * k) + ' ' + f(8 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" fill="none"/>';
    return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
  }
  function head(x, y, r, mood, t, look) { return '<g transform="translate(' + f(x + (look || 0) * r * 0.12) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/><g transform="translate(' + f((look || 0) * r * 0.2) + ' 0)">' + eyes(mood, t, r) + '</g></g>'; }
  // the pilot up close in the cockpit, hand on a lever: lever = {kind:"collective"|"cyclic", v:-1..1}
  function pilotBig(x, y, t, mood, lever, look) {
    var s = '<g transform="translate(' + x + ' ' + f(y + Math.sin(t * 3.1) * 2.5) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ')">';
    s += '<path d="M-70 150 C-74 60 -46 34 0 34 C46 34 74 60 70 150 Z" fill="#3f6f8f" stroke="#1c1c1c" stroke-width="3"/><path d="M-18 36 L0 64 L18 36" fill="#2f5873" stroke="#1c1c1c" stroke-width="2"/>';
    s += '<path d="M-40 -60 C-40 -96 40 -96 40 -60" fill="none" stroke="#2b2b2b" stroke-width="9"/><rect x="-52" y="-64" width="16" height="28" rx="6" fill="#2b2b2b"/><rect x="36" y="-64" width="16" height="28" rx="6" fill="#2b2b2b"/>';
    s += head(0, -40, 44, mood, t, look);
    if (lever) {
      var v = lever.v, lx, ly, hx, hy;
      if (lever.kind === "collective") { lx = -100; ly = 140; hx = lx - 18 - 30 * v * 0; hy = ly - 70 - 26 * v; s += '<path d="M' + lx + ' ' + ly + ' L' + (lx - 18) + ' ' + f(hy) + '" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/><rect x="' + (lx - 30) + '" y="' + f(hy - 10) + '" width="26" height="16" rx="5" fill="#1c1c1c"/>'; hx = lx - 18; }
      else { lx = 0; ly = 150; hx = lx + 50 * v; hy = 70; s += '<path d="M' + lx + ' ' + ly + ' L' + f(hx) + ' ' + hy + '" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/><rect x="' + f(hx - 9) + '" y="' + (hy - 22) + '" width="18" height="26" rx="6" fill="#1c1c1c"/>'; }
      var sx = lever.kind === "collective" ? -54 : 40, sy = 56;
      s += '<path d="M' + sx + ' ' + sy + ' Q' + f((sx + hx) / 2 - 20) + ' ' + f((sy + hy) / 2 + 26) + ' ' + f(hx) + ' ' + f(hy) + '" stroke="#3f6f8f" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="11" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>';
    }
    return s + '</g>';
  }

  // ── the helicopter ──────────────────────────────────────
  // side view; ph = rotor phase, o: {tilt, mood, smoke, warn, s, noTail, pitchy}
  function heli(x, y, t, ph, o) {
    o = o || {}; var sc = o.s || 1, tilt = o.tilt || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(tilt) + ') scale(' + sc + ')">';
    s += '<use href="#heliBody"/>';
    s += '<g transform="translate(-36 -14) scale(.62)">' + '<path d="M-14 34 C-16 18 -8 12 0 12 C8 12 16 18 14 34 Z" fill="#3f6f8f" stroke="#1c1c1c" stroke-width="1.4"/>' + head(0, 0, 13, o.mood || "n", t, o.look) + '</g>';
    s += '<use href="#heliGlass"/>';
    // tail rotor (seen face-on, spinning fast)
    if (!o.noTail) { var ta = ph * 4.3; s += '<circle cx="160" cy="-10" r="12" fill="#2a2a2a" opacity=".12"/><path d="M' + f(160 + Math.cos(ta) * 12) + ' ' + f(-10 + Math.sin(ta) * 12) + ' L' + f(160 - Math.cos(ta) * 12) + ' ' + f(-10 - Math.sin(ta) * 12) + '" stroke="#1c1c1c" stroke-width="2.6" stroke-linecap="round"/><circle cx="160" cy="-10" r="2.4" fill="#1c1c1c"/>'; }
    // main rotor seen from the side: blades sweep, their length foreshortens with the phase
    var R = 150, c1 = Math.cos(ph), s1 = Math.sin(ph);
    s += '<ellipse cx="0" cy="-66" rx="' + R + '" ry="9" fill="#2a2a2a" opacity=".13"/>';
    s += '<path d="M' + f(-R * c1) + ' ' + f(-66 - 7 * s1) + ' L' + f(R * c1) + ' ' + f(-66 + 7 * s1) + '" stroke="#1c1c1c" stroke-width="3.4" stroke-linecap="round"/>';
    s += '<path d="M' + f(-R * s1) + ' ' + f(-66 + 7 * c1) + ' L' + f(R * s1) + ' ' + f(-66 - 7 * c1) + '" stroke="#1c1c1c" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>';
    s += '<rect x="-5" y="-70" width="10" height="7" rx="2" fill="#1c1c1c"/>';
    if (o.warn) s += '<circle cx="-2" cy="-60" r="7" fill="#ff3b2f" filter="url(#glow)" opacity="' + (Math.sin(t * 10) > 0 ? 1 : 0.2) + '"/><circle cx="-2" cy="-60" r="2.6" fill="#ff8a7e"/>';
    s += '</g>';
    if (o.smoke) for (var k = 0; k < 6; k++) { var u = ((t * 0.5 + k / 6) % 1); s += '<circle cx="' + f(x + 20 * sc + u * 90 * sc) + '" cy="' + f(y - 50 * sc - u * 110 * sc) + '" r="' + f((10 + u * 26) * sc) + '" fill="#6b6f78" opacity="' + f(0.65 * (1 - u)) + '" filter="url(#soft)"/>'; }
    return s;
  }
  // top-down view: ang = body heading (deg), ph = rotor phase
  function heliTop(x, y, t, ang, ph, o) {
    o = o || {}; var sc = o.s || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + sc + ')">';
    s += '<ellipse cx="4" cy="8" rx="64" ry="34" fill="#1c1c1c" opacity=".15" filter="url(#soft2)"/>';
    s += '<path d="M40 -6 L160 -3 L160 3 L40 6 Z" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.6"/><path d="M150 -20 L170 -20 L170 20 L150 20 Z" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.4"/>';
    s += '<ellipse cx="0" cy="0" rx="62" ry="32" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.8"/><path d="M-60 0 C-60 -22 -40 -30 -22 -30 L-22 30 C-40 30 -60 22 -60 0 Z" fill="url(#gGlass)" stroke="#1c1c1c" stroke-width="1.4"/>';
    if (!o.noTail) { var ta = ph * 4.3; s += '<path d="M160 ' + f(-14 * Math.cos(ta)) + ' L160 ' + f(14 * Math.cos(ta)) + '" stroke="#1c1c1c" stroke-width="3" stroke-linecap="round"/><path d="M170 -3 L176 0 L170 3" fill="#1c1c1c"/>'; }
    s += '<circle r="140" fill="#2a2a2a" opacity=".1"/><circle r="140" fill="none" stroke="#1c1c1c" stroke-width=".8" opacity=".25" stroke-dasharray="4 6"/>';
    for (var b = 0; b < 2; b++) { var a = ph + b * Math.PI; s += '<path d="M0 0 L' + f(Math.cos(a) * 140) + ' ' + f(Math.sin(a) * 140) + '" stroke="#1c1c1c" stroke-width="6" stroke-linecap="round"/>'; for (var g = 1; g < 4; g++) { var ga = a - g * 0.09; s += '<path d="M0 0 L' + f(Math.cos(ga) * 140) + ' ' + f(Math.sin(ga) * 140) + '" stroke="#1c1c1c" stroke-width="5" opacity="' + (0.2 - g * 0.05) + '" stroke-linecap="round"/>'; } }
    s += '<circle r="9" fill="#3a3d42" stroke="#1c1c1c" stroke-width="1.4"/></g>';
    return s;
  }

  // ── explainer marks ─────────────────────────────────────
  function arrow(x1, y1, x2, y2, col, w, p) {
    p = clamp(p == null ? 1 : p); if (p <= 0) return "";
    var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = w * 2.6;
    var hd = 'M' + f(xe + Math.cos(a) * h * 0.4) + ' ' + f(ye + Math.sin(a) * h * 0.4) + ' L' + f(xe - Math.cos(a - 0.5) * h) + ' ' + f(ye - Math.sin(a - 0.5) * h) + ' L' + f(xe - Math.cos(a + 0.5) * h) + ' ' + f(ye - Math.sin(a + 0.5) * h) + ' Z';
    return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.5) + ' ' + f(ye - Math.sin(a) * h * 0.5) + '" stroke="#1c1c1c" stroke-width="' + (w + 3) + '" stroke-linecap="round"/><path d="' + hd + '" fill="#1c1c1c" stroke="#1c1c1c" stroke-width="3" stroke-linejoin="round"/>' +
           '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.5) + ' ' + f(ye - Math.sin(a) * h * 0.5) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/><path d="' + hd + '" fill="' + col + '"/>';
  }
  function curl(cx, cy, r, a0, a1, col, w, p) {   // curved arrow along a circle
    p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var a = lerp(a0, a1, p), d = "M" + f(cx + Math.cos(a0) * r) + " " + f(cy + Math.sin(a0) * r * 0.45);
    for (var i = 1; i <= 24; i++) { var aa = lerp(a0, a, i / 24); d += " L" + f(cx + Math.cos(aa) * r) + " " + f(cy + Math.sin(aa) * r * 0.45); }
    var ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * 0.45, ta = Math.atan2(Math.cos(a) * r * 0.45 * Math.sign(a1 - a0), -Math.sin(a) * r * Math.sign(a1 - a0)), h = w * 2.4;
    var hd = 'M' + f(ex + Math.cos(ta) * h * 0.6) + ' ' + f(ey + Math.sin(ta) * h * 0.6) + ' L' + f(ex - Math.cos(ta - 0.55) * h) + ' ' + f(ey - Math.sin(ta - 0.55) * h) + ' L' + f(ex - Math.cos(ta + 0.55) * h) + ' ' + f(ey - Math.sin(ta + 0.55) * h) + ' Z';
    return '<path d="' + d + '" stroke="#1c1c1c" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/><path d="' + hd + '" fill="' + col + '" stroke="#1c1c1c" stroke-width="2"/>';
  }
  // brush-swash label that pops in at time u0 of the shot
  function tag(text, x, y, u, u0, rot, size, col) {
    var k = pop((u - u0) / 1.2); if (k <= 0) return ""; size = size || 23; var w = text.length * size * 0.52 + 40;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + (rot || -3) + ') scale(' + k.toFixed(3) + ')"><use href="#swash" fill="' + (col || "#e8c48e") + '" transform="translate(' + f(-w / 2) + ' ' + f(-size * 1.05) + ') scale(' + f(w / 220) + ' ' + f(size * 0.072) + ')"/><text x="0" y="' + f(size * 0.35) + '" text-anchor="middle" class="tag" style="font-size:' + size + 'px">' + text + '</text></g>';
  }
  function airflow(t, x0, x1, y, n, col, sp, wav) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), x = lerp(x0, x1, u), yy = y + (i % 3 - 1) * 14 + Math.sin(u * 6 + i) * (wav || 0); s += '<path d="M' + f(x) + ' ' + f(yy) + ' h' + f(40) + '" stroke="' + (col || "#fff") + '" stroke-width="2.4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.9) + '"/>'; } return s; }
  function downwash(t, cx, y0, y1, n, col, sp, up) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1); if (up) u = 1 - u; var x = cx + (i / (n - 1) - 0.5) * 240 * (1 + u * 0.3), y = lerp(y0, y1, u); s += '<path d="M' + f(x) + ' ' + f(y) + ' v' + (up ? -18 : 18) + '" stroke="' + (col || "#5d93ad") + '" stroke-width="3" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.9) + '"/>'; } return s; }
  function airfoil(x, y, sc, ang, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-ang) + ') scale(' + sc + ')"><path d="M-60 0 C-60 -12 -40 -18 -10 -16 C20 -14 50 -6 64 0 C50 3 20 6 -10 7 C-40 8 -60 6 -60 0 Z" fill="' + (col || "#c23a26") + '" stroke="#1c1c1c" stroke-width="2"/><path d="M-50 -8 C-30 -14 0 -13 30 -8" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/></g>'; }
  function gauge(x, y, r, v, label) { var a = -2.4 + 4.8 * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#555" stroke-width="2"/><circle r="' + (r - 4) + '" fill="#2b2f34"/><path d="M0 0 L' + f(Math.sin(a) * (r - 8)) + ' ' + f(-Math.cos(a) * (r - 8)) + '" stroke="#f2c230" stroke-width="2.4" stroke-linecap="round"/><circle r="2.6" fill="#f2c230"/>' + (label ? '<text y="' + (r + 14) + '" text-anchor="middle" style="font:700 11px Noto Sans Arabic;fill:#e9e4d8">' + label + '</text>' : "") + '</g>'; }
  function cockpit(t) {   // the inside of the cockpit: dash, gauges, a windscreen with a moving sky
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a2f36"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40 L700 160 L-60 160 Z" fill="url(#sky-day)"/>' + clouds(t, 60, 10, 4, 0.9) + '<path d="M-60 160 V120 C140 90 500 90 700 120 V160 Z" fill="#8fb069"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40" stroke="#1c1c1c" stroke-width="14" fill="none"/><path d="M320 -100 V160" stroke="#1c1c1c" stroke-width="10"/>';
    s += '<path d="M-100 160 H740 V400 H-100 Z" fill="#3a3f46"/><path d="M-100 160 H740" stroke="#1c1c1c" stroke-width="4"/>';
    s += gauge(120, 210, 24, 0.5 + 0.08 * Math.sin(t * 1.3), "") + gauge(190, 214, 20, 0.62, "") + gauge(450, 214, 20, 0.3 + 0.2 * Math.sin(t * 0.8), "") + gauge(520, 210, 24, 0.72 + 0.03 * Math.sin(t * 5), "");
    for (var i = 0; i < 6; i++) s += '<circle cx="' + (260 + i * 22) + '" cy="196" r="4" fill="' + (hash(i + Math.floor(t * 2)) > 0.5 ? "#5bbf6a" : "#2b2f34") + '"/>';
    return s;
  }

  // ── pieces shared with the pregnancy episode (videos/pregnancy/cartoon/shots.js) ──
  var INK = "#1c1c1c", CLIPN = 0;
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function bgc(c) { return '<rect x="-400" y="-300" width="1440" height="960" fill="' + c + '"/>'; }
  function limb(x1, y1, x2, y2, w, col) { var d = 'M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3.2) + '" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; }
  function limbQ(x1, y1, cx, cy, x2, y2, w, col) { var d = 'M' + f(x1) + ' ' + f(y1) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(x2) + ' ' + f(y2); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3.2) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>'; }
  function bz(p, k) { var q = 1 - k; return [q * q * q * p[0] + 3 * q * q * k * p[2] + 3 * q * k * k * p[4] + k * k * k * p[6], q * q * q * p[1] + 3 * q * q * k * p[3] + 3 * q * k * k * p[5] + k * k * k * p[7]]; }
  function big(text, x, y, size, col, u, u0) { var k = u == null ? 1 : pop((u - u0) / 1.0); if (k <= 0) return ""; return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ') translate(' + f(-x) + ' ' + f(-y) + ')" style="font:900 ' + size + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:#1c1c1c;stroke-width:' + f(size / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function popIn(svg, x, y, u, u0) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ') translate(' + f(-x) + ' ' + f(-y) + ')">' + svg + '</g>'; }
  function badge(n, x, y, u, u0) {   // the stage badge: a numbered disc with «المرحلة»
    var k = pop((u - u0) / 1.0); if (k <= 0) return "";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><rect x="-74" y="-22" width="148" height="44" rx="22" fill="#2b2016" stroke="#f2c230" stroke-width="3"/><circle cx="52" cy="0" r="17" fill="#f2c230"/><text x="52" y="8" text-anchor="middle" style="font:900 22px Noto Sans Arabic;fill:#2b2016">' + n + '</text><text x="-12" y="8" text-anchor="middle" style="font:800 19px Noto Sans Arabic;fill:#fff">المرحلة</text></g>';
  }

  function face(x, y, r, mood, t, look) {
    if (mood !== "sleep" && mood !== "cry") return head(x, y, r, mood, t, look);
    var k = r / 13, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/>';
    s += '<path d="M' + f(-7 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * k) + '" fill="none" stroke-linecap="round"/>';
    if (mood === "sleep") { var y2 = 1 + 0.35 * Math.sin(t * 2); s += '<ellipse cx="' + f(0.5 * k) + '" cy="' + f(7 * k) + '" rx="' + f(2.2 * k * y2) + '" ry="' + f(2.8 * k * y2) + '" fill="' + INK + '"/>'; }
    else { var o2 = 1 + 0.3 * Math.abs(Math.sin(t * 7)); s += '<ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(3.6 * k) + '" ry="' + f(2.8 * k * o2) + '" fill="' + INK + '"/>'; for (var e = -1; e <= 1; e += 2) { var tu = (t * 1.6 + (e + 1) * 0.3) % 1; s += '<circle cx="' + f(e * 6 * k) + '" cy="' + f(2 * k + tu * 9 * k) + '" r="' + f(1.4 * k) + '" fill="#7cc8f2" opacity="' + f(1 - tu) + '"/>'; } }
    return s + '</g>';
  }
  function sparkles(x, y, t, n, R) { var s = ""; for (var i = 0; i < (n || 5); i++) { var a = i * 1.26 + t * 0.6, r = (R || 50) * (0.7 + 0.3 * Math.sin(t * 2 + i)), k = 0.5 + 0.5 * Math.sin(t * 5 + i * 2), sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.8, z = 7 * k; s += '<path d="M' + f(sx) + ' ' + f(sy - z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx + z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy + z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx - z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy - z) + ' Z" fill="#f2c230"/>'; } return s; }
  function zzz(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var u = (t * 0.5 + i / 3) % 1; s += '<text x="' + f(x + u * 40 + Math.sin(u * 6) * 6) + '" y="' + f(y - u * 70) + '" style="font:900 ' + f(14 + u * 14) + 'px Noto Serif;fill:#3a5a9a;stroke:#fff;stroke-width:3;paint-order:stroke" opacity="' + f(Math.sin(Math.PI * u)) + '">Z</text>'; } return s; }
  function waves(x, y, t, ang, n, col) { var s = ""; for (var i = 0; i < (n || 4); i++) { var u = (t * 0.9 + i / (n || 4)) % 1, r = 14 + u * 70; s += '<path d="M' + f(x + Math.cos(ang - 0.5) * r) + ' ' + f(y + Math.sin(ang - 0.5) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(ang + 0.5) * r) + ' ' + f(y + Math.sin(ang + 0.5) * r) + '" stroke="' + (col || "#f2c230") + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; } return s; }
  function brain(x, y, sc, t, fold) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')">';
    s += '<path d="M28 44 C30 70 34 90 44 104 H58 C52 88 50 66 52 46 Z" fill="#e8a2a8" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M40 40 C44 64 96 70 104 50 C110 34 90 22 70 24 Z" fill="#e392a0" stroke="' + INK + '" stroke-width="2"/>'; for (var c = 0; c < 5; c++) s += '<path d="M' + (52 + c * 3) + ' ' + (36 + c * 6) + ' Q' + (76) + ' ' + (30 + c * 7) + ' ' + (100 - c * 2) + ' ' + (42 + c * 4) + '" stroke="#b8606e" stroke-width="1.2" fill="none"/>';
    var d = "M-96 14 C-104 -48 -44 -92 18 -86 C82 -82 116 -40 104 14 C98 40 74 46 50 40 C30 50 -6 52 -30 46 C-62 52 -92 42 -96 14 Z";
    s += '<path d="' + d + '" fill="url(#gBrain)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-60 6 C-20 -6 20 -4 60 -26" stroke="#b8606e" stroke-width="' + f(1.6 + 1.6 * fold) + '" fill="none"/>';
    var n = Math.floor(fold * 22);
    for (var i = 0; i < n; i++) { var x0 = -84 + hash(i) * 168, y0 = -70 + hash(i + 11) * 100, L = 18 + hash(i + 3) * 24, a = hash(i + 7) * 3.14, dd = "M" + f(x0) + " " + f(y0); for (var j = 1; j <= 6; j++) dd += " L" + f(x0 + Math.cos(a) * L * j / 6 + Math.sin(j * 1.9 + i) * 4) + " " + f(y0 + Math.sin(a) * L * j / 6 + Math.cos(j * 1.7 + i) * 4); s += '<path d="' + dd + '" stroke="#b8606e" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="' + f(clamp(fold * 22 - i)) + '"/>'; }
    for (var p = 0; p < 6; p++) { var u = (t * 0.8 + p / 6) % 1, a2 = hash(p) * 6.28; s += '<circle cx="' + f(Math.cos(a2) * 70 * u) + '" cy="' + f(-20 + Math.sin(a2) * 44 * u) + '" r="2.6" fill="#fff6a0" opacity="' + f(1 - u) + '"/>'; }
    return s + '<ellipse cx="-40" cy="-50" rx="26" ry="12" fill="#fff" opacity=".3" transform="rotate(-20 -40 -50)"/></g>';
  }
  // ── new pieces for this episode: the bathroom, a wall-hung tankless gas heater with its flue, molecules, red blood cells ──
  // (the heater follows the common white instantaneous heaters sold in Egypt: a white casing, a round flame window, two knobs,
  // cold / gas / hot pipes underneath and a round flue on top; see ../refs/SOURCES.md)
  var COLD = "#3f8fd0", HOT = "#e0522a", GASY = "#e2b035";
  function rr(x, y, w, h, fill, sw, r) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + (r || 4) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 2) + '"/>'; }
  function mixc(a, b, k) { var p = function (c, i) { return parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); }; var o = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), clamp(k))); o += (v < 16 ? "0" : "") + v.toString(16); } return o; }

  // the bathroom wall-on: tiles, floor, a door that opens (o.door = {x, open}), a window (o.win = {x, open, snow}), an exhaust fan,
  // a shower with a curtain, steam, and o.co = a reddish haze that shows the gas nobody can see
  function bath(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#dcecef"/>';
    for (var y = -280; y < 300; y += 30) for (var x = -400 + ((Math.floor(y / 30) % 2) ? 15 : 0); x < 1040; x += 30) s += '<rect x="' + x + '" y="' + y + '" width="29" height="29" fill="#d2e6ea" stroke="#bcd6db" stroke-width="1"/>';
    s += '<rect x="-400" y="300" width="1440" height="400" fill="#a9b8bd"/>'; for (var fx = -400; fx < 1040; fx += 60) s += '<path d="M' + fx + ' 300 L' + (fx - 30) + ' 420" stroke="#93a3a8" stroke-width="1.6"/>'; s += '<path d="M-400 300 H1040" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.win) { var w = o.win, wx = w.x, op = clamp(w.open || 0); s += '<rect x="' + (wx - 56) + '" y="40" width="112" height="86" fill="' + (w.snow ? "#c9dcea" : "#bfe3f5") + '"/>';
      if (w.snow) for (var k = 0; k < 16; k++) { var sy = 40 + ((t * 26 + k * 19) % 86), sx = wx - 52 + ((hash(k) * 104 + Math.sin(t + k) * 6) % 104); s += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="2.4" fill="#fff"/>'; }
      else for (var c = 0; c < 2; c++) { var cx = wx - 40 + ((t * 8 + c * 50) % 80); s += '<ellipse cx="' + f(cx) + '" cy="' + (64 + c * 28) + '" rx="12" ry="5" fill="#fff"/>'; }
      var sw = 56 * (1 - op); s += '<rect x="' + (wx - 56) + '" y="40" width="' + f(sw) + '" height="86" fill="#cfe6f2" fill-opacity=".55" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(wx + 56 - sw) + '" y="40" width="' + f(sw) + '" height="86" fill="#cfe6f2" fill-opacity=".55" stroke="' + INK + '" stroke-width="2"/>';
      s += '<rect x="' + (wx - 56) + '" y="40" width="112" height="86" fill="none" stroke="#f4f4f2" stroke-width="7"/><rect x="' + (wx - 60) + '" y="36" width="120" height="94" fill="none" stroke="' + INK + '" stroke-width="2"/>'; }
    if (o.fan) { var fa = o.fan, fr = 24, a0 = fa.on ? t * 720 : 0; s += '<circle cx="' + fa.x + '" cy="' + fa.y + '" r="' + (fr + 6) + '" fill="#f4f4f2" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + fa.x + '" cy="' + fa.y + '" r="' + fr + '" fill="#3a3f46"/>';
      for (var b = 0; b < 5; b++) { var ba = (a0 + b * 72) * Math.PI / 180; s += '<path d="M' + fa.x + ' ' + fa.y + ' Q' + f(fa.x + Math.cos(ba + 0.5) * fr * 0.7) + ' ' + f(fa.y + Math.sin(ba + 0.5) * fr * 0.7) + ' ' + f(fa.x + Math.cos(ba) * fr * 0.95) + ' ' + f(fa.y + Math.sin(ba) * fr * 0.95) + ' Z" fill="#c9ced4" opacity="' + (fa.on ? 0.55 : 1) + '"/>'; }
      for (var g = 0; g < 7; g++) s += '<path d="M' + (fa.x - fr) + ' ' + (fa.y - fr + 4 + g * 7) + ' H' + (fa.x + fr) + '" stroke="#f4f4f2" stroke-width="2.4"/>'; }
    if (o.door) { var dr = o.door, dx = dr.x, oa = clamp(dr.open || 0); s += '<rect x="' + (dx - 52) + '" y="96" width="104" height="204" fill="#4a3a2e"/>';
      if (oa > 0) s += '<rect x="' + (dx - 50) + '" y="98" width="100" height="202" fill="#f6dfa8" opacity="' + f(0.8 * oa) + '"/><path d="M' + (dx - 50) + ' 300 L' + (dx + 50) + ' 300 L' + (dx + 120) + ' 360 L' + (dx - 120) + ' 360 Z" fill="#f6dfa8" opacity="' + f(0.35 * oa) + '"/>';
      var dw = 100 * (1 - 0.82 * oa); s += '<path d="M' + (dx - 50) + ' 98 L' + f(dx - 50 + dw) + ' ' + f(98 - 14 * oa) + ' L' + f(dx - 50 + dw) + ' ' + f(300 + 14 * oa) + ' L' + (dx - 50) + ' 300 Z" fill="url(#gDoor)" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<rect x="' + f(dx - 40 + dw * 0.1) + '" y="114" width="' + f(dw * 0.72) + '" height="70" fill="none" stroke="#9a7048" stroke-width="2"/><rect x="' + f(dx - 40 + dw * 0.1) + '" y="200" width="' + f(dw * 0.72) + '" height="84" fill="none" stroke="#9a7048" stroke-width="2"/><circle cx="' + f(dx - 50 + dw * 0.86) + '" cy="200" r="5" fill="#d9a53a" stroke="' + INK + '" stroke-width="1.4"/>';
      s += '<rect x="' + (dx - 56) + '" y="92" width="112" height="210" fill="none" stroke="#f4f4f2" stroke-width="6"/>'; }
    if (o.shower) { var sh = o.shower, hx = sh.x; s += '<path d="M' + (hx + 60) + ' 300 V40 H' + hx + ' V58" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="M' + (hx + 60) + ' 300 V40 H' + hx + ' V58" stroke="#c9ced4" stroke-width="5" fill="none"/><path d="M' + (hx - 22) + ' 58 H' + (hx + 22) + ' L' + (hx + 14) + ' 70 H' + (hx - 14) + ' Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>';
      if (sh.on) for (var d = 0; d < 9; d++) { var u = (t * 2.2 + d / 9) % 1, ddx = (d - 4) * 4 * (1 + u); s += '<path d="M' + f(hx + ddx) + ' ' + f(72 + u * 200) + ' v12" stroke="#9fd0f0" stroke-width="2.4" stroke-linecap="round" opacity="' + f(0.9 - u * 0.5) + '"/>'; }
      if (sh.curtain) { var cl = sh.curtain; s += '<path d="M' + (hx - cl) + ' 30 H' + (hx + cl) + '" stroke="#9aa2ac" stroke-width="5"/>'; var cd = 'M' + (hx - cl) + ' 32 H' + (hx + cl) + ' L' + f(hx + cl + Math.sin(t * 1.4) * 4) + ' 290'; for (var r = 12; r >= 0; r--) cd += ' Q' + f(hx - cl + (r + 0.5) * cl / 6 + Math.sin(t * 1.4) * 4) + ' ' + f(296 + Math.sin(r * 2 + t * 2) * 3) + ' ' + f(hx - cl + r * cl / 6 + Math.sin(t * 1.4) * 4) + ' 290'; s += '<path d="' + cd + ' Z" fill="url(#gCurtain)" stroke="' + INK + '" stroke-width="2"/>'; for (var fo = 1; fo < 12; fo++) s += '<path d="M' + f(hx - cl + fo * cl / 6) + ' 36 L' + f(hx - cl + fo * cl / 6 + Math.sin(t * 1.4) * 4) + ' 290" stroke="#d898b0" stroke-width="1.4" opacity=".7"/>'; }
    }
    if (o.steam) for (var st = 0; st < 8; st++) { var su = (t * 0.25 + st / 8) % 1, sx2 = (o.steamX || 320) + Math.sin(st * 2.3 + t * 0.6) * 140, sy2 = 290 - su * 300; s += '<circle cx="' + f(sx2) + '" cy="' + f(sy2) + '" r="' + f(30 + su * 50) + '" fill="#fff" opacity="' + f(o.steam * 0.32 * Math.sin(Math.PI * su)) + '" filter="url(#soft)"/>'; }
    return s;
  }
  function coHaze(t, k, cx, cy) { if (!k) return ""; var s = ""; for (var i = 0; i < 7; i++) { var a = t * 0.3 + i * 0.9, x = (cx || 320) + Math.cos(a) * 220 * (0.4 + hash(i) * 0.6), y = (cy || 160) + Math.sin(a * 1.3) * 110 * (0.4 + hash(i + 3) * 0.6); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(90 + hash(i + 5) * 70) + '" fill="url(#gCO)" opacity="' + f(k) + '"/>'; } return s; }

  // the flame in the heater's window: blue when it gets enough air, yellow-orange and lazy when it doesn't (yel 0..1)
  function flameB(x, y, sz, t, yel) {
    var s = "", n = 6; yel = clamp(yel || 0);
    var outer = mixc("#3f7fff", "#ff9a1a", yel), inner = mixc("#bfe0ff", "#ffe27a", yel);
    if (yel > 0.2) s += '<circle cx="' + f(x) + '" cy="' + f(y - sz * 1.4) + '" r="' + f(sz * 3.2) + '" fill="#ffb020" opacity="' + f(0.3 * yel) + '" filter="url(#soft)"/>';
    for (var i = 0; i < n; i++) { var dx = (i - (n - 1) / 2) * sz * 0.5, h = sz * (1.2 + yel * 1.4 + Math.sin(t * (13 - yel * 6) + i * 1.7) * (0.18 + 0.35 * yel)), w = sz * (0.22 + 0.12 * yel), sway = Math.sin(t * (9 - 5 * yel) + i) * w * (0.6 + yel);
      s += '<path d="M' + f(x + dx - w) + ' ' + f(y) + ' Q' + f(x + dx - w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + sway) + ' ' + f(y - h) + ' Q' + f(x + dx + w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + w) + ' ' + f(y) + ' Z" fill="' + outer + '" opacity=".92"/>';
      s += '<path d="M' + f(x + dx - w * 0.5) + ' ' + f(y) + ' Q' + f(x + dx) + ' ' + f(y - h * 0.65) + ' ' + f(x + dx + w * 0.5) + ' ' + f(y) + ' Z" fill="' + inner + '"/>'; }
    return s;
  }
  // the wall-hung tankless gas heater; origin = bottom centre, about 120 × 190 at s = 1.
  // o: {on 0..1, yel 0..1, flue: "up"|"wall"|"blocked"|"none", flueLen, soot 0..1, exhaust 0..1 (puffs out of the flue), spill 0..1 (puffs back into the room), air 0..1 (air drawn in), win: big flame window}
  function heater(x, y, sc, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">', on = o.on == null ? 1 : o.on, fl = o.flue || "up", L = o.flueLen || 90;
    s += '<path d="M-36 0 V44 H-90 M36 0 V44 H90" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M-36 0 V44 H-90" stroke="' + COLD + '" stroke-width="7" fill="none"/><path d="M36 0 V44 H90" stroke="' + HOT + '" stroke-width="7" fill="none"/><path d="M0 0 V60" stroke="' + INK + '" stroke-width="12"/><path d="M0 0 V60" stroke="' + GASY + '" stroke-width="7"/>' + rr(-8, 22, 16, 12, "#d9a53a", 1.6, 3);
    if (fl !== "none") { s += '<rect x="-20" y="' + (-190 - L) + '" width="40" height="' + (L + 4) + '" fill="url(#gFlue)" stroke="' + INK + '" stroke-width="2.4"/>'; for (var j = 1; j < L / 30; j++) s += '<path d="M-20 ' + (-190 - j * 30) + ' H20" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/>';
      if (fl === "wall") s += '<rect x="-20" y="' + (-190 - L - 40) + '" width="' + (o.wallX || 200) + '" height="40" fill="url(#gFlueH)" stroke="' + INK + '" stroke-width="2.4"/>';
      if (fl === "blocked") s += '<g transform="translate(0 ' + (-190 - L) + ')"><path d="M-26 6 Q-14 -14 0 -2 Q14 -18 26 6 Z" fill="#6a5a4a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-20 0 l8 -10 M-4 -4 l4 -12 M10 -2 l8 -10" stroke="#8a7458" stroke-width="2"/><circle r="30" fill="none" stroke="#e2523a" stroke-width="5"/><path d="M-21 -21 L21 21" stroke="#e2523a" stroke-width="5"/></g>'; }
    s += '<path d="M-60 -190 H60 Q66 -190 66 -184 V-8 Q66 0 58 0 H-58 Q-66 0 -66 -8 V-184 Q-66 -190 -60 -190 Z" fill="url(#gCase)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-56 -184 H56" stroke="#fff" stroke-width="3" opacity=".8"/><rect x="-52" y="-176" width="104" height="10" rx="3" fill="#d9dcdf"/>'; for (var v = 0; v < 6; v++) s += '<rect x="' + (-40 + v * 14) + '" y="-174" width="8" height="6" rx="2" fill="#9aa2ac"/>';
    var wr = o.win ? 34 : 22; s += '<circle cx="0" cy="-110" r="' + (wr + 6) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/><circle cx="0" cy="-110" r="' + wr + '" fill="#1e1a1a"/>';
    CLIPN++; s += '<clipPath id="hw' + CLIPN + '"><circle cx="0" cy="-110" r="' + wr + '"/></clipPath><g clip-path="url(#hw' + CLIPN + ')">' + (on > 0 ? '<g opacity="' + f(on) + '">' + flameB(0, -110 + wr * 0.62, wr * 0.32, t, o.yel) + '</g>' : '') + '<path d="M' + (-wr) + ' ' + f(-110 + wr * 0.66) + ' H' + wr + '" stroke="#5a6068" stroke-width="4"/></g><path d="M' + f(-wr * 0.6) + ' ' + f(-110 - wr * 0.5) + ' A' + f(wr * 0.8) + ' ' + f(wr * 0.8) + ' 0 0 1 ' + f(wr * 0.1) + ' ' + f(-110 - wr * 0.8) + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/>';
    [-30, 30].forEach(function (kx, i) { s += '<circle cx="' + kx + '" cy="-40" r="15" fill="#f4f4f2" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + kx + ' -40 L' + f(kx + Math.cos(-1.6 + i * 0.8) * 11) + ' ' + f(-40 + Math.sin(-1.6 + i * 0.8) * 11) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; });
    s += '<rect x="-20" y="-72" width="40" height="10" rx="3" fill="#2b2f34"/><circle cx="14" cy="-67" r="2.4" fill="' + (on > 0 ? "#7cf29a" : "#3a4a3a") + '"/>';
    if (o.soot) { var so = o.soot; s += '<path d="M-34 -190 Q-30 -214 -12 -206 Q0 -226 14 -206 Q32 -216 34 -190 Z" fill="#2b2622" opacity="' + f(0.8 * so) + '" filter="url(#soft2)"/><ellipse cx="0" cy="-150" rx="40" ry="16" fill="#3a3430" opacity="' + f(0.45 * so) + '" filter="url(#soft2)"/><ellipse cx="0" cy="-80" rx="30" ry="12" fill="#3a3430" opacity="' + f(0.3 * so) + '" filter="url(#soft2)"/>'; }
    if (o.exhaust && fl !== "none") for (var e = 0; e < 6; e++) { var eu = (t * 0.6 + e / 6) % 1, ex = fl === "wall" ? -20 + (o.wallX || 200) + eu * 70 : Math.sin(eu * 6 + e) * 8, ey = fl === "wall" ? -190 - L - 20 - eu * 30 : -190 - L - eu * 70; s += '<circle cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(8 + eu * 16) + '" fill="#d9dcdf" opacity="' + f(o.exhaust * 0.7 * (1 - eu)) + '" filter="url(#soft2)"/>'; }
    if (o.spill) for (var p = 0; p < 9; p++) { var pu = (t * 0.45 + p / 9) % 1, side = p % 2 ? 1 : -1, px = side * (40 + pu * 150) + Math.sin(pu * 5 + p) * 12, py = -200 + pu * 120 + Math.sin(pu * 4 + p) * 20; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(12 + pu * 26) + '" fill="#8a8580" opacity="' + f(o.spill * 0.5 * Math.sin(Math.PI * pu)) + '" filter="url(#soft2)"/>'; }
    return s + '</g>';
  }
  // molecules, ball-and-stick: carbon dark grey, oxygen red, hydrogen white
  function atom(x, y, r, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1.2, r / 9)) + '"/><circle cx="' + f(x - r * 0.32) + '" cy="' + f(y - r * 0.34) + '" r="' + f(r * 0.32) + '" fill="#fff" opacity=".45"/>'; }
  function bond(x1, y1, x2, y2, w, n) { var s = "", dx = x2 - x1, dy = y2 - y1, L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0; for (var i = 0; i < (n || 1); i++) { var o2 = ((n || 1) === 1 ? 0 : (i - ((n || 1) - 1) / 2) * w * 1.6); s += '<path d="M' + f(x1 + nx * o2) + ' ' + f(y1 + ny * o2) + ' L' + f(x2 + nx * o2) + ' ' + f(y2 + ny * o2) + '" stroke="#5a5048" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; } return s; }
  var CC = "#4a4f56", OC = "#e2412f", HC = "#f4f4f2";
  function mol(type, x, y, sc, rot, lab) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + sc + ')">', R1 = 13, R2 = 12, R3 = 7;
    if (type === "O2") s += bond(-10, 0, 10, 0, 3, 2) + atom(-11, 0, R2, OC) + atom(11, 0, R2, OC);
    else if (type === "CO2") s += bond(-24, 0, 24, 0, 3, 2) + atom(-25, 0, R2, OC) + atom(25, 0, R2, OC) + atom(0, 0, R1, CC);
    else if (type === "CO") s += bond(-11, 0, 11, 0, 2.6, 3) + atom(-12, 0, R1, CC) + atom(12, 0, R2, OC);
    else if (type === "H2O") s += bond(0, 0, -15, 11, 3) + bond(0, 0, 15, 11, 3) + atom(-15, 11, R3, HC) + atom(15, 11, R3, HC) + atom(0, 0, R2, OC);
    else if (type === "CH4") s += bond(0, 0, -17, -10, 3) + bond(0, 0, 17, -10, 3) + bond(0, 0, -12, 15, 3) + bond(0, 0, 12, 15, 3) + atom(-17, -10, R3, HC) + atom(17, -10, R3, HC) + atom(-12, 15, R3, HC) + atom(12, 15, R3, HC) + atom(0, 0, R1, CC);
    s += '</g>';
    if (lab) s += '<text x="' + f(x) + '" y="' + f(y + 34 * sc) + '" text-anchor="middle" style="font:800 ' + f(14 * Math.max(0.9, sc)) + 'px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:3;paint-order:stroke;direction:ltr">' + lab + '</text>';
    return s;
  }
  // a red blood cell: a disc dimpled in the middle, seen a little tilted. o2 / co: how many of each it carries (0..4)
  function rbc(x, y, r, t, o) {
    o = o || {}; var a = o.rot == null ? Math.sin(t * 0.8 + x * 0.01) * 20 : o.rot, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')">';
    s += '<ellipse rx="' + f(r) + '" ry="' + f(r * 0.78) + '" fill="url(#gRbc)" stroke="#6a0a14" stroke-width="' + f(r / 12) + '"/><ellipse cx="' + f(r * 0.05) + '" cy="' + f(r * 0.04) + '" rx="' + f(r * 0.5) + '" ry="' + f(r * 0.36) + '" fill="#a8121e" opacity=".55"/><ellipse cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" rx="' + f(r * 0.32) + '" ry="' + f(r * 0.12) + '" fill="#fff" opacity=".35" transform="rotate(-20 ' + f(-r * 0.35) + ' ' + f(-r * 0.4) + ')"/>';
    var sites = [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]];
    for (var i = 0; i < 4; i++) { var px = sites[i][0] * r, py = sites[i][1] * r * 0.78, br = r * 0.2, isCO = i < (o.co || 0), isO = !isCO && i < (o.co || 0) + (o.o2 || 0); if (!isCO && !isO) continue;
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(br) + '" fill="' + (isCO ? "#3a3f46" : "#7cc8f2") + '" stroke="' + (isCO ? "#e2412f" : "#fff") + '" stroke-width="' + f(Math.max(1.4, br * 0.14)) + '"/><circle cx="' + f(px - br * 0.3) + '" cy="' + f(py - br * 0.3) + '" r="' + f(br * 0.3) + '" fill="#fff" opacity=".45"/>';
      if (r > 60) s += '<text x="' + f(px) + '" y="' + f(py + br * 0.32) + '" text-anchor="middle" style="font:900 ' + f(br * 0.8) + 'px Noto Sans Arabic;fill:#fff;direction:ltr">' + (isCO ? "CO" : "O₂") + '</text>'; }
    return s + '</g>';
  }
  // the inside of a blood vessel with cells drifting through it (n cells, sp speed). fn(i) → {o2, co} per cell
  function vessel(t, n, sp, fn) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#5a1a22"/><rect x="-400" y="40" width="1440" height="280" fill="url(#gPlasma)"/><rect x="-400" y="20" width="1440" height="26" fill="url(#gVessel)" stroke="' + INK + '" stroke-width="2"/><rect x="-400" y="314" width="1440" height="26" fill="url(#gVessel)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < n; i++) { var x = ((hash(i) * 1300 + t * sp * (0.8 + hash(i + 2) * 0.4)) % 1300) - 330, y = 80 + hash(i + 7) * 210 + Math.sin(t * 1.3 + i) * 10, c = fn ? fn(i) : { o2: 4 }; s += rbc(x, y, 30 + hash(i + 4) * 8, t, c); }
    return s;
  }
  // the person in the bathroom: ball head, a towel turban, a bathrobe. o: {mood, arm: "door"|"head"|"up"|"down", wob: wobble, s}
  function bather(x, y, t, mood, o) {
    o = o || {}; var sc = o.s || 1, wob = o.wob || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 1.5) + ') rotate(' + f(Math.sin(t * 1.4) * (1 + wob * 8)) + ' 0 0) scale(' + sc + ')">';
    var A = { door: [62, -130, 104, -118], head: [30, -200, 40, -238], up: [48, -170, 70, -230], down: [42, -120, 46, -80], cheek: [26, -176, 30, -214] }[o.arm || "down"];
    s += '<path d="M-16 -40 V-8 M12 -40 V-8" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="M-16 -40 V-8 M12 -40 V-8" stroke="#eab796" stroke-width="9" stroke-linecap="round"/><path d="M-28 0 Q-28 -9 -16 -9 Q-4 -8 0 0 Z M0 0 Q0 -9 12 -9 Q24 -8 28 0 Z" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.weights) s += '<rect x="-30" y="-30" width="30" height="20" rx="4" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.6"/><rect x="2" y="-30" width="30" height="20" rx="4" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.6"/><text x="-15" y="-15" text-anchor="middle" style="font:900 11px Noto Sans Arabic;fill:#fff">kg</text><text x="17" y="-15" text-anchor="middle" style="font:900 11px Noto Sans Arabic;fill:#fff">kg</text>';
    s += '<path d="M-44 -36 C-50 -110 -40 -164 -6 -170 H8 C40 -164 52 -110 46 -36 Z" fill="url(#gRobe)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-6 -168 L10 -110 L-2 -40" stroke="#4a82a0" stroke-width="2.4" fill="none"/><path d="M-46 -100 H48" stroke="#e8f4fa" stroke-width="6"/><path d="M-46 -100 H48" stroke="' + INK + '" stroke-width="1" opacity=".3"/>';
    s += limbQ(14, -160, A[0], A[1] + 10, A[2], A[3], 13, "#5a92b0") + '<circle cx="' + f(A[2]) + '" cy="' + f(A[3]) + '" r="7.5" fill="#f2c4a4" stroke="' + INK + '" stroke-width="1.8"/>';
    s += face(4, -204, 30, mood, t, o.look == null ? 0.3 : o.look) + '<path d="M-28 -218 C-34 -262 40 -262 34 -218 C24 -234 -18 -234 -28 -218 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.2"/><path d="M-12 -244 Q6 -236 20 -246" stroke="#c9ced4" stroke-width="2" fill="none"/>';
    if (o.green) s += '<circle cx="4" cy="-204" r="28" fill="#9fd36a" opacity="' + f(0.35 * o.green) + '"/>';
    return s + '</g>';
  }
  // a child in pyjamas (smaller, same ball head)
  function kid(x, y, t, mood, sc) { var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3) * 1.5) + ') scale(' + (sc || 1) + ')"><path d="M-12 -30 V-6 M8 -30 V-6" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M-12 -30 V-6 M8 -30 V-6" stroke="#f2a0a0" stroke-width="7" stroke-linecap="round"/><path d="M-30 -26 C-34 -80 -26 -110 0 -112 C26 -110 34 -80 30 -26 Z" fill="#f2a0a0" stroke="' + INK + '" stroke-width="2.2"/>'; for (var d = 0; d < 6; d++) s += '<circle cx="' + (-18 + (d % 3) * 18) + '" cy="' + (-90 + Math.floor(d / 3) * 30) + '" r="3" fill="#fff"/>'; return s + face(0, -138, 24, mood, t, 0.3) + '</g>'; }
  function breath(x, y, t, rate, n) { var s = ""; for (var i = 0; i < (n || 3); i++) { var u = (t * rate + i / (n || 3)) % 1; s += '<ellipse cx="' + f(x + u * 46) + '" cy="' + f(y - u * 8) + '" rx="' + f(5 + u * 12) + '" ry="' + f(3 + u * 7) + '" fill="#fff" opacity="' + f(0.85 * (1 - u)) + '"/>'; } return s; }
  function gauge(x, y, r, v, t, lab) {   // a dial for the oxygen in the air: green at 21 %, red when it drops
    var a = lerp(-120, 120, clamp(v)) + Math.sin(t * 7) * 1.5, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>';
    var arc = function (a0, a1, col) { var p0 = [Math.sin(a0 * Math.PI / 180) * r * 0.78, -Math.cos(a0 * Math.PI / 180) * r * 0.78], p1 = [Math.sin(a1 * Math.PI / 180) * r * 0.78, -Math.cos(a1 * Math.PI / 180) * r * 0.78]; return '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + ' A' + f(r * 0.78) + ' ' + f(r * 0.78) + ' 0 0 1 ' + f(p1[0]) + ' ' + f(p1[1]) + '" stroke="' + col + '" stroke-width="' + f(r * 0.14) + '" fill="none"/>'; };
    s += arc(-120, -40, "#e2523a") + arc(-40, 40, "#f2c230") + arc(40, 120, "#5bbf6a");
    s += '<path d="M0 0 L' + f(Math.sin(a * Math.PI / 180) * r * 0.7) + ' ' + f(-Math.cos(a * Math.PI / 180) * r * 0.7) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/>';
    if (lab) s += '<text y="' + f(r * 0.55) + '" text-anchor="middle" style="font:900 ' + f(r * 0.36) + 'px Noto Sans Arabic;fill:#2b2016;direction:ltr">' + lab + '</text>';
    return s + '</g>';
  }
  function clock(x, y, r, t, sp) { var a = t * (sp || 6), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i < 12; i++) s += '<path d="M' + f(Math.sin(i * Math.PI / 6) * r * 0.75) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.75) + ' L' + f(Math.sin(i * Math.PI / 6) * r * 0.88) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.88) + '" stroke="' + INK + '" stroke-width="2"/>'; return s + '<path d="M0 0 L' + f(Math.sin(a * Math.PI / 180) * r * 0.75) + ' ' + f(-Math.cos(a * Math.PI / 180) * r * 0.75) + ' M0 0 L' + f(Math.sin(a / 12 * Math.PI / 180) * r * 0.5) + ' ' + f(-Math.cos(a / 12 * Math.PI / 180) * r * 0.5) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#e2523a"/></g>'; }
  function cube(x, y, w, h, d, k, col, lab) {   // a wire box of air, filled k (0..1) from the bottom
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">', dx = d * 0.6, dy = -d * 0.4, fh = h * clamp(k);
    if (k > 0) s += '<path d="M0 0 H' + w + ' L' + f(w + dx) + ' ' + f(dy) + ' V' + f(dy - fh) + ' L' + w + ' ' + f(-fh) + ' H0 Z" fill="' + col + '" opacity=".35"/><path d="M0 ' + f(-fh) + ' H' + w + ' L' + f(w + dx) + ' ' + f(dy - fh) + ' H' + f(dx) + ' Z" fill="' + col + '" opacity=".45"/>';
    s += '<path d="M0 0 H' + w + ' V' + (-h) + ' H0 Z M' + w + ' 0 L' + f(w + dx) + ' ' + f(dy) + ' V' + f(dy - h) + ' L' + w + ' ' + (-h) + ' M0 ' + (-h) + ' L' + f(dx) + ' ' + f(dy - h) + ' H' + f(w + dx) + '" stroke="#fff" stroke-width="2.4" fill="none" stroke-dasharray="6 4"/>';
    if (lab) s += '<text x="' + f(w / 2) + '" y="' + f(-h / 2 + 8) + '" text-anchor="middle" style="font:900 20px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:4;paint-order:stroke">' + lab + '</text>';
    return s + '</g>';
  }
  function tech(x, y, t, mood) {   // a technician: hard hat, overalls, a wrench that turns
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 2) + ')"><path d="M-14 -40 V-6 M10 -40 V-6" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="M-14 -40 V-6 M10 -40 V-6" stroke="#2f5f9f" stroke-width="9" stroke-linecap="round"/><path d="M-44 -36 C-48 -120 -36 -160 0 -164 C36 -160 48 -120 44 -36 Z" fill="#2f5f9f" stroke="' + INK + '" stroke-width="2.4"/><rect x="-18" y="-130" width="36" height="30" rx="4" fill="#3f6faf" stroke="' + INK + '" stroke-width="1.6"/>';
    var wa = Math.sin(t * 5) * 20; s += limbQ(16, -150, 50, -130, 70, -150, 12, "#2f5f9f") + '<g transform="translate(70 -150) rotate(' + f(-40 + wa) + ')"><rect x="-4" y="-40" width="8" height="40" rx="3" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6"/><path d="M-10 -40 Q0 -56 10 -40 L6 -36 Q0 -44 -6 -36 Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6"/></g><circle cx="70" cy="-150" r="7" fill="#f2c4a4" stroke="' + INK + '" stroke-width="1.6"/>';
    return s + face(0, -196, 30, mood, t, 0.4) + '<path d="M-32 -208 C-32 -252 32 -252 32 -208 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/><path d="M-38 -208 H38" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M-38 -208 H38" stroke="#f2c230" stroke-width="2.6" stroke-linecap="round"/></g>';
  }
  function phone123(x, y, sc, t) { var r = (Math.sin(t * 3) > 0 ? 1 : 0) * Math.sin(t * 30) * 4; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + sc + ')"><rect x="-34" y="-64" width="68" height="128" rx="12" fill="#2b2f34" stroke="' + INK + '" stroke-width="2.4"/><rect x="-28" y="-54" width="56" height="100" rx="6" fill="#e9f6fb"/><text x="0" y="-8" text-anchor="middle" style="font:900 28px Noto Sans Arabic;fill:#c2303e;direction:ltr">123</text><text x="0" y="16" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#2b2016">الإسعاف</text><circle cx="0" cy="34" r="9" fill="#5bbf6a"/></g>' + waves(x + 40 * sc, y - 40 * sc, t, -0.6, 3, "#e2523a"); }
  function valve(x, y, sc, k) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><rect x="-70" y="-10" width="140" height="20" fill="#d9a53a" stroke="' + INK + '" stroke-width="2"/><rect x="-18" y="-22" width="36" height="44" rx="6" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><g transform="rotate(' + f(90 * clamp(k)) + ')"><rect x="-6" y="-70" width="12" height="54" rx="5" fill="#e2523a" stroke="' + INK + '" stroke-width="2"/></g><circle r="8" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/></g>'; }
  function step(n, x, y, u, u0) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><circle r="22" fill="#2b2016" stroke="#f2c230" stroke-width="3"/><text y="9" text-anchor="middle" style="font:900 25px Noto Sans Arabic;fill:#f2c230">' + n + '</text></g>'; }
  function check(x, y, s, ok, u, u0) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * s) + ')"><circle r="24" fill="' + (ok ? "#3fae5a" : "#e2523a") + '" stroke="' + INK + '" stroke-width="3"/>' + (ok ? '<path d="M-11 0 L-3 9 L12 -9" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#fff" stroke-width="6" stroke-linecap="round"/>') + '</g>'; }
  function siren(x, y, t) { var on = Math.sin(t * 10) > 0; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="60" fill="' + (on ? "#ff3b2f" : "#3b6aff") + '" opacity=".35" filter="url(#soft)"/><path d="M-26 12 V-6 Q-26 -30 0 -30 Q26 -30 26 -6 V12 Z" fill="' + (on ? "#ff3b2f" : "#3b6aff") + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-34" y="12" width="68" height="12" rx="3" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -18 Q-6 -24 4 -22" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/></g>'; }
  function silhouette(x, y, sc) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><path d="M-50 -252 Q-58 -250 -60 -236 L-66 -140 Q-68 -126 -58 -128 L-52 -200 L-46 -110 L-42 0 H-6 L0 -100 L6 0 H42 L46 -110 L52 -200 L58 -128 Q68 -126 66 -140 L60 -236 Q58 -250 50 -252 Q24 -258 12 -262 V-276 H-12 V-262 Q-24 -258 -50 -252 Z" fill="url(#gBody)" stroke="' + INK + '" stroke-width="2.6" opacity=".92"/><circle cx="0" cy="-304" r="34" fill="url(#gBody)" stroke="' + INK + '" stroke-width="2.6" opacity=".92"/></g>'; }
  function heart(x, y, r, t, dim) { var b = 1 + 0.08 * Math.pow(Math.max(0, Math.sin(t * (dim ? 6 : 4))), 4); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(b * r / 20) + ')"><path d="M0 16 C-26 0 -20 -22 -6 -18 C-2 -17 0 -13 0 -10 C0 -13 2 -17 6 -18 C20 -22 26 0 0 16 Z" fill="' + mixc("#d8203a", "#6a5a7a", dim || 0) + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -10 Q-8 -14 -4 -12" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var HX = 470, HY = 250;   // where the heater hangs in the wide bathroom shots

  // 0 — don't shut the bathroom door on yourself with the gas heater on, even when it's cold
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(380, 300, k), lerp(170, 180, k), lerp(1.2, 1.02, k)]; }, function (u, d, t) {
    var cl = ease(clamp((u - 0.6) / 1.2)), s = bath(t, { door: { x: 170, open: 1 - cl }, win: { x: 330, open: 0, snow: true }, steam: 0.6, steamX: 360 }) + heater(HX, HY, 0.8, t, {}) + bather(240, 300, t, u > 2 ? "shock" : "happy", { arm: u < 1.9 ? "door" : "down", s: 0.9 });
    if (u > 2.0) s += '<g transform="translate(330 160) scale(' + f(pop((u - 2.0) / 1.0)) + ')"><circle r="62" fill="#e2523a" opacity=".25" filter="url(#soft)"/><path d="M0 -50 L48 40 H-48 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><text y="30" text-anchor="middle" style="font:900 52px Noto Sans Arabic;fill:#2b2016">!</text></g>';
    return s + tag("أوعى!", 330, 60, u, 2.2, -3, 30, "#f2a0a0") + tag("برد؟", 330, 330, u, 0.7, 2, 17, "#bfe0ff");
  });
  // 1 — what's the problem? it heats water, no smell, no smoke
  shot(1, function (u, d) { return [lerp(420, 440, clamp(u / d)), 170, lerp(1.3, 1.4, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { shower: { x: 300, on: true }, steam: 0.5, steamX: 300 }) + heater(HX, HY, 0.8, t, { exhaust: 0.4 }) + bather(360, 300, t, "curious", { arm: "cheek", s: 0.8 });
    return s + qmark(560, 110, t, 40) + tag("مفيش ريحة", 370, 80, u, 0.8, -3, 16) + tag("ولا دخان", 560, 220, u, 1.8, 3, 16, "#bfe0ff");
  });
  // 2 — so why, every winter, do we hear of people found passed out in the bathroom?
  shot(2, function (u, d) { return [320, 180, lerp(1.0, 1.08, clamp(u / d))]; }, function (u, d, t) {
    var s = bgc("#1e2430") + '<rect x="-400" y="260" width="1440" height="400" fill="#2b2f3a"/>';
    for (var k = 0; k < 30; k++) { var sx = ((hash(k) * 1100 + t * 20) % 1100) - 230, sy = ((hash(k + 4) * 400 + t * (30 + hash(k) * 20)) % 400) - 40; s += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="2.4" fill="#fff" opacity=".7"/>'; }
    s += siren(470, 120, t) + '<g transform="rotate(-4 220 190)">' + rr(110, 70, 220, 200, "#f4efe2", 3, 8) + '<rect x="122" y="84" width="196" height="36" fill="#c2303e"/><text x="220" y="110" text-anchor="middle" style="font:900 20px Noto Sans Arabic;fill:#fff">عاجل</text>';
    for (var l = 0; l < 5; l++) s += '<rect x="' + (140 + (l % 2) * 20) + '" y="' + (140 + l * 22) + '" width="' + (160 - (l % 2) * 40) + '" height="9" rx="4" fill="#c9c2b0"/>'; s += '</g>';
    return s + tag("كل شتا!", 470, 250, u, 0.6, 3, 22, "#f2a0a0") + tag("في الحمام؟", 220, 310, u, 1.4, -2, 18);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.08, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { door: { x: 140, open: 0 }, win: { x: 300, snow: true }, steam: 0.4 }) + heater(HX, HY, 0.8, t, {});
    return s + tag("إيه الحكاية؟", 300, 200, u, 0.05, -2, 32, "#f2c230") + qmark(560, 70, t, 40) + qmark(200, 60, t, 30);
  });
  // 4 — to light the gas, the heater has to take oxygen from the bathroom air
  shot(4, function (u, d) { return [lerp(420, 450, clamp(u / d)), 170, lerp(1.25, 1.35, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { win: { x: 250, open: 0.6 } }) + heater(HX, HY, 0.8, t, { win: true });
    for (var i = 0; i < 9; i++) { var pu = (t * 0.3 + i / 9) % 1, sx = lerp(120 + hash(i) * 240, HX - 10, ease(pu)), sy = lerp(70 + hash(i + 3) * 200, HY - 88, ease(pu)) + Math.sin(pu * 8 + i) * 8; s += mol("O2", sx, sy, 0.5 * (1 - 0.5 * pu), t * 40 + i * 30); }
    return s + tag("أكسجين", 330, 290, u, 0.5, -3, 20, "#bfe0ff") + tag("من هوا الحمام", 340, 70, u, 1.5, 2, 16);
  });
  // 5 — an ordinary heater needs about 20 m³ of air an hour: twice a small bathroom
  shot(5, function (u, d) { return [320, lerp(170, 185, clamp(u / d)), lerp(1.06, 0.98, clamp(u / d))]; }, function (u, d, t) {
    var k = clamp(u / 3.6), s = bath(t, {}) + heater(560, 300, 0.7, t, {});
    s += cube(70, 290, 150, 170, 90, clamp(k * 2), "#7cc8f2", "حمام") + cube(270, 290, 150, 170, 90, clamp(k * 2 - 1), "#7cc8f2", "حمام");
    for (var i = 0; i < 6; i++) { var pu = (t * 0.5 + i / 6) % 1; s += mol("O2", lerp(420, 540, pu), 160 + Math.sin(pu * 6 + i) * 30, 0.5, t * 50); }
    var n = Math.min(20, Math.floor(k * 20)); return s + big(n + " م³", 330, 60, 36, "#fff") + tag("في الساعة", 470, 40, u, 1.0, 3, 16, "#bfe0ff") + tag("قد الحمام مرتين!", 250, 330, u, 3.6, -2, 19);
  });
  // 6 — with enough oxygen the flame burns blue, and the exhaust is CO2 and water vapour
  shot(6, function (u, d) { return [320, 180, lerp(1.0, 1.06, clamp(u / d))]; }, function (u, d, t) {
    var s = bgc("#141820") + '<circle cx="200" cy="230" r="150" fill="#3f7fff" opacity=".18" filter="url(#soft)"/>' + flameB(200, 300, 46, t, 0) + '<rect x="40" y="300" width="320" height="22" rx="6" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    s += mol("CH4", 120, 340 - ((t * 40) % 60), 0.8, t * 30) + mol("O2", 280, 336 - ((t * 40 + 30) % 60), 0.8, -t * 30);
    for (var i = 0; i < 6; i++) { var pu = (t * 0.32 + i / 6) % 1, x = 240 + pu * 300 + Math.sin(i * 3) * 30, y = 220 - pu * 170 + Math.sin(pu * 7 + i) * 14; s += mol(i % 2 ? "H2O" : "CO2", x, y, 0.9, t * 40 + i * 50, i < 2 ? (i % 2 ? "H₂O" : "CO₂") : ""); }
    return s + tag("شعلة زرقا", 200, 40, u, 0.3, -3, 21, "#bfe0ff") + tag("ثاني أكسيد كربون + بخار", 450, 330, u, 1.6, 2, 15);
  });
  // 7 — the flue takes the exhaust out of the bathroom
  shot(7, function (u, d) { return [lerp(380, 430, clamp(u / d)), lerp(170, 140, clamp(u / d)), 1.05]; }, function (u, d, t) {
    var s = bath(t, {}) + '<rect x="590" y="-300" width="450" height="960" fill="url(#sky-day)"/>' + clouds(t, 20, -10, 3, 0.9, 0.5) + '<rect x="560" y="-300" width="30" height="960" fill="#a8927a" stroke="' + INK + '" stroke-width="2"/>';
    s += heater(330, 300, 0.8, t, { flue: "wall", flueLen: 50, wallX: 340, exhaust: 1 });
    return s + tag("المدخنة", 470, 40, u, 0.4, 3, 21) + tag("العادم برا", 640, 200, u, 1.4, -3, 18, "#bfe0ff");
  });
  // 8 — but with the door and window shut, the oxygen drops minute after minute
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.06, clamp(u / d))]; }, function (u, d, t) {
    var cl = ease(clamp(u / 1.0)), o2 = lerp(1, 0.25, clamp((u - 0.8) / (d - 1.0))), s = bath(t, { door: { x: 110, open: 1 - cl }, win: { x: 290, open: 1 - cl } }) + heater(HX, HY, 0.8, t, {});
    for (var i = 0; i < 14; i++) { if (hash(i + 9) > o2) continue; var a = t * 0.4 + i * 1.7; s += mol("O2", 300 + Math.cos(a) * 200 * hash(i), 170 + Math.sin(a * 1.2) * 90 * hash(i + 2), 0.6, t * 30 + i * 20); }
    return s + gauge(560, 96, 40, o2, t, Math.round(lerp(17, 21, o2)) + "%") + clock(290, 200, 26, t, 120) + tag("الأكسجين بيقل", 300, 330, u, 1.2, -2, 18, "#bfe0ff");
  });
  // 9 — if the flue is blocked or missing, the exhaust comes back into the bathroom
  shot(9, function (u, d) { return [lerp(420, 440, clamp(u / d)), lerp(130, 160, clamp(u / d)), lerp(1.25, 1.1, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { door: { x: 140, open: 0 } }) + heater(HX, HY, 0.8, t, { flue: "blocked", flueLen: 60, spill: clamp((u - 0.4) / 1.0) });
    return s + tag("مسدودة!", 300, 40, u, 0.4, -3, 20, "#f2a0a0") + tag("العادم راجع جوه", 330, 320, u, 1.5, 2, 17);
  });
  // 10 — then the flame can't get enough oxygen, so it turns yellow
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.08, clamp(u / d))]; }, function (u, d, t) {
    var y = ease(clamp((u - 0.4) / 1.4)), s = bgc("#141820") + flameB(200, 300, 46, t, y) + '<rect x="40" y="300" width="320" height="22" rx="6" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    s += '<g opacity="' + f(y) + '"><ellipse cx="200" cy="40" rx="150" ry="40" fill="#2b2622" opacity=".6" filter="url(#soft)"/></g>' + gauge(510, 160, 64, lerp(0.45, 0.1, y), t, "O₂");
    return s + tag("أصفر!", 200, 40, u, 1.4, -3, 26, "#f2c230") + tag("مفيش أكسجين كفاية", 500, 300, u, 0.6, 2, 15, "#bfe0ff");
  });
  // 11 — instead of carbon dioxide, a different gas comes out: carbon monoxide
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(270, 370, k), lerp(165, 190, k), lerp(1.14, 0.96, k)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.15) / 1.8)), s = bgc("#1a1416") + '<circle cx="420" cy="180" r="' + f(60 + 60 * k + 10 * Math.sin(t * 4)) + '" fill="#e2412f" opacity="' + f(0.25 * k) + '" filter="url(#soft)"/>';
    for (var sp = 0; sp < 45; sp++) { var su = (t * (0.15 + hash(sp) * 0.2) + hash(sp + 3)) % 1; s += '<circle cx="' + f(-100 + hash(sp + 7) * 840 + Math.sin(t + sp) * 10) + '" cy="' + f(400 - su * 460) + '" r="' + f(2 + hash(sp + 1) * 3) + '" fill="#ffb08a" opacity="' + f(0.6 * Math.sin(Math.PI * su)) + '"/>'; }
    s += mol("CO2", 200, 170 + Math.sin(t * 1.4) * 10, 2.0, Math.sin(t * 1.3) * 14, "CO₂") + '<path d="M290 170 H350" stroke="#fff" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 20) + '"/>';
    s += '<g opacity="' + f(1 - k * 0.8) + '">' + atom(lerp(250, 300, k), lerp(170, 60 - 40 * k, k), 24, OC) + '</g>';
    for (var m = 0; m < 7; m++) { var mu = (t * 0.12 + m / 7) % 1; s += '<g opacity="' + f(0.55 * k * Math.sin(Math.PI * mu)) + '">' + mol("CO", 700 - mu * 900, 40 + hash(m) * 280, 0.7, t * 60 + m * 40) + '</g>'; }
    var sh = k * (0.5 + 0.5 * Math.sin(t * 3)); s += mol("CO", 440 + Math.sin(t * 7) * 6 * sh, 170 + Math.sin(t * 1.6) * 12, 2.0 * (0.6 + 0.4 * k) * (1 + 0.08 * Math.sin(t * 6)), Math.sin(t * 5) * 18 * sh + t * 10, k > 0.3 ? "CO" : "");
    return s + tag("ناقص أكسجين واحد", 260, 60, u, 1.4, -2, 16, "#bfe0ff") + tag("أول أكسيد الكربون", 440, 300, u, 2.4, 2, 20, "#f2a0a0");
  });
  // 12 — the silent killer: no colour, no smell, and you breathe it without noticing
  shot(12, function (u, d) { return [lerp(300, 340, clamp(u / d)), 180, 1.04]; }, function (u, d, t) {
    var xr = clamp((u - 2.2) / 0.8), s = bath(t, { shower: { x: 250, on: true, curtain: 70 }, steam: 0.6, steamX: 250, door: { x: 470, open: 0 } }) + heater(600, 250, 0.7, t, { yel: 1 });
    s += '<g transform="translate(250 0)">' + face(0, 40 + Math.sin(t * 2) * 2, 26, "happy", t, 0.3) + '<path d="M-24 28 C-30 -10 30 -10 24 28 C14 14 -14 14 -24 28 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/></g>' + breath(270, 52, t, 0.6, 3);
    if (xr > 0) { CLIPN++; s += '<clipPath id="xr' + CLIPN + '"><rect x="-400" y="-300" width="' + f(400 + 640 * xr) + '" height="960"/></clipPath><g clip-path="url(#xr' + CLIPN + ')">' + coHaze(t, 1, 360, 150); for (var i = 0; i < 12; i++) { var a = t * 0.5 + i * 2.1; s += mol("CO", 330 + Math.cos(a) * 220 * hash(i), 160 + Math.sin(a * 1.3) * 110 * hash(i + 3), 0.55, t * 40 + i * 30); } s += '</g><path d="M' + f(640 * xr) + ' -300 V660" stroke="#f2c230" stroke-width="3" stroke-dasharray="8 6" opacity="' + f(xr < 1 ? 1 : 0) + '"/>'; }
    return s + tag("القاتل الصامت", 430, 70, u, 0.3, -3, 22, "#f2a0a0") + tag("ملوش لون ولا ريحة", 360, 320, u, 1.2, 2, 17);
  });
  // 13 — your blood has red cells whose job is to carry oxygen to the whole body
  shot(13, function (u, d) { return [lerp(280, 360, clamp(u / d)), 180, lerp(1.1, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var s = vessel(t, 9, 60, function () { return { o2: 4 }; });
    return s + tag("كرات الدم الحمرا", 320, 30, u, 0.3, -2, 19) + tag("شايلة أكسجين", 360, 340, u, 1.4, 2, 17, "#bfe0ff");
  });
  // 14 — carbon monoxide grabs them more than 200 times harder than oxygen
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.08, clamp(u / d))]; }, function (u, d, t) {
    var k = clamp((u - 0.5) / 1.6), n = Math.floor(k * 4.99), s = vessel(t * 0.3, 0, 0) + rbc(260, 190, 120, t, { co: n, o2: 4 - n, rot: Math.sin(t * 0.6) * 8 });
    for (var j = 0; j < n; j++) { var fu = clamp(k * 4 - j - 0.3); s += mol("O2", 260 + (j % 2 ? 1 : -1) * (70 + fu * 140), 190 + (j < 2 ? -1 : 1) * (50 + fu * 60), 0.8, t * 60 * fu, ""); }
    for (var c = 0; c < 4; c++) { var cu = (t * 0.4 + c / 4) % 1; s += mol("CO", 560 - cu * 160, 80 + c * 60 + Math.sin(cu * 6) * 10, 0.7, t * 50); }
    return s + big("×200", 520, 330, 46, "#f2c230", u, 2.2) + tag("بيطرد الأكسجين", 200, 40, u, 1.0, -3, 18, "#f2a0a0");
  });
  // 15 — it takes the oxygen's place, and the brain and heart start to choke while you're under the shower
  shot(15, function (u, d) { return [lerp(300, 330, clamp(u / d)), 175, lerp(1.04, 1.12, clamp(u / d))]; }, function (u, d, t) {
    var dim = ease(clamp((u - 0.5) / 3.0)), s = bath(t, { shower: { x: 330, on: true }, steam: 0.5, steamX: 330 }) + coHaze(t, 0.6, 320, 160);
    s += silhouette(330, 300, 0.8) + brain(330, 60, 0.21, t, 0.9) + '<circle cx="330" cy="57" r="27" fill="#4a3a6a" opacity="' + f(0.45 * dim) + '"/>' + heart(340, 130, 16, t, dim);
    return s + gauge(540, 100, 40, 1 - dim * 0.8, t, "O₂") + tag("المخ", 220, 60, u, 0.6, -3, 17, "#d8b8f0") + tag("القلب", 220, 150, u, 1.2, -3, 17, "#f2a0a0") + tag("بيتخنقوا", 540, 210, u, 2.2, 3, 19);
  });
  // 16 — first a headache and dizziness, and many think it's the steam and the hot water
  shot(16, function (u, d) { return [lerp(300, 320, clamp(u / d)), 175, lerp(1.1, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { win: { x: 520, snow: true }, steam: 1, steamX: 300 }) + coHaze(t, 0.5) + bather(300, 300, t, "dizzy", { arm: "head", wob: 0.4, green: 0.6 });
    for (var b = 0; b < 3; b++) { var ba = t * 3 + b * 2.1; s += '<circle cx="' + f(304 + Math.cos(ba) * 40) + '" cy="' + f(66 + Math.sin(ba) * 10) + '" r="5" fill="#f2c230" stroke="' + INK + '" stroke-width="1.2"/>'; }
    return s + tag("صداع ودوخة", 470, 160, u, 0.3, 3, 19, "#f2a0a0") + tag("فاكرها البخار!", 160, 120, u, 1.8, -3, 18, "#bfe0ff");
  });
  // 17 — then drowsiness and heavy legs, so you can't reach the door
  shot(17, function (u, d) { return [lerp(260, 320, clamp(u / d)), 180, lerp(1.08, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { door: { x: 520 + clamp(u / d) * 60, open: 0 } }) + coHaze(t, 0.5) + bather(230 + Math.sin(t * 1.5) * 6, 300, t, "sleep", { arm: "door", wob: 1, weights: true, s: 0.95 }) + zzz(250, 70, t);
    s += '<path d="M330 170 H' + f(470 + clamp(u / d) * 60) + '" stroke="#fff" stroke-width="3" stroke-dasharray="8 8" stroke-dashoffset="' + f(-t * 20) + '" opacity=".8"/>';
    return s + tag("نعاس", 130, 80, u, 0.3, -3, 19, "#bfe0ff") + tag("رجليه تقيلة", 160, 330, u, 1.0, 2, 17) + tag("الباب بعيد!", 520, 60, u, 2.2, 3, 18, "#f2a0a0");
  });
  // 18 — less than two parts in a thousand in the air is enough to kill in about an hour
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(290, 340, k), lerp(165, 185, k), lerp(1.3, 1.0, k)]; }, function (u, d, t) {
    var s = bgc("#141a24"), rv = clamp(u / 1.6), red = [[13, 7], [27, 18]];
    for (var r = 0; r < 25; r++) for (var c = 0; c < 40; c++) { var on = r * 40 + c < rv * 1000; if (!on) continue; var isR = (r === red[0][1] && c === red[0][0]) || (r === red[1][1] && c === red[1][0]); if (isR) continue; s += '<circle cx="' + (34 + c * 14.4) + '" cy="' + (16 + r * 11.4) + '" r="3.4" fill="#5d93ad" opacity="' + f(0.55 + 0.45 * Math.sin(t * 3 + c * 0.7 + r * 1.3)) + '"/>'; }
    if (rv >= 1) red.forEach(function (p, i) { var pk = pop((u - 1.9 - i * 0.3) / 1.0); s += '<circle cx="' + (34 + p[0] * 14.4) + '" cy="' + (16 + p[1] * 11.4) + '" r="' + f(4 + 10 * pk * (1 + 0.15 * Math.sin(t * 6))) + '" fill="#e2412f" opacity=".35"/><circle cx="' + (34 + p[0] * 14.4) + '" cy="' + (16 + p[1] * 11.4) + '" r="' + f(3.4 + 2 * pk) + '" fill="#e2412f" stroke="#fff" stroke-width="1"/>'; });
    var k2 = pop((u - 2.6) / 1.0); if (k2 > 0) s += '<g transform="translate(320 190) scale(' + f(k2) + ')"><rect x="-150" y="-62" width="300" height="124" rx="16" fill="#141a24" opacity=".85" stroke="#f2c230" stroke-width="3"/>' + clock(-90, 0, 40, t, 360) + '<text x="40" y="-6" text-anchor="middle" style="font:900 28px Noto Sans Arabic;fill:#fff">2 من 1000</text><text x="40" y="34" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#f2c230">حوالي ساعة</text></g>';
    return s;
  });
  // 19 — children are hit faster because they breathe faster
  shot(19, function (u, d) { return [320, 185, lerp(1.06, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { win: { x: 320, snow: true } }) + coHaze(t, 0.45) + bather(200, 300, t, "n", { s: 0.9 }) + kid(450, 300, t, "worry", 1.0);
    s += breath(222, 116, t, 0.5, 2) + breath(468, 168, t, 1.3, 4);
    return s + tag("أسرع!", 470, 60, u, 0.5, 3, 22, "#f2a0a0") + tag("بيتنفس أسرع", 450, 330, u, 1.2, 2, 16, "#bfe0ff");
  });
  // 20 — what to do: the heater belongs outside the bathroom, with its flue going out of the house
  shot(20, function (u, d) { return [320, 175, lerp(1.0, 1.06, clamp(u / d))]; }, function (u, d, t) {
    var mv = ease(clamp((u - 0.8) / 1.6)), s = bgc("#dcecef") + '<rect x="-400" y="300" width="1440" height="400" fill="#a9b8bd"/><rect x="304" y="10" width="20" height="290" fill="#c9b49a" stroke="' + INK + '" stroke-width="2"/><rect x="600" y="-300" width="30" height="600" fill="#c9b49a" stroke="' + INK + '" stroke-width="2"/><rect x="630" y="-300" width="400" height="600" fill="url(#sky-day)"/>';
    s += '<rect x="324" y="10" width="276" height="290" fill="#f3e6d3"/><text x="160" y="44" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#5a6a70">الحمام</text><text x="462" y="44" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#8a6a4a">المطبخ أو البلكونة</text>';
    s += heater(lerp(160, 470, mv), 250, 0.62, t, { flue: mv > 0.98 ? "wall" : "up", flueLen: 30, wallX: mv > 0.98 ? 232 : 0, exhaust: mv > 0.98 ? 1 : 0 });
    if (mv > 0 && mv < 1) s += arrow(200, 120, 400, 120, "#f2c230", 5, mv);
    return s + check(240, 110, 1, false, u, 0.3) + check(390, 100, 1, true, u, 2.6) + tag("برا الحمام", 470, 330, u, 2.8, 2, 19);
  });
  // 21 — keep a window open or the extractor fan on, and don't linger with the door shut
  shot(21, function (u, d) { return [lerp(300, 330, clamp(u / d)), 170, lerp(1.08, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var op = ease(clamp((u - 0.3) / 1.0)), s = bath(t, { win: { x: 200, open: op }, fan: { x: 420, y: 70, on: u > 1.0 }, door: { x: 560, open: 0.35 }, steam: 0.4, steamX: 300 }) + heater(330, 270, 0.6, t, { flue: "up", flueLen: 40, exhaust: 0.8 });
    for (var i = 0; i < 6; i++) { var pu = (t * 0.5 + i / 6) % 1; s += mol("O2", lerp(200, 330, pu), 90 + Math.sin(pu * 6 + i) * 30 + pu * 60, 0.55, t * 40); }
    return s + clock(600, 60, 26, t, 240) + tag("شباك مفتوح", 200, 170, u, 0.6, -3, 17, "#bfe0ff") + tag("شفاط", 420, 140, u, 1.2, 3, 17) + tag("متطوّلش", 560, 320, u, 2.4, 2, 18, "#f2a0a0");
  });
  // 22 — a yellow flame or soot around the heater: it needs servicing now
  shot(22, function (u, d) { return [lerp(380, 340, clamp(u / d)), lerp(160, 175, clamp(u / d)), lerp(1.25, 1.05, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, {}) + heater(380, 290, 1.0, t, { yel: 1, soot: 1, win: true }) + (u > 2.2 ? popIn(tech(560, 300, t, "happy"), 560, 300, u, 2.2) : "");
    return s + tag("شعلة صفرا", 210, 120, u, 0.4, -3, 18, "#f2c230") + tag("سواد", 260, 40, u, 1.1, 2, 18) + tag("صيانة فورًا!", 200, 300, u, 2.4, -2, 20, "#f2a0a0");
  });
  // 23 — if someone is dizzy or passed out: turn the heater off, get them to fresh air, call the ambulance on 123
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [lerp(250, 360, k), lerp(170, 185, k), lerp(1.12, 0.98, k)]; }, function (u, d, t) {
    var vk = ease(clamp((u - 0.6) / 0.8)), s = bath(t, {});
    s += valve(120, 180, 1.3, vk); if (vk < 1) for (var g = 0; g < 6; g++) { var gu = (t * 1.2 + g / 6) % 1; s += '<circle cx="' + f(30 + gu * 70) + '" cy="180" r="4" fill="#fff6c8" opacity="' + f((1 - vk) * Math.sin(Math.PI * gu)) + '"/>'; }
    if (u > 2.0) s += popIn('<rect x="240" y="60" width="150" height="130" fill="url(#sky-day)" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 10, 80, 2, 0.9, 0.4) + '<path d="M240 60 L200 50 V200 L240 190 M390 60 L430 50 V200 L390 190" fill="#cfe6f2" stroke="' + INK + '" stroke-width="2"/>' + bather(315, 300, t, "dizzy", { s: 0.55, arm: "up" }) + breath(340, 182, t, 0.8, 3), 315, 180, u, 2.0);
    if (u > 3.8) s += popIn(phone123(530, 180, 1.1, t), 530, 180, u, 3.8);
    return s + step(1, 120, 40, u, 0.2) + step(2, 315, 30, u, 2.0) + step(3, 530, 40, u, 3.8) + tag("اقفل السخان", 120, 300, u, 0.8, -2, 17) + tag("هوا!", 315, 330, u, 2.4, 2, 19, "#bfe0ff") + tag("الإسعاف 123", 530, 300, u, 4.2, 2, 18, "#f2a0a0");
  });
  // 24 — so next time you shower, don't shut yourself in with the heater
  shot(24, function (u, d) { return [lerp(300, 340, clamp(u / d)), 175, lerp(1.06, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var s = bath(t, { win: { x: 170, open: 1 }, fan: { x: 300, y: 70, on: true }, door: { x: 560, open: 0.4 }, shower: { x: 330, on: true, curtain: 60 }, steam: 0.4, steamX: 330 }) + heater(460, 250, 0.7, t, { exhaust: 0.8 });
    s += '<g transform="translate(330 0)">' + face(0, 40 + Math.sin(t * 2) * 2, 24, "happy", t, 0.3) + '<path d="M-22 28 C-28 -8 28 -8 22 28 C13 15 -13 15 -22 28 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/></g>' + sparkles(330, 60, t, 5, 60);
    return s + check(560, 60, 1, true, u, 0.6) + tag("سيب الهوا يدخل", 220, 320, u, 0.8, -2, 18, "#bfe0ff");
  });
  // 25 — outro
  shot(25, function (u, d) { return [lerp(290, 330, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = bath(t, { win: { x: 170, open: 1 }, door: { x: 560, open: 0.4 } }) + heater(HX - 60, HY, 0.7, t, {}) + bather(300, 300, t, "happy", { arm: "up", s: 0.9 });
    return s + tag("قولولنا!", 470, 90, u, 0.3, 3, 28);
  });

  window.__parts = { bath: bath, heater: heater, bather: bather, mol: mol, rbc: rbc, coHaze: coHaze, flameB: flameB, tag: tag, gauge: gauge, kid: kid, sparkles: sparkles };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
