/* Framed close-ups, redrawn every frame: the wheel encoder (8), the underside — side brush, main brush, fan and
   bin (9) — and a round zoom of rug fringe winding onto the brush (22). */
(function () {
  var LN = window.TIMING.lines; function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  var NS = "http://www.w3.org/2000/svg";
  function g(svg) { var e = document.createElementNS(NS, "g"); svg.appendChild(e); return e; }
  function push(t, a, b) { var u = clamp((t - a) / (b - a)); return 1 + 0.2 * u * u * (3 - 2 * u); }
  window.__panels = function (t) {
    var th = 0.2 * Math.sin(t * 0.5) + 0.12 * Math.sin(t * 1.1);
    // wheel + slotted encoder disc + optical sensor counting slots
    var a = document.getElementById("pwheel");
    if (t > L(8) - 0.5 && t < L(9) + 0.5) {
      clear(a); var I = __makeIso(th, 1.6 * push(t, L(8), L(9)), 180, 280), G = g(a), rot = (t - L(8)) * 5;
      I.box(G, -90, 60, -40, 40, -6, 0, { z: "rb-floor", x: "iso-cut", y: "iso-cut" });
      I.disc(G, 0, 30, 46, 46, "y", "iso-chip"); I.disc(G, 0, 31, 46, 36, "y", "rb-dock-top");
      for (var k = 0; k < 8; k++) { var an = rot + k * Math.PI / 4; I.line(G, [[0, 31.5, 46], [Math.cos(an) * 34, 31.5, 46 + Math.sin(an) * 34]], "iso-rotor"); }
      I.line(G, [[0, 10, 46], [0, 30, 46]], "iso-frame", "stroke-width:4");
      I.disc(G, 0, 4, 46, 30, "y", "rb-top");                                   // encoder disc
      for (var s = 0; s < 16; s++) { var sa = rot + s * Math.PI / 8; I.face(G, [[Math.cos(sa) * 22, 3.5, 46 + Math.sin(sa) * 22], [Math.cos(sa + 0.12) * 22, 3.5, 46 + Math.sin(sa + 0.12) * 22], [Math.cos(sa + 0.12) * 28, 3.5, 46 + Math.sin(sa + 0.12) * 28], [Math.cos(sa) * 28, 3.5, 46 + Math.sin(sa) * 28]], "iso-chip"); }
      I.box(G, 18, 34, -12, 12, 66, 82, { z: "iso-chip-top", x: "iso-chip", y: "iso-chip" });  // sensor fork over the disc edge
      var on = Math.sin(rot * 8) > 0; var sp = I.P(25, 4, 72); I.el("circle", { cx: sp[0].toFixed(1), cy: sp[1].toFixed(1), r: 4, "class": on ? "rb-laser-dot" : "rb-led" }, G);
      document.getElementById("pwheel-n").textContent = Math.floor((t - L(8)) * 5 * 16 / (Math.PI * 2) * 8);
    }
    // underside: dust swept in by the side brush, lifted by the main brush, sucked into the bin
    var u = document.getElementById("punder");
    if (t > L(9) - 0.5 && t < L(10) + 0.5) {
      clear(u); var J = __makeIso(th * 0.5 + 0.3, 1.25 * push(t, L(9), L(10)), 180, 270), H = g(u);
      J.cyl(H, 0, 0, 80, 0, 14, "rb-body", "rb-dock-top");
      J.box(H, -50, -20, -55, 55, 14, 20, { z: "iso-chip-top", x: "iso-chip", y: "iso-chip" });             // brush channel
      for (var b = 0; b < 6; b++) { var y0 = -50 + ((b * 18 + t * 70) % 108); J.line(H, [[-46, y0, 21], [-24, y0 + 8, 21]], "rb-fringe", "stroke:#e2a92c;stroke-width:3"); }  // main brush bristles rolling
      J.box(H, 10, 55, -35, 35, 14, 34, { z: "iso-glass", x: "iso-glass", y: "iso-glass" });              // bin
      var fa = t * 12; J.disc(H, 32, 0, 35, 14, "z", "iso-top"); for (var f = 0; f < 4; f++) J.line(H, [[32, 0, 35.5], [32 + Math.cos(fa + f * 1.57) * 13, Math.sin(fa + f * 1.57) * 13, 35.5]], "iso-frame");
      var sx = -40, sy = -72, ss = t * 10; for (var k2 = 0; k2 < 3; k2++) { var a2 = ss + k2 * 2.094; J.line(H, [[sx, sy, 15], [sx + Math.cos(a2) * 34, sy + Math.sin(a2) * 34, 15]], "rb-brush", "stroke-width:3"); }
      for (var d = 0; d < 14; d++) {                                             // dust path: floor → brush → bin
        var q = ((t * 0.6 + d / 14) % 1), x, y, z;
        if (q < 0.35) { x = lerp(-90, -40, q / 0.35); y = lerp(-90, -10, q / 0.35); z = 15; } else if (q < 0.6) { x = -36; y = lerp(-10, 0, (q - 0.35) / 0.25); z = 22; } else { x = lerp(-30, 30, (q - 0.6) / 0.4); y = 0; z = lerp(22, 30, (q - 0.6) / 0.4); }
        var p = J.P(x, y, z); J.el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 2.6, "class": "rb-dust", style: "opacity:.9" }, H);
      }
      [[-40, -72, 15, 95, 110, "الفرشة اللي على الجنب"], [-36, 30, 21, 120, 400, "الفرشة اللي تحت"], [32, 0, 36, 265, 130, "الشفاط والخزان"]].forEach(function (l) {
        var p = J.P(l[0], l[1], l[2]); J.el("line", { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: l[3], y2: l[4] + 4, "class": "iso-frame", style: "stroke-width:1" }, H);
        J.el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 3, "class": "calldot" }, H);
        var tx = J.el("text", { x: l[3], y: l[4], "text-anchor": "middle", "class": "iso-label c-part", style: "font-size:15px;stroke-width:4px" }, H); tx.textContent = l[5];
      });
    }
    // zoom: fringe threads winding around the spinning brush
    var z = document.getElementById("pzoom"), zo = win(t, L(22) + 1.4, L(23) - 0.1, 0.3);
    document.getElementById("zoom").style.opacity = zo.toFixed(2);
    if (zo > 0) {
      clear(z); var c = (t - L(22)) * 6;
      var e = function (tag, at) { var n = document.createElementNS(NS, tag); for (var k in at) n.setAttribute(k, at[k]); z.appendChild(n); return n; };
      e("rect", { x: 0, y: 92, width: 140, height: 48, style: "fill:#b5523a" });
      for (var fz = 0; fz < 9; fz++) { var fx = 10 + fz * 14, wrap = Math.min(1, (t - L(22) - 1.4) * 0.8); e("path", { d: "M" + fx + " 96 Q" + (fx + 6) + " " + (80 - 30 * wrap) + " " + (70 + 16 * Math.cos(c + fz)) + " " + (62 + 16 * Math.sin(c + fz) * wrap), style: "fill:none;stroke:#f0e3c4;stroke-width:2.4;stroke-linecap:round" }); }
      e("circle", { cx: 70, cy: 62, r: 22, style: "fill:#4a443b;stroke:#2b2620;stroke-width:2" });
      for (var bz = 0; bz < 6; bz++) { var ba = c + bz * 1.047; e("line", { x1: 70, y1: 62, x2: (70 + Math.cos(ba) * 22).toFixed(1), y2: (62 + Math.sin(ba) * 22).toFixed(1), style: "stroke:#e2a92c;stroke-width:3" }); }
      e("text", { x: 70, y: 22, "text-anchor": "middle", style: "font:700 12px var(--font-sans);fill:var(--heat-text)" }).textContent = "بتتلف على الفرشة";
    }
  };
  function lerp(a, b, k) { return a + (b - a) * k; }
})();
