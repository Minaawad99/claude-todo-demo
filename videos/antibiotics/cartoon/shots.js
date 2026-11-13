  // ── «المضاد الحيوي من غير دكتور» — cartoon panels (shapes: ../refs/SOURCES.md) ──
  var INK = "#1c1c1c";
  function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + f(Math.max(0, op)) + '"' : "") + '>' + inner + '</g>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:' + INK + ';stroke-width:2;paint-order:stroke">؟</text>'; }
  function txt(s, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + s + '</text>'; }
  function num(s, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + ';direction:ltr;stroke:' + INK + ';stroke-width:' + (col && col !== INK ? 2 : 0) + ';paint-order:stroke">' + s + '</text>'; }
  function bigX(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * pop(k)) + ')', '<path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + INK + '" stroke-width="18" stroke-linecap="round"/><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#e23b2e" stroke-width="12" stroke-linecap="round"/>'); }
  function tick(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * pop(k)) + ')', '<path d="M-26 0 L-8 18 L28 -22" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-26 0 L-8 18 L28 -22" stroke="#5fc24a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); }
  function arrowF(x1, y1, x2, y2, k) { return arrow(x1, y1, x2, y2, "#f2c230", 5, clamp(k)); }

  // a rod bacterium as a character: gradient capsule body, ball eyes, wiggling flagella. o: {mood, shield, hat, pop 0..1, flip}
  function bug(x, y, s, fill, t, o) {
    o = o || {}; var p = clamp(o.pop || 0), r = '';
    if (p > 0) {   // it pops: a star burst and flying bits
      for (var j = 0; j < 10; j++) { var a = j / 10 * 6.28 + hash(j + x) , dd = 20 + 70 * p; r += '<circle cx="' + f(Math.cos(a) * dd) + '" cy="' + f(Math.sin(a) * dd * .8) + '" r="' + f(7 * (1 - p) + 2) + '" fill="' + (fill === "url(#bacR)" ? "#e0663a" : "#8fb84a") + '" stroke="' + INK + '" stroke-width="1.5" opacity="' + f(1 - p) + '"/>'; }
      if (p < .5) r += '<path d="M0 -50 L10 -14 L46 -24 L18 2 L44 30 L8 18 L0 52 L-8 18 L-44 30 L-18 2 L-46 -24 L-10 -14 Z" fill="#fff6c8" stroke="' + INK + '" stroke-width="2" transform="scale(' + f(pop(p * 2)) + ')"/>';
      return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
    }
    var sw = Math.sin(t * 9 + x), by = Math.sin(t * 3 + x * .1) * 3;
    for (var k = 0; k < 3; k++) { var d = "M-44 " + ((k - 1) * 8); for (var q = 1; q <= 8; q++) d += " L" + (-44 - q * 6) + " " + f((k - 1) * (8 + q * 1.5) + Math.sin(q * .9 - t * 10 + k) * 4); r += '<path d="' + d + '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }
    r += '<rect x="-46" y="-24" width="92" height="48" rx="24" fill="' + fill + '" stroke="' + INK + '" stroke-width="3"/>';
    r += '<ellipse cx="-14" cy="-12" rx="22" ry="6" fill="#fff" opacity=".35"/>';
    r += '<g transform="translate(14 -2)">' + '<circle cx="-8" cy="0" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="8" cy="0" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>' + G("scale(1.2)", eyes(o.mood || "n", t + x, 13)) + '</g>';
    if (o.mood === "happy" || o.mood === "tough") r += '<path d="M6 12 Q14 19 22 12" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (o.mood === "shock" || o.mood === "worry") r += '<ellipse cx="14" cy="14" rx="4" ry="5" fill="' + INK + '"/>';
    if (o.shield) r += '<rect x="-56" y="-34" width="112" height="68" rx="34" fill="none" stroke="#f2c230" stroke-width="' + f(4 + 1.5 * Math.sin(t * 6)) + '" opacity=".9" filter="url(#glow)"/><rect x="-56" y="-34" width="112" height="68" rx="34" fill="none" stroke="#f2c230" stroke-width="3"/>';
    if (o.hat === "grad") r += '<path d="M-6 -24 L16 -36 L38 -24 L16 -14 Z" fill="' + INK + '"/><path d="M34 -26 v14" stroke="#f2c230" stroke-width="2.4"/>';
    if (o.hat === "helmet") r += '<path d="M-20 -22 Q12 -48 44 -18 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/>';
    return G('translate(' + f(x) + ' ' + f(y + by) + ') rotate(' + f((o.rot || 0) + sw * 2) + ') scale(' + f(o.flip ? -s : s) + ' ' + f(s) + ')', r);
  }
  // the cold virus as a character: a purple ball with knobs, eyes
  function vir(x, y, s, t, mood) {
    var r = ''; for (var k = 0; k < 12; k++) { var a = k / 12 * 6.28 + t * .6; r += '<path d="M' + f(Math.cos(a) * 22) + ' ' + f(Math.sin(a) * 22) + ' L' + f(Math.cos(a) * 31) + ' ' + f(Math.sin(a) * 31) + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(Math.cos(a) * 32) + '" cy="' + f(Math.sin(a) * 32) + '" r="4" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/>'; }
    r += '<circle r="24" fill="url(#virG)" stroke="' + INK + '" stroke-width="3"/><circle cx="-7" cy="-2" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><circle cx="7" cy="-2" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>' + G("translate(0 -2) scale(.9)", eyes(mood || "n", t + x, 13));
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6 + x) * 4) + ') scale(' + f(s) + ')', r);
  }
  // a capsule pill, optionally with a face
  function pill(x, y, s, ang, t, face) {
    var r = '<path d="M0 -18 H-32 A18 18 0 0 0 -32 18 H0 Z" fill="url(#pillO)" stroke="' + INK + '" stroke-width="3"/><path d="M0 -18 H32 A18 18 0 0 1 32 18 H0 Z" fill="url(#pillW)" stroke="' + INK + '" stroke-width="3"/><path d="M-36 -9 H30" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
    if (face) r += '<circle cx="-24" cy="2" r="5" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-10" cy="2" r="5" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>' + G("translate(-17 2) scale(.7)", eyes(face, t, 13));
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + f(s) + ')', r);
  }
  // a human body cell: soft pink blob with a nucleus and a smile
  function hcell(x, y, s, t, mood) {
    var d = ""; for (var k = 0; k <= 24; k++) { var a = k / 24 * 6.28, rr = 70 * (1 + .05 * Math.sin(a * 3 + t * 1.5)); d += (k ? " L" : "M") + f(Math.cos(a) * rr) + " " + f(Math.sin(a) * rr); }
    var r = '<path d="' + d + ' Z" fill="url(#cellG)" stroke="' + INK + '" stroke-width="3"/><circle cx="-24" cy="-18" r="20" fill="#c9705a" stroke="' + INK + '" stroke-width="2"/>';
    r += '<g transform="translate(14 8)"><circle cx="-9" cy="0" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="9" cy="0" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>' + G("scale(1.2)", eyes(mood || "happy", t, 13)) + '<path d="M-8 16 Q0 24 8 16" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
  }
  // a person: ball head + shirt. o: {shirt, sneeze, coat (doctor)}
  function guy(x, y, s, t, mood, o) {
    o = o || {}; var r = '<path d="M-34 70 C-36 30 -22 18 0 18 C22 18 36 30 34 70 Z" fill="' + (o.coat ? "#f4f4f0" : (o.shirt || "#3f8fbf")) + '" stroke="' + INK + '" stroke-width="3"/>';
    if (o.coat) r += '<path d="M-6 20 L0 60 L6 20" fill="#3f8fbf" stroke="' + INK + '" stroke-width="2"/><path d="M-20 34 q10 18 0 30" stroke="' + INK + '" stroke-width="2.4" fill="none"/><circle cx="-20" cy="66" r="5" fill="#9aa3ad" stroke="' + INK + '" stroke-width="1.6"/>';
    r += head(0, -6, 26, mood, t, o.look || 0);
    if (o.sick) r += '<circle cx="14" cy="4" r="5" fill="#e23b2e" opacity=".8"/>' + '<path d="M30 -30 q6 8 0 12" stroke="#5fb0e0" stroke-width="3" fill="none"/>';
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.2 + x) * 2) + ') scale(' + f(s) + ')', r);
  }
  // the microscope world: a pale green field in a round lens, drifting specks
  function micro(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#244a3c"/><circle cx="320" cy="180" r="420" fill="url(#micro)"/>';
    for (var i = 0; i < 26; i++) { var px = ((hash(i) * 900 + t * (8 + hash(i + 3) * 10)) % 900) - 130, py = -40 + hash(i + 7) * 440 + Math.sin(t + i) * 8; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2 + hash(i + 1) * 4) + '" fill="#fff" opacity=".45"/>'; }
    return s;
  }
  function room(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#room)"/><rect x="-400" y="270" width="1440" height="400" fill="#c9a77c"/><path d="M-400 270 H1040" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="420" y="40" width="160" height="120" fill="url(#sky-day)" stroke="' + INK + '" stroke-width="4"/>' + '<svg x="420" y="40" width="160" height="120" viewBox="420 40 160 120">' + clouds(t, 12, 60, 2, .9, .5) + '</svg><path d="M500 40 V160 M420 100 H580" stroke="' + INK + '" stroke-width="3"/>';
    return s;
  }
  function pharmacy(t) {
    var s = sky("day") + clouds(t, 14, 10, 4, .8) + '<rect x="-400" y="300" width="1440" height="300" fill="#b8b1a2"/><rect x="40" y="40" width="560" height="262" fill="#f1ebe0" stroke="' + INK + '" stroke-width="4"/>';
    s += '<rect x="40" y="40" width="560" height="54" fill="#2f8f5a" stroke="' + INK + '" stroke-width="4"/>' + txt("صيدلية", 320, 80, 30, "#fff", 900);
    var gl = .6 + .4 * Math.sin(t * 5); s += G("translate(560 140)", '<rect x="-30" y="-30" width="60" height="60" rx="6" fill="#1c1c1c"/><path d="M-22 -8 H-8 V-22 H8 V-8 H22 V8 H8 V22 H-8 V8 H-22 Z" fill="#5fe08a" opacity="' + f(gl) + '" filter="url(#glow)"/><path d="M-22 -8 H-8 V-22 H8 V-8 H22 V8 H8 V22 H-8 V8 H-22 Z" fill="#5fe08a" opacity="' + f(gl) + '"/>');
    s += '<rect x="90" y="120" width="380" height="182" fill="#bfe0ef" stroke="' + INK + '" stroke-width="3"/>'; for (var r = 0; r < 3; r++) { s += '<path d="M90 ' + (170 + r * 50) + ' H470" stroke="' + INK + '" stroke-width="2.4"/>'; for (var b = 0; b < 8; b++) s += '<rect x="' + (102 + b * 45) + '" y="' + (138 + r * 50) + '" width="30" height="32" fill="' + ["#e0663a", "#f2c230", "#5fb0e0", "#8fb84a"][(b + r) % 4] + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    return s;
  }
  function abBox(x, y, s, t) {   // a box of antibiotics
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 1.5) * 3) + ') scale(' + f(s) + ')', '<path d="M-50 -34 L-34 -46 H62 L46 -34 Z" fill="#f4f4f0" stroke="' + INK + '" stroke-width="2.4"/><path d="M46 -34 L62 -46 V30 L46 42 Z" fill="#d6d2c8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-50" y="-34" width="96" height="76" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><rect x="-50" y="-34" width="96" height="22" fill="#e0663a" stroke="' + INK + '" stroke-width="2.4"/>' + txt("مضاد حيوي", -2, -17, 12, "#fff", 900) + num("500mg", -2, 20, 14) + pill(-2, 34, .28, 0, t));
  }
  function burstText(text, x, y, u, u0, sz) { var k = pop((u - u0) / .8); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ') rotate(-6)', '<path d="M0 -50 L16 -22 L50 -30 L30 0 L54 26 L18 22 L6 52 L-10 22 L-48 30 L-26 0 L-50 -30 L-16 -22 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3" transform="scale(' + f(1 + text.length * .12) + ' 1)"/>' + txt(text, 0, sz * .35, sz, INK, 900)); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function pushC(x, y, z1, z2) { return function (u, d) { return [x, y, lerp(z1, z2, clamp(u / d))]; }; }

  // 0 — got a cold, went to the pharmacy and bought antibiotics without a doctor
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 260, k), 190, lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var k = clamp((u - .3) / 1.2);
    return pharmacy(t) + guy(lerp(-40, 200, ease(k)), 250, 1.15, t, "worry", { shirt: "#c8441f", sick: true }) + abBox(lerp(-10, 238, ease(k)), 272, .55, t) + tag("من غير روشتة!", 320, 340, u, 2.0, -3, 20);
  });
  // 1 — a few days later you feel better, and think the pill did it
  shot(1, pushC(320, 180, 1.05, 1.0), function (u, d, t) {
    var s = room(t), k = clamp((u - .3) / 2.2), day = Math.min(5, 1 + Math.floor(k * 5));
    s += G("translate(150 120)", '<rect x="-60" y="-60" width="120" height="130" rx="8" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="-60" y="-60" width="120" height="34" rx="8" fill="#e0663a" stroke="' + INK + '" stroke-width="3"/>' + txt("يوم", 0, -36, 16, "#fff", 900) + num(String(day), 0, 40, 60));
    s += guy(400, 220, 1.4, t, u > 2 ? "happy" : "n", { shirt: "#c8441f" }) + abBox(500, 290, .5, t);
    return s + tag("خفّيت!", 400, 100, u, 2.2, -4, 24, "#bfe8a8");
  });
  // 2 — but it did nothing… and may have hurt you
  shot(2, pushC(320, 190, 1.0, 1.12), function (u, d, t) {
    return room(t) + guy(200, 220, 1.4, t, u > 1 ? "shock" : "n", { shirt: "#c8441f" }) + abBox(420, 200, 1.1, t) + bigX(420, 200, 1.6, (u - .4) / .6) + tag("ممكن يكون أذاك!", 320, 330, u, 1.8, -3, 20, "#f2a0a0");
  });
  // 3 — «إيه الحكاية؟»: the cast bounces in
  shot(3, pushC(320, 180, 0.95, 1.05), function (u, d, t) {
    return micro(t) + bug(170, 190, 1.3, "url(#bacG)", t, { mood: "curious" }) + pill(320, 120 + Math.sin(t * 3) * 6, 1.3, -10 + Math.sin(t * 2) * 6, t, "n") + vir(470, 200, 1.3, t, "curious") + qmark(320, 300, t, 70) + tag("إيه الحكاية؟", 320, 50, u, .2, -3, 22);
  });
  // 4 — a small rule first: a chalkboard
  shot(4, pushC(320, 180, 1.0, 1.08), function (u, d, t) {
    var s = room(t) + '<rect x="110" y="40" width="420" height="230" rx="10" fill="url(#board)" stroke="#7a5534" stroke-width="12"/>' + txt("قاعدة صغيرة", 320, 100, 34, "#fff", 900);
    return s + pill(320, 180, 1.4, -8 + 6 * Math.sin(t * 2), t, "happy") + '<path d="M150 290 h340" stroke="#7a5534" stroke-width="8"/>' + tag("خليك فاكرها!", 320, 330, u, 1.6, -3, 20);
  });
  // 5 — antibiotics kill bacteria only: hits the bacterium, passes straight through the virus
  shot(5, pushC(320, 180, 1.0, 1.06), function (u, d, t) {
    var s = micro(t), k1 = clamp((u - .3) / .8), k2 = clamp((u - 1.8) / 1.2);
    s += bug(170, 220, 1.5, "url(#bacG)", t, { mood: k1 >= 1 ? "dizzy" : "worry" }) + vir(480, 220, 1.5, t, k2 > .5 ? "happy" : "curious");
    s += pill(lerp(320, 190, k1), lerp(70, 190, k1), .9, 30, t) + (k2 > 0 ? pill(lerp(320, 560, k2), lerp(70, 300, k2), .9, -30, t) : "");
    return s + tick(170, 110, 1, (u - 1.2) / .5) + bigX(480, 110, .8, (u - 2.8) / .5) + tag("بكتيريا ✓", 170, 330, u, 1, -3, 20, "#bfe8a8") + tag("فيروس ✗", 480, 330, u, 2.6, 3, 20, "#d9c2f0");
  });
  // 6 — the cold is a virus, and the body clears it by itself in about a week
  shot(6, pushC(320, 180, 1.05, 1.0), function (u, d, t) {
    var s = room(t) + guy(170, 220, 1.6, t, "worry", { shirt: "#c8441f", sick: true }), k = clamp((u - .5) / (d - 1));
    for (var i = 0; i < 5; i++) if (hash(i + 2) > k) s += vir(250 + i * 22, 140 + Math.sin(t * 3 + i) * 10 + (i % 2) * 20, .45, t + i, "n");
    for (i = 0; i < 7; i++) { var x = 330 + i * 40, on = k * 7 > i; s += '<rect x="' + x + '" y="230" width="34" height="34" rx="5" fill="' + (on ? "#bfe8a8" : "#fff") + '" stroke="' + INK + '" stroke-width="2"/>' + num(String(i + 1), x + 17, 254, 18); }
    return s + tag("أسبوع وبيخلص لوحده", 470, 320, u, .6, -3, 18, "#bfe0ff");
  });
  // 7 — so how does it kill bacteria? under the lens
  shot(7, pushC(320, 180, 0.9, 1.1), function (u, d, t) {
    return micro(t) + bug(320 + Math.sin(t * 1.4) * 30, 180, 2.4, "url(#bacG)", t, { mood: "curious" }) + qmark(500, 110, t, 70) + qmark(140, 120, t, 50);
  });
  // 8 — bacteria live inside a wall; penicillin wrecks it until the cell bursts, like a pricked balloon
  function brickBug(x, y, s, t, holes, swell) {
    var r = '<rect x="-150" y="-70" width="300" height="140" rx="70" fill="#8a6a4a" stroke="' + INK + '" stroke-width="4"/>', n = 0;
    for (var row = 0; row < 7; row++) for (var c = 0; c < 12; c++) { var bx = -150 + c * 26 + (row % 2) * 13, byy = -70 + row * 20; if (hash(n++) < holes) continue; r += '<rect x="' + bx + '" y="' + byy + '" width="24" height="18" rx="3" fill="#c98a5a" stroke="#6a4a2a" stroke-width="1.4"/>'; }
    r = '<clipPath id="bw' + (++CLIPN) + '"><rect x="-150" y="-70" width="300" height="140" rx="70"/></clipPath><g clip-path="url(#bw' + CLIPN + ')">' + r + '</g><rect x="-150" y="-70" width="300" height="140" rx="70" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    r += '<rect x="-128" y="-50" width="256" height="100" rx="50" fill="url(#bacG)" stroke="' + INK + '" stroke-width="3" transform="scale(' + f(1 + swell * .35) + ')" opacity="' + f(holes > .02 ? .92 : 0) + '"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
  }
  var CLIPN = 0;
  shot(8, pushC(320, 180, 1.0, 1.05), function (u, d, t) {
    var holes = clamp((u - 1.4) / 1.8) * .7, sw = clamp((u - 2.8) / 1.0), boom = clamp((u - 3.9) / .7), s = micro(t);
    if (boom < .3) s += brickBug(320, 190, 1 + .06 * sw, t, holes, sw);
    if (boom > 0) s += bug(320, 190, 2.2, "url(#bacG)", t, { pop: boom });
    if (boom <= 0) s += tag("الجدار", 320, 80, u, .3, -3, 22);
    for (var i = 0; i < 6; i++) { var k = clamp((u - .8 - i * .15) / .7); if (k > 0 && boom <= 0) s += pill(lerp(i % 2 ? 680 : -40, 200 + i * 48, ease(k)), lerp(30 + i * 50, 150 + (i % 3) * 30, ease(k)), .6, i * 40 + t * 60, t); }
    s += tag("البنسلين", 140, 320, u, 1.2, -3, 20, "#ffc9a8");
    if (boom > 0) s += burstText("بوم!", 320, 180, u, 3.95, 34);
    return s + G("translate(530 300)", '<rect x="-56" y="-56" width="112" height="112" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + (u < 5.1 ? '<ellipse cx="0" cy="-8" rx="' + f(30 + 8 * sw) + '" ry="' + f(36 + 8 * sw) + '" fill="#e23b2e" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 28 v18" stroke="' + INK + '" stroke-width="2"/><path d="M34 -40 L22 -24" stroke="' + INK + '" stroke-width="3"/>' : '<path d="M-20 -20 l-14 -10 M20 -20 l14 -10 M-24 10 h-16 M24 10 h16 M0 -30 v-14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-10 0 l6 10 l8 -12 l6 14" fill="#e23b2e" stroke="' + INK + '" stroke-width="2"/>'), clamp((u - 4.2) / .3));
  });
  // 9 — your own cells have no such wall, so the drug leaves them alone
  shot(9, pushC(320, 180, 1.05, 1.0), function (u, d, t) {
    var s = micro(t) + hcell(320, 180, 1.6, t, "happy");
    for (var i = 0; i < 5; i++) { var a = i * 1.26 + t * .8, rr = 160 + 14 * Math.sin(t * 4 + i); s += pill(320 + Math.cos(a) * rr, 180 + Math.sin(a) * rr * .7, .6, a * 57 + 90, t); }
    return s + tag("مفيش جدار", 160, 60, u, .5, -3, 20, "#ffd2c0") + tick(500, 70, .8, (u - 1.4) / .5);
  });
  // 10 — bacteria are not all alike: a crowd of different ones
  var CROWD = []; for (var ci = 0; ci < 14; ci++) CROWD.push([80 + (ci % 5) * 120 + (Math.floor(ci / 5) % 2) * 50 - 25, 70 + Math.floor(ci / 5) * 100 + hash(ci) * 20, .6 + hash(ci + 4) * .3, ["n", "happy", "curious", "n", "worry"][ci % 5]]);
  var STRONG = 9;
  function crowd(t, st) { var s = ""; CROWD.forEach(function (c, i) { var o = st ? st(i) : {}; if (o.hide) return; s += bug(c[0] + Math.sin(t * 1.3 + i) * 6, c[1], c[2] * (o.big || 1), o.fill || "url(#bacG)", t, { mood: o.mood || c[3], pop: o.pop, shield: o.shield, flip: i % 3 === 0, hat: o.hat }); }); return s; }
  shot(10, pushC(320, 180, 0.95, 1.05), function (u, d, t) { return micro(t) + crowd(t) + tag("مش كلها شبه بعض", 320, 330, u, .6, -3, 20); });
  // 11 — among millions, one has a small change that lets it stand the drug
  shot(11, function (u, d) { var k = ease(clamp((u - .8) / 1.4)); return [lerp(320, CROWD[STRONG][0], k), lerp(180, CROWD[STRONG][1], k), lerp(1.0, 1.7, k)]; }, function (u, d, t) {
    var on = u > 1.2;
    return micro(t) + crowd(t, function (i) { return i === STRONG ? { fill: on ? "url(#bacR)" : "url(#bacG)", mood: on ? "tough" : "n", shield: u > 2.2 } : {}; }) + tag("تغيير صغير!", CROWD[STRONG][0], CROWD[STRONG][1] - 60, u, 2.4, -3, 16);
  });
  // 12 — take the drug: the weak ones pop, the strong one stays, alone on the field
  shot(12, pushC(320, 180, 1.0, 1.04), function (u, d, t) {
    var s = micro(t);
    for (var i = 0; i < 10; i++) { var k = clamp((u - .1 - i * .08) / 1.0); if (k > 0 && k < 1) s += pill(60 + i * 58, lerp(-40, 330, k), .55, i * 30 + t * 90, t); }
    s += crowd(t, function (i) { return i === STRONG ? { fill: "url(#bacR)", mood: u > 3 ? "happy" : "tough", shield: true, big: 1 + .25 * clamp((u - 3) / 1) } : { pop: clamp((u - .8 - hash(i + 30) * 1.8) / .7) || 0 }; });
    return s + tag("الملعب فاضي!", 320, 330, u, 3.3, -3, 20, "#ffc9a8");
  });
  // 13 — it can split every 20 minutes: one becomes 16 million in 8 hours
  shot(13, pushC(320, 190, 1.0, 1.04), function (u, d, t) {
    var g = Math.min(5, Math.floor(u / .6)), n = Math.pow(2, g), s = micro(t), cols = Math.ceil(Math.sqrt(n * 2)), rows = Math.ceil(n / cols), sc = Math.min(1, 2.6 / Math.sqrt(n));
    for (var i = 0; i < n; i++) s += bug(320 + ((i % cols) - (cols - 1) / 2) * 110 * sc, 200 + (Math.floor(i / cols) - (rows - 1) / 2) * 62 * sc, .9 * sc, "url(#bacR)", t, { mood: "happy", flip: i % 2 === 1 });
    var k = ease(clamp((u - .5) / (d - 1.4))), c = Math.round(16000000 * k * k);
    s += G("translate(320 40)", '<rect x="-150" y="-30" width="300" height="56" rx="12" fill="#1c1c1c" stroke="#f2c230" stroke-width="3"/>' + num(c.toLocaleString("en-US"), 0, 14, 34, "#f2c230"));
    s += G("translate(560 300)", '<circle r="30" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M0 0 L' + f(20 * Math.sin(t * 5)) + ' ' + f(-20 * Math.cos(t * 5)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>');
    return s + tag("كل 20 دقيقة", 110, 310, u, .3, -3, 18) + tag("8 ساعات", 560, 230, u, 3.2, 3, 18, "#ffc9a8");
  });
  // 14 — like spraying weed killer: the weak weeds wilt, the tough one is left and takes over
  function weed(x, y, s, col, droop, t) { var r = ""; for (var k = -2; k <= 2; k++) r += G('rotate(' + f(k * 20 + droop * (k >= 0 ? 70 : -70) + Math.sin(t * 2 + x) * 3) + ')', '<path d="M0 0 C-10 -20 -8 -50 0 -64 C8 -50 10 -20 0 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>'); return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r); }
  shot(14, pushC(320, 190, 1.0, 1.06), function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 4, .8) + '<rect x="-400" y="250" width="1440" height="400" fill="#8a5a3a"/><path d="M-400 250 H1040" stroke="' + INK + '" stroke-width="3"/>', i, sp = clamp((u - .3) / 1.6), gr = clamp((u - 2.6) / 1.6);
    for (i = 0; i < 9; i++) { var x = 40 + i * 70, tough = i === 4, dr = tough ? 0 : clamp((u - 1 - hash(i) * .8) / .8); s += weed(x, 252, 1.2, tough ? "#2f6a2a" : dr > .5 ? "#b8a86a" : "#7cc04a", dr, t); }
    for (i = 0; i < 6; i++) if (gr * 6 > i) s += weed(75 + i * 70 + (i > 2 ? 70 : 0), 252, 1.1 * clamp(gr * 6 - i), "#2f6a2a", 0, t);
    s += G("translate(120 70) rotate(18)", '<rect x="-40" y="-26" width="80" height="60" rx="12" fill="#3f8fbf" stroke="' + INK + '" stroke-width="3"/><rect x="38" y="-8" width="50" height="14" fill="#1c1c1c"/><path d="M-20 -26 Q0 -50 20 -26" stroke="' + INK + '" stroke-width="5" fill="none"/>');
    for (i = 0; i < 24; i++) { var p = (t * .9 + hash(i)) % 1; if (sp > 0 && sp < 1) s += '<circle cx="' + f(210 + p * 300 + hash(i + 5) * 40) + '" cy="' + f(100 + p * 140 + hash(i + 8) * 40) + '" r="3" fill="#bfe0ef" opacity="' + f(1 - p) + '"/>'; }
    return s + tag("مبيد", 120, 140, u, .4, -3, 18, "#bfe0ff") + tag("القوي بيفضل", 450, 320, u, 2.3, -3, 20, "#bfe8a8");
  });
  // 15–16 — why is stopping early wrong? a chart: you feel better before the bacteria are gone; stop and they climb back, stronger
  function chart(u, k1, k2, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f6f1e6"/><rect x="60" y="30" width="520" height="290" rx="14" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M110 280 H550 M110 280 V60" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + txt("البكتيريا", 150, 56, 15, INK, 800) + txt("الأيام", 530, 304, 15, INK, 800);
    s += '<path d="M110 200 H550" stroke="#3f8fbf" stroke-width="3" stroke-dasharray="10 8"/>' + txt("تعبان", 520, 192, 14, "#3f8fbf", 800);
    if (k1 > 0) s += '<path d="M110 80 C170 90 210 210 270 250" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + f(1 - k1) + '" stroke="#5fa03a" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if (k2 > 0) s += '<path d="M270 250 C310 280 340 220 390 160 C430 110 480 70 550 60" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + f(1 - k2) + '" stroke="#e0663a" stroke-width="7" fill="none" stroke-linecap="round"/>';
    return s;
  }
  shot(15, pushC(320, 180, 0.95, 1.02), function (u, d, t) { return chart(u, 0, 0, t) + qmark(330, 190, t, 90); });
  shot(16, pushC(330, 180, 1.0, 1.06), function (u, d, t) {
    var k1 = clamp((u - .1) / 1.6), k2 = clamp((u - 2.2) / 1.8), s = chart(u, k1, k2, t);
    s += G("", '<path d="M270 70 V280" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="6 6"/>' + pill(270, 50, .7, 0, t) + bigX(270, 50, .45, (u - 1.9) / .4), clamp((u - 1.6) / .3));
    if (k2 > .9) s += bug(540, 70, .6, "url(#bacR)", t, { mood: "tough", shield: true });
    return s + tag("حاسس إنك أحسن", 230, 330, u, 1.3, -3, 16, "#bfe0ff") + tag("أقوى!", 470, 120, u, 3.6, 4, 20, "#ffc9a8");
  });
  // 17 — the dose and the days the doctor says: a doctor hands over the prescription; a blister strip empties day by day
  shot(17, pushC(320, 180, 1.04, 1.0), function (u, d, t) {
    var s = room(t) + guy(130, 210, 1.5, t, "happy", { coat: true }), k = clamp((u - .6) / (d - 1.2));
    s += G("translate(220 170) rotate(-8)", '<rect x="-30" y="-40" width="60" height="80" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>' + num("Rx", -6, -12, 20, "#e0663a") + '<path d="M-20 4 H20 M-20 16 H16 M-20 28 H10" stroke="' + INK + '" stroke-width="2"/>');
    s += '<rect x="300" y="80" width="300" height="180" rx="16" fill="#cfd4da" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 10; i++) { var x = 335 + (i % 5) * 58, y = 130 + Math.floor(i / 5) * 80, done = k * 10 > i; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="22" ry="32" fill="' + (done ? "#b8bec6" : "#eef1f4") + '" stroke="' + INK + '" stroke-width="2"/>' + (done ? '' : pill(x, y, .5, 90, t)); }
    return s + tag("الجرعة", 380, 60, u, .5, -3, 18) + tag("المدة", 530, 290, u, 1.6, 3, 18) + tag("زي ما الدكتور قال", 320, 330, u, 2.6, -2, 18, "#bfe8a8");
  });
  // 18 — it also kills the good bacteria in your gut, and the resistant ones take the space
  shot(18, pushC(320, 180, 1.0, 1.06), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#7a2a2a"/><ellipse cx="320" cy="180" rx="380" ry="200" fill="url(#gutG)" stroke="' + INK + '" stroke-width="4"/>', i, k = clamp((u - .9) / 1.8), g = clamp((u - 2.8) / 1.6);
    for (i = 0; i < 18; i++) { var x = -10 + i * 40; s += '<path d="M' + x + ' 0 q10 ' + f(30 + 6 * Math.sin(t * 2 + i)) + ' 20 0" fill="#e9a08a" stroke="' + INK + '" stroke-width="2"/><path d="M' + x + ' 360 q10 ' + f(-30 - 6 * Math.sin(t * 2 + i)) + ' 20 0" fill="#e9a08a" stroke="' + INK + '" stroke-width="2"/>'; }
    for (i = 0; i < 8; i++) { var bx = 100 + (i % 4) * 140, byy = 120 + Math.floor(i / 4) * 110, dead = hash(i + 9) < k;
      if (!dead) s += bug(bx, byy, .7, i % 2 ? "url(#bacB)" : "url(#bacG)", t, { mood: "happy", flip: i % 2 === 0 }); else if (hash(i + 13) < g) s += bug(bx, byy, .7, "url(#bacR)", t, { mood: "tough" }); else s += bug(bx, byy, .7, "url(#bacB)", t, { pop: clamp((k - hash(i + 9)) * 3) }); }
    for (i = 0; i < 5; i++) { var kk = clamp((u - .3 - i * .25) / 1.4); if (kk > 0 && kk < 1) s += pill(lerp(-40, 680, kk), 90 + i * 45, .55, 0, t); }
    return s + tag("البكتيريا الكويسة", 200, 320, u, .5, -3, 18, "#bfe0ff") + tag("المقاومة دخلت!", 470, 50, u, 3.4, 3, 18, "#ffc9a8");
  });
  // 19 — a resistant one hands the "weapon" to another: a glowing ring of genes crosses a bridge
  shot(19, pushC(320, 180, 1.0, 1.08), function (u, d, t) {
    var k = clamp((u - 1.0) / 1.8), s = micro(t);
    s += '<path d="M210 180 C260 150 380 150 430 180" stroke="' + INK + '" stroke-width="8" fill="none"/><path d="M210 180 C260 150 380 150 430 180" stroke="#e9d9a8" stroke-width="4" fill="none"/>';
    s += bug(150, 190, 1.4, "url(#bacR)", t, { mood: "happy", shield: true }) + bug(500, 190, 1.4, k > .95 ? "url(#bacR)" : "url(#bacG)", t, { mood: k > .95 ? "tough" : "curious", shield: k > .95, flip: true });
    var px = lerp(170, 480, k), py = 150 - 30 * Math.sin(k * Math.PI);
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(18 + 2 * Math.sin(t * 6)) + '" fill="none" stroke="#f2c230" stroke-width="8" filter="url(#glow)"/><circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(18 + 2 * Math.sin(t * 6)) + '" fill="none" stroke="#f2c230" stroke-width="6"/><circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(18 + 2 * Math.sin(t * 6)) + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
    return s + tag("حتة جينات", 320, 60, u, .7, -3, 20, "#fff2a8") + tag("بقت مقاومة!", 500, 310, u, 3.0, 3, 18, "#ffc9a8");
  });
  // 20 — the myth: «my body gets used to it» — no
  shot(20, pushC(300, 180, 1.06, 1.0), function (u, d, t) {
    var s = room(t) + guy(220, 210, 1.7, t, "n", { shirt: "#c8441f" });
    s += G("translate(440 90)", '<path d="M-110 -40 H110 Q130 -40 130 -20 V20 Q130 40 110 40 H-50 L-80 70 L-70 40 H-110 Q-130 40 -130 20 V-20 Q-130 -40 -110 -40 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + txt("جسمي اتعوّد", 0, 10, 26, INK, 900), clamp((u - .3) / .3));
    return s + bigX(440, 90, 1.5, (u - (d - .9)) / .45) + abBox(430, 260, .7, t);
  });
  // 21 — the bacteria learn, and pass from you to the next person
  shot(21, pushC(320, 190, 1.0, .96), function (u, d, t) {
    var s = room(t) + guy(150, 220, 1.3, t, "worry", { shirt: "#c8441f", sick: true }) + guy(500, 220, 1.3, t, u > 3 ? "shock" : "n", { shirt: "#3f8fbf" }), i;
    for (i = 0; i < 5; i++) { var p = clamp((u - 1.2 - i * .3) / 1.3), x = lerp(200, 460, p), y = 150 - 70 * Math.sin(p * Math.PI); if (p > 0 && p < 1) s += bug(x, y, .45, "url(#bacR)", t, { mood: "happy" }); }
    return s + tag("البكتيريا اتعلمت", 320, 60, u, .4, -3, 20, "#ffc9a8") + bug(150, 300, .5, "url(#bacR)", t, { mood: "tough", shield: true });
  });
  // 22 — the recap: three cards pop in one after the other
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, ease(k)), 180, lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f6f1e6"/>', cards = [[.3, 110], [2.4, 320], [4.6, 530]];
    cards.forEach(function (c, i) { var k = pop((u - c[0]) / 1.0); if (k <= 0) return; s += G('translate(' + c[1] + ' 180) scale(' + f(k) + ') rotate(' + f((i - 1) * 3 + Math.sin(t * 2.4 + i) * 3) + ')', '<rect x="-95" y="-120" width="190" height="240" rx="16" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="-70" cy="-96" r="16" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>' + num(String(i + 1), -70, -89, 20)); });
    if (u > .3) s += G("", bug(110, 140, .7, "url(#bacG)", t, { mood: "dizzy" }) + vir(110, 220, .7, t, "happy") + tick(160, 130, .4, (u - .8) / .4) + bigX(160, 220, .3, (u - 1.2) / .4), clamp((u - .3) / .4));
    if (u > 2.4) s += bug(320, 130, .7, "url(#bacG)", t, { pop: clamp((u - 2.8) / .6) }) + bug(320, 220, .8, "url(#bacR)", t, { mood: "tough", shield: true });
    if (u > 4.6) s += pill(530, 140, 1, -15, t, "happy") + txt("مش من دماغك", 530, 230, 20, "#c8441f", 900);
    return s;
  });
  // 23 — the oddest bit: Fleming, who discovered penicillin (1928: mould on a dish), warned about this more than 80 years ago
  shot(23, pushC(320, 180, 1.06, 1.0), function (u, d, t) {
    var s = room(t) + '<rect x="-400" y="250" width="1440" height="20" fill="#7a5534"/>', i;
    s += '<ellipse cx="420" cy="200" rx="160" ry="70" fill="#d9e4ea" stroke="' + INK + '" stroke-width="4"/><ellipse cx="420" cy="195" rx="146" ry="60" fill="#f0d590" stroke="' + INK + '" stroke-width="2"/>';
    s += '<ellipse cx="380" cy="185" rx="56" ry="26" fill="#f8efcc"/>';
    for (i = 0; i < 26; i++) { var x = 300 + hash(i) * 240, y = 160 + hash(i + 4) * 70; if (Math.hypot((x - 380) / 60, (y - 185) / 30) < 1.1 || Math.hypot((x - 420) / 140, (y - 195) / 56) > .95) continue; s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="7" ry="4" fill="#fff8e0" stroke="' + INK + '" stroke-width="1"/>'; }
    s += '<ellipse cx="380" cy="185" rx="' + f(26 + Math.sin(t * 2)) + '" ry="14" fill="#6f9a5a" stroke="' + INK + '" stroke-width="2"/><ellipse cx="380" cy="183" rx="12" ry="6" fill="#3f6a3a"/>';
    s += guy(140, 200, 1.5, t, u > 1 ? "curious" : "n", { coat: true, look: 1 }) + '<path d="M118 160 h44" stroke="' + INK + '" stroke-width="4"/>';
    return s + tag("فليمنج", 140, 60, u, .3, -3, 20) + tag("عفن البنسلين", 380, 100, u, 1.3, 3, 18, "#bfe8a8") + tag("من 80 سنة!", 470, 320, u, 3.1, -3, 20, "#ffc9a8");
  });
  // 24 — he said a small dose teaches the microbe how to resist it: the bacterium goes to school
  shot(24, pushC(320, 180, 1.0, 1.06), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#board)"/>' + txt("1945", 120, 70, 36, "#fff", 900);
    s += pill(160, 210 + Math.sin(t * 3) * 5, .9, -20 + Math.sin(t * 2) * 8, t, "worry") + tag("جرعة قليلة", 160, 300, u, .4, -3, 18, "#ffc9a8");
    s += arrowF(250, 200, 330, 200, (u - .9) / .4) + bug(460, 200, 1.6, u > 2 ? "url(#bacR)" : "url(#bacG)", t, { mood: u > 2 ? "tough" : "curious", hat: "grad", shield: u > 2.4 });
    return s + tag("اتعلّم يقاوم!", 460, 320, u, 2.6, 3, 18, "#fff2a8");
  });
  // 25 — that was the story: the pill bows out
  shot(25, pushC(320, 180, 1.0, 1.06), function (u, d, t) {
    return micro(t) + pill(320, 160, 2.2, Math.sin(t * 2) * 8, t, "happy") + bug(120, 270, .8, "url(#bacG)", t, { mood: "happy" }) + vir(520, 270, .9, t, "happy") + tag("الدكتور الأول!", 320, 320, u, .4, -3, 20, "#bfe8a8");
  });
  // 26 — outro
  shot(26, pushC(320, 180, 1.0, 1.05), function (u, d, t) {
    return micro(t) + crowd(t, function (i) { return i === STRONG ? { fill: "url(#bacR)", mood: "happy", shield: true } : { mood: "happy" }; }) + tag("قولولنا!", 320, 60, u, .3, 3, 26);
  });

  window.__parts = { bug: bug, vir: vir, pill: pill, hcell: hcell, guy: guy, micro: micro, abBox: abBox, tag: tag, crowd: crowd };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
