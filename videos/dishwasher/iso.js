/* Isometric 3D model of the dishwasher, built before the engine reads the page.
   Units are millimetre-ish; x → right-down, y → left-down, z → up. The front and right
   walls are cut away so the inside reads like the reference: a true cutaway in depth. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var K = 0.6, OX = 180, OY = 292;                      // scale + screen origin of (0,0,0)
  function P(x, y, z) { return [OX + (x - y) * 0.866 * K, OY + (x + y) * 0.5 * K - z * K]; }
  function pts(list) { return list.map(function (p) { var s = P(p[0], p[1], p[2]); return s[0].toFixed(1) + " " + s[1].toFixed(1); }); }
  function d(list, close) { var a = pts(list); return "M" + a.join(" L") + (close === false ? "" : " Z"); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function face(g, list, cls, extra) { var a = { d: d(list), "class": cls }; for (var k in extra || {}) a[k] = extra[k]; return el("path", a, g); }
  function line(g, list, cls, style) { return el("path", { d: d(list, false), "class": cls, style: style || "" }, g); }

  // a solid box: top, +x face, +y face (the three an isometric viewer sees)
  function box(g, x0, x1, y0, y1, z0, z1, c) {
    c = c || {};
    face(g, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c.y || "f-left");
    face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], c.x || "f-right");
    if (c.hatch !== false) face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], "tz-pat-hatch");
    face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c.z || "f-top");
  }
  function ring(cx, cy, cz, r, n, plane, a0, a1) {   // points on a circle in a plane: "z" (horizontal), "x" or "y" (vertical)
    var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
    for (var i = 0; i <= n; i++) {
      var a = a0 + (a1 - a0) * i / n, c = Math.cos(a) * r, s = Math.sin(a) * r;
      out.push(plane === "z" ? [cx + c, cy + s, cz] : plane === "x" ? [cx, cy + c, cz + s] : [cx + c, cy, cz + s]);
    }
    return out;
  }
  function cylV(g, cx, cy, r, z0, z1, side, top) {   // vertical cylinder
    var front = ring(cx, cy, z1, r, 18, "z", -Math.PI / 4, Math.PI * 3 / 4);
    var back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; });
    face(g, front.concat(back), side || "f-left");
    face(g, ring(cx, cy, z1, r, 28, "z"), top || "f-top");
  }
  function tube(g, list, inner) {
    line(g, list, "pipe-o"); line(g, list, inner || "pipe-i");
  }

  var W = 300, D = 260, H = 330, T = 12, B = -86;        // tub size, wall thickness, bottom of the base
  var root = document.getElementById("iso");
  var stat = el("g", {}, root);

  // ── back walls of the base + the tub (inner faces) ─────────────
  face(stat, [[-W / 2, -D / 2, B], [-W / 2, D / 2, B], [-W / 2, D / 2, H], [-W / 2, -D / 2, H]], "f-wall");
  face(stat, [[-W / 2, -D / 2, B], [W / 2, -D / 2, B], [W / 2, -D / 2, H], [-W / 2, -D / 2, H]], "f-wall2");
  face(stat, [[-W / 2, -D / 2, B], [W / 2, -D / 2, B], [W / 2, -D / 2, H], [-W / 2, -D / 2, H]], "tz-pat-hatch", { style: "opacity:.25" });
  face(stat, [[-W / 2, -D / 2, B], [W / 2, -D / 2, B], [W / 2, D / 2, B], [-W / 2, D / 2, B]], "f-top-dark");
  // pipe up the back wall to the top arm
  tube(stat, [[96, -D / 2 + 14, -40], [96, -D / 2 + 14, 222], [0, -D / 2 + 14, 222], [0, 0, 222]]);

  // ── tub floor: a slab with its cut edges, the base shows under it ─
  box(stat, -W / 2, W / 2, -D / 2, D / 2, -T, 0, { z: "f-floor", x: "f-right", y: "f-left" });
  // sump opening, with water and the filter
  face(stat, ring(0, 0, 0.5, 44, 32, "z"), "f-steel");
  var wat = el("g", { id: "sumpwater" }, stat);
  face(wat, ring(0, 0, 1, 40, 32, "z"), "f-water");
  line(stat, ring(0, 0, 2, 30, 32, "z"), "mesh");

  // ── the base, seen only through the cut under the floor's front edge ─
  var cp = el("clipPath", { id: "basecut" }, root);
  var e1 = P(-W / 2 - 60, D / 2, -T), e2 = P(-W / 2, D / 2, -T), e3 = P(W / 2, D / 2, -T), e4 = P(W / 2, -D / 2, -T), e5 = P(W / 2 + 60, -D / 2, -T);
  el("path", { d: "M" + [e1, e2, e3, e4, e5].map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + " L420 600 L-60 600 Z" }, cp);
  var base = el("g", { "clip-path": "url(#basecut)" }, stat);
  var stat0 = stat; stat = base;
  // sump hanging below the floor
  cylV(stat, 0, 0, 44, -60, -T, "f-steel", "f-steel");
  // main pump (front right) and its pipes
  tube(stat, [[0, 0, -54], [70, 60, -54], [96, 96, -54]]);
  tube(stat, [[120, 96, -40], [120, -D / 2 + 14, -40], [96, -D / 2 + 14, -40]]);
  box(stat, 84, 136, 80, 124, B + 4, -36, { z: "f-part-top", x: "f-part-r", y: "f-part" });
  cylV(stat, 110, 102, 15, -36, -26, "f-part", "f-part-top");
  // drain pump (front left) and the outlet
  tube(stat, [[-10, 20, -54], [-34, 98, -60]]);
  tube(stat, [[-52, 110, -66], [-W / 2 - 40, 110, -66]], "pipe-dirty");
  box(stat, -60, -22, 92, 128, B + 4, -50, { z: "f-part-top", x: "f-part-r", y: "f-part" });
  // inlet valve (front, far left) and the pipe into the tub
  tube(stat, [[-W / 2 - 40, 118, -40], [-126, 118, -40]]);
  box(stat, -140, -112, 104, 130, B + 8, -30, { z: "f-top", x: "f-right", y: "f-left" });
  tube(stat, [[-126, 118, -30], [-126, 118, 0], [-126, 112, 14]]);

  stat = stat0;
  // ── on the floor: heater coil and float switch ─────────────────
  var heat = [[-110, -82, 5], [110, -82, 5], [110, 82, 5], [-90, 82, 5]];
  el("g", { id: "heaterglow" }, stat).appendChild(el("path", { d: d(heat, false), "class": "heater-glow" }));
  line(stat, heat, "heater");
  box(stat, -122, -100, 58, 80, 0, 18, {});
  var fl = el("g", { id: "floatbob" }, stat); cylV(fl, -111, 69, 7, 18, 26, "f-water-side", "f-water");

  // lower spray arm sits here in depth order (filled every frame)
  var dynLow = el("g", { id: "isodynlow" }, stat);

  // ── racks and dishes ───────────────────────────────────────────
  function rack(z) {
    var g = el("g", {}, stat), x0 = -W / 2 + 14, x1 = W / 2 - 14, y0 = -D / 2 + 14, y1 = D / 2 - 14;
    line(g, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], "wire-h");
    for (var x = x0 + 30; x < x1; x += 30) line(g, [[x, y0, z], [x, y1, z]], "wire");
    for (var y = y0 + 30; y < y1; y += 30) line(g, [[x0, y, z], [x1, y, z]], "wire");
    line(g, [[x0, y1, z], [x0, y1, z + 26]], "wire"); line(g, [[x1, y1, z], [x1, y1, z + 26]], "wire"); line(g, [[x1, y0, z], [x1, y0, z + 26]], "wire");
  }
  rack(100);
  [-72, 66].forEach(function (yc) {
    for (var k = 0; k < 6; k++) {
      var xc = -66 + k * 24;
      face(stat, ring(xc, yc, 146, 42, 30, "x"), "f-plate");
      line(stat, ring(xc, yc, 146, 26, 30, "x"), "plate-rim");
    }
  });
  var dynHigh = el("g", { id: "isodynhigh" }, stat);
  rack(238);
  [[-80, -50], [-20, -50], [40, -50], [-80, 30], [-20, 30], [40, 30], [100, -10]].forEach(function (c) {
    cylV(stat, c[0], c[1], 18, 238, 278, "f-cup", "f-cup-top");
  });
  // detergent box on the left wall
  box(stat, -W / 2, -W / 2 + 14, 40, 96, 150, 196, {});
  el("g", { id: "tablet" }, stat).appendChild(el("path", { d: d([[-W / 2 + 14, 52, 160], [-W / 2 + 14, 84, 160], [-W / 2 + 14, 84, 184], [-W / 2 + 14, 52, 184]]), "class": "f-tablet" }));

  // ── moving parts (redrawn every frame) ─────────────────────────
  function arm(g, z, L, w, th, ang, jets, t) {
    var cu = Math.cos(ang), su = Math.sin(ang), pv = [-su, cu], u = [cu, su];
    function c(a, b) { return [u[0] * a + pv[0] * b, u[1] * a + pv[1] * b]; }
    var C = [c(-L, -w), c(L, -w), c(L, w), c(-L, w)];
    var bot = C.map(function (p) { return [p[0], p[1], z]; }), top = C.map(function (p) { return [p[0], p[1], z + th]; });
    // side faces whose outward normal looks toward the viewer (+x or +y)
    for (var i = 0; i < 4; i++) {
      var a = C[i], b = C[(i + 1) % 4], nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx + ny > 0) face(g, [bot[i], bot[(i + 1) % 4], top[(i + 1) % 4], top[i]], nx > ny ? "f-part-r" : "f-part");
    }
    face(g, top, "f-part-top");
    for (var k = -3; k <= 3; k++) {
      if (!k) continue;
      var h = c(k * L / 3.6, 0); face(g, ring(h[0], h[1], z + th + 0.5, 3.2, 10, "z"), "f-ink");
      if (jets) {
        var side = k > 0 ? 1 : -1, tip = c(k * L / 3.6 - side * 20, side * 18);
        var e = el("path", { d: d([[h[0], h[1], z + th], [tip[0], tip[1], z + th + 64]], false), "class": "jet" }, g);
        e.style.strokeDashoffset = (-t * 120).toFixed(1);
      }
    }
    cylV(g, 0, 0, 12, z - 6, z + th + 2, "f-steel", "f-top");
  }
  window.__iso = function (t) {
    [dynLow, dynHigh].forEach(function (g) { while (g.firstChild) g.removeChild(g.firstChild); });
    var on = t >= window.__isoJetsFrom && t < window.__isoJetsTo;
    arm(dynLow, 34, 118, 11, 9, t * 2.6, on, t);
    arm(dynHigh, 222, 86, 9, 8, -t * 3.1, on, t);
  };

  // ── 3D paths for particles, halos and camera shots ─────────────
  window.ISO = {
    P: P, d: d, W: W, D: D, H: H,
    paths: {
      inlet: d([[-W / 2 - 40, 118, -40], [-126, 118, -40], [-126, 118, 0], [-126, 112, 14], [-100, 90, 3], [-40, 30, 2], [-12, 6, 0]], false),
      up: d([[0, 0, -54], [70, 60, -54], [110, 102, -30], [120, 96, -40], [120, -D / 2 + 14, -40], [96, -D / 2 + 14, -40], [96, -D / 2 + 14, 222], [0, -D / 2 + 14, 222], [0, 0, 222]], false),
      upLow: d([[0, 0, -54], [0, 0, 34]], false),
      drip1: d([[-42, -72, 102], [-42, -72, 2], [-20, -20, 0]], false),
      drip2: d([[30, 66, 102], [30, 66, 2], [12, 16, 0]], false),
      drip3: d([[54, -72, 102], [54, -72, 2], [26, -14, 0]], false),
      dirtIn1: d([[-90, 40, 2], [-30, 10, 1], [-20, 4, 0]], false),
      dirtIn2: d([[90, -30, 2], [30, -10, 1], [22, -4, 0]], false),
      drainOut: d([[-10, 20, -54], [-34, 98, -60], [-52, 110, -66], [-W / 2 - 40, 110, -66]], false),
      steam1: d([[0, -72, 180], [0, -90, 230], [0, -D / 2 + 4, 250]], false),
      steam2: d([[40, 66, 180], [40, -20, 240], [40, -D / 2 + 4, 270]], false),
      wall1: d([[-60, -D / 2 + 2, 300], [-60, -D / 2 + 2, 6]], false),
      wall2: d([[60, -D / 2 + 2, 280], [60, -D / 2 + 2, 6]], false)
    }
  };
})();
