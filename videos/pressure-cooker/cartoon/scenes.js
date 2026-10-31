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

  // ── new pieces for this episode: the kitchen, the plain pot, the pressure cooker cut open, the whistle and the safety parts ──
  // ── new pieces for this episode: the vegetable market, the notes, the ships and the charts ──
  var INK = "#1c1c1c", CLIPN = 0, OILN = 0;
  function txt(x, y, s, size, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 900) + ' ' + size + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(size / 9) + ';paint-order:stroke">' + s + '</text>'; }
  // a ball-head person standing; y is the head centre, the body reaches y + 70·s. o: {shirt, hat, arm: "up"|"wave", hold (svg at the raised hand), look, ph}
  function person(x, y, s, t, mood, o) {
    o = o || {}; var ph = o.ph || 0, b = Math.sin(t * 3 + ph) * 2, sh = o.shirt || "#3f6f8f";
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')">';
    g += '<path d="M-26 72 C-28 32 -16 18 0 18 C16 18 28 32 26 72 Z" fill="' + sh + '" stroke="' + INK + '" stroke-width="2.4"/>';
    var sw = Math.sin(t * 2.4 + ph) * 6;
    if (o.arm === "up" || o.arm === "wave") {
      var wa = o.arm === "wave" ? Math.sin(t * 8 + ph) * 14 : Math.sin(t * 3 + ph) * 4, hx = 36 + wa * 0.4, hy = -14 + Math.abs(wa) * 0.2;
      g += '<path d="M16 30 Q30 18 ' + f(hx) + ' ' + f(hy) + '" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="6" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>';
      if (o.hold) g += '<g transform="translate(' + f(hx) + ' ' + f(hy - 6) + ')">' + o.hold + '</g>';
    } else g += '<path d="M18 30 Q' + f(28 + sw * 0.3) + ' 46 ' + f(24 + sw * 0.5) + ' 60" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-18 30 Q' + f(-28 - sw * 0.3) + ' 46 ' + f(-24 - sw * 0.5) + ' 60" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    g += head(0, 0, 20, mood, t + ph, o.look);
    if (o.hat === "hard") g += '<path d="M-21 -6 C-21 -30 21 -30 21 -6 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><rect x="-25" y="-8" width="50" height="5" rx="2" fill="#e2b035" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.hat === "cap") g += '<path d="M-19 -8 C-19 -28 19 -28 19 -8 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><path d="M14 -10 h16 v4 h-18 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.hat === "scarf") g += '<path d="M-23 4 C-26 -30 26 -30 23 4 C18 -14 -18 -14 -23 4 Z" fill="#8f5aa0" stroke="' + INK + '" stroke-width="2"/>';
    return g + '</g>';
  }
  // a banknote. kind "usd": green with the $ medallion; "egp": warm brown with ج
  var STEEL = "url(#gPot)";
  function kitchen(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e1cf"/>';
    for (var y = -300; y < 280; y += 40) for (var x = -400; x < 1040; x += 40) s += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="36" height="36" fill="' + ((x / 40 + y / 40) % 2 ? "#f4efe2" : "#ebe3d0") + '"/>';
    s += '<rect x="440" y="30" width="150" height="110" fill="#bfe0ff" stroke="#8a6a4a" stroke-width="6"/>' + clouds(t, 10, 60, 2, 0.8, 0.5).replace(/<g /g, '<g clip-path="url(#win)" ');
    return s + '<rect x="-400" y="280" width="1440" height="400" fill="#7a5a3a"/><rect x="-400" y="276" width="1440" height="10" fill="#c9c4b8" stroke="' + INK + '" stroke-width="1.6"/>';
  }
  function flames(x, y, w, t, k) {
    k = k == null ? 1 : k; var s = ""; if (k <= 0) return s;
    for (var i = 0; i < 9; i++) { var fx = x - w / 2 + i * w / 8, h = (14 + 8 * Math.sin(t * 13 + i * 2.1) + 4 * Math.sin(t * 7 + i)) * k;
      s += '<path d="M' + f(fx - 6) + ' ' + y + ' Q' + f(fx - 4) + ' ' + f(y - h * 0.6) + ' ' + f(fx) + ' ' + f(y - h) + ' Q' + f(fx + 4) + ' ' + f(y - h * 0.6) + ' ' + f(fx + 6) + ' ' + y + ' Z" fill="#3f7fe0" opacity=".9"/><path d="M' + f(fx - 3) + ' ' + y + ' Q' + f(fx) + ' ' + f(y - h * 0.5) + ' ' + f(fx + 3) + ' ' + y + ' Z" fill="#bfe6ff"/>'; }
    return s;
  }
  function stove(x, y, t, k) { return '<rect x="' + (x - 130) + '" y="' + (y + 6) + '" width="260" height="20" rx="4" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x - 90) + '" y="' + (y - 2) + '" width="180" height="10" fill="#3a3d42" stroke="' + INK + '" stroke-width="1.6"/>' + flames(x, y - 2, 140, t, k); }
  function steam(t, x, y, n, spread, h, op) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 0.6 + i / n) % 1; s += '<circle cx="' + f(x + Math.sin(u * 6 + i) * spread * u + (hash(i) - 0.5) * spread * 0.3) + '" cy="' + f(y - u * h) + '" r="' + f(8 + u * 22) + '" fill="#fff" opacity="' + f((op || 0.7) * (1 - u)) + '" filter="url(#soft)"/>'; } return s; }
  function jet(t, x, y, ang, len, k) { var s = ""; if (k <= 0) return s; var a = ang * Math.PI / 180; for (var i = 0; i < 10; i++) { var u = (t * 2.2 + i / 10) % 1, d = u * len * k; s += '<circle cx="' + f(x + Math.cos(a) * d + Math.sin(i * 3) * u * 10) + '" cy="' + f(y + Math.sin(a) * d) + '" r="' + f(4 + u * 14) + '" fill="#fff" opacity="' + f(0.85 * (1 - u)) + '" filter="url(#soft2)"/>'; } return s; }
  // inside: water (level wy) with bubbles, food chunks, and steam particles above (n grows with the pressure p)
  function inside(t, x0, x1, top, wy, bot, o) {
    o = o || {}; var s = '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (bot - top) + '" fill="#2b3a4a"/>';
    var d = "M" + x0 + " " + wy; for (var x = x0; x <= x1; x += 8) d += " L" + x + " " + f(wy + Math.sin(x * 0.12 + t * 5) * (o.boil ? 2.5 : 1)); s += '<path d="' + d + ' L' + x1 + ' ' + bot + ' L' + x0 + ' ' + bot + ' Z" fill="url(#gWater)"/>';
    if (o.food !== false) [[0.3, 0.75], [0.55, 0.82], [0.75, 0.7]].forEach(function (c, i) { var cx = lerp(x0, x1, c[0]), cy = lerp(wy, bot, c[1]) + Math.sin(t * 2 + i) * 2; s += '<path d="M' + f(cx - 16) + ' ' + f(cy) + ' q4 -14 18 -12 q14 2 12 14 q-4 12 -18 10 q-14 -2 -12 -12 Z" fill="#a8483a" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(cx - 6) + ' ' + f(cy - 6) + ' q6 4 12 0" stroke="#f3dcc8" stroke-width="2" fill="none"/>'; });
    if (o.boil) for (var b = 0; b < 14; b++) { var u = (t * 0.9 + b / 14) % 1; s += '<circle cx="' + f(lerp(x0 + 10, x1 - 10, hash(b)) + Math.sin(u * 8 + b) * 4) + '" cy="' + f(lerp(bot - 6, wy, u)) + '" r="' + f(2 + u * 4) + '" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>'; }
    var n = Math.round(6 + 40 * clamp(o.p || 0)); for (var m = 0; m < n; m++) { var px = x0 + 8 + ((hash(m) * (x1 - x0 - 16) + t * (30 + hash(m + 3) * 60) * (m % 2 ? 1 : -1)) % (x1 - x0 - 16) + (x1 - x0 - 16)) % (x1 - x0 - 16), py = top + 6 + Math.abs(((hash(m + 7) * 2 * (wy - top - 12) + t * (40 + hash(m) * 50)) % (2 * (wy - top - 12))) - (wy - top - 12)); s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="3" fill="#e9f4fb" opacity=".85"/>'; }
    return s;
  }
  // a plain pot, side view; o: {cut, boil, lid, steam}
  function pot(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M-110 -40 h-22 q-8 0 -8 8 v6 q0 6 8 6 h22 Z M110 -40 h22 q8 0 8 8 v6 q0 6 -8 6 h-22 Z" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M-110 -90 H110 V-6 Q110 0 104 0 H-104 Q-110 0 -110 -6 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.cut) g += inside(t, -100, 100, -84, -60, -8, { boil: o.boil, p: 0, food: o.food });
    if (o.lid !== false) g += '<g transform="translate(0 ' + f(o.boil ? -Math.abs(Math.sin(t * 9)) * 3 : 0) + ')"><path d="M-114 -90 Q0 -120 114 -90 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-14" y="-118" width="28" height="10" rx="4" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.6"/></g>';
    g += '</g>';
    if (o.steam) g += steam(t, x, y - 110 * s, 6, 40 * s, 120 * s);
    return g;
  }
  // the pressure cooker, side view (the common Egyptian kind: a long handle on the body and one on the lid, a whistle weight on a vent pipe, a red safety plug)
  // o: {cut, p 0..1, lift 0..1 (whistle up), clog, plug 0..1 (safety plug popped), gasket 0..1 (gasket pushed out), shake, lidY (lid raised), glow}
  function cooker(x, y, s, t, o) {
    o = o || {}; var sh = o.shake ? Math.sin(t * 40) * o.shake : 0, g = '<g transform="translate(' + f(x + sh) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M120 -60 h120 q12 0 12 10 v8 q0 10 -12 10 h-120 Z" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/><path d="M-120 -60 h-30 q-8 0 -8 8 v8 q0 8 8 8 h30 Z" fill="#1c1c1c"/>';
    g += '<path d="M-120 -100 H120 V-8 Q120 0 112 0 H-112 Q-120 0 -120 -8 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-120 -30 H120" stroke="#8a929c" stroke-width="1.4" opacity=".6"/>';
    if (o.cut) g += inside(t, -110, 110, -96, -64, -8, { boil: true, p: o.p, food: o.food });
    if (o.arrows) { var k = clamp(o.p || 0); for (var a = 0; a < 6; a++) { var ax = -90 + a * 36; g += arrow(ax, -84, ax, -84 - 30 * k, "#f2c230", 3, k); } g += arrow(-104, -40, -104 - 30 * k, -40, "#f2c230", 3, k) + arrow(104, -40, 104 + 30 * k, -40, "#f2c230", 3, k); }
    var ly = o.lidY || 0; g += '<g transform="translate(0 ' + f(-ly) + ')">';
    g += '<rect x="-124" y="-108" width="248" height="10" rx="3" fill="#1c1c1c"/>';
    if (o.gasket) g += '<path d="M118 -104 q' + f(26 * o.gasket) + ' -4 ' + f(30 * o.gasket) + ' 4" stroke="#1c1c1c" stroke-width="8" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-120 -104 Q0 -150 120 -104 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-60 -126 h-170 q-12 0 -12 -8 v-6 q0 -8 12 -8 h170 Z" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    var lift = clamp(o.lift || 0) * 10; g += '<rect x="-6" y="-150" width="12" height="20" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.clog) g += '<ellipse cx="0" cy="-150" rx="7" ry="5" fill="#d48a3a" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="3" cy="-154" rx="5" ry="4" fill="#e9b060" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<g transform="translate(0 ' + f(-lift) + ')"><path d="M-16 -150 Q-16 -176 0 -178 Q16 -176 16 -150 Z" fill="url(#gWeight)" stroke="' + INK + '" stroke-width="2"/><rect x="-3" y="-188" width="6" height="12" fill="#5a6068" stroke="' + INK + '"/></g>';
    var pl = clamp(o.plug || 0) * 14; g += '<rect x="44" y="' + f(-140 - pl) + '" width="12" height="14" rx="3" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '</g></g>';
    if (o.lift) g += jet(t, x, y - (178 + ly) * s, -90, 120 * s, clamp(o.lift));
    if (o.plug) g += jet(t + 0.3, x + 50 * s, y - (150 + ly) * s, -80, 140 * s, clamp(o.plug));
    if (o.gasket) g += jet(t + 0.6, x + 150 * s, y - (104 + ly) * s, -10, 130 * s, clamp(o.gasket));
    return g;
  }
  function thermo(x, y, h, v, lo, hi, t) {
    var k = clamp((v - lo) / (hi - lo)), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-14" y="' + (-h) + '" width="28" height="' + (h + 10) + '" rx="14" fill="#fbf7ec" stroke="' + INK + '" stroke-width="2.4"/><circle cy="14" r="22" fill="#d8352a" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<rect x="-6" y="' + f(-h * k + 6) + '" width="12" height="' + f(h * k + 8) + '" fill="#d8352a"/>';
    for (var i = 0; i <= 4; i++) g += '<path d="M8 ' + f(-h + 10 + i * (h - 10) / 4) + ' h6" stroke="' + INK + '" stroke-width="1.6"/>';
    return g + '</g>' + txt(x, y - h - 18, Math.round(v) + "°", 30, k > 0.7 ? "#ffb08a" : "#fff");
  }
  function clock(x, y, r, t, sp, label, col) {
    var a = t * (sp || 1), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbf7ec" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 12; i++) g += '<path d="M0 ' + f(-r + 4) + ' v6" stroke="' + INK + '" stroke-width="2" transform="rotate(' + (i * 30) + ')"/>';
    g += '<path d="M0 0 L0 ' + f(-r * 0.75) + '" stroke="' + (col || "#d8352a") + '" stroke-width="3" stroke-linecap="round" transform="rotate(' + f(a * 57.3) + ')"/><path d="M0 0 L0 ' + f(-r * 0.5) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" transform="rotate(' + f(a * 57.3 / 12) + ')"/><circle r="4" fill="' + INK + '"/></g>';
    return g + (label ? txt(x, y + r + 34, label, 26, col === "#4f8f5a" ? "#bff0b0" : "#fff") : "");
  }
  function gauge2(x, y, r, v) { var a = -120 + 240 * clamp(v); return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbf7ec" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(Math.cos(Math.PI / 6) * (r - 6)) + ' ' + f(-Math.sin(Math.PI / 6) * (r - 6)) + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + f(Math.cos(Math.PI / 6) * (r - 6)) + ' ' + f(Math.sin(Math.PI / 6) * (r - 6)) + '" stroke="#d8352a" stroke-width="6" fill="none" transform="rotate(-90)"/><path d="M0 0 L0 ' + f(-r + 10) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round" transform="rotate(' + f(a) + ')"/><circle r="5" fill="' + INK + '"/></g>'; }
  function brand(t, u) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gBurst)"/>';
    for (var r = 0; r < 16; r++) { var a = r / 16 * Math.PI * 2 + t * 0.3; s += '<path d="M320 180 L' + f(320 + Math.cos(a) * 700) + ' ' + f(180 + Math.sin(a) * 700) + ' L' + f(320 + Math.cos(a + 0.12) * 700) + ' ' + f(180 + Math.sin(a + 0.12) * 700) + ' Z" fill="#fff" opacity=".12"/>'; }
    for (var q = 0; q < 6; q++) s += txt(80 + q * 100, 60 + Math.sin(t * 3 + q) * 14 + (q % 2) * 230, "؟", 40 + (q % 3) * 8, q % 2 ? "#f2c230" : "#fff");
    return s + '<g transform="translate(320 180) scale(' + f(pop(u / 1.0) * (1 + 0.04 * Math.sin(t * 5))) + ')">' + txt(0, 20, "إيه الحكاية؟", 64, "#f2c230") + '</g>';
  }
  function everest(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + clouds(t, 20, 60, 4, 0.7);
    s += '<path d="M-400 360 L-60 120 L80 200 L300 -10 L440 160 L560 90 L1040 360 Z" fill="#7a8796" stroke="' + INK + '" stroke-width="2"/><path d="M240 50 L300 -10 L360 60 L330 50 L300 70 L270 46 Z M520 120 L560 90 L600 130 L575 122 Z" fill="#fff"/>';
    for (var i = 0; i < 40; i++) { var u = (t * 0.4 + hash(i)) % 1; s += '<circle cx="' + f(-200 + hash(i + 3) * 1040 + u * 200) + '" cy="' + f(-100 + u * 460) + '" r="1.8" fill="#fff" opacity=".8"/>'; }
    return s + '<rect x="-400" y="300" width="1440" height="300" fill="#e9eef2"/>';
  }
  function papin(x, y, s, t, mood) { return person(x, y, s, t, mood, { shirt: "#5a3a6a" }) + '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3) * 2 * s) + ') scale(' + s + ')"><path d="M-22 -6 C-30 -34 30 -34 22 -6 C30 4 28 26 20 34 C16 20 14 8 12 0 M-22 -6 C-30 4 -28 26 -20 34 C-16 20 -14 8 -12 0" fill="#e9e1cf" stroke="' + INK + '" stroke-width="2"/></g>'; }
  function digester(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M-60 0 V-110 H60 V0 Z" fill="url(#gIron)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-74" y="-124" width="148" height="16" fill="#4a3a2a" stroke="' + INK + '" stroke-width="2"/><path d="M-50 -124 V-150 H50 V-124" stroke="#4a3a2a" stroke-width="6" fill="none"/><rect x="-6" y="-170" width="12" height="46" fill="#4a3a2a" stroke="' + INK + '"/>';
    var la = o.lever == null ? 0 : o.lever; g += '<g transform="translate(-30 -134) rotate(' + f(-la) + ')"><rect x="0" y="-4" width="120" height="8" fill="#6a4a2a" stroke="' + INK + '" stroke-width="1.6"/><rect x="96" y="-2" width="20" height="26" fill="#3a3d42" stroke="' + INK + '" stroke-width="1.6"/></g>';
    g += '<path d="M-50 0 L-36 30 H36 L50 0" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/>' + flames(0, 30, 70, t, 0.8);
    g += '</g>';
    if (o.lever) g += jet(t, x - 30 * s, y - 140 * s, -95, 90 * s, 1);
    return g;
  }
  function boom(x, y, r, k) { if (k <= 0 || k >= 1) return ""; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(0.4 + k) + ')" opacity="' + f(1 - k * 0.8) + '"><path d="'; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; g += (i ? "L" : "M") + f(Math.cos(a) * rr) + " " + f(Math.sin(a) * rr) + " "; } return g + 'Z" fill="#f2c230" stroke="#d8452e" stroke-width="5"/></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the whistle every Egyptian home knows
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(320, 300, k), lerp(170, 160, k), lerp(1.3, 1.05, ease(k))]; }, function (u, d, t) {
    var lift = Math.max(0, Math.sin(t * 5)), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.9, t, { lift: lift, shake: 0.6 }) + person(560, 190, 1.0, t, "happy", { hat: "scarf", shirt: "#c23a26" });
    for (var i = 0; i < 3; i++) { var q = (t * 1.4 + i / 3) % 1; s += '<path d="M' + f(345 + q * 40) + ' ' + f(90 - q * 30) + ' q10 -8 0 -16" stroke="#1c1c1c" stroke-width="3" fill="none" opacity="' + f(1 - q) + '"/>'; }
    return s + tag("تشششش!", 170, 70, u, 0.5, -4, 24);
  });
  // 1 — half an hour against two hours
  shot(1, function (u, d) { return [320, 175, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = kitchen(t) + stove(170, 290, t) + stove(470, 290, t) + pot(170, 282, 0.85, t, { steam: true }) + cooker(470, 282, 0.75, t, { lift: Math.max(0, Math.sin(t * 5)) });
    s += clock(170, 70, 34, t, 4, "ساعتين", "#d8352a") + clock(470, 70, 34, t, 4, "نص ساعة", "#4f8f5a");
    return s;
  });
  // 2 — how? and why do people fear it can explode?
  shot(2, function (u, d) { return [320, 170, lerp(1.05, 1.2, ease(u / d))]; }, function (u, d, t) {
    var s = kitchen(t) + stove(300, 280, t) + cooker(300, 272, 0.9, t, { lift: Math.max(0, Math.sin(t * 7)), shake: 2.5 }) + person(560, 200, 0.95, t, "shock", { hat: "scarf", shirt: "#c23a26" });
    s += '<g transform="translate(110 80) rotate(' + f(Math.sin(t * 6) * 5) + ')"><path d="M0 -36 L36 30 H-36 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/>' + txt(0, 22, "!", 40, "#1c1c1c") + '</g>';
    return s + tag("ممكن تنفجر؟", 460, 60, u, 1.2, 3, 22, "#f2a0a0");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) { return brand(t, u) + cooker(560, 330, 0.45, t, { lift: Math.max(0, Math.sin(t * 6)) }); });
  // 4 — in a plain pot water never passes 100 degrees, however high the flame
  shot(4, function (u, d) { return [300, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var fl = 0.6 + clamp(u / 2) * 0.9, s = kitchen(t) + stove(280, 280, t, fl) + pot(280, 272, 1.1, t, { cut: true, boil: true, lid: false, steam: true });
    return s + thermo(520, 230, 140, Math.min(100, 60 + u * 25), 20, 130, t) + tag("مهما علّيت النار", 260, 40, u, 0.5, -3, 19);
  });
  // 5 — every extra bit of heat goes into boiling: steam out
  shot(5, function (u, d) { return [300, 170, lerp(1.15, 1.25, u / d)]; }, function (u, d, t) {
    var s = kitchen(t) + stove(300, 280, t, 1.4) + pot(300, 272, 1.1, t, { cut: true, boil: true, lid: false }) + steam(t, 300, 150, 10, 90, 170, 0.8);
    for (var i = 0; i < 4; i++) { var q = (t * 0.8 + i / 4) % 1; s += arrow(230 + i * 45, 300 - q * 20, 230 + i * 45, 260 - q * 120, "#ff8a3a", 4, 1); }
    return s + tag("كله بيروح بخار", 300, 40, u, 0.8, -3, 20) + thermo(540, 230, 140, 100, 20, 130, t);
  });
  // 6 — the food is stuck at 100, waiting
  shot(6, function (u, d) { return [300, 190, lerp(1.4, 1.6, u / d)]; }, function (u, d, t) {
    return kitchen(t) + stove(300, 280, t) + pot(300, 272, 1.1, t, { cut: true, boil: true, lid: false }) + clock(470, 130, 26, t, 6) + tag("محبوس عند 100°", 300, 120, u, 0.6, -3, 18);
  });
  // 7 — the pressure cooker lid locks shut with a rubber gasket
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(170, 120, k), lerp(1.0, 1.6, ease(clamp((u - 1.5) / 2)))]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.4)), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, { lidY: 80 * (1 - k) });
    var g = clamp((u - 1.6) / 0.8); if (g > 0) s += '<ellipse cx="320" cy="' + f(272 - 104 * 0.95) + '" rx="' + f(124 * 0.95) + '" ry="8" fill="none" stroke="#f2c230" stroke-width="' + f(4 * g) + '" opacity="' + f(0.5 + 0.5 * Math.sin(t * 8)) + '"/>';
    return s + tag("جلدة كاوتش", 470, 90, u, 1.8, 3, 18);
  });
  // 8 — the steam can't get out: it crowds inside and the pressure climbs
  shot(8, function (u, d) { return [320, 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var p = clamp(u / d), s = kitchen(t) + stove(300, 300, t) + cooker(300, 292, 1.05, t, { cut: true, p: p, arrows: true });
    return s + gauge2(560, 110, 40, p * 0.8) + tag("الضغط بيعلى", 560, 190, u, 0.8, 3, 18);
  });
  // 9 — under pressure water needs more heat to boil: the steam pushes the escaping molecules back
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a4a"/><rect x="-400" y="200" width="1440" height="400" fill="url(#gWater)"/>';
    for (var i = 0; i < 70; i++) { var px = -100 + hash(i) * 840 + Math.sin(t * 2 + i) * 10, py = -60 + hash(i + 4) * 240 + Math.cos(t * 2.4 + i) * 8; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="5" fill="#e9f4fb" opacity=".8"/>'; }
    for (var m = 0; m < 6; m++) { var x = 80 + m * 95, q = (t * 0.7 + m / 6) % 1, yy = 200 - Math.sin(Math.PI * q) * 60; s += '<circle cx="' + x + '" cy="' + f(yy) + '" r="9" fill="#5fb3e0" stroke="#fff" stroke-width="2"/>' + arrow(x, 120, x, yy - 14, "#f2c230", 3, 1); }
    return s + tag("محتاجة حرارة أكتر", 320, 330, u, 0.8, -2, 20);
  });
  // 10 — so it reaches about 120 degrees, still liquid
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var v = 100 + 20 * ease(clamp((u - 0.3) / 2)), s = kitchen(t) + stove(260, 300, t) + cooker(260, 292, 1.0, t, { cut: true, p: 0.8 });
    return s + thermo(540, 240, 160, v, 20, 130, t);
  });
  // 11 — only 20 degrees more, food done in a third of the time
  shot(11, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e6c8"/><path d="M80 300 H560" stroke="' + INK + '" stroke-width="3"/>';
    var k = ease(clamp((u - 0.3) / 1.4)); s += '<rect x="170" y="' + f(300 - 210 * k) + '" width="100" height="' + f(210 * k) + '" rx="6" fill="#d8352a" stroke="' + INK + '" stroke-width="2.4"/><rect x="380" y="' + f(300 - 70 * k) + '" width="100" height="' + f(70 * k) + '" rx="6" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2.4"/>';
    s += pot(220, 345, 0.35, t, {}) + cooker(430, 345, 0.3, t, { lift: Math.max(0, Math.sin(t * 6)) });
    return s + tag("+20° بس", 320, 50, u, 0.4, -3, 22) + tag("تلت الوقت", 430, 190, u, 1.8, 3, 20);
  });
  // 12 — on Everest the opposite: low pressure, water boils at only 70
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(120, 200, ease(k)), lerp(0.8, 1.15, ease(k))]; }, function (u, d, t) {
    var s = everest(t) + person(180, 250, 0.8, t, "worry", { hat: "hard", shirt: "#e8742e" }) + stove(330, 330, t, 0.6) + pot(330, 322, 0.5, t, { steam: true });
    return s + thermo(500, 300, 120, 70, 20, 130, t) + tag("إيفرست", 300, -40, u, 0.4, -3, 22) + tag("بتغلي على 70°", 500, 340, u, 1.8, 3, 18, "#bfe0ff");
  });
  // 13 — the whistle: an iron weight sitting on a small hole in the lid
  shot(13, function (u, d) { return [320, lerp(180, 120, ease(clamp(u / 1.6))), lerp(1.0, 2.2, ease(clamp(u / 1.6)))]; }, function (u, d, t) {
    var s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, {});
    return s + tag("تقل حديد", 400, 70, u, 1.6, 3, 12) + arrow(380, 76, 336, 90, "#f2c230", 2, clamp((u - 1.6) / 0.5));
  });
  // 14 — at the set pressure it lifts the weight, lets out steam and whistles
  shot(14, function (u, d) { return [320, 110, lerp(2.0, 1.8, u / d)]; }, function (u, d, t) {
    var lift = Math.max(0, Math.sin(t * 6)), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, { lift: lift });
    for (var i = 0; i < 3; i++) { var q = (t * 1.4 + i / 3) % 1; s += '<path d="M' + f(345 + q * 30) + ' ' + f(80 - q * 20) + ' q8 -6 0 -12" stroke="#1c1c1c" stroke-width="2" fill="none" opacity="' + f(1 - q) + '"/>'; }
    return s + tag("بيصفّر!", 400, 60, u, 0.8, 3, 12);
  });
  // 15 — the whistle doesn't say "done", it says "pressure at the top"
  shot(15, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = kitchen(t) + stove(220, 290, t) + cooker(220, 282, 0.8, t, { lift: Math.max(0, Math.sin(t * 6)) });
    s += '<g transform="translate(470 110)"><ellipse rx="130" ry="70" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><path d="M-100 40 L-150 90 L-70 56 Z" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>';
    var k = clamp((u - 0.4) / 0.5), k2 = clamp((u - 1.8) / 0.5);
    s += '<g opacity="' + f(k * (1 - k2 * 0.5)) + '">' + txt(0, -14, "استوى؟", 26, "#1c1c1c") + (k2 > 0 ? '<path d="M-50 -30 L50 -2 M50 -30 L-50 -2" stroke="#d8352a" stroke-width="' + f(5 * k2) + '"/>' : "") + '</g>' + (k2 > 0 ? txt(0, 34, "الضغط وصل!", 28, "#d8452e") : "") + '</g>';
    return s;
  });
  // 16 — on a 22 cm lid, like about 400 kilos pushing from inside
  shot(16, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a4a"/>' + cooker(320, 330, 1.1, t, { cut: true, p: 1, arrows: true });
    var k = ease(clamp((u - 1.2) / 1.0)), by = lerp(-120, 120, k) + (k >= 1 ? Math.sin(t * 6) * 3 : 0);
    s += '<path d="M200 ' + f(by - 20) + ' L240 ' + f(by - 70) + ' H400 L440 ' + f(by - 20) + ' Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2.4"/><rect x="200" y="' + f(by - 20) + '" width="240" height="20" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/>' + txt(320, by - 32, "400 كيلو", 28, "#fff");
    s += '<path d="M188 220 H452" stroke="#f2c230" stroke-width="3" stroke-dasharray="8 6"/>';
    return s + tag("22 سم", 320, 250, u, 0.4, -2, 16) + tag("مش هزار!", 540, 60, u, 2.6, 4, 20, "#f2a0a0");
  });
  // 17 — the danger: the whistle hole blocked by a lentil or bean foam
  shot(17, function (u, d) { return [320, lerp(120, 170, ease(clamp((u - 2) / 2))), lerp(2.2, 1.1, ease(clamp((u - 2) / 2)))]; }, function (u, d, t) {
    var p = clamp(u / d), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, { clog: true, shake: 1 + 3 * p });
    s += '<circle cx="320" cy="' + f(272 - 150 * 0.95) + '" r="' + f(24 + 6 * Math.sin(t * 10)) + '" fill="none" stroke="#d8352a" stroke-width="3" opacity=".8"/>';
    return s + gauge2(540, 100, 34, 0.6 + 0.4 * p) + tag("عدسة سدّت الفتحة!", 180, 60, u, 0.6, -3, 14, "#f2a0a0");
  });
  // 18 — a second safety valve opens by itself
  shot(18, function (u, d) { return [340, 140, lerp(1.6, 1.5, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.8) / 0.4)), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, { clog: true, plug: k, shake: 2 * (1 - k) });
    return s + tag("صمام أمان", 470, 70, u, 1.0, 3, 14);
  });
  // 19 — if that clogs too, the gasket itself is pushed out of a slot
  shot(19, function (u, d) { return [380, 180, lerp(1.5, 1.4, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 1.0) / 0.6)), s = kitchen(t) + stove(320, 280, t) + cooker(320, 272, 0.95, t, { clog: true, gasket: k });
    return s + tag("الجلدة بتتزق لبرة", 470, 120, u, 1.4, 3, 14);
  });
  // 20 — the other danger: opening it while still under pressure
  shot(20, function (u, d) { return [320, 170, lerp(1.0, 1.05, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.6) / 0.6), s = kitchen(t) + stove(260, 290, t, 0) + cooker(260, 282, 0.85, t, { lidY: 50 * ease(k), cut: true, p: 1 });
    if (k > 0) { s += boom(260, 170, 70, clamp((u - 0.7) / 1.2)); for (var i = 0; i < 10; i++) { var q = clamp((u - 0.7) / 1.4), a = -Math.PI * (0.15 + i * 0.07); s += '<circle cx="' + f(260 + Math.cos(a) * q * 260) + '" cy="' + f(170 + Math.sin(a) * q * 160 + q * q * 120) + '" r="7" fill="#a8483a" stroke="' + INK + '"/>'; } }
    s += person(500, 190, 0.95, t, k > 0 ? "shock" : "n", { hat: "scarf", shirt: "#c23a26" });
    return s + tag("استنى الضغط ينزل!", 320, 330, u, 2.2, -2, 18, "#f2a0a0");
  });
  // 21 — 1679: a French scientist, Denis Papin, invents the first pressure cooker
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(220, 400, ease(k)), lerp(190, 160, k), lerp(1.2, 0.95, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gOld)"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="' + (-100 + i * 220) + '" y="-60" width="80" height="200" fill="#8a6a4a" opacity=".25"/>';
    s += '<rect x="-400" y="290" width="1440" height="300" fill="#6a4a2a"/>' + papin(200, 170, 1.3, t, "curious") + digester(440, 290, 0.9, t, {}) + steam(t, 440, 140, 8, 50, 160, 0.8);
    for (var p = 0; p < 30; p++) { var q = (t * 0.15 + hash(p)) % 1; s += '<circle cx="' + f(-100 + hash(p + 2) * 840 + Math.sin(t + p) * 20) + '" cy="' + f(-80 + q * 380) + '" r="1.6" fill="#fff8e0" opacity="' + f(0.6 * Math.sin(Math.PI * q)) + '"/>'; }
    return s + tag("دوني بابان", 200, 50, u, 0.6, -3, 20) + tag("1679", 450, 50, u, 1.6, 3, 24, "#bfe0ff");
  });
  // 22 — his first pots exploded, so he invented the first safety valve
  shot(22, function (u, d) { return [380, 170, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gOld)"/><rect x="-400" y="290" width="1440" height="300" fill="#6a4a2a"/>';
    var b = clamp(u / 1.2); s += b < 1 ? digester(400, 290, 0.9, t, {}) + boom(400, 200, 90, b) : digester(400, 290, 0.9, t, { lever: 10 + 8 * Math.sin(t * 4) });
    s += papin(160, 170, 1.1, t, b < 1 ? "dizzy" : "happy");
    return s + (b >= 1 ? tag("أول صمام أمان", 420, 50, u, 1.4, 3, 20) : "");
  });
  // 23 — payoff: when it whistles, 120 degrees inside and the safety is working
  shot(23, function (u, d) { return [320, 170, lerp(1.08, 1.0, u / d)]; }, function (u, d, t) {
    var s = kitchen(t) + stove(260, 290, t) + cooker(260, 282, 0.85, t, { cut: true, p: 0.8, lift: Math.max(0, Math.sin(t * 5)) }) + thermo(530, 250, 140, 120, 20, 130, t);
    var k = clamp((u - 2.2) / 0.5); if (k > 0) s += '<g transform="translate(520 60) scale(' + f(pop(k)) + ')"><path d="M0 -34 L30 -22 V6 Q30 28 0 40 Q-30 28 -30 6 V-22 Z" fill="#4f8f5a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 2 L-2 12 L14 -10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
    return s + tag("الأمان شغال", 300, 40, u, 2.4, -3, 20);
  });
  // 24 — outro
  shot(24, function (u, d) { return [lerp(300, 340, clamp(u / d)), 175, 1.0]; }, function (u, d, t) {
    return kitchen(t) + stove(220, 290, t) + cooker(220, 282, 0.8, t, { lift: Math.max(0, Math.sin(t * 5)) }) + person(480, 190, 1.0, t, "happy", { hat: "scarf", shirt: "#c23a26", arm: "wave" }) + tag("قولولنا!", 480, 60, u, 0.3, 3, 26);
  });

  window.__parts = { kitchen: kitchen, stove: stove, cooker: cooker, pot: pot, thermo: thermo, steam: steam, jet: jet, person: person, hardHat: function (x, y, s, t, mood, o) { return person(x, y, s, t, mood, Object.assign({ hat: "hard", shirt: "#e8742e" }, o || {})); }, tag: tag, txt: txt, gauge2: gauge2, boom: boom };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
