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

  // ── new pieces for this episode (shapes taken from real photos: see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", WATER = "#2f7fb8", OIL = "#1e1812", MUD = "#9a7048";
  // the sea seen from the side: sky + waves at y0, water getting darker with depth, light rays, drifting specks
  function sea(t, y0, depth, o) {
    o = o || {}; var s = "", dk = clamp(depth || 0);
    if (y0 > -300) { s += (o.sky === "sunset" ? '<rect x="-400" y="-300" width="1440" height="960" fill="url(#skyS)"/>' : sky(o.sky || "day")) + clouds(t, 14, Math.min(y0 - 160, 40), 4, 0.8); if (o.gulls) s += birds(t, y0 - 120, 40); }
    var top = Math.max(-300, y0);
    s += '<rect x="-400" y="' + f(top) + '" width="1440" height="' + f(660 - top + 300) + '" fill="url(#sea' + (dk > 0.6 ? "3" : dk > 0.25 ? "2" : "1") + ')"/>';
    if (y0 > -300) s += waves(t, y0);
    if (dk < 0.7) for (var r = 0; r < 6; r++) { var rx = -100 + r * 150 + Math.sin(t * 0.4 + r) * 30; s += '<path d="M' + f(rx) + ' ' + top + ' L' + f(rx + 60) + ' ' + top + ' L' + f(rx + 160) + ' 400 L' + f(rx + 40) + ' 400 Z" fill="#fff" opacity="' + f((0.07 + 0.04 * Math.sin(t * 1.3 + r)) * (1 - dk)) + '"/>'; }
    for (var i = 0; i < 40; i++) { var px = -300 + hash(i) * 1240 + Math.sin(t * 0.6 + i) * 10, py = ((hash(i + 5) * 700 - t * (6 + hash(i) * 8)) % 700 + 700) % 700 - 300; if (py > top) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(0.8 + hash(i + 2) * 1.6) + '" fill="#fff" opacity=".35"/>'; }
    return s;
  }
  function waves(t, y0) { var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y0 + Math.sin(x * 0.04 + t * 2.2) * 4 + Math.sin(x * 0.11 - t * 3) * 2); return '<path d="' + d + ' V' + (y0 + 20) + ' H-400 Z" fill="#8fd0ee" opacity=".55"/><path d="' + d + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>'; }
  function bubbles(t, x, y, n, sp, spread, top) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), bx = x + Math.sin(u * 9 + i) * spread * u + (hash(i) - 0.5) * spread, by = y - u * (y - (top == null ? y - 200 : top)), r = 2 + hash(i + 3) * 5 * (0.5 + u); s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(r) + '" fill="#bfe6f7" fill-opacity=".35" stroke="#fff" stroke-width="1.4" opacity="' + f(1 - u * 0.6) + '"/>'; } return s; }
  function fish(t, y0, sp, n, col) { var s = ""; for (var i = 0; i < n; i++) { var x = ((t * sp * (i % 2 ? 1 : 0.8) + i * 170) % 1100) - 250, y = y0 + i * 18 + Math.sin(t * 2 + i) * 6, w = Math.sin(t * 10 + i) * 3; s += '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-14 0 Q0 -9 12 0 Q0 9 -14 0 Z" fill="' + (col || "#f2a93b") + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-13 0 L-22 ' + f(-6 + w) + ' L-22 ' + f(6 + w) + ' Z" fill="' + (col || "#f2a93b") + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="6" cy="-2" r="1.6" fill="' + INK + '"/></g>'; } return s; }

  // rock layers under the seabed. o: {dome: height of the anticline, cx, w, oil: 0..1 how full the trap is, cap: highlight the seal, n: layer count}
  var LAYC = ["#c9b07a", "#a98a5c", "#8a7458", "#b39a72", "#6f6a62", "#9a8060", "#7a6650", "#5f5244"];
  function strata(t, y, o) {
    o = o || {}; var s = "", n = o.n || 7, th = o.th || 46, cx = o.cx == null ? 320 : o.cx, w = o.w || 170, dome = o.dome || 0;
    function by(k, x) { var g = Math.exp(-Math.pow((x - cx) / w, 2)); return y + k * th - (k > 0 ? dome * g * (1 - k * 0.04) : 0); }
    function edge(k) { var d = ""; for (var x = -400; x <= 1040; x += 20) d += (x === -400 ? "M" : " L") + x + " " + f(by(k, x)); return d; }
    for (var k = 0; k < n; k++) {
      var top = edge(k), bot = ""; for (var x = 1040; x >= -400; x -= 20) bot += " L" + x + " " + f(by(k + 1, x));
      var col = o.cap && k === o.capK ? "#5a5f66" : LAYC[k % LAYC.length];
      s += '<path d="' + top + bot + ' Z" fill="' + col + '" stroke="#3a3024" stroke-width="1.6"/>';
      for (var g = 0; g < 14; g++) { var gx = -380 + hash(k * 31 + g) * 1400, gy = by(k, gx) + th * (0.3 + hash(g + k) * 0.5); s += '<ellipse cx="' + f(gx) + '" cy="' + f(gy) + '" rx="' + f(4 + hash(g * 3 + k) * 6) + '" ry="2" fill="#000" opacity=".12"/>'; }
    }
    if (o.oil && dome) {   // oil fills the top of the reservoir layer, right under the cap
      var rk = (o.capK || 3) + 1, lev = by(rk, cx) + dome * 0.75 * clamp(o.oil), d = "";
      for (var x2 = cx - w * 1.6; x2 <= cx + w * 1.6; x2 += 10) { var yt = by(rk, x2); if (yt < lev) d += (d ? " L" : "M") + x2 + " " + f(yt); }
      if (d) { s += '<path d="' + d + ' L' + f(cx + w * 1.6) + ' ' + f(lev) + ' L' + f(cx - w * 1.6) + ' ' + f(lev) + ' Z" fill="url(#oilG)" opacity=".92"/>';
        s += '<clipPath id="oc' + (++OILN) + '"><path d="' + d + ' Z"/></clipPath>'; for (var q = 0; q < 10; q++) { var qx = cx + (hash(q) - 0.5) * w * 1.8, qy = lev - 4 - hash(q + 9) * 26 + Math.sin(t * 2 + q) * 2; s += '<circle cx="' + f(qx) + '" cy="' + f(qy) + '" r="2" fill="#ffd98a" opacity="' + f(0.3 + 0.3 * Math.sin(t * 3 + q)) + '"/>'; } }
    }
    return s;
  }
  var OILN = 0;
  function seabed(t, y) { var s = '<path d="M-400 ' + y + ' Q0 ' + (y - 14) + ' 300 ' + y + ' T1040 ' + y + ' V' + (y + 30) + ' H-400 Z" fill="#c9b07a" stroke="#8a7448" stroke-width="2"/>'; for (var i = 0; i < 14; i++) { var x = -300 + i * 90 + hash(i) * 30, h = 20 + hash(i + 1) * 30, sw = Math.sin(t * 1.6 + i) * 8; s += '<path d="M' + f(x) + ' ' + y + ' Q' + f(x + sw) + ' ' + f(y - h / 2) + ' ' + f(x + sw * 1.4) + ' ' + f(y - h) + '" stroke="#4f8f5a" stroke-width="4" fill="none" stroke-linecap="round"/>'; } return s; }

  // the drillship (photo: Discoverer Luanda): long low hull, heavy dark lattice derrick amidships, accommodation + helideck at the bow (left), cranes, pipe rack
  function derrick(x, y, w0, w1, h, col) { col = col || "#2f343a"; var s = '<path d="M' + f(x - w0 / 2) + ' ' + y + ' L' + f(x - w1 / 2) + ' ' + f(y - h) + ' M' + f(x + w0 / 2) + ' ' + y + ' L' + f(x + w1 / 2) + ' ' + f(y - h) + '" stroke="' + col + '" stroke-width="4"/>'; for (var k = 0; k < 9; k++) { var a = y - h * k / 9, b = y - h * (k + 1) / 9, wa = w0 + (w1 - w0) * k / 9, wb = w0 + (w1 - w0) * (k + 1) / 9; s += '<path d="M' + f(x - wa / 2) + ' ' + f(a) + ' L' + f(x + wb / 2) + ' ' + f(b) + ' M' + f(x + wa / 2) + ' ' + f(a) + ' L' + f(x - wb / 2) + ' ' + f(b) + ' M' + f(x - wb / 2) + ' ' + f(b) + ' H' + f(x + wb / 2) + '" stroke="' + col + '" stroke-width="1.8" opacity=".9"/>'; } return s + '<rect x="' + f(x - w1 / 2 - 4) + '" y="' + f(y - h - 8) + '" width="' + f(w1 + 8) + '" height="8" fill="#c23a26" stroke="' + INK + '"/>'; }
  function drillship(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.3) * 2) + ') rotate(' + f(Math.sin(t * 0.9) * 0.8) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-230 0 L230 0 L210 36 L-202 36 Z" fill="url(#hullB)" stroke="' + INK + '" stroke-width="2"/><path d="M-226 0 H226 V8 H-224 Z" fill="#c23a26"/>';
    s += '<rect x="-200" y="-46" width="90" height="46" fill="url(#hullW)" stroke="#5a5a5a"/>'; for (var i = 0; i < 12; i++) s += '<rect x="' + (-194 + (i % 6) * 14) + '" y="' + (-38 + Math.floor(i / 6) * 16) + '" width="9" height="7" fill="' + (o.night ? "#ffd98a" : "#8fb6cf") + '"/>';
    s += '<path d="M-234 -52 H-144 L-154 -44 H-224 Z" fill="#e2b035" stroke="#5a4a20"/><circle cx="-189" cy="-49" r="6" fill="none" stroke="#fff" stroke-width="1.6"/>';
    s += '<rect x="-30" y="-24" width="100" height="24" fill="url(#hullW)" stroke="#5a5a5a"/>' + derrick(20, -24, 84, 30, 156);
    s += '<rect x="90" y="-16" width="90" height="16" fill="#8a929c" stroke="#3a3d42"/>'; for (var p = 0; p < 6; p++) s += '<path d="M94 ' + (-14 + p * 2.4) + ' H176" stroke="#5a6068" stroke-width="1.6"/>';
    s += '<path d="M-90 0 V-46 L-34 -72" stroke="#f2c230" stroke-width="5" fill="none"/><path d="M190 0 V-38 L240 -62" stroke="#f2c230" stroke-width="5" fill="none"/>';
    s += '<circle cx="20" cy="-184" r="5" fill="#ff3b2f" filter="url(#glow)" opacity="' + f(0.6 + 0.4 * Math.sin(t * 4)) + '"/>';
    if (o.pipe) s += '<rect x="16" y="0" width="8" height="' + o.pipe + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1"/>';
    return s + '</g>';
  }
  // semi-submersible platform: two pontoons, four columns, box deck, derrick
  function semisub(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.1 + 1) * 2) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-120" y="40" width="240" height="22" rx="10" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/>';
    [-100, -40, 40, 100].forEach(function (cx) { s += '<rect x="' + (cx - 12) + '" y="-20" width="24" height="62" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/>'; });
    s += '<rect x="-130" y="-46" width="260" height="28" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/><rect x="-124" y="-74" width="70" height="28" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-130 -80 H-50 L-58 -74 H-124 Z" fill="#4f8f5a" stroke="' + INK + '"/>';
    return s + derrick(30, -46, 60, 22, 110) + '</g>';
  }
  // seismic survey vessel (photo: Polar Princess): red hull, white superstructure forward (left), big working deck aft with the streamer reels
  function seisShip(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.5) * 2) + ') rotate(' + f(Math.sin(t * 1.1) * 1) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-130 0 L120 0 L112 26 L-110 26 Z" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><path d="M-128 -2 H122" stroke="#f4f1e8" stroke-width="3"/>';
    s += '<path d="M-110 0 V-40 H-30 V0 Z" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-104 -40 V-62 H-44 V-40 Z" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-100 -58 H-48 V-50 H-100 Z" fill="#26405e"/>';
    s += '<path d="M-74 -62 V-96 M-80 -86 H-68" stroke="#e2b035" stroke-width="3"/>' + '<circle cx="-74" cy="-100" r="4" fill="#fff" stroke="' + INK + '"/>';
    for (var r = 0; r < 3; r++) s += '<circle cx="' + (10 + r * 34) + '" cy="-12" r="12" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (10 + r * 34) + '" cy="-12" r="4" fill="' + INK + '"/>';
    return s + '</g>';
  }
  // streamers: long cables trailing behind at the surface, buoys at the tail, hydrophones blink when the echo arrives
  function streamers(t, x0, y, len, n, blink) { var s = ""; for (var k = 0; k < n; k++) { var yy = y + k * 7, d = "M" + x0 + " " + yy; for (var x = 0; x <= len; x += 20) d += " L" + f(x0 + x) + " " + f(yy + Math.sin(x * 0.03 - t * 2 + k) * 2); s += '<path d="' + d + '" stroke="#f2c230" stroke-width="2.4" fill="none"/>'; for (var h = 1; h < 8; h++) { var hx = x0 + h * len / 8; s += '<circle cx="' + f(hx) + '" cy="' + f(yy + Math.sin(h * len / 8 * 0.03 - t * 2 + k) * 2) + '" r="2.4" fill="' + (blink && Math.sin(t * 12 + h) > 0 ? "#7cf29a" : "#3a3d42") + '"/>'; } s += '<path d="M' + f(x0 + len) + ' ' + f(yy - 6) + ' l8 0 l-4 -10 Z" fill="#ff7a2f" stroke="' + INK + '"/>'; } return s; }
  // FPSO (photo: Singapore FPSO): long tanker hull, process modules on deck, flare tower at one end, turret
  function fpso(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.0) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-220 0 L220 0 L206 34 L-206 34 Z" fill="#7a2a20" stroke="' + INK + '" stroke-width="2"/><path d="M-218 0 H218 V6 H-216 Z" fill="#c9ced4"/>';
    for (var m = 0; m < 6; m++) { var mx = -150 + m * 52; s += '<rect x="' + mx + '" y="-30" width="44" height="30" fill="#8a929c" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + mx + ' -20 H' + (mx + 44) + ' M' + mx + ' -10 H' + (mx + 44) + '" stroke="#5a6068"/><rect x="' + (mx + 8) + '" y="-44" width="10" height="14" fill="#e2b035" stroke="' + INK + '"/>'; }
    s += '<rect x="170" y="-40" width="40" height="40" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M164 -46 H214 L208 -40 H170 Z" fill="#e2b035"/>';
    s += '<path d="M-190 0 L-196 -110 M-180 0 L-186 -110" stroke="#5a6068" stroke-width="3"/><path d="M-200 -110 H-176" stroke="#5a6068" stroke-width="4"/>';
    var fl = 1 + 0.25 * Math.sin(t * 9) + 0.15 * Math.sin(t * 23); s += '<g transform="translate(-188 -114) scale(' + f(fl) + ')"><path d="M0 0 C-12 -10 -8 -26 2 -36 C2 -24 14 -18 8 0 Z" fill="#ff8a2f"/><path d="M0 0 C-5 -6 -3 -14 2 -20 C3 -12 8 -8 4 0 Z" fill="#ffe08a"/></g>';
    return s + '</g>';
  }
  function tanker(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2 + 2) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-200 0 L190 0 L180 30 L-186 30 Z" fill="#26405e" stroke="' + INK + '" stroke-width="2"/><path d="M-198 0 H188 V8 H-196 Z" fill="#c23a26"/><path d="M-170 -6 H130 V0 H-170 Z" fill="#4f8f5a"/>';
    for (var p = 0; p < 7; p++) s += '<path d="M' + (-150 + p * 40) + ' -6 v-8" stroke="#c9ced4" stroke-width="3"/>';
    s += '<rect x="140" y="-44" width="40" height="44" fill="url(#hullW)" stroke="#5a5a5a"/><rect x="150" y="-60" width="16" height="16" fill="#c23a26" stroke="' + INK + '"/>';
    return s + '</g>';
  }
  function refinery(x, y, t) {
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    [[-120, 70, 16], [-90, 100, 20], [-50, 60, 14]].forEach(function (c) { s += '<rect x="' + (c[0] - c[2] / 2) + '" y="' + (-c[1]) + '" width="' + c[2] + '" height="' + c[1] + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.4"/>'; for (var r = 1; r < 5; r++) s += '<path d="M' + (c[0] - c[2] / 2 - 3) + ' ' + (-c[1] * r / 5) + ' h' + (c[2] + 6) + '" stroke="' + INK + '"/>'; });
    for (var k = 0; k < 3; k++) s += '<path d="M' + (-10 + k * 50) + ' 0 v-30 a24 10 0 0 1 48 0 v30 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-150 0 H160" stroke="' + INK + '" stroke-width="3"/><path d="M150 0 V-120" stroke="#5a6068" stroke-width="4"/>';
    var fl = 1 + 0.2 * Math.sin(t * 9); s += '<g transform="translate(150 -122) scale(' + f(fl) + ')"><path d="M0 0 C-10 -8 -7 -22 2 -30 C2 -20 12 -14 7 0 Z" fill="#ff8a2f"/></g>';
    for (var sm = 0; sm < 5; sm++) { var u = (t * 0.3 + sm / 5) % 1; s += '<circle cx="' + f(-90 + Math.sin(u * 4) * 10 + u * 40) + '" cy="' + f(-104 - u * 70) + '" r="' + f(6 + u * 14) + '" fill="#e9e4d8" opacity="' + f(0.5 * (1 - u)) + '"/>'; }
    return s + '</g>';
  }

  // drill bits (photos: Commons tricone + PDC): pin with threads up, cutting face down
  function cone(x, y, rot, flip, spin) {
    var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (flip ? -1 : 1) + ' 1)">';
    s += '<path d="M-46 -40 Q-58 0 -46 40 L30 13 Q42 0 30 -13 Z" fill="url(#cone)" stroke="' + INK + '" stroke-width="2"/>';
    [0.12, 0.42, 0.72].forEach(function (tt, r) { var cx = -46 + 76 * tt, hh = 40 * (1 - tt) + 13 * tt, n = 5 - r, ph = ((spin || 0) * (1.6 + r * 0.6)) % 1;
      s += '<path d="M' + f(cx) + ' ' + f(-hh) + ' Q' + f(cx - 6) + ' 0 ' + f(cx) + ' ' + f(hh) + '" stroke="#2b2e33" stroke-width="1.4" fill="none"/>';
      for (var k = 0; k < n; k++) { var yy = -hh + (2 * hh) * ((k + ph) % n + 0.5) / n; s += '<path d="M' + f(cx - 5) + ' ' + f(yy - 5) + ' L' + f(cx + 7) + ' ' + f(yy) + ' L' + f(cx - 5) + ' ' + f(yy + 5) + ' Z" fill="#dfe3e8" stroke="' + INK + '" stroke-width=".9"/>'; }
      s += '<path d="M' + f(cx - 3) + ' ' + f(-hh - 1) + ' l5 -9 l5 9 Z M' + f(cx - 3) + ' ' + f(hh + 1) + ' l5 9 l5 -9 Z" fill="#dfe3e8" stroke="' + INK + '" stroke-width=".9"/>'; });
    return s + '</g>';
  }
  function threads(y0, n) { var s = '<path d="M-26 ' + y0 + ' H26 L22 ' + (y0 + n * 7 + 4) + ' H-22 Z" fill="url(#bitBody)" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < n; i++) s += '<path d="M-24 ' + (y0 + 4 + i * 7) + ' L24 ' + (y0 + 8 + i * 7) + '" stroke="#2b2e33" stroke-width="1.6"/>'; return s; }
  function tricone(x, y, t, sc, spin) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (sc || 1) + ')">' + threads(-150, 6) +
      '<path d="M-44 -104 H44 L60 -70 V-20 L36 10 H-36 L-60 -20 V-70 Z" fill="url(#leg)" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -100 L-24 6 M20 -100 L24 6" stroke="#1d4a44" stroke-width="3"/><circle cx="-40" cy="-44" r="6" fill="' + INK + '"/><circle cx="40" cy="-44" r="6" fill="' + INK + '"/>' +
      cone(-46, 40, 48, false, spin) + cone(46, 40, -48, true, spin) + cone(0, 62, 90, false, spin) + '</g>';
  }
  function pdc(x, y, t, sc, ang) {
    var R = 78, yG = -40, D = 86, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (sc || 1) + ')">' + threads(-150, 5);
    s += '<path d="M-40 -110 H40 L' + R + ' -70 V' + yG + ' H' + (-R) + ' V-70 Z" fill="url(#gold)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + (-R) + ' ' + yG + ' A' + R + ' ' + D + ' 0 0 0 ' + R + ' ' + yG + ' Z" fill="#6e5426" stroke="' + INK + '" stroke-width="2"/>';
    var blades = [];
    for (var j = 0; j < 7; j++) { var ph0 = j * 2 * Math.PI / 7 + (ang || 0), pts = [];
      for (var k = 0; k <= 12; k++) { var u = k / 12, ph = ph0 + 0.9 * u, r = R * Math.cos(u * 1.45); pts.push([r * Math.sin(ph), yG + D * Math.sin(u * 1.45) - 6 * Math.cos(ph) * (1 - u), Math.cos(ph), u]); }
      var front = pts.filter(function (p) { return p[2] > -0.05; }); if (front.length < 2) continue;
      blades.push([front.reduce(function (m, p) { return m + p[2]; }, 0) / front.length, front]); }
    blades.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (bl) { var p = bl[1], d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L");
      s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="23" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="url(#gold)" stroke-width="19" stroke-linecap="round" fill="none"/>';
      p.forEach(function (q, i) { if (i % 2 || q[3] > 0.85) return; var rr = 3 + 3.2 * Math.max(0.2, q[2]); s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1] - 3) + '" rx="' + f(rr * (0.45 + 0.55 * Math.max(0, q[2]))) + '" ry="' + f(rr) + '" fill="url(#pdc)" stroke="' + INK + '" stroke-width="1.1"/>'; }); });
    return s + '</g>';
  }
  // BOP stack (photo: yellow frame, annulars + ram blocks inside, red hydraulic hoses). close: 0 open .. 1 rams shut
  function bop(x, y, t, close, o) {
    o = o || {}; var c = clamp(close || 0), s = '<g transform="translate(' + f(x - 320) + ' ' + f(y - 200) + ')">';
    if (o.riser !== false) s += '<rect x="308" y="-300" width="24" height="410" fill="url(#steel)" stroke="' + INK + '"/>' + [-120, -60, 0, 46].map(function (yy) { return '<rect x="292" y="' + yy + '" width="56" height="34" rx="6" fill="#f2c230" stroke="' + INK + '"/><path d="M292 ' + (yy + 17) + ' H348" stroke="#b8901c" stroke-width="2"/>'; }).join("");
    s += '<path d="M332 100 C380 96 400 120 396 150" stroke="#c23a26" stroke-width="4" fill="none"/><path d="M308 100 C262 96 242 124 246 160" stroke="#c23a26" stroke-width="4" fill="none"/>';
    s += '<rect x="296" y="106" width="48" height="16" fill="url(#steel)" stroke="' + INK + '"/>';
    [124, 158].forEach(function (yy) { s += '<path d="M276 ' + (yy + 30) + ' V' + (yy + 12) + ' Q276 ' + yy + ' 296 ' + yy + ' H344 Q364 ' + yy + ' 364 ' + (yy + 12) + ' V' + (yy + 30) + ' Z" fill="url(#steelD)" stroke="' + INK + '" stroke-width="2"/>'; });
    [192, 216, 240, 264].forEach(function (yy, i) { var r = i % 2 ? "url(#steelD)" : "url(#bopRed)", sl = 30 * c * (i === 0 || i === 2 ? 1 : 0.6);
      s += '<rect x="266" y="' + yy + '" width="108" height="20" rx="3" fill="' + r + '" stroke="' + INK + '" stroke-width="2"/>';
      s += '<rect x="' + f(232 + sl) + '" y="' + (yy + 4) + '" width="34" height="12" rx="3" fill="url(#steel)" stroke="' + INK + '"/><rect x="' + f(374 - sl) + '" y="' + (yy + 4) + '" width="34" height="12" rx="3" fill="url(#steel)" stroke="' + INK + '"/>'; });
    s += '<g stroke="' + INK + '" stroke-width="1.5" fill="url(#bopYel)"><rect x="222" y="112" width="12" height="180"/><rect x="406" y="112" width="12" height="180"/><rect x="216" y="104" width="208" height="10"/><rect x="216" y="186" width="208" height="7"/><rect x="210" y="288" width="220" height="10"/></g>';
    s += '<path d="M234 120 L272 184 M406 120 L368 184" stroke="#e2b035" stroke-width="5"/><rect x="300" y="298" width="40" height="12" fill="url(#steel)" stroke="' + INK + '"/>';
    s += '<circle cx="428" cy="150" r="5" fill="' + (c > 0.5 ? "#ff3b2f" : "#5bbf6a") + '" filter="url(#glow)"/>';
    return s + '</g>';
  }
  function rov(x, y, t, s) { return '<g transform="translate(' + f(x + Math.sin(t * 0.9) * 8) + ' ' + f(y + Math.sin(t * 1.3) * 5) + ') scale(' + (s || 1) + ')"><rect x="-40" y="-24" width="80" height="48" rx="8" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><rect x="-36" y="-30" width="72" height="8" fill="#e9e4d8" stroke="' + INK + '"/><circle cx="-40" cy="0" r="7" fill="#fff6c8" filter="url(#glow)"/><path d="M-40 0 L-140 -30 L-140 30 Z" fill="#fff6c8" opacity=".12"/><path d="M-30 24 l-14 14 M-20 24 l-6 16" stroke="#3a3d42" stroke-width="3"/></g>'; }

  // the characters: an oil-drop mascot and an engineer with a hard hat
  function drop(x, y, r, mood, t, o) {
    o = o || {}; var b = Math.sin(t * 3 + x) * r * 0.06, s = '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') rotate(' + f(Math.sin(t * 2 + x) * 4) + ')">';
    s += '<path d="M0 ' + f(-r * 1.6) + ' C' + f(r * 0.5) + ' ' + f(-r * 0.9) + ' ' + f(r) + ' ' + f(-r * 0.4) + ' ' + f(r) + ' ' + f(r * 0.2) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(-r) + ' ' + f(r * 0.2) + ' C' + f(-r) + ' ' + f(-r * 0.4) + ' ' + f(-r * 0.5) + ' ' + f(-r * 0.9) + ' 0 ' + f(-r * 1.6) + ' Z" fill="url(#oilG)" stroke="' + INK + '" stroke-width="' + f(r / 9) + '"/>';
    s += '<ellipse cx="' + f(-r * 0.45) + '" cy="' + f(-r * 0.35) + '" rx="' + f(r * 0.16) + '" ry="' + f(r * 0.3) + '" fill="#fff" opacity=".45"/>';
    s += '<g transform="translate(0 ' + f(r * 0.1) + ')"><circle cx="' + f(-r * 0.34) + '" cy="0" r="' + f(r * 0.24) + '" fill="#fff"/><circle cx="' + f(r * 0.34) + '" cy="0" r="' + f(r * 0.24) + '" fill="#fff"/>';
    var blink = ((t * 0.5 + x * 0.01) % 1) < 0.05, pr = r * (mood === "shock" ? 0.08 : 0.12);
    if (!blink) s += '<circle cx="' + f(-r * 0.3 + (o.look || 0) * r * 0.06) + '" cy="' + f(r * 0.03) + '" r="' + f(pr) + '" fill="' + INK + '"/><circle cx="' + f(r * 0.38 + (o.look || 0) * r * 0.06) + '" cy="' + f(r * 0.03) + '" r="' + f(pr) + '" fill="' + INK + '"/>';
    else s += '<path d="M' + f(-r * 0.5) + ' 0 h' + f(r * 0.3) + ' M' + f(r * 0.2) + ' 0 h' + f(r * 0.3) + '" stroke="' + INK + '" stroke-width="' + f(r / 10) + '"/>';
    s += mood === "happy" ? '<path d="M' + f(-r * 0.3) + ' ' + f(r * 0.42) + ' q' + f(r * 0.3) + ' ' + f(r * 0.3) + ' ' + f(r * 0.6) + ' 0" stroke="#fff" stroke-width="' + f(r / 10) + '" fill="none" stroke-linecap="round"/>' : mood === "shock" ? '<ellipse cx="0" cy="' + f(r * 0.5) + '" rx="' + f(r * 0.12) + '" ry="' + f(r * 0.17) + '" fill="#fff"/>' : '<path d="M' + f(-r * 0.18) + ' ' + f(r * 0.5) + ' h' + f(r * 0.36) + '" stroke="#fff" stroke-width="' + f(r / 11) + '" stroke-linecap="round"/>';
    return s + '</g></g>';
  }
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/><path d="M0 -88 V-54" stroke="#d9d3c4" stroke-width="6"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function carSide(x, y, t, s, col) {   // a family car, side view, wheels turning
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return c + '</g>';
  }
  function fuelGauge(x, y, v) { var a = -1.2 + 2.4 * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-30 0 A30 30 0 0 1 30 0" stroke="#1c1c1c" stroke-width="10" fill="none"/><path d="M-30 0 A30 30 0 0 1 30 0" stroke="#f4f1e8" stroke-width="6" fill="none"/><path d="M0 0 L' + f(Math.sin(a) * 26) + ' ' + f(-Math.cos(a) * 26) + '" stroke="#c23a26" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/><text x="-30" y="14" text-anchor="middle" style="font:700 10px Noto Serif;fill:#f4f1e8">E</text><text x="30" y="14" text-anchor="middle" style="font:700 10px Noto Serif;fill:#f4f1e8">F</text></g>'; }
  function plankton(x, y, s, t, k) { var r = Math.sin(t * 2 + k) * 20; return k % 3 === 0 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><circle r="8" fill="#8fd08a" stroke="#2e6a3a" stroke-width="1.4"/><circle r="4" fill="none" stroke="#2e6a3a"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M0 0 L' + f(Math.cos(i) * 12) + ' ' + f(Math.sin(i) * 12) + '" stroke="#2e6a3a" stroke-width=".8"/>'; }).join("") + '</g>'
    : k % 3 === 1 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><ellipse rx="12" ry="5" fill="#d9e8a0" stroke="#5a6a2a" stroke-width="1.4"/><path d="M-10 0 H10 M-6 -4 V4 M0 -5 V5 M6 -4 V4" stroke="#5a6a2a" stroke-width=".9"/></g>'
    : '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><path d="M0 -8 L7 6 L-7 6 Z" fill="#a8e0d8" stroke="#2a6a6a" stroke-width="1.4"/><circle r="2.4" fill="#2a6a6a"/></g>'; }
  function monitor(x, y, w, h, inner) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2 - 10) + '" y="' + (-h / 2 - 10) + '" width="' + (w + 20) + '" height="' + (h + 20) + '" rx="10" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" fill="url(#screen)"/>' + inner + '<path d="M-20 ' + (h / 2 + 10) + ' L-30 ' + (h / 2 + 40) + ' H30 L20 ' + (h / 2 + 10) + ' Z" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/></g>'; }
  // an isometric slab of rock layers for the computer's 3D image; dome bulges the top layers, glow marks the trap
  function block3d(t, w, rotA, dome, glow) {
    var s = "", n = 5, th = 16, cA = Math.cos(rotA), sA = Math.sin(rotA);
    function P(x, z, y) { var X = x * cA - z * sA, Z = x * sA + z * cA; return [X * 0.9, Z * 0.45 - y]; }
    function hgt(x, z, k) { return (n - k) * th + dome * Math.exp(-(x * x + z * z) / (w * w * 0.18)) * (k < 3 ? 1 : 0.5); }
    var cols = ["#c9b07a", "#5a5f66", "#a98a5c", "#8a7458", "#6f6a62"], N = 8;
    for (var k = n - 1; k >= 0; k--) {
      var front = "", ztop = w / 2;
      for (var i = 0; i <= N; i++) { var x = -w / 2 + w * i / N, p = P(x, ztop, hgt(x, ztop, k)); front += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
      for (var i2 = N; i2 >= 0; i2--) { var x2 = -w / 2 + w * i2 / N, p2 = P(x2, ztop, hgt(x2, ztop, k + 1) - (k === n - 1 ? 0 : 0)); front += " L" + f(p2[0]) + " " + f(p2[1]); }
      s += '<path d="' + front + ' Z" fill="' + cols[k] + '" stroke="#7cf2ff" stroke-width="1" opacity=".95"/>';
    }
    for (var a = 0; a < N; a++) for (var b = 0; b < N; b++) { var x0 = -w / 2 + w * a / N, z0 = -w / 2 + w * b / N, x1 = x0 + w / N, z1 = z0 + w / N, q = [P(x0, z0, hgt(x0, z0, 0)), P(x1, z0, hgt(x1, z0, 0)), P(x1, z1, hgt(x1, z1, 0)), P(x0, z1, hgt(x0, z1, 0))], hh = hgt((x0 + x1) / 2, (z0 + z1) / 2, 0) - n * th;
      s += '<path d="M' + q.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + (hh > dome * 0.5 ? "#e2c47a" : "#c9b07a") + '" stroke="#7cf2ff" stroke-width=".6" opacity=".9"/>'; }
    if (glow > 0) { var c = P(0, 0, hgt(0, 0, 0)); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1] + 30) + '" rx="' + f(40 * glow) + '" ry="' + f(16 * glow) + '" fill="#ff7a2f" opacity="' + f(0.35 + 0.25 * Math.sin(t * 5)) + '" filter="url(#glow)"/>'; }
    return s;
  }
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  // the well bore through the rock: casing walls, drill pipe inside, bit at the bottom
  function wellbore(t, x, y0, y1, o) {
    o = o || {}; var s = '<rect x="' + (x - 26) + '" y="' + y0 + '" width="52" height="' + (y1 - y0) + '" fill="#3a3024"/><path d="M' + (x - 26) + ' ' + y0 + ' V' + y1 + ' M' + (x + 26) + ' ' + y0 + ' V' + y1 + '" stroke="#8a929c" stroke-width="4"/>';
    s += '<rect x="' + (x - 10) + '" y="' + y0 + '" width="20" height="' + (y1 - y0 - 20) + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var j = y0 + 40; j < y1 - 20; j += 60) s += '<rect x="' + (x - 13) + '" y="' + j + '" width="26" height="8" fill="url(#steelD)" stroke="' + INK + '"/>';
    return s;
  }

  // ── the tunnel boring machine (Mixshield layout: yellow cutterhead, slurry chamber, steel shield, thrust rams, segment erector, backup) ──
  var CLIPN = 0, CONC = "url(#gConc)";
  // side cut-away, digging to the right. x = front of the cutterhead, y = tunnel axis. o: { s, spin, ext 0..1 (rams out), erA (erector angle), rings, backup, airlock, flow, slurry }
  function tbmSide(x, y, t, o) {
    o = o || {}; var R = 60, s = o.s || 1, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    // the tunnel behind: concrete rings, a thin grout band, the dark inside, backup gantries with pipes
    var nR = o.rings == null ? 8 : o.rings, W = 24, tail = -210;
    for (var r = 0; r < nR; r++) { var rx = tail - (r + 1) * W; g += '<rect x="' + rx + '" y="' + (-R - 2) + '" width="' + W + '" height="12" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + rx + '" y="' + (R - 10) + '" width="' + W + '" height="12" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    if (nR > 0) { g += '<rect x="' + (tail - nR * W) + '" y="' + (-R + 10) + '" width="' + (nR * W) + '" height="' + (2 * R - 20) + '" fill="#3a3530"/>';
      if (o.grout) g += '<rect x="' + (tail - nR * W) + '" y="' + (-R - 5) + '" width="' + (nR * W) + '" height="3" fill="#8a8578"/><rect x="' + (tail - nR * W) + '" y="' + (R + 2) + '" width="' + (nR * W) + '" height="3" fill="#8a8578"/>';
      for (var bg = 0; bg < (o.backup || 0); bg++) { var bx = tail - 20 - bg * 70; if (bx < tail - nR * W + 10) break; g += '<path d="M' + bx + ' ' + (R - 10) + ' V' + (-R + 16) + ' H' + (bx - 54) + ' V' + (R - 10) + '" stroke="#e2b035" stroke-width="4" fill="none"/><rect x="' + (bx - 50) + '" y="' + (-R + 22) + '" width="46" height="18" fill="#5a6068" stroke="' + INK + '"/><rect x="' + (bx - 44) + '" y="' + (R - 30) + '" width="34" height="14" fill="' + CONC + '" stroke="' + INK + '"/>'; }
      g += '<path d="M' + (tail - nR * W) + ' ' + (R - 22) + ' H-40" stroke="#9a7048" stroke-width="5"/><path d="M' + (tail - nR * W) + ' ' + (R - 30) + ' H-40" stroke="#5d93ad" stroke-width="5"/>';
      if (o.flow) for (var q = 0; q < 10; q++) { var u = (t * 0.5 + q / 10) % 1; g += '<circle cx="' + f(lerp(-40, tail - nR * W, u)) + '" cy="' + (R - 22) + '" r="2.4" fill="#e9d8a8"/><circle cx="' + f(lerp(tail - nR * W, -40, u)) + '" cy="' + (R - 30) + '" r="2" fill="#cfe6f2"/>'; } }
    // shield: steel skin top + bottom, dark inside
    g += '<rect x="' + tail + '" y="' + (-R + 8) + '" width="' + (-14 - tail) + '" height="' + (2 * R - 16) + '" fill="#2b2f34"/>';
    g += '<rect x="' + tail + '" y="' + (-R) + '" width="' + (-14 - tail) + '" height="10" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + tail + '" y="' + (R - 10) + '" width="' + (-14 - tail) + '" height="10" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.6"/>';
    // excavation chamber full of slurry under pressure, the bulkhead and the airlock door
    g += '<rect x="-44" y="' + (-R + 10) + '" width="30" height="' + (2 * R - 20) + '" fill="url(#gSlurry)"/>'; for (var bb = 0; bb < 6; bb++) { var bu = (t * 0.8 + bb / 6) % 1; g += '<circle cx="' + f(-34 + Math.sin(bb * 2 + t * 3) * 8) + '" cy="' + f(lerp(R - 16, -R + 16, bu)) + '" r="2" fill="#e9d8a8" opacity=".7"/>'; }
    g += '<rect x="-50" y="' + (-R + 10) + '" width="7" height="' + (2 * R - 20) + '" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.airlock !== false) g += '<rect x="-74" y="' + (-R + 14) + '" width="24" height="26" rx="4" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-62" cy="' + (-R + 27) + '" r="6" fill="#8fb6cf" stroke="' + INK + '"/>';
    // main drive: motors around the centre
    g += '<rect x="-96" y="-18" width="44" height="36" rx="4" fill="#4f8f5a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-74" cy="0" r="10" fill="#3a6a44" stroke="' + INK + '"/><path d="M-74 0 L' + f(-74 + Math.cos(t * 4) * 9) + ' ' + f(Math.sin(t * 4) * 9) + '" stroke="#e9e4d8" stroke-width="2"/>';
    // thrust rams, top and bottom: cylinder + rod pushing on the last ring
    var ext = clamp(o.ext == null ? 0.5 : o.ext); [-R + 18, R - 26].forEach(function (yy) { g += '<rect x="-160" y="' + yy + '" width="34" height="8" rx="2" fill="url(#gRam)" stroke="' + INK + '"/><rect x="' + f(-160 - 46 * (0.3 + 0.7 * ext)) + '" y="' + (yy + 2) + '" width="' + f(46 * (0.3 + 0.7 * ext)) + '" height="4" fill="#d9dee4" stroke="' + INK + '" stroke-width=".8"/>'; });
    // erector: a rotating arm holding a segment
    var ea = (o.erA == null ? Math.sin(t * 1.2) * 60 : o.erA) * Math.PI / 180; g += '<circle cx="-186" cy="0" r="7" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/><path d="M-186 0 L' + f(-186 + Math.sin(ea) * 6) + ' ' + f(-Math.cos(ea) * 34) + '" stroke="#e2b035" stroke-width="6" stroke-linecap="round"/><rect x="' + f(-198 + Math.sin(ea) * 6) + '" y="' + f(-Math.cos(ea) * 34 - 5) + '" width="24" height="10" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.2"/>';
    // the cutterhead, seen edge-on: thick yellow wheel, disc cutters on the front edge rolling as it turns
    g += '<rect x="-14" y="' + (-R - 2) + '" width="18" height="' + (2 * R + 4) + '" rx="4" fill="url(#gHead)" stroke="' + INK + '" stroke-width="2"/>';
    var sp = (t * (o.spin == null ? 1.2 : o.spin)) % 1; for (var d = 0; d < 9; d++) { var dy = -R + 4 + ((d + sp) % 9) * (2 * R - 8) / 9; g += '<path d="M4 ' + f(dy) + ' a5 5 0 0 1 0 10" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="1.2"/>'; }
    g += '<path d="M4 -6 h8 v12 h-8" fill="#6a727c" stroke="' + INK + '" stroke-width="1.2"/>';
    return g + '</g>';
  }
  // the cutterhead seen from the front: spokes, slurry openings, disc cutters, scrapers on the rim, centre cutter
  function cutterFace(x, y, r, t, o) {
    o = o || {}; var rot = t * (o.rpm == null ? 30 : o.rpm), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r + 8) + '" fill="url(#gShield)" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(' + f(rot) + ')">';
    g += '<circle r="' + r + '" fill="url(#gFace)" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 6; k++) { var a0 = k * 60 + 8, a1 = a0 + 26, p = function (a, rr) { return f(Math.cos(a * Math.PI / 180) * rr) + ' ' + f(Math.sin(a * Math.PI / 180) * rr); }; g += '<path d="M' + p(a0, r * 0.22) + ' L' + p(a0, r * 0.88) + ' A' + f(r * 0.88) + ' ' + f(r * 0.88) + ' 0 0 1 ' + p(a1, r * 0.88) + ' L' + p(a1, r * 0.22) + ' Z" fill="#3a3024" stroke="' + INK + '" stroke-width="2"/>'; }
    for (var s2 = 0; s2 < 6; s2++) { var sa = s2 * 60 + 50; for (var j = 0; j < 5; j++) { var rr = r * (0.3 + j * 0.15), cx = Math.cos(sa * Math.PI / 180) * rr, cy = Math.sin(sa * Math.PI / 180) * rr; g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 0.055) + '" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="1.4"/>'; } }
    for (var m = 0; m < 24; m++) { var ma = m * 15; g += '<rect x="' + f(r - 6) + '" y="-3" width="8" height="6" fill="#d9dee4" stroke="' + INK + '" stroke-width="1" transform="rotate(' + ma + ')"/>'; }
    g += '<circle r="' + f(r * 0.16) + '" fill="#9a6a10" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(-r * 0.12) + ' 0 H' + f(r * 0.12) + ' M0 ' + f(-r * 0.12) + ' V' + f(r * 0.12) + '" stroke="#d9dee4" stroke-width="3"/>';
    return g + '</g></g>';
  }
  // a ring of nine concrete segments seen along the tunnel; n = how many are in (can be fractional), bolts + gasket
  function ringFront(x, y, r, n, t, o) {
    o = o || {}; var w = r * 0.18, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r + w * 0.4) + '" fill="#8a7458"/><circle r="' + f(r - w) + '" fill="#2b2620"/>';
    for (var k = 0; k < 9; k++) { var p = clamp(n - k); if (p <= 0) continue; var a0 = -90 + k * 40 + 0.8, a1 = a0 + 38.4, fly = (1 - p) * 40;
      function P(a, rr) { return f(Math.cos(a * Math.PI / 180) * rr) + ' ' + f(Math.sin(a * Math.PI / 180) * rr); }
      var mid = (a0 + a1) / 2 * Math.PI / 180, dx = -Math.cos(mid) * fly, dy = -Math.sin(mid) * fly;
      g += '<g transform="translate(' + f(dx) + ' ' + f(dy) + ')"><path d="M' + P(a0, r) + ' A' + r + ' ' + r + ' 0 0 1 ' + P(a1, r) + ' L' + P(a1, r - w) + ' A' + f(r - w) + ' ' + f(r - w) + ' 0 0 0 ' + P(a0, r - w) + ' Z" fill="' + (k === 8 ? "#c9c4b8" : CONC) + '" stroke="' + INK + '" stroke-width="2"/>';
      if (p >= 1 && o.bolts !== false) [a0 + 6, a1 - 6].forEach(function (ba) { g += '<circle cx="' + f(Math.cos(ba * Math.PI / 180) * (r - w / 2)) + '" cy="' + f(Math.sin(ba * Math.PI / 180) * (r - w / 2)) + '" r="' + f(w * 0.12) + '" fill="#3a3d42"/>'; });
      g += '</g>'; }
    if (o.gasket) g += '<circle r="' + f(r - w * 0.5) + '" fill="none" stroke="#1c1c1c" stroke-width="1.6" stroke-dasharray="3 3" opacity=".6"/>';
    return g + '</g>';
  }
  function ground(t, y) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gSoil)"/>' + strata(t, y, { n: 7, th: 52 }); }
  function canal(t, yW, o) {   // the water of the canal with a ship going over, the banks, the sky
    o = o || {}; var s = sky("day") + clouds(t, 10, Math.min(yW - 160, 30), 4, 0.8) + '<rect x="-400" y="' + yW + '" width="1440" height="80" fill="url(#sea1)"/>' + waves(t, yW);
    s += '<path d="M-400 ' + (yW - 4) + ' H' + (o.bankL || 60) + ' L' + ((o.bankL || 60) + 40) + ' ' + (yW + 80) + ' H-400 Z M1040 ' + (yW - 4) + ' H' + (o.bankR || 580) + ' L' + ((o.bankR || 580) - 40) + ' ' + (yW + 80) + ' H1040 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>';
    var sx = ((t * 18) % 1100) - 300; s += tanker(sx, yW + 2, t, { s: 0.55 });
    return s;
  }
  function plant(x, y, t) {   // the separation plant on the surface: shaker screens, cyclones, sand pile, slurry tanks
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    s += '<rect x="-150" y="-60" width="90" height="60" fill="#5d93ad" stroke="' + INK + '" stroke-width="2"/><rect x="-140" y="-74" width="70" height="14" fill="#9a7048" stroke="' + INK + '"/>';
    for (var c = 0; c < 3; c++) s += '<path d="M' + (-40 + c * 26) + ' -110 h18 l-9 40 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="-46" y="-70" width="84" height="12" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6" transform="translate(0 ' + f(Math.sin(t * 20) * 1.2) + ')"/><path d="M-50 -58 V0 M34 -58 V0" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M60 0 Q100 -70 140 0 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>'; for (var g = 0; g < 6; g++) { var u = (t * 0.8 + g / 6) % 1; s += '<circle cx="' + f(lerp(38, 96, u)) + '" cy="' + f(-64 + u * 10 + u * u * 20) + '" r="3" fill="#d9c79a" stroke="#8a7448"/>'; }
    return s + '</g>';
  }
  function hardHat(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s }, o || {})); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // ── the Sheikh Jaber causeway over Kuwait Bay: a long viaduct of precast spans on piers, the sail-shaped steel pylon of the
  // cable-stayed main bridge over the shipping channel, bored piles in the seabed, pile caps cast dry inside precast shells,
  // the casting yard on the shore and the floating crane that set each span. Shapes from project photos (../refs/SOURCES.md).
  var SAND = "#d9c79a", LAND = "#e3cf9e";
  function lampPost(x, y, h, night) { return '<path d="M' + f(x) + ' ' + y + ' V' + f(y - h) + ' q0 -6 8 -6" stroke="#8a929c" stroke-width="2" fill="none"/>' + (night ? '<circle cx="' + f(x + 9) + '" cy="' + f(y - h - 4) + '" r="7" fill="#ffd98a" opacity=".6" filter="url(#soft2)"/>' : "") + '<rect x="' + f(x + 5) + '" y="' + f(y - h - 7) + '" width="8" height="3" fill="' + (night ? "#ffe9a0" : "#f4f1e8") + '"/>'; }
  // the viaduct side-on: deck top at yD, piers every sp px (scrolled by off), pile caps at the waterline yW
  function viaduct(t, yD, yW, o) {
    o = o || {}; var sp = o.sp || 120, th = o.th || 16, off = ((o.off || 0) % sp + sp) % sp, s = "";
    for (var x = -400 - off; x < 1100 && !o.noPiers; x += sp) {
      s += '<rect x="' + f(x - 8) + '" y="' + (yD + th) + '" width="16" height="' + f(yW - yD - th + 2) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/>';
      s += '<rect x="' + f(x - 20) + '" y="' + (yD + th) + '" width="40" height="7" fill="#bdb8ad" stroke="' + INK + '" stroke-width="1.4"/>';
      s += '<rect x="' + f(x - 22) + '" y="' + f(yW - 4) + '" width="44" height="12" rx="2" fill="url(#gWet)" stroke="' + INK + '" stroke-width="1.4"/>';
    }
    s += '<rect x="-400" y="' + yD + '" width="1500" height="' + th + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/><path d="M-400 ' + (yD + th * 0.65) + ' H1100" stroke="#8a857a" stroke-width="1.2"/>';
    for (var j = -400 - off; j < 1100; j += sp) s += '<path d="M' + f(j) + ' ' + yD + ' v' + th + '" stroke="' + INK + '" stroke-width="1.2" opacity=".55"/>';
    s += '<path d="M-400 ' + (yD - 5) + ' H1100" stroke="#5a6068" stroke-width="2"/>';
    for (var lx = -400 - off + sp / 4; lx < 1100; lx += sp / 2) s += lampPost(lx, yD - 4, o.lamp || 24, o.night);
    if (o.traffic) for (var c = 0; c < 7; c++) { var cxp = ((t * o.traffic * (c % 2 ? 1 : -1.3) + c * 230) % 1600 + 1600) % 1600 - 450; s += '<rect x="' + f(cxp) + '" y="' + (yD - 9) + '" width="18" height="8" rx="2.5" fill="' + ["#c23a26", "#f4f1e8", "#2f6f9f", "#e2b035", "#4f8f5a", "#8a929c", "#1c1c1c"][c] + '" stroke="' + INK + '"/>'; }
    return s;
  }
  function waterFront(t, yW, op) { return '<rect x="-400" y="' + f(yW + 4) + '" width="1500" height="400" fill="#2b86b5" opacity="' + (op || 0.45) + '"/>' + waves(t, yW + 2); }
  // Kuwait Towers: three needles, two with the blue-green tiled spheres
  function kuwaitTowers(x, y, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">';
    g += '<path d="M-3 0 L-1 -190 L1 -190 L3 0 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.4"/><circle cx="0" cy="-104" r="17" fill="url(#gTile)" stroke="' + INK + '" stroke-width="1.6"/><circle cx="0" cy="-146" r="9" fill="url(#gTile)" stroke="' + INK + '" stroke-width="1.4"/>';
    g += '<path d="M-38 0 L-36 -150 L-34 -150 L-32 0 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-35" cy="-112" r="12" fill="url(#gTile)" stroke="' + INK + '" stroke-width="1.4"/>';
    g += '<path d="M28 0 L31 -110 L34 0 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.2"/>';
    return g + '</g>';
  }
  // the main bridge pylon: one curved steel mast shaped like a dhow's sail; v 0..1 runs from the deck to the tip
  function pylonX(x, v) { return x - 18 * Math.sin(Math.PI * v * 0.95) + 40 * v * v; }
  function pylon(x, yD, yW, H, grow, t) {
    var L = "", R = "", g = clamp(grow == null ? 1 : grow);
    for (var i = 0; i <= 20; i++) { var v = i / 20 * g, w = 15 * (1 - v) + 4, px = pylonX(x, v), py = yD - H * v; L += (i ? " L" : "M") + f(px - w) + " " + f(py); R = " L" + f(px + w) + " " + f(py) + R; }
    var s = '<rect x="' + f(x - 15) + '" y="' + yD + '" width="30" height="' + f(yW - yD + 6) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.8"/><rect x="' + f(x - 30) + '" y="' + f(yW - 4) + '" width="60" height="14" rx="2" fill="url(#gWet)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="' + L + R + ' Z" fill="url(#gPylon)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    if (g > 0.98) s += '<circle cx="' + f(pylonX(x, 1) + 1) + '" cy="' + f(yD - H - 4) + '" r="4" fill="#ff3b2f" filter="url(#glow)" opacity="' + f(0.5 + 0.5 * Math.sin(t * 4)) + '"/>';
    return s;
  }
  // eight pairs of stay cables from the pylon down to the deck, p = how many are in
  function stays(x, yD, H, p) {
    var s = ""; for (var k = 0; k < 8; k++) { var q = clamp(p * 8 - k); if (q <= 0) continue; var v = 0.5 + k * 0.065, px = pylonX(x, v), py = yD - H * v;
      [-1, 1].forEach(function (sd) { var dx = x + sd * (34 + k * 30); s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(lerp(px, dx, q)) + ' ' + f(lerp(py, yD, q)) + '" stroke="#3a3d42" stroke-width="1.6"/>'; }); }
    return s;
  }
  function dhow(x, y, t, s) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.6) * 2) + ') rotate(' + f(Math.sin(t * 1.1) * 2) + ') scale(' + (s || 1) + ')"><path d="M-60 0 L60 0 L44 18 L-44 18 Z" fill="#8a5a2a" stroke="' + INK + '" stroke-width="2"/><path d="M-6 0 V-90" stroke="#5a3a20" stroke-width="3"/><path d="M-50 -14 Q-10 -70 26 -104 Q20 -50 34 -6 Z" fill="#f4ecd8" stroke="' + INK + '" stroke-width="2"/></g>'; }
  function cargoShip(x, y, t, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2) * 1.5) + ') scale(' + (s || 1) + ')"><path d="M-170 0 L160 0 L146 34 L-156 34 Z" fill="#26405e" stroke="' + INK + '" stroke-width="2"/><path d="M-168 0 H158 V8 H-166 Z" fill="#c23a26"/>';
    for (var c = 0; c < 9; c++) for (var r = 0; r < 2; r++) g += '<rect x="' + (-140 + c * 28) + '" y="' + (-16 - r * 16) + '" width="26" height="15" fill="' + ["#c23a26", "#2f6f9f", "#e2b035", "#4f8f5a"][(c + r * 3) % 4] + '" stroke="' + INK + '" stroke-width="1.2"/>';
    return g + '<rect x="118" y="-52" width="34" height="52" fill="url(#hullW)" stroke="#5a5a5a"/><rect x="124" y="-46" width="22" height="8" fill="#26405e"/></g>'; }

  // ── under the water: seabed layers, piles, the drilling rig on its jack-up barge, the precast shell ──
  function soil(t, yB, o) {
    o = o || {}; var s = '<rect x="-400" y="' + yB + '" width="1500" height="40" fill="url(#gSilt)"/><rect x="-400" y="' + (yB + 40) + '" width="1500" height="' + (o.dense ? o.dense - 40 : 110) + '" fill="#c9b07a"/>';
    var yd = yB + (o.dense || 150); s += '<rect x="-400" y="' + yd + '" width="1500" height="900" fill="url(#gDense)"/>';
    for (var i = 0; i < 90; i++) { var gx = -380 + hash(i) * 1440, gy = yB + 8 + hash(i + 7) * ((o.dense || 150) + 160); s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(1 + hash(i + 3) * 2) + '" fill="#000" opacity="' + (gy > yd ? 0.2 : 0.1) + '"/>'; }
    s += '<path d="M-400 ' + yB + ' H1100" stroke="#5a4a30" stroke-width="2"/><path d="M-400 ' + yd + ' H1100" stroke="#6a4a20" stroke-width="2" stroke-dasharray="10 6"/>';
    return s + seabed(t, yB);
  }
  function pileCol(x, yTop, yBot, w, fill) { return '<rect x="' + f(x - w / 2) + '" y="' + f(yTop) + '" width="' + w + '" height="' + f(Math.max(0, yBot - yTop)) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.8"/>' + (fill ? '<path d="M' + f(x - w / 4) + ' ' + f(yTop + 4) + ' V' + f(yBot - 4) + ' M' + f(x + w / 4) + ' ' + f(yTop + 4) + ' V' + f(yBot - 4) + '" stroke="#8a857a" stroke-width="1"/>' : ""); }
  function barge(x, y, w, t, col) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.4 + x) * 1.5) + ')"><path d="M' + (-w / 2) + ' 0 H' + (w / 2) + ' L' + (w / 2 - 10) + ' 18 H' + (-w / 2 + 10) + ' Z" fill="' + (col || "#5a6068") + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + (-w / 2) + ' 0 H' + (w / 2) + '" stroke="#e2b035" stroke-width="3"/></g>'; }
  // jack-up barge standing on four legs, a piling rig on it, the drill string going down to `depth` below the seabed yB
  function rig(x, yW, yB, t, o) {
    o = o || {}; var s = "", dk = yW - 26;
    [-70, -40, 40, 70].forEach(function (lx) { s += '<rect x="' + (x + lx - 4) + '" y="' + (dk - 40) + '" width="8" height="' + f(yB - dk + 50) + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/>'; });
    s += '<rect x="' + (x - 90) + '" y="' + dk + '" width="180" height="16" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x + 30) + '" y="' + (dk - 22) + '" width="44" height="22" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (x + 36) + '" y="' + (dk - 18) + '" width="14" height="10" fill="#8fb6cf"/>';
    s += '<path d="M' + (x + 20) + ' ' + dk + ' L' + (x + 6) + ' ' + (dk - 150) + '" stroke="#e2b035" stroke-width="7"/><path d="M' + (x + 20) + ' ' + dk + ' L' + (x + 6) + ' ' + (dk - 150) + '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 6"/>';
    var dep = o.depth || 0, cs = o.casing == null ? 1 : o.casing;   // steel casing through the water and the soft top layer
    s += '<rect x="' + (x - 13) + '" y="' + (dk + 16) + '" width="26" height="' + f((yB + 40 - dk - 16) * cs) + '" fill="url(#steelD)" stroke="' + INK + '" stroke-width="1.4" opacity=".9"/>';
    if (dep > 0) s += '<rect x="' + (x - 11) + '" y="' + yB + '" width="22" height="' + f(dep) + '" fill="#3a3024"/>';
    if (o.pour > 0) s += '<rect x="' + (x - 11) + '" y="' + f(yB + dep * (1 - o.pour)) + '" width="22" height="' + f(dep * o.pour) + '" fill="url(#gConc)"/>';
    if (o.cage != null) { var cy = lerp(dk - 120, yB, clamp(o.cage)); s += '<path d="M' + x + ' ' + (dk - 150) + ' V' + f(cy) + '" stroke="#3a3d42" stroke-width="1.2"/><g stroke="#c4652a" stroke-width="1.6"><path d="M' + (x - 8) + ' ' + f(cy) + ' v' + f(dep) + ' M' + (x + 8) + ' ' + f(cy) + ' v' + f(dep) + ' M' + x + ' ' + f(cy) + ' v' + f(dep) + '"/>'; for (var r = 0; r < dep; r += 10) s += '<path d="M' + (x - 9) + ' ' + f(cy + r) + ' h18"/>'; s += '</g>'; }
    if (o.auger) { var ay = yB + dep, sp = t * 14; s += '<path d="M' + x + ' ' + (dk - 150) + ' V' + f(ay - 14) + '" stroke="#5a6068" stroke-width="5"/>'; for (var k = 0; k < 4; k++) { var yy = ay - 14 + k * 4; s += '<path d="M' + (x - 10) + ' ' + f(yy + Math.sin(sp + k) * 2) + ' L' + (x + 10) + ' ' + f(yy - Math.sin(sp + k) * 2) + '" stroke="#2b2e33" stroke-width="3"/>'; }
      for (var q = 0; q < 6; q++) { var uu = (t * 0.9 + q / 6) % 1; s += '<circle cx="' + f(x + (q % 2 ? 22 : -22) + Math.sin(uu * 6) * 6) + '" cy="' + f(lerp(yB, yB - 30, uu)) + '" r="' + f(3 + uu * 5) + '" fill="#8a7a5a" opacity="' + f(0.7 * (1 - uu)) + '"/>'; } }
    return s;
  }
  // a precast concrete shell: an open-topped box lowered over the pile heads; the water inside drains to `wet` (1 full .. 0 dry)
  function shell(x, yTop, w, h, yW, wet, t) {
    var s = '<rect x="' + f(x - w / 2) + '" y="' + f(yTop) + '" width="' + w + '" height="' + h + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2.4"/>';
    var inTop = Math.max(yTop + 8, lerp(yTop + h - 12, yW, clamp(wet))); s += '<rect x="' + f(x - w / 2 + 8) + '" y="' + f(yTop + 8) + '" width="' + (w - 16) + '" height="' + (h - 16) + '" fill="#e9e4d8"/>';
    if (wet > 0.02 && yTop + h - 8 > inTop + 1) s += '<rect x="' + f(x - w / 2 + 8) + '" y="' + f(inTop) + '" width="' + (w - 16) + '" height="' + f(yTop + h - 8 - inTop) + '" fill="#4fb3d9" opacity=".85"/>';
    return s;
  }
  // the precast span (one whole span between two piers) side-on: a box girder with lifting points on top
  function span(x, y, L, h, o) {
    o = o || {}; var s = '<rect x="' + f(x - L / 2) + '" y="' + f(y) + '" width="' + L + '" height="' + h + '" rx="2" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + f(x - L / 2) + ' ' + f(y + h * 0.28) + ' H' + f(x + L / 2) + '" stroke="#8a857a" stroke-width="1.4"/><path d="M' + f(x - L / 2 + 6) + ' ' + f(y + h - 4) + ' H' + f(x + L / 2 - 6) + '" stroke="#8a857a" stroke-width="1"/>';
    if (o.lugs) [-0.32, 0.32].forEach(function (k) { s += '<rect x="' + f(x + k * L - 4) + '" y="' + f(y - 5) + '" width="8" height="5" fill="#3a3d42"/>'; });
    if (o.fresh) s += '<rect x="' + f(x - L / 2) + '" y="' + f(y) + '" width="' + f(L * clamp(o.fresh)) + '" height="' + h + '" fill="#a7a198" opacity=".55"/>';
    return s;
  }
  // the floating crane (sheerleg): a barge with a huge A-frame boom at the bow, pivot at (x+70, y-20)
  function boomTip(x, y, a, len) { return [x + 70 + Math.cos(a * Math.PI / 180) * len, y - 20 - Math.sin(a * Math.PI / 180) * len]; }
  function sheerleg(x, y, t, a, hookY, len) {
    len = len || 230; var tp = boomTip(x, y, a, len), s = '<path d="M' + (x - 120) + ' ' + y + ' H' + (x + 110) + ' L' + (x + 96) + ' ' + (y + 26) + ' H' + (x - 110) + ' Z" fill="#2f5873" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + (x - 120) + ' ' + y + ' H' + (x + 110) + '" stroke="#e2b035" stroke-width="4"/>';
    s += '<rect x="' + (x - 110) + '" y="' + (y - 34) + '" width="60" height="34" fill="url(#hullW)" stroke="#5a5a5a"/><rect x="' + (x - 104) + '" y="' + (y - 28) + '" width="48" height="8" fill="#26405e"/>';
    s += '<path d="M' + (x - 40) + ' ' + (y - 4) + ' L' + f(tp[0] - 8) + ' ' + f(tp[1] + 4) + '" stroke="#5a6068" stroke-width="3"/>';
    s += '<path d="M' + (x + 70) + ' ' + (y - 20) + ' L' + f(tp[0]) + ' ' + f(tp[1]) + '" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M' + (x + 70) + ' ' + (y - 20) + ' L' + f(tp[0]) + ' ' + f(tp[1]) + '" stroke="#e2b035" stroke-width="10" stroke-linecap="round"/>';
    for (var k = 1; k < 8; k++) { var px = lerp(x + 70, tp[0], k / 8), py = lerp(y - 20, tp[1], k / 8); s += '<path d="M' + f(px - 4) + ' ' + f(py - 3) + ' l8 6" stroke="#9a7a10" stroke-width="2"/>'; }
    s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' V' + f(hookY) + '" stroke="#2b2e33" stroke-width="2"/><rect x="' + f(tp[0] - 7) + '" y="' + f(hookY - 4) + '" width="14" height="10" fill="#e2b035" stroke="' + INK + '"/>';
    return s;
  }
  function slings(hx, hy, x, y, L) { return '<path d="M' + f(hx) + ' ' + f(hy + 6) + ' L' + f(x - L * 0.32) + ' ' + f(y - 4) + ' M' + f(hx) + ' ' + f(hy + 6) + ' L' + f(x + L * 0.32) + ' ' + f(y - 4) + '" stroke="#2b2e33" stroke-width="1.6"/>'; }

  // ── the map of Kuwait Bay seen from above: the city on the south shore, Subiya on the north, the open Gulf to the east ──
  var BAY = "M-60 150 C40 80 200 70 330 95 C430 110 520 120 700 90 L700 330 C560 300 470 290 380 290 C260 290 120 270 30 240 C-20 220 -70 190 -60 150 Z";
  var ROUTE = [[268, 286], [180, 282], [80, 262], [10, 220], [-10, 160], [40, 100], [140, 60], [250, 50], [360, 60], [428, 92]];
  function routeAt(k) { var n = ROUTE.length - 1, i = Math.min(n - 1, Math.floor(k * n)), q = k * n - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], q), lerp(ROUTE[i][1], ROUTE[i + 1][1], q)]; }
  function bridgeAt(k) { return [lerp(272, 428, k) + Math.sin(k * Math.PI) * 26, lerp(282, 96, k)]; }
  function bayMap(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="960" fill="' + LAND + '"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + f(-300 + hash(i) * 1200) + '" cy="' + f(-200 + hash(i + 4) * 700) + '" r="' + f(8 + hash(i + 1) * 20) + '" fill="#d4bf8a" opacity=".5"/>';
    s += '<path d="' + BAY + '" fill="#4fb3d9" stroke="#2b6f9f" stroke-width="3"/><rect x="560" y="-300" width="600" height="960" fill="#3a9bc9"/><path d="M560 -300 V90 C620 120 600 300 560 330 V660" stroke="#2b6f9f" stroke-width="3" fill="none"/>';
    for (var w = 0; w < 14; w++) { var wx = (hash(w) * 700 + t * 30) % 700 - 60, wy = 120 + hash(w + 3) * 150; s += '<path d="M' + f(wx) + ' ' + f(wy) + ' q6 -4 12 0 t12 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>'; }
    for (var b = 0; b < 14; b++) s += '<rect x="' + (210 + (b % 7) * 14) + '" y="' + (300 + Math.floor(b / 7) * 12 + (b % 3) * 2) + '" width="10" height="' + (10 + (b % 4) * 4) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width=".8"/>';
    s += '<circle cx="268" cy="292" r="7" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><circle cx="430" cy="86" r="7" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2"/>';
    if (o.route) { var d = ""; for (var r = 0; r <= 40 * clamp(o.route); r++) { var p = routeAt(r / 40); d += (r ? " L" : "M") + f(p[0]) + " " + f(p[1]); } s += '<path d="' + d + '" stroke="#8a5a2a" stroke-width="5" fill="none" stroke-dasharray="10 6" stroke-linecap="round"/>'; }
    if (o.bridge) { var e = ""; for (var q = 0; q <= 40 * clamp(o.bridge); q++) { var pb = bridgeAt(q / 40); e += (q ? " L" : "M") + f(pb[0]) + " " + f(pb[1]); } s += '<path d="' + e + '" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + e + '" stroke="#f4f1e8" stroke-width="5" fill="none" stroke-linecap="round"/>'; }
    if (o.islands) [0.18, 0.72].forEach(function (k, j) { var pi = bridgeAt(k), sc = pop((o.islands - j * 0.6) / 1); if (sc > 0) s += '<g transform="translate(' + f(pi[0] + 22) + ' ' + f(pi[1]) + ') scale(' + f(sc) + ')"><ellipse rx="20" ry="12" fill="' + SAND + '" stroke="#8a7448" stroke-width="2"/><ellipse rx="10" ry="5" fill="#4f8f5a"/></g>'; });
    if (o.piles) { var n = Math.floor(60 * clamp(o.piles)); for (var pp = 0; pp < n; pp++) { var pq = bridgeAt(pp / 59); s += '<circle cx="' + f(pq[0] - 8) + '" cy="' + f(pq[1]) + '" r="2.6" fill="#5a564e"/><circle cx="' + f(pq[0] + 8) + '" cy="' + f(pq[1]) + '" r="2.6" fill="#5a564e"/>'; } }
    return s;
  }
  function clock(x, y, r, t, sp, col) { var a = t * (sp || 3); return '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><circle r="' + f(r - 5) + '" fill="none" stroke="' + (col || "#c23a26") + '" stroke-width="2" opacity=".5"/><path d="M0 0 L' + f(Math.sin(a) * r * 0.75) + ' ' + f(-Math.cos(a) * r * 0.75) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(a / 12) * r * 0.5) + ' ' + f(-Math.cos(a / 12) * r * 0.5) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle r="3" fill="' + INK + '"/></g>'; }
  function dot(p, col, t) { return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(8 + Math.sin(t * 8) * 1.5) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function firework(x, y, t, ph, col) { var u = (t * 0.7 + ph) % 1, s = ""; if (u < 0.25) return '<circle cx="' + x + '" cy="' + f(y + 120 * (1 - u * 4)) + '" r="2.4" fill="#ffe9a0"/>'; var k = (u - 0.25) / 0.75; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<path d="M' + f(x + Math.cos(a) * 40 * k * 0.5) + ' ' + f(y + Math.sin(a) * 40 * k * 0.5 + k * k * 10) + ' L' + f(x + Math.cos(a) * 40 * k) + ' ' + f(y + Math.sin(a) * 40 * k + k * k * 14) + '" stroke="' + col + '" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - k) + '"/>'; } return s; }

  // 0 — driving 36 km over the sea, water on every side
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(250, 360, k), lerp(160, 190, k), lerp(1.35, 1.0, k)]; }, function (u, d, t) {
    var s = sea(t, 200, 0, { gulls: true }) + '<path d="M-400 200 H1100" stroke="#2b6f9f" stroke-width="2" opacity=".5"/>' + viaduct(t, 210, 290, { sp: 220, off: t * 160, lamp: 26 });
    s += carSide(320, 203 + Math.sin(t * 7) * 0.6, t, 0.32, "#c23a26") + waterFront(t, 290);
    return s + tag("36 كم", 470, 70, u, 1.2, 3, 26) + tag("فوق البحر!", 170, 90, u, 2.4, -3, 22, "#bfe0ff");
  });
  // 1 — the Sheikh Jaber causeway, Kuwait: the towers on the shore, the long bridge, the sail pylon
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), 170, lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var s = sea(t, 220, 0, { sky: "dusk", gulls: true }) + sun(560, 150, 26, "#ffd27a") + '<path d="M-400 226 Q-200 210 60 222 L60 400 H-400 Z" fill="' + LAND + '" stroke="#8a7448" stroke-width="2"/>';
    for (var b = 0; b < 8; b++) { var bh = 20 + hash(b) * 50, bx = -330 + b * 40; s += '<rect x="' + bx + '" y="' + f(222 - bh) + '" width="32" height="' + f(bh) + '" fill="#c9bfa8" stroke="' + INK + '" stroke-width="1.2"/>'; for (var w = 0; w < bh - 10; w += 10) s += '<rect x="' + (bx + 6) + '" y="' + f(226 - bh + w) + '" width="20" height="4" fill="' + (hash(b * 9 + w + Math.floor(t)) > 0.5 ? "#ffe9a0" : "#8fb6cf") + '"/>'; }
    s += kuwaitTowers(-60, 224, 0.75) + viaduct(t, 236, 262, { sp: 70, th: 8, lamp: 12, traffic: 40 }) + pylon(420, 236, 262, 120, 1, t) + stays(420, 236, 120, 1) + waterFront(t, 262, 0.35);
    return s + tag("جسر الشيخ جابر", 330, 70, u, 0.6, -2, 24) + tag("الكويت", 0, 120, u, 1.8, 3, 20, "#bfe0ff");
  });
  // 2 — how do you build a bridge this long in the middle of the sea?
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), 190, lerp(1.1, 1.22, k)]; }, function (u, d, t) {
    var s = sea(t, 170, 0, { gulls: true });
    for (var i = 0; i < 7; i++) { var px = 120 + i * 80, h = 40 + i * 4; s += '<rect x="' + (px - 7) + '" y="' + (170 - h) + '" width="14" height="' + (h + 6) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.4"/>'; }
    s += waterFront(t, 170, 0.3) + '<path d="M-400 290 Q100 270 330 296 T1100 290 V600 H-400 Z" fill="' + SAND + '" stroke="#8a7448" stroke-width="2"/>' + hardHat(250, 230, 0.42, t, "curious", { look: 1 });
    return s + qmark(380, 90, t, 50) + qmark(470, 60, t, 36) + tag("في وسط البحر؟", 480, 250, u, 1.0, 3, 22, "#f2a0a0");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) { return sea(t, 230, 0, { sky: "sunset" }) + sun(470, 220, 30, "#ffd27a") + viaduct(t, 250, 280, { sp: 80, th: 10, lamp: 14, traffic: 60, off: t * 10 }) + pylon(200, 250, 280, 140, 1, t) + stays(200, 250, 140, 1) + waterFront(t, 280, 0.35) + tag("ما الحكاية؟", 330, 100, u, 0.1, -2, 34, "#f2c230"); });
  // 4 — the map: across Kuwait Bay, from the capital to Subiya in the north
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(250, 380, k), lerp(230, 160, k), lerp(1.35, 1.0, k)]; }, function (u, d, t) {
    var bk = clamp((u - 0.4) / (d - 0.5)); return bayMap(t, { bridge: bk }) + dot(bridgeAt(bk), "#c23a26", t) + tag("جون الكويت", 140, 170, u, 0.3, -3, 20, "#bfe0ff") + tag("العاصمة", 268, 330, u, 0.8, 2, 18) + tag("الصبيّة", 430, 50, u, 2.4, -2, 18, "#bfe8c0");
  });
  // 5 — the drive round the bay took over an hour; now under half an hour
  shot(5, function (u, d) { return [300, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / (d - 0.6)), s = bayMap(t, { route: 1, bridge: 1 });
    s += dot(routeAt(Math.min(1, k * 0.95)), "#e2b035", t) + dot(bridgeAt(Math.min(1, k * 2.2)), "#c23a26", t);
    s += clock(80, 40, 28, t, 6, "#8a5a2a") + clock(560, 230, 28, t, 3);
    return s + tag("أكثر من ساعة", 90, 100, u, 0.6, -3, 17, "#e8c48e") + tag("أقل من نصف ساعة", 520, 290, u, 1.6, 3, 17, "#f2a0a0");
  });
  // 6 — work starts at the end of 2013, led by Hyundai: barges, cranes, the first spans going out to sea
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(230, 400, k), lerp(200, 160, k), lerp(1.35, 1.0, k)]; }, function (u, d, t) {
    var s = sea(t, 230, 0, { gulls: true }) + cargoShip(700 - u * 60, 236, t, 0.3), reach = 110 + 70 * Math.min(7, Math.floor(u / 0.6)) + 70 * ease(clamp((u % 0.6) / 0.3));
    for (var x = 110; x < reach; x += 70) s += '<rect x="' + (x - 6) + '" y="216" width="12" height="20" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<rect x="-400" y="208" width="' + f(reach + 380 - 70) + '" height="9" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += barge(reach + 60, 228, 120, t) + '<path d="M' + f(reach + 40) + ' 228 L' + f(reach + 20) + ' 130 L' + f(reach - 30) + ' 160" stroke="#e2b035" stroke-width="5" fill="none"/><path d="M' + f(reach - 30) + ' 160 L' + f(reach - 30 + Math.sin(t * 2.4) * 14) + ' ' + f(196 + Math.sin(t * 3) * 6) + '" stroke="#2b2e33" stroke-width="1.6"/>' + span(reach - 30 + Math.sin(t * 2.4) * 14, 198 + Math.sin(t * 3) * 6, 60, 8);
    s += barge(560 - (u * 40) % 200, 240, 90, t, "#7a2a20") + waterFront(t, 230, 0.3) + birds(t, 120, 110) + '<path d="M-400 222 H60 L100 400 H-400 Z" fill="' + SAND + '" stroke="#8a7448" stroke-width="2"/>' + hardHat(70, 180, 0.3, t, "happy", { point: true });
    return s + tag("2013", 150, 60, u, 0.5, -3, 30) + tag("هيونداي", 500, 120, u, 2.4, 3, 20, "#bfe0ff");
  });
  // 7 — first question: how do the piers stand on the seabed?
  shot(7, function (u, d) { var k = clamp(u / d); return [320, lerp(130, 250, ease(k)), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = sea(t, 100, 0.2) + viaduct(t, 60, 100, { sp: 260, th: 14, off: 60, noPiers: true }) + fish(t, 170, 30, 3);
    [60, 320, 580].forEach(function (x) { s += '<rect x="' + (x - 8) + '" y="74" width="16" height="256" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/>'; });
    s += '' + seabed(t, 330) + '<rect x="-400" y="345" width="1500" height="300" fill="#c9b07a"/>';
    return s + qmark(320, 380, t, 54) + tag("قاع البحر", 470, 300, u, 1.2, 3, 20);
  });
  // 8 — under every pier: more columns buried in the seabed, the piles
  shot(8, function (u, d) { var k = clamp(u / d); return [320, lerp(170, 230, k), lerp(1.0, 0.92, k)]; }, function (u, d, t) {
    var s = sea(t, 30, 0.3) + fish(t, 90, 26, 2) + soil(t, 200, { dense: 170 }), g = clamp((u - 0.6) / 1.8);
    s += '<rect x="308" y="-40" width="24" height="200" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.8"/><rect x="250" y="160" width="140" height="40" fill="url(#gWet)" stroke="' + INK + '" stroke-width="2"/>';
    [270, 320, 370].forEach(function (x, i) { s += pileCol(x, 200, 200 + 190 * clamp(g * 1.3 - i * 0.15), 16, true); });
    return s + tag("الخوازيق", 500, 300, u, 1.6, 3, 24) + arrow(450, 300, 385, 300, "#f2c230", 4, clamp((u - 2) * 2));
  });
  // 9 — drill a deep hole in the seabed, then fill it with steel and concrete
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(280, 340, k), lerp(150, 220, k), lerp(1.05, 0.95, k)]; }, function (u, d, t) {
    var dg = clamp(u / 1.8), cg = clamp((u - 1.8) / 1.0), pr = clamp((u - 2.9) / 1.4);
    var s = sea(t, 120, 0.15, { gulls: true }) + fish(t, 180, 24, 2) + soil(t, 240, { dense: 120 });
    s += rig(320, 120, 240, t, { depth: 150 * dg, auger: dg < 1, cage: dg >= 1 ? cg : null, pour: pr }) + barge(120, 122, 110, t, "#7a2a20");
    if (pr > 0) s += '<path d="M120 116 C180 60 250 70 312 96" stroke="#5a6068" stroke-width="5" fill="none"/>';
    s += waterFront(t, 120, 0.25);
    return s + tag("حفر", 480, 200, u, 0.3, 3, 20) + tag("حديد", 480, 280, u, 1.9, -3, 20, "#e8c48e") + tag("خرسانة", 480, 350, u, 3.0, 3, 20, "#bfe0ff");
  });
  // 10 — some piles are 60 metres long, down to very dense sand
  shot(10, function (u, d) { var k = clamp(u / d); return [320, lerp(60, 330, k), lerp(1.15, 0.9, k)]; }, function (u, d, t) {
    var s = sea(t, 20, 0.3) + fish(t, 60, 60, 4) + soil(t, 110, { dense: 270 }) + bubbles(t, 450, 100, 8, 0.6, 30, 0);
    s += '<rect x="290" y="-60" width="60" height="150" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.8"/><rect x="250" y="80" width="140" height="30" fill="url(#gWet)" stroke="' + INK + '" stroke-width="2"/>' + pileCol(320, 110, 420, 20, true);
    s += '<path d="M200 110 V420" stroke="#f4f1e8" stroke-width="3"/>'; for (var m = 0; m <= 6; m++) s += '<path d="M192 ' + f(110 + m * 310 / 6) + ' h16" stroke="#f4f1e8" stroke-width="3"/><text x="180" y="' + f(114 + m * 310 / 6) + '" text-anchor="end" style="font:700 11px Noto Sans Arabic;fill:#fff">' + (m * 10) + '</text>';
    s += hardHat(380, 50 + Math.sin(t * 2) * 2, 0.22, t, "shock");
    return s + tag("60 م", 430, 260, u, 1.2, 3, 26) + tag("رمل متماسك", 470, 410, u, 2.4, -3, 20, "#e8c48e");
  });
  // 11 — in the main part of the causeway alone, more than 1,500 piles
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(360, 330, k), lerp(190, 180, k), lerp(1.3, 1.0, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.2) / (d - 0.8)), n = Math.floor(1510 * ease(k));
    return bayMap(t, { piles: ease(k) }) + dot(bridgeAt((u * 0.35) % 1), "#c23a26", t) + dot(routeAt((u * 0.2) % 1), "#e2b035", t) + '<g transform="translate(140 60)"><rect x="-90" y="-30" width="180" height="56" rx="12" fill="#1c1c1c" opacity=".8"/><text x="0" y="12" text-anchor="middle" style="font:900 34px Noto Sans Arabic;fill:#f2c230">' + n + '</text></g>' + tag("خازوق!", 140, 120, u, d - 1.2, -3, 20);
  });
  // 12 — on the piles sits a huge base, under the water: how do you pour concrete there?
  shot(12, function (u, d) { return [320, lerp(170, 200, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = sea(t, 60, 0.2) + fish(t, 120, 30, 3) + soil(t, 260, { dense: 140 });
    [240, 320, 400].forEach(function (x) { s += pileCol(x, 200, 400, 18, true); });
    s += '<rect x="200" y="196" width="240" height="20" fill="#bdb8ad" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 6" opacity="' + f(0.5 + 0.4 * Math.sin(t * 4)) + '"/>' + bubbles(t, 320, 200, 8, 0.4, 80, 70);
    return s + qmark(320, 150, t, 54) + tag("تحت الماء!", 500, 120, u, 1.0, 3, 22, "#bfe0ff");
  });
  // 13 — they lowered hollow precast shells and pumped the water out until the inside was dry
  shot(13, function (u, d) { var k = clamp(u / d); return [320, lerp(150, 190, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var lw = clamp(u / 2.0), pm = clamp((u - 2.2) / (d - 2.6)), yW = 110, top = lerp(-60, 96, ease(lw));
    var s = sea(t, yW, 0.15) + soil(t, 300, { dense: 120 });
    [250, 320, 390].forEach(function (x) { s += pileCol(x, 240, 420, 18, true); });
    s += shell(320, top, 220, 190, yW, lw < 1 ? 1 : 1 - pm, t);
    [250, 320, 390].forEach(function (x) { if (top + 190 > 240) s += pileCol(x, 240, Math.min(top + 182, 286), 18, true); });
    s += sheerleg(-10, yW, t, 40, top - 30, 250) + '<path d="M' + f(boomTip(-10, yW, 40, 250)[0]) + ' ' + f(top - 26) + ' L' + 230 + ' ' + f(top) + ' M' + f(boomTip(-10, yW, 40, 250)[0]) + ' ' + f(top - 26) + ' L' + 410 + ' ' + f(top) + '" stroke="#2b2e33" stroke-width="1.4"/>';
    if (pm > 0) { s += '<path d="M410 ' + f(top + 20) + ' C470 ' + f(top) + ' 500 70 540 ' + (yW - 6) + '" stroke="#2b2e33" stroke-width="5" fill="none"/>'; for (var j = 0; j < 8; j++) { var q = (t * 1.6 + j / 8) % 1; s += '<circle cx="' + f(540 + q * 40) + '" cy="' + f(yW - 6 - Math.sin(q * Math.PI) * 26) + '" r="3" fill="#bfe6f7"/>'; } }
    s += waterFront(t, yW, 0.18);
    return s + tag("قالب مجوّف", 520, 40, u, 0.6, 3, 18) + tag("جاف!", 320, 330, u, d - 1.0, -3, 26, "#e8c48e");
  });
  // 14 — they poured the base in the dry, below sea level
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), 200, lerp(1.15, 1.05, k)]; }, function (u, d, t) {
    var yW = 110, pr = clamp((u - 0.4) / (d - 1)), s = sea(t, yW, 0.15) + fish(t, 160, 30, 2) + soil(t, 300, { dense: 120 }) + shell(320, 96, 220, 190, yW, 0, t);
    [250, 320, 390].forEach(function (x) { s += pileCol(x, 240, 420, 18, true); });
    s += '<rect x="218" y="' + f(278 - 60 * pr) + '" width="204" height="' + f(60 * pr) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M330 -40 V' + f(270 - 60 * pr) + '" stroke="#5a6068" stroke-width="8"/>'; for (var j = 0; j < 5; j++) { var q = (t * 2 + j / 5) % 1; s += '<circle cx="' + f(330 + Math.sin(j) * 4) + '" cy="' + f(lerp(200, 272 - 60 * pr, q)) + '" r="4" fill="#a7a198"/>'; }
    s += hardHat(260, 250 - 60 * pr, 0.2, t, "happy") + hardHat(390, 250 - 60 * pr, 0.2, t, "n", { look: -1 }) + '<path d="M-400 ' + yW + ' H1100" stroke="#fff" stroke-width="2.4" stroke-dasharray="10 8"/>';
    return s + tag("مستوى البحر", 520, 80, u, 0.6, 3, 18, "#bfe0ff") + tag("في الجفاف", 140, 220, u, 1.6, -3, 20);
  });
  // 15 — then the piers rose on the bases, a long row out into the sea
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(200, 170, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = sea(t, 150, 0, { gulls: true }), hz = 150;
    for (var i = 11; i >= 0; i--) { var sc = 1 / (1 + i * 0.32), x = lerp(560, 70, sc) + (1 - sc) * 0, base = hz + 170 * sc, g = clamp((u - i * 0.18) / 0.6), h = 150 * sc * ease(g);
      s += '<rect x="' + f(x - 22 * sc) + '" y="' + f(base - 6 * sc) + '" width="' + f(44 * sc) + '" height="' + f(12 * sc) + '" fill="url(#gWet)" stroke="' + INK + '" stroke-width="1.2"/>';
      if (h > 1) s += '<rect x="' + f(x - 8 * sc) + '" y="' + f(base - h) + '" width="' + f(16 * sc) + '" height="' + f(h) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + f(x - 20 * sc) + '" y="' + f(base - h) + '" width="' + f(40 * sc) + '" height="' + f(7 * sc) + '" fill="#bdb8ad" stroke="' + INK + '" stroke-width="1"/>'; }
    return s + waves(t, 330) + tag("صفّ طويل", 480, 80, u, 1.4, 3, 22);
  });
  // 16 — the deck itself was made on land
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(240, 380, k), 180, lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var s = sea(t, 250, 0, { gulls: true }) + '<path d="M-400 230 H460 L520 300 H-400 Z" fill="' + SAND + '" stroke="#8a7448" stroke-width="2"/>';
    s += '<path d="M-120 230 V130 L0 90 L120 130 V230 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/><path d="M-120 130 L0 90 L120 130" stroke="#8a929c" stroke-width="6" fill="none"/><rect x="-60" y="160" width="120" height="70" fill="#3a3d42"/>';
    for (var r = 0; r < 3; r++) s += span(260 + r * 20, 200 + r * 12, 170, 16, { lugs: true });
    var gx = 260 + Math.sin(t * 0.8) * 80; s += '<path d="M' + f(gx - 100) + ' 236 V120 H' + f(gx + 100) + ' V236" stroke="#e2b035" stroke-width="8" fill="none"/><path d="M' + f(gx) + ' 120 V' + f(160 + Math.sin(t * 2) * 10) + '" stroke="#2b2e33" stroke-width="2"/><rect x="' + f(gx - 10) + '" y="114" width="20" height="10" fill="#c23a26" stroke="' + INK + '"/>';
    s += hardHat(150, 210, 0.16, t, "happy") + hardHat(420, 216, 0.16, t, "n");
    return s + tag("على اليابسة", 330, 60, u, 0.8, -3, 24);
  });
  // 17 — in a yard on the shore, everything between two piers was cast as one piece, up to 60 m long
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), lerp(210, 170, k), lerp(1.3, 1.0, k)]; }, function (u, d, t) {
    var fr = clamp((u - 0.4) / (d - 0.6)), s = '<rect x="-400" y="-300" width="1500" height="960" fill="#e9dcc0"/>' + clouds(t, 20, -40, 3, 0.6) + '<rect x="-400" y="250" width="1500" height="300" fill="' + SAND + '"/>';
    s += '<rect x="80" y="190" width="480" height="60" fill="none" stroke="#7a5a3a" stroke-width="4"/>' + span(320, 196, 470, 50, { fresh: fr, lugs: fr >= 1 });
    for (var b = 0; b < 16; b++) s += '<path d="M' + (96 + b * 30) + ' 196 v-' + f(10 * (1 - fr)) + '" stroke="#c4652a" stroke-width="2"/>';
    s += '<path d="M' + f(80 + 480 * fr) + ' 120 L' + f(80 + 480 * fr + Math.sin(t * 3) * 10) + ' 190" stroke="#5a6068" stroke-width="7"/>' + bubbles(t, 80 + 480 * fr, 190, 6, 1.2, 14, 150) + hardHat(60, 220, 0.2, t, "happy", { point: true }) + hardHat(590, 220, 0.2, t, "shock", { look: -1 });
    s += arrow(320, 290, 80, 290, "#f2c230", 4, clamp((u - 1.5) * 2)) + arrow(320, 290, 560, 290, "#f2c230", 4, clamp((u - 1.5) * 2));
    return s + tag("قطعة واحدة", 320, 90, u, 0.6, -3, 22) + tag("60 م", 320, 330, u, 2.0, 3, 24, "#e8c48e");
  });
  // 18 — one piece weighs about 1,800 tonnes, more than a thousand cars
  shot(18, function (u, d) { return [320, 190, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / (d - 1.2)), tilt = lerp(-8, 0, ease(k)) + Math.sin(t * 3) * 0.6;
    var s = '<rect x="-400" y="-300" width="1500" height="960" fill="#2a3442"/>' + '<path d="M300 330 L320 230 L340 330 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<g transform="rotate(' + f(tilt) + ' 320 230)"><path d="M60 230 H580" stroke="#c9ced4" stroke-width="10"/><path d="M60 230 H580" stroke="' + INK + '" stroke-width="1"/>' + span(160, 196, 200, 32);
    var n = Math.floor(28 * ease(k)); for (var c = 0; c < n; c++) { var cx = 440 + (c % 7) * 22 - 66, cy = 222 - Math.floor(c / 7) * 12; s += '<rect x="' + cx + '" y="' + cy + '" width="20" height="10" rx="3" fill="' + ["#c23a26", "#f4f1e8", "#2f6f9f", "#e2b035"][c % 4] + '" stroke="' + INK + '"/>'; }
    s += '</g>';
    return s + tag("1800 طن", 160, 120, u, 0.5, -3, 26) + tag("أكثر من 1000 سيارة", 470, 110, u, 2.0, 3, 19, "#f2a0a0");
  });
  // 19 — shipped out by sea, a giant floating crane lifted each piece and set it on two piers in one go
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(250, 320, k), lerp(170, 185, k), lerp(1.08, 0.98, k)]; }, function (u, d, t) {
    var yW = 250, lf = ease(clamp((u - 0.5) / 1.6)), sw = ease(clamp((u - 2.2) / 1.8)), dn = ease(clamp((u - 4.1) / 1.2)), a = lerp(64, 52, sw);
    var tp = boomTip(40, yW, a, 260), gy = dn > 0 ? lerp(140, 176, dn) : lerp(230, 140, lf), s = sea(t, yW, 0, { gulls: true });
    [0, 180, 360, 540].forEach(function (px) { s += '<rect x="' + (px - 8) + '" y="198" width="16" height="' + (yW - 196) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (px - 20) + '" y="198" width="40" height="7" fill="#bdb8ad" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + (px - 22) + '" y="' + (yW - 4) + '" width="44" height="12" rx="2" fill="url(#gWet)" stroke="' + INK + '" stroke-width="1.4"/>'; });
    s += '<rect x="-400" y="176" width="580" height="22" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/><path d="M-400 171 H180" stroke="#5a6068" stroke-width="2"/>'; for (var lx = -340; lx < 180; lx += 90) s += lampPost(lx, 172, 22);
    s += barge(lerp(224, 200, sw), yW + 2, 200, t, "#7a2a20") + sheerleg(40, yW, t, a, gy - 46, 260) + slings(tp[0], gy - 46, tp[0], gy, 170) + span(tp[0], gy, 172, 22, { lugs: true });
    s += waterFront(t, yW, 0.3);
    return s + tag("رافعة عائمة", 100, 60, u, 0.8, -3, 22) + tag("دفعة واحدة!", 470, 80, u, 4.4, 3, 22, "#f2a0a0");
  });
  // 20 — at the shipping channel a sail-shaped tower rises, 151 metres tall
  shot(20, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(220, 120, k), lerp(1.0, 0.82, k)]; }, function (u, d, t) {
    var g = ease(clamp((u - 0.3) / 2.4)), s = sea(t, 300, 0, { gulls: true }) + viaduct(t, 262, 300, { sp: 150, th: 14, off: 30 }) + pylon(320, 262, 300, 300, g, t) + stays(320, 262, 300, clamp((u - 2.6) / 1.4)) + waterFront(t, 300, 0.3);
    s += dhow(80, 300, t, 0.7);
    return s + tag("شراع", 80, 200, u, 1.4, -3, 20, "#e8c48e") + tag("151 م", 500, 40, u, 2.8, 3, 26);
  });
  // 21 — its steel cables carry the deck and leave a 120 m wide channel for ships underneath
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 170, lerp(0.95, 1.02, k)]; }, function (u, d, t) {
    var s = sea(t, 300, 0, { sky: "dusk", gulls: true }), yD = 220;
    s += cargoShip(((t * 34) % 1300) - 400, 300, t, 0.55) + viaduct(t, yD, 300, { sp: 300, th: 14, off: 0, lamp: 20, traffic: 50 }) + pylon(200, yD, 300, 230, 1, t) + stays(200, yD, 230, 1) + waterFront(t, 300, 0.3);
    s += arrow(350, 270, 218, 270, "#f2c230", 3, clamp((u - 1.4) * 2)) + arrow(350, 270, 482, 270, "#f2c230", 3, clamp((u - 1.4) * 2));
    return s + tag("كابلات فولاذية", 420, 90, u, 0.4, 3, 20) + tag("120 م", 350, 320, u, 1.8, 3, 24, "#bfe0ff");
  });
  // 22 — along it, two artificial sand islands that serve the bridge
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(190, 170, k), lerp(1.0, 1.22, k)]; }, function (u, d, t) { return bayMap(t, { bridge: 1, islands: (u - 0.6) * 1.3 }) + tag("جزيرتان صناعيتان", 170, 60, u, 0.4, -3, 20, "#e8c48e"); });
  // 23 — opened in May 2019, at a cost of about 3 billion dollars
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 170, lerp(1.08, 1.0, k)]; }, function (u, d, t) {
    var s = sea(t, 250, 0, { sky: "night" }) + stars(t) + firework(140, 60, t, 0, "#f2c230") + firework(480, 50, t, 0.4, "#f2a0a0") + firework(330, 30, t, 0.7, "#7cf29a");
    s += viaduct(t, 210, 250, { sp: 90, th: 12, night: true, lamp: 18, traffic: 70 }) + pylon(320, 210, 250, 150, 1, t) + stays(320, 210, 150, 1) + waterFront(t, 250, 0.35);
    return s + tag("مايو 2019", 140, 150, u, 0.4, -3, 24) + tag("3 مليارات دولار", 500, 150, u, 1.8, 3, 20, "#bfe8c0");
  });
  // 24 — payoff: every car crossing the sea rides on giant pieces set on piles buried in the seabed
  shot(24, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(140, 230, k), lerp(1.15, 0.88, k)]; }, function (u, d, t) {
    var s = sea(t, 140, 0.15, { gulls: true }) + fish(t, 220, 26, 2) + soil(t, 300, { dense: 110 });
    s += viaduct(t, 80, 140, { sp: 260, th: 22, off: 60, noPiers: true }) + carSide(((t * 70) % 900) - 150, 75, t, 0.22, "#c23a26");
    [60, 320, 580].forEach(function (px) { s += '<rect x="' + (px - 8) + '" y="102" width="16" height="140" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (px - 70) + '" y="236" width="140" height="30" fill="url(#gWet)" stroke="' + INK + '" stroke-width="2"/>';
      [-50, 0, 50].forEach(function (dx) { s += pileCol(px + dx, 266, 470, 16, true); }); });
    s += waterFront(t, 140, 0.15);
    return s + tag("قطع عملاقة", 160, 30, u, 0.5, -3, 20) + tag("قاعدة", 500, 250, u, 2.2, 3, 18, "#bfe0ff") + tag("خوازيق", 480, 400, u, 3.6, -3, 22, "#e8c48e");
  });
  // 25 — outro
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(190, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) { return sea(t, 240, 0, { sky: "sunset", gulls: true }) + sun(480, 230, 34, "#ffd27a") + viaduct(t, 220, 240 + 0, { sp: 80, th: 10, lamp: 14, traffic: 60, night: true }) + pylon(200, 220, 240, 150, 1, t) + stays(200, 220, 150, 1) + waterFront(t, 240, 0.35) + tag("أخبرونا!", 470, 80, u, 0.4, 3, 26); });

  window.__parts = { viaduct: viaduct, pylon: pylon, stays: stays, kuwaitTowers: kuwaitTowers, span: span, sheerleg: sheerleg, slings: slings, boomTip: boomTip, soil: soil, pileCol: pileCol, waterFront: waterFront, sea: sea, sun: sun, tag: tag, hardHat: hardHat, barge: barge, cargoShip: cargoShip, dhow: dhow, carSide: carSide };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
