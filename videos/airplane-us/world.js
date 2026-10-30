/* "How does a plane fly?" — real 3D world (three.js r149), a pure function of time.
   World units ≈ metres. +X = where the plane points, +Y = up, +Z = the plane's left wing.
   Colour meanings stay the brand's: air & lift blue, thrust & heat red, moving parts olive, weight ink. */
(function () {
  var T3 = THREE, LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, t) { return easeIO((t - a) / (b - a)); }
  function win(t, a, b, f) { f = f || 0.35; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var C = { paper: 0xece4d0, ink: 0x2b2620, heat: 0xc7502f, water: 0x2f6f9f, waterBody: 0x9cc3dc, olive: 0x8a9a5b, khaki: 0xc9bd9c,
            fuel: 0xd99a1e, white: 0xf4f1ea, grey: 0xd7d3c9, dark: 0x3b352e };
  function mat(c, o) { o = o || {}; return new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.05 }, o)); }

  // ── renderer, scene, camera ────────────────────────────────
  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false);
  R.outputEncoding = T3.sRGBEncoding; R.localClippingEnabled = true;
  var scene = new T3.Scene();
  var cam = new T3.PerspectiveCamera(40, 360 / 640, 0.5, 4000);
  scene.fog = new T3.Fog(0xdfe8ee, 400, 2400);

  // sky dome: soft blue top → warm paper horizon
  var sky = new T3.Mesh(new T3.SphereGeometry(3000, 32, 16), new T3.ShaderMaterial({
    side: T3.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T3.Color(0x5f97c4) }, mid: { value: new T3.Color(0xb9d4e6) }, bot: { value: new T3.Color(0xdce7ee) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h*1.6,0.0,1.0),0.8)) : mix(mid, bot, clamp(-h*4.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }"
  }));
  scene.add(sky);
  scene.add(new T3.HemisphereLight(0xdfeaf5, 0x8f8670, 0.55));
  var sun = new T3.DirectionalLight(0xfff0d6, 1.05); sun.position.set(60, 120, 80); scene.add(sun);

  // ── the airplane (a jumbo jet, built from code) ─────────────
  var plane = new T3.Group(); scene.add(plane);
  var body = new T3.Group(); plane.add(body);
  // fuselage: a lathe profile turned to lie along X, with a canvas livery (windows + red stripe)
  (function () {
    var prof = [], N = 40, Lf = 62, R0 = 3.1;
    for (var i = 0; i <= N; i++) {
      var u = i / N, x = -Lf / 2 + u * Lf, r;
      if (u < 0.18) r = R0 * Math.pow(Math.sin(u / 0.18 * Math.PI / 2), 0.55) * (0.55 + 0.45 * u / 0.18) + 0.25 * (1 - u / 0.18) * 0; else if (u > 0.86) r = R0 * Math.sqrt(1 - Math.pow((u - 0.86) / 0.14, 2) * 0.96);
      else r = R0;
      prof.push(new T3.Vector2(Math.max(r, 0.05), x));
    }
    prof[0].x = 0.4; // blunt tail cone
    var g = new T3.LatheGeometry(prof, 48); g.rotateZ(-Math.PI / 2);
    var cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; var x2 = cv.getContext("2d");
    x2.fillStyle = "#ebe6dc"; x2.fillRect(0, 0, 1024, 256);
    x2.fillStyle = "#d7d3c9"; x2.fillRect(0, 0, 1024, 40); // belly (u wraps around: rows = around, cols = along)
    // lathe uv: u around (0..1), v along profile → canvas x = v, y = u
    function stripe(y, h, c) { x2.fillStyle = c; x2.fillRect(120, y, 860, h); }
    stripe(98, 10, "#c7502f"); stripe(226 - 0, 10, "#c7502f");
    x2.fillStyle = "#3b352e"; for (var k = 0; k < 70; k++) { x2.fillRect(160 + k * 11.5, 84, 5, 8); x2.fillRect(160 + k * 11.5, 212, 5, 8); }
    x2.fillRect(925, 80, 22, 10); x2.fillRect(925, 206, 22, 10); // cockpit windows
    var tex = new T3.CanvasTexture(cv); tex.encoding = T3.sRGBEncoding;
    var m = new T3.Mesh(g, new T3.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.08 }));
    m.rotation.x = -Math.PI / 2 + Math.PI * 0.0; body.add(m);
    body.userData.fuse = m;
  })();

  // airfoil (unit chord, LE at x=0 → TE at x=-1), closed loop
  function airfoil(n, thick, camber) {
    var up = [], lo = [];
    for (var i = 0; i <= n; i++) {
      var b = i / n * Math.PI, xc = (1 - Math.cos(b)) / 2;
      var yt = 5 * thick * (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc * xc + 0.2843 * Math.pow(xc, 3) - 0.1036 * Math.pow(xc, 4));
      var yc = camber * 4 * xc * (1 - xc);
      up.push([-xc, yc + yt]); lo.push([-xc, yc - yt]);
    }
    return up.reverse().concat(lo.slice(1));
  }
  // a lofted wing: sections along `axis` (z for wings, y for the fin); bend(s) adds lift-side flex
  function loft(o) {
    var af = airfoil(18, o.thick || 0.12, o.camber || 0.03), M = af.length, N = o.n || 12;
    var pos = [], idx = [];
    for (var i = 0; i <= N; i++) {
      var s = i / N, ch = lerp(o.root, o.tip, s), xl = o.x - o.sweep * s, h = (o.dihedral || 0) * s;
      for (var j = 0; j < M; j++) {
        var px = xl + af[j][0] * ch, py = af[j][1] * ch;
        if (o.vertical) pos.push(px, o.y + s * o.span, py); else pos.push(px, o.y + py + h, o.side * s * o.span);
      }
    }
    for (i = 0; i < N; i++) for (j = 0; j < M - 1; j++) {
      var a = i * M + j, b2 = a + M;
      if (o.side < 0 && !o.vertical) idx.push(a, a + 1, b2, a + 1, b2 + 1, b2); else idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
    }
    var tipStart = N * M; for (j = 1; j < M - 2; j++) idx.push(tipStart, tipStart + j, tipStart + j + 1);
    var g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    g.userData = { base: pos.slice(), M: M, N: N };
    var mesh = new T3.Mesh(g, o.mat); mesh.userData.loft = o; return mesh;
  }
  var wingMat = mat(0xdedad0, { roughness: 0.5, side: T3.DoubleSide }), partMat = mat(C.olive, { side: T3.DoubleSide });
  var wings = [];
  [1, -1].forEach(function (side) {
    var w = loft({ x: 6, y: -1.6, root: 13, tip: 3.4, span: 30, sweep: 17, dihedral: 2.6, side: side, mat: wingMat, n: 16, thick: 0.13 });
    body.add(w); wings.push(w);
  });
  // control surfaces sit on the trailing edge and turn about their hinge
  function surface(o) {
    var piv = new T3.Group(); piv.position.set(o.hx, o.hy, o.hz); piv.rotation.y = o.ry || 0; if (o.rz) piv.rotation.z = o.rz;
    var g = new T3.BoxGeometry(o.chord, o.t || 0.28, o.len); g.translate(-o.chord / 2, 0, 0);
    var m = new T3.Mesh(g, partMat); piv.add(m); return piv;
  }
  var sweepAng = Math.atan2(17, 30);
  function wingTE(s, side) { var ch = lerp(13, 3.4, s); return [6 - 17 * s - ch, -1.6 + 2.6 * s, side * 30 * s]; }
  var ailerons = [], flaps = [];
  [1, -1].forEach(function (side) {
    var a0 = wingTE(0.66, side), f0 = wingTE(0.12, side);
    var ai = surface({ hx: a0[0] + 1.6, hy: a0[1] + 0.05, hz: a0[2] + side * 4.2, ry: side * sweepAng * 0.86, chord: 1.9, len: 8.4 }); body.add(ai); ailerons.push(ai);
    var fl = surface({ hx: f0[0] + 2.6, hy: f0[1] - 0.05, hz: f0[2] + side * 7.5, ry: side * sweepAng * 0.6, chord: 3.0, len: 14 }); body.add(fl); flaps.push(fl);
  });
  // tail: horizontal stabilisers + elevator, fin + rudder
  [1, -1].forEach(function (side) { body.add(loft({ x: -21.5, y: 1.2, root: 6.5, tip: 2.4, span: 10.5, sweep: 6.5, dihedral: 1.2, side: side, mat: wingMat, n: 6, thick: 0.1, camber: 0 })); });
  var elevator = new T3.Group(); body.add(elevator);
  [1, -1].forEach(function (side) { elevator.add(surface({ hx: -27.6, hy: 1.4, hz: side * 5.2, ry: side * 0.5, chord: 1.6, len: 9 })); });
  body.add(loft({ x: -19, y: 2.4, root: 9, tip: 3.6, span: 11.5, sweep: 9, side: 1, vertical: true, mat: wingMat, n: 6, thick: 0.1, camber: 0 }));
  var rudPiv = new T3.Group(); rudPiv.position.set(-27.4, 2.8, 0); body.add(rudPiv);
  (function () { var g = new T3.BoxGeometry(2.2, 10.6, 0.32); g.translate(-1.1, 5.3, 0); var m = new T3.Mesh(g, partMat); m.rotation.z = -0.62; rudPiv.add(m); })();
  // four engines under the wings, each with a spinning fan
  var fans = [];
  [[0.3, 1], [0.6, 1], [0.3, -1], [0.6, -1]].forEach(function (e) {
    var s = e[0], side = e[1], le = [6 - 17 * s, -1.6 + 2.6 * s, side * 30 * s];
    var g = new T3.Group(); g.position.set(le[0] + 1, le[1] - 2.6, le[2]); body.add(g);
    var nac = new T3.Mesh(new T3.CylinderGeometry(1.55, 1.25, 6.4, 28, 1, true), mat(0xe7e3da, { side: T3.DoubleSide, roughness: .4 })); nac.rotation.z = Math.PI / 2; g.add(nac);
    var lip = new T3.Mesh(new T3.TorusGeometry(1.5, 0.16, 10, 28), mat(C.heat)); lip.rotation.y = Math.PI / 2; lip.position.x = 3.2; g.add(lip);
    var fan = new T3.Group(); fan.position.x = 2.7; g.add(fan); fans.push(fan);
    fan.add(new T3.Mesh(new T3.CylinderGeometry(1.4, 1.4, 0.1, 24), mat(0x4a443b)).rotateZ(Math.PI / 2));
    for (var k = 0; k < 14; k++) { var bl = new T3.Mesh(new T3.BoxGeometry(0.08, 1.25, 0.32), mat(0x8d877c, { metalness: .4 })); bl.position.y = 0.7; var h = new T3.Group(); h.rotation.x = k / 14 * Math.PI * 2; bl.rotation.y = 0.5; h.add(bl); fan.add(h); }
    var hub = new T3.Mesh(new T3.ConeGeometry(0.45, 0.9, 16), mat(0xf4f1ea)); hub.rotation.z = -Math.PI / 2; hub.position.x = 0.5; fan.add(hub);
    var py = new T3.Mesh(new T3.BoxGeometry(4, 2.0, 0.4), wingMat); py.position.set(-0.6, 1.6, 0); g.add(py);
  });
  // landing gear (shown on the runway)
  var gear = new T3.Group(); body.add(gear);
  [[18, 0], [-3, 3.2], [-3, -3.2], [-6, 5.5], [-6, -5.5]].forEach(function (p) {
    var st = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.22, 2.4, 8), mat(0x8d877c)); st.position.set(p[0], -3.6, p[1]); gear.add(st);
    var wh = new T3.Mesh(new T3.CylinderGeometry(0.75, 0.75, 0.6, 18), mat(C.dark)); wh.rotation.x = Math.PI / 2; wh.position.set(p[0], -4.8, p[1]); gear.add(wh);
  });

  // ── 3D arrows for the four forces ─────────────────────────────
  function arrow(color) {
    var g = new T3.Group(), m = mat(color, { roughness: .45, emissive: color, emissiveIntensity: 0.12 });
    var shaft = new T3.Mesh(new T3.CylinderGeometry(1.9, 1.9, 1, 16), m); shaft.position.y = 0.5; g.add(shaft);
    var head = new T3.Mesh(new T3.ConeGeometry(4.4, 8.4, 20), m); g.add(head);
    g.userData = { shaft: shaft, head: head };
    g.setLen = function (len) { len = Math.max(0.01, len); shaft.scale.y = len; shaft.position.y = len / 2; head.position.y = len + 4.2; g.visible = len > 0.05; };
    return g;
  }
  var forces = new T3.Group(); plane.add(forces);
  var fLift = arrow(C.water), fWeight = arrow(C.ink), fThrust = arrow(C.heat), fDrag = arrow(0x8d877c);
  fLift.position.set(0, 4, 0); fWeight.rotation.z = Math.PI; fWeight.position.set(0, -4, 0);
  fThrust.rotation.z = -Math.PI / 2; fThrust.position.set(33, 0, 0); fDrag.rotation.z = Math.PI / 2; fDrag.position.set(-30, 0, 0);
  forces.add(fLift, fWeight, fThrust, fDrag);

  // ── clouds: instanced puffs, drifting past ─────────────────
  var CLN = 220, clouds = new T3.InstancedMesh(new T3.IcosahedronGeometry(1, 2), mat(0xffffff, { roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25 }), CLN);
  var cl = [];
  for (var i = 0; i < 30; i++) {
    var cx = rnd() * 1600 - 800, cz = rnd() * 900 - 450, cy = -45 - rnd() * 25;
    for (var k = 0; k < 7; k++) cl.push([cx + (rnd() - .5) * 40, cy + rnd() * 10, cz + (rnd() - .5) * 30, 8 + rnd() * 12]);
  }
  scene.add(clouds);
  var dummy = new T3.Object3D();
  function placeClouds(off, dy) {
    for (var i = 0; i < CLN; i++) {
      var c = cl[i % cl.length], x = ((c[0] - off) % 1600 + 2400) % 1600 - 800;
      dummy.position.set(x, c[1] + dy, c[2]); dummy.scale.set(c[3] * 1.4, c[3] * 0.7, c[3]); dummy.updateMatrix(); clouds.setMatrixAt(i, dummy.matrix);
    }
    clouds.instanceMatrix.needsUpdate = true;
  }

  // ── runway world ─────────────────────────────────────────────
  var ground = new T3.Group(); scene.add(ground);
  var gnd = new T3.Mesh(new T3.PlaneGeometry(6000, 6000), mat(0xc4bf95, { roughness: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -5.6; ground.add(gnd);
  var rw = new T3.Mesh(new T3.PlaneGeometry(6000, 46), mat(0x5d574d, { roughness: .9 })); rw.rotation.x = -Math.PI / 2; rw.position.y = -5.55; ground.add(rw);
  var DSH = 60, dashes = new T3.InstancedMesh(new T3.PlaneGeometry(14, 1.2), mat(0xf4f1ea, { roughness: .8 }), DSH); dashes.rotation.x = -Math.PI / 2; dashes.position.y = -5.5; ground.add(dashes);
  var edgeL = new T3.InstancedMesh(new T3.SphereGeometry(0.5, 8, 6), mat(0xf2b705, { emissive: 0xf2b705, emissiveIntensity: .6 }), DSH * 2); ground.add(edgeL);
  function placeRunway(dist) {
    for (var i = 0; i < DSH; i++) {
      var x = ((i * 30 - dist) % (DSH * 30) + DSH * 30) % (DSH * 30) - 500;
      dummy.position.set(x, -x * 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); dashes.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, -5.2, 24); dummy.updateMatrix(); edgeL.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, -5.2, -24); dummy.updateMatrix(); edgeL.setMatrixAt(i + DSH, dummy.matrix);
    }
    dashes.instanceMatrix.needsUpdate = true; edgeL.instanceMatrix.needsUpdate = true;
  }

  // ── particle helper: instanced dots along precomputed tracks ──
  function dots(n, r, color) {
    var m = new T3.InstancedMesh(new T3.SphereGeometry(r, 10, 8), new T3.MeshBasicMaterial({ color: color, transparent: true }), n);
    m.frustumCulled = false; return m;
  }
  function setDot(m, i, x, y, z, s) { dummy.position.set(x, y, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }

  // ── the jet engine, cut in half ─────────────────────────────
  var eng = new T3.Group(); scene.add(eng); eng.position.set(0, 400, 0);
  var cut = [new T3.Plane(new T3.Vector3(0, 0, -1), 0)];
  (function () {
    var nac = new T3.Mesh(new T3.CylinderGeometry(5.2, 4.2, 18, 48, 1, true), mat(0xe7e3da, { side: T3.DoubleSide, clippingPlanes: cut, roughness: .4 }));
    nac.rotation.z = Math.PI / 2; nac.position.x = 0; eng.add(nac);
    var lip = new T3.Mesh(new T3.TorusGeometry(5.1, 0.45, 12, 48, Math.PI), mat(C.heat)); lip.rotation.y = Math.PI / 2; lip.rotation.x = Math.PI; lip.position.x = 9; eng.add(lip);
    var core = new T3.Mesh(new T3.CylinderGeometry(2.7, 2.3, 14, 40, 1, true), mat(0xbdb7aa, { side: T3.DoubleSide, clippingPlanes: cut })); core.rotation.z = Math.PI / 2; core.position.x = -2; eng.add(core);
    var cone = new T3.Mesh(new T3.ConeGeometry(1.4, 4, 24), mat(0x8d877c, { metalness: .4 })); cone.rotation.z = Math.PI / 2; cone.position.x = -10.5; eng.add(cone);
    var shaft = new T3.Mesh(new T3.CylinderGeometry(0.3, 0.3, 18, 10), mat(0x8d877c, { metalness: .5 })); shaft.rotation.z = Math.PI / 2; shaft.position.x = -1; eng.add(shaft);
  })();
  function bladeRing(x, r0, r1, n, color, w, twist) {
    var g = new T3.Group(); g.position.x = x;
    var hub = new T3.Mesh(new T3.CylinderGeometry(r0, r0, w * 1.2, 24), mat(0x8d877c, { metalness: .4 })); hub.rotation.z = Math.PI / 2; g.add(hub);
    for (var k = 0; k < n; k++) { var b = new T3.Mesh(new T3.BoxGeometry(w, r1 - r0, 0.12 + (r1 - r0) * 0.12), mat(color, { metalness: .35, roughness: .4 })); b.position.y = (r0 + r1) / 2; b.rotation.y = twist; var h = new T3.Group(); h.rotation.x = k / n * Math.PI * 2; h.add(b); g.add(h); }
    eng.add(g); return g;
  }
  var bigFan = bladeRing(7, 1.2, 4.9, 20, 0x8d877c, 0.5, 0.55);
  var spinner = new T3.Mesh(new T3.ConeGeometry(1.3, 2.4, 24), mat(0xf4f1ea)); spinner.rotation.z = -Math.PI / 2; spinner.position.x = 8.4; eng.add(spinner);
  var comp = [], turb = [];
  for (var c2 = 0; c2 < 6; c2++) comp.push(bladeRing(4.6 - c2 * 1.05, 0.8, 2.4 - c2 * 0.14, 18, C.olive, 0.35, 0.4));
  var burner = new T3.Mesh(new T3.TorusGeometry(1.75, 0.55, 14, 40), mat(0xf08a3c, { emissive: 0xf05a1e, emissiveIntensity: 0.2 })); burner.rotation.y = Math.PI / 2; burner.position.x = -2.4; eng.add(burner);
  for (var t2 = 0; t2 < 3; t2++) turb.push(bladeRing(-4.4 - t2 * 1.1, 0.9, 2.2 + t2 * 0.12, 16, C.heat, 0.4, -0.45));
  // engine flows: intake (blue), bypass (blue), core (blue → amber → red), exhaust (red)
  var ENG_N = 260, engDots = dots(ENG_N, 0.22, 0xffffff); eng.add(engDots);
  var engCol = new Float32Array(ENG_N * 3); engDots.instanceColor = new T3.InstancedBufferAttribute(engCol, 3);
  var cWater = new T3.Color(C.water), cFuel = new T3.Color(C.fuel), cHeat = new T3.Color(0xf05a1e), cTmp = new T3.Color();
  var engTracks = [];
  for (var e2 = 0; e2 < ENG_N; e2++) engTracks.push({ k: rnd(), a: rnd() * Math.PI, bypass: e2 % 3 !== 0, rr: rnd() });

  // ── the wing section in a wind stream ───────────────────────
  var foil = new T3.Group(); scene.add(foil); foil.position.set(0, -400, 0);
  var foilAoA = 0.11;
  (function () {
    var af = airfoil(40, 0.13, 0.05), sh = new T3.Shape();
    af.forEach(function (p, i) { var x = (p[0] + 0.5) * 12, y = p[1] * 12; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); });
    var g = new T3.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); g.translate(0, 0, -7);
    var m = new T3.Mesh(g, mat(0xb9b3a6, { roughness: .45 })); foil.add(m);
    var edge = new T3.Mesh(new T3.ShapeGeometry(sh), mat(0x8f8670, { side: T3.DoubleSide })); edge.position.z = 7.01; foil.add(edge);
    var rim = new T3.Line(new T3.BufferGeometry().setFromPoints(af.map(function (p) { return new T3.Vector3((p[0] + 0.5) * 12, p[1] * 12, 7.05); })), new T3.LineBasicMaterial({ color: C.ink })); foil.add(rim); foil.userData.rim = rim;
    foil.userData.body = new T3.Group(); foil.userData.body.add(m, edge, rim); foil.add(foil.userData.body); foil.userData.body.rotation.z = foilAoA;
  })();
  var lowP = new T3.Mesh(new T3.PlaneGeometry(14, 5), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); lowP.position.set(0, 3.4, 7.2); foil.add(lowP);
  var highP = new T3.Mesh(new T3.PlaneGeometry(14, 5), new T3.MeshBasicMaterial({ color: C.water, transparent: true, opacity: 0, depthWrite: false })); highP.position.set(0, -3.2, 7.2); foil.add(highP);
  var foilLift = arrow(C.water); foilLift.scale.setScalar(0.5); foilLift.position.set(0.6, 2.2, 7.4); foil.add(foilLift);
  var downArrow = arrow(C.water); downArrow.rotation.z = Math.PI * 0.62; downArrow.position.set(-6.4, -1.0, 7.4); foil.add(downArrow); downArrow.scale.setScalar(0.3);
  // streamlines: y(x) bends around the wing and is pushed down behind it; time tables give the speed-up on top
  var SL = [-4.2, -2.8, -1.6, -0.7, 0.9, 1.9, 3.0, 4.4], SL_N = 9, streams = [], foilDots = dots(SL.length * SL_N, 0.22, C.water); foil.add(foilDots);
  function surf(x, top) {  // the tilted section's upper/lower surface height at x
    var xc = clamp((6 - x) / 12), b = 0.13 * 12 * 5 * (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc * xc + 0.2843 * xc * xc * xc - 0.1036 * xc * xc * xc * xc), c = 0.05 * 12 * 4 * xc * (1 - xc);
    return (top ? c + b : c - b) + x * Math.tan(foilAoA);
  }
  SL.forEach(function (y0) {
    var top = y0 > 0, k = Math.exp(-Math.abs(y0) / 2.6), xs = [], ys = [], tt = [0], tot = 0;
    for (var i = 0; i <= 240; i++) {
      var x = 22 - i * 44 / 240, inC = x <= 6 && x >= -6 ? 1 : 0, f = x > 6 ? Math.exp(-(x - 6) / 3) : x < -6 ? 1 : 1;
      var bump = (x > 6 ? Math.exp(-(x - 6) / 2.5) * (top ? 0.6 : -0.2) * k : 0) + (inC ? (surf(x, top) - (top ? 0 : 0)) * k * 1.05 : 0);
      var down = x < 6 ? -(6 - Math.max(x, -22)) * 0.11 * (0.4 + k) : 0;
      var y = y0 + bump + down;
      if (inC && top) y = Math.max(y, surf(x, true) + 0.35); if (inC && !top) y = Math.min(y, surf(x, false) - 0.35);
      xs.push(x); ys.push(y);
      if (i) { var v = 6 * (1 + (inC || (x < 6 && x > -9) ? (top ? 0.75 * k + 0.25 : -0.25 * k) : 0)); tot += (44 / 240) / v; tt.push(tot); }
    }
    streams.push({ xs: xs, ys: ys, tt: tt, tot: tot });
  });
  var foilLines = new T3.Group(); foil.add(foilLines);
  streams.forEach(function (s) {
    var pts = s.xs.map(function (x, i) { return new T3.Vector3(x, s.ys[i], 7.15); });
    foilLines.add(new T3.Line(new T3.BufferGeometry().setFromPoints(pts), new T3.LineBasicMaterial({ color: C.water, transparent: true, opacity: 0.35 })));
  });
  function streamPos(s, tau) {
    var u = ((tau % s.tot) + s.tot) % s.tot, lo = 0, hi = s.tt.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (s.tt[mid] < u) lo = mid; else hi = mid; }
    var f = (u - s.tt[lo]) / (s.tt[hi] - s.tt[lo] || 1); return [lerp(s.xs[lo], s.xs[hi], f), lerp(s.ys[lo], s.ys[hi], f), u / s.tot];
  }

  // ── hand out of a car window ───────────────────────────────
  var handW = new T3.Group(); scene.add(handW); handW.position.set(0, 800, 0);
  (function () {
    var car = mat(0xc7502f, { roughness: .35, metalness: .2 }), glass = new T3.MeshStandardMaterial({ color: 0x9cc3dc, transparent: true, opacity: .45, roughness: .1 });
    var door = new T3.Mesh(new T3.BoxGeometry(22, 9, 1.2), car); door.position.set(-6, -8, -3); handW.add(door);
    var sill = new T3.Mesh(new T3.BoxGeometry(22, 0.8, 2.2), mat(C.dark)); sill.position.set(-6, -3.4, -3); handW.add(sill);
    var post = new T3.Mesh(new T3.BoxGeometry(1.2, 9, 1.2), mat(C.dark)); post.position.set(4.4, 1.2, -3); handW.add(post);
    var roof = new T3.Mesh(new T3.BoxGeometry(22, 1, 2.4), car); roof.position.set(-6, 6, -3.6); handW.add(roof);
    var gl = new T3.Mesh(new T3.PlaneGeometry(9, 8.6), glass); gl.position.set(9, 1.2, -3.6); handW.add(gl);
    var mirror = new T3.Mesh(new T3.BoxGeometry(2, 1.4, 1.2), car); mirror.position.set(6.6, -2.2, -1.6); handW.add(mirror);
  })();
  var hand = new T3.Group(); handW.add(hand); hand.position.set(-2, -1.8, 4);
  (function () {
    var skin = mat(0xd9a982, { roughness: .7 });
    var arm = new T3.Mesh(new T3.CapsuleGeometry(1.1, 7, 6, 14), skin); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0, -5.5); hand.add(arm);
    var palm = new T3.Mesh(new T3.CapsuleGeometry(1.3, 1.6, 6, 14), skin); palm.scale.set(1.25, 0.42, 1); palm.rotation.z = Math.PI / 2; palm.position.set(2.0, 0, 0); hand.add(palm);
    for (var f = 0; f < 4; f++) { var fg = new T3.Mesh(new T3.CapsuleGeometry(0.34, 2.2, 4, 10), skin); fg.rotation.z = Math.PI / 2; fg.position.set(5.0, 0, -1.05 + f * 0.7); hand.add(fg); }
    var th = new T3.Mesh(new T3.CapsuleGeometry(0.38, 1.6, 4, 10), skin); th.rotation.set(0, 0.9, Math.PI / 2); th.position.set(2.4, 0, 1.9); hand.add(th);
  })();
  var handLift = arrow(C.water); handLift.scale.setScalar(0.2); handLift.position.set(2.5, 1.2, 0); hand.add(handLift);
  var HN = 40, handDots = dots(HN, 0.22, C.water); handW.add(handDots);

  // ── what shows when ────────────────────────────────────────
  // modes: sky (plane in the air), engine, runway, foil, hand
  function mode(t) {
    if (t < L(9) - 0.1) return "sky";
    if (t < L(15) - 0.1) return "engine";
    if (t < L(17) - 0.1) return "runway";
    if (t < L(23) - 0.1) return "foil";
    if (t < L(25) - 0.1) return "hand";
    if (t < L(28) - 0.1) return "runway";
    return "sky";
  }
  // camera shots: [time, position, target, fov]; positions relative to the group shown
  function P(x, y, z) { return new T3.Vector3(x, y, z); }
  var SH = {
    sky: [[0, P(70, 22, 90), P(0, 0, 0), 42], [L(1), P(-30, 30, 110), P(0, 0, 0), 40], [L(2), P(10, 26, 52), P(4, -1, 14), 40],
          [L(4), P(0, 4, 150), P(0, 0, 0), 38], [L(8), P(26, -2, 52), P(4, -3, 10), 34],
          [L(28), P(-80, 26, 0), P(0, 0, 0), 40], [L(29), P(-70, 30, 18), P(0, 0, 0), 40], [L(30), P(-14, 10, 70), P(-12, 1, 0), 40],
          [L(31), P(-70, 34, -20), P(-6, 3, 0), 40], [L(32), P(60, 40, 110), P(0, 0, 0), 44], [L(33), P(20, 6, 70), P(0, 2, 18), 40],
          [L(34), P(110, 30, -90), P(0, 0, 0), 44]],
    engine: [[L(9), P(14, 6, 30), P(0, 0, 0), 40], [L(11), P(24, 5, 18), P(4, 0, 0), 40], [L(12), P(2, 4, 22), P(0, 0, 0), 40],
             [L(13), P(-10, 4, 24), P(-5, 0, 0), 40], [L(14), P(6, 9, 34), P(-1, 0, 0), 42]],
    runway: [[L(15), P(60, 6, 50), P(0, -1, 0), 42], [L(16), P(20, 6, 52), P(2, -1, 14), 38],
             [L(25), P(-26, 14, 30), P(-8, -1, 14), 40], [L(26), P(-30, 10, 34), P(-8, -1, 14), 40], [L(27), P(70, 4, 60), P(0, 3, 0), 42]],
    foil: [[L(17), P(4, 3, 44), P(0, 0, 0), 40], [L(18), P(-2, 2, 48), P(-3, -1, 0), 40], [L(20), P(0, 4, 44), P(0, 1, 0), 40],
           [L(21), P(0, 0, 46), P(0, 0, 0), 40]],
    hand: [[L(23), P(24, 6, 38), P(0, 0, 0), 40], [L(24), P(20, 8, 36), P(1, 1, 0), 40]]
  };
  var vA = new T3.Vector3(), vB = new T3.Vector3();
  function shot(list, t) {
    var a = list[0], b = list[0];
    for (var i = 0; i < list.length; i++) if (list[i][0] <= t) { a = list[i - 1] || list[i]; b = list[i]; }
    var k = easeIO((t - b[0]) / 1.1); if (t < b[0]) k = 0;
    return { pos: vA.copy(a[1]).lerp(b[1], k).clone(), tgt: vB.copy(a[2]).lerp(b[2], k).clone(), fov: lerp(a[3], b[3], k) };
  }

  // plane attitude + control surfaces over time
  function planeState(t) {
    var s = { roll: 0, pitch: 0, yaw: 0, ail: 0, elev: 0, rud: 0, flap: 0, y: 0, bend: 0 };
    s.pitch = 0.02 * Math.sin(t * 0.7); s.roll = 0.03 * Math.sin(t * 0.5);
    if (t > L(29) && t < L(30)) { var a = Math.sin((t - L(29)) * 3.2); s.ail = 0.35 * a; s.roll = 0.42 * a; }
    if (t > L(30) && t < L(31)) { var e = Math.sin((t - L(30)) * 3.0); s.elev = 0.32 * e; s.pitch = 0.16 * e; }
    if (t > L(31) && t < L(32)) { var r = Math.sin((t - L(31)) * 3.4); s.rud = 0.4 * r; s.yaw = 0.18 * r; }
    s.flap = smooth(L(25) + 0.3, L(25) + 1.6, t) * (1 - smooth(L(28) - 0.6, L(28), t));
    if (t > L(27) && t < L(28)) { s.pitch = 0.17 * smooth(L(27) + 0.4, L(27) + 1.4, t); s.y = 9 * smooth(L(27) + 1.0, L(28), t); }
    var fx = t - L(33); if (fx > 0) s.bend = (fx < 1.4 ? easeIO(fx / 1.4) : 1) * (0.85 + 0.15 * Math.sin(fx * 5));
    s.bend *= 1 - smooth(L(34) + 0.4, L(34) + 1.4, t);
    return s;
  }
  function bendWing(w, amt) {
    var g = w.geometry, base = g.userData.base, p = g.attributes.position.array, M = g.userData.M, N = g.userData.N;
    for (var i = 0; i <= N; i++) { var s = i / N, dy = amt * 7.6 * s * s; for (var j = 0; j < M; j++) { var q = (i * M + j) * 3; p[q] = base[q]; p[q + 1] = base[q + 1] + dy; p[q + 2] = base[q + 2]; } }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  var lastBend = -1;

  // projected anchor points for the HTML labels
  var anchors = {};
  function anchor(name, obj, local) { anchors[name] = { obj: obj, local: local }; }
  anchor("plane", body, P(0, 0, 0)); anchor("wing", body, P(-2, 1, 20)); anchor("engine", body, P(-2, -4, 9));
  anchor("lift", forces, P(0, 42, 0)); anchor("weight", forces, P(0, -40, 0)); anchor("thrust", forces, P(66, 6, 0)); anchor("drag", forces, P(-62, 6, 0));
  anchor("fan", eng, P(7, 6.5, 0)); anchor("comp", eng, P(2.5, 4, 0)); anchor("burn", eng, P(-2.4, 3.8, 0)); anchor("turb", eng, P(-5.5, 4, 0)); anchor("bypass", eng, P(-9, 5.6, 0));
  anchor("low", foil, P(0, 5.4, 7)); anchor("high", foil, P(0, -5.6, 7)); anchor("foilLift", foil, P(1, 13, 7)); anchor("down", foil, P(-12, -5, 7));
  anchor("flap", body, P(-5, -2, 16)); anchor("aileron", body, P(-15, 0, 26)); anchor("elevator", body, P(-27, 2, 7)); anchor("rudder", body, P(-27, 12, 0));
  anchor("tip", body, P(-12, 4, 30)); anchor("handLift", hand, P(2.5, 7, 0));
  var tmpV = new T3.Vector3();
  window.__project = function (name) {
    var a = anchors[name]; if (!a) return null;
    a.obj.updateWorldMatrix(true, false); tmpV.copy(a.local).applyMatrix4(a.obj.matrixWorld).project(cam);
    return [(tmpV.x * 0.5 + 0.5) * 360, (1 - (tmpV.y * 0.5 + 0.5)) * 640, tmpV.z];
  };

  window.__world = function (t) {
    var m = mode(t), list = SH[m], sh = shot(list, t);
    plane.visible = m === "sky" || m === "runway"; ground.visible = m === "runway"; eng.visible = m === "engine"; foil.visible = m === "foil"; handW.visible = m === "hand";
    clouds.visible = m !== "engine" && m !== "foil" && m !== "hand";
    var base = m === "engine" ? eng.position : m === "foil" ? foil.position : m === "hand" ? handW.position : plane.position;
    // the plane
    var ps = planeState(t);
    plane.position.set(0, m === "runway" ? ps.y : 0, 0);
    body.rotation.set(ps.roll, ps.yaw, ps.pitch, "YZX");
    ailerons[0].children[0].rotation.z = -ps.ail; ailerons[1].children[0].rotation.z = ps.ail;
    elevator.children.forEach(function (e) { e.children[0].rotation.z = -ps.elev; });
    rudPiv.rotation.y = ps.rud;
    flaps.forEach(function (f, i) { f.children[0].rotation.z = -0.5 * ps.flap; f.children[0].position.x = -1.6 * ps.flap; f.children[0].position.y = -0.4 * ps.flap; });
    if (Math.abs(ps.bend - lastBend) > 1e-4) { wings.forEach(function (w) { bendWing(w, ps.bend); }); lastBend = ps.bend; }
    fans.forEach(function (f) { f.rotation.x = t * 14; });
    gear.visible = m === "runway" && t < L(28) - 0.3;
    // forces (4–7)
    var fOn = win(t, L(4) + 0.4, L(8)), grow = 1 + 0.4 * smooth(L(7) + 0.3, L(7) + 1.4, t);
    forces.visible = fOn > 0 && m === "sky";
    fLift.setLen(fOn * smooth(L(5) + 1.0, L(5) + 1.6, t) * 22 * grow); fWeight.setLen(fOn * smooth(L(5) + 0.1, L(5) + 0.7, t) * 22);
    fThrust.setLen(fOn * smooth(L(6) + 0.1, L(6) + 0.7, t) * 18 * grow); fDrag.setLen(fOn * smooth(L(6) + 1.3, L(6) + 1.9, t) * 18);
    if (t > L(32)) fDrag.setLen(0);
    // clouds drift by; climb at 32 puts them far below
    var climb = smooth(L(32), L(32) + 2.5, t);
    placeClouds(t * 120, -climb * 60 + (m === "runway" ? 200 : 0));
    sky.material.uniforms.top.value.setHex(climb > 0 ? 0x3f7fb5 : 0x5f97c4);
    // runway rolling
    var dist = 0; if (t > L(15) - 1) dist = 30 * (t - L(15) + 1) + 18 * Math.pow(Math.max(0, t - L(15)), 2);
    if (t > L(25) - 1) dist = 40 * (t - L(25) + 1) + 26 * Math.pow(Math.max(0, t - L(26)), 2);
    placeRunway(dist);
    // engine spin + flows
    if (m === "engine") {
      bigFan.rotation.x = t * 5; comp.forEach(function (c, i) { c.rotation.x = t * (7 + i); }); turb.forEach(function (c, i) { c.rotation.x = -t * 9; });
      var burnOn = smooth(L(12) + 1.6, L(12) + 2.2, t); burner.material.emissiveIntensity = 0.2 + 1.6 * burnOn * (0.85 + 0.15 * Math.sin(t * 30));
      var flowOn = smooth(L(11) - 0.5, L(11) + 0.3, t);
      for (var i = 0; i < ENG_N; i++) {
        var tr = engTracks[i], u = ((tr.k + t * 0.32) % 1), x = 16 - u * 34, r, col;
        if (tr.bypass) { r = x > 6 ? 1.5 + tr.rr * 3.2 : 3.2 + tr.rr * 1.3; col = cWater; }
        else { r = x > 6 ? 0.4 + tr.rr * 1.0 : x > -6 ? 1.1 + tr.rr * 0.6 * (x + 6) / 12 : 0.6 + tr.rr * 1.2; col = x > -1 ? (x > 1 ? cWater : cFuel) : cHeat; if (t < L(12) + 1.6 && x < -1) col = cWater; }
        var a = tr.a + u * 2.0, y = Math.cos(a) * r, z = -Math.abs(Math.sin(a) * r);
        var vis = flowOn * (tr.bypass ? smooth(L(14), L(14) + 0.6, t) * 0.9 + 0.1 : 1);
        setDot(engDots, i, x, y, z, vis); cTmp.copy(col); engCol[i * 3] = cTmp.r; engCol[i * 3 + 1] = cTmp.g; engCol[i * 3 + 2] = cTmp.b;
      }
      engDots.instanceMatrix.needsUpdate = true; engDots.instanceColor.needsUpdate = true;
    }
    // foil flows + pressure
    if (m === "foil") {
      var on = smooth(L(17) + 0.4, L(17) + 1.2, t), fast = smooth(L(20), L(20) + 0.8, t);
      streams.forEach(function (s, si) {
        for (var k = 0; k < SL_N; k++) { var q = streamPos(s, t * (1 + 0.6 * fast * (SL[si] > 0 ? 1 : 0)) + k / SL_N * s.tot); setDot(foilDots, si * SL_N + k, q[0], q[1], 7.3, on * Math.min(1, q[2] * 10, (1 - q[2]) * 10)); }
      });
      foilDots.instanceMatrix.needsUpdate = true;
      foilLines.children.forEach(function (l) { l.material.opacity = 0.35 * on; });
      lowP.material.opacity = 0.28 * smooth(L(21), L(21) + 0.6, t); highP.material.opacity = 0.32 * smooth(L(21), L(21) + 0.6, t);
      foilLift.setLen(11 * smooth(L(19) + 0.6, L(19) + 1.3, t) * (1 + 0.25 * smooth(L(22), L(22) + 0.8, t)) * (1 + 0.04 * Math.sin(t * 6)));
      downArrow.visible = t > L(18) + 1.0; downArrow.setLen(18 * smooth(L(18) + 1.0, L(18) + 1.6, t));
    }
    // hand out the window
    if (m === "hand") {
      var tilt = 0.32 * smooth(L(24) + 0.1, L(24) + 0.9, t);
      hand.rotation.z = tilt; hand.position.y = -1.8 + 3.2 * smooth(L(24) + 0.8, L(24) + 1.6, t) + 0.15 * Math.sin(t * 7);
      handLift.setLen(16 * smooth(L(24) + 0.6, L(24) + 1.3, t));
      for (var h = 0; h < HN; h++) { var u2 = ((h * 0.618 + t * 0.9) % 1), yy = ((h * 37) % 9) - 4.5; setDot(handDots, h, 22 - u2 * 40, yy * 0.9 + (u2 > 0.45 && u2 < 0.6 ? (yy > 0 ? 0.6 : -0.6) : 0), 4 + ((h * 13) % 5) - 2, 1); }
      handDots.instanceMatrix.needsUpdate = true;
    }
    // camera, with a slow drift so nothing ever sits still
    var far = m === "sky" || m === "runway" ? 1.7 : 1, rel = sh.pos.clone().sub(sh.tgt).multiplyScalar(far);
    var tgt = sh.tgt.clone().add(base), pos = rel.add(tgt);
    var dr = 0.05 * Math.sin(t * 0.35); pos.sub(tgt).applyAxisAngle(new T3.Vector3(0, 1, 0), dr).add(tgt);
    if (m === "runway" && t > L(27)) tgt.y += plane.position.y;
    cam.position.copy(pos); cam.lookAt(tgt); cam.fov = sh.fov; cam.updateProjectionMatrix();
    R.render(scene, cam);
  };
})();
