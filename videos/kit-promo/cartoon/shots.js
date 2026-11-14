
  // ── «حزمة فيديوهات الأنيميشن» promo: this episode's pieces ─────────────
  var INK = "#1c1c1c", YEL = "#f2c230", FONT = 'font-family="Noto Sans Arabic, sans-serif"';
  function txt(x, y, s, size, fill, o) {
    o = o || {};
    return '<text x="' + f(x) + '" y="' + f(y) + '" ' + FONT + ' font-weight="' + (o.w || 800) + '" font-size="' + size + '" fill="' + (fill || "#fff") + '" text-anchor="' + (o.a || "middle") + '"' + (o.ltr ? ' direction="ltr"' : '') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '>' + s + '</text>';
  }
  function f2(n) { return (+n).toFixed(2); }
  // dark stage with a warm glow and slow dust that never stops
  function stage(t, gx, gy, col) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gStage)"/>';
    s += '<circle cx="' + f(gx + Math.sin(t * 0.9) * 10) + '" cy="' + f(gy) + '" r="' + f(150 + 12 * Math.sin(t * 1.7)) + '" fill="' + (col || YEL) + '" opacity=".22" filter="url(#soft)"/>';
    for (var i = 0; i < 34; i++) {
      var u = ((t * (0.05 + hash(i) * 0.07) + hash(i + 3)) % 1), x = -80 + hash(i + 11) * 800 + Math.sin(t * 0.8 + i) * 14, y = 400 - u * 460;
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1 + hash(i + 5) * 2.2) + '" fill="#ffe9a0" opacity="' + f2(0.15 + 0.35 * Math.sin(u * Math.PI)) + '"/>';
    }
    return s;
  }
  // a phone playing a few seconds of one of the channel's real videos (sprite sheets of 108×192 frames at 15 fps, made from the episodes' own builds)
  var CLIP = { spTbm: [12, 120], spGas: [10, 90], spBridge: [10, 90], spHeli: [10, 90] };
  function phone(x, y, sc, rot, id, t, k, c) {
    k = k == null ? 1 : k; if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.1 + x * 0.01) * 4) + ') rotate(' + f(rot + Math.sin(t * 1.3 + x) * 1.6) + ') scale(' + (sc * k).toFixed(3) + ')">';
    s += '<rect x="-62" y="-106" width="124" height="212" rx="16" fill="#000" opacity=".35" transform="translate(5 8)" filter="url(#soft2)"/>';
    s += '<rect x="-60" y="-104" width="120" height="208" rx="15" fill="#0b0b0d" stroke="#4a4d55" stroke-width="2"/>';
    var cl = CLIP[id], fr = Math.floor(Math.max(0, c == null ? t : c) * 15) % cl[1], col = fr % cl[0], row = Math.floor(fr / cl[0]);
    s += '<svg x="-54" y="-96" width="108" height="192" viewBox="' + (col * 108) + ' ' + (row * 192) + ' 108 192"><use href="#' + id + '"/></svg>';
    s += '<rect x="-56" y="-98" width="112" height="196" rx="10" fill="none" stroke="#0b0b0d" stroke-width="5"/>';
    // a moving sheen so the screen is never still
    var sh = ((t * 0.35 + x * 0.003) % 1) * 260 - 130;
    s += '<path d="M' + f(sh) + ' -96 l26 0 l-40 192 l-26 0 Z" fill="#fff" opacity=".09" clip-path="url(#scr)"/>';
    s += '<rect x="-16" y="-101" width="32" height="5" rx="2.5" fill="#000"/>';
    return s + '</g>';
  }
  function fmtViews(v, target) { return target >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1000).toFixed(v >= target ? (target % 1000 ? 1 : 0) : 0) + "K"; }
  // view counter pill that counts up to the real number
  function views(x, y, target, u, u0, dur, sc, t) {
    var k = pop((u - u0) / 1.0); if (k <= 0) return "";
    var p = ease(clamp((u - u0) / dur)), v = target * p, lab = fmtViews(v, target), done = p >= 1, pulse = done ? 1 + 0.05 * Math.sin(t * 7) : 1;
    var hw = 34 + lab.length * 7, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + ((sc || 1) * k * pulse).toFixed(3) + ')">';
    s += '<rect x="' + (-hw) + '" y="-19" width="' + (hw * 2) + '" height="38" rx="19" fill="' + (done ? YEL : "#fbfbf7") + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M' + (16 - hw) + ' -9 L' + (30 - hw) + ' 0 L' + (16 - hw) + ' 9 Z" fill="' + INK + '"/>';
    s += '<text x="12" y="8" ' + FONT + ' font-weight="900" font-size="22" fill="' + INK + '" text-anchor="middle" direction="ltr">' + lab + '</text>';
    return s + '</g>';
  }
  function hearts(t, x0, x1, n, seed) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var u = ((t * (0.22 + hash(i + seed) * 0.2) + hash(i * 3 + seed)) % 1), x = lerp(x0, x1, hash(i * 7 + seed)) + Math.sin(t * 2 + i) * 10, y = 350 - u * 330, r = 5 + hash(i + seed + 2) * 6;
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f2(r / 10) + ')" opacity="' + f2(Math.sin(u * Math.PI)) + '"><path d="M0 8 C-14 -2 -8 -12 0 -5 C8 -12 14 -2 0 8 Z" fill="' + (i % 3 ? "#ff5a6e" : YEL) + '" stroke="' + INK + '" stroke-width="1.4"/></g>';
    }
    return s;
  }
  // the viewer: a ball-head character in a hoodie; o: {s, look, arm: -1..1 raised arm, pen}
  function guy(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2.5) + ') rotate(' + f(Math.sin(t * 1.7) * 1.8) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="' + (o.col || "#3f8f7a") + '" stroke="' + INK + '" stroke-width="3"/><path d="M-16 34 L0 58 L16 34" fill="#2f6f5e" stroke="' + INK + '" stroke-width="2"/>';
    s += head(0, -34, 40, mood, t, o.look);
    if (o.arm != null) {
      var ay = 30 - 50 * o.arm + Math.sin(t * 4) * 5, ax = (o.side || 1) * 100;
      s += '<path d="M' + ((o.side || 1) * 44) + ' 64 Q' + f(ax * 0.8) + ' ' + f(ay + 30) + ' ' + f(ax) + ' ' + f(ay) + '" stroke="' + (o.col || "#3f8f7a") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
      if (o.pen) s += '<path d="M' + f(ax - 4) + ' ' + f(ay + 4) + ' l' + ((o.side || 1) * 26) + ' -34" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + f(ax - 4) + ' ' + f(ay + 4) + ' l' + ((o.side || 1) * 26) + ' -34" stroke="' + YEL + '" stroke-width="4" stroke-linecap="round"/>';
    }
    return s + '</g>';
  }
  function stopwatch(x, y, r, t, speed, label) {
    var a = t * speed, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 3) * 3) + ')">';
    s += '<rect x="-5" y="' + f(-r - 12) + '" width="10" height="10" rx="2" fill="' + INK + '"/><circle r="' + (r + 4) + '" fill="' + INK + '"/><circle r="' + r + '" fill="#fbfbf7"/>';
    for (var i = 0; i < 12; i++) { var q = i * Math.PI / 6; s += '<path d="M' + f(Math.sin(q) * (r - 5)) + ' ' + f(-Math.cos(q) * (r - 5)) + ' L' + f(Math.sin(q) * (r - 1)) + ' ' + f(-Math.cos(q) * (r - 1)) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    s += '<path d="M0 0 L' + f(Math.sin(a) * (r - 8)) + ' ' + f(-Math.cos(a) * (r - 8)) + '" stroke="#d8452e" stroke-width="3.4" stroke-linecap="round"/><circle r="3.4" fill="' + INK + '"/>';
    if (label) s += txt(0, r * 0.62, label, r * 0.34, INK, { w: 900 });
    return s + '</g>';
  }
  function coin(x, y, r, rot) { var w = Math.abs(Math.cos(rot)) * r + r * 0.18; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><ellipse rx="' + f(w) + '" ry="' + r + '" fill="url(#gCoin)" stroke="' + INK + '" stroke-width="2"/>' + (w > r * 0.6 ? '<text x="0" y="' + f(r * 0.38) + '" ' + FONT + ' font-weight="900" font-size="' + f(r * 1.1) + '" fill="#7a5a10" text-anchor="middle">$</text>' : '') + '</g>'; }
  function sparkle(x, y, r, t, ph, col) { var k = 0.55 + 0.45 * Math.sin(t * 6 + ph), q = r * k; return '<path d="M' + f(x) + ' ' + f(y - q) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x + q) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y + q) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x - q) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - q) + ' Z" fill="' + (col || "#fff") + '" opacity="' + f2(0.5 + 0.5 * k) + '"/>'; }
  // a sheet of paper; kind: "lines" | "grid" | "titles" | "blank"; p = how much of it is written (0..1)
  function sheet(x, y, w, h, kind, p, t, title, k, rot) {
    k = k == null ? 1 : k; if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.2 + x * 0.02) * 3) + ') rotate(' + f((rot || 0) + Math.sin(t * 1.5 + x) * 1.5) + ') scale(' + k.toFixed(3) + ')">';
    s += '<rect x="' + f(-w / 2 + 4) + '" y="' + f(-h / 2 + 5) + '" width="' + w + '" height="' + h + '" rx="6" fill="#000" opacity=".3"/><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" rx="6" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.6"/>';
    if (title) s += '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="24" rx="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2.6"/>' + txt(0, -h / 2 + 18, title, 14, INK, { w: 900, ltr: /^[A-Za-z]/.test(title) });
    var top = -h / 2 + (title ? 36 : 14), i;
    if (kind === "lines") { var n = Math.floor((h / 2 - top - 6) / 11); for (i = 0; i < n; i++) { var lw = (w - 22) * (0.55 + 0.45 * hash(i + w)), q = clamp(p * n - i); if (q > 0) s += '<rect x="' + f(w / 2 - 11 - lw * q) + '" y="' + f(top + i * 11) + '" width="' + f(lw * q) + '" height="4.5" rx="2" fill="#6a6f7a"/>'; } }
    if (kind === "grid") { var cw = (w - 30) / 2, ch = (h / 2 - top - 16) / 2; for (i = 0; i < 4; i++) { var gx = -w / 2 + 10 + (i % 2) * (cw + 10), gy = top + Math.floor(i / 2) * (ch + 8), q2 = clamp(p * 4 - i); s += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(cw) + '" height="' + f(ch) + '" rx="3" fill="' + (q2 > 0 ? ["#bfe0f0", "#f6d9a0", "#cfe8c0", "#f2c0b8"][i] : "#ece6d4") + '" stroke="' + INK + '" stroke-width="1.6"/>'; if (q2 > 0) s += '<circle cx="' + f(gx + cw / 2) + '" cy="' + f(gy + ch / 2) + '" r="' + f(Math.min(cw, ch) * 0.26 * q2) + '" fill="' + INK + '" opacity=".75"/>'; else s += txt(gx + cw / 2, gy + ch / 2 + 6, "؟", 16, "#a9a391", { w: 900 }); } }
    if (kind === "titles") { for (i = 0; i < 3; i++) { var q3 = clamp(p * 3 - i), bw = (w - 24) * q3; if (q3 > 0) s += '<rect x="' + f(w / 2 - 12 - bw) + '" y="' + f(top + i * 24) + '" width="' + f(bw) + '" height="15" rx="4" fill="' + (i === 0 ? "#d8452e" : "#3f6f8f") + '"/><rect x="' + f(w / 2 - 12 - bw * 0.6) + '" y="' + f(top + i * 24 + 5) + '" width="' + f(bw * 0.5) + '" height="4" rx="2" fill="#fff" opacity=".8"/>'; } }
    if (kind === "blank") s += '<rect x="' + f(w / 2 - 16) + '" y="' + f(top) + '" width="3" height="13" fill="' + INK + '" opacity="' + (Math.sin(t * 9) > 0 ? 1 : 0.15) + '"/>';
    return s + '</g>';
  }
  // one of the four things inside the kit
  function kitCard(x, y, badge, label, col, k, t, rot) {
    if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.3 + x * 0.03) * 4) + ') rotate(' + f((rot || 0) + Math.sin(t * 1.6 + x) * 2) + ') scale(' + k.toFixed(3) + ')">';
    s += '<rect x="-52" y="-58" width="112" height="124" rx="12" fill="#000" opacity=".3"/><rect x="-56" y="-62" width="112" height="124" rx="12" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="-42" y="-48" width="84" height="46" rx="8" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.4"/>' + txt(0, -17, badge, badge.length > 5 ? 15 : 20, INK, { w: 900, ltr: true });
    s += txt(0, 26, label.split("|")[0], 17, "#fff", { w: 900 }) + (label.split("|")[1] ? txt(0, 47, label.split("|")[1], 17, "#fff", { w: 900 }) : "");
    return s + '</g>';
  }
  function hours(k) { return k < 0.25 ? "day" : k < 0.5 ? "dusk" : k < 0.75 ? "night" : "dawn"; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the tunnel video on a phone: 1.3M views
  shot(0, function (u, d) { return [320, lerp(170, 185, ease(u / d)), lerp(1.45, 1.0, ease(u / 2.4))]; }, function (u, d, t) {
    var s = stage(t, 320, 180) + hearts(t, 60, 230, 7, 1) + hearts(t, 410, 580, 7, 9);
    s += phone(320, 172, 1.42, -3, "spTbm", t, 1, t - L(0)) + views(320, 322, 1300000, u, 0.25, 2.3, 1.25, t);
    s += tag("1.3 مليون مشاهدة", 505, 92, u, 1.5, 4, 22, YEL) + tag("تيك توك", 128, 120, u, 2.6, -5, 22);
    return s + sparkle(430, 60, 14, t, 0) + sparkle(205, 250, 11, t, 2) + sparkle(560, 240, 12, t, 4);
  });
  // 1 — drawing and explaining in a minute; you can do it too
  shot(1, function (u, d) { return [lerp(300, 340, ease(u / d)), 180, lerp(1.06, 1.0, u / d)]; }, function (u, d, t) {
    var k = ease(u / 0.9), s = stage(t, 430, 190);
    s += phone(lerp(320, 150, k), lerp(172, 182, k), lerp(1.42, 1.15, k), -5, "spTbm", t, 1, t - L(0)) + views(lerp(320, 150, k), 318, 1300000, 9, 0, 1, 0.95, t);
    s += stopwatch(318, 96, 30, t, 6.283 / 3, "60") + tag("رسم وشرح في دقيقة", 470, 44, u, 0.3, -2, 21);
    s += guy(480, 232, t, u < 1.9 ? "curious" : "happy", { s: 0.86, look: u < 1.9 ? -1 : 0, arm: u < 1.9 ? 0.2 : 1, side: 1 });
    return s + tag("وإنت كمان تقدر!", 330, 322, u, 2.0, 3, 22, YEL) + sparkle(585, 120, 12, t, 1);
  });
  // 2 — the brand line
  shot(2, function (u, d) { return [320, 180, lerp(1.12, 1.0, ease(u / d))]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e7d0"/>', i;
    for (i = 0; i < 12; i++) { var a = i * Math.PI / 6 + t * 0.35; s += '<path d="M320 180 L' + f(320 + Math.cos(a) * 900) + ' ' + f(180 + Math.sin(a) * 900) + ' L' + f(320 + Math.cos(a + 0.26) * 900) + ' ' + f(180 + Math.sin(a + 0.26) * 900) + ' Z" fill="#ecd9b4"/>'; }
    var k = pop(u / 0.9), b = 1 + 0.04 * Math.sin(t * 5);
    s += '<g transform="translate(250 165) rotate(' + f(-4 + Math.sin(t * 2) * 2) + ') scale(' + (k * b).toFixed(3) + ')"><path d="M-170 -70 Q-170 -96 -144 -96 H144 Q170 -96 170 -70 V40 Q170 66 144 66 H-60 L-104 106 L-98 66 H-144 Q-170 66 -170 40 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="5"/>' + txt(0, 6, "إيه الحكاية؟", 52, INK, { w: 900 }) + '</g>';
    s += stopwatch(505, 200, 52, t, 6.283 / 2, "30 ث");
    return s + tag("في نص دقيقة", 500, 300, u, 0.9, 3, 22, YEL);
  });
  // 3 — the channel earns dollars from its views
  shot(3, function (u, d) { return [lerp(300, 335, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = stage(t, 440, 200), i;
    // the views chart climbing
    s += '<rect x="56" y="70" width="230" height="230" rx="14" fill="#14161c" stroke="#4a4d55" stroke-width="2.5"/>' + txt(170, 100, "المشاهدات", 17, "#d9d4c8", { w: 800 });
    for (i = 0; i < 5; i++) { var h = (34 + i * 30) * ease(clamp(u * 1.6 - i * 0.16)) * (1 + 0.05 * Math.sin(t * 5 + i)); s += '<rect x="' + (80 + i * 40) + '" y="' + f(282 - h) + '" width="26" height="' + f(h) + '" rx="5" fill="' + (i === 4 ? YEL : "#5d93ad") + '" stroke="' + INK + '" stroke-width="2"/>'; }
    s += arrow(86, 240, lerp(86, 262, ease(u / 1.4)), lerp(240, 118, ease(u / 1.4)), "#5bbf6a", 6, 1);
    // dollars dropping into the jar
    s += '<path d="M392 196 H500 V300 Q500 318 482 318 H410 Q392 318 392 300 Z" fill="#cfe6f2" opacity=".35" stroke="#fbfbf7" stroke-width="3.5"/><rect x="384" y="182" width="124" height="16" rx="6" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.6"/>';
    var fill = 20 + 70 * clamp(u / d);
    for (i = 0; i < 9; i++) if (i * 10 < fill) s += coin(412 + (i % 3) * 34 + hash(i) * 6, 306 - Math.floor(i / 3) * 22 - hash(i + 4) * 5, 13, 0.3 + i);
    for (i = 0; i < 6; i++) { var q = ((t * 0.9 + i / 6) % 1); s += coin(446 + Math.sin(i * 2.4) * 34, lerp(20, 200, q * q), 14, t * 6 + i); }
    return s + tag("دولارات", 545, 110, u, 0.5, 4, 25, YEL) + sparkle(360, 80, 12, t, 0) + sparkle(560, 250, 11, t, 3);
  });
  // 4 — three more videos with their real numbers (the times come from the voice)
  var T4 = [0, 2.8, 5.06];
  shot(4, function (u, d) {
    var x = u < T4[1] ? lerp(140, 160, u / T4[1]) : u < T4[2] ? lerp(160, 320, ease((u - T4[1]) / 0.8)) : lerp(320, 470, ease((u - T4[2]) / 0.8));
    var z = lerp(1.22, 1.0, ease((u - 7.0) / 1.2)); if (u > 7.0) x = lerp(470, 320, ease((u - 7.0) / 1.2));
    return [x, lerp(176, 184, u / d), z];
  }, function (u, d, t) {
    var s = stage(t, 320, 180) + hearts(t, 20, 620, 12, 21), ids = ["spGas", "spBridge", "spHeli"], n = [520000, 476300, 384400], xs = [130, 320, 510];
    for (var i = 0; i < 3; i++) s += phone(xs[i], 160, 1.08, (i - 1) * 4, ids[i], t, pop((u - T4[i]) / 0.9), u - T4[i]) + views(xs[i], 296, n[i], u, T4[i] + 0.3, 1.6, 0.95, t);
    return s + sparkle(225, 60, 12, t, 0) + sparkle(415, 300, 11, t, 2) + sparkle(600, 70, 12, t, 4) + sparkle(40, 290, 10, t, 5);
  });
  // 5 — the hard part: the script and the storyboard take hours
  shot(5, function (u, d) { return [lerp(335, 300, ease(u / d)), lerp(170, 185, u / d), lerp(1.1, 1.0, ease(u / d))]; }, function (u, d, t) {
    var hk = (u / d * 1.6) % 1, s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gWall)"/>';
    // the window: the day goes by
    s += '<g><rect x="52" y="36" width="150" height="120" rx="6" fill="url(#sky-' + hours(hk) + ')" stroke="#fbfbf7" stroke-width="6"/>' + (hk > 0.5 && hk < 0.75 ? '<circle cx="160" cy="70" r="14" fill="#f4f1e4"/>' : '<circle cx="' + f(70 + ((hk * 4) % 1) * 110) + '" cy="' + f(86 - Math.sin(((hk * 4) % 1) * Math.PI) * 30) + '" r="13" fill="#ffd98a"/>') + '<path d="M127 36 V156 M52 96 H202" stroke="#fbfbf7" stroke-width="4"/></g>';
    // wall clock racing
    var ca = t * 5;
    s += '<g transform="translate(300 84)"><circle r="40" fill="' + INK + '"/><circle r="35" fill="#fbfbf7"/><path d="M0 0 L' + f(Math.sin(ca) * 27) + ' ' + f(-Math.cos(ca) * 27) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(ca / 12) * 18) + ' ' + f(-Math.cos(ca / 12) * 18) + '" stroke="#d8452e" stroke-width="4.4" stroke-linecap="round"/><circle r="3.6" fill="' + INK + '"/></g>';
    s += sheet(432, 108, 104, 128, "blank", 0, t, "سكريبت", pop((u - 1.5) / 0.9), -4) + sheet(540, 150, 108, 128, "grid", 0, t, "storyboard", pop((u - 2.4) / 0.9), 5);
    s += guy(300, 236, t, u < 3.4 ? "worry" : "dizzy", { s: 0.8, look: 1 });
    s += '<rect x="-400" y="296" width="1440" height="200" fill="url(#gDesk)"/><path d="M-400 296 H1040" stroke="' + INK + '" stroke-width="4"/>';
    for (var i = 0; i < 5; i++) { var q = clamp((u - 0.8 - i * 0.7) / 0.7); if (q > 0) { var bx = lerp(330, 90 + i * 115, ease(q)), by = 300 - Math.sin(q * Math.PI) * 70 + 8 + Math.abs(Math.sin(t * 3 + i)) * -5; s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(t * 40 + i * 50) + ')"><path d="M-12 -4 L-4 -12 L8 -9 L13 2 L5 12 L-8 10 Z" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2"/><path d="M-5 -3 L4 2 M-2 6 L6 -5" stroke="#a9a391" stroke-width="1.4"/></g>'; } }
    return s + tag("ساعات!", 165, 232, u, 3.4, -5, 26, "#f2a0a0");
  });
  // 6 — Claude writes them in minutes
  shot(6, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.14, 1.02, ease(u / d))]; }, function (u, d, t) {
    var s = stage(t, 300, 170, "#e8742e"), i;
    s += '<path d="M118 292 H482 L512 322 H88 Z" fill="#8a9098" stroke="' + INK + '" stroke-width="3"/><rect x="128" y="52" width="344" height="240" rx="12" fill="#0b0b0d" stroke="#8a9098" stroke-width="5"/><rect x="140" y="64" width="320" height="216" rx="5" fill="#fbf7ea"/>';
    s += '<rect x="140" y="64" width="320" height="34" fill="#f1e6cf"/><circle cx="438" cy="81" r="9" fill="#e8742e" stroke="' + INK + '" stroke-width="2"/>' + txt(418, 88, "Claude", 19, INK, { w: 900, ltr: true, a: "end" });
    for (i = 0; i < 9; i++) { var lw = 280 * (0.5 + 0.5 * hash(i + 30)), q = clamp(u * 5.5 - i * 0.55); if (q > 0) s += '<rect x="' + f(448 - lw * q) + '" y="' + (112 + i * 18) + '" width="' + f(lw * q) + '" height="8" rx="3.5" fill="' + (i === 0 || i === 5 ? "#d8452e" : "#6a6f7a") + '"/>'; }
    var cur = Math.min(8, Math.floor(u * 10)); s += '<rect x="' + f(448 - 280 * (0.5 + 0.5 * hash(cur + 30)) * clamp(u * 5.5 - cur * 0.55) - 6) + '" y="' + (109 + cur * 18) + '" width="3" height="14" fill="#e8742e" opacity="' + (Math.sin(t * 14) > 0 ? 1 : 0.2) + '"/>';
    s += guy(566, 250, t, "happy", { s: 0.62, look: -1, arm: 1, side: -1 });
    return s + stopwatch(66, 150, 34, t, 6.283 / 1.2, "") + tag("في دقايق", 70, 230, u, 0.9, -4, 23, YEL) + sparkle(110, 60, 13, t, 0) + sparkle(520, 90, 12, t, 2) + sparkle(540, 330, 10, t, 4);
  });
  // 7 — the kit: four things come out of the box
  var T7 = [2.2, 3.0, 3.75, 4.5];
  shot(7, function (u, d) { return [320, lerp(215, 172, ease(u / 2.4)), lerp(1.3, 1.0, ease(u / 2.6))]; }, function (u, d, t) {
    var s = stage(t, 320, 230), open = ease(u / 1.6), wig = Math.sin(t * 9) * (u < 1.4 ? 3 : 0.8);
    var items = [["SKILL", "مهارة|جاهزة", "#d8452e"], ["PDF", "دليل|عربي", "#3f6f8f"], ["MP4", "فيديو|شرح", "#3f8f7a"], ["PROMPTS", "برومبتات", "#8a5fb0"]], xs = [545, 395, 245, 95];
    // light out of the open box
    s += '<path d="M250 262 L' + f(250 - 150 * open) + ' -40 H' + f(390 + 150 * open) + ' L390 262 Z" fill="#ffe9a0" opacity="' + f2(0.16 * open + 0.03 * Math.sin(t * 6)) + '"/>';
    for (var i = 0; i < 4; i++) { var q = ease((u - T7[i]) / 0.7); if (u > T7[i]) s += kitCard(lerp(320, xs[i], q), lerp(250, 112, q), items[i][0], items[i][1], items[i][2], lerp(0.3, 1, q), t, (i - 1.5) * -3); }
    s += '<g transform="translate(320 300) rotate(' + f(wig) + ')"><path d="M-78 -40 H78 V44 H-78 Z" fill="url(#gBox)" stroke="' + INK + '" stroke-width="3.4"/><path d="M-78 -40 L' + f(-78 - 46 * open) + ' ' + f(-40 - 30 * open) + ' L' + f(-8 - 40 * open) + ' ' + f(-40 - 30 * open) + ' L0 -40 Z" fill="#c4935a" stroke="' + INK + '" stroke-width="3"/><path d="M78 -40 L' + f(78 + 46 * open) + ' ' + f(-40 - 30 * open) + ' L' + f(8 + 40 * open) + ' ' + f(-40 - 30 * open) + ' L0 -40 Z" fill="#c4935a" stroke="' + INK + '" stroke-width="3"/><rect x="-40" y="-8" width="80" height="34" rx="6" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.4"/>' + txt(0, 17, "الحزمة", 19, INK, { w: 900 }) + '</g>';
    if (u < T7[0] + 0.3) s += tag("الطريقة كلها في حزمة", 320, 150, u, 0.5, -2, 23, YEL);
    return s + sparkle(190, 250, 13, t, 0) + sparkle(455, 240, 12, t, 2) + sparkle(320, 30, 12, t, 4);
  });
  // 8 — type the topic, get the script, the scenes and the titles
  var T8 = [1.9, 2.6, 3.2];
  shot(8, function (u, d) { return [320, lerp(120, 180, ease((u - 1.2) / 1.2)), lerp(1.4, 1.0, ease((u - 1.2) / 1.2))]; }, function (u, d, t) {
    var s = stage(t, 320, 210), topic = "ليه السما زرقا؟", n = Math.min(topic.length, Math.floor(u * 11)), sent = u > 1.5, i;
    s += '<rect x="116" y="38" width="408" height="52" rx="26" fill="#fbf7ea" stroke="' + INK + '" stroke-width="3.4"/>' + txt(470, 72, topic.slice(0, n), 23, INK, { w: 800, a: "start" });
    s += '<g transform="translate(150 64) scale(' + (sent ? 1 + 0.12 * Math.sin(t * 8) : 1).toFixed(3) + ')"><circle r="19" fill="' + (sent ? "#e8742e" : "#c9c2ad") + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M0 9 V-8 M-7 -1 L0 -9 L7 -1" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
    var xs = [500, 320, 140], kinds = ["lines", "grid", "titles"], names = ["السكريبت", "المشاهد", "العناوين"];
    for (i = 0; i < 3; i++) {
      if (sent) for (var q = 0; q < 5; q++) { var w = ((t * 1.4 + q / 5) % 1); s += '<circle cx="' + f(lerp(320, xs[i], w)) + '" cy="' + f(lerp(92, 150, w)) + '" r="3.4" fill="' + YEL + '" opacity="' + f2(Math.sin(w * Math.PI)) + '"/>'; }
      s += sheet(xs[i], 232, 138, 150, kinds[i], clamp((u - T8[i] - 0.2) / 1.0), t, names[i], pop((u - T8[i]) / 0.9), (1 - i) * 3);
    }
    return s + sparkle(60, 120, 12, t, 0) + sparkle(585, 110, 12, t, 3);
  });
  // 9 — drawing and editing are yours, with any tool
  shot(9, function (u, d) { return [lerp(305, 335, u / d), 180, lerp(1.06, 1.0, u / d)]; }, function (u, d, t) {
    var s = stage(t, 220, 170), p = clamp(u / 1.6), dl = 420;
    s += '<rect x="56" y="40" width="300" height="190" rx="10" fill="#fbf7ea" stroke="' + INK + '" stroke-width="3.4"/>';
    s += '<path d="M90 190 H322 M130 190 V120 L176 84 L222 120 V190 M162 190 V150 H190 V190" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + dl + '" stroke-dashoffset="' + f(dl * (1 - p)) + '"/>';
    s += '<circle cx="286" cy="88" r="' + f(20 * p) + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>';
    // the editing timeline
    s += '<rect x="56" y="250" width="300" height="74" rx="8" fill="#14161c" stroke="#4a4d55" stroke-width="2.5"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="' + (66 + i * 71) + '" y="262" width="64" height="24" rx="4" fill="' + ["#5d93ad", "#3f8f7a", "#d8452e", "#8a5fb0"][i] + '"/>';
    s += '<path d="M66 304 ' + Array.apply(null, Array(36)).map(function (_, k) { return "L" + (66 + k * 8) + " " + f(304 + Math.sin(k * 1.3 + t * 6) * 7 * hash(k)); }).join(" ").replace("L", "L") + '" stroke="#5bbf6a" stroke-width="2.4" fill="none"/>';
    var ph = 66 + ((t * 70) % 280); s += '<path d="M' + f(ph) + ' 254 V320" stroke="' + YEL + '" stroke-width="3"/><path d="M' + f(ph - 6) + ' 252 h12 l-6 9 Z" fill="' + YEL + '"/>';
    s += guy(490, 236, t, "happy", { s: 0.84, look: -1, arm: 0.5, side: -1, pen: true });
    return s + tag("الرسم والمونتاج عليك", 478, 52, u, 0.3, 3, 20) + sparkle(600, 130, 12, t, 1) + sparkle(390, 110, 11, t, 3);
  });
  // 10 — the price and the link in the bio
  shot(10, function (u, d) { return [lerp(300, 330, clamp(u / 5)), 180, lerp(1.1, 1.0, ease(u / 2))]; }, function (u, d, t) {
    var s = stage(t, 200, 170) + hearts(t, 30, 330, 6, 40), sw = Math.sin(t * 2.4) * 6, k = pop(u / 0.9), b = 1 + 0.05 * Math.sin(t * 6);
    s += '<g transform="translate(200 60) rotate(' + f(sw) + ') scale(' + k.toFixed(3) + ')"><path d="M0 0 V44" stroke="#d9d4c8" stroke-width="3"/><path d="M-124 60 L-96 34 H124 V150 H-96 L-124 124 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="4"/><circle cx="-98" cy="92" r="7" fill="#1c1d26" stroke="' + INK + '" stroke-width="2.4"/>' + '<text x="20" y="112" ' + FONT + ' font-weight="900" font-size="58" fill="' + INK + '" text-anchor="middle" direction="ltr" transform="scale(' + b.toFixed(3) + ')">$14.99</text></g>';
    // the profile with the link highlighted
    var px = 480, hl = 0.5 + 0.5 * Math.sin(t * 7);
    s += '<g transform="translate(' + px + ' ' + f(180 + Math.sin(t * 2) * 4) + ') rotate(' + f(3 + Math.sin(t * 1.3) * 1.5) + ')"><rect x="-84" y="-146" width="176" height="300" rx="20" fill="#000" opacity=".35"/><rect x="-88" y="-150" width="176" height="300" rx="20" fill="#0b0b0d" stroke="#4a4d55" stroke-width="2.5"/><rect x="-78" y="-138" width="156" height="276" rx="11" fill="#fbf7ea"/>';
    s += '<circle cx="0" cy="-92" r="27" fill="#f3e7d0" stroke="' + INK + '" stroke-width="2.6"/>' + txt(0, -84, "؟", 30, "#d8452e", { w: 900 }) + txt(0, -46, "إيه الحكاية؟", 17, INK, { w: 900 });
    s += '<rect x="-56" y="-32" width="112" height="6" rx="3" fill="#b9b3a1"/><rect x="-40" y="-18" width="80" height="6" rx="3" fill="#b9b3a1"/>';
    s += '<rect x="-68" y="4" width="136" height="38" rx="10" fill="' + YEL + '" opacity="' + f2(0.55 + 0.45 * hl) + '" stroke="' + INK + '" stroke-width="2.8"/>' + txt(4, 30, "🔗 اللينك", 18, INK, { w: 900 });
    for (var i = 0; i < 6; i++) s += '<rect x="' + (-72 + (i % 3) * 50) + '" y="' + (58 + Math.floor(i / 3) * 40) + '" width="44" height="34" rx="4" fill="' + ["#5d93ad", "#d9a86a", "#3f8f7a", "#d8452e", "#8a5fb0", "#6a6f7a"][i] + '"/>';
    s += '</g>';
    var ay = Math.abs(Math.sin(t * 5)) * 14;
    if (u > 1.4) s += arrow(330 - ay, 252 + ay * 0.3, 392 - ay, 214 + ay * 0.3, "#d8452e", 9, 1);
    return s + tag("اللينك في البايو", 208, 300, u, 1.5, -3, 24) + sparkle(60, 60, 13, t, 0) + sparkle(360, 60, 12, t, 2) + sparkle(600, 330, 11, t, 4);
  });

  window.__parts = { stage: stage, phone: phone, views: views, guy: guy, kitCard: kitCard, sheet: sheet, tag: tag, coin: coin, sparkle: sparkle };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
