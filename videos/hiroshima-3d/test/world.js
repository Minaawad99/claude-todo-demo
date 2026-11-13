/* «هيروشيما ساعة بساعة» — 3D test: a toon-shaded city of thousands of tiled houses on the river delta, the T-shaped
   Aioi Bridge, the Industrial Promotion Hall with its green dome, a B-29 crossing, and two bean characters in a street.
   three.js r149, a pure function of time (renderAt(t)). World units ≈ metres. */
(function () {
  var T3 = THREE;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var canvas = document.getElementById("gl");
  var R = new T3.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false); R.outputEncoding = T3.LinearEncoding;
  var cam = new T3.PerspectiveCamera(42, 360 / 640, 0.3, 6000);

  // toon look: 3-step light ramp + an ink outline (inverted hull)
  var ramp = new T3.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, T3.RGBAFormat);
  ramp.minFilter = ramp.magFilter = T3.NearestFilter; ramp.needsUpdate = true;
  function toon(c, o) { return new T3.MeshToonMaterial(Object.assign({ color: c, gradientMap: ramp }, o || {})); }
  var INKM = new T3.MeshBasicMaterial({ color: 0x1b1d22, side: T3.BackSide });
  function inked(geo, m, w) { var g = new T3.Group(), a = new T3.Mesh(geo, m), b = new T3.Mesh(geo, INKM); b.scale.setScalar(1 + (w || .04)); g.add(a, b); return g; }
  function skyMat(top, mid, bot) { return new T3.ShaderMaterial({ side: T3.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T3.Color(top) }, mid: { value: new T3.Color(mid) }, bot: { value: new T3.Color(bot) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(mid, top, pow(clamp(h*1.5,0.0,1.0),0.7)) : bot; gl_FragColor=vec4(c,1.0); }" }); }

  // ═════════ SCENE A: the city from the air ═════════
  var A = new T3.Scene(); A.fog = new T3.Fog(0xcfe0ec, 500, 2600);
  A.add(new T3.Mesh(new T3.SphereGeometry(5000, 32, 16), skyMat(0x3f86d0, 0xa9cdea, 0xdde8ee)));
  A.add(new T3.HemisphereLight(0xeaf3ff, 0x9a8a68, .45)); var sunA = new T3.DirectionalLight(0xfff2da, .75); sunA.position.set(-300, 500, 200); A.add(sunA);
  var ground = new T3.Mesh(new T3.PlaneGeometry(8000, 8000), toon(0xd8c79c)); ground.rotation.x = -Math.PI / 2; A.add(ground);
  // two river channels meeting at the T: a main river running north–south, a branch to the east
  function riverAt(x, z) { return Math.abs(x - 40 * Math.sin(z * .002)) < 55 || (x > 40 && Math.abs(z - 20) < 40); }
  var water = toon(0x5fb6d9); var rv = new T3.Mesh(new T3.PlaneGeometry(110, 6000, 1, 60), water); rv.rotation.x = -Math.PI / 2; rv.position.y = .3;
  var pos = rv.geometry.attributes.position; for (var i = 0; i < pos.count; i++) { var zz = -pos.getY(i); pos.setX(i, pos.getX(i) + 40 * Math.sin(zz * .002)); } A.add(rv);
  var br = new T3.Mesh(new T3.PlaneGeometry(3000, 80), water); br.rotation.x = -Math.PI / 2; br.position.set(1540, .3, 20); A.add(br);
  // Aioi Bridge: the T — a span across the main river with a stem out to the island
  var bridgeM = toon(0xb9b2a2); var span = inked(new T3.BoxGeometry(150, 4, 16), bridgeM, .03); span.position.set(0, 3, 20); A.add(span);
  var stem = inked(new T3.BoxGeometry(14, 4, 60), bridgeM, .03); stem.position.set(0, 3, 50); A.add(stem);
  // thousands of houses: plaster walls + dark grey tiled gable roofs, laid out in blocks along streets
  var N = 16000, wallG = new T3.BoxGeometry(1, 1, 1), roofG = new T3.CylinderGeometry(.62, .62, 1, 3); roofG.rotateZ(Math.PI / 2); roofG.rotateX(Math.PI / 6);
  var walls = new T3.InstancedMesh(wallG, toon(0xffffff), N), roofs = new T3.InstancedMesh(roofG, toon(0xffffff), N), m4 = new T3.Matrix4(), q = new T3.Quaternion(), e = new T3.Euler(), cnt = 0;
  var WC = [0xe8dcc0, 0xd9c9a4, 0xcbb894, 0xf0e6d0], RC = [0x5a606a, 0x4a4f58, 0x6a707a, 0x3f444c], col = new T3.Color();
  for (var bx = -700; bx < 760 && cnt < N; bx += 34) for (var bz = -1500; bz < 700 && cnt < N; bz += 26) {
    if (rnd() < .08) continue;
    for (var h = 0; h < 4 && cnt < N; h++) {
      var x = bx + (h % 2) * 13 + rnd() * 3, z = bz + Math.floor(h / 2) * 11 + rnd() * 2;
      if (riverAt(x, z) || Math.abs(x - 140) < 70 && Math.abs(z - 120) < 50) continue;
      var w = 9 + rnd() * 4, d = 7 + rnd() * 3, ht = 4 + rnd() * 2.5 + (rnd() < .04 ? 6 : 0), ry = (rnd() < .5 ? 0 : Math.PI / 2);
      q.setFromEuler(e.set(0, ry, 0)); m4.compose(new T3.Vector3(x, ht / 2, z), q, new T3.Vector3(w, ht, d)); walls.setMatrixAt(cnt, m4); walls.setColorAt(cnt, col.setHex(WC[cnt % 4]));
      m4.compose(new T3.Vector3(x, ht + 1.3, z), q, new T3.Vector3(w + 1, 3.2, d + 1.2)); roofs.setMatrixAt(cnt, m4); roofs.setColorAt(cnt, col.setHex(RC[(cnt * 7) % 4])); cnt++;
    }
  }
  walls.count = roofs.count = cnt; walls.frustumCulled = roofs.frustumCulled = false; A.add(walls, roofs); var tm = new T3.Matrix4(); walls.getMatrixAt(5, tm); console.log("houses", cnt, JSON.stringify(tm.elements.map(function(v){return +v.toFixed(1)})));
  // the Industrial Promotion Hall (1915): 3-storey wings, a 5-storey central tower, an elliptical green dome
  var hall = new T3.Group(); hall.position.set(140, 0, 120); hall.rotation.y = -.3; A.add(hall);
  var cream = toon(0xe9dfc4); var win = document.createElement("canvas"); win.width = 256; win.height = 64; var wc = win.getContext("2d"); wc.fillStyle = "#e9dfc4"; wc.fillRect(0, 0, 256, 64);
  wc.fillStyle = "#3c4656"; for (var r = 0; r < 3; r++) for (var c = 0; c < 16; c++) wc.fillRect(6 + c * 16, 6 + r * 20, 8, 12); var wt = new T3.CanvasTexture(win);
  var wing = inked(new T3.BoxGeometry(90, 16, 22), [cream, cream, cream, cream, toon(0xffffff, { map: wt }), toon(0xffffff, { map: wt })], .02); wing.position.y = 8; hall.add(wing);
  var tower = inked(new T3.CylinderGeometry(11, 11, 28, 20), cream, .03); tower.position.y = 14; tower.scale.z = .75; hall.add(tower);
  var dome = inked(new T3.SphereGeometry(11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(0x5fa88c), .04); dome.position.y = 28; dome.scale.set(1, 1.15, .75); hall.add(dome);
  // the B-29: silver fuselage, glazed round nose, long wings, four engines with spinning props, tall fin
  function b29() {
    var g = new T3.Group(), sil = toon(0xd9dee4), glass = toon(0x8fc3dc);
    var fus = inked(new T3.CylinderGeometry(2.2, 1.6, 30, 18), sil, .05); fus.rotation.z = Math.PI / 2; g.add(fus);
    var nose = inked(new T3.SphereGeometry(2.2, 18, 12), glass, .05); nose.position.x = 15; nose.scale.x = 1.3; g.add(nose);
    var wingG = new T3.BoxGeometry(9, .5, 43); var wg = inked(wingG, sil, .04); wg.position.x = 2; g.add(wg);
    var tail = inked(new T3.BoxGeometry(5, .4, 14), sil, .05); tail.position.x = -14; g.add(tail);
    var fin = inked(new T3.BoxGeometry(6, 9, .4), sil, .05); fin.position.set(-14, 5, 0); g.add(fin);
    g.props = [];
    [-15, -8, 8, 15].forEach(function (zz) { var n = inked(new T3.CylinderGeometry(1, 1.1, 5, 12), toon(0x9aa3ad), .05); n.rotation.z = Math.PI / 2; n.position.set(5, -.4, zz); g.add(n);
      var p = new T3.Mesh(new T3.BoxGeometry(.2, 7, .5), toon(0x2a2a2a)); p.position.set(7.8, -.4, zz); g.add(p); g.props.push(p); });
    return g;
  }
  var plane = b29(); A.add(plane);

  // ═════════ SCENE B: a street, two bean characters ═════════
  var B = new T3.Scene(); B.fog = new T3.Fog(0xd8e6f0, 60, 220);
  B.add(new T3.Mesh(new T3.SphereGeometry(500, 32, 16), skyMat(0x4a8fd6, 0xb4d6f0, 0xe0ead8)));
  B.add(new T3.HemisphereLight(0xeaf3ff, 0x9a8a68, .45)); var sunB = new T3.DirectionalLight(0xfff2da, .75); sunB.position.set(-40, 60, 50); B.add(sunB);
  var road = new T3.Mesh(new T3.PlaneGeometry(400, 400), toon(0xd2c4a0)); road.rotation.x = -Math.PI / 2; B.add(road);
  // wooden houses with vertical board walls and tiled roofs on both sides of the street
  var board = document.createElement("canvas"); board.width = 128; board.height = 64; var bc = board.getContext("2d"); bc.fillStyle = "#7a5032"; bc.fillRect(0, 0, 128, 64); bc.fillStyle = "#5c3a22"; for (var k = 0; k < 16; k++) bc.fillRect(k * 8, 0, 2, 64); var bt = new T3.CanvasTexture(board); bt.wrapS = bt.wrapT = T3.RepeatWrapping; bt.repeat.set(3, 1);
  for (var s = -1; s <= 1; s += 2) for (var hh = 0; hh < 10; hh++) {
    var hz = -hh * 14 + 20, hw = inked(new T3.BoxGeometry(12, 7, 10), toon(0xffffff, { map: bt }), .02); hw.position.set(s * 14, 3.5, hz); B.add(hw);
    var rf = inked(roofG, toon(0x4a4f58), .03); rf.scale.set(10.5, 3, 13.5); rf.rotation.y = Math.PI / 2; rf.position.set(s * 14, 8.3, hz); B.add(rf);
    if (hh % 3 === 0) { var pole = inked(new T3.CylinderGeometry(.18, .22, 13, 8), toon(0x5a4030), .05); pole.position.set(s * 8, 6.5, hz - 5); B.add(pole); }
  }
  // bean characters: a big round head, a bean body, stick arms and legs, simple face
  function bean(body, hair, o) {
    o = o || {}; var g = new T3.Group(), skin = toon(0xf2d2b0), stick = toon(0x1b1d22);
    var bd = inked(new T3.CapsuleGeometry(.62, 1.1, 8, 16), toon(body), .05); bd.position.y = 1.55; g.add(bd);
    var head = new T3.Group(); head.position.y = 3.15; g.add(head); g.head = head;
    head.add(inked(new T3.SphereGeometry(.95, 32, 20), skin, .04));
    var hr = inked(new T3.SphereGeometry(.99, 32, 16, 0, Math.PI * 2, 0, Math.PI * (o.bob ? .62 : .45)), toon(hair), .03); hr.rotation.x = o.bob ? -.25 : -.35; head.add(hr);
    if (o.cap) { var cp = inked(new T3.CylinderGeometry(1.0, 1.0, .4, 24), toon(o.cap), .03); cp.position.y = .62; cp.rotation.x = -.1; head.add(cp); var vz = new T3.Mesh(new T3.BoxGeometry(1.2, .08, .7), toon(0x15171c)); vz.position.set(0, .45, .85); head.add(vz); }
    var eyeG = new T3.SphereGeometry(.09, 12, 8); g.eyes = [];
    [-.3, .3].forEach(function (ex) { var ey = new T3.Mesh(eyeG, stick); ey.position.set(ex, .05, .9); ey.scale.set(1, 1.5, .5); head.add(ey); g.eyes.push(ey); });
    var mouth = new T3.Mesh(new T3.TorusGeometry(.18, .03, 6, 16, Math.PI), stick); mouth.position.set(0, -.32, .88); mouth.rotation.z = Math.PI; head.add(mouth); g.mouth = mouth;
    g.limbs = [];
    [[-.3, .5], [.3, .5]].forEach(function (l) { var lg = new T3.Mesh(new T3.CylinderGeometry(.05, .05, 1.0, 6), stick); lg.position.set(l[0], l[1], 0); g.add(lg); g.limbs.push(lg); });
    [[-.72, 1.7, .5], [.72, 1.7, -.5]].forEach(function (a) { var am = new T3.Mesh(new T3.CylinderGeometry(.045, .045, 1.0, 6), stick); am.position.set(a[0], a[1], 0); am.rotation.z = a[2]; g.add(am); g.limbs.push(am); });
    return g;
  }
  var kid = bean(0xe2b32a, 0x15110e, { bob: true }), man = bean(0x7a5aa8, 0x15110e, { cap: 0x2c3448 });
  kid.position.set(-1.6, 0, 0); kid.rotation.y = .35; man.position.set(1.6, 0, -.5); man.scale.setScalar(1.15); man.rotation.y = -.3; B.add(kid, man);
  var planeB = b29(); planeB.scale.setScalar(.6); B.add(planeB);

  // ═════════ timeline ═════════
  window.VIDEO_END = 12;
  window.renderAt = function (t) {
    if (t < 6) {
      var k = t / 6;
      cam.position.set(lerp(-500, 120, ease(k)), lerp(520, 260, ease(k)), lerp(700, 420, ease(k))); cam.lookAt(lerp(-60, 140, ease(k)), 0, lerp(-200, 100, ease(k)));
      plane.position.set(lerp(-700, 600, k), 330 + Math.sin(t) * 3, lerp(300, -200, k)); plane.rotation.y = Math.atan2(500, 1300); plane.scale.setScalar(2.2);
      plane.props.forEach(function (p) { p.rotation.x = t * 40; });
      R.render(A, cam);
    } else {
      var u = t - 6;
      cam.position.set(lerp(-2, 1.5, u / 6), lerp(2.6, 2.4, u / 6), lerp(15, 12.5, ease(u / 6))); cam.lookAt(0, 3.4, 0);
      [kid, man].forEach(function (c, i) { var bl = ((u + i * 1.3) % 3.1) < .12; c.eyes.forEach(function (e) { e.scale.y = bl ? .15 : 1.5; }); c.position.y = Math.abs(Math.sin(u * 2 + i)) * .03; });
      var look = clamp((u - 1.5) / .8); kid.head.rotation.x = -look * .5; man.head.rotation.x = -look * .45; man.head.rotation.y = look * .2;
      planeB.position.set(lerp(-60, 60, u / 6), 45, -60); planeB.rotation.y = 0; planeB.props.forEach(function (p) { p.rotation.x = t * 40; });
      R.render(B, cam);
    }
    var cap = document.getElementById("cap"); cap.textContent = t < 6 ? "مدينة فيها أكتر من تلتمية ألف إنسان…" : "طيارة واحدة؟ أكيد استطلاع.";
  };
  window.renderAt(0);
})();
