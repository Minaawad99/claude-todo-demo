  // ── flat full-bleed look (after the reference reel): world is 360×640, no characters, soft flat gradients,
  // dark tooltip chips, cream cards with a dark outline. The bedroom: wall, window, bed (pillow on the left), nightstand.
  var INK = "#1c1c1c", CLIPN = 0, OILN = 0;
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function C(a, b) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }; }
  function R(x, y, w, h, fill, sw, rx, st) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + (st || "#2b2b2b") + '" stroke-width="' + (sw == null ? 1.5 : sw) + '"/>'; }
  function TX(text, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + '">' + text + '</text>'; }
  // the reference's dark tooltip chip with a pointer, popping in at u0
  function chip(text, x, y, u, u0, col) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; var w = text.length * 7.6 + 22; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><rect x="' + f(-w / 2) + '" y="-30" width="' + f(w) + '" height="24" rx="6" fill="#2b2b2b" opacity=".92"/><path d="M-6 -6 L0 2 L6 -6 Z" fill="#2b2b2b" opacity=".92"/>' + TX(text, 0, -13, 13, col || "#fff") + '</g>'; }
  function card(x, y, w, h) { return R(x, y, w, h, "#f6f1e3", 2.6, 12); }
  function ok(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="20" fill="#3aa05a"/><path d="M-9 0 L-2 8 L10 -8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function no(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="20" fill="#d8352a"/><path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>'; }
  function heatW(t, x, y, n, sp, col, h) { var s = ""; for (var i = 0; i < n; i++) { var q = (t * (sp || 0.8) + i / n) % 1, xx = x + (i - (n - 1) / 2) * 12; s += '<path d="M' + f(xx) + ' ' + f(y - q * (h || 40)) + ' q5 -6 0 -12 q-5 -6 0 -12" stroke="' + (col || "#ff7a2f") + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * q)) + '"/>'; } return s; }
  function flames(t, x, y, s, k) { if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * k) + ')">'; for (var i = 0; i < 5; i++) { var fx = (i - 2) * 12, h = 34 + 14 * Math.sin(t * 9 + i * 2) + (i === 2 ? 18 : 0); g += '<path d="M' + (fx - 10) + ' 0 Q' + (fx - 12) + ' ' + f(-h * 0.5) + ' ' + f(fx + Math.sin(t * 7 + i) * 4) + ' ' + f(-h) + ' Q' + (fx + 12) + ' ' + f(-h * 0.5) + ' ' + (fx + 10) + ' 0 Z" fill="' + (i % 2 ? "#ff8a2a" : "#ffb52a") + '" opacity=".95"/>'; } g += '<path d="M-7 0 Q-5 -16 0 -22 Q5 -16 7 0 Z" fill="#fff2a0"/>'; return g + '</g>'; }
  function smoke(t, x, y, k) { var s = ""; for (var i = 0; i < 7; i++) { var q = (t * 0.4 + i / 7) % 1; s += '<circle cx="' + f(x + Math.sin(q * 6 + i) * 12 + q * 16) + '" cy="' + f(y - q * 110) + '" r="' + f(7 + q * 20) + '" fill="#4a4a4a" opacity="' + f(0.45 * (1 - q) * k) + '"/>'; } return s; }
  function spark(t, x, y, s, k) { if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (0.8 + 0.3 * Math.sin(t * 30))) + ')"><circle r="22" fill="#ffe23a" opacity=".35" filter="url(#glow)"/>'; for (var a = 0; a < 8; a++) g += '<path d="M0 0 L' + f(Math.cos(a * 0.785 + t * 4) * 18) + ' ' + f(Math.sin(a * 0.785 + t * 4) * 18) + '" stroke="#ffe23a" stroke-width="2.6" stroke-linecap="round"/>'; return g + '<circle r="5" fill="#fff"/></g>'; }
  // a reference-style thermometer: white tube with ticks, coloured bulb
  function therm(x, y, v, col, ticks) { var h = 130, fill = h * clamp(v), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + R(-9, -h - 10, 18, h + 10, "#fff", 2, 9); s += '<rect x="-4" y="' + f(-fill) + '" width="8" height="' + f(fill) + '" fill="' + col + '"/><circle r="15" fill="' + col + '" stroke="#2b2b2b" stroke-width="2"/>'; (ticks || []).forEach(function (tk) { var yy = -h * tk[0]; s += '<path d="M12 ' + f(yy) + ' h7" stroke="#2b2b2b" stroke-width="1.4"/>' + '<text x="22" y="' + f(yy + 4) + '" style="font:700 10px Noto Sans Arabic;fill:#2b2b2b">' + tk[1] + '</text>'; }); return s + '</g>'; }

  // ── the bedroom ──
  var FY = 470, BT = 400;
  function room(t, o) {
    o = o || {}; var n = !o.day, s = '<rect x="-400" y="-400" width="1160" height="' + (FY + 400) + '" fill="url(#' + (n ? "wallN" : "wallD") + ')"/>';
    for (var k = 0; k < 10; k++) s += '<rect x="' + (-380 + k * 120) + '" y="-400" width="60" height="' + (FY + 400) + '" fill="#fff" opacity="' + (n ? .025 : .06) + '"/>';
    s += '<rect x="-400" y="' + (FY - 26) + '" width="1160" height="26" fill="' + (n ? "#3a3550" : "#d9c8a8") + '"/>';
    // window
    s += '<clipPath id="wn"><rect x="200" y="80" width="130" height="130"/></clipPath><g clip-path="url(#wn)">' + '<rect x="190" y="70" width="150" height="150" fill="url(#' + (n ? "skyN" : "skyD") + ')"/>' + (n ? starsF(t) + '<circle cx="290" cy="120" r="14" fill="#f4f1e4"/><circle cx="290" cy="120" r="26" fill="#f4f1e4" opacity=".15"/>' : '<circle cx="290" cy="120" r="16" fill="#ffe08a"/><circle cx="290" cy="120" r="30" fill="#ffe08a" opacity=".25"/>' + cloudF(t, 230, 160)) + '</g>';
    s += R(200, 80, 130, 130, "none", 6, 2, "#e9e2d2") + '<path d="M265 80 V210 M200 145 H330" stroke="#e9e2d2" stroke-width="5"/>' + R(192, 208, 146, 10, "#e9e2d2", 0, 2);
    // a frame on the wall
    s += R(40, 120, 70, 54, "#c9935a", 0, 3) + R(46, 126, 58, 42, n ? "#4a5a7a" : "#8fc2da", 0, 2) + '<path d="M50 160 L66 142 L78 154 L88 144 L100 160 Z" fill="' + (n ? "#3a6a4a" : "#5aa04a") + '"/>';
    s += '<rect x="-400" y="' + FY + '" width="1160" height="500" fill="url(#' + (n ? "floorN" : "floorD") + ')"/>'; for (var p = 0; p < 12; p++) s += '<path d="M' + (-380 + p * 90) + ' ' + FY + ' L' + (-480 + p * 110) + ' 900" stroke="#000" stroke-width="1" opacity=".12"/>';
    if (o.bed !== false) s += bed(t, o);
    if (o.stand !== false) s += stand(t, o);
    return s + (n ? '<rect x="-400" y="-400" width="1160" height="1400" fill="#0b1430" opacity=".12"/>' : "");
  }
  function starsF(t) { var s = ""; for (var i = 0; i < 14; i++) s += '<circle cx="' + f(205 + hash(i) * 120) + '" cy="' + f(85 + hash(i + 3) * 120) + '" r="1.2" fill="#fff" opacity="' + f(0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))) + '"/>'; return s; }
  function cloudF(t, x, y) { var dx = ((t * 6) % 200) - 60; return '<g transform="translate(' + f(x + dx) + ' ' + y + ')" fill="#fff" opacity=".9"><ellipse rx="24" ry="9"/><ellipse cx="14" cy="-6" rx="14" ry="10"/></g>'; }
  function bed(t, o) {
    var s = R(4, 300, 14, 170, "url(#wood)", 0, 3) + R(0, 296, 22, 10, "#6a4426", 0, 3);
    s += R(10, BT, 250, 34, "#f4f1e8", 0, 8) + R(10, BT + 30, 250, 24, "url(#wood)", 0, 3) + R(18, BT + 54, 10, 16, "#5a3a20", 0, 2) + R(242, BT + 54, 10, 16, "#5a3a20", 0, 2);
    s += '<path d="M96 ' + (BT + 2) + ' Q170 ' + (BT - 10) + ' 262 ' + (BT + 2) + ' V' + (BT + 40) + ' H96 Z" fill="url(#blanket)"/><path d="M96 ' + (BT + 14) + ' H262" stroke="#fff" stroke-width="2" opacity=".35"/>';
    if (o.sleeper) { var br = Math.sin(t * 1.6) * 2; s += '<path d="M100 ' + (BT + 2) + ' Q160 ' + f(BT - 34 + br) + ' 230 ' + (BT - 2) + '" fill="url(#blanket)"/>' + '<ellipse cx="78" cy="' + (BT - 22) + '" rx="17" ry="15" fill="#3a2a20"/><ellipse cx="84" cy="' + (BT - 18) + '" rx="13" ry="12" fill="#e8b48a"/>'; if (!o.mood) s += TX("z", 104 + ((t * 8) % 14), BT - 46 - ((t * 10) % 22), 14, "#bfe0ff", 900); }
    var hot = clamp(o.hot || 0); s += '<path d="M22 ' + BT + ' Q20 ' + (BT - 32) + ' 60 ' + (BT - 32) + ' Q100 ' + (BT - 34) + ' 104 ' + BT + ' Z" fill="url(#pillow)"/>';
    if (o.phoneUnder) { s += '<path d="M60 ' + (BT + 6) + ' C70 ' + (BT + 60) + ' 200 ' + (BT + 40) + ' 280 ' + (BT + 66) + ' L300 ' + FY + '" stroke="#f4f1e8" stroke-width="2.4" fill="none"/>' + R(44, BT - 8, 32, 7, "#1c1c1c", 0, 2); if (hot > 0) s += '<ellipse cx="60" cy="' + (BT - 8) + '" rx="' + f(28 + 8 * Math.sin(t * 6)) + '" ry="14" fill="#ff5a2a" opacity="' + f(0.4 * hot + 0.1 * Math.sin(t * 6)) + '" filter="url(#soft)"/>' + heatW(t, 60, BT - 30, 3, 1.2, "#ff7a2f", 28 * hot); }
    if (o.fire) s += smoke(t, 60, BT - 40, clamp(o.fire)) + flames(t, 60, BT - 4, 0.7, clamp(o.fire));
    return s;
  }
  function stand(t, o) {
    var s = R(276, BT, 76, 70, "url(#wood)", 0, 4) + R(282, BT + 22, 64, 18, "#a87a4a", 0, 3) + '<circle cx="314" cy="' + (BT + 31) + '" r="2.6" fill="#3a2a1a"/>';
    s += R(294, BT - 36, 6, 36, "#5a6068", 0, 2) + '<path d="M280 ' + (BT - 36) + ' L314 ' + (BT - 36) + ' L306 ' + (BT - 60) + ' L288 ' + (BT - 60) + ' Z" fill="#f2c230"/>';
    if (!o.day) s += '<circle cx="297" cy="' + (BT - 30) + '" r="50" fill="#ffe08a" opacity=".16" filter="url(#soft)"/>';
    if (o.phoneStand) s += phone(332, BT - 3, 0.36, t, { charge: true, flat: true }) + '<path d="M346 ' + (BT - 2) + ' Q356 ' + (BT + 30) + ' 352 ' + FY + '" stroke="#f4f1e8" stroke-width="2" fill="none"/>';
    return s;
  }
  // the phone: charge, heat 0..1, swell 0..1, flat, case, lift, cable
  function phone(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')' + (o.flat ? ' rotate(90)' : '') + '">', sw = clamp(o.swell || 0) * 16, h = clamp(o.heat || 0);
    if (h > 0) g += '<rect x="-48" y="-88" width="96" height="176" rx="24" fill="#ff4a1a" opacity="' + f(0.45 * h + 0.15 * Math.sin(t * 6)) + '" filter="url(#soft)"/>';
    if (sw > 0) g += '<path d="M-36 -66 Q' + f(-36 - sw) + ' 0 -36 66" stroke="#ffb52a" stroke-width="4" fill="#3a3f46"/>';
    if (o.case) g += R(-41, -80, 82, 160, "#2f6f9f", 0, 18);
    g += R(-36, -74, 72, 148, "url(#phoneB)", 0, 14) + R(-32, -68, 64, 136, o.off ? "#111" : "url(#phoneS)", 0, 8) + '<rect x="-9" y="-71" width="18" height="3" rx="1.5" fill="#000"/><path d="M-30 -60 L10 -66 L-30 30 Z" fill="#fff" opacity=".06"/>';
    if (o.lift) g += '<path d="M-32 -68 L32 ' + f(-68 - o.lift * 10) + '" stroke="#ff6a5a" stroke-width="3"/>';
    if (o.charge) { var lv = (t * 0.15) % 1; g += R(-13, -20, 26, 44, "none", 2.4, 4, "#7cf29a") + '<rect x="-9" y="' + f(20 - 36 * lv) + '" width="18" height="' + f(36 * lv) + '" fill="#7cf29a"/><path d="M2 -8 L-6 4 H2 L-2 16 L8 0 H0 Z" fill="#fff"/>'; }
    if (!o.flat && o.cable !== false) g += '<path d="M0 74 V120" stroke="#f4f1e8" stroke-width="5"/>';
    if (h > 0) g += heatW(t, 0, -84, 3, 1.1, "#ff7a2f", 36 * h);
    return g + '</g>';
  }
  // the battery up close in a cream card: layers (cathode, separator, anode), soaked in electrolyte
  function cell(t, o) {
    o = o || {}; var s = card(26, 120, 308, 270) + R(46, 146, 268, 224, o.electro ? "#bfe6f7" : "#dfe3e8", 2, 8);
    var Ly = [158, 200, 242, 284, 326], col = ["#4a6a8a", "#2b2b2b"];
    for (var i = 0; i < 5; i++) s += R(56, Ly[i], 248, 22, col[i % 2], 0, 3);
    for (var j = 0; j < 4; j++) { var sy = Ly[j] + 27, on = j === 1 || (o.chain && j < 1 + o.chain * 4), m = clamp(o.melt || 0) * (on ? 1 : 0); s += R(56, sy, 248, 8, "#fbfbf7", 0.8, 2, "#9aa2ac"); if (m > 0) for (var g = 0; g < 3; g++) { var gx = 100 + g * 80 + hash(j * 7 + g) * 30; s += '<ellipse cx="' + f(gx) + '" cy="' + f(sy + 4) + '" rx="' + f(13 * m) + '" ry="5" fill="#ff7a2f"/>'; } }
    if (o.electro) for (var b = 0; b < 12; b++) { var q = (t * 0.3 + b / 12) % 1; s += '<circle cx="' + f(60 + hash(b) * 240) + '" cy="' + f(362 - q * 200) + '" r="' + f(o.boil ? 3 + 4 * q : 2) + '" fill="#fff" opacity="' + f(o.boil ? 0.9 : 0.55) + '"/>'; }
    if (o.ions) for (var k = 0; k < 16; k++) { var p = (t * 0.45 + hash(k)) % 1, lay = (k % 2) * 2; s += '<circle cx="' + f(64 + hash(k + 9) * 232) + '" cy="' + f(lerp(Ly[lay] + 11, Ly[lay + 1] + 11, p)) + '" r="3.6" fill="#f2c230" stroke="#7a5a10" stroke-width="1"/>'; }
    if (o.short) s += spark(t, 130, 236, 1, o.short);
    if (o.chain) for (var c = 0; c < 4; c++) s += spark(t + c, 110 + c * 50, 194 + c * 42, 0.8, clamp(o.chain * 4 - c));
    return s + TX("+", 40, 175, 18, "#c23a26", 900) + TX("−", 40, 217, 18, "#2f6f9f", 900);
  }
  function dim(k) { return '<rect x="-400" y="-400" width="1160" height="1400" fill="#0b0d14" opacity="' + f(k) + '"/>'; }
  function charger(x, y, col, lab) { return '<g transform="translate(' + x + ' ' + y + ')">' + R(-30, -36, 60, 72, col, 2, 10) + '<path d="M-12 -36 V-56 M12 -36 V-56" stroke="#9aa2ac" stroke-width="5"/>' + TX(lab, 0, 6, 13, "#2b2b2b") + '</g>'; }
  var FULL = [180, 330, 1.0];

  // 0 — don't charge your phone under the pillow while you sleep
  shot(0, C([180, 330, 1.0], [80, 370, 2.0]), function (u, d, t) {
    return room(t, { sleeper: true, phoneUnder: true, hot: clamp((u - 1) / 2) }) + chip("تحت المخدة!", 60, BT - 40, u, 1.2, "#ffd23a");
  });
  // 1 — why? we charge it every day and nothing happens
  shot(1, C([180, 300, 1.15], [180, 300, 1.3]), function (u, d, t) {
    return room(t, { day: true, bed: false, stand: false }) + card(80, 170, 200, 220) + phone(180, 270, 0.8, t, { charge: true }) + chip("كل يوم عادي!", 180, 160, u, 1.2);
  });
  // 2 — and what does the pillow have to do with it?
  shot(2, C([70, 380, 2.4], [62, 378, 2.9]), function (u, d, t) {
    return room(t, { phoneUnder: true }) + chip("المخدة؟", 62, BT - 36, u, 0.5);
  });
  // 3 — what's the story? I'll explain in a minute
  shot(3, C([180, 290, 1.0], [180, 300, 1.15]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.35) + phone(180, 290, 1.2, t, {}) + chip("إيه الحكاية؟", 180, 180, u, 0.3, "#ffd23a");
  });
  // 4 — inside: a lithium battery, thin layers rolled together
  shot(4, C([180, 290, 1.1], [180, 290, 1.25]), function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), s = room(t, { bed: false, stand: false }) + dim(0.35) + phone(180, 290, 1.4, t, { cable: false });
    s += '<g opacity="' + f(k) + '">' + R(140, 210, 80, 150, "#2b2e33", 0, 8) + R(148, 222, 64, 126, "url(#bat)", 0, 5) + TX("Li-ion", 180, 290, 14, "#2b2b2b", 900) + '</g>';
    for (var r = 0; r < 6; r++) s += '<circle cx="180" cy="290" r="' + (8 + r * 7) + '" stroke="' + (r % 2 ? "#4a6a8a" : "#2b2b2b") + '" stroke-width="3.4" fill="none" opacity="' + f(clamp((u - 2.6) / 1) * 0.9) + '"/>';
    return s + chip("بطارية ليثيوم", 180, 200, u, 1.2) + chip("طبقات ملفوفة", 180, 410, u, 3.0, "#ffd23a");
  });
  // 5 — positive, negative, and a separator thinner than a hair
  shot(5, C([180, 260, 1.0], [150, 230, 1.35]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, {}) + chip("موجب", 250, 155, u, 0.3) + chip("سالب", 250, 197, u, 1.2) + chip("الفاصل", 140, 230, u, 2.6, "#ffd23a");
  });
  // 6 — all soaked in a liquid that burns easily
  shot(6, C([180, 260, 1.0], [180, 260, 1.1]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, { electro: u > 0.4 }) + flames(t, 290, 400, 0.6, clamp((u - 1.6) / 0.6)) + chip("سائل بيولّع", 180, 112, u, 1.6, "#ffd23a");
  });
  // 7 — charging moves the lithium across, and that makes heat
  shot(7, C([180, 260, 1.05], [180, 250, 1.18]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, { electro: true, ions: true }) + heatW(t, 180, 112, 5, 1, "#ff7a2f", 40) + chip("ليثيوم", 110, 205, u, 0.8, "#ffd23a");
  });
  // 8 — normally the heat leaves the back of the phone into the air
  shot(8, C([300, 380, 2.2], [310, 370, 2.6]), function (u, d, t) {
    var s = room(t, { day: true, bed: false, phoneStand: true });
    for (var i = 0; i < 4; i++) { var q = (t * 0.7 + i / 4) % 1; s += '<path d="M' + f(320 + i * 8) + ' ' + f(BT - 10 - q * 40) + ' q4 -5 0 -10" stroke="#ff8a5a" stroke-width="2" fill="none" opacity="' + f(1 - q) + '"/>'; }
    return s + chip("الحرارة بتطلع", 330, BT - 50, u, 1.0) + ok(350, BT - 90, 0.5, (u - 1.6) / 0.8);
  });
  // 9 — but the pillow is like a blanket: it traps the heat
  shot(9, C([70, 380, 2.6], [62, 380, 3.0]), function (u, d, t) {
    return room(t, { phoneUnder: true, hot: clamp(u / 2) }) + chip("محبوسة!", 62, BT - 40, u, 1.2, "#ff8a6a");
  });
  // 10 — Apple says the iPhone is made to work in air up to 35° only
  shot(10, C([180, 280, 1.0], [180, 285, 1.1]), function (u, d, t) {
    var s = room(t, { bed: false, stand: false }) + dim(0.4) + card(40, 110, 280, 280) + TX("آيفون", 115, 145, 16, "#2b2b2b", 900) + TX("تحت المخدة", 245, 145, 16, "#2b2b2b", 900);
    var tk = [[0.2, "0°"], [0.45, "35°"], [0.7, "60°"], [0.95, "90°"]];
    s += therm(115, 360, 0.45, "#3aa05a", tk) + therm(245, 360, lerp(0.45, 0.95, clamp((u - 1.2) / 2.2)), "#e8452a", tk);
    return s + chip("حد الأمان", 115, 175, u, 0.6) + (u > 3 ? chip("أعلى!", 245, 175, u, 3, "#ff8a6a") : "");
  });
  // 11 — it keeps heating, the battery wears out and swells with gas
  shot(11, C([180, 290, 1.1], [180, 290, 1.35]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.4) + phone(180, 290, 1.3, t, { heat: 0.7, swell: clamp((u - 1.5) / 2), cable: false }) + chip("بتنتفخ!", 180, 180, u, 2.4, "#ff8a6a");
  });
  // 12 — if it keeps rising, the plastic separator starts melting around 130°
  shot(12, C([180, 260, 1.0], [150, 240, 1.35]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, { electro: true, melt: clamp((u - 1) / 2.5) }) + heatW(t, 180, 112, 5, 1.4, "#ff5a2a", 50) + chip("130°", 140, 230, u, 2.4, "#ff8a6a");
  });
  // 13 — positive touches negative: a short inside the battery
  shot(13, C([140, 240, 1.6], [135, 240, 2.0]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, { electro: true, melt: 1, short: clamp((u - 0.8) / 0.4) }) + chip("ماس!", 130, 210, u, 1.0, "#ffd23a");
  });
  // 14 — more heat, another separator melts, another short
  shot(14, C([180, 260, 1.3], [180, 260, 1.0]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + cell(t, { electro: true, melt: 1, short: 1, chain: clamp(u / (d - 0.5)) }) + heatW(t, 180, 112, 6, 1.6, "#ff5a2a", 50);
  });
  // 15 — that's thermal runaway: a chain that doesn't stop by itself
  shot(15, C([180, 260, 1.0], [180, 255, 1.12]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.45) + '<rect x="-400" y="-400" width="1160" height="1400" fill="#ff3a1a" opacity="' + f(0.12 + 0.07 * Math.sin(t * 6)) + '"/>' + cell(t, { electro: true, boil: true, melt: 1, short: 1, chain: 1 }) + chip("الانفلات الحراري", 180, 112, u, 0.6, "#ffd23a");
  });
  // 16 — the liquid boils into burning gas; the battery makes its own oxygen
  shot(16, C([180, 300, 1.0], [180, 290, 1.15]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.5) + phone(180, 300, 1.1, t, { heat: 1, swell: 1, cable: false }) + smoke(t, 180, 200, 1) + flames(t, 180, 215, 1.3, clamp((u - 0.8) / 0.6)) + chip("أكسجين من جواها", 180, 410, u, 2.8, "#ffd23a");
  });
  // 17 — in seconds, next to your head, on a cotton pillow
  shot(17, C([80, 370, 2.0], [110, 360, 1.5]), function (u, d, t) {
    return room(t, { sleeper: true, mood: u > 1 ? 1 : null, phoneUnder: true, hot: 1, fire: clamp((u - 0.4) / 1) }) + chip("جنب راسك!", 84, BT - 70, u, 1.4, "#ff8a6a");
  });
  // 18 — 2016: Samsung recalled about 2.5 million Note 7s
  shot(18, C([180, 300, 1.0], [180, 300, 1.12]), function (u, d, t) {
    var s = room(t, { day: true, bed: false, stand: false }) + R(110, 320, 140, 90, "#c9935a", 0, 4) + '<path d="M110 340 H250" stroke="#a8743e" stroke-width="3"/>' + TX("RECALL", 180, 380, 20, "#c23a26", 900);
    for (var i = 0; i < 6; i++) { var q = clamp((u - i * 0.4) / 1.2); s += phone(lerp(60 + (i % 3) * 120, 180, ease(q)), lerp(170 + Math.floor(i / 3) * 70, 340, ease(q)), 0.32, t, { heat: 0.6, cable: false }); }
    return s + chip("2.5 مليون", 180, 315, u, 1.6, "#ffd23a") + chip("Note 7", 300, 140, u, 0.6);
  });
  // 19 — firefighters in many countries recorded fires from phones charging in bed
  shot(19, C([150, 360, 1.3], [130, 370, 1.6]), function (u, d, t) {
    var s = room(t, { phoneUnder: true, fire: 0.7, hot: 1, stand: false });
    for (var k = 0; k < 12; k++) { var q = (t * 1.5 + k / 12) % 1; s += '<circle cx="' + f(lerp(340, 70, q)) + '" cy="' + f(260 + q * 110 - 40 * Math.sin(q * Math.PI)) + '" r="3" fill="#7fd8ff" opacity=".85"/>'; }
    s += '<path d="M340 260 L380 250" stroke="#c23a26" stroke-width="10" stroke-linecap="round"/>';
    return s + chip("حرايق حقيقية", 180, 250, u, 1.0, "#ff8a6a");
  });
  // 20 — a fake charger adds to the danger: none of the original's protections
  shot(20, C([180, 290, 1.1], [180, 290, 1.22]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.35) + charger(110, 300, "#fbfbf7", "أصلي") + charger(250, 300, "#d9d0b8", "مضروب") + ok(110, 220, 0.8, (u - 0.6) / 0.8) + no(250, 220, 0.8, (u - 1.2) / 0.8) + spark(t, 266, 330, 0.6, u > 1.6 ? 1 : 0) + chip("من غير حماية", 250, 400, u, 2.2, "#ff8a6a");
  });
  // 21 — so what's right?
  shot(21, C([180, 330, 1.0], [180, 330, 1.08]), function (u, d, t) {
    return room(t, { day: true }) + chip("طب الصح إيه؟", 180, 250, u, 0.3, "#ffd23a");
  });
  // 22 — charge it on a table or nightstand, a dry, open surface
  shot(22, C([300, 380, 2.4], [290, 380, 1.8]), function (u, d, t) {
    var s = room(t, { phoneStand: true, sleeper: true, mood: 1 });
    for (var i = 0; i < 3; i++) { var q = (t * 0.7 + i / 3) % 1; s += '<path d="M' + f(322 + i * 8) + ' ' + f(BT - 10 - q * 36) + ' q4 -5 0 -10" stroke="#ffb08a" stroke-width="2" fill="none" opacity="' + f(1 - q) + '"/>'; }
    return s + chip("سطح مكشوف", 316, BT - 50, u, 1.0, "#ffd23a") + ok(345, BT - 90, 0.45, (u - 1.6) / 0.8);
  });
  // 23 — if it gets very hot, take off the case and let it cool
  shot(23, C([180, 290, 1.15], [180, 290, 1.3]), function (u, d, t) {
    var k = clamp((u - 0.6) / 1); return room(t, { bed: false, stand: false }) + dim(0.35) + '<g transform="translate(' + f(lerp(0, -120, ease(k))) + ' ' + f(lerp(0, 30, ease(k))) + ')">' + R(127, 186, 106, 208, "#2f6f9f", 0, 22) + '</g>' + phone(180, 290, 1.3, t, { heat: lerp(0.7, 0, clamp((u - 1.4) / 1.5)), cable: false }) + (u > 2 ? heatW(t, 180, 180, 3, 0.8, "#7fd8ff", 30) : "") + chip("شيل الجراب", 180, 170, u, 0.8, "#ffd23a");
  });
  // 24 — swollen battery or a lifting screen: stop charging, replace it
  shot(24, C([180, 290, 1.25], [180, 290, 1.1]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + dim(0.35) + phone(180, 290, 1.3, t, { swell: 1, lift: 1, cable: false }) + no(250, 190, 0.9, (u - 1.4) / 0.8) + chip("غيّرها!", 180, 410, u, 2.4, "#ff8a6a");
  });
  // 25 — the pillow isn't a charging spot; it's for your head
  shot(25, C([160, 360, 1.5], [180, 340, 1.05]), function (u, d, t) {
    return room(t, { sleeper: true, mood: 1, phoneStand: true }) + chip("المخدة لراسك بس", 84, BT - 56, u, 0.8, "#ffd23a");
  });
  // 26 — tell us what story you want next time
  shot(26, C([180, 330, 1.05], [180, 320, 0.95]), function (u, d, t) {
    return room(t, { sleeper: true, mood: 1, phoneStand: true }) + chip("قولولنا!", 180, 250, u, 0.4, "#ffd23a");
  });

  window.__parts = { room: room, phone: phone, cell: cell, flames: flames, smoke: smoke, spark: spark, chip: chip, card: card, dim: dim };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 4 * Math.sin(t * 1.2), cy = c[1] + 3 * Math.cos(t * 1.2), z = c[2] * (1 + 0.02 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(180 290) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="360" height="640" filter="url(#grain)"/><rect y="400" width="360" height="240" fill="url(#capShade)"/>';
    return i;
  };
})();
