/* «الكعبة من جوة» — the moving parts on top of world.js: people (the shared person kit, as cut-out cards standing in the room),
   the washing (water on the marble, cloths, the vessels), the key, incense smoke, Bab al-Tawba opening onto its stair,
   the marked prayer spot, and the museum room with the old pillar. Everything is a pure function of time: PROPS.update(t, cam). */
(function () {
  var W = window.W3, T = W.T, scene = W.scene, room = W.room, MT = W.mats;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eio(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function win(t, a, b, f) { f = f || .4; return clamp((t - a) / f) * clamp((b - t) / f); }   // 0→1→0 over [a, b]
  var U = .00415;                         // metres per person-kit unit (a 422-unit person is 1.75 m)
  var VB = [-170, -250, 340, 490];        // sprite viewBox: hips at 0, feet near 212
  var PW = VB[2] * U, PH = VB[3] * U;

  // ── people: render a kit SVG to a texture ─────────────────
  var sprites = {}, pending = [];
  function svgTex(svg) {
    var c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * VB[3] / VB[2]);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    var img = new Image();
    pending.push(new Promise(function (res) { img.onload = function () { c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); t.needsUpdate = true; res(); }; img.onerror = function () { res(); }; }));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VB.join(" ") + '" width="' + c.width + '" height="' + c.height + '">' + svg + '</svg>');
    return t;
  }
  function frames(name, n, fn) { sprites[name] = []; for (var i = 0; i < n; i++) { var r = fn(i / n); sprites[name].push({ tex: svgTex(r.svg), j: r.joints }); } }
  var P = window.PERSON;
  var cloth = function (x, y) { return '<path d="M' + (x - 9) + ' ' + (y - 4) + ' q10 -8 20 -2 q4 10 -2 18 q-12 4 -20 -4 z" fill="#fbfaf6" stroke="#2a2016" stroke-width="1.8"/><path d="M' + (x - 4) + ' ' + y + ' q6 3 10 9" stroke="#cfcabd" stroke-width="1.2" fill="none"/>'; };
  function sideAt(o) { o.y = P.sideHipY(o, 212); o.x = 0; return P.side(o); }
  // standing officials and guests (front): white thobe + ghutra, shemagh, and the black bisht
  ["saudi", "saudiShemagh", "bisht"].forEach(function (of) {
    frames("stand-" + of, 4, function (k) { return P.front({ x: 0, y: 0, s: 1, outfit: of, breath: Math.sin(k * 6.283) * .6, face: { eyes: k > .7 ? .1 : 1 }, head: { turn: of === "bisht" ? -.3 : .25 } }); });
  });
  // wiping a wall or a pillar with a white cloth (side view, the arm up and forward), 8 frames of the circle
  ["saudi", "bisht"].forEach(function (of) {
    frames("wipe-" + of, 8, function (k) { var a = k * 6.283, r = sideAt({ s: 1, outfit: of, arms: [{ sh: 128 + 14 * Math.sin(a), el: 18 + 16 * Math.cos(a), hand: "flat" }, { sh: 6, el: 14 }], head: { tilt: -6 } });
      r.svg += cloth(r.joints.wrist[0] + 6, r.joints.wrist[1] - 4); return r; });
  });
  // bending to wipe the marble floor (side), the cloth sweeping back and forth
  frames("floor-saudi", 8, function (k) { var a = k * 6.283, r = sideAt({ s: 1, outfit: "saudi", lean: 58 + 3 * Math.sin(a), legs: [{ hip: 72, knee: 160, ankle: 40 }, { hip: 62, knee: 155, ankle: 40 }], arms: [{ sh: -16 + 12 * Math.sin(a), el: 6, hand: "flat" }, { sh: -14, el: 14 }] });
    r.svg += cloth(r.joints.wrist[0] + 8, r.joints.wrist[1] + 10); return r; });
  // walking in through the door (side, 8 frames of the stride)
  ["saudi", "bisht", "saudiShemagh"].forEach(function (of) {
    frames("walk-" + of, 8, function (k) { var wp = P.walkPose(k * 6.283, 1); return sideAt(Object.assign({ s: 1, outfit: of }, wp)); });
  });
  // carrying the censer (side, the arm forward); the smoke rises from the censer's lid
  frames("censer", 4, function (k) { var r = sideAt({ s: 1, outfit: "bisht", arms: [{ sh: 64 + 4 * Math.sin(k * 6.283), el: 52, hand: "fist" }, { sh: 4, el: 12 }] });
    var w = r.joints.wrist; r.svg += '<g transform="translate(' + (w[0] + 10) + ' ' + (w[1] + 2) + ')"><path d="M-22 6 h44 l-6 6 h-32 z" fill="#c99a3c" stroke="#2a2016" stroke-width="1.6"/><path d="M-6 6 v-14 h12 v14" fill="#d9ac4a" stroke="#2a2016" stroke-width="1.4"/><path d="M-14 -8 q14 -10 28 0 v4 h-28 z" fill="#e2b85a" stroke="#2a2016" stroke-width="1.6"/><path d="M-8 -14 q8 -14 16 0 z" fill="#e2b85a" stroke="#2a2016" stroke-width="1.4"/><circle cx="0" cy="-20" r="3" fill="#c99a3c" stroke="#2a2016" stroke-width="1.2"/></g>';
    r.lid = [w[0] + 10, w[1] - 18]; return r; });

  var people = [];   // {name, x, z, from, to, dir, speed, walk:[x0,z0,x1,z1,a,b], face}
  function person(name, x, z, from, to, o) {
    o = o || {}; var mat = new T.MeshBasicMaterial({ map: sprites[name][0].tex, transparent: true, alphaTest: .4, color: o.tint || 0xe9e4da, side: T.DoubleSide, depthWrite: true });
    var g = new T.Group(), m = new T.Mesh(new T.PlaneGeometry(PW, PH), mat); m.position.y = (VB[3] / 2 + VB[1]) * -U + (212 - 0) * 0 + (-(VB[1] + VB[3]) + 212 * 0) * 0; g.add(m);
    m.position.y = PH / 2 - (VB[1] + VB[3] - 212) * U - .01;   // the feet (212 units) on the floor
    var sh = new T.Mesh(new T.CircleGeometry(.38, 32), new T.MeshBasicMaterial({ color: 0x1a140c, transparent: true, opacity: .22, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .004; sh.scale.set(1, .45, 1); g.add(sh);
    g.position.set(x, 0, z); g.visible = false; scene.add(g);
    var p = { name: name, g: g, m: m, mat: mat, from: from, to: to, o: o }; people.push(p); return p;
  }

  // ── the washing: vessels, soap, water on the marble, droplets ─
  var vessels = new T.Group(); vessels.position.set(-1.6, 0, 2.3); scene.add(vessels); vessels.visible = false;
  var glassM = new T.MeshPhysicalMaterial({ color: 0x9fbcc4, roughness: .05, transparent: true, opacity: .34, metalness: .1, clearcoat: 1, envMapIntensity: 1.5, depthWrite: false });
  function jug(x, liquid, hgt, rad, lvl) {
    var g = new T.Group(); g.position.set(x, 0, 0); vessels.add(g);
    var pts = [[0, 0], [rad, 0], [rad + .02, .04], [rad + .02, hgt * .75], [rad * .55, hgt * .92], [rad * .45, hgt], [rad * .5, hgt + .03], [0, hgt + .03]];
    var outer = new T.Mesh(W.lathe(pts, 48), glassM); outer.renderOrder = 3; g.add(outer);
    var collar = new T.Mesh(new T.CylinderGeometry(rad * .55, rad * .55, .035, 32), MT.gold); collar.position.y = hgt + .005; g.add(collar);   // a gold neck ring so the glass reads on the white marble
    var liq = new T.Mesh(new T.CylinderGeometry(rad - .005, rad - .005, 1, 40), new T.MeshStandardMaterial({ color: liquid, roughness: .15 })); liq.position.y = .5; liq.renderOrder = 1; g.add(liq);
    g.userData = { liq: liq, lvl: lvl, h: hgt * .74 }; liq.scale.y = hgt * .74 * lvl; liq.position.y = liq.scale.y / 2 + .01; return g;
  }
  var jZ = jug(-.26, 0x3f86b0, .5, .12, .85), jR = jug(.02, 0xd8577c, .42, .1, .8), jO = jug(.26, 0x6a3208, .26, .065, .7);
  var tray = new T.Mesh(new T.CylinderGeometry(.44, .47, .03, 64), MT.gold); tray.position.y = -.0; vessels.add(tray); [jZ, jR, jO].forEach(function (j) { j.position.y = .03; });
  var bucket = new T.Group(); bucket.position.set(1.4, 0, 2.0); scene.add(bucket); bucket.visible = false;
  bucket.add(new T.Mesh(new T.CylinderGeometry(.26, .2, .38, 40, 1, true), new T.MeshStandardMaterial({ color: 0x9aa3a8, roughness: .25, metalness: .9, side: T.DoubleSide })));
  [.02, .2, .37].forEach(function (y) { var r = new T.Mesh(new T.TorusGeometry(.2 + y * .16, .008, 8, 48), MT.silver); r.rotation.x = Math.PI / 2; r.position.y = y; bucket.add(r); });
  var hdl = new T.Mesh(new T.TorusGeometry(.26, .007, 8, 48, Math.PI), MT.silver); hdl.position.y = .38; hdl.rotation.y = .5; bucket.add(hdl);
  var bsh = new T.Mesh(new T.CircleGeometry(.36, 32), new T.MeshBasicMaterial({ color: 0x1a140c, transparent: true, opacity: .25, depthWrite: false })); bsh.rotation.x = -Math.PI / 2; bsh.position.y = .004; bucket.add(bsh);
  bucket.children[0].position.y = .19;
  var bw = new T.Mesh(new T.CircleGeometry(.24, 40), new T.MeshStandardMaterial({ color: 0x6fa6c2, roughness: .05, metalness: .2, transparent: true, opacity: .9 })); bw.rotation.x = -Math.PI / 2; bw.position.y = .3; bucket.add(bw);
  var soap = new T.Mesh(new T.BoxGeometry(.16, .06, .1), new T.MeshStandardMaterial({ color: 0xe58aa6, roughness: .35 })); soap.position.set(.45, .03, .1); bucket.add(soap);
  var stream = new T.Mesh(new T.CylinderGeometry(.012, .02, 1, 12), new T.MeshStandardMaterial({ color: 0xf6c1cd, transparent: true, opacity: .75, roughness: .05 })); vessels.add(stream); stream.visible = false;
  // puddles that spread on the marble and a few running drops
  var puddleTex = W.tex(256, 256, function (x, w, h) { var g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.7, "rgba(255,255,255,.8)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g;
    x.beginPath(); for (var i = 0; i <= 40; i++) { var a = i / 40 * 6.283, r = w * (.36 + .1 * Math.sin(a * 3) + .05 * Math.sin(a * 7)); x.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } x.fill(); });
  var puddles = [];
  [[-1.0, 1.0, 1.6], [.3, 1.6, 1.2], [-2.2, .2, 1.4], [1.2, .4, 1.0], [-.6, -1.2, 1.5], [2.4, 1.3, 1.1]].forEach(function (q, i) {
    var m = new T.Mesh(new T.PlaneGeometry(q[2], q[2]), new T.MeshStandardMaterial({ color: 0xbcd3dc, alphaMap: puddleTex, transparent: true, opacity: 0, roughness: .02, metalness: .3, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = i; m.position.set(q[0], .006 + i * .0005, q[1]); scene.add(m); puddles.push(m); });
  var drops = new T.Group(); scene.add(drops); var dropM = new T.MeshStandardMaterial({ color: 0xdff0f6, roughness: .05, transparent: true, opacity: .8 });
  for (var d = 0; d < 40; d++) { var dm = new T.Mesh(new T.SphereGeometry(.018, 8, 6), dropM); dm.userData = { x: -1.6 + (d * 37 % 23) / 23 * 2.6, z: .2 + (d * 53 % 17) / 17 * 1.8, ph: (d * 0.137) % 1 }; drops.add(dm); }
  drops.visible = false;

  // ── the key of the Kaaba ─────────────────────────────────
  var key = new T.Group(); scene.add(key); key.visible = false;
  (function () { var km = MT.gold;
    var bow = new T.Mesh(new T.TorusGeometry(.11, .028, 16, 48), km); key.add(bow);
    var inner = new T.Mesh(new T.TorusGeometry(.055, .012, 10, 32), km); key.add(inner);
    var shaft = new T.Mesh(new T.CylinderGeometry(.022, .022, .5, 24), km); shaft.rotation.z = Math.PI / 2; shaft.position.x = .36; key.add(shaft);
    [.17, .2].forEach(function (x) { var r = new T.Mesh(new T.TorusGeometry(.03, .01, 8, 24), km); r.rotation.y = Math.PI / 2; r.position.x = x; key.add(r); });
    var bit1 = new T.Mesh(new T.BoxGeometry(.05, .12, .02), km); bit1.position.set(.56, -.07, 0); key.add(bit1);
    var bit2 = new T.Mesh(new T.BoxGeometry(.03, .08, .02), km); bit2.position.set(.5, -.05, 0); key.add(bit2);
    var tip = new T.Mesh(new T.SphereGeometry(.026, 16, 12), km); tip.position.x = .61; key.add(tip); })();
  var keyLight = new T.PointLight(0xffd58a, 0, 3, 2); scene.add(keyLight);

  // ── incense smoke ────────────────────────────────────────
  var smokeTex = W.tex(128, 128, function (x, w, h) { var g = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  var smoke = []; for (var si = 0; si < 46; si++) { var sp = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false, color: 0xd9d2c4 })); scene.add(sp); smoke.push(sp); }

  // ── Bab al-Tawba: the stair behind it (a lit shaft) ───────
  var shaftTex = W.tex(256, 512, function (x, w, h) { x.fillStyle = "#1c140c"; x.fillRect(0, 0, w, h);
    for (var i = 0; i < 12; i++) { var y = h - i * 44; x.fillStyle = i % 2 ? "#5a4630" : "#6d5539"; x.fillRect(20 + i * 6, y - 40, w - 40 - i * 12, 26); x.fillStyle = "#3b2d1e"; x.fillRect(20 + i * 6, y - 14, w - 40 - i * 12, 14); }
    var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,214,150,.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  var shaft = new T.Mesh(new T.PlaneGeometry(.92, 2.5), new T.MeshBasicMaterial({ map: shaftTex })); shaft.position.set(W.W / 2 - .045, W.SK + 1.27, W.D / 2 - .9); shaft.rotation.y = -Math.PI / 2; scene.add(shaft); shaft.visible = false;

  // ── the marked prayer spot: a soft glow ring ─────────────
  var ringTex = W.tex(256, 256, function (x, w, h) { var g = x.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,210,120,0)"); g.addColorStop(.6, "rgba(255,210,120,.7)"); g.addColorStop(1, "rgba(255,210,120,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  var glow = new T.Mesh(new T.PlaneGeometry(1.8, 1.4), new T.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); glow.rotation.x = -Math.PI / 2; glow.position.set(-1.8, .012, -W.D / 2 + 1.7); scene.add(glow);

  // ── the museum room (far away from the Kaaba room, at x = 60) ─
  var mus = new T.Group(); mus.position.set(60, 0, 0); scene.add(mus);
  (function () {
    var wallM = new T.MeshStandardMaterial({ color: 0xf1ebdc, roughness: .8 }), flM = new T.MeshStandardMaterial({ color: 0xe9e2d2, roughness: .4 });
    var fl = new T.Mesh(new T.PlaneGeometry(10, 10), flM); fl.rotation.x = -Math.PI / 2; mus.add(fl);
    [[0, -4, 0], [-4, 0, Math.PI / 2], [4, 0, -Math.PI / 2]].forEach(function (q) { var wl = new T.Mesh(new T.PlaneGeometry(10, 8), wallM); wl.position.set(q[0], 4, q[1]); wl.rotation.y = q[2]; mus.add(wl); });
    var ce = new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshStandardMaterial({ color: 0xf4f0e6 })); ce.rotation.x = Math.PI / 2; ce.position.y = 7.6; mus.add(ce);
    var oldWood = W.tex(256, 1024, function (x, w, h) { x.fillStyle = "#4a3426"; x.fillRect(0, 0, w, h); W.veins(x, w, h, 81, "#1e140c", 90); W.veins(x, w, h, 82, "#7a5c44", 40);
      for (var i = 0; i < 60; i++) { x.fillStyle = "rgba(20,12,6,.5)"; x.beginPath(); x.ellipse((i * 47) % w, (i * 131) % h, 2 + i % 5, 6 + i % 9, 0, 0, 6.3); x.fill(); } }, 1, 2);
    var woodOld = new T.MeshStandardMaterial({ map: oldWood, roughness: .85 });
    var stoneM = new T.MeshStandardMaterial({ map: W.tex(256, 256, function (x, w, h) { x.fillStyle = "#a89a86"; x.fillRect(0, 0, w, h); W.veins(x, w, h, 91, "#6d6150", 60); }), roughness: .95 });
    var base = new T.Mesh(new T.BoxGeometry(1.0, .55, 1.0), stoneM); base.position.set(0, .275, -1.6); mus.add(base);
    var col = new T.Mesh(new T.CylinderGeometry(.24, .27, 6.2, 40), woodOld); col.position.set(0, .55 + 3.1, -1.6); mus.add(col);
    var capP = [[.24, 0], [.3, .1], [.36, .3], [.44, .5], [.5, .62], [.5, .7], [0, .7]];
    var cap = new T.Mesh(W.lathe(capP, 8), woodOld); cap.position.set(0, .55 + 6.2, -1.6); mus.add(cap);
    var frag = new T.Mesh(new T.CylinderGeometry(.22, .24, 1.1, 24), stoneM); frag.position.set(-1.3, .55 + .55, -2.6); mus.add(frag);
    var fb = new T.Mesh(new T.BoxGeometry(.9, .55, .8), stoneM); fb.position.set(-1.3, .275, -2.6); mus.add(fb);
    // a gold railing round it, posts with balls and a scroll between
    var rg = MT.gold;
    [[-1.6, -.2], [1.6, -.2], [-1.6, 1.0], [1.6, 1.0], [0, 1.0]].forEach(function (q) { var post = new T.Mesh(new T.CylinderGeometry(.03, .035, 1.0, 16), rg); post.position.set(q[0], .5, q[1]); mus.add(post);
      var ball = new T.Mesh(new T.SphereGeometry(.06, 16, 12), rg); ball.position.set(q[0], 1.04, q[1]); mus.add(ball); });
    [[0, 1.0, 3.2, 0], [-1.6, .4, 1.2, Math.PI / 2], [1.6, .4, 1.2, Math.PI / 2]].forEach(function (q) { [.95, .2].forEach(function (y) { var r = new T.Mesh(new T.CylinderGeometry(.018, .018, q[2], 12), rg); r.rotation.z = Math.PI / 2; r.rotation.y = q[3]; r.position.set(q[0], y, q[1]); mus.add(r); }); });
    for (var i = 0; i < 6; i++) { var sc = new T.Mesh(new T.TorusGeometry(.1, .012, 8, 24), rg); sc.position.set(-1.35 + i * .54, .58, 1.0); mus.add(sc); }
    var plate = new T.Mesh(new T.BoxGeometry(.7, .4, .04), new T.MeshStandardMaterial({ color: 0x3a2f26, roughness: .6 })); plate.position.set(.6, .95, 1.15); plate.rotation.x = -.6; mus.add(plate);
    var sp1 = new T.SpotLight(0xfff0d0, 1.4, 14, .5, .6, 1); sp1.position.set(1.5, 7, 1.5); sp1.target.position.set(60, 3, -1.6); scene.add(sp1, sp1.target); sp1.position.x += 60;
    var amb = new T.PointLight(0xfff4e2, .6, 12, 1.5); amb.position.set(61, 5, 2); scene.add(amb);
  })();

  // ── update, every frame ─────────────────────────────────
  var CUE = {};   // filled by shots.js: windows in seconds
  function showPeople(t, cam) {
    people.forEach(function (p) {
      var on = t >= p.from && t <= p.to; p.g.visible = on; if (!on) return;
      var o = p.o, fr = sprites[p.name], k = t - p.from, idx;
      if (o.walk) { var w = o.walk, u = clamp((t - w[4]) / (w[5] - w[4])); p.g.position.set(w[0] + (w[2] - w[0]) * u, 0, w[1] + (w[3] - w[1]) * u); idx = Math.floor(k * (o.rate || 2.2) * fr.length) % fr.length; }
      else idx = Math.floor(k * (o.rate || 1.4) * fr.length / (o.loop || 1)) % fr.length;
      if (o.still) idx = 0;
      p.mat.map = fr[idx].tex;
      // stand as a card turned to the camera (yaw only); dir flips the side view to face where he goes
      var dx = cam.position.x - p.g.position.x, dz = cam.position.z - p.g.position.z; p.g.rotation.y = Math.atan2(dx, dz);
      p.m.scale.x = o.flip ? -1 : 1;
      p.mat.opacity = 1;
    });
  }
  window.PROPS = {
    ready: function () { return Promise.all(pending); }, people: people, person: person, CUE: CUE, sprites: sprites,
    update: function (t, cam) {
      var C = CUE;
      showPeople(t, cam);
      // vessels and bucket
      var vOn = C.vessels && t > C.vessels[0] && t < C.vessels[1]; vessels.visible = !!vOn;
      if (vOn) { var pour = C.pour ? clamp((t - C.pour[0]) / (C.pour[1] - C.pour[0])) : 0;
        jR.rotation.z = pour > 0 && pour < 1 ? -1.1 * Math.sin(pour * Math.PI) : 0; jR.position.set(0 + .25 * Math.sin(pour * Math.PI), .03 + .45 * Math.sin(pour * Math.PI), 0);
        stream.visible = pour > .15 && pour < .85; stream.position.set(-.24, .45, 0); stream.scale.y = .35;
        var lv = .5 + .35 * clamp((pour - .15) / .7); jZ.userData.liq.scale.y = jZ.userData.h * lv; jZ.userData.liq.position.y = jZ.userData.liq.scale.y / 2 + .01;
        jZ.userData.liq.material.color.setHex(pour > .2 ? 0xc77a92 : 0x5f9fc0); }
      bucket.visible = !!((C.bucket && t > C.bucket[0] && t < C.bucket[1]) || (C.bucket2 && t > C.bucket2[0] && t < C.bucket2[1]));
      if (bucket.visible) { soap.position.y = .03 + (C.soapOut && t > C.soapOut ? -.5 * clamp((t - C.soapOut) / .5) : 0); soap.visible = !(C.soapOut && t > C.soapOut + .5); }
      // water on the marble
      var wet = C.wet ? clamp((t - C.wet[0]) / 1.6) * clamp((C.wet[1] - t) / 1.2) : 0;
      puddles.forEach(function (m, i) { m.material.opacity = .55 * clamp(wet * 1.6 - i * .12); });
      drops.visible = !!(C.spray && t > C.spray[0] && t < C.spray[1]);
      if (drops.visible) drops.children.forEach(function (dm) { var u = ((t - C.spray[0]) * .9 + dm.userData.ph) % 1; dm.position.set(dm.userData.x + u * .2, 1.4 - u * u * 1.4 + .02, dm.userData.z); dm.scale.setScalar(1 - u * .4); });
      // key
      var kw = C.key ? win(t, C.key[0], C.key[1], .5) : 0; key.visible = kw > 0;
      if (key.visible) { key.position.set(-3.0, 1.75 + .05 * Math.sin(t * 1.6), 3.4); key.rotation.set(.2, Math.PI + .6 * Math.sin(t * .7), .15); key.scale.setScalar(.6 + .4 * eio(kw)); keyLight.position.set(-3, 2.2, 3.0); keyLight.intensity = 1.2 * kw; } else keyLight.intensity = 0;
      // incense smoke from the censer's lid (the person sprite carries it)
      var cz = C.smoke ? win(t, C.smoke[0], C.smoke[1], .8) : 0, src = C.smokeAt || [0, 1.5, 0];
      smoke.forEach(function (sp, i) { var u = ((t * .22 + i / smoke.length) % 1); sp.visible = cz > 0;
        sp.position.set(src[0] + Math.sin(t * .8 + i) * .12 * u + u * .25, src[1] + u * 2.6, src[2] + Math.cos(t * .6 + i * 1.7) * .15 * u);
        sp.scale.setScalar(.12 + u * .9); sp.material.opacity = cz * .85 * Math.sin(u * Math.PI) * (1 - u * .3); });
      // Bab al-Tawba opens onto the stair
      var op = C.tawba ? eio((t - C.tawba[0]) / 1.6) * (1 - eio((t - C.tawba[1] + 1.2) / 1.2)) : 0;
      W.tawbaLeaf.rotation.y = -op * 1.7; shaft.visible = op > .01;
      // the prayer spot glows
      glow.material.opacity = C.spot ? .85 * win(t, C.spot[0], C.spot[1], .8) * (.8 + .2 * Math.sin(t * 2.4)) : 0;
    }
  };
})();
