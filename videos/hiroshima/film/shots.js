
  // ── shots: one per script line. cam(u, d) → [cx, cy, zoom] in the 360×640 world; draw(u, d, t) → svg ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  var still = function (u, d) { return [180, 320, 1 + 0.04 * u / d]; };
  function tri(t, u, d, A, B, C) {   // three stacked panels (like the user's train triptych), each with its own slow move
    var y = [74, 206, 338], h = 126, s = R(0, 0, 360, 640, "#0b0c0e", { s: 0 }), arr = [A, B, C];
    for (var k = 0; k < 3; k++) { var kk = clamp((u - k * 0.35) / 0.5), m = 1 + 0.06 * u / d; s += G('translate(' + f((1 - eout(kk)) * (k % 2 ? -40 : 40)) + ' 0)', panelBox(y[k], h, arr[k](t), 'translate(180 ' + (h / 2) + ') scale(' + f2(m) + ') translate(-180 ' + (-h / 2) + ')', t), kk); }
    return s;
  }
  // morning city seen from above the river delta: mountains, rivers, rows of tiled roofs, the Dome by the T-bridge
  function cityWide(t, o) {
    o = o || {}; var s = sky(o.sky || "skyMorning") + cloudBank(t, 120, 3, 5, "#ffffff", .5) + mountains(250, o.mtn);
    s += R(-300, 260, 960, 700, o.ground || "#8a8a6a", { s: 0 }) + riverPlan(t, { col: o.river });
    s += houses(t, 290, 2, { sc: .7, burn: o.burn, flat: o.flat }) + houses(t, 352, 4, { sc: 1, burn: o.burn, flat: o.flat, skip: function (x, y) { return x > 140 && x < 220; } });
    if (o.dome !== false) s += dome(200, 300, .32, { ruin: o.ruin });
    return s;
  }
  function tramInterior(t, o) {   // inside the tram behind the girl driver, looking ahead through the three-pane windscreen (the user's train-interior reference)
    o = o || {}; var s = "", vx = 180, vy = 190, sp = o.speed == null ? 1 : o.speed;
    // the street ahead in perspective: sky, two rows of houses rushing past, the rails converging
    s += sky(o.ash ? "skyAsh" : "skyMorning") + (o.ash ? smoke(t, 0, 360, 200, 8, "#3a302a", .5) : cloudBank(t, 80, 3, 4, "#fff", .6) + mountains(170, ["#9fbccc", "#86a8b8", "#6f94a4"]));
    s += P('M-40 300 L' + (vx - 6) + ' ' + vy + ' L' + (vx + 6) + ' ' + vy + ' L400 300 Z', o.ash ? "#4a4036" : "#9a8f78", { s: 0 });
    s += '<path d="M120 300 L' + (vx - 2) + ' ' + vy + ' M240 300 L' + (vx + 2) + ' ' + vy + ' M90 300 L' + (vx - 4) + ' ' + vy + ' M270 300 L' + (vx + 4) + ' ' + vy + '" stroke="#3a342a" stroke-width="1.6"/>';
    for (var i = 0; i < 7; i++) { var k = ((t * .35 * sp + i / 7) % 1), z = k * k, side = i % 2 ? 1 : -1, x = vx + side * (12 + z * 230), y = vy + z * 110, w = 8 + z * 120, h = 6 + z * 100;
      s += G('translate(' + f(x - (side < 0 ? w : 0)) + ' ' + f(y) + ')', o.ash ? P('M0 0 l' + f(w * .3) + ' ' + f(-h * .3) + ' l' + f(w * .4) + ' ' + f(h * .2) + ' l' + f(w * .3) + ' ' + f(-h * .1) + ' V0 Z', "#2a221c", { w: 1 }) : house(0, 0, w, h, i)); }
    for (var p = 0; p < 4; p++) { var kp = ((t * .35 * sp + p / 4 + .1) % 1), zp = kp * kp, xp = vx - (20 + zp * 260); s += R(xp, vy + zp * 110 - (10 + zp * 220), 1 + zp * 6, 10 + zp * 220, "#3a3026", { w: .8 }); }
    s += '<path d="M' + (vx - 30) + ' ' + (vy - 30) + ' L-60 30" stroke="' + INK + '" stroke-width="1"/>';
    // the cab: dark frame with three panes, ceiling, dashboard, brass controller
    var cab = o.dark ? "#1c1e22" : "#2a3442", trim = o.dark ? "#2a2c30" : "#3a4656";
    s += '<path fill-rule="evenodd" d="M-60 -60 H420 V700 H-60 Z M26 84 H118 V286 H26 Z M128 78 H232 V290 H128 Z M242 84 H334 V286 H242 Z" fill="' + cab + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M26 84 H118 V286 H26 Z M128 78 H232 V290 H128 Z M242 84 H334 V286 H242 Z" fill="#cfe6f4" opacity=".08" stroke="' + INK + '" stroke-width="3"/>';
    s += P('M-60 300 H420 V340 H-60 Z', trim, { w: 2 }) + P('M-60 -60 H420 V40 Q180 70 -60 40 Z', o.dark ? "#141518" : "#1e2630", { w: 2 });
    for (var h2 = 0; h2 < 5; h2++) { var hx = 30 + h2 * 75; s += '<path d="M' + hx + ' 44 v18" stroke="#8a7a5a" stroke-width="2"/>' + G('rotate(' + f(Math.sin(t * 2.2 + h2) * 9) + ' ' + hx + ' 44)', '<circle cx="' + hx + '" cy="70" r="7" fill="none" stroke="#c9a860" stroke-width="2.6"/>'); }
    if (!o.ash) s += rays(t, -10, 120, .35, 5, 420, .45);
    s += R(60, 318, 70, 46, "#9a7a3a", { w: 1.6 }) + '<circle cx="95" cy="320" r="18" fill="#7a5a2a" stroke="' + INK + '" stroke-width="1.4"/>' + G('rotate(' + f(-25 + Math.sin(t * .9) * 10) + ' 95 320)', R(92, 290, 6, 32, "#1c1c1c", { w: 1 }) + '<circle cx="95" cy="288" r="6" fill="#1c1c1c"/>');
    // the girl from behind: short black bob, navy cap, white short-sleeved blouse, her right hand on the controller
    var b = Math.sin(t * 3 * sp) * 1.4, top = o.dark ? "#a8a49a" : "#f0ede4";
    s += G('translate(0 ' + f(b) + ')', P('M110 520 L120 400 Q126 352 186 346 Q246 352 252 400 L262 520 Z', top, {}) + P('M150 400 Q186 418 222 400', "none", { w: 1.2 }) +
      P('M128 380 Q100 360 98 312 L110 306 Q118 350 142 366 Z', top, { w: 1.4 }) + '<circle cx="100" cy="304" r="9" fill="#d9aa82" stroke="' + INK + '" stroke-width="1.2"/>' +
      P('M158 352 Q154 290 186 286 Q218 290 214 352 L216 362 Q186 352 156 362 Z', "#16130f", {}) + P('M154 296 Q186 266 218 296 L220 306 H152 Z', "#26304a", {}) + R(148, 302, 76, 7, "#26304a", { w: 1.2 }) + R(176, 290, 20, 6, "#c9a860", { w: .8 }));
    return s + dust(t, 22, "#fff6dc", .45);
  }

  // 0 — 8:15 in the morning… and in one second a whole city was gone (the stopped watch, now in the Peace Memorial Museum)
  shot(0, push([180, 300], [180, 290], 1.0, 1.25), function (u, d, t) {
    var stop = u > d * .55, s = R(-200, -200, 760, 1040, "#1a1512", { s: 0 }) + '<circle cx="180" cy="290" r="260" fill="url(#warm)" opacity=".25"/>';
    s += watch(180, 290, 92, t, { h: 8 + 14.5 / 60 + (stop ? 0.25 / 60 : clamp(u / (d * .55)) * .25 / 60), sec: stop ? 0 : -60 + u / (d * .55) * 60, crack: stop, burnt: stop });
    if (stop) { var k = clamp((u - d * .55) / .35); s += R(-200, -200, 760, 1040, "#fff", { s: 0, op: (1 - k) * .9 }); }
    return s + dust(t, 18, "#ffd98a", .4) + bigNum("8:15", 180, 135, u, d * .2, 40, "#f2e6c8");
  });
  // 1 — how could one bomb wipe out a city of about 350,000 people?
  shot(1, push([180, 330], [200, 340], 1.15, 1.0), function (u, d, t) { return cityWide(t) + dust(t, 12) + bigNum("350,000", 180, 170, u, .6, 40, "#fff") + label("إنسان", 180, 205, u, 1.0, 20, "#f2c230"); });
  // 2 — and the people there… what were they doing at that very moment?
  shot(2, push([180, 330], [200, 320], 1.0, 1.08), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 80, 4, 4, "#fff", .6) + mountains(200) + R(-300, 300, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 9; i++) s += house(-60 + i * 56, 300, 52, 80, i);
    s += R(-300, 300, 960, 120, "#9a8f78", { s: 0 }) + '<path d="M-300 352 H700 M-300 362 H700" stroke="#5a5446" stroke-width="2"/>' + '<path d="M-300 140 H700" stroke="' + INK + '" stroke-width="1"/>';
    s += tramSide(((t * 40) % 760) - 200, 356, .7, t, { dir: 1, speed: 1, people: true });
    return s + crowd(t, 420, 9, 1.1) + rays(t, -20, 60, .7, 4, 600, .35) + dust(t, 14);
  });
  // 3 — what's the story? let me tell you from the beginning (title card: the Dome in the morning sun)
  shot(3, push([180, 300], [180, 310], 1.12, 1.0), function (u, d, t) {
    var s = sky("skyMorning") + '<circle cx="270" cy="150" r="90" fill="url(#warm)"/>' + cloudBank(t, 100, 3, 4, "#fff", .55) + mountains(330) + R(-300, 360, 960, 400, "url(#river)", { s: 0 });
    s += dome(180, 370, .9, {}) + R(-300, 368, 960, 6, "#6a6050", { s: 0 });
    for (var i = 0; i < 8; i++) s += '<path d="M' + f(((t * 10 + i * 60) % 420) - 30) + ' ' + (390 + i * 8) + ' h22" stroke="#e8f4fa" stroke-width="1.2" opacity=".5"/>';
    return s + rays(t, 300, 120, 2.3, 5, 500, .4) + label("هيروشيما", 180, 160, u, .3, 46, "#fff") + label("1945", 180, 200, u, .8, 22, "#f2c230") + dust(t, 14);
  });
  // 4 — Hiroshima, Japan, 6 August 1945 (a wall calendar in the morning light)
  shot(4, push([180, 300], [180, 300], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9b896", { s: 0 }) + rays(t, -40, 40, .6, 6, 600, .45);
    s += R(90, 150, 180, 230, "#f4eedd", { w: 2 }) + R(90, 150, 180, 44, "#b8322a", { w: 2 }) + '<circle cx="130" cy="146" r="5" fill="#3a3026"/><circle cx="230" cy="146" r="5" fill="#3a3026"/>';
    s += txt("أغسطس", 180, 182, 22, "#fff", { wt: 900 }) + txt("6", 180, 300, 110, "#2a2420", { font: "Noto Serif", wt: 700 }) + txt("1945", 180, 352, 22, "#5a4a3a", { font: "Noto Serif", wt: 700 });
    var k = clamp(u / d); s += P('M90 150 h180 v' + f(10 + k * 6) + ' Q180 ' + f(170 + Math.sin(t * 2) * 3) + ' 90 ' + f(160 + k * 4) + ' Z', "#f4eedd", { w: 1, op: .6 });
    return s + dust(t, 20, "#fff6dc", .6) + label("هيروشيما · اليابان", 180, 430, u, .6, 20, "#f2c230");
  });
  // 5 — an ordinary summer day, a clear sky, and the tram running through the streets
  shot(5, push([160, 330], [200, 330], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 90, 6, 5, "#fff", .7) + mountains(220) + R(-300, 300, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 10; i++) s += house(-120 + i * 58 - (t * 6 % 58), 300, 54, 86, i);
    s += R(-300, 300, 960, 200, "#8f8670", { s: 0 }) + '<path d="M-300 392 H700 M-300 402 H700" stroke="#4a4436" stroke-width="2"/>';
    for (var p = 0; p < 6; p++) { var px = -60 + p * 110 - (t * 6 % 110); s += R(px, 160, 5, 232, "#3a3026", { w: 1 }); } s += '<path d="M-300 176 H700" stroke="' + INK + '" stroke-width="1"/>';
    s += tramSide(lerp(-60, 300, clamp(u / d)), 396, .9, t, { dir: 1, speed: 1.5, people: true, num: "651" });
    return s + crowd(t, 460, 6, 1.2) + dust(t, 12);
  });
  // 6 — the odd thing: the tram drivers were young girls, 14 and 15 years old
  shot(6, push([180, 340], [180, 360], 1.0, 1.1), function (u, d, t) { return tramInterior(t) + label("14 · 15 سنة", 180, 165, u, 1.0, 28, "#f2c230"); });
  // 7 — the men were at war, so the tram company opened a school and taught the girls to drive (triptych)
  shot(7, still, function (u, d, t) {
    return tri(t, u, d,
      function (t) { var s = R(-100, -100, 560, 400, "#d9cfb6", { s: 0 }) + R(0, 0, 360, 60, "#b5a37f", { s: 0 }) + R(140, 10, 80, 44, "#2f3a34", { w: 1.4 }) + txt("家政女学校", 180, 40, 13, "#f2f0ea", { font: "Noto Serif", wt: 700 }); for (var i = 0; i < 7; i++) s += person(40 + i * 46, 124, 1.3, t, { hair: "bob", top: "#f0ede4", pants: "#2a3446", cap: i % 2 ? null : null }); return s + rays(t, 0, 0, .6, 3, 400, .35); },
      function (t) { var s = R(-100, -100, 560, 400, "#2b2e33", { s: 0 }) + R(120, 30, 120, 100, "#c9a860", { w: 2 }) + '<circle cx="180" cy="70" r="30" fill="#8a7a5a" stroke="' + INK + '" stroke-width="1.6"/>'; s += G('rotate(' + f(-30 + Math.sin(t * 1.2) * 25) + ' 180 70)', R(176, 26, 8, 46, "#1c1c1c", { w: 1 }) + '<circle cx="180" cy="24" r="8" fill="#1c1c1c"/>'); return s + P('M200 140 Q190 60 180 30 Q196 22 206 36 Q214 70 230 140 Z', "#e0b48c", {}) + P('M180 140 L186 110 Q204 100 236 112 L240 140 Z', "#f0ede4", {}); },
      function (t) { return R(-100, -100, 560, 400, "#9fc4d6", { s: 0 }) + mountains(70, ["#8aa8b8", "#7090a0", "#5a7a88"]) + R(-100, 100, 560, 100, "#8f8670", { s: 0 }) + tramFront(180 + Math.sin(t * .6) * 6, 118, .62, t, { driver: true, num: "651" }); });
  });
  // 8 — a little after 7 the air-raid siren went off… an American plane over the city
  shot(8, push([180, 330], [180, 280], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 140, 4, 4, "#fff", .5) + mountains(320) + R(-300, 380, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 8; i++) s += house(-40 + i * 56, 380, 52, 80, i);
    s += siren(90, 230, .8, t, true) + b29side(lerp(420, -60, clamp(u / d)), 110, .18, t, { flip: true });
    for (var j = 0; j < 5; j++) s += person(160 + j * 36, 470, 1.2, t, { look: "up", hair: j % 2 ? "bob" : null, top: ["#f0ede4", "#6a7a8a", "#e8d9b8"][j % 3] });
    return s + label("7:09", 280, 210, u, .4, 26, "#f2c230") + dust(t, 10);
  });
  // 9 — but the plane turned and left, the alarm was called off, and people said: thank God, it's over
  shot(9, push([180, 300], [180, 330], 1.1, 1.0), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 140, 5, 5, "#fff", .6) + mountains(320) + R(-300, 380, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 8; i++) s += house(-40 + i * 56, 380, 52, 80, i);
    s += siren(90, 230, .8, t, false) + b29side(lerp(80, -80, clamp(u / d)), 100, .1, t, { flip: true });
    s += crowd(t, 470, 8, 1.2);
    return s + rays(t, 320, 40, 2.2, 5, 600, .4) + label("7:31 · الأمان", 260, 210, u, .5, 22, "#bfe8b8") + dust(t, 12);
  });
  // 10 — everyone went back to work: schoolchildren in the streets, mothers in the kitchens, the tram packed (triptych)
  shot(10, still, function (u, d, t) {
    return tri(t, u, d,
      function (t) { var s = sky("skyMorning") + R(-100, 70, 560, 100, "#a59a82", { s: 0 }); for (var i = 0; i < 6; i++) s += house(-20 + i * 70, 80, 64, 70, i); for (var j = 0; j < 8; j++) s += person(((j * 50 + t * 12) % 420) - 30, 118, 1.0, t, { walk: true, ph: j, cap: "#2f3542", top: "#f0ede4", pants: "#3a4252", bag: true }); return s; },
      function (t) { var s = R(-100, -100, 560, 400, "#4a3a2a", { s: 0 }) + R(40, 70, 280, 60, "#6a5040", { w: 1.4 }) + '<ellipse cx="220" cy="66" rx="40" ry="12" fill="#2a2a2a" stroke="' + INK + '"/>' + flames(t, 196, 244, 76, 14, 5, .9) + R(196, 40, 48, 26, "#3a3a3a", { w: 1.4 }); for (var k = 0; k < 4; k++) { var uu = (t * .4 + k / 4) % 1; s += '<circle cx="' + f(220 + Math.sin(t + k) * 10) + '" cy="' + f(36 - uu * 50) + '" r="' + f(8 + uu * 14) + '" fill="#e8e4dc" opacity="' + f2(.5 * (1 - uu)) + '"/>'; } return s + person(120, 122, 1.4, t, { top: "#8a5a5a", pants: "#3a3030", hair: "bob" }) + rays(t, 0, 0, .7, 3, 400, .4); },
      function (t) { var s = R(-100, -100, 560, 400, "#8f8670", { s: 0 }) + tramSide(180 + Math.sin(t) * 3, 124, .9, t, { dir: 1, people: true }); for (var p = 0; p < 4; p++) s += person(250 + p * 9, 104 + (p % 2) * 4, .8, t, { top: ["#f0ede4", "#6a7a8a"][p % 2] }); return s; });
  });
  // 11 — but above the clouds, at 9.5 km, there was another plane: «Enola Gay»
  shot(11, push([200, 300], [170, 300], 1.0, 1.15), function (u, d, t) {
    var s = sky("skyHigh") + '<circle cx="320" cy="90" r="40" fill="#fff6dc" filter="url(#soft)"/>' + cloudBank(t, 420, -30, 7, "#eef3f8", .95, 1.4) + cloudBank(t, 470, -60, 6, "#d9e4ee", 1, 1.6);
    s += b29side(190 + Math.sin(t * .5) * 6, 300 + Math.sin(t * .8) * 4, .95, t, { glint: true });
    for (var i = 0; i < 10; i++) { var x = ((-t * 260 + i * 60) % 500 + 500) % 500 - 80; s += '<path d="M' + f(x) + ' ' + (180 + i * 30) + ' h40" stroke="#fff" stroke-width="1" opacity=".35"/>'; }
    return s + label("9.5 كم", 90, 150, u, .5, 26, "#fff") + label("Enola Gay", 240, 210, u, 1.2, 22, "#f2c230");
  });
  // 12 — and in its belly a single bomb, named «Little Boy»
  shot(12, push([180, 320], [180, 320], 1.05, 1.2), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#1a1e24", { s: 0 }) + R(40, 180, 280, 260, "#2a3038", { w: 2 });
    for (var i = 0; i < 7; i++) s += '<path d="M' + (40 + i * 46) + ' 180 V440" stroke="#3a424c" stroke-width="3"/>' + '<circle cx="' + (40 + i * 46) + '" cy="190" r="2" fill="#6a737c"/>';
    s += '<path d="M180 180 V280" stroke="#8a929c" stroke-width="3"/>' + littleBoy(180, 300 + Math.sin(t * 1.5) * 2, 1.25, 0, {});
    s += '<circle cx="180" cy="300" r="140" fill="url(#warm)" opacity=".15"/>';
    return s + rays(t, 180, 160, 1.57, 3, 300, .25) + label("Little Boy", 180, 140, u, .3, 26, "#f2c230") + label("3 متر · 4 طن", 180, 410, u, 1.0, 18, "#fff");
  });
  // 13 — at exactly 8:15 the doors opened and the bomb fell
  shot(13, push([180, 300], [180, 360], 1.0, 1.1), function (u, d, t) {
    var door = clamp(u / .8), fall = clamp((u - 1.0) / (d - 1.0));
    var s = sky("skyHigh") + cloudBank(t, 560, -40, 6, "#eef3f8", .9, 1.3);
    s += b29below(180, 190 - fall * 30, .95, t, { door: door });
    if (u > 0.9) s += littleBoy(180, 240 + fall * fall * 400, .5, 90 + Math.sin(t * 3) * 3, {});
    return s + label("8:15", 300, 120, u, .1, 30, "#f2c230");
  });
  // 14 — 43 seconds as it fell… and the people below hadn't noticed (split: the bomb above, the tram below)
  shot(14, still, function (u, d, t) {
    var n = Math.max(0, 43 - Math.floor(u / d * 30)), s = R(0, 0, 360, 640, "#0b0c0e", { s: 0 });
    s += panelBox(70, 190, sky("skyHigh") + cloudBank(t, 140, -60, 6, "#eef3f8", .7, 1) + littleBoy(180, 95 + Math.sin(t * 4) * 1.5, .7, 90, {}) + (function () { var q = ""; for (var i = 0; i < 12; i++) { var y = ((t * 300 + i * 40) % 260) - 40; q += '<path d="M' + (60 + hash(i) * 240) + ' ' + f(y) + ' v-30" stroke="#fff" stroke-width="1" opacity=".5"/>'; } return q; })(), "", t);
    s += panelBox(266, 194, R(-100, -100, 560, 400, "#bfe0f0", { s: 0 }) + mountains(90, ["#9fbccc", "#86a8b8", "#6f94a4"]) + R(-100, 120, 560, 120, "#8f8670", { s: 0 }) + tramSide(((t * 30) % 600) - 120, 150, .55, t, { dir: 1, speed: 1, people: true }) + crowd(t, 186, 6, .8), "", t);
    return s + txt(String(n), 300, 130, 52, "#f2c230", { font: "Noto Serif", wt: 700, st: "rgba(0,0,0,.7)", sw: 5 }) + txt("ثانية", 300, 156, 14, "#fff", { st: "rgba(0,0,0,.7)", sw: 4 });
  });
  // 15 — and at about 600 m above the city… it exploded (a dot over the Dome, then white)
  shot(15, push([200, 330], [200, 320], 1.0, 1.08), function (u, d, t) {
    var k = clamp((u - d * .72) / .25), s = cityWide(t);
    if (u < d * .72) s += '<circle cx="200" cy="' + f(lerp(120, 205, u / (d * .72))) + '" r="2.4" fill="' + INK + '"/>' + '<path d="M200 300 V215" stroke="#fff" stroke-dasharray="3 4" stroke-width="1" opacity=".6"/>' + label("600 م", 240, 260, u, .6, 16, "#fff");
    else s += '<circle cx="200" cy="205" r="' + f(4 + k * 60) + '" fill="#fff"/>' + R(-200, -200, 760, 1040, "#fff", { s: 0, op: k });
    return s;
  });
  // 16 — a white light stronger than the sun, and heat on the ground of thousands of degrees
  shot(16, push([180, 300], [180, 320], 1.25, 1.0), function (u, d, t) {
    var k = clamp(u / d), s = R(-200, -200, 760, 1040, "#fff8e0", { s: 0 }) + cityWide(t, { sky: "skyFire", flat: function () { return 0; } }).replace(/fill="#(3d434b|4a5059|353a41)"/g, 'fill="#e8d0a8"');
    s += R(-200, -200, 760, 1040, "#fff3cc", { s: 0, op: .55 * (1 - k) }) + fireball(200, 210, 50 + k * 50, t);
    for (var i = 0; i < 14; i++) { var y = 330 + i * 20; s += '<path d="M-20 ' + y + ' Q90 ' + f(y - 6 + Math.sin(t * 6 + i) * 4) + ' 180 ' + y + ' T380 ' + y + '" stroke="#fff3cc" stroke-width="1.4" fill="none" opacity=".35"/>'; }
    return s + bigNum("+3000°", 180, 130, u, .9, 42, "#fff") ;
  });
  // 17 — those who were close didn't have time to feel anything (the street figures dissolve into the light)
  shot(17, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) {
    var k = clamp(u / (d * .8)), s = R(-200, -200, 760, 1040, "#f6e6c4", { s: 0 }) + rays(t, 180, -60, 1.57, 9, 900, .8);
    for (var i = 0; i < 7; i++) { var x = 50 + i * 44, kk = clamp(k * 1.4 - i * .06); s += silhouette(x, 470, 1.6, "#2a201a", { op: 1 - kk }) + '<circle cx="' + x + '" cy="420" r="' + f(kk * 40) + '" fill="#fff" opacity="' + f2(kk * (1 - kk) * 2) + '" filter="url(#soft2)"/>'; }
    return s + dust(t, 40, "#fff", .8) + R(-200, -200, 760, 1040, "#fff", { s: 0, op: .2 + .1 * Math.sin(t * 3) });
  });
  // 18 — a man sitting on a bank's steps waiting for it to open: only his shadow, burnt into the stone, was left
  shot(18, push([180, 360], [180, 380], 1.0, 1.2), function (u, d, t) {
    var k = clamp((u - d * .35) / .4), s = R(-200, -200, 760, 1040, "#7a7366", { s: 0 });
    for (var i = 0; i < 6; i++) s += P('M-100 ' + (300 + i * 40) + ' H460 V' + (340 + i * 40) + ' H-100 Z', ["#a49c8c", "#958d7e"][i % 2], { w: 1.4 });
    s += R(60, 60, 60, 240, "#8a8272", { w: 1.6 }) + R(240, 60, 60, 240, "#8a8272", { w: 1.6 }) + R(120, 100, 120, 200, "#2a2620", { w: 1.6 });
    var man = P('M150 380 Q146 344 160 330 Q176 326 182 344 L190 380 L222 384 L224 420 L212 420 L210 398 L176 398 Q156 400 150 380 Z', "#2a2420", { s: 0 }) + '<circle cx="168" cy="314" r="13" fill="#2a2420"/>';
    s += u < d * .35 ? man : G('', man, 1 - k) + G('', man.replace(/#2a2420/g, "#2a2622"), .6 * k);
    if (u > d * .3) s += R(-200, -200, 760, 1040, "#fff", { s: 0, op: clamp(1 - (u - d * .3) / .5) });
    return s + dust(t, 14, "#d9cfb6", .5) + label("سلم بنك سوميتومو", 180, 150, u, d * .6, 18, "#fff");
  });
  // 19 — seconds later a pressure wave flattened the houses for kilometres
  shot(19, push([200, 330], [190, 340], 1.05, 1.0), function (u, d, t) {
    var r = u / d * 420, s = cityWide(t, { sky: "skyFire", burn: true, flat: function (x, y) { var dd = Math.hypot(x - 200, (y - 210) * 1.8); return clamp((r - dd + 30) / 60); } });
    s += '<ellipse cx="200" cy="330" rx="' + f(r) + '" ry="' + f(r * .4) + '" fill="none" stroke="#fff3cc" stroke-width="' + f(10 - u) + '" opacity=".7"/>' + '<ellipse cx="200" cy="330" rx="' + f(r * .9) + '" ry="' + f(r * .36) + '" fill="#d9b48a" opacity=".25"/>';
    for (var i = 0; i < 30; i++) { var a = hash(i) * 6.28, rr = r * (.6 + hash(i + 3) * .4); s += R(200 + Math.cos(a) * rr, 330 + Math.sin(a) * rr * .4 - hash(i) * 40, 4, 3, "#3a2a20", { s: 0 }); }
    return s + fireball(200, 210, 46, t) + label("موجة ضغط", 180, 130, u, .5, 26, "#fff");
  });
  // 20 — then the fire caught the wood… and the whole city burned
  shot(20, push([180, 330], [200, 320], 1.0, 1.1), function (u, d, t) {
    var s = cityWide(t, { sky: "skyFire", burn: true, flat: function () { return .9; }, ruin: true, ground: "#3a2a20", river: "#4a3020" });
    return s + smoke(t, -40, 400, 360, 18, "#1e1612", .6) + flames(t, -20, 380, 420, 70, 26, .85) + flames(t, -20, 380, 360, 40, 18, .7) + dust(t, 40, "#ffb44a", .8, 3);
  });
  // 21 — more than 70,000 people died that same day
  shot(21, push([180, 320], [180, 330], 1.1, 1.0), function (u, d, t) {
    var s = sky("skyAsh") + smoke(t, -40, 400, 380, 14, "#2a2220", .5) + R(-300, 380, 960, 400, "#3a3028", { s: 0 });
    for (var i = 0; i < 20; i++) s += P('M' + (-60 + i * 26) + ' 400 l' + f(6 + hash(i) * 12) + ' ' + f(-8 - hash(i + 1) * 20) + ' l' + f(8 + hash(i + 2) * 10) + ' ' + f(10 + hash(i) * 10) + ' Z', "#2a221c", { w: 1 });
    return s + dome(180, 392, .85, { ruin: true, night: true }) + dust(t, 30, "#9a8a7a", .5) + bigNum("70,000+", 180, 180, u, .8, 46, "#fff");
  });
  // 22 — and on the survivors a strange rain fell… black rain
  shot(22, push([180, 330], [180, 350], 1.0, 1.15), function (u, d, t) {
    var s = sky("skyAsh") + R(-300, 380, 960, 400, "#2f2822", { s: 0 }) + dome(250, 392, .5, { ruin: true, night: true });
    s += P('M150 520 L148 420 Q150 380 170 376 Q190 380 192 420 L196 520 Z', "#4a4440", {}) + '<circle cx="170" cy="360" r="15" fill="#3a3430" stroke="' + INK + '" stroke-width="1.4"/>' + P('M190 400 L236 384 L238 392 L192 412 Z', "#4a4440", { w: 1.4 });
    for (var i = 0; i < 90; i++) { var x = hash(i) * 460 - 50, y = ((t * 380 + hash(i + 7) * 700) % 700) - 60; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-3 16" stroke="#0e0c0a" stroke-width="1.6" opacity=".75"/>'; }
    for (var j = 0; j < 6; j++) { var uu = (t * 1.5 + j / 6) % 1; s += '<ellipse cx="' + f(60 + j * 50) + '" cy="' + f(470 + (j % 3) * 20) + '" rx="' + f(uu * 14) + '" ry="' + f(uu * 4) + '" fill="none" stroke="#5a5048" opacity="' + f2(1 - uu) + '"/>'; }
    return s + label("مطر إسود", 180, 170, u, .9, 30, "#fff");
  });
  // 23 — many fell ill months and years later, from something they didn't know: radiation
  shot(23, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9c0ad", { s: 0 }) + R(-200, 380, 760, 400, "#a59a86", { s: 0 }) + R(220, 100, 110, 160, "#e8eef0", { w: 2 }) + rays(t, 230, 110, 2.4, 5, 400, .5);
    for (var i = 0; i < 3; i++) { var x = 20 + i * 120; s += R(x, 380, 100, 26, "#f0ede4", { w: 1.6 }) + R(x, 406, 6, 50, "#6a6a6a", { w: 1 }) + R(x + 94, 406, 6, 50, "#6a6a6a", { w: 1 }) + '<circle cx="' + (x + 16) + '" cy="372" r="11" fill="#d9aa82" stroke="' + INK + '" stroke-width="1.2"/>' + P('M' + (x + 24) + ' 384 Q' + (x + 60) + ' ' + f(370 + Math.sin(t * 1.2 + i) * 2) + ' ' + (x + 98) + ' 384 Z', "#e2ddd0", { w: 1.2 }); }
    for (var j = 0; j < 40; j++) { var px = hash(j) * 360, py = ((hash(j + 4) * 640 - t * 14) % 640 + 640) % 640; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="1.6" fill="#7ad9a0" opacity="' + f2(.3 + .3 * Math.sin(t * 3 + j)) + '"/>'; }
    return s + label("الإشعاع", 180, 190, u, d * .55, 34, "#7ad9a0");
  });
  // 24 — by the end of the year the toll reached about 140,000 (candles lighting up one after another)
  shot(24, push([180, 330], [180, 300], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#0e0d10", { s: 0 }), n = Math.floor(clamp(u / (d * .8)) * 140);
    for (var i = 0; i < 140; i++) { var x = 14 + (i % 14) * 25, y = 230 + Math.floor(i / 14) * 24; if (i > n) { s += '<circle cx="' + x + '" cy="' + y + '" r="1.5" fill="#3a3430"/>'; continue; } var fl = .7 + .3 * Math.sin(t * 7 + i); s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#ffb44a" opacity="' + f2(.25 * fl) + '"/><ellipse cx="' + x + '" cy="' + f(y - 1) + '" rx="1.8" ry="' + f(3.5 * fl) + '" fill="#ffe2a0"/>'; }
    return s + txt(String(n * 1000).replace(/\B(?=(\d{3})+(?!\d))/g, ","), 180, 190, 46, "#f2c230", { font: "Noto Serif", wt: 700 }) + label("آخر 1945", 180, 140, u, .4, 18, "#d9d4c8");
  });
  // 25 — only three days later a second bomb fell on Nagasaki
  shot(25, push([180, 300], [180, 330], 1.0, 1.1), function (u, d, t) {
    var k = clamp(u / d), s = sky("skyHigh") + mountains(330, ["#5a7a6a", "#4a6a5a", "#3a5a4a"]) + R(-300, 400, 960, 400, "url(#river)", { s: 0 });
    s += mushroom(200, 380, 200 + k * 140, t, {}) + houses(t, 410, 2, { sc: .6 });
    return s + label("ناجازاكي", 180, 140, u, .4, 34, "#fff") + label("9 أغسطس", 180, 172, u, .9, 20, "#f2c230");
  });
  // 26 — one story never forgotten: Sadako, two years old on the day of the bomb
  shot(26, push([180, 340], [180, 320], 1.05, 1.15), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#2a2420", { s: 0 }) + '<circle cx="180" cy="320" r="200" fill="url(#warm)" opacity=".35"/>' + R(80, 170, 200, 250, "#e8dcc0", { w: 2 }) + R(92, 182, 176, 200, "#b8a888", { w: 1.2 });
    s += P('M120 382 Q122 300 180 296 Q238 300 240 382 Z', "#c9a8a0", { w: 1.6 }) + '<circle cx="180" cy="262" r="38" fill="#e0b48c" stroke="' + INK + '" stroke-width="1.6"/>' + P('M142 258 Q140 218 180 216 Q220 218 218 258 Q206 240 180 240 Q154 240 142 258 Z', "#16130f", {}) + '<circle cx="166" cy="266" r="2.6" fill="' + INK + '"/><circle cx="194" cy="266" r="2.6" fill="' + INK + '"/><path d="M172 282 Q180 287 188 282" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    s += P('M80 170 h200 v250 h-200 Z', "#5a4a3a", { s: 0, op: .15 + .05 * Math.sin(t) });
    return s + crane(285, 410, .9, "#e8443a", t, { flap: 2 }) + dust(t, 16, "#ffd98a", .5) + label("ساداكو ساساكي", 180, 150, u, .5, 24, "#fff") + label("سنتين", 180, 450, u, 1.2, 20, "#f2c230");
  });
  // 27 — when she turned twelve she got leukaemia from the radiation
  shot(27, push([180, 330], [190, 340], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#d9d4c8", { s: 0 }) + R(200, 110, 130, 180, "#bfe0f0", { w: 2 }) + '<path d="M265 110 V290 M200 200 H330" stroke="#d9cfb6" stroke-width="5"/>' + rays(t, 210, 130, 2.5, 5, 400, .5);
    s += R(30, 360, 260, 40, "#f0ede4", { w: 2 }) + R(30, 400, 8, 80, "#6a6a6a", { w: 1 }) + R(282, 400, 8, 80, "#6a6a6a", { w: 1 }) + R(30, 330, 10, 70, "#8a8a8a", { w: 1 });
    s += '<ellipse cx="80" cy="356" rx="30" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>' + '<circle cx="84" cy="340" r="17" fill="#e0b48c" stroke="' + INK + '" stroke-width="1.4"/>' + P('M68 338 Q66 320 84 320 Q102 320 100 338 Q92 330 84 330 Q76 330 68 338 Z', "#16130f", {});
    s += P('M100 362 Q190 ' + f(344 + Math.sin(t * 1.1) * 2) + ' 286 362 Z', "#c9d6e0", { w: 1.4 });
    return s + dust(t, 14, "#fff6dc", .5) + label("12 سنة", 180, 160, u, .4, 26, "#f2c230") + label("سرطان الدم", 180, 196, u, 1.0, 20, "#fff");
  });
  // 28 — she believed that if she folded a thousand paper cranes, her wish would come true and she'd get well
  shot(28, push([180, 320], [180, 300], 1.15, 1.0), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#3a3026", { s: 0 }) + '<circle cx="180" cy="300" r="220" fill="url(#warm)" opacity=".3"/>', n = Math.floor(clamp(u / d) * 60), cols = ["#e8443a", "#f2c230", "#5fa3d9", "#7ac27a", "#e88ac0", "#f0ede4"];
    for (var i = 0; i < 6; i++) { s += '<path d="M' + (40 + i * 56) + ' 60 V' + 260 + '" stroke="#d9cfb6" stroke-width="1"/>'; for (var j = 0; j < 10; j++) { var idx = i * 10 + j; if (idx > n) continue; s += crane(40 + i * 56 + Math.sin(t + idx) * 2, 80 + j * 20, .32, cols[(i + j) % 6], t, { ph: idx, flap: 1.5 }); } }
    s += P('M90 470 Q120 400 170 392 L190 392 Q240 400 270 470 Z', "#e0b48c", {}) + crane(180, 380, 1.1, "#e8443a", t, { flap: 3 });
    return s + bigNum(String(Math.round(n * 1000 / 60)), 180, 330, u, .1, 34, "#f2c230") + label("ألف كركي", 180, 296, u, 1.2, 18, "#fff");
  });
  // 29 — she kept folding paper on her hospital bed until the last day of her life (the empty bed, cranes in the breeze)
  shot(29, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9c0ad", { s: 0 }) + R(200, 110, 130, 180, "#f6e6c4", { w: 2 }) + '<path d="M265 110 V290 M200 200 H330" stroke="#d9cfb6" stroke-width="5"/>' + rays(t, 210, 130, 2.5, 6, 500, .6);
    s += R(30, 360, 260, 40, "#f0ede4", { w: 2 }) + R(30, 400, 8, 80, "#6a6a6a", { w: 1 }) + R(282, 400, 8, 80, "#6a6a6a", { w: 1 }) + '<ellipse cx="80" cy="356" rx="30" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>' + P('M100 362 Q190 352 286 362 Z', "#c9d6e0", { w: 1.4 });
    var cols = ["#e8443a", "#f2c230", "#5fa3d9", "#7ac27a", "#e88ac0"];
    for (var i = 0; i < 9; i++) { var x = 30 + i * 36, sw = Math.sin(t * 1.3 + i) * 6; s += '<path d="M' + x + ' 40 L' + f(x + sw) + ' ' + (110 + (i % 3) * 30) + '" stroke="#d9cfb6" stroke-width="1"/>' + crane(x + sw, 120 + (i % 3) * 30, .4, cols[i % 5], t, { ph: i, rot: sw * 2 }); }
    return s + dust(t, 20, "#fff6dc", .6) + label("1955", 180, 250, u, 1.0, 26, "#5a4a3a");
  });
  // 30 — remember the girl tram drivers?
  shot(30, push([180, 340], [180, 360], 1.1, 1.0), function (u, d, t) { return tramInterior(t, { dark: true, ash: true, speed: 0 }) + R(-200, -200, 760, 1040, "#3a3026", { s: 0, op: .25 }); });
  // 31 — just three days after the bomb the tram ran again in Hiroshima, and some of the girls drove it
  shot(31, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyAsh") + R(-300, 330, 960, 400, "#4a4036", { s: 0 }) + dome(300, 330, .5, { ruin: true, night: true });
    for (var i = 0; i < 16; i++) s += P('M' + (-40 + i * 28) + ' 340 l' + f(6 + hash(i) * 10) + ' ' + f(-6 - hash(i + 1) * 14) + ' l' + f(8 + hash(i + 2) * 10) + ' ' + f(8 + hash(i) * 8) + ' Z', "#2a221c", { w: 1 });
    s += '<path d="M-300 420 H700 M-300 430 H700" stroke="#2a2420" stroke-width="2"/>' + tramFront(lerp(140, 190, clamp(u / d)), 430, lerp(.8, 1.15, clamp(u / d)), t, { driver: true });
    for (var j = 0; j < 4; j++) s += person(40 + j * 22 + (j > 1 ? 210 : 0), 500, 1.3, t, { top: "#9a968c", pants: "#3a3530", flip: j > 1 });
    return s + smoke(t, -40, 400, 330, 8, "#5a5048", .3) + rays(t, 330, 40, 2.1, 4, 600, .35) + label("9 أغسطس", 180, 150, u, .5, 26, "#f2c230");
  });
  // 32 — to this day, trams that lived through the bomb still run in the city's streets (green-cream 651 passing the Dome today)
  shot(32, push([160, 330], [200, 330], 1.0, 1.05), function (u, d, t) {
    var s = sky("skyToday") + cloudBank(t, 90, 5, 5, "#fff", .8) + R(-300, 260, 960, 500, "#9fb0a0", { s: 0 });
    for (var b = 0; b < 7; b++) s += R(-80 + b * 70, 140 + hash(b) * 60, 56, 220, ["#c9ccd0", "#b0b8c0", "#d9d4c8"][b % 3], { w: 1.4 });
    s += dome(110, 340, .55, { ruin: true }) + R(-300, 340, 960, 200, "#8a8a86", { s: 0 }) + '<path d="M-300 410 H700 M-300 420 H700" stroke="#3a3a3a" stroke-width="2"/>';
    s += tramSide(lerp(420, 0, clamp(u / d)), 414, .9, t, { dir: -1, speed: 1.4, people: true, num: "651" });
    return s + crowd(t, 476, 5, 1.1) + label("لسه ماشية", 270, 160, u, 1.2, 24, "#fff");
  });
  // 33 — every year at 8:15 on 6 August, all Hiroshima falls silent for a minute (lanterns on the river by the Dome)
  shot(33, push([180, 320], [180, 340], 1.12, 1.0), function (u, d, t) {
    var s = sky("skyDusk") + dome(180, 340, .8, { ruin: true, night: true }) + R(-300, 340, 960, 400, "url(#riverDusk)", { s: 0 });
    for (var i = 0; i < 18; i++) { var x = ((hash(i) * 460 + t * (6 + hash(i) * 4)) % 460) - 50, y = 360 + hash(i + 3) * 120; s += lantern(x, y, .6 + (y - 360) / 200, t, i); }
    for (var j = 0; j < 5; j++) { var uu = ((t * .06 + j / 5) % 1); s += crane(lerp(-40, 400, uu), 140 + j * 18 + Math.sin(t + j) * 6, .3, "#f0ede4", t, { ph: j, op: .8 }); }
    return s + watch(300, 190, 26, t, { h: 8.25, sec: 0 }) + label("دقيقة صمت", 140, 200, u, .8, 24, "#fff");
  });
  // 34 — tell us: which story do you want next time? (a single paper crane in the dark)
  shot(34, push([180, 300], [180, 300], 1.0, 1.1), function (u, d, t) {
    return R(-200, -200, 760, 1040, "#0e0d10", { s: 0 }) + '<circle cx="180" cy="300" r="160" fill="url(#warm)" opacity=".3"/>' + crane(180, 300 + Math.sin(t) * 6, 2.2, "#e8443a", t, { flap: 4 }) + dust(t, 20, "#ffd98a", .5) + label("قولولنا!", 180, 170, u, .3, 30, "#fff");
  });

  window.__parts = { dome: dome, tramSide: tramSide, tramFront: tramFront, b29side: b29side, littleBoy: littleBoy, crane: crane, watch: watch, mushroom: mushroom, cityWide: cityWide, lantern: lantern };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 4 && i <= 10) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 5 * Math.sin(t * .9), cy = c[1] + 4 * Math.cos(t * .7), z = c[2] * (1 + .012 * Math.sin(t * .6)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
