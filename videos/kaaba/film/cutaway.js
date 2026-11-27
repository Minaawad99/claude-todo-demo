/* The Kaaba shell around the episode's 3D interior, cut open at the front-right corner like a section drawing (cover only).
   Interior (world.js): x −6…6, z −5…5, floor y 0, ceiling 9. The shell: walls .6 thick, outside ground at y −2.2 (the door
   stands about 2.2 m up), the kiswa (black silk with a woven calligraphy repeat), the gold belt (hizam) near the top, the
   marble shadharwan at the foot, the gold door with the wooden stair up to it, and stone faces where the walls are cut. */
(function () {
  var W = window.W3, T = W.T, scene = W.scene, room = W.room, MT = W.mats, R = W.R, cam = W.cam;
  var G = -2.2, TOP = 9.75, TH = .6, CUT = 7.3, CX = -1.15, CZ = -1.0;   // cut: front wall from x CX, right wall back to z −CZ, up to CUT

  // ── textures ──
  var KIS = W.tex(1024, 1024, function (x, w, h) { x.fillStyle = "#141414"; x.fillRect(0, 0, w, h);
    x.font = W.font(64); x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl";
    for (var r = 0; r < 6; r++) for (var c = 0; c < 3; c++) { x.save(); x.translate((c + (r % 2 ? .5 : 0)) * w / 3, (r + .5) * h / 6); x.rotate(r % 2 ? .12 : -.12);
      x.fillStyle = "#1e1e1e"; x.fillText("لا إله إلا الله", 0, 0); x.restore(); }
    x.globalAlpha = .08; x.fillStyle = "#000"; for (var y = 0; y < h; y += 3) x.fillRect(0, y, w, 1); x.globalAlpha = 1; }, 1, 1);
  KIS.repeat.set(1 / 3.2, 1 / 3.2);
  function beltTex(len) { return W.tex(2048, 200, function (x, w, h) { x.fillStyle = "#151515"; x.fillRect(0, 0, w, h);
      var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#b8892e"); g.addColorStop(.5, "#f0cf72"); g.addColorStop(1, "#b8892e");
      x.fillStyle = g; x.fillRect(0, 6, w, 10); x.fillRect(0, h - 16, w, 10);
      x.font = W.font(96); x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl"; x.fillStyle = g;
      var txt = ["وإذ يرفع إبراهيم القواعد من البيت وإسماعيل", "ربنا تقبل منا إنك أنت السميع العليم"];
      for (var i = 0; i < 2; i++) { x.fillText(txt[i], w * (i + .5) / 2, h / 2 + 6); x.save(); x.translate(w * i / 2, h / 2); x.rotate(Math.PI / 4); x.strokeStyle = g; x.lineWidth = 6; x.strokeRect(-30, -30, 60, 60); x.restore(); }
    }, len / 9, 1); }
  var STONE = W.tex(512, 512, function (x, w, h) { x.fillStyle = "#cbbd9f"; x.fillRect(0, 0, w, h); W.veins(x, w, h, 81, "#8a7a5c", 30);
    x.strokeStyle = "rgba(90,76,52,.55)"; x.lineWidth = 3; for (var r = 0; r < 4; r++) { x.beginPath(); x.moveTo(0, r * h / 4); x.lineTo(w, r * h / 4); x.stroke();
      for (var c = 0; c < 3; c++) { var cx = (c + (r % 2 ? .5 : 0)) * w / 3; x.beginPath(); x.moveTo(cx, r * h / 4); x.lineTo(cx, (r + 1) * h / 4); x.stroke(); } } }, 1, 1);
  STONE.repeat.set(.6, .6);
  var mKis = W.P({ color: 0x8a8a8a, map: KIS, roughness: .62, sheen: .6, sheenColor: new T.Color(0x5a5a5a), sheenRoughness: .5 });
  var mStone = W.M({ map: STONE, roughness: .85 });

  // ── walls: extruded outlines, kiswa on the faces, stone on the cut edges ──
  function wall(outline, holes, rotY, px, pz) {
    var s = new T.Shape(outline.map(function (p) { return new T.Vector2(p[0], p[1]); }));
    (holes || []).forEach(function (hp) { s.holes.push(new T.Path(hp.map(function (p) { return new T.Vector2(p[0], p[1]); }))); });
    var g = new T.ExtrudeGeometry(s, { depth: TH, bevelEnabled: false, curveSegments: 1 });
    var m = new T.Mesh(g, [mKis, mStone]); m.rotation.y = rotY; m.position.set(px, 0, pz); m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  }
  var DOOR = [[-4.0, 0], [-2.0, 0], [-2.0, 3.05], [-4.0, 3.05]];
  // front (z +): u = x, extruded toward +z
  wall([[-6, G], [6, G], [6, -.05], [CX, -.05], [CX, CUT - 1.1], [CX + 1.1, CUT], [6, CUT], [6, TOP], [-6, TOP]], [DOOR], 0, 0, 5.02);
  // right (x +): u = −z, extruded toward +x
  wall([[-5.6 - TH * 0, G], [5.6, G], [5.6, TOP], [-5.6, TOP], [-5.6, CUT], [-CZ - 1.1, CUT], [-CZ, CUT - 1.1], [-CZ, -.05], [-5.6, -.05]], null, Math.PI / 2, 6.02, 0);
  // left (x −): u = z, extruded toward −x
  wall([[-5.6, G], [5.6, G], [5.6, TOP], [-5.6, TOP]], null, -Math.PI / 2, -6.02, 0);
  // back (z −): u = −x, extruded toward −z
  wall([[-6, G], [6, G], [6, TOP], [-6, TOP]], null, Math.PI, 0, -5.02);
  // roof slab and the floor slab under the room (seen in the cut)
  var roof = new T.Mesh(new T.BoxGeometry(13.24, TOP - 9, 11.24), [mKis, mKis, mKis, mKis, mKis, mKis]); roof.position.set(0, 9 + (TOP - 9) / 2, 0); roof.castShadow = true; scene.add(roof);
  var slab = new T.Mesh(new T.BoxGeometry(12.04, -G - .05, 10.04), mStone); slab.position.set(0, (G - .05) / 2, 0); scene.add(slab);

  // the gold belt just under the top on every face, the band of the door frame
  function belt(len, x, z, ry) { var m = new T.Mesh(new T.PlaneGeometry(len, .78), W.M({ map: beltTex(len), metalness: .45, roughness: .35 })); m.position.set(x, 8.25, z); m.rotation.y = ry; scene.add(m); }
  belt(13.24, 0, 5.63, 0); belt(11.24, 6.63, 0, Math.PI / 2); belt(13.24, 0, -5.63, Math.PI); belt(11.24, -6.63, 0, -Math.PI / 2);
  // shadharwan: the sloped marble foot
  [[13.9, .35, 6.0, 0], [13.9, .35, -6.0, 0]].forEach(function (b) { var m = new T.Mesh(new T.BoxGeometry(b[0], .42, b[1]), MT.dado); m.position.set(0, G + .21, b[2]); scene.add(m); });
  [[6.6, 0], [-6.6, 0]].forEach(function (b) { var m = new T.Mesh(new T.BoxGeometry(.75, .42, 11.95), MT.dado); m.position.set(b[0], G + .21, 0); scene.add(m); });

  // the gold door: frame, two leaves swung open outward, light from inside
  var door = new T.Group(); door.position.set(-3.0, 0, 5.62); scene.add(door);
  function gb(w, h, d, x, y, z, m) { var b = new T.Mesh(new T.BoxGeometry(w, h, d), m || MT.gold); b.position.set(x, y, z); b.castShadow = true; door.add(b); return b; }
  gb(2.4, .2, .14, 0, 3.15, .04); gb(.2, 3.25, .14, -1.1, 1.52, .04); gb(.2, 3.25, .14, 1.1, 1.52, .04); gb(2.5, .08, .2, 0, 3.3, .06, MT.goldDk);
  var LEAF = W.tex(256, 768, function (x, w, h) { var g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#c08f2c"); g.addColorStop(.5, "#f2cd6e"); g.addColorStop(1, "#b07f22");
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = "#6f4c10"; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
    for (var r = 0; r < 4; r++) { var y0 = 24 + r * 184; x.lineWidth = 4; x.strokeRect(22, y0, w - 44, 168); W.flower(x, w / 2, y0 + 84, 30, "#7a5414", "#f0d27a");
      x.save(); x.translate(w / 2, y0 + 84); x.rotate(Math.PI / 4); x.lineWidth = 3; x.strokeRect(-46, -46, 92, 92); x.restore(); } });
  var mLeaf = W.M({ map: LEAF, bumpMap: LEAF, bumpScale: .01, metalness: 1, roughness: .3 });
  [[-1, 1.15], [1, -1.15]].forEach(function (s) { var hinge = new T.Group(); hinge.position.set(s[0] * 1.0, 0, .08); hinge.rotation.y = s[1]; door.add(hinge);
    var lf = new T.Mesh(new T.BoxGeometry(.98, 3.0, .07), [MT.gold, MT.gold, MT.gold, MT.gold, mLeaf, mLeaf]); lf.position.set(-s[0] * .49, 1.5, 0); lf.castShadow = true; hinge.add(lf); });
  var inLight = new T.PointLight(0xffd58a, 1.3, 9, 2); inLight.position.set(-3, 1.8, 3.6); scene.add(inLight);

  // the wooden stair on wheels up to the door, gold rails
  var st = new T.Group(); st.position.set(-3.0, 0, 5.75); scene.add(st);
  var N = 9, rise = -G / N, run = .3, SW = 1.5;
  for (var i = 0; i < N; i++) { var y = -rise * (i + 1), z = run * (i + .5);
    var tr = new T.Mesh(new T.BoxGeometry(SW, .06, run + .04), MT.wood); tr.position.set(0, y + rise - .03, z); tr.castShadow = tr.receiveShadow = true; st.add(tr);
    var rs = new T.Mesh(new T.BoxGeometry(SW, rise, .03), MT.wood); rs.position.set(0, y + rise / 2, z - run / 2); st.add(rs); }
  var len = Math.hypot(N * run, -G), ang = Math.atan2(-G, N * run);
  [-1, 1].forEach(function (s) {
    var side = new T.Mesh(new T.BoxGeometry(.08, .34, len + .2), MT.wood); side.position.set(s * (SW / 2 + .04), G / 2 - .05, N * run / 2); side.rotation.x = -ang; side.castShadow = true; st.add(side);
    var rail = new T.Mesh(new T.CylinderGeometry(.035, .035, len + .3, 16), MT.gold); rail.position.set(s * (SW / 2 + .04), G / 2 + 1.0, N * run / 2); rail.rotation.x = Math.PI / 2 - ang; st.add(rail);
    for (var k = 0; k <= N; k += 3) { var py = -rise * k, pz = run * k; var post = new T.Mesh(new T.CylinderGeometry(.025, .025, 1.0, 12), MT.gold); post.position.set(s * (SW / 2 + .04), py + .5 - (k ? 0 : 0), pz); st.add(post); }
    var wh = new T.Mesh(new T.CylinderGeometry(.16, .16, .08, 24), W.M({ color: 0x222222, roughness: .6 })); wh.rotation.z = Math.PI / 2; wh.position.set(s * (SW / 2 + .1), G + .16, N * run - .1); st.add(wh);
  });
  var top = new T.Mesh(new T.BoxGeometry(SW, .08, .5), MT.wood); top.position.set(0, -.04, -.05); st.add(top);

  // the ground: white mataf marble fading into the card
  var fadeT = W.tex(512, 512, function (x, w, h) { var g = x.createRadialGradient(w / 2, h / 2, w * .18, w / 2, h / 2, w / 2); g.addColorStop(0, "#fff"); g.addColorStop(1, "#000"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  var ground = new T.Mesh(new T.CircleGeometry(19, 64), W.P({ color: 0x8f8a80, roughness: .3, clearcoat: .4, alphaMap: fadeT, transparent: true, opacity: .55, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = G - .002; ground.receiveShadow = true; scene.add(ground);

  // hide the room's own parts that would float in the cut (front/right wall trims, plaques, the inside door, Bab al-Tawba)
  var hide = [];
  room.traverse(function (o) { if (!o.isMesh || o === room) return; var p = new T.Vector3(); o.getWorldPosition(p);
    if ((p.z > 4.6 || p.x > 5.6) && o.geometry && !(o.geometry.type === "PlaneGeometry" && Math.abs(p.y - 9) < .01)) hide.push(o); });
  hide.forEach(function (o) { o.visible = false; }); W.door.visible = false; W.tawba.visible = false;

  // sun from the front left, high: it rakes into the cut and gives the stair and the door a shadow
  var sun = new T.DirectionalLight(0xfff1dc, 1.1); sun.position.set(-14, 26, 22); sun.target.position.set(0, 2, 0); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); var sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80; sun.shadow.bias = -.0006; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  scene.background = null; R.setClearColor(0x000000, 0); R.toneMappingExposure = .92;
  var warm = new T.SpotLight(0xffe2b0, .9, 30, .32, .8, 1); warm.position.set(6, 10, 13); warm.target.position.set(1, 1, -1); scene.add(warm, warm.target);

  // the washing, inside: vessels in front, a man wiping the far pillar, one wiping the marble, the floor wet
  var C = PROPS.CUE; C.vessels = [-1, 1e9]; C.wet = [-10, 1e9];
  window.COVER = {
    set: function (o) {
      R.setSize(540, 960, false); cam.aspect = 540 / 960; cam.fov = o.f; cam.updateProjectionMatrix();
      cam.position.set(o.p[0], o.p[1], o.p[2]); cam.lookAt(o.l[0], o.l[1], o.l[2]);
      PROPS.update(o.t || 30, cam);
      R.render(scene, cam);
    },
    place: function (v, x, y, z) { var p = new T.Vector3(x, y, z).project(cam); return [(p.x + 1) / 2 * 540, (1 - p.y) / 2 * 960]; },
    people: function (list) { list.forEach(function (q) { PROPS.person(q[0], q[1], q[2], -1, 1e9, q[3] || {}); }); },
    vessels: function (x, z, s) { scene.children.forEach(function (o) { if (o.isGroup && Math.abs(o.position.x + 1.6) < .01 && Math.abs(o.position.z - 2.3) < .01) { o.position.set(x, 0, z); o.scale.setScalar(s); } }); }
  };
})();
