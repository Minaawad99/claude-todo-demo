  // ── Wi-Fi episode: router, phone, microwave, dish and the data itself, drawn in the same cartoon-panel look ──
  var INK = "#1c1c1c", ACC = "#2f7fb8", RED = "#e2452e", YEL = "#f2c230", GRN = "#4fb36a", PAPER = "#f2e7d1";
  var CLIPN = 0, OILN = 0;
  function camL(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function sparkle(x, y, s, t) {
    var k = 0.5 + 0.5 * Math.sin(t * 4 + x), p = [[0, -1], [0.25, -0.25], [1, 0], [0.25, 0.25], [0, 1], [-0.25, 0.25], [-1, 0], [-0.25, -0.25]];
    var pts = p.map(function (q) { return f(x + q[0] * s * (0.6 + 0.4 * k)) + "," + f(y + q[1] * s * (0.6 + 0.4 * k)); }).join(" ");
    return '<polygon points="' + pts + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(0.5 + 0.5 * k) + '"/>';
  }
  function room(dark) {
    return '<rect x="-400" y="-300" width="1440" height="560" fill="' + (dark ? "#d9cdb4" : PAPER) + '"/>' +
      '<rect x="-400" y="250" width="1440" height="200" fill="#c9a77c"/><path d="M-400 250 H1040" stroke="#8a6a44" stroke-width="3"/>';
  }
  function windowF(x, y, w, h) {
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#sky-day)" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M' + f(x + w / 2) + ' ' + f(y) + ' V' + f(y + h) + ' M' + f(x) + ' ' + f(y + h / 2) + ' H' + f(x + w) + '" stroke="' + INK + '" stroke-width="3"/>';
  }
  function wall(x, y, w, h) {
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + f(x) + ' ' + f(y + h * 0.3) + ' h' + f(w) + ' M' + f(x) + ' ' + f(y + h * 0.7) + ' h' + f(w) + '" stroke="#8a8478" stroke-width="1" opacity=".5"/>';
  }
  // the router: white box, two antennas, LEDs blinking
  function router(x, y, t, o) {
    o = o || {}; var s = o.s || 1, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M-18 -30 L-26 -62 M18 -30 L26 -62" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    g += '<circle cx="-26" cy="-63" r="3.5" fill="' + INK + '"/><circle cx="26" cy="-63" r="3.5" fill="' + INK + '"/>';
    g += '<rect x="-48" y="-30" width="96" height="30" rx="8" fill="url(#gShield)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 4; i++) g += '<rect x="' + (-40 + i * 9) + '" y="-22" width="4" height="14" fill="#8a929c"/>';
    for (var k = 0; k < 3; k++) g += '<circle cx="' + (22 + k * 9) + '" cy="-18" r="2.6" fill="' + (k === 2 ? ACC : GRN) + '" opacity="' + f(0.35 + 0.65 * Math.abs(Math.sin(t * 3 + k * 1.7))) + '"/>';
    return g + '</g>';
  }
  // radio waves leaving an antenna: arcs that grow and fade (dir 1 = right, -1 = left)
  function wifiArcs(x, y, t, dir, o) {
    o = o || {}; var s = "", n = o.n || 3, gap = o.gap || 26, col = o.col || ACC, sp = o.sp || 30, sc = o.s || 1, a = 0.75;
    for (var i = 0; i < n; i++) {
      var r = (16 + i * gap + ((t * sp) % gap)) * sc, op = clamp(1 - (r / sc - 16) / (n * gap)) * 0.95;
      var x1 = x + dir * Math.cos(-a) * r, y1 = y + Math.sin(-a) * r, x2 = x + dir * Math.cos(a) * r, y2 = y + Math.sin(a) * r;
      s += '<path d="M' + f(x1) + ' ' + f(y1) + ' A' + f(r) + ' ' + f(r) + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + f(3 * sc) + '" fill="none" stroke-linecap="round" opacity="' + f(op) + '"/>';
    }
    return s;
  }
  // a phone standing or held: o.screen(t) draws its screen in local coordinates
  function phone(x, y, t, o) {
    o = o || {}; var s = o.s || 1, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + s + ')">';
    g += '<rect x="-28" y="-54" width="56" height="108" rx="10" fill="#2a2f36" stroke="' + INK + '" stroke-width="2"/><rect x="-23" y="-47" width="46" height="94" rx="5" fill="url(#screen)"/>';
    if (o.screen) g += o.screen(t);
    return g + '<rect x="-9" y="-51" width="18" height="3" rx="1.5" fill="#555"/></g>';
  }
  function movieScreen(t) {
    return '<rect x="-23" y="-47" width="46" height="94" fill="url(#sky-day)"/><circle cx="8" cy="-24" r="6" fill="' + YEL + '"/>' +
      '<path d="M-23 14 Q-6 0 8 12 T23 6 V47 H-23 Z" fill="#5f9a5a"/><rect x="-18" y="36" width="36" height="3" fill="#fff" opacity=".5"/><rect x="-18" y="36" width="' + f(6 + 24 * (t * 0.25 % 1)) + '" height="3" fill="' + RED + '"/>';
  }
  function photoScreen(t) {
    var s = ""; for (var r = 0; r < 9; r++) for (var c = 0; c < 6; c++) { var v = hash(r * 6 + c + 3); s += '<rect x="' + (-23 + c * 7.7) + '" y="' + (-47 + r * 10.4) + '" width="7.7" height="10.4" fill="' + (v > 0.6 ? "#e2a04a" : v > 0.3 ? "#5f9a5a" : "#2f7fb8") + '"/>'; }
    return s;
  }
  // a person: body and a round head with a mood
  function person(x, y, t, mood, o) {
    o = o || {}; var s = o.s || 1, g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2 + (o.ph || 0)) * 1.5) + ') scale(' + s + ')">';
    g += '<path d="M-26 90 C-28 40 -18 22 0 22 C18 22 28 40 26 90 Z" fill="' + (o.c || "#3f6f8f") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    return g + head(0, -6, 22, mood || "n", t, o.look || 0) + '</g>';
  }
  // a packet of data: picture, message or sound icon
  function packet(x, y, kind, s) {
    s = s || 1; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    if (kind === "pic") g += '<rect x="-11" y="-8" width="22" height="16" rx="2" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><path d="M-8 5 L-3 -2 L1 3 L4 0 L8 5 Z" fill="' + GRN + '"/><circle cx="4" cy="-4" r="1.8" fill="' + YEL + '"/>';
    else if (kind === "msg") g += '<rect x="-12" y="-8" width="24" height="16" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><path d="M-4 7 L-6 12 L1 7 Z" fill="#fff" stroke="' + INK + '" stroke-width="1"/><path d="M-6 -2 H6 M-6 2 H3" stroke="' + ACC + '" stroke-width="1.4"/>';
    else if (kind === "snd") g += '<circle r="9" fill="' + ACC + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-2 -4 V4 L-5 2" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M2 -3 Q5 0 2 3" stroke="#fff" stroke-width="1.2" fill="none"/>';
    else g += '<rect x="-7" y="-7" width="14" height="14" rx="3" fill="' + INK + '"/>';
    return g + '</g>';
  }
  function bit(x, y, v, col, op, size) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" opacity="' + f(op == null ? 1 : op) + '" style="font:900 ' + (size || 16) + 'px Noto Sans Arabic;fill:' + col + '">' + v + '</text>'; }
  // packets (pictures, messages, sounds) travelling from A to B
  function flow(x0, y0, x1, y1, t, n, sp, o) {
    o = o || {}; var s = ""; for (var i = 0; i < n; i++) {
      var p = (t * sp + i / n) % 1, x = lerp(x0, x1, p), y = lerp(y0, y1, p) + Math.sin(p * 9 + i) * (o.wav || 0);
      var kind = o.kind || (i % 3 === 0 ? "pic" : i % 3 === 1 ? "msg" : "snd");
      s += '<g opacity="' + f(Math.min(1, p * 4, (1 - p) * 4)) + '">' + packet(x, y, kind, o.s || 1) + '</g>';
    }
    return s;
  }
  // 0s and 1s travelling from A to B; each bit changes when its packet starts again
  function bitFlow(x0, y0, x1, y1, t, n, sp, col, o) {
    o = o || {}; var s = ""; for (var i = 0; i < n; i++) {
      var c = t * sp + i / n, p = c % 1, v = hash(i * 13 + Math.floor(c)) > 0.5 ? "1" : "0";
      s += bit(lerp(x0, x1, p), lerp(y0, y1, p) + Math.sin(p * 9 + i) * (o.wav || 0), v, col || ACC, Math.min(1, p * 4, (1 - p) * 4), o.size);
    }
    return s;
  }
  // a radio wave: a line whose shape changes with the bit it carries (big wiggle = 1, small wiggle = 0)
  function bitWave(x0, x1, y, t, o) {
    o = o || {}; var d = "", amp = o.amp || 16, sp = o.sp || 60, col = o.col || ACC, seed = o.seed || 0;
    for (var x = x0; x <= x1; x += 3) {
      var b = Math.floor((x + t * sp) / 60), v = hash(b * 3 + seed) > 0.5, A = v ? amp * 1.5 : amp * 0.5, fr = v ? 0.3 : 0.12;
      d += (d ? " L" : "M") + f(x) + " " + f(y + Math.sin(x * fr - t * 7) * A);
    }
    return '<path d="' + d + '" stroke="' + col + '" stroke-width="' + f(o.w || 3) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function bitRow(x0, x1, y, t, sp, seed, col) {
    var s = ""; for (var b = Math.floor((x0 + t * sp) / 60) - 1; b * 60 - t * sp < x1; b++) { var xc = b * 60 - t * sp + 30; if (xc > x0 && xc < x1) s += bit(xc, y, hash(b * 3 + seed) > 0.5 ? "1" : "0", col || INK, 0.85, 17); }
    return s;
  }
  function bars(x, y, n) { var s = ""; for (var i = 0; i < 4; i++) s += '<rect x="' + (x + i * 7) + '" y="' + f(y - (6 + i * 5)) + '" width="5" height="' + (6 + i * 5) + '" fill="' + (i < n ? GRN : "#cfc8b8") + '"/>'; return s; }
  function clock(x, y, t, r) { r = r || 8; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(t * 3) * r * 0.7) + ' ' + f(y + Math.sin(t * 3) * r * 0.7) + '" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>'; }
  // microwave oven: body, glass door, turntable, food glowing when it runs
  function oven(x, y, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-60" y="-40" width="120" height="80" rx="8" fill="#e9e6df" stroke="' + INK + '" stroke-width="2"/>';
    g += '<rect x="-48" y="-30" width="78" height="60" rx="4" fill="#3a3d42" stroke="' + INK + '"/><rect x="-44" y="-26" width="70" height="52" fill="#20242a"/>';
    g += '<circle cx="-9" cy="0" r="16" fill="' + RED + '" opacity="' + f(0.25 + 0.25 * Math.abs(Math.sin(t * 6))) + '"/><rect x="38" y="-30" width="14" height="60" rx="3" fill="#8a929c" stroke="' + INK + '"/>';
    return g + '<text x="45" y="-40" text-anchor="middle" style="font:800 10px Noto Sans Arabic;fill:' + INK + '">2.45</text></g>';
  }
  // a radio telescope dish on a pedestal
  function dish(x, y, t) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-8 + Math.sin(t * 0.4) * 2) + ')"><path d="M0 0 L-12 -70 M0 0 L12 -70" stroke="#5a6068" stroke-width="5"/>' +
      '<path d="M-52 -96 Q0 -40 52 -96 Z" fill="url(#gShield)" stroke="' + INK + '" stroke-width="2"/><path d="M0 -62 L6 -110" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<circle cx="6" cy="-112" r="4" fill="' + RED + '" opacity="' + f(0.5 + 0.5 * Math.sin(t * 5)) + '"/></g>';
  }
  // a black hole: a dark disc with a glowing ring turning around it
  function blackHole(x, y, r, t) {
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="#f2a04a" opacity=".2" filter="url(#soft)"/>' +
      '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 2.2) + '" ry="' + f(r * 0.6) + '" fill="none" stroke="#ffd98a" stroke-width="' + f(r * 0.45) + '" transform="rotate(' + f(t * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>' +
      '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#000"/>';
  }
  function bills(x, y, n) {
    var s = ""; for (var i = 0; i < n; i++) s += '<rect x="' + f(x - 52) + '" y="' + f(y - i * 9 - 9) + '" width="104" height="9" rx="1.5" fill="' + (i % 2 ? "#7fb07a" : "#6a9f66") + '" stroke="#2f4a2a" stroke-width="1.2"/><circle cx="' + f(x) + '" cy="' + f(y - i * 9 - 4.5) + '" r="2.8" fill="#dfe9d0"/>';
    return s;
  }

  // ── shots (one per script line) ─────────────────────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — hook: a living room, the router on the shelf, a phone with a film in someone's hand
  shot(0, camL(320, 170, 0.95, 390, 165, 1.07), function (u, d, t) {
    var s = room(false) + windowF(40, -30, 140, 140) + '<rect x="20" y="128" width="200" height="10" fill="#8a6a44" stroke="' + INK + '" stroke-width="1.5"/>';
    s += router(150, 128, t, { s: 1.15 }) + wifiArcs(150, 72, t, 1, { n: 3, sp: 22, s: 0.9 });
    s += person(400, 160, t, "happy") + phone(440, 150, t, { rot: -8 + Math.sin(t * 2) * 2, screen: movieScreen });
    s += flow(170, 60, 420, 104, t, 6, 0.2, { wav: 6 });
    return s + tag("من غير ولا سلك!", 320, 40, u, 0.9, -3, 24);
  });
  // 1 — pictures, sound and words go through the air, invisible
  shot(1, camL(320, 180, 1.0, 320, 180, 1.08), function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 30, 4, 0.8) + grass(t, 250, "grass-day", "#4f7a36");
    s += router(110, 220, t, { s: 1.1 }) + wifiArcs(110, 160, t, 1, { n: 3, sp: 20, s: 0.7 });
    s += phone(530, 205, t, { s: 1.1, screen: movieScreen });
    s += flow(140, 170, 500, 180, t, 9, 0.22, { wav: 16, s: 1.2 });
    return s + tag("صور وصوت في الهوا!", 320, 50, u, 0.7, -3, 22);
  });
  // 2 — the puzzle: how does the data travel, and who decodes it?
  shot(2, camL(320, 180, 1.0, 320, 170, 1.1), function (u, d, t) {
    var s = sky("day") + clouds(t, 12, 30, 3, 0.8) + grass(t, 250, "grass-day", "#4f7a36");
    s += router(120, 220, t, { s: 1.0 }) + person(420, 170, t, "curious", { c: "#8f3a2a" });
    s += flow(150, 150, 400, 150, t, 5, 0.25, { wav: 10 });
    for (var i = 0; i < 3; i++) { var qy = 90 + Math.sin(t * 2 + i * 2) * 6; s += '<text x="' + f(250 + i * 60) + '" y="' + f(qy) + '" text-anchor="middle" style="font:900 ' + (30 + i * 4) + 'px Noto Sans Arabic;fill:' + YEL + ';stroke:' + INK + ';stroke-width:1.2px">?</text>'; }
    return s + tag("بتسافر إزاي؟", 230, 40, u, 0.6, -3, 22) + tag("ومين بيفكّها؟", 470, 320, u, 2.2, 3, 20);
  });
  // 3 — the title card
  shot(3, camL(320, 180, 0.98, 320, 180, 1.06), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 40, 3, 0.7);
    s += sparkle(120, 90, 12, t) + sparkle(520, 110, 16, t + 1) + sparkle(470, 270, 10, t + 2) + sparkle(150, 250, 9, t + 3);
    return s + tag("إيه الحكاية؟", 320, 150, u, 0.1, -3, 42) + tag("هشرحهالك في دقيقة", 320, 230, u, 1.0, 2, 24);
  });
  // 4 — close on the router: what it really sends is 0s and 1s
  shot(4, camL(320, 170, 1.3, 320, 170, 1.5), function (u, d, t) {
    var s = room(true) + '<rect x="250" y="250" width="140" height="10" fill="#8a6a44"/>' + router(320, 250, t, { s: 2.1 });
    s += wifiArcs(320, 120, t, 1, { n: 2, sp: 18, s: 1.4 }) + wifiArcs(320, 120, t, -1, { n: 2, sp: 18, s: 1.4 });
    for (var i = 0; i < 7; i++) { var p = (t * 0.6 + i / 7) % 1, v = hash(i + Math.floor(t * 0.6 + i / 7)) > 0.5 ? "1" : "0"; s += bit(320 - 60 + i * 20, 290 + p * 40, v, INK, 1 - p, 18); }
    return s + tag("أصفار وواحدات!", 320, 70, u, 0.9, -3, 22);
  });
  // 5 — a photo turns into a long row of numbers
  shot(5, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("day") + grass(t, 260, "grass-day", "#4f7a36");
    s += phone(180, 170, t, { s: 1.25, screen: photoScreen });
    var pr = clamp((u - 0.5) / 1.4);
    s += arrow(250, 170, 330, 170, ACC, 6, pr);
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) { var v = hash(r * 4 + c + Math.floor(t * 2) * 0.1) > 0.5 ? "1" : "0"; s += bit(410 + c * 36, 120 + r * 32, v, ACC, clamp(pr * 1.5 - (r * 4 + c) * 0.02), 22); }
    return s + tag("كل حاجة أرقام!", 320, 50, u, 0.6, -3, 22);
  });
  // 6 — the radio: a tower sends waves both ways
  shot(6, camL(320, 180, 1.0, 320, 180, 1.07), function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 40, 3, 0.8) + grass(t, 270, "grass-day", "#4f7a36");
    s += '<path d="M300 280 L316 110 L324 110 L340 280 Z" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M308 220 H332 M312 170 H328 M300 280 L332 220 M340 280 L308 220" stroke="' + INK + '" stroke-width="2"/>';
    s += '<circle cx="320" cy="108" r="5" fill="' + RED + '"/>' + wifiArcs(320, 108, t, 1, { n: 3, sp: 26, s: 1.1 }) + wifiArcs(320, 108, t, -1, { n: 3, sp: 26, s: 1.1 });
    s += bitWave(-20, 660, 230, t, { amp: 9, sp: 40, w: 2.5 });
    return s + tag("موجة راديو", 320, 50, u, 0.7, -3, 24);
  });
  // 7 — the wave changes shape with every bit
  shot(7, camL(320, 180, 1.0, 320, 180, 1.04), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + PAPER + '"/>';
    s += bitWave(-20, 660, 170, t, { amp: 30, sp: 60, w: 3.5 }) + bitRow(-20, 660, 240, t, 60, 0, INK);
    return s + tag("كل تغيير = رقم", 320, 60, u, 0.6, -3, 23);
  });
  // 8 — zoom on the wave itself: the data IS the shape of the wave
  shot(8, camL(320, 180, 1.5, 380, 180, 1.9), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + PAPER + '"/>';
    s += bitWave(-20, 660, 170, t, { amp: 30, sp: 60, w: 6 }) + bitRow(-20, 660, 240, t, 60, 0, INK);
    return s + tag("الداتا هي الشكل نفسه", 320, 110, u, 0.6, -3, 20);
  });
  // 9 — it travels at the speed of light, which the eye can't see
  shot(9, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("day") + sun(560, 60, 26, "#ffd98a") + grass(t, 260, "grass-day", "#4f7a36");
    s += router(120, 220, t, { s: 1.0 }) + phone(520, 205, t, { s: 1.0, screen: movieScreen });
    s += '<path d="M150 190 L490 190" stroke="#ffd98a" stroke-width="6" stroke-linecap="round" stroke-dasharray="18 14" stroke-dashoffset="' + f(-t * 160) + '" opacity=".9"/>';
    return s + tag("بسرعة الضوء!", 320, 70, u, 0.6, -3, 24);
  });
  // 10 — the phone's antenna catches the wave; a tiny chip reads it
  shot(10, camL(320, 180, 1.0, 320, 180, 1.07), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    s += wifiArcs(120, 180, t, 1, { n: 4, gap: 46, sp: 40, s: 1.2 });
    s += phone(330, 170, t, { s: 1.7, screen: movieScreen });
    s += '<rect x="440" y="250" width="64" height="40" rx="4" fill="#2a2f36" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) s += '<rect x="' + (436 + k * 11) + '" y="' + (k % 2 ? 288 : 244) + '" width="4" height="7" fill="#c9a04e"/>';
    s += bit(472, 275, hash(Math.floor(t * 4)) > 0.5 ? "1" : "0", GRN, 1, 18);
    return s + tag("شريحة صغيرة بتقرا", 320, 60, u, 0.9, -3, 22);
  });
  // 11 — the numbers come back together as a picture, a message or a sound
  shot(11, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    s += bitFlow(60, 180, 420, 180, t, 16, 0.3, ACC, { wav: 10, size: 17 });
    s += packet(530, 120, "pic", 3) + packet(530, 190, "msg", 3) + packet(530, 260, "snd", 3);
    return s + tag("صورة، رسالة، صوت", 320, 50, u, 0.8, -3, 22);
  });
  // 12 — one router, many devices on the same air
  shot(12, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 290, "grass-day", "#4f7a36");
    var devs = [[110, 130], [110, 250], [530, 120], [530, 250], [320, 110], [230, 270], [420, 280]];
    devs.forEach(function (p, i) { s += flow(320, 190, p[0], p[1], t, 2, 0.3 + i * 0.02, { s: 0.7 }); s += phone(p[0], p[1], t, { s: 0.7, screen: movieScreen, rot: Math.sin(t + i) * 3 }); });
    s += router(320, 200, t, { s: 1.2 }) + wifiArcs(320, 160, t, 1, { n: 2, sp: 20, s: 0.8 }) + wifiArcs(320, 160, t, -1, { n: 2, sp: 20, s: 0.8 });
    return s + tag("عشرين جهاز؟ ميتخانقوش؟", 320, 40, u, 0.8, -3, 19);
  });
  // 13 — they listen first, and wait a moment when someone else is sending
  shot(13, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36"), on = Math.floor(t * 0.7) % 5;
    for (var i = 0; i < 5; i++) {
      var x = 110 + i * 105;
      s += phone(x, 200, t, { s: 0.9, screen: function (tt) { return '<rect x="-23" y="-47" width="46" height="94" fill="#0f2a3a"/>'; } });
      s += i === on ? '<circle cx="' + x + '" cy="140" r="8" fill="' + GRN + '" opacity="' + f(0.6 + 0.4 * Math.sin(t * 8)) + '"/>' : clock(x, 140, t, 9);
    }
    s += '<text x="320" y="110" text-anchor="middle" style="font:900 14px Noto Sans Arabic;fill:' + INK + '">الهوا واحد</text>';
    return s + tag("بتستنى شوية", 320, 50, u, 0.7, -3, 24);
  });
  // 14 — the stream is cut into many thin lanes, one for each device
  shot(14, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 290, "grass-day", "#4f7a36");
    s += bitWave(20, 180, 190, t, { amp: 26, sp: 50, w: 6 });
    for (var k = 0; k < 8; k++) {
      var y = 110 + k * 24, c = k % 2 ? ACC : "#e2a04a";
      s += '<path d="M180 190 C260 190 300 ' + f(y) + ' 380 ' + f(y) + ' L520 ' + f(y) + '" stroke="' + INK + '" stroke-width="6" fill="none" opacity=".5"/>';
      s += '<path d="M180 190 C260 190 300 ' + f(y) + ' 380 ' + f(y) + ' L520 ' + f(y) + '" stroke="' + c + '" stroke-width="3" fill="none" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 90 * (k % 3 + 1)) + '"/>';
      s += phone(560, y, t, { s: 0.35, screen: movieScreen });
    }
    return s + tag("مئات الخطوط!", 320, 50, u, 0.8, -3, 24);
  });
  // 15 — the teacher hands out papers to everyone at once
  shot(15, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = room(false) + windowF(260, -40, 120, 120);
    s += person(120, 180, t, "happy", { c: "#2f6f8f" }) + '<rect x="90" y="150" width="34" height="8" fill="#fff" stroke="' + INK + '"/><rect x="90" y="158" width="34" height="8" fill="#fff" stroke="' + INK + '"/>';
    [380, 460, 540].forEach(function (x, i) { s += person(x, 180, t, "happy", { c: ["#8f3a2a", "#4f7a36", "#c9a04e"][i], ph: i }); });
    for (var i = 0; i < 6; i++) { var p = (t * 0.5 + i / 6) % 1, tx = lerp(150, 380 + (i % 3) * 80, p), ty = lerp(170, 150 - (i % 2) * 14, p) - Math.sin(p * Math.PI) * 60; s += '<g opacity="' + f(Math.min(1, p * 5)) + '">' + packet(tx, ty, "pic", 1.2) + '</g>'; }
    return s + tag("كراسات لكل الفصل", 320, 50, u, 0.8, -3, 20);
  });
  // 16 — distance and walls: the wave gets weaker
  shot(16, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    s += router(90, 230, t, { s: 1.0 }) + wifiArcs(90, 176, t, 1, { n: 6, gap: 38, sp: 30, s: 1.0 });
    s += wall(300, 110, 24, 180);
    s += phone(500, 220, t, { s: 1.0, screen: movieScreen });
    return s + tag("الحيطة بتاكل", 320, 50, u, 0.7, -3, 24);
  });
  // 17 — two rooms, three walls: four bars in one room, one bar behind the walls
  shot(17, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = room(true) + windowF(360, -30, 100, 110);
    s += router(100, 210, t, { s: 0.9 }) + phone(200, 200, t, { s: 0.9, screen: movieScreen }) + bars(230, 140, 4);
    s += wall(275, 60, 14, 240) + wall(305, 60, 14, 240) + wall(335, 60, 14, 240);
    s += phone(480, 200, t, { s: 0.9, screen: movieScreen }) + bars(470, 130, 1) + head(540, 130, 16, "worry", t);
    s += flow(120, 170, 170, 170, t, 2, 0.5, { s: 0.6 });
    return s + tag("تلات حيطان!", 320, 40, u, 0.8, -3, 22);
  });
  // 18 — the microwave runs at a frequency next to Wi-Fi's: they clash now and then
  shot(18, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 290, "grass-day", "#4f7a36");
    s += oven(170, 230, t) + router(480, 220, t, { s: 1.0 }) + wifiArcs(480, 170, t, -1, { n: 3, sp: 24, s: 0.9 });
    if (Math.sin(t * 9) > -0.2) s += '<path d="M290 190 L304 176 L312 200 L326 180 L334 206 L346 190" stroke="' + RED + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    s += '<text x="320" y="260" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:' + INK + '">2.4 جيجا</text>';
    return s + tag("الميكروويف خناقة!", 320, 50, u, 0.9, -3, 21) + tag("نفس التردد تقريبًا", 320, 310, u, 2.6, 2, 15);
  });
  // 19 — the name: not an acronym, a marketing choice
  shot(19, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + PAPER + '"/>';
    s += '<ellipse cx="320" cy="170" rx="180" ry="80" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M270 240 L250 290 L305 250 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += '<text x="320" y="190" text-anchor="middle" style="font:900 44px Noto Sans Arabic;fill:' + ACC + '">Wi-Fi</text>';
    s += '<text x="320" y="282" text-anchor="middle" style="font:700 15px Noto Sans Arabic;fill:#6f6a62">Wireless Fidelity</text>';
    var sl = clamp((u - 1.2) / 0.8); s += '<path d="M200 276 L' + f(200 + 240 * sl) + ' 276" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/>';
    return s + tag("مش اختصار لأي حاجة!", 320, 50, u, 0.7, -3, 21);
  });
  // 20 — a radio telescope on the ground, and a black hole in the sky
  shot(20, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("night") + stars(t) + '<path d="M-400 240 Q200 200 640 240 V420 H-400 Z" fill="url(#grass-night)"/>';
    s += dish(260, 240, t) + blackHole(500, 110, 16, t);
    return s + tag("ثقوب سوداء صغيرة", 320, 50, u, 0.8, -3, 22);
  });
  // 21 — the money from the patents: stacks that keep growing
  shot(21, camL(320, 180, 1.0, 320, 180, 1.05), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    var k = clamp(u / d);
    s += bills(190, 270, 2 + Math.floor(k * 9)) + bills(450, 270, 1 + Math.floor(k * 12));
    return s + tag("مئات الملايين!", 320, 50, u, 0.7, -3, 24);
  });
  // 22 — the film you watched: every bit delivered in order
  shot(22, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    s += phone(430, 190, t, { s: 1.4, screen: movieScreen });
    s += bitFlow(60, 110, 360, 170, t, 12, 0.3, ACC, { wav: 8, size: 15 });
    return s + tag("أرقام في موجة ماشية!", 320, 50, u, 0.8, -3, 20);
  });
  // 23 — payoff: a precise order of millions of numbers and waves
  shot(23, camL(320, 180, 1.0, 320, 180, 1.06), function (u, d, t) {
    var s = sky("day") + grass(t, 280, "grass-day", "#4f7a36");
    s += bitFlow(40, 90, 440, 170, t, 18, 0.4, ACC, { wav: 12, size: 16 });
    s += phone(500, 200, t, { s: 1.2, screen: movieScreen });
    return s + tag("ترتيب دقيق!", 320, 50, u, 0.9, -3, 22);
  });
  // 24 — outro: the question back to the viewer
  shot(24, camL(320, 180, 1.0, 320, 170, 1.08), function (u, d, t) {
    var s = sky("dusk") + clouds(t, 12, 40, 3, 0.7);
    s += person(260, 170, t, "happy", { c: "#3f6f8f" });
    s += '<circle cx="390" cy="120" r="34" fill="#fff" stroke="' + INK + '" stroke-width="3"/><text x="390" y="134" text-anchor="middle" style="font:900 42px Noto Sans Arabic;fill:' + RED + '">؟</text>';
    return s + tag("قولولنا!", 320, 40, u, 0.5, -3, 26) + sparkle(120, 110, 10, t) + sparkle(520, 250, 12, t + 1);
  });

  window.__parts = { router: router, phone: phone, oven: oven, dish: dish, blackHole: blackHole };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
