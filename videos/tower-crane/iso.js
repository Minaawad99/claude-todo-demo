/* Isometric 3D model of the tower crane next to a building going up, built before the engine reads the page.
   x → right-down, y → left-down, z → up. The ground is cut open in front of the mast so the foundation shows.
   Everything that moves (slewing, trolley, hook, climbing) is redrawn every frame from time-keyed tracks. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var K = 0.55, OX = 180, OY = 330;
  function P(x, y, z) { return [OX + (x - y) * 0.866 * K, OY + (x + y) * 0.5 * K - z * K]; }
  function pts(list) { return list.map(function (p) { var s = P(p[0], p[1], p[2]); return s[0].toFixed(1) + " " + s[1].toFixed(1); }); }
  function d(list, close) { var a = pts(list); return "M" + a.join(" L") + (close === false ? "" : " Z"); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function face(g, list, cls, extra) { var a = { d: d(list), "class": cls }; for (var k in extra || {}) a[k] = extra[k]; return el("path", a, g); }
  function line(g, list, cls, style) { return el("path", { d: d(list, false), "class": cls, style: style || "" }, g); }
  function box(g, x0, x1, y0, y1, z0, z1, c) {
    c = c || {};
    face(g, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c.y || "f-left");
    face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], c.x || "f-right");
    if (c.hatch !== false) face(g, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], "tz-pat-hatch");
    face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c.z || "f-top");
  }
  function ring(cx, cy, cz, r, n) {
    var out = []; n = n || 28;
    for (var i = 0; i <= n; i++) { var a = Math.PI * 2 * i / n; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz]); }
    return out;
  }
  function cylV(g, cx, cy, r, z0, z1, side, top) {
    var front = ring(cx, cy, z1, r, 18).filter(function (p, i) { return i <= 18; });
    var arc = []; for (var i = 0; i <= 18; i++) { var a = -Math.PI / 4 + Math.PI * i / 18; arc.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    face(g, arc.map(function (p) { return [p[0], p[1], z1]; }).concat(arc.slice().reverse().map(function (p) { return [p[0], p[1], z0]; })), side || "f-left");
    face(g, ring(cx, cy, z1, r, 28), top || "f-top");
  }

  // ── time tracks: each key eases from the previous value over its own duration ──
  var L = window.TIMING.lines;
  function ls(i) { return L[Math.min(i, L.length - 1)].start; }
  function sm(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function track(keys) {
    var k = keys.map(function (a) { return { t: ls(a[0]) + a[1], v: a[2], d: a[3] || 1 }; });
    return function (t) { var v = k[0].v; for (var i = 1; i < k.length; i++) v += (k[i].v - k[i - 1].v) * sm((t - k[i].t) / k[i].d); return v; };
  }
  function env(t, a, b) { return sm((t - a) / 0.5) * (1 - sm((t - b) / 0.5)); }
  var R = track([[4, 0, 170], [16, 0, 226, 1], [19, 0.2, 170, 1], [20, 0.3, 250, 2.4], [21, 0.1, 60, 1.6],
                 [22, 0.2, 250, 2.0], [24, 0.4, 262, 0.6], [25, 0.2, 170, 1.4], [34, 0, 200, 2]]);
  var HK = track([[4, 0, 120], [16, 0.3, 190, 1.5], [19, 0, 120, 1.2], [29, 0, 90, 1]]);
  var LIFT = track([[4, 0, 0], [31, 0.2, 40, 2.2]]);
  var SLIDE = track([[4, 0, 0], [32, 0, 1, 1.4]]);
  var BH = track([[4, 0, 208], [29, 0.4, 234, 1.4], [33, 0.3, 260, 1.4]]);
  function state(t) {
    var th = -0.785 + 0.1 * Math.sin(t * 0.37)
      + env(t, ls(13), ls(14) - 0.2) * 0.75 * Math.sin((t - ls(13)) * 2.4)
      + Math.PI * 2 * sm((t - ls(28) - 0.2) / Math.max(1, ls(29) - ls(28) - 0.4));
    var r = R(t) + env(t, ls(14), ls(15) - 0.2) * 70 * Math.sin((t - ls(14)) * 2.2) + 4 * Math.sin(t * 0.9);
    var stop = t >= ls(24) + 0.9 && t < ls(25);                // the computer froze the trolley
    if (stop) r = R(ls(24) + 0.9);
    var h = HK(t) + env(t, ls(15), ls(16) - 0.2) * 60 * Math.sin((t - ls(15)) * 2.6) + 3 * Math.sin(t * 1.3);
    var slide = SLIDE(t), lift = LIFT(t);
    return { t: t, th: th, r: r, h: h, lift: lift, slide: slide, mast: slide >= 0.999 ? 370 : 330,
             top: 330 + lift, bh: BH(t), stop: stop, sway: 3 * Math.sin(t * 1.7) };
  }
  // crane capacity (t) at a trolley distance, the world's 260 units = 70 m at the tip
  function metres(r) { return r * 70 / 260; }
  function cap(m) { return m <= 20 ? 12 : 12 * Math.pow(20 / m, 1.1); }

  var root = document.getElementById("iso");
  var stat = el("g", {}, root);

  // ── ground slab with a pit cut in front of the mast ──────────────
  var GX0 = -230, GX1 = 260, GY0 = -260, GY1 = 170, GZ = -70;
  box(stat, GX0, GX1, GY0, GY1, GZ, 0, { z: "f-ground", x: "f-soil-r", y: "f-soil" });
  var PX = 96, PY = 96;
  var cp = el("clipPath", { id: "pitcut" }, root);
  el("path", { d: d([[0, 0, 0], [PX, 0, 0], [PX, PY, 0], [0, PY, 0]]) }, cp);
  var pit = el("g", { "clip-path": "url(#pitcut)" }, stat);
  face(pit, [[0, 0, GZ], [PX, 0, GZ], [PX, PY, GZ], [0, PY, GZ]], "f-pit");
  face(pit, [[0, 0, GZ], [0, PY, GZ], [0, PY, 0], [0, 0, 0]], "f-soil-r");
  face(pit, [[0, 0, GZ], [0, PY, GZ], [0, PY, 0], [0, 0, 0]], "tz-pat-hatch");
  face(pit, [[0, 0, GZ], [PX, 0, GZ], [PX, 0, 0], [0, 0, 0]], "f-soil");
  box(pit, 0, 56, 0, 56, -60, 0, { z: "f-conc-top", x: "f-conc-r", y: "f-conc" });
  // rebar in the cut face of the block
  for (var rb = 10; rb < 56; rb += 12) { line(pit, [[56, rb, -54], [56, rb, -6]], "rebar"); line(pit, [[rb, 56, -54], [rb, 56, -6]], "rebar"); }
  // the pad's top, flush with the ground, and the anchor bolts
  face(stat, [[-56, -56, 0.5], [56, -56, 0.5], [56, 56, 0.5], [-56, 56, 0.5]], "f-conc-top");
  [[-14, -14], [14, -14], [14, 14], [-14, 14]].forEach(function (c) { cylV(stat, c[0], c[1], 5, 0, 6, "f-steel", "f-steel"); });
  // site details: a stack of rebar and a small hut, both far from the action
  box(stat, -200, -150, 60, 130, 0, 34, { z: "f-hut-top", x: "f-hut-r", y: "f-hut" });
  [0, 6, 12].forEach(function (o) { line(stat, [[-180 + o, -150, 4], [-60 + o, -150, 4]], "rebar-pile"); });

  var bld = el("g", { id: "isobld" }, root);
  var dyn = el("g", { id: "isodyn" }, root);
  var hal = el("g", { id: "isohal" }, root);

  // ── building under construction (grows during the climb) ────────
  var BX0 = 96, BX1 = 226, BY0 = -226, BY1 = -96;
  function building(g, top) {
    var n = Math.floor(top / 26 + 1e-6), frac = top / 26 - n;
    for (var k = 0; k <= n; k++) {
      var z = k * 26;
      if (k > 0) {
        var cz = Math.min(z, top);
        [[BX0, BY1], [BX1 - 2, BY1], [BX1 - 2, BY0], [(BX0 + BX1) / 2, BY1], [BX1 - 2, (BY0 + BY1) / 2]].forEach(function (c) {
          box(g, c[0], c[0] + 6, c[1] - 6, c[1], z - 26, cz - 4, { z: "f-conc-top", x: "f-conc-r", y: "f-conc", hatch: false });
        });
      }
      box(g, BX0, BX1, BY0, BY1, z - 4, z, { z: "f-floor", x: "f-conc-r", y: "f-conc", hatch: false });
    }
    // columns rising for the next floor, rebar sticking out
    var zt = n * 26, hgt = Math.max(4, frac * 26);
    [[BX0, BY1], [BX1 - 2, BY1], [BX1 - 2, BY0]].forEach(function (c) { line(g, [[c[0] + 3, c[1] - 3, zt], [c[0] + 3, c[1] - 3, zt + hgt + 10]], "rebar"); });
  }

  // ── lattice: every member is a segment, drawn as an ink outline + a yellow core ──
  function Lat() { this.s = []; }
  Lat.prototype.seg = function (a, b) { this.s.push(d([a, b], false)); };
  Lat.prototype.draw = function (g, w) { var ds = this.s.join(" "); el("path", { d: ds, "class": "lat-o", style: "stroke-width:" + (w + 1.6) }, g); el("path", { d: ds, "class": "lat-i", style: "stroke-width:" + w }, g); };

  function mastPart(g, z0, z1, sx) {    // a square lattice tower section from z0 to z1, shifted by sx along x
    var s = 12, back = new Lat(), front = new Lat();
    back.seg([sx - s, -s, z0], [sx - s, -s, z1]);
    for (var z = z0; z < z1 - 1; z += 22) { var z2 = Math.min(z + 22, z1); back.seg([sx - s, -s, z], [sx - s, s, z2]); back.seg([sx - s, -s, z], [sx + s, -s, z2]); }
    back.draw(g, 1.2);
    // ladder inside
    line(g, [[sx - 3, 4, z0], [sx - 3, 4, z1]], "ladder"); line(g, [[sx + 3, -2, z0], [sx + 3, -2, z1]], "ladder");
    [[sx + s, -s], [sx + s, s], [sx - s, s]].forEach(function (c) { front.seg([c[0], c[1], z0], [c[0], c[1], z1]); });
    for (var z = z0; z < z1 - 1; z += 22) {
      var z2 = Math.min(z + 22, z1);
      front.seg([sx + s, -s, z], [sx + s, s, z2]); front.seg([sx + s, s, z], [sx - s, s, z2]);
      front.seg([sx + s, -s, z2], [sx + s, s, z2]); front.seg([sx + s, s, z2], [sx - s, s, z2]);
    }
    front.draw(g, 2);
  }

  function W(th) { var c = Math.cos(th), s = Math.sin(th); return function (u, v, z) { return [u * c - v * s, u * s + v * c, z]; }; }
  function rbox(g, w, u0, u1, v0, v1, z0, z1, cls) {   // a box turned with the crane
    var C = [w(u0, v0, 0), w(u1, v0, 0), w(u1, v1, 0), w(u0, v1, 0)];
    for (var i = 0; i < 4; i++) {
      var a = C[i], b = C[(i + 1) % 4], nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx + ny > 0) face(g, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], i === 1 && cls.front ? cls.front : nx > ny ? cls.r : cls.l);
    }
    face(g, C.map(function (p) { return [p[0], p[1], z1]; }), cls.top);
  }
  var YEL = { l: "f-yel", r: "f-yel-r", top: "f-yel-top" }, CONC = { l: "f-conc", r: "f-conc-r", top: "f-conc-top" };

  function crane(g, S) {
    var w = W(S.th), M = S.top, zb = M + 12, zt = M + 30;
    // what each part's depth is, so far parts are drawn first
    function depth(u, v) { var p = w(u, v, 0); return p[0] + p[1]; }
    var parts = [];
    // counter-jib + counterweights
    parts.push({ k: depth(-60, 0), f: function () {
      var lt = new Lat();
      [-9, 9].forEach(function (v) { lt.seg(w(-6, v, zb), w(-106, v, zb)); });
      for (var u = -6; u >= -106; u -= 14) lt.seg(w(u, -9, zb), w(u, 9, zb));
      lt.draw(g, 1.8);
      face(g, [w(-14, -6, zb + 1), w(-76, -6, zb + 1), w(-76, 6, zb + 1), w(-14, 6, zb + 1)], "f-walk");
      var blocks = [[-106, -98], [-98, -90], [-90, -82]].map(function (b) { return { b: b, k: depth((b[0] + b[1]) / 2, 0) }; }).sort(function (a, b) { return a.k - b.k; });
      blocks.forEach(function (b) { rbox(g, w, b.b[0], b.b[1], -12, 12, M - 26, zb + 2, CONC); });
      rbox(g, w, -60, -40, -8, 8, zb, zb + 10, { l: "f-part", r: "f-part-r", top: "f-part-top" });   // hoist winch
      cylDrum(g, w, -50, zb + 10);
    } });
    // jib
    parts.push({ k: depth(130, 0), f: function () {
      var lt = new Lat(), tip = 262;
      lt.seg(w(10, -7, zb), w(tip, -7, zb)); lt.seg(w(10, 7, zb), w(tip, 7, zb)); lt.seg(w(10, 0, zt), w(tip - 10, 0, zb + 6));
      for (var u = 10; u < tip - 10; u += 20) {
        var zz = zt - (zt - zb - 6) * Math.max(0, (u - 200) / 52), zz2 = zt - (zt - zb - 6) * Math.max(0, (u + 20 - 200) / 52);
        lt.seg(w(u, -7, zb), w(u + 10, 0, (zz + zz2) / 2)); lt.seg(w(u + 10, 0, (zz + zz2) / 2), w(u + 20, -7, zb));
        lt.seg(w(u, 7, zb), w(u + 10, 0, (zz + zz2) / 2)); lt.seg(w(u + 10, 0, (zz + zz2) / 2), w(u + 20, 7, zb));
        lt.seg(w(u, -7, zb), w(u, 7, zb));
      }
      lt.draw(g, 1.8);
    } });
    // apex + pendants
    parts.push({ k: depth(0, 0) + 0.5, f: function () {
      var lt = new Lat(), ap = M + 84;
      lt.seg(w(-6, -7, zb), w(0, 0, ap)); lt.seg(w(-6, 7, zb), w(0, 0, ap)); lt.seg(w(6, -7, zb), w(0, 0, ap)); lt.seg(w(6, 7, zb), w(0, 0, ap));
      lt.draw(g, 2);
      line(g, [w(0, 0, ap), w(170, 0, zt - 1)], "pendant"); line(g, [w(0, 0, ap), w(-100, 0, zb + 2)], "pendant");
      // anemometer on the apex, always spinning
      var a = S.t * 9, c1 = w(0, 0, ap + 10);
      line(g, [w(0, 0, ap), c1], "pendant");
      [0, Math.PI].forEach(function (o) {
        var e = [c1[0] + Math.cos(a + o) * 7, c1[1] + Math.sin(a + o) * 7, c1[2]];
        line(g, [c1, e], "pendant"); face(g, ring(e[0], e[1], e[2], 2.4, 10), "f-ink");
      });
      // red warning light, blinking
      if (Math.sin(S.t * 5) > 0) face(g, ring(0, 0, ap + 2, 3, 10), "f-warn");
    } });
    // cab
    parts.push({ k: depth(10, 26), f: function () {
      rbox(g, w, -4, 24, 14, 36, M - 26, M + 2, { l: "f-cab", r: "f-cab-r", top: "f-yel-top", front: "f-glass" });
      line(g, [w(24, 16, M - 13), w(24, 34, M - 13)], "mullion");
    } });
    // trolley, hook and load
    parts.push({ k: depth(S.r, 0) + 1, f: function () {
      rbox(g, w, S.r - 9, S.r + 9, -10, 10, zb - 6, zb, YEL);
      var hz = zb - 6 - S.h, lu = S.r + S.sway;
      line(g, [w(S.r - 3, 0, zb - 6), w(lu - 3, 0, hz + 8)], "cable"); line(g, [w(S.r + 3, 0, zb - 6), w(lu + 3, 0, hz + 8)], "cable");
      rbox(g, w, lu - 5, lu + 5, -4, 4, hz, hz + 8, YEL);
      line(g, [w(lu, 0, hz), w(lu, 0, hz - 6)], "hook");
      line(g, [w(lu, 0, hz - 6), w(lu - 20, -6, hz - 20)], "chain"); line(g, [w(lu, 0, hz - 6), w(lu + 20, 6, hz - 20)], "chain");
      [0, 6].forEach(function (o) { rbox(g, w, lu - 26, lu + 26, -9 + o, -3 + o, hz - 28, hz - 20, { l: "f-load", r: "f-load-r", top: "f-load-top" }); });
      S.hook = w(lu, 0, hz - 24);
    } });
    parts.sort(function (a, b) { return a.k - b.k; }).forEach(function (p) { p.f(); });
    S.cab = w(10, 26, M - 12); S.trolley = w(S.r, 0, zb - 3); S.jibMid = w(140, 0, zt); S.weights = w(-94, 0, M - 8);
  }
  function cylDrum(g, w, u, z) { var c = w(u, 0, z); face(g, ring(c[0], c[1], c[2] + 4, 6, 14), "f-steel"); }

  // the slewing ring + turntable on top of the mast
  function slew(g, M) {
    cylV(g, 0, 0, 17, M, M + 6, "f-steel", "f-steel");
    cylV(g, 0, 0, 15, M + 6, M + 12, "f-part", "f-part-top");
  }

  // climbing cage (lines 30–33)
  function cage(g, S) {
    var z0 = 330 - 52, z1 = 330 + 14 + S.lift, c = 17, lt = new Lat();
    [[c, -c], [c, c], [-c, c]].forEach(function (p) { lt.seg([p[0], p[1], z0], [p[0], p[1], z1]); });
    [z0, z0 + 26, z1].forEach(function (z) { lt.seg([c, -c, z], [c, c, z]); lt.seg([c, c, z], [-c, c, z]); });
    var o = new Lat(); o.s = lt.s; el("path", { d: o.s.join(" "), "class": "cage-o" }, g); el("path", { d: o.s.join(" "), "class": "cage-i" }, g);
    // the hydraulic ram on the front face: barrel + a rod that extends with the lift
    line(g, [[c + 2, 0, z0 + 4], [c + 2, 0, z0 + 30]], "ram");
    line(g, [[c + 2, 0, z0 + 30], [c + 2, 0, z0 + 40 + S.lift]], "ram-rod");
    S.ram = [c + 2, 0, z0 + 30];
  }

  // worker climbing the ladder (line 11)
  function climber(g, t) {
    var a = ls(10) + 1.4, b = ls(12) - 0.2;
    if (t < a - 0.2 || t > b + 0.4) return;
    var k = sm((t - a) / (b - a)), z = 6 + k * 300, bob = Math.abs(Math.sin(t * 8)) * 2;
    var q = P(0, 0, z + bob);
    el("circle", { cx: q[0].toFixed(1), cy: (q[1] - 5).toFixed(1), r: 3.2, "class": "hat" }, g);
    el("path", { d: "M" + q[0].toFixed(1) + " " + (q[1] - 2).toFixed(1) + " v8", "class": "body" }, g);
  }

  // site life that never stops: a mixer truck driving past, welding sparks on the top floor
  function site(g, t, S) {
    var x = ((t * 46) % 560) - 280, y = 140;
    if (x > GX0 - 20 && x < GX1 - 40) {
      box(g, x, x + 46, y - 12, y + 12, 4, 24, { z: "f-hut-top", x: "f-hut-r", y: "f-hut", hatch: false });
      box(g, x + 46, x + 62, y - 12, y + 12, 4, 30, { z: "f-yel-top", x: "f-yel-r", y: "f-yel", hatch: false });
      var dr = P(x + 22, y, 34);
      el("ellipse", { cx: dr[0].toFixed(1), cy: dr[1].toFixed(1), rx: 13, ry: 8, "class": "f-conc", transform: "rotate(" + ((t * 140) % 360).toFixed(0) + " " + dr[0].toFixed(1) + " " + dr[1].toFixed(1) + ")" }, g);
    }
    var sp = P(BX0 + 20, BY1 - 10, S.bh + 4), f = Math.floor(t * 12);
    for (var i = 0; i < 6; i++) {
      var a = Math.sin(f * 12.9898 + i * 78.233) * 43758.5453, r = a - Math.floor(a);
      el("circle", { cx: (sp[0] + (r - 0.5) * 16).toFixed(1), cy: (sp[1] - r * 10 + i).toFixed(1), r: 1.3, "class": "spark" }, g);
    }
  }

  window.__iso = function (t) {
    [bld, dyn, hal].forEach(function (g) { while (g.firstChild) g.removeChild(g.firstChild); });
    var S = state(t);
    building(bld, S.bh);
    var showCage = t > ls(30) - 0.4 && t < ls(34) + 0.2;
    var cg = el("g", { style: "opacity:" + (sm((t - ls(30) + 0.4) / 0.4) * (1 - sm((t - ls(34)) / 0.3))).toFixed(3) }, dyn);
    mastPart(dyn, 0, S.mast, 0);
    if (showCage) cage(cg, S);
    if (t > ls(31) && S.slide < 0.999) {             // the new section slides in from the side
      var sx = 70 * (1 - S.slide);
      var ns = el("g", { "class": "newsec" }, dyn); mastPart(ns, 330, 370, sx);
      S.newsec = [sx, 0, 350];
    }
    if (S.lift > 0.5 && S.slide < 0.999) mastPart(dyn, 330 + S.lift - 4, 330 + S.lift, 0);
    slew(dyn, S.top);
    crane(dyn, S);
    climber(dyn, t);
    site(dyn, t, S);
    window.__state = S;
    if (window.__isoHalos) window.__isoHalos(hal, S);
  };

  window.ISO = { P: P, d: d, el: el, ring: ring, ls: ls, sm: sm, cap: cap, metres: metres, state: state,
                 B: { x0: BX0, x1: BX1, y0: BY0, y1: BY1 } };
})();
