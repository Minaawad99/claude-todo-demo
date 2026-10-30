/* Wires the 3D models into the video: camera shots, flows, halos, labels and the moving parts,
   all placed from model coordinates. Runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function span(parent, from, fo, to, too) {  // visible from line `from`+fo until line `to`+too
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
  // halo in the part's plane + a label above it; px = label size in drawing units (≈ 20px on screen / zoom)
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

  // ── models ─────────────────────────────────────────────────
  var intro = CarModel($("introcar"), { scale: 0.47, x: 145, y: 200 });
  var carA1 = CarModel($("carA1"), { scale: 0.6, x: 180, y: 292 });
  var carA2 = CarModel($("carA2"), { scale: 0.6, x: 180, y: 292 });
  var cyl = CylModel($("cylB"), { scale: 0.82, x: 180, y: 272 });
  var outro = CylModel($("outro"), { scale: 0.36, x: 145, y: 108 });
  intro.pump.style.display = "none"; carA2.pump.style.display = "none";
  carA1.pump.setAttribute("data-v", "out"); carA1.pump.setAttribute("data-l", "5"); carA1.pump.setAttribute("data-o", "0.3"); carA1.pump.setAttribute("data-d", "0.4");
  var A = carA1.iso, A2 = carA2.iso, B = cyl.iso;

  // ── intro: comic bangs over the hood ──────────────────────
  var IF = $("introfx"), II = intro.iso;
  word(IF, II, 0, 0.9, 1, 0, [150, 0, 190], "BANG!", "c-heat", 20, -10);
  word(IF, II, 0, 1.6, 1, 0, [60, 40, 210], "POP!", "c-fuel", 16, 8);
  word(IF, II, 0, 2.3, 1, 0, [210, -40, 175], "BOOM!", "c-heat", 18, -4);

  // ── scene A1: tank → engine ───────────────────────────────
  cam("camA1", A, [[4, 0, [-170, 120, 60], 1.5], [5, 0, [-20, -20, 60], 0.85], [6, 0, [140, 0, 100], 2.4], [7, 0.4, [140, 0, 100], 2.0]]);
  var FA = $("fxA1"), HA = $("halosA1");
  flow(FA, A, 4, 1.2, 5, 0.3, [[-206, 150, 86], [-210, 128, 40], [-198, 100, 70], [-190, 94, 80]], 5, 60, "pt-fuel", 2.4);
  flow(FA, A, 5, 0.5, 8, 0, [[-160, -40, 72], [-120, -40, 38], [86, -40, 38], [100, -40, 64]], 14, 110, "pt-fuel", 2.4);
  halo(HA, A, 4, 1.2, 5, [-171, 0, 72], 78, "z", "Gas tank", "c-fuel", 11);
  halo(HA, A, 5, 0.3, 6, [-169, 0, 84], 20, "z", "Fuel pump", "c-part", 10);
  halo(HA, A, 6, 0.4, 8, [140, 0, 100], 62, "y", "Cylinders", "c-part", 9, -8);

  // ── scene B: one cylinder ─────────────────────────────────
  cam("camB", B, [[8, 0, [0, 0, 40], 1.3], [10, 0, [0, 0, 60], 1.4], [11, 0, [-60, 0, 120], 1.9], [12, 0, [-50, 0, 135], 2.4],
                  [13, 0, [0, 0, 80], 1.4], [14, 0, [0, 0, 100], 1.8], [15, 0.4, [0, 0, 90], 1.45], [16, 0, [0, 0, 120], 1.6],
                  [17, 0, [0, 0, 140], 2.4], [18, 0, [0, 0, 60], 1.15], [19, 0.4, [0, 0, 40], 1.3], [20, 0, [30, 0, 110], 1.5],
                  [21, 0, [70, 0, 130], 1.9], [22, 0, [0, 0, 40], 1.3], [25, 0, [0, 0, -50], 1.9], [26, 0, [0, 0, -50], 1.9]]);
  var FB = $("fxB"), HB = $("halosB");
  flow(FB, B, 11, 0.3, 13, 0, [[-170, 0, 141], [-80, 0, 141], [-46, 0, 140], [-26, 0, 120], [-10, 0, 80]], 10, 90, "pt-air", 2.4);
  flow(FB, B, 12, 0.4, 13, 0, [[-52, 0, 146], [-30, 0, 120], [-10, 0, 90], [10, 0, 70]], 6, 50, "pt-fuel", 2.2);
  flow(FB, B, 21, 0.2, 22, 1.5, [[10, 0, 80], [26, 0, 120], [46, 0, 140], [80, 0, 141], [180, 0, 141]], 10, 100, "pt-exh", 2.6);
  halo(HB, B, 8, 0.6, 9, [0, 0, 60], 56, "z", "Piston", "c-part", 12);
  halo(HB, B, 11, 0.6, 12, [-26, 0, 118], 18, "z", "Intake valve", "c-water", 9);
  halo(HB, B, 12, 0.2, 13, [-61, 0, 162], 15, "z", "Fuel injector", "c-fuel", 8);
  halo(HB, B, 17, 0.1, 18, [0, 0, 180], 16, "z", "Spark plug", "c-part", 8);
  halo(HB, B, 21, 0.4, 22, [26, 0, 118], 18, "z", "Exhaust valve", "c-ink", 9);
  halo(HB, B, 25, 0.1, 26, [0, 0, -70], 52, "y", "Crankshaft", "c-part", 10);
  word(FB, B, 18, 0.15, 19, 0.4, [0, 0, 100], "BOOM!", "c-heat", 26, -6);
  word(FB, B, 19, 0.2, 20, -0.1, [0, 0, 20], "POWER ↓", "c-heat", 18, 0);
  word(FB, B, 23, 0.3, 24, 0.6, [62, 0, 70], "↕", "c-part", 34, 0);
  word(FB, B, 24, 0.2, 25, 0.4, [0, 60, -70], "↻ ?", "c-part", 30, 0);
  word(FB, B, 11, 0.5, 12, 0, [-150, 0, 160], "AIR", "c-water", 12, 0);
  word(FB, B, 21, 0.6, 22, 1.4, [150, 0, 160], "EXHAUST", "c-ink", 11, 0);

  // ── scene A2: firing order → transmission → axles → cooling ─
  cam("camA2", A2, [[27, 0, [140, 0, 100], 2.3], [28, 0, [140, -12, 160], 2.7], [29, 0, [60, 0, 72], 2.2], [30, 0, [-70, 40, 50], 1.3],
                    [31, 0, [140, 0, 100], 1.9], [32, 0, [192, 0, 84], 2.0], [33, 0, [0, 0, 80], 0.85], [35, 0, [0, 0, 80], 0.85]]);
  var FA2 = $("fxA2"), HA2 = $("halosA2");
  flow(FA2, A2, 27, 0, 36, 0, [[-160, -40, 72], [-120, -40, 38], [86, -40, 38], [100, -40, 64]], 12, 90, "pt-fuel", 2.2);
  flow(FA2, A2, 27, 0, 36, 0, [[-172, 60, 40], [-262, 60, 46]], 4, 40, "pt-exh", 3);
  flow(FA2, A2, 32, 0.3, 33, 0.2, [[184, -20, 140], [209, -20, 114], [209, -20, 56], [209, 24, 46], [190, 24, 50], [160, 20, 60]], 12, 70, "pt-cool", 2.4);
  halo(HA2, A2, 27, 0.3, 28, [140, 0, 100], 62, "y", "Firing order 1 · 3 · 4 · 2", "c-heat", 8.5, -8);
  halo(HA2, A2, 28, 0.3, 29, [140, -12, 158], 56, "z", "Camshaft", "c-part", 7.5);
  halo(HA2, A2, 29, 0.3, 30, [60, 29, 72], 40, "y", "Transmission", "c-part", 9);
  halo(HA2, A2, 30, 0.6, 31, [-150, 108, 42], 52, "y", "Axle → wheels", "c-part", 13);
  halo(HA2, A2, 32, 0.3, 33, [214, 0, 79], 70, "x", "Radiator", "c-water", 10);
  word(FA2, A2, 31, 0.5, 32, 0, [140, 60, 170], "HOT!", "c-heat", 14, -6);

  // ── panels: bike pedals (26) and where the energy goes (33–34) ─
  var BI = TebEzay.iso($("bike"), { scale: 1.9, x: 180, y: 250 }), bikeG = BI.group();
  var EI = TebEzay.iso($("energy"), { scale: 1.05, x: 180, y: 262 }), eg = EI.group();
  function popG(l, o) { return EI.group(eg, { "data-v": "pop", "data-l": String(l), "data-o": String(o), "data-d": "0.4" }); }
  EI.box(popG(33, 0.8), -105, -40, -32, 32, 0, 64, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
  EI.box(popG(34, 0.1), -30, 35, -32, 32, 0, 64, { z: "iso-hot-top", x: "iso-hot", y: "iso-hot" });
  EI.box(popG(34, 0.4), 45, 110, -32, 32, 0, 64, { z: "iso-hot-top", x: "iso-hot", y: "iso-hot" });
  var q1 = EI.P(-72, 32, 0), q2 = EI.P(40, 32, 0);
  var t1 = EI.el("text", { "class": "lbl c-part", x: (q1[0] - 10).toFixed(0), y: (q1[1] + 64).toFixed(0), "text-anchor": "middle", "data-v": "fade", "data-l": "33", "data-o": "1.1", "data-d": "0.4" }, eg); t1.textContent = "< 1/3 moves the car";
  var t2 = EI.el("text", { "class": "lbl c-heat", x: (q2[0] + 30).toFixed(0), y: (q2[1] + 74).toFixed(0), "text-anchor": "middle", "data-v": "fade", "data-l": "34", "data-o": "0.5", "data-d": "0.4" }, eg); t2.textContent = "the rest = heat";
  var hz = EI.P(78, 0, 70), steam = EI.el("g", { "data-v": "fade", "data-l": "34", "data-o": "0.6", "data-d": "0.4" }, eg);
  [-60, 0, 60].forEach(function (dx) { var q = EI.P(40 + dx * 0.9, 0, 70); EI.el("path", { d: "M" + q[0].toFixed(0) + " " + q[1].toFixed(0) + " q-5 -10 0 -20 q5 -10 0 -20", "class": "iso-heat", style: "stroke-width:3;opacity:.7" }, steam); });

  // ── moving state ───────────────────────────────────────────
  // crank angle of the close-up cylinder: slow, one stroke per step, then running
  function theta(t) {
    var a = L(8), b = L(10);
    if (t < a) return 0;
    if (t < b) { var u = (t - a) / (b - a); return 8 * 360 * (1 - (1 - u) * (1 - u)); }
    var K = [[L(11) + 0.2, 0], [L(13) - 0.2, 180], [L(14) + 0.3, 180], [L(15), 360], [L(18) + 0.15, 360], [L(18) + 0.7, 540], [L(21) + 0.2, 540], [L(22) - 0.15, 720]];
    if (t < K[0][0]) return 2880;
    for (var i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return 2880 + K[i][1] + (K[i + 1][1] - K[i][1]) * easeIO((t - K[i][0]) / (K[i + 1][0] - K[i][0]));
    var c = L(22);
    return t < c ? 2880 + 720 : 2880 + 720 + (t - c) * 400;
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
  function cylState(t) {
    var th = theta(t), ph = ((th % 720) + 720) % 720, s = { theta: th, gas: "", gasA: 0, spark: 0, spray: 0 };
    if (t < L(10) || t >= L(22)) return byPhase(ph, s);
    if (t < L(11)) return s;
    if (t < L(14) + 0.3) { s.gas = t < L(12) + 0.3 ? "g-air" : "g-mix"; s.gasA = 0.45; }
    else if (t < L(18) + 0.15) { s.gas = "g-mix"; s.gasA = 0.45 + 0.4 * clamp((th - 2880 - 180) / 180); }
    else if (t < L(19) + 0.8) { s.gas = "g-burn"; s.gasA = 1 - 0.45 * clamp((t - L(18) - 0.15) / 1.2); }
    else { s.gas = "g-exh"; s.gasA = 0.6 * (ph >= 540 && ph < 720 ? 1 - (ph - 540) / 180 : 1); if (th >= 2880 + 720) s.gasA = 0; }
    var z0 = L(17) + 0.6, flick = t > z0 && t < z0 + 1.4 && Math.sin(t * 46) > 0.2;
    s.spark = (t > L(18) - 0.05 && t < L(18) + 0.3) ? 1 : flick ? 0.6 : 0;
    s.spray = t > L(12) + 0.2 && t < L(13) - 0.2 ? 1 : 0;
    return s;
  }
  function carState(t) {
    var phi = 324 * t, x35 = Math.max(0, t - L(35)); phi += 1500 * x35 * x35;
    var w = Math.max(0, t - L(30)), wheel = w < 1 ? 1.5 * w * w : 1.5 + 3 * (w - 1) + 4 * x35 * x35;
    var glow = clamp((t - L(31) - 0.3) / 0.6) * (1 - clamp((t - L(33)) / 0.5));
    return { phi: phi, fire: true, wheel: wheel, shaft: Math.max(0, t - L(29)) * 10 + 4 * x35 * x35, glow: glow };
  }
  function introState(t) { var w = Math.max(0, t - L(2)); return { phi: 720 * t, fire: true, wheel: w * 3, shaft: w * 10, glow: 0 }; }
  function bike(t) {
    while (bikeG.firstChild) bikeG.removeChild(bikeG.firstChild);
    var a = t * 3.2, I = BI, n = 16, teeth = [];
    for (var k = 0; k < n * 2; k++) { var b = a + k * Math.PI / n, r = k % 2 ? 50 : 56; teeth.push([Math.cos(b) * r, 0, Math.sin(b) * r]); }
    I.face(bikeG, teeth, "iso-part"); I.disc(bikeG, 0, 1, 0, 34, "y", "iso-part-top"); I.disc(bikeG, 0, 2, 0, 10, "y", "iso-steel");
    [0, Math.PI].forEach(function (o, i) {
      var c = Math.cos(a + o), s = Math.sin(a + o), px = c * 78, pz = s * 78, y = i ? -10 : 12, w = 7;
      I.face(bikeG, [[-s * w, y, c * w], [px - s * w, y, pz + c * w], [px + s * w, y, pz - c * w], [s * w, y, -c * w]], i ? "iso-part-x" : "iso-steel");
      I.box(bikeG, px - 14, px + 14, y + (i ? -26 : 4), y + (i ? -4 : 26), pz - 5, pz + 5, {});
      if (s > 0.2 && !i || s > 0.2 && i) {
        var q = I.P(px, y + (i ? -15 : 15), pz + 8);
        I.el("path", { d: "M" + q[0].toFixed(1) + " " + (q[1] - 46).toFixed(1) + " V" + (q[1] - 10).toFixed(1) + " m-7 -9 l7 9 l7 -9", "class": "iso-heat", style: "stroke-width:4" }, bikeG);
      }
    });
  }
  window.__extra = function (t) {
    if (t < L(3)) intro.update(t, introState(t));
    if (t > L(4) - 1 && t < L(8)) carA1.update(t, carState(t));
    if (t > L(8) - 1 && t < L(27)) cyl.update(t, cylState(t));
    if (t > L(25) && t < L(27)) bike(t);
    if (t > L(27) - 1 && t < L(36)) carA2.update(t, carState(t));
    if (t > L(36) - 1) outro.update(t, byPhase(((t * 400) % 720), { theta: t * 400 }));
  };
  // draw every model once so the page is complete before the engine reads it
  intro.update(0, introState(0)); carA1.update(0, carState(0)); carA2.update(L(27), carState(L(27)));
  cyl.update(0, cylState(L(8))); outro.update(0, byPhase(0, { theta: 0 })); bike(0);
})();
