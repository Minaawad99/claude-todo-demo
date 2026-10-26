/* 3D isometric models for "How a car engine works", drawn with TebEzay.iso.
   CarModel: the whole car as a ghosted cutaway (tank, fuel line, engine, transmission, axles, radiator).
   CylModel: one cylinder cut in half on the plane y = 0 (piston, rod, crank, valves, cams, plug, injector).
   Each builder draws the static parts once and returns update(t, state) for the moving ones. */
(function () {
  var D2R = Math.PI / 180;

  // a wheel standing in the x–z plane, axle along y; spokes turn with `ang`
  function wheel(I, g, x, y, z, r, w, ang) {
    var y0 = y - w / 2, y1 = y + w / 2;
    var front = I.ring(x, y1, z, r, 18, "y", -Math.PI / 4, Math.PI * 3 / 4);
    var back = I.ring(x, y0, z, r, 18, "y", -Math.PI / 4, Math.PI * 3 / 4).reverse();
    I.face(g, front.concat(back), "iso-tire");
    I.disc(g, x, y1, z, r, "y", "iso-tire");
    I.disc(g, x, y1 + 0.5, z, r * 0.62, "y", "iso-steel");
    for (var k = 0; k < 5; k++) {
      var a = ang + k * Math.PI * 2 / 5;
      I.line(g, [[x, y1 + 1, z], [x + Math.cos(a) * r * 0.58, y1 + 1, z + Math.sin(a) * r * 0.58]], "iso-spoke");
    }
    I.disc(g, x, y1 + 1.5, z, r * 0.16, "y", "iso-top");
  }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  // piston travel for a crank angle (deg, 0 = top): 0 at the bottom … 1 at the top
  function stroke01(deg) { return 0.5 + 0.5 * Math.cos(deg * D2R); }

  // ───────────────────────────── the whole car ─────────────────────────────
  window.CarModel = function (root, opts) {
    var I = TebEzay.iso(root, opts), g = I.group(root);
    var prof = [[-232, 40], [-232, 92], [-205, 102], [-120, 106], [-78, 160], [58, 164], [118, 110], [222, 100], [234, 72], [234, 40]];
    var win = [[-66, 152], [50, 156], [104, 112], [-104, 112]];
    function ghost(y, dash) {
      I.line(g, prof.map(function (p) { return [p[0], y, p[1]]; }), dash ? "iso-ghost iso-ghost--far" : "iso-ghost");
      I.face(g, win.map(function (p) { return [p[0], y, p[1]]; }), dash ? "iso-ghost iso-ghost--far" : "iso-ghost iso-ghost--win");
    }
    ghost(-92, true);
    var farW = I.group(g);
    // rear axle + floor pan
    I.pipe(g, [[-150, -95, 42], [-150, 95, 42]], "iso-pipe-shaft");
    I.box(g, -215, 215, -82, 82, 24, 32, { z: "iso-steel" });
    // gas tank with the fuel pump on top
    I.box(g, -210, -132, -62, 62, 32, 72, { z: "iso-fuel-top", x: "iso-fuel-x", y: "iso-fuel" });
    I.box(g, -178, -160, -10, 10, 72, 84, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    // fuel line along the floor to the engine
    I.pipe(g, [[-160, -40, 72], [-120, -40, 38], [86, -40, 38], [100, -40, 64]], "iso-pipe-fuel");
    // exhaust: engine → muffler → tailpipe
    I.pipe(g, [[140, 46, 70], [140, 60, 38], [-120, 60, 38]], "iso-pipe-dirty");
    I.box(g, -172, -120, 44, 76, 30, 52, { z: "iso-top", x: "iso-x", y: "iso-y" });
    I.pipe(g, [[-172, 60, 40], [-238, 60, 40]], "iso-pipe-dirty");
    // rear differential and the spinning driveshaft
    I.box(g, -164, -136, -16, 16, 30, 60, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    var shaft = I.group(g);
    // transmission (gear turns on its side)
    I.box(g, 28, 90, -28, 28, 40, 104, {});
    var gear = I.group(g);
    // engine block, open on the +y side so the pistons show
    var bx0 = 90, bx1 = 190, by0 = -40, by1 = 40, bz0 = 40, bz1 = 128;
    I.face(g, [[bx0, by0, bz0], [bx1, by0, bz0], [bx1, by0, bz1], [bx0, by0, bz1]], "iso-wall2");
    I.face(g, [[bx0, by0, bz0], [bx0, by1, bz0], [bx0, by1, bz1], [bx0, by0, bz1]], "iso-wall");
    I.face(g, [[bx0, by0, bz0], [bx1, by0, bz0], [bx1, by1, bz0], [bx0, by1, bz0]], "iso-floor");
    I.pipe(g, [[bx0, 0, 54], [bx1, 0, 54]], "iso-pipe-shaft");
    var pistons = I.group(g);
    I.face(g, [[bx1, by0, bz0], [bx1, by1, bz0], [bx1, by1, bz1], [bx1, by0, bz1]], "iso-x");
    I.face(g, [[bx1, by0, bz0], [bx1, by1, bz0], [bx1, by1, bz1], [bx1, by0, bz1]], "tz-pat-hatch");
    I.line(g, [[bx0, by1, bz1], [bx0, by1, bz0], [bx1, by1, bz0], [bx1, by1, bz1]], "iso-cut-edge");
    // head, cam cover, spark plugs
    I.box(g, bx0, bx1, by0, by1, bz1, bz1 + 18, {});
    var heatGlow = I.group(g, { "class": "iso-glowgrp" });
    I.face(heatGlow, [[bx0 - 4, by1 + 2, bz0 - 4], [bx1 + 4, by1 + 2, bz0 - 4], [bx1 + 4, by1 + 2, bz1 + 22], [bx0 - 4, by1 + 2, bz1 + 22]], "iso-heat-glow");
    var cam = I.group(g);
    I.box(cam, bx0 + 6, bx1 - 6, -26, 2, bz1 + 18, bz1 + 30, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    var CX = [102.5, 127.5, 152.5, 177.5];
    CX.forEach(function (x) { I.cyl(g, x, 18, 5, bz1 + 18, bz1 + 34, "iso-top", "iso-top"); });
    var sparks = I.group(g);
    // radiator up front + its hoses
    I.pipe(g, [[184, -20, 140], [209, -20, 114]], "iso-pipe-i");
    I.box(g, 204, 214, -66, 66, 40, 118, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false });
    for (var zf = 48; zf < 116; zf += 9) I.line(g, [[214, -64, zf], [214, 64, zf]], "iso-wire");
    I.pipe(g, [[209, 24, 46], [190, 24, 50]], "iso-pipe-i");
    var nearW = I.group(g);
    ghost(92, false);
    [[-232, 40], [-232, 92], [-78, 160], [58, 164], [234, 72], [234, 40]].forEach(function (p) { I.line(g, [[p[0], -92, p[1]], [p[0], 92, p[1]]], "iso-ghost iso-ghost--far"); });
    // the gas station pump, beside the car (line 4 only)
    var pump = I.group(g);
    I.box(pump, -222, -190, 150, 184, 0, 120, { z: "iso-top", x: "iso-hot", y: "iso-hot" });
    I.face(pump, [[-212, 184, 70], [-196, 184, 70], [-196, 184, 98], [-212, 184, 98]], "iso-fuel");
    I.line(pump, [[-206, 150, 86], [-210, 128, 40], [-198, 100, 70], [-190, 94, 80]], "iso-hose");

    function update(t, s) {
      [farW, nearW, shaft, gear, pistons, sparks].forEach(clear);
      wheel(I, farW, -150, -95, 42, 42, 26, -s.wheel); wheel(I, farW, 150, -95, 42, 42, 26, -s.wheel);
      wheel(I, nearW, -150, 95, 42, 42, 26, -s.wheel); wheel(I, nearW, 150, 95, 42, 42, 26, -s.wheel);
      var sh = I.line(shaft, [[30, 0, 62], [-140, 0, 48]], "iso-pipe-shaft"); I.line(shaft, [[30, 0, 62], [-140, 0, 48]], "iso-shaft-spin").style.strokeDashoffset = (-s.shaft * 40).toFixed(1);
      // gear on the transmission's side, turning
      var gp = [], n = 12;
      for (var k = 0; k < n * 2; k++) { var a = s.shaft + k * Math.PI / n, r = k % 2 ? 15 : 19; gp.push([60 + Math.cos(a) * r, 29, 72 + Math.sin(a) * r]); }
      I.face(gear, gp, "iso-part"); I.disc(gear, 60, 29.5, 72, 5, "y", "iso-top");
      // four pistons, firing order 1-3-4-2
      var OFF = [0, 540, 180, 360];
      CX.forEach(function (x, i) {
        var ph = ((s.phi + OFF[i]) % 720 + 720) % 720, top = 86 + 30 * stroke01(ph);
        I.line(pistons, [[x, 0, 54], [x, 0, top - 14]], "iso-rod");
        I.cyl(pistons, x, 0, 11, top - 14, top, "iso-steel", "iso-top");
        var f = ph >= 360 && ph < 470 ? 1 - (ph - 360) / 110 : 0;
        if (f > 0 && s.fire) {
          var c = I.cyl(pistons, x, 0, 11, top, bz1, "iso-burn", "iso-burn-top"); c.style.opacity = f.toFixed(2);
          c.previousSibling.style.opacity = f.toFixed(2);
          var q = I.P(x, 18, bz1 + 36), b = I.el("path", { d: "M" + q[0].toFixed(1) + " " + (q[1] - 4).toFixed(1) + " l3 -5 l-4 0 l4 -6", "class": "iso-bolt" }, sparks); b.style.opacity = f.toFixed(2);
        }
      });
      heatGlow.style.opacity = s.glow.toFixed(2);
    }
    return { iso: I, update: update, pump: pump };
  };

  // ───────────────────────────── one cylinder ─────────────────────────────
  window.CylModel = function (root, opts) {
    var I = TebEzay.iso(root, opts), g = I.group(root), R = 46, HB = 118, HT = 160, IX = -26, EX = 26;
    // back wall of the block + crankcase, and the crankcase floor
    I.face(g, [[-80, -72, -130], [80, -72, -130], [80, -72, HT], [-80, -72, HT]], "iso-wall2");
    I.face(g, [[-80, -72, -130], [80, -72, -130], [80, -72, HT], [-80, -72, HT]], "tz-pat-hatch", { style: "opacity:.3" });
    I.face(g, [[-80, -72, -130], [80, -72, -130], [80, 0, -130], [-80, 0, -130]], "iso-floor");
    // inside of the bore (back half)
    I.face(g, I.ring(0, 0, HB, R, 24, "z", Math.PI, Math.PI * 2).concat(I.ring(0, 0, 0, R, 24, "z", Math.PI, Math.PI * 2).reverse()), "iso-bore");
    // intake runner on the left, coming in from outside
    I.pipe(g, [[-170, 0, 141], [-80, 0, 141]], "iso-pipe-air");
    var crank = I.group(g);
    var piston = I.group(g);
    var gas = I.group(g);
    // the cut faces on the plane y = 0 (hatched section)
    function cut(pts) { var l = pts.map(function (p) { return [p[0], 0, p[1]]; }); I.face(g, l, "iso-cut"); I.face(g, l, "tz-pat-hatch"); }
    cut([[-80, 0], [-R, 0], [-R, HB], [-80, HB]]); cut([[R, 0], [80, 0], [80, HB], [R, HB]]);
    cut([[-80, -130], [-68, -130], [-68, 0], [-80, 0]]); cut([[68, -130], [80, -130], [80, 0], [68, 0]]); cut([[-80, -130], [80, -130], [80, -120], [-80, -120]]);
    cut([[-80, HB], [80, HB], [80, HT], [-80, HT]]);
    // ports: intake (left) and exhaust (right), hollow channels in the head
    var port = function (s) { return [[-80, 132], [-80, 150], [-44, 148], [-16, HB], [-36, HB], [-52, 132]].map(function (p) { return [s * p[0], 0, p[1]]; }); };
    I.face(g, port(1), "iso-port"); I.face(g, port(-1), "iso-port");
    // outer faces: +x side and head top
    I.face(g, [[80, -72, -130], [80, 0, -130], [80, 0, HT], [80, -72, HT]], "iso-x");
    I.face(g, [[80, -72, -130], [80, 0, -130], [80, 0, HT], [80, -72, HT]], "tz-pat-hatch");
    I.face(g, [[-80, -72, HT], [80, -72, HT], [80, 0, HT], [-80, 0, HT]], "iso-top");
    // exhaust pipe on the right, going out
    I.pipe(g, [[80, 0, 141], [180, 0, 141]], "iso-pipe-dirty");
    // injector body, aimed at the intake valve
    I.line(g, [[-70, 0, 178], [-52, 0, 146]], "iso-injector");
    var valves = I.group(g);
    var cams = I.group(g);
    var plug = I.group(g);

    function update(t, s) {
      [crank, piston, gas, valves, cams, plug].forEach(clear);
      var th = s.theta, ph = ((th % 720) + 720) % 720, a = th * D2R;
      var cz = -70, thr = 36, rod = 120, px = thr * Math.sin(a), pz = cz + thr * Math.cos(a);
      var pin = cz + thr * Math.cos(a) + Math.sqrt(rod * rod - Math.pow(thr * Math.sin(a), 2)), top = pin + 22;
      // crankshaft: journal, back web, pin, rod, front web
      I.pipe(crank, [[0, -72, cz], [0, -22, cz]], "iso-pipe-shaft");
      function web(y) {
        var pts = [];
        for (var k = 0; k <= 16; k++) { var b = a + Math.PI + (k / 16 - 0.5) * 2.2; pts.push([Math.sin(b) * 44, y, cz + Math.cos(b) * 44]); }
        pts.push([px + Math.sin(a + 1.2) * 12, y, pz + Math.cos(a + 1.2) * 12], [px + Math.sin(a - 1.2) * 12, y, pz + Math.cos(a - 1.2) * 12]);
        I.face(crank, pts, "iso-part"); I.disc(crank, 0, y + 0.5, cz, 8, "y", "iso-part-top");
      }
      web(-20);
      I.pipe(crank, [[px, -20, pz], [px, 18, pz]], "iso-pipe-shaft");
      I.face(crank, [[px - 9, 6, pz], [px + 9, 6, pz], [6, 6, pin], [-6, 6, pin]], "iso-part-x");
      I.face(crank, [[px - 9, 8, pz], [px + 9, 8, pz], [6, 8, pin], [-6, 8, pin]], "iso-part");
      I.disc(crank, px, 8.5, pz, 12, "y", "iso-part-top");
      web(20);
      I.pipe(crank, [[0, 20, cz], [0, 60, cz]], "iso-pipe-shaft");
      // piston with rings
      I.cyl(piston, 0, 0, R - 2, top - 40, top, "iso-steel", "iso-top");
      [6, 11, 16].forEach(function (d) { I.line(piston, I.ring(0, 0, top - d, R - 2, 16, "z", -Math.PI / 4, Math.PI * 3 / 4), "iso-ring"); });
      I.disc(piston, 0, 1, pin, 6, "y", "iso-part-top");
      // what fills the chamber: air (blue) → mix (amber) → squeezed → flame (red) → exhaust (grey)
      if (s.gas && top < HB - 1) {
        var c = I.cyl(gas, 0, 0, R - 3, top, HB, "iso-gas " + s.gas, "iso-gas-top " + s.gas);
        c.style.opacity = (s.gasA * 0.8).toFixed(2); c.previousSibling.style.opacity = s.gasA.toFixed(2);
      }
      // valves (lift from the crank angle) and the cams that push them
      var li = ph < 180 ? 12 * Math.sin(ph / 180 * Math.PI) : 0, le = ph >= 540 ? 12 * Math.sin((ph - 540) / 180 * Math.PI) : 0;
      [[IX, li, -135], [EX, le, -45]].forEach(function (v) {
        var x = v[0], z = HB - v[1];
        I.line(valves, [[x, 0, z], [x, 0, 196 - v[1]]], "iso-stem");
        I.cyl(valves, x, 0, 11, z - 3, z, "iso-part", "iso-part-top");
        var zz = []; for (var k = 0; k <= 8; k++) zz.push([x + (k % 2 ? 7 : -7), 0, HT + 4 + (196 - v[1] - HT - 4) * k / 8]);
        I.line(valves, zz, "iso-spring");
        var ca = th / 2 * D2R + v[2] * D2R, lobe = [];
        for (var j = 0; j <= 24; j++) { var b = j / 24 * Math.PI * 2, r = 9 + 7 * Math.pow(Math.max(0, Math.cos(b)), 3); lobe.push([x + Math.cos(b + ca) * r, 6, 206 + Math.sin(b + ca) * r]); }
        I.pipe(cams, [[x, -72, 206], [x, 6, 206]], "iso-pipe-shaft");
        I.face(cams, lobe, "iso-part");
      });
      // spark plug + spark
      I.line(plug, [[0, 0, HB + 2], [0, 0, HT]], "iso-stem");
      I.cyl(plug, 0, 0, 10, HT, HT + 10, "iso-part", "iso-part-top");
      I.cyl(plug, 0, 0, 7, HT + 10, HT + 46, "iso-ceramic", "iso-top");
      if (s.spark > 0) {
        var q = I.P(0, 0, HB);
        I.el("circle", { cx: q[0].toFixed(1), cy: (q[1] + 6).toFixed(1), r: (14 * s.spark).toFixed(1), "class": "iso-spark-glow" }, plug);
        I.el("path", { d: "M" + (q[0] - 6) + " " + (q[1] - 2) + " l8 4 l-6 3 l9 5", "class": "iso-bolt" }, plug);
      }
      // injector spray
      if (s.spray > 0) {
        for (var k2 = -2; k2 <= 2; k2++) {
          var e = I.line(plug, [[-52, 0, 146], [-30 + k2 * 5, 0, 122 - Math.abs(k2) * 2]], "iso-spray"); e.style.opacity = s.spray.toFixed(2); e.style.strokeDashoffset = (-t * 60).toFixed(1);
        }
      }
    }
    return { iso: I, update: update, R: R, HB: HB, HT: HT, IX: IX, EX: EX };
  };
})();
