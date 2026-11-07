/* «150 PS gegen 400 PS», isometric version: wires the 3D models into the video (cameras, flows, halos, labels, moving parts).
   Runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function span(parent, from, fo, to, too) {
    var o = el("g", { "data-v": "out", "data-l": String(to), "data-o": String(too || 0), "data-d": "0.3" }, parent);
    return el("g", { "data-v": "fade", "data-l": String(from), "data-o": String(fo || 0), "data-d": "0.35" }, o);
  }
  function cam(id, I, shots) {
    $(id).setAttribute("data-cam", shots.map(function (s) { var q = I.P(s[2][0], s[2][1], s[2][2]); return [s[0], s[1], q[0].toFixed(1), q[1].toFixed(1), s[3]].join(":"); }).join("|"));
  }
  function flow(g, I, from, fo, to, too, pts, n, speed, dot, r) {
    var p = el("g", { "data-particles": "", "data-n": String(n), "data-speed": String(speed), "data-dot": dot, "data-r": String(r) }, span(g, from, fo, to, too));
    el("path", { "class": "stream", d: I.d(pts, false) }, p);
  }
  function halo(g, I, from, fo, to, c, r, plane, label, cls, px, dy) {
    var f = span(g, from, fo, to, -0.1), pl = el("g", { "data-loop": "pulse", "data-f": "5", "data-a": "0.03" }, f);
    I.face(pl, I.ring(c[0], c[1], c[2], r, 32, plane), "iso-halo").style.strokeWidth = (px / 4.5).toFixed(2);
    var q = I.P(c[0], c[1], c[2]), y = q[1] - (plane === "z" ? r * I.scale * 0.5 : r * I.scale) - px * 0.5 + (dy || 0);
    var t = el("text", { "class": "iso-label " + cls, x: q[0].toFixed(1), y: y.toFixed(1), "text-anchor": "middle", style: "font-size:" + px + "px;stroke-width:" + (px / 3).toFixed(1) + "px" }, f);
    t.textContent = label;
    return f;
  }
  function word(g, I, l, o, l2, o2, c, txt, cls, px, rot) {
    var q = I.P(c[0], c[1], c[2]);
    var w = el("g", { "data-v": "pop", "data-l": String(l), "data-o": String(o), "data-d": "0.35" }, el("g", { "data-v": "out", "data-l": String(l2), "data-o": String(o2), "data-d": "0.3" }, g));
    var t = el("text", { "class": "iso-label " + cls, x: q[0].toFixed(1), y: q[1].toFixed(1), "text-anchor": "middle", transform: "rotate(" + (rot || 0) + " " + q[0].toFixed(1) + " " + q[1].toFixed(1) + ")", style: "font-size:" + px + "px;font-weight:800;stroke-width:" + (px / 3).toFixed(1) + "px" }, w);
    t.textContent = txt;
    return w;
  }

  // ── intro: the car with comic bangs over the bonnet ───────
  var intro = CarModel($("introcar"), { scale: 0.47, x: 145, y: 200 }), II = intro.iso, IF = $("introfx");
  intro.pump.style.display = "none";
  word(IF, II, 0, 0.9, 1, 0, [150, 0, 190], "BRUMM!", "c-heat", 18, -10);
  word(IF, II, 1, 0.4, 2, 0, [60, 40, 210], "PS?", "c-fuel", 18, 8);
  word(IF, II, 2, 0.6, 3, 0, [210, -40, 175], "×3?", "c-heat", 18, -4);

  // ── P: one PS lifts 75 kg one metre in one second; a horse pulls the rope ──
  var IP = TebEzay.iso($("mP"), { scale: 0.85, x: 200, y: 360 }), lift = Lift(IP, $("mP"));
  var horseG = IP.group($("mP"));
  function horse(k, t) {
    clear(horseG); var hx = -110 - 70 * k;
    isoHorse(IP, horseG, hx, 40, t);
    IP.line(horseG, [[hx + 10, 40, 30], [-62, 1, 222]], "iso-hose");
  }
  cam("camP", IP, [[4, 0, [-70, 10, 100], 0.95], [5, 0, [-130, 30, 80], 1.15]]);
  word($("fxP"), IP, 4, 0.4, 5, 0, [-50, 0, 300], "1 PS", "c-heat", 22, 0);
  halo($("halosP"), IP, 4, 1.0, 5, [-50, 0, 90], 34, "x", "75 kg", "c-part", 13);
  word($("fxP"), IP, 4, 2.0, 5, 0, [90, 0, 90], "1 m", "c-heat", 16, 0);
  word($("fxP"), IP, 5, 0.3, 6, 0, [-200, 40, 140], "echtes Pferd", "c-fuel", 15, 0);

  // ── B: one cylinder through the four strokes ──────────────
  var cyl = CylModel($("mB"), { scale: 0.82, x: 180, y: 300 }), B = cyl.iso;
  cam("camB", B, [[6, 0, [0, 0, 60], 1.15], [7, 0, [-20, 0, 100], 1.5], [8, 0, [0, 0, 130], 1.7], [9, 0, [0, 0, -40], 1.5]]);
  var FB = $("fxB"), HB = $("halosB");
  flow(FB, B, 7, 0.1, 8, 0, [[-170, 0, 141], [-80, 0, 141], [-46, 0, 140], [-26, 0, 120], [-10, 0, 80]], 10, 90, "pt-air", 2.4);
  halo(HB, B, 7, 0.3, 8, [0, 0, 60], 56, "z", "Kolben", "c-part", 12);
  halo(HB, B, 8, 0.1, 9, [0, 0, 180], 16, "z", "Zündkerze", "c-part", 9);
  word(FB, B, 8, 0.45, 9, 0, [0, 0, 100], "BUMM!", "c-heat", 24, -6);
  halo(HB, B, 9, 0.2, 10, [0, 0, -70], 52, "y", "Kurbelwelle", "c-part", 11);
  function theta(t) {
    if (t < L(7)) return (t - L(6)) * 240;
    if (t < L(8)) return 720 + 360 * easeIO((t - L(7)) / (L(8) - L(7) - 0.2));
    if (t < L(9)) return 1080 + 180 * easeIO((t - L(8) - 0.3) / 0.8);
    return 1260 + (t - L(9)) * 500;
  }
  function byPhase(ph, s) {
    if (ph < 180) { s.gas = "g-mix"; s.gasA = 0.45; }
    else if (ph < 360) { s.gas = "g-mix"; s.gasA = 0.45 + 0.4 * (ph - 180) / 180; }
    else if (ph < 470) { s.gas = "g-burn"; s.gasA = 1 - 0.5 * (ph - 360) / 110; }
    else if (ph < 540) { s.gas = "g-burn"; s.gasA = 0.5; }
    else { s.gas = "g-exh"; s.gasA = 0.6 * (1 - (ph - 540) / 180); }
    s.spark = ph > 350 && ph < 382 ? 1 : 0; s.spray = ph > 30 && ph < 140 ? 1 : 0;
    return s;
  }
  var stepHL = [0, 1, 2, 3].map(function (k) { return $("st" + k); });

  // ── E: four in a row against the V8 ───────────────────────
  var IE = TebEzay.iso($("mE"), { scale: 0.8, x: 180, y: 320 }), i4 = RowEngine(IE, $("mE"), -110, 30, 4), V8 = VEngine(IE, $("mE"), 120, -20);
  cam("camE", IE, [[10, 0, [-110, 30, 60], 1.7], [11, 0, [120, -20, 70], 1.6], [12, 0, [0, 0, 60], 0.95], [14, 0, [-110, 30, 60], 1.5], [15, 0, [120, -20, 70], 1.45]]);
  var HE = $("halosE"), FE = $("fxE");
  halo(HE, IE, 10, 0.4, 11, [-110, 30, 0], 74, "z", "4 Zylinder · 1,5 Liter", "c-part", 11);
  halo(HE, IE, 11, 0.4, 12, [120, -20, 0], 80, "z", "V8 · 4 Liter", "c-heat", 12);
  word(FE, IE, 12, 0.4, 13, 0, [-110, 30, 150], "375 cm³", "c-water", 19, 0);
  word(FE, IE, 12, 0.9, 13, 0, [120, -20, 160], "500 cm³", "c-heat", 22, 0);
  word(FE, IE, 13, 0.3, 14, 0, [-110, 30, 150], "2 pro Umdrehung", "c-water", 15, 0);
  word(FE, IE, 13, 0.9, 14, 0, [120, -20, 160], "4 pro Umdrehung", "c-heat", 16, 0);

  // ── T: the turbo ──────────────────────────────────────────
  var IT = TebEzay.iso($("mT"), { scale: 0.85, x: 170, y: 330 }), mT = $("mT");
  var gI4 = span(mT, 16, -1, 21, 0), gI5 = span(mT, 21, 0.1, 99, 0);
  var tI4 = RowEngine(IT, gI4, -70, 20, 4), tI5 = RowEngine(IT, gI5, -70, 20, 5);
  var exhP = [[-10, 46, 60], [40, 46, 60], [80, 0, 45]], airP = [[80, -10, 118], [80, -10, 140], [-40, -10, 140], [-40, 0, 116]];
  IT.pipe(mT, exhP, "iso-pipe-dirty"); IT.pipe(mT, airP, "iso-pipe-air");
  var tb = Turbo(IT, mT, 80, 0, 30);
  var gT2 = span(mT, 20, 0.2, 21, 0), tb2 = Turbo(IT, gT2, 80, 90, 30);
  cam("camT", IT, [[16, 0, [80, 0, 70], 1.6], [17, 0, [80, 0, 40], 2.0], [18, 0, [60, 0, 120], 1.7], [19, 0, [-40, 0, 80], 1.2], [20, 0, [70, 40, 70], 1.05], [21, 0, [-30, 20, 60], 1.1]]);
  var FT = $("fxT"), HT = $("halosT");
  flow(FT, IT, 16, 0.6, 99, 0, exhP.concat([[80, 0, 30], [130, 30, 10], [200, 60, 0]]), 12, 90, "pt-exh", 2.6);
  flow(FT, IT, 18, 0.2, 99, 0, [[200, -60, 118], [120, -20, 118]].concat(airP), 14, 110, "pt-air", 2.4);
  halo(HT, IT, 16, 0.3, 17, [80, 0, 60], 50, "z", "Turbo", "c-heat", 11);
  halo(HT, IT, 17, 0.3, 18, [80, 0, 30], 44, "z", "Turbine (Abgas)", "c-heat", 9);
  halo(HT, IT, 18, 0.2, 19, [80, 0, 118], 44, "z", "Verdichter (Luft)", "c-water", 9);
  word(FT, IT, 19, 0.3, 20, 0, [-70, 20, 170], "mehr O₂ → mehr Benzin", "c-water", 17, 0);
  word(FT, IT, 20, 0.4, 21, 0, [80, 45, 180], "2 Turbos", "c-heat", 16, 0);
  word(FT, IT, 21, 0.4, 22, 0, [-70, 20, 175], "Audi: 5 Zylinder, 400 PS", "c-heat", 16, 0);

  // ── D: PS vs torque, 0–100, fuel and heat ─────────────────
  var ID = TebEzay.iso($("mD"), { scale: 0.9, x: 180, y: 300 }), dyn = ID.group($("mD"));
  cam("camD", ID, [[22, 0, [0, 0, 60], 1.0], [24, 0, [0, 0, 60], 1.0]]);
  var FD = $("fxD");
  word(FD, ID, 22, 0.3, 23, 0, [0, 0, 230], "PS ≠ Drehmoment", "c-heat", 26, 0);
  word(FD, ID, 23, 0.3, 24, 0, [-90, 50, 80], "wie kräftig", "c-water", 20, 0);
  word(FD, ID, 23, 1.2, 24, 0, [60, 60, 240], "PS = Drehmoment × Drehzahl", "c-heat", 17, 0);
  word(FD, ID, 24, 0.2, 25, 0, [-70, 40, 150], "150 PS", "c-water", 18, 0);
  word(FD, ID, 24, 0.2, 25, 0, [70, -40, 150], "400 PS", "c-heat", 18, 0);
  word(FD, ID, 25, 0.3, 26, 0, [0, 0, 230], "mehr Benzin · heißer", "c-heat", 20, 0);
  word(FD, ID, 26, 0.3, 27, 0, [-120, 50, 190], "größer", "c-heat", 24, -6);
  word(FD, ID, 26, 0.9, 27, 0, [0, 0, 270], "öfter", "c-fuel", 24, 0);
  word(FD, ID, 26, 1.5, 27, 0, [120, -50, 190], "mehr Luft", "c-water", 24, 6);
  function dynD(t) {
    clear(dyn); var I = ID;
    I.face(dyn, [[-150, -90, 0], [150, -90, 0], [150, 90, 0], [-150, 90, 0]], "iso-floor");
    if (t < L(24)) {   // a wrench turning a bolt: torque
      I.cyl(dyn, 0, 0, 40, 0, 30, "iso-steel", "iso-top");
      I.rotor(dyn, { x: 0, y: 0, z: 30, length: 90, width: 9, angle: t * 1.6, thick: 8 });
      return;
    }
    if (t < L(25)) {   // 0–100: two bars filling up over time, 8.5 s against 4 s
      var tt = clamp((t - L(24) - 0.3) / (L(25) - L(24) - 0.6)) * 8.5;
      var h1 = 14 * Math.min(tt, 8.5), h2 = 14 * Math.min(tt, 4);
      I.box(dyn, -90, -50, 20, 60, 0, h1 + 2, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false });
      I.box(dyn, 50, 90, -60, -20, 0, h2 + 2, { z: "iso-hot-top", x: "iso-hot", y: "iso-hot" });
      var q1 = I.P(-70, 40, h1 + 10), q2 = I.P(70, -40, h2 + 10);
      el("text", { "class": "iso-label c-water", x: q1[0].toFixed(1), y: q1[1].toFixed(1), "text-anchor": "middle", style: "font-size:19px;font-weight:800" }, dyn).textContent = tt.toFixed(1).replace(".", ",") + " s";
      el("text", { "class": "iso-label c-heat", x: q2[0].toFixed(1), y: q2[1].toFixed(1), "text-anchor": "middle", style: "font-size:19px;font-weight:800" }, dyn).textContent = Math.min(tt, 4).toFixed(1).replace(".", ",") + " s";
      return;
    }
    // fuel and heat: two tanks emptying, the big engine's faster, heat shimmer
    var k = clamp((t - L(25)) / (L(26) - L(25)));
    I.box(dyn, -90, -50, 20, 60, 0, 100 - 30 * k, { z: "iso-fuel-top", x: "iso-fuel-x", y: "iso-fuel" });
    I.box(dyn, 50, 90, -60, -20, 0, 100 - 80 * k, { z: "iso-fuel-top", x: "iso-fuel-x", y: "iso-fuel" });
    for (var h = 0; h < 3; h++) { var q = I.P(70 + (h - 1) * 18, -40, 120 + ((t * 40 + h * 20) % 60)); el("path", { d: "M" + q[0].toFixed(0) + " " + q[1].toFixed(0) + " q-5 -10 0 -20 q5 -10 0 -20", "class": "iso-heat", style: "stroke-width:3;opacity:.7" }, dyn); }
  }

  // ── outro: the cylinder running ───────────────────────────
  var outro = CylModel($("outro"), { scale: 0.36, x: 145, y: 108 });

  // ── moving state ──────────────────────────────────────────
  function carState(t) { return { phi: 720 * t, fire: true, wheel: t * 3, shaft: t * 10, glow: 0 }; }
  window.__extra = function (t) {
    Array.prototype.forEach.call(document.querySelectorAll(".drift-el"), function (e, i) {
      e.style.transform = "translate(" + (4 * Math.sin(t * 1.3 + i)).toFixed(2) + "px," + (3 * Math.cos(t * 1.1 + i)).toFixed(2) + "px) rotate(" + (0.6 * Math.sin(t * 0.9)).toFixed(3) + "deg) scale(" + (1 + 0.012 * Math.sin(t * 1.7)).toFixed(4) + ")";
    });
    // a slow drift that never stops (same feel as the cartoon panel), around each picture's centre
    Array.prototype.forEach.call(document.querySelectorAll(".drift"), function (g, i) {
      var c = g.getAttribute("data-c").split(" "), cx = +c[0], cy = +c[1];
      g.setAttribute("transform", "translate(" + cx + " " + cy + ") rotate(" + (1.0 * Math.sin(t * 0.83 + i)).toFixed(3) + ") scale(" + (1.03 + 0.035 * Math.sin(t * 1.1 + i)).toFixed(4) + ") translate(" + (-cx + 9 * Math.sin(t * 1.2 + i)).toFixed(2) + " " + (-cy + 7 * Math.cos(t * 1.2 + i)).toFixed(2) + ")");
    });
    if (t < L(3)) intro.update(t, carState(t));
    if (t > L(4) - 1 && t < L(6)) { var k = clamp((t - L(4) - 1.0) / 1.0); if (t > L(5)) k = 1; lift.update(k); horse(t < L(5) ? k : 1 + (t - L(5)) * 0.4, t); }
    if (t > L(6) - 1 && t < L(10)) {
      var th = theta(t), ph = ((th % 720) + 720) % 720, s = byPhase(ph, { theta: th, gas: "", gasA: 0, spark: 0, spray: 0 });
      cyl.update(t, s); var st = Math.floor(ph / 180);
      stepHL.forEach(function (e, i) { if (e) e.style.opacity = i === st ? 1 : 0; });
    }
    if (t > L(10) - 1 && t < L(16)) { var fast = t > L(14) ? 2.2 : 1; i4.update(t * 540 * fast, true); V8.update(t * 540 * fast, true); }
    if (t > L(16) - 1 && t < L(22)) { var sp = t > L(17) ? 30 : 10; tb.update(t * sp); tb2.update(t * sp + 1); tI4.update(t * 600, true); tI5.update(t * 600, true); }
    if (t > L(22) - 1 && t < L(27)) dynD(t);
    if (t > L(27) - 1) outro.update(t, byPhase(((t * 400) % 720), { theta: t * 400 }));
  };
  intro.update(0, carState(0)); lift.update(0); horse(0, 0); cyl.update(0, byPhase(0, { theta: 0 })); i4.update(0); V8.update(0);
  tb.update(0); tb2.update(0); tI4.update(0); tI5.update(0); dynD(L(22)); outro.update(0, byPhase(0, { theta: 0 }));
})();
