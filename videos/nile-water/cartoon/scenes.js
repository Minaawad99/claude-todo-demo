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

  // ── this episode's pieces: the Nile, the intake, the treatment plant, the pipes to the tap ──
  var MUD = "#8c6a46", CLEAR = "#8fd0ee", INK = "#1c1c1c", GREEN = "#5bbf6a", YEL = "#f2c230";
  var RIVER = "M 660 330 C 540 300 500 210 390 195 S 190 150 90 60";   // the Nile, winding from the right edge to the top left
  function nWaves(t, y0, amp) {
    var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y0 + Math.sin(x * 0.04 + t * 2.2) * (amp || 4) + Math.sin(x * 0.11 - t * 3) * 2);
    return '<path d="' + d + ' V' + (y0 + 40) + ' H-400 Z" fill="#8fd0ee" opacity=".5"/><path d="' + d + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85"/>';
  }
  function nWater(t, y, muddy) {   // a water body from height y to the bottom of the frame
    return '<rect x="-400" y="' + f(y) + '" width="1440" height="' + f(700 - y) + '" fill="' + (muddy ? MUD : "url(#sea1)") + '"/>' + (muddy ? "" : nWaves(t, y, 3));
  }
  function nAlong(pts, s) {   // the point at fraction s (0..1) along a polyline
    var tot = 0, i; for (i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    var want = clamp(s) * tot, acc = 0;
    for (i = 1; i < pts.length; i++) { var sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + sl >= want) { var k = sl ? (want - acc) / sl : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; } acc += sl; }
    return pts[pts.length - 1];
  }
  function nFlow(t, pts, col, n, sp, r) {   // dots that keep moving along a path: the water never stops
    var s = ""; for (var i = 0; i < n; i++) { var p = nAlong(pts, ((t * sp + i / n) % 1)); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + (r || 3) + '" fill="' + (col || "#fff") + '" opacity=".85"/>'; }
    return s;
  }
  function nPipe(pts, w) {   // a steel pipe along a polyline
    var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L");
    return '<path d="' + d + '" stroke="#3d434b" stroke-width="' + (w + 6) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="#c9ced4" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function nTank(x, y, w, h, level, t, muddy, o) {   // a concrete basin cut open to show the water inside
    o = o || {}; var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    var ly = y + h * (1 - level);
    s += '<rect x="' + (x + 6) + '" y="' + f(ly) + '" width="' + (w - 12) + '" height="' + f(y + h - ly - 6) + '" fill="' + (muddy ? MUD : "url(#sea1)") + '" opacity="' + (o.op || 0.95) + '"/>';
    s += '<path d="M' + (x + 6) + ' ' + f(ly) + ' q' + f((w - 12) / 4) + ' -4 ' + f((w - 12) / 2) + ' 0 t' + f((w - 12) / 2) + ' 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>';
    return s;
  }
  function nClump(x, y, t, n, grow, col) {   // little particles stuck together in a clump that keeps growing
    var s = ""; for (var i = 0; i < n; i++) { var a = hash(i) * 6.28, rr = (4 + hash(i + 3) * 9) * grow; s += '<circle cx="' + f(x + Math.cos(a) * rr) + '" cy="' + f(y + Math.sin(a) * rr * 0.7) + '" r="' + f(2 + hash(i + 7) * 2.5) + '" fill="' + (col || "#4a3523") + '"/>'; }
    return s;
  }
  function nMicro(x, y, t, s, mood) {   // a microbe: a little blob with eyes
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')"><ellipse rx="9" ry="7" fill="#9be37a" stroke="' + INK + '" stroke-width="1.6"/>' + '<circle cx="-3" cy="-1" r="1.6" fill="' + INK + '"/><circle cx="3" cy="-1" r="1.6" fill="' + INK + '"/></g>';
  }
  function nQ(x, y, t, sz, col) { return '<text x="' + x + '" y="' + f(y + Math.sin(t * 2.4) * 3) + '" font-family="Noto Sans Arabic" font-weight="900" font-size="' + (sz || 40) + '" text-anchor="middle" fill="' + (col || YEL) + '" stroke="' + INK + '" stroke-width="2" paint-order="stroke">؟</text>'; }
  function nBig(text, x, y, sz, col) { return '<text x="' + x + '" y="' + y + '" font-family="Noto Sans Arabic" font-weight="900" font-size="' + sz + '" text-anchor="middle" fill="' + (col || YEL) + '" stroke="' + INK + '" stroke-width="3" paint-order="stroke">' + text + '</text>'; }
  function nRiverBed(t, o) { o = o || {}; var s = '<path d="' + RIVER + ' L660 360 L-20 360 Z" fill="url(#gSoil)" opacity="0"/>'; return s + '<path d="' + RIVER + '" stroke="#2b86b5" stroke-width="' + (o.w || 30) + '" fill="none" stroke-linecap="round"/><path d="' + RIVER + '" stroke="#bfe6f7" stroke-width="' + ((o.w || 30) * 0.25) + '" fill="none" stroke-dasharray="14 22" stroke-dashoffset="' + f(-t * 60) + '" stroke-linecap="round" opacity=".75"/>'; }
  function nSoil(t, y) { return '<rect x="-400" y="' + y + '" width="1440" height="' + (660 - y) + '" fill="url(#gSoil)"/>' + strataN(y); }
  function strataN(y) { var s = ""; for (var i = 1; i < 6; i++) s += '<path d="M-400 ' + f(y + i * 36) + ' H1040" stroke="#5c4a36" stroke-width="2" opacity=".5"/>'; return s; }
  function nCity(t) { return city(t, 250, 90, "#b9a98a", true, 5, false); }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var CAM = function (x, y, z) { return function (u, d) { var k = clamp(u / d); return [lerp(x[0], x[1], k), lerp(y[0], y[1], k), lerp(z[0], z[1], k)]; }; };

  // 0 — the hook: the tap at home
  shot(0, CAM([300, 330], [170, 180], [1.1, 1.0]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    for (var x = -400; x < 1040; x += 44) s += '<path d="M' + x + ' -300 V260" stroke="#3a5285" stroke-width="2"/>';
    for (var y = -300; y < 260; y += 26) s += '<path d="M-400 ' + y + ' H1040" stroke="#3a5285" stroke-width="2"/>';
    s += '<rect x="150" y="250" width="340" height="110" rx="26" fill="#dfe6ec" stroke="' + INK + '" stroke-width="4"/><rect x="172" y="268" width="296" height="80" rx="18" fill="#9ab4c8"/>';
    s += '<rect x="308" y="110" width="26" height="40" rx="6" fill="url(#steel)" stroke="' + INK + '" stroke-width="3"/>';
    s += nPipe([[321, 120], [321, 84], [352, 84], [352, 152]], 10);
    s += '<rect x="340" y="150" width="24" height="12" rx="4" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="349" y="162" width="6" height="90" fill="#7fd3f5" opacity=".85"/>' + nFlow(t, [[352, 165], [352, 245]], "#bfe6f7", 4, 1.2, 2.4);
    s += '<path d="M352 240 q-10 0 -10 6 q0 5 10 5 q10 0 10 -5 q0 -6 -10 -6z" fill="#fff" opacity="0"/>';
    s += head(120, 200, 30, "curious", t, 1) + '<path d="M90 236 q30 36 62 0" stroke="' + INK + '" stroke-width="5" fill="none"/>';
    s += nQ(120, 130, t, 36) + tag("الميه دي جاية منين؟", 330, 58, u, 0.5, -3, 24);
    return s;
  });

  // 1 — the river is far away from the tap
  shot(1, CAM([320, 300], [180, 170], [1.0, 1.08]), function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 30, 4, 0.8) + nCity(t) + grass(t, 262, "#8fb069", "#6f9550");
    s += nRiverBed(t, { w: 34 }) + nFlow(t, [[660, 330], [520, 290], [390, 195], [90, 60]], "#fff", 6, 0.12, 3);
    s += '<rect x="20" y="260" width="66" height="70" rx="6" fill="#dfe6ec" stroke="' + INK + '" stroke-width="3"/>' + nPipe([[53, 262], [53, 200], [96, 200]], 9);
    s += '<path d="M' + f(260) + ' 210 L' + f(430) + ' 130" stroke="' + YEL + '" stroke-width="3" stroke-dasharray="6 8" stroke-dashoffset="' + f(-t * 30) + '" fill="none"/>';
    return s + tag("من نهر بعيد جداً!", 390, 42, u, 0.9, -2, 24);
  });

  // 2 — muddy water vs clear water
  shot(2, CAM([300, 340], [180, 180], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<rect x="130" y="150" width="130" height="150" rx="10" fill="#fbfbf7" opacity=".25" stroke="' + INK + '" stroke-width="4"/>';
    s += '<rect x="134" y="200" width="122" height="96" rx="6" fill="' + MUD + '"/>' + nClump(195, 240, t, 26, 1, "#5a3d24") + nClump(160, 230, t, 14, 1, "#c09a6a");
    s += '<rect x="380" y="150" width="130" height="150" rx="10" fill="#fbfbf7" opacity=".25" stroke="' + INK + '" stroke-width="4"/>';
    s += '<rect x="384" y="200" width="122" height="96" rx="6" fill="' + CLEAR + '"/>' + '<path d="M390 210 q20 -4 40 0 t40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>';
    s += head(90, 120, 22, "worry", t, 0) + head(550, 120, 22, "happy", t, 0);
    s += nQ(200, 102, t, 40, "#f08a7a") + nQ(440, 102, t, 40, "#f2c230");
    return s + tag("عكرة؟!", 190, 318, u, 0.6, -4, 26) + tag("صافية؟", 445, 318, u, 1.2, 4, 26, "#8fd0ee");
  });

  // 3 — the question
  shot(3, CAM([300, 340], [180, 170], [1.0, 1.1]), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 40, 3, 0.7) + nCity(t) + grass(t, 280, "#8fb069", "#6f9550");
    s += head(320, 210, 48, "curious", t, 1) + '<path d="M290 246 q30 22 60 0" stroke="' + INK + '" stroke-width="5" fill="none"/>';
    s += nQ(430, 190, t, 70) + nQ(210, 160, t, 46);
    return s + tag("إيه الحكاية؟", 320, 62, u, 0.3, -3, 34);
  });

  // 4 — the Nile is very long
  shot(4, CAM([280, 360], [180, 150], [1.0, 1.0]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9e8f4"/>' + clouds(t, 8, 30, 3, 0.6);
    s += '<rect x="-400" y="260" width="1440" height="400" fill="#e8d9b5"/>' + grass(t, 268, "#c2b58f", "#a99c74");
    s += nRiverBed(t, { w: 40 });
    var pts = [[660, 330], [520, 290], [390, 195], [90, 60]], k = clamp(u / 2.6);
    s += '<path d="' + RIVER + '" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="' + f(900 * k) + ' 900" opacity=".8"/>' + nFlow(t, pts, "#fff", 8, 0.1, 3);
    s += '<circle cx="90" cy="60" r="8" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/><circle cx="660" cy="330" r="8" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>';
    return s + tag("حوالي 6650 كم!", 320, 36, u, 1.0, -2, 26);
  });

  // 5 — two sources: the White Nile from the lake, the Blue Nile from the highlands
  shot(5, CAM([320, 320], [180, 180], [1.0, 1.06]), function (u, d, t) {
    var s = sky("day") + clouds(t, 12, 20, 4, 0.8);
    s += '<path d="M-20 230 L120 110 L220 150 L300 80 L400 160 L460 130 L660 230 V360 H-20 Z" fill="#8fb069"/>';
    s += '<path d="M280 80 l20 26 l-16 -4 l-12 10z" fill="#fbfbf7"/>';
    s += '<path d="M470 360 L580 170 L660 200 V360Z" fill="#8a7a66"/><path d="M570 175 L590 180 L580 170z" fill="#fbfbf7"/>';
    s += '<ellipse cx="100" cy="200" rx="62" ry="28" fill="#4fb3d9" stroke="' + INK + '" stroke-width="3"/>';
    var a = [[120, 200], [210, 230], [290, 250], [340, 262]], b = [[540, 190], [470, 220], [400, 240], [340, 262]], c = [[340, 262], [460, 275], [660, 290]];
    s += nFlow(t, a, "#fff", 4, 0.22, 3) + nFlow(t, b, "#fff", 4, 0.22, 3) + nFlow(t, c, "#fff", 6, 0.2, 3);
    s += '<path d="M120 200 C200 228 280 250 340 262" stroke="#2b86b5" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M540 190 C470 218 400 240 340 262" stroke="#4fb3d9" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M340 262 C460 275 560 285 660 290" stroke="#2b86b5" stroke-width="20" fill="none" stroke-linecap="round"/>';
    s += tag("النيل الأبيض", 100, 150, u, 0.4, -3, 19, "#e8f4ff") + tag("النيل الأزرق", 540, 140, u, 1.2, 3, 19, "#8fd0ee");
    return s + tag("بحيرة فيكتوريا", 100, 318, u, 1.8, -2, 16) + tag("هضبة إثيوبيا", 540, 90, u, 2.4, 2, 16);
  });

  // 6 — the Blue Nile gives about 60%
  shot(6, CAM([300, 340], [170, 180], [1.0, 1.04]), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 20, 3, 0.7) + nRiverBed(t, { w: 30 });
    s += gauge(320, 200, 96, clamp(u / 1.6) * 0.6, "");
    s += nBig("60%", 320, 226, 46) + nFlow(t, [[320, 300], [440, 330], [660, 330]], "#fff", 5, 0.2, 3);
    return s + tag("النيل الأزرق لوحده", 320, 54, u, 0.2, -2, 24) + tag("حوالي ستين في المية", 320, 318, u, 1.6, 0, 20);
  });

  // 7 — in the flood season it goes up to 80%
  shot(7, CAM([300, 340], [170, 170], [1.0, 1.05]), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 22, 3, 0.7);
    s += nWater(t, 176, true) + nWaves(t, 176, 6);
    s += '<path d="M-400 240 H1040" stroke="#5c4a36" stroke-width="2" opacity=".5"/>' + nFlow(t, [[-20, 210], [660, 230]], "#e8c48e", 10, 0.18, 3);
    s += gauge(160, 240, 60, 0.8, "") + nBig("80%", 160, 252, 26);
    s += '<path d="M-400 300 H1040" stroke="#5c4a36" stroke-width="2" opacity=".4"/>';
    return s + tag("موسم الفيضان!", 430, 80, u, 0.5, -3, 26) + tag("تمانين في المية", 430, 130, u, 1.6, 2, 22);
  });

  // 8 — the water carries mud, sand and microbes
  shot(8, CAM([300, 330], [180, 170], [1.0, 1.06]), function (u, d, t) {
    var s = nWater(t, -300, true);
    for (var i = 0; i < 40; i++) { var px = hash(i) * 640, py = (hash(i + 5) * 360 + t * (6 + hash(i) * 8) * (i % 2 ? 1 : -1) + 720) % 360; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(1.5 + hash(i + 2) * 3) + '" fill="' + (i % 4 === 0 ? "#f2e0b0" : "#4a3523") + '"/>'; }
    for (var m = 0; m < 4; m++) s += nMicro(90 + m * 150 + Math.sin(t + m) * 10, 120 + Math.cos(t * 1.3 + m) * 40, t, 1.6 + hash(m) * 0.6);
    return s + tag("طين وطمي ورمل", 200, 56, u, 0.5, -3, 22) + tag("وميكروبات!", 460, 300, u, 1.8, 3, 22);
  });

  // 9 — the intake on the river bank, a screen catches the big things
  shot(9, CAM([280, 330], [170, 180], [1.0, 1.05]), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 26, 3, 0.7) + grass(t, 224, "#8fb069", "#6f9550");
    s += nSoil(t, 250);
    s += '<rect x="-400" y="210" width="330" height="60" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="330" y="186" width="310" height="174" fill="' + MUD + '"/>' + nWaves(t, 186, 3);
    s += '<rect x="250" y="190" width="42" height="150" fill="#7d6a58" stroke="' + INK + '" stroke-width="3"/>';
    for (var g = 0; g < 9; g++) s += '<path d="M' + (258 + g * 4) + ' 196 V336" stroke="' + INK + '" stroke-width="1.2" opacity=".7"/>';
    s += '<path d="M250 190 H292 M250 336 H292" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="292" y="250" width="40" height="18" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="230" y="150" width="20" height="8" fill="#8a5a2c" transform="rotate(-20 240 154)"/><path d="M280 300 q14 -10 30 -2" stroke="#5a3d24" stroke-width="5" fill="none"/>';
    s += nFlow(t, [[480, 280], [330, 260], [290, 260]], "#e8c48e", 6, 0.25, 3);
    return s + tag("مأخذ على النهر", 430, 60, u, 0.5, -2, 22) + tag("شبك بيمسك الكبير", 320, 318, u, 1.6, 0, 18);
  });

  // 10 — alum is added and the tiny mud particles stick together
  shot(10, CAM([300, 330], [170, 180], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<path d="M240 40 L380 40 L340 120 L280 120 Z" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="280" y="120" width="60" height="16" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 12; i++) { var p = ((t * 0.9 + i / 12) % 1); s += '<circle cx="' + f(310 + Math.sin(i * 3) * 10 * p) + '" cy="' + f(136 + p * 130) + '" r="2.6" fill="#fbfbf7"/>'; }
    s += nTank(190, 140, 260, 200, 0.92, t, true, { op: 1 });
    var grow = clamp(u / 2.5) * 1.1 + 0.4;
    s += nClump(260, 230, t, 18, grow, "#4a3523") + nClump(360, 270, t, 16, grow, "#4a3523") + nClump(320, 200, t, 10, grow * 0.7, "#c09a6a");
    return s + tag("بيتضاف الشبة", 320, 26, u, 0.4, -2, 24) + tag("الطين بيلزق ويكبر", 320, 318, u, 1.6, 0, 20);
  });

  // 11 — the clumps are heavy and sink to the bottom: sedimentation
  shot(11, CAM([300, 330], [170, 170], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += nTank(150, 80, 340, 240, 0.9, t, false, { op: 0.9 });
    s += '<rect x="156" y="120" width="328" height="190" fill="' + MUD + '" opacity=".25"/>';
    s += '<rect x="156" y="246" width="328" height="24" fill="#5a3d24"/>';
    var fall = clamp(u / 3.0);
    for (var i = 0; i < 9; i++) { var cy = lerp(130, 300, Math.min(1, fall * 1.2 - i * 0.02)); s += nClump(190 + i * 30, cy, t, 6, 1, "#4a3523"); }
    s += '<path d="M156 130 H484" stroke="#fff" stroke-width="2" opacity=".6"/>';
    return s + tag("الترسيب", 320, 52, u, 0.3, -2, 26) + tag("الميه اللي فوق بقت أصفى", 320, 318, u, 1.4, 0, 20);
  });

  // 12 — the sand and gravel filter
  shot(12, CAM([300, 330], [170, 170], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<rect x="170" y="70" width="300" height="250" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="176" y="76" width="288" height="50" fill="' + CLEAR + '" opacity=".75"/>';
    s += '<rect x="176" y="126" width="288" height="78" fill="#e0c27a"/>';
    for (var i = 0; i < 60; i++) s += '<circle cx="' + f(180 + hash(i) * 280) + '" cy="' + f(130 + hash(i + 9) * 70) + '" r="1.6" fill="#b08a44"/>';
    s += '<rect x="176" y="204" width="288" height="60" fill="#9aa2ac"/>';
    for (var j = 0; j < 40; j++) s += '<circle cx="' + f(184 + hash(j + 20) * 272) + '" cy="' + f(212 + hash(j + 30) * 46) + '" r="5" fill="#c9ced4" stroke="#5a6068" stroke-width="1"/>';
    s += '<path d="M176 262 H464" stroke="#2f7fb8" stroke-width="10"/>';
    for (var k = 0; k < 8; k++) { var p = ((t * 0.6 + k / 8) % 1); s += '<circle cx="' + f(200 + k * 36) + '" cy="' + f(92 + p * 150) + '" r="3" fill="' + CLEAR + '" opacity="' + f(1 - p * 0.5) + '"/>'; }
    s += '<path d="M322 262 V330" stroke="#3d434b" stroke-width="16"/>' + '<path d="M322 262 V330" stroke="#c9ced4" stroke-width="8"/>';
    return s + tag("فلاتر رمل وزلط", 320, 40, u, 0.4, -2, 24) + tag("الرمل بيمسك اللي فاضل", 320, 318, u, 1.6, 0, 18);
  });

  // 13 — algae clog the filters
  shot(13, CAM([300, 340], [180, 170], [1.0, 1.06]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<rect x="90" y="150" width="300" height="160" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/><rect x="96" y="196" width="288" height="110" fill="#e0c27a"/>';
    var grow = clamp(u / 2.0);
    for (var i = 0; i < 14; i++) { var r = (8 + hash(i) * 10) * (0.4 + 0.6 * grow); s += '<ellipse cx="' + f(120 + hash(i + 4) * 240) + '" cy="' + f(190 + hash(i + 8) * 8) + '" rx="' + f(r) + '" ry="' + f(r * 0.6) + '" fill="' + GREEN + '" stroke="#2f6f4f" stroke-width="1.5" opacity=".9"/>'; }
    s += head(480, 150, 30, "worry", t, -1) + '<path d="M458 176 q22 -10 44 0" stroke="' + INK + '" stroke-width="4" fill="none"/>';
    s += nQ(520, 110, t, 34, "#f08a7a");
    return s + tag("الطحالب بتسد الفلاتر", 250, 52, u, 0.5, -3, 22) + tag("الجرعات لازم تتضبط!", 260, 318, u, 1.8, 0, 18);
  });

  // 14 — chlorine kills the leftover microbes
  shot(14, CAM([300, 340], [170, 180], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<rect x="60" y="60" width="90" height="120" rx="14" fill="#dfe6ec" stroke="' + INK + '" stroke-width="3"/><rect x="66" y="110" width="78" height="64" fill="#e7f57a" opacity=".8"/>';
    s += '<path d="M105 180 L105 196" stroke="#e7f57a" stroke-width="5" stroke-linecap="round"/>' + nFlow(t, [[105, 190], [105, 240]], "#e7f57a", 2, 0.6, 3);
    s += nTank(190, 180, 260, 150, 0.8, t, false, {});
    var pop = clamp(u / 2.2);
    for (var i = 0; i < 5; i++) { var sc = Math.max(0.05, 1 - pop * 1.4 + (i % 2) * 0.1); s += nMicro(230 + i * 40, 230 - (i % 2) * 30, t, sc * 1.8); }
    for (var k = 0; k < 4; k++) { var ps = clamp((u - 1.5) / 1.5); if (ps > 0) s += '<circle cx="' + f(240 + k * 40) + '" cy="' + f(210 - (k % 2) * 30) + '" r="' + f(ps * 16) + '" fill="none" stroke="#e7f57a" stroke-width="2" opacity="' + f(1 - ps) + '"/>'; }
    return s + tag("كلور بيقتل الميكروبات", 320, 52, u, 0.5, -2, 22) + tag("بكمية صغيرة", 320, 318, u, 1.8, 0, 20);
  });

  // 15 — a little chlorine stays in the pipe to keep the water safe
  shot(15, CAM([280, 360], [170, 180], [1.0, 1.04]), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 30, 3, 0.7) + grass(t, 250, "#8fb069", "#6f9550") + nSoil(t, 262);
    s += nPipe([[-20, 200], [660, 200]], 26) + nFlow(t, [[-20, 200], [660, 200]], "#e7f57a", 14, 0.16, 3.5);
    s += nFlow(t, [[-20, 200], [660, 200]], "#2f7fb8", 6, 0.16, 2);
    s += '<path d="M220 220 V262" stroke="' + INK + '" stroke-width="3"/>' + head(120, 160, 22, "curious", t, 1);
    return s + tag("الكلور بيفضل شوية", 320, 50, u, 0.5, -2, 24) + tag("علشان الميه تفضل سليمة", 320, 318, u, 1.6, 0, 19);
  });

  // 16 — the water is stored in a big tank under the ground
  shot(16, CAM([300, 330], [170, 180], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8c7258"/>' + '<rect x="-400" y="-300" width="1440" height="200" fill="url(#sky-day)"/>';
    s += '<rect x="-400" y="110" width="1440" height="250" fill="url(#gSoil)"/>' + strataN(110);
    s += nTank(170, 140, 300, 170, 0.75, t, false, { op: 0.95 });
    var fill = clamp(u / 2.5) * 0.25;
    s += '<rect x="176" y="' + f(140 + 170 * (1 - 0.75 - fill)) + '" width="288" height="4" fill="#fff" opacity=".6"/>';
    s += nFlow(t, [[60, 80], [170, 160]], "#8fd0ee", 4, 0.3, 3) + '<path d="M60 80 V110" stroke="#3d434b" stroke-width="10"/>';
    s += '<path d="M470 228 H640" stroke="#3d434b" stroke-width="10"/><path d="M470 228 H640" stroke="#c9ced4" stroke-width="5"/>' + nFlow(t, [[470, 228], [640, 228]], "#bfe6f7", 4, 0.3, 2.6);
    return s + tag("خزان تحت الأرض", 320, 40, u, 0.5, -2, 26) + tag("جوه المحطة", 320, 318, u, 1.6, 0, 20);
  });

  // 17 — the big pumps push the water into the pipes
  shot(17, CAM([280, 360], [170, 180], [1.0, 1.05]), function (u, d, t) {
    var s = sky("day") + clouds(t, 12, 30, 3, 0.7) + grass(t, 270, "#8fb069", "#6f9550") + nSoil(t, 282);
    s += '<rect x="90" y="150" width="130" height="130" rx="14" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<g transform="translate(155 210) rotate(' + f(t * 240) + ')">' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<path d="M0 0 L' + f(Math.cos(a * Math.PI / 180) * 36) + ' ' + f(Math.sin(a * Math.PI / 180) * 36) + '" stroke="#c9ced4" stroke-width="10" stroke-linecap="round"/>'; }).join("") + '</g><circle cx="155" cy="210" r="8" fill="' + INK + '"/>';
    s += nPipe([[220, 210], [640, 210]], 24) + nFlow(t, [[220, 210], [640, 210]], "#bfe6f7", 12, 0.22, 3.4);
    return s + tag("طلمبات قوية", 170, 110, u, 0.4, -3, 22) + tag("بتدفع الميه في المواسير", 430, 110, u, 1.3, 2, 18);
  });

  // 18 — the pipe runs for tens of kilometres under the road
  shot(18, CAM([320, 320], [180, 180], [1.0, 1.04]), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 30, 3, 0.7) + city(t, 230, 80, "#7a6a5a", true, 8, false);
    s += '<rect x="-400" y="250" width="1440" height="200" fill="#4b4f57"/>' + '<path d="M-400 282 H1040" stroke="#f2c230" stroke-width="3" stroke-dasharray="26 22" stroke-dashoffset="' + f(-t * 120) + '"/>';
    s += cars(t, 300, 60);
    s += nPipe([[-20, 236], [660, 236]], 14) + nFlow(t, [[-20, 236], [660, 236]], "#bfe6f7", 10, 0.2, 2.6);
    s += '<rect x="410" y="190" width="120" height="36" rx="6" fill="#2b6a4f" stroke="' + INK + '" stroke-width="2"/>' + '<text x="470" y="215" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="16" fill="#fff">كم 18</text>';
    return s + tag("عشرات الكيلومترات", 320, 60, u, 0.5, -2, 26);
  });

  // 19 — booster pumps on the way keep the pressure up
  shot(19, CAM([300, 330], [170, 170], [1.0, 1.06]), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 26, 3, 0.7) + grass(t, 262, "#8fb069", "#6f9550") + nSoil(t, 276);
    s += '<rect x="200" y="170" width="200" height="110" rx="10" fill="url(#gConc)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<g transform="translate(300 220) rotate(' + f(t * 300) + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<path d="M0 0 L' + f(Math.cos(a * Math.PI / 180) * 28) + ' ' + f(Math.sin(a * Math.PI / 180) * 28) + '" stroke="#c9ced4" stroke-width="8" stroke-linecap="round"/>'; }).join("") + '</g>';
    s += nPipe([[-20, 220], [200, 220]], 22) + nPipe([[400, 220], [660, 220]], 22) + nFlow(t, [[-20, 220], [660, 220]], "#bfe6f7", 12, 0.2, 3.2);
    s += gauge(540, 120, 40, clamp(u / 1.5) * 0.7 + 0.2, "");
    return s + tag("محطة تقوية", 300, 80, u, 0.5, -2, 24) + tag("الضغط بيرجع قوي تاني", 300, 318, u, 1.6, 0, 19);
  });

  // 20 — at home the tap gives clean water
  shot(20, CAM([300, 340], [170, 180], [1.0, 1.04]), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 28, 3, 0.7) + nCity(t);
    s += '<rect x="330" y="150" width="280" height="170" fill="#e8d9b5" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="330" y="240" width="280" height="80" fill="#b9d8ec" opacity=".5"/>';
    s += '<rect x="410" y="200" width="150" height="10" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/>';
    s += nPipe([[470, 150], [470, 200]], 8);
    s += '<path d="M470 210 V246" stroke="#bfe6f7" stroke-width="6" stroke-linecap="round"/>' + nFlow(t, [[470, 212], [470, 240]], "#fff", 3, 1.0, 2.2);
    var fill = clamp(u / 2.5) * 46;
    s += '<path d="M440 310 H500 L496 262 H444 Z" fill="rgba(255,255,255,.3)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="446" y="' + f(306 - fill) + '" width="48" height="' + f(fill) + '" fill="' + CLEAR + '"/>';
    s += head(170, 220, 36, "happy", t, 1) + '<path d="M140 252 q30 26 60 0" stroke="' + INK + '" stroke-width="5" fill="none"/>';
    return s + tag("الحنفية اللي إنت فاتحها!", 320, 60, u, 0.4, -2, 22);
  });

  // 21 — the lab takes samples and checks the water
  shot(21, CAM([300, 340], [170, 180], [1.0, 1.04]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f2d4d"/>';
    for (var x = -400; x < 1040; x += 60) s += '<path d="M' + x + ' -300 V260" stroke="#2c3e66" stroke-width="2"/>';
    s += '<rect x="-400" y="240" width="1440" height="120" fill="#2c3e66"/>';
    s += '<rect x="90" y="150" width="110" height="20" fill="#3a5285"/><rect x="92" y="170" width="106" height="70" fill="#2c3e66"/>';
    for (var i = 0; i < 4; i++) { s += '<rect x="' + (110 + i * 22) + '" y="130" width="14" height="36" rx="4" fill="' + CLEAR + '" opacity="' + f(0.3 + 0.2 * i) + '" stroke="#fff" stroke-width="1.5"/>'; }
    s += '<rect x="380" y="90" width="150" height="110" rx="10" fill="#0f1a2e" stroke="#7fd3f5" stroke-width="3"/>';
    s += '<text x="455" y="120" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="14" fill="#7fd3f5">NTU</text>';
    s += '<text x="455" y="170" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="46" fill="#5bbf6a">' + (u < 1 ? "12.0" : "0.4") + '</text>';
    s += head(280, 200, 30, "happy", t, -1) + '<path d="M258 228 q22 16 44 0" stroke="' + INK + '" stroke-width="4" fill="none"/>';
    s += '<path d="M440 210 l14 14 l28 -30" stroke="#5bbf6a" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="' + f(clamp((u - 1.6) / 0.6)) + '"/>';
    return s + tag("معمل التحاليل", 320, 50, u, 0.4, -2, 24) + tag("بياخد عينات كل فترة", 320, 318, u, 1.6, 0, 19);
  });

  // 22 — the clean water comes out of the tap
  shot(22, CAM([300, 330], [170, 180], [1.0, 1.05]), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3f68"/>';
    s += '<rect x="90" y="250" width="460" height="110" rx="26" fill="#dfe6ec" stroke="' + INK + '" stroke-width="4"/>';
    s += nPipe([[320, 40], [320, 96], [354, 96], [354, 150]], 12);
    s += '<path d="M354 160 V236" stroke="' + CLEAR + '" stroke-width="8" stroke-linecap="round"/>' + nFlow(t, [[354, 160], [354, 236]], "#fff", 5, 1.2, 2.6);
    s += '<rect x="304" y="240" width="100" height="60" rx="10" fill="rgba(255,255,255,.3)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="308" y="' + f(296 - clamp(u / 2.4) * 52) + '" width="92" height="' + f(clamp(u / 2.4) * 52) + '" fill="' + CLEAR + '"/>';
    s += head(120, 220, 30, "happy", t, 1);
    return s + tag("صافية!", 470, 60, u, 0.4, 4, 28, "#8fd0ee");
  });

  // 23 — the payoff: the water in your glass started in the Ethiopian highlands
  shot(23, CAM([300, 340], [170, 180], [1.0, 1.06]), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 30, 3, 0.7);
    s += '<path d="M-20 240 L120 90 L220 140 L300 60 L400 160 L460 130 L660 240 V360 H-20 Z" fill="#8fb069"/><path d="M280 60 l20 26 l-16 -4 l-12 10z" fill="#fbfbf7"/>';
    s += nFlow(t, [[120, 150], [260, 170], [420, 210], [560, 240]], "#fff", 8, 0.16, 3.2);
    s += '<path d="M120 150 C190 160 260 170 300 190 S470 230 560 240" stroke="#2b86b5" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="2 14"/>';
    s += '<rect x="540" y="200" width="80" height="60" fill="#dfe6ec" stroke="' + INK + '" stroke-width="3"/><path d="M530 200 L580 170 L630 200Z" fill="#c75a4a" stroke="' + INK + '" stroke-width="3"/>';
    return s + tag("من هضبة إثيوبيا لحنفيتك", 320, 62, u, 0.4, -2, 22);
  });

  // 24 — the call to action, as in the other episodes
  shot(24, CAM([290, 360], [180, 180], [1.0, 1.0]), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 40, 3, 0.7) + nCity(t) + grass(t, 280, "#8fb069", "#6f9550");
    s += head(320, 210, 46, "happy", t, 0) + '<path d="M292 240 q28 24 56 0" stroke="' + INK + '" stroke-width="5" fill="none"/>';
    return s + tag("قولولنا!", 470, 80, u, 0.4, 3, 26);
  });

  window.__parts = { nTank: nTank, nPipe: nPipe, nFlow: nFlow, nWater: nWater, head: head, tag: tag, gauge: gauge, nMicro: nMicro, nRiverBed: nRiverBed };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
