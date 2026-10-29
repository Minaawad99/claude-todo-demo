/* «إزاي الأسانسير بيمنع السقوط؟» — الواقعي: real 3D shaft (three.js r149), a pure function of time.
   Units are metres. Floors every 3 m. The shaft's front wall is cut away except in the landing-door shots.
   Colour meanings: main idea yellow, info / rails / governor cyan, danger red, OK green. */
(function () {
  var T3 = THREE, LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function ease(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function sm(a, b, t) { return easeIO((t - a) / (b - a)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function V(x, y, z) { return new T3.Vector3(x, y, z); }
  var C = { red: 0xb3262b, yellow: 0xf5c842, cyan: 0x5bc8f5, green: 0x4ade80, danger: 0xd54549, steel: 0x9aa3ad, dark: 0x1b232b };
  function mat(c, o) { return new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0.1 }, o || {})); }
  function glow(c, o) { return new T3.MeshBasicMaterial(Object.assign({ color: c, transparent: true, opacity: 0 }, o || {})); }

  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false); R.outputEncoding = T3.sRGBEncoding;
  R.toneMapping = T3.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  var scene = new T3.Scene(); scene.background = new T3.Color(0x0e171e); scene.fog = new T3.Fog(0x0e171e, 14, 40);
  var cam = new T3.PerspectiveCamera(40, 360 / 640, 0.05, 300);
  scene.add(new T3.HemisphereLight(0xffe7c4, 0x1c2630, 0.55));
  var key = new T3.DirectionalLight(0xffd9a8, 0.9); key.position.set(-6, 30, 12); scene.add(key);
  var rim = new T3.DirectionalLight(0x8fc7ff, 0.45); rim.position.set(8, 10, -10); scene.add(rim);

  function canvasTex(w, h, draw, rx, ry) {
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h);
    var tx = new T3.CanvasTexture(cv); tx.wrapS = tx.wrapT = T3.RepeatWrapping; tx.repeat.set(rx || 1, ry || 1); tx.encoding = T3.sRGBEncoding; return tx;
  }
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var concrete = canvasTex(256, 256, function (x, w, h) {
    x.fillStyle = "#7d7a74"; x.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { var g = 95 + rnd() * 50 | 0; x.fillStyle = "rgba(" + g + "," + (g - 3) + "," + (g - 8) + ",.35)"; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 3); }
    x.fillStyle = "rgba(40,36,30,.25)"; x.fillRect(0, 0, w, 3); x.fillRect(0, 128, w, 2);
  }, 2, 6);
  function box(w, h, d, m, x, y, z, parent) { var b = new T3.Mesh(new T3.BoxGeometry(w, h, d), m); b.position.set(x, y, z); (parent || scene).add(b); return b; }
  function cyl(r, h, m, parent) { var c = new T3.Mesh(new T3.CylinderGeometry(r, r, h, 12), m); (parent || scene).add(c); return c; }

  // ── the shaft ─────────────────────────────────────────────────
  var SX0 = -1.7, SX1 = 1.7, SZ0 = -1.2, SZ1 = 1.2, TOP = 25, PIT = -1.6, CX = -0.35, CW = 1.5, CD = 1.5, CH = 2.3;
  var wallM = mat(0xffffff, { map: concrete, roughness: .95, metalness: 0 });
  var shaft = new T3.Group(); scene.add(shaft);
  box(SX1 - SX0 + .4, TOP - PIT + 2, .2, wallM, 0, (TOP + PIT) / 2 + 1, SZ0 - .1, shaft);
  box(.2, TOP - PIT + 2, SZ1 - SZ0, wallM, SX0 - .1, (TOP + PIT) / 2 + 1, 0, shaft);
  box(.2, TOP - PIT + 2, SZ1 - SZ0, wallM, SX1 + .1, (TOP + PIT) / 2 + 1, 0, shaft);
  box(SX1 - SX0 + .4, .2, SZ1 - SZ0 + .2, mat(0x4a4744, { roughness: 1 }), 0, PIT - .1, 0, shaft);       // pit floor
  box(SX1 - SX0 + .4, .4, SZ1 - SZ0 + .2, mat(0x5b5853, { roughness: .9 }), 0, TOP + 2.6, 0, shaft);      // machine-room ceiling
  [-1, 1].forEach(function (s) { box(.4, .25, .9, mat(0x3a3f45, { metalness: .5 }), SHX + s * .25, TOP + .02, -.75, shaft); });   // machine bedplate
  var lampM = new T3.MeshBasicMaterial({ color: 0xffd08a });
  for (var f = 0; f <= 8; f++) {                              // slab edges + a warm lamp per floor
    box(SX1 - SX0, .08, .06, mat(0x3a3733), 0, f * 3 - .05, SZ0 + .05, shaft);
    box(.25, .06, .06, lampM, SX0 + .25, f * 3 + 2.6, SZ0 + .06, shaft);
  }
  var pl = new T3.PointLight(0xffc98a, 0.7, 12); pl.position.set(-1, 13, 0); scene.add(pl);
  var pl2 = new T3.PointLight(0xffc98a, 0.5, 12); pl2.position.set(-1, 23, 0); scene.add(pl2);
  var underL = new T3.PointLight(0xfff0d0, 0.0, 3.5); scene.add(underL);
  // pit buffers
  [CX, 1.1].forEach(function (x) { var s = cyl(.12, .9, mat(0xc9a227, { metalness: .4, roughness: .4 }), shaft); s.position.set(x, PIT + .45, 0); });

  // guide rails (T-section) for the car and the counterweight
  var railM = mat(C.steel, { metalness: .8, roughness: .35 }), railGlow = glow(C.cyan);
  var RLX = CX - CW / 2 - .16, RRX = CX + CW / 2 + .16, railGlows = [];
  [RLX, RRX].forEach(function (x, k) {
    var s = k ? -1 : 1;
    box(.05, TOP - PIT, .16, railM, x, (TOP + PIT) / 2, 0, shaft);
    box(.12, TOP - PIT, .05, railM, x - s * .06, (TOP + PIT) / 2, 0, shaft);
    var g = box(.2, TOP - PIT, .26, railGlow, x, (TOP + PIT) / 2, 0, shaft); railGlows.push(g);
  });
  [.78, 1.42].forEach(function (x) { box(.06, TOP - PIT, .1, railM, x, (TOP + PIT) / 2, -.45, shaft); });

  // machine on top: traction sheave + motor
  var SHR = (1.1 - CX) / 2, SHX = (CX + 1.1) / 2, SHY = TOP + .9;
  var machine = new T3.Group(); machine.position.set(SHX, SHY, 0); scene.add(machine);
  var sheave = new T3.Group(); machine.add(sheave);
  var shM = mat(0x55606b, { metalness: .7, roughness: .35 });
  var disc = new T3.Mesh(new T3.CylinderGeometry(SHR, SHR, .35, 40), shM); disc.rotation.x = Math.PI / 2; sheave.add(disc);
  for (var g6 = 0; g6 < 6; g6++) { var sp = box(SHR * 1.8, .08, .4, mat(0x3c444c, { metalness: .6 }), 0, 0, 0, sheave); sp.rotation.z = g6 * Math.PI / 6; }
  var motor = box(1.0, .8, .8, mat(0x2f6f9f, { metalness: .3, roughness: .5 }), 0, -.1, -.75, machine);
  cyl(.15, .4, mat(0x222)).position.set(0, 0, 0);
  var motorGlow = box(1.1, .9, .9, glow(C.yellow), 0, -.1, -.75, machine);

  // ── the car (cabin) ───────────────────────────────────────────
  var car = new T3.Group(); scene.add(car);
  var redM = mat(C.red, { roughness: .35, metalness: .35 }), carGlow = glow(C.yellow);
  box(CW, .12, CD, mat(0x2b2b2b), CX, 0, 0, car);                                   // floor
  box(CW, .14, CD, redM, CX, CH, 0, car);                                           // roof
  box(.06, CH, CD, redM, CX - CW / 2, CH / 2, 0, car); box(.06, CH, CD, redM, CX + CW / 2, CH / 2, 0, car); box(CW, CH, .06, redM, CX, CH / 2, -CD / 2, car);
  box(CW, CH, .04, new T3.MeshStandardMaterial({ color: 0x9fd3ff, transparent: true, opacity: .16, roughness: .1, metalness: .2 }), CX, CH / 2, CD / 2, car);   // glass front
  [-1, 1].forEach(function (s) { box(.1, CH, .08, mat(0x8c1d22, { metalness: .5 }), CX + s * (CW / 2 - .05), CH / 2, CD / 2, car); });
  box(CW, .08, .08, mat(0x8c1d22, { metalness: .5 }), CX, CH - .04, CD / 2, car);
  var carLight = new T3.PointLight(0xfff1d6, 0.9, 4); carLight.position.set(CX, CH - .3, 0); car.add(carLight);
  box(.8, .03, .4, new T3.MeshBasicMaterial({ color: 0xfff4dc }), CX, CH - .08, 0, car);
  var ghost = box(CW + .1, CH + .1, CD + .1, carGlow, CX, CH / 2, 0, car);
  // crosshead + rope hitch on top
  box(CW + .3, .16, .18, mat(0x444c55, { metalness: .6 }), CX, CH + .35, 0, car);
  [-1, 1].forEach(function (s) { box(.08, .5, .12, mat(0x444c55, { metalness: .6 }), CX + s * (CW / 2 + .1), CH + .1, 0, car); });
  // six people
  var skin = [0xe0b48c, 0xc68c5a, 0x8d5a3a, 0xf0c8a0, 0xa66b45, 0xd9a274], cloth = [0x2f6f9f, 0x3f5f3a, 0xd9a274, 0x444, 0x7a3b5e, 0xe6e1d5];
  for (var p = 0; p < 6; p++) {
    var px = CX - .45 + (p % 3) * .45, pz = p < 3 ? -.35 : .25;
    var body = new T3.Mesh(new T3.CapsuleGeometry(.14, .9, 4, 10), mat(cloth[p], { roughness: .8 })); body.position.set(px, .62, pz); car.add(body);
    var head = new T3.Mesh(new T3.SphereGeometry(.12, 14, 10), mat(skin[p], { roughness: .7 })); head.position.set(px, 1.36 + (p % 2) * .05, pz); car.add(head);
  }
  // safety gear: wedges at both rails under the car + the linkage arm
  var wedgeM = mat(0x666f78, { metalness: .7, roughness: .3 }), wedgeHot = mat(C.yellow, { emissive: 0x7a5a10, metalness: .5 }), wedgeGlow = glow(C.yellow), wedges = [];
  [RLX + .12, RRX - .12].forEach(function (x, k) {
    var gw = new T3.Group(); gw.position.set(x, -.25, 0); car.add(gw);
    box(.16, .35, .3, mat(0x2e3439, { metalness: .5 }), (k ? -1 : 1) * .06, 0, 0, gw);
    var wd = box(.07, .26, .22, wedgeM, 0, -.04, 0, gw); var wg = box(.12, .32, .3, wedgeGlow, 0, -.04, 0, gw);
    wedges.push({ wd: wd, wg: wg });
  });
  box(CW + .25, .1, .1, mat(0x2e3439, { metalness: .5 }), CX, -.12, .55, car);   // safety plank
  var arm = new T3.Group(); arm.position.set(RLX + .1, -.05, .6); car.add(arm);
  var armBar = box(.55, .07, .07, mat(0xd9a227, { metalness: .4 }), .27, 0, 0, arm); var armGlow = box(.62, .14, .14, glow(C.yellow), .27, 0, 0, arm);

  // ── counterweight ─────────────────────────────────────────────
  var cw = new T3.Group(); scene.add(cw);
  box(.56, 2.0, .2, mat(0x3a3f45, { metalness: .5 }), 1.1, 1, -.45, cw);
  for (var b = 0; b < 9; b++) box(.5, .2, .18, mat(b % 2 ? 0x6b7178 : 0x5d636a, { metalness: .4, roughness: .5 }), 1.1, .15 + b * .21, -.45, cw);
  var cwGlow = box(.66, 2.1, .3, glow(C.yellow), 1.1, 1, -.45, cw);

  // ── hoist ropes: from the car hitch over the sheave to the counterweight ─────
  var ropeM = mat(0x8b9097, { metalness: .8, roughness: .3 }), ropeHi = mat(C.yellow, { emissive: 0x6b5410 }), ropeRed = mat(C.danger, { emissive: 0x5a1416 });
  var ROPES = []; for (var r = 0; r < 6; r++) {
    var rz = -.25 + r * .1, a = cyl(.022, 1, ropeM), c2 = cyl(.022, 1, ropeM), stub = cyl(.022, 1.2, ropeM);
    ROPES.push({ z: rz, up: a, cw: c2, stub: stub });
  }
  var tmpV = V(0, 0, 0);
  function placeRope(m, x0, y0, x1, y1, z) { m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); m.scale.set(1, Math.max(.001, Math.hypot(x1 - x0, y1 - y0)), 1); m.rotation.z = Math.atan2(x0 - x1, y1 - y0); }

  // ── governor (speed limiter) at the top, its own rope looping to the pit ────
  var GX = SX0 + .3, GZ = .8, GR = .22, GY = TOP + .75;
  var gov = new T3.Group(); gov.position.set(GX + GR, GY, GZ); scene.add(gov);
  var govWheel = new T3.Group(); gov.add(govWheel);
  var gd = new T3.Mesh(new T3.CylinderGeometry(GR, GR, .08, 32), mat(0xc9a227, { metalness: .6, roughness: .3 })); gd.rotation.x = Math.PI / 2; govWheel.add(gd);
  for (var g2 = 0; g2 < 2; g2++) { var fw = box(.06, .26, .1, mat(0x3c444c, { metalness: .6 }), 0, 0, .06, govWheel); fw.rotation.z = g2 * Math.PI / 2 + .3; }
  box(.5, .3, .25, mat(0x2b3138, { metalness: .5 }), 0, -.3, -.12, gov);
  var govGlow = new T3.Mesh(new T3.TorusGeometry(GR + .12, .03, 8, 48), glow(C.cyan)); gov.add(govGlow);
  var govRopeM = mat(0x9aa3ad, { metalness: .7 }), govRopeGlow = glow(C.cyan);
  var gr1 = cyl(.014, TOP - PIT, govRopeM), gr2 = cyl(.014, TOP - PIT, govRopeM);
  gr1.position.set(GX, (GY + PIT) / 2, GZ); gr2.position.set(GX + 2 * GR, (GY + PIT) / 2, GZ);
  var grg = cyl(.05, TOP - PIT, govRopeGlow); grg.position.copy(gr1.position);
  var beads = []; for (var bd = 0; bd < 40; bd++) { var be = new T3.Mesh(new T3.SphereGeometry(.03, 8, 6), new T3.MeshBasicMaterial({ color: C.cyan })); scene.add(be); beads.push(be); }

  // sparks at the rails
  var sparkG = new T3.BufferGeometry(), NS = 90, sparkP = new Float32Array(NS * 3); sparkG.setAttribute("position", new T3.BufferAttribute(sparkP, 3));
  var sparks = new T3.Points(sparkG, new T3.PointsMaterial({ color: 0xffd36b, size: .05, transparent: true, opacity: 0 })); scene.add(sparks);

  // ── front wall with landing doors (only for the corridor shots) ──────────────
  var front = new T3.Group(); scene.add(front);
  var frontM = new T3.MeshStandardMaterial({ color: 0xd8d1c4, roughness: .9, transparent: true, opacity: 1 });
  var doorM = new T3.MeshStandardMaterial({ color: 0xa9b1b8, metalness: .75, roughness: .28, transparent: true, opacity: 1 });
  var DF = 4, DY = DF * 3, doorL, doorR;
  box(SX1 - SX0 + 6, TOP - PIT, .2, frontM, 0, (TOP + PIT) / 2, SZ1 + .1, front).position.y = (TOP + PIT) / 2;
  front.children[0].visible = false;                       // replaced by pieces around the door opening below
  box(SX1 - SX0 + 6, DY - PIT, .2, frontM, 0, (DY + PIT) / 2, SZ1 + .1, front);
  box(SX1 - SX0 + 6, TOP - DY - 2.2, .2, frontM, 0, DY + 2.2 + (TOP - DY - 2.2) / 2, SZ1 + .1, front);
  box(2.8, 2.2, .2, frontM, CX - .55 - 1.4, DY + 1.1, SZ1 + .1, front); box(2.8 + 2, 2.2, .2, frontM, CX + .55 + 2.4, DY + 1.1, SZ1 + .1, front);
  doorL = box(.56, 2.15, .05, doorM, CX - .28, DY + 1.08, SZ1 + .23, front); doorR = box(.56, 2.15, .05, doorM, CX + .28, DY + 1.08, SZ1 + .23, front);
  box(1.3, .1, .1, mat(0x8a9198, { metalness: .7 }), CX, DY + 2.25, SZ1 + .25, front);
  var corridorFloor = box(12, .1, 6, mat(0x6f5a44, { roughness: .7 }), 0, DY - .05, SZ1 + 3.2, front);
  box(.4, .6, .05, mat(0x30363c, { metalness: .4 }), CX + 1.0, DY + 1.2, SZ1 + .23, front);       // call panel
  var callBtn = box(.1, .1, .03, new T3.MeshBasicMaterial({ color: 0xffd08a }), CX + 1.0, DY + 1.2, SZ1 + .27, front);
  var cLight = new T3.PointLight(0xffe2b8, 0.0, 9); cLight.position.set(CX, DY + 2.6, SZ1 + 2.5); scene.add(cLight);
  // the door lock: a hook latch above the door
  var lock = new T3.Group(); lock.position.set(CX + .1, DY + 2.35, SZ1 + .3); front.add(lock);
  box(.3, .12, .04, mat(0x2b3138, { metalness: .5 }), 0, 0, 0, lock);
  var hook = new T3.Group(); hook.position.set(-.1, 0, .04); lock.add(hook);
  box(.24, .05, .03, mat(C.danger, { metalness: .4 }), .1, 0, 0, hook); box(.05, .1, .03, mat(C.danger, { metalness: .4 }), .2, -.05, 0, hook);
  var lockGlow = box(.34, .18, .01, glow(C.danger), 0, 0, -.01, lock);

  // ── Otis 1854 (sepia), far away from the shaft ───────────────
  var otis = new T3.Group(); otis.position.set(60, 0, 0); scene.add(otis);
  var woodM = mat(0x8a6a44, { roughness: .9 });
  var ground = new T3.Mesh(new T3.PlaneGeometry(40, 40), mat(0x7a6a55, { roughness: 1 })); ground.rotation.x = -Math.PI / 2; otis.add(ground);
  [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]].forEach(function (q) { box(.18, 9, .18, woodM, q[0], 4.5, q[1], otis); });
  box(2.8, .18, .18, woodM, 0, 9, -1, otis); box(2.8, .18, .18, woodM, 0, 9, 1, otis); box(.18, .18, 2.2, woodM, 0, 9.1, 0, otis);
  var plat = new T3.Group(); otis.add(plat);
  box(2.1, .12, 1.7, woodM, 0, 0, 0, plat);
  [-1, 1].forEach(function (s) { box(.08, 1.0, 1.7, woodM, s * 1.0, .5, 0, plat); });
  var man = new T3.Group(); man.position.set(.2, .06, .1); plat.add(man);
  var coat = new T3.Mesh(new T3.CapsuleGeometry(.17, .85, 4, 10), mat(0x2b2b2b, { roughness: .8 })); coat.position.y = .62; man.add(coat);
  var mh = new T3.Mesh(new T3.SphereGeometry(.13, 14, 10), mat(0xe0b48c)); mh.position.y = 1.32; man.add(mh);
  var hat = cyl(.12, .28, mat(0x111)); hat.position.y = 1.55; man.add(hat); var brim = cyl(.19, .02, mat(0x111)); brim.position.y = 1.42; man.add(brim);
  var armUp = box(.06, .5, .06, mat(0x2b2b2b), .2, 1.15, 0, man); armUp.rotation.z = -.6;
  var otRope = cyl(.03, 1, mat(0x9c8460, { roughness: .9 })); otis.add(otRope);
  var otStub = cyl(.03, .9, mat(0x9c8460, { roughness: .9 })); otis.add(otStub);
  var crowd = []; for (var k = 0; k < 22; k++) {
    var side = k % 2 ? 1 : -1, cx = side * (2.3 + (k >> 1) % 4 * .65), cz = 1.2 + ((k >> 3) * .8) + (k % 3) * .25;
    var pg = new T3.Group(); pg.position.set(cx, 0, cz); otis.add(pg);
    var cb = new T3.Mesh(new T3.CapsuleGeometry(.16, .8, 4, 8), mat([0x3a3028, 0x4a3b2e, 0x2b2b2b, 0x5a4636][k % 4], { roughness: .9 })); cb.position.y = .6; pg.add(cb);
    var ch = new T3.Mesh(new T3.SphereGeometry(.12, 10, 8), mat(0xd2a679)); ch.position.y = 1.25; pg.add(ch);
    if (k % 3 === 0) { var ht = cyl(.1, .22, mat(0x1a1a1a)); ht.position.y = 1.45; pg.add(ht); }
    crowd.push(pg);
  }
  var otisLight = new T3.PointLight(0xffd9a0, 0, 30); otisLight.position.set(60, 12, 8); scene.add(otisLight);

  // ── motion: car height over time ──────────────────────────────
  var Y0 = 9, CUT1 = L(1) + 1.25, GRAB1 = L(2) + .25;
  var DROP = L(12) + .15, LOCK = L(13) - .45, BRAKE = L(14) + 1.5, HALT = L(14) + 2.1;
  function carY(t) {
    if (t < L(3)) {                                            // hook: ropes snap, it drops a little, wedges grab
      if (t < CUT1) return Y0 + .02 * Math.sin(t * 2);
      var dt = Math.min(t, GRAB1) - CUT1, y = Y0 - 0.5 * 2.2 * dt * dt;
      if (t > GRAB1) { var v = 2.2 * (GRAB1 - CUT1), e = Math.min(t - GRAB1, .25); y -= v * e - v * e * e / (2 * .25); }
      return y;
    }
    if (t < L(8)) return Y0;
    if (t < L(12)) return lerp(Y0, 15, sm(L(8) + .3, L(9) - .2, t));     // counterweight demo: up to floor 5
    if (t < L(16) - .3) {                                       // overspeed demo
      if (t < DROP) return 15;
      if (t < LOCK) return 15 - 0.75 * Math.pow(t - DROP, 2);
      var yl = 15 - 0.75 * Math.pow(LOCK - DROP, 2);
      if (t < BRAKE) return yl - 0.45 * (t - LOCK);
      var yb = yl - 0.45 * (BRAKE - LOCK), e2 = Math.min(t - BRAKE, HALT - BRAKE);
      return yb - 0.45 * e2 + 0.45 * e2 * e2 / (2 * (HALT - BRAKE));
    }
    if (t < L(17) + 1.2) return 21;                              // door scene: the car is far above
    if (t < L(21)) return lerp(21, DY, sm(L(17) + 1.2, L(17) + 3.0, t));
    return DY;
  }
  function ropesCut(t) { return (t >= CUT1 && t < L(3)) || (t >= DROP + .05 && t < L(16) - .3); }

  // ── camera shots: [line, offset, pos, target, fov, move seconds, follow car] ─────
  var SH = [
    [0, -1, [2.2, 6.2, 5.2], [CX, 10.6, 0], 46, 0, 1],
    [0, .4, [2.6, 4.6, 6.8], [CX, 10.4, 0], 42, 3.2, 1],
    [1, .6, [1.6, 7.5, 3.4], [CX, 10, 0], 44, 1.2, 1],
    [2, .1, [.6, 7.4, 2.4], [CX - .4, 9.0, 0], 52, .8, 1],
    [3, -.2, [3.5, 9, 8], [CX, 10.5, 0], 40, .01, 1],
    [4, -.1, [1.4, 12.8, 2.2], [CX, 11.8, 0], 48, .01, 1],
    [5, .2, [1.2, 12.4, 1.6], [CX, 11.9, 0], 46, 2.2, 1],
    [7, .1, [3.0, 22.6, 5.2], [SHX, 24.6, 0], 44, 1.6, 0],
    [7, 2.1, [3.2, 18.0, 5.8], [.8, 21.5, -.3], 46, 1.6, 0],
    [8, .2, [4.2, 15.5, 9.5], [.2, 16.5, 0], 50, 1.4, 0],
    [9, .1, [2.4, 18.2, 4.0], [CX, 17.6, 0], 50, .7, 1],
    [10, .1, [2.6, 17.5, 3.2], [RRX, 18.5, 0], 52, 1.2, 0],
    [10, 2.4, [-.2, 16.2, 2.6], [RLX, 19.5, 0], 58, 1.4, 0],
    [11, .2, [-.1, 24.7, 2.6], [GX + GR, 25.6, GZ], 46, 1.4, 0],
    [11, 2.8, [.9, 21.0, 3.6], [GX, 18.5, GZ], 50, 1.6, 0],
    [12, -.1, [.2, 25.4, 2.4], [GX + GR, 25.65, GZ], 40, .7, 0],
    [13, -.15, [2.2, -1.4, 4.6], [CX, .4, 0], 50, .01, 1],
    [14, -.05, [1.6, -1.0, 3.8], [CX, .2, 0], 48, .8, 1],
    [14, 2.6, [2.2, .6, 3.6], [CX, .6, 0], 46, 1.0, 1],
    [16, -.2, [CX + 1.2, DY + 1.7, SZ1 + 4.6], [CX, DY + 1.3, SZ1], 48, .01, 0],
    [16, 1.0, [CX + .6, DY + 1.5, SZ1 + 3.2], [CX, DY + 1.3, SZ1], 46, 1.4, 0],
    [17, .1, [CX + .7, DY + 1.9, SZ1 + 2.0], [CX + .05, DY + 2.2, SZ1 + .3], 44, 1.0, 0],
    [17, 2.6, [CX + 1.4, DY + 1.6, SZ1 + 4.0], [CX, DY + 1.2, SZ1], 46, 1.0, 0],
    [19, -.2, [60 + .8, 2.2, 13], [60, 4.6, 0], 48, .01, 0],
    [19, 3.0, [60 + 1.2, 6.2, 8.5], [60, 6.8, 0], 46, 3.0, 0],
    [20, .3, [60 + 1.0, 6.4, 6.4], [60, 6.4, 0], 46, 1.0, 0],
    [21, -.1, [6.5, 12, 15], [0, 12.5, 0], 50, .01, 0],
    [21, 2.5, [5.5, 14, 13], [0, 13, 0], 50, 3, 0]
  ];
  SH.forEach(function (s) { s.t = L(s[0]) + s[1]; });
  function camAt(t) {
    var a = SH[0], b = SH[0];
    for (var i = 0; i < SH.length; i++) if (SH[i].t <= t) { a = SH[i - 1] || SH[i]; b = SH[i]; }
    var k = easeIO((t - b.t) / b[5]);
    var pa = rel(a, 2, t), pb = rel(b, 2, t), ta = rel(a, 3, t), tb = rel(b, 3, t);
    var pos = pa.lerp(pb, k), tgt = ta.lerp(tb, k);
    // never a frozen frame: a slow orbit + breathing dolly around the target, plus a light handheld drift
    var off = pos.clone().sub(tgt), ang = .07 * Math.sin(t * .42) + .05 * Math.sin(t * .23 + 1);
    off.applyAxisAngle(V(0, 1, 0), ang).multiplyScalar(1 - .045 * Math.sin(t * .31));
    cam.position.copy(tgt).add(off); cam.fov = lerp(a[4], b[4], k); cam.updateProjectionMatrix();
    cam.position.x += Math.sin(t * .7) * .04; cam.position.y += Math.sin(t * .53) * .03;
    cam.lookAt(tgt);
  }
  // shots marked "follow" are written relative to where the car stood when the scene began
  function rel(s, i, t) {
    var v = s[i], base = s[0] < 8 ? Y0 : s[0] < 13 ? 15 : 0;
    var dy = s[6] ? (s[0] >= 13 && s[0] < 16 ? carY(t) : carY(t) - base) : 0;
    return V(v[0], v[1] + dy, v[2]);
  }

  window.__project = function (name) {
    var t = window.__t || 0, p;
    if (name === "car") p = V(CX, carY(t) + CH / 2, CD / 2);
    else if (name === "carTop") p = V(CX + .2, carY(t) + CH + .55, 0);
    else if (name === "rope1") p = V(CX + .05, carY(t) + CH + 1.6, .05);
    else if (name === "sheave") p = V(SHX, SHY + SHR + .3, 0);
    else if (name === "cw") p = V(1.1, 21 - carY(t) + 1.0, -.45);
    else if (name === "motor") p = V(SHX, SHY - .1, -.75);
    else if (name === "railL") p = V(RLX, carY(t) + 4.2, 0);
    else if (name === "railR") p = V(RRX, cam.position.y + .6, 0);
    else if (name === "gov") p = V(GX + GR, GY + .5, GZ);
    else if (name === "govRope") p = V(GX, cam.position.y - 1.6, GZ);
    else if (name === "arm") p = V(RLX + .45, carY(t) - .05, .6);
    else if (name === "wedge") p = V(RLX + .12, carY(t) - .32, 0);
    else if (name === "door") p = V(CX, DY + 1.1, SZ1 + .25);
    else if (name === "lock") p = V(CX + .1, DY + 2.5, SZ1 + .3);
    else if (name === "otis") p = V(60.2, otisPlatY(t) + 1.9, .1);
    else return null;
    p.project(cam); return [(p.x + 1) * 180, (1 - p.y) * 320, p.z];
  };

  function otisPlatY(t) {
    var cut = L(20) - .1;
    if (t < cut) return lerp(1.2, 6.0, sm(L(19) + .5, L(19) + 4.0, t));
    var e = Math.min(t - cut, .22); return 6.0 - 12 * e * e;
  }

  window.__carY = carY; window.__HALT = HALT; window.__BRAKE = BRAKE;
  window.__speed = function (t) { return (carY(t + .02) - carY(t - .02)) / .04; };

  window.__world = function (t) {
    window.__t = t;
    var y = carY(t), cut = ropesCut(t);
    car.position.y = y; underL.position.set(CX + .3, y - .9, 1.0); underL.intensity = t > L(13) - .2 && t < L(15) ? 1.4 : 0; cw.position.y = 21 - (cut ? (t < L(3) ? Y0 : 15) : y);
    // traction sheave turns with the car
    sheave.rotation.z = (y - Y0) / SHR;
    // hoist ropes
    var since = cut ? t - (t < L(3) ? CUT1 : DROP) : 0;
    ROPES.forEach(function (r, k) {
      var hitY = y + CH + .45, topY = SHY, cwTop = 21 - (cut ? (t < L(3) ? Y0 : 15) : y) + 2.0;
      if (!cut) {
        placeRope(r.up, CX + (k - 2.5) * .015, hitY, CX, topY, r.z); r.up.visible = true;
        placeRope(r.cw, 1.1, cwTop, 1.1, topY, r.z - .45 + .25); r.stub.visible = false;
      } else {                                                  // snapped: upper part whips up, a stub stays on the car
        var whip = Math.min(1, since / .35), lowEnd = lerp(hitY + 1.2, topY - .6, whip);
        placeRope(r.up, CX + Math.sin(k + since * 9) * .08 * (1 - whip), lowEnd, CX, topY, r.z);
        placeRope(r.cw, 1.1, cwTop, 1.1, topY, r.z - .45 + .25);
        r.stub.visible = true; r.stub.position.set(CX + Math.sin(k * 1.7 + t * 6) * .05, hitY + .6, r.z); r.stub.rotation.z = Math.sin(k + t * 5) * .15;
      }
      var hi = t > L(6) && t < L(7) - .1 && k === 2, red = (t > L(9) && t < L(10)) || (cut && since < .5);
      var others = t > L(6) && t < L(7) - .1 && k !== 2;
      var m = hi ? ropeHi : red ? ropeRed : ropeM;
      r.up.material = m; r.stub.material = m; r.cw.material = hi ? ropeM : m;
      r.up.visible = !others || (Math.sin(t) > 9); r.stub.visible = r.stub.visible && !others;
    });
    // glows
    function pulse(a, b) { var o = Math.min(clamp((t - a) / .3), clamp((b - t) / .3)); return o * (.55 + .25 * Math.sin(t * 6)); }
    carGlow.opacity = pulse(L(0) + .3, L(0) + 2.6) * .35;
    cwGlow.opacity = pulse(L(7) + 2.2, L(8) + 2.5) * .6;
    motorGlow.opacity = pulse(L(8) + 2.2, L(9) - .1) * .6;
    railGlow.opacity = pulse(L(10) + .3, L(11) - .1) * .45;
    govGlow.material.opacity = pulse(L(11) + .4, L(13)) * .9;
    govRopeGlow.opacity = pulse(L(11) + 2.0, L(14)) * .4;
    armGlow.material.opacity = pulse(L(13) + .8, L(14) + 1.2) * .7;
    wedgeGlow.opacity = Math.max(pulse(L(14) + .6, L(15)), pulse(GRAB1 - .1, L(3) - .1)) * .8;
    lockGlow.material.opacity = 0;
    // governor wheel + its rope move with the car until the governor locks
    var gl = t >= LOCK && t < L(16) - .3, gy = gl ? carY(LOCK) : y;
    govWheel.rotation.z = gl ? (carY(LOCK) - Y0) / GR : (y - Y0) / GR;
    if (t > L(12) && t < LOCK) govWheel.rotation.z += Math.sin(t * 40) * .02;
    beads.forEach(function (be, k) {
      var u = (((k / beads.length) * (TOP - PIT) + (gy - Y0)) % (TOP - PIT) + (TOP - PIT)) % (TOP - PIT);
      be.position.set(GX, PIT + u, GZ + .02); be.visible = t > L(11) + 2.0 && t < L(15);
    });
    // linkage arm lifts as the car keeps going after the governor locked; wedges rise into the rails
    var armK = t >= LOCK && t < L(16) - .3 ? clamp((t - (L(13) + 1.2)) / 1.6) : 0;
    arm.rotation.z = armK * .55;
    var wk = Math.max(t >= L(14) + .9 && t < L(16) - .3 ? clamp((t - (L(14) + .9)) / .6) : 0, t >= GRAB1 - .15 && t < L(3) ? clamp((t - GRAB1 + .15) / .2) : 0);
    wedges.forEach(function (w) { w.wd.position.y = -.04 + wk * .14; w.wd.material = wk > .5 ? wedgeHot : wedgeM; });
    // sparks while the wedges bite
    var sp = Math.max(clamp(1 - Math.abs(t - (BRAKE + .3)) / .7), t < L(3) ? clamp(1 - Math.abs(t - (GRAB1 + .1)) / .4) : 0);
    sparks.material.opacity = sp; sparks.visible = sp > 0;
    if (sp > 0) for (var i = 0; i < NS; i++) {
      var side = i % 2 ? RLX : RRX, life = ((i * .137 + t * 3) % 1);
      sparkP[i * 3] = side + (i % 2 ? 1 : -1) * life * .5 * Math.cos(i); sparkP[i * 3 + 1] = y - .25 - life * life * .8; sparkP[i * 3 + 2] = Math.sin(i * 3.1) * life * .4;
    }
    sparkG.attributes.position.needsUpdate = true;
    // front wall + landing doors only around the door scene
    var doorScene = t > L(16) - .3 && t < L(19) - .2;
    front.visible = doorScene; cLight.intensity = doorScene ? 1.1 : 0;
    var xray = Math.max(pulse(L(16) + 1.2, L(17)), 0) ;
    frontM.opacity = 1 - .8 * clamp(xray / .55); doorM.opacity = 1 - .75 * clamp(xray / .55);
    frontM.depthWrite = doorM.depthWrite = frontM.opacity > .99;
    hook.rotation.z = -.9 * sm(L(17) + 3.0, L(17) + 3.4, t);
    var open = sm(L(18) - .2, L(18) + .9, t);
    doorL.position.x = CX - .28 - open * .55; doorR.position.x = CX + .28 + open * .55;
    callBtn.material.color.setHex(t > L(17) + 3.2 ? 0x4ade80 : 0xffd08a);
    // Otis
    var ot = t > L(19) - .3 && t < L(21) - .2; otis.visible = ot; otisLight.intensity = ot ? 1.2 : 0;
    var oy = otisPlatY(t); plat.position.y = oy;
    var otCut = t > L(20) - .1;
    placeRope(otRope, 0, otCut ? lerp(oy + 1.2, 8.4, clamp((t - L(20) + .1) / .3)) : oy + 1.1, 0, 9.0, 0);
    otStub.visible = otCut; otStub.position.set(0, oy + 1.5, 0);
    armUp.rotation.z = -.6 - .5 * sm(L(19) + 4.6, L(19) + 5.2, t);
    crowd.forEach(function (c, k) { c.position.y = otCut ? Math.max(0, Math.sin((t - L(20)) * 9 + k) * .06) : 0; });
    canvas.style.filter = ot ? "sepia(.75) contrast(1.05) brightness(1.02)" : "none";
    scene.fog.far = ot ? 90 : 40; scene.background.setHex(ot ? 0x8d7a5f : 0x0e171e); scene.fog.color.setHex(ot ? 0x8d7a5f : 0x0e171e);
    shaft.visible = car.visible = cw.visible = machine.visible = !ot;
    camAt(t);
    R.render(scene, cam);
  };
})();
