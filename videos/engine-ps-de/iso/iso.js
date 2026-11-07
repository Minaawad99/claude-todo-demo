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

  // ───────────────────────────── «150 PS gegen 400 PS»: engines, turbo, weight lift ─────────────────────────────
  // an engine block in a row (n cylinders along x), open on the +y side so the pistons show; centred on (ox, oy)
  // an inline engine, after the cut-away photos: aluminium block open on the +y side (bores, pistons with rings, rods to the crank),
  // the head with a ribbed valve cover, coil packs, intake runners rising to a plenum on the far side, the exhaust collector
  // leaving at the front end, and the timing cover with its pulleys and belt. Centred on (ox, oy).
  window.RowEngine = function (I, root, ox, oy, n, o) {
    o = o || {}; var g = I.group(root), sp = o.sp || 26, W = n * sp + 12, x0 = ox - W / 2, x1 = ox + W / 2, y0 = oy - 26, y1 = oy + 26, z0 = 0, z1 = 86;
    // intake runners + plenum behind the head (far side, −y)
    I.box(g, x0 + 4, x1 - 4, y0 - 44, y0 - 26, z1 + 34, z1 + 52, { z: "iso-steel", x: "iso-x", y: "iso-y" });
    var CX = []; for (var i = 0; i < n; i++) CX.push(x0 + 6 + sp / 2 + i * sp);
    CX.forEach(function (x) { I.pipe(g, [[x, y0, z1 + 6], [x, y0 - 16, z1 + 14], [x, y0 - 30, z1 + 36]], "iso-pipe-air"); });
    // block walls + crankcase floor
    I.face(g, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], "iso-wall2");
    I.face(g, [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], "iso-wall");
    I.face(g, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], "iso-floor");
    CX.forEach(function (x) { I.face(g, I.ring(x, oy, 22, sp * 0.44, 20, "z", Math.PI, Math.PI * 2).concat(I.ring(x, oy, z1 - 2, sp * 0.44, 20, "z", Math.PI, Math.PI * 2).reverse()), "iso-bore"); });
    I.pipe(g, [[x0, oy, 14], [x1, oy, 14]], "iso-pipe-shaft");
    var pistons = I.group(g);
    I.face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], "iso-x");
    I.face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], "tz-pat-hatch");
    I.line(g, [[x0, y1, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1]], "iso-cut-edge");
    // oil pan
    I.box(g, x0 + 6, x1 - 6, y0 + 4, y1 - 4, -24, 0, { z: "iso-top", x: "iso-part-x", y: "iso-part" });
    // head + ribbed valve cover + oil cap + coil packs
    I.box(g, x0 - 2, x1 + 2, y0, y1, z1, z1 + 14, {});
    I.box(g, x0 + 4, x1 - 4, y0 + 6, y1 - 6, z1 + 14, z1 + 28, { z: "iso-steel", x: "iso-x", y: "iso-y" });
    for (var rx = x0 + 12; rx < x1 - 8; rx += 9) I.line(g, [[rx, y0 + 8, z1 + 28.5], [rx, y1 - 8, z1 + 28.5]], "iso-wire");
    I.cyl(g, x1 - 14, oy - 10, 5, z1 + 28, z1 + 34, "iso-part", "iso-part-top");
    CX.forEach(function (x) { I.box(g, x - 5, x + 5, oy + 2, oy + 14, z1 + 28, z1 + 40, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" }); });
    // exhaust collector out of the front end, down and away
    I.pipe(g, [[x1 + 2, y1 - 8, z1 + 4], [x1 + 18, y1 - 4, z1 - 10], [x1 + 22, y1 + 6, 20], [x1 + 30, y1 + 30, 4]], "iso-pipe-dirty");
    // timing cover + pulleys + belt on the front end (+x)
    I.box(g, x1, x1 + 8, y0 + 4, y1 - 4, -10, z1 + 20, { z: "iso-top", x: "iso-part-x", y: "iso-part" });
    var PU = [[oy, 4, 13], [oy, z1 + 6, 11], [oy - 18, 48, 8], [oy + 16, 56, 9]];
    I.line(g, [[x1 + 9, PU[0][0] - 13, PU[0][1]], [x1 + 9, PU[2][0] - 8, PU[2][1]], [x1 + 9, PU[1][0] - 11, PU[1][1]], [x1 + 9, PU[1][0] + 11, PU[1][1]], [x1 + 9, PU[3][0] + 9, PU[3][1]], [x1 + 9, PU[0][0] + 13, PU[0][1]]], "iso-hose");
    var pul = I.group(g);
    var ORD = n === 4 ? [0, 2, 3, 1] : n === 5 ? [0, 3, 1, 4, 2] : [0, 2, 1, 3];
    function update(phi, fire) {
      while (pistons.firstChild) pistons.removeChild(pistons.firstChild);
      while (pul.firstChild) pul.removeChild(pul.firstChild);
      CX.forEach(function (x, i) {
        var ph = ((phi + ORD[i % ORD.length] * 720 / n) % 720 + 720) % 720, top = 40 + 28 * (0.5 + 0.5 * Math.cos(ph * Math.PI / 180));
        I.line(pistons, [[x, oy, 14], [x, oy, top - 14]], "iso-rod");
        I.cyl(pistons, x, oy, sp * 0.4, top - 14, top, "iso-steel", "iso-top");
        [3, 6].forEach(function (d) { I.line(pistons, I.ring(x, oy, top - d, sp * 0.4, 12, "z", -Math.PI / 4, Math.PI * 3 / 4), "iso-ring"); });
        var f = ph < 110 ? 1 - ph / 110 : 0;
        if (f > 0 && fire !== false) { var c = I.cyl(pistons, x, oy, sp * 0.4, top, z1 - 2, "iso-burn", "iso-burn-top"); c.style.opacity = f.toFixed(2); c.previousSibling.style.opacity = f.toFixed(2); }
      });
      var a = phi * Math.PI / 180;
      PU.forEach(function (p, k) { I.disc(pul, x1 + 9, p[0], p[1], p[2], "x", "iso-steel"); var b = a * (k === 1 ? 0.5 : 1); I.line(pul, [[x1 + 9.5, p[0] - Math.cos(b) * p[2] * 0.8, p[1] - Math.sin(b) * p[2] * 0.8], [x1 + 9.5, p[0] + Math.cos(b) * p[2] * 0.8, p[1] + Math.sin(b) * p[2] * 0.8]], "iso-stem"); I.disc(pul, x1 + 10, p[0], p[1], 2.5, "x", "iso-top"); });
    }
    return { update: update, g: g, top: [ox, oy, z1 + 30] };
  };
  // a V8 after the Holden V8 photo: two closed banks leaning out at 45° from the crankcase, silver ribbed valve covers,
  // the intake manifold sitting in the valley with its throttle body, red plug leads, and the pulleys + belt at the front
  window.VEngine = function (I, root, ox, oy, o) {
    o = o || {}; var g = I.group(root), sp = 26, n = 4, W = n * sp + 12, x0 = ox - W / 2, x1 = ox + W / 2, ax = 0.7, az = 0.7, Lb = 84, w = 20;
    function bank(sg) {
      var uy = sg * ax, uz = az, ny = az, nz = -sg * ax;
      return function (x, s, d) { return [x, oy + sg * 10 + uy * Lb * s + ny * d, 24 + uz * Lb * s + nz * d]; };
    }
    var BK = [bank(-1), bank(1)], plugs = [];
    I.box(g, x0 + 6, x1 - 6, oy - 28, oy + 28, -22, 0, { z: "iso-top", x: "iso-part-x", y: "iso-part" });
    I.box(g, x0, x1, oy - 34, oy + 34, 0, 26, {});
    function drawBank(P3, k) {
      I.face(g, [P3(x0, 0, w), P3(x1, 0, w), P3(x1, 1, w), P3(x0, 1, w)], k ? "iso-y" : "iso-wall");
      I.face(g, [P3(x1, 0, -w), P3(x1, 0, w), P3(x1, 1, w), P3(x1, 1, -w)], "iso-x");
      I.face(g, [P3(x1, 0, -w), P3(x1, 0, w), P3(x1, 1, w), P3(x1, 1, -w)], "tz-pat-hatch");
      for (var c = 0; c < n; c++) { var cx = x0 + 6 + sp / 2 + c * sp; I.face(g, [P3(cx - 9, 0.2, w + 0.5), P3(cx + 9, 0.2, w + 0.5), P3(cx + 9, 0.85, w + 0.5), P3(cx - 9, 0.85, w + 0.5)], "iso-bore"); }
      // head, then the silver valve cover with ribs
      I.face(g, [P3(x0, 1, w), P3(x1, 1, w), P3(x1, 1.12, w), P3(x0, 1.12, w)], "iso-part");
      I.face(g, [P3(x1, 1, -w), P3(x1, 1, w), P3(x1, 1.12, w), P3(x1, 1.12, -w)], "iso-part-x");
      I.face(g, [P3(x0 + 3, 1.12, w - 3), P3(x1 - 3, 1.12, w - 3), P3(x1 - 3, 1.3, w - 3), P3(x0 + 3, 1.3, w - 3)], "iso-y");
      I.face(g, [P3(x1 - 3, 1.12, -w + 3), P3(x1 - 3, 1.12, w - 3), P3(x1 - 3, 1.3, w - 3), P3(x1 - 3, 1.3, -w + 3)], "iso-x");
      I.face(g, [P3(x0 + 3, 1.3, -w + 3), P3(x1 - 3, 1.3, -w + 3), P3(x1 - 3, 1.3, w - 3), P3(x0 + 3, 1.3, w - 3)], "iso-steel");
      for (var r = x0 + 12; r < x1 - 8; r += 9) I.line(g, [P3(r, 1.3, -w + 5), P3(r, 1.3, w - 5)], "iso-wire");
      var gg = I.group(g); plugs.push(gg);
    }
    drawBank(BK[0], 0);
    // intake manifold in the valley (between the banks), throttle body at the front
    I.box(g, x0 + 4, x1 - 4, oy - 16, oy + 16, 60, 82, { z: "iso-steel", x: "iso-x", y: "iso-y" });
    I.disc(g, x1 - 3, oy, 71, 9, "x", "iso-part"); I.disc(g, x1 - 2, oy, 71, 5, "x", "iso-top");
    drawBank(BK[1], 1);
    // front pulleys + belt
    var PU = [[oy, 8, 15], [oy, 48, 10], [oy + 34, 40, 9], [oy - 30, 44, 8]];
    I.line(g, [[x1 + 7, PU[0][0] - 15, PU[0][1]], [x1 + 7, PU[3][0] - 8, PU[3][1]], [x1 + 7, PU[1][0], PU[1][1] + 10], [x1 + 7, PU[2][0] + 9, PU[2][1]], [x1 + 7, PU[0][0] + 15, PU[0][1]]], "iso-hose");
    var pul = I.group(g);
    function update(phi, fire) {
      plugs.forEach(function (gg, k) {
        while (gg.firstChild) gg.removeChild(gg.firstChild);
        for (var c = 0; c < n; c++) {
          var cx = x0 + 6 + sp / 2 + c * sp, q = BK[k](cx, 1.3, w - 2), ph = ((phi + (c * 2 + k) * 90) % 720 + 720) % 720, f = ph < 120 ? 1 - ph / 120 : 0;
          I.line(gg, [q, [q[0], q[1] + (k ? 14 : -14), q[2] - 8]], "iso-lead");
          I.cyl(gg, q[0], q[1], 3.5, q[2], q[2] + 8, "iso-ceramic", "iso-top");
          if (f > 0 && fire !== false) { var e = I.disc(gg, q[0], q[1], q[2] + 10, 5 + 8 * f, "z", "iso-burn"); e.style.opacity = f.toFixed(2); }
        }
      });
      while (pul.firstChild) pul.removeChild(pul.firstChild);
      var a = phi * Math.PI / 180;
      PU.forEach(function (p) { I.disc(pul, x1 + 7, p[0], p[1], p[2], "x", "iso-steel"); I.line(pul, [[x1 + 7.5, p[0] - Math.cos(a) * p[2] * 0.8, p[1] - Math.sin(a) * p[2] * 0.8], [x1 + 7.5, p[0] + Math.cos(a) * p[2] * 0.8, p[1] + Math.sin(a) * p[2] * 0.8]], "iso-stem"); I.disc(pul, x1 + 8, p[0], p[1], 2.5, "x", "iso-top"); });
    }
    return { update: update, g: g, top: [ox, oy, 100] };
  };
  // a turbocharger standing up, after cut-away turbos: cast-iron turbine housing below (its scroll outlet and flange bolts,
  // a glowing rim), the centre bearing housing with oil feed and drain, the aluminium compressor housing above with its
  // scroll outlet, and the round wastegate actuator with its rod
  window.Turbo = function (I, root, ox, oy, oz, o) {
    o = o || {}; var g = I.group(root), r = o.r || 34;
    I.pipe(g, [[ox + r, oy + 6, oz + 14], [ox + r + 22, oy + 18, oz + 14]], "iso-pipe-dirty");
    I.cyl(g, ox, oy, r + 8, oz, oz + 30, "iso-iron", "iso-iron-top");
    var glow = I.face(g, I.ring(ox, oy, oz + 30, r + 7, 28, "z"), "iso-heat-glow"); glow.style.opacity = ".45";
    for (var b = 0; b < 8; b++) { var ba = b * Math.PI / 4; I.disc(g, ox + Math.cos(ba) * (r + 3), oy + Math.sin(ba) * (r + 3), oz + 30.5, 2, "z", "iso-stem"); }
    var tw = I.group(g);
    I.cyl(g, ox, oy, 14, oz + 30, oz + 60, "iso-steel", "iso-top");
    I.pipe(g, [[ox - 8, oy + 12, oz + 64], [ox - 8, oy + 30, oz + 90]], "iso-pipe-fuel"); I.pipe(g, [[ox + 6, oy + 12, oz + 34], [ox + 6, oy + 30, oz + 8]], "iso-pipe-fuel");
    I.pipe(g, [[ox - r, oy - 6, oz + 76], [ox - r - 26, oy - 22, oz + 76]], "iso-pipe-air");
    I.cyl(g, ox, oy, r + 8, oz + 60, oz + 88, "iso-steel", "iso-top");
    var cw = I.group(g);
    I.cyl(g, ox + r + 4, oy - r - 8, 12, oz + 64, oz + 82, "iso-part", "iso-part-top");
    I.line(g, [[ox + r + 4, oy - r - 8, oz + 64], [ox + r - 2, oy - 6, oz + 22]], "iso-stem");
    function blades(gg, z, rr, ang, cls) {
      while (gg.firstChild) gg.removeChild(gg.firstChild);
      I.disc(gg, ox, oy, z, rr, "z", "iso-bore");
      for (var k = 0; k < 11; k++) { var a = ang + k * Math.PI * 2 / 11; I.line(gg, [[ox + Math.cos(a) * 5, oy + Math.sin(a) * 5, z], [ox + Math.cos(a + 0.25) * rr * 0.6, oy + Math.sin(a + 0.25) * rr * 0.6, z], [ox + Math.cos(a + 0.5) * rr * 0.95, oy + Math.sin(a + 0.5) * rr * 0.95, z]], cls); }
      I.disc(gg, ox, oy, z, 6, "z", "iso-top");
    }
    function update(ang) { blades(tw, oz + 30.5, r, ang, "iso-heat"); blades(cw, oz + 88.5, r, ang, "iso-pipe-shaft"); }
    return { update: update, g: g, hot: [ox, oy, oz + 15], cold: [ox, oy, oz + 88] };
  };
  // a horse in side view (real proportions: deep chest, arched neck, long head, thin legs with knees and dark hooves, mane
  // and tail), standing on the floor at model point (hx, py, 0). An upright figure reads best as a flat side view placed
  // at its 3D foot point (like the labels), so it is not sheared by the projection. Faces left, trots with diagonal pairs.
  window.isoHorse = function (I, g, hx, py, t) {
    var q = I.P(hx, py, 0), st = Math.sin(t * 9), k = I.scale * 0.62;
    var G = I.el("g", { transform: "translate(" + q[0].toFixed(1) + " " + (q[1] - Math.abs(Math.sin(t * 9)) * 2).toFixed(1) + ") scale(" + (-k).toFixed(3) + " " + k.toFixed(3) + ")" }, g);
    function leg(hx0, sw, far) { var kx = hx0 + sw * 10, fx = kx + sw * 8, fy = -4 + Math.max(0, sw) * -6;
      I.el("path", { d: "M" + hx0 + " -76 L" + kx.toFixed(1) + " -40 L" + fx.toFixed(1) + " " + fy.toFixed(1), "class": far ? "iso-horse-leg iso-horse-far" : "iso-horse-leg" }, G);
      I.el("path", { d: "M" + (fx - 6).toFixed(1) + " " + fy.toFixed(1) + " h12 l-2 -7 h-8 Z", "class": "iso-hoof" }, G); }
    leg(-46, -st, true); leg(44, st, true);
    I.el("path", { d: "M-62 -88 C-90 -86 -100 -52 -92 -22 C-86 -42 -78 -62 -64 -74", "class": "iso-horse-dark", transform: "rotate(" + (Math.sin(t * 4) * 6).toFixed(1) + " -62 -88)" }, G);
    I.el("path", { d: "M-64 -92 C-70 -112 -50 -122 -20 -120 C10 -118 40 -122 56 -116 C70 -110 70 -82 62 -68 C50 -52 20 -54 -10 -56 C-40 -54 -60 -60 -64 -92 Z", "class": "iso-horse" }, G);
    I.el("path", { d: "M40 -118 C52 -142 70 -166 84 -174 C92 -178 100 -176 104 -170 L126 -142 C130 -136 128 -130 120 -130 C112 -130 106 -134 100 -140 L86 -148 C80 -132 72 -112 62 -96 Z", "class": "iso-horse" }, G);
    I.el("path", { d: "M88 -174 C74 -162 62 -142 52 -120 L60 -116 C70 -138 80 -156 94 -170 Z", "class": "iso-horse-dark" }, G);
    I.el("path", { d: "M92 -176 L96 -192 L102 -174 Z", "class": "iso-horse" }, G);
    I.el("circle", { cx: 104, cy: -160, r: 3, "class": "iso-hoof" }, G);
    leg(-50, st, false); leg(48, -st, false);
    return G;
  };
  // a crane post with a pulley and a 75 kg weight that rises 1 m
  window.Lift = function (I, root) {
    var g = I.group(root);
    I.face(g, [[-120, -80, 0], [120, -80, 0], [120, 80, 0], [-120, 80, 0]], "iso-floor");
    I.box(g, 30, 44, -6, 8, 0, 230, {});
    I.box(g, -60, 44, -6, 8, 230, 242, {});
    I.disc(g, -50, 1, 222, 12, "y", "iso-part");
    var mv = I.group(g);
    // the metre ruler
    I.line(g, [[70, 0, 20], [70, 0, 140]], "iso-heat"); I.line(g, [[62, 0, 20], [78, 0, 20]], "iso-heat"); I.line(g, [[62, 0, 140], [78, 0, 140]], "iso-heat");
    function update(k) {
      while (mv.firstChild) mv.removeChild(mv.firstChild);
      var z = 20 + 120 * k;
      I.line(mv, [[-50, 1, 222], [-50, 1, z + 44]], "iso-hose");
      I.box(mv, -74, -26, -24, 24, z, z + 44, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    }
    return { update: update, g: g };
  };
})();
