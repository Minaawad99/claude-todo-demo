/* «الكعبة من جوة» — 3D interior (three.js r149). Units = metres. Door wall at z=+5 (north-east), Bab al-Tawba in the corner x=+6,z=+5. */
(function () {
  var T = THREE;
  var canvas = document.getElementById("gl");
  var R = new T.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(window.devicePixelRatio || 1); R.setSize(360, 640, false);
  R.outputEncoding = T.sRGBEncoding; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 0.85;
  var scene = new T.Scene(); scene.background = new T.Color(0x1d2a22);
  var cam = new T.PerspectiveCamera(50, 360 / 640, 0.05, 100);
  var W = 12, D = 10, H = 9, LOW = 2.6;   // room size, marble dado height

  function cv(w, h, f) { var c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = T.RepeatWrapping; return t; }
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function marble(base, vein, seed) {
    return function (x, w, h) { var r = rnd(seed); x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (var i = 0; i < 26; i++) { x.strokeStyle = vein; x.globalAlpha = .08 + r() * .18; x.lineWidth = .6 + r() * 1.8; x.beginPath(); var px = r() * w, py = r() * h; x.moveTo(px, py);
        for (var k = 0; k < 8; k++) { px += (r() - .3) * 70; py += (r() - .5) * 50; x.lineTo(px, py); } x.stroke(); } x.globalAlpha = 1;
      x.strokeStyle = "rgba(120,110,95,.35)"; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); };
  }
  var floorTex = cv(512, 512, marble("#f1ede4", "#8d8676", 7)); floorTex.repeat.set(6, 5);
  var dadoTex = cv(512, 512, marble("#f4f1ea", "#7f7a70", 11)); dadoTex.repeat.set(6, 1.3);
  // green silk curtain: zigzag bands with repeated phrase
  var silk = cv(1024, 1024, function (x, w, h) {
    x.fillStyle = "#14523a"; x.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
      var cx = c * 128 + (r % 2 ? 64 : 0), cy = r * 128 + 64;
      x.save(); x.translate(cx, cy); x.rotate(-Math.PI / 4);
      x.fillStyle = "#0f4530"; x.fillRect(-60, -16, 120, 32);
      x.fillStyle = "#c9b36a"; x.font = "700 19px 'Noto Naskh Arabic','Amiri',serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText("لا إله إلا الله", 0, 1); x.restore();
    }
    x.strokeStyle = "rgba(10,40,25,.35)"; x.lineWidth = 1;
    for (var i = 0; i < w; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }   // weave
  }); silk.repeat.set(3, 2.2);

  function M(o) { return new T.MeshStandardMaterial(o); }
  var gold = M({ color: 0xd4a640, metalness: .9, roughness: .28 });
  var silver = M({ color: 0xcfd2d4, metalness: .9, roughness: .25 });
  var wood = M({ map: cv(256, 512, function (x, w, h) { var r = rnd(3); x.fillStyle = "#6e3a1f"; x.fillRect(0, 0, w, h);
      for (var i = 0; i < 90; i++) { x.strokeStyle = r() < .5 ? "rgba(40,18,8,.35)" : "rgba(150,90,50,.25)"; x.lineWidth = 1 + r() * 3; var px = r() * w; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + 6, h * .3, px - 6, h * .6, px + 3, h); x.stroke(); } }), roughness: .55 });
  var greenBase = M({ color: 0x1f3a2b, roughness: .5 });

  var room = new T.Group(); scene.add(room);
  function plane(w, h, m, x, y, z, ry, rx) { var p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry || 0; p.rotation.x = rx || 0; p.receiveShadow = true; room.add(p); return p; }
  plane(W, D, M({ map: floorTex, roughness: .25, metalness: .05 }), 0, 0, 0, 0, -Math.PI / 2);
  var dadoM = M({ map: dadoTex, roughness: .3 }), silkM = M({ map: silk, roughness: .75, side: T.DoubleSide });
  [[W, 0, -D / 2, 0], [W, 0, D / 2, Math.PI], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, -Math.PI / 2]].forEach(function (s) {
    plane(s[0], LOW, dadoM, s[1], LOW / 2, s[2], s[3]);
    plane(s[0], H - LOW - .25, silkM, s[1], LOW + .25 + (H - LOW - .25) / 2, s[2], s[3]);
    // gold/green trim band between marble and silk
    var b = new T.Mesh(new T.BoxGeometry(s[0], .25, .06), M({ color: 0x0f4530, roughness: .5 })); b.position.set(s[1], LOW + .125, s[2]); b.rotation.y = s[3]; room.add(b);
    var g1 = new T.Mesh(new T.BoxGeometry(s[0], .04, .08), gold); g1.position.set(s[1], LOW + .25, s[2]); g1.rotation.y = s[3]; room.add(g1);
    var g2 = g1.clone(); g2.position.y = LOW; room.add(g2);
  });
  plane(W, D, silkM, 0, H, 0, 0, Math.PI / 2);

  // three wooden pillars on the centre line, gold rings, dark green square bases
  var PX = [-3.6, 0, 3.6];
  PX.forEach(function (px) {
    var g = new T.Group(); g.position.set(px, 0, 0); room.add(g);
    var col = new T.Mesh(new T.CylinderGeometry(.24, .27, H, 40), wood); col.position.y = H / 2; col.castShadow = true; g.add(col);
    var base = new T.Mesh(new T.BoxGeometry(.9, .45, .9), greenBase); base.position.y = .225; base.castShadow = true; g.add(base);
    var bt = new T.Mesh(new T.BoxGeometry(.96, .05, .96), gold); bt.position.y = .47; g.add(bt);
    [.75, .95, 4.9, 5.1, H - .9, H - .7].forEach(function (y) { var r = new T.Mesh(new T.TorusGeometry(.27, .035, 12, 48), gold); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); });
    var cap = new T.Mesh(new T.CylinderGeometry(.42, .27, .5, 40), gold); cap.position.y = H - .25; g.add(cap);
  });
  // rods between pillars (and to the side walls) with hanging lamps
  var ROD = 5.6, lampMeshes = [];
  [[-W / 2, -3.6], [-3.6, 0], [0, 3.6], [3.6, W / 2]].forEach(function (s) {
    var len = s[1] - s[0], rod = new T.Mesh(new T.CylinderGeometry(.03, .03, len, 10), gold);
    rod.rotation.z = Math.PI / 2; rod.position.set((s[0] + s[1]) / 2, ROD, 0); room.add(rod);
    var n = Math.max(2, Math.round(len / 1.1));
    for (var i = 1; i < n; i++) lampMeshes.push(lamp(s[0] + len * i / n, (i % 2 ? .9 : 1.2), (i + Math.round(s[0])) % 3));
  });
  function lamp(x, drop, kind) {
    var g = new T.Group(); g.position.set(x, ROD, 0); room.add(g);
    var chain = new T.Mesh(new T.CylinderGeometry(.008, .008, drop, 6), gold); chain.position.y = -drop / 2; g.add(chain);
    var pts = kind === 0 ? [[0, 0], [.1, .02], [.2, .12], [.24, .28], [.18, .44], [.06, .52], [.03, .6]]
            : kind === 1 ? [[0, 0], [.16, .04], [.22, .16], [.2, .32], [.1, .46], [.04, .58]]
            : [[0, 0], [.08, .02], [.17, .18], [.2, .34], [.12, .5], [.05, .56]];
    var body = new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 40), kind === 1 ? silver : gold);
    body.position.y = -drop - .6; body.castShadow = true; g.add(body);
    var capm = new T.Mesh(new T.ConeGeometry(.09, .16, 24), kind === 1 ? gold : silver); capm.position.y = -drop + .02; g.add(capm);
    var fin = new T.Mesh(new T.SphereGeometry(.035, 12, 8), gold); fin.position.y = -drop - .62; g.add(fin);
    var glow = new T.Mesh(new T.SphereGeometry(.09, 16, 12), new T.MeshBasicMaterial({ color: 0xffd98a })); glow.position.y = -drop - .3; g.add(glow);
    var band = new T.Mesh(new T.TorusGeometry(.2, .015, 8, 32), kind === 1 ? gold : silver); band.rotation.x = Math.PI / 2; band.position.y = -drop - .32; g.add(band);
    return g;
  }
  // the door (inside face, gold) on the north-east wall, sill raised
  var door = new T.Group(); door.position.set(-2.6, 0, D / 2 - .03); door.rotation.y = Math.PI; room.add(door);
  var leaf = new T.Mesh(new T.BoxGeometry(1.7, 3.2, .08), gold); leaf.position.y = 1.6 + .02; door.add(leaf);
  for (var r = 0; r < 3; r++) for (var c = 0; c < 2; c++) { var p = new T.Mesh(new T.BoxGeometry(.66, .86, .04), M({ color: 0xb98a2c, metalness: .9, roughness: .35 })); p.position.set(-.38 + c * .76, .55 + r * 1.05, .05); door.add(p);
    var k = new T.Mesh(new T.CylinderGeometry(.11, .11, .03, 24), gold); k.rotation.x = Math.PI / 2; k.position.set(-.38 + c * .76, .55 + r * 1.05, .08); door.add(k); }
  // Bab al-Tawba: small gold door in the corner, to the right on entering
  var tawba = new T.Group(); tawba.position.set(W / 2 - .03, 0, D / 2 - 1.2); tawba.rotation.y = -Math.PI / 2; room.add(tawba);
  var tl = new T.Mesh(new T.BoxGeometry(1.0, 2.2, .07), gold); tl.position.y = 1.1; tawba.add(tl);
  for (var j = 0; j < 4; j++) { var st = new T.Mesh(new T.CylinderGeometry(.035, .035, .03, 12), M({ color: 0x8a6a22, metalness: .8, roughness: .4 })); st.rotation.x = Math.PI / 2; st.position.set(0, .35 + j * .5, .05); tawba.add(st); }
  // the marked spot on the floor (prayer of the Prophet ﷺ), near the far wall
  var spot = new T.Mesh(new T.PlaneGeometry(.9, .6), M({ color: 0xbfa98a, roughness: .3 })); spot.rotation.x = -Math.PI / 2; spot.position.set(-1.8, .005, -D / 2 + 1.6); room.add(spot);

  // lights: warm ambient + soft key from the door + lamp glow
  scene.add(new T.HemisphereLight(0xfff6e6, 0x5a4a38, .55));
  var key = new T.SpotLight(0xfff0d8, 1.6, 30, Math.PI / 3, .6, 1); key.position.set(-2.6, 7, 6); key.target.position.set(0, 0, -2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; scene.add(key, key.target);
  var fill = new T.PointLight(0xffe3b0, .7, 18, 1.5); fill.position.set(0, 4.2, 0); scene.add(fill);

  var VIEWS = {
    wide:   { p: [-5.6, 1.7, 1.6], l: [3.5, 3.4, -1.0], f: 68 },   // from the door, looking in
    pillar: { p: [-1.1, 1.0, 1.9], l: [0, 4.0, 0], f: 55 },        // looking up a pillar to the lamps
    lamps:  { p: [-2.0, 4.6, 2.6], l: [0, 4.7, 0], f: 42 },
    tawba:  { p: [1.5, 1.7, 1.0], l: [6, 1.3, 3.8], f: 52 },
    floor:  { p: [-1.4, 2.6, -1.4], l: [-1.8, 0, -3.4], f: 48 }
  };
  window.WORLD = { draw: function (t, v) { var V = VIEWS[v] || VIEWS.wide; cam.fov = V.f; cam.updateProjectionMatrix();
      cam.position.set(V.p[0], V.p[1], V.p[2]); cam.lookAt(V.l[0], V.l[1], V.l[2]);
      lampMeshes.forEach(function (g, i) { g.rotation.z = Math.sin(t * 1.3 + i) * .01; });
      R.render(scene, cam); }, VIEWS: VIEWS };
})();
