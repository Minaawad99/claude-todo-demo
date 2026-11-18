/* «ازاي تعمل موتور؟» — the 3D world (three.js r149), a pure function of time: window.__world(t).
   Units ≈ decimetres. The crank axis runs along X at y = CY; cylinder k sits at x = XS[k]. The camera looks from +Z. */
(function () {
  var T3 = THREE, LN = window.TIMING.lines, END = window.TIMING.duration;
  function L(i) { return i >= LN.length ? END : LN[i].start; }
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eio(x) { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eout(x) { x = cl(x); return 1 - Math.pow(1 - x, 3); }
  function bk(x) { x = cl(x); var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function ramp(t, a, d) { return cl((t - a) / d); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function V(x, y, z) { return new T3.Vector3(x, y, z); }
  function hash(n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

  // ── renderer, scene, light ─────────────────────────────────────
  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false);
  R.outputEncoding = T3.sRGBEncoding; R.toneMapping = T3.ACESFilmicToneMapping; R.toneMappingExposure = 0.9;
  R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap;
  var scene = new T3.Scene();
  scene.background = new T3.Color(0x6f6a62); scene.fog = new T3.Fog(0x6f6a62, 45, 110);
  var cam = new T3.PerspectiveCamera(36, 360 / 640, 0.3, 200);

  // environment for metal reflections: a soft studio sphere with two bright strips
  (function () {
    var es = new T3.Scene(), g = new T3.SphereGeometry(50, 32, 16), col = [], p = g.attributes.position;
    for (var i = 0; i < p.count; i++) { var y = p.getY(i) / 50, c = y > 0 ? lerp(0.62, 1.0, y) : lerp(0.62, 0.22, -y); col.push(c, c * 0.98, c * 0.94); }
    g.setAttribute("color", new T3.Float32BufferAttribute(col, 3));
    es.add(new T3.Mesh(g, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide })));
    [[-20, 25, 10], [25, 18, -10]].forEach(function (q) { var m = new T3.Mesh(new T3.PlaneGeometry(30, 6), new T3.MeshBasicMaterial({ color: 0xffffff })); m.position.set(q[0], q[1], q[2]); m.lookAt(0, 0, 0); es.add(m); });
    var pm = new T3.PMREMGenerator(R); scene.environment = pm.fromScene(es, 0.04).texture;
  })();
  scene.add(new T3.HemisphereLight(0xfff6e8, 0x4d473e, 0.38));
  var sun = new T3.DirectionalLight(0xffe9cc, 1.75); sun.position.set(-14, 26, 16); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
  var sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80;
  scene.add(sun); scene.add(sun.target);

  function std(c, o) { return new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.0 }, o || {})); }
  var M = {
    steel: std(0xc9ccd0, { metalness: 0.85, roughness: 0.28 }), chrome: std(0xe8eaee, { metalness: 1, roughness: 0.12 }),
    dark: std(0x2b2d31, { metalness: 0.5, roughness: 0.45 }), brass: std(0xd4a23a, { metalness: 0.9, roughness: 0.3 }),
    ceramic: std(0xf3f1ea, { roughness: 0.35 }), rubber: std(0x151516, { roughness: 0.92, envMapIntensity: 0.15 }), blueTube: std(0x2f8fd6, { roughness: 0.35 }),
    glass: new T3.MeshPhysicalMaterial({ color: 0xdfeff5, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false, side: T3.DoubleSide, clearcoat: 1 }),
    red: new T3.MeshPhysicalMaterial({ color: 0x5e0007, metalness: 0.2, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.55 }),
    radiator: std(0x34373c, { metalness: 0.6, roughness: 0.4 }), tank: std(0x3a3f47, { metalness: 0.55, roughness: 0.35 })
  };
  function cast(o) { o.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; }
  function mesh(g, m) { var x = new T3.Mesh(g, m); x.castShadow = x.receiveShadow = true; return x; }
  function fadeMat(m) { m = m.clone(); m.transparent = true; return m; }
  function setOpacity(o, a) { o.visible = a > 0.002; o.traverse(function (m) { var u = m.isMesh && m.material.userData; if (u && u.base !== undefined) { m.material.opacity = u.base * a; var tr = a < 0.999 || u.base < 1; if (m.material.transparent !== tr) { m.material.transparent = tr; m.material.depthWrite = !tr || u.dw; m.material.needsUpdate = true; } } }); }
  function fadeable(o) { o.traverse(function (m) { if (m.isMesh) { m.material = m.material.clone(); m.material.userData.dw = m.material.depthWrite; m.material.userData.base = m.material.transparent ? m.material.opacity : 1; } }); return o; }

  // ── the garage: concrete floor and a painted block wall ─────────────
  (function () {
    var cv = document.createElement("canvas"); cv.width = cv.height = 1024; var x = cv.getContext("2d");
    x.fillStyle = "#8c8273"; x.fillRect(0, 0, 1024, 1024);
    for (var i = 0; i < 9000; i++) { var r = hash(i), g = hash(i + 0.5); x.fillStyle = "rgba(" + (r > .5 ? "70,62,50" : "220,212,196") + "," + (0.05 + hash(i + 2) * 0.08) + ")"; x.fillRect(r * 1024, g * 1024, 2 + hash(i + 3) * 5, 2 + hash(i + 4) * 5); }
    for (i = 0; i < 14; i++) { var gr = x.createRadialGradient(hash(i + 9) * 1024, hash(i + 19) * 1024, 0, hash(i + 9) * 1024, hash(i + 19) * 1024, 60 + hash(i + 29) * 160); gr.addColorStop(0, "rgba(80,70,55,.22)"); gr.addColorStop(1, "rgba(80,70,55,0)"); x.fillStyle = gr; x.fillRect(0, 0, 1024, 1024); }
    x.strokeStyle = "rgba(60,52,42,.35)"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 512); x.lineTo(1024, 512); x.moveTo(512, 0); x.lineTo(512, 1024); x.stroke();
    var tex = new T3.CanvasTexture(cv); tex.wrapS = tex.wrapT = T3.RepeatWrapping; tex.repeat.set(5, 5); tex.encoding = T3.sRGBEncoding; tex.anisotropy = 8;
    var fl = new T3.Mesh(new T3.PlaneGeometry(160, 160), new T3.MeshStandardMaterial({ map: tex, roughness: 0.92 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
    var cw = document.createElement("canvas"); cw.width = 1024; cw.height = 512; var w = cw.getContext("2d");
    w.fillStyle = "#8f8b83"; w.fillRect(0, 0, 1024, 512);
    for (var r2 = 0; r2 < 16; r2++) for (var c2 = 0; c2 < 9; c2++) { var off = r2 % 2 ? 57 : 0; w.fillStyle = "rgba(255,255,255," + (0.04 + hash(r2 * 9 + c2) * 0.05) + ")"; w.fillRect(c2 * 114 + off + 2, r2 * 32 + 2, 110, 28); }
    w.fillStyle = "rgba(90,84,74,.25)"; for (r2 = 0; r2 <= 16; r2++) w.fillRect(0, r2 * 32, 1024, 2);
    w.fillStyle = "#b98a1c"; w.fillRect(0, 452, 1024, 26); w.fillStyle = "#3b3a37"; w.fillRect(0, 478, 1024, 34);
    var wt = new T3.CanvasTexture(cw); wt.wrapS = T3.RepeatWrapping; wt.repeat.set(4, 1); wt.encoding = T3.sRGBEncoding;
    var wall = new T3.Mesh(new T3.PlaneGeometry(120, 30), new T3.MeshStandardMaterial({ map: wt, roughness: 0.95 })); wall.position.set(0, 15, -26); wall.receiveShadow = true; scene.add(wall);
  })();

  // ── the soda bottle (our own label) ────────────────────────────
  var bottle = new T3.Group(); scene.add(bottle);
  var prof = [[0, 0], [0.62, 0], [0.7, 0.08], [0.72, 1.9], [0.7, 2.2], [0.5, 2.9], [0.3, 3.5], [0.27, 3.85], [0.31, 3.92], [0.27, 4.0], [0, 4.0]].map(function (p) { return new T3.Vector2(p[0], p[1]); });
  var glassG = new T3.MeshPhysicalMaterial({ color: 0x2f6b3a, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.62, clearcoat: 1, depthWrite: false });
  var bGlass = mesh(new T3.LatheGeometry(prof, 48), glassG); bottle.add(bGlass);
  var liq = mesh(new T3.LatheGeometry(prof.slice(0, 5).map(function (v) { return new T3.Vector2(v.x * 0.93, Math.min(v.y, 2.1)); }).concat([new T3.Vector2(0, 2.1)]), 48), std(0x2a1209, { roughness: 0.1, transparent: true, opacity: 0.92 }));
  bottle.add(liq);
  (function () {
    var cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; var x = cv.getContext("2d");
    x.fillStyle = "#1f6fb5"; x.fillRect(0, 0, 1024, 256); x.fillStyle = "#ffffff"; x.fillRect(0, 26, 1024, 8); x.fillRect(0, 222, 1024, 8);
    x.font = "900 120px 'Noto Sans Arabic', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    for (var k = 0; k < 2; k++) { x.fillText("ساقع", 256 + k * 512, 132); }
    var tex = new T3.CanvasTexture(cv); tex.encoding = T3.sRGBEncoding; tex.wrapS = T3.RepeatWrapping; tex.repeat.x = -1;
    var lab = mesh(new T3.CylinderGeometry(0.735, 0.735, 0.9, 48, 1, true), new T3.MeshStandardMaterial({ map: tex, roughness: 0.5 })); lab.position.y = 1.15; bottle.add(lab);
  })();
  var cap = new T3.Group(); scene.add(cap);
  cap.add(mesh(new T3.CylinderGeometry(0.34, 0.34, 0.2, 24), std(0xc61b22, { metalness: 0.6, roughness: 0.3 })));
  for (var ci = 0; ci < 18; ci++) { var tooth = mesh(new T3.BoxGeometry(0.06, 0.2, 0.06), std(0xc61b22, { metalness: 0.6, roughness: 0.3 })); var ang = ci / 18 * Math.PI * 2; tooth.position.set(Math.cos(ang) * 0.35, 0, Math.sin(ang) * 0.35); cap.add(tooth); }
  fadeable(cap);
  // foam / spray drops
  var foam = []; var foamM = std(0xf3e7d4, { roughness: 0.6, transparent: true });
  for (var fi = 0; fi < 60; fi++) { var d = new T3.Mesh(new T3.SphereGeometry(0.07 + hash(fi) * 0.09, 8, 6), foamM); scene.add(d); foam.push(d); }
  var puddle = new T3.Mesh(new T3.CircleGeometry(1, 40), std(0x2a1209, { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 })); puddle.rotation.x = -Math.PI / 2; puddle.position.set(0.6, 0.01, 0.6); scene.add(puddle);

  // ── the engine ──────────────────────────────────────────────
  var CY = 1.35, CR = 0.48, ROD = 1.65, XS = [0, 2.3, 4.6, 6.9], CYL0 = 2.25, CYL1 = 4.45;
  var eng = new T3.Group(); scene.add(eng);
  function cylinderUnit(k) {
    var u = new T3.Group(); u.position.x = XS[k];
    var glass = new T3.Mesh(new T3.CylinderGeometry(1.0, 1.0, CYL1 - CYL0, 48, 1, true), M.glass); glass.position.y = (CYL0 + CYL1) / 2; glass.renderOrder = 5; u.add(glass);
    var r1 = mesh(new T3.TorusGeometry(1.0, 0.06, 12, 48), M.chrome); r1.rotation.x = Math.PI / 2; r1.position.y = CYL0; u.add(r1);
    var r2 = r1.clone(); r2.position.y = CYL1; u.add(r2);
    var piston = new T3.Group(); u.add(piston);
    var pb = mesh(new T3.CylinderGeometry(0.93, 0.93, 0.85, 40), M.steel); pb.position.y = 0.12; piston.add(pb);
    for (var g = 0; g < 3; g++) { var gr = mesh(new T3.TorusGeometry(0.935, 0.03, 8, 40), M.dark); gr.rotation.x = Math.PI / 2; gr.position.y = 0.38 - g * 0.12; piston.add(gr); }
    var rod = mesh(new T3.BoxGeometry(0.22, 1, 0.16), M.steel); u.add(rod);
    var crank = new T3.Group(); crank.position.y = CY; u.add(crank);
    var web1 = mesh(new T3.BoxGeometry(0.16, 1.05, 0.5), M.steel); web1.position.set(-0.22, CR / 2, 0); crank.add(web1);
    var web2 = web1.clone(); web2.position.x = 0.22; crank.add(web2);
    var pin = mesh(new T3.CylinderGeometry(0.11, 0.11, 0.6, 16), M.chrome); pin.rotation.z = Math.PI / 2; pin.position.y = CR; crank.add(pin);
    var head = new T3.Group(); head.position.y = CYL1; u.add(head);
    head.add(mesh(new T3.CylinderGeometry(1.12, 1.12, 0.32, 48), M.dark)); head.children[0].position.y = 0.16;
    var hot = new T3.Mesh(new T3.CylinderGeometry(1.125, 1.125, 0.322, 48), new T3.MeshBasicMaterial({ color: 0xff4a0a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); hot.position.y = 0.16; head.add(hot);
    var inj = new T3.Group(); inj.position.set(-0.35, 0.32, 0); head.add(inj);
    inj.add(mesh(new T3.CylinderGeometry(0.1, 0.2, 0.7, 20), M.brass)); inj.children[0].position.y = 0.35;
    var tube = mesh(new T3.CylinderGeometry(0.06, 0.06, 0.6, 12), M.blueTube); tube.position.y = 0.95; inj.add(tube);
    var plug = new T3.Group(); plug.position.set(0.35, 0.32, 0); head.add(plug);
    var hex = mesh(new T3.CylinderGeometry(0.17, 0.17, 0.16, 6), M.chrome); hex.position.y = 0.08; plug.add(hex);
    var cer = mesh(new T3.CylinderGeometry(0.1, 0.13, 0.55, 20), M.ceramic); cer.position.y = 0.43; plug.add(cer);
    var tip = mesh(new T3.SphereGeometry(0.07, 12, 8), M.chrome); tip.position.y = 0.75; plug.add(tip);
    var valves = [];
    [0, 1].forEach(function (sx, j) {
      var v = new T3.Group(); v.position.set(0, 0.32, j ? -0.6 : 0.6); head.add(v);
      var stem = mesh(new T3.CylinderGeometry(0.07, 0.07, 0.75, 12), M.chrome); stem.position.y = 0.37; v.add(stem);
      var sp = mesh(new T3.TorusGeometry(0.16, 0.05, 8, 20), j ? std(0x8a8f96, { metalness: .8, roughness: .3 }) : std(0x2f8fd6, { metalness: .3, roughness: .3 })); sp.rotation.x = Math.PI / 2; sp.position.y = 0.55; v.add(sp);
      v.userData.cap = sp; valves.push(v);
    });
    // what's inside the chamber: fuel mist, old smoke, the blast
    var mist = new T3.Mesh(new T3.CylinderGeometry(0.9, 0.9, 1, 32), new T3.MeshBasicMaterial({ color: 0x9fd2f5, transparent: true, opacity: 0, depthWrite: false })); u.add(mist);
    var smoke = new T3.Mesh(new T3.CylinderGeometry(0.9, 0.9, 1, 32), new T3.MeshBasicMaterial({ color: 0x3e3b38, transparent: true, opacity: 0, depthWrite: false })); u.add(smoke);
    var blast = new T3.Mesh(new T3.CylinderGeometry(0.9, 0.9, 1, 32), new T3.MeshBasicMaterial({ color: 0xffa23a, transparent: true, opacity: 0, depthWrite: false, blending: T3.AdditiveBlending })); u.add(blast);
    var flash = new T3.PointLight(0xffa64d, 0, 6, 2); flash.position.y = CYL1 - 0.4; u.add(flash);
    var spark = new T3.Mesh(new T3.SphereGeometry(0.16, 12, 8), new T3.MeshBasicMaterial({ color: 0xfffbe6, transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthWrite: false })); spark.position.set(0.35, CYL1 - 0.05, 0); u.add(spark);
    eng.add(u);
    return { u: u, glass: glass, piston: piston, rod: rod, crank: crank, head: head, hot: hot, inj: inj, plug: plug, valves: valves, mist: mist, smoke: smoke, blast: blast, flash: flash, spark: spark, rings: [r1, r2] };
  }
  var C = [0, 1, 2, 3].map(cylinderUnit);
  C.forEach(function (c, k) { if (k) fadeable(c.u); });
  // crank journals between and beyond the throws, and the flywheel wheel
  var shaft = mesh(new T3.CylinderGeometry(0.13, 0.13, 1, 16), M.chrome); shaft.rotation.z = Math.PI / 2; shaft.position.y = CY; eng.add(shaft);
  var wheel = new T3.Group(); wheel.position.set(-1.35, CY, 0); eng.add(wheel);
  var tyre = mesh(new T3.TorusGeometry(0.95, 0.3, 20, 48), M.rubber); tyre.rotation.y = Math.PI / 2; wheel.add(tyre);
  var rim = mesh(new T3.CylinderGeometry(0.72, 0.72, 0.3, 40), M.chrome); rim.rotation.z = Math.PI / 2; wheel.add(rim);
  for (var s = 0; s < 5; s++) { var sp2 = mesh(new T3.BoxGeometry(0.34, 0.12, 1.3), M.dark); sp2.rotation.x = s / 5 * Math.PI; wheel.add(sp2); }
  var hub = mesh(new T3.CylinderGeometry(0.2, 0.2, 0.4, 16), M.dark); hub.rotation.z = Math.PI / 2; wheel.add(hub);
  // sump with oil
  // cooling: blue hoses along the heads and the radiator in front of cylinder 4's end
  var hoseM = std(0x2f8fd6, { roughness: 0.3, transparent: true, opacity: 1 });
  var hosePath = new T3.CatmullRomCurve3([V(-0.6, CYL1 - 0.4, 1.1), V(2.3, CYL1 - 0.3, 1.15), V(4.6, CYL1 - 0.4, 1.12), V(7.2, CYL1 - 0.3, 1.1), V(8.6, 3.4, 0.6), V(9.6, 2.6, 0)]);
  var hose = mesh(new T3.TubeGeometry(hosePath, 120, 0.12, 12, false), hoseM); eng.add(hose);
  var hose2 = mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3([V(9.6, 1.4, 0), V(8.4, 1.0, 0.7), V(6.9, 1.6, 1.1), V(4.6, 1.9, 1.15), V(2.3, 1.7, 1.12), V(-0.4, 1.9, 1.05)]), 120, 0.12, 12, false), hoseM); eng.add(hose2);
  var drops = []; for (var di = 0; di < 26; di++) { var dd = new T3.Mesh(new T3.SphereGeometry(0.1, 8, 6), new T3.MeshBasicMaterial({ color: 0xbfe8ff })); eng.add(dd); drops.push(dd); }
  var rad = new T3.Group(); rad.position.set(9.9, 2.2, 0); eng.add(rad);
  rad.add(mesh(new T3.BoxGeometry(0.3, 3.0, 3.2), M.radiator));
  for (var fn = 0; fn < 16; fn++) { var fin = mesh(new T3.BoxGeometry(0.34, 2.7, 0.06), std(0xb8bcc2, { metalness: .8, roughness: .3 })); fin.position.z = -1.45 + fn * 0.193; rad.add(fin); }
  // exhaust pipe, sound rings, muffler
  var exPath = new T3.CatmullRomCurve3([V(0, CYL1 + 0.25, -1.0), V(3.4, CYL1 + 0.4, -1.25), V(7.4, CYL1 + 0.2, -1.25), V(8.4, 2.6, -1.6), V(8.6, 1.0, -2.6), V(7.0, 0.7, -4.2), V(2.0, 0.7, -4.4)]);
  var exhaust = mesh(new T3.TubeGeometry(exPath, 160, 0.16, 12, false), std(0x8d8f93, { metalness: .85, roughness: .35 })); eng.add(exhaust);
  var mufP = [0.95, 0.7, -4.4]; var muffler = new T3.Group(); muffler.position.set(mufP[0] + 3.2, mufP[1], mufP[2]); eng.add(muffler);
  var mbody = mesh(new T3.CapsuleGeometry(0.55, 2.2, 8, 24), std(0xb9bcc0, { metalness: .85, roughness: .25 })); mbody.rotation.z = Math.PI / 2; muffler.add(mbody);
  var rings = []; for (var ri = 0; ri < 5; ri++) { var rg = new T3.Mesh(new T3.TorusGeometry(1, 0.04, 8, 48), new T3.MeshBasicMaterial({ color: 0xe0322b, transparent: true, depthWrite: false })); rg.rotation.y = Math.PI / 2; rg.position.set(mufP[0] - 0.3, mufP[1], mufP[2]); eng.add(rg); rings.push(rg); }
  // fuel tank, starter
  var tank = new T3.Group(); eng.add(tank);
  var tb = mesh(new T3.CapsuleGeometry(0.9, 2.4, 10, 28), M.tank); tb.rotation.z = Math.PI / 2; tank.add(tb);
  var tcap = mesh(new T3.CylinderGeometry(0.22, 0.22, 0.2, 20), std(0xc61b22, { metalness: .5, roughness: .3 })); tcap.position.set(0.8, 0.95, 0); tank.add(tcap);
  var starter = new T3.Group(); eng.add(starter);
  var stb = mesh(new T3.CylinderGeometry(0.4, 0.4, 1.3, 24), std(0x2a2c30, { metalness: .6, roughness: .4 })); stb.rotation.z = Math.PI / 2; starter.add(stb);
  var stg = mesh(new T3.CylinderGeometry(0.22, 0.22, 0.3, 12), M.brass); stg.rotation.z = Math.PI / 2; stg.position.x = -0.8; starter.add(stg);
  var carW = []; for (var wi = 0; wi < 4; wi++) { var cw2 = wheel.clone(); scene.add(cw2); carW.push(cw2); }
  [tank, starter, muffler, rad].forEach(fadeable); fadeable(hose); fadeable(hose2); fadeable(exhaust); carW.forEach(fadeable);
  cast(eng);

  // ── the car body (built from a side profile) ─────────────────────
  var car = new T3.Group(); scene.add(car);
  (function () {
    var s = new T3.Shape(); var P = [[-7.2, 0.95], [-7.5, 2.1], [-6.9, 2.75], [-3.5, 3.0], [-1.3, 4.05], [1.5, 4.1], [3.9, 2.95], [6.8, 2.45], [7.55, 1.75], [7.3, 0.95]];
    s.moveTo(P[0][0], P[0][1]); P.slice(1).forEach(function (p) { s.lineTo(p[0], p[1]); }); s.lineTo(P[0][0], P[0][1]);
    [[-5.0], [4.6]].forEach(function (q) { var h = new T3.Path(); h.absarc(q[0], 0.9, 1.45, 0, Math.PI, false); s.holes.push(h); });
    var g = new T3.ExtrudeGeometry(s, { depth: 4.2, bevelEnabled: true, bevelThickness: 0.45, bevelSize: 0.35, bevelSegments: 6, steps: 1, curveSegments: 24 });
    g.translate(0, 0, -2.1); var body = mesh(g, M.red); car.add(body);
    var wsh = new T3.Shape(); var W = [[-3.1, 3.1], [-1.25, 3.92], [1.45, 3.97], [3.55, 3.05]]; wsh.moveTo(W[0][0], W[0][1]); W.slice(1).forEach(function (p) { wsh.lineTo(p[0], p[1]); }); wsh.lineTo(W[0][0], W[0][1]);
    var wg = new T3.ExtrudeGeometry(wsh, { depth: 4.3, bevelEnabled: true, bevelThickness: 0.42, bevelSize: 0.06, bevelSegments: 3 }); wg.translate(0, 0, -2.15);
    car.add(mesh(wg, new T3.MeshPhysicalMaterial({ color: 0x15181d, metalness: 0.2, roughness: 0.05, clearcoat: 1 })));
    var lightM = new T3.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xfff1c4, emissiveIntensity: 0.8 });
    [-1.6, 1.6].forEach(function (z) { var hl = mesh(new T3.BoxGeometry(0.2, 0.32, 0.9), lightM); hl.position.set(7.45, 2.15, z); car.add(hl);
      var tl = mesh(new T3.BoxGeometry(0.2, 0.28, 1.0), new T3.MeshStandardMaterial({ color: 0x7a0b0b, emissive: 0xc0141c, emissiveIntensity: 0.6 })); tl.position.set(-7.6, 2.2, z); car.add(tl); });
  })();
  fadeable(car);

  // ── layout over time ─────────────────────────────────────────
  var CAM = [ // [time, eye, target]
    [0, [0.8, 3.0, 9.4], [0, 2.2, 0]], [L(1), [0.5, 3.2, 8.2], [0, 2.8, 0]], [L(2), [1.0, 4.4, 10.0], [0, 5.0, 0]], [L(3), [1.4, 5.4, 11.0], [0, 7.8, 0]],
    [L(4), [1.2, 6.4, 11.5], [0, 11.0, 0]], [L(5), [3.4, 4.6, 9.4], [0.4, 1.0, 0]], [L(6), [1.4, 3.8, 9.4], [0, 1.6, 0]], [L(8), [0.9, 3.2, 7.0], [0, 1.2, 0]],
    [L(9), [-0.4, 3.8, 9.4], [-0.6, 1.4, 0]], [L(11), [2.2, 5.0, 12.0], [-0.4, 2.7, 0]], [L(13), [2.6, 3.4, 8.6], [-0.3, 1.8, 0]], [L(14), [2.0, 5.0, 11.4], [-0.3, 2.9, 0]],
    [L(15), [0.8, 6.4, 7.6], [0, 4.4, 0]], [L(17), [1.2, 6.4, 5.8], [0.3, 4.9, 0]], [L(18), [0.6, 5.6, 8.0], [0, 3.9, 0]], [L(20), [0.6, 6.9, 6.2], [0, 4.9, 0]],
    [L(22), [1.0, 6.6, 5.6], [0, 5.0, 0]], [L(23), [1.6, 5.0, 9.4], [0, 3.6, 0]], [L(24), [0.8, 4.6, 8.0], [0, 3.6, 0]], [L(26), [2.0, 4.8, 9.0], [0, 3.4, 0]],
    [L(27), [3.0, 5.4, 12.0], [0.4, 2.9, 0]], [L(28), [15.0, 9.5, 17.0], [3.6, 2.6, 0]], [L(30), [17.5, 8.0, 12.5], [3.8, 2.8, 0]], [L(32), [11.0, 8.6, 11.6], [3.6, 3.6, 0]],
    [L(33), [15.5, 8.6, 15.0], [4.4, 2.8, 0]], [L(34), [19.0, 7.6, 10.5], [6.4, 2.4, 0]], [L(36), [13.0, 8.0, -18.0], [3.4, 1.8, -3.6]], [L(37) + 0.6, [10.0, 6.0, -17.5], [2.0, 1.2, -4.2]],
    [L(39), [6.0, 12.5, 24.0], [3.4, 1.6, -1.0]], [L(42), [6.0, 11.0, 26.0], [3.0, 2.0, -0.5]], [L(42) + 1.6, [-15.0, 10.0, 30.0], [0, 2.4, 0]], [END + 3, [-33.0, 9.0, -6.0], [0, 2.4, 0]]
  ];
  var tmpE = V(0, 0, 0), tmpT = V(0, 0, 0);
  function camAt(t) {
    // keyframe i is the shot for its line: the move into it starts 0.3 s before the line and lasts up to 1.3 s
    var i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] - 0.3 <= t) i++;
    var a = CAM[Math.max(0, i - 1)], b = CAM[i], dur = i ? Math.min(1.3, Math.max(0.6, b[0] - a[0])) : 1, k = i ? eio((t - b[0] + 0.3) / dur) : 1;
    if (i >= CAM.length - 2) {   // the final orbit: once at the last-but-one shot, keep circling toward the last one
      var A = CAM[CAM.length - 2], B = CAM[CAM.length - 1], k2 = cl((t - A[0] - 1.0) / (B[0] - A[0] - 1.0));
      if (t > A[0] + 1.0) { a = A; b = B; k = k2 * k2 * (3 - 2 * k2) * 0.5 + k2 * 0.5; }
    }
    tmpE.set(lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k), lerp(a[1][2], b[1][2], k));
    tmpT.set(lerp(a[2][0], b[2][0], k), lerp(a[2][1], b[2][1], k), lerp(a[2][2], b[2][2], k));
    // a slow handheld drift so no frame is ever still
    tmpE.x += Math.sin(t * 0.45) * 0.55; tmpE.y += Math.sin(t * 0.31 + 1) * 0.25; tmpE.z += Math.cos(t * 0.38) * 0.45;
  }

  var shake = 0, capY = 4;
  window.__project = function () { return null; };
  var ANCH = {};
  window.__world = function (t) {
    // 1 · the bottle: shaken, opened, the cap flies and the drink spills
    var shk = t < L(1) + 0.3 ? Math.sin(t * 38) * 0.09 * ramp(t, 0.3, 0.4) : 0;
    var bOut = eio(ramp(t, L(6), 0.7));
    bottle.visible = bOut < 1; bottle.position.set(lerp(0, -6, bOut), 0, lerp(0, -3, bOut)); bottle.rotation.z = shk; bottle.rotation.x = shk * 0.4;
    var popT = L(1) + 0.35, fly = t - popT;
    var capPos = V(0, 4.05, 0);
    if (fly > 0) { capPos.set(Math.sin(fly * 1.3) * 0.5, 4.05 + 5.2 * (1 - Math.exp(-fly * 0.55)) + Math.sin(fly * 3.1) * 0.12, 0.1 * fly); }
    var drop = eio(ramp(t, L(6) - 0.2, 0.9));                  // the cap comes back down into the pipe and turns into the piston
    if (t >= L(6) - 0.2) { capPos.set(0, lerp(9, CYL0 - 2.0 + 0.6, drop), 0); }
    capY = capPos.y; cap.position.copy(capPos); cap.rotation.x = fly > 0 && t < L(6) ? fly * 7 : 0; cap.rotation.z = shk;
    var morph = eio(ramp(t, L(6) + 0.5, 0.6));
    setOpacity(cap, 1 - morph);
    foam.forEach(function (d, i) {
      var t0 = popT + hash(i) * 0.5, a = t - t0, life = 2.2, n = Math.floor(a / life);
      if (a < 0 || t > L(6)) { d.visible = false; return; }
      a -= n * life; var g = n ? 0.4 : 1;   // after the first fountain the foam keeps bubbling out, smaller
      d.visible = true; var vx = (hash(i + 3 + n) - 0.5) * 3 * g, vz = (hash(i + 7 + n) - 0.5) * 2 * g, vy = (6 + hash(i + 5 + n) * 6) * g;
      var y = 4.0 + vy * a - 4.9 * a * a; d.position.set(vx * a, Math.max(0.05, y), vz * a); d.scale.setScalar(y < 0.1 ? 0.6 : 1);
    });
    var pud = eout(ramp(t, popT + 0.6, 2.4)) * (1 - eio(ramp(t, L(9), 0.8)));
    puddle.visible = pud > 0.01; puddle.scale.setScalar(0.2 + pud * 1.9); puddle.material.opacity = 0.8 * pud;
    liq.scale.y = 1 - 0.55 * eout(ramp(t, popT, 1.2));

    // 2 · the engine grows
    var e1 = eio(ramp(t, L(6) - 0.4, 0.8));                       // the first glass pipe drops in
    var lift = eio(ramp(t, L(11), 1.0));                          // the crank arrives under it and lifts it up
    eng.visible = t > L(6) - 0.5;
    eng.position.set(0, lerp(-(CYL0 - 0.05), 0, lift) + (1 - e1) * 8, 0);
    var crankOn = lift > 0.01, wheelIn = eio(ramp(t, L(9) + 0.1, 0.8));
    wheel.visible = wheelIn > 0; wheel.position.x = lerp(-6, -1.35, wheelIn);
    wheel.position.y = lerp(1.25 + (CYL0 - 0.05), CY, lift);  // the wheel rests on the floor until the crank lifts it
    // crank angle: still until the first push, then turns; speeds up for "a hundred times a second"
    var w = 0, th = 0;
    function spd(x) { return x < L(11) + 1.0 ? 0 : x < L(12) ? 1.6 : x < L(14) ? 3.2 : x < L(14) + 1.2 ? 3.2 * (1 - (x - L(14)) / 1.2) : x < L(16) + 0.2 ? 0 : x < L(30) ? 5 : x < L(32) ? 5 + 9 * (x - L(30)) / (L(32) - L(30)) : x < L(42) ? 14 : 14 * Math.max(0, 1 - (x - L(42)) / 1.2); }
    for (var x = L(11) + 1.0, dt = 0.02; x < t; x += dt) th += spd(x) * dt;      // integrate (cheap: < 4k steps)
    var bob = t < L(11) && t > L(6) + 1.1 ? 0.9 * (0.5 - 0.5 * Math.cos((t - L(6) - 1.1) * 3.6)) : 0;
    var nCyl = 1 + Math.floor(3 * cl((t - L(28)) / 0.01));
    var four = eio(ramp(t, L(28), 1.0));
    shake = (t > L(27) && t < L(28) + 0.3) ? 0.06 : (t > L(14) && t < L(14) + 1.4) ? 0.03 * (1 - (t - L(14)) / 1.4) : 0;
    eng.position.x += shake * Math.sin(t * 71); eng.position.z += shake * Math.cos(t * 53);
    var eShrink = eio(ramp(t, L(42), 1.4));
    eng.scale.setScalar(lerp(1, 0.3, eShrink));
    if (eShrink > 0) eng.position.set(lerp(eng.position.x, 4.36, eShrink), lerp(eng.position.y, 1.0, eShrink), 0);

    C.forEach(function (c, k) {
      var on = k === 0 ? 1 : eio(ramp(t, L(28) + (k - 1) * 0.22, 0.6));
      c.u.visible = on > 0.01; if (k) { setOpacity(c.u, on); c.u.position.y = (1 - on) * 3; }
      var ph = th + (k === 1 || k === 2 ? Math.PI : 0);
      c.crank.rotation.x = -ph; c.crank.visible = crankOn; c.rod.visible = crankOn;
      var sy = CR * Math.cos(ph), sz = CR * Math.sin(ph), py = CY + sy + Math.sqrt(ROD * ROD - sz * sz);
      if (!crankOn) py = CYL0 + 0.55 + bob;
      // compression demo: at line 24 the piston climbs higher and slower
      c.piston.position.y = py - 0.25 + 0.0 * k;
      c.piston.scale.setScalar(k === 0 ? lerp(0.35, 1, morph) : 1);
      c.piston.visible = k > 0 || morph > 0.01;
      var ry = CY + sy, rmid = (py - 0.25 + ry) / 2, rlen = py - 0.25 - ry;
      c.rod.position.set(0, rmid, sz / 2); c.rod.scale.y = Math.sqrt(rlen * rlen + sz * sz); c.rod.rotation.x = Math.atan2(sz, rlen);
      var headOn = k > 0 ? 1 : eio(ramp(t, L(15) - 0.3, 0.7));
      c.head.visible = headOn > 0.01; c.head.position.y = CYL1 + (1 - headOn) * 4;
      c.plug.visible = k > 0 || t > L(16) - 0.4; c.plug.position.y = 0.32 + (k > 0 ? 0 : (1 - eio(ramp(t, L(16) - 0.4, 0.5))) * 2);
      var vOn = k > 0 ? 1 : eio(ramp(t, L(20) + 0.2, 0.6));
      c.valves.forEach(function (v, j) { v.visible = vOn > 0.01; v.scale.setScalar(Math.max(0.01, vOn)); v.position.y = 0.32 + Math.max(0, Math.sin(ph * 0.5 + j * 1.6)) * 0.12 * (t > L(21) ? 1 : 0); });
      // the chamber between the piston top and the head
      var top = c.piston.position.y + 0.55, room = CYL1 - top;
      [c.mist, c.smoke, c.blast].forEach(function (m) { m.position.y = top + room / 2; m.scale.y = Math.max(0.01, room); });
      var running = t > L(16) + 0.2 && t < L(42) + 1.2;
      var cyc = ((ph % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);                 // four-stroke: fires every other top
      var fire = running && (t < L(28) ? k === 0 : on > 0.9) ? Math.exp(-Math.pow(Math.min(cyc, 4 * Math.PI - cyc) / 0.35, 2)) : 0;
      var weak = t > L(23) && t < L(24) + 0.4 ? 0.35 : 1, strong = t > L(25) && t < L(26) + 1 ? 1.5 : 1;
      if (t > L(16) - 0.2 && t < L(16) + 0.3) fire = Math.max(fire, k === 0 ? Math.exp(-Math.pow((t - L(16) - 0.05) / 0.08, 2)) : 0);
      c.blast.material.opacity = 0.55 * fire * weak * Math.min(strong, 1.2); c.flash.intensity = 6 * fire * weak * strong;
      c.spark.material.opacity = fire > 0.2 ? 1 : 0; c.spark.scale.setScalar(0.6 + fire * weak * strong);
      var mistA = k === 0 ? (t > L(15) + 0.2 && t < L(16) + 0.1 ? 0.45 * eout(ramp(t, L(15) + 0.2, 0.8)) : 0) : 0;
      if (running && (k === 0 || on > 0.9)) mistA = Math.max(mistA, 0.18 * Math.max(0, Math.sin(cyc * 0.5 + 0.8)));
      if (k === 0 && t > L(19) && t < L(20) + 0.4) mistA = 0.35;
      c.mist.material.opacity = mistA;
      c.smoke.material.opacity = k === 0 && t > L(18) - 0.1 && t < L(21) + 0.3 ? 0.8 * eout(ramp(t, L(18) - 0.1, 0.5)) * (1 - eio(ramp(t, L(21), 0.6))) : 0;
      var heat = eio(ramp(t, L(32), 1.6)) * (1 - eio(ramp(t, L(34), 1.4)));
      c.hot.material.opacity = 0.75 * heat;
      ANCH["piston" + k] = c.piston.localToWorld(V(0, 0.55, 0.0));
      ANCH["head" + k] = c.head.localToWorld(V(0, 0.4, 0.9));
      ANCH["plug" + k] = c.plug.localToWorld(V(0, 0.75, 0));
      ANCH["inj" + k] = c.inj.localToWorld(V(0, 1.2, 0));
      ANCH["valve" + k] = c.valves[0].localToWorld(V(0, 0.75, 0));
      ANCH["glass" + k] = c.u.localToWorld(V(0.7, CYL1 - 0.6, 0.7));
    });
    shaft.visible = crankOn; shaft.scale.y = lerp(1.9, 10.2, four); shaft.position.x = lerp(-0.55, 2.95, four);
    wheel.rotation.x = -th; ANCH.crank = C[0].crank.localToWorld(V(0.22, 0, 0.3)); ANCH.wheel = wheel.localToWorld(V(0, 0.95, 0));

    // cooling
    var cool = eio(ramp(t, L(33), 0.9)), radIn = eio(ramp(t, L(34) - 0.2, 0.8));
    setOpacity(hose, cool); setOpacity(hose2, cool); setOpacity(rad, radIn); rad.position.x = 9.9 + (1 - radIn) * 6;
    drops.forEach(function (d, i) { var u = ((t * 0.18 + i / drops.length) % 1); d.visible = cool > 0.9 && t < L(42); d.position.copy(i % 2 ? hosePath.getPoint(u) : hosePath.getPoint(1 - u)); if (i % 2) d.position.z += 0.0; });
    ANCH.rad = rad.localToWorld(V(0, 1.2, 1.0));
    // exhaust and sound
    var ex = eio(ramp(t, L(36) - 0.3, 0.8)), muf = eio(ramp(t, L(37) + 0.1, 0.8));
    setOpacity(exhaust, ex); setOpacity(muffler, muf); muffler.position.x = mufP[0] + 1.6 + (1 - muf) * -8;
    rings.forEach(function (rg, i) {
      var a = ((t * 1.3 + i / rings.length) % 1), loud = t < L(37) + 0.6 ? 1 : 0.25;
      rg.visible = ex > 0.9 && t < L(39) + 0.5; rg.scale.setScalar(0.3 + a * 2.6 * loud); rg.position.x = mufP[0] - 0.6 - a * 2.4 - (loud < 1 ? 2.2 : 0); rg.material.opacity = (1 - a) * (loud < 1 ? 0.5 : 0.95);
    });
    ANCH.muffler = muffler.localToWorld(V(0, 0.6, 0));
    // tank, starter, wheels
    var tk = eio(ramp(t, L(39), 0.8)), st = eio(ramp(t, L(40), 0.6));
    setOpacity(tank, tk); tank.position.set(-1.0, 1.0 + (1 - tk) * 7, -4.6);
    setOpacity(starter, st); starter.position.set(-0.4, 0.55 + (1 - st) * 6, 1.3);
    ANCH.tank = tank.localToWorld(V(0, 1.0, 0)); ANCH.starter = starter.localToWorld(V(0, 0.4, 0));
    var carK = eio(ramp(t, L(42), 1.4));
    var WP = [[-5.0, -2.25], [-5.0, 2.25], [4.6, -2.25], [4.6, 2.25]];
    carW.forEach(function (cw, i) {
      var a = eio(ramp(t, L(41) + i * 0.12, 0.6));
      setOpacity(cw, a); var fx = [-3, 0.6, 4.4, 8.2][i], fz = 3.4;
      cw.position.set(lerp(fx, WP[i][0], carK), lerp(1.25 + (1 - a) * 6, 1.25, a), lerp(fz, WP[i][1], carK)); cw.rotation.set(0, Math.PI / 2, 0);
    });
    // the earlier test wheel fades as the car wheels come
    setOpacity(wheel, 1); wheel.visible = wheelIn > 0 && carK < 0.5;
    var body = eio(ramp(t, L(42) + 0.5, 1.2));
    setOpacity(car, body); car.position.y = (1 - body) * 3.5;
    // the build shrinks into the nose and other parts tuck away under the body
    [tank, starter, muffler, rad].forEach(function (o) { if (carK > 0) setOpacity(o, (1 - carK)); });
    if (carK > 0) { setOpacity(hose, 1 - carK); setOpacity(hose2, 1 - carK); setOpacity(exhaust, 1 - carK); drops.forEach(function (d) { d.visible = false; }); }

    camAt(t);
    if (t > L(1) + 0.3 && t < L(5) + 0.4) {   // follow the flying cap up, then let it leave the top of the frame
      var fw = Math.min(eio((t - L(1) - 0.3) / 0.6), 1 - eio((t - L(5) + 0.4) / 0.8)), cy = Math.min(capY - 1.2, 10.5);
      tmpT.y = lerp(tmpT.y, Math.max(2.4, cy), fw); tmpE.y = lerp(tmpE.y, Math.max(3.2, cy - 1.0), fw); tmpE.z += fw * 2.5;
    }
    var O = window.__camOverride; if (O) { tmpE.set(O.eye[0], O.eye[1], O.eye[2]); tmpT.set(O.target[0], O.target[1], O.target[2]); }   // the cover's own shot
    cam.position.copy(tmpE); cam.lookAt(tmpT);
    sun.target.position.copy(tmpT); sun.position.set(tmpT.x - 14, 26, tmpT.z + 16);
    R.render(scene, cam);
  };
  var pv = V(0, 0, 0);
  window.__project = function (name) {
    var a = ANCH[name]; if (!a) return null; pv.copy(a).project(cam);
    return [(pv.x + 1) / 2 * 360, (1 - pv.y) / 2 * 640, pv.z];
  };
  window.__ANCH = ANCH;
})();
