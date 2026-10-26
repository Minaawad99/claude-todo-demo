/* Framed 3D close-ups, redrawn every frame: the inverter board + motor (15–17), the car in traffic vs on the
   highway (22–23), and the first inverter in 1981 (25). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  var NS = "http://www.w3.org/2000/svg";
  function g(svg) { var e = document.createElementNS(NS, "g"); svg.appendChild(e); return e; }
  window.__panels = function (t) {
    var th = 0.18 * Math.sin(t * 0.4) + 0.14 * Math.sin(t * 1.1);
    function push(a, b) { var u = Math.max(0, Math.min(1, (t - a) / (b - a))); return 1 + 0.22 * u * u * (3 - 2 * u); }
    // board + motor
    var a = document.getElementById("pboard");
    if (t > L(15) - 0.5 && t < L(18) + 0.5) {
      clear(a); var I = __makeIso(th, 1.25 * push(L(15), L(18)), 180, 290), G = g(a);
      I.box(G, -110, 30, -70, 70, 0, 10, { z: "iso-pcb-top", x: "iso-pcb-x", y: "iso-pcb", hatch: false });
      [[-90, -40, 18], [-50, -40, 26], [-90, 20, 14], [-40, 20, 34]].forEach(function (c) { I.box(G, c[0], c[0] + 28, c[1], c[1] + 26, 10, 10 + c[2], { z: "iso-chip-top", x: "iso-chip", y: "iso-chip", hatch: false }); });
      I.cyl(G, 0, -30, 10, 10, 40, "iso-cap", "iso-cap-top"); I.cyl(G, 0, 10, 10, 10, 40, "iso-cap", "iso-cap-top");
      // wires from the board to the motor; dashes move faster when the motor runs faster
      var sp = window.__speed(t), w = I.line(G, [[30, 0, 6], [70, 0, 6], [90, 0, 30]], "iso-wire-live"); w.style.strokeDashoffset = (-window.__phase(t) * 120).toFixed(1);
      I.cyl(G, 120, 0, 42, 0, 60, "iso-comp", "iso-comp-top");
      var rot = window.__phase(t) * 14, cq = I.P(120, 0, 60);
      for (var b = 0; b < 6; b++) { var an = rot + b * Math.PI / 3; I.line(G, [[120, 0, 61], [120 + Math.cos(an) * 34, Math.sin(an) * 34, 61]], "iso-rotor"); }
      I.disc(G, 120, 0, 62, 9, "z", "iso-hub");
      var lab = document.getElementById("pboard-speed"); lab.textContent = sp > 0.8 ? "أسرع" : sp < 0.45 ? "أبطأ" : "على حسب الحاجة";
    }
    // car in traffic vs on the highway
    var c = document.getElementById("pcar");
    if (t > L(22) - 0.5 && t < L(24) + 0.5) {
      var hw = t > L(23); clear(c); var J = __makeIso(th + 0.25 * (push(L(23), L(23) + 0.8) - 1) / 0.22, 1.0 * push(L(22), L(24)), 180, 260), H = g(c);
      J.box(H, -260, 260, -60, 60, -8, 0, { z: hw ? "iso-road" : "iso-road", hatch: false });
      for (var d = -260; d < 260; d += 60) { var off = hw ? ((t * 90) % 60) : 0; J.face(H, [[d + off, -3, 0.5], [d + off + 28, -3, 0.5], [d + off + 28, 3, 0.5], [d + off, 3, 0.5]], "iso-dash"); }
      if (hw) for (var pz = -300; pz < 300; pz += 100) { var px = pz - ((t * 160) % 100); J.cyl(H, px, -70, 3, 0, 70, "iso-steel", "iso-top"); J.cyl(H, px, 70, 3, 0, 70, "iso-steel", "iso-top"); }
      // stop-and-go: the car lurches forward then stops; on the highway it glides
      var x = hw ? 8 * Math.sin(t * 2.3) : (function () { var u = (t - L(22)) % 1.6; return u < 0.8 ? -60 + 120 * (u / 0.8) * (u / 0.8) : 60 - 0; })();
      if (!hw) { J.cyl(H, 120, -70, 4, 0, 90, "iso-steel", "iso-top"); J.box(H, 112, 128, -78, -62, 90, 130, { z: "iso-top", x: "iso-x", y: "iso-y" }); var red = ((t - L(22)) % 1.6) > 0.8; J.disc(H, 120, -61, 120, 5, "y", red ? "iso-hot" : "iso-leaf"); }
      J.box(H, x - 40, x + 40, -30, 30, 6, 40, { z: "iso-car-top", x: "iso-car-x", y: "iso-car", hatch: false }); J.box(H, x - 22, x + 18, -24, 24, 40, 64, { z: "iso-car-top", x: "iso-glass", y: "iso-glass", hatch: false });
      [[-24, 30], [24, 30]].forEach(function (w) { J.disc(H, x + w[0], w[1] + 1, 12, 12, "y", "iso-tire"); });
      var gauge = document.getElementById("pcar-fuel"), drain = hw ? 0.15 : 0.7; gauge.style.transform = "rotate(" + (-60 + 120 * (1 - ((t * drain) % 1))).toFixed(1) + "deg)";
      document.getElementById("pcar-lbl").textContent = hw ? "الطريق السريع: سرعة ثابتة، صرف أقل" : "الزحمة: تقف وتتحرك، صرف كتير";
    }
    // 1981: the first home inverter AC
    var o = document.getElementById("p1981");
    if (t > L(25) - 0.5 && t < L(26) + 0.5) {
      clear(o); var K = __makeIso(th * 1.8 + 0.12 * Math.sin(t * 2.1), 1.2 * (1 + (push(L(25), L(26)) - 1) * 0.4), 180, 215), Q = g(o);
      K.box(Q, -110, 110, -40, 40, 0, 90, { z: "iso-unit-top", x: "iso-unit-x", y: "iso-old", hatch: false });
      for (var s = 0; s < 6; s++) K.line(Q, [[-96, 41, 14 + s * 10], [10, 41, 14 + s * 10]], "iso-slat");
      K.face(Q, [[30, 41, 20], [96, 41, 20], [96, 41, 76], [30, 41, 76]], "iso-top"); for (var bt = 0; bt < 3; bt++) K.disc(Q, 46 + bt * 18, 42, 36, 5, "y", Math.floor(t * 3) % 3 === bt ? "iso-leaf" : "iso-chip");
    }
  };
})();
