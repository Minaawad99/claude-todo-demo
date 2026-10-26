/* «إزاي التلاجة بتبرّد؟» — real 3D world (three.js r149), a pure function of time.
   Units ≈ decimetres. The fridge's door faces −X, its back faces +X, the side facing +Z is cut away.
   Colours keep the brand's meanings: hot gas / heat red, cold gas / cold air blue, moving parts olive. */
(function () {
  var T3 = THREE, LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, t) { return easeIO((t - a) / (b - a)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function V(x, y, z) { return new T3.Vector3(x, y, z); }
  var C = { ink: 0x2b2620, heat: 0xc7502f, water: 0x2f6f9f, olive: 0x8a9a5b, khaki: 0xc9bd9c, paper: 0xece4d0, white: 0xf4f1ea };
  function mat(c, o) { return new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0.04 }, o || {})); }

  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false); R.outputEncoding = T3.sRGBEncoding;
  var scene = new T3.Scene(); scene.background = new T3.Color(0xddd3b9);
  var cam = new T3.PerspectiveCamera(38, 360 / 640, 0.5, 600);
  scene.add(new T3.HemisphereLight(0xfff8ea, 0x7d735c, 0.5));
  var sun = new T3.DirectionalLight(0xfff2dc, 1.15); sun.position.set(-30, 60, 50); scene.add(sun);
  var fill = new T3.DirectionalLight(0xdfe9f2, 0.35); fill.position.set(40, 20, -30); scene.add(fill);

  // ── kitchen: floor tiles + wall ───────────────────────────────
  var kitchen = new T3.Group(); scene.add(kitchen);
  (function () {
    var cv = document.createElement("canvas"); cv.width = cv.height = 256; var x = cv.getContext("2d");
    x.fillStyle = "#e3d9c0"; x.fillRect(0, 0, 256, 256); x.fillStyle = "#d6caac"; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128);
    var tex = new T3.CanvasTexture(cv); tex.wrapS = tex.wrapT = T3.RepeatWrapping; tex.repeat.set(12, 12); tex.encoding = T3.sRGBEncoding;
    var fl = new T3.Mesh(new T3.PlaneGeometry(160, 160), new T3.MeshStandardMaterial({ map: tex, roughness: .9 })); fl.rotation.x = -Math.PI / 2; kitchen.add(fl);
    var wall = new T3.Mesh(new T3.PlaneGeometry(160, 60), mat(0xd9cfb4, { roughness: 1 })); wall.position.set(0, 30, -18); kitchen.add(wall);
    var counter = new T3.Mesh(new T3.BoxGeometry(22, 9, 7), mat(0xc9bd9c)); counter.position.set(-20, 4.5, -12); kitchen.add(counter);
    var top = new T3.Mesh(new T3.BoxGeometry(23, 0.8, 8), mat(0x8d877c)); top.position.set(-20, 9.4, -12); kitchen.add(top);
  })();

  // ── the fridge ───────────────────────────────────────────────
  var X0 = -3.5, X1 = 3.5, Z0 = -3.5, Z1 = 3.5, YB = 1.0, YD = 12.6, YT = 18, TH = 0.35;
  var fr = new T3.Group(); scene.add(fr);
  var shell = mat(0xe4ded1, { roughness: .35, metalness: .1 }), inner = mat(0xf7f4ee, { roughness: .5 }), cutM = mat(0xc9bd9c, { roughness: .8 });
  function box(w, h, d, m, x, y, z, parent) { var b = new T3.Mesh(new T3.BoxGeometry(w, h, d), m); b.position.set(x, y, z); (parent || fr).add(b); return b; }
  box(X1 - X0, YT, TH, shell, 0, YT / 2, Z0 + TH / 2);                 // far side wall
  box(TH, YT, Z1 - Z0, shell, X1 - TH / 2, YT / 2, 0);                  // back wall
  box(X1 - X0, TH, Z1 - Z0, shell, 0, YT - TH / 2, 0);                  // top
  box(X1 - X0, YB, Z1 - Z0, shell, 0, YB / 2, 0);                       // base
  box(X1 - X0 - TH, 0.4, Z1 - Z0 - TH, inner, -TH / 2, YD, -TH / 2);    // divider
  // cut edges (the sliced wall thickness, khaki like the drawings)
  [[X1 - TH / 2, YT / 2, TH, YT], [0, YT - TH / 2, X1 - X0, TH], [0, YB / 2, X1 - X0, YB], [-TH / 2, YD, X1 - X0 - TH, 0.4]].forEach(function (c) { box(c[2], c[3], 0.05, cutM, c[0], c[1], Z1 + 0.02); });
  // door, hinged on the far edge (−X side); opens around Y
  var doorPiv = new T3.Group(); doorPiv.position.set(X0, 0, Z0); fr.add(doorPiv);
  var door = new T3.Group(); doorPiv.add(door); door.position.set(0, 0, 0);
  box(TH, YT, Z1 - Z0, shell, -TH / 2, YT / 2, (Z1 - Z0) / 2, door);
  box(0.12, YT - 0.6, Z1 - Z0 - 0.4, mat(0x3b352e, { roughness: .9 }), 0.05, YT / 2, (Z1 - Z0) / 2, door);   // gasket
  box(0.1, YT - 1.0, Z1 - Z0 - 0.8, inner, 0.12, YT / 2, (Z1 - Z0) / 2, door);
  var handle = box(0.4, 5, 0.4, mat(0x8d877c, { metalness: .5, roughness: .3 }), -TH - 0.3, 9, Z1 - Z0 - 0.6, door);
  [[4, 3], [8.5, 2], [14.5, 2]].forEach(function (b) {
    box(1.2, 1.2, Z1 - Z0 - 1.2, mat(0xcfe1ec, { transparent: true, opacity: .6, roughness: .2 }), 0.8, b[0], (Z1 - Z0) / 2, door);
    for (var k = 0; k < b[1]; k++) { var bt = new T3.Mesh(new T3.CylinderGeometry(0.42, 0.42, 2.6, 16), mat([0x8a9a5b, 0xc7502f, 0xe8c64a][k % 3], { roughness: .3 })); bt.position.set(0.8, b[0] + 1.6, 1.4 + k * 1.6); door.add(bt); }
  });
  // shelves + food
  var glassM = new T3.MeshStandardMaterial({ color: 0xcfe1ec, transparent: true, opacity: .45, roughness: .1 });
  [5.2, 8.8].forEach(function (y) { box(X1 - X0 - 0.8, 0.12, Z1 - Z0 - 0.6, glassM, -0.2, y, -0.1); });
  box(3, 1.8, 3.2, mat(0x9fb07a, { transparent: true, opacity: .85 }), -1, YB + 0.9, -1.2);             // veg drawer
  [[1.4, YB + 0.7, 1.5], [2.0, YB + 0.7, 0.4], [1.0, YB + 0.7, 0.2]].forEach(function (p) { var s = new T3.Mesh(new T3.SphereGeometry(0.7, 18, 12), mat(C.heat, { roughness: .4 })); s.position.set(p[0], p[1], p[2]); fr.add(s); });
  box(2.2, 1.2, 1.6, mat(0xf2dc85), -1.5, 5.9, -1.5); box(1.6, 2.4, 1.6, mat(0xf4f1ea), 1.4, 6.5, -1.8);   // cheese, milk
  var jar = new T3.Mesh(new T3.CylinderGeometry(0.8, 0.8, 1.6, 20), mat(0xe8c64a, { transparent: true, opacity: .9 })); jar.position.set(0, 6.1, 1.2); fr.add(jar);
  box(2.6, 1.0, 2.4, mat(0xe9b6a0), -1, 9.4, -1); [[1.5, 0], [1.5, 1.6]].forEach(function (p) { var b = new T3.Mesh(new T3.CylinderGeometry(0.45, 0.45, 2.8, 14), mat(0x8a9a5b)); b.position.set(p[0], 10.3, p[1] - 1.8); fr.add(b); });
  box(3.4, 0.8, 2.4, mat(0xe6f1f7, { roughness: .2 }), -0.8, YD + 0.6, -0.6); box(1.8, 1.6, 1.8, mat(0xf4f1ea), 1.6, YD + 1.0, 0.8);   // ice tray, frozen box
  // thermostat on the far wall (between the shelves)
  var thermo = new T3.Group(); thermo.position.set(-1.6, 10.8, Z0 + TH + 0.2); fr.add(thermo);
  thermo.add(new T3.Mesh(new T3.BoxGeometry(2.0, 1.3, 0.4), mat(0xf4f1ea)));
  var dialG = new T3.Mesh(new T3.CylinderGeometry(0.45, 0.45, 0.2, 24), mat(0xe9e1cc)); dialG.rotation.x = Math.PI / 2; dialG.position.set(0.4, 0, 0.25); thermo.add(dialG);
  var needle = new T3.Mesh(new T3.BoxGeometry(0.08, 0.42, 0.06), mat(C.heat)); needle.position.set(0.4, 0, 0.38); thermo.add(needle);
  var thermoLed = new T3.Mesh(new T3.SphereGeometry(0.14, 10, 8), mat(0x8a9a5b, { emissive: 0x8a9a5b, emissiveIntensity: .8 })); thermoLed.position.set(-0.5, 0, 0.25); thermo.add(thermoLed);

  // ── the refrigerant loop: tubes + paths ─────────────────────────
  function tube(points, r, m) { var c = new T3.CatmullRomCurve3(points, false, "catmullrom", 0.05); var t = new T3.Mesh(new T3.TubeGeometry(c, Math.max(24, points.length * 12), r, 10, false), m); fr.add(t); return c; }
  var hotM = mat(0xd98a6e, { roughness: .35, metalness: .3 }), coldM = mat(0x8fb3cf, { roughness: .35, metalness: .3 }), capM = mat(0x8a9a5b, { metalness: .4 });
  var cond = [], evap = [], k;
  for (k = 0; k < 12; k++) { var y = 2.2 + k * 1.3; cond.push(V(X1 + 0.35, y, k % 2 ? 2.8 : -2.8)); cond.push(V(X1 + 0.35, y, k % 2 ? -2.8 : 2.8)); }
  for (k = 0; k < 6; k++) { var y2 = YD + 0.9 + k * 0.75; evap.push(V(k % 2 ? 2.5 : -2.6, y2, Z0 + TH + 0.2)); evap.push(V(k % 2 ? -2.6 : 2.5, y2, Z0 + TH + 0.2)); }
  var discharge = [V(5.4, 1.4, 0.4), V(4.4, 1.2, 2.6), V(X1 + 0.35, 1.6, 2.8), V(X1 + 0.35, 2.2, 2.8)];
  var capPts = [cond[cond.length - 1].clone(), V(X1 + 0.35, YT - 0.6, -3.0), V(X1 - 0.6, YT - 0.6, Z0 + 0.6), evap[0].clone().add(V(0.6, 0.2, 0))];
  var suction = [evap[evap.length - 1].clone(), V(X1 - 0.6, YD + 0.4, Z0 + 0.6), V(X1 - 0.6, 1.4, Z0 + 0.6), V(5.0, 1.0, -1.0), V(5.4, 1.4, 0.4)];
  function poly(pts) { return new T3.CatmullRomCurve3(pts, false, "catmullrom", 0.02); }
  for (k = -2.6; k <= 2.6; k += 0.9) box(0.06, 14, 0.06, mat(0x8d877c, { metalness: .5 }), X1 + 0.45, 9.6, k);   // condenser wires
  var cCond = poly(cond), cEvap = poly(evap), cDis = poly(discharge), cCap = poly(capPts), cSuc = poly(suction);
  [[cond, hotM, 0.17], [discharge, hotM, 0.17], [evap, coldM, 0.17], [suction, coldM, 0.15]].forEach(function (p) { tube(p[0], p[2], p[1]); });
  tube(capPts, 0.06, capM);
  var frost = new T3.Mesh(new T3.PlaneGeometry(5.8, 4.8), new T3.MeshStandardMaterial({ color: 0xe6f1f7, transparent: true, opacity: .7, roughness: .9 })); frost.position.set(0, YD + 2.8, Z0 + TH + 0.02); fr.add(frost);
  // compressor: a black dome behind the bottom
  var comp = new T3.Group(); comp.position.set(5.4, 0, 0.2); fr.add(comp);
  var dome = new T3.Mesh(new T3.CapsuleGeometry(1.2, 0.9, 8, 20), mat(0x3b352e, { roughness: .45, metalness: .3 })); dome.position.y = 1.5; comp.add(dome);
  var compBase = new T3.Mesh(new T3.BoxGeometry(3.2, 0.3, 2.6), mat(0x5d574d)); compBase.position.y = 0.15; comp.add(compBase);
  // fan in the freezer
  var fan = new T3.Group(); fan.position.set(-0.6, YD + 2.7, Z0 + TH + 0.5); fr.add(fan);
  var fanRing = new T3.Mesh(new T3.TorusGeometry(1.0, 0.1, 8, 28), mat(0xd7d3c9)); fan.add(fanRing);
  var blades = new T3.Group(); fan.add(blades);
  for (k = 0; k < 4; k++) { var bl = new T3.Mesh(new T3.BoxGeometry(0.85, 0.32, 0.05), mat(C.olive)); bl.position.x = 0.45; bl.rotation.x = 0.4; var h = new T3.Group(); h.rotation.z = k * Math.PI / 2; h.add(bl); blades.add(h); }
  blades.add(new T3.Mesh(new T3.CylinderGeometry(0.2, 0.2, 0.2, 12), mat(0xf4f1ea)).rotateX(Math.PI / 2));

  // ── particles on the loop + heat + cold air ───────────────────
  var dotGeo = new T3.SphereGeometry(1, 10, 8);
  function dots(n, color) { var m = new T3.InstancedMesh(dotGeo, new T3.MeshBasicMaterial({ color: color }), n); m.frustumCulled = false; scene.add(m); return m; }
  var dummy = new T3.Object3D();
  function put(m, i, p, s) { dummy.position.copy(p); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }
  var loops = [{ c: cDis, n: 6, col: "hot", sp: 0.5 }, { c: cCond, n: 34, col: "hot", sp: 0.07 }, { c: cCap, n: 8, col: "warm", sp: 0.25 }, { c: cEvap, n: 22, col: "cold", sp: 0.1 }, { c: cSuc, n: 14, col: "cold", sp: 0.18 }];
  var DOTN = loops.reduce(function (a, l) { return a + l.n; }, 0);
  var dHot = dots(DOTN, 0xd8452a), dWarm = dots(DOTN, 0xe48a5a), dCold = dots(DOTN, 0x2f6f9f);
  var HN = 60, dHeat = dots(HN, 0xf08a3c), AN = 40, dAir = dots(AN, 0xa9cbe2), FN = 16, dFood = dots(FN, 0xf08a3c);

  // ── close-up worlds (each shown alone) ─────────────────────────
  var cu = {}; ["glass", "hand", "pump", "cap"].forEach(function (n, i) { var g = new T3.Group(); g.position.set(0, 300 + i * 80, 0); scene.add(g); cu[n] = g; });
  (function () {
    var g = cu.glass;
    var gl = new T3.Mesh(new T3.CylinderGeometry(3, 2.6, 8, 40, 1, true), new T3.MeshStandardMaterial({ color: 0xdbeaf2, transparent: true, opacity: .35, side: T3.DoubleSide, roughness: .05 })); gl.position.y = 4; g.add(gl);
    var liq = new T3.Mesh(new T3.CylinderGeometry(2.8, 2.6, 4.6, 40), mat(0x6f9fc4, { transparent: true, opacity: .85, roughness: .2 })); liq.position.y = 2.4; g.add(liq);
    var base = new T3.Mesh(new T3.CylinderGeometry(2.6, 2.6, 0.3, 40), mat(0xdbeaf2, { transparent: true, opacity: .5 })); base.position.y = 0.15; g.add(base);
    var tbl = new T3.Mesh(new T3.BoxGeometry(16, 0.6, 10), mat(0xc9bd9c)); tbl.position.y = -0.3; g.add(tbl);
  })();
  var bub = dots(40, 0xffffff), vap = dots(30, 0xe6f1f7), gHeat = dots(20, 0xf08a3c);
  var handG = new T3.Group(); cu.hand.add(handG);
  (function () {
    var skin = mat(0xd9a982, { roughness: .7 });
    var palm = new T3.Mesh(new T3.CapsuleGeometry(2.0, 2.6, 6, 16), skin); palm.scale.set(1.25, 0.4, 1); palm.rotation.z = Math.PI / 2; handG.add(palm);
    for (var f = 0; f < 4; f++) { var fg = new T3.Mesh(new T3.CapsuleGeometry(0.5, 3.0, 4, 10), skin); fg.rotation.z = Math.PI / 2; fg.position.set(4.6, 0, -1.6 + f * 1.05); handG.add(fg); }
    var th = new T3.Mesh(new T3.CapsuleGeometry(0.6, 2.2, 4, 10), skin); th.rotation.set(0, 0.9, Math.PI / 2); th.position.set(0.6, 0, 3.0); handG.add(th);
    var arm = new T3.Mesh(new T3.CapsuleGeometry(1.6, 6, 6, 14), skin); arm.rotation.z = Math.PI / 2; arm.position.set(-6.5, -0.2, 0); handG.add(arm);
  })();
  var drops = []; [[-1, 0.9, -0.8], [0.8, 0.9, 0.6], [1.8, 0.9, -0.6]].forEach(function (p) { var d = new T3.Mesh(new T3.SphereGeometry(0.6, 16, 10), mat(0x9cc3dc, { transparent: true, opacity: .8, roughness: .1 })); d.scale.y = 0.35; d.position.set(p[0], p[1], p[2]); handG.add(d); drops.push(d); });
  var pumpHandle = new T3.Group(); var pumpHot;
  (function () {
    var g = cu.pump;
    g.add(new T3.Mesh(new T3.BoxGeometry(8, 0.5, 3), mat(0x8d877c)));
    var barrel = new T3.Mesh(new T3.CylinderGeometry(1.2, 1.2, 9, 28), mat(0xd7d3c9, { metalness: .4, roughness: .3 })); barrel.position.y = 4.8; g.add(barrel);
    pumpHot = new T3.Mesh(new T3.CylinderGeometry(1.26, 1.26, 3, 28), mat(C.heat, { emissive: C.heat, emissiveIntensity: 0, transparent: true, opacity: 0 })); pumpHot.position.y = 1.8; g.add(pumpHot);
    pumpHandle.position.y = 9.3; g.add(pumpHandle);
    var rod = new T3.Mesh(new T3.CylinderGeometry(0.25, 0.25, 4, 12), mat(0x8d877c, { metalness: .5 })); rod.position.y = 2; pumpHandle.add(rod);
    var bar = new T3.Mesh(new T3.CapsuleGeometry(0.45, 5, 6, 12), mat(C.olive)); bar.rotation.z = Math.PI / 2; bar.position.y = 4.2; pumpHandle.add(bar);
    var hose = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3([V(1.2, 1, 0), V(3, 0.6, 1), V(5, 1.2, 0)]), 20, 0.25, 8), mat(0x3b352e)); g.add(hose);
  })();
  var pHeat = dots(16, 0xf08a3c);
  (function () {
    var g = cu.cap;
    var big1 = new T3.Mesh(new T3.CylinderGeometry(1.1, 1.1, 8, 28, 1, true), new T3.MeshStandardMaterial({ color: 0xd98a6e, transparent: true, opacity: .5, side: T3.DoubleSide })); big1.rotation.z = Math.PI / 2; big1.position.x = -6; g.add(big1);
    var thin = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.22, 4, 14), mat(C.olive, { metalness: .4 })); thin.rotation.z = Math.PI / 2; g.add(thin);
    var cone1 = new T3.Mesh(new T3.CylinderGeometry(0.22, 1.1, 1, 28, 1, true), new T3.MeshStandardMaterial({ color: 0xd98a6e, transparent: true, opacity: .5, side: T3.DoubleSide })); cone1.rotation.z = -Math.PI / 2; cone1.position.x = -2.5; g.add(cone1);
    var big2 = new T3.Mesh(new T3.CylinderGeometry(1.1, 1.1, 8, 28, 1, true), new T3.MeshStandardMaterial({ color: 0x8fb3cf, transparent: true, opacity: .5, side: T3.DoubleSide })); big2.rotation.z = Math.PI / 2; big2.position.x = 6; g.add(big2);
    var cone2 = new T3.Mesh(new T3.CylinderGeometry(1.1, 0.22, 1, 28, 1, true), new T3.MeshStandardMaterial({ color: 0x8fb3cf, transparent: true, opacity: .5, side: T3.DoubleSide })); cone2.rotation.z = -Math.PI / 2; cone2.position.x = 2.5; g.add(cone2);
  })();
  var cDots = dots(50, 0xd8452a), cDots2 = dots(50, 0x2f6f9f);

  // ── what shows when + camera ──────────────────────────────────
  function mode(t) {
    if (t > L(6) + 0.1 && t < L(8) - 0.1) return "glass";
    if (t > L(8) - 0.1 && t < L(9) - 0.1) return "hand";
    if (t > L(13) - 0.1 && t < L(14) - 0.1) return "pump";
    if (t > L(18) + 1.3 && t < L(20) + 1.5) return "cap";
    return "main";
  }
  var SH = {
    main: [[0, V(-26, 12, 26), V(0, 8.5, 0), 36], [L(1), V(-22, 11, 18), V(-2, 8.5, 0), 36], [L(2), V(24, 12, 24), V(1, 8.5, 0), 36],
           [L(4), V(-3, 16.5, 12), V(0, 15, -2), 40], [L(5), V(-2, 16, 9), V(0, 15.4, -2.6), 40], [L(9), V(22, 13, 22), V(1, 8.5, 0), 36],
           [L(10), V(13, 5, 10), V(5.2, 1.6, 0.2), 36], [L(12), V(11, 4, 8), V(5, 1.6, 0.6), 36], [L(14), V(22, 10, 8), V(3.8, 9, 0), 38],
           [L(15), V(18, 7, 10), V(3.8, 8, 0), 38], [L(17), V(14, 4, 9), V(3.8, 3.5, 1), 38], [L(18), V(12, 19, 6), V(3.4, 17, -2.4), 38],
           [L(20) + 1.5, V(-2, 16.5, 10), V(0, 15.2, -2.6), 40], [L(22), V(2, 11, 15), V(0, 10, -1.5), 40], [L(23), V(-1, 15.6, 7), V(-0.6, 15.3, -3), 40],
           [L(24), V(22, 13, 22), V(1, 8.5, 0), 36], [L(27), V(-2, 11.5, 7), V(-1.6, 10.8, -3), 40], [L(29) + 1.0, V(1, 9, 14), V(0, 8, -1), 40],
           [L(30), V(-1, 16, 10), V(0, 14.8, -2), 40], [L(31), V(13, 5, 10), V(5.2, 1.6, 0.2), 36], [L(32), V(-18, 10, 14), V(-3.5, 9, 0), 38],
           [L(33), V(26, 14, 18), V(2, 9, 0), 36], [L(34), V(20, 10, 6), V(3.8, 9, 0), 38], [L(35), V(-14, 12, 26), V(0, 9, 0), 36], [L(36), V(24, 13, 24), V(1, 9, 0), 36]],
    glass: [[L(6), V(6, 9, 13), V(0, 3, 0), 38], [L(7), V(-5, 8, 13), V(0, 3.5, 0), 38]],
    hand: [[L(8), V(5, 8, 10), V(0.5, 0.5, 0), 38]],
    pump: [[L(13), V(8, 8, 13), V(0, 5.5, 0), 38]],
    cap: [[L(18), V(0, 4, 15), V(0, 0, 0), 40], [L(19), V(3, 3, 13), V(1.5, 0, 0), 40]]
  };
  function shot(list, t) {
    var a = list[0], b = list[0];
    for (var i = 0; i < list.length; i++) if (list[i][0] <= t) { a = list[i - 1] || list[i]; b = list[i]; }
    var k = easeIO((t - b[0]) / 1.0); if (t < b[0]) k = 0;
    return { pos: a[1].clone().lerp(b[1], k), tgt: a[2].clone().lerp(b[2], k), fov: lerp(a[3], b[3], k) };
  }
  function running(t) { return !(t > L(29) + 1.2 && t < L(31) + 0.2); }

  // projected anchors for the HTML labels
  var anchors = { comp: [fr, V(5.4, 3.6, 0.2)], cond: [fr, V(X1 + 0.4, 15.5, 0)], cap: [fr, V(X1, YT + 0.6, -2.4)], evap: [fr, V(0, YD + 5.0, Z0 + 0.5)],
    fan: [fr, V(-0.6, YD + 4.0, Z0 + 0.6)], thermo: [fr, V(-1.6, 12.0, Z0 + 0.5)], gasket: [fr, V(X0 - 0.2, 15.5, 1.5)], back: [fr, V(X1 + 0.6, 19.5, 0)],
    gas: [fr, V(0, YD + 5.0, Z0 + 0.5)], glass: [cu.glass, V(0, 9.4, 0)], hand: [cu.hand, V(0, 3.2, 0)], pump: [cu.pump, V(0, 15, 0)],
    capHi: [cu.cap, V(-6, 2.2, 0)], capLo: [cu.cap, V(6, 2.2, 0)], capThin: [cu.cap, V(0, 1.4, 0)] };
  var tmpV = new T3.Vector3();
  window.__project = function (name) {
    var a = anchors[name]; if (!a) return null;
    a[0].updateWorldMatrix(true, false); tmpV.copy(a[1]).applyMatrix4(a[0].matrixWorld).project(cam);
    return [(tmpV.x * 0.5 + 0.5) * 360, (1 - (tmpV.y * 0.5 + 0.5)) * 640, tmpV.z];
  };
  window.__mode = mode;

  window.__world = function (t) {
    var m = mode(t), sh = shot(SH[m], t), base = m === "main" ? V(0, 0, 0) : cu[m].position.clone();
    fr.visible = kitchen.visible = m === "main";
    Object.keys(cu).forEach(function (n) { cu[n].visible = n === m; });
    var run = running(t) && t > L(10) - 0.5;
    // door: opens on line 1, closes on 2; swings a little on 32 and wide on 35
    var open = smooth(L(1) + 0.3, L(1) + 1.2, t) * (1 - smooth(L(2) + 1.2, L(2) + 2.0, t)) * 1.6
             + smooth(L(32) + 0.2, L(32) + 1.0, t) * (1 - smooth(L(32) + 2.0, L(32) + 2.6, t)) * 0.7
             + smooth(L(35) + 0.2, L(35) + 1.2, t) * (1 - smooth(L(36) + 1.2, L(36) + 2.0, t)) * 1.4;
    doorPiv.rotation.y = open;
    blades.rotation.z = t * 9;
    dome.position.x = run ? Math.sin(t * 70) * 0.03 : 0;
    var dial = clamp((t - L(29) - 0.4) / 0.8) * (1 - clamp((t - L(31)) / 0.6));
    needle.rotation.z = -0.8 + 1.4 * dial; thermoLed.material.emissiveIntensity = run ? 0.8 : 0.05; thermoLed.material.color.setHex(run ? 0x8a9a5b : 0x5d574d);
    // refrigerant dots: which parts of the loop are lit when
    var i = 0;
    function lit(l) {
      if (!run) return 0;
      if (t < L(9)) return 0;
      if (t < L(10)) return 0.8;
      if (t < L(24)) {
        if (l.c === cDis) return t > L(12) ? 1 : 0;
        if (l.c === cCond) return t > L(14) ? 1 : 0;
        if (l.c === cCap) return t > L(18) ? 1 : 0;
        if (l.c === cEvap) return t > L(20) ? 1 : 0;
        if (l.c === cSuc) return t > L(23) + 1.0 ? 1 : 0;
      }
      return 1;
    }
    loops.forEach(function (l) {
      var on = lit(l);
      for (var k = 0; k < l.n; k++) {
        var u = ((k / l.n + t * l.sp) % 1 + 1) % 1, p = l.c.getPointAt(u), s = on * 0.24;
        put(dHot, i, p, l.col === "hot" ? s : 0); put(dWarm, i, p, l.col === "warm" ? s : 0); put(dCold, i, p, l.col === "cold" ? s : 0); i++;
      }
    });
    [dHot, dWarm, dCold].forEach(function (d) { d.instanceMatrix.needsUpdate = true; });
    // heat rising off the back (kitchen gets warm) when the loop runs and on the key lines
    var heatOn = (t > L(1) + 0.8 && t < L(3)) || (t > L(15) && t < L(18)) || (t > L(24) + 0.5 && running(t)) ? 1 : 0;
    for (var h = 0; h < HN; h++) {
      var u2 = ((h * 0.618 + t * 0.25) % 1), zz = -2.8 + (h % 7) * 0.93, yy = 2 + (h * 2.3) % 14 + u2 * 8;
      put(dHeat, h, V(X1 + 0.8 + u2 * 4 + Math.sin(t * 3 + h) * 0.3, yy, zz), heatOn * 0.2 * Math.sin(Math.PI * u2));
    }
    dHeat.instanceMatrix.needsUpdate = true;
    // cold air from the fan over the shelves (from 23) and heat leaving the food (22)
    var airOn = t > L(23) + 0.4 && running(t) ? 1 : 0;
    for (var a = 0; a < AN; a++) { var u3 = ((a * 0.37 + t * 0.22) % 1); put(dAir, a, V(-0.6 + Math.sin(a) * 2.2 * u3, YD + 2.2 - u3 * 11, Z0 + 1 + u3 * 5 + (a % 3) * 0.4), airOn * 0.16); }
    dAir.instanceMatrix.needsUpdate = true;
    var foodOn = t > L(22) + 0.4 && t < L(24) + 0.5 ? 1 : 0;
    for (var f2 = 0; f2 < FN; f2++) { var u4 = ((f2 * 0.29 + t * 0.35) % 1), src = f2 % 2 ? V(1.4, 6.5, -1.8) : V(-1, 9.6, -1); put(dFood, f2, src.clone().lerp(V(0, YD + 2, Z0 + 0.6), u4), foodOn * 0.2); }
    dFood.instanceMatrix.needsUpdate = true;
    // close-ups
    var g0 = cu.glass.position;
    for (var b2 = 0; b2 < 40; b2++) { var u5 = ((b2 * 0.618 + t * 0.9) % 1); put(bub, b2, V(g0.x + Math.cos(b2 * 2.4) * 1.8 * (b2 % 5) / 5, g0.y + 0.4 + u5 * 4.2, g0.z + Math.sin(b2 * 2.4) * 1.8 * (b2 % 5) / 5), m === "glass" ? 0.16 : 0); }
    for (var v2 = 0; v2 < 30; v2++) { var u6 = ((v2 * 0.41 + t * 0.4) % 1); put(vap, v2, V(g0.x + Math.sin(v2 + t) * 1.2, g0.y + 5 + u6 * 6, g0.z + Math.cos(v2) * 1.2), m === "glass" ? 0.3 * Math.sin(Math.PI * u6) : 0); }
    for (var q = 0; q < 20; q++) { var u7 = ((q * 0.5 + t * 0.5) % 1), sd = q % 2 ? 1 : -1; put(gHeat, q, V(g0.x + sd * (8 - u7 * 5.5), g0.y + 2 + (q % 5) * 0.6, g0.z), m === "glass" && t > L(7) + 0.2 ? 0.22 : 0); }
    [bub, vap, gHeat].forEach(function (d) { d.instanceMatrix.needsUpdate = true; });
    drops.forEach(function (d, j) { var k2 = 1 - clamp((t - L(8) - 1.0 - j * 0.3) / 0.9); d.scale.set(k2, 0.35 * k2, k2); d.visible = k2 > 0.02; });
    var ph = ((t - L(13)) * 1.6) % 1; pumpHandle.position.y = 9.3 - 3 * Math.abs(Math.sin(ph * Math.PI));
    var hotK = smooth(L(13) + 0.8, L(13) + 2.2, t); pumpHot.material.opacity = 0.75 * hotK; pumpHot.material.emissiveIntensity = 0.5 * hotK;
    var p0 = cu.pump.position;
    for (var w = 0; w < 16; w++) { var u8 = ((w * 0.37 + t * 0.5) % 1); put(pHeat, w, V(p0.x + Math.cos(w * 1.7) * 1.8, p0.y + 1 + u8 * 4, p0.z + Math.sin(w * 1.7) * 1.8), m === "pump" ? hotK * 0.2 : 0); }
    pHeat.instanceMatrix.needsUpdate = true;
    var c0 = cu.cap.position, drop = smooth(L(19) + 0.2, L(19) + 0.9, t);
    for (var c2 = 0; c2 < 50; c2++) {
      var u9 = ((c2 / 50 + t * 0.18) % 1), x = -10 + u9 * 20, r = x < -2.5 ? 0.85 : x < 2.5 ? 0.12 : 0.85 * drop + 0.12, sp = x < -2.5 || x > 2.5 ? 1 : 3;
      var pt = V(c0.x + x, c0.y + Math.cos(c2 * 2.3) * r * 0.8, c0.z + Math.sin(c2 * 2.3) * r * 0.8);
      put(cDots, c2, pt, m === "cap" && x < 2.5 ? 0.16 : 0); put(cDots2, c2, pt, m === "cap" && x >= 2.5 ? 0.22 * (0.4 + 0.6 * drop) : 0);
    }
    cDots.instanceMatrix.needsUpdate = true; cDots2.instanceMatrix.needsUpdate = true;
    // camera with a slow drift
    var far = { main: 1.55, glass: 1.45, hand: 1.6, pump: 1.45, cap: 1.7 }[m], tgt = sh.tgt.clone().add(base), pos = sh.pos.clone().sub(sh.tgt).multiplyScalar(far).add(tgt);
    pos.sub(tgt).applyAxisAngle(V(0, 1, 0), 0.06 * Math.sin(t * 0.35)).add(tgt);
    cam.position.copy(pos); cam.lookAt(tgt); cam.fov = sh.fov; cam.updateProjectionMatrix();
    R.render(scene, cam);
  };
})();
