/* 3D isometric fridge, drawn with TebEzay.iso. The fridge stands with its back toward the viewer's right (+x),
   so the condenser coils on the back and the compressor behind the bottom show; the side wall facing us (+y)
   is cut away so the shelves, the freezer, the evaporator and the fan show inside.
   x: door (−90) → back (+90), y: far wall (−80) → cut side (+80), z: up. */
(function () {
  window.FridgeModel = function (root, opts) {
    var I = TebEzay.iso(root, opts), g = I.group(root);
    var X0 = -90, X1 = 90, Y0 = -80, Y1 = 80, ZB = 40, ZD = 318, ZT = 460, T = 9;
    function box(gr, a, b, c, d, e, f, k) { return I.box(gr, a, b, c, d, e, f, k || {}); }

    // ── far wall (inner face) + door wall (inner face) + floor ─────
    I.face(g, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y0, ZT], [X0, Y0, ZT]], "iso-wall2");
    I.face(g, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y0, ZT], [X0, Y0, ZT]], "tz-pat-hatch", { style: "opacity:.25" });
    I.face(g, [[X0, Y0, 0], [X0, Y1, 0], [X0, Y1, ZT], [X0, Y0, ZT]], "iso-wall");
    I.face(g, [[X0, Y0, ZB], [X1, Y0, ZB], [X1, Y1, ZB], [X0, Y1, ZB]], "iso-floor");
    // door gasket: a dark rim around the door opening
    var gasket = I.group(g);
    I.line(gasket, [[X0 + 1, Y0 + 4, ZB + 4], [X0 + 1, Y1 - 4, ZB + 4], [X0 + 1, Y1 - 4, ZT - 6], [X0 + 1, Y0 + 4, ZT - 6], [X0 + 1, Y0 + 4, ZB + 4]], "iso-gasket");
    I.line(gasket, [[X0 + 1, Y0 + 4, ZD - 2], [X0 + 1, Y1 - 4, ZD - 2]], "iso-gasket");
    // door bins with bottles
    [[90, 3], [200, 2]].forEach(function (b) {
      box(g, X0, X0 + 16, -60, 60, b[0], b[0] + 26, { z: "iso-top", x: "iso-glass", y: "iso-glass", hatch: false });
      for (var k = 0; k < b[1]; k++) I.cyl(g, X0 + 8, -40 + k * 34, 7, b[0] + 4, b[0] + 62, "iso-bottle", "iso-bottle-top");
    });
    // divider between freezer and fridge
    box(g, X0, X1, Y0, Y1, ZD, ZD + 10, { z: "iso-top" });
    // ── freezer: evaporator on the far wall, fan, frost, ice ─────
    var evap = []; for (var r = 0; r < 6; r++) { var zz = ZD + 22 + r * 18; evap.push(r % 2 ? [-60, Y0 + 3, zz] : [60, Y0 + 3, zz]); evap.push(r % 2 ? [60, Y0 + 3, zz] : [-60, Y0 + 3, zz]); }
    I.face(g, [[-70, Y0 + 1, ZD + 14], [70, Y0 + 1, ZD + 14], [70, Y0 + 1, ZD + 124], [-70, Y0 + 1, ZD + 124]], "iso-frost");
    I.pipe(g, evap, "iso-pipe-cold");
    var fan = I.group(g);
    box(g, -60, 40, -60, 30, ZD + 12, ZD + 36, { z: "iso-ice-top", x: "iso-ice", y: "iso-ice", hatch: false });     // ice tray
    box(g, 10, 70, -10, 50, ZD + 12, ZD + 52, { z: "iso-top", x: "iso-x", y: "iso-y" });                                // frozen box
    // thermostat on the far wall under the divider
    var thermo = I.group(g);
    box(thermo, -88, -30, Y0, Y0 + 14, 268, 306, { z: "iso-top", x: "iso-x", y: "iso-ceramic" });
    var dial = I.group(g);
    // ── fridge shelves and food ──────────────────────────────────
    [150, 236].forEach(function (z) { I.face(g, [[X0 + 18, Y0 + 2, z], [X1 - 4, Y0 + 2, z], [X1 - 4, Y1 - 2, z], [X0 + 18, Y1 - 2, z]], "iso-shelf"); });
    box(g, -40, 10, -60, -10, ZB, ZB + 40, { z: "iso-veg-top", x: "iso-veg", y: "iso-veg", hatch: false });          // veg drawer
    I.cyl(g, 40, 20, 14, ZB, ZB + 30, "iso-hot", "iso-hot-top");                                                     // tomato pot
    box(g, -50, -10, -40, 0, 150, 180, { z: "iso-top", x: "iso-x", y: "iso-y" });                                    // cheese box
    I.cyl(g, 30, -30, 16, 150, 196, "iso-jar", "iso-jar-top");
    I.cyl(g, 50, 30, 12, 236, 290, "iso-bottle", "iso-bottle-top"); I.cyl(g, 10, 30, 12, 236, 290, "iso-bottle", "iso-bottle-top");
    box(g, -60, -20, -50, 10, 236, 262, { z: "iso-cake-top", x: "iso-cake", y: "iso-cake", hatch: false });
    // suction line down the far corner
    I.pipe(g, [[78, Y0 + 4, ZD + 22], [78, Y0 + 4, 20], [104, -20, 20]], "iso-pipe-cold");
    var coldAir = I.group(g);
    // ── the back (+x) face, condenser coils, compressor ──────────
    I.face(g, [[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, ZT], [X1, Y0, ZT]], "iso-x");
    I.face(g, [[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, ZT], [X1, Y0, ZT]], "tz-pat-hatch");
    var cond = []; for (var c = 0; c < 12; c++) { var zc = 70 + c * 31; cond.push(c % 2 ? [X1 + 7, 64, zc] : [X1 + 7, -64, zc]); cond.push(c % 2 ? [X1 + 7, -64, zc] : [X1 + 7, 64, zc]); }
    for (var w = -50; w <= 50; w += 20) I.line(g, [[X1 + 8, w, 60], [X1 + 8, w, 420]], "iso-wire");
    I.pipe(g, cond, "iso-pipe-hot");
    // capillary from the condenser end up the back to the freezer
    I.line(g, [[X1 + 7, -64, 411], [X1 + 7, -72, 440], [X1, -72, 446], [60, Y0 + 3, ZD + 112]], "iso-capillary");
    // compressor (behind the bottom) + discharge line up to the condenser
    var comp = I.group(g);
    I.pipe(g, [[120, 10, 30], [X1 + 7, 64, 30], [X1 + 7, 64, 70]], "iso-pipe-hot");
    // ── cut section of the +y side: wall thickness hatched ───────
    function cut(pts) { I.face(g, pts, "iso-cut"); I.face(g, pts, "tz-pat-hatch"); }
    cut([[X0, Y1, 0], [X0 + T, Y1, 0], [X0 + T, Y1, ZT], [X0, Y1, ZT]]);
    cut([[X1 - T, Y1, 0], [X1, Y1, 0], [X1, Y1, ZT], [X1 - T, Y1, ZT]]);
    cut([[X0, Y1, 0], [X1, Y1, 0], [X1, Y1, ZB], [X0, Y1, ZB]]);
    cut([[X0, Y1, ZD], [X1, Y1, ZD], [X1, Y1, ZD + 10], [X0, Y1, ZD + 10]]);
    cut([[X0, Y1, ZT - T], [X1, Y1, ZT - T], [X1, Y1, ZT], [X0, Y1, ZT]]);
    var heat = I.group(g);

    function update(t, s) {
      [fan, comp, dial, coldAir].forEach(function (x) { while (x.firstChild) x.removeChild(x.firstChild); });
      // fan: a disc on the far wall, blades turning
      var fc = [-10, Y0 + 4, ZD + 70], fa = s.fan;
      I.disc(fan, fc[0], fc[1], fc[2], 22, "y", "iso-steel");
      for (var b = 0; b < 4; b++) { var a = fa + b * Math.PI / 2; I.face(fan, [[fc[0], fc[1] + 1, fc[2]], [fc[0] + Math.cos(a) * 20, fc[1] + 1, fc[2] + Math.sin(a) * 20], [fc[0] + Math.cos(a + 0.6) * 18, fc[1] + 1, fc[2] + Math.sin(a + 0.6) * 18]], "iso-part"); }
      I.disc(fan, fc[0], fc[1] + 2, fc[2], 5, "y", "iso-top");
      // compressor: a dome that hums (shakes a little while it runs)
      var j = s.run ? Math.sin(t * 70) * 0.8 : 0;
      I.cyl(comp, 124, 10 + j, 26, 0, 34, "iso-comp", "iso-comp-top");
      I.cyl(comp, 124, 10 + j, 18, 34, 46, "iso-comp", "iso-comp-top");
      if (s.run) { var q = I.P(124, 10, 52); I.el("path", { d: "M" + (q[0] - 10).toFixed(1) + " " + q[1].toFixed(1) + " q5 -6 10 0 t10 0 M" + (q[0] - 10).toFixed(1) + " " + (q[1] - 6).toFixed(1) + " q5 -6 10 0 t10 0", "class": "iso-hum" }, comp); }
      // thermostat dial needle
      var dc = I.P(-59, Y0 + 15, 287), na = -2.4 + 1.6 * s.dial;
      I.el("circle", { cx: dc[0].toFixed(1), cy: dc[1].toFixed(1), r: 8, "class": "iso-dial" }, dial);
      I.el("path", { d: "M" + dc[0].toFixed(1) + " " + dc[1].toFixed(1) + " l" + (Math.cos(na) * 8).toFixed(1) + " " + (Math.sin(na) * 8).toFixed(1), "class": "iso-needle" }, dial);
    }
    return { iso: I, update: update, gasket: gasket, evap: evap, cond: cond };
  };
})();
