/* «إزاي المكنسة الذكية بتشتغل؟» — an isometric apartment cut-away, redrawn every frame.
   The robot drives one continuous route through the flat (it carries the story), its cleaned path is painted on
   the floor, and the lidar hits pile up into a map. The view turns slowly about the vertical axis and the camera
   follows the robot, so the frame never sits still.
   x: left wall (−260) → right (+260), y: back wall (−200) → front (+200), z: up. Stairs go down at the front-right. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, t) { return easeIO((t - a) / (b - a)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }

  // ── a rotatable isometric projection with the Iso3D drawing helpers (same as the AC episode) ──
  function makeIso(theta, K, OX, OY) {
    var c = Math.cos(theta), s = Math.sin(theta);
    function P(x, y, z) { var xr = x * c - y * s, yr = x * s + y * c; return [OX + (xr - yr) * 0.866 * K, OY + (xr + yr) * 0.5 * K - z * K]; }
    function depth(x, y) { return (x * c - y * s) + (x * s + y * c); }
    function d(list, close) { return "M" + list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + (close === false ? "" : " Z"); }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function face(g, list, cls, st) { var a = { d: d(list), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function line(g, list, cls, st) { var a = { d: d(list, false), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    // a box shows its two camera-facing sides, whichever way the view has turned
    function box(g, x0, x1, y0, y1, z0, z1, k) {
      k = k || {};
      var fy = (c - s) > 0 ? y1 : y0, fx = (c + s) > 0 ? x1 : x0;
      face(g, [[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], k.y || "iso-y");
      face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], k.x || "iso-x");
      if (k.hatch) face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], "tz-pat-hatch", "opacity:.5");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top");
    }
    function ring(cx, cy, cz, r, n, plane, a0, a1) {
      var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
      for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); }
      return out;
    }
    function disc(g, cx, cy, cz, r, plane, cls, st) { return face(g, ring(cx, cy, cz, r, 30, plane), cls, st); }
    var A0 = -Math.PI / 4 - theta;                      // the camera-facing half of any vertical cylinder starts here
    function cyl(g, cx, cy, r, z0, z1, side, top) {
      var front = ring(cx, cy, z1, r, 18, "z", A0, A0 + Math.PI);
      var back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; });
      face(g, front.concat(back), side || "iso-steel"); return face(g, ring(cx, cy, z1, r, 28, "z"), top || "iso-top");
    }
    // a band on a cylinder's side between angles a0..a1, clipped to the half the camera can see
    function band(g, cx, cy, r, z0, z1, a0, a1, cls) {
      var lo = Math.max(a0, A0), hi = Math.min(a1, A0 + Math.PI);
      for (var sh = -2; sh <= 2; sh++) { var l2 = Math.max(a0 + sh * 2 * Math.PI, A0), h2 = Math.min(a1 + sh * 2 * Math.PI, A0 + Math.PI); if (h2 - l2 > hi - lo) { lo = l2; hi = h2; } }
      if (hi <= lo) return;
      var top = ring(cx, cy, z1, r, 14, "z", lo, hi), bot = top.slice().reverse().map(function (p) { return [p[0], p[1], z0]; });
      face(g, top.concat(bot), cls);
    }
    return { P: P, depth: depth, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, cyl: cyl, band: band, K: K, th: theta };
  }

  // ── the flat ────────────────────────────────────────────────
  var SOFA = [-205, -45, -198, -128], TV = [-258, -222, -130, -40], CHAIR = [188, 250, -196, -128], DOCK = [-260, -238, 24, 56];
  var RUG = [20, 170, -50, 50], TOY = [-100, 80], STAIR_X = 190, STAIR_Y = 110;
  var D = [-214, 40];                                   // robot centre when docked
  // what the lidar can see (2D segments at turret height); the toy and the stairs are below it
  var SEGS = [];
  function rect(r) { SEGS.push([r[0], r[2], r[1], r[2]], [r[1], r[2], r[1], r[3]], [r[1], r[3], r[0], r[3]], [r[0], r[3], r[0], r[2]]); }
  SEGS.push([-260, -200, 260, -200], [-260, -200, -260, 200], [260, -200, 260, STAIR_Y], [-260, 200, STAIR_X, 200]);
  rect(SOFA); rect(TV); rect(CHAIR); rect(DOCK); rect([206, 234, -186, -158]);
  function cast(x, y, a, maxR) {
    var dx = Math.cos(a), dy = Math.sin(a), best = maxR;
    SEGS.forEach(function (s) {
      var ex = s[2] - s[0], ey = s[3] - s[1], den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) return;
      var u = ((s[0] - x) * ey - (s[1] - y) * ex) / den, v = ((s[0] - x) * dy - (s[1] - y) * dx) / den;
      if (u > 0 && u < best && v >= 0 && v <= 1) best = u;
    });
    return best;
  }

  // ── the robot's route: [time, x, y, reverse?] — linear legs with eased ends ──
  function K_(i, o, x, y, rev) { return [L(i) + o, x, y, rev]; }
  var HOOK = [[0, -60, 150], [3.0, 60, 152], K_(1, 1.5, 166, 155), K_(1, 1.9, 166, 155), K_(1, 2.5, 128, 155, 1), K_(1, 3.3, 200, 80), K_(2, 0.2, 200, -80),
              K_(2, 1.4, -10, -80), K_(2, 2.6, -180, 40), K_(2, 3.4, D[0], D[1]), [L(4) - 0.01, D[0], D[1]]];
  var MAIN = [K_(4, 0, D[0], D[1]), K_(4, 1.0, -165, 40, 1), K_(5, 0.6, -70, 120), K_(7, 0, 60, 150), K_(8, 0, 110, 110), K_(9, 0, -20, 150),
              K_(10, 0, -180, 140), K_(10, 1.2, -182, 80), K_(11, 0.4, -138, 80), K_(11, 0.75, -138, 80), K_(12, 0, -168, 80, 1), K_(12, 1.1, -150, 135),
              K_(12, 2.3, -80, 140), K_(13, 0, -40, 105), K_(14, 0, 40, 155), K_(15, 0.8, 166, 155), K_(15, 1.4, 166, 155), K_(15, 2.4, 118, 155, 1),
              K_(16, 0, 0, 100), K_(16, 1.0, -12, -60), K_(16, 2.2, -110, -150), K_(18, 0.2, -110, -150), K_(18, 1.4, -60, -70, 1), K_(19, 0.9, -12, 0),
              K_(22, 0, -12, 0), K_(22, 1.0, -12, -80), K_(22, 3.6, 200, -80), K_(23, 1.6, 200, 80), K_(24, 0.4, 100, 80), K_(25, 2.4, -20, 140),
              K_(26, 0.1, -28, 141), K_(26, 1.8, -70, 145), K_(27, 0.6, -170, 140), K_(27, 1.6, -180, 40), K_(27, 2.6, D[0], D[1]),
              K_(28, 1.2, D[0], D[1]), K_(28, 1.9, -165, 40, 1), K_(28, 2.7, -170, 140), K_(29, 0.4, -20, 140), K_(30, 0, 80, 150), [200, 80, 150]];
  function route(t) { return t < L(4) ? HOOK : MAIN; }
  function legAt(R, t) { var i = 0; while (i < R.length - 2 && R[i + 1][0] <= t) i++; return i; }
  function pos(t) {
    var R = route(t), i = legAt(R, t), a = R[i], b = R[i + 1];
    var k = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0])) : 1;
    // gentle speed-up / slow-down on every leg (robots don't teleport into full speed)
    k = k < 0.15 ? k * k / 0.3 : k > 0.85 ? 1 - (1 - k) * (1 - k) / 0.3 : (k - 0.075) / 0.85;
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), i, !!b[3]];
  }
  // heading: integrated once at load so it is deterministic and turns smoothly
  var HD = [], DT = 0.02;
  (function () {
    var h = Math.PI, end = 200;
    for (var i = 0; i * DT < end; i++) {
      var t = i * DT, p = pos(t), q = pos(t + 0.08), vx = q[0] - p[0], vy = q[1] - p[1];
      if (Math.hypot(vx, vy) > 0.4) {
        var want = Math.atan2(vy, vx) + (p[3] ? Math.PI : 0), dd = Math.atan2(Math.sin(want - h), Math.cos(want - h));
        h += dd * Math.min(1, DT * 9);
      }
      HD.push(h);
    }
  })();
  function heading(t) { var i = Math.max(0, Math.min(HD.length - 1, Math.round(t / DT))); return HD[i]; }
  function robot(t) {
    var p = pos(t), h = heading(t), x = p[0], y = p[1];
    // stuck under the sofa: wheels spin, the body only rocks and twists
    var stuck = win(t, L(16) + 2.2, L(18) + 0.2, 0.2);
    if (stuck) { x += Math.sin(t * 31) * 1.6 * stuck; h += (0.35 * Math.sin((t - L(16)) * 2.2)) * stuck; }
    // low battery: it stops and turns in place, looking for the dock's signal
    var look = clamp((t - L(25) - 2.4) / (L(26) + 1.0 - L(25) - 2.4)); if (look > 0 && look < 1) h += 2 * Math.PI * easeIO(look);   // one full turn, scanning
    return { x: x, y: y, h: h, stuck: stuck };
  }
  function bumpAmt(t) { var a = L(11) + 0.4; return t > a - 0.05 && t < a + 0.5 ? Math.exp(-Math.max(0, t - a) * 9) : 0; }
  function battery(t) {           // 0..100
    if (t < L(2) + 0.2) return lerp(46, 24, clamp(t / (L(2) + 0.2)));
    if (t < L(4)) return 20;
    if (t < L(25)) return lerp(64, 22, clamp((t - L(4)) / (L(25) - L(4))));
    if (t < L(28) + 0.3) return lerp(22, 20, clamp((t - L(25)) / 2));
    return lerp(20, 100, smooth(L(28) + 0.3, L(28) + 1.4, t));
  }
  // where the robot left off before charging (the X it comes back to)
  var RESUME = [-20, 140];

  // lidar map: hits gathered while the robot drives (computed once, revealed by time)
  var MAP = [];
  (function () {
    function gather(t0, t1, step, n) { for (var t = t0; t < t1; t += step) { var r = robot(t); for (var k = 0; k < n; k++) { var a = t * 7.3 + k * Math.PI * 2 / n, d = cast(r.x, r.y, a, 330); if (d < 330) MAP.push([r.x + Math.cos(a) * d, r.y + Math.sin(a) * d, t]); } } }
    gather(0.3, 3.0, 0.12, 9);                                    // the hook's quick map flash
    gather(L(5), L(8), 0.16, 9);                                  // the real map, while we explain the lidar
  })();
  function mapAmt(t) { return Math.max(0.85 * win(t, 0.9, 2.9, 0.3), win(t, L(7), L(8) + 0.3, 0.4), 0.7 * win(t, L(23), L(24) + 0.2, 0.4), 0.55 * win(t, L(27) - 0.2, L(27) + 2.6, 0.4)); }
  function rugMarked(t) { return t > L(23) + 0.4; }

  // ── drawing ────────────────────────────────────────────────
  function drawRobot(g, I, r, t, o) {
    var x = r.x, y = r.y, h = r.h, ca = Math.cos(h), sa = Math.sin(h), bump = bumpAmt(t);
    I.disc(g, x, y, 0.4, 29, "z", "rb-shadow");
    // side brush (front-left), spinning under the body edge
    var bx = x + Math.cos(h + 0.75) * 22, by = y + Math.sin(h + 0.75) * 22, sp = t * 14;
    for (var k = 0; k < 3; k++) { var a = sp + k * 2.094; I.line(g, [[bx, by, 1.5], [bx + Math.cos(a) * 13, by + Math.sin(a) * 13, 1]], "rb-brush"); }
    // body + bumper (pushed back a little when it hits)
    I.cyl(g, x, y, 26, 3, 15, "rb-body", "rb-top");
    var bxo = -ca * 2.2 * bump, byo = -sa * 2.2 * bump;
    I.band(g, x + bxo, y + byo, 26.6, 4, 13, h - 1.45, h + 1.45, bump > 0.1 ? "rb-bumper-hit" : "rb-bumper");
    I.disc(g, x, y, 15.2, 20, "z", "rb-ring");
    // lidar turret: a spinning red dot shows the laser direction
    I.cyl(g, x - ca * 6, y - sa * 6, 8.5, 15, 22, "rb-turret", "rb-turret-top");
    var la = o.la, lp = I.P(x - ca * 6 + Math.cos(la) * 8.5, y - sa * 6 + Math.sin(la) * 8.5, 18.5);
    I.el("circle", { cx: lp[0].toFixed(1), cy: lp[1].toFixed(1), r: (1.8 * I.K / 0.55).toFixed(2), "class": "rb-laser-dot" }, g);
    var led = I.P(x + ca * 17, y + sa * 17, 15.3), low = battery(t) < 25;
    I.el("circle", { cx: led[0].toFixed(1), cy: led[1].toFixed(1), r: (1.7 * I.K / 0.55).toFixed(2), "class": low && Math.sin(t * 9) > 0 ? "rb-led-low" : "rb-led" }, g);
  }

  function drawWorld(g, I, t, o) {
    o = o || {};
    var r = robot(t), m = mapAmt(t), fade = 1 - 0.72 * m, la = t * 7.3;
    // stairs going down (drawn first: they sit below the floor)
    for (var k = 0; k < 5; k++) { var x0 = STAIR_X + k * 14, x1 = k === 4 ? 262 : STAIR_X + (k + 1) * 14; I.box(g, x0, x1, STAIR_Y, 200, -110, -18 * (k + 1), { z: "rb-step", x: "iso-x", y: "rb-step-y" }); }
    // floor slab (two pieces around the stair hole), tiles
    I.box(g, -260, STAIR_X, -200, 200, -14, 0, { z: "rb-floor", y: "iso-cut", x: "iso-cut", hatch: true });
    I.box(g, STAIR_X, 260, -200, STAIR_Y, -14, 0, { z: "rb-floor", y: "iso-cut", x: "iso-cut", hatch: true });
    var tiles = []; for (var tx = -220; tx < 260; tx += 40) tiles.push([[tx, -200, 0.3], [tx, tx >= STAIR_X ? STAIR_Y : 200, 0.3]]);
    for (var ty = -160; ty < 200; ty += 40) tiles.push([[-260, ty, 0.3], [ty >= STAIR_Y ? STAIR_X : 260, ty, 0.3]]);
    tiles.forEach(function (l) { I.line(g, l, "rb-grout"); });
    // walls: back and left full height, right and front cut low (a model you look into)
    I.face(g, [[-260, -200, 0], [260, -200, 0], [260, -200, 150], [-260, -200, 150]], "iso-wall2"); I.face(g, [[-260, -200, 0], [260, -200, 0], [260, -200, 150], [-260, -200, 150]], "tz-pat-hatch", "opacity:.25");
    I.face(g, [[-260, -200, 0], [-260, 200, 0], [-260, 200, 150], [-260, -200, 150]], "iso-wall"); I.face(g, [[-260, -200, 0], [-260, 200, 0], [-260, 200, 150], [-260, -200, 150]], "tz-pat-hatch", "opacity:.25");
    I.face(g, [[-150, -199, 60], [-60, -199, 60], [-60, -199, 130], [-150, -199, 130]], "iso-top"); I.face(g, [[-144, -198, 66], [-66, -198, 66], [-66, -198, 124], [-144, -198, 124]], "iso-sky");
    I.line(g, [[-105, -197, 66], [-105, -197, 124]], "iso-frame");
    // rug with fringe on its two short ends
    I.face(g, [[RUG[0], RUG[2], 1.2], [RUG[1], RUG[2], 1.2], [RUG[1], RUG[3], 1.2], [RUG[0], RUG[3], 1.2]], "rb-rug");
    I.face(g, [[RUG[0] + 12, RUG[2] + 12, 1.4], [RUG[1] - 12, RUG[2] + 12, 1.4], [RUG[1] - 12, RUG[3] - 12, 1.4], [RUG[0] + 12, RUG[3] - 12, 1.4]], "rb-rug-in");
    for (var fy = RUG[2] + 3; fy < RUG[3]; fy += 5) { var wv = Math.sin(fy * 0.7 + t * 1.3) * 1.5; I.line(g, [[RUG[0], fy, 1.2], [RUG[0] - 9, fy + wv, 0.6]], "rb-fringe"); I.line(g, [[RUG[1], fy, 1.2], [RUG[1] + 9, fy - wv, 0.6]], "rb-fringe"); }
    // the cleaned path, painted on the floor behind the robot
    var t0 = t < L(4) ? 0 : L(4), pts = [];
    for (var tt = t0; tt <= t; tt += 0.2) { var q = robot(tt); pts.push([q.x, q.y, 0.8]); }
    pts.push([r.x, r.y, 0.8]);
    if (pts.length > 1) I.line(g, pts, "rb-trail", "vector-effect:none;stroke-width:" + (40 * I.K).toFixed(1) + "px;opacity:" + (0.32 * fade + 0.12).toFixed(2));
    // dust specks the robot hasn't reached yet
    for (var dk = 0; dk < 40; dk++) {
      var dx = -230 + ((dk * 97) % 460), dy = -170 + ((dk * 61) % 340); if (dx > RUG[0] - 6 && dx < RUG[1] + 6 && dy > RUG[2] - 6 && dy < RUG[3] + 6) continue; if (dx > STAIR_X && dy > STAIR_Y) continue;
      var near = false; for (var pi = 0; pi < pts.length; pi += 2) if (Math.abs(pts[pi][0] - dx) < 22 && Math.abs(pts[pi][1] - dy) < 22) { near = true; break; }
      if (!near) { var dp = I.P(dx, dy, 1); I.el("circle", { cx: dp[0].toFixed(1), cy: dp[1].toFixed(1), r: (1.3 * I.K / 0.55).toFixed(2), "class": "rb-dust" }, g); }
    }

    // furniture + robot, painted back to front
    var items = [];
    function add(cx, cy, f) { items.push([I.depth(cx, cy), f]); }
    add(-240, -85, function () { I.box(g, TV[0], TV[1], TV[2], TV[3], 0, 48, { z: "rb-wood-top", x: "rb-wood-x", y: "rb-wood" }); I.box(g, -256, -250, -122, -48, 48, 118, { z: "iso-chip-top", x: "iso-chip", y: "iso-chip" }); });
    var under = r.x > SOFA[0] - 10 && r.x < SOFA[1] + 10 && r.y < SOFA[3] + 14;
    add(-125, -163, function () {
      [[SOFA[0] + 6, SOFA[2] + 6], [SOFA[1] - 10, SOFA[2] + 6], [SOFA[0] + 6, SOFA[3] - 10], [SOFA[1] - 10, SOFA[3] - 10]].forEach(function (l) { I.box(g, l[0], l[0] + 5, l[1], l[1] + 5, 0, 24, { z: "rb-wood-top", x: "rb-wood-x", y: "rb-wood" }); });
      I.box(g, SOFA[0], SOFA[1], SOFA[2], SOFA[3], 24, 50, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
      I.box(g, SOFA[0], SOFA[1], SOFA[2], SOFA[2] + 22, 50, 92, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
      I.box(g, SOFA[0], SOFA[0] + 16, SOFA[2], SOFA[3], 50, 70, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" }); I.box(g, SOFA[1] - 16, SOFA[1], SOFA[2], SOFA[3], 50, 70, { z: "iso-sofa-top", x: "iso-sofa-x", y: "iso-sofa" });
    });
    add(219, -162, function () { I.box(g, CHAIR[0], CHAIR[1], CHAIR[2], CHAIR[3], 0, 44, { z: "rb-chair-top", x: "rb-chair-x", y: "rb-chair" }); I.box(g, CHAIR[0], CHAIR[1], CHAIR[2], CHAIR[2] + 16, 44, 86, { z: "rb-chair-top", x: "rb-chair-x", y: "rb-chair" }); });
    add(DOCK[0] + 11, 40, function () {
      I.box(g, DOCK[0], DOCK[1], DOCK[2], DOCK[3], 0, 36, { z: "rb-dock-top", x: "rb-dock-x", y: "rb-dock" });
      I.face(g, [[DOCK[1] + 0.5, 32, 22], [DOCK[1] + 0.5, 48, 22], [DOCK[1] + 0.5, 48, 30], [DOCK[1] + 0.5, 32, 30]], "rb-ir-win");
      I.box(g, DOCK[1], DOCK[1] + 8, 30, 34, 0, 3, { z: "rb-contact", x: "rb-contact", y: "rb-contact" }); I.box(g, DOCK[1], DOCK[1] + 8, 46, 50, 0, 3, { z: "rb-contact", x: "rb-contact", y: "rb-contact" });
    });
    add(TOY[0], TOY[1], function () {
      var tw = t > L(11) + 0.4 ? Math.min(6, (t - L(11) - 0.4) * 30) : 0;     // the knock nudges it
      I.box(g, TOY[0] - 12 + tw, TOY[0] + 12 + tw, TOY[1] - 12, TOY[1] + 12, 0, 22, { z: "rb-toy-top", x: "rb-toy-x", y: "rb-toy" });
      I.box(g, TOY[0] - 6 + tw, TOY[0] + 6 + tw, TOY[1] - 6, TOY[1] + 6, 22, 28, { z: "rb-toy-top", x: "rb-toy-x", y: "rb-toy" });
    });
    add(220, -172, function () { I.cyl(g, 220, -172, 13, 0, 28, "iso-pot", "iso-soil"); I.disc(g, 220, -172, 48, 22, "z", "iso-leaf"); I.disc(g, 214, -168, 64, 15, "z", "iso-leaf"); });
    add(r.x, under ? -400 : r.y, function () { drawRobot(g, I, r, t, { la: la }); });
    items.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (it) { it[1](); });

    // ── sensors in action ──
    var ca = Math.cos(r.h), sa = Math.sin(r.h), tx0 = r.x - ca * 6, ty0 = r.y - sa * 6;
    var laser = Math.max(win(t, L(5), L(8), 0.3), 0.6 * win(t, 0.3, 3.0, 0.3));
    if (laser > 0) for (var lk = 0; lk < 3; lk++) {
      var a = la + lk * 2.094, d = cast(tx0, ty0, a, 330), hx = tx0 + Math.cos(a) * d, hy = ty0 + Math.sin(a) * d;
      I.line(g, [[tx0, ty0, 18.5], [hx, hy, 18.5]], "rb-laser", "opacity:" + (laser * (lk ? 0.45 : 0.95)).toFixed(2));
      if (d < 330) { var hp = I.P(hx, hy, 18.5); I.el("circle", { cx: hp[0].toFixed(1), cy: hp[1].toFixed(1), r: (3 * I.K / 0.55).toFixed(2), "class": "rb-hit", style: "opacity:" + laser.toFixed(2) }, g); }
    }
    // cliff sensor at the stair edge: the infrared beam goes down and doesn't come back
    var cliff = Math.max(win(t, L(14) + 0.6, L(16), 0.3), win(t, L(1) + 1.0, L(1) + 2.6, 0.2));
    if (cliff > 0) {
      var sx = r.x + ca * 21, sy = r.y + sa * 21, over = sx + 6 > STAIR_X && sy > STAIR_Y, bottom = over ? -72 : 0, u = (t * 2.2) % 1;
      I.line(g, [[sx, sy, 3], [sx + 6, sy, bottom]], "rb-ir", "opacity:" + cliff.toFixed(2));
      if (!over) I.line(g, [[sx + 6, sy, 0], [sx + 1, sy, 3]], "rb-ir-back", "opacity:" + cliff.toFixed(2));
      var pp = I.P(sx + 6 * u, sy, lerp(3, bottom, u)); I.el("circle", { cx: pp[0].toFixed(1), cy: pp[1].toFixed(1), r: (2.4 * I.K / 0.55).toFixed(2), "class": "rb-ir-dot", style: "opacity:" + cliff.toFixed(2) }, g);
    }
    // sonar under the front: rings spread on the floor; on the rug they come back faint
    var son = win(t, L(19) + 0.9, L(22) + 0.2, 0.3);
    if (son > 0) for (var sk = 0; sk < 3; sk++) {
      var su = ((t * 1.1) + sk / 3) % 1, sxx = r.x + ca * 18, syy = r.y + sa * 18, onRug = sxx + su * 30 > RUG[0];
      I.face(g, I.ring(sxx, syy, 1.6, 4 + su * 34, 24, "z"), "rb-sonar", "opacity:" + (son * (1 - su) * (onRug && su > 0.5 ? 0.3 : 0.9)).toFixed(2));
    }
    // dock beacon: infrared arcs fanning out from the dock
    var ir = Math.max(win(t, L(26), L(27) + 2.4, 0.3), 0.8 * win(t, L(2) + 0.8, L(2) + 3.2, 0.3));
    if (ir > 0) for (var ik = 0; ik < 4; ik++) {
      var iu = ((t * 0.8) + ik / 4) % 1, rr = 20 + iu * 170;
      I.line(g, I.ring(DOCK[1], 40, 10, rr, 22, "z", -0.9, 0.9), "rb-beacon", "opacity:" + (ir * (1 - iu)).toFixed(2));
    }
    // the resume mark: where it stopped to go charge
    var rx = win(t, L(25) + 2.4, L(29) + 0.4, 0.3);
    if (rx > 0) { I.line(g, [[RESUME[0] - 12, RESUME[1] - 12, 1], [RESUME[0] + 12, RESUME[1] + 12, 1]], "rb-x", "opacity:" + rx); I.line(g, [[RESUME[0] - 12, RESUME[1] + 12, 1], [RESUME[0] + 12, RESUME[1] - 12, 1]], "rb-x", "opacity:" + rx); }
    // bump: a little burst at the contact point
    var bmp = bumpAmt(t);
    if (bmp > 0.05) { var bp = I.P(TOY[0] - 14, TOY[1], 10); for (var bk = 0; bk < 6; bk++) { var ba = bk * 1.047, br = (8 + 10 * (1 - bmp)) * I.K / 0.55; I.el("line", { x1: (bp[0] + Math.cos(ba) * br * 0.5).toFixed(1), y1: (bp[1] + Math.sin(ba) * br * 0.5).toFixed(1), x2: (bp[0] + Math.cos(ba) * br).toFixed(1), y2: (bp[1] + Math.sin(ba) * br).toFixed(1), "class": "rb-burst", style: "opacity:" + bmp.toFixed(2) }, g); } }

    // ── the map overlay: the flat fades back and the lidar hits stand out ──
    if (m > 0.01) {
      I.face(g, [[-260, -200, 1.8], [260, -200, 1.8], [260, 200, 1.8], [-260, 200, 1.8]], "rb-mapveil", "opacity:" + (0.75 * m).toFixed(2));
      var upto = t < L(4) ? 3.0 : t;
      for (var mi = 0; mi < MAP.length; mi++) { var mp = MAP[mi]; if (mp[2] > upto || (t >= L(4) && mp[2] < 3.1)) continue; var q2 = I.P(mp[0], mp[1], 2); I.el("circle", { cx: q2[0].toFixed(1), cy: q2[1].toFixed(1), r: (2.1 * I.K / 0.55).toFixed(2), "class": "rb-mappt", style: "opacity:" + m.toFixed(2) }, g); }
      if (rugMarked(t)) { I.face(g, [[RUG[0] - 10, RUG[2] - 10, 2.2], [RUG[1] + 10, RUG[2] - 10, 2.2], [RUG[1] + 10, RUG[3] + 10, 2.2], [RUG[0] - 10, RUG[3] + 10, 2.2]], "rb-nogo", "opacity:" + m.toFixed(2)); I.face(g, [[RUG[0] - 10, RUG[2] - 10, 2.2], [RUG[1] + 10, RUG[2] - 10, 2.2], [RUG[1] + 10, RUG[3] + 10, 2.2], [RUG[0] - 10, RUG[3] + 10, 2.2]], "tz-pat-hatch", "opacity:" + (0.6 * m).toFixed(2)); }
      // the robot on top of its own map
      var rp = I.P(r.x, r.y, 3); I.el("circle", { cx: rp[0].toFixed(1), cy: rp[1].toFixed(1), r: (9 * I.K / 0.55).toFixed(1), "class": "rb-mapme", style: "opacity:" + m.toFixed(2) }, g);
      if (t > L(27) - 0.3 && t < L(27) + 2.8) { var path = [[-20, 140, 2.5], [-70, 145, 2.5], [-170, 140, 2.5], [-180, 40, 2.5], [D[0], D[1], 2.5]]; I.line(g, path, "rb-route", "opacity:" + m.toFixed(2)); }
    }
    return r;
  }

  // ── camera: [time, target ("R" = follow the robot), zoom] ──
  var SH = [[0, "R", 1.17], [L(4), "R", 1.95], [L(5), "R", 2.99], [L(6), "R", 1.95], [L(7), [0, 0, 0], 0.8], [L(8), "R", 1.82], [L(9), "R", 1.82], [L(10), "R", 2.08],
            [L(11), "R", 2.86], [L(12), "R", 2.21], [L(13), "R", 1.82], [L(14), [150, 150, -10], 2.0], [L(15) + 0.6, [168, 155, -20], 2.6], [L(16), "R", 1.69], [L(16) + 2.0, [-110, -150, 10], 2.2],
            [L(18), "R", 1.69], [L(19), [10, 0, 0], 2.2], [L(20) + 0.6, [8, 0, 0], 2.6], [L(22), [95, 0, 0], 1.3], [L(23), [20, 0, 0], 0.95], [L(24), "R", 1.82],
            [L(25), "R", 2.47], [L(26), [-180, 60, 10], 1.5], [L(27), [-80, 80, 0], 0.95], [L(27) + 2.2, [D[0], D[1], 10], 2.2], [L(28) + 1.6, "R", 1.69], [L(29), "R", 1.25]];
  function tgt(v, t) { if (v === "R") { var r = robot(t); return [r.x, r.y, 14]; } return v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    // a slow drift on top, so even a held shot keeps floating
    return { p: [lerp(pa[0], pb[0], k) + 9 * Math.sin(t * 0.52), lerp(pa[1], pb[1], k) + 9 * Math.cos(t * 0.41), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return 0.06 + 0.26 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.63 + 1.0); }

  // labels: [3D point or "R", text, colour, from line, off, to line, off]
  var LB = [["T", "ليزر بيلف", "c-heat", 4, 0.5, 6, 0.6], ["R", "إكصدام", "c-part", 11, 0.2, 12, 1.2], [[176, 150, 75], "حساس السلم", "c-heat", 14, 0.8, 16, 0],
            [[-110, -150, 110], "اتحشرت!", "c-heat", 16, 2.4, 18, 0], ["R", "حساس صوت", "c-water", 19, 1.0, 21, 1.5], [[95, -55, 40], "شراشيب", "c-part", 22, 0.3, 23, 0.5],
            [[-250, 40, 70], "الشاحن", "c-water", 26, 0.2, 27, 2.4]];
  window.__flat = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var th = theta(t), c = camAt(t), I = makeIso(th, 0.55, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (230 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t);
    LB.forEach(function (b) {
      var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return;
      var pt = b[0] === "R" ? [r.x, r.y, 46] : b[0] === "T" ? [r.x, r.y, 48] : b[0];
      var p = I.P(pt[0], pt[1], pt[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: p[0].toFixed(1), y: p[1].toFixed(1), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g);
      tx.textContent = b[1];
    });
    return r;
  };
  window.__flatStatic = function (svg, t, K, ox, oy, extraTheta) {   // intro + outro: whole flat in a small frame
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var I = makeIso(theta(t) + (extraTheta || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g);
    drawWorld(g, I, t); return I;
  };
  window.__robotState = robot; window.__battery = battery; window.__makeIso = makeIso; window.__drawRobot = drawRobot;
})();
