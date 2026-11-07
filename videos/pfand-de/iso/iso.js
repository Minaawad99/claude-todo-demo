/* 3D isometric models for «Wie erkennt der Pfandautomat deine Flasche?», drawn with TebEzay.iso.
   Shapes after the photo of a Tomra T-710 (front) and the usual insides of a reverse vending machine
   (rollers, camera ring, sorting flap, press, crate belt). Each builder draws the fixed parts once and returns
   update(t, state) for the moving ones. */
(function () {
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function hull(pts) {   // convex hull of screen points (monotone chain)
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [];
    pts.forEach(function (p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (var i = pts.length - 1; i >= 0; i--) { var p = pts[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  // a cylinder lying along x from x0 to x1 (radius r at height z, depth y): body + front end cap
  function lying(I, g, x0, x1, y, z, r, side, cap) {
    var pts = I.ring(x0, y, z, r, 20, "x").concat(I.ring(x1, y, z, r, 20, "x")).map(function (p) { return I.P(p[0], p[1], p[2]); });
    var h = hull(pts); I.el("path", { d: "M" + h.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + " Z", "class": side }, g);
    return I.disc(g, x1, y, z, r, "x", cap || side);
  }
  window.isoLying = lying;
  // an upright PET bottle (cap, neck, shoulder, body, red label band), base centre (x, y, z); o: {s, label, crushed}
  window.Bottle = function (I, g, x, y, z, o) {
    o = o || {}; var k = o.s || 1, r = 16 * k;
    if (o.crushed) { I.box(g, x - r, x + r, y - 6 * k, y + 6 * k, z, z + 50 * k, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false }); return; }
    I.cyl(g, x, y, r, z, z + 60 * k, "iso-glass", "iso-glass");
    if (o.label !== false) { I.cyl(g, x, y, r + 0.5, z + 22 * k, z + 46 * k, "iso-hot", "iso-hot-top"); }
    I.cyl(g, x, y, r * 0.75, z + 60 * k, z + 68 * k, "iso-glass", "iso-glass");
    I.cyl(g, x, y, r * 0.4, z + 68 * k, z + 80 * k, "iso-glass", "iso-glass");
    I.cyl(g, x, y, r * 0.45, z + 80 * k, z + 88 * k, "iso-water-side", "iso-water");
  };
  // a brown refillable glass bottle
  window.GlassBottle = function (I, g, x, y, z, o) {
    o = o || {}; var k = o.s || 1, r = 14 * k;
    I.cyl(g, x, y, r, z, z + 58 * k, "iso-brown", "iso-brown-top");
    I.cyl(g, x, y, r + 0.5, z + 18 * k, z + 40 * k, "iso-top", "iso-top");
    I.cyl(g, x, y, r * 0.5, z + 58 * k, z + 84 * k, "iso-brown", "iso-brown-top");
    I.cyl(g, x, y, r * 0.55, z + 84 * k, z + 88 * k, "iso-fuel", "iso-fuel-top");
  };
  window.Can = function (I, g, x, y, z, o) {
    o = o || {}; var k = o.s || 1, r = 15 * k;
    I.cyl(g, x, y, r, z, z + 56 * k, "iso-hot", "iso-steel");
    I.cyl(g, x, y, r + 0.3, z + 52 * k, z + 56 * k, "iso-steel", "iso-steel");
  };
  // a beer crate with 4×5 bottle necks
  window.Crate = function (I, g, x, y, z, o) {
    o = o || {}; var n = o.n == null ? 20 : o.n;
    I.box(g, x - 40, x + 40, y - 30, y + 30, z, z + 46, { z: "iso-water", x: "iso-water-side", y: "iso-water-side" });
    for (var i = 0; i < n; i++) { var bx = x - 32 + (i % 5) * 16, by = y - 22 + Math.floor(i / 5) * 15; I.cyl(g, bx, by, 4, z + 46, z + 62, "iso-brown", "iso-brown-top"); }
  };

  // ───────────────────────────── the machine, cut open on the +y side ─────────────────────────────
  // x runs from the bottle opening (x = -170) to the back; the bottle lies along x and moves +x.
  window.RVMModel = function (root, opts) {
    var I = TebEzay.iso(root, opts), g = I.group(root), X0 = -170, X1 = 170, Y0 = -70, Y1 = 70, Z1 = 230;
    // back wall, left (front) wall with the round opening, floor
    I.face(g, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y0, Z1], [X0, Y0, Z1]], "iso-wall2");
    I.face(g, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y0, Z1], [X0, Y0, Z1]], "tz-pat-hatch", { style: "opacity:.25" });
    I.face(g, [[X0, Y0, 0], [X0, Y1, 0], [X0, Y1, Z1], [X0, Y0, Z1]], "iso-wall");
    I.disc(g, X0 + 0.5, 0, 150, 30, "x", "iso-port");
    I.face(g, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y1, 0], [X0, Y1, 0]], "iso-floor");
    // rollers under the bottle path (lying along y)
    var rollers = I.group(g);
    // the camera ring (frame) round the bottle path at x = -70
    var CR = -70;
    I.face(g, I.ring(CR, 0, 150, 52, 30, "x"), "iso-part"); I.face(g, I.ring(CR + 0.5, 0, 150, 40, 30, "x"), "iso-bore");
    var cams = []; for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; cams.push([CR, Math.cos(a) * 46, 150 + Math.sin(a) * 46]); }
    cams.forEach(function (c) { I.box(g, c[0] - 6, c[0] + 6, c[1] - 6, c[1] + 6, c[2] - 6, c[2] + 6, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" }); });
    var beams = I.group(g);
    // the scale plate under the scanning zone
    I.box(g, -150, 0, -26, 26, 98, 102, { z: "iso-steel", x: "iso-x", y: "iso-y" });
    // sorting flap + chute to the press (up/back) and to the crate belt (down)
    var flap = I.group(g);
    // the press: a box with two spiked rollers seen through its open side, the bin under it
    I.box(g, 60, 150, -50, 40, 120, 200, {});
    var press = I.group(g);
    I.box(g, 60, 150, -50, 40, 60, 112, { z: "iso-top", x: "iso-x", y: "iso-glass", hatch: false });
    var shards = I.group(g);
    // the crate belt at the bottom
    I.box(g, -40, 160, -40, 40, 20, 28, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    var belt = I.group(g);
    // the bottle (drawn last so it sits in front)
    var bot = I.group(g);
    // the outer +x panel (hatched) and the cut edges
    I.face(g, [[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, Z1], [X1, Y0, Z1]], "iso-x");
    I.face(g, [[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, Z1], [X1, Y0, Z1]], "tz-pat-hatch");
    I.line(g, [[X0, Y1, Z1], [X0, Y1, 0], [X1, Y1, 0], [X1, Y1, Z1]], "iso-cut-edge");
    I.face(g, [[X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]], "iso-top", { style: "opacity:.25" });
    // state: {pos (x of the bottle front), route "press"|"crate"|"back", kind "pet"|"glass", crushed, scan, ir, weigh, label}
    function update(t, s) {
      [rollers, beams, flap, press, shards, belt, bot].forEach(clear);
      for (var r = 0; r < 6; r++) { var rx = -160 + r * 26; I.pipe(rollers, [[rx, -24, 112], [rx, 24, 112]], "iso-pipe-shaft"); I.line(rollers, [[rx, -24, 112 + 4 * Math.cos(t * 12 + r)], [rx, 24, 112 + 4 * Math.cos(t * 12 + r)]], "iso-shaft-spin"); }
      if (s.scan) cams.forEach(function (c, k) { if (Math.sin(t * 26 + k * 1.7) > 0) { var e = I.face(beams, [c, [s.x - 20, 0, 150], [s.x + 20, 0, 150]], s.ir ? "iso-ir" : "iso-beam"); } });
      var fa = s.route === "crate" ? -0.6 : s.route === "press" ? 0.6 : 0;
      I.line(flap, [[20, 0, 120], [20 + 40 * Math.cos(fa), 0, 120 + 40 * Math.sin(fa)]], "iso-flap");
      [[90, -10], [120, 10]].forEach(function (p, k) { I.disc(press, p[0], 40.5, 170 + (k ? -6 : 6), 18, "y", "iso-steel"); for (var j = 0; j < 6; j++) { var a = (k ? -1 : 1) * t * 6 + j * Math.PI / 3; I.line(press, [[p[0], 41, 170 + (k ? -6 : 6)], [p[0] + Math.cos(a) * 18, 41, 170 + (k ? -6 : 6) + Math.sin(a) * 18]], "iso-stem"); } });
      if (s.shards) for (var q = 0; q < 10; q++) { var sx = 70 + (q * 37) % 70, sz = 70 + ((t * 40 + q * 13) % 36); I.box(shards, sx, sx + 6, -20 + (q * 11) % 40, -14 + (q * 11) % 40, sz, sz + 3, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false }); }
      var cx = ((t * 40) % 220) - 40; if (s.crate) Crate(I, belt, Math.min(cx, 120), 0, 28, { n: s.crate });
      // the bottle
      if (s.x == null) return;
      var bx = s.x, bz = 150, by = 0;
      if (s.route === "press" && bx > 30) { bz = 150 + Math.min(1, (bx - 30) / 40) * 20; }
      if (s.route === "crate" && bx > 30) { bz = 150 - Math.min(1, (bx - 30) / 40) * 90; }
      if (s.gone) return;
      var len = 110, r0 = 22, cls = s.kind === "glass" ? "iso-brown" : "iso-glass", cap = s.kind === "glass" ? "iso-brown-top" : "iso-glass";
      if (s.crushed) { I.box(bot, bx - len, bx, by - r0, by + r0, bz - 6, bz + 6, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false }); return; }
      lying(I, bot, bx - len, bx - 30, by, bz, r0, cls, cap);
      if (s.label !== false) lying(I, bot, bx - len + 26, bx - 60, by, bz, r0 + 0.6, "iso-hot", "iso-hot");
      lying(I, bot, bx - 30, bx - 12, by, bz, 10, cls, cap);
      lying(I, bot, bx - 12, bx, by, bz, 11, s.kind === "glass" ? "iso-fuel" : "iso-water-side", s.kind === "glass" ? "iso-fuel-top" : "iso-water");
      if (s.label !== false && s.code) { var q2 = I.P(bx - 70, by + r0, bz + 4); I.el("rect", { x: (q2[0] - 9).toFixed(1), y: (q2[1] - 7).toFixed(1), width: 18, height: 10, "class": "iso-code" }, bot); }
    }
    return { iso: I, update: update, CR: CR };
  };

  // ───────────────────────────── the bottling line: wash → fill → cap ─────────────────────────────
  window.LineModel = function (root, opts) {
    var I = TebEzay.iso(root, opts), g = I.group(root);
    I.face(g, [[-200, -80, 0], [200, -80, 0], [200, 80, 0], [-200, 80, 0]], "iso-floor");
    I.box(g, -190, 190, -12, 12, 30, 38, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
    var bot = I.group(g);
    I.box(g, -150, -60, -40, 40, 38, 140, { z: "iso-glass", x: "iso-glass", y: "iso-glass", hatch: false });
    var bub = I.group(g);
    I.box(g, 40, 90, -30, 30, 130, 170, {}); I.cyl(g, 65, 0, 5, 100, 130, "iso-steel", "iso-top");
    function update(t) {
      clear(bot); clear(bub);
      for (var i = 0; i < 7; i++) { var x = ((i * 60 + t * 40) % 420) - 200; GlassBottle(I, bot, x, 0, 38, { s: 0.6 }); if (x > 65) I.cyl(bot, x, 0, 8, 40, 60, "iso-fuel", "iso-fuel-top"); }
      for (var b = 0; b < 10; b++) { var z = 40 + ((t * 40 + b * 23) % 100); I.disc(bub, -140 + (b * 37) % 80, -20 + (b * 13) % 40, z, 3, "y", "iso-top"); }
    }
    return { iso: I, update: update };
  };
  // ───────────────────────────── the machine front (after the T-710 photo) ─────────────────────────────
  window.FrontModel = function (I, g, x, y, o) {
    o = o || {};
    I.box(g, x - 50, x + 50, y - 40, y + 40, 0, 120, { z: "iso-top", x: "iso-x", y: "iso-steel" });
    I.box(g, x - 50, x + 50, y - 40, y + 40, 120, 230, { z: "iso-top", x: "iso-x", y: "iso-steel" });
    I.face(g, [[x - 46, y + 40.5, 200], [x + 46, y + 40.5, 200], [x + 46, y + 40.5, 226], [x - 46, y + 40.5, 226]], "iso-ink");
    I.disc(g, x - 20, y + 40.5, 165, 16, "y", "iso-ink"); I.disc(g, x - 20, y + 41, 165, 11, "y", "iso-glow");
    I.face(g, [[x + 14, y + 40.5, 152], [x + 40, y + 40.5, 152], [x + 40, y + 40.5, 176], [x + 14, y + 40.5, 176]], "iso-screen");
    I.disc(g, x + 20, y + 40.5, 140, 3, "y", "iso-led");
    I.face(g, [[x - 36, y + 40.5, 20], [x + 36, y + 40.5, 20], [x + 36, y + 40.5, 90], [x - 36, y + 40.5, 90]], "iso-ink");
    I.face(g, [[x - 30, y + 40.5, 100], [x + 30, y + 40.5, 100], [x + 30, y + 40.5, 108], [x - 30, y + 40.5, 108]], "iso-led");
  };
})();
