  // ── new pieces for this episode ─────────────────────────
  var VOICE = "#f2a93b";                         // the colour of "your voice" in every form it takes
  // a person from the chest up, holding a phone to the ear; o: {mood, shirt, scarf, talk, look, phone:"ear"|"hand"|null}
  function person(x, y, t, sc, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6 + x) * 2) + ') scale(' + sc + ') rotate(' + f(Math.sin(t * 1.4 + x) * 1.5) + ')">';
    s += '<path d="M-62 130 C-66 52 -40 30 0 30 C40 30 66 52 62 130 Z" fill="' + (o.shirt || "#3f6f8f") + '" stroke="#1c1c1c" stroke-width="3"/>';
    if (o.scarf) s += '<path d="M-52 -40 C-56 -96 56 -96 52 -40 C56 0 40 30 0 34 C-40 30 -56 0 -52 -40 Z" fill="' + o.scarf + '" stroke="#1c1c1c" stroke-width="3"/>';
    s += head(0, -36, 40, o.mood || "n", t, o.look);
    if (o.talk) { var m = 0.5 + 0.5 * Math.abs(Math.sin(t * 11)); s += '<ellipse cx="' + f((o.look || 0) * 8) + '" cy="-22" rx="' + f(6 + 3 * m) + '" ry="' + f(2 + 5 * m) + '" fill="#1c1c1c"/>'; }
    if (o.phone === "ear") s += '<path d="M46 110 Q74 40 46 -20" stroke="' + (o.shirt || "#3f6f8f") + '" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="30" y="-62" width="22" height="44" rx="5" fill="#2b2f34" stroke="#1c1c1c" stroke-width="2.4"/><circle cx="44" cy="-26" r="9" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>';
    if (o.phone === "hand") s += '<path d="M46 110 Q70 70 30 60" stroke="' + (o.shirt || "#3f6f8f") + '" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="2" y="20" width="30" height="52" rx="6" fill="#2b2f34" stroke="#1c1c1c" stroke-width="2.4"/><rect x="6" y="26" width="22" height="38" rx="3" fill="#8fc2da"/><circle cx="26" cy="62" r="9" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // a phone, big, front view; o: {screen, xray, glow}
  function phone(x, y, sc, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><rect x="-46" y="-90" width="92" height="180" rx="16" fill="#2b2f34" stroke="#1c1c1c" stroke-width="3"/>';
    s += '<rect x="-40" y="-80" width="80" height="150" rx="8" fill="' + (o.xray ? "#1e3458" : "url(#scr)") + '"/>';
    if (o.xray) { s += '<rect x="-30" y="-60" width="60" height="70" rx="6" fill="#2f4a72" stroke="#8fc2da" stroke-width="1.4"/><rect x="-14" y="-30" width="28" height="20" fill="#4a5e80" stroke="#8fc2da"/>';
      s += '<path d="M-36 -76 H36 V-66 H-36 Z" fill="none" stroke="' + (o.glow ? VOICE : "#8fc2da") + '" stroke-width="' + (o.glow ? 3 : 1.6) + '"/><text x="0" y="-82" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#f4f1e8">أنتينا</text>'; }
    s += '<rect x="-10" y="78" width="20" height="4" rx="2" fill="#5a5f66"/>';
    return s + '</g>';
  }
  function tower(x, y, sc, t, on) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')"><path d="M-30 0 L-6 -170 L6 -170 L30 0" fill="none" stroke="#5a5f66" stroke-width="5"/><path d="M-24 -40 L20 -80 M24 -40 L-20 -80 M-16 -90 L12 -130 M16 -90 L-12 -130" stroke="#5a5f66" stroke-width="2.4"/>';
    for (var k = 0; k < 3; k++) s += '<rect x="' + (-22 + k * 16) + '" y="-196" width="12" height="34" rx="3" fill="#e9e4d8" stroke="#1c1c1c" stroke-width="2"/>';
    s += '<circle cx="0" cy="-206" r="5" fill="#ff3b2f" opacity="' + (Math.sin(t * 4) > 0 ? 1 : 0.3) + '"/>';
    if (on) for (var w = 0; w < 3; w++) { var u = ((t * 1.2 + w / 3) % 1); s += '<path d="M' + f(-30 - u * 60) + ' ' + f(-196 - u * 30) + ' Q' + f(-40 - u * 70) + ' -180 ' + f(-30 - u * 60) + ' ' + f(-164 + u * 30) + ' M' + f(30 + u * 60) + ' ' + f(-196 - u * 30) + ' Q' + f(40 + u * 70) + ' -180 ' + f(30 + u * 60) + ' ' + f(-164 + u * 30) + '" stroke="' + VOICE + '" stroke-width="3" fill="none" opacity="' + f(1 - u) + '"/>'; }
    return s + '</g>';
  }
  // radio rings travelling from a to b
  function radio(t, ax, ay, bx, by, n, sp) { var s = "", a = Math.atan2(by - ay, bx - ax); for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), x = lerp(ax, bx, u), y = lerp(ay, by, u), r = 10 + 8 * Math.sin(u * Math.PI); s += '<path d="M' + f(x + Math.cos(a + 1.1) * r) + ' ' + f(y + Math.sin(a + 1.1) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(a - 1.1) * r) + ' ' + f(y + Math.sin(a - 1.1) * r) + '" stroke="' + VOICE + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u)) + '"/>'; } return s; }
  // a voice wave drawn along a line; mode: "smooth" | "bars" (samples) ; p: how much is drawn
  function wave(x0, x1, y, amp, t, p, col, w) {
    p = clamp(p == null ? 1 : p); var d = "", n = 80;
    for (var i = 0; i <= n * p; i++) { var x = lerp(x0, x1, i / n), k = i / n; var v = Math.sin(k * 18 - t * 6) * 0.6 + Math.sin(k * 41 - t * 9) * 0.3 + Math.sin(k * 7 + t) * 0.25; d += (i ? " L" : "M") + f(x) + " " + f(y - v * amp * Math.sin(Math.PI * k)); }
    return d ? '<path d="' + d + '" stroke="' + (col || VOICE) + '" stroke-width="' + (w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : "";
  }
  function waveY(k, t) { return Math.sin(k * 18 - t * 6) * 0.6 + Math.sin(k * 41 - t * 9) * 0.3 + Math.sin(k * 7 + t) * 0.25; }
  // air as rows of dots squeezed together and spread apart (a sound wave)
  function airDots(x0, x1, y0, y1, t, amp) { var s = ""; for (var r = 0; r < 6; r++) for (var c = 0; c < 26; c++) { var bx = lerp(x0, x1, c / 25), by = lerp(y0, y1, r / 5), dx = Math.sin(c * 0.7 - t * 7) * (amp || 7); s += '<circle cx="' + f(bx + dx) + '" cy="' + f(by) + '" r="3" fill="#5d93ad" opacity=".85"/>'; } return s; }
  function bits(x, y, t, n, sc, col) { var s = ""; for (var i = 0; i < n; i++) { var b = hash(i * 7 + Math.floor(t * 4)) > 0.5 ? "1" : "0"; s += '<text x="' + f(x + i * 16 * sc) + '" y="' + f(y) + '" style="font:800 ' + f(18 * sc) + 'px Noto Serif;fill:' + (col || VOICE) + ';direction:ltr">' + b + '</text>'; } return s; }
  function room(t, kind) {   // a cosy room: wall, window with sky, poster, shelf, lamp
    var night = kind === "night", s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + (night ? "#3b4566" : "#efd9b8") + '"/><rect x="-400" y="270" width="1440" height="400" fill="' + (night ? "#2c3350" : "#c9a27a") + '"/>';
    s += '<rect x="410" y="50" width="160" height="130" rx="6" fill="' + (night ? "#1e3458" : "#bfe0f2") + '" stroke="#5b4636" stroke-width="6"/>' + (night ? stars(t).replace(/cx="(-?[\d.]+)" cy="(-?[\d.]+)"/g, function (m, a, b) { a = +a; b = +b; return (a > 420 && a < 560 && b > 60 && b < 170) ? m : 'cx="-999" cy="-999"'; }) : clouds(t, 12, 70, 2, 0.9, 0.4).replace(/<g filter/g, '<g clip-path="url(#win)" filter'));
    s += '<path d="M490 50 V180 M410 115 H570" stroke="#5b4636" stroke-width="4"/>';
    s += '<rect x="60" y="60" width="90" height="110" fill="#e2b035" stroke="#5b4636" stroke-width="3"/><circle cx="105" cy="105" r="26" fill="#c23a26"/><rect x="190" y="150" width="140" height="10" fill="#8c6440"/><rect x="200" y="122" width="20" height="28" fill="#4f8f5a"/><rect x="226" y="128" width="14" height="22" fill="#2f6f9f"/><circle cx="300" cy="138" r="12" fill="#b9442a"/>';
    return s;
  }

  // graph paper that keeps drifting, so even a plain backdrop is never frozen
  function paper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — Ahmed on a call; a little voice-wave tries to fly out the window… "not like you think"
  shot(0, function (u, d) { return [lerp(260, 360, u / d), 190, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var s = room(t) + person(270, 230, t, 1.0, { talk: true, phone: "ear", mood: "happy", look: 1 });
    var fly = clamp((u - 0.6) / 2.4); s += '<g opacity="' + f(1 - clamp((u - 3.2) * 2)) + '">' + wave(300, lerp(320, 470, fly), lerp(150, 110, fly), 16, t, 1) + '</g>';
    if (u > 3.0) s += '<g transform="translate(470 110)"><path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke="#c23a26" stroke-width="7" stroke-linecap="round" opacity="' + f(pop((u - 3.0) / 1.2)) + '"/></g>';
    return s + tag("ألو!", 160, 70, u, 0.3, -4, 24) + tag("مش بيطير كده!", 470, 220, u, 3.1, 3, 18);
  });
  // 1 — it becomes numbers, invisible light, and goes underground
  shot(1, function (u, d) { return [lerp(200, 440, u / d), 180, lerp(1.25, 1.0, u / d)]; }, function (u, d, t) {
    var s = paper(t), step = d / 3;
    var xs = [120, 320, 520], tx = ["أرقام", "نور مبيتشافش", "تحت الأرض"];
    for (var k = 0; k < 3; k++) { var on = clamp((u - k * step) / 0.4), sc = pop((u - k * step) / 1.2); if (sc <= 0) continue;
      s += '<g transform="translate(' + xs[k] + ' ' + f(160 + Math.sin(t * 3 + k) * 6) + ') scale(' + f(sc) + ')"><circle r="70" fill="#fff" stroke="#1c1c1c" stroke-width="3"/>';
      if (k === 0) s += bits(-44, 8, t, 6, 0.9);
      if (k === 1) for (var w = 0; w < 4; w++) { var o = ((t * 1.3 + w / 4) % 1); s += '<circle r="' + f(10 + o * 52) + '" fill="none" stroke="' + VOICE + '" stroke-width="3" opacity="' + f(1 - o) + '"/>'; }
      if (k === 2) s += '<rect x="-60" y="-10" width="120" height="70" fill="#8c6440"/><path d="M-60 -10 H60" stroke="#4f8f5a" stroke-width="8"/><rect x="-50" y="22" width="100" height="14" rx="7" fill="#2b2f34"/>' + [0, 1, 2].map(function (j) { var q = ((t * 1.6 + j / 3) % 1); return '<circle cx="' + f(-46 + q * 92) + '" cy="29" r="4" fill="' + VOICE + '"/>'; }).join("");
      s += '</g>' + tag(tx[k], xs[k], 270, u, k * step + 0.1, k % 2 ? 3 : -3, 18);
      if (k > 0) s += arrow(xs[k - 1] + 76, 160, xs[k] - 76, 160, VOICE, 6, on);
    }
    return s;
  });
  // 2 — all of that in under a quarter of a second
  shot(2, function (u, d) { return [320, 180, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 20, 5, 0.9) + '<g transform="translate(' + f(-u * 8) + ' 0)">' + city(t, 300, 100, "#b9cfdc", "#e9e4d8", 31) + '</g>';
    var tt = Math.min(0.25, u * 0.25); s += '<g transform="translate(320 160) scale(' + f(1 + 0.06 * Math.sin(t * 6) * clamp((u - 0.9) * 10)) + ')"><circle r="70" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="4"/><path d="M0 0 L' + f(Math.sin(tt / 0.25 * Math.PI * 0.5) * 56) + ' ' + f(-Math.cos(tt / 0.25 * Math.PI * 0.5) * 56) + '" stroke="#c23a26" stroke-width="5" stroke-linecap="round"/><path d="M0 -70 v-14 M-10 -86 h20" stroke="#1c1c1c" stroke-width="5"/>';
    s += '<path d="M0 0 L0 -56 A56 56 0 0 1 ' + f(Math.sin(tt / 0.25 * Math.PI * 0.5) * 56) + ' ' + f(-Math.cos(tt / 0.25 * Math.PI * 0.5) * 56) + ' Z" fill="' + VOICE + '" opacity=".5"/></g>';
    s += '<text x="320" y="290" text-anchor="middle" style="font:800 34px Noto Serif;fill:#1c1c1c;paint-order:stroke;stroke:#fff;stroke-width:6px;direction:ltr">' + tt.toFixed(2) + ' s</text>';
    return s + tag("أقل من ربع ثانية!", 320, 40, u, 0.8, -2, 20);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(520, 90, 24, "#fff6e2") + '<g transform="translate(' + f(-u * 14) + ' 0)">' + city(t, 300, 110, "#d9b394", "#f6dfa8", 33) + '</g>';
    s += tower(120, 300, 0.8, t, true) + tower(540, 300, 0.8, t, true) + radio(t, 150, 150, 510, 150, 6, 1.2);
    return s + tag("إيه الحكاية؟", 320, 250, u, 0.1, -2, 32);
  });
  // 4 — sound is just air shaking
  shot(4, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efd9b8"/>' + person(110, 230, t, 0.9, { talk: true, mood: "happy", look: 1 });
    s += airDots(200, 600, 110, 250, t, 9 * clamp(u / 0.6));
    return s + tag("هوا بيتهز", 420, 60, u, 0.5, 3, 22);
  });
  // 5 — that shaking hits a tiny microphone inside the phone
  shot(5, function (u, d) { return [lerp(320, 430, ease(u / d)), lerp(180, 230, ease(u / d)), lerp(1.0, 1.7, ease(u / d))]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efd9b8"/>' + airDots(60, 360, 180, 300, t, 8);
    s += phone(470, 160, 1.0, t, {});
    var mx = 470, my = 248, b = Math.sin(t * 22) * 3; s += '<circle cx="' + mx + '" cy="' + my + '" r="22" fill="#f4efe4" stroke="#1c1c1c" stroke-width="2.4"/><path d="M' + (mx - 14) + ' ' + my + ' Q' + f(mx + b) + ' ' + f(my - 10 + b) + ' ' + (mx + 14) + ' ' + my + '" stroke="#1c1c1c" stroke-width="2.4" fill="none"/>';
    return s + tag("ميكروفون", 470, 300, u, 1.2, -3, 16);
  });
  // 6 — the mic turns the shaking into electricity with the same ups and downs
  shot(6, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2f34"/>' + '<rect x="40" y="60" width="560" height="240" rx="18" fill="#1a2e22" stroke="#5a5f66" stroke-width="6"/>';
    for (var g = 0; g < 9; g++) s += '<path d="M' + (60 + g * 65) + ' 70 V290" stroke="#2f5a3e" stroke-width="1"/>'; for (var h = 0; h < 4; h++) s += '<path d="M50 ' + (100 + h * 55) + ' H590" stroke="#2f5a3e" stroke-width="1"/>';
    s += wave(70, 580, 180, 80, t, clamp(u / 1.2), "#7cf29a", 3.4) + '<circle cx="' + f(lerp(70, 580, clamp(u / 1.2))) + '" cy="180" r="6" fill="#7cf29a" filter="url(#glow)"/>';
    return s + tag("كهربا زي صوتك بالظبط", 320, 40, u, 1.4, -2, 18);
  });
  // 7 — measured thousands of times a second → numbers
  shot(7, function (u, d) { return [lerp(280, 360, u / d), 175, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = paper(t) + wave(60, 580, 150, 80, t * 0.3, 1, VOICE, 3);
    var n = Math.floor(clamp(u / 2.4) * 40);
    for (var i = 0; i <= n; i++) { var k = i / 40, x = lerp(60, 580, k), y = 150 - waveY(k, t * 0.3) * 80 * Math.sin(Math.PI * k); s += '<path d="M' + f(x) + ' 150 V' + f(y) + '" stroke="#2f6f9f" stroke-width="3"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="#2f6f9f"/>'; }
    var nums = ""; for (var j = 0; j < Math.min(n, 18); j++) { var kk = j / 40; nums += Math.round(50 + waveY(kk, t * 0.3) * 40 * Math.sin(Math.PI * kk)) + " "; }
    s += '<text x="320" y="300" text-anchor="middle" style="font:800 20px Noto Serif;fill:#1c1c1c;direction:ltr">' + nums + '</text>';
    return s + tag("آلاف المرات في الثانية", 470, 40, u, 0.9, 3, 17);
  });
  // 8 — squeeze the numbers to take the least space
  shot(8, function (u, d) { return [lerp(290, 350, u / d), 180, lerp(1.0, 1.35, u / d)]; }, function (u, d, t) {
    var sq = ease(clamp((u - 0.6) / 1.4)), w = lerp(420, 160, sq) + 6 * Math.sin(t * 9) * sq, s = paper(t);
    s += '<rect x="' + f(320 - w / 2) + '" y="110" width="' + f(w) + '" height="120" rx="10" fill="#fff" stroke="#1c1c1c" stroke-width="3"/>';
    for (var r = 0; r < 4; r++) s += bits(320 - w / 2 + 14, 140 + r * 26, t + r, Math.max(3, Math.floor(w / 18) - 1), 0.85);
    s += '<rect x="' + f(320 - w / 2 - 40) + '" y="90" width="30" height="160" rx="6" fill="#8a8f96" stroke="#1c1c1c" stroke-width="3"/><rect x="' + f(320 + w / 2 + 10) + '" y="90" width="30" height="160" rx="6" fill="#8a8f96" stroke="#1c1c1c" stroke-width="3"/>';
    return s + tag("أقل مساحة", 320, 300, u, 1.6, -2, 20);
  });
  // 9 — Ahmed: so how does it leave the phone?
  shot(9, function (u, d) { return [lerp(300, 340, u / d), 190, lerp(1.1, 1.35, ease(u / d))]; }, function (u, d, t) {
    return room(t) + person(320, 230, t, 1.1, { mood: "curious", phone: "hand", look: Math.sin(t * 2) }) + tag("تطلع إزاي؟", 480, 70, u, 0.2, 3, 22);
  });
  // 10 — the antenna turns numbers into radio waves
  shot(10, function (u, d) { return [lerp(260, 330, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efd9b8"/>' + phone(200, 190, 1.1, t, { xray: true, glow: u > 0.8 });
    s += bits(150, 150, t, 4, 0.8, "#f4f1e8");
    if (u > 0.15) for (var w = 0; w < 5; w++) { var o = ((t * 1.1 + w / 5) % 1); s += '<path d="M' + f(250 + o * 300) + ' ' + f(70 - o * 60) + ' Q' + f(280 + o * 340) + ' 120 ' + f(250 + o * 300) + ' ' + f(170 + o * 60) + '" stroke="' + VOICE + '" stroke-width="4" fill="none" opacity="' + f(1 - o) + '"/>'; }
    return s + tag("موجات راديو", 480, 300, u, 1.0, 3, 20);
  });
  // 11 — same family as light, but your eyes can't see it
  shot(11, function (u, d) { return [lerp(240, 400, u / d), 170, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1e2433"/>', cols = ["#4a3a6a", "#5a4a8a", "#ff3b2f", "#ff8a2f", "#f2d43a", "#5bbf6a", "#3f8fdf", "#7a4fdf", "#3a2a5a"];
    s += '<rect x="20" y="120" width="600" height="70" rx="10" fill="url(#spec)" stroke="#f4f1e8" stroke-width="2"/>';
    s += '<rect x="330" y="112" width="140" height="86" rx="8" fill="none" stroke="#fff" stroke-width="3"/><text x="400" y="230" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#fff">النور اللي بنشوفه</text>';
    var p = 0.5 + 0.5 * Math.sin(t * 4); s += '<rect x="20" y="112" width="140" height="86" rx="8" fill="none" stroke="' + VOICE + '" stroke-width="' + f(3 + 2 * p) + '"/><text x="90" y="230" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + VOICE + '">موجات الراديو</text>';
    s += '<g transform="translate(90 60)"><ellipse rx="34" ry="18" fill="#fff" stroke="#1c1c1c" stroke-width="3"/><circle r="10" fill="#2f6f9f"/><path d="M-30 -24 L30 24" stroke="#c23a26" stroke-width="6" stroke-linecap="round" opacity="' + f(pop((u - 1.6) / 1.2)) + '"/></g>';
    return s + tag("عينيك مبتشوفهاش", 300, 300, u, 1.8, -2, 18);
  });
  // 12 — at the speed of light: 300,000 km a second
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0d1a33"/>' + stars(t) + '<circle cx="320" cy="200" r="120" fill="#2f6f9f" stroke="#1c1c1c" stroke-width="3"/><path d="M230 160 q30 -30 60 -10 q20 20 50 0 q30 -20 40 20 q-20 40 -60 30 q-40 -10 -60 10 q-30 -10 -30 -50 Z" fill="#4f8f5a"/>';
    var lap = (t * 1.4) % 1, a = lap * Math.PI * 2; s += '<circle cx="320" cy="200" r="150" fill="none" stroke="' + VOICE + '" stroke-width="2" stroke-dasharray="6 8" opacity=".6"/><circle cx="' + f(320 + Math.cos(a) * 150) + '" cy="' + f(200 + Math.sin(a) * 150) + '" r="9" fill="' + VOICE + '" filter="url(#glow)"/><circle cx="' + f(320 + Math.cos(a) * 150) + '" cy="' + f(200 + Math.sin(a) * 150) + '" r="5" fill="#fff"/>';
    var km = Math.round(clamp(u / 1.6) * 300000); s += '<text x="320" y="60" text-anchor="middle" style="font:800 34px Noto Serif;fill:#fff;direction:ltr">' + km.toLocaleString("en-US") + ' km/s</text>';
    return s + tag("حوالين الأرض 7 مرات في الثانية!", 320, 330, u, 1.8, -2, 16);
  });
  // 13 — off to the nearest tower, maybe on the building next door
  shot(13, function (u, d) { return [lerp(260, 380, u / d), lerp(200, 160, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 18, 20, 5, 0.9) + '<g transform="translate(' + f(-u * 6) + ' 0)">' + city(t, 300, 70, "#b9cfdc", null, 41) + '</g>';
    s += '<path d="M80 360 V180 H260 V360 Z" fill="url(#bld)" stroke="#5b4636" stroke-width="2"/><path d="M380 360 V230 H600 V360 Z" fill="#c9b892" stroke="#5b4636" stroke-width="2"/>';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) s += '<rect x="' + (96 + c * 42) + '" y="' + (196 + r * 32) + '" width="24" height="18" fill="' + (r === 2 && c === 3 ? "#ffe9a0" : "#8fb7d4") + '" stroke="#5b4636"/>';
    s += tower(490, 230, 0.8, t, u > 1.2) + radio(t, 240, 270, 480, 90, 6, 1.1);
    return s + tag("أقرب برج", 520, 300, u, 0.8, 3, 19);
  });
  // 14 — the tower does NOT throw your voice through the air to the other person
  shot(14, function (u, d) { return [lerp(260, 380, u / d), 170, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 18, 20, 5, 0.9) + city(t, 320, 70, "#b9cfdc", null, 43) + tower(140, 320, 0.8, t, true) + '<path d="M140 130 Q320 20 500 130" stroke="' + VOICE + '" stroke-width="4" stroke-dasharray="8 8" fill="none" stroke-dashoffset="' + f(-t * 30) + '"/>';
    s += person(520, 250, t, 0.7, { scarf: "#7a4fdf", shirt: "#b9442a", phone: "ear", mood: "n" });
    var x = pop((u - 1.0) / 1.2); s += '<g transform="translate(320 70) scale(' + f(x) + ')"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#c23a26" stroke-width="10" stroke-linecap="round"/></g>';
    return s + tag("لأ!", 320, 160, u, 1.2, -4, 26);
  });
  // 15 — down into cables under the street: glass threads thin as a hair
  shot(15, function (u, d) { return u < 2.2 ? [320, lerp(170, 250, ease(u / 2.2)), lerp(1.0, 1.3, ease(u / 2.2))] : [lerp(300, 340, (u - 2.2) / (d - 2.2)), 180, lerp(1.0, 1.2, (u - 2.2) / (d - 2.2))]; }, function (u, d, t) {
    if (u < 2.2) {
      var s = sky("day") + city(t, 210, 60, "#b9cfdc", null, 45) + '<rect x="-400" y="210" width="1440" height="30" fill="#6d6a66"/>' + cars(t, 228, 70) + '<rect x="-400" y="240" width="1440" height="400" fill="#8c6440"/>';
      for (var k = 0; k < 30; k++) s += '<circle cx="' + f(-300 + hash(k) * 1240) + '" cy="' + f(260 + hash(k + 3) * 140) + '" r="' + f(2 + hash(k + 7) * 4) + '" fill="#6b4a30"/>';
      s += tower(120, 210, 0.6, t, false) + '<path d="M120 210 V310 H760" stroke="#2b2f34" stroke-width="18" fill="none"/>';
      for (var j = 0; j < 6; j++) { var q = ((t * 0.9 + j / 6) % 1); s += '<circle cx="' + f(lerp(120, 700, q)) + '" cy="310" r="5" fill="' + VOICE + '" filter="url(#glow)"/>'; }
      return s + tag("كابلات تحت الأرض", 420, 120, u, 0.4, -3, 18);
    }
    var v = u - 2.2, s2 = '<rect x="-400" y="-300" width="1440" height="960" fill="#1e2433"/>';
    s2 += '<circle cx="320" cy="180" r="140" fill="#2b2f34" stroke="#1c1c1c" stroke-width="4"/>';
    for (var fi = 0; fi < 12; fi++) { var a = fi * Math.PI * 2 / 12 + t * 0.6, rr = fi % 2 ? 90 : 50; s2 += '<circle cx="' + f(320 + Math.cos(a) * rr) + '" cy="' + f(180 + Math.sin(a) * rr) + '" r="16" fill="#cfe7f2" stroke="#8fc2da" stroke-width="3"/><circle cx="' + f(320 + Math.cos(a) * rr) + '" cy="' + f(180 + Math.sin(a) * rr) + '" r="5" fill="' + VOICE + '" opacity="' + f(hash(fi + Math.floor(t * 12)) > 0.4 ? 1 : 0.2) + '"/>'; }
    return s2 + tag("خيوط زجاج زي الشعرة", 320, 340, v, 0.3, -2, 18);
  });
  // 16 — inside one thread: blinks of light, billions a second
  shot(16, function (u, d) { return [lerp(200, 440, u / d), 180, 1.1]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f1420"/><path d="M-400 130 H1040 V230 H-400 Z" fill="#cfe7f2" opacity=".18"/><path d="M-400 130 H1040 M-400 230 H1040" stroke="#8fc2da" stroke-width="3"/>';
    for (var k = 0; k < 9; k++) { var x0 = -300 + ((t * 260 + k * 150) % 1350), d0 = ""; for (var z = 0; z < 6; z++) d0 += (z ? " L" : "M") + f(x0 + z * 40) + " " + (z % 2 ? 140 : 220); var on = hash(k * 3 + 1) > 0.35; if (on) s += '<path d="' + d0 + '" stroke="' + VOICE + '" stroke-width="4" fill="none" opacity=".9" filter="url(#glow)"/><path d="' + d0 + '" stroke="#fff" stroke-width="1.6" fill="none"/>'; }
    s += '<g transform="translate(320 300)">' + bits(-80, 0, t * 3, 10, 1, "#f4f1e8") + '</g>';
    return s + tag("مليارات المرات في الثانية!", 320, 70, u, 0.8, -2, 18);
  });
  // 17 — the network searches: which tower is the other phone near right now?
  shot(17, function (u, d) { return [lerp(280, 380, u / d), lerp(170, 200, u / d), lerp(0.95, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e1cf"/>';
    for (var g = 0; g < 14; g++) s += '<path d="M' + (-100 + g * 60) + ' -100 V500" stroke="#d6cbb2" stroke-width="2"/><path d="M-200 ' + (-60 + g * 40) + ' H900" stroke="#d6cbb2" stroke-width="2"/>';
    s += '<path d="M-200 220 C100 200 300 260 900 210" stroke="#8fc2da" stroke-width="18" fill="none"/>';
    var T = [[120, 90], [260, 200], [420, 110], [560, 260], [500, 330]];
    T.forEach(function (p, i) { s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M-8 0 L0 -26 L8 0" fill="none" stroke="#5a5f66" stroke-width="3"/><circle cy="-30" r="4" fill="#ff3b2f"/></g>'; });
    var r = ((t * 0.8) % 1) * 300; s += '<circle cx="120" cy="90" r="' + f(r) + '" fill="none" stroke="' + VOICE + '" stroke-width="4" opacity="' + f(1 - r / 300) + '"/>';
    var found = pop((u - 2.4) / 1.2); s += '<g transform="translate(560 230) scale(' + f(found) + ')"><circle r="22" fill="#fff" stroke="#1c1c1c" stroke-width="3"/><rect x="-7" y="-12" width="14" height="24" rx="3" fill="#2b2f34"/></g>';
    return s + tag("هي فين دلوقتي؟", 300, 40, u, 0.4, -2, 20);
  });
  // 18 — your phone keeps telling the network: I'm here
  shot(18, function (u, d) { return [lerp(280, 340, u / d), 190, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f2e6cf"/><rect x="-400" y="270" width="1440" height="400" fill="#d2b48c"/>';
    s += '<rect x="420" y="80" width="200" height="190" fill="#e9e4d8" stroke="#5b4636" stroke-width="3"/><circle cx="470" cy="120" r="16" fill="#8a8f96"/><circle cx="560" cy="120" r="16" fill="#8a8f96"/>';
    s += person(240, 230, t, 1.0, { scarf: "#7a4fdf", shirt: "#b9442a", phone: "hand", mood: "happy" });
    var b = ((t * 0.6) % 1), bk = pop(b / 0.4) * (1 - clamp((b - 0.7) / 0.3)); s += '<g transform="translate(320 120) scale(' + f(bk) + ')"><path d="M-70 -30 H70 V20 H10 L0 36 L-10 20 H-70 Z" fill="#fff" stroke="#1c1c1c" stroke-width="3"/><text y="4" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#1c1c1c">أنا هنا!</text></g>';
    s += radio(t, 280, 200, 620, 20, 4, 0.9);
    return s + tag("ماما", 140, 60, u, 0.3, -4, 22);
  });
  // 19 — cable to that tower, then radio waves to mum's phone
  shot(19, function (u, d) { return [lerp(220, 400, u / d), 175, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(520, 80, 20, "#fff6e2") + city(t, 250, 90, "#d9b394", "#f6dfa8", 51) + '<rect x="-400" y="250" width="1440" height="400" fill="#8c6440"/>' + '<path d="M-200 300 H500 V250" stroke="#2b2f34" stroke-width="16" fill="none"/>';
    for (var j = 0; j < 6; j++) { var q = ((t * 0.8 + j / 6) % 1); s += '<circle cx="' + f(lerp(-200, 500, q)) + '" cy="300" r="5" fill="' + VOICE + '" filter="url(#glow)"/>'; }
    s += tower(500, 250, 0.7, t, true) + radio(t, 520, 110, 580, 190, 4, 1.2) + person(610, 250, t, 0.55, { scarf: "#7a4fdf", shirt: "#b9442a", phone: "ear", mood: "happy" });
    return s + tag("برج ماما", 500, 40, u, 1.0, 3, 19);
  });
  // 20 — mum's phone unpacks the numbers back into electricity
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = paper(t) + bits(60, 120, t * 2, 8, 1.1) + arrow(200, 160, 300, 160, VOICE, 6, u / 0.8);
    s += '<rect x="320" y="70" width="290" height="190" rx="14" fill="#1a2e22" stroke="#5a5f66" stroke-width="5"/>' + wave(330, 600, 165, 60, t, clamp((u - 0.6) / 1.2), "#7cf29a", 3.4);
    return s + tag("رجعت كهربا", 465, 300, u, 1.2, 2, 20);
  });
  // 21 — that electricity pushes a tiny speaker back and forth
  shot(21, function (u, d) { return [lerp(300, 360, u / d), 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2f34"/>', pz = Math.sin(t * 24) * 10 * clamp(u / 0.5);
    s += '<g transform="translate(260 180)"><path d="M-40 -60 L40 -100 L40 100 L-40 60 Z" fill="#8a8f96" stroke="#1c1c1c" stroke-width="3"/><rect x="-80" y="-40" width="40" height="80" fill="#5a5f66" stroke="#1c1c1c" stroke-width="3"/>';
    s += '<g transform="translate(' + f(pz) + ' 0)"><ellipse cx="40" cy="0" rx="14" ry="100" fill="#cfc7b6" stroke="#1c1c1c" stroke-width="3"/><circle cx="40" cy="0" r="16" fill="#3a3d42"/></g></g>';
    s += arrow(380, 80, 430, 80, VOICE, 5, 1) + arrow(430, 280, 380, 280, VOICE, 5, 1);
    return s + tag("لقدام ولورا", 470, 180, u, 0.6, 3, 20);
  });
  // 22 — shaking the air again, the same shape as your voice: mum hears you
  shot(22, function (u, d) { return [lerp(300, 360, u / d), 190, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f2e6cf"/>' + person(420, 230, t, 1.0, { scarf: "#7a4fdf", shirt: "#b9442a", phone: "ear", mood: "happy", look: -1 });
    s += airDots(80, 360, 120, 230, t, 8) + wave(80, 360, 70, 24, t, 1);
    return s + tag("نفس شكل صوتك!", 220, 300, u, 1.0, -3, 20);
  });
  // 23 — what if you're in a car and the tower gets far?
  shot(23, function (u, d) { return [lerp(320, 380, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 40, 20, 5, 0.9) + '<g transform="translate(' + f((u * 80) % 400 - 400) + ' 0)">' + city(t, 260, 70, "#b9cfdc", null, 61) + '</g>' + grass(t, 260, "grass-day", "#5d8a3c") + '<rect x="-400" y="280" width="1440" height="50" fill="#6d6a66"/>';
    for (var k = 0; k < 12; k++) s += '<rect x="' + f(((k * 80 + u * 400) % 960) - 200) + '" y="302" width="40" height="5" fill="#f4f1e8"/>';
    s += tower(lerp(300, -100, u / d), 270, 0.6, t, true);
    s += '<g transform="translate(400 296)"><rect x="-70" y="-30" width="140" height="34" rx="10" fill="#2f6f9f" stroke="#1c1c1c" stroke-width="3"/><path d="M-40 -30 L-24 -58 H30 L50 -30 Z" fill="#cfe1ec" stroke="#1c1c1c" stroke-width="3"/>' + head(0, -40, 12, "worry", t, -1) + '<circle cx="-40" cy="6" r="13" fill="#1c1c1c"/><circle cx="44" cy="6" r="13" fill="#1c1c1c"/></g>';
    var bars = Math.max(1, 4 - Math.floor(u / d * 4)); for (var b = 0; b < 4; b++) s += '<rect x="' + (520 + b * 14) + '" y="' + (80 - b * 10) + '" width="10" height="' + (14 + b * 10) + '" fill="' + (b < bars ? "#4f8f5a" : "#c9c4b8") + '" stroke="#1c1c1c"/>';
    return s + tag("البرج بعد!", 200, 60, u, 0.8, -3, 20);
  });
  // 24 — the network hands you to the next tower without dropping the call
  shot(24, function (u, d) { return [lerp(260, 420, u / d), 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 40, 20, 5, 0.9) + grass(t, 260, "grass-day", "#5d8a3c") + '<rect x="-400" y="280" width="1440" height="50" fill="#6d6a66"/>', cx = lerp(150, 520, u / d);
    s += tower(80, 270, 0.6, t, cx < 330) + tower(600, 270, 0.6, t, cx >= 330);
    var tx = cx < 330 ? 80 : 600; s += '<path d="M' + tx + ' 150 L' + f(cx) + ' 250" stroke="' + VOICE + '" stroke-width="4" stroke-dasharray="7 6" stroke-dashoffset="' + f(-t * 40) + '"/>';
    s += '<g transform="translate(' + f(cx) + ' 296)"><rect x="-70" y="-30" width="140" height="34" rx="10" fill="#2f6f9f" stroke="#1c1c1c" stroke-width="3"/><path d="M-40 -30 L-24 -58 H30 L50 -30 Z" fill="#cfe1ec" stroke="#1c1c1c" stroke-width="3"/>' + head(0, -40, 12, "happy", t, 0) + '<circle cx="-40" cy="6" r="13" fill="#1c1c1c"/><circle cx="44" cy="6" r="13" fill="#1c1c1c"/></g>';
    return s + tag("من غير ما تقطع!", 330, 60, u, 1.6, -2, 20);
  });
  // 25 — the trip: air, electricity, numbers, light, air again
  shot(25, function (u, d) { return [lerp(260, 380, u / d), 180, 1.05]; }, function (u, d, t) {
    var s = paper(t), L5 = ["هوا", "كهربا", "أرقام", "نور", "هوا تاني"], step = (d - 1) / 5;
    for (var k = 0; k < 5; k++) { var x = 70 + k * 125, sc = pop((u - k * step) / 1.2); if (sc <= 0) continue;
      s += '<g transform="translate(' + x + ' 160) scale(' + f(sc) + ')"><circle r="46" fill="#fff" stroke="#1c1c1c" stroke-width="3"/>';
      if (k === 0 || k === 4) s += wave(-34, 34, 0, 14, t, 1, "#5d93ad", 3); if (k === 1) s += wave(-34, 34, 0, 14, t, 1, "#3f9f5a", 3); if (k === 2) s += bits(-30, 8, t, 4, 0.8); if (k === 3) s += '<circle r="16" fill="' + VOICE + '" filter="url(#glow)"/><circle r="8" fill="#fff"/>';
      s += '</g><text x="' + x + '" y="236" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#1c1c1c">' + L5[k] + '</text>';
      if (k > 0) s += arrow(x - 125 + 50, 160, x - 50, 160, VOICE, 4, clamp((u - k * step) / 0.4)); }
    return s + tag("رحلة صوتك", 320, 50, u, 0.2, -2, 22);
  });
  // 26 — outro: Ahmed and mum, both waving
  shot(26, function (u, d) { return [lerp(290, 350, u / d), 190, lerp(1.0, 1.3, u / d)]; }, function (u, d, t) {
    var s = room(t) + person(200, 240, t, 0.9, { phone: "ear", mood: "happy" }) + person(470, 240, t, 0.9, { scarf: "#7a4fdf", shirt: "#b9442a", phone: "ear", mood: "happy" });
    s += '<path d="M260 80 Q340 ' + f(30 + Math.sin(t * 3) * 10) + ' 420 80" stroke="' + VOICE + '" stroke-width="4" stroke-dasharray="8 7" stroke-dashoffset="' + f(-t * 40) + '" fill="none"/>';
    return s + tag("حكاية إيه المرة الجاية؟", 330, 330, u, 0.3, -2, 19);
  });

  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 12 * Math.sin(t * 0.9), cy = c[1] + 9 * Math.cos(t * 0.9), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
