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

  // ── new pieces for this episode (shapes from NASA / Smithsonian photos, see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function person(x, y, t, mood, o) {   // a ball-head person, o: {s, col, look, up (looking up), hands}
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 1.5) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#c23a26") + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, o.up ? -24 : -20, 38, mood, t, o.look || 0);
    if (o.hands) s += '<path d="M-34 50 Q-70 20 -60 -10" stroke="' + (o.col || "#c23a26") + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="-60" cy="-12" r="9" fill="#e0b48a" stroke="' + INK + '" stroke-width="2.4"/><path d="M34 50 Q70 20 60 -10" stroke="' + (o.col || "#c23a26") + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="60" cy="-12" r="9" fill="#e0b48a" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>'; }
  function boomFx(x, y, u, sz, txt) {   // a jagged burst that punches in and rings out
    var k = pop(u / 0.5); if (k <= 0) return ""; var r = sz * k, d = "";
    for (var i = 0; i < 18; i++) { var a = i / 18 * 6.283, rr = r * (i % 2 ? 0.62 : 1); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr * 0.8); }
    var ring = clamp(u / 1.4), s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(sz * (0.6 + ring * 2.2)) + '" fill="none" stroke="#fff" stroke-width="' + f(5 * (1 - ring)) + '" opacity="' + f(1 - ring) + '"/>';
    return s + '<path d="' + d + ' Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/><text x="' + f(x) + '" y="' + f(y + sz * 0.22 * k) + '" text-anchor="middle" style="font:900 ' + f(sz * 0.62 * k) + 'px Noto Sans Arabic;fill:' + RED + ';stroke:' + INK + ';stroke-width:1.5;paint-order:stroke">' + (txt || "بوم!") + '</text>';
  }
  // pressure rings left behind by a moving source: emitted every `per` s, centre stays where it was emitted
  function waves(px, py, t, M, c, n, col, per) {
    var s = "", per2 = per || 0.32, ph = (t / per2) % 1;
    for (var k = 0; k < n; k++) { var tau = (k + ph) * per2, r = c * tau, cx = px - M * c * tau, op = clamp(1 - k / n) * 0.9; if (r < 2) continue;
      s += '<circle cx="' + f(cx) + '" cy="' + f(py) + '" r="' + f(r) + '" fill="none" stroke="' + (col || "#fff") + '" stroke-width="2.4" opacity="' + f(op) + '"/>'; }
    return s;
  }
  // the Mach cone: two shock lines trailing back from (px,py) at angle asin(1/M)
  function cone(px, py, M, len, col, w, op) {
    var mu = Math.asin(1 / Math.max(1.001, M)), dx = Math.cos(mu) * len, dy = Math.sin(mu) * len;
    return '<path d="M' + f(px - dx) + ' ' + f(py - dy) + ' L' + f(px) + ' ' + f(py) + ' L' + f(px - dx) + ' ' + f(py + dy) + '" fill="none" stroke="' + (col || "#fff") + '" stroke-width="' + (w || 4) + '" stroke-linejoin="round" opacity="' + (op == null ? 0.95 : op) + '"/>';
  }
  function speedLines(t, x0, x1, y0, y1, n, col) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 2.4 + hash(i) ) % 1, y = lerp(y0, y1, hash(i + 3)), x = lerp(x1, x0, u); s += '<path d="M' + f(x) + ' ' + f(y) + ' h' + f(60 + hash(i) * 60) + '" stroke="' + (col || "#fff") + '" stroke-width="2" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.8) + '"/>'; } return s; }

  // a modern fighter seen from the side, nose to the right (F-16 / F-15 layout: radome + pitot, bubble canopy,
  // chin intake, swept wing and fin, petal nozzle). o: {s, rot, ab 0..1 (afterburner), fire 0..1, vapor 0..1, pilot mood, shake}
  function jet(x, y, t, o) {
    o = o || {}; var sh = o.shake ? (hash(Math.floor(t * 30)) - 0.5) * o.shake : 0, s = '<g transform="translate(' + f(x + sh) + ' ' + f(y + sh * 0.7) + ') rotate(' + f(o.rot || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.ab || o.fire) { var ab = clamp(o.ab || 0), fl = 40 + 30 * clamp(o.fire || 0) + 150 * ab + 8 * Math.sin(t * 40);
      s += '<path d="M-140 -9 C-170 -10 ' + f(-140 - fl * 0.7) + ' -6 ' + f(-140 - fl) + ' 0 C' + f(-140 - fl * 0.7) + ' 6 -170 10 -140 9 Z" fill="url(#' + (ab > 0.1 ? "gAB" : "gFlame") + ')" filter="url(#soft2)"/>';
      if (ab > 0.3) for (var dd = 0; dd < 5; dd++) { var dx = -150 - dd * 26 - (t * 6 % 1) * 2; s += '<ellipse cx="' + f(dx) + '" cy="0" rx="' + f(7 - dd * 0.7) + '" ry="' + f(5 - dd * 0.6) + '" fill="#fff' + '" opacity="' + f((ab - 0.3) * (0.9 - dd * 0.15)) + '"/>'; } }
    s += '<path d="M-96 6 L-136 15 L-140 10 L-118 4 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/>';                       // far stabiliser
    s += '<path d="M150 -1 L132 0" stroke="' + INK + '" stroke-width="2"/>';                                                                  // pitot
    s += '<path d="M132 0 C104 -6 78 -13 46 -15 L-82 -15 L-118 -10 L-130 -8 L-130 8 L-104 12 L30 12 C70 11 104 6 132 0 Z" fill="url(#gJet)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M132 0 C116 -3 104 -6 96 -8 L96 7 C106 5 118 3 132 0 Z" fill="#5f6872" opacity=".8"/>';                                // radome
    s += '<path d="M40 12 L26 24 L-16 24 L-16 12 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/><path d="M38 14 L28 22" stroke="#111" stroke-width="3"/>';   // chin intake
    s += '<path d="M-70 -15 L-108 -66 L-124 -66 L-118 -15 Z" fill="url(#gJet)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-108 -60 L-122 -60" stroke="#5f6872" stroke-width="3"/>';   // fin
    s += '<path d="M10 4 L-60 4 L-96 30 L-70 32 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-60 6 L-92 28" stroke="#b9c2cb" stroke-width="1.4"/>';   // near wing
    s += '<path d="M-100 8 L-140 22 L-126 8 Z" fill="url(#gJet)" stroke="' + INK + '" stroke-width="2"/>';                              // near stabiliser
    s += '<rect x="-144" y="-10" width="16" height="20" rx="3" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/><path d="M-140 -10 V10 M-136 -10 V10 M-132 -10 V10" stroke="#6a727c" stroke-width="1.2"/>';   // nozzle petals
    s += '<path d="M76 -13 C66 -34 30 -36 4 -15 Z" fill="url(#gCanopy)" stroke="' + INK + '" stroke-width="2.2"/><path d="M60 -26 C50 -31 34 -31 26 -26" stroke="#fff" stroke-width="2" opacity=".7" fill="none"/>';
    s += '<g transform="translate(40 -20) scale(.34)"><path d="M-30 -10 C-30 -42 30 -42 30 -10" fill="#3a3f46" stroke="' + INK + '" stroke-width="3"/>' + head(0, 0, 22, o.mood || "n", t, 1) + '</g>';
    s += '<path d="M-20 -6 h60 M-60 2 h40" stroke="#6a727c" stroke-width="1" opacity=".6"/><circle cx="-40" cy="-4" r="5" fill="none" stroke="#2f4a6a" stroke-width="1.4" opacity=".8"/>';
    if (o.vapor) { var v = clamp(o.vapor); s += '<g filter="url(#soft2)" opacity="' + f(0.85 * v) + '"><path d="M20 -44 C-10 -40 -40 -20 -50 0 C-40 20 -10 40 20 44 C0 30 -16 14 -18 0 C-16 -14 0 -30 20 -44 Z" fill="#fff"/></g>'; }
    return s + '</g>';
  }
  // the same kind of fighter from above, nose to the right (F-15 plan: square intakes, trapezoid wings, twin fins, twin nozzles)
  function jetTop(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.ab) for (var n = -1; n <= 1; n += 2) s += '<path d="M-120 ' + (n * 9 - 6) + ' L' + f(-190 - 10 * Math.sin(t * 40)) + ' ' + (n * 9) + ' L-120 ' + (n * 9 + 6) + ' Z" fill="url(#gAB)" filter="url(#soft2)"/>';
    s += '<path d="M60 -12 L-10 -14 L-60 -100 L-82 -100 L-70 -16 L-96 -18 L-128 -52 L-140 -50 L-118 -14 L-118 14 L-140 50 L-128 52 L-96 18 L-70 16 L-82 100 L-60 100 L-10 14 L60 12 Z" fill="url(#gJet)" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<path d="M150 0 L128 0" stroke="' + INK + '" stroke-width="2"/><path d="M128 0 C104 -6 80 -12 50 -13 L-120 -12 L-120 12 L50 13 C80 12 104 6 128 0 Z" fill="url(#gJet)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M40 -13 L20 -26 L-30 -26 L-30 -13 Z M40 13 L20 26 L-30 26 L-30 13 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-74 -24 L-112 -30 L-118 -24 L-90 -18 Z M-74 24 L-112 30 L-118 24 L-90 18 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/>';   // twin fins seen from above
    s += '<ellipse cx="62" cy="0" rx="26" ry="7" fill="url(#gCanopy)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="-128" y="-15" width="10" height="12" rx="2" fill="#3a3f46" stroke="' + INK + '"/><rect x="-128" y="3" width="10" height="12" rx="2" fill="#3a3f46" stroke="' + INK + '"/>';
    return s + '</g>';
  }
  // the Bell X-1 «Glamorous Glennis»: orange bullet body, thin straight wings, stabiliser high on the fin, flush canopy, four rocket nozzles
  function x1(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.fire) { var fl = 50 + 70 * clamp(o.fire) + 10 * Math.sin(t * 45); for (var k = 0; k < 4; k++) { var yy = -9 + (k % 2) * 10 + Math.floor(k / 2) * 2 - 1; s += '<path d="M-108 ' + (yy - 4) + ' L' + f(-108 - fl * (0.85 + 0.15 * hash(k + Math.floor(t * 20)))) + ' ' + yy + ' L-108 ' + (yy + 4) + ' Z" fill="url(#gFlame)" filter="url(#soft2)"/>'; }
      for (var dd = 0; dd < 4; dd++) s += '<ellipse cx="' + f(-124 - dd * 20) + '" cy="-4" rx="5" ry="7" fill="#ffe7a8" opacity="' + f(clamp(o.fire) * (0.7 - dd * 0.15)) + '"/>'; }
    s += '<path d="M-82 -36 L-110 -38 L-106 -32 L-82 -31 Z" fill="url(#gX1)" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<path d="M112 0 C102 -12 72 -22 32 -24 L-80 -22 C-96 -20 -104 -14 -108 -10 L-108 10 C-100 16 -92 19 -80 20 L32 22 C72 20 102 12 112 0 Z" fill="url(#gX1)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M112 0 L128 -1" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-58 -21 L-88 -64 L-104 -64 L-102 -16 Z" fill="url(#gX1)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-84 -42 L-116 -44 L-112 -36 L-84 -35 Z" fill="url(#gX1)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M30 6 L-26 6 L-22 40 L6 40 Z" fill="#d86a1e" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<path d="M66 -18 L50 -22 L36 -22 L36 -16 L62 -14 Z" fill="#2f4a6a" stroke="' + INK + '" stroke-width="1.6"/><path d="M48 -20 V-15" stroke="#9fb8cc" stroke-width="1.2"/>';
    s += '<rect x="-112" y="-14" width="8" height="28" rx="3" fill="#3a3530" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<text x="-30" y="2" text-anchor="middle" style="font:700 9px Noto Serif;fill:#5a2a08;direction:ltr;opacity:.75">Glamorous Glennis</text>';
    s += '<path d="M90 -6 C70 -14 40 -18 10 -19" stroke="#ffd2a8" stroke-width="2.4" fill="none" opacity=".7"/>';
    return s + '</g>';
  }
  // a B-29 Superfortress (silver, glazed round nose, four engines on long straight wings, tall fin) carrying the X-1 under its belly
  function b29(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 -6 L-150 -20 L-150 -12 L-60 6 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/>';   // far wing
    s += '<path d="M210 4 C210 -18 190 -30 160 -30 L-200 -24 L-250 -16 L-260 -4 L-250 6 L150 26 C188 26 210 20 210 4 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M210 4 C210 -18 190 -30 166 -30 L166 22 C190 22 210 16 210 4 Z" fill="#cfe1ec" stroke="' + INK + '" stroke-width="2"/><path d="M186 -24 V20 M200 -16 V16 M172 -4 H210" stroke="#7a8a96" stroke-width="1.2"/>';
    s += '<path d="M-196 -24 L-236 -100 L-262 -100 L-250 -18 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-226 -6 L-300 -2 L-296 6 L-222 6 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M60 0 L-70 0 L-90 60 L20 60 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2.4"/>';   // near wing
    for (var e = 0; e < 2; e++) { var ex = 30 - e * 60, ey = 14 + e * 22, a = t * 50 + e; s += '<path d="M' + (ex + 34) + ' ' + ey + ' L' + (ex - 20) + ' ' + (ey - 2) + ' L' + (ex - 20) + ' ' + (ey + 14) + ' L' + (ex + 34) + ' ' + (ey + 12) + ' Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + (ex + 38) + '" cy="' + (ey + 6) + '" rx="4" ry="' + f(28 * Math.abs(Math.cos(a))) + '" fill="#2a2a2a" opacity=".6"/><ellipse cx="' + (ex + 38) + '" cy="' + (ey + 6) + '" rx="3" ry="28" fill="#2a2a2a" opacity=".12"/>'; }
    s += '<path d="M-110 -10 H120" stroke="#8a929c" stroke-width="1.2"/><circle cx="-160" cy="-10" r="7" fill="#2f4a6a" opacity=".7"/>';
    return s + '</g>';
  }
  // a 1940s propeller fighter (P-51-like) that shakes near the speed of sound
  function propPlane(x, y, t, o) {
    o = o || {}; var sh = (o.shake || 0) * (hash(Math.floor(t * 32)) - 0.5), s = '<g transform="translate(' + f(x + sh) + ' ' + f(y + sh) + ') rotate(' + f((o.rot || 0) + sh * 0.6) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M110 -2 C100 -16 70 -20 40 -20 L-100 -10 L-130 -4 L-130 4 L-100 8 L40 18 C80 16 104 10 110 -2 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M54 -18 C46 -40 10 -40 0 -18 Z" fill="url(#gCanopy)" stroke="' + INK + '" stroke-width="2"/><g transform="translate(26 -26) scale(.32)">' + head(0, 0, 22, o.mood || "worry", t, 1) + '</g>';
    s += '<path d="M-100 -10 L-126 -54 L-140 -54 L-130 -4 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2.2"/><path d="M-112 2 L-150 8 L-146 14 L-110 10 Z" fill="url(#gB29)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M40 4 L-30 4 L-40 34 L20 34 Z" fill="url(#gJetD)" stroke="' + INK + '" stroke-width="2.2"/><path d="M10 18 L-2 30 L18 30 Z" fill="#3a3f46"/>';
    s += '<path d="M112 -8 L124 -2 L112 4 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="124" cy="-2" rx="4" ry="40" fill="#2a2a2a" opacity=".12"/><path d="M124 ' + f(-2 - 38 * Math.cos(t * 60)) + ' L124 ' + f(-2 + 38 * Math.cos(t * 60)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
    return s + '</g>';
  }
  // turbojet with afterburner, cut open, flow left → right: intake, compressor, burners, turbine, afterburner, nozzle
  function engineCut(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', hl = o.hl == null ? -1 : o.hl;
    s += '<path d="M-250 -70 L-160 -62 L-40 -44 L40 -50 L130 -56 L230 -48 L270 -34 L270 34 L230 48 L130 56 L40 50 L-40 44 L-160 62 L-250 70 Z" fill="url(#gCase)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M-244 -62 L-160 -54 L-40 -36 L40 -42 L130 -48 L230 -40 L262 -28 L262 28 L230 40 L130 48 L40 42 L-40 36 L-160 54 L-244 62 Z" fill="#2b2e33"/>';
    var zones = [[-244, -160, "#5aa8d8"], [-160, -40, "#5aa8d8"], [-40, 40, "#ff8a3c"], [40, 110, "#ffb35a"], [110, 230, "#ff6a2a"]];
    if (hl >= 0) { var z = zones[hl]; s += '<rect x="' + z[0] + '" y="-66" width="' + (z[1] - z[0]) + '" height="132" fill="' + YEL + '" opacity="' + f(0.18 + 0.1 * Math.sin(t * 6)) + '"/>'; }
    s += '<path d="M-244 -10 C-220 -24 -196 -22 -180 0 C-196 22 -220 24 -244 10 Z" fill="url(#gCase)" stroke="' + INK + '" stroke-width="2"/>';   // spinner
    for (var k = 0; k < 9; k++) { var cx = -176 + k * 15, h = lerp(54, 36, k / 8), ph = (t * 14 + k * 0.7) % 1; s += '<rect x="' + (cx - 3) + '" y="' + f(-h) + '" width="6" height="' + f(2 * h) + '" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1"/>'; for (var b = 0; b < 4; b++) { var by = -h + ((ph + b / 4) % 1) * 2 * h; s += '<path d="M' + (cx - 5) + ' ' + f(by) + ' l10 5" stroke="#e9ecef" stroke-width="2"/>'; } }
    for (var c = 0; c < 3; c++) { var fx = -30 + c * 24; s += '<path d="M' + fx + ' -30 C' + (fx + 8) + ' ' + f(-14 + 4 * Math.sin(t * 20 + c)) + ' ' + (fx + 8) + ' ' + f(14 + 4 * Math.sin(t * 22 + c)) + ' ' + fx + ' 30" fill="none" stroke="#ff8a3c" stroke-width="5" opacity=".85"/>'; }
    s += '<ellipse cx="0" cy="0" rx="36" ry="' + f(26 + 3 * Math.sin(t * 25)) + '" fill="#ff7a2a" opacity=".45" filter="url(#soft2)"/>';
    for (var k2 = 0; k2 < 3; k2++) { var cx2 = 56 + k2 * 18, ph2 = (t * 16 + k2) % 1; s += '<rect x="' + (cx2 - 3) + '" y="-44" width="6" height="88" fill="#c9a04e" stroke="' + INK + '" stroke-width="1"/>'; for (var b2 = 0; b2 < 4; b2++) s += '<path d="M' + (cx2 - 5) + ' ' + f(-44 + ((ph2 + b2 / 4) % 1) * 88) + ' l10 -5" stroke="#f3dc9e" stroke-width="2"/>'; }
    s += '<path d="M130 -40 V40" stroke="#6a727c" stroke-width="3" stroke-dasharray="3 5"/>';   // afterburner spray bars
    if (o.ab) { var ab = clamp(o.ab); s += '<path d="M134 -38 C190 -30 240 -20 ' + f(262 + 140 * ab) + ' 0 C240 20 190 30 134 38 Z" fill="url(#gAB)" opacity="' + f(0.3 + 0.7 * ab) + '" transform="scale(-1 1) translate(-396 0)"/>'; }
    for (var p = 0; p < 26; p++) {   // the air: tight & blue through the compressor, hot after the burners, fast out of the nozzle
      var pu = (t * 0.45 + hash(p)) % 1, px = lerp(-300, 330, pu), py = (hash(p + 7) - 0.5) * (px < -160 ? 110 : px < 40 ? lerp(100, 60, (px + 160) / 200) : 70), col = px < -30 ? "#bfe6ff" : px < 130 ? "#ffd07a" : "#fff2c8";
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + (px < -30 ? 3 : 3.6) + '" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    return s + '</g>';
  }
  function pressureGraph(x, y, w, h, u, prog, col) {   // the N-wave: sudden rise at the nose, ramp down, sudden snap back at the tail
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-8" y="' + (-h - 10) + '" width="' + (w + 16) + '" height="' + (2 * h + 20) + '" rx="8" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 H' + w + '" stroke="#b9b2a2" stroke-width="1.6"/>';
    var pts = [[0, 0], [0.3, 0], [0.3, -1], [0.7, 1], [0.7, 0], [1, 0]], d = "", p = clamp(prog);
    for (var i = 0; i < pts.length; i++) { var a = pts[i]; if (a[0] > p) { var b = pts[i - 1], k = (p - b[0]) / Math.max(1e-6, a[0] - b[0]); d += " L" + f(p * w) + " " + f(lerp(b[1], a[1], k) * h); break; } d += (i ? " L" : "M") + f(a[0] * w) + " " + f(a[1] * h); }
    return s + '<path d="' + d + '" stroke="' + (col || RED) + '" stroke-width="3.4" fill="none" stroke-linejoin="round"/></g>';
  }
  function house(x, y, s, lit) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-20 0 V-24 L0 -40 L20 -24 V0 Z" fill="#e9d8a8" stroke="' + INK + '" stroke-width="2"/><path d="M-24 -22 L0 -44 L24 -22" fill="none" stroke="' + RED + '" stroke-width="4"/><rect x="-8" y="-18" width="16" height="12" fill="' + (lit ? YEL : "#5d93ad") + '" stroke="' + INK + '" stroke-width="1.4"/></g>'; }
  function desert(t, y) { var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#gDesert)"/>'; for (var i = 0; i < 14; i++) { var x = ((i * 120 - t * 30) % 1440 + 1440) % 1440 - 400; s += '<path d="M' + f(x) + ' ' + f(y + 30 + hash(i) * 50) + ' q30 -10 60 0" stroke="#a8844a" stroke-width="2" fill="none"/>'; } return s + '<path d="M-400 ' + y + ' Q-100 ' + (y - 26) + ' 200 ' + y + ' T800 ' + y + ' T1100 ' + y + '" fill="#c9a56a"/>'; }
  function yeager(x, y, t, mood, o) {   // leather flying helmet + goggles
    o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="#6b5a3a" stroke="' + INK + '" stroke-width="3"/>' + (o.ribs ? '<path d="M-44 70 H44 M-44 88 H44" stroke="#fbfaf6" stroke-width="14"/><path d="M14 64 l8 8 l-8 8 l8 8" stroke="' + RED + '" stroke-width="3" fill="none"/>' : '') + head(0, -20, 38, mood, t, o.look || 0) + '<path d="M-38 -26 C-38 -66 38 -66 38 -26 L38 -16 L-38 -16 Z" fill="#7a5230" stroke="' + INK + '" stroke-width="3"/><rect x="-30" y="-42" width="24" height="14" rx="6" fill="#9fd2e8" stroke="' + INK + '" stroke-width="2.4"/><rect x="6" y="-42" width="24" height="14" rx="6" fill="#9fd2e8" stroke="' + INK + '" stroke-width="2.4"/></g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — a boom in the sky, you look up and the jet is already far away from where the sound seemed to be
  shot(0, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.08, 1.0, u / d)]; }, function (u, d, t) {
    var px = lerp(60, 600, u / d), s = sky("day") + clouds(t, 40, 30, 7, 0.85) + birds(t, 150, 60) + city(t, 290, 80, "#b9a58a", "#f7e7b0", 3, false) + grass(t, 290, "grass-day", "#5a7a3a") + cars(t, 330, 90);
    s += jet(px, 70, t, { s: 0.32, fire: 0.5 }) + speedLines(t, px - 160, px - 60, 62, 78, 5);
    var hit = lerp(-260, 0, clamp(u / 2.8)), mu = Math.asin(1 / 1.4);   // the shock line drags along behind the jet and sweeps the ground
    if (u < 3.4) s += '<path d="M' + f(px - 40) + ' 70 L' + f(px - 40 - 230 / Math.tan(mu)) + ' 300" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" opacity=".7"/>';
    s += person(200, 216, t, u > 2.8 && u < 4.4 ? "shock" : u >= 4.4 ? "curious" : "n", { s: 0.6, up: true, look: u > 4.4 ? 1 : -1, col: "#2f6f9f" });
    if (u > 2.8) s += boomFx(150, 150, u - 2.8, 34);
    return s + tag("الطيارة هنا!", Math.min(560, px), 120, u, 4.2, 3, 16);
  });
  // 1 — how does it fly faster than the sound itself?
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 220, 60, 8, 0.8) + clouds(t, 400, 260, 6, 0.6) + speedLines(t, -100, 740, 40, 330, 18);
    s += jet(330 + Math.sin(t * 2) * 6, 180 + Math.sin(t * 3) * 4, t, { s: 1.15, fire: 1, rot: -2 });
    return s + tag("أسرع من الصوت؟", 320, 310, u, 0.3, -3, 20);
  });
  // 2 — where does the boom come from? does it really break something in the air?
  shot(2, function (u, d) { var k = Math.max(0.25, 1 - u / 1.2); return [320 + 8 * k * Math.sin(u * 37), 180 + 6 * k * Math.cos(u * 29), lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 90, 40, 7, 0.8) + birds(t, 260, 70);
    for (var sh2 = 0; sh2 < 10; sh2++) { var su = (t * 0.7 + sh2 / 10) % 1; if (u > 0.3) s += '<path d="M' + f(300 + hash(sh2) * 50) + ' ' + f(40 + su * 300) + ' l6 10 l-8 2 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - su) + '" transform="rotate(' + f(t * 200 + sh2 * 40) + ' ' + f(303 + hash(sh2) * 50) + ' ' + f(45 + su * 300) + ')"/>'; }
    var cr = clamp((u - 1.4) / 0.6), crack = "M320 -60 L300 10 L340 50 L296 110 L336 170 L304 230 L330 290";
    s += boomFx(320, 160, u, 70 + 4 * Math.sin(t * 9));
    if (cr > 0) s += '<path d="' + crack + '" stroke="' + INK + '" stroke-width="6" fill="none" stroke-dasharray="' + f(500 * cr) + ' 600" stroke-linejoin="bevel"/><path d="' + crack + '" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="' + f(500 * cr) + ' 600"/>';
    return s + qmark(470, 90, t, 60) + qmark(170, 110, t + 1, 44) + tag("بتكسر حاجة؟", 470, 280, u, 1.8, 3, 18);
  });
  // 3 — the brand beat
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + jet(320 + Math.sin(t * 2) * 10, 150, t, { s: 0.9, fire: 0.6, mood: "happy" }) + waves(450, 150, t, 0, 50, 6, "#2f7fd8", 0.4);
    return s + tag("إيه الحكاية؟", 320, 290, u, 0.1, -3, 26);
  });
  // 4 — sound is pressure waves moving through air at about 1200 km/h (air molecules squeezed and spread)
  shot(4, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a" opacity=".1"/>' + person(90, 160, t, "happy", { s: 0.7, hands: Math.sin(t * 10) > 0, col: "#c23a26" });
    for (var r = 0; r < 9; r++) for (var c = 0; c < 26; c++) { var x0 = 150 + c * 18, ph = x0 * 0.05 - t * 7, x = x0 + 7 * Math.sin(ph), y = 70 + r * 22 + hash(r * 30 + c) * 6; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + (Math.cos(ph) > 0.4 ? "#2f7fd8" : "#9fc3df") + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    var km = Math.round(1200 * clamp((u - 1.4) / 1.4)); s += '<g transform="translate(560 300)"><rect x="-80" y="-24" width="160" height="44" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#7cf29a">' + km + ' كم/س</text></g>';
    return s + tag("موجات ضغط", 300, 40, u, 0.5, -3, 18);
  });
  // 5 — a slow plane: its pressure waves run ahead of it and clear the way
  shot(5, function (u, d) { return [lerp(320, 360, u / d), 180, 1.0]; }, function (u, d, t) {
    var px = lerp(300, 380, u / d), s = sky("day") + clouds(t, 20, 290, 5, 0.7) + waves(px + 60, 180, t, 0.45, 70, 10, "#2f7fd8");
    s += jet(px, 180, t, { s: 0.6, fire: 0.4 });
    return s + arrow(px + 120, 120, px + 200, 120, YEL, 6, clamp((u - 1.0) / 0.6)) + tag("الموجات بتسبقها", px + 140, 300, u, 1.0, 3, 17);
  });
  // 6 — closer to the speed of sound the waves can't get ahead any more and pile up at the nose
  shot(6, function (u, d) { return [380, 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var M = lerp(0.45, 0.98, ease(clamp(u / (d * 0.8)))), s = sky("day") + clouds(t, 60 + M * 200, 300, 6, 0.7) + waves(430, 180, t, M, 70, 12, "#2f7fd8");
    s += jet(370, 180, t, { s: 0.6, fire: 0.6, shake: M > 0.85 ? 4 : 0 });
    s += '<g transform="translate(540 60)"><rect x="-60" y="-20" width="120" height="38" rx="8" fill="' + INK + '"/><text y="7" text-anchor="middle" style="font:800 17px Noto Serif;fill:' + YEL + ';direction:ltr">Mach ' + M.toFixed(2) + '</text></g>';
    return s + tag("بتتكوّم قدام البوز", 400, 300, u, 2.6, -3, 17);
  });
  // 7 — the heap of squeezed air is a wall: they called it the sound barrier
  shot(7, function (u, d) { return [360, 180, lerp(1.2, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 240, 300, 6, 0.7) + waves(430, 180, t, 1.0, 70, 12, "#2f7fd8");
    var k = clamp(u / 0.8); s += '<rect x="' + f(440 - 10 * k) + '" y="40" width="' + f(20 * k + 6) + '" height="280" rx="8" fill="#2f7fd8" opacity="' + f(0.35 + 0.15 * Math.sin(t * 8)) + '"/>';
    for (var b = 0; b < 7; b++) s += '<path d="M436 ' + (50 + b * 40) + ' h12" stroke="#fff" stroke-width="3" opacity=".7"/>';
    s += jet(370, 180, t, { s: 0.6, fire: 0.7, shake: 5, mood: "worry" });
    return s + tag("حاجز الصوت", 330, 70, u, 0.6, 3, 22, "#ffb08a");
  });
  // 8 — planes used to shake hard and lose control there; pilots died trying
  shot(8, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 160, 290, 6, 0.6) + speedLines(t, -100, 740, 40, 330, 10);
    s += propPlane(300, 160, t, { s: 1.1, shake: 10 + 8 * clamp(u / d), rot: 4 * Math.sin(t * 7) });
    for (var w = 0; w < 6; w++) s += '<path d="M' + (160 + w * 50) + ' ' + f(80 + 10 * Math.sin(t * 20 + w)) + ' l8 -8 l8 8" stroke="' + INK + '" stroke-width="2.4" fill="none" opacity=".6"/>';
    s += gauge(560, 280, 34, 0.86 + 0.08 * Math.sin(t * 30), "") + '<text x="560" y="332" text-anchor="middle" style="font:700 12px Noto Serif;fill:' + INK + ';direction:ltr">MACH</text>';
    s += '<circle cx="90" cy="280" r="12" fill="' + RED + '" opacity="' + (Math.sin(t * 12) > 0 ? 1 : 0.25) + '" filter="url(#glow)"/>';
    return s + tag("بتترج!", 160, 40, u, 0.4, -4, 20) + tag("خطر", 90, 240, u, 2.6, 3, 16, "#ffb08a");
  });
  // 9 — 1947: Chuck Yeager and the bullet-shaped rocket plane X-1
  shot(9, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="570" fill="url(#sky-day)"/>' + clouds(t, 50, 20, 6, 0.7) + birds(t, 120, 50) + desert(t, 270);
    var yr = Math.round(lerp(2026, 1947, clamp(u / 1.4))); s += '<g transform="translate(140 60)"><rect x="-76" y="-24" width="152" height="44" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:800 24px Noto Serif;fill:#ffd23a">' + yr + '</text></g>';
    s += x1(380 + Math.sin(t * 1.3) * 8, 210 + Math.sin(t * 2.6) * 6, t, { s: 1.0, rot: Math.sin(t * 1.7) * 2 }) + yeager(130, 190, t, u > 3 ? "happy" : "n", { s: 0.55, look: 1 });
    var b = pop((u - 3.4) / 0.8); if (b > 0) s += '<g transform="translate(400 90) scale(' + f(b) + ')"><path d="M70 0 C60 -14 30 -16 0 -16 L-60 -16 L-60 16 L0 16 C30 16 60 14 70 0 Z" fill="url(#gold)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-78" y="-16" width="20" height="32" fill="#b98a3e" stroke="' + INK + '" stroke-width="2.4"/></g>';
    return s + tag("X-1", 520, 150, u, 1.6, 3, 22) + tag("زي الرصاصة", 400, 40, u, 3.6, -3, 17);
  });
  // 10 — he had two broken ribs and shut the cockpit door with a piece of broom handle
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gX1)"/><path d="M-400 40 H1040" stroke="#ffd2a8" stroke-width="8" opacity=".5"/>';
    for (var rv = 0; rv < 40; rv++) s += '<circle cx="' + f(((rv * 40 + t * 30) % 1600) - 400) + '" cy="' + (rv % 2 ? 20 : 320) + '" r="3" fill="#a8460e"/>';
    s += '<rect x="' + f(((t * 160) % 1600) - 500) + '" y="-300" width="80" height="960" fill="#fff" opacity=".12" transform="skewX(-20)"/>';
    s += '<rect x="250" y="40" width="210" height="250" rx="20" fill="#3a3530" stroke="' + INK + '" stroke-width="4"/>' + yeager(355, 150 + Math.sin(t * 3) * 3, t, u < 2 ? "worry" : "happy", { s: 0.9, ribs: true, look: -1 });
    for (var pn = 0; pn < 5; pn++) { var pa = t * 3 + pn * 1.256; var qx = 400 + Math.cos(pa) * 50, qy = 230 + Math.sin(pa) * 20; s += '<path d="M' + f(qx) + ' ' + f(qy - 8) + ' L' + f(qx + 2.5) + ' ' + f(qy - 2.5) + ' L' + f(qx + 8) + ' ' + f(qy) + ' L' + f(qx + 2.5) + ' ' + f(qy + 2.5) + ' L' + f(qx) + ' ' + f(qy + 8) + ' L' + f(qx - 2.5) + ' ' + f(qy + 2.5) + ' L' + f(qx - 8) + ' ' + f(qy) + ' L' + f(qx - 2.5) + ' ' + f(qy - 2.5) + ' Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
    var close = clamp((u - 1.8) / 1.2), dw = lerp(200, 0, ease(close));
    s += '<rect x="' + f(460 - dw - 0) + '" y="40" width="' + f(Math.max(8, 210 - dw)) + '" height="250" rx="20" fill="url(#gX1)" stroke="' + INK + '" stroke-width="4" opacity=".96"/>';
    var bx = lerp(160, 230 + 0.0 * dw, ease(clamp((u - 1.2) / 0.8))); s += '<path d="M' + f(bx - 150) + ' 220 L' + f(bx + 60) + ' 170" stroke="#a8783e" stroke-width="12" stroke-linecap="round"/><path d="M' + f(bx - 150) + ' 220 L' + f(bx + 60) + ' 170" stroke="#d9a868" stroke-width="4" stroke-linecap="round"/>';
    return s + tag("ضلعين مكسورين", 140, 60, u, 0.4, -3, 18, "#ffb08a") + tag("عصاية مقشة!", 160, 300, u, 1.6, 3, 19);
  });
  // 11 — dropped from under a big bomber, it lit its rockets and went past the speed of sound
  shot(11, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 380, k), lerp(160, 190, k), lerp(0.9, 1.0, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 160, 260, 7, 0.8) + clouds(t, 110, 330, 6, 0.6) + speedLines(t, -100, 740, 30, 330, 10);
    var dr = clamp((u - 1.0) / 1.0), fire = clamp((u - 1.8) / 0.4), fx = lerp(220, 260, dr) + 220 * Math.pow(clamp((u - 1.8) / (d - 1.8)), 1.6), fy = 120 + 60 * Math.sin(dr * 1.4) - 40 * clamp((u - 2.2) / 2);
    s += b29(200 - u * 10 + Math.sin(t * 1.4) * 6, 90 + Math.sin(t * 2.1) * 5, t, { s: 0.75 }) + x1(fx + (1 - dr) * Math.sin(t * 2.2) * 4, fy + (1 - dr) * Math.sin(t * 3.1) * 4, t, { s: 0.48, fire: fire, rot: -6 * fire + (1 - dr) * Math.sin(t * 2.6) * 3 });
    if (fire > 0.6) s += cone(fx + 60, fy - 6, 1.06 + 0.2 * clamp((u - 3) / 1), 200, "#fff", 3, 0.6 * clamp((u - 3.0) / 0.5));
    for (var cl = 0; cl < 8; cl++) { var cu = (t * 1.5 + cl / 8) % 1; s += '<path d="M' + f(700 - cu * 900) + ' ' + f(40 + hash(cl) * 280) + ' h90" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="' + f(0.7 * Math.sin(Math.PI * cu)) + '"/>'; }
    var M = lerp(0.8, 1.06, clamp((u - 1.8) / 2.0)); s += '<g transform="translate(540 320)"><rect x="-70" y="-20" width="140" height="38" rx="8" fill="' + INK + '"/><text y="7" text-anchor="middle" style="font:800 17px Noto Serif;fill:' + (M >= 1 ? "#7cf29a" : YEL) + ';direction:ltr">Mach ' + M.toFixed(2) + '</text></g>';
    return s + tag("B-29", 120, 30, u, 0.3, -3, 16) + tag("ولّعت الصواريخ", 500, 60, u, 1.9, 3, 17);
  });
  // 12 — that's why fighters have a needle nose and wings swept back like an arrow (plan view)
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="-300" width="1440" height="960" fill="#7fb7e0" opacity=".5"/>' + clouds(t, 160, 80, 6, 0.7, 0.7) + clouds(t, 220, 300, 6, 0.7, 0.7);
    s += jetTop(330, 180 + Math.sin(t * 1.6) * 6, t, { s: 1.2, rot: Math.sin(t * 0.9) * 3, ab: 0.4 });
    var a = clamp((u - 0.6) / 0.6), b = clamp((u - 2.2) / 0.6);
    if (a > 0) s += '<circle cx="490" cy="180" r="' + f(34 + 3 * Math.sin(t * 6)) + '" fill="none" stroke="' + YEL + '" stroke-width="4" opacity="' + f(a) + '"/>';
    if (b > 0) s += '<path d="M318 160 L246 64 M318 200 L246 296" stroke="' + YEL + '" stroke-width="5" stroke-dasharray="10 6" opacity="' + f(b) + '"/>';
    return s + tag("بوز زي الإبرة", 520, 110, u, 0.7, 3, 17) + tag("جناح زي السهم", 160, 60, u, 2.3, -3, 17);
  });
  // 13 — the nose splits the air, the swept wing slips through the waves with less drag (oblique shocks, NASA schlieren look)
  shot(13, function (u, d) { return [lerp(320, 350, u / d), 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#4fb3e0"/>';
    for (var b = 0; b < 8; b++) s += '<rect x="-400" y="' + (-300 + b * 120) + '" width="1440" height="60" fill="#2f86c8" opacity=".25"/>';
    for (var i = 0; i < 16; i++) { var y0 = 30 + i * 20, ph = (t * 1.6 + i * 0.1) % 1; s += '<path d="M' + f(-60 + ph * 40) + ' ' + y0 + ' H' + f(380) + ' L' + f(700) + ' ' + f(y0 + (y0 - 180) * 0.35) + '" stroke="#e9f6ff" stroke-width="1.6" fill="none" opacity=".55" stroke-dasharray="20 14" stroke-dashoffset="' + f(-t * 120) + '"/>'; }
    s += cone(470, 180, 1.6, 360, "#0d2a48", 6, 0.8) + cone(330, 186, 1.6, 300, "#ffd23a", 4, 0.8) + cone(470, 180, 1.6, 360, "#fff", 2, 0.9);
    s += jet(370, 180, t, { s: 0.75, ab: 0.6 });
    return s + tag("البوز بيشق الهوا", 520, 60, u, 0.4, 3, 17) + tag("أقل مقاومة", 220, 310, u, 1.8, -3, 17);
  });
  // 14 — inside: a jet engine sucks the air in, squeezes it, burns it with fuel and throws it out the back
  shot(14, function (u, d) { var st = Math.min(3, Math.floor(u / (d / 4))); return [lerp(150, 470, ease(clamp(u / d))), 180, 1.35]; }, function (u, d, t) {
    var st = Math.min(3, Math.floor(u / (d / 4))), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1e2a36"/>' + engineCut(320, 180, t, { s: 1.0, hl: [0, 1, 2, 4][st] });
    var L4 = ["بيشفط", "يضغط", "يحرق", "يرمي لورا"], X4 = [100, 220, 320, 460];
    for (var k = 0; k <= st; k++) s += tag(L4[k], X4[k], 70, u, k * d / 4 + 0.1, k % 2 ? 3 : -3, 18);
    return s;
  });
  // 15 — need more speed? the afterburner sprays fuel into the exhaust itself: a long flame with shock diamonds
  shot(15, function (u, d) { return [lerp(300, 260, u / d), 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var ab = clamp((u - 1.6) / 0.8), s = sky("night") + stars(t) + clouds(t, 40 + 160 * ab, 300, 5, 0.25) + speedLines(t, -100, 740, 40, 330, Math.round(4 + 12 * ab));
    s += jet(400, 170, t, { s: 1.1, fire: 1, ab: ab, shake: ab * 2 });
    return s + tag("الحارق اللاحق", 170, 60, u, 1.8, -3, 19);
  });
  // 16 — about half again more thrust, but it drinks many times the fuel
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + jet(320, 90, t, { s: 0.6, fire: 1, ab: 1 });
    var th = lerp(1, 1.5, ease(clamp((u - 0.4) / 1.2))), fuel = 1 - 0.7 * clamp((u - 1.6) / (d - 1.8));
    s += '<rect x="120" y="' + f(320 - 120 * th) + '" width="70" height="' + f(120 * th) + '" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="3"/><path d="M110 200 H200" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 4"/><text x="155" y="' + f(312 - 120 * th) + '" text-anchor="middle" style="font:800 16px Noto Serif;fill:#fff">' + Math.round(th * 100) + '%</text>';
    s += '<rect x="430" y="170" width="90" height="150" rx="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><rect x="434" y="' + f(174 + 142 * (1 - fuel)) + '" width="82" height="' + f(142 * fuel) + '" rx="6" fill="' + RED + '"/>';
    for (var dr = 0; dr < 4; dr++) { var du = (t * 1.6 + dr / 4) % 1; s += '<circle cx="475" cy="' + f(330 + du * 40) + '" r="4" fill="' + RED + '" opacity="' + f(1 - du) + '"/>'; }
    return s + tag("الدفع", 155, 345, u, 0.2, -2, 16) + tag("الوقود", 475, 150, u, 1.4, 3, 16, "#ffb08a");
  });
  // 17 — past the speed of sound the waves gather into one shock wave shaped like a cone behind the jet
  shot(17, function (u, d) { return [lerp(360, 330, u / d), 180, lerp(1.2, 1.0, u / d)]; }, function (u, d, t) {
    var M = lerp(1.05, 1.7, ease(clamp(u / (d * 0.6)))), s = sky("day") + clouds(t, 200 + M * 100, 300, 6, 0.7) + waves(470, 180, t, M, 60, 12, "#2f7fd8", 0.36);
    s += cone(470, 180, M, 420, "#fff", 6, clamp((u - 1.0) / 0.6)) + jet(400, 180, t, { s: 0.6, fire: 1, ab: 0.5 });
    return s + tag("موجة صدمة", 480, 50, u, 1.2, 3, 18) + tag("مخروط", 200, 310, u, 2.4, -3, 18);
  });
  // 18 — the cone travels with it all the time, like the wake a boat leaves on the water
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 120, 20, 7, 0.7) + '<rect x="-400" y="180" width="1440" height="500" fill="url(#gSea)"/>';
    for (var w = 0; w < 18; w++) { var wx = ((w * 70 - t * 40) % 1100 + 1100) % 1100 - 300; s += '<path d="M' + f(wx) + ' ' + f(200 + hash(w) * 150) + ' q10 -4 20 0" stroke="#bfe6ff" stroke-width="2" fill="none" opacity=".6"/>'; }
    s += cone(330, 270, 2.6, 380, "#fff", 5, 0.9) + '<g transform="translate(330 270) scale(' + f(1 + 0.02 * Math.sin(t * 4)) + ')"><path d="M40 0 L-30 -14 L-40 0 L-30 14 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-24" y="-7" width="26" height="14" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/></g>';
    for (var fo = 0; fo < 14; fo++) { var fu = (t * 0.8 + fo / 14) % 1, mu2 = Math.asin(1 / 2.6), sg = fo % 2 ? 1 : -1; s += '<circle cx="' + f(330 - fu * 300 * Math.cos(mu2)) + '" cy="' + f(270 + sg * fu * 300 * Math.sin(mu2)) + '" r="' + f(3 + fu * 5) + '" fill="#fff" opacity="' + f(0.9 * (1 - fu)) + '"/>'; }
    var jy = 90 + Math.sin(t * 2.2) * 8; s += cone(470, jy, 1.6, 300, "#fff", 4, 0.9) + jet(420, jy, t, { s: 0.42, fire: 1 }) + speedLines(t, 200, 380, jy - 10, jy + 10, 5);
    return s + tag("زي المركب", 160, 320, u, 0.6, -3, 18);
  });
  // 19 — when the edge of the cone sweeps over you, the pressure jumps suddenly: boom
  shot(19, function (u, d) { return [lerp(320, 340, u / d), 180, 1.0]; }, function (u, d, t) {
    var px = lerp(250, 640, u / d), M = 1.6, mu = Math.asin(1 / M), hx = px - 200 / Math.tan(mu), s = sky("day") + clouds(t, 30, 40, 5, 0.7) + city(t, 300, 60, "#b9a58a", "#f7e7b0", 5, false) + grass(t, 300, "grass-day", "#5a7a3a");
    s += '<path d="M' + f(px) + ' 80 L' + f(hx) + ' 280" stroke="#fff" stroke-width="5" opacity=".9"/><path d="M' + f(px) + ' 80 L' + f(hx) + ' 280" stroke="#2f7fd8" stroke-width="2" stroke-dasharray="6 6" stroke-dashoffset="' + f(t * 40) + '"/>';
    s += jet(px, 80, t, { s: 0.36, fire: 1 });
    var tHit = (320 + 200 / Math.tan(mu) - 250) / (390 / d), got = u > tHit;
    s += person(320, 210, t, got ? "shock" : "n", { s: 0.55, up: true, look: 1 });
    if (got) s += boomFx(390, 150, u - tHit, 36);
    return s + pressureGraph(70, 80, 120, 30, u, clamp((u - tHit + 0.4) / 0.6) * 0.5, RED);
  });
  // 20 — usually you hear two booms: one from the nose and one from the tail (AirBOS pictures show both)
  shot(20, function (u, d) { return [lerp(320, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3fb3e8"/>';
    for (var b = 0; b < 12; b++) s += '<rect x="-400" y="' + f(-300 + b * 100 + (t * 60) % 100) + '" width="1440" height="50" fill="#2a8ad0" opacity=".25"/>';
    var px = 430 + Math.sin(t * 1.6) * 14;
    for (var st2 = 0; st2 < 12; st2++) { var su2 = (t * 1.2 + st2 / 12) % 1; s += '<path d="M' + f(px - 40 - su2 * 300) + ' ' + f(120 + (st2 % 2 ? 1 : -1) * 4) + ' h-30" stroke="#e9f6ff" stroke-width="3" opacity="' + f(0.8 * (1 - su2)) + '"/>'; } s += cone(px + 54, 120, 1.4, 380, "#ffd23a", 6, 0.9) + cone(px - 56, 124, 1.4, 360, "#ff7a2a", 6, 0.9) + cone(px + 54, 120, 1.4, 380, "#0d2a48", 2, 0.6) + jet(px, 120, t, { s: 0.42, fire: 1 });
    var p = clamp((u - 0.3) / 2.6); s += pressureGraph(160, 280, 300, 40, u, p, "#0d2a48");
    if (p > 0.3) s += boomFx(205, 210, u - 0.3 - 0.78, 26, "بوم!"); if (p > 0.7) s += boomFx(380, 210, u - 0.3 - 1.82, 26, "بوم!");
    return s + tag("البوز", 540, 60, u, 0.4, 3, 16) + tag("الديل", 300, 60, u, 1.0, -3, 16, "#ffb08a");
  });
  // 21 — not one bang when it "breaks" the barrier: it drags the boom behind it all the way (a boom carpet seen from above)
  shot(21, function (u, d) { return [lerp(300, 360, u / d), 180, lerp(1.0, 0.92, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#9dbb6e"/>', px = lerp(80, 700, u / d);
    s += '<rect x="-400" y="120" width="1440" height="120" fill="' + YEL + '" opacity=".2"/><path d="M-400 120 H1040 M-400 240 H1040" stroke="' + YEL + '" stroke-width="2" stroke-dasharray="10 8"/>';
    for (var hx = -40; hx < 760; hx += 70) for (var hy = 40; hy < 340; hy += 70) { var dz = Math.abs(hy - 180), inCarpet = dz < 64, edge = px - 60 - dz * 1.6, lit = inCarpet && hx < edge && hx > edge - 120; s += house(hx + (hy % 140 ? 30 : 0), hy + 16, 0.55, lit); if (lit) s += '<circle cx="' + f(hx + (hy % 140 ? 30 : 0)) + '" cy="' + (hy - 4) + '" r="18" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>'; }
    s += '<path d="M' + f(px - 60) + ' 180 L' + f(px - 60 - 220) + ' 40 M' + f(px - 60) + ' 180 L' + f(px - 60 - 220) + ' 320" stroke="#fff" stroke-width="5" opacity=".9"/>' + jetTop(px, 180, t, { s: 0.42, ab: 0.4 });
    return s + tag("طول السكة", 200, 330, u, 0.8, -3, 18);
  });
  // 22 — a whip crack is a tiny sonic boom too: a loop runs down the whip and goes faster than sound
  shot(22, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="580" fill="url(#sky-dusk)"/>' + clouds(t, 50, 30, 6, 0.6) + birds(t, 110, 50) + desert(t, 280);
    s += person(140, 170, t, "happy", { s: 0.7, col: "#6b5a3a" }) + '<path d="M120 116 C120 92 160 92 160 116" fill="#7a5230" stroke="' + INK + '" stroke-width="2.4"/><path d="M100 116 H180" stroke="#7a5230" stroke-width="6"/>';
    var cyc = (u * 0.7) % 1, lp = ease(clamp(cyc / 0.7)), d2 = "M176 200";
    for (var i = 1; i <= 30; i++) { var k = i / 30, x = 176 + k * 360, y = 200 - 40 * Math.sin(k * 3.1) * (1 - lp) + 60 * Math.exp(-Math.pow((k - lp) * 9, 2)) * Math.sin((k - lp) * 18); d2 += " L" + f(x) + " " + f(y); }
    s += '<path d="' + d2 + '" stroke="#5a3c20" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M176 200 l-20 30" stroke="#5a3c20" stroke-width="10" stroke-linecap="round"/>';
    if (cyc > 0.68 && cyc < 0.98) s += boomFx(540, 190, (cyc - 0.68) * 1.4 / 0.7, 22, "طق!") + cone(546, 196, 1.4, 70, "#fff", 3, 0.8);
    return s + tag("بوم صوتي صغير!", 360, 60, u, 1.4, -3, 19);
  });
  // 23 — so you hear it after the plane has gone by: it's ahead of its own sound
  shot(23, function (u, d) { return [lerp(340, 300, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var px = lerp(380, 600, u / d), mu = Math.asin(1 / 1.4), s = sky("day") + clouds(t, 40, 30, 7, 0.85) + birds(t, 150, 60) + city(t, 290, 80, "#b9a58a", "#f7e7b0", 3, false) + grass(t, 290, "grass-day", "#5a7a3a");
    s += '<path d="M' + f(px - 20) + ' 70 L' + f(px - 20 - 230 / Math.tan(mu)) + ' 300" stroke="#fff" stroke-width="4" opacity=".8"/>' + jet(px, 70, t, { s: 0.32, fire: 0.6 });
    s += cars(t, 330, 90) + person(200, 216, t, "happy", { s: 0.6, up: true, look: 1, col: "#2f6f9f" }) + boomFx(130, 150, (u % 1.5), 26);
    return s + tag("سابقة صوتها!", Math.min(540, px), 140, u, 0.6, 3, 18);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + jet(300 + Math.sin(t * 2) * 8, 150, t, { s: 0.8, fire: 1, mood: "happy" }) + cone(410, 150, 1.5, 200, "#2f7fd8", 4, 0.6);
    return s + qmark(500, 80, t, 56) + qmark(550, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { jet: jet, jetTop: jetTop, x1: x1, b29: b29, cone: cone, waves: waves, boomFx: boomFx, person: person, tag: tag, engineCut: engineCut };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
