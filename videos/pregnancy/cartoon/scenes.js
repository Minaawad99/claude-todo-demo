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

  // ── new pieces for this episode (anatomy drawn from medical illustrations, embryology plates and ultrasound photos: ../refs/SOURCES.md) ──
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

  // ── backgrounds ─────────────────────────────────────────
  // inside the body: warm red light through the belly, soft moving glows, drifting specks
  function inside(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gInside)"/>';
    for (var i = 0; i < 7; i++) { var x = 320 + Math.sin(t * 0.31 + i * 1.7) * 330, y = 180 + Math.cos(t * 0.27 + i * 2.3) * 170; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(70 + hash(i) * 90) + '" fill="#ff8a6a" opacity=".13" filter="url(#soft)"/>'; }
    for (var k = 0; k < 36; k++) { var px = ((hash(k) * 1300 + t * (6 + hash(k + 3) * 10)) % 1300) - 330, py = -120 + hash(k + 7) * 600 + Math.sin(t * 0.8 + k) * 12; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(1 + hash(k + 2) * 2.2) + '" fill="#ffd9c8" opacity="' + f(0.15 + 0.25 * Math.abs(Math.sin(t + k))) + '"/>'; }
    return s;
  }
  // a living room: wall, window with moving clouds and curtains, a ticking clock, a plant, a lamp, a sofa
  function room(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gWall)"/>', wx = o.wx == null ? 90 : o.wx, sk = o.sky || "day";
    s += '<rect x="' + (wx - 66) + '" y="34" width="132" height="150" fill="url(#sky-' + sk + ')"/>';
    for (var c = 0; c < 3; c++) { var cx = wx - 50 + ((t * 9 + c * 47) % 100), cy = 62 + c * 34; s += '<ellipse cx="' + f(cx) + '" cy="' + cy + '" rx="14" ry="5" fill="#fff" opacity=".9"/><ellipse cx="' + f(cx + 6) + '" cy="' + (cy - 4) + '" rx="8" ry="5" fill="#fff" opacity=".9"/>'; }
    s += '<rect x="' + (wx - 66) + '" y="34" width="132" height="150" fill="none" stroke="#8a6a4a" stroke-width="7"/><path d="M' + wx + ' 34 V184 M' + (wx - 66) + ' 108 H' + (wx + 66) + '" stroke="#8a6a4a" stroke-width="4"/><rect x="' + (wx - 76) + '" y="182" width="152" height="9" fill="#a8845e" stroke="' + INK + '" stroke-width="1.4"/>';
    var sw = Math.sin(t * 1.3) * 6;
    s += '<path d="M' + (wx - 86) + ' 22 Q' + f(wx - 70 + sw) + ' 110 ' + f(wx - 80 + sw * 1.4) + ' 200 H' + (wx - 56) + ' Q' + f(wx - 50 + sw) + ' 110 ' + (wx - 58) + ' 22 Z" fill="#d9826a" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M' + (wx + 86) + ' 22 Q' + f(wx + 70 + sw) + ' 110 ' + f(wx + 80 + sw * 1.4) + ' 200 H' + (wx + 56) + ' Q' + f(wx + 50 + sw) + ' 110 ' + (wx + 58) + ' 22 Z" fill="#d9826a" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (wx - 96) + '" y="16" width="192" height="8" rx="4" fill="#6a4a2a"/>';
    // clock
    var ck = o.clock == null ? 560 : o.clock, a = t * 6 * Math.PI / 180 * 6;
    s += '<circle cx="' + ck + '" cy="60" r="24" fill="#fffdf6" stroke="#6a4a2a" stroke-width="4"/>'; for (var h = 0; h < 12; h++) s += '<path d="M' + f(ck + Math.sin(h * 0.5236) * 18) + ' ' + f(60 - Math.cos(h * 0.5236) * 18) + ' L' + f(ck + Math.sin(h * 0.5236) * 21) + ' ' + f(60 - Math.cos(h * 0.5236) * 21) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M' + ck + ' 60 L' + f(ck + Math.sin(t * 0.05) * 11) + ' ' + f(60 - Math.cos(t * 0.05) * 11) + ' M' + ck + ' 60 L' + f(ck + Math.sin(a) * 18) + ' ' + f(60 - Math.cos(a) * 18) + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><circle cx="' + ck + '" cy="60" r="2.4" fill="#c23a26"/>';
    // floor
    s += '<rect x="-400" y="300" width="1440" height="400" fill="url(#gFloor)"/><path d="M-400 300 H1040" stroke="#6a4a2a" stroke-width="4"/>'; for (var p = -400; p < 1040; p += 70) s += '<path d="M' + p + ' 300 L' + (p - 40) + ' 420" stroke="#7a5434" stroke-width="1.4" opacity=".5"/>';
    // plant
    var px = o.plant == null ? 600 : o.plant; s += '<path d="M' + (px - 18) + ' 300 L' + (px - 14) + ' 262 H' + (px + 14) + ' L' + (px + 18) + ' 300 Z" fill="#c9673a" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var l = 0; l < 7; l++) { var la = -1.2 + l * 0.4 + Math.sin(t * 1.4 + l) * 0.06; s += '<path d="M' + px + ' 262 Q' + f(px + Math.sin(la) * 30) + ' ' + f(262 - Math.cos(la) * 40) + ' ' + f(px + Math.sin(la) * 52) + ' ' + f(262 - Math.cos(la) * 62) + ' Q' + f(px + Math.sin(la) * 22) + ' ' + f(262 - Math.cos(la) * 24) + ' ' + px + ' 262 Z" fill="#4f8f4a" stroke="#2a5a2a" stroke-width="1.2"/>'; }
    if (o.sofa) s += '<path d="M' + (o.sofa - 120) + ' 300 V236 Q' + (o.sofa - 120) + ' 220 ' + (o.sofa - 104) + ' 220 H' + (o.sofa + 104) + ' Q' + (o.sofa + 120) + ' 220 ' + (o.sofa + 120) + ' 236 V300 Z" fill="url(#gSofa)" stroke="' + INK + '" stroke-width="2"/><rect x="' + (o.sofa - 104) + '" y="252" width="208" height="30" rx="8" fill="#6f9fb8" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.lamp) { s += '<circle cx="' + o.lamp + '" cy="150" r="60" fill="url(#gWarm)" opacity="' + f(0.5 + 0.1 * Math.sin(t * 3)) + '"/><path d="M' + o.lamp + ' 170 V300 M' + (o.lamp - 16) + ' 300 H' + (o.lamp + 16) + '" stroke="#5a4a3a" stroke-width="4"/><path d="M' + (o.lamp - 24) + ' 172 L' + (o.lamp - 14) + ' 136 H' + (o.lamp + 14) + ' L' + (o.lamp + 24) + ' 172 Z" fill="#f4e2b8" stroke="' + INK + '" stroke-width="1.6"/>'; }
    return s;
  }
  function notebook(t) {   // lined paper with a red margin
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gPaper)"/>';
    for (var y = -280; y < 660; y += 28) s += '<path d="M-400 ' + y + ' H1040" stroke="#9fc2e6" stroke-width="1.6"/>';
    return s + '<path d="M70 -300 V660" stroke="#e57a7a" stroke-width="2"/>';
  }

  // ── cells, embryo, fetus ────────────────────────────────
  // the fertilised egg and its first divisions: shell (zona pellucida) + n cells (1, 2, 4, 8, 16 = the morula)
  function cell(x, y, r, t, n) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(t * 10) + ') scale(' + f(1 + 0.03 * Math.sin(t * 2.5)) + ')">';
    s += '<circle r="' + f(r * 1.3) + '" fill="#fff" opacity=".14" filter="url(#soft2)"/><circle r="' + f(r) + '" fill="#fff4e4" fill-opacity=".22" stroke="#efdcc0" stroke-width="' + f(r * 0.1) + '"/>';
    var P = n <= 1 ? [[0, 0, 0.82]] : n === 2 ? [[-0.4, 0, 0.42], [0.4, 0, 0.42]] : n <= 4 ? [[-0.36, -0.3, 0.38], [0.38, -0.28, 0.38], [-0.3, 0.38, 0.38], [0.34, 0.36, 0.38]] : n <= 8 ? [[0, 0, 0.3], [0.5, 0, 0.28], [-0.5, 0, 0.28], [0.25, 0.45, 0.28], [-0.25, 0.45, 0.28], [0.25, -0.45, 0.28], [-0.25, -0.45, 0.28], [0, -0.05, 0.22]] : null;
    if (!P) { P = []; for (var i = 0; i < 18; i++) { var a = i * 2.4, rr = 0.62 * Math.sqrt((i + 0.5) / 18); P.push([Math.cos(a) * rr, Math.sin(a) * rr, 0.2]); } }
    P.forEach(function (p, i) { s += '<circle cx="' + f(p[0] * r) + '" cy="' + f(p[1] * r) + '" r="' + f(p[2] * r) + '" fill="url(#gCell)" stroke="#c49a76" stroke-width="' + f(Math.max(0.8, r * 0.025)) + '"/><circle cx="' + f(p[0] * r + p[2] * r * 0.15) + '" cy="' + f(p[1] * r) + '" r="' + f(p[2] * r * 0.24) + '" fill="#c9a07a" opacity=".7"/>'; });
    if (n <= 1) { s += '<circle cx="' + f(-r * 0.16) + '" cy="' + f(-r * 0.05) + '" r="' + f(r * 0.17) + '" fill="#e2c39e" stroke="#b38a64" stroke-width="1"/><circle cx="' + f(r * 0.18) + '" cy="' + f(r * 0.06) + '" r="' + f(r * 0.15) + '" fill="#e2c39e" stroke="#b38a64" stroke-width="1"/>'; for (var g = 0; g < 22; g++) s += '<circle cx="' + f((hash(g) - 0.5) * r * 1.3) + '" cy="' + f((hash(g + 5) - 0.5) * r * 1.3) + '" r="' + f(r * 0.022) + '" fill="#b88a64" opacity=".5"/>'; }
    return s + '</g>';
  }
  // the embryo at about six weeks: curled like a C, big head, eye spot, pharyngeal arches, the heart bulge (beating), limb buds, tail
  function embryo(x, y, sc, t, o) {
    o = o || {}; var beat = Math.pow(Math.max(0, Math.sin(t * 1.85 * Math.PI)), 6), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 0.8) * 3) + ') scale(' + sc + ')">';
    s += '<path d="M10 76 Q-2 104 -22 98 Q-34 92 -28 84" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M10 76 Q-2 104 -22 98 Q-34 92 -28 84" stroke="#ec9c94" stroke-width="6.5" fill="none" stroke-linecap="round"/>';
    s += '<path d="M0 -70 C40 -76 66 -50 56 -24 C52 -12 40 -8 42 0 Q46 6 36 8 C60 12 64 44 34 52 C26 56 24 70 12 80 C-4 92 -30 84 -44 60 C-60 32 -60 -20 -40 -50 C-30 -64 -16 -70 0 -70 Z" fill="url(#gEmb)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<ellipse cx="8" cy="-46" rx="28" ry="17" fill="#fff" opacity=".22"/><ellipse cx="-14" cy="-24" rx="16" ry="12" fill="#fff" opacity=".14"/>';
    for (var k = 0; k < 15; k++) { var a = (232 - k * 7.6) * Math.PI / 180; s += '<path d="M' + f(Math.cos(a) * 46) + ' ' + f(10 + Math.sin(a) * 66) + ' L' + f(Math.cos(a) * 38) + ' ' + f(10 + Math.sin(a) * 56) + '" stroke="#c9605c" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'; }
    s += '<path d="M40 -6 q6 4 0 8 M36 2 q6 4 0 8" stroke="#c9605c" stroke-width="1.8" fill="none"/>';
    s += '<circle cx="36" cy="-38" r="7" fill="#4a2a2a"/><circle cx="34" cy="-40" r="2" fill="#fff" opacity=".7"/>';
    s += '<ellipse cx="22" cy="24" rx="11" ry="6" fill="#ec9c94" stroke="' + INK + '" stroke-width="1.6" transform="rotate(50 22 24)"/><ellipse cx="4" cy="66" rx="10" ry="5.5" fill="#ec9c94" stroke="' + INK + '" stroke-width="1.6" transform="rotate(-30 4 66)"/>';
    var hr = 11 * (1 + 0.22 * beat); s += '<circle cx="44" cy="28" r="' + f(hr * 2) + '" fill="#ff4a5a" opacity="' + f(0.35 * beat) + '" filter="url(#glow)"/><circle cx="44" cy="28" r="' + f(hr) + '" fill="#d8203a" stroke="#8a1020" stroke-width="1.4"/><circle cx="40" cy="25" r="' + f(hr * 0.3) + '" fill="#ff8a96" opacity=".7"/>';
    return s + '</g>';
  }
  // a hand with five fingers (the 10-week hand, a little webbed)
  function hand(x, y, sc, t, col) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 1.5) * 6) + ') scale(' + sc + ')">', c = col || "#f0a898";
    [[-30, -50, -0.5], [-12, -64, -0.18], [6, -66, 0.08], [22, -58, 0.32], [40, -22, 0.9]].forEach(function (p, i) { var w = i === 4 ? 0.3 * Math.sin(t * 2) : 0.08 * Math.sin(t * 3 + i); s += limb(i === 4 ? 24 : p[0] * 0.5, i === 4 ? 6 : -14, p[0] + w * 20, p[1], 15, c); });
    return s + '<ellipse cx="0" cy="4" rx="34" ry="30" fill="' + c + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-14 -6 Q0 6 16 -4" stroke="#c9706a" stroke-width="1.6" fill="none"/></g>';
  }
  // organs seen through the skin of the young fetus (k = how much shows)
  function organs(k, t, bw) {
    var beat = Math.pow(Math.max(0, Math.sin(t * 2.6 * Math.PI)), 6), s = '<g opacity="' + f(clamp(k)) + '">';
    s += '<path d="M' + f(-36 * bw) + ' -14 Q' + f(-52 * bw) + ' 30 ' + f(-34 * bw) + ' 76" stroke="#f6e6c8" stroke-width="7" stroke-dasharray="5 3" fill="none"/>';
    s += '<path d="M2 18 C10 6 34 10 34 24 C34 38 14 44 4 36 C-2 30 -4 24 2 18 Z" fill="#8a2a26" stroke="#5a1410" stroke-width="1.4" opacity=".9"/>';
    s += '<ellipse cx="' + f(-28 * bw) + '" cy="42" rx="7" ry="11" fill="#b8504a" stroke="#6a2020" stroke-width="1.2" transform="rotate(-15 ' + f(-28 * bw) + ' 42)"/>';
    var r = 9 * (1 + 0.2 * beat); s += '<circle cx="14" cy="-2" r="' + f(r * 2) + '" fill="#ff4a5a" opacity="' + f(0.4 * beat) + '" filter="url(#glow)"/><path d="M14 ' + f(-2 + r) + ' C' + f(14 - r * 1.4) + ' ' + f(-2) + ' ' + f(14 - r) + ' ' + f(-2 - r) + ' 14 ' + f(-2 - r * 0.4) + ' C' + f(14 + r) + ' ' + f(-2 - r) + ' ' + f(14 + r * 1.4) + ' -2 14 ' + f(-2 + r) + ' Z" fill="#d8203a" stroke="#8a1020" stroke-width="1.2"/>';
    return s + '</g>';
  }
  // the fetus from the side, curled up, facing right, head up. g: 0 = 10–12 weeks (thin, see-through, big head) … 1 = 40 weeks (chubby).
  // o: {eyes: 0..1 open, kick: 0..1, organs: 0..1, rot, hair}. The cord goes in at FB (local units).
  var FB = [36, 44];
  function fetus(x, y, sc, t, o) {
    o = o || {}; var g = clamp(o.g == null ? 0.6 : o.g), bw = 0.8 + 0.4 * g, young = g < 0.3, sk = young ? "url(#gSkinY)" : "url(#gSkin)", lc = young ? "#ef9e92" : "#f0b296", ld = young ? "#d47a72" : "#d9937a";
    var hr = lerp(56, 41, g), hx = 10, hy = -58 - (1 - g) * 8, nod = Math.sin(t * 0.9) * 3, kick = clamp(o.kick || 0), aw = Math.sin(t * 1.3) * 4;
    var s = '<g transform="translate(' + f(x + Math.sin(t * 0.9) * 3 * sc) + ' ' + f(y + Math.sin(t * 1.1) * 4 * sc) + ') rotate(' + f((o.rot || 0) + Math.sin(t * 0.7) * 3) + ') scale(' + sc + ')">';
    s += limb(-22, 66, 44, 32, 15 * bw, ld) + limb(44, 32, 16, 88, 12 * bw, ld);
    s += limb(-2, -8, 16, 24, 10 * bw, ld) + limb(16, 24, 46, -10 + aw, 9 * bw, ld);
    s += '<path d="M' + f(-24 * bw) + ' -32 C' + f(-58 * bw) + ' -6 ' + f(-64 * bw) + ' 52 ' + f(-40 * bw) + ' 84 C' + f(-18 * bw) + ' 104 ' + f(26 * bw) + ' 98 ' + f(40 * bw) + ' 62 C' + f(54 * bw) + ' 30 ' + f(44 * bw) + ' -12 ' + f(20 * bw) + ' -28 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.2"/>';
    if (young) { for (var v = 0; v < 9; v++) s += '<ellipse cx="' + f((-44 + Math.pow((v - 4) / 4, 2) * 9) * bw) + '" cy="' + f(-16 + v * 11) + '" rx="4" ry="3" fill="#e2706a" opacity=".5"/>'; s += '<path d="M0 0 Q10 20 -5 40 M10 10 Q20 30 15 55 M-20 10 Q-10 30 -24 52" stroke="#d2545a" stroke-width="1.2" fill="none" opacity=".55"/>'; }
    if (o.organs) s += organs(o.organs, t, bw);
    if (g > 0.75) s += '<path d="M' + f(-40 * bw) + ' 20 Q' + f(-20 * bw) + ' 30 ' + f(-30 * bw) + ' 56" stroke="#e0a088" stroke-width="2" fill="none" opacity=".6"/>';
    FB = [36 * bw, 46];
    var kx = 50 + kick * 40, ky = 36 - kick * 8, fx = 22 + kick * 74, fy = 94 - kick * 34;
    s += limb(-16, 70, kx, ky, 19 * bw, lc) + limb(kx, ky, fx, fy, 14 * bw, lc);
    s += '<ellipse cx="' + f(fx + 9) + '" cy="' + f(fy + 2) + '" rx="' + f(12 * bw) + '" ry="' + f(6.5 * bw) + '" fill="' + lc + '" stroke="' + INK + '" stroke-width="1.8" transform="rotate(' + f(-8 - kick * 40) + ' ' + f(fx + 9) + ' ' + f(fy + 2) + ')"/>';
    // head (profile: forehead, nose, lips, chin), ear, eye, cheek
    var R = hr, P = function (a, b) { return f(hx + R * a) + ' ' + f(hy + R * b); };
    s += '<g transform="rotate(' + f(nod) + ' ' + hx + ' ' + f(hy + hr * 0.7) + ')">';
    s += '<path d="M' + P(0, -1) + ' A' + f(R) + ' ' + f(R) + ' 0 0 1 ' + P(0.96, -0.28) + ' Q' + P(1.14, 0.02) + ' ' + P(0.97, 0.2) + ' Q' + P(1.0, 0.42) + ' ' + P(0.86, 0.5) + ' Q' + P(0.84, 0.72) + ' ' + P(0.6, 0.8) + ' A' + f(R) + ' ' + f(R) + ' 0 1 1 ' + P(0, -1) + ' Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.2"/>';
    if (young) s += '<path d="M' + P(-0.2, -0.6) + ' Q' + P(0.1, -0.2) + ' ' + P(-0.3, 0.2) + '" stroke="#d2545a" stroke-width="1.2" fill="none" opacity=".5"/>';
    if (o.organs) s += '<g opacity="' + f(clamp(o.organs)) + '"><path d="M' + P(-0.62, 0.05) + ' C' + P(-0.7, -0.6) + ' ' + P(0.2, -0.9) + ' ' + P(0.55, -0.45) + ' C' + P(0.7, -0.2) + ' ' + P(0.45, 0.05) + ' ' + P(0.2, 0.1) + ' C' + P(-0.1, 0.25) + ' ' + P(-0.5, 0.3) + ' ' + P(-0.62, 0.05) + ' Z" fill="#f7c0c8" stroke="#c46a7a" stroke-width="1.4"/><path d="M' + P(-0.4, -0.2) + ' Q' + P(-0.1, -0.4) + ' ' + P(0.2, -0.3) + ' M' + P(-0.3, 0.05) + ' Q' + P(0, -0.1) + ' ' + P(0.3, -0.05) + '" stroke="#c46a7a" stroke-width="1.2" fill="none"/></g>';
    s += '<path d="M' + P(-0.02, -0.06) + ' C' + P(-0.24, -0.08) + ' ' + P(-0.24, 0.3) + ' ' + P(-0.02, 0.3) + '" stroke="' + INK + '" stroke-width="1.8" fill="' + ld + '"/><path d="M' + P(-0.06, 0.02) + ' C' + P(-0.14, 0.04) + ' ' + P(-0.14, 0.2) + ' ' + P(-0.05, 0.2) + '" stroke="#b8705e" stroke-width="1.2" fill="none"/>';
    s += '<circle cx="' + f(hx + R * 0.56) + '" cy="' + f(hy + R * 0.3) + '" r="' + f(R * 0.16) + '" fill="#ff8a8a" opacity=".25"/>';
    var eo = clamp(o.eyes || 0), blink = ((t * 0.4) % 1) < 0.06, ex = hx + R * 0.6, ey = hy - R * 0.08;
    if (eo > 0.5 && !blink) s += '<ellipse cx="' + f(ex) + '" cy="' + f(ey) + '" rx="' + f(R * 0.1) + '" ry="' + f(R * 0.13 * eo) + '" fill="#2a1a18"/><circle cx="' + f(ex - R * 0.03) + '" cy="' + f(ey - R * 0.04) + '" r="' + f(R * 0.035) + '" fill="#fff"/><path d="M' + f(ex - R * 0.14) + ' ' + f(ey - R * 0.14) + ' Q' + f(ex) + ' ' + f(ey - R * 0.22) + ' ' + f(ex + R * 0.14) + ' ' + f(ey - R * 0.12) + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    else s += '<path d="M' + f(ex - R * 0.15) + ' ' + f(ey) + ' Q' + f(ex) + ' ' + f(ey + R * 0.1) + ' ' + f(ex + R * 0.15) + ' ' + f(ey - R * 0.02) + '" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    s += '<path d="M' + P(0.78, 0.38) + ' q' + f(R * 0.06) + ' ' + f(R * 0.03) + ' ' + f(R * 0.1) + ' 0" stroke="#9a4a40" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    if (g > 0.8 || o.hair) for (var hh = 0; hh < 7; hh++) { var ha = (-150 + hh * 14) * Math.PI / 180; s += '<path d="M' + f(hx + Math.cos(ha) * R * 0.92) + ' ' + f(hy + Math.sin(ha) * R * 0.92) + ' q' + f(Math.cos(ha + 0.6) * 8) + ' ' + f(Math.sin(ha + 0.6) * 8) + ' ' + f(Math.cos(ha + 0.3) * 12) + ' ' + f(Math.sin(ha + 0.3) * 12) + '" stroke="#5a3a2a" stroke-width="1.6" fill="none"/>'; }
    s += '</g>';
    // near arm, hand up by the face
    var hdx = hx + R * 0.86, hdy = hy + R * 0.66 + aw * 0.5;
    s += limb(4, -6, 26, 30, 12 * bw, lc) + limb(26, 30, hdx, hdy, 10.5 * bw, lc) + '<circle cx="' + f(hdx) + '" cy="' + f(hdy) + '" r="' + f(7.5 * bw) + '" fill="' + lc + '" stroke="' + INK + '" stroke-width="1.8"/>';
    return s + '</g>';
  }
  function fpt(x, y, sc, rot, p) { var a = rot * Math.PI / 180; return [x + (p[0] * Math.cos(a) - p[1] * Math.sin(a)) * sc, y + (p[0] * Math.sin(a) + p[1] * Math.cos(a)) * sc]; }

  // ── the uterus ──────────────────────────────────────────
  // cut open from the side: thick muscle wall, lining, the sac with amniotic fluid, placenta on the wall, cervix below
  function womb(cx, cy, rx, ry, t, o) {
    o = o || {}; var br = 1 + 0.012 * Math.sin(t * 1.6), s = ""; rx *= br; ry *= br; var W = Math.max(14, rx * 0.16);
    if (o.cervix !== false) s += '<path d="M' + f(cx - rx * 0.34) + ' ' + f(cy + ry * 0.8) + ' Q' + f(cx - rx * 0.3) + ' ' + f(cy + ry + W * 2.2) + ' ' + f(cx - rx * 0.16) + ' ' + f(cy + ry + W * 3.2) + ' H' + f(cx + rx * 0.16) + ' Q' + f(cx + rx * 0.3) + ' ' + f(cy + ry + W * 2.2) + ' ' + f(cx + rx * 0.34) + ' ' + f(cy + ry * 0.8) + ' Z" fill="url(#gMuscle)" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(cx) + ' ' + f(cy + ry + W * 0.5) + ' V' + f(cy + ry + W * 3.2) + '" stroke="#f3c2b8" stroke-width="' + f(W * 0.25) + '" stroke-linecap="round"/>';
    s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx + W) + '" ry="' + f(ry + W) + '" fill="url(#gMuscle)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var k = 0; k < 18; k++) { var a = k / 18 * Math.PI * 2 + 0.1, ex = rx + W * 0.55, ey = ry + W * 0.55; s += '<path d="M' + f(cx + Math.cos(a) * ex) + ' ' + f(cy + Math.sin(a) * ey) + ' A' + f(ex) + ' ' + f(ey) + ' 0 0 1 ' + f(cx + Math.cos(a + 0.22) * ex) + ' ' + f(cy + Math.sin(a + 0.22) * ey) + '" stroke="#f3a3a0" stroke-width="1.6" fill="none" opacity=".55"/>'; }
    s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx + W * 0.28) + '" ry="' + f(ry + W * 0.28) + '" fill="#eea0a2"/>';
    s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="url(#gAmnio)" stroke="#d98a8a" stroke-width="1.4"/>';
    s += '<ellipse cx="' + f(cx - rx * 0.4) + '" cy="' + f(cy - ry * 0.5) + '" rx="' + f(rx * 0.24) + '" ry="' + f(ry * 0.1) + '" fill="#fff" opacity=".4" transform="rotate(-35 ' + f(cx - rx * 0.4) + ' ' + f(cy - ry * 0.5) + ')"/>';
    for (var q = 0; q < 14; q++) { var qa = hash(q) * 6.28 + t * 0.15, qr = 0.15 + hash(q + 4) * 0.7; s += '<circle cx="' + f(cx + Math.cos(qa) * rx * qr) + '" cy="' + f(cy + Math.sin(qa) * ry * qr + Math.sin(t + q) * 4) + '" r="' + f(1.2 + hash(q + 9) * 1.8) + '" fill="#fff" opacity=".55"/>'; }
    if (o.plac !== false) s += placenta(cx, cy, rx, ry, o.plac == null ? -130 : o.plac, o.pl || 70, t, o.glow);
    return s;
  }
  function placenta(cx, cy, rx, ry, ac, span, t, glow) {
    var a0 = (ac - span / 2) * Math.PI / 180, a1 = (ac + span / 2) * Math.PI / 180, T = Math.min(rx, ry) * 0.2, d = "", n = 24;
    for (var i = 0; i <= n; i++) { var a = lerp(a0, a1, i / n); d += (i ? " L" : "M") + f(cx + Math.cos(a) * (rx + 2)) + " " + f(cy + Math.sin(a) * (ry + 2)); }
    for (var j = n; j >= 0; j--) { var b = lerp(a0, a1, j / n), e = Math.sin(Math.PI * j / n), th = T * (0.3 + 0.7 * Math.pow(e, 0.6)) * (1 + 0.1 * Math.sin(j * 2.3)); d += " L" + f(cx + Math.cos(b) * (rx - th)) + " " + f(cy + Math.sin(b) * (ry - th)); }
    var s = glow ? '<path d="' + d + ' Z" fill="#ffd27a" opacity="' + f(glow * (0.5 + 0.3 * Math.sin(t * 5))) + '" filter="url(#soft)"/>' : "";
    s += '<path d="' + d + ' Z" fill="url(#gPlac)" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
    var am = (a0 + a1) / 2, ix = cx + Math.cos(am) * (rx - T * 0.9), iy = cy + Math.sin(am) * (ry - T * 0.9);
    for (var v = 0; v < 6; v++) { var va = lerp(a0 + 0.12, a1 - 0.12, v / 5), vx = cx + Math.cos(va) * (rx - T * 0.45), vy = cy + Math.sin(va) * (ry - T * 0.45); s += '<path d="M' + f(ix) + ' ' + f(iy) + ' Q' + f((ix + vx) / 2 + Math.sin(v * 3) * 6) + ' ' + f((iy + vy) / 2 + Math.cos(v * 2) * 5) + ' ' + f(vx) + ' ' + f(vy) + '" stroke="' + (v % 2 ? "#3b4f9a" : "#e0485a") + '" stroke-width="2" fill="none" opacity=".85"/>'; }
    return s + '<path d="' + d + ' Z" fill="#ff6a7a" opacity="' + f(0.06 + 0.07 * Math.sin(t * 5)) + '"/>';
  }
  function placPt(cx, cy, rx, ry, ac) { var T = Math.min(rx, ry) * 0.2, a = ac * Math.PI / 180; return [cx + Math.cos(a) * (rx - T * 0.9), cy + Math.sin(a) * (ry - T * 0.9)]; }
  // the umbilical cord: a whitish twisted tube (two arteries, one vein) between two points, swaying
  function cord(x1, y1, x2, y2, t, w, bend) {
    w = w || 8; bend = bend == null ? 30 : bend; var mx = (x1 + x2) / 2 + Math.sin(t * 1.1) * 8 + bend, my = (y1 + y2) / 2 + Math.cos(t * 0.9) * 6;
    var d = 'M' + f(x1) + ' ' + f(y1) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(x2) + ' ' + f(y2), da = f(w * 0.9) + ' ' + f(w * 0.9);
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#e8e2ee" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="' + d + '" stroke="#d8414f" stroke-width="' + f(w * 0.32) + '" fill="none" stroke-dasharray="' + da + '" stroke-dashoffset="' + f(-t * 10) + '"/><path d="' + d + '" stroke="#4a5fb0" stroke-width="' + f(w * 0.32) + '" fill="none" stroke-dasharray="' + da + '" stroke-dashoffset="' + f(-t * 10 + w * 0.9) + '"/>';
  }
  // the womb with a fetus inside, cord from the placenta to the belly. o: {g, rot, sc, eyes, kick, plac, glow}
  function wombFetus(cx, cy, rx, ry, t, o) {
    o = o || {}; var sc = o.sc || 0.7, fx = cx + (o.dx || 0), fy = cy + (o.dy || 0), rot = o.rot || 0;
    var s = womb(cx, cy, rx, ry, t, { plac: o.plac, glow: o.glow, cervix: o.cervix });
    var fe = fetus(fx, fy, sc, t, { g: o.g, rot: rot, eyes: o.eyes, kick: o.kick, organs: o.organs }), pp = placPt(cx, cy, rx, ry, o.plac == null ? -130 : o.plac), bb = fpt(fx, fy, sc, rot, FB);
    return s + cord(pp[0], pp[1], bb[0], bb[1], t, 7 * Math.max(0.6, sc), o.bend == null ? 20 : o.bend) + fe;
  }
  // the uterus from the front with the tubes and ovaries (for the egg's trip and implantation)
  var TUBE = [44, -60, 96, -84, 158, -92, 196, -60];
  function uterusFront(t, o) {
    o = o || {}; var s = "";
    [1, -1].forEach(function (m) {
      var tp = 'M' + TUBE[0] * m + ' ' + TUBE[1] + ' C' + TUBE[2] * m + ' ' + TUBE[3] + ' ' + TUBE[4] * m + ' ' + TUBE[5] + ' ' + TUBE[6] * m + ' ' + TUBE[7];
      s += '<path d="M' + 60 * m + ' -40 Q' + 130 * m + ' -20 ' + 172 * m + ' 18" stroke="#c98a80" stroke-width="5" fill="none"/>';
      s += '<ellipse cx="' + 176 * m + '" cy="26" rx="30" ry="18" fill="#f2cdb8" stroke="' + INK + '" stroke-width="2"/>'; for (var k = 0; k < 5; k++) s += '<circle cx="' + f((166 + hash(k) * 22) * m) + '" cy="' + f(18 + hash(k + 3) * 16) + '" r="' + f(2.4 + hash(k + 7) * 3) + '" fill="#fff4e0" stroke="#d8a888" stroke-width="1"/>';
      s += '<path d="' + tp + '" stroke="' + INK + '" stroke-width="17" fill="none" stroke-linecap="round"/><path d="' + tp + '" stroke="#e78f8c" stroke-width="13.5" fill="none" stroke-linecap="round"/><path d="' + tp + '" stroke="#f9d0c8" stroke-width="4" fill="none" stroke-linecap="round"/>';
      for (var fm = 0; fm < 7; fm++) { var fa = (20 + fm * 22 + Math.sin(t * 2 + fm) * 6) * Math.PI / 180; s += '<path d="M' + 196 * m + ' -60 q' + f(Math.cos(fa) * 14 * m) + ' ' + f(Math.sin(fa) * 14) + ' ' + f(Math.cos(fa) * 24 * m) + ' ' + f(Math.sin(fa) * 26 + 6) + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M' + 196 * m + ' -60 q' + f(Math.cos(fa) * 14 * m) + ' ' + f(Math.sin(fa) * 14) + ' ' + f(Math.cos(fa) * 24 * m) + ' ' + f(Math.sin(fa) * 26 + 6) + '" stroke="#e78f8c" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
    });
    s += '<path d="M-20 92 Q-24 130 -16 150 H16 Q24 130 20 92 Z" fill="url(#gMuscle)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-74 -64 C-84 -112 84 -112 74 -64 C70 -6 44 60 22 96 H-22 C-44 60 -70 -6 -74 -64 Z" fill="url(#gMuscle)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-50 -66 Q0 -84 50 -66 Q26 0 8 84 H-8 Q-26 0 -50 -66 Z" fill="#eea0a2" stroke="#b8545a" stroke-width="1.6"/><path d="M-38 -64 Q0 -76 38 -64 Q18 -4 4 76 H-4 Q-18 -4 -38 -64 Z" fill="#fbe0d8"/>';
    for (var r = 0; r < 10; r++) { var ry = -60 + r * 14; s += '<path d="M' + f(-34 + r * 2.6) + ' ' + ry + ' q4 -3 8 0 M' + f(26 - r * 2.6) + ' ' + ry + ' q4 -3 8 0" stroke="#e08a90" stroke-width="1.2" fill="none"/>'; }
    return s;
  }
  // the egg's route: from the right ovary, into the tube, along it, into the cavity, onto the wall (k 0..1)
  function eggPath(k) {
    if (k < 0.12) return [lerp(176, 206, k / 0.12), lerp(18, -50, k / 0.12)];
    if (k < 0.78) { var p = bz([TUBE[6], TUBE[7], TUBE[4], TUBE[5], TUBE[2], TUBE[3], TUBE[0], TUBE[1]], (k - 0.12) / 0.66); return p; }
    var q = (k - 0.78) / 0.22; return [lerp(44, 18, q), lerp(-60, -28, q)];
  }

  // ── other body parts ────────────────────────────────────
  // a fingertip pad with whorl ridges drawn in one by one (p 0..1)
  function fingertip(x, y, sc, t, p) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 0.8) * 3) + ') scale(' + sc + ')"><path d="M-62 160 V-10 C-62 -92 62 -92 62 -10 V160 Z" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 13; i++) { var k = clamp(p * 13 - i); if (k <= 0) break; var rx = 6 + i * 4.1, ry = 9 + i * 5.2; s += '<ellipse cx="' + f(Math.sin(i * 0.7) * 1.5) + '" cy="' + f(-4 + i * 1.6) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" pathLength="100" stroke-dasharray="' + f(100 * k) + ' 100" fill="none" stroke="#b86a5c" stroke-width="2.6" transform="rotate(' + f(-8 + i * 1.2) + ')"/>'; }
    for (var j = 0; j < 5; j++) { var kk = clamp(p * 13 - 8 - j); if (kk <= 0) break; var yy = 66 + j * 14; s += '<path d="M-58 ' + yy + ' Q0 ' + (yy - 26) + ' 58 ' + yy + '" pathLength="100" stroke-dasharray="' + f(100 * kk) + ' 100" fill="none" stroke="#b86a5c" stroke-width="2.6"/>'; }
    return s + '<ellipse cx="-30" cy="-40" rx="14" ry="26" fill="#fff" opacity=".25" transform="rotate(20 -30 -40)"/></g>';
  }
  // the brain from the side; fold 0..1 = smooth → deeply folded
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
  // the lungs from the front: trachea, bronchial tree, little air sacs that swell when they breathe (inf 0..1)
  function lungs(x, y, sc, t, o) {
    o = o || {}; var inf = o.inf == null ? 0.5 + 0.5 * Math.sin(t * 2.4) : o.inf, sq = o.squash || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ' ' + f(sc * (1 - sq)) + ')">';
    [1, -1].forEach(function (m) { s += '<path d="M' + 12 * m + ' -64 C' + 44 * m + ' -78 ' + 86 * m + ' -40 ' + 90 * m + ' 24 C' + 92 * m + ' 70 ' + 70 * m + ' 92 ' + 36 * m + ' 86 C' + 18 * m + ' 82 ' + 12 * m + ' 64 ' + 14 * m + ' 30 Z" fill="url(#gLung)" stroke="' + INK + '" stroke-width="2.4" transform="scale(' + f(1 + 0.04 * inf) + ')"/>'; });
    s += '<path d="M0 -110 V-40" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M0 -110 V-40" stroke="#f2d2c8" stroke-width="11" stroke-linecap="round"/>'; for (var r = 0; r < 6; r++) s += '<path d="M-6 ' + (-104 + r * 11) + ' H6" stroke="#c9a49a" stroke-width="2"/>';
    var br = function (x0, y0, a, L, d) { if (d > (o.depth || 4)) { s += '<circle cx="' + f(x0) + '" cy="' + f(y0) + '" r="' + f(3 + 2.6 * inf) + '" fill="#ffb8c0" stroke="#c45a6a" stroke-width="1"/>'; return; } var x1 = x0 + Math.sin(a) * L, y1 = y0 + Math.cos(a) * L; s += '<path d="M' + f(x0) + ' ' + f(y0) + ' L' + f(x1) + ' ' + f(y1) + '" stroke="#f6e0d8" stroke-width="' + f(7 - d * 1.3) + '" stroke-linecap="round"/>'; br(x1, y1, a - 0.45, L * 0.72, d + 1); br(x1, y1, a + 0.45, L * 0.72, d + 1); };
    br(0, -40, 0.9, 34, 0); br(0, -40, -0.9, 34, 0);
    return s + '</g>';
  }
  // stomach + gullet. open 0..1 = how relaxed the valve at the top is; acid creeps up when it is open
  function stomach(x, y, sc, t, open) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">', op = clamp(open), eso = "M-40 -176 C-38 -130 -24 -100 -20 -60";
    s += '<path d="' + eso + '" stroke="' + INK + '" stroke-width="29" fill="none" stroke-linecap="round"/><path d="' + eso + '" stroke="#e8968e" stroke-width="24" fill="none" stroke-linecap="round"/><path d="' + eso + '" stroke="#b85a5a" stroke-width="3" fill="none"/>';
    var d = "M-34 -62 C-70 -112 -122 -72 -112 -18 C-104 40 -80 100 -10 108 C50 112 98 86 116 48 L144 42 L146 22 L114 28 C84 58 8 64 -6 26 C-16 -4 -12 -40 -6 -62 Z";
    CLIPN++; s += '<clipPath id="st' + CLIPN + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="url(#gStom)" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<g clip-path="url(#st' + CLIPN + ')">'; var lv = 50 + Math.sin(t * 2) * 3, wd = "M-130 " + f(lv); for (var xx = -130; xx <= 160; xx += 10) wd += " L" + xx + " " + f(lv + Math.sin(xx * 0.08 + t * 3) * 3); s += '<path d="' + wd + ' V140 H-130 Z" fill="#d8d84a" opacity=".85"/>';
    for (var b = 0; b < 8; b++) { var bu = (t * 0.7 + b / 8) % 1; s += '<circle cx="' + f(-90 + hash(b) * 180) + '" cy="' + f(104 - bu * 50) + '" r="3" fill="#fffbd0" opacity="' + f(1 - bu) + '"/>'; }
    for (var r = 0; r < 6; r++) s += '<path d="M' + (-100 + r * 26) + ' ' + (-20 + r * 4) + ' Q' + (-84 + r * 26) + ' 40 ' + (-92 + r * 28) + ' 96" stroke="#c46a68" stroke-width="2" fill="none" opacity=".55"/>';
    s += '</g><ellipse cx="-60" cy="-60" rx="22" ry="12" fill="#fff" opacity=".3" transform="rotate(-30 -60 -60)"/><ellipse cx="118" cy="38" rx="6" ry="11" fill="#b8454c" stroke="' + INK + '" stroke-width="1.4"/>';
    var gap = 2 + op * 9; s += '<ellipse cx="' + f(-20 - gap) + '" cy="-62" rx="7" ry="9" fill="#b8454c" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="' + f(-20 + gap) + '" cy="-62" rx="7" ry="9" fill="#b8454c" stroke="' + INK + '" stroke-width="1.6"/>';
    if (op > 0.2) for (var a = 0; a < 7; a++) { var au = ((t * 0.9 + a / 7) % 1) * op, p = bz([-20, -60, -24, -100, -38, -130, -40, -176], au); s += '<circle cx="' + f(p[0] + Math.sin(au * 9 + a) * 3) + '" cy="' + f(p[1]) + '" r="' + f(4.5 - au * 2) + '" fill="#d8e04a" stroke="#8a8a10" stroke-width="1" opacity="' + f(0.9 - au * 0.4) + '"/>'; }
    return s + '</g>';
  }
  function microscope(x, y, sc, t) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><path d="M-44 0 H44 L36 -14 H-36 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M22 -14 C40 -44 40 -88 8 -108" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M22 -14 C40 -44 40 -88 8 -108" stroke="#5a6068" stroke-width="12" fill="none" stroke-linecap="round"/>';
    s += '<rect x="-36" y="-50" width="52" height="7" rx="2" fill="#7d8894" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-10" cy="-30" r="' + f(5 + Math.sin(t * 4)) + '" fill="#ffe08a" filter="url(#glow)"/><circle cx="-10" cy="-30" r="4" fill="#fff6c8"/>';
    s += '<g transform="rotate(-20 -2 -96)"><rect x="-12" y="-138" width="20" height="62" rx="4" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2"/><rect x="-14" y="-158" width="24" height="22" rx="3" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.6"/><rect x="-8" y="-78" width="12" height="16" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.4"/></g>';
    return s + '<circle cx="34" cy="-60" r="9" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><path d="M28 -60 H40" stroke="#c9ced4" stroke-width="2"/></g>';
  }
  function pelvis(x, y, sc, t, k) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">', w = Math.sin(t * 3) * 2 * k, sp = 4 + 10 * k;
    [1, -1].forEach(function (m) { s += '<g transform="translate(' + f(m * sp) + ' 0)"><path d="M' + 22 * m + ' -40 C' + 70 * m + ' -86 ' + 124 * m + ' -70 ' + 116 * m + ' -20 C' + 110 * m + ' 20 ' + 70 * m + ' 30 ' + 60 * m + ' 60 C' + 54 * m + ' 80 ' + 30 * m + ' 90 ' + 12 * m + ' 74 C' + 30 * m + ' 50 ' + 40 * m + ' 20 ' + 22 * m + ' -40 Z" fill="#f2ead8" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="' + 44 * m + '" cy="58" rx="14" ry="12" fill="#5a4a3a" opacity=".8"/></g>'; });
    s += '<path d="M-22 -46 H22 L14 40 Q0 52 -14 40 Z" fill="#e8dcc4" stroke="' + INK + '" stroke-width="2.2"/>'; for (var v = 0; v < 4; v++) s += '<path d="M' + (-16 + v * 2) + ' ' + (-30 + v * 18) + ' H' + (16 - v * 2) + '" stroke="#b8a888" stroke-width="1.6"/>';
    var lig = function (x1, y1, x2, y2) { var dd = 'M' + f(x1) + ' ' + f(y1) + ' Q' + f((x1 + x2) / 2 + w) + ' ' + f((y1 + y2) / 2 + 6 * k) + ' ' + f(x2) + ' ' + f(y2); return '<path d="' + dd + '" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + dd + '" stroke="#e0607e" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="' + f(4 + 4 * k) + ' 2"/>'; };
    s += lig(-20, -20, -24 - sp, -10) + lig(20, -20, 24 + sp, -10) + lig(-10 - sp, 76, 10 + sp, 76);
    return s + '</g>';
  }
  // a block of skin cut open: skin on top, fat cells under it (fat 0..1 = how full they are)
  function skinBlock(x, y, sc, t, fat) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><rect x="-90" y="-70" width="180" height="140" rx="6" fill="#f6c8b8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-90" y="-70" width="180" height="18" rx="6" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 14; i++) { var cx = -70 + (i % 5) * 35 + (Math.floor(i / 5) % 2) * 17, cy = -24 + Math.floor(i / 5) * 34, r = (6 + 10 * fat) * (0.85 + 0.15 * hash(i)) * (1 + 0.03 * Math.sin(t * 2 + i)); if (cx > 80) continue; s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#gFat)" stroke="#b8902a" stroke-width="1.4"/>'; }
    return s + '<path d="M-90 -36 Q-40 -30 0 -38 T90 -34" stroke="#c44a5a" stroke-width="2" fill="none"/></g>';
  }
  // swollen feet and ankles from the side (sw 0..1)
  function feet(x, y, sc, t, sw) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">', e = 1 + 0.4 * sw;
    [-40, 50].forEach(function (dx, i) { s += '<path d="M' + f(dx - 18 * e) + ' -140 C' + f(dx - 20 * e) + ' -60 ' + f(dx - 26 * e) + ' -30 ' + f(dx - 24 * e) + ' 0 C' + f(dx - 24 * e) + ' 14 ' + f(dx - 10) + ' 20 ' + f(dx + 30) + ' 20 C' + f(dx + 70 * e) + ' 20 ' + f(dx + 76 * e) + ' 6 ' + f(dx + 60 * e) + ' -6 C' + f(dx + 40) + ' -14 ' + f(dx + 22 * e) + ' -30 ' + f(dx + 18 * e) + ' -60 C' + f(dx + 16 * e) + ' -100 ' + f(dx + 18 * e) + ' -130 ' + f(dx + 18 * e) + ' -140 Z" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2.4"/>'; for (var tz = 0; tz < 4; tz++) s += '<ellipse cx="' + f(dx + (44 + tz * 7) * e) + '" cy="' + f(12 - tz * 3) + '" rx="' + f(6 - tz) + '" ry="' + f(5 - tz * 0.6) + '" fill="#f2b59a" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="' + f(dx + (46 + tz * 7) * e) + '" cy="' + f(9 - tz * 3) + '" rx="' + f(2.6 - tz * 0.4) + '" ry="1.6" fill="#ffe6dc"/>'; s += '<circle cx="' + f(dx + 6) + '" cy="-24" r="' + f(7 * (1 - sw * 0.7)) + '" fill="#e8a088" opacity=".7"/>';
      if (sw > 0.3) s += '<path d="M' + f(dx - 10) + ' -90 q6 30 -4 60 M' + f(dx + 8) + ' -100 q-6 30 4 70" stroke="#7a8ac8" stroke-width="1.6" fill="none" opacity=".6"/>'; });
    for (var k = 0; k < 14; k++) { var u = (t * 0.8 + k / 14) % 1; s += '<circle cx="' + f(-40 + (k % 2) * 90 + Math.sin(k + t * 2) * 8) + '" cy="' + f(-150 + u * 140) + '" r="4.5" fill="#7cc8f2" opacity="' + f(Math.sin(Math.PI * u) * 0.9) + '"/>'; }
    return s + '</g>';
  }

  // ── people ──────────────────────────────────────────────
  function face(x, y, r, mood, t, look) {
    if (mood !== "sleep" && mood !== "cry") return head(x, y, r, mood, t, look);
    var k = r / 13, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/>';
    s += '<path d="M' + f(-7 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * k) + '" fill="none" stroke-linecap="round"/>';
    if (mood === "sleep") { var y2 = 1 + 0.35 * Math.sin(t * 2); s += '<ellipse cx="' + f(0.5 * k) + '" cy="' + f(7 * k) + '" rx="' + f(2.2 * k * y2) + '" ry="' + f(2.8 * k * y2) + '" fill="' + INK + '"/>'; }
    else { var o2 = 1 + 0.3 * Math.abs(Math.sin(t * 7)); s += '<ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(3.6 * k) + '" ry="' + f(2.8 * k * o2) + '" fill="' + INK + '"/>'; for (var e = -1; e <= 1; e += 2) { var tu = (t * 1.6 + (e + 1) * 0.3) % 1; s += '<circle cx="' + f(e * 6 * k) + '" cy="' + f(2 * k + tu * 9 * k) + '" r="' + f(1.4 * k) + '" fill="#7cc8f2" opacity="' + f(1 - tu) + '"/>'; } }
    return s + '</g>';
  }
  // the mother: ball-head character in a hijab and a long dress, side-on facing right. Origin at her feet.
  // o: {belly 0..1, mood, hand: belly|mouth|chest|back|wave|baby, cut: svg in a round window on the belly (drawn for radius 100), wx, wy, wr, green 0..1, bump 0..1, s, lean, babyMood}
  function mom(x, y, t, o) {
    o = o || {}; var b = clamp(o.belly == null ? 0.5 : o.belly), sc = o.s || 1, hand = o.hand || "belly";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 1.2) + ') scale(' + sc + ') rotate(' + f((o.lean || 0) + Math.sin(t * 1.3) * 0.8) + ' 0 -20)">';
    var bx = 34 + 58 * b + (o.bump || 0) * 10, by = -106 + 6 * b, sy = -180 + Math.sin(t * 2.2) * 1.2, hx = 4, hy = -224 + Math.sin(t * 2.2) * 1.5, sx = 12;
    var H = { belly: [bx - 8, by - 4, 30 + 10 * b, -122], mouth: [hx + 30, hy + 18, 50, -156], chest: [30, -158, 46, -122], back: [-42, -100, -30, -146], wave: [52 + Math.sin(t * 9) * 8, -258, 52, -206], baby: [58, -142, 48, -110] }[hand];
    var arm = limbQ(sx, sy, H[2], H[3], H[0], H[1], 12, "#1d6f6a") + '<circle cx="' + f(H[0]) + '" cy="' + f(H[1]) + '" r="7.5" fill="#f2c4a4" stroke="' + INK + '" stroke-width="1.8"/>';
    if (hand === "back") s += arm;
    s += '<path d="M-18 -40 V-8 M8 -40 V-8" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M-18 -40 V-8 M8 -40 V-8" stroke="#eab796" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M-26 0 Q-26 -10 -14 -10 Q-2 -9 2 0 Z M0 0 Q0 -10 12 -10 Q24 -9 28 0 Z" fill="#6a3a2a" stroke="' + INK + '" stroke-width="1.6"/>';
    var d = 'M-24 ' + f(sy - 12) + ' C-36 -150 ' + f(-34 - 4 * b) + ' -100 -38 -64 L-44 -26 H42 C44 -50 ' + f(bx - 8) + ' ' + f(by + 44) + ' ' + f(bx) + ' ' + f(by) + ' C' + f(bx + 2) + ' ' + f(by - 34 - 6 * b) + ' ' + f(42 + 14 * b) + ' -150 32 -160 C40 -170 34 ' + f(sy - 8) + ' 22 ' + f(sy - 14) + ' Z';
    s += '<path d="' + d + '" fill="url(#gDress)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<ellipse cx="' + f(bx - 20) + '" cy="' + f(by - 14) + '" rx="' + f(10 + 8 * b) + '" ry="' + f(16 + 10 * b) + '" fill="#fff" opacity=".14"/><path d="M-38 -58 Q4 -52 ' + f(40 + b * 8) + ' -58" stroke="#155e59" stroke-width="2" fill="none" opacity=".5"/>';
    if (o.bump) s += '<path d="M' + f(bx + 8) + ' ' + f(by - 18) + ' l10 -6 M' + f(bx + 10) + ' ' + f(by) + ' l12 0 M' + f(bx + 8) + ' ' + f(by + 18) + ' l10 6" stroke="#f2c230" stroke-width="3" stroke-linecap="round" opacity="' + f(o.bump) + '"/>';
    if (o.cut) { var wr = o.wr || (26 + 32 * b), wx = o.wx == null ? bx - wr * 0.92 : o.wx, wy = o.wy == null ? by : o.wy; CLIPN++;
      s += '<circle cx="' + f(wx) + '" cy="' + f(wy) + '" r="' + f(wr + 4) + '" fill="#fff" opacity=".9"/><clipPath id="mw' + CLIPN + '"><circle cx="' + f(wx) + '" cy="' + f(wy) + '" r="' + f(wr) + '"/></clipPath><g clip-path="url(#mw' + CLIPN + ')"><g transform="translate(' + f(wx) + ' ' + f(wy) + ') scale(' + f(wr / 100) + ')">' + o.cut + '</g></g><circle cx="' + f(wx) + '" cy="' + f(wy) + '" r="' + f(wr + 4) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>'; }
    s += '<path d="M' + f(hx - 38) + ' ' + f(hy + 8) + ' C' + f(hx - 44) + ' ' + f(hy - 50) + ' ' + f(hx + 46) + ' ' + f(hy - 52) + ' ' + f(hx + 40) + ' ' + f(hy + 6) + ' C' + f(hx + 40) + ' ' + f(hy + 28) + ' 38 ' + f(sy - 6) + ' 30 ' + f(sy + 4) + ' L-30 ' + f(sy + 2) + ' C' + f(hx - 46) + ' ' + f(hy + 34) + ' ' + f(hx - 38) + ' ' + f(hy + 20) + ' ' + f(hx - 38) + ' ' + f(hy + 8) + ' Z" fill="url(#gHijab)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += face(hx + 3, hy + 2, 26, o.mood || "n", t, o.look == null ? 0.6 : o.look);
    if (o.green) { s += '<circle cx="' + f(hx + 3) + '" cy="' + f(hy + 2) + '" r="24" fill="#9fd36a" opacity="' + f(0.4 * o.green) + '"/>'; for (var sw = 0; sw < 3; sw++) { var sa = t * 3 + sw * 2.1; s += '<path d="M' + f(hx + 3 + Math.cos(sa) * 40) + ' ' + f(hy - 30 + Math.sin(sa) * 8) + ' q6 -6 12 0 q-6 6 -12 0" stroke="#6aa83a" stroke-width="2.4" fill="none" opacity="' + f(o.green) + '"/>'; } }
    if (hand !== "back") s += arm;
    if (hand === "baby") s += baby(70, -150, 1.15, t, o.babyMood || "cry");
    return s + '</g>';
  }
  function baby(x, y, sc, t, mood) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-14 + Math.sin(t * 2.4) * 4) + ') scale(' + sc + ')">';
    s += '<path d="M-30 -14 C-10 -30 40 -24 52 0 C60 16 40 26 10 24 C-20 22 -38 8 -30 -14 Z" fill="#f6e2a6" stroke="' + INK + '" stroke-width="2"/><path d="M-4 -18 Q20 0 48 -2 M0 20 Q20 6 46 10" stroke="#d9c27a" stroke-width="2" fill="none"/>';
    return s + face(-26, -12, 17, mood, t, 0.4) + '<path d="M-42 -22 Q-26 -40 -10 -22" fill="#f6e2a6" stroke="' + INK + '" stroke-width="1.6"/></g>';
  }
  function scientist(x, y, t, mood) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 2) + ') rotate(' + f(Math.sin(t * 1.6) * 1.5) + ')">';
    s += '<path d="M-54 140 C-58 56 -36 32 0 32 C36 32 58 56 54 140 Z" fill="url(#gLab)" stroke="' + INK + '" stroke-width="3"/><path d="M0 40 V140 M-30 90 h16" stroke="#9fb4be" stroke-width="2"/><path d="M-14 34 L0 60 L14 34" fill="#2f6f9f" stroke="' + INK + '" stroke-width="1.6"/>';
    s += head(0, -30, 38, mood, t, 0.4) + '<circle cx="-12" cy="-32" r="11" fill="#fff" fill-opacity=".15" stroke="' + INK + '" stroke-width="2.4"/><circle cx="14" cy="-32" r="11" fill="#fff" fill-opacity=".15" stroke="' + INK + '" stroke-width="2.4"/><path d="M-1 -32 H3" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }

  // ── objects ─────────────────────────────────────────────
  function pen(x, y, a) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"><path d="M0 0 L8 -20 H-8 Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.6"/><circle r="2.2" fill="#14306e"/><rect x="-11" y="-160" width="22" height="142" rx="6" fill="url(#gPen)" stroke="' + INK + '" stroke-width="2"/><rect x="-11" y="-64" width="22" height="34" fill="#2a2f36" opacity=".3"/><rect x="5" y="-158" width="5" height="74" rx="2" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/></g>'; }
  function lens(x, y, r, inner, t) {   // a magnifying glass: what it shows is drawn for a circle of radius 100 at (0,0)
    CLIPN++; return '<g transform="rotate(' + f(Math.sin(t * 1.1) * 2) + ' ' + f(x) + ' ' + f(y) + ')"><path d="M' + f(x + r * 0.7) + ' ' + f(y + r * 0.7) + ' L' + f(x + r * 1.35) + ' ' + f(y + r * 1.35) + '" stroke="' + INK + '" stroke-width="' + f(r * 0.2) + '" stroke-linecap="round"/><path d="M' + f(x + r * 0.7) + ' ' + f(y + r * 0.7) + ' L' + f(x + r * 1.35) + ' ' + f(y + r * 1.35) + '" stroke="#6a4a2a" stroke-width="' + f(r * 0.15) + '" stroke-linecap="round"/>' +
      '<clipPath id="ln' + CLIPN + '"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '"/></clipPath><g clip-path="url(#ln' + CLIPN + ')"><g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(r / 100) + ')">' + inner + '</g></g><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="none" stroke="#2b2f34" stroke-width="' + f(r * 0.09) + '"/><path d="M' + f(x - r * 0.6) + ' ' + f(y - r * 0.3) + ' A' + f(r * 0.7) + ' ' + f(r * 0.7) + ' 0 0 1 ' + f(x - r * 0.2) + ' ' + f(y - r * 0.66) + '" stroke="#fff" stroke-width="' + f(r * 0.06) + '" fill="none" opacity=".7" stroke-linecap="round"/></g>';
  }
  function lime(x, y, r, t) { var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.6) * 4) + ') rotate(' + f(Math.sin(t * 1.2) * 9) + ')"><ellipse cx="4" cy="' + f(r * 0.9) + '" rx="' + f(r * 0.9) + '" ry="' + f(r * 0.16) + '" fill="#000" opacity=".2"/><ellipse rx="' + f(r * 1.1) + '" ry="' + r + '" fill="url(#gLime)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 30; i++) { var a = hash(i) * 6.28, rr = Math.sqrt(hash(i + 3)) * r * 0.9; s += '<circle cx="' + f(Math.cos(a) * rr * 1.1) + '" cy="' + f(Math.sin(a) * rr) + '" r="1.2" fill="#2f5a14" opacity=".35"/>'; }
    return s + '<ellipse cx="' + f(-r * 0.4) + '" cy="' + f(-r * 0.4) + '" rx="' + f(r * 0.3) + '" ry="' + f(r * 0.15) + '" fill="#fff" opacity=".5" transform="rotate(-30 ' + f(-r * 0.4) + ' ' + f(-r * 0.4) + ')"/><path d="M' + f(r * 1.08) + ' 0 l8 -4 l1 8 Z" fill="#5a7a2a" stroke="' + INK + '" stroke-width="1.2"/></g>'; }
  function lentil(x, y, r, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-15 + Math.sin(t * 1.5) * 8) + ')"><ellipse rx="' + r + '" ry="' + f(r * 0.8) + '" fill="url(#gLentil)" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="' + f(-r * 0.3) + '" cy="' + f(-r * 0.3) + '" rx="' + f(r * 0.32) + '" ry="' + f(r * 0.15) + '" fill="#fff" opacity=".5"/></g>'; }
  function ruler(x, y, len, cm, t, vert) {   // len px for cm centimetres
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (vert ? ' rotate(-90)' : '') + '"><rect x="-8" y="0" width="' + f(len + 16) + '" height="26" rx="3" fill="#f2d27a" stroke="' + INK + '" stroke-width="2"/>';
    var step = len / cm, every = cm > 20 ? 10 : 1; for (var i = 0; i <= cm; i++) s += '<path d="M' + f(i * step) + ' 0 V' + (i % every === 0 ? 12 : 6) + '" stroke="' + INK + '" stroke-width="1.4"/>' + (i % every === 0 && (cm <= 10 || i % 10 === 0) ? '<text x="' + f(i * step) + '" y="23" text-anchor="middle" style="font:700 9px Noto Sans Arabic;fill:#2b2016">' + i + '</text>' : '');
    return s + '</g>';
  }
  function scaleKg(x, y, sc, txt, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><path d="M-70 -46 Q0 -70 70 -46 L60 -36 H-60 Z" fill="#e9f2f6" stroke="' + INK + '" stroke-width="2"/><rect x="-60" y="-36" width="120" height="50" rx="10" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2"/><rect x="-36" y="-26" width="72" height="28" rx="4" fill="#173a2a" stroke="' + INK + '" stroke-width="1.4"/><text x="0" y="-5" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#7cf29a">' + txt + '</text><circle cx="48" cy="-12" r="3" fill="' + (Math.sin(t * 6) > 0 ? "#7cf29a" : "#2a4a3a") + '"/></g>'; }
  function chart(x, y, w, h, fn, p, col, o) {   // a line drawn as it is explained: fn(k) → 0..1 value at 0..1 along the axis
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-16" y="' + f(-h - 34) + '" width="' + f(w + 32) + '" height="' + f(h + 60) + '" rx="10" fill="#fffdf6" stroke="' + INK + '" stroke-width="2"/>';
    if (o.title) s += '<text x="' + f(w / 2) + '" y="' + f(-h - 12) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + col + '">' + o.title + '</text>';
    s += '<path d="M0 ' + f(-h) + ' V0 H' + f(w) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    (o.xl || []).forEach(function (l) { s += '<text x="' + f(l[0] * w) + '" y="16" text-anchor="middle" style="font:700 11px Noto Sans Arabic;fill:#5a5048">' + l[1] + '</text>'; });
    var n = 60, m = Math.max(1, Math.floor(clamp(p) * n)), d = "";
    for (var i = 0; i <= m; i++) d += (i ? " L" : "M") + f(i / n * w) + " " + f(-fn(i / n) * h);
    s += '<path d="' + d + ' V0 H0 Z" fill="' + col + '" opacity=".15"/><path d="' + d + '" stroke="' + col + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    var ex = m / n * w, ey = -fn(m / n) * h; s += '<circle cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(6 + Math.sin(t0 * 8) * 1.5) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>';
    return s + '</g>';
  }
  var t0 = 0;
  function hcg(k) { var w = k * 24; if (w < 4) return 0.02; return w <= 10 ? Math.exp(-Math.pow((w - 10) / 3.2, 2)) : 0.16 + 0.84 * Math.exp(-Math.pow((w - 10) / 3.6, 2)); }
  function particles(t, path, n, col, sp, r) {   // hormone molecules flowing along a cubic bezier path [x0,y0,c1x,c1y,c2x,c2y,x1,y1]
    var s = ""; for (var i = 0; i < n; i++) { var u = (t * sp + i / n) % 1, p = bz(path, u), rr = r || 5; s += '<path d="M' + f(p[0] + rr) + ' ' + f(p[1]) + ' L' + f(p[0] + rr / 2) + ' ' + f(p[1] + rr * 0.87) + ' L' + f(p[0] - rr / 2) + ' ' + f(p[1] + rr * 0.87) + ' L' + f(p[0] - rr) + ' ' + f(p[1]) + ' L' + f(p[0] - rr / 2) + ' ' + f(p[1] - rr * 0.87) + ' L' + f(p[0] + rr / 2) + ' ' + f(p[1] - rr * 0.87) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(Math.min(1, Math.sin(Math.PI * u) * 2)) + '"/>'; }
    return s;
  }
  function swarm(t, cx, cy, rx, ry, n, col, r) { var s = ""; for (var i = 0; i < n; i++) { var a = t * (0.6 + hash(i) * 0.8) + i * 2.4, x = cx + Math.cos(a) * rx * (0.6 + 0.4 * hash(i + 2)), y = cy + Math.sin(a * 1.3) * ry * (0.6 + 0.4 * hash(i + 5)), rr = r || 5; s += '<path d="M' + f(x + rr) + ' ' + f(y) + ' L' + f(x + rr / 2) + ' ' + f(y + rr * 0.87) + ' L' + f(x - rr / 2) + ' ' + f(y + rr * 0.87) + ' L' + f(x - rr) + ' ' + f(y) + ' L' + f(x - rr / 2) + ' ' + f(y - rr * 0.87) + ' L' + f(x + rr / 2) + ' ' + f(y - rr * 0.87) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/>'; } return s; }
  function zzz(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var u = (t * 0.5 + i / 3) % 1; s += '<text x="' + f(x + u * 40 + Math.sin(u * 6) * 6) + '" y="' + f(y - u * 70) + '" style="font:900 ' + f(14 + u * 14) + 'px Noto Serif;fill:#3a5a9a;stroke:#fff;stroke-width:3;paint-order:stroke" opacity="' + f(Math.sin(Math.PI * u)) + '">Z</text>'; } return s; }
  function sparkles(x, y, t, n, R) { var s = ""; for (var i = 0; i < (n || 5); i++) { var a = i * 1.26 + t * 0.6, r = (R || 50) * (0.7 + 0.3 * Math.sin(t * 2 + i)), k = 0.5 + 0.5 * Math.sin(t * 5 + i * 2), sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.8, z = 7 * k; s += '<path d="M' + f(sx) + ' ' + f(sy - z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx + z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy + z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx - z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy - z) + ' Z" fill="#f2c230"/>'; } return s; }
  function hearts(x, y, t, n) { var s = ""; for (var i = 0; i < (n || 4); i++) { var u = (t * 0.45 + i / (n || 4)) % 1, hx = x + Math.sin(u * 5 + i) * 18 + (i - 1.5) * 18, hy = y - u * 90, z = 6 + 4 * u; s += '<path d="M' + f(hx) + ' ' + f(hy + z) + ' C' + f(hx - z * 1.6) + ' ' + f(hy) + ' ' + f(hx - z) + ' ' + f(hy - z) + ' ' + f(hx) + ' ' + f(hy - z * 0.4) + ' C' + f(hx + z) + ' ' + f(hy - z) + ' ' + f(hx + z * 1.6) + ' ' + f(hy) + ' ' + f(hx) + ' ' + f(hy + z) + ' Z" fill="#e2526e" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(Math.sin(Math.PI * u)) + '"/>'; } return s; }
  function waves(x, y, t, ang, n, col) { var s = ""; for (var i = 0; i < (n || 4); i++) { var u = (t * 0.9 + i / (n || 4)) % 1, r = 14 + u * 70; s += '<path d="M' + f(x + Math.cos(ang - 0.5) * r) + ' ' + f(y + Math.sin(ang - 0.5) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(ang + 0.5) * r) + ' ' + f(y + Math.sin(ang + 0.5) * r) + '" stroke="' + (col || "#f2c230") + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; } return s; }
  function ecg(x, y, w, t, col, bpm) {   // a heart monitor trace sweeping left to right
    var s = '<rect x="' + f(x - 8) + '" y="' + f(y - 30) + '" width="' + f(w + 16) + '" height="56" rx="8" fill="url(#screen)" stroke="' + INK + '" stroke-width="2"/>', d = "", per = 60 / (bpm || 140), sw = (t % 2) / 2;
    for (var i = 0; i <= 80; i++) { var xx = i / 80, tt = t - (sw - xx) * 2, ph = ((tt % per) + per) % per / per, v = ph < 0.08 ? Math.sin(ph / 0.08 * Math.PI) * 0.25 : ph < 0.14 ? -0.2 : ph < 0.2 ? 1 : ph < 0.26 ? -0.35 : 0; d += (i ? " L" : "M") + f(x + xx * w) + " " + f(y - v * 20); }
    return s + '<path d="' + d + '" stroke="' + (col || "#7cf29a") + '" stroke-width="2.4" fill="none"/><circle cx="' + f(x + sw * w) + '" cy="' + f(y) + '" r="3" fill="#fff"/>';
  }
  function incubator(x, y, sc, t) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><rect x="-10" y="40" width="20" height="70" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2"/><rect x="-70" y="104" width="140" height="10" rx="5" fill="#7d8894" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="-100" y="10" width="200" height="34" rx="6" fill="#e9eef2" stroke="' + INK + '" stroke-width="2"/><rect x="-80" y="18" width="40" height="16" rx="3" fill="#173a2a"/><text x="-60" y="31" text-anchor="middle" style="font:700 11px Noto Sans Arabic;fill:#7cf29a">' + (36.5 + (Math.sin(t) > 0 ? 0.1 : 0)).toFixed(1) + '°</text>';
    s += '<ellipse cx="0" cy="4" rx="70" ry="12" fill="#fff" stroke="#b8c4cc" stroke-width="1.4"/>' + '<g transform="translate(-4 -6) rotate(-90) scale(.32)">' + fetus(0, 0, 1, t, { g: 0.6, eyes: 0 }) + '</g>' + '<path d="M-36 -2 q-6 -12 2 -18 q10 -6 14 6" fill="#9fd0f0" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-96 10 V-50 Q-96 -80 -60 -80 H60 Q96 -80 96 -50 V10 Z" fill="url(#gGlass)" stroke="#5d93ad" stroke-width="2.6"/><circle cx="-50" cy="-16" r="14" fill="none" stroke="#5d93ad" stroke-width="3"/><circle cx="50" cy="-16" r="14" fill="none" stroke="#5d93ad" stroke-width="3"/><path d="M-70 -66 Q-40 -76 -10 -70" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>';
    return s + '</g>';
  }
  function thermo(x, y, sc, k, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><rect x="-10" y="-90" width="20" height="96" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cy="14" r="16" fill="#e2523a" stroke="' + INK + '" stroke-width="2"/><rect x="-5" y="' + f(6 - 80 * k - Math.sin(t * 3) * 2) + '" width="10" height="' + f(10 + 80 * k + Math.sin(t * 3) * 2) + '" rx="5" fill="#e2523a"/>' + [0, 1, 2, 3].map(function (i) { return '<path d="M10 ' + (-70 + i * 18) + ' h7" stroke="' + INK + '" stroke-width="1.4"/>'; }).join("") + '</g>'; }
  function phone(x, y, sc, t) { var r = Math.sin(t * 30) * 4 * (Math.sin(t * 3) > 0 ? 1 : 0); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + sc + ')"><rect x="-34" y="-64" width="68" height="128" rx="12" fill="#2b2f34" stroke="' + INK + '" stroke-width="2.4"/><rect x="-28" y="-54" width="56" height="100" rx="6" fill="#e9f6fb"/><circle cy="-14" r="18" fill="#e2523a"/><path d="M-4 -26 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 Z" fill="#fff"/><rect x="-20" y="16" width="40" height="16" rx="8" fill="#5bbf6a"/></g>' + waves(x + 40 * sc, y - 40 * sc, t, -0.6, 3, "#e2523a"); }
  function drop(x, y, sc, t) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3) * 3) + ') scale(' + sc + ')"><path d="M0 -40 C14 -18 28 0 28 16 C28 32 14 42 0 42 C-14 42 -28 32 -28 16 C-28 0 -14 -18 0 -40 Z" fill="#c2303e" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="-10" cy="10" rx="5" ry="10" fill="#fff" opacity=".4"/></g>'; }
  function bolt(x, y, sc, t) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ') rotate(' + f(Math.sin(t * 12) * 6) + ')" d="M4 -18 L-8 2 H2 L-4 18 L10 -4 H0 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function vomitCenter(x, y, sc, t, k) {   // the mother's head from the side with the brain's "vomiting centre" lighting up
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><path d="M-60 40 C-80 -10 -60 -80 0 -84 C60 -88 84 -40 76 0 C90 10 86 24 74 26 C72 40 60 50 40 50 L30 80 H-40 Z" fill="#f2c4a4" stroke="' + INK + '" stroke-width="2.4"/>';
    s += brain(-2, -26, 0.42, t, 0.8) + '<circle cx="12" cy="0" r="' + f(10 + 6 * k * (0.5 + 0.5 * Math.sin(t * 6))) + '" fill="#b06ad8" opacity="' + f(0.3 + 0.5 * k) + '" filter="url(#glow)"/><circle cx="12" cy="0" r="5" fill="#b06ad8" stroke="' + INK + '" stroke-width="1.2"/>';
    return s + '</g>';
  }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var GDF = "#a65ad8", HCG = "#e2862e", PROG = "#3f7fd0";

  // 0 — you were once a single cell, smaller than the dot of a pen
  shot(0, function (u, d) { var k = ease(clamp((u - 0.6) / (d - 0.8))); return [lerp(300, 380, k), lerp(170, 175, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var s = notebook(t), k = clamp(u / 0.9), dr = 9 * ease(clamp((u - 0.5) / 0.4));
    s += '<circle cx="250" cy="196" r="' + f(dr) + '" fill="#14306e"/>';
    var lift = ease(clamp((u - 1.0) / 0.8)); s += pen(lerp(330, 250, ease(k)) + lift * 90 + Math.sin(t * 20) * (u > 0.5 && u < 1 ? 1.2 : 0), lerp(120, 196, ease(k)) - lift * 140, 28);
    if (u > 1.4) { var inner = '<rect x="-120" y="-120" width="240" height="240" fill="url(#gPaper)"/><path d="M-120 -40 H120 M-120 30 H120" stroke="#9fc2e6" stroke-width="4"/><circle cx="-140" cy="0" r="96" fill="#14306e"/><circle cx="-160" cy="-30" r="30" fill="#2a4a9a" opacity=".5"/>' + cell(40, 4, 22, t, 1);
      s += popIn(lens(470, 160, 92, inner, t), 470, 160, u, 1.4); }
    return s + tag("نقطة القلم", 250, 250, u, 0.9, -3, 17) + tag("إنت كنت كده!", 500, 300, u, 2.4, 3, 18, "#bfe0ff");
  });
  // 1 — how does that cell become a whole baby in only nine months?
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, ease(k)), 180, lerp(1.08, 1.0, k)]; }, function (u, d, t) {
    var s = inside(t) + cell(140, 180, 34, t, 1) + '<path d="M196 180 H' + f(lerp(196, 380, clamp(u / 1.2))) + '" stroke="#ffd9c8" stroke-width="4" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '"/>';
    if (u > 0.6) s += popIn(fetus(500, 186, 0.78, t, { g: 1 }), 500, 186, u, 0.6);
    return s + tag("خلية", 140, 250, u, 0.3, -3, 18) + tag("9 شهور بس؟", 320, 80, u, 1.4, -2, 21) + qmark(430, 70, t, 40);
  });
  // 2 — why is she sick at first and fine later?
  shot(2, function (u, d) { return [300, 190, lerp(1.12, 1.02, clamp(u / d))]; }, function (u, d, t) {
    var half = u > d * 0.52, s = room(t, { sofa: 470 });
    s += mom(300, 300, t, { belly: 0.25, mood: half ? "happy" : "dizzy", hand: half ? "belly" : "mouth", green: half ? 0 : 1, s: 0.95 });
    if (half) s += sparkles(300, 92, t, 6, 70);
    return s + (half ? tag("زي الفل!", 470, 120, u, d * 0.52 + 0.1, 3, 24) : tag("تعب وترجيع", 470, 120, u, 0.4, 3, 19, "#c8e6a0"));
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = room(t, { lamp: 540 }) + mom(220, 300, t, { belly: 0.6, mood: "curious", s: 0.9 });
    return s + tag("إيه الحكاية؟", 420, 120, u, 0.05, -2, 32, "#f2c230") + qmark(560, 210, t, 44) + qmark(330, 60, t, 30);
  });
  // 4 — three stages, about three months each
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), 180, lerp(1.02, 0.98, k)]; }, function (u, d, t) {
    var s = bgc("#f3e3d3") + '<rect x="-400" y="300" width="1440" height="400" fill="#e2c9b0"/><path d="M-400 300 H1040" stroke="#b8947a" stroke-width="3"/>';
    [[130, 0.15, "1-3 شهور", 0.1], [320, 0.5, "4-6 شهور", 0.7], [510, 0.9, "7-9 شهور", 1.3]].forEach(function (m, i) {
      var k = pop((u - m[3]) / 1.0); if (k <= 0) return; s += '<g transform="translate(' + m[0] + ' 300) scale(' + k.toFixed(3) + ') translate(' + (-m[0]) + ' -300)">' + mom(m[0] - 12, 296, t + i, { belly: m[1], mood: "happy", s: 0.82 }) + '</g>';
      s += '<circle cx="' + m[0] + '" cy="62" r="20" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4" transform="scale(1)"/><text x="' + m[0] + '" y="71" text-anchor="middle" style="font:900 24px Noto Sans Arabic;fill:#2b2016">' + (i + 1) + '</text>';
      s += tag(m[2], m[0], 330, u, m[3] + 0.3, i % 2 ? 2 : -2, 15, ["#f2c9a0", "#bfe0ff", "#c8e6a0"][i]);
    });
    return s;
  });
  // 5 — about a week after fertilisation the cells reach the womb and dig into its wall
  shot(5, function (u, d) { var k = clamp(u / d), p = eggPath(clamp(u / (d * 0.82))); return [lerp(470, 340, ease(k)) + (p[0] - 100) * 0.15, lerp(130, 190, ease(k)), lerp(1.5, 1.05, ease(k))]; }, function (u, d, t) {
    var s = inside(t) + '<g transform="translate(320 200)">' + uterusFront(t), k = clamp(u / (d * 0.82)), p = eggPath(k), n = k < 0.15 ? 1 : k < 0.32 ? 2 : k < 0.5 ? 4 : k < 0.68 ? 8 : 16;
    if (k >= 1) s += '<circle cx="18" cy="-28" r="' + f(18 + 6 * Math.sin(t * 5)) + '" fill="#ffd27a" opacity=".5" filter="url(#glow)"/>';
    s += cell(p[0], p[1], k >= 1 ? 9 : 8 + k * 2, t, n) + '</g>';
    return s + tag("حوالي أسبوع", 470, 60, u, 0.5, 3, 18) + tag("بيزرع نفسه في الجدار", 230, 330, u, d * 0.8, -2, 17, "#f2c9a0");
  });
  // 6 — week six: the heart starts beating, and it's the size of a lentil
  shot(6, function (u, d) { return [lerp(300, 330, clamp(u / d)), 175, lerp(1.08, 1.16, clamp(u / d))]; }, function (u, d, t) {
    var s = inside(t) + '<circle cx="270" cy="180" r="140" fill="#2a0709" opacity=".45"/><ellipse cx="270" cy="180" rx="130" ry="122" fill="url(#gAmnio)" opacity=".9" stroke="#f3a3a0" stroke-width="5"/>';
    s += '<circle cx="190" cy="104" r="18" fill="#f6dc7e" stroke="#b8902a" stroke-width="2"/><path d="M204 116 Q230 140 238 150" stroke="#e9c8b8" stroke-width="6" fill="none"/>' + embryo(270, 186, 1.05, t);
    s += ecg(430, 292, 150, t, "#ff6a7a", 110) + lentil(520, 150, 20, t) + '<path d="M500 160 Q420 200 360 190" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 5" fill="none"/>';
    return s + tag("الأسبوع 6", 120, 50, u, 0.3, -3, 20) + tag("قلبه بيدق!", 480, 222, u, 1.2, 3, 19, "#f2a0a0") + tag("قد العدسة", 530, 100, u, 2.6, 3, 17, "#f2c9a0");
  });
  // 7 — by week ten every main organ has formed, even the fingers
  shot(7, function (u, d) { var k = clamp(u / d); return u < 2.8 ? [lerp(290, 300, k), 180, 1.05] : [lerp(300, 330, k), 180, 1.05]; }, function (u, d, t) {
    var s = inside(t) + fetus(250, 190, 0.98, t, { g: 0.02, organs: clamp((u - 0.2) / 1.0) });
    s += tag("المخ", 150, 60, u, 0.5, -3, 18) + tag("القلب", 400, 120, u, 1.2, 3, 18, "#f2a0a0") + tag("الكبد", 140, 300, u, 1.9, -3, 18, "#f2c9a0");
    if (u > 2.6) s += popIn(lens(500, 220, 84, '<rect x="-120" y="-120" width="240" height="240" fill="#f6d8cc"/>' + hand(0, 20, 1.1, t), t), 500, 220, u, 2.6);
    return s + tag("صوابع!", 520, 90, u, 3.0, 3, 20, "#bfe0ff") + tag("الأسبوع 10", 330, 30, u, 0.1, -2, 16, "#fff");
  });
  // 8 — end of month three: about 6 cm, the size of a lime
  shot(8, function (u, d) { var k = ease(clamp(u / d)); return [lerp(290, 350, k), lerp(165, 190, k), lerp(1.02, 1.16, k)]; }, function (u, d, t) {
    var s = inside(t) + fetus(220, 160, 0.56, t, { g: 0.12 }) + lime(450, 170, 56, t) + sparkles(450, 170, t, 4, 80);
    s += '<path d="M150 260 H290" stroke="#fff" stroke-width="2" opacity=".7"/>' + ruler(140, 262, 150, 6, t) + ruler(386, 262, 150, 6, t);
    return s + big("6 سم", 220, 76, 30, "#fff", u, 0.8) + tag("قد ليمونة", 450, 60, u, 1.8, 3, 21, "#c8e6a0");
  });
  // 9 — this is the stage of nausea, because the pregnancy hormones climb fast
  shot(9, function (u, d) { return [lerp(300, 340, clamp(u / d)), 180, 1.04]; }, function (u, d, t) {
    t0 = t; var s = room(t, { wx: 70, clock: 9999, plant: 9999 }) + mom(150, 310, t, { belly: 0.15, mood: "dizzy", hand: "mouth", green: 1, s: 0.92 });
    s += chart(320, 260, 260, 150, hcg, clamp((u - 0.4) / 2.6), HCG, { title: "هرمونات الحمل", xl: [[4 / 24, "أسبوع 4"], [10 / 24, "10"], [16 / 24, "16"], [22 / 24, "22"]] });
    return s + tag("بتعلى بسرعة!", 520, 150, u, 2.6, 3, 16, "#f2c9a0") + tag("غثيان", 150, 330, u, 0.6, -3, 19, "#c8e6a0");
  });
  // 10 — in 2023 scientists found another big cause: GDF15, coming from the baby itself
  shot(10, function (u, d) { return u < 3.2 ? [lerp(300, 330, u / 3.2), 180, 1.05] : [lerp(320, 340, (u - 3.2) / (d - 3.2)), 180, lerp(1.0, 1.06, (u - 3.2) / (d - 3.2))]; }, function (u, d, t) {
    if (u < 3.2) {
      var s = bgc("#e9eef2") + '<rect x="-400" y="290" width="1440" height="400" fill="#c9d4da"/><rect x="-400" y="250" width="1440" height="44" fill="#9fb0ba" stroke="' + INK + '" stroke-width="2"/>';
      s += '<rect x="330" y="50" width="250" height="170" rx="8" fill="#fffdf6" stroke="' + INK + '" stroke-width="3"/><text x="455" y="94" text-anchor="middle" style="font:900 34px Noto Sans Arabic;fill:#2b2016">2023</text>';
      for (var bI = 0; bI < 5; bI++) { var hh = (16 + bI * 16) * ease(clamp((u - 0.5 - bI * 0.15) / 0.6)); s += '<rect x="' + (370 + bI * 36) + '" y="' + f(200 - hh) + '" width="24" height="' + f(hh) + '" fill="' + (bI === 4 ? GDF : "#c9b8d8") + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
      s += microscope(250, 250, 1.0, t);
      s += scientist(130, 156, t, u > 1.6 ? "shock" : "curious");
      return s + tag("دراسة جديدة", 420, 30, u, 0.4, -2, 18) + tag("GDF15", 560, 236, u, 1.8, 4, 22, "#d8b8f0");
    }
    var v = u - 3.2, s2 = inside(t) + wombFetus(200, 200, 92, 112, t, { g: 0.08, sc: 0.5, plac: -120, glow: 0.8, dy: 10, cervix: false });
    var pp = placPt(200, 200, 92, 112, -120);
    s2 += '<path d="M' + f(pp[0]) + ' ' + f(pp[1]) + ' C230 -40 420 -20 480 120" stroke="#7a1424" stroke-width="12" fill="none" opacity=".7"/><path d="M' + f(pp[0]) + ' ' + f(pp[1]) + ' C230 -40 420 -20 480 120" stroke="#c2303e" stroke-width="7" fill="none" opacity=".8"/>';
    s2 += particles(t, [pp[0], pp[1], 230, -40, 420, -20, 480, 120], 9, GDF, 0.35, 6) + vomitCenter(500, 190, 0.95, t, clamp(v / 1.5));
    return s2 + tag("GDF15", 330, 40, v, 0.1, -3, 22, "#d8b8f0") + tag("من الجنين نفسه!", 200, 316, v, 1.0, -2, 18, "#f2c9a0") + tag("مركز الترجيع", 500, 330, v, 2.2, 3, 15, "#d8b8f0");
  });
  // 11 — tiredness and sleepiness: progesterone, the hormone that keeps the pregnancy going
  shot(11, function (u, d) { return [lerp(290, 320, clamp(u / d)), 185, lerp(1.08, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var inner = inside(t) + womb(0, 0, 70, 80, t, { cervix: false }) + embryo(0, 6, 0.42, t) + '<ellipse cx="0" cy="0" rx="88" ry="98" fill="none" stroke="#7cc8f2" stroke-width="6" opacity="' + f(0.5 + 0.3 * Math.sin(t * 4)) + '"/>' + swarm(t, 0, 0, 80, 80, 6, PROG, 7);
    var s = room(t, { sofa: 470, lamp: 600 }) + mom(270, 300, t, { belly: 0.25, mood: "sleep", hand: "belly", cut: inner, wr: 52, s: 0.95 });
    s += zzz(300, 70, t) + swarm(t, 270, 160, 120, 100, 7, PROG, 6);
    return s + tag("البروجسترون", 480, 110, u, 0.6, 3, 19, "#bfe0ff") + tag("بيحافظ على الحمل", 470, 330, u, 2.6, 2, 16, "#bfe0ff");
  });
  // 12 — stage two: the nausea usually eases, because the placenta has taken over the hormones
  shot(12, function (u, d) { return [lerp(280, 330, clamp(u / d)), 185, lerp(1.1, 1.0, clamp(u / d))]; }, function (u, d, t) {
    t0 = t; var s = inside(t) + wombFetus(230, 190, 112, 128, t, { g: 0.3, sc: 0.62, plac: -125, glow: 1, dy: 12, cervix: false });
    var pp = placPt(230, 190, 112, 128, -125); s += particles(t, [pp[0], pp[1], pp[0] + 60, pp[1] - 20, 300, 120, 330, 220], 6, "#f2c230", 0.4, 5);
    s += chart(420, 290, 170, 110, function (k) { return hcg((10 + k * 12) / 24); }, clamp((u - 1.4) / 2.2), HCG, { title: "الغثيان بيهدى", xl: [[0, "10"], [0.5, "16"], [1, "22"]] });
    return s + badge(2, 120, 40, u, 0.1) + tag("المشيمة", 110, 300, u, 1.0, -3, 20, "#f2a0a0");
  });
  // 13 — month four: the fingerprints are finished, and they'll stay the same for life
  shot(13, function (u, d) { return [320, lerp(190, 170, clamp(u / d)), lerp(1.0, 1.12, clamp(u / d))]; }, function (u, d, t) {
    var s = inside(t) + '<circle cx="330" cy="180" r="150" fill="#ffd27a" opacity=".12" filter="url(#soft)"/>' + fingertip(330, 200, 1.0, t, clamp((u - 0.3) / 2.6)) + hand(120, 250, 0.7, t, "#f0b296");
    return s + tag("الشهر الرابع", 130, 60, u, 0.3, -3, 19) + tag("بصمة لطول العمر", 500, 320, u, 2.4, 3, 17, "#bfe0ff");
  });
  // 14 — it starts to hear, and around month five she feels the first kick
  shot(14, function (u, d) { return [lerp(300, 330, clamp(u / d)), 175, 1.02]; }, function (u, d, t) {
    var kk = u > 2.2 ? Math.max(0, Math.sin((u - 2.2) * 5)) * (u < 3.6 ? 1 : 0) : 0;
    var inner = '<rect x="-120" y="-120" width="240" height="240" fill="#7a2026"/>' + wombFetus(0, 0, 80, 88, t, { g: 0.45, sc: 0.5, plac: -130, kick: kk, dy: 6, cervix: false });
    var s = room(t, { sofa: 520 }) + mom(240, 302, t, { belly: 0.55, mood: u > 2.3 ? (u > 3.4 ? "happy" : "shock") : "happy", hand: u > 2.4 ? "belly" : "chest", cut: inner, wr: 54, bump: kk, s: 1.0 });
    if (u < 2.4) s += waves(256, 72, t, 0.4, 4, "#f2c230");
    return s + tag("بيسمع صوتك", 470, 80, u, 0.5, 3, 18, "#bfe0ff") + tag("أول ركلة!", 470, 180, u, 2.4, -3, 22) + tag("الشهر الخامس", 470, 290, u, 3.1, 2, 17, "#f2c9a0");
  });
  // 15 — end of stage two: almost a kilo, and the eyes open
  shot(15, function (u, d) { return [lerp(260, 300, clamp(u / d)), 180, lerp(1.15, 1.05, clamp(u / d))]; }, function (u, d, t) {
    var s = inside(t) + wombFetus(240, 186, 112, 128, t, { g: 0.55, sc: 0.72, plac: -125, eyes: u > 1.3 ? 1 : 0, dy: 10, cervix: false });
    var g = Math.min(1000, Math.floor(clamp(u / 2.2) * 1000));
    s += scaleKg(500, 250, 1.1, g >= 1000 ? "1 كيلو" : g + " جم", t);
    return s + tag("عينيه بتفتح", 250, 330, u, 1.4, -2, 19, "#bfe0ff") + tag("حوالي كيلو", 500, 110, u, 2.4, 3, 19);
  });
  // 16 — heartburn: progesterone relaxes the valve at the top of the stomach
  shot(16, function (u, d) { return [lerp(270, 310, clamp(u / d)), 180, lerp(1.12, 1.02, clamp(u / d))]; }, function (u, d, t) {
    var op = ease(clamp((u - 0.8) / 1.0)), s = bgc("#f6e7dc") + '<circle cx="250" cy="200" r="160" fill="#f2c9b8" opacity=".5"/>' + swarm(t, 170, 120, 70, 50, 5, PROG, 6);
    s += stomach(240, 214, 1.0, t, op) + mom(520, 310, t, { belly: 0.6, mood: "worry", hand: "chest", s: 0.8 });
    if (op > 0.5) s += '<circle cx="545" cy="186" r="' + f(16 + 6 * Math.sin(t * 7)) + '" fill="#ff7a2f" opacity=".45" filter="url(#glow)"/>';
    return s + tag("الصمام بيرتخي", 140, 60, u, 0.9, -3, 17) + tag("حموضة!", 520, 60, u, 2.0, 3, 22, "#f2a0a0");
  });
  // 17 — back pain: the belly pulls her forward, and relaxin loosens the ligaments
  shot(17, function (u, d) { return u < 2.5 ? [lerp(260, 290, u / 2.5), 175, 1.05] : [lerp(320, 350, (u - 2.5) / (d - 2.5)), 180, 1.04]; }, function (u, d, t) {
    var s = room(t, { wx: 520, clock: 140, plant: -100 }) + mom(220, 302, t, { belly: 0.82, mood: "worry", hand: "back", s: 1.0, lean: -3 });
    s += '<circle cx="182" cy="200" r="' + f(16 + 6 * Math.sin(t * 6)) + '" fill="#ff3b2f" opacity=".55" filter="url(#glow)"/>' + arrow(250, 196, 330, 228, "#f2c230", 5, clamp((u - 0.5) / 0.8));
    if (u > 2.4) s += popIn('<rect x="370" y="60" width="250" height="220" rx="16" fill="#fffdf6" stroke="' + INK + '" stroke-width="3"/>' + pelvis(495, 170, 0.9, t, clamp((u - 2.8) / 1.4)) + swarm(t, 495, 160, 100, 70, 6, "#e0607e", 5), 495, 170, u, 2.4);
    return s + tag("تقل لقدام", 330, 70, u, 0.8, -3, 19) + tag("ريلاكسين", 495, 310, u, 3.0, 2, 18, "#f2c9a0");
  });
  // 18 — stage three: it stores fat under the skin to keep itself warm after birth
  shot(18, function (u, d) { return [lerp(280, 320, clamp(u / d)), 180, lerp(1.08, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var g = lerp(0.6, 0.95, ease(clamp((u - 0.5) / 3.0))), s = inside(t) + fetus(200, 186, 0.86, t, { g: g, eyes: 1 });
    s += skinBlock(470, 170, 1.0, t, clamp((u - 0.8) / 2.6)) + thermo(590, 250, 0.7, clamp((u - 2.2) / 1.8), t);
    return s + badge(3, 120, 40, u, 0.1) + tag("دهون تحت الجلد", 470, 70, u, 1.2, 3, 17, "#f6dc7e") + tag("عشان يدفى", 470, 300, u, 2.6, -2, 18, "#f2c9a0");
  });
  // 19 — the brain grows fast: about three times heavier
  shot(19, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 350, k), lerp(170, 185, k), lerp(1.12, 0.98, k)]; }, function (u, d, t) {
    var k = 1 - Math.pow(1 - clamp(u / 3.0), 2), s = inside(t) + sparkles(280, 180, t, 7, 150) + '<circle cx="280" cy="180" r="' + f(90 + 60 * k) + '" fill="#ffd27a" opacity=".15" filter="url(#soft)"/>' + brain(280, 186, lerp(0.75, 1.3, k), t, lerp(0.15, 1, k));
    var gr = Math.round(lerp(100, 300, k) / 10) * 10;
    s += scaleKg(520, 270, 0.95, gr + " جم", t);
    return s + big("×3", 520, 130, 54, "#f2c230", u, 2.4) + tag("بيكبر بسرعة", 230, 330, u, 0.6, -2, 18, "#f2c9a0");
  });
  // 20 — the lungs are the last to finish, so a baby born early needs an incubator
  shot(20, function (u, d) { return [lerp(260, 360, ease(clamp(u / d))), 180, 1.02]; }, function (u, d, t) {
    var s = inside(t) + lungs(170, 190, 0.95, t, { depth: 3 }) + '<rect x="330" y="-300" width="800" height="960" fill="#e9eef2"/><rect x="330" y="300" width="800" height="300" fill="#c9d4da"/>';
    s += incubator(490, 200, 0.95, t) + ecg(560, 70, 70, t, "#7cf29a", 150);
    return s + tag("آخر حاجة بتكمل", 170, 40, u, 0.4, -3, 17, "#f2a0a0") + tag("حضّانة", 490, 320, u, 1.8, 2, 20, "#bfe0ff");
  });
  // 21 — breathless: the womb pushes the diaphragm up; swollen feet: it presses on the veins
  shot(21, function (u, d) { return u < 2.7 ? [lerp(230, 260, u / 2.7), lerp(150, 160, u / 2.7), 1.12] : [lerp(300, 350, (u - 2.7) / (d - 2.7)), lerp(190, 210, (u - 2.7) / (d - 2.7)), lerp(1.0, 1.14, (u - 2.7) / (d - 2.7))]; }, function (u, d, t) {
    if (u < 2.7) {
      var push = 0.5 + 0.5 * Math.sin(t * 2.4), inner = '<rect x="-120" y="-120" width="240" height="240" fill="#f6dcd0"/>' + lungs(0, -46, 0.5, t, { squash: 0.12 + 0.12 * push, depth: 3, inf: 1 - push }) + '<path d="M-90 ' + f(4 - 10 * push) + ' Q0 ' + f(-34 - 14 * push) + ' 90 ' + f(4 - 10 * push) + '" stroke="#9a3a3a" stroke-width="7" fill="none"/>' + womb(0, 76 - 8 * push, 56, 52, t, { cervix: false, plac: -60, pl: 50 }) + fetus(0, 80, 0.32, t, { g: 0.9, rot: 170 });
      var s = room(t, { wx: 540, clock: 9999 }) + mom(230, 300, t, { belly: 0.9, mood: "worry", hand: "back", cut: inner, wx: 34, wy: -126, wr: 62, s: 1.02 });
      for (var p = 0; p < 3; p++) { var pu = (t * 1.2 + p / 3) % 1; s += '<ellipse cx="' + f(290 + pu * 50) + '" cy="' + f(80 - pu * 10) + '" rx="' + f(6 + pu * 10) + '" ry="' + f(4 + pu * 6) + '" fill="#fff" opacity="' + f(0.8 * (1 - pu)) + '"/>'; }
      return s + tag("بتنهج", 470, 80, u, 0.4, 3, 22, "#bfe0ff") + tag("الحجاب الحاجز", 470, 200, u, 1.2, -2, 16, "#f2c9a0");
    }
    var v = u - 2.7, s2 = room(t, { wx: 560, clock: 120, plant: 9999 }) + feet(300, 300, 1.0, t, (1 - Math.pow(1 - clamp(v / 1.6), 2)) * (0.92 + 0.08 * Math.sin(t * 3)));
    return s2 + tag("ورم في الرجلين", 300, 60, v, 0.3, -2, 19, "#f2c9a0") + tag("ضغط على العروق", 510, 200, v, 1.0, 3, 15, "#bfe0ff");
  });
  // 22 — any bleeding, bad headache or sudden swelling: the doctor must know right away
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.08, clamp(u / d))]; }, function (u, d, t) {
    var s = bgc("#3a1418") + '<rect x="-400" y="-300" width="1440" height="960" fill="#ff3b2f" opacity="' + f(0.08 + 0.08 * Math.sin(t * 6)) + '"/>';
    s += popIn(drop(110, 150, 1.2, t), 110, 150, u, 0.2);
    s += popIn(head(250, 150, 40, "worry", t) + bolt(200, 100, 1.3, t) + bolt(300, 104, 1.1, t + 1), 250, 150, u, 0.9);
    s += popIn('<g transform="translate(390 150)"><ellipse rx="52" ry="44" fill="#fbfbf7" stroke="' + INK + '" stroke-width="5"/><circle cx="-26" cy="14" r="12" fill="#ff8a8a" opacity=".5"/><circle cx="26" cy="14" r="12" fill="#ff8a8a" opacity=".5"/></g>' + head(390, 150, 34, "dizzy", t), 390, 150, u, 1.6);
    s += popIn(phone(540, 170, 0.95, t), 540, 170, u, 2.4);
    return s + tag("نزيف", 110, 250, u, 0.4, -3, 17, "#f2a0a0") + tag("صداع جامد", 250, 250, u, 1.1, 2, 16, "#f2a0a0") + tag("ورم مفاجئ", 390, 250, u, 1.8, -2, 16, "#f2a0a0") + tag("الدكتور فورًا!", 320, 330, u, 2.8, -2, 21);
  });
  // 23 — at forty weeks it has turned head-down: half a metre long, about three kilos
  shot(23, function (u, d) { return [lerp(280, 330, clamp(u / d)), 180, lerp(1.08, 1.0, clamp(u / d))]; }, function (u, d, t) {
    var rot = 180 * ease(clamp((u - 0.3) / 2.0)), s = inside(t) + wombFetus(240, 170, 118, 138, t, { g: 1, sc: 0.84, rot: rot, plac: -60, eyes: 0, bend: -20, cervix: true });
    s += ruler(436, 300, 230, 50, t, true) + scaleKg(540, 300, 0.9, "3 كيلو", t);
    return s + tag("راسه لتحت", 92, 200, u, 1.6, -3, 19, "#bfe0ff") + tag("نص متر", 470, 50, u, 3.0, 3, 19) + tag("حوالي 3 كيلو", 540, 200, u, 4.0, -3, 16, "#f2c9a0");
  });
  // 24 — payoff: the cell smaller than a pen dot is now a baby crying in your arms
  shot(24, function (u, d) { return u < 1.4 ? [180, 180, lerp(1.6, 1.3, u / 1.4)] : [lerp(260, 300, clamp((u - 1.4) / (d - 1.4))), 180, 1.04]; }, function (u, d, t) {
    var s = room(t, { sofa: 480, lamp: 600 });
    if (u < 1.4) return s + '<circle cx="180" cy="180" r="70" fill="#fff" opacity=".6" filter="url(#soft)"/>' + cell(180, 180, 26 + u * 10, t, 16) + '<circle cx="180" cy="180" r="' + f(clamp((u - 1.0) / 0.4) * 200) + '" fill="#fff" opacity="' + f(clamp((u - 1.0) / 0.4)) + '"/>';
    s += mom(250, 302, t, { belly: 0, mood: "happy", hand: "baby", babyMood: "cry", s: 1.02 }) + hearts(330, 110, t, 4);
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#fff" opacity="' + f(1 - clamp((u - 1.4) / 0.4)) + '"/>' + tag("من خلية لبيبي!", 470, 70, u, 1.8, 3, 20);
  });
  // 25 — outro
  shot(25, function (u, d) { return [lerp(290, 330, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = room(t, { sky: "dusk", lamp: 600, sofa: 470 }) + mom(240, 302, t, { belly: 0, mood: "happy", hand: "baby", babyMood: "happy", s: 1.0 }) + hearts(320, 110, t, 3);
    return s + tag("قولولنا!", 470, 90, u, 0.3, 3, 28);
  });

  window.__parts = { fetus: fetus, embryo: embryo, womb: womb, wombFetus: wombFetus, cell: cell, mom: mom, baby: baby, inside: inside, room: room, tag: tag, lime: lime, sparkles: sparkles, hearts: hearts };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
